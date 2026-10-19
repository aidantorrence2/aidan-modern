import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

// CHARLOTTE v9 — BREAKTHROUGH (Aidan, 21 Oct: "no creativity at all in these variations ... break out of the box ... whatever rules
// are constraining you break them ... not like existing variations"). v6–v8 were all 'poster with a face and the city'.
// v9 drops that template: each concept is a different FORMAT that borrows the look of something else — a camera
// viewfinder, an iOS lock screen, an Instagram story with stickers, a die-cut sticker, a thermal receipt, a proof sheet
// with an empty frame for the viewer, an eye lineup, a double exposure, an RGB glitch, a portrait made of the word.
// Gates relaxed on purpose: face-size floor off where the format needs small faces (proof sheet, lineup); the
// text-over-face gate stays on for every real text element. CPC logic: card 1 stops the scroll by looking like something else.
// -- v8 notes follow --
// CHARLOTTE v8 — ART DIRECTION (Aidan, 21 Oct: "the designs still haven't been elevated or changed. i want unique and
// interesting cpc key designs"). v6/v7 shared one voice (Georgia italic, centred, white on photo). Each hook here has
// its own typeface, layout logic, colour and idea — comp card, interleaved masthead, circular seal, riso duotone,
// ticker, loupe, diagonal fields, outline/solid split, stacked grotesque, polaroid on texture — under the same CPC
// gates (face ≥300px, city huge, ≤2 lines, nothing on a face). System fonts (Didot, Futura, Bodoni 72, Baskerville,
// Helvetica Neue, Avenir Next Condensed, Menlo) + Fraunces.
// -- v7 notes follow --
// Ten distinct visual languages that keep the v6 CPC rules: one hero portrait, face ≥300px, city huge, ≤2 lines, text
// never on a face (type may sit BEHIND the subject via the Vision cut-out), everything inside the safe zone. Same proven
// body behind each hook. Built on render-v6's helpers (place/fit/body/gates).
// -- v6 notes follow --
// CPC is decided by card 1. Every hook here is ONE full-bleed portrait with the face framed BIG (face height ≥ 420px on
// the 1080×1920 canvas, placed by the Vision face box), the city huge and at most two lines of type, in clear space —
// the composition of his winning Istanbul hook. The ten concepts differ in the hook (face, mood, light, man/woman,
// two-up, environment, print, question, callout, Notes), not in layout tricks. The body behind each hook is the proven
// deck: my recent work · never done this before? · CTA, with photos big enough to read on a phone. A quality gate
// fails any card whose visible faces are smaller than FACE_MIN px (no thumbnail soup) and any text over a face. Copy = lines from his approved decks only
// (see memory feedback_ad_copy_his_words). Same face audit as v2/v3: text never on a face, all text above y=1440.
//
// Usage: node render-v9.mjs --photos=<dir of <stem>.jpg> --vision=<dir> --out=<dir> [--only=g01,g02]
// Photos: marketing/charlotte-video-ads/work/src2 (1440px copies of new_top_tier_candidates; already upright).

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
const FONTCSS = [face('Poppins', 'poppins-700.woff2', '700'), face('Caveat', 'caveat-700.woff2', '700'), face('Fraunces', 'fraunces-600.woff2', '600'), face('Fraunces', 'fraunces-500i.woff2', '500').replace('font-style:normal', 'font-style:italic')].join('')

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



// ---- photo pools: ALL 106 frames in new_top_tier_candidates (Aidan, 20 Oct: "i didn't ask you to leave any out").
// An allocator hands out unused frames first, so the ten carousels together use every photo; landscape frames only go
// into print slots (native aspect, never cropped to portrait).
const S2 = s => load(path.join(PHOTOS, `${s}.jpg`))
const WOMEN = ['000013', '000040-3', '000042', '000086', '11954-12', '11954-34', 'R1-00005-0014', 'R1-00005-0017', 'R1-00005-0025',
  'R1-00005-0031', 'R1-00005-0032', 'R1-00006-001A', 'R1-00006-008A', 'R1-00006-013A', 'R1-00006-015A', 'R1-00006-017A', 'R1-00006-031A',
  'R1-00007-005A', 'R1-00007-007A', 'R1-00007-008A', 'R1-00007-025A', 'R1-00008-0005', 'R1-00008-0022', 'R1-00009-0028', 'R1-00009-0033',
  'R1-00009-0034', 'R1-09792-0026', 'R1-09793-0011', 'R1-09793-0013', 'R1-09793-0019', 'R1-09793-0028', 'R1-09794-001A', 'R1-09794-004A',
  'R1-09797-0005', 'R1-09797-0009', 'R1-09797-0011', 'R1-09797-0016', 'R1-09797-0018', 'R1-09797-0021', 'R1-09797-0026', 'R1-09797-0027',
  'R1-09798-030A', 'R1-09798-032A', 'R1-09798-035A', 'R1-09799-0007', 'R1-09799-0025', 'R1-09799-0034', 'R1-09799-0037', 'R1-09952-0003',
  'R1-09952-0007', 'R1-09952-0012', 'R1-09952-0013', 'R1-09952-0019', 'R1-09952-0021', 'R1-09952-0026', 'R1-09953-010A', 'R1-09953-011A',
  'R1-09953-013A', 'R1-09953-021A', 'R1-09996-0002', 'R1-09996-0026', 'R1-09996-0028', 'R1-09996-0029',
  '000008-7', '000014', '000031-3', '000036-2', '000089', 'R1-00005-0001', 'R1-00005-0013', 'R1-00005-0027', 'R1-00005-0028']
const LAND = ['000040-2', 'R1-00005-0024', 'R1-09793-0029', 'R1-09793-030A', 'R1-09797-0031']   // landscape: prints only
const MEN = ['R1-00009-0002', 'R1-00009-0021', 'R1-09794-021A', 'R1-09794-022A', 'R1-09794-031A', 'R1-09794-034A', 'R1-09794-035A',
  'R1-09794-036A', 'R1-09795-0012', 'R1-09995-0010', 'R1-09995-0016', 'R1-09995-0019', 'R1-09997-0000', 'R1-09997-0003', 'R1-09997-0005',
  'R1-09997-0006', 'R1-09997-0009', 'R1-09997-0011', 'R1-09997-0012', 'img0006', 'img0007', 'img0013', 'img0015-2', 'img0020-3',
  'img0022-5-2', 'img0027-3', 'img0030-3', 'R1-00009-0004', 'R1-00009-0007']
const USED = new Set()
const P = s => { if (!WOMEN.includes(s) && !MEN.includes(s) && !LAND.includes(s)) throw new Error(`not in the pool: ${s}`); USED.add(s); return S2(s) }
// deterministic picks: take n from a pool starting at offset k, so every carousel uses different photos
// allocator: next n frames from this pool that no carousel has used yet (then cycles); k is kept for call-site readability
const cursor = new Map()
const take = (pool, k, n) => {
  const out = []
  let c = cursor.get(pool) || 0
  for (let tries = 0; out.length < n && tries < pool.length * 3; tries++, c++) {
    const s = pool[c % pool.length]
    if (out.includes(s)) continue
    if (USED.has(s) && pool.some(x => !USED.has(x) && !out.includes(x))) continue
    out.push(s); USED.add(s)
  }
  cursor.set(pool, c); return out
}
const mix = (ws, ms) => { const o = []; for (let i = 0; i < Math.max(ws.length, ms.length); i++) { if (ws[i]) o.push(ws[i]); if (ms[i]) o.push(ms[i]) } return o }
const C = {}
const band = (top, h, inner, bg = '#0a0a0a') => `<div style="position:absolute;left:0;right:0;top:${top}px;height:${h}px;background:${bg};"></div><div style="position:absolute;top:${top}px;left:40px;right:40px;height:${h}px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;">${inner}</div>`
const cityBig = (size = 132, small = 'Free Photo Shoot.', smallSize = 70) => `<p style="font-family:${SE};font-size:${size}px;font-weight:700;font-style:italic;color:#fff;margin:0;line-height:0.95;">${CITY}</p>
  <p style="font-family:${SE};font-size:${smallSize}px;font-weight:700;font-style:italic;color:#fff;margin:8px 0 0;line-height:1;">${small}</p>`
