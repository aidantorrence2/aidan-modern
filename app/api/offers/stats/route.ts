import { NextResponse } from 'next/server'
import { sql } from '../../../../lib/neon'
import { allOffers } from '../../../../lib/offers'

// Counts per offer for the hourly flywheel run: sign-ups, "I'd pay" clicks and
// pre-order clicks, in the last 72 hours (the decision window) and all time,
// plus page views from analytics_events. Counts only — no emails, no reasons.
// Reasons are exposed separately, trimmed, because they are what buyers said
// and feed the next launch; they carry no contact details.

export const dynamic = 'force-dynamic'

type Row = { offer: string; intent: string; recent: number; total: number }
type ViewRow = { page: string; recent: number; total: number }
type ReasonRow = { offer: string; intent: string; reason: string; received_at: string }

export async function GET(req: Request) {
  const offers = allOffers()
  const empty = Object.fromEntries(offers.map(o => [o.slug, {
    name: o.name, status: o.status, price: o.price, launched: o.launched ?? null,
    views_72h: 0, views_total: 0,
    signup_72h: 0, signup_total: 0, would_pay_72h: 0, would_pay_total: 0, preorder_72h: 0, preorder_total: 0,
  }]))
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ ok: false, error: 'DATABASE_URL not set', offers: empty }, { status: 200 })
  }
  try {
    const rows = (await sql`
      SELECT offer, intent,
             count(*) FILTER (WHERE received_at >= now() - interval '72 hours')::int AS recent,
             count(*)::int AS total
      FROM offer_interest
      GROUP BY offer, intent
    `) as Row[]
    for (const r of rows) {
      const o = empty[r.offer]
      if (!o || !['signup', 'would_pay', 'preorder'].includes(r.intent)) continue
      const rec = o as Record<string, unknown>
      rec[`${r.intent}_72h`] = r.recent
      rec[`${r.intent}_total`] = r.total
    }
    const views = (await sql`
      SELECT page,
             count(*) FILTER (WHERE received_at >= now() - interval '72 hours')::int AS recent,
             count(*)::int AS total
      FROM analytics_events
      WHERE event = 'page_view' AND page LIKE '/offers/%'
        AND (user_agent IS NULL OR user_agent !~* 'bot|crawl|spider|headless|lighthouse|preview')
      GROUP BY page
    `) as ViewRow[]
    for (const v of views) {
      const slug = v.page.replace(/^\/offers\//, '').split(/[/?]/)[0]
      const o = empty[slug]
      if (!o) continue
      o.views_72h = v.recent
      o.views_total = v.total
    }
    const url = new URL(req.url)
    let reasons: ReasonRow[] = []
    if (url.searchParams.get('reasons') === '1') {
      reasons = (await sql`
        SELECT offer, intent, left(reason, 300) AS reason, received_at
        FROM offer_interest
        WHERE reason IS NOT NULL AND reason <> ''
        ORDER BY received_at DESC
        LIMIT 100
      `) as ReasonRow[]
    }
    return NextResponse.json({ ok: true, as_of: new Date().toISOString(), offers: empty, reasons })
  } catch (err) {
    // A missing table just means no interest yet.
    const msg = (err as Error).message || ''
    if (/does not exist/.test(msg)) return NextResponse.json({ ok: true, as_of: new Date().toISOString(), offers: empty, reasons: [] })
    console.error('[OFFERS] stats failed:', err)
    return NextResponse.json({ ok: false, error: 'stats failed' }, { status: 500 })
  }
}
