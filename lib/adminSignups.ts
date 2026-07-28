import type { SupabaseClient } from '@supabase/supabase-js'

// PostgREST caps any response at 1000 rows and says nothing about it — the
// query just stops short. Ordered newest-first that silently hides the oldest
// rows, which is how /admin came to show 4 Kathmandu sign-ups out of 145.
//
// Both the /admin page and /api/admin/signups need every row, and they used to
// each write the query themselves — which is why fixing one didn't fix the
// other. One helper now, so there's a single place for this to be right.
const PAGE = 1000
// Backstop so a bad filter can't spin forever. Well clear of the real table.
const MAX_PAGES = 50

export const SIGNUP_COLUMNS =
  'id, city, contact_method, contact, moodboard, photo_urls, created_at, deleted_at'

export async function fetchAllSignups<T>(
  sb: SupabaseClient,
  opts: { deleted?: boolean; contact?: string | null; columns?: string } = {}
): Promise<T[]> {
  const rows: T[] = []

  for (let i = 0; i < MAX_PAGES; i++) {
    let query = sb.from('signups').select(opts.columns ?? SIGNUP_COLUMNS)

    query = opts.deleted
      ? query.not('deleted_at', 'is', null)
      : query.is('deleted_at', null)

    if (opts.contact) query = query.ilike('contact', `%${opts.contact}%`)

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .range(i * PAGE, i * PAGE + PAGE - 1)

    if (error) throw error
    rows.push(...((data ?? []) as T[]))
    if (!data || data.length < PAGE) break
  }

  return rows
}
