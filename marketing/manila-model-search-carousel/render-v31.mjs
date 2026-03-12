import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v31')

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 620

// Fonts
const BOLD = "'Helvetica Neue', 'Avenir Next', Arial, sans-serif"
const BODY = "'Avenir Next', 'Helvetica Neue', Arial, sans-serif"
const CONDENSED = "'Arial Narrow', Futura, 'Helvetica Neue', sans-serif"

// Neon colors
const NEON_PINK = '#FF2D7B'
const NEON_CYAN = '#00F0FF'
const NEON_PURPLE = '#B44DFF'
const DARK_BG = '#0A0610'

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
    strategy: 'v31 -- Neon / Club Poster nightlife energy concept with animated proof slide MP4',
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
        html, body { margin: 0; padding: 0; background: ${DARK_BG}; }
      </style>
    </head>
    <body>${html}</body>
  </html>`
}

// Neon text glow helper -- returns text-shadow CSS for neon glow
function neonGlow(color, intensity = 1) {
  const i = intensity
  return `0 0 ${7*i}px ${color}, 0 0 ${14*i}px ${color}, 0 0 ${28*i}px ${color}, 0 0 ${56*i}px ${color}`
}

// Neon box glow helper -- returns box-shadow CSS
function neonBoxGlow(color, intensity = 1) {
  const i = intensity
  return `0 0 ${5*i}px ${color}, 0 0 ${10*i}px ${color}, 0 0 ${20*i}px ${color}, inset 0 0 ${5*i}px ${color}`
}

// ========== SLIDE 1: HOOK ==========
function slideOne(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${DARK_BG};">
      <!-- Hero image with color tint overlay -->
      <img src="${images.hero}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 20%;"/>
      <!-- Magenta/purple tint overlay -->
      <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(180,20,100,0.35) 0%, rgba(10,6,16,0.3) 40%, rgba(0,180,255,0.15) 100%);mix-blend-mode:multiply;"></div>
      <!-- Dark gradient from top for text readability -->
      <div style="position:absolute;left:0;right:0;top:0;height:900px;background:linear-gradient(180deg, rgba(10,6,16,0.92) 0%, rgba(10,6,16,0.7) 45%, rgba(10,6,16,0) 100%);"></div>
      <!-- Dark gradient from bottom for safe area -->
      <div style="position:absolute;left:0;right:0;bottom:0;height:${SAFE_BOTTOM + 120}px;background:linear-gradient(0deg, rgba(10,6,16,0.7) 0%, rgba(10,6,16,0) 100%);"></div>

      <!-- MANILA neon sign -->
      <div style="position:absolute;left:30px;top:80px;width:780px;">
        <p style="font-family:${BOLD};font-size:86px;font-weight:900;letter-spacing:0.22em;text-transform:uppercase;color:${NEON_PINK};margin:0 0 20px;text-shadow:${neonGlow(NEON_PINK, 1.2)};">MANILA</p>
        <!-- Thin neon line -->
        <div style="width:200px;height:2px;background:${NEON_CYAN};box-shadow:${neonGlow(NEON_CYAN, 0.6)};margin:0 0 30px;"></div>
        <!-- MODELS WANTED in bold condensed -->
        <h1 style="font-family:${CONDENSED};font-size:92px;font-weight:900;line-height:0.95;color:#fff;margin:0 0 28px;letter-spacing:0.06em;text-transform:uppercase;text-shadow:0 0 20px rgba(255,255,255,0.3);">MODELS<br/>WANTED</h1>
        <p style="font-family:${BODY};font-size:32px;font-weight:500;line-height:1.4;color:rgba(255,255,255,0.85);margin:0;text-shadow:0 0 10px rgba(0,240,255,0.3);">Editorial portrait shoots.<br/>No experience needed.</p>
      </div>
    </div>
  `
}

