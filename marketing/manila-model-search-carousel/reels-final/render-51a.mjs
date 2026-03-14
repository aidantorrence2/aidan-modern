import { chromium } from 'playwright';
import { execSync } from 'child_process';
import { mkdirSync, rmSync, existsSync, readFileSync, writeFileSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

var __dirname = path.dirname(fileURLToPath(import.meta.url));
var OUT_DIR = path.join(__dirname, 'output-51a');

var W = 1080;
var H = 1920;
var FPS = 30;
var SAFE_TOP = 213;
var SAFE_BOTTOM = 430;

var FILM_SCANS_DIR = '/Volumes/PortableSSD/Exports/film scans';
var PHOTO_NAMES = [
  'DSC_0064-3.jpg',
  'DSC_0065.jpg',
  'DSC_0066.jpg',
  'DSC_0071.jpg',
  'DSC_0074.jpg',
  'DSC_0075.jpg',
  'DSC_0034-2.jpg',
  'DSC_0035.jpg',
];

var TOTAL_FRAMES = 720; // 24s at 30fps

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
  var n = PHOTO_NAMES.length;

  var photoHtml = PHOTO_NAMES.map(function(name, i) {
    return (
      '<div id="photo-wrap-' + i + '" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:0;">' +
        '<div style="position:relative;border:1px solid rgba(140,30,30,0.3);padding:14px;background:rgba(40,5,5,0.3);max-width:90%;max-height:80%;">' +
          '<div style="position:relative;overflow:hidden;line-height:0;">' +
            '<img id="photo-img-' + i + '" src="' + imageDataMap[name] + '" style="width:100%;height:auto;display:block;max-height:' + (H - SAFE_BOTTOM - SAFE_TOP - 300) + 'px;object-fit:contain;filter:brightness(0.3) saturate(0) sepia(1) hue-rotate(320deg);"/>' +
            '<div id="photo-red-' + i + '" style="position:absolute;inset:0;background:radial-gradient(ellipse at 30% 20%, rgba(180,30,30,0.2) 0%, transparent 50%);pointer-events:none;"></div>' +
            '<div id="photo-wash-' + i + '" style="position:absolute;inset:0;overflow:hidden;pointer-events:none;">' +
              '<div style="position:absolute;top:0;left:0;width:200%;height:100%;background:linear-gradient(90deg, transparent 0%, rgba(180,40,40,0.08) 40%, rgba(180,40,40,0.12) 50%, rgba(180,40,40,0.08) 60%, transparent 100%);"></div>' +
            '</div>' +
          '</div>' +
          '<div style="display:flex;justify-content:space-between;align-items:baseline;margin-top:16px;padding:0 4px;">' +
            '<span style="font-family:system-ui,sans-serif;font-size:28px;color:#ddbbbb;letter-spacing:4px;text-transform:uppercase;font-weight:300;">Night</span>' +
            '<span style="font-family:ui-monospace,monospace;font-size:22px;color:#bb8888;letter-spacing:2px;">Manila</span>' +
          '</div>' +
          '<div style="position:absolute;top:-20px;right:14px;font-family:ui-monospace,monospace;font-size:20px;color:#886666;letter-spacing:2px;">' + String(i + 1).padStart(2, '0') + 'A</div>' +
        '</div>' +
      '</div>'
    );
  }).join('\n');

  var timelineJs = '';

  // Persistent title fades in
  timelineJs += '    [0.2, function() { var el = document.getElementById("persistent-title"); if (el) { el.style.opacity = "1"; } }],\n';

  // Scene 2: photos develop one by one, ~1.65s each
  for (var i = 0; i < n; i++) {
    var startMs = (0.5 + i * 1.65);
    timelineJs += '    [' + startMs.toFixed(3) + ', function() {\n';
    timelineJs += '      var wrap = document.getElementById("photo-wrap-' + i + '"); if (wrap) wrap.style.opacity = "1";\n';
    timelineJs += '      var ctr = document.getElementById("counter"); if (ctr) ctr.textContent = "' + String(i + 1).padStart(2, '0') + ' / ' + String(n).padStart(2, '0') + '";\n';
    timelineJs += '    }],\n';

    var devMs = (startMs + 0.1);
    timelineJs += '    [' + devMs.toFixed(3) + ', function() {\n';
    timelineJs += '      var img = document.getElementById("photo-img-' + i + '"); if (img) img.style.filter = "brightness(1) saturate(1) sepia(0) hue-rotate(0deg)";\n';
    timelineJs += '      var red = document.getElementById("photo-red-' + i + '"); if (red) red.style.opacity = "0";\n';
    timelineJs += '      var wash = document.getElementById("photo-wash-' + i + '"); if (wash) wash.style.opacity = "0";\n';
    timelineJs += '    }],\n';

    if (i < n - 1) {
      var hideMs = (startMs + 1.45);
      timelineJs += '    [' + hideMs.toFixed(3) + ', function() {\n';
      timelineJs += '      var wrap = document.getElementById("photo-wrap-' + i + '"); if (wrap) wrap.style.opacity = "0";\n';
      timelineJs += '    }],\n';
    }
  }

  // Scene 3 at 14s
  timelineJs += '    [14.0, function() {\n';
  timelineJs += '      document.getElementById("scene2").style.opacity = "0";\n';
  timelineJs += '      document.getElementById("scene3").style.opacity = "1";\n';
  timelineJs += '    }],\n';
  timelineJs += '    [14.2, function() { var el = document.getElementById("steps-head"); if (el) el.style.opacity = "1"; }],\n';
  timelineJs += '    [14.8, function() { var el = document.getElementById("s3-step1"); if (el) el.style.opacity = "1"; }],\n';
  timelineJs += '    [15.8, function() { var el = document.getElementById("s3-step2"); if (el) el.style.opacity = "1"; }],\n';
  timelineJs += '    [16.8, function() { var el = document.getElementById("s3-step3"); if (el) el.style.opacity = "1"; }],\n';

  // Scene 4 at 18s
  timelineJs += '    [18.0, function() {\n';
  timelineJs += '      document.getElementById("scene3").style.opacity = "0";\n';
  timelineJs += '      document.getElementById("scene4").style.opacity = "1";\n';
  timelineJs += '      var ctr = document.getElementById("counter"); if (ctr) ctr.textContent = "";\n';
  timelineJs += '    }],\n';
  timelineJs += '    [18.2, function() { var el = document.getElementById("cta-content"); if (el) el.style.opacity = "1"; }],\n';
  timelineJs += '    [19.2, function() { var el = document.getElementById("cta-handle"); if (el) el.style.opacity = "1"; }],\n';
  timelineJs += '    [20.0, function() { var el = document.getElementById("cta-spots"); if (el) el.style.opacity = "1"; }],\n';
  timelineJs += '    [20.6, function() { var el = document.getElementById("cta-free"); if (el) el.style.opacity = "1"; }],\n';
  timelineJs += '    [24.0, function() { /* end */ }]\n';

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { margin: 0; padding: 0; background: #1a0000; overflow: hidden; }
</style>
</head>
<body>
  <div id="root" style="width:${W}px;height:${H}px;position:relative;overflow:hidden;background:#1a0000;">

    <!-- Safelight glow from top -->
    <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 0%, rgba(180,30,30,0.15) 0%, transparent 60%);pointer-events:none;z-index:50;"></div>

    <!-- Chemical tray reflection at bottom -->
    <div style="position:absolute;bottom:0;left:0;width:100%;height:200px;background:linear-gradient(to top, rgba(140,20,20,0.06) 0%, transparent 100%);pointer-events:none;z-index:50;"></div>

    <!-- Developer drip lines on sides -->
    <div style="position:absolute;top:0;left:30px;width:1px;height:60%;background:linear-gradient(180deg, rgba(180,30,30,0.15) 0%, transparent 100%);z-index:51;pointer-events:none;"></div>
    <div style="position:absolute;top:0;right:45px;width:1px;height:50%;background:linear-gradient(180deg, rgba(180,30,30,0.1) 0%, transparent 100%);z-index:51;pointer-events:none;"></div>

    <!-- Persistent title -->
    <div id="persistent-title" style="position:absolute;top:${SAFE_TOP + 20}px;left:0;right:0;text-align:center;z-index:45;pointer-events:none;opacity:0;">
      <div style="display:inline-block;background:rgba(0,0,0,0.6);padding:10px 24px;border-radius:4px;border:1px solid rgba(255,255,255,0.1);">
        <span style="font-family:system-ui,-apple-system,sans-serif;font-size:72px;font-weight:900;letter-spacing:3px;text-transform:uppercase;color:#fff;text-shadow:0 2px 4px rgba(0,0,0,0.9);">Manila </span><span style="font-family:system-ui,-apple-system,sans-serif;font-size:72px;font-weight:900;letter-spacing:3px;text-transform:uppercase;color:#E8443A;text-shadow:0 2px 4px rgba(0,0,0,0.9),0 0 15px rgba(232,68,58,0.5);">Free</span><br>
        <span style="font-family:system-ui,-apple-system,sans-serif;font-size:72px;font-weight:900;letter-spacing:3px;text-transform:uppercase;color:#fff;text-shadow:0 2px 4px rgba(0,0,0,0.9);">Photo Shoot</span>
      </div>
    </div>

    <!-- Counter -->
    <div id="counter" style="position:absolute;right:40px;bottom:${SAFE_BOTTOM + 30}px;z-index:55;font-family:ui-monospace,monospace;font-size:24px;color:#cc8888;letter-spacing:2px;"></div>

    <!-- SCENE 2: Photo slideshow -->
    <div id="scene2" style="position:absolute;inset:0;z-index:5;opacity:1;">
      ${photoHtml}
    </div>

    <!-- SCENE 3: Steps -->
    <div id="scene3" style="position:absolute;inset:0;z-index:5;opacity:0;display:flex;flex-direction:column;justify-content:center;padding:0 86px;">
      <div style="opacity:0;" id="steps-head">
        <div style="font-family:system-ui,sans-serif;font-size:24px;letter-spacing:6px;color:#bb8888;text-transform:uppercase;font-weight:300;margin-bottom:16px;">How It Works</div>
        <h2 style="font-family:system-ui,sans-serif;font-size:80px;font-weight:300;letter-spacing:6px;color:#eecccc;text-transform:uppercase;margin:0;">3 Steps</h2>
      </div>
      <div style="margin-top:60px;">
        <div style="margin-bottom:50px;opacity:0;border-left:2px solid rgba(140,30,30,0.3);padding-left:28px;" id="s3-step1">
          <div style="font-family:ui-monospace,monospace;font-size:20px;letter-spacing:4px;color:#886666;text-transform:uppercase;">01</div>
          <div style="font-family:system-ui,sans-serif;font-size:42px;font-weight:300;letter-spacing:3px;color:#eecccc;text-transform:uppercase;margin-top:8px;">DM me on Instagram</div>
          <div style="font-family:system-ui,sans-serif;font-size:26px;color:#bb8888;letter-spacing:2px;margin-top:8px;">Just say hey. I'll reply back.</div>
        </div>
        <div style="margin-bottom:50px;opacity:0;border-left:2px solid rgba(140,30,30,0.3);padding-left:28px;" id="s3-step2">
          <div style="font-family:ui-monospace,monospace;font-size:20px;letter-spacing:4px;color:#886666;text-transform:uppercase;">02</div>
          <div style="font-family:system-ui,sans-serif;font-size:42px;font-weight:300;letter-spacing:3px;color:#eecccc;text-transform:uppercase;margin-top:8px;">We pick a date</div>
          <div style="font-family:system-ui,sans-serif;font-size:26px;color:#bb8888;letter-spacing:2px;margin-top:8px;">Location + vibe planned together.</div>
        </div>
        <div style="opacity:0;border-left:2px solid rgba(140,30,30,0.3);padding-left:28px;" id="s3-step3">
          <div style="font-family:ui-monospace,monospace;font-size:20px;letter-spacing:4px;color:#886666;text-transform:uppercase;">03</div>
          <div style="font-family:system-ui,sans-serif;font-size:42px;font-weight:300;letter-spacing:3px;color:#eecccc;text-transform:uppercase;margin-top:8px;">Show up. I guide you.</div>
          <div style="font-family:system-ui,sans-serif;font-size:26px;color:#bb8888;letter-spacing:2px;margin-top:8px;">No posing experience needed.</div>
        </div>
      </div>
    </div>

    <!-- SCENE 4: CTA -->
    <div id="scene4" style="position:absolute;inset:0;z-index:5;opacity:0;display:flex;flex-direction:column;align-items:center;justify-content:center;">
      <div id="cta-content" style="text-align:center;opacity:0;">
        <div style="font-family:system-ui,sans-serif;font-size:24px;letter-spacing:6px;color:#bb8888;text-transform:uppercase;font-weight:300;margin-bottom:20px;">Interested?</div>
        <h2 style="font-family:system-ui,sans-serif;font-size:80px;font-weight:300;letter-spacing:8px;color:#eecccc;text-transform:uppercase;margin:0;">DM Me</h2>
        <div style="margin-top:50px;border:1px solid rgba(238,204,204,0.3);padding:28px 56px;opacity:0;" id="cta-handle">
          <div style="font-family:system-ui,sans-serif;font-size:48px;letter-spacing:4px;color:#eecccc;font-weight:300;">@madebyaidan</div>
          <div style="font-family:system-ui,sans-serif;font-size:20px;letter-spacing:4px;color:#bb8888;text-transform:uppercase;margin-top:10px;">On Instagram</div>
        </div>
        <div style="margin-top:40px;opacity:0;" id="cta-spots">
          <div style="font-family:ui-monospace,monospace;font-size:22px;letter-spacing:4px;color:#cc8888;">Limited Spots This Month</div>
        </div>
        <div style="margin-top:24px;font-family:ui-monospace,monospace;font-size:18px;color:#886666;letter-spacing:3px;opacity:0;" id="cta-free">100% Free · No Strings</div>
      </div>
    </div>

  </div>

  <script>
    var timeline = [
${timelineJs}    ];

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
  console.log('=== Darkroom Night Sequin/Urban reel v51a ===');
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
  var htmlPath = path.join(OUT_DIR, 'darkroom.html');
  writeFileSync(htmlPath, html);

  var framesDir = path.join(OUT_DIR, 'tmp-frames');
  mkdirSync(framesDir, { recursive: true });

  var browser = await chromium.launch();
  var page = await browser.newPage({ viewport: { width: W, height: H } });
  await page.goto('file://' + htmlPath + '?capture=1', { waitUntil: 'load' });
  await page.waitForTimeout(500);

  console.log('Capturing ' + TOTAL_FRAMES + ' frames...');

  for (var frame = 0; frame < TOTAL_FRAMES; frame++) {
    var t = frame / FPS;

    await page.evaluate(function(time) {
      // Reset all state
      var n = 8;
      for (var i = 0; i < n; i++) {
        var wrap = document.getElementById('photo-wrap-' + i);
        if (wrap) wrap.style.opacity = '0';
        var img = document.getElementById('photo-img-' + i);
        if (img) img.style.filter = 'brightness(0.3) saturate(0) sepia(1) hue-rotate(320deg)';
        var red = document.getElementById('photo-red-' + i);
        if (red) red.style.opacity = '1';
        var wash = document.getElementById('photo-wash-' + i);
        if (wash) wash.style.opacity = '1';
      }
      var title = document.getElementById('persistent-title');
      if (title) title.style.opacity = '0';
      var ctr = document.getElementById('counter');
      if (ctr) ctr.textContent = '';
      document.getElementById('scene2').style.opacity = '1';
      document.getElementById('scene3').style.opacity = '0';
      document.getElementById('scene4').style.opacity = '0';
      var sh = document.getElementById('steps-head'); if (sh) sh.style.opacity = '0';
      var s1 = document.getElementById('s3-step1'); if (s1) s1.style.opacity = '0';
      var s2 = document.getElementById('s3-step2'); if (s2) s2.style.opacity = '0';
      var s3 = document.getElementById('s3-step3'); if (s3) s3.style.opacity = '0';
      var cc = document.getElementById('cta-content'); if (cc) cc.style.opacity = '0';
      var ch = document.getElementById('cta-handle'); if (ch) ch.style.opacity = '0';
      var cs = document.getElementById('cta-spots'); if (cs) cs.style.opacity = '0';
      var cf = document.getElementById('cta-free'); if (cf) cf.style.opacity = '0';
      window.__applyUpTo(time);
    }, t);

    await page.waitForTimeout(2);

    var padded = String(frame).padStart(5, '0');
    await page.screenshot({
      path: path.join(framesDir, 'frame_' + padded + '.png'),
      type: 'png',
    });

    if (frame % (FPS * 4) === 0) {
      console.log('  ' + t.toFixed(1) + 's / ' + (TOTAL_FRAMES / FPS) + 's');
    }
  }

  await browser.close();
  console.log('All frames captured');

  var finalMp4 = path.join(OUT_DIR, 'manila-darkroom-v51a.mp4');
  execSync(
    'ffmpeg -y -framerate ' + FPS + ' -i "' + path.join(framesDir, 'frame_%05d.png') + '" ' +
    '-c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r ' + FPS + ' "' + finalMp4 + '"',
    { stdio: 'inherit' }
  );
  rmSync(framesDir, { recursive: true, force: true });

  var reelsDir = path.join(__dirname, 'reels');
  if (!existsSync(reelsDir)) mkdirSync(reelsDir, { recursive: true });
  var reelsDst = path.join(reelsDir, 'manila-darkroom-v51a.mp4');
  execSync('cp "' + finalMp4 + '" "' + reelsDst + '"');

  var sz = statSync(finalMp4);
  console.log('Final: ' + (sz.size / (1024 * 1024)).toFixed(1) + ' MB');
  console.log('Copied to reels/manila-darkroom-v51a.mp4');
  console.log('=== Done ===');
}

main().catch(function(err) {
  console.error(err);
  process.exit(1);
});
