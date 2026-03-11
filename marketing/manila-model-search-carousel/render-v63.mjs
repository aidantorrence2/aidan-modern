import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v63')

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 410

const BOLD = "'Avenir Next', 'Futura', 'Helvetica Neue', Arial, sans-serif"
const NARROW = "Futura, 'Avenir Next', 'Arial Narrow', sans-serif"

const ACCENT = '#00C9A7'
const DARK_BG = '#0a0a0a'

const HANDLE = 'madebyaidan'

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
    strategy: 'v63 — Single continuous animated MP4 video, quiz/qualifier format from v26, CTA composited via ffmpeg',
    safeBottomPixels: SAFE_BOTTOM,
    images: selected
  }
  fs.writeFileSync(path.join(OUT_DIR, 'sources.json'), JSON.stringify(payload, null, 2))
}

/**
 * Build the main animated HTML page — a single continuous sequence:
 *   0-6s:    Hero photo with Ken Burns zoom + "MANILA" + "Are you our next model?"
 *   6-14s:   Checklist quiz — items animate one by one with checkmark pops
 *   14-20s:  "You checked all 4" + proof photos cascade in
 *   20-22s:  Fade to black (CTA composited separately)
 */
function buildMainVideo(images) {
  // ── Phase timings (seconds) ──
  const P1_START = 0
  const P1_TITLE = 0.6    // "MANILA" fades in
  const P1_SUBTITLE = 1.4 // "Are you our next model?" slides in
  const P1_BODY = 2.2     // Sub-body text
  const P1_END = 5.5      // Start transition to phase 2

  const P2_START = 6.0    // Checklist bg fades in
  const P2_HEADER = 6.4   // "Do you qualify?" header
  const P2_ITEM0 = 7.2    // First checklist item
  const P2_ITEM1 = 8.4    // Second
  const P2_ITEM2 = 9.6    // Third
  const P2_ITEM3 = 10.8   // Fourth
  const P2_END = 12.5     // Hold last check, start transition

  const P3_START = 13.0   // Proof section bg
  const P3_HEADER = 13.4  // "You checked all 4" text
  const P3_PHOTO_START = 14.0 // Photos start cascading
  const P3_END = 18.5     // Hold photos

  const FADE_BLACK = 19.5 // Fade to black
  const TOTAL_DURATION = 21 // seconds

  return `<!DOCTYPE html>
<html>
<head>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { margin: 0; padding: 0; background: ${DARK_BG}; overflow: hidden;
    -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }

  /* ── Ken Burns zoom on hero ── */
  @keyframes kenBurns {
    0%   { transform: scale(1.0); }
    100% { transform: scale(1.15); }
  }

  /* ── Phase 1 text animations ── */
  @keyframes fadeSlideDown {
    0%   { opacity: 0; transform: translateY(-40px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeSlideUp {
    0%   { opacity: 0; transform: translateY(40px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    0%   { opacity: 0; }
    100% { opacity: 1; }
  }
  @keyframes fadeOut {
    0%   { opacity: 1; }
    100% { opacity: 0; }
  }

  /* ── Phase 1 hero container ── */
  .phase1 {
    animation: fadeIn 0.3s ease-out 0s forwards,
               fadeOut 0.5s ease-in ${P1_END}s forwards;
  }
  .hero-img {
    animation: kenBurns ${P1_END + 0.5}s ease-out 0s forwards;
  }
  .p1-manila {
    opacity: 0;
    animation: fadeSlideDown 0.6s ease-out ${P1_TITLE}s forwards;
  }
  .p1-headline {
    opacity: 0;
    animation: fadeSlideUp 0.7s cubic-bezier(0.22,1,0.36,1) ${P1_SUBTITLE}s forwards;
  }
  .p1-body {
    opacity: 0;
    animation: fadeIn 0.6s ease-out ${P1_BODY}s forwards;
  }

  /* ── Phase 2 checklist ── */
  .phase2 {
    opacity: 0;
    animation: fadeIn 0.5s ease-out ${P2_START}s forwards,
               fadeOut 0.5s ease-in ${P2_END}s forwards;
  }
  .p2-header {
    opacity: 0;
    animation: fadeSlideDown 0.5s ease-out ${P2_HEADER}s forwards;
  }

  @keyframes itemSlideIn {
    0%   { opacity: 0; transform: translateX(-50px); }
    100% { opacity: 1; transform: translateX(0); }
  }
  @keyframes checkPop {
    0%   { opacity: 0; transform: scale(0.2); }
    50%  { opacity: 1; transform: scale(1.3); }
    100% { opacity: 1; transform: scale(1); }
  }
  @keyframes boxGlow {
    0%   { background: rgba(0,201,167,0); }
    100% { background: rgba(0,201,167,0.15); }
  }

  .item-0 { opacity:0; animation: itemSlideIn 0.5s ease-out ${P2_ITEM0}s forwards; }
  .item-1 { opacity:0; animation: itemSlideIn 0.5s ease-out ${P2_ITEM1}s forwards; }
  .item-2 { opacity:0; animation: itemSlideIn 0.5s ease-out ${P2_ITEM2}s forwards; }
  .item-3 { opacity:0; animation: itemSlideIn 0.5s ease-out ${P2_ITEM3}s forwards; }

  .check-0 { opacity:0; animation: checkPop 0.4s cubic-bezier(0.34,1.56,0.64,1) ${P2_ITEM0 + 0.5}s forwards; }
  .check-1 { opacity:0; animation: checkPop 0.4s cubic-bezier(0.34,1.56,0.64,1) ${P2_ITEM1 + 0.5}s forwards; }
  .check-2 { opacity:0; animation: checkPop 0.4s cubic-bezier(0.34,1.56,0.64,1) ${P2_ITEM2 + 0.5}s forwards; }
  .check-3 { opacity:0; animation: checkPop 0.4s cubic-bezier(0.34,1.56,0.64,1) ${P2_ITEM3 + 0.5}s forwards; }

  .box-0 { animation: boxGlow 0.3s ease-out ${P2_ITEM0 + 0.5}s forwards; }
  .box-1 { animation: boxGlow 0.3s ease-out ${P2_ITEM1 + 0.5}s forwards; }
  .box-2 { animation: boxGlow 0.3s ease-out ${P2_ITEM2 + 0.5}s forwards; }
  .box-3 { animation: boxGlow 0.3s ease-out ${P2_ITEM3 + 0.5}s forwards; }

  /* ── Phase 3 proof photos ── */
  .phase3 {
    opacity: 0;
    animation: fadeIn 0.5s ease-out ${P3_START}s forwards,
               fadeOut 0.5s ease-in ${FADE_BLACK - 0.5}s forwards;
  }
  .p3-header {
    opacity: 0;
    animation: fadeSlideDown 0.5s ease-out ${P3_HEADER}s forwards;
  }

  @keyframes flyFromLeft {
    0%   { opacity: 0; transform: translateX(-200px) rotate(-8deg) scale(0.8); }
    100% { opacity: 1; transform: translateX(0) rotate(0deg) scale(1); }
  }
  @keyframes flyFromRight {
    0%   { opacity: 0; transform: translateX(200px) rotate(8deg) scale(0.8); }
    100% { opacity: 1; transform: translateX(0) rotate(0deg) scale(1); }
  }
  @keyframes cascadeIn {
    0%   { opacity: 0; transform: translateY(100px) scale(0.85); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
  }

  .proof-0 { opacity:0; animation: flyFromLeft 0.6s cubic-bezier(0.22,1,0.36,1) ${P3_PHOTO_START}s forwards; }
  .proof-1 { opacity:0; animation: flyFromRight 0.6s cubic-bezier(0.22,1,0.36,1) ${P3_PHOTO_START + 0.3}s forwards; }
  .proof-2 { opacity:0; animation: cascadeIn 0.6s cubic-bezier(0.22,1,0.36,1) ${P3_PHOTO_START + 0.6}s forwards; }
  .proof-3 { opacity:0; animation: flyFromLeft 0.6s cubic-bezier(0.22,1,0.36,1) ${P3_PHOTO_START + 0.9}s forwards; }
  .proof-4 { opacity:0; animation: flyFromRight 0.6s cubic-bezier(0.22,1,0.36,1) ${P3_PHOTO_START + 1.2}s forwards; }
  .proof-5 { opacity:0; animation: cascadeIn 0.6s cubic-bezier(0.22,1,0.36,1) ${P3_PHOTO_START + 1.5}s forwards; }

  /* ── Final fade to black ── */
  .fade-to-black {
    opacity: 0;
    animation: fadeIn 0.6s ease-in ${FADE_BLACK}s forwards;
  }
</style>
</head>
<body>
<div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${DARK_BG};">

  <!-- ═══ PHASE 1: Hero + Ken Burns ═══ -->
  <div class="phase1" style="position:absolute;inset:0;z-index:1;">
    <div style="position:absolute;inset:0;overflow:hidden;">
      <img class="hero-img" src="${images.hero}"
           style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 20%;"/>
    </div>
    <!-- dark overlay for text readability -->
    <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 45%, rgba(0,0,0,0.1) 65%, rgba(0,0,0,0.6) 100%);"></div>

    <div style="position:absolute;left:60px;top:100px;right:60px;">
      <p class="p1-manila" style="font-family:${NARROW};font-size:140px;font-weight:900;letter-spacing:0.12em;text-transform:uppercase;color:${ACCENT};margin:0 0 20px;text-shadow:0 4px 40px rgba(0,201,167,0.4), 0 2px 10px rgba(0,0,0,0.6);">MANILA</p>
      <h1 class="p1-headline" style="font-family:${BOLD};font-size:88px;font-weight:800;line-height:1.0;color:#fff;margin:0 0 30px;letter-spacing:-0.02em;text-shadow:0 2px 20px rgba(0,0,0,0.5);">Are you our<br/>next model?</h1>
      <p class="p1-body" style="font-family:${BOLD};font-size:40px;font-weight:500;line-height:1.35;color:rgba(255,255,255,0.9);margin:0;text-shadow:0 2px 10px rgba(0,0,0,0.5);">Editorial portrait shoots.<br/>No experience needed.</p>
    </div>
  </div>

  <!-- ═══ PHASE 2: Animated Checklist ═══ -->
  <div class="phase2" style="position:absolute;inset:0;z-index:2;background:${DARK_BG};">
    <div style="position:absolute;left:60px;top:100px;right:60px;">
      <p class="p2-header" style="font-family:${NARROW};font-size:130px;font-weight:900;letter-spacing:0.12em;text-transform:uppercase;color:${ACCENT};margin:0 0 12px;text-shadow:0 2px 30px rgba(0,201,167,0.3);">MANILA</p>
      <h2 class="p2-header" style="font-family:${BOLD};font-size:64px;font-weight:800;line-height:1.05;color:#fff;margin:0 0 16px;letter-spacing:-0.01em;">Do you qualify?</h2>
      <div class="p2-header" style="width:80px;height:5px;background:${ACCENT};border-radius:3px;"></div>
    </div>

    <div style="position:absolute;left:70px;right:70px;top:440px;display:flex;flex-direction:column;gap:56px;">
      ${['Based in Manila', 'Want portfolio photos', 'No experience? Perfect.', 'Available this month'].map((text, i) => `
        <div class="item-${i}" style="display:flex;align-items:center;gap:28px;">
          <div class="box-${i}" style="width:64px;height:64px;min-width:64px;border-radius:16px;border:3px solid ${ACCENT};display:flex;align-items:center;justify-content:center;">
            <span class="check-${i}" style="font-size:40px;color:${ACCENT};font-weight:800;">&#10003;</span>
          </div>
          <span style="font-family:${BOLD};font-size:54px;font-weight:700;color:#fff;line-height:1.15;">${text}</span>
        </div>
      `).join('')}
    </div>
  </div>

  <!-- ═══ PHASE 3: Proof photos ═══ -->
  <div class="phase3" style="position:absolute;inset:0;z-index:3;background:${DARK_BG};">
    <div style="position:absolute;left:60px;top:80px;right:60px;">
      <p class="p3-header" style="font-family:${NARROW};font-size:130px;font-weight:900;letter-spacing:0.12em;text-transform:uppercase;color:${ACCENT};margin:0 0 12px;text-shadow:0 2px 30px rgba(0,201,167,0.3);">MANILA</p>
      <h2 class="p3-header" style="font-family:${BOLD};font-size:56px;font-weight:800;line-height:1.05;color:#fff;margin:0 0 8px;">You checked all 4 —</h2>
      <p class="p3-header" style="font-family:${BOLD};font-size:50px;font-weight:700;color:rgba(255,255,255,0.9);margin:0 0 10px;">we want to shoot you.</p>
      <p class="p3-header" style="font-family:${BOLD};font-size:30px;font-weight:500;color:rgba(255,255,255,0.5);margin:0;">They all qualified too:</p>
    </div>

    <!-- 3x2 photo grid with cascade/fly animations -->
    ${(() => {
      const GAP = 12
      const PAD = 40
      const COLS = 3
      const ROWS = 2
      const GRID_W = WIDTH - PAD * 2
      const CELL_W = Math.floor((GRID_W - GAP * (COLS - 1)) / COLS)
      const gridTop = 520
      const gridBottom = HEIGHT - SAFE_BOTTOM - 30
      const CELL_H = Math.floor((gridBottom - gridTop - GAP * (ROWS - 1)) / ROWS)
      const proofKeys = ['proofA', 'proofB', 'proofC', 'proofD', 'proofE', 'proofF']
      let html = ''
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const idx = r * COLS + c
          const x = PAD + c * (CELL_W + GAP)
          const y = gridTop + r * (CELL_H + GAP)
          html += `<div class="proof-${idx}" style="position:absolute;left:${x}px;top:${y}px;width:${CELL_W}px;height:${CELL_H}px;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.5);">
            <img src="${images[proofKeys[idx]]}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center 20%;"/>
          </div>`
        }
      }
      return html
    })()}
  </div>

  <!-- ═══ FADE TO BLACK ═══ -->
  <div class="fade-to-black" style="position:absolute;inset:0;background:${DARK_BG};z-index:10;pointer-events:none;"></div>

</div>
</body>
</html>`
}

