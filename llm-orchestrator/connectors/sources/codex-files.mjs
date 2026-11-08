// Codex CLI sessions. Codex writes every session to ~/.codex/sessions/YYYY/MM/DD/rollout-*.jsonl; we tail
// those files and report each finished turn (event_msg task_complete). Replies run `codex exec resume`.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { contentText } from '../common.mjs';

function walk(dir, out, maxAgeMs) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out, maxAgeMs);
    else if (/^rollout-.*\.jsonl$/.test(e.name)) {
      try {
        const st = fs.statSync(p);
        if (Date.now() - st.mtimeMs < maxAgeMs) out.push({ path: p, size: st.size });
      } catch {
        /* vanished */
      }
    }
  }
  return out;
}

/** Applies new JSONL lines to a file's tracked state; returns finished turns. */
export function applyLines(f, lines) {
  const turns = [];
  for (const line of lines) {
    let row;
    try {
      row = JSON.parse(line);
    } catch {
      continue;
    }
    const p = row.payload || {};
    if (row.type === 'session_meta') {
      f.id = p.id || f.id;
      f.cwd = p.cwd || f.cwd;
    } else if (row.type === 'turn_context' && p.cwd) {
      f.cwd = p.cwd;
    } else if (row.type === 'event_msg' && p.type === 'user_message') {
      f.prompt = String(p.message || '');
      f.lastAssistant = '';
    } else if (row.type === 'response_item' && p.type === 'message' && p.role === 'assistant') {
      const t = contentText((p.content || []).map((b) => (b.type === 'output_text' ? { type: 'text', text: b.text } : b)));
      if (t) f.lastAssistant = t;
    } else if (row.type === 'event_msg' && p.type === 'agent_message' && p.message) {
      f.lastAssistant = String(p.message);
    } else if (row.type === 'event_msg' && p.type === 'task_complete') {
      turns.push({ text: p.last_agent_message || f.lastAssistant || '', prompt: f.prompt || '' });
    }
  }
  return turns;
}

export default function codexFilesSource(cfg) {
  const c = cfg.file.codex || {};
  if (c.enabled === false) return null;
  const root = c.sessionsDir || path.join(process.env.CODEX_HOME || path.join(os.homedir(), '.codex'), 'sessions');

  return {
    name: 'codex-files',
    replies: ['codex'],
    intervalMs: c.intervalMs || 3000,

    async poll(state) {
      const files = (state.files ??= {});
      const first = !state.initialized;
      const out = [];
      for (const { path: p, size } of walk(root, [], 3 * 86400_000)) {
        let f = files[p];
        if (!f) {
          // On the very first scan, existing files are a baseline: remember metadata, report nothing old.
          f = files[p] = { offset: 0 };
          if (first) {
            applyLines(f, fs.readFileSync(p, 'utf8').split('\n'));
            f.offset = size;
            continue;
          }
        }
        if (size <= f.offset) {
          if (size < f.offset) f.offset = 0; // truncated / rewritten
          continue;
        }
        const fd = fs.openSync(p, 'r');
        const buf = Buffer.alloc(size - f.offset);
        fs.readSync(fd, buf, 0, buf.length, f.offset);
        fs.closeSync(fd);
        const chunk = buf.toString('utf8');
        const lastNl = chunk.lastIndexOf('\n');
        if (lastNl < 0) continue; // partial line, wait for the rest
        f.offset += Buffer.byteLength(chunk.slice(0, lastNl + 1));
        for (const t of applyLines(f, chunk.slice(0, lastNl).split('\n'))) {
          if (!f.id) continue;
          out.push({
            source: 'codex',
            sessionId: f.id,
            title: `${path.basename(f.cwd || '') || 'codex'}${t.prompt ? ` — ${t.prompt.replace(/\s+/g, ' ').slice(0, 70)}` : ''}`,
            cwd: f.cwd || '',
            prompt: t.prompt,
            text: t.text,
          });
        }
      }
      // forget files that aged out
      for (const k of Object.keys(files)) if (!fs.existsSync(k)) delete files[k];
      state.initialized = true;
      return out;
    },
    // Replies go through the bridge's command runner (codex exec resume); the new turn is picked up from the file.
  };
}
