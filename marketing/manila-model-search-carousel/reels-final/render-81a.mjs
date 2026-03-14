import { chromium } from 'playwright';
import { execSync } from 'child_process';
import { mkdirSync, rmSync, existsSync, readFileSync, writeFileSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

var __dirname = path.dirname(fileURLToPath(import.meta.url));
var OUT_DIR = path.join(__dirname, 'output-81a');
var FILM_SCANS_DIR = '/Volumes/PortableSSD/Exports/film scans selected';
var W = 1080, H = 1920, FPS = 30;
var TOTAL_DURATION = 14;
var TOTAL_FRAMES = FPS * TOTAL_DURATION; // 420

var PHOTO_NAMES = [
  'DSC_0055.jpg', 'DSC_0119.jpg', 'DSC_0217.jpg', 'DSC_0283.jpg',
  'DSC_0680.jpg', 'DSC_0740.jpg', 'DSC_0843.jpg', 'DSC_0988.jpg',
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
  html, body { width: ${W}px; height: ${H}px; overflow: hidden; background: #1a0a2e; font-family: Georgia, 'Times New Roman', serif; }

  @keyframes twinkle {
    0%, 100% { opacity: 0.2; }
    50% { opacity: 1; }
  }

  @keyframes glowPulse {
    0%, 100% { text-shadow: 0 0 20px rgba(212,175,55,0.6), 0 0 40px rgba(212,175,55,0.3); }
    50% { text-shadow: 0 0 30px rgba(212,175,55,0.9), 0 0 60px rgba(212,175,55,0.5), 0 0 80px rgba(212,175,55,0.2); }
  }
</style>
</head>
<body>
<div id="root" style="width:${W}px;height:${H}px;position:relative;overflow:hidden;background:linear-gradient(180deg,#0d0520 0%,#1a0a2e 40%,#12062a 100%);">

  <!-- Stars background -->
  <canvas id="stars-canvas" width="${W}" height="${H}" style="position:absolute;inset:0;z-index:1;"></canvas>

  <!-- Constellation lines -->
  <canvas id="constellation-canvas" width="${W}" height="${H}" style="position:absolute;inset:0;z-index:2;opacity:0.3;"></canvas>

  <!-- Vignette -->
  <div style="position:absolute;inset:0;z-index:3;pointer-events:none;background:radial-gradient(ellipse at center,transparent 40%,rgba(0,0,0,0.6) 100%);"></div>

  <!-- Title text -->
  <div id="title-text" style="position:absolute;top:${SAFE_TOP + 60}px;left:0;right:0;z-index:50;text-align:center;opacity:0;">
    <div style="font-size:22px;color:#a08040;letter-spacing:12px;text-transform:uppercase;margin-bottom:8px;">&#10022; &#10022; &#10022;</div>
    <div style="font-size:52px;font-weight:700;color:#D4AF37;letter-spacing:6px;text-transform:uppercase;animation:glowPulse 2s ease-in-out infinite;">YOUR MANILA<br>READING</div>
    <div style="font-size:22px;color:#a08040;letter-spacing:12px;text-transform:uppercase;margin-top:8px;">&#10022; &#10022; &#10022;</div>
  </div>

  <!-- Tarot card containers - 3 main cards -->
  <!-- Card 0 (left) -->
  <div id="card-wrapper-0" style="position:absolute;z-index:30;opacity:0;perspective:1200px;">
    <div id="card-inner-0" style="position:relative;width:320px;height:480px;transform-style:preserve-3d;transition:none;">
      <!-- Card back -->
      <div id="card-back-0" style="position:absolute;inset:0;backface-visibility:hidden;border-radius:16px;overflow:hidden;background:linear-gradient(135deg,#2a1050,#1a0840);border:4px solid #D4AF37;box-shadow:0 0 20px rgba(212,175,55,0.3);">
        <div style="position:absolute;inset:12px;border:2px solid rgba(212,175,55,0.5);border-radius:10px;display:flex;align-items:center;justify-content:center;">
          <div style="text-align:center;">
            <div style="font-size:60px;color:#D4AF37;opacity:0.7;">&#10022;</div>
            <div style="font-size:16px;color:#D4AF37;letter-spacing:4px;opacity:0.6;margin-top:8px;">MANILA</div>
            <div style="width:60px;height:2px;background:#D4AF37;margin:8px auto;opacity:0.4;"></div>
            <div style="font-size:60px;color:#D4AF37;opacity:0.7;">&#9788;</div>
          </div>
        </div>
        <!-- Corner decorations -->
        <div style="position:absolute;top:6px;left:6px;font-size:18px;color:#D4AF37;opacity:0.5;">&#9827;</div>
        <div style="position:absolute;top:6px;right:6px;font-size:18px;color:#D4AF37;opacity:0.5;">&#9827;</div>
        <div style="position:absolute;bottom:6px;left:6px;font-size:18px;color:#D4AF37;opacity:0.5;">&#9827;</div>
        <div style="position:absolute;bottom:6px;right:6px;font-size:18px;color:#D4AF37;opacity:0.5;">&#9827;</div>
      </div>
      <!-- Card front -->
      <div id="card-front-0" style="position:absolute;inset:0;backface-visibility:hidden;transform:rotateY(180deg);border-radius:16px;overflow:hidden;background:linear-gradient(135deg,#1a0840,#0d0420);border:4px solid #D4AF37;box-shadow:0 0 25px rgba(212,175,55,0.4);">
        <div style="position:absolute;inset:10px;border:2px solid rgba(212,175,55,0.6);border-radius:10px;overflow:hidden;display:flex;flex-direction:column;align-items:center;padding:12px;">
          <div id="card-photo-0" style="width:280px;height:380px;border-radius:8px;overflow:hidden;border:2px solid #D4AF37;"></div>
          <div id="card-label-0" style="margin-top:10px;font-size:22px;font-weight:700;color:#D4AF37;letter-spacing:4px;text-transform:uppercase;text-shadow:0 0 15px rgba(212,175,55,0.6);"></div>
        </div>
        <!-- Gold corners -->
        <div style="position:absolute;top:4px;left:4px;width:20px;height:20px;border-top:3px solid #D4AF37;border-left:3px solid #D4AF37;border-radius:4px 0 0 0;"></div>
        <div style="position:absolute;top:4px;right:4px;width:20px;height:20px;border-top:3px solid #D4AF37;border-right:3px solid #D4AF37;border-radius:0 4px 0 0;"></div>
        <div style="position:absolute;bottom:4px;left:4px;width:20px;height:20px;border-bottom:3px solid #D4AF37;border-left:3px solid #D4AF37;border-radius:0 0 0 4px;"></div>
        <div style="position:absolute;bottom:4px;right:4px;width:20px;height:20px;border-bottom:3px solid #D4AF37;border-right:3px solid #D4AF37;border-radius:0 0 4px 0;"></div>
      </div>
    </div>
  </div>

  <!-- Card 1 (center) -->
  <div id="card-wrapper-1" style="position:absolute;z-index:31;opacity:0;perspective:1200px;">
    <div id="card-inner-1" style="position:relative;width:320px;height:480px;transform-style:preserve-3d;transition:none;">
      <div id="card-back-1" style="position:absolute;inset:0;backface-visibility:hidden;border-radius:16px;overflow:hidden;background:linear-gradient(135deg,#2a1050,#1a0840);border:4px solid #D4AF37;box-shadow:0 0 20px rgba(212,175,55,0.3);">
        <div style="position:absolute;inset:12px;border:2px solid rgba(212,175,55,0.5);border-radius:10px;display:flex;align-items:center;justify-content:center;">
          <div style="text-align:center;">
            <div style="font-size:60px;color:#D4AF37;opacity:0.7;">&#10022;</div>
            <div style="font-size:16px;color:#D4AF37;letter-spacing:4px;opacity:0.6;margin-top:8px;">MANILA</div>
            <div style="width:60px;height:2px;background:#D4AF37;margin:8px auto;opacity:0.4;"></div>
            <div style="font-size:60px;color:#D4AF37;opacity:0.7;">&#9788;</div>
          </div>
        </div>
        <div style="position:absolute;top:6px;left:6px;font-size:18px;color:#D4AF37;opacity:0.5;">&#9827;</div>
        <div style="position:absolute;top:6px;right:6px;font-size:18px;color:#D4AF37;opacity:0.5;">&#9827;</div>
        <div style="position:absolute;bottom:6px;left:6px;font-size:18px;color:#D4AF37;opacity:0.5;">&#9827;</div>
        <div style="position:absolute;bottom:6px;right:6px;font-size:18px;color:#D4AF37;opacity:0.5;">&#9827;</div>
      </div>
      <div id="card-front-1" style="position:absolute;inset:0;backface-visibility:hidden;transform:rotateY(180deg);border-radius:16px;overflow:hidden;background:linear-gradient(135deg,#1a0840,#0d0420);border:4px solid #D4AF37;box-shadow:0 0 25px rgba(212,175,55,0.4);">
        <div style="position:absolute;inset:10px;border:2px solid rgba(212,175,55,0.6);border-radius:10px;overflow:hidden;display:flex;flex-direction:column;align-items:center;padding:12px;">
          <div id="card-photo-1" style="width:280px;height:380px;border-radius:8px;overflow:hidden;border:2px solid #D4AF37;"></div>
          <div id="card-label-1" style="margin-top:10px;font-size:22px;font-weight:700;color:#D4AF37;letter-spacing:4px;text-transform:uppercase;text-shadow:0 0 15px rgba(212,175,55,0.6);"></div>
        </div>
        <div style="position:absolute;top:4px;left:4px;width:20px;height:20px;border-top:3px solid #D4AF37;border-left:3px solid #D4AF37;border-radius:4px 0 0 0;"></div>
        <div style="position:absolute;top:4px;right:4px;width:20px;height:20px;border-top:3px solid #D4AF37;border-right:3px solid #D4AF37;border-radius:0 4px 0 0;"></div>
        <div style="position:absolute;bottom:4px;left:4px;width:20px;height:20px;border-bottom:3px solid #D4AF37;border-left:3px solid #D4AF37;border-radius:0 0 0 4px;"></div>
        <div style="position:absolute;bottom:4px;right:4px;width:20px;height:20px;border-bottom:3px solid #D4AF37;border-right:3px solid #D4AF37;border-radius:0 0 4px 0;"></div>
      </div>
    </div>
  </div>

  <!-- Card 2 (right) -->
  <div id="card-wrapper-2" style="position:absolute;z-index:30;opacity:0;perspective:1200px;">
    <div id="card-inner-2" style="position:relative;width:320px;height:480px;transform-style:preserve-3d;transition:none;">
      <div id="card-back-2" style="position:absolute;inset:0;backface-visibility:hidden;border-radius:16px;overflow:hidden;background:linear-gradient(135deg,#2a1050,#1a0840);border:4px solid #D4AF37;box-shadow:0 0 20px rgba(212,175,55,0.3);">
        <div style="position:absolute;inset:12px;border:2px solid rgba(212,175,55,0.5);border-radius:10px;display:flex;align-items:center;justify-content:center;">
          <div style="text-align:center;">
            <div style="font-size:60px;color:#D4AF37;opacity:0.7;">&#10022;</div>
            <div style="font-size:16px;color:#D4AF37;letter-spacing:4px;opacity:0.6;margin-top:8px;">MANILA</div>
            <div style="width:60px;height:2px;background:#D4AF37;margin:8px auto;opacity:0.4;"></div>
            <div style="font-size:60px;color:#D4AF37;opacity:0.7;">&#9788;</div>
          </div>
        </div>
        <div style="position:absolute;top:6px;left:6px;font-size:18px;color:#D4AF37;opacity:0.5;">&#9827;</div>
        <div style="position:absolute;top:6px;right:6px;font-size:18px;color:#D4AF37;opacity:0.5;">&#9827;</div>
        <div style="position:absolute;bottom:6px;left:6px;font-size:18px;color:#D4AF37;opacity:0.5;">&#9827;</div>
        <div style="position:absolute;bottom:6px;right:6px;font-size:18px;color:#D4AF37;opacity:0.5;">&#9827;</div>
      </div>
      <div id="card-front-2" style="position:absolute;inset:0;backface-visibility:hidden;transform:rotateY(180deg);border-radius:16px;overflow:hidden;background:linear-gradient(135deg,#1a0840,#0d0420);border:4px solid #D4AF37;box-shadow:0 0 25px rgba(212,175,55,0.4);">
        <div style="position:absolute;inset:10px;border:2px solid rgba(212,175,55,0.6);border-radius:10px;overflow:hidden;display:flex;flex-direction:column;align-items:center;padding:12px;">
          <div id="card-photo-2" style="width:280px;height:380px;border-radius:8px;overflow:hidden;border:2px solid #D4AF37;"></div>
          <div id="card-label-2" style="margin-top:10px;font-size:22px;font-weight:700;color:#D4AF37;letter-spacing:4px;text-transform:uppercase;text-shadow:0 0 15px rgba(212,175,55,0.6);"></div>
        </div>
        <div style="position:absolute;top:4px;left:4px;width:20px;height:20px;border-top:3px solid #D4AF37;border-left:3px solid #D4AF37;border-radius:4px 0 0 0;"></div>
        <div style="position:absolute;top:4px;right:4px;width:20px;height:20px;border-top:3px solid #D4AF37;border-right:3px solid #D4AF37;border-radius:0 4px 0 0;"></div>
        <div style="position:absolute;bottom:4px;left:4px;width:20px;height:20px;border-bottom:3px solid #D4AF37;border-left:3px solid #D4AF37;border-radius:0 0 0 4px;"></div>
        <div style="position:absolute;bottom:4px;right:4px;width:20px;height:20px;border-bottom:3px solid #D4AF37;border-right:3px solid #D4AF37;border-radius:0 0 4px 0;"></div>
      </div>
    </div>
  </div>

  <!-- Bonus cards (4 and 5) -->
  <div id="card-wrapper-3" style="position:absolute;z-index:35;opacity:0;perspective:1200px;">
    <div id="card-inner-3" style="position:relative;width:280px;height:420px;transform-style:preserve-3d;">
      <div id="card-front-3" style="position:absolute;inset:0;border-radius:14px;overflow:hidden;background:linear-gradient(135deg,#1a0840,#0d0420);border:4px solid #D4AF37;box-shadow:0 0 30px rgba(212,175,55,0.5);">
        <div style="position:absolute;inset:8px;border:2px solid rgba(212,175,55,0.6);border-radius:10px;overflow:hidden;display:flex;flex-direction:column;align-items:center;padding:10px;">
          <div id="card-photo-3" style="width:248px;height:340px;border-radius:8px;overflow:hidden;border:2px solid #D4AF37;"></div>
          <div id="card-label-3" style="margin-top:8px;font-size:18px;font-weight:700;color:#D4AF37;letter-spacing:3px;text-transform:uppercase;text-shadow:0 0 15px rgba(212,175,55,0.6);"></div>
        </div>
      </div>
    </div>
  </div>

  <div id="card-wrapper-4" style="position:absolute;z-index:36;opacity:0;perspective:1200px;">
    <div id="card-inner-4" style="position:relative;width:280px;height:420px;transform-style:preserve-3d;">
      <div id="card-front-4" style="position:absolute;inset:0;border-radius:14px;overflow:hidden;background:linear-gradient(135deg,#1a0840,#0d0420);border:4px solid #D4AF37;box-shadow:0 0 30px rgba(212,175,55,0.5);">
        <div style="position:absolute;inset:8px;border:2px solid rgba(212,175,55,0.6);border-radius:10px;overflow:hidden;display:flex;flex-direction:column;align-items:center;padding:10px;">
          <div id="card-photo-4" style="width:248px;height:340px;border-radius:8px;overflow:hidden;border:2px solid #D4AF37;"></div>
          <div id="card-label-4" style="margin-top:8px;font-size:18px;font-weight:700;color:#D4AF37;letter-spacing:3px;text-transform:uppercase;text-shadow:0 0 15px rgba(212,175,55,0.6);"></div>
        </div>
      </div>
    </div>
  </div>

  <!-- "DESTINY AWAITS" overlay text -->
  <div id="destiny-text" style="position:absolute;top:${SAFE_TOP + 40}px;left:0;right:0;z-index:60;text-align:center;opacity:0;">
    <div style="font-size:46px;font-weight:700;color:#D4AF37;letter-spacing:6px;text-transform:uppercase;text-shadow:0 0 30px rgba(212,175,55,0.8),0 0 60px rgba(212,175,55,0.4);">DESTINY AWAITS</div>
  </div>

  <!-- Sparkle particles -->
  <div id="sparkles" style="position:absolute;inset:0;pointer-events:none;z-index:40;"></div>

  <!-- CTA panel -->
  <div id="cta-panel" style="position:absolute;inset:0;z-index:250;background:#1a0a2e;opacity:0;pointer-events:none;">
    <div style="position:absolute;top:0;left:0;right:0;bottom:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px;">
      <!-- Mystical ornament -->
      <div id="cta-ornament" style="font-size:40px;color:#D4AF37;opacity:0;margin-bottom:20px;">&#10022; &#9788; &#10022;</div>
      <div id="cta-handle-text" style="
        background:linear-gradient(135deg,#2a1050,#1a0840);
        border:3px solid #D4AF37;
        border-radius:20px;
        padding:28px 60px;
        margin:16px 0;
        opacity:0;
        box-shadow:0 0 40px rgba(212,175,55,0.3);
      ">
        <div style="font-size:52px;font-weight:700;color:#D4AF37;letter-spacing:2px;text-align:center;text-shadow:0 0 20px rgba(212,175,55,0.6);">@madebyaidan</div>
      </div>
      <div id="cta-dm" style="font-size:32px;font-weight:700;color:#fff;letter-spacing:3px;text-transform:uppercase;text-align:center;margin-top:24px;opacity:0;text-shadow:0 0 15px rgba(255,255,255,0.3);">DM for a free<br>photo shoot</div>
      <div id="cta-stars" style="font-size:30px;color:#D4AF37;opacity:0;margin-top:20px;">&#10022; &#10022; &#10022; &#10022; &#10022;</div>
    </div>
    <!-- CTA sparkles -->
    <canvas id="cta-stars-canvas" width="${W}" height="${H}" style="position:absolute;inset:0;pointer-events:none;z-index:1;"></canvas>
  </div>

</div>

<script>
  var PHOTOS = [
    ${imgArrayEntries}
  ];

  // Labels for each card phase
  var LABELS_PHASE1 = ['THE PAST', 'THE PRESENT', 'THE FUTURE'];
  var LABELS_PHASE2 = ['BEAUTY', 'LIGHT', 'VISION'];
  var LABELS_BONUS = ['', ''];

  // Card positions (3-card spread)
  var CARD_W = 320, CARD_H = 480;
  var CARD_POSITIONS = [
    { x: 540 - CARD_W - 30, y: 700 },   // left
    { x: 540 - CARD_W / 2, y: 660 },     // center (slightly higher)
    { x: 540 + 30, y: 700 },             // right
  ];

  // Draw stars on canvas
  function drawStars(canvasId, count, seed) {
    var canvas = document.getElementById(canvasId);
    var ctx = canvas.getContext('2d');
    for (var i = 0; i < count; i++) {
      var sr = function(s) { var x = Math.sin(s * 9301 + 49297) * 49297; return x - Math.floor(x); };
      var x = sr(i * 7 + seed) * ${W};
      var y = sr(i * 13 + seed + 3) * ${H};
      var size = 0.5 + sr(i * 17 + seed + 7) * 2.5;
      var brightness = 0.3 + sr(i * 23 + seed + 11) * 0.7;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,' + brightness + ')';
      ctx.fill();
    }
  }

  function drawConstellations(canvasId) {
    var canvas = document.getElementById(canvasId);
    var ctx = canvas.getContext('2d');
    ctx.strokeStyle = 'rgba(212,175,55,0.15)';
    ctx.lineWidth = 1;
    // Draw some random constellation-like lines
    var points = [];
    for (var i = 0; i < 30; i++) {
      var sr = function(s) { var x = Math.sin(s * 9301 + 49297) * 49297; return x - Math.floor(x); };
      points.push({ x: sr(i * 31 + 1) * ${W}, y: sr(i * 37 + 5) * ${H} });
    }
    for (var j = 0; j < 20; j++) {
      var a = j % points.length;
      var b = (j + 1 + Math.floor(j / 3)) % points.length;
      ctx.beginPath();
      ctx.moveTo(points[a].x, points[a].y);
      ctx.lineTo(points[b].x, points[b].y);
      ctx.stroke();
      // Dot at each point
      ctx.beginPath();
      ctx.arc(points[a].x, points[a].y, 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(212,175,55,0.4)';
      ctx.fill();
    }
  }

  drawStars('stars-canvas', 200, 42);
  drawConstellations('constellation-canvas');

  // Set photo images
  for (var pi = 0; pi < 5; pi++) {
    var photoEl = document.getElementById('card-photo-' + pi);
    if (photoEl) {
      var imgIdx = pi; // photos 0-4 for first 5 slots
      photoEl.innerHTML = '<img src="' + PHOTOS[imgIdx] + '" style="width:100%;height:100%;object-fit:cover;" />';
    }
  }

  // Build sparkle particles
  (function() {
    var el = document.getElementById('sparkles');
    var html = '';
    for (var i = 0; i < 30; i++) {
      var sr = function(s) { var x = Math.sin(s * 9301 + 49297) * 49297; return x - Math.floor(x); };
      var x = sr(i * 41 + 100) * ${W};
      var y = sr(i * 43 + 200) * ${H};
      var size = 3 + sr(i * 47 + 300) * 6;
      html += '<div id="sparkle-' + i + '" style="position:absolute;left:' + x + 'px;top:' + y + 'px;width:' + size + 'px;height:' + size + 'px;background:#D4AF37;border-radius:50%;opacity:0;box-shadow:0 0 6px #D4AF37;"></div>';
    }
    el.innerHTML = html;
  })();

  // Draw CTA stars
  drawStars('cta-stars-canvas', 150, 99);

  // ---- Utility functions ----
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function lerp(a, b, t) { return a + (b - a) * clamp(t, 0, 1); }
  function prog(t, start, end) { return clamp((t - start) / (end - start), 0, 1); }
  function easeOut(x) { return 1 - Math.pow(1 - x, 3); }
  function easeIn(x) { return Math.pow(x, 3); }
  function easeInOut(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }

  function seededRandom(seed) {
    var x = Math.sin(seed * 9301 + 49297) * 49297;
    return x - Math.floor(x);
  }

  // ============================================================
  // __applyUpTo
  // ============================================================
  window.__applyUpTo = function(t) {
    var titleText = document.getElementById('title-text');
    var destinyText = document.getElementById('destiny-text');
    var ctaPanel = document.getElementById('cta-panel');

    // ---- Title (0-1s fade in, stays until 9s, fades during transitions) ----
    if (t < 0.2) {
      titleText.style.opacity = '0';
    } else if (t < 1.0) {
      titleText.style.opacity = String(easeOut(prog(t, 0.2, 1.0)));
    } else if (t < 9.0) {
      titleText.style.opacity = '1';
    } else if (t < 9.5) {
      titleText.style.opacity = String(1 - prog(t, 9.0, 9.5));
    } else {
      titleText.style.opacity = '0';
    }

    // ---- Sparkle particles pulsing ----
    for (var si = 0; si < 30; si++) {
      var sp = document.getElementById('sparkle-' + si);
      if (!sp) continue;
      var phase = seededRandom(si * 7) * 6.28 + t * (1.5 + seededRandom(si * 11) * 2);
      var sparkleOpacity = (t < 12.0) ? (0.3 + 0.7 * Math.max(0, Math.sin(phase))) : 0;
      sp.style.opacity = String(sparkleOpacity.toFixed(3));
    }

    // ==== CARD DEALING & FLIPPING ====

    // Phase 1: Deal cards face-down (1-3s), flip one at a time (3-9s)
    // Phase 2: Shuffle/re-deal (9-11s) with new photos
    // Bonus: Extra cards (11-12s)

    // --- Phase 1 cards (0, 1, 2) ---
    for (var ci = 0; ci < 3; ci++) {
      var wrapper = document.getElementById('card-wrapper-' + ci);
      var inner = document.getElementById('card-inner-' + ci);
      var label = document.getElementById('card-label-' + ci);
      var photoEl2 = document.getElementById('card-photo-' + ci);

      var pos = CARD_POSITIONS[ci];
      wrapper.style.left = pos.x + 'px';
      wrapper.style.top = pos.y + 'px';

      // Deal timing: cards appear staggered 1.0-2.5s
      var dealStart = 1.0 + ci * 0.5;
      var dealEnd = dealStart + 0.6;

      // Flip timing: cards flip one at a time starting at 3s
      var flipStart = 3.0 + ci * 2.0; // 3s, 5s, 7s
      var flipEnd = flipStart + 0.8;

      if (t < 9.0) {
        // Phase 1: initial deal and flip
        // Photo assignment - phase 1 photos
        photoEl2.innerHTML = '<img src="' + PHOTOS[ci] + '" style="width:100%;height:100%;object-fit:cover;" />';
        label.textContent = LABELS_PHASE1[ci];

        if (t < dealStart) {
          wrapper.style.opacity = '0';
          wrapper.style.transform = 'translateY(200px) scale(0.5)';
        } else if (t < dealEnd) {
          var dp = easeOut(prog(t, dealStart, dealEnd));
          wrapper.style.opacity = String(dp);
          wrapper.style.transform = 'translateY(' + lerp(200, 0, dp) + 'px) scale(' + lerp(0.5, 1, dp) + ')';
        } else {
          wrapper.style.opacity = '1';
          wrapper.style.transform = 'translateY(0) scale(1)';
        }

        // Flip animation
        if (t < flipStart) {
          inner.style.transform = 'rotateY(0deg)';
        } else if (t < flipEnd) {
          var fp = easeInOut(prog(t, flipStart, flipEnd));
          inner.style.transform = 'rotateY(' + (fp * 180) + 'deg)';
        } else {
          inner.style.transform = 'rotateY(180deg)';
        }
      } else if (t < 9.5) {
        // Fade out for shuffle
        var fadeP = prog(t, 9.0, 9.4);
        wrapper.style.opacity = String(1 - fadeP);
        wrapper.style.transform = 'scale(' + lerp(1, 0.7, fadeP) + ') rotate(' + lerp(0, (ci - 1) * 15, fadeP) + 'deg)';
        inner.style.transform = 'rotateY(180deg)';
      } else if (t < 9.8) {
        // Hidden during re-deal prep
        wrapper.style.opacity = '0';
      } else if (t < 11.0) {
        // Phase 2: re-deal with new photos
        photoEl2.innerHTML = '<img src="' + PHOTOS[ci + 3] + '" style="width:100%;height:100%;object-fit:cover;" />';
        label.textContent = LABELS_PHASE2[ci];

        var redealStart = 9.8 + ci * 0.25;
        var redealEnd = redealStart + 0.5;

        if (t < redealStart) {
          wrapper.style.opacity = '0';
          wrapper.style.transform = 'translateY(-100px) scale(0.6)';
          inner.style.transform = 'rotateY(0deg)';
        } else if (t < redealEnd) {
          var rdp = easeOut(prog(t, redealStart, redealEnd));
          wrapper.style.opacity = String(rdp);
          wrapper.style.transform = 'translateY(' + lerp(-100, 0, rdp) + 'px) scale(' + lerp(0.6, 1, rdp) + ')';
          // Flip immediately during re-deal
          var rfp = easeInOut(prog(t, redealStart, redealEnd));
          inner.style.transform = 'rotateY(' + (rfp * 180) + 'deg)';
        } else {
          wrapper.style.opacity = '1';
          wrapper.style.transform = 'translateY(0) scale(1)';
          inner.style.transform = 'rotateY(180deg)';
        }
      } else if (t < 12.0) {
        // Stay visible during bonus phase
        wrapper.style.opacity = String(1 - prog(t, 11.5, 12.0));
        wrapper.style.transform = 'translateY(0) scale(1)';
        inner.style.transform = 'rotateY(180deg)';
        photoEl2.innerHTML = '<img src="' + PHOTOS[ci + 3] + '" style="width:100%;height:100%;object-fit:cover;" />';
        label.textContent = LABELS_PHASE2[ci];
      } else {
        wrapper.style.opacity = '0';
      }
    }

    // --- Bonus cards (3, 4) ---
    for (var bi = 0; bi < 2; bi++) {
      var bWrapper = document.getElementById('card-wrapper-' + (bi + 3));
      var bPhoto = document.getElementById('card-photo-' + (bi + 3));
      var bLabel = document.getElementById('card-label-' + (bi + 3));

      bPhoto.innerHTML = '<img src="' + PHOTOS[bi + 6] + '" style="width:100%;height:100%;object-fit:cover;" />';
      bLabel.textContent = '';

      // Position bonus cards overlapping the spread
      var bx = bi === 0 ? 160 : 640;
      var by = 780;
      bWrapper.style.left = bx + 'px';
      bWrapper.style.top = by + 'px';

      var bonusStart = 11.0 + bi * 0.3;
      var bonusEnd = bonusStart + 0.5;

      if (t < bonusStart) {
        bWrapper.style.opacity = '0';
        bWrapper.style.transform = 'scale(0.3) rotate(' + (bi === 0 ? -20 : 20) + 'deg)';
      } else if (t < bonusEnd) {
        var bp = easeOut(prog(t, bonusStart, bonusEnd));
        bWrapper.style.opacity = String(bp);
        bWrapper.style.transform = 'scale(' + lerp(0.3, 1, bp) + ') rotate(' + lerp(bi === 0 ? -20 : 20, bi === 0 ? -5 : 5, bp) + 'deg)';
      } else if (t < 12.0) {
        bWrapper.style.opacity = '1';
        bWrapper.style.transform = 'scale(1) rotate(' + (bi === 0 ? -5 : 5) + 'deg)';
      } else if (t < 12.3) {
        bWrapper.style.opacity = String(1 - prog(t, 12.0, 12.3));
      } else {
        bWrapper.style.opacity = '0';
      }
    }

    // --- "DESTINY AWAITS" text (11-12s) ---
    if (t < 11.2) {
      destinyText.style.opacity = '0';
    } else if (t < 11.6) {
      destinyText.style.opacity = String(easeOut(prog(t, 11.2, 11.6)));
    } else if (t < 11.8) {
      destinyText.style.opacity = '1';
    } else if (t < 12.2) {
      destinyText.style.opacity = String(1 - prog(t, 11.8, 12.2));
    } else {
      destinyText.style.opacity = '0';
    }

    // ---- CTA (12-14s) ----
    var ctaOrnament = document.getElementById('cta-ornament');
    var ctaHandle = document.getElementById('cta-handle-text');
    var ctaDm = document.getElementById('cta-dm');
    var ctaStarsEl = document.getElementById('cta-stars');

    if (t < 12.0) {
      ctaPanel.style.opacity = '0';
    } else if (t < 12.3) {
      ctaPanel.style.opacity = String(prog(t, 12.0, 12.3));
      ctaOrnament.style.opacity = '0';
      ctaHandle.style.opacity = '0';
      ctaDm.style.opacity = '0';
      ctaStarsEl.style.opacity = '0';
    } else {
      ctaPanel.style.opacity = '1';

      ctaOrnament.style.opacity = String(Math.min(1, prog(t, 12.3, 12.7)));
      ctaOrnament.style.transform = 'scale(' + lerp(0.5, 1, easeOut(prog(t, 12.3, 12.7))) + ')';

      ctaHandle.style.opacity = String(Math.min(1, prog(t, 12.5, 13.0)));
      ctaHandle.style.transform = 'translateY(' + lerp(30, 0, easeOut(prog(t, 12.5, 13.0))) + 'px)';

      ctaDm.style.opacity = String(Math.min(1, prog(t, 13.0, 13.4)));
      ctaDm.style.transform = 'translateY(' + lerp(20, 0, prog(t, 13.0, 13.4)) + 'px)';

      ctaStarsEl.style.opacity = String(Math.min(1, prog(t, 13.3, 13.7)));
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
  console.log('=== Manila Tarot Card Reading Reel v81a ===');
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

  var outputMp4 = path.join(OUT_DIR, '81a-tarot-cards.mp4');
  execSync(
    'ffmpeg -y -framerate ' + FPS + ' -i "' + path.join(framesDir, 'frame_%05d.png') + '" ' +
    '-c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r ' + FPS + ' -an "' + outputMp4 + '"',
    { stdio: 'inherit' }
  );

  rmSync(framesDir, { recursive: true, force: true });

  var reelsDir = path.join(__dirname, 'reels');
  if (!existsSync(reelsDir)) mkdirSync(reelsDir, { recursive: true });
  var reelsDest = path.join(reelsDir, '81a-tarot-cards.mp4');
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
