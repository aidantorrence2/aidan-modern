import { chromium } from 'playwright';
import { execSync } from 'child_process';
import { mkdirSync, rmSync, existsSync, readFileSync, writeFileSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

var __dirname = path.dirname(fileURLToPath(import.meta.url));
var OUT_DIR = path.join(__dirname, 'output-49a');

var W = 1080;
var H = 1920;
var FPS = 30;
var SAFE_TOP = 213;
var SAFE_BOTTOM = 430;
var SAFE_LEFT = 66;
var SAFE_RIGHT = 1027;

var FILM_SCANS_DIR = '/Volumes/PortableSSD/Exports/film scans';
var PHOTO_NAMES = [
  '000028-6.jpg',
  '000030-6.jpg',
  '000031-6.jpg',
  '000032-6.jpg',
  '000035-6.jpg',
  '000036-6.jpg',
  '000039-6.jpg',
  '000024-6.jpg',
];

var TOTAL_DURATION = 24; // seconds
var TOTAL_FRAMES = TOTAL_DURATION * FPS; // 720

var MONO = "'SF Mono', 'Menlo', 'Courier New', monospace";

/* Tetris piece colors */
var TC = {
  I: '#00f0f0', O: '#f0f000', T: '#a000f0',
  S: '#00f000', Z: '#f00000', J: '#0000f0', L: '#f0a000'
};
var TETRIS_COLORS = Object.values(TC);

var GRID_COLS = 10;
var CELL = 90;
var GRID_W = GRID_COLS * CELL; // 900
var GRID_LEFT = Math.floor((W - GRID_W) / 2); // 90
var GRID_TOP = SAFE_TOP + 80;
var GRID_ROWS = Math.floor((H - SAFE_TOP - SAFE_BOTTOM - 100) / CELL);
var GRID_H = GRID_ROWS * CELL;

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
    var dst = path.join(cropDir, f.replace('.jpg', '_processed.jpg'));
    execSync('magick "' + src + '" -shave 500x600 +repage -auto-level -quality 95 "' + dst + '"', { stdio: 'pipe' });
    processed.push({ name: f, path: dst });
    console.log('  Processed: ' + f);
  }
  return processed;
}

function lighten(hex) {
  var r = Math.min(255, parseInt(hex.slice(1,3),16) + 80);
  var g = Math.min(255, parseInt(hex.slice(3,5),16) + 80);
  var b = Math.min(255, parseInt(hex.slice(5,7),16) + 80);
  return 'rgb(' + r + ',' + g + ',' + b + ')';
}

function darken(hex) {
  var r = Math.max(0, parseInt(hex.slice(1,3),16) - 60);
  var g = Math.max(0, parseInt(hex.slice(3,5),16) - 60);
  var b = Math.max(0, parseInt(hex.slice(5,7),16) - 60);
  return 'rgb(' + r + ',' + g + ',' + b + ')';
}

function bevelStyle(color) {
  return 'background:' + color + ';border-top:3px solid ' + lighten(color) + ';border-left:3px solid ' + lighten(color) + ';border-bottom:3px solid ' + darken(color) + ';border-right:3px solid ' + darken(color) + ';';
}

