import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v65')

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 410

// Fonts
const BOLD = "'Helvetica Neue', 'Avenir Next', Arial, sans-serif"
const BODY = "'Avenir Next', 'Helvetica Neue', Arial, sans-serif"
const CONDENSED = "'Arial Narrow', Futura, 'Helvetica Neue', sans-serif"

// Neon colors
const NEON_PINK = '#FF2D7B'
const NEON_CYAN = '#00F0FF'
const NEON_PURPLE = '#B44DFF'
const DARK_BG = '#0A0610'

const HANDLE = 'madebyaidan'

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

function writeSources(selected) {
  const payload = {
    createdAt: new Date().toISOString(),
    strategy: 'v65 -- Neon/club poster animated video (single continuous MP4) from v31 concept',
    safeBottomPixels: SAFE_BOTTOM,
    images: selected
  }
  fs.writeFileSync(path.join(OUT_DIR, 'sources.json'), JSON.stringify(payload, null, 2))
}

// Neon text glow helper
function neonGlow(color, intensity = 1) {
  const i = intensity
  return `0 0 ${7*i}px ${color}, 0 0 ${14*i}px ${color}, 0 0 ${28*i}px ${color}, 0 0 ${56*i}px ${color}`
}

// Neon box glow helper
function neonBoxGlow(color, intensity = 1) {
  const i = intensity
  return `0 0 ${5*i}px ${color}, 0 0 ${10*i}px ${color}, 0 0 ${20*i}px ${color}, inset 0 0 ${5*i}px ${color}`
}

// Image selection from v31
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
}

