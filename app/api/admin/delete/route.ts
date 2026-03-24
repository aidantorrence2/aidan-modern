import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return NextResponse.json({ ok: false }, { status: 500 })
  const body = await req.json().catch(() => ({}))
  const id = body?.id
  if (typeof id !== 'number') return NextResponse.json({ ok: false }, { status: 400 })
  const sb = createClient(url, key)
  await sb.from('signups').update({ deleted_at: new Date().toISOString() }).eq('id', id)
  return NextResponse.json({ ok: true })
}
