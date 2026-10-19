import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

// CHARLOTTE v10-safe — the v10 formats with every drawn control removed (Meta: no fake buttons, notifications,
// checkboxes, choice options). The formats stay; only the fake UI goes. Out entirely: App Store, search, retro dialog, CAPTCHA.
// CHARLOTTE v10 — 30 MORE "LOOKS LIKE SOMETHING ELSE" concepts (Aidan, 21 Oct: "i love some of these. cpc is key. make 30
// variations. new obviously"). Same principle as v9: card 1 stops the scroll by not looking like an ad. Thirty new formats,
// each with a hook card and its own native call-to-action card. Face-size floor off (formats decide), text-over-face gate on.
// -- v9 notes follow --
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
// Usage: node render-v10.mjs --photos=<dir of <stem>.jpg> --vision=<dir> --out=<dir> [--only=m01,m02]
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


// ---------- shared pieces ----------
const GEO = s => { const a = S2(s), f = FACE(s), k0 = Math.max(1080 / a.w, 1920 / a.h); return f ? { top: f[1] * k0, bot: (f[1] + f[3]) * k0, h: f[3] * k0 } : { top: 0, bot: 0, h: 0 } }
const WP = ['R1-09952-0012', 'R1-09797-0016', 'R1-00006-008A', 'R1-09952-0013', 'R1-09799-0034', 'R1-09952-0026', 'R1-09952-0019', 'R1-00009-0034', 'R1-09792-0026', 'R1-09953-021A', 'R1-09799-0007', 'R1-00008-0022', 'R1-09996-0026', 'R1-09793-0011', 'R1-09793-0028', 'R1-09952-0003', 'R1-00008-0005', 'R1-00007-025A', 'R1-00006-013A', '000013', 'R1-09798-032A', 'R1-09797-0005', 'R1-09797-0018', 'R1-09952-0007', 'R1-00006-015A', 'R1-00009-0028', 'R1-09793-0013', 'R1-09996-0029', 'R1-09793-0028']
const MP = ['R1-09794-031A', 'R1-00009-0002', 'R1-09794-035A', 'img0013', 'img0027-3', 'R1-09997-0011', 'R1-09997-0006', 'R1-09997-0003', 'R1-09997-0009', 'R1-09995-0010', 'R1-09794-021A', 'R1-00009-0021', 'img0006', 'img0015-2', 'R1-09997-0005']
const usedM = new Set()
const pick = (pool, pred = () => true) => { const ok = s => { try { return pred(GEO(s), s) } catch { return false } }
  const c = pool.find(s => !usedM.has(s) && ok(s)) || pool.find(ok) || pool[0]; usedM.add(c); return c }
const PH = (s, l, t, w, h, { fh = 0.5, fy = 0.42, fx = 0.5, r = 0, extra = '' } = {}) => { usedM.add(s); return box(l, t, w, h, fit(s, w, h, { fy, fx, faceH: h * fh, minFace: 0 }).html, `border-radius:${r}px;${extra}`) }
const SX = (txt, o = {}) => TX(txt, { f: SF, ...o })
const lines = (txt, px, wd) => Math.max(1, Math.ceil(txt.length * px * 0.52 / wd))
const bub = (txt, { me = false, x = 40, y, wd = 760, px = 40, dark = false } = {}) => { const h = lines(txt, px, wd - 56) * px * 1.25 + 38
  return { h, html: `<div style="position:absolute;left:${x}px;top:${y}px;width:${wd}px;background:${me ? '#0a84ff' : dark ? '#262626' : '#e9e9eb'};border-radius:36px;padding:19px 28px;box-sizing:border-box;"><p style="margin:0;font:400 ${px}px/1.25 ${SF};color:${me || dark ? '#fff' : '#111'};">${txt}</p></div>` } }
const CTA1 = 'Interested?', CTA2 = "Let's chat."

// M01 iMESSAGE: a text thread from "Aidan": your portrait arrives as a photo message.
{
  const s = pick(WP), s2 = pick(MP)
  const hdr = `<div style="position:absolute;inset:0;background:#fff;"></div>${SX('‹', { px: 90, c: '#0a84ff', x: 36, y: 250, wd: 60, w: 300 })}<div style="position:absolute;left:480px;top:262px;width:120px;height:120px;border-radius:50%;background:linear-gradient(180deg,#a5a5aa,#7d7d82);"></div>${SX('A', { px: 60, w: 600, c: '#fff', al: 'center', x: 480, y: 290, wd: 120 })}${SX('Aidan ›', { px: 26, c: '#111', al: 'center', x: 0, y: 392, wd: 1080 })}`
  const b1 = bub('free photo shoot in Charlotte 📸', { y: 450 }), b2 = bub('interested?', { y: 1335, wd: 330 })
  C.m01 = [['01-imessage', frame(`${hdr}${b1.html}${PH(s, 40, 560, 820, 740, { fh: 0.5, r: 38 })}${b2.html}`, '#fff', false)],
    ['02-imessage', frame(`${hdr}${bub("i'm aidan, a portrait photographer. i'm in charlotte for a few weeks.", { y: 450, wd: 800 }).html}${bub('about an hour. i direct every frame.', { y: 640, wd: 800 }).html}${PH(s2, 40, 770, 820, 560, { fh: 0.5, r: 38 })}${bub("Interested? Let's chat.", { y: 1350, wd: 560 }).html}`, '#fff', false)]]
}

// M02 INSTAGRAM MESSAGE REQUEST: avatar, a request from @madebyaidan, an Accept button.
{
  const s = pick(WP), s2 = pick(MP)
  const top = `<div style="position:absolute;inset:0;background:#000;"></div>${SX('‹', { px: 80, c: '#fff', x: 40, y: 252, wd: 60, w: 300 })}`
  C.m02 = [['01-request', frame(`${top}${SX('Message request', { px: 38, w: 700, c: '#fff', al: 'center', x: 0, y: 272, wd: 1080 })}
    <div style="position:absolute;left:290px;top:350px;width:500px;height:500px;border-radius:50%;padding:8px;background:linear-gradient(45deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5);box-sizing:border-box;"><div style="width:100%;height:100%;border-radius:50%;border:8px solid #000;box-sizing:border-box;overflow:hidden;position:relative;">${PH(s, 0, 0, 484, 484, { fh: 0.62, r: 242 })}</div></div>
    ${SX('madebyaidan', { px: 58, w: 700, c: '#fff', al: 'center', x: 0, y: 880, wd: 1080 })}${SX('portrait photographer · Charlotte', { px: 36, c: '#a8a8a8', al: 'center', x: 0, y: 955, wd: 1080 })}
    ${bub('free photo shoot in Charlotte 📸', { y: 1040, x: 120, wd: 840, dark: true }).html}${bub("i'm only in Charlotte for a short time — let's shoot.", { y: 1150, x: 120, wd: 840, dark: true }).html}
    ${SX("Interested? Let's chat.", { px: 44, w: 700, c: '#fff', al: 'center', x: 0, y: 1310, wd: 1080 })}`, '#000', false)],
    ['02-thread', frame(`${top}<div style="position:absolute;left:130px;top:262px;width:84px;height:84px;border-radius:50%;overflow:hidden;">${PH(s2, 0, 0, 84, 84, { fh: 0.62, r: 42 })}</div>${SX('madebyaidan', { px: 36, w: 700, c: '#fff', x: 232, y: 276, wd: 600 })}
    ${bub("i'm aidan, a portrait photographer. i'm in charlotte for a few weeks.", { y: 400, wd: 820, dark: true }).html}${bub('about an hour. i direct every frame.', { y: 590, wd: 820, dark: true }).html}${PH(s2, 40, 710, 760, 600, { fh: 0.5, r: 38 })}
    ${bub("Interested? Let's chat.", { y: 1330, wd: 560, dark: true }).html}`, '#000', false)]]
}

