// ChatGPT web conversations, read with your browser login (unofficial chatgpt.com endpoints).
// Config: "chatgpt": { "sessionToken": "<__Secure-next-auth.session-token cookie>" } or { "cookie": "<full Cookie header>" }
//
// Reading is plain polling. Sending is attempted through the same endpoint the website uses, but ChatGPT
// usually demands a browser proof-of-work / Turnstile check for that; we do not try to defeat those checks.
// When they're required, send() throws and the relay hands the reply back to the phone (copy + open chat).
import crypto from 'node:crypto';
import { http, BROWSER_UA } from '../common.mjs';

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
  if (!c || c.enabled === false || !(c.sessionToken || c.cookie)) return null;
  const base = (c.baseUrl || 'https://chatgpt.com').replace(/\/+$/, '');
  const cookie = c.cookie || `__Secure-next-auth.session-token=${c.sessionToken}`;
  let access = null;

  async function accessToken() {
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
        cookie,
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
    intervalMs: c.intervalMs || 15_000,

    async poll(state) {
      const list = await call('GET', '/backend-api/conversations?offset=0&limit=15&order=updated');
      const items = list.items || [];
      const seen = (state.convs ??= {});
      const first = !state.initialized;
      const out = [];
      for (const it of items) {
        const updated = String(it.update_time || '');
        const prev = seen[it.id];
        if (prev && prev.updated === updated) continue;
        if (first) {
          seen[it.id] = { updated, last: null };
          continue;
        }
        const conv = await call('GET', `/backend-api/conversation/${it.id}`);
        const reply = latestReply(conv);
        seen[it.id] = { updated: reply ? updated : '', last: reply?.id || prev?.last || null, leaf: conv.current_node };
        if (!reply || reply.id === prev?.last) continue;
        out.push({
          source: 'chatgpt',
          sessionId: `chatgpt:${it.id}`,
          title: it.title || conv.title || 'ChatGPT',
          prompt: reply.prompt,
          text: reply.text,
          url: `${base}/c/${it.id}`,
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
          cookie,
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
