import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v30')

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 620

// Fonts
const SERIF = "Georgia, 'Times New Roman', serif"
const SANS = "'Avenir Next', 'Helvetica Neue', Arial, sans-serif"
const HAND = "'Marker Felt', 'Comic Sans MS', 'Segoe Print', cursive"

// Colors — warm moodboard palette
const CREAM = '#F4EDE4'
const CORK = '#D4C4A8'
const WARM_BROWN = '#6B4E37'
const MANILA_COLOR = '#C4562A' // Terracotta for MANILA
const PIN_RED = '#C62828'
const TAPE_BEIGE = 'rgba(220, 200, 160, 0.75)'
const SHADOW = '0 4px 18px rgba(0,0,0,0.25)'

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
    strategy: 'v30 — Pinterest Moodboard aesthetic, warm curated look, animated pin drop on slide 2',
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

// Cork/linen texture background via CSS pattern
function corkBg() {
  return `background-color: ${CREAM};
    background-image:
      radial-gradient(ellipse at 20% 50%, rgba(180,155,120,0.12) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 20%, rgba(160,140,100,0.10) 0%, transparent 40%),
      radial-gradient(ellipse at 50% 80%, rgba(190,165,130,0.08) 0%, transparent 45%),
      repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(180,155,120,0.04) 3px, rgba(180,155,120,0.04) 4px),
      repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(180,155,120,0.04) 3px, rgba(180,155,120,0.04) 4px);`
}

// Masking tape strip element
function tapeStrip(x, y, rotation = 0, w = 80, h = 28) {
  return `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;
    background:${TAPE_BEIGE};border:1px solid rgba(200,180,140,0.4);
    transform:rotate(${rotation}deg);border-radius:2px;
    box-shadow:0 1px 3px rgba(0,0,0,0.1);z-index:10;"></div>`
}

// Push pin element
function pushPin(x, y, color = PIN_RED) {
  return `<div style="position:absolute;left:${x}px;top:${y}px;width:18px;height:18px;
    background:${color};border-radius:50%;
    box-shadow:0 2px 6px rgba(0,0,0,0.35), inset 0 -2px 3px rgba(0,0,0,0.2);
    z-index:10;"></div>`
}

// Photo card pinned to board
function pinnedPhoto(src, x, y, w, h, rotation = 0, pinType = 'tape') {
  const border = 8
  const pinEl = pinType === 'pin'
    ? pushPin(w / 2 - 9 + x, y - 6)
    : tapeStrip(x + w / 2 - 40, y - 10, rotation * 0.5)
  return `${pinEl}
    <div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;
      transform:rotate(${rotation}deg);transform-origin:center top;
      background:#fff;padding:${border}px;border-radius:3px;
      box-shadow:${SHADOW};z-index:5;">
      <img src="${src}" style="width:${w - border * 2}px;height:${h - border * 2}px;display:block;object-fit:cover;object-position:center 20%;border-radius:2px;"/>
    </div>`
}

// Text note card pinned to board
function noteCard(text, x, y, w, h, rotation = 0, bgColor = '#FFFEF5', fontFamily = HAND, fontSize = 28) {
  return `${tapeStrip(x + w / 2 - 40, y - 12, -rotation * 0.8)}
    <div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;
      transform:rotate(${rotation}deg);transform-origin:center top;
      background:${bgColor};padding:18px 22px;border-radius:3px;
      box-shadow:${SHADOW};z-index:5;">
      <p style="font-family:${fontFamily};font-size:${fontSize}px;color:${WARM_BROWN};margin:0;line-height:1.35;">${text}</p>
    </div>`
}

// MANILA title treatment for moodboard
function manilaTitle(x, y, size = 80) {
  return `<p style="position:absolute;left:${x}px;top:${y}px;
    font-family:${SANS};font-size:${size}px;font-weight:800;
    letter-spacing:0.12em;text-transform:uppercase;color:${MANILA_COLOR};
    margin:0;z-index:20;
    text-shadow:0 2px 8px rgba(196,86,42,0.2);">MANILA</p>`
}

// Color swatch element
function colorSwatch(x, y, color, w = 60, h = 60) {
  return `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;
    background:${color};border-radius:4px;box-shadow:${SHADOW};z-index:4;"></div>`
}

