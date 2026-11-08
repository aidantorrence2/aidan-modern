// Integration test: relay + bridge against mock versions of the Claude Code sessions API, chatgpt.com,
// claude.ai and a Codex sessions directory. Checks baseline, new-turn detection, reply delivery, and the
// "can't deliver -> hand back to the phone" path. Run: node connectors/test-sources.mjs
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

const here = path.dirname(new URL(import.meta.url).pathname);
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'orch-src-'));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const now = () => new Date().toISOString();

// ---------------------------------------------------------------- mock services
const mock = {
  sessions: [
    { id: 'session_A', title: 'Fix login', session_status: 'SESSION_STATUS_IDLE', updated_at: now(), environment_kind: 'anthropic_cloud' },
    { id: 'session_B', title: 'Local refactor', session_status: 'SESSION_STATUS_IDLE', updated_at: now(), environment_kind: 'bridge' },
  ],
  events: { session_A: [], session_B: [] },
  posted: [],
  gpt: { items: [{ id: 'g1', title: 'Trip plan', update_time: 1 }], convs: { g1: null }, pow: true, posted: [] },
  cw: { list: [{ uuid: 'c1', name: 'Essay', updated_at: '1' }], convs: {}, posted: [] },
};
const ev = (type, body) => ({ created_at: now(), [type]: { uuid: Math.random().toString(36).slice(2), ...body } });
const gptConv = (answer, id) => ({
  current_node: id,
  mapping: {
    root: { parent: null, message: null },
    u: { parent: 'root', message: { id: 'u', author: { role: 'user' }, content: { content_type: 'text', parts: ['plan a trip'] } } },
    [id]: { parent: 'u', message: { id, author: { role: 'assistant' }, recipient: 'all', status: 'finished_successfully', content: { content_type: 'text', parts: [answer] } } },
  },
});
mock.gpt.convs.g1 = gptConv('Old answer', 'a0');
mock.cw.convs.c1 = {
  current_leaf_message_uuid: 'm2',
  chat_messages: [
    { uuid: 'm1', sender: 'human', text: 'draft essay', parent_message_uuid: null },
    { uuid: 'm2', sender: 'assistant', content: [{ type: 'text', text: 'Old essay' }], parent_message_uuid: 'm1' },
  ],
};

async function body(req) {
  let s = '';
  for await (const c of req) s += c;
  return s ? JSON.parse(s) : {};
}
const svc = http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://x');
  const p = u.pathname;
  const json = (o, code = 200) => {
    res.writeHead(code, { 'content-type': 'application/json' });
    res.end(JSON.stringify(o));
  };
  // Claude Code sessions API
  if (p.startsWith('/v1/sessions')) {
    if (req.headers.authorization !== 'Bearer cli-token' || req.headers['anthropic-beta'] !== 'ccr-byoc-2025-07-29' || req.headers['x-organization-uuid'] !== 'org-1')
      return json({ error: 'auth' }, 401);
    if (p === '/v1/sessions') return json({ data: mock.sessions, has_more: false });
    const m = p.match(/^\/v1\/sessions\/([^/]+)\/events$/);
    if (m && req.method === 'GET') return json({ data: mock.events[m[1]] || [], has_more: false });
    if (m && req.method === 'POST') {
      mock.posted.push({ id: m[1], ...(await body(req)) });
      return json({ ok: true });
    }
  }
  // chatgpt.com
  if (p === '/api/auth/session') return json(req.headers.cookie?.includes('gpt-cookie') ? { accessToken: 'gpt-at' } : {});
  if (p.startsWith('/backend-api')) {
    if (req.headers.authorization !== 'Bearer gpt-at') return json({}, 401);
    if (p === '/backend-api/conversations') return json({ items: mock.gpt.items });
    if (p.startsWith('/backend-api/conversation/')) return json(mock.gpt.convs[p.split('/').pop()]);
    if (p === '/backend-api/sentinel/chat-requirements') return json({ token: 't', proofofwork: { required: mock.gpt.pow } });
    if (p === '/backend-api/conversation') {
      mock.gpt.posted.push(await body(req));
      res.writeHead(200, { 'content-type': 'text/event-stream' });
      return res.end('data: [DONE]\n\n');
    }
  }
  // claude.ai
  if (p.startsWith('/api/organizations')) {
    if (!req.headers.cookie?.includes('sessionKey=cw-key')) return json({}, 403);
    if (p === '/api/organizations') return json([{ uuid: 'o1', capabilities: ['chat'] }]);
    if (p === '/api/organizations/o1/chat_conversations') return json(mock.cw.list);
    const m = p.match(/chat_conversations\/([^/]+)(\/completion)?$/);
    if (m && m[2]) {
      mock.cw.posted.push(await body(req));
      res.writeHead(200, { 'content-type': 'text/event-stream' });
      return res.end('event: message_stop\ndata: {}\n\n');
    }
    if (m) return json(mock.cw.convs[m[1]]);
  }
  json({ error: 'not found ' + p }, 404);
});
await new Promise((r) => svc.listen(0, r));
const mockBase = `http://127.0.0.1:${svc.address().port}`;

