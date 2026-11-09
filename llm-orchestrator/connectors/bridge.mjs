#!/usr/bin/env node
// Orchestrator bridge: run one on your computer (`node bridge.mjs`, ideally under launchd/systemd/pm2).
//
// It POLLS every place your AI sessions live and reports each finished turn to the relay:
//   claude-sessions  Claude Code cloud sessions + local sessions on Remote Control (CLI login on this machine)
//   claude-local     interactive Claude Code CLI sessions on this machine (~/.claude/projects/*/*.jsonl)
//   codex-files      Codex CLI sessions (~/.codex/sessions/**/rollout-*.jsonl)
//   chatgpt-web      ChatGPT conversations   (config "chatgpt": { "sessionToken" })
//   claude-web       claude.ai chats          (config "claudeWeb": { "sessionKey" })
// and DELIVERS your replies from the phone:
//   Claude Code sessions: posted straight into the session
//   Local Claude Code / Codex: typed into the session's tmux pane (Pulse); if the session isn't running,
//                         claude -p --resume <id> "<reply>" / codex exec resume <id> "<reply>"
//   Claude Code via hook: claude -p --resume <id> "<reply>" (sessions only known through the Stop hook)
//   ChatGPT / claude.ai:  posted into the conversation (if refused, the phone copies it and opens the chat)
import fs from 'node:fs';
import { spawn } from 'node:child_process';
import { loadConfig, loadState, api } from './common.mjs';
import claudeSessionsSource from './sources/claude-sessions.mjs';
import claudeLocalSource from './sources/claude-local.mjs';
import codexFilesSource from './sources/codex-files.mjs';
import chatgptWebSource from './sources/chatgpt-web.mjs';
import claudeWebSource from './sources/claude-web.mjs';
import approvalsSource from './sources/approvals.mjs';

const cfg = loadConfig();
if (!cfg.relay || !cfg.token) {
  console.error('Set ORCH_RELAY_URL and ORCH_TOKEN (or ~/.config/llm-orchestrator/config.json).');
  process.exit(1);
}
const state = loadState();
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);

const sources = [claudeSessionsSource, claudeLocalSource, codexFilesSource, chatgptWebSource, claudeWebSource, approvalsSource]
  .map((make) => {
    try {
      return make(cfg);
    } catch (e) {
      log('[bridge] source init failed:', e.message);
      return null;
    }
  })
  .filter(Boolean);

const DEFAULT_COMMANDS = {
  'claude-code': ['claude', '-p', '--resume', '{session}', '{text}'],
  'claude-code-local': ['claude', '-p', '--resume', '{session}', '{text}'],
  codex: ['codex', 'exec', 'resume', '{session}', '{text}'],
};
const commands = { ...DEFAULT_COMMANDS, ...(cfg.file.commands || {}) };
const senders = new Map(); // relay source name -> source with send()
for (const s of sources) if (s.send) for (const r of s.replies) senders.set(r, s);
const replySources = [...new Set([...Object.keys(commands), ...senders.keys()])];

// ---------------------------------------------------------------- status shown in the app
const status = {};
let statusTimer = null;
function setStatus(name, ok, error = '') {
  const prev = status[name];
  status[name] = { ok, error: error.slice(0, 160), at: Date.now() };
  if (!prev || prev.ok !== ok || prev.error !== status[name].error) {
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => api(cfg, 'POST', '/api/bridge/status', { host: cfg.host, sources: status }).catch(() => {}), 500);
  }
}

// ---------------------------------------------------------------- polling
// Finished turns wait in a persisted outbox until the relay accepts them, so a relay outage or a
// network blip delays a completion instead of losing it (the source has already moved past it).
const OUTBOX_MAX_AGE_MS = 6 * 3600_000;
let flushing = Promise.resolve();
function flushOutbox() {
  flushing = flushing.then(async () => {
    const box = (state.for('_outbox').items ??= []);
    while (box.length) {
      const t = box[0];
      if (Date.now() - t.queuedAt > OUTBOX_MAX_AGE_MS) { box.shift(); state.save(); continue; }
      const { queuedAt, src: name, ...ev } = t;
      await api(cfg, 'POST', '/api/events', ev); // throws: stays queued, retried on the next flush
      box.shift();
      state.save();
      log(`[${name}] ${ev.source} finished: ${ev.title?.slice(0, 60)}`);
    }
  }).catch((e) => { setStatus('relay', false, e.message); });
  return flushing;
}
setInterval(flushOutbox, 15_000);

