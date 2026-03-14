import { chromium } from 'playwright';
import { execSync } from 'child_process';
import { mkdirSync, rmSync, existsSync, readFileSync, writeFileSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

var __dirname = path.dirname(fileURLToPath(import.meta.url));
var OUT_DIR = path.join(__dirname, 'output-58a');

var W = 1080;
var H = 1920;
var FPS = 30;
var SAFE_TOP = 213;
var SAFE_BOTTOM = 430;
var SAFE_LEFT = 66;
var SAFE_RIGHT = 1027;

var CLAUDE_ORANGE = '#D97706';
var CLAUDE_AMBER = '#F59E0B';
var MONO = "'SF Mono', 'Menlo', 'Courier New', monospace";

var FILM_SCANS_DIR = '/Volumes/PortableSSD/Exports/film scans';
var PHOTO_NAMES = [
  '000040850002.jpg',
  '000040850003.jpg',
  '000040850006.jpg',
  '000040850008.jpg',
  '000040850011.jpg',
  '000040850013.jpg',
  '000040850017.jpg',
  '000040850025.jpg',
];

var TOTAL_FRAMES = 720; // 24s at 30fps
var TOTAL_DURATION = 24;

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
  var slideImgs = PHOTO_NAMES.map(function(name, i) {
    return '<img id="slide-' + i + '" src="' + imageDataMap[name] + '" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);max-width:100%;max-height:100%;object-fit:contain;border-radius:8px;border:2px solid #333;opacity:0;" />';
  }).join('\n      ');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { margin: 0; padding: 0; background: #1a1a2e; font-family: ${MONO}; overflow: hidden; }
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }
  @keyframes pulse {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 1; }
  }
</style>
</head>
<body>
  <div id="root" style="width:${W}px;height:${H}px;position:relative;overflow:hidden;background:#1a1a2e;">

    <!-- Scanlines overlay -->
    <div style="position:absolute;inset:0;z-index:100;pointer-events:none;background:repeating-linear-gradient(0deg,rgba(0,0,0,0.08) 0px,rgba(0,0,0,0.08) 1px,transparent 1px,transparent 3px);"></div>
    <!-- Vignette overlay -->
    <div style="position:absolute;inset:0;z-index:99;pointer-events:none;background:radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.4) 100%);"></div>

    <!-- Persistent header -->
    <div id="persistent-header" style="position:absolute;top:${SAFE_TOP}px;left:${SAFE_LEFT}px;width:${SAFE_RIGHT - SAFE_LEFT}px;z-index:50;pointer-events:none;opacity:0;padding:12px 0;border-bottom:1px solid #333;">
      <div style="font-family:${MONO};font-size:26px;font-weight:700;color:${CLAUDE_ORANGE};letter-spacing:2px;text-transform:uppercase;">Manila Free Photo Shoot</div>
    </div>

    <!-- Terminal content area -->
    <div id="terminal" style="position:absolute;top:${SAFE_TOP + 60}px;left:${SAFE_LEFT}px;width:${SAFE_RIGHT - SAFE_LEFT}px;bottom:${SAFE_BOTTOM + 20}px;overflow:hidden;z-index:10;">
      <div id="content" style="font-family:${MONO};"></div>
    </div>

    <!-- Photo slideshow overlay -->
    <div id="photo-overlay" style="position:absolute;top:${SAFE_TOP + 60}px;left:${SAFE_LEFT}px;width:${SAFE_RIGHT - SAFE_LEFT}px;bottom:${SAFE_BOTTOM + 20}px;z-index:40;pointer-events:none;opacity:0;">
      ${slideImgs}
    </div>

  </div>

