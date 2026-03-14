import { chromium } from 'playwright';
import { execSync } from 'child_process';
import { mkdirSync, rmSync, existsSync, readFileSync, writeFileSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

var __dirname = path.dirname(fileURLToPath(import.meta.url));
var OUT_DIR = path.join(__dirname, 'output-61a');

var W = 1080;
var H = 1920;
var FPS = 30;
var TOTAL_FRAMES = 720; // 24s at 30fps
var TOTAL_DURATION = 24;

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

// Deterministic scatter positions for each polaroid in the pile
var PILE_TOPS  = [1480,1510,1540,1490,1520,1500,1555,1530];
var PILE_LEFTS = [52,38,60,44,55,40,62,47];
var PILE_ROTS  = [3.2,-4.1,1.7,-2.9,4.5,-1.3,3.0,-3.7];
var PILE_SCALE = 0.52;
// Legacy alias used in HTML building
var PILE_POSITIONS = PILE_LEFTS.map(function(x, i) {
  return { x: x, y: PILE_TOPS[i], rot: PILE_ROTS[i], scale: PILE_SCALE };
});

// Random rotations for center-screen presentation
var CENTER_ROTS = [-2.1, 3.4, -4.7, 1.8, -3.2, 4.1, -1.5, 2.9];

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

  // Build polaroid elements for center-screen (one per photo)
  var centerPolaroids = PHOTO_NAMES.map(function(name, i) {
    return `
    <div id="cpol-${i}" style="
      position:absolute;
      left:50%; top:50%;
      transform: translate(-50%, -60%) rotate(${CENTER_ROTS[i]}deg) scale(0.9);
      width:520px; height:640px;
      background:#fff;
      border-radius:4px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.35), 0 4px 12px rgba(0,0,0,0.2);
      padding: 20px 20px 80px 20px;
      opacity:0;
      z-index:60;
      pointer-events:none;
    ">
      <div style="position:relative;width:100%;height:100%;overflow:hidden;background:#fff;">
        <img src="${imageDataMap[name]}" style="
          position:absolute;inset:0;width:100%;height:100%;
          object-fit:cover;
          filter: brightness(4) contrast(0.3) saturate(0);
          transition: none;
        " id="cimg-${i}" />
        <!-- White developing overlay -->
        <div id="cdev-${i}" style="
          position:absolute;inset:0;
          background:rgba(255,255,255,1);
          pointer-events:none;
        "></div>
      </div>
      <!-- Bottom strip handwriting text -->
      <div id="ctext-${i}" style="
        position:absolute;
        bottom:0; left:0; right:0; height:80px;
        display:flex; align-items:center; justify-content:center;
        font-family: 'Georgia', serif;
        font-style: italic;
        font-size: 22px;
        color: #555;
        letter-spacing: 0.5px;
        opacity:0;
      ">Shot on film ♡</div>
    </div>`;
  }).join('\n');

  // Build pile polaroids (smaller, scattered at bottom)
  var pilePolaroids = PHOTO_NAMES.map(function(name, i) {
    var pp = PILE_POSITIONS[i];
    return `
    <div id="ppol-${i}" style="
      position:absolute;
      left:${pp.x}%; top:${pp.y}px;
      transform: translate(-50%, 0) rotate(${pp.rot}deg) scale(${pp.scale});
      transform-origin: center center;
      width:520px; height:640px;
      background:#fff;
      border-radius:4px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.3);
      padding: 20px 20px 80px 20px;
      opacity:0;
      z-index: ${20 + i};
      pointer-events:none;
    ">
      <div style="width:100%;height:100%;overflow:hidden;background:#eee;">
        <img src="${imageDataMap[name]}" style="
          width:100%;height:100%;object-fit:cover;
        " />
      </div>
    </div>`;
  }).join('\n');

  // "How it works" info polaroids (no photo — white card with text)
  var howItWorksCards = [
    { id: 'how0', text: '<span style="font-size:38px;">1.</span><br><span style="font-size:30px;">DM me</span><br><span style="font-size:20px;color:#888;">@madebyaidan</span>', rot: -3 },
    { id: 'how1', text: '<span style="font-size:38px;">2.</span><br><span style="font-size:28px;">We pick a date</span><br><span style="font-size:19px;color:#888;">location + vibe, together</span>', rot: 1 },
    { id: 'how2', text: '<span style="font-size:38px;">3.</span><br><span style="font-size:27px;">Show up</span><br><span style="font-size:20px;color:#888;">I guide you ✦</span>', rot: -1.5 },
  ].map(function(c, i) {
    return `
    <div id="${c.id}" style="
      position:absolute;
      left:${[18, 40, 62][i]}%; top:50%;
      transform: translate(-50%, -55%) rotate(${c.rot}deg) scale(0);
      transform-origin: center bottom;
      width:280px; height:360px;
      background:#fff;
      border-radius:4px;
      box-shadow: 0 16px 40px rgba(0,0,0,0.28);
      padding: 16px 16px 60px 16px;
      opacity:0;
      z-index:70;
      pointer-events:none;
      display:flex; flex-direction:column;
    ">
      <div style="flex:1;display:flex;align-items:center;justify-content:center;background:#f8f3ec;"></div>
      <div style="
        position:absolute;bottom:0;left:0;right:0;height:60px;
        display:flex;align-items:center;justify-content:center;
        font-family:'Georgia',serif;font-style:italic;
        text-align:center;line-height:1.3;padding:4px 8px;
        color:#333;
      ">${c.text}</div>
    </div>`;
  }).join('\n');

  // Rain polaroids (22-24s)
  var rainPolaroids = Array.from({length: 10}, function(_, i) {
    var rainImg = PHOTO_NAMES[i % n];
    var rainRot = [-4.2, 3.1, -1.8, 4.5, -3.0, 2.2, -4.8, 1.4, -2.6, 3.9][i];
    var rainLeft = [8, 20, 35, 48, 62, 74, 85, 14, 54, 70][i];
    return `
    <div id="rain${i}" style="
      position:absolute;
      left:${rainLeft}%; top:-300px;
      transform: translate(-50%, 0) rotate(${rainRot}deg);
      transform-origin: center center;
      width:260px; height:320px;
      background:#fff;
      border-radius:4px;
      box-shadow: 0 8px 20px rgba(0,0,0,0.25);
      padding:14px 14px 50px 14px;
      opacity:0;
      z-index:80;
      pointer-events:none;
    ">
      <div style="width:100%;height:100%;overflow:hidden;">
        <img src="${imageDataMap[rainImg]}" style="width:100%;height:100%;object-fit:cover;" />
      </div>
    </div>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { margin: 0; padding: 0; overflow: hidden; }

  @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap');

  /* Wood grain background */
  #root {
    width: ${W}px;
    height: ${H}px;
    position: relative;
    overflow: hidden;
    background-color: #c8a96e;
    background-image:
      repeating-linear-gradient(
        92deg,
        transparent,
        transparent 2px,
        rgba(0,0,0,0.04) 2px,
        rgba(0,0,0,0.04) 4px
      ),
      repeating-linear-gradient(
        178deg,
        transparent,
        transparent 8px,
        rgba(255,255,255,0.03) 8px,
        rgba(255,255,255,0.03) 16px
      ),
      repeating-linear-gradient(
        1deg,
        rgba(180,130,70,0.4) 0px,
        rgba(200,155,90,0.3) 20px,
        rgba(165,120,60,0.4) 40px,
        rgba(195,148,82,0.35) 60px,
        rgba(185,138,72,0.4) 80px
      );
  }

  /* Vignette on wood */
  #vignette {
    position:absolute;inset:0;z-index:200;pointer-events:none;
    background: radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.22) 100%);
  }

  /* Camera flash */
  #flash {
    position:absolute;inset:0;z-index:500;pointer-events:none;
    background:white;
    opacity:0;
  }

  /* Title layer */
  #title-layer {
    position:absolute;
    top:0;left:0;right:0;bottom:0;
    z-index:30;
    display:flex;flex-direction:column;
    align-items:center;justify-content:center;
    pointer-events:none;
    opacity:0;
  }

  /* CTA polaroid */
  #cta-pol {
    position:absolute;
    left:50%; top:50%;
    transform: translate(-50%, -52%) scale(0);
    transform-origin: center center;
    width:720px; height:820px;
    background:#fff;
    border-radius:6px;
    box-shadow: 0 30px 80px rgba(0,0,0,0.4);
    padding: 30px 30px 100px 30px;
    opacity:0;
    z-index:65;
    pointer-events:none;
  }

  #cta-inner {
    width:100%;height:100%;
    background: #f8f3ec;
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    gap:18px;
  }
</style>
</head>
<body>
<div id="root">

  <!-- Wood vignette -->
  <div id="vignette"></div>

  <!-- Camera flash overlay -->
  <div id="flash"></div>

  <!-- Title layer (0-1.5s) -->
  <div id="title-layer">
    <div style="font-size:72px;margin-bottom:10px;">📷</div>
    <div id="title-text" style="
      font-family: 'Dancing Script', 'Georgia', cursive;
      font-size: 56px;
      font-weight: 700;
      color: #2a1a08;
      text-align:center;
      line-height:1.2;
      text-shadow: 1px 2px 4px rgba(255,255,255,0.3);
      max-width:800px;
      padding:0 40px;
      opacity:0;
    ">MANILA FREE PHOTO SHOOT</div>
    <div id="title-sub" style="
      margin-top:16px;
      font-family:'Georgia',serif;font-style:italic;
      font-size:28px;color:#5a3a18;opacity:0;
    ">by @madebyaidan</div>
  </div>

  <!-- Center-screen developing polaroids -->
  ${centerPolaroids}

  <!-- Pile polaroids (bottom of screen) -->
  ${pilePolaroids}

  <!-- "How it works" cards -->
  ${howItWorksCards}

  <!-- CTA big polaroid -->
  <div id="cta-pol">
    <div id="cta-inner">
      <div style="font-size:72px;">📷</div>
      <div style="
        font-family:'Dancing Script','Georgia',cursive;
        font-size:64px;font-weight:700;color:#2a1a08;
        text-align:center;line-height:1.1;
      ">@madebyaidan</div>
      <div style="
        font-family:'Georgia',serif;font-style:italic;
        font-size:30px;color:#666;text-align:center;
      ">DM me on Instagram</div>
      <div style="
        margin-top:8px;
        background:#c8a96e;
        border-radius:40px;
        padding:18px 48px;
        font-family:'Georgia',serif;font-style:italic;
        font-size:32px;font-weight:bold;color:#fff;
        letter-spacing:0.5px;
      ">It's free ♡</div>
    </div>
  </div>

  <!-- Rain polaroids (22-24s) -->
  ${rainPolaroids}

</div>

<script>
var FPS = ${FPS};
var flash = document.getElementById('flash');
var titleLayer = document.getElementById('title-layer');
var titleText = document.getElementById('title-text');
var titleSub = document.getElementById('title-sub');
var ctaPol = document.getElementById('cta-pol');

// ─── helpers ───────────────────────────────────────────────────────

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function lerp(a, b, t) { return a + (b - a) * clamp(t, 0, 1); }
// ease in-out cubic
function easeInOut(t) { return t < 0.5 ? 2*t*t : -1+(4-2*t)*t; }
function easeOut(t) { return 1 - Math.pow(1 - clamp(t, 0, 1), 3); }
function easeIn(t) { return Math.pow(clamp(t, 0, 1), 2); }

function progress(t, start, end) {
  return clamp((t - start) / (end - start), 0, 1);
}

// ─── per-photo timing ─────────────────────────────────────────────
// Photo i: enter flash at flashT[i], develop from devStart[i] to devEnd[i], toss at tossT[i]
var PHOTO_COUNT = ${n};

// Photo 0: flash at 1.5s, develop 2.0-3.2s, toss at 3.5s
// Photos 1-7: each cycle = 1.5s (flash + develop + toss)
var CYCLE = 1.45; // seconds per photo after the first
var FIRST_FLASH = 1.5;
var flashTimes   = [];
var devStartTimes = [];
var devEndTimes   = [];
var tossTimes     = [];

for (var pi = 0; pi < PHOTO_COUNT; pi++) {
  var base = FIRST_FLASH + pi * CYCLE;
  flashTimes[pi]    = base;
  devStartTimes[pi] = base + 0.35;
  devEndTimes[pi]   = base + 1.45;
  tossTimes[pi]     = base + 1.55;
}
// Last toss ends at ~13.3s → matches spec ~13s

// ─── pile fan-out timing ──────────────────────────────────────────
var FAN_START = 13.3;
var FAN_END   = 14.0;

// ─── How it works cards ───────────────────────────────────────────
var HOW_START = [14.1, 15.0, 15.9];
var HOW_END   = [14.9, 15.8, 16.7];

// ─── CTA ──────────────────────────────────────────────────────────
var CTA_START = 18.0;
var CTA_END   = 19.2;

// ─── Rain ─────────────────────────────────────────────────────────
var RAIN_COUNT = 10;
var RAIN_START_BASE = 22.0;
// Each rain polaroid falls at slightly staggered times
var rainStartTimes = [22.0,22.1,22.25,22.4,22.55,22.7,22.85,23.0,23.15,23.3];
var rainEndTimes   = rainStartTimes.map(function(t) { return t + 1.2; });
// Landing y positions (where they end up)
var rainLandY = [1300,1400,1250,1450,1350,1300,1420,1360,1200,1480];
var rainLefts = [8, 20, 35, 48, 62, 74, 85, 14, 54, 70];

// ─── PILE BASE POSITIONS (top px of pile polaroid) ────────────────
var PILE_TOPS  = [1480,1510,1540,1490,1520,1500,1555,1530];
var PILE_LEFTS = [52,38,60,44,55,40,62,47];
var PILE_ROTS  = [3.2,-4.1,1.7,-2.9,4.5,-1.3,3.0,-3.7];
var PILE_SCALE = 0.52;

// Fan-out offsets (extra displacement during fan phase)
var FAN_OFFSETS_X = [60,-70,80,-50,55,-65,75,-45];
var FAN_OFFSETS_Y = [20,-10,30,-5,15,-20,25,-15];
var FAN_ROTS_EXTRA = [4,-5,3,-4,5,-3,4,-5];

// ─── MAIN APPLY FUNCTION ──────────────────────────────────────────
window.__applyUpTo = function(t) {

  // ── TITLE (0 – 1.5s) ──────────────────────────────────────────
  var titleP = progress(t, 0, 0.8);
  var titleFade = easeOut(titleP);
  titleLayer.style.opacity = t < 1.5 ? String(titleFade) : '0';
  titleText.style.opacity = t >= 0.15 ? '1' : '0';
  titleSub.style.opacity  = t >= 0.6  ? '1' : '0';

  // ── FLASH ─────────────────────────────────────────────────────
  var flashOpacity = 0;
  for (var pi = 0; pi < PHOTO_COUNT; pi++) {
    var ft = flashTimes[pi];
    var fp = progress(t, ft, ft + 0.25);
    // Flash: fast burst → bright → fade
    var fv = fp < 0.3
      ? easeIn(fp / 0.3)                          // rise
      : easeOut(1 - (fp - 0.3) / 0.7);            // fall
    if (fv > flashOpacity) flashOpacity = fv;
  }
  flash.style.opacity = String(flashOpacity);

  // ── CENTER POLAROIDS ──────────────────────────────────────────
  for (var pi = 0; pi < PHOTO_COUNT; pi++) {
    var cpol  = document.getElementById('cpol-' + pi);
    var cimg  = document.getElementById('cimg-' + pi);
    var cdev  = document.getElementById('cdev-' + pi);
    var ctxt  = document.getElementById('ctext-' + pi);
    if (!cpol) continue;

    var ds = devStartTimes[pi];
    var de = devEndTimes[pi];
    var tt = tossTimes[pi];
    var ft = flashTimes[pi];

    // Visibility window: from flash+0.1 until toss+0.4
    var visible = t >= ft + 0.08 && t < tt + 0.4;

    if (!visible) {
      cpol.style.opacity = '0';
      continue;
    }
    cpol.style.opacity = '1';

    // ENTRY: slide from top (fast)
    var entryP = progress(t, ft + 0.08, ds);
    var entryEase = easeOut(entryP);
    var entryY = lerp(-350, 0, entryEase);

    // TOSS: rotate + scale + fly to pile
    var tossP = progress(t, tt, tt + 0.4);
    var tossEase = easeInOut(tossP);

    // Toss destination (pile position converted to center-relative offset)
    var pileCenterX = (PILE_LEFTS[pi] / 100) * ${W} - ${W} / 2;
    var pileCenterY = PILE_TOPS[pi] - ${H} / 2;

    var posX = lerp(0, pileCenterX, tossEase);
    var posY = lerp(entryY, pileCenterY, tossEase);
    var scaleVal = lerp(0.9, PILE_SCALE, tossEase);
    var rotVal = lerp(${CENTER_ROTS[0]}, PILE_ROTS[0], tossEase);
    // Use correct per-photo values
    var centerRots = [${CENTER_ROTS.join(',')}];
    var pileRotsFull = [${PILE_ROTS.join(',')}];
    rotVal = lerp(centerRots[pi], pileRotsFull[pi], tossEase);

    // During entry phase use entry Y
    if (tossP === 0) posY = entryY;

    cpol.style.transform =
      'translate(calc(-50% + ' + posX + 'px), calc(-60% + ' + posY + 'px)) ' +
      'rotate(' + rotVal + 'deg) scale(' + scaleVal + ')';

    // DEVELOP: white overlay fades out, image filter transitions
    var devP = easeOut(progress(t, ds, de));
    // Image filter: brightness fades from 4→1, contrast 0.3→1, saturation 0→1
    var brightness = lerp(4, 1, devP);
    var contrast   = lerp(0.3, 1, devP);
    var saturation = lerp(0, 1, devP);
    cimg.style.filter =
      'brightness(' + brightness + ') contrast(' + contrast + ') saturate(' + saturation + ')';
    // White overlay fades from 1→0 in first half of develop
    var overlayP = easeOut(progress(t, ds, ds + 0.6));
    cdev.style.opacity = String(1 - overlayP);
    // Text appears near end of develop
    ctxt.style.opacity = String(easeOut(progress(t, de - 0.3, de + 0.2)));
  }

  // ── PILE POLAROIDS ────────────────────────────────────────────
  for (var pi = 0; pi < PHOTO_COUNT; pi++) {
    var ppol = document.getElementById('ppol-' + pi);
    if (!ppol) continue;

    var tt = tossTimes[pi];
    // Show once toss is nearly complete
    var showP = progress(t, tt + 0.35, tt + 0.55);
    if (showP <= 0) {
      ppol.style.opacity = '0';
      continue;
    }

    var fanP = easeOut(progress(t, FAN_START, FAN_END));
    var dx = FAN_OFFSETS_X[pi] * fanP;
    var dy = FAN_OFFSETS_Y[pi] * fanP;
    var dr = FAN_ROTS_EXTRA[pi] * fanP;
    var baseRot = PILE_ROTS[pi] + dr;

    ppol.style.opacity = String(easeOut(showP));
    ppol.style.transform =
      'translate(calc(-50% + ' + dx + 'px), ' + dy + 'px) ' +
      'rotate(' + baseRot + 'deg) scale(' + PILE_SCALE + ')';
  }

  // ── HOW IT WORKS CARDS ────────────────────────────────────────
  var howIds = ['how0','how1','how2'];
  for (var hi = 0; hi < 3; hi++) {
    var hel = document.getElementById(howIds[hi]);
    if (!hel) continue;
    var hs = HOW_START[hi];
    var he = HOW_END[hi];
    var hp = easeOut(progress(t, hs, hs + 0.5));
    var hOut = progress(t, 17.8, 18.2);

    var scaleH = lerp(0, 1, hp) * lerp(1, 0, easeIn(hOut));
    var opH = clamp(hp, 0, 1) * (1 - easeIn(hOut));

    hel.style.opacity = String(opH);
    hel.style.transform =
      'translate(-50%, -55%) rotate(' + [-3,1,-1.5][hi] + 'deg) scale(' + scaleH + ')';
  }

  // ── CTA POLAROID ──────────────────────────────────────────────
  var ctaP = easeOut(progress(t, CTA_START, CTA_END));
  ctaPol.style.opacity = String(clamp(ctaP, 0, 1));
  ctaPol.style.transform =
    'translate(-50%, -52%) scale(' + lerp(0, 1, ctaP) + ')';

  // ── RAIN POLAROIDS ────────────────────────────────────────────
  for (var ri = 0; ri < RAIN_COUNT; ri++) {
    var rel = document.getElementById('rain' + ri);
    if (!rel) continue;
    var rs = rainStartTimes[ri];
    var re = rainEndTimes[ri];
    var rp = easeIn(progress(t, rs, re));

    if (t < rs) {
      rel.style.opacity = '0';
      rel.style.transform =
        'translate(-50%, 0) rotate(' + [-4.2, 3.1,-1.8, 4.5,-3.0, 2.2,-4.8, 1.4,-2.6, 3.9][ri] + 'deg)';
      continue;
    }
    var startY = -300;
    var endY = rainLandY[ri] - 0; // already in px from top
    var curY = lerp(startY, endY, rp);
    var rainRots = [-4.2, 3.1,-1.8, 4.5,-3.0, 2.2,-4.8, 1.4,-2.6, 3.9];
    rel.style.opacity = String(clamp(rp * 3, 0, 1));
    rel.style.transform =
      'translate(-50%, 0) rotate(' + rainRots[ri] + 'deg)';
    rel.style.top = curY + 'px';
  }
};

// Freeze animations when capturing frames
if (location.search.includes('capture=1')) {
  var s = document.createElement('style');
  s.textContent = '*, *::before, *::after { transition-duration: 0s !important; animation-duration: 0.001s !important; }';
  document.head.appendChild(s);
}
</script>
</body>
</html>`;
}

async function main() {
  console.log('=== Polaroid Developing Reel v61a ===');
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

  var outputMp4 = path.join(OUT_DIR, 'manila-polaroid-v61a.mp4');
  execSync(
    'ffmpeg -y -framerate ' + FPS + ' -i "' + path.join(framesDir, 'frame_%05d.png') + '" ' +
    '-c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r ' + FPS + ' -an "' + outputMp4 + '"',
    { stdio: 'inherit' }
  );

  rmSync(framesDir, { recursive: true, force: true });

  var reelsDir = path.join(__dirname, 'reels');
  if (!existsSync(reelsDir)) mkdirSync(reelsDir, { recursive: true });
  execSync('cp "' + outputMp4 + '" "' + path.join(reelsDir, 'manila-polaroid-v61a.mp4') + '"');

  var sz = statSync(outputMp4);
  console.log('Final: ' + (sz.size / (1024 * 1024)).toFixed(1) + ' MB');
  console.log('Copied to reels/manila-polaroid-v61a.mp4');
  console.log('=== Done ===');
}

main().catch(function(err) {
  console.error(err);
  process.exit(1);
});
