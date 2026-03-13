import { chromium } from 'playwright';
import { execSync } from 'child_process';
import { mkdirSync, writeFileSync, rmSync, existsSync, statSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

var __dirname = path.dirname(fileURLToPath(import.meta.url));

var OUT_DIR = path.join(__dirname, 'output-35b');
var IMG_DIR = '/Users/aidantorrence/Documents/aidan-modern/public/images/large';
var FRAMES_DIR = path.join(OUT_DIR, 'tmp-frames');
var W = 1080;
var H = 1920;
var FPS = 30;
var DURATION = 15;
var TOTAL_FRAMES = Math.ceil(DURATION * FPS);

var PROOF_PHOTOS = [
  'manila-gallery-dsc-0190.jpg',
  'manila-gallery-night-001.jpg',
  'manila-gallery-garden-001.jpg',
  'manila-gallery-urban-001.jpg',
  'manila-gallery-canal-001.jpg',
  'manila-gallery-ivy-001.jpg',
  'manila-gallery-closeup-001.jpg',
  'manila-gallery-dsc-0911.jpg',
];


function buildHTML(imageDataMap) {
  var photoImgTags = '';
  for (var i = 0; i < PROOF_PHOTOS.length; i++) {
    var src = imageDataMap[PROOF_PHOTOS[i]];
    photoImgTags += '<img id="photo' + i + '" src="' + src + '" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;object-position:center 20%;opacity:0;transform:scale(1.15);"/>\n';
  }

  var html = '<!DOCTYPE html>\n';
  html += '<html>\n<head>\n<meta charset="utf-8">\n<style>\n';
  html += '  * { margin: 0; padding: 0; box-sizing: border-box; }\n';
  html += '  body {\n    width: 1080px;\n    height: 1920px;\n    overflow: hidden;\n    background: #0a0a0a;\n    font-family: -apple-system, system-ui, "Helvetica Neue", sans-serif;\n    color: white;\n  }\n';
  html += '  .scene {\n    position: absolute;\n    top: 0; left: 0;\n    width: 100%; height: 100%;\n    display: flex;\n    flex-direction: column;\n    align-items: center;\n    justify-content: center;\n    opacity: 0;\n    pointer-events: none;\n  }\n';
  html += '  .scene.active { opacity: 1; }\n';
  html += '  .hit-text {\n    font-size: 88px;\n    font-weight: 800;\n    text-align: center;\n    line-height: 1.15;\n    padding: 0 70px;\n    letter-spacing: -0.03em;\n    transform: scale(0);\n    opacity: 0;\n  }\n';
  html += '  .hit-text.pop { transform: scale(1); opacity: 1; }\n';
  html += '  .sub-text {\n    font-size: 48px;\n    font-weight: 500;\n    color: rgba(255,255,255,0.5);\n    text-align: center;\n    margin-top: 16px;\n    transform: scale(0);\n    opacity: 0;\n  }\n';
  html += '  .sub-text.pop { transform: scale(1); opacity: 1; }\n';
  html += '  .accent { color: #E8443A; }\n';
  html += '  @keyframes shake {\n    0%, 100% { transform: translate(0,0); }\n    10% { transform: translate(-14px, 10px); }\n    20% { transform: translate(12px, -8px); }\n    30% { transform: translate(-10px, -12px); }\n    40% { transform: translate(8px, 14px); }\n    50% { transform: translate(-12px, -6px); }\n    60% { transform: translate(10px, 8px); }\n    70% { transform: translate(-8px, 12px); }\n    80% { transform: translate(14px, -10px); }\n    90% { transform: translate(-6px, 8px); }\n  }\n';
  html += '  .shake { animation: shake 0.4s ease-out; }\n';
  html += '  .flash-overlay {\n    position: absolute;\n    top: 0; left: 0;\n    width: 100%; height: 100%;\n    background: white;\n    opacity: 0;\n    pointer-events: none;\n    z-index: 100;\n  }\n';
  html += '  .photo-container {\n    position: absolute;\n    top: 213px; left: 66px;\n    width: 948px; height: 1277px;\n    overflow: hidden;\n    border-radius: 12px;\n  }\n';
  html += '  @keyframes pulse-glow {\n    0%, 100% { opacity: 1; }\n    50% { opacity: 0.7; }\n  }\n';
  html += '  .pulse { animation: pulse-glow 0.8s ease-in-out infinite; }\n';
  html += '</style>\n</head>\n<body>\n\n';

  // Scene 1: MANILA FREE PHOTO SHOOT
  html += '  <div class="scene" id="scene1" style="background:#0a0a0a">\n';
  html += '    <div class="hit-text" id="s1line1" style="font-size:90px;font-weight:900;letter-spacing:0.02em">MANILA</div>\n';
  html += '    <div class="hit-text" id="s1line2" style="font-size:78px;font-weight:900;margin-top:10px"><span class="accent">FREE</span> PHOTO SHOOT</div>\n';
  html += '  </div>\n\n';

  // Scene 2: Professional. Editorial. Free.
  html += '  <div class="scene" id="scene2" style="background:#0a0a0a">\n';
  html += '    <div class="hit-text" id="s2text" style="font-size:80px">Professional.<br>Editorial.<br><span class="accent">Free.</span></div>\n';
  html += '  </div>\n\n';

  // Scene 3: Scrolling Instagram?
  html += '  <div class="scene" id="scene3" style="background:#0a0a0a">\n';
  html += '    <svg width="200" height="340" viewBox="0 0 200 340" style="margin-bottom:30px">\n';
  html += '      <rect x="10" y="10" width="180" height="320" rx="24" fill="#1a1a1a" stroke="#333" stroke-width="2"/>\n';
  html += '      <rect x="20" y="35" width="160" height="270" rx="4" fill="#111"/>\n';
  html += '      <rect x="60" y="10" width="80" height="16" rx="8" fill="#0a0a0a"/>\n';
  html += '    </svg>\n';
  html += '    <div class="hit-text" id="s3text" style="font-size:72px">Scrolling<br>Instagram?</div>\n';
  html += '  </div>\n\n';

  // Scene 4: Except you don't have photos like this:
  html += '  <div class="scene" id="scene4" style="background:#0a0a0a">\n';
  html += '    <div class="hit-text" id="s4text" style="font-size:64px">Except you don\'t<br>have photos<br>like <span class="accent">this:</span></div>\n';
  html += '  </div>\n\n';

  // Scene 5: PHOTO SHOWCASE
  html += '  <div class="scene" id="scene5" style="background:#0a0a0a">\n';
  html += '    <div class="flash-overlay" id="photoFlash"></div>\n';
  html += '    <div class="photo-container" id="photoContainer">\n';
  html += photoImgTags;
  html += '    </div>\n';
  html += '  </div>\n\n';

  // Scene 6: Want this?
  html += '  <div class="scene" id="scene6" style="background:#0a0a0a">\n';
  html += '    <div class="hit-text" id="s6text" style="font-size:110px;font-weight:900">Want this?</div>\n';
  html += '  </div>\n\n';

  // Scene 7: CTA
  html += '  <div class="scene" id="scene7" style="background:#0a0a0a">\n';
  html += '    <div class="hit-text" id="s7cta" style="font-size:64px;color:#E8443A;font-weight:900">DM @madebyaidan</div>\n';
  html += '    <div class="sub-text" id="s7sub" style="font-size:40px;color:rgba(255,255,255,0.5);margin-top:24px">on Instagram</div>\n';
  html += '  </div>\n\n';

  // Script
  html += '<script>\n';
  html += '  window.__currentTime = 0;\n\n';

  // Build timeline
  html += '  var timeline = [\n';

  // Scene 1: 0-1.2s — MANILA FREE PHOTO SHOOT
  html += '    [0, function() { document.getElementById("scene1").classList.add("active"); }],\n';
  html += '    [0.1, function() { document.getElementById("s1line1").classList.add("pop"); }],\n';
  html += '    [0.15, function() { document.getElementById("scene1").classList.add("shake"); }],\n';
  html += '    [0.4, function() { document.getElementById("s1line2").classList.add("pop"); }],\n';
  html += '    [1.2, function() { document.getElementById("scene1").classList.remove("active"); }],\n';

  // Scene 2: 1.2-2.0s — Professional. Editorial. Free.
  html += '    [1.2, function() { document.getElementById("scene2").classList.add("active"); }],\n';
  html += '    [1.3, function() { document.getElementById("s2text").classList.add("pop"); }],\n';
  html += '    [2.0, function() { document.getElementById("scene2").classList.remove("active"); }],\n';

  // Scene 3: 2.0-3.0s — Scrolling Instagram?
  html += '    [2.0, function() { document.getElementById("scene3").classList.add("active"); }],\n';
  html += '    [2.1, function() { document.getElementById("s3text").classList.add("pop"); }],\n';
  html += '    [3.0, function() { document.getElementById("scene3").classList.remove("active"); }],\n';

  // Scene 4: 3.0-4.0s — Except you don't have photos like this:
  html += '    [3.0, function() { document.getElementById("scene4").classList.add("active"); }],\n';
  html += '    [3.1, function() { document.getElementById("s4text").classList.add("pop"); }],\n';
  html += '    [3.5, function() { document.getElementById("scene4").classList.add("shake"); }],\n';
  html += '    [4.0, function() { document.getElementById("scene4").classList.remove("active"); }],\n';

  // Scene 5: 4.0-12.0s — Photo showcase (8 photos, ~1s each)
  html += '    [4.0, function() { document.getElementById("scene5").classList.add("active"); }],\n';

  var photoStart = 4.0;
  var photoDur = 1.0;
  for (var pi = 0; pi < 8; pi++) {
    var t = photoStart + pi * photoDur;
    // Flash before each photo (except first)
    if (pi > 0) {
      html += '    [' + (t - 0.05).toFixed(2) + ', function() { document.getElementById("photoFlash").style.opacity = "0.8"; }],\n';
      html += '    [' + (t + 0.05).toFixed(2) + ', function() { document.getElementById("photoFlash").style.opacity = "0"; }],\n';
    }
    // Show photo, hide others
    html += '    [' + t.toFixed(2) + ', function() {\n';
    for (var pj = 0; pj < 8; pj++) {
      if (pj === pi) {
        html += '      document.getElementById("photo' + pj + '").style.opacity = "1";\n';
        html += '      document.getElementById("photo' + pj + '").style.transform = "scale(1)";\n';
      } else {
        html += '      document.getElementById("photo' + pj + '").style.opacity = "0";\n';
        html += '      document.getElementById("photo' + pj + '").style.transform = "scale(1.15)";\n';
      }
    }
    html += '    }],\n';
  }

  html += '    [12.0, function() { document.getElementById("scene5").classList.remove("active"); }],\n';

  // Scene 6: 12.0-13.0s — Want this?
  html += '    [12.0, function() { document.getElementById("scene6").classList.add("active"); }],\n';
  html += '    [12.1, function() { document.getElementById("s6text").classList.add("pop"); }],\n';
  html += '    [12.2, function() { document.getElementById("scene6").classList.add("shake"); }],\n';
  html += '    [13.0, function() { document.getElementById("scene6").classList.remove("active"); }],\n';

  // Scene 7: 13.0-15.0s — CTA
  html += '    [13.0, function() { document.getElementById("scene7").classList.add("active"); }],\n';
  html += '    [13.1, function() { document.getElementById("s7cta").classList.add("pop"); }],\n';
  html += '    [13.4, function() { document.getElementById("s7sub").classList.add("pop"); }],\n';
  html += '    [13.8, function() { document.getElementById("s7cta").classList.add("pulse"); }],\n';
  html += '    [15.0, function() { /* end */ }]\n';

  html += '  ];\n\n';

  // Timeline runner
  html += '  var started = false;\n';
  html += '  function runTimeline() {\n';
  html += '    if (started) return;\n';
  html += '    started = true;\n';
  html += '    var t0 = performance.now();\n';
  html += '    var idx = 0;\n';
  html += '    function tick() {\n';
  html += '      var elapsed = (performance.now() - t0) / 1000;\n';
  html += '      while (idx < timeline.length && timeline[idx][0] <= elapsed) {\n';
  html += '        timeline[idx][1]();\n';
  html += '        idx++;\n';
  html += '      }\n';
  html += '      if (idx < timeline.length) requestAnimationFrame(tick);\n';
  html += '    }\n';
  html += '    requestAnimationFrame(tick);\n';
  html += '  }\n\n';

  html += '  if (!location.search.includes("capture=1")) {\n';
  html += '    runTimeline();\n';
  html += '  }\n\n';

  html += '  window.__applyUpTo = function(t) {\n';
  html += '    for (var i = 0; i < timeline.length; i++) {\n';
  html += '      if (timeline[i][0] <= t) timeline[i][1]();\n';
  html += '    }\n';
  html += '  };\n\n';

  html += '  window.__timeline = timeline;\n\n';

  html += '  if (location.search.includes("capture=1")) {\n';
  html += '    var style = document.createElement("style");\n';
  html += '    style.textContent = "*, *::before, *::after { transition-duration: 0s !important; animation-duration: 0s !important; }";\n';
  html += '    document.head.appendChild(style);\n';
  html += '  }\n';

  html += '</script>\n</body>\n</html>';

  return html;
}

async function main() {
  console.log('=== Manila Animated Story v35b (Snappier, Photo-Forward) ===');

  rmSync(OUT_DIR, { recursive: true, force: true });
  mkdirSync(OUT_DIR, { recursive: true });
  mkdirSync(FRAMES_DIR, { recursive: true });

  // Load photos as base64
  console.log('=== Loading photos as base64 ===');
  var imageDataMap = {};
  for (var p = 0; p < PROOF_PHOTOS.length; p++) {
    var photo = PROOF_PHOTOS[p];
    var photoPath = path.join(IMG_DIR, photo);
    if (!existsSync(photoPath)) {
      console.error('ERROR: Photo not found: ' + photoPath);
      process.exit(1);
    }
    var buf = readFileSync(photoPath);
    imageDataMap[photo] = 'data:image/jpeg;base64,' + buf.toString('base64');
    console.log('  Loaded ' + photo + ' (' + (buf.length / 1024).toFixed(0) + ' KB)');
  }

  // Generate HTML
  var html = buildHTML(imageDataMap);
  var htmlPath = path.join(OUT_DIR, 'animated-story-manila-b.html');
  writeFileSync(htmlPath, html);
  console.log('=== HTML generated: ' + htmlPath + ' ===');

  // Also write a copy to the main directory for reference
  var mainHtmlPath = path.join(__dirname, 'animated-story-manila-b.html');
  writeFileSync(mainHtmlPath, html);

  // === PHASE 1: Frame capture ===
  console.log('=== Phase 1: Frame capture ===');

  var browser = await chromium.launch();
  var page = await browser.newPage({ viewport: { width: W, height: H } });

  await page.goto('file://' + htmlPath + '?capture=1', { waitUntil: 'load' });
  await page.waitForTimeout(1000);

  console.log('Capturing ' + TOTAL_FRAMES + ' frames at ' + FPS + 'fps (' + DURATION + 's)...');

  for (var frame = 0; frame < TOTAL_FRAMES; frame++) {
    var t = frame / FPS;

    await page.evaluate(function(time) {
      // Reset all scenes
      document.querySelectorAll('.scene').forEach(function(s) {
        s.classList.remove('active', 'shake');
      });
      document.querySelectorAll('.pop').forEach(function(el) {
        el.classList.remove('pop');
      });
      document.querySelectorAll('.pulse').forEach(function(el) {
        el.classList.remove('pulse');
      });

      // Reset flash overlay
      var flash = document.getElementById('photoFlash');
      if (flash) flash.style.opacity = '0';

      // Reset all photos - hide and scale up
      for (var i = 0; i < 8; i++) {
        var img = document.getElementById('photo' + i);
        if (img) {
          img.style.opacity = '0';
          img.style.transform = 'scale(1.15)';
        }
      }

      // Apply timeline up to current time
      window.__applyUpTo(time);
    }, t);

    await page.waitForTimeout(2);

    var padded = String(frame).padStart(5, '0');
    await page.screenshot({
      path: path.join(FRAMES_DIR, 'frame_' + padded + '.png'),
      type: 'png',
    });

    if (frame % (FPS * 2) === 0) {
      console.log('  ' + t.toFixed(1) + 's / ' + DURATION + 's  (frame ' + frame + '/' + TOTAL_FRAMES + ')');
    }
  }

  await browser.close();
  console.log('=== Frames captured ===');

  // Compile animation
  console.log('=== Compiling animation to mp4 ===');
  var animMp4 = path.join(OUT_DIR, 'tmp_anim.mp4');
  execSync(
    'ffmpeg -y -framerate ' + FPS + ' -i "' + path.join(FRAMES_DIR, 'frame_%05d.png') + '" -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r ' + FPS + ' "' + animMp4 + '"',
    { stdio: 'inherit' }
  );

  // Clean up frames
  rmSync(FRAMES_DIR, { recursive: true, force: true });

  // Rename animation as final output (no photo clip concat — photos already in animation)
  var finalMp4 = path.join(OUT_DIR, 'manila-animated-story-v35b.mp4');
  execSync('mv "' + animMp4 + '" "' + finalMp4 + '"');

  // Copy to reels directory
  var reelsDir = path.join(__dirname, 'reels');
  if (!existsSync(reelsDir)) mkdirSync(reelsDir, { recursive: true });

  var finalStat = statSync(finalMp4);
  console.log('Final video: ' + (finalStat.size / (1024 * 1024)).toFixed(1) + ' MB');

  execSync('cp "' + finalMp4 + '" "' + path.join(reelsDir, 'manila-animated-story-v35b.mp4') + '"');
  console.log('Copied to reels/manila-animated-story-v35b.mp4');

  console.log('=== Done! Output: ' + OUT_DIR + ' ===');
  execSync('ls -lh "' + finalMp4 + '"', { stdio: 'inherit' });
}

main().catch(function(err) {
  console.error(err);
  process.exit(1);
});
