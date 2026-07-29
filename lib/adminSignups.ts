import type { SupabaseClient } from '@supabase/supabase-js'
import { byActivityDesc, type ActivityRow } from './signupActivity'

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
  'id, city, contact_method, contact, moodboard, photo_urls, created_at, updated_at, deleted_at'

// A row's real position in the list is when it was last touched, not when it
// was first written: the flow captures the contact up front and PATCHes the
// rest in as the visitor works through the frames, so a row that gains photos
// an hour later is fresher news than one that has sat untouched. Where that
// timestamp is kept — and why it isn't a column — is in lib/signupActivity.
//
// `updated_at` is asked for anyway: the table doesn't have the column today,
// but it's the right home for this if it's ever added, and the whole of /admin
// is not worth losing to a column that isn't there. The first miss is
// remembered so only one query per process pays for it, and it expires so a
// warm instance picks the column up once it exists rather than ignoring it
// until the instance happens to recycle.
const MISSING_TTL = 5 * 60 * 1000
let missingSince = 0

function updatedAtMissing(): boolean {
  return missingSince > 0 && Date.now() - missingSince < MISSING_TTL
}

function withoutUpdatedAt(columns: string): string {
  return columns
    .split(',')
    .map(c => c.trim())
    .filter(c => c !== 'updated_at')
    .join(', ')
}

/** Postgres 42703 — undefined_column. PostgREST also reports it in the hint. */
function isMissingUpdatedAt(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false
  return error.code === '42703' || /updated_at/.test(error.message ?? '')
}

export async function fetchAllSignups<T>(
  sb: SupabaseClient,
  opts: { deleted?: boolean; contact?: string | null; columns?: string } = {}
): Promise<T[]> {
  const rows: T[] = []
  const requested = opts.columns ?? SIGNUP_COLUMNS

  for (let i = 0; i < MAX_PAGES; i++) {
    const run = (columns: string) => {
      let query = sb.from('signups').select(columns)

      query = opts.deleted
        ? query.not('deleted_at', 'is', null)
        : query.is('deleted_at', null)

      if (opts.contact) query = query.ilike('contact', `%${opts.contact}%`)

      // Paging stays keyed to created_at — it's the one column every row has a
      // value for, so the window can't shift under us between pages. The
      // last-touched order is applied to the full set below.
      return query
        .order('created_at', { ascending: false })
        .range(i * PAGE, i * PAGE + PAGE - 1)
    }

    const skip = updatedAtMissing()
    let { data, error } = await run(skip ? withoutUpdatedAt(requested) : requested)

    if (error && !skip && isMissingUpdatedAt(error)) {
      console.warn('[ADMIN] signups.updated_at not found — ordering by created_at')
      missingSince = Date.now()
      ;({ data, error } = await run(withoutUpdatedAt(requested)))
    }

    if (error) throw error
    rows.push(...((data ?? []) as T[]))
    if (!data || data.length < PAGE) break
  }

  return (rows as ActivityRow[]).sort(byActivityDesc) as T[]
}
