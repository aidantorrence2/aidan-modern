import { NextResponse } from 'next/server'
import { sql } from '../../../lib/neon'

// First-party analytics ingest. Accepts batched events from lib/track.ts
// (sent as text/plain so sendBeacon stays on the simple-request path) and
// writes them to Neon `analytics_events`, enriched with Vercel geo headers.

export const dynamic = 'force-dynamic'

const MAX_BODY = 60_000
const MAX_EVENTS = 30
const ISO_TS = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/

let ensured: Promise<unknown> | null = null

function ensureTable(): Promise<unknown> {
  if (!ensured) {
    ensured = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS analytics_events (
          id          BIGSERIAL PRIMARY KEY,
          received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          client_ts   TIMESTAMPTZ,
          page        TEXT NOT NULL,
          event       TEXT NOT NULL,
          session_id  TEXT NOT NULL,
          visitor_id  TEXT,
          seq         INTEGER,
          props       JSONB,
          context     JSONB,
          country     TEXT,
          region      TEXT,
          city        TEXT,
          user_agent  TEXT
        )`
      await sql`CREATE INDEX IF NOT EXISTS analytics_events_session_idx ON analytics_events (session_id, seq)`
      await sql`CREATE INDEX IF NOT EXISTS analytics_events_page_event_idx ON analytics_events (page, event, received_at)`
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

export async function POST(req: Request) {
  try {
    const text = await req.text()
    if (!text || text.length > MAX_BODY) return NextResponse.json({ ok: false }, { status: 413 })
    let body: Record<string, unknown>
    try {
      body = JSON.parse(text)
    } catch {
      return NextResponse.json({ ok: false }, { status: 400 })
    }

    const page = body?.page
    const sid = body?.session_id
    const vid = body?.visitor_id
    const context = body?.context
    const events = body?.events
    if (typeof page !== 'string' || typeof sid !== 'string' || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json({ ok: false }, { status: 400 })
    }

    const clean = events.slice(0, MAX_EVENTS).flatMap((e: unknown) => {
      const ev = e as { event?: unknown; ts?: unknown; seq?: unknown; props?: unknown }
      if (!ev || typeof ev.event !== 'string') return []
      return [{
        event: ev.event.slice(0, 64),
        ts: typeof ev.ts === 'string' && ISO_TS.test(ev.ts) ? ev.ts : null,
        seq: typeof ev.seq === 'number' && Number.isFinite(ev.seq) ? Math.round(ev.seq) : null,
        props: ev.props && typeof ev.props === 'object' ? ev.props : null,
      }]
    })
    if (clean.length === 0) return NextResponse.json({ ok: false }, { status: 400 })

    // Drop (rather than truncate) an oversized context so the jsonb stays valid.
    let ctxJson: string | null = null
    if (context && typeof context === 'object') {
      const s = JSON.stringify(context)
      if (s.length <= 8000) ctxJson = s
    }

    await ensureTable()
    await sql`
      INSERT INTO analytics_events
        (client_ts, page, event, session_id, visitor_id, seq, props, context, country, region, city, user_agent)
      SELECT
        (e->>'ts')::timestamptz,
        ${page.slice(0, 200)},
        e->>'event',
        ${sid.slice(0, 64)},
        ${typeof vid === 'string' ? vid.slice(0, 64) : null},
        (e->>'seq')::int,
        e->'props',
        ${ctxJson}::jsonb,
        ${header(req, 'x-vercel-ip-country')},
        ${header(req, 'x-vercel-ip-country-region')},
        ${header(req, 'x-vercel-ip-city')},
        ${(req.headers.get('user-agent') || '').slice(0, 300)}
      FROM jsonb_array_elements(${JSON.stringify(clean)}::jsonb) AS e
    `
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    console.error('[EVENTS] ingest failed:', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
