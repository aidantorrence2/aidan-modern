// Drafts the user's next message to an LLM session, using Claude.
// Returns { primary, alternatives[] }. Falls back to canned replies when no API key is configured
// or the call fails, so the app always has something to show.
import Anthropic from '@anthropic-ai/sdk';

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

Also give up to 3 short alternative replies (each under 12 words) that cover clearly different intents (for example: "Ship it", "Explain first", "Stop here").`;

const SCHEMA = {
  type: 'object',
  properties: {
    primary: { type: 'string', description: 'The most likely reply, ready to send.' },
    alternatives: { type: 'array', items: { type: 'string' }, description: 'Up to 3 short alternative replies.' },
  },
  required: ['primary', 'alternatives'],
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
    alternatives: ['Continue.', 'Explain what you changed first.', 'Stop here, thanks.'],
    model: null,
  };
}

function clip(s, n) {
  if (!s) return '';
  return s.length > n ? `${s.slice(0, n / 2)}\n…[truncated]…\n${s.slice(-n / 2)}` : s;
}

export async function suggestReply(event, tasks = [], hint = '') {
  const c = getClient();
  if (!c) return fallbackSuggestion(event);

  const topTasks = tasks
    .filter((t) => !t.done)
    .sort((a, b) => (a.priority ?? 9) - (b.priority ?? 9))
    .slice(0, 6)
    .map((t, i) => `${i + 1}. [P${t.priority ?? '?'}] ${t.title}${t.notes ? ` — ${t.notes}` : ''}`)
    .join('\n');

  const userContent = [
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
      messages: [{ role: 'user', content: userContent }],
    });
    if (response.stop_reason === 'refusal') return fallbackSuggestion(event);
    const textBlock = response.content.find((b) => b.type === 'text');
    if (!textBlock) return fallbackSuggestion(event);
    const parsed = JSON.parse(textBlock.text);
    return {
      primary: String(parsed.primary || '').trim(),
      alternatives: (parsed.alternatives || []).map(String).slice(0, 3),
      model: response.model,
    };
  } catch (err) {
    if (err instanceof Anthropic.APIError) {
      console.error(`[suggest] API error ${err.status}: ${err.message}`);
    } else {
      console.error('[suggest] failed:', err?.message || err);
    }
    return fallbackSuggestion(event);
  }
}