// M03 MEMORIES: a "memory" tile — story-progress bars, title top-left, a play pill.
{
  const s = pick(WP, g => g.top >= 540 && g.bot <= 1250), s2 = pick(MP, g => g.top >= 540 && g.bot <= 1250)
  const mem = (ph, t1, t2) => frame(`${(() => { const F = fit(ph, 1080, 1920, { fy: 0.5, faceH: 440 }); return F.html })()}<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.5) 0%,transparent 32%,transparent 70%,rgba(0,0,0,.45) 100%);"></div>
    <div style="position:absolute;left:36px;right:36px;top:256px;display:flex;gap:8px;">${[1, 0, 0, 0, 0].map(a => `<div style="flex:1;height:7px;border-radius:4px;background:${a ? '#fff' : 'rgba(255,255,255,.4)'};"></div>`).join('')}</div>
    ${SX('MEMORIES', { px: 26, w: 700, ls: 0.3, c: 'rgba(255,255,255,.85)', x: 48, y: 292, wd: 600 })}${SX(t1, { px: 132, w: 800, ls: -0.03, c: '#fff', x: 44, y: 330, wd: 990, lh: 1, extra: soft })}${SX(t2, { px: 54, w: 500, c: 'rgba(255,255,255,.92)', x: 48, y: 470, wd: 990, extra: soft })}
    ${SX("Interested? Let's chat.", { px: 40, w: 600, c: '#fff', x: 48, y: 1350, wd: 800, extra: soft })}`, '#000', false)
  C.m03 = [['01-memory', mem(s, CITY, 'free photo shoot')], ['02-memory', mem(s2, 'about an hour.', 'i direct every frame')]]
}

// M04 FACETIME: an incoming video call — "Charlotte" is calling — Decline / Accept.
{
  const s = pick(WP, g => g.top >= 520 && g.bot <= 1150), s2 = pick(MP, g => g.top >= 520 && g.bot <= 1100)
  const btn = (col, glyph, label, x) => `<div style="position:absolute;left:${x}px;top:1250px;width:150px;height:150px;border-radius:50%;background:${col};"></div>${SX(glyph, { px: 80, c: '#fff', al: 'center', x, y: 1280, wd: 150, w: 600 })}${SX(label, { px: 32, c: '#fff', al: 'center', x: x - 40, y: 1400, wd: 230, extra: soft })}`
  C.m04 = [['01-call', frame(`${fit(s, 1080, 1920, { fy: 0.46, faceH: 420 }).html}<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.55) 0%,transparent 28%,transparent 62%,rgba(0,0,0,.6) 100%);"></div>
    ${SX('Charlotte', { px: 104, w: 700, c: '#fff', al: 'center', x: 0, y: 286, wd: 1080, extra: soft })}${SX('free photo shoot · FaceTime Video…', { px: 40, c: 'rgba(255,255,255,.85)', al: 'center', x: 0, y: 410, wd: 1080, extra: soft })}${SX('Charlotte is calling', { px: 46, w: 600, c: '#fff', al: 'center', x: 0, y: 1300, wd: 1080, extra: soft })}${SX("Interested? Let's chat.", { px: 40, c: 'rgba(255,255,255,.9)', al: 'center', x: 0, y: 1370, wd: 1080, extra: soft })}`, '#000', false)],
    ['02-call', frame(`${fit(s2, 1080, 1920, { fy: 0.46, faceH: 420 }).html}<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.5) 0%,transparent 26%,transparent 60%,rgba(0,0,0,.7) 100%);"></div>
    ${SX('Aidan', { px: 70, w: 700, c: '#fff', al: 'center', x: 0, y: 280, wd: 1080, extra: soft })}${SX('00:01', { px: 38, c: 'rgba(255,255,255,.85)', al: 'center', x: 0, y: 368, wd: 1080, extra: soft })}
    ${SX('about an hour.', { px: 78, w: 800, c: '#fff', al: 'center', x: 0, y: 1190, wd: 1080, extra: soft })}${SX("i direct every frame. Interested? Let's chat.", { px: 38, c: '#fff', al: 'center', x: 40, y: 1285, wd: 1000, extra: soft })}
    `, '#000', false)]]
}

// M05 NOW PLAYING: the portrait is the album art; the city is the track.
{
  const s = pick(WP), s2 = pick(MP)
  const np = (art, t, a) => { const acc = ACCENT(art); return frame(`<div style="position:absolute;inset:0;background:linear-gradient(180deg,${acc} 0%,#1a1a1a 85%);"></div><div style="position:absolute;inset:0;background:rgba(0,0,0,.35);"></div>
    <div style="position:absolute;left:36px;top:262px;width:1008px;height:1008px;"></div>
    ${PH(art, 90, 280, 900, 860, { fh: 0.52, r: 38, extra: 'box-shadow:0 30px 60px rgba(0,0,0,.5);' })}
    ${SX(t, { px: 76, w: 800, c: '#fff', x: 90, y: 1170, wd: 900, lh: 1 })}${SX(a, { px: 44, c: 'rgba(255,255,255,.72)', x: 90, y: 1260, wd: 900 })}
    `, '#000', false) }
  C.m05 = [['01-playing', np(s, CITY, 'Aidan · free photo shoot')], ['02-playing', np(s2, 'Interested?', "Let's chat.")]]
}

