import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-33c')

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

/* ──────────────────────────────────────────────────────────────
   Build full HTML — ALL animation is CSS @keyframes + setTimeout
   NO requestAnimationFrame, NO canvas, NO game loops
   ZOOMED IN — blocks are 80px, everything close-up 1:1 pixel scale
   ────────────────────────────────────────────────────────────── */
function buildHTML(imageDataMap) {
  const photoSrcs = JSON.stringify(PROOF_PHOTOS.map(p => imageDataMap[p]))

  const GROUND_HEIGHT = 320 // big chunky ground
  const BRICK_SIZE = 80
  const PIPE_W = 200
  const BLOCK_SIZE = 80

  // The world container is much wider than the viewport, scrolls left
  const WORLD_W = 8000

  return `<!DOCTYPE html>
<html>
<head>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    margin: 0; padding: 0;
    background: #5c94fc;
    font-family: ${MONO};
    overflow: hidden;
    width: ${WIDTH}px;
    height: ${HEIGHT}px;
  }

  #root {
    width: ${WIDTH}px;
    height: ${HEIGHT}px;
    position: relative;
    overflow: hidden;
    background: #5c94fc;
  }

  /* ═══ WORLD CONTAINER — scrolls left like Mario running right ═══ */
  #world {
    position: absolute;
    top: 0;
    left: 0;
    width: ${WORLD_W}px;
    height: ${HEIGHT}px;
    animation: worldScroll 13s linear forwards;
    will-change: transform;
  }

  @keyframes worldScroll {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-${WORLD_W - WIDTH}px); }
  }

  /* ═══ GROUND — big chunky bricks ═══ */
  #ground {
    position: absolute;
    bottom: 0;
    left: 0;
    width: ${WORLD_W}px;
    height: ${GROUND_HEIGHT}px;
    display: flex;
    flex-wrap: wrap;
    z-index: 5;
  }
  .brick {
    width: ${BRICK_SIZE}px;
    height: ${BRICK_SIZE}px;
    background: #c84c0c;
    border: 4px solid #e8a060;
    border-top-color: #f8d8b0;
    border-left-color: #f8d8b0;
    border-bottom-color: #703010;
    border-right-color: #703010;
    flex-shrink: 0;
  }
  /* Inner brick pattern lines */
  .brick::before {
    content: '';
    display: block;
    width: 100%;
    height: 50%;
    border-bottom: 3px solid #703010;
    box-sizing: border-box;
  }
  .brick::after {
    content: '';
    display: block;
    width: 50%;
    height: 50%;
    border-right: 3px solid #703010;
    box-sizing: border-box;
  }

  /* ═══ PIPE ═══ */
  .pipe {
    position: absolute;
    z-index: 6;
  }
  .pipe-rim {
    width: ${PIPE_W}px;
    height: 60px;
    background: #00a800;
    border: 6px solid #005800;
    border-top-color: #80f880;
    border-left-color: #80f880;
  }
  .pipe-rim::before {
    content: '';
    display: block;
    position: absolute;
    top: 10px;
    left: 20px;
    width: 40px;
    height: 40px;
    background: rgba(255,255,255,0.12);
    border-radius: 0;
  }
  .pipe-body-part {
    width: ${PIPE_W - 40}px;
    background: #00a800;
    border: 6px solid #005800;
    border-left-color: #80f880;
    margin-left: 20px;
  }
  /* Light stripe on pipe */
  .pipe-body-part::before {
    content: '';
    display: block;
    width: 16px;
    height: 100%;
    background: rgba(255,255,255,0.1);
    margin-left: 10px;
  }

  /* ═══ QUESTION BLOCK — big and detailed ═══ */
  .qblock {
    width: ${BLOCK_SIZE}px;
    height: ${BLOCK_SIZE}px;
    background: #FAA005;
    border: 6px solid #f8d878;
    border-bottom-color: #885808;
    border-right-color: #885808;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 48px;
    font-weight: 900;
    color: #fff;
    text-shadow: 3px 3px 0 #885808;
    font-family: ${MONO};
    position: absolute;
    z-index: 8;
  }
  /* Inner border detail */
  .qblock::before {
    content: '';
    position: absolute;
    inset: 4px;
    border: 3px solid #c87800;
    pointer-events: none;
  }
  .qblock.used {
    background: #885808;
    border-color: #6a4408;
    color: transparent;
    text-shadow: none;
  }
  .qblock.used::before {
    border-color: #5a3808;
  }
  .qblock.bounce {
    animation: blockBounce 0.4s ease-out;
  }

  /* ═══ CLOUD — big chunky NES clouds ═══ */
  .cloud {
    position: absolute;
    z-index: 1;
  }

  /* ═══ BUSH — decorative ground bushes ═══ */
  .bush {
    position: absolute;
    z-index: 4;
  }
  .bush-body {
    background: #00a800;
    border-radius: 50%;
    position: absolute;
  }

  /* ═══ KEYFRAME ANIMATIONS ═══ */

  @keyframes blockBounce {
    0%   { transform: translateY(0); }
    30%  { transform: translateY(-30px); }
    60%  { transform: translateY(0); }
    80%  { transform: translateY(-12px); }
    100% { transform: translateY(0); }
  }

  @keyframes coinPop {
    0%   { opacity: 1; transform: translateY(0) scaleX(1); }
    25%  { opacity: 1; transform: translateY(-120px) scaleX(0.3); }
    50%  { opacity: 1; transform: translateY(-160px) scaleX(1); }
    75%  { opacity: 0.7; transform: translateY(-120px) scaleX(0.3); }
    100% { opacity: 0; transform: translateY(-80px) scaleX(1); }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(60px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-50px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes popIn {
    0%   { opacity: 0; transform: scale(0.3); }
    60%  { opacity: 1; transform: scale(1.1); }
    100% { opacity: 1; transform: scale(1); }
  }

  @keyframes photoExpand {
    0%   { opacity: 0; transform: scale(0) translateY(-40px); }
    50%  { opacity: 1; transform: scale(1.05) translateY(-20px); }
    100% { opacity: 1; transform: scale(1) translateY(0); }
  }

  @keyframes photoShrink {
    0%   { opacity: 1; transform: scale(1); }
    100% { opacity: 0; transform: scale(0.3) translateY(40px); }
  }

  @keyframes starPulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%      { opacity: 0.5; transform: scale(1.15); }
  }

  @keyframes flashBig {
    0%   { opacity: 0; transform: scale(1.4); }
    40%  { opacity: 1; transform: scale(0.95); }
    100% { opacity: 1; transform: scale(1); }
  }

  @keyframes powerUpRise {
    0%   { transform: translateY(100px); opacity: 0; }
    30%  { opacity: 1; }
    100% { transform: translateY(0); opacity: 1; }
  }

  @keyframes coinSpin {
    0%   { transform: scaleX(1); }
    25%  { transform: scaleX(0.2); }
    50%  { transform: scaleX(1); }
    75%  { transform: scaleX(0.2); }
    100% { transform: scaleX(1); }
  }

  @keyframes flagDrop {
    0%   { transform: translateY(-100%); }
    100% { transform: translateY(0); }
  }

  @keyframes blinkText {
    0%, 100% { opacity: 1; }
    50%      { opacity: 0; }
  }

  /* ═══ HUD ═══ */
  .coin-hud {
    width: 22px; height: 26px;
    border-radius: 50%;
    background: linear-gradient(135deg, #ffd700, #ffaa00);
    border: 2px solid #c88000;
    display: inline-block;
    vertical-align: middle;
    margin-right: 4px;
    animation: coinSpin 1.2s linear infinite;
  }

  /* ═══ OVERLAY SCENES (on top of world) ═══ */
  .overlay-scene {
    position: absolute;
    top: 0;
    left: 0;
    width: ${WIDTH}px;
    height: ${HEIGHT}px;
    z-index: 30;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    opacity: 0;
    pointer-events: none;
  }
  .overlay-scene.active {
    opacity: 1;
  }

  /* ═══ PHOTO POPUP ═══ */
  #photo-popup {
    position: absolute;
    z-index: 40;
    top: ${SAFE_TOP + 120}px;
    left: ${SAFE_LEFT + 30}px;
    width: ${SAFE_RIGHT - SAFE_LEFT - 60}px;
    height: ${HEIGHT - SAFE_TOP - SAFE_BOTTOM - 200}px;
    opacity: 0;
    pointer-events: none;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  #photo-popup img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border: 8px solid #FAA005;
    box-shadow: 6px 6px 0 rgba(0,0,0,0.5), 0 0 0 4px #885808;
  }
  #photo-popup.show {
    opacity: 1;
    animation: photoExpand 0.5s ease-out forwards;
  }
  #photo-popup.hide {
    animation: photoShrink 0.3s ease-in forwards;
  }

  /* ═══ POWER-UP ITEMS ═══ */
  .powerup-item {
    position: absolute;
    z-index: 35;
    opacity: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }
  .powerup-item.rise {
    animation: powerUpRise 0.7s ease-out forwards;
  }
  .mushroom {
    width: 120px; height: 120px;
    position: relative;
  }
  .mushroom-cap {
    width: 120px; height: 60px;
    background: #ff0000;
    border-radius: 60px 60px 0 0;
    border: 5px solid #800000;
    position: relative;
    overflow: hidden;
  }
  .mushroom-cap::before {
    content: '';
    position: absolute;
    top: 10px; left: 20px;
    width: 30px; height: 30px;
    background: #fff;
    border-radius: 50%;
  }
  .mushroom-cap::after {
    content: '';
    position: absolute;
    top: 8px; right: 18px;
    width: 24px; height: 24px;
    background: #fff;
    border-radius: 50%;
  }
  .mushroom-stem {
    width: 70px; height: 60px;
    background: #f8d8b0;
    border: 5px solid #c88000;
    margin: 0 auto;
    border-radius: 0 0 10px 10px;
  }

  .fireflower {
    width: 100px; height: 120px;
    position: relative;
  }
  .flower-head {
    width: 80px; height: 80px;
    position: relative;
    margin: 0 auto;
  }
  .flower-petal {
    width: 36px; height: 36px;
    background: #ff6600;
    border: 3px solid #cc3300;
    border-radius: 50%;
    position: absolute;
  }
  .flower-center {
    width: 30px; height: 30px;
    background: #ffd700;
    border: 3px solid #c88000;
    border-radius: 50%;
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1;
  }
  .flower-stem {
    width: 14px; height: 50px;
    background: #00a800;
    border: 3px solid #005800;
    margin: 0 auto;
  }

  .star {
    width: 110px; height: 110px;
    position: relative;
  }
  .star-body {
    width: 100px; height: 100px;
    background: #ffd700;
    border: 5px solid #c88000;
    clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
    margin: 0 auto;
  }
  .star-eyes {
    position: absolute;
    top: 40px; left: 50%;
    transform: translateX(-50%);
    width: 40px;
    display: flex;
    justify-content: space-between;
  }
  .star-eye {
    width: 10px; height: 12px;
    background: #000;
    border-radius: 50%;
  }

  .powerup-label {
    font-size: 34px;
    font-weight: 900;
    color: #fff;
    text-shadow: 3px 3px 0 #000;
    letter-spacing: 3px;
    text-transform: uppercase;
    text-align: center;
    white-space: nowrap;
  }

  /* ═══ FLAGPOLE ═══ */
  .flagpole {
    position: absolute;
    z-index: 7;
  }
  .flagpole-pole {
    width: 12px;
    background: #888;
    border: 2px solid #555;
    margin: 0 auto;
  }
  .flagpole-ball {
    width: 28px; height: 28px;
    background: #00a800;
    border: 3px solid #005800;
    border-radius: 50%;
    margin: 0 auto;
  }
  .flagpole-flag {
    width: 80px; height: 60px;
    background: #00a800;
    border: 3px solid #005800;
    position: absolute;
    top: 28px; left: 16px;
  }

</style>
</head>
<body>
<div id="root">

  <!-- ═══ HUD (always visible, on top of everything) ═══ -->
  <div id="hud" style="position:absolute;top:${SAFE_TOP}px;left:${SAFE_LEFT}px;right:${WIDTH - SAFE_RIGHT}px;z-index:50;padding:8px 0;">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;font-size:17px;letter-spacing:3px;text-transform:uppercase;color:#fff;text-shadow:2px 2px 0 #000;">
      <div style="text-align:center;">
        <div style="font-size:14px;color:#fff;">AIDAN</div>
        <div id="hud-score" style="font-size:17px;font-weight:700;">000000</div>
      </div>
      <div style="text-align:center;">
        <div style="font-size:14px;">COINS</div>
        <div style="font-size:17px;font-weight:700;"><span class="coin-hud"></span>x<span id="hud-coins">00</span></div>
      </div>
      <div style="text-align:center;">
        <div style="font-size:14px;">WORLD</div>
        <div style="font-size:17px;font-weight:700;">1-1</div>
      </div>
      <div style="text-align:center;">
        <div style="font-size:14px;">TIME</div>
        <div id="hud-time" style="font-size:17px;font-weight:700;">400</div>
      </div>
    </div>
  </div>

  <!-- ═══ PERSISTENT TITLE (HUD-style) ═══ -->
  <div id="persistent-title" style="position:absolute;top:${SAFE_TOP + 62}px;left:${SAFE_LEFT}px;right:${WIDTH - SAFE_RIGHT}px;z-index:50;text-align:center;font-family:${MONO};font-size:24px;font-weight:900;letter-spacing:4px;text-transform:uppercase;color:#facc15;text-shadow:3px 3px 0 #000,-1px -1px 0 #000;">
    MANILA FREE PHOTO SHOOT
  </div>

  <!-- ═══ WORLD CONTAINER — scrolls horizontally ═══ -->
  <div id="world">

    <!-- GROUND: rows of big bricks -->
    <div id="ground">
      ${Array(Math.ceil(WORLD_W / BRICK_SIZE) * Math.ceil(GROUND_HEIGHT / BRICK_SIZE)).fill(0).map(() => `<div class="brick"></div>`).join('')}
    </div>

    <!-- CLOUDS — big, close up -->
    <div class="cloud" style="top:${SAFE_TOP + 100}px;left:100px;">
      <div style="width:200px;height:80px;background:#fff;border-radius:40px;position:relative;">
        <div style="width:100px;height:60px;background:#fff;border-radius:30px;position:absolute;top:-35px;left:20px;"></div>
        <div style="width:130px;height:70px;background:#fff;border-radius:35px;position:absolute;top:-45px;left:55px;"></div>
      </div>
    </div>
    <div class="cloud" style="top:${SAFE_TOP + 300}px;left:900px;">
      <div style="width:240px;height:90px;background:#fff;border-radius:45px;position:relative;">
        <div style="width:120px;height:70px;background:#fff;border-radius:35px;position:absolute;top:-40px;left:30px;"></div>
        <div style="width:150px;height:80px;background:#fff;border-radius:40px;position:absolute;top:-50px;left:80px;"></div>
      </div>
    </div>
    <div class="cloud" style="top:${SAFE_TOP + 160}px;left:1800px;">
      <div style="width:180px;height:70px;background:#fff;border-radius:35px;position:relative;">
        <div style="width:90px;height:50px;background:#fff;border-radius:25px;position:absolute;top:-30px;left:40px;"></div>
      </div>
    </div>
    <div class="cloud" style="top:${SAFE_TOP + 400}px;left:2800px;">
      <div style="width:220px;height:85px;background:#fff;border-radius:42px;position:relative;">
        <div style="width:110px;height:65px;background:#fff;border-radius:32px;position:absolute;top:-38px;left:25px;"></div>
        <div style="width:140px;height:75px;background:#fff;border-radius:37px;position:absolute;top:-48px;left:70px;"></div>
      </div>
    </div>
    <div class="cloud" style="top:${SAFE_TOP + 200}px;left:4000px;">
      <div style="width:190px;height:75px;background:#fff;border-radius:37px;position:relative;">
        <div style="width:95px;height:55px;background:#fff;border-radius:27px;position:absolute;top:-32px;left:35px;"></div>
        <div style="width:120px;height:65px;background:#fff;border-radius:32px;position:absolute;top:-42px;left:60px;"></div>
      </div>
    </div>
    <div class="cloud" style="top:${SAFE_TOP + 350}px;left:5200px;">
      <div style="width:250px;height:95px;background:#fff;border-radius:47px;position:relative;">
        <div style="width:125px;height:72px;background:#fff;border-radius:36px;position:absolute;top:-42px;left:35px;"></div>
        <div style="width:155px;height:82px;background:#fff;border-radius:41px;position:absolute;top:-52px;left:85px;"></div>
      </div>
    </div>

    <!-- BUSHES -->
    <div class="bush" style="bottom:${GROUND_HEIGHT}px;left:250px;">
      <div style="width:160px;height:60px;background:#00a800;border-radius:50%;border:4px solid #005800;position:relative;">
        <div style="width:80px;height:40px;background:#00a800;border-radius:50%;border:3px solid #005800;position:absolute;top:-20px;left:35px;"></div>
      </div>
    </div>
    <div class="bush" style="bottom:${GROUND_HEIGHT}px;left:1600px;">
      <div style="width:200px;height:70px;background:#00a800;border-radius:50%;border:4px solid #005800;position:relative;">
        <div style="width:100px;height:50px;background:#00a800;border-radius:50%;border:3px solid #005800;position:absolute;top:-25px;left:20px;"></div>
        <div style="width:80px;height:40px;background:#00a800;border-radius:50%;border:3px solid #005800;position:absolute;top:-22px;left:90px;"></div>
      </div>
    </div>
    <div class="bush" style="bottom:${GROUND_HEIGHT}px;left:3400px;">
      <div style="width:140px;height:55px;background:#00a800;border-radius:50%;border:4px solid #005800;position:relative;">
        <div style="width:70px;height:35px;background:#00a800;border-radius:50%;border:3px solid #005800;position:absolute;top:-18px;left:30px;"></div>
      </div>
    </div>

    <!-- PIPE 1 (visible at start, left side) -->
    <div class="pipe" id="pipe1" style="bottom:${GROUND_HEIGHT}px;left:500px;">
      <div class="pipe-rim"></div>
      <div class="pipe-body-part" style="height:140px;"></div>
    </div>

    <!-- PIPE 2 -->
    <div class="pipe" id="pipe2" style="bottom:${GROUND_HEIGHT}px;left:1400px;">
      <div class="pipe-rim"></div>
      <div class="pipe-body-part" style="height:200px;"></div>
    </div>

    <!-- PIPE 3 (for power-ups) -->
    <div class="pipe" id="pipe3" style="bottom:${GROUND_HEIGHT}px;left:3800px;">
      <div class="pipe-rim"></div>
      <div class="pipe-body-part" style="height:160px;"></div>
    </div>

    <!-- PIPE 4 (for power-ups) -->
    <div class="pipe" id="pipe4" style="bottom:${GROUND_HEIGHT}px;left:4600px;">
      <div class="pipe-rim"></div>
      <div class="pipe-body-part" style="height:180px;"></div>
    </div>

    <!-- PIPE 5 (for power-ups) -->
    <div class="pipe" id="pipe5" style="bottom:${GROUND_HEIGHT}px;left:5400px;">
      <div class="pipe-rim"></div>
      <div class="pipe-body-part" style="height:200px;"></div>
    </div>

    <!-- QUESTION BLOCKS — scattered through world, big and detailed -->
    <div class="qblock" id="qb1" style="bottom:${GROUND_HEIGHT + 250}px;left:200px;">?</div>
    <div class="qblock" id="qb2" style="bottom:${GROUND_HEIGHT + 250}px;left:750px;">?</div>
    <div class="qblock" id="qb3" style="bottom:${GROUND_HEIGHT + 250}px;left:1100px;">?</div>
    <div class="qblock" id="qb4" style="bottom:${GROUND_HEIGHT + 250}px;left:1700px;">?</div>
    <div class="qblock" id="qb5" style="bottom:${GROUND_HEIGHT + 250}px;left:2200px;">?</div>
    <div class="qblock" id="qb6" style="bottom:${GROUND_HEIGHT + 250}px;left:2700px;">?</div>
    <div class="qblock" id="qb7" style="bottom:${GROUND_HEIGHT + 250}px;left:3100px;">?</div>
    <div class="qblock" id="qb8" style="bottom:${GROUND_HEIGHT + 250}px;left:3500px;">?</div>

    <!-- Brick blocks (decoration, scattered) -->
    <div style="position:absolute;bottom:${GROUND_HEIGHT + 250}px;left:300px;display:flex;z-index:3;">
      <div class="brick" style="width:${BLOCK_SIZE}px;height:${BLOCK_SIZE}px;"></div>
      <div class="brick" style="width:${BLOCK_SIZE}px;height:${BLOCK_SIZE}px;"></div>
    </div>
    <div style="position:absolute;bottom:${GROUND_HEIGHT + 250}px;left:1200px;display:flex;z-index:3;">
      <div class="brick" style="width:${BLOCK_SIZE}px;height:${BLOCK_SIZE}px;"></div>
    </div>
    <div style="position:absolute;bottom:${GROUND_HEIGHT + 250}px;left:1850px;display:flex;z-index:3;">
      <div class="brick" style="width:${BLOCK_SIZE}px;height:${BLOCK_SIZE}px;"></div>
      <div class="brick" style="width:${BLOCK_SIZE}px;height:${BLOCK_SIZE}px;"></div>
      <div class="brick" style="width:${BLOCK_SIZE}px;height:${BLOCK_SIZE}px;"></div>
    </div>
    <div style="position:absolute;bottom:${GROUND_HEIGHT + 250}px;left:2800px;display:flex;z-index:3;">
      <div class="brick" style="width:${BLOCK_SIZE}px;height:${BLOCK_SIZE}px;"></div>
      <div class="brick" style="width:${BLOCK_SIZE}px;height:${BLOCK_SIZE}px;"></div>
    </div>

    <!-- Staircase near end (for flagpole) -->
    ${[0,1,2,3,4,5,6,7].map(i => `
    <div style="position:absolute;bottom:${GROUND_HEIGHT + i * BLOCK_SIZE}px;left:${6600 + (7 - i) * BLOCK_SIZE}px;display:flex;z-index:4;">
      ${Array(i + 1).fill(0).map(() => `<div class="brick" style="width:${BLOCK_SIZE}px;height:${BLOCK_SIZE}px;"></div>`).join('')}
    </div>
    `).join('')}

    <!-- FLAGPOLE -->
    <div class="flagpole" style="bottom:${GROUND_HEIGHT}px;left:7300px;">
      <div class="flagpole-ball"></div>
      <div class="flagpole-pole" style="height:700px;"></div>
      <div class="flagpole-flag" id="the-flag" style="transform:translateY(-100%);">
        <div style="width:100%;height:100%;background:#00a800;display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;font-weight:900;text-shadow:1px 1px 0 #005800;">CLEAR</div>
      </div>
    </div>

  </div><!-- /world -->

  <!-- ═══ PHOTO POPUP (overlays on top of world) ═══ -->
  <div id="photo-popup">
    <img id="photo-popup-img" src="" alt="" />
  </div>

  <!-- ═══ SCENE: POWER-UPS (steps) — overlays ═══ -->
  <div class="powerup-item" id="powerup1" style="left:${WIDTH/2 - 140}px;top:${HEIGHT/2 - 200}px;">
    <div class="mushroom">
      <div class="mushroom-cap"></div>
      <div class="mushroom-stem"></div>
    </div>
    <div class="powerup-label">1. DM ME</div>
  </div>

  <div class="powerup-item" id="powerup2" style="left:${WIDTH/2 - 120}px;top:${HEIGHT/2 - 200}px;">
    <div class="fireflower">
      <div class="flower-head">
        <div class="flower-petal" style="top:0;left:50%;transform:translateX(-50%);"></div>
        <div class="flower-petal" style="bottom:0;left:50%;transform:translateX(-50%);"></div>
        <div class="flower-petal" style="top:50%;left:0;transform:translateY(-50%);"></div>
        <div class="flower-petal" style="top:50%;right:0;transform:translateY(-50%);"></div>
        <div class="flower-center"></div>
      </div>
      <div class="flower-stem"></div>
    </div>
    <div class="powerup-label">2. PICK A DATE</div>
  </div>

  <div class="powerup-item" id="powerup3" style="left:${WIDTH/2 - 130}px;top:${HEIGHT/2 - 200}px;">
    <div class="star">
      <div class="star-body"></div>
      <div class="star-eyes">
        <div class="star-eye"></div>
        <div class="star-eye"></div>
      </div>
    </div>
    <div class="powerup-label">3. SHOW UP</div>
  </div>

  <!-- ═══ SCENE 4: CTA OVERLAY ═══ -->
  <div class="overlay-scene" id="scene-cta">
    <div style="background:rgba(0,0,0,0.7);position:absolute;inset:0;z-index:0;"></div>
    <div style="position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;gap:16px;padding:0 ${SAFE_LEFT + 30}px;">

      <div id="cta-clear" style="opacity:0;font-size:52px;font-weight:900;color:#facc15;text-shadow:4px 4px 0 #000;letter-spacing:6px;text-transform:uppercase;text-align:center;margin-top:${SAFE_TOP + 80}px;">
        COURSE CLEAR!
      </div>

      <div id="cta-score" style="opacity:0;font-size:24px;color:#fff;text-shadow:2px 2px 0 #000;letter-spacing:3px;text-align:center;margin-top:8px;">
        TIME BONUS: 5000
      </div>

      <div id="cta-handle" style="opacity:0;margin-top:30px;text-align:center;">
        <div style="font-size:56px;font-weight:900;color:#fff;text-shadow:5px 5px 0 #000;letter-spacing:4px;">@madebyaidan</div>
        <div style="font-size:24px;color:rgba(255,255,255,0.85);text-shadow:2px 2px 0 #000;margin-top:8px;letter-spacing:2px;">on Instagram.</div>
      </div>

      <div id="cta-dm" style="opacity:0;margin-top:30px;text-align:center;">
        <div style="display:inline-block;background:#00a800;border:6px solid #005800;padding:20px 56px;box-shadow:5px 5px 0 rgba(0,0,0,0.4);">
          <span style="font-size:38px;font-weight:900;color:#fff;text-shadow:3px 3px 0 #005800;letter-spacing:5px;text-transform:uppercase;">SEND ME A DM</span>
        </div>
      </div>

      <div id="cta-limited" style="opacity:0;margin-top:20px;text-align:center;">
        <div style="font-size:24px;color:#facc15;text-shadow:2px 2px 0 #000;letter-spacing:3px;text-transform:uppercase;animation:blinkText 1s infinite;">
          LIMITED SPOTS
        </div>
      </div>

      <div id="cta-ticker" style="opacity:0;margin-top:14px;font-size:20px;color:#fff;text-shadow:2px 2px 0 #000;letter-spacing:3px;">
        SCORE: <span id="final-score">000000</span>
      </div>

    </div>
  </div>

</div><!-- /root -->

<script>
  /* ── photo data injected ── */
  const PHOTOS = ${photoSrcs};

  /* ── HUD state ── */
  let coinCount = 0;
  let score = 0;

  function updateHUD() {
    document.getElementById('hud-coins').textContent = String(coinCount).padStart(2, '0');
    document.getElementById('hud-score').textContent = String(score).padStart(6, '0');
  }
  function addCoin(n) { coinCount += (n || 1); updateHUD(); }
  function addScore(pts) { score += pts; updateHUD(); }

  /* ── Timer countdown via setInterval ── */
  let timeLeft = 400;
  const timerID = setInterval(() => {
    timeLeft = Math.max(0, timeLeft - 2);
    document.getElementById('hud-time').textContent = String(timeLeft);
  }, 120);

  /* ── Helper: bounce a question block ── */
  function bounceBlock(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add('bounce');
    setTimeout(() => {
      el.classList.remove('bounce');
      el.classList.add('used');
      el.textContent = '';
    }, 400);
  }

  /* ── Helper: spawn coin pop above element ── */
  function spawnCoinAbove(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const coin = document.createElement('div');
    coin.style.cssText = 'position:fixed;z-index:60;width:36px;height:44px;border-radius:50%;background:linear-gradient(135deg,#ffd700,#ffaa00);border:4px solid #c88000;pointer-events:none;';
    coin.style.left = (rect.left + rect.width / 2 - 18) + 'px';
    coin.style.top = (rect.top - 10) + 'px';
    coin.style.animation = 'coinPop 0.6s ease-out forwards';
    document.body.appendChild(coin);
    setTimeout(() => coin.remove(), 700);
  }

  /* ── Helper: show photo popup ── */
  function showPhoto(index, cb) {
    const popup = document.getElementById('photo-popup');
    const img = document.getElementById('photo-popup-img');
    img.src = PHOTOS[index];
    popup.className = '';
    popup.style.opacity = '1';
    popup.className = 'show';
    setTimeout(() => {
      popup.className = 'hide';
      setTimeout(() => {
        popup.style.opacity = '0';
        popup.className = '';
        if (cb) cb();
      }, 350);
    }, 900);
  }

  /* ── Helper: show power-up ── */
  function showPowerUp(id, duration) {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.opacity = '1';
    el.classList.add('rise');
    setTimeout(() => {
      el.style.opacity = '0';
      el.classList.remove('rise');
    }, duration || 1500);
  }

  /* ── Helper: animate element ── */
  function animateEl(id, animName, dur) {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.animation = animName + ' ' + (dur || '0.5s') + ' ease-out forwards';
    el.style.opacity = '1';
  }


  /* ═══════════════════════════════════════════════════
     SCENE 1 (0s – 4s): World scrolls, title visible
     Close-up pipe, bricks, clouds pass by.
     World scroll starts automatically via CSS.
     ═══════════════════════════════════════════════════ */

  // Nothing special needed — world scrolls automatically and HUD/title are persistent


  /* ═══════════════════════════════════════════════════
     SCENE 2 (4s – 13s): Question blocks bounce,
     photos pop out one at a time
     ═══════════════════════════════════════════════════ */

  const photoTimes = [4000, 5100, 6200, 7300, 8400, 9500, 10600, 11700];

  photoTimes.forEach((t, i) => {
    const qbId = 'qb' + (i + 1);
    setTimeout(() => {
      bounceBlock(qbId);
      spawnCoinAbove(qbId);
      addCoin();
      addScore(200);
      /* Show photo after block bounce */
      setTimeout(() => showPhoto(i), 300);
    }, t);
  });


  /* ═══════════════════════════════════════════════════
     SCENE 3 (13s – 18s): Steps as power-ups
     Each rises from a pipe position
     ═══════════════════════════════════════════════════ */

  /* Pause world scroll at 13s */
  setTimeout(() => {
    const world = document.getElementById('world');
    world.style.animationPlayState = 'paused';
  }, 13000);

  setTimeout(() => {
    showPowerUp('powerup1', 1500);
    addCoin();
    addScore(1000);
  }, 13200);

  setTimeout(() => {
    showPowerUp('powerup2', 1500);
    addCoin();
    addScore(1000);
  }, 14800);

  setTimeout(() => {
    showPowerUp('powerup3', 1500);
    addCoin();
    addScore(1000);
  }, 16400);


  /* ═══════════════════════════════════════════════════
     SCENE 4 (18s – 24s): CTA — Course Clear
     Flag drops, overlay with handle/DM/limited
     ═══════════════════════════════════════════════════ */

  setTimeout(() => {
    /* Resume scroll briefly for flag approach */
    const world = document.getElementById('world');
    world.style.animationPlayState = 'running';
  }, 18000);

  setTimeout(() => {
    /* Flag drops */
    const flag = document.getElementById('the-flag');
    if (flag) flag.style.animation = 'flagDrop 0.8s ease-out forwards';
  }, 18200);

  setTimeout(() => {
    /* Show CTA overlay */
    document.getElementById('scene-cta').classList.add('active');

    setTimeout(() => { animateEl('cta-clear', 'flashBig', '0.6s'); addScore(5000); }, 200);
    setTimeout(() => { animateEl('cta-score', 'fadeIn', '0.4s'); addScore(5000); }, 1000);
    setTimeout(() => animateEl('cta-handle', 'slideUp', '0.5s'), 1800);
    setTimeout(() => animateEl('cta-dm', 'popIn', '0.5s'), 2800);
    setTimeout(() => animateEl('cta-limited', 'fadeIn', '0.4s'), 3400);
    setTimeout(() => {
      animateEl('cta-ticker', 'fadeIn', '0.3s');
      document.getElementById('final-score').textContent = String(score).padStart(6, '0');
    }, 4000);
  }, 18500);

  /* Stop timer */
  setTimeout(() => clearInterval(timerID), 22500);

</script>
</body>
</html>`;
}

