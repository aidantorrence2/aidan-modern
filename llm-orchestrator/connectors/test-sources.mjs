// Integration test: relay + bridge against mock versions of the Claude Code sessions API, chatgpt.com,
// claude.ai, a Codex sessions directory and a fake ~/.claude (local CLI transcripts, delivered through a
// throwaway tmux server on a private socket). Checks baseline, new-turn detection, reply delivery, and the
// "can't deliver -> hand back to the phone" path. Run: node connectors/test-sources.mjs
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { spawn, execFileSync } from 'node:child_process';

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

// ---------------------------------------------------------------- fake ~/.claude for claude-local
const home = path.join(dir, 'home');
const projDir = path.join(home, '.claude', 'projects', '-work-app');
const pidDir = path.join(home, '.claude', 'sessions');
fs.mkdirSync(path.join(projDir, 'sess-local-1', 'subagents'), { recursive: true });
fs.mkdirSync(path.join(home, '.claude', 'projects', '-tmp'), { recursive: true });
fs.mkdirSync(pidDir, { recursive: true });
let uuidN = 0;
const cc = (type, o = {}) =>
  line({ parentUuid: null, isSidechain: false, type, uuid: `u${++uuidN}`, timestamp: now(), entrypoint: 'cli', cwd: '/work/app', ...o });
const ccUser = (sessionId, content, o) => cc('user', { sessionId, message: { role: 'user', content }, ...o });
const ccAsst = (sessionId, id, content, stop, o) => cc('assistant', { sessionId, message: { id, role: 'assistant', model: 'claude-x', content, stop_reason: stop }, ...o });
const transcript = (id) => path.join(projDir, `${id}.jsonl`);
// Existing session with an already finished turn: part of the baseline, never reported.
fs.writeFileSync(
  transcript('sess-local-1'),
  line({ type: 'permission-mode', permissionMode: 'default', sessionId: 'sess-local-1' }) +
    ccUser('sess-local-1', 'Set up the repo and explain the layout') +
    ccAsst('sess-local-1', 'm0', [{ type: 'text', text: 'Old answer from before the bridge started.' }], 'end_turn'),
);
// The bridge must never resume a session it thinks is live: S3 is "running" (pid = this test) outside tmux.
fs.writeFileSync(path.join(pidDir, `${process.pid}.json`), JSON.stringify({ pid: process.pid, sessionId: 'sess-local-3', kind: 'interactive', entrypoint: 'cli' }));
// Throwaway tmux server on a private socket, running `cat` into a file, standing in for Pulse's pane of S1.
const tmuxSock = path.join(dir, 'tmux.sock'); // private socket in the temp dir, never the user's servers
const tmuxOut = path.join(dir, 'pane-out.txt');
let tmuxOk = false;
try {
  execFileSync('tmux', ['-S', tmuxSock, '-f', '/dev/null', 'new-session', '-d', '-s', 'orchtest', '-x', '120', '-y', '20', `cat > ${tmuxOut}`]);
  const panePid = Number(execFileSync('tmux', ['-S', tmuxSock, 'display', '-p', '-t', 'orchtest', '#{pane_pid}']).toString().trim());
  fs.writeFileSync(path.join(pidDir, `${panePid}.json`), JSON.stringify({ pid: panePid, sessionId: 'sess-local-1', kind: 'interactive', entrypoint: 'cli' }));
  tmuxOk = true;
} catch (e) {
  console.log('tmux unavailable, skipping the tmux delivery check:', e.message.split('\n')[0]);
}
const tmuxSocketPath = tmuxOk ? tmuxSock : path.join(dir, 'no-tmux');

