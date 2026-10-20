import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

// CHARLOTTE v2 — CPC-first concepts, built against the current winner.
// CONTROL = the Istanbul DM story deck (render-coast-story-v2i.mjs --variant=o --cta=dm), re-cast for Charlotte with
// tier_candidates photos, the "shot on 35mm film" card dropped (no film in ads) and the CTA "Interested? Let's chat."
// N1–N12 are structurally different challengers; concepts.v2.json holds the lever + hypothesis for each.
//
// Usage: node render-v2.mjs --photos=<dir of upright T<n>.jpg> --out=<dir> [--only=n01,n02]
// Photos: public/images/tier_candidates rotated upright (see TC in concepts.py), e.g. prepared by prep-photos.py.

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ARG = k => process.argv.find(a => a.startsWith(`--${k}=`))?.split('=')[1]
const PHOTOS = ARG('photos'), OUT = ARG('out'), ONLY = ARG('only')?.split(',')
// --vision=<dir of <stem>.face.json> (Apple Vision, ~/charlotte-video-ads/lib/vision.swift): enables the face audit
const VISION = ARG('vision')
if (!PHOTOS || !OUT) throw new Error('need --photos=<dir> --out=<dir>')
const ROOT = path.resolve(__dirname, '../..')
const FDIR = path.join(ROOT, 'marketing/carousel/fonts')
const SELF = path.join(ROOT, 'public/images/self')

const enc = p => 'data:image/jpeg;base64,' + fs.readFileSync(p).toString('base64')
function dim(p) {
  const b = fs.readFileSync(p); let i = 2
  while (i < b.length) {
    const m = b[i + 1]
    if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return { w: b.readUInt16BE(i + 7), h: b.readUInt16BE(i + 5) }
    i += 2 + b.readUInt16BE(i + 2)
  }
  throw new Error(`no SOF in ${p}`)
}
const cache = new Map()
const facesOf = p => {
  const f = VISION && path.join(VISION, path.basename(p).replace(/\.jpe?g$/i, '.face.json'))
  if (!f || !fs.existsSync(f)) return []
  const j = JSON.parse(fs.readFileSync(f, 'utf8')), d = dim(p), k = d.w / j.w
  return j.faces.map(g => g.box.map(v => v * k))
}
const load = p => { if (!cache.has(p)) cache.set(p, { src: enc(p), ...dim(p), faces: facesOf(p) }); return cache.get(p) }
// top y for a text block of height h on a full-bleed photo so it clears every face: below the faces if it fits above
// the 1440 line (the deck's look), else above them (under the 270 story bar), else the lowest legal spot (audit flags it)
const clearTop = (ph, pos, h, { gap = 44, below = true } = {}) => {
  const c = coverAt(ph, 1080, 1920, pos), fs_ = ph.faces.map(b => [c.y + b[1] * c.k, c.y + (b[1] + b[3]) * c.k]).filter(f => f[1] > 0 && f[0] < 1920)
  if (!fs_.length) return 1440 - h
  const lo = Math.max(...fs_.map(f => f[1])) + gap, hi = Math.min(...fs_.map(f => f[0])) - gap
  if (below && lo + h <= 1440) return Math.round(Math.max(lo, 1440 - h - 120))
  if (hi - h >= 270) return Math.round(Math.min(hi - h, 420))
  if (!below && lo + h <= 1440) return Math.round(lo)
  return 1440 - h
}
// invisible face markers for a photo drawn at scale k with its top-left at (x, y); the audit fails text over them
const fb = (ph, k, x, y) => ph.faces.map(b => `<div class="fbox" style="position:absolute;left:${(x + b[0] * k).toFixed(0)}px;top:${(y + b[1] * k).toFixed(0)}px;width:${(b[2] * k).toFixed(0)}px;height:${(b[3] * k).toFixed(0)}px;pointer-events:none"></div>`).join('')
// object-fit:cover geometry for a W×H box and a CSS object-position like 'center 30%'
const coverAt = (ph, W, H, pos = 'center 30%') => {
  const [px, py] = pos.split(' ').map(v => v === 'center' ? 0.5 : v === 'top' ? 0 : v === 'bottom' ? 1 : parseFloat(v) / 100)
  const k = Math.max(W / ph.w, H / ph.h)
  return { k, x: (W - ph.w * k) * px, y: (H - ph.h * k) * (py ?? 0.5) }
}
const T = n => load(path.join(PHOTOS, `T${n}.jpg`))
const S = f => load(path.join(SELF, f))

