#!/usr/bin/env node
// build-todos: turns the last 24 h of LLM output into today's top 10 to-dos for the Todos bubble
// on the phone (tools/todos-android).
//
// Sources (all optional, each capped so the prompt stays small):
//   - Claude Code transcripts  ~/.claude/projects/*/*.jsonl      (your asks + each session's last replies)
//   - Codex transcripts        ~/.codex/sessions/**/*.jsonl      (same)
//   - Commits you (and your cloud sessions) pushed in 24 h, all repos (gh search)
//   - Pending requests in the Approvals queue (each one is waiting on you)
//   - Yesterday's list + what the phone marked done (undone items can carry over)
//
// One Claude call ranks it. Uses the `claude` CLI you are already logged into; falls back to the
// Anthropic SDK when ANTHROPIC_API_KEY is set and the CLI is missing.
//
// Output: data/todos.enc.json on the queue branch, encrypted to the phone app's public key (the repo
// is public). Plain copy for you: ~/.config/aidan-todos/today.json.
//
//   node build-todos.mjs            # build + push
//   node build-todos.mjs --dry-run  # build, print, don't push
//   node build-todos.mjs --digest   # print only the digest that would be sent to Claude
import { execFileSync, spawnSync } from 'node:child_process'
import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const REPO = process.env.TODOS_REPO || 'aidantorrence2/aidan-modern'
const BRANCH = process.env.TODOS_BRANCH || 'ccr-d1938557-3pv196'
const TODOS_PATH = 'data/todos.enc.json'
const STATE_PATH = 'data/todos-state.json'
const APPROVALS_PATH = 'data/approvals.json'
const HOURS = Number(process.env.TODOS_HOURS || 24)
// Ranking the day is planning, so Fable does it.
const MODEL = process.env.TODOS_MODEL || 'claude-fable-5-2'
const CONF = path.join(os.homedir(), '.config', 'aidan-todos')
const MAX_DIGEST = 90_000 // chars of transcript excerpts sent to Claude (~25k tokens)

const args = new Set(process.argv.slice(2))
const since = Date.now() - HOURS * 3600_000
const log = (...a) => process.stderr.write(a.join(' ') + '\n')
const clip = (s, n) => { s = String(s || '').replace(/\s+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim(); return s.length > n ? s.slice(0, n) + ' …' : s }
const today = () => new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())

// ---------- GitHub ----------
function ghToken() {
  if (process.env.GH_TOKEN) return process.env.GH_TOKEN
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN
  for (const gh of ['gh', '/opt/homebrew/bin/gh', '/usr/local/bin/gh']) {
    try { const t = execFileSync(gh, ['auth', 'token'], { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); if (t) return t } catch {}
  }
  return null
}
const TOKEN = ghToken()
async function gh(url, init = {}) {
  const res = await fetch(url.startsWith('http') ? url : `https://api.github.com/${url}`, {
    ...init,
    headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'aidan-todos', ...(init.headers || {}) },
  })
  return res
}
async function getFile(p) {
  const res = await gh(`repos/${REPO}/contents/${p}?ref=${BRANCH}`)
  if (res.status === 404) return { text: null, sha: null }
  if (!res.ok) throw new Error(`GET ${p}: ${res.status}`)
  const j = await res.json()
  return { text: Buffer.from(j.content, 'base64').toString('utf8'), sha: j.sha }
}
async function putFile(p, text, message) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const { sha } = await getFile(p)
    const res = await gh(`repos/${REPO}/contents/${p}`, {
      method: 'PUT',
      body: JSON.stringify({ message, branch: BRANCH, content: Buffer.from(text).toString('base64'), ...(sha ? { sha } : {}) }),
    })
    if (res.ok) return
    if (res.status !== 409 && res.status !== 422) throw new Error(`PUT ${p}: ${res.status} ${await res.text()}`)
  }
  throw new Error(`PUT ${p}: kept conflicting`)
}

