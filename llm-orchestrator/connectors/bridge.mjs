#!/usr/bin/env node
// Local bridge daemon. Run it on each computer where you use Claude Code / Codex:
//   node bridge.mjs
// It long-polls the relay for phone replies addressed to sessions on this machine that no Stop hook is
// waiting on, and resumes those sessions headlessly in their working directory:
//   claude-code: claude -p --resume <session-id> "<reply>"   (its Stop hook reports the result)
//   codex:       codex exec resume <thread-id> "<reply>"     (the bridge reports the final message)
// Command templates can be overridden in ~/.config/llm-orchestrator/config.json:
//   "commands": { "codex": ["codex", "exec", "resume", "{session}", "{text}"] }
import fs from 'node:fs';
import { spawn } from 'node:child_process';
import { loadConfig, api } from './common.mjs';

const cfg = loadConfig();
if (!cfg.relay || !cfg.token) {
  console.error('Set ORCH_RELAY_URL and ORCH_TOKEN (or ~/.config/llm-orchestrator/config.json).');
  process.exit(1);
}

const DEFAULT_COMMANDS = {
  'claude-code': ['claude', '-p', '--resume', '{session}', '{text}'],
  codex: ['codex', 'exec', 'resume', '{session}', '{text}'],
};
const commands = { ...DEFAULT_COMMANDS, ...(cfg.file.commands || {}) };
const sources = Object.keys(commands);
const queues = new Map(); // sessionId -> promise chain, so replies to one session run in order

function run(reply) {
  const tpl = commands[reply.source];
  const argv = tpl.map((a) => a.replace('{session}', reply.sessionId).replace('{text}', reply.text));
  const cwd = reply.cwd && fs.existsSync(reply.cwd) ? reply.cwd : process.cwd();
  console.log(`[bridge] ${reply.source} ${reply.sessionId.slice(0, 8)} in ${cwd}: ${reply.text.slice(0, 80)}`);
  return new Promise((resolve) => {
    const child = spawn(argv[0], argv.slice(1), {
      cwd,
      env: { ...process.env, ORCH_SKIP_NOTIFY: '1' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let out = '';
    let err = '';
    child.stdout.on('data', (d) => (out += d));
    child.stderr.on('data', (d) => (err += d));
    child.on('error', (e) => {
      err += e.message;
    });
    child.on('close', async (code) => {
      console.log(`[bridge] ${reply.sessionId.slice(0, 8)} exited ${code}`);
      // Claude Code reports its own result through the Stop hook. Codex (and failures) are reported here.
      if (reply.source !== 'claude-code' || code !== 0) {
        const text = code === 0 ? out.trim() : `Bridge failed to resume this session (exit ${code}).\n\n${(err || out).slice(-4000)}`;
        await api(cfg, 'POST', '/api/events', {
          source: reply.source,
          sessionId: reply.sessionId,
          title: reply.title,
          cwd: reply.cwd,
          host: cfg.host,
          prompt: reply.text,
          text,
          replyMode: 'bridge',
        }).catch((e) => console.error('[bridge] report failed:', e.message));
      }
      resolve();
    });
  });
}

console.log(`[bridge] host=${cfg.host} relay=${cfg.relay} sources=${sources.join(',')}`);
for (;;) {
  try {
    const r = await api(
      cfg,
      'GET',
      `/api/bridge/replies?host=${encodeURIComponent(cfg.host)}&sources=${sources.join(',')}&wait=40`,
      undefined,
      60_000,
    );
    for (const reply of r.replies || []) {
      const prev = queues.get(reply.sessionId) || Promise.resolve();
      const next = prev.then(() => run(reply));
      queues.set(reply.sessionId, next);
      next.then(() => {
        if (queues.get(reply.sessionId) === next) queues.delete(reply.sessionId);
      });
    }
  } catch (e) {
    console.error('[bridge]', e.message);
    await new Promise((r) => setTimeout(r, 5000));
  }
}
