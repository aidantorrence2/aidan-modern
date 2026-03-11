import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v25')

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 410

// Fonts — bold condensed for urgency, event-poster energy
const BOLD = "'Avenir Next', 'Helvetica Neue', Arial, sans-serif"
const BODY = "'Avenir Next', 'Helvetica Neue', Arial, sans-serif"
const NARROW = "Futura, 'Arial Narrow', sans-serif"
const MONO = "'SF Mono', 'Fira Code', 'Courier New', monospace"

// Colors — high-energy urgency palette
const MANILA_COLOR = '#FF4D2A'   // bright red-orange for MANILA
const ACCENT = '#FF6B3D'         // secondary accent
const DARK_BG = '#0C0A0A'        // near-black
const CARD_BG = 'rgba(255,77,42,0.12)'
const CARD_BORDER = 'rgba(255,77,42,0.3)'

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
    strategy: 'v25 — countdown/urgency FOMO format, dark bg + red-orange accents, event-poster energy',
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

// ─── SLIDE 1: FOMO HOOK ─── Giant MANILA + "3 SPOTS LEFT" + countdown/calendar + one striking photo
function slideOne(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${DARK_BG};">
      <!-- Hero image — right half, slightly faded -->
      <div style="position:absolute;right:0;top:0;width:620px;height:100%;overflow:hidden;">
        <img src="${images.hero}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center 20%;"/>
        <div style="position:absolute;inset:0;background:linear-gradient(90deg, ${DARK_BG} 0%, rgba(12,10,10,0.7) 30%, rgba(12,10,10,0.15) 60%, rgba(12,10,10,0.05) 100%);"></div>
        <div style="position:absolute;left:0;right:0;bottom:0;height:${SAFE_BOTTOM + 120}px;background:linear-gradient(0deg, ${DARK_BG} 0%, rgba(12,10,10,0) 100%);"></div>
        <div style="position:absolute;left:0;right:0;top:0;height:300px;background:linear-gradient(180deg, rgba(12,10,10,0.6) 0%, rgba(12,10,10,0) 100%);"></div>
      </div>

      <!-- MANILA — giant, top -->
      <div style="position:absolute;left:54px;top:80px;right:54px;">
        <p style="font-family:${NARROW};font-size:82px;font-weight:900;letter-spacing:0.22em;text-transform:uppercase;color:${MANILA_COLOR};margin:0;text-shadow:0 0 40px rgba(255,77,42,0.3);">MANILA</p>
      </div>

      <!-- Main headline -->
      <div style="position:absolute;left:54px;top:210px;width:600px;">
        <h1 style="font-family:${BOLD};font-size:88px;font-weight:800;line-height:0.95;color:#fff;margin:0 0 24px;letter-spacing:-0.02em;">3 spots<br/>left.</h1>
        <p style="font-family:${BODY};font-size:30px;font-weight:500;line-height:1.35;color:rgba(255,255,255,0.75);margin:0 0 40px;">Editorial portrait shoots.<br/>No experience needed.</p>
      </div>

      <!-- Countdown visual element — 3 boxes, 2 crossed out -->
      <div style="position:absolute;left:54px;top:600px;display:flex;gap:16px;">
        <!-- Spot 1 — filled/taken -->
        <div style="width:100px;height:100px;border-radius:16px;background:rgba(255,255,255,0.06);border:2px solid rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;position:relative;">
          <span style="font-family:${MONO};font-size:36px;font-weight:700;color:rgba(255,255,255,0.2);">01</span>
          <div style="position:absolute;width:70%;height:3px;background:rgba(255,255,255,0.25);transform:rotate(-45deg);"></div>
        </div>
        <!-- Spot 2 — filled/taken -->
        <div style="width:100px;height:100px;border-radius:16px;background:rgba(255,255,255,0.06);border:2px solid rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;position:relative;">
          <span style="font-family:${MONO};font-size:36px;font-weight:700;color:rgba(255,255,255,0.2);">02</span>
          <div style="position:absolute;width:70%;height:3px;background:rgba(255,255,255,0.25);transform:rotate(-45deg);"></div>
        </div>
        <!-- Spot 3 — filled/taken -->
        <div style="width:100px;height:100px;border-radius:16px;background:rgba(255,255,255,0.06);border:2px solid rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;position:relative;">
          <span style="font-family:${MONO};font-size:36px;font-weight:700;color:rgba(255,255,255,0.2);">03</span>
          <div style="position:absolute;width:70%;height:3px;background:rgba(255,255,255,0.25);transform:rotate(-45deg);"></div>
        </div>
        <!-- Spot 4 — filled/taken -->
        <div style="width:100px;height:100px;border-radius:16px;background:rgba(255,255,255,0.06);border:2px solid rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;position:relative;">
          <span style="font-family:${MONO};font-size:36px;font-weight:700;color:rgba(255,255,255,0.2);">04</span>
          <div style="position:absolute;width:70%;height:3px;background:rgba(255,255,255,0.25);transform:rotate(-45deg);"></div>
        </div>
        <!-- Spot 5 — filled/taken -->
        <div style="width:100px;height:100px;border-radius:16px;background:rgba(255,255,255,0.06);border:2px solid rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;position:relative;">
          <span style="font-family:${MONO};font-size:36px;font-weight:700;color:rgba(255,255,255,0.2);">05</span>
          <div style="position:absolute;width:70%;height:3px;background:rgba(255,255,255,0.25);transform:rotate(-45deg);"></div>
        </div>
      </div>

      <!-- "3 remaining" label under countdown -->
      <div style="position:absolute;left:54px;top:730px;">
        <div style="display:inline-flex;align-items:center;gap:10px;">
          <div style="width:10px;height:10px;border-radius:50%;background:${MANILA_COLOR};"></div>
          <span style="font-family:${MONO};font-size:22px;font-weight:600;color:${MANILA_COLOR};letter-spacing:0.08em;text-transform:uppercase;">3 spots remaining this month</span>
        </div>
      </div>

      <!-- Urgency pill -->
      <div style="position:absolute;left:54px;top:820px;display:inline-flex;align-items:center;padding:14px 24px;border-radius:14px;background:${CARD_BG};border:1px solid ${CARD_BORDER};">
        <span style="font-family:${BOLD};font-size:24px;font-weight:700;color:${MANILA_COLOR};letter-spacing:0.04em;">Sign up below before they fill</span>
      </div>
    </div>
  `
}

// ─── SLIDE 2: ANIMATED PROOF ─── Photos appear rapidly like a film strip
function slideTwoAnimated(images) {
  const STAGGER = 200 // faster stagger for energy
  const animImages = [
    images.gridA, images.gridB, images.gridC,
    images.gridD, images.gridE, images.gridF,
    images.gridG, images.gridH, images.gridI,
    images.gridJ, images.gridK, images.gridL,
  ]

  // Film strip layout: 3 columns, 4 rows
  const COLS = 3
  const ROWS = 4
  const PAD = 28
  const GAP = 8
  const HEADER_END = 230
  const BOTTOM_LIMIT = HEIGHT - SAFE_BOTTOM - 16
  const CONTAINER_W = WIDTH - PAD * 2
  const AVAILABLE_H = BOTTOM_LIMIT - HEADER_END
  const cellW = Math.floor((CONTAINER_W - (COLS - 1) * GAP) / COLS)
  const cellH = Math.floor((AVAILABLE_H - (ROWS - 1) * GAP) / ROWS)

  let tiles = ''
  let idx = 0
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (idx >= animImages.length) break
      const x = PAD + c * (cellW + GAP)
      const y = HEADER_END + r * (cellH + GAP)
      const delay = idx * (STAGGER / 1000)
      tiles += `<div class="tile" style="position:absolute;left:${x}px;top:${y}px;width:${cellW}px;height:${cellH}px;border-radius:10px;overflow:hidden;opacity:0;transform:scale(0.8) translateY(20px);animation:tileReveal 0.4s ease-out ${delay}s forwards;border:2px solid rgba(255,77,42,0.25);">
        <img src="${animImages[idx]}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center;"/>
      </div>`
      idx++
    }
  }

  // Total animation time: 12 images * 200ms = 2400ms + 400ms anim + 1000ms hold
  return `<!DOCTYPE html>
  <html>
    <head>
      <style>
        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; background: ${DARK_BG}; }
        @keyframes tileReveal {
          0% { opacity: 0; transform: scale(0.8) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes headerFade {
          0% { opacity: 0; transform: translateY(-20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .header {
          opacity: 0;
          animation: headerFade 0.4s ease-out 0s forwards;
        }
      </style>
    </head>
    <body>
      <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${DARK_BG};">
        <div class="header" style="position:absolute;left:54px;top:62px;right:54px;">
          <p style="font-family:${NARROW};font-size:80px;font-weight:900;letter-spacing:0.22em;text-transform:uppercase;color:${MANILA_COLOR};margin:0 0 10px;text-shadow:0 0 40px rgba(255,77,42,0.3);">MANILA</p>
          <h2 style="font-family:${BOLD};font-size:52px;font-weight:800;line-height:0.96;color:#fff;margin:0;letter-spacing:-0.02em;">Recent shoots.</h2>
        </div>
        ${tiles}
      </div>
    </body>
  </html>`
}

// ─── SLIDE 3: WHAT YOU'LL MISS ─── Framed as FOMO / loss aversion
function slideThree(images) {
  const items = [
    { icon: 'X', text: 'Guided creative direction' },
    { icon: 'X', text: '25+ edited portfolio photos' },
    { icon: 'X', text: 'Zero experience needed' },
    { icon: 'X', text: 'Locations you\'ve never shot at' },
  ]

  let cards = ''
  items.forEach((item, i) => {
    const top = 440 + i * 130
    cards += `
      <div style="position:absolute;left:54px;right:54px;top:${top}px;padding:26px 30px;border-radius:18px;background:${CARD_BG};border:1px solid ${CARD_BORDER};display:flex;align-items:center;gap:20px;">
        <div style="width:48px;height:48px;border-radius:12px;background:rgba(255,77,42,0.2);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <span style="font-family:${BOLD};font-size:24px;font-weight:900;color:${MANILA_COLOR};">&#10003;</span>
        </div>
        <span style="font-family:${BOLD};font-size:32px;font-weight:700;color:#fff;line-height:1.2;">${item.text}</span>
      </div>
    `
  })

  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${DARK_BG};">
      <!-- Background image, very faded -->
      <div style="position:absolute;inset:0;overflow:hidden;">
        <img src="${images.process}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center;opacity:0.12;"/>
      </div>

      <!-- MANILA -->
      <div style="position:absolute;left:54px;top:80px;right:54px;">
        <p style="font-family:${NARROW};font-size:80px;font-weight:900;letter-spacing:0.22em;text-transform:uppercase;color:${MANILA_COLOR};margin:0;text-shadow:0 0 40px rgba(255,77,42,0.3);">MANILA</p>
      </div>

      <!-- Headline -->
      <div style="position:absolute;left:54px;top:210px;right:54px;">
        <h2 style="font-family:${BOLD};font-size:72px;font-weight:800;line-height:0.95;color:#fff;margin:0 0 16px;letter-spacing:-0.02em;">Don't miss<br/>out.</h2>
        <p style="font-family:${BODY};font-size:28px;font-weight:500;color:rgba(255,255,255,0.6);margin:0;">Here's what you get when you sign up:</p>
      </div>

      ${cards}

      <!-- Bottom urgency note -->
      <div style="position:absolute;left:54px;bottom:${SAFE_BOTTOM + 40}px;right:54px;">
        <div style="display:inline-flex;align-items:center;gap:10px;">
          <div style="width:10px;height:10px;border-radius:50%;background:${MANILA_COLOR};"></div>
          <span style="font-family:${MONO};font-size:20px;font-weight:600;color:${MANILA_COLOR};letter-spacing:0.06em;text-transform:uppercase;">Only 3 spots left</span>
        </div>
      </div>
    </div>
  `
}

// ─── SLIDE 4: CTA WITH URGENCY ─── "These spots fill fast. Sign up now."
function slideFour(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${DARK_BG};">
      <!-- Background hero image -->
      <img src="${images.cta}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 30%;"/>
      <div style="position:absolute;left:0;right:0;top:0;height:900px;background:linear-gradient(180deg, rgba(12,10,10,0.92) 0%, rgba(12,10,10,0.7) 50%, rgba(12,10,10,0) 100%);"></div>
      <div style="position:absolute;left:0;right:0;bottom:0;height:${SAFE_BOTTOM + 200}px;background:linear-gradient(0deg, rgba(12,10,10,0.7) 0%, rgba(12,10,10,0) 100%);"></div>

      <!-- MANILA -->
      <div style="position:absolute;left:54px;top:80px;right:54px;">
        <p style="font-family:${NARROW};font-size:82px;font-weight:900;letter-spacing:0.22em;text-transform:uppercase;color:${MANILA_COLOR};margin:0;text-shadow:0 0 40px rgba(255,77,42,0.3);">MANILA</p>
      </div>

      <!-- CTA text -->
      <div style="position:absolute;left:54px;top:220px;right:54px;">
        <h2 style="font-family:${BOLD};font-size:88px;font-weight:800;line-height:0.94;color:#fff;margin:0 0 28px;letter-spacing:-0.02em;">Sign up<br/>below.</h2>
        <p style="font-family:${BODY};font-size:32px;font-weight:500;line-height:1.38;color:rgba(255,255,255,0.85);margin:0 0 40px;">These spots fill fast.<br/>60-second form. I message you back.</p>
      </div>

      <!-- 3 spots remaining — repeated for FOMO -->
      <div style="position:absolute;left:54px;top:580px;display:flex;gap:14px;align-items:center;">
        <!-- 3 bright countdown boxes -->
        <div style="width:72px;height:72px;border-radius:14px;background:${MANILA_COLOR};display:flex;align-items:center;justify-content:center;">
          <span style="font-family:${MONO};font-size:32px;font-weight:900;color:#fff;">0</span>
        </div>
        <div style="width:72px;height:72px;border-radius:14px;background:${MANILA_COLOR};display:flex;align-items:center;justify-content:center;">
          <span style="font-family:${MONO};font-size:32px;font-weight:900;color:#fff;">3</span>
        </div>
        <div style="margin-left:8px;">
          <p style="font-family:${BOLD};font-size:28px;font-weight:700;color:#fff;margin:0;line-height:1.2;">spots left</p>
          <p style="font-family:${BODY};font-size:20px;font-weight:500;color:rgba(255,255,255,0.6);margin:0;">this month</p>
        </div>
      </div>

      <!-- Urgency pill -->
      <div style="position:absolute;left:54px;top:700px;display:inline-flex;align-items:center;padding:16px 28px;border-radius:16px;background:rgba(255,77,42,0.15);backdrop-filter:blur(16px);border:1px solid rgba(255,77,42,0.35);">
        <span style="font-family:${BOLD};font-size:24px;font-weight:700;color:${MANILA_COLOR};letter-spacing:0.04em;">Don't wait — sign up now</span>
      </div>
    </div>
  `
}

async function render() {
  resetOutputDir()

  const all = getTopManilaImages()
  const selection = {
    hero: 'manila-gallery-statue-001.jpg',
    gridA: 'manila-gallery-closeup-001.jpg',
    gridB: 'manila-gallery-dsc-0911.jpg',
    gridC: 'manila-gallery-garden-002.jpg',
    gridD: 'manila-gallery-night-003.jpg',
    gridE: 'manila-gallery-dsc-0130.jpg',
    gridF: 'manila-gallery-canal-002.jpg',
    gridG: 'manila-gallery-graffiti-001.jpg',
    gridH: 'manila-gallery-urban-001.jpg',
    gridI: 'manila-gallery-shadow-001.jpg',
    gridJ: 'manila-gallery-ivy-001.jpg',
    gridK: 'manila-gallery-tropical-001.jpg',
    gridL: 'manila-gallery-canal-001.jpg',
    process: 'manila-gallery-dsc-0190.jpg',
    cta: 'manila-gallery-night-001.jpg'
  }

  writeSources({ all_considered: all, selected: selection })

  const images = Object.fromEntries(
    Object.entries(selection).map(([key, file]) => [key, readImage(file)])
  )

  // --- Render static slides (1, 3, 4) as PNGs ---
  const staticSlides = [
    ['01_fomo_hook.png', wrap(slideOne(images))],
    ['03_what_you_miss.png', wrap(slideThree(images))],
    ['04_cta_urgency.png', wrap(slideFour(images))]
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

  // 12 images * 200ms stagger = 2400ms + 400ms anim duration + 1000ms hold = ~3800ms
  const TOTAL_DURATION_MS = 4500

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
  await videoPage.waitForTimeout(500) // let images load
  await videoPage.waitForTimeout(TOTAL_DURATION_MS)
  await videoPage.close()
  await videoCtx.close()

  // Convert webm to mp4
  const videoFiles = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.webm'))
  if (videoFiles.length === 0) {
    console.error('No video file was generated!')
  } else {
    const srcVideo = path.join(OUT_DIR, videoFiles[0])
    const dstVideo = path.join(OUT_DIR, '02_proof_rapid.mp4')

    const { execSync } = await import('child_process')
    try {
      execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${dstVideo}"`, {
        stdio: 'pipe'
      })
      fs.unlinkSync(srcVideo)
      console.log('Rendered 02_proof_rapid.mp4')
    } catch (err) {
      console.warn('ffmpeg not available, keeping as webm renamed to mp4...')
      fs.renameSync(srcVideo, dstVideo)
      console.log('Rendered 02_proof_rapid.mp4 (webm container)')
    }
  }

  await browser.close()
  console.log(`Done: 3 static PNGs + 1 animated MP4 written to ${OUT_DIR}`)
}

render().catch(error => {
  console.error(error)
  process.exit(1)
})
