import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

// CHARLOTTE v4 — 10 carousel variations from public/images/new_top_tier_candidates (Aidan, 20 Oct: "use these now...
// generate 10 new carousel variations"). Photos are referenced by file stem. Copy = lines from his approved decks only
// (see memory feedback_ad_copy_his_words). Same face audit as v2/v3: text never on a face, all text above y=1440.
//
// Usage: node render-v4.mjs --photos=<dir of <stem>.jpg> --vision=<dir> --out=<dir> [--only=k01,k02]
// Photos: ~/charlotte-video-ads/work/src2 (1440px copies of new_top_tier_candidates; already upright).

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



// ---- photo pools (file stems in new_top_tier_candidates). Left out on purpose: 000008-7, 000014, 000031-3, 000036-2
// (nude/underwear — not for ads); Cyrillic shop signs (R1-00005-0001/-0013/-0027/-0028, R1-09009-0004) only as small tiles.
const S2 = s => load(path.join(PHOTOS, `${s}.jpg`))
const WOMEN = ['000013', '000040-3', '000042', '000086', '11954-12', '11954-34', 'R1-00005-0014', 'R1-00005-0017', 'R1-00005-0025',
  'R1-00005-0031', 'R1-00005-0032', 'R1-00006-001A', 'R1-00006-008A', 'R1-00006-013A', 'R1-00006-015A', 'R1-00006-017A', 'R1-00006-031A',
  'R1-00007-005A', 'R1-00007-007A', 'R1-00007-008A', 'R1-00007-025A', 'R1-00008-0005', 'R1-00008-0022', 'R1-00009-0028', 'R1-00009-0033',
  'R1-00009-0034', 'R1-09792-0026', 'R1-09793-0011', 'R1-09793-0013', 'R1-09793-0019', 'R1-09793-0028', 'R1-09794-001A', 'R1-09794-004A',
  'R1-09797-0005', 'R1-09797-0009', 'R1-09797-0011', 'R1-09797-0016', 'R1-09797-0018', 'R1-09797-0021', 'R1-09797-0026', 'R1-09797-0027',
  'R1-09798-030A', 'R1-09798-032A', 'R1-09798-035A', 'R1-09799-0007', 'R1-09799-0025', 'R1-09799-0034', 'R1-09799-0037', 'R1-09952-0003',
  'R1-09952-0007', 'R1-09952-0012', 'R1-09952-0013', 'R1-09952-0019', 'R1-09952-0021', 'R1-09952-0026', 'R1-09953-010A', 'R1-09953-011A',
  'R1-09953-013A', 'R1-09953-021A', 'R1-09996-0002', 'R1-09996-0026', 'R1-09996-0028', 'R1-09996-0029']
const MEN = ['R1-00009-0002', 'R1-00009-0021', 'R1-09794-021A', 'R1-09794-022A', 'R1-09794-031A', 'R1-09794-034A', 'R1-09794-035A',
  'R1-09794-036A', 'R1-09795-0012', 'R1-09995-0010', 'R1-09995-0016', 'R1-09995-0019', 'R1-09997-0000', 'R1-09997-0003', 'R1-09997-0005',
  'R1-09997-0006', 'R1-09997-0009', 'R1-09997-0011', 'R1-09997-0012', 'img0006', 'img0007', 'img0013', 'img0015-2', 'img0020-3',
  'img0022-5-2', 'img0027-3', 'img0030-3']
const P = s => { if (!WOMEN.includes(s) && !MEN.includes(s)) throw new Error(`not in the pool: ${s}`); return S2(s) }
// deterministic picks: take n from a pool starting at offset k, so every carousel uses different photos
const take = (pool, k, n) => Array.from({ length: n }, (_, i) => pool[(k + i * 3) % pool.length])
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

