import { chromium } from 'playwright';
import { execSync } from 'child_process';
import { mkdirSync, rmSync, existsSync, readFileSync, writeFileSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

var __dirname = path.dirname(fileURLToPath(import.meta.url));
var OUT_DIR = path.join(__dirname, 'output-38a');

var W = 1080;
var H = 1920;
var FPS = 30;

// Pre-processed photos (cropped film borders)
var PHOTO_FILES = [
  '/tmp/reel-38a-photos/DSC_0943_cropped.jpg',
  '/tmp/reel-38a-photos/DSC_0945_cropped.jpg',
  '/tmp/reel-38a-photos/DSC_0951_cropped.jpg',
  '/tmp/reel-38a-photos/DSC_0956_cropped.jpg',
  '/tmp/reel-38a-photos/DSC_0957_cropped.jpg',
  '/tmp/reel-38a-photos/DSC_0960_cropped.jpg',
  '/tmp/reel-38a-photos/DSC_0964_cropped.jpg',
  '/tmp/reel-38a-photos/DSC_0978_cropped.jpg',
  '/tmp/reel-38a-photos/DSC_0979_cropped.jpg',
  '/tmp/reel-38a-photos/DSC_0998_cropped.jpg',
  '/tmp/reel-38a-photos/DSC_0034-2_cropped.jpg',
  '/tmp/reel-38a-photos/DSC_0035_cropped.jpg',
  '/tmp/reel-38a-photos/DSC_0045_cropped.jpg',
  '/tmp/reel-38a-photos/DSC_0064-3_cropped.jpg',
  '/tmp/reel-38a-photos/DSC_0074_cropped.jpg',
  '/tmp/reel-38a-photos/DSC_0075_cropped.jpg',
  '/tmp/reel-38a-photos/DSC_0184_cropped.jpg',
];

// Look groups
var LOOK1 = [0, 1, 2, 3, 4];       // DSC_0943 - DSC_0957 (orange crochet + green shorts)
var LOOK2 = [5, 6, 7, 8, 9, 10, 11]; // DSC_0960 - DSC_0035 (blue sequin top + closeups)
var LOOK3 = [12, 13, 14, 15, 16];   // DSC_0045 - DSC_0184 (animal print + blue top)

/*
  Structure (~24s):
  0-1s:       Black screen, then "LOOK 01" slides in from right
  1-5s:       Look 1 photos with crossfade + Ken Burns
  5-5.5s:     "LOOK 02" slides in
  5.5-10s:    Look 2 photos
  10-10.5s:   "LOOK 03" slides in
  10.5-15s:   Look 3 photos
  15-16.5s:   "Shot on film in Bali" fades in
  16.5-17s:   Flash transition
  17-19s:     "MANILA FREE PHOTO SHOOT" big bold text
  19-21s:     CTA (@madebyaidan, DM me, IT'S FREE)
  21-24s:     Hold CTA, fade to black
*/

function resetOutputDir() {
  rmSync(OUT_DIR, { recursive: true, force: true });
  mkdirSync(OUT_DIR, { recursive: true });
}

function buildHTML(imageDataList) {
  var html = '<!DOCTYPE html>\n';
  html += '<html>\n<head>\n<meta charset="utf-8">\n<style>\n';
  html += '  * { margin: 0; padding: 0; box-sizing: border-box; }\n';
  html += '  body { width: ' + W + 'px; height: ' + H + 'px; overflow: hidden; background: #000; color: white; }\n';
  html += '  .scene { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; opacity: 0; pointer-events: none; }\n';
  html += '  .scene.active { opacity: 1; }\n';
  html += '  .photo-layer { position: absolute; inset: 0; opacity: 0; }\n';
  html += '  .photo-layer img { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; object-position: center 30%; }\n';
  html += '  .flash { position: absolute; inset: 0; background: white; opacity: 0; z-index: 50; pointer-events: none; }\n';
  html += '  .look-label { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; opacity: 0; z-index: 40; pointer-events: none; }\n';
  html += '  .look-label span { font-family: system-ui, -apple-system, "Helvetica Neue", sans-serif; font-size: 72px; font-weight: 400; letter-spacing: 8px; text-transform: uppercase; color: white; transform: translateX(400px); }\n';
  html += '  .look-label.active { opacity: 1; }\n';
  html += '  .look-label.active span { transform: translateX(0); }\n';
  html += '</style>\n</head>\n<body>\n\n';

  // Photo layers (one per photo, stacked)
  for (var i = 0; i < imageDataList.length; i++) {
    html += '  <div class="photo-layer" id="photo' + i + '"><img src="' + imageDataList[i] + '" style="transform:scale(1.05);" /></div>\n';
  }

  // Look labels
  html += '  <div class="look-label" id="look1"><span>LOOK 01</span></div>\n';
  html += '  <div class="look-label" id="look2"><span>LOOK 02</span></div>\n';
  html += '  <div class="look-label" id="look3"><span>LOOK 03</span></div>\n';

  // "Shot on film in Bali" scene
  html += '  <div class="scene" id="filmScene" style="background:#000">\n';
  html += '    <div id="filmText" style="font-family:Georgia,\'Times New Roman\',serif;font-size:48px;font-style:italic;color:rgba(255,255,255,0.7);text-align:center;opacity:0;">Shot on film in Bali</div>\n';
  html += '  </div>\n\n';

  // "MANILA FREE PHOTO SHOOT" scene
  html += '  <div class="scene" id="manilaScene" style="background:#000">\n';
  html += '    <div id="manilaText" style="font-family:system-ui,-apple-system,sans-serif;font-size:80px;font-weight:900;letter-spacing:2px;text-align:center;padding:0 60px;line-height:1.15;opacity:0;">MANILA FREE PHOTO SHOOT</div>\n';
  html += '  </div>\n\n';

  // CTA scene
  html += '  <div class="scene" id="ctaScene" style="background:#000;flex-direction:column;">\n';
  html += '    <div id="ctaHandle" style="font-size:64px;font-weight:900;color:#E8443A;text-align:center;font-family:system-ui,-apple-system,sans-serif;opacity:0;">@madebyaidan</div>\n';
  html += '    <div id="ctaSub" style="font-size:36px;color:rgba(255,255,255,0.5);text-align:center;margin-top:16px;font-family:system-ui,-apple-system,sans-serif;opacity:0;">DM me on Instagram</div>\n';
  html += '    <div id="ctaFree" style="font-size:28px;font-weight:700;color:rgba(255,255,255,0.35);text-align:center;margin-top:40px;letter-spacing:6px;font-family:system-ui,-apple-system,sans-serif;opacity:0;">IT\'S FREE</div>\n';
  html += '  </div>\n\n';

  // Flash
  html += '  <div class="flash" id="flash"></div>\n\n';

  // Timeline script
  html += '<script>\n';
  html += '  var timeline = [\n';

  // Helper: show a photo with Ken Burns zoom
  function showPhoto(t, idx, zoomFrom, zoomTo) {
    html += '    [' + t.toFixed(2) + ', function() {\n';
    html += '      document.getElementById("photo' + idx + '").style.opacity = "1";\n';
    html += '      document.getElementById("photo' + idx + '").querySelector("img").style.transform = "scale(' + zoomTo + ')";\n';
    html += '    }],\n';
  }

  function hidePhoto(t, idx) {
    html += '    [' + t.toFixed(2) + ', function() {\n';
    html += '      document.getElementById("photo' + idx + '").style.opacity = "0";\n';
    html += '      document.getElementById("photo' + idx + '").querySelector("img").style.transform = "scale(1.05)";\n';
    html += '    }],\n';
  }

  function hideAllPhotos(t) {
    for (var i = 0; i < imageDataList.length; i++) {
      hidePhoto(t, i);
    }
  }

  function showLookLabel(t, id) {
    html += '    [' + t.toFixed(2) + ', function() { document.getElementById("' + id + '").classList.add("active"); }],\n';
  }

  function hideLookLabel(t, id) {
    html += '    [' + t.toFixed(2) + ', function() { document.getElementById("' + id + '").classList.remove("active"); }],\n';
  }

  // Schedule a group of photos with crossfade
  function schedulePhotoGroup(startTime, endTime, indices) {
    var dur = (endTime - startTime) / indices.length;
    for (var i = 0; i < indices.length; i++) {
      var t = startTime + i * dur;
      // Hide previous photo
      if (i > 0) {
        hidePhoto(t, indices[i - 1]);
      }
      showPhoto(t, indices[i], 1.05, 1.0);
    }
    // Hide last photo at end
    hidePhoto(endTime, indices[indices.length - 1]);
  }

  // 0-0.5s: Black
  // 0.5s: "LOOK 01" slides in
  showLookLabel(0.5, 'look1');
  // 1.0s: Hide look label, start photos
  hideLookLabel(1.0, 'look1');

  // 1-5s: Look 1 photos
  schedulePhotoGroup(1.0, 5.0, LOOK1);

  // 5.0s: "LOOK 02" slides in
  showLookLabel(5.0, 'look2');
  hideLookLabel(5.5, 'look2');

  // 5.5-10s: Look 2 photos
  schedulePhotoGroup(5.5, 10.0, LOOK2);

  // 10.0s: "LOOK 03" slides in
  showLookLabel(10.0, 'look3');
  hideLookLabel(10.5, 'look3');

  // 10.5-15s: Look 3 photos
  schedulePhotoGroup(10.5, 15.0, LOOK3);

  // 15-16.5s: "Shot on film in Bali"
  html += '    [15.0, function() { document.getElementById("filmScene").classList.add("active"); }],\n';
  html += '    [15.2, function() { document.getElementById("filmText").style.opacity = "1"; }],\n';

  // 16.5s: Flash
  html += '    [16.3, function() { document.getElementById("filmText").style.opacity = "0"; }],\n';
  html += '    [16.5, function() { document.getElementById("flash").style.opacity = "0.9"; document.getElementById("filmScene").classList.remove("active"); }],\n';
  html += '    [16.65, function() { document.getElementById("flash").style.opacity = "0"; }],\n';

  // 17-19s: "MANILA FREE PHOTO SHOOT"
  html += '    [17.0, function() { document.getElementById("manilaScene").classList.add("active"); document.getElementById("manilaText").style.opacity = "1"; }],\n';

  // 19-21s: CTA
  html += '    [19.0, function() { document.getElementById("manilaScene").classList.remove("active"); document.getElementById("ctaScene").classList.add("active"); }],\n';
  html += '    [19.1, function() { document.getElementById("ctaHandle").style.opacity = "1"; }],\n';
  html += '    [19.4, function() { document.getElementById("ctaSub").style.opacity = "1"; }],\n';
  html += '    [19.8, function() { document.getElementById("ctaFree").style.opacity = "1"; }],\n';

  // 22s: Fade to black
  html += '    [22.0, function() { document.getElementById("ctaScene").style.opacity = "0"; }],\n';
  html += '    [24.0, function() { /* end */ }]\n';

  html += '  ];\n\n';

  // Timeline runner + __applyUpTo
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

async function main() {
  console.log('=== Lookbook Bali Cave reel v38a ===');
  resetOutputDir();

  // Load processed photos as base64
  console.log('Loading photos...');
  var imageDataList = [];
  for (var p of PHOTO_FILES) {
    if (!existsSync(p)) {
      console.error('Photo not found: ' + p);
      process.exit(1);
    }
    var buf = readFileSync(p);
    imageDataList.push('data:image/jpeg;base64,' + buf.toString('base64'));
    console.log('  ' + path.basename(p) + ' (' + (buf.length / 1024).toFixed(0) + ' KB)');
  }

  // Generate HTML
  var html = buildHTML(imageDataList);
  var htmlPath = path.join(OUT_DIR, 'reel-38a.html');
  writeFileSync(htmlPath, html);

  // Frame capture
  var framesDir = path.join(OUT_DIR, 'tmp-frames');
  mkdirSync(framesDir, { recursive: true });

  var duration = 24;
  var totalFrames = Math.ceil(duration * FPS);

  var browser = await chromium.launch();
  var page = await browser.newPage({ viewport: { width: W, height: H } });
  await page.goto('file://' + htmlPath + '?capture=1', { waitUntil: 'load' });
  await page.waitForTimeout(500);

  console.log('Capturing ' + totalFrames + ' frames...');

  for (var frame = 0; frame < totalFrames; frame++) {
    var t = frame / FPS;

    await page.evaluate(function(time) {
      // Reset all scenes
      document.querySelectorAll('.scene').forEach(function(s) {
        s.classList.remove('active');
        s.style.opacity = '';
      });
      document.querySelectorAll('.look-label').forEach(function(s) {
        s.classList.remove('active');
      });

      // Reset photos
      for (var i = 0; i < 20; i++) {
        var el = document.getElementById('photo' + i);
        if (!el) break;
        el.style.opacity = '0';
        el.querySelector('img').style.transform = 'scale(1.05)';
      }

      // Reset text opacities
      document.getElementById('filmText').style.opacity = '0';
      document.getElementById('manilaText').style.opacity = '0';
      document.getElementById('ctaHandle').style.opacity = '0';
      document.getElementById('ctaSub').style.opacity = '0';
      document.getElementById('ctaFree').style.opacity = '0';
      document.getElementById('flash').style.opacity = '0';

      window.__applyUpTo(time);
    }, t);

    await page.waitForTimeout(2);

    var padded = String(frame).padStart(5, '0');
    await page.screenshot({
      path: path.join(framesDir, 'frame_' + padded + '.png'),
      type: 'png',
    });

    if (frame % (FPS * 3) === 0) {
      console.log('  ' + t.toFixed(1) + 's / ' + duration + 's');
    }
  }

  await browser.close();
  console.log('Frames captured');

  // Compile to mp4
  var finalMp4 = path.join(OUT_DIR, 'lookbook-bali-v38a.mp4');
  execSync(
    'ffmpeg -y -framerate ' + FPS + ' -i "' + path.join(framesDir, 'frame_%05d.png') + '" -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r ' + FPS + ' "' + finalMp4 + '"',
    { stdio: 'inherit' }
  );

  rmSync(framesDir, { recursive: true, force: true });

  // Copy to reels/
  var reelsDir = path.join(__dirname, 'reels');
  if (!existsSync(reelsDir)) mkdirSync(reelsDir, { recursive: true });
  execSync('cp "' + finalMp4 + '" "' + path.join(reelsDir, 'lookbook-bali-v38a.mp4') + '"');

  var sz = statSync(finalMp4);
  console.log('Final: ' + (sz.size / (1024 * 1024)).toFixed(1) + ' MB');
  console.log('Copied to reels/lookbook-bali-v38a.mp4');
  console.log('=== Done ===');
}

main().catch(function(err) {
  console.error(err);
  process.exit(1);
});
