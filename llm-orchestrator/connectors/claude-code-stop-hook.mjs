#!/usr/bin/env node
// Claude Code "Stop" hook: reports each finished turn to the orchestrator relay, then waits for a reply
// from the phone. If one arrives, it returns {"decision":"block","reason":...}, which makes Claude keep
// working with the reply as its next instruction. Works the same in local and cloud (claude.ai/code) sessions.
//
// Env / ~/.config/llm-orchestrator/config.json:
//   ORCH_RELAY_URL, ORCH_TOKEN   required; the hook is a silent no-op without them
//   ORCH_WAIT_SECONDS            how long to wait for a reply (default 600). 0 = report only; the bridge
//                                daemon will resume the session later if you reply.
// Keep the hook's "timeout" in settings.json larger than ORCH_WAIT_SECONDS.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { loadConfig, api, readStdin } from './common.mjs';

const cfg = loadConfig();
if (!cfg.relay || !cfg.token) process.exit(0);

const waitSeconds = Number(process.env.ORCH_WAIT_SECONDS ?? cfg.file.waitSeconds ?? 600);

function textOf(content) {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return '';
  return content
    .filter((b) => b && b.type === 'text' && typeof b.text === 'string')
    .map((b) => b.text)
    .join('\n');
}

// Walk the JSONL transcript backwards: last assistant text of this turn + the user prompt that started it.
function readTranscript(file) {
  const out = { assistant: '', prompt: '' };
  if (!file) return out;
  let lines;
  try {
    lines = fs.readFileSync(file, 'utf8').trim().split('\n');
  } catch {
    return out;
  }
  const assistantParts = [];
  for (let i = lines.length - 1; i >= 0; i--) {
    let row;
    try {
      row = JSON.parse(lines[i]);
    } catch {
      continue;
    }
    if (row.isSidechain) continue;
    const msg = row.message;
    if (row.type === 'assistant' && msg) {
      const t = textOf(msg.content);
      if (t.trim()) assistantParts.unshift(t);
    } else if (row.type === 'user' && msg && !row.isMeta) {
      // tool results are "user" rows too; a real prompt has text content
      const isPrompt =
        typeof msg.content === 'string' || (Array.isArray(msg.content) && msg.content.some((b) => b && b.type === 'text'));
      const t = textOf(msg.content);
      if (isPrompt && t.trim()) {
        out.prompt = t;
        break;
      }
    }
  }
  // The final message of the turn is what matters most; keep the tail of the turn's narration.
  out.assistant = assistantParts.slice(-3).join('\n\n');
  return out;
}

function gitBranch(cwd) {
  try {
    return execFileSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd, stdio: ['ignore', 'pipe', 'ignore'], timeout: 2000 })
      .toString()
      .trim();
  } catch {
    return '';
  }
}

const input = JSON.parse((await readStdin()) || '{}');
const sessionId = input.session_id;
if (!sessionId) process.exit(0);

const cwd = input.cwd || process.cwd();
const tr = readTranscript(input.transcript_path);
const text = input.last_assistant_message || tr.assistant;
const remote = process.env.CLAUDE_CODE_REMOTE === 'true' || process.env.CLAUDE_CODE_REMOTE === '1';
const remoteId = process.env.CLAUDE_CODE_REMOTE_SESSION_ID || '';
const branch = gitBranch(cwd);
const title = [path.basename(cwd), branch].filter(Boolean).join(' @ ') + (tr.prompt ? ` — ${tr.prompt.replace(/\s+/g, ' ').slice(0, 70)}` : '');

try {
  await api(cfg, 'POST', '/api/events', {
    source: remote ? 'claude-code-cloud' : 'claude-code',
    sessionId,
    title,
    cwd,
    host: remote ? '' : cfg.host,
    prompt: tr.prompt,
    text,
    url: remote && remoteId ? `https://claude.ai/code/${remoteId}` : '',
    replyMode: waitSeconds > 0 ? 'hook' : remote ? 'none' : 'bridge',
  });
} catch (e) {
  process.stderr.write(`[orchestrator] could not reach relay: ${e.message}\n`);
  process.exit(0);
}

if (waitSeconds <= 0) process.exit(0);

const deadline = Date.now() + waitSeconds * 1000;
let reply = null;
while (!reply && Date.now() < deadline) {
  const chunk = Math.min(45, Math.ceil((deadline - Date.now()) / 1000));
  try {
    const r = await api(cfg, 'GET', `/api/replies?sessionId=${encodeURIComponent(sessionId)}&wait=${chunk}`, undefined, (chunk + 15) * 1000);
    reply = r.reply;
  } catch {
    await new Promise((r) => setTimeout(r, 3000));
  }
}

if (!reply) {
  await api(cfg, 'POST', `/api/sessions/${encodeURIComponent(sessionId)}/release`).catch(() => {});
  process.exit(0);
}

process.stdout.write(
  JSON.stringify({
    decision: 'block',
    reason: `The user replied from their phone (LLM Orchestrator). Treat this as their next message and act on it:\n\n${reply.text}`,
  }),
);
process.exit(0);
