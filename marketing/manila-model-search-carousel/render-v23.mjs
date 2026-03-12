import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v23')

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 410

// Fonts — monospace/typewriter for "casting call" aesthetic
const MONO = "'Courier New', Courier, monospace"
const SANS = "'Helvetica Neue', Arial, sans-serif"

// Colors — black and white with one red accent
const ACCENT = '#C62828' // deep red stamp color
const BG = '#F5F3EF'     // slightly warm off-white "paper"
const INK = '#1A1A1A'    // near-black ink

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
    strategy: 'v23 — casting call format, monospace/typewriter aesthetic, B&W + red accent',
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
        html, body { margin: 0; padding: 0; background: ${BG}; }
      </style>
    </head>
    <body>${html}</body>
  </html>`
}

// ─── SLIDE 1: HOOK — "CASTING: MANILA" official casting notice ───
function slideOne(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${BG};">
      <!-- Paper texture lines -->
      ${Array.from({ length: 40 }, (_, i) => `
        <div style="position:absolute;left:0;right:0;top:${48 * i}px;height:1px;background:rgba(0,0,0,0.04);"></div>
      `).join('')}

      <!-- Top left document reference -->
      <div style="position:absolute;left:54px;top:56px;">
        <p style="font-family:${MONO};font-size:16px;color:rgba(0,0,0,0.3);margin:0;letter-spacing:0.05em;">REF: MNL-2026-OPEN</p>
      </div>

      <!-- Right side date stamp -->
      <div style="position:absolute;right:54px;top:56px;">
        <p style="font-family:${MONO};font-size:16px;color:rgba(0,0,0,0.3);margin:0;">MARCH 2026</p>
      </div>

      <!-- Horizontal rule -->
      <div style="position:absolute;left:54px;right:54px;top:92px;height:3px;background:${INK};"></div>

      <!-- CASTING: MANILA -->
      <div style="position:absolute;left:54px;right:54px;top:110px;">
        <p style="font-family:${MONO};font-size:28px;font-weight:700;color:${INK};margin:0 0 4px;letter-spacing:0.15em;">CASTING:</p>
        <h1 style="font-family:${SANS};font-size:82px;font-weight:900;color:${ACCENT};margin:0;letter-spacing:0.04em;line-height:0.95;">MANILA</h1>
      </div>

      <!-- Double rule -->
      <div style="position:absolute;left:54px;right:54px;top:255px;height:2px;background:${INK};"></div>
      <div style="position:absolute;left:54px;right:54px;top:261px;height:1px;background:${INK};"></div>

      <!-- Main copy -->
      <div style="position:absolute;left:54px;right:54px;top:282px;">
        <p style="font-family:${MONO};font-size:22px;color:${INK};margin:0 0 6px;letter-spacing:0.08em;text-transform:uppercase;">SEEKING:</p>
        <p style="font-family:${SANS};font-size:56px;font-weight:800;color:${INK};margin:0 0 20px;line-height:1.05;">Models for editorial<br/>portrait shoots.</p>

        <p style="font-family:${MONO};font-size:22px;color:${INK};margin:0 0 6px;letter-spacing:0.08em;text-transform:uppercase;">REQUIREMENTS:</p>
        <p style="font-family:${MONO};font-size:32px;color:rgba(0,0,0,0.4);margin:0 0 4px;text-decoration:line-through;">Agency representation</p>
        <p style="font-family:${MONO};font-size:32px;color:rgba(0,0,0,0.4);margin:0 0 4px;text-decoration:line-through;">Prior experience</p>
        <p style="font-family:${MONO};font-size:32px;color:rgba(0,0,0,0.4);margin:0;text-decoration:line-through;">Professional portfolio</p>
      </div>

      <!-- OPEN CALL stamp (rotated) -->
      <div style="position:absolute;right:40px;top:540px;transform:rotate(-12deg);border:5px solid ${ACCENT};padding:10px 24px;border-radius:8px;">
        <p style="font-family:${SANS};font-size:38px;font-weight:900;color:${ACCENT};margin:0;letter-spacing:0.12em;">OPEN CALL</p>
      </div>

      <!-- Hero image -->
      <div style="position:absolute;left:54px;right:54px;top:720px;height:${HEIGHT - SAFE_BOTTOM - 720 - 20}px;overflow:hidden;border:3px solid ${INK};">
        <img src="${images.hero}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center 15%;filter:grayscale(60%) contrast(1.1);"/>
      </div>

      <!-- Tiny bottom note -->
      <div style="position:absolute;left:54px;bottom:${SAFE_BOTTOM + 8}px;">
        <p style="font-family:${MONO};font-size:14px;color:rgba(0,0,0,0.25);margin:0;">SWIPE FOR DETAILS >>></p>
      </div>
    </div>
  `
}

