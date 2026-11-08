import { Capacitor } from '@capacitor/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { KeepAwake } from '@capacitor-community/keep-awake';
import { App } from '@capacitor/app';
import { DECK } from './deck.js';

const NATIVE = Capacitor.isNativePlatform();
const $ = (s) => document.querySelector(s);
const MIN = 60e3, DAY = 864e5;

// ---------- storage ----------
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const S = load('settings', { lang: 'pt-BR', rate: 0.9, newPerDay: 15, think: 4, mode: 'speak', autoAdvance: true });
let cards = load('cards', {}); // id -> {due, ivl(days), ease, reps, lapses, seen}
let stats = load('stats', { streak: 0, last: '', today: '', newToday: 0, reviewsToday: 0 });
const ids = DECK.map((_, i) => i);
const persist = () => { save('cards', cards); save('stats', stats); };
const todayStr = () => new Date().toISOString().slice(0, 10);
function rollDay() {
  const t = todayStr();
  if (stats.today !== t) { stats.today = t; stats.newToday = 0; stats.reviewsToday = 0; }
}
function markStudied() {
  const t = todayStr();
  if (stats.last === t) return;
  const y = new Date(Date.now() - DAY).toISOString().slice(0, 10);
  stats.streak = stats.last === y ? stats.streak + 1 : 1;
  stats.last = t;
}

// ---------- SRS (SM-2 lite) ----------
// grade: 0 again, 1 hard, 2 good, 3 easy
function grade(id, g) {
  const first = !cards[id];
  const c = cards[id] || { ivl: 0, ease: 2.5, reps: 0, lapses: 0 };
  const now = Date.now();
  if (g === 0) { if (!first) c.lapses++; c.reps = 0; c.ivl = 0; c.ease = Math.max(1.3, c.ease - 0.2); c.due = now + MIN; }
  else {
    if (c.reps === 0) c.ivl = g === 1 ? 0.25 : g === 2 ? 1 : 3;
    else if (c.reps === 1) c.ivl = g === 1 ? 1.5 : g === 2 ? 3 : 6;
    else c.ivl = c.ivl * (g === 1 ? 1.2 : g === 2 ? c.ease : c.ease * 1.3);
    c.ease = Math.max(1.3, c.ease + (g === 1 ? -0.15 : g === 3 ? 0.15 : 0));
    c.reps++; c.due = now + c.ivl * DAY;
  }
  c.seen = true; cards[id] = c;
  rollDay(); stats.reviewsToday++; markStudied(); persist();
}
function counts() {
  rollDay();
  const now = Date.now();
  let due = 0, learned = 0, mature = 0;
  for (const id of ids) { const c = cards[id]; if (!c) continue; learned++; if (c.due <= now) due++; if (c.ivl >= 21) mature++; }
  const newLeft = Math.max(0, Math.min(S.newPerDay - stats.newToday, DECK.length - learned));
  return { due, learned, mature, newLeft };
}
function buildQueue() {
  const now = Date.now();
  const due = ids.filter((i) => cards[i] && cards[i].due <= now).sort((a, b) => cards[a].due - cards[b].due);
  const { newLeft } = counts();
  const fresh = ids.filter((i) => !cards[i]).slice(0, newLeft);
  // interleave: a new card every ~3 reviews
  const q = [];
  while (due.length || fresh.length) {
    for (let k = 0; k < 3 && due.length; k++) q.push(due.shift());
    if (fresh.length) q.push(fresh.shift());
  }
  return q;
}
function reinsert(q, id, pos = 4) { q.splice(Math.min(pos, q.length), 0, id); }

// ---------- audio ----------
let session = null; // {token}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function say(text, lang = S.lang, rate = S.rate) {
  try { await TextToSpeech.speak({ text, lang, rate, pitch: 1, volume: 1, category: 'playback' }); }
  catch (e) { console.warn('tts', e); await sleep(600); }
}
const sayPT = (t, slow) => say(t, S.lang, slow ? S.rate * 0.7 : S.rate);
const sayEN = (t) => say(t.replace(/\(.*?\)/g, ''), 'en-US', 1);
let srOK = null;
async function canListen() {
  if (srOK !== null) return srOK;
  try {
    const { available } = await SpeechRecognition.available();
    if (!available) return (srOK = false);
    let p = await SpeechRecognition.checkPermissions();
    if (p.speechRecognition !== 'granted') p = await SpeechRecognition.requestPermissions();
    srOK = p.speechRecognition === 'granted';
  } catch { srOK = false; }
  return srOK;
}
async function listen(ms = 6000) {
  try {
    const r = await Promise.race([
      SpeechRecognition.start({ language: S.lang, maxResults: 5, popup: false, partialResults: false }),
      sleep(ms + 2000).then(() => { SpeechRecognition.stop().catch(() => {}); return { matches: [] }; }),
    ]);
    return r?.matches || [];
  } catch { return []; }
}