const grid = (stems, x0, y0, cols, w, h, gap = 0, pos = 'center 28%') => stems.map((s, i) => tile(P(s), x0 + (i % cols) * (w + gap), y0 + Math.floor(i / cols) * (h + gap), w, h, pos)).join('')
const top2 = (l1, l2, s1 = 70, s2 = 40, font = SE, t = 280) => `<div style="position:absolute;top:${t}px;left:56px;right:56px;text-align:center;">
  <p style="font-family:${font};font-size:${s1}px;font-weight:700;font-style:${font === HW ? 'normal' : 'italic'};color:#fff;margin:0;line-height:${font === HW ? 0.95 : 1.02};">${l1}</p>
  ${l2 ? `<p style="font-family:${font};font-size:${s2}px;font-weight:${font === HW ? 700 : 400};font-style:${font === HW ? 'normal' : 'italic'};color:rgba(255,255,255,.88);margin:${font === HW ? 0 : 12}px 0 0;line-height:${font === HW ? 0.95 : 1.1};">${l2}</p>` : ''}</div>`
const ctaP = s => ctaCard(P(s), 'center 25%')
// the deck's own lines (render-coast-story-v2i.mjs COPY.en + the approved p10c pairs)
const L = { work: 'my recent work', nerv: 'never done this before?', nervSub: "don't worry — i'll direct you through every frame.",
  now: `now in ${CITY}`, nowSub: "it's totally free", hour: 'about an hour.', hourSub: 'i direct every frame.', want: 'Want photos like these? →',
  me: "i'm aidan, a portrait photographer.", meSub: "i'm in charlotte for a few weeks.", short: `I'm only in ${CITY} for a short time — let's shoot.` }



const CUT = s => 'data:image/png;base64,' + fs.readFileSync(path.join(PHOTOS, '..', 'cut2', `${s}.png`)).toString('base64')
const PAL = JSON.parse(fs.readFileSync(path.join(__dirname, 'palette-v5.json'), 'utf8'))
const ACCENT = s => PAL[s]?.accent || '#b65d1f'
const FACE = s => { const a = S2(s); return a.faces.slice().sort((p, q) => q[2] * q[3] - p[2] * p[3])[0] }
// full-bleed portrait with the face framed to a target height: zoom = faceH / face height, never below cover, never
// past native pixels; the face centre sits at fy of the frame; returns html + where the face landed (for text placement)
function hero(s, { faceH = 460, fy = 0.34, fx = 0.5, minK = 0 } = {}) {
  const a = S2(s), f = FACE(s), k0 = Math.max(1080 / a.w, 1920 / a.h)
  let k = f ? faceH / f[3] : k0
  k = Math.max(k, k0, minK); k = Math.min(k, 1.0)                     // 1.0 = native pixels of the 2600px staging
  k = Math.max(k, k0)
  const cx = f ? f[0] + f[2] / 2 : a.w / 2, cy = f ? f[1] + f[3] * 0.45 : a.h / 2
  const x = Math.min(0, Math.max(1080 - a.w * k, 1080 * fx - cx * k)), y = Math.min(0, Math.max(1920 - a.h * k, 1920 * fy - cy * k))
  const html = `<img src="${a.src}" style="position:absolute;left:${x.toFixed(0)}px;top:${y.toFixed(0)}px;width:${(a.w * k).toFixed(0)}px;height:${(a.h * k).toFixed(0)}px;display:block;"/>${fb(a, k, x, y)}`
  const face = f ? { top: y + f[1] * k, bottom: y + (f[1] + f[3]) * k, left: x + f[0] * k, right: x + (f[0] + f[2]) * k, h: f[3] * k } : null
  USED.add(s)
  return { html, face, k }
}
const SCRIM_LOW = (from = 52) => `<div style="position:absolute;inset:0;background:linear-gradient(180deg,transparent 0%,transparent ${from}%,rgba(0,0,0,.45) ${from + 14}%,rgba(0,0,0,.9) 100%);"></div>`
const SCRIM_TOP = `<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.55) 0%,rgba(0,0,0,.22) 24%,transparent 38%);"></div>`
// text block below the face (the winner's reading order): city 150 / "Free Photo Shoot." 80 / small line
const under = (face, big, small, sub, { bigPx = 150, smallPx = 80 } = {}) => {
  const h = (sub ? 300 : 240), top = Math.round(Math.min(1440 - h, Math.max(face ? face.bottom + 50 : 1000, 1440 - h - 100)))
  return `<div style="position:absolute;top:${top}px;left:48px;right:48px;text-align:center;">
    <p style="font-family:${SE};font-size:${bigPx}px;font-weight:700;font-style:italic;color:#fff;margin:0;line-height:.88;${SH}">${big}</p>
    <p style="font-family:${SE};font-size:${smallPx}px;font-weight:700;font-style:italic;color:#fff;margin:12px 0 0;line-height:.98;${SH}">${small}</p>
    ${sub ? `<p style="font-family:${SE};font-size:34px;font-style:italic;color:rgba(255,255,255,.9);margin:26px 0 0;${SH}">${sub}</p>` : ''}</div>`
}
const above = (big, small, bigPx = 150, smallPx = 80) => `<div style="position:absolute;top:280px;left:48px;right:48px;text-align:center;">
    <p style="font-family:${SE};font-size:${bigPx}px;font-weight:700;font-style:italic;color:#fff;margin:0;line-height:.88;${SH}">${big}</p>
    <p style="font-family:${SE};font-size:${smallPx}px;font-weight:700;font-style:italic;color:#fff;margin:12px 0 0;line-height:.98;${SH}">${small}</p></div>`
