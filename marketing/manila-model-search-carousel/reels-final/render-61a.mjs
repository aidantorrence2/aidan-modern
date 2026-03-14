import { chromium } from 'playwright';
import { execSync } from 'child_process';
import { mkdirSync, rmSync, existsSync, readFileSync, writeFileSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

var __dirname = path.dirname(fileURLToPath(import.meta.url));
var OUT_DIR = path.join(__dirname, 'output-61a');

var W = 1080;
var H = 1920;
var FPS = 30;
var TOTAL_DURATION = 14;
var TOTAL_FRAMES = FPS * TOTAL_DURATION; // 420 frames

var SAFE_TOP = 213;
var SAFE_BOTTOM = 430;

var FILM_SCANS_DIR = '/Volumes/PortableSSD/Exports/film scans';
var PHOTO_NAMES = [
  'DSC_0149.jpg',
  'DSC_0150.jpg',
  'DSC_0151.jpg',
  'DSC_0153.jpg',
  'DSC_0154.jpg',
  'DSC_0157.jpg',
  'DSC_0161.jpg',
  'DSC_0162.jpg',
  'DSC_0163.jpg',
  'DSC_0164.jpg',
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
  var imgDataJSON = JSON.stringify(PHOTO_NAMES.map(function(name) {
    return imageDataMap[name];
  }));

  // Polaroid layout: 10 polaroids on a cork board
  // Positions chosen to fill the frame with some overlap, each at a slight angle
  // Format: { x, y, rot, dropTime } — x/y is top-left of the polaroid frame
  var polaroids = [
    { x: 40,   y: 300,  rot: -7,   dropTime: 1.0 },
    { x: 390,  y: 260,  rot: 5,    dropTime: 1.8 },
    { x: 720,  y: 320,  rot: -4,   dropTime: 2.6 },
    { x: 120,  y: 640,  rot: 6,    dropTime: 3.4 },
    { x: 480,  y: 600,  rot: -8,   dropTime: 4.2 },
    { x: 30,   y: 960,  rot: 3,    dropTime: 5.0 },
    { x: 380,  y: 940,  rot: -5,   dropTime: 5.8 },
    { x: 700,  y: 640,  rot: 4,    dropTime: 6.6 },
    { x: 200,  y: 1260, rot: -6,   dropTime: 7.4 },
    { x: 570,  y: 1220, rot: 7,    dropTime: 8.2 },
  ];

  var pinColors = ['#E53935', '#1E88E5', '#43A047', '#FB8C00', '#8E24AA',
                   '#E53935', '#43A047', '#1E88E5', '#FB8C00', '#8E24AA'];

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { margin: 0; padding: 0; background: #8B6F47; overflow: hidden; }

  #root {
    width: ${W}px;
    height: ${H}px;
    position: relative;
    overflow: hidden;
    font-family: 'Caveat', cursive, sans-serif;
  }

  /* Cork board background */
  #cork-bg {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse at 20% 30%, rgba(160,120,60,0.3) 0%, transparent 60%),
      radial-gradient(ellipse at 80% 70%, rgba(120,80,30,0.3) 0%, transparent 60%),
      linear-gradient(135deg, #A0845C 0%, #8B6F47 25%, #9C7E52 50%, #85693F 75%, #97764A 100%);
    opacity: 0;
    z-index: 0;
  }

  /* Cork texture dots */
  #cork-texture {
    position: absolute;
    inset: 0;
    background-image:
      radial-gradient(circle at 15% 25%, rgba(0,0,0,0.06) 1px, transparent 1px),
      radial-gradient(circle at 45% 65%, rgba(0,0,0,0.04) 1px, transparent 1px),
      radial-gradient(circle at 75% 35%, rgba(0,0,0,0.05) 1px, transparent 1px),
      radial-gradient(circle at 85% 85%, rgba(0,0,0,0.04) 1px, transparent 1px),
      radial-gradient(circle at 35% 95%, rgba(0,0,0,0.06) 1px, transparent 1px);
    background-size: 12px 12px, 18px 18px, 15px 15px, 20px 20px, 10px 10px;
    opacity: 0;
    z-index: 1;
    pointer-events: none;
  }

  /* Vignette */
  #vignette {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.3) 100%);
    z-index: 2;
    pointer-events: none;
    opacity: 0;
  }

  /* Header text */
  #header-text {
    position: absolute;
    top: ${SAFE_TOP + 15}px;
    left: 0;
    width: ${W}px;
    text-align: center;
    z-index: 50;
    opacity: 0;
    pointer-events: none;
  }
  #header-text h1 {
    font-family: 'Caveat', cursive;
    font-size: 68px;
    font-weight: 700;
    color: #fff;
    text-shadow: 2px 3px 10px rgba(0,0,0,0.6);
    letter-spacing: 6px;
  }

  /* Zoom container for board content */
  #board-zoom {
    position: absolute;
    top: 0; left: 0;
    width: ${W}px;
    height: ${H}px;
    transform-origin: center center;
    z-index: 10;
  }

  /* Polaroid frame */
  .polaroid {
    position: absolute;
    width: 300px;
    background: #fff;
    padding: 14px 14px 52px 14px;
    box-shadow: 0 6px 30px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.2);
    z-index: 20;
    opacity: 0;
    transform-origin: center top;
  }
  .polaroid-photo {
    width: 272px;
    height: 272px;
    overflow: hidden;
    position: relative;
    background: #e8e4d8;
  }
  .polaroid-photo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  /* White developing overlay */
  .polaroid-developing {
    position: absolute;
    inset: 0;
    background: #e8e4d8;
    z-index: 5;
    opacity: 1;
  }

  /* Thumbtack */
  .thumbtack {
    position: absolute;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    z-index: 30;
    opacity: 0;
    box-shadow: 0 2px 6px rgba(0,0,0,0.45), inset 0 -2px 3px rgba(0,0,0,0.2), inset 0 2px 3px rgba(255,255,255,0.35);
    transform: translate(-11px, -11px);
  }
  .thumbtack::after {
    content: '';
    position: absolute;
    top: 4px;
    left: 6px;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: rgba(255,255,255,0.4);
  }

  /* "Free photo shoot" handwritten text overlay */
  #free-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 60;
    opacity: 0;
    pointer-events: none;
  }
  #free-text h2 {
    font-family: 'Caveat', cursive;
    font-size: 82px;
    font-weight: 700;
    color: #fff;
    text-shadow: 3px 4px 14px rgba(0,0,0,0.7), 0 0 40px rgba(0,0,0,0.3);
    text-align: center;
    line-height: 1.15;
  }

  /* CTA card (polaroid style) */
  #cta-card {
    position: absolute;
    bottom: ${SAFE_BOTTOM + 60}px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 60;
    opacity: 0;
    pointer-events: none;
  }
  #cta-inner {
    background: #fff;
    padding: 18px 18px 58px 18px;
    box-shadow: 0 10px 50px rgba(0,0,0,0.5);
    text-align: center;
    width: 520px;
  }
  #cta-photo-strip {
    width: 484px;
    height: 180px;
    background: linear-gradient(135deg, #A0845C, #8B6F47);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  #cta-photo-strip span {
    font-family: 'Caveat', cursive;
    font-size: 38px;
    color: #fff;
    text-shadow: 1px 2px 6px rgba(0,0,0,0.4);
  }
  #cta-handle {
    font-family: 'Caveat', cursive;
    font-size: 54px;
    font-weight: 700;
    color: #333;
    margin-top: 10px;
  }
  #cta-dm {
    font-family: 'Caveat', cursive;
    font-size: 38px;
    color: #E53935;
    margin-top: 4px;
  }