function buildHTML(imageDataList) {
  var photoCount = imageDataList.length;

  /* Title words for scene 1 */
  var titleWords = [
    { word: 'FREE',  color: TC.I, delay: 0.3 },
    { word: 'PHOTO', color: TC.O, delay: 0.9 },
    { word: 'SHOOT', color: TC.S, delay: 1.5 },
    { word: 'BALI',  color: TC.Z, delay: 2.1 },
  ];

  /* Scene 1 falling tetromino pieces */
  var scene1Pieces = [
    { type: 'I', col: 0, landRow: GRID_ROWS - 1, delay: 0.3, dur: 0.8 },
    { type: 'I', col: 4, landRow: GRID_ROWS - 1, delay: 0.7, dur: 0.8 },
    { type: 'O', col: 8, landRow: GRID_ROWS - 1, delay: 1.1, dur: 0.8 },
    { type: 'T', col: 0, landRow: GRID_ROWS - 2, delay: 1.5, dur: 0.8 },
    { type: 'I', col: 3, landRow: GRID_ROWS - 2, delay: 1.9, dur: 0.8 },
    { type: 'T', col: 7, landRow: GRID_ROWS - 2, delay: 2.3, dur: 0.8 },
  ];
  var LINE_CLEAR_1_TIME = 3.3;

  var SHAPES = {
    I: [[0,0],[1,0],[2,0],[3,0]],
    O: [[0,0],[1,0],[0,1],[1,1]],
    T: [[0,0],[1,0],[2,0],[1,1]],
    S: [[1,0],[2,0],[0,1],[1,1]],
    Z: [[0,0],[1,0],[1,1],[2,1]],
    J: [[0,0],[0,1],[1,1],[2,1]],
    L: [[2,0],[0,1],[1,1],[2,1]],
  };

  /* --- Build title word CSS/HTML --- */
  var titleWordCSS = '';
  var titleWordHTML = '';
  var titleBlockH = 80;
  var titleGap = 28;
  var totalTitleH = titleWords.length * titleBlockH + (titleWords.length - 1) * titleGap;
  var titleStartY = Math.floor((GRID_H - totalTitleH) / 2) - 40;

  titleWords.forEach(function(tw, wi) {
    var landY = titleStartY + wi * (titleBlockH + titleGap);
    titleWordCSS += '@keyframes titleWordFall_' + wi + ' {' +
      '0% { transform: translate(-50%, -800px); }' +
      '70% { transform: translate(-50%, 8px); }' +
      '85% { transform: translate(-50%, -3px); }' +
      '100% { transform: translate(-50%, 0px); }' +
      '}\n' +
      '.title-word-' + wi + ' {' +
      'position:absolute;left:50%;top:' + landY + 'px;' +
      'transform:translate(-50%,-800px);opacity:0;z-index:12;' +
      'animation: fadeIn 0.01s linear ' + tw.delay + 's forwards,' +
      ' titleWordFall_' + wi + ' 0.5s cubic-bezier(0.25,0.46,0.45,0.94) ' + tw.delay + 's forwards;' +
      '}\n';
    var padX = 30;
    titleWordHTML += '<div class="title-word-' + wi + '" style="' + bevelStyle(tw.color) + 'padding:8px ' + padX + 'px;border-radius:4px;display:flex;align-items:center;justify-content:center;">' +
      '<span style="font-family:' + MONO + ';font-size:65px;font-weight:900;color:#fff;letter-spacing:6px;text-shadow:4px 4px 0 rgba(0,0,0,0.7);">' + tw.word + '</span>' +
      '</div>\n';
  });

  /* --- Build piece CSS/HTML --- */
  var pieceCSS = '';
  var pieceHTML = '';

  scene1Pieces.forEach(function(p, idx) {
    var shape = SHAPES[p.type];
    var color = TC[p.type];
    var startY = -4 * CELL;
    var maxRowOffset = 0;
    for (var si = 0; si < shape.length; si++) {
      if (shape[si][1] > maxRowOffset) maxRowOffset = shape[si][1];
    }
    var endY = p.landRow * CELL - maxRowOffset * CELL;

    shape.forEach(function(offset, bi) {
      var id = 'p' + idx + 'b' + bi;
      var x = GRID_LEFT + (p.col + offset[0]) * CELL;
      var landY = GRID_TOP + endY + offset[1] * CELL;
      pieceCSS += '@keyframes fall_' + id + ' {' +
        '0% { top:' + (GRID_TOP + startY) + 'px; opacity:1; }' +
        '100% { top:' + landY + 'px; opacity:1; }' +
        '}\n' +
        '@keyframes clearRow_' + id + ' {' +
        '0% { opacity:1; } 30% { opacity:1; background:#fff; }' +
        '60% { opacity:1; background:#fff; } 100% { opacity:0; }' +
        '}\n' +
        '.' + id + ' {' +
        'position:absolute;left:' + x + 'px;top:' + (GRID_TOP + startY) + 'px;' +
        'width:' + (CELL - 2) + 'px;height:' + (CELL - 2) + 'px;' +
        bevelStyle(color) +
        'opacity:0;z-index:5;' +
        'animation: fadeIn 0.01s linear ' + p.delay + 's forwards,' +
        ' fall_' + id + ' ' + p.dur + 's ease-in ' + p.delay + 's forwards,' +
        ' clearRow_' + id + ' 0.6s ease-out ' + LINE_CLEAR_1_TIME + 's forwards;' +
        '}\n';
      pieceHTML += '<div class="' + id + '"></div>\n';
    });
  });

  /* --- Scene 2: photos --- */
  var photoImgHTML = '';
  for (var i = 0; i < photoCount; i++) {
    photoImgHTML += '<img id="photo' + i + '" src="' + imageDataList[i] + '" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;object-position:center 20%;display:block;opacity:0;" />\n';
  }

  /* --- Scene 3: step pieces --- */
  var steps = [
    { text: '1.DM ME',    color: TC.I },
    { text: '2.PICK DATE', color: TC.O },
    { text: '3.SHOW UP',  color: TC.S },
  ];

  var stepHTML = '';
  for (var si = 0; si < steps.length; si++) {
    var step = steps[si];
    var chars = step.text.split('');
    var charBlocks = '';
    for (var ci = 0; ci < chars.length; ci++) {
      var ch = chars[ci] === ' ' ? '&nbsp;' : chars[ci];
      charBlocks += '<div style="width:80px;height:90px;' + bevelStyle(step.color) + 'display:flex;align-items:center;justify-content:center;font-family:' + MONO + ';font-size:48px;font-weight:900;color:#fff;text-shadow:3px 3px 0 rgba(0,0,0,0.7);">' + ch + '</div>';
    }
    stepHTML += '<div id="step' + si + '" style="position:absolute;left:50%;transform:translateX(-50%);opacity:0;z-index:10;">' +
      '<div style="display:flex;gap:2px;">' + charBlocks + '</div>' +
      '</div>\n';
  }

  /* --- CTA side block stacks --- */
  var ctaStackHeight = 14;
  var ctaLeftBlocks = '';
  var ctaRightBlocks = '';
  for (var bi = 0; bi < ctaStackHeight; bi++) {
    ctaLeftBlocks += '<div id="ctaLB' + bi + '" style="width:' + (CELL - 2) + 'px;height:' + (CELL - 2) + 'px;' + bevelStyle(TETRIS_COLORS[bi % TETRIS_COLORS.length]) + 'opacity:0;"></div>';
    ctaRightBlocks += '<div id="ctaRB' + bi + '" style="width:' + (CELL - 2) + 'px;height:' + (CELL - 2) + 'px;' + bevelStyle(TETRIS_COLORS[(bi + 3) % TETRIS_COLORS.length]) + 'opacity:0;"></div>';
  }

  /* --- Score counter --- */
  var scoreVals = [];
  for (var sv = 0; sv < 20; sv++) {
    scoreVals.push(Math.floor(Math.random() * 90000 + 10000 + sv * 5000));
  }

  /* Build timeline */
  var tlEntries = [];

  tlEntries.push('[0, function() { document.getElementById("scene1").style.opacity = "1"; }]');
  tlEntries.push('[4.0, function() { document.getElementById("scene1").style.opacity = "0"; document.getElementById("scene2").style.opacity = "1"; }]');

  var photoStart = 4.2;
  for (var pi = 0; pi < photoCount; pi++) {
    var showT = (photoStart + pi * 1.5).toFixed(2);
    var phIdx = pi;
    var hideOldLines = '';
    for (var pj = 0; pj < pi; pj++) {
      hideOldLines += 'document.getElementById("photo' + pj + '").style.opacity="0";';
    }
    tlEntries.push('[' + showT + ', function() {' +
      hideOldLines +
      'document.getElementById("photo' + phIdx + '").style.opacity="1";' +
      'document.getElementById("photoCounter").textContent="LINE CLEAR ' + (pi+1) + ' / 8";' +
      '}]');
  }

  tlEntries.push('[16.0, function() { document.getElementById("scene2").style.opacity="0"; document.getElementById("scene3").style.opacity="1"; }]');
  tlEntries.push('[16.3, function() { document.getElementById("howTitle").style.opacity="1"; }]');

  var stepTimes = [16.5, 17.8, 19.1];
  var stepLandYs = [320, 520, 720];
  for (var sti = 0; sti < steps.length; sti++) {
    var stIdx = sti;
    var stT = stepTimes[sti].toFixed(1);
    var landYpx = stepLandYs[sti];
    tlEntries.push('[' + stT + ', function() {' +
      'var el=document.getElementById("step' + stIdx + '");' +
      'el.style.top="' + landYpx + 'px";' +
      'el.style.opacity="1";' +
      '}]');
  }

  tlEntries.push('[21.0, function() { document.getElementById("scene3").style.opacity="0"; document.getElementById("flashOverlay").style.opacity="0.95"; }]');
  tlEntries.push('[21.2, function() { document.getElementById("flashOverlay").style.opacity="0"; document.getElementById("scene4").style.opacity="1"; }]');

  for (var cbi = 0; cbi < ctaStackHeight; cbi++) {
    var cbIdx = cbi;
    var cbT = (21.3 + 0.06 * cbi).toFixed(2);
    tlEntries.push('[' + cbT + ', function() {' +
      'document.getElementById("ctaLB' + cbIdx + '").style.opacity="1";' +
      'document.getElementById("ctaRB' + cbIdx + '").style.opacity="1";' +
      '}]');
  }

  tlEntries.push('[21.8, function() { document.getElementById("ctaHandle").style.opacity="1"; }]');
  tlEntries.push('[22.2, function() { document.getElementById("ctaSub").style.opacity="1"; }]');
  tlEntries.push('[22.6, function() { document.getElementById("ctaBtn").style.opacity="1"; }]');
  tlEntries.push('[23.0, function() { document.getElementById("ctaLimited").style.opacity="1"; }]');

  for (var sc = 0; sc < scoreVals.length; sc++) {
    var scT = (0.1 + sc * 0.25).toFixed(2);
    var scIdx = sc;
    tlEntries.push('[' + scT + ', function() { document.getElementById("scoreDisplay").textContent="' + scoreVals[sc].toLocaleString() + '"; }]');
  }
  tlEntries.push('[' + (0.1 + scoreVals.length * 0.25).toFixed(2) + ', function() { document.getElementById("scoreDisplay").textContent="99,999"; }]');

  var timelineStr = tlEntries.join(',\n    ');

  return '<!DOCTYPE html>\n' +
'<html>\n<head>\n<meta charset="utf-8">\n' +
'<style>\n' +
'* { box-sizing:border-box; margin:0; padding:0; }\n' +
'html,body { margin:0;padding:0;background:#0a0a0a;font-family:' + MONO + ';overflow:hidden; }\n' +
'@keyframes fadeIn { 0%{opacity:0} 100%{opacity:1} }\n' +
'@keyframes ctaGlow { 0%,100%{box-shadow:0 0 20px rgba(0,240,240,0.3)} 50%{box-shadow:0 0 50px rgba(0,240,240,0.8),0 0 100px rgba(0,240,240,0.3)} }\n' +
'@keyframes pulseText { 0%,100%{opacity:1} 50%{opacity:0.5} }\n' +

'.tetris-grid {' +
'position:absolute;left:' + GRID_LEFT + 'px;top:' + GRID_TOP + 'px;' +
'width:' + GRID_W + 'px;height:' + GRID_H + 'px;' +
'z-index:2;pointer-events:none;' +
'background-image:linear-gradient(rgba(255,255,255,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.07) 1px,transparent 1px);' +
'background-size:' + CELL + 'px ' + CELL + 'px;' +
'border:2px solid rgba(255,255,255,0.12);' +
'}\n' +

'#scene1,#scene2,#scene3,#scene4 {' +
'position:absolute;left:' + GRID_LEFT + 'px;top:' + GRID_TOP + 'px;' +
'width:' + GRID_W + 'px;height:' + GRID_H + 'px;' +
'z-index:10;transition:none;' +
'}\n' +
'#scene1{opacity:0;}\n' +
'#scene2{opacity:0;}\n' +
'#scene3{opacity:0;}\n' +
'#scene4{opacity:0;}\n' +

titleWordCSS +

'@keyframes lineClear1 { 0%{opacity:0} 10%{opacity:0.9;background:#fff} 50%{opacity:0.9;background:#fff} 100%{opacity:0} }\n' +
'.line-clear-1 {' +
'position:absolute;left:' + GRID_LEFT + 'px;bottom:' + (H - GRID_TOP - GRID_H) + 'px;' +
'width:' + GRID_W + 'px;height:' + (CELL * 2 + 4) + 'px;' +
'z-index:15;pointer-events:none;opacity:0;' +
'animation:lineClear1 0.6s ease-out ' + LINE_CLEAR_1_TIME + 's forwards;' +
'}\n' +

pieceCSS +

'</style>\n</head>\n<body>\n' +
'<div id="root" style="width:' + W + 'px;height:' + H + 'px;position:relative;overflow:hidden;background:#0a0a0a;">\n' +

'<div class="tetris-grid"></div>\n' +
'<div style="position:absolute;inset:0;z-index:100;pointer-events:none;background:repeating-linear-gradient(0deg,rgba(0,0,0,0.1) 0px,rgba(0,0,0,0.1) 1px,transparent 1px,transparent 3px);"></div>\n' +
'<div id="flashOverlay" style="position:absolute;inset:0;background:#fff;opacity:0;z-index:50;pointer-events:none;"></div>\n' +

/* Header */
'<div style="position:absolute;top:' + SAFE_TOP + 'px;left:' + SAFE_LEFT + 'px;right:' + (W - SAFE_RIGHT) + 'px;z-index:55;padding:8px 0;display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid rgba(255,255,255,0.15);opacity:0;animation:fadeIn 0.4s ease-out 0.1s forwards;">\n' +
'  <div><div style="font-size:14px;color:rgba(255,255,255,0.35);letter-spacing:3px;">SCORE</div><div style="font-size:24px;font-weight:900;color:#00f0f0;letter-spacing:2px;min-width:120px;" id="scoreDisplay">00000</div></div>\n' +
'  <div style="text-align:center;"><div style="font-size:18px;font-weight:900;color:#00f0f0;letter-spacing:3px;text-shadow:0 0 12px rgba(0,240,240,0.5);">FREE PHOTO SHOOT BALI</div></div>\n' +
'  <div style="text-align:right;"><div style="font-size:14px;color:rgba(255,255,255,0.35);letter-spacing:3px;">LEVEL</div><div style="font-size:24px;font-weight:900;color:#f0a000;letter-spacing:2px;">1</div></div>\n' +
'</div>\n' +

pieceHTML +
'<div class="line-clear-1"></div>\n' +

/* SCENE 1 */
'<div id="scene1" style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;">\n' +
titleWordHTML +
'</div>\n' +

/* SCENE 2 */
'<div id="scene2" style="position:absolute;left:' + GRID_LEFT + 'px;top:' + GRID_TOP + 'px;width:' + GRID_W + 'px;height:' + GRID_H + 'px;z-index:10;">\n' +
'  <div style="position:absolute;top:8px;left:0;right:0;text-align:center;font-size:18px;color:rgba(255,255,255,0.35);letter-spacing:5px;z-index:2;">PORTFOLIO</div>\n' +
'  <div id="photoCounter" style="position:absolute;bottom:40px;left:0;right:0;text-align:center;font-family:' + MONO + ';font-size:22px;color:#00f0f0;letter-spacing:3px;text-shadow:0 0 10px rgba(0,240,240,0.6);z-index:25;"></div>\n' +
'  <div style="position:absolute;top:50px;left:0;right:0;bottom:70px;overflow:hidden;border-radius:12px;">\n' +
photoImgHTML +
'  </div>\n' +
'</div>\n' +

/* SCENE 3 */
'<div id="scene3" style="position:absolute;left:' + GRID_LEFT + 'px;top:' + GRID_TOP + 'px;width:' + GRID_W + 'px;height:' + GRID_H + 'px;z-index:10;">\n' +
'  <div id="howTitle" style="position:absolute;top:120px;left:0;right:0;text-align:center;font-size:42px;font-weight:900;color:rgba(255,255,255,0.5);letter-spacing:8px;opacity:0;text-shadow:0 0 15px rgba(0,240,240,0.4);">HOW IT WORKS</div>\n' +
stepHTML +
'</div>\n' +

/* SCENE 4 */
'<div id="scene4" style="position:absolute;left:' + GRID_LEFT + 'px;top:' + GRID_TOP + 'px;width:' + GRID_W + 'px;height:' + GRID_H + 'px;z-index:10;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;">\n' +
'  <div style="position:absolute;left:0;bottom:0;width:' + CELL + 'px;display:flex;flex-direction:column-reverse;">' + ctaLeftBlocks + '</div>\n' +
'  <div style="position:absolute;right:0;bottom:0;width:' + CELL + 'px;display:flex;flex-direction:column-reverse;">' + ctaRightBlocks + '</div>\n' +
'  <div id="ctaHandle" style="font-size:56px;font-weight:900;color:#fff;text-align:center;text-shadow:0 0 25px rgba(0,240,240,0.5);opacity:0;">@madebyaidan</div>\n' +
'  <div id="ctaSub" style="font-size:28px;color:rgba(255,255,255,0.45);text-align:center;opacity:0;">on Instagram</div>\n' +
'  <div id="ctaBtn" style="margin-top:20px;padding:24px 70px;' + bevelStyle('#00f0f0') + 'font-size:40px;font-weight:900;color:#000;text-align:center;letter-spacing:4px;opacity:0;">SEND ME A DM</div>\n' +
'  <div id="ctaLimited" style="margin-top:28px;font-size:26px;color:#f00000;text-align:center;letter-spacing:3px;text-shadow:0 0 10px rgba(240,0,0,0.4);opacity:0;">LIMITED SPOTS</div>\n' +
'</div>\n' +

'</div>\n' +

'<script>\n' +
'var timeline = [\n' +
'  ' + timelineStr + '\n' +
'];\n\n' +
'window.__applyUpTo = function(t) {\n' +
'  for (var i = 0; i < timeline.length; i++) {\n' +
'    if (timeline[i][0] <= t) timeline[i][1]();\n' +
'  }\n' +
'};\n\n' +
'if (location.search.includes("capture=1")) {\n' +
'  var style = document.createElement("style");\n' +
'  style.textContent = "*, *::before, *::after { transition-duration: 0s !important; animation-duration: 0s !important; }";\n' +
'  document.head.appendChild(style);\n' +
'}\n' +
'</script>\n' +
'</body>\n</html>';
}

