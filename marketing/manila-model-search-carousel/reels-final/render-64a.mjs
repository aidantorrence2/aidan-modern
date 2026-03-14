import { chromium } from 'playwright';
import { execSync } from 'child_process';
import { mkdirSync, rmSync, existsSync, readFileSync, writeFileSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

var __dirname = path.dirname(fileURLToPath(import.meta.url));
var OUT_DIR = path.join(__dirname, 'output-64a');

var W = 1080;
var H = 1920;
var FPS = 30;
var TOTAL_FRAMES = 720; // 24s at 30fps
var TOTAL_DURATION = 24;

var FILM_SCANS_DIR = '/Volumes/PortableSSD/Exports/film scans';
var PHOTO_NAMES = [
  'DSC_0064-3.jpg',
  'DSC_0065.jpg',
  'DSC_0066.jpg',
  'DSC_0071.jpg',
  'DSC_0074.jpg',
  'DSC_0075.jpg',
  'DSC_0034-2.jpg',
  'DSC_0035.jpg',
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
  var photoCount = PHOTO_NAMES.length;

  // Build base64 data array as JSON for inline script
  var imgDataJSON = JSON.stringify(PHOTO_NAMES.map(function(name) {
    return imageDataMap[name];
  }));

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { margin: 0; padding: 0; background: #f0f0f0; overflow: hidden; }

  @font-face {
    font-family: 'GallerySerif';
    src: local('Georgia'), local('Times New Roman');
  }

  /* Gallery entrance overlay */
  #entrance-overlay {
    position: absolute;
    inset: 0;
    background: #000;
    z-index: 200;
    pointer-events: none;
  }

  /* Wooden floor strip at bottom */
  #floor {
    position: absolute;
    bottom: 0;
    left: 0;
    width: ${W}px;
    height: 160px;
    background: linear-gradient(180deg, #c8a96e 0%, #a07840 60%, #7a5a28 100%);
    z-index: 2;
    pointer-events: none;
  }
  /* Floor planks texture */
  #floor::after {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      90deg,
      transparent 0px,
      transparent 78px,
      rgba(0,0,0,0.12) 78px,
      rgba(0,0,0,0.12) 80px
    );
  }

  /* Ceiling strip at top */
  #ceiling {
    position: absolute;
    top: 0;
    left: 0;
    width: ${W}px;
    height: 80px;
    background: linear-gradient(180deg, #d0d0d0 0%, #e8e8e8 100%);
    z-index: 2;
    pointer-events: none;
  }

  /* Gallery wall */
  #wall {
    position: absolute;
    top: 80px;
    left: 0;
    width: ${W}px;
    bottom: 160px;
    background: #f0f0f0;
    z-index: 1;
    pointer-events: none;
    overflow: hidden;
  }

  /* Gallery name header */
  #gallery-name {
    position: absolute;
    top: 24px;
    left: 0;
    width: ${W}px;
    text-align: center;
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 22px;
    font-weight: 300;
    letter-spacing: 10px;
    text-transform: uppercase;
    color: #555;
    z-index: 50;
    pointer-events: none;
    opacity: 0;
  }

  /* Photo frame container — absolutely positioned, animates left */
  .frame-wrapper {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10;
    pointer-events: none;
    will-change: left;
  }

  /* The outer dark frame */
  .photo-frame {
    background: #1a1210;
    padding: 8px;
    box-shadow:
      0 0 0 1px #0a0806,
      4px 8px 40px rgba(0,0,0,0.55),
      0 2px 8px rgba(0,0,0,0.3);
  }

  /* White mat */
  .photo-mat {
    background: #fff;
    padding: 30px;
  }

  /* Photo itself */
  .photo-img {
    display: block;
    width: 760px;
    height: 570px;
    object-fit: cover;
  }

  /* Spotlight: radial gradient overlay from top, over the frame */
  .spotlight {
    position: absolute;
    top: -320px;
    left: 50%;
    transform: translateX(-50%);
    width: 900px;
    height: 700px;
    background: radial-gradient(
      ellipse 340px 400px at 50% 0%,
      rgba(255, 245, 210, 0.55) 0%,
      rgba(255, 235, 180, 0.25) 35%,
      transparent 70%
    );
    pointer-events: none;
    z-index: 5;
  }

  /* Brass plaque below frame */
  .plaque {
    margin-top: 16px;
    text-align: center;
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 18px;
    letter-spacing: 4px;
    color: #8a6a30;
    text-transform: uppercase;
  }
  .plaque-title {
    font-size: 13px;
    letter-spacing: 6px;
    color: #aaa;
    margin-top: 4px;
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-weight: 300;
  }

  /* --- Entrance section --- */
  #entrance-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    z-index: 210;
    pointer-events: none;
    opacity: 0;
    width: 900px;
  }
  #entrance-title {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 64px;
    font-weight: 400;
    color: #e8e0d0;
    letter-spacing: 6px;
    line-height: 1.1;
    text-transform: uppercase;
  }
  #entrance-subtitle {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 18px;
    font-weight: 300;
    letter-spacing: 12px;
    color: rgba(232,224,208,0.6);
    text-transform: uppercase;
    margin-top: 20px;
  }

  /* --- Artist Statement section --- */
  #artist-statement {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 10;
    width: 820px;
    opacity: 0;
    pointer-events: none;
  }
  .statement-header {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 13px;
    letter-spacing: 8px;
    color: #888;
    text-transform: uppercase;
    margin-bottom: 28px;
    border-top: 1px solid #ccc;
    padding-top: 16px;
  }
  .statement-title {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 52px;
    font-weight: 400;
    color: #1a1a1a;
    letter-spacing: 2px;
    margin-bottom: 36px;
  }
  .statement-step {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 26px;
    font-weight: 400;
    color: #2a2a2a;
    line-height: 1.6;
    margin-bottom: 18px;
    opacity: 0;
    transform: translateY(8px);
    transition: opacity 0.3s, transform 0.3s;
  }
  .statement-step.visible {
    opacity: 1;
    transform: translateY(0);
  }

  /* --- CTA section --- */
  #cta-section {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 10;
    text-align: center;
    opacity: 0;
    pointer-events: none;
    width: 860px;
  }
  #cta-gold-frame {
    border: 6px solid;
    border-image: linear-gradient(145deg, #c9a84c, #f0d080, #c9a84c, #9a7030) 1;
    padding: 60px 50px;
    background: rgba(255,252,245,0.95);
    box-shadow:
      0 0 0 1px rgba(201,168,76,0.3),
      6px 12px 60px rgba(0,0,0,0.3);
    position: relative;
  }
  /* Corner ornaments */
  #cta-gold-frame::before,
  #cta-gold-frame::after {
    content: '✦';
    position: absolute;
    font-size: 20px;
    color: #c9a84c;
    top: 12px;
  }
  #cta-gold-frame::before { left: 16px; }
  #cta-gold-frame::after { right: 16px; }
  #cta-handle {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 80px;
    font-weight: 400;
    color: #1a1a1a;
    letter-spacing: 2px;
    line-height: 1;
    margin-bottom: 12px;
  }
  #cta-sub {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 22px;
    font-weight: 300;
    letter-spacing: 8px;
    color: #555;
    text-transform: uppercase;
    margin-bottom: 32px;
  }
  #cta-free {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 14px;
    font-weight: 400;
    letter-spacing: 7px;
    color: #8a6a30;
    text-transform: uppercase;
    border-top: 1px solid #ddd;
    padding-top: 20px;
  }
  /* Spotlight behind CTA */
  #cta-spotlight {
    position: absolute;
    top: -400px;
    left: 50%;
    transform: translateX(-50%);
    width: 1000px;
    height: 900px;
    background: radial-gradient(
      ellipse 380px 500px at 50% 0%,
      rgba(255, 248, 220, 0.7) 0%,
      rgba(255, 240, 190, 0.3) 40%,
      transparent 70%
    );
    pointer-events: none;
    z-index: 5;
  }

  /* Dim overlay for transitions */
  #dim-overlay {
    position: absolute;
    inset: 0;
    background: #000;
    z-index: 150;
    pointer-events: none;
    opacity: 0;
  }