const CITY = 'Charlotte'
const SE = "Georgia, 'Times New Roman', serif"
const RD = "'Poppins', 'Arial Rounded MT Bold', sans-serif"
const HW = "'Caveat', 'Bradley Hand', cursive"
const SANS = "-apple-system, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif"
const SH = 'text-shadow:0 2px 8px rgba(0,0,0,0.85),0 12px 50px rgba(0,0,0,0.6);'
const fontB64 = f => fs.readFileSync(path.join(FDIR, f)).toString('base64')
const face = (fam, file, weight) => `@font-face{font-family:'${fam}';font-weight:${weight};font-style:normal;font-display:block;src:url(data:font/woff2;base64,${fontB64(file)}) format('woff2');}`
const FONTCSS = [face('Poppins', 'poppins-700.woff2', '700'), face('Caveat', 'caveat-700.woff2', '700')].join('')

// ---- helpers (same look as the v2i story renderer) ----
const BADGE_BG = `<div style="position:absolute;top:0;right:0;width:620px;height:300px;z-index:55;pointer-events:none;background:radial-gradient(125% 125% at 100% 0%,rgba(0,0,0,0.6) 0%,rgba(0,0,0,0.3) 40%,transparent 70%);"></div>`
const BADGE = `<div style="position:absolute;top:52px;right:54px;z-index:60;text-align:right;text-shadow:0 2px 12px rgba(0,0,0,0.95),0 1px 3px rgba(0,0,0,0.9);">
  <div style="font-family:${SE};font-size:50px;font-weight:700;letter-spacing:0.15em;color:#fff;line-height:1;">${CITY.toUpperCase()}</div>
  <div style="display:flex;align-items:center;justify-content:flex-end;gap:15px;margin-top:13px;">
    <span style="width:70px;height:2px;background:rgba(255,255,255,0.8);display:inline-block;"></span>
    <span style="font-family:${RD};font-size:22px;font-weight:600;letter-spacing:0.28em;color:#fff;">FREE PHOTO SHOOT</span>
  </div></div>`