async function main() {
  console.log('=== Tetris Mediterranean Reel v49a ===');
  resetOutputDir();

  console.log('Processing photos from film scans...');
  var processed = processPhotos();

  console.log('Loading photos as base64...');
  var imageDataList = [];
  for (var p of processed) {
    var buf = readFileSync(p.path);
    imageDataList.push('data:image/jpeg;base64,' + buf.toString('base64'));
    console.log('  ' + p.name + ' (' + (buf.length / 1024).toFixed(0) + ' KB)');
  }

  var html = buildHTML(imageDataList);
  var htmlPath = path.join(OUT_DIR, 'tetris.html');
  writeFileSync(htmlPath, html);
  console.log('HTML written: ' + htmlPath);

  var framesDir = path.join(OUT_DIR, 'tmp-frames');
  mkdirSync(framesDir, { recursive: true });

  var browser = await chromium.launch();
  var page = await browser.newPage({ viewport: { width: W, height: H } });
  await page.goto('file://' + htmlPath + '?capture=1', { waitUntil: 'load' });
  await page.waitForTimeout(500);

  console.log('Capturing ' + TOTAL_FRAMES + ' frames at ' + FPS + ' fps...');

  for (var frame = 0; frame < TOTAL_FRAMES; frame++) {
    var t = frame / FPS;

    await page.evaluate(function(time) {
      document.getElementById('scene1').style.opacity = '0';
      document.getElementById('scene2').style.opacity = '0';
      document.getElementById('scene3').style.opacity = '0';
      document.getElementById('scene4').style.opacity = '0';
      document.getElementById('flashOverlay').style.opacity = '0';

      var howTitle = document.getElementById('howTitle');
      if (howTitle) howTitle.style.opacity = '0';

      for (var i = 0; i < 20; i++) {
        var img = document.getElementById('photo' + i);
        if (!img) break;
        img.style.opacity = '0';
      }
      var counter = document.getElementById('photoCounter');
      if (counter) counter.textContent = '';

      for (var si = 0; si < 3; si++) {
        var step = document.getElementById('step' + si);
        if (step) { step.style.opacity = '0'; step.style.top = '-120px'; }
      }

      for (var bi = 0; bi < 14; bi++) {
        var lb = document.getElementById('ctaLB' + bi);
        var rb = document.getElementById('ctaRB' + bi);
        if (lb) lb.style.opacity = '0';
        if (rb) rb.style.opacity = '0';
      }

      var ctaHandle = document.getElementById('ctaHandle');
      var ctaSub = document.getElementById('ctaSub');
      var ctaBtn = document.getElementById('ctaBtn');
      var ctaLimited = document.getElementById('ctaLimited');
      if (ctaHandle) ctaHandle.style.opacity = '0';
      if (ctaSub) ctaSub.style.opacity = '0';
      if (ctaBtn) ctaBtn.style.opacity = '0';
      if (ctaLimited) ctaLimited.style.opacity = '0';

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
  console.log('Frames captured');

  var finalMp4 = path.join(OUT_DIR, 'manila-tetris-v49a.mp4');
  execSync(
    'ffmpeg -y -framerate ' + FPS + ' -i "' + path.join(framesDir, 'frame_%05d.png') + '" ' +
    '-c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r ' + FPS + ' -an "' + finalMp4 + '"',
    { stdio: 'inherit' }
  );

  rmSync(framesDir, { recursive: true, force: true });
  console.log('Video encoded: ' + finalMp4);

  var reelsDir = path.join(__dirname, 'reels');
  if (!existsSync(reelsDir)) mkdirSync(reelsDir, { recursive: true });
  execSync('cp "' + finalMp4 + '" "' + path.join(reelsDir, 'manila-tetris-v49a.mp4') + '"');

  var sz = statSync(finalMp4);
  console.log('Final: ' + (sz.size / (1024 * 1024)).toFixed(1) + ' MB');
  console.log('Copied to reels/manila-tetris-v49a.mp4');
  console.log('=== Done ===');
}

main().catch(function(err) {
  console.error(err);
  process.exit(1);
});
