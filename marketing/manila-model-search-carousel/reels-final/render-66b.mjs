import { chromium } from 'playwright';
import { execSync } from 'child_process';
import { mkdirSync, rmSync, existsSync, readFileSync, writeFileSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

var __dirname = path.dirname(fileURLToPath(import.meta.url));
var OUT_DIR = path.join(__dirname, 'output-66b');

var W = 1080;
var H = 1920;
var FPS = 30;
var TOTAL_DURATION = 15;
var TOTAL_FRAMES = FPS * TOTAL_DURATION; // 450 frames

var SAFE_TOP = 213;
var SAFE_BOTTOM = 430;

var FILM_SCANS_DIR = '/Volumes/PortableSSD/Exports/film scans';
var PHOTO_NAMES = [
  'DSC_0943.jpg',
  'DSC_0945.jpg',
  'DSC_0951.jpg',
  'DSC_0956.jpg',
  'DSC_0957.jpg',
  'DSC_0960.jpg',
  'DSC_0962.jpg',
  'DSC_0964.jpg',
  'DSC_0967.jpg',
  'DSC_0977.jpg',
];

function resetOutputDir() {
  rmSync(OUT_DIR, { recursive: true, force: true });
  mkdirSync(OUT_DIR, { recursive: true });
}

function processPhotos() {
  var cropDir = path.join(OUT_DIR, 'tmp-photos');
  mkdirSync(cropDir, { recursive: true });
  var processed = {};
  for (var name of PHOTO_NAMES) {
    var src = path.join(FILM_SCANS_DIR, name);
    if (!existsSync(src)) {
      console.error('Photo not found: ' + src);
      process.exit(1);
    }
    var dst = path.join(cropDir, name.replace(/\.jpg$/i, '_processed.jpg'));
    execSync('magick "' + src + '" -shave 500x600 +repage -auto-level -quality 95 "' + dst + '"', { stdio: 'pipe' });
    var buf = readFileSync(dst);
    processed[name] = 'data:image/jpeg;base64,' + buf.toString('base64');
    console.log('  Processed: ' + name + ' (' + (buf.length / 1024).toFixed(0) + ' KB)');
  }
  return processed;
}

function buildHTML(imageDataMap) {
  // Use 5 photos for the booth strip (pick varied ones)
  var boothPhotos = [PHOTO_NAMES[0], PHOTO_NAMES[2], PHOTO_NAMES[5], PHOTO_NAMES[7], PHOTO_NAMES[9]];
  var imgDataJSON = JSON.stringify(boothPhotos.map(function(name) {
    return imageDataMap[name];
  }));

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { margin: 0; padding: 0; background: #1a1a1a; overflow: hidden; }

  #root {
    width: ${W}px;
    height: ${H}px;
    position: relative;
    overflow: hidden;
    background: #1a1a1a;
    font-family: 'Courier New', monospace;
  }

  /* Curtain panels */
  .curtain {
    position: absolute;
    top: 0;
    width: 55%;
    height: 100%;
    z-index: 80;
  }
  #curtain-left {
    left: 0;
    background: linear-gradient(90deg, #3d0c0c 0%, #6b1a1a 20%, #4a1010 40%, #6b1a1a 60%, #551515 80%, #3d0c0c 100%);
    border-right: 4px solid #2a0808;
  }
  #curtain-right {
    right: 0;
    background: linear-gradient(90deg, #3d0c0c 0%, #551515 20%, #6b1a1a 40%, #4a1010 60%, #6b1a1a 80%, #3d0c0c 100%);
    border-left: 4px solid #2a0808;
  }
  /* Curtain folds / drape texture */
  .curtain::before {
    content: '';
    position: absolute;
    top: 0; bottom: 0;
    width: 100%;
    background: repeating-linear-gradient(
      90deg,
      transparent,
      transparent 35px,
      rgba(0,0,0,0.12) 35px,
      rgba(0,0,0,0.12) 37px,
      transparent 37px,
      transparent 70px
    );
  }
  .curtain::after {
    content: '';
    position: absolute;
    top: 0; bottom: 0;
    width: 100%;
    background: linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 15%, transparent 85%, rgba(0,0,0,0.2) 100%);
  }
  /* Curtain rod */
  #curtain-rod {
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 28px;
    background: linear-gradient(180deg, #a0763c, #6b4f2a 50%, #4a3618);
    z-index: 85;
    border-bottom: 2px solid #3a1a05;
    box-shadow: 0 4px 16px rgba(0,0,0,0.6);
  }

  /* Booth title */
  #booth-title {
    position: absolute;
    top: ${SAFE_TOP + 40}px;
    left: 0; right: 0;
    text-align: center;
    z-index: 90;
    opacity: 0;
  }
  #booth-title-text {
    font-size: 58px;
    font-weight: 900;
    color: #f5e6c8;
    letter-spacing: 8px;
    text-shadow: 3px 3px 6px rgba(0,0,0,0.9), 0 0 30px rgba(139,69,19,0.4);
    text-transform: uppercase;
  }
  #booth-title-sub {
    font-size: 20px;
    color: #c9a96e;
    letter-spacing: 14px;
    margin-top: 10px;
    text-transform: uppercase;
    text-shadow: 1px 1px 3px rgba(0,0,0,0.8);
  }

  /* Countdown number */
  #countdown {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 70;
    opacity: 0;
    pointer-events: none;
  }
  #countdown-num {
    font-size: 300px;
    font-weight: 900;
    color: #ff3333;
    text-shadow: 0 0 80px rgba(255,50,50,0.7), 0 0 160px rgba(255,50,50,0.3), 0 4px 8px rgba(0,0,0,0.5);
    font-family: 'Courier New', monospace;
    line-height: 1;
    text-align: center;
  }

  /* Flash overlay */
  #flash {
    position: absolute;
    inset: 0;
    background: #fff;
    z-index: 100;
    opacity: 0;
    pointer-events: none;
  }

  /* Photo strip container - the visible printing area */
  #strip-container {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    width: 540px;
    z-index: 50;
    opacity: 0;
  }
  #strip {
    background: #fff;
    padding: 30px 30px 50px;
    border-radius: 4px;
    box-shadow: 0 10px 50px rgba(0,0,0,0.7), 0 2px 10px rgba(0,0,0,0.3);
    position: relative;
  }

  /* Individual photo frame in strip */
  .strip-photo {
    width: 480px;
    height: 300px;
    background: #e0e0e0;
    margin-bottom: 14px;
    overflow: hidden;
    opacity: 0;
    position: relative;
    border: 1px solid #ccc;
  }
  .strip-photo:last-of-type {
    margin-bottom: 0;
  }
  .strip-photo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  /* Strip bottom label */
  #strip-label {
    text-align: center;
    padding-top: 20px;
    font-size: 13px;
    letter-spacing: 8px;
    color: #999;
    text-transform: uppercase;
    font-family: 'Courier New', monospace;
  }

  /* Insert coin text */
  #insert-text {
    position: absolute;
    bottom: ${SAFE_BOTTOM + 120}px;
    left: 0; right: 0;
    text-align: center;
    z-index: 60;
    opacity: 0;
  }
  #insert-text-inner {
    display: inline-block;
    background: #111;
    border: 2px solid #333;
    padding: 18px 44px;
    border-radius: 10px;
    font-size: 34px;
    color: #4ade80;
    letter-spacing: 5px;
    font-family: 'Courier New', monospace;
    text-shadow: 0 0 15px rgba(74,222,128,0.6);
    box-shadow: 0 0 20px rgba(74,222,128,0.15);
  }

  /* CTA overlay */
  #cta {
    position: absolute;
    bottom: ${SAFE_BOTTOM + 60}px;
    left: 0; right: 0;
    text-align: center;
    z-index: 60;
    opacity: 0;
  }
  #cta-handle {
    font-size: 52px;
    font-weight: 700;
    color: #fff;
    letter-spacing: 4px;
    margin-bottom: 14px;
    text-shadow: 0 3px 10px rgba(0,0,0,0.6);
  }
  #cta-sub {
    font-size: 24px;
    color: #c9a96e;
    letter-spacing: 5px;
    text-transform: uppercase;
  }

  /* Vignette overlay */
  #vignette {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%);
    z-index: 45;
    pointer-events: none;
  }
