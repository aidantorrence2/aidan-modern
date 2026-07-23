import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { v2 as cloudinary } from 'cloudinary'
import { normalizeWhatsappServer, locationFromSignup } from '../../../lib/whatsapp-server'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

function isString(x: unknown): x is string {
  return typeof x === 'string'
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function uploadPhoto(base64: string, signupId: number, index: number): Promise<string | null> {
  try {
    const result = await cloudinary.uploader.upload(base64, {
      folder: `signups/${signupId}`,
      resource_type: 'image'
    })
    return result.secure_url
  } catch (err) {
    console.error(`[SIGN-UP] Cloudinary upload failed (${index}):`, err)
    return null
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const city = body?.city
    const contactMethod = body?.contactMethod
    const contact = body?.contact
    const moodboard = Array.isArray(body?.moodboard) ? body.moodboard : null
    const photos: string[] | null = Array.isArray(body?.photos) ? body.photos.filter(isString) :
      isString(body?.photo) ? [body.photo] : null

    if (
      !isString(city) ||
      !isString(contactMethod) ||
      !isString(contact) ||
      !['whatsapp', 'instagram'].includes(contactMethod)
    ) {
      return NextResponse.json({ ok: false, error: 'Invalid input' }, { status: 400 })
    }

    // Normalize WhatsApp numbers to E.164 at write time: infer the country code
    // from the user's location (moodboard "Location:" → gazetteer → DeepSeek).
    // Never blocks the signup — falls back to the entered value on any failure.
    let storedContact = contact.trim()
    if (contactMethod === 'whatsapp') {
      try {
        storedContact = await normalizeWhatsappServer(contact.trim(), locationFromSignup(city, moodboard))
      } catch (err) {
        console.error('[SIGN-UP] WhatsApp normalize failed, storing raw:', err)
      }
    }

    // Whenever normalization changed the number, keep exactly what the visitor
    // typed on the row (moodboard entry, same pattern as "Location:") so the
    // original is never lost to a bad inference.
    const storedMoodboard = storedContact !== contact.trim()
      ? [...(moodboard ?? []), `Raw contact: ${contact.trim()}`]
      : moodboard

    console.log('[SIGN-UP]', { city, contactMethod, contact: storedContact, raw: contact.trim(), moodboard: storedMoodboard, photos: photos ? `${photos.length} photo(s)` : null })

    const sb = getSupabase()

    const { data: row, error: insertErr } = await sb
      .from('signups')
      .insert({
        city: city.trim(),
        contact_method: contactMethod,
        contact: storedContact,
        moodboard: storedMoodboard
      })
      .select('id')
      .single()

    if (insertErr || !row) {
      console.error('[SIGN-UP] DB insert failed:', insertErr)
      return NextResponse.json({ ok: false, error: 'Failed to save' }, { status: 500 })
    }

    // Upload photos to Cloudinary
    const photoUrls: string[] = []
    if (photos && photos.length > 0) {
      for (let i = 0; i < photos.length; i++) {
        const url = await uploadPhoto(photos[i], row.id, i)
        if (url) photoUrls.push(url)
      }
      if (photoUrls.length > 0) {
        await sb.from('signups').update({ photo_urls: photoUrls }).eq('id', row.id)
      }
    }

    // Slack notification
    const webhookUrl = process.env.SLACK_BOOKING_WEBHOOK
    if (webhookUrl) {
      try {
        const contactLabel = contactMethod === 'whatsapp' ? 'WhatsApp' : 'Instagram'
        const slackBody = {
          text: `New sign-up from ${storedContact}`,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: [
                  '*New photo shoot sign-up*',
                  `*City:* ${city.trim()}`,
                  `*${contactLabel}:* ${storedContact}`,
                  `*Photos:* ${photoUrls.length}`,
                  ...(moodboard?.length ? [`*Moodboard:* ${moodboard.join(', ')}`] : []),
                  ...(photoUrls.length ? [`*Links:* ${photoUrls.map((u, i) => `<${u}|${i + 1}>`).join('  ')}`] : [])
                ].join('\n')
              }
            },
            // Inline photo previews (Slack caps at ~50 blocks; we'll never exceed that)
            ...photoUrls.map(url => ({
              type: 'image',
              image_url: url,
              alt_text: 'sign-up photo'
            }))
          ]
        }
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(slackBody)
        })
      } catch (err) {
        console.error('[SIGN-UP] Failed to notify Slack', err)
      }
    }

    // id + stored contact let the capture-first flow enrich this row later
    // (PATCH below); the pair acts as an unguessable-enough claim check.
    return NextResponse.json({ ok: true, id: row.id, contact: storedContact })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

