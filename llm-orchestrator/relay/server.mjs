// LLM Orchestrator relay.
//
// Sessions (Claude Code hooks, Codex notify, the local bridge, the phone itself) POST completions here.
// The Android app long-polls /api/events, shows each completion with a Claude-drafted reply, and POSTs
// the user's reply back. The reply is then claimed by whoever can deliver it to the session:
//   - a Claude Code Stop hook that is still waiting (local or cloud) -> the session continues in place
//   - the local bridge daemon (resumes Claude Code / Codex sessions headlessly)
//   - the phone (for ChatGPT / Claude app sessions, delivered through the notification's reply action)
//
// Zero-config storage: everything is kept in memory and snapshotted to ORCH_DATA (default ./data.json).

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { suggestReply } from './suggest.mjs';

const PORT = Number(process.env.PORT || 8787);
const TOKEN = process.env.ORCH_TOKEN || '';
const DATA_FILE = process.env.ORCH_DATA || path.join(path.dirname(new URL(import.meta.url).pathname), 'data.json');
const MAX_EVENTS = 400;
const HOOK_FRESH_MS = 35_000; // a hook that polled within this window is considered "listening"
const MAX_WAIT_S = 50;

if (!TOKEN && process.env.ORCH_INSECURE !== '1') {
  console.error('Set ORCH_TOKEN to a long random secret (or ORCH_INSECURE=1 for local testing).');
  process.exit(1);
}

// ---------------------------------------------------------------- state
const state = { seq: 0, tasksSeq: 0, events: [], sessions: {}, tasks: [] };

try {
  Object.assign(state, JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')));
  console.log(`[relay] loaded ${state.events.length} events, ${state.tasks.length} tasks from ${DATA_FILE}`);
} catch {
  /* fresh start */
}

let saveTimer = null;
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      fs.writeFileSync(DATA_FILE + '.tmp', JSON.stringify(state));
      fs.renameSync(DATA_FILE + '.tmp', DATA_FILE);
    } catch (e) {
      console.error('[relay] save failed:', e.message);
    }
  }, 300);
}

// ---------------------------------------------------------------- long-poll plumbing
let waiters = [];
function notify() {
  const w = waiters;
  waiters = [];
  for (const fn of w) fn();
  save();
}
function waitForChange(ms) {
  return new Promise((resolve) => {
    const fn = () => {
      clearTimeout(t);
      resolve();
    };
    const t = setTimeout(() => {
      waiters = waiters.filter((x) => x !== fn);
      resolve();
    }, ms);
    waiters.push(fn);
  });
}
function bump(obj) {
  obj.seq = ++state.seq;
  return obj;
}

// ---------------------------------------------------------------- helpers
const id = () => crypto.randomBytes(8).toString('hex');

function send(res, status, body) {
  const data = body === undefined ? '' : JSON.stringify(body);
  res.writeHead(status, {
    'content-type': 'application/json',
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'authorization, content-type',
    'access-control-allow-methods': 'GET, POST, PUT, OPTIONS',
  });
  res.end(data);
}