// M06 MAP PIN: a map with a pin whose head is her portrait; the place card says Charlotte.
{
  const s = pick(WP), s2 = pick(MP)
  const rd = []; let seed = 7; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280
  for (let i = 0; i < 14; i++) { const y = 200 + i * 130 + rnd() * 40; rd.push(`<path d="M-50 ${y} L1130 ${y + (rnd() - 0.5) * 220}" stroke="#fff" stroke-width="${10 + rnd() * 14}" fill="none"/>`) }
  for (let i = 0; i < 9; i++) { const x = 60 + i * 130 + rnd() * 40; rd.push(`<path d="M${x} -50 L${x + (rnd() - 0.5) * 260} 2000" stroke="#fff" stroke-width="${8 + rnd() * 12}" fill="none"/>`) }
  const map = `<svg style="position:absolute;inset:0" width="1080" height="1920"><rect width="1080" height="1920" fill="#ece6d7"/><path d="M0 1500 q300 -160 620 -60 t460 -120 v700 h-1080z" fill="#bcd7ea"/><ellipse cx="880" cy="520" rx="260" ry="190" fill="#cfe3b6"/><ellipse cx="150" cy="1250" rx="200" ry="150" fill="#cfe3b6"/>${rd.join('')}</svg>`
  const pin = (ph, cx, cy, d) => `<div style="position:absolute;left:${cx - d / 2 - 12}px;top:${cy - d / 2 - 12}px;width:${d + 24}px;height:${d + 24}px;border-radius:50%;background:#fff;box-shadow:0 20px 40px rgba(0,0,0,.35);"></div><div style="position:absolute;left:${cx - 24}px;top:${cy + d / 2 + 6}px;width:48px;height:48px;background:#fff;transform:rotate(45deg);"></div>${PH(ph, cx - d / 2, cy - d / 2, d, d, { fh: 0.62, r: d / 2 })}`
  C.m06 = [['01-map', frame(`${map}${SX('free photo shoot', { px: 44, w: 700, c: '#222', x: 60, y: 280, wd: 960, extra: 'text-shadow:0 1px 0 #fff;' })}
    ${pin(s, 540, 700, 470)}<div style="position:absolute;left:110px;top:1130px;width:860px;height:240px;border-radius:36px;background:#fff;box-shadow:0 14px 34px rgba(0,0,0,.25);"></div>${SX(CITY.toUpperCase(), { px: 92, w: 800, c: '#111', ls: -0.02, x: 150, y: 1150, wd: 800 })}${SX('free photo shoot · about an hour', { px: 40, c: '#666', x: 154, y: 1262, wd: 800 })}`, '#ece6d7', false)],
    ['02-map', frame(`${map}${pin(s2, 540, 520, 330)}<div style="position:absolute;left:0;right:0;top:800px;height:640px;background:#fff;border-radius:44px 44px 0 0;box-shadow:0 -10px 40px rgba(0,0,0,.25);"></div>
    ${SX('Free Photo Shoot', { px: 64, w: 800, c: '#111', x: 60, y: 840, wd: 960 })}${SX('Charlotte · about an hour · $0', { px: 38, c: '#666', x: 62, y: 925, wd: 960 })}${SX('i direct every frame.', { px: 40, c: '#111', x: 62, y: 1010, wd: 960 })}
    ${SX("Interested? Let's chat.", { px: 60, w: 800, c: '#111', x: 60, y: 1120, wd: 960 })}`, '#ece6d7', false)]]
}

// M07 WEATHER: the forecast says FREE.
{
  const s = pick(WP, g => g.top >= 760), s2 = pick(MP, g => g.top >= 740)
  const wx = (ph, t, sub, hi) => frame(`${fit(ph, 1080, 1920, { fy: 0.6, faceH: 420 }).html}<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(20,40,80,.55) 0%,rgba(20,40,80,.22) 30%,transparent 42%);"></div>
    ${SX(CITY, { px: 70, w: 500, c: '#fff', al: 'center', x: 0, y: 268, wd: 1080, extra: soft })}${SX(t, { px: t.length > 5 ? 150 : 300, w: 200, c: '#fff', al: 'center', x: 0, y: t.length > 5 ? 380 : 320, wd: 1080, lh: 1, extra: soft })}${SX(sub, { px: 54, w: 500, c: '#fff', al: 'center', x: 0, y: 640, wd: 1080, extra: soft })}${SX(hi, { px: 40, w: 500, c: '#fff', al: 'center', x: 0, y: 715, wd: 1080, extra: soft })}`, '#000', false)
  C.m07 = [['01-weather', wx(s, 'FREE', 'photo shoot', 'H: about an hour   L: $0')], ['02-weather', wx(s2, 'Tonight', "Interested? Let's chat.", 'i direct every frame')]]
}

// M08 LISTING: a stay-style listing — photo, price $0, a Message button.
{
  const s = pick(WP), s2 = pick(MP)
  const li = (ph, title, sub, price) => frame(`<div style="position:absolute;inset:0;background:#fff;"></div>${PH(ph, 30, 262, 1020, 900, { fh: 0.5, r: 44 })}
    ${SX(title, { px: 56, w: 700, c: '#111', x: 48, y: 1190, wd: 980 })}${SX(sub, { px: 38, c: '#666', x: 50, y: 1268, wd: 980 })}${SX(price, { px: 76, w: 800, c: '#111', x: 48, y: 1330, wd: 400 })}
    ${SX("Interested? Let's chat.", { px: 44, w: 700, c: '#111', al: 'right', x: 0, y: 1346, wd: 1032 })}`, '#fff', false)
  C.m08 = [['01-listing', li(s, 'Free photo shoot in Charlotte', 'with Aidan · about an hour', '$0')], ['02-listing', li(s2, "Interested? Let's chat.", 'i direct every frame', '$0')]]
}


// M10 NEWSPAPER: a front page, halftone portrait, the headline is the offer.
{
  const ht = n => `<img src="${png(path.join(PHOTOS, '..', 'halftone', n + '.png'))}" style="display:block;width:960px;height:600px;"/>`
  const paper = '#e9e4d6', ink = '#1a1814'
  const np = (n, h1, h2, cap, ad) => frame(`<div style="position:absolute;inset:0;background:${paper};"></div>
    ${TX('THE CHARLOTTE GAZETTE', { f: DIDOT, px: 62, w: 700, c: ink, al: 'center', x: 0, y: 262, wd: 1080 })}<div style="position:absolute;left:60px;right:60px;top:362px;height:3px;background:${ink};"></div><div style="position:absolute;left:60px;right:60px;top:370px;height:1px;background:${ink};"></div>
    ${TX('FREE EDITION', { f: MONO, px: 22, w: 700, ls: 0.3, c: ink, al: 'center', x: 0, y: 384, wd: 1080 })}
    ${TX(h1, { f: DIDOT, px: 100, w: 700, c: ink, x: 60, y: 428, wd: 960, lh: 0.95 })}${TX(h2, { f: DIDOT, px: 100, w: 700, it: true, c: ink, x: 60, y: 528, wd: 960, lh: 0.95 })}
    <div style="position:absolute;left:60px;top:660px;width:960px;height:600px;">${ht(n)}</div>
    ${TX(cap, { f: BASK, px: 26, it: true, c: ink, x: 60, y: 1276, wd: 960 })}
    ${ad ? `<div style="position:absolute;left:60px;top:1330px;width:960px;height:100px;border:4px solid ${ink};"></div>${TX("INTERESTED? LET'S CHAT.", { f: DIDOT, px: 52, w: 700, c: ink, al: 'center', x: 60, y: 1350, wd: 960 })}` : TX("i'm aidan, a portrait photographer. i'm in charlotte for a few weeks. about an hour. i direct every frame.", { f: BASK, px: 28, c: ink, x: 60, y: 1334, wd: 960, lh: 1.25 })}`, paper, false)
  C.m10 = [['01-gazette', np('R1-09952-0012', 'Free photo shoot', 'comes to Charlotte', 'Aidan Torrence, portrait photographer, is in Charlotte for a few weeks.', false)], ['02-gazette', np('R1-09794-031A', 'About an hour.', 'Every frame directed.', 'No experience needed: "never done this before? don\'t worry."', true)]]
}

