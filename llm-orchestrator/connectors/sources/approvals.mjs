// Approvals queue (the `request-approval` cards) as orchestrator items, so a pending approval stays in the
// phone/Mac inbox until it is decided, not just as a notification that can disappear.
// Queue: data/approvals.json on branch ccr-d1938557-3pv196 of aidantorrence2/aidan-modern (same as the
// Approvals apps). Auth: the GitHub CLI login on this machine (`gh auth token`), which stays on this machine.
// Replying "approve" / "deny: <note>" writes the decision exactly like the Approvals app: status, decided,
// note, commit "Approve <id>" / "Deny <id>". First decision wins.
import { execFileSync } from 'node:child_process';
import { api } from '../common.mjs';

const REPO = 'aidantorrence2/aidan-modern';
const BRANCH = 'ccr-d1938557-3pv196';
const FILE = 'data/approvals.json';

export default function approvalsSource(cfg) {
  const c = cfg.file.approvals || {};
  if (c.enabled === false) return null;
  let token = null;
  const getToken = (fresh = false) => {
    if (!token || fresh) token = execFileSync('gh', ['auth', 'token'], { encoding: 'utf8', timeout: 15_000 }).trim();
    return token;
  };
  async function gh(method, body, retry = true) {
    const r = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE}${method === 'GET' ? `?ref=${BRANCH}` : ''}`, {
      method,
      headers: { authorization: `Bearer ${getToken()}`, accept: 'application/vnd.github+json', 'user-agent': 'llm-orchestrator', ...(body ? { 'content-type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(20_000),
    });
    if (r.status === 401 && retry) { getToken(true); return gh(method, body, false); }
    if (!r.ok) { const e = new Error(`GitHub ${method} ${r.status}: ${(await r.text()).slice(0, 120)}`); e.status = r.status; throw e; }
    return r.json();
  }
  async function read() {
    const f = await gh('GET');
    return { doc: JSON.parse(Buffer.from(f.content, 'base64').toString('utf8')), sha: f.sha };
  }
  const isOpen = (it) => (it.status || 'pending') === 'pending' && !(it.expires && Date.parse(it.expires) < Date.now());
  const preview = (it) => {
    const p = it.payload || {};
    if (p.body) return `${p.to ? 'To: ' + p.to + '\n' : ''}${p.subject ? 'Subject: ' + p.subject + '\n\n' : ''}${p.body}`;
    if (p.caption) return p.caption;
    return Object.keys(p).length ? JSON.stringify(p, null, 1).slice(0, 1500) : '';
  };

  return {
    name: 'approvals',
    replies: ['approval'],
    intervalMs: c.intervalMs || 60_000,

    async poll(state) {
      const { doc } = await read();
      const items = doc.items || [];
      const posted = (state.posted ??= {});
      const out = [];
      for (const it of items) {
        if (isOpen(it)) {
          if (posted[it.id]) continue;
          posted[it.id] = Date.now();
          out.push({
            source: 'approval',
            sessionId: `approval:${it.id}`,
            title: it.title || it.id,
            prompt: it.summary || '',
            text: [it.summary, preview(it)].filter(Boolean).join('\n\n'),
            url: it.preview_url || '',
            replyMode: 'bridge',
          });
        } else if (posted[it.id]) {
          // Decided (or expired) somewhere else: clear the orchestrator card.
          delete posted[it.id];
          await api(cfg, 'POST', `/api/sessions/${encodeURIComponent('approval:' + it.id)}/close`, { status: it.status === 'approved' ? 'replied' : 'dismissed' }).catch(() => {});
        }
      }
      // Items removed from the queue entirely.
      const ids = new Set(items.map((i) => i.id));
      for (const id of Object.keys(posted)) if (!ids.has(id)) delete posted[id];
      return out;
    },

    async send(reply) {
      const id = reply.sessionId.replace(/^approval:/, '');
      const m = String(reply.text || '').trim().match(/^(approve|approved|yes|deny|denied|no)\b[:\s-]*(.*)$/is);
      if (!m) throw new Error('Reply with Approve or Deny');
      const status = /^(approve|approved|yes)$/i.test(m[1]) ? 'approved' : 'denied';
      const note = m[2].trim();
      for (let attempt = 0; attempt < 2; attempt++) {
        const { doc, sha } = await read();
        const it = (doc.items || []).find((x) => x.id === id);
        if (!it) throw new Error('That request is no longer in the queue');
        if ((it.status || 'pending') !== 'pending') throw new Error(`Already ${it.status} elsewhere`);
        Object.assign(it, { status, decided: new Date().toISOString().replace(/\.\d+Z$/, 'Z'), note });
        try {
          await gh('PUT', {
            message: `${status === 'approved' ? 'Approve' : 'Deny'} ${id}`,
            content: Buffer.from(JSON.stringify(doc, null, 2) + '\n').toString('base64'),
            sha,
            branch: BRANCH,
          });
          return;
        } catch (e) {
          if (e.status !== 409 && e.status !== 422) throw e; // sha moved: re-read and retry once
        }
      }
      throw new Error('Queue kept changing; try again');
    },
  };
}