// ---------- encryption (format shared with the Android app) ----------
// The repo is public, so the list is encrypted to the phone app's public key. The private half is
// baked into the APK; nothing secret lives on this Mac or in the repo, so there is no key to set up.
const PHONE_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAlTFu6jMSN+8G5uF17GwL
gTTQCOxRTA/KmxyA39xGP+asho5qGsNvWZrweoIH5A/8C01TMZX2QYW0ctYcN9zP
AHFwyfL53H91ZvxpClp/KugC7XUfeNg7mKlCt5plF+0EWhkGde8Hwg9If3rwOrGW
WNLHeop3u7hxgcZm9vuRjhNJNu+1hxA+RKf1yXV1nlykEffOj0S8Eq7gbIU+3FVZ
V58qQ1k09h7+CuUQgeYtpbg9dyFZGBudX1gwhqdC2RC9zR/rNFj8R6Lko4zMUYsj
v5I/49Z98ZxxcMfYUZHgdG2F0WSUTYUHW5gsFm+R50SYCt5HRwaRdTzD9epgICHA
2QIDAQAB
-----END PUBLIC KEY-----`
function encrypt(obj) {
  const aes = crypto.randomBytes(32), iv = crypto.randomBytes(12)
  const ek = crypto.publicEncrypt({ key: PHONE_PUBLIC_KEY, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' }, aes)
  const c = crypto.createCipheriv('aes-256-gcm', aes, iv)
  const ct = Buffer.concat([c.update(JSON.stringify(obj), 'utf8'), c.final(), c.getAuthTag()])
  return { v: 2, date: obj.date, generated: obj.generated, ek: ek.toString('base64'), iv: iv.toString('base64'), ct: ct.toString('base64') }
}

// ---------- transcripts ----------
function walk(dir, out = []) {
  let entries = []
  try { entries = fs.readdirSync(dir, { withFileTypes: true }) } catch { return out }
  for (const e of entries) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p, out)
    else if (e.name.endsWith('.jsonl')) { try { if (fs.statSync(p).mtimeMs >= since) out.push(p) } catch {} }
  }
  return out
}
function textOf(content) {
  if (typeof content === 'string') return content
  if (!Array.isArray(content)) return ''
  return content.filter(b => b && (b.type === 'text' || b.type === 'input_text' || b.type === 'output_text')).map(b => b.text).join('\n')
}
const NOISE = /^(<command-|<local-command|<system-reminder|Caveat:|\[Request interrupted)/

// Per session: what you asked (all asks, short) and how it ended (last two replies, longer).
// The end of a session is where "you need to…", blockers and next steps live.
function summarize(file, tool) {
  const asks = [], replies = []
  let project = '', last = 0
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    if (!line) continue
    let j; try { j = JSON.parse(line) } catch { continue }
    const ts = Date.parse(j.timestamp || '') || 0
    if (ts && ts < since) continue
    let role, text
    if (tool === 'claude') {
      if (j.isSidechain || j.isMeta || (j.type !== 'user' && j.type !== 'assistant')) continue
      if (j.cwd && !project) project = path.basename(j.cwd)
      role = j.type
      const c = j.message?.content
      if (role === 'user' && Array.isArray(c) && c.some(b => b.type === 'tool_result')) continue
      text = textOf(c)
    } else {
      const p = j.type === 'response_item' ? j.payload : j
      if ((j.type === 'session_meta' || j.type === 'turn_context') && j.payload?.cwd && !project) project = path.basename(j.payload.cwd)
      if (!p || p.type !== 'message' || (p.role !== 'user' && p.role !== 'assistant')) continue
      role = p.role
      text = textOf(p.content)
      if (role === 'user' && /^<(environment_context|user_instructions|permissions)/.test(text.trim())) continue
    }
    text = (text || '').trim()
    if (!text || NOISE.test(text)) continue
    if (ts) last = Math.max(last, ts)
    if (role === 'user') asks.push(text); else replies.push(text)
  }
  if (!asks.length && !replies.length) return null
  const shownAsks = asks.length > 6 ? [...asks.slice(0, 2), `(… ${asks.length - 5} more asks …)`, ...asks.slice(-3)] : asks
  const body = [
    ...shownAsks.map(a => `ASK: ${clip(a, 350)}`),
    ...replies.slice(-2).map(r => `REPLY: ${clip(r, 1600)}`),
  ].join('\n')
  return { tool, project: project || path.basename(path.dirname(file)), last: last || fs.statSync(file).mtimeMs, body }
}

function transcripts() {
  const home = os.homedir()
  const files = [
    ...walk(path.join(home, '.claude', 'projects')).map(f => [f, 'claude']),
    ...walk(path.join(home, '.codex', 'sessions')).map(f => [f, 'codex']),
  ]
  const sessions = files.map(([f, t]) => { try { return summarize(f, t) } catch { return null } }).filter(Boolean)
  sessions.sort((a, b) => b.last - a.last) // newest first; the cap drops the oldest
  const out = []; let used = 0
  for (const s of sessions) {
    const block = `### ${s.tool} · ${s.project} · ${new Date(s.last).toISOString().slice(0, 16)}Z\n${s.body}\n`
    if (used + block.length > MAX_DIGEST) break
    out.push(block); used += block.length
  }
  return { text: out.join('\n'), counts: { claude: sessions.filter(s => s.tool === 'claude').length, codex: sessions.filter(s => s.tool === 'codex').length, included: out.length } }
}

