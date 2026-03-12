import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'
import { execSync } from 'child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v39')

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 410

const BOLD = "'Avenir Next', 'Helvetica Neue', Arial, sans-serif"
const BODY = "'Avenir Next', 'Helvetica Neue', Arial, sans-serif"
const MONO = "'Courier New', Courier, monospace"

// Deeper analog film palette
const FILM_BG = '#100e0a'
const FILM_BORDER = '#252017'
const FILM_AMBER = '#F5C518'
const FILM_CREAM = '#FFF8E7'
const FILM_ORANGE = '#D4943A'
const SPROCKET_COLOR = '#080604'

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

function getTopManilaImages(count = 28) {
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

// Get real image dimensions
function getImageSize(name) {
  const filePath = path.join(IMAGE_DIR, name)
  const wStr = execSync(`sips -g pixelWidth "${filePath}" | awk '/pixelWidth/{print $2}'`).toString().trim()
  const hStr = execSync(`sips -g pixelHeight "${filePath}" | awk '/pixelHeight/{print $2}'`).toString().trim()
  return { w: parseInt(wStr), h: parseInt(hStr), ratio: parseInt(wStr) / parseInt(hStr) }
}

function writeSources(selected) {
  const payload = {
    createdAt: new Date().toISOString(),
    strategy: 'v39 — Enhanced 35mm film strip, full uncropped images, deeper analog aesthetic',
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

// Sprocket holes
function sprocketHoles(top, height, holeSize = 24, gap = 16) {
  let html = ''
  const count = Math.floor((height - gap) / (holeSize + gap))
  for (let i = 0; i < count; i++) {
    const y = top + gap + i * (holeSize + gap)
    html += `<div style="position:absolute;left:16px;top:${y}px;width:${holeSize}px;height:${holeSize}px;border-radius:3px;background:${SPROCKET_COLOR};"></div>`
    html += `<div style="position:absolute;right:16px;top:${y}px;width:${holeSize}px;height:${holeSize}px;border-radius:3px;background:${SPROCKET_COLOR};"></div>`
  }
  return html
}

// Film grain overlay — heavier for more analog feel
function grainOverlay() {
  return `<div style="position:absolute;inset:0;opacity:0.09;background-image:url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 200 200%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%225%22 stitchTiles=%22stitch%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/></svg>');background-size:120px 120px;pointer-events:none;mix-blend-mode:overlay;"></div>`
}

// Light leak overlay for warm analog feel
function lightLeak(side = 'left') {
  if (side === 'left') {
    return `<div style="position:absolute;left:0;top:20%;width:30%;height:40%;background:radial-gradient(ellipse at left center, rgba(245,197,24,0.06), transparent 70%);pointer-events:none;"></div>`
  }
  return `<div style="position:absolute;right:0;top:30%;width:25%;height:35%;background:radial-gradient(ellipse at right center, rgba(232,145,58,0.05), transparent 70%);pointer-events:none;"></div>`
}

// Film edge markings (like real 35mm film has printed on the rebate)
function filmEdgeText(text, y, side = 'left') {
  const pos = side === 'left' ? `left:52px;` : `right:52px;`
  return `<div style="position:absolute;${pos}top:${y}px;font-family:${MONO};font-size:11px;color:${FILM_ORANGE};opacity:0.35;letter-spacing:0.15em;writing-mode:vertical-lr;text-orientation:mixed;transform:rotate(180deg);">${text}</div>`
}

// ── Slide 1: HOOK ──
function slideOne(images) {
  const frameX = 90
  const frameW = WIDTH - 180
  const frameY = 560
  const frameH = 860
  const BORDER = 10

  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${FILM_BG};">
      <!-- Film strip bg -->
      <div style="position:absolute;left:56px;top:0;width:${WIDTH - 112}px;height:${HEIGHT}px;background:${FILM_BORDER};border-left:3px solid #3a3228;border-right:3px solid #3a3228;"></div>
      ${sprocketHoles(0, HEIGHT)}

      <!-- Film edge markings -->
      ${filmEdgeText('KODAK  PORTRA 400', 200, 'left')}
      ${filmEdgeText('135-36  DX', 600, 'right')}

      <!-- Top: kicker + MANILA -->
      <div style="position:absolute;left:0;right:0;top:70px;text-align:center;">
        <p style="font-family:${MONO};font-size:16px;font-weight:400;letter-spacing:0.5em;text-transform:uppercase;color:${FILM_ORANGE};margin:0 0 14px;opacity:0.7;">SHOT ON FILM</p>
        <h1 style="font-family:${BOLD};font-size:130px;font-weight:900;letter-spacing:0.06em;text-transform:uppercase;color:${FILM_AMBER};margin:0;line-height:0.85;text-shadow:0 0 60px rgba(245,197,24,0.25), 0 0 120px rgba(245,197,24,0.1);">MANILA</h1>
        <p style="font-family:${BOLD};font-size:50px;font-weight:700;color:${FILM_CREAM};margin:20px 0 0;line-height:1;letter-spacing:-0.01em;">Models wanted.</p>
        <p style="font-family:${BODY};font-size:26px;font-weight:400;color:rgba(255,248,231,0.5);margin:14px 0 0;">No experience needed. I direct the whole shoot.</p>
      </div>

      <!-- Hero film frame — full image, no crop -->
      <div style="position:absolute;left:${frameX}px;top:${frameY}px;width:${frameW}px;height:${frameH}px;background:${FILM_BORDER};border:2px solid #3a3228;">
        <div style="position:absolute;left:${BORDER}px;top:${BORDER}px;width:${frameW - BORDER * 2}px;height:${frameH - BORDER * 2 - 32}px;overflow:hidden;background:#0a0806;">
          <img src="${images.hero}" style="width:100%;height:100%;display:block;object-fit:contain;filter:saturate(1.2) contrast(1.08) sepia(0.06);"/>
        </div>
        <div style="position:absolute;left:${BORDER + 6}px;bottom:6px;font-family:${MONO};font-size:14px;color:${FILM_AMBER};letter-spacing:0.1em;">01</div>
        <div style="position:absolute;left:${BORDER + 50}px;bottom:6px;font-family:${MONO};font-size:11px;color:${FILM_ORANGE};letter-spacing:0.06em;opacity:0.6;">PORTRA 400  MANILA-001</div>
        <div style="position:absolute;right:${BORDER + 6}px;bottom:6px;font-family:${MONO};font-size:14px;color:${FILM_AMBER};letter-spacing:0.1em;">01A</div>
      </div>

      <!-- Bottom DX code -->
      <div style="position:absolute;left:90px;bottom:${SAFE_BOTTOM + 15}px;">
        <p style="font-family:${MONO};font-size:13px;color:${FILM_ORANGE};opacity:0.4;margin:0;letter-spacing:0.14em;">DX 135-36  KODAK PORTRA 400  MANILA PORTRAITS  E01</p>
      </div>

      ${lightLeak('left')}
      ${lightLeak('right')}
      ${grainOverlay()}
    </div>
  `
}

// ── Slide 2: ANIMATED FILM SCROLL — full-size uncropped images ──
function slideTwoAnimated(images, imageSizes) {
  const stripImages = images.strip
  const sizes = imageSizes.strip

  // Film strip: each frame shows the full image at its natural aspect ratio
  // Frame width is fixed, height varies per image
  const FRAME_INNER_W = 700
  const BORDER = 10
  const FRAME_W = FRAME_INNER_W + BORDER * 2
  const FRAME_X = (WIDTH - FRAME_W) / 2
  const FRAME_GAP = 20
  const REBATE_H = 30 // space for frame numbers at bottom of each frame

  // Calculate frame heights based on real aspect ratios
  const frameHeights = sizes.map(s => {
    const imgH = Math.round(FRAME_INNER_W / s.ratio)
    return imgH + BORDER * 2 + REBATE_H
  })

  // Build frames
  let framesHtml = ''
  let currentY = 0
  const frameYPositions = []

  for (let i = 0; i < stripImages.length; i++) {
    frameYPositions.push(currentY)
    const fh = frameHeights[i]
    const imgH = fh - BORDER * 2 - REBATE_H

    framesHtml += `<div style="position:absolute;left:0;top:${currentY}px;width:${FRAME_W}px;height:${fh}px;background:${FILM_BORDER};border:2px solid #3a3228;">
      <div style="position:absolute;left:${BORDER}px;top:${BORDER}px;width:${FRAME_INNER_W}px;height:${imgH}px;overflow:hidden;background:#0a0806;">
        <img src="${stripImages[i]}" style="width:100%;height:100%;display:block;object-fit:contain;filter:saturate(1.2) contrast(1.08) sepia(0.06);"/>
      </div>
      <div style="position:absolute;left:${BORDER + 6}px;bottom:5px;font-family:${MONO};font-size:12px;color:${FILM_AMBER};letter-spacing:0.1em;">${String(i + 2).padStart(2, '0')}</div>
      <div style="position:absolute;left:${BORDER + 50}px;bottom:5px;font-family:${MONO};font-size:10px;color:${FILM_ORANGE};opacity:0.5;letter-spacing:0.06em;">PORTRA 400</div>
      <div style="position:absolute;right:${BORDER + 6}px;bottom:5px;font-family:${MONO};font-size:12px;color:${FILM_AMBER};letter-spacing:0.1em;">${String(i + 2).padStart(2, '0')}A</div>
    </div>`

    currentY += fh + FRAME_GAP
  }

  const stripTotalH = currentY

  // Sprocket holes for the strip
  let sprocketsHtml = ''
  const sprocketSize = 20
  const sprocketGap = 12
  const numSprockets = Math.floor(stripTotalH / (sprocketSize + sprocketGap))
  for (let i = 0; i < numSprockets; i++) {
    const sy = i * (sprocketSize + sprocketGap) + 6
    sprocketsHtml += `<div style="position:absolute;left:-34px;top:${sy}px;width:${sprocketSize}px;height:${sprocketSize}px;border-radius:3px;background:${SPROCKET_COLOR};"></div>`
    sprocketsHtml += `<div style="position:absolute;right:-34px;top:${sy}px;width:${sprocketSize}px;height:${sprocketSize}px;border-radius:3px;background:${SPROCKET_COLOR};"></div>`
  }

  // Visible viewport
  const VISIBLE_TOP = 260
  const VISIBLE_BOTTOM = HEIGHT - SAFE_BOTTOM - 20
  const VISIBLE_H = VISIBLE_BOTTOM - VISIBLE_TOP

  const scrollDistance = Math.max(0, stripTotalH - VISIBLE_H)

  // Animation: smooth scroll with pauses at each frame
  const TOTAL_DURATION = 10
  const pausePerFrame = 0.5
  const scrollPerFrame = 0.35

  let keyframes = '0% { transform: translateY(0); }\n'
  let t = 0.2
  for (let i = 0; i < stripImages.length; i++) {
    const targetY = Math.min(frameYPositions[i], scrollDistance)
    const arriveP = (t / TOTAL_DURATION) * 100
    const holdP = ((t + pausePerFrame) / TOTAL_DURATION) * 100

    if (arriveP <= 100) {
      keyframes += `${Math.min(arriveP, 100).toFixed(1)}% { transform: translateY(-${targetY}px); }\n`
    }
    if (holdP <= 100 && i < stripImages.length - 1) {
      keyframes += `${Math.min(holdP, 100).toFixed(1)}% { transform: translateY(-${targetY}px); }\n`
    }
    t += pausePerFrame + scrollPerFrame
  }
  keyframes += `100% { transform: translateY(-${scrollDistance}px); }\n`

  return `<!DOCTYPE html>
  <html>
    <head>
      <style>
        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; background: ${FILM_BG}; }
        @keyframes filmScroll { ${keyframes} }
        @keyframes headerFade {
          0% { opacity: 0; transform: translateY(-15px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .header { opacity: 0; animation: headerFade 0.4s ease-out 0s forwards; }
        .film-strip { animation: filmScroll ${TOTAL_DURATION}s ease-in-out 0.4s forwards; }
      </style>
    </head>
    <body>
      <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${FILM_BG};">
        <!-- Film strip rail bg -->
        <div style="position:absolute;left:${FRAME_X - 40}px;top:0;width:${FRAME_W + 80}px;height:${HEIGHT}px;background:${FILM_BORDER};border-left:3px solid #3a3228;border-right:3px solid #3a3228;opacity:0.4;"></div>

        <!-- Header -->
        <div class="header" style="position:absolute;left:0;right:0;top:50px;text-align:center;z-index:10;">
          <h1 style="font-family:${BOLD};font-size:100px;font-weight:900;letter-spacing:0.06em;text-transform:uppercase;color:${FILM_AMBER};margin:0;line-height:0.85;text-shadow:0 0 50px rgba(245,197,24,0.25);">MANILA</h1>
          <p style="font-family:${BODY};font-size:32px;font-weight:600;color:${FILM_CREAM};margin:12px 0 0;">Shot on film.</p>
        </div>

        <!-- Top fade -->
        <div style="position:absolute;left:0;right:0;top:0;height:${VISIBLE_TOP + 50}px;background:linear-gradient(180deg, ${FILM_BG} 65%, transparent 100%);z-index:5;pointer-events:none;"></div>
        <!-- Bottom fade -->
        <div style="position:absolute;left:0;right:0;bottom:0;height:${HEIGHT - VISIBLE_BOTTOM + 80}px;background:linear-gradient(0deg, ${FILM_BG} 65%, transparent 100%);z-index:5;pointer-events:none;"></div>

        <!-- Scrolling film strip -->
        <div style="position:absolute;left:${FRAME_X}px;top:${VISIBLE_TOP}px;width:${FRAME_W}px;height:${VISIBLE_H}px;overflow:hidden;">
          <div class="film-strip" style="position:relative;width:${FRAME_W}px;height:${stripTotalH}px;">
            ${sprocketsHtml}
            ${framesHtml}
          </div>
        </div>

        <!-- Bottom text -->
        <div style="position:absolute;left:0;right:0;bottom:${SAFE_BOTTOM + 15}px;text-align:center;z-index:10;">
          <p style="font-family:${MONO};font-size:13px;color:${FILM_ORANGE};opacity:0.4;margin:0;letter-spacing:0.14em;">ROLL 02  PORTRA 400  MANILA PORTRAITS</p>
        </div>

        ${lightLeak('left')}
        ${grainOverlay()}
      </div>
    </body>
  </html>`
}

// ── Slide 3: PROCESS — 3 step cards beside portrait film frames ──
function slideThree(images, imageSizes) {
  const steps = [
    { num: '01', title: 'DM me', desc: 'Message @madebyaidan on Instagram.' },
    { num: '02', title: 'We plan it', desc: 'Location, vibe, and look — planned together.' },
    { num: '03', title: 'Show up', desc: 'I direct the whole shoot. No experience needed.' },
  ]

  const BORDER = 8
  // Side-by-side: portrait photo on left, step text on right
  const FRAME_W = 380
  const FRAME_INNER_W = FRAME_W - BORDER * 2
  const IMG_H = 320
  const REBATE_H = 28
  const FRAME_H = IMG_H + BORDER * 2 + REBATE_H
  const FRAME_X = 80
  const TEXT_X = FRAME_X + FRAME_W + 28
  const TEXT_W = WIDTH - TEXT_X - 60
  const START_Y = 340
  const FRAME_GAP = 24

  let framesHtml = ''
  let currentY = START_Y
  for (let i = 0; i < 3; i++) {
    // Film frame on left
    framesHtml += `<div style="position:absolute;left:${FRAME_X}px;top:${currentY}px;width:${FRAME_W}px;height:${FRAME_H}px;background:${FILM_BORDER};border:2px solid #3a3228;">
      <div style="position:absolute;left:${BORDER}px;top:${BORDER}px;width:${FRAME_INNER_W}px;height:${IMG_H}px;overflow:hidden;background:#0a0806;">
        <img src="${images.process[i]}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center 20%;filter:saturate(1.2) contrast(1.08) sepia(0.06);"/>
      </div>
      <div style="position:absolute;left:${BORDER + 4}px;bottom:4px;font-family:${MONO};font-size:11px;color:${FILM_ORANGE};opacity:0.5;letter-spacing:0.08em;">${20 + i * 5}/36</div>
      <div style="position:absolute;right:${BORDER + 4}px;bottom:4px;font-family:${MONO};font-size:11px;color:${FILM_ORANGE};opacity:0.4;letter-spacing:0.06em;">PORTRA 400</div>
    </div>`

    // Step text on right, vertically centered with the frame
    const textTop = currentY + Math.round((FRAME_H - 120) / 2)
    framesHtml += `<div style="position:absolute;left:${TEXT_X}px;top:${textTop}px;width:${TEXT_W}px;">
      <p style="font-family:${MONO};font-size:16px;font-weight:700;color:${FILM_AMBER};letter-spacing:0.12em;margin:0 0 8px;">STEP ${steps[i].num}</p>
      <p style="font-family:${BOLD};font-size:30px;font-weight:700;color:${FILM_CREAM};margin:0 0 8px;line-height:1.05;">${steps[i].title}</p>
      <p style="font-family:${BODY};font-size:19px;color:rgba(255,248,231,0.5);margin:0;line-height:1.35;">${steps[i].desc}</p>
    </div>`

    currentY += FRAME_H + FRAME_GAP
  }

  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${FILM_BG};">
      <div style="position:absolute;left:50px;top:0;width:${WIDTH - 100}px;height:${HEIGHT}px;background:${FILM_BORDER};border-left:3px solid #3a3228;border-right:3px solid #3a3228;opacity:0.4;"></div>
      ${sprocketHoles(0, HEIGHT)}

      <div style="position:absolute;left:0;right:0;top:60px;text-align:center;">
        <h1 style="font-family:${BOLD};font-size:100px;font-weight:900;letter-spacing:0.06em;text-transform:uppercase;color:${FILM_AMBER};margin:0;line-height:0.85;text-shadow:0 0 50px rgba(245,197,24,0.25);">MANILA</h1>
        <p style="font-family:${BOLD};font-size:40px;font-weight:700;color:${FILM_CREAM};margin:14px 0 0;">3 easy steps.</p>
      </div>

      ${framesHtml}

      ${filmEdgeText('KODAK  PORTRA 400', 300, 'left')}
      ${lightLeak('right')}
      ${grainOverlay()}
    </div>
  `
}

// ── Slide 4: CTA — full uncropped hero + sign up ──
function slideFour(images) {
  const BORDER = 10
  const frameX = 80
  const frameW = WIDTH - 160
  const frameY = 490
  const frameH = 920
  const imgH = frameH - BORDER * 2 - 32

  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${FILM_BG};">
      <div style="position:absolute;left:50px;top:0;width:${WIDTH - 100}px;height:${HEIGHT}px;background:${FILM_BORDER};border-left:3px solid #3a3228;border-right:3px solid #3a3228;opacity:0.4;"></div>
      ${sprocketHoles(0, HEIGHT)}

      <div style="position:absolute;left:0;right:0;top:60px;text-align:center;">
        <h1 style="font-family:${BOLD};font-size:120px;font-weight:900;letter-spacing:0.06em;text-transform:uppercase;color:${FILM_AMBER};margin:0;line-height:0.85;text-shadow:0 0 60px rgba(245,197,24,0.25), 0 0 120px rgba(245,197,24,0.08);">MANILA</h1>
        <p style="font-family:${BOLD};font-size:52px;font-weight:800;color:${FILM_CREAM};margin:22px 0 0;letter-spacing:-0.02em;">DM me if interested!!</p>
        <p style="font-family:${BODY};font-size:24px;color:rgba(255,248,231,0.5);margin:14px 0 0;">@madebyaidan on Instagram</p>
      </div>

      <!-- Hero frame — uncropped -->
      <div style="position:absolute;left:${frameX}px;top:${frameY}px;width:${frameW}px;height:${frameH}px;background:${FILM_BORDER};border:2px solid #3a3228;">
        <div style="position:absolute;left:${BORDER}px;top:${BORDER}px;width:${frameW - BORDER * 2}px;height:${imgH}px;overflow:hidden;background:#0a0806;">
          <img src="${images.cta}" style="width:100%;height:100%;display:block;object-fit:contain;filter:saturate(1.2) contrast(1.08) sepia(0.06);"/>
        </div>
        <div style="position:absolute;left:${BORDER + 6}px;bottom:6px;font-family:${MONO};font-size:14px;color:${FILM_AMBER};letter-spacing:0.1em;font-weight:700;">36</div>
        <div style="position:absolute;left:${BORDER + 50}px;bottom:6px;font-family:${MONO};font-size:11px;color:${FILM_ORANGE};opacity:0.5;letter-spacing:0.06em;">END OF ROLL  PORTRA 400</div>
        <div style="position:absolute;right:${BORDER + 6}px;bottom:6px;font-family:${MONO};font-size:14px;color:${FILM_AMBER};letter-spacing:0.1em;">36A</div>
      </div>

      <!-- Urgency -->
      <div style="position:absolute;left:0;right:0;bottom:${SAFE_BOTTOM + 20}px;text-align:center;">
        <div style="display:inline-flex;align-items:center;gap:10px;padding:12px 26px;border-radius:6px;background:rgba(245,197,24,0.08);border:1px solid rgba(245,197,24,0.2);">
          <div style="width:8px;height:8px;border-radius:50%;background:${FILM_AMBER};"></div>
          <span style="font-family:${MONO};font-size:17px;font-weight:700;color:${FILM_AMBER};letter-spacing:0.14em;text-transform:uppercase;">Limited spots this month</span>
        </div>
      </div>

      ${filmEdgeText('KODAK  PORTRA 400', 400, 'right')}
      ${lightLeak('left')}
      ${grainOverlay()}
    </div>
  `
}

async function render() {
  resetOutputDir()

  const all = getTopManilaImages()

  // Images for the scroll strip — mix of portraits, landscapes, squares
  const stripFiles = [
    'manila-gallery-closeup-001.jpg',   // portrait 0.66
    'manila-gallery-canal-002.jpg',     // landscape 1.49
    'manila-gallery-dsc-0911.jpg',      // portrait 0.63
    'manila-gallery-garden-002.jpg',    // landscape 1.50
    'manila-gallery-night-003.jpg',     // square 1.0
    'manila-gallery-street-001.jpg',  // portrait 0.67
    'manila-gallery-dsc-0130.jpg',      // portrait 0.64
    'manila-gallery-urban-001.jpg',     // portrait 0.67
    'manila-gallery-shadow-001.jpg',    // portrait 0.66
    'manila-gallery-floor-001.jpg',     // portrait 0.66
  ]

  const selection = {
    hero: 'manila-gallery-canal-001.jpg',
    strip: stripFiles,
    processA: 'manila-gallery-dsc-0911.jpg',
    processB: 'manila-gallery-street-001.jpg',
    processC: 'manila-gallery-dsc-0190.jpg',
    cta: 'manila-gallery-park-001.jpg',
  }

  writeSources({ all_considered: all, selected: selection })

  // Read images
  const images = {
    hero: readImage(selection.hero),
    strip: stripFiles.map(f => readImage(f)),
    process: [readImage(selection.processA), readImage(selection.processB), readImage(selection.processC)],
    cta: readImage(selection.cta),
  }

  // Get real sizes for strip images
  const imageSizes = {
    strip: stripFiles.map(f => getImageSize(f)),
  }

  // --- Render static slides ---
  const staticSlides = [
    ['01_hook_story.png', wrap(slideOne(images))],
    ['03_process_story.png', wrap(slideThree(images, imageSizes))],
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

  // --- Render slide 2 as animated MP4 ---
  console.log('Recording animated film strip as MP4...')

  const TOTAL_DURATION_MS = 12000

  const videoCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: OUT_DIR,
      size: { width: WIDTH, height: HEIGHT }
    }
  })

  const videoPage = await videoCtx.newPage()
  const animatedHtml = slideTwoAnimated(images, imageSizes)
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

    try {
      execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${dstVideo}"`, { stdio: 'pipe' })
      fs.unlinkSync(srcVideo)
      console.log('Rendered 02_filmstrip_story.mp4')
    } catch (err) {
      console.warn('ffmpeg not available, keeping as webm...')
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
