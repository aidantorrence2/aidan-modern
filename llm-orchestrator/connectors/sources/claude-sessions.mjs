// Claude Code sessions (claude.ai/code cloud sessions + local CLI sessions connected with Remote Control).
// Polls the same sessions API the Claude Code CLI uses, signed in with the CLI's own login on this computer,
// and replies by posting a user message straight into the session. No hooks and no waiting needed.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { http, contentText } from '../common.mjs';

const BETA = 'ccr-byoc-2025-07-29';
const CLIENT_ID = '9d1c250a-e61b-44d9-88ed-5944d1962f5e';
const TOKEN_URL = 'https://platform.claude.com/v1/oauth/token';
const KEYCHAIN_SERVICE = 'Claude Code-credentials';

function claudeDir() {
  return process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude');
}

// ---------------------------------------------------------------- credentials

/** Reads the CLI's OAuth login: ~/.claude/.credentials.json, or the macOS keychain. */
export function readCliCredentials() {
  const file = path.join(claudeDir(), '.credentials.json');
  try {
    return { where: 'file', file, json: JSON.parse(fs.readFileSync(file, 'utf8')) };
  } catch {
    /* fall through */
  }
  if (process.platform === 'darwin') {
    try {
      const out = execFileSync('security', ['find-generic-password', '-s', KEYCHAIN_SERVICE, '-w'], {
        stdio: ['ignore', 'pipe', 'ignore'],
      }).toString();
      return { where: 'keychain', json: JSON.parse(out) };
    } catch {
      /* not logged in */
    }
  }
  return null;
}

function writeCliCredentials(creds) {
  const data = JSON.stringify(creds.json);
  if (creds.where === 'file') {
    fs.writeFileSync(creds.file + '.tmp', data, { mode: 0o600 });
    fs.renameSync(creds.file + '.tmp', creds.file);
  } else if (creds.where === 'keychain') {
    execFileSync('security', ['add-generic-password', '-U', '-a', os.userInfo().username, '-s', KEYCHAIN_SERVICE, '-w', data], {
      stdio: 'ignore',
    });
  }
}

function readOrgUuid() {
  for (const p of [path.join(os.homedir(), '.claude.json'), path.join(claudeDir(), '.claude.json'), path.join(claudeDir(), 'config.json')]) {
    try {
      const j = JSON.parse(fs.readFileSync(p, 'utf8'));
      if (j.oauthAccount?.organizationUuid) return j.oauthAccount.organizationUuid;
    } catch {
      /* next */
    }
  }
  return '';
}

export function createClaudeSessions(opts = {}) {
  const base = (opts.apiBase || 'https://api.anthropic.com').replace(/\/+$/, '');
  let cached = null;

  async function token(forceRefresh = false) {
    if (opts.accessToken) return opts.accessToken; // tests / manual override
    const creds = readCliCredentials();
    const o = creds?.json?.claudeAiOauth;
    if (!o?.accessToken) throw new Error('Not signed in: run `claude auth login` on this computer');
    const fresh = o.expiresAt && o.expiresAt - Date.now() > 120_000;
    if (fresh && !forceRefresh) return o.accessToken;
    if (cached && cached.expiresAt - Date.now() > 120_000 && !forceRefresh) return cached.accessToken;
    // Let the CLI refresh its own token first (it owns the credential); fall back to refreshing ourselves.
    try {
      execFileSync('claude', ['auth', 'status'], { stdio: 'ignore', timeout: 30_000 });
      const again = readCliCredentials()?.json?.claudeAiOauth;
      if (again?.expiresAt && again.expiresAt - Date.now() > 120_000) return again.accessToken;
    } catch {
      /* CLI not on PATH */
    }
    if (!o.refreshToken) throw new Error('Login expired: run `claude auth login`');
    const r = await http(TOKEN_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: { grant_type: 'refresh_token', refresh_token: o.refreshToken, client_id: CLIENT_ID, scope: (o.scopes || []).join(' ') },
    });
    Object.assign(o, {
      accessToken: r.access_token,
      refreshToken: r.refresh_token || o.refreshToken,
      expiresAt: Date.now() + (r.expires_in || 3600) * 1000,
    });
    writeCliCredentials(creds); // refresh tokens rotate, so the CLI must get the new one too
    cached = { accessToken: o.accessToken, expiresAt: o.expiresAt };
    return o.accessToken;
  }

  async function call(method, route, body) {
    const org = opts.orgUuid || readOrgUuid();
    const go = async (tok) =>
      http(base + route, {
        method,
        body,
        headers: {
          authorization: `Bearer ${tok}`,
          'content-type': 'application/json',
          'anthropic-version': '2023-06-01',
          'anthropic-beta': BETA,
          ...(org ? { 'x-organization-uuid': org } : {}),
        },
      });
    try {
      return await go(await token());
    } catch (e) {
      if (e.status === 401 && !opts.accessToken) return go(await token(true));
      throw e;
    }
  }

  return { call, token };
}

