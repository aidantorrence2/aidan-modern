/**
 * Direction Reel Renderer
 *
 * "How I direct first-time models" style reel.
 * Shows progression from early frames to confident frames with
 * split-screen before/after and text callouts.
 *
 * Usage:
 *   node render-direction-reel.mjs --piece <id>
 *
 * Output: output-direction-<id>/  +  reels/direction-<id>.mp4
 */

import { chromium } from 'playwright';
import { execSync } from 'child_process';
import { mkdirSync, rmSync, existsSync, readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

var __dirname = path.dirname(fileURLToPath(import.meta.url));
var IMAGES_DIR = path.join(__dirname, '../../public/images/large');
var W = 1080, H = 1920, FPS = 30;

var pieceId = parseInt(process.argv.find((_, i, a) => a[i - 1] === '--piece') || '3');

var calendarPath = path.join(__dirname, 'content-calendar.ts');
var calendarSrc = readFileSync(calendarPath, 'utf8');

function extractPiece(id) {
  var re = new RegExp(`id:\\s*${id},[\\s\\S]*?\\}`, 'g');
  var block = calendarSrc.match(re);
  if (!block) throw new Error('Piece ' + id + ' not found');
  block = block[0];
  var getField = (name) => {
    var m = block.match(new RegExp(`${name}:\\s*['"]([^'"]*?)['"]`));
    return m ? m[1] : '';
  };
  var getArray = (name) => {
    var m = block.match(new RegExp(`${name}:\\s*\\[([^\\]]+)\\]`));
    if (!m) return [];
    return m[1].match(/'([^']+)'/g).map(s => s.replace(/'/g, ''));
  };
  return {
    id,
    city: getField('city'),
    textOverlay: getField('textOverlay'),
    images: getArray('images'),
    durationSeconds: parseInt(block.match(/durationSeconds:\s*(\d+)/)?.[1] || '15'),
  };
}

var piece = extractPiece(pieceId);
var OUT_DIR = path.join(__dirname, 'output-direction-' + pieceId);
var TOTAL_DURATION = piece.durationSeconds;
var TOTAL_FRAMES = FPS * TOTAL_DURATION;

console.log('Rendering direction reel ' + pieceId + ': ' + piece.city + ' (' + piece.images.length + ' images, ' + TOTAL_DURATION + 's)');

function resetOutputDir() {
  rmSync(OUT_DIR, { recursive: true, force: true });
  mkdirSync(OUT_DIR, { recursive: true });
}

function loadImages() {
  var loaded = {};
  for (var name of piece.images) {
    var src = path.join(IMAGES_DIR, name + '.jpg');
    if (!existsSync(src)) {
      var alt = path.join(IMAGES_DIR, name + '.jpeg');
      if (!existsSync(alt)) { console.error('Not found: ' + src); process.exit(1); }
      src = alt;
    }
    var buf = readFileSync(src);
    loaded[name] = 'data:image/jpeg;base64,' + buf.toString('base64');
    console.log('  Loaded: ' + name + ' (' + (buf.length / 1024).toFixed(0) + ' KB)');
  }
  return loaded;
}

