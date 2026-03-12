import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, "output-17a")

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 430
const SAFE_TOP = 213
const SAFE_LEFT = 66
const SAFE_RIGHT = 1027

// High-contrast bold aesthetic — white bg, black text, accent color for MANILA
const ACCENT = '#D4380D' // warm red-orange, eye-catching on white
const BG = '#FFFFFF'
const TEXT = '#000000'
const MUTED = '#666666'
const BORDER = '#000000'

// Typography — system bold sans-serif stack
const HEAD = "'SF Pro Display', 'Helvetica Neue', Helvetica, Arial, sans-serif"
const MONO = "'SF Mono', 'Menlo', 'Courier New', monospace"

function resetOutputDir() {
  fs.rmSync(OUT_DIR, { recursive: true, force: true })
  fs.mkdirSync(OUT_DIR, { recursive: true })
}

function imageMime(name) {
  const ext = path.extname(name).toLowerCase()
  if (ext === '.png') return 'image/png'
  if (ext === '.webp') return 'image/webp'
  return 'image/jpeg'
}

function readImage(name) {
  const filePath = path.join(IMAGE_DIR, name)
  const buf = fs.readFileSync(filePath)
  return `data:${imageMime(name)};base64,${buf.toString('base64')}`
}

function getTopManilaImages(count = 30) {
  return fs.readdirSync(IMAGE_DIR)
    .filter(file => file.startsWith('manila') && /\.(jpg|jpeg|png|webp)$/i.test(file))
    .sort((a, b) => a.localeCompare(b))
    .slice(0, count)
}

function writeSources(selected) {
  const payload = {
    createdAt: new Date().toISOString(),
    strategy: 'v18 — high-contrast bold white-bg design, thick borders, massive type',
    safeBottomPixels: SAFE_BOTTOM,
    images: selected
  }
  fs.writeFileSync(path.join(OUT_DIR, 'sources.json'), JSON.stringify(payload, null, 2))
}

function wrap(html) {
  return `<!DOCTYPE html>
  <html>
    <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { margin: 0; padding: 0; background: ${BG}; }
      </style>
    </head>
    <body>${html}</body>
  </html>`
}

// ─── SLIDE 1: HOOK ───
// Big bold text top, single hero image with thick black border, clean white space
function slideOne(images) {
  // Image container: thick border frame, positioned to show full face
  // canal-001 is 1600x2392 (tall portrait) — fits great with minimal crop
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${BG};">
      <!-- MANILA accent label -->
      <div style="position:absolute;left:${SAFE_LEFT}px;top:${SAFE_TOP}px;">
        <span style="font-family:${HEAD};font-size:52px;font-weight:900;letter-spacing:0.22em;color:${ACCENT};text-transform:uppercase;">MANILA</span>
      </div>

      <!-- Main headline -->
      <div style="position:absolute;left:${SAFE_LEFT}px;right:${WIDTH - SAFE_RIGHT}px;top:${SAFE_TOP + 80}px;">
        <h1 style="font-family:${HEAD};font-size:120px;font-weight:900;line-height:0.88;color:${TEXT};letter-spacing:-0.04em;">Models<br/>wanted.</h1>
      </div>

      <!-- Sub text -->
      <div style="position:absolute;left:${SAFE_LEFT}px;right:${WIDTH - SAFE_RIGHT}px;top:${SAFE_TOP + 240}px;">
        <p style="font-family:${HEAD};font-size:36px;font-weight:400;color:${MUTED};line-height:1.35;">Editorial portrait shoots in Manila.<br/>No experience needed.</p>
      </div>

      <!-- Hero image with thick border -->
      <div style="position:absolute;left:${SAFE_LEFT}px;right:${WIDTH - SAFE_RIGHT}px;top:${SAFE_TOP + 340}px;bottom:${SAFE_BOTTOM + 20}px;border:6px solid ${BORDER};overflow:hidden;">
        <img src="${images.hero}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center 15%;"/>
      </div>
    </div>
  `
}

// ─── SLIDE 2: PROOF ───
// Grid of images with thick borders, "This is my work" in bold
function slideTwo(images) {
  const PAD = 64
  const BORDER_W = 5
  const GAP = 10
  const HEADER_BOTTOM = 380
  const GRID_BOTTOM = HEIGHT - SAFE_BOTTOM - 20
  const GRID_HEIGHT = GRID_BOTTOM - HEADER_BOTTOM
  const GRID_WIDTH = WIDTH - PAD * 2

  // 3 columns, 3 rows layout for 9 images
  const COLS = 3
  const ROWS = 3
  const cellW = Math.floor((GRID_WIDTH - (COLS - 1) * GAP) / COLS)
  const cellH = Math.floor((GRID_HEIGHT - (ROWS - 1) * GAP) / ROWS)

  const gridImages = [
    images.gridA, images.gridB, images.gridC,
    images.gridD, images.gridE, images.gridF,
    images.gridG, images.gridH, images.gridI,
  ]

  let gridHtml = ''
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const idx = row * COLS + col
      const x = PAD + col * (cellW + GAP)
      const y = HEADER_BOTTOM + row * (cellH + GAP)
      gridHtml += `
        <div style="position:absolute;left:${x}px;top:${y}px;width:${cellW}px;height:${cellH}px;border:${BORDER_W}px solid ${BORDER};overflow:hidden;">
          <img src="${gridImages[idx]}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center;"/>
        </div>
      `
    }
  }

  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${BG};">
      <!-- MANILA accent -->
      <div style="position:absolute;left:${SAFE_LEFT}px;top:${SAFE_TOP}px;">
        <span style="font-family:${HEAD};font-size:52px;font-weight:900;letter-spacing:0.22em;color:${ACCENT};text-transform:uppercase;">MANILA</span>
      </div>

      <!-- Header -->
      <div style="position:absolute;left:${SAFE_LEFT}px;right:${WIDTH - SAFE_RIGHT}px;top:${SAFE_TOP + 75}px;">
        <h2 style="font-family:${HEAD};font-size:68px;font-weight:900;color:${TEXT};line-height:0.95;letter-spacing:-0.03em;">This is my work.</h2>
      </div>

      ${gridHtml}
    </div>
  `
}

