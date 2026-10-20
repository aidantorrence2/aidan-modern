import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

// CHARLOTTE v3 — photo-heavy still ads (Aidan, 20 Oct: "more photo ads. and use more photos in the ads").
// Every ad shows many photos at once (grids, strips, scattered prints, 10-card carousels), ONLY from
// public/images/top_tier_candidates (his picks, women and men). Same type system, same face audit as render-v2.mjs:
// text never sits on a face (--vision), all text above y=1440.
//
// Usage: node render-v3.mjs --photos=<dir of upright T<n>.jpg> --vision=<dir> --out=<dir> [--only=p01,p02]
// Photos: ~/charlotte-video-ads/work/src (upright T<n>.jpg; stems in TOP below).

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


// ---- his picks (top_tier_candidates), by the T numbers used everywhere else ----
const W_ = ['T0', 'T3', 'T7', 'T8', 'T10', 'T11', 'T13', 'T14', 'T21', 'T23', 'T31', 'T32', 'T34', 'T35', 'T48', 'T49', 'T58', 'T63', 'T64', 'T73', 'T75']
const M_ = ['T16', 'T18', 'T20', 'T39', 'T44', 'T83', 'T85', 'T89', 'T91', 'T92']
const TOP = [...W_, ...M_]
const P = s => { if (!TOP.includes(s)) throw new Error(`not a top pick: ${s}`); return T(+s.slice(1)) }
// interleave women and men so every grid reads as both
const mix = (ws, ms) => { const o = []; for (let i = 0; i < Math.max(ws.length, ms.length); i++) { if (ws[i]) o.push(ws[i]); if (ms[i]) o.push(ms[i]) } return o }
const C = {}
const band = (top, h, inner, bg = '#0a0a0a') => `<div style="position:absolute;left:0;right:0;top:${top}px;height:${h}px;background:${bg};"></div><div style="position:absolute;top:${top}px;left:40px;right:40px;height:${h}px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;">${inner}</div>`
const cityBig = (size = 132, small = 'Free Photo Shoot.', smallSize = 70) => `<p style="font-family:${SE};font-size:${size}px;font-weight:700;font-style:italic;color:#fff;margin:0;line-height:0.95;">${CITY}</p>
  <p style="font-family:${SE};font-size:${smallSize}px;font-weight:700;font-style:italic;color:#fff;margin:8px 0 0;line-height:1;">${small}</p>`
const grid = (stems, x0, y0, cols, w, h, gap = 0, pos = 'center 28%') => stems.map((s, i) => tile(P(s), x0 + (i % cols) * (w + gap), y0 + Math.floor(i / cols) * (h + gap), w, h, pos)).join('')

// P1 GRID 16: four columns, two blocks of faces with the city band in the gap.
{
  const s = mix(['T31', 'T10', 'T14', 'T64', 'T73', 'T58', 'T49', 'T7'], ['T39', 'T91', 'T16', 'T89', 'T20', 'T83', 'T18', 'T85'])
  C.p01 = [['01-grid', frame(`${grid(s.slice(0, 8), 0, 0, 4, 270, 430)}${grid(s.slice(8), 0, 1180, 4, 270, 370)}
    ${band(860, 320, cityBig(128, 'Free Photo Shoot.', 66) + `<p style="font-family:${SE};font-size:32px;font-style:italic;color:rgba(255,255,255,.85);margin:14px 0 0;">women & men · no experience needed →</p>`)}`, '#000', false)],
    ['02-cta', ctaCard(P('T35'), 'center 25%')]]
}

// P2 TEN-CARD CAROUSEL: one portrait per card, a short line in the clear space under each face.
{
  const cards = [['T49', 'no experience needed'], ['T39', 'i direct every pose'], ['T14', 'about an hour'], ['T91', 'anywhere in the city'],
    ['T73', 'you keep the photos'], ['T16', 'come as you are'], ['T58', 'bring a friend'], ['T89', 'it\'s free']]
  C.p02 = [['01-hook', bleed(P('T64'), hookOn(P('T64'), 'center 30%', 'Free Photo Shoot.', 'swipe → 8 people, 8 portraits'), { pos: 'center 30%', badge: false })],
    ...cards.map(([s, line], i) => [`${String(i + 2).padStart(2, '0')}-${s}`, bleed(P(s), cap(clearTop(P(s), 'center 28%', 90), line, ''), { pos: 'center 28%', scrim: LOW })]),
    ['10-cta', ctaCard(P('T35'), 'center 25%')]]
}