// ─── SLIDE 2: PROOF — animated photo grid reveal (casting evidence) ───
function slideTwoAnimated(images) {
  const gridImages = [
    { src: images.gridA, aspect: 1059 / 1600 },   // closeup-001
    { src: images.gridB, aspect: 957 / 1510 },     // dsc-0911
    { src: images.gridC, aspect: 1228 / 1818 },    // graffiti-001
    { src: images.gridD, aspect: 1228 / 1818 },    // urban-001
    { src: images.gridE, aspect: 1067 / 1600 },    // shadow-001
    { src: images.gridF, aspect: 968 / 1508 },     // dsc-0130
  ]

  // 2x3 grid layout
  const PAD = 54
  const GAP = 10
  const GRID_TOP = 310
  const GRID_BOTTOM = HEIGHT - SAFE_BOTTOM - 20
  const COLS = 2
  const ROWS = 3
  const cellW = Math.floor((WIDTH - PAD * 2 - GAP * (COLS - 1)) / COLS)
  const cellH = Math.floor((GRID_BOTTOM - GRID_TOP - GAP * (ROWS - 1)) / ROWS)

  let tilesHtml = ''
  let idx = 0
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (idx >= gridImages.length) break
      const x = PAD + c * (cellW + GAP)
      const y = GRID_TOP + r * (cellH + GAP)
      const delay = idx * 0.4
      tilesHtml += `
        <div class="tile" style="position:absolute;left:${x}px;top:${y}px;width:${cellW}px;height:${cellH}px;border:3px solid ${INK};overflow:hidden;opacity:0;transform:translateY(20px);animation:tileIn 0.5s ease-out ${delay}s forwards;">
          <img src="${gridImages[idx].src}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center;filter:grayscale(50%) contrast(1.05);"/>
        </div>
      `
      idx++
    }
  }

  return `<!DOCTYPE html>
  <html>
    <head>
      <style>
        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; background: ${BG}; }
        @keyframes tileIn {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes headerIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes stampSlam {
          0% { opacity: 0; transform: rotate(-8deg) scale(2.5); }
          60% { opacity: 1; transform: rotate(-8deg) scale(0.95); }
          100% { opacity: 1; transform: rotate(-8deg) scale(1); }
        }
        .header { opacity: 0; animation: headerIn 0.4s ease-out 0s forwards; }
        .stamp { opacity: 0; animation: stampSlam 0.5s ease-out 3.0s forwards; }
      </style>
    </head>
    <body>
      <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${BG};">
        <!-- Paper lines -->
        ${Array.from({ length: 40 }, (_, i) => `
          <div style="position:absolute;left:0;right:0;top:${48 * i}px;height:1px;background:rgba(0,0,0,0.04);"></div>
        `).join('')}

        <!-- Header -->
        <div class="header" style="position:absolute;left:54px;right:54px;top:56px;">
          <div style="display:flex;justify-content:space-between;align-items:baseline;">
            <p style="font-family:${MONO};font-size:18px;color:rgba(0,0,0,0.3);margin:0;letter-spacing:0.05em;">EXHIBIT A: PREVIOUS WORK</p>
          </div>
          <div style="height:3px;background:${INK};margin:12px 0 16px;"></div>
          <h2 style="font-family:${SANS};font-size:80px;font-weight:900;color:${ACCENT};margin:0 0 4px;letter-spacing:0.04em;line-height:0.95;">MANILA</h2>
          <p style="font-family:${SANS};font-size:40px;font-weight:700;color:${INK};margin:0;line-height:1.1;">This is my work.</p>
        </div>

        <!-- Grid tiles -->
        ${tilesHtml}

        <!-- VERIFIED stamp -->
        <div class="stamp" style="position:absolute;right:60px;bottom:${SAFE_BOTTOM + 40}px;border:5px solid ${ACCENT};padding:8px 20px;border-radius:8px;transform:rotate(-8deg);">
          <p style="font-family:${SANS};font-size:30px;font-weight:900;color:${ACCENT};margin:0;letter-spacing:0.15em;">VERIFIED</p>
        </div>
      </div>
    </body>
  </html>`
}

