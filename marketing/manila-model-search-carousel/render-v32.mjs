import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v32')

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 410

// Swiss/International Typographic Style fonts
const SWISS = "'Helvetica Neue', Helvetica, Arial, sans-serif"
const MONO = "'SF Mono', 'Menlo', 'Courier New', monospace"

const RED = '#E42320'       // Swiss red accent
const BLACK = '#1A1A1A'
const WHITE = '#FFFFFF'
const GRAY_LIGHT = '#F2F2F2'
const GRAY_MID = '#999999'
const GRAY_LINE = '#CCCCCC'

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
    strategy: 'v32 -- Swiss/International Typographic Style, ultra minimal grid, red MANILA accent',
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
        html, body { margin: 0; padding: 0; background: ${WHITE}; }
      </style>
    </head>
    <body>${html}</body>
  </html>`
}

// ---- SLIDE 1: HOOK ----
// Massive "MANILA" taking up half the slide, small "models wanted." underneath
// Single photo in precise grid position
function slideOne(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${WHITE};">
      <!-- Thin grid lines for Swiss feel -->
      <div style="position:absolute;left:60px;top:0;width:1px;height:100%;background:${GRAY_LINE};opacity:0.4;"></div>
      <div style="position:absolute;left:${WIDTH - 60}px;top:0;width:1px;height:100%;background:${GRAY_LINE};opacity:0.4;"></div>
      <div style="position:absolute;left:${WIDTH / 2}px;top:0;width:1px;height:100%;background:${GRAY_LINE};opacity:0.25;"></div>

      <!-- MANILA -- massive, takes up top half -->
      <div style="position:absolute;left:60px;top:120px;right:60px;">
        <p style="font-family:${SWISS};font-size:180px;font-weight:900;letter-spacing:-0.04em;text-transform:uppercase;color:${RED};margin:0;line-height:0.88;">MANILA</p>
      </div>

      <!-- Thin red horizontal rule -->
      <div style="position:absolute;left:60px;top:310px;width:200px;height:3px;background:${RED};"></div>

      <!-- "models wanted." small, precise -->
      <div style="position:absolute;left:60px;top:340px;">
        <p style="font-family:${SWISS};font-size:38px;font-weight:300;color:${BLACK};margin:0;letter-spacing:0.02em;line-height:1.2;">models wanted.</p>
        <p style="font-family:${SWISS};font-size:22px;font-weight:300;color:${GRAY_MID};margin:14px 0 0;letter-spacing:0.04em;line-height:1.4;">Editorial portrait shoots.<br/>No experience needed.</p>
      </div>

      <!-- Single photo in precise grid position (right-aligned, lower portion) -->
      <div style="position:absolute;left:60px;top:520px;width:${WIDTH - 120}px;height:${HEIGHT - 520 - SAFE_BOTTOM - 40}px;overflow:hidden;">
        <img src="${images.hero}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center 20%;"/>
      </div>

      <!-- Small monospace date/location tag -->
      <div style="position:absolute;left:60px;bottom:${SAFE_BOTTOM + 20}px;">
        <p style="font-family:${MONO};font-size:14px;font-weight:400;color:${GRAY_MID};margin:0;letter-spacing:0.08em;text-transform:uppercase;">Manila, Philippines -- 2025</p>
      </div>
    </div>
  `
}

