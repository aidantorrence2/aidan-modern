import { chromium } from 'playwright';
import { execSync } from 'child_process';
import { mkdirSync, rmSync, existsSync, readFileSync, writeFileSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

var __dirname = path.dirname(fileURLToPath(import.meta.url));
var OUT_DIR = path.join(__dirname, 'output-46a');
var BTS_CLIP = '/Users/aidantorrence/Pictures/1980/1980-01-01/MVI_4802.AVI';

var W = 1080;
var H = 1920;
var FPS = 30;
var SAFE_TOP = 213;
var SAFE_BOTTOM = 430;

var SRC_DIR = '/Volumes/PortableSSD/Exports/film scans';
var PHOTO_NAMES = [
  'DSC_0404.jpg',
  'DSC_0405.jpg',
  'DSC_0407.jpg',
  'DSC_0162.jpg',
  'DSC_0163-2.jpg',
  'DSC_0164.jpg',
];

/*
  Structure (~21s total):
  PART 1 (0-5s):   BTS clip (coast shoot, rotated portrait, blur bg) with text overlays + audio
  PART 2 (5-21s):  "THE RESULTS:" → photo slideshow with counter → "Want photos like this?" → CTA
*/

function resetOutputDir() {
  rmSync(OUT_DIR, { recursive: true, force: true });
  mkdirSync(OUT_DIR, { recursive: true });
}

function prepPhotos() {
  var cropDir = path.join(OUT_DIR, 'tmp-photos');
  mkdirSync(cropDir, { recursive: true });
  var processed = [];
  for (var f of PHOTO_NAMES) {
    var src = path.join(SRC_DIR, f);
    if (!existsSync(src)) {
      console.error('Photo not found: ' + src);
      process.exit(1);
    }
    var dst = path.join(cropDir, f.replace('.jpg', '_processed.jpg'));
    execSync('magick "' + src + '" -shave 500x600 +repage -auto-level -quality 95 "' + dst + '"', { stdio: 'pipe' });
    processed.push(dst);
    console.log('  Processed: ' + f.replace('.jpg', ''));
  }
  return processed;
}

function buildBTSClip() {
  console.log('=== Part 1: BTS clip with overlays ===');
  var btsMp4 = path.join(OUT_DIR, 'tmp_bts.mp4');
  var overlayPng = path.join(OUT_DIR, 'tmp_overlay.png');

  // Text overlay
  var overlayCmd = 'magick -size ' + W + 'x' + H + ' xc:transparent ' +
    '-gravity North -font "/System/Library/Fonts/Supplemental/Arial Bold.ttf" ' +
    '-fill "rgba(255,255,255,0.9)" -pointsize 52 -annotate +0+260 "BEHIND THE SCENES" ' +
    '-gravity South -fill white -pointsize 72 -strokewidth 3 -stroke "rgba(0,0,0,0.6)" ' +
    '-annotate +0+500 "BALI FREE" ' +
    '-annotate +0+420 "PHOTO SHOOT" ' +
    '-stroke none -fill "rgba(255,255,255,0.6)" -pointsize 36 -annotate +0+370 "@madebyaidan" ' +
    '"' + overlayPng + '"';
  execSync(overlayCmd, { stdio: 'pipe' });

  // Rotate 90 CW, blur bg, overlay text, first 5s with audio
  var filterComplex = [
    '[0:v]transpose=1,split=2[rot1][rot2]',
    '[rot1]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,gblur=sigma=30[bg]',
    '[rot2]scale=-2:1920[fg]',
    '[bg][fg]overlay=(W-w)/2:0[comp]',
    '[comp]vignette=PI/4,curves=m=0/0 0.5/0.48 1/0.95[dark]',
    '[dark][1:v]overlay=0:0:enable=between(t\\,0.3\\,4.5)[out]',
  ].join(';');

  var cmd = 'ffmpeg -y -i "' + BTS_CLIP + '" -i "' + overlayPng + '" ' +
    '-filter_complex "' + filterComplex + '" ' +
    '-map "[out]" -map 0:a -t 5 ' +
    '-c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r ' + FPS + ' ' +
    '-c:a aac -b:a 128k "' + btsMp4 + '"';
  execSync(cmd, { stdio: 'inherit' });
  console.log('BTS clip done');
  return btsMp4;
}

function buildRevealHTML(imageDataList, photoCount) {
  var html = '<!DOCTYPE html>\n';
  html += '<html>\n<head>\n<meta charset="utf-8">\n<style>\n';
  html += '  * { margin: 0; padding: 0; box-sizing: border-box; }\n';
  html += '  body { width: ' + W + 'px; height: ' + H + 'px; overflow: hidden; background: #0a0a0a; font-family: -apple-system, system-ui, "Helvetica Neue", sans-serif; color: white; }\n';
  html += '  .scene { position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; opacity: 0; pointer-events: none; }\n';
  html += '  .scene.active { opacity: 1; }\n';
  html += '  .hit-text { font-size: 88px; font-weight: 900; text-align: center; line-height: 1.15; padding: 0 60px; letter-spacing: -0.02em; transform: scale(0); opacity: 0; }\n';
  html += '  .hit-text.pop { transform: scale(1); opacity: 1; }\n';
  html += '  .accent { color: #E8443A; }\n';
  html += '  @keyframes shake { 0%, 100% { transform: translate(0,0); } 10% { transform: translate(-14px, 10px); } 30% { transform: translate(-10px, -12px); } 50% { transform: translate(12px, -6px); } 70% { transform: translate(-8px, 12px); } 90% { transform: translate(6px, -8px); } }\n';
  html += '  .shake { animation: shake 0.35s ease-out; }\n';
  html += '  .flash-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: white; opacity: 0; pointer-events: none; z-index: 100; }\n';
  html += '  .photo-frame { position: absolute; top: ' + (SAFE_TOP + 20) + 'px; left: 50px; right: 50px; bottom: ' + (SAFE_BOTTOM + 20) + 'px; overflow: hidden; border-radius: 12px; }\n';
  html += '  .photo-frame img { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; object-position: center 20%; opacity: 0; transform: scale(1.2); }\n';
  html += '  .photo-counter { position: absolute; bottom: ' + (SAFE_BOTTOM + 30) + 'px; left: 0; right: 0; text-align: center; font-size: 20px; font-weight: 700; color: rgba(255,255,255,0.4); letter-spacing: 6px; }\n';
  html += '  @keyframes pulse-glow { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }\n';
  html += '  .pulse { animation: pulse-glow 0.8s ease-in-out infinite; }\n';
  html += '  @keyframes slideUp { 0% { transform: translateY(60px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }\n';
  html += '  .slide-up { opacity: 0; }\n';
  html += '  .slide-up.go { animation: slideUp 0.4s ease-out forwards; }\n';
  html += '</style>\n</head>\n<body>\n\n';

  html += '  <div class="scene" id="scene1" style="background:#0a0a0a">\n';
  html += '    <div class="hit-text" id="s1text" style="font-size:96px">THE<br><span class="accent">RESULTS:</span></div>\n';
  html += '  </div>\n\n';

  html += '  <div class="scene" id="scene2" style="background:#0a0a0a">\n';
  html += '    <div class="flash-overlay" id="photoFlash"></div>\n';
  html += '    <div class="photo-frame" id="photoFrame">\n';
  for (var i = 0; i < photoCount; i++) {
    html += '      <img id="photo' + i + '" src="' + imageDataList[i] + '" />\n';
  }
  html += '    </div>\n';
  html += '    <div class="photo-counter" id="photoCounter"></div>\n';
  html += '  </div>\n\n';

  html += '  <div class="scene" id="scene3" style="background:#0a0a0a">\n';
  html += '    <div class="hit-text" id="s3text" style="font-size:84px">Want photos<br>like <span class="accent">this?</span></div>\n';
  html += '  </div>\n\n';

  html += '  <div class="scene" id="scene4" style="background:#0a0a0a">\n';
  html += '    <div class="slide-up" id="s4handle" style="font-size:64px;font-weight:900;color:#E8443A;text-align:center;">@madebyaidan</div>\n';
  html += '    <div class="slide-up" id="s4sub" style="font-size:36px;color:rgba(255,255,255,0.5);text-align:center;margin-top:16px;">DM me on Instagram</div>\n';
  html += '    <div class="slide-up" id="s4free" style="font-size:28px;font-weight:700;color:rgba(255,255,255,0.35);text-align:center;margin-top:40px;letter-spacing:6px;">IT\'S FREE</div>\n';
  html += '  </div>\n\n';

  html += '<script>\n';
  html += '  var timeline = [\n';

  html += '    [0, function() { document.getElementById("scene1").classList.add("active"); }],\n';
  html += '    [0.1, function() { document.getElementById("s1text").classList.add("pop"); }],\n';
  html += '    [0.15, function() { document.getElementById("scene1").classList.add("shake"); }],\n';
  html += '    [1.2, function() { document.getElementById("scene1").classList.remove("active"); }],\n';

  html += '    [1.2, function() { document.getElementById("scene2").classList.add("active"); }],\n';

  var photoStart = 1.2;
  var photoDur = Math.round((10.8 / photoCount) * 100) / 100;
  for (var pi = 0; pi < photoCount; pi++) {
    var t = photoStart + pi * photoDur;
    html += '    [' + (t - 0.05).toFixed(2) + ', function() { document.getElementById("photoFlash").style.opacity = "0.85"; }],\n';
    html += '    [' + (t + 0.08).toFixed(2) + ', function() { document.getElementById("photoFlash").style.opacity = "0"; }],\n';

    html += '    [' + t.toFixed(2) + ', function() {\n';
    for (var pj = 0; pj < photoCount; pj++) {
      if (pj === pi) {
        html += '      document.getElementById("photo' + pj + '").style.opacity = "1";\n';
        html += '      document.getElementById("photo' + pj + '").style.transform = "scale(1)";\n';
        html += '      document.getElementById("photo' + pj + '").style.transition = "transform 1.2s ease-out";\n';
      } else if (pj < pi) {
        html += '      document.getElementById("photo' + pj + '").style.opacity = "0";\n';
      }
    }
    html += '      document.getElementById("photoCounter").textContent = "' + (pi + 1) + ' / ' + photoCount + '";\n';
    html += '    }],\n';
  }

  html += '    [12.0, function() { document.getElementById("scene2").classList.remove("active"); }],\n';

  html += '    [12.0, function() { document.getElementById("scene3").classList.add("active"); }],\n';
  html += '    [12.1, function() { document.getElementById("s3text").classList.add("pop"); }],\n';
  html += '    [12.15, function() { document.getElementById("scene3").classList.add("shake"); }],\n';
  html += '    [13.5, function() { document.getElementById("scene3").classList.remove("active"); }],\n';

  html += '    [13.5, function() { document.getElementById("scene4").classList.add("active"); }],\n';
  html += '    [13.6, function() { document.getElementById("s4handle").classList.add("go"); }],\n';
  html += '    [13.9, function() { document.getElementById("s4sub").classList.add("go"); }],\n';
  html += '    [14.3, function() { document.getElementById("s4free").classList.add("go"); }],\n';
  html += '    [14.8, function() { document.getElementById("s4handle").classList.add("pulse"); }],\n';
  html += '    [16.0, function() { /* end */ }]\n';

  html += '  ];\n\n';

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
  console.log('=== BTS Coast Reveal reel v46a ===');
  resetOutputDir();

  console.log('Processing photos...');
  var processedPhotos = prepPhotos();

  console.log('Loading photos...');
  var imageDataList = [];
  for (var p of processedPhotos) {
    var buf = readFileSync(p);
    imageDataList.push('data:image/jpeg;base64,' + buf.toString('base64'));
    console.log('  ' + path.basename(p) + ' (' + (buf.length / 1024).toFixed(0) + ' KB)');
  }

  var btsMp4 = buildBTSClip();

  console.log('=== Part 2: Photo reveal + CTA ===');
  var revealDuration = 16;
  var html = buildRevealHTML(imageDataList, processedPhotos.length);
  var htmlPath = path.join(OUT_DIR, 'reveal.html');
  writeFileSync(htmlPath, html);

  var framesDir = path.join(OUT_DIR, 'tmp-frames');
  mkdirSync(framesDir, { recursive: true });
  var totalFrames = Math.ceil(revealDuration * FPS);

  var browser = await chromium.launch();
  var page = await browser.newPage({ viewport: { width: W, height: H } });
  await page.goto('file://' + htmlPath + '?capture=1', { waitUntil: 'load' });
  await page.waitForTimeout(500);

  console.log('Capturing ' + totalFrames + ' frames...');

  for (var frame = 0; frame < totalFrames; frame++) {
    var t = frame / FPS;

    await page.evaluate(function(time) {
      document.querySelectorAll('.scene').forEach(function(s) {
        s.classList.remove('active', 'shake');
      });
      document.querySelectorAll('.pop').forEach(function(el) { el.classList.remove('pop'); });
      document.querySelectorAll('.pulse').forEach(function(el) { el.classList.remove('pulse'); });
      document.querySelectorAll('.go').forEach(function(el) { el.classList.remove('go'); });

      var flash = document.getElementById('photoFlash');
      if (flash) flash.style.opacity = '0';

      for (var i = 0; i < 20; i++) {
        var img = document.getElementById('photo' + i);
        if (!img) break;
        img.style.opacity = '0';
        img.style.transform = 'scale(1.2)';
        img.style.transition = 'none';
      }

      var counter = document.getElementById('photoCounter');
      if (counter) counter.textContent = '';

      window.__applyUpTo(time);
    }, t);

    await page.waitForTimeout(2);

    var padded = String(frame).padStart(5, '0');
    await page.screenshot({
      path: path.join(framesDir, 'frame_' + padded + '.png'),
      type: 'png',
    });

    if (frame % (FPS * 2) === 0) {
      console.log('  ' + t.toFixed(1) + 's / ' + revealDuration + 's');
    }
  }

  await browser.close();
  console.log('Frames captured');

  var revealMp4 = path.join(OUT_DIR, 'tmp_reveal.mp4');
  execSync(
    'ffmpeg -y -framerate ' + FPS + ' -i "' + path.join(framesDir, 'frame_%05d.png') + '" -f lavfi -i anullsrc=r=44100:cl=stereo -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r ' + FPS + ' -c:a aac -b:a 128k -shortest "' + revealMp4 + '"',
    { stdio: 'inherit' }
  );
  rmSync(framesDir, { recursive: true, force: true });

  console.log('=== Concatenating final video ===');
  var concatTxt = path.join(OUT_DIR, 'tmp_concat.txt');
  writeFileSync(concatTxt, "file 'tmp_bts.mp4'\nfile 'tmp_reveal.mp4'\n");

  var finalMp4 = path.join(OUT_DIR, 'bts-coast-reveal-v46a.mp4');
  execSync('ffmpeg -y -f concat -safe 0 -i "' + concatTxt + '" -c copy "' + finalMp4 + '"', { stdio: 'inherit' });

  execSync('rm -f "' + OUT_DIR + '/tmp_bts.mp4" "' + OUT_DIR + '/tmp_reveal.mp4" "' + OUT_DIR + '/tmp_concat.txt"');

  var reelsDir = path.join(__dirname, 'reels');
  if (!existsSync(reelsDir)) mkdirSync(reelsDir, { recursive: true });
  execSync('cp "' + finalMp4 + '" "' + path.join(reelsDir, 'bts-coast-reveal-v46a.mp4') + '"');

  var sz = statSync(finalMp4);
  console.log('Final: ' + (sz.size / (1024 * 1024)).toFixed(1) + ' MB');
  console.log('Copied to reels/bts-coast-reveal-v46a.mp4');
  console.log('=== Done ===');
}

main().catch(function(err) {
  console.error(err);
  process.exit(1);
});
