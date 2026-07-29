import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { v2 as cloudinary } from 'cloudinary'
import { normalizeWhatsappServer, locationFromSignup } from '../../../lib/whatsapp-server'
import { stampUpdated } from '../../../lib/signupActivity'

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

/** Postgres 42703 — undefined_column, for a table without `updated_at`. */
function isMissingUpdatedAt(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false
  return error.code === '42703' || /updated_at/.test(error.message ?? '')
}

// The stamp that /admin sorts on lives in `moodboard` (see lib/signupActivity),
// so an enrich needs no schema this table doesn't have. An `updated_at` column
// is written too when one exists — it's the better home, and this way adding it
// is all it takes to switch over. The miss is remembered so a table without the
// column pays for the discovery once rather than on every enrich, and it
// expires so the column is picked up soon after it appears.
const MISSING_TTL = 5 * 60 * 1000
let updatedAtMissingSince = 0

async function updateSignup(
  sb: ReturnType<typeof getSupabase>,
  id: number,
  update: Record<string, unknown>
) {
  const skipColumn = updatedAtMissingSince > 0 && Date.now() - updatedAtMissingSince < MISSING_TTL
  if (skipColumn) return sb.from('signups').update(update).eq('id', id)

  const { error } = await sb
    .from('signups')
    .update({ ...update, updated_at: new Date().toISOString() })
    .eq('id', id)

  // A row's details are worth more than its timestamp: if the column isn't
  // there the write is retried without it rather than dropped.
  if (error && isMissingUpdatedAt(error)) {
    console.warn('[SIGN-UP] signups.updated_at not found — moodboard stamp only')
    updatedAtMissingSince = Date.now()
    return sb.from('signups').update(update).eq('id', id)
  }
  return { error }
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
      !['whatsapp', 'line', 'instagram'].includes(contactMethod)
    ) {
      return NextResponse.json({ ok: false, error: 'Invalid input' }, { status: 400 })
    }

    // Normalize phone-based contacts (WhatsApp, LINE) to E.164 at write time:
    // infer the country code from the user's location (moodboard "Location:" →
    // gazetteer → DeepSeek). Never blocks the signup — falls back to the
    // entered value on any failure.
    // A LINE row can arrive without a number at all — the visitor tapped the
    // add-friend link and the handle (or a placeholder) is the contact. Running
    // that through the phone normalizer would turn it into a bare dial code, so
    // anything without a plausible number of digits is stored verbatim.
    const looksLikePhone = (contact.match(/\d/g) ?? []).length >= 7

    let storedContact = contact.trim()
    if (looksLikePhone && (contactMethod === 'whatsapp' || contactMethod === 'line')) {
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

    const insert = (method: string, moodboardValue: string[] | null) => sb
      .from('signups')
      .insert({
        city: city.trim(),
        contact_method: method,
        contact: storedContact,
        moodboard: moodboardValue
      })
      .select('id')
      .single()

    let { data: row, error: insertErr } = await insert(contactMethod, storedMoodboard)

    // `contact_method` has only ever held 'whatsapp'/'instagram'. If a newer
    // channel is rejected by the column (legacy CHECK constraint / enum), fall
    // back to 'whatsapp' and record the real channel in the moodboard — a lead
    // is never worth losing to a schema that hasn't caught up.
    if (insertErr && contactMethod === 'line') {
      console.error('[SIGN-UP] insert with contact_method=line failed, retrying as whatsapp:', insertErr)
      ;({ data: row, error: insertErr } = await insert('whatsapp', [...(storedMoodboard ?? []), 'Channel: LINE']))
    }

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
        // Stamped at capture time too, though it reads as "no edit" either way
        // — it's within a second of created_at. It marks the row as needing no
        // Cloudinary lookup from the /admin backfill, which only knows a row is
        // done by the presence of a stamp.
        await updateSignup(sb, row.id, {
          photo_urls: photoUrls,
          moodboard: stampUpdated(storedMoodboard, new Date().toISOString()),
        })
      }
    }

    // Slack notification
    const webhookUrl = process.env.SLACK_BOOKING_WEBHOOK
    if (webhookUrl) {
      try {
        const contactLabel = contactMethod === 'whatsapp' ? 'WhatsApp'
          : contactMethod === 'line' ? 'LINE'
          : 'Instagram'
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
    // Stamp last, over whichever moodboard is about to be written — the one
    // the visitor just sent, or the stored one when this enrich changed
    // something else. Only for an enrich that actually carries a change, so a
    // no-op PATCH can't float a row up the list on its own.
    if (Object.keys(update).length > 0) {
      const base = (update.moodboard as string[] | undefined)
        ?? (Array.isArray(row.moodboard) ? row.moodboard : [])
      update.moodboard = stampUpdated(base, new Date().toISOString())
    }
    if (Object.keys(update).length > 0) {
      const { error: updateErr } = await updateSignup(sb, id, update)
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
                  `*Contact:* ${contact.trim()}`,
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
