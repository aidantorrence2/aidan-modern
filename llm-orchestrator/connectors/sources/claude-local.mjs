// Local interactive Claude Code sessions on this computer (no Remote Control needed).
// Claude Code writes every session to ~/.claude/projects/<project>/<session-id>.jsonl; we tail those
// files and report each finished turn (assistant message that stopped with end_turn, not tool_use).
//
// Reported: sessions started from the interactive CLI (entrypoint "cli"). Skipped: programmatic runs
// (`claude -p` / Agent SDK, entrypoint "sdk-cli"), the desktop app ("claude-desktop"), sessions with
// Remote Control on (a "bridge-session" line — claude-sessions reports those), subagent transcripts
// (<session>/subagents/*.jsonl and isSidechain lines), and tool scratchpad cwds (/tmp/claude-*).
//
// Replies: typed into the session's tmux pane (Pulse hosts sessions on the `pulse` socket); when the
// session isn't running at all, the bridge resumes it with `claude -p --resume <id> "<reply>"`.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { deliverLocal } from '../tmux.mjs';

const SKIP_PROMPT = /^(<command-|<local-command|<system-reminder|<task-notification|<bash-|Caveat:|\[Request interrupted)/;
const SCRATCH_CWD = /^\/(private\/)?tmp\/claude-|^\/(private\/)?var\/folders\//; // tool-launched runs

function claudeDir() {
  return process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude');
}

/** Text of a user message if it is a real prompt the person typed, else ''. */
export function promptText(row) {
  if (row.isSidechain || row.isMeta || row.isCompactSummary || row.isVisibleInTranscriptOnly) return '';
  const c = row.message?.content;
  let t = '';
  if (typeof c === 'string') t = c;
  else if (Array.isArray(c)) {
    if (c.some((b) => b?.type === 'tool_result')) return '';
    t = c
      .filter((b) => b?.type === 'text' && typeof b.text === 'string')
      .map((b) => b.text)
      .join('\n');
  }
  t = t.trim();
  return t && !SKIP_PROMPT.test(t) ? t : '';
}

/**
 * Applies transcript lines to a file's tracked state; returns finished turns [{text, prompt, ts}].
 * A turn's final message can span several lines (one per content block), so it is held in f.pending
 * until a later line (or a quiet period, see seal()) shows it is complete.
 */
export function applyLines(f, lines, opts = {}) {
  const entrypoints = opts.entrypoints || ['cli'];
  const turns = [];
  for (const line of lines) {
    if (!line || line.startsWith('{"type":"api-request')) continue; // big request blobs, never needed
    let row;
    try {
      row = JSON.parse(line);
    } catch {
      continue;
    }
    // Bookkeeping lines (last-prompt, permission-mode, attachments...) can land between the content
    // blocks of one message; only conversation lines prove the final message is complete.
    const conversational = row.type === 'user' || row.type === 'system' || (row.type === 'assistant' && row.message?.id !== f.pending?.msgId);
    if (f.pending && conversational && !row.isSidechain) {
      turns.push(f.pending);
      f.pending = null;
    }
    if (row.sessionId && !f.id) f.id = row.sessionId;
    if (row.isSidechain) continue;
    if (row.cwd) f.cwd = row.cwd;
    if (row.entrypoint) {
      f.entrypoint ??= row.entrypoint;
      if (entrypoints.includes(row.entrypoint)) f.interactive = true;
    }
    switch (row.type) {
      case 'bridge-session':
        f.bridged = true;
        break;
      case 'custom-title':
        if (row.customTitle) f.customTitle = String(row.customTitle);
        break;
      case 'ai-title':
        if (row.aiTitle) f.aiTitle = String(row.aiTitle);
        break;
      case 'summary':
        if (row.summary) f.summary = String(row.summary);
        break;
      case 'user': {
        const t = promptText(row);
        if (t) {
          f.prompt = t;
          f.firstPrompt ??= t;
        }
        // Any user line that isn't a tool result starts a new stretch of assistant output.
        const c = row.message?.content;
        const toolResult = Array.isArray(c) && c.some((b) => b?.type === 'tool_result');
        if (!toolResult && !row.isMeta) {
          f.msgId = null;
          f.text = '';
        }
        break;
      }
      case 'assistant': {
        const m = row.message || {};
        if (m.id !== f.msgId) {
          f.msgId = m.id;
          f.text = '';
        }
        for (const b of m.content || []) {
          if (b?.type === 'text' && b.text) f.text = f.text ? `${f.text}\n${b.text}` : b.text;
        }
        const stop = m.stop_reason;
        if (stop && stop !== 'tool_use') {
          if (m.model === '<synthetic>' && /^No response requested\.?$/.test((f.text || '').trim())) break;
          f.pending = { msgId: m.id, text: f.text || '', prompt: f.prompt || '', ts: row.timestamp || '' };
        }
        break;
      }
    }
  }
  return turns;
}

function title(f) {
  const t = f.customTitle || f.summary || f.aiTitle || (f.firstPrompt || '').replace(/\s+/g, ' ').trim().slice(0, 60);
  return t || path.basename(f.cwd || '') || 'Claude Code';
}

/** Reads complete lines between byte offsets in 8 MB chunks; returns the offset after the last full line. */
function readLines(p, start, end, onLines) {
  const fd = fs.openSync(p, 'r');
  try {
    let pos = start;
    let carry = '';
    let consumed = start;
    const buf = Buffer.alloc(8 * 1024 * 1024);
    while (pos < end) {
      const n = fs.readSync(fd, buf, 0, Math.min(buf.length, end - pos), pos);
      if (n <= 0) break;
      pos += n;
      const chunk = carry + buf.toString('utf8', 0, n);
      const lastNl = chunk.lastIndexOf('\n');
      if (lastNl < 0) {
        carry = chunk;
        continue;
      }
      onLines(chunk.slice(0, lastNl).split('\n'));
      consumed += Buffer.byteLength(chunk.slice(0, lastNl + 1));
      carry = chunk.slice(lastNl + 1);
    }
    return consumed;
  } finally {
    fs.closeSync(fd);
  }
}

function listTranscripts(root, maxAgeMs) {
  const out = [];
  let dirs;
  try {
    dirs = fs.readdirSync(root, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const d of dirs) {
    if (!d.isDirectory()) continue;
    let entries;
    try {
      entries = fs.readdirSync(path.join(root, d.name), { withFileTypes: true });
    } catch {
      continue;
    }
    // Only <project>/<session>.jsonl; subagent transcripts live one level deeper (<session>/subagents/).
    for (const e of entries) {
      if (!e.isFile() || !e.name.endsWith('.jsonl')) continue;
      const p = path.join(root, d.name, e.name);
      try {
        const st = fs.statSync(p);
        if (Date.now() - st.mtimeMs < maxAgeMs) out.push({ path: p, size: st.size, mtimeMs: st.mtimeMs });
      } catch {
        /* vanished */
      }
    }
  }
  return out;
}

/** Live Claude Code processes that registered this session id (~/.claude/sessions/<pid>.json). */
export function sessionPids(sessionId, dir = path.join(claudeDir(), 'sessions')) {
  const pids = [];
  let names = [];
  try {
    names = fs.readdirSync(dir);
  } catch {
    return pids;
  }
  for (const n of names) {
    if (!/^\d+\.json$/.test(n)) continue;
    try {
      const j = JSON.parse(fs.readFileSync(path.join(dir, n), 'utf8'));
      if (j.sessionId === sessionId && j.pid) pids.push(Number(j.pid));
    } catch {
      /* being rewritten */
    }
  }
  return pids;
}

export default function claudeLocalSource(cfg) {
  const c = cfg.file.claudeLocal || {};
  if (c.enabled === false) return null;
  const root = c.projectsDir || path.join(claudeDir(), 'projects');
  const sessionsDir = c.sessionsDir || path.join(claudeDir(), 'sessions');
  const entrypoints = c.entrypoints || ['cli'];
  const settleMs = c.settleMs ?? 2500;
  const maxAgeMs = (c.maxAgeHours || 48) * 3600_000;

  const reportable = (f) => f.interactive && !f.bridged && f.id && !SCRATCH_CWD.test(f.cwd || '');

  return {
    name: 'claude-local',
    replies: ['claude-code-local'],
    intervalMs: c.intervalMs || 3000,

    async poll(state) {
      const files = (state.files ??= {});
      const first = !state.initialized;
      const out = [];
      const seen = new Set();
      for (const { path: p, size, mtimeMs } of listTranscripts(root, maxAgeMs)) {
        seen.add(p);
        let f = files[p];
        if (f && size < f.offset) f = null; // truncated / rewritten
        if (!f) f = files[p] = { offset: 0 };
        // Programmatic / desktop sessions: just keep up with the file, never parse the rest of it.
        if (f.entrypoint && !f.interactive && !entrypoints.includes(f.entrypoint)) {
          f.offset = size;
          continue;
        }
        let turns = [];
        if (size > f.offset) {
          f.offset = readLines(p, f.offset, size, (lines) => turns.push(...applyLines(f, lines, { entrypoints })));
        }
        if (first) {
          // Baseline: existing sessions are remembered, nothing old is reported.
          f.pending = null;
          continue;
        }
        if (f.pending && Date.now() - mtimeMs >= settleMs) {
          turns.push(f.pending);
          f.pending = null;
        }
        // Only the latest finished turn per poll, and only recent ones (a long-idle session resumed
        // after aging out of the scan window is read from the start).
        const t = turns.filter((x) => !x.ts || Date.now() - Date.parse(x.ts) < 30 * 60_000).pop();
        if (!t || !reportable(f)) continue;
        out.push({
          source: 'claude-code-local',
          sessionId: f.id,
          title: title(f),
          cwd: f.cwd || '',
          prompt: t.prompt,
          text: t.text,
        });
      }
      for (const k of Object.keys(files)) if (!seen.has(k)) delete files[k]; // aged out / gone
      state.initialized = true;
      return out;
    },

    async send(reply, state) {
      const f = Object.values(state.files || {}).find((x) => x.id === reply.sessionId);
      return deliverLocal('claude', reply, { pids: sessionPids(reply.sessionId, sessionsDir), cwd: reply.cwd || f?.cwd, tmux: cfg.file.tmux });
    },
  };
}
