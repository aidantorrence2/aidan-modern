import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, "output-5a")

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 430
const SAFE_TOP = 213
const SAFE_LEFT = 66
const SAFE_RIGHT = 1027

const MANILA_COLOR = '#E8443A'
const BG = '#000000'
const TEXT = '#FFFFFF'
const MUTED = '#BBBBBB'

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

function writeSources(selected) {
  const payload = {
    createdAt: new Date().toISOString(),
    strategy: 'v19b — dark bg, DM CTA, single continuous animated MP4',
    safeBottomPixels: SAFE_BOTTOM,
    images: selected
  }
  fs.writeFileSync(path.join(OUT_DIR, 'sources.json'), JSON.stringify(payload, null, 2))
}

// Single continuous animated HTML page
// Flow: Hook → Proof grid → How it works → DM CTA
// All animated with CSS keyframes, timed sequentially
function buildAnimatedPage(images) {
  const PAD = 64

  // --- Timing plan (milliseconds) ---
  // 0–500:      Hook fades in (MANILA + "Models wanted." + subtext)
  // 500–800:    Hero image scales in
  // 800–4500:   Hold hook
  // 4500–5000:  Hook fades out
  // 5000–5500:  Proof header fades in
  // 5500–8500:  Grid tiles stagger in (9 tiles × 300ms)
  // 8500–10500: Hold proof
  // 10500–11000: Proof fades out
  // 11000–11500: Process header fades in
  // 11500–13500: Steps stagger in (3 × 500ms)
  // 13500–15500: Hold process
  // 15500–16000: Process fades out
  // 16000–16500: CTA fades in (DM me!)
  // 16500–20000: Hold CTA
  // Total: ~20s

  const HOOK_IN = 0
  const HERO_IN = 0.5
  const HOOK_OUT = 4.5
  const PROOF_HDR_IN = 5.0
  const PROOF_GRID_IN = 5.5
  const PROOF_OUT = 10.5
  const PROCESS_HDR_IN = 11.0
  const PROCESS_STEPS_IN = 11.5
  const PROCESS_OUT = 15.5
  const CTA_IN = 16.0

  // Grid layout for proof
  const GRID_TOP = SAFE_TOP + 180
  const GRID_BOTTOM = HEIGHT - SAFE_BOTTOM - 20
  const GRID_HEIGHT = GRID_BOTTOM - GRID_TOP
  const GRID_WIDTH = WIDTH - PAD * 2
  const COLS = 3
  const ROWS = 3
  const GAP = 10
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
      const y = GRID_TOP + row * (cellH + GAP)
      const delay = PROOF_GRID_IN + idx * 0.3
      gridHtml += `
        <div class="proof-section tile" style="position:absolute;left:${x}px;top:${y}px;width:${cellW}px;height:${cellH}px;overflow:hidden;opacity:0;transform:scale(0.85);animation:tileReveal 0.5s ease-out ${delay}s forwards, sectionOut 0.4s ease-in ${PROOF_OUT}s forwards;">
          <img src="${gridImages[idx]}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center;"/>
        </div>
      `
    }
  }

  // Process steps — DM-based
  const steps = [
    { num: '01', title: 'DM me on Instagram', desc: 'Send a message. I reply within a day.' },
    { num: '02', title: 'We plan together', desc: 'Pick a date, location, and vibe.' },
    { num: '03', title: 'Show up & shine', desc: 'I guide every pose. No experience needed.' },
  ]

  let stepsHtml = ''
  const stepStartY = SAFE_TOP + 200
  const stepGap = 320
  for (let i = 0; i < steps.length; i++) {
    const y = stepStartY + i * stepGap
    const s = steps[i]
    const delay = PROCESS_STEPS_IN + i * 0.5
    stepsHtml += `
      <div class="process-section" style="position:absolute;left:${SAFE_LEFT}px;right:${WIDTH - SAFE_RIGHT}px;top:${y}px;opacity:0;animation:fadeSlideUp 0.5s ease-out ${delay}s forwards, sectionOut 0.4s ease-in ${PROCESS_OUT}s forwards;">
        <span style="font-family:${MONO};font-size:36px;font-weight:700;color:${MANILA_COLOR};letter-spacing:0.1em;">${s.num}</span>
        <div style="width:100%;height:3px;background:rgba(255,255,255,0.2);margin:16px 0 20px;"></div>
        <p style="font-family:${HEAD};font-size:60px;font-weight:900;color:${TEXT};line-height:1.05;letter-spacing:-0.02em;margin:0 0 14px;">${s.title}</p>
        <p style="font-family:${HEAD};font-size:36px;font-weight:400;color:${MUTED};line-height:1.3;">${s.desc}</p>
      </div>
    `
  }

  return `<!DOCTYPE html>
<html>
  <head>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      html, body { margin: 0; padding: 0; background: ${BG}; overflow: hidden; }

      @keyframes fadeIn {
        0% { opacity: 0; }
        100% { opacity: 1; }
      }
      @keyframes fadeSlideUp {
        0% { opacity: 0; transform: translateY(40px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      @keyframes heroScale {
        0% { opacity: 0; transform: scale(1.08); }
        100% { opacity: 1; transform: scale(1); }
      }
      @keyframes tileReveal {
        0% { opacity: 0; transform: scale(0.85); }
        100% { opacity: 1; transform: scale(1); }
      }
      @keyframes sectionOut {
        0% { opacity: 1; }
        100% { opacity: 0; }
      }
      @keyframes ctaPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.03); }
      }
    </style>
  </head>
  <body>
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${BG};">

      <!-- ===== SECTION 1: HOOK ===== -->
      <!-- MANILA label -->
      <div class="hook-section" style="position:absolute;left:${SAFE_LEFT}px;top:${SAFE_TOP}px;opacity:0;animation:fadeIn 0.5s ease-out ${HOOK_IN}s forwards, sectionOut 0.4s ease-in ${HOOK_OUT}s forwards;">
        <span style="font-family:${HEAD};font-size:60px;font-weight:900;letter-spacing:0.22em;color:${MANILA_COLOR};text-transform:uppercase;">MANILA</span>
      </div>

      <!-- Main headline -->
      <div class="hook-section" style="position:absolute;left:${SAFE_LEFT}px;right:${WIDTH - SAFE_RIGHT}px;top:${SAFE_TOP + 90}px;opacity:0;animation:fadeSlideUp 0.5s ease-out ${HOOK_IN + 0.15}s forwards, sectionOut 0.4s ease-in ${HOOK_OUT}s forwards;">
        <h1 style="font-family:${HEAD};font-size:140px;font-weight:900;line-height:0.88;color:${TEXT};letter-spacing:-0.04em;">Models<br/>wanted.</h1>
      </h1>
      </div>

      <!-- Sub text -->
      <div class="hook-section" style="position:absolute;left:${SAFE_LEFT}px;right:${WIDTH - SAFE_RIGHT}px;top:${SAFE_TOP + 340}px;opacity:0;animation:fadeSlideUp 0.5s ease-out ${HOOK_IN + 0.3}s forwards, sectionOut 0.4s ease-in ${HOOK_OUT}s forwards;">
        <p style="font-family:${HEAD};font-size:42px;font-weight:400;color:${MUTED};line-height:1.35;">Editorial portrait shoots in Manila.<br/>No experience needed.</p>
      </div>

      <!-- Hero image -->
      <div class="hook-section" style="position:absolute;left:${SAFE_LEFT}px;right:${WIDTH - SAFE_RIGHT}px;top:${SAFE_TOP + 480}px;bottom:${SAFE_BOTTOM + 20}px;overflow:hidden;opacity:0;animation:heroScale 0.7s ease-out ${HERO_IN}s forwards, sectionOut 0.4s ease-in ${HOOK_OUT}s forwards;">
        <img src="${images.hero}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center 15%;"/>
      </div>

      <!-- ===== SECTION 2: PROOF ===== -->
      <!-- Proof header -->
      <div class="proof-section" style="position:absolute;left:${SAFE_LEFT}px;top:${SAFE_TOP}px;opacity:0;animation:fadeIn 0.4s ease-out ${PROOF_HDR_IN}s forwards, sectionOut 0.4s ease-in ${PROOF_OUT}s forwards;">
        <span style="font-family:${HEAD};font-size:60px;font-weight:900;letter-spacing:0.22em;color:${MANILA_COLOR};text-transform:uppercase;">MANILA</span>
      </div>
      <div class="proof-section" style="position:absolute;left:${SAFE_LEFT}px;right:${WIDTH - SAFE_RIGHT}px;top:${SAFE_TOP + 90}px;opacity:0;animation:fadeSlideUp 0.4s ease-out ${PROOF_HDR_IN + 0.1}s forwards, sectionOut 0.4s ease-in ${PROOF_OUT}s forwards;">
        <h2 style="font-family:${HEAD};font-size:80px;font-weight:900;color:${TEXT};line-height:0.95;letter-spacing:-0.03em;">This is my work.</h2>
      </div>

      ${gridHtml}

      <!-- ===== SECTION 3: PROCESS ===== -->
      <!-- Process header -->
      <div class="process-section" style="position:absolute;left:${SAFE_LEFT}px;top:${SAFE_TOP}px;opacity:0;animation:fadeIn 0.4s ease-out ${PROCESS_HDR_IN}s forwards, sectionOut 0.4s ease-in ${PROCESS_OUT}s forwards;">
        <span style="font-family:${HEAD};font-size:60px;font-weight:900;letter-spacing:0.22em;color:${MANILA_COLOR};text-transform:uppercase;">MANILA</span>
      </div>
      <div class="process-section" style="position:absolute;left:${SAFE_LEFT}px;right:${WIDTH - SAFE_RIGHT}px;top:${SAFE_TOP + 90}px;opacity:0;animation:fadeSlideUp 0.4s ease-out ${PROCESS_HDR_IN + 0.1}s forwards, sectionOut 0.4s ease-in ${PROCESS_OUT}s forwards;">
        <h2 style="font-family:${HEAD};font-size:90px;font-weight:900;color:${TEXT};line-height:0.92;letter-spacing:-0.04em;">How it works.</h2>
      </div>

      ${stepsHtml}

      <!-- Process accent image -->
      <div class="process-section" style="position:absolute;right:${WIDTH - SAFE_RIGHT}px;bottom:${SAFE_BOTTOM + 30}px;width:340px;height:420px;overflow:hidden;opacity:0;animation:heroScale 0.6s ease-out ${PROCESS_STEPS_IN + 1.0}s forwards, sectionOut 0.4s ease-in ${PROCESS_OUT}s forwards;">
        <img src="${images.process}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center 20%;"/>
      </div>

      <!-- ===== SECTION 4: CTA ===== -->
      <!-- CTA hero image -->
      <div class="cta-section" style="position:absolute;left:${SAFE_LEFT}px;right:${WIDTH - SAFE_RIGHT}px;top:${SAFE_TOP}px;height:700px;overflow:hidden;opacity:0;animation:heroScale 0.6s ease-out ${CTA_IN}s forwards;">
        <img src="${images.cta}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center 20%;"/>
      </div>

      <!-- MANILA label -->
      <div class="cta-section" style="position:absolute;left:${SAFE_LEFT}px;top:${SAFE_TOP + 740}px;opacity:0;animation:fadeIn 0.4s ease-out ${CTA_IN + 0.2}s forwards;">
        <span style="font-family:${HEAD};font-size:60px;font-weight:900;letter-spacing:0.22em;color:${MANILA_COLOR};text-transform:uppercase;">MANILA</span>
      </div>

      <!-- CTA headline -->
      <div class="cta-section" style="position:absolute;left:${SAFE_LEFT}px;right:${WIDTH - SAFE_RIGHT}px;top:${SAFE_TOP + 830}px;opacity:0;animation:fadeSlideUp 0.5s ease-out ${CTA_IN + 0.3}s forwards;">
        <h2 style="font-family:${HEAD};font-size:108px;font-weight:900;color:${TEXT};line-height:0.9;letter-spacing:-0.04em;">dm me if<br/>interested!!</h2>
      </div>

      <!-- Instagram handle -->
      <div class="cta-section" style="position:absolute;left:${SAFE_LEFT}px;right:${WIDTH - SAFE_RIGHT}px;top:${SAFE_TOP + 1060}px;opacity:0;animation:fadeSlideUp 0.5s ease-out ${CTA_IN + 0.5}s forwards;">
        <p style="font-family:${HEAD};font-size:44px;font-weight:700;color:${MANILA_COLOR};line-height:1.3;">@madebyaidan on Instagram</p>
      </div>

      <!-- Sub-CTA text -->
      <div class="cta-section" style="position:absolute;left:${SAFE_LEFT}px;right:${WIDTH - SAFE_RIGHT}px;top:${SAFE_TOP + 1130}px;opacity:0;animation:fadeSlideUp 0.5s ease-out ${CTA_IN + 0.6}s forwards;">
        <p style="font-family:${HEAD};font-size:36px;font-weight:400;color:${MUTED};line-height:1.35;">Send a message &amp; I'll reply within a day.</p>
      </div>

      <!-- Urgency pill -->
      <div class="cta-section" style="position:absolute;left:${SAFE_LEFT}px;top:${HEIGHT - SAFE_BOTTOM - 80}px;display:inline-flex;align-items:center;padding:18px 36px;background:${MANILA_COLOR};opacity:0;animation:fadeSlideUp 0.5s ease-out ${CTA_IN + 0.7}s forwards, ctaPulse 2s ease-in-out ${CTA_IN + 1.5}s infinite;">
        <span style="font-family:${HEAD};font-size:32px;font-weight:900;color:#FFFFFF;letter-spacing:0.06em;text-transform:uppercase;">Limited spots this month</span>
      </div>

    </div>
  </body>
</html>`
}