// ---------------------------------------------------------------- event parsing

/** Normalizes the different envelope shapes events come in to plain SDK-style messages. */
export function normalizeEvent(e) {
  if (!e || typeof e !== 'object') return null;
  if (e.payload && typeof e.payload === 'object') e = { ...e.payload, created_at: e.created_at };
  if (e.data && typeof e.data === 'object' && !e.type) e = { ...e.data, created_at: e.created_at };
  if (!e.type) {
    for (const k of ['result', 'assistant', 'user']) {
      if (e[k] && typeof e[k] === 'object') {
        const inner = e[k].internal_anthropic_catchall ? { ...e[k].internal_anthropic_catchall, uuid: e[k].uuid } : e[k];
        return { ...inner, type: k, created_at: e.created_at };
      }
    }
    return null;
  }
  return e;
}

/** Latest finished turn in a list of events: {id, text, prompt} or null. */
export function latestTurn(events) {
  const list = events.map(normalizeEvent).filter(Boolean);
  let resultIdx = -1;
  for (let i = list.length - 1; i >= 0; i--) {
    if (list[i].type === 'result') {
      resultIdx = i;
      break;
    }
  }
  if (resultIdx < 0) return null;
  const r = list[resultIdx];
  let text = typeof r.result === 'string' ? r.result : '';
  let prompt = '';
  for (let i = resultIdx - 1; i >= 0; i--) {
    const ev = list[i];
    if (!text && ev.type === 'assistant') text = contentText(ev.message?.content);
    if (ev.type === 'user' && !ev.isReplay && ev.parent_tool_use_id == null) {
      const c = ev.message?.content;
      const isPrompt = typeof c === 'string' || (Array.isArray(c) && c.some((b) => b?.type === 'text'));
      if (isPrompt) {
        prompt = contentText(c);
        break;
      }
    }
  }
  return { id: r.uuid || r.id || `${r.created_at}`, text, prompt, isError: !!r.is_error };
}

// ---------------------------------------------------------------- source

export default function claudeSessionsSource(cfg) {
  const c = cfg.file.claudeSessions || {};
  if (c.enabled === false) return null;
  const client = createClaudeSessions({ apiBase: c.apiBase, accessToken: c.accessToken, orgUuid: c.orgUuid });

  async function fetchEvents(id) {
    // Newest events are what matter; walk pages (bounded) to be robust to either ordering.
    const all = [];
    let route = `/v1/sessions/${id}/events?limit=100`;
    for (let page = 0; page < 30 && route; page++) {
      const r = await client.call('GET', route);
      const data = Array.isArray(r) ? r : r.data || r.events || [];
      all.push(...data);
      if (!r.has_more || !r.last_id) break;
      route = `/v1/sessions/${id}/events?limit=100&after_id=${encodeURIComponent(r.last_id)}`;
    }
    return all;
  }

  return {
    name: 'claude-sessions',
    replies: ['claude-code-cloud', 'claude-code-rc'],
    intervalMs: c.intervalMs || 10_000,

    async poll(state) {
      const r = await client.call('GET', '/v1/sessions?limit=50');
      const sessions = Array.isArray(r) ? r : r.data || r.sessions || [];
      const seen = (state.sessions ??= {});
      const first = !state.initialized;
      const out = [];
      for (const s of sessions) {
        const status = String(s.session_status || s.status || '').toLowerCase();
        if (/archived|cancel/.test(status)) continue;
        const working = /running|working/.test(status) || s.status_bucket === 'SESSION_STATUS_BUCKET_WORKING';
        const updated = s.updated_at || '';
        const prev = seen[s.id];
        if (prev && prev.updated === updated) continue;
        if (first) {
          // Baseline: remember where every session is; only turns finished after this point are reported.
          seen[s.id] = { updated, last: null };
          continue;
        }
        if (working) continue; // look again when it settles
        const turn = latestTurn(await fetchEvents(s.id));
        seen[s.id] = { updated, last: turn?.id || prev?.last || null };
        if (!turn || turn.id === prev?.last) continue;
        if (!prev && Date.now() - Date.parse(updated) > 15 * 60_000) continue; // stale session we never tracked
        const local = s.environment_kind === 'bridge';
        out.push({
          source: local ? 'claude-code-rc' : 'claude-code-cloud',
          sessionId: s.id,
          title: s.title || s.id,
          prompt: turn.prompt,
          text: turn.text || (turn.isError ? 'The turn ended with an error.' : ''),
          url: `https://claude.ai/code/${s.id}`,
        });
      }
      state.initialized = true;
      return out;
    },

    async send(reply) {
      await client.call('POST', `/v1/sessions/${reply.sessionId}/events`, {
        events: [
          {
            type: 'user',
            uuid: crypto.randomUUID(),
            session_id: reply.sessionId,
            parent_tool_use_id: null,
            message: { role: 'user', content: reply.text },
          },
        ],
      });
    },
  };
}
