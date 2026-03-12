import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'
import { execSync } from 'child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, "output-14a")

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 430
const SAFE_TOP = 213
const SAFE_LEFT = 66
const SAFE_RIGHT = 1027

// ── AESTHETIC: Warm editorial / Kinfolk magazine ──
// Muted sage-cream background, terracotta MANILA accent, warm earth tones
const BG = '#F0EBE3'          // warm cream
const TEXT_DARK = '#2C2420'    // dark espresso
const TEXT_MID = '#5C4F47'     // warm gray-brown
const ACCENT = '#C4562A'       // terracotta / burnt sienna for MANILA
const CARD_BG = '#E5DFD5'     // slightly darker cream for cards
const CARD_BORDER = '#D4CEC4' // subtle warm border

// Typography
const SERIF = "'Georgia', 'Times New Roman', serif"
const SANS = "'Avenir Next', 'Helvetica Neue', Arial, sans-serif"

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
    strategy: 'v21 — warm editorial magazine aesthetic, all 4 slides animated MP4, terracotta MANILA accent',
    safeBottomPixels: SAFE_BOTTOM,
    images: selected
  }
  fs.writeFileSync(path.join(OUT_DIR, 'sources.json'), JSON.stringify(payload, null, 2))
}

// ─── SLIDE 1: HOOK — typewriter text reveal + image fade-in ───
function slideOneHtml(images) {
  return `<!DOCTYPE html>
<html>
<head>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { margin: 0; padding: 0; background: ${BG}; overflow: hidden; }

  @keyframes fadeUp {
    0% { opacity: 0; transform: translateY(30px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  @keyframes imageReveal {
    0% { opacity: 0; clip-path: inset(0 0 100% 0); }
    100% { opacity: 1; clip-path: inset(0 0 0% 0); }
  }
  @keyframes accentLine {
    0% { width: 0; }
    100% { width: 120px; }
  }

  .manila-label {
    opacity: 0;
    animation: fadeUp 0.6s ease-out 0.2s forwards;
  }
  .headline-1 {
    opacity: 0;
    animation: fadeUp 0.6s ease-out 0.6s forwards;
  }
  .headline-2 {
    opacity: 0;
    animation: fadeUp 0.6s ease-out 0.9s forwards;
  }
  .subtext {
    opacity: 0;
    animation: fadeUp 0.5s ease-out 1.3s forwards;
  }
  .accent-line {
    height: 4px;
    background: ${ACCENT};
    width: 0;
    animation: accentLine 0.6s ease-out 1.6s forwards;
  }
  .hero-image {
    opacity: 0;
    animation: imageReveal 1.0s ease-out 1.8s forwards;
  }
</style>
</head>
<body>
  <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${BG};">
    <!-- Text block -->
    <div style="position:absolute;left:${SAFE_LEFT}px;top:${SAFE_TOP}px;right:${WIDTH - SAFE_RIGHT}px;">
      <p class="manila-label" style="font-family:${SANS};font-size:48px;font-weight:700;letter-spacing:0.28em;text-transform:uppercase;color:${ACCENT};margin:0 0 20px;">Manila</p>
      <h1 class="headline-1" style="font-family:${SERIF};font-size:100px;font-weight:700;line-height:0.95;color:${TEXT_DARK};margin:0;letter-spacing:-0.02em;">Models</h1>
      <h1 class="headline-2" style="font-family:${SERIF};font-size:100px;font-weight:700;line-height:0.95;color:${TEXT_DARK};margin:0 0 24px;letter-spacing:-0.02em;">wanted.</h1>
      <div class="accent-line" style="margin:0 0 24px;"></div>
      <p class="subtext" style="font-family:${SANS};font-size:32px;font-weight:400;color:${TEXT_MID};line-height:1.4;margin:0;">Editorial portrait shoots.<br/>No experience needed.</p>
    </div>

    <!-- Hero image bottom portion -->
    <div class="hero-image" style="position:absolute;left:${SAFE_LEFT}px;right:${WIDTH - SAFE_RIGHT}px;top:660px;bottom:${SAFE_BOTTOM + 20}px;border-radius:16px;overflow:hidden;">
      <img src="${images.hero}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center 15%;"/>
    </div>
  </div>
</body>
</html>`
}

