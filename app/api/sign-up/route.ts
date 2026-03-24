import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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
  const sb = getSupabase()
  // Strip data URL prefix
  const match = base64.match(/^data:image\/(\w+);base64,(.+)$/)
  if (!match) return null
  const ext = match[1] === 'jpeg' ? 'jpg' : match[1]
  const buffer = Buffer.from(match[2], 'base64')
  const filePath = `signups/${signupId}/${index}.${ext}`

  const { error } = await sb.storage.from('photos').upload(filePath, buffer, {
    contentType: `image/${match[1]}`,
    upsert: true
  })
  if (error) {
    console.error('[SIGN-UP] Photo upload failed:', error)
    return null
  }
  const { data } = sb.storage.from('photos').getPublicUrl(filePath)
  return data.publicUrl
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

    console.log('[SIGN-UP]', { city, contactMethod, contact, moodboard, photos: photos ? `${photos.length} photo(s)` : null })

    const sb = getSupabase()

    // Insert row
    const { data: row, error: insertErr } = await sb
      .from('signups')
      .insert({
        city: city.trim(),
        contact_method: contactMethod,
        contact: contact.trim(),
        moodboard
      })
      .select('id')
      .single()

    if (insertErr || !row) {
      console.error('[SIGN-UP] DB insert failed:', insertErr)
      return NextResponse.json({ ok: false, error: 'Failed to save' }, { status: 500 })
    }

    // Upload photos to storage
    if (photos && photos.length > 0) {
      const urls: string[] = []
      for (let i = 0; i < photos.length; i++) {
        const url = await uploadPhoto(photos[i], row.id, i)
        if (url) urls.push(url)
      }
      if (urls.length > 0) {
        await sb.from('signups').update({ photo_urls: urls }).eq('id', row.id)
      }
    }

    // Slack notification
    const webhookUrl = process.env.SLACK_BOOKING_WEBHOOK
    if (webhookUrl) {
      try {
        const contactLabel = contactMethod === 'whatsapp' ? 'WhatsApp' : 'Instagram'
        const slackBody = {
          text: `New sign-up from ${contact}`,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: [
                  '*New photo shoot sign-up*',
                  `*City:* ${city.trim()}`,
                  `*${contactLabel}:* ${contact.trim()}`,
                  `*Photos:* ${photos ? photos.length : 0}`,
                  ...(moodboard?.length ? [`*Moodboard:* ${moodboard.join(', ')}`] : [])
                ].join('\n')
              }
            }
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

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
