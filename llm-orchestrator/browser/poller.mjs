// Watches the always-on Chromium through the DevTools protocol:
//   - every 30 s, reads your claude.ai and ChatGPT conversations from inside the signed-in tabs (the page's
//     own fetch, so cookies and the site's normal checks apply) and posts finished replies to the relay;
//   - claims replies for those chats from the relay and types them into the real chat box (then Return).
// Env: ORCH_RELAY_URL, ORCH_TOKEN. State: /data/state.json.
import fs from 'node:fs';
import claudeSessionsSource from './connectors/sources/claude-sessions.mjs';

const RELAY = (process.env.ORCH_RELAY_URL || 'http://orch-relay:8787').replace(/\/+$/, '');
const TOKEN = process.env.ORCH_TOKEN;
const CDP = 'http://127.0.0.1:9222';
const STATE_FILE = '/data/state.json';
const HOST = 'server';
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const SERVICES = {
  // `rest` is a plain JSON page on the site's own origin: the tab idles there between checks, so the
  // in-page fetches still run as the site with your cookies, but the heavy chat app isn't burning the CPU.
  claude: { origin: 'https://claude.ai', start: 'https://claude.ai/login', rest: 'https://claude.ai/api/organizations', source: 'claude-web', status: 'claude-web' },
  chatgpt: { origin: 'https://chatgpt.com', start: 'https://chatgpt.com/', rest: 'https://chatgpt.com/api/auth/session', source: 'chatgpt', status: 'chatgpt-web' },
};

let state = {};
try { state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); } catch { state = {}; }
function save() {
  fs.writeFileSync(STATE_FILE + '.tmp', JSON.stringify(state));
  fs.renameSync(STATE_FILE + '.tmp', STATE_FILE);
}

// ------------------------------------------------------------------ relay
async function relay(method, path, body, timeoutMs = 20_000) {
  const r = await fetch(RELAY + path, {
    method,
    headers: { authorization: `Bearer ${TOKEN}`, 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!r.ok) throw new Error(`relay ${method} ${path} -> ${r.status}`);
  return r.json();
}
const status = {};
async function setStatus(name, ok, error = '') {
  const prev = status[name];
  status[name] = { ok, error: String(error).slice(0, 160), at: Date.now() };
  if (prev && prev.ok === ok && prev.error === status[name].error) return;
  await relay('POST', '/api/bridge/status', { host: HOST, sources: status }).catch(() => {});
}

// ------------------------------------------------------------------ DevTools protocol
async function targets() {
  return (await fetch(`${CDP}/json`, { signal: AbortSignal.timeout(5000) })).json();
}
async function tabFor(svc) {
  const all = (await targets()).filter((t) => t.type === 'page');
  let t = all.find((x) => x.url.startsWith(svc.origin));
  if (!t) t = await (await fetch(`${CDP}/json/new?${encodeURIComponent(svc.start)}`, { method: 'PUT' })).json();
  return t;
}
async function session(target) {
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = () => rej(new Error('CDP connect failed')); });
  let id = 0;
  const pending = new Map();
  ws.onmessage = (m) => {
    const d = JSON.parse(m.data);
    if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); }
  };
  const send = (method, params = {}, timeoutMs = 60_000) => new Promise((res, rej) => {
    const n = ++id;
    const timer = setTimeout(() => { pending.delete(n); rej(new Error(`${method} timed out`)); }, timeoutMs);
    pending.set(n, (d) => { clearTimeout(timer); d.error ? rej(new Error(d.error.message)) : res(d.result); });
    ws.send(JSON.stringify({ id: n, method, params }));
  });
  return { send, close: () => ws.close() };
}
async function evaluate(s, fn, arg, timeoutMs = 60_000) {
  const r = await s.send('Runtime.evaluate', {
    expression: `(${fn.toString()})(${JSON.stringify(arg)})`,
    awaitPromise: true,
    returnByValue: true,
  }, timeoutMs);
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description?.split('\n')[0] || 'page script failed');
  return r.result.value;
}

