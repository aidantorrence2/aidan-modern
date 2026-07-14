import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

// === AHMEDABAD DUMP v1 — "results-first" photo-dump angle ===
// A deliberately different angle from ahmedabad-story-v2b (casting/story deck):
// the whole deck reads like an organic photo dump, not an ad.
//   01          strongest single frame FULL-BLEED, tiny corner tag only
//   02..06      full-bleed portfolio frames, zero text
//   07          simple CTA card: Ahmedabad HUGE + "free photo shoot" below
// Canvas: 1080x1350 (4:5 — Meta carousel ratio). deviceScaleFactor 2 -> 2160x2700.
// All photos sourced locally (headliners + nepal-headliners); no SSD required.
const CITY = { name: 'Ahmedabad', slug: 'ahmedabad' }
const ONLY = process.argv.find(a => a.startsWith('--only='))?.split('=')[1]

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const HEAD = '/Users/aidantorrence/Documents/aidan-modern/public/images/headliners'
const NEPAL = '/Users/aidantorrence/Documents/aidan-modern/public/images/nepal-headliners'

const enc = p => 'data:image/jpeg;base64,' + fs.readFileSync(p).toString('base64')
const H = f => enc(path.join(HEAD, f))
const NP = f => enc(path.join(NEPAL, f))

const W = 1080, HT = 1350
const SE = "Georgia, 'Times New Roman', serif"
const SA = 'Inter, -apple-system, system-ui, sans-serif'
const SH = 'text-shadow:0 2px 8px rgba(0,0,0,0.85),0 12px 50px rgba(0,0,0,0.6);'

// embed real fonts (base64) so they render reliably in headless chromium
const FDIR = path.join(__dirname, 'fonts')
const fontB64 = f => fs.readFileSync(path.join(FDIR, f)).toString('base64')
const face = (fam, file, weight) => `@font-face{font-family:'${fam}';font-weight:${weight};font-style:normal;font-display:block;src:url(data:font/woff2;base64,${fontB64(file)}) format('woff2');}`
const FONTCSS = face('Poppins', 'poppins-700.woff2', '700')

const grain = (o = 0.07) => `<div style="position:absolute;inset:0;pointer-events:none;opacity:${o};mix-blend-mode:soft-light;background-image:radial-gradient(circle at 14% 18%,rgba(255,255,255,0.5),transparent 17%),radial-gradient(circle at 84% 12%,rgba(255,255,255,0.28),transparent 15%),repeating-linear-gradient(0deg,rgba(255,255,255,0.08) 0 1px,transparent 1px 4px);"></div>`

const frame = inner => `<div style="width:${W}px;height:${HT}px;position:relative;overflow:hidden;background:#000;">${inner}</div>`

// Full-bleed portfolio frame. Photos are portrait, canvas is portrait (4:5) — no
// orientation cross-crop. `zoom` pushes baked-in film borders off-canvas for scans.
function bleed(nm, src, tag, oversize) {
  // oversize=true pushes baked-in film-scan borders off every edge (object-position
  // alone can't — "center top" pins the scan's top border in view)
  const ov = oversize ? 54 : 0
  const ovY = Math.round(ov * HT / W)
  const geom = `left:${-ov}px;top:${-ovY}px;width:${W + 2 * ov}px;height:${HT + 2 * ovY}px;`
  // scrim is whisper-quiet — just enough for the corner tag to read; keeps the organic look
  const scrim = tag ? `<div style="position:absolute;left:0;right:0;bottom:0;height:300px;background:linear-gradient(180deg,transparent,rgba(0,0,0,0.42));"></div>` : ''
  const tagEl = tag ? `<p style="position:absolute;left:44px;bottom:40px;margin:0;font-family:${SA};font-size:24px;font-weight:500;color:rgba(255,255,255,0.85);letter-spacing:0.1em;${SH}">${tag}</p>` : ''
  return { name: nm, html: frame(`<img src="${src}" style="position:absolute;${geom}object-fit:cover;object-position:center top;display:block;filter:saturate(1.06) contrast(1.03);"/>${scrim}${tagEl}${grain()}`) }
}

function buildSlides({ name }) {
  const slides = []

  // 01 — strongest frame, full-bleed, tiny understated tag only. No pitch.
  slides.push(bleed('01-open', H('000050-6.jpg'), `shot on 35mm&ensp;·&ensp;${name}`))

  // 02–06 — the dump: full-bleed portfolio frames, no text
  slides.push(bleed('02-frame', H('000023.jpg')))
  slides.push(bleed('03-frame', H('000041.jpg')))
  slides.push(bleed('04-frame', NP('DSC_0248.jpg'), null, true))   // film scan — oversize clears baked borders
  slides.push(bleed('05-frame', H('000001-8.jpg')))
  slides.push(bleed('06-frame', H('000020-5.jpg')))

  // 07 — CTA card: city HUGE, "free photo shoot" below, one short line.
  //      All text well above the bottom quadrant (block ends ~y960 of 1350).
  slides.push({
    name: '07-cta', html: frame(`
      <div style="position:absolute;inset:0;background:linear-gradient(170deg,#111110 0%,#0a0a0a 55%,#080807 100%);"></div>
      <div style="position:absolute;inset:0;background:radial-gradient(circle at 22% 16%,rgba(200,170,110,0.07),transparent 34%),radial-gradient(circle at 80% 85%,rgba(120,100,70,0.05),transparent 30%);"></div>
      <div style="position:absolute;left:56px;right:56px;top:400px;text-align:center;">
        <p style="font-family:${SE};font-size:150px;font-weight:700;font-style:italic;color:#fff;margin:0;line-height:0.92;">${name}</p>
        <p style="font-family:${SE};font-size:70px;font-weight:700;font-style:italic;color:rgba(255,255,255,0.95);margin:26px 0 0;line-height:1;">free photo shoot</p>
        <div style="width:76px;height:2px;background:rgba(255,255,255,0.45);margin:56px auto 0;"></div>
        <p style="font-family:${SA};font-size:31px;font-weight:500;color:rgba(255,255,255,0.68);margin:44px 0 0;letter-spacing:0.04em;">sign up — takes a minute</p>
      </div>
    ` + grain(0.05))
  })

  return slides
}

async function render() {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: W, height: HT }, deviceScaleFactor: 2 })
  const allSlides = buildSlides(CITY)
  const slides = ONLY ? allSlides.filter(s => s.name === ONLY) : allSlides
  if (slides.length === 0) throw new Error(`Unknown slide for --only: ${ONLY}`)
  const dir = path.join(__dirname, 'output-ahmedabad-dump-v1')
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
  console.log(`${CITY.name} dump-v1: ${slides.length} slides -> ${dir}`)
  await browser.close()
  console.log('Done.')
}
render()
