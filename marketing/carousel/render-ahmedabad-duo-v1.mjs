import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

// === AHMEDABAD DUO v1 — "bring a friend" safety-forward angle ===
// The unspoken blocker for women considering a stranger's free shoot is safety.
// This deck answers it through imagery, never defensively: a genuine pair of
// friends shot together (B&W 35mm duo series), daytime busy public settings,
// and a plain how-it-works card. Copy = helpful specifics, low pressure.
//   01  hook   — genuine duo frame (two friends holding hands) +
//               "bring a friend. you both get shot." + Ahmedabad kicker
//   02  proof  — daytime street-food stall, vendors all around (public/day)
//   03  proof  — street market, seated among the stalls (public/day)
//   04  proof  — the duo again, close two-shot (both of you get photos)
//   05  how    — how it works: daytime · public spots · ~an hour · free TFP ·
//               you keep the scans
//   06  close  — CTA: Ahmedabad HUGE + "free photo shoot" below
// Canvas: 1080x1350 (4:5 — Meta carousel ratio). deviceScaleFactor 2 -> 2160x2700.
// All photos local (faves + large); no SSD required.
const CITY = { name: 'Ahmedabad', slug: 'ahmedabad' }
const ONLY = process.argv.find(a => a.startsWith('--only='))?.split('=')[1]

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FAVES = '/Users/aidantorrence/Documents/aidan-modern/public/images/faves'
const LARGE = '/Users/aidantorrence/Documents/aidan-modern/public/images/large'
const enc = p => 'data:image/jpeg;base64,' + fs.readFileSync(p).toString('base64')
const FV = f => enc(path.join(FAVES, f))
const LG = f => enc(path.join(LARGE, f))

const W = 1080, HT = 1350
const SE = "Georgia,'Times New Roman',serif"
const SA = 'Inter,-apple-system,system-ui,sans-serif'

const FDIR = path.join(__dirname, 'fonts')
const fontB64 = f => fs.readFileSync(path.join(FDIR, f)).toString('base64')
const face = (fam, file, weight) => `@font-face{font-family:'${fam}';font-weight:${weight};font-style:normal;font-display:block;src:url(data:font/woff2;base64,${fontB64(file)}) format('woff2');}`
const FONTCSS = face('Poppins', 'poppins-700.woff2', '700')
const SH = 'text-shadow:0 3px 6px rgba(0,0,0,1),0 10px 40px rgba(0,0,0,0.85),0 0 120px rgba(0,0,0,0.6);'
const GR = '<div style="position:absolute;inset:0;pointer-events:none;opacity:0.08;mix-blend-mode:soft-light;background-image:radial-gradient(circle at 14% 18%,rgba(255,255,255,0.5),transparent 17%),radial-gradient(circle at 84% 12%,rgba(255,255,255,0.28),transparent 15%);"></div>'

// Top-right campaign tag for interior slides (sibling-deck idiom).
const BADGE = `<p style="position:absolute;right:56px;top:52px;font-family:${SA};font-size:23px;font-weight:700;color:rgba(255,255,255,0.7);letter-spacing:0.12em;text-transform:uppercase;margin:0;text-align:right;${SH}">${CITY.name} · Free photo shoot</p>`
const withBadge = s => ({ ...s, html: s.html.slice(0, -'</div>'.length) + BADGE + '</div>' })

// Dark card background (sibling-deck idiom, 4:5 canvas)
const dark = inner => `<div style="width:${W}px;height:${HT}px;position:relative;overflow:hidden;background:#0a0e08;"><div style="position:absolute;inset:0;background:linear-gradient(170deg,#0e1410 0%,#0a0e08 50%,#080c06 100%);"></div><div style="position:absolute;inset:0;background:radial-gradient(circle at 20% 18%,rgba(80,160,80,0.10),transparent 30%),radial-gradient(circle at 80% 82%,rgba(180,150,80,0.08),transparent 25%);"></div>${inner}${GR}</div>`

const frame = inner => `<div style="width:${W}px;height:${HT}px;position:relative;overflow:hidden;background:#000;">${inner}</div>`

// Full-bleed photo. `oversize` pushes baked-in film-scan borders off every edge
// (object-position alone can't — "center top" pins the scan's top border in view)
function bleedImg(src, oversize, filt = 'saturate(1.06) contrast(1.03)') {
  const ov = oversize ? 54 : 0
  const ovY = Math.round(ov * HT / W)
  return `<img src="${src}" style="position:absolute;left:${-ov}px;top:${-ovY}px;width:${W + 2 * ov}px;height:${HT + 2 * ovY}px;object-fit:cover;object-position:center top;display:block;filter:${filt};"/>`
}

// 01 — hook. Duo frame; kicker top, headline lower third. The whole headline
// block clears the bottom quadrant (ends ~y1000 of 1350).
function L_hook(src) {
  const tag = `<p style="position:absolute;left:56px;top:52px;font-family:${SA};font-size:23px;font-weight:700;color:rgba(255,255,255,0.72);letter-spacing:0.12em;text-transform:uppercase;margin:0;${SH}">${CITY.name} · Free photo shoot · 35mm</p>`
  const scrim = `<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0.10) 0%,transparent 16%,rgba(0,0,0,0.28) 55%,rgba(0,0,0,0.94) 100%);"></div>`
  const h1 = `<div style="position:absolute;bottom:350px;left:56px;right:56px;">
      <p style="font-family:${SE};font-size:108px;font-weight:700;font-style:italic;color:white;line-height:0.95;margin:0;${SH}">bring a friend.</p>
      <p style="font-family:${SE};font-size:58px;font-weight:700;font-style:italic;color:rgba(255,255,255,0.96);line-height:1.05;margin:18px 0 0;${SH}">you both get shot.</p>
    </div>`
  return { name: '01-hook', html: frame(bleedImg(src, false, 'contrast(1.04)') + scrim + tag + h1 + GR) }
}

