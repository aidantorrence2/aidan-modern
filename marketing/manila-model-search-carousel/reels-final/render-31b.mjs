import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, "output-31b")

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 430
const SAFE_TOP = 213
const SAFE_LEFT = 66
const SAFE_RIGHT = 1027

const TOTAL_DURATION_MS = 24000

const MONO = "'SF Mono', 'Menlo', 'Courier New', monospace"

const PROOF_PHOTOS = [
  'manila-gallery-dsc-0190.jpg',
  'manila-gallery-night-001.jpg',
  'manila-gallery-garden-001.jpg',
  'manila-gallery-urban-001.jpg',
  'manila-gallery-canal-001.jpg',
  'manila-gallery-ivy-001.jpg',
  'manila-gallery-closeup-001.jpg',
  'manila-gallery-dsc-0911.jpg',
]

const TETRIS_COLORS = ['#00f0f0', '#f0f000', '#a000f0', '#00f000', '#f00000', '#0000f0', '#f0a000']

function resetOutputDir() {
  fs.rmSync(OUT_DIR, { recursive: true, force: true })
  fs.mkdirSync(OUT_DIR, { recursive: true })
}

function readImage(name) {
  const buf = fs.readFileSync(path.join(IMAGE_DIR, name))
  return `data:image/jpeg;base64,${buf.toString('base64')}`
}

function writeSources(payload) {
  fs.writeFileSync(path.join(OUT_DIR, 'sources.json'), JSON.stringify(payload, null, 2))
}

/* Generate CSS for N falling block elements using only @keyframes */
function generateFallingBlocksCSS() {
  const NUM_BLOCKS = 40
  let css = ''
  let html = ''
  for (let i = 0; i < NUM_BLOCKS; i++) {
    const col = Math.floor(Math.random() * (WIDTH / 30)) * 30
    const color = TETRIS_COLORS[i % TETRIS_COLORS.length]
    const delay = (Math.random() * 22).toFixed(2)
    const duration = (3 + Math.random() * 4).toFixed(2)
    const alpha = (0.12 + Math.random() * 0.18).toFixed(2)

    css += `
      @keyframes fallBlock${i} {
        0% { transform: translateY(-60px); opacity: 0; }
        5% { opacity: ${alpha}; }
        95% { opacity: ${alpha}; }
        100% { transform: translateY(${HEIGHT + 60}px); opacity: 0; }
      }
      .fb-${i} {
        position: absolute;
        left: ${col}px;
        top: 0;
        width: 28px;
        height: 28px;
        background: ${color};
        border: 1px solid rgba(255,255,255,0.15);
        opacity: 0;
        z-index: 1;
        pointer-events: none;
        animation: fallBlock${i} ${duration}s linear ${delay}s 1 forwards;
      }
    `
    html += `<div class="fb-${i}"></div>\n`
  }
  return { css, html }
}

/* Generate CSS for static bottom blocks (atmosphere) */
function generateBottomBlocksHTML() {
  let html = ''
  const bottomRows = 4
  for (let row = 0; row < bottomRows; row++) {
    for (let col = 0; col < Math.floor(WIDTH / 30); col++) {
      if (Math.random() < 0.3 + row * 0.15) {
        const color = TETRIS_COLORS[Math.floor(Math.random() * TETRIS_COLORS.length)]
        const bx = col * 30
        const by = HEIGHT - (row + 1) * 30
        html += `<div style="position:absolute;left:${bx}px;top:${by}px;width:28px;height:28px;background:${color};opacity:0.12;border:1px solid ${color};z-index:0;pointer-events:none;"></div>\n`
      }
    }
  }
  return html
}