// ─── SLIDE 3: PROCESS ───
// Numbered steps, big bold numbers, clean layout with small image accent
function slideThree(images) {
  const PAD = 64
  const steps = [
    { num: '01', title: 'DM me on Instagram', desc: '@madebyaidan' },
    { num: '02', title: 'We plan together', desc: 'Pick a date, location, and vibe.' },
    { num: '03', title: 'Show up', desc: 'I guide every pose. No experience needed.' },
  ]

  let stepsHtml = ''
  const stepStartY = 420
  const stepGap = 280

  for (let i = 0; i < steps.length; i++) {
    const y = stepStartY + i * stepGap
    const s = steps[i]
    stepsHtml += `
      <div style="position:absolute;left:${PAD}px;right:${PAD}px;top:${y}px;">
        <!-- Big number -->
        <span style="font-family:${MONO};font-size:28px;font-weight:700;color:${ACCENT};letter-spacing:0.1em;">${s.num}</span>
        <!-- Horizontal rule -->
        <div style="width:100%;height:3px;background:${BORDER};margin:14px 0 18px;"></div>
        <!-- Step title -->
        <p style="font-family:${HEAD};font-size:52px;font-weight:900;color:${TEXT};line-height:1.05;letter-spacing:-0.02em;margin:0 0 10px;">${s.title}</p>
        <!-- Step description -->
        <p style="font-family:${HEAD};font-size:30px;font-weight:400;color:${MUTED};line-height:1.3;">${s.desc}</p>
      </div>
    `
  }

  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${BG};">
      <!-- MANILA accent -->
      <div style="position:absolute;left:${SAFE_LEFT}px;top:${SAFE_TOP}px;">
        <span style="font-family:${HEAD};font-size:52px;font-weight:900;letter-spacing:0.22em;color:${ACCENT};text-transform:uppercase;">MANILA</span>
      </div>

      <!-- Header -->
      <div style="position:absolute;left:${SAFE_LEFT}px;right:${WIDTH - SAFE_RIGHT}px;top:${SAFE_TOP + 75}px;">
        <h2 style="font-family:${HEAD};font-size:80px;font-weight:900;color:${TEXT};line-height:0.92;letter-spacing:-0.04em;">How it works.</h2>
      </div>

      ${stepsHtml}

      <!-- Small accent image at bottom right -->
      <div style="position:absolute;right:${PAD}px;bottom:${SAFE_BOTTOM + 30}px;width:320px;height:400px;border:5px solid ${BORDER};overflow:hidden;">
        <img src="${images.process}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center 20%;"/>
      </div>
    </div>
  `
}

// ─── SLIDE 4: CTA ───
// Strong call to action, image top half, bold text bottom
function slideFour(images) {
  const PAD = 64
  const IMG_BOTTOM = 1020
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${BG};">
      <!-- Hero image top portion -->
      <div style="position:absolute;left:${SAFE_LEFT}px;right:${WIDTH - SAFE_RIGHT}px;top:${SAFE_TOP}px;height:${IMG_BOTTOM - SAFE_TOP}px;border:6px solid ${BORDER};overflow:hidden;">
        <img src="${images.cta}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center 20%;"/>
      </div>

      <!-- MANILA accent -->
      <div style="position:absolute;left:${PAD}px;top:${IMG_BOTTOM + 40}px;">
        <span style="font-family:${HEAD};font-size:52px;font-weight:900;letter-spacing:0.22em;color:${ACCENT};text-transform:uppercase;">MANILA</span>
      </div>

      <!-- CTA headline -->
      <div style="position:absolute;left:${PAD}px;right:${PAD}px;top:${IMG_BOTTOM + 115}px;">
        <h2 style="font-family:${HEAD};font-size:96px;font-weight:900;color:${TEXT};line-height:0.9;letter-spacing:-0.04em;">DM me if<br/>interested.</h2>
      </div>

      <!-- CTA sub -->
      <div style="position:absolute;left:${PAD}px;right:${PAD}px;top:${IMG_BOTTOM + 310}px;">
        <p style="font-family:${HEAD};font-size:32px;font-weight:400;color:${MUTED};line-height:1.35;">@madebyaidan on Instagram</p>
      </div>

      <!-- Urgency pill -->
      <div style="position:absolute;left:${PAD}px;top:${IMG_BOTTOM + 395}px;display:inline-flex;align-items:center;padding:14px 28px;border:3px solid ${BORDER};background:${TEXT};">
        <span style="font-family:${HEAD};font-size:26px;font-weight:900;color:${BG};letter-spacing:0.06em;text-transform:uppercase;">No experience needed</span>
      </div>
    </div>
  `
}

