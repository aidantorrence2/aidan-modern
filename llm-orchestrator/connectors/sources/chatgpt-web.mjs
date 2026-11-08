// ChatGPT web conversations, read with your browser login (unofficial chatgpt.com endpoints).
// Config, either:
//   "chatgpt": { "authFile": "~/.codex/auth.json" }   a ChatGPT OAuth login from `codex login` (no browser cookie;
//                                                     refreshed here). Give each machine its own login: refresh
//                                                     tokens rotate, so two machines sharing one log each other out.
//   "chatgpt": { "sessionToken": "<__Secure-next-auth.session-token cookie>" } or { "cookie": "<full Cookie header>" }
//
// Reading is plain polling. Sending is attempted through the same endpoint the website uses, but ChatGPT
// usually demands a browser proof-of-work / Turnstile check for that; we do not try to defeat those checks.
// When they're required, send() throws and the relay hands the reply back to the phone (copy + open chat).
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import { http, BROWSER_UA } from '../common.mjs';

const OPENAI_AUTH = 'https://auth.openai.com/oauth/token';
const CODEX_CLIENT_ID = 'app_EMoamEEZ73f0CkXaXp7hrann';

function jwtExp(token) {
  try {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString()).exp * 1000;
  } catch {
    return 0;
  }
}

/** Access token from a `codex login` auth.json, refreshing (and saving) it when it is about to expire. */
export function createOAuthToken(file) {
  const path = file.replace(/^~(?=\/)/, os.homedir());
  return async function token() {
    const auth = JSON.parse(fs.readFileSync(path, 'utf8'));
    const t = auth.tokens || {};
    if (t.access_token && jwtExp(t.access_token) - Date.now() > 10 * 60_000) return { token: t.access_token, account: t.account_id };
    if (!t.refresh_token) throw new Error(`No ChatGPT refresh token in ${path}: run codex login`);
    const r = await http(OPENAI_AUTH, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: { client_id: CODEX_CLIENT_ID, grant_type: 'refresh_token', refresh_token: t.refresh_token, scope: 'openid profile email' },
    });
    if (!r?.access_token) throw new Error('ChatGPT token refresh failed: run codex login again');
    auth.tokens = { ...t, access_token: r.access_token, refresh_token: r.refresh_token || t.refresh_token, id_token: r.id_token || t.id_token };
    auth.last_refresh = new Date().toISOString();
    fs.writeFileSync(path + '.tmp', JSON.stringify(auth, null, 2), { mode: 0o600 });
    fs.renameSync(path + '.tmp', path);
    return { token: auth.tokens.access_token, account: auth.tokens.account_id };
  };
}

/** Follows current_node up the mapping to get the visible thread, oldest first. */
export function visibleThread(conv) {
  const mapping = conv.mapping || {};
  const out = [];
  let id = conv.current_node;
  const guard = new Set();
  while (id && mapping[id] && !guard.has(id)) {
    guard.add(id);
    if (mapping[id].message) out.unshift(mapping[id].message);
    id = mapping[id].parent;
  }
  return out;
}

export function messageText(m) {
  const c = m?.content || {};
  if (Array.isArray(c.parts)) return c.parts.filter((p) => typeof p === 'string').join('\n');
  if (typeof c.text === 'string') return c.text;
  return '';
}

/** Latest finished assistant reply in a conversation: {id, text, prompt} or null. */
export function latestReply(conv) {
  const thread = visibleThread(conv);
  for (let i = thread.length - 1; i >= 0; i--) {
    const m = thread[i];
    const role = m.author?.role;
    if (role === 'user') return null; // the user spoke last: nothing to answer yet
    if (role !== 'assistant' || (m.recipient && m.recipient !== 'all')) continue;
    const text = messageText(m);
    if (!text.trim()) continue;
    if (m.status && m.status !== 'finished_successfully') return null; // still streaming
    let prompt = '';
    for (let j = i - 1; j >= 0; j--) {
      if (thread[j].author?.role === 'user') {
        prompt = messageText(thread[j]);
        break;
      }
    }
    return { id: m.id, text, prompt };
  }
  return null;
}

