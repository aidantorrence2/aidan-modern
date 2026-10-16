import { NextResponse } from 'next/server'
import { sql } from '../../../../lib/neon'
import { getOffer } from '../../../../lib/offers'

// Interest signals for hosted offer pages (the money flywheel). Three intents:
//   signup    — left an email for early access
//   would_pay — clicked "I'd pay $X" (with or without an email)
//   preorder  — clicked through to a real payment link (recorded before redirect)
// Rows live in their own Neon table, created on first write like
// analytics_events. Counts are read back by /api/offers/stats; emails never
// leave the database except through the Slack alert to Aidan.

export const dynamic = 'force-dynamic'

const INTENTS = new Set(['signup', 'would_pay', 'preorder'])
const MAX_REASON = 1000
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

let ensured: Promise<unknown> | null = null

function ensureTable(): Promise<unknown> {
  if (!ensured) {
    ensured = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS offer_interest (
          id          BIGSERIAL PRIMARY KEY,
          received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          offer       TEXT NOT NULL,
          intent      TEXT NOT NULL,
          email       TEXT,
          reason      TEXT,
          price_usd   INTEGER,
          src         TEXT,
          utm         JSONB,
          referrer    TEXT,
          session_id  TEXT,
          visitor_id  TEXT,
          country     TEXT,
          city        TEXT,
          user_agent  TEXT
        )`
      await sql`CREATE INDEX IF NOT EXISTS offer_interest_offer_idx ON offer_interest (offer, intent, received_at DESC)`
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

    // Honeypot: bots fill every field; they get a 200 and nothing is written.
    if (isString(body?.company) && body.company.trim()) return NextResponse.json({ ok: true })

    const slug = isString(body?.offer) ? body.offer.trim().slice(0, 64) : ''
    const offer = getOffer(slug)
    const intent = isString(body?.intent) && INTENTS.has(body.intent) ? body.intent : ''
    if (!offer || !intent) return NextResponse.json({ ok: false, error: 'Invalid input' }, { status: 400 })

    const email = isString(body?.email) ? body.email.trim().toLowerCase().slice(0, 160) : ''
    if (email && !EMAIL_RE.test(email)) return NextResponse.json({ ok: false, error: 'Check the email address' }, { status: 400 })
    if (intent === 'signup' && !email) return NextResponse.json({ ok: false, error: 'Email is needed for early access' }, { status: 400 })

    const reason = isString(body?.reason) ? body.reason.trim().slice(0, MAX_REASON) || null : null
    const src = isString(body?.src) ? body.src.trim().slice(0, 100) || null : null
    const referrer = isString(body?.referrer) ? body.referrer.slice(0, 300) : null
    const sessionId = isString(body?.sessionId) ? body.sessionId.slice(0, 64) : null
    const visitorId = isString(body?.visitorId) ? body.visitorId.slice(0, 64) : null
    let utm: string | null = null
    if (body?.utm && typeof body.utm === 'object') {
      const s = JSON.stringify(body.utm)
      if (s.length <= 2000) utm = s
    }

    await ensureTable()
    await sql`
      INSERT INTO offer_interest
        (offer, intent, email, reason, price_usd, src, utm, referrer, session_id, visitor_id, country, city, user_agent)
      VALUES
        (${offer.slug}, ${intent}, ${email || null}, ${reason}, ${offer.priceUsd}, ${src}, ${utm}::jsonb, ${referrer},
         ${sessionId}, ${visitorId}, ${header(req, 'x-vercel-ip-country')}, ${header(req, 'x-vercel-ip-city')},
         ${(req.headers.get('user-agent') || '').slice(0, 300)})
    `

    const webhookUrl = process.env.SLACK_BOOKING_WEBHOOK
    if (webhookUrl) {
      const label = intent === 'signup' ? 'Sign-up' : intent === 'would_pay' ? `"I'd pay ${offer.price}" click` : 'Pre-order click'
      const lines = [
        `*Offer interest: ${offer.name}*`,
        `*Signal:* ${label}`,
        ...(email ? [`*Email:* ${email}`] : []),
        ...(reason ? [`*Would buy if:* ${reason}`] : []),
        ...(src ? [`*Source:* ${src}`] : []),
        `*Page:* https://www.aidantorrence.com/offers/${offer.slug}`,
      ]
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: `${label} on ${offer.name}`, blocks: [{ type: 'section', text: { type: 'mrkdwn', text: lines.join('\n') } }] }),
      }).catch(err => console.error('[OFFERS] Slack notify failed:', err))
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[OFFERS] interest write failed:', err)
    return NextResponse.json({ ok: false, error: 'Could not save. Try again.' }, { status: 500 })
  }
}
