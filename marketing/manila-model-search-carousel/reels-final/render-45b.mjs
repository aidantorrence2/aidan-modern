import { chromium } from 'playwright';
import { execSync } from 'child_process';
import { mkdirSync, rmSync, existsSync, readFileSync, writeFileSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

var __dirname = path.dirname(fileURLToPath(import.meta.url));
var OUT_DIR = path.join(__dirname, 'output-45b');
var BTS_CLIP = '/Users/aidantorrence/Pictures/1980/1980-01-01/MVI_4756.AVI';

var W = 1080;
var H = 1920;
var FPS = 30;
var SAFE_TOP = 213;
var SAFE_BOTTOM = 430;

var SRC_DIR = '/Volumes/PortableSSD/Exports/film scans';
var PHOTO_NAMES = [
  'DSC_0028.jpg',
  'DSC_0029.jpg',
  'DSC_0032.jpg',
  'DSC_0039.jpg',
  'DSC_0046.jpg',
  'DSC_0057.jpg',
  'DSC_0058.jpg',
];

/*
  Structure (~15s total):
  PART 1 (0-5s):   BTS clip (rotated portrait, blur bg) with text overlays + audio
  PART 2 (5-15s):  Split screen — BTS still on left, photos cycle on right, divider slides, CTA
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

  // Text overlay — different from 45a
  var overlayCmd = 'magick -size ' + W + 'x' + H + ' xc:transparent ' +
    '-gravity North -font "/System/Library/Fonts/Supplemental/Arial Bold.ttf" ' +
    '-fill "rgba(255,255,255,0.9)" -pointsize 52 -annotate +0+260 "THE PROCESS" ' +
    '-gravity South -fill white -pointsize 72 -strokewidth 3 -stroke "rgba(0,0,0,0.6)" ' +
    '-annotate +0+500 "MANILA FREE" ' +
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

function extractBTSStill() {
  console.log('Extracting BTS still frame...');
  var stillPng = path.join(OUT_DIR, 'tmp_bts_still.png');
  // Extract a frame at 2.5s from the rotated/composited BTS clip
  var filterComplex = [
    '[0:v]transpose=1,split=2[rot1][rot2]',
    '[rot1]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,gblur=sigma=30[bg]',
    '[rot2]scale=-2:1920[fg]',
    '[bg][fg]overlay=(W-w)/2:0[comp]',
    '[comp]vignette=PI/4,curves=m=0/0 0.5/0.48 1/0.95[out]',
  ].join(';');

  var cmd = 'ffmpeg -y -ss 2.5 -i "' + BTS_CLIP + '" ' +
    '-filter_complex "' + filterComplex + '" ' +
    '-map "[out]" -frames:v 1 "' + stillPng + '"';
  execSync(cmd, { stdio: 'inherit' });
  return stillPng;
}

function buildSplitScreenHTML(btsStillData, imageDataList, photoCount) {
  var html = '<!DOCTYPE html>\n';
  html += '<html>\n<head>\n<meta charset="utf-8">\n<style>\n';
  html += '  * { margin: 0; padding: 0; box-sizing: border-box; }\n';
  html += '  body { width: ' + W + 'px; height: ' + H + 'px; overflow: hidden; background: #0a0a0a; font-family: -apple-system, system-ui, "Helvetica Neue", sans-serif; color: white; }\n';

  // Split screen container
  html += '  .split-container { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }\n';
  html += '  .left-half { position: absolute; top: 0; left: 0; width: 50%; height: 100%; overflow: hidden; }\n';
  html += '  .right-half { position: absolute; top: 0; right: 0; width: 50%; height: 100%; overflow: hidden; background: #0a0a0a; }\n';
  html += '  .bts-still { position: absolute; top: 0; left: 0; width: ' + W + 'px; height: ' + H + 'px; object-fit: cover; }\n';
  html += '  .right-photo { position: absolute; top: 0; left: 0; width: ' + W + 'px; height: ' + H + 'px; object-fit: cover; object-position: center 20%; opacity: 0; margin-left: -' + (W / 2) + 'px; }\n';
  html += '  .divider { position: absolute; top: 0; left: 50%; width: 4px; height: 100%; background: white; transform: translateX(-50%); opacity: 0; z-index: 50; box-shadow: 0 0 12px rgba(255,255,255,0.5); }\n';
  html += '  .divider.glow { box-shadow: 0 0 30px rgba(255,255,255,0.9), 0 0 60px rgba(255,255,255,0.4); }\n';

  // Labels
  html += '  .label-before { position: absolute; top: ' + (SAFE_TOP + 20) + 'px; left: 0; width: 50%; text-align: center; font-size: 24px; font-weight: 700; letter-spacing: 6px; color: rgba(255,255,255,0.7); opacity: 0; z-index: 60; }\n';
  html += '  .label-after { position: absolute; top: ' + (SAFE_TOP + 20) + 'px; right: 0; width: 50%; text-align: center; font-size: 24px; font-weight: 700; letter-spacing: 6px; color: rgba(255,255,255,0.7); opacity: 0; z-index: 60; }\n';

  // Photo counter
  html += '  .photo-counter { position: absolute; bottom: ' + (SAFE_BOTTOM + 20) + 'px; right: 0; width: 50%; text-align: center; font-size: 18px; font-weight: 600; color: rgba(255,255,255,0.4); letter-spacing: 4px; opacity: 0; z-index: 60; }\n';

  // Full-screen photo takeover
  html += '  .fullscreen-photo { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; object-position: center 20%; opacity: 0; z-index: 70; }\n';

  // CTA overlay
  html += '  .cta-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display: flex; flex-direction: column; align-items: center; justify-content: center; opacity: 0; z-index: 80; }\n';
  html += '  .cta-handle { font-size: 64px; font-weight: 900; color: #E8443A; text-align: center; opacity: 0; transform: translateY(30px); }\n';
  html += '  .cta-sub { font-size: 36px; color: rgba(255,255,255,0.7); text-align: center; margin-top: 16px; opacity: 0; transform: translateY(30px); }\n';

  html += '</style>\n</head>\n<body>\n\n';

  // Split screen
  html += '  <div class="split-container" id="splitContainer">\n';
  html += '    <div class="left-half" id="leftHalf">\n';
  html += '      <img class="bts-still" src="' + btsStillData + '" />\n';
  html += '    </div>\n';
  html += '    <div class="right-half" id="rightHalf">\n';
  for (var i = 0; i < photoCount; i++) {
    html += '      <img class="right-photo" id="photo' + i + '" src="' + imageDataList[i] + '" />\n';
  }
  html += '    </div>\n';
  html += '    <div class="divider" id="divider"></div>\n';
  html += '    <div class="label-before" id="labelBefore">BEFORE</div>\n';
  html += '    <div class="label-after" id="labelAfter">AFTER</div>\n';
  html += '    <div class="photo-counter" id="photoCounter"></div>\n';
  html += '  </div>\n\n';

  // Full-screen last photo
  html += '  <img class="fullscreen-photo" id="fullPhoto" src="' + imageDataList[photoCount - 1] + '" />\n';

  // CTA
  html += '  <div class="cta-overlay" id="ctaOverlay">\n';
  html += '    <div class="cta-handle" id="ctaHandle">@madebyaidan</div>\n';
  html += '    <div class="cta-sub" id="ctaSub">DM for a free shoot</div>\n';
  html += '  </div>\n\n';

  // Timeline
  html += '<script>\n';
  html += '  var timeline = [\n';

  // 0-1s: Split appears — left shows BTS still, right is black, divider fades in
  html += '    [0, function() {\n';
  html += '      document.getElementById("divider").style.opacity = "0";\n';
  html += '    }],\n';
  html += '    [0.3, function() {\n';
  html += '      document.getElementById("divider").style.opacity = "1";\n';
  html += '      document.getElementById("labelBefore").style.opacity = "1";\n';
  html += '    }],\n';

  // 1s: First photo fades in on right side, "AFTER" label appears
  html += '    [1.0, function() {\n';
  html += '      document.getElementById("photo0").style.opacity = "1";\n';
  html += '      document.getElementById("labelAfter").style.opacity = "1";\n';
  html += '      document.getElementById("photoCounter").style.opacity = "1";\n';
  html += '      document.getElementById("photoCounter").textContent = "1 / ' + photoCount + '";\n';
  html += '      document.getElementById("divider").classList.add("glow");\n';
  html += '    }],\n';
  html += '    [1.3, function() {\n';
  html += '      document.getElementById("divider").classList.remove("glow");\n';
  html += '    }],\n';

  // Photos cycle from 1.0s to ~7.0s (~0.85s each)
  var photoStart = 1.0;
  var photoDur = 0.85;
  for (var pi = 1; pi < photoCount; pi++) {
    var t = photoStart + pi * photoDur;
    html += '    [' + t.toFixed(2) + ', function() {\n';
    // Hide all previous photos, show current
    for (var pj = 0; pj < photoCount; pj++) {
      if (pj === pi) {
        html += '      document.getElementById("photo' + pj + '").style.opacity = "1";\n';
      } else {
        html += '      document.getElementById("photo' + pj + '").style.opacity = "0";\n';
      }
    }
    html += '      document.getElementById("photoCounter").textContent = "' + (pi + 1) + ' / ' + photoCount + '";\n';
    html += '      document.getElementById("divider").classList.add("glow");\n';
    html += '    }],\n';
    html += '    [' + (t + 0.25).toFixed(2) + ', function() {\n';
    html += '      document.getElementById("divider").classList.remove("glow");\n';
    html += '    }],\n';
  }

  // ~7s: Divider slides left, final photo takes full screen
  var dividerSlideTime = photoStart + photoCount * photoDur + 0.3;
  html += '    [' + dividerSlideTime.toFixed(2) + ', function() {\n';
  html += '      document.getElementById("divider").style.left = "0%";\n';
  html += '      document.getElementById("leftHalf").style.width = "0%";\n';
  html += '      document.getElementById("rightHalf").style.width = "100%";\n';
  html += '      document.getElementById("rightHalf").style.left = "0";\n';
  // Show last photo full width
  html += '      document.getElementById("fullPhoto").style.opacity = "1";\n';
  html += '      document.getElementById("labelBefore").style.opacity = "0";\n';
  html += '      document.getElementById("labelAfter").style.opacity = "0";\n';
  html += '      document.getElementById("photoCounter").style.opacity = "0";\n';
  html += '      document.getElementById("divider").style.opacity = "0";\n';
  html += '    }],\n';

  // CTA at ~8s
  var ctaStart = dividerSlideTime + 1.0;
  html += '    [' + ctaStart.toFixed(2) + ', function() {\n';
  html += '      document.getElementById("ctaOverlay").style.opacity = "1";\n';
  html += '    }],\n';
  html += '    [' + (ctaStart + 0.2).toFixed(2) + ', function() {\n';
  html += '      document.getElementById("ctaHandle").style.opacity = "1";\n';
  html += '      document.getElementById("ctaHandle").style.transform = "translateY(0)";\n';
  html += '    }],\n';
  html += '    [' + (ctaStart + 0.5).toFixed(2) + ', function() {\n';
  html += '      document.getElementById("ctaSub").style.opacity = "1";\n';
  html += '      document.getElementById("ctaSub").style.transform = "translateY(0)";\n';
  html += '    }],\n';
  html += '    [' + (ctaStart + 3.0).toFixed(2) + ', function() { /* end */ }]\n';

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
  console.log('=== BTS Split Screen reel v45b ===');
  resetOutputDir();

  console.log('Processing photos...');
  var processedPhotos = prepPhotos();

  console.log('Loading photos as base64...');
  var imageDataList = [];
  for (var p of processedPhotos) {
    var buf = readFileSync(p);
    imageDataList.push('data:image/jpeg;base64,' + buf.toString('base64'));
    console.log('  ' + path.basename(p) + ' (' + (buf.length / 1024).toFixed(0) + ' KB)');
  }

  var btsMp4 = buildBTSClip();

  // Extract a BTS still for the split screen left side
  var btsStillPng = extractBTSStill();
  var btsStillBuf = readFileSync(btsStillPng);
  var btsStillData = 'data:image/png;base64,' + btsStillBuf.toString('base64');
  console.log('BTS still: ' + (btsStillBuf.length / 1024).toFixed(0) + ' KB');

  // Build split screen Part 2
  console.log('=== Part 2: Split screen reveal ===');
  var photoCount = processedPhotos.length;
  var photoStart = 1.0;
  var photoDur = 0.85;
  var dividerSlideTime = photoStart + photoCount * photoDur + 0.3;
  var ctaStart = dividerSlideTime + 1.0;
  var revealDuration = Math.ceil(ctaStart + 3.0);

  var html = buildSplitScreenHTML(btsStillData, imageDataList, photoCount);
  var htmlPath = path.join(OUT_DIR, 'split-screen.html');
  writeFileSync(htmlPath, html);

  var framesDir = path.join(OUT_DIR, 'tmp-frames');
  mkdirSync(framesDir, { recursive: true });
  var totalFrames = Math.ceil(revealDuration * FPS);

  var browser = await chromium.launch();
  var page = await browser.newPage({ viewport: { width: W, height: H } });
  await page.goto('file://' + htmlPath + '?capture=1', { waitUntil: 'load' });
  await page.waitForTimeout(500);

  console.log('Capturing ' + totalFrames + ' frames (' + revealDuration + 's)...');

  for (var frame = 0; frame < totalFrames; frame++) {
    var t = frame / FPS;

    await page.evaluate(function(time) {
      // Reset state
      var divider = document.getElementById('divider');
      divider.style.opacity = '0';
      divider.style.left = '50%';
      divider.classList.remove('glow');

      var leftHalf = document.getElementById('leftHalf');
      leftHalf.style.width = '50%';
      var rightHalf = document.getElementById('rightHalf');
      rightHalf.style.width = '50%';
      rightHalf.style.left = '';
      rightHalf.style.right = '0';

      document.getElementById('labelBefore').style.opacity = '0';
      document.getElementById('labelAfter').style.opacity = '0';
      document.getElementById('photoCounter').style.opacity = '0';
      document.getElementById('photoCounter').textContent = '';

      for (var i = 0; i < 20; i++) {
        var img = document.getElementById('photo' + i);
        if (!img) break;
        img.style.opacity = '0';
      }

      document.getElementById('fullPhoto').style.opacity = '0';
      document.getElementById('ctaOverlay').style.opacity = '0';
      document.getElementById('ctaHandle').style.opacity = '0';
      document.getElementById('ctaHandle').style.transform = 'translateY(30px)';
      document.getElementById('ctaSub').style.opacity = '0';
      document.getElementById('ctaSub').style.transform = 'translateY(30px)';

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

  // Concat Part 1 + Part 2
  console.log('=== Concatenating final video ===');
  var concatTxt = path.join(OUT_DIR, 'tmp_concat.txt');
  writeFileSync(concatTxt, "file 'tmp_bts.mp4'\nfile 'tmp_reveal.mp4'\n");

  var finalMp4 = path.join(OUT_DIR, '45b-bts-split-screen.mp4');
  execSync('ffmpeg -y -f concat -safe 0 -i "' + concatTxt + '" -c copy "' + finalMp4 + '"', { stdio: 'inherit' });

  execSync('rm -f "' + OUT_DIR + '/tmp_bts.mp4" "' + OUT_DIR + '/tmp_reveal.mp4" "' + OUT_DIR + '/tmp_concat.txt" "' + OUT_DIR + '/tmp_bts_still.png" "' + OUT_DIR + '/tmp_overlay.png"');

  var reelsDir = path.join(__dirname, 'reels');
  if (!existsSync(reelsDir)) mkdirSync(reelsDir, { recursive: true });
  execSync('cp "' + finalMp4 + '" "' + path.join(reelsDir, '45b-bts-split-screen.mp4') + '"');

  var sz = statSync(finalMp4);
  console.log('Final: ' + (sz.size / (1024 * 1024)).toFixed(1) + ' MB');
  console.log('Copied to reels/45b-bts-split-screen.mp4');
  console.log('=== Done ===');
}

main().catch(function(err) {
  console.error(err);
  process.exit(1);
});