// ---------- matching ----------
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
function lev(a, b) {
  const m = a.length, n = b.length; if (!m) return n; if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[n];
}
function similarity(a, target) {
  const x = norm(a), y = norm(target);
  if (!y) return 0;
  // ignore optional leading subject pronoun "eu"
  const strip = (s) => s.replace(/^eu /, '');
  const s1 = 1 - lev(x, y) / Math.max(x.length, y.length);
  const s2 = 1 - lev(strip(x), strip(y)) / Math.max(strip(x).length, strip(y).length, 1);
  return Math.max(s1, s2);
}

// ---------- UI ----------
const app = $('#app');
function h(html) { app.innerHTML = html; }
function home() {
  stopSession();
  const c = counts();
  h(`
  <header><h1>Português <span>em movimento</span></h1></header>
  <div class="stats">
    <div><b>${c.due}</b><small>due</small></div>
    <div><b>${c.newLeft}</b><small>new today</small></div>
    <div><b>${c.learned}/${DECK.length}</b><small>learned</small></div>
    <div><b>${stats.streak}🔥</b><small>streak</small></div>
  </div>
  <button class="big primary" id="audio">🎧 Audio session<small>Hands-free · eyes-free</small></button>
  <button class="big" id="text">📱 Text practice<small>Read, tap & type</small></button>
  <button class="big ghost" id="browse">📚 Browse phrases</button>
  <button class="big ghost" id="settings">⚙️ Settings</button>
  <p class="hint">${c.due + c.newLeft === 0 ? 'All caught up! Extra practice will drill your weakest cards.' : 'Tip: start the audio session, keep your eyes up, and answer out loud.'}</p>`);
  $('#audio').onclick = audioSession; $('#text').onclick = textSession;
  $('#browse').onclick = browse; $('#settings').onclick = settings;
}
function sessionQueue() {
  let q = buildQueue();
  if (!q.length) { // extra practice: weakest seen cards
    q = ids.filter((i) => cards[i]).sort((a, b) => (cards[a].ivl - cards[b].ivl) || (cards[b].lapses - cards[a].lapses)).slice(0, 15);
  }
  if (!q.length) q = ids.slice(0, S.newPerDay);
  return q;
}
function introduce(id) { if (!cards[id]) { rollDay(); stats.newToday++; } }
function stopSession() {
  if (session) { session.stop = true; session = null; TextToSpeech.stop().catch(() => {}); SpeechRecognition.stop().catch(() => {}); KeepAwake.allowSleep().catch(() => {}); }
}

// ---------- audio session ----------
async function audioSession() {
  stopSession();
  const me = (session = { stop: false, paused: false, done: 0, skip: false, userGrade: null });
  KeepAwake.keepAwake().catch(() => {});
  const q = sessionQueue();
  const speak = S.mode === 'speak' && (await canListen());
  h(`
  <div class="topbar"><button id="back">✕</button><span id="prog"></span></div>
  <div class="stage">
    <div id="phase" class="phase">Starting…</div>
    <div id="en" class="en"></div>
    <div id="pt" class="pt"></div>
    <div id="heard" class="heard"></div>
  </div>
  <div class="pad">
    <button id="again" class="pad-btn red">✗ Again</button>
    <button id="good" class="pad-btn green">✓ Got it</button>
    <button id="pause" class="pad-btn">⏸ Pause</button>
    <button id="replay" class="pad-btn">🔁 Replay</button>
  </div>`);
  const set = (k, v) => { const el = $('#' + k); if (el) el.textContent = v; };
  $('#back').onclick = home;
  $('#again').onclick = () => (me.userGrade = 0);
  $('#good').onclick = () => (me.userGrade = 2);
  $('#replay').onclick = () => (me.replay = true);
  $('#pause').onclick = () => { me.paused = !me.paused; set('pause', me.paused ? '▶ Resume' : '⏸ Pause'); if (me.paused) TextToSpeech.stop().catch(() => {}); };
  const alive = async () => { while (me.paused && !me.stop) await sleep(300); return !me.stop; };
  const wait = async (ms) => { const end = Date.now() + ms; while (Date.now() < end) { if (me.stop) return false; if (me.userGrade !== null) return true; await sleep(100); } return alive(); };

  await sayEN(speak ? "Let's go. Say the Portuguese out loud after each prompt." : "Let's go. Say the Portuguese out loud in the pause.");
  while (q.length && (await alive())) {
    const id = q.shift(); const [en, pt] = DECK[id]; const isNew = !cards[id];
    me.userGrade = null; me.replay = false;
    set('prog', `${me.done} done · ${q.length + 1} left`); set('en', en); set('pt', ''); set('heard', '');
    if (isNew) {
      introduce(id);
      set('phase', '🆕 New phrase');
      await sayEN('New: ' + en); if (!(await alive())) break;
      set('pt', pt);
      await sayPT(pt, true); await wait(800); await sayPT(pt);
      set('phase', '🗣 Repeat it'); await wait(Math.max(2500, pt.length * 110));
      await sayPT(pt);
      grade(id, 0); // learning step: comes back in a few cards
      reinsert(q, id, 3);
    } else {
      set('phase', '🤔 How do you say…');
      await sayEN(en); if (!(await alive())) break;
      let g = null;
      if (speak) {
        set('phase', '🎙 Listening…');
        const heard = await listen(Math.max(4000, pt.length * 150));
        if (!(await alive())) break;
        const best = heard.reduce((m, x) => Math.max(m, similarity(x, pt)), 0);
        set('heard', heard[0] ? `You: “${heard[0]}”` : 'Didn’t catch that');
        g = best >= 0.85 ? 2 : best >= 0.6 ? 1 : 0;
        set('pt', pt);
        await say(g === 2 ? 'Isso!' : g === 1 ? 'Quase.' : (heard[0] ? 'Não.' : 'Hmm.'), S.lang);
        await sayPT(pt);
        if (g !== 2) { set('phase', '🗣 Repeat it'); await wait(Math.max(2000, pt.length * 100)); }
      } else {
        set('phase', '💭 Say it out loud…');
        await wait(S.think * 1000);
        set('pt', pt); await sayPT(pt);
        set('phase', 'Tap ✗ if you missed it');
        await wait(S.autoAdvance ? 1800 : 600000);
        g = me.userGrade ?? 2;
      }
      if (me.userGrade !== null) g = me.userGrade; // manual override wins
      grade(id, g);
      if (g === 0) reinsert(q, id, 4);
    }
    if (me.replay) { q.unshift(id); continue; }
    me.done++;
    await wait(500);
  }
  if (!me.stop) { await sayEN(`Session complete. ${me.done} phrases. Até logo!`); home(); }
}

