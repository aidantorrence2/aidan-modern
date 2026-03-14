import { chromium } from 'playwright';
import { execSync } from 'child_process';
import { mkdirSync, rmSync, existsSync, readFileSync, writeFileSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

var __dirname = path.dirname(fileURLToPath(import.meta.url));
var OUT_DIR = path.join(__dirname, 'output-75a');
var FILM_SCANS_DIR = '/Volumes/PortableSSD/Exports/film scans selected';
var W = 1080, H = 1920, FPS = 30;
var TOTAL_DURATION = 14;
var TOTAL_FRAMES = FPS * TOTAL_DURATION; // 420

var PHOTO_NAMES = [
  'DSC_0016.jpg', 'DSC_0066.jpg', 'DSC_0157.jpg', 'DSC_0260.jpg',
  'DSC_0320.jpg', 'DSC_0685.jpg', 'DSC_0754.jpg', 'DSC_0979.jpg',
];

// Safe zones
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
  html, body { width: ${W}px; height: ${H}px; overflow: hidden; background: #f5f0e8; font-family: 'Helvetica Neue', Arial, sans-serif; }
</style>
</head>
<body>
<div id="root" style="width:${W}px;height:${H}px;position:relative;overflow:hidden;background:#f5f0e8;">

  <!-- Camera body -->
  <div id="camera" style="position:absolute;top:${SAFE_TOP + 20}px;left:50%;transform:translateX(-50%);z-index:50;opacity:0;">
    <!-- Title above camera -->
    <div style="text-align:center;margin-bottom:16px;">
      <span style="font-size:32px;font-weight:800;color:#333;letter-spacing:6px;text-transform:uppercase;">MANILA MODEL SEARCH</span>
    </div>
    <!-- Camera body -->
    <div id="camera-body" style="
      width:320px;height:200px;margin:0 auto;
      background:linear-gradient(180deg,#444 0%,#333 50%,#2a2a2a 100%);
      border-radius:20px;
      position:relative;
      box-shadow:0 8px 30px rgba(0,0,0,0.3);
    ">
      <!-- Silver trim top -->
      <div style="position:absolute;top:0;left:0;right:0;height:8px;background:linear-gradient(180deg,#ccc,#999);border-radius:20px 20px 0 0;"></div>
      <!-- Lens -->
      <div style="position:absolute;top:40px;left:50%;transform:translateX(-50%);width:90px;height:90px;border-radius:50%;background:radial-gradient(circle at 40% 40%,#666,#222,#111);border:4px solid #888;box-shadow:0 0 15px rgba(0,0,0,0.5),inset 0 0 20px rgba(0,0,0,0.6);">
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:40px;height:40px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#4488cc,#224466,#112233);border:2px solid #555;"></div>
      </div>
      <!-- Flash -->
      <div id="flash-unit" style="position:absolute;top:20px;right:30px;width:40px;height:28px;background:linear-gradient(180deg,#eee,#ccc);border-radius:6px;border:2px solid #aaa;"></div>
      <!-- Viewfinder -->
      <div style="position:absolute;top:20px;left:30px;width:36px;height:24px;background:#111;border-radius:4px;border:2px solid #666;"></div>
      <!-- Photo slot at bottom -->
      <div style="position:absolute;bottom:-4px;left:50%;transform:translateX(-50%);width:180px;height:10px;background:#1a1a1a;border-radius:0 0 4px 4px;"></div>
      <!-- Brand text -->
      <div style="position:absolute;bottom:14px;left:50%;transform:translateX(-50%);font-size:11px;font-weight:700;color:#888;letter-spacing:3px;">INSTANT</div>
    </div>
  </div>

  <!-- Flash overlay -->
  <div id="flash-overlay" style="position:absolute;inset:0;z-index:200;background:rgba(255,255,255,0);pointer-events:none;"></div>

  <!-- Photo container -->
  <div id="photo-container" style="position:absolute;top:0;left:0;width:${W}px;height:${H}px;z-index:30;">
    ${(function() {
      var photos = '';
      for (var i = 0; i < 8; i++) {
        photos += '<div id="photo-' + i + '" style="position:absolute;left:50%;top:' + (SAFE_TOP + 280) + 'px;transform:translateX(-50%) rotate(0deg);opacity:0;z-index:' + (10 + i) + ';">' +
          '<div style="background:#fff;padding:16px 16px 50px 16px;box-shadow:0 8px 30px rgba(0,0,0,0.15),0 2px 8px rgba(0,0,0,0.1);width:550px;">' +
            '<div id="photo-img-' + i + '" style="width:518px;height:550px;overflow:hidden;background:#fff;">' +
              '<img id="photo-img-el-' + i + '" style="width:100%;height:100%;object-fit:cover;filter:brightness(3) contrast(0.3) saturate(0);" />' +
            '</div>' +
            '<div style="text-align:center;margin-top:10px;font-size:14px;font-weight:600;color:#999;letter-spacing:3px;">MANILA 2026</div>' +
          '</div>' +
        '</div>';
      }
      return photos;
    })()}
  </div>

  <!-- CTA panel -->
  <div id="cta-panel" style="position:absolute;inset:0;z-index:250;background:#f5f0e8;opacity:0;pointer-events:none;">
    <div style="position:absolute;top:0;left:0;right:0;bottom:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px;">
      <div id="cta-handle" style="
        background:#333;
        border-radius:20px;
        padding:28px 60px;
        margin:16px 0;
        opacity:0;
      ">
        <div style="font-size:52px;font-weight:800;color:#fff;letter-spacing:2px;text-align:center;">@madebyaidan</div>
      </div>
      <div id="cta-dm" style="font-size:32px;font-weight:600;color:#666;letter-spacing:3px;text-transform:uppercase;text-align:center;margin-top:24px;opacity:0;">DM for a free photo shoot</div>
    </div>
  </div>

</div>

<script>
  var PHOTOS = [
    ${imgArrayEntries}
  ];
  var PHOTO_COUNT = PHOTOS.length;

  // Set photo sources
  for (var pi = 0; pi < PHOTO_COUNT; pi++) {
    document.getElementById('photo-img-el-' + pi).src = PHOTOS[pi];
  }

  // DOM refs
  var camera = document.getElementById('camera');
  var flashOverlay = document.getElementById('flash-overlay');
  var ctaPanel = document.getElementById('cta-panel');

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function lerp(a, b, t) { return a + (b - a) * clamp(t, 0, 1); }
  function prog(t, start, end) { return clamp((t - start) / (end - start), 0, 1); }
  function easeOut(x) { return 1 - Math.pow(1 - x, 3); }
  function easeInOut(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }

  // Seeded random for wobble
  function seededRandom(seed) {
    var x = Math.sin(seed * 9301 + 49297) * 49297;
    return x - Math.floor(x);
  }

  // Photo timing: each photo gets ~1.25s, 8 photos from 1s to 11s
  var PHOTO_INTERVAL = 1.25;
  var PHOTO_START_TIME = 1.0;
  var DEVELOP_DURATION = 0.9; // how long the develop effect takes
  var SLIDE_DURATION = 0.35; // how long the slide-in takes

  // Pre-compute wobble angles for each photo
  var wobbleAngles = [];
  for (var wi = 0; wi < 8; wi++) {
    wobbleAngles.push((seededRandom(wi * 17 + 3) - 0.5) * 6); // -3 to +3 degrees
  }

  // Camera body position for photo ejection reference
  var CAMERA_BOTTOM_Y = ${SAFE_TOP + 280};
  var PHOTO_REST_Y = ${SAFE_TOP + 340}; // where photos settle

  window.__applyUpTo = function(t) {

    // ---- Camera (0-1s fade in, stays until 11s) ----
    if (t < 0.3) {
      camera.style.opacity = '0';
      camera.style.transform = 'translateX(-50%) translateY(-20px)';
    } else if (t < 0.8) {
      var cp = easeOut(prog(t, 0.3, 0.8));
      camera.style.opacity = String(cp);
      camera.style.transform = 'translateX(-50%) translateY(' + lerp(-20, 0, cp) + 'px)';
    } else if (t < 11.0) {
      camera.style.opacity = '1';
      camera.style.transform = 'translateX(-50%) translateY(0px)';
    } else if (t < 11.5) {
      camera.style.opacity = String(1 - prog(t, 11.0, 11.5));
      camera.style.transform = 'translateX(-50%) translateY(0px)';
    } else {
      camera.style.opacity = '0';
    }

    // ---- Camera flash at 0.85s ----
    if (t >= 0.85 && t < 0.95) {
      var fp = Math.sin(prog(t, 0.85, 0.95) * Math.PI);
      flashOverlay.style.background = 'rgba(255,255,255,' + (fp * 0.7).toFixed(3) + ')';
    } else if (t >= 0.95 && t < 1.05) {
      var fp2 = 1 - prog(t, 0.95, 1.05);
      flashOverlay.style.background = 'rgba(255,255,255,' + (fp2 * 0.3).toFixed(3) + ')';
    } else {
      flashOverlay.style.background = 'rgba(255,255,255,0)';
    }

    // ---- Photos (1-11s) ----
    for (var i = 0; i < PHOTO_COUNT; i++) {
      var photoEl = document.getElementById('photo-' + i);
      var imgEl = document.getElementById('photo-img-el-' + i);
      var photoStart = PHOTO_START_TIME + i * PHOTO_INTERVAL;
      var slideEnd = photoStart + SLIDE_DURATION;
      var developEnd = photoStart + SLIDE_DURATION + DEVELOP_DURATION;

      // Next photo timing
      var nextPhotoStart = PHOTO_START_TIME + (i + 1) * PHOTO_INTERVAL;

      if (t < photoStart) {
        // Not yet ejected
        photoEl.style.opacity = '0';
        photoEl.style.top = (CAMERA_BOTTOM_Y - 100) + 'px';
      } else if (t < slideEnd) {
        // Sliding down from camera
        var sp = easeOut(prog(t, photoStart, slideEnd));
        photoEl.style.opacity = '1';
        photoEl.style.top = lerp(CAMERA_BOTTOM_Y - 100, PHOTO_REST_Y, sp) + 'px';
        var wobble = wobbleAngles[i] * Math.sin(sp * Math.PI * 2) * (1 - sp);
        photoEl.style.transform = 'translateX(-50%) rotate(' + wobble.toFixed(2) + 'deg)';

        // Still fully white/washed out
        imgEl.style.filter = 'brightness(3) contrast(0.3) saturate(0)';
      } else if (t < developEnd) {
        // Developing
        photoEl.style.opacity = '1';
        photoEl.style.top = PHOTO_REST_Y + 'px';
        photoEl.style.transform = 'translateX(-50%) rotate(' + (wobbleAngles[i] * 0.3).toFixed(2) + 'deg)';

        var dp = easeInOut(prog(t, slideEnd, developEnd));
        var brightness = lerp(3, 1, dp);
        var contrast = lerp(0.3, 1, dp);
        var saturate = lerp(0, 1, dp);
        imgEl.style.filter = 'brightness(' + brightness.toFixed(2) + ') contrast(' + contrast.toFixed(2) + ') saturate(' + saturate.toFixed(2) + ')';
      } else {
        // Fully developed
        imgEl.style.filter = 'brightness(1) contrast(1) saturate(1)';

        // If there is a next photo, this one needs to slide down/away
        if (i < PHOTO_COUNT - 1 && t >= nextPhotoStart - 0.1) {
          var exitStart = nextPhotoStart - 0.1;
          var exitEnd = nextPhotoStart + 0.3;
          if (t < exitEnd) {
            var ep = easeInOut(prog(t, exitStart, exitEnd));
            photoEl.style.opacity = String(1 - ep);
            photoEl.style.top = lerp(PHOTO_REST_Y, PHOTO_REST_Y + 600, ep) + 'px';
            var scl = lerp(1, 0.7, ep);
            photoEl.style.transform = 'translateX(-50%) rotate(' + (wobbleAngles[i] * 0.3).toFixed(2) + 'deg) scale(' + scl.toFixed(3) + ')';
          } else {
            photoEl.style.opacity = '0';
          }
        } else if (i === PHOTO_COUNT - 1) {
          // Last photo stays
          photoEl.style.opacity = '1';
          photoEl.style.top = PHOTO_REST_Y + 'px';
          photoEl.style.transform = 'translateX(-50%) rotate(' + (wobbleAngles[i] * 0.3).toFixed(2) + 'deg)';

          // Fade out with CTA
          if (t >= 11.0 && t < 11.5) {
            photoEl.style.opacity = String(1 - prog(t, 11.0, 11.5));
          } else if (t >= 11.5) {
            photoEl.style.opacity = '0';
          }
        }
      }
    }

    // ---- Mini flash for each photo ejection ----
    for (var fi = 0; fi < PHOTO_COUNT; fi++) {
      var flashTime = PHOTO_START_TIME + fi * PHOTO_INTERVAL - 0.05;
      if (t >= flashTime && t < flashTime + 0.08) {
        var ffp = Math.sin(prog(t, flashTime, flashTime + 0.08) * Math.PI);
        flashOverlay.style.background = 'rgba(255,255,255,' + (ffp * 0.35).toFixed(3) + ')';
      }
    }

    // ---- CTA (11-14s) ----
    var ctaHandle = document.getElementById('cta-handle');
    var ctaDm = document.getElementById('cta-dm');

    if (t < 11.0) {
      ctaPanel.style.opacity = '0';
    } else if (t < 11.5) {
      ctaPanel.style.opacity = String(prog(t, 11.0, 11.5));
      ctaHandle.style.opacity = '0';
      ctaDm.style.opacity = '0';
    } else {
      ctaPanel.style.opacity = '1';

      ctaHandle.style.opacity = String(Math.min(1, prog(t, 11.5, 12.0)));
      ctaHandle.style.transform = 'translateY(' + lerp(30, 0, easeOut(prog(t, 11.5, 12.0))) + 'px)';

      ctaDm.style.opacity = String(Math.min(1, prog(t, 12.0, 12.5)));
      ctaDm.style.transform = 'translateY(' + lerp(20, 0, easeOut(prog(t, 12.0, 12.5))) + 'px)';
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
  console.log('=== Manila Instant Camera Reel v75a ===');
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

  var outputMp4 = path.join(OUT_DIR, '75a-instant-print.mp4');
  execSync(
    'ffmpeg -y -framerate ' + FPS + ' -i "' + path.join(framesDir, 'frame_%05d.png') + '" ' +
    '-c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r ' + FPS + ' -an "' + outputMp4 + '"',
    { stdio: 'inherit' }
  );

  rmSync(framesDir, { recursive: true, force: true });

  var reelsDir = path.join(__dirname, 'reels');
  if (!existsSync(reelsDir)) mkdirSync(reelsDir, { recursive: true });
  var reelsDest = path.join(reelsDir, '75a-instant-print.mp4');
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