const grain = (o = 0.06) => `<div style="position:absolute;inset:0;pointer-events:none;opacity:${o};mix-blend-mode:soft-light;background-image:repeating-linear-gradient(0deg,rgba(255,255,255,0.08) 0 1px,transparent 1px 4px);"></div>`
const shadow = 'box-shadow:0 16px 44px rgba(0,0,0,0.55),0 3px 10px rgba(0,0,0,0.3);'
const TITLE = (txt, size = 64) => `<p style="font-family:${SE};font-style:italic;font-size:${size}px;font-weight:700;color:#fff;margin:0;line-height:1.0;">${txt}</p>`
const SUB = (txt, size = 35, top = 20) => `<p style="font-family:${SE};font-size:${size}px;font-style:italic;color:rgba(255,255,255,0.85);margin:${top}px 0 0;line-height:1.3;">${txt}</p>`
const frame = (inner, bg = '#000', badge = true) => `<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:${bg};">${inner}${badge ? BADGE_BG + BADGE : ''}</div>`
const img = (ph, pos = 'center 30%', extra = '') => { const c = coverAt(ph, 1080, 1920, pos); return `<img src="${ph.src}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:${pos};display:block;${extra}"/>${fb(ph, c.k, c.x, c.y)}` }
const TOPBOT = 'linear-gradient(180deg,rgba(0,0,0,0.45) 0%,transparent 28%,transparent 50%,rgba(0,0,0,0.88) 100%)'
const LOW = 'linear-gradient(180deg,transparent 0%,transparent 40%,rgba(0,0,0,0.5) 60%,rgba(0,0,0,0.92) 100%)'
const bleed = (ph, overlay, { pos, scrim = TOPBOT, badge = true } = {}) => frame(`${img(ph, pos)}<div style="position:absolute;inset:0;background:${scrim};"></div>${overlay}${grain(0.07)}`, '#000', badge)
const dark = (inner, badge = true) => frame(inner + grain(), '#0a0a0a', badge)
const pr = (ph, l, t, w, rot) => { const h = Math.round(w * ph.h / ph.w); return `<div style="position:absolute;left:${l}px;top:${t}px;width:${w + 24}px;height:${h + 26}px;background:#fafafa;padding:12px 12px 14px;transform:rotate(${rot}deg);${shadow}"><img src="${ph.src}" style="width:${w}px;height:${h}px;object-fit:cover;display:block;"/>${fb(ph, w / ph.w, 12, 12)}</div>` }
const tile = (ph, l, t, w, h, pos = 'center 30%') => { const c = coverAt(ph, w, h, pos); return `<img src="${ph.src}" style="position:absolute;left:${l}px;top:${t}px;width:${w}px;height:${h}px;object-fit:cover;object-position:${pos};display:block;"/>${fb(ph, c.k, l + c.x, t + c.y)}` }
const hook = (top, big, small, sub) => `<div style="position:absolute;top:${top}px;left:56px;right:56px;text-align:center;">
   <p style="font-family:${SE};font-size:150px;font-weight:700;font-style:italic;color:#fff;margin:0;line-height:0.88;${SH}">${big}</p>
   <p style="font-family:${SE};font-size:80px;font-weight:700;font-style:italic;color:#fff;margin:12px 0 0;line-height:0.98;${SH}">${small}</p>
   ${sub ? `<p style="font-family:${SE};font-size:34px;font-style:italic;color:rgba(255,255,255,0.9);margin:28px 0 0;${SH}">${sub}</p>` : ''}</div>`
const hand = (top, l1, l2, line, size = 138) => `<div style="position:absolute;top:${top}px;left:56px;right:56px;text-align:center;">
   <p style="font-family:${HW};font-size:${size}px;font-weight:700;color:#fff;margin:0;line-height:0.95;${SH}">${l1}</p>
   ${l2 ? `<p style="font-family:${HW};font-size:${size}px;font-weight:700;color:#fff;margin:0;line-height:0.95;${SH}">${l2}</p>` : ''}
   ${line ? `<p style="font-family:${SE};font-size:34px;color:rgba(255,255,255,0.92);margin:30px 0 0;${SH}">${line}</p>` : ''}</div>`
const cap = (top, big, small) => `<div style="position:absolute;top:${top}px;left:64px;right:64px;text-align:center;">
   <p style="font-family:${SE};font-style:italic;font-size:66px;font-weight:700;color:#fff;margin:0;line-height:1.02;${SH}">${big}</p>
   ${small ? `<p style="font-family:${SE};font-size:36px;font-style:italic;color:rgba(255,255,255,0.92);margin:18px 0 0;line-height:1.3;${SH}">${small}</p>` : ''}</div>`
const CHAT = ['Interested?', "Let's chat."]
const ctaCard = (ph, pos) => bleed(ph, hand(clearTop(ph, pos, 345), ...CHAT, `I'm only in ${CITY} for a short time — let's shoot.`), { pos, scrim: LOW })
const HOOK_H = 300, hookOn = (ph, pos, small, sub) => hook(clearTop(ph, pos, sub ? HOOK_H : 240), CITY, small, sub)

