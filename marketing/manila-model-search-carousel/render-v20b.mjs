import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v20b')

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 410

const MANILA_COLOR = '#E8443A'
const BG_DARK = '#0A0A0A'
const TEXT_WHITE = '#F5F5F5'
const TEXT_DIM = '#999999'

const SANS = "'Avenir Next', 'Helvetica Neue', Arial, sans-serif"
const SERIF = "Georgia, 'Times New Roman', serif"

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
    strategy: 'v20b — dark cinematic continuous MP4 with DM-based CTA, bigger text, MANILA_COLOR accent',
    safeBottomPixels: SAFE_BOTTOM,
    images: selected
  }
  fs.writeFileSync(path.join(OUT_DIR, 'sources.json'), JSON.stringify(payload, null, 2))
}

/*
 * SINGLE CONTINUOUS ANIMATED VIDEO
 *
 * Timeline (total ~12s):
 *   0.0s – 3.0s : HOOK — "Models wanted." fades in with hero image
 *   3.0s – 7.5s : PROOF — photo grid tiles animate in staggered
 *   7.5s – 10.0s: PROCESS — 3 simple steps slide up
 *  10.0s – 13.0s: CTA — "dm me if interested!!" with @madebyaidan
 *  13.0s – 14.0s: hold on CTA
 */