// P3 PHOTO-BOOTH STRIPS: three strips of four frames (12 photos) under the headline.
{
  const strips = [['T31', 'T39', 'T10', 'T91'], ['T16', 'T14', 'T89', 'T73'], ['T58', 'T20', 'T49', 'T83']]
  const sx = [70, 390, 710], rot = [-3, 1.5, -1.5]
  C.p03 = [['01-strips', dark(`<div style="position:absolute;top:270px;left:60px;right:60px;text-align:center;">${cityBig(124, 'Free Photo Shoot.', 66)}</div>
    ${strips.map((st, i) => `<div style="position:absolute;left:${sx[i]}px;top:${600 + (i % 2) * 40}px;width:300px;padding:14px 14px 40px;background:#fafafa;transform:rotate(${rot[i]}deg);${shadow}">
      ${st.map((s, j) => `<div style="position:relative;width:272px;height:290px;margin:0 0 10px;">${tile(P(s), 0, 0, 272, 290, 'center 30%')}</div>`).join('')}</div>`).join('')}`, false)],
    ['02-cta', ctaCard(P('T48'), 'center 25%')]]
}

// P4 THE TABLE: nine prints scattered under the title.
{
  const spots = [[40, 470, 300, -6], [380, 440, 310, 3], [730, 470, 300, -2], [60, 900, 310, 4], [400, 860, 300, -3], [740, 900, 290, 5], [30, 1330, 300, -2], [380, 1300, 320, 2], [730, 1330, 300, -5]]
  const s = mix(['T10', 'T31', 'T58', 'T64', 'T49'], ['T39', 'T89', 'T91', 'T16'])
  C.p04 = [['01-table', dark(`<div style="position:absolute;top:250px;left:60px;right:60px;text-align:center;">${TITLE(`portraits from my last trip`, 58)}${SUB(`next stop: ${CITY} — free photo shoot`, 36, 16)}</div>
    ${s.map((st, i) => pr(P(st), ...spots[i])).join('')}`)], ['02-cta', ctaCard(P('T35'), 'center 25%')]]
}

// P5 HERO + RAIL: a big portrait up top, ten thumbnails underneath.
{
  const rail = mix(['T10', 'T14', 'T73', 'T58', 'T49'], ['T39', 'T91', 'T16', 'T89', 'T83'])
  C.p05 = [['01-rail', frame(`${tile(P('T64'), 0, 0, 1080, 1060, 'center 32%')}
    ${band(1060, 300, cityBig(120, 'Free Photo Shoot.', 62))}${grid(rail, 0, 1360, 5, 216, 280, 0)}`, '#000', false)],
    ['02-cta', ctaCard(P('T35'), 'center 25%')]]
}

// P6 NOTES + GALLERY (Aidan liked the Notes app): the note, then a 3×3 grid of nine portraits.
{
  const g9 = mix(['T31', 'T14', 'T64', 'T73', 'T10'], ['T39', 'T91', 'T16', 'T89'])
  C.p06 = [['01-note', frame(`<div style="position:absolute;inset:0;background:#fbfaf6;"></div>
    <div style="position:absolute;top:270px;left:70px;right:70px;font-family:${SANS};color:#1c1c1e;">
      <p style="font-size:30px;color:#e0a100;margin:0 0 26px;font-weight:600;">‹ Notes</p>
      <p style="font-size:58px;font-weight:700;margin:0 0 22px;line-height:1.1;">free photo shoots in charlotte📍</p>
      <p style="font-size:38px;margin:0 0 12px;line-height:1.35;">portrait photographer, in town for a few weeks. women & men, no experience needed — i direct everything. about an hour, you keep the photos, $0.</p>
      <p style="font-size:38px;margin:14px 0 0;line-height:1.35;">some recent ones ↓ tap the button and say hi 👋</p></div>
    ${grid(g9, 60, 1000, 3, 310, 300, 15)}`, '#fbfaf6', false)], ['02-cta', ctaCard(P('T48'), 'center 25%')]]
}

