import { chromium } from 'playwright';
import { execSync } from 'child_process';
import { mkdirSync, rmSync, existsSync, readFileSync, writeFileSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

var __dirname = path.dirname(fileURLToPath(import.meta.url));
var OUT_DIR = path.join(__dirname, 'output-46b');
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
  Structure (~15s total):
  PART 1 (0-5s):   BTS clip (rotated portrait, blur bg) with text overlays + audio
  PART 2 (5-15s):  Film roll unwind — film strip scrolls vertically with photos in frames
    5-6s:   Film strip appears with BTS still in first frame
    6-13s:  Strip scrolls up, each frame shows a photo (~1s per frame), frame numbers
    13-14s: Last photo zooms to fill screen
    14-15s: CTA — @madebyaidan / DM for a free shoot
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

function extractBTSStill() {
  console.log('Extracting BTS still frame...');
  var stillPath = path.join(OUT_DIR, 'tmp_bts_still.jpg');
  // Extract a frame at 2s, rotate it, and make it portrait
  execSync(
    'ffmpeg -y -ss 2 -i "' + BTS_CLIP + '" -vframes 1 ' +
    '-vf "transpose=1,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920" ' +
    '-q:v 2 "' + stillPath + '"',
    { stdio: 'pipe' }
  );
  return stillPath;
}

function buildBTSClip() {
  console.log('=== Part 1: BTS clip with overlays ===');
  var btsMp4 = path.join(OUT_DIR, 'tmp_bts.mp4');
  var overlayPng = path.join(OUT_DIR, 'tmp_overlay.png');

  // Text overlay
  var overlayCmd = 'magick -size ' + W + 'x' + H + ' xc:transparent ' +
    '-gravity North -font "/System/Library/Fonts/Supplemental/Arial Bold.ttf" ' +
    '-fill "rgba(255,255,255,0.9)" -pointsize 52 -annotate +0+260 "ON SET" ' +
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

function buildFilmRollHTML(imageDataList, btsStillData, photoCount) {
  // Film strip dimensions
  var STRIP_W = 900;           // width of the film strip
  var SPROCKET_MARGIN = 48;    // margin for sprocket holes on each side
  var FRAME_W = STRIP_W - SPROCKET_MARGIN * 2; // image frame width
  var FRAME_H = 600;           // image frame height
  var FRAME_GAP = 80;          // gap between frames (for frame numbers)
  var FRAME_STRIDE = FRAME_H + FRAME_GAP;
  var SPROCKET_W = 24;
  var SPROCKET_H = 36;
  var SPROCKET_SPACING = 60;
  var TOTAL_FRAMES = photoCount + 1; // BTS still + 6 photos
  var STRIP_H = TOTAL_FRAMES * FRAME_STRIDE + 400; // total height of film strip

  var html = '<!DOCTYPE html>\n';
  html += '<html>\n<head>\n<meta charset="utf-8">\n<style>\n';
  html += '  * { margin: 0; padding: 0; box-sizing: border-box; }\n';
  html += '  body { width: ' + W + 'px; height: ' + H + 'px; overflow: hidden; background: #0a0a0a; font-family: -apple-system, system-ui, "Helvetica Neue", sans-serif; color: white; }\n';

  // Film grain overlay
  html += '  .grain { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 50; pointer-events: none; opacity: 0.08; background-image: url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E"); }\n';

  // Film strip container
  html += '  .film-strip-wrapper { position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; justify-content: center; overflow: hidden; }\n';
  html += '  .film-strip { position: absolute; width: ' + STRIP_W + 'px; background: #1a1a1a; }\n';

  // Sprocket holes
  html += '  .sprocket { position: absolute; width: ' + SPROCKET_W + 'px; height: ' + SPROCKET_H + 'px; background: rgba(255,255,255,0.12); border-radius: 4px; }\n';
  html += '  .sprocket-left { left: 10px; }\n';
  html += '  .sprocket-right { right: 10px; }\n';

  // Photo frames inside strip
  html += '  .film-frame { position: absolute; left: ' + SPROCKET_MARGIN + 'px; width: ' + FRAME_W + 'px; height: ' + FRAME_H + 'px; background: #111; overflow: hidden; }\n';
  html += '  .film-frame img { width: 100%; height: 100%; object-fit: cover; }\n';

  // Frame numbers
  html += '  .frame-num { position: absolute; left: ' + (SPROCKET_MARGIN + 8) + 'px; font-family: "Courier New", monospace; font-size: 14px; color: rgba(255,255,255,0.3); letter-spacing: 2px; }\n';

  // Last photo zoom overlay
  html += '  .zoom-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 30; opacity: 0; display: flex; align-items: center; justify-content: center; background: #0a0a0a; }\n';
  html += '  .zoom-overlay img { width: 100%; height: 100%; object-fit: cover; }\n';

  // CTA scene
  html += '  .cta-scene { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 40; opacity: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #0a0a0a; }\n';

  html += '</style>\n</head>\n<body>\n\n';

  // Film strip element
  html += '  <div class="film-strip-wrapper">\n';
  html += '    <div class="film-strip" id="filmStrip" style="height: ' + STRIP_H + 'px; top: ' + H + 'px;">\n';

  // Generate sprocket holes along the entire strip
  var numSprockets = Math.ceil(STRIP_H / SPROCKET_SPACING);
  for (var si = 0; si < numSprockets; si++) {
    var sy = 20 + si * SPROCKET_SPACING;
    html += '      <div class="sprocket sprocket-left" style="top: ' + sy + 'px;"></div>\n';
    html += '      <div class="sprocket sprocket-right" style="top: ' + sy + 'px;"></div>\n';
  }

  // BTS still as first frame
  var frameY0 = 100;
  html += '      <div class="film-frame" style="top: ' + frameY0 + 'px;"><img src="' + btsStillData + '" /></div>\n';
  html += '      <div class="frame-num" style="top: ' + (frameY0 + FRAME_H + 8) + 'px;">46B-00  BTS</div>\n';

  // Photo frames
  for (var i = 0; i < photoCount; i++) {
    var fy = frameY0 + (i + 1) * FRAME_STRIDE;
    html += '      <div class="film-frame" style="top: ' + fy + 'px;"><img src="' + imageDataList[i] + '" /></div>\n';
    html += '      <div class="frame-num" style="top: ' + (fy + FRAME_H + 8) + 'px;">46B-' + String(i + 1).padStart(2, '0') + '</div>\n';
  }

  html += '    </div>\n';
  html += '  </div>\n\n';

  // Zoom overlay for last photo
  html += '  <div class="zoom-overlay" id="zoomOverlay"><img src="' + imageDataList[photoCount - 1] + '" /></div>\n';

  // CTA scene
  html += '  <div class="cta-scene" id="ctaScene">\n';
  html += '    <div id="ctaHandle" style="font-size:64px;font-weight:900;color:#E8443A;text-align:center;opacity:0;">@madebyaidan</div>\n';
  html += '    <div id="ctaSub" style="font-size:32px;color:rgba(255,255,255,0.6);text-align:center;margin-top:20px;opacity:0;">DM for a free shoot</div>\n';
  html += '  </div>\n\n';

  // Film grain
  html += '  <div class="grain"></div>\n\n';

  // Script
  html += '<script>\n';
  html += '  var strip = document.getElementById("filmStrip");\n';
  html += '  var STRIP_H = ' + STRIP_H + ';\n';
  html += '  var FRAME_STRIDE = ' + FRAME_STRIDE + ';\n';
  html += '  var FRAME_Y0 = ' + frameY0 + ';\n';
  html += '  var H = ' + H + ';\n';
  html += '  var PHOTO_COUNT = ' + photoCount + ';\n\n';

  // Timeline:
  // 0-1s: strip slides into view, first frame (BTS) centered
  // 1-8s: strip scrolls up, each photo frame scrolls into center (~1s per frame)
  // 8-9s: last photo zooms to fill
  // 9-10s: CTA

  html += '  var timeline = [];\n\n';

  // Helper: position strip so frame N is centered
  // frame center Y on strip = FRAME_Y0 + n * FRAME_STRIDE + FRAME_H/2
  // We want that at H/2 on screen
  // strip.top = H/2 - (FRAME_Y0 + n * FRAME_STRIDE + FRAME_H/2)

  html += '  function frameCenterTop(n) {\n';
  html += '    return H / 2 - (FRAME_Y0 + n * FRAME_STRIDE + ' + (FRAME_H / 2) + ');\n';
  html += '  }\n\n';

  // 0s: strip starts off screen bottom (top = H)
  // 0-1s: strip slides up so BTS frame (n=0) is centered
  html += '  timeline.push([0, function() {\n';
  html += '    strip.style.top = H + "px";\n';
  html += '  }]);\n\n';

  // Smooth scroll: we'll set positions at fine intervals
  // Phase 1: 0-1s, slide in to show BTS frame
  var stepsPerSec = 15; // timeline entries per second for smooth scrolling
  for (var s = 1; s <= stepsPerSec; s++) {
    var tVal = (s / stepsPerSec).toFixed(3);
    html += '  timeline.push([' + tVal + ', function() {\n';
    html += '    var progress = ' + (s / stepsPerSec) + ';\n';
    html += '    var startY = H;\n';
    html += '    var endY = frameCenterTop(0);\n';
    html += '    var ease = 1 - Math.pow(1 - progress, 3);\n';
    html += '    strip.style.top = (startY + (endY - startY) * ease) + "px";\n';
    html += '  }]);\n';
  }

  // Phase 2: 1-8s, scroll through all frames (BTS + 6 photos = 7 frames)
  // Each frame gets ~1s
  var scrollStart = 1.0;
  var scrollEnd = 8.0;
  var scrollDur = scrollEnd - scrollStart;
  var scrollSteps = Math.round(scrollDur * stepsPerSec);

  for (var ss = 0; ss <= scrollSteps; ss++) {
    var tScroll = scrollStart + (ss / scrollSteps) * scrollDur;
    var frac = ss / scrollSteps;
    html += '  timeline.push([' + tScroll.toFixed(3) + ', function() {\n';
    html += '    var frac = ' + frac.toFixed(4) + ';\n';
    html += '    var frameIdx = frac * ' + TOTAL_FRAMES + ';\n';
    // Use easeInOut for each frame transition
    html += '    var startTop = frameCenterTop(0);\n';
    html += '    var endTop = frameCenterTop(' + (TOTAL_FRAMES - 1) + ');\n';
    html += '    var t = startTop + (endTop - startTop) * frac;\n';
    html += '    strip.style.top = t + "px";\n';
    html += '  }]);\n';
  }

  // Phase 3: 8-9s, zoom last photo
  html += '  timeline.push([8.0, function() {\n';
  html += '    document.getElementById("zoomOverlay").style.opacity = "1";\n';
  html += '  }]);\n\n';

  // Phase 4: 9-10s, CTA
  html += '  timeline.push([9.0, function() {\n';
  html += '    document.getElementById("zoomOverlay").style.opacity = "0";\n';
  html += '    document.getElementById("ctaScene").style.opacity = "1";\n';
  html += '    document.getElementById("ctaHandle").style.opacity = "1";\n';
  html += '  }]);\n';
  html += '  timeline.push([9.3, function() {\n';
  html += '    document.getElementById("ctaSub").style.opacity = "1";\n';
  html += '  }]);\n';
  html += '  timeline.push([10.0, function() { /* end */ }]);\n\n';

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
  console.log('=== BTS Film Roll Unwind reel v46b ===');
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

  // Build BTS clip (Part 1)
  var btsMp4 = buildBTSClip();

  // Extract a BTS still for the first film frame
  var btsStillPath = extractBTSStill();
  var btsStillBuf = readFileSync(btsStillPath);
  var btsStillData = 'data:image/jpeg;base64,' + btsStillBuf.toString('base64');

  console.log('=== Part 2: Film roll unwind ===');
  var revealDuration = 10; // 10s for film roll section
  var html = buildFilmRollHTML(imageDataList, btsStillData, processedPhotos.length);
  var htmlPath = path.join(OUT_DIR, 'filmroll.html');
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
      // Reset state
      var strip = document.getElementById('filmStrip');
      if (strip) strip.style.top = window.innerHeight + 'px';

      document.getElementById('zoomOverlay').style.opacity = '0';
      document.getElementById('ctaScene').style.opacity = '0';
      document.getElementById('ctaHandle').style.opacity = '0';
      document.getElementById('ctaSub').style.opacity = '0';

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

  var finalMp4 = path.join(OUT_DIR, '46b-bts-film-roll.mp4');
  execSync('ffmpeg -y -f concat -safe 0 -i "' + concatTxt + '" -c copy "' + finalMp4 + '"', { stdio: 'inherit' });

  execSync('rm -f "' + OUT_DIR + '/tmp_bts.mp4" "' + OUT_DIR + '/tmp_reveal.mp4" "' + OUT_DIR + '/tmp_concat.txt"');

  var reelsDir = path.join(__dirname, 'reels');
  if (!existsSync(reelsDir)) mkdirSync(reelsDir, { recursive: true });
  execSync('cp "' + finalMp4 + '" "' + path.join(reelsDir, '46b-bts-film-roll.mp4') + '"');

  var sz = statSync(finalMp4);
  console.log('Final: ' + (sz.size / (1024 * 1024)).toFixed(1) + ' MB');
  console.log('Copied to reels/46b-bts-film-roll.mp4');
  console.log('=== Done ===');
}

main().catch(function(err) {
  console.error(err);
  process.exit(1);
});