// 02/03/04 — full-bleed proof frames, tiny corner tag only (dump-deck idiom).
function L_proof(nm, src, tag, oversize) {
  const scrim = `<div style="position:absolute;left:0;right:0;bottom:0;height:300px;background:linear-gradient(180deg,transparent,rgba(0,0,0,0.45));"></div>`
  const tagEl = `<p style="position:absolute;left:44px;bottom:40px;margin:0;font-family:${SA};font-size:24px;font-weight:500;color:rgba(255,255,255,0.88);letter-spacing:0.1em;${SH}">${tag}</p>`
  return { name: nm, html: frame(bleedImg(src, oversize) + scrim + tagEl + GR) }
}

// 05 — how it works: plain dark card, five helpful specifics. Block ends ~y1000.
function L_how() {
  const rows = [
    ['daytime', 'we shoot in the afternoon, golden hour at the latest'],
    ['public spots', 'the old city pols, the riverfront — always around people'],
    ['about an hour', 'meet, walk, shoot — done'],
    ['free TFP', 'a collab, not a booking — nobody pays anybody'],
    ['you keep the scans', 'every edited 35mm frame is yours'],
  ]
  let top = 342
  let list = ''
  for (const [t, d] of rows) {
    list += `<div style="position:absolute;left:76px;right:76px;top:${top}px;">
        <p style="font-family:${SE};font-size:44px;font-weight:700;font-style:italic;color:#fff;margin:0;line-height:1;">${t}</p>
        <p style="font-family:${SA};font-size:27px;font-weight:500;color:rgba(255,255,255,0.62);margin:10px 0 0;line-height:1.3;">${d}</p>
      </div>`
    top += 132
  }
  const head = `<div style="position:absolute;left:76px;right:76px;top:150px;">
      <p style="font-family:${SA};font-size:25px;font-weight:700;color:#dcbb7d;letter-spacing:0.14em;text-transform:uppercase;margin:0 0 20px;">The details</p>
      <p style="font-family:${SE};font-size:72px;font-weight:700;font-style:italic;color:#fff;margin:0;line-height:0.98;">how it works</p>
    </div>`
  return { name: '05-how', html: dark(head + list) }
}

// 06 — close: city HUGE + "free photo shoot" below + one low-pressure line.
// Text block ends ~y1000 — clear of the bottom quadrant.
function L_close(src) {
  const scrim = 'linear-gradient(180deg,rgba(0,0,0,0.38) 0%,rgba(0,0,0,0.18) 30%,rgba(0,0,0,0.55) 60%,rgba(0,0,0,0.92) 100%)'
  const overlay = `<div style="position:absolute;top:470px;left:56px;right:56px;text-align:center;">
      <p style="font-family:${SE};font-size:140px;font-weight:700;font-style:italic;color:#fff;margin:0;line-height:0.92;${SH}">${CITY.name}</p>
      <p style="font-family:${SE};font-size:64px;font-weight:700;font-style:italic;color:rgba(255,255,255,0.95);margin:24px 0 0;line-height:1;${SH}">free photo shoot</p>
      <p style="font-family:${SA};font-size:31px;font-weight:500;color:rgba(255,255,255,0.85);margin:52px 0 0;letter-spacing:0.03em;${SH}">sign up below — bring a friend</p>
    </div>`
  return { name: '06-close', noBadge: true, html: frame(bleedImg(src) + `<div style="position:absolute;inset:0;background:${scrim};"></div>` + overlay + GR) }
}

function buildSlides() {
  return [
    L_hook(LG('000023580034.jpg')),                                             // two friends, holding hands — genuine duo frame
    L_proof('02-daytime', LG('000039-9.jpg'), 'daytime · public spots'),        // street-food stall, vendors all around
    L_proof('03-market', FV('000005-11.jpg'), 'shot on 35mm film'),             // street market, bystanders everywhere
    L_proof('04-duo', FV('000023580032.jpg'), 'both of you get photos'),        // the same pair, close two-shot
    L_how(),
    L_close(LG('000048-5.jpg')),                                                // busy daytime street
  ]
}

async function render() {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: W, height: HT }, deviceScaleFactor: 2 })
  const allSlides = buildSlides().map((s, i) => (i === 0 || s.noBadge) ? s : withBadge(s))
  const slides = ONLY ? allSlides.filter(s => s.name === ONLY) : allSlides
  if (slides.length === 0) throw new Error(`Unknown slide for --only: ${ONLY}`)
  const dir = path.join(__dirname, 'output-ahmedabad-duo-v1')
  fs.mkdirSync(dir, { recursive: true })
  if (!ONLY) for (const f of fs.readdirSync(dir)) if (f.toLowerCase().endsWith('.jpg')) fs.rmSync(path.join(dir, f))
  for (const s of slides) {
    const page = await ctx.newPage()
    await page.setContent(`<!doctype html><html><head><style>${FONTCSS}*{box-sizing:border-box}html,body{margin:0;width:${W}px;height:${HT}px;background:#000;overflow:hidden}body{-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}</style></head><body>${s.html}</body></html>`, { waitUntil: 'load' })
    await page.evaluate(() => document.fonts.ready)
    await page.waitForTimeout(250)
    await page.screenshot({ path: path.join(dir, `${s.name}.jpg`), type: 'jpeg', quality: 92 })
    await page.close()
  }
  console.log(`${CITY.name} duo-v1: ${slides.length} slides -> ${dir}`)
  await browser.close()
  console.log('Done.')
}
render()