// ---------- text session ----------
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; }
function textSession() {
  stopSession();
  const me = (session = { stop: false });
  const q = sessionQueue(); let done = 0;
  const next = () => {
    if (me.stop) return;
    if (!q.length) { h(`<div class="stage"><div class="phase">🎉 Done!</div><div class="en">${done} phrases practiced</div></div><button class="big primary" id="home">Home</button>`); $('#home').onclick = home; return; }
    const id = q.shift(); const [en, pt, unit] = DECK[id]; const c = cards[id];
    const top = `<div class="topbar"><button id="back">✕</button><span>${done} done · ${q.length + 1} left · ${unit}</span></div>`;
    const finish = (g) => { grade(id, g); if (g === 0) reinsert(q, id, 4); done++; next(); };
    if (!c) { // intro flashcard
      introduce(id);
      h(`${top}<div class="stage"><div class="phase">🆕 New phrase</div><div class="en">${en}</div><div class="pt">${pt}</div><button class="play" id="play">🔊 Listen</button></div>
        <div class="row"><button class="big primary" id="ok">Got it →</button></div>`);
      sayPT(pt);
      $('#play').onclick = () => sayPT(pt, true);
      $('#ok').onclick = () => { grade(id, 0); reinsert(q, id, 3); done++; next(); };
    } else if (c.reps < 2) { // multiple choice, alternate direction
      const toPT = Math.random() < 0.5;
      const pool = shuffle(ids.filter((i) => i !== id && DECK[i][2] === unit)).slice(0, 3);
      while (pool.length < 3) { const r = (Math.random() * DECK.length) | 0; if (r !== id && !pool.includes(r)) pool.push(r); }
      const opts = shuffle([id, ...pool]);
      h(`${top}<div class="stage"><div class="phase">${toPT ? 'Choose the Portuguese' : 'What does this mean?'}</div>
        <div class="${toPT ? 'en' : 'pt'}">${toPT ? en : pt}</div>${toPT ? '' : '<button class="play" id="play">🔊</button>'}</div>
        <div class="opts">${opts.map((o) => `<button class="opt" data-id="${o}">${DECK[o][toPT ? 1 : 0]}</button>`).join('')}</div>`);
      if (!toPT) { sayPT(pt); $('#play').onclick = () => sayPT(pt, true); }
      app.querySelectorAll('.opt').forEach((b) => (b.onclick = () => {
        const right = +b.dataset.id === id;
        app.querySelectorAll('.opt').forEach((x) => { x.disabled = true; if (+x.dataset.id === id) x.classList.add('right'); });
        if (!right) b.classList.add('wrong');
        if (toPT) sayPT(pt);
        setTimeout(() => finish(right ? 2 : 0), right ? 900 : 1800);
      }));
    } else { // typing
      h(`${top}<div class="stage"><div class="phase">Type it in Portuguese</div><div class="en">${en}</div>
        <input id="ans" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="accents optional"/>
        <div id="fb" class="heard"></div></div>
        <div class="row"><button class="big ghost" id="hint">Show</button><button class="big primary" id="check">Check</button></div>`);
      const inp = $('#ans'); inp.focus();
      const check = (reveal) => {
        const s = reveal ? 0 : similarity(inp.value, pt);
        const g = s >= 0.95 ? 2 : s >= 0.75 ? 1 : 0;
        $('#fb').innerHTML = `${g === 2 ? '✅ Perfeito' : g === 1 ? '🟡 Close' : '❌'} — <b>${pt}</b>`;
        sayPT(pt);
        app.querySelector('.row').innerHTML = `<button class="big red" data-g="0">Again</button><button class="big" data-g="1">Hard</button><button class="big green" data-g="${Math.max(g, 2)}">${g === 2 ? 'Good' : 'I was right'}</button><button class="big" data-g="3">Easy</button>`;
        app.querySelectorAll('.row button').forEach((b) => (b.onclick = () => finish(+b.dataset.g)));
        if (g < 2) app.querySelector('[data-g="0"]').classList.add('primary');
      };
      $('#check').onclick = () => check(false);
      $('#hint').onclick = () => check(true);
      inp.onkeydown = (e) => { if (e.key === 'Enter') check(false); };
    }
    $('#back').onclick = home;
  };
  next();
}

