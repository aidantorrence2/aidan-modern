import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v28')

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 410

// Fonts — handwritten feel uses cursive fallback, polaroid labels use monospace
const HAND = "'Marker Felt', 'Comic Sans MS', 'Bradley Hand', cursive"
const BOLD = "'Avenir Next', 'Helvetica Neue', Arial, sans-serif"
const NARROW = "Futura, 'Arial Narrow', sans-serif"

// Colors
const SURFACE_BG = '#D2C4A8'       // warm kraft/cardboard surface
const POLAROID_WHITE = '#FAF8F4'    // slightly warm white border
const MANILA_COLOR = '#C2502A'      // burnt sienna for MANILA
const INK_COLOR = '#2A2420'         // dark brown ink
const TAPE_COLOR = 'rgba(255,245,220,0.55)' // semi-transparent tape

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
    strategy: 'v28 — Scattered Polaroids nostalgic instant film aesthetic, animated MP4 slide 2',
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
        html, body { margin: 0; padding: 0; background: ${SURFACE_BG}; }
      </style>
    </head>
    <body>${html}</body>
  </html>`
}

// Helper: polaroid frame with image inside, rotated, positioned absolutely
// caption goes in the white strip below the photo
function polaroid({ src, x, y, photoW, photoH, rotation, caption, zIndex = 1, shadowSize = 18 }) {
  const borderSide = 20
  const borderTop = 20
  const borderBottom = caption ? 70 : 40
  const totalW = photoW + borderSide * 2
  const totalH = photoH + borderTop + borderBottom
  return `
    <div style="position:absolute;left:${x}px;top:${y}px;width:${totalW}px;height:${totalH}px;
      transform:rotate(${rotation}deg);transform-origin:center center;z-index:${zIndex};
      background:${POLAROID_WHITE};box-shadow:0 ${shadowSize}px ${shadowSize * 2}px rgba(0,0,0,0.25), 0 2px 6px rgba(0,0,0,0.15);
      border-radius:3px;">
      <div style="margin:${borderTop}px ${borderSide}px 0;width:${photoW}px;height:${photoH}px;overflow:hidden;">
        <img src="${src}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center 25%;"/>
      </div>
      ${caption ? `<p style="font-family:${HAND};font-size:24px;color:${INK_COLOR};text-align:center;margin:8px ${borderSide}px 0;line-height:1.2;">${caption}</p>` : ''}
    </div>`
}

// tape strip decoration
function tapeStrip(x, y, w, h, rotation) {
  return `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;
    background:${TAPE_COLOR};transform:rotate(${rotation}deg);z-index:100;border-radius:1px;
    box-shadow:0 1px 3px rgba(0,0,0,0.08);"></div>`
}

// Textured surface background (kraft paper feel)
function surfaceBg() {
  return `
    <div style="position:absolute;inset:0;background:${SURFACE_BG};"></div>
    <div style="position:absolute;inset:0;background:repeating-linear-gradient(
      0deg,
      rgba(0,0,0,0.015) 0px,
      transparent 1px,
      transparent 4px,
      rgba(0,0,0,0.01) 5px
    );"></div>
    <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 30% 40%, rgba(255,255,255,0.08) 0%, transparent 60%);"></div>
  `
}

// Large MANILA header element
function manilaHeader(top = 60, fontSize = 82) {
  return `<p style="position:absolute;left:0;right:0;top:${top}px;text-align:center;
    font-family:${NARROW};font-size:${fontSize}px;font-weight:700;letter-spacing:0.22em;
    text-transform:uppercase;color:${MANILA_COLOR};margin:0;z-index:200;
    text-shadow:0 2px 8px rgba(0,0,0,0.12);">MANILA</p>`
}

