import { chromium } from 'playwright';
import { execSync } from 'child_process';
import { mkdirSync, rmSync, existsSync, readFileSync, writeFileSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

var __dirname = path.dirname(fileURLToPath(import.meta.url));
var OUT_DIR = path.join(__dirname, 'output-67a');

var W = 1080;
var H = 1920;
var FPS = 30;
var TOTAL_FRAMES = 420; // 14s at 30fps
var TOTAL_DURATION = 14;

var FILM_SCANS_DIR = '/Volumes/PortableSSD/Exports/film scans';
var PHOTO_NAMES = [
  'DSC_0718.jpg',
  'DSC_0723.jpg',
  'DSC_0726.jpg',
  'DSC_0728.jpg',
  'DSC_0732.jpg',
  'DSC_0739.jpg',
  'DSC_0740.jpg',
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
  var photoCount = PHOTO_NAMES.length;

  // Build image elements for each photo - 3 copies each for RGB split
  var photoLayers = PHOTO_NAMES.map(function(name, i) {
    return `
      <div id="photo-group-${i}" class="photo-group" style="position:absolute;inset:0;opacity:0;">
        <!-- Red channel -->
        <img id="photo-r-${i}" src="${imageDataMap[name]}" style="
          position:absolute;inset:0;width:100%;height:100%;object-fit:cover;
          mix-blend-mode:screen;
          filter:saturate(0) brightness(1) sepia(1) hue-rotate(-30deg) saturate(3);
          opacity:0.7;
        " />
        <!-- Green channel -->
        <img id="photo-g-${i}" src="${imageDataMap[name]}" style="
          position:absolute;inset:0;width:100%;height:100%;object-fit:cover;
          mix-blend-mode:screen;
          filter:saturate(0) brightness(1) sepia(1) hue-rotate(80deg) saturate(3);
          opacity:0.7;
        " />
        <!-- Blue channel -->
        <img id="photo-b-${i}" src="${imageDataMap[name]}" style="
          position:absolute;inset:0;width:100%;height:100%;object-fit:cover;
          mix-blend-mode:screen;
          filter:saturate(0) brightness(1) sepia(1) hue-rotate(200deg) saturate(3);
          opacity:0.7;
        " />
        <!-- Clean version on top -->
        <img id="photo-clean-${i}" src="${imageDataMap[name]}" style="
          position:absolute;inset:0;width:100%;height:100%;object-fit:cover;
          opacity:0;
        " />
        <!-- Horizontal displacement slices -->
        <div id="slice-container-${i}" style="position:absolute;inset:0;overflow:hidden;opacity:0;">
          <div id="slice-0-${i}" style="position:absolute;width:100%;overflow:hidden;">
            <img src="${imageDataMap[name]}" style="width:100%;height:1920px;object-fit:cover;position:absolute;top:0;left:0;" />
          </div>
          <div id="slice-1-${i}" style="position:absolute;width:100%;overflow:hidden;">
            <img src="${imageDataMap[name]}" style="width:100%;height:1920px;object-fit:cover;position:absolute;top:0;left:0;" />
          </div>
          <div id="slice-2-${i}" style="position:absolute;width:100%;overflow:hidden;">
            <img src="${imageDataMap[name]}" style="width:100%;height:1920px;object-fit:cover;position:absolute;top:0;left:0;" />
          </div>
          <div id="slice-3-${i}" style="position:absolute;width:100%;overflow:hidden;">
            <img src="${imageDataMap[name]}" style="width:100%;height:1920px;object-fit:cover;position:absolute;top:0;left:0;" />
          </div>
          <div id="slice-4-${i}" style="position:absolute;width:100%;overflow:hidden;">
            <img src="${imageDataMap[name]}" style="width:100%;height:1920px;object-fit:cover;position:absolute;top:0;left:0;" />
          </div>
        </div>
      </div>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { margin: 0; padding: 0; overflow: hidden; }
  .photo-group { pointer-events: none; }
</style>
</head>
<body>
<div id="root" style="
  width:${W}px;
  height:${H}px;
  position:relative;
  overflow:hidden;
  background:#000;
  font-family: 'Courier New', monospace;
">

  <!-- Scanline overlay (always on) -->
  <div id="scanlines" style="
    position:absolute;inset:0;
    background:repeating-linear-gradient(
      0deg,
      transparent 0px,
      transparent 2px,
      rgba(0,0,0,0.15) 2px,
      rgba(0,0,0,0.15) 4px
    );
    z-index:100;
    pointer-events:none;
  "></div>

  <!-- CRT vignette -->
  <div style="
    position:absolute;inset:0;
    background:radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%);
    z-index:101;pointer-events:none;
  "></div>

  <!-- ==================== INTRO MANILA TEXT ==================== -->
  <div id="intro-text" style="
    position:absolute;
    top:50%;left:50%;
    transform:translate(-50%,-50%);
    z-index:50;
    opacity:0;
    text-align:center;
  ">
    <div id="manila-title" style="
      font-size:120px;
      font-weight:700;
      color:#00ff41;
      font-family:'Courier New',monospace;
      letter-spacing:20px;
      text-shadow:
        0 0 20px rgba(0,255,65,0.8),
        0 0 60px rgba(0,255,65,0.4),
        0 0 120px rgba(0,255,65,0.2);
      position:relative;
    ">MANILA</div>
    <div id="manila-sub" style="
      font-size:18px;
      color:#ff00ff;
      letter-spacing:12px;
      margin-top:20px;
      text-shadow:0 0 10px rgba(255,0,255,0.6);
      font-family:'Courier New',monospace;
    ">MODEL SEARCH</div>
  </div>

  <!-- ==================== PHOTO CONTAINER ==================== -->
  <div id="photo-container" style="
    position:absolute;inset:0;
    z-index:10;
    opacity:0;
  ">
    ${photoLayers}
  </div>

  <!-- ==================== GLITCH BARS (horizontal displacement) ==================== -->
  <div id="glitch-bars" style="
    position:absolute;inset:0;
    z-index:20;
    pointer-events:none;
    opacity:0;
  ">
    <div id="gbar-0" style="position:absolute;left:0;width:100%;height:60px;background:#00ff41;mix-blend-mode:overlay;opacity:0;"></div>
    <div id="gbar-1" style="position:absolute;left:0;width:100%;height:40px;background:#ff00ff;mix-blend-mode:overlay;opacity:0;"></div>
    <div id="gbar-2" style="position:absolute;left:0;width:100%;height:80px;background:#00ffff;mix-blend-mode:overlay;opacity:0;"></div>
    <div id="gbar-3" style="position:absolute;left:0;width:100%;height:30px;background:#00ff41;mix-blend-mode:overlay;opacity:0;"></div>
    <div id="gbar-4" style="position:absolute;left:0;width:100%;height:50px;background:#ff00ff;mix-blend-mode:overlay;opacity:0;"></div>
  </div>

  <!-- ==================== RAPID FLASH OVERLAY ==================== -->
  <div id="flash-overlay" style="
    position:absolute;inset:0;
    z-index:30;
    pointer-events:none;
    opacity:0;
    background:#fff;
    mix-blend-mode:overlay;
  "></div>

  <!-- ==================== CTA ==================== -->
  <div id="cta-container" style="
    position:absolute;
    top:50%;left:50%;
    transform:translate(-50%,-50%);
    z-index:60;
    opacity:0;
    text-align:center;
  ">
    <div id="cta-handle" style="
      font-size:72px;
      font-weight:700;
      color:#00ff41;
      font-family:'Courier New',monospace;
      letter-spacing:4px;
      text-shadow:
        0 0 20px rgba(0,255,65,0.8),
        0 0 60px rgba(0,255,65,0.4),
        3px 0 0 #ff00ff,
        -3px 0 0 #00ffff;
      margin-bottom:30px;
    ">@madebyaidan</div>
    <div id="cta-dm" style="
      font-size:36px;
      color:#fff;
      font-family:'Courier New',monospace;
      letter-spacing:6px;
      text-shadow:
        0 0 10px rgba(255,255,255,0.5),
        2px 0 0 #ff00ff,
        -2px 0 0 #00ffff;
      opacity:0;
    ">DM for a free shoot</div>
    <!-- Decorative glitch lines -->
    <div id="cta-line-top" style="
      position:absolute;
      top:-40px;left:10%;right:10%;
      height:2px;
      background:linear-gradient(90deg, transparent, #00ff41, #ff00ff, #00ffff, transparent);
      opacity:0;
    "></div>
    <div id="cta-line-bot" style="
      position:absolute;
      bottom:-40px;left:10%;right:10%;
      height:2px;
      background:linear-gradient(90deg, transparent, #00ffff, #ff00ff, #00ff41, transparent);
      opacity:0;
    "></div>
  </div>

  <!-- Noise grain overlay -->
  <div id="noise-overlay" style="
    position:absolute;inset:0;
    z-index:99;
    pointer-events:none;
    opacity:0.06;
    background-image:url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 200 200%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/></svg>');
    background-size:200px 200px;
  "></div>

</div>

<script>
  var PHOTO_COUNT = ${photoCount};
  var FPS = ${FPS};
  var SAFE_TOP = 213;
  var SAFE_BOTTOM = 430;

  var introText = document.getElementById('intro-text');
  var manilaTitle = document.getElementById('manila-title');
  var manilaSub = document.getElementById('manila-sub');
  var photoContainer = document.getElementById('photo-container');
  var glitchBars = document.getElementById('glitch-bars');
  var flashOverlay = document.getElementById('flash-overlay');
  var ctaContainer = document.getElementById('cta-container');
  var ctaHandle = document.getElementById('cta-handle');
  var ctaDm = document.getElementById('cta-dm');
  var ctaLineTop = document.getElementById('cta-line-top');
  var ctaLineBot = document.getElementById('cta-line-bot');

  // Pseudo-random seeded by time for deterministic glitch positions
  function pseudoRand(seed) {
    var x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
    return x - Math.floor(x);
  }

  function showPhotoGroup(idx) {
    for (var i = 0; i < PHOTO_COUNT; i++) {
      var g = document.getElementById('photo-group-' + i);
      if (g) g.style.opacity = i === idx ? '1' : '0';
    }
  }

  function hideAllPhotos() {
    for (var i = 0; i < PHOTO_COUNT; i++) {
      var g = document.getElementById('photo-group-' + i);
      if (g) g.style.opacity = '0';
    }
  }

  function setRGBSplit(idx, amount) {
    var r = document.getElementById('photo-r-' + idx);
    var g = document.getElementById('photo-g-' + idx);
    var b = document.getElementById('photo-b-' + idx);
    var clean = document.getElementById('photo-clean-' + idx);
    var sliceC = document.getElementById('slice-container-' + idx);

    if (amount <= 0) {
      // Show clean image
      if (r) r.style.opacity = '0';
      if (g) g.style.opacity = '0';
      if (b) b.style.opacity = '0';
      if (clean) clean.style.opacity = '1';
      if (sliceC) sliceC.style.opacity = '0';
    } else {
      if (r) { r.style.opacity = '0.7'; r.style.transform = 'translateX(' + (-amount) + 'px)'; }
      if (g) { g.style.opacity = '0.7'; g.style.transform = 'translateX(0)'; }
      if (b) { b.style.opacity = '0.7'; b.style.transform = 'translateX(' + amount + 'px)'; }
      if (clean) clean.style.opacity = '0';
      if (sliceC) sliceC.style.opacity = '0';
    }
  }

  function setSliceDisplacement(idx, intensity, seed) {
    var sliceC = document.getElementById('slice-container-' + idx);
    if (!sliceC) return;
    if (intensity <= 0) {
      sliceC.style.opacity = '0';
      return;
    }
    sliceC.style.opacity = '1';

    var sliceCount = 5;
    var sliceHeight = 1920 / sliceCount;
    for (var s = 0; s < sliceCount; s++) {
      var sliceEl = document.getElementById('slice-' + s + '-' + idx);
      if (!sliceEl) continue;
      var y = s * sliceHeight;
      var offsetX = (pseudoRand(seed + s * 7.3) - 0.5) * 2 * intensity;
      sliceEl.style.top = y + 'px';
      sliceEl.style.height = sliceHeight + 'px';
      sliceEl.style.left = offsetX + 'px';
      sliceEl.querySelector('img').style.top = (-y) + 'px';
    }
  }

  function setGlitchBars(intensity, seed) {
    if (intensity <= 0) {
      glitchBars.style.opacity = '0';
      return;
    }
    glitchBars.style.opacity = '1';
    for (var b = 0; b < 5; b++) {
      var bar = document.getElementById('gbar-' + b);
      if (!bar) continue;
      var show = pseudoRand(seed + b * 3.7) < intensity;
      bar.style.opacity = show ? (0.3 + pseudoRand(seed + b * 5.1) * 0.5).toString() : '0';
      bar.style.top = (pseudoRand(seed + b * 2.3) * 1920) + 'px';
    }
  }

  function ease(t, from, to, duration) {
    if (t <= from) return 0;
    if (t >= from + duration) return 1;
    var p = (t - from) / duration;
    return p * p * (3 - 2 * p);
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  window.__applyUpTo = function(t) {
    var frameNum = Math.round(t * FPS);

    // ===== 0-1s: Black with flickering MANILA text =====
    if (t < 1.0) {
      introText.style.opacity = '1';
      photoContainer.style.opacity = '0';
      ctaContainer.style.opacity = '0';
      hideAllPhotos();
      flashOverlay.style.opacity = '0';

      // Flickering effect
      var flicker = pseudoRand(frameNum * 0.7);
      var visible = flicker > 0.3;
      manilaTitle.style.opacity = visible ? '1' : '0';

      // RGB split on the title text
      var splitAmt = (pseudoRand(frameNum * 1.3) - 0.5) * 20;
      manilaTitle.style.textShadow = visible ?
        '0 0 20px rgba(0,255,65,0.8), 0 0 60px rgba(0,255,65,0.4), ' +
        splitAmt + 'px 0 0 #ff00ff, ' + (-splitAmt) + 'px 0 0 #00ffff' :
        'none';

      // Sub text flickers independently
      var subFlicker = pseudoRand(frameNum * 1.1 + 5);
      manilaSub.style.opacity = (subFlicker > 0.5 && t > 0.3) ? '1' : '0';

      // Random horizontal offset for glitch
      var titleOffset = visible ? (pseudoRand(frameNum * 2.1) - 0.5) * 30 : 0;
      introText.style.transform = 'translate(calc(-50% + ' + titleOffset + 'px), -50%)';

      setGlitchBars(0.4, frameNum * 3.1);
    }

    // ===== 1-10s: Photos cycle with glitch transitions =====
    else if (t < 10.0) {
      introText.style.opacity = '0';
      photoContainer.style.opacity = '1';
      ctaContainer.style.opacity = '0';
      flashOverlay.style.opacity = '0';

      // 10 photos over 9 seconds = 0.9s each
      var photoInterval = 0.9;
      var photoTime = t - 1.0;
      var photoIndex = Math.floor(photoTime / photoInterval);
      var photoFrac = (photoTime % photoInterval) / photoInterval;

      if (photoIndex >= PHOTO_COUNT) photoIndex = PHOTO_COUNT - 1;

      showPhotoGroup(photoIndex);

      // Glitch-in phase: 0-0.3 of each photo's time
      // Clean hold: 0.3-0.65
      // Glitch-out phase: 0.65-1.0
      var rgbAmount = 0;
      var sliceIntensity = 0;
      var glitchBarIntensity = 0;

      if (photoFrac < 0.3) {
        // Glitch in - decreasing intensity
        var glitchIn = 1.0 - (photoFrac / 0.3);
        rgbAmount = glitchIn * 25;
        sliceIntensity = glitchIn * 150;
        glitchBarIntensity = glitchIn * 0.8;
      } else if (photoFrac < 0.65) {
        // Clean hold
        rgbAmount = 0;
        sliceIntensity = 0;
        glitchBarIntensity = 0;
      } else {
        // Glitch out - increasing intensity
        var glitchOut = (photoFrac - 0.65) / 0.35;
        rgbAmount = glitchOut * 30;
        sliceIntensity = glitchOut * 180;
        glitchBarIntensity = glitchOut * 0.9;
      }

      setRGBSplit(photoIndex, rgbAmount);
      setSliceDisplacement(photoIndex, sliceIntensity, frameNum * 1.7);
      setGlitchBars(glitchBarIntensity, frameNum * 2.3);

      // Brief flash on transition
      if (photoFrac < 0.05 && photoIndex > 0) {
        flashOverlay.style.opacity = '0.3';
      }
    }

    // ===== 10-12s: Rapid flash montage =====
    else if (t < 12.0) {
      introText.style.opacity = '0';
      photoContainer.style.opacity = '1';
      ctaContainer.style.opacity = '0';

      // Rapid cycling - 0.1s per photo with increasing speed
      var rapidTime = t - 10.0;
      var speed = 0.1 - (rapidTime / 2.0) * 0.05; // accelerate from 0.1 to 0.05
      if (speed < 0.05) speed = 0.05;
      var rapidIndex = Math.floor(rapidTime / speed) % PHOTO_COUNT;

      showPhotoGroup(rapidIndex);

      // Increasing glitch intensity
      var intensity = 0.5 + (rapidTime / 2.0) * 0.5;
      var rgbAmt = 15 + rapidTime * 15;
      setRGBSplit(rapidIndex, rgbAmt);
      setSliceDisplacement(rapidIndex, rapidTime * 120, frameNum * 1.3);
      setGlitchBars(intensity, frameNum * 4.1);

      // Strobe flash
      flashOverlay.style.opacity = (frameNum % 4 < 2) ? '0.15' : '0';
    }

    // ===== 12-14s: CTA glitches in =====
    else {
      introText.style.opacity = '0';
      photoContainer.style.opacity = '0';
      hideAllPhotos();

      var ctaTime = t - 12.0;
      ctaContainer.style.opacity = '1';

      // Handle glitches in
      var handleIn = ease(t, 12.0, 0.4, 0.5);
      ctaHandle.style.opacity = handleIn > 0.1 ? '1' : '0';

      // Glitch the handle text
      if (ctaTime < 0.5) {
        var hFlicker = pseudoRand(frameNum * 0.9) > 0.3;
        ctaHandle.style.opacity = hFlicker ? '1' : '0';
        var hOffset = (pseudoRand(frameNum * 1.7) - 0.5) * 20;
        ctaHandle.style.transform = 'translateX(' + hOffset + 'px)';
        var hSplit = (pseudoRand(frameNum * 2.1) - 0.5) * 10;
        ctaHandle.style.textShadow =
          '0 0 20px rgba(0,255,65,0.8), 0 0 60px rgba(0,255,65,0.4), ' +
          hSplit + 'px 0 0 #ff00ff, ' + (-hSplit) + 'px 0 0 #00ffff';
      } else {
        ctaHandle.style.opacity = '1';
        ctaHandle.style.transform = 'translateX(0)';
        // Subtle ongoing split
        var subtleSplit = Math.sin(t * 8) * 3;
        ctaHandle.style.textShadow =
          '0 0 20px rgba(0,255,65,0.8), 0 0 60px rgba(0,255,65,0.4), ' +
          (3 + subtleSplit) + 'px 0 0 #ff00ff, ' + (-3 + subtleSplit) + 'px 0 0 #00ffff';
      }

      // DM text fades in
      var dmIn = ease(t, 12.6, 0.3, 0.5);
      ctaDm.style.opacity = dmIn.toString();
      if (ctaTime > 0.6 && ctaTime < 1.1) {
        var dmFlicker = pseudoRand(frameNum * 1.5) > 0.4;
        ctaDm.style.opacity = dmFlicker ? dmIn.toString() : '0';
      }

      // Decorative lines
      ctaLineTop.style.opacity = ease(t, 12.3, 0.3, 0.4).toString();
      ctaLineBot.style.opacity = ease(t, 12.3, 0.3, 0.4).toString();

      // Glitch bars reduce over time
      var barIntensity = Math.max(0, 0.6 - ctaTime * 0.3);
      setGlitchBars(barIntensity, frameNum * 2.7);

      flashOverlay.style.opacity = '0';
    }
  };

  if (location.search.includes('capture=1')) {
    var style = document.createElement('style');
    style.textContent = '*, *::before, *::after { transition-duration: 0s !important; animation-duration: 0.001s !important; animation-play-state: paused !important; }';
    document.head.appendChild(style);
  }
</script>
</body>
</html>`;
}

async function main() {
  console.log('=== Glitch Art Reel v67a ===');
  resetOutputDir();

  console.log('Processing photos...');
  var imageDataMap = processPhotos();

  var html = buildHTML(imageDataMap);
  var htmlPath = path.join(OUT_DIR, 'index.html');
  writeFileSync(htmlPath, html);
  console.log('HTML written: ' + htmlPath);

  var framesDir = path.join(OUT_DIR, 'tmp-frames');
  mkdirSync(framesDir, { recursive: true });

  var browser = await chromium.launch();
  var page = await browser.newPage({ viewport: { width: W, height: H } });
  await page.goto('file://' + htmlPath + '?capture=1', { waitUntil: 'load' });
  await page.waitForTimeout(500);

  console.log('Capturing ' + TOTAL_FRAMES + ' frames...');

  for (var frame = 0; frame < TOTAL_FRAMES; frame++) {
    var t = frame / FPS;
    await page.evaluate(function(time) { window.__applyUpTo(time); }, t);
    await page.waitForTimeout(2);
    var padded = String(frame).padStart(5, '0');
    await page.screenshot({ path: path.join(framesDir, 'frame_' + padded + '.png'), type: 'png' });
    if (frame % (FPS * 2) === 0) {
      console.log('  ' + t.toFixed(1) + 's / ' + TOTAL_DURATION + 's');
    }
  }

  await browser.close();
  console.log('All frames captured');

  var outputMp4 = path.join(OUT_DIR, 'reel-67a.mp4');
  execSync(
    'ffmpeg -y -framerate ' + FPS + ' -i "' + path.join(framesDir, 'frame_%05d.png') + '" ' +
    '-c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r ' + FPS + ' -an "' + outputMp4 + '"',
    { stdio: 'inherit' }
  );

  rmSync(framesDir, { recursive: true, force: true });

  var reelsDir = path.join(__dirname, 'reels');
  if (!existsSync(reelsDir)) mkdirSync(reelsDir, { recursive: true });
  var reelsDst = path.join(reelsDir, 'reel-67a.mp4');
  execSync('cp "' + outputMp4 + '" "' + reelsDst + '"');

  var sz = statSync(outputMp4);
  console.log('Final: ' + (sz.size / (1024 * 1024)).toFixed(1) + ' MB');
  console.log('Output: ' + outputMp4);
  console.log('Copied to: ' + reelsDst);
  console.log('=== Done ===');
}

main().catch(function(err) {
  console.error(err);
  process.exit(1);
});
