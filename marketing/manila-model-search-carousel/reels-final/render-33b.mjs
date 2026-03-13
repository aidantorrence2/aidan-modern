import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-33b')

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
   ────────────────────────────────────────────────────────────── */
function buildHTML(imageDataMap) {
  const photoSrcs = JSON.stringify(PROOF_PHOTOS.map(p => imageDataMap[p]))

  const CONTENT_TOP = SAFE_TOP + 100
  const CONTENT_BOTTOM = SAFE_BOTTOM + 110
  const GROUND_HEIGHT = SAFE_BOTTOM + 60

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

  /* ═══ KEYFRAME ANIMATIONS ═══ */

  @keyframes blockBounce {
    0%   { transform: translateY(0); }
    30%  { transform: translateY(-20px); }
    60%  { transform: translateY(0); }
    80%  { transform: translateY(-8px); }
    100% { transform: translateY(0); }
  }

  @keyframes coinPop {
    0%   { opacity: 1; transform: translateY(0) scaleX(1); }
    25%  { opacity: 1; transform: translateY(-100px) scaleX(0.3); }
    50%  { opacity: 1; transform: translateY(-140px) scaleX(1); }
    75%  { opacity: 0.7; transform: translateY(-100px) scaleX(0.3); }
    100% { opacity: 0; transform: translateY(-60px) scaleX(1); }
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

  @keyframes photoReveal {
    0%   { opacity: 0; transform: translateY(40px) scale(0.85); }
    70%  { opacity: 1; transform: translateY(-5px) scale(1.02); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
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

  @keyframes pipeRise {
    from { transform: translateY(100%); }
    to   { transform: translateY(0); }
  }

  @keyframes groundScroll {
    from { background-position: 0 0; }
    to   { background-position: -48px 0; }
  }

  @keyframes floatY {
    0%, 100% { transform: translateY(0); }
    50%      { transform: translateY(-12px); }
  }

  @keyframes blinkCursor {
    0%, 100% { opacity: 1; }
    50%      { opacity: 0; }
  }

  @keyframes coinSpin {
    0%   { transform: scaleX(1); }
    25%  { transform: scaleX(0.2); }
    50%  { transform: scaleX(1); }
    75%  { transform: scaleX(0.2); }
    100% { transform: scaleX(1); }
  }

  @keyframes stepSlideIn {
    0%   { opacity: 0; transform: translateX(-80px); }
    60%  { opacity: 1; transform: translateX(10px); }
    100% { opacity: 1; transform: translateX(0); }
  }

  @keyframes flagWave {
    0%, 100% { transform: rotate(0deg); }
    25%      { transform: rotate(8deg); }
    75%      { transform: rotate(-8deg); }
  }

  /* ═══ CLOUDS ═══ */
  .cloud {
    position: absolute;
    z-index: 1;
  }
  .cloud-body {
    background: #fff;
    border-radius: 50%;
    position: absolute;
  }

  /* ═══ QUESTION BLOCK ═══ */
  .qblock {
    width: 64px; height: 64px;
    background: #e8a010;
    border: 4px solid #f8d878;
    border-bottom-color: #885808;
    border-right-color: #885808;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36px;
    font-weight: 900;
    color: #fff;
    text-shadow: 2px 2px 0 #885808;
    font-family: ${MONO};
    border-radius: 4px;
    flex-shrink: 0;
  }
  .qblock.used {
    background: #885808;
    border-color: #6a4408;
  }
  .qblock.bounce {
    animation: blockBounce 0.4s ease-out;
  }

  /* ═══ BRICK ═══ */
  .brick {
    width: 48px; height: 48px;
    background: #c84c0c;
    border: 3px solid #e8a060;
    border-top-color: #f8d8b0;
    border-left-color: #f8d8b0;
    border-bottom-color: #703010;
    border-right-color: #703010;
    flex-shrink: 0;
  }

  /* ═══ PIPE ═══ */
  .pipe {
    position: absolute;
    z-index: 6;
  }
  .pipe-top {
    width: 96px; height: 48px;
    background: #00a800;
    border: 4px solid #005800;
    border-radius: 6px 6px 0 0;
  }
  .pipe-body {
    width: 80px; height: 80px;
    background: #00a800;
    border: 4px solid #005800;
    margin-left: 8px;
  }

  /* ═══ COIN ═══ */
  .coin-hud {
    width: 20px; height: 24px;
    border-radius: 50%;
    background: linear-gradient(135deg, #ffd700, #ffaa00);
    border: 2px solid #c88000;
    display: inline-block;
    vertical-align: middle;
    margin-right: 4px;
    animation: coinSpin 1.2s linear infinite;
  }

  /* ═══ SCENE CONTAINERS ═══ */
  .scene {
    position: absolute;
    top: ${CONTENT_TOP}px;
    left: ${SAFE_LEFT}px;
    width: ${SAFE_RIGHT - SAFE_LEFT}px;
    bottom: ${CONTENT_BOTTOM}px;
    z-index: 20;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    opacity: 0;
    pointer-events: none;
  }
  .scene.active {
    opacity: 1;
  }

  /* ═══ PERSISTENT TITLE ═══ */
  #persistent-title {
    position: absolute;
    top: ${SAFE_TOP + 62}px;
    left: ${SAFE_LEFT}px;
    right: ${WIDTH - SAFE_RIGHT}px;
    z-index: 50;
    text-align: center;
    font-family: ${MONO};
    font-size: 26px;
    font-weight: 900;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: #facc15;
    text-shadow: 3px 3px 0 #000, -1px -1px 0 #000;
  }
</style>
</head>
<body>
<div id="root">

  <!-- ═══ CLOUDS (pure CSS) ═══ -->
  <div class="cloud" style="top:${SAFE_TOP + 90}px;left:80px;">
    <div style="width:90px;height:34px;background:#fff;border-radius:17px;position:relative;">
      <div style="width:44px;height:26px;background:#fff;border-radius:13px;position:absolute;top:-15px;left:8px;"></div>
      <div style="width:54px;height:30px;background:#fff;border-radius:15px;position:absolute;top:-19px;left:28px;"></div>
    </div>
  </div>
  <div class="cloud" style="top:${SAFE_TOP + 240}px;left:680px;">
    <div style="width:110px;height:38px;background:#fff;border-radius:19px;position:relative;">
      <div style="width:56px;height:30px;background:#fff;border-radius:15px;position:absolute;top:-17px;left:12px;"></div>
      <div style="width:66px;height:34px;background:#fff;border-radius:17px;position:absolute;top:-22px;left:38px;"></div>
    </div>
  </div>
  <div class="cloud" style="top:${SAFE_TOP + 420}px;left:360px;">
    <div style="width:76px;height:30px;background:#fff;border-radius:15px;position:relative;">
      <div style="width:38px;height:22px;background:#fff;border-radius:11px;position:absolute;top:-13px;left:16px;"></div>
    </div>
  </div>

  <!-- ═══ HUD (always visible) ═══ -->
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

  <!-- ═══ PERSISTENT TITLE (always visible) ═══ -->
  <div id="persistent-title">Manila Free Photo Shoot</div>

  <!-- ═══ QUESTION BLOCKS ROW ═══ -->
  <div id="qblocks-row" style="position:absolute;top:${SAFE_TOP + 130}px;left:${SAFE_LEFT + 160}px;display:flex;gap:20px;z-index:10;">
    <div class="qblock" id="qb1">?</div>
    <div class="qblock" id="qb2">?</div>
    <div class="qblock" id="qb3">?</div>
    <div class="qblock" id="qb4">?</div>
    <div class="qblock" id="qb5">?</div>
  </div>

  <!-- ═══ GROUND ═══ -->
  <div id="ground" style="position:absolute;bottom:0;left:0;right:0;height:${GROUND_HEIGHT}px;z-index:5;overflow:hidden;">
    <div style="display:flex;flex-wrap:wrap;width:200%;animation:groundScroll 2s linear infinite;">
      ${Array(46).fill(0).map(() => `<div class="brick"></div>`).join('')}
    </div>
    <div style="background:#c84c0c;flex:1;min-height:${GROUND_HEIGHT}px;"></div>
  </div>

  <!-- ═══ PIPES ═══ -->
  <div class="pipe" style="bottom:${GROUND_HEIGHT}px;left:60px;">
    <div class="pipe-top"></div>
    <div class="pipe-body"></div>
  </div>
  <div class="pipe" style="bottom:${GROUND_HEIGHT}px;right:50px;">
    <div class="pipe-top"></div>
    <div class="pipe-body"></div>
  </div>

  <!-- ═══ SCENE 1: HOOK — "MODELS WANTED" ═══ -->
  <div class="scene" id="scene1">
    <div id="s1-title" style="opacity:0;font-size:58px;font-weight:900;color:#fff;text-shadow:4px 4px 0 #000;letter-spacing:6px;text-transform:uppercase;text-align:center;line-height:1.15;">
      MODELS<br>WANTED
    </div>
    <div id="s1-sub" style="opacity:0;font-size:28px;color:#facc15;text-shadow:2px 2px 0 #000;letter-spacing:3px;text-transform:uppercase;margin-top:20px;text-align:center;">
      No Experience Needed
    </div>
    <div id="s1-free" style="opacity:0;margin-top:24px;">
      <div style="display:inline-block;background:#00a800;border:5px solid #005800;border-radius:6px;padding:14px 36px;box-shadow:4px 4px 0 rgba(0,0,0,0.4);">
        <span style="font-size:36px;font-weight:900;color:#fff;text-shadow:2px 2px 0 #005800;letter-spacing:5px;">100% FREE</span>
      </div>
    </div>
  </div>

  <!-- ═══ SCENE 2: PHOTO PROOF (photos in ? block frames) ═══ -->
  <div class="scene" id="scene2">
    <div id="photo-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:14px;padding:10px;width:100%;"></div>
  </div>

  <!-- ═══ SCENE 3: HOW IT WORKS (coin-numbered steps) ═══ -->
  <div class="scene" id="scene3" style="justify-content:center;gap:24px;padding:0 30px;">
    <div id="s3-header" style="opacity:0;font-size:36px;font-weight:900;color:#facc15;text-shadow:3px 3px 0 #000;letter-spacing:4px;text-transform:uppercase;text-align:center;margin-bottom:16px;">
      HOW IT WORKS
    </div>
    <div id="step1" class="step-row" style="opacity:0;display:flex;align-items:center;gap:20px;">
      <div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#ffd700,#ffaa00);border:4px solid #c88000;display:flex;align-items:center;justify-content:center;font-size:30px;font-weight:900;color:#885808;text-shadow:1px 1px 0 #ffd700;flex-shrink:0;box-shadow:3px 3px 0 rgba(0,0,0,0.3);">1</div>
      <div style="font-size:26px;color:#fff;text-shadow:3px 3px 0 #000;letter-spacing:2px;text-transform:uppercase;">DM me on Instagram</div>
    </div>
    <div id="step2" class="step-row" style="opacity:0;display:flex;align-items:center;gap:20px;">
      <div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#ffd700,#ffaa00);border:4px solid #c88000;display:flex;align-items:center;justify-content:center;font-size:30px;font-weight:900;color:#885808;text-shadow:1px 1px 0 #ffd700;flex-shrink:0;box-shadow:3px 3px 0 rgba(0,0,0,0.3);">2</div>
      <div style="font-size:26px;color:#fff;text-shadow:3px 3px 0 #000;letter-spacing:2px;text-transform:uppercase;">We pick a date</div>
    </div>
    <div id="step3" class="step-row" style="opacity:0;display:flex;align-items:center;gap:20px;">
      <div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#ffd700,#ffaa00);border:4px solid #c88000;display:flex;align-items:center;justify-content:center;font-size:30px;font-weight:900;color:#885808;text-shadow:1px 1px 0 #ffd700;flex-shrink:0;box-shadow:3px 3px 0 rgba(0,0,0,0.3);">3</div>
      <div style="font-size:26px;color:#fff;text-shadow:3px 3px 0 #000;letter-spacing:2px;text-transform:uppercase;">Show up &amp; have fun!</div>
    </div>
  </div>

  <!-- ═══ SCENE 4: CTA — COURSE CLEAR ═══ -->
  <div class="scene" id="scene4" style="justify-content:center;gap:16px;">
    <div id="s4-clear" style="opacity:0;font-size:52px;font-weight:900;color:#facc15;text-shadow:4px 4px 0 #000;letter-spacing:6px;text-transform:uppercase;text-align:center;">
      COURSE CLEAR!
    </div>
    <div id="s4-bonus" style="opacity:0;font-size:22px;color:#fff;text-shadow:2px 2px 0 #000;letter-spacing:3px;text-align:center;margin-top:4px;">
      TIME BONUS: 5000
    </div>
    <div id="s4-handle" style="opacity:0;margin-top:16px;text-align:center;">
      <div style="font-size:50px;font-weight:900;color:#fff;text-shadow:4px 4px 0 #000;letter-spacing:4px;">@madebyaidan</div>
      <div style="font-size:22px;color:rgba(255,255,255,0.8);text-shadow:2px 2px 0 #000;margin-top:4px;letter-spacing:2px;">on Instagram</div>
    </div>
    <div id="s4-dm" style="opacity:0;margin-top:20px;text-align:center;">
      <div style="display:inline-block;background:#00a800;border:5px solid #005800;border-radius:6px;padding:18px 52px;box-shadow:4px 4px 0 rgba(0,0,0,0.4);">
        <span style="font-size:36px;font-weight:900;color:#fff;text-shadow:2px 2px 0 #005800;letter-spacing:5px;text-transform:uppercase;">Send me a DM</span>
      </div>
    </div>
    <div id="s4-limited" style="opacity:0;margin-top:14px;text-align:center;">
      <div style="font-size:22px;color:#facc15;text-shadow:2px 2px 0 #000;letter-spacing:3px;text-transform:uppercase;animation:starPulse 1.4s infinite;">
        ★ Limited Spots This Month ★
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

  /* ── Timer countdown via setInterval (not rAF) ── */
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
    coin.style.cssText = 'position:fixed;z-index:60;width:28px;height:34px;border-radius:50%;background:linear-gradient(135deg,#ffd700,#ffaa00);border:3px solid #c88000;pointer-events:none;';
    coin.style.left = (rect.left + rect.width / 2 - 14) + 'px';
    coin.style.top = (rect.top - 10) + 'px';
    coin.style.animation = 'coinPop 0.6s ease-out forwards';
    document.body.appendChild(coin);
    setTimeout(() => coin.remove(), 700);
  }

  /* ── Helper: switch scenes ── */
  function showScene(num) {
    document.querySelectorAll('.scene').forEach(s => s.classList.remove('active'));
    const target = document.getElementById('scene' + num);
    if (target) target.classList.add('active');
  }

  /* ── Helper: animate element ── */
  function animateEl(id, animName, dur) {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.animation = animName + ' ' + (dur || '0.5s') + ' ease-out forwards';
    el.style.opacity = '1';
  }

  /* ═══════════════════════════════════════════
     SCENE 1 (0s – 4s): MODELS WANTED hook
     ═══════════════════════════════════════════ */

  setTimeout(() => showScene(1), 200);

  /* Bounce question blocks one by one */
  setTimeout(() => { bounceBlock('qb1'); spawnCoinAbove('qb1'); addCoin(); addScore(200); }, 600);
  setTimeout(() => { bounceBlock('qb2'); spawnCoinAbove('qb2'); addCoin(); addScore(200); }, 1000);
  setTimeout(() => { bounceBlock('qb3'); spawnCoinAbove('qb3'); addCoin(); addScore(200); }, 1400);

  /* Reveal "MODELS WANTED" */
  setTimeout(() => animateEl('s1-title', 'flashBig', '0.6s'), 1000);

  /* Reveal subtitle */
  setTimeout(() => animateEl('s1-sub', 'slideUp', '0.5s'), 2000);

  /* Bounce remaining blocks */
  setTimeout(() => { bounceBlock('qb4'); spawnCoinAbove('qb4'); addCoin(); addScore(200); }, 2400);
  setTimeout(() => { bounceBlock('qb5'); spawnCoinAbove('qb5'); addCoin(); addScore(200); }, 2800);

  /* Reveal "100% FREE" */
  setTimeout(() => animateEl('s1-free', 'popIn', '0.5s'), 3000);


  /* ═══════════════════════════════════════════
     SCENE 2 (4s – 14s): Photo proof grid
     ═══════════════════════════════════════════ */

  setTimeout(() => {
    showScene(2);

    const grid = document.getElementById('photo-grid');
    PHOTOS.forEach((src, i) => {
      const cell = document.createElement('div');
      cell.id = 'photo-' + i;
      cell.style.cssText = 'opacity:0;';
      cell.innerHTML = \`
        <div style="border:5px solid #e8a010;border-radius:4px;overflow:hidden;background:#000;box-shadow:3px 3px 0 #885808;">
          <div style="aspect-ratio:3/4;overflow:hidden;">
            <img src="\${src}" style="width:100%;height:100%;object-fit:cover;display:block;"/>
          </div>
        </div>
      \`;
      grid.appendChild(cell);

      /* Stagger photo reveals — ~1.1s apart */
      setTimeout(() => {
        const el = document.getElementById('photo-' + i);
        if (el) {
          el.style.animation = 'photoReveal 0.5s ease-out forwards';
          addCoin();
          addScore(100);
        }
      }, 400 + i * 1100);
    });
  }, 4000);


  /* ═══════════════════════════════════════════
     SCENE 3 (14s – 18.5s): How it works
     ═══════════════════════════════════════════ */

  setTimeout(() => {
    showScene(3);

    /* Hide question blocks row */
    document.getElementById('qblocks-row').style.display = 'none';

    setTimeout(() => animateEl('s3-header', 'slideDown', '0.5s'), 200);
    setTimeout(() => { animateEl('step1', 'stepSlideIn', '0.5s'); addCoin(); addScore(500); }, 900);
    setTimeout(() => { animateEl('step2', 'stepSlideIn', '0.5s'); addCoin(); addScore(500); }, 2100);
    setTimeout(() => { animateEl('step3', 'stepSlideIn', '0.5s'); addCoin(); addScore(500); }, 3300);
  }, 14000);


  /* ═══════════════════════════════════════════
     SCENE 4 (18.5s – 24s): CTA / Course Clear
     ═══════════════════════════════════════════ */

  setTimeout(() => {
    showScene(4);

    setTimeout(() => { animateEl('s4-clear', 'flashBig', '0.6s'); addScore(5000); }, 200);
    setTimeout(() => { animateEl('s4-bonus', 'fadeIn', '0.4s'); addScore(5000); }, 1000);
    setTimeout(() => animateEl('s4-handle', 'slideUp', '0.5s'), 1800);
    setTimeout(() => animateEl('s4-dm', 'popIn', '0.5s'), 2800);
    setTimeout(() => animateEl('s4-limited', 'fadeIn', '0.4s'), 3600);
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
    strategy: 'v33b — Super Mario Bros NES aesthetic, CSS-only animations (no rAF/canvas/game loops)',
    safeBottomPixels: SAFE_BOTTOM,
    photos: PROOF_PHOTOS,
  })

  const browser = await chromium.launch()
  console.log('Recording Mario-themed reel (CSS-only animations)...')

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
  const dstVideo = path.join(OUT_DIR, 'manila-mario-v33b.mp4')

  const { execSync } = await import('child_process')
  try {
    execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${dstVideo}"`, { stdio: 'pipe' })
    fs.unlinkSync(srcVideo)
    console.log('Rendered manila-mario-v33b.mp4')
  } catch (err) {
    console.warn('ffmpeg conversion issue, trying alternate...', err.message)
    try {
      execSync(`/opt/homebrew/bin/ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${dstVideo}"`, { stdio: 'pipe' })
      fs.unlinkSync(srcVideo)
      console.log('Rendered manila-mario-v33b.mp4 (alt ffmpeg)')
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