// ---------- browse & settings ----------
function browse() {
  stopSession();
  let unit = '';
  h(`<div class="topbar"><button id="back">✕</button><span>${DECK.length} phrases</span></div><div class="list">${DECK.map(([en, pt, u], i) => {
    const head = u !== unit ? `<h3>${(unit = u)}</h3>` : '';
    const c = cards[i]; const lvl = !c ? '' : c.ivl >= 21 ? '🟢' : c.ivl >= 3 ? '🟡' : '🟠';
    return `${head}<div class="item" data-i="${i}"><span>${pt}</span><small>${en} ${lvl}</small></div>`;
  }).join('')}</div>`);
  $('#back').onclick = home;
  app.querySelectorAll('.item').forEach((el) => (el.onclick = () => sayPT(DECK[el.dataset.i][1])));
}
function settings() {
  stopSession();
  h(`<div class="topbar"><button id="back">✕</button><span>Settings</span></div>
  <div class="form">
    <label>Accent<select id="lang"><option value="pt-BR">Brazilian 🇧🇷</option><option value="pt-PT">European 🇵🇹</option></select></label>
    <label>Audio answer mode<select id="mode"><option value="speak">Speak — app listens & grades</option><option value="pause">Pause — think, hear answer, tap ✗ if wrong</option></select></label>
    <label>Speech speed <output id="rv">${S.rate}</output><input type="range" id="rate" min="0.5" max="1.3" step="0.05" value="${S.rate}"></label>
    <label>Think time (pause mode) <output id="tv">${S.think}s</output><input type="range" id="think" min="2" max="10" step="1" value="${S.think}"></label>
    <label>New phrases per day <output id="nv">${S.newPerDay}</output><input type="range" id="npd" min="5" max="50" step="5" value="${S.newPerDay}"></label>
    <label class="check"><input type="checkbox" id="auto" ${S.autoAdvance ? 'checked' : ''}> Auto-advance in pause mode</label>
    <button class="big ghost" id="test">🔊 Test voice</button>
    <button class="big ghost red" id="reset">Reset progress</button>
  </div>`);
  $('#lang').value = S.lang; $('#mode').value = S.mode;
  const up = () => save('settings', S);
  $('#lang').onchange = (e) => { S.lang = e.target.value; up(); };
  $('#mode').onchange = (e) => { S.mode = e.target.value; up(); };
  $('#rate').oninput = (e) => { S.rate = +e.target.value; $('#rv').textContent = S.rate; up(); };
  $('#think').oninput = (e) => { S.think = +e.target.value; $('#tv').textContent = S.think + 's'; up(); };
  $('#npd').oninput = (e) => { S.newPerDay = +e.target.value; $('#nv').textContent = S.newPerDay; up(); };
  $('#auto').onchange = (e) => { S.autoAdvance = e.target.checked; up(); };
  $('#test').onclick = () => sayPT('Olá! Vamos aprender português juntos.');
  $('#reset').onclick = () => { if (confirm('Erase all progress?')) { cards = {}; stats = { streak: 0, last: '', today: '', newToday: 0, reviewsToday: 0 }; persist(); home(); } };
  $('#back').onclick = home;
}

if (NATIVE) App.addListener('backButton', () => { if (app.querySelector('#back')) home(); else App.exitApp(); });
home();
