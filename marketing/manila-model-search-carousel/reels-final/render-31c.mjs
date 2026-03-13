import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, "output-31c")

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

/* Authentic Tetris piece colors */
const TC = {
  I: '#00f0f0', O: '#f0f000', T: '#a000f0',
  S: '#00f000', Z: '#f00000', J: '#0000f0', L: '#f0a000'
}
const TETRIS_COLORS = Object.values(TC)

/* Grid dimensions — 10 columns, sized to fit safe area */
const GRID_COLS = 10
const CELL = 90 // px per cell — 10 cols × 90 = 900px wide, fits in safe area (961px)
const GRID_W = GRID_COLS * CELL
const GRID_ROWS = Math.floor((HEIGHT - SAFE_TOP - SAFE_BOTTOM - 100) / CELL) // rows that fit
const GRID_H = GRID_ROWS * CELL
const GRID_LEFT = Math.floor((WIDTH - GRID_W) / 2)
const GRID_TOP = SAFE_TOP + 80

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

/* Build a 3D bevel style for a Tetris block */
function bevelStyle(color) {
  // Parse hex to get lighter/darker variants
  return `background:${color};border-top:3px solid ${lighten(color)};border-left:3px solid ${lighten(color)};border-bottom:3px solid ${darken(color)};border-right:3px solid ${darken(color)};`
}

function lighten(hex) {
  const r = Math.min(255, parseInt(hex.slice(1,3),16) + 80)
  const g = Math.min(255, parseInt(hex.slice(3,5),16) + 80)
  const b = Math.min(255, parseInt(hex.slice(5,7),16) + 80)
  return `rgb(${r},${g},${b})`
}

function darken(hex) {
  const r = Math.max(0, parseInt(hex.slice(1,3),16) - 60)
  const g = Math.max(0, parseInt(hex.slice(3,5),16) - 60)
  const b = Math.max(0, parseInt(hex.slice(5,7),16) - 60)
  return `rgb(${r},${g},${b})`
}

/* Tetromino shapes (col offsets, row offsets from origin) */
const SHAPES = {
  I: [[0,0],[1,0],[2,0],[3,0]],
  O: [[0,0],[1,0],[0,1],[1,1]],
  T: [[0,0],[1,0],[2,0],[1,1]],
  S: [[1,0],[2,0],[0,1],[1,1]],
  Z: [[0,0],[1,0],[1,1],[2,1]],
  J: [[0,0],[0,1],[1,1],[2,1]],
  L: [[2,0],[0,1],[1,1],[2,1]],
}

/*
  We pre-choreograph falling pieces:
  Each piece: { type, col (left col), landRow (bottom-most row), delay (s), fallDuration (s) }

  Scene 1 (0-4s): ~6 pieces fall and stack at bottom, then 2 rows line-clear at ~3.5s
  Scene 2 (4-12s): Photos revealed by line clears
  Scene 3 (12-17s): Step text pieces
  Scene 4 (17-24s): CTA
*/

/* Scene 1 pieces — fill bottom 2 rows to trigger line clear */
const scene1Pieces = [
  { type: 'I', col: 0, landRow: GRID_ROWS - 1, delay: 0.3, dur: 0.8 },
  { type: 'I', col: 4, landRow: GRID_ROWS - 1, delay: 0.7, dur: 0.8 },
  { type: 'O', col: 8, landRow: GRID_ROWS - 1, delay: 1.1, dur: 0.8 },
  { type: 'T', col: 0, landRow: GRID_ROWS - 2, delay: 1.5, dur: 0.8 },
  { type: 'I', col: 3, landRow: GRID_ROWS - 2, delay: 1.9, dur: 0.8 },
  { type: 'T', col: 7, landRow: GRID_ROWS - 2, delay: 2.3, dur: 0.8 },
]
const LINE_CLEAR_1_TIME = 3.3 // s — rows flash and clear