// M11 TICKET: an admit-one ticket — portrait on the ticket, perforated stub.
{
  const s = pick(WP), s2 = pick(MP)
  const tk = (ph, t1, t2, stub) => frame(`<div style="position:absolute;inset:0;background:radial-gradient(circle at 30% 20%,#27406b,#0f1c33 70%);"></div>
    <div style="position:absolute;left:140px;top:270px;width:800px;height:1150px;transform:rotate(-3deg);transform-origin:50% 50%;">
      <div style="position:absolute;inset:0;background:#f4ecd8;border-radius:30px;box-shadow:0 30px 70px rgba(0,0,0,.55);"></div>
      ${PH(ph, 40, 40, 720, 600, { fh: 0.52, r: 14 })}${TX(t1, { f: DIDOT, px: 104, w: 700, c: '#14213d', al: 'center', x: 0, y: 664, wd: 800 })}${TX(t2, { f: MONO, px: 28, w: 700, ls: 0.28, c: '#14213d', al: 'center', x: 0, y: 782, wd: 800 })}
      <div style="position:absolute;left:30px;right:30px;top:850px;border-top:6px dashed #bfae86;"></div><div style="position:absolute;left:-26px;top:824px;width:52px;height:52px;border-radius:50%;background:#16264a;"></div><div style="position:absolute;right:-26px;top:824px;width:52px;height:52px;border-radius:50%;background:#16264a;"></div>
      ${stub}</div>`, '#0f1c33', false)
  const stub1 = `${TX('ADMIT ONE', { f: GROT, px: 64, w: 800, ls: 0.1, c: '#14213d', al: 'center', x: 0, y: 886, wd: 800 })}${TX('about an hour · i direct every frame', { f: MONO, px: 26, c: '#14213d', al: 'center', x: 0, y: 968, wd: 800 })}<div style="position:absolute;left:100px;top:1020px;width:600px;height:90px;background:repeating-linear-gradient(90deg,#14213d 0 4px,transparent 4px 8px,#14213d 8px 9px,transparent 9px 14px,#14213d 14px 19px,transparent 19px 23px);"></div>`
  const stub2 = `${TX('INTERESTED?', { f: GROT, px: 70, w: 800, c: '#14213d', al: 'center', x: 0, y: 880, wd: 800 })}${TX("LET'S CHAT.", { f: GROT, px: 70, w: 800, c: '#14213d', al: 'center', x: 0, y: 960, wd: 800 })}<div style="position:absolute;left:100px;top:1050px;width:600px;height:70px;background:repeating-linear-gradient(90deg,#14213d 0 4px,transparent 4px 8px,#14213d 8px 9px,transparent 9px 14px,#14213d 14px 19px,transparent 19px 23px);"></div>`
  C.m11 = [['01-ticket', tk(s, CITY.toUpperCase(), 'FREE PHOTO SHOOT', stub1)], ['02-ticket', tk(s2, 'ADMIT ONE', 'CHARLOTTE · FREE PHOTO SHOOT', stub2)]]
}

// M12 TAROT: three cards — THE PORTRAIT, THE HOUR, THE CALL.
{
  const ph3 = [pick(WP), pick(MP), pick(WP)]
  const stars = Array.from({ length: 60 }, (_, i) => `<circle cx="${(i * 197) % 1080}" cy="${(i * 331) % 1920}" r="${1 + (i % 3)}" fill="#f6e7b4" opacity="${0.3 + (i % 5) * 0.12}"/>`).join('')
  const gold = '#d9b765'
  const tr = (num, t, sub, ph) => frame(`<div style="position:absolute;inset:0;background:radial-gradient(circle at 50% 30%,#2a1f55,#0d0820 75%);"></div><svg style="position:absolute;inset:0" width="1080" height="1920">${stars}</svg>
    <div style="position:absolute;left:190px;top:262px;width:700px;height:1170px;border-radius:26px;background:#150f33;border:6px solid ${gold};box-shadow:0 0 0 12px #150f33,0 0 0 16px ${gold},0 30px 70px rgba(0,0,0,.6);"></div>
    ${TX(num, { f: DIDOT, px: 52, c: gold, al: 'center', x: 190, y: 292, wd: 700, ls: 0.1 })}${PH(ph, 270, 372, 540, 640, { fh: 0.5, r: 270 })}
    ${TX(t, { f: DIDOT, px: t.length > 9 ? 64 : 80, c: gold, al: 'center', x: 190, y: 1040, wd: 700, ls: 0.06 })}${TX(sub, { f: FUT, px: 26, c: gold, al: 'center', x: 190, y: 1140, wd: 700, ls: 0.3 })}${TX('✦  ✦  ✦', { f: DIDOT, px: 36, c: gold, al: 'center', x: 190, y: 1220, wd: 700 })}
    ${TX('✦', { f: DIDOT, px: 44, c: gold, x: 214, y: 290, wd: 60 })}${TX('✦', { f: DIDOT, px: 44, c: gold, x: 806, y: 290, wd: 60 })}`, '#0d0820', false)
  C.m12 = [['01-tarot', tr('XIX', 'CHARLOTTE', 'FREE PHOTO SHOOT', ph3[0])], ['02-tarot', tr('XX', 'THE HOUR', 'I DIRECT EVERY FRAME', ph3[1])], ['03-tarot', tr('XXI', 'THE CALL', "INTERESTED? LET'S CHAT.", ph3[2])]]
}

// M13 TRADING CARD: a holo-foil collector card — FREE in the HP corner.
{
  const s = pick(WP), s2 = pick(MP)
  const holo = 'conic-gradient(from 20deg,#ff6ec7,#ffd86e,#7bf5a1,#6ec8ff,#b56eff,#ff6ec7)'
  const tcg = (ph, nm, hp, a1, d1, a2, d2) => frame(`<div style="position:absolute;inset:0;background:radial-gradient(circle at 50% 40%,#3a1a5c,#14091f 80%);"></div>
    <div style="position:absolute;left:110px;top:262px;width:860px;height:1170px;border-radius:44px;background:${holo};box-shadow:0 30px 70px rgba(0,0,0,.6);"></div>
    <div style="position:absolute;left:134px;top:286px;width:812px;height:1122px;border-radius:30px;background:#f6efd9;"></div>
    ${TX(nm, { f: GROT, px: 62, w: 800, c: '#222', x: 164, y: 312, wd: 560 })}${TX(hp, { f: GROT, px: 52, w: 800, c: '#c1272d', al: 'right', x: 164, y: 316, wd: 750 })}
    <div style="position:absolute;left:164px;top:402px;width:752px;height:560px;border:8px solid #d9b765;box-sizing:border-box;background:#000;">${PH(ph, 0, 0, 736, 544, { fh: 0.55 })}</div>
    ${TX('Free Photo Shoot · Portrait · Charlotte', { f: BASK, px: 26, it: true, c: '#444', al: 'center', x: 134, y: 980, wd: 812 })}
    ${TX(a1, { f: GROT, px: 44, w: 800, c: '#222', x: 164, y: 1040, wd: 740 })}${TX(d1, { f: GROT, px: 32, c: '#444', x: 164, y: 1094, wd: 740 })}${TX(a2, { f: GROT, px: 44, w: 800, c: '#222', x: 164, y: 1170, wd: 740 })}${TX(d2, { f: GROT, px: 32, c: '#444', x: 164, y: 1224, wd: 740 })}
    ${TX('Aidan Torrence · portrait photographer', { f: MONO, px: 20, c: '#777', x: 164, y: 1370, wd: 740 })}
    <div style="position:absolute;left:134px;top:286px;width:812px;height:1122px;border-radius:30px;background:linear-gradient(115deg,transparent 30%,rgba(255,255,255,.4) 46%,transparent 62%);mix-blend-mode:overlay;"></div>`, '#14091f', false)
  C.m13 = [['01-card', tcg(s, CITY.toUpperCase(), 'FREE ★', 'About an hour', 'i direct every frame.', "Interested?", "Let's chat.")], ['02-card', tcg(s2, 'AIDAN', '1 HR', 'Never done this before?', "don't worry — i'll direct you.", "Interested?", "Let's chat.")]]
}

