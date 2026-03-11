import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v16')

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 410

const BOLD = "'Avenir Next', 'Helvetica Neue', Arial, sans-serif"
const BODY = "'Avenir Next', 'Helvetica Neue', Arial, sans-serif"
const NARROW = "Futura, 'Arial Narrow', sans-serif"

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

function getTopManilaImages(count = 20) {
  return fs.readdirSync(IMAGE_DIR)
    .filter(file => file.startsWith('manila') && /\.(jpg|jpeg|png|webp)$/i.test(file))
    .sort((a, b) => a.localeCompare(b))
    .slice(0, count)
}

function readImage(name) {
  const filePath = path.join(IMAGE_DIR, name)
  const buf = fs.readFileSync(filePath)
  return `data:${imageMime(name)};base64,${buf.toString('base64')}`
}

function writeSources(selected) {
  const payload = {
    createdAt: new Date().toISOString(),
    strategy: 'v16 — full-bleed DR creative, manually selected manila* files',
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
        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; background: #000; }
      </style>
    </head>
    <body>${html}</body>
  </html>`
}

// Slide 1: HOOK — full bleed hero, huge bold headline, pattern interrupt
function slideOne(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#000;">
      <img src="${images.hero}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top 20%;"/>
      <!-- top gradient for headline -->
      <div style="position:absolute;left:0;right:0;top:0;height:820px;background:linear-gradient(180deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0) 100%);"></div>
      <!-- bottom gradient for safe zone -->
      <div style="position:absolute;left:0;right:0;bottom:0;height:${SAFE_BOTTOM + 100}px;background:linear-gradient(0deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%);"></div>

      <!-- headline -->
      <div style="position:absolute;left:54px;top:72px;right:54px;">
        <p style="font-family:${NARROW};font-size:64px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#e8b880;margin:0 0 14px;">Manila</p>
        <h1 style="font-family:${BOLD};font-size:108px;font-weight:800;line-height:0.92;color:#fff;margin:0 0 28px;letter-spacing:-0.02em;">Models<br/>wanted.</h1>
        <p style="font-family:${BODY};font-size:34px;font-weight:500;line-height:1.34;color:rgba(255,255,255,0.92);margin:0;">Editorial portrait shoots.<br/>No experience needed.</p>
      </div>

      <!-- swipe indicator -->
      <div style="position:absolute;left:54px;bottom:${SAFE_BOTTOM + 40}px;display:flex;align-items:center;gap:14px;">
        <span style="font-family:${BODY};font-size:24px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:rgba(255,255,255,0.6);">Swipe</span>
        <span style="display:inline-block;width:40px;height:2px;background:rgba(255,255,255,0.5);"></span>
      </div>
    </div>
  `
}

// Justified gallery layout — zero crop, images sized to their native aspect ratio
function justifiedLayout(imageList, containerWidth, availableHeight, gap, targetRowHeight) {
  const rows = []
  let currentRow = []

  for (const img of imageList) {
    currentRow.push(img)
    const totalAspect = currentRow.reduce((s, i) => s + i.aspect, 0)
    const totalGaps = (currentRow.length - 1) * gap
    const rowHeight = (containerWidth - totalGaps) / totalAspect

    if (rowHeight <= targetRowHeight && currentRow.length >= 2) {
      rows.push({ images: [...currentRow], height: rowHeight })
      currentRow = []
    }
  }

  if (currentRow.length > 0) {
    const totalAspect = currentRow.reduce((s, i) => s + i.aspect, 0)
    const totalGaps = (currentRow.length - 1) * gap
    const rowHeight = Math.min(targetRowHeight * 1.2, (containerWidth - totalGaps) / totalAspect)
    rows.push({ images: [...currentRow], height: rowHeight })
  }

  // Scale all rows to fit available height exactly
  const totalNatural = rows.reduce((s, r) => s + r.height, 0) + (rows.length - 1) * gap
  const scale = availableHeight / totalNatural
  for (const row of rows) {
    row.height = Math.round(row.height * scale)
  }

  return rows
}

// Slide 2: PROOF — justified photo mosaic, zero crop
function slideTwo(images) {
  const HEADER_END = 230
  const BOTTOM_LIMIT = HEIGHT - SAFE_BOTTOM - 20
  const PAD = 28
  const GAP = 10
  const CONTAINER_W = WIDTH - PAD * 2
  const AVAILABLE_H = BOTTOM_LIMIT - HEADER_END
  const TARGET_ROW_H = 320

  // image list with w/h aspect ratios (width / height)
  const mosaicImages = [
    { src: images.gridA,  aspect: 1059 / 1600 },  // closeup-001
    { src: images.gridB,  aspect: 957 / 1510 },   // dsc-0911
    { src: images.gridC,  aspect: 1600 / 1061 },  // garden-002
    { src: images.gridD,  aspect: 1080 / 1080 },  // night-003
    { src: images.gridE,  aspect: 968 / 1508 },   // dsc-0130
    { src: images.gridF,  aspect: 1600 / 1072 },  // canal-002 (landscape)
    { src: images.gridG,  aspect: 1228 / 1818 },  // graffiti-001
    { src: images.gridH,  aspect: 1228 / 1818 },  // urban-001
    { src: images.gridI,  aspect: 1067 / 1600 },  // shadow-001
    { src: images.gridJ,  aspect: 1600 / 1061 },  // ivy-001
    { src: images.gridK,  aspect: 976 / 1551 },   // dsc-0075
  ]

  const rows = justifiedLayout(mosaicImages, CONTAINER_W, AVAILABLE_H, GAP, TARGET_ROW_H)

  let html = ''
  let y = HEADER_END
  for (const row of rows) {
    // Recompute widths from scaled height, then force last image to fill remaining space
    const totalGaps = (row.images.length - 1) * GAP
    const rawWidths = row.images.map(img => row.height * img.aspect)
    const rawTotal = rawWidths.reduce((s, w) => s + w, 0)
    const scaleFactor = (CONTAINER_W - totalGaps) / rawTotal
    const widths = rawWidths.map(w => Math.round(w * scaleFactor))
    // Fix rounding: adjust last image width
    const usedWidth = widths.reduce((s, w) => s + w, 0) + totalGaps
    widths[widths.length - 1] += (CONTAINER_W - usedWidth)

    let x = PAD
    for (let i = 0; i < row.images.length; i++) {
      const img = row.images[i]
      const w = widths[i]
      html += `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${row.height}px;border-radius:16px;overflow:hidden;">
        <img src="${img.src}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center;"/>
      </div>`
      x += w + GAP
    }
    y += row.height + GAP
  }

  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#0a0a0a;">
      <div style="position:absolute;left:54px;top:62px;right:54px;">
        <p style="font-family:${NARROW};font-size:64px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#e8b880;margin:0 0 10px;">Manila</p>
        <h2 style="font-family:${BOLD};font-size:62px;font-weight:800;line-height:0.94;color:#fff;margin:0;letter-spacing:-0.02em;">This is my work.</h2>
      </div>
      ${html}
      <!-- swipe -->
      <div style="position:absolute;left:54px;bottom:${SAFE_BOTTOM + 36}px;display:flex;align-items:center;gap:14px;">
        <span style="font-family:${BODY};font-size:24px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:rgba(255,255,255,0.5);">Swipe</span>
        <span style="display:inline-block;width:40px;height:2px;background:rgba(255,255,255,0.4);"></span>
      </div>
    </div>
  `
}

// Slide 3: HOW EASY — full bleed image, 3 dead-simple steps overlaid
function slideThree(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#000;">
      <img src="${images.process}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center bottom;"/>
      <!-- dark overlay — image is atmospheric texture, cards are the focus -->
      <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.7) 35%, rgba(0,0,0,0.45) 70%, rgba(0,0,0,0.65) 100%);"></div>

      <div style="position:absolute;left:54px;top:62px;right:54px;">
        <p style="font-family:${NARROW};font-size:64px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#e8b880;margin:0 0 10px;">Manila</p>
        <h2 style="font-family:${BOLD};font-size:72px;font-weight:800;line-height:0.94;color:#fff;margin:0;letter-spacing:-0.02em;">3 steps.<br/>That's it.</h2>
      </div>

      <!-- steps -->
      <div style="position:absolute;left:54px;right:54px;top:340px;display:flex;flex-direction:column;gap:24px;">
        <div style="padding:32px 36px;border-radius:24px;background:rgba(255,255,255,0.12);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.15);">
          <div style="display:flex;align-items:baseline;gap:18px;">
            <span style="font-family:${BOLD};font-size:52px;font-weight:800;color:#fff;line-height:1;">1</span>
            <div>
              <p style="font-family:${BOLD};font-size:38px;font-weight:700;color:#fff;margin:0 0 6px;line-height:1.1;">Sign up below</p>
              <p style="font-family:${BODY};font-size:26px;color:rgba(255,255,255,0.75);margin:0;line-height:1.3;">Takes 60 seconds. I message you back.</p>
            </div>
          </div>
        </div>
        <div style="padding:32px 36px;border-radius:24px;background:rgba(255,255,255,0.12);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.15);">
          <div style="display:flex;align-items:baseline;gap:18px;">
            <span style="font-family:${BOLD};font-size:52px;font-weight:800;color:#fff;line-height:1;">2</span>
            <div>
              <p style="font-family:${BOLD};font-size:38px;font-weight:700;color:#fff;margin:0 0 6px;line-height:1.1;">We pick a date</p>
              <p style="font-family:${BODY};font-size:26px;color:rgba(255,255,255,0.75);margin:0;line-height:1.3;">Location, vibe, and look — we plan it together.</p>
            </div>
          </div>
        </div>
        <div style="padding:32px 36px;border-radius:24px;background:rgba(255,255,255,0.12);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.15);">
          <div style="display:flex;align-items:baseline;gap:18px;">
            <span style="font-family:${BOLD};font-size:52px;font-weight:800;color:#fff;line-height:1;">3</span>
            <div>
              <p style="font-family:${BOLD};font-size:38px;font-weight:700;color:#fff;margin:0 0 6px;line-height:1.1;">Show up. I guide you.</p>
              <p style="font-family:${BODY};font-size:26px;color:rgba(255,255,255,0.75);margin:0;line-height:1.3;">No posing experience needed. You just show up.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- swipe -->
      <div style="position:absolute;left:54px;bottom:${SAFE_BOTTOM + 36}px;display:flex;align-items:center;gap:14px;">
        <span style="font-family:${BODY};font-size:24px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:rgba(255,255,255,0.5);">Swipe</span>
        <span style="display:inline-block;width:40px;height:2px;background:rgba(255,255,255,0.4);"></span>
      </div>
    </div>
  `
}

// Slide 4: CTA — full bleed, urgency, one clear action
function slideFour(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#000;">
      <img src="${images.cta}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 60%;"/>
      <!-- heavy top gradient -->
      <div style="position:absolute;left:0;right:0;top:0;height:740px;background:linear-gradient(180deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.65) 55%, rgba(0,0,0,0) 100%);"></div>
      <!-- bottom gradient -->
      <div style="position:absolute;left:0;right:0;bottom:0;height:${SAFE_BOTTOM + 100}px;background:linear-gradient(0deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%);"></div>

      <div style="position:absolute;left:54px;top:72px;right:54px;">
        <p style="font-family:${NARROW};font-size:64px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#e8b880;margin:0 0 14px;">Manila</p>
        <h2 style="font-family:${BOLD};font-size:96px;font-weight:800;line-height:0.92;color:#fff;margin:0 0 30px;letter-spacing:-0.02em;">Sign up<br/>below.</h2>
        <p style="font-family:${BODY};font-size:34px;font-weight:500;line-height:1.38;color:rgba(255,255,255,0.9);margin:0 0 40px;">60-second form. I'll message<br/>you back within a day.</p>
      </div>

      <!-- urgency badge -->
      <div style="position:absolute;left:54px;top:520px;display:inline-flex;align-items:center;padding:16px 28px;border-radius:16px;background:rgba(255,255,255,0.14);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.2);">
        <span style="font-family:${BOLD};font-size:26px;font-weight:700;color:#fff;letter-spacing:0.02em;">Limited spots this month</span>
      </div>
    </div>
  `
}

async function render() {
  resetOutputDir()

  const all = getTopManilaImages()
  const selection = {
    hero: 'manila-gallery-canal-001.jpg',
    gridA: 'manila-gallery-closeup-001.jpg',
    gridB: 'manila-gallery-dsc-0911.jpg',
    gridC: 'manila-gallery-garden-002.jpg',
    gridD: 'manila-gallery-night-003.jpg',
    gridE: 'manila-gallery-dsc-0130.jpg',
    gridF: 'manila-gallery-canal-002.jpg',
    gridG: 'manila-gallery-graffiti-001.jpg',
    gridH: 'manila-gallery-urban-001.jpg',
    gridI: 'manila-gallery-shadow-001.jpg',
    gridJ: 'manila-gallery-ivy-001.jpg',
    gridK: 'manila-gallery-dsc-0075.jpg',
    process: 'manila-gallery-dsc-0190.jpg',
    cta: 'manila-gallery-floor-001.jpg'
  }

  writeSources({ all_considered: all, selected: selection })

  const images = Object.fromEntries(
    Object.entries(selection).map(([key, file]) => [key, readImage(file)])
  )

  const slides = [
    ['01_hook_story.png', slideOne(images)],
    ['02_proof_story.png', slideTwo(images)],
    ['03_how_easy_story.png', slideThree(images)],
    ['04_sign_up_story.png', slideFour(images)]
  ]

  const browser = await chromium.launch()
  const context = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1
  })

  for (const [filename, html] of slides) {
    const page = await context.newPage()
    await page.setContent(wrap(html), { waitUntil: 'load' })
    await page.waitForTimeout(200)
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
