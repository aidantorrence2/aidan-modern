import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

export const dynamic = 'force-dynamic'

export async function GET() {
  const url = process.env.DATABASE_URL
  if (!url) return NextResponse.json([])
  const sql = neon(url)
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS signups (
        id SERIAL PRIMARY KEY,
        city TEXT NOT NULL,
        contact_method TEXT NOT NULL,
        contact TEXT NOT NULL,
        moodboard TEXT[],
        photo_url TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `
    const rows = await sql`SELECT id, city, contact_method, contact, moodboard, created_at FROM signups ORDER BY created_at DESC`
    return NextResponse.json(rows)
  } catch (e) {
    console.error('[ADMIN] Failed to fetch signups:', e)
    return NextResponse.json([])
  }
}
