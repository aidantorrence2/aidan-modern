import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v22')

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 410

// Fonts
const SERIF = "Georgia, 'Times New Roman', serif"
const SANS = "'Avenir Next', 'Helvetica Neue', Arial, sans-serif"
const MONO = "'SF Mono', 'Menlo', 'Courier New', monospace"

// Colors — warm editorial palette
const CREAM = '#FAF6F1'
const DARK = '#1A1612'
const GOLD = '#C4974A'
const SOFT_GRAY = '#8A8178'

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

function getTopManilaImages(count = 30) {
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
    strategy: 'v22 — story-format narrative ad: "She never modeled before" mini-story across 4 slides',
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
        html, body { margin: 0; padding: 0; background: ${CREAM}; }
      </style>
    </head>
    <body>${html}</body>
  </html>`
}

// ─────────────────────────────────────────────────────────────
// SLIDE 1: THE HOOK — "She'd never modeled before."
// Warm cream background, editorial serif text, a single candid
// photo at bottom. Feels like the opening of a magazine story.
// ─────────────────────────────────────────────────────────────
function slideOne(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${CREAM};">
      <!-- MANILA tag top-left -->
      <div style="position:absolute;left:60px;top:72px;">
        <p style="font-family:${MONO};font-size:18px;font-weight:600;letter-spacing:0.22em;text-transform:uppercase;color:${GOLD};margin:0;">MANILA</p>
      </div>

      <!-- Main story text -->
      <div style="position:absolute;left:60px;top:200px;right:60px;">
        <h1 style="font-family:${SERIF};font-size:88px;font-weight:400;line-height:1.05;color:${DARK};margin:0 0 32px;letter-spacing:-0.01em;">She'd never<br/>modeled<br/>before.</h1>
        <div style="width:60px;height:3px;background:${GOLD};margin:0 0 28px;"></div>
        <p style="font-family:${SANS};font-size:30px;font-weight:400;line-height:1.5;color:${SOFT_GRAY};margin:0;">She signed up on Tuesday.<br/>By Saturday, she had these photos.</p>
      </div>

      <!-- Photo — candid/approachable feel, bottom portion of slide -->
      <div style="position:absolute;left:60px;right:60px;top:660px;bottom:${SAFE_BOTTOM + 20}px;border-radius:16px;overflow:hidden;">
        <img src="${images.story_opener}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center 15%;"/>
      </div>
    </div>
  `
}