const ABOUT = dark(`
  <div style="position:absolute;top:240px;left:60px;right:60px;text-align:center;">${TITLE('about me')}</div>
  <div style="position:absolute;top:400px;left:120px;right:120px;text-align:center;">
    <p style="font-family:${SE};font-size:36px;color:rgba(255,255,255,0.94);line-height:1.42;margin:0;">hi, i'm aidan — a photographer from the USA. for the past 3 years i've been traveling the world taking portraits.</p>
    <p style="font-family:${SE};font-size:36px;color:rgba(255,255,255,0.94);line-height:1.42;margin:24px 0 0;">right now i'm back in the States, and i'm shooting in ${CITY}.</p>
    <p style="font-family:${SE};font-size:36px;color:rgba(255,255,255,0.94);line-height:1.42;margin:24px 0 0;">if you're here, let's make something special.</p></div>
  <img src="${S('aidan-udaipur-mirror-03.jpg').src}" style="position:absolute;left:310px;top:880px;width:460px;height:631px;object-fit:cover;object-position:center top;display:block;border-radius:28px;border:12px solid #fafafa;${shadow}"/>`)
const HOW = dark(`
  <div style="position:absolute;top:250px;left:60px;right:60px;text-align:center;">${TITLE('how it works')}</div>
  <div style="position:absolute;top:500px;left:120px;right:120px;">
  ${[['1', 'Message me', 'Tap the button — takes a minute.'], ['2', 'We plan it', 'A quick chat to pick the spot, time & look.'], ['3', 'We shoot', 'About an hour. I direct every frame.']].map(s => `<div style="display:flex;gap:30px;align-items:flex-start;margin:0 0 58px;"><span style="font-family:${SE};font-size:78px;font-weight:700;color:rgba(255,255,255,0.5);line-height:0.9;width:70px;flex:none;">${s[0]}</span><div><p style="font-family:${SE};font-size:44px;font-weight:700;color:#fff;margin:0;line-height:1.1;">${s[1]}</p><p style="font-family:${SE};font-size:30px;font-style:italic;color:rgba(255,255,255,0.72);margin:10px 0 0;line-height:1.35;">${s[2]}</p></div></div>`).join('')}
  </div>`)

// ---- the concepts: id → list of [slide name, html] ----
const C = {}

// CONTROL: the winning deck, photo-swapped. 7 cards (film card dropped).
C.c00 = [
  ['01-hook', bleed(T(62), hookOn(T(62), 'center 30%', 'Free Photo Shoot.', 'Want photos like these? →'), { badge: false })],
  ['02-work', dark(`<div style="position:absolute;top:200px;left:60px;right:60px;text-align:center;">${TITLE('my recent work')}</div>
     ${pr(T(54), 45, 470, 350, -5)}${pr(T(37), 615, 430, 370, 4)}${pr(T(25), 100, 1060, 360, 3)}${pr(T(70), 605, 1075, 370, -4)}${pr(T(47), 360, 745, 340, 2)}`)],
  ['03-about', ABOUT],
  ['04-nervous', dark(`<div style="position:absolute;top:220px;left:64px;right:64px;text-align:center;">${TITLE('never done this before?', 60)}${SUB("don't worry — i'll direct you through every frame.")}</div>
     ${pr(T(6), 45, 500, 350, -5)}${pr(T(12), 615, 460, 370, 4)}${pr(T(61), 100, 1080, 360, 3)}${pr(T(35), 605, 1090, 370, -4)}${pr(T(56), 360, 775, 340, 2)}`)],
  ['05-now', dark(`<div style="position:absolute;top:240px;left:60px;right:60px;text-align:center;">${TITLE(`now in ${CITY}`)}${SUB("it's totally free", 38, 24)}</div>${pr(T(8), 200, 600, 640, -1.5)}`)],
  ['06-how', HOW],
  ['07-cta', ctaCard(T(59), 'center 25%')],
]

// N1 ONE FRAME: the whole ad on card 1 (no swipe decay). Three heroes = three ads; Meta picks the winner.
const one = (ph, pos) => { const top = clearTop(ph, pos, 330); return [['01-only', bleed(ph, hook(top, CITY, 'Free Photo Shoot.') + hand(top + 250, "Interested? Let's chat.", '', '', 76), { pos, badge: false })]] }
C.n01a = one(T(62), 'center 25%')
C.n01b = one(T(54), 'center 30%')
C.n01c = one(T(6), 'center 25%')

