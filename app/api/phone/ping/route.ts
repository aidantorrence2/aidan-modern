import { NextResponse } from 'next/server'
import { checkKey, keyFrom, normApp, recordEvent } from '@/lib/phoneTracker'

// Called by the phone automation. GET so a Shortcut can hit it with a plain URL:
//   /api/phone/ping?k=KEY&app=Instagram            (toggles open/close)
//   /api/phone/ping?k=KEY&app=Instagram&action=open
// POST with the same fields as JSON also works.

export const dynamic = 'force-dynamic'

async function handle(req: Request, fields: Record<string, unknown>) {
  if (!process.env.DATABASE_URL) return NextResponse.json({ ok: false, error: 'Missing database configuration' }, { status: 500 })
  const key = (typeof fields.k === 'string' && fields.k) || keyFrom(req)
  const auth = await checkKey(key)
  if (auth === 'bad') return NextResponse.json({ ok: false, error: 'Bad key' }, { status: 401 })
  const app = normApp(fields.app)
  if (!app) return NextResponse.json({ ok: false, error: 'app is required' }, { status: 400 })
  const a = typeof fields.action === 'string' ? fields.action.toLowerCase() : 'toggle'
  const action = a === 'open' || a === 'close' ? a : 'toggle'
  const note = typeof fields.note === 'string' ? fields.note.slice(0, 200) : null
  const source = typeof fields.source === 'string' ? fields.source.slice(0, 40) : 'shortcut'
  try {
    const r = await recordEvent({ app, action, source, note })
    return NextResponse.json({ ok: true, app, action: r.action, ts: r.ts, claimedKey: auth === 'claimed' })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Failed to record' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  const p = new URL(req.url).searchParams
  return handle(req, Object.fromEntries(p.entries()))
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const p = new URL(req.url).searchParams
  return handle(req, { ...Object.fromEntries(p.entries()), ...(body && typeof body === 'object' ? body : {}) })
}