// ─── SLIDE 2: PROOF — staggered image grid reveal ───
function slideTwoHtml(images) {
  const PAD = 48
  const GAP = 10
  const HEADER_END = 380
  const GRID_BOTTOM = HEIGHT - SAFE_BOTTOM - 20
  const GRID_HEIGHT = GRID_BOTTOM - HEADER_END
  const GRID_WIDTH = WIDTH - PAD * 2

  // 10 images in a masonry-like layout
  // Row 1: 3 images, Row 2: 2 images, Row 3: 3 images, Row 4: 2 images
  const layout = [
    { row: 0, cols: 3, images: [
      { src: images.gridA, aspect: 1059/1600 },
      { src: images.gridB, aspect: 957/1510 },
      { src: images.gridC, aspect: 1600/1061 },
    ]},
    { row: 1, cols: 2, images: [
      { src: images.gridD, aspect: 1080/1080 },
      { src: images.gridE, aspect: 968/1508 },
    ]},
    { row: 2, cols: 3, images: [
      { src: images.gridF, aspect: 1600/1072 },
      { src: images.gridG, aspect: 1228/1818 },
      { src: images.gridH, aspect: 1228/1818 },
    ]},
    { row: 3, cols: 2, images: [
      { src: images.gridI, aspect: 1067/1600 },
      { src: images.gridJ, aspect: 1600/1061 },
    ]},
  ]

  const ROW_COUNT = layout.length
  const rowH = Math.floor((GRID_HEIGHT - (ROW_COUNT - 1) * GAP) / ROW_COUNT)

  let tilesHtml = ''
  let imgIdx = 0
  let y = HEADER_END

  for (const rowDef of layout) {
    const totalGaps = (rowDef.cols - 1) * GAP
    const cellW = Math.floor((GRID_WIDTH - totalGaps) / rowDef.cols)

    let x = PAD
    for (let i = 0; i < rowDef.images.length; i++) {
      const w = i === rowDef.images.length - 1 ? (GRID_WIDTH - (rowDef.cols - 1) * (cellW + GAP)) : cellW
      const delay = 0.3 + imgIdx * 0.3
      tilesHtml += `<div class="tile" style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${rowH}px;border-radius:12px;overflow:hidden;opacity:0;transform:translateY(20px) scale(0.95);animation:tileIn 0.5s ease-out ${delay}s forwards;">
        <img src="${rowDef.images[i].src}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center;"/>
      </div>`
      x += cellW + GAP
      imgIdx++
    }
    y += rowH + GAP
  }

  return `<!DOCTYPE html>
<html>
<head>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { margin: 0; padding: 0; background: ${BG}; overflow: hidden; }

  @keyframes fadeUp {
    0% { opacity: 0; transform: translateY(20px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  @keyframes tileIn {
    0% { opacity: 0; transform: translateY(20px) scale(0.95); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
  }

  .header-manila {
    opacity: 0;
    animation: fadeUp 0.5s ease-out 0s forwards;
  }
  .header-title {
    opacity: 0;
    animation: fadeUp 0.5s ease-out 0.15s forwards;
  }
</style>
</head>
<body>
  <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${BG};">
    <div style="position:absolute;left:${SAFE_LEFT}px;top:${SAFE_TOP}px;right:${WIDTH - SAFE_RIGHT}px;">
      <p class="header-manila" style="font-family:${SANS};font-size:48px;font-weight:700;letter-spacing:0.28em;text-transform:uppercase;color:${ACCENT};margin:0 0 12px;">Manila</p>
      <h2 class="header-title" style="font-family:${SERIF};font-size:64px;font-weight:700;line-height:0.95;color:${TEXT_DARK};margin:0;letter-spacing:-0.02em;">This is my work.</h2>
    </div>
    ${tilesHtml}
  </div>
</body>
</html>`
}