// M14 INSTAGRAM PROFILE: Message is the primary button.
{
  const s = pick(WP), s2 = pick(MP), hl = [pick(WP), pick(MP), pick(WP), pick(MP), pick(WP)]
  const pf = (av, btn2) => frame(`<div style="position:absolute;inset:0;background:#fff;"></div>
    ${SX('madebyaidan ⌄', { px: 46, w: 800, c: '#111', x: 48, y: 268, wd: 700 })}${SX('☰', { px: 50, c: '#111', al: 'right', x: 0, y: 266, wd: 1032 })}
    <div style="position:absolute;left:50px;top:350px;width:300px;height:300px;border-radius:50%;padding:7px;background:linear-gradient(45deg,#feda75,#d62976,#4f5bd5);box-sizing:border-box;"><div style="width:100%;height:100%;border-radius:50%;border:7px solid #fff;box-sizing:border-box;position:relative;overflow:hidden;">${PH(av, 0, 0, 272, 272, { fh: 0.6, r: 136 })}</div></div>
    ${[['$0', 'price'], ['1 hr', 'session'], ['CLT', 'city']].map(([a, b], i) => `<div style="position:absolute;left:${400 + i * 215}px;top:430px;width:200px;text-align:center;"><p style="margin:0;font:700 56px ${SF};color:#111;">${a}</p><p style="margin:2px 0 0;font:400 34px ${SF};color:#555;">${b}</p></div>`).join('')}
    ${SX('Aidan Torrence', { px: 42, w: 700, c: '#111', x: 50, y: 690, wd: 980 })}${SX("portrait photographer<br>in charlotte for a few weeks<br>free photo shoot · about an hour<br>i direct every frame ↓", { px: 36, c: '#111', x: 50, y: 752, wd: 980, lh: 1.25 })}
    ${SX(btn2, { px: 44, w: 700, c: '#111', x: 50, y: 975, wd: 980 })}
    ${hl.map((h, i) => `<div style="position:absolute;left:${40 + i * 200}px;top:1090px;width:170px;height:170px;border-radius:50%;border:4px solid #ddd;padding:6px;box-sizing:border-box;overflow:hidden;">${PH(h, 6, 6, 148, 148, { fh: 0.62, r: 74 })}</div>`).join('')}
    ${['work', 'about', 'how', 'faq', 'hi'].map((t, i) => SX(t, { px: 28, c: '#111', al: 'center', x: 40 + i * 200, y: 1272, wd: 170 })).join('')}`, '#fff', false)
  C.m14 = [['01-profile', pf(s, 'free photo shoot · message me')], ['02-profile', pf(s2, "Interested? Let's chat.")]]
}

// M15 INSTAGRAM NOTE: a friend's note above their avatar.
{
  const s = pick(WP), s2 = pick(MP)
  const nt = (av, note, below) => frame(`<div style="position:absolute;inset:0;background:#000;"></div>${SX('‹  Messages', { px: 44, w: 700, c: '#fff', x: 40, y: 268, wd: 700 })}${SX('✎', { px: 50, c: '#fff', al: 'right', x: 0, y: 266, wd: 1040 })}
    <div style="position:absolute;left:190px;top:380px;width:700px;height:170px;border-radius:85px;background:#fff;box-shadow:0 10px 30px rgba(255,255,255,.12);"></div><div style="position:absolute;left:470px;top:536px;width:44px;height:44px;border-radius:50%;background:#fff;"></div><div style="position:absolute;left:430px;top:576px;width:24px;height:24px;border-radius:50%;background:#fff;"></div>
    ${SX(note, { px: 42, w: 700, c: '#111', al: 'center', x: 220, y: 428, wd: 640, lh: 1.15 })}
    <div style="position:absolute;left:260px;top:610px;width:560px;height:560px;border-radius:50%;overflow:hidden;">${PH(av, 0, 0, 560, 560, { fh: 0.58, r: 280 })}</div>
    ${SX(below, { px: 36, c: '#a8a8a8', al: 'center', x: 0, y: 1200, wd: 1080 })}
    ${[['madebyaidan', 'free photo shoot · tap to reply'], ['madebyaidan', "Let's chat."]].map(([n, m], i) => `<div style="position:absolute;left:48px;top:${1290 + i * 78}px;width:70px;height:70px;border-radius:50%;background:linear-gradient(180deg,#666,#333);"></div>${SX(n, { px: 32, w: 600, c: '#fff', x: 140, y: 1288 + i * 78, wd: 600 })}${SX(m, { px: 28, c: '#a8a8a8', x: 140, y: 1326 + i * 78, wd: 800 })}`).join('')}`, '#000', false)
  C.m15 = [['01-note', nt(s, 'free photo shoot in Charlotte 📸', 'Your note · Charlotte')], ['02-note', nt(s2, 'about an hour. i direct every frame.', "Interested? Let's chat.")]]
}

// M16 $0: giant numerals behind a cut-out; looks like a stats card.
{
  const cut = ['R1-09952-0012', 'R1-09952-0013', 'R1-09797-0016', 'R1-00009-0034', 'R1-09952-0019'], cutm = ['R1-09794-031A', 'R1-09997-0009', 'R1-09794-021A', 'R1-09995-0010']
  const st = (s, big, bg, l1, l2, ink = '#fff') => { const H_ = hang(s, 820, { fx: 0.5, minFace: 330 })
    return frame(`<div style="position:absolute;inset:0;background:${bg};"></div>${TX(l1, { f: SF, px: 78, w: 800, c: '#fff', al: 'center', x: 0, y: 262, wd: 1080, ls: -0.02 })}${TX(l2, { f: SFM, px: 34, w: 700, ls: 0.22, c: 'rgba(255,255,255,.9)', al: 'center', x: 0, y: 352, wd: 1080 })}
      <div data-behind>${TX(big, { f: SF, px: big.length > 3 ? 440 : 680, w: 900, ls: -0.05, c: ink, al: 'center', x: 0, y: big.length > 3 ? 470 : 400, wd: 1080, lh: 1, extra: 'opacity:.96;' })}</div>${H_.html}`, bg, false) }
  C.m16 = [['01-zero', st(cut[0], '$0', ACCENT(cut[0]), 'free photo shoot', 'CHARLOTTE')], ['02-hour', st(cutm[0], '1 hr', '#2b50ff', 'i direct every frame', "INTERESTED? LET'S CHAT")]]
}

// M17 ACTIVITY RINGS: three rings closed around her portrait; 01:00:00.
{
  const s = pick(WP), s2 = pick(MP)
  const rg = (ph, time, l1) => { const R = [[430, '#ff2d55'], [380, '#9bff1f'], [330, '#00e5ff']]
    return frame(`<div style="position:absolute;inset:0;background:#000;"></div><svg style="position:absolute;inset:0" width="1080" height="1920">${R.map(([r, c]) => `<circle cx="540" cy="760" r="${r}" fill="none" stroke="#222" stroke-width="40"/><circle cx="540" cy="760" r="${r}" fill="none" stroke="${c}" stroke-width="40" stroke-linecap="round"/>`).join('')}</svg>
      <div style="position:absolute;left:290px;top:510px;width:500px;height:500px;border-radius:50%;overflow:hidden;">${PH(ph, 0, 0, 500, 500, { fh: 0.62, r: 250 })}</div>
      ${SX(time, { px: 150, w: 300, ls: -0.02, c: '#fff', al: 'center', x: 0, y: 1240, wd: 1080, lh: 1 })}${SX(l1, { px: 42, c: 'rgba(255,255,255,.75)', al: 'center', x: 0, y: 1396, wd: 1080 })}`, '#000', false) }
  C.m17 = [['01-rings', rg(s, '01:00:00', 'Charlotte · free photo shoot')], ['02-rings', rg(s2, 'GO', "Interested? Let's chat.")]]
}