// ─── SLIDE 3: PROCESS — how the shoot works ───
function slideThree(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${BG};">
      <!-- Paper lines -->
      ${Array.from({ length: 40 }, (_, i) => `
        <div style="position:absolute;left:0;right:0;top:${48 * i}px;height:1px;background:rgba(0,0,0,0.04);"></div>
      `).join('')}

      <!-- Top reference -->
      <div style="position:absolute;left:54px;top:56px;right:54px;">
        <p style="font-family:${MONO};font-size:16px;color:rgba(0,0,0,0.3);margin:0;letter-spacing:0.05em;">SECTION II: CALL SHEET</p>
        <div style="height:3px;background:${INK};margin:12px 0 16px;"></div>
        <h2 style="font-family:${SANS};font-size:80px;font-weight:900;color:${ACCENT};margin:0 0 4px;letter-spacing:0.04em;line-height:0.95;">MANILA</h2>
        <p style="font-family:${SANS};font-size:40px;font-weight:700;color:${INK};margin:0;line-height:1.1;">How it works.</p>
      </div>

      <!-- Steps -->
      <div style="position:absolute;left:54px;right:54px;top:320px;">
        <!-- Step 1 -->
        <div style="margin-bottom:28px;padding-bottom:28px;border-bottom:1px solid rgba(0,0,0,0.1);">
          <div style="display:flex;align-items:baseline;gap:16px;margin-bottom:8px;">
            <span style="font-family:${MONO};font-size:48px;font-weight:700;color:${ACCENT};line-height:1;">01</span>
            <span style="font-family:${SANS};font-size:38px;font-weight:800;color:${INK};line-height:1.1;">Sign up below</span>
          </div>
          <p style="font-family:${MONO};font-size:22px;color:rgba(0,0,0,0.5);margin:0;padding-left:72px;line-height:1.4;">60-second form. I message you<br/>back within a day.</p>
        </div>

        <!-- Step 2 -->
        <div style="margin-bottom:28px;padding-bottom:28px;border-bottom:1px solid rgba(0,0,0,0.1);">
          <div style="display:flex;align-items:baseline;gap:16px;margin-bottom:8px;">
            <span style="font-family:${MONO};font-size:48px;font-weight:700;color:${ACCENT};line-height:1;">02</span>
            <span style="font-family:${SANS};font-size:38px;font-weight:800;color:${INK};line-height:1.1;">We pick a date</span>
          </div>
          <p style="font-family:${MONO};font-size:22px;color:rgba(0,0,0,0.5);margin:0;padding-left:72px;line-height:1.4;">Location, vibe, and look --<br/>we plan it together.</p>
        </div>

        <!-- Step 3 -->
        <div style="margin-bottom:0;">
          <div style="display:flex;align-items:baseline;gap:16px;margin-bottom:8px;">
            <span style="font-family:${MONO};font-size:48px;font-weight:700;color:${ACCENT};line-height:1;">03</span>
            <span style="font-family:${SANS};font-size:38px;font-weight:800;color:${INK};line-height:1.1;">Show up. I guide you.</span>
          </div>
          <p style="font-family:${MONO};font-size:22px;color:rgba(0,0,0,0.5);margin:0;padding-left:72px;line-height:1.4;">No posing experience needed.<br/>You just show up.</p>
        </div>
      </div>

      <!-- NO EXPERIENCE NEEDED stamp -->
      <div style="position:absolute;left:54px;right:54px;top:780px;">
        <div style="display:inline-block;border:5px solid ${ACCENT};padding:12px 28px;border-radius:8px;transform:rotate(-3deg);">
          <p style="font-family:${SANS};font-size:32px;font-weight:900;color:${ACCENT};margin:0;letter-spacing:0.1em;">NO EXPERIENCE NEEDED</p>
        </div>
      </div>

      <!-- Small process image -->
      <div style="position:absolute;left:54px;right:54px;top:890px;height:${HEIGHT - SAFE_BOTTOM - 890 - 20}px;overflow:hidden;border:3px solid ${INK};">
        <img src="${images.process}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center 20%;filter:grayscale(50%) contrast(1.05);"/>
      </div>
    </div>
  `
}

// ─── SLIDE 4: CTA — sign up ───
function slideFour(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${BG};">
      <!-- Paper lines -->
      ${Array.from({ length: 40 }, (_, i) => `
        <div style="position:absolute;left:0;right:0;top:${48 * i}px;height:1px;background:rgba(0,0,0,0.04);"></div>
      `).join('')}

      <!-- Top reference -->
      <div style="position:absolute;left:54px;top:56px;right:54px;">
        <p style="font-family:${MONO};font-size:16px;color:rgba(0,0,0,0.3);margin:0;letter-spacing:0.05em;">FINAL NOTICE</p>
        <div style="height:3px;background:${INK};margin:12px 0 16px;"></div>
        <h2 style="font-family:${SANS};font-size:80px;font-weight:900;color:${ACCENT};margin:0 0 4px;letter-spacing:0.04em;line-height:0.95;">MANILA</h2>
      </div>

      <!-- Main CTA copy -->
      <div style="position:absolute;left:54px;right:54px;top:250px;">
        <h2 style="font-family:${SANS};font-size:72px;font-weight:900;color:${INK};margin:0 0 20px;line-height:1.0;">Sign up<br/>below.</h2>
        <p style="font-family:${MONO};font-size:26px;color:rgba(0,0,0,0.55);margin:0 0 30px;line-height:1.5;">60-second form.<br/>I'll message you back within a day.</p>
      </div>

      <!-- LIMITED SPOTS stamp -->
      <div style="position:absolute;left:54px;top:520px;">
        <div style="display:inline-block;background:${ACCENT};padding:14px 30px;border-radius:6px;transform:rotate(-2deg);">
          <p style="font-family:${SANS};font-size:28px;font-weight:900;color:#fff;margin:0;letter-spacing:0.12em;">LIMITED SPOTS THIS MONTH</p>
        </div>
      </div>

      <!-- Hero image -->
      <div style="position:absolute;left:54px;right:54px;top:620px;height:${HEIGHT - SAFE_BOTTOM - 620 - 20}px;overflow:hidden;border:3px solid ${INK};">
        <img src="${images.cta}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center 30%;filter:grayscale(60%) contrast(1.1);"/>
      </div>

      <!-- Bottom note -->
      <div style="position:absolute;left:54px;bottom:${SAFE_BOTTOM + 8}px;">
        <p style="font-family:${MONO};font-size:14px;color:rgba(0,0,0,0.25);margin:0;">TAP LINK BELOW TO APPLY</p>
      </div>
    </div>
  `
}

