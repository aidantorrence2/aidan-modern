import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v29')

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 410

// Elegant serif fonts for magazine aesthetic
const SERIF = "Georgia, 'Baskerville', 'Times New Roman', serif"
const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif"

// Magazine color palette
const CREAM = '#FAF7F2'
const NEAR_BLACK = '#1A1A1A'
const GOLD = '#C8A96E'
const RULE_COLOR = '#D4CFC6'

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
    strategy: 'v29 — Magazine Cover / Editorial Spread concept, serif typography, animated editorial layout',
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

// ─── SLIDE 1: MAGAZINE COVER ───────────────────────────────────────────
function slideOne(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${CREAM};">
      <!-- Cover model photo — full bleed behind everything -->
      <img src="${images.cover}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center top;"/>

      <!-- Subtle dark vignette overlay across entire image -->
      <div style="position:absolute;inset:0;background:radial-gradient(ellipse at center, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.35) 100%);"></div>

      <!-- Dark gradient from top for masthead readability -->
      <div style="position:absolute;left:0;right:0;top:0;height:750px;background:linear-gradient(180deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.55) 40%, rgba(0,0,0,0) 100%);"></div>
      <!-- Dark gradient from bottom for cover lines -->
      <div style="position:absolute;left:0;right:0;bottom:0;height:${SAFE_BOTTOM + 450}px;background:linear-gradient(0deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.45) 40%, rgba(0,0,0,0) 100%);"></div>

      <!-- Thin top rule -->
      <div style="position:absolute;left:60px;right:60px;top:58px;height:1px;background:rgba(255,255,255,0.5);"></div>

      <!-- Issue info above masthead -->
      <div style="position:absolute;left:60px;right:60px;top:66px;display:flex;justify-content:space-between;align-items:center;">
        <span style="font-family:${SANS};font-size:19px;font-weight:500;letter-spacing:0.25em;text-transform:uppercase;color:rgba(255,255,255,0.85);text-shadow:0 1px 6px rgba(0,0,0,0.7), 0 2px 12px rgba(0,0,0,0.4);">Issue No. 01</span>
        <span style="font-family:${SANS};font-size:19px;font-weight:500;letter-spacing:0.25em;text-transform:uppercase;color:rgba(255,255,255,0.85);text-shadow:0 1px 6px rgba(0,0,0,0.7), 0 2px 12px rgba(0,0,0,0.4);">Manila, PH</span>
      </div>

      <!-- MANILA masthead — VERY LARGE -->
      <div style="position:absolute;left:0;right:0;top:100px;text-align:center;">
        <h1 style="font-family:${SERIF};font-size:120px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#fff;margin:0;text-shadow:0 2px 8px rgba(0,0,0,0.8), 0 4px 24px rgba(0,0,0,0.5), 0 0 60px rgba(0,0,0,0.3);">MANILA</h1>
      </div>

      <!-- Thin rule below masthead -->
      <div style="position:absolute;left:60px;right:60px;top:240px;height:1px;background:rgba(255,255,255,0.45);"></div>

      <!-- Cover lines — left side -->
      <div style="position:absolute;left:60px;bottom:${SAFE_BOTTOM + 40}px;">
        <p style="font-family:${SANS};font-size:18px;font-weight:500;letter-spacing:0.2em;text-transform:uppercase;color:${GOLD};margin:0 0 14px;text-shadow:0 1px 6px rgba(0,0,0,0.7), 0 2px 12px rgba(0,0,0,0.4);">The Model Search Issue</p>
        <p style="font-family:${SERIF};font-size:54px;font-weight:700;font-style:italic;line-height:1.05;color:#fff;margin:0 0 20px;text-shadow:0 2px 8px rgba(0,0,0,0.7), 0 4px 20px rgba(0,0,0,0.4);">Models<br/>Wanted</p>
        <div style="width:60px;height:2px;background:${GOLD};margin:0 0 20px;"></div>
        <p style="font-family:${SERIF};font-size:24px;font-weight:400;font-style:italic;color:rgba(255,255,255,0.9);margin:0 0 10px;text-shadow:0 1px 6px rgba(0,0,0,0.7), 0 2px 12px rgba(0,0,0,0.4);">No Experience Required</p>
        <p style="font-family:${SERIF};font-size:24px;font-weight:400;font-style:italic;color:rgba(255,255,255,0.9);margin:0 0 10px;text-shadow:0 1px 6px rgba(0,0,0,0.7), 0 2px 12px rgba(0,0,0,0.4);">Editorial Shoots</p>
        <p style="font-family:${SERIF};font-size:24px;font-weight:400;font-style:italic;color:rgba(255,255,255,0.9);margin:0;text-shadow:0 1px 6px rgba(0,0,0,0.7), 0 2px 12px rgba(0,0,0,0.4);">Free Portfolio Photos</p>
      </div>

      <!-- Barcode-style element bottom right -->
      <div style="position:absolute;right:60px;bottom:${SAFE_BOTTOM + 40}px;text-align:right;">
        <p style="font-family:${SANS};font-size:14px;font-weight:400;letter-spacing:0.15em;text-transform:uppercase;color:rgba(255,255,255,0.6);margin:0 0 4px;text-shadow:0 1px 4px rgba(0,0,0,0.6);">aidantorrence.com</p>
        <p style="font-family:${SANS};font-size:14px;font-weight:400;letter-spacing:0.15em;text-transform:uppercase;color:rgba(255,255,255,0.6);margin:0;text-shadow:0 1px 4px rgba(0,0,0,0.6);">2025 Edition</p>
      </div>
    </div>
  `
}

// ─── SLIDE 2: EDITORIAL SPREAD — ANIMATED MP4 ──────────────────────────
function slideTwoAnimated(images) {
  const editorialImages = [
    { src: images.editA, label: 'Canal District' },
    { src: images.editB, label: 'Golden Hour' },
    { src: images.editC, label: 'Urban Edge' },
    { src: images.editD, label: 'Street Style' },
    { src: images.editE, label: 'Night Session' },
    { src: images.editF, label: 'Garden Light' },
  ]

  // Layout: magazine spread with photos appearing as if being laid out
  // Top row: 2 images, Bottom row: 2 images, + 2 accent images
  const layouts = [
    // Large left image
    { x: 60, y: 340, w: 480, h: 600, idx: 0 },
    // Large right image
    { x: 560, y: 340, w: 460, h: 600, idx: 1 },
    // Bottom left
    { x: 60, y: 960, w: 320, h: 420, idx: 2 },
    // Bottom center
    { x: 400, y: 960, w: 320, h: 420, idx: 3 },
    // Bottom right
    { x: 740, y: 960, w: 280, h: 420, idx: 4 },
    // Small accent bottom-left
    { x: 200, y: 1400, w: 680, h: 100, idx: 5 },
  ]

  let tilesHtml = ''
  for (let i = 0; i < 6; i++) {
    const l = layouts[i]
    const img = editorialImages[l.idx]
    const delay = 0.4 + i * 0.5 // stagger: 0.4s, 0.9s, 1.4s, 1.9s, 2.4s, 2.9s

    if (i < 5) {
      tilesHtml += `
        <div class="spread-tile tile-${i}" style="
          position:absolute;left:${l.x}px;top:${l.y}px;width:${l.w}px;height:${l.h}px;
          opacity:0;transform:rotate(${(i % 2 === 0 ? -2 : 2)}deg) scale(0.9);
          animation:spreadIn 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}s forwards;
          box-shadow:0 8px 30px rgba(0,0,0,0.15);
        ">
          <img src="${img.src}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center;"/>
        </div>`
    }
  }

  // Caption labels appear after images
  let captionsHtml = ''
  for (let i = 0; i < 5; i++) {
    const l = layouts[i]
    const img = editorialImages[l.idx]
    const delay = 0.4 + i * 0.5 + 0.5
    captionsHtml += `
      <div class="caption cap-${i}" style="
        position:absolute;left:${l.x}px;top:${l.y + l.h + 6}px;
        opacity:0;animation:fadeUp 0.4s ease-out ${delay}s forwards;
      ">
        <span style="font-family:${SANS};font-size:13px;font-weight:400;letter-spacing:0.15em;text-transform:uppercase;color:${NEAR_BLACK};opacity:0.5;">${img.label}</span>
      </div>`
  }

  return `<!DOCTYPE html>
  <html>
    <head>
      <style>
        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; background: ${CREAM}; }
        @keyframes spreadIn {
          0% { opacity: 0; transform: rotate(0deg) scale(0.85) translateY(30px); }
          100% { opacity: 1; transform: rotate(0deg) scale(1) translateY(0); }
        }
        @keyframes fadeUp {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes headerReveal {
          0% { opacity: 0; transform: translateY(-15px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes ruleGrow {
          0% { width: 0; }
          100% { width: 200px; }
        }
        .header { opacity: 0; animation: headerReveal 0.6s ease-out 0s forwards; }
      </style>
    </head>
    <body>
      <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${CREAM};">
        <!-- Header -->
        <div class="header" style="position:absolute;left:0;right:0;top:0;padding:50px 60px 0;">
          <!-- MANILA masthead -->
          <div style="text-align:center;">
            <p style="font-family:${SERIF};font-size:80px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${NEAR_BLACK};margin:0;">MANILA</p>
          </div>
          <div style="width:200px;height:1px;background:${RULE_COLOR};margin:16px auto 16px;animation:ruleGrow 0.8s ease-out 0.3s both;"></div>
          <div style="text-align:center;">
            <p style="font-family:${SERIF};font-size:32px;font-weight:400;font-style:italic;color:${NEAR_BLACK};margin:0;opacity:0.7;">The Editorial Spread</p>
          </div>
        </div>

        <!-- Photo tiles -->
        ${tilesHtml}
        ${captionsHtml}
      </div>
    </body>
  </html>`
}

// ─── SLIDE 3: "THE PROCESS" — MAGAZINE ARTICLE STYLE ────────────────────
function slideThree(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${CREAM};">
      <!-- MANILA header -->
      <div style="position:absolute;left:0;right:0;top:50px;text-align:center;">
        <p style="font-family:${SERIF};font-size:80px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${NEAR_BLACK};margin:0;">MANILA</p>
        <div style="width:200px;height:1px;background:${RULE_COLOR};margin:14px auto 0;"></div>
      </div>

      <!-- Article headline -->
      <div style="position:absolute;left:60px;right:60px;top:200px;">
        <p style="font-family:${SANS};font-size:15px;font-weight:500;letter-spacing:0.3em;text-transform:uppercase;color:${GOLD};margin:0 0 12px;">How It Works</p>
        <h2 style="font-family:${SERIF};font-size:58px;font-weight:700;font-style:italic;line-height:1.05;color:${NEAR_BLACK};margin:0;">The Process</h2>
        <div style="width:80px;height:2px;background:${GOLD};margin:20px 0 0;"></div>
      </div>

      <!-- Article body — 3 steps with drop caps -->
      <div style="position:absolute;left:60px;right:60px;top:420px;">
        <!-- Step 1 -->
        <div style="display:flex;gap:20px;margin-bottom:40px;">
          <div style="flex-shrink:0;width:64px;height:64px;display:flex;align-items:flex-start;justify-content:center;">
            <span style="font-family:${SERIF};font-size:72px;font-weight:700;color:${GOLD};line-height:0.85;">1</span>
          </div>
          <div style="flex:1;padding-top:4px;">
            <p style="font-family:${SERIF};font-size:28px;font-weight:700;color:${NEAR_BLACK};margin:0 0 8px;line-height:1.15;">Sign Up Below</p>
            <p style="font-family:${SERIF};font-size:20px;font-weight:400;color:${NEAR_BLACK};opacity:0.6;margin:0;line-height:1.5;">A 60-second form. I'll review your submission and message you back within a day.</p>
          </div>
        </div>
        <div style="width:100%;height:1px;background:${RULE_COLOR};margin:0 0 40px;"></div>

        <!-- Step 2 -->
        <div style="display:flex;gap:20px;margin-bottom:40px;">
          <div style="flex-shrink:0;width:64px;height:64px;display:flex;align-items:flex-start;justify-content:center;">
            <span style="font-family:${SERIF};font-size:72px;font-weight:700;color:${GOLD};line-height:0.85;">2</span>
          </div>
          <div style="flex:1;padding-top:4px;">
            <p style="font-family:${SERIF};font-size:28px;font-weight:700;color:${NEAR_BLACK};margin:0 0 8px;line-height:1.15;">We Plan the Shoot</p>
            <p style="font-family:${SERIF};font-size:20px;font-weight:400;color:${NEAR_BLACK};opacity:0.6;margin:0;line-height:1.5;">Together we choose the location, wardrobe direction, and visual mood. Every detail is considered.</p>
          </div>
        </div>
        <div style="width:100%;height:1px;background:${RULE_COLOR};margin:0 0 40px;"></div>

        <!-- Step 3 -->
        <div style="display:flex;gap:20px;margin-bottom:0;">
          <div style="flex-shrink:0;width:64px;height:64px;display:flex;align-items:flex-start;justify-content:center;">
            <span style="font-family:${SERIF};font-size:72px;font-weight:700;color:${GOLD};line-height:0.85;">3</span>
          </div>
          <div style="flex:1;padding-top:4px;">
            <p style="font-family:${SERIF};font-size:28px;font-weight:700;color:${NEAR_BLACK};margin:0 0 8px;line-height:1.15;">Show Up. I Direct Everything.</p>
            <p style="font-family:${SERIF};font-size:20px;font-weight:400;color:${NEAR_BLACK};opacity:0.6;margin:0;line-height:1.5;">No experience needed. I guide every pose, angle, and expression. You just bring yourself.</p>
          </div>
        </div>
      </div>

      <!-- Pull quote -->
      <div style="position:absolute;left:60px;right:60px;top:1000px;">
        <div style="width:100%;height:1px;background:${RULE_COLOR};margin:0 0 30px;"></div>
        <p style="font-family:${SERIF};font-size:30px;font-weight:400;font-style:italic;color:${NEAR_BLACK};margin:0;line-height:1.4;text-align:center;opacity:0.7;">"No agency. No portfolio.<br/>Just you and one afternoon."</p>
        <div style="width:100%;height:1px;background:${RULE_COLOR};margin:30px 0 0;"></div>
      </div>

      <!-- Small accent image bottom right -->
      <div style="position:absolute;right:60px;bottom:${SAFE_BOTTOM + 30}px;width:280px;height:340px;box-shadow:0 6px 24px rgba(0,0,0,0.1);">
        <img src="${images.process}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center;"/>
      </div>

      <!-- "Continued on next page" -->
      <div style="position:absolute;left:60px;bottom:${SAFE_BOTTOM + 30}px;">
        <p style="font-family:${SANS};font-size:14px;font-weight:400;letter-spacing:0.2em;text-transform:uppercase;color:${NEAR_BLACK};opacity:0.35;margin:0;">Continued</p>
      </div>
    </div>
  `
}

// ─── SLIDE 4: BACK COVER — CLEAN, MINIMAL CTA ──────────────────────────
function slideFour(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${NEAR_BLACK};">
      <!-- Full-bleed image -->
      <img src="${images.backCover}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 30%;"/>

      <!-- Heavy dark overlay -->
      <div style="position:absolute;inset:0;background:rgba(0,0,0,0.65);"></div>

      <!-- Thin top rule -->
      <div style="position:absolute;left:60px;right:60px;top:58px;height:1px;background:rgba(255,255,255,0.25);"></div>

      <!-- MANILA masthead -->
      <div style="position:absolute;left:0;right:0;top:80px;text-align:center;">
        <p style="font-family:${SERIF};font-size:100px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#fff;margin:0;text-shadow:0 2px 20px rgba(0,0,0,0.3);">MANILA</p>
      </div>

      <!-- Thin rule below masthead -->
      <div style="position:absolute;left:60px;right:60px;top:210px;height:1px;background:rgba(255,255,255,0.25);"></div>

      <!-- CTA content — centered -->
      <div style="position:absolute;left:60px;right:60px;top:280px;text-align:center;">
        <p style="font-family:${SANS};font-size:16px;font-weight:500;letter-spacing:0.3em;text-transform:uppercase;color:${GOLD};margin:0 0 24px;">Now Casting</p>
        <h2 style="font-family:${SERIF};font-size:64px;font-weight:700;font-style:italic;line-height:1.08;color:#fff;margin:0 0 28px;">Sign Up<br/>Below</h2>
        <div style="width:80px;height:2px;background:${GOLD};margin:0 auto 28px;"></div>
        <p style="font-family:${SERIF};font-size:24px;font-weight:400;font-style:italic;color:rgba(255,255,255,0.75);margin:0 0 10px;line-height:1.45;">60-second form.</p>
        <p style="font-family:${SERIF};font-size:24px;font-weight:400;font-style:italic;color:rgba(255,255,255,0.75);margin:0 0 48px;line-height:1.45;">I'll message you back within a day.</p>
      </div>

      <!-- Urgency badge -->
      <div style="position:absolute;left:50%;transform:translateX(-50%);top:660px;display:inline-flex;align-items:center;gap:10px;padding:14px 32px;border:1px solid ${GOLD};background:rgba(200,169,110,0.1);backdrop-filter:blur(10px);">
        <span style="width:8px;height:8px;border-radius:50%;background:${GOLD};"></span>
        <span style="font-family:${SANS};font-size:16px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:${GOLD};">Limited Spots This Month</span>
      </div>

      <!-- Bottom info -->
      <div style="position:absolute;left:60px;right:60px;bottom:${SAFE_BOTTOM + 20}px;display:flex;justify-content:space-between;align-items:center;">
        <span style="font-family:${SANS};font-size:14px;font-weight:400;letter-spacing:0.15em;text-transform:uppercase;color:rgba(255,255,255,0.35);">aidantorrence.com</span>
        <span style="font-family:${SANS};font-size:14px;font-weight:400;letter-spacing:0.15em;text-transform:uppercase;color:rgba(255,255,255,0.35);">Manila, Philippines</span>
      </div>

      <!-- Thin bottom rule -->
      <div style="position:absolute;left:60px;right:60px;bottom:${SAFE_BOTTOM + 10}px;height:1px;background:rgba(255,255,255,0.15);"></div>
    </div>
  `
}

async function render() {
  resetOutputDir()

  const all = getTopManilaImages()
  const selection = {
    cover: 'manila-gallery-canal-001.jpg',
    editA: 'manila-gallery-closeup-001.jpg',
    editB: 'manila-gallery-garden-002.jpg',
    editC: 'manila-gallery-graffiti-001.jpg',
    editD: 'manila-gallery-street-001.jpg',
    editE: 'manila-gallery-night-003.jpg',
    editF: 'manila-gallery-ivy-001.jpg',
    process: 'manila-gallery-dsc-0190.jpg',
    backCover: 'manila-gallery-urban-001.jpg'
  }

  writeSources({ all_considered: all, selected: selection })

  const images = Object.fromEntries(
    Object.entries(selection).map(([key, file]) => [key, readImage(file)])
  )

  // --- Render static slides (1, 3, 4) as PNGs ---
  const staticSlides = [
    ['01_magazine_cover.png', wrap(slideOne(images))],
    ['03_the_process.png', wrap(slideThree(images))],
    ['04_back_cover_cta.png', wrap(slideFour(images))]
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
  console.log('Recording animated editorial spread as MP4...')

  // 6 images * 500ms stagger + 700ms animation + 400ms initial delay = ~4.5s
  // + 1.5s hold = ~6s total
  const TOTAL_DURATION_MS = 6000

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

  // Convert WebM to MP4
  const videoFiles = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.webm'))
  if (videoFiles.length === 0) {
    console.error('No video file was generated!')
  } else {
    const srcVideo = path.join(OUT_DIR, videoFiles[0])
    const dstVideo = path.join(OUT_DIR, '02_editorial_spread.mp4')

    const { execSync } = await import('child_process')
    try {
      execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${dstVideo}"`, {
        stdio: 'pipe'
      })
      fs.unlinkSync(srcVideo)
      console.log('Rendered 02_editorial_spread.mp4')
    } catch (err) {
      console.warn('ffmpeg not available, keeping as webm and renaming to mp4...')
      fs.renameSync(srcVideo, dstVideo)
      console.log('Rendered 02_editorial_spread.mp4 (webm container)')
    }
  }

  await browser.close()
  console.log(`Done: 3 static PNGs + 1 animated MP4 written to ${OUT_DIR}`)
}

render().catch(error => {
  console.error(error)
  process.exit(1)
})