// K01 WINNER DECK, nine prints a card (liked): hook · work · about · nerves · now · how · CTA
{
  const nine = (stems, y0) => { const sp = [[30, y0, 300, -5], [380, y0 - 20, 310, 3], [730, y0, 300, -3], [40, y0 + 440, 300, 4], [390, y0 + 420, 300, -1], [740, y0 + 430, 300, -4], [50, y0 + 880, 300, -2], [390, y0 + 860, 300, 2], [740, y0 + 870, 290, 5]]
    return stems.map((s, i) => pr(P(s), ...sp[i])).join('') }
  C.k01 = [
    ['01-hook', bleed(P('R1-09797-0016'), hookOn(P('R1-09797-0016'), 'center 30%', 'Free Photo Shoot.', L.want), { pos: 'center 30%', badge: false })],
    ['02-work', dark(`<div style="position:absolute;top:250px;left:60px;right:60px;text-align:center;">${TITLE(L.work)}</div>${nine(mix(take(WOMEN, 0, 5), take(MEN, 0, 4)), 420)}`)],
    ['03-about', ABOUT],
    ['04-nervous', dark(`<div style="position:absolute;top:250px;left:64px;right:64px;text-align:center;">${TITLE(L.nerv, 60)}${SUB(L.nervSub)}</div>${nine(mix(take(WOMEN, 1, 5), take(MEN, 1, 4)), 470)}`)],
    ['05-now', dark(`<div style="position:absolute;top:250px;left:60px;right:60px;text-align:center;">${TITLE(L.now)}${SUB(L.nowSub, 38, 24)}</div>${pr(P('R1-09953-013A'), 60, 560, 460, -3)}${pr(P('img0007'), 560, 600, 460, 3)}`)],
    ['06-how', HOW], ['07-cta', ctaP('R1-09799-0034')]]
}

// K02 STAGGERED PAIRS, six cards (liked p10d): a woman and a man per card, one high, one low, zig-zagging.
{
  const pairs = [['R1-09952-0013', 'img0006', CITY, 'free photo shoot.', 120, 66, SE], ['R1-09797-0018', 'R1-09997-0009', L.me, L.meSub, 54, 36, SE],
    ['R1-00006-013A', 'R1-09794-031A', L.work, '', 76, 0, SE], ['R1-09799-0007', 'img0013', L.hour, L.hourSub, 76, 44, SE],
    ['R1-09953-021A', 'R1-00009-0021', L.now, L.nowSub, 76, 44, SE], ['R1-09952-0003', 'img0022-5-2', 'Interested?', "Let's chat.", 104, 104, HW]]
  C.k02 = pairs.map(([a, b, l1, l2, s1, s2, font], i) => { const hi = i % 2 === 0, A = hi ? a : b, B = hi ? b : a, y0 = font === HW || i === 0 ? 540 : 490
    return [`${String(i + 1).padStart(2, '0')}-pair`, dark(`${top2(l1, l2, s1, s2, font, i === 0 ? 300 : 280)}${pr(P(A), hi ? 40 : 500, y0, 520, hi ? -4 : 3)}${pr(P(B), hi ? 500 : 40, y0 + 470, 520, hi ? 3 : -4)}`, false)] })
}

// K03 HI, I'M AIDAN (liked): the hello, twelve women, twelve men, CTA.
{
  const hello = S('aidan-udaipur-mirror-01.jpg')
  const g = (stems, l1, l2) => frame(`${grid(stems.slice(0, 6), 0, 0, 3, 360, 420)}${band(840, 300, `<p style="font-family:${SE};font-size:66px;font-weight:700;font-style:italic;color:#fff;margin:0;">${l1}</p>${l2 ? `<p style="font-family:${SE};font-size:36px;font-style:italic;color:rgba(255,255,255,.88);margin:14px 0 0;">${l2}</p>` : ''}`)}${grid(stems.slice(6), 0, 1140, 3, 360, 390)}`, '#000', false)
  C.k03 = [
    ['01-hi', bleed(hello, `<div style="position:absolute;top:${clearTop(hello, 'center 30%', 270)}px;left:70px;right:70px;text-align:center;">
      <p style="font-family:${HW};font-size:120px;font-weight:700;color:#fff;margin:0;line-height:1;${SH}">hi, i'm aidan 👋</p>
      <p style="font-family:${SE};font-size:44px;font-style:italic;color:#fff;margin:26px 0 0;line-height:1.3;${SH}">${L.meSub}</p></div>`, { pos: 'center 30%', scrim: LOW, badge: false })],
    ['02-women', g(take(WOMEN, 2, 12), L.work, '')], ['03-men', g(take(MEN, 2, 12), L.hour, L.hourSub)], ['04-cta', ctaP('R1-09797-0027')]]
}