// hero pool: close/mid portraits with eyes found, ranked by face size; w/m split; never the same hero twice
const HERO_W = ['R1-09952-0012', 'R1-09797-0016', '11954-12', '000086', 'R1-09793-0013', '000042', 'R1-09793-0028', 'R1-00008-0005', 'R1-09952-0026', 'R1-09952-0003', 'R1-09952-0019', 'R1-09793-0011', 'R1-00009-0034', 'R1-09792-0026', 'R1-09953-021A', 'R1-00007-025A', 'R1-09799-0007', 'R1-09952-0013', 'R1-00006-013A', 'R1-00008-0022', '000013', 'R1-00006-008A', 'R1-09797-0005', 'R1-09798-032A', '11954-34']
const HERO_M = ['R1-09997-0009', 'R1-09794-031A', 'R1-09995-0010', 'R1-09794-021A', 'R1-00009-0021', 'R1-09997-0003', 'R1-09997-0006', 'R1-00009-0002', 'R1-09996-0029', 'img0015-2', 'img0006', 'R1-09996-0026', 'img0013', 'R1-09794-035A', 'R1-09997-0011', 'img0027-3']
// frame a portrait inside a w×h box: the least crop (k ≥ cover, ≤ native) that gives the face ≥ minFace (or faceH if set),
// face centre at (fx, fy) of the box, clamped so the box stays covered. Coordinates are box-relative.
function fit(s, w, h, { fy = 0.36, fx = 0.5, faceH = 0, minFace = 300 } = {}) {
  const a = S2(s), f = FACE(s), k0 = Math.max(w / a.w, h / a.h)
  let k = k0
  if (f) { if (faceH) k = Math.max(k0, faceH / f[3]); while (f[3] * k < minFace && k < 1) k += 0.02; k = Math.min(Math.max(k, k0), Math.max(k0, 1)) }
  const cx = f ? f[0] + f[2] / 2 : a.w / 2, cy = f ? f[1] + f[3] * 0.45 : a.h / 2
  const x = Math.min(0, Math.max(w - a.w * k, w * fx - cx * k)), y = Math.min(0, Math.max(h - a.h * k, h * fy - cy * k))
  USED.add(s)
  const img = src => `<img src="${src}" style="position:absolute;left:${x.toFixed(0)}px;top:${y.toFixed(0)}px;width:${(a.w * k).toFixed(0)}px;height:${(a.h * k).toFixed(0)}px;display:block;"/>`
  return { html: img(a.src) + fb(a, k, x, y), cut: () => img(CUT(s)), x, y, k, face: f ? { top: y + f[1] * k, bottom: y + (f[1] + f[3]) * k, left: x + f[0] * k, right: x + (f[0] + f[2]) * k, h: f[3] * k, w: f[2] * k } : null }
}
const box = (l, t, w, h, inner, extra = '') => `<div style="position:absolute;left:${l}px;top:${t}px;width:${w}px;height:${h}px;overflow:hidden;${extra}">${inner}</div>`
const INK = '#141210', CREAM = '#efe9df'
const ital = (txt, px, color = '#fff', extra = '') => `<p style="font-family:${SE};font-size:${px}px;font-weight:700;font-style:italic;color:${color};margin:0;line-height:.9;${extra}">${txt}</p>`
const mono = (txt, px, color = '#fff', extra = '') => `<p style="font-family:${RD};font-size:${px}px;font-weight:700;letter-spacing:.28em;text-transform:uppercase;color:${color};margin:0;${extra}">${txt}</p>`
// a hook that places itself: try the big face target then the plain cover crop, text below the face then above;
// the first arrangement where the text block clears the face wins, else the photo is refused (pick another)
function place(s, blockH, { fy = 0.33, allowAbove = true, minFace = 300 } = {}) {
  const a = S2(s), f = FACE(s), k0 = Math.max(1080 / a.w, 1920 / a.h)
  const at = k => { const cx = f[0] + f[2] / 2, cy = f[1] + f[3] * 0.45
    const x = Math.min(0, Math.max(1080 - a.w * k, 540 - cx * k)), y = Math.min(0, Math.max(1920 - a.h * k, 1920 * fy - cy * k))
    return { k, x, y, top: y + f[1] * k, bottom: y + (f[1] + f[3]) * k, h: f[3] * k, left: x + f[0] * k, right: x + (f[0] + f[2]) * k, w: f[2] * k } }
  const draw = g => { USED.add(s); return `<img src="${a.src}" style="position:absolute;left:${g.x.toFixed(0)}px;top:${g.y.toFixed(0)}px;width:${(a.w * g.k).toFixed(0)}px;height:${(a.h * g.k).toFixed(0)}px;display:block;"/>${fb(a, g.k, g.x, g.y)}` }
  if (!f) { const g = { k: k0, x: Math.min(0, (1080 - a.w * k0) / 2), y: 0 }; return { html: draw(g), top: 1440 - blockH, mode: 'below', k: k0 } }
  // text UNDER the face (the winner's composition): the least crop (smallest k ≥ cover, ≤ native) that leaves room
  for (let k = k0; k <= 1.0001; k += 0.02) {
    const g = at(k), below = Math.round(g.bottom + 50)
    if (below + blockH <= 1440 && g.h >= minFace) return { html: draw(g), top: Math.max(below, Math.min(1440 - blockH, 1000)), mode: 'below', k, face: g }
  }
  // else the text ABOVE the face, face as big as the room allows
  if (allowAbove) for (let k = 1.0; k >= k0 - 0.0001; k -= 0.02) { const kk = Math.max(k, k0), g = at(kk)
    if (g.top >= 280 + blockH + 40 && g.h >= minFace) return { html: draw(g), top: 280, mode: 'above', k: kk, face: g } }
  throw new Error(`${s}: no room for a ${blockH}px text block around the face (pick another frame)`)
}
const block = (top, big, small, sub, { bigPx = 150, smallPx = 80 } = {}) => `<div style="position:absolute;top:${top}px;left:48px;right:48px;text-align:center;">
    <p style="font-family:${SE};font-size:${bigPx}px;font-weight:700;font-style:italic;color:#fff;margin:0;line-height:.88;${SH}">${big}</p>
    <p style="font-family:${SE};font-size:${smallPx}px;font-weight:700;font-style:italic;color:#fff;margin:12px 0 0;line-height:.98;${SH}">${small}</p>
    ${sub ? `<p style="font-family:${SE};font-size:34px;font-style:italic;color:rgba(255,255,255,.9);margin:26px 0 0;${SH}">${sub}</p>` : ''}</div>`
const hookCard = (s0, opts = {}, { big = CITY, small = 'Free Photo Shoot.', sub = L.want, bigPx = 150, smallPx = 80, lines = 1 } = {}) => {
  const h = Math.round(bigPx * .88 + 12 + smallPx * .98 * lines + (sub ? 26 + 40 : 0) + 20)
  const pool = HERO_M.includes(s0) ? HERO_M : HERO_W
  return firstFit([s0, ...pool.filter(x => !USED.has(x) && !RESERVED.has(x))], s => { const Pl = place(s, h, opts); if (s !== s0) console.log(`  hook ${s0} refused → ${s} (${Pl.mode})`); else console.log(`  hook ${s} (${Pl.mode})`)
  const scrim = Pl.mode === 'below' ? SCRIM_LOW(Math.max(30, Math.round(Pl.top / 19.2) - 12)) : SCRIM_TOP
  return frame(`${Pl.html}${scrim}${block(Pl.top, big, small, sub, { bigPx, smallPx })}${grain(0.05)}`, '#000', false) })
}
// ---- proven body cards, photos big ----
const workCard = (stems, title = L.work) => dark(`<div style="position:absolute;top:250px;left:60px;right:60px;text-align:center;">${TITLE(title)}</div>
  ${pr(P(stems[0]), 40, 400, 480, -3)}${pr(P(stems[1]), 560, 420, 480, 2)}${pr(P(stems[2]), 40, 1160, 480, 2)}${pr(P(stems[3]), 560, 1140, 480, -3)}`)
const nervCard = stems => dark(`<div style="position:absolute;top:250px;left:64px;right:64px;text-align:center;">${TITLE(L.nerv, 60)}${SUB(L.nervSub)}</div>
  ${pr(P(stems[0]), 40, 480, 480, -3)}${pr(P(stems[1]), 560, 520, 480, 3)}`)
// first candidate the placer accepts (the given one, then unused heroes of the same sex)
const firstFit = (cands, fn) => { let err; for (const c of cands) { if (!c) continue; try { return fn(c) } catch (e) { err = e } } throw err }
const ctaHero = s0 => firstFit([s0, ...HERO_W.filter(x => !USED.has(x) && !RESERVED.has(x)), ...HERO_M.filter(x => !USED.has(x) && !RESERVED.has(x)), ...WOMEN.filter(x => !USED.has(x)), ...MEN.filter(x => !USED.has(x))], s => { const Pl = place(s, 345, { fy: 0.3, minFace: 160 })
  return frame(`${Pl.html}${Pl.mode === 'below' ? SCRIM_LOW(Math.max(30, Math.round(Pl.top / 19.2) - 12)) : SCRIM_TOP}${hand(Pl.top, ...CHAT, L.short)}${grain(0.05)}`, '#000', true) })
const RESERVED = new Set(['R1-09952-0012', 'R1-09797-0016', 'R1-00006-008A', 'R1-09997-0009', 'R1-09952-0013', 'R1-09794-031A', 'R1-09798-030A', 'R1-09953-010A', 'R1-09799-0034', 'R1-09952-0026', 'R1-09952-0019',
  'R1-00008-0005', 'R1-09793-0011', 'R1-09792-0026', 'R1-00009-0034', 'R1-00009-0028', 'R1-09797-0026', 'R1-09952-0003', 'R1-09793-0028', 'R1-00005-0024', 'R1-09794-021A'])
// body pools: every frame whose face is ≥ 15% of the image height (reads at print size), biggest faces first, heroes excluded
const ratio = s => { const f = FACE(s), a = S2(s); return f ? f[3] / a.h : 0 }
const BODY_W = WOMEN.filter(s => !RESERVED.has(s) && ratio(s) >= 0.15).sort((p, q) => ratio(q) - ratio(p))
const BODY_M = MEN.filter(s => !RESERVED.has(s) && ratio(s) >= 0.15).sort((p, q) => ratio(q) - ratio(p))
console.log(`body pool: ${BODY_W.length} women, ${BODY_M.length} men`)
const takeR = (pool, n) => take(pool === HERO_W ? BODY_W : BODY_M, 0, n)
const body = (k, cta) => [['02-work', workCard(mix(takeR(HERO_W, 2), takeR(HERO_M, 2)))], ['03-nervous', nervCard([takeR(HERO_W, 1)[0], takeR(HERO_M, 1)[0]])], ['04-cta', ctaHero(cta)]]