async function render() {
  resetOutputDir()

  // Clean photos only — no graffiti/purple border
  const selection = {
    hero: 'manila-gallery-street-001.jpg',
    gridA: 'manila-gallery-closeup-001.jpg',
    gridB: 'manila-gallery-garden-001.jpg',
    gridC: 'manila-gallery-dsc-0075.jpg',
    gridD: 'manila-gallery-night-001.jpg',
    gridE: 'manila-gallery-canal-001.jpg',
    gridF: 'manila-gallery-rocks-001.jpg',
    gridG: 'manila-gallery-urban-002.jpg',
    gridH: 'manila-gallery-shadow-001.jpg',
    gridI: 'manila-gallery-tropical-001.jpg',
    process: 'manila-gallery-dsc-0190.jpg',
    cta: 'manila-gallery-white-001.jpg',
  }

  writeSources(selection)

  const images = Object.fromEntries(
    Object.entries(selection).map(([key, file]) => [key, readImage(file)])
  )

  console.log('Recording single continuous animated MP4...')

  // Total animation duration: ~20s + 1s buffer
  const TOTAL_DURATION_MS = 21000

  const browser = await chromium.launch()

  const videoCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: OUT_DIR,
      size: { width: WIDTH, height: HEIGHT }
    }
  })

  const videoPage = await videoCtx.newPage()

  // Prevent white flash: set background to black before loading content
  await videoPage.evaluate(() => {
    document.documentElement.style.background = '#000000'
    document.body.style.background = '#000000'
  })

  const animatedHtml = buildAnimatedPage(images)
  await videoPage.setContent(animatedHtml, { waitUntil: 'load' })

  // Wait for images to load
  await videoPage.waitForTimeout(500)

  // Wait for the full animation
  await videoPage.waitForTimeout(TOTAL_DURATION_MS)

  // Close to finalize video
  await videoPage.close()
  await videoCtx.close()

  // Find and convert webm to mp4
  const videoFiles = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.webm'))
  if (videoFiles.length === 0) {
    console.error('No video file was generated!')
  } else {
    const srcVideo = path.join(OUT_DIR, videoFiles[0])
    const dstVideo = path.join(OUT_DIR, 'v19b_manila_model_search.mp4')

    const { execSync } = await import('child_process')
    try {
      execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${dstVideo}"`, {
        stdio: 'pipe'
      })
      fs.unlinkSync(srcVideo)
      console.log('Rendered v19b_manila_model_search.mp4')
    } catch (err) {
      console.warn('ffmpeg not available, keeping as webm and renaming to mp4...')
      fs.renameSync(srcVideo, dstVideo)
      console.log('Rendered v19b_manila_model_search.mp4 (webm container)')
    }
  }

  await browser.close()
  console.log(`Done: single continuous animated MP4 written to ${OUT_DIR}`)
}

render().catch(error => {
  console.error(error)
  process.exit(1)
})