// K04 NOTES + GALLERIES (liked): the note with nine, then a second page of nine, then CTA.
{
  const note = g9 => frame(`<div style="position:absolute;inset:0;background:#fbfaf6;"></div>
    <div style="position:absolute;top:270px;left:70px;right:70px;font-family:${SANS};color:#1c1c1e;">
      <p style="font-size:30px;color:#e0a100;margin:0 0 26px;font-weight:600;">‹ Notes</p>
      <p style="font-size:58px;font-weight:700;margin:0 0 22px;line-height:1.1;">free photo shoots in charlotte📍</p>
      <p style="font-size:38px;margin:0 0 12px;line-height:1.35;">${L.me} ${L.meSub} ${L.hour} ${L.hourSub}</p>
      <p style="font-size:38px;margin:14px 0 0;line-height:1.35;">${L.work} ↓</p></div>
    ${grid(g9, 60, 1000, 3, 310, 300, 15)}`, '#fbfaf6', false)
  const page2 = g9 => frame(`<div style="position:absolute;inset:0;background:#fbfaf6;"></div>
    <div style="position:absolute;top:270px;left:70px;right:70px;font-family:${SANS};color:#1c1c1e;"><p style="font-size:30px;color:#e0a100;margin:0 0 26px;font-weight:600;">‹ Notes</p>
      <p style="font-size:44px;margin:0;line-height:1.3;">more ↓  tap the button and say hi 👋</p></div>${grid(g9, 60, 480, 3, 310, 440, 15)}`, '#fbfaf6', false)
  C.k04 = [['01-note', note(mix(take(WOMEN, 5, 5), take(MEN, 5, 4)))], ['02-more', page2(mix(take(WOMEN, 9, 5), take(MEN, 9, 4)))], ['03-cta', ctaP('R1-09797-0005')]]
}

// K05 STAGGERED TRIOS: three prints cascading down each card, five cards (fifteen photos).
{
  const lines = [[CITY, 'free photo shoot.', 120, 66], [L.work, '', 76, 0], [L.nerv, L.nervSub, 60, 34], [L.hour, L.hourSub, 76, 44], ['Interested?', "Let's chat.", 104, 104]]
  C.k05 = lines.map(([l1, l2, s1, s2], i) => { const st = mix(take(WOMEN, 13 + i * 4, 2), take(MEN, 13 + i * 3, 1)), flip = i % 2
    const font = i === 4 ? HW : SE
    return [`${String(i + 1).padStart(2, '0')}-trio`, dark(`${top2(l1, l2, s1, s2, font, i === 0 ? 300 : 280)}
      ${pr(P(st[0]), flip ? 600 : 40, 520, 420, flip ? 4 : -5)}${pr(P(st[1]), 330, 820, 420, flip ? -3 : 3)}${pr(P(st[2]), flip ? 40 : 600, 1140, 420, flip ? -4 : 4)}`, false)] })
}

// K06 PORTRAIT CAROUSEL: hook, eight full-frame portraits with no words (the photos do the talking), CTA.
{
  const eight = mix(take(WOMEN, 20, 4), take(MEN, 20, 4))
  C.k06 = [['01-hook', bleed(P('R1-09952-0026'), hookOn(P('R1-09952-0026'), 'center 30%', 'Free Photo Shoot.', L.want), { pos: 'center 30%', badge: false })],
    ...eight.map((s, i) => [`${String(i + 2).padStart(2, '0')}-photo`, bleed(P(s), '', { pos: 'center 28%', scrim: 'linear-gradient(180deg,rgba(0,0,0,.35) 0%,transparent 22%)' })]),
    ['10-cta', ctaP('R1-09953-010A')]]
}