const BODIES = []


// ---- type systems ----
const DIDOT = "Didot, 'Bodoni 72', 'Big Caslon', serif", FUT = "Futura, 'Avenir Next', sans-serif", GROT = "'Helvetica Neue', Helvetica, Arial, sans-serif"
const COND = "'Avenir Next Condensed', 'Arial Narrow', sans-serif", MONO = "Menlo, 'Courier New', monospace", FRA = "'Fraunces', Georgia, serif", BASK = "Baskerville, 'Hoefler Text', serif"
const TX = (txt, { f = DIDOT, px = 150, w = 400, it = false, c = '#fff', ls = 0, lh = 0.9, al = 'left', x = 48, y = 280, wd = 984, extra = '' } = {}) =>
  `<p style="position:absolute;left:${x}px;top:${y}px;width:${wd}px;margin:0;font-family:${f};font-size:${px}px;font-weight:${w};font-style:${it ? 'italic' : 'normal'};color:${c};letter-spacing:${ls}em;line-height:${lh};text-align:${al};${extra}">${txt}</p>`
const RESERVE8 = ['R1-09952-0019', 'R1-00009-0028', 'R1-09952-0012', 'R1-09797-0016', 'R1-00008-0005', 'R1-09793-0028', 'R1-09794-031A', 'R1-00006-008A', 'R1-09952-0013', 'R1-09997-0009', 'R1-09799-0034', 'R1-09952-0026', 'R1-09792-0026', 'R1-00009-0034', 'R1-09953-021A', 'R1-09794-021A', 'R1-09995-0010', 'R1-00007-025A', 'R1-09793-0013', '000042', 'R1-09952-0003', 'R1-09793-0011']
RESERVE8.forEach(x => RESERVED.add(x))
const TOPS = JSON.parse(fs.readFileSync(path.join(PHOTOS, '..', 'cut2', 'tops.json'), 'utf8'))
// hang a cut-out by the top of its hair at y=hangY, body running off the bottom; returns img + face markers + face geometry
const hang = (s, hangY, { fx = 0.5, minFace = 300 } = {}) => { const a = S2(s), f = FACE(s), mTop = TOPS[s].top
  const k = Math.max(Math.max(1080 / a.w, 1920 / a.h), (1920 - hangY + 20) / (a.h - mTop), minFace / f[3])
  const y = hangY - mTop * k, x = Math.min(0, Math.max(1080 - a.w * k, 1080 * fx - (f[0] + f[2] / 2) * k)); USED.add(s)
  return { html: `<img src="${CUT(s)}" style="position:absolute;left:${x.toFixed(0)}px;top:${y.toFixed(0)}px;width:${(a.w * k).toFixed(0)}px;height:${(a.h * k).toFixed(0)}px;display:block;"/>${fb(a, k, x, y)}`, face: { top: y + f[1] * k, bottom: y + (f[1] + f[3]) * k, left: x + f[0] * k, right: x + (f[0] + f[2]) * k, h: f[3] * k }, k, x, y } }


const SF = "-apple-system, 'SF Pro Display', 'Helvetica Neue', sans-serif", SFM = "ui-monospace, 'SF Mono', Menlo, monospace"
const EYES = s => { const a = S2(s), j = JSON.parse(fs.readFileSync(path.join(VISION, `${s}.face.json`), 'utf8')); const g = j.faces.slice().sort((p, q) => q.box[2] * q.box[3] - p.box[2] * p.box[3])[0]; const k = a.w / j.w
  return g && g.leftEye ? { le: g.leftEye.map(v => v * k), re: g.rightEye.map(v => v * k) } : null }
const png = p => 'data:image/png;base64,' + fs.readFileSync(p).toString('base64')
const NOMIN = new Set(['g07', 'g08'])    // formats that need small faces (proof sheet, eye lineup)
const imgTag = (src, x, y, w, h, extra = '') => `<img src="${src}" style="position:absolute;left:${x.toFixed(0)}px;top:${y.toFixed(0)}px;width:${w.toFixed(0)}px;height:${h.toFixed(0)}px;display:block;${extra}"/>`
const corner = (cx, cy, w, h, col, t, len) => [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy]) => `<div style="position:absolute;left:${(cx + sx * w / 2 - (sx > 0 ? len : 0)).toFixed(0)}px;top:${(cy + sy * h / 2 - (sy > 0 ? len : 0)).toFixed(0)}px;width:${len}px;height:${len}px;border:0 solid ${col};border-top-width:${sy < 0 ? t : 0}px;border-bottom-width:${sy > 0 ? t : 0}px;border-left-width:${sx < 0 ? t : 0}px;border-right-width:${sx > 0 ? t : 0}px;"></div>`).join('')
const soft = 'text-shadow:0 1px 10px rgba(0,0,0,.55);'

// G01 VIEWFINDER: the ad is a camera's live view — AF square locked on the face, eye-AF boxes on the pupils (from the
// Vision landmarks), exposure readout, the city as the frame label, the shutter ring. Looks like the photographer's screen.
const vf = (s, big, sub, { pressed = false, fy = 0.46, faceH = 440, bigPx = 150 } = {}) => {
  const F = fit(s, 1080, 1920, { fy, faceH }), E = EYES(s)
  const X = p => F.x + p[0] * F.k, Y = p => F.y + p[1] * F.k
  const le = [X(E.le), Y(E.le)], re = [X(E.re), Y(E.re)], f = F.face, cx = (f.left + f.right) / 2, cy = (f.top + f.bottom) / 2
  const eye = c => `<div style="position:absolute;left:${(c[0] - 38).toFixed(0)}px;top:${(c[1] - 38).toFixed(0)}px;width:76px;height:76px;border:4px solid #ffd60a;border-radius:10px;"></div>`
  return frame(`${F.html}<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.5) 0%,rgba(0,0,0,.15) 30%,transparent 38%,transparent 66%,rgba(0,0,0,.5) 100%);"></div>
    ${corner(cx, cy, (f.right - f.left) * 1.25, f.h * 1.18, 'rgba(255,255,255,.95)', 5, 64)}${eye(le)}${eye(re)}
    <div style="position:absolute;left:48px;right:48px;top:266px;display:flex;justify-content:space-between;align-items:center;font:600 28px ${SFM};color:#fff;${soft}">
      <p style="margin:0;border:3px solid #fff;padding:2px 12px;border-radius:8px;">RAW</p><p style="margin:0;letter-spacing:.05em;">AF·EYE &nbsp;1/250 &nbsp;f/2.0 &nbsp;ISO 400</p><p style="margin:0;">▮▮▮ 87%</p></div>
    <div style="position:absolute;left:0;right:0;top:330px;text-align:center;"><p style="margin:0;font:800 ${bigPx}px ${SF};letter-spacing:-.035em;color:#fff;line-height:.95;${soft}">${big}</p>
      <p style="margin:12px 0 0;font:600 38px ${SFM};letter-spacing:.14em;color:#fff;${soft}"><span style="color:#ff3b30">●</span> ${sub}</p></div>
    <div style="position:absolute;left:${540 - 62}px;top:${Math.max(1306, Math.round(f.bottom + 70))}px;width:124px;height:124px;border-radius:50%;border:7px solid #fff;"></div><div style="position:absolute;left:${540 - 48}px;top:${Math.max(1320, Math.round(f.bottom + 84))}px;width:96px;height:96px;border-radius:50%;background:#fff;${pressed ? '' : 'opacity:.92;'}"></div>
    <div style="position:absolute;left:60px;top:${Math.max(1350, Math.round(f.bottom + 112))}px;font:600 26px ${SFM};color:#fff;${soft}"><p style="margin:0">001/010</p></div>${grain(0.04)}`, '#000', false)
}
C.g01 = [['01-viewfinder', vf('R1-09799-0007', 'CHARLOTTE', 'FREE PHOTO SHOOT')], ['02-viewfinder', vf('R1-00009-0002', 'ABOUT AN HOUR', 'I DIRECT EVERY FRAME', { bigPx: 108 })], ['03-shutter', vf('R1-09953-021A', 'INTERESTED?', "LET'S CHAT", { pressed: true, bigPx: 132 })]]

