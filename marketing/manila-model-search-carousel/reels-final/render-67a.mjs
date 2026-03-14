import { chromium } from 'playwright';
import { execSync } from 'child_process';
import { mkdirSync, rmSync, existsSync, readFileSync, writeFileSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

var __dirname = path.dirname(fileURLToPath(import.meta.url));
var OUT_DIR = path.join(__dirname, 'output-67a');

var W = 1080;
var H = 1920;
var FPS = 30;
var TOTAL_FRAMES = 720; // 24s at 30fps
var TOTAL_DURATION = 24;

var FILM_SCANS_DIR = '/Volumes/PortableSSD/Exports/film scans';
var PHOTO_NAMES = [
  'DSC_0718.jpg',
  'DSC_0723.jpg',
  'DSC_0725.jpg',
  'DSC_0732.jpg',
  'DSC_0739.jpg',
  'DSC_0751.jpg',
  'DSC_0754.jpg',
  'DSC_0765.jpg',
];

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
  // Build 8 photo img tags
  var photoImgs = PHOTO_NAMES.map(function(name, i) {
    return '<img id="photo-' + i + '" src="' + imageDataMap[name] + '" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:none;" />';
  }).join('\n      ');

  // Build 15 horizontal slice strips (each 128px tall = 1920/15 ≈ 128)
  var STRIP_COUNT = 15;
  var STRIP_H = Math.ceil(H / STRIP_COUNT);
  var strips = [];
  for (var s = 0; s < STRIP_COUNT; s++) {
    var topPx = s * STRIP_H;
    // Each strip clips its content to show only its band
    strips.push(
      '<div class="glitch-strip" id="strip-' + s + '" ' +
      'style="position:absolute;left:0;width:100%;height:' + STRIP_H + 'px;top:' + topPx + 'px;' +
      'overflow:hidden;transform:translateX(0);will-change:transform;">' +
      '<div class="strip-inner" id="strip-inner-' + s + '" ' +
      'style="position:absolute;top:-' + topPx + 'px;left:0;width:100%;height:' + H + 'px;">' +
      '</div></div>'
    );
  }
  var stripHTML = strips.join('\n');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { margin: 0; padding: 0; background: #000; font-family: 'Courier New', monospace; overflow: hidden; }

  @keyframes scanMove {
    0% { background-position: 0 0; }
    100% { background-position: 0 100px; }
  }
  @keyframes cursorBlink {
    0%, 49% { opacity: 1; }
    50%, 100% { opacity: 0; }
  }
  @keyframes rgbPulse {
    0%, 100% { text-shadow: -8px 0 #FF0000, 8px 0 #0000FF, 0 0 #00FF00; filter: none; }
    25% { text-shadow: -6px 2px #FF00FF, 6px -2px #00FFFF, 0 0 #00FF00; filter: hue-rotate(10deg); }
    50% { text-shadow: -10px 0 #FF0000, 10px 0 #0000FF, 0 0 #00FF00; filter: none; }
    75% { text-shadow: -4px -2px #FF0000, 4px 2px #00FFFF, 0 0 #00FF00; filter: hue-rotate(-10deg); }
  }
  @keyframes pixelBlockFlash {
    0%, 100% { opacity: 0; }
    50% { opacity: 1; }
  }
  @keyframes glitchChar {
    0% { content: 'A'; }
    10% { content: '#'; }
    20% { content: '@'; }
    30% { content: '%'; }
    40% { content: '!'; }
    50% { content: 'X'; }
    60% { content: '&'; }
    70% { content: '0'; }
    80% { content: '$'; }
    90% { content: '*'; }
    100% { content: 'A'; }
  }

  .scanlines {
    position: absolute;
    inset: 0;
    z-index: 900;
    pointer-events: none;
    background: repeating-linear-gradient(
      0deg,
      rgba(0,0,0,0.15) 0px,
      rgba(0,0,0,0.15) 1px,
      transparent 1px,
      transparent 3px
    );
  }

  .pixel-block {
    position: absolute;
    pointer-events: none;
  }

  .glitch-strip {
    z-index: 50;
  }

  /* RGB channel layers for photos */
  .rgb-photo {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  /* Typing cursor */
  .cursor {
    display: inline-block;
    animation: cursorBlink 0.5s step-end infinite;
  }

  /* Neon glow text styles */
  .neon-cyan {
    color: #00FFFF;
    text-shadow: 0 0 10px #00FFFF, 0 0 20px #00FFFF, 0 0 40px #00FFFF;
  }
  .neon-magenta {
    color: #FF00FF;
    text-shadow: 0 0 10px #FF00FF, 0 0 20px #FF00FF, 0 0 40px #FF00FF;
  }
  .neon-lime {
    color: #00FF00;
    text-shadow: 0 0 10px #00FF00, 0 0 20px #00FF00, 0 0 40px #00FF00;
  }

</style>
</head>
<body>
  <div id="root" style="width:${W}px;height:${H}px;position:relative;overflow:hidden;background:#000;">

    <!-- ======================== PHOTO LAYER (full bleed) ======================== -->
    <div id="photo-layer" style="position:absolute;inset:0;z-index:10;display:none;">
      <!-- Red channel copy -->
      <img id="photo-red" src="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;mix-blend-mode:screen;filter:saturate(0) sepia(1) hue-rotate(-50deg) saturate(5) brightness(0.8);transform:translateX(-8px);opacity:0.7;" />
      <!-- Blue channel copy -->
      <img id="photo-blue" src="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;mix-blend-mode:screen;filter:saturate(0) sepia(1) hue-rotate(200deg) saturate(5) brightness(0.8);transform:translateX(8px);opacity:0.7;" />
      <!-- Main photo -->
      <img id="photo-main" src="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;" />
    </div>

    <!-- ======================== GLITCH STRIPS (over photo) ======================== -->
    <!-- These clip the photo into horizontal bands that can be displaced -->
    <div id="strips-container" style="position:absolute;inset:0;z-index:60;pointer-events:none;display:none;">
      ${stripHTML}
    </div>

    <!-- ======================== PIXEL BLOCK ARTIFACTS ======================== -->
    <div id="pixel-blocks" style="position:absolute;inset:0;z-index:200;pointer-events:none;"></div>

    <!-- ======================== SCANLINES ======================== -->
    <div class="scanlines" id="scanlines" style="opacity:0.5;"></div>

    <!-- ======================== INTRO SCREEN (0-2s) ======================== -->
    <div id="intro-screen" style="position:absolute;inset:0;z-index:300;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:60px;">

      <!-- MANILA title with RGB split layers -->
      <div id="intro-manila" style="position:relative;display:none;">
        <!-- Red copy -->
        <div style="position:absolute;top:0;left:-8px;font-size:140px;font-weight:900;color:#FF0000;font-family:'Courier New',monospace;letter-spacing:12px;mix-blend-mode:screen;opacity:0.8;">MANILA</div>
        <!-- Blue copy -->
        <div style="position:absolute;top:0;left:8px;font-size:140px;font-weight:900;color:#0000FF;font-family:'Courier New',monospace;letter-spacing:12px;mix-blend-mode:screen;opacity:0.8;">MANILA</div>
        <!-- Main white -->
        <div id="manila-main" style="position:relative;font-size:140px;font-weight:900;color:#fff;font-family:'Courier New',monospace;letter-spacing:12px;">MANILA</div>
      </div>

      <!-- FREE PHOTO SHOOT with slice displacement -->
      <div id="intro-sub" style="position:relative;display:none;overflow:hidden;">
        <!-- Slice version — 3 rows of text each shifted -->
        <div id="sub-row1" style="font-size:52px;font-weight:700;color:#00FFFF;font-family:'Courier New',monospace;letter-spacing:6px;transform:translateX(0);text-shadow:0 0 20px #00FFFF;">FREE PHOTO SHOOT</div>
        <div id="sub-row2" style="font-size:52px;font-weight:700;color:#FF00FF;font-family:'Courier New',monospace;letter-spacing:6px;transform:translateX(0);margin-top:-52px;clip-path:inset(40% 0 40% 0);text-shadow:0 0 20px #FF00FF;">FREE PHOTO SHOOT</div>
        <div id="sub-row3" style="font-size:52px;font-weight:700;color:#fff;font-family:'Courier New',monospace;letter-spacing:6px;transform:translateX(0);margin-top:-52px;clip-path:inset(60% 0 20% 0);">FREE PHOTO SHOOT</div>
      </div>
    </div>

    <!-- ======================== PHOTO SLIDESHOW OVERLAY ======================== -->
    <div id="slideshow-ui" style="position:absolute;inset:0;z-index:150;pointer-events:none;display:none;">
      <!-- Photo counter bottom -->
      <div id="photo-counter" style="position:absolute;bottom:80px;left:50%;transform:translateX(-50%);font-size:44px;font-weight:700;color:#00FFFF;font-family:'Courier New',monospace;letter-spacing:4px;text-shadow:-3px 0 #FF0000,3px 0 #0000FF,0 0 20px #00FFFF;">01//08</div>
      <!-- Glitch label top right -->
      <div style="position:absolute;top:60px;right:60px;font-size:28px;color:#FF00FF;font-family:'Courier New',monospace;letter-spacing:3px;text-shadow:0 0 10px #FF00FF;">GLITCH.EXE</div>
    </div>

    <!-- ======================== STEPS / PROTOCOL SCREEN ======================== -->
    <div id="steps-screen" style="position:absolute;inset:0;z-index:350;background:rgba(0,0,0,0.9);display:none;flex-direction:column;justify-content:center;padding:80px;gap:60px;">
      <div style="font-size:36px;color:#FF00FF;font-family:'Courier New',monospace;letter-spacing:4px;margin-bottom:20px;text-shadow:0 0 15px #FF00FF;">[SYSTEM BROADCAST]</div>
      <div id="protocol1" style="opacity:0;font-size:48px;font-weight:700;color:#00FFFF;font-family:'Courier New',monospace;letter-spacing:2px;text-shadow:-3px 0 #FF0000,3px 0 #0000FF,0 0 20px #00FFFF;">&gt; PROTOCOL_01: DM @madebyaidan</div>
      <div id="protocol2" style="opacity:0;font-size:48px;font-weight:700;color:#00FFFF;font-family:'Courier New',monospace;letter-spacing:2px;text-shadow:-3px 0 #FF0000,3px 0 #0000FF,0 0 20px #00FFFF;">&gt; PROTOCOL_02: SELECT_DATE.exe</div>
      <div id="protocol3" style="opacity:0;font-size:48px;font-weight:700;color:#00FFFF;font-family:'Courier New',monospace;letter-spacing:2px;text-shadow:-3px 0 #FF0000,3px 0 #0000FF,0 0 20px #00FFFF;">&gt; PROTOCOL_03: ARRIVE.init()</div>
    </div>

    <!-- ======================== CTA SCREEN (18-22s) ======================== -->
    <div id="cta-screen" style="position:absolute;inset:0;z-index:400;background:#000;display:none;flex-direction:column;align-items:center;justify-content:center;gap:40px;padding:60px;">

      <!-- @madebyaidan with converging RGB split -->
      <div id="cta-handle-wrap" style="position:relative;text-align:center;">
        <!-- Red copy — slides in from left -->
        <div id="cta-red" style="position:absolute;top:0;left:0;right:0;font-size:110px;font-weight:900;color:#FF0000;font-family:'Courier New',monospace;letter-spacing:4px;mix-blend-mode:screen;transform:translateX(-60px);opacity:0.85;">@madebyaidan</div>
        <!-- Blue copy — slides in from right -->
        <div id="cta-blue" style="position:absolute;top:0;left:0;right:0;font-size:110px;font-weight:900;color:#0066FF;font-family:'Courier New',monospace;letter-spacing:4px;mix-blend-mode:screen;transform:translateX(60px);opacity:0.85;">@madebyaidan</div>
        <!-- Main -->
        <div id="cta-handle-main" style="position:relative;font-size:110px;font-weight:900;color:#fff;font-family:'Courier New',monospace;letter-spacing:4px;">@madebyaidan</div>
      </div>

      <div style="font-size:46px;color:#00FFFF;font-family:'Courier New',monospace;letter-spacing:6px;text-shadow:0 0 15px #00FFFF;">DM ON INSTAGRAM</div>

      <div style="font-size:38px;color:#FF00FF;font-family:'Courier New',monospace;letter-spacing:4px;text-shadow:-2px 0 #FF0000,2px 0 #0000FF,0 0 15px #FF00FF;">FREE_PHOTOSHOOT.exe</div>

      <div style="font-size:42px;font-weight:700;color:#00FF00;font-family:'Courier New',monospace;letter-spacing:3px;text-shadow:0 0 20px #00FF00;">
        &gt;&gt; EXECUTE NOW &lt;&lt;<span class="cursor" style="color:#00FF00;">_</span>
      </div>
    </div>

    <!-- ======================== EDGE ARTIFACT LAYER (22-24s) ======================== -->
    <div id="edge-artifacts" style="position:absolute;inset:0;z-index:500;pointer-events:none;display:none;"></div>

    <!-- ======================== WHITE FLASH ======================== -->
    <div id="white-flash" style="position:absolute;inset:0;z-index:800;background:#fff;opacity:0;pointer-events:none;"></div>

    <!-- ======================== GLITCH MONTAGE OVERLAY (13-14s) ======================== -->
    <div id="montage-layer" style="position:absolute;inset:0;z-index:100;pointer-events:none;display:none;">
      <img id="montage-img" src="" style="width:100%;height:100%;object-fit:cover;" />
    </div>

  </div>

<script>
  var W = ${W};
  var H = ${H};
  var FPS = ${FPS};
  var PHOTO_COUNT = ${PHOTO_NAMES.length};
  var STRIP_COUNT = 15;

  // Photo data URLs for easy access
  var photoSrcs = [
    ${PHOTO_NAMES.map(name => '"' + imageDataMap[name] + '"').join(',\n    ')}
  ];

  // ===== DOM refs =====
  var introScreen    = document.getElementById('intro-screen');
  var introManila    = document.getElementById('intro-manila');
  var manilaMain     = document.getElementById('manila-main');
  var introSub       = document.getElementById('intro-sub');
  var subRow1        = document.getElementById('sub-row1');
  var subRow2        = document.getElementById('sub-row2');
  var subRow3        = document.getElementById('sub-row3');
  var photoLayer     = document.getElementById('photo-layer');
  var photoMain      = document.getElementById('photo-main');
  var photoRed       = document.getElementById('photo-red');
  var photoBlue      = document.getElementById('photo-blue');
  var stripsContainer= document.getElementById('strips-container');
  var slideshowUI    = document.getElementById('slideshow-ui');
  var photoCounter   = document.getElementById('photo-counter');
  var stepsScreen    = document.getElementById('steps-screen');
  var protocol1      = document.getElementById('protocol1');
  var protocol2      = document.getElementById('protocol2');
  var protocol3      = document.getElementById('protocol3');
  var ctaScreen      = document.getElementById('cta-screen');
  var ctaRed         = document.getElementById('cta-red');
  var ctaBlue        = document.getElementById('cta-blue');
  var ctaHandleMain  = document.getElementById('cta-handle-main');
  var pixelBlocks    = document.getElementById('pixel-blocks');
  var whiteFlash     = document.getElementById('white-flash');
  var montageLayer   = document.getElementById('montage-layer');
  var montageImg     = document.getElementById('montage-img');
  var edgeArtifacts  = document.getElementById('edge-artifacts');
  var scanlines      = document.getElementById('scanlines');

  // ===== Helpers =====
  function show(el) { if (el) el.style.display = 'flex'; }
  function showBlock(el) { if (el) el.style.display = 'block'; }
  function hide(el) { if (el) el.style.display = 'none'; }

  // Seeded pseudo-random (deterministic from frame/time)
  function seededRand(seed, i) {
    var x = Math.sin(seed * 127.1 + i * 311.7 + 53.6) * 43758.5453123;
    return x - Math.floor(x);
  }

  // Set a photo on the main layer
  function setPhoto(index) {
    var src = photoSrcs[index];
    photoMain.src = src;
    photoRed.src = src;
    photoBlue.src = src;
  }

  // Set photo onto montage layer
  function setMontagePhoto(index) {
    montageImg.src = photoSrcs[index];
  }

  // RGB split offsets on CTA handle
  function setCTASplit(redX, blueX) {
    ctaRed.style.transform  = 'translateX(' + redX + 'px)';
    ctaBlue.style.transform = 'translateX(' + blueX + 'px)';
  }

  // Photo counter label
  function setCounter(photoIndex) {
    var n = String(photoIndex + 1).padStart(2, '0');
    photoCounter.textContent = n + '//0' + PHOTO_COUNT;
  }

  // Generate pixel block artifacts
  function renderPixelBlocks(seed, count, opacity) {
    var html = '';
    var colors = ['#FF0000','#00FFFF','#FF00FF','#00FF00','#FFFF00','#FFFFFF','#0000FF'];
    for (var i = 0; i < count; i++) {
      var x = Math.floor(seededRand(seed, i * 7 + 1) * W);
      var y = Math.floor(seededRand(seed, i * 7 + 2) * H);
      var bw = Math.floor(seededRand(seed, i * 7 + 3) * 80 + 8);
      var bh = Math.floor(seededRand(seed, i * 7 + 4) * 30 + 4);
      var ci = Math.floor(seededRand(seed, i * 7 + 5) * colors.length);
      var a = (seededRand(seed, i * 7 + 6) * 0.6 + 0.3) * opacity;
      html += '<div style="position:absolute;left:' + x + 'px;top:' + y + 'px;width:' + bw + 'px;height:' + bh + 'px;background:' + colors[ci] + ';opacity:' + a + ';"></div>';
    }
    pixelBlocks.innerHTML = html;
  }

  function clearPixelBlocks() {
    pixelBlocks.innerHTML = '';
  }

  // Apply horizontal strip displacement to strips-container
  // stripsMode: 'none', 'subtle', 'hard', 'assemble-in', 'assemble-show'
  // assembleProgress: 0-1 for assemble-in
  // seed: frame seed for randomisation
  function applyStrips(stripsMode, seed, assembleProgress) {
    var container = stripsContainer;
    container.style.display = 'block';

    // All strip inners hold the current photo via background
    // We set background image on each strip-inner to current photo
    for (var s = 0; s < STRIP_COUNT; s++) {
      var strip    = document.getElementById('strip-' + s);
      var inner    = document.getElementById('strip-inner-' + s);
      if (!strip || !inner) continue;

      // Set the inner to display the photo layer content
      // We'll use a background-image approach
      var topPx = s * Math.ceil(H / STRIP_COUNT);

      var offsetX = 0;

      if (stripsMode === 'none') {
        offsetX = 0;
      } else if (stripsMode === 'subtle') {
        // 1-2 strips jitter slightly
        var r = seededRand(seed, s);
        if (r > 0.75) {
          offsetX = (seededRand(seed, s + 50) - 0.5) * 20;
        }
      } else if (stripsMode === 'hard') {
        // All strips displace aggressively
        var r2 = seededRand(seed, s + 200);
        offsetX = (r2 - 0.5) * 80;
        // Some strips get RGB color tint
        var hueShift = Math.floor(seededRand(seed, s + 300) * 360);
        if (seededRand(seed, s + 400) > 0.5) {
          strip.style.filter = 'hue-rotate(' + hueShift + 'deg) saturate(3)';
        } else {
          strip.style.filter = '';
        }
      } else if (stripsMode === 'assemble-in') {
        // Strips slide in from alternating sides stacking up to form image
        // Each strip "arrives" at a slightly different time
        var stripProgress = Math.min(1, (assembleProgress * STRIP_COUNT - (s * 0.5)) / 2);
        stripProgress = Math.max(0, stripProgress);
        // Ease out
        stripProgress = 1 - Math.pow(1 - stripProgress, 2);
        var fromLeft = (s % 2 === 0);
        var startX   = fromLeft ? -W : W;
        offsetX = startX * (1 - stripProgress);
        strip.style.filter = '';
      } else if (stripsMode === 'assemble-show') {
        offsetX = 0;
        strip.style.filter = '';
      }

      if (stripsMode !== 'hard') {
        strip.style.filter = '';
      }
      strip.style.transform = 'translateX(' + offsetX + 'px)';
    }
  }

  // Populate all strip inners with the current photo (as background via img)
  function loadStripPhoto(photoIndex) {
    var src = photoSrcs[photoIndex];
    for (var s = 0; s < STRIP_COUNT; s++) {
      var inner = document.getElementById('strip-inner-' + s);
      if (!inner) continue;
      // Check if we already have an img inside
      var img = inner.querySelector('img');
      if (!img) {
        img = document.createElement('img');
        img.style.cssText = 'position:absolute;top:0;left:0;width:' + W + 'px;height:' + H + 'px;object-fit:cover;';
        inner.appendChild(img);
      }
      img.src = src;
    }
  }

  function clearStrips() {
    stripsContainer.style.display = 'none';
    for (var s = 0; s < STRIP_COUNT; s++) {
      var strip = document.getElementById('strip-' + s);
      if (strip) { strip.style.transform = 'translateX(0)'; strip.style.filter = ''; }
    }
  }

  // Build edge pixel artifacts for outro
  function renderEdgeArtifacts(seed, intensity) {
    var html = '';
    var colors = ['#FF0000','#00FFFF','#FF00FF','#00FF00','#FFFFFF','#FF8800'];
    // Top and bottom edge columns
    var blockCount = Math.floor(intensity * 60);
    for (var i = 0; i < blockCount; i++) {
      var edge = Math.floor(seededRand(seed, i) * 4); // 0=top,1=bottom,2=left,3=right
      var bw, bh, bx, by;
      if (edge === 0) {
        bx = Math.floor(seededRand(seed, i + 100) * W);
        by = Math.floor(seededRand(seed, i + 200) * 200);
        bw = Math.floor(seededRand(seed, i + 300) * 60 + 10);
        bh = Math.floor(seededRand(seed, i + 400) * 40 + 5);
      } else if (edge === 1) {
        bx = Math.floor(seededRand(seed, i + 100) * W);
        by = H - Math.floor(seededRand(seed, i + 200) * 200) - 40;
        bw = Math.floor(seededRand(seed, i + 300) * 60 + 10);
        bh = Math.floor(seededRand(seed, i + 400) * 40 + 5);
      } else if (edge === 2) {
        bx = Math.floor(seededRand(seed, i + 100) * 200);
        by = Math.floor(seededRand(seed, i + 200) * H);
        bw = Math.floor(seededRand(seed, i + 300) * 40 + 5);
        bh = Math.floor(seededRand(seed, i + 400) * 60 + 10);
      } else {
        bx = W - Math.floor(seededRand(seed, i + 100) * 200) - 40;
        by = Math.floor(seededRand(seed, i + 200) * H);
        bw = Math.floor(seededRand(seed, i + 300) * 40 + 5);
        bh = Math.floor(seededRand(seed, i + 400) * 60 + 10);
      }
      var ci = Math.floor(seededRand(seed, i + 500) * colors.length);
      var a  = seededRand(seed, i + 600) * 0.7 + 0.3;
      html += '<div style="position:absolute;left:' + bx + 'px;top:' + by + 'px;width:' + bw + 'px;height:' + bh + 'px;background:' + colors[ci] + ';opacity:' + a + ';"></div>';
    }
    edgeArtifacts.innerHTML = html;
  }

  // ===== Main state machine =====
  window.__applyUpTo = function(t) {
    var frameSeed = Math.floor(t * FPS);

    // ===== RESET all layers =====
    hide(introScreen);
    hide(photoLayer);
    hide(stripsContainer);
    hide(slideshowUI);
    hide(stepsScreen);
    hide(ctaScreen);
    hide(montageLayer);
    hide(edgeArtifacts);
    whiteFlash.style.opacity = '0';
    clearPixelBlocks();
    scanlines.style.opacity = '0.5';

    // ===========================================================
    // 0-2s: INTRO — black screen, pixel blocks, MANILA + FREE PHOTO SHOOT
    // ===========================================================
    if (t >= 0 && t < 2.0) {
      show(introScreen);

      // Pixel blocks appear starting ~0.2s, ramping up
      if (t >= 0.2) {
        var pbCount = Math.floor((t - 0.2) / 1.8 * 30) + 5;
        renderPixelBlocks(frameSeed, pbCount, 0.8);
      }

      // MANILA appears at 0.5s
      if (t >= 0.5) {
        introManila.style.display = 'block';
        // RGB split amount — heavy
        var redCopy  = introManila.querySelector('div:nth-child(1)');
        var blueCopy = introManila.querySelector('div:nth-child(2)');
        // Flicker the split offset
        var flickerSeed = Math.floor(t * 15);
        var splitMult = 1 + seededRand(flickerSeed, 1) * 0.5;
        if (redCopy)  redCopy.style.transform  = 'translateX(' + (-8 * splitMult) + 'px)';
        if (blueCopy) blueCopy.style.transform = 'translateX(' + (8 * splitMult) + 'px)';
      }

      // FREE PHOTO SHOOT with horizontal slice displacement at 0.9s
      if (t >= 0.9) {
        introSub.style.display = 'block';
        var sliceSeed2 = Math.floor(t * 20);
        subRow1.style.transform = 'translateX(' + ((seededRand(sliceSeed2, 10) - 0.5) * 30) + 'px)';
        subRow2.style.transform = 'translateX(' + ((seededRand(sliceSeed2, 20) - 0.5) * 40) + 'px)';
        subRow3.style.transform = 'translateX(' + ((seededRand(sliceSeed2, 30) - 0.5) * 20) + 'px)';
      }

      // Scanline flicker
      scanlines.style.opacity = String(0.4 + seededRand(frameSeed, 1) * 0.4);
    }

    // ===========================================================
    // 2-3s: HARD GLITCH — screen tears, white flash bursts
    // ===========================================================
    if (t >= 2.0 && t < 3.0) {
      show(introScreen);
      // Keep intro text visible but heavily glitched
      introManila.style.display = 'block';
      introSub.style.display = 'block';

      var gProgress = (t - 2.0); // 0-1

      // Aggressive pixel blocks
      renderPixelBlocks(frameSeed, 40, 1.0);

      // White flash bursts
      var flashIntensity = Math.abs(Math.sin(t * 25)) * 0.7;
      whiteFlash.style.opacity = String(flashIntensity);

      // Heavy strip displacement — show intro content shredded
      show(stripsContainer);
      loadStripPhoto(0); // placeholder so strips have something
      applyStrips('hard', frameSeed, 0);

      // Scanlines blasting
      scanlines.style.opacity = '0.8';

      // At ~2.8s transition fade out intro
      if (t >= 2.7) {
        var fadeOut = (t - 2.7) / 0.3;
        introScreen.style.opacity = String(1 - fadeOut);
      } else {
        introScreen.style.opacity = '1';
      }
    }
    if (t < 2.0 || t >= 3.0) {
      introScreen.style.opacity = '1';
    }

    // ===========================================================
    // 3-13s: PHOTO SLIDESHOW with glitch transitions
    // Each photo: ~1.25s. Total 8 photos = 10s
    // Photo 0: 3.0-4.25, Photo 1: 4.25-5.5 ... Photo 7: 11.75-13.0
    // ===========================================================
    if (t >= 3.0 && t < 13.0) {
      var slideT      = t - 3.0;
      var photoIndex  = Math.min(Math.floor(slideT / 1.25), PHOTO_COUNT - 1);
      var photoLocalT = slideT - photoIndex * 1.25; // 0-1.25 within this photo

      show(slideshowUI);
      setCounter(photoIndex);

      // Determine phase:
      //   0.00-0.40: assemble-in (strips slide from alternating sides)
      //   0.40-0.90: show with subtle jitter
      //   0.90-1.10: HARD GLITCH transition
      //   1.10-1.25: next photo assembling (handled as next photo start)

      if (photoLocalT < 0.40) {
        // ASSEMBLING — strips slide in
        var assembleP = photoLocalT / 0.40;
        loadStripPhoto(photoIndex);
        show(stripsContainer);
        applyStrips('assemble-in', frameSeed, assembleP);
        // Some pixel blocks during assembly
        renderPixelBlocks(frameSeed, 10, 0.5);

      } else if (photoLocalT < 0.90) {
        // SHOWING — photo visible with subtle glitch
        loadStripPhoto(photoIndex);
        show(stripsContainer);
        applyStrips('subtle', frameSeed, 0);
        // Very occasional pixel blocks
        if (seededRand(frameSeed, 99) > 0.85) {
          renderPixelBlocks(frameSeed, 8, 0.4);
        }

      } else if (photoLocalT < 1.25) {
        // HARD GLITCH transition
        loadStripPhoto(photoIndex);
        show(stripsContainer);
        applyStrips('hard', frameSeed, 0);
        renderPixelBlocks(frameSeed, 35, 0.9);

        // RGB channels separate during transition
        show(photoLayer);
        setPhoto(photoIndex);
        var glitchShift = 20 + seededRand(frameSeed, 77) * 30;
        photoRed.style.transform  = 'translateX(' + (-glitchShift) + 'px)';
        photoBlue.style.transform = 'translateX(' + glitchShift + 'px)';
        photoMain.style.opacity   = '0.4';

        // Brief white flash
        var flashP = Math.abs(Math.sin((photoLocalT - 0.90) / 0.35 * Math.PI));
        whiteFlash.style.opacity = String(flashP * 0.5);
        scanlines.style.opacity  = '0.8';
      }

      // Photo counter glitch flicker
      if (seededRand(frameSeed, 55) > 0.9) {
        photoCounter.style.transform = 'translateX(' + ((seededRand(frameSeed, 56) - 0.5) * 12) + 'px)';
      } else {
        photoCounter.style.transform = 'translateX(0)';
      }
    }

    // ===========================================================
    // 13-14s: GLITCH MONTAGE — flash all photos rapidly
    // ===========================================================
    if (t >= 13.0 && t < 14.0) {
      show(montageLayer);
      // Flash at ~0.1s each = 10 per second
      var montageIdx = Math.floor((t - 13.0) * 10) % PHOTO_COUNT;
      setMontagePhoto(montageIdx);
      renderPixelBlocks(frameSeed, 25, 0.8);
      whiteFlash.style.opacity = String(Math.abs(Math.sin(t * 30)) * 0.4);
      scanlines.style.opacity = '0.9';

      // RGB shift on montage
      var mShift = seededRand(frameSeed, 88) * 15;
      montageImg.style.filter = 'hue-rotate(' + Math.floor(mShift * 24) + 'deg) saturate(2)';
    }

    // ===========================================================
    // 14-18s: STEPS / PROTOCOL typing
    // ===========================================================
    if (t >= 14.0 && t < 18.0) {
      show(stepsScreen);

      // Protocol 1 appears at 14.2s with RGB split glitch
      if (t >= 14.2) {
        protocol1.style.opacity = '1';
        // Brief flicker at appearance
        if (t < 14.5) {
          var flick = Math.abs(Math.sin(t * 40));
          protocol1.style.transform = 'translateX(' + ((seededRand(frameSeed, 10) - 0.5) * 8 * flick) + 'px)';
        } else {
          protocol1.style.transform = 'translateX(0)';
        }
      }

      // Protocol 2 appears at 15.3s
      if (t >= 15.3) {
        protocol2.style.opacity = '1';
        if (t < 15.6) {
          var flick2 = Math.abs(Math.sin(t * 40));
          protocol2.style.transform = 'translateX(' + ((seededRand(frameSeed, 20) - 0.5) * 8 * flick2) + 'px)';
        } else {
          protocol2.style.transform = 'translateX(0)';
        }
      }

      // Protocol 3 appears at 16.4s
      if (t >= 16.4) {
        protocol3.style.opacity = '1';
        if (t < 16.7) {
          var flick3 = Math.abs(Math.sin(t * 40));
          protocol3.style.transform = 'translateX(' + ((seededRand(frameSeed, 30) - 0.5) * 8 * flick3) + 'px)';
        } else {
          protocol3.style.transform = 'translateX(0)';
        }
      }

      // Occasional pixel blocks
      if (seededRand(frameSeed, 77) > 0.88) {
        renderPixelBlocks(frameSeed, 12, 0.5);
      }

      // Random scanline intensity
      scanlines.style.opacity = String(0.4 + seededRand(frameSeed, 88) * 0.3);
    }

    // ===========================================================
    // 18-22s: MASSIVE GLITCH → CTA resolves from chaos
    // ===========================================================
    if (t >= 18.0 && t < 22.0) {

      // 18.0-18.8: massive glitch transition
      if (t < 18.8) {
        show(stepsScreen); // still visible under chaos
        renderPixelBlocks(frameSeed, 50, 1.0);
        whiteFlash.style.opacity = String(Math.abs(Math.sin(t * 35)) * 0.6);
        show(stripsContainer);
        loadStripPhoto(PHOTO_COUNT - 1);
        applyStrips('hard', frameSeed, 0);
        scanlines.style.opacity = '0.9';

      } else {
        // 18.8-22s: CTA visible, RGB split converges to clean text
        show(ctaScreen);
        hide(stepsScreen);
        clearStrips();

        // RGB split: converge from wide to zero (over ~3.2s)
        var convergeP = Math.min(1, (t - 18.8) / 3.2);
        // Ease in
        var eased = convergeP * convergeP;
        var splitPx = 60 * (1 - eased);
        setCTASplit(-splitPx, splitPx);

        // Once converged, white text stands clean
        if (convergeP >= 1.0) {
          ctaRed.style.opacity = '0';
          ctaBlue.style.opacity = '0';
          ctaHandleMain.style.color = '#fff';
        } else {
          ctaRed.style.opacity = String(0.85 * (1 - eased));
          ctaBlue.style.opacity = String(0.85 * (1 - eased));
        }

        // Occasional pixel blocks
        if (seededRand(frameSeed, 33) > 0.9) {
          renderPixelBlocks(frameSeed, 15, 0.5);
        }
        scanlines.style.opacity = String(0.3 + seededRand(frameSeed, 44) * 0.2);
      }
    }

    // ===========================================================
    // 22-24s: GLITCH INTENSIFIES — random artifacts fill screen edges
    // ===========================================================
    if (t >= 22.0) {
      show(ctaScreen);
      // Reset CTA to clean
      ctaRed.style.opacity  = '0';
      ctaBlue.style.opacity = '0';

      var outroP = (t - 22.0) / 2.0; // 0-1

      // Edge artifacts grow
      show(edgeArtifacts);
      renderEdgeArtifacts(frameSeed, outroP);

      // Scanlines intensify
      scanlines.style.opacity = String(0.4 + outroP * 0.5);

      // Screen-wide pixel blocks
      renderPixelBlocks(frameSeed, Math.floor(outroP * 60), 0.7);

      // CTA text shakes more aggressively
      var shakeAmt = outroP * 20;
      ctaScreen.style.filter = 'hue-rotate(' + (seededRand(frameSeed, 11) * shakeAmt * 18) + 'deg)';

      // Final white flash at 23.5s
      if (t >= 23.5) {
        var finalFlash = (t - 23.5) / 0.5;
        whiteFlash.style.opacity = String(finalFlash * 0.8);
      }
    } else {
      ctaScreen.style.filter = '';
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
  console.log('=== Glitch Art Reel v67a ===');
  resetOutputDir();

  console.log('Processing photos...');
  var imageDataMap = processPhotos();

  var html = buildHTML(imageDataMap);
  var htmlPath = path.join(OUT_DIR, 'index.html');
  writeFileSync(htmlPath, html);

  var framesDir = path.join(OUT_DIR, 'tmp-frames');
  mkdirSync(framesDir, { recursive: true });

  var browser = await chromium.launch();
  var page = await browser.newPage({ viewport: { width: W, height: H } });
  await page.goto('file://' + htmlPath + '?capture=1', { waitUntil: 'load' });
  await page.waitForTimeout(500);

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

  var outputMp4 = path.join(OUT_DIR, 'manila-glitch-v67a.mp4');
  execSync(
    'ffmpeg -y -framerate ' + FPS + ' -i "' + path.join(framesDir, 'frame_%05d.png') + '" ' +
    '-c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r ' + FPS + ' -an "' + outputMp4 + '"',
    { stdio: 'inherit' }
  );

  rmSync(framesDir, { recursive: true, force: true });

  var reelsDir = path.join(__dirname, 'reels');
  if (!existsSync(reelsDir)) mkdirSync(reelsDir, { recursive: true });
  var reelsDest = path.join(reelsDir, 'manila-glitch-v67a.mp4');
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