function buildHTML(imageDataMap) {
  const CONTENT_W = SAFE_RIGHT - SAFE_LEFT

  /* ===== Generate falling piece CSS animations ===== */
  let pieceCSS = ''
  let pieceHTML = ''

  scene1Pieces.forEach((p, idx) => {
    const shape = SHAPES[p.type]
    const color = TC[p.type]
    const startY = -4 * CELL // start above grid
    const endY = p.landRow * CELL - Math.max(...shape.map(s => s[1])) * CELL

    shape.forEach((offset, bi) => {
      const id = `p${idx}b${bi}`
      const x = GRID_LEFT + (p.col + offset[0]) * CELL
      const landY = GRID_TOP + endY + offset[1] * CELL

      pieceCSS += `
        @keyframes fall_${id} {
          0% { top: ${GRID_TOP + startY}px; opacity: 1; }
          100% { top: ${landY}px; opacity: 1; }
        }
        @keyframes clearRow_${id} {
          0% { opacity: 1; }
          30% { opacity: 1; background: #fff; }
          60% { opacity: 1; background: #fff; }
          100% { opacity: 0; }
        }
        .${id} {
          position: absolute;
          left: ${x}px;
          top: ${GRID_TOP + startY}px;
          width: ${CELL - 2}px;
          height: ${CELL - 2}px;
          ${bevelStyle(color)}
          opacity: 0;
          z-index: 5;
          animation:
            fadeIn 0.01s linear ${p.delay}s forwards,
            fall_${id} ${p.dur}s ease-in ${p.delay}s forwards,
            clearRow_${id} 0.6s ease-out ${LINE_CLEAR_1_TIME}s forwards;
        }
      `
      pieceHTML += `<div class="${id}"></div>\n`
    })
  })

  /* ===== Scene 2: Photo reveals via line-clear effect ===== */
  /* Each photo: flash overlay -> photo visible for ~1s -> flash -> next */
  let photoCSS = ''
  let photoHTML = ''

  PROOF_PHOTOS.forEach((photo, i) => {
    const showStart = 4.2 + i * 1.0
    const flashStart = showStart - 0.15
    const showEnd = showStart + 0.85

    // Photo visibility
    const pS = ((showStart / 24) * 100).toFixed(2)
    const pIn = (((showStart + 0.15) / 24) * 100).toFixed(2)
    const pOut = (((showEnd) / 24) * 100).toFixed(2)
    const pE = (((showEnd + 0.15) / 24) * 100).toFixed(2)

    photoCSS += `
      @keyframes showPhoto${i} {
        0%, ${pS}% { opacity: 0; }
        ${pIn}% { opacity: 1; }
        ${pOut}% { opacity: 1; }
        ${pE}%, 100% { opacity: 0; }
      }
      .photo-${i} {
        position: absolute;
        inset: 0;
        opacity: 0;
        animation: showPhoto${i} 24s linear 0s forwards;
        z-index: 8;
      }
    `

    // Line-clear flash overlay for each photo
    const fS = ((flashStart / 24) * 100).toFixed(2)
    const fM = (((flashStart + 0.12) / 24) * 100).toFixed(2)
    const fE = (((flashStart + 0.25) / 24) * 100).toFixed(2)

    photoCSS += `
      @keyframes photoFlash${i} {
        0%, ${fS}% { opacity: 0; }
        ${fM}% { opacity: 0.9; }
        ${fE}%, 100% { opacity: 0; }
      }
      .photo-flash-${i} {
        position: absolute;
        inset: 0;
        background: #fff;
        opacity: 0;
        animation: photoFlash${i} 24s linear 0s forwards;
        z-index: 12;
        pointer-events: none;
      }
    `

    // Build Tetris block border rows (top and bottom of photo)
    const blocksPerRow = Math.floor(640 / 20)
    let topBlocks = ''
    let botBlocks = ''
    for (let b = 0; b < blocksPerRow; b++) {
      const c1 = TETRIS_COLORS[(i + b) % TETRIS_COLORS.length]
      const c2 = TETRIS_COLORS[(i + b + 3) % TETRIS_COLORS.length]
      topBlocks += `<div style="width:20px;height:20px;${bevelStyle(c1)}flex-shrink:0;"></div>`
      botBlocks += `<div style="width:20px;height:20px;${bevelStyle(c2)}flex-shrink:0;"></div>`
    }

    // Side block columns
    const sideBlockCount = Math.floor(560 / 20)
    let leftBlocks = ''
    let rightBlocks = ''
    for (let b = 0; b < sideBlockCount; b++) {
      const c1 = TETRIS_COLORS[(i + b + 1) % TETRIS_COLORS.length]
      const c2 = TETRIS_COLORS[(i + b + 5) % TETRIS_COLORS.length]
      leftBlocks += `<div style="width:20px;height:20px;${bevelStyle(c1)}flex-shrink:0;"></div>`
      rightBlocks += `<div style="width:20px;height:20px;${bevelStyle(c2)}flex-shrink:0;"></div>`
    }

    photoHTML += `
      <div class="photo-${i}" style="display:flex;align-items:center;justify-content:center;">
        <div style="display:flex;flex-direction:column;align-items:center;">
          <!-- Top block row -->
          <div style="display:flex;gap:0;overflow:hidden;max-width:640px;">${topBlocks}</div>
          <!-- Photo with side block columns -->
          <div style="display:flex;">
            <div style="display:flex;flex-direction:column;gap:0;overflow:hidden;">${leftBlocks}</div>
            <div style="width:600px;height:560px;overflow:hidden;">
              <img src="${imageDataMap[photo]}" style="width:100%;height:100%;object-fit:cover;display:block;" />
            </div>
            <div style="display:flex;flex-direction:column;gap:0;overflow:hidden;">${rightBlocks}</div>
          </div>
          <!-- Bottom block row -->
          <div style="display:flex;gap:0;overflow:hidden;max-width:640px;">${botBlocks}</div>
          <!-- Photo counter -->
          <div style="margin-top:12px;font-family:${MONO};font-size:22px;color:${TETRIS_COLORS[i % TETRIS_COLORS.length]};letter-spacing:3px;text-shadow:0 0 10px ${TETRIS_COLORS[i % TETRIS_COLORS.length]}60;">LINE CLEAR ${i + 1} / 8</div>
        </div>
      </div>
      <div class="photo-flash-${i}"></div>
    `
  })

  /* ===== Scene 3: Steps as falling pieces ===== */
  const steps = [
    { text: '1. DM ME', color: TC.I, delay: 12.5 },
    { text: '2. PICK A DATE', color: TC.O, delay: 13.8 },
    { text: '3. SHOW UP', color: TC.S, delay: 15.1 },
  ]

  let stepCSS = ''
  let stepHTML = ''

  steps.forEach((step, i) => {
    const landY = 350 + i * 160

    stepCSS += `
      @keyframes stepFall${i} {
        0% { top: -120px; }
        100% { top: ${landY}px; }
      }
      @keyframes stepFlash${i} {
        0%, 90% { background: transparent; }
        93% { background: rgba(255,255,255,0.8); }
        100% { background: transparent; }
      }
      .step-piece-${i} {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        top: -120px;
        opacity: 0;
        z-index: 10;
        animation:
          fadeIn 0.01s linear ${step.delay}s forwards,
          stepFall${i} 0.7s ease-in ${step.delay}s forwards;
      }
      .step-flash-row-${i} {
        position: absolute;
        left: 0;
        right: 0;
        top: ${landY}px;
        height: 120px;
        z-index: 4;
        pointer-events: none;
        animation: stepFlash${i} 0.7s ease-out ${step.delay}s forwards;
      }
    `

    // Build the step as a tetromino-shaped block with text
    const charBlocks = step.text.split('').map((ch, ci) => {
      return `<div style="width:60px;height:70px;${bevelStyle(step.color)}display:flex;align-items:center;justify-content:center;font-family:${MONO};font-size:36px;font-weight:900;color:#fff;text-shadow:2px 2px 0 rgba(0,0,0,0.6);">${ch === ' ' ? '&nbsp;' : ch}</div>`
    }).join('')

    stepHTML += `
      <div class="step-flash-row-${i}"></div>
      <div class="step-piece-${i}">
        <div style="display:flex;gap:2px;">${charBlocks}</div>
      </div>
    `
  })

  /* ===== Scene 4: CTA ===== */
  /* Full-screen flash at 17s, then CTA elements fade in */

  // Score counter — we'll fake it with CSS counter animation (stepping through numbers)
  // Since we can't use JS, we'll use multiple overlapping elements
  const scoreSteps = 20
  let scoreCss = ''
  let scoreHtml = ''
  for (let s = 0; s < scoreSteps; s++) {
    const val = Math.floor(Math.random() * 90000 + 10000 + s * 5000)
    const sStart = (((17.5 + s * 0.25) / 24) * 100).toFixed(2)
    const sEnd = (((17.5 + (s + 1) * 0.25) / 24) * 100).toFixed(2)

    scoreCss += `
      @keyframes scoreStep${s} {
        0%, ${sStart}% { opacity: 0; }
        ${sStart}% { opacity: 1; }
        ${sEnd}%, 100% { opacity: 0; }
      }
      .score-val-${s} {
        position: absolute;
        opacity: 0;
        animation: scoreStep${s} 24s linear 0s forwards;
      }
    `
    scoreHtml += `<span class="score-val-${s}">${val.toLocaleString()}</span>`
  }
  // Final score stays
  const finalScore = '99,999'
  scoreCss += `
    @keyframes scoreFinal {
      0%, ${((17.5 + scoreSteps * 0.25) / 24 * 100).toFixed(2)}% { opacity: 0; }
      ${((17.5 + scoreSteps * 0.25 + 0.01) / 24 * 100).toFixed(2)}%, 100% { opacity: 1; }
    }
    .score-final { opacity: 0; animation: scoreFinal 24s linear 0s forwards; }
  `
  scoreHtml += `<span class="score-final">${finalScore}</span>`

  /* ===== Build side block stacks for CTA scene ===== */
  let ctaBlockCSS = ''
  let ctaLeftBlocks = ''
  let ctaRightBlocks = ''
  const ctaStackHeight = 14
  for (let i = 0; i < ctaStackHeight; i++) {
    ctaBlockCSS += `
      .cta-lb-${i} { opacity:0; animation: fallDown 0.2s ease-out ${17.3 + 0.06 * i}s forwards; }
      .cta-rb-${i} { opacity:0; animation: fallDown 0.2s ease-out ${17.35 + 0.06 * i}s forwards; }
    `
    ctaLeftBlocks += `<div class="cta-lb-${i}" style="width:${CELL - 2}px;height:${CELL - 2}px;${bevelStyle(TETRIS_COLORS[i % TETRIS_COLORS.length])}"></div>`
    ctaRightBlocks += `<div class="cta-rb-${i}" style="width:${CELL - 2}px;height:${CELL - 2}px;${bevelStyle(TETRIS_COLORS[(i + 3) % TETRIS_COLORS.length])}"></div>`
  }

  return `<!DOCTYPE html>
<html>
<head>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { margin: 0; padding: 0; background: #0a0a0a; font-family: ${MONO}; overflow: hidden; }

  /* === CORE KEYFRAMES === */
  @keyframes fadeIn {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }
  @keyframes fadeOut {
    0% { opacity: 1; }
    100% { opacity: 0; }
  }
  @keyframes fallDown {
    0% { transform: translateY(-80px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }
  @keyframes ctaGlow {
    0%, 100% { box-shadow: 0 0 20px rgba(0,240,240,0.3); }
    50% { box-shadow: 0 0 50px rgba(0,240,240,0.8), 0 0 100px rgba(0,240,240,0.3); }
  }
  @keyframes pulseText {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  @keyframes fullFlash {
    0% { opacity: 0; }
    10% { opacity: 0.95; }
    40% { opacity: 0.95; }
    100% { opacity: 0; }
  }

  /* === TETRIS GRID LINES === */
  .tetris-grid {
    position: absolute;
    left: ${GRID_LEFT}px;
    top: ${GRID_TOP}px;
    width: ${GRID_W}px;
    height: ${GRID_H}px;
    z-index: 2;
    pointer-events: none;
    background-image:
      linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px);
    background-size: ${CELL}px ${CELL}px;
    border: 2px solid rgba(255,255,255,0.12);
  }

  /* === SCENE VISIBILITY === */
  /* Scene 1: 0s - 4s */
  @keyframes scene1Life {
    0% { opacity: 1; }
    90% { opacity: 1; }
    100% { opacity: 0; }
  }
  #scene1 { animation: fadeIn 0.2s ease-out 0s forwards, scene1Life 4.2s linear 0s forwards; }

  /* Scene 2: 4s - 12.2s */
  @keyframes scene2Life {
    0% { opacity: 0; }
    2% { opacity: 1; }
    97% { opacity: 1; }
    100% { opacity: 0; }
  }
  #scene2 { opacity: 0; animation: scene2Life 8.2s linear 4.0s forwards; }

  /* Scene 3: 12.2s - 17s */
  @keyframes scene3Life {
    0% { opacity: 0; }
    3% { opacity: 1; }
    96% { opacity: 1; }
    100% { opacity: 0; }
  }
  #scene3 { opacity: 0; animation: scene3Life 4.8s linear 12.2s forwards; }

  /* Scene 4: 17s - 24s */
  @keyframes scene4Life {
    0% { opacity: 0; }
    3% { opacity: 1; }
    100% { opacity: 1; }
  }
  #scene4 { opacity: 0; animation: scene4Life 7s linear 17.0s forwards; }

  /* === LETTER FALL ANIMATIONS (Scene 1 title) === */
  ${'MANILA'.split('').map((_, i) => `
    .title-m-${i} { opacity: 0; animation: fallDown 0.4s ease-out ${0.3 + 0.12 * i}s forwards; }
  `).join('')}
  ${'FREE PHOTO SHOOT'.split('').map((_, i) => `
    .title-s-${i} { opacity: 0; animation: fallDown 0.3s ease-out ${1.2 + 0.06 * i}s forwards; }
  `).join('')}
  .scene1-sub { opacity: 0; animation: fadeIn 0.5s ease-out 2.5s forwards; }

  /* === LINE CLEAR FLASH (Scene 1 bottom rows) === */
  @keyframes lineClear1 {
    0% { opacity: 0; }
    10% { opacity: 0.9; background: #fff; }
    50% { opacity: 0.9; background: #fff; }
    100% { opacity: 0; }
  }
  .line-clear-1 {
    position: absolute;
    left: ${GRID_LEFT}px;
    bottom: ${HEIGHT - GRID_TOP - GRID_H}px;
    width: ${GRID_W}px;
    height: ${CELL * 2 + 4}px;
    z-index: 15;
    pointer-events: none;
    opacity: 0;
    animation: lineClear1 0.6s ease-out ${LINE_CLEAR_1_TIME}s forwards;
  }

  /* === FALLING PIECES (Scene 1) === */
  ${pieceCSS}

  /* === PHOTO ANIMATIONS (Scene 2) === */
  ${photoCSS}

  /* === STEP ANIMATIONS (Scene 3) === */
  ${stepCSS}

  /* === SCORE COUNTER === */
  ${scoreCss}

  /* === CTA BLOCK STACKS === */
  ${ctaBlockCSS}

  /* === CTA ELEMENTS === */
  .cta-handle { opacity: 0; animation: fadeIn 0.6s ease-out 17.8s forwards; }
  .cta-sub { opacity: 0; animation: fadeIn 0.5s ease-out 18.2s forwards; }
  .cta-btn { opacity: 0; animation: fadeIn 0.5s ease-out 18.6s forwards, ctaGlow 1.5s ease-in-out 19.1s infinite; }
  .cta-limited { opacity: 0; animation: fadeIn 0.5s ease-out 19.3s forwards, pulseText 1.8s ease-in-out 19.8s infinite; }

  /* Full screen flash at scene 4 start */
  .full-flash {
    position: absolute;
    inset: 0;
    background: #fff;
    z-index: 50;
    opacity: 0;
    pointer-events: none;
    animation: fullFlash 0.8s ease-out 17.0s forwards;
  }
</style>
</head>
<body>
  <div id="root" style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#0a0a0a;">

    <!-- Tetris grid overlay — always visible -->
    <div class="tetris-grid"></div>

    <!-- CRT scanlines -->
    <div style="position:absolute;inset:0;z-index:100;pointer-events:none;background:repeating-linear-gradient(0deg,rgba(0,0,0,0.1) 0px,rgba(0,0,0,0.1) 1px,transparent 1px,transparent 3px);"></div>

    <!-- === HEADER: Score / Level / Game Title === -->
    <div style="position:absolute;top:${SAFE_TOP}px;left:${SAFE_LEFT}px;right:${WIDTH - SAFE_RIGHT}px;z-index:55;padding:8px 0;display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid rgba(255,255,255,0.15);opacity:0;animation:fadeIn 0.4s ease-out 0.1s forwards;">
      <div>
        <div style="font-size:14px;color:rgba(255,255,255,0.35);letter-spacing:3px;">SCORE</div>
        <div style="font-size:24px;font-weight:900;color:#00f0f0;letter-spacing:2px;position:relative;min-width:120px;">${scoreHtml}</div>
      </div>
      <div style="text-align:center;">
        <div style="font-size:18px;font-weight:900;color:#00f0f0;letter-spacing:3px;text-shadow:0 0 12px rgba(0,240,240,0.5);">MANILA FREE PHOTO SHOOT</div>
      </div>
      <div style="text-align:right;">
        <div style="font-size:14px;color:rgba(255,255,255,0.35);letter-spacing:3px;">LEVEL</div>
        <div style="font-size:24px;font-weight:900;color:#f0a000;letter-spacing:2px;">1</div>
      </div>
    </div>

    <!-- ========== SCENE 1: THE GAME STARTS (0-4s) ========== -->
    <div id="scene1" style="position:absolute;left:${GRID_LEFT}px;top:${GRID_TOP}px;width:${GRID_W}px;height:${GRID_H}px;z-index:10;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;">

      <!-- Title letters falling like Tetris pieces -->
      <div style="display:flex;gap:4px;">
        ${'MANILA'.split('').map((ch, i) => `<div class="title-m-${i}" style="width:${CELL}px;height:${CELL + 10}px;${bevelStyle(TETRIS_COLORS[i % TETRIS_COLORS.length])}display:flex;align-items:center;justify-content:center;font-size:56px;font-weight:900;color:#fff;text-shadow:3px 3px 0 rgba(0,0,0,0.6);">${ch}</div>`).join('\n        ')}
      </div>

      <!-- Subtitle words -->
      <div style="display:flex;gap:3px;flex-wrap:wrap;justify-content:center;">
        ${'FREE PHOTO SHOOT'.split('').map((ch, i) => `<div class="title-s-${i}" style="width:${ch === ' ' ? '20' : '52'}px;height:58px;${ch === ' ' ? '' : bevelStyle(TETRIS_COLORS[(i + 2) % TETRIS_COLORS.length])}display:flex;align-items:center;justify-content:center;font-size:34px;font-weight:700;color:#fff;text-shadow:2px 2px 0 rgba(0,0,0,0.5);">${ch === ' ' ? '' : ch}</div>`).join('\n        ')}
      </div>

      <!-- Score: FREE text -->
      <div class="scene1-sub" style="margin-top:16px;font-size:28px;color:#f0f000;letter-spacing:4px;text-shadow:0 0 12px rgba(240,240,0,0.4);">NO EXPERIENCE NEEDED</div>
    </div>

    <!-- Falling pieces (Scene 1) -->
    ${pieceHTML}

    <!-- Line clear flash (Scene 1) -->
    <div class="line-clear-1"></div>

    <!-- ========== SCENE 2: PHOTOS AS COMPLETED ROWS (4-12s) ========== -->
    <div id="scene2" style="position:absolute;left:${GRID_LEFT}px;top:${GRID_TOP}px;width:${GRID_W}px;height:${GRID_H}px;z-index:10;">
      <div style="position:absolute;top:8px;left:0;right:0;text-align:center;font-size:18px;color:rgba(255,255,255,0.35);letter-spacing:5px;z-index:2;">PORTFOLIO</div>
      <div style="position:absolute;top:50px;left:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center;">
        ${photoHTML}
      </div>
    </div>

    <!-- ========== SCENE 3: STEPS AS FALLING PIECES (12-17s) ========== -->
    <div id="scene3" style="position:absolute;left:${GRID_LEFT}px;top:${GRID_TOP}px;width:${GRID_W}px;height:${GRID_H}px;z-index:10;">
      <div style="position:absolute;top:120px;left:0;right:0;text-align:center;">
        <div style="font-size:20px;color:rgba(255,255,255,0.3);letter-spacing:6px;opacity:0;animation:fadeIn 0.4s ease-out 12.3s forwards;">HOW IT WORKS</div>
      </div>
      ${stepHTML}
    </div>

    <!-- ========== FULL SCREEN FLASH (17s transition) ========== -->
    <div class="full-flash"></div>

    <!-- ========== SCENE 4: CTA (17-24s) ========== -->
    <div id="scene4" style="position:absolute;left:${GRID_LEFT}px;top:${GRID_TOP}px;width:${GRID_W}px;height:${GRID_H}px;z-index:10;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;">

      <!-- Side block stacks (left) -->
      <div style="position:absolute;left:0;bottom:0;width:${CELL}px;display:flex;flex-direction:column-reverse;">
        ${ctaLeftBlocks}
      </div>

      <!-- Side block stacks (right) -->
      <div style="position:absolute;right:0;bottom:0;width:${CELL}px;display:flex;flex-direction:column-reverse;">
        ${ctaRightBlocks}
      </div>

      <!-- @madebyaidan -->
      <div class="cta-handle" style="font-size:56px;font-weight:900;color:#fff;text-align:center;text-shadow:0 0 25px rgba(0,240,240,0.5);">@madebyaidan</div>

      <!-- on Instagram -->
      <div class="cta-sub" style="font-size:28px;color:rgba(255,255,255,0.45);text-align:center;">on Instagram</div>

      <!-- DM button -->
      <div class="cta-btn" style="margin-top:20px;padding:24px 70px;${bevelStyle('#00f0f0')}font-size:40px;font-weight:900;color:#000;text-align:center;letter-spacing:4px;">SEND ME A DM</div>

      <!-- Limited spots -->
      <div class="cta-limited" style="margin-top:28px;font-size:26px;color:#f00000;text-align:center;letter-spacing:3px;text-shadow:0 0 10px rgba(240,0,0,0.4);">LIMITED SPOTS</div>
    </div>

  </div>

  <script>
    // All animation is pure CSS keyframes — no JS animation loops.
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
    strategy: 'v31c — Proper Tetris: grid, falling tetrominoes with bevel, line clears revealing photos',
    safeBottomPixels: SAFE_BOTTOM,
    photos: PROOF_PHOTOS,
  })

  const browser = await chromium.launch()
  console.log('Recording Tetris-themed reel (proper grid + falling pieces)...')

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
  const dstVideo = path.join(OUT_DIR, 'manila-tetris-v31c.mp4')

  const { execSync } = await import('child_process')
  try {
    execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${dstVideo}"`, { stdio: 'pipe' })
    fs.unlinkSync(srcVideo)
    console.log('Rendered manila-tetris-v31c.mp4')
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