</style>
</head>
<body>
  <div id="root" style="width:${W}px;height:${H}px;position:relative;overflow:hidden;background:#f0f0f0;">

    <!-- Entrance overlay (black, fades out) -->
    <div id="entrance-overlay"></div>

    <!-- Dim overlay for transitions -->
    <div id="dim-overlay"></div>

    <!-- Ceiling -->
    <div id="ceiling"></div>

    <!-- Gallery wall -->
    <div id="wall">
      <!-- Subtle wall texture via repeating gradient -->
      <div style="position:absolute;inset:0;background:repeating-linear-gradient(90deg,rgba(0,0,0,0.012) 0px,rgba(0,0,0,0.012) 1px,transparent 1px,transparent 200px);pointer-events:none;"></div>
    </div>

    <!-- Floor -->
    <div id="floor"></div>

    <!-- Gallery name at top -->
    <div id="gallery-name">Manila Gallery</div>

    <!-- Entrance text -->
    <div id="entrance-text">
      <div id="entrance-title">Manila Free<br>Photo Shoot</div>
      <div id="entrance-subtitle">An Exhibition</div>
    </div>

    <!-- Photo frame slots (8 total, only one shown at a time) -->
    ${PHOTO_NAMES.map(function(name, i) {
      return `<div id="frame-${i}" class="frame-wrapper" style="left:${W * 2}px; width: 900px; margin-left: -450px;">
      <div class="spotlight"></div>
      <div class="photo-frame">
        <div class="photo-mat">
          <img class="photo-img" src="" id="photo-img-${i}" />
        </div>
      </div>
      <div class="plaque">${String(i + 1).padStart(2, '0')}&nbsp;&nbsp;/&nbsp;&nbsp;${String(photoCount).padStart(2, '0')}</div>
      <div class="plaque-title">Manila, 2025 &nbsp;&mdash;&nbsp; @madebyaidan</div>
    </div>`;
    }).join('\n    ')}

    <!-- Artist Statement (museum wall text style) -->
    <div id="artist-statement">
      <div class="statement-header">The Process</div>
      <div class="statement-title">The Process</div>
      <div id="step-1" class="statement-step">I.&nbsp;&nbsp; DM the artist on Instagram</div>
      <div id="step-2" class="statement-step">II.&nbsp;&nbsp; Schedule your session</div>
      <div id="step-3" class="statement-step">III.&nbsp; Arrive. Be guided. Leave with art.</div>
    </div>

    <!-- CTA section -->
    <div id="cta-section">
      <div style="position:relative;">
        <div id="cta-spotlight"></div>
        <div id="cta-gold-frame">
          <div id="cta-handle">@madebyaidan</div>
          <div id="cta-sub">DM on Instagram</div>
          <div id="cta-free">Free Admission</div>
        </div>
      </div>
    </div>

  </div>

