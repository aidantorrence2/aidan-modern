import { NextResponse } from 'next/server'
import { checkKey, getPrefs, keyFrom, savePrefs } from '@/lib/phoneTracker'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  if (!process.env.DATABASE_URL) return NextResponse.json({ ok: false, error: 'Missing database configuration' }, { status: 500 })
  const auth = await checkKey(keyFrom(req))
  if (auth === 'bad') return NextResponse.json({ ok: false, error: 'Bad key' }, { status: 401 })
  return NextResponse.json({ ok: true, prefs: await getPrefs() })
}

export async function POST(req: Request) {
  if (!process.env.DATABASE_URL) return NextResponse.json({ ok: false, error: 'Missing database configuration' }, { status: 500 })
  const auth = await checkKey(keyFrom(req))
  if (auth === 'bad') return NextResponse.json({ ok: false, error: 'Bad key' }, { status: 401 })
  const b = await req.json().catch(() => null)
  if (!b || typeof b !== 'object') return NextResponse.json({ ok: false, error: 'JSON body required' }, { status: 400 })
  try {
    return NextResponse.json({ ok: true, prefs: await savePrefs(b) })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Failed to save' }, { status: 500 })
  }
}
