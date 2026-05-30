import { NextResponse } from 'next/server'
import { sql } from '@/lib/neon'

export const dynamic = 'force-dynamic'

// Admin: list ALL upcoming slots including any added moments ago, soonest first.
// (Same shape as the public route but kept separate so the public endpoint can
// stay narrowly scoped if it ever needs caching/rate-limiting.)
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

// Admin: soft-delete a slot. Body: { id: number }
export async function DELETE(req: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Missing database configuration' }, { status: 500 })
  }
  const body = await req.json().catch(() => ({}))
  const id = body?.id
  if (typeof id !== 'number') {
    return NextResponse.json({ error: 'A numeric id is required' }, { status: 400 })
  }
  try {
    await sql`UPDATE availability_slots SET deleted_at = now() WHERE id = ${id}`
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to remove slot' }, { status: 500 })
  }
}