// ─────────────────────────────────────────────────────────────
// SLIDE 2: THE SHOOT (ANIMATED) — Photos appear one by one
// like they're being developed/revealed. Timeline-style layout.
// "Day of the shoot" feeling.
// ─────────────────────────────────────────────────────────────
function slideTwoAnimated(images) {
  // 6 photos arranged in a staggered editorial layout
  const photos = [
    { src: images.shoot_a, x: 60,  y: 280, w: 460, h: 340, radius: 14, delay: 0.4 },
    { src: images.shoot_b, x: 560, y: 240, w: 460, h: 400, radius: 14, delay: 0.9 },
    { src: images.shoot_c, x: 60,  y: 650, w: 320, h: 440, radius: 14, delay: 1.4 },
    { src: images.shoot_d, x: 420, y: 680, w: 600, h: 370, radius: 14, delay: 1.9 },
    { src: images.shoot_e, x: 60,  y: 1120, w: 480, h: 350, radius: 14, delay: 2.4 },
    { src: images.shoot_f, x: 580, y: 1080, w: 440, h: 410, radius: 14, delay: 2.9 },
  ]

  let tilesHtml = ''
  for (let i = 0; i < photos.length; i++) {
    const p = photos[i]
    tilesHtml += `
      <div class="photo-tile" style="
        position:absolute;left:${p.x}px;top:${p.y}px;width:${p.w}px;height:${p.h}px;
        border-radius:${p.radius}px;overflow:hidden;
        opacity:0;transform:translateY(30px) scale(0.96);
        animation:photoReveal 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${p.delay}s forwards;
        box-shadow:0 8px 32px rgba(0,0,0,0.08);
      ">
        <img src="${p.src}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center;"/>
      </div>
    `
  }

  return `<!DOCTYPE html>
  <html>
    <head>
      <style>
        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; background: ${CREAM}; }
        @keyframes photoReveal {
          0% { opacity: 0; transform: translateY(30px) scale(0.96); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes headerSlide {
          0% { opacity: 0; transform: translateY(-16px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes lineGrow {
          0% { width: 0; }
          100% { width: 60px; }
        }
        .header { opacity: 0; animation: headerSlide 0.5s ease-out 0s forwards; }
        .accent-line { width: 0; animation: lineGrow 0.6s ease-out 0.2s forwards; }
      </style>
    </head>
    <body>
      <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${CREAM};">
        <!-- Header -->
        <div class="header" style="position:absolute;left:60px;top:72px;right:60px;">
          <p style="font-family:${MONO};font-size:18px;font-weight:600;letter-spacing:0.22em;text-transform:uppercase;color:${GOLD};margin:0 0 20px;">MANILA</p>
          <h2 style="font-family:${SERIF};font-size:62px;font-weight:400;line-height:1.08;color:${DARK};margin:0;letter-spacing:-0.01em;">The shoot day.</h2>
          <div class="accent-line" style="height:3px;background:${GOLD};margin:16px 0 0;"></div>
        </div>

        <!-- Photo tiles -->
        ${tilesHtml}
      </div>
    </body>
  </html>`
}

// ─────────────────────────────────────────────────────────────
// SLIDE 3: THE RESULTS — Big beautiful final photos
// "And here's what she got." Two large hero shots stacked.
// ─────────────────────────────────────────────────────────────
function slideThree(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${CREAM};">
      <!-- Header -->
      <div style="position:absolute;left:60px;top:72px;right:60px;">
        <p style="font-family:${MONO};font-size:18px;font-weight:600;letter-spacing:0.22em;text-transform:uppercase;color:${GOLD};margin:0 0 20px;">MANILA</p>
        <h2 style="font-family:${SERIF};font-size:62px;font-weight:400;line-height:1.08;color:${DARK};margin:0;">The results.</h2>
        <div style="width:60px;height:3px;background:${GOLD};margin:16px 0 0;"></div>
      </div>

      <!-- Two side-by-side tall portrait photos -->
      <div style="position:absolute;left:60px;right:60px;top:260px;display:flex;gap:16px;height:${HEIGHT - SAFE_BOTTOM - 260 - 80}px;">
        <div style="flex:1;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.08);">
          <img src="${images.result_a}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center 15%;"/>
        </div>
        <div style="flex:1;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.08);">
          <img src="${images.result_b}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center 20%;"/>
        </div>
      </div>

      <!-- Caption -->
      <div style="position:absolute;left:60px;right:60px;bottom:${SAFE_BOTTOM + 30}px;">
        <p style="font-family:${SANS};font-size:28px;font-weight:400;line-height:1.5;color:${SOFT_GRAY};margin:0;text-align:center;">No experience. No agency. Just her.</p>
      </div>
    </div>
  `
}

// ─────────────────────────────────────────────────────────────
// SLIDE 4: CTA — "This could be you."
// Personal, direct. One beautiful photo + clear sign-up ask.
// ─────────────────────────────────────────────────────────────
function slideFour(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${DARK};">
      <!-- Full bleed image with dark overlay -->
      <img src="${images.cta_hero}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 25%;"/>
      <div style="position:absolute;left:0;right:0;top:0;height:900px;background:linear-gradient(180deg, rgba(26,22,18,0.85) 0%, rgba(26,22,18,0.5) 60%, rgba(26,22,18,0) 100%);"></div>
      <div style="position:absolute;left:0;right:0;bottom:0;height:${SAFE_BOTTOM + 200}px;background:linear-gradient(0deg, rgba(26,22,18,0.7) 0%, rgba(26,22,18,0) 100%);"></div>

      <!-- Text content -->
      <div style="position:absolute;left:60px;top:72px;right:60px;">
        <p style="font-family:${MONO};font-size:18px;font-weight:600;letter-spacing:0.22em;text-transform:uppercase;color:${GOLD};margin:0 0 40px;">MANILA</p>
        <h2 style="font-family:${SERIF};font-size:96px;font-weight:400;line-height:1.02;color:#fff;margin:0 0 36px;letter-spacing:-0.01em;">This could<br/>be you.</h2>
        <div style="width:60px;height:3px;background:${GOLD};margin:0 0 32px;"></div>
        <p style="font-family:${SANS};font-size:32px;font-weight:400;line-height:1.5;color:rgba(255,255,255,0.85);margin:0 0 48px;">No experience needed.<br/>Sign up below — it takes 60 seconds.</p>

        <!-- Urgency badge -->
        <div style="display:inline-flex;align-items:center;gap:12px;padding:16px 28px;border-radius:100px;background:rgba(196,151,74,0.2);border:1px solid rgba(196,151,74,0.4);">
          <div style="width:10px;height:10px;border-radius:50%;background:${GOLD};"></div>
          <span style="font-family:${MONO};font-size:18px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:${GOLD};">3 spots left this month</span>
        </div>
      </div>
    </div>
  `
}

