import { chromium } from 'playwright';
import { execSync } from 'child_process';
import { mkdirSync, rmSync, existsSync, readFileSync, writeFileSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

var __dirname = path.dirname(fileURLToPath(import.meta.url));
var OUT_DIR = path.join(__dirname, 'output-70a');

var W = 1080;
var H = 1920;
var FPS = 30;
var TOTAL_FRAMES = 720; // 24s at 30fps
var TOTAL_DURATION = 24;

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

  // Station layout: vertical positions along the map
  // Main line stations 0-7 (STATION 01 through STATION 08)
  // Branch line stations for CTA (14-18s segment)
  // Line goes vertically from top (~200px) to bottom (~1600px)
  // Stations spaced ~170px apart

  var LINE_COLOR = '#E53935';
  var LINE_COLOR_BRANCH = '#1E88E5';
  var BG_COLOR = '#f8f8f8';

  // Station x-coordinates: main line snakes down-left-right for visual interest
  // x values oscillate slightly: 380, 420, 360, 440, 370, 430, 380, 410
  // y values: evenly distributed from 280 to 1500
  var stationData = [
    { x: 380, y: 310,  name: 'STATION 01', label: 'START HERE',     side: 'right' },
    { x: 420, y: 480,  name: 'STATION 02', label: 'FRAME 2',        side: 'left'  },
    { x: 355, y: 650,  name: 'STATION 03', label: 'FRAME 3',        side: 'right' },
    { x: 440, y: 820,  name: 'STATION 04', label: 'FRAME 4',        side: 'left'  },
    { x: 370, y: 990,  name: 'STATION 05', label: 'FRAME 5',        side: 'right' },
    { x: 430, y: 1160, name: 'STATION 06', label: 'FRAME 6',        side: 'left'  },
    { x: 360, y: 1330, name: 'STATION 07', label: 'FRAME 7',        side: 'right' },
    { x: 410, y: 1500, name: 'STATION 08', label: 'TERMINUS',       side: 'left'  },
  ];

  // Branch line stations (CTA) — branch off from STATION 08 going right
  var branchData = [
    { x: 620, y: 1430, name: 'DM @MADEBYAIDAN',  label: 'TRANSFER',   side: 'right' },
    { x: 750, y: 1560, name: 'PICK YOUR DATE',    label: 'BOOK NOW',   side: 'right' },
    { x: 870, y: 1680, name: 'SHOW UP',           label: 'FREE RIDE',  side: 'right' },
  ];

  // Build SVG path string for main line
  function buildMainPath() {
    var d = 'M ' + stationData[0].x + ' ' + stationData[0].y;
    for (var i = 1; i < stationData.length; i++) {
      var prev = stationData[i - 1];
      var cur = stationData[i];
      // Slight curve via quadratic bezier — control point midway with slight x offset
      var cpx = (prev.x + cur.x) / 2 + (i % 2 === 0 ? -30 : 30);
      var cpy = (prev.y + cur.y) / 2;
      d += ' Q ' + cpx + ' ' + cpy + ' ' + cur.x + ' ' + cur.y;
    }
    return d;
  }

  // Build SVG path for branch line (from STATION 08 through branch stations)
  function buildBranchPath() {
    var start = stationData[7];
    var d = 'M ' + start.x + ' ' + start.y;
    for (var i = 0; i < branchData.length; i++) {
      var cur = branchData[i];
      var prev = i === 0 ? start : branchData[i - 1];
      var cpx = (prev.x + cur.x) / 2;
      var cpy = (prev.y + cur.y) / 2 - 20;
      d += ' Q ' + cpx + ' ' + cpy + ' ' + cur.x + ' ' + cur.y;
    }
    return d;
  }

  var mainPath = buildMainPath();
  var branchPath = buildBranchPath();

  // Photo card positions: 340px wide cards positioned to the side of each station
  // side: 'right' → card left edge = stationX + 60; 'left' → card right edge = stationX - 60
  function cardLeft(st) {
    if (st.side === 'right') return st.x + 55;
    else return st.x - 55 - 320; // card is 320px wide
  }
  function cardTop(st) {
    return st.y - 110; // card is 220px tall, center it on station
  }

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { margin: 0; padding: 0; background: ${BG_COLOR}; overflow: hidden; }

  #root {
    width: ${W}px;
    height: ${H}px;
    position: relative;
    overflow: hidden;
    background: ${BG_COLOR};
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  }

  /* Grid lines background for transit map feel */
  #grid-bg {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px);
    background-size: 80px 80px;
    pointer-events: none;
    z-index: 0;
    opacity: 0;
  }

  /* Header */
  #header {
    position: absolute;
    top: 0; left: 0;
    width: ${W}px;
    height: 130px;
    background: ${LINE_COLOR};
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 48px;
    opacity: 0;
  }
  #header-title {
    font-size: 36px;
    font-weight: 900;
    color: #fff;
    letter-spacing: 6px;
    text-transform: uppercase;
  }
  #header-badge {
    background: #fff;
    color: ${LINE_COLOR};
    font-size: 18px;
    font-weight: 700;
    letter-spacing: 3px;
    padding: 8px 18px;
    border-radius: 4px;
  }

  /* SVG transit line layer */
  #transit-svg {
    position: absolute;
    top: 0; left: 0;
    width: ${W}px;
    height: ${H}px;
    z-index: 10;
    pointer-events: none;
    opacity: 0;
  }

  /* Train indicator */
  #train {
    position: absolute;
    width: 28px;
    height: 14px;
    background: ${LINE_COLOR};
    border-radius: 3px;
    z-index: 30;
    opacity: 0;
    transform: translate(-14px, -7px);
    box-shadow: 0 2px 6px rgba(229,57,53,0.5);
  }

  /* Station dot labels */
  .station-label {
    position: absolute;
    z-index: 25;
    opacity: 0;
    pointer-events: none;
  }
  .station-name {
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: #1a1a1a;
    line-height: 1;
  }
  .station-sub {
    font-size: 11px;
    font-weight: 400;
    letter-spacing: 2px;
    color: #888;
    text-transform: uppercase;
    margin-top: 3px;
  }

  /* Photo cards */
  .photo-card {
    position: absolute;
    width: 320px;
    height: 220px;
    z-index: 20;
    opacity: 0;
    border-radius: 8px;
    overflow: hidden;
    background: #fff;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    transform-origin: left center;
    border: 3px solid #fff;
    outline: 1.5px solid rgba(0,0,0,0.08);
  }
  .photo-card img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .photo-card-label {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    background: rgba(0,0,0,0.55);
    color: #fff;
    font-size: 11px;
    letter-spacing: 2px;
    text-transform: uppercase;
    padding: 6px 10px;
    font-weight: 600;
  }

  /* Legend box */
  #legend {
    position: absolute;
    bottom: 60px;
    right: 48px;
    background: #fff;
    border: 1.5px solid #ddd;
    border-radius: 8px;
    padding: 18px 22px;
    z-index: 40;
    opacity: 0;
    min-width: 160px;
  }
  #legend-title {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: #888;
    margin-bottom: 10px;
    border-bottom: 1px solid #eee;
    padding-bottom: 8px;
  }
  .legend-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 8px;
    font-size: 12px;
    font-weight: 500;
    color: #333;
    letter-spacing: 1px;
  }
  .legend-dot {
    width: 14px; height: 14px;
    border-radius: 50%;
    border: 3px solid ${LINE_COLOR};
    background: #fff;
    flex-shrink: 0;
  }
  .legend-line {
    width: 24px; height: 5px;
    background: ${LINE_COLOR};
    border-radius: 3px;
    flex-shrink: 0;
  }
  .legend-dot-blue {
    width: 14px; height: 14px;
    border-radius: 50%;
    border: 3px solid ${LINE_COLOR_BRANCH};
    background: #fff;
    flex-shrink: 0;
  }
  .legend-line-blue {
    width: 24px; height: 5px;
    background: ${LINE_COLOR_BRANCH};
    border-radius: 3px;
    flex-shrink: 0;
  }

  /* CTA Board (18-22s) */
  #cta-board {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    z-index: 60;
    width: 860px;
    opacity: 0;
    pointer-events: none;
  }
  #cta-board-inner {
    background: #1a1a2e;
    border-radius: 16px;
    padding: 64px 60px 56px;
    text-align: center;
    border: 3px solid #E53935;
    box-shadow: 0 8px 60px rgba(0,0,0,0.35);
    position: relative;
  }
  #cta-interchange {
    width: 80px; height: 80px;
    border-radius: 50%;
    border: 6px solid #E53935;
    background: #1a1a2e;
    margin: 0 auto 28px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  #cta-interchange::before {
    content: '+';
    font-size: 46px;
    font-weight: 300;
    color: #E53935;
    line-height: 1;
  }
  #cta-station-name {
    font-size: 62px;
    font-weight: 900;
    color: #fff;
    letter-spacing: 2px;
    line-height: 1;
    margin-bottom: 10px;
  }
  #cta-transfer {
    font-size: 15px;
    letter-spacing: 5px;
    color: #888;
    text-transform: uppercase;
    margin-bottom: 36px;
  }
  .cta-info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid rgba(255,255,255,0.12);
    padding: 14px 0;
    font-size: 16px;
    letter-spacing: 2px;
    color: rgba(255,255,255,0.7);
  }
  .cta-info-label {
    text-transform: uppercase;
    font-weight: 600;
    color: #888;
    font-size: 12px;
  }
  .cta-info-value {
    color: #fff;
    font-weight: 700;
  }
  .cta-info-value.highlight {
    color: #E53935;
  }

  /* Branch station label style */
  .branch-label {
    position: absolute;
    z-index: 25;
    opacity: 0;
    pointer-events: none;
  }
  .branch-name {
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #1a1a1a;
    line-height: 1;
    white-space: nowrap;
  }
  .branch-sub {
    font-size: 11px;
    font-weight: 400;
    letter-spacing: 2px;
    color: #1E88E5;
    text-transform: uppercase;
    margin-top: 3px;
  }

  /* "Transfer" badge on branch */
  #transfer-badge {
    position: absolute;
    z-index: 35;
    opacity: 0;
    pointer-events: none;
    background: ${LINE_COLOR_BRANCH};
    color: #fff;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 3px;
    text-transform: uppercase;
    padding: 8px 16px;
    border-radius: 20px;
  }

  /* End-of-line flash */
  #end-flash {
    position: absolute;
    inset: 0;
    background: #fff;
    z-index: 100;
    pointer-events: none;
    opacity: 0;
  }

  /* Zoom container for whole-map reveal */
  #map-zoom {
    position: absolute;
    top: 0; left: 0;
    width: ${W}px;
    height: ${H}px;
    transform-origin: center center;
    z-index: 5;
  }
