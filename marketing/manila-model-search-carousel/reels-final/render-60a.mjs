import { chromium } from 'playwright';
import { execSync } from 'child_process';
import { mkdirSync, rmSync, existsSync, readFileSync, writeFileSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

var __dirname = path.dirname(fileURLToPath(import.meta.url));
var OUT_DIR = path.join(__dirname, 'output-60a');

var W = 1080;
var H = 1920;
var FPS = 30;

var FILM_SCANS_DIR = '/Volumes/PortableSSD/Exports/film scans';
var PHOTO_NAMES = [
  'DSC_0674.jpg',
  'DSC_0675-2.jpg',
  'DSC_0676-2.jpg',
  'DSC_0678.jpg',
  'DSC_0682-2.jpg',
  'DSC_0685-2.jpg',
  'DSC_0686-2.jpg',
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
  var slideImgs = PHOTO_NAMES.map(function(name, i) {
    return '<img id="slide-' + i + '" src="' + imageDataMap[name] + '" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;" />';
  }).join('\n      ');

  // Build strip divs for tracking effect (40 strips of 48px each = 1920px)
  var strips = [];
  for (var s = 0; s < 40; s++) {
    strips.push('<div class="vhs-strip" id="strip-' + s + '" style="position:absolute;left:0;width:100%;height:48px;top:' + (s * 48) + 'px;overflow:hidden;"></div>');
  }
  var stripHTML = strips.join('\n');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { margin: 0; padding: 0; background: #000033; font-family: 'Courier New', 'Courier', monospace; overflow: hidden; }

  @keyframes recBlink {
    0%, 45% { opacity: 1; }
    50%, 95% { opacity: 0; }
    100% { opacity: 1; }
  }
  @keyframes noiseShift {
    0% { background-position: 0 0; }
    10% { background-position: -5% 10%; }
    20% { background-position: 10% -5%; }
    30% { background-position: -10% 20%; }
    40% { background-position: 20% -10%; }
    50% { background-position: -15% 5%; }
    60% { background-position: 5% -15%; }
    70% { background-position: -20% 15%; }
    80% { background-position: 15% -20%; }
    90% { background-position: -5% 25%; }
    100% { background-position: 0 0; }
  }
  @keyframes staticFlash {
    0%, 100% { opacity: 0; }
    50% { opacity: 0.9; }
  }
  @keyframes colorBleed {
    0%, 100% { text-shadow: 2px 0 #ff0000, -2px 0 #0000ff; }
    25% { text-shadow: 3px 0 #ff0000, -3px 0 #0000ff; }
    50% { text-shadow: 1px 0 #ff0000, -1px 0 #0000ff; }
    75% { text-shadow: 4px 0 #ff0000, -4px 0 #0000ff; }
  }
  @keyframes vhsJitter {
    0%, 80%, 100% { transform: translateX(0); }
    85% { transform: translateX(2px); }
    90% { transform: translateX(-1px); }
    95% { transform: translateX(3px); }
  }

  .vhs-text {
    font-family: 'Courier New', monospace;
    font-weight: 700;
    color: #ffffff;
    text-transform: uppercase;
    letter-spacing: 3px;
    text-shadow: 2px 0 #ff0000, -2px 0 #0000ff;
  }

  .vhs-ui-text {
    font-family: 'Courier New', monospace;
    font-weight: 700;
    color: #ffffff;
    font-size: 36px;
    letter-spacing: 2px;
    text-shadow: 1px 0 rgba(255,0,0,0.7), -1px 0 rgba(0,0,255,0.7);
  }

  .scanlines {
    position: absolute;
    inset: 0;
    z-index: 200;
    pointer-events: none;
    background: repeating-linear-gradient(
      0deg,
      rgba(0,0,0,0.25) 0px,
      rgba(0,0,0,0.25) 2px,
      transparent 2px,
      transparent 4px
    );
  }

  .noise-overlay {
    position: absolute;
    inset: 0;
    z-index: 150;
    pointer-events: none;
    opacity: 0.07;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    background-size: 200px 200px;
    animation: noiseShift 0.1s steps(1) infinite;
  }

  .vignette {
    position: absolute;
    inset: 0;
    z-index: 190;
    pointer-events: none;
    background: radial-gradient(ellipse at center, transparent 50%, rgba(0,0,10,0.6) 100%);
  }

  .static-burst {
    position: absolute;
    inset: 0;
    z-index: 300;
    pointer-events: none;
    background: repeating-linear-gradient(
      90deg,
      rgba(255,255,255,0.1) 0px, rgba(0,0,0,0.3) 2px,
      rgba(200,200,255,0.15) 4px, rgba(0,0,0,0.2) 6px,
      rgba(255,255,200,0.08) 8px, rgba(0,0,0,0.4) 10px
    );
    mix-blend-mode: screen;
    opacity: 0;
  }

  .tracking-band {
    position: absolute;
    left: 0;
    width: 100%;
    height: 6px;
    background: rgba(255,255,255,0.4);
    z-index: 180;
    pointer-events: none;
    display: none;
  }

  .photo-layer {
    position: absolute;
    inset: 0;
    z-index: 10;
  }
</style>
</head>
<body>
  <div id="root" style="width:${W}px;height:${H}px;position:relative;overflow:hidden;background:#000033;">

    <!-- Photo layer — full bleed behind everything -->
    <div class="photo-layer" id="photo-layer">
      ${slideImgs}
    </div>

    <!-- VHS tracking strips container (for horizontal offset glitch) -->
    <div id="tracking-container" style="position:absolute;inset:0;z-index:20;pointer-events:none;opacity:0;">
      ${stripHTML}
    </div>

    <!-- Blue screen / background color -->
    <div id="bg-screen" style="position:absolute;inset:0;z-index:5;background:#000033;"></div>

    <!-- Static burst overlay -->
    <div class="static-burst" id="static-burst"></div>

    <!-- Noise overlay -->
    <div class="noise-overlay"></div>
    <!-- Scanlines -->
    <div class="scanlines"></div>
    <!-- Vignette -->
    <div class="vignette"></div>

    <!-- Tracking band (scrolling horizontal glitch line) -->
    <div class="tracking-band" id="tracking-band-1"></div>
    <div class="tracking-band" id="tracking-band-2" style="height:3px;background:rgba(150,100,255,0.3);"></div>

    <!-- ======= VHS UI OVERLAYS ======= -->

    <!-- REC indicator top-left -->
    <div id="rec-indicator" style="position:absolute;top:60px;left:60px;z-index:500;display:none;align-items:center;gap:12px;">
      <div id="rec-dot" style="width:24px;height:24px;border-radius:50%;background:#ff0000;animation:recBlink 1s step-end infinite;box-shadow:0 0 8px #ff0000;"></div>
      <span class="vhs-ui-text" style="font-size:34px;letter-spacing:4px;">REC</span>
    </div>

    <!-- PLAY indicator -->
    <div id="play-indicator" style="position:absolute;top:60px;left:60px;z-index:500;display:none;">
      <span class="vhs-ui-text" style="font-size:34px;letter-spacing:4px;">PLAY ▶</span>
    </div>

    <!-- PAUSE indicator -->
    <div id="pause-indicator" style="position:absolute;top:60px;left:60px;z-index:500;display:none;">
      <span class="vhs-ui-text" style="font-size:34px;letter-spacing:4px;color:#ffff00;text-shadow:1px 0 #ff8800,-1px 0 #ff8800;">PAUSE ❚❚</span>
    </div>

    <!-- REWIND indicator -->
    <div id="rewind-indicator" style="position:absolute;top:60px;left:60px;z-index:500;display:none;">
      <span class="vhs-ui-text" style="font-size:34px;letter-spacing:4px;color:#00ffff;text-shadow:1px 0 #0088ff,-1px 0 #0088ff;">◀◀ REW</span>
    </div>

    <!-- Timestamp bottom-right -->
    <div id="timestamp" style="position:absolute;bottom:80px;right:60px;z-index:500;display:none;">
      <span id="ts-text" class="vhs-ui-text" style="font-size:38px;letter-spacing:3px;">00:00:00</span>
    </div>

    <!-- SP indicator (tape speed) -->
    <div id="sp-label" style="position:absolute;bottom:80px;left:60px;z-index:500;display:none;">
      <span class="vhs-ui-text" style="font-size:28px;letter-spacing:3px;opacity:0.7;">SP</span>
    </div>

    <!-- NO SIGNAL screen -->
    <div id="no-signal" style="position:absolute;inset:0;z-index:400;background:#000033;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:40px;">
      <div style="font-size:80px;font-weight:900;color:#ffffff;letter-spacing:8px;text-shadow:4px 0 #ff0000,-4px 0 #0000ff;font-family:'Courier New',monospace;text-transform:uppercase;">NO SIGNAL</div>
      <div style="width:300px;height:4px;background:linear-gradient(90deg,transparent,#ffffff,transparent);opacity:0.4;"></div>
      <div style="font-size:32px;color:rgba(255,255,255,0.4);font-family:'Courier New',monospace;letter-spacing:6px;">CH 03</div>
    </div>

    <!-- Title screen -->
    <div id="title-screen" style="position:absolute;inset:0;z-index:350;background:transparent;display:none;flex-direction:column;align-items:center;justify-content:center;gap:30px;padding:80px;">
      <div id="title-main" style="font-size:88px;font-weight:900;color:#ffffff;letter-spacing:6px;text-align:center;font-family:'Courier New',monospace;text-transform:uppercase;line-height:1.1;text-shadow:4px 0 #ff0000,-4px 0 #0000ff;animation:vhsJitter 2s ease-in-out infinite;opacity:0;">MANILA<br>FREE PHOTO<br>SHOOT</div>
      <div id="title-sub" style="font-size:40px;color:rgba(255,255,255,0.6);font-family:'Courier New',monospace;letter-spacing:8px;text-shadow:2px 0 #ff0000,-2px 0 #0000ff;opacity:0;">MANILA · 2026</div>
    </div>

    <!-- Main content area: VHS text overlays for CTA/steps -->
    <div id="vhs-content" style="position:absolute;inset:0;z-index:300;pointer-events:none;display:none;">

      <!-- Steps overlay (bottom half) -->
      <div id="steps-panel" style="position:absolute;bottom:160px;left:60px;right:60px;z-index:310;display:none;flex-direction:column;gap:24px;">
        <div id="step1" style="opacity:0;font-family:'Courier New',monospace;font-size:46px;font-weight:700;color:#ffffff;text-shadow:2px 0 #ff0000,-2px 0 #0000ff;letter-spacing:2px;">1. DM @MADEBYAIDAN</div>
        <div id="step2" style="opacity:0;font-family:'Courier New',monospace;font-size:46px;font-weight:700;color:#ffffff;text-shadow:2px 0 #ff0000,-2px 0 #0000ff;letter-spacing:2px;">2. PICK A DATE</div>
        <div id="step3" style="opacity:0;font-family:'Courier New',monospace;font-size:46px;font-weight:700;color:#ffffff;text-shadow:2px 0 #ff0000,-2px 0 #0000ff;letter-spacing:2px;">3. SHOW UP — IT'S FREE</div>
      </div>

      <!-- CTA screen -->
      <div id="cta-panel" style="position:absolute;inset:0;z-index:320;display:none;flex-direction:column;align-items:center;justify-content:center;gap:40px;padding:80px;background:rgba(0,0,20,0.7);">
        <div style="font-size:30px;color:rgba(255,255,255,0.5);font-family:'Courier New',monospace;letter-spacing:8px;text-shadow:1px 0 #ff0000,-1px 0 #0000ff;">FREE PHOTO SHOOT</div>
        <div style="font-size:100px;font-weight:900;color:#ffffff;font-family:'Courier New',monospace;letter-spacing:4px;text-shadow:5px 0 #ff0000,-5px 0 #0000ff;animation:vhsJitter 1.5s ease-in-out infinite;text-align:center;line-height:1;">@madebyaidan</div>
        <div style="font-size:44px;color:rgba(255,255,255,0.8);font-family:'Courier New',monospace;letter-spacing:4px;text-shadow:2px 0 #ff0000,-2px 0 #0000ff;">DM ME ON INSTAGRAM</div>
        <div style="width:600px;height:3px;background:linear-gradient(90deg,transparent,#ffffff,transparent);margin:10px 0;opacity:0.5;"></div>
        <div id="cta-tracking" style="font-size:34px;color:rgba(255,255,255,0.5);font-family:'Courier New',monospace;letter-spacing:6px;">▶ MANILA 2026 ◀</div>
      </div>

    </div>

  </div>

<script>
  var W = ${W};
  var H = ${H};
  var FPS = ${FPS};
  var PHOTO_COUNT = ${PHOTO_NAMES.length};

  var noSignal = document.getElementById('no-signal');
  var titleScreen = document.getElementById('title-screen');
  var titleMain = document.getElementById('title-main');
  var titleSub = document.getElementById('title-sub');
  var staticBurst = document.getElementById('static-burst');
  var bgScreen = document.getElementById('bg-screen');
  var recIndicator = document.getElementById('rec-indicator');
  var playIndicator = document.getElementById('play-indicator');
  var pauseIndicator = document.getElementById('pause-indicator');
  var rewindIndicator = document.getElementById('rewind-indicator');
  var tsText = document.getElementById('ts-text');
  var timestamp = document.getElementById('timestamp');
  var spLabel = document.getElementById('sp-label');
  var vhsContent = document.getElementById('vhs-content');
  var stepsPanel = document.getElementById('steps-panel');
  var ctaPanel = document.getElementById('cta-panel');
  var trackingContainer = document.getElementById('tracking-container');
  var trackingBand1 = document.getElementById('tracking-band-1');
  var trackingBand2 = document.getElementById('tracking-band-2');

  function showSlide(index) {
    for (var i = 0; i < PHOTO_COUNT; i++) {
      var img = document.getElementById('slide-' + i);
      if (img) img.style.opacity = (i === index) ? '1' : '0';
    }
  }

  function hideAllSlides() {
    for (var i = 0; i < PHOTO_COUNT; i++) {
      var img = document.getElementById('slide-' + i);
      if (img) img.style.opacity = '0';
    }
  }

  function showEl(el) { if (el) el.style.display = 'flex'; }
  function showBlock(el) { if (el) el.style.display = 'block'; }
  function hideEl(el) { if (el) el.style.display = 'none'; }

  function formatTimestamp(t) {
    // t is video time; offset to start at 00:00:01 when playback begins at 1s
    var offset = Math.max(0, t - 1.0);
    var h = Math.floor(offset / 3600);
    var m = Math.floor((offset % 3600) / 60);
    var s = Math.floor(offset % 60);
    return (h < 10 ? '0' : '') + h + ':' +
           (m < 10 ? '0' : '') + m + ':' +
           (s < 10 ? '0' : '') + s;
  }

  // Apply VHS tracking distortion: randomly shift horizontal strips
  function applyTrackingDistortion(intensity, t) {
    var container = trackingContainer;
    if (!container) return;

    // Use a pseudo-random but deterministic seed based on time
    var seed = Math.floor(t * 30);
    function seededRand(i) {
      var x = Math.sin(seed * 127.1 + i * 311.7) * 43758.5453;
      return x - Math.floor(x);
    }

    for (var s = 0; s < 40; s++) {
      var strip = document.getElementById('strip-' + s);
      if (!strip) continue;
      var r = seededRand(s);
      // Only shift some strips based on intensity
      if (r < intensity) {
        var offsetX = (seededRand(s + 100) - 0.5) * 2 * 60 * intensity;
        strip.style.transform = 'translateX(' + offsetX + 'px)';
        strip.style.filter = intensity > 0.5 ? 'hue-rotate(' + (r * 180) + 'deg) saturate(2)' : '';
      } else {
        strip.style.transform = 'translateX(0)';
        strip.style.filter = '';
      }
    }
  }

  // Show a tracking band (horizontal glitch line)
  function showTrackingBand(band, yPos) {
    band.style.top = yPos + 'px';
    band.style.display = 'block';
  }

  // The full state machine driven by time t
  window.__applyUpTo = function(t) {
    // =============================================
    // Reset all state
    // =============================================
    hideAllSlides();
    hideEl(recIndicator);
    hideEl(playIndicator);
    hideEl(pauseIndicator);
    hideEl(rewindIndicator);
    hideEl(timestamp);
    hideEl(spLabel);
    hideEl(titleScreen);
    hideEl(vhsContent);
    hideEl(stepsPanel);
    hideEl(ctaPanel);
    hideEl(trackingBand1);
    hideEl(trackingBand2);
    titleMain.style.opacity = '0';
    titleSub.style.opacity = '0';
    bgScreen.style.opacity = '1';
    bgScreen.style.background = '#000033';
    trackingContainer.style.opacity = '0';
    staticBurst.style.opacity = '0';
    noSignal.style.display = 'flex';

    // =============================================
    // 0-1s: Blue screen with NO SIGNAL
    // =============================================
    if (t >= 0) {
      noSignal.style.display = 'flex';
      bgScreen.style.background = '#000033';
      bgScreen.style.opacity = '1';
    }

    // Static burst at ~0.6s (noise before play starts)
    if (t >= 0.6 && t < 1.0) {
      var burstProgress = (t - 0.6) / 0.4;
      // Flicker rapidly
      var flickerVal = (Math.sin(t * 120) + 1) / 2;
      staticBurst.style.opacity = String(0.8 * flickerVal);
    }

    // =============================================
    // 1-2s: PLAY appears, title approaches
    // =============================================
    if (t >= 1.0) {
      noSignal.style.display = 'none';
      showEl(titleScreen);
      bgScreen.style.background = '#000022';
      bgScreen.style.opacity = '0.95';

      showEl(playIndicator);
      showEl(timestamp);
      showEl(spLabel);
      tsText.textContent = formatTimestamp(t);
    }

    if (t >= 1.5) {
      titleMain.style.opacity = '1';
    }
    if (t >= 1.8) {
      titleSub.style.opacity = '1';
    }

    // =============================================
    // 2-3s: Tracking distortion, title dissolves
    // =============================================
    if (t >= 2.0 && t < 3.0) {
      var trProgress = (t - 2.0) / 1.0;
      trackingContainer.style.opacity = '1';
      applyTrackingDistortion(Math.min(1, trProgress * 2), t);

      // Title fades out
      if (t >= 2.5) {
        titleMain.style.opacity = String(Math.max(0, 1 - (t - 2.5) * 2));
        titleSub.style.opacity = String(Math.max(0, 1 - (t - 2.5) * 2));
      }

      // Show tracking bands
      var band1Y = ((t - 2.0) / 1.0) * H;
      showTrackingBand(trackingBand1, band1Y);
      showTrackingBand(trackingBand2, Math.max(0, band1Y - 120));
    }

    // =============================================
    // 3-13s: Photo slideshow with VHS effects
    // =============================================
    if (t >= 3.0 && t < 13.0) {
      hideEl(titleScreen);
      hideEl(playIndicator);
      trackingContainer.style.opacity = '0';
      bgScreen.style.opacity = '0'; // Photos show through

      showEl(recIndicator);
      showEl(timestamp);
      showEl(spLabel);
      tsText.textContent = formatTimestamp(t);

      // Photo timing: 8 photos over 10 seconds = 1.25s each
      var photoIndex = Math.floor((t - 3.0) / 1.25);
      photoIndex = Math.min(photoIndex, PHOTO_COUNT - 1);
      showSlide(photoIndex);

      // Brief static burst at each photo transition
      var photoLocalT = (t - 3.0) % 1.25;
      if (photoLocalT < 0.12) {
        var burstFade = Math.sin((photoLocalT / 0.12) * Math.PI);
        staticBurst.style.opacity = String(0.6 * burstFade);
      }

      // Subtle ongoing tracking noise
      if (t >= 3.0) {
        // Light periodic tracking distortion
        var trackNoise = Math.sin(t * 7.3) * 0.5 + 0.5;
        if (trackNoise > 0.8) {
          trackingContainer.style.opacity = String((trackNoise - 0.8) * 2.5 * 0.4);
          applyTrackingDistortion((trackNoise - 0.8) * 2.5 * 0.3, t);
        }
      }
    }

    // =============================================
    // 13-14s: PAUSE effect — freeze on last photo
    // =============================================
    if (t >= 13.0 && t < 14.0) {
      bgScreen.style.opacity = '0';
      showSlide(PHOTO_COUNT - 1);
      hideEl(recIndicator);
      showEl(pauseIndicator);
      showEl(timestamp);
      showEl(spLabel);
      tsText.textContent = formatTimestamp(13.0); // frozen timestamp

      // Intensify scanlines effect via tracking container
      trackingContainer.style.opacity = String(0.5);
      applyTrackingDistortion(0.2, t);

      // Show tracking bands
      var pauseBandY = ((t - 13.0) / 1.0) * H;
      showTrackingBand(trackingBand1, pauseBandY % H);
      showTrackingBand(trackingBand2, (pauseBandY + 400) % H);
    }

    // =============================================
    // 14-18s: REWIND then PLAY with steps
    // =============================================
    if (t >= 14.0 && t < 18.0) {
      bgScreen.style.opacity = '0';
      hideEl(pauseIndicator);
      hideEl(recIndicator);
      showEl(timestamp);
      showEl(spLabel);

      if (t >= 14.0 && t < 16.0) {
        // Rewind: rapidly flash previous photos
        showEl(rewindIndicator);
        tsText.textContent = formatTimestamp(t);

        // Flash through photos rapidly in reverse
        var rewindSpeed = 8; // photos per second
        var rewindIndex = Math.floor((PHOTO_COUNT - 1) - ((t - 14.0) * rewindSpeed)) % PHOTO_COUNT;
        rewindIndex = Math.max(0, rewindIndex);
        showSlide(rewindIndex);

        // Heavy tracking distortion during rewind
        trackingContainer.style.opacity = '0.8';
        applyTrackingDistortion(0.7, t);
        staticBurst.style.opacity = String(0.3 * Math.abs(Math.sin(t * 20)));
      }

      if (t >= 16.0) {
        // PLAY resumes — show steps
        hideEl(rewindIndicator);
        showEl(playIndicator);
        tsText.textContent = formatTimestamp(t);

        // Show first photo as background
        showSlide(0);
        trackingContainer.style.opacity = '0.2';
        applyTrackingDistortion(0.15, t);

        // Show steps panel
        showEl(vhsContent);
        stepsPanel.style.display = 'flex';

        // Steps appear one by one
        var step1 = document.getElementById('step1');
        var step2 = document.getElementById('step2');
        var step3 = document.getElementById('step3');

        if (t >= 16.3) step1.style.opacity = '1';
        if (t >= 16.9) step2.style.opacity = '1';
        if (t >= 17.5) step3.style.opacity = '1';
      }
    }

    // =============================================
    // 18-22s: Static burst -> CTA screen
    // =============================================
    if (t >= 18.0 && t < 22.0) {
      hideEl(rewindIndicator);
      hideEl(playIndicator);
      hideEl(recIndicator);
      bgScreen.style.opacity = '0';

      showEl(vhsContent);
      showEl(timestamp);
      showEl(spLabel);
      tsText.textContent = formatTimestamp(t);

      // Static burst transition at 18.0
      if (t >= 18.0 && t < 18.5) {
        var burstT = (t - 18.0) / 0.5;
        var flicker2 = Math.abs(Math.sin(t * 80));
        staticBurst.style.opacity = String(0.9 * flicker2 * (1 - burstT));
        // Show last slide during burst
        showSlide(PHOTO_COUNT - 1);
        trackingContainer.style.opacity = '0.9';
        applyTrackingDistortion(0.9, t);
      }

      if (t >= 18.5) {
        stepsPanel.style.display = 'none';
        ctaPanel.style.display = 'flex';
        hideAllSlides();
        bgScreen.style.opacity = '0.6';
        bgScreen.style.background = '#000022';
        trackingContainer.style.opacity = '0.15';
        applyTrackingDistortion(0.1, t);
        staticBurst.style.opacity = '0';
      }
    }

    // =============================================
    // 22-24s: Signal degrades -> NO SIGNAL returns
    // =============================================
    if (t >= 22.0) {
      hideEl(ctaPanel);
      hideEl(stepsPanel);
      hideEl(playIndicator);
      hideEl(recIndicator);
      showEl(timestamp);
      tsText.textContent = formatTimestamp(t);

      var degradeProgress = (t - 22.0) / 2.0;

      // Degrade: increase tracking distortion
      trackingContainer.style.opacity = String(Math.min(1, degradeProgress * 2));
      applyTrackingDistortion(Math.min(1, degradeProgress * 1.5), t);

      // Static intensifies
      var degrade2 = Math.abs(Math.sin(t * 15));
      staticBurst.style.opacity = String(degradeProgress * 0.8 * degrade2);

      bgScreen.style.opacity = String(Math.min(1, degradeProgress * 1.2));
      bgScreen.style.background = '#000033';
      hideAllSlides();

      // NO SIGNAL fades back in
      if (degradeProgress > 0.7) {
        noSignal.style.display = 'flex';
        noSignal.style.opacity = String(Math.min(1, (degradeProgress - 0.7) / 0.3));
      }
    }

    // Update timestamp continuously when visible
    if (t >= 1.0 && t < 13.0) {
      tsText.textContent = formatTimestamp(t);
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
  console.log('=== VHS Tape Reel v60a ===');
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

  var outputMp4 = path.join(OUT_DIR, 'manila-vhs-v60a.mp4');
  execSync(
    'ffmpeg -y -framerate ' + FPS + ' -i "' + path.join(framesDir, 'frame_%05d.png') + '" ' +
    '-c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r ' + FPS + ' -an "' + outputMp4 + '"',
    { stdio: 'inherit' }
  );

  rmSync(framesDir, { recursive: true, force: true });

  var reelsDir = path.join(__dirname, 'reels');
  if (!existsSync(reelsDir)) mkdirSync(reelsDir, { recursive: true });
  var reelsDest = path.join(reelsDir, 'manila-vhs-v60a.mp4');
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