// ─── SLIDE 3: PROCESS — steps slide in from left sequentially ───
function slideThreeHtml(images) {
  const PAD = 72

  const steps = [
    { num: '01', title: 'Sign up below', desc: 'Takes 60 seconds. I message you back.' },
    { num: '02', title: 'We plan together', desc: 'Pick a date, location, and vibe.' },
    { num: '03', title: 'Show up', desc: 'I guide every pose. No experience needed.' },
  ]

  let stepsHtml = ''
  const stepStartY = 460
  const stepGap = 220

  for (let i = 0; i < steps.length; i++) {
    const y = stepStartY + i * stepGap
    const delay = 0.8 + i * 0.5
    const s = steps[i]
    stepsHtml += `
      <div class="step-card" style="position:absolute;left:${SAFE_LEFT}px;right:${WIDTH - SAFE_RIGHT}px;top:${y}px;padding:28px 34px;border-radius:16px;background:${CARD_BG};border:1px solid ${CARD_BORDER};opacity:0;transform:translateX(-60px);animation:slideIn 0.6s ease-out ${delay}s forwards;">
        <span style="font-family:${SANS};font-size:22px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:${ACCENT};">${s.num}</span>
        <p style="font-family:${SERIF};font-size:44px;font-weight:700;color:${TEXT_DARK};margin:10px 0 8px;line-height:1.05;letter-spacing:-0.01em;">${s.title}</p>
        <p style="font-family:${SANS};font-size:26px;font-weight:400;color:${TEXT_MID};line-height:1.3;">${s.desc}</p>
      </div>
    `
  }

  return `<!DOCTYPE html>
<html>
<head>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { margin: 0; padding: 0; background: ${BG}; overflow: hidden; }

  @keyframes fadeUp {
    0% { opacity: 0; transform: translateY(20px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideIn {
    0% { opacity: 0; transform: translateX(-60px); }
    100% { opacity: 1; transform: translateX(0); }
  }
  @keyframes accentLine {
    0% { width: 0; }
    100% { width: 80px; }
  }

  .manila-label {
    opacity: 0;
    animation: fadeUp 0.5s ease-out 0s forwards;
  }
  .process-headline {
    opacity: 0;
    animation: fadeUp 0.5s ease-out 0.2s forwards;
  }
  .process-sub {
    opacity: 0;
    animation: fadeUp 0.4s ease-out 0.5s forwards;
  }
  .accent-line-sm {
    height: 3px;
    background: ${ACCENT};
    width: 0;
    animation: accentLine 0.5s ease-out 0.6s forwards;
  }
  .process-image {
    opacity: 0;
    animation: fadeUp 0.8s ease-out 2.6s forwards;
  }
</style>
</head>
<body>
  <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${BG};">
    <!-- Header -->
    <div style="position:absolute;left:${SAFE_LEFT}px;top:${SAFE_TOP}px;right:${WIDTH - SAFE_RIGHT}px;">
      <p class="manila-label" style="font-family:${SANS};font-size:48px;font-weight:700;letter-spacing:0.28em;text-transform:uppercase;color:${ACCENT};margin:0 0 14px;">Manila</p>
      <h2 class="process-headline" style="font-family:${SERIF};font-size:76px;font-weight:700;line-height:0.92;color:${TEXT_DARK};margin:0 0 8px;letter-spacing:-0.02em;">How it works.</h2>
      <div class="accent-line-sm" style="margin:0 0 6px;"></div>
      <p class="process-sub" style="font-family:${SANS};font-size:28px;font-weight:400;color:${TEXT_MID};">3 steps. That's it.</p>
    </div>

    ${stepsHtml}

    <!-- Small accent image at bottom -->
    <div class="process-image" style="position:absolute;right:${PAD}px;bottom:${SAFE_BOTTOM + 30}px;width:300px;height:380px;border-radius:16px;overflow:hidden;">
      <img src="${images.process}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center 20%;"/>
    </div>
  </div>
</body>
</html>`
}

// ─── SLIDE 4: CTA — text fades in, urgency badge pulses ───
function slideFourHtml(images) {
  return `<!DOCTYPE html>
<html>
<head>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { margin: 0; padding: 0; background: ${BG}; overflow: hidden; }

  @keyframes fadeUp {
    0% { opacity: 0; transform: translateY(24px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  @keyframes imageReveal {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }
  @keyframes accentLine {
    0% { width: 0; }
    100% { width: 140px; }
  }
  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.04); opacity: 0.9; }
  }
  @keyframes badgeFade {
    0% { opacity: 0; transform: translateY(10px); }
    100% { opacity: 1; transform: translateY(0); }
  }

  .manila-label {
    opacity: 0;
    animation: fadeUp 0.6s ease-out 0.2s forwards;
  }
  .cta-headline-1 {
    opacity: 0;
    animation: fadeUp 0.6s ease-out 0.6s forwards;
  }
  .cta-headline-2 {
    opacity: 0;
    animation: fadeUp 0.6s ease-out 0.9s forwards;
  }
  .accent-line-cta {
    height: 4px;
    background: ${ACCENT};
    width: 0;
    animation: accentLine 0.5s ease-out 1.2s forwards;
  }
  .cta-subtext {
    opacity: 0;
    animation: fadeUp 0.5s ease-out 1.5s forwards;
  }
  .urgency-badge {
    opacity: 0;
    animation: badgeFade 0.5s ease-out 2.0s forwards, pulse 1.8s ease-in-out 2.5s infinite;
  }
  .cta-image {
    opacity: 0;
    animation: imageReveal 1.0s ease-out 2.4s forwards;
  }
</style>
</head>
<body>
  <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${BG};">
    <!-- Text block -->
    <div style="position:absolute;left:${SAFE_LEFT}px;top:${SAFE_TOP}px;right:${WIDTH - SAFE_RIGHT}px;">
      <p class="manila-label" style="font-family:${SANS};font-size:48px;font-weight:700;letter-spacing:0.28em;text-transform:uppercase;color:${ACCENT};margin:0 0 20px;">Manila</p>
      <h2 class="cta-headline-1" style="font-family:${SERIF};font-size:92px;font-weight:700;line-height:0.92;color:${TEXT_DARK};margin:0;letter-spacing:-0.02em;">Sign up</h2>
      <h2 class="cta-headline-2" style="font-family:${SERIF};font-size:92px;font-weight:700;line-height:0.92;color:${TEXT_DARK};margin:0 0 20px;letter-spacing:-0.02em;">below.</h2>
      <div class="accent-line-cta" style="margin:0 0 20px;"></div>
      <p class="cta-subtext" style="font-family:${SANS};font-size:30px;font-weight:400;color:${TEXT_MID};line-height:1.4;margin:0 0 28px;">60-second form. I'll message<br/>you back within a day.</p>
      <div class="urgency-badge" style="display:inline-flex;align-items:center;padding:14px 26px;border-radius:12px;background:${ACCENT};">
        <span style="font-family:${SANS};font-size:24px;font-weight:700;color:#FFFFFF;letter-spacing:0.08em;text-transform:uppercase;">Limited spots this month</span>
      </div>
    </div>

    <!-- CTA image bottom portion -->
    <div class="cta-image" style="position:absolute;left:${SAFE_LEFT}px;right:${WIDTH - SAFE_RIGHT}px;top:720px;bottom:${SAFE_BOTTOM + 20}px;border-radius:16px;overflow:hidden;">
      <img src="${images.cta}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center 20%;"/>
    </div>
  </div>
</body>
</html>`
}

