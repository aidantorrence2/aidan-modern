// City travel windows for /sign-up-collab-v6 ("city dates" — honest scarcity).
// The page reads this to show a real, dated window for the visitor's city:
// "Bangkok — Aug 5 to Aug 18". A window whose end date has passed simply stops
// matching, so the page falls back to the evergreen headline on its own.

export type CityWindow = {
  city: string
  iso: string // ISO 3166 country code, e.g. 'TH'
  start: string // ISO date, yyyy-mm-dd
  end: string // ISO date, yyyy-mm-dd (inclusive — the window is live through this day)
  // Optional, shown verbatim when present. Never invent one — the page renders
  // no slot count at all unless this says so.
  slotsNote?: string
}

// ── EDIT ME — keep this in sync with real travel dates ──
// Order doesn't matter; the helpers below sort by start date where needed.
export const CITY_SCHEDULE: CityWindow[] = [
  { city: 'Bangkok', iso: 'TH', start: '2026-08-05', end: '2026-08-18', slotsNote: 'a few collab slots this trip' },
  { city: 'Chiang Mai', iso: 'TH', start: '2026-08-20', end: '2026-08-28' },
]

// A window is live through the end of its last day, in the visitor's clock.
function endOfDay(isoDate: string): Date {
  return new Date(isoDate + 'T23:59:59')
}

function liveWindows(now: Date): CityWindow[] {
  return CITY_SCHEDULE.filter(w => endOfDay(w.end) >= now)
}

// The window for THIS visitor. City name wins over country — a `?city=` pin
// from an ad, or the typed/guessed city, is more specific than a timezone —
// and only windows whose end date is today or later count.
export function activeWindowFor(iso: string | null, city?: string | null, now: Date = new Date()): CityWindow | null {
  const live = liveWindows(now)
  const name = city?.trim().toLowerCase()
  if (name) {
    const byCity = live.find(w => w.city.toLowerCase() === name)
    if (byCity) return byCity
  }
  if (iso) {
    const byIso = live.find(w => w.iso.toUpperCase() === iso.toUpperCase())
    if (byIso) return byIso
  }
  return null
}

// The soonest upcoming (or currently active) window anywhere — what the
// fallback headline points at when the visitor's own city has no window.
export function nextWindow(now: Date = new Date()): CityWindow | null {
  const live = liveWindows(now)
  if (live.length === 0) return null
  return live.reduce((a, b) => (a.start <= b.start ? a : b))
}
