import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v66')

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 410

const HANDLE = 'madebyaidan'

// Colors
const PINK = '#FF2D87'
const YELLOW = '#FFE135'
const CYAN = '#00E5FF'
const RED = '#FF3B30'
const CREAM = '#FFF8E7'
const BLACK = '#1A1A1A'

const selection = {
  hero: 'manila-gallery-canal-001.jpg',
  heroB: 'manila-gallery-closeup-001.jpg',
  gridA: 'manila-gallery-garden-002.jpg',
  gridB: 'manila-gallery-graffiti-001.jpg',
  gridC: 'manila-gallery-urban-001.jpg',
  gridD: 'manila-gallery-night-003.jpg',
  gridE: 'manila-gallery-ivy-001.jpg',
  process: 'manila-gallery-dsc-0190.jpg',
  cta: 'manila-gallery-floor-001.jpg',
  ctaB: 'manila-gallery-shadow-001.jpg',
}

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

function writeSources() {
  const payload = {
    createdAt: new Date().toISOString(),
    strategy: 'v66 — Animated zine/collage video, cut & paste punk aesthetic',
    safeBottomPixels: SAFE_BOTTOM,
    images: selection,
  }
  fs.writeFileSync(path.join(OUT_DIR, 'sources.json'), JSON.stringify(payload, null, 2))
}

// --- Helper functions ---

function tapeStrip(x, y, width, height, rotation, color = 'rgba(255,225,53,0.55)') {
  return `<div style="position:absolute;left:${x}px;top:${y}px;width:${width}px;height:${height}px;background:${color};transform:rotate(${rotation}deg);z-index:20;opacity:0.85;"></div>`
}

function starBurst(x, y, size, color, text, textColor = '#fff', fontSize = 20) {
  return `<div style="position:absolute;left:${x}px;top:${y}px;width:${size}px;height:${size}px;z-index:30;display:flex;align-items:center;justify-content:center;">
    <svg viewBox="0 0 100 100" style="position:absolute;inset:0;width:100%;height:100%;">
      <polygon points="50,0 61,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 39,35" fill="${color}"/>
    </svg>
    <span style="position:relative;z-index:1;font-family:'Helvetica Neue',sans-serif;font-size:${fontSize}px;font-weight:900;color:${textColor};text-align:center;line-height:1.1;text-transform:uppercase;">${text}</span>
  </div>`
}

function doodleCircle(x, y, size, color = '#FF3B30') {
  return `<div style="position:absolute;left:${x}px;top:${y}px;width:${size}px;height:${size}px;border:4px solid ${color};border-radius:50%;transform:rotate(-5deg);z-index:25;opacity:0.8;"></div>`
}

function doodleArrow(x, y, rotation, color = '#1A1A1A') {
  return `<div style="position:absolute;left:${x}px;top:${y}px;z-index:25;transform:rotate(${rotation}deg);">
    <div style="width:60px;height:4px;background:${color};border-radius:2px;"></div>
    <div style="position:absolute;right:-2px;top:-8px;width:0;height:0;border-left:16px solid ${color};border-top:10px solid transparent;border-bottom:10px solid transparent;"></div>
  </div>`
}

// Polaroid photo with white border at random angle
function polaroidPhoto(src, x, y, w, h, rotation, delay, index) {
  const border = 12
  // Outer div: position + rotation (static). Inner div: scale animation (slam in).
  return `<div style="position:absolute;left:${x}px;top:${y}px;transform:rotate(${rotation}deg);z-index:${10 + index};">
    <div style="width:${w + border * 2}px;padding:${border}px ${border}px ${border + 20}px;background:#fff;box-shadow:2px 4px 16px rgba(0,0,0,0.18);transform:scale(0);opacity:0;animation:slamIn 0.5s cubic-bezier(0.34,1.56,0.64,1) ${delay}s forwards;">
      <img src="${src}" style="width:${w}px;height:${h}px;object-fit:cover;display:block;"/>
    </div>
  </div>`
}

// Squiggly SVG underline
function squigglyUnderline(x, y, width, color = PINK, delay = 0) {
  return `<svg style="position:absolute;left:${x}px;top:${y}px;z-index:25;opacity:0;animation:fadeIn 0.3s ease ${delay}s forwards;" width="${width}" height="12" viewBox="0 0 ${width} 12">
    <path d="M0,6 ${Array.from({length: Math.floor(width / 20)}, (_, i) => `Q${i * 20 + 10},${i % 2 === 0 ? 0 : 12} ${(i + 1) * 20},6`).join(' ')}" stroke="${color}" stroke-width="3" fill="none"/>
  </svg>`
}