// G02 LOCK SCREEN: the portrait is the wallpaper; "Charlotte" is set in the clock's slot; two Messages notifications from Aidan.
const lock = (s, line, notifs, { fy = 0.47 } = {}) => {
  const F = fit(s, 1080, 1920, { fy, faceH: 420 }), f = F.face
  const top0 = Math.max(Math.round(f.bottom + 40), 1040)
  const nt = (t, i) => `<div style="position:absolute;left:40px;right:40px;top:${top0 + i * 142}px;height:130px;border-radius:32px;background:rgba(255,255,255,.30);backdrop-filter:blur(26px) saturate(1.5);-webkit-backdrop-filter:blur(26px) saturate(1.5);">
      <div style="position:absolute;left:22px;top:18px;width:60px;height:60px;border-radius:15px;background:linear-gradient(180deg,#5af575,#16b838);"><div style="position:absolute;left:12px;top:14px;width:40px;height:30px;border-radius:50%;background:#fff;"></div><div style="position:absolute;left:14px;top:38px;width:12px;height:12px;background:#fff;transform:rotate(45deg);border-radius:2px;"></div></div>
      <p style="position:absolute;left:104px;top:12px;margin:0;font:600 29px ${SF};color:#fff;">Aidan</p><p style="position:absolute;right:26px;top:14px;margin:0;font:400 25px ${SF};color:rgba(255,255,255,.7);">now</p>
      <p style="position:absolute;left:104px;top:48px;right:30px;margin:0;font:400 29px/1.2 ${SF};color:#fff;">${t}</p></div>`
  return frame(`${F.html}<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.32) 0%,transparent 26%,transparent 66%,rgba(0,0,0,.45) 100%);"></div>
    <p style="position:absolute;left:0;right:0;top:268px;margin:0;text-align:center;font:600 44px ${SF};color:rgba(255,255,255,.92);${soft}">${line}</p>
    <p style="position:absolute;left:0;right:0;top:318px;margin:0;text-align:center;font:600 ${CITY.length > 8 ? 212 : 240}px ${SF};letter-spacing:-.04em;color:rgba(255,255,255,.96);line-height:1;${soft}">${CITY}</p>
    ${notifs.map(nt).join('')}
    <div style="position:absolute;left:96px;top:1740px;width:104px;height:104px;border-radius:50%;background:rgba(40,40,40,.55);"></div><div style="position:absolute;right:96px;top:1740px;width:104px;height:104px;border-radius:50%;background:rgba(40,40,40,.55);"></div>${grain(0.04)}`, '#000', false)
}
C.g02 = [['01-lock', lock('R1-00008-0022', 'free photo shoot', ['free photo shoot in Charlotte 📸 interested?', "i'm aidan, a portrait photographer. i'm in charlotte for a few weeks."])],
  ['02-lock', lock('img0013', 'free photo shoot', ['about an hour. i direct every frame.', 'tap to reply 👇'], { fy: 0.46 })],
  ['03-lock', lock('R1-09996-0026', 'free photo shoot', ['Interested? Let\'s chat. 💬', "i'm only in Charlotte for a short time — let's shoot."], { fy: 0.46 })]]

// G03 STORY NATIVE: an Instagram story as a person would post it — highlight-pill text, location sticker, poll sticker.
const story = (s, pill1, pill2, sticker, { fy = 0.36 } = {}) => {
  const F = fit(s, 1080, 1920, { fy, faceH: 420 }), f = F.face, top = Math.round(f.bottom + 34)
  return frame(`${F.html}<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.28) 0%,transparent 22%,transparent 58%,rgba(0,0,0,.4) 100%);"></div>
    <div style="position:absolute;left:56px;top:268px;background:#fff;border-radius:60px;padding:14px 30px 14px 22px;transform:rotate(-3deg);box-shadow:0 8px 24px rgba(0,0,0,.3);"><p style="margin:0;font:700 40px ${SF};letter-spacing:.03em;color:#111;">📍 ${CITY.toUpperCase()}</p></div>
    <div style="position:absolute;left:50px;top:${top}px;background:#fff;border-radius:22px;padding:6px 30px 14px;transform:rotate(-2deg);"><p style="margin:0;font:800 120px ${SF};letter-spacing:-.03em;color:#111;line-height:1.05;">${pill1}</p></div>
    <div style="position:absolute;left:120px;top:${top + 148}px;background:#111;border-radius:16px;padding:6px 26px 10px;transform:rotate(1.5deg);"><p style="margin:0;font:700 62px ${SF};color:#fff;line-height:1.1;">${pill2}</p></div>
    ${sticker(top + 262)}${grain(0.04)}`, '#000', false)
}
const poll = y => `<div style="position:absolute;left:150px;top:${Math.min(y, 1180)}px;width:780px;background:#fff;border-radius:34px;padding:26px 28px 28px;box-shadow:0 14px 34px rgba(0,0,0,.35);transform:rotate(1deg);">
  <p style="margin:0 0 18px;text-align:center;font:700 40px ${SF};color:#111;">Want photos like these?</p>
  <div style="display:flex;gap:14px;"><div style="flex:1;border-radius:18px;background:linear-gradient(90deg,#8a3ab9,#e95950);text-align:center;padding:14px 0;"><p style="margin:0;font:700 40px ${SF};color:#fff;">yes</p></div><div style="flex:1;border-radius:18px;background:#efefef;text-align:center;padding:14px 0;"><p style="margin:0;font:700 40px ${SF};color:#111;">yes 👀</p></div></div></div>`
const qa = y => `<div style="position:absolute;left:150px;top:${Math.min(y, 1130)}px;width:780px;background:#fff;border-radius:34px;overflow:hidden;box-shadow:0 14px 34px rgba(0,0,0,.35);transform:rotate(-1deg);">
  <div style="background:linear-gradient(90deg,#8a3ab9,#e95950,#fccc63);padding:20px 28px;"><p style="margin:0;text-align:center;font:700 38px ${SF};color:#fff;">free photo shoot in Charlotte?</p></div>
  <div style="padding:26px 28px 30px;"><div style="background:#f1f1f1;border-radius:18px;padding:18px 22px;"><p style="margin:0;font:500 38px ${SF};color:#111;">yes<span style="color:#8a3ab9;">|</span></p></div></div></div>`
C.g03 = [['01-story', story('R1-00009-0028', CITY, 'free photo shoot', poll, { fy: 0.30 })], ['02-story', story('R1-09794-035A', 'about an hour.', 'i direct every frame.', qa, { fy: 0.30 })],
  ['03-story', story('R1-09797-0018', 'Interested?', "Let's chat.", y => `<div style="position:absolute;left:300px;top:${Math.min(y, 1180)}px;background:#fff;border-radius:60px;padding:16px 34px;transform:rotate(2deg);box-shadow:0 10px 26px rgba(0,0,0,.35);"><p style="margin:0;font:700 44px ${SF};color:#111;">💬 Send message</p></div>`, { fy: 0.31 })]]

