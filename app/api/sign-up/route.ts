import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { v2 as cloudinary } from 'cloudinary'

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

    console.log('[SIGN-UP]', { city, contactMethod, contact, moodboard, photos: photos ? `${photos.length} photo(s)` : null })

    const sb = getSupabase()

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

    // WhatsApp notification via Twilio (native media attachments)
    const twSid = process.env.TWILIO_ACCOUNT_SID
    const twToken = process.env.TWILIO_AUTH_TOKEN
    const twFrom = process.env.TWILIO_WHATSAPP_FROM
    const twTo = process.env.TWILIO_WHATSAPP_TO
    if (twSid && twToken && twFrom && twTo) {
      try {
        const contactLabel = contactMethod === 'whatsapp' ? 'WhatsApp' : 'Instagram'
        const summary = [
          'New photo shoot sign-up',
          `City: ${city.trim()}`,
          `${contactLabel}: ${contact.trim()}`,
          `Photos: ${photoUrls.length}`,
          ...(moodboard?.length ? [`Moodboard: ${moodboard.join(', ')}`] : [])
        ].join('\n')
        const auth = 'Basic ' + Buffer.from(`${twSid}:${twToken}`).toString('base64')
        const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${twSid}/Messages.json`
        const sendTwilio = async (body: string, mediaUrls: string[]) => {
          const form = new URLSearchParams()
          form.set('From', twFrom)
          form.set('To', twTo)
          if (body) form.set('Body', body)
          for (const u of mediaUrls) form.append('MediaUrl', u)
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { Authorization: auth, 'Content-Type': 'application/x-www-form-urlencoded' },
            body: form.toString()
          })
          if (!res.ok) {
            console.error('[SIGN-UP] Twilio response', res.status, (await res.text().catch(() => '')).slice(0, 400))
          }
        }
        // Twilio caps at 10 MediaUrls per message — chunk if needed.
        if (photoUrls.length === 0) {
          await sendTwilio(summary, [])
        } else {
          const chunks: string[][] = []
          for (let i = 0; i < photoUrls.length; i += 10) chunks.push(photoUrls.slice(i, i + 10))
          for (let i = 0; i < chunks.length; i++) {
            const body = i === 0 ? summary : `(continued ${i + 1}/${chunks.length})`
            await sendTwilio(body, chunks[i])
          }
        }
      } catch (err) {
        console.error('[SIGN-UP] Failed to notify WhatsApp via Twilio', err)
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