// ─── Record a single animated slide as MP4 ───
async function recordSlideVideo(browser, html, outputName, durationMs) {
  const tmpDir = path.join(OUT_DIR, '_tmp_' + outputName.replace('.mp4', ''))
  fs.mkdirSync(tmpDir, { recursive: true })

  const ctx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: tmpDir,
      size: { width: WIDTH, height: HEIGHT }
    }
  })

  const page = await ctx.newPage()
  await page.setContent(html, { waitUntil: 'load' })
  await page.waitForTimeout(500) // let images load
  await page.waitForTimeout(durationMs)
  await page.close()
  await ctx.close()

  // Find generated webm and convert to mp4
  const webmFiles = fs.readdirSync(tmpDir).filter(f => f.endsWith('.webm'))
  if (webmFiles.length === 0) {
    console.error(`No video file generated for ${outputName}!`)
    fs.rmSync(tmpDir, { recursive: true, force: true })
    return false
  }

  const srcVideo = path.join(tmpDir, webmFiles[0])
  const dstVideo = path.join(OUT_DIR, outputName)

  try {
    execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${dstVideo}"`, {
      stdio: 'pipe'
    })
    console.log(`Rendered ${outputName}`)
  } catch (err) {
    console.warn(`ffmpeg conversion failed for ${outputName}, keeping as webm renamed to mp4...`)
    fs.copyFileSync(srcVideo, dstVideo)
    console.log(`Rendered ${outputName} (webm container)`)
  }

  fs.rmSync(tmpDir, { recursive: true, force: true })
  return true
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
    gridG: 'manila-gallery-market-001.jpg',
    gridH: 'manila-gallery-urban-001.jpg',
    gridI: 'manila-gallery-shadow-001.jpg',
    gridJ: 'manila-gallery-ivy-001.jpg',
    process: 'manila-gallery-dsc-0190.jpg',
    cta: 'manila-gallery-floor-001.jpg'
  }

  writeSources({ all_considered: all, selected: selection })

  const images = Object.fromEntries(
    Object.entries(selection).map(([key, file]) => [key, readImage(file)])
  )

  const browser = await chromium.launch()

  // Slide 1: HOOK — text animates in, then image reveals (~4.5s total)
  console.log('Recording slide 1 (HOOK)...')
  await recordSlideVideo(browser, slideOneHtml(images), '01_hook_story.mp4', 4500)

  // Slide 2: PROOF — images stagger in 300ms apart, 10 images (~5s total)
  console.log('Recording slide 2 (PROOF)...')
  await recordSlideVideo(browser, slideTwoHtml(images), '02_proof_story.mp4', 4800)

  // Slide 3: PROCESS — steps slide in sequentially (~4.5s total)
  console.log('Recording slide 3 (PROCESS)...')
  await recordSlideVideo(browser, slideThreeHtml(images), '03_process_story.mp4', 4200)

  // Slide 4: CTA — text fades in, urgency pulses (~4s total)
  console.log('Recording slide 4 (CTA)...')
  await recordSlideVideo(browser, slideFourHtml(images), '04_cta_story.mp4', 3800)

  await browser.close()
  console.log(`\nDone: 4 animated MP4 videos written to ${OUT_DIR}`)
}

render().catch(error => {
  console.error(error)
  process.exit(1)
})
