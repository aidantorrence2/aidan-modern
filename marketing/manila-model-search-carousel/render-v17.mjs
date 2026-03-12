import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v17')

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 410

const BOLD = "'Avenir Next', 'Helvetica Neue', Arial, sans-serif"
const BODY = "'Avenir Next', 'Helvetica Neue', Arial, sans-serif"
const NARROW = "Futura, 'Arial Narrow', sans-serif"

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
    strategy: 'v17 — animated proof slide (MP4) + static PNGs, based on v16',
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

// Slide 1: HOOK
function slideOne(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#000;">
      <img src="${images.hero}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top 20%;"/>
      <div style="position:absolute;left:0;right:0;top:0;height:820px;background:linear-gradient(180deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0) 100%);"></div>
      <div style="position:absolute;left:0;right:0;bottom:0;height:${SAFE_BOTTOM + 100}px;background:linear-gradient(0deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%);"></div>
      <div style="position:absolute;left:54px;top:72px;right:54px;">
        <p style="font-family:${NARROW};font-size:64px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#e8b880;margin:0 0 14px;">Manila</p>
        <h1 style="font-family:${BOLD};font-size:108px;font-weight:800;line-height:0.92;color:#fff;margin:0 0 28px;letter-spacing:-0.02em;">Models<br/>wanted.</h1>
        <p style="font-family:${BODY};font-size:34px;font-weight:500;line-height:1.34;color:rgba(255,255,255,0.92);margin:0;">Editorial portrait shoots.<br/>No experience needed.</p>
      </div>
    </div>
  `
}

// Justified gallery — binary search for target row height that fills available space
function justifiedRows(imageList, containerWidth, gap, targetH) {
  const rows = []
  let currentRow = []
  for (const img of imageList) {
    currentRow.push(img)
    const totalAspect = currentRow.reduce((s, i) => s + i.aspect, 0)
    const totalGaps = (currentRow.length - 1) * gap
    const rowHeight = (containerWidth - totalGaps) / totalAspect
    if (rowHeight <= targetH && currentRow.length >= 2) {
      rows.push({ images: [...currentRow], height: Math.round(rowHeight) })
      currentRow = []
    }
  }
  if (currentRow.length > 0) {
    const totalAspect = currentRow.reduce((s, i) => s + i.aspect, 0)
    const totalGaps = (currentRow.length - 1) * gap
    const rowHeight = (containerWidth - totalGaps) / totalAspect
    rows.push({ images: [...currentRow], height: Math.round(Math.min(targetH, rowHeight)) })
  }
  return rows
}

function totalLayoutHeight(rows, gap) {
  return rows.reduce((s, r) => s + r.height, 0) + (rows.length - 1) * gap
}

function fitJustifiedLayout(imageList, containerWidth, availableHeight, gap) {
  let lo = 100, hi = 800
  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2
    const rows = justifiedRows(imageList, containerWidth, gap, mid)
    const h = totalLayoutHeight(rows, gap)
    if (h < availableHeight) lo = mid
    else hi = mid
  }
  return justifiedRows(imageList, containerWidth, gap, (lo + hi) / 2)
}

// Slide 2: PROOF — animated mosaic for video
// Returns HTML with CSS animations for staggered fade+scale reveal
function slideTwoAnimated(images) {
  const HEADER_END = 230
  const BOTTOM_LIMIT = HEIGHT - SAFE_BOTTOM - 16
  const PAD = 28
  const GAP = 8
  const CONTAINER_W = WIDTH - PAD * 2
  const AVAILABLE_H = BOTTOM_LIMIT - HEADER_END

  const mosaicImages = [
    { src: images.gridA,  aspect: 1059 / 1600 },
    { src: images.gridB,  aspect: 957 / 1510 },
    { src: images.gridC,  aspect: 1600 / 1061 },
    { src: images.gridD,  aspect: 1080 / 1080 },
    { src: images.gridE,  aspect: 968 / 1508 },
    { src: images.gridF,  aspect: 1600 / 1072 },
    { src: images.gridG,  aspect: 1228 / 1818 },
    { src: images.gridH,  aspect: 1228 / 1818 },
    { src: images.gridI,  aspect: 1067 / 1600 },
    { src: images.gridJ,  aspect: 1600 / 1061 },
  ]

  const rows = fitJustifiedLayout(mosaicImages, CONTAINER_W, AVAILABLE_H, GAP)

  // Build image tiles with animation classes
  let html = ''
  let y = HEADER_END
  let imgIndex = 0
  for (const row of rows) {
    const totalGaps = (row.images.length - 1) * GAP
    const widths = row.images.map(img => Math.round(row.height * img.aspect))
    const usedWidth = widths.reduce((s, w) => s + w, 0) + totalGaps
    widths[widths.length - 1] += (CONTAINER_W - usedWidth)

    let x = PAD
    for (let i = 0; i < row.images.length; i++) {
      const w = widths[i]
      const delay = imgIndex * 0.3 // 300ms stagger
      html += `<div class="tile tile-${imgIndex}" style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${row.height}px;border-radius:14px;overflow:hidden;opacity:0;transform:scale(0.85);animation:tileReveal 0.6s ease-out ${delay}s forwards;">
        <img src="${row.images[i].src}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center;"/>
      </div>`
      x += w + GAP
      imgIndex++
    }
    y += row.height + GAP
  }

  // Header also fades in at the start
  return `<!DOCTYPE html>
  <html>
    <head>
      <style>
        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; background: #0a0a0a; }
        @keyframes tileReveal {
          0% { opacity: 0; transform: scale(0.85); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes headerFade {
          0% { opacity: 0; transform: translateY(-20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .header {
          opacity: 0;
          animation: headerFade 0.5s ease-out 0s forwards;
        }
      </style>
    </head>
    <body>
      <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#0a0a0a;">
        <div class="header" style="position:absolute;left:54px;top:62px;right:54px;">
          <p style="font-family:${NARROW};font-size:64px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#e8b880;margin:0 0 10px;">Manila</p>
          <h2 style="font-family:${BOLD};font-size:62px;font-weight:800;line-height:0.94;color:#fff;margin:0;letter-spacing:-0.02em;">This is my work.</h2>
        </div>
        ${html}
      </div>
    </body>
  </html>`
}

// Slide 3: HOW EASY
function slideThree(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#0a0a0a;">
      <div style="position:absolute;right:0;top:0;width:480px;height:100%;overflow:hidden;">
        <img src="${images.process}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center;"/>
        <div style="position:absolute;inset:0;background:linear-gradient(90deg, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.15) 30%, rgba(10,10,10,0) 50%);"></div>
        <div style="position:absolute;left:0;right:0;bottom:0;height:${SAFE_BOTTOM + 60}px;background:linear-gradient(0deg, rgba(10,10,10,0.6) 0%, rgba(10,10,10,0) 100%);"></div>
      </div>
      <div style="position:absolute;left:54px;top:62px;width:540px;">
        <p style="font-family:${NARROW};font-size:64px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#e8b880;margin:0 0 10px;">Manila</p>
        <h2 style="font-family:${BOLD};font-size:72px;font-weight:800;line-height:0.94;color:#fff;margin:0 0 12px;letter-spacing:-0.02em;">3 steps.</h2>
        <p style="font-family:${BODY};font-size:30px;font-weight:500;color:rgba(255,255,255,0.6);margin:0;">That's it.</p>
      </div>
      <div style="position:absolute;left:54px;top:360px;width:540px;display:flex;flex-direction:column;gap:20px;">
        <div style="padding:28px 32px;border-radius:22px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.1);">
          <p style="font-family:${NARROW};font-size:22px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#e8b880;margin:0 0 10px;">Step 1</p>
          <p style="font-family:${BOLD};font-size:36px;font-weight:700;color:#fff;margin:0 0 8px;line-height:1.1;">DM me on Instagram</p>
          <p style="font-family:${BODY};font-size:25px;color:rgba(255,255,255,0.7);margin:0;line-height:1.3;">@madebyaidan</p>
        </div>
        <div style="padding:28px 32px;border-radius:22px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.1);">
          <p style="font-family:${NARROW};font-size:22px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#e8b880;margin:0 0 10px;">Step 2</p>
          <p style="font-family:${BOLD};font-size:36px;font-weight:700;color:#fff;margin:0 0 8px;line-height:1.1;">We pick a date</p>
          <p style="font-family:${BODY};font-size:25px;color:rgba(255,255,255,0.7);margin:0;line-height:1.3;">Location, vibe, and look — we plan it together.</p>
        </div>
        <div style="padding:28px 32px;border-radius:22px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.1);">
          <p style="font-family:${NARROW};font-size:22px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#e8b880;margin:0 0 10px;">Step 3</p>
          <p style="font-family:${BOLD};font-size:36px;font-weight:700;color:#fff;margin:0 0 8px;line-height:1.1;">Show up. I guide you.</p>
          <p style="font-family:${BODY};font-size:25px;color:rgba(255,255,255,0.7);margin:0;line-height:1.3;">No posing experience needed. You just show up.</p>
        </div>
      </div>
    </div>
  `
}

// Slide 4: CTA
function slideFour(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#000;">
      <img src="${images.cta}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 60%;"/>
      <div style="position:absolute;left:0;right:0;top:0;height:740px;background:linear-gradient(180deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.65) 55%, rgba(0,0,0,0) 100%);"></div>
      <div style="position:absolute;left:0;right:0;bottom:0;height:${SAFE_BOTTOM + 100}px;background:linear-gradient(0deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%);"></div>
      <div style="position:absolute;left:54px;top:72px;right:54px;">
        <p style="font-family:${NARROW};font-size:64px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#e8b880;margin:0 0 14px;">Manila</p>
        <h2 style="font-family:${BOLD};font-size:96px;font-weight:800;line-height:0.92;color:#fff;margin:0 0 30px;letter-spacing:-0.02em;">DM me if<br/>interested.</h2>
        <p style="font-family:${BODY};font-size:34px;font-weight:500;line-height:1.38;color:rgba(255,255,255,0.9);margin:0 0 40px;">@madebyaidan on Instagram</p>
      </div>
      <div style="position:absolute;left:54px;top:520px;display:inline-flex;align-items:center;padding:16px 28px;border-radius:16px;background:rgba(255,255,255,0.14);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.2);">
        <span style="font-family:${BOLD};font-size:26px;font-weight:700;color:#fff;letter-spacing:0.02em;">No experience needed</span>
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
    gridG: 'manila-gallery-graffiti-001.jpg',
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

  // --- Render static slides (1, 3, 4) as PNGs ---
  const staticSlides = [
    ['01_hook_story.png', wrap(slideOne(images))],
    ['03_how_easy_story.png', wrap(slideThree(images))],
    ['04_sign_up_story.png', wrap(slideFour(images))]
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
  console.log('Recording animated proof slide as MP4...')

  // 10 images * 300ms stagger = 3000ms for last image to start
  // + 600ms animation duration = 3600ms for last image to finish
  // + 1000ms hold = 4600ms total (~4.6 seconds)
  const TOTAL_DURATION_MS = 5000 // ~5 seconds total

  const videoCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: OUT_DIR,
      size: { width: WIDTH, height: HEIGHT }
    }
  })

  const videoPage = await videoCtx.newPage()

  // Load page with all tiles initially hidden (animation hasn't started yet)
  const animatedHtml = slideTwoAnimated(images)
  await videoPage.setContent(animatedHtml, { waitUntil: 'load' })

  // Wait for all images to load before animations begin
  await videoPage.waitForTimeout(500)

  // Wait for the full animation duration + hold time
  await videoPage.waitForTimeout(TOTAL_DURATION_MS)

  // Close the page to finalize the video
  await videoPage.close()
  await videoCtx.close()

  // Playwright saves video with an auto-generated name; find and rename it
  // The video is saved in OUT_DIR with a random filename
  const videoFiles = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.webm'))
  if (videoFiles.length === 0) {
    console.error('No video file was generated! Trying alternative approach...')
    // Fallback: use ffmpeg to convert if available, or just report error
  } else {
    const srcVideo = path.join(OUT_DIR, videoFiles[0])
    const dstVideo = path.join(OUT_DIR, '02_proof_story.mp4')

    // Playwright records as WebM; convert to MP4 using ffmpeg
    const { execSync } = await import('child_process')
    try {
      execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${dstVideo}"`, {
        stdio: 'pipe'
      })
      fs.unlinkSync(srcVideo) // Remove the original webm
      console.log('Rendered 02_proof_story.mp4')
    } catch (err) {
      // If ffmpeg is not available, just rename the webm
      console.warn('ffmpeg not available, keeping as webm and renaming to mp4...')
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
