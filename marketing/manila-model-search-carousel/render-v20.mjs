import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v20')

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 410

// ─── WARM EDITORIAL MAGAZINE AESTHETIC ───
// Cream/sand backgrounds, elegant serif headlines, soft drop shadows
// Feels like Vogue or a fashion lookbook — NOT dark/moody (v16) or bold/Nike (v18)
const BG_CREAM = '#F5F0E8'        // warm cream
const BG_SAND = '#EDE6D8'         // slightly darker sand for contrast panels
const TEXT_DARK = '#2C2418'        // warm dark brown (not pure black)
const TEXT_MID = '#6B5D4D'         // muted warm brown
const ACCENT = '#C2652A'          // burnt sienna — warm, editorial, distinctive MANILA color
const ACCENT_LIGHT = '#D4885A'    // lighter accent for subtle elements
const RULE_COLOR = '#C9BDA8'      // warm taupe for hairline rules

// Typography — serif for headlines, clean sans for body
const SERIF = "Georgia, 'Times New Roman', 'Palatino Linotype', serif"
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
    strategy: 'v20 — warm editorial magazine aesthetic, cream backgrounds, serif headlines, lookbook feel',
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
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { margin: 0; padding: 0; background: ${BG_CREAM}; }
      </style>
    </head>
    <body>${html}</body>
  </html>`
}

// ─── SLIDE 1: HOOK ───
// Full-bleed hero image with warm cream text panel at top
// Elegant serif "Models wanted." with MANILA in burnt sienna
function slideOne(images) {
  const PAD = 72
  const TEXT_TOP = 80
  const IMG_TOP = 520
  const IMG_BOTTOM = HEIGHT - SAFE_BOTTOM - 10

  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${BG_CREAM};">
      <!-- Subtle texture overlay for editorial feel -->
      <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 30% 20%, rgba(194,101,42,0.04) 0%, transparent 60%);"></div>

      <!-- MANILA accent label with thin rule below -->
      <div style="position:absolute;left:${PAD}px;top:${TEXT_TOP}px;right:${PAD}px;">
        <span style="font-family:${SANS};font-size:42px;font-weight:600;letter-spacing:0.35em;color:${ACCENT};text-transform:uppercase;">Manila</span>
        <div style="width:60px;height:2px;background:${ACCENT};margin-top:16px;"></div>
      </div>

      <!-- Serif headline -->
      <div style="position:absolute;left:${PAD}px;right:${PAD}px;top:${TEXT_TOP + 90}px;">
        <h1 style="font-family:${SERIF};font-size:108px;font-weight:normal;font-style:italic;line-height:0.95;color:${TEXT_DARK};letter-spacing:-0.02em;">Models<br/>wanted.</h1>
      </div>

      <!-- Subhead -->
      <div style="position:absolute;left:${PAD}px;right:${PAD}px;top:${TEXT_TOP + 310}px;">
        <p style="font-family:${SANS};font-size:32px;font-weight:400;color:${TEXT_MID};line-height:1.4;letter-spacing:0.01em;">Editorial portrait sessions.<br/>No experience needed.</p>
      </div>

      <!-- Hero image with soft rounded corners and shadow -->
      <div style="position:absolute;left:${PAD - 8}px;right:${PAD - 8}px;top:${IMG_TOP}px;bottom:${HEIGHT - IMG_BOTTOM}px;border-radius:16px;overflow:hidden;box-shadow:0 12px 40px rgba(44,36,24,0.15);">
        <img src="${images.hero}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center 15%;"/>
      </div>
    </div>
  `
}