</style>
</head>
<body>
<div id="root">

  <div id="cork-bg"></div>
  <div id="cork-texture"></div>
  <div id="vignette"></div>

  <!-- Zoom container for all board elements -->
  <div id="board-zoom">

    <!-- Polaroids -->
    ${polaroids.map(function(p, i) {
      return '<div id="polaroid-' + i + '" class="polaroid" style="left:' + p.x + 'px;top:' + p.y + 'px;transform:rotate(' + p.rot + 'deg);">' +
        '<div class="polaroid-photo">' +
          '<img id="pimg-' + i + '" src="" alt="Photo ' + (i+1) + '"/>' +
          '<div id="pdev-' + i + '" class="polaroid-developing"></div>' +
        '</div>' +
      '</div>';
    }).join('\\n    ')}

    <!-- Thumbtacks (positioned at top-center of each polaroid) -->
    ${polaroids.map(function(p, i) {
      var pinX = p.x + 150;
      var pinY = p.y + 2;
      return '<div id="pin-' + i + '" class="thumbtack" style="left:' + pinX + 'px;top:' + pinY + 'px;background:' + pinColors[i] + ';"></div>';
    }).join('\\n    ')}

  </div>

  <!-- Header -->
  <div id="header-text">
    <h1>MANILA 2026</h1>
  </div>

  <!-- Free photo shoot overlay -->
  <div id="free-text">
    <h2>Free photo<br/>shoot</h2>
  </div>

  <!-- CTA card -->
  <div id="cta-card">
    <div id="cta-inner">
      <div id="cta-photo-strip">
        <span>Your photo here</span>
      </div>
      <div id="cta-handle">@madebyaidan</div>
      <div id="cta-dm">DM me</div>
    </div>
  </div>

