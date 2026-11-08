#!/usr/bin/env node
// Codex CLI notify program. Add to ~/.codex/config.toml:
//   notify = ["node", "/ABSOLUTE/PATH/llm-orchestrator/connectors/codex-notify.mjs"]
// Codex calls it with one JSON argument on every "agent-turn-complete". Replies from the phone are
// delivered by bridge.mjs (codex exec resume <thread-id> "<reply>").
import os from 'node:os';
import path from 'node:path';
import { loadConfig, api } from './common.mjs';

const cfg = loadConfig();
if (!cfg.relay || !cfg.token || process.env.ORCH_SKIP_NOTIFY === '1') process.exit(0);

let n;
try {
  n = JSON.parse(process.argv[process.argv.length - 1]);
} catch {
  process.exit(0);
}
if (n.type !== 'agent-turn-complete') process.exit(0);

const sessionId = n['thread-id'] || n['session-id'] || n['conversation-id'];
if (!sessionId) process.exit(0);
const cwd = n.cwd || process.cwd();
const inputs = Array.isArray(n['input-messages']) ? n['input-messages'] : [];
const prompt = inputs[inputs.length - 1] || '';

try {
  await api(cfg, 'POST', '/api/events', {
    source: 'codex',
    sessionId,
    title: `${path.basename(cwd)}${prompt ? ` — ${String(prompt).replace(/\s+/g, ' ').slice(0, 70)}` : ''}`,
    cwd,
    host: cfg.host || os.hostname(),
    prompt,
    text: n['last-assistant-message'] || '',
    replyMode: 'bridge',
  });
} catch (e) {
  process.stderr.write(`[orchestrator] ${e.message}\n`);
}