// ─── SLIDE 2: PROOF (animated) ───
// Staggered image reveal on cream background
// Images in rounded frames with soft shadows, editorial grid layout
function slideTwoAnimated(images) {
  const PAD = 56
  const HEADER_END = 250
  const GRID_BOTTOM = HEIGHT - SAFE_BOTTOM - 20
  const GAP = 14
  const GRID_WIDTH = WIDTH - PAD * 2
  const GRID_HEIGHT = GRID_BOTTOM - HEADER_END

  // 10 images in a masonry-like layout: 3 rows
  // Row 1: 3 images, Row 2: 4 images, Row 3: 3 images
  const layout = [
    // Row 1 — 3 images
    { img: images.gridA, x: PAD, w: 310, h: 420, row: 0 },
    { img: images.gridB, x: PAD + 324, w: 350, h: 420, row: 0 },
    { img: images.gridC, x: PAD + 688, w: 280, h: 420, row: 0 },
    // Row 2 — 4 images
    { img: images.gridD, x: PAD, w: 230, h: 340, row: 1 },
    { img: images.gridE, x: PAD + 244, w: 240, h: 340, row: 1 },
    { img: images.gridF, x: PAD + 498, w: 240, h: 340, row: 1 },
    { img: images.gridG, x: PAD + 752, w: 216, h: 340, row: 1 },
    // Row 3 — 3 images
    { img: images.gridH, x: PAD, w: 320, h: 380, row: 2 },
    { img: images.gridI, x: PAD + 334, w: 300, h: 380, row: 2 },
    { img: images.gridJ, x: PAD + 648, w: 320, h: 380, row: 2 },
  ]

  // Calculate vertical positions
  const rowHeights = [420, 340, 380]
  const totalRowH = rowHeights.reduce((s, h) => s + h, 0) + (rowHeights.length - 1) * GAP
  const startY = HEADER_END + Math.max(0, Math.floor((GRID_HEIGHT - totalRowH) / 2))
  const rowYs = []
  let currentY = startY
  for (const rh of rowHeights) {
    rowYs.push(currentY)
    currentY += rh + GAP
  }

  let tilesHtml = ''
  for (let i = 0; i < layout.length; i++) {
    const t = layout[i]
    const y = rowYs[t.row]
    const delay = i * 0.3
    tilesHtml += `<div class="tile" style="position:absolute;left:${t.x}px;top:${y}px;width:${t.w}px;height:${t.h}px;border-radius:12px;overflow:hidden;box-shadow:0 6px 24px rgba(44,36,24,0.12);opacity:0;transform:scale(0.88) translateY(16px);animation:tileReveal 0.55s ease-out ${delay}s forwards;">
      <img src="${t.img}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center;"/>
    </div>`
  }

  return `<!DOCTYPE html>
  <html>
    <head>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { margin: 0; padding: 0; background: ${BG_CREAM}; }
        @keyframes tileReveal {
          0% { opacity: 0; transform: scale(0.88) translateY(16px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes headerFade {
          0% { opacity: 0; transform: translateY(-14px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .header {
          opacity: 0;
          animation: headerFade 0.5s ease-out 0s forwards;
        }
      </style>
    </head>
    <body>
      <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${BG_CREAM};">
        <!-- Subtle texture -->
        <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 70% 80%, rgba(194,101,42,0.03) 0%, transparent 50%);"></div>

        <div class="header" style="position:absolute;left:${PAD}px;top:72px;right:${PAD}px;">
          <span style="font-family:${SANS};font-size:42px;font-weight:600;letter-spacing:0.35em;color:${ACCENT};text-transform:uppercase;">Manila</span>
          <div style="width:60px;height:2px;background:${ACCENT};margin-top:14px;margin-bottom:20px;"></div>
          <h2 style="font-family:${SERIF};font-size:64px;font-weight:normal;font-style:italic;color:${TEXT_DARK};line-height:1.0;letter-spacing:-0.01em;">This is my work.</h2>
        </div>

        ${tilesHtml}
      </div>
    </body>
  </html>`
}