</style>
</head>
<body>
<div id="root">

  <!-- Curtain -->
  <div id="curtain-rod"></div>
  <div id="curtain-left" class="curtain"></div>
  <div id="curtain-right" class="curtain"></div>

  <!-- Booth title -->
  <div id="booth-title">
    <div id="booth-title-text">MANILA</div>
    <div id="booth-title-sub">FREE PHOTO SHOOT</div>
  </div>

  <!-- Countdown -->
  <div id="countdown">
    <div id="countdown-num">3</div>
  </div>

  <!-- Flash -->
  <div id="flash"></div>

  <!-- Vignette -->
  <div id="vignette"></div>

  <!-- Photo strip -->
  <div id="strip-container">
    <div id="strip">
      <div id="sp-0" class="strip-photo"><img id="sp-img-0" src="" alt=""/></div>
      <div id="sp-1" class="strip-photo"><img id="sp-img-1" src="" alt=""/></div>
      <div id="sp-2" class="strip-photo"><img id="sp-img-2" src="" alt=""/></div>
      <div id="sp-3" class="strip-photo"><img id="sp-img-3" src="" alt=""/></div>
      <div id="strip-label">MANILA FREE PHOTO SHOOT · 2026</div>
    </div>
  </div>

  <!-- Insert coin -->
  <div id="insert-text">
    <div id="insert-text-inner">INSERT $0.00 - IT'S FREE!</div>
  </div>

  <!-- CTA -->
  <div id="cta">
    <div id="cta-handle">@madebyaidan</div>
    <div id="cta-sub">DM for your free session</div>
  </div>