// ============================================================
// SLIDE 1: HOOK — "MANILA" huge + one tilted polaroid + "models wanted"
// ============================================================
function slideOne(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;">
      ${surfaceBg()}
      ${manilaHeader(100, 96)}

      <!-- subtitle -->
      <p style="position:absolute;left:0;right:0;top:210px;text-align:center;z-index:200;
        font-family:${BOLD};font-size:48px;font-weight:800;color:${INK_COLOR};margin:0;
        letter-spacing:-0.01em;line-height:1.1;">Model Search</p>

      <!-- main polaroid, tilted -->
      ${polaroid({
        src: images.hero,
        x: 140, y: 340,
        photoW: 640, photoH: 780,
        rotation: -3.5,
        caption: 'models wanted',
        zIndex: 10,
        shadowSize: 24
      })}

      <!-- tape on top of polaroid -->
      ${tapeStrip(380, 335, 100, 28, 12)}

      <!-- small accent text -->
      <p style="position:absolute;left:120px;right:120px;bottom:${SAFE_BOTTOM + 30}px;text-align:center;z-index:200;
        font-family:${HAND};font-size:30px;color:${INK_COLOR};margin:0;opacity:0.7;">
        no experience needed  *  dm if interested</p>
    </div>
  `
}

// ============================================================
// SLIDE 2: ANIMATED — polaroids drop/scatter onto surface one by one
// Returns full HTML (not wrapped) for Playwright recordVideo
// ============================================================
function slideTwoAnimated(images) {
  // Define 7 polaroids that will scatter
  const polaroids = [
    { src: images.scatterA, x: 60,  y: 280,  w: 340, h: 420, rot: -6,  caption: 'golden hour' },
    { src: images.scatterB, x: 520, y: 240,  w: 320, h: 400, rot: 4,   caption: 'street vibes' },
    { src: images.scatterC, x: 180, y: 620,  w: 360, h: 320, rot: 3,   caption: '' },
    { src: images.scatterD, x: 480, y: 580,  w: 300, h: 380, rot: -4,  caption: 'that look' },
    { src: images.scatterE, x: 80,  y: 920,  w: 380, h: 300, rot: 5,   caption: '' },
    { src: images.scatterF, x: 440, y: 880,  w: 340, h: 340, rot: -3,  caption: 'magic' },
    { src: images.scatterG, x: 220, y: 1150, w: 380, h: 300, rot: 2,   caption: 'Manila' },
  ]

  const borderSide = 20
  const borderTop = 20

  let polaroidHtml = ''
  polaroids.forEach((p, i) => {
    const borderBottom = p.caption ? 70 : 40
    const totalW = p.w + borderSide * 2
    const totalH = p.h + borderTop + borderBottom
    const delay = 0.4 + i * 0.55  // stagger: first at 0.4s, then every 0.55s

    polaroidHtml += `
      <div class="pol pol-${i}" style="position:absolute;left:${p.x}px;top:${p.y}px;width:${totalW}px;height:${totalH}px;
        background:${POLAROID_WHITE};box-shadow:0 18px 40px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.15);
        border-radius:3px;z-index:${10 + i};
        opacity:0;transform:rotate(${p.rot}deg) translateY(-80px) scale(0.92);
        animation:dropIn 0.5s ease-out ${delay}s forwards;">
        <div style="margin:${borderTop}px ${borderSide}px 0;width:${p.w}px;height:${p.h}px;overflow:hidden;">
          <img src="${p.src}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center 25%;"/>
        </div>
        ${p.caption ? `<p style="font-family:${HAND};font-size:22px;color:${INK_COLOR};text-align:center;margin:8px ${borderSide}px 0;line-height:1.2;">${p.caption}</p>` : ''}
      </div>`
  })

  const totalDuration = 0.4 + polaroids.length * 0.55 + 0.5 // last item start + animation + small buffer

  return `<!DOCTYPE html>
  <html>
    <head>
      <style>
        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; background: ${SURFACE_BG}; }
        @keyframes dropIn {
          0% { opacity: 0; transform: rotate(var(--rot, 0deg)) translateY(-80px) scale(0.92); }
          60% { opacity: 1; transform: rotate(var(--rot, 0deg)) translateY(8px) scale(1.02); }
          100% { opacity: 1; transform: rotate(var(--rot, 0deg)) translateY(0) scale(1); }
        }
        @keyframes headerSlide {
          0% { opacity: 0; transform: translateY(-30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .header-text {
          opacity: 0;
          animation: headerSlide 0.5s ease-out 0.1s forwards;
        }
        ${polaroids.map((p, i) => `.pol-${i} { --rot: ${p.rot}deg; }`).join('\n        ')}
      </style>
    </head>
    <body>
      <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;">
        <!-- surface bg -->
        <div style="position:absolute;inset:0;background:${SURFACE_BG};"></div>
        <div style="position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(0,0,0,0.015) 0px,transparent 1px,transparent 4px,rgba(0,0,0,0.01) 5px);"></div>
        <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 30% 40%, rgba(255,255,255,0.08) 0%, transparent 60%);"></div>

        <!-- header -->
        <div class="header-text" style="position:absolute;left:0;right:0;top:60px;z-index:200;text-align:center;">
          <p style="font-family:${NARROW};font-size:82px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:${MANILA_COLOR};margin:0 0 8px;
            text-shadow:0 2px 8px rgba(0,0,0,0.12);">MANILA</p>
          <p style="font-family:${HAND};font-size:32px;color:${INK_COLOR};margin:0;opacity:0.7;">my recent shoots</p>
        </div>

        <!-- polaroids -->
        ${polaroidHtml}
      </div>
    </body>
  </html>`
}

// ============================================================
// SLIDE 3: PROCESS — 3 polaroids with handwritten step labels
// ============================================================
function slideThree(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;">
      ${surfaceBg()}
      ${manilaHeader(60, 82)}

      <p style="position:absolute;left:0;right:0;top:165px;text-align:center;z-index:200;
        font-family:${BOLD};font-size:46px;font-weight:800;color:${INK_COLOR};margin:0;">How it works</p>

      <!-- Step 1 polaroid -->
      ${polaroid({
        src: images.step1,
        x: 70, y: 270,
        photoW: 260, photoH: 260,
        rotation: -4,
        caption: '',
        zIndex: 10,
        shadowSize: 14
      })}
      <div style="position:absolute;left:400px;top:310px;width:580px;z-index:20;">
        <p style="font-family:${NARROW};font-size:50px;font-weight:700;color:${MANILA_COLOR};margin:0 0 6px;">01</p>
        <p style="font-family:${HAND};font-size:36px;color:${INK_COLOR};margin:0 0 4px;line-height:1.15;">DM me on instagram</p>
        <p style="font-family:${BOLD};font-size:22px;font-weight:500;color:rgba(42,36,32,0.6);margin:0;">@madebyaidan</p>
      </div>
      ${tapeStrip(140, 268, 80, 22, -8)}

      <!-- Step 2 polaroid -->
      ${polaroid({
        src: images.step2,
        x: 440, y: 620,
        photoW: 260, photoH: 260,
        rotation: 3.5,
        caption: '',
        zIndex: 10,
        shadowSize: 14
      })}
      <div style="position:absolute;left:80px;top:660px;width:360px;z-index:20;">
        <p style="font-family:${NARROW};font-size:50px;font-weight:700;color:${MANILA_COLOR};margin:0 0 6px;">02</p>
        <p style="font-family:${HAND};font-size:36px;color:${INK_COLOR};margin:0 0 4px;line-height:1.15;">we plan together</p>
        <p style="font-family:${BOLD};font-size:22px;font-weight:500;color:rgba(42,36,32,0.6);margin:0;">location, vibe, outfit</p>
      </div>
      ${tapeStrip(560, 615, 80, 22, 15)}

      <!-- Step 3 polaroid -->
      ${polaroid({
        src: images.step3,
        x: 100, y: 970,
        photoW: 260, photoH: 260,
        rotation: -2,
        caption: '',
        zIndex: 10,
        shadowSize: 14
      })}
      <div style="position:absolute;left:430px;top:1010px;width:560px;z-index:20;">
        <p style="font-family:${NARROW};font-size:50px;font-weight:700;color:${MANILA_COLOR};margin:0 0 6px;">03</p>
        <p style="font-family:${HAND};font-size:36px;color:${INK_COLOR};margin:0 0 4px;line-height:1.15;">show up & shine</p>
        <p style="font-family:${BOLD};font-size:22px;font-weight:500;color:rgba(42,36,32,0.6);margin:0;">I direct everything</p>
      </div>
      ${tapeStrip(170, 965, 80, 22, 5)}

      <!-- bottom note -->
      <p style="position:absolute;left:100px;right:100px;bottom:${SAFE_BOTTOM + 20}px;text-align:center;z-index:200;
        font-family:${HAND};font-size:28px;color:${INK_COLOR};margin:0;opacity:0.6;">
        no experience needed</p>
    </div>
  `
}

// ============================================================
// SLIDE 4: CTA — clean polaroid of best photo + "sign up below"
// ============================================================
function slideFour(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;">
      ${surfaceBg()}
      ${manilaHeader(70, 86)}

      <!-- main CTA polaroid -->
      ${polaroid({
        src: images.cta,
        x: 120, y: 240,
        photoW: 680, photoH: 820,
        rotation: 1.5,
        caption: 'this could be you',
        zIndex: 10,
        shadowSize: 28
      })}
      ${tapeStrip(380, 232, 110, 28, -5)}

      <!-- CTA text -->
      <div style="position:absolute;left:0;right:0;bottom:${SAFE_BOTTOM + 16}px;text-align:center;z-index:200;">
        <p style="font-family:${BOLD};font-size:52px;font-weight:800;color:${INK_COLOR};margin:0 0 12px;">dm if interested!!</p>
        <div style="display:inline-block;padding:12px 36px;border-radius:40px;background:${MANILA_COLOR};margin:0 auto;">
          <span style="font-family:${BOLD};font-size:24px;font-weight:700;color:#fff;letter-spacing:0.06em;text-transform:uppercase;">@madebyaidan on instagram</span>
        </div>
      </div>
    </div>
  `
}

// ============================================================
// RENDER
// ============================================================
async function render() {
  resetOutputDir()

  const all = getTopManilaImages()
  const selection = {
    hero:     'manila-gallery-canal-001.jpg',      // 1600x2392 portrait — hook polaroid
    scatterA: 'manila-gallery-closeup-001.jpg',    // 1059x1600
    scatterB: 'manila-gallery-dsc-0911.jpg',       // 957x1510
    scatterC: 'manila-gallery-garden-002.jpg',     // 1600x1061
    scatterD: 'manila-gallery-graffiti-001.jpg',   // 1228x1818
    scatterE: 'manila-gallery-ivy-001.jpg',        // 1600x1061
    scatterF: 'manila-gallery-night-003.jpg',      // 1080x1080
    scatterG: 'manila-gallery-urban-001.jpg',      // 1228x1818
    step1:    'manila-gallery-shadow-001.jpg',     // 1067x1600
    step2:    'manila-gallery-dsc-0130.jpg',       // 968x1508
    step3:    'manila-gallery-dsc-0190.jpg',       // 992x1505
    cta:      'manila-gallery-statue-001.jpg',     // 1600x2392 — CTA best photo
  }

  writeSources({ all_considered: all, selected: selection })

  const images = Object.fromEntries(
    Object.entries(selection).map(([key, file]) => [key, readImage(file)])
  )

  // --- Render static slides (1, 3, 4) as PNGs ---
  const staticSlides = [
    ['01_polaroid_hook.png', wrap(slideOne(images))],
    ['03_polaroid_process.png', wrap(slideThree(images))],
    ['04_polaroid_cta.png', wrap(slideFour(images))]
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
  console.log('Recording animated polaroid scatter slide as MP4...')

  // 7 polaroids * 0.55s stagger + 0.4s initial delay + 0.5s animation + 1.5s hold
  const TOTAL_DURATION_MS = 6500

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

  // Find and convert the recorded webm to mp4
  const videoFiles = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.webm'))
  if (videoFiles.length === 0) {
    console.error('No video file was generated!')
  } else {
    const srcVideo = path.join(OUT_DIR, videoFiles[0])
    const dstVideo = path.join(OUT_DIR, '02_polaroid_scatter.mp4')

    const { execSync } = await import('child_process')
    try {
      execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${dstVideo}"`, {
        stdio: 'pipe'
      })
      fs.unlinkSync(srcVideo)
      console.log('Rendered 02_polaroid_scatter.mp4')
    } catch (err) {
      console.warn('ffmpeg not available, keeping as webm renamed to mp4...')
      fs.renameSync(srcVideo, dstVideo)
      console.log('Rendered 02_polaroid_scatter.mp4 (webm container)')
    }
  }

  await browser.close()
  console.log(`\nDone: 3 static PNGs + 1 animated MP4 written to ${OUT_DIR}`)
}

render().catch(error => {
  console.error(error)
  process.exit(1)
})