export default function chatgptWebSource(cfg) {
  const c = cfg.file.chatgpt;
  if (!c || c.enabled === false || !(c.authFile || c.sessionToken || c.cookie)) return null;
  const base = (c.baseUrl || 'https://chatgpt.com').replace(/\/+$/, '');
  const oauth = c.authFile ? createOAuthToken(c.authFile) : null;
  const cookie = oauth ? undefined : c.cookie || `__Secure-next-auth.session-token=${c.sessionToken}`;
  let access = null;
  let account = null;

  async function accessToken() {
    if (oauth) {
      const t = await oauth();
      account = t.account;
      return t.token;
    }
    if (access && access.exp - Date.now() > 60_000) return access.token;
    const s = await http(`${base}/api/auth/session`, { headers: { cookie, 'user-agent': BROWSER_UA, accept: 'application/json' } });
    if (!s?.accessToken) throw new Error('ChatGPT session cookie is invalid or expired');
    access = { token: s.accessToken, exp: s.expires ? Date.parse(s.expires) : Date.now() + 30 * 60_000 };
    return access.token;
  }

  async function call(method, route, body) {
    return http(base + route, {
      method,
      body,
      raw: method === 'POST' && route === '/backend-api/conversation',
      headers: {
        authorization: `Bearer ${await accessToken()}`,
        ...(cookie ? { cookie } : {}),
        ...(account ? { 'chatgpt-account-id': account } : {}),
        'user-agent': BROWSER_UA,
        'content-type': 'application/json',
        accept: method === 'POST' && route === '/backend-api/conversation' ? 'text/event-stream' : 'application/json',
        origin: base,
        referer: `${base}/`,
      },
      timeoutMs: route === '/backend-api/conversation' ? 300_000 : 20_000,
    });
  }

  return {
    name: 'chatgpt-web',
    replies: ['chatgpt'],
    intervalMs: c.intervalMs || 30_000,

    async poll(state) {
      // After a 429, stay quiet for a while instead of retrying into the limit.
      if (state.coolUntil && Date.now() < state.coolUntil) return [];
      let list;
      try {
        list = await call('GET', '/backend-api/conversations?offset=0&limit=15&order=updated');
      } catch (e) {
        if (e.status === 429) state.coolUntil = Date.now() + 5 * 60_000;
        throw e;
      }
      const items = list.items || [];
      const seen = (state.convs ??= {});
      const first = !state.initialized;
      const out = [];
      let fetched = 0;
      for (const it of items) {
        const updated = String(it.update_time || '');
        const prev = seen[it.id];
        if (prev && prev.updated === updated) continue;
        if (first) {
          seen[it.id] = { updated, last: null };
          continue;
        }
        // A conversation with no finished reply yet (streaming, user spoke last, image or tool output) is
        // re-checked at most every 45 s and only while it's recent; it used to be re-fetched every poll forever.
        if (prev?.checkedAt && Date.now() - prev.checkedAt < 45_000) continue;
        if (fetched >= 3) break; // spread bursts over polls
        fetched++;
        let conv;
        try {
          conv = await call('GET', `/backend-api/conversation/${it.id}`);
        } catch (e) {
          if (e.status === 429) state.coolUntil = Date.now() + 5 * 60_000;
          throw e;
        }
        const reply = latestReply(conv);
        const recent = Date.now() - Date.parse(it.update_time || 0) < 10 * 60_000;
        seen[it.id] = {
          updated: reply || !recent ? updated : '',
          checkedAt: Date.now(),
          last: reply?.id || prev?.last || null,
          leaf: conv.current_node,
        };
        if (!reply || reply.id === prev?.last) continue;
        out.push({
          source: 'chatgpt',
          sessionId: `chatgpt:${it.id}`,
          title: it.title || conv.title || 'ChatGPT',
          prompt: reply.prompt,
          text: reply.text,
          url: `${base}/c/${it.id}`,
          // ChatGPT wants a browser check before accepting a message, so the phone sends it
          // through the ChatGPT app instead of the bridge (replyMode none = phone delivers).
          replyMode: c.phoneSends === false ? 'bridge' : 'none',
        });
      }
      state.initialized = true;
      return out;
    },

    async send(reply, state) {
      const convId = reply.sessionId.replace(/^chatgpt:/, '');
      const reqs = await call('POST', '/backend-api/sentinel/chat-requirements', {});
      if (reqs?.proofofwork?.required || reqs?.turnstile?.required || reqs?.arkose?.required) {
        throw new Error('ChatGPT requires a browser verification check to send messages');
      }
      const conv = await call('GET', `/backend-api/conversation/${convId}`);
      await http(`${base}/backend-api/conversation`, {
        method: 'POST',
        raw: true,
        timeoutMs: 300_000,
        headers: {
          authorization: `Bearer ${await accessToken()}`,
          ...(cookie ? { cookie } : {}),
          ...(account ? { 'chatgpt-account-id': account } : {}),
          'user-agent': BROWSER_UA,
          'content-type': 'application/json',
          accept: 'text/event-stream',
          origin: base,
          referer: `${base}/c/${convId}`,
          ...(reqs?.token ? { 'openai-sentinel-chat-requirements-token': reqs.token } : {}),
        },
        body: {
          action: 'next',
          conversation_id: convId,
          parent_message_id: conv.current_node,
          model: c.model || 'auto',
          messages: [
            { id: crypto.randomUUID(), author: { role: 'user' }, content: { content_type: 'text', parts: [reply.text] } },
          ],
        },
      });
      if (state.convs?.[convId]) state.convs[convId].updated = ''; // re-read on the next poll
    },
  };
}
