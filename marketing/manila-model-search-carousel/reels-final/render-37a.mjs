import { chromium } from 'playwright';
import { execSync } from 'child_process';
import { mkdirSync, rmSync, existsSync, readFileSync, writeFileSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

var __dirname = path.dirname(fileURLToPath(import.meta.url));
var OUT_DIR = path.join(__dirname, 'output-37a');

var W = 1080;
var H = 1920;
var FPS = 30;

// Pre-processed photos (cropped, inverted, color-corrected, rotated)
var PHOTO_FILES = [
  '/tmp/reel-37-photos/DSC_0523_processed.jpg',
  '/tmp/reel-37-photos/DSC_0530_processed.jpg',
  '/tmp/reel-37-photos/DSC_0804_processed.jpg',
  '/tmp/reel-37-photos/DSC_0806_processed.jpg',
  '/tmp/reel-37-photos/DSC_0807_processed.jpg',
  '/tmp/reel-37-photos/DSC_0809_processed.jpg',
  '/tmp/reel-37-photos/DSC_0824_processed.jpg',
];

/*
  Structure (~18s):
  0-3s:    Black screen, "i just wanna be photographer'd" fades in
  3-3.5s:  Flash transition
  3.5-17s: Photos cycle (7 photos, ~1.9s each) with subtle zoom
  17-18s:  Fade to black
*/

function resetOutputDir() {
  rmSync(OUT_DIR, { recursive: true, force: true });
  mkdirSync(OUT_DIR, { recursive: true });
}

function buildHTML(imageDataList) {
  var html = '<!DOCTYPE html>\n';
  html += '<html>\n<head>\n<meta charset="utf-8">\n<style>\n';
  html += '  * { margin: 0; padding: 0; box-sizing: border-box; }\n';
  html += '  body { width: ' + W + 'px; height: ' + H + 'px; overflow: hidden; background: #000; font-family: Georgia, "Times New Roman", serif; color: white; }\n';
  html += '  .text-scene { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; opacity: 0; }\n';
  html += '  .text-scene.active { opacity: 1; }\n';
  html += '  .photo-scene { position: absolute; inset: 0; opacity: 0; }\n';
  html += '  .photo-scene.active { opacity: 1; }\n';
  html += '  .photo-scene img { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; object-position: center 30%; opacity: 0; transform: scale(1.08); }\n';
  html += '  .flash { position: absolute; inset: 0; background: white; opacity: 0; z-index: 50; pointer-events: none; }\n';
  html += '</style>\n</head>\n<body>\n\n';

  // Text scene
  html += '  <div class="text-scene" id="textScene">\n';
  html += '    <div id="mainText" style="text-align:center;padding:0 80px;opacity:0;">\n';
  html += '      <div style="font-size:58px;font-weight:400;font-style:italic;line-height:1.4;letter-spacing:0.02em;color:rgba(255,255,255,0.9);">i just wanna be</div>\n';
  html += '      <div style="font-size:58px;font-weight:400;font-style:italic;line-height:1.4;letter-spacing:0.02em;color:rgba(255,255,255,0.9);">photographer\'d</div>\n';
  html += '    </div>\n';
  html += '  </div>\n\n';

  // Photo scene
  html += '  <div class="photo-scene" id="photoScene">\n';
  for (var i = 0; i < imageDataList.length; i++) {
    html += '    <img id="photo' + i + '" src="' + imageDataList[i] + '" />\n';
  }
  html += '  </div>\n\n';

  // Flash
  html += '  <div class="flash" id="flash"></div>\n\n';

  // Timeline script
  html += '<script>\n';
  html += '  var timeline = [\n';

  // 0-3s: Text fades in
  html += '    [0, function() { document.getElementById("textScene").classList.add("active"); }],\n';
  html += '    [0.6, function() { document.getElementById("mainText").style.opacity = "1"; document.getElementById("mainText").style.transition = "opacity 1.2s ease-in"; }],\n';

  // 3.0s: Flash + transition to photos
  html += '    [2.8, function() { document.getElementById("mainText").style.opacity = "0"; document.getElementById("mainText").style.transition = "opacity 0.3s ease-out"; }],\n';
  html += '    [3.0, function() { document.getElementById("flash").style.opacity = "0.9"; }],\n';
  html += '    [3.15, function() { document.getElementById("flash").style.opacity = "0"; document.getElementById("textScene").classList.remove("active"); document.getElementById("photoScene").classList.add("active"); }],\n';

  // 3.5-17s: Photos (7 photos, ~1.9s each)
  var photoStart = 3.3;
  var photoDur = 1.9;
  for (var pi = 0; pi < 7; pi++) {
    var t = photoStart + pi * photoDur;

    // Flash between photos (skip first)
    if (pi > 0) {
      html += '    [' + (t - 0.08).toFixed(2) + ', function() { document.getElementById("flash").style.opacity = "0.7"; }],\n';
      html += '    [' + (t + 0.06).toFixed(2) + ', function() { document.getElementById("flash").style.opacity = "0"; }],\n';
    }

    // Show photo with slow zoom
    html += '    [' + t.toFixed(2) + ', function() {\n';
    for (var pj = 0; pj < 7; pj++) {
      if (pj === pi) {
        html += '      document.getElementById("photo' + pj + '").style.opacity = "1";\n';
        html += '      document.getElementById("photo' + pj + '").style.transform = "scale(1.0)";\n';
        html += '      document.getElementById("photo' + pj + '").style.transition = "transform 2.0s ease-out, opacity 0.1s";\n';
      } else {
        html += '      document.getElementById("photo' + pj + '").style.opacity = "0";\n';
        html += '      document.getElementById("photo' + pj + '").style.transform = "scale(1.08)";\n';
        html += '      document.getElementById("photo' + pj + '").style.transition = "none";\n';
      }
    }
    html += '    }],\n';
  }

  // 16.6s: Fade to black
  html += '    [16.6, function() { document.getElementById("photoScene").style.transition = "opacity 1.2s ease-out"; document.getElementById("photoScene").style.opacity = "0"; }],\n';
  html += '    [18.0, function() { /* end */ }]\n';

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
  console.log('=== "i just wanna be photographerd" reel v37a ===');
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
  var htmlPath = path.join(OUT_DIR, 'reel-37a.html');
  writeFileSync(htmlPath, html);

  // Frame capture
  var framesDir = path.join(OUT_DIR, 'tmp-frames');
  mkdirSync(framesDir, { recursive: true });

  var duration = 18;
  var totalFrames = Math.ceil(duration * FPS);

  var browser = await chromium.launch();
  var page = await browser.newPage({ viewport: { width: W, height: H } });
  await page.goto('file://' + htmlPath + '?capture=1', { waitUntil: 'load' });
  await page.waitForTimeout(500);

  console.log('Capturing ' + totalFrames + ' frames...');

  for (var frame = 0; frame < totalFrames; frame++) {
    var t = frame / FPS;

    await page.evaluate(function(time) {
      // Reset
      document.querySelectorAll('.text-scene, .photo-scene').forEach(function(s) {
        s.classList.remove('active');
        s.style.opacity = '';
        s.style.transition = '';
      });
      document.getElementById('mainText').style.opacity = '0';
      document.getElementById('mainText').style.transition = '';
      document.getElementById('flash').style.opacity = '0';

      for (var i = 0; i < 7; i++) {
        var img = document.getElementById('photo' + i);
        if (img) {
          img.style.opacity = '0';
          img.style.transform = 'scale(1.08)';
          img.style.transition = 'none';
        }
      }

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
  var finalMp4 = path.join(OUT_DIR, 'photographer-d-v37a.mp4');
  execSync(
    'ffmpeg -y -framerate ' + FPS + ' -i "' + path.join(framesDir, 'frame_%05d.png') + '" -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r ' + FPS + ' "' + finalMp4 + '"',
    { stdio: 'inherit' }
  );

  rmSync(framesDir, { recursive: true, force: true });

  // Copy to reels/
  var reelsDir = path.join(__dirname, 'reels');
  if (!existsSync(reelsDir)) mkdirSync(reelsDir, { recursive: true });
  execSync('cp "' + finalMp4 + '" "' + path.join(reelsDir, 'photographer-d-v37a.mp4') + '"');

  var sz = statSync(finalMp4);
  console.log('Final: ' + (sz.size / (1024 * 1024)).toFixed(1) + ' MB');
  console.log('Copied to reels/photographer-d-v37a.mp4');
  console.log('=== Done ===');
}

main().catch(function(err) {
  console.error(err);
  process.exit(1);
});
