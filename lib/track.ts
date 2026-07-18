// Lightweight first-party analytics client. Events queue locally and flush in
// batches to /api/events, which writes them to the Neon `analytics_events`
// table. Callers pass counts/booleans only — never raw contact details.

type Props = Record<string, string | number | boolean | null>

type QueuedEvent = { event: string; props?: Props; ts: string; seq: number }

const FLUSH_MS = 4000
const MAX_QUEUE = 12
const SCROLL_MILESTONES = [25, 50, 75, 100]

let page = ''
let seq = 0
let queue: QueuedEvent[] = []
let flushTimer: ReturnType<typeof setTimeout> | null = null
let context: Record<string, unknown> | null = null
let sessionId = ''
let visitorId = ''
let initialized = false
let pageLoadedAt = 0

// Engagement accounting: time the tab was actually visible + deepest scroll.
let activeMs = 0
let lastVisibleAt = 0
let maxScrollPct = 0
const scrollFired = new Set<number>()

function uuid(): string {
  try {
    return crypto.randomUUID()
  } catch {
    return Math.random().toString(36).slice(2) + Date.now().toString(36)
  }
}

function getId(storage: Storage, key: string): string {
  // Private mode / blocked storage falls back to a per-page id.
  try {
    let v = storage.getItem(key)
    if (!v) {
      v = uuid()
      storage.setItem(key, v)
    }
    return v
  } catch {
    return uuid()
  }
}

function buildContext(): Record<string, unknown> {
  const url = new URL(window.location.href)
  // Attribution params persist for the whole session (sessionStorage) so the
  // source survives even if the visitor navigates around before signing up.
  let attr: Record<string, string> = {}
  try {
    const saved = sessionStorage.getItem('at_attr')
    if (saved) attr = JSON.parse(saved)
  } catch {}
  let found = false
  for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'igshid', 'ref']) {
    const v = url.searchParams.get(k)
    if (v) {
      attr[k] = v.slice(0, 200)
      found = true
    }
  }
  if (found) {
    try {
      sessionStorage.setItem('at_attr', JSON.stringify(attr))
    } catch {}
  }
  const nav = navigator as Navigator & { connection?: { effectiveType?: string } }
  let timezone: string | null = null
  try {
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {}
  return {
    attr,
    referrer: document.referrer ? document.referrer.slice(0, 300) : null,
    landing: (url.pathname + url.search).slice(0, 300),
    language: navigator.language,
    timezone,
    screen_w: window.screen?.width ?? null,
    screen_h: window.screen?.height ?? null,
    viewport_w: window.innerWidth,
    viewport_h: window.innerHeight,
    dpr: window.devicePixelRatio ?? 1,
    touch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    connection: nav.connection?.effectiveType ?? null,
  }
}

function send(useBeacon: boolean) {
  if (queue.length === 0) return
  const events = queue
  queue = []
  if (flushTimer) {
    clearTimeout(flushTimer)
    flushTimer = null
  }
  const body = JSON.stringify({ page, session_id: sessionId, visitor_id: visitorId, context, events })
  // Plain-text body keeps sendBeacon on the simple-request path; the server
  // parses the raw text as JSON.
  if (useBeacon && navigator.sendBeacon) {
    if (navigator.sendBeacon('/api/events', body)) return
  }
  fetch('/api/events', { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body, keepalive: true }).catch(() => {})
}

export function track(event: string, props?: Props) {
  if (!initialized) return
  queue.push({ event, props, ts: new Date().toISOString(), seq: ++seq })
  if (queue.length >= MAX_QUEUE) send(false)
  else if (!flushTimer) {
    flushTimer = setTimeout(() => {
      flushTimer = null
      send(false)
    }, FLUSH_MS)
  }
}

export function pageElapsedMs(): number {
  return pageLoadedAt ? Date.now() - pageLoadedAt : 0
}

export function flushNow() {
  send(false)
}

function onScroll() {
  const doc = document.documentElement
  const scrollable = doc.scrollHeight - window.innerHeight
  const pct = scrollable > 0 ? Math.min(100, Math.round(((window.scrollY || doc.scrollTop) / scrollable) * 100)) : 100
  if (pct > maxScrollPct) maxScrollPct = pct
  for (const m of SCROLL_MILESTONES) {
    if (pct >= m && !scrollFired.has(m)) {
      scrollFired.add(m)
      track('scroll_depth', { pct: m })
    }
  }
}

function onVisibility() {
  if (document.visibilityState === 'hidden') {
    if (lastVisibleAt) {
      activeMs += Date.now() - lastVisibleAt
      lastVisibleAt = 0
    }
    // Cumulative snapshot each time the tab hides — analysis takes the max
    // per session. This is the last reliable moment to get data out on mobile.
    track('page_engagement', {
      active_ms: Math.round(activeMs),
      max_scroll_pct: maxScrollPct,
      total_ms: pageElapsedMs(),
    })
    send(true)
  } else {
    lastVisibleAt = Date.now()
  }
}

export function initPageAnalytics(pagePath: string, pageProps?: Props) {
  if (typeof window === 'undefined' || initialized) return
  initialized = true
  page = pagePath
  pageLoadedAt = Date.now()
  lastVisibleAt = document.visibilityState === 'visible' ? Date.now() : 0
  visitorId = getId(localStorage, 'at_vid')
  sessionId = getId(sessionStorage, 'at_sid')
  context = buildContext()
  // pageProps lets a page tag its design version so before/after comparisons
  // survive redeploys (e.g. { version: 'white-v2' }).
  track('page_view', pageProps)
  window.addEventListener('scroll', onScroll, { passive: true })
  document.addEventListener('visibilitychange', onVisibility)
  window.addEventListener('pagehide', () => {
    if (lastVisibleAt) {
      activeMs += Date.now() - lastVisibleAt
      lastVisibleAt = 0
    }
    send(true)
  })
  onScroll()
}
