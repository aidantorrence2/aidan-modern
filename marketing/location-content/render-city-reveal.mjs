/**
 * City Reveal Reel Renderer
 *
 * Generates a fast-cut slideshow reel with city/film text overlay.
 * Uses images from /public/images/large/ and renders via Playwright.
 *
 * Usage:
 *   node render-city-reveal.mjs --piece <id>
 *
 * Reads from content-calendar.ts, renders matching piece.
 * Output: output-city-<id>/  +  reels/city-<id>.mp4
 */

import { chromium } from 'playwright';
import { execSync } from 'child_process';
import { mkdirSync, rmSync, existsSync, readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

var __dirname = path.dirname(fileURLToPath(import.meta.url));
var IMAGES_DIR = path.join(__dirname, '../../public/images/large');
var W = 1080, H = 1920, FPS = 30;

// Parse --piece arg
var pieceId = parseInt(process.argv.find((_, i, a) => a[i - 1] === '--piece') || '1');

// Load content calendar (simple parse since it's TS with basic types)
var calendarPath = path.join(__dirname, 'content-calendar.ts');
var calendarSrc = readFileSync(calendarPath, 'utf8');

// Extract the piece data via regex (avoids needing ts-node)
function extractPiece(id) {
  var re = new RegExp(`id:\\s*${id},[\\s\\S]*?\\}`, 'g');
  var block = calendarSrc.match(re);
  if (!block) throw new Error('Piece ' + id + ' not found in calendar');
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
    durationSeconds: parseInt(block.match(/durationSeconds:\s*(\d+)/)?.[1] || '12'),
  };
}

var piece = extractPiece(pieceId);
var OUT_DIR = path.join(__dirname, 'output-city-' + pieceId);
var TOTAL_DURATION = piece.durationSeconds;
var TOTAL_FRAMES = FPS * TOTAL_DURATION;

console.log('Rendering piece ' + pieceId + ': ' + piece.city + ' (' + piece.images.length + ' images, ' + TOTAL_DURATION + 's)');

function resetOutputDir() {
  rmSync(OUT_DIR, { recursive: true, force: true });
  mkdirSync(OUT_DIR, { recursive: true });
}

function loadImages() {
  var loaded = {};
  for (var name of piece.images) {
    var src = path.join(IMAGES_DIR, name + '.jpg');
    if (!existsSync(src)) {
      // Try without .jpg extension variations
      var alt = path.join(IMAGES_DIR, name + '.jpeg');
      if (!existsSync(alt)) {
        console.error('Image not found: ' + src);
        process.exit(1);
      }
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
  var msPerImage = (TOTAL_DURATION * 1000) / numImages;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: ${W}px; height: ${H}px; overflow: hidden; background: #0c0c0c; }

  .photo {
    position: absolute;
    inset: 0;
    opacity: 0;
    transition: opacity 0.4s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .photo.active { opacity: 1; }
  .photo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .overlay {
    position: absolute;
    bottom: 500px;
    left: 0;
    right: 0;
    text-align: center;
    z-index: 10;
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.6s ease, transform 0.6s ease;
  }
  .overlay.visible {
    opacity: 1;
    transform: translateY(0);
  }
  .overlay-text {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 42px;
    color: #fff;
    text-shadow: 0 2px 20px rgba(0,0,0,0.8), 0 0 40px rgba(0,0,0,0.5);
    letter-spacing: 0.02em;
    line-height: 1.3;
    padding: 0 60px;
  }
  .overlay-sub {
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 22px;
    color: rgba(255,255,255,0.7);
    margin-top: 12px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    text-shadow: 0 1px 10px rgba(0,0,0,0.6);
  }

  .city-tag {
    position: absolute;
    top: 280px;
    left: 0;
    right: 0;
    text-align: center;
    z-index: 10;
    opacity: 0;
    transition: opacity 0.5s ease;
  }
  .city-tag.visible { opacity: 1; }
  .city-tag span {
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 18px;
    color: rgba(255,255,255,0.6);
    letter-spacing: 0.25em;
    text-transform: uppercase;
    text-shadow: 0 1px 8px rgba(0,0,0,0.6);
  }

  .vignette {
    position: absolute;
    inset: 0;
    z-index: 5;
    pointer-events: none;
    background: radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%);
  }

  .grain {
    position: absolute;
    inset: 0;
    z-index: 6;
    pointer-events: none;
    opacity: 0.06;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    background-size: 256px 256px;
  }
</style>
</head>
<body>
<div id="root" style="width:${W}px;height:${H}px;position:relative;overflow:hidden;">

  ${piece.images.map((_, i) => `<div class="photo" id="photo-${i}"><img id="img-${i}" /></div>`).join('\n  ')}

  <div class="vignette"></div>
  <div class="grain"></div>

  <div class="city-tag" id="city-tag">
    <span>${piece.city.toUpperCase()}</span>
  </div>

  <div class="overlay" id="overlay">
    <div class="overlay-text">${piece.textOverlay || 'Shot on 35mm film in ' + piece.city}</div>
    <div class="overlay-sub">@aidantorrence</div>
  </div>

</div>
<script>
  var photos = [${imgArray}];
  var currentIndex = 0;
  var msPerImage = ${msPerImage};
  var totalImages = ${numImages};

  // Load images
  for (var i = 0; i < photos.length; i++) {
    document.getElementById('img-' + i).src = photos[i];
  }

  // Show first image immediately
  document.getElementById('photo-0').classList.add('active');

  // Animation state
  window.__currentFrame = 0;

  window.advanceFrame = function(frame) {
    window.__currentFrame = frame;
    var timeMs = (frame / ${FPS}) * 1000;
    var idx = Math.min(Math.floor(timeMs / msPerImage), totalImages - 1);

    if (idx !== currentIndex) {
      document.getElementById('photo-' + currentIndex).classList.remove('active');
      document.getElementById('photo-' + idx).classList.add('active');
      currentIndex = idx;
    }

    // Show city tag after 0.5s
    if (timeMs > 500) {
      document.getElementById('city-tag').classList.add('visible');
    }

    // Show main overlay in last 40% of duration
    if (timeMs > ${TOTAL_DURATION * 600}) {
      document.getElementById('overlay').classList.add('visible');
    }
  };
</script>
</body>
</html>`;
}

async function renderFrames(htmlPath) {
  var browser = await chromium.launch({ executablePath: '/root/.cache/ms-playwright/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
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
  var outFile = path.join(reelsDir, 'city-' + pieceId + '.mp4');
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
  console.log('HTML written to ' + htmlPath);
  await renderFrames(htmlPath);
  stitchVideo();
}

main().catch(err => { console.error(err); process.exit(1); });
