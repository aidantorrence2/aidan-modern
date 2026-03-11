import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v33')

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 410

const BOLD = "'Avenir Next', 'Helvetica Neue', Arial, sans-serif"
const BODY = "'Avenir Next', 'Helvetica Neue', Arial, sans-serif"
const MONO = "'Courier New', Courier, monospace"

// Kodak-inspired warm palette
const FILM_BG = '#1a1410'       // Very dark warm brown (like film canister)
const FILM_BORDER = '#2a2218'   // Film strip border color
const FILM_AMBER = '#F5C518'    // Kodak yellow/gold
const FILM_CREAM = '#FFF8E7'    // Warm cream for text
const FILM_ORANGE = '#E8913A'   // Warm orange accent
const SPROCKET_COLOR = '#0d0b08' // Dark sprocket hole color

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
    strategy: 'v33 — 35mm Film Strip analog photography aesthetic, Kodak-inspired warm palette',
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
        html, body { margin: 0; padding: 0; background: ${FILM_BG}; }
      </style>
    </head>
    <body>${html}</body>
  </html>`
}

// Generate sprocket holes HTML for left and right sides of a film strip
function sprocketHoles(top, height, holeSize = 28, gap = 18) {
  let html = ''
  const totalPerSide = Math.floor((height - gap) / (holeSize + gap))
  const startY = top + gap
  for (let i = 0; i < totalPerSide; i++) {
    const y = startY + i * (holeSize + gap)
    // Left sprocket
    html += `<div style="position:absolute;left:18px;top:${y}px;width:${holeSize}px;height:${holeSize}px;border-radius:4px;background:${SPROCKET_COLOR};"></div>`
    // Right sprocket
    html += `<div style="position:absolute;right:18px;top:${y}px;width:${holeSize}px;height:${holeSize}px;border-radius:4px;background:${SPROCKET_COLOR};"></div>`
  }
  return html
}

// Film grain overlay (CSS noise pattern)
function grainOverlay() {
  return `<div style="position:absolute;inset:0;opacity:0.06;background-image:url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 200 200%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/></svg>');background-size:150px 150px;pointer-events:none;mix-blend-mode:overlay;"></div>`
}

// Film frame border around an image
function filmFrame(imgSrc, x, y, w, h, frameNum = '') {
  const borderW = 8
  const innerW = w - borderW * 2
  const innerH = h - borderW * 2 - (frameNum ? 28 : 0)
  let html = `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;background:${FILM_BORDER};border:2px solid #3a3228;">`
  html += `<div style="position:absolute;left:${borderW}px;top:${borderW}px;width:${innerW}px;height:${innerH}px;overflow:hidden;">
    <img src="${imgSrc}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center;filter:saturate(1.15) contrast(1.05) sepia(0.08);"/>
  </div>`
  if (frameNum) {
    html += `<div style="position:absolute;left:${borderW + 4}px;bottom:4px;font-family:${MONO};font-size:14px;color:${FILM_ORANGE};letter-spacing:0.08em;">${frameNum}</div>`
    html += `<div style="position:absolute;right:${borderW + 4}px;bottom:4px;font-family:${MONO};font-size:14px;color:${FILM_ORANGE};letter-spacing:0.08em;">KODAK 400</div>`
  }
  html += '</div>'
  return html
}

