import { NextResponse } from 'next/server'
import { sql } from '@/lib/neon'

export const dynamic = 'force-dynamic'

// Public: list upcoming, non-deleted availability slots (soonest first).
export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Missing database configuration' }, { status: 500 })
  }
  try {
    const rows = await sql`
      SELECT id, start_at, note
      FROM availability_slots
      WHERE deleted_at IS NULL
        AND start_at >= now()
      ORDER BY start_at ASC
    `
    return NextResponse.json({ slots: rows })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to load slots' }, { status: 500 })
  }
}

// Admin: add a slot. Body: { start_at: ISO string, note?: string }
export async function POST(req: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Missing database configuration' }, { status: 500 })
  }
  const body = await req.json().catch(() => ({}))
  const startAt = body?.start_at
  const note = typeof body?.note === 'string' ? body.note.trim() : null

  if (typeof startAt !== 'string' || Number.isNaN(Date.parse(startAt))) {
    return NextResponse.json({ error: 'A valid start_at date/time is required' }, { status: 400 })
  }

  try {
    const rows = await sql`
      INSERT INTO availability_slots (start_at, note)
      VALUES (${startAt}, ${note})
      RETURNING id, start_at, note
    `
    return NextResponse.json({ slot: rows[0] })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to add slot' }, { status: 500 })
  }
}