function buildAnimatedHtml(images) {
  const PAD = 56
  const USABLE_BOTTOM = HEIGHT - SAFE_BOTTOM

  // --- PROOF GRID LAYOUT ---
  const gridImages = [
    images.gridA, images.gridB, images.gridC,
    images.gridD, images.gridE, images.gridF,
    images.gridG, images.gridH, images.gridI,
  ]

  const GRID_TOP = 340
  const GRID_GAP = 12
  const COL_W = Math.floor((WIDTH - PAD * 2 - GRID_GAP * 2) / 3)
  const ROW_H_1 = 420
  const ROW_H_2 = 380
  const ROW_H_3 = 380

  const gridLayout = []
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const idx = r * 3 + c
      const x = PAD + c * (COL_W + GRID_GAP)
      const rowH = r === 0 ? ROW_H_1 : r === 1 ? ROW_H_2 : ROW_H_3
      const y = GRID_TOP + (r === 0 ? 0 : r === 1 ? ROW_H_1 + GRID_GAP : ROW_H_1 + ROW_H_2 + GRID_GAP * 2)
      gridLayout.push({ img: gridImages[idx], x, y, w: COL_W, h: rowH })
    }
  }

  let gridTilesHtml = ''
  for (let i = 0; i < gridLayout.length; i++) {
    const t = gridLayout[i]
    const stagger = i * 0.25
    gridTilesHtml += `
      <div class="grid-tile" style="
        position:absolute; left:${t.x}px; top:${t.y}px;
        width:${t.w}px; height:${t.h}px;
        border-radius:14px; overflow:hidden;
        opacity:0; transform:scale(0.85) translateY(20px);
        animation: tileIn 0.5s ease-out ${3.0 + stagger}s forwards;
      ">
        <img src="${t.img}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center;" />
      </div>`
  }

  // --- PROCESS STEPS ---
  const steps = [
    { icon: '💬', title: 'DM me on Instagram', desc: 'Send a quick message — I reply personally.' },
    { icon: '📅', title: 'We plan together', desc: 'Date, location, and vibe — all collaborative.' },
    { icon: '📸', title: 'Show up and shine', desc: 'I guide every pose. Zero experience needed.' },
  ]

  let stepsHtml = ''
  const STEP_Y_START = 420
  const STEP_GAP = 250
  for (let i = 0; i < steps.length; i++) {
    const s = steps[i]
    const y = STEP_Y_START + i * STEP_GAP
    const delay = 7.5 + i * 0.4
    stepsHtml += `
      <div class="step-card" style="
        position:absolute; left:${PAD}px; right:${PAD}px; top:${y}px;
        opacity:0; transform:translateY(40px);
        animation: slideUp 0.5s ease-out ${delay}s forwards;
      ">
        <div style="
          display:flex; align-items:center; gap:20px;
          padding:28px 32px;
          background:rgba(255,255,255,0.06);
          border:1px solid rgba(255,255,255,0.1);
          border-radius:16px;
        ">
          <span style="font-size:52px;line-height:1;">${s.icon}</span>
          <div>
            <p style="font-family:${SANS};font-size:36px;font-weight:700;color:${TEXT_WHITE};margin:0 0 6px;line-height:1.15;">${s.title}</p>
            <p style="font-family:${SANS};font-size:26px;font-weight:400;color:${TEXT_DIM};margin:0;line-height:1.3;">${s.desc}</p>
          </div>
        </div>
      </div>`
  }

  return `<!DOCTYPE html>
<html>
<head>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { margin: 0; padding: 0; background: ${BG_DARK}; overflow: hidden; }

  @keyframes fadeIn {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }
  @keyframes fadeInUp {
    0% { opacity: 0; transform: translateY(30px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeOut {
    0% { opacity: 1; }
    100% { opacity: 0; }
  }
  @keyframes tileIn {
    0% { opacity: 0; transform: scale(0.85) translateY(20px); }
    100% { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes slideUp {
    0% { opacity: 0; transform: translateY(40px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulseGlow {
    0%, 100% { box-shadow: 0 0 30px rgba(232,68,58,0.3); }
    50% { box-shadow: 0 0 50px rgba(232,68,58,0.55); }
  }
  @keyframes accentLine {
    0% { width: 0; }
    100% { width: 80px; }
  }

  /* === SECTION: HOOK (0s – 3s) === */
  .hook-section {
    position: absolute; inset: 0;
    opacity: 0;
    animation: fadeIn 0.6s ease-out 0.2s forwards, fadeOut 0.5s ease-out 2.8s forwards;
  }
  .hook-manila {
    opacity: 0;
    animation: fadeIn 0.4s ease-out 0.3s forwards;
  }
  .hook-line {
    width: 0;
    animation: accentLine 0.5s ease-out 0.5s forwards;
  }
  .hook-headline {
    opacity: 0;
    animation: fadeInUp 0.6s ease-out 0.6s forwards;
  }
  .hook-sub {
    opacity: 0;
    animation: fadeInUp 0.5s ease-out 1.0s forwards;
  }
  .hook-image {
    opacity: 0;
    animation: fadeInUp 0.7s ease-out 0.8s forwards;
  }

  /* === SECTION: PROOF (3s – 7.5s) === */
  .proof-section {
    position: absolute; inset: 0;
    opacity: 0;
    animation: fadeIn 0.4s ease-out 2.9s forwards, fadeOut 0.5s ease-out 7.2s forwards;
  }
  .proof-header {
    opacity: 0;
    animation: fadeInUp 0.5s ease-out 3.0s forwards;
  }

  /* === SECTION: PROCESS (7.5s – 10.5s) === */
  .process-section {
    position: absolute; inset: 0;
    opacity: 0;
    animation: fadeIn 0.4s ease-out 7.3s forwards, fadeOut 0.5s ease-out 10.2s forwards;
  }
  .process-header {
    opacity: 0;
    animation: fadeInUp 0.5s ease-out 7.5s forwards;
  }

  /* === SECTION: CTA (10.5s – 14s) === */
  .cta-section {
    position: absolute; inset: 0;
    opacity: 0;
    animation: fadeIn 0.5s ease-out 10.3s forwards;
  }
  .cta-image {
    opacity: 0;
    animation: fadeInUp 0.6s ease-out 10.5s forwards;
  }
  .cta-manila {
    opacity: 0;
    animation: fadeIn 0.4s ease-out 10.6s forwards;
  }
  .cta-line {
    width: 0;
    animation: accentLine 0.5s ease-out 10.8s forwards;
  }
  .cta-headline {
    opacity: 0;
    animation: fadeInUp 0.6s ease-out 10.9s forwards;
  }
  .cta-handle {
    opacity: 0;
    animation: fadeInUp 0.5s ease-out 11.3s forwards;
  }
  .cta-pill {
    opacity: 0;
    animation: fadeInUp 0.5s ease-out 11.6s forwards;
  }
  .cta-pill-glow {
    animation: pulseGlow 2s ease-in-out 12.0s infinite;
  }
</style>
</head>
<body>
  <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${BG_DARK};">

    <!-- ====== HOOK SECTION ====== -->
    <div class="hook-section">
      <!-- MANILA label -->
      <div class="hook-manila" style="position:absolute;left:${PAD}px;top:100px;">
        <span style="font-family:${SANS};font-size:52px;font-weight:700;letter-spacing:0.3em;color:${MANILA_COLOR};text-transform:uppercase;">MANILA</span>
      </div>
      <!-- Accent line -->
      <div class="hook-line" style="position:absolute;left:${PAD}px;top:170px;height:3px;background:${MANILA_COLOR};overflow:hidden;"></div>
      <!-- Headline -->
      <div class="hook-headline" style="position:absolute;left:${PAD}px;right:${PAD}px;top:200px;">
        <h1 style="font-family:${SERIF};font-size:120px;font-weight:normal;font-style:italic;line-height:0.92;color:${TEXT_WHITE};letter-spacing:-0.02em;">Models<br/>wanted.</h1>
      </div>
      <!-- Subhead -->
      <div class="hook-sub" style="position:absolute;left:${PAD}px;right:${PAD}px;top:460px;">
        <p style="font-family:${SANS};font-size:38px;font-weight:400;color:${TEXT_DIM};line-height:1.35;">Editorial portrait sessions.<br/>No experience needed.</p>
      </div>
      <!-- Hero image -->
      <div class="hook-image" style="position:absolute;left:${PAD - 8}px;right:${PAD - 8}px;top:600px;bottom:${SAFE_BOTTOM + 20}px;border-radius:18px;overflow:hidden;box-shadow:0 16px 50px rgba(0,0,0,0.5);">
        <img src="${images.hero}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center 15%;" />
      </div>
    </div>

    <!-- ====== PROOF SECTION ====== -->
    <div class="proof-section">
      <div class="proof-header" style="position:absolute;left:${PAD}px;top:100px;right:${PAD}px;">
        <span style="font-family:${SANS};font-size:52px;font-weight:700;letter-spacing:0.3em;color:${MANILA_COLOR};text-transform:uppercase;">MANILA</span>
        <div style="width:80px;height:3px;background:${MANILA_COLOR};margin-top:16px;margin-bottom:22px;"></div>
        <h2 style="font-family:${SERIF};font-size:72px;font-weight:normal;font-style:italic;color:${TEXT_WHITE};line-height:1.0;">This is my work.</h2>
      </div>
      ${gridTilesHtml}
    </div>

    <!-- ====== PROCESS SECTION ====== -->
    <div class="process-section">
      <div class="process-header" style="position:absolute;left:${PAD}px;top:120px;right:${PAD}px;">
        <span style="font-family:${SANS};font-size:52px;font-weight:700;letter-spacing:0.3em;color:${MANILA_COLOR};text-transform:uppercase;">MANILA</span>
        <div style="width:80px;height:3px;background:${MANILA_COLOR};margin-top:16px;margin-bottom:22px;"></div>
        <h2 style="font-family:${SERIF};font-size:80px;font-weight:normal;font-style:italic;color:${TEXT_WHITE};line-height:0.95;">How it works.</h2>
      </div>
      ${stepsHtml}

      <!-- Small accent image -->
      <div style="
        position:absolute; right:${PAD}px; bottom:${SAFE_BOTTOM + 30}px;
        width:280px; height:200px; border-radius:14px; overflow:hidden;
        box-shadow:0 8px 30px rgba(0,0,0,0.4);
        opacity:0; animation: fadeIn 0.5s ease-out 8.5s forwards;
      ">
        <img src="${images.process}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center 20%;" />
      </div>
    </div>

    <!-- ====== CTA SECTION ====== -->
    <div class="cta-section">
      <!-- Large image top -->
      <div class="cta-image" style="position:absolute;left:${PAD - 8}px;right:${PAD - 8}px;top:80px;height:780px;border-radius:18px;overflow:hidden;box-shadow:0 16px 50px rgba(0,0,0,0.5);">
        <img src="${images.cta}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center 20%;" />
      </div>

      <!-- MANILA label -->
      <div class="cta-manila" style="position:absolute;left:${PAD}px;top:900px;">
        <span style="font-family:${SANS};font-size:52px;font-weight:700;letter-spacing:0.3em;color:${MANILA_COLOR};text-transform:uppercase;">MANILA</span>
      </div>
      <!-- Accent line -->
      <div class="cta-line" style="position:absolute;left:${PAD}px;top:968px;height:3px;background:${MANILA_COLOR};overflow:hidden;"></div>

      <!-- DM Headline -->
      <div class="cta-headline" style="position:absolute;left:${PAD}px;right:${PAD}px;top:996px;">
        <h2 style="font-family:${SERIF};font-size:88px;font-weight:normal;font-style:italic;color:${TEXT_WHITE};line-height:0.95;letter-spacing:-0.02em;">dm me if<br/>interested!!</h2>
      </div>

      <!-- @madebyaidan handle -->
      <div class="cta-handle" style="position:absolute;left:${PAD}px;right:${PAD}px;top:1216px;">
        <p style="font-family:${SANS};font-size:38px;font-weight:500;color:${TEXT_DIM};line-height:1.4;">
          <span style="color:${MANILA_COLOR};font-weight:700;">@madebyaidan</span> on Instagram
        </p>
      </div>

      <!-- Glowing pill -->
      <div class="cta-pill" style="position:absolute;left:${PAD}px;top:1300px;">
        <div class="cta-pill-glow" style="display:inline-flex;align-items:center;padding:18px 36px;border-radius:50px;background:${MANILA_COLOR};">
          <span style="font-family:${SANS};font-size:30px;font-weight:700;color:#FFFFFF;letter-spacing:0.06em;text-transform:uppercase;">Limited spots — DM now</span>
        </div>
      </div>
    </div>

  </div>
</body>
</html>`
}

