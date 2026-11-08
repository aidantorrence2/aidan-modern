// End-to-end test: relay + Claude Code Stop hook + bridge claim, using a fake transcript.
// Runs without an Anthropic key (suggestions fall back to canned replies).
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'orch-test-'));
const PORT = 18000 + Math.floor(Math.random() * 1000);
const TOKEN = 'test-token';
const base = `http://127.0.0.1:${PORT}`;
const here = path.dirname(new URL(import.meta.url).pathname);
const env = { ...process.env, PORT: String(PORT), ORCH_TOKEN: TOKEN, ORCH_DATA: path.join(dir, 'data.json'), ANTHROPIC_API_KEY: '', ANTHROPIC_AUTH_TOKEN: '', ORCH_SUGGEST: 'api' };

const server = spawn(process.execPath, [path.join(here, 'server.mjs')], { env, stdio: ['ignore', 'pipe', 'inherit'] });
await new Promise((r) => server.stdout.once('data', r));

const call = async (method, route, body) => {
  const res = await fetch(base + route, {
    method,
    headers: { authorization: `Bearer ${TOKEN}`, 'content-type': 'application/json' },
    body: body && JSON.stringify(body),
  });
  return { status: res.status, body: await res.json().catch(() => null) };
};

try {
  assert.equal((await fetch(base + '/api/events')).status, 401, 'auth required');

  // Fake transcript
  const transcript = path.join(dir, 't.jsonl');
  fs.writeFileSync(
    transcript,
    [
      { type: 'user', message: { role: 'user', content: 'Fix the login bug' } },
      { type: 'assistant', message: { role: 'assistant', content: [{ type: 'text', text: 'Fixed it. Should I also add a test?' }] } },
    ]
      .map((x) => JSON.stringify(x))
      .join('\n'),
  );

  // Run the hook; it should post an event then wait for our reply.
  const hook = spawn(process.execPath, [path.join(here, '..', 'connectors', 'claude-code-stop-hook.mjs')], {
    env: { ...env, ORCH_RELAY_URL: base, ORCH_WAIT_SECONDS: '20', CLAUDE_CODE_REMOTE: '' },
    stdio: ['pipe', 'pipe', 'inherit'],
  });
  hook.stdin.end(JSON.stringify({ session_id: 'sess-1', transcript_path: transcript, cwd: dir, hook_event_name: 'Stop' }));
  let hookOut = '';
  hook.stdout.on('data', (d) => (hookOut += d));

  // App sees the event
  let ev;
  for (let i = 0; i < 50 && !ev?.suggestion; i++) {
    const r = await call('GET', '/api/events?since=0');
    ev = r.body.events.find((e) => e.sessionId === 'sess-1');
    if (!ev?.suggestion) await new Promise((r) => setTimeout(r, 100));
  }
  assert.ok(ev, 'event posted');
  assert.equal(ev.source, 'claude-code');
  assert.equal(ev.prompt, 'Fix the login bug');
  assert.match(ev.text, /add a test/);
  assert.ok(ev.suggestion?.primary, 'suggestion attached');
  console.log('suggestion:', ev.suggestion.primary);

  // Wait until the hook is listening, then reply
  await new Promise((r) => setTimeout(r, 500));
  const rep = await call('POST', '/api/reply', { eventId: ev.id, text: 'Yes, add a test.' });
  assert.equal(rep.body.deliveredVia, 'hook');
  const code = await new Promise((r) => hook.on('close', r));
  assert.equal(code, 0);
  const out = JSON.parse(hookOut);
  assert.equal(out.decision, 'block');
  assert.match(out.reason, /Yes, add a test\./);

  // Delivered status visible to the app
  const after = (await call('GET', '/api/events?since=0')).body.events.find((e) => e.id === ev.id);
  assert.equal(after.status, 'replied');
  assert.equal(after.delivery, 'hook');

  // Bridge path: codex session with no hook
  await call('POST', '/api/events', { source: 'codex', sessionId: 'thr-9', host: 'box', text: 'Done.', replyMode: 'bridge', suggest: false });
  await call('POST', '/api/reply', { sessionId: 'thr-9', text: 'Now push it.' });
  const br = await call('GET', '/api/bridge/replies?host=box&sources=codex&wait=2');
  assert.equal(br.body.replies.length, 1);
  assert.equal(br.body.replies[0].text, 'Now push it.');
  const other = await call('POST', '/api/reply', { sessionId: 'thr-9', text: 'x' });
  assert.equal(other.status, 200);
  const wrongHost = await call('GET', '/api/bridge/replies?host=other&sources=codex&wait=1');
  assert.equal(wrongHost.body.replies.length, 0, 'other hosts do not steal replies');

  // Tasks round-trip + long-poll wakeup
  const { seq } = (await call('GET', '/api/events?since=0')).body;
  const pending = call('GET', `/api/events?since=${seq}&wait=10`);
  await call('PUT', '/api/tasks', { tasks: [{ id: 'a', title: 'Ship orchestrator', priority: 1, done: false }] });
  const woke = await pending;
  assert.equal(woke.body.tasks[0].title, 'Ship orchestrator');

  console.log('ALL TESTS PASSED');
} finally {
  server.kill();
}