function buildHTML(imageDataMap) {
  const fallingBlocks = generateFallingBlocksCSS()
  const bottomBlocks = generateBottomBlocksHTML()
  const CONTENT_W = SAFE_RIGHT - SAFE_LEFT

  /* Photo slideshow: each photo visible for ~1.1s, 8 photos = ~8.8s, from t=4.5s to t=13.3s */
  let photoCSS = ''
  let photoHTML = ''
  PROOF_PHOTOS.forEach((p, i) => {
    const showStart = 4.5 + i * 1.1
    const showEnd = showStart + 1.0
    // Percentage keyframes within a long animation spanning 0-24s
    const pctStart = ((showStart / 24) * 100).toFixed(2)
    const pctIn = (((showStart + 0.25) / 24) * 100).toFixed(2)
    const pctOut = (((showEnd - 0.15) / 24) * 100).toFixed(2)
    const pctEnd = ((showEnd / 24) * 100).toFixed(2)

    photoCSS += `
      @keyframes showPhoto${i} {
        0%, ${pctStart}% { opacity: 0; transform: scale(0.88); }
        ${pctIn}% { opacity: 1; transform: scale(1); }
        ${pctOut}% { opacity: 1; transform: scale(1); }
        ${pctEnd}%, 100% { opacity: 0; transform: scale(0.88); }
      }
      .photo-${i} {
        position: absolute;
        inset: 0;
        opacity: 0;
        animation: showPhoto${i} 24s linear 0s 1 forwards;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
      }
    `
    const frameColor = TETRIS_COLORS[i % TETRIS_COLORS.length]
    // Build block border row (top & bottom)
    const blockCount = Math.floor(480 / 14)
    let topRow = ''
    let botRow = ''
    for (let b = 0; b < blockCount; b++) {
      topRow += `<div style="width:14px;height:14px;background:${TETRIS_COLORS[(i + b) % TETRIS_COLORS.length]};border:1px solid rgba(255,255,255,0.2);flex-shrink:0;"></div>`
      botRow += `<div style="width:14px;height:14px;background:${TETRIS_COLORS[(i + b + 2) % TETRIS_COLORS.length]};border:1px solid rgba(255,255,255,0.2);flex-shrink:0;"></div>`
    }

    photoHTML += `
      <div class="photo-${i}">
        <div style="display:flex;gap:0;margin-bottom:4px;overflow:hidden;max-width:510px;">${topRow}</div>
        <div style="width:480px;height:600px;overflow:hidden;border-left:14px solid ${frameColor};border-right:14px solid ${frameColor};">
          <img src="${imageDataMap[p]}" style="width:100%;height:100%;object-fit:cover;display:block;" />
        </div>
        <div style="display:flex;gap:0;margin-top:4px;overflow:hidden;max-width:510px;">${botRow}</div>
        <div style="margin-top:14px;font-family:${MONO};font-size:22px;color:${frameColor};text-shadow:0 0 8px ${frameColor}40;letter-spacing:2px;">PHOTO ${i + 1} / 8</div>
      </div>
    `
  })

  /* Scene transitions via CSS keyframes on wrapper divs */
  // Scene 1: MODELS WANTED (0s - 4.2s)
  // Scene 2: Photo slideshow (4.2s - 13.8s)
  // Scene 3: Steps (13.8s - 18.5s)
  // Scene 4: CTA (18.5s - 24s)

  return `<!DOCTYPE html>
<html>
<head>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { margin: 0; padding: 0; background: #0a0a0a; font-family: ${MONO}; overflow: hidden; }

  /* === CORE KEYFRAMES === */
  @keyframes fallDown {
    0% { transform: translateY(-80px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }

  @keyframes fadeIn {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }

  @keyframes fadeOut {
    0% { opacity: 1; }
    100% { opacity: 0; }
  }

  @keyframes lineClearFlash {
    0% { background: rgba(255,255,255,0.85); }
    100% { background: transparent; }
  }

  @keyframes ctaGlow {
    0%, 100% { box-shadow: 0 0 20px rgba(0,240,240,0.3); }
    50% { box-shadow: 0 0 45px rgba(0,240,240,0.7); }
  }

  @keyframes pulseText {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }

  @keyframes slideUp {
    0% { transform: translateY(40px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }

  @keyframes gridPulse {
    0%, 100% { opacity: 0.04; }
    50% { opacity: 0.08; }
  }

  /* === SCENE VISIBILITY (timed via animation-delay) === */

  /* Scene 1: visible 0s - 4.2s */
  @keyframes scene1Life {
    0% { opacity: 1; }
    95% { opacity: 1; }
    100% { opacity: 0; display: none; }
  }
  #scene1 {
    animation: fadeIn 0.3s ease-out 0s forwards, scene1Life 4.2s linear 0s forwards;
  }

  /* Scene 2: visible 4.2s - 13.8s */
  @keyframes scene2Life {
    0% { opacity: 0; }
    2% { opacity: 1; }
    97% { opacity: 1; }
    100% { opacity: 0; }
  }
  #scene2 {
    opacity: 0;
    animation: scene2Life 9.6s linear 4.2s forwards;
  }

  /* Scene 3: visible 13.8s - 18.5s */
  @keyframes scene3Life {
    0% { opacity: 0; }
    4% { opacity: 1; }
    96% { opacity: 1; }
    100% { opacity: 0; }
  }
  #scene3 {
    opacity: 0;
    animation: scene3Life 4.7s linear 13.8s forwards;
  }

  /* Scene 4: visible 18.5s - 24s */
  @keyframes scene4Life {
    0% { opacity: 0; }
    5% { opacity: 1; }
    100% { opacity: 1; }
  }
  #scene4 {
    opacity: 0;
    animation: scene4Life 5.5s linear 18.5s forwards;
  }

  /* === FALLING BLOCKS (CSS only) === */
  ${fallingBlocks.css}

  /* === PHOTO KEYFRAMES === */
  ${photoCSS}

  /* === LETTER FALL ANIMATIONS === */
  ${
    'MODELS'.split('').map((_, i) => `
      .letter-m-${i} {
        opacity: 0;
        animation: fallDown 0.35s ease-out ${0.2 + 0.15 * i}s forwards;
      }
    `).join('')
  }
  ${
    'WANTED'.split('').map((_, i) => `
      .letter-w-${i} {
        opacity: 0;
        animation: fallDown 0.35s ease-out ${1.2 + 0.15 * i}s forwards;
      }
    `).join('')
  }

  .subtitle-nxp {
    opacity: 0;
    animation: fadeIn 0.5s ease-out 2.4s forwards;
  }

  /* === STEP ANIMATIONS === */
  .step-row-0 { opacity: 0; animation: slideUp 0.4s ease-out 14.2s forwards; }
  .step-flash-0 { animation: lineClearFlash 0.35s ease-out 14.2s forwards; }
  .step-row-1 { opacity: 0; animation: slideUp 0.4s ease-out 15.4s forwards; }
  .step-flash-1 { animation: lineClearFlash 0.35s ease-out 15.4s forwards; }
  .step-row-2 { opacity: 0; animation: slideUp 0.4s ease-out 16.6s forwards; }
  .step-flash-2 { animation: lineClearFlash 0.35s ease-out 16.6s forwards; }

  /* === CTA ANIMATIONS === */
  .cta-handle { opacity: 0; animation: fadeIn 0.6s ease-out 19.0s forwards; }
  .cta-sub { opacity: 0; animation: fadeIn 0.5s ease-out 19.4s forwards; }
  .cta-btn { opacity: 0; animation: fadeIn 0.5s ease-out 19.8s forwards, ctaGlow 1.5s ease-in-out 20.3s infinite; }
  .cta-limited { opacity: 0; animation: fadeIn 0.5s ease-out 20.5s forwards, pulseText 2s ease-in-out 21s infinite; }

  /* CTA side block stacks */
  ${
    Array.from({length: 18}, (_, i) => `
      .cta-lb-${i} { opacity: 0; animation: fallDown 0.25s ease-out ${18.8 + 0.08 * i}s forwards; }
      .cta-rb-${i} { opacity: 0; animation: fallDown 0.25s ease-out ${18.85 + 0.08 * i}s forwards; }
    `).join('')
  }
</style>
</head>
<body>
  <div id="root" style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#0a0a0a;">

    <!-- Grid background (static, pure CSS) -->
    <div style="position:absolute;inset:0;z-index:0;pointer-events:none;
      background-image:
        linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
      background-size: 30px 30px;
      animation: gridPulse 4s ease-in-out infinite;
    "></div>

    <!-- Static bottom atmosphere blocks -->
    ${bottomBlocks}

    <!-- CSS-only falling blocks -->
    ${fallingBlocks.html}

    <!-- CRT scanlines (pure CSS) -->
    <div style="position:absolute;inset:0;z-index:100;pointer-events:none;background:repeating-linear-gradient(0deg,rgba(0,0,0,0.13) 0px,rgba(0,0,0,0.13) 1px,transparent 1px,transparent 3px);"></div>
    <div style="position:absolute;inset:0;z-index:99;pointer-events:none;background:radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.5) 100%);"></div>

    <!-- Persistent header — always visible -->
    <div style="position:absolute;top:${SAFE_TOP}px;left:${SAFE_LEFT}px;right:${WIDTH - SAFE_RIGHT}px;z-index:50;pointer-events:none;padding:12px 0;border-bottom:2px solid #222;opacity:0;animation:fadeIn 0.6s ease-out 0.1s forwards;">
      <div style="font-family:${MONO};font-size:26px;font-weight:900;color:#00f0f0;letter-spacing:3px;text-transform:uppercase;text-shadow:0 0 10px rgba(0,240,240,0.5),2px 2px 0 #0000f0;">MANILA FREE PHOTO SHOOT</div>
    </div>

    <!-- ========== SCENE 1: MODELS WANTED (0s - 4.2s) ========== -->
    <div id="scene1" style="position:absolute;top:${SAFE_TOP + 60}px;left:${SAFE_LEFT}px;width:${CONTENT_W}px;bottom:${SAFE_BOTTOM + 20}px;z-index:10;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;">

      <!-- MODELS row -->
      <div style="display:flex;gap:6px;">
        ${'MODELS'.split('').map((ch, i) => `<div class="letter-m-${i}" style="width:72px;height:84px;display:flex;align-items:center;justify-content:center;font-family:${MONO};font-size:52px;font-weight:900;color:#fff;background:${TETRIS_COLORS[i % TETRIS_COLORS.length]};border:3px solid rgba(255,255,255,0.3);text-shadow:2px 2px 0 rgba(0,0,0,0.5);">${ch}</div>`).join('\n        ')}
      </div>

      <!-- WANTED row -->
      <div style="display:flex;gap:6px;">
        ${'WANTED'.split('').map((ch, i) => `<div class="letter-w-${i}" style="width:72px;height:84px;display:flex;align-items:center;justify-content:center;font-family:${MONO};font-size:52px;font-weight:900;color:#fff;background:${TETRIS_COLORS[(i + 3) % TETRIS_COLORS.length]};border:3px solid rgba(255,255,255,0.3);text-shadow:2px 2px 0 rgba(0,0,0,0.5);">${ch}</div>`).join('\n        ')}
      </div>

      <!-- Subtitle -->
      <div class="subtitle-nxp" style="font-family:${MONO};font-size:30px;color:#f0f000;letter-spacing:2px;text-transform:uppercase;text-shadow:0 0 10px rgba(240,240,0,0.4);margin-top:16px;">No Experience Needed</div>

      <!-- Score-style text -->
      <div class="subtitle-nxp" style="font-family:${MONO};font-size:20px;color:rgba(255,255,255,0.4);letter-spacing:4px;margin-top:8px;">SCORE: FREE</div>
    </div>

    <!-- ========== SCENE 2: PHOTO SLIDESHOW (4.2s - 13.8s) ========== -->
    <div id="scene2" style="position:absolute;top:${SAFE_TOP + 60}px;left:${SAFE_LEFT}px;width:${CONTENT_W}px;bottom:${SAFE_BOTTOM + 20}px;z-index:10;">
      <!-- Label -->
      <div style="position:absolute;top:8px;left:0;right:0;text-align:center;font-family:${MONO};font-size:20px;color:rgba(255,255,255,0.4);letter-spacing:4px;z-index:2;">PORTFOLIO</div>
      <!-- Photos container -->
      <div style="position:absolute;top:50px;left:0;right:0;bottom:0;">
        ${photoHTML}
      </div>
    </div>

    <!-- ========== SCENE 3: STEPS (13.8s - 18.5s) ========== -->
    <div id="scene3" style="position:absolute;top:${SAFE_TOP + 60}px;left:${SAFE_LEFT}px;width:${CONTENT_W}px;bottom:${SAFE_BOTTOM + 20}px;z-index:10;display:flex;flex-direction:column;justify-content:center;gap:40px;padding:0 10px;">

      <!-- HOW IT WORKS header -->
      <div style="text-align:center;margin-bottom:10px;opacity:0;animation:fadeIn 0.4s ease-out 14.0s forwards;">
        <div style="font-family:${MONO};font-size:22px;color:rgba(255,255,255,0.35);letter-spacing:5px;">HOW IT WORKS</div>
      </div>

      <!-- Step 1 -->
      <div class="step-row-0" style="position:relative;">
        <div class="step-flash-0" style="position:absolute;inset:0;pointer-events:none;"></div>
        <div style="display:flex;align-items:center;gap:20px;">
          <div style="width:70px;height:70px;background:#00f0f0;display:flex;align-items:center;justify-content:center;font-family:${MONO};font-size:40px;font-weight:900;color:#000;border:3px solid rgba(255,255,255,0.3);flex-shrink:0;">1</div>
          <div>
            <div style="font-family:${MONO};font-size:28px;font-weight:700;color:#fff;">DM me on Instagram</div>
            <div style="font-family:${MONO};font-size:20px;color:rgba(255,255,255,0.5);margin-top:4px;">Just say hey - I'll reply</div>
          </div>
        </div>
        <div style="margin-top:8px;height:5px;display:flex;">
          ${Array.from({length: 60}, (_, b) => `<div style="flex:1;height:5px;background:#00f0f0;opacity:${Math.random() > 0.4 ? '0.6' : '0.15'};"></div>`).join('')}
        </div>
      </div>

      <!-- Step 2 -->
      <div class="step-row-1" style="position:relative;">
        <div class="step-flash-1" style="position:absolute;inset:0;pointer-events:none;"></div>
        <div style="display:flex;align-items:center;gap:20px;">
          <div style="width:70px;height:70px;background:#f0f000;display:flex;align-items:center;justify-content:center;font-family:${MONO};font-size:40px;font-weight:900;color:#000;border:3px solid rgba(255,255,255,0.3);flex-shrink:0;">2</div>
          <div>
            <div style="font-family:${MONO};font-size:28px;font-weight:700;color:#fff;">We pick a date & spot</div>
            <div style="font-family:${MONO};font-size:20px;color:rgba(255,255,255,0.5);margin-top:4px;">Planned together with you</div>
          </div>
        </div>
        <div style="margin-top:8px;height:5px;display:flex;">
          ${Array.from({length: 60}, (_, b) => `<div style="flex:1;height:5px;background:#f0f000;opacity:${Math.random() > 0.4 ? '0.6' : '0.15'};"></div>`).join('')}
        </div>
      </div>

      <!-- Step 3 -->
      <div class="step-row-2" style="position:relative;">
        <div class="step-flash-2" style="position:absolute;inset:0;pointer-events:none;"></div>
        <div style="display:flex;align-items:center;gap:20px;">
          <div style="width:70px;height:70px;background:#00f000;display:flex;align-items:center;justify-content:center;font-family:${MONO};font-size:40px;font-weight:900;color:#000;border:3px solid rgba(255,255,255,0.3);flex-shrink:0;">3</div>
          <div>
            <div style="font-family:${MONO};font-size:28px;font-weight:700;color:#fff;">Show up - I guide you</div>
            <div style="font-family:${MONO};font-size:20px;color:rgba(255,255,255,0.5);margin-top:4px;">No experience needed</div>
          </div>
        </div>
        <div style="margin-top:8px;height:5px;display:flex;">
          ${Array.from({length: 60}, (_, b) => `<div style="flex:1;height:5px;background:#00f000;opacity:${Math.random() > 0.4 ? '0.6' : '0.15'};"></div>`).join('')}
        </div>
      </div>
    </div>

    <!-- ========== SCENE 4: CTA (18.5s - 24s) ========== -->
    <div id="scene4" style="position:absolute;top:${SAFE_TOP + 60}px;left:${SAFE_LEFT}px;width:${CONTENT_W}px;bottom:${SAFE_BOTTOM + 20}px;z-index:10;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;position:relative;">

      <!-- Side block stacks (left) -->
      <div style="position:absolute;left:0;bottom:0;width:50px;display:flex;flex-direction:column-reverse;">
        ${Array.from({length: 18}, (_, i) => `<div class="cta-lb-${i}" style="width:50px;height:30px;background:${TETRIS_COLORS[i % TETRIS_COLORS.length]};border:1px solid rgba(255,255,255,0.15);"></div>`).join('\n        ')}
      </div>

      <!-- Side block stacks (right) -->
      <div style="position:absolute;right:0;bottom:0;width:50px;display:flex;flex-direction:column-reverse;">
        ${Array.from({length: 18}, (_, i) => `<div class="cta-rb-${i}" style="width:50px;height:30px;background:${TETRIS_COLORS[(i + 3) % TETRIS_COLORS.length]};border:1px solid rgba(255,255,255,0.15);"></div>`).join('\n        ')}
      </div>

      <!-- @madebyaidan -->
      <div class="cta-handle" style="font-family:${MONO};font-size:52px;font-weight:900;color:#fff;text-align:center;text-shadow:0 0 20px rgba(0,240,240,0.4);">@madebyaidan</div>

      <!-- on Instagram -->
      <div class="cta-sub" style="font-family:${MONO};font-size:26px;color:rgba(255,255,255,0.45);text-align:center;">on Instagram</div>

      <!-- DM button -->
      <div class="cta-btn" style="margin-top:16px;padding:22px 64px;background:#00f0f0;border:4px solid rgba(255,255,255,0.3);font-family:${MONO};font-size:38px;font-weight:900;color:#000;text-align:center;text-transform:uppercase;letter-spacing:3px;">SEND ME A DM</div>

      <!-- Limited spots -->
      <div class="cta-limited" style="margin-top:24px;font-family:${MONO};font-size:24px;color:#f0f000;text-align:center;letter-spacing:2px;text-shadow:0 0 8px rgba(240,240,0,0.3);">LIMITED SPOTS THIS MONTH</div>
    </div>

  </div>

  <!-- NO requestAnimationFrame, NO canvas, NO game loops — all animation is CSS @keyframes -->
  <script>
    // Nothing needed — all animations are pure CSS keyframes triggered by animation-delay.
    // This script block is intentionally empty to confirm: zero JS animation loops.
  </script>
</body>
</html>`
}

