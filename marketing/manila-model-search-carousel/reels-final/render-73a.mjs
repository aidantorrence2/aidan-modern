import { chromium } from 'playwright';
import { execSync } from 'child_process';
import { mkdirSync, rmSync, existsSync, readFileSync, writeFileSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

var __dirname = path.dirname(fileURLToPath(import.meta.url));
var OUT_DIR = path.join(__dirname, 'output-73a');
var FILM_SCANS_DIR = '/Volumes/PortableSSD/Exports/film scans selected';
var W = 1080, H = 1920, FPS = 30;
var TOTAL_DURATION = 14;
var TOTAL_FRAMES = FPS * TOTAL_DURATION; // 420

var PHOTO_NAMES = [
  'DSC_0004.jpg', 'DSC_0045.jpg', 'DSC_0097.jpg', 'DSC_0271.jpg',
  'DSC_0316.jpg', 'DSC_0675.jpg', 'DSC_0740.jpg', 'DSC_0841.jpg',
  'DSC_0957.jpg', 'DSC_0162-2.jpg',
];

// Safe zones
var SAFE_TOP = 213, SAFE_BOTTOM = 430;

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

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: ${W}px; height: ${H}px; overflow: hidden; background: #0a0a0a; font-family: 'Courier New', monospace; }

  .scanline-overlay {
    position: absolute; inset: 0; pointer-events: none; z-index: 900;
    background: repeating-linear-gradient(
      to bottom,
      transparent 0px,
      transparent 2px,
      rgba(0,0,0,0.15) 2px,
      rgba(0,0,0,0.15) 4px
    );
  }

  .cam-feed {
    position: absolute;
    border: 2px solid #00ff00;
    border-radius: 8px;
    overflow: hidden;
    background: #000;
  }

  .cam-feed img {
    width: 100%; height: 100%;
    object-fit: cover;
    filter: sepia(0.3) hue-rotate(80deg) saturate(0.7) brightness(0.85);
  }

  .cam-label {
    position: absolute; top: 6px; left: 8px;
    font-size: 14px; color: #00ff00; font-family: 'Courier New', monospace;
    font-weight: bold; text-shadow: 0 0 6px #00ff00;
    z-index: 10;
  }

  .cam-timestamp {
    position: absolute; bottom: 6px; right: 8px;
    font-size: 12px; color: #00ff00; font-family: 'Courier New', monospace;
    text-shadow: 0 0 6px #00ff00;
    z-index: 10;
  }

  .cam-rec {
    position: absolute; top: 6px; right: 8px;
    font-size: 12px; color: #ff0000; font-family: 'Courier New', monospace;
    font-weight: bold; text-shadow: 0 0 6px #ff0000;
    z-index: 10;
  }

  .static-overlay {
    position: absolute; inset: 0; z-index: 5; opacity: 0;
    background: repeating-linear-gradient(
      0deg,
      rgba(255,255,255,0.1) 0px,
      rgba(0,0,0,0.2) 1px,
      rgba(255,255,255,0.05) 2px,
      rgba(0,0,0,0.15) 3px
    );
  }

  .interference-line {
    position: absolute; left: 0; right: 0; height: 4px;
    background: rgba(0,255,0,0.3);
    z-index: 6; opacity: 0;
  }
</style>
</head>
<body>
<div id="root" style="width:${W}px;height:${H}px;position:relative;overflow:hidden;background:#0a0a0a;">

  <!-- Global scanline overlay -->
  <div class="scanline-overlay"></div>

  <!-- Boot text -->
  <div id="boot-text" style="position:absolute;top:${SAFE_TOP + 60}px;left:60px;z-index:100;opacity:0;">
    <div id="boot-line1" style="font-size:28px;color:#00ff00;font-family:'Courier New',monospace;font-weight:bold;text-shadow:0 0 10px #00ff00;margin-bottom:20px;opacity:0;">MANILA SURVEILLANCE SYSTEM v4.2</div>
    <div id="boot-line2" style="font-size:20px;color:#00ff00;font-family:'Courier New',monospace;text-shadow:0 0 8px #00ff00;margin-bottom:10px;opacity:0;">Initializing feeds...</div>
    <div id="boot-line3" style="font-size:20px;color:#00ff00;font-family:'Courier New',monospace;text-shadow:0 0 8px #00ff00;margin-bottom:10px;opacity:0;">CONNECTING TO CAMERAS...</div>
    <div id="boot-line4" style="font-size:16px;color:#00aa00;font-family:'Courier New',monospace;text-shadow:0 0 6px #00aa00;opacity:0;">[ OK ] 10 feeds detected</div>
  </div>

  <!-- Grid container - holds 4 camera feeds in 2x2 -->
  <div id="grid-container" style="position:absolute;top:${SAFE_TOP + 40}px;left:40px;width:1000px;height:1240px;z-index:50;opacity:0;">
    <!-- CAM 01 -->
    <div id="cam-0" class="cam-feed" style="top:0;left:0;width:488px;height:608px;">
      <img id="cam-img-0" src="" />
      <div class="cam-label">CAM 01</div>
      <div id="cam-ts-0" class="cam-timestamp">00:00:00</div>
      <div class="cam-rec">● REC</div>
      <div id="static-0" class="static-overlay"></div>
      <div id="interf-0" class="interference-line" style="top:100px;"></div>
    </div>
    <!-- CAM 02 -->
    <div id="cam-1" class="cam-feed" style="top:0;left:512px;width:488px;height:608px;">
      <img id="cam-img-1" src="" />
      <div class="cam-label">CAM 02</div>
      <div id="cam-ts-1" class="cam-timestamp">00:00:00</div>
      <div class="cam-rec">● REC</div>
      <div id="static-1" class="static-overlay"></div>
      <div id="interf-1" class="interference-line" style="top:200px;"></div>
    </div>
    <!-- CAM 03 -->
    <div id="cam-2" class="cam-feed" style="top:632px;left:0;width:488px;height:608px;">
      <img id="cam-img-2" src="" />
      <div class="cam-label">CAM 03</div>
      <div id="cam-ts-2" class="cam-timestamp">00:00:00</div>
      <div class="cam-rec">● REC</div>
      <div id="static-2" class="static-overlay"></div>
      <div id="interf-2" class="interference-line" style="top:150px;"></div>
    </div>
    <!-- CAM 04 -->
    <div id="cam-3" class="cam-feed" style="top:632px;left:512px;width:488px;height:608px;">
      <img id="cam-img-3" src="" />
      <div class="cam-label">CAM 04</div>
      <div id="cam-ts-3" class="cam-timestamp">00:00:00</div>
      <div class="cam-rec">● REC</div>
      <div id="static-3" class="static-overlay"></div>
      <div id="interf-3" class="interference-line" style="top:250px;"></div>
    </div>
  </div>

  <!-- Full-screen camera feed -->
  <div id="fullscreen-feed" style="position:absolute;top:${SAFE_TOP}px;left:0;width:${W}px;height:${H - SAFE_TOP - SAFE_BOTTOM}px;z-index:60;opacity:0;overflow:hidden;">
    <img id="fullscreen-img" src="" style="width:100%;height:100%;object-fit:cover;filter:sepia(0.3) hue-rotate(80deg) saturate(0.7) brightness(0.85);border-radius:8px;" />
    <div id="fs-cam-label" class="cam-label" style="font-size:22px;top:12px;left:16px;">CAM 01</div>
    <div id="fs-cam-ts" class="cam-timestamp" style="font-size:18px;bottom:12px;right:16px;">00:00:00</div>
    <div id="fs-cam-rec" class="cam-rec" style="font-size:18px;top:12px;right:16px;">● REC</div>
    <div id="fs-static" class="static-overlay"></div>
    <div id="fs-interf" class="interference-line" style="top:200px;"></div>
    <div style="position:absolute;inset:0;border:3px solid #00ff00;border-radius:8px;pointer-events:none;z-index:10;"></div>
  </div>

  <!-- Static transition overlay -->
  <div id="static-transition" style="position:absolute;inset:0;z-index:70;opacity:0;pointer-events:none;">
    <canvas id="static-canvas" width="${W}" height="${H}" style="width:100%;height:100%;"></canvas>
  </div>

  <!-- CTA overlay -->
  <div id="cta-overlay" style="position:absolute;inset:0;z-index:200;background:#0a0a0a;opacity:0;pointer-events:none;">
    <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;">
      <div id="cta-identified" style="font-size:36px;font-weight:bold;color:#ff0000;font-family:'Courier New',monospace;text-shadow:0 0 20px #ff0000;letter-spacing:6px;opacity:0;">▶ SUBJECT IDENTIFIED ◀</div>
      <div id="cta-handle" style="margin-top:40px;opacity:0;">
        <div style="border:3px solid #00ff00;border-radius:12px;padding:24px 60px;background:rgba(0,255,0,0.05);">
          <div style="font-size:52px;font-weight:bold;color:#00ff00;font-family:'Courier New',monospace;text-shadow:0 0 15px #00ff00;">@madebyaidan</div>
        </div>
      </div>
      <div id="cta-dm" style="margin-top:30px;font-size:28px;color:#00ff00;font-family:'Courier New',monospace;text-shadow:0 0 10px #00ff00;letter-spacing:3px;opacity:0;">DM for a free photo shoot</div>
    </div>
    <div class="scanline-overlay"></div>
  </div>

  <!-- System info bar at bottom -->
  <div id="sys-bar" style="position:absolute;bottom:${SAFE_BOTTOM + 10}px;left:40px;right:40px;z-index:80;opacity:0;">
    <div style="display:flex;justify-content:space-between;font-size:13px;color:#00aa00;font-family:'Courier New',monospace;text-shadow:0 0 4px #00aa00;">
      <span>SYS: ACTIVE</span>
      <span id="sys-date">2026-03-14</span>
      <span id="sys-time">00:00:00</span>
      <span>DISK: 82%</span>
    </div>
  </div>

</div>

<script>
  var PHOTOS = [
    ${imgArrayEntries}
  ];
  var PHOTO_COUNT = PHOTOS.length;

  // Pre-draw static noise on canvas
  var staticCanvas = document.getElementById('static-canvas');
  var staticCtx = staticCanvas.getContext('2d');

  function drawStatic() {
    var imageData = staticCtx.createImageData(${W}, ${H});
    var data = imageData.data;
    for (var i = 0; i < data.length; i += 4) {
      var v = Math.random() * 255;
      data[i] = v;
      data[i+1] = v;
      data[i+2] = v;
      data[i+3] = 255;
    }
    staticCtx.putImageData(imageData, 0, 0);
  }
  drawStatic();

  // Set initial cam images
  for (var ci = 0; ci < 4; ci++) {
    document.getElementById('cam-img-' + ci).src = PHOTOS[ci];
  }

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function lerp(a, b, t) { return a + (b - a) * clamp(t, 0, 1); }
  function prog(t, start, end) { return clamp((t - start) / (end - start), 0, 1); }
  function easeOut(x) { return 1 - Math.pow(1 - x, 3); }
  function easeIn(x) { return Math.pow(x, 3); }

  function formatTime(t) {
    var totalSec = Math.floor(t * 47 + 32400); // start from 09:00:00
    var h = Math.floor(totalSec / 3600) % 24;
    var m = Math.floor((totalSec % 3600) / 60);
    var s = totalSec % 60;
    return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  }

  function seededRandom(seed) {
    var x = Math.sin(seed * 9301 + 49297) * 49297;
    return x - Math.floor(x);
  }

  // Timeline:
  // 0-1s: Boot text
  // 1-3s: 2x2 grid with 4 photos (0,1,2,3)
  // 3-5s: Grid feed swaps (some go static then show new photos)
  // 5-8s: One feed expands full-screen, cycle through photos
  // 8-11s: Continue full-screen cycling
  // 11-12.5s: Return to grid with final 4 photos
  // 12.5-14s: CTA

  // Photo assignment for grid phases:
  // Phase 1 (1-3s): photos 0,1,2,3
  // Phase 2 (3-5s): swap cam1->photo4, cam2->photo5, cam3->photo6 (staggered)
  // Full-screen (5-11s): photos 4,5,6,7,8 cycling
  // Final grid (11-12.5s): photos 6,7,8,9

  var gridPhotoIdx = [0, 1, 2, 3]; // current photo index for each cam

  window.__applyUpTo = function(t) {
    var bootText = document.getElementById('boot-text');
    var bootLine1 = document.getElementById('boot-line1');
    var bootLine2 = document.getElementById('boot-line2');
    var bootLine3 = document.getElementById('boot-line3');
    var bootLine4 = document.getElementById('boot-line4');
    var gridContainer = document.getElementById('grid-container');
    var fullscreenFeed = document.getElementById('fullscreen-feed');
    var fullscreenImg = document.getElementById('fullscreen-img');
    var staticTransition = document.getElementById('static-transition');
    var ctaOverlay = document.getElementById('cta-overlay');
    var sysBar = document.getElementById('sys-bar');

    // Update system time
    document.getElementById('sys-time').textContent = formatTime(t);

    // ---- BOOT TEXT (0-1s) ----
    if (t < 1.0) {
      bootText.style.opacity = '1';
      bootLine1.style.opacity = t >= 0.1 ? '1' : '0';
      bootLine2.style.opacity = t >= 0.3 ? '1' : '0';
      bootLine3.style.opacity = t >= 0.5 ? '1' : '0';
      bootLine4.style.opacity = t >= 0.8 ? '1' : '0';
      gridContainer.style.opacity = '0';
      fullscreenFeed.style.opacity = '0';
      sysBar.style.opacity = '0';
    } else if (t < 1.3) {
      // Fade boot out, grid in
      var fadeP = prog(t, 1.0, 1.3);
      bootText.style.opacity = String(1 - fadeP);
      gridContainer.style.opacity = String(fadeP);
      sysBar.style.opacity = String(fadeP);
      fullscreenFeed.style.opacity = '0';
    } else {
      bootText.style.opacity = '0';
    }

    // ---- UPDATE TIMESTAMPS on grid cams ----
    for (var ci2 = 0; ci2 < 4; ci2++) {
      document.getElementById('cam-ts-' + ci2).textContent = formatTime(t + ci2 * 0.3);
    }
    document.getElementById('fs-cam-ts').textContent = formatTime(t);

    // ---- GRID PHASE 1 (1-3s): Show photos 0,1,2,3 ----
    if (t >= 1.0 && t < 3.0) {
      gridContainer.style.opacity = '1';
      fullscreenFeed.style.opacity = '0';
      sysBar.style.opacity = '1';

      // Set initial photos
      for (var g = 0; g < 4; g++) {
        document.getElementById('cam-img-' + g).src = PHOTOS[g];
        gridPhotoIdx[g] = g;
      }

      // Random scan line interference
      for (var si = 0; si < 4; si++) {
        var interf = document.getElementById('interf-' + si);
        var interfSeed = Math.floor(t * 8) * 7 + si * 13;
        var interfShow = seededRandom(interfSeed) > 0.65;
        interf.style.opacity = interfShow ? '0.8' : '0';
        interf.style.top = (seededRandom(interfSeed + 3) * 500 + 50) + 'px';
      }
    }

    // ---- GRID PHASE 2 (3-5s): Swap some feeds ----
    if (t >= 3.0 && t < 5.0) {
      gridContainer.style.opacity = '1';
      fullscreenFeed.style.opacity = '0';
      sysBar.style.opacity = '1';

      // Cam 0 swaps to photo 4 at t=3.2
      if (t >= 3.2) {
        document.getElementById('cam-img-0').src = PHOTOS[4];
        document.getElementById('static-0').style.opacity = (t >= 3.0 && t < 3.2) ? '0.9' : '0';
      } else {
        document.getElementById('cam-img-0').src = PHOTOS[0];
        document.getElementById('static-0').style.opacity = (t >= 3.0) ? String(0.9 * prog(t, 3.0, 3.2)) : '0';
      }

      // Cam 1 swaps to photo 5 at t=3.6
      if (t >= 3.6) {
        document.getElementById('cam-img-1').src = PHOTOS[5];
        document.getElementById('static-1').style.opacity = (t >= 3.4 && t < 3.6) ? '0.9' : '0';
      } else if (t >= 3.4) {
        document.getElementById('static-1').style.opacity = String(0.9 * prog(t, 3.4, 3.6));
      } else {
        document.getElementById('cam-img-1').src = PHOTOS[1];
        document.getElementById('static-1').style.opacity = '0';
      }

      // Cam 2 swaps to photo 6 at t=4.2
      if (t >= 4.2) {
        document.getElementById('cam-img-2').src = PHOTOS[6];
        document.getElementById('static-2').style.opacity = '0';
      } else if (t >= 4.0) {
        document.getElementById('static-2').style.opacity = String(0.9 * prog(t, 4.0, 4.2));
      } else {
        document.getElementById('cam-img-2').src = PHOTOS[2];
        document.getElementById('static-2').style.opacity = '0';
      }

      // Cam 3 stays
      document.getElementById('cam-img-3').src = PHOTOS[3];
      document.getElementById('static-3').style.opacity = '0';

      // Interference
      for (var si2 = 0; si2 < 4; si2++) {
        var interf2 = document.getElementById('interf-' + si2);
        var interfSeed2 = Math.floor(t * 8) * 7 + si2 * 13;
        var interfShow2 = seededRandom(interfSeed2) > 0.6;
        interf2.style.opacity = interfShow2 ? '0.8' : '0';
        interf2.style.top = (seededRandom(interfSeed2 + 3) * 500 + 50) + 'px';
      }
    }

    // ---- TRANSITION TO FULLSCREEN (5-5.5s) ----
    if (t >= 4.8 && t < 5.3) {
      // Static transition
      var stP = 0;
      if (t < 5.0) {
        stP = prog(t, 4.8, 5.0);
      } else {
        stP = 1 - prog(t, 5.0, 5.3);
      }
      staticTransition.style.opacity = String(stP * 0.8);

      if (t >= 5.0) {
        gridContainer.style.opacity = '0';
        fullscreenFeed.style.opacity = '1';
        fullscreenImg.src = PHOTOS[4];
        document.getElementById('fs-cam-label').textContent = 'CAM 01';
      }
    }

    // ---- FULLSCREEN CYCLING (5-11s) ----
    if (t >= 5.3 && t < 11.0) {
      gridContainer.style.opacity = '0';
      fullscreenFeed.style.opacity = '1';
      sysBar.style.opacity = '1';

      // Cycle photos: 4,5,6,7,8,9 — each shown for ~1s with static between
      var fsPhotos = [4, 5, 6, 7, 8, 9];
      var fsDuration = 1.0; // each photo duration
      var fsTransition = 0.2; // static transition duration
      var fsCycleStart = 5.0;
      var elapsed = t - fsCycleStart;
      var cyclePeriod = fsDuration + fsTransition;
      var cycleIdx = Math.floor(elapsed / cyclePeriod);
      var cycleTime = elapsed - cycleIdx * cyclePeriod;

      if (cycleIdx >= fsPhotos.length) cycleIdx = fsPhotos.length - 1;

      var currentPhoto = fsPhotos[Math.min(cycleIdx, fsPhotos.length - 1)];
      fullscreenImg.src = PHOTOS[currentPhoto];
      document.getElementById('fs-cam-label').textContent = 'CAM ' + String(currentPhoto + 1).padStart(2, '0');

      // Static during transitions
      if (cycleTime > fsDuration && cycleIdx < fsPhotos.length - 1) {
        staticTransition.style.opacity = '0.7';
        // Redraw static for variation
        if (Math.floor(t * 10) % 2 === 0) drawStatic();
      } else {
        staticTransition.style.opacity = '0';
      }

      // Interference on fullscreen
      var fsInterf = document.getElementById('fs-interf');
      var fsSeed = Math.floor(t * 6) * 11;
      var fsInterfShow = seededRandom(fsSeed) > 0.55;
      fsInterf.style.opacity = fsInterfShow ? '0.6' : '0';
      fsInterf.style.top = (seededRandom(fsSeed + 7) * 800 + 100) + 'px';

      // Zoom/scale effect
      var scaleP = 1.0 + 0.02 * Math.sin(t * 0.8);
      fullscreenImg.style.transform = 'scale(' + scaleP + ')';
    }

    // ---- TRANSITION BACK TO GRID (10.7-11.3s) ----
    if (t >= 10.7 && t < 11.3) {
      var backP = 0;
      if (t < 11.0) {
        backP = prog(t, 10.7, 11.0);
        staticTransition.style.opacity = String(backP * 0.8);
      } else {
        backP = 1 - prog(t, 11.0, 11.3);
        staticTransition.style.opacity = String(backP * 0.8);
        fullscreenFeed.style.opacity = '0';
        gridContainer.style.opacity = '1';
      }
    }

    // ---- FINAL GRID (11-12.5s): photos 6,7,8,9 ----
    if (t >= 11.0 && t < 12.5) {
      gridContainer.style.opacity = '1';
      fullscreenFeed.style.opacity = '0';
      sysBar.style.opacity = '1';
      staticTransition.style.opacity = t < 11.3 ? String((1 - prog(t, 11.0, 11.3)) * 0.6) : '0';

      document.getElementById('cam-img-0').src = PHOTOS[6];
      document.getElementById('cam-img-1').src = PHOTOS[7];
      document.getElementById('cam-img-2').src = PHOTOS[8];
      document.getElementById('cam-img-3').src = PHOTOS[9];

      document.getElementById('static-0').style.opacity = '0';
      document.getElementById('static-1').style.opacity = '0';
      document.getElementById('static-2').style.opacity = '0';
      document.getElementById('static-3').style.opacity = '0';

      // Interference
      for (var si3 = 0; si3 < 4; si3++) {
        var interf3 = document.getElementById('interf-' + si3);
        var interfSeed3 = Math.floor(t * 8) * 7 + si3 * 17;
        var interfShow3 = seededRandom(interfSeed3) > 0.65;
        interf3.style.opacity = interfShow3 ? '0.7' : '0';
        interf3.style.top = (seededRandom(interfSeed3 + 5) * 500 + 50) + 'px';
      }
    }

    // ---- CTA TRANSITION (12.3-12.5s) ----
    if (t >= 12.3 && t < 12.5) {
      staticTransition.style.opacity = String(prog(t, 12.3, 12.5) * 0.9);
    }

    // ---- CTA (12.5-14s) ----
    var ctaIdentified = document.getElementById('cta-identified');
    var ctaHandle = document.getElementById('cta-handle');
    var ctaDm = document.getElementById('cta-dm');

    if (t < 12.5) {
      ctaOverlay.style.opacity = '0';
    } else {
      gridContainer.style.opacity = '0';
      fullscreenFeed.style.opacity = '0';
      sysBar.style.opacity = '0';
      staticTransition.style.opacity = t < 12.7 ? String((1 - prog(t, 12.5, 12.7)) * 0.7) : '0';

      ctaOverlay.style.opacity = String(Math.min(1, prog(t, 12.5, 12.7)));

      // "SUBJECT IDENTIFIED" flashing
      var flashRate = Math.floor(t * 6) % 2;
      ctaIdentified.style.opacity = t >= 12.6 ? (flashRate === 0 ? '1' : '0.3') : '0';

      // Handle
      ctaHandle.style.opacity = String(Math.min(1, prog(t, 13.0, 13.3)));
      ctaHandle.style.transform = 'translateY(' + lerp(30, 0, easeOut(prog(t, 13.0, 13.3))) + 'px)';

      // DM CTA
      ctaDm.style.opacity = String(Math.min(1, prog(t, 13.3, 13.6)));
      ctaDm.style.transform = 'translateY(' + lerp(20, 0, easeOut(prog(t, 13.3, 13.6))) + 'px)';
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
  console.log('=== Manila Security Camera Grid Reel v73a ===');
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
    if (frame % (FPS * 3) === 0) {
      console.log('  ' + t.toFixed(1) + 's / ' + TOTAL_DURATION + 's');
    }
  }

  await browser.close();
  console.log('All frames captured');

  var outputMp4 = path.join(OUT_DIR, '73a-security-cam.mp4');
  execSync(
    'ffmpeg -y -framerate ' + FPS + ' -i "' + path.join(framesDir, 'frame_%05d.png') + '" ' +
    '-c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r ' + FPS + ' -an "' + outputMp4 + '"',
    { stdio: 'inherit' }
  );

  rmSync(framesDir, { recursive: true, force: true });

  var reelsDir = path.join(__dirname, 'reels');
  if (!existsSync(reelsDir)) mkdirSync(reelsDir, { recursive: true });
  var reelsDest = path.join(reelsDir, '73a-security-cam.mp4');
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
