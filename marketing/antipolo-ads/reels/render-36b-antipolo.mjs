import { chromium } from 'playwright';
import { execSync } from 'child_process';
import { mkdirSync, rmSync, existsSync, readFileSync, writeFileSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

var __dirname = path.dirname(fileURLToPath(import.meta.url));
var REPO_ROOT = '/Users/aidantorrence/Documents/aidan-modern';
var IMG_DIR = path.join(REPO_ROOT, 'public/images/large');
var OUT_DIR = path.join(__dirname, 'output-36b-antipolo');
var BTS_CLIP = '/Users/aidantorrence/Pictures/1980/1980-01-01/Untitled.mov';

var W = 1080;
var H = 1920;
var FPS = 30;
var SAFE_TOP = 213;
var SAFE_BOTTOM = 430;

// Film scan source folder
var FILM_SCANS_DIR = '/Volumes/PortableSSD/Exports/film scans';

// Film scan filenames (same as 36a)
var PHOTO_NAMES = [
  'DSC_0898.jpg',
  'DSC_0897.jpg',
  'DSC_0894.jpg',
  'DSC_0893.jpg',
  'DSC_0891.jpg',
  'DSC_0886.jpg',
  'DSC_0885.jpg',
  'DSC_0892.jpg',
  'DSC_0889.jpg',
  'DSC_0890.jpg',
];

// Which photos get the grease pencil circle + zoom (indices into PHOTO_NAMES)
var HERO_INDICES = [0, 2, 5, 7, 9];

/*
  Structure:
  PART 1: Full BTS clip with blur background + sharp foreground + text overlays (same as 36a)
  PART 2 (~9s): Contact Sheet Lightbox concept
    0-0.5s:    Black → lightbox surface fades in
    0.5-2.0s:  Contact sheet thumbnails slide in (3x4 grid)
    2.0-3.5s:  Red grease pencil circle on hero #1, zoom to fill
    3.5-4.5s:  Flash + circle + zoom hero #2
    4.5-5.5s:  Flash + circle + zoom hero #3
    5.5-6.5s:  Flash + circle + zoom hero #4
    6.5-7.5s:  Flash + circle + zoom hero #5
    7.5-9.0s:  Shrink back to contact sheet, arrow + CTA
*/

function resetOutputDir() {
  rmSync(OUT_DIR, { recursive: true, force: true });
  mkdirSync(OUT_DIR, { recursive: true });
}

/* ===== PART 1: BTS clip with overlays (identical to 36a) ===== */
function buildBTSClip() {
  console.log('=== Part 1: BTS clip with overlays ===');

  var btsMp4 = path.join(OUT_DIR, 'tmp_bts.mp4');
  var overlayPng = path.join(OUT_DIR, 'tmp_overlay.png');

  // Step 1: Create text overlay PNG with ImageMagick (transparent background)
  var overlayCmd = 'magick -size ' + W + 'x' + H + ' xc:transparent ' +
    // "BEHIND THE SCENES" at top
    '-gravity North -font "/System/Library/Fonts/Supplemental/Arial Bold.ttf" ' +
    '-fill "rgba(255,255,255,0.9)" -pointsize 52 -annotate +0+260 "BEHIND THE SCENES" ' +
    // "ANTIPOLO FREE PHOTO SHOOT" near bottom
    '-gravity South -fill white -pointsize 72 -strokewidth 3 -stroke "rgba(0,0,0,0.6)" ' +
    '-annotate +0+500 "ANTIPOLO FREE" ' +
    '-annotate +0+420 "PHOTO SHOOT" ' +
    // @madebyaidan
    '-stroke none -fill "rgba(255,255,255,0.6)" -pointsize 36 -annotate +0+370 "@madebyaidan" ' +
    '"' + overlayPng + '"';
  execSync(overlayCmd, { stdio: 'pipe' });
  console.log('Text overlay created');

  // Step 2: BTS clip with blur background + sharp foreground + text overlay
  var filterComplex = [
    // Background: scale up + heavy blur
    '[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,gblur=sigma=40[bg]',
    // Foreground: scale to fit width
    '[0:v]scale=1080:-2[fg]',
    // Composite video
    '[bg][fg]overlay=(W-w)/2:(H-h)/2[comp]',
    // Slight darken for readability
    '[comp]curves=m=0/0 0.5/0.42 1/0.88[dark]',
    // Overlay text PNG
    '[dark][1:v]overlay=0:0:enable=between(t\\,0.5\\,17)[out]',
  ].join(';');

  var cmd = 'ffmpeg -y -i "' + BTS_CLIP + '" -i "' + overlayPng + '" ' +
    '-filter_complex "' + filterComplex + '" ' +
    '-map "[out]" -map 0:a -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r ' + FPS + ' -c:a aac -b:a 128k "' + btsMp4 + '"';

  execSync(cmd, { stdio: 'inherit' });
  console.log('BTS clip done: ' + btsMp4);
  return btsMp4;
}

/* ===== PART 2: Contact Sheet Lightbox ===== */
function buildLightboxHTML(imageDataMap, PROOF_PHOTOS) {
  var html = '<!DOCTYPE html>\n';
  html += '<html>\n<head>\n<meta charset="utf-8">\n<style>\n';
  html += '  * { margin: 0; padding: 0; box-sizing: border-box; }\n';
  html += '  body { width: ' + W + 'px; height: ' + H + 'px; overflow: hidden; background: #000; font-family: "Courier New", monospace; color: white; }\n';

  // Lightbox surface
  html += '  .lightbox {\n';
  html += '    position: absolute; top: 0; left: 0; width: 100%; height: 100%;\n';
  html += '    background: linear-gradient(145deg, #f5f0e8 0%, #e8e0d4 50%, #f0ead8 100%);\n';
  html += '    opacity: 0;\n';
  html += '  }\n';
  html += '  .lightbox-glow {\n';
  html += '    position: absolute; top: 0; left: 0; width: 100%; height: 100%;\n';
  html += '    background: radial-gradient(ellipse at center, rgba(255,248,230,0.5) 0%, rgba(245,240,232,0) 70%);\n';
  html += '    pointer-events: none;\n';
  html += '  }\n';
  html += '  .lightbox-grid {\n';
  html += '    position: absolute; top: 0; left: 0; width: 100%; height: 100%;\n';
  html += '    background-image: linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px);\n';
  html += '    background-size: 40px 40px;\n';
  html += '    pointer-events: none;\n';
  html += '  }\n';

  // Contact sheet container
  var gridTop = SAFE_TOP + 80;
  var gridBottom = SAFE_BOTTOM + 120;
  var gridH = H - gridTop - gridBottom;
  var gridW = W - 80;
  var cellW = Math.floor(gridW / 3);
  var cellH = Math.floor(gridH / 4);
  var thumbPad = 6;

  html += '  .contact-sheet {\n';
  html += '    position: absolute; top: ' + gridTop + 'px; left: 40px;\n';
  html += '    width: ' + gridW + 'px; height: ' + (cellH * 4) + 'px;\n';
  html += '    opacity: 0; transform: translateY(40px);\n';
  html += '  }\n';

  // Film strip dark borders between rows
  html += '  .strip-border {\n';
  html += '    position: absolute; left: 0; width: 100%; height: 8px;\n';
  html += '    background: #2a2a2a;\n';
  html += '  }\n';

  // Thumbnail cell
  html += '  .thumb-cell {\n';
  html += '    position: absolute; overflow: hidden;\n';
  html += '  }\n';
  html += '  .thumb-cell img {\n';
  html += '    width: 100%; height: 100%; object-fit: cover;\n';
  html += '    border: 3px solid white;\n';
  html += '  }\n';
  html += '  .frame-num {\n';
  html += '    position: absolute; bottom: 2px; right: 6px;\n';
  html += '    font-size: 11px; color: rgba(0,0,0,0.45);\n';
  html += '    font-family: "Courier New", monospace;\n';
  html += '  }\n';

  // Grease pencil circle SVG overlay
  html += '  .grease-circle {\n';
  html += '    position: absolute; pointer-events: none; opacity: 0;\n';
  html += '  }\n';

  // Full-screen photo overlay
  html += '  .fullscreen-photo {\n';
  html += '    position: absolute; top: ' + SAFE_TOP + 'px; left: 30px;\n';
  html += '    width: ' + (W - 60) + 'px; height: ' + (H - SAFE_TOP - SAFE_BOTTOM) + 'px;\n';
  html += '    opacity: 0; transform: scale(0.3);\n';
  html += '    border-radius: 8px; overflow: hidden;\n';
  html += '  }\n';
  html += '  .fullscreen-photo img {\n';
  html += '    width: 100%; height: 100%; object-fit: cover;\n';
  html += '  }\n';

  // Flash overlay
  html += '  .flash-overlay {\n';
  html += '    position: absolute; top: 0; left: 0; width: 100%; height: 100%;\n';
  html += '    background: white; opacity: 0; pointer-events: none; z-index: 200;\n';
  html += '  }\n';

  // CTA
  html += '  .cta-container {\n';
  html += '    position: absolute; bottom: ' + (SAFE_BOTTOM + 30) + 'px; left: 0; width: 100%;\n';
  html += '    text-align: center; opacity: 0;\n';
  html += '  }\n';
  html += '  .cta-handle {\n';
  html += '    font-size: 56px; font-weight: 900; color: #E8443A;\n';
  html += '    font-family: -apple-system, system-ui, "Helvetica Neue", sans-serif;\n';
  html += '  }\n';
  html += '  .cta-sub {\n';
  html += '    font-size: 30px; color: rgba(80,60,40,0.6); margin-top: 8px;\n';
  html += '    font-family: -apple-system, system-ui, "Helvetica Neue", sans-serif;\n';
  html += '  }\n';
  html += '  .arrow-svg {\n';
  html += '    position: absolute; opacity: 0; pointer-events: none;\n';
  html += '  }\n';

  html += '</style>\n</head>\n<body>\n\n';

  // Lightbox surface
  html += '  <div class="lightbox" id="lightbox">\n';
  html += '    <div class="lightbox-glow"></div>\n';
  html += '    <div class="lightbox-grid"></div>\n';
  html += '  </div>\n\n';

  // Contact sheet grid
  html += '  <div class="contact-sheet" id="contactSheet">\n';

  // Film strip borders between rows
  for (var row = 1; row < 4; row++) {
    html += '    <div class="strip-border" style="top:' + (row * cellH - 4) + 'px"></div>\n';
  }

  // Thumbnail cells: 3 columns x 4 rows = 12 cells, 10 photos + 2 blank
  for (var i = 0; i < 12; i++) {
    var col = i % 3;
    var row = Math.floor(i / 3);
    var cx = col * cellW + thumbPad;
    var cy = row * cellH + thumbPad;
    var tw = cellW - thumbPad * 2;
    var th = cellH - thumbPad * 2;

    html += '    <div class="thumb-cell" id="thumb' + i + '" style="left:' + cx + 'px;top:' + cy + 'px;width:' + tw + 'px;height:' + th + 'px;">\n';
    if (i < PROOF_PHOTOS.length) {
      html += '      <img src="' + imageDataMap[PROOF_PHOTOS[i]] + '" />\n';
      html += '      <div class="frame-num">36A-' + String(i + 1).padStart(2, '0') + '</div>\n';
    }
    html += '    </div>\n';
  }
  html += '  </div>\n\n';

  // Flash overlay
  html += '  <div class="flash-overlay" id="flash"></div>\n\n';

  // Grease pencil circle SVGs for each hero photo
  for (var hi = 0; hi < HERO_INDICES.length; hi++) {
    var idx = HERO_INDICES[hi];
    var col = idx % 3;
    var row = Math.floor(idx / 3);
    var cx = 40 + col * cellW + cellW / 2;
    var cy = gridTop + row * cellH + cellH / 2;
    var rw = cellW / 2 + 10;
    var rh = cellH / 2 + 10;

    // Hand-drawn wobbly ellipse using bezier curves
    html += '  <svg class="grease-circle" id="circle' + hi + '" style="left:' + (cx - rw - 20) + 'px;top:' + (cy - rh - 20) + 'px;width:' + (rw * 2 + 40) + 'px;height:' + (rh * 2 + 40) + 'px;" viewBox="0 0 ' + (rw * 2 + 40) + ' ' + (rh * 2 + 40) + '">\n';
    // Create wobbly circle path
    var pcx = rw + 20;
    var pcy = rh + 20;
    html += '    <path d="M ' + (pcx - rw) + ' ' + pcy;
    html += ' C ' + (pcx - rw) + ' ' + (pcy - rh * 0.6) + ', ' + (pcx - rw * 0.5) + ' ' + (pcy - rh - 5) + ', ' + pcx + ' ' + (pcy - rh + 3);
    html += ' C ' + (pcx + rw * 0.5) + ' ' + (pcy - rh - 2) + ', ' + (pcx + rw + 4) + ' ' + (pcy - rh * 0.55) + ', ' + (pcx + rw - 2) + ' ' + pcy;
    html += ' C ' + (pcx + rw + 3) + ' ' + (pcy + rh * 0.6) + ', ' + (pcx + rw * 0.4) + ' ' + (pcy + rh + 6) + ', ' + pcx + ' ' + (pcy + rh - 2);
    html += ' C ' + (pcx - rw * 0.45) + ' ' + (pcy + rh + 4) + ', ' + (pcx - rw - 3) + ' ' + (pcy + rh * 0.55) + ', ' + (pcx - rw) + ' ' + pcy;
    html += '" fill="none" stroke="#E8443A" stroke-width="5" stroke-linecap="round" stroke-dasharray="1000" stroke-dashoffset="1000" id="circlePath' + hi + '"/>\n';
    html += '  </svg>\n';
  }

  // Fullscreen photo overlays for each hero
  for (var hi = 0; hi < HERO_INDICES.length; hi++) {
    var idx = HERO_INDICES[hi];
    html += '  <div class="fullscreen-photo" id="fullPhoto' + hi + '">\n';
    html += '    <img src="' + imageDataMap[PROOF_PHOTOS[idx]] + '" />\n';
    html += '  </div>\n';
  }

  // CTA
  html += '  <div class="cta-container" id="cta">\n';
  html += '    <div class="cta-handle">@madebyaidan</div>\n';
  html += '    <div class="cta-sub">DM for a free shoot</div>\n';
  html += '  </div>\n';

  // Hand-drawn arrow SVG pointing to CTA
  html += '  <svg class="arrow-svg" id="ctaArrow" style="left:' + (W / 2 - 60) + 'px;bottom:' + (SAFE_BOTTOM + 140) + 'px;width:120px;height:80px;" viewBox="0 0 120 80">\n';
  html += '    <path d="M 20 10 C 30 5, 50 2, 60 20 C 70 38, 55 50, 60 65" fill="none" stroke="#E8443A" stroke-width="4" stroke-linecap="round"/>\n';
  html += '    <path d="M 48 55 L 60 70 L 68 52" fill="none" stroke="#E8443A" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>\n';
  html += '  </svg>\n';

  // Timeline script
  html += '\n<script>\n';
  html += '  var HERO_COUNT = ' + HERO_INDICES.length + ';\n';
  html += '  var timeline = [\n';

  // 0-0.5s: Black → lightbox fades in
  html += '    [0.0, function() { /* black */ }],\n';
  html += '    [0.1, function() { document.getElementById("lightbox").style.opacity = "1"; }],\n';

  // 0.5-2.0s: Contact sheet slides in
  html += '    [0.5, function() {\n';
  html += '      var cs = document.getElementById("contactSheet");\n';
  html += '      cs.style.opacity = "1";\n';
  html += '      cs.style.transform = "translateY(0)";\n';
  html += '    }],\n';

  // 2.0-3.5s: Hero #0 — circle draw + zoom
  var heroTimes = [
    [2.0, 3.5],
    [3.5, 4.5],
    [4.5, 5.5],
    [5.5, 6.5],
    [6.5, 7.5],
  ];

  for (var hi = 0; hi < HERO_INDICES.length; hi++) {
    var tStart = heroTimes[hi][0];
    var tEnd = heroTimes[hi][1];

    if (hi > 0) {
      // Flash before subsequent heroes
      html += '    [' + (tStart).toFixed(2) + ', function() {\n';
      html += '      document.getElementById("flash").style.opacity = "0.7";\n';
      html += '    }],\n';
      html += '    [' + (tStart + 0.08).toFixed(2) + ', function() {\n';
      html += '      document.getElementById("flash").style.opacity = "0";\n';
      // Hide previous fullscreen photo
      html += '      document.getElementById("fullPhoto' + (hi - 1) + '").style.opacity = "0";\n';
      html += '      document.getElementById("fullPhoto' + (hi - 1) + '").style.transform = "scale(0.3)";\n';
      html += '    }],\n';
    }

    // Show circle
    html += '    [' + (tStart + 0.1).toFixed(2) + ', function() {\n';
    html += '      document.getElementById("circle' + hi + '").style.opacity = "1";\n';
    html += '      document.getElementById("circlePath' + hi + '").style.strokeDashoffset = "0";\n';
    html += '    }],\n';

    // Zoom photo to fullscreen
    var zoomTime = tStart + 0.5;
    if (hi === 0) zoomTime = tStart + 0.8; // first one gets more time
    html += '    [' + zoomTime.toFixed(2) + ', function() {\n';
    html += '      document.getElementById("circle' + hi + '").style.opacity = "0";\n';
    html += '      var fp = document.getElementById("fullPhoto' + hi + '");\n';
    html += '      fp.style.opacity = "1";\n';
    html += '      fp.style.transform = "scale(1)";\n';
    html += '    }],\n';
  }

  // 7.5-9.0s: Shrink back to contact sheet + CTA
  html += '    [7.5, function() {\n';
  // Hide last fullscreen photo
  html += '      document.getElementById("fullPhoto' + (HERO_INDICES.length - 1) + '").style.opacity = "0";\n';
  html += '      document.getElementById("fullPhoto' + (HERO_INDICES.length - 1) + '").style.transform = "scale(0.3)";\n';
  // Make sure contact sheet is visible
  html += '      document.getElementById("contactSheet").style.opacity = "1";\n';
  html += '      document.getElementById("contactSheet").style.transform = "translateY(0)";\n';
  html += '    }],\n';

  // Show CTA
  html += '    [7.8, function() {\n';
  html += '      document.getElementById("cta").style.opacity = "1";\n';
  html += '    }],\n';
  html += '    [8.0, function() {\n';
  html += '      document.getElementById("ctaArrow").style.opacity = "1";\n';
  html += '    }],\n';
  html += '    [9.0, function() { /* end */ }]\n';

  html += '  ];\n\n';

  // Timeline runner
  html += '  window.__applyUpTo = function(t) {\n';
  html += '    for (var i = 0; i < timeline.length; i++) {\n';
  html += '      if (timeline[i][0] <= t) timeline[i][1]();\n';
  html += '    }\n';
  html += '  };\n\n';

  html += '  if (location.search.includes("capture=1")) {\n';
  html += '    var style = document.createElement("style");\n';
  html += '    style.textContent = "*, *::before, *::after { transition-duration: 0s !important; animation-duration: 0s !important; }";\n';
  html += '    document.head.appendChild(style);\n';
  html += '  }\n';

  html += '</script>\n</body>\n</html>';

  return html;
}

async function buildLightboxVideo(imageDataMap, PROOF_PHOTOS) {
  console.log('=== Part 2: Contact Sheet Lightbox ===');

  var framesDir = path.join(OUT_DIR, 'tmp-frames');
  mkdirSync(framesDir, { recursive: true });

  var html = buildLightboxHTML(imageDataMap, PROOF_PHOTOS);
  var htmlPath = path.join(OUT_DIR, 'lightbox.html');
  writeFileSync(htmlPath, html);

  var lightboxDuration = 9.0;
  var totalFrames = Math.ceil(lightboxDuration * FPS);

  var browser = await chromium.launch();
  var page = await browser.newPage({ viewport: { width: W, height: H } });
  await page.goto('file://' + htmlPath + '?capture=1', { waitUntil: 'load' });
  await page.waitForTimeout(500);

  console.log('Capturing ' + totalFrames + ' frames...');

  for (var frame = 0; frame < totalFrames; frame++) {
    var t = frame / FPS;

    await page.evaluate(function(time) {
      // Reset state
      document.getElementById('lightbox').style.opacity = '0';

      var cs = document.getElementById('contactSheet');
      cs.style.opacity = '0';
      cs.style.transform = 'translateY(40px)';

      document.getElementById('flash').style.opacity = '0';

      for (var i = 0; i < 5; i++) {
        var circle = document.getElementById('circle' + i);
        if (circle) {
          circle.style.opacity = '0';
          var cp = document.getElementById('circlePath' + i);
          if (cp) cp.style.strokeDashoffset = '1000';
        }
        var fp = document.getElementById('fullPhoto' + i);
        if (fp) {
          fp.style.opacity = '0';
          fp.style.transform = 'scale(0.3)';
        }
      }

      document.getElementById('cta').style.opacity = '0';
      document.getElementById('ctaArrow').style.opacity = '0';

      window.__applyUpTo(time);
    }, t);

    await page.waitForTimeout(2);

    var padded = String(frame).padStart(5, '0');
    await page.screenshot({
      path: path.join(framesDir, 'frame_' + padded + '.png'),
      type: 'png',
    });

    if (frame % (FPS * 2) === 0) {
      console.log('  ' + t.toFixed(1) + 's / ' + lightboxDuration + 's');
    }
  }

  await browser.close();
  console.log('Frames captured');

  var lightboxMp4 = path.join(OUT_DIR, 'tmp_lightbox.mp4');
  execSync(
    'ffmpeg -y -framerate ' + FPS + ' -i "' + path.join(framesDir, 'frame_%05d.png') + '" -f lavfi -i anullsrc=r=44100:cl=stereo -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r ' + FPS + ' -c:a aac -b:a 128k -shortest "' + lightboxMp4 + '"',
    { stdio: 'inherit' }
  );

  rmSync(framesDir, { recursive: true, force: true });
  console.log('Lightbox clip done: ' + lightboxMp4);
  return lightboxMp4;
}

async function main() {
  console.log('=== Antipolo BTS Lightbox Reel v36b ===');
  resetOutputDir();

  // Process film scans (crop + auto-level, no negate — these are positive images)
  console.log('Processing photos from film scans...');
  var tmpPhotosDir = path.join(OUT_DIR, 'tmp-photos');
  mkdirSync(tmpPhotosDir, { recursive: true });

  var PROOF_PHOTOS = [];
  for (var name of PHOTO_NAMES) {
    var src = path.join(FILM_SCANS_DIR, name);
    if (!existsSync(src)) {
      console.error('Photo not found: ' + src);
      process.exit(1);
    }
    var outFile = path.join(tmpPhotosDir, name.replace('.jpg', '_processed.jpg'));
    execSync('magick "' + src + '" -shave 500x600 +repage -auto-level -quality 95 "' + outFile + '"');
    PROOF_PHOTOS.push(outFile);
    console.log('  Processed: ' + name);
  }

  // Load processed photos as base64
  console.log('Loading photos...');
  var imageDataMap = {};
  for (var p of PROOF_PHOTOS) {
    var buf = readFileSync(p);
    imageDataMap[p] = 'data:image/jpeg;base64,' + buf.toString('base64');
    console.log('  ' + path.basename(p) + ' (' + (buf.length / 1024).toFixed(0) + ' KB)');
  }

  // Build both parts
  var btsMp4 = buildBTSClip();
  var lightboxMp4 = await buildLightboxVideo(imageDataMap, PROOF_PHOTOS);

  // Concat
  console.log('=== Concatenating final video ===');
  var concatTxt = path.join(OUT_DIR, 'tmp_concat.txt');
  writeFileSync(concatTxt, "file 'tmp_bts.mp4'\nfile 'tmp_lightbox.mp4'\n");

  var finalMp4 = path.join(OUT_DIR, 'antipolo-bts-lightbox-v36b.mp4');
  execSync(
    'ffmpeg -y -f concat -safe 0 -i "' + concatTxt + '" -c copy "' + finalMp4 + '"',
    { stdio: 'inherit' }
  );

  // Cleanup temps
  execSync('rm -f "' + OUT_DIR + '/tmp_bts.mp4" "' + OUT_DIR + '/tmp_lightbox.mp4" "' + OUT_DIR + '/tmp_concat.txt"');

  // Copy to reels/
  var reelsDir = path.join(__dirname, 'reels');
  if (!existsSync(reelsDir)) mkdirSync(reelsDir, { recursive: true });
  execSync('cp "' + finalMp4 + '" "' + path.join(reelsDir, 'antipolo-bts-lightbox-v36b.mp4') + '"');

  var sz = statSync(finalMp4);
  console.log('Final: ' + (sz.size / (1024 * 1024)).toFixed(1) + ' MB');
  console.log('Copied to reels/antipolo-bts-lightbox-v36b.mp4');
  console.log('=== Done ===');
}

main().catch(function(err) {
  console.error(err);
  process.exit(1);
});