async function render() {
  resetOutputDir()

  const all = getTopManilaImages()
  const selection = {
    hero: 'manila-gallery-dsc-0190.jpg',
    gridA: 'manila-gallery-dsc-0075.jpg',
    gridB: 'manila-gallery-ivy-001.jpg',
    gridC: 'manila-gallery-canal-001.jpg',
    gridD: 'manila-gallery-night-001.jpg',
    gridE: 'manila-gallery-garden-001.jpg',
    gridF: 'manila-gallery-dsc-0130.jpg',
    process: 'manila-gallery-ivy-002.jpg',
    cta: 'manila-gallery-dsc-0911.jpg'
  }

  writeSources({ all_considered: all, selected: selection })

  const images = Object.fromEntries(
    Object.entries(selection).map(([key, file]) => [key, readImage(file)])
  )

  // --- Render static slides (1, 3, 4) as PNGs ---
  const staticSlides = [
    ['01_casting_hook.png', wrap(slideOne(images))],
    ['03_process_callsheet.png', wrap(slideThree(images))],
    ['04_cta_final_notice.png', wrap(slideFour(images))]
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

  // 6 images * 400ms stagger = 2400ms for last tile start
  // + 500ms animation = 2900ms for last tile done
  // + stamp at 3000ms + 500ms for stamp anim
  // + 1500ms hold = ~5000ms total
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
    const dstVideo = path.join(OUT_DIR, '02_proof_exhibit.mp4')

    const { execSync } = await import('child_process')
    try {
      execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${dstVideo}"`, {
        stdio: 'pipe'
      })
      fs.unlinkSync(srcVideo)
      console.log('Rendered 02_proof_exhibit.mp4')
    } catch (err) {
      console.warn('ffmpeg not available, keeping as webm renamed to mp4...')
      fs.renameSync(srcVideo, dstVideo)
      console.log('Rendered 02_proof_exhibit.mp4 (webm container)')
    }
  }

  await browser.close()
  console.log(`Done: 3 static PNGs + 1 animated MP4 written to ${OUT_DIR}`)
}

render().catch(error => {
  console.error(error)
  process.exit(1)
})
