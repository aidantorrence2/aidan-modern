import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, "output-31d")

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
  return 'data:image/jpeg;base64,' + buf.toString('base64')
}

function writeSources(payload) {
  fs.writeFileSync(path.join(OUT_DIR, 'sources.json'), JSON.stringify(payload, null, 2))
}

/* Build a 3D bevel style for a Tetris block */
function bevelStyle(color) {
  return 'background:' + color + ';border-top:3px solid ' + lighten(color) + ';border-left:3px solid ' + lighten(color) + ';border-bottom:3px solid ' + darken(color) + ';border-right:3px solid ' + darken(color) + ';'
}

function lighten(hex) {
  const r = Math.min(255, parseInt(hex.slice(1,3),16) + 80)
  const g = Math.min(255, parseInt(hex.slice(3,5),16) + 80)
  const b = Math.min(255, parseInt(hex.slice(5,7),16) + 80)
  return 'rgb(' + r + ',' + g + ',' + b + ')'
}

function darken(hex) {
  const r = Math.max(0, parseInt(hex.slice(1,3),16) - 60)
  const g = Math.max(0, parseInt(hex.slice(3,5),16) - 60)
  const b = Math.max(0, parseInt(hex.slice(5,7),16) - 60)
  return 'rgb(' + r + ',' + g + ',' + b + ')'
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
  var CONTENT_W = SAFE_RIGHT - SAFE_LEFT

  /* ===== Generate falling piece CSS animations ===== */
  var pieceCSS = ''
  var pieceHTML = ''

  scene1Pieces.forEach(function(p, idx) {
    var shape = SHAPES[p.type]
    var color = TC[p.type]
    var startY = -4 * CELL // start above grid
    var maxRowOffset = 0
    for (var si = 0; si < shape.length; si++) {
      if (shape[si][1] > maxRowOffset) maxRowOffset = shape[si][1]
    }
    var endY = p.landRow * CELL - maxRowOffset * CELL

    shape.forEach(function(offset, bi) {
      var id = 'p' + idx + 'b' + bi
      var x = GRID_LEFT + (p.col + offset[0]) * CELL
      var landY = GRID_TOP + endY + offset[1] * CELL

      pieceCSS += '\n' +
        '@keyframes fall_' + id + ' {\n' +
        '  0% { top: ' + (GRID_TOP + startY) + 'px; opacity: 1; }\n' +
        '  100% { top: ' + landY + 'px; opacity: 1; }\n' +
        '}\n' +
        '@keyframes clearRow_' + id + ' {\n' +
        '  0% { opacity: 1; }\n' +
        '  30% { opacity: 1; background: #fff; }\n' +
        '  60% { opacity: 1; background: #fff; }\n' +
        '  100% { opacity: 0; }\n' +
        '}\n' +
        '.' + id + ' {\n' +
        '  position: absolute;\n' +
        '  left: ' + x + 'px;\n' +
        '  top: ' + (GRID_TOP + startY) + 'px;\n' +
        '  width: ' + (CELL - 2) + 'px;\n' +
        '  height: ' + (CELL - 2) + 'px;\n' +
        '  ' + bevelStyle(color) + '\n' +
        '  opacity: 0;\n' +
        '  z-index: 5;\n' +
        '  animation:\n' +
        '    fadeIn 0.01s linear ' + p.delay + 's forwards,\n' +
        '    fall_' + id + ' ' + p.dur + 's ease-in ' + p.delay + 's forwards,\n' +
        '    clearRow_' + id + ' 0.6s ease-out ' + LINE_CLEAR_1_TIME + 's forwards;\n' +
        '}\n'
      pieceHTML += '<div class="' + id + '"></div>\n'
    })
  })

  /* ===== Scene 2: Photo reveals via line-clear effect ===== */
  /* Each photo: flash overlay -> photo visible for ~1.5s -> flash -> next */
  var photoCSS = ''
  var photoHTML = ''

  PROOF_PHOTOS.forEach(function(photo, i) {
    var showStart = 4.2 + i * 1.5
    var flashStart = showStart - 0.15
    var showEnd = showStart + 1.35

    // Photo visibility
    var pS = ((showStart / 24) * 100).toFixed(2)
    var pIn = (((showStart + 0.15) / 24) * 100).toFixed(2)
    var pOut = (((showEnd) / 24) * 100).toFixed(2)
    var pE = (((showEnd + 0.15) / 24) * 100).toFixed(2)

    photoCSS += '\n' +
      '@keyframes showPhoto' + i + ' {\n' +
      '  0%, ' + pS + '% { opacity: 0; }\n' +
      '  ' + pIn + '% { opacity: 1; }\n' +
      '  ' + pOut + '% { opacity: 1; }\n' +
      '  ' + pE + '%, 100% { opacity: 0; }\n' +
      '}\n' +
      '.photo-' + i + ' {\n' +
      '  position: absolute;\n' +
      '  inset: 0;\n' +
      '  opacity: 0;\n' +
      '  animation: showPhoto' + i + ' 24s linear 0s forwards;\n' +
      '  z-index: 8;\n' +
      '}\n'

    // Line-clear flash overlay for each photo
    var fS = ((flashStart / 24) * 100).toFixed(2)
    var fM = (((flashStart + 0.12) / 24) * 100).toFixed(2)
    var fE = (((flashStart + 0.25) / 24) * 100).toFixed(2)

    photoCSS += '\n' +
      '@keyframes photoFlash' + i + ' {\n' +
      '  0%, ' + fS + '% { opacity: 0; }\n' +
      '  ' + fM + '% { opacity: 0.9; }\n' +
      '  ' + fE + '%, 100% { opacity: 0; }\n' +
      '}\n' +
      '.photo-flash-' + i + ' {\n' +
      '  position: absolute;\n' +
      '  inset: 0;\n' +
      '  background: #fff;\n' +
      '  opacity: 0;\n' +
      '  animation: photoFlash' + i + ' 24s linear 0s forwards;\n' +
      '  z-index: 12;\n' +
      '  pointer-events: none;\n' +
      '}\n'

    // Build Tetris block border rows (top and bottom of photo)
    var blocksPerRow = Math.floor(640 / 20)
    var topBlocks = ''
    var botBlocks = ''
    for (var b = 0; b < blocksPerRow; b++) {
      var c1 = TETRIS_COLORS[(i + b) % TETRIS_COLORS.length]
      var c2 = TETRIS_COLORS[(i + b + 3) % TETRIS_COLORS.length]
      topBlocks += '<div style="width:20px;height:20px;' + bevelStyle(c1) + 'flex-shrink:0;"></div>'
      botBlocks += '<div style="width:20px;height:20px;' + bevelStyle(c2) + 'flex-shrink:0;"></div>'
    }

    // Side block columns
    var sideBlockCount = Math.floor(560 / 20)
    var leftBlocks = ''
    var rightBlocks = ''
    for (var b2 = 0; b2 < sideBlockCount; b2++) {
      var c3 = TETRIS_COLORS[(i + b2 + 1) % TETRIS_COLORS.length]
      var c4 = TETRIS_COLORS[(i + b2 + 5) % TETRIS_COLORS.length]
      leftBlocks += '<div style="width:20px;height:20px;' + bevelStyle(c3) + 'flex-shrink:0;"></div>'
      rightBlocks += '<div style="width:20px;height:20px;' + bevelStyle(c4) + 'flex-shrink:0;"></div>'
    }

    photoHTML += '\n' +
      '<div class="photo-' + i + '" style="display:flex;align-items:center;justify-content:center;">\n' +
      '  <div style="display:flex;flex-direction:column;align-items:center;">\n' +
      '    <!-- Top block row -->\n' +
      '    <div style="display:flex;gap:0;overflow:hidden;max-width:640px;">' + topBlocks + '</div>\n' +
      '    <!-- Photo with side block columns -->\n' +
      '    <div style="display:flex;">\n' +
      '      <div style="display:flex;flex-direction:column;gap:0;overflow:hidden;">' + leftBlocks + '</div>\n' +
      '      <div style="width:600px;height:560px;overflow:hidden;background:#111;">\n' +
      '        <img src="' + imageDataMap[photo] + '" style="width:100%;height:100%;object-fit:contain;display:block;" />\n' +
      '      </div>\n' +
      '      <div style="display:flex;flex-direction:column;gap:0;overflow:hidden;">' + rightBlocks + '</div>\n' +
      '    </div>\n' +
      '    <!-- Bottom block row -->\n' +
      '    <div style="display:flex;gap:0;overflow:hidden;max-width:640px;">' + botBlocks + '</div>\n' +
      '    <!-- Photo counter -->\n' +
      '    <div style="margin-top:12px;font-family:' + MONO + ';font-size:22px;color:' + TETRIS_COLORS[i % TETRIS_COLORS.length] + ';letter-spacing:3px;text-shadow:0 0 10px ' + TETRIS_COLORS[i % TETRIS_COLORS.length] + '60;">LINE CLEAR ' + (i + 1) + ' / 8</div>\n' +
      '  </div>\n' +
      '</div>\n' +
      '<div class="photo-flash-' + i + '"></div>\n'
  })

  /* ===== Scene 3: Steps as falling pieces ===== */
  var steps = [
    { text: '1. DM ME', color: TC.I, delay: 16.5 },
    { text: '2. PICK A DATE', color: TC.O, delay: 17.8 },
    { text: '3. SHOW UP', color: TC.S, delay: 19.1 },
  ]

  var stepCSS = ''
  var stepHTML = ''

  steps.forEach(function(step, i) {
    var landY = 350 + i * 160

    stepCSS += '\n' +
      '@keyframes stepFall' + i + ' {\n' +
      '  0% { top: -120px; }\n' +
      '  100% { top: ' + landY + 'px; }\n' +
      '}\n' +
      '@keyframes stepFlash' + i + ' {\n' +
      '  0%, 90% { background: transparent; }\n' +
      '  93% { background: rgba(255,255,255,0.8); }\n' +
      '  100% { background: transparent; }\n' +
      '}\n' +
      '.step-piece-' + i + ' {\n' +
      '  position: absolute;\n' +
      '  left: 50%;\n' +
      '  transform: translateX(-50%);\n' +
      '  top: -120px;\n' +
      '  opacity: 0;\n' +
      '  z-index: 10;\n' +
      '  animation:\n' +
      '    fadeIn 0.01s linear ' + step.delay + 's forwards,\n' +
      '    stepFall' + i + ' 0.7s ease-in ' + step.delay + 's forwards;\n' +
      '}\n' +
      '.step-flash-row-' + i + ' {\n' +
      '  position: absolute;\n' +
      '  left: 0;\n' +
      '  right: 0;\n' +
      '  top: ' + landY + 'px;\n' +
      '  height: 120px;\n' +
      '  z-index: 4;\n' +
      '  pointer-events: none;\n' +
      '  animation: stepFlash' + i + ' 0.7s ease-out ' + step.delay + 's forwards;\n' +
      '}\n'

    // Build the step as a tetromino-shaped block with text
    var charBlocks = ''
    var chars = step.text.split('')
    for (var ci = 0; ci < chars.length; ci++) {
      var ch = chars[ci]
      var chDisplay = ch === ' ' ? '&nbsp;' : ch
      charBlocks += '<div style="width:60px;height:70px;' + bevelStyle(step.color) + 'display:flex;align-items:center;justify-content:center;font-family:' + MONO + ';font-size:36px;font-weight:900;color:#fff;text-shadow:2px 2px 0 rgba(0,0,0,0.6);">' + chDisplay + '</div>'
    }

    stepHTML += '\n' +
      '<div class="step-flash-row-' + i + '"></div>\n' +
      '<div class="step-piece-' + i + '">\n' +
      '  <div style="display:flex;gap:2px;">' + charBlocks + '</div>\n' +
      '</div>\n'
  })

  /* ===== Scene 4: CTA ===== */
  /* Full-screen flash at 21s, then CTA elements fade in */

  // Score counter
  var scoreSteps = 20
  var scoreCss = ''
  var scoreHtml = ''
  for (var s = 0; s < scoreSteps; s++) {
    var val = Math.floor(Math.random() * 90000 + 10000 + s * 5000)
    var sStart = (((17.5 + s * 0.25) / 24) * 100).toFixed(2)
    var sEnd = (((17.5 + (s + 1) * 0.25) / 24) * 100).toFixed(2)

    scoreCss += '\n' +
      '@keyframes scoreStep' + s + ' {\n' +
      '  0%, ' + sStart + '% { opacity: 0; }\n' +
      '  ' + sStart + '% { opacity: 1; }\n' +
      '  ' + sEnd + '%, 100% { opacity: 0; }\n' +
      '}\n' +
      '.score-val-' + s + ' {\n' +
      '  position: absolute;\n' +
      '  opacity: 0;\n' +
      '  animation: scoreStep' + s + ' 24s linear 0s forwards;\n' +
      '}\n'
    scoreHtml += '<span class="score-val-' + s + '">' + val.toLocaleString() + '</span>'
  }
  // Final score stays
  var finalScore = '99,999'
  var finalPct = ((17.5 + scoreSteps * 0.25) / 24 * 100).toFixed(2)
  var finalPct2 = ((17.5 + scoreSteps * 0.25 + 0.01) / 24 * 100).toFixed(2)
  scoreCss += '\n' +
    '@keyframes scoreFinal {\n' +
    '  0%, ' + finalPct + '% { opacity: 0; }\n' +
    '  ' + finalPct2 + '%, 100% { opacity: 1; }\n' +
    '}\n' +
    '.score-final { opacity: 0; animation: scoreFinal 24s linear 0s forwards; }\n'
  scoreHtml += '<span class="score-final">' + finalScore + '</span>'

  /* ===== Build side block stacks for CTA scene ===== */
  var ctaBlockCSS = ''
  var ctaLeftBlocks = ''
  var ctaRightBlocks = ''
  var ctaStackHeight = 14
  for (var i = 0; i < ctaStackHeight; i++) {
    ctaBlockCSS += '\n' +
      '.cta-lb-' + i + ' { opacity:0; animation: fallDown 0.2s ease-out ' + (21.3 + 0.06 * i) + 's forwards; }\n' +
      '.cta-rb-' + i + ' { opacity:0; animation: fallDown 0.2s ease-out ' + (21.35 + 0.06 * i) + 's forwards; }\n'
    ctaLeftBlocks += '<div class="cta-lb-' + i + '" style="width:' + (CELL - 2) + 'px;height:' + (CELL - 2) + 'px;' + bevelStyle(TETRIS_COLORS[i % TETRIS_COLORS.length]) + '"></div>'
    ctaRightBlocks += '<div class="cta-rb-' + i + '" style="width:' + (CELL - 2) + 'px;height:' + (CELL - 2) + 'px;' + bevelStyle(TETRIS_COLORS[(i + 3) % TETRIS_COLORS.length]) + '"></div>'
  }

  /* ===== Title letter CSS — bigger falling blocks ===== */
  // MANILA letters — each is a big Tetris block (120px) falling in
  var titleManilaCSS = ''
  var manilaChars = 'MANILA'.split('')
  for (var ti = 0; ti < manilaChars.length; ti++) {
    titleManilaCSS += '\n.title-m-' + ti + ' { opacity: 0; animation: fallDown 0.4s ease-out ' + (0.3 + 0.12 * ti) + 's forwards; }\n'
  }

  // "FREE PHOTO SHOOT" letters — bigger blocks
  var titleSubCSS = ''
  var subChars = 'FREE PHOTO SHOOT'.split('')
  for (var si = 0; si < subChars.length; si++) {
    titleSubCSS += '\n.title-s-' + si + ' { opacity: 0; animation: fallDown 0.3s ease-out ' + (1.2 + 0.06 * si) + 's forwards; }\n'
  }

  /* ===== Build MANILA title letters HTML ===== */
  var manilaLettersHTML = ''
  for (var mi = 0; mi < manilaChars.length; mi++) {
    var mColor = TETRIS_COLORS[mi % TETRIS_COLORS.length]
    manilaLettersHTML += '<div class="title-m-' + mi + '" style="width:130px;height:130px;' + bevelStyle(mColor) + 'display:flex;align-items:center;justify-content:center;font-size:80px;font-weight:900;color:#fff;text-shadow:4px 4px 0 rgba(0,0,0,0.7);">' + manilaChars[mi] + '</div>'
  }

  /* ===== Build FREE PHOTO SHOOT letters HTML — bigger ===== */
  var subLettersHTML = ''
  for (var sui = 0; sui < subChars.length; sui++) {
    var sCh = subChars[sui]
    var sColor = TETRIS_COLORS[(sui + 2) % TETRIS_COLORS.length]
    if (sCh === ' ') {
      subLettersHTML += '<div class="title-s-' + sui + '" style="width:24px;height:72px;display:flex;align-items:center;justify-content:center;font-size:48px;font-weight:900;color:#fff;"></div>'
    } else {
      subLettersHTML += '<div class="title-s-' + sui + '" style="width:66px;height:72px;' + bevelStyle(sColor) + 'display:flex;align-items:center;justify-content:center;font-size:48px;font-weight:900;color:#fff;text-shadow:3px 3px 0 rgba(0,0,0,0.6);">' + sCh + '</div>'
    }
  }

  return '<!DOCTYPE html>\n' +
'<html>\n' +
'<head>\n' +
'<style>\n' +
'  * { box-sizing: border-box; margin: 0; padding: 0; }\n' +
'  html, body { margin: 0; padding: 0; background: #0a0a0a; font-family: ' + MONO + '; overflow: hidden; }\n' +
'\n' +
'  /* === CORE KEYFRAMES === */\n' +
'  @keyframes fadeIn {\n' +
'    0% { opacity: 0; }\n' +
'    100% { opacity: 1; }\n' +
'  }\n' +
'  @keyframes fadeOut {\n' +
'    0% { opacity: 1; }\n' +
'    100% { opacity: 0; }\n' +
'  }\n' +
'  @keyframes fallDown {\n' +
'    0% { transform: translateY(-80px); opacity: 0; }\n' +
'    100% { transform: translateY(0); opacity: 1; }\n' +
'  }\n' +
'  @keyframes ctaGlow {\n' +
'    0%, 100% { box-shadow: 0 0 20px rgba(0,240,240,0.3); }\n' +
'    50% { box-shadow: 0 0 50px rgba(0,240,240,0.8), 0 0 100px rgba(0,240,240,0.3); }\n' +
'  }\n' +
'  @keyframes pulseText {\n' +
'    0%, 100% { opacity: 1; }\n' +
'    50% { opacity: 0.5; }\n' +
'  }\n' +
'  @keyframes fullFlash {\n' +
'    0% { opacity: 0; }\n' +
'    10% { opacity: 0.95; }\n' +
'    40% { opacity: 0.95; }\n' +
'    100% { opacity: 0; }\n' +
'  }\n' +
'\n' +
'  /* === TETRIS GRID LINES === */\n' +
'  .tetris-grid {\n' +
'    position: absolute;\n' +
'    left: ' + GRID_LEFT + 'px;\n' +
'    top: ' + GRID_TOP + 'px;\n' +
'    width: ' + GRID_W + 'px;\n' +
'    height: ' + GRID_H + 'px;\n' +
'    z-index: 2;\n' +
'    pointer-events: none;\n' +
'    background-image:\n' +
'      linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px),\n' +
'      linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px);\n' +
'    background-size: ' + CELL + 'px ' + CELL + 'px;\n' +
'    border: 2px solid rgba(255,255,255,0.12);\n' +
'  }\n' +
'\n' +
'  /* === SCENE VISIBILITY === */\n' +
'  /* Scene 1: 0s - 4s */\n' +
'  @keyframes scene1Life {\n' +
'    0% { opacity: 1; }\n' +
'    90% { opacity: 1; }\n' +
'    100% { opacity: 0; }\n' +
'  }\n' +
'  #scene1 { animation: fadeIn 0.2s ease-out 0s forwards, scene1Life 4.2s linear 0s forwards; }\n' +
'\n' +
'  /* Scene 2: 4s - 16.2s (8 photos x 1.5s each) */\n' +
'  @keyframes scene2Life {\n' +
'    0% { opacity: 0; }\n' +
'    2% { opacity: 1; }\n' +
'    97% { opacity: 1; }\n' +
'    100% { opacity: 0; }\n' +
'  }\n' +
'  #scene2 { opacity: 0; animation: scene2Life 12.2s linear 4.0s forwards; }\n' +
'\n' +
'  /* Scene 3: 16.2s - 21s */\n' +
'  @keyframes scene3Life {\n' +
'    0% { opacity: 0; }\n' +
'    3% { opacity: 1; }\n' +
'    96% { opacity: 1; }\n' +
'    100% { opacity: 0; }\n' +
'  }\n' +
'  #scene3 { opacity: 0; animation: scene3Life 4.8s linear 16.2s forwards; }\n' +
'\n' +
'  /* Scene 4: 21s - 24s */\n' +
'  @keyframes scene4Life {\n' +
'    0% { opacity: 0; }\n' +
'    3% { opacity: 1; }\n' +
'    100% { opacity: 1; }\n' +
'  }\n' +
'  #scene4 { opacity: 0; animation: scene4Life 3s linear 21.0s forwards; }\n' +
'\n' +
'  /* === LETTER FALL ANIMATIONS (Scene 1 title) === */\n' +
titleManilaCSS + '\n' +
titleSubCSS + '\n' +
'  .scene1-sub { opacity: 0; animation: fadeIn 0.5s ease-out 2.5s forwards; }\n' +
'\n' +
'  /* === LINE CLEAR FLASH (Scene 1 bottom rows) === */\n' +
'  @keyframes lineClear1 {\n' +
'    0% { opacity: 0; }\n' +
'    10% { opacity: 0.9; background: #fff; }\n' +
'    50% { opacity: 0.9; background: #fff; }\n' +
'    100% { opacity: 0; }\n' +
'  }\n' +
'  .line-clear-1 {\n' +
'    position: absolute;\n' +
'    left: ' + GRID_LEFT + 'px;\n' +
'    bottom: ' + (HEIGHT - GRID_TOP - GRID_H) + 'px;\n' +
'    width: ' + GRID_W + 'px;\n' +
'    height: ' + (CELL * 2 + 4) + 'px;\n' +
'    z-index: 15;\n' +
'    pointer-events: none;\n' +
'    opacity: 0;\n' +
'    animation: lineClear1 0.6s ease-out ' + LINE_CLEAR_1_TIME + 's forwards;\n' +
'  }\n' +
'\n' +
'  /* === FALLING PIECES (Scene 1) === */\n' +
pieceCSS + '\n' +
'\n' +
'  /* === PHOTO ANIMATIONS (Scene 2) === */\n' +
photoCSS + '\n' +
'\n' +
'  /* === STEP ANIMATIONS (Scene 3) === */\n' +
stepCSS + '\n' +
'\n' +
'  /* === SCORE COUNTER === */\n' +
scoreCss + '\n' +
'\n' +
'  /* === CTA BLOCK STACKS === */\n' +
ctaBlockCSS + '\n' +
'\n' +
'  /* === CTA ELEMENTS === */\n' +
'  .cta-handle { opacity: 0; animation: fadeIn 0.6s ease-out 21.8s forwards; }\n' +
'  .cta-sub { opacity: 0; animation: fadeIn 0.5s ease-out 22.2s forwards; }\n' +
'  .cta-btn { opacity: 0; animation: fadeIn 0.5s ease-out 22.6s forwards, ctaGlow 1.5s ease-in-out 23.1s infinite; }\n' +
'  .cta-limited { opacity: 0; animation: fadeIn 0.5s ease-out 23.0s forwards, pulseText 1.8s ease-in-out 23.5s infinite; }\n' +
'\n' +
'  /* Full screen flash at scene 4 start */\n' +
'  .full-flash {\n' +
'    position: absolute;\n' +
'    inset: 0;\n' +
'    background: #fff;\n' +
'    z-index: 50;\n' +
'    opacity: 0;\n' +
'    pointer-events: none;\n' +
'    animation: fullFlash 0.8s ease-out 21.0s forwards;\n' +
'  }\n' +
'</style>\n' +
'</head>\n' +
'<body>\n' +
'  <div id="root" style="width:' + WIDTH + 'px;height:' + HEIGHT + 'px;position:relative;overflow:hidden;background:#0a0a0a;">\n' +
'\n' +
'    <!-- Tetris grid overlay -- always visible -->\n' +
'    <div class="tetris-grid"></div>\n' +
'\n' +
'    <!-- CRT scanlines -->\n' +
'    <div style="position:absolute;inset:0;z-index:100;pointer-events:none;background:repeating-linear-gradient(0deg,rgba(0,0,0,0.1) 0px,rgba(0,0,0,0.1) 1px,transparent 1px,transparent 3px);"></div>\n' +
'\n' +
'    <!-- === HEADER: Score / Level / Game Title === -->\n' +
'    <div style="position:absolute;top:' + SAFE_TOP + 'px;left:' + SAFE_LEFT + 'px;right:' + (WIDTH - SAFE_RIGHT) + 'px;z-index:55;padding:8px 0;display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid rgba(255,255,255,0.15);opacity:0;animation:fadeIn 0.4s ease-out 0.1s forwards;">\n' +
'      <div>\n' +
'        <div style="font-size:14px;color:rgba(255,255,255,0.35);letter-spacing:3px;">SCORE</div>\n' +
'        <div style="font-size:24px;font-weight:900;color:#00f0f0;letter-spacing:2px;position:relative;min-width:120px;">' + scoreHtml + '</div>\n' +
'      </div>\n' +
'      <div style="text-align:center;">\n' +
'        <div style="font-size:18px;font-weight:900;color:#00f0f0;letter-spacing:3px;text-shadow:0 0 12px rgba(0,240,240,0.5);">MANILA FREE PHOTO SHOOT</div>\n' +
'      </div>\n' +
'      <div style="text-align:right;">\n' +
'        <div style="font-size:14px;color:rgba(255,255,255,0.35);letter-spacing:3px;">LEVEL</div>\n' +
'        <div style="font-size:24px;font-weight:900;color:#f0a000;letter-spacing:2px;">1</div>\n' +
'      </div>\n' +
'    </div>\n' +
'\n' +
'    <!-- ========== SCENE 1: THE GAME STARTS (0-4s) ========== -->\n' +
'    <div id="scene1" style="position:absolute;left:' + GRID_LEFT + 'px;top:' + GRID_TOP + 'px;width:' + GRID_W + 'px;height:' + GRID_H + 'px;z-index:10;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;">\n' +
'\n' +
'      <!-- BIG TITLE: Manila Free Photo Shoot -->\n' +
'      <div style="text-align:center;margin-bottom:10px;">\n' +
'        <div style="font-family:' + MONO + ';font-size:70px;font-weight:900;color:#fff;letter-spacing:6px;text-shadow:0 0 30px rgba(0,240,240,0.7),0 0 60px rgba(0,240,240,0.3),4px 4px 0 rgba(0,0,0,0.8);line-height:1.15;">MANILA</div>\n' +
'        <div style="font-family:' + MONO + ';font-size:50px;font-weight:900;color:#f0f000;letter-spacing:4px;text-shadow:0 0 20px rgba(240,240,0,0.6),3px 3px 0 rgba(0,0,0,0.8);line-height:1.3;">FREE PHOTO</div>\n' +
'        <div style="font-family:' + MONO + ';font-size:50px;font-weight:900;color:#f0f000;letter-spacing:4px;text-shadow:0 0 20px rgba(240,240,0,0.6),3px 3px 0 rgba(0,0,0,0.8);line-height:1.3;">SHOOT</div>\n' +
'      </div>\n' +
'\n' +
'      <!-- Title letters falling like Tetris pieces -- BIGGER -->\n' +
'      <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center;">\n' +
manilaLettersHTML + '\n' +
'      </div>\n' +
'\n' +
'      <!-- Subtitle words -- BIGGER -->\n' +
'      <div style="display:flex;gap:4px;flex-wrap:wrap;justify-content:center;">\n' +
subLettersHTML + '\n' +
'      </div>\n' +
'\n' +
'      <!-- Score: FREE text -->\n' +
'      <div class="scene1-sub" style="margin-top:16px;font-size:28px;color:#f0f000;letter-spacing:4px;text-shadow:0 0 12px rgba(240,240,0,0.4);">NO EXPERIENCE NEEDED</div>\n' +
'    </div>\n' +
'\n' +
'    <!-- Falling pieces (Scene 1) -->\n' +
pieceHTML + '\n' +
'\n' +
'    <!-- Line clear flash (Scene 1) -->\n' +
'    <div class="line-clear-1"></div>\n' +
'\n' +
'    <!-- ========== SCENE 2: PHOTOS AS COMPLETED ROWS (4-16s) ========== -->\n' +
'    <div id="scene2" style="position:absolute;left:' + GRID_LEFT + 'px;top:' + GRID_TOP + 'px;width:' + GRID_W + 'px;height:' + GRID_H + 'px;z-index:10;">\n' +
'      <div style="position:absolute;top:8px;left:0;right:0;text-align:center;font-size:18px;color:rgba(255,255,255,0.35);letter-spacing:5px;z-index:2;">PORTFOLIO</div>\n' +
'      <div style="position:absolute;top:50px;left:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center;">\n' +
photoHTML + '\n' +
'      </div>\n' +
'    </div>\n' +
'\n' +
'    <!-- ========== SCENE 3: STEPS AS FALLING PIECES (16-21s) ========== -->\n' +
'    <div id="scene3" style="position:absolute;left:' + GRID_LEFT + 'px;top:' + GRID_TOP + 'px;width:' + GRID_W + 'px;height:' + GRID_H + 'px;z-index:10;">\n' +
'      <div style="position:absolute;top:120px;left:0;right:0;text-align:center;">\n' +
'        <div style="font-size:20px;color:rgba(255,255,255,0.3);letter-spacing:6px;opacity:0;animation:fadeIn 0.4s ease-out 16.3s forwards;">HOW IT WORKS</div>\n' +
'      </div>\n' +
stepHTML + '\n' +
'    </div>\n' +
'\n' +
'    <!-- ========== FULL SCREEN FLASH (21s transition) ========== -->\n' +
'    <div class="full-flash"></div>\n' +
'\n' +
'    <!-- ========== SCENE 4: CTA (21-24s) ========== -->\n' +
'    <div id="scene4" style="position:absolute;left:' + GRID_LEFT + 'px;top:' + GRID_TOP + 'px;width:' + GRID_W + 'px;height:' + GRID_H + 'px;z-index:10;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;">\n' +
'\n' +
'      <!-- Side block stacks (left) -->\n' +
'      <div style="position:absolute;left:0;bottom:0;width:' + CELL + 'px;display:flex;flex-direction:column-reverse;">\n' +
ctaLeftBlocks + '\n' +
'      </div>\n' +
'\n' +
'      <!-- Side block stacks (right) -->\n' +
'      <div style="position:absolute;right:0;bottom:0;width:' + CELL + 'px;display:flex;flex-direction:column-reverse;">\n' +
ctaRightBlocks + '\n' +
'      </div>\n' +
'\n' +
'      <!-- @madebyaidan -->\n' +
'      <div class="cta-handle" style="font-size:56px;font-weight:900;color:#fff;text-align:center;text-shadow:0 0 25px rgba(0,240,240,0.5);">@madebyaidan</div>\n' +
'\n' +
'      <!-- on Instagram -->\n' +
'      <div class="cta-sub" style="font-size:28px;color:rgba(255,255,255,0.45);text-align:center;">on Instagram</div>\n' +
'\n' +
'      <!-- DM button -->\n' +
'      <div class="cta-btn" style="margin-top:20px;padding:24px 70px;' + bevelStyle('#00f0f0') + 'font-size:40px;font-weight:900;color:#000;text-align:center;letter-spacing:4px;">SEND ME A DM</div>\n' +
'\n' +
'      <!-- Limited spots -->\n' +
'      <div class="cta-limited" style="margin-top:28px;font-size:26px;color:#f00000;text-align:center;letter-spacing:3px;text-shadow:0 0 10px rgba(240,0,0,0.4);">LIMITED SPOTS</div>\n' +
'    </div>\n' +
'\n' +
'  </div>\n' +
'\n' +
'  <script>\n' +
'    // All animation is pure CSS keyframes -- no JS animation loops.\n' +
'  </script>\n' +
'</body>\n' +
'</html>'
}

