// Funnel + behavior report for the /sign-up-collab analytics events
// (Neon `analytics_events`, written by app/api/events/route.ts).
//
// Usage: node scripts/pull-collab-analytics.mjs [days]   (default 14)
//
// Headless/bot traffic (Playwright verification runs) is excluded via UA.
import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

let dbUrl = process.env.DATABASE_URL
if (!dbUrl) {
  // Scripts don't get Next's automatic .env.local loading — read it directly.
  try {
    const envFile = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', '.env.local'), 'utf8')
    dbUrl = envFile.match(/^DATABASE_URL=(.+)$/m)?.[1]?.trim().replace(/^["']|["']$/g, '')
  } catch {}
}
if (!dbUrl) {
  console.error('DATABASE_URL not set and not found in .env.local')
  process.exit(1)
}

const sql = neon(dbUrl)
const days = Math.max(1, Number(process.argv[2]) || 14)
const PAGE = '/sign-up-collab'
const FIELD_ORDER = ['location', 'concept', 'notes', 'whatsapp', 'country_code', 'instagram', 'photos']

// Shared filter fragments (interpolated values are parameterized by neon).
const base = () => sql`
  SELECT * FROM analytics_events
  WHERE page = ${PAGE}
    AND received_at > now() - make_interval(days => ${days})
    AND user_agent NOT ILIKE '%headless%'`

const rows = await base()
if (rows.length === 0) {
  console.log(`No events for ${PAGE} in the last ${days} day(s).`)
  process.exit(0)
}

// ── group by session ──
const sessions = new Map()
for (const r of rows) {
  let s = sessions.get(r.session_id)
  if (!s) {
    s = { events: [], context: null, country: r.country, city: r.city, first: r.received_at }
    sessions.set(r.session_id, s)
  }
  s.events.push(r)
  if (!s.context && r.context) s.context = r.context
  if (r.received_at < s.first) s.first = r.received_at
}
const sessionList = [...sessions.values()]
const has = (s, ev) => s.events.some(e => e.event === ev)
const count = ev => sessionList.filter(s => has(s, ev)).length
const pct = (n, d) => (d ? `${Math.round((n / d) * 100)}%` : '—')

console.log(`\n=== /sign-up-collab analytics — last ${days} day(s) ===`)
console.log(`${rows.length} events · ${sessionList.length} sessions · ${new Set(rows.map(r => r.visitor_id).values()).size} visitors\n`)

// ── funnel ──
const views = count('page_view')
const starts = count('form_start')
const attempts = count('submit_attempt')
const successes = count('submit_success')
console.log('FUNNEL (sessions)')
console.log(`  page_view       ${views}`)
console.log(`  form_start      ${starts}  (${pct(starts, views)} of views)`)
console.log(`  submit_attempt  ${attempts}  (${pct(attempts, starts)} of starts)`)
console.log(`  submit_success  ${successes}  (${pct(successes, attempts)} of attempts, ${pct(successes, views)} of views)`)

// ── field engagement ──
console.log('\nFIELD ENGAGEMENT (sessions touching each field, of form starts)')
for (const f of FIELD_ORDER) {
  const n = sessionList.filter(s => s.events.some(e => e.event === 'field_engaged' && e.props?.field === f)).length
  if (n) console.log(`  ${f.padEnd(14)} ${String(n).padStart(4)}  ${pct(n, starts)}`)
}

// ── drop-off: furthest field for non-converted starters ──
const dropped = sessionList.filter(s => has(s, 'form_start') && !has(s, 'submit_success'))
if (dropped.length) {
  const furthest = {}
  for (const s of dropped) {
    let best = -1
    for (const e of s.events) {
      if (e.event === 'field_engaged') best = Math.max(best, FIELD_ORDER.indexOf(e.props?.field))
    }
    const key = best >= 0 ? FIELD_ORDER[best] : '(none)'
    furthest[key] = (furthest[key] || 0) + 1
  }
  console.log(`\nDROP-OFF (furthest field reached by ${dropped.length} non-converted starters)`)
  for (const [k, v] of Object.entries(furthest).sort((a, b) => b[1] - a[1])) console.log(`  ${k.padEnd(14)} ${v}`)
}

// ── validation errors ──
const errs = {}
for (const r of rows) if (r.event === 'validation_error') errs[r.props?.reason || '?'] = (errs[r.props?.reason || '?'] || 0) + 1
if (Object.keys(errs).length) {
  console.log('\nVALIDATION ERRORS')
  for (const [k, v] of Object.entries(errs).sort((a, b) => b[1] - a[1])) console.log(`  ${k.padEnd(20)} ${v}`)
}

// ── concept popularity (sessions that ever selected each concept) ──
const concepts = {}
for (const s of sessionList) {
  const chosen = new Set(s.events.filter(e => e.event === 'concept_toggled' && e.props?.selected).map(e => e.props.concept))
  for (const c of chosen) concepts[c] = (concepts[c] || 0) + 1
}
if (Object.keys(concepts).length) {
  console.log('\nCONCEPTS SELECTED (sessions)')
  for (const [k, v] of Object.entries(concepts).sort((a, b) => b[1] - a[1])) console.log(`  ${k.padEnd(26)} ${v}`)
}

// ── locations ──
const locs = {}
for (const r of rows) {
  if (r.event === 'location_selected') {
    const key = `${r.props?.value} (${r.props?.method})`
    locs[key] = (locs[key] || 0) + 1
  }
}
if (Object.keys(locs).length) {
  console.log('\nLOCATIONS SELECTED')
  for (const [k, v] of Object.entries(locs).sort((a, b) => b[1] - a[1]).slice(0, 15)) console.log(`  ${k.padEnd(30)} ${v}`)
}

// ── attribution ──
const sources = {}
for (const s of sessionList) {
  const attr = s.context?.attr || {}
  const key = attr.utm_source || (attr.fbclid ? 'facebook (fbclid)' : null) || (attr.igshid ? 'instagram (igshid)' : null)
    || (s.context?.referrer ? new URL(s.context.referrer).hostname : 'direct / unknown')
  sources[key] = (sources[key] || 0) + 1
}
console.log('\nTRAFFIC SOURCES (sessions)')
for (const [k, v] of Object.entries(sources).sort((a, b) => b[1] - a[1]).slice(0, 12)) console.log(`  ${String(k).padEnd(28)} ${v}`)

// ── geo + device ──
const geos = {}
for (const s of sessionList) {
  const key = [s.city, s.country].filter(Boolean).join(', ') || 'unknown'
  geos[key] = (geos[key] || 0) + 1
}
console.log('\nGEO (sessions)')
for (const [k, v] of Object.entries(geos).sort((a, b) => b[1] - a[1]).slice(0, 12)) console.log(`  ${k.padEnd(28)} ${v}`)

const mobile = sessionList.filter(s => s.context?.touch).length
console.log(`\nDEVICE  mobile/touch ${mobile} · desktop ${sessionList.length - mobile}`)

// ── engagement depth ──
const times = [], scrolls = []
for (const s of sessionList) {
  let t = 0, sc = 0
  for (const e of s.events) {
    if (e.event === 'page_engagement') {
      t = Math.max(t, Number(e.props?.active_ms) || 0)
      sc = Math.max(sc, Number(e.props?.max_scroll_pct) || 0)
    }
    if (e.event === 'scroll_depth') sc = Math.max(sc, Number(e.props?.pct) || 0)
  }
  if (t) times.push(t)
  scrolls.push(sc)
}
const median = a => (a.length ? a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)] : 0)
console.log(`\nENGAGEMENT  median active time ${(median(times) / 1000).toFixed(1)}s · median max scroll ${median(scrolls)}%`)
const deep = scrolls.filter(x => x >= 75).length
console.log(`  reached 75%+ scroll: ${deep} (${pct(deep, sessionList.length)})`)

// ── daily trend ──
const daily = {}
for (const [sid, s] of sessions) {
  const day = new Date(s.first).toISOString().slice(0, 10)
  daily[day] = daily[day] || { sessions: 0, submits: 0 }
  daily[day].sessions++
  if (has(s, 'submit_success')) daily[day].submits++
}
console.log('\nDAILY (sessions / signups)')
for (const [day, d] of Object.entries(daily).sort()) console.log(`  ${day}  ${String(d.sessions).padStart(4)} / ${d.submits}`)
console.log()
