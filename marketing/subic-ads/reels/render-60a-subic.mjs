import { chromium } from 'playwright';
import { execSync } from 'child_process';
import { mkdirSync, rmSync, existsSync, readFileSync, writeFileSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

var __dirname = path.dirname(fileURLToPath(import.meta.url));
var OUT_DIR = path.join(__dirname, 'output-60a-subic');

var W = 1080;
var H = 1920;
var FPS = 30;
var SAFE_TOP = 213;
var SAFE_BOTTOM = 430;

var FILM_SCANS_DIR = '/Volumes/PortableSSD/Exports/film scans';
var PHOTO_NAMES = [
  'DSC_0674.jpg',
  'DSC_0675.jpg',
  'DSC_0676.jpg',
  'DSC_0678.jpg',
  'DSC_0679.jpg',
  'DSC_0680.jpg',
  'DSC_0682.jpg',
  'DSC_0685.jpg',
];

// Portfolio photo fallbacks when the SSD is not mounted
var PORTFOLIO_DIR = path.resolve(__dirname, '../../../public/images/large');
var PORTFOLIO_FALLBACKS = [
  'manila-gallery-garden-001.jpg',
  'manila-gallery-canal-001.jpg',
  'manila-gallery-ivy-001.jpg',
  'manila-gallery-night-001.jpg',
  'manila-gallery-park-001.jpg',
  'manila-gallery-rocks-001.jpg',
  'manila-gallery-street-001.jpg',
  'manila-gallery-urban-001.jpg',
];

var TOTAL_DURATION = 15;
var TOTAL_FRAMES = TOTAL_DURATION * FPS; // 450 frames

function resetOutputDir() {
  rmSync(OUT_DIR, { recursive: true, force: true });
  mkdirSync(OUT_DIR, { recursive: true });
}

function processPhotos() {
  var cropDir = path.join(OUT_DIR, 'tmp-photos');
  mkdirSync(cropDir, { recursive: true });
  var processed = {};
  var useFallback = !existsSync(FILM_SCANS_DIR);
  if (useFallback) {
    console.log('  SSD not mounted, using portfolio fallback photos');
  }
  for (var i = 0; i < PHOTO_NAMES.length; i++) {
    var name = PHOTO_NAMES[i];
    var dst = path.join(cropDir, name.replace(/\.jpg$/i, '_processed.jpg'));
    if (useFallback) {
      var fallbackName = PORTFOLIO_FALLBACKS[i];
      var fallbackSrc = path.join(PORTFOLIO_DIR, fallbackName);
      if (!existsSync(fallbackSrc)) {
        console.error('Fallback photo not found: ' + fallbackSrc);
        process.exit(1);
      }
      execSync('cp "' + fallbackSrc + '" "' + dst + '"', { stdio: 'pipe' });
    } else {
      var src = path.join(FILM_SCANS_DIR, name);
      if (!existsSync(src)) {
        console.error('Photo not found: ' + src);
        process.exit(1);
      }
      execSync('magick "' + src + '" -shave 500x600 +repage -auto-level -quality 95 "' + dst + '"', { stdio: 'pipe' });
    }
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

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { margin: 0; padding: 0; background: #000; font-family: 'Courier New', 'Courier', monospace; overflow: hidden; }

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

  .scanlines {
    position: absolute;
    inset: 0;
    z-index: 200;
    pointer-events: none;
    background: repeating-linear-gradient(
      0deg,
      rgba(0,0,0,0.2) 0px,
      rgba(0,0,0,0.2) 2px,
      transparent 2px,
      transparent 4px
    );
  }

  .noise-overlay {
    position: absolute;
    inset: 0;
    z-index: 150;
    pointer-events: none;
    opacity: 0.06;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    background-size: 200px 200px;
    animation: noiseShift 0.1s steps(1) infinite;
  }

  .vignette {
    position: absolute;
    inset: 0;
    z-index: 190;
    pointer-events: none;
    background: radial-gradient(ellipse at center, transparent 50%, rgba(0,0,10,0.7) 100%);
  }

  .static-burst {
    position: absolute;
    inset: 0;
    z-index: 300;
    pointer-events: none;
    background: repeating-linear-gradient(
      90deg,
      rgba(255,255,255,0.15) 0px, rgba(0,0,0,0.3) 2px,
      rgba(200,200,255,0.1) 4px, rgba(0,0,0,0.2) 6px,
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
    z-index: 250;
    pointer-events: none;
    display: none;
  }

  .photo-layer {
    position: absolute;
    inset: 0;
    z-index: 10;
  }

  .vhs-ui-text {
    font-family: 'Courier New', monospace;
    font-weight: 700;
    color: #ffffff;
    letter-spacing: 2px;
    text-shadow: 1px 0 rgba(255,0,0,0.7), -1px 0 rgba(0,0,255,0.7);
  }

  .color-bleed {
    filter: contrast(1.1) saturate(1.3);
  }
</style>
</head>
<body>
  <div id="root" style="width:${W}px;height:${H}px;position:relative;overflow:hidden;background:#000;">

    <!-- Photo layer -->
    <div class="photo-layer" id="photo-layer">
      ${slideImgs}
    </div>

    <!-- Blue screen background -->
    <div id="bg-screen" style="position:absolute;inset:0;z-index:5;background:#000044;"></div>

    <!-- Static burst overlay -->
    <div class="static-burst" id="static-burst"></div>

    <!-- Noise overlay -->
    <div class="noise-overlay" id="noise-overlay"></div>
    <!-- Scanlines -->
    <div class="scanlines"></div>
    <!-- Vignette -->
    <div class="vignette"></div>

    <!-- Tracking bands -->
    <div class="tracking-band" id="tracking-band-1"></div>
    <div class="tracking-band" id="tracking-band-2" style="height:3px;background:rgba(150,100,255,0.3);"></div>

    <!-- Color bleed horizontal bars (VHS artifact) -->
    <div id="color-bleed-bar" style="position:absolute;left:0;width:100%;height:12px;z-index:220;pointer-events:none;display:none;background:linear-gradient(90deg, rgba(255,0,0,0.15), rgba(0,0,255,0.15), rgba(255,0,0,0.1));mix-blend-mode:screen;"></div>

    <!-- ======= NO SIGNAL SCREEN ======= -->
    <div id="no-signal" style="position:absolute;inset:0;z-index:400;background:#000044;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:30px;">
      <div style="font-size:72px;font-weight:900;color:#ffffff;letter-spacing:8px;text-shadow:4px 0 #ff0000,-4px 0 #0000ff;font-family:'Courier New',monospace;text-transform:uppercase;">NO SIGNAL</div>
      <div style="width:250px;height:3px;background:linear-gradient(90deg,transparent,#ffffff,transparent);opacity:0.4;"></div>
      <div style="font-size:28px;color:rgba(255,255,255,0.4);font-family:'Courier New',monospace;letter-spacing:6px;">CH 03</div>
    </div>

    <!-- ======= VHS HUD OVERLAYS ======= -->

    <!-- REC indicator top-left -->
    <div id="rec-indicator" style="position:absolute;top:${SAFE_TOP + 20}px;left:50px;z-index:500;display:none;align-items:center;gap:12px;">
      <div id="rec-dot" style="width:22px;height:22px;border-radius:50%;background:#ff0000;animation:recBlink 1s step-end infinite;box-shadow:0 0 8px #ff0000;"></div>
      <span class="vhs-ui-text" style="font-size:32px;letter-spacing:4px;">REC</span>
    </div>

    <!-- PLAY indicator -->
    <div id="play-indicator" style="position:absolute;top:${SAFE_TOP + 20}px;left:50px;z-index:500;display:none;">
      <span class="vhs-ui-text" style="font-size:32px;letter-spacing:4px;">PLAY ▶</span>
    </div>

    <!-- REW indicator -->
    <div id="rew-indicator" style="position:absolute;top:${SAFE_TOP + 20}px;left:50px;z-index:500;display:none;">
      <span class="vhs-ui-text" style="font-size:32px;letter-spacing:4px;color:#00ffff;text-shadow:1px 0 #0088ff,-1px 0 #0088ff;">◀◀ REW</span>
    </div>

    <!-- Date top-right -->
    <div id="vhs-date" style="position:absolute;top:${SAFE_TOP + 20}px;right:50px;z-index:500;display:none;">
      <span class="vhs-ui-text" style="font-size:28px;letter-spacing:3px;">03.14.2026</span>
    </div>

    <!-- Location label -->
    <div id="vhs-location" style="position:absolute;top:${SAFE_TOP + 60}px;right:50px;z-index:500;display:none;">
      <span class="vhs-ui-text" style="font-size:22px;letter-spacing:4px;opacity:0.7;">SUBIC</span>
    </div>

    <!-- Timecode bottom-right -->
    <div id="timecode" style="position:absolute;bottom:${SAFE_BOTTOM + 20}px;right:50px;z-index:500;display:none;">
      <span id="tc-text" class="vhs-ui-text" style="font-size:34px;letter-spacing:3px;">00:00:00:00</span>
    </div>

    <!-- SP label bottom-left -->
    <div id="sp-label" style="position:absolute;bottom:${SAFE_BOTTOM + 20}px;left:50px;z-index:500;display:none;">
      <span class="vhs-ui-text" style="font-size:24px;letter-spacing:3px;opacity:0.6;">SP</span>
    </div>

    <!-- CTA screen -->
    <div id="cta-screen" style="position:absolute;inset:0;z-index:350;display:none;flex-direction:column;align-items:center;justify-content:center;gap:30px;padding:80px;">
      <div id="cta-handle" style="font-size:80px;font-weight:900;color:#ffffff;font-family:'Courier New',monospace;letter-spacing:4px;text-shadow:4px 0 #ff0000,-4px 0 #0000ff;text-align:center;line-height:1;opacity:0;">@madebyaidan</div>
      <div id="cta-sub" style="font-size:36px;color:rgba(255,255,255,0.8);font-family:'Courier New',monospace;letter-spacing:4px;text-shadow:2px 0 #ff0000,-2px 0 #0000ff;text-align:center;opacity:0;">DM FOR A FREE SHOOT</div>
      <div id="cta-line" style="width:500px;height:3px;background:linear-gradient(90deg,transparent,#ffffff,transparent);opacity:0;margin:10px 0;"></div>
      <div id="cta-location" style="font-size:28px;color:rgba(255,255,255,0.5);font-family:'Courier New',monospace;letter-spacing:6px;text-shadow:1px 0 #ff0000,-1px 0 #0000ff;opacity:0;">SUBIC 2026</div>
    </div>

  </div>

<script>
  var W = ${W};
  var H = ${H};
  var FPS = ${FPS};
  var PHOTO_COUNT = ${PHOTO_NAMES.length};

  var noSignal = document.getElementById('no-signal');
  var bgScreen = document.getElementById('bg-screen');
  var staticBurst = document.getElementById('static-burst');
  var noiseOverlay = document.getElementById('noise-overlay');
  var recIndicator = document.getElementById('rec-indicator');
  var playIndicator = document.getElementById('play-indicator');
  var rewIndicator = document.getElementById('rew-indicator');
  var vhsDate = document.getElementById('vhs-date');
  var vhsLocation = document.getElementById('vhs-location');
  var timecode = document.getElementById('timecode');
  var tcText = document.getElementById('tc-text');
  var spLabel = document.getElementById('sp-label');
  var trackingBand1 = document.getElementById('tracking-band-1');
  var trackingBand2 = document.getElementById('tracking-band-2');
  var colorBleedBar = document.getElementById('color-bleed-bar');
  var ctaScreen = document.getElementById('cta-screen');
  var ctaHandle = document.getElementById('cta-handle');
  var ctaSub = document.getElementById('cta-sub');
  var ctaLine = document.getElementById('cta-line');
  var ctaLocation = document.getElementById('cta-location');

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
  function hideEl(el) { if (el) el.style.display = 'none'; }

  function formatTimecode(t) {
    var h = Math.floor(t / 3600);
    var m = Math.floor((t % 3600) / 60);
    var s = Math.floor(t % 60);
    var f = Math.floor((t % 1) * 30);
    return (h < 10 ? '0' : '') + h + ':' +
           (m < 10 ? '0' : '') + m + ':' +
           (s < 10 ? '0' : '') + s + ':' +
           (f < 10 ? '0' : '') + f;
  }

  // Deterministic pseudo-random
  function seededRand(seed, i) {
    var x = Math.sin(seed * 127.1 + i * 311.7) * 43758.5453;
    return x - Math.floor(x);
  }

  // Show tracking bands at position
  function showTrackingBands(y1) {
    trackingBand1.style.top = (y1 % H) + 'px';
    trackingBand1.style.display = 'block';
    trackingBand2.style.top = ((y1 + 180) % H) + 'px';
    trackingBand2.style.display = 'block';
  }

  function hideTrackingBands() {
    trackingBand1.style.display = 'none';
    trackingBand2.style.display = 'none';
  }

  // Show color bleed bar (VHS artifact)
  function showColorBleed(y) {
    colorBleedBar.style.top = (y % H) + 'px';
    colorBleedBar.style.display = 'block';
  }

  // =============================================
  // __applyUpTo — full state machine
  // =============================================
  window.__applyUpTo = function(t) {
    // Reset all
    hideAllSlides();
    hideEl(recIndicator);
    hideEl(playIndicator);
    hideEl(rewIndicator);
    hideEl(vhsDate);
    hideEl(vhsLocation);
    hideEl(timecode);
    hideEl(spLabel);
    hideEl(ctaScreen);
    hideTrackingBands();
    colorBleedBar.style.display = 'none';
    bgScreen.style.opacity = '1';
    bgScreen.style.background = '#000044';
    staticBurst.style.opacity = '0';
    noSignal.style.display = 'flex';
    ctaHandle.style.opacity = '0';
    ctaSub.style.opacity = '0';
    ctaLine.style.opacity = '0';
    ctaLocation.style.opacity = '0';

    // =============================================
    // 0-0.8s: Blue "NO SIGNAL" screen
    // =============================================
    if (t < 0.8) {
      noSignal.style.display = 'flex';
      bgScreen.style.background = '#000044';
      return;
    }

    // =============================================
    // 0.8-1.2s: Static burst / noise flicker
    // =============================================
    if (t >= 0.8 && t < 1.2) {
      noSignal.style.display = 'flex';
      var flickerVal = Math.abs(Math.sin(t * 80)) * Math.abs(Math.cos(t * 53));
      staticBurst.style.opacity = String(0.9 * flickerVal);
      // Tracking lines scroll through
      showTrackingBands(t * 2000);
      return;
    }

    // =============================================
    // 1.2-1.5s: Tracking adjustment — lines settle
    // =============================================
    if (t >= 1.2 && t < 1.5) {
      noSignal.style.display = 'none';
      bgScreen.style.background = '#000033';
      var settleP = (t - 1.2) / 0.3;
      staticBurst.style.opacity = String(0.4 * (1 - settleP));
      // Tracking bands slow down and disappear
      var bandSpeed = 3000 * (1 - settleP);
      showTrackingBands(t * bandSpeed);
      return;
    }

    // =============================================
    // 1.5-2.5s: REC appears, date, location text
    // =============================================
    noSignal.style.display = 'none';

    if (t >= 1.5) {
      showEl(recIndicator);
      showEl(vhsDate);
      showEl(timecode);
      showEl(spLabel);
      tcText.textContent = formatTimecode(Math.max(0, t - 1.5));
    }

    if (t >= 1.8) {
      showEl(vhsLocation);
    }

    // =============================================
    // 1.5-2.5s: Dark screen with HUD, first photo fades in
    // =============================================
    if (t >= 1.5 && t < 2.5) {
      bgScreen.style.opacity = '1';
      bgScreen.style.background = '#000022';
      // First photo starts fading in at 2.0s
      if (t >= 2.0) {
        var fadeIn = Math.min(1, (t - 2.0) / 0.4);
        bgScreen.style.opacity = String(1 - fadeIn);
        showSlide(0);
      }
      // Show a color bleed bar scrolling
      showColorBleed(t * 600);
      return;
    }

    // =============================================
    // 2.5-10.0s: Photo slideshow with VHS effects
    // 10 photos over 7.5s = 0.75s each
    // =============================================
    if (t >= 2.5 && t < 10.0) {
      bgScreen.style.opacity = '0';
      showEl(recIndicator);
      showEl(vhsDate);
      showEl(vhsLocation);
      showEl(timecode);
      showEl(spLabel);
      tcText.textContent = formatTimecode(t - 1.5);

      var photoTime = t - 2.5;
      var photoDur = 0.75; // seconds per photo
      var photoIndex = Math.floor(photoTime / photoDur);
      photoIndex = Math.min(photoIndex, PHOTO_COUNT - 1);
      showSlide(photoIndex);

      // Tracking distortion at each transition
      var photoLocalT = photoTime % photoDur;
      if (photoLocalT < 0.1 && photoIndex > 0) {
        // Brief static/tracking burst at transition
        var burstFade = Math.sin((photoLocalT / 0.1) * Math.PI);
        staticBurst.style.opacity = String(0.5 * burstFade);
        showTrackingBands(t * 4000);
      }

      // Periodic subtle color bleed bar
      var bleedCycle = Math.sin(t * 3.7);
      if (bleedCycle > 0.7) {
        showColorBleed(t * 400 + 200);
      }

      // Subtle tracking band that scrolls slowly
      if (photoLocalT >= 0.1) {
        var subtleBand = Math.sin(t * 1.3) * 0.5 + 0.5;
        if (subtleBand > 0.85) {
          showTrackingBands(t * 300);
        }
      }
      return;
    }

    // =============================================
    // 10.0-12.0s: Tape rewind effect
    // Fast backward flicker through photos
    // =============================================
    if (t >= 10.0 && t < 12.0) {
      bgScreen.style.opacity = '0';
      hideEl(recIndicator);
      showEl(rewIndicator);
      showEl(timecode);
      showEl(spLabel);

      // Timecode counts backwards fast
      var rewTime = 12.0 - t;
      tcText.textContent = formatTimecode(rewTime * 3);

      // Rapid photo flicker in reverse
      var rewindSpeed = 6; // photos per second
      var rewindElapsed = t - 10.0;
      var rewindIdx = Math.floor((PHOTO_COUNT - 1) - (rewindElapsed * rewindSpeed));
      rewindIdx = ((rewindIdx % PHOTO_COUNT) + PHOTO_COUNT) % PHOTO_COUNT;
      showSlide(rewindIdx);

      // Heavy tracking distortion during rewind
      showTrackingBands(t * 5000);
      staticBurst.style.opacity = String(0.25 * Math.abs(Math.sin(t * 25)));

      // Color bleed prominent
      showColorBleed(t * 800);

      // Flicker the date/location
      if (Math.sin(t * 40) > 0) {
        showEl(vhsDate);
        showEl(vhsLocation);
      }
      return;
    }

    // =============================================
    // 12.0-13.5s: PLAY appears, last best photo fills screen
    // =============================================
    if (t >= 12.0 && t < 13.5) {
      bgScreen.style.opacity = '0';
      hideEl(rewIndicator);
      showEl(playIndicator);
      showEl(vhsDate);
      showEl(vhsLocation);
      showEl(timecode);
      showEl(spLabel);
      tcText.textContent = formatTimecode(t - 1.5);

      // Show the last photo (best shot)
      showSlide(PHOTO_COUNT - 1);

      // Brief static at start of this section
      if (t < 12.3) {
        var playBurst = Math.sin(((t - 12.0) / 0.3) * Math.PI);
        staticBurst.style.opacity = String(0.4 * playBurst);
        showTrackingBands(t * 3000);
      }

      // Subtle color bleed
      showColorBleed(t * 200 + 900);
      return;
    }

    // =============================================
    // 13.5-15.0s: CTA with VHS styling
    // =============================================
    if (t >= 13.5) {
      // Darken background, keep last photo slightly visible
      showSlide(PHOTO_COUNT - 1);
      bgScreen.style.opacity = '0.65';
      bgScreen.style.background = '#000022';

      hideEl(playIndicator);
      showEl(recIndicator);
      showEl(vhsDate);
      showEl(vhsLocation);
      showEl(timecode);
      showEl(spLabel);
      tcText.textContent = formatTimecode(t - 1.5);

      showEl(ctaScreen);
      ctaScreen.style.display = 'flex';

      // Stagger CTA elements in
      var ctaElapsed = t - 13.5;
      if (ctaElapsed >= 0.1) {
        ctaHandle.style.opacity = String(Math.min(1, (ctaElapsed - 0.1) / 0.3));
      }
      if (ctaElapsed >= 0.4) {
        ctaSub.style.opacity = String(Math.min(1, (ctaElapsed - 0.4) / 0.3));
      }
      if (ctaElapsed >= 0.6) {
        ctaLine.style.opacity = String(Math.min(1, (ctaElapsed - 0.6) / 0.3));
      }
      if (ctaElapsed >= 0.8) {
        ctaLocation.style.opacity = String(Math.min(1, (ctaElapsed - 0.8) / 0.3));
      }

      // Subtle tracking line
      showColorBleed(t * 150 + 400);
      return;
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
  console.log('=== VHS Tape Reel v60a-subic ===');
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
  await page.waitForTimeout(500);

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

  var outputMp4 = path.join(OUT_DIR, '60a-vhs-tape-subic.mp4');
  execSync(
    'ffmpeg -y -framerate ' + FPS + ' -i "' + path.join(framesDir, 'frame_%05d.png') + '" ' +
    '-c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r ' + FPS + ' -an "' + outputMp4 + '"',
    { stdio: 'inherit' }
  );

  rmSync(framesDir, { recursive: true, force: true });

  var reelsDir = path.join(__dirname, 'reels');
  if (!existsSync(reelsDir)) mkdirSync(reelsDir, { recursive: true });
  var reelsDest = path.join(reelsDir, '60a-vhs-tape-subic.mp4');
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
