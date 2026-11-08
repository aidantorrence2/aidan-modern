// Polls claude.ai from this signed-in Chrome and reports each finished assistant reply to the relay.
// The relay URL and token come from config.js (written locally by setup.sh, never committed).
import { RELAY_URL, RELAY_TOKEN } from './config.js';

const API = 'https://claude.ai/api';
const PERIOD_MIN = 0.5; // MV3 alarms can't fire more often than every 30 s

chrome.runtime.onInstalled.addListener(() => chrome.alarms.create('poll', { periodInMinutes: PERIOD_MIN }));
chrome.runtime.onStartup.addListener(() => chrome.alarms.create('poll', { periodInMinutes: PERIOD_MIN }));
chrome.alarms.onAlarm.addListener((a) => { if (a.name === 'poll') poll().catch(report); });
chrome.action.onClicked.addListener(() => poll().catch(report));

async function claude(path) {
  const r = await fetch(API + path, { credentials: 'include', headers: { accept: 'application/json' } });
  if (r.status === 401 || r.status === 403) throw new Error('Not signed in to claude.ai in this Chrome');
  if (!r.ok) throw new Error(`claude.ai ${r.status}`);
  return r.json();
}

async function relay(method, path, body) {
  const r = await fetch(RELAY_URL + path, {
    method,
    headers: { authorization: `Bearer ${RELAY_TOKEN}`, 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!r.ok) throw new Error(`relay ${r.status}`);
  return r.json();
}

function textOf(m) {
  if (Array.isArray(m.content)) return m.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n').trim();
  return String(m.text || '').trim();
}

async function poll() {
  const st = (await chrome.storage.local.get('st')).st || { convs: {}, initialized: false };
  if (!st.org) {
    const orgs = await claude('/organizations');
    const org = orgs.find((o) => (o.capabilities || []).includes('chat')) || orgs[0];
    if (!org) throw new Error('No claude.ai organization');
    st.org = org.uuid;
  }
  const list = await claude(`/organizations/${st.org}/chat_conversations?limit=15`);
  const items = Array.isArray(list) ? list : list.data || [];
  let fetched = 0;
  for (const c of items) {
    const updated = c.updated_at || '';
    const prev = st.convs[c.uuid];
    if (prev && prev.updated === updated) continue;
    if (!st.initialized) { st.convs[c.uuid] = { updated, last: null }; continue; }
    if (prev?.checkedAt && Date.now() - prev.checkedAt < 30_000) continue;
    if (fetched++ >= 3) break;
    const conv = await claude(`/organizations/${st.org}/chat_conversations/${c.uuid}?tree=True&rendering_mode=messages`);
    const msgs = conv.chat_messages || [];
    const last = msgs[msgs.length - 1];
    const done = last && last.sender === 'assistant' && textOf(last) && !last.stop_reason?.startsWith?.('error');
    const recent = Date.now() - Date.parse(updated) < 10 * 60_000;
    st.convs[c.uuid] = { updated: done || !recent ? updated : '', checkedAt: Date.now(), last: done ? last.uuid : prev?.last || null };
    if (!done || last.uuid === prev?.last) continue;
    const human = [...msgs].reverse().find((m) => m.sender === 'human');
    await relay('POST', '/api/events', {
      source: 'claude-web',
      sessionId: `claude:${c.uuid}`,
      title: c.name || conv.name || 'Claude',
      prompt: human ? textOf(human).slice(0, 2000) : '',
      text: textOf(last).slice(0, 20000),
      url: `https://claude.ai/chat/${c.uuid}`,
      host: 'chrome',
      replyMode: 'none', // the phone sends replies through the Claude app; the Mac panel copies + opens
    });
  }
  st.initialized = true;
  st.error = '';
  await chrome.storage.local.set({ st });
  chrome.action.setBadgeText({ text: '' });
}

async function report(e) {
  console.warn('[orchestrator]', e);
  chrome.action.setBadgeBackgroundColor({ color: '#c0392b' });
  chrome.action.setBadgeText({ text: '!' });
  chrome.action.setTitle({ title: `Orchestrator — claude.ai: ${e.message}` });
}