// ---- SLIDE 2: ANIMATED -- photos snap into clean grid one by one ----
// Returns full HTML with CSS animations (not wrapped)
function slideTwoAnimated(images) {
  const GRID_TOP = 280
  const GRID_LEFT = 60
  const GRID_RIGHT = 60
  const GRID_GAP = 6
  const COLS = 3
  const CONTAINER_W = WIDTH - GRID_LEFT - GRID_RIGHT
  const CELL_W = Math.floor((CONTAINER_W - (COLS - 1) * GRID_GAP) / COLS)
  const CELL_H = Math.floor(CELL_W * 1.35) // portrait ratio
  const BOTTOM_LIMIT = HEIGHT - SAFE_BOTTOM - 20

  const gridImages = [
    images.gridA, images.gridB, images.gridC,
    images.gridD, images.gridE, images.gridF,
    images.gridG, images.gridH, images.gridI,
  ]

  // Calculate rows that fit
  const maxRows = Math.floor((BOTTOM_LIMIT - GRID_TOP + GRID_GAP) / (CELL_H + GRID_GAP))
  const rows = Math.min(maxRows, 3)

  let tilesHtml = ''
  let idx = 0
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < COLS; c++) {
      if (idx >= gridImages.length) break
      const x = GRID_LEFT + c * (CELL_W + GRID_GAP)
      const y = GRID_TOP + r * (CELL_H + GRID_GAP)
      const delay = idx * 0.28  // 280ms stagger -- precise, mechanical
      tilesHtml += `<div class="tile" style="position:absolute;left:${x}px;top:${y}px;width:${CELL_W}px;height:${CELL_H}px;overflow:hidden;opacity:0;animation:snapIn 0.15s cubic-bezier(0.2,0,0.2,1) ${delay}s forwards;">
        <img src="${gridImages[idx]}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center;"/>
      </div>`
      idx++
    }
  }

  return `<!DOCTYPE html>
  <html>
    <head>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { margin: 0; padding: 0; background: ${WHITE}; }
        @keyframes snapIn {
          0% { opacity: 0; transform: translateY(-8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .header { opacity: 0; animation: fadeIn 0.3s ease-out 0s forwards; }
      </style>
    </head>
    <body>
      <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${WHITE};">
        <!-- Grid lines -->
        <div style="position:absolute;left:60px;top:0;width:1px;height:100%;background:${GRAY_LINE};opacity:0.4;"></div>
        <div style="position:absolute;left:${WIDTH - 60}px;top:0;width:1px;height:100%;background:${GRAY_LINE};opacity:0.4;"></div>

        <!-- Header -->
        <div class="header" style="position:absolute;left:60px;top:80px;right:60px;">
          <p style="font-family:${SWISS};font-size:80px;font-weight:900;letter-spacing:-0.04em;text-transform:uppercase;color:${RED};margin:0;line-height:0.9;">MANILA</p>
          <div style="width:120px;height:2px;background:${RED};margin:16px 0;"></div>
          <p style="font-family:${SWISS};font-size:30px;font-weight:300;color:${BLACK};margin:0;letter-spacing:0.01em;">This is my work.</p>
        </div>

        <!-- Grid tiles -->
        ${tilesHtml}
      </div>
    </body>
  </html>`
}

