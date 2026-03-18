import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

// ── Config ──────────────────────────────────────────────────────────
const CITY = 'Subic'
const CITY_UPPER = CITY.toUpperCase()
const PREFIX = 'subic-carousel'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, 'output')
const IMG_DIR = '/Users/aidantorrence/Documents/aidan-modern/public/images/large'

fs.mkdirSync(OUT, { recursive: true })

function img(filename) {
  const buf = fs.readFileSync(path.join(IMG_DIR, filename))
  return `data:image/jpeg;base64,${buf.toString('base64')}`
}

// ── Photo assets ────────────────────────────────────────────────────
const imgUrban3   = img('manila-gallery-urban-003.jpg')   // hero slide 1
const imgIvy2     = img('manila-gallery-ivy-002.jpg')     // hero slide 5
const img0075     = img('manila-gallery-dsc-0075.jpg')    // bg slides 3/4
const imgNight3   = img('manila-gallery-night-003.jpg')   // bg slide 4
const img0190     = img('manila-gallery-dsc-0190.jpg')    // proof grid
const imgCanal1   = img('manila-gallery-canal-001.jpg')
const img0911     = img('manila-gallery-dsc-0911.jpg')
const imgMarket   = img('manila-gallery-market-001.jpg')  // proof bg slide 2

// ── Typography ──────────────────────────────────────────────────────
const SERIF = "Georgia, 'Times New Roman', serif"
const SANS  = "-apple-system, system-ui, 'Helvetica Neue', sans-serif"
const TS = 'text-shadow: 0 2px 6px rgba(0,0,0,0.95), 0 8px 30px rgba(0,0,0,0.7), 0 0 60px rgba(0,0,0,0.5);'

// ── Shared components ───────────────────────────────────────────────

function filmGrain(opacity = 0.08) {
  return `<div style="position:absolute;inset:0;pointer-events:none;opacity:${opacity};mix-blend-mode:overlay;background-image:
    radial-gradient(circle at 20% 20%, rgba(255,255,255,0.4), transparent 18%),
    radial-gradient(circle at 80% 15%, rgba(255,255,255,0.25), transparent 16%),
    repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 4px);"></div>`
}

/** Dark semi-transparent header bar pinned to top — "FREE PHOTO SHOOT • CITY" */
function headerBar() {
  return `<div style="position:absolute;top:0;left:0;right:0;height:70px;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;z-index:10;">
    <span style="font-family:${SANS};font-size:28px;font-weight:700;color:white;letter-spacing:6px;text-transform:uppercase;">FREE PHOTO SHOOT &bull; ${CITY_UPPER}</span>
  </div>`
}

/** Footer badge for proof slide */
function footerBadge() {
  return `<div style="position:absolute;bottom:80px;left:0;right:0;display:flex;justify-content:center;z-index:10;">
    <div style="background:rgba(0,0,0,0.75);padding:14px 40px;border-radius:40px;">
      <span style="font-family:${SANS};font-size:26px;font-weight:600;color:white;letter-spacing:3px;text-transform:uppercase;">Free photo shoot &bull; ${CITY_UPPER}</span>
    </div>
  </div>`
}

// ════════════════════════════════════════════════════════════════════
//  SLIDE 1 — HOOK
//  Full-bleed hero. Massive stacked text: FREE / PHOTO SHOOT / City
// ════════════════════════════════════════════════════════════════════
const slide1 = {
  name: `${PREFIX}-01-hook`,
  html: `
    <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
      <img src="${imgUrban3}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;filter:saturate(1.1) contrast(1.05);"/>
      <!-- heavy bottom gradient for text contrast -->
      <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(0,0,0,0.15) 0%, transparent 25%, transparent 40%, rgba(0,0,0,0.88) 75%, rgba(0,0,0,0.95) 100%);"></div>
      <div style="position:absolute;bottom:360px;left:64px;right:64px;">
        <div style="font-family:${SERIF};font-size:200px;font-weight:700;font-style:italic;color:white;line-height:0.85;margin:0;${TS}">FREE</div>
        <div style="font-family:${SERIF};font-size:130px;font-weight:700;font-style:italic;color:white;line-height:0.9;margin:10px 0 0;${TS}">PHOTO SHOOT</div>
        <div style="font-family:${SANS};font-size:84px;font-weight:800;color:#FFD54F;line-height:1;margin:24px 0 0;letter-spacing:4px;text-transform:uppercase;${TS}">${CITY_UPPER}</div>
        <div style="font-family:${SANS};font-size:34px;color:rgba(255,255,255,0.7);margin:32px 0 0;${TS}">No experience needed.</div>
      </div>
      ${filmGrain(0.08)}
    </div>`
}

