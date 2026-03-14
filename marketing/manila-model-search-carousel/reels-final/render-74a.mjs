import { chromium } from 'playwright';
import { execSync } from 'child_process';
import { mkdirSync, rmSync, existsSync, readFileSync, writeFileSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

var __dirname = path.dirname(fileURLToPath(import.meta.url));
var OUT_DIR = path.join(__dirname, 'output-74a');
var FILM_SCANS_DIR = '/Volumes/PortableSSD/Exports/film scans selected';
var W = 1080, H = 1920, FPS = 30;
var TOTAL_DURATION = 14;
var TOTAL_FRAMES = FPS * TOTAL_DURATION;

var PHOTO_NAMES = [
  'DSC_0009.jpg', 'DSC_0034.jpg', 'DSC_0087.jpg', 'DSC_0154.jpg',
  'DSC_0228.jpg', 'DSC_0682.jpg', 'DSC_0765.jpg', 'DSC_0962.jpg',
];

var SAFE_TOP = 213, SAFE_BOTTOM = 430;

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
  var imgArrayEntries = PHOTO_NAMES.map(function(name) {
    return '"' + imageDataMap[name] + '"';
  }).join(',\n    ');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: ${W}px; height: ${H}px; overflow: hidden; background: #0a0014; font-family: 'Arial Black', Arial, sans-serif; }

  @keyframes bokehFloat {
    0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
    50% { transform: translateY(-20px) scale(1.2); opacity: 0.6; }
  }
</style>
</head>
<body>
<div id="root" style="width:${W}px;height:${H}px;position:relative;overflow:hidden;background:#0a0014;">

  <!-- Background gradient accents -->
  <div style="position:absolute;inset:0;z-index:0;pointer-events:none;">
    <div style="position:absolute;top:30%;left:-20%;width:600px;height:600px;border-radius:50%;background:radial-gradient(circle,rgba(128,0,255,0.15),transparent 70%);"></div>
    <div style="position:absolute;bottom:20%;right:-15%;width:500px;height:500px;border-radius:50%;background:radial-gradient(circle,rgba(255,215,0,0.1),transparent 70%);"></div>
    <div style="position:absolute;top:10%;right:10%;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,rgba(200,0,255,0.08),transparent 70%);"></div>
  </div>

  <!-- Bokeh particles -->
  <div id="bokeh-container" style="position:absolute;inset:0;z-index:1;pointer-events:none;"></div>

  <!-- Title screen -->
  <div id="title-screen" style="position:absolute;inset:0;z-index:100;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;">
    <div id="title-text" style="font-size:72px;font-weight:900;color:#FFD700;text-transform:uppercase;letter-spacing:6px;text-align:center;line-height:1.2;text-shadow:0 0 40px rgba(255,215,0,0.8),0 0 80px rgba(255,215,0,0.4),0 0 120px rgba(200,0,255,0.3);">MANILA<br>MODEL<br>SEARCH</div>
    <div id="title-line" style="width:0px;height:4px;background:linear-gradient(90deg,transparent,#FFD700,transparent);margin-top:30px;"></div>
  </div>

  <!-- Wheel container -->
  <div id="wheel-scene" style="position:absolute;inset:0;z-index:50;opacity:0;">
    <!-- Pointer triangle at top -->
    <div id="pointer" style="position:absolute;top:${SAFE_TOP + 100}px;left:50%;transform:translateX(-50%);z-index:60;width:0;height:0;border-left:25px solid transparent;border-right:25px solid transparent;border-top:45px solid #FFD700;filter:drop-shadow(0 0 10px rgba(255,215,0,0.8));"></div>

    <!-- Wheel -->
    <div id="wheel-wrapper" style="position:absolute;top:${SAFE_TOP + 140}px;left:50%;transform:translateX(-50%);width:800px;height:800px;">
      <div id="wheel" style="width:800px;height:800px;border-radius:50%;position:relative;transform:rotate(0deg);border:8px solid #FFD700;box-shadow:0 0 40px rgba(255,215,0,0.5),inset 0 0 30px rgba(0,0,0,0.5);overflow:hidden;background:#1a0030;">
        <!-- 8 segments, each 45 degrees -->
        <!-- Segment divider lines -->
        <div id="seg-lines" style="position:absolute;inset:0;z-index:5;pointer-events:none;"></div>
        <!-- Photo segments -->
        <div id="seg-0" class="wheel-seg" style="position:absolute;top:0;left:0;width:100%;height:100%;clip-path:polygon(50% 50%, 50% 0%, 85.36% 14.64%);overflow:hidden;">
          <img id="seg-img-0" style="position:absolute;top:0;left:25%;width:50%;height:50%;object-fit:cover;" />
        </div>
        <div id="seg-1" class="wheel-seg" style="position:absolute;top:0;left:0;width:100%;height:100%;clip-path:polygon(50% 50%, 85.36% 14.64%, 100% 50%);overflow:hidden;">
          <img id="seg-img-1" style="position:absolute;top:25%;left:50%;width:50%;height:50%;object-fit:cover;" />
        </div>
        <div id="seg-2" class="wheel-seg" style="position:absolute;top:0;left:0;width:100%;height:100%;clip-path:polygon(50% 50%, 100% 50%, 85.36% 85.36%);overflow:hidden;">
          <img id="seg-img-2" style="position:absolute;top:50%;left:50%;width:50%;height:50%;object-fit:cover;" />
        </div>
        <div id="seg-3" class="wheel-seg" style="position:absolute;top:0;left:0;width:100%;height:100%;clip-path:polygon(50% 50%, 85.36% 85.36%, 50% 100%);overflow:hidden;">
          <img id="seg-img-3" style="position:absolute;top:50%;left:25%;width:50%;height:50%;object-fit:cover;" />
        </div>
        <div id="seg-4" class="wheel-seg" style="position:absolute;top:0;left:0;width:100%;height:100%;clip-path:polygon(50% 50%, 50% 100%, 14.64% 85.36%);overflow:hidden;">
          <img id="seg-img-4" style="position:absolute;top:50%;left:0%;width:50%;height:50%;object-fit:cover;" />
        </div>
        <div id="seg-5" class="wheel-seg" style="position:absolute;top:0;left:0;width:100%;height:100%;clip-path:polygon(50% 50%, 14.64% 85.36%, 0% 50%);overflow:hidden;">
          <img id="seg-img-5" style="position:absolute;top:25%;left:0%;width:50%;height:50%;object-fit:cover;" />
        </div>
        <div id="seg-6" class="wheel-seg" style="position:absolute;top:0;left:0;width:100%;height:100%;clip-path:polygon(50% 50%, 0% 50%, 14.64% 14.64%);overflow:hidden;">
          <img id="seg-img-6" style="position:absolute;top:0;left:0%;width:50%;height:50%;object-fit:cover;" />
        </div>
        <div id="seg-7" class="wheel-seg" style="position:absolute;top:0;left:0;width:100%;height:100%;clip-path:polygon(50% 50%, 14.64% 14.64%, 50% 0%);overflow:hidden;">
          <img id="seg-img-7" style="position:absolute;top:0;left:25%;width:50%;height:50%;object-fit:cover;" />
        </div>
        <!-- Center hub -->
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:80px;height:80px;border-radius:50%;background:radial-gradient(circle,#FFD700,#B8860B);border:4px solid #fff;z-index:10;box-shadow:0 0 20px rgba(255,215,0,0.8);"></div>
      </div>
    </div>

    <!-- Winning segment flash overlay -->
    <div id="win-flash" style="position:absolute;top:${SAFE_TOP + 140}px;left:50%;transform:translateX(-50%);width:800px;height:800px;border-radius:50%;z-index:55;pointer-events:none;opacity:0;background:radial-gradient(circle,rgba(255,215,0,0.4),transparent 70%);"></div>
  </div>

  <!-- Fullscreen photo display -->
  <div id="fullscreen-photo" style="position:absolute;inset:0;z-index:80;opacity:0;pointer-events:none;">
    <img id="fs-img" style="width:100%;height:100%;object-fit:cover;" />
    <div style="position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,0.3) 0%,transparent 20%,transparent 80%,rgba(0,0,0,0.3) 100%);"></div>
  </div>

  <!-- CTA panel -->
  <div id="cta-panel" style="position:absolute;inset:0;z-index:250;background:#0a0014;opacity:0;pointer-events:none;">
    <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px;">
      <!-- Casino-style border lights -->
      <div id="cta-border" style="position:absolute;top:${SAFE_TOP + 40}px;left:40px;right:40px;bottom:${SAFE_BOTTOM + 40}px;border:4px solid #FFD700;border-radius:30px;box-shadow:0 0 30px rgba(255,215,0,0.4),inset 0 0 30px rgba(255,215,0,0.1);opacity:0;"></div>
      <div id="cta-handle" style="font-size:56px;font-weight:900;color:#FFD700;text-align:center;opacity:0;text-shadow:0 0 30px rgba(255,215,0,0.6),0 0 60px rgba(255,215,0,0.3);">@madebyaidan</div>
      <div id="cta-dm" style="font-size:32px;font-weight:700;color:#fff;text-align:center;margin-top:30px;opacity:0;letter-spacing:2px;">DM for a free<br>photo shoot</div>
      <div id="cta-location" style="font-size:22px;color:rgba(255,255,255,0.4);text-align:center;margin-top:20px;opacity:0;letter-spacing:3px;text-transform:uppercase;">Manila &middot; Limited Slots</div>
    </div>
    <!-- CTA glow accents -->
    <div style="position:absolute;top:40%;left:-10%;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,rgba(128,0,255,0.15),transparent 70%);pointer-events:none;"></div>
    <div style="position:absolute;bottom:30%;right:-10%;width:350px;height:350px;border-radius:50%;background:radial-gradient(circle,rgba(255,215,0,0.1),transparent 70%);pointer-events:none;"></div>
  </div>

</div>

<script>
  var PHOTOS = [
    ${imgArrayEntries}
  ];
  var NUM_SEGS = 8;
  var SEG_ANGLE = 360 / NUM_SEGS; // 45 degrees

  // Set segment images
  for (var i = 0; i < NUM_SEGS; i++) {
    document.getElementById('seg-img-' + i).src = PHOTOS[i];
  }

  // Build bokeh particles
  (function() {
    var container = document.getElementById('bokeh-container');
    var html = '';
    for (var i = 0; i < 25; i++) {
      var x = Math.random() * ${W};
      var y = Math.random() * ${H};
      var size = 8 + Math.random() * 40;
      var delay = Math.random() * 4;
      var dur = 3 + Math.random() * 4;
      var colors = ['rgba(255,215,0,0.15)', 'rgba(128,0,255,0.12)', 'rgba(255,100,200,0.1)', 'rgba(200,180,255,0.1)'];
      var color = colors[Math.floor(Math.random() * colors.length)];
      html += '<div style="position:absolute;left:' + x + 'px;top:' + y + 'px;width:' + size + 'px;height:' + size + 'px;border-radius:50%;background:' + color + ';animation:bokehFloat ' + dur + 's ease-in-out ' + delay + 's infinite;"></div>';
    }
    container.innerHTML = html;
  })();

  // Build segment divider lines
  (function() {
    var linesDiv = document.getElementById('seg-lines');
    var html = '';
    for (var i = 0; i < NUM_SEGS; i++) {
      var angle = i * SEG_ANGLE;
      html += '<div style="position:absolute;top:50%;left:50%;width:50%;height:3px;background:rgba(255,215,0,0.7);transform-origin:0% 50%;transform:rotate(' + angle + 'deg);box-shadow:0 0 6px rgba(255,215,0,0.5);"></div>';
    }
    linesDiv.innerHTML = html;
  })();

  // DOM refs
  var titleScreen = document.getElementById('title-screen');
  var titleText = document.getElementById('title-text');
  var titleLine = document.getElementById('title-line');
  var wheelScene = document.getElementById('wheel-scene');
  var wheel = document.getElementById('wheel');
  var winFlash = document.getElementById('win-flash');
  var fullscreenPhoto = document.getElementById('fullscreen-photo');
  var fsImg = document.getElementById('fs-img');
  var ctaPanel = document.getElementById('cta-panel');
  var pointer = document.getElementById('pointer');

  // Helpers
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function lerp(a, b, t) { return a + (b - a) * clamp(t, 0, 1); }
  function prog(t, start, end) { return clamp((t - start) / (end - start), 0, 1); }
  function easeOut(x) { return 1 - Math.pow(1 - x, 3); }
  function easeInOut(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }

  // Wheel spin parameters
  // Spin 1: 1-3s spin fast, 3-5s decelerate, lands on segment 2 (photo index 2)
  // Spin 2: 7-8s spin fast, 8-9s decelerate, lands on segment 5 (photo index 5)
  // Spin 3 (montage): 11-12s spin super fast

  var SPIN1_WINNER = 2; // photo index
  var SPIN2_WINNER = 5;

  // Calculate target rotation so the winning segment aligns with the pointer (top center)
  // Pointer is at the top. Segment 0 occupies 0-45 deg. The "center" of segment i is at i*45 + 22.5 deg.
  // For the pointer at top (0 deg), we need the wheel rotated so the winning segment's center is at 0.
  // Wheel rotation = -(winnerIdx * 45 + 22.5) + additional full rotations
  function winnerRotation(winnerIdx, extraRotations) {
    return -(winnerIdx * SEG_ANGLE + SEG_ANGLE / 2) + 360 * extraRotations;
  }

  var SPIN1_TARGET = winnerRotation(SPIN1_WINNER, 6); // 6 full rotations + landing
  var SPIN2_TARGET = winnerRotation(SPIN2_WINNER, 5);

  function getWheelRotation(t) {
    // 0-1s: no rotation
    if (t < 1.0) return 0;

    // 1-5s: Spin 1 (fast then decelerate to land on winner)
    if (t < 5.0) {
      var p = prog(t, 1.0, 5.0);
      // Use ease-out for natural deceleration
      var eased = easeOut(p);
      return SPIN1_TARGET * eased;
    }

    // 5-7s: Holding on winner 1 (wheel stays at SPIN1_TARGET)
    if (t < 7.0) return SPIN1_TARGET;

    // 7-9s: Spin 2
    if (t < 9.0) {
      var p2 = prog(t, 7.0, 9.0);
      var eased2 = easeOut(p2);
      return SPIN1_TARGET + (SPIN2_TARGET - SPIN1_TARGET + 360 * 5) * eased2;
    }

    var spin2Final = SPIN1_TARGET + (SPIN2_TARGET - SPIN1_TARGET + 360 * 5);

    // 9-11s: Holding on winner 2
    if (t < 11.0) return spin2Final;

    // 11-12s: Super fast montage spin
    if (t < 12.0) {
      var p3 = prog(t, 11.0, 12.0);
      return spin2Final + 360 * 10 * p3;
    }

    return spin2Final + 360 * 10;
  }

  window.__applyUpTo = function(t) {

    // ---- Title screen (0-1s) ----
    if (t < 0.1) {
      titleScreen.style.opacity = '0';
    } else if (t < 0.4) {
      titleScreen.style.opacity = String(prog(t, 0.1, 0.4));
    } else if (t < 0.8) {
      titleScreen.style.opacity = '1';
      titleLine.style.width = lerp(0, 400, easeOut(prog(t, 0.4, 0.8))) + 'px';
    } else if (t < 1.2) {
      titleScreen.style.opacity = String(1 - prog(t, 0.8, 1.2));
      titleLine.style.width = '400px';
    } else {
      titleScreen.style.opacity = '0';
    }

    // ---- Wheel scene ----
    if (t < 1.0) {
      wheelScene.style.opacity = '0';
    } else if (t < 1.5) {
      wheelScene.style.opacity = String(prog(t, 1.0, 1.5));
    } else if (t < 5.0) {
      wheelScene.style.opacity = '1';
    } else if (t < 5.3) {
      // Fade wheel out before fullscreen photo 1
      wheelScene.style.opacity = String(1 - prog(t, 5.0, 5.3));
    } else if (t < 7.0) {
      wheelScene.style.opacity = '0';
    } else if (t < 7.3) {
      // Wheel reappears for spin 2
      wheelScene.style.opacity = String(prog(t, 7.0, 7.3));
    } else if (t < 9.0) {
      wheelScene.style.opacity = '1';
    } else if (t < 9.3) {
      // Fade out before fullscreen photo 2
      wheelScene.style.opacity = String(1 - prog(t, 9.0, 9.3));
    } else if (t < 11.0) {
      wheelScene.style.opacity = '0';
    } else if (t < 11.3) {
      // Wheel reappears for montage spin
      wheelScene.style.opacity = String(prog(t, 11.0, 11.3));
    } else if (t < 12.0) {
      wheelScene.style.opacity = '1';
    } else if (t < 12.3) {
      wheelScene.style.opacity = String(1 - prog(t, 12.0, 12.3));
    } else {
      wheelScene.style.opacity = '0';
    }

    // Wheel rotation
    var rotation = getWheelRotation(t);
    wheel.style.transform = 'rotate(' + rotation + 'deg)';

    // Win flash on landing
    if (t >= 4.5 && t < 5.0) {
      var flashP = prog(t, 4.5, 5.0);
      winFlash.style.opacity = String(0.6 * Math.sin(flashP * Math.PI * 3));
    } else if (t >= 8.5 && t < 9.0) {
      var flashP2 = prog(t, 8.5, 9.0);
      winFlash.style.opacity = String(0.6 * Math.sin(flashP2 * Math.PI * 3));
    } else {
      winFlash.style.opacity = '0';
    }

    // Pointer bounce on tick (subtle)
    if ((t >= 1.0 && t < 5.0) || (t >= 7.0 && t < 9.0) || (t >= 11.0 && t < 12.0)) {
      var tickAngle = (rotation % SEG_ANGLE + SEG_ANGLE) % SEG_ANGLE;
      var nearEdge = Math.min(tickAngle, SEG_ANGLE - tickAngle) / (SEG_ANGLE / 2);
      if (nearEdge < 0.2) {
        pointer.style.transform = 'translateX(-50%) scaleY(' + (1 - 0.15 * (1 - nearEdge / 0.2)) + ')';
      } else {
        pointer.style.transform = 'translateX(-50%) scaleY(1)';
      }
    } else {
      pointer.style.transform = 'translateX(-50%) scaleY(1)';
    }

    // ---- Fullscreen photo 1 (5-7s) ----
    if (t >= 5.0 && t < 7.0) {
      fullscreenPhoto.style.opacity = '1';
      fsImg.src = PHOTOS[SPIN1_WINNER];
      // Zoom in effect
      var zoomP = prog(t, 5.0, 5.8);
      var scale = lerp(1.3, 1.0, easeOut(zoomP));
      fsImg.style.transform = 'scale(' + scale + ')';
      // Fade out at end
      if (t > 6.5) {
        fullscreenPhoto.style.opacity = String(1 - prog(t, 6.5, 7.0));
      }
    } else if (t >= 9.0 && t < 11.0) {
      // ---- Fullscreen photo 2 (9-11s) ----
      fullscreenPhoto.style.opacity = '1';
      fsImg.src = PHOTOS[SPIN2_WINNER];
      var zoomP2 = prog(t, 9.0, 9.8);
      var scale2 = lerp(1.3, 1.0, easeOut(zoomP2));
      fsImg.style.transform = 'scale(' + scale2 + ')';
      if (t > 10.5) {
        fullscreenPhoto.style.opacity = String(1 - prog(t, 10.5, 11.0));
      }
    } else {
      fullscreenPhoto.style.opacity = '0';
    }

    // ---- CTA (12-14s) ----
    var ctaBorder = document.getElementById('cta-border');
    var ctaHandle = document.getElementById('cta-handle');
    var ctaDm = document.getElementById('cta-dm');
    var ctaLocation = document.getElementById('cta-location');

    if (t < 12.0) {
      ctaPanel.style.opacity = '0';
    } else if (t < 12.3) {
      ctaPanel.style.opacity = String(prog(t, 12.0, 12.3));
      ctaBorder.style.opacity = '0';
      ctaHandle.style.opacity = '0';
      ctaDm.style.opacity = '0';
      ctaLocation.style.opacity = '0';
    } else {
      ctaPanel.style.opacity = '1';

      ctaBorder.style.opacity = String(Math.min(1, prog(t, 12.3, 12.8)));

      ctaHandle.style.opacity = String(Math.min(1, prog(t, 12.5, 13.0)));
      ctaHandle.style.transform = 'translateY(' + lerp(30, 0, easeOut(prog(t, 12.5, 13.0))) + 'px)';

      ctaDm.style.opacity = String(Math.min(1, prog(t, 13.0, 13.4)));
      ctaDm.style.transform = 'translateY(' + lerp(25, 0, easeOut(prog(t, 13.0, 13.4))) + 'px)';

      ctaLocation.style.opacity = String(Math.min(1, prog(t, 13.3, 13.7)));

      // Pulsing glow on handle
      if (t > 13.0) {
        var pulseP = ((t - 13.0) % 1.0);
        var glowIntensity = 30 + 20 * Math.sin(pulseP * Math.PI * 2);
        ctaHandle.style.textShadow = '0 0 ' + glowIntensity + 'px rgba(255,215,0,0.6), 0 0 ' + (glowIntensity * 2) + 'px rgba(255,215,0,0.3)';
      }
    }
  };

  if (location.search.includes('capture=1')) {
    var style = document.createElement('style');
    style.textContent = '*, *::before, *::after { transition-duration: 0s !important; animation-duration: 0.001s !important; }';
    document.head.appendChild(style);
  }
</script>
</body>
</html>`;
}

async function main() {
  console.log('=== Manila Photo Roulette Wheel Reel v74a ===');
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
  await page.waitForTimeout(800);

  console.log('Capturing ' + TOTAL_FRAMES + ' frames...');

  for (var frame = 0; frame < TOTAL_FRAMES; frame++) {
    var t = frame / FPS;
    await page.evaluate(function(time) { window.__applyUpTo(time); }, t);
    await page.waitForTimeout(2);
    var padded = String(frame).padStart(5, '0');
    await page.screenshot({ path: path.join(framesDir, 'frame_' + padded + '.png'), type: 'png' });
    if (frame % (FPS * 3) === 0) {
      console.log('  ' + t.toFixed(1) + 's / ' + TOTAL_DURATION + 's');
    }
  }

  await browser.close();
  console.log('All frames captured');

  var outputMp4 = path.join(OUT_DIR, '74a-photo-roulette.mp4');
  execSync(
    'ffmpeg -y -framerate ' + FPS + ' -i "' + path.join(framesDir, 'frame_%05d.png') + '" ' +
    '-c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r ' + FPS + ' -an "' + outputMp4 + '"',
    { stdio: 'inherit' }
  );

  rmSync(framesDir, { recursive: true, force: true });

  var reelsDir = path.join(__dirname, 'reels');
  if (!existsSync(reelsDir)) mkdirSync(reelsDir, { recursive: true });
  var reelsDest = path.join(reelsDir, '74a-photo-roulette.mp4');
  execSync('cp "' + outputMp4 + '" "' + reelsDest + '"');

  var sz = statSync(outputMp4);
  console.log('Final: ' + (sz.size / (1024 * 1024)).toFixed(1) + ' MB');
  console.log('Output: ' + outputMp4);
  console.log('Copied to: ' + reelsDest);
  console.log('=== Done ===');
}

main().catch(function(err) {
  console.error(err);
  process.exit(1);
});
