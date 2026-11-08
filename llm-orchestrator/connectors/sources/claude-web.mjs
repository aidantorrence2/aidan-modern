// claude.ai chats, read and answered with your browser login (unofficial claude.ai endpoints).
// Config: "claudeWeb": { "sessionKey": "<sessionKey cookie, sk-ant-sid…>" } or { "cookie": "<full Cookie header>" }
import { http, BROWSER_UA, contentText } from '../common.mjs';

export function messageText(m) {
  if (Array.isArray(m?.content) && m.content.length) return contentText(m.content);
  return typeof m?.text === 'string' ? m.text : '';
}

/** Messages on the current branch (leaf back to root), oldest first. */
export function currentBranch(conv) {
  const msgs = conv.chat_messages || [];
  const byId = new Map(msgs.map((m) => [m.uuid, m]));
  const leaf = conv.current_leaf_message_uuid;
  if (!leaf || !byId.has(leaf)) return msgs;
  const out = [];
  const guard = new Set();
  let m = byId.get(leaf);
  while (m && !guard.has(m.uuid)) {
    guard.add(m.uuid);
    out.unshift(m);
    m = byId.get(m.parent_message_uuid);
  }
  return out;
}

export function latestReply(conv) {
  const branch = currentBranch(conv);
  const last = branch[branch.length - 1];
  if (!last || last.sender !== 'assistant') return null;
  const text = messageText(last);
  if (!text.trim()) return null;
  const prev = [...branch].reverse().find((m) => m.sender === 'human');
  return { id: last.uuid, text, prompt: prev ? messageText(prev) : '' };
}

export default function claudeWebSource(cfg) {
  const c = cfg.file.claudeWeb;
  if (!c || c.enabled === false || !(c.sessionKey || c.cookie)) return null;
  const base = (c.baseUrl || 'https://claude.ai').replace(/\/+$/, '');
  const cookie = c.cookie || `sessionKey=${c.sessionKey}`;
  let org = c.orgUuid || '';

  const headers = (accept = 'application/json') => ({
    cookie,
    'user-agent': BROWSER_UA,
    accept,
    'content-type': 'application/json',
    origin: base,
    referer: `${base}/`,
    'anthropic-client-platform': 'web_claude_ai',
  });

  async function orgId() {
    if (org) return org;
    const orgs = await http(`${base}/api/organizations`, { headers: headers() });
    const chosen = (Array.isArray(orgs) ? orgs : []).find((o) => (o.capabilities || []).includes('chat')) || orgs?.[0];
    if (!chosen?.uuid) throw new Error('claude.ai sessionKey is invalid or expired');
    org = chosen.uuid;
    return org;
  }

  return {
    name: 'claude-web',
    replies: ['claude-web'],
    intervalMs: c.intervalMs || 15_000,

    async poll(state) {
      const o = await orgId();
      const list = await http(`${base}/api/organizations/${o}/chat_conversations?limit=15`, { headers: headers() });
      const convs = Array.isArray(list) ? list : list.data || [];
      const seen = (state.convs ??= {});
      const first = !state.initialized;
      const out = [];
      for (const it of convs) {
        const updated = String(it.updated_at || '');
        const prev = seen[it.uuid];
        if (prev && prev.updated === updated) continue;
        if (first) {
          seen[it.uuid] = { updated, last: null };
          continue;
        }
        const conv = await http(
          `${base}/api/organizations/${o}/chat_conversations/${it.uuid}?tree=True&rendering_mode=messages&render_all_tools=true`,
          { headers: headers() },
        );
        const reply = latestReply(conv);
        seen[it.uuid] = { updated: reply ? updated : '', last: reply?.id || prev?.last || null };
        if (!reply || reply.id === prev?.last) continue;
        out.push({
          source: 'claude-web',
          sessionId: `claude-web:${it.uuid}`,
          title: it.name || 'Claude chat',
          prompt: reply.prompt,
          text: reply.text,
          url: `${base}/chat/${it.uuid}`,
        });
      }
      state.initialized = true;
      return out;
    },

    async send(reply, state) {
      const o = await orgId();
      const id = reply.sessionId.replace(/^claude-web:/, '');
      const conv = await http(`${base}/api/organizations/${o}/chat_conversations/${id}?tree=True&rendering_mode=messages`, {
        headers: headers(),
      });
      const branch = currentBranch(conv);
      await http(`${base}/api/organizations/${o}/chat_conversations/${id}/completion`, {
        method: 'POST',
        raw: true,
        timeoutMs: 600_000,
        headers: headers('text/event-stream'),
        body: {
          prompt: reply.text,
          parent_message_uuid: branch[branch.length - 1]?.uuid,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
          attachments: [],
          files: [],
          rendering_mode: 'messages',
        },
      });
      if (state.convs?.[id]) state.convs[id].updated = ''; // re-read on the next poll
    },
  };
}