// M18 CLAPPERBOARD: a slate — PROD / SCENE / TAKE.
{
  const s = pick(WP, g => g.h >= 0), s2 = pick(MP)
  const cl = (ph, rows) => frame(`<div style="position:absolute;inset:0;background:#0b0b0b;"></div>${box(0, 262, 1080, 700, fit(ph, 1080, 700, { fy: 0.45, faceH: 360, minFace: 0 }).html)}
    <div style="position:absolute;left:40px;top:960px;width:1000px;height:110px;background:repeating-linear-gradient(115deg,#fff 0 70px,#111 70px 140px);transform:rotate(-3deg);transform-origin:0 100%;border:6px solid #111;box-sizing:border-box;"></div>
    <div style="position:absolute;left:40px;top:1062px;width:1000px;height:380px;background:#161616;border:6px solid #fff;box-sizing:border-box;"></div>
    ${rows.map(([k, v], i) => `${TX(k, { f: MONO, px: 24, w: 700, c: '#aaa', ls: 0.2, x: 70 + (i % 2) * 500, y: 1086 + Math.floor(i / 2) * 120, wd: 460 })}${TX(v, { f: HW, px: 74, w: 700, c: '#fff', x: 70 + (i % 2) * 500, y: 1112 + Math.floor(i / 2) * 120, wd: 460, lh: 1 })}`).join('')}`, '#0b0b0b', false)
  C.m18 = [['01-slate', cl(s, [['PROD.', 'free photo shoot'], ['SCENE', CITY], ['DIRECTOR', 'Aidan'], ['TAKE', '1']])], ['02-slate', cl(s2, [['ROLL', 'about an hour'], ['SCENE', 'every frame'], ['DIRECTOR', 'Aidan'], ['ACTION', "let's chat"]])]]
}


// M20 POST: a text post with the portrait as the attached photo.
{
  const s = pick(WP), s2 = pick(MP)
  const po = (ph, text) => frame(`<div style="position:absolute;inset:0;background:#000;"></div>
    <div style="position:absolute;left:40px;top:268px;width:96px;height:96px;border-radius:50%;background:linear-gradient(180deg,#777,#333);"></div>${SX('Aidan', { px: 42, w: 700, c: '#fff', x: 160, y: 272, wd: 600 })}${SX('@madebyaidan · now', { px: 32, c: '#71767b', x: 160, y: 326, wd: 700 })}
    ${SX(text, { px: 54, c: '#e7e9ea', x: 40, y: 410, wd: 1000, lh: 1.22 })}${PH(ph, 40, 640, 1000, 700, { fh: 0.5, r: 36 })}
    ${SX("Interested? Let's chat.", { px: 44, w: 700, c: '#e7e9ea', x: 40, y: 1368, wd: 1000 })}`, '#000', false)
  C.m20 = [['01-post', po(s, 'free photo shoot in Charlotte. interested? 📸')], ['02-post', po(s2, "about an hour. i direct every frame. let's chat.")]]
}

// M21 ALBUM COVER: record sleeve with a FREE sticker; the back is the track list.
{
  const s = pick(WP), s2 = pick(MP)
  const rec = `<div style="position:absolute;left:300px;top:330px;width:740px;height:740px;border-radius:50%;background:repeating-radial-gradient(circle,#0c0c0c 0 3px,#1a1a1a 3px 6px);box-shadow:0 20px 50px rgba(0,0,0,.6);"></div><div style="position:absolute;left:580px;top:610px;width:180px;height:180px;border-radius:50%;background:#e8a33a;"></div><div style="position:absolute;left:660px;top:690px;width:20px;height:20px;border-radius:50%;background:#111;"></div>`
  C.m21 = [['01-sleeve', frame(`<div style="position:absolute;inset:0;background:radial-gradient(circle at 50% 35%,#3a3a3a,#111 80%);"></div>${rec}
    <div style="position:absolute;left:70px;top:290px;width:800px;height:800px;box-shadow:0 30px 70px rgba(0,0,0,.65);">${PH(s, 0, 0, 800, 800, { fh: 0.55 })}</div>
    <div style="position:absolute;left:700px;top:240px;width:200px;height:200px;border-radius:50%;background:#ffd23f;transform:rotate(12deg);box-shadow:0 8px 20px rgba(0,0,0,.4);"></div>${TX('FREE', { f: GROT, px: 70, w: 800, c: '#111', al: 'center', x: 700, y: 304, wd: 200, extra: 'transform:rotate(12deg);' })}
    ${TX(CITY.toUpperCase(), { f: GROT, px: 120, w: 800, ls: -0.03, c: '#fff', x: 70, y: 1130, wd: 940, lh: 1 })}${TX('AIDAN · FREE PHOTO SHOOT · SIDE A', { f: MONO, px: 28, w: 700, ls: 0.2, c: '#bbb', x: 74, y: 1270, wd: 940 })}`, '#111', false)],
    ['02-back', frame(`<div style="position:absolute;inset:0;background:#111;"></div><div style="position:absolute;left:100px;top:300px;width:880px;height:1100px;background:#f1ece0;"></div>
    ${TX('CHARLOTTE', { f: GROT, px: 100, w: 800, ls: -0.03, c: '#111', x: 140, y: 330, wd: 800 })}
    ${['1  free photo shoot', '2  about an hour', '3  i direct every frame', "4  Interested? Let's chat."].map((t, i) => TX(t, { f: GROT, px: 52, w: i === 3 ? 800 : 500, c: '#111', x: 140, y: 520 + i * 100, wd: 800 })).join('')}
    <div style="position:absolute;left:140px;top:1050px;width:360px;height:260px;"></div>${PH(s2, 140, 980, 360, 360, { fh: 0.55 })}<div style="position:absolute;left:540px;top:1230px;width:380px;height:100px;background:repeating-linear-gradient(90deg,#111 0 4px,transparent 4px 8px,#111 8px 9px,transparent 9px 14px,#111 14px 19px,transparent 19px 23px);"></div>`, '#111', false)]]
}