// ─────────── SLIDE 1: HOOK ───────────
function slideOne(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;${corkBg()}">
      <!-- MANILA huge -->
      ${manilaTitle(54, 68, 82)}

      <!-- Thin accent rule -->
      <div style="position:absolute;left:54px;top:162px;width:200px;height:3px;background:${MANILA_COLOR};border-radius:2px;z-index:20;"></div>

      <!-- Hero photo pinned center -->
      ${pinnedPhoto(images.hero, 100, 200, 880, 660, -1.2, 'tape')}

      <!-- "models wanted" handwritten note card -->
      ${noteCard('models<br/>wanted', 120, 890, 320, 180, 2.5, '#FFFEF5', HAND, 52)}

      <!-- Small accent photos -->
      ${pinnedPhoto(images.accentA, 520, 910, 240, 300, 1.8, 'pin')}
      ${pinnedPhoto(images.accentB, 780, 880, 220, 280, -2.2, 'pin')}

      <!-- Color swatches cluster -->
      ${colorSwatch(80, 1120, '#D4C4A8', 55, 55)}
      ${colorSwatch(145, 1130, '#C4562A', 55, 55)}
      ${colorSwatch(210, 1120, '#6B4E37', 55, 55)}

      <!-- Small text note -->
      ${noteCard('editorial portraits<br/>no experience needed', 340, 1160, 380, 110, -1, '#FFF8E8', HAND, 26)}

      <!-- Decorative tape strips -->
      ${tapeStrip(750, 1220, 15, 90, 24)}
      ${tapeStrip(60, 1300, -8, 70, 22)}
    </div>
  `
}

// ─────────── SLIDE 2: ANIMATED MOODBOARD BUILD ───────────
function slideTwoAnimated(images) {
  // Masonry positions for 8 images arranged as a moodboard
  const items = [
    { src: images.gridA, x: 40,  y: 200,  w: 310, h: 380, rot: -1.5 },
    { src: images.gridB, x: 380, y: 180,  w: 290, h: 360, rot: 2 },
    { src: images.gridC, x: 700, y: 210,  w: 320, h: 280, rot: -0.8 },
    { src: images.gridD, x: 60,  y: 610,  w: 340, h: 290, rot: 1.3 },
    { src: images.gridE, x: 430, y: 580,  w: 280, h: 350, rot: -2 },
    { src: images.gridF, x: 740, y: 530,  w: 290, h: 360, rot: 1.5 },
    { src: images.gridG, x: 100, y: 940,  w: 300, h: 320, rot: -1 },
    { src: images.gridH, x: 440, y: 960,  w: 320, h: 300, rot: 1.8 },
  ]

  let tilesHtml = ''
  items.forEach((item, i) => {
    const delay = 0.4 + i * 0.45 // stagger
    const border = 8
    tilesHtml += `
      <div class="pin-tile" style="position:absolute;left:${item.x}px;top:${item.y}px;
        width:${item.w}px;height:${item.h}px;
        transform:rotate(${item.rot}deg) translateY(40px);transform-origin:center top;
        opacity:0;z-index:${5 + i};
        animation:pinDrop 0.6s ease-out ${delay}s forwards;">
        <!-- tape -->
        <div style="position:absolute;left:${item.w / 2 - 40}px;top:-10px;width:80px;height:26px;
          background:${TAPE_BEIGE};border:1px solid rgba(200,180,140,0.4);
          transform:rotate(${item.rot * -0.3}deg);border-radius:2px;
          box-shadow:0 1px 3px rgba(0,0,0,0.1);z-index:10;"></div>
        <!-- photo card -->
        <div style="width:100%;height:100%;background:#fff;padding:${border}px;border-radius:3px;
          box-shadow:0 2px 8px rgba(0,0,0,0.15);">
          <img src="${item.src}" style="width:${item.w - border * 2}px;height:${item.h - border * 2}px;display:block;object-fit:cover;object-position:center 20%;border-radius:2px;"/>
        </div>
      </div>`
  })

  // Note card that appears after photos
  const noteDelay = 0.4 + items.length * 0.45 + 0.3
  tilesHtml += `
    <div class="pin-tile" style="position:absolute;left:540px;top:970px;width:240px;height:120px;
      opacity:0;z-index:20;
      animation:pinDrop 0.5s ease-out ${noteDelay}s forwards;transform:translateY(30px);">
      <div style="position:absolute;left:80px;top:-10px;width:80px;height:26px;
        background:${TAPE_BEIGE};border:1px solid rgba(200,180,140,0.4);border-radius:2px;
        box-shadow:0 1px 3px rgba(0,0,0,0.1);z-index:10;"></div>
      <div style="width:100%;height:100%;background:#FFFEF5;padding:16px 20px;border-radius:3px;
        box-shadow:${SHADOW};">
        <p style="font-family:${HAND};font-size:24px;color:${WARM_BROWN};margin:0;line-height:1.3;">this is<br/>my work.</p>
      </div>
    </div>`

  return `<!DOCTYPE html>
  <html>
    <head>
      <style>
        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; }
        @keyframes pinDrop {
          0% { opacity: 0; transform: translateY(40px) scale(0.92); }
          60% { opacity: 1; transform: translateY(-4px) scale(1.01); }
          100% { opacity: 1; transform: translateY(0px) scale(1); }
        }
        @keyframes shadowGrow {
          0% { box-shadow: 0 0px 0px rgba(0,0,0,0); }
          100% { box-shadow: 0 4px 18px rgba(0,0,0,0.25); }
        }
        @keyframes headerFade {
          0% { opacity: 0; transform: translateY(-15px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .header { opacity: 0; animation: headerFade 0.5s ease-out 0s forwards; }
      </style>
    </head>
    <body>
      <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;${corkBg()}">
        <!-- MANILA -->
        <div class="header" style="position:absolute;left:54px;top:68px;z-index:20;">
          <p style="font-family:${SANS};font-size:80px;font-weight:800;
            letter-spacing:0.12em;text-transform:uppercase;color:${MANILA_COLOR};
            margin:0;text-shadow:0 2px 8px rgba(196,86,42,0.2);">MANILA</p>
          <div style="width:160px;height:3px;background:${MANILA_COLOR};border-radius:2px;margin-top:8px;"></div>
        </div>

        ${tilesHtml}
      </div>
    </body>
  </html>`
}

// ─────────── SLIDE 3: PROCESS STEPS ───────────
function slideThree(images) {
  const stepData = [
    { num: '01', title: 'Sign up below', desc: 'Takes 60 seconds. I message you back.' },
    { num: '02', title: 'We pick a date', desc: 'Location, vibe, look -- planned together.' },
    { num: '03', title: 'Show up. I guide you.', desc: 'No experience needed. Just be yourself.' },
  ]

  let stepsHtml = ''
  let sy = 340
  stepData.forEach((step, i) => {
    const rot = i % 2 === 0 ? -1.2 : 1.5
    stepsHtml += `
      <!-- Step ${step.num} note card -->
      ${tapeStrip(100 + (i % 2) * 30, sy - 12, rot * 0.5)}
      <div style="position:absolute;left:60px;top:${sy}px;width:520px;height:170px;
        transform:rotate(${rot}deg);transform-origin:center top;
        background:#FFFEF5;padding:22px 28px;border-radius:3px;
        box-shadow:${SHADOW};z-index:5;">
        <p style="font-family:${SANS};font-size:20px;font-weight:700;
          letter-spacing:0.14em;text-transform:uppercase;color:${MANILA_COLOR};margin:0 0 8px;">${step.num}</p>
        <p style="font-family:${SANS};font-size:34px;font-weight:700;color:${WARM_BROWN};margin:0 0 8px;line-height:1.1;">${step.title}</p>
        <p style="font-family:${HAND};font-size:24px;color:rgba(107,78,55,0.7);margin:0;line-height:1.3;">${step.desc}</p>
      </div>`
    sy += 210
  })

  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;${corkBg()}">
      <!-- MANILA -->
      ${manilaTitle(54, 68, 80)}
      <div style="position:absolute;left:54px;top:158px;width:160px;height:3px;background:${MANILA_COLOR};border-radius:2px;z-index:20;"></div>

      <!-- Subheading note -->
      ${noteCard('how it works', 54, 190, 260, 70, -1, '#FFF8E8', HAND, 30)}

      ${stepsHtml}

      <!-- Small accent photos on right side -->
      ${pinnedPhoto(images.processA, 620, 360, 380, 300, 2, 'pin')}
      ${pinnedPhoto(images.processB, 660, 700, 340, 420, -1.5, 'pin')}

      <!-- Color swatches -->
      ${colorSwatch(80, 1150, MANILA_COLOR, 50, 50)}
      ${colorSwatch(140, 1160, CORK, 50, 50)}
      ${colorSwatch(200, 1150, WARM_BROWN, 50, 50)}

      <!-- Decorative tape -->
      ${tapeStrip(700, 1140, -12, 90, 24)}
    </div>
  `
}

// ─────────── SLIDE 4: CTA ───────────
function slideFour(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;${corkBg()}">
      <!-- MANILA -->
      ${manilaTitle(54, 68, 82)}
      <div style="position:absolute;left:54px;top:162px;width:200px;height:3px;background:${MANILA_COLOR};border-radius:2px;z-index:20;"></div>

      <!-- Large hero photo pinned prominently -->
      ${pinnedPhoto(images.cta, 80, 200, 920, 640, 0.5, 'tape')}

      <!-- Sign up card pinned below hero -->
      ${tapeStrip(340, 870, -1)}
      <div style="position:absolute;left:140px;top:880px;width:660px;height:320px;
        background:#FFFEF5;padding:36px 44px;border-radius:4px;
        box-shadow:${SHADOW};z-index:5;transform:rotate(-0.5deg);">
        <p style="font-family:${SANS};font-size:58px;font-weight:800;color:${WARM_BROWN};margin:0 0 16px;line-height:1.05;">Sign up below.</p>
        <p style="font-family:${HAND};font-size:30px;color:rgba(107,78,55,0.75);margin:0 0 24px;line-height:1.35;">60-second form. I'll message<br/>you back within a day.</p>
        <div style="display:inline-block;padding:12px 28px;background:${MANILA_COLOR};border-radius:6px;">
          <span style="font-family:${SANS};font-size:22px;font-weight:700;color:#fff;letter-spacing:0.08em;text-transform:uppercase;">Limited spots this month</span>
        </div>
      </div>

      <!-- Small accent photo and swatches -->
      ${pinnedPhoto(images.ctaAccent, 60, 1230, 200, 250, -2.5, 'pin')}
      ${colorSwatch(300, 1280, '#D4C4A8', 45, 45)}
      ${colorSwatch(355, 1270, MANILA_COLOR, 45, 45)}

      <!-- Decorative tape -->
      ${tapeStrip(800, 1250, 10, 80, 22)}
    </div>
  `
}

async function render() {
  resetOutputDir()

  const all = getTopManilaImages()
  const selection = {
    hero: 'manila-gallery-canal-001.jpg',
    accentA: 'manila-gallery-closeup-001.jpg',
    accentB: 'manila-gallery-garden-002.jpg',
    gridA: 'manila-gallery-dsc-0911.jpg',
    gridB: 'manila-gallery-night-003.jpg',
    gridC: 'manila-gallery-garden-001.jpg',
    gridD: 'manila-gallery-street-001.jpg',
    gridE: 'manila-gallery-urban-001.jpg',
    gridF: 'manila-gallery-ivy-001.jpg',
    gridG: 'manila-gallery-shadow-001.jpg',
    gridH: 'manila-gallery-tropical-001.jpg',
    processA: 'manila-gallery-dsc-0190.jpg',
    processB: 'manila-gallery-canal-002.jpg',
    cta: 'manila-gallery-statue-001.jpg',
    ctaAccent: 'manila-gallery-dsc-0130.jpg',
  }

  writeSources({ all_considered: all, selected: selection })

  const images = Object.fromEntries(
    Object.entries(selection).map(([key, file]) => [key, readImage(file)])
  )

  // --- Render static slides (1, 3, 4) as PNGs ---
  const staticSlides = [
    ['01_moodboard_hook.png', wrap(slideOne(images))],
    ['03_moodboard_process.png', wrap(slideThree(images))],
    ['04_moodboard_cta.png', wrap(slideFour(images))],
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
  console.log('Recording animated moodboard build as MP4...')

  // 8 images * 450ms stagger + 400ms initial delay + 600ms anim + note card + hold
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
    const dstVideo = path.join(OUT_DIR, '02_moodboard_build.mp4')

    const { execSync } = await import('child_process')
    try {
      execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${dstVideo}"`, {
        stdio: 'pipe'
      })
      fs.unlinkSync(srcVideo)
      console.log('Rendered 02_moodboard_build.mp4')
    } catch (err) {
      console.warn('ffmpeg not available, keeping as webm and renaming to mp4...')
      fs.renameSync(srcVideo, dstVideo)
      console.log('Rendered 02_moodboard_build.mp4 (webm container)')
    }
  }

  await browser.close()
  console.log(`Done: 3 static PNGs + 1 animated MP4 written to ${OUT_DIR}`)
}

render().catch(error => {
  console.error(error)
  process.exit(1)
})