// ========== SLIDE 2: ANIMATED PROOF ==========
// Returns full HTML doc (not wrapped) for video recording
function slideTwoAnimated(images) {
  const HEADER_END = 240
  const BOTTOM_LIMIT = HEIGHT - SAFE_BOTTOM - 20
  const PAD = 32
  const GAP = 10
  const CONTAINER_W = WIDTH - PAD * 2
  const AVAILABLE_H = BOTTOM_LIMIT - HEADER_END

  // 3x3 grid + 1 extra = 10 images, or 3 rows of varying counts
  const gridImages = [
    images.gridA, images.gridB, images.gridC,
    images.gridD, images.gridE, images.gridF,
    images.gridG, images.gridH, images.gridI,
  ]

  // 3x3 grid layout
  const COLS = 3
  const ROWS = 3
  const cellW = Math.floor((CONTAINER_W - (COLS - 1) * GAP) / COLS)
  const cellH = Math.floor((AVAILABLE_H - (ROWS - 1) * GAP) / ROWS)

  let tilesHtml = ''
  let imgIdx = 0
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (imgIdx >= gridImages.length) break
      const x = PAD + c * (cellW + GAP)
      const y = HEADER_END + r * (cellH + GAP)
      const delay = imgIdx * 0.35
      tilesHtml += `
        <div class="tile tile-${imgIdx}" style="
          position:absolute;left:${x}px;top:${y}px;width:${cellW}px;height:${cellH}px;
          border-radius:8px;overflow:hidden;
          opacity:0;transform:scale(0.9);
          animation:tileReveal 0.5s ease-out ${delay}s forwards;
          border:2px solid ${NEON_CYAN};
          box-shadow:${neonBoxGlow(NEON_CYAN, 0.5)};
        ">
          <img src="${gridImages[imgIdx]}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center;filter:saturate(1.1) contrast(1.05);"/>
          <!-- Subtle neon tint on image -->
          <div style="position:absolute;inset:0;background:linear-gradient(135deg, rgba(255,45,123,0.08) 0%, rgba(0,240,255,0.08) 100%);"></div>
        </div>`
      imgIdx++
    }
  }

  // Neon flicker animation for the border glow
  return `<!DOCTYPE html>
  <html>
    <head>
      <style>
        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; background: ${DARK_BG}; }
        @keyframes tileReveal {
          0% { opacity: 0; transform: scale(0.9); }
          60% { opacity: 1; transform: scale(1.02); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes headerFade {
          0% { opacity: 0; transform: translateY(-20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes neonFlicker {
          0%, 100% { opacity: 1; }
          5% { opacity: 0.85; }
          10% { opacity: 1; }
          15% { opacity: 0.9; }
          20% { opacity: 1; }
          50% { opacity: 1; }
          52% { opacity: 0.8; }
          54% { opacity: 1; }
        }
        @keyframes lineGrow {
          0% { width: 0; opacity: 0; }
          100% { width: 160px; opacity: 1; }
        }
        .header {
          opacity: 0;
          animation: headerFade 0.5s ease-out 0s forwards;
        }
        .neon-manila {
          animation: neonFlicker 3s ease-in-out infinite;
        }
        .neon-line {
          width: 0;
          animation: lineGrow 0.6s ease-out 0.2s forwards;
        }
      </style>
    </head>
    <body>
      <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${DARK_BG};">
        <div class="header" style="position:absolute;left:30px;top:65px;width:780px;">
          <p class="neon-manila" style="font-family:${BOLD};font-size:80px;font-weight:900;letter-spacing:0.22em;text-transform:uppercase;color:${NEON_PINK};margin:0 0 8px;text-shadow:${neonGlow(NEON_PINK, 1)};">MANILA</p>
          <div class="neon-line" style="height:2px;background:${NEON_CYAN};box-shadow:${neonGlow(NEON_CYAN, 0.5)};margin:0 0 14px;"></div>
          <h2 style="font-family:${BOLD};font-size:52px;font-weight:800;line-height:0.96;color:#fff;margin:0;letter-spacing:-0.01em;text-shadow:0 0 15px rgba(255,255,255,0.25);">This is my work.</h2>
        </div>
        ${tilesHtml}
      </div>
    </body>
  </html>`
}

