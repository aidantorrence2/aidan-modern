import { chromium } from 'playwright';
import { execSync } from 'child_process';
import { mkdirSync, rmSync, existsSync, readFileSync, writeFileSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

var __dirname = path.dirname(fileURLToPath(import.meta.url));
var OUT_DIR = path.join(__dirname, 'output-66e-antipolo');

var W = 1080;
var H = 1920;
var FPS = 30;

var FILM_SCANS_DIR = '/Volumes/PortableSSD/Exports/film scans';
var PHOTO_NAMES = [
  'DSC_0943.jpg',
  'DSC_0945.jpg',
  'DSC_0951.jpg',
  'DSC_0956.jpg',
  'DSC_0960.jpg',
  'DSC_0962.jpg',
  'DSC_0967.jpg',
  'DSC_0977.jpg',
];

var TOTAL_FRAMES = 540; // 18s at 30fps
var TOTAL_DURATION = 18;

function resetOutputDir() {
  rmSync(OUT_DIR, { recursive: true, force: true });
  mkdirSync(OUT_DIR, { recursive: true });
}

function processPhotos() {
  // Use cached processed photos from original 66a output
  var cacheDir = '/Users/aidantorrence/Documents/aidan-modern/marketing/manila-model-search-carousel/reels-final/output-66a/tmp-photos';
  // Fallback: use portfolio images from public/images/large (already processed)
  var portfolioDir = path.join(__dirname, '..', '..', '..', 'public', 'images', 'large');
  var FALLBACK_PHOTOS = [
    'manila-gallery-garden-001.jpg',
    'manila-gallery-garden-002.jpg',
    'manila-gallery-canal-001.jpg',
    'manila-gallery-canal-002.jpg',
    'manila-gallery-park-001.jpg',
    'manila-gallery-ivy-001.jpg',
    'manila-gallery-ivy-002.jpg',
    'manila-gallery-night-001.jpg',
  ];
  var processed = {};
  for (var i = 0; i < PHOTO_NAMES.length; i++) {
    var name = PHOTO_NAMES[i];
    var cached = path.join(cacheDir, name.replace(/\.jpg$/i, '_processed.jpg'));
    if (existsSync(cached)) {
      var buf = readFileSync(cached);
      processed[name] = 'data:image/jpeg;base64,' + buf.toString('base64');
      console.log('  Cached: ' + name + ' (' + (buf.length / 1024).toFixed(0) + ' KB)');
    } else {
      // Fallback to processing from SSD
      var src = path.join(FILM_SCANS_DIR, name);
      if (existsSync(src)) {
        var cropDir = path.join(OUT_DIR, 'tmp-photos');
        mkdirSync(cropDir, { recursive: true });
        var dst = path.join(cropDir, name.replace(/\.jpg$/i, '_processed.jpg'));
        execSync('magick "' + src + '" -shave 500x600 +repage -auto-level -quality 95 "' + dst + '"', { stdio: 'pipe' });
        var buf2 = readFileSync(dst);
        processed[name] = 'data:image/jpeg;base64,' + buf2.toString('base64');
        console.log('  Processed: ' + name + ' (' + (buf2.length / 1024).toFixed(0) + ' KB)');
      } else {
        // Final fallback: use portfolio images (already processed, no crop needed)
        var fallbackName = FALLBACK_PHOTOS[i % FALLBACK_PHOTOS.length];
        var fallbackPath = path.join(portfolioDir, fallbackName);
        if (!existsSync(fallbackPath)) {
          console.error('Photo not found (no cache, no SSD, no fallback): ' + name);
          process.exit(1);
        }
        var buf3 = readFileSync(fallbackPath);
        processed[name] = 'data:image/jpeg;base64,' + buf3.toString('base64');
        console.log('  Fallback (' + fallbackName + '): ' + name + ' (' + (buf3.length / 1024).toFixed(0) + ' KB)');
      }
    }
  }
  return processed;
}

function buildHTML(imageDataMap) {
  var photoDataArray = PHOTO_NAMES.map(function(name) {
    return imageDataMap[name];
  });

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { margin: 0; padding: 0; background: #1a0a1a; font-family: 'Helvetica Neue', Arial, sans-serif; overflow: hidden; }

  @keyframes coinDrop {
    0% { transform: translateY(-80px); opacity: 0; }
    60% { transform: translateY(10px); opacity: 1; }
    80% { transform: translateY(-5px); }
    100% { transform: translateY(0); opacity: 1; }
  }

  @keyframes countPulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.12); }
    100% { transform: scale(1); }
  }

  @keyframes stripPrint {
    0% { clip-path: inset(0 0 100% 0); }
    100% { clip-path: inset(0 0 0% 0); }
  }

  @keyframes shimmer {
    0% { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }

  @keyframes photoSlideIn {
    0% { transform: translateY(-120px); opacity: 0; }
    70% { transform: translateY(6px); opacity: 1; }
    100% { transform: translateY(0); opacity: 1; }
  }

  @keyframes stripSlideUp {
    0% { transform: translateY(0); }
    100% { transform: translateY(-${H + 200}px); }
  }

  @keyframes stripSlideIn {
    0% { transform: translateY(${H + 200}px); }
    100% { transform: translateY(0); }
  }

  @keyframes spreadLeft {
    0% { transform: translateX(0) rotate(0deg); }
    100% { transform: translateX(-320px) rotate(-8deg); }
  }

  @keyframes spreadRight {
    0% { transform: translateX(0) rotate(0deg); }
    100% { transform: translateX(320px) rotate(8deg); }
  }

  @keyframes photoEnlarge {
    0% { opacity: 0; transform: scale(0.85); }
    100% { opacity: 1; transform: scale(1); }
  }

  @keyframes photoDim {
    0% { opacity: 1; }
    100% { opacity: 0; }
  }

  @keyframes textStripSlideIn {
    0% { transform: translateY(${H + 200}px); }
    100% { transform: translateY(0); }
  }

  @keyframes finalFlash {
    0% { opacity: 0; }
    30% { opacity: 1; }
    60% { opacity: 1; }
    100% { opacity: 0; }
  }

  .page {
    width: ${W}px;
    height: ${H}px;
    position: relative;
    overflow: hidden;
    background: #1a0a1a;
  }

  /* Dark curtain background with velvet texture */
  .curtain-bg {
    position: absolute;
    inset: 0;
    z-index: 0;
    background:
      radial-gradient(ellipse at 20% 30%, rgba(80,10,30,0.4) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 70%, rgba(60,5,20,0.5) 0%, transparent 50%),
      radial-gradient(ellipse at 50% 50%, rgba(40,0,15,0.3) 0%, transparent 70%),
      repeating-linear-gradient(
        88deg,
        rgba(0,0,0,0.12) 0px, rgba(0,0,0,0.12) 2px,
        transparent 2px, transparent 18px
      ),
      repeating-linear-gradient(
        92deg,
        rgba(80,0,30,0.08) 0px, rgba(80,0,30,0.08) 1px,
        transparent 1px, transparent 12px
      ),
      linear-gradient(180deg, #2a0a20 0%, #1a0a1a 40%, #150816 100%);
  }

  /* Booth frame decorations */
  .booth-frame {
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
  }

  /* Side curtain folds */
  .curtain-left {
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 120px;
    background: linear-gradient(90deg,
      rgba(60,5,20,0.9) 0%,
      rgba(40,2,15,0.6) 60%,
      transparent 100%
    );
    z-index: 2;
  }

  .curtain-right {
    position: absolute;
    right: 0; top: 0; bottom: 0;
    width: 120px;
    background: linear-gradient(-90deg,
      rgba(60,5,20,0.9) 0%,
      rgba(40,2,15,0.6) 60%,
      transparent 100%
    );
    z-index: 2;
  }

  /* Top arch decoration */
  .booth-top {
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 200px;
    background: linear-gradient(180deg,
      rgba(30,5,15,0.95) 0%,
      rgba(20,3,10,0.7) 60%,
      transparent 100%
    );
    z-index: 2;
  }

  /* STEP INTO THE BOOTH sign */
  .booth-sign {
    position: absolute;
    top: 0; left: 0; right: 0;
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 60px;
    gap: 20px;
    opacity: 0;
  }

  .booth-sign .title-text {
    font-size: 54px;
    font-weight: 900;
    color: #fff;
    letter-spacing: 8px;
    text-transform: uppercase;
    text-shadow:
      0 0 30px rgba(255,200,150,0.8),
      0 0 60px rgba(255,150,100,0.4),
      0 2px 8px rgba(0,0,0,0.8);
    text-align: center;
  }

  .booth-sign .subtitle-text {
    font-size: 28px;
    font-weight: 600;
    color: rgba(255,220,180,0.8);
    letter-spacing: 6px;
    text-transform: uppercase;
    text-shadow: 0 0 20px rgba(255,180,100,0.5);
  }

  /* Decorative lights row */
  .booth-lights {
    position: absolute;
    top: 180px;
    left: 0; right: 0;
    z-index: 10;
    display: flex;
    justify-content: center;
    gap: 40px;
    opacity: 0;
  }

  .booth-light {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #fff8c0;
    box-shadow: 0 0 8px #ffee88, 0 0 16px #ffcc44;
  }

  .booth-light.red { background: #ff6666; box-shadow: 0 0 8px #ff4444, 0 0 16px #cc2222; }
  .booth-light.blue { background: #88aaff; box-shadow: 0 0 8px #6688ff, 0 0 16px #4466cc; }
  .booth-light.green { background: #88ffaa; box-shadow: 0 0 8px #66ff88, 0 0 16px #44cc66; }

  /* Coin slot */
  .coin-slot-wrap {
    position: absolute;
    bottom: 320px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    opacity: 0;
  }

  .coin-slot {
    width: 120px;
    height: 12px;
    background: #333;
    border-radius: 6px;
    border: 3px solid #888;
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.8), 0 0 12px rgba(255,200,0,0.3);
    position: relative;
  }

  .coin-slot::before {
    content: '';
    position: absolute;
    top: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 4px;
    background: #aaa;
    border-radius: 2px;
  }

  .coin {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: radial-gradient(circle at 35% 35%, #ffd700, #b8860b);
    border: 3px solid #daa520;
    box-shadow:
      inset 0 2px 4px rgba(255,255,200,0.4),
      0 4px 12px rgba(0,0,0,0.6),
      0 0 20px rgba(255,215,0,0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    color: #8b6914;
    font-weight: 900;
    opacity: 0;
  }

  .insert-text {
    font-size: 24px;
    color: rgba(255,220,160,0.9);
    letter-spacing: 4px;
    text-transform: uppercase;
    font-weight: 700;
    text-shadow: 0 0 12px rgba(255,200,100,0.6);
  }

  /* Countdown numbers */
  .countdown-display {
    position: absolute;
    inset: 0;
    z-index: 20;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    pointer-events: none;
  }

  .countdown-number {
    font-size: 420px;
    font-weight: 900;
    color: #fff;
    text-shadow:
      0 0 40px rgba(255,255,255,0.9),
      0 0 80px rgba(255,255,255,0.5),
      0 0 160px rgba(255,255,255,0.2),
      0 8px 32px rgba(0,0,0,0.8);
    line-height: 1;
    font-family: 'Helvetica Neue', Arial, sans-serif;
    animation: countPulse 0.5s ease-in-out infinite;
    -webkit-text-stroke: 4px rgba(255,255,255,0.3);
  }

  /* Flash overlay */
  .flash-overlay {
    position: absolute;
    inset: 0;
    z-index: 50;
    background: #ffffff;
    opacity: 0;
    pointer-events: none;
  }

  /* Strip container — centered in viewport */
  .strips-container {
    position: absolute;
    inset: 0;
    z-index: 15;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 60px;
  }

  /* Individual photo strip */
  .photo-strip {
    width: 300px;
    background: #f8f4ef;
    border-radius: 8px;
    padding: 16px 16px 24px 16px;
    box-shadow:
      4px 8px 24px rgba(0,0,0,0.7),
      -2px 4px 12px rgba(0,0,0,0.4),
      0 0 0 2px rgba(255,255,255,0.1),
      /* subtle curl on right edge */
      12px 16px 20px rgba(0,0,0,0.5),
      20px 24px 12px rgba(0,0,0,0.3);
    position: relative;
    transform-origin: top center;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  /* Strip header label */
  .strip-header {
    text-align: center;
    font-size: 13px;
    font-weight: 900;
    color: #333;
    letter-spacing: 3px;
    text-transform: uppercase;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(0,0,0,0.1);
    font-family: 'Courier New', monospace;
  }

  /* Photo slot in strip */
  .strip-slot {
    width: 268px;
    height: 268px;
    background: #ddd;
    overflow: hidden;
    position: relative;
    border-radius: 2px;
  }

  .strip-slot img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    display: block;
    opacity: 0;
  }

  /* Warm flash overlay on each photo */
  .strip-slot::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 30% 25%, rgba(255,240,200,0.25) 0%, transparent 70%);
    pointer-events: none;
    z-index: 2;
  }

  /* Strip footer watermark */
  .strip-footer {
    text-align: center;
    font-size: 12px;
    font-weight: 700;
    color: #555;
    letter-spacing: 2px;
    text-transform: uppercase;
    padding-top: 8px;
    border-top: 1px solid rgba(0,0,0,0.1);
    font-family: 'Courier New', monospace;
  }

  /* Sprocket holes on sides */
  .sprocket-left, .sprocket-right {
    position: absolute;
    top: 16px;
    bottom: 24px;
    width: 12px;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
    gap: 0;
  }
  .sprocket-left { left: -16px; }
  .sprocket-right { right: -16px; }

  .sprocket-hole {
    width: 8px;
    height: 8px;
    border-radius: 2px;
    background: rgba(0,0,0,0.15);
    border: 1px solid rgba(0,0,0,0.08);
  }

  /* Number badge on strip slot */
  .slot-number {
    position: absolute;
    bottom: 6px;
    left: 8px;
    z-index: 5;
    font-size: 11px;
    font-weight: 700;
    color: rgba(255,255,255,0.8);
    font-family: 'Courier New', monospace;
    text-shadow: 0 1px 2px rgba(0,0,0,0.8);
    opacity: 0;
  }

  /* Full-screen photo for slideshow phase */
  .fullscreen-photo {
    position: absolute;
    inset: 0;
    z-index: 30;
    opacity: 0;
  }

  .fullscreen-photo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    display: block;
  }

  /* Vignette on fullscreen */
  .fullscreen-photo::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%);
    pointer-events: none;
  }

  /* Text strip for CTA phase */
  .text-strip {
    width: 300px;
    background: #f8f4ef;
    border-radius: 8px;
    padding: 16px 16px 24px 16px;
    box-shadow:
      4px 8px 24px rgba(0,0,0,0.7),
      -2px 4px 12px rgba(0,0,0,0.4),
      12px 16px 20px rgba(0,0,0,0.5);
    position: absolute;
    left: 50%;
    margin-left: -150px;
    z-index: 40;
    display: flex;
    flex-direction: column;
    gap: 10px;
    transform: translateY(${H + 200}px);
  }

  .text-strip-slot {
    width: 268px;
    height: 268px;
    background: #1a0a1a;
    overflow: hidden;
    position: relative;
    border-radius: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 8px;
  }

  .text-slot-main {
    font-size: 56px;
    font-weight: 900;
    color: #fff;
    text-align: center;
    letter-spacing: -1px;
    line-height: 1.1;
    text-shadow:
      0 0 20px rgba(255,200,150,0.8),
      0 2px 8px rgba(0,0,0,0.8);
    opacity: 0;
  }

  .text-slot-accent {
    font-size: 24px;
    font-weight: 600;
    color: rgba(255,200,150,0.8);
    letter-spacing: 4px;
    text-transform: uppercase;
    text-align: center;
    text-shadow: 0 0 12px rgba(255,150,100,0.5);
    opacity: 0;
  }

  /* Flash white end */
  .end-flash {
    position: absolute;
    inset: 0;
    z-index: 100;
    background: #ffffff;
    opacity: 0;
    pointer-events: none;
  }
</style>
</head>
<body>
<div id="root" class="page">

  <!-- Background curtain -->
  <div class="curtain-bg"></div>
  <div class="curtain-left"></div>
  <div class="curtain-right"></div>
  <div class="booth-top"></div>

  <!-- Booth entry sign -->
  <div class="booth-sign" id="booth-sign">
    <div class="title-text">STEP INTO</div>
    <div class="title-text" style="color:#ffddaa;">THE BOOTH</div>
    <div class="subtitle-text">♡ &nbsp; photo booth &nbsp; ♡</div>
  </div>

  <!-- Decorative lights row -->
  <div class="booth-lights" id="booth-lights">
    <div class="booth-light red"></div>
    <div class="booth-light"></div>
    <div class="booth-light blue"></div>
    <div class="booth-light"></div>
    <div class="booth-light green"></div>
    <div class="booth-light"></div>
    <div class="booth-light red"></div>
    <div class="booth-light"></div>
    <div class="booth-light blue"></div>
    <div class="booth-light"></div>
    <div class="booth-light green"></div>
    <div class="booth-light"></div>
    <div class="booth-light red"></div>
    <div class="booth-light"></div>
    <div class="booth-light"></div>
    <div class="booth-light green"></div>
  </div>

  <!-- Coin slot -->
  <div class="coin-slot-wrap" id="coin-slot-wrap">
    <div class="coin" id="coin">25¢</div>
    <div class="coin-slot"></div>
    <div class="insert-text">INSERT COIN</div>
  </div>

  <!-- Countdown -->
  <div class="countdown-display" id="countdown-display">
    <div class="countdown-number" id="countdown-number">3</div>
  </div>

  <!-- Flash overlay -->
  <div class="flash-overlay" id="flash-overlay"></div>

  <!-- Main strips container -->
  <div class="strips-container" id="strips-container">

    <!-- Strip 1 (photos 0-3) -->
    <div class="photo-strip" id="strip-1" style="opacity:0;transform:translateY(${H + 200}px);">
      <div class="strip-header">ANTIPOLO FREE PHOTO SHOOT</div>
      <div class="strip-slot" id="slot-1-1">
        <img id="photo-1-1" src="${photoDataArray[0]}" />
        <div class="slot-number" id="num-1-1">#1</div>
      </div>
      <div class="strip-slot" id="slot-1-2">
        <img id="photo-1-2" src="${photoDataArray[1]}" />
        <div class="slot-number" id="num-1-2">#2</div>
      </div>
      <div class="strip-slot" id="slot-1-3">
        <img id="photo-1-3" src="${photoDataArray[2]}" />
        <div class="slot-number" id="num-1-3">#3</div>
      </div>
      <div class="strip-slot" id="slot-1-4">
        <img id="photo-1-4" src="${photoDataArray[3]}" />
        <div class="slot-number" id="num-1-4">#4</div>
      </div>
      <div class="strip-footer">@madebyaidan • antipolo 2026</div>
    </div>

    <!-- Strip 2 (photos 4-7) -->
    <div class="photo-strip" id="strip-2" style="opacity:0;transform:translateY(${H + 200}px);">
      <div class="strip-header">ANTIPOLO FREE PHOTO SHOOT</div>
      <div class="strip-slot" id="slot-2-1">
        <img id="photo-2-1" src="${photoDataArray[4]}" />
        <div class="slot-number" id="num-2-1">#5</div>
      </div>
      <div class="strip-slot" id="slot-2-2">
        <img id="photo-2-2" src="${photoDataArray[5]}" />
        <div class="slot-number" id="num-2-2">#6</div>
      </div>
      <div class="strip-slot" id="slot-2-3">
        <img id="photo-2-3" src="${photoDataArray[6]}" />
        <div class="slot-number" id="num-2-3">#7</div>
      </div>
      <div class="strip-slot" id="slot-2-4">
        <img id="photo-2-4" src="${photoDataArray[7]}" />
        <div class="slot-number" id="num-2-4">#8</div>
      </div>
      <div class="strip-footer">@madebyaidan • antipolo 2026</div>
    </div>

  </div>

  <!-- Full-screen photo overlays (for slideshow phase 12-14s) -->
  <div class="fullscreen-photo" id="fs-0"><img src="${photoDataArray[0]}" /></div>
  <div class="fullscreen-photo" id="fs-1"><img src="${photoDataArray[2]}" /></div>
  <div class="fullscreen-photo" id="fs-2"><img src="${photoDataArray[5]}" /></div>

  <!-- Text strip (CTA phase 14-18s) -->
  <div class="text-strip" id="text-strip">
    <div class="strip-header">ANTIPOLO FREE PHOTO SHOOT</div>
    <div class="text-strip-slot" id="tslot-1">
      <div class="text-slot-main" id="ttext-1">DM ME</div>
      <div class="text-slot-accent" id="tacc-1">on instagram</div>
    </div>
    <div class="text-strip-slot" id="tslot-2">
      <div class="text-slot-main" id="ttext-2">PICK A DATE</div>
      <div class="text-slot-accent" id="tacc-2">any weekend</div>
    </div>
    <div class="text-strip-slot" id="tslot-3">
      <div class="text-slot-main" id="ttext-3">SHOW UP</div>
      <div class="text-slot-accent" id="tacc-3">we'll handle the rest</div>
    </div>
    <div class="text-strip-slot" id="tslot-4">
      <div class="text-slot-main" id="ttext-4">IT'S FREE!</div>
      <div class="text-slot-accent" id="tacc-4">no catch ♡</div>
    </div>
    <div class="strip-footer">@madebyaidan • limited spots</div>
  </div>

  <!-- End flash -->
  <div class="end-flash" id="end-flash"></div>

</div>

<script>
  var H = ${H};

  // Helper: ease-in-out cubic
  function easeInOut(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function easeIn(t) {
    return t * t * t;
  }

  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }

  // Lerp
  function lerp(a, b, t) {
    return a + (b - a) * clamp(t, 0, 1);
  }

  // Get progress 0-1 for a time window
  function progress(t, start, end) {
    return clamp((t - start) / (end - start), 0, 1);
  }

  // -- Elements
  var boothSign = document.getElementById('booth-sign');
  var boothLights = document.getElementById('booth-lights');
  var coinSlotWrap = document.getElementById('coin-slot-wrap');
  var coin = document.getElementById('coin');
  var countdownDisplay = document.getElementById('countdown-display');
  var countdownNumber = document.getElementById('countdown-number');
  var flashOverlay = document.getElementById('flash-overlay');
  var strip1 = document.getElementById('strip-1');
  var strip2 = document.getElementById('strip-2');
  var stripsContainer = document.getElementById('strips-container');
  var textStrip = document.getElementById('text-strip');
  var endFlash = document.getElementById('end-flash');

  // Photo images in strip 1
  var photos1 = [
    document.getElementById('photo-1-1'),
    document.getElementById('photo-1-2'),
    document.getElementById('photo-1-3'),
    document.getElementById('photo-1-4'),
  ];
  var nums1 = [
    document.getElementById('num-1-1'),
    document.getElementById('num-1-2'),
    document.getElementById('num-1-3'),
    document.getElementById('num-1-4'),
  ];

  // Photo images in strip 2
  var photos2 = [
    document.getElementById('photo-2-1'),
    document.getElementById('photo-2-2'),
    document.getElementById('photo-2-3'),
    document.getElementById('photo-2-4'),
  ];
  var nums2 = [
    document.getElementById('num-2-1'),
    document.getElementById('num-2-2'),
    document.getElementById('num-2-3'),
    document.getElementById('num-2-4'),
  ];

  // Fullscreen photos
  var fsphotos = [
    document.getElementById('fs-0'),
    document.getElementById('fs-1'),
    document.getElementById('fs-2'),
  ];

  // Text strip elements
  var ttexts = [
    document.getElementById('ttext-1'),
    document.getElementById('ttext-2'),
    document.getElementById('ttext-3'),
    document.getElementById('ttext-4'),
  ];
  var taccs = [
    document.getElementById('tacc-1'),
    document.getElementById('tacc-2'),
    document.getElementById('tacc-3'),
    document.getElementById('tacc-4'),
  ];

  // ============================================================
  // MAIN STATE MACHINE
  // ============================================================
  window.__applyUpTo = function(t) {
    // --- Reset everything to initial state ---
    boothSign.style.opacity = '0';
    boothLights.style.opacity = '0';
    coinSlotWrap.style.opacity = '0';
    coin.style.opacity = '0';
    coin.style.transform = 'translateY(0)';
    countdownDisplay.style.opacity = '0';
    flashOverlay.style.opacity = '0';
    endFlash.style.opacity = '0';

    // Strip 1: default hidden, below screen
    strip1.style.opacity = '0';
    strip1.style.transform = 'translateY(' + H + 'px)';

    // Strip 2: default hidden, below screen
    strip2.style.opacity = '0';
    strip2.style.transform = 'translateY(' + H + 'px)';

    // All photos in strips hidden
    for (var i = 0; i < 4; i++) {
      photos1[i].style.opacity = '0';
      nums1[i].style.opacity = '0';
      photos2[i].style.opacity = '0';
      nums2[i].style.opacity = '0';
    }

    // Fullscreen photos hidden
    for (var j = 0; j < 3; j++) {
      fsphotos[j].style.opacity = '0';
    }

    // Text strip hidden
    textStrip.style.transform = 'translateY(' + (H + 200) + 'px)';
    for (var k = 0; k < 4; k++) {
      ttexts[k].style.opacity = '0';
      taccs[k].style.opacity = '0';
    }

    // ============================================================
    // 0–0.3s: Dark — booth comes to life
    // ============================================================
    if (t >= 0) {
      // Nothing yet
    }

    // ============================================================
    // 0.3–1s: STEP INTO THE BOOTH sign fades in + lights appear
    // ============================================================
    if (t >= 0.3) {
      var signP = progress(t, 0.3, 0.9);
      boothSign.style.opacity = String(easeOut(signP));
    }

    if (t >= 0.5) {
      var lightsP = progress(t, 0.5, 1.0);
      boothLights.style.opacity = String(easeOut(lightsP));
    }

    // Coin slot appears
    if (t >= 0.6) {
      var slotP = progress(t, 0.6, 1.0);
      coinSlotWrap.style.opacity = String(easeOut(slotP));
    }

    // Coin drops (0.7–1.0s)
    if (t >= 0.7 && t < 1.0) {
      var coinP = progress(t, 0.7, 1.0);
      coin.style.opacity = String(easeOut(coinP));
      var coinDropY = lerp(-80, 0, easeOut(coinP));
      if (coinP > 0.6) {
        // Bounce
        var bounceFrac = (coinP - 0.6) / 0.4;
        var bounce = Math.sin(bounceFrac * Math.PI) * -10;
        coinDropY += bounce;
      }
      coin.style.transform = 'translateY(' + coinDropY + 'px)';
    }

    // ============================================================
    // 1–2s: BIG "3" countdown, pulsing
    // ============================================================
    if (t >= 1.0 && t < 2.0) {
      countdownDisplay.style.opacity = '1';
      countdownNumber.textContent = '3';
      // Keep booth sign visible but dim
      boothSign.style.opacity = '0.4';
      boothLights.style.opacity = '1';
      coinSlotWrap.style.opacity = '0';
    }

    // ============================================================
    // 2–2.5s: "2" countdown
    // ============================================================
    if (t >= 2.0 && t < 2.5) {
      countdownDisplay.style.opacity = '1';
      countdownNumber.textContent = '2';
      boothSign.style.opacity = '0.2';
      boothLights.style.opacity = '1';
    }

    // ============================================================
    // 2.5–3s: "1" countdown
    // ============================================================
    if (t >= 2.5 && t < 3.0) {
      countdownDisplay.style.opacity = '1';
      countdownNumber.textContent = '1';
      boothSign.style.opacity = '0';
    }

    // ============================================================
    // 3–3.3s: FLASH! Photo 1 appears, strip 1 slides in
    // ============================================================
    if (t >= 3.0) {
      countdownDisplay.style.opacity = '0';
      boothLights.style.opacity = '1';

      // Strip 1 slides in from bottom
      var s1InP = progress(t, 3.0, 3.4);
      var s1Y = lerp(H, 0, easeOut(s1InP));
      strip1.style.opacity = s1InP > 0 ? '1' : '0';
      strip1.style.transform = 'translateY(' + s1Y + 'px)';
    }

    // Flash at 3.0
    if (t >= 3.0 && t < 3.3) {
      var flashP = progress(t, 3.0, 3.3);
      // Sharp spike then fade
      var flashVal = flashP < 0.2 ? flashP / 0.2 : 1.0 - (flashP - 0.2) / 0.8;
      flashOverlay.style.opacity = String(flashVal * 0.95);
    }

    // Photo 1 appears after flash (3.15s)
    if (t >= 3.15) {
      photos1[0].style.opacity = '1';
      nums1[0].style.opacity = '1';
    }

    // ============================================================
    // 3.3–4s: Quick "3" countdown
    // ============================================================
    if (t >= 3.3 && t < 3.6) {
      countdownDisplay.style.opacity = String(progress(t, 3.3, 3.35));
      countdownNumber.textContent = '3';
    }
    if (t >= 3.6 && t < 3.9) {
      countdownDisplay.style.opacity = '1';
      countdownNumber.textContent = '2';
    }
    if (t >= 3.9 && t < 4.0) {
      countdownDisplay.style.opacity = '1';
      countdownNumber.textContent = '1';
    }

    // ============================================================
    // 4–4.3s: FLASH → Photo 2 into position 2
    // ============================================================
    if (t >= 4.0 && t < 4.3) {
      var f2P = progress(t, 4.0, 4.3);
      var f2Val = f2P < 0.2 ? f2P / 0.2 : 1.0 - (f2P - 0.2) / 0.8;
      flashOverlay.style.opacity = String(f2Val * 0.95);
      countdownDisplay.style.opacity = '0';
    }

    if (t >= 4.15) {
      photos1[1].style.opacity = '1';
      nums1[1].style.opacity = '1';
    }

    // ============================================================
    // 4.3–5s: Quick 3-2-1
    // ============================================================
    if (t >= 4.3 && t < 4.55) {
      countdownDisplay.style.opacity = '1';
      countdownNumber.textContent = '3';
    }
    if (t >= 4.55 && t < 4.75) {
      countdownDisplay.style.opacity = '1';
      countdownNumber.textContent = '2';
    }
    if (t >= 4.75 && t < 5.0) {
      countdownDisplay.style.opacity = '1';
      countdownNumber.textContent = '1';
    }

    // ============================================================
    // 5–5.3s: FLASH → Photo 3 into position 3
    // ============================================================
    if (t >= 5.0 && t < 5.3) {
      var f3P = progress(t, 5.0, 5.3);
      var f3Val = f3P < 0.2 ? f3P / 0.2 : 1.0 - (f3P - 0.2) / 0.8;
      flashOverlay.style.opacity = String(f3Val * 0.95);
      countdownDisplay.style.opacity = '0';
    }

    if (t >= 5.15) {
      photos1[2].style.opacity = '1';
      nums1[2].style.opacity = '1';
    }

    // ============================================================
    // 5.3–6s: Quick countdown
    // ============================================================
    if (t >= 5.3 && t < 5.55) {
      countdownDisplay.style.opacity = '1';
      countdownNumber.textContent = '3';
    }
    if (t >= 5.55 && t < 5.75) {
      countdownDisplay.style.opacity = '1';
      countdownNumber.textContent = '2';
    }
    if (t >= 5.75 && t < 6.0) {
      countdownDisplay.style.opacity = '1';
      countdownNumber.textContent = '1';
    }

    // ============================================================
    // 6–6.3s: FLASH → Photo 4 into position 4. Strip 1 complete!
    // ============================================================
    if (t >= 6.0 && t < 6.3) {
      var f4P = progress(t, 6.0, 6.3);
      var f4Val = f4P < 0.2 ? f4P / 0.2 : 1.0 - (f4P - 0.2) / 0.8;
      flashOverlay.style.opacity = String(f4Val * 0.95);
      countdownDisplay.style.opacity = '0';
    }

    if (t >= 6.15) {
      photos1[3].style.opacity = '1';
      nums1[3].style.opacity = '1';
    }

    // ============================================================
    // 6.3–7.3s: Strip 1 shifts left, strip 2 slides in from bottom
    // ============================================================
    if (t >= 6.3 && t < 7.3) {
      // Strip 1 slides left
      var shiftP = progress(t, 6.5, 7.3);
      var s1X = lerp(0, -320, easeInOut(shiftP));
      strip1.style.transform = 'translateX(' + s1X + 'px)';
    }

    if (t >= 6.8) {
      // Strip 2 starts coming in
      var s2InP = progress(t, 6.8, 7.3);
      strip2.style.opacity = '1';
      var s2Y = lerp(H, 0, easeOut(s2InP));
      strip2.style.transform = 'translateY(' + s2Y + 'px)';
    }

    // ============================================================
    // 7–7.25s: FLASH → photo 5
    // ============================================================
    if (t >= 7.0 && t < 7.25) {
      var f5P = progress(t, 7.0, 7.25);
      var f5Val = f5P < 0.25 ? f5P / 0.25 : 1.0 - (f5P - 0.25) / 0.75;
      flashOverlay.style.opacity = String(f5Val * 0.9);
      countdownDisplay.style.opacity = '0';
    }
    if (t >= 7.15) {
      photos2[0].style.opacity = '1';
      nums2[0].style.opacity = '1';
    }

    // 7.3-7.7: count "3-2"
    if (t >= 7.3 && t < 7.55) {
      countdownDisplay.style.opacity = '1';
      countdownNumber.textContent = '3';
    }
    if (t >= 7.55 && t < 7.7) {
      countdownDisplay.style.opacity = '1';
      countdownNumber.textContent = '2';
    }

    // ============================================================
    // 7.7–8s: FLASH → photo 6
    // ============================================================
    if (t >= 7.7 && t < 8.0) {
      countdownDisplay.style.opacity = '0';
      var f6P = progress(t, 7.7, 8.0);
      var f6Val = f6P < 0.2 ? f6P / 0.2 : 1.0 - (f6P - 0.2) / 0.8;
      flashOverlay.style.opacity = String(f6Val * 0.9);
    }
    if (t >= 7.85) {
      photos2[1].style.opacity = '1';
      nums2[1].style.opacity = '1';
    }

    // 8.0-8.5: quick 3-2-1
    if (t >= 8.0 && t < 8.2) {
      countdownDisplay.style.opacity = '1';
      countdownNumber.textContent = '3';
    }
    if (t >= 8.2 && t < 8.4) {
      countdownDisplay.style.opacity = '1';
      countdownNumber.textContent = '2';
    }
    if (t >= 8.4 && t < 8.6) {
      countdownDisplay.style.opacity = '1';
      countdownNumber.textContent = '1';
    }

    // ============================================================
    // 8.6–8.9s: FLASH → photo 7
    // ============================================================
    if (t >= 8.6 && t < 8.9) {
      countdownDisplay.style.opacity = '0';
      var f7P = progress(t, 8.6, 8.9);
      var f7Val = f7P < 0.2 ? f7P / 0.2 : 1.0 - (f7P - 0.2) / 0.8;
      flashOverlay.style.opacity = String(f7Val * 0.9);
    }
    if (t >= 8.75) {
      photos2[2].style.opacity = '1';
      nums2[2].style.opacity = '1';
    }

    // 8.9-9.5: quick 3-2-1
    if (t >= 8.9 && t < 9.1) {
      countdownDisplay.style.opacity = '1';
      countdownNumber.textContent = '3';
    }
    if (t >= 9.1 && t < 9.3) {
      countdownDisplay.style.opacity = '1';
      countdownNumber.textContent = '2';
    }
    if (t >= 9.3 && t < 9.5) {
      countdownDisplay.style.opacity = '1';
      countdownNumber.textContent = '1';
    }

    // ============================================================
    // 9.5–9.8s: FLASH → photo 8 — strip 2 complete!
    // ============================================================
    if (t >= 9.5 && t < 9.8) {
      countdownDisplay.style.opacity = '0';
      var f8P = progress(t, 9.5, 9.8);
      var f8Val = f8P < 0.2 ? f8P / 0.2 : 1.0 - (f8P - 0.2) / 0.8;
      flashOverlay.style.opacity = String(f8Val * 0.9);
    }
    if (t >= 9.65) {
      photos2[3].style.opacity = '1';
      nums2[3].style.opacity = '1';
    }

    // ============================================================
    // 10–12s: Both strips visible side by side, slowly spreading/rotating
    // ============================================================
    if (t >= 10.0 && t < 12.0) {
      // Ensure all photos visible
      for (var pi = 0; pi < 4; pi++) {
        photos1[pi].style.opacity = '1';
        nums1[pi].style.opacity = '1';
        photos2[pi].style.opacity = '1';
        nums2[pi].style.opacity = '1';
      }

      var spreadP = progress(t, 10.0, 11.5);
      var spreadEased = easeInOut(spreadP);

      var strip1X = lerp(-320, -380, spreadEased);
      var strip1Rot = lerp(0, -6, spreadEased);
      strip1.style.transform = 'translateX(' + strip1X + 'px) rotate(' + strip1Rot + 'deg)';
      strip1.style.opacity = '1';

      var strip2X = lerp(0, 60, spreadEased);
      var strip2Rot = lerp(0, 5, spreadEased);
      strip2.style.transform = 'translateX(' + strip2X + 'px) rotate(' + strip2Rot + 'deg)';
      strip2.style.opacity = '1';
    }

    // ============================================================
    // 12–14s: Strips scatter, full-screen photo slideshow
    // ============================================================
    if (t >= 12.0 && t < 14.0) {
      var scatterP = progress(t, 12.0, 12.5);
      var scatterEased = easeIn(scatterP);

      // Strips fly off screen
      strip1.style.transform = 'translateX(' + lerp(-380, -${W + 100}, scatterEased) + 'px) rotate(-15deg)';
      strip1.style.opacity = String(lerp(1, 0, scatterEased));

      strip2.style.transform = 'translateX(' + lerp(60, ${W + 100}, scatterEased) + 'px) rotate(15deg)';
      strip2.style.opacity = String(lerp(1, 0, scatterEased));

      // Flash into fullscreen slideshow
      if (t >= 12.0 && t < 12.3) {
        var fsFlashP = progress(t, 12.0, 12.3);
        var fsFlashVal = fsFlashP < 0.3 ? fsFlashP / 0.3 : 1.0 - (fsFlashP - 0.3) / 0.7;
        flashOverlay.style.opacity = String(fsFlashVal * 0.95);
      }

      // Photo 1 fullscreen: 12.3 - 12.9s
      if (t >= 12.3 && t < 13.3) {
        var fp1In = progress(t, 12.3, 12.6);
        var fp1Out = progress(t, 12.9, 13.2);
        var fp1Opacity = easeOut(fp1In) * (1 - easeIn(fp1Out));
        fsphotos[0].style.opacity = String(fp1Opacity);
      }

      // Flash between 1 and 2
      if (t >= 13.0 && t < 13.2) {
        var fsBetween1P = progress(t, 13.0, 13.2);
        var fsBetween1Val = fsBetween1P < 0.3 ? fsBetween1P / 0.3 : 1 - (fsBetween1P - 0.3) / 0.7;
        flashOverlay.style.opacity = String(fsBetween1Val * 0.95);
      }

      // Photo 2 fullscreen: 13.2 - 14s
      if (t >= 13.2 && t < 14.0) {
        var fp2In = progress(t, 13.2, 13.5);
        var fp2Out = progress(t, 13.7, 14.0);
        var fp2Opacity = easeOut(fp2In) * (1 - easeIn(fp2Out));
        fsphotos[1].style.opacity = String(fp2Opacity);
      }
    }

    // ============================================================
    // 14–18s: Text strip slides in with CTA frames
    // ============================================================
    if (t >= 14.0 && t < 18.0) {
      // Flash out of slideshow into text strip
      if (t >= 14.0 && t < 14.3) {
        var ctaFlashP = progress(t, 14.0, 14.3);
        var ctaFlashVal = ctaFlashP < 0.25 ? ctaFlashP / 0.25 : 1 - (ctaFlashP - 0.25) / 0.75;
        flashOverlay.style.opacity = String(ctaFlashVal * 0.95);
      }

      // Text strip slides in
      if (t >= 14.1) {
        var tsInP = progress(t, 14.1, 14.7);
        var tsY = lerp(H + 200, 0, easeOut(tsInP));
        textStrip.style.transform = 'translateY(' + tsY + 'px)';
      } else {
        textStrip.style.transform = 'translateY(' + (H + 200) + 'px)';
      }

      // Frame 1 "DM ME" appears at 14.7
      if (t >= 14.7) {
        var tP1 = progress(t, 14.7, 15.1);
        ttexts[0].style.opacity = String(easeOut(tP1));
        taccs[0].style.opacity = String(easeOut(progress(t, 14.9, 15.3)));
      }

      // Frame 2 "PICK A DATE" at 15.3
      if (t >= 15.3) {
        var tP2 = progress(t, 15.3, 15.7);
        ttexts[1].style.opacity = String(easeOut(tP2));
        taccs[1].style.opacity = String(easeOut(progress(t, 15.5, 15.9)));
      }

      // Frame 3 "SHOW UP" at 16.2
      if (t >= 16.2) {
        var tP3 = progress(t, 16.2, 16.6);
        ttexts[2].style.opacity = String(easeOut(tP3));
        taccs[2].style.opacity = String(easeOut(progress(t, 16.4, 16.8)));
      }

      // Frame 4 "IT'S FREE!" at 17.0
      if (t >= 17.0) {
        var tP4 = progress(t, 17.0, 17.4);
        ttexts[3].style.opacity = String(easeOut(tP4));
        taccs[3].style.opacity = String(easeOut(progress(t, 17.2, 17.6)));
      }
    }

    // ============================================================
    // 18s: Hold text strip visible until end
    // ============================================================
    if (t >= 18.0) {
      // Keep text strip and all text visible
      textStrip.style.transform = 'translateY(0)';
      for (var ti = 0; ti < 4; ti++) {
        ttexts[ti].style.opacity = '1';
        taccs[ti].style.opacity = '1';
      }
    }

  };

  // Disable transitions in capture mode
  if (location.search.includes('capture=1')) {
    var s = document.createElement('style');
    s.textContent = '*, *::before, *::after { transition-duration: 0s !important; animation-duration: 0.001s !important; animation-delay: 0s !important; }';
    document.head.appendChild(s);
  }
</script>
</body>
</html>`;
}

async function main() {
  console.log('=== Photo Booth Strip v66e (Antipolo) ===');
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

  var outputMp4 = path.join(OUT_DIR, '66e-photo-booth-antipolo.mp4');
  execSync(
    'ffmpeg -y -framerate ' + FPS + ' -i "' + path.join(framesDir, 'frame_%05d.png') + '" ' +
    '-c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r ' + FPS + ' -an "' + outputMp4 + '"',
    { stdio: 'inherit' }
  );

  rmSync(framesDir, { recursive: true, force: true });

  var reelsDir = path.join(__dirname, 'reels');
  if (!existsSync(reelsDir)) mkdirSync(reelsDir, { recursive: true });
  var reelsDest = path.join(reelsDir, '66e-photo-booth-antipolo.mp4');
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
