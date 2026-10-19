import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

// CHARLOTTE v13 — ENGAGEMENT, NOT NOVELTY (Aidan, 22 Oct: "high engagement is not about kitsch concepts" / "build. also i have this").
// Plain, human, honest: the control, "hi, i'm aidan" with his real mirror selfie, phone-vs-camera, specificity-free copy from his decks.
// Needs-from-Aidan items (reactions, testimonials, local places, on-camera clip, numbers) are NOT faked here.
// CHARLOTTE v11 — IMPLEMENTS CPC-PLAN.md (21 Oct): policy-safe viewfinder (no shutter) + the plan's new stills (nothing, upside-down,
// neighbourhood heroes, just-say-hi, ice-breaker list, zero-design story, swipe-bait question->receipt).
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
// Usage: node render-v11.mjs --photos=<dir of <stem>.jpg> --vision=<dir> --out=<dir> [--only=s1,s2]
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
    ${grain(0.04)}`, '#000', false)
}
C.g01n = [['01-viewfinder', vf('R1-09799-0007', 'CHARLOTTE', 'FREE PHOTO SHOOT')], ['02-viewfinder', vf('R1-00009-0002', 'ABOUT AN HOUR', 'I DIRECT EVERY FRAME', { bigPx: 108 })], ['03-shutter', vf('R1-09953-021A', 'INTERESTED?', "LET'S CHAT", { pressed: true, bigPx: 132 })]]


const PH = (s, l, t, w, h, { fh = 0.5, fy = 0.42, fx = 0.5, r = 0, extra = '' } = {}) => box(l, t, w, h, fit(s, w, h, { fy, fx, faceH: h * fh, minFace: 0 }).html, `border-radius:${r}px;${extra}`)

// ---- v11 helpers ----
const WP11 = ['R1-09952-0012', 'R1-09797-0016', 'R1-00006-008A', 'R1-09952-0013', 'R1-09799-0034', 'R1-09952-0026', 'R1-09952-0019', 'R1-00009-0034', 'R1-09792-0026', 'R1-09953-021A', 'R1-09799-0007', 'R1-00008-0022', 'R1-09996-0026', 'R1-09793-0011', 'R1-09793-0028', 'R1-09952-0003', 'R1-00008-0005', 'R1-00007-025A', 'R1-00006-013A', 'R1-09798-032A', 'R1-09797-0005', 'R1-09797-0018', 'R1-09952-0007', 'R1-00006-015A', 'R1-00009-0028']
const MP11 = ['R1-09794-031A', 'R1-00009-0002', 'R1-09794-035A', 'img0013', 'img0027-3', 'R1-09997-0011', 'R1-09997-0006', 'R1-09997-0003', 'R1-09997-0009', 'R1-09995-0010', 'R1-09794-021A', 'R1-00009-0021', 'img0006', 'img0015-2']
const fits = (s, h, o) => { try { return place(s, h, o) } catch { return null } }
const first = (cands, fn) => { for (const c of cands) { const r = fn(c); if (r) return r } throw new Error('no candidate fits: ' + cands[0]) }
const rot = (list, k) => [...list.slice(k), ...list.slice(0, k)]
// a hook: face placed by the Vision box, big word under (or over) it, one small line
const hk = (cands, big, small, { sub = '', bigPx = 150, smallPx = 80, smallFont = null, lines = 1 } = {}) => first(cands, s => {
  const h = Math.round(bigPx * .88 + 12 + smallPx * .98 * lines + (sub ? 66 : 0) + 20), Pl = fits(s, h, { fy: 0.34 }); if (!Pl) return null
  const scrim = Pl.mode === 'below' ? SCRIM_LOW(Math.max(30, Math.round(Pl.top / 19.2) - 12)) : SCRIM_TOP
  const sm = smallFont ? `<p style="margin:12px 0 0;font-family:${smallFont};font-size:${smallPx}px;font-weight:700;color:#fff;line-height:.98;${SH}">${small}</p>` : ''
  const body = smallFont ? `<div style="position:absolute;top:${Pl.top}px;left:48px;right:48px;text-align:center;"><p style="font-family:${SE};font-size:${bigPx}px;font-weight:700;font-style:italic;color:#fff;margin:0;line-height:.88;${SH}">${big}</p>${sm}</div>` : block(Pl.top, big, small, sub, { bigPx, smallPx })
  return frame(`${Pl.html}${scrim}${body}${grain(0.05)}`, '#000', false) })
const ctaC = cands => first(cands, s => { const Pl = fits(s, 345, { fy: 0.3, minFace: 160 }); if (!Pl) return null
  return frame(`${Pl.html}${Pl.mode === 'below' ? SCRIM_LOW(Math.max(30, Math.round(Pl.top / 19.2) - 12)) : SCRIM_TOP}${hand(Pl.top, ...CHAT, L.short)}${grain(0.05)}`, '#000', true) })


const SELFR = 'aidan-real-selfie'
// selfie placed below the story bar: black above (the photo has its own bars anyway), face ~380px
const selfieBox = () => { const F = fit(SELFR, 1080, 1690, { fy: 0.2, faceH: 400 }); return { html: `<div style="position:absolute;inset:0;background:#000;"></div>${box(0, 230, 1080, 1690, F.html)}`, f: F.face && { top: F.face.top + 230, bottom: F.face.bottom + 230, h: F.face.h } } }
const lowScrim = (y) => `<div style="position:absolute;left:0;right:0;top:${y - 140}px;bottom:0;background:linear-gradient(180deg,transparent 0%,rgba(0,0,0,.72) 38%,rgba(0,0,0,.9) 100%);"></div>`
const selfieCard = (l1, l2, big) => { const S_ = selfieBox(), y = Math.round(Math.min(1440 - 330, S_.f.bottom + 70))
  return frame(`${S_.html}${lowScrim(y)}${TX(l1, { f: HW, px: big, w: 700, c: '#fff', al: 'center', x: 30, y, wd: 1020, lh: 1, extra: SH })}${TX(l2, { f: SE, px: 46, it: true, c: 'rgba(255,255,255,.95)', al: 'center', x: 70, y: y + big + 14, wd: 940, lh: 1.25, extra: SH })}`, '#000', false) }

// V1 HI, I'M AIDAN (real selfie): honest, human, the strongest trust lever; then the work, then the call.
C.v1 = [['01-hi', selfieCard('hi, i\'m aidan 👋', 'i\'m a photographer. i\'m in charlotte for a few weeks.', 150)],
  ['02-work', hk(rot(WP11, 4), CITY, 'Free Photo Shoot.', { sub: "i'll take photos like this of you" })],
  ['03-hour', hk(rot(MP11, 2), 'about an hour.', 'i direct every frame.', { bigPx: 120, smallPx: 66 })],
  ['04-cta', ctaC(rot(WP11, 12))]]

// V2 PHONE vs CAMERA: his own phone selfie, then what the camera does. Honest contrast, no props.
C.v2 = [['01-phone', selfieCard('this is my phone.', 'a quick mirror selfie.', 128)],
  ['02-camera', hk(rot(WP11, 6), 'this is my camera.', `${CITY} · free photo shoot`, { bigPx: 100, smallPx: 52, sub: '' })],
  ['03-cta', ctaC(rot(MP11, 5))]]

// V3 CONTROL, HONEST LINE: the winning composition, one plain line of his, nothing else.
C.v3 = [['01-hook', hk(rot(WP11, 1), CITY, 'Free Photo Shoot.', { sub: 'message me' })], ['02-cta', ctaC(rot(WP11, 13))]]
C.v3b = [['01-hook', hk(rot(MP11, 0), CITY, 'Free Photo Shoot.', { sub: 'message me' })], ['02-cta', ctaC(rot(MP11, 7))]]

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