// ========== BUILD THE FULL ANIMATED HTML ==========
function buildAnimatedVideo(images) {
  // Timeline (seconds)
  // 0.0 - 1.0: MANILA neon sign flickers on
  // 1.0 - 2.5: MODELS WANTED slams in with neon flash, hero visible with Ken Burns
  // 2.5 - 3.5: Hold hero + text
  // 3.5 - 4.0: Transition to grid section
  // 4.0 - 4.5: "This is my work." header fades in
  // 4.5 - 8.0: Grid tiles pop in one by one (9 tiles * 0.38s stagger)
  // 8.0 - 9.5: Hold grid
  // 9.5 - 10.0: Transition to steps section
  // 10.0 - 10.5: "3 steps." header appears
  // 10.5 - 14.5: Steps slide in one by one
  // 14.5 - 16.0: Hold steps
  // 16.0 - 17.0: Fade to black

  const TOTAL_DURATION = 20 // seconds for the animated portion

  const gridImages = [
    images.gridA, images.gridB, images.gridC,
    images.gridD, images.gridE, images.gridF,
    images.gridG, images.gridH, images.gridI,
  ]

  // Grid layout constants
  const GRID_TOP = 260
  const GRID_PAD = 32
  const GRID_GAP = 10
  const COLS = 3
  const ROWS = 3
  const GRID_BOTTOM = HEIGHT - SAFE_BOTTOM - 20
  const CONTAINER_W = WIDTH - GRID_PAD * 2
  const AVAILABLE_H = GRID_BOTTOM - GRID_TOP
  const cellW = Math.floor((CONTAINER_W - (COLS - 1) * GRID_GAP) / COLS)
  const cellH = Math.floor((AVAILABLE_H - (ROWS - 1) * GRID_GAP) / ROWS)

  // Build grid tiles HTML
  let tilesHtml = ''
  let imgIdx = 0
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (imgIdx >= gridImages.length) break
      const x = GRID_PAD + c * (cellW + GRID_GAP)
      const y = GRID_TOP + r * (cellH + GRID_GAP)
      const delay = 4.5 + imgIdx * 0.38 // stagger from 4.5s
      tilesHtml += `
        <div class="grid-tile tile-${imgIdx}" style="
          position:absolute;left:${x}px;top:${y}px;width:${cellW}px;height:${cellH}px;
          border-radius:8px;overflow:hidden;
          opacity:0;transform:scale(0.85);
          animation:tileReveal 0.5s ease-out ${delay}s forwards;
          border:2px solid ${NEON_CYAN};
          box-shadow:${neonBoxGlow(NEON_CYAN, 0.5)};
          z-index:5;
        ">
          <img src="${gridImages[imgIdx]}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center;filter:saturate(1.1) contrast(1.05);"/>
          <div style="position:absolute;inset:0;background:linear-gradient(135deg, rgba(255,45,123,0.08) 0%, rgba(0,240,255,0.08) 100%);"></div>
        </div>`
      imgIdx++
    }
  }

  // Steps data
  const steps = [
    { num: '01', title: 'Sign up below', desc: '60-second form', color: NEON_PINK },
    { num: '02', title: 'We plan together', desc: 'Date, location, vibe', color: NEON_CYAN },
    { num: '03', title: 'Show up. I direct.', desc: 'No experience needed', color: NEON_PURPLE },
  ]

  let stepsHtml = ''
  steps.forEach((step, i) => {
    const delay = 11.0 + i * 1.2 // stagger from 11.0s
    stepsHtml += `
      <div class="step step-${i}" style="
        display:flex;gap:24px;align-items:center;margin-bottom:36px;
        opacity:0;transform:translateX(-60px);
        animation:stepSlideIn 0.6s ease-out ${delay}s forwards;
      ">
        <div style="flex-shrink:0;width:80px;height:80px;border-radius:50%;border:3px solid ${step.color};display:flex;align-items:center;justify-content:center;box-shadow:${neonBoxGlow(step.color, 0.6)};">
          <span style="font-family:${BOLD};font-size:34px;font-weight:800;color:${step.color};text-shadow:${neonGlow(step.color, 0.6)};">${step.num}</span>
        </div>
        <div style="flex:1;">
          <p style="font-family:${BOLD};font-size:46px;font-weight:700;color:#fff;margin:0 0 4px;line-height:1.1;text-shadow:0 0 10px rgba(255,255,255,0.2);">${step.title}</p>
          <p style="font-family:${BODY};font-size:32px;color:rgba(255,255,255,0.55);margin:0;line-height:1.3;">${step.desc}</p>
        </div>
      </div>
      ${i < 2 ? `<div class="step-line" style="width:100%;height:1px;background:linear-gradient(90deg, ${step.color}44, transparent 70%);margin-bottom:36px;opacity:0;animation:stepSlideIn 0.4s ease-out ${delay + 0.3}s forwards;transform:translateX(-40px);"></div>` : ''}
    `
  })

  return `<!DOCTYPE html>
  <html>
    <head>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { margin: 0; padding: 0; background: ${DARK_BG}; overflow: hidden;
          -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }

        /* === HERO SECTION (0s - 3.5s) === */

        /* Ken Burns zoom on hero image */
        @keyframes kenBurns {
          0% { transform: scale(1.0); }
          100% { transform: scale(1.15); }
        }

        /* MANILA neon flicker on */
        @keyframes manilaFlicker {
          0% { opacity: 0; }
          8% { opacity: 0.7; }
          12% { opacity: 0.1; }
          18% { opacity: 0.85; }
          22% { opacity: 0.2; }
          28% { opacity: 0; }
          35% { opacity: 0.9; }
          38% { opacity: 0.5; }
          42% { opacity: 0.95; }
          48% { opacity: 0.3; }
          55% { opacity: 1; }
          60% { opacity: 0.85; }
          65% { opacity: 1; }
          100% { opacity: 1; }
        }

        /* MODELS WANTED slam in */
        @keyframes slamIn {
          0% { opacity: 0; transform: scale(1.8) translateY(-20px); }
          50% { opacity: 1; transform: scale(1.0) translateY(0); }
          65% { transform: scale(1.04); }
          100% { opacity: 1; transform: scale(1); }
        }

        /* Neon flash on slam */
        @keyframes neonFlash {
          0% { opacity: 0; }
          10% { opacity: 0.8; }
          30% { opacity: 0.3; }
          100% { opacity: 0; }
        }

        /* Subtitle fade in */
        @keyframes subtitleIn {
          0% { opacity: 0; transform: translateY(12px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        /* === SECTION TRANSITIONS === */

        /* Hero section: visible 0-3.5s, then fades out */
        @keyframes heroSection {
          0% { opacity: 1; }
          17.5% { opacity: 1; }     /* 3.5s / 20s = 17.5% */
          20% { opacity: 0; }       /* fade out by 4.0s */
          100% { opacity: 0; }
        }

        /* Grid section: invisible until 3.5s, visible 3.5-9.5s, then fades out */
        @keyframes gridSection {
          0% { opacity: 0; }
          17.5% { opacity: 0; }    /* 3.5s */
          20% { opacity: 1; }      /* 4.0s */
          47.5% { opacity: 1; }    /* 9.5s */
          50% { opacity: 0; }      /* 10.0s */
          100% { opacity: 0; }
        }

        /* Steps section: invisible until 9.5s, visible 9.5-16s, then fades out */
        @keyframes stepsSection {
          0% { opacity: 0; }
          47.5% { opacity: 0; }    /* 9.5s */
          50% { opacity: 1; }      /* 10.0s */
          80% { opacity: 1; }      /* 16.0s */
          85% { opacity: 0; }      /* 17.0s */
          100% { opacity: 0; }
        }

        .hero-section {
          animation: heroSection ${TOTAL_DURATION}s linear forwards;
        }
        .grid-section {
          animation: gridSection ${TOTAL_DURATION}s linear forwards;
        }
        .steps-section {
          animation: stepsSection ${TOTAL_DURATION}s linear forwards;
        }

        /* === GRID ANIMATIONS === */
        @keyframes tileReveal {
          0% { opacity: 0; transform: scale(0.85); }
          50% { opacity: 1; transform: scale(1.03); box-shadow: ${neonBoxGlow(NEON_CYAN, 1.2)}; }
          100% { opacity: 1; transform: scale(1); box-shadow: ${neonBoxGlow(NEON_CYAN, 0.5)}; }
        }

        @keyframes headerFade {
          0% { opacity: 0; transform: translateY(-20px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes neonFlickerLoop {
          0%, 100% { opacity: 1; }
          5% { opacity: 0.85; }
          10% { opacity: 1; }
          15% { opacity: 0.9; }
          20% { opacity: 1; }
          50% { opacity: 1; }
          52% { opacity: 0.8; }
          54% { opacity: 1; }
        }

        @keyframes lineGrow {
          0% { width: 0; opacity: 0; }
          100% { width: 160px; opacity: 1; }
        }

        /* === STEPS ANIMATIONS === */
        @keyframes stepSlideIn {
          0% { opacity: 0; transform: translateX(-60px); }
          100% { opacity: 1; transform: translateX(0); }
        }

        @keyframes stepsHeaderIn {
          0% { opacity: 0; transform: translateY(-30px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        /* Number glow pulse */
        @keyframes glowPulse {
          0% { filter: brightness(1); }
          50% { filter: brightness(1.5); }
          100% { filter: brightness(1); }
        }

        /* === FINAL FADE TO BLACK === */
        @keyframes fadeToBlack {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }

      </style>
    </head>
    <body>
      <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${DARK_BG};">

        <!-- ==================== HERO SECTION (0 - 3.5s) ==================== -->
        <div class="hero-section" style="position:absolute;inset:0;z-index:10;">
          <!-- Hero image with Ken Burns zoom -->
          <div style="position:absolute;inset:0;overflow:hidden;">
            <img src="${images.hero}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 20%;animation:kenBurns ${TOTAL_DURATION}s ease-out forwards;"/>
          </div>
          <!-- Magenta/purple tint overlay -->
          <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(180,20,100,0.4) 0%, rgba(10,6,16,0.3) 40%, rgba(0,180,255,0.15) 100%);mix-blend-mode:multiply;"></div>
          <!-- Dark gradient from top for text readability -->
          <div style="position:absolute;left:0;right:0;top:0;height:950px;background:linear-gradient(180deg, rgba(10,6,16,0.94) 0%, rgba(10,6,16,0.75) 45%, rgba(10,6,16,0) 100%);"></div>
          <!-- Dark gradient from bottom for safe area -->
          <div style="position:absolute;left:0;right:0;bottom:0;height:${SAFE_BOTTOM + 120}px;background:linear-gradient(0deg, rgba(10,6,16,0.7) 0%, rgba(10,6,16,0) 100%);"></div>

          <!-- MANILA neon sign flickering on -->
          <div style="position:absolute;left:54px;top:120px;right:54px;">
            <p style="
              font-family:${BOLD};font-size:130px;font-weight:900;letter-spacing:0.18em;
              text-transform:uppercase;color:${NEON_PINK};margin:0 0 20px;
              text-shadow:${neonGlow(NEON_PINK, 1.5)};
              opacity:0;animation:manilaFlicker 1.0s ease-out 0.2s forwards;
            ">MANILA</p>

            <!-- Thin neon line -->
            <div style="height:3px;background:${NEON_CYAN};box-shadow:${neonGlow(NEON_CYAN, 0.8)};margin:0 0 30px;width:0;animation:lineGrow 0.5s ease-out 0.8s forwards;"></div>

            <!-- MODELS WANTED slams in -->
            <h1 style="
              font-family:${CONDENSED};font-size:110px;font-weight:900;line-height:0.92;
              color:#fff;margin:0 0 30px;letter-spacing:0.05em;text-transform:uppercase;
              text-shadow:0 0 30px rgba(255,255,255,0.4);
              opacity:0;animation:slamIn 0.5s cubic-bezier(0.16,1,0.3,1) 1.1s forwards;
            ">MODELS<br/>WANTED</h1>

            <!-- Neon flash overlay on slam -->
            <div style="
              position:absolute;left:-54px;right:-54px;top:-120px;bottom:-400px;
              background:radial-gradient(ellipse at center 40%, rgba(255,45,123,0.5), transparent 60%);
              opacity:0;animation:neonFlash 0.6s ease-out 1.1s forwards;
              pointer-events:none;z-index:20;
            "></div>

            <!-- Subtitle -->
            <p style="
              font-family:${BODY};font-size:40px;font-weight:500;line-height:1.35;
              color:rgba(255,255,255,0.85);margin:0;
              text-shadow:0 0 12px rgba(0,240,255,0.3);
              opacity:0;animation:subtitleIn 0.5s ease-out 1.8s forwards;
            ">Editorial portrait shoots.<br/>No experience needed.</p>
          </div>
        </div>

        <!-- ==================== GRID SECTION (3.5 - 9.5s) ==================== -->
        <div class="grid-section" style="position:absolute;inset:0;z-index:8;">
          <!-- Dark BG -->
          <div style="position:absolute;inset:0;background:${DARK_BG};"></div>

          <!-- Ambient neon glow spots -->
          <div style="position:absolute;top:100px;right:-80px;width:400px;height:400px;background:radial-gradient(circle, ${NEON_PINK}18, transparent 70%);"></div>
          <div style="position:absolute;bottom:500px;left:-80px;width:350px;height:350px;background:radial-gradient(circle, ${NEON_CYAN}12, transparent 70%);"></div>

          <!-- Header -->
          <div style="position:absolute;left:54px;top:65px;right:54px;opacity:0;animation:headerFade 0.5s ease-out 4.0s forwards;">
            <p style="
              font-family:${BOLD};font-size:80px;font-weight:900;letter-spacing:0.22em;
              text-transform:uppercase;color:${NEON_PINK};margin:0 0 10px;
              text-shadow:${neonGlow(NEON_PINK, 1)};
              animation:neonFlickerLoop 3s ease-in-out infinite;
            ">MANILA</p>
            <div style="height:2px;background:${NEON_CYAN};box-shadow:${neonGlow(NEON_CYAN, 0.5)};margin:0 0 16px;width:0;animation:lineGrow 0.5s ease-out 4.2s forwards;"></div>
            <h2 style="font-family:${BOLD};font-size:56px;font-weight:800;line-height:0.96;color:#fff;margin:0;letter-spacing:-0.01em;text-shadow:0 0 15px rgba(255,255,255,0.25);">This is my work.</h2>
          </div>

          <!-- Grid tiles -->
          ${tilesHtml}
        </div>

        <!-- ==================== STEPS SECTION (9.5 - 16s) ==================== -->
        <div class="steps-section" style="position:absolute;inset:0;z-index:6;">
          <!-- Dark BG -->
          <div style="position:absolute;inset:0;background:${DARK_BG};"></div>

          <!-- Ambient neon glow -->
          <div style="position:absolute;top:250px;right:-100px;width:400px;height:400px;background:radial-gradient(circle, ${NEON_PINK}15, transparent 70%);"></div>
          <div style="position:absolute;bottom:600px;left:-100px;width:350px;height:350px;background:radial-gradient(circle, ${NEON_CYAN}12, transparent 70%);"></div>
          <div style="position:absolute;top:600px;left:300px;width:300px;height:300px;background:radial-gradient(circle, ${NEON_PURPLE}10, transparent 70%);"></div>

          <!-- Header -->
          <div style="position:absolute;left:54px;top:80px;right:54px;opacity:0;animation:stepsHeaderIn 0.5s ease-out 10.0s forwards;">
            <p style="
              font-family:${BOLD};font-size:80px;font-weight:900;letter-spacing:0.22em;
              text-transform:uppercase;color:${NEON_PINK};margin:0 0 14px;
              text-shadow:${neonGlow(NEON_PINK, 1)};
              animation:neonFlickerLoop 3s ease-in-out infinite;
            ">MANILA</p>
            <div style="height:2px;background:${NEON_CYAN};box-shadow:${neonGlow(NEON_CYAN, 0.5)};margin:0 0 24px;width:0;animation:lineGrow 0.5s ease-out 10.2s forwards;"></div>
            <h2 style="font-family:${BOLD};font-size:82px;font-weight:800;line-height:0.95;color:#fff;margin:0 0 10px;letter-spacing:-0.01em;text-shadow:0 0 15px rgba(255,255,255,0.2);">3 steps.</h2>
            <p style="font-family:${BODY};font-size:36px;font-weight:500;color:rgba(255,255,255,0.5);margin:0;">That's it.</p>
          </div>

          <!-- Steps -->
          <div style="position:absolute;left:54px;right:54px;top:440px;">
            ${stepsHtml}
          </div>
        </div>

        <!-- ==================== FADE TO BLACK (starts at 17s) ==================== -->
        <div style="
          position:absolute;inset:0;background:${DARK_BG};z-index:30;
          pointer-events:none;opacity:0;
          animation:fadeToBlack 0.8s ease-out 17.0s forwards;
        "></div>

      </div>
    </body>
  </html>`
}

