import { chromium } from 'playwright';
import { execSync } from 'child_process';
import { mkdirSync, rmSync, existsSync, readFileSync, writeFileSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

var __dirname = path.dirname(fileURLToPath(import.meta.url));
var OUT_DIR = path.join(__dirname, 'output-59f-subic');
var TEMP_FRAMES_DIR = '/Volumes/PortableSSD/reels-final-temp/output-59f-subic-frames';
var FILM_SCANS_DIR = '/Volumes/PortableSSD/Exports/film scans';
var W = 1080, H = 1920, FPS = 30;
var TOTAL_DURATION = 15;
var TOTAL_FRAMES = FPS * TOTAL_DURATION; // 450

var PHOTO_NAMES = [
  'DSC_0306.jpg', 'DSC_0307.jpg', 'DSC_0308.jpg',
  'DSC_0309.jpg', 'DSC_0310.jpg', 'DSC_0311.jpg',
  'DSC_0312.jpg', 'DSC_0313.jpg', 'DSC_0315.jpg',
];

// Safe zones
var SAFE_TOP = 213, SAFE_BOTTOM = 430, SAFE_LEFT = 66, SAFE_RIGHT = 1027;

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
  var imgArrayEntries = PHOTO_NAMES.map(function(name) {
    return '"' + imageDataMap[name] + '"';
  }).join(',\n    ');
  var burstCardData = PHOTO_NAMES.slice(0, 8).concat(PHOTO_NAMES.slice(0, 4)).map(function(name) {
    return imageDataMap[name];
  });

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

  @keyframes jackpotFlash {
    0%, 100% { opacity: 1; transform: scale(1); }
    25% { opacity: 0.6; transform: scale(1.08); }
    50% { opacity: 1; transform: scale(1.15); }
    75% { opacity: 0.8; transform: scale(1.05); }
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

  <!-- Marquee at top -->
  <div id="marquee" style="position:absolute;top:${SAFE_TOP + 10}px;left:50%;transform:translateX(-50%);width:880px;z-index:50;text-align:center;opacity:0;">
    <div style="background:linear-gradient(180deg,#2a1a00,#1a1000);border:4px solid #FFD700;border-radius:20px;padding:20px 40px;box-shadow:0 0 30px rgba(255,215,0,0.4);">
      <div id="led-bar-top" style="display:flex;justify-content:center;gap:10px;margin-bottom:10px;"></div>
      <div style="font-size:42px;font-weight:900;color:#FFD700;text-transform:uppercase;letter-spacing:4px;text-shadow:0 0 20px rgba(255,215,0,0.8);line-height:1.15;">SUBIC FREE<br>PHOTO SHOOT</div>
      <div id="led-bar-bottom" style="display:flex;justify-content:center;gap:10px;margin-top:10px;"></div>
    </div>
  </div>

  <!-- Slot machine wrapper -->
  <div id="slot-wrapper" style="position:absolute;top:520px;left:0;right:0;z-index:30;opacity:0;">

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
    ">

      <!-- Chrome trim top -->
      <div style="position:absolute;top:-6px;left:-6px;right:-6px;height:40px;background:linear-gradient(180deg,#f0e68c,#daa520,#b8860b);border-radius:32px 32px 0 0;border:2px solid #8B6914;z-index:-1;"></div>

      <!-- Chrome trim bottom -->
      <div style="position:absolute;bottom:-6px;left:-6px;right:-6px;height:40px;background:linear-gradient(180deg,#b8860b,#daa520,#f0e68c);border-radius:0 0 32px 32px;border:2px solid #8B6914;z-index:-1;"></div>

      <!-- Top LED row -->
      <div id="top-leds" style="display:flex;justify-content:space-around;margin-bottom:12px;opacity:0;"></div>

      <!-- Label -->
      <div style="text-align:center;margin-bottom:10px;">
        <span style="font-size:24px;font-weight:900;color:#FFD700;text-transform:uppercase;letter-spacing:6px;text-shadow:0 0 15px rgba(255,215,0,0.7);">&#9654; SPIN TO WIN &#9664;</span>
      </div>

      <!-- Three reel windows -->
      <div style="display:flex;gap:12px;justify-content:center;">

        <div id="reel-window-0" style="width:300px;height:400px;border:4px solid #FFD700;border-radius:16px;overflow:hidden;background:#000;position:relative;box-shadow:inset 0 0 20px rgba(0,0,0,0.8);">
          <div id="reel-strip-0" style="position:absolute;left:0;right:0;top:0;will-change:transform;display:flex;flex-direction:column;"></div>
          <div style="position:absolute;inset:0;pointer-events:none;background:linear-gradient(to bottom,rgba(0,0,0,0.6) 0%,transparent 25%,transparent 75%,rgba(0,0,0,0.6) 100%);z-index:10;"></div>
          <div style="position:absolute;top:50%;left:0;right:0;height:3px;background:rgba(255,215,0,0.6);transform:translateY(-50%);z-index:11;"></div>
        </div>

        <div id="reel-window-1" style="width:300px;height:400px;border:4px solid #FFD700;border-radius:16px;overflow:hidden;background:#000;position:relative;box-shadow:inset 0 0 20px rgba(0,0,0,0.8);">
          <div id="reel-strip-1" style="position:absolute;left:0;right:0;top:0;will-change:transform;display:flex;flex-direction:column;"></div>
          <div style="position:absolute;inset:0;pointer-events:none;background:linear-gradient(to bottom,rgba(0,0,0,0.6) 0%,transparent 25%,transparent 75%,rgba(0,0,0,0.6) 100%);z-index:10;"></div>
          <div style="position:absolute;top:50%;left:0;right:0;height:3px;background:rgba(255,215,0,0.6);transform:translateY(-50%);z-index:11;"></div>
        </div>

        <div id="reel-window-2" style="width:300px;height:400px;border:4px solid #FFD700;border-radius:16px;overflow:hidden;background:#000;position:relative;box-shadow:inset 0 0 20px rgba(0,0,0,0.8);">
          <div id="reel-strip-2" style="position:absolute;left:0;right:0;top:0;will-change:transform;display:flex;flex-direction:column;"></div>
          <div style="position:absolute;inset:0;pointer-events:none;background:linear-gradient(to bottom,rgba(0,0,0,0.6) 0%,transparent 25%,transparent 75%,rgba(0,0,0,0.6) 100%);z-index:10;"></div>
          <div style="position:absolute;top:50%;left:0;right:0;height:3px;background:rgba(255,215,0,0.6);transform:translateY(-50%);z-index:11;"></div>
        </div>

      </div>

      <!-- Bottom LED row -->
      <div id="bottom-leds" style="display:flex;justify-content:space-around;margin-top:12px;opacity:0;"></div>

      <!-- JACKPOT label inside frame -->
      <div id="jackpot-label" style="text-align:center;margin-top:14px;opacity:0;">
        <div style="display:inline-block;background:linear-gradient(90deg,#FF1744,#FF8800,#FFD700,#FF8800,#FF1744);border-radius:16px;padding:12px 50px;animation:jackpotFlash 0.3s ease-in-out infinite;">
          <span style="font-size:52px;font-weight:900;color:#fff;text-transform:uppercase;letter-spacing:6px;text-shadow:0 0 20px rgba(255,255,255,0.8);">JACKPOT!</span>
        </div>
      </div>

    </div>

    <!-- Lever (right side) -->
    <div id="lever-container" style="position:absolute;right:30px;top:100px;width:80px;height:280px;opacity:0;">
      <div id="lever-arm" style="position:absolute;top:40px;left:30px;width:16px;height:180px;background:linear-gradient(90deg,#888,#fff,#888);border-radius:8px;transform-origin:bottom center;box-shadow:0 0 10px rgba(0,0,0,0.5);"></div>
      <div id="lever-ball" style="position:absolute;top:10px;left:18px;width:40px;height:40px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#FF4444,#CC0000,#880000);box-shadow:0 0 15px rgba(255,23,68,0.8),inset 0 0 10px rgba(0,0,0,0.3);"></div>
      <div style="position:absolute;bottom:0;left:10px;width:56px;height:60px;background:linear-gradient(180deg,#555,#222);border-radius:8px;border:2px solid #888;"></div>
      <div style="position:absolute;bottom:8px;left:0;right:0;text-align:center;font-size:16px;font-weight:900;color:#FFD700;letter-spacing:2px;">PULL</div>
    </div>

  </div>

  <!-- Jackpot flash overlay -->
  <div id="jackpot-overlay" style="position:absolute;inset:0;z-index:200;background:rgba(255,215,0,0);pointer-events:none;"></div>

  <!-- Photo card particles -->
  ${(function() {
    var cards = '';
    for (var i = 0; i < 12; i++) {
      cards += '<div id="coin-' + i + '" style="position:absolute;width:380px;height:500px;padding:14px;background:#f7f0e6;border-radius:18px;border:2px solid rgba(255,255,255,0.7);z-index:180;opacity:0;box-shadow:0 22px 40px rgba(0,0,0,0.4);">' +
        '<img src="' + burstCardData[i] + '" style="width:100%;height:100%;object-fit:cover;border-radius:10px;display:block;" />' +
      '</div>';
    }
    return cards;
  })()}

  <!-- Star particles -->
  ${(function() {
    var stars = '';
    for (var i = 0; i < 20; i++) {
      var ch = i % 3 === 0 ? '★' : (i % 3 === 1 ? '✦' : '✧');
      stars += '<div id="pstar-' + i + '" style="position:absolute;z-index:180;opacity:0;font-size:28px;color:#ffd700;text-shadow:0 0 10px rgba(255,215,0,0.8);">' + ch + '</div>';
    }
    return stars;
  })()}

  <!-- CTA panel -->
  <div id="cta-panel" style="position:absolute;inset:0;z-index:250;background:#0d0d1a;opacity:0;pointer-events:none;">
    <div style="position:absolute;top:0;left:0;right:0;bottom:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px;">
      <div id="cta-sub" style="font-size:28px;color:#aaa;letter-spacing:4px;text-transform:uppercase;margin-bottom:20px;text-align:center;opacity:0;">Your Jackpot is Waiting</div>
      <div id="cta-handle-text" style="
        background:linear-gradient(135deg,#FF1744,#CC0000);
        border-radius:24px;
        padding:32px 70px;
        margin:16px 0;
        opacity:0;
      ">
        <div style="font-size:56px;font-weight:900;color:#fff;text-transform:none;letter-spacing:2px;text-align:center;">@madebyaidan</div>
      </div>
      <div id="cta-dm" style="font-size:36px;font-weight:700;color:#FFD700;letter-spacing:4px;text-transform:uppercase;text-align:center;margin-top:20px;opacity:0;text-shadow:0 0 20px rgba(255,215,0,0.5);">DM for a free shoot</div>
      <div id="cta-free-badge" style="margin-top:30px;opacity:0;">
        <div style="display:inline-block;background:rgba(255,215,0,0.12);border:3px solid #FFD700;border-radius:100px;padding:16px 60px;">
          <span style="font-size:40px;font-weight:900;color:#FFD700;text-transform:uppercase;letter-spacing:4px;">IT'S FREE</span>
        </div>
      </div>
      <div id="cta-loc" style="margin-top:20px;font-size:22px;color:rgba(255,255,255,0.45);letter-spacing:2px;text-transform:uppercase;text-align:center;opacity:0;">limited slots &middot; subic sessions</div>
    </div>
    <!-- CTA sparkles -->
    <div id="cta-sparkles" style="position:absolute;inset:0;pointer-events:none;z-index:1;"></div>
  </div>

</div>

<script>
  var PHOTOS = [
    ${imgArrayEntries}
  ];
  var PHOTO_COUNT = PHOTOS.length;

  // DOM refs
  var marquee = document.getElementById('marquee');
  var slotWrapper = document.getElementById('slot-wrapper');
  var leverContainer = document.getElementById('lever-container');
  var leverArm = document.getElementById('lever-arm');
  var leverBall = document.getElementById('lever-ball');
  var topLeds = document.getElementById('top-leds');
  var bottomLeds = document.getElementById('bottom-leds');
  var jackpotLabel = document.getElementById('jackpot-label');
  var jackpotOverlay = document.getElementById('jackpot-overlay');
  var ctaPanel = document.getElementById('cta-panel');
  var sparklesDiv = document.getElementById('sparkles');

  // ---- Build reel strips ----
  var REEL_CELL_H = 300;
  var REEL_TILE_COUNT = 20;

  function buildReelStrip(reelIdx) {
    var strip = document.getElementById('reel-strip-' + reelIdx);
    var offsets = [0, 3, 6];
    var offset = offsets[reelIdx % 3];
    var html = '';
    for (var i = 0; i < REEL_TILE_COUNT; i++) {
      var photoIdx = (i + offset) % PHOTO_COUNT;
      html += '<div style="width:228px;height:' + REEL_CELL_H + 'px;overflow:hidden;flex-shrink:0;">' +
              '<img src="' + PHOTOS[photoIdx] + '" style="width:100%;height:100%;object-fit:cover;" />' +
              '</div>';
    }
    strip.innerHTML = html;
  }

  function buildLeds(container, count) {
    var html = '';
    for (var i = 0; i < count; i++) {
      var delay = (i * 0.08).toFixed(2);
      html += '<div class="led-dot" style="animation-delay:' + delay + 's;"></div>';
    }
    container.innerHTML = html;
  }

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

  function buildLedBar(id, count) {
    var el = document.getElementById(id);
    var html = '';
    for (var i = 0; i < count; i++) {
      var delay = (i * 0.07).toFixed(2);
      html += '<div class="led-dot" style="width:12px;height:12px;animation-delay:' + delay + 's;"></div>';
    }
    el.innerHTML = html;
  }

  buildReelStrip(0);
  buildReelStrip(1);
  buildReelStrip(2);
  buildLeds(topLeds, 16);
  buildLeds(bottomLeds, 16);
  buildSparkles();
  buildLedBar('led-bar-top', 14);
  buildLedBar('led-bar-bottom', 14);

  // Build CTA sparkles
  (function() {
    var el = document.getElementById('cta-sparkles');
    var html = '';
    for (var i = 0; i < 30; i++) {
      var x = Math.random() * 1080;
      var y = Math.random() * 1920;
      var size = 4 + Math.random() * 10;
      var delay = Math.random() * 3;
      var dur = 1.5 + Math.random() * 2.5;
      html += '<div class="sparkle-star" style="left:' + x + 'px;top:' + y + 'px;width:' + size + 'px;height:' + size + 'px;animation-delay:' + delay + 's;animation-duration:' + dur + 's;"></div>';
    }
    el.innerHTML = html;
  })();

  // ---- Reel helpers ----
  var STRIP_TOTAL_H = REEL_CELL_H * REEL_TILE_COUNT;
  var SPIN_SPEED_PX = 4000;

  function reelTargetOffset(photoIdx) {
    return -(photoIdx * REEL_CELL_H);
  }

  function reelSpinOffset(t_spin, speedMult) {
    var raw = -(t_spin * SPIN_SPEED_PX * (speedMult || 1));
    return ((raw % STRIP_TOTAL_H) - STRIP_TOTAL_H) % STRIP_TOTAL_H;
  }

  function setReelTransform(reelIdx, offsetY, blurPx) {
    var strip = document.getElementById('reel-strip-' + reelIdx);
    if (!strip) return;
    strip.style.transform = 'translateY(' + offsetY + 'px)';
    strip.style.filter = blurPx > 0 ? 'blur(' + blurPx + 'px)' : '';
  }

  function easeOut(x) { return 1 - Math.pow(1 - x, 3); }
  function easeIn(x) { return Math.pow(x, 3); }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function lerp(a, b, t) { return a + (b - a) * clamp(t, 0, 1); }
  function prog(t, start, end) { return clamp((t - start) / (end - start), 0, 1); }

  // ---- Timeline constants ----
  // 0-2s: Machine appears, lever pulled at ~1.5s, spin starts 2s
  // 2-5s: All reels spinning, reel 0 stops at 5s
  // 5-7s: Reel 1 stops at 7s
  // 7-9s: Reel 2 stops at 9s
  // 9-11s: JACKPOT flash, coins/stars
  // 11-13s: Quick slideshow cycling remaining photos in reel windows
  // 13-15s: CTA

  var SPIN_START = 2.0;
  var REEL_STOP = [5.0, 7.0, 9.0];
  var REEL_STOP_PHOTOS = [0, 1, 2]; // photo index each reel lands on
  var DECEL_DUR = 0.6;

  function getReelOffset(reelIdx, t) {
    var stopTime = REEL_STOP[reelIdx];
    var targetPhotoIdx = REEL_STOP_PHOTOS[reelIdx];
    var reelPhotoOffset = [0, 3, 6][reelIdx];
    var stripPos = ((targetPhotoIdx - reelPhotoOffset) % PHOTO_COUNT + PHOTO_COUNT) % PHOTO_COUNT;
    var finalOffset = reelTargetOffset(stripPos);

    if (t < SPIN_START) return reelTargetOffset(0);

    var t_spin = t - SPIN_START;
    var speedMult = 1 + reelIdx * 0.15; // each reel slightly different speed

    if (t < stopTime - DECEL_DUR) {
      return reelSpinOffset(t_spin, speedMult);
    } else if (t < stopTime) {
      var decelProgress = (t - (stopTime - DECEL_DUR)) / DECEL_DUR;
      var easedProgress = easeOut(decelProgress);
      var spinPos = reelSpinOffset(t_spin, speedMult);
      return spinPos + (finalOffset - spinPos) * easedProgress;
    } else {
      return finalOffset;
    }
  }

  function getReelBlur(reelIdx, t) {
    var stopTime = REEL_STOP[reelIdx];
    if (t < SPIN_START) return 0;
    if (t < stopTime - DECEL_DUR) return 8;
    if (t < stopTime) {
      var p = (t - (stopTime - DECEL_DUR)) / DECEL_DUR;
      return 8 * (1 - easeOut(p));
    }
    return 0;
  }

  // Slideshow phase (11-13s): cycle through photos 3-8 in reel windows
  function getSlidePhotoIdx(reelIdx, t) {
    if (t < 11.0 || t >= 13.0) return -1;
    var elapsed = t - 11.0;
    var slideRate = 3.0; // photos per second per reel
    var idx = Math.floor(elapsed * slideRate + reelIdx * 2) % PHOTO_COUNT;
    return idx;
  }

  // Card/star pre-computed data
  function seededRandom(seed) {
    var x = Math.sin(seed * 9301 + 49297) * 49297;
    return x - Math.floor(x);
  }

  var coinData = [];
  for (var ci = 0; ci < 12; ci++) {
    var angle = seededRandom(ci * 7 + 1) * Math.PI * 2;
    var dist = 320 + seededRandom(ci * 13 + 3) * 420;
    coinData.push({
      startX: 540, startY: 800,
      endX: 540 + Math.cos(angle) * dist,
      endY: 820 + Math.sin(angle) * dist - 160,
      delay: seededRandom(ci * 11 + 5) * 0.42,
      rotation: seededRandom(ci * 17 + 7) * 44 - 22,
      scale: 0.88 + seededRandom(ci * 37 + 9) * 0.42,
    });
  }

  var starData = [];
  for (var si = 0; si < 20; si++) {
    var sAngle = seededRandom(si * 19 + 2) * Math.PI * 2;
    var sDist = 150 + seededRandom(si * 23 + 4) * 700;
    starData.push({
      startX: 540, startY: 800,
      endX: 540 + Math.cos(sAngle) * sDist,
      endY: 800 + Math.sin(sAngle) * sDist - 200,
      delay: seededRandom(si * 29 + 6) * 0.5,
      rotation: seededRandom(si * 31 + 8) * 540,
    });
  }

  // Lever angle
  function leverAngleAtTime(t) {
    if (t < 1.5) return 0;
    if (t < 1.75) return 75 * ((t - 1.5) / 0.25);
    if (t < 2.0) return 75 * (1 - ((t - 1.75) / 0.25));
    if (t < 2.1) return 10 * ((t - 2.0) / 0.1);
    if (t < 2.2) return 10 * (1 - ((t - 2.1) / 0.1));
    return 0;
  }

  // ============================================================
  // __applyUpTo
  // ============================================================
  window.__applyUpTo = function(t) {

    sparklesDiv.style.opacity = (t < 13.0) ? '1' : '0';

    // ---- Marquee (0-2s appear, hide at 13s) ----
    if (t < 0.3) {
      marquee.style.opacity = '0';
    } else if (t < 1.0) {
      marquee.style.opacity = String(Math.min(1, (t - 0.3) / 0.5));
    } else if (t < 13.0) {
      marquee.style.opacity = '1';
    } else if (t < 13.5) {
      marquee.style.opacity = String(1 - prog(t, 13.0, 13.5));
    } else {
      marquee.style.opacity = '0';
    }

    // ---- Slot machine (0.5s appear, hide at 13s) ----
    if (t < 0.5) {
      slotWrapper.style.opacity = '0';
    } else if (t < 1.2) {
      slotWrapper.style.opacity = String(Math.min(1, (t - 0.5) / 0.5));
    } else if (t < 13.0) {
      slotWrapper.style.opacity = '1';
    } else if (t < 13.5) {
      slotWrapper.style.opacity = String(1 - prog(t, 13.0, 13.5));
    } else {
      slotWrapper.style.opacity = '0';
    }

    // LEDs
    topLeds.style.opacity = (t >= 1.0 && t < 13.0) ? '1' : '0';
    bottomLeds.style.opacity = (t >= 1.0 && t < 13.0) ? '1' : '0';

    // ---- Lever ----
    leverContainer.style.opacity = (t >= 1.0 && t < 13.0) ? '1' : '0';
    var lAngle = leverAngleAtTime(t);
    leverArm.style.transform = 'rotate(' + lAngle + 'deg)';
    // Move ball with lever arm
    var ballY = Math.sin(lAngle * Math.PI / 180) * 160;
    var ballX = (1 - Math.cos(lAngle * Math.PI / 180)) * 12;
    leverBall.style.transform = 'translate(' + ballX + 'px, ' + ballY + 'px)';

    // ---- Reels ----
    for (var ri = 0; ri < 3; ri++) {
      // During slideshow (11-13s), override reel display
      var slideIdx = getSlidePhotoIdx(ri, t);
      if (slideIdx >= 0) {
        // Show specific photo in reel
        var reelPhotoOffset = [0, 3, 6][ri];
        var stripPos = ((slideIdx - reelPhotoOffset) % PHOTO_COUNT + PHOTO_COUNT) % PHOTO_COUNT;
        setReelTransform(ri, reelTargetOffset(stripPos), 0);
      } else {
        var offset = getReelOffset(ri, t);
        var blur = getReelBlur(ri, t);
        setReelTransform(ri, offset, blur);
      }
    }

    // ---- Machine shake during spin ----
    if (t >= 2.0 && t < 9.0) {
      var shakeAmp = 3;
      var sx = Math.sin(t * 40) * shakeAmp;
      var sy = Math.cos(t * 35) * shakeAmp * 0.4;
      slotWrapper.style.transform = 'translate(' + sx + 'px, ' + sy + 'px)';
    } else {
      slotWrapper.style.transform = '';
    }

    // ---- JACKPOT label (9-11s) ----
    if (t >= 9.0 && t < 11.0) {
      jackpotLabel.style.opacity = '1';
    } else {
      jackpotLabel.style.opacity = '0';
    }

    // ---- Jackpot flash overlay (9-9.8s) ----
    if (t >= 9.0 && t < 9.3) {
      var fa = 0.6 * Math.sin(prog(t, 9.0, 9.3) * Math.PI);
      jackpotOverlay.style.background = 'rgba(255,215,0,' + fa.toFixed(3) + ')';
    } else if (t >= 9.3 && t < 9.6) {
      var fa2 = 0.4 * Math.sin(prog(t, 9.3, 9.6) * Math.PI);
      jackpotOverlay.style.background = 'rgba(255,23,68,' + fa2.toFixed(3) + ')';
    } else if (t >= 9.6 && t < 9.9) {
      var fa3 = 0.3 * Math.sin(prog(t, 9.6, 9.9) * Math.PI);
      jackpotOverlay.style.background = 'rgba(255,215,0,' + fa3.toFixed(3) + ')';
    } else {
      jackpotOverlay.style.background = 'rgba(255,215,0,0)';
    }

    // ---- Photo cards spring out (9-11.5s) ----
    for (var ci2 = 0; ci2 < 12; ci2++) {
      var coin = document.getElementById('coin-' + ci2);
      var cd = coinData[ci2];
      var coinStart = 9.0 + cd.delay;
      var coinEnd = 11.5;
      if (t < coinStart || t >= coinEnd) {
        coin.style.opacity = '0';
      } else {
        var cp = prog(t, coinStart, coinEnd);
        var moveP = easeOut(Math.min(cp / 0.72, 1));
        var settleP = prog(cp, 0.58, 1.0);
        var overshoot = Math.sin(Math.min(moveP, 1) * Math.PI) * 90 * (1 - settleP);
        coin.style.opacity = String(cp < 0.86 ? 1 : lerp(1, 0, prog(cp, 0.86, 1.0)));
        var ex = lerp(cd.startX, cd.endX, moveP);
        var ey = lerp(cd.startY, cd.endY, moveP) - overshoot;
        coin.style.left = (ex - 190) + 'px';
        coin.style.top = (ey - 250) + 'px';
        coin.style.transform = 'rotate(' + (cd.rotation * moveP) + 'deg) scale(' + lerp(0.28, cd.scale, moveP) + ')';
      }
    }

    // ---- Stars (9-11.5s) ----
    for (var si2 = 0; si2 < 20; si2++) {
      var star = document.getElementById('pstar-' + si2);
      var sd = starData[si2];
      var starStart = 9.1 + sd.delay;
      var starEnd = 11.5;
      if (t < starStart || t >= starEnd) {
        star.style.opacity = '0';
      } else {
        var stp = prog(t, starStart, starEnd);
        star.style.opacity = String(stp < 0.7 ? 1 : lerp(1, 0, prog(stp, 0.7, 1.0)));
        var stx = lerp(sd.startX, sd.endX, easeOut(stp));
        var sty = lerp(sd.startY, sd.endY, easeOut(stp));
        star.style.left = (stx - 14) + 'px';
        star.style.top = (sty - 14) + 'px';
        star.style.transform = 'rotate(' + (sd.rotation * stp) + 'deg) scale(' + lerp(0.5, 1.5, easeOut(stp)) + ')';
      }
    }

    // ---- CTA (13-15s) ----
    var ctaSub = document.getElementById('cta-sub');
    var ctaHandle = document.getElementById('cta-handle-text');
    var ctaDm = document.getElementById('cta-dm');
    var ctaBadge = document.getElementById('cta-free-badge');
    var ctaLoc = document.getElementById('cta-loc');

    if (t < 13.0) {
      ctaPanel.style.opacity = '0';
    } else if (t < 13.3) {
      ctaPanel.style.opacity = String(prog(t, 13.0, 13.3));
      ctaSub.style.opacity = '0';
      ctaHandle.style.opacity = '0';
      ctaDm.style.opacity = '0';
      ctaBadge.style.opacity = '0';
      ctaLoc.style.opacity = '0';
    } else {
      ctaPanel.style.opacity = '1';

      // Stagger elements
      ctaSub.style.opacity = String(Math.min(1, prog(t, 13.3, 13.7)));
      ctaSub.style.transform = 'translateY(' + lerp(20, 0, prog(t, 13.3, 13.7)) + 'px)';

      ctaHandle.style.opacity = String(Math.min(1, prog(t, 13.6, 14.0)));
      ctaHandle.style.transform = 'translateY(' + lerp(25, 0, easeOut(prog(t, 13.6, 14.0))) + 'px)';

      ctaDm.style.opacity = String(Math.min(1, prog(t, 14.0, 14.3)));
      ctaDm.style.transform = 'translateY(' + lerp(20, 0, prog(t, 14.0, 14.3)) + 'px)';

      ctaBadge.style.opacity = String(Math.min(1, prog(t, 14.2, 14.6)));
      ctaBadge.style.transform = 'scale(' + lerp(0.8, 1, easeOut(prog(t, 14.2, 14.6))) + ')';

      ctaLoc.style.opacity = String(Math.min(1, prog(t, 14.4, 14.8)));
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
  console.log('=== Subic Slot Machine Reel v59f-subic ===');
  resetOutputDir();

  console.log('Processing photos...');
  var imageDataMap = processPhotos();

  var html = buildHTML(imageDataMap);
  var htmlPath = path.join(OUT_DIR, 'index.html');
  writeFileSync(htmlPath, html);
  console.log('HTML written: ' + htmlPath);

  var framesDir = TEMP_FRAMES_DIR;
  rmSync(framesDir, { recursive: true, force: true });
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
    if (frame % (FPS * 3) === 0) {
      console.log('  ' + t.toFixed(1) + 's / ' + TOTAL_DURATION + 's');
    }
  }

  await browser.close();
  console.log('All frames captured');

  var outputMp4 = path.join(OUT_DIR, '59f-slot-machine-subic.mp4');
  execSync(
    'ffmpeg -y -framerate ' + FPS + ' -i "' + path.join(framesDir, 'frame_%05d.png') + '" ' +
    '-c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r ' + FPS + ' -an "' + outputMp4 + '"',
    { stdio: 'inherit' }
  );

  rmSync(framesDir, { recursive: true, force: true });

  var reelsDir = path.join(__dirname, 'reels');
  if (!existsSync(reelsDir)) mkdirSync(reelsDir, { recursive: true });
  var reelsDest = path.join(reelsDir, '59f-slot-machine-subic.mp4');
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