// ---------- GitHub-side signals ----------
async function commits() {
  if (!TOKEN) return []
  try {
    const login = (await (await gh('user')).json()).login
    const q = encodeURIComponent(`author:${login} committer-date:>=${new Date(since).toISOString().slice(0, 19)}`)
    const res = await gh(`search/commits?q=${q}&sort=committer-date&order=desc&per_page=100`)
    if (!res.ok) return []
    const j = await res.json()
    return (j.items || []).map(c => `${c.repository.full_name}: ${clip(c.commit.message.split('\n')[0], 160)}`)
  } catch { return [] }
}
async function approvals() {
  try {
    const { text } = await getFile(APPROVALS_PATH)
    const items = JSON.parse(text || '{}').items || []
    return items.filter(i => i.status === 'pending' && !(i.expires && Date.parse(i.expires) < Date.now()))
      .map(i => `${i.id} [${i.kind}] ${clip(i.title, 140)}${i.summary ? ' — ' + clip(i.summary, 160) : ''}`)
  } catch { return [] }
}
async function yesterday() {
  try {
    const local = path.join(CONF, 'today.json') // plain copy of the last list this Mac built
    if (!fs.existsSync(local)) return []
    const list = JSON.parse(fs.readFileSync(local, 'utf8'))
    let state = {}
    try { const s = await getFile(STATE_PATH); if (s.text) state = JSON.parse(s.text) } catch {}
    const known = state.date === list.date // the phone only reports when it has a GitHub token
    const done = new Set(known ? state.done || [] : [])
    return list.items.map(i => ({ ...i, done: known ? done.has(i.id) : null }))
  } catch (e) { log(`previous list unreadable (${e.message}); starting fresh`); return [] }
}

// ---------- Claude ----------
const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['items'],
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['title', 'why', 'next_step', 'minutes', 'source', 'carry_id'],
        properties: {
          title: { type: 'string', description: 'Imperative, max 70 chars, starts with a verb' },
          why: { type: 'string', description: 'One or two sentences: what it unblocks or what happens if skipped' },
          next_step: { type: 'string', description: 'The first physical action, concrete enough to do in 2 minutes' },
          minutes: { type: 'integer', description: 'Rough estimate for the whole task' },
          source: { type: 'string', description: 'Where it came from, e.g. "claude · aidan-modern" or "approvals"' },
          carry_id: { type: 'string', description: 'id of the matching item from YESTERDAY if this is the same task, else ""' },
        },
      },
    },
  },
}

function prompt({ digest, commitLines, pending, prev }) {
  return `You are Aidan's chief of staff. Aidan is a photographer (aidantorrence.com) who runs many AI coding agents (Claude Code, Codex) that build his site, marketing campaigns and tools. Below is everything those agents and Aidan said in the last ${HOURS} hours.

Pick the 10 most important things AIDAN HIMSELF must do today, ranked (1 = most important).

Count only things that need Aidan: decisions only he can make, approvals, logins/keys/payments, physical steps (install on phone, plug in a device, shoot, reply to a person), reviews he was asked for, and work an agent said it is blocked on. Do NOT list work an agent will do or already did. Prefer items that unblock agents or earn money (bookings, campaigns) over nice-to-haves. Merge duplicates. If fewer than 10 real items exist, fill the rest with the most valuable follow-ups the transcripts imply, never invented busywork.

For an unfinished item from YESTERDAY that is still relevant, reuse it and put its id in carry_id. Done items from yesterday must not come back. For [status unknown] items, carry one over only if nothing in the sessions or commits shows it was handled.

Write plainly, no jargon or file paths in the title. next_step is something he can start in two minutes.

Today is ${today()}.

## PENDING APPROVALS (each is waiting on Aidan)
${pending.length ? pending.join('\n') : '(none)'}

## YESTERDAY'S LIST
${prev.length ? prev.map(i => `${i.id} ${i.done === null ? '[status unknown]' : i.done ? '[DONE]' : '[not done]'} ${i.title}`).join('\n') : '(none)'}

## COMMITS PUSHED (all repos)
${commitLines.length ? commitLines.join('\n') : '(none)'}

## AGENT SESSIONS (newest first; ASK = Aidan, REPLY = agent)
${digest || '(none)'}

Reply with JSON only, matching this schema, exactly 10 items:
${JSON.stringify(SCHEMA)}`
}