// ========== CTA STATIC SCREENSHOT ==========
function buildCTA(images) {
  return `<!DOCTYPE html><html><head>
    <style>* { box-sizing:border-box;margin:0;padding:0; } html,body { background:${DARK_BG}; -webkit-font-smoothing:antialiased; }</style>
  </head><body>
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${DARK_BG};">

      <!-- Ambient neon glows -->
      <div style="position:absolute;top:300px;left:50%;transform:translateX(-50%);width:700px;height:400px;background:radial-gradient(ellipse, ${NEON_PINK}20, transparent 70%);"></div>
      <div style="position:absolute;top:550px;left:150px;width:300px;height:300px;background:radial-gradient(circle, ${NEON_CYAN}12, transparent 70%);"></div>
      <div style="position:absolute;top:500px;right:100px;width:300px;height:300px;background:radial-gradient(circle, ${NEON_PURPLE}10, transparent 70%);"></div>

      <!-- Text content above SAFE_BOTTOM -->
      <div style="position:absolute;left:0;right:0;bottom:${SAFE_BOTTOM + 60}px;padding:0 70px;text-align:center;">

        <!-- Neon line accent -->
        <div style="width:80px;height:3px;background:${NEON_CYAN};box-shadow:${neonGlow(NEON_CYAN, 0.6)};margin:0 auto 40px;"></div>

        <!-- MANILA -->
        <p style="font-family:${BOLD};font-size:140px;font-weight:900;letter-spacing:0.16em;color:${NEON_PINK};margin:0 0 16px;text-transform:uppercase;text-shadow:${neonGlow(NEON_PINK, 1.5)};">MANILA</p>

        <!-- PHOTO SHOOT -->
        <p style="font-family:${BODY};font-size:44px;font-weight:300;color:rgba(255,255,255,0.9);margin:0;letter-spacing:0.3em;text-transform:uppercase;text-shadow:0 0 10px rgba(255,255,255,0.2);">PHOTO SHOOT</p>
      </div>
    </div>
  </body></html>`
}