// P7 WINNER, MORE PHOTOS (Aidan liked the winner): same deck, nine prints on the work and nerves cards.
{
  const eight = (stems, y0) => { const sp = [[30, y0, 300, -5], [380, y0 - 20, 310, 3], [730, y0, 300, -3], [40, y0 + 440, 300, 4], [740, y0 + 430, 300, -4], [50, y0 + 880, 300, -2], [390, y0 + 860, 300, 2], [740, y0 + 870, 290, 5], [390, y0 + 420, 300, -1]]
    return stems.map((s, i) => pr(P(s), ...sp[i])).join('') }
  C.p07 = [
    ['01-hook', bleed(P('T64'), hookOn(P('T64'), 'center 30%', 'Free Photo Shoot.', 'Want photos like these? →'), { pos: 'center 30%', badge: false })],
    ['02-work', dark(`<div style="position:absolute;top:250px;left:60px;right:60px;text-align:center;">${TITLE('my recent work')}</div>${eight([...mix(['T10', 'T31', 'T14', 'T73'], ['T39', 'T89', 'T91', 'T16']), 'T64'], 420)}`)],
    ['03-about', ABOUT],
    ['04-nervous', dark(`<div style="position:absolute;top:250px;left:64px;right:64px;text-align:center;">${TITLE('never done this before?', 60)}${SUB("don't worry — i'll direct you through every frame.")}</div>${eight([...mix(['T58', 'T49', 'T7', 'T21'], ['T20', 'T83', 'T18', 'T85']), 'T23'], 470)}`)],
    ['05-now', dark(`<div style="position:absolute;top:250px;left:60px;right:60px;text-align:center;">${TITLE(`now in ${CITY}`)}${SUB("it's totally free", 38, 24)}</div>${pr(P('T8'), 60, 560, 460, -3)}${pr(P('T44'), 560, 600, 460, 3)}`)],
    ['06-how', HOW],
    ['07-cta', ctaCard(P('T35'), 'center 25%')]]
}

// P8 HI, I'M AIDAN CAROUSEL (Aidan liked it): the hello, then twelve portraits at once, then the CTA.
{
  const g12 = mix(['T31', 'T14', 'T64', 'T73', 'T10', 'T58'], ['T39', 'T91', 'T16', 'T89', 'T20', 'T83'])
  C.p08 = [
    ['01-hi', bleed(S('aidan-udaipur-mirror-01.jpg'), `<div style="position:absolute;top:${clearTop(S('aidan-udaipur-mirror-01.jpg'), 'center 30%', 270)}px;left:70px;right:70px;text-align:center;">
      <p style="font-family:${HW};font-size:120px;font-weight:700;color:#fff;margin:0;line-height:1;${SH}">hi, i'm aidan 👋</p>
      <p style="font-family:${SE};font-size:44px;font-style:italic;color:#fff;margin:26px 0 0;line-height:1.3;${SH}">i take portraits, and i'm in ${CITY} for a few weeks. swipe →</p></div>`, { pos: 'center 30%', scrim: LOW, badge: false })],
    ['02-twelve', frame(`${grid(g12.slice(0, 6), 0, 0, 3, 360, 420)}${band(840, 300, `<p style="font-family:${SE};font-size:66px;font-weight:700;font-style:italic;color:#fff;margin:0;">here's what i shoot</p><p style="font-family:${SE};font-size:36px;font-style:italic;color:rgba(255,255,255,.88);margin:14px 0 0;">and i'd like to photograph you, for free</p>`)}${grid(g12.slice(6), 0, 1140, 3, 360, 390)}`, '#000', false)],
    ['03-cta', ctaCard(P('T48'), 'center 25%')]]
}