// ════════════════════════════════════════════════════════════════════
//  SLIDE 2 — PROOF
//  Full-bleed bg photo (darkened) + 4 portfolio photos in 2x2 grid
// ════════════════════════════════════════════════════════════════════
const proofPhotos = [img0190, imgCanal1, img0911, imgMarket]
const proofGrid = proofPhotos.map((src, i) => {
  const col = i % 2
  const row = Math.floor(i / 2)
  const left = 80 + col * 480
  const top = 480 + row * 480
  const rot = [-2.5, 1.8, 1.5, -2.0][i]
  return `<div style="position:absolute;left:${left}px;top:${top}px;width:440px;height:440px;transform:rotate(${rot}deg);background:white;padding:12px;box-shadow:0 20px 50px rgba(0,0,0,0.5);z-index:2;">
    <img src="${src}" style="width:100%;height:100%;object-fit:cover;display:block;"/>
  </div>`
}).join('\n')

const slide2 = {
  name: `${PREFIX}-02-proof`,
  html: `
    <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#0a0a0a;">
      <img src="${imgMarket}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0.2;filter:blur(8px) saturate(0.7);"/>
      <div style="position:absolute;inset:0;background:rgba(0,0,0,0.55);"></div>
      <!-- header -->
      <div style="position:absolute;top:180px;left:0;right:0;text-align:center;z-index:3;">
        <h2 style="font-family:${SERIF};font-size:80px;font-weight:700;font-style:italic;color:white;margin:0;${TS}">My recent work</h2>
      </div>
      ${proofGrid}
      ${footerBadge()}
      ${filmGrain(0.06)}
    </div>`
}

// ════════════════════════════════════════════════════════════════════
//  SLIDE 3 — HOW IT WORKS
//  Header bar top. Photo top 55%. Bottom warm beige with steps.
// ════════════════════════════════════════════════════════════════════
const steps = [
  'Message me on Instagram or WhatsApp',
  'We chat and plan your shoot',
  'Show up and get great photos'
]
const stepsHtml = steps.map((step, i) => `
  <div style="display:flex;align-items:center;gap:24px;">
    <span style="font-family:${SANS};display:flex;align-items:center;justify-content:center;width:60px;height:60px;border-radius:50%;background:#1a1a1a;color:white;font-size:30px;font-weight:800;flex-shrink:0;">${i + 1}</span>
    <span style="font-family:${SANS};font-size:40px;font-weight:500;color:#2a2a2a;line-height:1.3;">${step}</span>
  </div>`).join('\n')

const slide3 = {
  name: `${PREFIX}-03-how`,
  html: `
    <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#f5f0ea;">
      <!-- photo top 55% -->
      <img src="${img0075}" style="width:100%;height:55%;object-fit:cover;object-position:center;display:block;"/>
      <div style="position:absolute;top:0;left:0;right:0;height:55%;background:linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, transparent 30%, transparent 80%, rgba(245,240,234,1) 100%);"></div>
      <!-- bottom content -->
      <div style="position:absolute;bottom:340px;left:80px;right:80px;">
        <h2 style="font-family:${SERIF};font-size:72px;font-weight:700;color:#1a1a1a;margin:0 0 40px;line-height:1.05;">Super simple.</h2>
        <div style="display:flex;flex-direction:column;gap:32px;">${stepsHtml}</div>
        <p style="font-family:${SANS};margin:40px 0 0;font-size:36px;font-weight:600;color:#1a1a1a;line-height:1.35;">No experience needed.<br/>I guide you the whole time.</p>
      </div>
      <!-- persistent header bar -->
      ${headerBar()}
      ${filmGrain(0.04)}
    </div>`
}

