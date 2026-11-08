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