async function render() {
  resetOutputDir()

  const all = getTopManilaImages()

  const selection = {
    hero: 'manila-gallery-street-001.jpg',        // tall portrait, street vibe
    gridA: 'manila-gallery-closeup-001.jpg',       // portrait
    gridB: 'manila-gallery-garden-001.jpg',        // landscape
    gridC: 'manila-gallery-dsc-0075.jpg',          // portrait
    gridD: 'manila-gallery-night-001.jpg',         // square
    gridE: 'manila-gallery-market-001.jpg',      // portrait
    gridF: 'manila-gallery-rocks-001.jpg',         // landscape
    gridG: 'manila-gallery-urban-002.jpg',         // portrait
    gridH: 'manila-gallery-shadow-001.jpg',        // portrait
    gridI: 'manila-gallery-tropical-001.jpg',      // tall portrait
    process: 'manila-gallery-dsc-0190.jpg',        // portrait
    cta: 'manila-gallery-white-001.jpg',           // tall portrait, clean
  }

  writeSources({ all_considered: all, selected: selection })

  const images = Object.fromEntries(
    Object.entries(selection).map(([key, file]) => [key, readImage(file)])
  )

  const slides = [
    ['01_hook_story.png', slideOne(images)],
    ['02_proof_story.png', slideTwo(images)],
    ['03_process_story.png', slideThree(images)],
    ['04_cta_story.png', slideFour(images)]
  ]

  const browser = await chromium.launch()
  const context = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1
  })

  for (const [filename, html] of slides) {
    const page = await context.newPage()
    await page.setContent(wrap(html), { waitUntil: 'load' })
    await page.waitForTimeout(300)
    await page.screenshot({ path: path.join(OUT_DIR, filename), type: 'png' })
    await page.close()
    console.log(`Rendered ${filename}`)
  }

  await browser.close()
  console.log(`Done: ${slides.length} story/reels slides written to ${OUT_DIR}`)
}

render().catch(error => {
  console.error(error)
  process.exit(1)
})