async function render() {
  resetOutputDir()

  const all = getTopManilaImages()
  const selection = {
    // Slide 1: Approachable/candid opener photo
    story_opener: 'manila-gallery-garden-002.jpg',
    // Slide 2: Shoot day photos — variety of locations/vibes
    shoot_a: 'manila-gallery-canal-002.jpg',
    shoot_b: 'manila-gallery-graffiti-001.jpg',
    shoot_c: 'manila-gallery-dsc-0911.jpg',
    shoot_d: 'manila-gallery-ivy-001.jpg',
    shoot_e: 'manila-gallery-night-003.jpg',
    shoot_f: 'manila-gallery-urban-001.jpg',
    // Slide 3: Best "final result" portfolio shots (tall portraits)
    result_a: 'manila-gallery-canal-001.jpg',
    result_b: 'manila-gallery-tropical-001.jpg',
    // Slide 4: CTA hero — striking portrait
    cta_hero: 'manila-gallery-floor-001.jpg',
  }

  writeSources({ all_considered: all, selected: selection })

  const images = Object.fromEntries(
    Object.entries(selection).map(([key, file]) => [key, readImage(file)])
  )

  // --- Render static slides (1, 3, 4) as PNGs ---
  const staticSlides = [
    ['01_story_hook.png', wrap(slideOne(images))],
    ['03_results.png', wrap(slideThree(images))],
    ['04_cta.png', wrap(slideFour(images))]
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
  console.log('Recording animated shoot-day slide as MP4...')

  // 6 photos, last starts at 2.9s + 0.7s animation = 3.6s + 1.4s hold = 5s
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
    const dstVideo = path.join(OUT_DIR, '02_shoot_day.mp4')

    const { execSync } = await import('child_process')
    try {
      execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${dstVideo}"`, {
        stdio: 'pipe'
      })
      fs.unlinkSync(srcVideo)
      console.log('Rendered 02_shoot_day.mp4')
    } catch (err) {
      console.warn('ffmpeg not available, keeping as webm renamed to mp4...')
      fs.renameSync(srcVideo, dstVideo)
      console.log('Rendered 02_shoot_day.mp4 (webm container)')
    }
  }

  await browser.close()
  console.log(`\nDone: 3 static PNGs + 1 animated MP4 written to ${OUT_DIR}`)
}

render().catch(error => {
  console.error(error)
  process.exit(1)
})