// ------------------------------------------------------------------ in-page readers (run inside the tab)
async function claudeRead(st) {
  const j = async (p) => {
    const r = await fetch('/api' + p, { credentials: 'include', headers: { accept: 'application/json' } });
    if (r.status === 401 || r.status === 403) return { signedOut: true };
    if (!r.ok) throw new Error('claude.ai ' + r.status);
    return r.json();
  };
  const text = (m) => (Array.isArray(m.content) ? m.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n') : m.text || '').trim();
  st = st || { convs: {} };
  if (!st.org) {
    const orgs = await j('/organizations');
    if (orgs.signedOut || !Array.isArray(orgs)) return { signedOut: true, st };
    const org = orgs.find((o) => (o.capabilities || []).includes('chat')) || orgs[0];
    if (!org) return { signedOut: true, st };
    st.org = org.uuid;
  }
  const list = await j(`/organizations/${st.org}/chat_conversations?limit=15`);
  if (list.signedOut) return { signedOut: true, st: { convs: st.convs } };
  const items = Array.isArray(list) ? list : list.data || [];
  const turns = [];
  let fetched = 0;
  for (const c of items) {
    const updated = c.updated_at || '';
    const prev = st.convs[c.uuid];
    if (prev && prev.updated === updated) continue;
    if (!st.initialized) { st.convs[c.uuid] = { updated, last: null }; continue; }
    if (prev && prev.checkedAt && Date.now() - prev.checkedAt < 30000) continue;
    if (fetched++ >= 3) break;
    const conv = await j(`/organizations/${st.org}/chat_conversations/${c.uuid}?tree=True&rendering_mode=messages`);
    const msgs = conv.chat_messages || [];
    const last = msgs[msgs.length - 1];
    const done = !!(last && last.sender === 'assistant' && text(last));
    const recent = Date.now() - Date.parse(updated) < 600000;
    st.convs[c.uuid] = { updated: done || !recent ? updated : '', checkedAt: Date.now(), last: done ? last.uuid : prev && prev.last };
    if (!done || (prev && last.uuid === prev.last)) continue;
    const human = [...msgs].reverse().find((m) => m.sender === 'human');
    turns.push({
      sessionId: 'claude:' + c.uuid,
      title: c.name || 'Claude',
      prompt: human ? text(human).slice(0, 2000) : '',
      text: text(last).slice(0, 20000),
      url: 'https://claude.ai/chat/' + c.uuid,
    });
  }
  st.initialized = true;
  return { turns, st };
}

async function chatgptRead(st) {
  const s = await (await fetch('/api/auth/session', { credentials: 'include' })).json().catch(() => ({}));
  if (!s.accessToken) return { signedOut: true, st };
  const h = { authorization: 'Bearer ' + s.accessToken, accept: 'application/json' };
  const j = async (p) => {
    const r = await fetch(p, { headers: h, credentials: 'include' });
    if (r.status === 429) throw new Error('ChatGPT 429');
    if (!r.ok) throw new Error('ChatGPT ' + r.status);
    return r.json();
  };
  const msgText = (m) => {
    const c = (m && m.content) || {};
    if (Array.isArray(c.parts)) return c.parts.filter((p) => typeof p === 'string').join('\n');
    return typeof c.text === 'string' ? c.text : '';
  };
  const thread = (conv) => {
    const out = []; const seen = new Set(); let id = conv.current_node; const map = conv.mapping || {};
    while (id && map[id] && !seen.has(id)) { seen.add(id); if (map[id].message) out.unshift(map[id].message); id = map[id].parent; }
    return out;
  };
  const latest = (conv) => {
    const t = thread(conv);
    for (let i = t.length - 1; i >= 0; i--) {
      const m = t[i]; const role = m.author && m.author.role;
      if (role === 'user') return null;
      if (role !== 'assistant' || (m.recipient && m.recipient !== 'all')) continue;
      const tx = msgText(m);
      if (!tx.trim()) continue;
      if (m.status && m.status !== 'finished_successfully') return null;
      let prompt = '';
      for (let k = i - 1; k >= 0; k--) if (t[k].author && t[k].author.role === 'user') { prompt = msgText(t[k]); break; }
      return { id: m.id, text: tx, prompt };
    }
    return null;
  };
  st = st || { convs: {} };
  const list = await j('/backend-api/conversations?offset=0&limit=15&order=updated');
  const turns = [];
  let fetched = 0;
  for (const it of list.items || []) {
    const updated = String(it.update_time || '');
    const prev = st.convs[it.id];
    if (prev && prev.updated === updated) continue;
    if (!st.initialized) { st.convs[it.id] = { updated, last: null }; continue; }
    if (prev && prev.checkedAt && Date.now() - prev.checkedAt < 45000) continue;
    if (fetched++ >= 3) break;
    const conv = await j('/backend-api/conversation/' + it.id);
    const r = latest(conv);
    const recent = Date.now() - Date.parse(it.update_time || 0) < 600000;
    st.convs[it.id] = { updated: r || !recent ? updated : '', checkedAt: Date.now(), last: r ? r.id : prev && prev.last };
    if (!r || (prev && r.id === prev.last)) continue;
    turns.push({ sessionId: 'chatgpt:' + it.id, title: it.title || 'ChatGPT', prompt: r.prompt.slice(0, 2000), text: r.text.slice(0, 20000), url: 'https://chatgpt.com/c/' + it.id });
  }
  st.initialized = true;
  return { turns, st };
}

// ------------------------------------------------------------------ Claude Code sessions (cloud + Remote Control)
// claude.ai serves the Claude Code sessions API to its own web UI, so requests made inside the signed-in
// claude.ai tab can list sessions, read their events and post your replies. Same parsing as the Mac bridge.
function pageClient(s) {
  return {
    async call(method, path, body) {
      const r = await evaluate(s, async (a) => {
        const res = await fetch(a.path, {
          method: a.method,
          credentials: 'include',
          headers: { 'content-type': 'application/json', 'anthropic-version': '2023-06-01', 'anthropic-beta': 'ccr-byoc-2025-07-29' },
          body: a.body ? JSON.stringify(a.body) : undefined,
        });
        const text = await res.text();
        return { status: res.status, text };
      }, { method, path, body }, 90_000);
      if (r.status < 200 || r.status >= 300) { const e = new Error(`${method} ${path} -> ${r.status} ${r.text.slice(0, 120)}`); e.status = r.status; throw e; }
      return r.text ? JSON.parse(r.text) : {};
    },
  };
}
let codeSession = null;          // CDP session the Claude Code source currently talks through
const codeSource = claudeSessionsSource({ file: {} }, { client: { call: (...a) => pageClient(codeSession).call(...a) } });

async function pollClaudeCode() {
  if (paused() || busy.claude || !state.claude?.initialized) return; // needs the signed-in claude.ai tab
  let s;
  try {
    const tab = await tabFor(SERVICES.claude);
    s = await session(tab);
    codeSession = s;
    const st = (state.claudeCode ??= {});
    const turns = await codeSource.poll(st);
    save();
    for (const t of turns) {
      await relay('POST', '/api/events', { ...t, host: HOST, replyMode: 'bridge' });
      log(`[claude-code] ${t.source} finished: ${t.title?.slice(0, 60)}`);
    }
    await setStatus('claude-sessions', true);
  } catch (e) {
    log('[claude-code]', e.message);
    await setStatus('claude-sessions', false, e.message);
  } finally {
    s?.close();
  }
}

async function deliverClaudeCode(reply) {
  busy.claude = true;
  let s;
  try {
    s = await session(await tabFor(SERVICES.claude));
    codeSession = s;
    await codeSource.send(reply, state.claudeCode ??= {});
    save();
    log(`[claude-code] sent reply to ${reply.sessionId.slice(0, 24)}`);
  } catch (e) {
    log('[claude-code] send failed:', e.message);
    if (reply.eventId) await relay('POST', `/api/events/${reply.eventId}/undeliverable`, { error: e.message }).catch(() => {});
  } finally {
    s?.close();
    busy.claude = false;
    await relay('POST', '/api/bridge/ack', { ids: [reply.id] }).catch(() => {});
  }
}

// ------------------------------------------------------------------ polling
const busy = { claude: false, chatgpt: false }; // a reply is being typed into that tab
const cooldown = { claude: 0, chatgpt: 0 };

// `touch /data/pause` stops polling (and tab moves) while you use the remote view by hand.
const paused = () => fs.existsSync('/data/pause');

async function pollService(key) {
  const svc = SERVICES[key];
  if (paused() || busy[key] || Date.now() < cooldown[key]) return;
  let s;
  try {
    const tab = await tabFor(svc);
    s = await session(tab);
    if (state[key]?.initialized && !tab.url.startsWith(svc.rest)) {
      await s.send('Page.navigate', { url: svc.rest }).catch(() => {});
      await sleep(4000);
      tab.url = svc.rest;
    }
    const reader = key === 'claude' ? claudeRead : chatgptRead;
    const r = await evaluate(s, reader, state[key] || null);
    state[key] = r.st;
    save();
    if (r.signedOut) {
      // Leave (or put) the full site up so you can sign in through the remote view.
      if (tab.url.startsWith(svc.rest)) await s.send('Page.navigate', { url: svc.start }).catch(() => {});
      await setStatus(svc.status, false, `signed out of ${svc.origin}`);
      return;
    }
    if (!tab.url.startsWith(svc.rest)) await s.send('Page.navigate', { url: svc.rest }).catch(() => {});
    for (const t of r.turns || []) {
      // claude.ai replies are sent from this server; ChatGPT ones by the phone through the ChatGPT app,
      // because ChatGPT demands its in-page browser check per message and this server's CPU is too small for it.
      await relay('POST', '/api/events', { ...t, source: svc.source, host: HOST, replyMode: key === 'claude' ? 'bridge' : 'none' });
      log(`[${key}] finished: ${t.title.slice(0, 60)}`);
    }
    await setStatus(svc.status, true);
  } catch (e) {
    if (/429/.test(e.message)) cooldown[key] = Date.now() + 5 * 60_000;
    log(`[${key}]`, e.message);
    await setStatus(svc.status, false, e.message);
  } finally {
    s?.close();
  }
}

// ------------------------------------------------------------------ sending (types into the real chat box)
const COMPOSER = {
  claude: ['div[contenteditable="true"].ProseMirror', 'div[contenteditable="true"]', 'textarea'],
  chatgpt: ['#prompt-textarea', 'div[contenteditable="true"]', 'textarea'],
};

/** Runs in the claude.ai tab: posts the reply as the next message, exactly like the site's Send button. */
async function claudeSend(arg) {
  const j = async (p, init) => {
    const r = await fetch('/api' + p, { credentials: 'include', ...init });
    if (!r.ok) throw new Error('claude.ai ' + r.status + ' ' + (await r.text()).slice(0, 120));
    return r;
  };
  const orgs = await (await j('/organizations')).json();
  const org = (orgs.find((o) => (o.capabilities || []).includes('chat')) || orgs[0]).uuid;
  const conv = await (await j(`/organizations/${org}/chat_conversations/${arg.id}?tree=True&rendering_mode=messages`)).json();
  const before = (conv.chat_messages || []).length;
  const parent = conv.current_leaf_message_uuid || (conv.chat_messages || []).slice(-1)[0]?.uuid;
  const r = await j(`/organizations/${org}/chat_conversations/${arg.id}/completion`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'text/event-stream' },
    body: JSON.stringify({
      prompt: arg.text,
      parent_message_uuid: parent,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      locale: 'en-US',
      attachments: [],
      files: [],
      sync_sources: [],
      rendering_mode: 'messages',
    }),
  });
  await r.text(); // stream until Claude finishes
  const after = await (await j(`/organizations/${org}/chat_conversations/${arg.id}?tree=True&rendering_mode=messages`)).json();
  return { before, after: (after.chat_messages || []).length };
}

