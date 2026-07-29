import type { SupabaseClient } from '@supabase/supabase-js'
import { v2 as cloudinary } from 'cloudinary'
import { readUpdatedAt, stampUpdated, type ActivityRow } from './signupActivity'

// Recovering the edit times nobody recorded.
//
// No update timestamp was ever written, so every row's history is its
// created_at and nothing else. One trace survives: a sign-up's photos are
// uploaded to Cloudinary under signups/<id>/ at the moment of the PATCH, and
// each asset carries its own created_at. For a row whose photos landed well
// after the row did, that upload time *is* the edit time.
//
// This only reaches rows that have photos — a row enriched with a location and
// nothing else left no trace anywhere, and that history is simply gone.
//
// It runs from the /admin render rather than a script or an endpoint: the
// credentials already live there, /admin has no auth to hang a mutating route
// off, and this way nobody has to run anything. Each row is stamped exactly
// once (rows with no detectable edit are stamped with their own created_at,
// which reads as "no edit" everywhere and stops them being rescanned), so the
// work converges over a few auto-refreshes and then costs nothing forever.

// Cloudinary's Admin API is rate-limited by the hour, and /admin re-renders
// every 10s. A small bite per render still drains the backlog in a couple of
// minutes without ever being the reason the page is slow.
const BATCH = 12

// Below this the "edit" is just the capture-time photo write landing moments
// after the insert, not someone coming back to finish later.
const MIN_GAP_MS = 60_000

type BackfillRow = ActivityRow & { id: number; photo_urls?: string[] | null }

function configured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  )
}

/** Newest upload time in the row's Cloudinary folder, or 0 if it has none. */
async function newestUpload(id: number): Promise<number> {
  const res = await cloudinary.api.resources({
    type: 'upload',
    prefix: `signups/${id}/`,
    max_results: 100,
  })
  const times = (res?.resources ?? [])
    .map((r: { created_at?: string }) => Date.parse(r.created_at ?? '') || 0)
  return Math.max(0, ...times)
}

/**
 * Stamps up to BATCH un-backfilled rows in place and returns how many were
 * written. Mutates the rows it was given so the render that triggered it shows
 * the result immediately rather than a refresh later.
 */
export async function backfillUpdatedStamps(sb: SupabaseClient, rows: BackfillRow[]): Promise<number> {
  if (!configured()) return 0

  const pending = rows
    .filter(r => (r.photo_urls?.length ?? 0) > 0 && !readUpdatedAt(r.moodboard))
    .slice(0, BATCH)
  if (pending.length === 0) return 0

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })

  let written = 0
  for (const row of pending) {
    try {
      const created = Date.parse(row.created_at ?? '') || 0
      const uploaded = await newestUpload(row.id)

      // A row with no recoverable edit is still stamped, at its own created_at.
      // That sorts and displays as "never edited" while marking it done, so the
      // next render doesn't pay for the same lookup again.
      const when = uploaded - created > MIN_GAP_MS
        ? new Date(uploaded).toISOString()
        : row.created_at

      if (!when) continue

      const moodboard = stampUpdated(row.moodboard, when)
      const { error } = await sb.from('signups').update({ moodboard }).eq('id', row.id)
      if (error) {
        console.error('[ADMIN] backfill write failed', row.id, error.message)
        continue
      }
      row.moodboard = moodboard
      written++
    } catch (err) {
      // A single unreadable folder must not stall the queue behind it — the
      // row stays unstamped and gets picked up on a later pass.
      console.error('[ADMIN] backfill lookup failed', row.id, err)
    }
  }

  if (written > 0) console.log(`[ADMIN] backfilled ${written} update stamp(s)`)
  return written
}
