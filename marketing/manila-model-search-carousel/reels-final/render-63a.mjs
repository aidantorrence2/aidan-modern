import { chromium } from 'playwright';
import { execSync } from 'child_process';
import { mkdirSync, rmSync, existsSync, readFileSync, writeFileSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

var __dirname = path.dirname(fileURLToPath(import.meta.url));
var OUT_DIR = path.join(__dirname, 'output-63a');

var W = 1080;
var H = 1920;
var FPS = 30;
var TOTAL_DURATION = 14;
var TOTAL_FRAMES = FPS * TOTAL_DURATION; // 420 frames

var SAFE_TOP = 213;
var SAFE_BOTTOM = 430;

var FILM_SCANS_DIR = '/Volumes/PortableSSD/Exports/film scans';
var PHOTO_NAMES = [
  'DSC_0523.jpg',
  'DSC_0530.jpg',
  'DSC_0553.jpg',
  'DSC_0556.jpg',
  'DSC_0557.jpg',
  'DSC_0558.jpg',
  'DSC_0559.jpg',
  'DSC_0570.jpg',
  'DSC_0571.jpg',
  'DSC_0581.jpg',
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
  var imgDataJSON = JSON.stringify(PHOTO_NAMES.map(function(name) {
    return imageDataMap[name];
  }));

  var BOARD_TOP = SAFE_TOP + 80;
  var ROW_HEIGHT = 105;
  var HEADER_HEIGHT = 70;

  var DESTINATIONS = [
    'MANILA', 'BALI', 'TOKYO', 'PARIS', 'DUBAI',
    'SEOUL', 'LONDON', 'BANGKOK', 'SYDNEY', 'NEW YORK'
  ];

  var STATUSES = [
    'FREE SHOOT', 'COMING SOON', 'COMING SOON', 'COMING SOON', 'COMING SOON',
    'COMING SOON', 'COMING SOON', 'COMING SOON', 'COMING SOON', 'COMING SOON'
  ];

  var TIMES = ['14:35', '15:10', '15:45', '16:20', '16:55', '17:30', '18:05', '18:40', '19:15', '19:50'];

  // Build row HTML
  var rowsHTML = '';
  for (var i = 0; i < 10; i++) {
    var rowTop = SAFE_TOP + HEADER_HEIGHT + 36 + i * ROW_HEIGHT;
    var dest = DESTINATIONS[i];
    var status = STATUSES[i];
    var bgColor = i % 2 === 0 ? '#1a1a1a' : '#1e1e1e';

    // Build flap chars for destination (12 chars max)
    var destChars = '';
    for (var c = 0; c < 12; c++) {
      var ch = c < dest.length ? dest[c] : ' ';
      // Escape ampersand for HTML attribute
      var safeChar = ch === '&' ? '&amp;' : ch;
      destChars += '<div class="flap-char" data-row="' + i + '" data-col="' + c + '" data-section="dest" data-target="' + safeChar + '">' +
        '<div class="flap-top"><span class="flap-char-text">&nbsp;</span></div>' +
        '<div class="flap-bottom"><span class="flap-char-text">&nbsp;</span></div>' +
        '</div>';
    }

    // Build flap chars for status (11 chars max)
    var statusChars = '';
    for (var s = 0; s < 11; s++) {
      var sch = s < status.length ? status[s] : ' ';
      statusChars += '<div class="flap-char" data-row="' + i + '" data-col="' + s + '" data-section="status" data-target="' + sch + '">' +
        '<div class="flap-top"><span class="flap-char-text">&nbsp;</span></div>' +
        '<div class="flap-bottom"><span class="flap-char-text">&nbsp;</span></div>' +
        '</div>';
    }

    rowsHTML += '<div class="board-row" id="row-' + i + '" style="top:' + rowTop + 'px;background:' + bgColor + ';">' +
      '<div class="row-dest">' + destChars + '</div>' +
      '<div class="row-status">' + statusChars + '</div>' +
      '<div class="row-gate" id="gate-' + i + '"><img id="gate-img-' + i + '" src="" alt=""/></div>' +
      '<div class="row-time">' + TIMES[i] + '</div>' +
      '</div>';
  }

  return '<!DOCTYPE html>\n<html>\n<head>\n<meta charset="utf-8">\n<style>\n' +
    '  * { box-sizing: border-box; margin: 0; padding: 0; }\n' +
    '  html, body { margin: 0; padding: 0; background: #111; overflow: hidden; }\n' +
    '  #root {\n' +
    '    width: ' + W + 'px; height: ' + H + 'px;\n' +
    '    position: relative; overflow: hidden;\n' +
    '    background: #1a1a1a;\n' +
    '    font-family: "Courier New", "Lucida Console", monospace;\n' +
    '  }\n' +
    '  #dep-header {\n' +
    '    position: absolute; top: ' + SAFE_TOP + 'px; left: 0;\n' +
    '    width: ' + W + 'px; height: ' + HEADER_HEIGHT + 'px;\n' +
    '    background: #111; display: flex; align-items: center;\n' +
    '    padding: 0 40px; z-index: 50; opacity: 0;\n' +
    '    border-bottom: 2px solid #333;\n' +
    '  }\n' +
    '  #dep-header-text {\n' +
    '    font-size: 42px; font-weight: 900; color: #FFB800;\n' +
    '    letter-spacing: 12px; text-transform: uppercase;\n' +
    '  }\n' +
    '  #dep-clock {\n' +
    '    margin-left: auto; font-size: 28px; color: #FFB800;\n' +
    '    font-weight: 700; letter-spacing: 4px;\n' +
    '  }\n' +
    '  #col-headers {\n' +
    '    position: absolute; top: ' + (SAFE_TOP + HEADER_HEIGHT) + 'px; left: 0;\n' +
    '    width: ' + W + 'px; height: 36px;\n' +
    '    background: #222; display: flex; align-items: center;\n' +
    '    padding: 0 40px; z-index: 50; opacity: 0;\n' +
    '    border-bottom: 1px solid #333;\n' +
    '  }\n' +
    '  .col-label {\n' +
    '    font-size: 13px; font-weight: 700; color: #888;\n' +
    '    letter-spacing: 3px; text-transform: uppercase;\n' +
    '  }\n' +
    '  .col-dest { width: 320px; }\n' +
    '  .col-status { width: 290px; }\n' +
    '  .col-gate { width: 180px; }\n' +
    '  .col-time { flex: 1; text-align: right; }\n' +
    '  .board-row {\n' +
    '    position: absolute; left: 0; width: ' + W + 'px;\n' +
    '    height: ' + ROW_HEIGHT + 'px; display: flex; align-items: center;\n' +
    '    padding: 0 40px; z-index: 20; opacity: 0;\n' +
    '    border-bottom: 1px solid #2a2a2a;\n' +
    '  }\n' +
    '  .flap-char {\n' +
    '    display: inline-block; width: 24px; height: 38px;\n' +
    '    position: relative; margin: 0 1px;\n' +
    '    perspective: 200px;\n' +
    '  }\n' +
    '  .flap-top, .flap-bottom {\n' +
    '    position: absolute; left: 0; width: 100%; height: 50%;\n' +
    '    overflow: hidden; background: #2a2a2a;\n' +
    '    display: flex; align-items: center; justify-content: center;\n' +
    '  }\n' +
    '  .flap-top {\n' +
    '    top: 0; border-radius: 3px 3px 0 0;\n' +
    '    border-bottom: 1px solid #111;\n' +
    '    align-items: flex-end;\n' +
    '  }\n' +
    '  .flap-bottom {\n' +
    '    bottom: 0; border-radius: 0 0 3px 3px;\n' +
    '    align-items: flex-start;\n' +
    '  }\n' +
    '  .flap-char-text {\n' +
    '    font-size: 26px; font-weight: 700; color: #FFB800;\n' +
    '    line-height: 38px; position: absolute;\n' +
    '    left: 50%; transform: translateX(-50%);\n' +
    '  }\n' +
    '  .flap-top .flap-char-text { bottom: 0; }\n' +
    '  .flap-bottom .flap-char-text { top: 0; }\n' +
    '  .row-dest {\n' +
    '    width: 320px; display: flex; flex-wrap: nowrap;\n' +
    '    gap: 0; flex-shrink: 0;\n' +
    '  }\n' +
    '  .row-status {\n' +
    '    width: 290px; display: flex; flex-wrap: nowrap;\n' +
    '    gap: 0; flex-shrink: 0;\n' +
    '  }\n' +
    '  .row-gate {\n' +
    '    width: 180px; height: 80px;\n' +
    '    position: relative; overflow: hidden;\n' +
    '    flex-shrink: 0; border-radius: 4px;\n' +
    '  }\n' +
    '  .row-gate img {\n' +
    '    width: 100%; height: 100%; object-fit: cover;\n' +
    '    display: block; position: absolute; top: 0; right: 0;\n' +
    '  }\n' +
    '  .row-time {\n' +
    '    flex: 1; text-align: right;\n' +
    '    font-size: 22px; font-weight: 700;\n' +
    '    color: #FFB800; letter-spacing: 2px;\n' +
    '  }\n' +
    '  #now-boarding {\n' +
    '    position: absolute; top: 50%; left: 50%;\n' +
    '    transform: translate(-50%, -50%);\n' +
    '    z-index: 80; opacity: 0; pointer-events: none;\n' +
    '    text-align: center;\n' +
    '  }\n' +
    '  #now-boarding-text {\n' +
    '    font-size: 72px; font-weight: 900; color: #00FF88;\n' +
    '    letter-spacing: 8px;\n' +
    '    text-shadow: 0 0 30px rgba(0,255,136,0.5), 0 0 60px rgba(0,255,136,0.3);\n' +
    '  }\n' +
    '  #cta-overlay {\n' +
    '    position: absolute; top: 0; left: 0;\n' +
    '    width: ' + W + 'px; height: ' + H + 'px;\n' +
    '    z-index: 90; opacity: 0; pointer-events: none;\n' +
    '    display: flex; flex-direction: column;\n' +
    '    align-items: center; justify-content: center;\n' +
    '    background: rgba(17,17,17,0.92);\n' +
    '  }\n' +
    '  #cta-handle {\n' +
    '    font-size: 64px; font-weight: 900; color: #FFB800;\n' +
    '    letter-spacing: 4px; margin-bottom: 24px;\n' +
    '  }\n' +
    '  #cta-message {\n' +
    '    font-size: 28px; color: #fff; letter-spacing: 6px;\n' +
    '    text-transform: uppercase; opacity: 0.8;\n' +
    '  }\n' +
    '  #cta-line {\n' +
    '    width: 200px; height: 3px; background: #FFB800;\n' +
    '    margin: 30px 0;\n' +
    '  }\n' +
    '  #scanline {\n' +
    '    position: absolute; top: 0; left: 0;\n' +
    '    width: ' + W + 'px; height: ' + H + 'px;\n' +
    '    background: repeating-linear-gradient(\n' +
    '      0deg, transparent, transparent 3px,\n' +
    '      rgba(0,0,0,0.08) 3px, rgba(0,0,0,0.08) 4px\n' +
    '    );\n' +
    '    z-index: 95; pointer-events: none; opacity: 0.5;\n' +
    '  }\n' +
    '</style>\n</head>\n<body>\n<div id="root">\n' +
    '  <div id="dep-header">\n' +
    '    <div id="dep-header-text">DEPARTURES</div>\n' +
    '    <div id="dep-clock">14:30</div>\n' +
    '  </div>\n' +
    '  <div id="col-headers">\n' +
    '    <div class="col-label col-dest">DESTINATION</div>\n' +
    '    <div class="col-label col-status">STATUS</div>\n' +
    '    <div class="col-label col-gate">GATE</div>\n' +
    '    <div class="col-label col-time">TIME</div>\n' +
    '  </div>\n' +
    '  ' + rowsHTML + '\n' +
    '  <div id="now-boarding">\n' +
    '    <div id="now-boarding-text">NOW BOARDING</div>\n' +
    '  </div>\n' +
    '  <div id="cta-overlay">\n' +
    '    <div id="cta-handle">@madebyaidan</div>\n' +
    '    <div id="cta-line"></div>\n' +
    '    <div id="cta-message">DM for your boarding pass</div>\n' +
    '  </div>\n' +
    '  <div id="scanline"></div>\n' +
    '</div>\n' +
    '<script>\n' +
    '  var W = ' + W + ';\n' +
    '  var H = ' + H + ';\n' +
    '  var PHOTO_COUNT = ' + photoCount + ';\n' +
    '  var IMG_DATA = ' + imgDataJSON + ';\n' +
    '\n' +
    '  for (var i = 0; i < PHOTO_COUNT; i++) {\n' +
    '    var img = document.getElementById("gate-img-" + i);\n' +
    '    if (img) img.src = IMG_DATA[i];\n' +
    '  }\n' +
    '\n' +
    '  var CHARS = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";\n' +
    '\n' +
    '  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }\n' +
    '  function easeIn(t) { return Math.pow(t, 3); }\n' +
    '  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }\n' +
    '  function lerp(a, b, t) { return a + (b - a) * clamp(t, 0, 1); }\n' +
    '  function prog(t, start, end) { return clamp((t - start) / (end - start), 0, 1); }\n' +
    '\n' +
    '  function getFlapChar(row, col, section, target, t) {\n' +
    '    var rowSettleStart = 2.0 + row * 0.28;\n' +
    '    var colDelay = col * 0.04;\n' +
    '    var charSettledTime = rowSettleStart + colDelay + 0.15;\n' +
    '    if (t < 0.5) return " ";\n' +
    '    if (t >= charSettledTime) return target;\n' +
    '    var flipSpeed = 8;\n' +
    '    var idx = Math.floor(t * flipSpeed + row * 7 + col * 3);\n' +
    '    return CHARS[Math.abs(idx) % CHARS.length];\n' +
    '  }\n' +
    '\n' +
    '  function updateFlaps(t) {\n' +
    '    var flaps = document.querySelectorAll(".flap-char");\n' +
    '    for (var i = 0; i < flaps.length; i++) {\n' +
    '      var flap = flaps[i];\n' +
    '      var row = parseInt(flap.dataset.row);\n' +
    '      var col = parseInt(flap.dataset.col);\n' +
    '      var section = flap.dataset.section;\n' +
    '      var target = flap.dataset.target;\n' +
    '      var ch = getFlapChar(row, col, section, target, t);\n' +
    '      var topText = flap.querySelector(".flap-top .flap-char-text");\n' +
    '      var bottomText = flap.querySelector(".flap-bottom .flap-char-text");\n' +
    '      if (topText) topText.textContent = ch;\n' +
    '      if (bottomText) bottomText.textContent = ch;\n' +
    '      if (section === "status" && row === 0 && t > 2.6) {\n' +
    '        topText.style.color = "#00FF88";\n' +
    '        bottomText.style.color = "#00FF88";\n' +
    '      } else if (section === "status") {\n' +
    '        topText.style.color = "#FFB800";\n' +
    '        bottomText.style.color = "#FFB800";\n' +
    '      }\n' +
    '    }\n' +
    '  }\n' +
    '\n' +
    '  window.__applyUpTo = function(t) {\n' +
    '    var depHeader = document.getElementById("dep-header");\n' +
    '    depHeader.style.opacity = String(easeOut(prog(t, 0.0, 0.8)));\n' +
    '    var colHeaders = document.getElementById("col-headers");\n' +
    '    colHeaders.style.opacity = String(easeOut(prog(t, 0.3, 1.0)));\n' +
    '\n' +
    '    for (var r = 0; r < 10; r++) {\n' +
    '      var row = document.getElementById("row-" + r);\n' +
    '      if (!row) continue;\n' +
    '      var rowAppear = 0.5 + r * 0.12;\n' +
    '      row.style.opacity = String(easeOut(prog(t, rowAppear, rowAppear + 0.4)));\n' +
    '      var gateImg = document.getElementById("gate-img-" + r);\n' +
    '      if (gateImg) {\n' +
    '        var photoSlideStart = 5.0 + r * 0.45;\n' +
    '        var photoSlideEnd = photoSlideStart + 0.5;\n' +
    '        if (t < photoSlideStart) {\n' +
    '          gateImg.style.transform = "translateX(100%)";\n' +
    '          gateImg.style.opacity = "0";\n' +
    '        } else if (t < photoSlideEnd) {\n' +
    '          var p = easeOut(prog(t, photoSlideStart, photoSlideEnd));\n' +
    '          gateImg.style.transform = "translateX(" + lerp(100, 0, p) + "%)";\n' +
    '          gateImg.style.opacity = String(p);\n' +
    '        } else {\n' +
    '          gateImg.style.transform = "translateX(0)";\n' +
    '          gateImg.style.opacity = "1";\n' +
    '        }\n' +
    '      }\n' +
    '    }\n' +
    '    updateFlaps(t);\n' +
    '\n' +
    '    var nowBoarding = document.getElementById("now-boarding");\n' +
    '    if (t >= 10.0 && t < 12.0) {\n' +
    '      var flashCycle = Math.floor((t - 10.0) * 4) % 2;\n' +
    '      var fadeIn = easeOut(prog(t, 10.0, 10.3));\n' +
    '      nowBoarding.style.opacity = String(fadeIn * (flashCycle === 0 ? 1.0 : 0.3));\n' +
    '    } else {\n' +
    '      nowBoarding.style.opacity = "0";\n' +
    '    }\n' +
    '\n' +
    '    var ctaOverlay = document.getElementById("cta-overlay");\n' +
    '    if (t >= 12.0) {\n' +
    '      ctaOverlay.style.opacity = String(easeOut(prog(t, 12.0, 12.8)));\n' +
    '    } else {\n' +
    '      ctaOverlay.style.opacity = "0";\n' +
    '    }\n' +
    '\n' +
    '    var clock = document.getElementById("dep-clock");\n' +
    '    if (t < 5) clock.textContent = "14:30";\n' +
    '    else if (t < 10) clock.textContent = "14:31";\n' +
    '    else clock.textContent = "14:32";\n' +
    '  };\n' +
    '\n' +
    '  if (location.search.includes("capture=1")) {\n' +
    '    var s = document.createElement("style");\n' +
    '    s.textContent = "*, *::before, *::after { transition-duration: 0s !important; animation-duration: 0.001s !important; }";\n' +
    '    document.head.appendChild(s);\n' +
    '  }\n' +
    '</script>\n</body>\n</html>';
}

async function main() {
  console.log('=== Airport Departures Board Reel v63a ===');
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
    if (frame % (FPS * 2) === 0) {
      console.log('  ' + t.toFixed(1) + 's / ' + TOTAL_DURATION + 's');
    }
  }

  await browser.close();
  console.log('All frames captured');

  var outputMp4 = path.join(OUT_DIR, '63a-airport-departures.mp4');
  execSync(
    'ffmpeg -y -framerate ' + FPS + ' -i "' + path.join(framesDir, 'frame_%05d.png') + '" ' +
    '-c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r ' + FPS + ' -an "' + outputMp4 + '"',
    { stdio: 'inherit' }
  );

  rmSync(framesDir, { recursive: true, force: true });

  var reelsDir = path.join(__dirname, 'reels');
  if (!existsSync(reelsDir)) mkdirSync(reelsDir, { recursive: true });
  execSync('cp "' + outputMp4 + '" "' + path.join(reelsDir, '63a-airport-departures.mp4') + '"');

  var sz = statSync(outputMp4);
  console.log('Final: ' + (sz.size / (1024 * 1024)).toFixed(1) + ' MB');
  console.log('Copied to reels/63a-airport-departures.mp4');
  console.log('=== Done ===');
}

main().catch(function(err) {
  console.error(err);
  process.exit(1);
});