// ─── SLIDE 3: PROCESS ───
// Elegant numbered steps with serif numbers, warm card backgrounds
function slideThree(images) {
  const PAD = 72

  const steps = [
    { num: '1', title: 'Sign up below', desc: 'Takes 60 seconds. I message you back personally.' },
    { num: '2', title: 'We plan together', desc: 'Date, location, and vibe -- all collaborative.' },
    { num: '3', title: 'Show up and shine', desc: 'I guide every pose. Zero experience needed.' },
  ]

  const STEP_START = 320
  const STEP_GAP = 300

  let stepsHtml = ''
  for (let i = 0; i < steps.length; i++) {
    const y = STEP_START + i * STEP_GAP
    const s = steps[i]
    stepsHtml += `
      <div style="position:absolute;left:${PAD}px;right:${PAD}px;top:${y}px;">
        <!-- Step card -->
        <div style="padding:32px 36px;border-radius:16px;background:${BG_SAND};box-shadow:0 4px 16px rgba(44,36,24,0.06);">
          <!-- Serif step number -->
          <div style="display:flex;align-items:baseline;gap:16px;margin-bottom:14px;">
            <span style="font-family:${SERIF};font-size:56px;font-style:italic;color:${ACCENT};line-height:1;">${s.num}</span>
            <div style="flex:1;height:1px;background:${RULE_COLOR};"></div>
          </div>
          <!-- Title -->
          <p style="font-family:${SERIF};font-size:44px;font-style:italic;color:${TEXT_DARK};margin:0 0 10px;line-height:1.1;">${s.title}</p>
          <!-- Description -->
          <p style="font-family:${SANS};font-size:27px;font-weight:400;color:${TEXT_MID};line-height:1.35;">${s.desc}</p>
        </div>
      </div>
    `
  }

  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${BG_CREAM};">
      <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 90%, rgba(194,101,42,0.04) 0%, transparent 50%);"></div>

      <!-- Header -->
      <div style="position:absolute;left:${PAD}px;top:80px;right:${PAD}px;">
        <span style="font-family:${SANS};font-size:42px;font-weight:600;letter-spacing:0.35em;color:${ACCENT};text-transform:uppercase;">Manila</span>
        <div style="width:60px;height:2px;background:${ACCENT};margin-top:14px;margin-bottom:20px;"></div>
        <h2 style="font-family:${SERIF};font-size:72px;font-weight:normal;font-style:italic;color:${TEXT_DARK};line-height:0.95;letter-spacing:-0.01em;">How it works.</h2>
      </div>

      ${stepsHtml}

      <!-- Small accent image bottom right -->
      <div style="position:absolute;right:${PAD}px;bottom:${SAFE_BOTTOM + 30}px;width:280px;height:200px;border-radius:12px;overflow:hidden;box-shadow:0 6px 20px rgba(44,36,24,0.1);">
        <img src="${images.process}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center 20%;"/>
      </div>
    </div>
  `
}

// ─── SLIDE 4: CTA ───
// Large image top, warm CTA panel below, elegant urgency treatment
function slideFour(images) {
  const PAD = 72
  const IMG_TOP = 80
  const IMG_HEIGHT = 860
  const TEXT_START = IMG_TOP + IMG_HEIGHT + 40

  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${BG_CREAM};">
      <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 40% 10%, rgba(194,101,42,0.04) 0%, transparent 50%);"></div>

      <!-- Large rounded image -->
      <div style="position:absolute;left:${PAD - 8}px;right:${PAD - 8}px;top:${IMG_TOP}px;height:${IMG_HEIGHT}px;border-radius:16px;overflow:hidden;box-shadow:0 12px 40px rgba(44,36,24,0.15);">
        <img src="${images.cta}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center 20%;"/>
      </div>

      <!-- CTA text area -->
      <div style="position:absolute;left:${PAD}px;right:${PAD}px;top:${TEXT_START}px;">
        <span style="font-family:${SANS};font-size:42px;font-weight:600;letter-spacing:0.35em;color:${ACCENT};text-transform:uppercase;">Manila</span>
        <div style="width:60px;height:2px;background:${ACCENT};margin-top:14px;margin-bottom:22px;"></div>
        <h2 style="font-family:${SERIF};font-size:88px;font-weight:normal;font-style:italic;color:${TEXT_DARK};line-height:0.95;letter-spacing:-0.02em;">Sign up<br/>below.</h2>
      </div>

      <!-- Sub copy -->
      <div style="position:absolute;left:${PAD}px;right:${PAD}px;top:${TEXT_START + 260}px;">
        <p style="font-family:${SANS};font-size:30px;font-weight:400;color:${TEXT_MID};line-height:1.4;">60-second form. I'll message you back within a day.</p>
      </div>

      <!-- Warm urgency pill -->
      <div style="position:absolute;left:${PAD}px;top:${TEXT_START + 340}px;display:inline-flex;align-items:center;padding:14px 26px;border-radius:40px;background:${ACCENT};box-shadow:0 4px 12px rgba(194,101,42,0.25);">
        <span style="font-family:${SANS};font-size:24px;font-weight:600;color:#FFFFFF;letter-spacing:0.08em;text-transform:uppercase;">Limited spots this month</span>
      </div>
    </div>
  `
}