// ---------------------------------------------------------------- relay + bridge
const RPORT = 19000 + Math.floor(Math.random() * 900);
const relayUrl = `http://127.0.0.1:${RPORT}`;
const TOKEN = 'tkn';
const relay = spawn(process.execPath, [path.join(here, '../relay/server.mjs')], {
  env: { ...process.env, PORT: String(RPORT), ORCH_TOKEN: TOKEN, ORCH_DATA: path.join(dir, 'relay.json'), ANTHROPIC_API_KEY: '' },
  stdio: ['ignore', 'pipe', 'inherit'],
});
await new Promise((r) => relay.stdout.once('data', r));

const codexDir = path.join(dir, 'codex', '2026', '11', '08');
fs.mkdirSync(codexDir, { recursive: true });
const rollout = path.join(codexDir, 'rollout-2026-11-08T10-00-00-thr1.jsonl');
const line = (o) => JSON.stringify(o) + '\n';
fs.writeFileSync(
  rollout,
  line({ type: 'session_meta', payload: { id: 'thr1', cwd: '/work/api' } }) +
    line({ type: 'event_msg', payload: { type: 'user_message', message: 'old task' } }) +
    line({ type: 'event_msg', payload: { type: 'task_complete', last_agent_message: 'old done' } }),
);

const config = {
  relayUrl,
  token: TOKEN,
  host: 'laptop',
  claudeSessions: { apiBase: mockBase, accessToken: 'cli-token', orgUuid: 'org-1', intervalMs: 300 },
  codex: { sessionsDir: path.join(dir, 'codex'), intervalMs: 300 },
  chatgpt: { baseUrl: mockBase, sessionToken: 'gpt-cookie', intervalMs: 300 },
  claudeWeb: { baseUrl: mockBase, sessionKey: 'cw-key', intervalMs: 300 },
  commands: { codex: [process.execPath, '-e', `require('fs').appendFileSync(${JSON.stringify(path.join(dir, 'codex-calls.txt'))}, process.argv.slice(1).join('|') + '\\n')`, '{session}', '{text}'] },
};
fs.writeFileSync(path.join(dir, 'config.json'), JSON.stringify(config));
const bridge = spawn(process.execPath, [path.join(here, 'bridge.mjs')], {
  env: { ...process.env, ORCH_CONFIG: path.join(dir, 'config.json'), ORCH_STATE: path.join(dir, 'state.json'), ORCH_RELAY_URL: '', ORCH_TOKEN: '' },
  stdio: ['ignore', process.env.DEBUG ? 'inherit' : 'ignore', 'inherit'],
});

const call = async (method, route, b) => {
  const r = await fetch(relayUrl + route, { method, headers: { authorization: `Bearer ${TOKEN}`, 'content-type': 'application/json' }, body: b && JSON.stringify(b) });
  return r.json();
};
const events = async () => (await call('GET', '/api/events?since=0')).events.filter((e) => e.status !== 'superseded');
async function waitFor(fn, label, ms = 8000) {
  const end = Date.now() + ms;
  for (;;) {
    const v = await fn();
    if (v) return v;
    if (Date.now() > end) throw new Error('timed out waiting for: ' + label);
    await sleep(150);
  }
}

