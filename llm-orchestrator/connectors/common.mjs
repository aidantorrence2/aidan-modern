// Shared config + HTTP helpers for the connectors. No dependencies (Node 18+).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export function loadConfig() {
  let file = {};
  const p = process.env.ORCH_CONFIG || path.join(os.homedir(), '.config', 'llm-orchestrator', 'config.json');
  try {
    file = JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    /* optional */
  }
  const relay = (process.env.ORCH_RELAY_URL || file.relayUrl || '').replace(/\/+$/, '');
  const token = process.env.ORCH_TOKEN || file.token || '';
  const host = process.env.ORCH_HOST || file.host || os.hostname();
  return { relay, token, host, file };
}

export async function api(cfg, method, route, body, timeoutMs = 15000) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await fetch(cfg.relay + route, {
      method,
      signal: ctl.signal,
      headers: { authorization: `Bearer ${cfg.token}`, 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await res.text();
    if (!res.ok) throw new Error(`${method} ${route} -> ${res.status} ${text.slice(0, 200)}`);
    return text ? JSON.parse(text) : {};
  } finally {
    clearTimeout(t);
  }
}

export async function readStdin() {
  const chunks = [];
  for await (const c of process.stdin) chunks.push(c);
  return Buffer.concat(chunks).toString('utf8');
}

/** Generic HTTP helper for the session sources. Returns parsed JSON (or text when not JSON). */
export async function http(url, { method = 'GET', headers = {}, body, timeoutMs = 20000, raw = false } = {}) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method,
      signal: ctl.signal,
      headers,
      body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
    });
    const text = await res.text();
    if (!res.ok) {
      const err = new Error(`${method} ${new URL(url).pathname} -> ${res.status} ${text.slice(0, 200).replace(/\s+/g, ' ')}`);
      err.status = res.status;
      err.body = text;
      throw err;
    }
    if (raw) return text;
    try {
      return text ? JSON.parse(text) : {};
    } catch {
      return text;
    }
  } finally {
    clearTimeout(t);
  }
}

export const BROWSER_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

/** Persistent per-source "what have I already reported" state. */
export function loadState() {
  const p = process.env.ORCH_STATE || path.join(os.homedir(), '.config', 'llm-orchestrator', 'state.json');
  let data = {};
  try {
    data = JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    /* fresh */
  }
  return {
    data,
    for(name) {
      return (data[name] ??= {});
    },
    save() {
      fs.mkdirSync(path.dirname(p), { recursive: true });
      fs.writeFileSync(p + '.tmp', JSON.stringify(data));
      fs.renameSync(p + '.tmp', p);
    },
  };
}

/** Text of a message content field (string or content blocks). */
export function contentText(content) {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return '';
  return content
    .map((b) => (typeof b === 'string' ? b : b && b.type === 'text' && typeof b.text === 'string' ? b.text : ''))
    .filter(Boolean)
    .join('\n');
}
