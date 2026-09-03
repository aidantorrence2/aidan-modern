import { NextResponse } from 'next/server'
import { checkKey, ensureTables, keyFrom } from '@/lib/phoneTracker'
import { sql } from '@/lib/neon'

// The hourly coach posts its critique here; the dashboard shows the latest.
export const dynamic = 'force-dynamic'

const STATUSES = new Set(['ready', 'not_enough_info', 'unreachable'])

export async function POST(req: Request) {
  if (!process.env.DATABASE_URL) return NextResponse.json({ ok: false, error: 'Missing database configuration' }, { status: 500 })
  const auth = await checkKey(keyFrom(req))
  if (auth === 'bad') return NextResponse.json({ ok: false, error: 'Bad key' }, { status: 401 })
  const b = await req.json().catch(() => null)
  if (!b || typeof b !== 'object') return NextResponse.json({ ok: false, error: 'JSON body required' }, { status: 400 })
  const status = STATUSES.has(b.status) ? b.status : 'ready'
  const headline = typeof b.headline === 'string' ? b.headline.trim().slice(0, 200) : ''
  const body = typeof b.body === 'string' ? b.body.trim().slice(0, 4000) : ''
  if (!headline) return NextResponse.json({ ok: false, error: 'headline is required' }, { status: 400 })
  const score = typeof b.score === 'number' && Number.isFinite(b.score) ? Math.max(1, Math.min(10, Math.round(b.score))) : null
  const stats = b.stats && typeof b.stats === 'object' ? JSON.stringify(b.stats) : null
  try {
    await ensureTables()
    const rows = await sql`
      INSERT INTO phone_reviews (status, headline, body, score, stats)
      VALUES (${status}, ${headline}, ${body}, ${score}, ${stats}::jsonb)
      RETURNING id, at`
    return NextResponse.json({ ok: true, id: rows[0].id, at: new Date(rows[0].at).toISOString() })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Failed to save review' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  if (!process.env.DATABASE_URL) return NextResponse.json({ ok: false, error: 'Missing database configuration' }, { status: 500 })
  const auth = await checkKey(keyFrom(req))
  if (auth === 'bad') return NextResponse.json({ ok: false, error: 'Bad key' }, { status: 401 })
  await ensureTables()
  const rows = await sql`SELECT id, at, status, headline, body, score, stats FROM phone_reviews ORDER BY at DESC LIMIT 48`
  return NextResponse.json({ ok: true, reviews: rows })
}