async function render() {
  resetOutputDir()

  const selection = {
    hero: 'manila-gallery-statue-001.jpg',
    gridA: 'manila-gallery-closeup-001.jpg',
    gridB: 'manila-gallery-canal-001.jpg',
    gridC: 'manila-gallery-dsc-0911.jpg',
    gridD: 'manila-gallery-garden-002.jpg',
    gridE: 'manila-gallery-dsc-0075.jpg',
    gridF: 'manila-gallery-ivy-001.jpg',
    gridG: 'manila-gallery-urban-001.jpg',
    gridH: 'manila-gallery-shadow-001.jpg',
    gridI: 'manila-gallery-tropical-001.jpg',
    process: 'manila-gallery-dsc-0190.jpg',
    cta: 'manila-gallery-park-001.jpg',
  }

  writeSources(selection)

  const images = Object.fromEntries(
    Object.entries(selection).map(([key, file]) => [key, readImage(file)])
  )

  const html = buildAnimatedHtml(images)

  // Total video duration: ~14.5s (last animation at ~12s + 2.5s hold)
  const TOTAL_DURATION_MS = 14500

  const browser = await chromium.launch()

  console.log('Recording continuous animated story as MP4...')

  const videoCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: OUT_DIR,
      size: { width: WIDTH, height: HEIGHT }
    }
  })

  const videoPage = await videoCtx.newPage()
  await videoPage.setContent(html, { waitUntil: 'load' })
  await videoPage.waitForTimeout(500) // let images load
  await videoPage.waitForTimeout(TOTAL_DURATION_MS)
  await videoPage.close()
  await videoCtx.close()

  // Convert WebM to MP4
  const videoFiles = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.webm'))
  if (videoFiles.length === 0) {
    console.error('No video file was generated!')
  } else {
    const srcVideo = path.join(OUT_DIR, videoFiles[0])
    const dstVideo = path.join(OUT_DIR, 'manila-model-search-v20b.mp4')

    const { execSync } = await import('child_process')
    try {
      execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${dstVideo}"`, {
        stdio: 'pipe'
      })
      fs.unlinkSync(srcVideo)
      console.log('Rendered manila-model-search-v20b.mp4')
    } catch (err) {
      console.warn('ffmpeg conversion failed, keeping as webm renamed to mp4...')
      fs.renameSync(srcVideo, dstVideo)
      console.log('Rendered manila-model-search-v20b.mp4 (webm container)')
    }
  }

  await browser.close()
  console.log(`Done: 1 continuous animated MP4 written to ${OUT_DIR}`)
}

render().catch(error => {
  console.error(error)
  process.exit(1)
})