// N2 FACE WALL: twelve faces fill the screen in two blocks; the city band sits in the gap between them, over no face.
{
  const faces = [37, 62, 54, 6, 12, 70, 76, 25, 47, 61, 14, 88]
  const w = 360, rows = [[0, 425], [425, 425], [1180, 370], [1550, 370]]
  const grid = faces.map((n, i) => { const [y, h] = rows[Math.floor(i / 3)]; return tile(T(n), (i % 3) * w, y, w, h, 'center 28%') }).join('')
  C.n02 = [['01-wall', frame(`${grid}<div style="position:absolute;left:0;right:0;top:850px;height:330px;background:#0a0a0a;"></div>
    <div style="position:absolute;top:868px;left:40px;right:40px;text-align:center;">
      <p style="font-family:${SE};font-size:132px;font-weight:700;font-style:italic;color:#fff;margin:0;line-height:0.95;">${CITY}</p>
      <p style="font-family:${SE};font-size:72px;font-weight:700;font-style:italic;color:#fff;margin:6px 0 0;">Free Photo Shoot.</p>
      <p style="font-family:${SE};font-size:32px;font-style:italic;color:rgba(255,255,255,0.85);margin:14px 0 0;">you could be the next frame →</p></div>`, '#000', false)],
    ['02-cta', ctaCard(T(61), 'center 22%')]]
}

// N3 QUESTION HOOK: asks the viewer something only they can answer.
C.n03 = [
  ['01-question', bleed(T(76), `<div style="position:absolute;top:300px;left:70px;right:70px;text-align:center;">
     <p style="font-family:${SE};font-size:92px;font-weight:700;font-style:italic;color:#fff;margin:0;line-height:1.02;${SH}">Have you ever had real photos taken of you?</p>
     <p style="font-family:${SE};font-size:40px;font-style:italic;color:rgba(255,255,255,0.92);margin:34px 0 0;${SH}">${CITY} · free photo shoot</p></div>`, { pos: 'center 40%', scrim: 'linear-gradient(180deg,rgba(0,0,0,0.75) 0%,rgba(0,0,0,0.3) 45%,transparent 65%,rgba(0,0,0,0.6) 100%)', badge: false })],
  ['02-like-these', dark(`<div style="position:absolute;top:220px;left:60px;right:60px;text-align:center;">${TITLE('not selfies. portraits.')}${SUB('about an hour, i direct everything.')}</div>
     ${pr(T(37), 70, 480, 440, -3)}${pr(T(87), 570, 520, 440, 3)}`)],
  ['03-cta', ctaCard(T(47), 'center 25%')],
]

// N4 NOTES APP: looks like a normal story someone posted, not an ad.
C.n04 = [
  ['01-note', frame(`<div style="position:absolute;inset:0;background:#fbfaf6;"></div>
    <div style="position:absolute;top:150px;left:70px;right:70px;font-family:${SANS};color:#1c1c1e;">
      <p style="font-size:30px;color:#e0a100;margin:0 0 40px;font-weight:600;">‹ Notes</p>
      <p style="font-size:60px;font-weight:700;margin:0 0 30px;line-height:1.1;">free photo shoots in charlotte📍</p>
      <p style="font-size:42px;margin:0 0 18px;line-height:1.35;">i'm a portrait photographer, in town for a few weeks.</p>
      <p style="font-size:42px;margin:0 0 18px;line-height:1.35;">– no experience needed, i direct everything<br>– about an hour, anywhere in the city<br>– you keep the edited photos<br>– $0</p>
      <p style="font-size:42px;margin:26px 0 0;line-height:1.35;">tap the button and say hi 👋</p></div>
    ${tile(T(54), 90, 1090, 430, 560)}${tile(T(37), 560, 1090, 430, 560)}`, '#fbfaf6', false)],
  ['02-cta', ctaCard(T(62), 'center 25%')],
]

