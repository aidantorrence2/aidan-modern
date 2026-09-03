import { createHash } from 'crypto'
import { sql } from './neon'

// Phone-use tracker. Events arrive from an iOS Shortcuts automation
// ("when app X is opened / closed" -> GET /api/phone/ping). Sessions are
// rebuilt from open/close pairs; the hourly coach reads /api/phone/summary
// and writes its critique to /api/phone/review.

export const STALE_OPEN_MIN = 30 // an "open" with no "close" is capped at this
export const MIN_KEY_LEN = 16

export type Action = 'open' | 'close'
export type Ev = { id: number; ts: string; app: string; action: Action; note: string | null }
export type Session = { app: string; start: string; end: string; minutes: number; ongoing: boolean; capped: boolean }
export type Prefs = { dailyLimitMin: number; tz: string; quietStart: string; quietEnd: string; goal: string }

const DEFAULT_PREFS: Prefs = { dailyLimitMin: 90, tz: 'UTC', quietStart: '22:00', quietEnd: '07:00', goal: '' }

let ensured: Promise<unknown> | null = null
export function ensureTables(): Promise<unknown> {
  if (!ensured) {
    ensured = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS phone_events (
          id      BIGSERIAL PRIMARY KEY,
          ts      TIMESTAMPTZ NOT NULL DEFAULT now(),
          app     TEXT NOT NULL,
          action  TEXT NOT NULL,
          source  TEXT,
          note    TEXT
        )`
      await sql`CREATE INDEX IF NOT EXISTS phone_events_ts_idx ON phone_events (ts)`
      await sql`CREATE INDEX IF NOT EXISTS phone_events_app_ts_idx ON phone_events (app, ts)`
      await sql`
        CREATE TABLE IF NOT EXISTS phone_settings (
          key        TEXT PRIMARY KEY,
          value      JSONB NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )`
      await sql`
        CREATE TABLE IF NOT EXISTS phone_reviews (
          id       BIGSERIAL PRIMARY KEY,
          at       TIMESTAMPTZ NOT NULL DEFAULT now(),
          status   TEXT NOT NULL,
          headline TEXT NOT NULL,
          body     TEXT NOT NULL,
          score    INTEGER,
          stats    JSONB
        )`
    })().catch(err => {
      ensured = null
      throw err
    })
  }
  return ensured
}

function hash(k: string) {
  return createHash('sha256').update(k).digest('hex')
}

// The first caller to present a key (of sane length) claims it; every call
// after that must present the same key. Keeps the secret out of the repo and
// out of Vercel env config, which can't be edited from a phone easily.
export async function checkKey(k: string | null | undefined): Promise<'ok' | 'claimed' | 'bad'> {
  if (!k || k.length < MIN_KEY_LEN || k.length > 128) return 'bad'
  await ensureTables()
  const rows = await sql`SELECT value FROM phone_settings WHERE key = 'access_key'`
  const stored = rows[0]?.value?.hash
  if (!stored) {
    await sql`INSERT INTO phone_settings (key, value) VALUES ('access_key', ${JSON.stringify({ hash: hash(k) })}::jsonb)
              ON CONFLICT (key) DO NOTHING`
    const again = await sql`SELECT value FROM phone_settings WHERE key = 'access_key'`
    return again[0]?.value?.hash === hash(k) ? 'claimed' : 'bad'
  }
  return stored === hash(k) ? 'ok' : 'bad'
}

export function keyFrom(req: Request): string | null {
  const url = new URL(req.url)
  const q = url.searchParams.get('k') || url.searchParams.get('key')
  if (q) return q
  const auth = req.headers.get('authorization') || ''
  return auth.startsWith('Bearer ') ? auth.slice(7).trim() : null
}

export function normApp(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  const s = raw.trim().replace(/\s+/g, ' ').slice(0, 40)
  return s ? s : null
}

export async function recordEvent(opts: { app: string; action: Action | 'toggle'; source?: string; note?: string | null; ts?: Date }) {
  await ensureTables()
  let action: Action
  if (opts.action === 'toggle') {
    const last = await sql`SELECT action, ts FROM phone_events WHERE app = ${opts.app} ORDER BY ts DESC LIMIT 1`
    const l = last[0]
    const fresh = l && Date.now() - new Date(l.ts).getTime() < STALE_OPEN_MIN * 60e3
    action = l && l.action === 'open' && fresh ? 'close' : 'open'
  } else {
    action = opts.action
  }
  const ts = opts.ts ?? new Date()
  const rows = await sql`
    INSERT INTO phone_events (ts, app, action, source, note)
    VALUES (${ts.toISOString()}, ${opts.app}, ${action}, ${opts.source ?? null}, ${opts.note ?? null})
    RETURNING id, ts`
  return { id: rows[0].id as number, ts: new Date(rows[0].ts).toISOString(), action }
}

export async function getPrefs(): Promise<Prefs> {
  await ensureTables()
  const rows = await sql`SELECT value FROM phone_settings WHERE key = 'prefs'`
  return { ...DEFAULT_PREFS, ...(rows[0]?.value || {}) }
}

export async function savePrefs(patch: Partial<Prefs>): Promise<Prefs> {
  const cur = await getPrefs()
  const next: Prefs = {
    dailyLimitMin: clampInt(patch.dailyLimitMin, cur.dailyLimitMin, 5, 1440),
    tz: typeof patch.tz === 'string' && patch.tz.length <= 64 ? patch.tz : cur.tz,
    quietStart: isHHMM(patch.quietStart) ? patch.quietStart! : cur.quietStart,
    quietEnd: isHHMM(patch.quietEnd) ? patch.quietEnd! : cur.quietEnd,
    goal: typeof patch.goal === 'string' ? patch.goal.slice(0, 300) : cur.goal,
  }
  await sql`INSERT INTO phone_settings (key, value, updated_at) VALUES ('prefs', ${JSON.stringify(next)}::jsonb, now())
            ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`
  return next
}
function clampInt(v: unknown, dflt: number, lo: number, hi: number) {
  const n = typeof v === 'string' ? parseInt(v, 10) : typeof v === 'number' ? Math.round(v) : NaN
  return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : dflt
}
function isHHMM(v: unknown): v is string {
  return typeof v === 'string' && /^\d{2}:\d{2}$/.test(v)
}

// Rebuild sessions from open/close events. An open followed by another open of
// the same app closes the first (at the earlier of the new open or the cap);
// a trailing open with no close is ongoing until the cap.
export function pairSessions(events: Ev[], now: Date): Session[] {
  const byApp = new Map<string, Ev[]>()
  for (const e of events) {
    if (!byApp.has(e.app)) byApp.set(e.app, [])
    byApp.get(e.app)!.push(e)
  }
  const out: Session[] = []
  const cap = STALE_OPEN_MIN * 60e3
  for (const [app, evs] of byApp) {
    evs.sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime())
    let open: number | null = null
    const push = (start: number, end: number, ongoing: boolean, capped: boolean) => {
      if (end <= start) return
      out.push({ app, start: new Date(start).toISOString(), end: new Date(end).toISOString(), minutes: (end - start) / 60e3, ongoing, capped })
    }
    for (const e of evs) {
      const t = new Date(e.ts).getTime()
      if (e.action === 'open') {
        if (open !== null) push(open, Math.min(t, open + cap), false, t > open + cap)
        open = t
      } else if (open !== null) {
        push(open, Math.min(t, open + cap), false, t > open + cap)
        open = null
      }
    }
    if (open !== null) {
      const capEnd = open + cap
      const ongoing = now.getTime() < capEnd
      push(open, Math.min(now.getTime(), capEnd), ongoing, !ongoing)
    }
  }
  return out.sort((a, b) => (a.start < b.start ? 1 : -1))
}

export type WindowStats = {
  minutes: number
  sessions: number
  quickChecks: number       // sessions under 2 minutes
  longest: number
  byApp: Record<string, number>
  quietMinutes: number
}

function overlap(s: Session, from: number, to: number) {
  const a = Math.max(new Date(s.start).getTime(), from)
  const b = Math.min(new Date(s.end).getTime(), to)
  return Math.max(0, b - a)
}

export function localHHMM(d: Date, tz: string) {
  try {
    return new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false }).format(d)
  } catch {
    return new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit', hour12: false }).format(d)
  }
}
export function localDate(d: Date, tz: string) {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d)
  } catch {
    return d.toISOString().slice(0, 10)
  }
}
function inQuiet(hhmm: string, start: string, end: string) {
  if (start === end) return false
  return start < end ? hhmm >= start && hhmm < end : hhmm >= start || hhmm < end
}

export function windowStats(sessions: Session[], from: number, to: number, prefs: Prefs): WindowStats {
  const st: WindowStats = { minutes: 0, sessions: 0, quickChecks: 0, longest: 0, byApp: {}, quietMinutes: 0 }
  for (const s of sessions) {
    const ms = overlap(s, from, to)
    if (ms <= 0) continue
    const min = ms / 60e3
    st.minutes += min
    st.sessions += 1
    if (min < 2) st.quickChecks += 1
    st.longest = Math.max(st.longest, min)
    st.byApp[s.app] = (st.byApp[s.app] || 0) + min
    if (inQuiet(localHHMM(new Date(s.start), prefs.tz), prefs.quietStart, prefs.quietEnd)) st.quietMinutes += min
  }
  st.minutes = round1(st.minutes)
  st.longest = round1(st.longest)
  st.quietMinutes = round1(st.quietMinutes)
  for (const k of Object.keys(st.byApp)) st.byApp[k] = round1(st.byApp[k])
  return st
}
const round1 = (n: number) => Math.round(n * 10) / 10

export async function buildSummary(now = new Date()) {
  await ensureTables()
  const prefs = await getPrefs()
  const since = new Date(now.getTime() - 36 * 3600e3).toISOString()
  const rows = await sql`SELECT id, ts, app, action, note FROM phone_events WHERE ts >= ${since} ORDER BY ts ASC`
  const events: Ev[] = rows.map(r => ({ id: r.id, ts: new Date(r.ts).toISOString(), app: r.app, action: r.action, note: r.note }))
  const sessions = pairSessions(events, now)
  const t = now.getTime()
  const last24 = events.filter(e => new Date(e.ts).getTime() >= t - 24 * 3600e3)
  const lastEvent = events.length ? events[events.length - 1] : null

  // local midnight in the user's tz, via the date string round-trip
  const todayKey = localDate(now, prefs.tz)
  const dayStart = (() => {
    // find the instant where the local date flips to todayKey (binary search over the last 26h)
    let lo = t - 26 * 3600e3, hi = t
    for (let i = 0; i < 40; i++) {
      const mid = (lo + hi) / 2
      if (localDate(new Date(mid), prefs.tz) === todayKey) hi = mid
      else lo = mid
    }
    return hi
  })()

  const h1 = windowStats(sessions, t - 3600e3, t, prefs)
  const h12 = windowStats(sessions, t - 12 * 3600e3, t, prefs)
  const today = windowStats(sessions, dayStart, t, prefs)

  const reviews = await sql`SELECT id, at, status, headline, body, score, stats FROM phone_reviews ORDER BY at DESC LIMIT 24`
  const latest = reviews[0]
    ? { at: new Date(reviews[0].at).toISOString(), status: reviews[0].status, headline: reviews[0].headline, body: reviews[0].body, score: reviews[0].score, stats: reviews[0].stats }
    : null
  const history = reviews.map(r => ({ at: new Date(r.at).toISOString(), status: r.status, score: r.score })).reverse()

  const ready = last24.length > 0
  const readyReason = !events.length
    ? 'No events have ever arrived. The phone automation is not set up or not reaching the site.'
    : !ready
      ? `No events in the last 24 h (last one ${lastEvent!.ts}). The automation may have stopped.`
      : 'ok'

  const apps = Array.from(new Set(events.map(e => e.app)))
  const hourly = Array.from({ length: 12 }, (_, i) => {
    const from = t - (12 - i) * 3600e3
    return { from: new Date(from).toISOString(), minutes: round1(sessions.reduce((a, s) => a + overlap(s, from, from + 3600e3) / 60e3, 0)) }
  })

  return {
    now: now.toISOString(),
    tz: prefs.tz,
    localTime: localHHMM(now, prefs.tz),
    todayKey,
    ready,
    readyReason,
    eventsLast24h: last24.length,
    lastEventAt: lastEvent ? lastEvent.ts : null,
    prefs,
    apps,
    h1,
    h12,
    today,
    hourly,
    sessions: sessions.filter(s => new Date(s.end).getTime() >= t - 12 * 3600e3).map(s => ({ ...s, minutes: round1(s.minutes) })),
    recentEvents: events.slice(-40).reverse(),
    review: latest,
    reviewHistory: history,
  }
}