const config = {
  relayUrl,
  token: TOKEN,
  host: 'laptop',
  claudeSessions: { apiBase: mockBase, accessToken: 'cli-token', orgUuid: 'org-1', intervalMs: 300 },
  codex: { sessionsDir: path.join(dir, 'codex'), intervalMs: 300 },
  claudeLocal: { intervalMs: 300, settleMs: 400 },
  tmux: { sockets: [tmuxSocketPath] },
  chatgpt: { baseUrl: mockBase, sessionToken: 'gpt-cookie', intervalMs: 300 },
  claudeWeb: { baseUrl: mockBase, sessionKey: 'cw-key', intervalMs: 300 },
  commands: {
    codex: [process.execPath, '-e', `require('fs').appendFileSync(${JSON.stringify(path.join(dir, 'codex-calls.txt'))}, process.argv.slice(1).join('|') + '\\n')`, '{session}', '{text}'],
    'claude-code-local': [
      process.execPath,
      '-e',
      `require('fs').appendFileSync(${JSON.stringify(path.join(dir, 'claude-calls.txt'))}, [process.cwd(), process.env.CLAUDE_CODE_CHILD_SESSION || 'clean', ...process.argv.slice(1)].join('|') + '\\n')`,
      '{session}',
      '{text}',
    ],
  },
};
fs.writeFileSync(path.join(dir, 'config.json'), JSON.stringify(config));
const bridge = spawn(process.execPath, [path.join(here, 'bridge.mjs')], {
  env: {
    ...process.env,
    HOME: home,
    CLAUDE_CONFIG_DIR: '',
    CLAUDE_CODE_CHILD_SESSION: '1', // must not leak into the resumed claude -p
    ORCH_CONFIG: path.join(dir, 'config.json'),
    ORCH_STATE: path.join(dir, 'state.json'),
    ORCH_RELAY_URL: '',
    ORCH_TOKEN: '',
  },
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
  // ChatGPT replies are delivered by the phone (through the ChatGPT app): the relay only records them.
  assert.equal(g.replyMode, 'none');
  const manual = await call('POST', '/api/reply', { eventId: g.id, text: 'Add Porto' });
  assert.equal(manual.deliveredVia, 'manual');
  assert.equal(mock.gpt.posted.length, 0, 'the bridge never tries to send to ChatGPT');
  // (Bridge-side sending to ChatGPT is opt-in with "phoneSends": false; by default the phone sends.)

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

  // 6b. Local interactive Claude Code session (transcript tail): a tool-use turn, then an end_turn turn.
  const t1 = transcript('sess-local-1');
  fs.appendFileSync(
    t1,
    ccUser('sess-local-1', '<command-name>/model</command-name>') +
      ccUser('sess-local-1', 'Caveat: The messages below were generated by the user while running local commands.', { isMeta: true }) +
      ccUser('sess-local-1', [{ type: 'text', text: 'Add a health endpoint' }]) +
      ccAsst('sess-local-1', 'm1', [{ type: 'text', text: 'Let me look at the server.' }], 'tool_use') +
      ccAsst('sess-local-1', 'm1', [{ type: 'tool_use', id: 'tu1', name: 'Read', input: {} }], 'tool_use') +
      ccUser('sess-local-1', [{ type: 'tool_result', tool_use_id: 'tu1', content: 'server code' }]) +
      ccAsst('sess-local-1', 'side', [{ type: 'text', text: 'Subagent chatter' }], 'end_turn', { isSidechain: true }) +
      line({ type: 'last-prompt', lastPrompt: 'Add a health endpoint', sessionId: 'sess-local-1' }) +
      ccAsst('sess-local-1', 'm2', [{ type: 'thinking', thinking: '' }], 'end_turn'),
  );
  await sleep(150); // the final message's text block lands in a later write
  fs.appendFileSync(t1, ccAsst('sess-local-1', 'm2', [{ type: 'text', text: 'Added GET /health. Want a test?' }], 'end_turn'));
  // Noise that must not alert: a programmatic run, a subagent transcript, a Remote Control session, a scratchpad cwd.
  fs.writeFileSync(
    transcript('sess-sdk'),
    ccUser('sess-sdk', 'summarize', { entrypoint: 'sdk-cli' }) + ccAsst('sess-sdk', 's1', [{ type: 'text', text: 'Programmatic answer' }], 'end_turn', { entrypoint: 'sdk-cli' }),
  );
  fs.writeFileSync(
    path.join(projDir, 'sess-local-1', 'subagents', 'agent-a1.jsonl'),
    ccUser('sess-local-1', 'sub task') + ccAsst('sess-local-1', 'a1', [{ type: 'text', text: 'Subagent answer' }], 'end_turn'),
  );
  fs.writeFileSync(
    transcript('sess-rc'),
    line({ type: 'bridge-session', sessionId: 'sess-rc', bridgeSessionId: 'cse_1' }) +
      ccUser('sess-rc', 'rc prompt') +
      ccAsst('sess-rc', 'r1', [{ type: 'text', text: 'Remote control answer' }], 'end_turn'),
  );
  fs.writeFileSync(
    path.join(home, '.claude', 'projects', '-tmp', 'sess-tmp.jsonl'),
    ccUser('sess-tmp', 'scratch', { cwd: '/private/tmp/claude-501/x/scratchpad' }) +
      ccAsst('sess-tmp', 't1', [{ type: 'text', text: 'Scratch answer' }], 'end_turn', { cwd: '/private/tmp/claude-501/x/scratchpad' }),
  );
  const l1 = await waitFor(async () => (await events()).find((e) => e.source === 'claude-code-local'), 'claude-local event');
  await sleep(1200);
  const locals = (await call('GET', '/api/events?since=0')).events.filter((e) => e.source === 'claude-code-local');
  assert.equal(locals.length, 1, `exactly one local turn reported, got ${locals.map((e) => e.text).join(' / ')}`);
  assert.equal(l1.sessionId, 'sess-local-1');
  assert.equal(l1.prompt, 'Add a health endpoint');
  assert.equal(l1.text, 'Added GET /health. Want a test?');
  assert.equal(l1.title, 'Set up the repo and explain the layout');
  assert.equal(l1.cwd, '/work/app');
  if (tmuxOk) {
    await call('POST', '/api/reply', { eventId: l1.id, text: 'Yes, add a test\nand update the README' });
    const typed = await waitFor(() => fs.existsSync(tmuxOut) && fs.readFileSync(tmuxOut, 'utf8').includes('README') && fs.readFileSync(tmuxOut, 'utf8'), 'reply typed into tmux pane');
    assert.equal(typed, 'Yes, add a test\nand update the README\n');
  }

  // 6c. Session not running anywhere -> claude -p --resume (clean env, session cwd)
  fs.writeFileSync(transcript('sess-local-2'), ccUser('sess-local-2', 'Write the changelog') + ccAsst('sess-local-2', 'n1', [{ type: 'text', text: 'Changelog written.' }], 'end_turn'));
  const l2 = await waitFor(async () => (await events()).find((e) => e.sessionId === 'sess-local-2'), 'second local event');
  await call('POST', '/api/reply', { eventId: l2.id, text: 'Commit it' });
  const cl = await waitFor(() => fs.existsSync(path.join(dir, 'claude-calls.txt')) && fs.readFileSync(path.join(dir, 'claude-calls.txt'), 'utf8'), 'claude -p resume run');
  assert.match(cl, /\|clean\|sess-local-2\|Commit it/);

  // 6d. Session live in a terminal outside tmux -> undeliverable, handed back to the phone
  fs.writeFileSync(transcript('sess-local-3'), ccUser('sess-local-3', 'Rename the module') + ccAsst('sess-local-3', 'p1', [{ type: 'text', text: 'Renamed.' }], 'end_turn'));
  const l3 = await waitFor(async () => (await events()).find((e) => e.sessionId === 'sess-local-3'), 'third local event');
  await call('POST', '/api/reply', { eventId: l3.id, text: 'Thanks' });
  const l3b = await waitFor(async () => {
    const e = (await events()).find((x) => x.id === l3.id);
    return e?.delivery === 'failed' && e;
  }, 'local session undeliverable');
  assert.match(l3b.deliveryError, /outside tmux/);
  assert.ok(!fs.readFileSync(path.join(dir, 'claude-calls.txt'), 'utf8').includes('sess-local-3'), 'live session never resumed headless');

  console.log('ALL SOURCE TESTS PASSED');
} finally {
  bridge.kill();
  relay.kill();
  svc.close();
  if (tmuxOk) {
    try {
      execFileSync('tmux', ['-S', tmuxSock, 'kill-server']); // only our private test server
    } catch {
      /* already gone */
    }
  }
}
