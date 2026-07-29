// When a sign-up was last touched, without a schema change.
//
// The flow captures a contact up front and PATCHes the rest in as the visitor
// works through the frames, so `created_at` is not when a row last had news.
// There is no `updated_at` column and adding one is a migration this project
// has no path for, so the stamp goes where this table already keeps the facts
// it can't fit in columns: the `moodboard` array, alongside "Raw contact:",
// "Channel:" and "Location:".
//
// If an `updated_at` column ever does appear, activityAt() picks it up on its
// own — it takes whichever signals exist and uses the latest.

export const UPDATED_PREFIX = 'Updated:'
const UPDATED_RE = /^updated:\s*/i

/** True for the bookkeeping entry, so callers can keep it out of the UI. */
export function isUpdatedEntry(entry: string): boolean {
  return UPDATED_RE.test(entry)
}

export function readUpdatedAt(moodboard?: string[] | null): string | null {
  const entry = moodboard?.find(isUpdatedEntry)
  if (!entry) return null
  const iso = entry.replace(UPDATED_RE, '').trim()
  return Number.isNaN(Date.parse(iso)) ? null : iso
}

/** Replaces any existing stamp — the entry is a current value, not a log. */
export function stampUpdated(moodboard: string[] | null | undefined, when: string): string[] {
  const kept = (moodboard ?? []).filter(m => !isUpdatedEntry(m))
  return [...kept, `${UPDATED_PREFIX} ${when}`]
}

export type ActivityRow = {
  id?: number
  created_at?: string | null
  updated_at?: string | null
  moodboard?: string[] | null
}

/** The moment a row last had news: the latest of every timestamp it carries. */
export function activityAt(row: ActivityRow): number {
  const stamps = [row.created_at, row.updated_at, readUpdatedAt(row.moodboard)]
  return Math.max(0, ...stamps.map(s => Date.parse(s ?? '') || 0))
}

export function byActivityDesc(a: ActivityRow, b: ActivityRow): number {
  return activityAt(b) - activityAt(a) || (b.id ?? 0) - (a.id ?? 0)
}
