import { NextResponse } from 'next/server'
import { Resend } from 'resend'

function isString(x: unknown): x is string {
  return typeof x === 'string' && x.trim().length > 0
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const name = body?.name
    const email = body?.email
    const instagram = body?.instagram
    const message = body?.message

    if (!isString(name) || !isString(email)) {
      return NextResponse.json({ ok: false, error: 'Name and email are required' }, { status: 400 })
    }

    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.error('[INQUIRY] Missing RESEND_API_KEY env variable')
      return NextResponse.json({ ok: false, error: 'Email service not configured' }, { status: 500 })
    }

    const resend = new Resend(apiKey)

    const ts = new Date().toLocaleString('en-US', { timeZone: 'UTC' })

    await resend.emails.send({
      from: 'Inquiry Form <onboarding@resend.dev>',
      to: 'aidan.torrence@gmail.com',
      subject: `New Inquiry from ${name.trim()}`,
      html: `
        <h2>New Inquiry</h2>
        <p><strong>Name:</strong> ${name.trim()}</p>
        <p><strong>Email:</strong> ${email.trim()}</p>
        ${isString(instagram) ? `<p><strong>Instagram:</strong> ${instagram.trim()}</p>` : ''}
        ${isString(message) ? `<p><strong>Message:</strong> ${message.trim()}</p>` : ''}
        <hr />
        <p style="color: #999; font-size: 12px;">Received ${ts} UTC</p>
      `,
    })

    console.log('[INQUIRY]', { name: name.trim(), email: email.trim(), ts })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[INQUIRY] Failed to send email', err)
    return NextResponse.json({ ok: false, error: 'Failed to send' }, { status: 500 })
  }
}