// P9 PROFILE GRID: a portfolio grid of fifteen, with a plain header — feels like browsing a photographer's page.
{
  const g15 = mix(['T31', 'T14', 'T64', 'T73', 'T10', 'T58', 'T49', 'T7'], ['T39', 'T91', 'T16', 'T89', 'T20', 'T83', 'T18'])
  C.p09 = [['01-profile', frame(`<div style="position:absolute;inset:0;background:#0a0a0a;"></div>
    <div style="position:absolute;top:270px;left:60px;right:60px;font-family:${SANS};color:#f2f2f2;">
      <p style="font-size:44px;font-weight:700;margin:0;">aidan · portraits</p>
      <p style="font-size:34px;margin:12px 0 0;color:#d8d8d8;line-height:1.35;">📍 ${CITY} now — free photo shoots for anyone. message me 👇</p></div>
    ${grid(g15, 0, 520, 3, 358, 358, 3, 'center 25%')}`, '#0a0a0a', false)], ['02-cta', ctaCard(P('T35'), 'center 25%')]]
}

// P10 PAIRS: five cards, each a woman and a man side by side, one line in a band under them.
{
  const pairs = [['T31', 'T39', CITY, 'free photo shoot'], ['T14', 'T91', 'women & men', 'no experience needed'], ['T73', 'T16', 'about an hour', 'i direct everything'],
    ['T58', 'T89', 'you keep the photos', 'it costs $0'], ['T10', 'T20', "Interested?", "Let's chat."]]
  C.p10 = pairs.map(([a, b, l1, l2], i) => [`${String(i + 1).padStart(2, '0')}-pair`, frame(`${tile(P(a), 0, 0, 538, 1180, 'center 30%')}${tile(P(b), 542, 0, 538, 1180, 'center 30%')}
    <div style="position:absolute;left:0;right:0;top:1180px;bottom:0;background:#0a0a0a;"></div>${band(1185, 250, `<p style="font-family:${i === 4 ? HW : SE};font-size:${i === 0 ? 120 : i === 4 ? 110 : 76}px;font-weight:700;font-style:${i === 4 ? 'normal' : 'italic'};color:#fff;margin:0;line-height:1;">${l1}</p><p style="font-family:${i === 4 ? HW : SE};font-size:${i === 4 ? 110 : 44}px;font-weight:700;font-style:${i === 4 ? 'normal' : 'italic'};color:rgba(255,255,255,.9);margin:10px 0 0;line-height:1;">${l2}</p>`)}`, '#000', false)])
}

// P10b PAIRS, new copy (Aidan, 20 Oct: "p10 is decent but the copy sucks"): same photos, the cards read as one short
// story in his voice instead of a feature list. Lowercase like the deck's about card; city big on card 1.
{
  const story = [['T31', 'T39', CITY, 'free photo shoot.', 120, 70, SE],
    ['T14', 'T91', "i'm aidan, a portrait photographer.", "i'm in charlotte for a few weeks.", 60, 40, SE],
    ['T73', 'T16', 'never posed before?', "perfect. i'll guide you through it.", 72, 40, SE],
    ['T58', 'T89', 'come alone or bring a friend.', "we'll pick a spot you love.", 64, 40, SE],
    ['T10', 'T20', 'Interested?', "Let's chat.", 110, 110, HW]]
  C.p10b = story.map(([a, b, l1, l2, s1, s2, font], i) => [`${String(i + 1).padStart(2, '0')}-pair`, frame(`${tile(P(a), 0, 0, 538, 1180, 'center 30%')}${tile(P(b), 542, 0, 538, 1180, 'center 30%')}
    <div style="position:absolute;left:0;right:0;top:1180px;bottom:0;background:#0a0a0a;"></div>${band(1185, 250, `<p style="font-family:${font};font-size:${s1}px;font-weight:700;font-style:${font === HW ? 'normal' : 'italic'};color:#fff;margin:0;line-height:1.02;">${l1}</p><p style="font-family:${font};font-size:${s2}px;font-weight:${font === HW ? 700 : 400};font-style:${font === HW ? 'normal' : 'italic'};color:rgba(255,255,255,.9);margin:12px 0 0;line-height:1.1;">${l2}</p>`)}`, '#000', false)])
}

