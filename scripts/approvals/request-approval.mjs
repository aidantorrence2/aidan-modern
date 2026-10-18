#!/usr/bin/env node
// request-approval: the one way any agent (Claude Code, Codex, routines) asks Aidan to approve something.
// The request shows up on his Mac as an Approvals card with Approve / Deny.
//
//   request-approval add --kind email --title "Send email to Ana: NY test shoot" \
//       --summary "Follow-up to Ana Diaz about the 24 Oct test shoot" \
//       --payload '{"to":"ana@x.com","subject":"...","body":"..."}' [--preview-url URL] [--expires-hours 72] [--id email:ana-followup]
//   request-approval status <id>                 # {"id","status","decided","note"}
//   request-approval wait <id> [--timeout 900]   # exit 0 approved, 3 denied, 4 still pending at timeout
//   request-approval list [--pending]
//   request-approval result <id> "<what you did>" # record the outcome after acting on an approved item
//
// Queue: data/approvals.json on branch ccr-d1938557-3pv196 of aidantorrence2/aidan-modern (override with
// APPROVALS_REPO / APPROVALS_BRANCH / APPROVALS_PATH). Auth: GH_TOKEN / GITHUB_TOKEN, else `gh auth token`;
// with no token it falls back to git (clone the branch, commit, push) using the current repo's origin.
// Agents only add items and record results; only Aidan (the app) changes status.
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const REPO = process.env.APPROVALS_REPO || 'aidantorrence2/aidan-modern'
const BRANCH = process.env.APPROVALS_BRANCH || 'ccr-d1938557-3pv196'
const FILE = process.env.APPROVALS_PATH || 'data/approvals.json'
const KINDS = ['email', 'post', 'spend', 'build', 'other']

const die = (msg, code = 2) => { process.stderr.write(`request-approval: ${msg}\n`); process.exit(code) }
const sleep = ms => new Promise(r => setTimeout(r, ms))
const nowIso = () => new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')

function parseArgs(argv) {
  const pos = [], opt = {}
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a.startsWith('--')) {
      const k = a.slice(2)
      const next = argv[i + 1]
      if (next === undefined || next.startsWith('--')) opt[k] = true
      else { opt[k] = next; i++ }
    } else pos.push(a)
  }
  return { pos, opt }
}