</div>

<script>
  var W = ${W};
  var H = ${H};
  var PHOTO_COUNT = ${photoCount};
  var IMG_DATA = ${imgDataJSON};
  var polaroids = ${JSON.stringify(polaroids)};

  // Inject images
  for (var i = 0; i < PHOTO_COUNT; i++) {
    var img = document.getElementById('pimg-' + i);
    if (img) img.src = IMG_DATA[i];
  }

  // ---- Easing ----
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function lerp(a, b, t) { return a + (b - a) * clamp(t, 0, 1); }
  function prog(t, start, end) { return clamp((t - start) / (end - start), 0, 1); }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function easeIn(t) { return Math.pow(t, 3); }
  function easeInOut(t) { return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2; }

  function easeOutBounce(t) {
    if (t < 1 / 2.75) return 7.5625 * t * t;
    if (t < 2 / 2.75) { t -= 1.5 / 2.75; return 7.5625 * t * t + 0.75; }
    if (t < 2.5 / 2.75) { t -= 2.25 / 2.75; return 7.5625 * t * t + 0.9375; }
    t -= 2.625 / 2.75; return 7.5625 * t * t + 0.984375;
  }

  // ---- Timeline ----
  // 0-1s: Cork board fades in, header appears
  // 1-9s: Polaroids drop in one at a time (~0.8s each), develop over 1.5s
  // 9-11s: Zoom out to show all
  // 11-12s: "Free photo shoot" text
  // 12-14s: CTA card

  window.__applyUpTo = function(t) {

    // ---- Cork board & vignette (0-1s) ----
    var boardFade = easeOut(prog(t, 0, 1.0));
    document.getElementById('cork-bg').style.opacity = String(boardFade);
    document.getElementById('cork-texture').style.opacity = String(boardFade);
    document.getElementById('vignette').style.opacity = String(boardFade);

    // ---- Header (0.3-1s in, fades out 9-9.5s) ----
    var headerEl = document.getElementById('header-text');
    if (t < 0.3) {
      headerEl.style.opacity = '0';
    } else if (t < 1.0) {
      headerEl.style.opacity = String(easeOut(prog(t, 0.3, 1.0)));
    } else if (t < 9.0) {
      headerEl.style.opacity = '1';
    } else if (t < 9.5) {
      headerEl.style.opacity = String(1 - easeIn(prog(t, 9.0, 9.5)));
    } else {
      headerEl.style.opacity = '0';
    }

    // ---- Polaroids (1-9s) ----
    for (var i = 0; i < polaroids.length; i++) {
      var p = polaroids[i];
      var pol = document.getElementById('polaroid-' + i);
      var dev = document.getElementById('pdev-' + i);
      var pin = document.getElementById('pin-' + i);
      if (!pol || !dev || !pin) continue;

      var dropStart = p.dropTime;
      var dropDur = 0.45;
      var dropEnd = dropStart + dropDur;
      var devStart = dropStart + 0.25;
      var devEnd = devStart + 1.5;

      if (t < dropStart) {
        pol.style.opacity = '0';
        pol.style.transform = 'rotate(' + p.rot + 'deg) translateY(-150px)';
        pin.style.opacity = '0';
        dev.style.opacity = '1';
      } else if (t < dropEnd) {
        var dp = prog(t, dropStart, dropEnd);
        var bounced = easeOutBounce(dp);
        pol.style.opacity = String(easeOut(dp));
        var yOff = lerp(-150, 0, bounced);
        pol.style.transform = 'rotate(' + p.rot + 'deg) translateY(' + yOff + 'px)';
        pin.style.opacity = String(easeOut(prog(t, dropStart + 0.25, dropEnd)));
        dev.style.opacity = '1';
      } else {
        pol.style.opacity = '1';
        pol.style.transform = 'rotate(' + p.rot + 'deg) translateY(0px)';
        pin.style.opacity = '1';

        // Developing: overlay fades out
        if (t < devEnd) {
          var devP = easeInOut(prog(t, devStart, devEnd));
          dev.style.opacity = String(1 - devP);
        } else {
          dev.style.opacity = '0';
        }
      }
    }

    // ---- Zoom out (9-11s) ----
    var boardZoom = document.getElementById('board-zoom');
    if (t < 9.0) {
      boardZoom.style.transform = 'scale(1) translate(0px, 0px)';
    } else if (t < 11.0) {
      var zp = easeInOut(prog(t, 9.0, 11.0));
      var sc = lerp(1.0, 0.78, zp);
      var ty = lerp(0, 50, zp);
      boardZoom.style.transform = 'scale(' + sc + ') translate(0px, ' + ty + 'px)';
    } else {
      boardZoom.style.transform = 'scale(0.78) translate(0px, 50px)';
    }

    // ---- Dim board for overlays (11+) ----
    if (t >= 10.5) {
      var dimP = easeOut(prog(t, 10.5, 11.5));
      boardZoom.style.opacity = String(lerp(1.0, 0.3, dimP));
    } else {
      boardZoom.style.opacity = '1';
    }

    // ---- "Free photo shoot" (11-12s) ----
    var freeEl = document.getElementById('free-text');
    if (t < 11.0) {
      freeEl.style.opacity = '0';
      freeEl.style.transform = 'translate(-50%, -50%) scale(0.8)';
    } else if (t < 11.5) {
      var fp = easeOut(prog(t, 11.0, 11.5));
      freeEl.style.opacity = String(fp);
      freeEl.style.transform = 'translate(-50%, -50%) scale(' + lerp(0.8, 1, fp) + ')';
    } else if (t < 12.0) {
      freeEl.style.opacity = '1';
      freeEl.style.transform = 'translate(-50%, -50%) scale(1)';
    } else if (t < 12.3) {
      var fout = easeIn(prog(t, 12.0, 12.3));
      freeEl.style.opacity = String(1 - fout);
      freeEl.style.transform = 'translate(-50%, -50%) scale(' + lerp(1, 1.1, fout) + ')';
    } else {
      freeEl.style.opacity = '0';
    }

    // ---- CTA card (12-14s) ----
    var ctaEl = document.getElementById('cta-card');
    if (t < 12.0) {
      ctaEl.style.opacity = '0';
      ctaEl.style.transform = 'translateX(-50%) translateY(50px)';
    } else if (t < 12.8) {
      var cp = easeOut(prog(t, 12.0, 12.8));
      ctaEl.style.opacity = String(cp);
      ctaEl.style.transform = 'translateX(-50%) translateY(' + lerp(50, 0, cp) + 'px)';
    } else {
      ctaEl.style.opacity = '1';
      ctaEl.style.transform = 'translateX(-50%) translateY(0px)';
    }

  };

  if (location.search.includes('capture=1')) {
    var s = document.createElement('style');
    s.textContent = '*, *::before, *::after { transition-duration: 0s !important; animation-duration: 0.001s !important; }';
    document.head.appendChild(s);
  }
