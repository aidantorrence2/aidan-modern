import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v19')

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 410

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
    strategy: 'v19 — v18 white-bg bold design with animated proof slide (MP4)',
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

// --- SLIDE 1: HOOK (identical to v18) ---
function slideOne(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${BG};">
      <!-- MANILA accent label -->
      <div style="position:absolute;left:64px;top:80px;">
        <span style="font-family:${HEAD};font-size:52px;font-weight:900;letter-spacing:0.22em;color:${ACCENT};text-transform:uppercase;">MANILA</span>
      </div>

      <!-- Main headline -->
      <div style="position:absolute;left:64px;right:64px;top:160px;">
        <h1 style="font-family:${HEAD};font-size:120px;font-weight:900;line-height:0.88;color:${TEXT};letter-spacing:-0.04em;">Models<br/>wanted.</h1>
      </div>

      <!-- Sub text -->
      <div style="position:absolute;left:64px;right:64px;top:420px;">
        <p style="font-family:${HEAD};font-size:36px;font-weight:400;color:${MUTED};line-height:1.35;">Editorial portrait shoots in Manila.<br/>No experience needed.</p>
      </div>

      <!-- Hero image with thick border -->
      <div style="position:absolute;left:64px;right:64px;top:560px;bottom:${SAFE_BOTTOM + 20}px;border:6px solid ${BORDER};overflow:hidden;">
        <img src="${images.hero}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center 15%;"/>
      </div>
    </div>
  `
}

// --- SLIDE 2: PROOF — animated version for video recording ---
// Returns full HTML document with CSS animations for staggered fade+scale reveal
function slideTwoAnimated(images) {
  const PAD = 64
  const BORDER_W = 5
  const GAP = 10
  const HEADER_BOTTOM = 260
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
  let imgIndex = 0
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const idx = row * COLS + col
      const x = PAD + col * (cellW + GAP)
      const y = HEADER_BOTTOM + row * (cellH + GAP)
      const delay = imgIndex * 0.3 // 300ms stagger
      gridHtml += `
        <div class="tile tile-${imgIndex}" style="position:absolute;left:${x}px;top:${y}px;width:${cellW}px;height:${cellH}px;border:${BORDER_W}px solid ${BORDER};overflow:hidden;opacity:0;transform:scale(0.85);animation:tileReveal 0.6s ease-out ${delay}s forwards;">
          <img src="${gridImages[idx]}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center;"/>
        </div>
      `
      imgIndex++
    }
  }

  // Return full HTML document with animation keyframes
  return `<!DOCTYPE html>
  <html>
    <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { margin: 0; padding: 0; background: ${BG}; }
        @keyframes tileReveal {
          0% { opacity: 0; transform: scale(0.85); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes headerFade {
          0% { opacity: 0; transform: translateY(-20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .header {
          opacity: 0;
          animation: headerFade 0.5s ease-out 0s forwards;
        }
      </style>
    </head>
    <body>
      <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${BG};">
        <!-- Header with fade-in animation -->
        <div class="header" style="position:absolute;left:${PAD}px;top:80px;">
          <span style="font-family:${HEAD};font-size:52px;font-weight:900;letter-spacing:0.22em;color:${ACCENT};text-transform:uppercase;">MANILA</span>
        </div>
        <div class="header" style="position:absolute;left:${PAD}px;right:${PAD}px;top:155px;">
          <h2 style="font-family:${HEAD};font-size:68px;font-weight:900;color:${TEXT};line-height:0.95;letter-spacing:-0.03em;">This is my work.</h2>
        </div>

        ${gridHtml}
      </div>
    </body>
  </html>`
}

// --- SLIDE 3: PROCESS (identical to v18) ---
function slideThree(images) {
  const PAD = 64
  const steps = [
    { num: '01', title: 'Sign up below', desc: 'Takes 60 seconds. I message you back.' },
    { num: '02', title: 'We plan together', desc: 'Pick a date, location, and vibe.' },
    { num: '03', title: 'Show up', desc: 'I guide every pose. No experience needed.' },
  ]

  let stepsHtml = ''
  const stepStartY = 300
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
      <div style="position:absolute;left:${PAD}px;top:80px;">
        <span style="font-family:${HEAD};font-size:52px;font-weight:900;letter-spacing:0.22em;color:${ACCENT};text-transform:uppercase;">MANILA</span>
      </div>

      <!-- Header -->
      <div style="position:absolute;left:${PAD}px;right:${PAD}px;top:155px;">
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

// --- SLIDE 4: CTA (identical to v18) ---
function slideFour(images) {
  const PAD = 64
  const IMG_BOTTOM = 1020
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${BG};">
      <!-- Hero image top portion -->
      <div style="position:absolute;left:${PAD}px;right:${PAD}px;top:80px;height:${IMG_BOTTOM - 80}px;border:6px solid ${BORDER};overflow:hidden;">
        <img src="${images.cta}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center 20%;"/>
      </div>

      <!-- MANILA accent -->
      <div style="position:absolute;left:${PAD}px;top:${IMG_BOTTOM + 40}px;">
        <span style="font-family:${HEAD};font-size:52px;font-weight:900;letter-spacing:0.22em;color:${ACCENT};text-transform:uppercase;">MANILA</span>
      </div>

      <!-- CTA headline -->
      <div style="position:absolute;left:${PAD}px;right:${PAD}px;top:${IMG_BOTTOM + 115}px;">
        <h2 style="font-family:${HEAD};font-size:96px;font-weight:900;color:${TEXT};line-height:0.9;letter-spacing:-0.04em;">Sign up<br/>below.</h2>
      </div>

      <!-- CTA sub -->
      <div style="position:absolute;left:${PAD}px;right:${PAD}px;top:${IMG_BOTTOM + 310}px;">
        <p style="font-family:${HEAD};font-size:32px;font-weight:400;color:${MUTED};line-height:1.35;">60-second form. I'll message you back within a day.</p>
      </div>

      <!-- Urgency pill -->
      <div style="position:absolute;left:${PAD}px;top:${IMG_BOTTOM + 395}px;display:inline-flex;align-items:center;padding:14px 28px;border:3px solid ${BORDER};background:${TEXT};">
        <span style="font-family:${HEAD};font-size:26px;font-weight:900;color:${BG};letter-spacing:0.06em;text-transform:uppercase;">Limited spots this month</span>
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
    gridE: 'manila-gallery-graffiti-001.jpg',      // portrait
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

  // --- Render static slides (1, 3, 4) as PNGs ---
  const staticSlides = [
    ['01_hook_story.png', wrap(slideOne(images))],
    ['03_process_story.png', wrap(slideThree(images))],
    ['04_cta_story.png', wrap(slideFour(images))]
  ]

  const browser = await chromium.launch()
  const staticCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1
  })

  for (const [filename, html] of staticSlides) {
    const page = await staticCtx.newPage()
    await page.setContent(html, { waitUntil: 'load' })
    await page.waitForTimeout(300)
    await page.screenshot({ path: path.join(OUT_DIR, filename), type: 'png' })
    await page.close()
    console.log(`Rendered ${filename}`)
  }
  await staticCtx.close()

  // --- Render slide 2 as animated MP4 video ---
  console.log('Recording animated proof slide as MP4...')

  // 9 images * 300ms stagger = 2700ms for last image to start
  // + 600ms animation duration = 3300ms for last image to finish
  // + 1200ms hold = ~4500ms total (~4.5 seconds)
  const TOTAL_DURATION_MS = 5000

  const videoCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: OUT_DIR,
      size: { width: WIDTH, height: HEIGHT }
    }
  })

  const videoPage = await videoCtx.newPage()

  // Load page with all tiles initially hidden (animation hasn't started yet)
  const animatedHtml = slideTwoAnimated(images)
  await videoPage.setContent(animatedHtml, { waitUntil: 'load' })

  // Wait for all images to load before animations begin
  await videoPage.waitForTimeout(500)

  // Wait for the full animation duration + hold time
  await videoPage.waitForTimeout(TOTAL_DURATION_MS)

  // Close the page to finalize the video
  await videoPage.close()
  await videoCtx.close()

  // Playwright saves video with an auto-generated name; find and rename it
  const videoFiles = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.webm'))
  if (videoFiles.length === 0) {
    console.error('No video file was generated!')
  } else {
    const srcVideo = path.join(OUT_DIR, videoFiles[0])
    const dstVideo = path.join(OUT_DIR, '02_proof_story.mp4')

    // Playwright records as WebM; convert to H.264 MP4 using ffmpeg
    const { execSync } = await import('child_process')
    try {
      execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${dstVideo}"`, {
        stdio: 'pipe'
      })
      fs.unlinkSync(srcVideo) // Remove the original webm
      console.log('Rendered 02_proof_story.mp4')
    } catch (err) {
      // If ffmpeg is not available, just rename the webm
      console.warn('ffmpeg not available, keeping as webm and renaming to mp4...')
      fs.renameSync(srcVideo, dstVideo)
      console.log('Rendered 02_proof_story.mp4 (webm container)')
    }
  }

  await browser.close()
  console.log(`Done: 3 static PNGs + 1 animated MP4 written to ${OUT_DIR}`)
}

render().catch(error => {
  console.error(error)
  process.exit(1)
})