// N5 WHERE SHOULD WE SHOOT: local recognition + a question the ice breakers repeat.
{
  const spots = ['NoDa', 'South End', 'Freedom Park', 'Uptown']
  C.n05 = [['01-pick', bleed(T(47), `<div style="position:absolute;top:290px;left:90px;right:90px;text-align:center;">
      <p style="font-family:${SE};font-size:96px;font-weight:700;font-style:italic;color:#fff;margin:0;line-height:1.0;${SH}">${CITY},<br>where should we shoot?</p></div>
      <div style="position:absolute;top:${clearTop(T(47), 'center 30%', 300)}px;left:80px;right:80px;display:grid;grid-template-columns:1fr 1fr;gap:22px;">${spots.map(s => `<div data-text style="background:rgba(255,255,255,0.94);border-radius:60px;padding:24px 0;text-align:center;font-family:${RD};font-size:38px;font-weight:700;color:#111;">${s}</div>`).join('')}</div>
      <div style="position:absolute;top:${clearTop(T(47), 'center 30%', 300) + 240}px;left:60px;right:60px;text-align:center;"><p style="font-family:${SE};font-size:38px;font-style:italic;color:#fff;margin:0;${SH}">free photo shoot · message me your pick</p></div>`, { pos: 'center 30%', scrim: 'linear-gradient(180deg,rgba(0,0,0,0.65) 0%,rgba(0,0,0,0.35) 50%,rgba(0,0,0,0.75) 100%)', badge: false })]]
}

// N6 THE DM: shows exactly what happens after the tap.
{
  const b = (txt, me) => `<div style="display:flex;justify-content:${me ? 'flex-end' : 'flex-start'};margin:0 0 22px;"><div style="max-width:720px;padding:26px 34px;border-radius:44px;font-family:${SANS};font-size:40px;line-height:1.3;${me ? 'background:linear-gradient(135deg,#7b4dff,#3a7bff);color:#fff;' : 'background:#262626;color:#f2f2f2;'}">${txt}</div></div>`
  C.n06 = [['01-dm', dark(`<div style="position:absolute;top:230px;left:60px;right:60px;text-align:center;">${TITLE(`free photo shoot in ${CITY}`, 58)}${SUB('this is all it takes:')}</div>
      <div style="position:absolute;top:500px;left:70px;right:70px;">
      ${b('hi! is the photo shoot really free?', false)}${b('yes, totally free 🙂 i\'m building my portfolio here', true)}${b('ok i\'m in. i\'ve never done this before', false)}${b('perfect, i direct everything. when works for you this week?', true)}</div>
      ${pr(T(61), 300, 1180, 230, -4)}${pr(T(37), 560, 1200, 230, 4)}`)],
    ['02-cta', ctaCard(T(54), 'center 30%')]]
}

// N7 CAMERA ROLL vs ONE HOUR: contrast the viewer already feels.
{
  const roll = ['car selfie', 'blurry group pic', 'mirror pic', 'cropped out', 'thumb in frame', 'screenshot', 'car selfie #2', 'red eye', 'concert (blurry)']
  C.n07 = [['01-vs', frame(`<div style="position:absolute;inset:0 0 960px 0;background:#d9d9de;"></div>
     ${roll.map((t, i) => `<div style="position:absolute;left:${70 + (i % 3) * 320}px;top:${260 + Math.floor(i / 3) * 220}px;width:300px;height:200px;background:#c4c4ca;display:flex;align-items:center;justify-content:center;font-family:${SANS};font-size:28px;color:#6b6b72;">${t}</div>`).join('')}
     <p style="position:absolute;top:150px;left:0;right:0;text-align:center;font-family:${SANS};font-size:44px;font-weight:600;color:#3a3a3f;margin:0;">your camera roll</p>
     ${tile(T(62), 0, 960, 1080, 960, 'center 20%')}<div style="position:absolute;left:0;right:0;top:960px;height:960px;background:linear-gradient(180deg,rgba(0,0,0,0.55),transparent 35%);"></div>
     <div style="position:absolute;top:1000px;left:60px;right:60px;text-align:center;"><p style="font-family:${SE};font-size:66px;font-weight:700;font-style:italic;color:#fff;margin:0;${SH}">one hour with me</p>
     <p style="font-family:${SE};font-size:36px;font-style:italic;color:#fff;margin:14px 0 0;${SH}">${CITY} · free photo shoot</p></div>`, '#000', false)],
    ['02-cta', ctaCard(T(6), 'center 25%')]]
}