</script>
</body>
</html>`;
}

async function main() {
  console.log('=== Polaroid Developing Reel v61a ===');
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
    if (frame % (FPS * 2) === 0) {
      console.log('  ' + t.toFixed(1) + 's / ' + TOTAL_DURATION + 's');
    }
  }

  await browser.close();
  console.log('All frames captured');

  var outputMp4 = path.join(OUT_DIR, '61a-polaroid-developing.mp4');
  execSync(
    'ffmpeg -y -framerate ' + FPS + ' -i "' + path.join(framesDir, 'frame_%05d.png') + '" ' +
    '-c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r ' + FPS + ' -an "' + outputMp4 + '"',
    { stdio: 'inherit' }
  );

  rmSync(framesDir, { recursive: true, force: true });

  var reelsDir = path.join(__dirname, 'reels');
  if (!existsSync(reelsDir)) mkdirSync(reelsDir, { recursive: true });
  execSync('cp "' + outputMp4 + '" "' + path.join(reelsDir, '61a-polaroid-developing.mp4') + '"');

  var sz = statSync(outputMp4);
  console.log('Final: ' + (sz.size / (1024 * 1024)).toFixed(1) + ' MB');
  console.log('Copied to reels/61a-polaroid-developing.mp4');
  console.log('=== Done ===');
}

main().catch(function(err) {
  console.error(err);
  process.exit(1);
});