// Enrich an existing sign-up with the optional details collected after the
// lead is captured (location, concept, photos, IG). Requires the exact
// (id, contact) pair returned by POST so rows can't be modified by id-guessing.
export async function PATCH(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const id = body?.id
    const contact = body?.contact
    if (typeof id !== 'number' || !isString(contact) || !contact.trim()) {
      return NextResponse.json({ ok: false, error: 'Invalid input' }, { status: 400 })
    }
    const city = isString(body?.city) ? body.city.trim() : ''
    const moodboard: string[] | null = Array.isArray(body?.moodboard) ? body.moodboard.filter(isString) : null
    const photos: string[] = Array.isArray(body?.photos) ? body.photos.filter(isString) : []

    const sb = getSupabase()
    const { data: row, error: fetchErr } = await sb
      .from('signups')
      .select('id, contact, photo_urls, moodboard')
      .eq('id', id)
      .single()
    if (fetchErr || !row || row.contact !== contact.trim()) {
      return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 })
    }

    const photoUrls: string[] = []
    for (let i = 0; i < photos.length; i++) {
      const url = await uploadPhoto(photos[i], id, i)
      if (url) photoUrls.push(url)
    }

    const update: Record<string, unknown> = {}
    if (city) update.city = city
    if (moodboard && moodboard.length > 0) {
      // The enrich step replaces the moodboard wholesale; carry over the
      // "Raw contact:" entry written at capture time so it survives.
      const existingMood: string[] = Array.isArray(row.moodboard) ? row.moodboard : []
      const rawEntry = existingMood.find(m => /^raw contact:/i.test(m))
      update.moodboard = rawEntry && !moodboard.some(m => /^raw contact:/i.test(m))
        ? [...moodboard, rawEntry]
        : moodboard
    }
    if (photoUrls.length > 0) {
      const existing = Array.isArray(row.photo_urls) ? row.photo_urls : []
      update.photo_urls = [...existing, ...photoUrls]
    }
    if (Object.keys(update).length > 0) {
      const { error: updateErr } = await sb.from('signups').update(update).eq('id', id)
      if (updateErr) {
        console.error('[SIGN-UP] PATCH update failed:', updateErr)
        return NextResponse.json({ ok: false, error: 'Failed to save' }, { status: 500 })
      }
    }

    console.log('[SIGN-UP] PATCH', { id, city, moodboard, photos: `${photoUrls.length} photo(s)` })

    const webhookUrl = process.env.SLACK_BOOKING_WEBHOOK
    if (webhookUrl) {
      try {
        const slackBody = {
          text: `Sign-up ${contact.trim()} completed their profile`,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: [
                  `*Sign-up completed their profile* (#${id})`,
                  `*WhatsApp:* ${contact.trim()}`,
                  ...(city ? [`*City:* ${city}`] : []),
                  ...(moodboard?.length ? [`*Moodboard:* ${moodboard.join(', ')}`] : []),
                  `*Photos added:* ${photoUrls.length}`,
                  ...(photoUrls.length ? [`*Links:* ${photoUrls.map((u, i) => `<${u}|${i + 1}>`).join('  ')}`] : [])
                ].join('\n')
              }
            },
            ...photoUrls.map(url => ({
              type: 'image',
              image_url: url,
              alt_text: 'sign-up photo'
            }))
          ]
        }
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(slackBody)
        })
      } catch (err) {
        console.error('[SIGN-UP] Failed to notify Slack (PATCH)', err)
      }
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