<script>
  var W = ${W};
  var H = ${H};
  var CLAUDE_ORANGE = '${CLAUDE_ORANGE}';
  var CLAUDE_AMBER = '${CLAUDE_AMBER}';
  var MONO = "${MONO}";
  var PHOTO_COUNT = ${PHOTO_NAMES.length};

  var content = document.getElementById('content');
  var terminal = document.getElementById('terminal');
  var overlay = document.getElementById('photo-overlay');
  var header = document.getElementById('persistent-header');

  function scrollToBottom() {
    terminal.scrollTop = terminal.scrollHeight;
  }

  function makeLineDiv(html) {
    var div = document.createElement('div');
    div.style.cssText = 'font-size:28px;line-height:1.6;white-space:pre-wrap;word-break:break-word;';
    div.innerHTML = html;
    return div;
  }

  function showSlide(index) {
    for (var i = 0; i < PHOTO_COUNT; i++) {
      var img = document.getElementById('slide-' + i);
      if (img) img.style.opacity = i === index ? '1' : '0';
    }
  }

  function hideAllSlides() {
    for (var i = 0; i < PHOTO_COUNT; i++) {
      var img = document.getElementById('slide-' + i);
      if (img) img.style.opacity = '0';
    }
  }

  var timeline = [
    // 0.0s — header
    { time: 0.0, fn: function(t) {
      header.style.opacity = '1';
    }},

    // 0.2s — session start
    { time: 0.2, fn: function(t) {
      var div = makeLineDiv('<span style="color:#555;font-size:22px;">claude-code v1.0.23 · session started</span>');
      content.appendChild(div);
    }},

    // 0.5s — typing prompt
    { time: 0.5, fn: function(t) {
      var text = 'find me a free photo shoot in manila';
      var charMs = 0.035;
      var elapsed = t - 0.5;
      var charsToShow = Math.min(text.length, Math.floor(elapsed / charMs));
      var partial = text.slice(0, charsToShow);
      var cursorHtml = charsToShow < text.length
        ? '<span style="display:inline-block;width:11px;height:24px;background:' + CLAUDE_ORANGE + ';animation:blink 0.7s step-end infinite;vertical-align:text-bottom;margin-left:2px;"></span>'
        : '';
      var div = makeLineDiv(
        '<span style="color:#e5e7eb;">&gt; </span>' +
        '<span style="color:#e5e7eb;">' + partial + '</span>' +
        cursorHtml
      );
      div.id = 'typing-line';
      content.appendChild(div);
    }},

    // 2.2s — searching
    { time: 2.2, fn: function(t) {
      var div = makeLineDiv('<span style="color:' + CLAUDE_ORANGE + ';animation:pulse 1.5s ease-in-out infinite;">&#x27F3; Searching...</span>');
      div.id = 'searching-line';
      content.appendChild(div);
    }},

    // 3.2s — results
    { time: 3.2, fn: function(t) {
      content.appendChild(makeLineDiv('<span style="color:#22c55e;">&#10003; Found: Manila Free Photo Shoot</span>'));
    }},
    { time: 3.4, fn: function(t) {
      content.appendChild(makeLineDiv('<span style="color:#555;">&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;</span>'));
    }},
    { time: 3.6, fn: function(t) {
      content.appendChild(makeLineDiv('<span style="color:#e5e7eb;">  type:       editorial portraits</span>'));
    }},
    { time: 3.8, fn: function(t) {
      content.appendChild(makeLineDiv('<span style="color:#e5e7eb;">  experience: none required</span>'));
    }},
    { time: 4.0, fn: function(t) {
      content.appendChild(makeLineDiv('<span style="color:' + CLAUDE_AMBER + ';font-weight:700;">  cost:       FREE</span>'));
    }},
    { time: 4.2, fn: function(t) {
      content.appendChild(makeLineDiv('<span style="color:#e5e7eb;">  status:     <span style="color:#22c55e;">accepting models</span></span>'));
    }},
    { time: 4.4, fn: function(t) {
      content.appendChild(makeLineDiv('<span style="color:#555;">&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;</span>'));
    }},

    // 5.0s — portfolio
    { time: 5.0, fn: function(t) {
      content.appendChild(makeLineDiv(''));
    }},
    { time: 5.2, fn: function(t) {
      content.appendChild(makeLineDiv('<span style="color:' + CLAUDE_ORANGE + ';">&#x27F3; Loading portfolio samples...</span>'));
    }},

    // 5.6s — photo slideshow
    { time: 5.6, fn: function(t) {
      overlay.style.opacity = '1';
      showSlide(0);
    }},
    { time: 6.4, fn: function(t) { showSlide(1); }},
    { time: 7.2, fn: function(t) { showSlide(2); }},
    { time: 8.0, fn: function(t) { showSlide(3); }},
    { time: 8.8, fn: function(t) { showSlide(4); }},
    { time: 9.6, fn: function(t) { showSlide(5); }},
    { time: 10.4, fn: function(t) { showSlide(6); }},
    { time: 11.2, fn: function(t) { showSlide(7); }},

    // 12.2s — hide overlay
    { time: 12.2, fn: function(t) {
      overlay.style.opacity = '0';
      hideAllSlides();
    }},

    // 12.4s — loaded
    { time: 12.4, fn: function(t) {
      content.appendChild(makeLineDiv('<span style="color:#22c55e;">&#10003; 8 samples loaded</span>'));
    }},
    { time: 12.6, fn: function(t) {
      content.appendChild(makeLineDiv('<span style="color:#555;">  all shoots by @madebyaidan</span>'));
    }},

    // 13.0s — steps
    { time: 13.0, fn: function(t) {
      content.appendChild(makeLineDiv(''));
    }},
    { time: 13.2, fn: function(t) {
      content.appendChild(makeLineDiv('<span style="color:' + CLAUDE_ORANGE + ';">&#x27F3; How to book &#8212; 3 steps:</span>'));
    }},
    { time: 13.6, fn: function(t) {
      content.appendChild(makeLineDiv('<br><span style="color:' + CLAUDE_AMBER + ';font-weight:700;">[1/3] DM me on Instagram</span>'));
    }},
    { time: 13.8, fn: function(t) {
      content.appendChild(makeLineDiv('<span style="color:#e5e7eb;">      Just say hey &#8212; I will reply back</span>'));
    }},
    { time: 14.0, fn: function(t) {
      content.appendChild(makeLineDiv('<span style="color:#22c55e;">      &#10003; confirmed</span>'));
    }},
    { time: 14.3, fn: function(t) {
      content.appendChild(makeLineDiv('<br><span style="color:' + CLAUDE_AMBER + ';font-weight:700;">[2/3] We pick a date</span>'));
    }},
    { time: 14.5, fn: function(t) {
      content.appendChild(makeLineDiv('<span style="color:#e5e7eb;">      Location + vibe planned together</span>'));
    }},
    { time: 14.7, fn: function(t) {
      content.appendChild(makeLineDiv('<span style="color:#22c55e;">      &#10003; confirmed</span>'));
    }},
    { time: 15.0, fn: function(t) {
      content.appendChild(makeLineDiv('<br><span style="color:' + CLAUDE_AMBER + ';font-weight:700;">[3/3] Show up. I guide you.</span>'));
    }},
    { time: 15.2, fn: function(t) {
      content.appendChild(makeLineDiv('<span style="color:#e5e7eb;">      No posing experience needed</span>'));
    }},
    { time: 15.4, fn: function(t) {
      content.appendChild(makeLineDiv('<span style="color:#22c55e;">      &#10003; confirmed</span>'));
    }},
    { time: 15.8, fn: function(t) {
      content.appendChild(makeLineDiv('<br><span style="color:#22c55e;font-weight:700;">&#10003; All steps complete. Ready to book.</span>'));
    }},

    // 16.3s — CTA box
    { time: 16.3, fn: function(t) {
      var box = document.createElement('div');
      box.style.cssText = 'margin:16px 0;border:3px solid ' + CLAUDE_ORANGE + ';border-radius:16px;padding:32px;text-align:center;background:rgba(217,119,6,0.08);';
      box.innerHTML = '<p style="font-size:50px;font-weight:700;color:#fff;margin:0 0 8px;">@madebyaidan</p><p style="font-size:26px;color:rgba(255,255,255,0.5);margin:0 0 22px;">on Instagram</p><div style="display:inline-block;background:' + CLAUDE_ORANGE + ';border-radius:12px;padding:16px 36px;"><span style="font-size:30px;font-weight:700;color:#fff;">Send me a DM &#8594;</span></div>';
      content.appendChild(box);
    }},

    { time: 17.3, fn: function(t) {
      content.appendChild(makeLineDiv('<span style="color:#555;">&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;</span>'));
    }},
    { time: 17.6, fn: function(t) {
      content.appendChild(makeLineDiv('<span style="color:' + CLAUDE_AMBER + ';font-weight:700;">&#9889; limited spots this month</span>'));
    }},

    // 18.1s — final cursor
    { time: 18.1, fn: function(t) {
      var div = document.createElement('div');
      div.style.cssText = 'font-size:28px;line-height:1.6;margin-top:12px;color:#555;';
      div.innerHTML = '&gt; <span style="display:inline-block;width:11px;height:24px;background:' + CLAUDE_ORANGE + ';animation:blink 0.7s step-end infinite;vertical-align:text-bottom;"></span>';
      content.appendChild(div);
    }},
  ];

  window.__applyUpTo = function(t) {
    content.innerHTML = '';
    header.style.opacity = '0';
    overlay.style.opacity = '0';
    hideAllSlides();

    for (var i = 0; i < timeline.length; i++) {
      if (timeline[i].time <= t) {
        timeline[i].fn(t);
      }
    }

    if (t >= 3.2) {
      var searchLine = document.getElementById('searching-line');
      if (searchLine) searchLine.remove();
    }

    scrollToBottom();
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
  console.log('=== Claude Code B&W Night Dramatic Reel v58a ===');
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
  await page.waitForTimeout(500);

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

  var outputMp4 = path.join(OUT_DIR, 'manila-claude-code-v58a.mp4');
  execSync(
    'ffmpeg -y -framerate ' + FPS + ' -i "' + path.join(framesDir, 'frame_%05d.png') + '" ' +
    '-c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r ' + FPS + ' -an "' + outputMp4 + '"',
    { stdio: 'inherit' }
  );

  rmSync(framesDir, { recursive: true, force: true });

  var reelsDir = path.join(__dirname, 'reels');
  if (!existsSync(reelsDir)) mkdirSync(reelsDir, { recursive: true });
  execSync('cp "' + outputMp4 + '" "' + path.join(reelsDir, 'manila-claude-code-v58a.mp4') + '"');

  var sz = statSync(outputMp4);
  console.log('Final: ' + (sz.size / (1024 * 1024)).toFixed(1) + ' MB');
  console.log('Copied to reels/manila-claude-code-v58a.mp4');
  console.log('=== Done ===');
}

main().catch(function(err) {
  console.error(err);
  process.exit(1);
});