async function render() {
  resetOutputDir()

  const imageDataMap = {}
  for (const photo of PROOF_PHOTOS) {
    imageDataMap[photo] = readImage(photo)
  }

  writeSources({
    createdAt: new Date().toISOString(),
    strategy: 'v31b — Tetris themed reel ad rebuilt with CSS-only keyframe animations (no canvas/rAF)',
    safeBottomPixels: SAFE_BOTTOM,
    photos: PROOF_PHOTOS,
  })

  const browser = await chromium.launch()
  console.log('Recording Tetris themed reel (CSS-only)...')

  const videoCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    recordVideo: { dir: OUT_DIR, size: { width: WIDTH, height: HEIGHT } }
  })

  const videoPage = await videoCtx.newPage()
  await videoPage.evaluate(() => {
    document.documentElement.style.background = '#0a0a0a'
    document.body.style.background = '#0a0a0a'
  })

  const html = buildHTML(imageDataMap)
  await videoPage.setContent(html, { waitUntil: 'load' })
  await videoPage.waitForTimeout(500)
  await videoPage.waitForTimeout(TOTAL_DURATION_MS)

  await videoPage.close()
  await videoCtx.close()
  await browser.close()

  const videoFiles = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.webm'))
  if (videoFiles.length === 0) {
    console.error('No video file was generated!')
    return
  }

  const srcVideo = path.join(OUT_DIR, videoFiles[0])
  const dstVideo = path.join(OUT_DIR, 'manila-tetris-v31b.mp4')

  const { execSync } = await import('child_process')
  try {
    execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${dstVideo}"`, { stdio: 'pipe' })
    fs.unlinkSync(srcVideo)
    console.log('Rendered manila-tetris-v31b.mp4')
  } catch (err) {
    console.warn('ffmpeg not available, keeping as webm...')
    fs.renameSync(srcVideo, dstVideo)
  }

  console.log(`Done: output written to ${OUT_DIR}`)
}

render().catch(error => {
  console.error(error)
  process.exit(1)
})