// G04 TEXT PORTRAIT: the portrait is built out of the word CHARLOTTE (letter size and colour follow the photo), card 2 reveals her.
{
  const tp = s => frame(`<img src="${png(path.join(PHOTOS, '..', 'textportrait', s + '.png'))}" style="position:absolute;inset:0;width:1080px;height:1920px;"/>
    <div style="position:absolute;left:0;right:0;top:0;height:300px;background:linear-gradient(180deg,#060606 40%,transparent);"></div>
    <div style="position:absolute;left:0;right:0;top:1330px;height:130px;background:linear-gradient(0deg,#060606 55%,transparent);"></div>
    ${TX('FREE PHOTO SHOOT', { f: SFM, px: 34, w: 700, ls: 0.3, al: 'center', x: 0, wd: 1080, y: 276 })}${TX('swipe →', { f: SFM, px: 30, w: 600, ls: 0.2, al: 'center', x: 0, wd: 1080, y: 1392, c: 'rgba(255,255,255,.8)' })}`, '#060606', false)
  const Pl = place('R1-09794-031A', 300, { fy: 0.36 })
  C.g04 = [['01-text', tp('R1-09794-031A')], ['02-reveal', frame(`${Pl.html}${Pl.mode === 'below' ? SCRIM_LOW(Math.max(30, Math.round(Pl.top / 19.2) - 12)) : SCRIM_TOP}${block(Pl.top, CITY, 'Free Photo Shoot.', L.want)}${grain(0.05)}`, '#000', false)], ['03-cta', frame(`<img src="${png(path.join(PHOTOS, '..', 'textportrait', 'R1-00009-0034.png'))}" style="position:absolute;inset:0;width:1080px;height:1920px;"/><div style="position:absolute;left:0;right:0;top:0;height:300px;background:linear-gradient(180deg,#060606 40%,transparent);"></div><div style="position:absolute;left:150px;top:1196px;width:780px;background:#fff;border-radius:80px;padding:26px 0;text-align:center;box-shadow:0 18px 40px rgba(0,0,0,.5);"><p style="margin:0;font:700 56px ${SF};color:#111;">💬 Interested? Let's chat.</p></div>`, '#060606', false)]]
}

// G05 STICKER: die-cut stickers (white outline, drop shadow) on flat colour, marker type with a white sticker stroke.
{
  const outline = '8px 0 0 #fff,-8px 0 0 #fff,0 8px 0 #fff,0 -8px 0 #fff,6px 6px 0 #fff,-6px 6px 0 #fff,6px -6px 0 #fff,-6px -6px 0 #fff'
  const filt = ['8px 0', '-8px 0', '0 8px', '0 -8px', '6px 6px', '-6px 6px', '6px -6px', '-6px -6px'].map(o => `drop-shadow(${o} 0 #fff)`).join(' ') + ' drop-shadow(0 16px 20px rgba(0,0,0,.35))'
  const marker = (t, px, c = '#111', extra = '') => `<p style="margin:0;font:700 ${px}px ${HW};color:${c};-webkit-text-stroke:14px #fff;paint-order:stroke fill;line-height:.9;${extra}">${t}</p>`
  const sticker = (s, bg, l1, l2, { hangY = 600 } = {}) => { const Hh = hang(s, hangY, { fx: 0.5, minFace: 380 })
    return frame(`<div style="position:absolute;inset:0;background:${bg};"></div><svg style="position:absolute;inset:0" width="1080" height="1920"><g fill="none" stroke="#111" stroke-width="7" stroke-linecap="round"><path d="M70 560 q40 -40 80 0 M110 520 v-30"/><path d="M930 600 l40 -30 m-10 70 l50 -4"/></g></svg>
      <div style="position:absolute;left:30px;right:30px;top:262px;transform:rotate(-4deg);text-align:center;">${marker(l1, 190)}${marker(l2, 84, '#111', 'margin-top:6px;')}</div>
      <div style="position:absolute;inset:0;transform:rotate(-2deg);transform-origin:50% 70%;filter:${filt};">${Hh.html}</div>`, bg, false) }
  const disc = (s, bg, size, x, y, rot) => { const a = S2(s), f = FACE(s), mt = TOPS[s].top, k = Math.max(size * 0.9 / (a.h - mt), size / a.w, 150 / f[3] * 0.9), ox = size / 2 - (f[0] + f[2] / 2) * k, oy = size * 0.16 - mt * k
    return `<div style="position:absolute;left:${x}px;top:${y}px;width:${size}px;height:${size}px;border-radius:50%;background:${bg};border:14px solid #fff;box-shadow:0 14px 26px rgba(0,0,0,.3);transform:rotate(${rot}deg);overflow:hidden;box-sizing:border-box;">${imgTag(CUT(s), ox, oy, a.w * k, a.h * k)}</div>` }
  const sheetS = ['R1-09952-0013', 'R1-09794-031A', 'R1-00009-0034', 'R1-09997-0009', 'R1-09792-0026', 'R1-09794-021A']
  const cols = ['#ff5d8f', '#2ec4b6', '#ffb703', '#7b6cff', '#ff7a3d', '#3ddc97']
  C.g05 = [['01-sticker', sticker('R1-09952-0013', '#ffd23f', CITY, 'free photo shoot', { hangY: 610 })],
    ['02-sheet', frame(`<div style="position:absolute;inset:0;background:#ffd23f;"></div>${TX(L.work, { f: HW, px: 120, w: 700, c: '#111', al: 'center', x: 0, wd: 1080, y: 262 })}${sheetS.map((s, i) => disc(s, cols[i], 440, 50 + (i % 2) * 540, 440 + Math.floor(i / 2) * 330, ((i * 7) % 9) - 4)).join('')}`, '#ffd23f', false)],
    ['03-sticker', sticker('R1-09794-031A', '#ff5d8f', 'Interested?', "Let's chat.", { hangY: 610 })]]
}

// G06 RECEIPT: a thermal receipt lying on the portrait: free, itemised, total $0.00.
{
  const F = fit('R1-00006-008A', 1080, 1920, { fy: 0.27, faceH: 380 })
  const THERM = 'filter:grayscale(1) contrast(1.7) brightness(1.05);mix-blend-mode:multiply;'
  const zig = 'polygon(0 0,100% 0,100% calc(100% - 14px),' + Array.from({ length: 27 }, (_, i) => `${100 - (i + 1) * 3.7}% ${i % 2 ? 'calc(100% - 14px)' : '100%'}`).join(',') + ',0 calc(100% - 14px))'
  const row = (a, b, bold) => `<div style="display:flex;justify-content:space-between;margin:0 0 16px;"><p style="margin:0;font:${bold ? 800 : 600} ${bold ? 52 : 33}px ${SFM};color:#111;">${a}</p><p style="margin:0;font:${bold ? 800 : 600} ${bold ? 52 : 33}px ${SFM};color:#111;">${b}</p></div>`
  C.g06 = [['01-receipt', frame(`${F.html}<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.3) 0%,transparent 28%,rgba(0,0,0,.5) 100%);"></div>
    <div style="position:absolute;left:120px;top:690px;width:840px;background:#f7f5ef;padding:44px 52px 60px;transform:rotate(1.4deg);box-shadow:0 24px 50px rgba(0,0,0,.5);clip-path:${zig};">
      <p style="margin:0;text-align:center;font:800 72px ${SFM};letter-spacing:.03em;color:#111;">CHARLOTTE, NC</p>
      <p style="margin:8px 0 22px;text-align:center;font:600 32px ${SFM};letter-spacing:.2em;color:#111;">FREE PHOTO SHOOT</p>
      <div style="border-top:3px dashed #111;margin:0 0 16px;"></div>
      ${row('ABOUT AN HOUR', '$0.00')}${row('I DIRECT EVERY FRAME', '$0.00')}${row('EDITED PHOTOS', '$0.00')}
      <div style="border-top:3px dashed #111;margin:6px 0 14px;"></div>${row('TOTAL', '$0.00', true)}
      <div style="height:70px;margin:20px 0 4px;background:repeating-linear-gradient(90deg,#111 0 3px,transparent 3px 6px,#111 6px 7px,transparent 7px 11px,#111 11px 15px,transparent 15px 18px);"></div></div>`, '#000', false)],
    ['02-receipt', frame(`<style>img[data-thermal]{filter:grayscale(1) contrast(1.7) brightness(1.08);mix-blend-mode:multiply;}</style><div style="position:absolute;inset:0;background:#d9d4c8;"></div>
      <div style="position:absolute;left:60px;top:280px;width:960px;background:#f7f5ef;padding:56px 64px 70px;box-shadow:0 24px 50px rgba(0,0,0,.35);transform:rotate(-1.2deg);clip-path:${zig};">
      <p style="margin:0 0 18px;text-align:center;font:800 62px ${SFM};color:#111;">${CITY.toUpperCase()}</p><div style="border-top:3px dashed #111;margin:0 0 20px;"></div>
      ${row("I'M AIDAN,", '')}${row('A PORTRAIT PHOTOGRAPHER.', '')}${row("I'M IN CHARLOTTE FOR A FEW WEEKS.", '')}
      <div style="border-top:3px dashed #111;margin:18px 0 18px;"></div>${row('NEVER DONE THIS BEFORE?', '')}${row("DON'T WORRY — I'LL DIRECT YOU", '')}${row('THROUGH EVERY FRAME.', '')}
      <div style="border-top:3px dashed #111;margin:18px 0 18px;"></div>${row('TOTAL', '$0.00', true)}<div style="position:relative;height:560px;margin:34px 0 0;overflow:hidden;background:#f7f5ef;">${tile(P('R1-09997-0006'), 0, 0, 832, 560, 'center 30%').replace('<img ', '<img data-thermal ')}</div></div>`, '#d9d4c8', false)],
    ['03-receipt', frame(`<style>img[data-thermal]{filter:grayscale(1) contrast(1.7) brightness(1.08);mix-blend-mode:multiply;}</style><div style="position:absolute;inset:0;background:#d9d4c8;"></div>
      <div style="position:absolute;left:60px;top:280px;width:960px;background:#f7f5ef;padding:56px 64px 70px;box-shadow:0 24px 50px rgba(0,0,0,.35);transform:rotate(1deg);clip-path:${zig};">
      <p style="margin:0;text-align:center;font:800 112px ${SFM};color:#111;line-height:1.05;">INTERESTED?</p><p style="margin:14px 0 34px;text-align:center;font:800 112px ${SFM};color:#111;line-height:1.05;">LET'S CHAT.</p>
      <div style="border-top:3px dashed #111;margin:0 0 20px;"></div>${row('FREE PHOTO SHOOT', '$0.00')}${row('CHARLOTTE, NC', '')}
      <div style="height:110px;margin:34px 0 0;background:repeating-linear-gradient(90deg,#111 0 4px,transparent 4px 8px,#111 8px 9px,transparent 9px 14px,#111 14px 19px,transparent 19px 23px);"></div><div style="position:relative;height:560px;margin:34px 0 0;overflow:hidden;background:#f7f5ef;">${tile(P('R1-09952-0003'), 0, 0, 832, 560, 'center 30%').replace('<img ', '<img data-thermal ')}</div></div>`, '#d9d4c8', false)]]
}

