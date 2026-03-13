import { chromium } from 'playwright';
import { execSync } from 'child_process';
import { mkdirSync, rmSync, existsSync, readFileSync, writeFileSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

var __dirname = path.dirname(fileURLToPath(import.meta.url));
var OUT_DIR = path.join(__dirname, 'output-41a');

var W = 1080;
var H = 1920;
var FPS = 30;

// Source photos from film scans folder
var SRC_DIR = '/Volumes/PortableSSD/Exports/film scans';
var SRC_FILES = [
  'DSC_0723.jpg',
  'DSC_0724.jpg',
  'DSC_0725.jpg',
  'DSC_0728.jpg',
  'DSC_0732.jpg',
  'DSC_0739.jpg',
  'DSC_0740.jpg',
];

var CROP_DIR = '/tmp/reel-41a-photos';

/*
  "i just wanna be photographer'd" reel (~24s):
  0-3s:      Black screen, text fades in
  3-3.5s:    Flash transition
  3.5-16.5s: Photos cycle with flash transitions
  16.5-18s:  "Want photos like this?"
  18-22s:    CTA (@madebyaidan, DM me, IT'S FREE)
  22-24s:    Fade to black
*/

function resetOutputDir() {
  rmSync(OUT_DIR, { recursive: true, force: true });
  mkdirSync(OUT_DIR, { recursive: true });
}

function prepPhotos() {
  rmSync(CROP_DIR, { recursive: true, force: true });
  mkdirSync(CROP_DIR, { recursive: true });

  for (var f of SRC_FILES) {
    var src = path.join(SRC_DIR, f);
    if (!existsSync(src)) {
      console.error('Source not found: ' + src);
      process.exit(1);
    }
    var base = path.basename(f, '.jpg');
    var dst = path.join(CROP_DIR, base + '_cropped.jpg');
    // Crop film borders, negate, auto-level
    execSync(
      'magick "' + src + '" -crop 94%x97%+3%+1.5% +repage -negate -auto-level -quality 95 "' + dst + '"',
      { stdio: 'inherit' }
    );
    console.log('  Processed: ' + base);
  }
}

function buildHTML(imageDataList) {
  var photoCount = imageDataList.length;
  var html = '<!DOCTYPE html>\n';
  html += '<html>\n<head>\n<meta charset="utf-8">\n<style>\n';
  html += '  * { margin: 0; padding: 0; box-sizing: border-box; }\n';
  html += '  body { width: ' + W + 'px; height: ' + H + 'px; overflow: hidden; background: #000; font-family: Georgia, "Times New Roman", serif; color: white; }\n';
  html += '  .scene { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; opacity: 0; pointer-events: none; }\n';
  html += '  .scene.active { opacity: 1; }\n';
  html += '  .photo-scene { position: absolute; inset: 0; opacity: 0; }\n';
  html += '  .photo-scene.active { opacity: 1; }\n';
  html += '  .photo-scene img { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; object-position: center 30%; opacity: 0; transform: scale(1.08); }\n';
  html += '  .flash { position: absolute; inset: 0; background: white; opacity: 0; z-index: 50; pointer-events: none; }\n';
  html += '  .hit-text { font-size: 88px; font-weight: 900; text-align: center; line-height: 1.15; padding: 0 60px; letter-spacing: -0.02em; transform: scale(0); opacity: 0; font-family: -apple-system, system-ui, "Helvetica Neue", sans-serif; }\n';
  html += '  .hit-text.pop { transform: scale(1); opacity: 1; }\n';
  html += '  .accent { color: #E8443A; }\n';
  html += '  @keyframes shake { 0%, 100% { transform: translate(0,0); } 10% { transform: translate(-14px, 10px); } 30% { transform: translate(-10px, -12px); } 50% { transform: translate(12px, -6px); } 70% { transform: translate(-8px, 12px); } 90% { transform: translate(6px, -8px); } }\n';
  html += '  .shake { animation: shake 0.35s ease-out; }\n';
  html += '  @keyframes slideUp { 0% { transform: translateY(60px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }\n';
  html += '  .slide-up { opacity: 0; }\n';
  html += '  .slide-up.go { animation: slideUp 0.4s ease-out forwards; }\n';
  html += '  @keyframes pulse-glow { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }\n';
  html += '  .pulse { animation: pulse-glow 0.8s ease-in-out infinite; }\n';
  html += '</style>\n</head>\n<body>\n\n';

  // Scene 1: "i just wanna be photographer'd" text
  html += '  <div class="scene" id="textScene">\n';
  html += '    <div id="mainText" style="text-align:center;padding:0 80px;opacity:0;">\n';
  html += '      <div style="font-size:58px;font-weight:400;font-style:italic;line-height:1.4;letter-spacing:0.02em;color:rgba(255,255,255,0.9);">i just wanna be</div>\n';
  html += '      <div style="font-size:58px;font-weight:400;font-style:italic;line-height:1.4;letter-spacing:0.02em;color:rgba(255,255,255,0.9);">photographer\'d</div>\n';
  html += '    </div>\n';
  html += '  </div>\n\n';

  // Scene 2: Photos
  html += '  <div class="photo-scene" id="photoScene">\n';
  for (var i = 0; i < imageDataList.length; i++) {
    html += '    <img id="photo' + i + '" src="' + imageDataList[i] + '" />\n';
  }
  html += '  </div>\n\n';

  // Scene 3: "Want photos like this?"
  html += '  <div class="scene" id="scene3" style="background:#000">\n';
  html += '    <div class="hit-text" id="s3text" style="font-size:84px">Want photos<br>like <span class="accent">this?</span></div>\n';
  html += '  </div>\n\n';

  // Scene 4: CTA
  html += '  <div class="scene" id="scene4" style="background:#000;flex-direction:column;">\n';
  html += '    <div class="slide-up" id="s4handle" style="font-size:64px;font-weight:900;color:#E8443A;text-align:center;font-family:-apple-system,system-ui,sans-serif;">@madebyaidan</div>\n';
  html += '    <div class="slide-up" id="s4sub" style="font-size:36px;color:rgba(255,255,255,0.5);text-align:center;margin-top:16px;font-family:-apple-system,system-ui,sans-serif;">DM me on Instagram</div>\n';
  html += '    <div class="slide-up" id="s4free" style="font-size:28px;font-weight:700;color:rgba(255,255,255,0.35);text-align:center;margin-top:40px;letter-spacing:6px;font-family:-apple-system,system-ui,sans-serif;">IT\'S FREE</div>\n';
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

  // 3.3-16.5s: Photos
  var photoStart = 3.3;
  var photoDur = Math.round(((16.5 - photoStart) / photoCount) * 100) / 100;
  for (var pi = 0; pi < photoCount; pi++) {
    var t = photoStart + pi * photoDur;

    // Flash between photos (skip first)
    if (pi > 0) {
      html += '    [' + (t - 0.08).toFixed(2) + ', function() { document.getElementById("flash").style.opacity = "0.7"; }],\n';
      html += '    [' + (t + 0.06).toFixed(2) + ', function() { document.getElementById("flash").style.opacity = "0"; }],\n';
    }

    // Show photo with slow zoom
    html += '    [' + t.toFixed(2) + ', function() {\n';
    for (var pj = 0; pj < photoCount; pj++) {
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

  // 16.5s: Fade photos, show "Want photos like this?"
  html += '    [16.5, function() { document.getElementById("photoScene").style.transition = "opacity 0.3s ease-out"; document.getElementById("photoScene").style.opacity = "0"; document.getElementById("scene3").classList.add("active"); }],\n';
  html += '    [16.6, function() { document.getElementById("s3text").classList.add("pop"); }],\n';
  html += '    [16.65, function() { document.getElementById("scene3").classList.add("shake"); }],\n';

  // 18s: CTA
  html += '    [18.0, function() { document.getElementById("scene3").classList.remove("active"); document.getElementById("scene4").classList.add("active"); }],\n';
  html += '    [18.1, function() { document.getElementById("s4handle").classList.add("go"); }],\n';
  html += '    [18.4, function() { document.getElementById("s4sub").classList.add("go"); }],\n';
  html += '    [18.8, function() { document.getElementById("s4free").classList.add("go"); }],\n';
  html += '    [19.3, function() { document.getElementById("s4handle").classList.add("pulse"); }],\n';

  // 22s: Fade to black
  html += '    [22.0, function() { document.getElementById("scene4").style.transition = "opacity 1.5s ease-out"; document.getElementById("scene4").style.opacity = "0"; }],\n';
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
  console.log('=== "i just wanna be photographerd" reel v41a ===');
  resetOutputDir();

  // Prep photos
  console.log('Processing photos...');
  prepPhotos();

  // Load processed photos as base64
  console.log('Loading photos...');
  var imageDataList = [];
  for (var f of SRC_FILES) {
    var base = path.basename(f, '.jpg');
    var p = path.join(CROP_DIR, base + '_cropped.jpg');
    if (!existsSync(p)) {
      console.error('Processed photo not found: ' + p);
      process.exit(1);
    }
    var buf = readFileSync(p);
    imageDataList.push('data:image/jpeg;base64,' + buf.toString('base64'));
    console.log('  ' + base + ' (' + (buf.length / 1024).toFixed(0) + ' KB)');
  }

  // Generate HTML
  var html = buildHTML(imageDataList);
  var htmlPath = path.join(OUT_DIR, 'reel-41a.html');
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
      document.querySelectorAll('.scene, .photo-scene').forEach(function(s) {
        s.classList.remove('active', 'shake');
        s.style.opacity = '';
        s.style.transition = '';
      });
      document.querySelectorAll('.pop').forEach(function(el) { el.classList.remove('pop'); });
      document.querySelectorAll('.pulse').forEach(function(el) { el.classList.remove('pulse'); });
      document.querySelectorAll('.go').forEach(function(el) { el.classList.remove('go'); });

      document.getElementById('mainText').style.opacity = '0';
      document.getElementById('mainText').style.transition = '';
      document.getElementById('flash').style.opacity = '0';

      for (var i = 0; i < 20; i++) {
        var img = document.getElementById('photo' + i);
        if (!img) break;
        img.style.opacity = '0';
        img.style.transform = 'scale(1.08)';
        img.style.transition = 'none';
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
  var finalMp4 = path.join(OUT_DIR, 'photographer-d-v41a.mp4');
  execSync(
    'ffmpeg -y -framerate ' + FPS + ' -i "' + path.join(framesDir, 'frame_%05d.png') + '" -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r ' + FPS + ' "' + finalMp4 + '"',
    { stdio: 'inherit' }
  );

  rmSync(framesDir, { recursive: true, force: true });

  // Copy to reels/
  var reelsDir = path.join(__dirname, 'reels');
  if (!existsSync(reelsDir)) mkdirSync(reelsDir, { recursive: true });
  execSync('cp "' + finalMp4 + '" "' + path.join(reelsDir, 'photographer-d-v41a.mp4') + '"');

  var sz = statSync(finalMp4);
  console.log('Final: ' + (sz.size / (1024 * 1024)).toFixed(1) + ' MB');
  console.log('Copied to reels/photographer-d-v41a.mp4');
  console.log('=== Done ===');
}

main().catch(function(err) {
  console.error(err);
  process.exit(1);
});
