import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// PostgREST caps a response at 1000 rows and says nothing about it — the query
// just stops. Ordered newest-first, that silently hid everything past the
// 1000th row: at 1939 live signups, admin was showing only back to late June,
// so a campaign that ran earlier looked like it had four sign-ups instead of
// 145. Page until a short batch comes back.
const PAGE = 1000
// Backstop so a bad filter can't spin forever. Well clear of the real table.
const MAX_PAGES = 50

export async function GET(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    return NextResponse.json({ error: 'Missing database credentials' }, { status: 500 })
  }

  const supabase = createClient(url, key)
  const { searchParams } = new URL(request.url)
  const deleted = searchParams.get('deleted') === 'true'
  const contact = searchParams.get('contact')

  const page = (from: number) => {
    let query = supabase
      .from('signups')
      .select('id, city, contact_method, contact, moodboard, photo_urls, created_at, deleted_at')

    if (deleted) {
      query = query.not('deleted_at', 'is', null)
    } else {
      query = query.is('deleted_at', null)
    }

    if (contact) {
      query = query.ilike('contact', `%${contact}%`)
    }

    return query.order('created_at', { ascending: false }).range(from, from + PAGE - 1)
  }

  const signups: NonNullable<Awaited<ReturnType<typeof page>>['data']> = []
  let truncated = false

  for (let i = 0; i < MAX_PAGES; i++) {
    const { data, error } = await page(i * PAGE)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    signups.push(...(data ?? []))
    if (!data || data.length < PAGE) break
    if (i === MAX_PAGES - 1) truncated = true
  }

  return NextResponse.json({ count: signups.length, signups, ...(truncated ? { truncated } : {}) })
}
