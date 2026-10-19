import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

// CHARLOTTE v5 — 10 NEW CONCEPTS (Aidan, 20 Oct: "when i said 10 new i meant 10 new concepts"): none of these reuse an
// earlier layout (winner deck, pairs, notes, hi-aidan, grids, table, strips, inset, trios). All 106 photos from
// public/images/new_top_tier_candidates are used across them. Photos are referenced by file stem. Copy = lines from his approved decks only
// (see memory feedback_ad_copy_his_words). Same face audit as v2/v3: text never on a face, all text above y=1440.
//
// Usage: node render-v5.mjs --photos=<dir of <stem>.jpg> --vision=<dir> --out=<dir> [--only=x01,x02]
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


const PAL = JSON.parse(fs.readFileSync(path.join(__dirname, 'palette-v5.json'), 'utf8'))   // per-photo colour family
const FACE = s => { const ph = S2(s); return ph.faces[0] }                                   // [x,y,w,h] in ph pixels
const ALL = [...WOMEN, ...MEN]
// CTA cards: an unused portrait whose face sits high enough that the two handwritten lines fit underneath it
const ctaSafe = () => { const fits = s => { const f = FACE(s), im = S2(s); return f && (f[1] + f[3]) / im.h < 0.5 }
  const s = WOMEN.find(x => !USED.has(x) && fits(x)) || WOMEN.find(fits); return ctaP(s) }
const PAPER = '#f3efe8', INK = '#141210'
const serif = (txt, size, { italic = true, weight = 700, color = '#fff', mt = 0, lh = 1.0 } = {}) => `<p style="font-family:${SE};font-size:${size}px;font-weight:${weight};font-style:${italic ? 'italic' : 'normal'};color:${color};margin:${mt}px 0 0;line-height:${lh};">${txt}</p>`
const center = (top, inner, lr = 56) => `<div style="position:absolute;top:${top}px;left:${lr}px;right:${lr}px;text-align:center;">${inner}</div>`
const card = (inner, bg) => frame(inner + grain(0.05), bg, false)
// a photo drawn at an arbitrary rect with object-fit cover, keeping face markers (clip = optional CSS clip-path)
const ph = (s, l, t, w, h, { pos = 'center 28%', clip = '', rot = 0, extra = '' } = {}) => `<div style="position:absolute;left:${l}px;top:${t}px;width:${w}px;height:${h}px;${clip ? `clip-path:${clip};` : ''}${rot ? `transform:rotate(${rot}deg);` : ''}${extra}">${tile(P(s), 0, 0, w, h, pos)}</div>`

// X01 THE NAME IS THE PHOTO: C-H-A-R-L-O-T-T-E set huge, each letter filled with a different portrait.
{
  const letters = 'CHARLOTTE'.split(''), who = mix(take(WOMEN, 0, 5), take(MEN, 0, 4))
  const rows = [[0, 3], [3, 6], [6, 9]]
  const L1 = rows.map(([a, b], r) => `<div style="position:absolute;left:0;right:0;top:${270 + r * 340}px;display:flex;justify-content:center;gap:6px;">${letters.slice(a, b).map((ch, i) => {
    const s = who[a + i], im = P(s)
    return `<span style="display:inline-block;font-family:${SE};font-weight:700;font-size:430px;line-height:340px;background-image:url(${im.src});background-size:cover;background-position:center 28%;-webkit-background-clip:text;background-clip:text;color:transparent;">${ch}</span>`
  }).join('')}</div>`).join('')
  C.x01 = [['01-name', card(`${L1}${center(1300, serif('Free Photo Shoot.', 70))}`, '#0a0a0a')],
    ['02-who', card(`${center(270, serif('my recent work', 64))}${who.map((s, i) => ph(s, 40 + (i % 3) * 340, 420 + Math.floor(i / 3) * 480, 320, 460)).join('')}`, '#0a0a0a')],
    ['03-cta', ctaSafe()]]
}

