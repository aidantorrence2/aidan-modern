import { chromium } from 'playwright';
import { execSync } from 'child_process';
import { mkdirSync, rmSync, existsSync, readFileSync, writeFileSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

var __dirname = path.dirname(fileURLToPath(import.meta.url));
var OUT_DIR = path.join(__dirname, 'output-68a');

var W = 1080;
var H = 1920;
var FPS = 30;
var TOTAL_FRAMES = 720; // 24s at 30fps
var TOTAL_DURATION = 24;

var FILM_SCANS_DIR = '/Volumes/PortableSSD/Exports/film scans';
var PHOTO_NAMES = [
  '000041-5.jpg',
  '000042-4.jpg',
  '000043-5.jpg',
  '000044-5.jpg',
  '000045-5.jpg',
  '000046-5.jpg',
  '000047-5.jpg',
  '000053-5.jpg',
];

// Poster rotations for each slam (degrees)
var POSTER_ROTS = [-1.5, 2.1, -0.8, 1.7, -2.2, 0.9, -1.3, 1.6];
// Model names for each poster
var MODEL_NAMES = [
  'Unknown Model #1',
  'Unknown Model #2',
  'Unknown Model #3',
  'Unknown Model #4',
  'Unknown Model #5',
  'Unknown Model #6',
  'Unknown Model #7',
  'Unknown Model #8',
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
    var dst = path.join(cropDir, name.replace(/\.(jpg|jpeg)$/i, '_processed.jpg'));
    execSync('magick "' + src + '" -shave 500x600 +repage -auto-level -quality 95 "' + dst + '"', { stdio: 'pipe' });
    var buf = readFileSync(dst);
    processed[name] = 'data:image/jpeg;base64,' + buf.toString('base64');
    console.log('  Processed: ' + name + ' (' + (buf.length / 1024).toFixed(0) + ' KB)');
  }
  return processed;
}

