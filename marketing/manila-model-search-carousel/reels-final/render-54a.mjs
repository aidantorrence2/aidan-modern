import { chromium } from 'playwright';
import { execSync } from 'child_process';
import { mkdirSync, rmSync, existsSync, readFileSync, writeFileSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

var __dirname = path.dirname(fileURLToPath(import.meta.url));
var OUT_DIR = path.join(__dirname, 'output-54a');

var W = 1080;
var H = 1920;
var FPS = 30;
var SAFE_TOP = 213;
var SAFE_BOTTOM = 430;

var FILM_SCANS_DIR = '/Volumes/PortableSSD/Exports/film scans';
var PHOTO_NAMES = [
  'DSC_0149.jpg',
  'DSC_0150-2.jpg',
  'DSC_0153.jpg',
  'DSC_0157.jpg',
  'DSC_0162-2.jpg',
  'DSC_0163.jpg',
  'DSC_0164-2.jpg',
  'DSC_0167.jpg',
];

// Timeline (24s total = 720 frames at 30fps):
// Scene 1 (0-3s):   "No Experience Needed" burn-in
// Scene 2 (3-13s):  Photo slideshow with blackout flashes + FRAME counter
// Scene 3 (13-18s): How It Works — Step 01/02/03
// Scene 4 (18-22s): CTA — DM Me, @madebyaidan, Limited Spots
// Buffer (22-24s):  End hold

var TOTAL_DURATION = 24; // seconds
var TOTAL_FRAMES = TOTAL_DURATION * FPS; // 720

function resetOutputDir() {
  rmSync(OUT_DIR, { recursive: true, force: true });
  mkdirSync(OUT_DIR, { recursive: true });
}

function processPhotos() {
  var cropDir = path.join(OUT_DIR, 'tmp-photos');
  mkdirSync(cropDir, { recursive: true });
  var processed = [];
  for (var f of PHOTO_NAMES) {
    var src = path.join(FILM_SCANS_DIR, f);
    if (!existsSync(src)) {
      console.error('Photo not found: ' + src);
      process.exit(1);
    }
    var dst = path.join(cropDir, f.replace(/\.jpg$/i, '_processed.jpg'));
    execSync('magick "' + src + '" -shave 500x600 +repage -auto-level -quality 95 "' + dst + '"', { stdio: 'pipe' });
    processed.push(dst);
    console.log('  Processed: ' + f);
  }
  return processed;
}

function buildHTML(imageDataMap) {
  var photoCount = PHOTO_NAMES.length;

  // Photo slides HTML
  var photoSlidesHtml = PHOTO_NAMES.map(function(name, i) {
    return (
      '<div id="slide-' + i + '" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:0;">' +
        '<img src="' + imageDataMap[name] + '" style="max-width:92%;max-height:88%;object-fit:contain;display:block;"/>' +
        '<div style="position:absolute;bottom:' + (SAFE_BOTTOM + 30) + 'px;right:40px;font-family:\'Courier New\',monospace;font-size:28px;font-weight:bold;letter-spacing:4px;color:rgba(255,245,220,0.75);z-index:10;text-shadow:0 0 10px rgba(0,0,0,0.9),0 2px 4px rgba(0,0,0,0.7);">FRAME ' + String(i + 1).padStart(2, '0') + '/' + String(photoCount).padStart(2, '0') + '</div>' +
      '</div>'
    );
  }).join('\n');

  // Build timeline entries
  var photoStart = 3.0;
  var photoEnd = 13.0;
  var photoDur = (photoEnd - photoStart) / photoCount;

  var timelineEntries = [];

  // Scene 1 (0s)
  timelineEntries.push([0.0, 'showEl("persistent-title"); showEl("scene1"); burnIn("title-content");']);

  // Scene 2 (3s): blackout flash, show scene2, first photo
  timelineEntries.push([3.0, 'setBlackout(1);']);
  timelineEntries.push([3.2, 'setBlackout(0); hideEl("scene1"); showEl("scene2"); showSlide(0);']);

  // Photo transitions
  for (var pi = 1; pi < photoCount; pi++) {
    var t = photoStart + pi * photoDur;
    timelineEntries.push([+(t - 0.1).toFixed(3), 'setBlackout(1);']);
    timelineEntries.push([+t.toFixed(3), 'setBlackout(0); hideSlide(' + (pi - 1) + '); showSlide(' + pi + ');']);
  }

  // Scene 3 (13s)
  timelineEntries.push([13.0, 'setBlackout(1);']);
  timelineEntries.push([13.2, 'setBlackout(0); hideEl("scene2"); showEl("scene3"); burnIn("steps-pre"); burnIn("steps-title");']);
  timelineEntries.push([14.0, 'showEl("step-1");']);
  timelineEntries.push([15.2, 'showEl("step-2");']);
  timelineEntries.push([16.4, 'showEl("step-3");']);

  // Scene 4 (18s)
  timelineEntries.push([18.0, 'setBlackout(1);']);
  timelineEntries.push([18.2, 'setBlackout(0); hideEl("scene3"); showEl("scene4"); burnIn("cta-content");']);
  timelineEntries.push([19.0, 'showEl("cta-handle");']);
  timelineEntries.push([19.8, 'showEl("cta-spots");']);
  timelineEntries.push([20.5, 'showEl("cta-free");']);

  timelineEntries.sort(function(a, b) { return a[0] - b[0]; });

  var timelineJs = timelineEntries.map(function(e) {
    return '    [' + e[0].toFixed(3) + ', function() { ' + e[1] + ' }]';
  }).join(',\n');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { margin: 0; padding: 0; background: #0c0c0c; overflow: hidden; }

  @keyframes burnIn {
    0% { opacity: 0; filter: brightness(3) blur(6px); }
    40% { opacity: 1; filter: brightness(1.8) blur(2px); }
    100% { opacity: 1; filter: brightness(1) blur(0); }
  }

  @keyframes grainShift {
    0% { transform: translate(0, 0); }
    33% { transform: translate(-2px, 1px); }
    66% { transform: translate(1px, -2px); }
    100% { transform: translate(0, 0); }
  }

  @keyframes hueShift {
    0%, 100% { background: rgba(255, 200, 150, 0.02); }
    33% { background: rgba(200, 255, 200, 0.015); }
    66% { background: rgba(200, 180, 255, 0.015); }
  }

  @keyframes dustFloat {
    0% { transform: translate(0, 0); }
    25% { transform: translate(15px, -25px); }
    50% { transform: translate(-10px, -15px); }
    75% { transform: translate(20px, -5px); }
    100% { transform: translate(0, 0); }
  }

  @keyframes blinkCursor {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
</style>
</head>
<body>
  <div id="root" style="width:${W}px;height:${H}px;position:relative;overflow:hidden;background:#0c0c0c;">

    <!-- PERSISTENT OVERLAYS -->

    <!-- Projector light beam from top -->
    <div style="position:absolute;top:-20px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:${W * 0.45}px solid transparent;border-right:${W * 0.45}px solid transparent;border-top:200px solid rgba(255,245,220,0.025);pointer-events:none;z-index:50;"></div>

    <!-- Warm color temperature -->
    <div style="position:absolute;inset:0;background:rgba(180,120,60,0.06);mix-blend-mode:multiply;pointer-events:none;z-index:51;"></div>

    <!-- Color shift -->
    <div style="position:absolute;inset:0;pointer-events:none;z-index:52;animation:hueShift 12s ease-in-out infinite;"></div>

    <!-- Vignette -->
    <div style="position:absolute;inset:0;background:radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 80%, rgba(0,0,0,0.85) 100%);pointer-events:none;z-index:53;"></div>

    <!-- Film grain -->
    <div style="position:absolute;inset:0;opacity:0.06;pointer-events:none;z-index:54;background-image:url(&quot;data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E&quot;);background-size:150px 150px;animation:grainShift 0.3s steps(3) infinite;"></div>

    <!-- Scanlines -->
    <div style="position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.03) 3px,rgba(0,0,0,0.03) 4px);pointer-events:none;z-index:55;"></div>

    <!-- Dust particles -->
    <div style="position:absolute;left:15%;top:25%;width:3px;height:3px;border-radius:50%;background:rgba(255,245,220,0.6);z-index:56;filter:blur(0.5px);animation:dustFloat 8s ease-in-out infinite;"></div>
    <div style="position:absolute;left:72%;top:40%;width:2px;height:2px;border-radius:50%;background:rgba(255,245,220,0.5);z-index:56;filter:blur(0.5px);animation:dustFloat 11s ease-in-out infinite 2s;"></div>
    <div style="position:absolute;left:45%;top:65%;width:2.5px;height:2.5px;border-radius:50%;background:rgba(255,245,220,0.4);z-index:56;filter:blur(0.5px);animation:dustFloat 9s ease-in-out infinite 4s;"></div>
    <div style="position:absolute;left:85%;top:15%;width:2px;height:2px;border-radius:50%;background:rgba(255,245,220,0.5);z-index:56;filter:blur(0.5px);animation:dustFloat 10s ease-in-out infinite 1s;"></div>

    <!-- Persistent title -->
    <div id="persistent-title" style="position:absolute;top:${SAFE_TOP + 20}px;left:0;right:0;text-align:center;z-index:45;pointer-events:none;opacity:0;">
      <div style="display:inline-block;background:rgba(0,0,0,0.65);padding:12px 28px;border-radius:6px;border:2px solid rgba(255,255,255,0.15);">
        <span style="font-family:system-ui,-apple-system,sans-serif;font-size:72px;font-weight:900;letter-spacing:3px;text-transform:uppercase;color:#fff;text-shadow:0 2px 4px rgba(0,0,0,0.9),0 0 20px rgba(0,0,0,0.7);">Manila </span><span style="font-family:system-ui,-apple-system,sans-serif;font-size:72px;font-weight:900;letter-spacing:3px;text-transform:uppercase;color:#E8443A;text-shadow:0 2px 4px rgba(0,0,0,0.9),0 0 20px rgba(232,68,58,0.5);">Free</span><br>
        <span style="font-family:system-ui,-apple-system,sans-serif;font-size:72px;font-weight:900;letter-spacing:3px;text-transform:uppercase;color:#fff;text-shadow:0 2px 4px rgba(0,0,0,0.9),0 0 20px rgba(0,0,0,0.7);">Photo Shoot</span>
      </div>
    </div>

    <!-- Blackout overlay -->
    <div id="blackout" style="position:absolute;inset:0;background:#000;z-index:60;opacity:0;pointer-events:none;"></div>

    <!-- SCENE 1: Title burn-in (0-3s) -->
    <div id="scene1" style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:2;opacity:0;">
      <div id="title-content" style="text-align:center;opacity:0;margin-top:200px;">
        <div style="font-family:'Courier New',monospace;font-size:40px;font-weight:bold;letter-spacing:6px;color:rgba(255,245,220,0.95);text-transform:uppercase;text-shadow:0 0 15px rgba(255,220,150,0.4),0 2px 6px rgba(0,0,0,0.6);">No Experience Needed</div>
      </div>
    </div>

    <!-- SCENE 2: Photo slideshow (3-13s) -->
    <div id="scene2" style="position:absolute;inset:0;z-index:1;opacity:0;">
      ${photoSlidesHtml}
    </div>

    <!-- SCENE 3: How It Works (13-18s) -->
    <div id="scene3" style="position:absolute;inset:0;z-index:1;opacity:0;display:flex;flex-direction:column;align-items:center;justify-content:center;">
      <div id="steps-content" style="text-align:center;width:874px;">
        <div style="font-family:'Courier New',monospace;font-size:36px;font-weight:bold;letter-spacing:10px;color:rgba(255,245,220,0.9);text-transform:uppercase;margin-bottom:20px;opacity:0;text-shadow:0 0 12px rgba(255,220,150,0.3),0 2px 4px rgba(0,0,0,0.6);" id="steps-pre">How It Works</div>
        <h2 style="font-family:'Courier New',monospace;font-size:84px;font-weight:700;letter-spacing:10px;color:rgba(255,245,220,1.0);text-transform:uppercase;margin:0;text-shadow:0 0 30px rgba(255,220,150,0.4),0 2px 8px rgba(0,0,0,0.6);opacity:0;" id="steps-title">3 Steps</h2>

        <div style="margin-top:60px;text-align:left;padding:0 40px;">
          <div style="margin-bottom:50px;opacity:0;" id="step-1">
            <div style="font-family:'Courier New',monospace;font-size:28px;font-weight:bold;letter-spacing:8px;color:rgba(255,245,220,0.85);text-transform:uppercase;text-shadow:0 0 10px rgba(255,220,150,0.3);">Step 01</div>
            <div style="font-family:'Courier New',monospace;font-size:44px;font-weight:700;letter-spacing:4px;color:rgba(255,245,220,1.0);text-transform:uppercase;margin-top:10px;text-shadow:0 0 15px rgba(255,220,150,0.3),0 2px 6px rgba(0,0,0,0.5);">DM me on Instagram</div>
            <div style="font-family:'Courier New',monospace;font-size:30px;letter-spacing:4px;color:rgba(255,245,220,0.85);margin-top:8px;text-shadow:0 2px 4px rgba(0,0,0,0.5);">Just say hey. I'll reply back.</div>
          </div>

          <div style="margin-bottom:50px;opacity:0;" id="step-2">
            <div style="font-family:'Courier New',monospace;font-size:28px;font-weight:bold;letter-spacing:8px;color:rgba(255,245,220,0.85);text-transform:uppercase;text-shadow:0 0 10px rgba(255,220,150,0.3);">Step 02</div>
            <div style="font-family:'Courier New',monospace;font-size:44px;font-weight:700;letter-spacing:4px;color:rgba(255,245,220,1.0);text-transform:uppercase;margin-top:10px;text-shadow:0 0 15px rgba(255,220,150,0.3),0 2px 6px rgba(0,0,0,0.5);">We pick a date</div>
            <div style="font-family:'Courier New',monospace;font-size:30px;letter-spacing:4px;color:rgba(255,245,220,0.85);margin-top:8px;text-shadow:0 2px 4px rgba(0,0,0,0.5);">Location + vibe planned together.</div>
          </div>

          <div style="opacity:0;" id="step-3">
            <div style="font-family:'Courier New',monospace;font-size:28px;font-weight:bold;letter-spacing:8px;color:rgba(255,245,220,0.85);text-transform:uppercase;text-shadow:0 0 10px rgba(255,220,150,0.3);">Step 03</div>
            <div style="font-family:'Courier New',monospace;font-size:44px;font-weight:700;letter-spacing:4px;color:rgba(255,245,220,1.0);text-transform:uppercase;margin-top:10px;text-shadow:0 0 15px rgba(255,220,150,0.3),0 2px 6px rgba(0,0,0,0.5);">Show up. I guide you.</div>
            <div style="font-family:'Courier New',monospace;font-size:30px;letter-spacing:4px;color:rgba(255,245,220,0.85);margin-top:8px;text-shadow:0 2px 4px rgba(0,0,0,0.5);">No posing experience needed.</div>
          </div>
        </div>
      </div>
    </div>

    <!-- SCENE 4: CTA (18-22s) -->
    <div id="scene4" style="position:absolute;inset:0;z-index:1;opacity:0;display:flex;flex-direction:column;align-items:center;justify-content:center;">
      <div id="cta-content" style="text-align:center;opacity:0;">
        <div style="font-family:'Courier New',monospace;font-size:36px;font-weight:bold;letter-spacing:8px;color:rgba(255,245,220,0.9);text-transform:uppercase;margin-bottom:20px;text-shadow:0 0 12px rgba(255,220,150,0.3),0 2px 4px rgba(0,0,0,0.6);">Interested?</div>
        <h2 style="font-family:'Courier New',monospace;font-size:80px;font-weight:700;letter-spacing:10px;color:rgba(255,245,220,1.0);text-transform:uppercase;margin:0;text-shadow:0 0 30px rgba(255,220,150,0.4),0 2px 8px rgba(0,0,0,0.6);">DM Me</h2>
        <div style="margin-top:50px;display:inline-block;border:2px solid rgba(255,245,220,0.5);padding:24px 50px;opacity:0;" id="cta-handle">
          <div style="font-family:'Courier New',monospace;font-size:52px;font-weight:700;letter-spacing:6px;color:rgba(255,245,220,1.0);text-transform:uppercase;text-shadow:0 0 20px rgba(255,220,150,0.4),0 2px 6px rgba(0,0,0,0.5);">@madebyaidan</div>
          <div style="font-family:'Courier New',monospace;font-size:28px;letter-spacing:6px;color:rgba(255,245,220,0.75);text-transform:uppercase;margin-top:10px;text-shadow:0 2px 4px rgba(0,0,0,0.5);">On Instagram</div>
        </div>
        <div style="margin-top:40px;opacity:0;" id="cta-spots">
          <div style="font-family:'Courier New',monospace;font-size:28px;font-weight:bold;letter-spacing:6px;color:rgba(255,245,220,0.8);text-transform:uppercase;text-shadow:0 0 10px rgba(255,220,150,0.3);animation:blinkCursor 2s ease-in-out infinite;">Limited Spots This Month</div>
        </div>
        <div style="font-family:'Courier New',monospace;font-size:28px;letter-spacing:4px;color:rgba(255,245,220,0.7);text-transform:uppercase;margin-top:60px;opacity:0;text-shadow:0 2px 4px rgba(0,0,0,0.5);" id="cta-free">100% Free · No Strings Attached</div>
      </div>
    </div>

  </div>

<script>
  function showEl(id) {
    var el = document.getElementById(id);
    if (el) el.style.opacity = '1';
  }
  function hideEl(id) {
    var el = document.getElementById(id);
    if (el) el.style.opacity = '0';
  }
  function burnIn(id) {
    var el = document.getElementById(id);
    if (el) { el.style.opacity = '1'; el.style.animation = 'burnIn 2s ease-out forwards'; }
  }
  function setBlackout(v) {
    var el = document.getElementById('blackout');
    if (el) el.style.opacity = String(v);
  }
  function showSlide(i) {
    var el = document.getElementById('slide-' + i);
    if (el) el.style.opacity = '1';
  }
  function hideSlide(i) {
    var el = document.getElementById('slide-' + i);
    if (el) el.style.opacity = '0';
  }

  var timeline = [
${timelineJs}
  ];

  window.__applyUpTo = function(t) {
    for (var i = 0; i < timeline.length; i++) {
      if (timeline[i][0] <= t) timeline[i][1]();
    }
  };

  if (location.search.includes('capture=1')) {
    var style = document.createElement('style');
    style.textContent = '*, *::before, *::after { transition-duration: 0s !important; animation-duration: 0s !important; }';
    document.head.appendChild(style);
  }
</script>
</body>
</html>`;
}

async function main() {
  console.log('=== Film Projector Gray Dress Staircase v54a ===');
  resetOutputDir();

  console.log('Processing photos...');
  var processedPhotos = processPhotos();

  console.log('Loading photos as base64...');
  var imageDataMap = {};
  for (var i = 0; i < PHOTO_NAMES.length; i++) {
    var buf = readFileSync(processedPhotos[i]);
    imageDataMap[PHOTO_NAMES[i]] = 'data:image/jpeg;base64,' + buf.toString('base64');
    console.log('  ' + PHOTO_NAMES[i] + ' (' + (buf.length / 1024).toFixed(0) + ' KB)');
  }

  var html = buildHTML(imageDataMap);
  var htmlPath = path.join(OUT_DIR, 'render.html');
  writeFileSync(htmlPath, html);

  var framesDir = path.join(OUT_DIR, 'tmp-frames');
  mkdirSync(framesDir, { recursive: true });

  var browser = await chromium.launch();
  var page = await browser.newPage({ viewport: { width: W, height: H } });
  await page.goto('file://' + htmlPath + '?capture=1', { waitUntil: 'load' });
  await page.waitForTimeout(500);

  console.log('Capturing ' + TOTAL_FRAMES + ' frames (' + TOTAL_DURATION + 's @ ' + FPS + 'fps)...');

  for (var frame = 0; frame < TOTAL_FRAMES; frame++) {
    var t = frame / FPS;

    await page.evaluate(function(time) {
      // Reset scenes
      ['scene1','scene2','scene3','scene4','persistent-title'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.style.opacity = '0';
      });

      // Reset title content
      ['title-content','steps-pre','steps-title'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) { el.style.opacity = '0'; el.style.animation = 'none'; }
      });

      // Reset steps
      ['step-1','step-2','step-3'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.style.opacity = '0';
      });

      // Reset CTA
      ['cta-content','cta-handle','cta-spots','cta-free'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) { el.style.opacity = '0'; el.style.animation = 'none'; }
      });

      // Reset blackout
      var bo = document.getElementById('blackout');
      if (bo) bo.style.opacity = '0';

      // Reset slides
      for (var i = 0; i < 20; i++) {
        var sl = document.getElementById('slide-' + i);
        if (!sl) break;
        sl.style.opacity = '0';
      }

      window.__applyUpTo(time);
    }, t);

    await page.waitForTimeout(2);

    var padded = String(frame).padStart(5, '0');
    await page.screenshot({
      path: path.join(framesDir, 'frame_' + padded + '.png'),
      type: 'png',
    });

    if (frame % (FPS * 2) === 0) {
      console.log('  ' + t.toFixed(1) + 's / ' + TOTAL_DURATION + 's');
    }
  }

  await browser.close();
  console.log('All frames captured. Encoding video...');

  var finalMp4 = path.join(OUT_DIR, 'manila-film-projector-v54a.mp4');
  execSync(
    'ffmpeg -y -framerate ' + FPS + ' -i "' + path.join(framesDir, 'frame_%05d.png') + '" ' +
    '-c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r ' + FPS + ' ' +
    '"' + finalMp4 + '"',
    { stdio: 'inherit' }
  );
  rmSync(framesDir, { recursive: true, force: true });

  var reelsDir = path.join(__dirname, 'reels');
  if (!existsSync(reelsDir)) mkdirSync(reelsDir, { recursive: true });
  execSync('cp "' + finalMp4 + '" "' + path.join(reelsDir, 'manila-film-projector-v54a.mp4') + '"');

  var sz = statSync(finalMp4);
  console.log('Final: ' + (sz.size / (1024 * 1024)).toFixed(1) + ' MB');
  console.log('Copied to reels/manila-film-projector-v54a.mp4');
  console.log('=== Done ===');
}

main().catch(function(err) {
  console.error(err);
  process.exit(1);
});