// M22 MARQUEE: a theatre marquee in bulbs; the portrait inside a bulb frame.
{
  const s = pick(WP), s2 = pick(MP)
  const bulbs = (x, y, w, h, n = 46) => { const out = []; const per = 2 * (w + h); for (let i = 0; i < n; i++) { let d = (i / n) * per, bx, by; if (d < w) { bx = d; by = 0 } else if (d < w + h) { bx = w; by = d - w } else if (d < 2 * w + h) { bx = w - (d - w - h); by = h } else { bx = 0; by = h - (d - 2 * w - h) }
    out.push(`<div style="position:absolute;left:${x + bx - 11}px;top:${y + by - 11}px;width:22px;height:22px;border-radius:50%;background:#fff3c4;box-shadow:0 0 14px 4px rgba(255,194,77,.75);"></div>`) } return out.join('') }
  const mq = (ph, t1, t2) => frame(`<div style="position:absolute;inset:0;background:#120a06;"></div>
    <div style="position:absolute;left:60px;top:290px;width:960px;height:250px;background:#2a1209;border-radius:10px;"></div>${bulbs(60, 290, 960, 250, 40)}${TX(t1, { f: GROT, px: t1.length > 9 ? 112 : 150, w: 800, c: '#fff6d6', al: 'center', x: 60, y: t1.length > 9 ? 372 : 340, wd: 960, ls: 0.02, lh: 1, extra: 'text-shadow:0 0 18px #ffc24d,0 0 40px #ff9a1f;' })}
    <div style="position:absolute;left:60px;top:600px;width:960px;height:830px;background:#000;">${PH(ph, 0, 0, 960, 830, { fh: 0.5 })}</div>${bulbs(60, 600, 960, 830, 52)}
    ${TX(t2, { f: FUT, px: 44, w: 700, c: '#fff6d6', al: 'center', x: 60, y: 1360, wd: 960, ls: 0.18, extra: 'text-shadow:0 0 14px #000,0 0 30px #000;' })}`, '#120a06', false)
  C.m22 = [['01-marquee', mq(s, CITY.toUpperCase(), 'FREE PHOTO SHOOT')], ['02-marquee', mq(s2, 'NOW SHOWING', "INTERESTED? LET'S CHAT")]]
}

// M23 NEON: neon script over a dark portrait.
{
  const s = pick(WP, g => g.bot <= 1000), s2 = pick(MP, g => g.bot <= 1000)
  const nn = (ph, t1, t2) => { const Pl = place(ph, 400, { fy: 0.34 })
    return frame(`${Pl.html}<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,10,.4) 0%,transparent 30%,rgba(0,0,10,.65) 62%,rgba(0,0,10,.85) 100%);"></div>
      ${TX(t1, { f: HW, px: 220, w: 700, c: '#ffe6fb', al: 'center', x: 0, y: Math.max(Pl.top, 1010), wd: 1080, lh: 1, extra: 'text-shadow:0 0 6px #fff,0 0 16px #ff4fd8,0 0 38px #ff4fd8,0 0 80px #ff1fb8;' })}${TX(t2, { f: HW, px: 100, w: 700, c: '#e4f6ff', al: 'center', x: 0, y: Math.max(Pl.top, 1010) + 210, wd: 1080, lh: 1, extra: 'text-shadow:0 0 6px #fff,0 0 14px #36c8ff,0 0 34px #36c8ff,0 0 70px #1b9bff;' })}`, '#000', false) }
  C.m23 = [['01-neon', nn(s, CITY, 'free photo shoot')], ['02-neon', nn(s2, 'Interested?', "Let's chat.")]]
}

// M24 CHALKBOARD: today's special.
{
  const s = pick(WP), s2 = pick(MP)
  const wood = 'background:repeating-linear-gradient(90deg,#6b4a2f 0 14px,#5e4029 14px 28px);'
  const ch = (ph, rows, extra) => frame(`<div style="position:absolute;inset:0;${wood}"></div><div style="position:absolute;left:50px;top:260px;width:980px;height:1180px;background:#22302a;background-image:radial-gradient(circle at 30% 20%,rgba(255,255,255,.07),transparent 60%),repeating-linear-gradient(0deg,rgba(255,255,255,.02) 0 2px,transparent 2px 5px);border:14px solid #3b2a1a;box-sizing:border-box;"></div>
    ${rows.map(([t, px, y]) => TX(t, { f: HW, px, w: 700, c: '#f1efe6', x: 100, y, wd: y >= 780 ? 440 : 880, lh: 1.05, extra: 'text-shadow:0 0 3px rgba(255,255,255,.4);' })).join('')}
    <div style="position:absolute;left:560px;top:760px;width:380px;height:490px;background:#fbfaf7;padding:20px;box-sizing:border-box;transform:rotate(4deg);box-shadow:0 18px 40px rgba(0,0,0,.5);">${PH(ph, 0, 0, 340, 380, { fh: 0.55 })}</div><div style="position:absolute;left:690px;top:735px;width:140px;height:44px;background:rgba(240,230,170,.8);transform:rotate(-6deg);"></div>${extra}`, '#22302a', false)
  C.m24 = [['01-chalk', ch(s, [["today's special", 80, 300], ['Free Photo Shoot', 130, 400], ['Charlotte · about an hour · $0', 64, 580], ['i direct every frame', 60, 800], ['edited photos', 60, 900]], '')], ['02-chalk', ch(s2, [['also on the menu', 80, 300], ["Interested?", 140, 410], ["Let's chat.", 140, 560], ['never done this before?', 54, 800], ["don't worry — i'll direct you", 54, 880]], '')]]
}



// M27 FACTS LABEL: "Photo Shoot Facts" over the portrait.
{
  const s = pick(WP), s2 = pick(MP)
  const fl = (ph, rows, tot) => frame(`${box(0, 0, 1080, 860, fit(ph, 1080, 860, { fy: 0.46, faceH: 400, minFace: 0 }).html)}<div style="position:absolute;left:90px;top:760px;width:900px;height:680px;background:#fff;border:6px solid #000;box-sizing:border-box;"></div>
    ${TX('Photo Shoot Facts', { f: GROT, px: 76, w: 900, ls: -0.03, c: '#000', x: 120, y: 780, wd: 840 })}<div style="position:absolute;left:120px;top:880px;width:840px;height:14px;background:#000;"></div>
    ${rows.map(([a, b], i) => `${TX(a, { f: GROT, px: 38, w: 400, c: '#000', x: 120, y: 916 + i * 76, wd: 560 })}${TX(b, { f: GROT, px: 38, w: 800, c: '#000', al: 'right', x: 120, y: 916 + i * 76, wd: 840 })}<div style="position:absolute;left:120px;top:${962 + i * 76}px;width:840px;height:2px;background:#000;"></div>`).join('')}
    ${TX(tot[0], { f: GROT, px: 52, w: 900, c: '#000', x: 120, y: 1230, wd: 560 })}${TX(tot[1], { f: GROT, px: 52, w: 900, c: '#000', al: 'right', x: 120, y: 1230, wd: 840 })}<div style="position:absolute;left:120px;top:1300px;width:840px;height:10px;background:#000;"></div>${TX(tot[2], { f: GROT, px: 30, c: '#000', x: 120, y: 1326, wd: 840, lh: 1.2 })}`, '#fff', false)
  C.m27 = [['01-facts', fl(s, [['Servings', '1'], ['Time', 'about an hour'], ['Direction', 'every frame'], ['Location', CITY]], ['Cost', '$0', 'Free photo shoot. Portraits by Aidan, a portrait photographer in Charlotte for a few weeks.'])], ['02-facts', fl(s2, [['Never done this before?', 'fine'], ['I direct', 'every frame'], ['Edited photos', 'yes'], ['Interested?', "Let's chat."]], ['Cost', '$0', 'Message me to book. Free photo shoot in Charlotte.'])]]
}