// ========== SLIDE 3: PROCESS ==========
function slideThree(images) {
  const steps = [
    { num: '01', title: 'Sign up below', desc: 'Takes 60 seconds. I message you back.' },
    { num: '02', title: 'We pick a date', desc: 'Location, vibe, look -- we plan it together.' },
    { num: '03', title: 'Show up. I guide you.', desc: 'No posing experience needed.' },
  ]

  let stepsHtml = ''
  steps.forEach((step, i) => {
    const neonColor = [NEON_PINK, NEON_CYAN, NEON_PURPLE][i]
    stepsHtml += `
      <div style="display:flex;gap:20px;align-items:flex-start;margin-bottom:${i < 2 ? '28' : '0'}px;">
        <!-- Neon number -->
        <div style="flex-shrink:0;width:62px;height:62px;border-radius:50%;border:2px solid ${neonColor};display:flex;align-items:center;justify-content:center;box-shadow:${neonBoxGlow(neonColor, 0.4)};">
          <span style="font-family:${BOLD};font-size:26px;font-weight:800;color:${neonColor};text-shadow:${neonGlow(neonColor, 0.5)};">${step.num}</span>
        </div>
        <div style="flex:1;padding-top:4px;">
          <p style="font-family:${BOLD};font-size:34px;font-weight:700;color:#fff;margin:0 0 6px;line-height:1.15;text-shadow:0 0 8px rgba(255,255,255,0.15);">${step.title}</p>
          <p style="font-family:${BODY};font-size:24px;color:rgba(255,255,255,0.6);margin:0;line-height:1.3;">${step.desc}</p>
        </div>
      </div>
      ${i < 2 ? `<div style="width:100%;height:1px;background:linear-gradient(90deg, ${neonColor}44, transparent 70%);margin-bottom:28px;"></div>` : ''}
    `
  })

  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${DARK_BG};">
      <!-- Background image with heavy dark overlay -->
      <img src="${images.process}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;opacity:0.15;filter:saturate(0.4);"/>
      <!-- Gradient overlays -->
      <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(10,6,16,0.95) 0%, rgba(10,6,16,0.85) 50%, rgba(10,6,16,0.95) 100%);"></div>

      <!-- Ambient neon glow spots -->
      <div style="position:absolute;top:200px;right:-100px;width:400px;height:400px;background:radial-gradient(circle, ${NEON_PINK}15, transparent 70%);"></div>
      <div style="position:absolute;bottom:600px;left:-100px;width:350px;height:350px;background:radial-gradient(circle, ${NEON_CYAN}12, transparent 70%);"></div>

      <!-- Header -->
      <div style="position:absolute;left:30px;top:80px;width:780px;">
        <p style="font-family:${BOLD};font-size:80px;font-weight:900;letter-spacing:0.22em;text-transform:uppercase;color:${NEON_PINK};margin:0 0 12px;text-shadow:${neonGlow(NEON_PINK, 1)};">MANILA</p>
        <div style="width:160px;height:2px;background:${NEON_CYAN};box-shadow:${neonGlow(NEON_CYAN, 0.5)};margin:0 0 22px;"></div>
        <h2 style="font-family:${BOLD};font-size:68px;font-weight:800;line-height:0.95;color:#fff;margin:0 0 8px;letter-spacing:-0.01em;text-shadow:0 0 15px rgba(255,255,255,0.2);">3 steps.</h2>
        <p style="font-family:${BODY};font-size:28px;font-weight:500;color:rgba(255,255,255,0.5);margin:0;">That's it.</p>
      </div>

      <!-- Steps -->
      <div style="position:absolute;left:30px;width:780px;top:420px;">
        ${stepsHtml}
      </div>
    </div>
  `
}

// ========== SLIDE 4: CTA ==========
function slideFour(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${DARK_BG};">
      <!-- Hero image -->
      <img src="${images.cta}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 40%;"/>
      <!-- Neon tint overlay -->
      <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(10,6,16,0.92) 0%, rgba(180,20,100,0.15) 40%, rgba(0,180,255,0.1) 60%, rgba(10,6,16,0.85) 100%);"></div>
      <!-- Heavy dark top gradient -->
      <div style="position:absolute;left:0;right:0;top:0;height:850px;background:linear-gradient(180deg, rgba(10,6,16,0.95) 0%, rgba(10,6,16,0.75) 50%, rgba(10,6,16,0) 100%);"></div>
      <!-- Bottom gradient -->
      <div style="position:absolute;left:0;right:0;bottom:0;height:${SAFE_BOTTOM + 120}px;background:linear-gradient(0deg, rgba(10,6,16,0.7) 0%, rgba(10,6,16,0) 100%);"></div>

      <!-- Ambient neon glow -->
      <div style="position:absolute;top:350px;left:50%;transform:translateX(-50%);width:600px;height:300px;background:radial-gradient(ellipse, ${NEON_PINK}18, transparent 70%);"></div>

      <!-- Content -->
      <div style="position:absolute;left:30px;top:80px;width:780px;">
        <p style="font-family:${BOLD};font-size:80px;font-weight:900;letter-spacing:0.22em;text-transform:uppercase;color:${NEON_PINK};margin:0 0 12px;text-shadow:${neonGlow(NEON_PINK, 1)};">MANILA</p>
        <div style="width:160px;height:2px;background:${NEON_CYAN};box-shadow:${neonGlow(NEON_CYAN, 0.5)};margin:0 0 28px;"></div>
        <h2 style="font-family:${BOLD};font-size:88px;font-weight:800;line-height:0.94;color:#fff;margin:0 0 26px;letter-spacing:-0.02em;text-shadow:0 0 25px rgba(255,255,255,0.3);">Sign up<br/>below.</h2>
        <p style="font-family:${BODY};font-size:32px;font-weight:500;line-height:1.4;color:rgba(255,255,255,0.85);margin:0 0 44px;text-shadow:0 0 8px rgba(0,240,255,0.2);">60-second form. I'll message<br/>you back within a day.</p>
      </div>

      <!-- Neon urgency badge -->
      <div style="position:absolute;left:30px;top:560px;display:inline-flex;align-items:center;padding:16px 30px;border-radius:8px;border:2px solid ${NEON_PINK};box-shadow:${neonBoxGlow(NEON_PINK, 0.5)};background:rgba(255,45,123,0.08);">
        <span style="font-family:${CONDENSED};font-size:24px;font-weight:700;color:${NEON_PINK};letter-spacing:0.12em;text-transform:uppercase;text-shadow:${neonGlow(NEON_PINK, 0.4)};">Limited spots this month</span>
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
    gridG: 'manila-gallery-street-001.jpg',
    gridH: 'manila-gallery-urban-001.jpg',
    gridI: 'manila-gallery-shadow-001.jpg',
    process: 'manila-gallery-dsc-0190.jpg',
    cta: 'manila-gallery-floor-001.jpg'
  }

  writeSources({ all_considered: all, selected: selection })

  const images = Object.fromEntries(
    Object.entries(selection).map(([key, file]) => [key, readImage(file)])
  )

  // --- Render static slides (1, 3, 4) as PNGs ---
  const staticSlides = [
    ['01_neon_hook_story.png', wrap(slideOne(images))],
    ['03_neon_process_story.png', wrap(slideThree(images))],
    ['04_neon_cta_story.png', wrap(slideFour(images))]
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
  console.log('Recording animated neon proof slide as MP4...')

  // 9 images * 350ms stagger = 3150ms for last tile to start
  // + 500ms animation = 3650ms for last tile to finish
  // + 1500ms hold = ~5150ms total
  const TOTAL_DURATION_MS = 5500

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

  // Convert WebM to MP4
  const videoFiles = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.webm'))
  if (videoFiles.length === 0) {
    console.error('No video file was generated!')
  } else {
    const srcVideo = path.join(OUT_DIR, videoFiles[0])
    const dstVideo = path.join(OUT_DIR, '02_neon_proof_story.mp4')
    const { execSync } = await import('child_process')
    try {
      execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${dstVideo}"`, {
        stdio: 'pipe'
      })
      fs.unlinkSync(srcVideo)
      console.log('Rendered 02_neon_proof_story.mp4')
    } catch (err) {
      console.warn('ffmpeg not available, keeping as webm renamed to mp4...')
      fs.renameSync(srcVideo, dstVideo)
      console.log('Rendered 02_neon_proof_story.mp4 (webm container)')
    }
  }

  await browser.close()
  console.log(`Done: 3 static PNGs + 1 animated MP4 written to ${OUT_DIR}`)
}

render().catch(error => {
  console.error(error)
  process.exit(1)
})