/**
 * Build the CTA as a static page — screenshotted as PNG then composited via ffmpeg.
 * Matches v42 methodology: photo collage + bold typography, rendered as screenshot.
 */
function buildCTA(images) {
  function cropImg(src, w, h, pos = 'center 20%') {
    return `<div style="width:${w}px;height:${h}px;overflow:hidden;border-radius:16px;box-shadow:0 8px 40px rgba(0,0,0,0.5);">
      <img src="${src}" style="width:130%;height:130%;object-fit:cover;object-position:${pos};display:block;margin:-15% 0 0 -15%;"/>
    </div>`
  }

  return `<!DOCTYPE html><html><head>
    <style>* { box-sizing:border-box;margin:0;padding:0; } html,body { background:#000; -webkit-font-smoothing:antialiased; }</style>
  </head><body>
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#000;">

      <!-- Photo grid — 3 photos staggered -->
      <div style="position:absolute;top:120px;left:50px;transform:rotate(-3deg);">
        ${cropImg(images.proofA, 460, 620, 'center 20%')}
      </div>
      <div style="position:absolute;top:180px;right:50px;transform:rotate(2.5deg);">
        ${cropImg(images.proofE, 420, 560, 'center 25%')}
      </div>
      <div style="position:absolute;top:620px;left:280px;transform:rotate(-1deg);z-index:5;">
        ${cropImg(images.proofF, 500, 380, 'center 30%')}
      </div>

      <!-- Dark gradient overlay -->
      <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 20%, rgba(0,0,0,0.0) 35%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.95) 72%, #000 85%);"></div>

      <!-- Text content — above SAFE_BOTTOM -->
      <div style="position:absolute;left:0;right:0;bottom:${SAFE_BOTTOM + 40}px;padding:0 70px;text-align:center;">

        <!-- Thin teal accent line -->
        <div style="width:50px;height:3px;background:${ACCENT};margin:0 auto 30px;"></div>

        <!-- MANILA — huge, white, heavy -->
        <p style="font-family:${NARROW};font-size:180px;font-weight:900;letter-spacing:0.14em;color:#fff;margin:0;text-transform:uppercase;text-shadow:0 4px 80px rgba(0,201,167,0.4), 0 2px 20px rgba(0,0,0,0.8);">MANILA</p>

        <!-- PHOTO SHOOT — light weight, wide tracking -->
        <p style="font-family:${NARROW};font-size:38px;font-weight:300;color:rgba(255,255,255,0.9);margin:4px 0 0;letter-spacing:0.3em;text-transform:uppercase;">PHOTO SHOOT</p>
      </div>
    </div>
  </body></html>`
}