try {
  // Baseline: nothing old is reported.
  await sleep(1500);
  assert.equal((await events()).length, 0, 'baseline reports nothing');
  const bridges = (await call('GET', '/api/events?since=0')).bridges;
  assert.ok(bridges?.laptop?.sources?.['claude-sessions']?.ok, 'bridge status reported');

  // 1. Claude Code cloud session finishes a turn
  mock.events.session_A.push(ev('user', { type: 'user', parent_tool_use_id: null, message: { role: 'user', content: 'Fix the login bug' } }));
  mock.events.session_A.push(ev('result', { internal_anthropic_catchall: { result: 'Fixed. Want a test too?', is_error: false } }));
  mock.sessions[0].updated_at = new Date(Date.now() + 1000).toISOString();
  const a = await waitFor(async () => (await events()).find((e) => e.sessionId === 'session_A'), 'claude session event');
  assert.equal(a.source, 'claude-code-cloud');
  assert.equal(a.prompt, 'Fix the login bug');
  assert.equal(a.text, 'Fixed. Want a test too?');
  assert.equal(a.url, 'https://claude.ai/code/session_A');
  await call('POST', '/api/reply', { eventId: a.id, text: 'Yes, add a test.' });
  const posted = await waitFor(() => mock.posted[0], 'reply posted into session');
  assert.equal(posted.id, 'session_A');
  assert.equal(posted.events[0].type, 'user');
  assert.equal(posted.events[0].message.content, 'Yes, add a test.');
  await waitFor(async () => (await events()).find((e) => e.id === a.id)?.delivery === 'bridge', 'delivery marked');

  // 2. Local Remote Control session (SDK-shaped events without wrappers)
  mock.events.session_B.push({ type: 'user', uuid: 'u9', parent_tool_use_id: null, message: { role: 'user', content: [{ type: 'text', text: 'Refactor utils' }] } });
  mock.events.session_B.push({ type: 'result', uuid: 'r9', result: 'Refactored 4 files.' });
  mock.sessions[1].updated_at = new Date(Date.now() + 2000).toISOString();
  const b = await waitFor(async () => (await events()).find((e) => e.sessionId === 'session_B'), 'rc session event');
  assert.equal(b.source, 'claude-code-rc');
  assert.equal(b.prompt, 'Refactor utils');

  // 3. Codex CLI: append a new turn (with a partial trailing line first)
  fs.appendFileSync(rollout, line({ type: 'event_msg', payload: { type: 'user_message', message: 'add pagination' } }) + '{"type":"event_');
  await sleep(700);
  fs.appendFileSync(rollout, 'msg","payload":{"type":"task_complete","last_agent_message":"Pagination added."}}\n');
  const c = await waitFor(async () => (await events()).find((e) => e.source === 'codex'), 'codex event');
  assert.equal(c.sessionId, 'thr1');
  assert.equal(c.cwd, '/work/api');
  assert.equal(c.text, 'Pagination added.');
  assert.equal(c.prompt, 'add pagination');
  await call('POST', '/api/reply', { eventId: c.id, text: 'Ship it' });
  const calls = await waitFor(() => fs.existsSync(path.join(dir, 'codex-calls.txt')) && fs.readFileSync(path.join(dir, 'codex-calls.txt'), 'utf8'), 'codex resume run');
  assert.match(calls, /thr1\|Ship it/);

  // 4. ChatGPT: new answer detected; send refused (proof-of-work) -> handed back to the phone
  mock.gpt.convs.g1 = gptConv('Day 1: Lisbon. Day 2: Sintra.', 'a1');
  mock.gpt.items[0].update_time = 2;
  const g = await waitFor(async () => (await events()).find((e) => e.source === 'chatgpt'), 'chatgpt event');
  assert.equal(g.text, 'Day 1: Lisbon. Day 2: Sintra.');
  assert.equal(g.prompt, 'plan a trip');
  assert.equal(g.url, `${mockBase}/c/g1`);
  await call('POST', '/api/reply', { eventId: g.id, text: 'Add Porto' });
  const back = await waitFor(async () => {
    const e = (await events()).find((x) => x.id === g.id);
    return e?.delivery === 'failed' && e;
  }, 'chatgpt undeliverable');
  assert.equal(back.status, 'new');
  assert.equal(back.replyMode, 'none');
  assert.equal(back.failedReply, 'Add Porto');
  assert.equal(mock.gpt.posted.length, 0, 'no send attempted past the verification check');
  // Answering it again is recorded, not re-queued (the phone copies + opens instead)
  const manual = await call('POST', '/api/reply', { eventId: g.id, text: 'Add Porto' });
  assert.equal(manual.deliveredVia, 'manual');
  // When no verification is required, the send goes through
  mock.gpt.convs.g1 = gptConv('Updated with Porto.', 'a2');
  mock.gpt.items[0].update_time = 3;
  const g2 = await waitFor(async () => (await events()).find((e) => e.source === 'chatgpt' && e.text === 'Updated with Porto.'), 'chatgpt second turn');
  mock.gpt.pow = false;
  await call('POST', '/api/reply', { eventId: g2.id, text: 'Thanks' });
  const gp = await waitFor(() => mock.gpt.posted[0], 'chatgpt message posted');
  assert.equal(gp.conversation_id, 'g1');
  assert.equal(gp.parent_message_id, 'a2');
  assert.deepEqual(gp.messages[0].content.parts, ['Thanks']);

  // 5. claude.ai chat
  mock.cw.convs.c1.chat_messages.push(
    { uuid: 'm3', sender: 'human', text: 'shorter', parent_message_uuid: 'm2' },
    { uuid: 'm4', sender: 'assistant', content: [{ type: 'text', text: 'Shorter essay.' }], parent_message_uuid: 'm3' },
  );
  mock.cw.convs.c1.current_leaf_message_uuid = 'm4';
  mock.cw.list[0].updated_at = '2';
  const w = await waitFor(async () => (await events()).find((e) => e.source === 'claude-web'), 'claude.ai event');
  assert.equal(w.text, 'Shorter essay.');
  assert.equal(w.prompt, 'shorter');
  await call('POST', '/api/reply', { eventId: w.id, text: 'Perfect, add a title' });
  const cp = await waitFor(() => mock.cw.posted[0], 'claude.ai completion posted');
  assert.equal(cp.prompt, 'Perfect, add a title');
  assert.equal(cp.parent_message_uuid, 'm4');

  // 6. Duplicate reports of the same turn (hook + poller) collapse into one
  const dup = await call('POST', '/api/events', { source: 'claude-code', sessionId: 'hook-uuid', text: 'Refactored 4 files.', suggest: false });
  assert.equal(dup.duplicate, true);

  console.log('ALL SOURCE TESTS PASSED');
} finally {
  bridge.kill();
  relay.kill();
  svc.close();
}