async function deliver(reply) {
  if (reply.source === 'claude-code-cloud' || reply.source === 'claude-code-rc') return deliverClaudeCode(reply);
  if (reply.source === 'claude-web') return deliverClaude(reply);
  return deliverByTyping(reply);
}

async function deliverClaude(reply) {
  busy.claude = true;
  let s;
  try {
    const tab = await tabFor(SERVICES.claude);
    s = await session(tab);
    if (!tab.url.startsWith(SERVICES.claude.rest)) { await s.send('Page.navigate', { url: SERVICES.claude.rest }); await sleep(4000); }
    const r = await evaluate(s, claudeSend, { id: reply.sessionId.replace(/^claude:/, ''), text: reply.text }, 300_000);
    if (!(r.after > r.before)) throw new Error('claude.ai did not record the message');
    log(`[claude] sent reply to ${reply.sessionId.slice(0, 24)} (${r.before}→${r.after} messages)`);
    const id = reply.sessionId.split(':')[1];
    if (state.claude?.convs?.[id]) state.claude.convs[id].updated = '';
  } catch (e) {
    log('[claude] send failed:', e.message);
    if (reply.eventId) await relay('POST', `/api/events/${reply.eventId}/undeliverable`, { error: e.message }).catch(() => {});
  } finally {
    s?.close();
    busy.claude = false;
    await relay('POST', '/api/bridge/ack', { ids: [reply.id] }).catch(() => {});
  }
}

