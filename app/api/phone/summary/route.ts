import { NextResponse } from 'next/server'
import { buildSummary, checkKey, keyFrom } from '@/lib/phoneTracker'

// Read by the dashboard (/phone) and by the hourly coach.
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  if (!process.env.DATABASE_URL) return NextResponse.json({ ok: false, error: 'Missing database configuration' }, { status: 500 })
  const auth = await checkKey(keyFrom(req))
  if (auth === 'bad') return NextResponse.json({ ok: false, error: 'Bad key' }, { status: 401 })
  try {
    const summary = await buildSummary()
    return NextResponse.json({ ok: true, ...summary })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Failed to build summary' }, { status: 500 })
  }
}