// M28 POSTCARD: greetings from Charlotte; the back has the message and a FREE stamp.
{
  const s = pick(WP), s2 = pick(MP)
  const desk = 'background:radial-gradient(circle at 40% 30%,#a8875f,#6b4e30 80%);'
  const stamp = (x, y) => `<div style="position:absolute;left:${x}px;top:${y}px;width:170px;height:210px;background:#fff;background-image:radial-gradient(circle,transparent 6px,#fff 7px);padding:16px;box-sizing:border-box;box-shadow:0 4px 10px rgba(0,0,0,.3);"><div style="width:100%;height:100%;background:#ffd23f;border:3px solid #c1272d;box-sizing:border-box;text-align:center;"><p style="margin:46px 0 0;font:800 48px ${GROT};color:#c1272d;">FREE</p><p style="margin:8px 0 0;font:700 18px ${MONO};color:#c1272d;">CHARLOTTE</p></div></div><svg style="position:absolute;left:${x - 70}px;top:${y + 30}px" width="260" height="170"><g fill="none" stroke="#222" stroke-width="3" opacity=".75"><circle cx="90" cy="85" r="64"/><circle cx="90" cy="85" r="50"/><path d="M150 60 q40 -10 80 0 M150 85 q40 -10 80 0 M150 110 q40 -10 80 0"/></g></svg>`
  C.m28 = [['01-front', frame(`<div style="position:absolute;inset:0;${desk}"></div><div style="position:absolute;left:90px;top:280px;width:900px;height:1150px;background:#fff;transform:rotate(-2deg);box-shadow:0 30px 60px rgba(0,0,0,.5);"></div>
    <div style="position:absolute;left:90px;top:280px;width:900px;height:1150px;transform:rotate(-2deg);">${PH(s, 28, 28, 844, 880, { fh: 0.5 })}${TX('Greetings from Charlotte', { f: HW, px: 88, w: 700, c: '#1c3a5e', al: 'center', x: 0, y: 926, wd: 900, lh: 1 })}${TX('free photo shoot', { f: HW, px: 60, w: 700, c: '#1c3a5e', al: 'center', x: 0, y: 1040, wd: 900 })}${stamp(690, 50)}</div>`, '#6b4e30', false)],
    ['02-back', frame(`<div style="position:absolute;inset:0;${desk}"></div><div style="position:absolute;left:90px;top:300px;width:900px;height:1110px;background:#f3ead7;transform:rotate(1.5deg);box-shadow:0 30px 60px rgba(0,0,0,.5);"></div>
    <div style="position:absolute;left:90px;top:300px;width:900px;height:1110px;transform:rotate(1.5deg);"><div style="position:absolute;left:450px;top:60px;width:3px;height:990px;background:#b9ad92;"></div>
    ${TX("i'm aidan,<br>a portrait photographer.<br>i'm in charlotte<br>for a few weeks.<br><br>about an hour.<br>i direct every frame.<br>Interested? Let's chat.", { f: HW, px: 56, w: 700, c: '#1c3a5e', x: 50, y: 70, wd: 390, lh: 1.15 })}${stamp(690, 50)}${[0, 1, 2].map(i => `<div style="position:absolute;left:490px;top:${430 + i * 90}px;width:360px;height:3px;background:#9b8f78;"></div>`).join('')}${TX('you', { f: HW, px: 64, c: '#1c3a5e', x: 500, y: 372, wd: 300 })}${TX('Charlotte, NC', { f: HW, px: 54, c: '#1c3a5e', x: 500, y: 640, wd: 360 })}${PH(s2, 480, 780, 360, 260, { fh: 0.5 })}</div>`, '#6b4e30', false)]]
}

// M29 VIDEO CALL: a 2×2 gallery, the fourth tile is yours.
{
  const a = pick(WP), b = pick(MP), c = pick(WP), d = pick(MP)
  const tile = (ph, x, y, name) => `${PH(ph, x, y, 510, 560, { fh: 0.55, r: 24 })}<div style="position:absolute;left:${x + 18}px;top:${y + 500}px;padding:6px 16px;background:rgba(0,0,0,.55);border-radius:10px;"><p style="margin:0;font:600 28px ${SF};color:#fff;">${name}</p></div>`
  const bar = ''
  C.m29 = [['01-gallery', frame(`<div style="position:absolute;inset:0;background:#1c1c1e;"></div>${tile(a, 20, 270, 'Charlotte')}${tile(b, 550, 270, 'free photo shoot')}${tile(c, 20, 850, 'about an hour')}
    <div style="position:absolute;left:550px;top:850px;width:510px;height:560px;border-radius:24px;background:#2c2c2e;border:4px dashed #0a84ff;box-sizing:border-box;"></div>${SX('You', { px: 90, w: 700, c: '#0a84ff', al: 'center', x: 550, y: 1010, wd: 510 })}${SX('free photo shoot', { px: 34, c: '#8e8e93', al: 'center', x: 550, y: 1120, wd: 510 })}`, '#1c1c1e', false)],
    ['02-speaker', frame(`<div style="position:absolute;inset:0;background:#1c1c1e;"></div>${PH(d, 20, 270, 1040, 900, { fh: 0.5, r: 30 })}<div style="position:absolute;left:44px;top:1090px;padding:8px 20px;background:rgba(0,0,0,.55);border-radius:12px;"><p style="margin:0;font:600 32px ${SF};color:#fff;">Aidan</p></div>
    ${SX("i direct every frame.", { px: 52, w: 700, c: '#fff', al: 'center', x: 0, y: 1200, wd: 1080 })}${SX("Interested? Let's chat.", { px: 64, w: 700, c: '#fff', al: 'center', x: 0, y: 1290, wd: 1080 })}`, '#1c1c1e', false)]]
}

// M30 HIGHWAY SIGN: a green exit sign over the portrait.
{
  const s = pick(WP, g => g.bot <= 1000), s2 = pick(MP, g => g.bot <= 1000)
  const sign = (l1, l2, arrow) => `<div style="position:absolute;left:50px;top:1020px;width:980px;height:400px;background:#0a6b3a;border:12px solid #fff;border-radius:34px;box-sizing:border-box;box-shadow:0 20px 50px rgba(0,0,0,.5);"></div><div style="position:absolute;left:70px;top:1040px;width:940px;height:360px;border:4px solid #fff;border-radius:22px;box-sizing:border-box;"></div>
    ${TX(l1, { f: COND, px: l1.length > 10 ? 128 : 148, w: 800, c: '#fff', x: 110, y: 1070, wd: 640, lh: 1, ls: 0.01 })}${TX(l2, { f: COND, px: 64, w: 700, c: '#fff', x: 112, y: 1230, wd: 760, lh: 1, ls: 0.02 })}${TX(arrow, { f: SF, px: 150, w: 800, c: '#fff', al: 'right', x: 640, y: 1120, wd: 330 })}${TX('EXIT 1 HR', { f: COND, px: 40, w: 700, c: '#ffd23f', x: 112, y: 1330, wd: 500, ls: 0.06 })}`
  const hw = (ph, l1, l2, arrow) => { const Pl = place(ph, 420, { fy: 0.3, allowAbove: false }); return frame(`${Pl.html}<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.25) 0%,transparent 30%,transparent 55%,rgba(0,0,0,.5) 100%);"></div>${sign(l1, l2, arrow)}`, '#000', false) }
  C.m30 = [['01-sign', hw(s, 'CHARLOTTE', 'FREE PHOTO SHOOT', '↗')], ['02-sign', hw(s2, "INTERESTED?", "LET'S CHAT.", '→')]]
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
      const FACE_MIN = 0
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
