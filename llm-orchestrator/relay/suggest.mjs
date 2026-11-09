// Drafts the user's next message to an LLM session, using Claude.
// Returns { primary, title, did, needs } (alternatives kept empty for older clients). Falls back to canned replies when no API key is configured
// or the call fails, so the app always has something to show.
import Anthropic from '@anthropic-ai/sdk';
import { execFile } from 'node:child_process';
import os from 'node:os';
import fs from 'node:fs';

// Draft backend: "api" (Anthropic SDK, needs ANTHROPIC_API_KEY with credits), "cli" (`claude -p` on the
// Claude subscription; needs the Claude Code CLI signed in on this machine), or "auto" (cli when the CLI is
// configured via ORCH_CLAUDE_BIN or found on PATH and no API key is set, else api, else canned).
const BACKEND = process.env.ORCH_SUGGEST || 'auto';
const CLI_BIN = process.env.ORCH_CLAUDE_BIN || 'claude';
const CLI_MODEL = process.env.ORCH_CLI_MODEL || 'haiku';

const MODEL = process.env.ORCH_MODEL || 'claude-opus-5-5';
const EFFORT = process.env.ORCH_EFFORT || 'low';

let client = null;
function getClient() {
  if (client) return client;
  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) return null;
  client = new Anthropic({ maxRetries: 2, timeout: 60_000 });
  return client;
}

const SYSTEM = `You are the user's co-pilot inside an "LLM orchestrator" app. The user runs many AI sessions at once (Claude Code local and cloud sessions, Codex, ChatGPT, the Claude app). When one of those sessions finishes a turn, you draft the message the user will most likely send back, so they can just tap Submit.

How to draft:
- Write in the user's voice, addressed to the agent. Short and direct, like a busy engineer: usually 1-3 sentences.
- If the agent asked a question or offered options, answer it decisively (pick the sensible default).
- If the agent finished the work, tell it the concrete next step (verify, commit and push, open a PR, move on to the next item), or acknowledge and close out if nothing is left.
- If the agent hit an error or is blocked, tell it how to unblock or what to try next.
- Use the user's top tasks to steer toward what matters most, but never invent facts about the codebase.
- Never include preamble, quotes, or explanations: only the message text itself.
- Keep the reply SHORT: one sentence, at most 12 words.

Also summarize the turn for a tiny inbox card:
- "title": 2-5 words naming the work, shorthand welcome (LRC, PR, deps, auth, iOS, cfg, CI, w/, &). No punctuation at the end.
- "did": at most 8 words, what the agent did or found. Past tense, no filler ("Fixed null check in auth; tests pass").
- "needs": at most 6 words, what it needs from the user ("Approve push to main", "Pick option A or B", "Nothing — done").`;

const SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string', description: '2-5 word shorthand title.' },
    did: { type: 'string', description: 'One line: what the agent did.' },
    needs: { type: 'string', description: 'One line: what it needs from the user.' },
    primary: { type: 'string', description: 'The most likely reply, ready to send. One short sentence.' },
  },
  required: ['title', 'did', 'needs', 'primary'],
  additionalProperties: false,
};

export function fallbackSuggestion(event) {
  const text = (event?.text || '').toLowerCase();
  let primary = 'Looks good. Verify it builds and the tests pass, then commit and push.';
  if (/\?\s*$/.test((event?.text || '').trim()) || /should i|would you like|do you want|which option/.test(text)) {
    primary = 'Yes, go with your recommended option and continue.';
  } else if (/error|failed|failing|exception|blocked|cannot|can't/.test(text)) {
    primary = 'Investigate the root cause of that error, fix it, and re-run to confirm.';
  }
  return {
    primary,
    alternatives: [],
    title: '',
    did: '',
    needs: '',
    model: null,
  };
}

function clip(s, n) {
  if (!s) return '';
  return s.length > n ? `${s.slice(0, n / 2)}\n…[truncated]…\n${s.slice(-n / 2)}` : s;
}

function cliAvailable() {
  if (process.env.ORCH_CLAUDE_BIN) return true;
  return (process.env.PATH || '').split(':').some((d) => d && fsExists(`${d}/${CLI_BIN}`));
}
function fsExists(p) {
  try {
    return fs.existsSync(p);
  } catch {
    return false;
  }
}

/** Runs `claude -p` with a clean environment (leaked CLAUDE_ and ANTHROPIC_ env vars break child sessions). */
function runCli(system, prompt) {
  const env = {};
  for (const [k, v] of Object.entries(process.env)) if (!/^(CLAUDE|ANTHROPIC)/.test(k)) env[k] = v;
  return new Promise((resolve, reject) => {
    const child = execFile(
      CLI_BIN,
      ['-p', '--output-format', 'json', '--model', CLI_MODEL, '--max-turns', '1', '--tools', '', '--system-prompt', system, prompt],
      { env, cwd: os.tmpdir(), timeout: 90_000, maxBuffer: 4_000_000 },
      (err, stdout, stderr) => {
        if (err) return reject(new Error(`${err.message} ${String(stderr).slice(-300)}`));
        try {
          const out = JSON.parse(stdout);
          if (out.is_error) return reject(new Error(String(out.result).slice(0, 300)));
          resolve(String(out.result || ''));
        } catch (e) {
          reject(new Error(`bad CLI output: ${String(stdout).slice(0, 200)}`));
        }
      },
    );
    child.on('error', reject);
  });
}