// ════════════════════════════════════════════════════════════════════
//  SLIDE 4 — WHAT YOU GET
//  Header bar top. Photo top 55%. Bottom with deliverables.
// ════════════════════════════════════════════════════════════════════
const deliverables = [
  'A fun guided shoot — I direct everything',
  'Edited photos ready to post',
  'Help with vibe, outfits, and locations',
  'Direct communication start to finish'
]
const itemsHtml = deliverables.map(item => `
  <div style="display:flex;align-items:flex-start;gap:18px;">
    <span style="font-family:${SANS};font-size:42px;color:#1a1a1a;line-height:1;flex-shrink:0;margin-top:2px;">&#10003;</span>
    <span style="font-family:${SANS};font-size:40px;font-weight:500;color:#2a2a2a;line-height:1.35;">${item}</span>
  </div>`).join('\n')

const slide4 = {
  name: `${PREFIX}-04-what`,
  html: `
    <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#f5f0ea;">
      <!-- photo top 55% -->
      <img src="${imgNight3}" style="width:100%;height:55%;object-fit:cover;object-position:center;display:block;"/>
      <div style="position:absolute;top:0;left:0;right:0;height:55%;background:linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, transparent 30%, transparent 80%, rgba(245,240,234,1) 100%);"></div>
      <!-- bottom content -->
      <div style="position:absolute;bottom:340px;left:80px;right:80px;">
        <h2 style="font-family:${SERIF};font-size:72px;font-weight:700;color:#1a1a1a;margin:0 0 40px;line-height:1.05;">All of this. For free.</h2>
        <div style="display:flex;flex-direction:column;gap:24px;">${itemsHtml}</div>
      </div>
      <!-- persistent header bar -->
      ${headerBar()}
      ${filmGrain(0.04)}
    </div>`
}

// ════════════════════════════════════════════════════════════════════
//  SLIDE 5 — CTA
//  Full-bleed hero, heavy dark gradient, massive culmination text
// ════════════════════════════════════════════════════════════════════
const slide5 = {
  name: `${PREFIX}-05-cta`,
  html: `
    <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
      <img src="${imgIvy2}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(1.1) brightness(0.8);"/>
      <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.15) 25%, rgba(0,0,0,0.4) 55%, rgba(0,0,0,0.92) 80%, rgba(0,0,0,0.97) 100%);"></div>
      <div style="position:absolute;bottom:400px;left:64px;right:64px;">
        <div style="font-family:${SERIF};font-size:130px;font-weight:700;font-style:italic;color:white;line-height:0.95;margin:0;${TS}">Your turn.</div>
        <div style="font-family:${SANS};font-size:64px;font-weight:800;color:white;margin:36px 0 0;${TS}">DM @madebyaidan</div>
        <div style="font-family:${SANS};font-size:38px;color:rgba(255,255,255,0.75);margin:28px 0 0;${TS}">Free photo shoot in ${CITY}</div>
      </div>
      ${filmGrain(0.08)}
    </div>`
}

// ── Render ───────────────────────────────────────────────────────────
const slides = [slide1, slide2, slide3, slide4, slide5]

async function render() {
  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 })

  for (const slide of slides) {
    const page = await context.newPage()
    await page.setContent(`<!doctype html><html><head><style>
      * { box-sizing: border-box; }
      html, body { margin: 0; width: 1080px; height: 1920px; background: #000; overflow: hidden; }
      body { -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; }
    </style></head><body>${slide.html}</body></html>`, { waitUntil: 'load' })
    await page.waitForTimeout(500)
    await page.screenshot({ path: path.join(OUT, `${slide.name}.png`), type: 'png' })
    await page.close()
    console.log(`OK ${slide.name}`)
  }

  await browser.close()
  console.log(`\nDone — ${slides.length} slides -> ${OUT}`)
}

render()
