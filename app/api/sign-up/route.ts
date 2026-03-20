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
  photoUrl: string | null
}) {
  const url = process.env.DATABASE_URL
  if (!url) {
    console.warn('[SIGN-UP] No DATABASE_URL — skipping DB save')
    return
  }
  const sql = neon(url)
  await sql`
    CREATE TABLE IF NOT EXISTS signups (
      id SERIAL PRIMARY KEY,
      city TEXT NOT NULL,
      contact_method TEXT NOT NULL,
      contact TEXT NOT NULL,
      moodboard TEXT[],
      photo_url TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `
  // Insert row first without photo
  const rows = await sql`
    INSERT INTO signups (city, contact_method, contact, moodboard)
    VALUES (${payload.city}, ${payload.contactMethod}, ${payload.contact}, ${payload.moodboard})
    RETURNING id
  `
  // Then update with photo separately if present
  if (payload.photoUrl && rows[0]?.id) {
    try {
      await sql`UPDATE signups SET photo_url = ${payload.photoUrl} WHERE id = ${rows[0].id}`
    } catch (err) {
      console.error('[SIGN-UP] Photo save failed (row saved without photo):', err)
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
    const photo = isString(body?.photo) ? body.photo : null

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
      photoUrl: photo,
      ts: new Date().toISOString()
    }
    console.log('[SIGN-UP]', { ...payload, photoUrl: photo ? '(base64)' : null })

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
                  `*Photo:* ${photo ? 'Yes' : 'No'}`,
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