async function deliverByTyping(reply) {
  const key = reply.source === 'claude-web' ? 'claude' : 'chatgpt';
  const svc = SERVICES[key];
  busy[key] = true;
  let s;
  try {
    const tab = await tabFor(svc);
    s = await session(tab);
    await s.send('Page.enable');
    const url = svc.origin + (key === 'claude' ? '/chat/' : '/c/') + reply.sessionId.replace(/^(claude|chatgpt):/, '');
    await s.send('Page.navigate', { url });
    // Wait for the composer to exist and be focusable.
    let ok = false;
    for (let i = 0; i < 40 && !ok; i++) {
      await sleep(500);
      ok = await evaluate(s, (sels) => {
        for (const q of sels) {
          const el = document.querySelector(q);
          if (el && el.offsetParent !== null) { el.focus(); return true; }
        }
        return false;
      }, COMPOSER[key]).catch(() => false);
    }
    if (!ok) throw new Error(`${svc.origin}: chat box not found (signed out?)`);
    await sleep(300);
    await s.send('Input.insertText', { text: reply.text });
    await sleep(400);
    for (const type of ['keyDown', 'keyUp']) {
      await s.send('Input.dispatchKeyEvent', { type, key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13, text: type === 'keyDown' ? '\r' : undefined });
    }
    // Sent when the composer empties.
    let sent = false;
    for (let i = 0; i < 20 && !sent; i++) {
      await sleep(500);
      sent = await evaluate(s, (sels) => {
        for (const q of sels) { const el = document.querySelector(q); if (el) return !(el.innerText || el.value || '').trim(); }
        return false;
      }, COMPOSER[key]).catch(() => false);
    }
    if (!sent) throw new Error('typed the reply but it did not send');
    log(`[${key}] sent reply to ${reply.sessionId.slice(0, 24)}`);
    if (state[key]?.convs) { const id = reply.sessionId.split(':')[1]; if (state[key].convs[id]) state[key].convs[id].updated = ''; }
  } catch (e) {
    log(`[${key}] send failed:`, e.message);
    if (reply.eventId) await relay('POST', `/api/events/${reply.eventId}/undeliverable`, { error: e.message }).catch(() => {});
  } finally {
    if (s) await s.send('Page.navigate', { url: svc.rest }).catch(() => {}); // back to the light page
    s?.close();
    busy[key] = false;
    await relay('POST', '/api/bridge/ack', { ids: [reply.id] }).catch(() => {});
  }
}

async function replyLoop() {
  for (;;) {
    try {
      const r = await relay('GET', `/api/bridge/replies?host=${HOST}&sources=claude-web,claude-code-cloud,claude-code-rc&wait=25`, undefined, 40_000);
      for (const reply of r.replies || []) await deliver(reply);
    } catch (e) {
      log('[replies]', e.message);
      await sleep(5000);
    }
  }
}

// ------------------------------------------------------------------ main
if (!TOKEN) { console.error('ORCH_TOKEN missing'); process.exit(1); }
for (let i = 0; i < 60; i++) { try { await targets(); break; } catch { await sleep(1000); } }
log(`[browser] watching claude.ai + ChatGPT, relay ${RELAY}`);
replyLoop();
for (;;) {
  await pollService('claude');
  await pollClaudeCode();
  await pollService('chatgpt');
  await sleep(30_000);
}
