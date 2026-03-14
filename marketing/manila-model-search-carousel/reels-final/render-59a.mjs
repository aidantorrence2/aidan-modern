import { chromium } from 'playwright';
import { execSync } from 'child_process';
import { mkdirSync, rmSync, existsSync, readFileSync, writeFileSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

var __dirname = path.dirname(fileURLToPath(import.meta.url));
var OUT_DIR = path.join(__dirname, 'output-59a');

var W = 1080;
var H = 1920;
var FPS = 30;

var FILM_SCANS_DIR = '/Volumes/PortableSSD/Exports/film scans';
var PHOTO_NAMES = [
  'DSC_0306.jpg',
  'DSC_0309-2.jpg',
  'DSC_0313-2.jpg',
  'DSC_0315.jpg',
  'DSC_0317.jpg',
  'DSC_0319.jpg',
  'DSC_0322.jpg',
  'DSC_0326-3.jpg',
];

var TOTAL_FRAMES = 720; // 24s at 30fps
var TOTAL_DURATION = 24;

function resetOutputDir() {
  rmSync(OUT_DIR, { recursive: true, force: true });
  mkdirSync(OUT_DIR, { recursive: true });
}

function processPhotos() {
  var cropDir = path.join(OUT_DIR, 'tmp-photos');
  mkdirSync(cropDir, { recursive: true });
  var processed = {};
  for (var name of PHOTO_NAMES) {
    var src = path.join(FILM_SCANS_DIR, name);
    if (!existsSync(src)) {
      console.error('Photo not found: ' + src);
      process.exit(1);
    }
    var dst = path.join(cropDir, name.replace(/\.jpg$/i, '_processed.jpg'));
    execSync('magick "' + src + '" -shave 500x600 +repage -auto-level -quality 95 "' + dst + '"', { stdio: 'pipe' });
    var buf = readFileSync(dst);
    processed[name] = 'data:image/jpeg;base64,' + buf.toString('base64');
    console.log('  Processed: ' + name + ' (' + (buf.length / 1024).toFixed(0) + ' KB)');
  }
  return processed;
}

function buildHTML(imageDataMap) {
  // Build arrays of base64 images for JS
  var imgArrayEntries = PHOTO_NAMES.map(function(name) {
    return '"' + imageDataMap[name] + '"';
  }).join(',\n    ');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: ${W}px; height: ${H}px; overflow: hidden; background: #0d0d1a; font-family: 'Arial Black', Arial, sans-serif; }

  @keyframes ledChase {
    0%   { opacity: 1; background: #FFD700; box-shadow: 0 0 8px #FFD700; }
    25%  { opacity: 0.3; background: #FF1744; box-shadow: 0 0 4px #FF1744; }
    50%  { opacity: 1; background: #FFD700; box-shadow: 0 0 8px #FFD700; }
    75%  { opacity: 0.3; background: #FF8800; box-shadow: 0 0 4px #FF8800; }
    100% { opacity: 1; background: #FFD700; box-shadow: 0 0 8px #FFD700; }
  }

  @keyframes sparkle {
    0%, 100% { opacity: 0; transform: scale(0.5) rotate(0deg); }
    50% { opacity: 1; transform: scale(1.2) rotate(180deg); }
  }

  @keyframes creditCount {
    0% { color: #FFD700; }
    50% { color: #fff; }
    100% { color: #FFD700; }
  }

  @keyframes jackpotFlash {
    0%, 100% { opacity: 1; transform: scale(1); }
    25% { opacity: 0.6; transform: scale(1.08); }
    50% { opacity: 1; transform: scale(1.15); }
    75% { opacity: 0.8; transform: scale(1.05); }
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10% { transform: translateX(-12px) rotate(-1deg); }
    20% { transform: translateX(12px) rotate(1deg); }
    30% { transform: translateX(-10px); }
    40% { transform: translateX(10px); }
    50% { transform: translateX(-6px); }
    60% { transform: translateX(6px); }
    70% { transform: translateX(-4px); }
    80% { transform: translateX(4px); }
    90% { transform: translateX(-2px); }
  }

  @keyframes leverPull {
    0%   { transform: rotate(0deg); }
    100% { transform: rotate(75deg); }
  }

  @keyframes leverReturn {
    0%   { transform: rotate(75deg); }
    100% { transform: rotate(0deg); }
  }

  @keyframes slideIn {
    0%   { opacity: 0; transform: translateY(30px); }
    100% { opacity: 1; transform: translateY(0); }
  }

  @keyframes pulseGlow {
    0%, 100% { box-shadow: 0 0 20px rgba(255,215,0,0.4), 0 0 40px rgba(255,215,0,0.2); }
    50% { box-shadow: 0 0 40px rgba(255,215,0,0.8), 0 0 80px rgba(255,215,0,0.4); }
  }

  @keyframes ctaPulse {
    0%, 100% { transform: scale(1); box-shadow: 0 0 30px rgba(255,23,68,0.5); }
    50% { transform: scale(1.04); box-shadow: 0 0 60px rgba(255,23,68,0.9); }
  }

  .led-dot {
    width: 14px; height: 14px; border-radius: 50%;
    background: #FFD700;
    box-shadow: 0 0 8px #FFD700;
    display: inline-block;
    animation: ledChase 1s ease-in-out infinite;
  }

  .sparkle-star {
    position: absolute;
    width: 6px; height: 6px;
    background: #FFD700;
    clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
    animation: sparkle 2s ease-in-out infinite;
  }
</style>
</head>
<body>
<div id="root" style="width:${W}px;height:${H}px;position:relative;overflow:hidden;background:#0d0d1a;">

  <!-- Background sparkle particles -->
  <div id="sparkles" style="position:absolute;inset:0;pointer-events:none;z-index:1;"></div>

  <!-- Vignette -->
  <div style="position:absolute;inset:0;z-index:2;pointer-events:none;background:radial-gradient(ellipse at center,transparent 55%,rgba(0,0,0,0.55) 100%);"></div>

  <!-- Credit counter top bar -->
  <div id="credit-bar" style="position:absolute;top:220px;left:0;right:0;z-index:50;text-align:center;opacity:0;">
    <div style="display:inline-block;background:rgba(0,0,0,0.7);border:2px solid #FFD700;border-radius:12px;padding:10px 40px;">
      <span style="font-size:24px;color:#aaa;letter-spacing:2px;text-transform:uppercase;">CREDITS</span>
      <span id="credit-num" style="font-size:48px;font-weight:900;color:#FFD700;margin-left:20px;font-family:monospace;animation:creditCount 1s ease-in-out infinite;">000</span>
    </div>
  </div>

  <!-- Main title -->
  <div id="main-title" style="position:absolute;top:330px;left:0;right:0;z-index:50;text-align:center;opacity:0;">
    <div style="font-size:64px;font-weight:900;color:#FFD700;text-transform:uppercase;letter-spacing:4px;text-shadow:0 0 30px rgba(255,215,0,0.8),0 4px 0 rgba(0,0,0,0.8);line-height:1.1;">MANILA</div>
    <div style="font-size:36px;font-weight:900;color:#fff;text-transform:uppercase;letter-spacing:3px;text-shadow:0 0 20px rgba(255,255,255,0.5),0 2px 0 rgba(0,0,0,0.8);margin-top:4px;">FREE PHOTO SHOOT</div>
    <div id="led-bar" style="margin-top:18px;display:flex;justify-content:center;gap:12px;opacity:0;">
    </div>
  </div>

  <!-- Slot machine wrapper (for shake animation) -->
  <div id="slot-wrapper" style="position:absolute;top:550px;left:0;right:0;z-index:30;">

    <!-- Slot machine frame -->
    <div id="slot-frame" style="
      position:relative;
      width:820px;
      margin:0 auto;
      background:linear-gradient(160deg,#2a1a00 0%,#1a1000 40%,#2a1a00 100%);
      border:6px solid #FFD700;
      border-radius:32px;
      padding:24px 24px 32px;
      box-shadow:0 0 40px rgba(255,215,0,0.5),inset 0 0 30px rgba(255,215,0,0.08);
      animation:pulseGlow 2s ease-in-out infinite;
    ">

      <!-- Top LED row -->
      <div id="top-leds" style="display:flex;justify-content:space-around;margin-bottom:16px;opacity:0;"></div>

      <!-- SLOT MACHINE label -->
      <div style="text-align:center;margin-bottom:14px;">
        <span style="font-size:28px;font-weight:900;color:#FFD700;text-transform:uppercase;letter-spacing:8px;text-shadow:0 0 15px rgba(255,215,0,0.7);">&#9654; SPIN TO WIN &#9664;</span>
      </div>

      <!-- Three reel windows -->
      <div style="display:flex;gap:12px;justify-content:center;">

        <!-- Reel 1 -->
        <div id="reel-window-0" style="
          width:228px;height:300px;
          border:4px solid #FFD700;
          border-radius:16px;
          overflow:hidden;
          background:#000;
          position:relative;
          box-shadow:inset 0 0 20px rgba(0,0,0,0.8);
        ">
          <div id="reel-strip-0" style="position:absolute;left:0;right:0;top:0;will-change:transform;"></div>
          <div style="position:absolute;inset:0;pointer-events:none;background:linear-gradient(to bottom,rgba(0,0,0,0.6) 0%,transparent 25%,transparent 75%,rgba(0,0,0,0.6) 100%);z-index:10;"></div>
          <!-- center line -->
          <div style="position:absolute;top:50%;left:0;right:0;height:3px;background:rgba(255,215,0,0.6);transform:translateY(-50%);z-index:11;"></div>
          <div style="position:absolute;top:calc(50% - 75px);left:0;right:0;height:3px;background:rgba(255,215,0,0.3);z-index:11;"></div>
          <div style="position:absolute;top:calc(50% + 72px);left:0;right:0;height:3px;background:rgba(255,215,0,0.3);z-index:11;"></div>
        </div>

        <!-- Reel 2 -->
        <div id="reel-window-1" style="
          width:228px;height:300px;
          border:4px solid #FFD700;
          border-radius:16px;
          overflow:hidden;
          background:#000;
          position:relative;
          box-shadow:inset 0 0 20px rgba(0,0,0,0.8);
        ">
          <div id="reel-strip-1" style="position:absolute;left:0;right:0;top:0;will-change:transform;"></div>
          <div style="position:absolute;inset:0;pointer-events:none;background:linear-gradient(to bottom,rgba(0,0,0,0.6) 0%,transparent 25%,transparent 75%,rgba(0,0,0,0.6) 100%);z-index:10;"></div>
          <div style="position:absolute;top:50%;left:0;right:0;height:3px;background:rgba(255,215,0,0.6);transform:translateY(-50%);z-index:11;"></div>
          <div style="position:absolute;top:calc(50% - 75px);left:0;right:0;height:3px;background:rgba(255,215,0,0.3);z-index:11;"></div>
          <div style="position:absolute;top:calc(50% + 72px);left:0;right:0;height:3px;background:rgba(255,215,0,0.3);z-index:11;"></div>
        </div>

        <!-- Reel 3 -->
        <div id="reel-window-2" style="
          width:228px;height:300px;
          border:4px solid #FFD700;
          border-radius:16px;
          overflow:hidden;
          background:#000;
          position:relative;
          box-shadow:inset 0 0 20px rgba(0,0,0,0.8);
        ">
          <div id="reel-strip-2" style="position:absolute;left:0;right:0;top:0;will-change:transform;"></div>
          <div style="position:absolute;inset:0;pointer-events:none;background:linear-gradient(to bottom,rgba(0,0,0,0.6) 0%,transparent 25%,transparent 75%,rgba(0,0,0,0.6) 100%);z-index:10;"></div>
          <div style="position:absolute;top:50%;left:0;right:0;height:3px;background:rgba(255,215,0,0.6);transform:translateY(-50%);z-index:11;"></div>
          <div style="position:absolute;top:calc(50% - 75px);left:0;right:0;height:3px;background:rgba(255,215,0,0.3);z-index:11;"></div>
          <div style="position:absolute;top:calc(50% + 72px);left:0;right:0;height:3px;background:rgba(255,215,0,0.3);z-index:11;"></div>
        </div>

      </div>

      <!-- Bottom LED row -->
      <div id="bottom-leds" style="display:flex;justify-content:space-around;margin-top:16px;opacity:0;"></div>

      <!-- JACKPOT label inside frame -->
      <div id="jackpot-label" style="text-align:center;margin-top:16px;opacity:0;">
        <div style="display:inline-block;background:linear-gradient(90deg,#FF1744,#FF8800,#FFD700,#FF8800,#FF1744);border-radius:16px;padding:12px 50px;animation:jackpotFlash 0.3s ease-in-out infinite;">
          <span style="font-size:52px;font-weight:900;color:#fff;text-transform:uppercase;letter-spacing:6px;text-shadow:0 0 20px rgba(255,255,255,0.8);">JACKPOT!</span>
        </div>
      </div>

    </div>

    <!-- Lever (right side of machine) -->
    <div id="lever-container" style="position:absolute;right:-10px;top:40px;width:80px;height:240px;opacity:0;">
      <!-- lever arm -->
      <div id="lever-arm" style="
        position:absolute;
        top:0;left:30px;
        width:16px;height:160px;
        background:linear-gradient(90deg,#888,#fff,#888);
        border-radius:8px;
        transform-origin:top center;
        box-shadow:0 0 10px rgba(0,0,0,0.5);
      "></div>
      <!-- lever ball -->
      <div id="lever-ball" style="
        position:absolute;
        top:0;left:18px;
        width:40px;height:40px;
        border-radius:50%;
        background:radial-gradient(circle at 35% 35%,#FF1744,#8B0000);
        box-shadow:0 0 15px rgba(255,23,68,0.8),inset 0 0 10px rgba(0,0,0,0.3);
      "></div>
      <!-- lever base -->
      <div style="
        position:absolute;
        bottom:0;left:10px;
        width:56px;height:70px;
        background:linear-gradient(180deg,#555,#222);
        border-radius:8px;
        border:2px solid #888;
      "></div>
      <!-- PULL label -->
      <div style="position:absolute;bottom:10px;left:0;right:0;text-align:center;font-size:18px;font-weight:900;color:#FFD700;letter-spacing:2px;">PULL</div>
    </div>

  </div>

  <!-- JACKPOT overlay (full screen flash) -->
  <div id="jackpot-overlay" style="position:absolute;inset:0;z-index:200;background:rgba(255,215,0,0);pointer-events:none;"></div>

  <!-- Full-screen photo slideshow (phase 2) -->
  <div id="photo-show" style="position:absolute;inset:0;z-index:60;background:#000;opacity:0;pointer-events:none;">
    <div id="photo-show-img" style="width:100%;height:100%;background-size:cover;background-position:center;"></div>
    <!-- flash overlay for transitions -->
    <div id="photo-flash" style="position:absolute;inset:0;background:#fff;opacity:0;pointer-events:none;"></div>
    <!-- bottom label -->
    <div style="position:absolute;bottom:0;left:0;right:0;height:180px;background:linear-gradient(to top,rgba(0,0,0,0.85) 0%,transparent 100%);z-index:10;"></div>
    <div style="position:absolute;bottom:60px;left:0;right:0;text-align:center;z-index:11;">
      <span style="font-size:28px;font-weight:700;color:rgba(255,255,255,0.6);letter-spacing:3px;text-transform:uppercase;">@madebyaidan</span>
    </div>
  </div>

  <!-- HOW TO PLAY panel -->
  <div id="how-to-play" style="position:absolute;inset:0;z-index:70;background:#0d0d1a;opacity:0;pointer-events:none;">
    <div style="position:absolute;top:220px;left:60px;right:60px;">
      <div style="text-align:center;margin-bottom:40px;">
        <div style="font-size:22px;color:#aaa;letter-spacing:4px;text-transform:uppercase;margin-bottom:8px;">Pay Table</div>
        <div style="font-size:52px;font-weight:900;color:#FFD700;text-transform:uppercase;letter-spacing:4px;text-shadow:0 0 30px rgba(255,215,0,0.6);">HOW TO PLAY</div>
        <div style="width:200px;height:4px;background:linear-gradient(90deg,transparent,#FFD700,transparent);margin:16px auto 0;"></div>
      </div>

      <!-- Pay table rows -->
      <div id="htp-row-0" style="display:flex;align-items:center;background:rgba(255,215,0,0.06);border:2px solid rgba(255,215,0,0.3);border-radius:16px;padding:24px 30px;margin-bottom:20px;opacity:0;">
        <div style="font-size:52px;margin-right:20px;flex-shrink:0;">💎💎💎</div>
        <div style="flex:1;">
          <div style="font-size:30px;font-weight:900;color:#FFD700;text-transform:uppercase;letter-spacing:2px;">DM ME</div>
          <div style="font-size:22px;color:rgba(255,255,255,0.7);margin-top:4px;">Say hi on Instagram — I reply fast</div>
        </div>
        <div style="font-size:36px;font-weight:900;color:#22c55e;margin-left:16px;">WIN</div>
      </div>

      <div id="htp-row-1" style="display:flex;align-items:center;background:rgba(255,215,0,0.06);border:2px solid rgba(255,215,0,0.3);border-radius:16px;padding:24px 30px;margin-bottom:20px;opacity:0;">
        <div style="font-size:52px;margin-right:20px;flex-shrink:0;">🎰🎰🎰</div>
        <div style="flex:1;">
          <div style="font-size:30px;font-weight:900;color:#FFD700;text-transform:uppercase;letter-spacing:2px;">PICK DATE</div>
          <div style="font-size:22px;color:rgba(255,255,255,0.7);margin-top:4px;">We plan location + vibe together</div>
        </div>
        <div style="font-size:36px;font-weight:900;color:#22c55e;margin-left:16px;">WIN</div>
      </div>

      <div id="htp-row-2" style="display:flex;align-items:center;background:rgba(255,215,0,0.06);border:2px solid rgba(255,215,0,0.3);border-radius:16px;padding:24px 30px;margin-bottom:20px;opacity:0;">
        <div style="font-size:52px;margin-right:20px;flex-shrink:0;">⭐⭐⭐</div>
        <div style="flex:1;">
          <div style="font-size:30px;font-weight:900;color:#FFD700;text-transform:uppercase;letter-spacing:2px;">SHOW UP</div>
          <div style="font-size:22px;color:rgba(255,255,255,0.7);margin-top:4px;">I direct you. No experience needed.</div>
        </div>
        <div style="font-size:36px;font-weight:900;color:#22c55e;margin-left:16px;">WIN</div>
      </div>

      <!-- Result row -->
      <div id="htp-result" style="text-align:center;margin-top:10px;opacity:0;">
        <div style="display:inline-block;background:linear-gradient(135deg,#FFD700,#FF8800);border-radius:16px;padding:16px 50px;">
          <span style="font-size:36px;font-weight:900;color:#000;text-transform:uppercase;letter-spacing:3px;">= FREE PHOTOS 🎉</span>
        </div>
      </div>
    </div>
  </div>

  <!-- CTA panel -->
  <div id="cta-panel" style="position:absolute;inset:0;z-index:80;background:#0d0d1a;opacity:0;pointer-events:none;">
    <div style="position:absolute;top:0;left:0;right:0;bottom:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px;">

      <div style="font-size:30px;color:#aaa;letter-spacing:4px;text-transform:uppercase;margin-bottom:20px;text-align:center;">Your Jackpot is Waiting</div>

      <div style="font-size:88px;font-weight:900;color:#FFD700;text-transform:uppercase;letter-spacing:4px;text-align:center;text-shadow:0 0 40px rgba(255,215,0,0.7),0 4px 0 rgba(0,0,0,0.8);line-height:1;margin-bottom:16px;">CLAIM YOUR<br>JACKPOT</div>

      <div style="width:300px;height:5px;background:linear-gradient(90deg,transparent,#FF1744,transparent);margin:24px auto;"></div>

      <div id="cta-handle" style="
        background:linear-gradient(135deg,#FF1744,#CC0000);
        border-radius:24px;
        padding:32px 80px;
        margin:16px 0;
        animation:ctaPulse 1.5s ease-in-out infinite;
      ">
        <div style="font-size:52px;font-weight:900;color:#fff;text-transform:uppercase;letter-spacing:4px;text-align:center;">@madebyaidan</div>
        <div style="font-size:26px;color:rgba(255,255,255,0.8);text-align:center;margin-top:8px;letter-spacing:2px;">DM ON INSTAGRAM</div>
      </div>

      <div style="margin-top:30px;text-align:center;">
        <div style="display:inline-block;background:rgba(255,215,0,0.12);border:3px solid #FFD700;border-radius:100px;padding:16px 60px;">
          <span style="font-size:44px;font-weight:900;color:#FFD700;text-transform:uppercase;letter-spacing:4px;">IT'S FREE</span>
        </div>
      </div>

      <div style="margin-top:24px;font-size:24px;color:rgba(255,255,255,0.45);letter-spacing:2px;text-transform:uppercase;text-align:center;">limited slots · manila sessions</div>

    </div>
  </div>

  <!-- Hold/pulse final screen (overlaps CTA) -->
  <div id="final-pulse" style="position:absolute;inset:0;z-index:90;background:rgba(0,0,0,0);pointer-events:none;"></div>

</div>

<script>
  var PHOTOS = [
    ${imgArrayEntries}
  ];
  var PHOTO_COUNT = PHOTOS.length;

  // ============================================================
  // DOM refs
  // ============================================================
  var root = document.getElementById('root');
  var creditBar = document.getElementById('credit-bar');
  var creditNum = document.getElementById('credit-num');
  var mainTitle = document.getElementById('main-title');
  var ledBar = document.getElementById('led-bar');
  var topLeds = document.getElementById('top-leds');
  var bottomLeds = document.getElementById('bottom-leds');
  var slotWrapper = document.getElementById('slot-wrapper');
  var leverContainer = document.getElementById('lever-container');
  var leverArm = document.getElementById('lever-arm');
  var leverBall = document.getElementById('lever-ball');
  var jackpotLabel = document.getElementById('jackpot-label');
  var jackpotOverlay = document.getElementById('jackpot-overlay');
  var photoShow = document.getElementById('photo-show');
  var photoShowImg = document.getElementById('photo-show-img');
  var photoFlash = document.getElementById('photo-flash');
  var howToPlay = document.getElementById('how-to-play');
  var ctaPanel = document.getElementById('cta-panel');
  var finalPulse = document.getElementById('final-pulse');
  var sparklesDiv = document.getElementById('sparkles');

  // ============================================================
  // Setup: reel strips with photos tiled many times
  // ============================================================
  var REEL_CELL_H = 300; // height of each cell in reel strip
  var REEL_TILE_COUNT = 20; // how many times to tile photos in strip

  function buildReelStrip(reelIdx) {
    var strip = document.getElementById('reel-strip-' + reelIdx);
    // Different photo order per reel
    var offsets = [0, 3, 6];
    var offset = offsets[reelIdx % 3];
    var html = '';
    for (var i = 0; i < REEL_TILE_COUNT; i++) {
      var photoIdx = (i + offset) % PHOTO_COUNT;
      html += '<div style="width:228px;height:' + REEL_CELL_H + 'px;overflow:hidden;flex-shrink:0;">' +
              '<img src="' + PHOTOS[photoIdx] + '" style="width:100%;height:100%;object-fit:cover;" />' +
              '</div>';
    }
    strip.style.cssText = 'position:absolute;left:0;right:0;top:0;display:flex;flex-direction:column;';
    strip.innerHTML = html;
  }

  // Build LED rows
  function buildLeds(container, count) {
    var html = '';
    for (var i = 0; i < count; i++) {
      var delay = (i * 0.08).toFixed(2);
      html += '<div class="led-dot" style="animation-delay:' + delay + 's;"></div>';
    }
    container.innerHTML = html;
  }

  // Build sparkle particles
  function buildSparkles() {
    var html = '';
    for (var i = 0; i < 40; i++) {
      var x = Math.random() * 1080;
      var y = Math.random() * 1920;
      var size = 4 + Math.random() * 8;
      var delay = Math.random() * 3;
      var dur = 1.5 + Math.random() * 2;
      html += '<div class="sparkle-star" style="left:' + x + 'px;top:' + y + 'px;width:' + size + 'px;height:' + size + 'px;animation-delay:' + delay + 's;animation-duration:' + dur + 's;"></div>';
    }
    sparklesDiv.innerHTML = html;
  }

  // Build title LED bar
  function buildTitleLeds() {
    var html = '';
    for (var i = 0; i < 12; i++) {
      var delay = (i * 0.07).toFixed(2);
      html += '<div class="led-dot" style="width:16px;height:16px;animation-delay:' + delay + 's;"></div>';
    }
    ledBar.innerHTML = html;
  }

  buildReelStrip(0);
  buildReelStrip(1);
  buildReelStrip(2);
  buildLeds(topLeds, 16);
  buildLeds(bottomLeds, 16);
  buildSparkles();
  buildTitleLeds();

  // ============================================================
  // Reel animation helpers
  // ============================================================
  // Each reel spins from top:0 downward by animating translateY
  // Negative translateY = strip moves up = photos scroll down
  // We want strip to scroll up (photos appear to move up) → positive translateY going negative
  // Total strip height = REEL_CELL_H * REEL_TILE_COUNT

  var STRIP_TOTAL_H = REEL_CELL_H * REEL_TILE_COUNT; // 6000px

  // Spin speed in px/second during active spin
  var SPIN_SPEED_PX = 4000; // fast scroll

  // Target offset for each reel when stopped — center on a specific photo
  // To center photo N: offset = -(N * REEL_CELL_H) + (300/2 - REEL_CELL_H/2)
  // which simplifies to -(N * REEL_CELL_H) + 0 → top of cell N at top of window
  // We want center of window = 150px, center of cell = N*300+150
  // So translateY = 150 - (N*300 + 150) = -N*300
  function reelTargetOffset(photoIdx) {
    return -(photoIdx * REEL_CELL_H);
  }

  // During spin: offset increases negatively (strip scrolls up fast)
  // We wrap with modulo to keep it within strip bounds
  function reelSpinOffset(t_spin) {
    // t_spin = seconds since spin started
    var raw = -(t_spin * SPIN_SPEED_PX);
    // wrap in strip
    return ((raw % STRIP_TOTAL_H) - STRIP_TOTAL_H) % STRIP_TOTAL_H;
  }

  function setReelTransform(reelIdx, offsetY, blurPx) {
    var strip = document.getElementById('reel-strip-' + reelIdx);
    if (!strip) return;
    strip.style.transform = 'translateY(' + offsetY + 'px)';
    strip.style.filter = blurPx > 0 ? 'blur(' + blurPx + 'px)' : '';
  }

  // ============================================================
  // Credit counter animation
  // ============================================================
  function creditAtTime(t) {
    if (t < 0.5) return 0;
    // Rapidly count up from 0 to 500 between 0.5 and 2s
    var progress = Math.min(1, (t - 0.5) / 1.5);
    return Math.floor(progress * 500);
  }

  // ============================================================
  // Lever animation
  // ============================================================
  function leverAngleAtTime(t) {
    // 2.0–2.4s: pull down (0 → 75deg)
    // 2.4–2.8s: spring back (75 → 0deg)
    // 2.8–3.0s: small bounce (0 → 10 → 0)
    if (t < 2.0) return 0;
    if (t < 2.4) return 75 * ((t - 2.0) / 0.4);
    if (t < 2.8) return 75 * (1 - ((t - 2.4) / 0.4));
    if (t < 2.9) return 10 * ((t - 2.8) / 0.1);
    if (t < 3.0) return 10 * (1 - ((t - 2.9) / 0.1));
    return 0;
  }

  // ============================================================
  // Ease-out for reel stopping
  // ============================================================
  function easeOut(x) {
    return 1 - Math.pow(1 - x, 3);
  }

  // Reel stop times
  var REEL_STOP = [3.0, 4.0, 5.0]; // seconds when each reel stops
  var SPIN_START = 2.2; // spin starts slightly after lever begins
  var REEL_STOP_PHOTOS = [0, 1, 2]; // which photo each reel stops on (index in their tiled sequence)

  // During deceleration (0.8s window), blend from spin speed to stopped
  var DECEL_DUR = 0.5;

  function getReelOffset(reelIdx, t) {
    var stopTime = REEL_STOP[reelIdx];
    var targetPhotoIdx = REEL_STOP_PHOTOS[reelIdx];
    // Photos are offset by reel: reel 0 starts at photo 0, reel 1 at photo 3, reel 2 at photo 6
    var reelPhotoOffset = [0, 3, 6][reelIdx];
    // We want to land on "targetPhotoIdx" in global terms, which maps to position (targetPhotoIdx - reelPhotoOffset + TILE_COUNT) % TILE_COUNT in strip
    var stripPos = ((targetPhotoIdx - reelPhotoOffset) % PHOTO_COUNT + PHOTO_COUNT) % PHOTO_COUNT;
    var finalOffset = reelTargetOffset(stripPos);

    if (t < SPIN_START) {
      // Not spinning yet — show first photo
      return reelTargetOffset(0);
    }

    var t_spin = t - SPIN_START;

    if (t < stopTime - DECEL_DUR) {
      // Full speed spin
      return reelSpinOffset(t_spin);
    } else if (t < stopTime) {
      // Deceleration
      var decelProgress = (t - (stopTime - DECEL_DUR)) / DECEL_DUR;
      var easedProgress = easeOut(decelProgress);
      // Blend between spin-position and final offset
      var spinPos = reelSpinOffset(t_spin);
      return spinPos + (finalOffset - spinPos) * easedProgress;
    } else {
      // Stopped
      return finalOffset;
    }
  }

  function getReelBlur(reelIdx, t) {
    var stopTime = REEL_STOP[reelIdx];
    if (t < SPIN_START) return 0;
    if (t < stopTime - DECEL_DUR) return 6; // full blur during spin
    if (t < stopTime) {
      var p = (t - (stopTime - DECEL_DUR)) / DECEL_DUR;
      return 6 * (1 - easeOut(p));
    }
    return 0;
  }

  // ============================================================
  // Photo slideshow
  // ============================================================
  var SLIDE_START = 6.0;
  var SLIDE_DUR = 1.0; // 1 second per photo
  var SLIDE_FLASH_DUR = 0.12; // flash duration

  function getPhotoShowState(t) {
    if (t < SLIDE_START || t >= 14.0) return null;
    var elapsed = t - SLIDE_START;
    var slideIdx = Math.floor(elapsed / SLIDE_DUR);
    if (slideIdx >= PHOTO_COUNT) return { idx: PHOTO_COUNT - 1, flash: 0 };
    var within = elapsed - slideIdx * SLIDE_DUR;
    var flash = within < SLIDE_FLASH_DUR ? (1 - within / SLIDE_FLASH_DUR) * 0.8 : 0;
    return { idx: slideIdx, flash: flash };
  }

  // ============================================================
  // Jackpot shake
  // ============================================================
  function getShakeAt(t) {
    // Screen shake from 5.0 to 5.8s
    if (t < 5.0 || t > 5.8) return 0;
    var progress = (t - 5.0) / 0.8;
    var amplitude = 14 * (1 - progress);
    var freq = 25; // Hz
    return amplitude * Math.sin(t * freq * Math.PI * 2);
  }

  // ============================================================
  // __applyUpTo — main render function
  // ============================================================
  window.__applyUpTo = function(t) {

    // -- SPARKLES always visible
    sparklesDiv.style.opacity = '1';

    // -- CREDIT BAR: visible from 0.3s
    creditBar.style.opacity = t >= 0.3 ? '1' : '0';
    if (t >= 0.3) {
      var c = creditAtTime(t);
      creditNum.textContent = String(c).padStart(3, '0');
    }

    // -- MAIN TITLE: fade in 0 → 1s
    if (t < 0.5) {
      mainTitle.style.opacity = '0';
    } else if (t < 1.5) {
      mainTitle.style.opacity = String(Math.min(1, (t - 0.5) / 0.8));
    } else {
      mainTitle.style.opacity = '1';
    }

    // -- LED bar under title
    ledBar.style.opacity = t >= 0.8 ? '1' : '0';

    // -- SLOT FRAME visible from 1.0s
    slotWrapper.style.opacity = t >= 1.0 ? '1' : '0';
    if (t >= 1.0 && t < 2.0) {
      var fadeSlot = Math.min(1, (t - 1.0) / 0.6);
      slotWrapper.style.opacity = String(fadeSlot);
    }

    // -- LED rows on frame
    topLeds.style.opacity = t >= 1.2 ? '1' : '0';
    bottomLeds.style.opacity = t >= 1.2 ? '1' : '0';

    // -- LEVER visible from 1.5s
    leverContainer.style.opacity = t >= 1.5 ? '1' : '0';
    var leverAngle = leverAngleAtTime(t);
    leverArm.style.transform = 'rotate(' + leverAngle + 'deg)';
    leverBall.style.transform = 'rotate(' + leverAngle + 'deg) translateY(0)';

    // -- REEL STRIPS
    for (var ri = 0; ri < 3; ri++) {
      var offset = getReelOffset(ri, t);
      var blur = getReelBlur(ri, t);
      setReelTransform(ri, offset, blur);
    }

    // -- JACKPOT LABEL (inside frame): show from 5.0s
    jackpotLabel.style.opacity = t >= 5.0 ? '1' : '0';

    // -- JACKPOT OVERLAY FLASH
    if (t >= 5.0 && t < 5.3) {
      var flashProgress = (t - 5.0) / 0.3;
      var flashAlpha = 0.6 * Math.sin(flashProgress * Math.PI);
      jackpotOverlay.style.background = 'rgba(255,215,0,' + flashAlpha.toFixed(3) + ')';
    } else if (t >= 5.3 && t < 5.6) {
      var flashAlpha2 = 0.3 * Math.sin(((t - 5.3) / 0.3) * Math.PI);
      jackpotOverlay.style.background = 'rgba(255,23,68,' + flashAlpha2.toFixed(3) + ')';
    } else {
      jackpotOverlay.style.background = 'rgba(255,215,0,0)';
    }

    // -- SHAKE (slot wrapper)
    var shakeX = getShakeAt(t);
    if (shakeX !== 0) {
      slotWrapper.style.transform = 'translateX(' + shakeX + 'px)';
    } else {
      slotWrapper.style.transform = '';
    }

    // -- PHOTO SHOW (6s–14s)
    if (t >= 5.8 && t < 14.0) {
      photoShow.style.opacity = '1';
      var state = getPhotoShowState(t);
      if (state !== null) {
        photoShowImg.style.backgroundImage = 'url(' + PHOTOS[state.idx % PHOTO_COUNT] + ')';
        photoFlash.style.opacity = String(state.flash);
      }
      // Fade in from 5.8–6.0
      if (t < 6.0) {
        photoShow.style.opacity = String((t - 5.8) / 0.2);
      }
    } else if (t >= 14.0 && t < 14.3) {
      // Fade out photo show
      photoShow.style.opacity = String(1 - (t - 14.0) / 0.3);
    } else if (t < 5.8 || t >= 14.3) {
      photoShow.style.opacity = '0';
    }

    // -- HOW TO PLAY (14s–18s)
    if (t >= 14.0 && t < 18.0) {
      howToPlay.style.opacity = t < 14.3 ? String((t - 14.0) / 0.3) : '1';
      if (t >= 18.0) howToPlay.style.opacity = '0';
    } else {
      howToPlay.style.opacity = '0';
    }

    // HTP rows stagger in
    var htpRows = ['htp-row-0', 'htp-row-1', 'htp-row-2', 'htp-result'];
    var htpTimes = [14.5, 15.2, 15.9, 16.6];
    for (var hi = 0; hi < htpRows.length; hi++) {
      var el = document.getElementById(htpRows[hi]);
      if (el) {
        if (t >= htpTimes[hi]) {
          el.style.opacity = String(Math.min(1, (t - htpTimes[hi]) / 0.4));
        } else {
          el.style.opacity = '0';
        }
      }
    }

    // -- CTA (18s–22s+)
    if (t >= 18.0) {
      ctaPanel.style.opacity = t < 18.4 ? String((t - 18.0) / 0.4) : '1';
    } else {
      ctaPanel.style.opacity = '0';
    }

    // -- FINAL PULSE (22s–24s)
    if (t >= 22.0) {
      var pulseT = (t - 22.0);
      var pulseAlpha = 0.08 * Math.sin(pulseT * Math.PI * 1.5);
      finalPulse.style.background = 'rgba(255,215,0,' + Math.max(0, pulseAlpha).toFixed(3) + ')';
    } else {
      finalPulse.style.background = 'rgba(0,0,0,0)';
    }
  };

  if (location.search.includes('capture=1')) {
    var style = document.createElement('style');
    style.textContent = '*, *::before, *::after { transition-duration: 0s !important; animation-duration: 0.001s !important; }';
    document.head.appendChild(style);
  }
</script>
</body>
</html>`;
}

async function main() {
  console.log('=== Slot Machine Casino Reel v59a ===');
  resetOutputDir();

  console.log('Processing photos...');
  var imageDataMap = processPhotos();

  var html = buildHTML(imageDataMap);
  var htmlPath = path.join(OUT_DIR, 'index.html');
  writeFileSync(htmlPath, html);
  console.log('HTML written: ' + htmlPath);

  var framesDir = path.join(OUT_DIR, 'tmp-frames');
  mkdirSync(framesDir, { recursive: true });

  var browser = await chromium.launch();
  var page = await browser.newPage({ viewport: { width: W, height: H } });
  await page.goto('file://' + htmlPath + '?capture=1', { waitUntil: 'load' });
  await page.waitForTimeout(800);

  console.log('Capturing ' + TOTAL_FRAMES + ' frames...');

  for (var frame = 0; frame < TOTAL_FRAMES; frame++) {
    var t = frame / FPS;
    await page.evaluate(function(time) { window.__applyUpTo(time); }, t);
    await page.waitForTimeout(2);
    var padded = String(frame).padStart(5, '0');
    await page.screenshot({ path: path.join(framesDir, 'frame_' + padded + '.png'), type: 'png' });
    if (frame % (FPS * 4) === 0) {
      console.log('  ' + t.toFixed(1) + 's / ' + TOTAL_DURATION + 's');
    }
  }

  await browser.close();
  console.log('All frames captured');

  var outputMp4 = path.join(OUT_DIR, 'manila-slot-machine-v59a.mp4');
  execSync(
    'ffmpeg -y -framerate ' + FPS + ' -i "' + path.join(framesDir, 'frame_%05d.png') + '" ' +
    '-c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r ' + FPS + ' -an "' + outputMp4 + '"',
    { stdio: 'inherit' }
  );

  rmSync(framesDir, { recursive: true, force: true });

  var reelsDir = path.join(__dirname, 'reels');
  if (!existsSync(reelsDir)) mkdirSync(reelsDir, { recursive: true });
  var reelsDest = path.join(reelsDir, 'manila-slot-machine-v59a.mp4');
  execSync('cp "' + outputMp4 + '" "' + reelsDest + '"');

  var sz = statSync(outputMp4);
  console.log('Final: ' + (sz.size / (1024 * 1024)).toFixed(1) + ' MB');
  console.log('Output: ' + outputMp4);
  console.log('Copied to: ' + reelsDest);
  console.log('=== Done ===');
}

main().catch(function(err) {
  console.error(err);
  process.exit(1);
});