// ---- SLIDE 3: PROCESS ----
// Numbered list with strict left alignment, thin grid lines, one accent photo
function slideThree(images) {
  const steps = [
    { num: '01', title: 'Sign up below', desc: 'Takes 60 seconds. I message you back.' },
    { num: '02', title: 'We pick a date', desc: 'Location and look -- planned together.' },
    { num: '03', title: 'Show up. I guide you.', desc: 'No posing experience needed.' },
  ]

  let stepsHtml = ''
  let y = 380
  for (const step of steps) {
    stepsHtml += `
      <!-- Thin rule above step -->
      <div style="position:absolute;left:60px;top:${y}px;right:60px;height:1px;background:${GRAY_LINE};"></div>
      <div style="position:absolute;left:60px;top:${y + 20}px;">
        <p style="font-family:${MONO};font-size:16px;font-weight:400;color:${RED};margin:0;letter-spacing:0.06em;">${step.num}</p>
      </div>
      <div style="position:absolute;left:130px;top:${y + 16}px;right:60px;">
        <p style="font-family:${SWISS};font-size:34px;font-weight:700;color:${BLACK};margin:0;line-height:1.15;letter-spacing:-0.01em;">${step.title}</p>
        <p style="font-family:${SWISS};font-size:22px;font-weight:300;color:${GRAY_MID};margin:10px 0 0;line-height:1.3;">${step.desc}</p>
      </div>
    `
    y += 160
  }

  // Accent photo position: bottom right, above safe area
  const photoW = 400
  const photoH = 520
  const photoTop = HEIGHT - SAFE_BOTTOM - photoH - 30
  const photoLeft = WIDTH - 60 - photoW

  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${WHITE};">
      <!-- Grid lines -->
      <div style="position:absolute;left:60px;top:0;width:1px;height:100%;background:${GRAY_LINE};opacity:0.4;"></div>
      <div style="position:absolute;left:${WIDTH - 60}px;top:0;width:1px;height:100%;background:${GRAY_LINE};opacity:0.4;"></div>
      <div style="position:absolute;left:130px;top:0;width:1px;height:100%;background:${GRAY_LINE};opacity:0.2;"></div>

      <!-- Header -->
      <div style="position:absolute;left:60px;top:80px;right:60px;">
        <p style="font-family:${SWISS};font-size:80px;font-weight:900;letter-spacing:-0.04em;text-transform:uppercase;color:${RED};margin:0;line-height:0.9;">MANILA</p>
        <div style="width:120px;height:2px;background:${RED};margin:16px 0;"></div>
        <p style="font-family:${SWISS};font-size:30px;font-weight:300;color:${BLACK};margin:0;letter-spacing:0.01em;">How it works.</p>
      </div>

      <!-- Steps -->
      ${stepsHtml}

      <!-- Bottom rule -->
      <div style="position:absolute;left:60px;top:${380 + steps.length * 160}px;right:60px;height:1px;background:${GRAY_LINE};"></div>

      <!-- Accent photo, bottom right -->
      <div style="position:absolute;left:${photoLeft}px;top:${photoTop}px;width:${photoW}px;height:${photoH}px;overflow:hidden;">
        <img src="${images.process}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center;"/>
      </div>

      <!-- Small monospace label near photo -->
      <div style="position:absolute;left:60px;top:${photoTop + 10}px;">
        <p style="font-family:${MONO};font-size:13px;font-weight:400;color:${GRAY_MID};letter-spacing:0.06em;text-transform:uppercase;margin:0;">No experience needed.</p>
      </div>
    </div>
  `
}

// ---- SLIDE 4: CTA ----
// "Sign up below." in huge type, one photo, red accent bar
function slideFour(images) {
  const photoH = 580
  const photoTop = 500
  const photoLeft = 60
  const photoW = WIDTH - 120

  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${WHITE};">
      <!-- Grid lines -->
      <div style="position:absolute;left:60px;top:0;width:1px;height:100%;background:${GRAY_LINE};opacity:0.4;"></div>
      <div style="position:absolute;left:${WIDTH - 60}px;top:0;width:1px;height:100%;background:${GRAY_LINE};opacity:0.4;"></div>

      <!-- Red accent bar (thick, top-left) -->
      <div style="position:absolute;left:0;top:0;width:8px;height:${HEIGHT}px;background:${RED};"></div>

      <!-- MANILA -->
      <div style="position:absolute;left:60px;top:80px;">
        <p style="font-family:${SWISS};font-size:80px;font-weight:900;letter-spacing:-0.04em;text-transform:uppercase;color:${RED};margin:0;line-height:0.9;">MANILA</p>
      </div>

      <!-- "Sign up below." huge type -->
      <div style="position:absolute;left:60px;top:200px;right:60px;">
        <p style="font-family:${SWISS};font-size:96px;font-weight:900;color:${BLACK};margin:0;line-height:0.95;letter-spacing:-0.03em;">Sign up<br/>below.</p>
      </div>

      <!-- Thin red rule -->
      <div style="position:absolute;left:60px;top:440px;width:160px;height:3px;background:${RED};"></div>

      <!-- Subtext -->
      <div style="position:absolute;left:60px;top:460px;">
        <p style="font-family:${SWISS};font-size:22px;font-weight:300;color:${GRAY_MID};margin:0;letter-spacing:0.02em;line-height:1.4;">60-second form. I'll message you back within a day.</p>
      </div>

      <!-- Photo -->
      <div style="position:absolute;left:${photoLeft}px;top:${photoTop}px;width:${photoW}px;height:${photoH}px;overflow:hidden;">
        <img src="${images.cta}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center 30%;"/>
      </div>

      <!-- Red accent bar bottom -->
      <div style="position:absolute;left:60px;bottom:${SAFE_BOTTOM + 20}px;right:60px;height:4px;background:${RED};"></div>

      <!-- Small tag -->
      <div style="position:absolute;left:60px;bottom:${SAFE_BOTTOM + 40}px;">
        <p style="font-family:${MONO};font-size:13px;font-weight:400;color:${GRAY_MID};letter-spacing:0.08em;text-transform:uppercase;margin:0;">Limited spots this month</p>
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
    gridF: 'manila-gallery-graffiti-001.jpg',
    gridG: 'manila-gallery-urban-001.jpg',
    gridH: 'manila-gallery-shadow-001.jpg',
    gridI: 'manila-gallery-ivy-001.jpg',
    process: 'manila-gallery-dsc-0190.jpg',
    cta: 'manila-gallery-floor-001.jpg'
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
  console.log('Recording animated grid slide as MP4...')

  // 9 images * 280ms stagger = 2520ms for last to start + 150ms anim + 1000ms hold
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
  await videoPage.waitForTimeout(500)
  await videoPage.waitForTimeout(TOTAL_DURATION_MS)

  await videoPage.close()
  await videoCtx.close()

  // Convert webm to mp4
  const videoFiles = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.webm'))
  if (videoFiles.length === 0) {
    console.error('No video file was generated!')
  } else {
    const srcVideo = path.join(OUT_DIR, videoFiles[0])
    const dstVideo = path.join(OUT_DIR, '02_grid_story.mp4')

    const { execSync } = await import('child_process')
    try {
      execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${dstVideo}"`, {
        stdio: 'pipe'
      })
      fs.unlinkSync(srcVideo)
      console.log('Rendered 02_grid_story.mp4')
    } catch (err) {
      console.warn('ffmpeg not available, keeping as webm renamed to mp4...')
      fs.renameSync(srcVideo, dstVideo)
      console.log('Rendered 02_grid_story.mp4 (webm container)')
    }
  }

  await browser.close()
  console.log(`Done: 3 static PNGs + 1 animated MP4 written to ${OUT_DIR}`)
}

render().catch(error => {
  console.error(error)
  process.exit(1)
})