// N8 BRING A FRIEND: pairs feel safer and each yes brings a second person.
C.n08 = [['01-duo', dark(`<div style="position:absolute;top:230px;left:56px;right:56px;text-align:center;">
     <p style="font-family:${SE};font-size:150px;font-weight:700;font-style:italic;color:#fff;margin:0;line-height:0.88;">${CITY}</p>
     <p style="font-family:${SE};font-size:76px;font-weight:700;font-style:italic;color:#fff;margin:14px 0 0;line-height:1;">free shoot for two.</p>
     ${SUB('bring your best friend →', 38, 26)}</div>
     ${pr(T(54), 70, 640, 440, -3)}${pr(T(6), 560, 680, 440, 3)}`, false)],
  ['02-cta', ctaCard(T(25), 'center 25%')]]

// N9 CALLOUT 5: the structure of the one English ad that worked (antalya - dm, 4.17% CTR), no "models" wording.
C.n09 = [
  ['01-callout', bleed(T(37), `<div style="position:absolute;top:${clearTop(T(37), 'center 25%', 300)}px;left:60px;right:60px;text-align:center;">
     <p style="font-family:${SE};font-size:150px;font-weight:700;font-style:italic;color:#fff;margin:0;line-height:0.88;${SH}">${CITY}</p>
     <p style="font-family:${SE};font-size:62px;font-weight:700;font-style:italic;color:#fff;margin:22px 0 0;line-height:1.05;${SH}">I'm looking for people<br>to photograph.</p></div>`, { pos: 'center 25%', badge: false })],
  ['02-a', bleed(T(54), cap(1140, 'no experience needed', 'i direct every frame'), { pos: 'center 30%', scrim: LOW })],
  ['03-b', bleed(T(61), cap(1140, 'about an hour', 'anywhere in the city'), { pos: 'center 22%', scrim: LOW })],
  ['04-c', bleed(T(12), cap(1140, 'free', 'you keep the edited photos'), { pos: 'center 30%', scrim: LOW })],
  ['05-cta', ctaCard(T(6), 'center 25%')],
]

// N10 EYE-CONTACT REEL (stills = keyframes): one face per beat, the type never moves.
{
  const beats = [[62, '0.0s'], [37, '0.6s'], [76, '1.2s'], [54, '1.8s'], [12, '2.4s'], [6, '3.0s']]
  C.n10 = beats.map(([n, t], i) => [`${String(i + 1).padStart(2, '0')}-${t}`, bleed(T(n), hookOn(T(n), 'center 25%', 'Free Photo Shoot.', i === beats.length - 1 ? "interested? let's chat →" : ''), { pos: 'center 25%', badge: false })])
}

// N11 HI, I'M AIDAN (needs a 10s selfie video; stills show the beats).
C.n11 = [
  ['01-hi', bleed(S('aidan-udaipur-mirror-01.jpg'), `<div style="position:absolute;top:${clearTop(S('aidan-udaipur-mirror-01.jpg'), 'center 30%', 270)}px;left:70px;right:70px;text-align:center;">
     <p style="font-family:${HW};font-size:120px;font-weight:700;color:#fff;margin:0;line-height:1;${SH}">hi, i'm aidan 👋</p>
     <p style="font-family:${SE};font-size:44px;font-style:italic;color:#fff;margin:26px 0 0;line-height:1.3;${SH}">i take portraits, and i'm in ${CITY} for a few weeks.</p></div>`, { pos: 'center 30%', scrim: LOW, badge: false })],
  ['02-work', bleed(T(59), cap(clearTop(T(59), 'center 22%', 160), "here's what i shoot", 'and i want to photograph you, for free'), { pos: 'center 22%', scrim: LOW })],
  ['03-cta', ctaCard(T(54), 'center 30%')],
]