async function render() {
  resetOutputDir()

  writeSources(selection)

  const images = Object.fromEntries(
    Object.entries(selection).map(([key, file]) => [key, readImage(file)])
  )

  const { execSync } = await import('child_process')
  const browser = await chromium.launch()

  // --- Step 1: Record the full animated video ---
  console.log('Recording animated neon video...')
  const TOTAL_DURATION_MS = 20000 // 20s animated section

  const videoCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: OUT_DIR,
      size: { width: WIDTH, height: HEIGHT }
    }
  })

  const videoPage = await videoCtx.newPage()
  await videoPage.setContent(buildAnimatedVideo(images), { waitUntil: 'load' })
  await videoPage.waitForTimeout(500) // let images load
  await videoPage.waitForTimeout(TOTAL_DURATION_MS + 1500) // extra buffer after fade to black
  await videoPage.close()
  await videoCtx.close()

  // --- Step 2: Render CTA as a high-quality screenshot ---
  console.log('Rendering CTA screenshot...')
  const ctaCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
  })
  const ctaPage = await ctaCtx.newPage()
  await ctaPage.setContent(buildCTA(images), { waitUntil: 'load' })
  await ctaPage.waitForTimeout(300)
  const ctaPath = path.join(OUT_DIR, 'cta_frame.png')
  await ctaPage.screenshot({ path: ctaPath })
  await ctaPage.close()
  await ctaCtx.close()
  await browser.close()

  // --- Step 3: Convert webm to mp4, then concat with CTA still frame ---
  const videoFiles = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.webm'))
  if (videoFiles.length === 0) {
    console.error('No video file was generated!')
    return
  }

  const srcVideo = path.join(OUT_DIR, videoFiles[0])
  const chatMp4 = path.join(OUT_DIR, 'main_part.mp4')
  const ctaMp4 = path.join(OUT_DIR, 'cta_part.mp4')
  const finalMp4 = path.join(OUT_DIR, '01_neon_nightlife_video.mp4')
  const concatFile = path.join(OUT_DIR, 'concat.txt')

  try {
    // Convert animated webm to mp4
    console.log('Converting webm to mp4...')
    execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${chatMp4}"`, { stdio: 'pipe' })

    // Create 5-second CTA video from static image
    console.log('Creating CTA video segment...')
    execSync(`ffmpeg -y -loop 1 -i "${ctaPath}" -c:v libx264 -t 5 -pix_fmt yuv420p -r 30 -vf "scale=${WIDTH}:${HEIGHT}" -an "${ctaMp4}"`, { stdio: 'pipe' })

    // Concat main + CTA
    console.log('Concatenating video segments...')
    fs.writeFileSync(concatFile, `file '${chatMp4}'\nfile '${ctaMp4}'\n`)
    execSync(`ffmpeg -y -f concat -safe 0 -i "${concatFile}" -c copy "${finalMp4}"`, { stdio: 'pipe' })

    // Cleanup temp files
    fs.unlinkSync(srcVideo)
    fs.unlinkSync(chatMp4)
    fs.unlinkSync(ctaMp4)
    fs.unlinkSync(concatFile)
    console.log('Rendered 01_neon_nightlife_video.mp4')
  } catch (err) {
    console.error('ffmpeg error:', err.message)
    // Fallback: just rename the webm
    if (fs.existsSync(srcVideo)) {
      fs.renameSync(srcVideo, finalMp4)
      console.log('Fallback: renamed webm to mp4')
    }
  }

  console.log(`Done: output written to ${OUT_DIR}`)
}

render().catch(error => {
  console.error(error)
  process.exit(1)
})
