import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

export async function POST(req: Request) {
  const url = process.env.DATABASE_URL
  if (!url) return NextResponse.json({ ok: false }, { status: 500 })
  const body = await req.json().catch(() => ({}))
  const id = body?.id
  if (typeof id !== 'number') return NextResponse.json({ ok: false }, { status: 400 })
  const sql = neon(url)
  await sql`UPDATE signups SET deleted_at = NOW() WHERE id = ${id}`
  return NextResponse.json({ ok: true })
}