function buildHTML(imageDataMap) {
  var imgs = piece.images;
  var imgArray = imgs.map(name => '"' + imageDataMap[name] + '"').join(',\n    ');
  // Split images into pairs: early (less confident) vs later (confident)
  var halfCount = Math.floor(imgs.length / 2);

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: ${W}px; height: ${H}px; overflow: hidden; background: #0c0c0c; }

  .phase { position: absolute; inset: 0; opacity: 0; transition: opacity 0.5s ease; }
  .phase.active { opacity: 1; }

  .single-photo {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .split-container {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  .split-half {
    flex: 1;
    position: relative;
    overflow: hidden;
  }
  .split-half img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .split-label {
    position: absolute;
    bottom: 20px;
    left: 30px;
    font-family: system-ui, sans-serif;
    font-size: 20px;
    font-weight: 700;
    color: #fff;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    text-shadow: 0 2px 10px rgba(0,0,0,0.8);
    background: rgba(0,0,0,0.4);
    padding: 8px 16px;
    border-radius: 4px;
  }
  .split-divider {
    height: 4px;
    background: #fff;
    position: relative;
    z-index: 2;
  }

  .text-overlay {
    position: absolute;
    bottom: 480px;
    left: 0;
    right: 0;
    text-align: center;
    z-index: 10;
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.6s ease, transform 0.6s ease;
  }
  .text-overlay.visible {
    opacity: 1;
    transform: translateY(0);
  }
  .text-main {
    font-family: Georgia, serif;
    font-size: 40px;
    color: #fff;
    text-shadow: 0 2px 20px rgba(0,0,0,0.8);
    padding: 0 50px;
    line-height: 1.3;
  }
  .text-handle {
    font-family: system-ui, sans-serif;
    font-size: 22px;
    color: rgba(255,255,255,0.7);
    margin-top: 12px;
    letter-spacing: 0.15em;
    text-shadow: 0 1px 10px rgba(0,0,0,0.6);
  }

  .vignette {
    position: absolute;
    inset: 0;
    z-index: 5;
    pointer-events: none;
    background: radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%);
  }
</style>
</head>
<body>
<div id="root" style="width:${W}px;height:${H}px;position:relative;overflow:hidden;">

  <!-- Phase 1: Individual photos cycling -->
  ${imgs.map((_, i) => `
  <div class="phase" id="phase-single-${i}">
    <img class="single-photo" id="single-img-${i}" />
  </div>`).join('')}

  <!-- Phase 2: Split screen comparison -->
  <div class="phase" id="phase-split">
    <div class="split-container">
      <div class="split-half">
        <img id="split-before" />
        <div class="split-label">Session start</div>
      </div>
      <div class="split-divider"></div>
      <div class="split-half">
        <img id="split-after" />
        <div class="split-label">With direction</div>
      </div>
    </div>
  </div>

  <div class="vignette"></div>

  <div class="text-overlay" id="text-overlay">
    <div class="text-main">${piece.textOverlay || 'Fully directed. Zero experience needed.'}</div>
    <div class="text-handle">@aidantorrence</div>
  </div>

</div>
<script>
  var photos = [${imgArray}];
  var halfCount = ${halfCount};
  var totalImages = photos.length;
  var totalDuration = ${TOTAL_DURATION};
  var fps = ${FPS};

  // Load all images
  for (var i = 0; i < photos.length; i++) {
    var el = document.getElementById('single-img-' + i);
    if (el) el.src = photos[i];
  }
  document.getElementById('split-before').src = photos[0];
  document.getElementById('split-after').src = photos[photos.length - 1];

  var currentPhase = -1;

  window.advanceFrame = function(frame) {
    var timeMs = (frame / fps) * 1000;
    var totalMs = totalDuration * 1000;

    // Timeline:
    // 0-70%: cycle through individual photos
    // 70-90%: split screen before/after
    // 90-100%: split screen + text overlay
    var cycleEnd = totalMs * 0.7;
    var splitStart = totalMs * 0.7;
    var textStart = totalMs * 0.85;

    if (timeMs < cycleEnd) {
      // Cycling individual photos
      var msPerPhoto = cycleEnd / totalImages;
      var idx = Math.min(Math.floor(timeMs / msPerPhoto), totalImages - 1);
      if (idx !== currentPhase) {
        // Hide all
        for (var j = 0; j < totalImages; j++) {
          var el = document.getElementById('phase-single-' + j);
          if (el) el.classList.remove('active');
        }
        document.getElementById('phase-split').classList.remove('active');
        // Show current
        var cur = document.getElementById('phase-single-' + idx);
        if (cur) cur.classList.add('active');
        currentPhase = idx;
      }
    } else {
      // Split screen phase
      if (currentPhase !== 999) {
        for (var k = 0; k < totalImages; k++) {
          var el2 = document.getElementById('phase-single-' + k);
          if (el2) el2.classList.remove('active');
        }
        document.getElementById('phase-split').classList.add('active');
        currentPhase = 999;
      }
    }

    // Text overlay
    if (timeMs > textStart) {
      document.getElementById('text-overlay').classList.add('visible');
    }
  };
</script>
</body>
</html>`;
}

async function renderFrames(htmlPath) {
  var browser = await chromium.launch();
  var page = await browser.newPage({ viewport: { width: W, height: H } });
  await page.goto('file://' + htmlPath, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  for (var f = 0; f < TOTAL_FRAMES; f++) {
    await page.evaluate('advanceFrame(' + f + ')');
    await page.waitForTimeout(20);
    var framePath = path.join(OUT_DIR, 'frame-' + String(f).padStart(5, '0') + '.png');
    await page.screenshot({ path: framePath });
    if (f % 30 === 0) console.log('  Frame ' + f + '/' + TOTAL_FRAMES);
  }
  await browser.close();
}

function stitchVideo() {
  var reelsDir = path.join(__dirname, 'reels');
  mkdirSync(reelsDir, { recursive: true });
  var outFile = path.join(reelsDir, 'direction-' + pieceId + '.mp4');
  var cmd = `ffmpeg -y -framerate ${FPS} -i "${OUT_DIR}/frame-%05d.png" -c:v libx264 -pix_fmt yuv420p -preset fast -crf 18 "${outFile}"`;
  console.log('Stitching video...');
  execSync(cmd, { stdio: 'inherit' });
  console.log('Done: ' + outFile);
}

async function main() {
  resetOutputDir();
  var imageData = loadImages();
  var html = buildHTML(imageData);
  var htmlPath = path.join(OUT_DIR, 'render.html');
  writeFileSync(htmlPath, html);
  await renderFrames(htmlPath);
  stitchVideo();
}

main().catch(err => { console.error(err); process.exit(1); });