<script>
  var W = ${W};
  var H = ${H};
  var PHOTO_COUNT = ${photoCount};
  var IMG_DATA = ${imgDataJSON};

  // Inject image sources
  for (var i = 0; i < PHOTO_COUNT; i++) {
    var img = document.getElementById('photo-img-' + i);
    if (img) img.src = IMG_DATA[i];
  }

  // ---- Easing functions ----
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function easeIn(t) { return Math.pow(t, 3); }
  function easeInOut(t) { return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2; }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function lerp(a, b, t) { return a + (b - a) * clamp(t, 0, 1); }
  function progress(t, start, end) { return clamp((t - start) / (end - start), 0, 1); }

  // Frame left positions (as px from left, center = W/2 - frameW/2 = 1080/2 - 900/2 = 90)
  var CENTER_LEFT = 90;    // px: frame centered on screen
  var OFF_RIGHT = W + 100; // frame starts off right edge
  var OFF_LEFT = -1000;    // frame exits off left edge

  // ---- Gallery walk photo timing ----
  // 2-3s: first photo
  // 3-12s: 8 photos, each ~1.2s hold, 0.3s slide in, 0.3s slide out
  // Photo i enter: enterStart[i], hold until exitStart[i], exit ends exitEnd[i]
  // Total 8 photos across 10 seconds (2s–12s)
  // Each photo: 0.4s in, 1.0s hold, 0.4s out
  // But 8 * (0.4 + 1.0 + 0.0) = 11.2s, that's too much.
  // Let overlaps: next enters while current is still centered.
  // Stagger: 1.2s per photo
  // Photo 0: enter 2.0, hold 2.4–3.2, exit 3.2–3.6
  // Photo 1: enter 3.2, etc. — slide in 0.4s, hold ends at start+1.2, exit 0.4s
  var PHOTO_STAGGER = 1.25; // seconds per photo
  var SLIDE_DUR = 0.38;

  function getPhotoTimes(i) {
    var enterStart = 2.0 + i * PHOTO_STAGGER;
    var holdStart  = enterStart + SLIDE_DUR;
    var exitStart  = holdStart + (PHOTO_STAGGER - SLIDE_DUR * 2);
    var exitEnd    = exitStart + SLIDE_DUR;
    return { enterStart: enterStart, holdStart: holdStart, exitStart: exitStart, exitEnd: exitEnd };
  }

  // ---- Main render function ----
  window.__applyUpTo = function(t) {

    // ---- Entrance overlay ----
    var entranceOverlay = document.getElementById('entrance-overlay');
    // 0-0.5s: solid black
    // 0.5-2.0s: lights turn on = fade to transparent (but we show spotlights sequentially)
    if (t < 0.5) {
      entranceOverlay.style.opacity = '1';
    } else if (t < 2.0) {
      var p = progress(t, 0.5, 2.0);
      entranceOverlay.style.opacity = String(1 - easeOut(p));
    } else {
      entranceOverlay.style.opacity = '0';
    }

    // ---- Gallery name ----
    var galleryName = document.getElementById('gallery-name');
    if (t < 0.8) {
      galleryName.style.opacity = '0';
    } else if (t < 1.8) {
      galleryName.style.opacity = String(easeOut(progress(t, 0.8, 1.8)));
    } else if (t > 12.0 && t < 13.0) {
      galleryName.style.opacity = String(1 - easeIn(progress(t, 12.0, 13.0)));
    } else if (t >= 13.0 && t < 18.0) {
      galleryName.style.opacity = '0';
    } else if (t >= 18.0 && t < 18.5) {
      galleryName.style.opacity = String(easeOut(progress(t, 18.0, 18.5)));
    } else if (t >= 18.5) {
      galleryName.style.opacity = '1';
    } else {
      galleryName.style.opacity = '1';
    }

    // ---- Entrance text ----
    var entranceText = document.getElementById('entrance-text');
    if (t < 0.4) {
      entranceText.style.opacity = '0';
    } else if (t < 1.2) {
      entranceText.style.opacity = String(easeOut(progress(t, 0.4, 1.2)));
    } else if (t < 1.8) {
      entranceText.style.opacity = '1';
    } else if (t < 2.5) {
      entranceText.style.opacity = String(1 - easeIn(progress(t, 1.8, 2.5)));
    } else {
      entranceText.style.opacity = '0';
    }

    // ---- Photo frames (gallery walk) ----
    for (var i = 0; i < PHOTO_COUNT; i++) {
      var frame = document.getElementById('frame-' + i);
      if (!frame) continue;
      var pt = getPhotoTimes(i);

      if (t < pt.enterStart) {
        // waiting off-right
        frame.style.left = OFF_RIGHT + 'px';
        frame.style.opacity = '1';
      } else if (t < pt.holdStart) {
        // sliding in from right
        var p2 = easeOut(progress(t, pt.enterStart, pt.holdStart));
        var lx = lerp(OFF_RIGHT, CENTER_LEFT, p2);
        frame.style.left = lx + 'px';
        frame.style.opacity = '1';
      } else if (t < pt.exitStart) {
        // holding center
        frame.style.left = CENTER_LEFT + 'px';
        frame.style.opacity = '1';
      } else if (t < pt.exitEnd) {
        // sliding out to left
        var p3 = easeIn(progress(t, pt.exitStart, pt.exitEnd));
        var lx2 = lerp(CENTER_LEFT, OFF_LEFT, p3);
        frame.style.left = lx2 + 'px';
        frame.style.opacity = '1';
      } else {
        // gone
        frame.style.left = OFF_LEFT + 'px';
        frame.style.opacity = '0';
      }
    }

    // ---- Dim overlay (transitions) ----
    var dimOverlay = document.getElementById('dim-overlay');
    // 12.0 - 13.0s: dim to black
    // 13.0 - 13.5s: reveal artist statement (fade wall back in = dim goes to 0)
    // 17.0 - 18.0s: dim again
    // 18.0 - 18.5s: fade back for CTA
    // 22.0 - 24.0s: dim to black for end
    var dimOpacity = 0;
    if (t >= 12.0 && t < 13.0) {
      dimOpacity = easeInOut(progress(t, 12.0, 12.6));
    } else if (t >= 13.0 && t < 13.5) {
      dimOpacity = lerp(1, 0, easeOut(progress(t, 13.0, 13.5)));
    } else if (t >= 13.5 && t < 17.0) {
      dimOpacity = 0;
    } else if (t >= 17.0 && t < 17.8) {
      dimOpacity = easeInOut(progress(t, 17.0, 17.8));
    } else if (t >= 17.8 && t < 18.5) {
      dimOpacity = lerp(1, 0, easeOut(progress(t, 17.8, 18.5)));
    } else if (t >= 22.0 && t < 24.0) {
      dimOpacity = easeInOut(progress(t, 22.0, 24.0));
    }
    dimOverlay.style.opacity = String(dimOpacity);

    // ---- Artist Statement (13-17s) ----
    var statement = document.getElementById('artist-statement');
    if (t >= 13.5 && t < 17.0) {
      statement.style.opacity = '1';
    } else if (t >= 17.0 && t < 17.8) {
      statement.style.opacity = String(1 - progress(t, 17.0, 17.8));
    } else {
      statement.style.opacity = '0';
    }

    // Individual steps fade in
    var step1 = document.getElementById('step-1');
    var step2 = document.getElementById('step-2');
    var step3 = document.getElementById('step-3');

    function applyStep(el, fadeInTime) {
      if (!el) return;
      if (t >= fadeInTime && t < 17.0) {
        el.style.opacity = String(easeOut(progress(t, fadeInTime, fadeInTime + 0.5)));
        el.style.transform = 'translateY(' + lerp(12, 0, easeOut(progress(t, fadeInTime, fadeInTime + 0.5))) + 'px)';
      } else if (t >= 17.0) {
        el.style.opacity = '0';
      } else {
        el.style.opacity = '0';
        el.style.transform = 'translateY(12px)';
      }
    }
    applyStep(step1, 14.0);
    applyStep(step2, 14.8);
    applyStep(step3, 15.6);

    // ---- CTA Section (18-22s) ----
    var ctaSection = document.getElementById('cta-section');
    if (t >= 18.5 && t < 22.0) {
      ctaSection.style.opacity = String(easeOut(progress(t, 18.5, 19.5)));
    } else if (t >= 22.0) {
      ctaSection.style.opacity = '0';
    } else {
      ctaSection.style.opacity = '0';
    }

    // ---- Wall/floor/ceiling visibility during statement ----
    // During statement (13-17s), wall is visible normally (dim overlay handles darkening).
    // Frames are all off-screen anyway during this time, so nothing extra needed.
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
  console.log('=== Manila Art Gallery Walk Reel v64a ===');
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
  await page.waitForTimeout(600);

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

  var outputMp4 = path.join(OUT_DIR, 'manila-gallery-v64a.mp4');
  execSync(
    'ffmpeg -y -framerate ' + FPS + ' -i "' + path.join(framesDir, 'frame_%05d.png') + '" ' +
    '-c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r ' + FPS + ' -an "' + outputMp4 + '"',
    { stdio: 'inherit' }
  );

  rmSync(framesDir, { recursive: true, force: true });

  var reelsDir = path.join(__dirname, 'reels');
  if (!existsSync(reelsDir)) mkdirSync(reelsDir, { recursive: true });
  execSync('cp "' + outputMp4 + '" "' + path.join(reelsDir, 'manila-gallery-v64a.mp4') + '"');

  var sz = statSync(outputMp4);
  console.log('Final: ' + (sz.size / (1024 * 1024)).toFixed(1) + ' MB');
  console.log('Copied to reels/manila-gallery-v64a.mp4');
  console.log('=== Done ===');
}

main().catch(function(err) {
  console.error(err);
  process.exit(1);
});