// G07 PROOF SHEET: a contact sheet with grease-pencil marks — and one empty frame circled: "you?"
{
  const frm = (s, n, x, y, w, h) => `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;background:#0b0b0b;padding:16px 16px 40px;"><div style="position:relative;width:${w - 32}px;height:${h - 56}px;overflow:hidden;">${tile(P(s), 0, 0, w - 32, h - 56, 'center 28%')}</div><p style="position:absolute;left:18px;bottom:8px;margin:0;font:600 22px ${SFM};color:#e8a33a;">▸ ${n}</p><p style="position:absolute;right:18px;bottom:8px;margin:0;font:600 22px ${SFM};color:#e8a33a;">${n}A</p></div>`
  const red = '#ff2d2d', gp = (d, w = 9) => `<path d="${d}" fill="none" stroke="${red}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`
  const sheet = `<div style="position:absolute;inset:0;background:#171512;"></div><div style="position:absolute;left:30px;top:250px;width:1020px;height:1120px;background:#e9e4d6;transform:rotate(-1.6deg);box-shadow:0 20px 50px rgba(0,0,0,.6);"></div>
    <div style="position:absolute;left:30px;top:250px;width:1020px;height:1120px;transform:rotate(-1.6deg);">
      ${frm('R1-09952-0012', 11, 40, 190, 470, 490)}${frm('R1-09794-031A', 12, 540, 190, 470, 490)}${frm('R1-00009-0034', 13, 40, 700, 470, 490)}
      <div style="position:absolute;left:540px;top:700px;width:470px;height:490px;background:#0b0b0b;padding:16px 16px 40px;"><div style="width:438px;height:434px;background:#1c1c1c;"></div><p style="position:absolute;left:18px;bottom:8px;margin:0;font:600 22px ${SFM};color:#e8a33a;">▸ 14</p></div>
      <p style="position:absolute;right:34px;top:16px;margin:0;font:700 20px ${SFM};color:#222;letter-spacing:.14em;">PROOF SHEET · ${CITY.toUpperCase()}</p>
      <svg style="position:absolute;inset:0" width="1020" height="1180" viewBox="0 0 1020 1180">${gp('M520 690 q-10 -40 100 -45 q220 -10 385 30 q20 190 -12 540 q-200 40 -420 8 q-60 -270 -53 -533 z', 10)}${gp('M510 685 q200 -30 480 10', 6)}</svg>
      <p style="position:absolute;left:590px;top:850px;margin:0;font:700 190px ${HW};color:${red};transform:rotate(-8deg);">you?</p></div>`
  C.g07 = [['01-proof', frame(`${sheet}${TX(CITY, { f: HW, px: 220, w: 700, c: red, x: 40, y: 268, wd: 700, extra: 'transform:rotate(-4deg);transform-origin:0 0;' })}`, '#171512', false)],
    ['02-pick', (() => { const Pl = place('R1-09797-0016', 300, { fy: 0.36 }), f = Pl.face, cx = (f.left + f.right) / 2, cy = (f.top + f.bottom) / 2
      return frame(`${Pl.html}<svg style="position:absolute;inset:0" width="1080" height="1920" viewBox="0 0 1080 1920">${gp(`M${cx - f.h * 0.62} ${cy + 10} q10 -${f.h * 0.78} ${f.h * 0.62} -${f.h * 0.7} q${f.h * 0.7} ${f.h * 0.1} ${f.h * 0.62} ${f.h * 0.72} q-${f.h * 0.2} ${f.h * 0.62} -${f.h * 0.66} ${f.h * 0.64} q-${f.h * 0.58} -${f.h * 0.04} -${f.h * 0.58} -${f.h * 0.66} z`, 9)}</svg>
        ${Pl.mode === 'below' ? SCRIM_LOW(Math.max(30, Math.round(Pl.top / 19.2) - 12)) : ''}${TX('this one.', { f: HW, px: 170, w: 700, c: red, al: 'center', x: 0, wd: 1080, y: Pl.top, extra: SH })}`, '#000', false) })()],
    ['03-cta', (() => { const Pl = place('R1-09797-0018', 345, { fy: 0.36 })
      return frame(`${Pl.html}${Pl.mode === 'below' ? SCRIM_LOW(Math.max(30, Math.round(Pl.top / 19.2) - 12)) : SCRIM_TOP}${TX('Interested?', { f: HW, px: 170, w: 700, c: red, al: 'center', x: 0, wd: 1080, y: Pl.top, extra: SH })}${TX("Let's chat.", { f: HW, px: 170, w: 700, c: red, al: 'center', x: 0, wd: 1080, y: Pl.top + 150, extra: SH })}`, '#000', false) })()]]
}

