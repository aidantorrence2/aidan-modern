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
var TOTAL_DURATION = 14;
var TOTAL_FRAMES = FPS * TOTAL_DURATION; // 420 frames

var SAFE_TOP = 213;
var SAFE_BOTTOM = 430;

var FILM_SCANS_DIR = '/Volumes/PortableSSD/Exports/film scans';
var PHOTO_NAMES = [
  '000040850002.jpg',
  '000040850003.jpg',
  '000040850004.jpg',
  '000040850006.jpg',
  '000040850008.jpg',
  '000040850011.jpg',
  '000040850012.jpg',
  '000040850013.jpg',
  '000040850014.jpg',
  '000040850015.jpg',
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

  var LINE_COLOR = '#E8443A';
  var BG_COLOR = '#FFFFFF';

  // Station names for each photo
  var stationNames = [
    'Portrait Station',
    'Golden Hour Stop',
    'Street Style Terminal',
    'Natural Light Halt',
    'Film Tone Junction',
    'Candid Frame Stn',
    'Warm Glow Platform',
    'Color Story Stop',
    'Bokeh Lane Stn',
    'Free Shoot Central',
  ];

  // Station layout: vertical line down the left-center area
  // 10 stations from y=340 to y=1460, spaced ~124px apart
  // x alternates slightly for visual interest
  var stationData = [];
  for (var i = 0; i < photoCount; i++) {
    var yStart = 340;
    var yEnd = 1460;
    var y = yStart + (yEnd - yStart) * (i / (photoCount - 1));
    var x = 260 + (i % 2 === 0 ? 0 : 40);
    stationData.push({
      x: x,
      y: Math.round(y),
      name: stationNames[i],
      side: i % 2 === 0 ? 'right' : 'left',
    });
  }

  // Build SVG path for the main line through all stations
  function buildMainPath() {
    var d = 'M ' + stationData[0].x + ' ' + stationData[0].y;
    for (var si = 1; si < stationData.length; si++) {
      var prev = stationData[si - 1];
      var cur = stationData[si];
      var cpx = (prev.x + cur.x) / 2 + (si % 2 === 0 ? -20 : 20);
      var cpy = (prev.y + cur.y) / 2;
      d += ' Q ' + cpx + ' ' + cpy + ' ' + cur.x + ' ' + cur.y;
    }
    return d;
  }

  var mainPath = buildMainPath();

  // Photo card dimensions and positions
  function cardLeft(st) {
    if (st.side === 'right') return st.x + 50;
    return st.x - 50 - 380;
  }
  function cardTop(st) {
    return st.y - 55;
  }

  return '<!DOCTYPE html>\n<html>\n<head>\n<meta charset="utf-8">\n<style>\n' +
    '* { box-sizing: border-box; margin: 0; padding: 0; }\n' +
    'html, body { margin: 0; padding: 0; background: ' + BG_COLOR + '; overflow: hidden; }\n' +
    '#root {\n' +
    '  width: ' + W + 'px;\n' +
    '  height: ' + H + 'px;\n' +
    '  position: relative;\n' +
    '  overflow: hidden;\n' +
    '  background: ' + BG_COLOR + ';\n' +
    '  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;\n' +
    '}\n' +
    '#header {\n' +
    '  position: absolute;\n' +
    '  top: ' + (SAFE_TOP + 10) + 'px; left: 0;\n' +
    '  width: ' + W + 'px;\n' +
    '  height: 90px;\n' +
    '  z-index: 50;\n' +
    '  display: flex;\n' +
    '  align-items: center;\n' +
    '  padding: 0 60px;\n' +
    '  gap: 18px;\n' +
    '  opacity: 0;\n' +
    '}\n' +
    '#header-circle {\n' +
    '  width: 52px; height: 52px;\n' +
    '  border-radius: 50%;\n' +
    '  background: ' + LINE_COLOR + ';\n' +
    '  flex-shrink: 0;\n' +
    '}\n' +
    '#header-title {\n' +
    '  font-size: 38px;\n' +
    '  font-weight: 900;\n' +
    '  color: #1a1a1a;\n' +
    '  letter-spacing: 8px;\n' +
    '  text-transform: uppercase;\n' +
    '}\n' +
    '#header-line-tag {\n' +
    '  font-size: 14px;\n' +
    '  font-weight: 700;\n' +
    '  color: ' + LINE_COLOR + ';\n' +
    '  letter-spacing: 4px;\n' +
    '  text-transform: uppercase;\n' +
    '  margin-left: auto;\n' +
    '  border: 2px solid ' + LINE_COLOR + ';\n' +
    '  padding: 4px 14px;\n' +
    '  border-radius: 4px;\n' +
    '}\n' +
    '#transit-svg {\n' +
    '  position: absolute;\n' +
    '  top: 0; left: 0;\n' +
    '  width: ' + W + 'px;\n' +
    '  height: ' + H + 'px;\n' +
    '  z-index: 10;\n' +
    '  pointer-events: none;\n' +
    '  opacity: 0;\n' +
    '}\n' +
    '.station-label {\n' +
    '  position: absolute;\n' +
    '  z-index: 25;\n' +
    '  opacity: 0;\n' +
    '  pointer-events: none;\n' +
    '}\n' +
    '.station-name {\n' +
    '  font-size: 11px;\n' +
    '  font-weight: 700;\n' +
    '  letter-spacing: 2.5px;\n' +
    '  text-transform: uppercase;\n' +
    '  color: #555;\n' +
    '  line-height: 1;\n' +
    '}\n' +
    '.photo-card {\n' +
    '  position: absolute;\n' +
    '  width: 380px;\n' +
    '  height: 110px;\n' +
    '  z-index: 20;\n' +
    '  opacity: 0;\n' +
    '  border-radius: 8px;\n' +
    '  overflow: hidden;\n' +
    '  background: #fff;\n' +
    '  box-shadow: 0 4px 24px rgba(0,0,0,0.12);\n' +
    '  border: 2px solid #f0f0f0;\n' +
    '}\n' +
    '.photo-card img {\n' +
    '  width: 100%;\n' +
    '  height: 100%;\n' +
    '  object-fit: cover;\n' +
    '  display: block;\n' +
    '}\n' +
    '.photo-card-full {\n' +
    '  position: absolute;\n' +
    '  z-index: 55;\n' +
    '  opacity: 0;\n' +
    '  border-radius: 0;\n' +
    '  overflow: hidden;\n' +
    '}\n' +
    '.photo-card-full img {\n' +
    '  width: 100%;\n' +
    '  height: 100%;\n' +
    '  object-fit: cover;\n' +
    '  display: block;\n' +
    '}\n' +
    '#train-dot {\n' +
    '  position: absolute;\n' +
    '  width: 20px; height: 20px;\n' +
    '  border-radius: 50%;\n' +
    '  background: ' + LINE_COLOR + ';\n' +
    '  z-index: 30;\n' +
    '  opacity: 0;\n' +
    '  box-shadow: 0 0 12px rgba(232,68,58,0.6);\n' +
    '  transform: translate(-10px, -10px);\n' +
    '}\n' +
    '#cta-panel {\n' +
    '  position: absolute;\n' +
    '  top: 0; left: 0;\n' +
    '  width: ' + W + 'px;\n' +
    '  height: ' + H + 'px;\n' +
    '  z-index: 60;\n' +
    '  opacity: 0;\n' +
    '  background: #1a1a1a;\n' +
    '  display: flex;\n' +
    '  flex-direction: column;\n' +
    '  align-items: center;\n' +
    '  justify-content: center;\n' +
    '  gap: 28px;\n' +
    '}\n' +
    '#cta-handle {\n' +
    '  font-size: 64px;\n' +
    '  font-weight: 900;\n' +
    '  color: #fff;\n' +
    '  letter-spacing: 2px;\n' +
    '}\n' +
    '#cta-subtitle {\n' +
    '  font-size: 26px;\n' +
    '  font-weight: 500;\n' +
    '  color: #999;\n' +
    '  letter-spacing: 4px;\n' +
    '  text-transform: uppercase;\n' +
    '}\n' +
    '#cta-action {\n' +
    '  margin-top: 20px;\n' +
    '  font-size: 22px;\n' +
    '  font-weight: 700;\n' +
    '  color: #fff;\n' +
    '  letter-spacing: 3px;\n' +
    '  text-transform: uppercase;\n' +
    '  background: ' + LINE_COLOR + ';\n' +
    '  padding: 16px 44px;\n' +
    '  border-radius: 40px;\n' +
    '}\n' +
    '#cta-line-accent {\n' +
    '  width: 120px;\n' +
    '  height: 6px;\n' +
    '  background: ' + LINE_COLOR + ';\n' +
    '  border-radius: 3px;\n' +
    '}\n' +
    '</style>\n</head>\n<body>\n<div id="root">\n' +
    // Header
    '  <div id="header">\n' +
    '    <div id="header-circle"></div>\n' +
    '    <div id="header-title">Manila Line</div>\n' +
    '    <div id="header-line-tag">Line A</div>\n' +
    '  </div>\n' +
    // SVG transit line
    '  <svg id="transit-svg" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">\n' +
    '    <path id="main-line-path"\n' +
    '      d="' + mainPath + '"\n' +
    '      fill="none"\n' +
    '      stroke="' + LINE_COLOR + '"\n' +
    '      stroke-width="8"\n' +
    '      stroke-linecap="round"\n' +
    '      stroke-linejoin="round"\n' +
    '      stroke-dasharray="10000"\n' +
    '      stroke-dashoffset="10000"\n' +
    '    />\n' +
    // Station dots
    stationData.map(function(st, si) {
      return '    <circle id="sdot-' + si + '" cx="' + st.x + '" cy="' + st.y + '" r="12"\n' +
        '      fill="#fff" stroke="' + LINE_COLOR + '" stroke-width="4" opacity="0"/>';
    }).join('\n') + '\n' +
    '  </svg>\n' +
    // Station labels
    stationData.map(function(st, si) {
      var left, textAlign;
      if (st.side === 'right') {
        left = st.x + 24;
        textAlign = 'left';
      } else {
        left = st.x - 24 - 180;
        textAlign = 'right';
      }
      return '  <div id="slabel-' + si + '" class="station-label" style="left:' + left + 'px;top:' + (st.y - 8) + 'px;width:180px;text-align:' + textAlign + ';">\n' +
        '    <div class="station-name">' + st.name + '</div>\n' +
        '  </div>';
    }).join('\n') + '\n' +
    // Photo cards
    stationData.map(function(st, si) {
      var cl = cardLeft(st);
      var ct = cardTop(st);
      return '  <div id="pcard-' + si + '" class="photo-card" style="left:' + cl + 'px;top:' + ct + 'px;">\n' +
        '    <img id="pcard-img-' + si + '" src="" alt="Station ' + (si + 1) + '"/>\n' +
        '  </div>';
    }).join('\n') + '\n' +
    // Full-screen photo for final reveal
    '  <div id="full-photo" class="photo-card-full" style="left:0;top:0;width:' + W + 'px;height:' + H + 'px;">\n' +
    '    <img id="full-photo-img" src="" alt="Final"/>\n' +
    '  </div>\n' +
    // Train dot
    '  <div id="train-dot"></div>\n' +
    // CTA panel
    '  <div id="cta-panel">\n' +
    '    <div id="cta-line-accent"></div>\n' +
    '    <div id="cta-handle">@madebyaidan</div>\n' +
    '    <div id="cta-subtitle">Next stop: your free shoot</div>\n' +
    '    <div id="cta-action">DM to board</div>\n' +
    '  </div>\n' +
    '</div>\n' +
    '<script>\n' +
    'var W = ' + W + ';\n' +
    'var H = ' + H + ';\n' +
    'var PHOTO_COUNT = ' + photoCount + ';\n' +
    'var IMG_DATA = ' + imgDataJSON + ';\n' +
    'var LINE_COLOR = "' + LINE_COLOR + '";\n' +
    'var stationData = ' + JSON.stringify(stationData) + ';\n' +
    '\n' +
    '// Inject image sources\n' +
    'for (var i = 0; i < PHOTO_COUNT; i++) {\n' +
    '  var img = document.getElementById("pcard-img-" + i);\n' +
    '  if (img) img.src = IMG_DATA[i];\n' +
    '}\n' +
    'document.getElementById("full-photo-img").src = IMG_DATA[PHOTO_COUNT - 1];\n' +
    '\n' +
    'function easeOut(t) { return 1 - Math.pow(1 - t, 3); }\n' +
    'function easeIn(t) { return Math.pow(t, 3); }\n' +
    'function easeInOut(t) { return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2; }\n' +
    'function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }\n' +
    'function lerp(a, b, t) { return a + (b - a) * clamp(t, 0, 1); }\n' +
    'function prog(t, start, end) { return clamp((t - start) / (end - start), 0, 1); }\n' +
    '\n' +
    '// Timeline:\n' +
    '// 0-1.5s: header + line starts drawing\n' +
    '// 1.5-10s: 10 stations, ~0.85s each, line draws, train moves, photo cards expand\n' +
    '// 10-12s: final station photo fills screen\n' +
    '// 12-14s: CTA panel\n' +
    '\n' +
    'var STATION_START = 1.5;\n' +
    'var STATION_STRIDE = 0.85;\n' +
    '\n' +
    'function stationTime(i) {\n' +
    '  return STATION_START + i * STATION_STRIDE;\n' +
    '}\n' +
    '\n' +
    '// Line drawing: dashoffset goes from 10000 to 0 over 0.5s to 10s\n' +
    'function mainLineDashOffset(t) {\n' +
    '  if (t < 0.5) return 10000;\n' +
    '  if (t >= 10.0) return 0;\n' +
    '  var p = prog(t, 0.5, 10.0);\n' +
    '  return lerp(10000, 0, easeOut(p));\n' +
    '}\n' +
    '\n' +
    '// Train position: interpolate between stations\n' +
    'function trainPosition(t) {\n' +
    '  if (t < STATION_START) return { x: stationData[0].x, y: stationData[0].y };\n' +
    '  for (var i = 0; i < stationData.length - 1; i++) {\n' +
    '    var t0 = stationTime(i);\n' +
    '    var t1 = stationTime(i + 1);\n' +
    '    if (t >= t0 && t < t1) {\n' +
    '      var p = easeInOut(prog(t, t0 + 0.15, t1));\n' +
    '      return {\n' +
    '        x: lerp(stationData[i].x, stationData[i+1].x, p),\n' +
    '        y: lerp(stationData[i].y, stationData[i+1].y, p)\n' +
    '      };\n' +
    '    }\n' +
    '  }\n' +
    '  return { x: stationData[stationData.length-1].x, y: stationData[stationData.length-1].y };\n' +
    '}\n' +
    '\n' +
    'window.__applyUpTo = function(t) {\n' +
    '  // Header fade in 0-1.5s\n' +
    '  var header = document.getElementById("header");\n' +
    '  header.style.opacity = String(easeOut(prog(t, 0.2, 1.0)));\n' +
    '\n' +
    '  // SVG line layer\n' +
    '  var svgEl = document.getElementById("transit-svg");\n' +
    '  svgEl.style.opacity = String(easeOut(prog(t, 0.5, 1.2)));\n' +
    '\n' +
    '  // Main line draw\n' +
    '  var mainPath = document.getElementById("main-line-path");\n' +
    '  mainPath.setAttribute("stroke-dashoffset", String(mainLineDashOffset(t)));\n' +
    '\n' +
    '  // Station dots\n' +
    '  for (var i = 0; i < stationData.length; i++) {\n' +
    '    var dot = document.getElementById("sdot-" + i);\n' +
    '    if (!dot) continue;\n' +
    '    var st = stationTime(i);\n' +
    '    if (t < st - 0.1) {\n' +
    '      dot.setAttribute("opacity", "0");\n' +
    '    } else if (t < st + 0.3) {\n' +
    '      var p = easeOut(prog(t, st - 0.1, st + 0.3));\n' +
    '      dot.setAttribute("opacity", String(p));\n' +
    '      dot.setAttribute("r", String(lerp(5, 12, p)));\n' +
    '    } else {\n' +
    '      dot.setAttribute("opacity", "1");\n' +
    '      dot.setAttribute("r", "12");\n' +
    '      if (t > st + 0.5) {\n' +
    '        dot.setAttribute("fill", LINE_COLOR);\n' +
    '        dot.setAttribute("stroke", "#fff");\n' +
    '      }\n' +
    '    }\n' +
    '  }\n' +
    '\n' +
    '  // Station labels\n' +
    '  for (var il = 0; il < stationData.length; il++) {\n' +
    '    var lbl = document.getElementById("slabel-" + il);\n' +
    '    if (!lbl) continue;\n' +
    '    var slt = stationTime(il);\n' +
    '    if (t < slt) {\n' +
    '      lbl.style.opacity = "0";\n' +
    '    } else if (t < slt + 0.4) {\n' +
    '      lbl.style.opacity = String(easeOut(prog(t, slt, slt + 0.4)));\n' +
    '    } else {\n' +
    '      lbl.style.opacity = "1";\n' +
    '    }\n' +
    '  }\n' +
    '\n' +
    '  // Photo cards: expand from station dot, hold briefly, fade\n' +
    '  for (var ic = 0; ic < stationData.length; ic++) {\n' +
    '    var card = document.getElementById("pcard-" + ic);\n' +
    '    if (!card) continue;\n' +
    '    var cardIn = stationTime(ic) + 0.15;\n' +
    '    var cardHold = 0.5;\n' +
    '    var cardFade = 0.25;\n' +
    '    var cardOut = cardIn + cardHold;\n' +
    '    if (t < cardIn) {\n' +
    '      card.style.opacity = "0";\n' +
    '      card.style.transform = "scale(0.1)";\n' +
    '    } else if (t < cardIn + 0.25) {\n' +
    '      var cp = easeOut(prog(t, cardIn, cardIn + 0.25));\n' +
    '      card.style.opacity = String(cp);\n' +
    '      card.style.transform = "scale(" + lerp(0.1, 1, cp) + ")";\n' +
    '    } else if (t < cardOut) {\n' +
    '      card.style.opacity = "1";\n' +
    '      card.style.transform = "scale(1)";\n' +
    '    } else if (t < cardOut + cardFade) {\n' +
    '      var co = easeIn(prog(t, cardOut, cardOut + cardFade));\n' +
    '      card.style.opacity = String(1 - co);\n' +
    '    } else {\n' +
    '      card.style.opacity = "0";\n' +
    '    }\n' +
    '  }\n' +
    '\n' +
    '  // Train dot\n' +
    '  var trainDot = document.getElementById("train-dot");\n' +
    '  var trainVisible = (t >= 1.3 && t < 10.0);\n' +
    '  trainDot.style.opacity = trainVisible ? "1" : "0";\n' +
    '  if (trainVisible) {\n' +
    '    var tp = trainPosition(t);\n' +
    '    trainDot.style.left = tp.x + "px";\n' +
    '    trainDot.style.top = tp.y + "px";\n' +
    '    // Pulse when near station\n' +
    '    var nearStation = false;\n' +
    '    for (var ins = 0; ins < stationData.length; ins++) {\n' +
    '      if (Math.abs(t - stationTime(ins)) < 0.15) { nearStation = true; break; }\n' +
    '    }\n' +
    '    if (nearStation) {\n' +
    '      var pulse = 1 + 0.3 * Math.sin(t * 25);\n' +
    '      trainDot.style.width = (20 * pulse) + "px";\n' +
    '      trainDot.style.height = (20 * pulse) + "px";\n' +
    '      trainDot.style.transform = "translate(" + (-10 * pulse) + "px, " + (-10 * pulse) + "px)";\n' +
    '    } else {\n' +
    '      trainDot.style.width = "20px";\n' +
    '      trainDot.style.height = "20px";\n' +
    '      trainDot.style.transform = "translate(-10px, -10px)";\n' +
    '    }\n' +
    '  }\n' +
    '\n' +
    '  // 10-12s: Final station photo fills screen\n' +
    '  var fullPhoto = document.getElementById("full-photo");\n' +
    '  if (t < 10.0) {\n' +
    '    fullPhoto.style.opacity = "0";\n' +
    '  } else if (t < 10.8) {\n' +
    '    var fp = easeOut(prog(t, 10.0, 10.8));\n' +
    '    fullPhoto.style.opacity = String(fp);\n' +
    '  } else if (t < 11.8) {\n' +
    '    fullPhoto.style.opacity = "1";\n' +
    '  } else if (t < 12.0) {\n' +
    '    fullPhoto.style.opacity = String(1 - easeIn(prog(t, 11.8, 12.0)));\n' +
    '  } else {\n' +
    '    fullPhoto.style.opacity = "0";\n' +
    '  }\n' +
    '\n' +
    '  // Fade out map elements during full photo + CTA\n' +
    '  if (t >= 10.0) {\n' +
    '    var mapFade = 1 - easeOut(prog(t, 10.0, 10.5));\n' +
    '    svgEl.style.opacity = String(mapFade);\n' +
    '    header.style.opacity = String(mapFade);\n' +
    '    for (var imf = 0; imf < stationData.length; imf++) {\n' +
    '      var slbl = document.getElementById("slabel-" + imf);\n' +
    '      if (slbl) slbl.style.opacity = String(mapFade);\n' +
    '    }\n' +
    '  }\n' +
    '\n' +
    '  // 12-14s: CTA panel\n' +
    '  var ctaPanel = document.getElementById("cta-panel");\n' +
    '  if (t < 12.0) {\n' +
    '    ctaPanel.style.opacity = "0";\n' +
    '  } else if (t < 12.6) {\n' +
    '    ctaPanel.style.opacity = String(easeOut(prog(t, 12.0, 12.6)));\n' +
    '  } else {\n' +
    '    ctaPanel.style.opacity = "1";\n' +
    '  }\n' +
    '};\n' +
    '\n' +
    'if (location.search.includes("capture=1")) {\n' +
    '  var s = document.createElement("style");\n' +
    '  s.textContent = "*, *::before, *::after { transition-duration: 0s !important; animation-duration: 0.001s !important; }";\n' +
    '  document.head.appendChild(s);\n' +
    '}\n' +
    '</script>\n</body>\n</html>';
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
    if (frame % (FPS * 2) === 0) {
      console.log('  ' + t.toFixed(1) + 's / ' + TOTAL_DURATION + 's');
    }
  }

  await browser.close();
  console.log('All frames captured');

  var outputMp4 = path.join(OUT_DIR, '70a-subway-map.mp4');
  execSync(
    'ffmpeg -y -framerate ' + FPS + ' -i "' + path.join(framesDir, 'frame_%05d.png') + '" ' +
    '-c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r ' + FPS + ' -an "' + outputMp4 + '"',
    { stdio: 'inherit' }
  );

  rmSync(framesDir, { recursive: true, force: true });

  var reelsDir = path.join(__dirname, 'reels');
  if (!existsSync(reelsDir)) mkdirSync(reelsDir, { recursive: true });
  execSync('cp "' + outputMp4 + '" "' + path.join(reelsDir, '70a-subway-map.mp4') + '"');

  var sz = statSync(outputMp4);
  console.log('Final: ' + (sz.size / (1024 * 1024)).toFixed(1) + ' MB');
  console.log('Copied to reels/70a-subway-map.mp4');
  console.log('=== Done ===');
}

main().catch(function(err) {
  console.error(err);
  process.exit(1);
});
