import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v26')

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 410

const BOLD = "'Avenir Next', 'Helvetica Neue', Arial, sans-serif"
const BODY = "'Avenir Next', 'Helvetica Neue', Arial, sans-serif"
const NARROW = "Futura, 'Arial Narrow', sans-serif"

// Bright accent for MANILA and checkmarks
const ACCENT = '#00C9A7' // bright teal-green — pops on both white and dark
const MANILA_COLOR = ACCENT
const DARK_BG = '#111111'
const LIGHT_BG = '#FAFAFA'

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
    strategy: 'v26 — Quiz/qualifier interactive-feel format, animated checklist slide 2',
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

// ── Slide 1: "Are you our next model?" with striking photo ──
function slideOne(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${DARK_BG};">
      <img src="${images.hero}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 20%;"/>
      <!-- top gradient for text readability -->
      <div style="position:absolute;left:0;right:0;top:0;height:900px;background:linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0) 100%);"></div>
      <!-- bottom safe zone gradient -->
      <div style="position:absolute;left:0;right:0;bottom:0;height:${SAFE_BOTTOM + 120}px;background:linear-gradient(0deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 100%);"></div>
      <div style="position:absolute;left:54px;top:72px;right:54px;">
        <p style="font-family:${NARROW};font-size:80px;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;color:${MANILA_COLOR};margin:0 0 24px;text-shadow:0 2px 20px rgba(0,0,0,0.5);">MANILA</p>
        <h1 style="font-family:${BOLD};font-size:82px;font-weight:800;line-height:1.0;color:#fff;margin:0 0 28px;letter-spacing:-0.02em;">Are you our<br/>next model?</h1>
        <p style="font-family:${BODY};font-size:32px;font-weight:500;line-height:1.4;color:rgba(255,255,255,0.88);margin:0;">Editorial portrait shoots.<br/>No experience needed.</p>
      </div>
      <!-- question mark accent -->
      <div style="position:absolute;right:54px;top:500px;font-family:${BOLD};font-size:240px;font-weight:900;color:${MANILA_COLOR};opacity:0.12;">?</div>
    </div>
  `
}

// ── Slide 2: Animated checklist (returns full HTML for video recording) ──
function slideTwoAnimated() {
  const items = [
    'Based in Manila',
    'Want portfolio photos',
    'No experience? Perfect.',
    'Available this month'
  ]

  const itemsHtml = items.map((text, i) => {
    const delay = 0.6 + i * 0.9 // stagger: first item at 0.6s, then every 0.9s
    const checkDelay = delay + 0.4 // checkmark appears 400ms after text
    return `
      <div class="checklist-item item-${i}" style="display:flex;align-items:center;gap:24px;opacity:0;transform:translateX(-30px);animation:itemSlideIn 0.5s ease-out ${delay}s forwards;">
        <div class="check-box check-${i}" style="width:56px;height:56px;min-width:56px;border-radius:14px;border:3px solid ${ACCENT};display:flex;align-items:center;justify-content:center;position:relative;">
          <span class="checkmark checkmark-${i}" style="font-size:34px;color:${ACCENT};opacity:0;transform:scale(0.3);animation:checkPop 0.35s ease-out ${checkDelay}s forwards;font-weight:800;">&#10003;</span>
        </div>
        <span style="font-family:${BOLD};font-size:40px;font-weight:700;color:#222;line-height:1.2;">${text}</span>
      </div>
    `
  }).join('')

  return `<!DOCTYPE html>
  <html>
    <head>
      <style>
        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; background: ${LIGHT_BG}; }
        @keyframes itemSlideIn {
          0% { opacity: 0; transform: translateX(-30px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes checkPop {
          0% { opacity: 0; transform: scale(0.3); }
          60% { opacity: 1; transform: scale(1.2); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes headerFade {
          0% { opacity: 0; transform: translateY(-20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes boxGlow {
          0% { background: transparent; }
          100% { background: ${ACCENT}18; }
        }
        .header {
          opacity: 0;
          animation: headerFade 0.5s ease-out 0s forwards;
        }
        .check-0 { animation: boxGlow 0.3s ease-out 1.0s forwards; }
        .check-1 { animation: boxGlow 0.3s ease-out 1.9s forwards; }
        .check-2 { animation: boxGlow 0.3s ease-out 2.8s forwards; }
        .check-3 { animation: boxGlow 0.3s ease-out 3.7s forwards; }
      </style>
    </head>
    <body>
      <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${LIGHT_BG};">
        <!-- MANILA header -->
        <div class="header" style="position:absolute;left:60px;top:72px;right:60px;">
          <p style="font-family:${NARROW};font-size:80px;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;color:${MANILA_COLOR};margin:0 0 16px;">MANILA</p>
          <h2 style="font-family:${BOLD};font-size:56px;font-weight:800;line-height:1.05;color:#1a1a1a;margin:0;letter-spacing:-0.02em;">Do you qualify?</h2>
          <div style="width:80px;height:5px;background:${ACCENT};margin-top:20px;border-radius:3px;"></div>
        </div>

        <!-- Checklist -->
        <div style="position:absolute;left:60px;right:60px;top:360px;display:flex;flex-direction:column;gap:48px;">
          ${itemsHtml}
        </div>

        <!-- Bottom hint text -->
        <div class="header" style="position:absolute;left:60px;right:60px;bottom:${SAFE_BOTTOM + 40}px;">
          <p style="font-family:${BODY};font-size:28px;font-weight:500;color:#999;margin:0;text-align:center;">Swipe to see if you're a match</p>
        </div>
      </div>
    </body>
  </html>`
}

// ── Slide 3: "If you checked all 4" with proof photos ──
function slideThree(images) {
  const photos = [images.proofA, images.proofB, images.proofC, images.proofD, images.proofE, images.proofF]

  // 3x2 grid of proof photos — fill space between caption and safe bottom
  const GAP = 10
  const PAD = 40
  const COLS = 3
  const ROWS = 2
  const GRID_W = WIDTH - PAD * 2
  const CELL_W = Math.floor((GRID_W - GAP * (COLS - 1)) / COLS)
  const gridTop = 460
  const gridBottom = HEIGHT - SAFE_BOTTOM - 30
  const CELL_H = Math.floor((gridBottom - gridTop - GAP * (ROWS - 1)) / ROWS)
  let gridHtml = ''
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const idx = r * COLS + c
      if (idx >= photos.length) break
      const x = PAD + c * (CELL_W + GAP)
      const y = gridTop + r * (CELL_H + GAP)
      gridHtml += `<div style="position:absolute;left:${x}px;top:${y}px;width:${CELL_W}px;height:${CELL_H}px;border-radius:16px;overflow:hidden;">
        <img src="${photos[idx]}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center 20%;"/>
      </div>`
    }
  }

  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${LIGHT_BG};">
      <!-- header -->
      <div style="position:absolute;left:60px;top:72px;right:60px;">
        <p style="font-family:${NARROW};font-size:80px;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;color:${MANILA_COLOR};margin:0 0 16px;">MANILA</p>
        <h2 style="font-family:${BOLD};font-size:52px;font-weight:800;line-height:1.05;color:#1a1a1a;margin:0;letter-spacing:-0.02em;">If you checked all 4 —</h2>
        <p style="font-family:${BOLD};font-size:48px;font-weight:800;line-height:1.1;color:#1a1a1a;margin:10px 0 0;">we want to shoot you.</p>
        <div style="width:80px;height:5px;background:${ACCENT};margin-top:20px;border-radius:3px;"></div>
      </div>

      <!-- caption above grid -->
      <div style="position:absolute;left:60px;right:60px;top:410px;">
        <p style="font-family:${BODY};font-size:26px;font-weight:500;color:#888;margin:0;">They all qualified too:</p>
      </div>

      <!-- photo grid -->
      ${gridHtml}
    </div>
  `
}

// ── Slide 4: CTA — "You qualify. Sign up below." ──
function slideFour(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${DARK_BG};">
      <img src="${images.cta}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 30%;"/>
      <!-- top gradient -->
      <div style="position:absolute;left:0;right:0;top:0;height:900px;background:linear-gradient(180deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.65) 50%, rgba(0,0,0,0) 100%);"></div>
      <!-- bottom gradient -->
      <div style="position:absolute;left:0;right:0;bottom:0;height:${SAFE_BOTTOM + 120}px;background:linear-gradient(0deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%);"></div>

      <div style="position:absolute;left:54px;top:72px;right:54px;">
        <p style="font-family:${NARROW};font-size:80px;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;color:${MANILA_COLOR};margin:0 0 24px;text-shadow:0 2px 20px rgba(0,0,0,0.5);">MANILA</p>
        <h2 style="font-family:${BOLD};font-size:92px;font-weight:800;line-height:0.95;color:#fff;margin:0 0 30px;letter-spacing:-0.02em;">You qualify.<br/>Sign up below.</h2>
        <p style="font-family:${BODY};font-size:32px;font-weight:500;line-height:1.4;color:rgba(255,255,255,0.88);margin:0 0 40px;">60-second form. I'll message<br/>you back within a day.</p>
      </div>

      <!-- pre-approved badge -->
      <div style="position:absolute;left:54px;top:560px;display:inline-flex;align-items:center;gap:12px;padding:18px 30px;border-radius:16px;background:${ACCENT};box-shadow:0 4px 24px rgba(0,201,167,0.4);">
        <span style="font-size:28px;">&#10003;</span>
        <span style="font-family:${BOLD};font-size:26px;font-weight:700;color:#fff;letter-spacing:0.03em;">YOU'RE PRE-APPROVED</span>
      </div>
    </div>
  `
}

async function render() {
  resetOutputDir()

  const all = getTopManilaImages()
  const selection = {
    hero: 'manila-gallery-canal-001.jpg',
    proofA: 'manila-gallery-closeup-001.jpg',
    proofB: 'manila-gallery-dsc-0911.jpg',
    proofC: 'manila-gallery-garden-002.jpg',
    proofD: 'manila-gallery-graffiti-001.jpg',
    proofE: 'manila-gallery-urban-001.jpg',
    proofF: 'manila-gallery-ivy-001.jpg',
    cta: 'manila-gallery-floor-001.jpg'
  }

  writeSources({ all_considered: all, selected: selection })

  const images = Object.fromEntries(
    Object.entries(selection).map(([key, file]) => [key, readImage(file)])
  )

  // --- Render static slides (1, 3, 4) as PNGs ---
  const staticSlides = [
    ['01_quiz_hook.png', wrap(slideOne(images))],
    ['03_proof_qualify.png', wrap(slideThree(images))],
    ['04_cta_qualify.png', wrap(slideFour(images))]
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
  console.log('Recording animated checklist slide as MP4...')

  // 4 items * 0.9s stagger = 3.6s for last item start
  // + 0.4s for checkmark + 0.35s animation = ~4.35s for last check
  // + 1.5s hold = ~5.85s total
  const TOTAL_DURATION_MS = 6000

  const videoCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: OUT_DIR,
      size: { width: WIDTH, height: HEIGHT }
    }
  })

  const videoPage = await videoCtx.newPage()
  const animatedHtml = slideTwoAnimated()
  await videoPage.setContent(animatedHtml, { waitUntil: 'load' })
  await videoPage.waitForTimeout(500) // let page settle
  await videoPage.waitForTimeout(TOTAL_DURATION_MS)

  await videoPage.close()
  await videoCtx.close()

  // Find and convert the webm to mp4
  const videoFiles = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.webm'))
  if (videoFiles.length === 0) {
    console.error('No video file was generated!')
  } else {
    const srcVideo = path.join(OUT_DIR, videoFiles[0])
    const dstVideo = path.join(OUT_DIR, '02_checklist_quiz.mp4')

    const { execSync } = await import('child_process')
    try {
      execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${dstVideo}"`, {
        stdio: 'pipe'
      })
      fs.unlinkSync(srcVideo)
      console.log('Rendered 02_checklist_quiz.mp4')
    } catch (err) {
      console.warn('ffmpeg not available, keeping as webm and renaming to mp4...')
      fs.renameSync(srcVideo, dstVideo)
      console.log('Rendered 02_checklist_quiz.mp4 (webm container)')
    }
  }

  await browser.close()
  console.log(`Done: 3 static PNGs + 1 animated MP4 written to ${OUT_DIR}`)
}

render().catch(error => {
  console.error(error)
  process.exit(1)
})