async function pollLoop(src) {
  let backoff = src.intervalMs;
  for (;;) {
    try {
      const st = state.for(src.name);
      const turns = await src.poll(st);
      if (turns.length) {
        const box = (state.for('_outbox').items ??= []);
        for (const t of turns) box.push({ ...t, host: cfg.host, replyMode: t.replyMode || 'bridge', queuedAt: Date.now(), src: src.name });
      }
      state.save();
      if (turns.length) await flushOutbox();
      setStatus(src.name, true);
      backoff = src.intervalMs;
    } catch (e) {
      setStatus(src.name, false, e.message);
      log(`[${src.name}] ${e.message}`);
      backoff = Math.min(Math.max(backoff * 2, src.intervalMs), 5 * 60_000);
    }
    await new Promise((r) => setTimeout(r, backoff));
  }
}

// ---------------------------------------------------------------- replies
function runCommand(reply) {
  const tpl = commands[reply.source];
  const argv = tpl.map((a) => a.replace('{session}', () => reply.sessionId).replace('{text}', () => reply.text)); // fn: no $& expansion
  const cwd = reply.cwd && fs.existsSync(reply.cwd) ? reply.cwd : process.cwd();
  return new Promise((resolve, reject) => {
    // A leaked CLAUDE*/ANTHROPIC* variable (e.g. CLAUDE_CODE_CHILD_SESSION, an out-of-credit API key)
    // silently changes how a resumed `claude -p` behaves, so the child gets a clean environment.
    const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !/^(CLAUDE|ANTHROPIC)/.test(k)));
    const child = spawn(argv[0], argv.slice(1), { cwd, env: { ...env, ORCH_SKIP_NOTIFY: '1' }, stdio: ['ignore', 'pipe', 'pipe'] });
    let err = '';
    child.stdout.on('data', () => {});
    child.stderr.on('data', (d) => (err += d));
    child.on('error', (e) => reject(e));
    child.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`${argv[0]} exited ${code}: ${err.slice(-300)}`))));
  });
}

async function deliver(reply) {
  log(`[reply] ${reply.source} ${reply.sessionId.slice(0, 16)}: ${reply.text.slice(0, 60)}`);
  try {
    const src = senders.get(reply.source);
    // A source's send() may return false: "not reachable directly, use the command fallback".
    const handled = src ? await src.send(reply, state.for(src.name)) : false;
    if (src) state.save();
    if (handled === false) {
      if (!commands[reply.source]) throw new Error(`No way to deliver to ${reply.source}`);
      await runCommand(reply);
    }
  } catch (e) {
    log(`[reply] failed: ${e.message}`);
    if (reply.eventId) {
      await api(cfg, 'POST', `/api/events/${reply.eventId}/undeliverable`, { error: e.message }).catch(() => {});
    }
  }
  // Delivered or reported undeliverable: either way the relay must not requeue it.
  await api(cfg, 'POST', '/api/bridge/ack', { ids: [reply.id] }).catch(() => {});
}

const queues = new Map(); // sessionId -> promise chain, so replies to one session stay in order
async function replyLoop() {
  for (;;) {
    try {
      const r = await api(
        cfg,
        'GET',
        `/api/bridge/replies?host=${encodeURIComponent(cfg.host)}&sources=${replySources.join(',')}&wait=40`,
        undefined,
        60_000,
      );
      for (const reply of r.replies || []) {
        const next = (queues.get(reply.sessionId) || Promise.resolve()).then(() => deliver(reply));
        queues.set(reply.sessionId, next);
        next.then(() => queues.get(reply.sessionId) === next && queues.delete(reply.sessionId));
      }
      setStatus('relay', true);
    } catch (e) {
      setStatus('relay', false, e.message);
      log('[relay]', e.message);
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
}

log(`[bridge] host=${cfg.host} relay=${cfg.relay}`);
log(`[bridge] polling: ${sources.map((s) => s.name).join(', ') || 'nothing'}; replying to: ${replySources.join(', ')}`);
for (const s of sources) pollLoop(s);
replyLoop();