// P10c PAIRS (Aidan, 20 Oct: "come alone or bring a friend? ..." / "never posed before? ... this sucks too"): cards 3–4
// now use only lines from his own winning deck ("my recent work", "About an hour. I direct every frame."); no invented
// reassurance, nothing about coming alone.
{
  const story = [['T31', 'T39', CITY, 'free photo shoot.', 120, 70, SE],
    ['T14', 'T91', "i'm aidan, a portrait photographer.", "i'm in charlotte for a few weeks.", 60, 40, SE],
    ['T73', 'T16', 'my recent work', '', 80, 0, SE],
    ['T58', 'T89', 'about an hour.', 'i direct every frame.', 80, 48, SE],
    ['T10', 'T20', 'Interested?', "Let's chat.", 110, 110, HW]]
  C.p10c = story.map(([a, b, l1, l2, s1, s2, font], i) => [`${String(i + 1).padStart(2, '0')}-pair`, frame(`${tile(P(a), 0, 0, 538, 1180, 'center 30%')}${tile(P(b), 542, 0, 538, 1180, 'center 30%')}
    <div style="position:absolute;left:0;right:0;top:1180px;bottom:0;background:#0a0a0a;"></div>${band(1185, 250, `<p style="font-family:${font};font-size:${s1}px;font-weight:700;font-style:${font === HW ? 'normal' : 'italic'};color:#fff;margin:0;line-height:1.02;">${l1}</p>${l2 ? `<p style="font-family:${font};font-size:${s2}px;font-weight:${font === HW ? 700 : 400};font-style:${font === HW ? 'normal' : 'italic'};color:rgba(255,255,255,.9);margin:12px 0 0;line-height:1.1;">${l2}</p>` : ''}`)}`, '#000', false)])
}

// P10d STAGGERED PAIRS (Aidan, 20 Oct: "why not make the pairs staggered cards or something"): each card is two matted
// prints, one high-left and one low-right, slightly rotated and overlapping, on the dark table; p10c's copy on top.
{
  const story = [['T31', 'T39', CITY, 'free photo shoot.', 120, 66, SE],
    ['T14', 'T91', "i'm aidan, a portrait photographer.", "i'm in charlotte for a few weeks.", 54, 36, SE],
    ['T73', 'T16', 'my recent work', '', 76, 0, SE],
    ['T58', 'T89', 'about an hour.', 'i direct every frame.', 76, 44, SE],
    ['T10', 'T20', 'Interested?', "Let's chat.", 104, 104, HW]]
  // alternate which side sits high so the swipe zig-zags
  C.p10d = story.map(([a, b, l1, l2, s1, s2, font], i) => {
    const hiLeft = i % 2 === 0, A = hiLeft ? a : b, B = hiLeft ? b : a
    const t1 = i === 0 ? 300 : 280
    const text = `<div style="position:absolute;top:${t1}px;left:56px;right:56px;text-align:center;">
      <p style="font-family:${font};font-size:${s1}px;font-weight:700;font-style:${font === HW ? 'normal' : 'italic'};color:#fff;margin:0;line-height:${font === HW ? 0.95 : 1.02};">${l1}</p>
      ${l2 ? `<p style="font-family:${font};font-size:${s2}px;font-weight:${font === HW ? 700 : 400};font-style:${font === HW ? 'normal' : 'italic'};color:rgba(255,255,255,.88);margin:${font === HW ? 0 : 12}px 0 0;line-height:${font === HW ? 0.95 : 1.1};">${l2}</p>` : ''}</div>`
    const y0 = font === HW || i === 0 ? 540 : 490
    return [`${String(i + 1).padStart(2, '0')}-stagger`, dark(`${text}${pr(P(A), hiLeft ? 40 : 500, y0, 520, hiLeft ? -4 : 3)}${pr(P(B), hiLeft ? 500 : 40, y0 + 470, 520, hiLeft ? 3 : -4)}`, false)]
  })
}

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
