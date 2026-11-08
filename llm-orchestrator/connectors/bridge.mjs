#!/usr/bin/env node
// Orchestrator bridge: run one on your computer (`node bridge.mjs`, ideally under launchd/systemd/pm2).
//
// It POLLS every place your AI sessions live and reports each finished turn to the relay:
//   claude-sessions  Claude Code cloud sessions + local sessions on Remote Control (CLI login on this machine)
//   codex-files      Codex CLI sessions (~/.codex/sessions/**/rollout-*.jsonl)
//   chatgpt-web      ChatGPT conversations   (config "chatgpt": { "sessionToken" })
//   claude-web       claude.ai chats          (config "claudeWeb": { "sessionKey" })
// and DELIVERS your replies from the phone:
//   Claude Code sessions: posted straight into the session
//   Codex:                codex exec resume <id> "<reply>"
//   Claude Code via hook: claude -p --resume <id> "<reply>" (sessions only known through the Stop hook)
//   ChatGPT / claude.ai:  posted into the conversation (if refused, the phone copies it and opens the chat)
import fs from 'node:fs';
import { spawn } from 'node:child_process';
import { loadConfig, loadState, api } from './common.mjs';
import claudeSessionsSource from './sources/claude-sessions.mjs';
import codexFilesSource from './sources/codex-files.mjs';
import chatgptWebSource from './sources/chatgpt-web.mjs';
import claudeWebSource from './sources/claude-web.mjs';

const cfg = loadConfig();
if (!cfg.relay || !cfg.token) {
  console.error('Set ORCH_RELAY_URL and ORCH_TOKEN (or ~/.config/llm-orchestrator/config.json).');
  process.exit(1);
}
const state = loadState();
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);

const sources = [claudeSessionsSource, codexFilesSource, chatgptWebSource, claudeWebSource]
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
async function pollLoop(src) {
  let backoff = src.intervalMs;
  for (;;) {
    try {
      const st = state.for(src.name);
      const turns = await src.poll(st);
      state.save();
      for (const t of turns) {
        await api(cfg, 'POST', '/api/events', { ...t, host: cfg.host, replyMode: 'bridge' });
        log(`[${src.name}] ${t.source} finished: ${t.title?.slice(0, 60)}`);
      }
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
  const argv = tpl.map((a) => a.replace('{session}', reply.sessionId).replace('{text}', reply.text));
  const cwd = reply.cwd && fs.existsSync(reply.cwd) ? reply.cwd : process.cwd();
  return new Promise((resolve, reject) => {
    const child = spawn(argv[0], argv.slice(1), { cwd, env: { ...process.env, ORCH_SKIP_NOTIFY: '1' }, stdio: ['ignore', 'pipe', 'pipe'] });
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
    if (src) {
      await src.send(reply, state.for(src.name));
      state.save();
    } else {
      await runCommand(reply);
    }
  } catch (e) {
    log(`[reply] failed: ${e.message}`);
    if (reply.eventId) {
      await api(cfg, 'POST', `/api/events/${reply.eventId}/undeliverable`, { error: e.message }).catch(() => {});
    }
  }
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
