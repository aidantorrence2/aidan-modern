import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

export const dynamic = 'force-dynamic'

export async function GET() {
  const url = process.env.DATABASE_URL
  if (!url) return NextResponse.json([])
  const sql = neon(url)
  try {
    const rows = await sql`SELECT id, city, contact_method, contact, moodboard, photo_url, photos, created_at FROM signups WHERE deleted_at IS NULL ORDER BY created_at DESC`
    return NextResponse.json(rows, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'CDN-Cache-Control': 'no-store',
        'Vercel-CDN-Cache-Control': 'no-store',
      }
    })
  } catch (e) {
    console.error('[ADMIN] Failed to fetch signups:', e)
    return NextResponse.json([])
  }
}
