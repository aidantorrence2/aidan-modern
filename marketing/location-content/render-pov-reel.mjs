/**
 * POV Reel Renderer
 *
 * "POV: you booked a film shoot in [City]" style reel.
 * Cinematic reveal of photos with typed text effect and smooth transitions.
 *
 * Usage:
 *   node render-pov-reel.mjs --piece <id>
 *
 * Output: output-pov-<id>/  +  reels/pov-<id>.mp4
 */

import { chromium } from 'playwright';
import { execSync } from 'child_process';
import { mkdirSync, rmSync, existsSync, readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

var __dirname = path.dirname(fileURLToPath(import.meta.url));
var IMAGES_DIR = path.join(__dirname, '../../public/images/large');
var W = 1080, H = 1920, FPS = 30;

var pieceId = parseInt(process.argv.find((_, i, a) => a[i - 1] === '--piece') || '5');

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
    durationSeconds: parseInt(block.match(/durationSeconds:\s*(\d+)/)?.[1] || '14'),
  };
}

var piece = extractPiece(pieceId);
var OUT_DIR = path.join(__dirname, 'output-pov-' + pieceId);
var TOTAL_DURATION = piece.durationSeconds;
var TOTAL_FRAMES = FPS * TOTAL_DURATION;

console.log('Rendering POV reel ' + pieceId + ': ' + piece.city + ' (' + piece.images.length + ' images, ' + TOTAL_DURATION + 's)');

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
  var imgArray = piece.images.map(name => '"' + imageDataMap[name] + '"').join(',\n    ');
  var numImages = piece.images.length;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: ${W}px; height: ${H}px; overflow: hidden; background: #0c0c0c; font-family: system-ui, -apple-system, sans-serif; }

  .photo-container {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transform: scale(1.05);
    transition: opacity 0.5s ease, transform 0.8s ease;
  }
  .photo-container.active {
    opacity: 1;
    transform: scale(1);
  }
  .photo-container img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  /* POV text intro screen */
  .pov-intro {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #0c0c0c;
    z-index: 20;
    opacity: 1;
    transition: opacity 0.5s ease;
  }
  .pov-intro.hidden { opacity: 0; pointer-events: none; }

  .pov-text {
    font-size: 48px;
    font-weight: 300;
    color: #fff;
    text-align: center;
    padding: 0 60px;
    line-height: 1.4;
    letter-spacing: -0.01em;
  }
  .pov-text .city-name {
    font-family: Georgia, serif;
    font-weight: 400;
    font-style: italic;
  }
  .pov-cursor {
    display: inline-block;
    width: 3px;
    height: 48px;
    background: #fff;
    margin-left: 4px;
    vertical-align: middle;
    animation: blink 0.8s infinite;
  }
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  .handle-tag {
    position: absolute;
    bottom: 480px;
    left: 0;
    right: 0;
    text-align: center;
    z-index: 15;
    opacity: 0;
    transition: opacity 0.5s ease;
  }
  .handle-tag.visible { opacity: 1; }
  .handle-tag span {
    font-size: 20px;
    color: rgba(255,255,255,0.7);
    letter-spacing: 0.15em;
    text-shadow: 0 1px 8px rgba(0,0,0,0.6);
  }

  .vignette {
    position: absolute;
    inset: 0;
    z-index: 8;
    pointer-events: none;
    background: radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.35) 100%);
  }
</style>
</head>
<body>
<div id="root" style="width:${W}px;height:${H}px;position:relative;overflow:hidden;">

  <div class="pov-intro" id="pov-intro">
    <div class="pov-text" id="pov-typed"></div>
  </div>

  ${piece.images.map((_, i) => `
  <div class="photo-container" id="photo-${i}">
    <img id="img-${i}" />
  </div>`).join('')}

  <div class="vignette"></div>

  <div class="handle-tag" id="handle-tag">
    <span>@aidantorrence</span>
  </div>

</div>
<script>
  var photos = [${imgArray}];
  var numImages = ${numImages};
  var totalDuration = ${TOTAL_DURATION};
  var fps = ${FPS};
  var fullText = "${piece.textOverlay || 'POV: you booked a film shoot in ' + piece.city}";

  // Load images
  for (var i = 0; i < photos.length; i++) {
    document.getElementById('img-' + i).src = photos[i];
  }

  var currentPhoto = -1;
  var lastTypedLen = 0;

  window.advanceFrame = function(frame) {
    var timeMs = (frame / fps) * 1000;
    var totalMs = totalDuration * 1000;

    // Timeline:
    // 0-25%: POV text typing animation on black screen
    // 25-95%: Photo slideshow
    // 80-100%: Handle tag visible
    var typingEnd = totalMs * 0.25;
    var photosStart = totalMs * 0.25;
    var photosEnd = totalMs * 0.95;
    var handleStart = totalMs * 0.8;

    // Typing phase
    if (timeMs < typingEnd) {
      var progress = timeMs / typingEnd;
      var charsToShow = Math.floor(progress * fullText.length);
      if (charsToShow !== lastTypedLen) {
        var displayed = fullText.substring(0, charsToShow);
        document.getElementById('pov-typed').innerHTML = displayed + '<span class="pov-cursor"></span>';
        lastTypedLen = charsToShow;
      }
    } else {
      // Show full text briefly then hide
      if (lastTypedLen < fullText.length) {
        document.getElementById('pov-typed').innerHTML = fullText;
        lastTypedLen = fullText.length;
      }
      // Fade out intro after typing done
      if (timeMs > typingEnd + 500) {
        document.getElementById('pov-intro').classList.add('hidden');
      }
    }

    // Photo slideshow phase
    if (timeMs >= photosStart && timeMs < photosEnd) {
      var photoTime = timeMs - photosStart;
      var photoDuration = (photosEnd - photosStart);
      var msPerPhoto = photoDuration / numImages;
      var idx = Math.min(Math.floor(photoTime / msPerPhoto), numImages - 1);

      if (idx !== currentPhoto) {
        if (currentPhoto >= 0) {
          document.getElementById('photo-' + currentPhoto).classList.remove('active');
        }
        document.getElementById('photo-' + idx).classList.add('active');
        currentPhoto = idx;
      }
    }

    // Handle tag
    if (timeMs > handleStart) {
      document.getElementById('handle-tag').classList.add('visible');
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
  var outFile = path.join(reelsDir, 'pov-' + pieceId + '.mp4');
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