// N12 BEFORE THE LEAVES DROP: an honest seasonal deadline (needs real dates before launch).
C.n12 = [['01-fall', bleed(T(32), `<div style="position:absolute;top:${clearTop(T(32), 'center 40%', 300)}px;left:60px;right:60px;text-align:center;">
    <p style="font-family:${SE};font-size:150px;font-weight:700;font-style:italic;color:#fff;margin:0;line-height:0.88;${SH}">${CITY}</p>
    <p style="font-family:${SE};font-size:70px;font-weight:700;font-style:italic;color:#fff;margin:14px 0 0;line-height:1.02;${SH}">free photo shoots,<br>before the leaves drop.</p></div>`, { pos: 'center 40%', scrim: TOPBOT, badge: false })],
  ['02-cta', ctaCard(T(64), 'center 25%')]]

async function render() {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 })
  // --only re-renders merge into the existing index instead of replacing it
  const IDX = path.join(OUT, 'index.json')
  const faceFails = []
  const report = fs.existsSync(IDX) ? JSON.parse(fs.readFileSync(IDX, 'utf8')) : {}
  for (const [id, slides] of Object.entries(C)) {
    if (ONLY && !ONLY.includes(id)) continue
    const dir = path.join(OUT, id); fs.mkdirSync(dir, { recursive: true })
    report[id] = []
    for (const [name, html] of slides) {
      const page = await ctx.newPage()
      await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${FONTCSS}*{box-sizing:border-box}html,body{margin:0;width:1080px;height:1920px;background:#000;overflow:hidden}body{-webkit-font-smoothing:antialiased}</style></head><body>${html}</body></html>`, { waitUntil: 'load' })
      await page.evaluate(() => document.fonts.ready)
      // safe zone: ad text stays inside the canvas and above y=1440 (bottom quadrant is covered by the CTA bar);
      // the control keeps the winner's own layout, so it is reported, not failed
      const bad = await page.evaluate(() => [...document.querySelectorAll('p')].filter(p => { const r = p.getBoundingClientRect(); return r.right > 1081 || r.left < -1 || r.bottom > 1440 }).map(p => `${p.textContent.slice(0, 30)}@${Math.round(p.getBoundingClientRect().bottom)}`))
      if (bad.length) console.warn(`  ! ${id}/${name} text below 1440 or off-canvas:`, bad.join(' | '))
      const onFace = await page.evaluate(() => {
        const R = (a, b) => Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top))
        const faces = [...document.querySelectorAll('.fbox')].map(e => e.getBoundingClientRect()).filter(f => f.right > 0 && f.left < 1080 && f.bottom > 0 && f.top < 1920)
        return [...document.querySelectorAll('p,[data-text]')].filter(p => !p.closest('[data-card]')).flatMap(p => { const rg = document.createRange(); rg.selectNodeContents(p); const b = rg.getBoundingClientRect()
          return faces.filter(f => R(b, f) > 0.04 * f.width * f.height).map(() => p.textContent.slice(0, 30)) })
      })
      if (onFace.length) { faceFails.push(`${id}/${name}: ${[...new Set(onFace)].join(' | ')}`); console.error(`  ✗ ${id}/${name} text over a face:`, [...new Set(onFace)].join(' | ')) }
      await page.screenshot({ path: path.join(dir, `${name}.jpg`), type: 'jpeg', quality: 90 })
      await page.close()
      report[id].push(name)
    }
    console.log(`${id}: ${slides.length} -> ${path.relative(process.cwd(), dir)}`)
  }
  await browser.close()
  fs.writeFileSync(IDX, JSON.stringify(report, null, 1))
  if (!VISION) console.warn('  (no --vision: face audit skipped)')
  if (faceFails.length) { console.error(`${faceFails.length} slide(s) put text over a face`); process.exitCode = 1 }
}
render()