</style>
</head>
<body>
<div id="root">

  <!-- Grid background -->
  <div id="grid-bg"></div>

  <!-- Zoom container wraps the map elements -->
  <div id="map-zoom">

    <!-- SVG transit lines -->
    <svg id="transit-svg" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="line-glow">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      <!-- Main line (drawn via stroke-dashoffset animation) -->
      <path id="main-line-path"
        d="${mainPath}"
        fill="none"
        stroke="${LINE_COLOR}"
        stroke-width="8"
        stroke-linecap="round"
        stroke-linejoin="round"
        filter="url(#line-glow)"
        stroke-dasharray="10000"
        stroke-dashoffset="10000"
      />

      <!-- Branch line -->
      <path id="branch-line-path"
        d="${branchPath}"
        fill="none"
        stroke="${LINE_COLOR_BRANCH}"
        stroke-width="6"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-dasharray="2000"
        stroke-dashoffset="2000"
      />

      <!-- Main station dots (rendered as SVG circles) -->
      ${stationData.map(function(st, i) {
        return `<circle id="sdot-${i}" cx="${st.x}" cy="${st.y}" r="10"
          fill="#fff" stroke="${LINE_COLOR}" stroke-width="4"
          opacity="0"/>`;
      }).join('\n      ')}

      <!-- Branch station dots -->
      ${branchData.map(function(st, i) {
        return `<circle id="bdot-${i}" cx="${st.x}" cy="${st.y}" r="9"
          fill="#fff" stroke="${LINE_COLOR_BRANCH}" stroke-width="3.5"
          opacity="0"/>`;
      }).join('\n      ')}

      <!-- Train indicator (SVG rect that we'll move via JS) -->
      <rect id="train-rect" x="366" y="303" width="28" height="14" rx="3"
        fill="${LINE_COLOR}" opacity="0"
        filter="url(#line-glow)"/>
    </svg>

    <!-- Station labels (positioned in HTML for easy text rendering) -->
    ${stationData.map(function(st, i) {
      var left, textAlign;
      if (st.side === 'right') {
        left = st.x + 22;
        textAlign = 'left';
      } else {
        // label to the left of dot: we position from right side
        left = st.x - 22 - 160; // 160px wide label area
        textAlign = 'right';
      }
      return `<div id="slabel-${i}" class="station-label" style="left:${left}px;top:${st.y - 20}px;width:160px;text-align:${textAlign};">
        <div class="station-name">${st.name}</div>
        <div class="station-sub">${st.label}</div>
      </div>`;
    }).join('\n    ')}

    <!-- Branch station labels -->
    ${branchData.map(function(st, i) {
      var left = st.x + 18;
      return `<div id="blabel-${i}" class="branch-label" style="left:${left}px;top:${st.y - 18}px;">
        <div class="branch-name">${st.name}</div>
        <div class="branch-sub">${i === 0 ? 'TRANSFER' : (i === 1 ? 'BOOK' : 'FREE')}</div>
      </div>`;
    }).join('\n    ')}

    <!-- Photo cards -->
    ${stationData.map(function(st, i) {
      var cl = st.side === 'right' ? (st.x + 55) : (st.x - 55 - 320);
      var ct = st.y - 110;
      return `<div id="pcard-${i}" class="photo-card" style="left:${cl}px;top:${ct}px;">
        <img id="pcard-img-${i}" src="" alt="Station ${i + 1}"/>
        <div class="photo-card-label">STATION ${String(i + 1).padStart(2, '0')} · MANILA</div>
      </div>`;
    }).join('\n    ')}

    <!-- Transfer badge -->
    <div id="transfer-badge" style="left:${stationData[7].x + 60}px; top:${stationData[7].y - 15}px;">
      TRANSFER LINE →
    </div>

  </div><!-- end map-zoom -->

  <!-- Header (outside zoom so it stays fixed) -->
  <div id="header">
    <div id="header-title">MANILA LINE</div>
    <div id="header-badge">LINE A</div>
  </div>

  <!-- Legend -->
  <div id="legend">
    <div id="legend-title">MAP KEY</div>
    <div class="legend-row"><div class="legend-dot"></div> Station</div>
    <div class="legend-row"><div class="legend-line"></div> Main Line</div>
    <div class="legend-row"><div class="legend-dot-blue"></div> Transfer</div>
    <div class="legend-row"><div class="legend-line-blue"></div> Branch Line</div>
  </div>

  <!-- CTA Board -->
  <div id="cta-board">
    <div id="cta-board-inner">
      <div id="cta-interchange"></div>
      <div id="cta-station-name">@madebyaidan</div>
      <div id="cta-transfer">Transfer to: Instagram</div>
      <div class="cta-info-row">
        <span class="cta-info-label">Fare</span>
        <span class="cta-info-value highlight">FREE</span>
      </div>
      <div class="cta-info-row">
        <span class="cta-info-label">Service</span>
        <span class="cta-info-value">Limited spots this month</span>
      </div>
      <div class="cta-info-row">
        <span class="cta-info-label">Platform</span>
        <span class="cta-info-value">DM on Instagram</span>
      </div>
      <div class="cta-info-row">
        <span class="cta-info-label">Status</span>
        <span class="cta-info-value highlight">NOW BOARDING</span>
      </div>
    </div>
  </div>

  <!-- End flash -->
  <div id="end-flash"></div>

</div>

<script>
  var W = ${W};
  var H = ${H};
  var PHOTO_COUNT = ${photoCount};
  var IMG_DATA = ${imgDataJSON};
  var LINE_COLOR = '${LINE_COLOR}';
  var LINE_COLOR_BRANCH = '${LINE_COLOR_BRANCH}';

  var stationData = ${JSON.stringify(stationData)};
  var branchData = ${JSON.stringify(branchData)};

  // Inject image sources
  for (var i = 0; i < PHOTO_COUNT; i++) {
    var img = document.getElementById('pcard-img-' + i);
    if (img) img.src = IMG_DATA[i];
  }

  // ---- Easing ----
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function easeIn(t) { return Math.pow(t, 3); }
  function easeInOut(t) { return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2; }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function lerp(a, b, t) { return a + (b - a) * clamp(t, 0, 1); }
  function prog(t, start, end) { return clamp((t - start) / (end - start), 0, 1); }
  function easeOutQuad(t) { return 1 - (1-t)*(1-t); }

  // ---- Station timing ----
  // 0–2s: map appears, header, first station dot
  // 2–12s: 8 stations, ~1.25s each
  // 12–14s: zoom out to full map
  // 14–18s: branch line
  // 18–22s: CTA board
  // 22–24s: hold / pulse

  var STATION_START = 2.0;
  var STATION_STRIDE = 1.25; // seconds per station

  function stationTimes(i) {
    var arrive = STATION_START + i * STATION_STRIDE;
    var cardIn = arrive + 0.15;
    var cardOut = arrive + STATION_STRIDE - 0.2;
    return { arrive: arrive, cardIn: cardIn, cardOut: cardOut };
  }

  // ---- Line drawing ----
  // Main line total length ~1800px (estimated). We animate dashoffset from 10000→0 over 0.5–12s
  // But we reveal it incrementally, station by station.
  // We map time → dashoffset for the main line.
  function mainLineDashOffset(t) {
    // Full line draws from t=0.5 to t=12.0
    if (t < 0.5) return 10000;
    if (t >= 12.0) return 0;
    var p = prog(t, 0.5, 12.0);
    return lerp(10000, 0, easeOut(p));
  }

  function branchLineDashOffset(t) {
    // Branch line draws from t=14.0 to t=17.5
    if (t < 14.0) return 2000;
    if (t >= 17.5) return 0;
    var p = prog(t, 14.0, 17.5);
    return lerp(2000, 0, easeOut(p));
  }

  // ---- Train position ----
  // Interpolates between station positions along timeline
  function trainPosition(t) {
    // Before first station: stays at station 0 (hidden)
    if (t < 1.8) return { x: stationData[0].x, y: stationData[0].y };

    // During main stations: interpolate
    for (var i = 0; i < stationData.length - 1; i++) {
      var arriveThis = STATION_START + i * STATION_STRIDE;
      var arriveNext = STATION_START + (i + 1) * STATION_STRIDE;
      if (t >= arriveThis && t < arriveNext) {
        var p = prog(t, arriveThis + 0.3, arriveNext);
        var ep = easeInOut(p);
        return {
          x: lerp(stationData[i].x, stationData[i+1].x, ep),
          y: lerp(stationData[i].y, stationData[i+1].y, ep)
        };
      }
    }

    // Hold at last main station
    var lastSt = stationData[stationData.length - 1];
    if (t < 14.0) return { x: lastSt.x, y: lastSt.y };

    // Move along branch
    if (t >= 14.0 && t < 17.5) {
      var allBranch = [lastSt].concat(branchData);
      for (var j = 0; j < allBranch.length - 1; j++) {
        var bt0 = 14.0 + j * 1.15;
        var bt1 = 14.0 + (j + 1) * 1.15;
        if (t >= bt0 && t < bt1) {
          var bp = prog(t, bt0 + 0.2, bt1);
          var bep = easeInOut(bp);
          return {
            x: lerp(allBranch[j].x, allBranch[j+1].x, bep),
            y: lerp(allBranch[j].y, allBranch[j+1].y, bep)
          };
        }
      }
      return { x: branchData[branchData.length - 1].x, y: branchData[branchData.length - 1].y };
    }

    return { x: lastSt.x, y: lastSt.y };
  }

  // ---- Zoom out at 12-14s ----
  function mapZoomScale(t) {
    // Before 12s: scale 1
    // 12–14s: zoom from 1 to ~0.75 (show whole map)
    // After 14s: hold 0.75 until 18s
    // 18s: zoom back to 1 for CTA (but CTA board covers anyway)
    if (t < 12.0) return 1.0;
    if (t < 14.0) return lerp(1.0, 0.75, easeInOut(prog(t, 12.0, 14.0)));
    if (t < 18.0) return 0.75;
    if (t < 18.5) return lerp(0.75, 1.0, easeOut(prog(t, 18.0, 18.5)));
    return 1.0;
  }

  // ---- Main render ----
  window.__applyUpTo = function(t) {

    // ---- Grid background ----
    var gridBg = document.getElementById('grid-bg');
    gridBg.style.opacity = String(easeOut(prog(t, 0.2, 1.0)));

    // ---- Header ----
    var header = document.getElementById('header');
    if (t < 0.3) {
      header.style.opacity = '0';
    } else if (t < 1.0) {
      header.style.opacity = String(easeOut(prog(t, 0.3, 1.0)));
    } else {
      header.style.opacity = '1';
    }

    // ---- Transit SVG opacity ----
    var svgEl = document.getElementById('transit-svg');
    svgEl.style.opacity = String(easeOut(prog(t, 0.5, 1.2)));

    // ---- Main line draw ----
    var mainPath2 = document.getElementById('main-line-path');
    mainPath2.setAttribute('stroke-dashoffset', String(mainLineDashOffset(t)));

    // ---- Branch line draw ----
    var branchPath2 = document.getElementById('branch-line-path');
    branchPath2.setAttribute('stroke-dashoffset', String(branchLineDashOffset(t)));

    // ---- Station dots ----
    for (var i = 0; i < stationData.length; i++) {
      var dot = document.getElementById('sdot-' + i);
      if (!dot) continue;
      var st = stationData[i];
      var times = stationTimes(i);

      if (t < times.arrive - 0.2) {
        dot.setAttribute('opacity', '0');
      } else if (t < times.arrive + 0.3) {
        var p = prog(t, times.arrive - 0.2, times.arrive + 0.3);
        dot.setAttribute('opacity', String(easeOut(p)));
        // Scale pop effect via r
        var r = lerp(4, 10, easeOut(p));
        dot.setAttribute('r', String(r));
      } else {
        dot.setAttribute('opacity', '1');
        dot.setAttribute('r', '10');
        // Fill solid after train passes
        if (t > times.arrive + 0.5) {
          dot.setAttribute('fill', LINE_COLOR);
          dot.setAttribute('stroke', '#fff');
        } else {
          dot.setAttribute('fill', '#fff');
          dot.setAttribute('stroke', LINE_COLOR);
        }
      }
    }

    // ---- Station labels ----
    for (var il = 0; il < stationData.length; il++) {
      var lbl = document.getElementById('slabel-' + il);
      if (!lbl) continue;
      var lt = stationTimes(il);
      if (t < lt.arrive) {
        lbl.style.opacity = '0';
        lbl.style.transform = 'translateX(0px)';
      } else if (t < lt.arrive + 0.5) {
        var lp = easeOut(prog(t, lt.arrive, lt.arrive + 0.5));
        lbl.style.opacity = String(lp);
        var dx = stationData[il].side === 'right' ? lerp(-8, 0, lp) : lerp(8, 0, lp);
        lbl.style.transform = 'translateX(' + dx + 'px)';
      } else {
        lbl.style.opacity = '1';
        lbl.style.transform = 'translateX(0px)';
      }
    }

    // ---- Photo cards ----
    for (var ic = 0; ic < stationData.length; ic++) {
      var card = document.getElementById('pcard-' + ic);
      if (!card) continue;
      var ct2 = stationTimes(ic);

      if (t < ct2.cardIn) {
        card.style.opacity = '0';
        card.style.transform = 'scaleX(0.05)';
      } else if (t < ct2.cardIn + 0.35) {
        var cp = easeOut(prog(t, ct2.cardIn, ct2.cardIn + 0.35));
        card.style.opacity = String(cp);
        card.style.transform = 'scaleX(' + lerp(0.05, 1, cp) + ')';
      } else if (t < ct2.cardOut) {
        card.style.opacity = '1';
        card.style.transform = 'scaleX(1)';
      } else if (t < ct2.cardOut + 0.3) {
        var cp2 = easeIn(prog(t, ct2.cardOut, ct2.cardOut + 0.3));
        card.style.opacity = String(1 - cp2);
        card.style.transform = 'scaleX(' + lerp(1, 0.05, cp2) + ')';
      } else {
        card.style.opacity = '0';
        card.style.transform = 'scaleX(0.05)';
      }
    }

    // ---- Train indicator ----
    var trainRect = document.getElementById('train-rect');
    var trainVisible = (t >= 1.8 && t < 18.0);
    trainRect.setAttribute('opacity', trainVisible ? '1' : '0');
    if (trainVisible) {
      var tp = trainPosition(t);
      trainRect.setAttribute('x', String(tp.x - 14));
      trainRect.setAttribute('y', String(tp.y - 7));
      // Pulse effect: brightness/size at stations
      var nearStation = false;
      for (var ins = 0; ins < stationData.length; ins++) {
        var ts = stationTimes(ins);
        if (Math.abs(t - ts.arrive) < 0.25) { nearStation = true; break; }
      }
      if (nearStation) {
        var pulse = 0.5 + 0.5 * Math.sin((t * 20));
        var sw = 28 + pulse * 6;
        var sh = 14 + pulse * 3;
        trainRect.setAttribute('width', String(sw));
        trainRect.setAttribute('height', String(sh));
        trainRect.setAttribute('x', String(tp.x - sw / 2));
        trainRect.setAttribute('y', String(tp.y - sh / 2));
      } else {
        trainRect.setAttribute('width', '28');
        trainRect.setAttribute('height', '14');
        trainRect.setAttribute('x', String(tp.x - 14));
        trainRect.setAttribute('y', String(tp.y - 7));
      }
    }

    // ---- Map zoom ----
    var mapZoom = document.getElementById('map-zoom');
    var sc = mapZoomScale(t);
    mapZoom.style.transform = 'scale(' + sc + ')';

    // ---- Legend ----
    var legend = document.getElementById('legend');
    if (t < 1.5) {
      legend.style.opacity = '0';
    } else if (t < 2.5) {
      legend.style.opacity = String(easeOut(prog(t, 1.5, 2.5)));
    } else if (t < 17.5) {
      legend.style.opacity = '1';
    } else {
      legend.style.opacity = String(1 - easeIn(prog(t, 17.5, 18.5)));
    }

    // ---- Transfer badge ----
    var tbadge = document.getElementById('transfer-badge');
    if (t >= 14.0 && t < 18.0) {
      tbadge.style.opacity = String(easeOut(prog(t, 14.0, 14.8)));
    } else {
      tbadge.style.opacity = '0';
    }

    // ---- Branch dots ----
    for (var ib = 0; ib < branchData.length; ib++) {
      var bdot = document.getElementById('bdot-' + ib);
      if (!bdot) continue;
      var bt2 = 14.5 + ib * 1.15;
      if (t < bt2) {
        bdot.setAttribute('opacity', '0');
      } else if (t < bt2 + 0.4) {
        bdot.setAttribute('opacity', String(easeOut(prog(t, bt2, bt2 + 0.4))));
      } else {
        bdot.setAttribute('opacity', '1');
        bdot.setAttribute('fill', LINE_COLOR_BRANCH);
        bdot.setAttribute('stroke', '#fff');
      }
    }

    // ---- Branch labels ----
    for (var ibl = 0; ibl < branchData.length; ibl++) {
      var blbl = document.getElementById('blabel-' + ibl);
      if (!blbl) continue;
      var blt = 14.6 + ibl * 1.15;
      if (t < blt) {
        blbl.style.opacity = '0';
      } else if (t < blt + 0.5) {
        blbl.style.opacity = String(easeOut(prog(t, blt, blt + 0.5)));
      } else {
        blbl.style.opacity = t < 18.0 ? '1' : String(1 - easeIn(prog(t, 18.0, 18.5)));
      }
    }

    // ---- Hide map elements during CTA ----
    var mapOpacity = 1;
    if (t >= 17.8 && t < 18.5) {
      mapOpacity = 1 - easeIn(prog(t, 17.8, 18.5));
    } else if (t >= 18.5 && t < 22.0) {
      mapOpacity = 0;
    } else if (t >= 22.0 && t < 22.5) {
      mapOpacity = easeOut(prog(t, 22.0, 22.5));
    }
    // Apply to svg and labels but NOT header
    svgEl.style.opacity = String(mapOpacity * easeOut(prog(t, 0.5, 1.2)));
    for (var imz = 0; imz < stationData.length; imz++) {
      var slbl = document.getElementById('slabel-' + imz);
      if (slbl && t >= 17.8) {
        slbl.style.opacity = String(parseFloat(slbl.style.opacity || '1') * mapOpacity);
      }
    }

    // ---- CTA Board ----
    var ctaBoard = document.getElementById('cta-board');
    if (t < 18.5) {
      ctaBoard.style.opacity = '0';
    } else if (t < 19.5) {
      ctaBoard.style.opacity = String(easeOut(prog(t, 18.5, 19.5)));
    } else if (t < 22.0) {
      ctaBoard.style.opacity = '1';
    } else if (t < 23.0) {
      ctaBoard.style.opacity = String(1 - easeIn(prog(t, 22.0, 23.0)));
    } else {
      ctaBoard.style.opacity = '0';
    }

    // ---- End flash (22-24s) ----
    var endFlash = document.getElementById('end-flash');
    if (t >= 23.0 && t < 23.3) {
      endFlash.style.opacity = String(easeOut(prog(t, 23.0, 23.3)));
    } else if (t >= 23.3 && t < 24.0) {
      endFlash.style.opacity = String(1 - easeOut(prog(t, 23.3, 23.8)));
    } else {
      endFlash.style.opacity = '0';
    }

    // ---- Train pulse at final station (22-24s) ----
    if (t >= 22.0) {
      trainRect.setAttribute('opacity', '1');
      var finalSt = stationData[stationData.length - 1];
      var pulseSz = 0.5 + 0.5 * Math.sin(t * 8);
      var pw = 28 + pulseSz * 10;
      var ph = 14 + pulseSz * 5;
      trainRect.setAttribute('x', String(finalSt.x - pw / 2));
      trainRect.setAttribute('y', String(finalSt.y - ph / 2));
      trainRect.setAttribute('width', String(pw));
      trainRect.setAttribute('height', String(ph));
    }

  };

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
  console.log('=== Manila Subway/Transit Map Reel v70a ===');
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
    if (frame % (FPS * 4) === 0) {
      console.log('  ' + t.toFixed(1) + 's / ' + TOTAL_DURATION + 's');
    }
  }

  await browser.close();
  console.log('All frames captured');

  var outputMp4 = path.join(OUT_DIR, 'manila-subway-v70a.mp4');
  execSync(
    'ffmpeg -y -framerate ' + FPS + ' -i "' + path.join(framesDir, 'frame_%05d.png') + '" ' +
    '-c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r ' + FPS + ' -an "' + outputMp4 + '"',
    { stdio: 'inherit' }
  );

  rmSync(framesDir, { recursive: true, force: true });

  var reelsDir = path.join(__dirname, 'reels');
  if (!existsSync(reelsDir)) mkdirSync(reelsDir, { recursive: true });
  execSync('cp "' + outputMp4 + '" "' + path.join(reelsDir, 'manila-subway-v70a.mp4') + '"');

  var sz = statSync(outputMp4);
  console.log('Final: ' + (sz.size / (1024 * 1024)).toFixed(1) + ' MB');
  console.log('Copied to reels/manila-subway-v70a.mp4');
  console.log('=== Done ===');
}

main().catch(function(err) {
  console.error(err);
  process.exit(1);
});