function buildAnimatedZine(images) {
  // Total duration ~22s (video content), CTA follows immediately
  const TOTAL_DURATION = 22

  // Notebook line pattern
  const notebookLines = Array.from({length: 50}, (_, i) => {
    const lineY = 80 + i * 36
    return `<div style="position:absolute;left:0;right:0;top:${lineY}px;height:1px;background:rgba(100,149,237,0.2);z-index:1;"></div>`
  }).join('')

  // Red margin line
  const marginLine = `<div style="position:absolute;left:90px;top:0;bottom:0;width:2px;background:rgba(255,59,48,0.25);z-index:1;"></div>`

  // MANILA letters configuration
  const manilaLetters = [
    { char: 'M', font: "'Helvetica Neue',sans-serif", size: 130, color: PINK, bg: 'transparent', rotation: -5, delay: 0.3 },
    { char: 'A', font: "Georgia,serif", size: 110, color: BLACK, bg: 'transparent', rotation: 3, delay: 0.6, italic: true },
    { char: 'N', font: "'Courier New',monospace", size: 120, color: CYAN, bg: BLACK, rotation: -2, delay: 0.9 },
    { char: 'I', font: "'Helvetica Neue',sans-serif", size: 140, color: YELLOW, bg: 'transparent', rotation: 4, delay: 1.2, stroke: true },
    { char: 'L', font: "Georgia,serif", size: 115, color: RED, bg: 'transparent', rotation: -3, delay: 1.5 },
    { char: 'A', font: "'Courier New',monospace", size: 125, color: PINK, bg: YELLOW, rotation: 2, delay: 1.8 },
  ]

  let manilaX = 80
  const manilaHTML = manilaLetters.map((l, i) => {
    const x = manilaX
    manilaX += l.size * 0.8 + 10
    const bgStyle = l.bg !== 'transparent' ? `background:${l.bg};padding:4px 8px;` : ''
    const strokeStyle = l.stroke ? `-webkit-text-stroke:3px ${BLACK};color:${l.color};` : `color:${l.color};`
    const italicStyle = l.italic ? 'font-style:italic;' : ''
    // Outer div handles position + rotation (static), inner span handles slam animation (scale)
    return `<div style="position:absolute;left:${x}px;top:140px;transform:rotate(${l.rotation}deg);z-index:15;line-height:1;">
      <span class="letter-slam-${i}" style="display:inline-block;font-family:${l.font};font-size:${l.size}px;font-weight:900;${strokeStyle}${italicStyle}${bgStyle}transform:scale(0);opacity:0;animation:slamIn 0.4s cubic-bezier(0.34,1.56,0.64,1) ${l.delay}s forwards;">${l.char}</span>
    </div>`
  }).join('\n')

  // "models wanted!!" text
  const modelsWantedDelay = 2.4
  const modelsWantedHTML = `
    <div style="position:absolute;left:110px;top:300px;z-index:15;opacity:0;animation:scrawlIn 0.6s ease ${modelsWantedDelay}s forwards;">
      <span style="font-family:Georgia,serif;font-size:52px;font-style:italic;color:${BLACK};font-weight:400;">models wanted!!</span>
    </div>
    ${squigglyUnderline(110, 360, 480, PINK, modelsWantedDelay + 0.3)}
  `

  // "OPEN CALL" pill sticker
  const openCallDelay = 3.2
  const openCallHTML = `
    <div style="position:absolute;left:680px;top:180px;z-index:30;transform:rotate(12deg);">
      <div style="background:${RED};border-radius:30px;padding:12px 28px;opacity:0;transform:scale(0);animation:slamIn 0.4s cubic-bezier(0.34,1.56,0.64,1) ${openCallDelay}s forwards;">
        <span style="font-family:'Helvetica Neue',sans-serif;font-size:28px;font-weight:900;color:#fff;text-transform:uppercase;letter-spacing:2px;">OPEN CALL</span>
      </div>
    </div>
  `

  // Photo collage build (4-12s)
  const photos = [
    { key: 'hero', x: 60,  y: 440, w: 280, h: 350, rot: -4, delay: 4.2 },
    { key: 'heroB', x: 400, y: 480, w: 260, h: 330, rot: 5, delay: 5.2 },
    { key: 'gridA', x: 180, y: 780, w: 300, h: 380, rot: -3, delay: 6.2 },
    { key: 'gridB', x: 550, y: 700, w: 240, h: 300, rot: 6, delay: 7.2 },
    { key: 'gridC', x: 80,  y: 950, w: 270, h: 340, rot: 2, delay: 8.2 },
    { key: 'gridD', x: 420, y: 1020, w: 280, h: 350, rot: -5, delay: 9.2 },
  ]

  const photosHTML = photos.map((p, i) =>
    polaroidPhoto(images[p.key], p.x, p.y, p.w, p.h, p.rot, p.delay, i)
  ).join('\n')

  // Tape strips appear after each photo
  const tapeHTML = photos.map((p, i) => {
    const tapeDelay = p.delay + 0.35
    const tapeColor = i % 2 === 0 ? 'rgba(255,225,53,0.55)' : 'rgba(255,45,135,0.35)'
    return `<div style="opacity:0;animation:fadeIn 0.2s ease ${tapeDelay}s forwards;">
      ${tapeStrip(p.x + p.w / 2 - 40, p.y - 10, 90, 28, p.rot + (i % 2 === 0 ? 8 : -6), tapeColor)}
    </div>`
  }).join('\n')

  // Doodles between photos
  const doodlesHTML = `
    <div style="opacity:0;animation:fadeIn 0.3s ease 5.8s forwards;">
      ${doodleCircle(350, 520, 70, PINK)}
    </div>
    <div style="opacity:0;animation:fadeIn 0.3s ease 7.0s forwards;">
      ${doodleArrow(730, 850, -25, BLACK)}
    </div>
    <div style="opacity:0;animation:fadeIn 0.3s ease 8.5s forwards;">
      ${doodleCircle(700, 600, 55, CYAN)}
    </div>
    <div style="opacity:0;animation:fadeIn 0.3s ease 9.5s forwards;">
      ${doodleArrow(50, 1100, 15, RED)}
    </div>
  `

  // Star burst stickers
  const stickersHTML = `
    <div style="opacity:0;animation:fadeIn 0.3s ease 6.5s forwards;">
      ${starBurst(780, 450, 120, YELLOW, '!!', BLACK, 32)}
    </div>
    <div style="opacity:0;animation:fadeIn 0.3s ease 9.0s forwards;">
      ${starBurst(30, 850, 100, PINK, '✦', '#fff', 28)}
    </div>
  `

  // Caption text
  const captionDelay = 10.0
  const captionHTML = `
    <div style="position:absolute;left:480px;top:1360px;z-index:25;opacity:0;transform:rotate(-3deg);animation:fadeIn 0.4s ease ${captionDelay}s forwards;">
      <span style="font-family:'Courier New',monospace;font-size:36px;font-weight:700;color:${BLACK};background:${YELLOW};padding:4px 12px;">this is my work !!</span>
    </div>
  `

  // Process reveal (12-17s) - scrolls up via keyframes
  // Steps appear in mixed typography
  const step1Delay = 12.5
  const step2Delay = 13.5
  const step3Delay = 14.5
  const thatsItDelay = 15.5
  const freeDelay = 16.2

  const processHTML = `
    <!-- Step 1 -->
    <div style="position:absolute;left:80px;top:1500px;z-index:25;opacity:0;animation:slideRotateIn 0.5s ease ${step1Delay}s forwards;">
      <span style="font-family:'Helvetica Neue',sans-serif;font-size:120px;font-weight:900;color:${PINK};line-height:1;">1</span>
      <div style="display:inline-block;margin-left:20px;vertical-align:middle;">
        <span style="font-family:'Courier New',monospace;font-size:42px;font-weight:700;color:${BLACK};background:${YELLOW};padding:6px 16px;">sign up below</span>
      </div>
    </div>
    <div style="opacity:0;animation:fadeIn 0.3s ease ${step1Delay + 0.3}s forwards;">
      ${doodleArrow(620, 1540, -10, BLACK)}
    </div>

    <!-- Step 2 -->
    <div style="position:absolute;left:80px;top:1640px;z-index:25;opacity:0;animation:slideRotateIn 0.5s ease ${step2Delay}s forwards;">
      <span style="font-family:Georgia,serif;font-size:120px;font-weight:900;font-style:italic;color:${CYAN};line-height:1;">2</span>
      <div style="display:inline-block;margin-left:20px;vertical-align:middle;">
        <span style="font-family:Georgia,serif;font-size:40px;color:${BLACK};">we plan the shoot</span>
      </div>
    </div>
    <div style="opacity:0;animation:fadeIn 0.3s ease ${step2Delay + 0.3}s forwards;">
      ${doodleArrow(600, 1680, 5, PINK)}
    </div>

    <!-- Step 3 -->
    <div style="position:absolute;left:80px;top:1780px;z-index:25;opacity:0;animation:slideRotateIn 0.5s ease ${step3Delay}s forwards;">
      <span style="font-family:'Courier New',monospace;font-size:120px;font-weight:900;color:${RED};line-height:1;">3</span>
      <div style="display:inline-block;margin-left:20px;vertical-align:middle;">
        <span style="font-family:'Courier New',monospace;font-size:38px;color:${BLACK};">show up. I guide you.</span>
      </div>
    </div>
    <div style="opacity:0;animation:fadeIn 0.3s ease ${step3Delay + 0.3}s forwards;">
      ${doodleArrow(650, 1820, -15, CYAN)}
    </div>

    <!-- that's it!! -->
    <div style="position:absolute;left:160px;top:1940px;z-index:25;opacity:0;animation:slideRotateIn 0.5s ease ${thatsItDelay}s forwards;">
      <span style="font-family:'Helvetica Neue',sans-serif;font-size:90px;font-weight:900;color:${PINK};">that's it!!</span>
    </div>
    ${squigglyUnderline(160, 2040, 520, PINK, thatsItDelay + 0.3)}

    <!-- FREE! starburst -->
    <div style="opacity:0;transform:scale(0);animation:stickerPop 0.4s cubic-bezier(0.34,1.56,0.64,1) ${freeDelay}s forwards;position:absolute;left:750px;top:1900px;">
      ${starBurst(0, 0, 160, RED, 'FREE!', '#fff', 28)}
    </div>
  `

  // Scroll keyframes: scroll the content container up to reveal process steps
  const p = (t) => ((t / TOTAL_DURATION) * 100).toFixed(1)
  const scrollKeyframes = `
    0% { transform: translateY(0); }
    ${p(4)}% { transform: translateY(0); }
    ${p(10)}% { transform: translateY(-350px); }
    ${p(12)}% { transform: translateY(-500px); }
    ${p(13)}% { transform: translateY(-700px); }
    ${p(15)}% { transform: translateY(-900px); }
    ${p(17)}% { transform: translateY(-1000px); }
    ${p(21)}% { transform: translateY(-1000px); }
    100% { transform: translateY(-1000px); }
  `

  return `<!DOCTYPE html>
<html>
<head>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { margin: 0; padding: 0; background: ${CREAM}; -webkit-font-smoothing: antialiased; }

    /* Unified slam animation: scale from 0 -> overshoot -> 1 */
    @keyframes slamIn {
      0% { opacity: 0; transform: scale(2.5); }
      60% { opacity: 1; transform: scale(0.92); }
      100% { opacity: 1; transform: scale(1); }
    }

    @keyframes fadeIn {
      0% { opacity: 0; }
      100% { opacity: 1; }
    }

    @keyframes scrawlIn {
      0% { opacity: 0; clip-path: inset(0 100% 0 0); }
      100% { opacity: 1; clip-path: inset(0 0 0 0); }
    }

    @keyframes stickerPop {
      0% { opacity: 0; transform: scale(0); }
      70% { opacity: 1; transform: scale(1.15); }
      100% { opacity: 1; transform: scale(1); }
    }

    @keyframes slideRotateIn {
      0% { opacity: 0; transform: translateX(-60px) rotate(-3deg); }
      100% { opacity: 1; transform: translateX(0) rotate(0deg); }
    }

    @keyframes contentScroll {
      ${scrollKeyframes}
    }

  </style>
</head>
<body>
  <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${CREAM};">

    <!-- Notebook lines background -->
    <div style="position:absolute;inset:0;z-index:1;pointer-events:none;">
      ${notebookLines}
      ${marginLine}
    </div>

    <!-- Scrollable content container -->
    <div style="position:absolute;left:0;right:0;top:0;bottom:0;animation:contentScroll ${TOTAL_DURATION}s ease-in-out forwards;">

      <!-- MANILA letters -->
      ${manilaHTML}

      <!-- models wanted!! -->
      ${modelsWantedHTML}

      <!-- OPEN CALL pill -->
      ${openCallHTML}

      <!-- Photo collage -->
      ${photosHTML}

      <!-- Tape strips -->
      ${tapeHTML}

      <!-- Doodles -->
      ${doodlesHTML}

      <!-- Star burst stickers -->
      ${stickersHTML}

      <!-- Caption -->
      ${captionHTML}

      <!-- Process steps -->
      ${processHTML}

    </div>

    <!-- No fade — CTA follows immediately via ffmpeg concat -->
  </div>
</body>
</html>`
}