function token() {
  if (process.env.GH_TOKEN) return process.env.GH_TOKEN
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN
  for (const gh of ['gh', '/opt/homebrew/bin/gh', '/usr/local/bin/gh']) {
    try {
      const t = execFileSync(gh, ['auth', 'token'], { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()
      if (t) return t
    } catch {}
  }
  return null
}

function detectSource() {
  if (process.env.APPROVALS_SOURCE) return process.env.APPROVALS_SOURCE
  const where = path.basename(process.cwd())
  if (Object.keys(process.env).some(k => k.startsWith('CODEX_'))) return `codex:${where}`
  if (process.env.CLAUDECODE || process.env.CLAUDE_CODE_ENTRYPOINT) return `claude:${where}`
  return `agent:${where}`
}

// ---------- storage backends: GitHub Contents API, or plain git ----------

// Retries brief network failures (connect timeouts, resets) so a blip doesn't lose a request.
async function fetchRetry(url, opts, tries = 3) {
  for (let i = 1; ; i++) {
    try { return await fetch(url, opts) } catch (e) {
      if (i >= tries) die(`network error talking to GitHub: ${e.cause?.code || e.message}`, 1)
      await sleep(1500 * i)
    }
  }
}

function apiBackend(tok) {
  const url = `https://api.github.com/repos/${REPO}/contents/${FILE}`
  const headers = { Authorization: `Bearer ${tok}`, Accept: 'application/vnd.github+json', 'User-Agent': 'request-approval', 'X-GitHub-Api-Version': '2022-11-28' }
  return {
    async read() {
      const r = await fetchRetry(`${url}?ref=${encodeURIComponent(BRANCH)}`, { headers, cache: 'no-store' })
      if (!r.ok) die(`GitHub GET ${r.status}: ${(await r.text()).slice(0, 200)}`, 1)
      const j = await r.json()
      return { db: JSON.parse(Buffer.from(j.content, 'base64').toString('utf8')), sha: j.sha }
    },
    async write(db, sha, message) {
      const body = JSON.stringify({ message, branch: BRANCH, sha, content: Buffer.from(JSON.stringify(db, null, 2) + '\n').toString('base64') })
      const r = await fetchRetry(url, { method: 'PUT', headers: { ...headers, 'Content-Type': 'application/json' }, body })
      if (r.status === 409 || r.status === 422) return false // stale sha: caller re-reads and retries
      if (!r.ok) die(`GitHub PUT ${r.status}: ${(await r.text()).slice(0, 200)}`, 1)
      return true
    },
  }
}

function gitBackend() {
  let origin = process.env.APPROVALS_GIT_URL
  if (!origin) { try { origin = execFileSync('git', ['remote', 'get-url', 'origin'], { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim() } catch {} }
  if (!origin) die('no GitHub token and no git origin; set GH_TOKEN or run inside a clone of the repo', 1)
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'approvals-'))
  const git = (...a) => execFileSync('git', ['-C', dir, ...a], { stdio: ['ignore', 'pipe', 'pipe'] }).toString()
  // Partial, sparse clone: only the queue file is downloaded, not the repo's media.
  execFileSync('git', ['clone', '-q', '--depth', '1', '--filter=blob:none', '--no-checkout', '--branch', BRANCH, origin, dir], { stdio: ['ignore', 'ignore', 'pipe'] })
  git('sparse-checkout', 'set', '--no-cone', `/${FILE}`)
  git('checkout', '-q', BRANCH)
  return {
    async read() {
      git('fetch', '-q', '--depth', '1', 'origin', BRANCH); git('reset', '-q', '--hard', `origin/${BRANCH}`)
      return { db: JSON.parse(fs.readFileSync(path.join(dir, FILE), 'utf8')), sha: null }
    },
    async write(db, _sha, message) {
      fs.writeFileSync(path.join(dir, FILE), JSON.stringify(db, null, 2) + '\n')
      git('-c', 'user.name=request-approval', '-c', 'user.email=noreply@anthropic.com', 'commit', '-q', '-am', message)
      try { git('push', '-q', 'origin', `HEAD:${BRANCH}`); return true } catch { return false }
    },
  }
}

const tok = token()
const store = tok && !process.env.APPROVALS_FORCE_GIT ? apiBackend(tok) : gitBackend()

/** read → mutate → write, retrying on a concurrent write. mutate returns a commit message or null (no write). */
async function update(mutate) {
  for (let attempt = 1; attempt <= 4; attempt++) {
    const { db, sha } = await store.read()
    if (!Array.isArray(db.items)) die('queue file has no items array', 1)
    const message = mutate(db)
    if (!message) return db
    if (await store.write(db, sha, message)) return db
    await sleep(500 * attempt)
  }
  die('could not write after 4 attempts (the queue kept changing)', 1)
}

const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40)
const view = i => ({ id: i.id, status: i.status, decided: i.decided ?? null, note: i.note ?? '' })

// ---------- commands ----------

const { pos, opt } = parseArgs(process.argv.slice(2))
const cmd = pos[0]

if (cmd === 'add') {
  const kind = opt.kind || 'other'
  if (!KINDS.includes(kind)) die(`--kind must be one of ${KINDS.join(', ')}`)
  if (!opt.title || opt.title === true) die('--title is required: say plainly what will happen, e.g. "Send email to Ana Diaz: NY test shoot"')
  if (!opt.summary || opt.summary === true) die('--summary is required: one or two lines Aidan can decide on without opening anything')
  let payload = {}
  if (opt['payload-file']) payload = JSON.parse(fs.readFileSync(opt['payload-file'], 'utf8'))
  else if (opt.payload && opt.payload !== true) { try { payload = JSON.parse(opt.payload) } catch (e) { die(`--payload is not valid JSON: ${e.message}`) } }
  const created = new Date()
  const stamp = created.toISOString().slice(0, 16).replace(/[-:T]/g, '')
  const id = opt.id && opt.id !== true ? opt.id : `${kind}:${slug(opt.title)}-${stamp}`
  const item = {
    id, kind, source: opt.source && opt.source !== true ? opt.source : detectSource(),
    title: opt.title, summary: opt.summary,
    ...(opt['preview-url'] && opt['preview-url'] !== true ? { preview_url: opt['preview-url'] } : {}),
    payload,
    created: nowIso(),
    ...(opt['expires-hours'] ? { expires: new Date(created.getTime() + Number(opt['expires-hours']) * 3600e3).toISOString().replace(/\.\d{3}Z$/, 'Z') } : {}),
    status: 'pending', decided: null, note: '',
  }
  let existed = null
  await update(db => {
    existed = db.items.find(i => i.id === id)
    if (existed) return null
    db.items.push(item)
    return `Request ${id} (${item.source})`
  })
  if (existed) { console.log(JSON.stringify({ ...view(existed), already: true })); process.exit(0) }
  console.log(JSON.stringify({ id, status: 'pending' }))
} else if (cmd === 'status') {
  const id = pos[1] || die('usage: status <id>')
  const { db } = await store.read()
  const it = db.items.find(i => i.id === id) || die(`no item ${id}`, 1)
  console.log(JSON.stringify(view(it)))
} else if (cmd === 'wait') {
  const id = pos[1] || die('usage: wait <id> [--timeout seconds] [--interval seconds]')
  const deadline = Date.now() + Number(opt.timeout || 900) * 1000
  const interval = Math.max(10, Number(opt.interval || 30)) * 1000
  while (true) {
    const { db } = await store.read()
    const it = db.items.find(i => i.id === id) || die(`no item ${id}`, 1)
    const expired = it.expires && Date.parse(it.expires) < Date.now()
    if (it.status !== 'pending' || expired || Date.now() > deadline) {
      console.log(JSON.stringify({ ...view(it), ...(expired && it.status === 'pending' ? { expired: true } : {}) }))
      process.exit(it.status === 'approved' ? 0 : it.status === 'denied' || expired ? 3 : 4)
    }
    await sleep(interval)
  }
} else if (cmd === 'list') {
  const { db } = await store.read()
  const rows = db.items.filter(i => !opt.pending || i.status === 'pending')
  for (const i of rows) console.log(`${i.status.padEnd(8)} ${i.id}  ${i.title}`)
} else if (cmd === 'result') {
  const [, id, text] = pos
  if (!id || !text) die('usage: result <id> "<what you did>"')
  await update(db => {
    const it = db.items.find(i => i.id === id) || die(`no item ${id}`, 1)
    if (it.status !== 'approved') die(`${id} is ${it.status}, not approved; do not act on it`, 3)
    it.payload = { ...(it.payload || {}), result: text, result_at: nowIso() }
    return `Result ${id}`
  })
  console.log(JSON.stringify({ id, result: text }))
} else {
  die('usage: request-approval add|status|wait|list|result  (see the header of this file)')
}