async function render() {
  resetOutputDir()

  const selection = {
    hero: 'manila-gallery-canal-001.jpg',
    proofA: 'manila-gallery-closeup-001.jpg',
    proofB: 'manila-gallery-dsc-0911.jpg',
    proofC: 'manila-gallery-garden-002.jpg',
    proofD: 'manila-gallery-graffiti-001.jpg',
    proofE: 'manila-gallery-urban-001.jpg',
    proofF: 'manila-gallery-ivy-001.jpg',
  }

  writeSources({ selected: selection })

  const images = Object.fromEntries(
    Object.entries(selection).map(([key, file]) => [key, readImage(file)])
  )

  const { execSync } = await import('child_process')
  const browser = await chromium.launch()

  // ── Step 1: Record main animated video ──
  console.log('Recording animated video (~21s)...')
  const TOTAL_DURATION_MS = 22000 // 21s content + 1s buffer

  const videoCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: OUT_DIR,
      size: { width: WIDTH, height: HEIGHT }
    }
  })

  const videoPage = await videoCtx.newPage()
  await videoPage.setContent(buildMainVideo(images), { waitUntil: 'load' })
  await videoPage.waitForTimeout(500) // let page settle
  await videoPage.waitForTimeout(TOTAL_DURATION_MS)
  await videoPage.close()
  await videoCtx.close()

  // ── Step 2: Render CTA as high-quality screenshot ──
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

  // ── Step 3: Convert webm to mp4, concat with 5s CTA still ──
  const videoFiles = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.webm'))
  if (videoFiles.length === 0) {
    console.error('No video file was generated!')
    return
  }

  const srcVideo = path.join(OUT_DIR, videoFiles[0])
  const chatMp4 = path.join(OUT_DIR, 'main_part.mp4')
  const ctaMp4 = path.join(OUT_DIR, 'cta_part.mp4')
  const finalMp4 = path.join(OUT_DIR, '01_quiz_video.mp4')
  const concatFile = path.join(OUT_DIR, 'concat.txt')

  try {
    // Convert main video webm to mp4
    console.log('Converting webm to mp4...')
    execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${chatMp4}"`, { stdio: 'pipe' })

    // Create 5-second CTA video from static image
    console.log('Creating 5s CTA clip from screenshot...')
    execSync(`ffmpeg -y -loop 1 -i "${ctaPath}" -c:v libx264 -t 5 -pix_fmt yuv420p -r 30 -vf "scale=${WIDTH}:${HEIGHT}" -an "${ctaMp4}"`, { stdio: 'pipe' })

    // Concat main video + CTA
    console.log('Concatenating main video + CTA...')
    fs.writeFileSync(concatFile, `file '${chatMp4}'\nfile '${ctaMp4}'\n`)
    execSync(`ffmpeg -y -f concat -safe 0 -i "${concatFile}" -c copy "${finalMp4}"`, { stdio: 'pipe' })

    // Cleanup temp files
    fs.unlinkSync(srcVideo)
    fs.unlinkSync(chatMp4)
    fs.unlinkSync(ctaMp4)
    fs.unlinkSync(concatFile)
    console.log('Rendered 01_quiz_video.mp4 (main + CTA)')
  } catch (err) {
    console.error('ffmpeg error:', err.message)
    // Fallback: just rename the webm
    if (fs.existsSync(srcVideo)) {
      fs.renameSync(srcVideo, finalMp4)
      console.log('Fallback: renamed webm to mp4')
    }
  }

  console.log(`Done: output written to ${OUT_DIR}`)
}

render().catch(error => {
  console.error(error)
  process.exit(1)
})