/* ──────────────────────────────────────
   RENDER
   ────────────────────────────────────── */
async function render() {
  resetOutputDir()

  const imageDataMap = {}
  for (const photo of PROOF_PHOTOS) {
    imageDataMap[photo] = readImage(photo)
  }

  writeSources({
    createdAt: new Date().toISOString(),
    strategy: 'v33c — Super Mario Bros ZOOMED IN close-up world, CSS scroll, blocks 80px, photos from ? blocks',
    safeBottomPixels: SAFE_BOTTOM,
    photos: PROOF_PHOTOS,
  })

  const browser = await chromium.launch()
  console.log('Recording Mario zoomed-in close-up reel (CSS-only animations)...')

  const videoCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    recordVideo: { dir: OUT_DIR, size: { width: WIDTH, height: HEIGHT } }
  })

  const videoPage = await videoCtx.newPage()
  await videoPage.evaluate(() => {
    document.documentElement.style.background = '#5c94fc'
    document.body.style.background = '#5c94fc'
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
  const dstVideo = path.join(OUT_DIR, 'manila-mario-v33c.mp4')

  const { execSync } = await import('child_process')
  try {
    execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${dstVideo}"`, { stdio: 'pipe' })
    fs.unlinkSync(srcVideo)
    console.log('Rendered manila-mario-v33c.mp4')
  } catch (err) {
    console.warn('ffmpeg conversion issue, trying alternate...', err.message)
    try {
      execSync(`/opt/homebrew/bin/ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${dstVideo}"`, { stdio: 'pipe' })
      fs.unlinkSync(srcVideo)
      console.log('Rendered manila-mario-v33c.mp4 (alt ffmpeg)')
    } catch {
      console.warn('ffmpeg not available, keeping as webm')
      fs.renameSync(srcVideo, dstVideo.replace('.mp4', '.webm'))
    }
  }

  console.log(`Done: output written to ${OUT_DIR}`)
}

render().catch(error => {
  console.error(error)
  process.exit(1)
})