// G08 EYE LINEUP: three pairs of eyes at one scale, stacked — a lineup — and the city underneath.
{
  const band = (s, y, h = 310) => { const a = S2(s), E = EYES(s), ipd = Math.hypot(E.re[0] - E.le[0], E.re[1] - E.le[1]), mx = (E.le[0] + E.re[0]) / 2, my = (E.le[1] + E.re[1]) / 2
    const k = Math.max(330 / ipd, 1080 / a.w, h / a.h), x = Math.min(0, Math.max(1080 - a.w * k, 540 - mx * k)), yy = Math.min(0, Math.max(h - a.h * k, h * 0.5 - my * k)); USED.add(s)
    return `<div style="position:absolute;left:0;top:${y}px;width:1080px;height:${h}px;overflow:hidden;">${imgTag(a.src, x, yy, a.w * k, a.h * k)}</div>` }
  const lineup = (ss, h = 310) => ss.map((s, i) => band(s, 262 + i * (h + 10), h)).join('')
  C.g08 = [['01-lineup', frame(`${lineup(['R1-09952-0012', 'R1-09794-031A', 'R1-00009-0034'])}${TX(CITY.toUpperCase(), { f: SF, px: 138, w: 800, ls: -0.04, x: 44, y: 1238, wd: 1000, lh: 1 })}${TX('FREE PHOTO SHOOT', { f: SFM, px: 32, w: 700, ls: 0.3, x: 50, y: 1384, wd: 980 })}`, '#0a0a0a', false)],
    ['02-lineup', frame(`${TX(L.work, { f: SF, px: 56, w: 800, ls: -0.02, x: 44, y: 262, wd: 1000 })}${[0, 1, 2, 3].map(i => band(['R1-09797-0016', 'R1-09997-0009', 'R1-09952-0019', 'R1-09794-021A'][i], 350 + i * 272, 262)).join('')}`, '#0a0a0a', false)],
    ['03-lineup', frame(`${lineup(['R1-09952-0003', 'R1-09997-0006', 'R1-09794-021A'], 260)}${TX('INTERESTED?', { f: SF, px: 124, w: 800, ls: -0.04, x: 44, y: 1126, wd: 1000, lh: 1 })}${TX("LET'S CHAT.", { f: SF, px: 124, w: 800, ls: -0.04, x: 44, y: 1246, wd: 1000, lh: 1 })}`, '#0a0a0a', false)]]
}

// G09 DOUBLE EXPOSURE: a woman and a man superimposed with their eyes locked on the same two points.
{
  const align = (s, ipd, cy, extra = '') => { const a = S2(s), E = EYES(s), d = Math.hypot(E.re[0] - E.le[0], E.re[1] - E.le[1]), k = ipd / d, mx = (E.le[0] + E.re[0]) / 2, my = (E.le[1] + E.re[1]) / 2, x = 540 - mx * k, y = cy - my * k, f = FACE(s); USED.add(s)
    return { html: imgTag(a.src, x, y, a.w * k, a.h * k, extra) + fb(a, k, x, y), bottom: y + (f[1] + f[3]) * k } }
  const de = (sa, sb, l1, l2, { cy = 640, ipd = 250 } = {}) => { const A = align(sa, ipd, cy, 'filter:contrast(1.15) saturate(.8) brightness(.82);'), B = align(sb, ipd, cy, 'filter:grayscale(1) contrast(1.6) brightness(.9);')
    const top = Math.round(Math.min(1440 - 300, Math.max(A.bottom, B.bottom) + 50))
    return frame(`<div style="position:absolute;inset:0;isolation:isolate;background:#000;">${A.html}<div style="position:absolute;inset:0;mix-blend-mode:screen;-webkit-mask-image:radial-gradient(ellipse 62% 56% at 50% 36%,#000 52%,transparent 100%);mask-image:radial-gradient(ellipse 62% 56% at 50% 36%,#000 52%,transparent 100%);">${B.html}</div></div><div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.4) 0%,transparent 24%,transparent 56%,rgba(0,0,0,.7) 100%);"></div>
      <div style="position:absolute;left:30px;right:30px;top:${top}px;text-align:center;"><p style="margin:0;font:500 ${l2 && l1.length > 9 ? 70 : 118}px Futura,'Avenir Next',sans-serif;letter-spacing:.2em;color:#fff;text-transform:uppercase;line-height:1;${SH}">${l1}</p>${l2 ? `<p style="margin:20px 0 0;font:600 30px ${SFM};letter-spacing:.34em;color:#fff;text-transform:uppercase;${SH}">${l2}</p>` : ''}</div>${grain(0.06)}`, '#000', false) }
  C.g09 = [['01-double', de('R1-09952-0013', 'R1-09997-0009', CITY, 'free photo shoot')], ['02-double', de('R1-09794-031A', 'R1-09952-0019', 'about an hour.', 'i direct every frame')], ['03-double', de('R1-09997-0006', 'R1-09952-0003', 'INTERESTED?', "LET'S CHAT")]]
}

// G10 GLITCH: the portrait split into R, G and B channels pulled apart, torn slices, scanlines.
{
  const glitch = (s, l1, l2, { fy = 0.40, px = 150 } = {}) => { const F = fit(s, 1080, 1920, { fy, faceH: 520 }), a = S2(s), w = a.w * F.k, h = a.h * F.k, f = F.face
    const lay = (flt, dx) => `<div style="position:absolute;inset:0;mix-blend-mode:screen;transform:translateX(${dx}px);filter:url(#${flt});">${imgTag(a.src, F.x, F.y, w, h)}</div>`
    const slice = (y0, y1, dx) => `<div style="position:absolute;inset:0;clip-path:inset(${y0}px 0 ${1920 - y1}px 0);transform:translateX(${dx}px);">${imgTag(a.src, F.x, F.y, w, h)}</div>`
    const top = Math.round(Math.min(1440 - 230, f.bottom + 50))
    return frame(`<svg width="0" height="0" style="position:absolute"><filter id="fr"><feColorMatrix type="matrix" values="1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0"/></filter><filter id="fg"><feColorMatrix type="matrix" values="0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0"/></filter><filter id="fb"><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0"/></filter></svg>
      <div style="position:absolute;inset:0;isolation:isolate;background:#000;">${lay('fr', -18)}${lay('fg', 0)}${lay('fb', 18)}</div>
      ${slice(f.top - 40, f.top + 40, 44)}${slice(f.bottom - 120, f.bottom - 70, -52)}${slice(f.bottom + 10, f.bottom + 38, 36)}${fb(a, F.k, F.x, F.y)}
      <div style="position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(0,0,0,.22) 0 2px,transparent 2px 5px);"></div><div style="position:absolute;inset:0;background:linear-gradient(180deg,transparent 60%,rgba(0,0,0,.55) 100%);"></div>
      <div style="position:absolute;left:0;right:0;top:${top}px;text-align:center;"><p style="margin:0;font:800 ${px}px ${SF};letter-spacing:-.03em;color:#fff;line-height:.95;white-space:nowrap;text-shadow:-9px 0 rgba(255,0,60,.9),9px 0 rgba(0,240,255,.9);">${l1}</p><p style="margin:14px 0 0;font:700 44px ${SFM};letter-spacing:.2em;color:#fff;text-shadow:-4px 0 rgba(255,0,60,.9),4px 0 rgba(0,240,255,.9);">${l2}</p></div>`, '#000', false) }
  C.g10 = [['01-glitch', glitch('R1-09952-0019', CITY.toUpperCase(), 'FREE PHOTO SHOOT')], ['02-glitch', glitch('R1-09794-021A', 'ABOUT AN HOUR', 'I DIRECT EVERY FRAME', { fy: 0.38, px: 112 })], ['03-glitch', glitch('R1-09794-035A', 'INTERESTED?', "LET'S CHAT", { fy: 0.30, px: 130 })]]
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
        return [...document.querySelectorAll('p,[data-text]')].filter(p => !p.closest('[data-card],[data-behind],[data-ring]')).flatMap(p => { const rg = document.createRange(); rg.selectNodeContents(p); const b = rg.getBoundingClientRect()
          return faces.filter(f => R(b, f) > 0.04 * f.width * f.height).map(() => p.textContent.slice(0, 30)) })
      })
      const FACE_MIN = NOMIN.has(id) ? 0 : name.startsWith('01') ? 300 : 110
      const small = await page.evaluate(min => [...document.querySelectorAll('.fbox')].map(e => e.getBoundingClientRect()).filter(f => f.right > 0 && f.left < 1080 && f.bottom > 0 && f.top < 1920 && f.height < min).length, FACE_MIN)
      if (small) { faceFails.push(`${id}/${name}: ${small} face(s) under ${FACE_MIN}px`); console.error(`  ✗ ${id}/${name}: ${small} face(s) smaller than ${FACE_MIN}px`) }
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
  if (!ONLY) { const all = [...WOMEN, ...MEN, ...LAND], miss = all.filter(x => !USED.has(x)); console.log(`photos used: ${all.length - miss.length}/${all.length}${miss.length ? ' — unused: ' + miss.join(' ') : ''}`) }
  if (faceFails.length) { console.error(`${faceFails.length} slide(s) put text over a face`); process.exitCode = 1 }
}
render()