function parseJsonLoose(text) {
  const t = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
  const start = t.indexOf('{');
  const end = t.lastIndexOf('}');
  return JSON.parse(start >= 0 ? t.slice(start, end + 1) : t);
}

function buildUserContent(event, tasks, hint) {
  const topTasks = tasks
    .filter((t) => !t.done)
    .sort((a, b) => (a.priority ?? 9) - (b.priority ?? 9))
    .slice(0, 6)
    .map((t, i) => `${i + 1}. [P${t.priority ?? '?'}] ${t.title}${t.notes ? ` — ${t.notes}` : ''}`)
    .join('\n');
  return [
    `Session source: ${event.source}`,
    `Session: ${event.title || event.sessionId}${event.cwd ? ` (cwd: ${event.cwd})` : ''}`,
    topTasks ? `User's top tasks:\n${topTasks}` : 'User has no open tasks listed.',
    event.prompt ? `The user's last message to this session:\n<last_user_message>\n${clip(event.prompt, 4000)}\n</last_user_message>` : '',
    `The session's latest response:\n<agent_response>\n${clip(event.text, 24000)}\n</agent_response>`,
    hint ? `The user wants the reply to go in this direction: ${hint}` : '',
    'Draft the reply.',
  ]
    .filter(Boolean)
    .join('\n\n');
}

function normalize(parsed, model) {
  const line = (v, n) => String(v || '').replace(/\s+/g, ' ').trim().slice(0, n);
  return {
    primary: String(parsed.primary || '').trim(),
    alternatives: [],
    title: line(parsed.title, 48),
    did: line(parsed.did, 120),
    needs: line(parsed.needs, 100),
    model,
  };
}

async function suggestViaCli(event, tasks, hint) {
  const system = `${SYSTEM}\n\nRespond with ONLY a JSON object of the form {"title": string, "did": string, "needs": string, "primary": string} and nothing else.`;
  try {
    const out = await runCli(system, buildUserContent(event, tasks, hint));
    const r = normalize(parseJsonLoose(out), `cli:${CLI_MODEL}`);
    if (!r.primary) throw new Error('empty primary');
    return r;
  } catch (err) {
    console.error('[suggest] cli failed:', err?.message || err);
    return fallbackSuggestion(event);
  }
}

// In auto mode, an API key that is out of credit or rejected switches drafting
// to `claude -p` for the rest of the process instead of serving canned replies.
let apiUnusable = false;
function isAccountError(err) {
  return err.status === 401 || err.status === 403 ||
    (err.status === 400 && /credit balance|billing/i.test(err.message || ''));
}

// DeepSeek (OpenAI-compatible) for hosts without a Claude subscription CLI, e.g. a small always-on server.
const DEEPSEEK_MODEL = process.env.ORCH_DEEPSEEK_MODEL || 'deepseek-v4-flash';
async function suggestViaDeepSeek(event, tasks, hint) {
  try {
    const ctl = AbortSignal.timeout(45_000);
    const r = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      signal: ctl,
      headers: { authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        max_tokens: 600,
        thinking: { type: 'disabled' }, // v4-flash reasons by default and can spend every token on it
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM + '\n\nRespond with ONLY a JSON object of the form {"title": string, "did": string, "needs": string, "primary": string}.' },
          { role: 'user', content: buildUserContent(event, tasks, hint) },
        ],
      }),
    });
    if (!r.ok) throw new Error(`DeepSeek ${r.status}: ${(await r.text()).slice(0, 200)}`);
    const d = await r.json();
    return normalize(parseJsonLoose(d.choices?.[0]?.message?.content || ''), `deepseek:${DEEPSEEK_MODEL}`);
  } catch (err) {
    console.error('[suggest] deepseek failed:', err?.message || err);
    return fallbackSuggestion(event);
  }
}

export async function suggestReply(event, tasks = [], hint = '') {
  if (BACKEND === 'deepseek' || (BACKEND === 'auto' && process.env.DEEPSEEK_API_KEY && !process.env.ANTHROPIC_API_KEY && !cliAvailable())) {
    return suggestViaDeepSeek(event, tasks, hint);
  }
  const useCli =
    BACKEND === 'cli' ||
    (BACKEND === 'auto' && (apiUnusable || (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN)) && cliAvailable());
  if (useCli) return suggestViaCli(event, tasks, hint);
  const c = getClient();
  if (!c) return fallbackSuggestion(event);
  try {
    const response = await c.beta.messages.create({
      model: MODEL,
      max_tokens: 2000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: {
        effort: EFFORT,
        format: { type: 'json_schema', schema: SCHEMA },
      },
      system: SYSTEM,
      messages: [{ role: 'user', content: buildUserContent(event, tasks, hint) }],
    });
    if (response.stop_reason === 'refusal') return fallbackSuggestion(event);
    const textBlock = response.content.find((b) => b.type === 'text');
    if (!textBlock) return fallbackSuggestion(event);
    return normalize(JSON.parse(textBlock.text), response.model);
  } catch (err) {
    if (err instanceof Anthropic.APIError) {
      console.error(`[suggest] API error ${err.status}: ${err.message}`);
      if (BACKEND === 'auto' && isAccountError(err) && cliAvailable()) {
        apiUnusable = true;
        console.error('[suggest] API key unusable; drafting with claude -p from now on');
        return suggestViaCli(event, tasks, hint);
      }
    } else {
      console.error('[suggest] failed:', err?.message || err);
    }
    return fallbackSuggestion(event);
  }
}