async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const c of req) {
    size += c.length;
    if (size > 2_000_000) throw new Error('body too large');
    chunks.push(c);
  }
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function authorized(req, url) {
  if (!TOKEN) return true;
  const h = req.headers.authorization || '';
  const given = h.startsWith('Bearer ') ? h.slice(7) : url.searchParams.get('token') || '';
  const a = Buffer.from(given);
  const b = Buffer.from(TOKEN);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function getSession(sessionId) {
  return state.sessions[sessionId];
}

function upsertSession(ev) {
  const s = state.sessions[ev.sessionId] || { id: ev.sessionId, pending: [], lastHookPollAt: 0 };
  Object.assign(s, {
    source: ev.source,
    title: ev.title || s.title,
    cwd: ev.cwd || s.cwd,
    host: ev.host || s.host,
    replyMode: ev.replyMode || s.replyMode,
    lastEventAt: ev.ts,
  });
  state.sessions[ev.sessionId] = s;
  return s;
}

async function attachSuggestion(ev, hint = '') {
  ev.suggesting = true;
  bump(ev);
  notify();
  const s = await suggestReply(ev, state.tasks, hint);
  ev.suggestion = s;
  ev.suggesting = false;
  bump(ev);
  notify();
}

function pruneEvents() {
  if (state.events.length > MAX_EVENTS) state.events.splice(0, state.events.length - MAX_EVENTS);
  // forget sessions with no activity for 14 days
  const cutoff = Date.now() - 14 * 864e5;
  for (const [k, s] of Object.entries(state.sessions)) if ((s.lastEventAt || 0) < cutoff) delete state.sessions[k];
}

// ---------------------------------------------------------------- routes
async function handle(req, res) {
  const url = new URL(req.url, 'http://x');
  const p = url.pathname;

  if (req.method === 'OPTIONS') return send(res, 204);
  if (p === '/health') return send(res, 200, { ok: true, seq: state.seq });
  if (!authorized(req, url)) return send(res, 401, { error: 'unauthorized' });

  // A session finished a turn.
  if (p === '/api/events' && req.method === 'POST') {
    const b = await readBody(req);
    if (!b.sessionId || !b.source) return send(res, 400, { error: 'sessionId and source are required' });
    const ev = {
      id: id(),
      ts: Date.now(),
      source: String(b.source), // claude-code | claude-code-cloud | codex | chatgpt | claude-app | other
      sessionId: String(b.sessionId),
      title: b.title ? String(b.title).slice(0, 200) : '',
      cwd: b.cwd ? String(b.cwd) : '',
      host: b.host ? String(b.host) : '',
      prompt: b.prompt ? String(b.prompt).slice(0, 20000) : '',
      text: String(b.text || '').slice(0, 100000),
      url: b.url ? String(b.url) : '',
      // hook: a Stop hook is waiting; bridge: the local bridge resumes it; device: the phone delivers it; none: read-only
      replyMode: ['hook', 'bridge', 'device', 'none'].includes(b.replyMode) ? b.replyMode : 'bridge',
      status: 'new',
      suggestion: null,
      suggesting: false,
    };
    // The same turn can be reported twice (e.g. a Stop hook and the sessions poller): keep the first.
    const fingerprint = ev.text.replace(/\s+/g, ' ').trim().slice(0, 500);
    if (fingerprint.length >= 10) {
      const dup = state.events.find((e) => e.ts > ev.ts - 10 * 60_000 && e.text.replace(/\s+/g, ' ').trim().slice(0, 500) === fingerprint);
      if (dup) return send(res, 200, { id: dup.id, seq: dup.seq, duplicate: true });
    }
    // Older unanswered completions from the same session are superseded by this one.
    for (const old of state.events) {
      if (old.sessionId === ev.sessionId && old.status === 'new') bump(Object.assign(old, { status: 'superseded' }));
    }
    upsertSession(ev);
    state.events.push(bump(ev));
    pruneEvents();
    notify();
    if (b.suggest !== false) attachSuggestion(ev).catch((e) => console.error(e));
    return send(res, 201, { id: ev.id, seq: ev.seq });
  }

  // App sync: everything that changed since `since` (long-poll up to `wait` seconds).
  if (p === '/api/events' && req.method === 'GET') {
    const since = Number(url.searchParams.get('since') || 0);
    const wait = Math.min(Number(url.searchParams.get('wait') || 0), MAX_WAIT_S);
    const collect = () => ({
      seq: state.seq,
      events: state.events.filter((e) => e.seq > since),
      tasks: state.tasksSeq > since ? state.tasks : undefined,
      bridges: (state.bridgesSeq || 0) > since ? state.bridges : undefined,
      sessions: since === 0 ? Object.values(state.sessions).map(({ pending, ...s }) => s) : undefined,
    });
    let out = collect();
    if (!out.events.length && out.tasks === undefined && out.bridges === undefined && wait > 0) {
      await waitForChange(wait * 1000);
      out = collect();
    }
    return send(res, 200, out);
  }

  let m;
  // The bridge couldn't deliver a reply: hand it back to the phone (copy + open the session).
  if ((m = p.match(/^\/api\/events\/([a-f0-9]+)\/undeliverable$/)) && req.method === 'POST') {
    const ev = state.events.find((e) => e.id === m[1]);
    if (!ev) return send(res, 404, { error: 'no such event' });
    const b = await readBody(req);
    bump(Object.assign(ev, { status: 'new', replyMode: 'none', delivery: 'failed', deliveryError: String(b.error || '').slice(0, 300), failedReply: ev.reply }));
    notify();
    return send(res, 200, { ok: true });
  }

  if (p === '/api/bridge/status' && req.method === 'POST') {
    const b = await readBody(req);
    if (!b.host) return send(res, 400, { error: 'host required' });
    (state.bridges ??= {})[b.host] = { sources: b.sources || {}, at: Date.now() };
    state.bridgesSeq = ++state.seq;
    notify();
    return send(res, 200, { ok: true });
  }

  if ((m = p.match(/^\/api\/events\/([a-f0-9]+)\/(suggest|dismiss)$/)) && req.method === 'POST') {
    const ev = state.events.find((e) => e.id === m[1]);
    if (!ev) return send(res, 404, { error: 'no such event' });
    if (m[2] === 'dismiss') {
      bump(Object.assign(ev, { status: 'dismissed' }));
      notify();
      return send(res, 200, { ok: true });
    }
    const b = await readBody(req);
    await attachSuggestion(ev, b.hint ? String(b.hint) : '');
    return send(res, 200, ev.suggestion);
  }

  // One-off suggestion for something the relay hasn't seen (used by the phone for notification events).
  if (p === '/api/suggest' && req.method === 'POST') {
    const b = await readBody(req);
    const s = await suggestReply({ source: b.source || 'other', title: b.title, text: b.text || '', prompt: b.prompt }, state.tasks, b.hint || '');
    return send(res, 200, s);
  }

  // User replied from the phone.
  if (p === '/api/reply' && req.method === 'POST') {
    const b = await readBody(req);
    const text = String(b.text || '').trim();
    if (!text) return send(res, 400, { error: 'text is required' });
    const ev = b.eventId ? state.events.find((e) => e.id === b.eventId) : null;
    const sessionId = ev?.sessionId || b.sessionId;
    const s = sessionId && getSession(sessionId);
    if (!s) return send(res, 404, { error: 'unknown session' });
    const reply = { id: id(), text, ts: Date.now(), eventId: ev?.id || null };
    if (ev?.replyMode === 'none') {
      // Nothing can deliver this automatically (the phone copies it and opens the session): just record it.
      bump(Object.assign(ev, { status: 'replied', reply: text, repliedAt: reply.ts, delivery: 'manual' }));
      notify();
      return send(res, 200, { ok: true, replyId: reply.id, deliveredVia: 'manual' });
    }
    s.pending.push(reply);
    if (ev) bump(Object.assign(ev, { status: 'replied', reply: text, repliedAt: reply.ts, delivery: 'queued' }));
    notify();
    const listening = Date.now() - (s.lastHookPollAt || 0) < HOOK_FRESH_MS;
    return send(res, 200, { ok: true, replyId: reply.id, deliveredVia: listening ? 'hook' : s.replyMode === 'none' ? 'next-turn' : 'bridge' });
  }

  // Claude Code Stop hook waiting for the user's reply to its session.
  if (p === '/api/replies' && req.method === 'GET') {
    const sessionId = url.searchParams.get('sessionId');
    const wait = Math.min(Number(url.searchParams.get('wait') || 0), MAX_WAIT_S);
    const s = sessionId && getSession(sessionId);
    if (!s) return send(res, 404, { error: 'unknown session' });
    const deadline = Date.now() + wait * 1000;
    for (;;) {
      s.lastHookPollAt = Date.now();
      if (s.pending.length) {
        const reply = s.pending.shift();
        markDelivered(reply, 'hook');
        return send(res, 200, { reply });
      }
      const left = deadline - Date.now();
      if (left <= 0) return send(res, 200, { reply: null });
      await waitForChange(left);
    }
  }

  // Hook gave up waiting: release so the bridge takes over future replies immediately.
  if ((m = p.match(/^\/api\/sessions\/(.+)\/release$/)) && req.method === 'POST') {
    const s = getSession(decodeURIComponent(m[1]));
    if (s) {
      s.lastHookPollAt = 0;
      // Cloud sessions have no bridge: once the hook stops waiting, replies can't be delivered automatically.
      const mode = s.host ? 'bridge' : 'none';
      s.replyMode = mode;
      for (const ev of state.events) {
        if (ev.sessionId === s.id && ev.status === 'new') bump(Object.assign(ev, { replyMode: mode }));
      }
    }
    notify();
    return send(res, 200, { ok: true });
  }

  // Local bridge daemon: claims replies for sessions it can resume and that no hook is listening for.
  if (p === '/api/bridge/replies' && req.method === 'GET') {
    const host = url.searchParams.get('host') || '';
    const sources = (url.searchParams.get('sources') || 'claude-code,codex').split(',');
    const wait = Math.min(Number(url.searchParams.get('wait') || 0), MAX_WAIT_S);
    const deadline = Date.now() + wait * 1000;
    for (;;) {
      const now = Date.now();
      const claimed = [];
      for (const s of Object.values(state.sessions)) {
        if (!s.pending.length || !sources.includes(s.source)) continue;
        if (s.host && host && s.host !== host) continue;
        if (now - (s.lastHookPollAt || 0) < HOOK_FRESH_MS) continue; // a hook is listening, let it have it
        if (now - s.pending[0].ts < 1500 && s.replyMode === 'hook') continue; // tiny grace period for hooks
        while (s.pending.length) {
          const reply = s.pending.shift();
          markDelivered(reply, 'bridge');
          claimed.push({ ...reply, sessionId: s.id, source: s.source, cwd: s.cwd, title: s.title });
        }
      }
      if (claimed.length) return send(res, 200, { replies: claimed });
      const left = deadline - Date.now();
      if (left <= 0) return send(res, 200, { replies: [] });
      await waitForChange(Math.min(left, 2000));
    }
  }

  if (p === '/api/sessions' && req.method === 'GET') {
    return send(res, 200, { sessions: Object.values(state.sessions).map(({ pending, ...s }) => ({ ...s, pending: pending.length })) });
  }

  if (p === '/api/tasks' && req.method === 'GET') return send(res, 200, { tasks: state.tasks, seq: state.tasksSeq });
  if (p === '/api/tasks' && req.method === 'PUT') {
    const b = await readBody(req);
    if (!Array.isArray(b.tasks)) return send(res, 400, { error: 'tasks array required' });
    state.tasks = b.tasks.slice(0, 500);
    state.tasksSeq = ++state.seq;
    notify();
    return send(res, 200, { ok: true, seq: state.tasksSeq });
  }

  return send(res, 404, { error: 'not found' });
}

function markDelivered(reply, via) {
  if (!reply.eventId) return;
  const ev = state.events.find((e) => e.id === reply.eventId);
  if (ev) bump(Object.assign(ev, { delivery: via, deliveredAt: Date.now() }));
  notify();
}

const server = http.createServer((req, res) => {
  handle(req, res).catch((e) => {
    console.error('[relay] error:', e);
    if (!res.headersSent) send(res, 500, { error: String(e.message || e) });
  });
});
server.requestTimeout = 0;
server.headersTimeout = 65_000;
server.listen(PORT, () => console.log(`[relay] listening on :${PORT}`));

export default server;