function findClaude() {
  for (const p of [process.env.CLAUDE_BIN, path.join(os.homedir(), '.local/bin/claude'), path.join(os.homedir(), '.claude/local/claude'), '/opt/homebrew/bin/claude', '/usr/local/bin/claude', 'claude']) {
    if (!p) continue
    const r = spawnSync(p, ['--version'], { stdio: 'ignore' })
    if (r.status === 0) return p
  }
  return null
}
function parseItems(text) {
  const m = String(text).match(/\{[\s\S]*\}/)
  if (!m) throw new Error('no JSON in reply')
  const j = JSON.parse(m[0])
  if (!Array.isArray(j.items) || !j.items.length) throw new Error('reply has no items')
  return j.items
}
async function rank(p) {
  const bin = findClaude()
  if (bin && !process.env.TODOS_USE_SDK) {
    log(`asking ${MODEL} via ${bin}`)
    const r = spawnSync(bin, ['-p', '--model', MODEL, '--output-format', 'json'], { input: p, encoding: 'utf8', maxBuffer: 32 << 20, timeout: 600_000 })
    if (r.status !== 0) throw new Error(`claude -p failed: ${(r.stderr || r.stdout || '').slice(0, 400)}`)
    return parseItems(JSON.parse(r.stdout).result)
  }
  log(`asking ${MODEL} via the Anthropic SDK`)
  const { default: Anthropic } = await import('@anthropic-ai/sdk')
  const client = new Anthropic()
  // Server-side fallback: if Fable declines, the API re-runs the request on a fallback model.
  const res = await client.beta.messages.create({
    model: MODEL,
    max_tokens: 16000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: 'high', format: { type: 'json_schema', schema: SCHEMA } },
    messages: [{ role: 'user', content: p }],
  })
  if (res.stop_reason === 'refusal') throw new Error('Claude declined the request')
  return parseItems(res.content.filter(b => b.type === 'text').map(b => b.text).join(''))
}

// ---------- main ----------
const t = transcripts()
const [commitLines, pending, prev] = await Promise.all([commits(), approvals(), yesterday()])
const p = prompt({ digest: t.text, commitLines, pending, prev })
log(`sources: ${t.counts.claude} claude + ${t.counts.codex} codex sessions (${t.counts.included} included), ${commitLines.length} commits, ${pending.length} pending approvals, ${prev.length} items yesterday · prompt ${Math.round(p.length / 1000)}k chars`)
if (args.has('--digest')) { process.stdout.write(p + '\n'); process.exit(0) }

const prevIds = new Set(prev.map(i => i.id))
const items = (await rank(p)).slice(0, 10).map((i, n) => ({
  id: i.carry_id && prevIds.has(i.carry_id) ? i.carry_id : crypto.createHash('sha1').update(i.title.toLowerCase()).digest('hex').slice(0, 10),
  rank: n + 1,
  title: i.title, why: i.why, next_step: i.next_step, minutes: i.minutes, source: i.source,
}))
const list = {
  date: today(),
  generated: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
  sources: { claude: t.counts.claude, codex: t.counts.codex, commits: commitLines.length, approvals: pending.length },
  items,
}
fs.mkdirSync(CONF, { recursive: true, mode: 0o700 })
fs.writeFileSync(path.join(CONF, 'today.json'), JSON.stringify(list, null, 2) + '\n')
for (const i of items) log(`${String(i.rank).padStart(2)}. ${i.title}  (~${i.minutes} min · ${i.source})`)
if (args.has('--dry-run')) process.exit(0)
if (!TOKEN) throw new Error('no GitHub token (gh auth login, or GH_TOKEN)')
await putFile(TODOS_PATH, JSON.stringify(encrypt(list), null, 2) + '\n', `Todos ${list.date}: ${items.length} items`)
log(`pushed ${TODOS_PATH} to ${BRANCH}`)