// X02 ONE SHOOT, MANY FRAMES: each card is one person, four frames from the same session — what one hour gives you.
{
  const sessions = [['R1-09952-0003', 'R1-09952-0007', 'R1-09952-0012', 'R1-09952-0019'], ['img0006', 'img0013', 'img0020-3', 'img0030-3'],
    ['R1-00009-0021', 'R1-00009-0028', 'R1-00009-0033', 'R1-00009-0034'], ['R1-09997-0003', 'R1-09997-0006', 'R1-09997-0009', 'R1-09997-0012'],
    ['R1-00005-0025', 'R1-00005-0027', 'R1-00005-0031', 'R1-00005-0032']]
  const words = [[CITY, 'free photo shoot.'], [L.hour, L.hourSub], [L.work, ''], [L.nerv, L.nervSub], ['Interested?', "Let's chat."]]
  C.x02 = sessions.map((ss, i) => [`${String(i + 1).padStart(2, '0')}-session`, card(`${center(260, (i === 4 ? `<p style="font-family:${HW};font-size:96px;font-weight:700;color:#fff;margin:0;line-height:.95;">Interested?<br>Let's chat.</p>` : serif(words[i][0], i === 0 ? 110 : 62) + (words[i][1] ? serif(words[i][1], i === 0 ? 60 : 34, { italic: true, weight: 400, mt: 10 }) : '')))}
    ${ss.map((s, j) => ph(s, j % 2 ? 548 : 32, 520 + Math.floor(j / 2) * 700, 500, 680)).join('')}`, '#0a0a0a')])
}

// X04 ZOOM OUT: card 1 is only her eyes, card 2 her face, card 3 the whole portrait, card 4 everyone else.
{
  const s = 'R1-09797-0016', a = P(s), f = FACE(s)
  const zoom = (fw, top, h) => { const k = fw / f[2], cx = f[0] + f[2] / 2, cy = f[1] + f[3] * 0.42
    return `<div style="position:absolute;left:0;top:${top}px;width:1080px;height:${h}px;overflow:hidden;"><div style="position:absolute;left:${540 - cx * k}px;top:${h / 2 - cy * k}px;width:${a.w * k}px;height:${a.h * k}px;"><img src="${a.src}" style="width:100%;height:100%;display:block"/>${a.faces.map(b => `<div class="fbox" style="position:absolute;left:${b[0] * k}px;top:${b[1] * k}px;width:${b[2] * k}px;height:${b[3] * k}px"></div>`).join('')}</div></div>` }
  const rest = mix(take(WOMEN, 0, 6), take(MEN, 0, 6))
  C.x04 = [['01-eyes', card(`${center(280, serif(CITY, 120) + serif('free photo shoot.', 62, { weight: 400, mt: 8 }))}${zoom(2600, 600, 1320)}`, '#0a0a0a')],
    ['02-face', card(`${center(300, serif(L.want.replace(' →', ''), 60))}${zoom(1000, 520, 1400)}`, '#0a0a0a')],
    ['03-whole', bleed(a, cap(clearTop(a, 'center 30%', 170), L.hour, L.hourSub), { pos: 'center 30%', scrim: LOW })],
    ['04-everyone', card(`${center(270, serif(L.work, 64))}${rest.map((x, i) => ph(x, (i % 3) * 360, 420 + Math.floor(i / 3) * 375, 356, 371)).join('')}`, '#0a0a0a')],
    ['05-cta', ctaSafe()]]
}

// X05 COVERS: each card is a magazine cover — CHARLOTTE masthead above the head, cover lines in the clear space.
{
  const ok = ALL.filter(s => { const f = FACE(s), im = S2(s); return f && f[1] / im.h > 0.27 && (f[1] + f[3]) / im.h < 0.62 && !USED.has(s) })
  const covers = ok.slice(0, 5)
  const lines = [['Free Photo Shoot.', 'women & men'], [L.hour, L.hourSub], [L.nerv, L.nervSub], [L.now, L.nowSub], ['Interested?', "Let's chat."]]
  C.x05 = covers.map((s, i) => { const a = P(s), top = clearTop(a, 'center 30%', 150)
    return [`${String(i + 1).padStart(2, '0')}-cover`, bleed(a, `<div style="position:absolute;top:262px;left:30px;right:30px;text-align:center;"><p style="font-family:${SE};font-size:148px;font-weight:700;letter-spacing:.02em;color:#fff;margin:0;line-height:1;${SH}">CHARLOTTE</p></div>
      <div style="position:absolute;top:${top}px;left:70px;right:70px;text-align:${i % 2 ? 'right' : 'left'};"><p style="font-family:${i === 4 ? HW : SE};font-size:${i === 4 ? 96 : 60}px;font-weight:700;font-style:${i === 4 ? 'normal' : 'italic'};color:#fff;margin:0;line-height:1;${SH}">${lines[i][0]}</p><p style="font-family:${i === 4 ? HW : SE};font-size:${i === 4 ? 96 : 36}px;font-weight:${i === 4 ? 700 : 400};font-style:${i === 4 ? 'normal' : 'italic'};color:#fff;margin:${i === 4 ? 0 : 10}px 0 0;${SH}">${lines[i][1]}</p></div>`, { pos: 'center 30%', scrim: 'linear-gradient(180deg,rgba(0,0,0,.5) 0%,transparent 26%,transparent 58%,rgba(0,0,0,.75) 100%)', badge: false })] })
}

// X06 THE EXHIBITION: framed prints of different sizes hung on a gallery wall, with a wall label.
{
  const frameP = (s, l, t, w, h) => `<div style="position:absolute;left:${l}px;top:${t}px;width:${w}px;height:${h}px;background:#fff;border:10px solid ${INK};box-shadow:0 18px 30px rgba(0,0,0,.25);padding:${Math.round(w * 0.09)}px;">${ph(s, Math.round(w * 0.09), Math.round(w * 0.09), w - 20 - Math.round(w * 0.18), h - 20 - Math.round(w * 0.18))}</div>`
  const hang1 = [[60, 470, 440, 600], [560, 470, 460, 330], [560, 840, 220, 300], [800, 840, 220, 300], [60, 1110, 300, 400], [400, 1180, 620, 440]]
  const hang2 = [[60, 470, 300, 400], [400, 470, 300, 400], [740, 470, 280, 400], [60, 920, 470, 620], [570, 920, 450, 300], [570, 1260, 450, 300]]
  const w1 = mix(take(WOMEN, 0, 3), take(MEN, 0, 3)), w2 = mix(take(WOMEN, 0, 3), take(MEN, 0, 3))
  const label = (t1, t2) => `<div style="position:absolute;left:60px;top:300px;padding:18px 26px;background:#fff;box-shadow:0 4px 10px rgba(0,0,0,.12);"><p style="font-family:${SANS};font-size:30px;font-weight:700;color:${INK};margin:0;">${t1}</p><p style="font-family:${SANS};font-size:24px;color:#555;margin:6px 0 0;">${t2}</p></div>`
  C.x06 = [['01-wall', card(`${label(`${CITY} — free photo shoot`, 'aidan · portraits')}${hang1.map((r, i) => frameP(w1[i], ...r)).join('')}`, '#e9e5de')],
    ['02-wall', card(`${label(L.work, `${L.hour} ${L.hourSub}`)}${hang2.map((r, i) => frameP(w2[i], ...r)).join('')}`, '#e9e5de')],
    ['03-cta', ctaSafe()]]
}

// X07 COLOUR CHAPTERS: the portfolio sorted by light — golden, blue, black & white — one chapter per card.
{
  const fam = c => ALL.filter(s => (PAL[s]?.c === c || (c === 'warm' && PAL[s]?.c === 'pink')) && !USED.has(s))
  const chap = (c, n) => { let got = fam(c).slice(0, n); if (got.length < n) got = [...got, ...ALL.filter(s => PAL[s]?.c === c && !got.includes(s))].slice(0, n); got.forEach(s => USED.add(s)); return got }
  const g = (stems, title, sub) => card(`${center(270, serif(title, 66) + (sub ? serif(sub, 36, { weight: 400, mt: 10 }) : ''))}${stems.map((s, i) => ph(s, 30 + (i % 3) * 345, 470 + Math.floor(i / 3) * 480, 330, 460)).join('')}`, '#0a0a0a')
  C.x07 = [['01-golden', g(chap('warm', 6), CITY, 'free photo shoot.')], ['02-blue', g(chap('blue', 6), L.work, '')], ['03-bw', g(chap('bw', 6), L.hour, L.hourSub)], ['04-cta', ctaSafe()]]
}

// X08 THE FAN: prints fanned out like a hand of cards, pivoting from the bottom of the frame.
{
  const fan = stems => stems.map((s, i) => { const n = stems.length, ang = -30 + (60 / (n - 1)) * i, a = P(s), w = 380, h = Math.round(w * a.h / a.w)
    return `<div style="position:absolute;left:${540 - w / 2 - 12}px;top:640px;transform-origin:50% ${h + 760}px;transform:rotate(${ang}deg);">${pr(a, 0, 0, w, 0)}</div>` }).join('')
  C.x08 = [['01-fan', card(`${center(270, serif(CITY, 120) + serif('free photo shoot.', 62, { weight: 400, mt: 8 }))}${fan(mix(take(WOMEN, 0, 4), take(MEN, 0, 3)))}`, '#0a0a0a')],
    ['02-fan', card(`${center(270, serif(L.work, 66))}${fan(mix(take(WOMEN, 0, 4), take(MEN, 0, 3)))}`, '#0a0a0a')],
    ['03-cta', ctaSafe()]]
}

// X09 THE MAGAZINE PAGE: each card laid out like an editorial page — headline, one big picture, two smaller ones, folio.
{
  const page = (stems, t1, t2, n) => card(`<div style="position:absolute;left:60px;right:60px;top:270px;border-top:3px solid ${INK};padding-top:16px;">${serif(t1, 74, { color: INK })}${t2 ? serif(t2, 36, { color: '#333', weight: 400, mt: 8 }) : ''}</div>
    ${ph(stems[0], 60, 500, 960, 780, { pos: 'center 30%' })}${ph(stems[1], 60, 1310, 470, 560)}${ph(stems[2], 550, 1310, 470, 560)}
    <p style="position:absolute;left:60px;top:1290px;margin:0;font-family:${SANS};font-size:0px;">.</p>
    <div style="position:absolute;right:60px;top:430px;font-family:${SANS};font-size:22px;letter-spacing:.2em;color:#666;">${CITY.toUpperCase()} · ${n}</div>`, PAPER)
  const p = [mix(take(WOMEN, 0, 2), take(MEN, 0, 1)), mix(take(MEN, 0, 2), take(WOMEN, 0, 1)), mix(take(WOMEN, 0, 2), take(MEN, 0, 1)), mix(take(MEN, 0, 2), take(WOMEN, 0, 1))]
  C.x09 = [['01-page', page(p[0], CITY, 'free photo shoot.', '01')], ['02-page', page(p[1], L.work, '', '02')], ['03-page', page(p[2], L.hour, L.hourSub, '03')], ['04-page', page(p[3], L.nerv, L.nervSub, '04')], ['05-cta', ctaSafe()]]
}

// X10 TORN COLLAGE: portraits torn out and layered like a zine, the headline on a torn paper strip.
{
  const jag = (seed) => { let r = seed; const rnd = () => (r = (r * 9301 + 49297) % 233280) / 233280; const pts = []
    for (let i = 0; i <= 10; i++) pts.push(`${i * 10}% ${rnd() * 3}%`); for (let i = 0; i <= 10; i++) pts.push(`${100 - rnd() * 3}% ${i * 10}%`)
    for (let i = 10; i >= 0; i--) pts.push(`${i * 10}% ${100 - rnd() * 3}%`); for (let i = 10; i >= 0; i--) pts.push(`${rnd() * 3}% ${i * 10}%`); return `polygon(${pts.join(',')})` }
  const lay = [[20, 480, 560, 720, -5], [470, 430, 580, 760, 4], [60, 1120, 480, 640, 3], [500, 1150, 540, 700, -4], [300, 800, 480, 620, -1]]
  const strip_ = (t1, t2, font = SE) => `<div style="position:absolute;left:70px;right:70px;top:280px;padding:22px 30px;background:${PAPER};clip-path:${jag(7)};transform:rotate(-2deg);text-align:center;">${font === HW ? `<p style="font-family:${HW};font-size:92px;font-weight:700;color:${INK};margin:0;line-height:.95;">${t1}<br>${t2}</p>` : serif(t1, 84, { color: INK }) + (t2 ? serif(t2, 40, { color: '#333', weight: 400, mt: 6 }) : '')}</div>`
  const col = stems => stems.map((s, i) => ph(s, ...lay[i].slice(0, 4), { clip: jag(i * 13 + 3), rot: lay[i][4], extra: 'filter:drop-shadow(0 10px 18px rgba(0,0,0,.5));' })).join('')
  const z1 = mix(take(WOMEN, 0, 3), take(MEN, 0, 2)), z2 = mix(take(MEN, 0, 3), take(WOMEN, 0, 2)), z3 = mix(take(WOMEN, 0, 3), take(MEN, 0, 2))
  C.x10 = [['01-zine', card(`${col(z1)}${strip_(CITY, 'free photo shoot.')}`, '#1a1816')], ['02-zine', card(`${col(z2)}${strip_(L.work, '')}`, '#1a1816')],
    ['03-zine', card(`${col(z3)}${strip_('Interested?', "Let's chat.", HW)}`, '#1a1816')]]
}

// X03 PANORAMA: one long table of prints laid across five cards — prints cross the card edges, so the swipe feels continuous.
{
  const N = 5, Wt = 1080 * N, spots = []
  // built after every other concept: the table also carries every photo nothing else used (all 106 appear somewhere)
  const left = [...ALL, ...LAND].filter(s => !USED.has(s))
  const pics = [...mix(take(WOMEN, 0, 8), take(MEN, 0, 5)), ...left]
  const step = (Wt - 420) / (pics.length - 1)
  pics.forEach((_, i) => spots.push([Math.round(i * step), [520, 980, 700][i % 3], 380, ((i * 7) % 11) - 5]))
  const table = pics.map((s, i) => pr(P(s), ...spots[i])).join('')
  const heads = [[CITY, 'free photo shoot.'], [L.work, ''], [L.hour, L.hourSub], [L.now, L.nowSub], ['', '']]
  C.x03 = Array.from({ length: N }, (_, c) => [`${String(c + 1).padStart(2, '0')}-pano`, card(`<div style="position:absolute;left:${-c * 1080}px;top:0;width:${Wt}px;height:1920px;">${table}</div>
    ${c === N - 1 ? center(270, `<p style="font-family:${HW};font-size:104px;font-weight:700;color:#fff;margin:0;line-height:.95;">Interested?<br>Let's chat.</p>`) : center(270, serif(heads[c][0], c === 0 ? 110 : 64) + (heads[c][1] ? serif(heads[c][1], c === 0 ? 60 : 36, { weight: 400, mt: 10 }) : ''))}`, '#0a0a0a')])
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
  if (!ONLY) { const all = [...WOMEN, ...MEN, ...LAND], miss = all.filter(x => !USED.has(x)); console.log(`photos used: ${all.length - miss.length}/${all.length}${miss.length ? ' — unused: ' + miss.join(' ') : ''}`) }
  if (faceFails.length) { console.error(`${faceFails.length} slide(s) put text over a face`); process.exitCode = 1 }
}
render()