function buildCTA(images) {
  // Notebook lines
  const notebookLines = Array.from({length: 50}, (_, i) => {
    const lineY = 80 + i * 36
    return `<div style="position:absolute;left:0;right:0;top:${lineY}px;height:1px;background:rgba(100,149,237,0.2);z-index:1;"></div>`
  }).join('')

  const marginLine = `<div style="position:absolute;left:90px;top:0;bottom:0;width:2px;background:rgba(255,59,48,0.25);z-index:1;"></div>`

  // MANILA in collage letters
  const manilaLetters = [
    { char: 'M', font: "'Helvetica Neue',sans-serif", size: 120, color: PINK, bg: 'transparent', rotation: -4 },
    { char: 'A', font: "Georgia,serif", size: 100, color: BLACK, bg: 'transparent', rotation: 3, italic: true },
    { char: 'N', font: "'Courier New',monospace", size: 110, color: CYAN, bg: BLACK, rotation: -2 },
    { char: 'I', font: "'Helvetica Neue',sans-serif", size: 130, color: YELLOW, bg: 'transparent', rotation: 4, stroke: true },
    { char: 'L', font: "Georgia,serif", size: 105, color: RED, bg: 'transparent', rotation: -3 },
    { char: 'A', font: "'Courier New',monospace", size: 115, color: PINK, bg: YELLOW, rotation: 2 },
  ]

  let manilaX = 100
  const manilaHTML = manilaLetters.map((l) => {
    const x = manilaX
    manilaX += l.size * 0.75 + 10
    const bgStyle = l.bg !== 'transparent' ? `background:${l.bg};padding:4px 8px;` : ''
    const strokeStyle = l.stroke ? `-webkit-text-stroke:3px ${BLACK};color:${l.color};` : `color:${l.color};`
    const italicStyle = l.italic ? 'font-style:italic;' : ''
    return `<div style="position:absolute;left:${x}px;top:120px;font-family:${l.font};font-size:${l.size}px;font-weight:900;${strokeStyle}${italicStyle}${bgStyle}transform:rotate(${l.rotation}deg);z-index:15;line-height:1;">${l.char}</div>`
  }).join('\n')

  // Large taped photo
  const photoHTML = `
    <div style="position:absolute;left:140px;top:340px;width:804px;padding:14px 14px 40px;background:#fff;transform:rotate(-2deg);box-shadow:2px 4px 16px rgba(0,0,0,0.15);z-index:10;">
      <img src="${images.cta}" style="width:776px;height:580px;object-fit:cover;display:block;"/>
    </div>
  `

  // Tape strips on photo
  const photoTapeHTML = `
    ${tapeStrip(200, 330, 110, 30, 8, 'rgba(255,225,53,0.55)')}
    ${tapeStrip(720, 340, 100, 28, -5, 'rgba(255,45,135,0.35)')}
  `

  // "PHOTO SHOOT" in big mixed type
  const photoShootHTML = `
    <div style="position:absolute;left:80px;top:980px;z-index:20;">
      <span style="font-family:'Helvetica Neue',sans-serif;font-size:100px;font-weight:900;color:${PINK};letter-spacing:4px;">PHOTO</span>
    </div>
    <div style="position:absolute;left:120px;top:1080px;z-index:20;">
      <span style="font-family:Georgia,serif;font-size:95px;font-weight:900;font-style:italic;color:${BLACK};letter-spacing:2px;">SHOOT</span>
    </div>
  `

  // Doodles
  const ctaDoodlesHTML = `
    ${doodleCircle(750, 1000, 80, CYAN)}
    ${doodleArrow(680, 1120, -20, BLACK)}
  `

  // Star burst
  const ctaStarHTML = starBurst(800, 300, 130, RED, '!!', '#fff', 30)

  // IG handle
  const handleHTML = `
    <div style="position:absolute;left:80px;top:1200px;z-index:20;">
      <span style="font-family:'Courier New',monospace;font-size:36px;color:${BLACK};">@${HANDLE}</span>
    </div>
  `

  return `<!DOCTYPE html><html><head>
    <style>* { box-sizing:border-box;margin:0;padding:0; } html,body { background:${CREAM}; -webkit-font-smoothing:antialiased; }</style>
  </head><body>
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${CREAM};">
      <!-- Notebook lines -->
      <div style="position:absolute;inset:0;z-index:1;pointer-events:none;">
        ${notebookLines}
        ${marginLine}
      </div>

      ${manilaHTML}
      ${photoHTML}
      ${photoTapeHTML}
      ${photoShootHTML}
      ${ctaDoodlesHTML}
      ${ctaStarHTML}
      ${handleHTML}
    </div>
  </body></html>`
}