</div>

<script>
  var W = ${W};
  var H = ${H};
  var SAFE_TOP = ${SAFE_TOP};
  var SAFE_BOTTOM = ${SAFE_BOTTOM};
  var SAFE_H = H - SAFE_TOP - SAFE_BOTTOM;
  var IMG_DATA = ${imgDataJSON};

  // Inject images
  for (var i = 0; i < 4; i++) {
    var img = document.getElementById('sp-img-' + i);
    if (img && IMG_DATA[i]) img.src = IMG_DATA[i];
  }

  // Easing helpers
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function easeIn(t) { return Math.pow(t, 3); }
  function easeInOut(t) { return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2; }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function lerp(a, b, t) { return a + (b - a) * clamp(t, 0, 1); }
  function prog(t, start, end) { return clamp((t - start) / (end - start), 0, 1); }

  /*
    Timeline (~15s):
    0-1.0s:    Curtain opens, booth title visible
    1.0-1.8s:  Countdown "3... 2... 1..."
    1.8-2.3s:  FLASH! -> first photo appears in strip
    2.3-3.3s:  Quick countdown -> FLASH -> photo 2
    3.3-4.1s:  Quicker countdown -> FLASH -> photo 3
    4.1-4.7s:  Quickest countdown -> FLASH -> photo 4
    4.7-6.5s:  Strip slides to settle, printing sound
    6.5-10.0s: Strip settled, all 4 photos visible in classic layout
    10.0-12.0s: Full strip centered nicely
    12.0-13.0s: "Insert $0.00" text appears
    13.0-15.0s: CTA - @madebyaidan / DM for free session
  */

  // Shot schedule: [countdownStart, flashTime, photoIndex]
  var SHOTS = [
    { countStart: 1.0, flash: 1.8,  photoIdx: 0 },
    { countStart: 2.4, flash: 3.1,  photoIdx: 1 },
    { countStart: 3.4, flash: 3.9,  photoIdx: 2 },
    { countStart: 4.2, flash: 4.6,  photoIdx: 3 },
  ];

  // Strip dimensions
  var PHOTO_SLOT_H = 314; // 300 + 14 margin
  var STRIP_PAD_TOP = 30;
  var STRIP_PAD_BOT = 50;
  var STRIP_FULL_H = 4 * 300 + 3 * 14 + STRIP_PAD_TOP + STRIP_PAD_BOT + 40; // ~1362

  // Final position: centered in safe zone
  var CENTER_Y = SAFE_TOP + SAFE_H / 2;

  window.__applyUpTo = function(t) {

    // ---- Curtain ----
    var curtainL = document.getElementById('curtain-left');
    var curtainR = document.getElementById('curtain-right');
    var curtainRod = document.getElementById('curtain-rod');

    if (t < 0.15) {
      curtainL.style.transform = 'translateX(0)';
      curtainR.style.transform = 'translateX(0)';
      curtainRod.style.opacity = '1';
    } else if (t < 1.0) {
      var cp = easeInOut(prog(t, 0.15, 1.0));
      curtainL.style.transform = 'translateX(' + (-cp * 100) + '%)';
      curtainR.style.transform = 'translateX(' + (cp * 100) + '%)';
      curtainRod.style.opacity = String(1 - easeIn(prog(t, 0.5, 1.0)));
    } else {
      curtainL.style.transform = 'translateX(-100%)';
      curtainR.style.transform = 'translateX(100%)';
      curtainRod.style.opacity = '0';
    }

    // ---- Booth title ----
    var boothTitle = document.getElementById('booth-title');
    if (t < 0.3) {
      boothTitle.style.opacity = '0';
    } else if (t < 0.8) {
      boothTitle.style.opacity = String(easeOut(prog(t, 0.3, 0.8)));
    } else if (t < 4.5) {
      boothTitle.style.opacity = '1';
    } else if (t < 5.0) {
      boothTitle.style.opacity = String(1 - easeIn(prog(t, 4.5, 5.0)));
    } else {
      boothTitle.style.opacity = '0';
    }

    // ---- Countdown numbers ----
    var countdown = document.getElementById('countdown');
    var countNum = document.getElementById('countdown-num');
    var showingCountdown = false;

    for (var si = 0; si < SHOTS.length; si++) {
      var shot = SHOTS[si];
      if (t >= shot.countStart && t < shot.flash) {
        showingCountdown = true;
        var countDur = shot.flash - shot.countStart;
        var frac = (t - shot.countStart) / countDur;

        // Determine which number to show
        if (si === 0) {
          // Full: 3, 2, 1
          if (frac < 0.33) countNum.textContent = '3';
          else if (frac < 0.66) countNum.textContent = '2';
          else countNum.textContent = '1';
        } else if (si === 1) {
          // Medium: 3, 2, 1
          if (frac < 0.33) countNum.textContent = '3';
          else if (frac < 0.66) countNum.textContent = '2';
          else countNum.textContent = '1';
        } else {
          // Fast: 2, 1
          if (frac < 0.5) countNum.textContent = '2';
          else countNum.textContent = '1';
        }

        // Scale pop each time number changes
        var numChanges = si <= 1 ? 3 : 2;
        var numFrac = (frac * numChanges) % 1;
        var numScale = lerp(1.6, 1.0, easeOut(numFrac));
        var numOpacity = lerp(0.3, 1.0, easeOut(Math.min(numFrac * 3, 1)));
        countdown.style.opacity = String(numOpacity);
        countNum.style.transform = 'scale(' + numScale + ')';
        break;
      }
    }
    if (!showingCountdown) {
      countdown.style.opacity = '0';
    }

    // ---- Flash effect ----
    var flash = document.getElementById('flash');
    var flashOpacity = 0;
    for (var fi = 0; fi < SHOTS.length; fi++) {
      var ft = SHOTS[fi].flash;
      if (t >= ft && t < ft + 0.35) {
        var fp = prog(t, ft, ft + 0.35);
        if (fp < 0.1) {
          flashOpacity = Math.max(flashOpacity, easeOut(fp / 0.1));
        } else {
          flashOpacity = Math.max(flashOpacity, 1 - easeOut((fp - 0.1) / 0.9));
        }
      }
    }
    flash.style.opacity = String(flashOpacity);

    // ---- Strip container visibility ----
    var stripContainer = document.getElementById('strip-container');
    var firstFlash = SHOTS[0].flash;
    if (t < firstFlash + 0.15) {
      stripContainer.style.opacity = '0';
    } else if (t < firstFlash + 0.4) {
      stripContainer.style.opacity = String(easeOut(prog(t, firstFlash + 0.15, firstFlash + 0.4)));
    } else {
      stripContainer.style.opacity = '1';
    }

    // ---- Count visible photos ----
    var visiblePhotos = 0;
    for (var vi = 0; vi < SHOTS.length; vi++) {
      if (t >= SHOTS[vi].flash + 0.15) visiblePhotos = vi + 1;
    }

    // ---- Strip vertical position (slides down as photos added, like printing) ----
    // Initially show only top portion, then slide to reveal more
    var stripTop;
    var onePhotoCenter = CENTER_Y - STRIP_PAD_TOP - 150; // center first photo

    if (visiblePhotos <= 0) {
      stripTop = onePhotoCenter;
    } else if (visiblePhotos === 1) {
      stripTop = onePhotoCenter;
    } else if (visiblePhotos === 2) {
      stripTop = onePhotoCenter - PHOTO_SLOT_H * 0.5;
    } else if (visiblePhotos === 3) {
      stripTop = onePhotoCenter - PHOTO_SLOT_H * 1.0;
    } else {
      stripTop = onePhotoCenter - PHOTO_SLOT_H * 1.5;
    }

    // Smooth transitions for strip movement
    // Track target positions at each shot time for smooth lerping
    for (var mi = 1; mi < SHOTS.length; mi++) {
      var moveStart = SHOTS[mi].flash + 0.15;
      var moveEnd = moveStart + 0.6;
      if (t >= moveStart && t < moveEnd) {
        var prevTop;
        if (mi === 1) prevTop = onePhotoCenter;
        else if (mi === 2) prevTop = onePhotoCenter - PHOTO_SLOT_H * 0.5;
        else prevTop = onePhotoCenter - PHOTO_SLOT_H * 1.0;

        var nextTop;
        if (mi === 1) nextTop = onePhotoCenter - PHOTO_SLOT_H * 0.5;
        else if (mi === 2) nextTop = onePhotoCenter - PHOTO_SLOT_H * 1.0;
        else nextTop = onePhotoCenter - PHOTO_SLOT_H * 1.5;

        stripTop = lerp(prevTop, nextTop, easeOut(prog(t, moveStart, moveEnd)));
      }
    }

    // After all photos: settle to final centered position
    var finalTop = SAFE_TOP + 30;
    if (t >= 6.0 && t < 8.0) {
      var lastPos = onePhotoCenter - PHOTO_SLOT_H * 1.5;
      stripTop = lerp(lastPos, finalTop, easeInOut(prog(t, 6.0, 8.0)));
    } else if (t >= 8.0) {
      stripTop = finalTop;
    }

    stripContainer.style.top = stripTop + 'px';

    // ---- Individual photo appearance (pop in after flash) ----
    for (var pi = 0; pi < 4; pi++) {
      var sp = document.getElementById('sp-' + pi);
      if (!sp) continue;
      var shotTime = SHOTS[pi].flash + 0.15;

      if (t < shotTime) {
        sp.style.opacity = '0';
        sp.style.transform = 'scale(1.08)';
      } else if (t < shotTime + 0.25) {
        var pp = easeOut(prog(t, shotTime, shotTime + 0.25));
        sp.style.opacity = String(pp);
        sp.style.transform = 'scale(' + lerp(1.08, 1.0, pp) + ')';
      } else {
        sp.style.opacity = '1';
        sp.style.transform = 'scale(1)';
      }
    }

    // ---- Insert $0.00 text ----
    var insertText = document.getElementById('insert-text');
    if (t >= 11.5 && t < 13.0) {
      if (t < 12.0) {
        insertText.style.opacity = String(easeOut(prog(t, 11.5, 12.0)));
      } else if (t < 12.8) {
        insertText.style.opacity = '1';
      } else {
        insertText.style.opacity = String(1 - easeIn(prog(t, 12.8, 13.0)));
      }
    } else {
      insertText.style.opacity = '0';
    }

    // ---- CTA ----
    var cta = document.getElementById('cta');
    if (t >= 13.0) {
      cta.style.opacity = String(easeOut(prog(t, 13.0, 13.6)));
    } else {
      cta.style.opacity = '0';
    }

    // ---- Subtle strip breathing when settled (9-15s) ----
    if (t >= 9.0 && t <= 15.0) {
      var breathe = Math.sin(t * 1.2) * 1.5;
      var currentTop = parseFloat(stripContainer.style.top) || finalTop;
      stripContainer.style.top = (currentTop + breathe) + 'px';
    }

  };

  if (location.search.includes('capture=1')) {
    var s = document.createElement('style');
    s.textContent = '*, *::before, *::after { transition-duration: 0s !important; animation-duration: 0.001s !important; }';
    document.head.appendChild(s);
  }