// ============================================================
// SLIDE 1: HOOK -- "MANILA" huge + single film frame with hero
// ============================================================
function slideOne(images) {
  const STRIP_LEFT = 64
  const STRIP_WIDTH = WIDTH - STRIP_LEFT * 2
  const STRIP_TOP = 0
  const STRIP_HEIGHT = HEIGHT

  // Film frame for hero image
  const frameX = 120
  const frameY = 620
  const frameW = WIDTH - 240
  const frameH = 780

  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${FILM_BG};">
      <!-- Film strip background -->
      <div style="position:absolute;left:${STRIP_LEFT}px;top:${STRIP_TOP}px;width:${STRIP_WIDTH}px;height:${STRIP_HEIGHT}px;background:${FILM_BORDER};border-left:3px solid #3a3228;border-right:3px solid #3a3228;"></div>
      ${sprocketHoles(STRIP_TOP, STRIP_HEIGHT)}

      <!-- Top area: MANILA huge -->
      <div style="position:absolute;left:0;right:0;top:80px;text-align:center;">
        <p style="font-family:${MONO};font-size:18px;font-weight:400;letter-spacing:0.4em;text-transform:uppercase;color:${FILM_ORANGE};margin:0 0 12px;opacity:0.8;">35MM EDITORIAL</p>
        <h1 style="font-family:${BOLD};font-size:120px;font-weight:900;letter-spacing:0.08em;text-transform:uppercase;color:${FILM_AMBER};margin:0;line-height:0.9;text-shadow:0 0 40px rgba(245,197,24,0.3);">MANILA</h1>
        <p style="font-family:${BOLD};font-size:54px;font-weight:800;color:${FILM_CREAM};margin:20px 0 0;line-height:1;letter-spacing:-0.02em;">Models wanted.</p>
        <p style="font-family:${BODY};font-size:28px;font-weight:400;color:rgba(255,248,231,0.6);margin:14px 0 0;line-height:1.4;">No experience needed.</p>
      </div>

      <!-- Hero film frame -->
      ${filmFrame(images.hero, frameX, frameY, frameW, frameH, 'FRAME 01/36')}

      <!-- Bottom film code text -->
      <div style="position:absolute;left:120px;bottom:${SAFE_BOTTOM + 20}px;">
        <p style="font-family:${MONO};font-size:16px;color:${FILM_ORANGE};opacity:0.6;margin:0;letter-spacing:0.12em;">MANILA-001  DX 135-36  ISO 400</p>
      </div>

      ${grainOverlay()}
    </div>
  `
}

// ============================================================
// SLIDE 2: ANIMATED -- vertical film strip scrolls through frames
// ============================================================
function slideTwoAnimated(images) {
  const stripImages = [
    images.gridA, images.gridB, images.gridC, images.gridD,
    images.gridE, images.gridF, images.gridG, images.gridH,
  ]

  const FRAME_W = 720
  const FRAME_H = 540
  const FRAME_GAP = 24
  const FRAME_X = (WIDTH - FRAME_W) / 2
  const BORDER = 8

  // Total strip height: all frames stacked
  const totalFrames = stripImages.length
  const stripTotalH = totalFrames * (FRAME_H + FRAME_GAP)

  // Visible area for the strip (between header and safe bottom)
  const VISIBLE_TOP = 280
  const VISIBLE_BOTTOM = HEIGHT - SAFE_BOTTOM - 20
  const VISIBLE_H = VISIBLE_BOTTOM - VISIBLE_TOP

  // Build the film strip frames
  let framesHtml = ''
  for (let i = 0; i < totalFrames; i++) {
    const fy = i * (FRAME_H + FRAME_GAP)
    const innerW = FRAME_W - BORDER * 2
    const innerH = FRAME_H - BORDER * 2 - 28

    framesHtml += `<div style="position:absolute;left:0;top:${fy}px;width:${FRAME_W}px;height:${FRAME_H}px;background:${FILM_BORDER};border:2px solid #3a3228;">
      <div style="position:absolute;left:${BORDER}px;top:${BORDER}px;width:${innerW}px;height:${innerH}px;overflow:hidden;">
        <img src="${stripImages[i]}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center;filter:saturate(1.15) contrast(1.05) sepia(0.08);"/>
      </div>
      <div style="position:absolute;left:${BORDER + 4}px;bottom:4px;font-family:${MONO};font-size:13px;color:${FILM_ORANGE};letter-spacing:0.08em;">FRAME ${String(i + 5).padStart(2, '0')}/36</div>
      <div style="position:absolute;right:${BORDER + 4}px;bottom:4px;font-family:${MONO};font-size:13px;color:${FILM_ORANGE};letter-spacing:0.08em;">KODAK 400</div>
    </div>`
  }

  // Sprocket holes for the strip (on each side of the scrolling strip)
  let sprocketsHtml = ''
  const sprocketSize = 22
  const sprocketGap = 14
  const numSprockets = Math.floor(stripTotalH / (sprocketSize + sprocketGap))
  for (let i = 0; i < numSprockets; i++) {
    const sy = i * (sprocketSize + sprocketGap) + 8
    sprocketsHtml += `<div style="position:absolute;left:-36px;top:${sy}px;width:${sprocketSize}px;height:${sprocketSize}px;border-radius:3px;background:${SPROCKET_COLOR};"></div>`
    sprocketsHtml += `<div style="position:absolute;right:-36px;top:${sy}px;width:${sprocketSize}px;height:${sprocketSize}px;border-radius:3px;background:${SPROCKET_COLOR};"></div>`
  }

  // The scroll distance: we want to scroll from frame 0 to the last frame
  // so the last frame is visible in the viewport
  const scrollDistance = stripTotalH - VISIBLE_H

  // Animation: scroll up, pausing at each frame
  // Total time: ~6 seconds
  // Each frame gets a brief pause
  const TOTAL_DURATION = 7 // seconds
  const pausePerFrame = 0.6 // seconds pause per frame
  const scrollPerFrame = 0.3 // seconds scrolling between frames

  // Build keyframes
  let keyframes = '0% { transform: translateY(0); }\n'
  let currentTime = 0.3 // small initial delay
  for (let i = 0; i < totalFrames; i++) {
    const targetY = Math.min(i * (FRAME_H + FRAME_GAP), scrollDistance)
    const arrivePercent = (currentTime / TOTAL_DURATION) * 100
    const holdPercent = ((currentTime + pausePerFrame) / TOTAL_DURATION) * 100

    if (arrivePercent <= 100) {
      keyframes += `${Math.min(arrivePercent, 100).toFixed(1)}% { transform: translateY(-${targetY}px); }\n`
    }
    if (holdPercent <= 100 && i < totalFrames - 1) {
      keyframes += `${Math.min(holdPercent, 100).toFixed(1)}% { transform: translateY(-${targetY}px); }\n`
    }
    currentTime += pausePerFrame + scrollPerFrame
  }
  keyframes += `100% { transform: translateY(-${scrollDistance}px); }\n`

  return `<!DOCTYPE html>
  <html>
    <head>
      <style>
        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; background: ${FILM_BG}; }
        @keyframes filmScroll {
          ${keyframes}
        }
        @keyframes headerFade {
          0% { opacity: 0; transform: translateY(-20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .header {
          opacity: 0;
          animation: headerFade 0.5s ease-out 0s forwards;
        }
        .film-strip-container {
          animation: filmScroll ${TOTAL_DURATION}s ease-in-out 0.5s forwards;
        }
      </style>
    </head>
    <body>
      <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${FILM_BG};">
        <!-- Film strip side rails -->
        <div style="position:absolute;left:${FRAME_X - 42}px;top:0;width:${FRAME_W + 84}px;height:${HEIGHT}px;background:${FILM_BORDER};border-left:3px solid #3a3228;border-right:3px solid #3a3228;opacity:0.5;"></div>

        <!-- Header -->
        <div class="header" style="position:absolute;left:0;right:0;top:60px;text-align:center;z-index:10;">
          <h1 style="font-family:${BOLD};font-size:100px;font-weight:900;letter-spacing:0.08em;text-transform:uppercase;color:${FILM_AMBER};margin:0;line-height:0.9;text-shadow:0 0 40px rgba(245,197,24,0.3);">MANILA</h1>
          <p style="font-family:${BODY};font-size:34px;font-weight:600;color:${FILM_CREAM};margin:14px 0 0;line-height:1;">This is my work.</p>
        </div>

        <!-- Top fade mask -->
        <div style="position:absolute;left:0;right:0;top:0;height:${VISIBLE_TOP + 40}px;background:linear-gradient(180deg, ${FILM_BG} 70%, transparent 100%);z-index:5;pointer-events:none;"></div>
        <!-- Bottom fade mask -->
        <div style="position:absolute;left:0;right:0;bottom:0;height:${HEIGHT - VISIBLE_BOTTOM + 60}px;background:linear-gradient(0deg, ${FILM_BG} 70%, transparent 100%);z-index:5;pointer-events:none;"></div>

        <!-- Scrollable film strip viewport -->
        <div style="position:absolute;left:${FRAME_X}px;top:${VISIBLE_TOP}px;width:${FRAME_W}px;height:${VISIBLE_H}px;overflow:hidden;">
          <div class="film-strip-container" style="position:relative;width:${FRAME_W}px;height:${stripTotalH}px;">
            ${sprocketsHtml}
            ${framesHtml}
          </div>
        </div>

        <!-- Bottom film code -->
        <div style="position:absolute;left:0;right:0;bottom:${SAFE_BOTTOM + 20}px;text-align:center;z-index:10;">
          <p style="font-family:${MONO};font-size:15px;color:${FILM_ORANGE};opacity:0.5;margin:0;letter-spacing:0.12em;">ROLL 02  MANILA PORTRAITS  ISO 400</p>
        </div>

        ${grainOverlay()}
      </div>
    </body>
  </html>`
}

// ============================================================
// SLIDE 3: PROCESS -- 3 film frames with step text on borders
// ============================================================
function slideThree(images) {
  const processImages = [images.processA, images.processB, images.processC]
  const steps = [
    { num: '01', title: 'Sign up below', desc: 'Takes 60 seconds. I message you back.' },
    { num: '02', title: 'We pick a date', desc: 'Location, vibe, and look -- planned together.' },
    { num: '03', title: 'Show up. I direct.', desc: 'No experience needed. You just show up.' },
  ]

  const FRAME_W = WIDTH - 160
  const FRAME_IMG_H = 260
  const FRAME_TOTAL_H = FRAME_IMG_H + 100 // image + text area on border
  const FRAME_X = 80
  const BORDER = 8
  const START_Y = 360
  const FRAME_GAP = 30

  let framesHtml = ''
  for (let i = 0; i < 3; i++) {
    const fy = START_Y + i * (FRAME_TOTAL_H + FRAME_GAP)
    const innerW = FRAME_W - BORDER * 2
    const innerImgH = FRAME_IMG_H - BORDER

    framesHtml += `<div style="position:absolute;left:${FRAME_X}px;top:${fy}px;width:${FRAME_W}px;height:${FRAME_TOTAL_H}px;background:${FILM_BORDER};border:2px solid #3a3228;">
      <!-- Image area -->
      <div style="position:absolute;left:${BORDER}px;top:${BORDER}px;width:${innerW}px;height:${innerImgH}px;overflow:hidden;">
        <img src="${processImages[i]}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center;filter:saturate(1.15) contrast(1.05) sepia(0.08);"/>
      </div>
      <!-- Text on film border area -->
      <div style="position:absolute;left:${BORDER + 8}px;top:${FRAME_IMG_H + 4}px;right:${BORDER + 8}px;">
        <div style="display:flex;align-items:baseline;gap:12px;margin-bottom:4px;">
          <span style="font-family:${MONO};font-size:22px;font-weight:700;color:${FILM_AMBER};letter-spacing:0.06em;">STEP ${steps[i].num}</span>
          <span style="font-family:${BOLD};font-size:28px;font-weight:700;color:${FILM_CREAM};letter-spacing:-0.01em;">${steps[i].title}</span>
        </div>
        <p style="font-family:${BODY};font-size:20px;color:rgba(255,248,231,0.55);margin:0;line-height:1.3;">${steps[i].desc}</p>
      </div>
      <!-- Frame number -->
      <div style="position:absolute;right:${BORDER + 4}px;top:${FRAME_IMG_H + 6}px;font-family:${MONO};font-size:12px;color:${FILM_ORANGE};opacity:0.5;letter-spacing:0.08em;">${String(20 + i * 5).padStart(2,'0')}/36</div>
    </div>`
  }

  // Sprocket holes
  const stripLeft = 40
  const stripWidth = WIDTH - 80

  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${FILM_BG};">
      <!-- Film strip background -->
      <div style="position:absolute;left:${stripLeft}px;top:0;width:${stripWidth}px;height:${HEIGHT}px;background:${FILM_BORDER};border-left:3px solid #3a3228;border-right:3px solid #3a3228;opacity:0.4;"></div>
      ${sprocketHoles(0, HEIGHT, 24, 16)}

      <!-- Header -->
      <div style="position:absolute;left:0;right:0;top:70px;text-align:center;">
        <h1 style="font-family:${BOLD};font-size:100px;font-weight:900;letter-spacing:0.08em;text-transform:uppercase;color:${FILM_AMBER};margin:0;line-height:0.9;text-shadow:0 0 40px rgba(245,197,24,0.3);">MANILA</h1>
        <p style="font-family:${BOLD};font-size:42px;font-weight:700;color:${FILM_CREAM};margin:16px 0 0;line-height:1;">3 easy steps.</p>
      </div>

      ${framesHtml}

      ${grainOverlay()}
    </div>
  `
}

// ============================================================
// SLIDE 4: CTA -- hero in film frame + "sign up below" + 36/36
// ============================================================
function slideFour(images) {
  const frameX = 100
  const frameY = 520
  const frameW = WIDTH - 200
  const frameH = 700
  const BORDER = 10

  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${FILM_BG};">
      <!-- Film strip background -->
      <div style="position:absolute;left:54px;top:0;width:${WIDTH - 108}px;height:${HEIGHT}px;background:${FILM_BORDER};border-left:3px solid #3a3228;border-right:3px solid #3a3228;opacity:0.4;"></div>
      ${sprocketHoles(0, HEIGHT)}

      <!-- Header -->
      <div style="position:absolute;left:0;right:0;top:70px;text-align:center;">
        <h1 style="font-family:${BOLD};font-size:110px;font-weight:900;letter-spacing:0.08em;text-transform:uppercase;color:${FILM_AMBER};margin:0;line-height:0.9;text-shadow:0 0 40px rgba(245,197,24,0.3);">MANILA</h1>
        <p style="font-family:${BOLD};font-size:64px;font-weight:800;color:${FILM_CREAM};margin:24px 0 0;line-height:1;letter-spacing:-0.02em;">Sign up below.</p>
        <p style="font-family:${BODY};font-size:26px;font-weight:400;color:rgba(255,248,231,0.6);margin:16px 0 0;line-height:1.4;">60-second form. I'll message you back.</p>
      </div>

      <!-- Hero film frame -->
      <div style="position:absolute;left:${frameX}px;top:${frameY}px;width:${frameW}px;height:${frameH}px;background:${FILM_BORDER};border:2px solid #3a3228;">
        <div style="position:absolute;left:${BORDER}px;top:${BORDER}px;width:${frameW - BORDER * 2}px;height:${frameH - BORDER * 2 - 32}px;overflow:hidden;">
          <img src="${images.cta}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center;filter:saturate(1.15) contrast(1.05) sepia(0.08);"/>
        </div>
        <div style="position:absolute;left:${BORDER + 4}px;bottom:6px;font-family:${MONO};font-size:15px;color:${FILM_AMBER};letter-spacing:0.08em;font-weight:700;">36/36  LAST FRAME</div>
        <div style="position:absolute;right:${BORDER + 4}px;bottom:6px;font-family:${MONO};font-size:15px;color:${FILM_ORANGE};letter-spacing:0.08em;">END OF ROLL</div>
      </div>

      <!-- Urgency badge -->
      <div style="position:absolute;left:0;right:0;bottom:${SAFE_BOTTOM + 30}px;text-align:center;">
        <div style="display:inline-flex;align-items:center;gap:10px;padding:14px 28px;border-radius:8px;background:rgba(245,197,24,0.12);border:1px solid rgba(245,197,24,0.3);">
          <div style="width:10px;height:10px;border-radius:50%;background:${FILM_AMBER};"></div>
          <span style="font-family:${MONO};font-size:20px;font-weight:700;color:${FILM_AMBER};letter-spacing:0.14em;text-transform:uppercase;">Limited spots this month</span>
        </div>
      </div>

      ${grainOverlay()}
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
    gridF: 'manila-gallery-graffiti-001.jpg',
    gridG: 'manila-gallery-urban-001.jpg',
    gridH: 'manila-gallery-shadow-001.jpg',
    processA: 'manila-gallery-ivy-001.jpg',
    processB: 'manila-gallery-canal-002.jpg',
    processC: 'manila-gallery-tropical-001.jpg',
    cta: 'manila-gallery-floor-001.jpg'
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
    await page.waitForTimeout(200)
    await page.screenshot({ path: path.join(OUT_DIR, filename), type: 'png' })
    await page.close()
    console.log(`Rendered ${filename}`)
  }
  await staticCtx.close()

  // --- Render slide 2 as animated MP4 video ---
  console.log('Recording animated film strip slide as MP4...')

  const TOTAL_DURATION_MS = 9000 // ~9 seconds for scroll + holds

  const videoCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: OUT_DIR,
      size: { width: WIDTH, height: HEIGHT }
    }
  })

  const videoPage = await videoCtx.newPage()
  const animatedHtml = slideTwoAnimated(images)
  await videoPage.setContent(animatedHtml, { waitUntil: 'load' })
  await videoPage.waitForTimeout(500)
  await videoPage.waitForTimeout(TOTAL_DURATION_MS)

  await videoPage.close()
  await videoCtx.close()

  // Convert webm to mp4
  const videoFiles = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.webm'))
  if (videoFiles.length === 0) {
    console.error('No video file was generated!')
  } else {
    const srcVideo = path.join(OUT_DIR, videoFiles[0])
    const dstVideo = path.join(OUT_DIR, '02_filmstrip_story.mp4')

    const { execSync } = await import('child_process')
    try {
      execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${dstVideo}"`, {
        stdio: 'pipe'
      })
      fs.unlinkSync(srcVideo)
      console.log('Rendered 02_filmstrip_story.mp4')
    } catch (err) {
      console.warn('ffmpeg not available, keeping as webm and renaming to mp4...')
      fs.renameSync(srcVideo, dstVideo)
      console.log('Rendered 02_filmstrip_story.mp4 (webm container)')
    }
  }

  await browser.close()
  console.log(`Done: 3 static PNGs + 1 animated MP4 written to ${OUT_DIR}`)
}

render().catch(error => {
  console.error(error)
  process.exit(1)
})