async function render() {
  resetOutputDir()
  writeSources()

  const images = Object.fromEntries(
    Object.entries(selection).map(([key, file]) => [key, readImage(file)])
  )

  const { execSync } = await import('child_process')
  const browser = await chromium.launch()

  // --- Step 1: Record the animated zine video ---
  console.log('Recording animated zine collage video...')
  const TOTAL_DURATION_MS = 18000

  const videoCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: OUT_DIR,
      size: { width: WIDTH, height: HEIGHT },
    },
  })

  const videoPage = await videoCtx.newPage()
  await videoPage.setContent(buildAnimatedZine(images), { waitUntil: 'load' })
  await videoPage.waitForTimeout(500)
  await videoPage.waitForTimeout(TOTAL_DURATION_MS)
  await videoPage.close()
  await videoCtx.close()

  // --- Step 2: Render CTA as a high-quality screenshot ---
  console.log('Rendering CTA screenshot...')
  const ctaCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
  })
  const ctaPage = await ctaCtx.newPage()
  await ctaPage.setContent(buildCTA(images), { waitUntil: 'load' })
  await ctaPage.waitForTimeout(300)
  const ctaPath = path.join(OUT_DIR, 'cta_frame.png')
  await ctaPage.screenshot({ path: ctaPath })
  await ctaPage.close()
  await ctaCtx.close()
  await browser.close()

  // --- Step 3: Convert webm to mp4, then concat with CTA still frame ---
  const videoFiles = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.webm'))
  if (videoFiles.length === 0) {
    console.error('No video file was generated!')
    return
  }

  const srcVideo = path.join(OUT_DIR, videoFiles[0])
  const chatMp4 = path.join(OUT_DIR, 'zine_part.mp4')
  const ctaMp4 = path.join(OUT_DIR, 'cta_part.mp4')
  const finalMp4 = path.join(OUT_DIR, '01_manila_zine_video.mp4')
  const concatFile = path.join(OUT_DIR, 'concat.txt')

  try {
    // Convert zine webm to mp4
    execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${chatMp4}"`, { stdio: 'pipe' })

    // Create 5-second CTA video from static image
    execSync(`ffmpeg -y -loop 1 -i "${ctaPath}" -c:v libx264 -t 5 -pix_fmt yuv420p -r 30 -vf "scale=${WIDTH}:${HEIGHT}" -an "${ctaMp4}"`, { stdio: 'pipe' })

    // Concat zine + CTA
    fs.writeFileSync(concatFile, `file '${chatMp4}'\nfile '${ctaMp4}'\n`)
    execSync(`ffmpeg -y -f concat -safe 0 -i "${concatFile}" -c copy "${finalMp4}"`, { stdio: 'pipe' })

    // Cleanup temp files
    fs.unlinkSync(srcVideo)
    fs.unlinkSync(chatMp4)
    fs.unlinkSync(ctaMp4)
    fs.unlinkSync(concatFile)
    console.log('Rendered 01_manila_zine_video.mp4 (zine + CTA)')
  } catch (err) {
    console.error('ffmpeg error:', err.message)
    if (fs.existsSync(srcVideo)) {
      fs.renameSync(srcVideo, finalMp4)
    }
  }

  console.log(`Done: output written to ${OUT_DIR}`)
}

render().catch(error => {
  console.error(error)
  process.exit(1)
})