// K07 GRID 20 → HERO → CTA: twenty faces on the hook, then one big portrait, then the CTA.
{
  const s = mix(take(WOMEN, 24, 10), take(MEN, 24, 10))
  C.k07 = [['01-grid', frame(`${grid(s.slice(0, 10), 0, 0, 5, 216, 425)}${grid(s.slice(10), 0, 1170, 5, 216, 375)}${band(850, 320, cityBig(128, 'Free Photo Shoot.', 66))}`, '#000', false)],
    ['02-hero', bleed(P('R1-09797-0026'), cap(clearTop(P('R1-09797-0026'), 'center 30%', 170), L.hour, L.hourSub), { pos: 'center 30%', scrim: LOW })], ['03-cta', ctaP('R1-09952-0012')]]
}

// K08 THE TABLE OF TWELVE: twelve prints over two cards, then CTA.
{
  const sp = [[30, 460, 310, -6], [380, 430, 320, 3], [730, 460, 310, -2], [50, 900, 320, 4], [400, 860, 300, -3], [740, 900, 300, 5]]
  const t1 = mix(take(WOMEN, 30, 3), take(MEN, 30, 3)), t2 = mix(take(WOMEN, 34, 3), take(MEN, 34, 3))
  const spB = sp.map(([x, y, w, r]) => [x, y + 380, w, -r])
  C.k08 = [['01-table', dark(`<div style="position:absolute;top:250px;left:60px;right:60px;text-align:center;">${cityBig(110, 'Free Photo Shoot.', 60)}</div>${t1.map((s, i) => pr(P(s), ...spB[i])).join('')}`, false)],
    ['02-table', dark(`<div style="position:absolute;top:250px;left:60px;right:60px;text-align:center;">${TITLE(L.work)}</div>${t2.map((s, i) => pr(P(s), ...sp[i])).join('')}${pr(P(take(WOMEN, 40, 1)[0]), 380, 1290, 320, 2)}`)],
    ['03-cta', ctaP('R1-09798-032A')]]
}

// K09 BIG + INSET: each card a full-frame portrait with a second print laid over the lower corner (two people a card).
{
  const cards = [['R1-09799-0037', 'img0020-3'], ['R1-09952-0007', 'R1-09995-0016'], ['R1-00006-031A', 'R1-09997-0006'], ['R1-09798-035A', 'img0030-3']]
  const words = [[CITY, 'free photo shoot.'], [L.me, L.meSub], [L.work, ''], [L.hour, L.hourSub]]
  C.k09 = [...cards.map(([a, b], i) => { const top = clearTop(P(a), 'center 25%', 170, { below: false })
    const words_ = i === 0 ? hookOn(P(a), 'center 25%', 'Free Photo Shoot.') : cap(top, words[i][0], words[i][1])   // card 1: city big
    return [`${String(i + 1).padStart(2, '0')}-inset`, bleed(P(a), `${words_}${i === 0 ? pr(P(b), 620, 1470, 300, 4) : pr(P(b), i % 2 ? 60 : 620, 1180, 340, i % 2 ? -4 : 4)}`, { pos: 'center 25%', scrim: TOPBOT })] }),
    ['05-cta', ctaP('R1-09952-0021')]]
}

// K10 PHOTO-BOOTH STRIPS: two cards of three strips (twenty-four photos), then CTA.
{
  const strips = (stems, y) => [0, 1, 2].map(i => `<div style="position:absolute;left:${[70, 390, 710][i]}px;top:${y + (i % 2) * 40}px;width:300px;padding:14px 14px 40px;background:#fafafa;transform:rotate(${[-3, 1.5, -1.5][i]}deg);${shadow}">
    ${stems.slice(i * 4, i * 4 + 4).map(s => `<div style="position:relative;width:272px;height:290px;margin:0 0 10px;">${tile(P(s), 0, 0, 272, 290, 'center 30%')}</div>`).join('')}</div>`).join('')
  C.k10 = [['01-strips', dark(`<div style="position:absolute;top:270px;left:60px;right:60px;text-align:center;">${cityBig(124, 'Free Photo Shoot.', 66)}</div>${strips(mix(take(WOMEN, 44, 6), take(MEN, 44, 6)), 600)}`, false)],
    ['02-strips', dark(`<div style="position:absolute;top:270px;left:60px;right:60px;text-align:center;">${TITLE(L.work)}</div>${strips(mix(take(WOMEN, 50, 6), take(MEN, 50, 6)), 470)}`)],
    ['03-cta', ctaP('R1-09953-011A')]]
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