</script>
</body>
</html>`;
}

async function main() {
  console.log('=== Manila Photo Booth Strip Reel v66a ===');
  resetOutputDir();

  console.log('Processing photos...');
  var imageDataMap = processPhotos();

  var html = buildHTML(imageDataMap);
  var htmlPath = path.join(OUT_DIR, 'index.html');
  writeFileSync(htmlPath, html);

  var framesDir = path.join(OUT_DIR, 'tmp-frames');
  mkdirSync(framesDir, { recursive: true });

  var browser = await chromium.launch();
  var page = await browser.newPage({ viewport: { width: W, height: H } });
  await page.goto('file://' + htmlPath + '?capture=1', { waitUntil: 'load' });
  await page.waitForTimeout(600);

  console.log('Capturing ' + TOTAL_FRAMES + ' frames...');

  for (var frame = 0; frame < TOTAL_FRAMES; frame++) {
    var t = frame / FPS;
    await page.evaluate(function(time) { window.__applyUpTo(time); }, t);
    await page.waitForTimeout(2);
    var padded = String(frame).padStart(5, '0');
    await page.screenshot({ path: path.join(framesDir, 'frame_' + padded + '.png'), type: 'png' });
    if (frame % (FPS * 4) === 0) {
      console.log('  ' + t.toFixed(1) + 's / ' + TOTAL_DURATION + 's');
    }
  }

  await browser.close();
  console.log('All frames captured');

  var outputMp4 = path.join(OUT_DIR, '66b-photo-booth.mp4');
  execSync(
    'ffmpeg -y -framerate ' + FPS + ' -i "' + path.join(framesDir, 'frame_%05d.png') + '" ' +
    '-c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r ' + FPS + ' -an "' + outputMp4 + '"',
    { stdio: 'inherit' }
  );

  rmSync(framesDir, { recursive: true, force: true });

  var reelsDir = path.join(__dirname, 'reels');
  if (!existsSync(reelsDir)) mkdirSync(reelsDir, { recursive: true });
  execSync('cp "' + outputMp4 + '" "' + path.join(reelsDir, '66b-photo-booth.mp4') + '"');

  var sz = statSync(outputMp4);
  console.log('Final: ' + (sz.size / (1024 * 1024)).toFixed(1) + ' MB');
  console.log('Copied to reels/66b-photo-booth.mp4');
  console.log('=== Done ===');
}

main().catch(function(err) {
  console.error(err);
  process.exit(1);
});
