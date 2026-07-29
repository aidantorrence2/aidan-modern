import { NextResponse } from 'next/server'
import { sql } from '../../../lib/neon'

// Why people don't sign up, in their own words.
//
// The funnel records where visitors drop, never why — the one thing the numbers
// can't recover. This is the "it's not for me" exit: whoever takes it has
// already decided not to sign up, so the form asks for nothing it doesn't need
// and the Instagram handle is theirs to withhold.
//
// Its own Neon table, created on first write the same way analytics_events is,
// so this needs no migration run by hand. Kept out of Supabase `signups` on
// purpose: these are not leads and must never surface in /admin as one.

export const dynamic = 'force-dynamic'

const MAX_REASON = 4000
const MAX_HANDLE = 100

let ensured: Promise<unknown> | null = null

function ensureTable(): Promise<unknown> {
  if (!ensured) {
    ensured = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS signup_feedback (
          id          BIGSERIAL PRIMARY KEY,
          received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          source      TEXT,
          reason      TEXT NOT NULL,
          instagram   TEXT,
          session_id  TEXT,
          country     TEXT,
          city        TEXT,
          user_agent  TEXT
        )`
      await sql`CREATE INDEX IF NOT EXISTS signup_feedback_received_idx ON signup_feedback (received_at DESC)`
    })().catch(err => {
      ensured = null
      throw err
    })
  }
  return ensured
}

function header(req: Request, name: string): string | null {
  const v = req.headers.get(name)
  if (!v) return null
  try {
    return decodeURIComponent(v).slice(0, 100)
  } catch {
    return v.slice(0, 100)
  }
}

const isString = (x: unknown): x is string => typeof x === 'string'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))

    // Same honeypot as the sign-up form. A bot filling every field gets a
    // cheerful 200 and goes away; nothing is written.
    if (isString(body?.company) && body.company.trim()) {
      console.warn('[FEEDBACK] honeypot triggered')
      return NextResponse.json({ ok: true })
    }

    const reason = isString(body?.reason) ? body.reason.trim().slice(0, MAX_REASON) : ''
    if (!reason) return NextResponse.json({ ok: false, error: 'Nothing to save' }, { status: 400 })

    // Anonymous is the default and the empty string means anonymous — the form
    // clears the field when they switch back, so a handle typed and then
    // withdrawn is not quietly kept.
    const instagram = isString(body?.instagram)
      ? body.instagram.trim().replace(/^@+/, '').slice(0, MAX_HANDLE) || null
      : null
    const source = isString(body?.source) ? body.source.slice(0, 200) : null
    const sessionId = isString(body?.sessionId) ? body.sessionId.slice(0, 64) : null

    await ensureTable()
    await sql`
      INSERT INTO signup_feedback (source, reason, instagram, session_id, country, city, user_agent)
      VALUES (
        ${source},
        ${reason},
        ${instagram},
        ${sessionId},
        ${header(req, 'x-vercel-ip-country')},
        ${header(req, 'x-vercel-ip-city')},
        ${(req.headers.get('user-agent') || '').slice(0, 300)}
      )`

    console.log('[FEEDBACK]', { source, anonymous: !instagram, chars: reason.length })

    // Best-effort ping to the channel the sign-up notifications already use —
    // the row is the record, this is just so it gets read. A row saved and a
    // Slack post that failed is still a success from here.
    const webhookUrl = process.env.SLACK_BOOKING_WEBHOOK
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: 'Someone said the shoot is not for them',
            blocks: [{
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: [
                  '*"It\'s not for me" feedback*',
                  `*From:* ${instagram ? `@${instagram}` : 'Anonymous'}`,
                  ...(source ? [`*Page:* ${source}`] : []),
                  '',
                  `> ${reason.replace(/\n/g, '\n> ')}`,
                ].join('\n'),
              },
            }],
          }),
        })
      } catch (err) {
        console.error('[FEEDBACK] Failed to notify Slack', err)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[FEEDBACK] save failed:', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
