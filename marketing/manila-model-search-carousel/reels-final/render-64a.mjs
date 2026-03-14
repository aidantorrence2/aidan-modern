import { chromium } from 'playwright';
import { execSync } from 'child_process';
import { mkdirSync, rmSync, existsSync, readFileSync, writeFileSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

var __dirname = path.dirname(fileURLToPath(import.meta.url));
var OUT_DIR = path.join(__dirname, 'output-64a');

var W = 1080;
var H = 1920;
var FPS = 30;
var TOTAL_FRAMES = 420; // 14s at 30fps
var TOTAL_DURATION = 14;

var SAFE_TOP = 213;
var SAFE_BOTTOM = 430;

var FILM_SCANS_DIR = '/Volumes/PortableSSD/Exports/film scans';
var PHOTO_NAMES = [
  'DSC_0064.jpg',
  'DSC_0065.jpg',
  'DSC_0066.jpg',
  'DSC_0071.jpg',
  'DSC_0074.jpg',
  'DSC_0075.jpg',
  'DSC_0086.jpg',
  'DSC_0087.jpg',
  'DSC_0093.jpg',
  'DSC_0097.jpg',
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
  // 9 gallery photos + 1 hero photo (last one)
  var galleryPhotos = PHOTO_NAMES.slice(0, 9);
  var heroPhoto = PHOTO_NAMES[9];

  var imgDataJSON = JSON.stringify(PHOTO_NAMES.map(function(name) {
    return imageDataMap[name];
  }));

  // Each gallery frame is ~900px wide with gaps between them
  var FRAME_WIDTH = 680;
  var FRAME_GAP = 300;
  var FRAME_TOTAL = FRAME_WIDTH + FRAME_GAP;
  var GALLERY_TOTAL_WIDTH = galleryPhotos.length * FRAME_TOTAL + 600; // extra padding at end

  return '<!DOCTYPE html>\n<html>\n<head>\n<meta charset="utf-8">\n<style>\n' +
    '  * { box-sizing: border-box; margin: 0; padding: 0; }\n' +
    '  html, body { margin: 0; padding: 0; overflow: hidden; }\n' +
    '\n' +
    '  #root {\n' +
    '    width: ' + W + 'px;\n' +
    '    height: ' + H + 'px;\n' +
    '    position: relative;\n' +
    '    overflow: hidden;\n' +
    '    background: #f2f0ec;\n' +
    '  }\n' +
    '\n' +
    '  /* Gallery white walls */\n' +
    '  #gallery-bg {\n' +
    '    position: absolute;\n' +
    '    inset: 0;\n' +
    '    background: linear-gradient(180deg, #e8e6e2 0%, #f2f0ec 15%, #f5f3ef 50%, #eae8e4 85%, #d8d4cc 100%);\n' +
    '  }\n' +
    '\n' +
    '  /* Subtle wall texture */\n' +
    '  #wall-texture {\n' +
    '    position: absolute;\n' +
    '    inset: 0;\n' +
    '    background: repeating-linear-gradient(\n' +
    '      90deg,\n' +
    '      rgba(0,0,0,0.008) 0px,\n' +
    '      rgba(0,0,0,0.008) 1px,\n' +
    '      transparent 1px,\n' +
    '      transparent 180px\n' +
    '    );\n' +
    '    pointer-events: none;\n' +
    '  }\n' +
    '\n' +
    '  /* Floor */\n' +
    '  #floor {\n' +
    '    position: absolute;\n' +
    '    bottom: 0;\n' +
    '    left: 0;\n' +
    '    width: ' + W + 'px;\n' +
    '    height: 200px;\n' +
    '    background: linear-gradient(180deg, #bfb5a0 0%, #a89880 50%, #8a7a60 100%);\n' +
    '    z-index: 2;\n' +
    '  }\n' +
    '  #floor::after {\n' +
    '    content: "";\n' +
    '    position: absolute;\n' +
    '    inset: 0;\n' +
    '    background: repeating-linear-gradient(\n' +
    '      90deg,\n' +
    '      transparent 0px,\n' +
    '      transparent 100px,\n' +
    '      rgba(0,0,0,0.08) 100px,\n' +
    '      rgba(0,0,0,0.08) 102px\n' +
    '    );\n' +
    '  }\n' +
    '\n' +
    '  /* Baseboard */\n' +
    '  #baseboard {\n' +
    '    position: absolute;\n' +
    '    bottom: 200px;\n' +
    '    left: 0;\n' +
    '    width: ' + W + 'px;\n' +
    '    height: 24px;\n' +
    '    background: linear-gradient(180deg, #d0ccc0 0%, #c0b8a8 100%);\n' +
    '    box-shadow: 0 -1px 4px rgba(0,0,0,0.1);\n' +
    '    z-index: 3;\n' +
    '  }\n' +
    '\n' +
    '  /* Entrance overlay */\n' +
    '  #entrance-overlay {\n' +
    '    position: absolute;\n' +
    '    inset: 0;\n' +
    '    background: #fff;\n' +
    '    z-index: 200;\n' +
    '    pointer-events: none;\n' +
    '    opacity: 1;\n' +
    '  }\n' +
    '\n' +
    '  /* Exhibition title on wall */\n' +
    '  #exhibition-title {\n' +
    '    position: absolute;\n' +
    '    top: ' + (SAFE_TOP + 80) + 'px;\n' +
    '    left: 0;\n' +
    '    width: ' + W + 'px;\n' +
    '    text-align: center;\n' +
    '    z-index: 100;\n' +
    '    pointer-events: none;\n' +
    '    opacity: 0;\n' +
    '  }\n' +
    '  #exhibition-title .name {\n' +
    '    font-family: Georgia, "Times New Roman", serif;\n' +
    '    font-size: 48px;\n' +
    '    font-weight: 400;\n' +
    '    letter-spacing: 14px;\n' +
    '    text-transform: uppercase;\n' +
    '    color: #2a2a2a;\n' +
    '  }\n' +
    '  #exhibition-title .sub {\n' +
    '    font-family: "Helvetica Neue", Arial, sans-serif;\n' +
    '    font-size: 14px;\n' +
    '    font-weight: 300;\n' +
    '    letter-spacing: 8px;\n' +
    '    text-transform: uppercase;\n' +
    '    color: #888;\n' +
    '    margin-top: 16px;\n' +
    '  }\n' +
    '  #exhibition-title .line {\n' +
    '    width: 60px;\n' +
    '    height: 1px;\n' +
    '    background: #bbb;\n' +
    '    margin: 20px auto 0;\n' +
    '  }\n' +
    '\n' +
    '  /* Gallery strip container that pans horizontally */\n' +
    '  #gallery-strip {\n' +
    '    position: absolute;\n' +
    '    top: 0;\n' +
    '    left: 0;\n' +
    '    width: ' + GALLERY_TOTAL_WIDTH + 'px;\n' +
    '    height: ' + (H - 200) + 'px;\n' +
    '    z-index: 10;\n' +
    '    will-change: transform;\n' +
    '  }\n' +
    '\n' +
    '  /* Individual framed photo */\n' +
    '  .gallery-frame {\n' +
    '    position: absolute;\n' +
    '    top: 50%;\n' +
    '    transform: translateY(-55%);\n' +
    '    width: ' + FRAME_WIDTH + 'px;\n' +
    '  }\n' +
    '\n' +
    '  /* Dark ornate frame */\n' +
    '  .frame-outer {\n' +
    '    background: linear-gradient(145deg, #2a2218 0%, #1a160e 50%, #0e0c08 100%);\n' +
    '    padding: 12px;\n' +
    '    box-shadow:\n' +
    '      0 8px 40px rgba(0,0,0,0.35),\n' +
    '      0 2px 10px rgba(0,0,0,0.2),\n' +
    '      inset 0 1px 0 rgba(255,255,255,0.08),\n' +
    '      inset 0 -1px 0 rgba(0,0,0,0.3);\n' +
    '    border: 1px solid rgba(80,60,30,0.4);\n' +
    '  }\n' +
    '\n' +
    '  /* Inner gold accent line */\n' +
    '  .frame-inner-border {\n' +
    '    border: 1px solid rgba(180,150,80,0.25);\n' +
    '    padding: 2px;\n' +
    '  }\n' +
    '\n' +
    '  /* White mat */\n' +
    '  .frame-mat {\n' +
    '    background: #faf8f5;\n' +
    '    padding: 28px;\n' +
    '  }\n' +
    '\n' +
    '  .frame-img {\n' +
    '    display: block;\n' +
    '    width: 100%;\n' +
    '    height: 440px;\n' +
    '    object-fit: cover;\n' +
    '  }\n' +
    '\n' +
    '  /* Spotlight above each frame */\n' +
    '  .spotlight {\n' +
    '    position: absolute;\n' +
    '    top: -280px;\n' +
    '    left: 50%;\n' +
    '    transform: translateX(-50%);\n' +
    '    width: 800px;\n' +
    '    height: 650px;\n' +
    '    background: radial-gradient(\n' +
    '      ellipse 300px 380px at 50% 0%,\n' +
    '      rgba(255, 248, 220, 0.45) 0%,\n' +
    '      rgba(255, 240, 195, 0.2) 35%,\n' +
    '      transparent 70%\n' +
    '    );\n' +
    '    pointer-events: none;\n' +
    '  }\n' +
    '\n' +
    '  /* Museum placard */\n' +
    '  .placard {\n' +
    '    margin-top: 24px;\n' +
    '    text-align: center;\n' +
    '  }\n' +
    '  .placard-num {\n' +
    '    font-family: Georgia, "Times New Roman", serif;\n' +
    '    font-size: 14px;\n' +
    '    letter-spacing: 6px;\n' +
    '    color: #999;\n' +
    '    text-transform: uppercase;\n' +
    '  }\n' +
    '  .placard-detail {\n' +
    '    font-family: "Helvetica Neue", Arial, sans-serif;\n' +
    '    font-size: 11px;\n' +
    '    font-weight: 300;\n' +
    '    letter-spacing: 4px;\n' +
    '    color: #aaa;\n' +
    '    text-transform: uppercase;\n' +
    '    margin-top: 4px;\n' +
    '  }\n' +
    '\n' +
    '  /* Hero photo section (end wall) */\n' +
    '  #hero-section {\n' +
    '    position: absolute;\n' +
    '    top: 50%;\n' +
    '    left: 50%;\n' +
    '    transform: translate(-50%, -55%);\n' +
    '    z-index: 50;\n' +
    '    opacity: 0;\n' +
    '    width: 800px;\n' +
    '    pointer-events: none;\n' +
    '  }\n' +
    '  .hero-frame {\n' +
    '    background: linear-gradient(145deg, #2a2218 0%, #1a160e 50%, #0e0c08 100%);\n' +
    '    padding: 16px;\n' +
    '    box-shadow:\n' +
    '      0 12px 60px rgba(0,0,0,0.45),\n' +
    '      0 4px 16px rgba(0,0,0,0.25),\n' +
    '      inset 0 1px 0 rgba(255,255,255,0.08);\n' +
    '    border: 1px solid rgba(80,60,30,0.4);\n' +
    '  }\n' +
    '  .hero-inner-border {\n' +
    '    border: 1px solid rgba(180,150,80,0.3);\n' +
    '    padding: 3px;\n' +
    '  }\n' +
    '  .hero-mat {\n' +
    '    background: #faf8f5;\n' +
    '    padding: 36px;\n' +
    '  }\n' +
    '  .hero-img {\n' +
    '    display: block;\n' +
    '    width: 100%;\n' +
    '    height: 520px;\n' +
    '    object-fit: cover;\n' +
    '  }\n' +
    '  .hero-spotlight {\n' +
    '    position: absolute;\n' +
    '    top: -350px;\n' +
    '    left: 50%;\n' +
    '    transform: translateX(-50%);\n' +
    '    width: 1000px;\n' +
    '    height: 800px;\n' +
    '    background: radial-gradient(\n' +
    '      ellipse 400px 500px at 50% 0%,\n' +
    '      rgba(255, 248, 220, 0.55) 0%,\n' +
    '      rgba(255, 240, 195, 0.25) 35%,\n' +
    '      transparent 70%\n' +
    '    );\n' +
    '    pointer-events: none;\n' +
    '  }\n' +
    '\n' +
    '  /* CTA gallery placard style */\n' +
    '  #cta-section {\n' +
    '    position: absolute;\n' +
    '    top: 50%;\n' +
    '    left: 50%;\n' +
    '    transform: translate(-50%, -50%);\n' +
    '    z-index: 60;\n' +
    '    text-align: center;\n' +
    '    opacity: 0;\n' +
    '    pointer-events: none;\n' +
    '    width: 860px;\n' +
    '  }\n' +
    '  #cta-placard {\n' +
    '    background: #faf8f5;\n' +
    '    border: 1px solid #ddd;\n' +
    '    padding: 60px 50px;\n' +
    '    box-shadow: 0 4px 30px rgba(0,0,0,0.12);\n' +
    '  }\n' +
    '  #cta-handle {\n' +
    '    font-family: Georgia, "Times New Roman", serif;\n' +
    '    font-size: 64px;\n' +
    '    font-weight: 400;\n' +
    '    color: #1a1a1a;\n' +
    '    letter-spacing: 2px;\n' +
    '  }\n' +
    '  #cta-desc {\n' +
    '    font-family: "Helvetica Neue", Arial, sans-serif;\n' +
    '    font-size: 18px;\n' +
    '    font-weight: 300;\n' +
    '    letter-spacing: 6px;\n' +
    '    color: #666;\n' +
    '    text-transform: uppercase;\n' +
    '    margin-top: 20px;\n' +
    '  }\n' +
    '  #cta-book {\n' +
    '    font-family: "Helvetica Neue", Arial, sans-serif;\n' +
    '    font-size: 14px;\n' +
    '    font-weight: 400;\n' +
    '    letter-spacing: 6px;\n' +
    '    color: #999;\n' +
    '    text-transform: uppercase;\n' +
    '    margin-top: 28px;\n' +
    '    padding-top: 24px;\n' +
    '    border-top: 1px solid #ddd;\n' +
    '  }\n' +
    '  #cta-spotlight {\n' +
    '    position: absolute;\n' +
    '    top: -350px;\n' +
    '    left: 50%;\n' +
    '    transform: translateX(-50%);\n' +
    '    width: 1000px;\n' +
    '    height: 800px;\n' +
    '    background: radial-gradient(\n' +
    '      ellipse 400px 500px at 50% 0%,\n' +
    '      rgba(255, 248, 220, 0.5) 0%,\n' +
    '      rgba(255, 240, 195, 0.2) 35%,\n' +
    '      transparent 70%\n' +
    '    );\n' +
    '    pointer-events: none;\n' +
    '  }\n' +
    '</style>\n</head>\n<body>\n' +
    '<div id="root">\n' +
    '  <div id="gallery-bg"></div>\n' +
    '  <div id="wall-texture"></div>\n' +
    '  <div id="entrance-overlay"></div>\n' +
    '\n' +
    '  <!-- Exhibition title -->\n' +
    '  <div id="exhibition-title">\n' +
    '    <div class="name">Aidan Torrence</div>\n' +
    '    <div class="sub">Manila, 2026 &mdash; Film on Nikon</div>\n' +
    '    <div class="line"></div>\n' +
    '  </div>\n' +
    '\n' +
    '  <!-- Gallery strip (pans left) -->\n' +
    '  <div id="gallery-strip">\n' +
    galleryPhotos.map(function(name, i) {
      var leftPos = 200 + i * FRAME_TOTAL;
      return '    <div id="gframe-' + i + '" class="gallery-frame" style="left:' + leftPos + 'px;">\n' +
        '      <div class="spotlight"></div>\n' +
        '      <div class="frame-outer">\n' +
        '        <div class="frame-inner-border">\n' +
        '          <div class="frame-mat">\n' +
        '            <img class="frame-img" id="gimg-' + i + '" src="" />\n' +
        '          </div>\n' +
        '        </div>\n' +
        '      </div>\n' +
        '      <div class="placard">\n' +
        '        <div class="placard-num">' + String(i + 1).padStart(2, '0') + ' / ' + String(galleryPhotos.length).padStart(2, '0') + '</div>\n' +
        '        <div class="placard-detail">Manila, 2026 &mdash; Film on Nikon</div>\n' +
        '      </div>\n' +
        '    </div>\n';
    }).join('') +
    '  </div>\n' +
    '\n' +
    '  <!-- Floor + baseboard -->\n' +
    '  <div id="baseboard"></div>\n' +
    '  <div id="floor"></div>\n' +
    '\n' +
    '  <!-- Hero photo (end wall) -->\n' +
    '  <div id="hero-section">\n' +
    '    <div class="hero-spotlight"></div>\n' +
    '    <div class="hero-frame">\n' +
    '      <div class="hero-inner-border">\n' +
    '        <div class="hero-mat">\n' +
    '          <img class="hero-img" id="hero-img" src="" />\n' +
    '        </div>\n' +
    '      </div>\n' +
    '    </div>\n' +
    '    <div class="placard" style="margin-top:28px;">\n' +
    '      <div class="placard-num" style="font-size:16px;letter-spacing:8px;">Featured Work</div>\n' +
    '      <div class="placard-detail">Manila, 2026 &mdash; Film on Nikon</div>\n' +
    '    </div>\n' +
    '  </div>\n' +
    '\n' +
    '  <!-- CTA -->\n' +
    '  <div id="cta-section">\n' +
    '    <div style="position:relative;">\n' +
    '      <div id="cta-spotlight"></div>\n' +
    '      <div id="cta-placard">\n' +
    '        <div id="cta-handle">@madebyaidan</div>\n' +
    '        <div id="cta-desc">Free Portrait Sessions</div>\n' +
    '        <div id="cta-book">DM to Book</div>\n' +
    '      </div>\n' +
    '    </div>\n' +
    '  </div>\n' +
    '\n' +
    '</div>\n' +
    '\n<script>\n' +
    '  var W = ' + W + ';\n' +
    '  var H = ' + H + ';\n' +
    '  var GALLERY_COUNT = ' + galleryPhotos.length + ';\n' +
    '  var FRAME_TOTAL = ' + FRAME_TOTAL + ';\n' +
    '  var IMG_DATA = ' + imgDataJSON + ';\n' +
    '\n' +
    '  // Inject images\n' +
    '  for (var i = 0; i < GALLERY_COUNT; i++) {\n' +
    '    var el = document.getElementById("gimg-" + i);\n' +
    '    if (el) el.src = IMG_DATA[i];\n' +
    '  }\n' +
    '  var heroImg = document.getElementById("hero-img");\n' +
    '  if (heroImg) heroImg.src = IMG_DATA[IMG_DATA.length - 1];\n' +
    '\n' +
    '  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }\n' +
    '  function easeIn(t) { return Math.pow(t, 3); }\n' +
    '  function easeInOut(t) { return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2; }\n' +
    '  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }\n' +
    '  function lerp(a, b, t) { return a + (b - a) * clamp(t, 0, 1); }\n' +
    '  function progress(t, start, end) { return clamp((t - start) / (end - start), 0, 1); }\n' +
    '\n' +
    '  // Pan range: start with first frame centered, end with last frame visible\n' +
    '  // First frame center at x=200 + 680/2 = 540, screen center = 540 -> translateX = 0\n' +
    '  // Last frame center at x=200 + 8*980 + 340 = 8380, to center: translateX = -(8380 - 540) = -7840\n' +
    '  var PAN_START = 0;\n' +
    '  var PAN_END = -(200 + (GALLERY_COUNT - 1) * FRAME_TOTAL + 680/2 - W/2);\n' +
    '\n' +
    '  window.__applyUpTo = function(t) {\n' +
    '    var entranceOverlay = document.getElementById("entrance-overlay");\n' +
    '    var exhibitionTitle = document.getElementById("exhibition-title");\n' +
    '    var galleryStrip = document.getElementById("gallery-strip");\n' +
    '    var heroSection = document.getElementById("hero-section");\n' +
    '    var ctaSection = document.getElementById("cta-section");\n' +
    '\n' +
    '    // === 0-1s: Gallery entrance — white walls fade in, exhibition title ===\n' +
    '    if (t < 0.4) {\n' +
    '      entranceOverlay.style.opacity = "1";\n' +
    '      exhibitionTitle.style.opacity = "0";\n' +
    '    } else if (t < 1.0) {\n' +
    '      var p = easeOut(progress(t, 0.4, 1.0));\n' +
    '      entranceOverlay.style.opacity = String(1 - p);\n' +
    '      exhibitionTitle.style.opacity = String(p);\n' +
    '    } else if (t < 1.5) {\n' +
    '      entranceOverlay.style.opacity = "0";\n' +
    '      exhibitionTitle.style.opacity = "1";\n' +
    '    } else if (t < 2.0) {\n' +
    '      entranceOverlay.style.opacity = "0";\n' +
    '      exhibitionTitle.style.opacity = String(1 - easeIn(progress(t, 1.5, 2.0)));\n' +
    '    } else {\n' +
    '      entranceOverlay.style.opacity = "0";\n' +
    '      exhibitionTitle.style.opacity = "0";\n' +
    '    }\n' +
    '\n' +
    '    // === 1-10s: Pan through gallery ===\n' +
    '    // Gallery strip visible from 1s to 10s\n' +
    '    if (t < 1.0) {\n' +
    '      galleryStrip.style.opacity = "0";\n' +
    '      galleryStrip.style.transform = "translateX(" + PAN_START + "px)";\n' +
    '    } else if (t < 1.5) {\n' +
    '      galleryStrip.style.opacity = String(easeOut(progress(t, 1.0, 1.5)));\n' +
    '      galleryStrip.style.transform = "translateX(" + PAN_START + "px)";\n' +
    '    } else if (t < 10.0) {\n' +
    '      galleryStrip.style.opacity = "1";\n' +
    '      // Smooth pan from 1.5s to 9.5s\n' +
    '      var panP = easeInOut(progress(t, 1.5, 9.5));\n' +
    '      var panX = lerp(PAN_START, PAN_END, panP);\n' +
    '      galleryStrip.style.transform = "translateX(" + panX + "px)";\n' +
    '    } else if (t < 10.5) {\n' +
    '      // Fade out gallery strip\n' +
    '      galleryStrip.style.opacity = String(1 - easeIn(progress(t, 10.0, 10.5)));\n' +
    '      galleryStrip.style.transform = "translateX(" + PAN_END + "px)";\n' +
    '    } else {\n' +
    '      galleryStrip.style.opacity = "0";\n' +
    '    }\n' +
    '\n' +
    '    // === 10-12s: Hero photo on end wall ===\n' +
    '    if (t >= 10.0 && t < 10.5) {\n' +
    '      heroSection.style.opacity = String(easeOut(progress(t, 10.0, 10.5)));\n' +
    '    } else if (t >= 10.5 && t < 11.8) {\n' +
    '      heroSection.style.opacity = "1";\n' +
    '    } else if (t >= 11.8 && t < 12.2) {\n' +
    '      heroSection.style.opacity = String(1 - easeIn(progress(t, 11.8, 12.2)));\n' +
    '    } else {\n' +
    '      heroSection.style.opacity = "0";\n' +
    '    }\n' +
    '\n' +
    '    // === 12-14s: CTA placard ===\n' +
    '    if (t >= 12.0 && t < 12.5) {\n' +
    '      ctaSection.style.opacity = String(easeOut(progress(t, 12.0, 12.5)));\n' +
    '    } else if (t >= 12.5 && t < 13.5) {\n' +
    '      ctaSection.style.opacity = "1";\n' +
    '    } else if (t >= 13.5 && t < 14.0) {\n' +
    '      ctaSection.style.opacity = String(1 - easeIn(progress(t, 13.5, 14.0)));\n' +
    '    } else if (t < 12.0) {\n' +
    '      ctaSection.style.opacity = "0";\n' +
    '    }\n' +
    '  };\n' +
    '\n' +
    '  if (location.search.includes("capture=1")) {\n' +
    '    var style = document.createElement("style");\n' +
    '    style.textContent = "*, *::before, *::after { transition-duration: 0s !important; animation-duration: 0.001s !important; }";\n' +
    '    document.head.appendChild(style);\n' +
    '  }\n' +
    '</script>\n' +
    '</body>\n</html>';
}

async function main() {
  console.log('=== Art Gallery Walk Reel v64a ===');
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

  var outputMp4 = path.join(OUT_DIR, '64a-art-gallery.mp4');
  execSync(
    'ffmpeg -y -framerate ' + FPS + ' -i "' + path.join(framesDir, 'frame_%05d.png') + '" ' +
    '-c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r ' + FPS + ' -an "' + outputMp4 + '"',
    { stdio: 'inherit' }
  );

  rmSync(framesDir, { recursive: true, force: true });

  var reelsDir = path.join(__dirname, 'reels');
  if (!existsSync(reelsDir)) mkdirSync(reelsDir, { recursive: true });
  var reelsDst = path.join(reelsDir, '64a-art-gallery.mp4');
  execSync('cp "' + outputMp4 + '" "' + reelsDst + '"');

  var sz = statSync(outputMp4);
  console.log('Final: ' + (sz.size / (1024 * 1024)).toFixed(1) + ' MB');
  console.log('Output: ' + outputMp4);
  console.log('Copied to: ' + reelsDst);
  console.log('=== Done ===');
}

main().catch(function(err) {
  console.error(err);
  process.exit(1);
});
