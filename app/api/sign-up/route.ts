import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

function isString(x: unknown): x is string {
  return typeof x === 'string'
}

async function saveToDb(payload: {
  city: string
  contactMethod: string
  contact: string
  moodboard: string[] | null
  photos: string[] | null
}) {
  const url = process.env.DATABASE_URL
  if (!url) {
    console.warn('[SIGN-UP] No DATABASE_URL — skipping DB save')
    return
  }
  const sql = neon(url)
  // Insert row without photos first
  const rows = await sql`
    INSERT INTO signups (city, contact_method, contact, moodboard)
    VALUES (${payload.city}, ${payload.contactMethod}, ${payload.contact}, ${payload.moodboard})
    RETURNING id
  `
  const id = rows[0]?.id
  if (!id) return

  // Save photos one at a time to avoid HTTP size limit
  if (payload.photos && payload.photos.length > 0) {
    // Also set photo_url to first photo for backwards compat
    try {
      await sql`UPDATE signups SET photo_url = ${payload.photos[0]} WHERE id = ${id}`
    } catch (err) {
      console.error('[SIGN-UP] photo_url save failed:', err)
    }
    // Save each photo into the photos array column one at a time
    for (const photo of payload.photos) {
      try {
        await sql`UPDATE signups SET photos = array_append(photos, ${photo}) WHERE id = ${id}`
      } catch (err) {
        console.error('[SIGN-UP] Photo array append failed:', err)
      }
    }
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const city = body?.city
    const contactMethod = body?.contactMethod
    const contact = body?.contact
    const moodboard = Array.isArray(body?.moodboard) ? body.moodboard : null
    // Support both old single photo and new multi photos
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

    const payload = {
      city: city.trim(),
      contactMethod,
      contact: contact.trim(),
      moodboard,
      photos,
      ts: new Date().toISOString()
    }
    console.log('[SIGN-UP]', { ...payload, photos: photos ? `${photos.length} photo(s)` : null })

    try {
      await saveToDb(payload)
    } catch (err) {
      console.error('[SIGN-UP] DB save failed:', err)
      return NextResponse.json({ ok: false, error: 'Failed to save' }, { status: 500 })
    }

    // Slack notification
    const webhookUrl = process.env.SLACK_BOOKING_WEBHOOK
    if (webhookUrl) {
      try {
        const contactLabel = contactMethod === 'whatsapp' ? 'WhatsApp' : 'Instagram'
        const slackBody = {
          text: `New sign-up from ${payload.contact}`,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: [
                  '*New photo shoot sign-up*',
                  `*City:* ${payload.city}`,
                  `*${contactLabel}:* ${payload.contact}`,
                  `*Photos:* ${photos ? photos.length : 0}`,
                  ...(moodboard?.length ? [`*Moodboard:* ${moodboard.join(', ')}`] : [])
                ].join('\n')
              }
            },
            {
              type: 'context',
              elements: [
                {
                  type: 'mrkdwn',
                  text: `Received ${new Date(payload.ts).toLocaleString('en-US', { timeZone: 'UTC' })} UTC`
                }
              ]
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