async function render() {
  resetOutputDir()

  const all = getTopManilaImages()

  const selection = {
    hero: 'manila-gallery-statue-001.jpg',         // tall portrait, elegant
    gridA: 'manila-gallery-closeup-001.jpg',        // portrait
    gridB: 'manila-gallery-canal-001.jpg',          // tall portrait
    gridC: 'manila-gallery-dsc-0911.jpg',           // portrait
    gridD: 'manila-gallery-garden-002.jpg',         // landscape
    gridE: 'manila-gallery-dsc-0075.jpg',           // portrait
    gridF: 'manila-gallery-ivy-001.jpg',            // landscape
    gridG: 'manila-gallery-graffiti-001.jpg',       // portrait
    gridH: 'manila-gallery-urban-001.jpg',          // portrait
    gridI: 'manila-gallery-shadow-001.jpg',         // portrait
    gridJ: 'manila-gallery-tropical-001.jpg',       // tall portrait
    process: 'manila-gallery-dsc-0190.jpg',         // portrait
    cta: 'manila-gallery-park-001.jpg',             // tall portrait, warm
  }

  writeSources({ all_considered: all, selected: selection })

  const images = Object.fromEntries(
    Object.entries(selection).map(([key, file]) => [key, readImage(file)])
  )

  // --- Render static slides (1, 3, 4) as PNGs ---
  const staticSlides = [
    ['01_hook_story.png', wrap(slideOne(images))],
    ['03_process_story.png', wrap(slideThree(images))],
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
    await page.waitForTimeout(300)
    await page.screenshot({ path: path.join(OUT_DIR, filename), type: 'png' })
    await page.close()
    console.log(`Rendered ${filename}`)
  }
  await staticCtx.close()

  // --- Render slide 2 as animated MP4 video ---
  console.log('Recording animated proof slide as MP4...')

  // 10 images * 300ms stagger = 3000ms for last to start
  // + 550ms animation = 3550ms for last to finish
  // + 1500ms hold = ~5 seconds total
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
    const dstVideo = path.join(OUT_DIR, '02_proof_story.mp4')

    const { execSync } = await import('child_process')
    try {
      execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${dstVideo}"`, {
        stdio: 'pipe'
      })
      fs.unlinkSync(srcVideo)
      console.log('Rendered 02_proof_story.mp4')
    } catch (err) {
      console.warn('ffmpeg not available, keeping as webm renamed to mp4...')
      fs.renameSync(srcVideo, dstVideo)
      console.log('Rendered 02_proof_story.mp4 (webm container)')
    }
  }

  await browser.close()
  console.log(`Done: 3 static PNGs + 1 animated MP4 written to ${OUT_DIR}`)
}

render().catch(error => {
  console.error(error)
  process.exit(1)
})