function buildHTML(imageDataMap) {
  var n = PHOTO_NAMES.length;

  // Build wanted poster elements (one per photo)
  var posterElements = PHOTO_NAMES.map(function(name, i) {
    return `
    <div id="poster-${i}" style="
      position:absolute;
      left:50%; top:50%;
      transform: translate(-50%, -50%) rotate(${POSTER_ROTS[i]}deg) scale(0);
      transform-origin: center center;
      width:780px; height:1080px;
      opacity:0;
      z-index:${50 + i};
      pointer-events:none;
    ">
      <!-- Parchment background -->
      <div style="
        position:absolute;inset:0;
        background: linear-gradient(135deg, #e8c98a 0%, #d4a574 30%, #c49060 60%, #b87d4a 100%);
        border-radius: 4px;
        box-shadow: 0 30px 80px rgba(0,0,0,0.6), 0 8px 20px rgba(0,0,0,0.4), inset 0 0 60px rgba(0,0,0,0.15);
      "></div>
      <!-- Paper texture noise -->
      <div style="
        position:absolute;inset:0;
        background-image: url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/><feColorMatrix type=%22saturate%22 values=%220%22/></filter><rect width=%22200%22 height=%22200%22 filter=%22url(%23n)%22 opacity=%220.08%22/></svg>');
        border-radius: 4px;
        opacity: 0.5;
        mix-blend-mode: multiply;
      "></div>
      <!-- Vignette edges (aged/burned) -->
      <div style="
        position:absolute;inset:0;
        background: radial-gradient(ellipse at center, transparent 40%, rgba(80,40,10,0.45) 100%);
        border-radius: 4px;
        pointer-events:none;
      "></div>
      <!-- Outer double border -->
      <div style="
        position:absolute;
        inset:18px;
        border: 4px solid #3a2008;
        border-radius:2px;
        pointer-events:none;
      "></div>
      <div style="
        position:absolute;
        inset:28px;
        border: 2px solid #3a2008;
        border-radius:2px;
        pointer-events:none;
      "></div>
      <!-- Nail dots in corners -->
      <div style="position:absolute;top:10px;left:10px;width:16px;height:16px;background:radial-gradient(circle at 40% 35%, #999, #333);border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.5);"></div>
      <div style="position:absolute;top:10px;right:10px;width:16px;height:16px;background:radial-gradient(circle at 40% 35%, #999, #333);border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.5);"></div>
      <div style="position:absolute;bottom:10px;left:10px;width:16px;height:16px;background:radial-gradient(circle at 40% 35%, #999, #333);border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.5);"></div>
      <div style="position:absolute;bottom:10px;right:10px;width:16px;height:16px;background:radial-gradient(circle at 40% 35%, #999, #333);border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.5);"></div>
      <!-- Star corner ornaments -->
      <div style="position:absolute;top:36px;left:36px;color:#3a2008;font-size:18px;line-height:1;">★</div>
      <div style="position:absolute;top:36px;right:36px;color:#3a2008;font-size:18px;line-height:1;">★</div>
      <div style="position:absolute;bottom:36px;left:36px;color:#3a2008;font-size:18px;line-height:1;">★</div>
      <div style="position:absolute;bottom:36px;right:36px;color:#3a2008;font-size:18px;line-height:1;">★</div>
      <!-- WANTED header -->
      <div style="
        position:absolute;
        top:50px; left:0; right:0;
        text-align:center;
        font-family: 'Georgia', 'Times New Roman', serif;
        font-size:128px;
        font-weight:900;
        color:#1a0a00;
        letter-spacing:14px;
        text-shadow: 3px 3px 0 rgba(0,0,0,0.3), -1px -1px 0 rgba(255,255,255,0.1);
        line-height:1;
        text-transform:uppercase;
      ">WANTED</div>
      <!-- Rope divider 1 -->
      <div style="
        position:absolute;
        top:185px; left:50px; right:50px; height:12px;
        display:flex;align-items:center;justify-content:center;
        font-family:monospace;font-size:11px;color:#3a2008;
        letter-spacing:1px;overflow:hidden;
      ">- - - - - - - - ✦ - - - - - - - - ✦ - - - - - - - - ✦ - - - - - - - - ✦ - - - - - - - - ✦ - - - - - - - -</div>
      <!-- Sub-header: DEAD OR ALIVE (crossed out) + FOR A FREE PHOTO SHOOT -->
      <div style="
        position:absolute;
        top:200px; left:0; right:0;
        text-align:center;
      ">
        <span style="
          font-family: 'Georgia', serif;
          font-size:28px;
          color:#1a0a00;
          letter-spacing:3px;
          text-decoration:line-through;
          text-decoration-color:#8b0000;
          text-decoration-thickness:3px;
          opacity:0.7;
          margin-right:8px;
          text-transform:uppercase;
        ">DEAD OR ALIVE</span>
        <span style="
          font-family:'Georgia',serif;
          font-size:24px;
          color:#2d1000;
          letter-spacing:2px;
          text-transform:uppercase;
          font-style:italic;
        ">FOR A FREE PHOTO SHOOT</span>
      </div>
      <!-- Rope divider 2 -->
      <div style="
        position:absolute;
        top:250px; left:50px; right:50px; height:12px;
        display:flex;align-items:center;
        font-family:monospace;font-size:11px;color:#3a2008;
        letter-spacing:1px;overflow:hidden;
      ">- - - - - - - - ✦ - - - - - - - - ✦ - - - - - - - - ✦ - - - - - - - - ✦ - - - - - - - - ✦ - - - - - - - -</div>
      <!-- Photo mugshot area -->
      <div style="
        position:absolute;
        top:272px; left:140px; right:140px; height:440px;
        background:#1a0a00;
        border: 6px solid #3a2008;
        box-shadow: inset 0 0 30px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.4);
        overflow:hidden;
      ">
        <img src="${imageDataMap[name]}" style="
          width:100%;height:100%;
          object-fit:cover;
          object-position:center 20%;
          filter: sepia(0.55) contrast(1.1) brightness(0.95);
          mix-blend-mode: multiply;
        " />
        <!-- Mugshot vignette -->
        <div style="position:absolute;inset:0;background:radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.35) 100%);pointer-events:none;"></div>
      </div>
      <!-- Name text under photo -->
      <div style="
        position:absolute;
        top:720px; left:0; right:0;
        text-align:center;
        font-family:'Georgia','Times New Roman',serif;
        font-size:26px;
        color:#1a0a00;
        letter-spacing:2px;
        text-transform:uppercase;
      ">NAME: <span style="font-style:italic;">${MODEL_NAMES[i]}</span></div>
      <div style="
        position:absolute;
        top:754px; left:0; right:0;
        text-align:center;
        font-family:'Georgia','Times New Roman',serif;
        font-size:22px;
        color:#2a1000;
        letter-spacing:2px;
        text-transform:uppercase;
        font-style:italic;
      ">LAST SEEN: Manila</div>
      <!-- Rope divider 3 -->
      <div style="
        position:absolute;
        top:790px; left:50px; right:50px; height:12px;
        display:flex;align-items:center;
        font-family:monospace;font-size:11px;color:#3a2008;
        letter-spacing:1px;overflow:hidden;
      ">- - - - - - - - ✦ - - - - - - - - ✦ - - - - - - - - ✦ - - - - - - - - ✦ - - - - - - - - ✦ - - - - - - - -</div>
      <!-- REWARD section -->
      <div style="
        position:absolute;
        top:810px; left:0; right:0;
        text-align:center;
      ">
        <div style="
          font-family:'Georgia','Times New Roman',serif;
          font-size:52px;
          font-weight:900;
          color:#8b0000;
          letter-spacing:10px;
          text-shadow: 2px 2px 0 rgba(0,0,0,0.25);
          text-transform:uppercase;
          line-height:1;
        ">REWARD</div>
        <div style="
          font-family:'Georgia','Times New Roman',serif;
          font-size:34px;
          font-weight:bold;
          color:#1a0a00;
          letter-spacing:3px;
          margin-top:10px;
          text-transform:uppercase;
          line-height:1.2;
        ">1 FREE PHOTO SHOOT</div>
        <div style="
          font-family:'Georgia','Times New Roman',serif;
          font-size:20px;
          color:#3a2008;
          margin-top:10px;
          letter-spacing:2px;
          font-style:italic;
        ">No questions asked</div>
      </div>
      <!-- Bottom star row -->
      <div style="
        position:absolute;
        bottom:52px; left:0; right:0;
        text-align:center;
        font-size:22px;
        color:#3a2008;
        letter-spacing:8px;
      ">★ ★ ★ ★ ★ ★ ★</div>
    </div>`;
  }).join('\n');

  // Multi-poster wall view (12-14s) — 3 overlapping posters
  var wallPosters = [0, 2, 5].map(function(imgIdx, wi) {
    var wallRots = [-6, 1, 5];
    var wallX = [25, 50, 75];
    var wallY = [480, 520, 500];
    var wallScale = [0.28, 0.30, 0.28];
    return `
    <div id="wall-${wi}" style="
      position:absolute;
      left:${wallX[wi]}%; top:${wallY[wi]}px;
      transform: translate(-50%, 0) rotate(${wallRots[wi]}deg) scale(${wallScale[wi]});
      transform-origin: center top;
      width:780px; height:1080px;
      opacity:0;
      z-index:${90 + wi};
      pointer-events:none;
    ">
      <div style="
        position:absolute;inset:0;
        background: linear-gradient(135deg, #e8c98a 0%, #d4a574 30%, #c49060 60%, #b87d4a 100%);
        border-radius: 4px;
        box-shadow: 0 15px 40px rgba(0,0,0,0.5), inset 0 0 40px rgba(0,0,0,0.12);
      "></div>
      <div style="position:absolute;inset:0;background:radial-gradient(ellipse at center, transparent 40%, rgba(80,40,10,0.4) 100%);border-radius:4px;"></div>
      <div style="position:absolute;inset:18px;border:4px solid #3a2008;border-radius:2px;"></div>
      <div style="position:absolute;inset:28px;border:2px solid #3a2008;border-radius:2px;"></div>
      <div style="position:absolute;top:10px;left:10px;width:16px;height:16px;background:radial-gradient(circle at 40% 35%, #999, #333);border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.5);"></div>
      <div style="position:absolute;top:10px;right:10px;width:16px;height:16px;background:radial-gradient(circle at 40% 35%, #999, #333);border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.5);"></div>
      <div style="position:absolute;bottom:10px;left:10px;width:16px;height:16px;background:radial-gradient(circle at 40% 35%, #999, #333);border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.5);"></div>
      <div style="position:absolute;bottom:10px;right:10px;width:16px;height:16px;background:radial-gradient(circle at 40% 35%, #999, #333);border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.5);"></div>
      <div style="position:absolute;top:50px;left:0;right:0;text-align:center;font-family:'Georgia',serif;font-size:128px;font-weight:900;color:#1a0a00;letter-spacing:14px;text-shadow:3px 3px 0 rgba(0,0,0,0.3);line-height:1;text-transform:uppercase;">WANTED</div>
      <div style="position:absolute;top:185px;left:50px;right:50px;height:12px;display:flex;align-items:center;font-family:monospace;font-size:11px;color:#3a2008;letter-spacing:1px;overflow:hidden;">- - - - - - - - ✦ - - - - - - - - ✦ - - - - - - - - ✦ - - - - - - - - ✦ - - - - - - - - ✦ - - - - - - - -</div>
      <div style="position:absolute;top:272px;left:140px;right:140px;height:440px;background:#1a0a00;border:6px solid #3a2008;box-shadow:inset 0 0 30px rgba(0,0,0,0.5);overflow:hidden;">
        <img src="${imageDataMap[PHOTO_NAMES[imgIdx]]}" style="width:100%;height:100%;object-fit:cover;object-position:center 20%;filter:sepia(0.55) contrast(1.1) brightness(0.95);" />
        <div style="position:absolute;inset:0;background:radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.35) 100%);"></div>
      </div>
      <div style="position:absolute;top:810px;left:0;right:0;text-align:center;">
        <div style="font-family:'Georgia',serif;font-size:52px;font-weight:900;color:#8b0000;letter-spacing:10px;text-shadow:2px 2px 0 rgba(0,0,0,0.25);text-transform:uppercase;line-height:1;">REWARD</div>
        <div style="font-family:'Georgia',serif;font-size:34px;font-weight:bold;color:#1a0a00;letter-spacing:3px;margin-top:10px;text-transform:uppercase;line-height:1.2;">1 FREE PHOTO SHOOT</div>
      </div>
      <div style="position:absolute;bottom:52px;left:0;right:0;text-align:center;font-size:22px;color:#3a2008;letter-spacing:8px;">★ ★ ★ ★ ★ ★ ★</div>
    </div>`;
  }).join('\n');

  // How to claim your reward poster (14-18s)
  var claimPoster = `
  <div id="claim-poster" style="
    position:absolute;
    left:50%; top:50%;
    transform: translate(-50%, -50%) rotate(-1deg) scale(0);
    transform-origin: center center;
    width:820px; height:1100px;
    opacity:0;
    z-index:110;
    pointer-events:none;
  ">
    <div style="position:absolute;inset:0;background:linear-gradient(135deg,#e8c98a 0%,#d4a574 30%,#c49060 60%,#b87d4a 100%);border-radius:4px;box-shadow:0 30px 80px rgba(0,0,0,0.6),inset 0 0 60px rgba(0,0,0,0.15);"></div>
    <div style="position:absolute;inset:0;background:radial-gradient(ellipse at center, transparent 40%, rgba(80,40,10,0.45) 100%);border-radius:4px;pointer-events:none;"></div>
    <div style="position:absolute;inset:18px;border:4px solid #3a2008;border-radius:2px;"></div>
    <div style="position:absolute;inset:28px;border:2px solid #3a2008;border-radius:2px;"></div>
    <div style="position:absolute;top:10px;left:10px;width:16px;height:16px;background:radial-gradient(circle at 40% 35%, #999, #333);border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.5);"></div>
    <div style="position:absolute;top:10px;right:10px;width:16px;height:16px;background:radial-gradient(circle at 40% 35%, #999, #333);border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.5);"></div>
    <div style="position:absolute;bottom:10px;left:10px;width:16px;height:16px;background:radial-gradient(circle at 40% 35%, #999, #333);border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.5);"></div>
    <div style="position:absolute;bottom:10px;right:10px;width:16px;height:16px;background:radial-gradient(circle at 40% 35%, #999, #333);border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.5);"></div>
    <div style="position:absolute;top:36px;left:36px;color:#3a2008;font-size:18px;line-height:1;">★</div>
    <div style="position:absolute;top:36px;right:36px;color:#3a2008;font-size:18px;line-height:1;">★</div>
    <div style="position:absolute;bottom:36px;left:36px;color:#3a2008;font-size:18px;line-height:1;">★</div>
    <div style="position:absolute;bottom:36px;right:36px;color:#3a2008;font-size:18px;line-height:1;">★</div>
    <!-- Header -->
    <div style="position:absolute;top:52px;left:0;right:0;text-align:center;font-family:'Georgia',serif;font-size:62px;font-weight:900;color:#1a0a00;letter-spacing:6px;text-transform:uppercase;line-height:1;text-shadow:2px 2px 0 rgba(0,0,0,0.2);">HOW TO CLAIM</div>
    <div style="position:absolute;top:130px;left:0;right:0;text-align:center;font-family:'Georgia',serif;font-size:36px;font-weight:bold;color:#8b0000;letter-spacing:4px;text-transform:uppercase;font-style:italic;">YOUR REWARD</div>
    <div style="position:absolute;top:180px;left:50px;right:50px;height:12px;display:flex;align-items:center;font-family:monospace;font-size:11px;color:#3a2008;letter-spacing:1px;overflow:hidden;">- - - - - - - - ✦ - - - - - - - - ✦ - - - - - - - - ✦ - - - - - - - - ✦ - - - - - - - - ✦ - - - - - - - -</div>
    <!-- Step I -->
    <div id="claim-step-0" style="position:absolute;top:208px;left:60px;right:60px;opacity:0;transform:scale(0.85);transform-origin:center center;">
      <div style="background:rgba(0,0,0,0.08);border:3px solid #3a2008;border-radius:4px;padding:24px 28px;text-align:center;">
        <div style="font-family:'Georgia',serif;font-size:28px;font-weight:900;color:#8b0000;letter-spacing:4px;text-transform:uppercase;margin-bottom:8px;">STEP I</div>
        <div style="font-family:'Georgia',serif;font-size:30px;font-weight:bold;color:#1a0a00;letter-spacing:1px;line-height:1.3;">Send a telegram to</div>
        <div style="font-family:'Georgia',serif;font-size:38px;font-weight:900;color:#1a0a00;letter-spacing:2px;margin-top:4px;font-style:italic;">@madebyaidan</div>
        <div style="font-family:'Georgia',serif;font-size:20px;color:#4a2a08;margin-top:6px;font-style:italic;">(that's Instagram, pardner)</div>
      </div>
    </div>
    <!-- Step II -->
    <div id="claim-step-1" style="position:absolute;top:430px;left:60px;right:60px;opacity:0;transform:scale(0.85);transform-origin:center center;">
      <div style="background:rgba(0,0,0,0.08);border:3px solid #3a2008;border-radius:4px;padding:24px 28px;text-align:center;">
        <div style="font-family:'Georgia',serif;font-size:28px;font-weight:900;color:#8b0000;letter-spacing:4px;text-transform:uppercase;margin-bottom:8px;">STEP II</div>
        <div style="font-family:'Georgia',serif;font-size:30px;font-weight:bold;color:#1a0a00;letter-spacing:1px;line-height:1.3;">Arrange a rendezvous</div>
        <div style="font-family:'Georgia',serif;font-size:20px;color:#4a2a08;margin-top:6px;font-style:italic;">Pick a time &amp; a location</div>
      </div>
    </div>
    <!-- Step III -->
    <div id="claim-step-2" style="position:absolute;top:648px;left:60px;right:60px;opacity:0;transform:scale(0.85);transform-origin:center center;">
      <div style="background:rgba(0,0,0,0.08);border:3px solid #3a2008;border-radius:4px;padding:24px 28px;text-align:center;">
        <div style="font-family:'Georgia',serif;font-size:28px;font-weight:900;color:#8b0000;letter-spacing:4px;text-transform:uppercase;margin-bottom:8px;">STEP III</div>
        <div style="font-family:'Georgia',serif;font-size:30px;font-weight:bold;color:#1a0a00;letter-spacing:1px;line-height:1.3;">Arrive.</div>
        <div style="font-family:'Georgia',serif;font-size:24px;color:#4a2a08;margin-top:6px;font-style:italic;">The photographer does the rest.</div>
      </div>
    </div>
    <div style="position:absolute;top:870px;left:50px;right:50px;height:12px;display:flex;align-items:center;font-family:monospace;font-size:11px;color:#3a2008;letter-spacing:1px;overflow:hidden;">- - - - - - - - ✦ - - - - - - - - ✦ - - - - - - - - ✦ - - - - - - - - ✦ - - - - - - - - ✦ - - - - - - - -</div>
    <div style="position:absolute;bottom:52px;left:0;right:0;text-align:center;font-size:22px;color:#3a2008;letter-spacing:8px;">★ ★ ★ ★ ★ ★ ★</div>
  </div>`;

  // Final big reward poster (18-22s)
  var finalPoster = `
  <div id="final-poster" style="
    position:absolute;
    left:50%; top:50%;
    transform: translate(-50%, -50%) rotate(1.2deg) scale(0);
    transform-origin: center center;
    width:860px; height:1140px;
    opacity:0;
    z-index:120;
    pointer-events:none;
  ">
    <div style="position:absolute;inset:0;background:linear-gradient(135deg,#f0d49a 0%,#dbb080 25%,#c89060 55%,#a06030 100%);border-radius:4px;box-shadow:0 40px 100px rgba(0,0,0,0.7),0 10px 30px rgba(0,0,0,0.4),inset 0 0 80px rgba(0,0,0,0.2);"></div>
    <div style="position:absolute;inset:0;background:radial-gradient(ellipse at center, transparent 35%, rgba(80,40,10,0.55) 100%);border-radius:4px;pointer-events:none;"></div>
    <div style="position:absolute;inset:14px;border:5px solid #2a1000;border-radius:2px;"></div>
    <div style="position:absolute;inset:26px;border:2px solid #2a1000;border-radius:2px;"></div>
    <div style="position:absolute;inset:34px;border:1px solid rgba(58,32,8,0.5);border-radius:2px;"></div>
    <div style="position:absolute;top:8px;left:8px;width:20px;height:20px;background:radial-gradient(circle at 38% 32%, #bbb, #222);border-radius:50%;box-shadow:0 3px 6px rgba(0,0,0,0.6);"></div>
    <div style="position:absolute;top:8px;right:8px;width:20px;height:20px;background:radial-gradient(circle at 38% 32%, #bbb, #222);border-radius:50%;box-shadow:0 3px 6px rgba(0,0,0,0.6);"></div>
    <div style="position:absolute;bottom:8px;left:8px;width:20px;height:20px;background:radial-gradient(circle at 38% 32%, #bbb, #222);border-radius:50%;box-shadow:0 3px 6px rgba(0,0,0,0.6);"></div>
    <div style="position:absolute;bottom:8px;right:8px;width:20px;height:20px;background:radial-gradient(circle at 38% 32%, #bbb, #222);border-radius:50%;box-shadow:0 3px 6px rgba(0,0,0,0.6);"></div>
    <div style="position:absolute;top:40px;left:40px;color:#2a1000;font-size:22px;line-height:1;">★</div>
    <div style="position:absolute;top:40px;right:40px;color:#2a1000;font-size:22px;line-height:1;">★</div>
    <div style="position:absolute;bottom:40px;left:40px;color:#2a1000;font-size:22px;line-height:1;">★</div>
    <div style="position:absolute;bottom:40px;right:40px;color:#2a1000;font-size:22px;line-height:1;">★</div>
    <!-- REWARD headline -->
    <div style="position:absolute;top:55px;left:0;right:0;text-align:center;font-family:'Georgia','Times New Roman',serif;font-size:148px;font-weight:900;color:#8b0000;letter-spacing:10px;text-shadow:4px 4px 0 rgba(0,0,0,0.35),-2px -2px 0 rgba(255,200,150,0.15);line-height:1;text-transform:uppercase;">REWARD</div>
    <!-- Divider -->
    <div style="position:absolute;top:220px;left:50px;right:50px;height:14px;display:flex;align-items:center;font-family:monospace;font-size:12px;color:#2a1000;letter-spacing:1px;overflow:hidden;">═══════════════════════ ✦ ═══════════════════════</div>
    <!-- FREE PHOTO SHOOT -->
    <div style="position:absolute;top:242px;left:0;right:0;text-align:center;font-family:'Georgia',serif;font-size:68px;font-weight:900;color:#1a0a00;letter-spacing:5px;text-transform:uppercase;line-height:1.1;text-shadow:2px 2px 0 rgba(0,0,0,0.2);">FREE<br>PHOTO SHOOT</div>
    <!-- Divider -->
    <div style="position:absolute;top:432px;left:50px;right:50px;height:14px;display:flex;align-items:center;font-family:monospace;font-size:12px;color:#2a1000;letter-spacing:1px;overflow:hidden;">═══════════════════════ ✦ ═══════════════════════</div>
    <!-- Handle -->
    <div style="position:absolute;top:460px;left:0;right:0;text-align:center;font-family:'Georgia',serif;font-size:54px;font-weight:900;color:#1a0a00;letter-spacing:3px;font-style:italic;text-shadow:2px 2px 0 rgba(0,0,0,0.2);">@madebyaidan</div>
    <!-- Details grid -->
    <div style="position:absolute;top:548px;left:70px;right:70px;">
      <div style="display:flex;flex-direction:column;gap:14px;">
        <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid rgba(58,32,8,0.35);padding-bottom:12px;">
          <span style="font-family:'Georgia',serif;font-size:22px;font-weight:bold;color:#2a1000;letter-spacing:2px;text-transform:uppercase;">INQUIRE AT:</span>
          <span style="font-family:'Georgia',serif;font-size:24px;color:#8b0000;font-weight:bold;letter-spacing:1px;">Instagram</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid rgba(58,32,8,0.35);padding-bottom:12px;">
          <span style="font-family:'Georgia',serif;font-size:22px;font-weight:bold;color:#2a1000;letter-spacing:2px;text-transform:uppercase;">THIS OFFER IS:</span>
          <span style="font-family:'Georgia',serif;font-size:24px;color:#8b0000;font-weight:bold;letter-spacing:1px;">100% FREE</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid rgba(58,32,8,0.35);padding-bottom:12px;">
          <span style="font-family:'Georgia',serif;font-size:22px;font-weight:bold;color:#2a1000;letter-spacing:2px;text-transform:uppercase;">LOCATION:</span>
          <span style="font-family:'Georgia',serif;font-size:24px;color:#8b0000;font-weight:bold;letter-spacing:1px;">Manila</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-family:'Georgia',serif;font-size:22px;font-weight:bold;color:#2a1000;letter-spacing:2px;text-transform:uppercase;">SLOTS:</span>
          <span style="font-family:'Georgia',serif;font-size:24px;color:#8b0000;font-weight:bold;letter-spacing:1px;">LIMITED</span>
        </div>
      </div>
    </div>
    <!-- Star divider -->
    <div style="position:absolute;top:790px;left:50px;right:50px;height:14px;display:flex;align-items:center;font-family:monospace;font-size:12px;color:#2a1000;letter-spacing:1px;overflow:hidden;">═══════════════════════ ✦ ═══════════════════════</div>
    <!-- Stars -->
    <div style="position:absolute;top:812px;left:0;right:0;text-align:center;font-size:30px;color:#8b0000;letter-spacing:12px;">★ ★ ★ ★ ★</div>
    <!-- Photographer seal -->
    <div style="position:absolute;bottom:65px;left:0;right:0;text-align:center;">
      <div style="display:inline-block;border:3px solid #2a1000;border-radius:50%;width:120px;height:120px;display:inline-flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(0,0,0,0.08);">
        <div style="font-family:'Georgia',serif;font-size:11px;color:#2a1000;letter-spacing:1px;text-transform:uppercase;font-weight:bold;">OFFICIAL</div>
        <div style="font-family:'Georgia',serif;font-size:15px;color:#8b0000;font-weight:900;letter-spacing:1px;">SEAL</div>
        <div style="font-size:26px;">📷</div>
      </div>
    </div>
  </div>`;

  // Extra end-scene posters layering on (22-24s)
  var endPosters = [1, 3, 6].map(function(imgIdx, ei) {
    var endRots = [4, -3, 6];
    var endX = [20, 80, 50];
    var endY = [300, 320, 650];
    var endScale = [0.22, 0.22, 0.24];
    return `
    <div id="end-${ei}" style="
      position:absolute;
      left:${endX[ei]}%; top:${endY[ei]}px;
      transform: translate(-50%, 0) rotate(${endRots[ei]}deg) scale(${endScale[ei]});
      transform-origin: center top;
      width:780px; height:1080px;
      opacity:0;
      z-index:${130 + ei};
      pointer-events:none;
    ">
      <div style="position:absolute;inset:0;background:linear-gradient(135deg,#e8c98a 0%,#d4a574 30%,#c49060 60%,#b87d4a 100%);border-radius:4px;box-shadow:0 15px 40px rgba(0,0,0,0.5),inset 0 0 40px rgba(0,0,0,0.12);"></div>
      <div style="position:absolute;inset:0;background:radial-gradient(ellipse at center,transparent 40%,rgba(80,40,10,0.4) 100%);border-radius:4px;"></div>
      <div style="position:absolute;inset:18px;border:4px solid #3a2008;border-radius:2px;"></div>
      <div style="position:absolute;inset:28px;border:2px solid #3a2008;border-radius:2px;"></div>
      <div style="position:absolute;top:10px;left:10px;width:16px;height:16px;background:radial-gradient(circle at 40% 35%,#999,#333);border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.5);"></div>
      <div style="position:absolute;top:10px;right:10px;width:16px;height:16px;background:radial-gradient(circle at 40% 35%,#999,#333);border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.5);"></div>
      <div style="position:absolute;bottom:10px;left:10px;width:16px;height:16px;background:radial-gradient(circle at 40% 35%,#999,#333);border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.5);"></div>
      <div style="position:absolute;bottom:10px;right:10px;width:16px;height:16px;background:radial-gradient(circle at 40% 35%,#999,#333);border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.5);"></div>
      <div style="position:absolute;top:50px;left:0;right:0;text-align:center;font-family:'Georgia',serif;font-size:128px;font-weight:900;color:#1a0a00;letter-spacing:14px;text-shadow:3px 3px 0 rgba(0,0,0,0.3);line-height:1;text-transform:uppercase;">WANTED</div>
      <div style="position:absolute;top:272px;left:140px;right:140px;height:440px;background:#1a0a00;border:6px solid #3a2008;box-shadow:inset 0 0 30px rgba(0,0,0,0.5);overflow:hidden;">
        <img src="${imageDataMap[PHOTO_NAMES[imgIdx]]}" style="width:100%;height:100%;object-fit:cover;object-position:center 20%;filter:sepia(0.55) contrast(1.1) brightness(0.95);" />
        <div style="position:absolute;inset:0;background:radial-gradient(ellipse at center,transparent 50%,rgba(0,0,0,0.35) 100%);"></div>
      </div>
      <div style="position:absolute;top:810px;left:0;right:0;text-align:center;">
        <div style="font-family:'Georgia',serif;font-size:52px;font-weight:900;color:#8b0000;letter-spacing:10px;text-shadow:2px 2px 0 rgba(0,0,0,0.25);text-transform:uppercase;line-height:1;">REWARD</div>
        <div style="font-family:'Georgia',serif;font-size:34px;font-weight:bold;color:#1a0a00;letter-spacing:3px;margin-top:10px;text-transform:uppercase;line-height:1.2;">1 FREE PHOTO SHOOT</div>
      </div>
      <div style="position:absolute;bottom:52px;left:0;right:0;text-align:center;font-size:22px;color:#3a2008;letter-spacing:8px;">★ ★ ★ ★ ★ ★ ★</div>
    </div>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { margin: 0; padding: 0; overflow: hidden; }

  /* Wooden wall background */
  #root {
    width: ${W}px;
    height: ${H}px;
    position: relative;
    overflow: hidden;
    background-color: #6b4423;
    background-image:
      repeating-linear-gradient(
        91deg,
        transparent,
        transparent 1px,
        rgba(0,0,0,0.06) 1px,
        rgba(0,0,0,0.06) 2px
      ),
      repeating-linear-gradient(
        179deg,
        transparent,
        transparent 6px,
        rgba(255,255,255,0.025) 6px,
        rgba(255,255,255,0.025) 12px
      ),
      repeating-linear-gradient(
        0.5deg,
        rgba(90,50,20,0.5) 0px,
        rgba(115,70,30,0.4) 18px,
        rgba(85,48,18,0.5) 36px,
        rgba(110,65,28,0.45) 54px,
        rgba(100,60,24,0.5) 72px,
        rgba(120,72,32,0.4) 90px,
        rgba(88,52,20,0.5) 108px
      );
  }

  /* Wood vignette */
  #wood-vignette {
    position:absolute;inset:0;z-index:5;pointer-events:none;
    background: radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.5) 100%);
  }

  /* Impact shake animation for poster slams */
  @keyframes shake {
    0%   { transform: translate(0,0) rotate(0); }
    15%  { transform: translate(-4px, 2px) rotate(-0.3deg); }
    30%  { transform: translate(3px, -2px) rotate(0.2deg); }
    45%  { transform: translate(-2px, 1px) rotate(-0.1deg); }
    60%  { transform: translate(2px, -1px) rotate(0.15deg); }
    75%  { transform: translate(-1px, 0) rotate(-0.05deg); }
    100% { transform: translate(0,0) rotate(0); }
  }

  .shaking {
    animation: shake 0.35s ease-out;
  }
</style>
</head>
<body>
<div id="root">

  <!-- Wooden wall vignette -->
  <div id="wood-vignette"></div>

  <!-- Slam poster elements (0-12s) — 8 photo posters -->
  ${posterElements}

  <!-- Wall view (12-14s) — 3 overlapping small posters -->
  ${wallPosters}

  <!-- Claim instructions poster (14-18s) -->
  ${claimPoster}

  <!-- Final big reward poster (18-22s) -->
  ${finalPoster}

  <!-- End-scene extra posters (22-24s) -->
  ${endPosters}

</div>

<script>
var FPS = ${FPS};
var W = ${W};
var H = ${H};

// ─── helpers ───────────────────────────────────────────────────────
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function lerp(a, b, t) { return a + (b - a) * clamp(t, 0, 1); }
function easeInOut(t) { t = clamp(t,0,1); return t < 0.5 ? 2*t*t : -1+(4-2*t)*t; }
function easeOut(t) { t = clamp(t,0,1); return 1 - Math.pow(1 - t, 3); }
function easeIn(t) { return Math.pow(clamp(t,0,1), 2); }
function easeOutBounce(t) {
  t = clamp(t,0,1);
  var n1 = 7.5625, d1 = 2.75;
  if (t < 1/d1) return n1*t*t;
  else if (t < 2/d1) return n1*(t-=1.5/d1)*t + 0.75;
  else if (t < 2.5/d1) return n1*(t-=2.25/d1)*t + 0.9375;
  else return n1*(t-=2.625/d1)*t + 0.984375;
}
// Overshoot bounce (cubic-bezier approximation)
function easeOutBack(t) {
  t = clamp(t,0,1);
  var c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}
function progress(t, start, end) {
  return clamp((t - start) / (end - start), 0, 1);
}

// ─── poster timing ─────────────────────────────────────────────────
// Phase 1 (0-2s): First slam during intro
// Phase 2 (2-12s): 8 posters cycle ~1.1s each
// Each poster: SLAM (0.4s bounce) → HOLD (0.7s) → FLY OFF (0.2s)

var PHOTO_COUNT = ${n};
var SLAM_DUR = 0.45;    // time to slam in
var HOLD_DUR = 0.65;    // hold duration
var FLY_DUR  = 0.25;    // fly off duration
var CYCLE    = SLAM_DUR + HOLD_DUR + FLY_DUR; // ~1.35s per poster
var POSTER_ROTS = [${POSTER_ROTS.join(',')}];

// First poster slams at t=0.4s (after brief wall shot)
var slamTimes = [];
for (var i = 0; i < PHOTO_COUNT; i++) {
  slamTimes[i] = 0.4 + i * CYCLE;
}
// t at which last poster finishes slamming
var lastPosterFlyOff = slamTimes[PHOTO_COUNT-1] + SLAM_DUR + HOLD_DUR;
// should be ~0.4 + 7*1.35 + 1.1 ≈ 10.95s. That's fine within 12s.

// ─── wall phase timing (12-14s) ───────────────────────────────────
var WALL_IN  = 11.8;
var WALL_OUT = 14.0;

// ─── claim poster timing (14-18s) ─────────────────────────────────
var CLAIM_IN  = 14.0;
var CLAIM_OUT = 17.8;
var STEP_TIMES = [14.4, 15.4, 16.3];  // each step stamps in

// ─── final poster timing (18-22s) ─────────────────────────────────
var FINAL_IN  = 18.0;
var FINAL_OUT = 22.0;

// ─── end-scene (22-24s) ───────────────────────────────────────────
var END_TIMES = [22.0, 22.4, 22.8];

// ─── MAIN APPLY FUNCTION ──────────────────────────────────────────
window.__applyUpTo = function(t) {

  // ── PHOTO POSTERS (slam sequence) ─────────────────────────────
  for (var i = 0; i < PHOTO_COUNT; i++) {
    var el = document.getElementById('poster-' + i);
    if (!el) continue;

    var slamT = slamTimes[i];
    var flyOffT = slamT + SLAM_DUR + HOLD_DUR;

    // Before slam: hidden
    if (t < slamT) {
      el.style.opacity = '0';
      el.style.transform = 'translate(-50%, -50%) rotate(' + POSTER_ROTS[i] + 'deg) scale(0)';
      continue;
    }

    // SLAM phase
    if (t < slamT + SLAM_DUR) {
      var sp = progress(t, slamT, slamT + SLAM_DUR);
      var scaleV = easeOutBack(sp);
      // Start from off-screen top with rotation, land in place
      var startRot = POSTER_ROTS[i] - 5;
      var rot = lerp(startRot, POSTER_ROTS[i], easeOut(sp));
      var yOff = lerp(-H * 0.6, 0, easeOut(sp));
      el.style.opacity = '1';
      el.style.transform =
        'translate(-50%, calc(-50% + ' + yOff + 'px)) rotate(' + rot + 'deg) scale(' + scaleV + ')';
      continue;
    }

    // HOLD phase
    if (t < flyOffT) {
      el.style.opacity = '1';
      el.style.transform = 'translate(-50%, -50%) rotate(' + POSTER_ROTS[i] + 'deg) scale(1)';
      continue;
    }

    // FLY OFF phase (for all but last poster which stays until wall phase)
    if (i < PHOTO_COUNT - 1) {
      var fp = progress(t, flyOffT, flyOffT + FLY_DUR);
      if (fp >= 1) {
        el.style.opacity = '0';
        continue;
      }
      var flyX = lerp(0, [-400,350,-320,380,-360,340,-380,320][i], easeIn(fp));
      var flyY = lerp(0, [500,450,480,520,460,510,490,470][i], easeIn(fp));
      var flyRot = lerp(POSTER_ROTS[i], POSTER_ROTS[i] + [-15,18,-12,16,-14,13,-17,11][i], easeIn(fp));
      var flyScale = lerp(1, 0.4, fp);
      el.style.opacity = String(1 - fp * 0.8);
      el.style.transform =
        'translate(calc(-50% + ' + flyX + 'px), calc(-50% + ' + flyY + 'px)) rotate(' + flyRot + 'deg) scale(' + flyScale + ')';
    } else {
      // Last poster stays until wall phase comes in, then it fades
      var fadeP = progress(t, lastPosterFlyOff, lastPosterFlyOff + 0.6);
      if (t < lastPosterFlyOff) {
        el.style.opacity = '1';
        el.style.transform = 'translate(-50%, -50%) rotate(' + POSTER_ROTS[i] + 'deg) scale(1)';
      } else {
        el.style.opacity = String(1 - easeIn(fadeP));
        el.style.transform = 'translate(-50%, -50%) rotate(' + POSTER_ROTS[i] + 'deg) scale(1)';
      }
    }
  }

  // ── WALL VIEW POSTERS ─────────────────────────────────────────
  for (var wi = 0; wi < 3; wi++) {
    var wel = document.getElementById('wall-' + wi);
    if (!wel) continue;
    var wallDelay = wi * 0.22;
    var wIn  = WALL_IN  + wallDelay;
    var wOut = WALL_OUT;
    var wInP  = easeOutBack(progress(t, wIn,  wIn + 0.55));
    var wOutP = easeIn(progress(t, wOut - 0.3, wOut));
    var wScale = [0.28, 0.30, 0.28][wi];
    var scaleNow = lerp(0, wScale, wInP) * lerp(1, 0, wOutP);
    wel.style.opacity = String(clamp(wInP, 0, 1) * (1 - wOutP));
    wel.style.transform = 'translate(-50%, 0) rotate(' + [-6,1,5][wi] + 'deg) scale(' + scaleNow + ')';
  }

  // ── CLAIM POSTER ──────────────────────────────────────────────
  var claimEl = document.getElementById('claim-poster');
  if (claimEl) {
    var cInP  = easeOutBack(progress(t, CLAIM_IN,  CLAIM_IN + 0.55));
    var cOutP = easeIn(progress(t, CLAIM_OUT, CLAIM_OUT + 0.3));
    var cScale = lerp(0, 1, cInP) * lerp(1, 0, cOutP);
    claimEl.style.opacity = String(clamp(cInP, 0, 1) * (1 - cOutP));
    claimEl.style.transform = 'translate(-50%, -50%) rotate(-1deg) scale(' + cScale + ')';

    // Step stamps
    for (var si = 0; si < 3; si++) {
      var stepEl = document.getElementById('claim-step-' + si);
      if (!stepEl) continue;
      var stP = easeOutBack(progress(t, STEP_TIMES[si], STEP_TIMES[si] + 0.4));
      var stScale = lerp(0, 1, stP);
      stepEl.style.opacity = String(clamp(stP, 0, 1));
      stepEl.style.transform = 'scale(' + stScale + ')';
    }
  }

  // ── FINAL POSTER ──────────────────────────────────────────────
  var finalEl = document.getElementById('final-poster');
  if (finalEl) {
    var fInP  = easeOutBack(progress(t, FINAL_IN,  FINAL_IN + 0.6));
    var fOutP = easeIn(progress(t, FINAL_OUT - 0.2, FINAL_OUT));
    var fScale = lerp(0, 1, fInP) * lerp(1, 0.95, fOutP);
    finalEl.style.opacity = String(clamp(fInP, 0, 1) * lerp(1, 0.9, fOutP));
    finalEl.style.transform = 'translate(-50%, -50%) rotate(1.2deg) scale(' + fScale + ')';
  }

  // ── END SCENE EXTRA POSTERS ───────────────────────────────────
  for (var ei = 0; ei < 3; ei++) {
    var eel = document.getElementById('end-' + ei);
    if (!eel) continue;
    var eStartT = END_TIMES[ei];
    var eInP = easeOutBack(progress(t, eStartT, eStartT + 0.45));
    var eScales = [0.22, 0.22, 0.24];
    var eScaleNow = lerp(0, eScales[ei], eInP);
    eel.style.opacity = String(clamp(eInP * 2, 0, 1));
    eel.style.transform = 'translate(-50%, 0) rotate(' + [4,-3,6][ei] + 'deg) scale(' + eScaleNow + ')';
  }
};

// Freeze CSS transitions when capturing frames
if (location.search.includes('capture=1')) {
  var s = document.createElement('style');
  s.textContent = '*, *::before, *::after { transition-duration: 0s !important; animation-duration: 0.001s !important; animation-delay: 0s !important; }';
  document.head.appendChild(s);
}
</script>
</body>
</html>`;
}

async function main() {
  console.log('=== WANTED POSTER Reel v68a ===');
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
  await page.waitForTimeout(800);

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

  var outputMp4 = path.join(OUT_DIR, 'manila-wanted-v68a.mp4');
  execSync(
    'ffmpeg -y -framerate ' + FPS + ' -i "' + path.join(framesDir, 'frame_%05d.png') + '" ' +
    '-c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r ' + FPS + ' -an "' + outputMp4 + '"',
    { stdio: 'inherit' }
  );

  rmSync(framesDir, { recursive: true, force: true });

  var reelsDir = path.join(__dirname, 'reels');
  if (!existsSync(reelsDir)) mkdirSync(reelsDir, { recursive: true });
  execSync('cp "' + outputMp4 + '" "' + path.join(reelsDir, 'manila-wanted-v68a.mp4') + '"');

  var sz = statSync(outputMp4);
  console.log('Final: ' + (sz.size / (1024 * 1024)).toFixed(1) + ' MB');
  console.log('Copied to reels/manila-wanted-v68a.mp4');
  console.log('=== Done ===');
}

main().catch(function(err) {
  console.error(err);
  process.exit(1);
});
