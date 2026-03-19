import { NextResponse } from 'next/server'

function isString(x: unknown): x is string {
  return typeof x === 'string'
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const city = body?.city
    const contactMethod = body?.contactMethod
    const contact = body?.contact
    const location = body?.location || null
    const moodboard = Array.isArray(body?.moodboard) ? body.moodboard : null
    const hasPhoto = !!body?.photo

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
      location: isString(location) ? location.trim() : null,
      moodboard,
      hasPhoto,
      ts: new Date().toISOString()
    }
    console.log('[SIGN-UP]', payload)

    const webhookUrl = process.env.SLACK_BOOKING_WEBHOOK
    if (!webhookUrl) {
      console.warn('[SIGN-UP] Missing SLACK_BOOKING_WEBHOOK env; skipping Slack alert')
    } else {
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
                  `*Photo:* ${hasPhoto ? 'Yes' : 'No'}`,
                  ...(payload.location ? [`*Location:* ${payload.location}`] : []),
                  ...(payload.moodboard?.length ? [`*Moodboard:* ${payload.moodboard.join(', ')}`] : [])
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