async function render() {
  resetOutputDir()

  const imageDataMap = {}
  for (const photo of PROOF_PHOTOS) {
    imageDataMap[photo] = readImage(photo)
  }

  writeSources({
    createdAt: new Date().toISOString(),
    strategy: 'v31d — Bigger title, bigger falling blocks, better photo framing (object-fit:contain), 1.5s per photo',
    safeBottomPixels: SAFE_BOTTOM,
    photos: PROOF_PHOTOS,
  })

  const browser = await chromium.launch()
  console.log('Recording Tetris-themed reel (v31d — bigger title + blocks + better photos)...')

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
  const dstVideo = path.join(OUT_DIR, 'manila-tetris-v31d.mp4')

  const { execSync } = await import('child_process')
  try {
    execSync('ffmpeg -y -i "' + srcVideo + '" -c:v libx264 -pix_fmt yuv420p -r 30 -an "' + dstVideo + '"', { stdio: 'pipe' })
    fs.unlinkSync(srcVideo)
    console.log('Rendered manila-tetris-v31d.mp4')
  } catch (err) {
    console.warn('ffmpeg not available, keeping as webm...')
    fs.renameSync(srcVideo, dstVideo)
  }

  console.log('Done: output written to ' + OUT_DIR)
}

render().catch(error => {
  console.error(error)
  process.exit(1)
})
