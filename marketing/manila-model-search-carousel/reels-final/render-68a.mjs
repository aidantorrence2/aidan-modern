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
var TOTAL_DURATION = 14;
var TOTAL_FRAMES = FPS * TOTAL_DURATION; // 420 frames

var SAFE_TOP = 213;
var SAFE_BOTTOM = 430;

var FILM_SCANS_DIR = '/Volumes/PortableSSD/Exports/film scans';
var PHOTO_NAMES = [
  'DSC_0002.jpg',
  'DSC_0003.jpg',
  'DSC_0004.jpg',
  'DSC_0005.jpg',
  'DSC_0006.jpg',
  'DSC_0007.jpg',
  'DSC_0009.jpg',
  'DSC_0011.jpg',
  'DSC_0012.jpg',
  'DSC_0015.jpg',
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

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { margin: 0; padding: 0; background: #1a0f05; overflow: hidden; }

  #root {
    width: ${W}px;
    height: ${H}px;
    position: relative;
    overflow: hidden;
    background: #1a0f05;
    font-family: 'Georgia', 'Times New Roman', serif;
  }

  /* Parchment background */
  #parchment {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse at 30% 20%, rgba(212,167,106,0.9), transparent 60%),
      radial-gradient(ellipse at 70% 80%, rgba(180,130,70,0.7), transparent 50%),
      radial-gradient(ellipse at 50% 50%, rgba(212,167,106,1), rgba(160,110,50,1));
    opacity: 0;
    z-index: 1;
  }

  /* Paper texture noise overlay */
  #paper-noise {
    position: absolute;
    inset: 0;
    z-index: 2;
    opacity: 0;
    pointer-events: none;
    background-image:
      url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='256' height='256' filter='url(%23n)' opacity='0.15'/%3E%3C/svg%3E");
    background-size: 256px 256px;
    mix-blend-mode: multiply;
  }

  /* Burnt edges */
  #burnt-edges {
    position: absolute;
    inset: 0;
    z-index: 3;
    opacity: 0;
    pointer-events: none;
    box-shadow:
      inset 0 0 120px 40px rgba(20,10,0,0.7),
      inset 0 0 250px 80px rgba(30,15,0,0.4);
    border-radius: 8px;
  }

  /* Stain marks */
  #stains {
    position: absolute;
    inset: 0;
    z-index: 4;
    opacity: 0;
    pointer-events: none;
    background:
      radial-gradient(circle at 15% 85%, rgba(100,60,20,0.3), transparent 15%),
      radial-gradient(circle at 80% 20%, rgba(90,50,15,0.2), transparent 12%),
      radial-gradient(circle at 60% 70%, rgba(110,70,25,0.15), transparent 18%);
  }

  /* WANTED IN MANILA title */
  #wanted-title {
    position: absolute;
    top: ${SAFE_TOP + 40}px;
    left: 0;
    width: ${W}px;
    text-align: center;
    z-index: 10;
    opacity: 0;
    font-family: 'Georgia', serif;
    font-size: 88px;
    font-weight: 900;
    color: #2a1a0a;
    letter-spacing: 10px;
    text-shadow: 4px 4px 0 rgba(139,69,19,0.3), -1px -1px 0 rgba(0,0,0,0.1);
    line-height: 1;
    transform: scale(1);
  }

  /* Decorative lines under WANTED IN MANILA */
  #wanted-line {
    position: absolute;
    top: ${SAFE_TOP + 260}px;
    left: 50%;
    transform: translateX(-50%);
    width: 700px;
    height: 6px;
    background: #2a1a0a;
    z-index: 10;
    opacity: 0;
    border-radius: 3px;
  }
  #wanted-line::before, #wanted-line::after {
    content: '';
    position: absolute;
    width: 700px;
    height: 3px;
    background: #2a1a0a;
    border-radius: 2px;
    left: 0;
  }
  #wanted-line::before { top: 10px; }
  #wanted-line::after { top: -10px; }

  /* Subtitle */
  #subtitle {
    position: absolute;
    top: ${SAFE_TOP + 230}px;
    left: 0;
    width: ${W}px;
    text-align: center;
    z-index: 10;
    opacity: 0;
    font-family: 'Georgia', serif;
    font-size: 36px;
    font-style: italic;
    color: #2a1a0a;
    letter-spacing: 4px;
  }

  /* First photo frame */
  #first-photo {
    position: absolute;
    top: ${SAFE_TOP + 300}px;
    left: 50%;
    transform: translateX(-50%);
    width: 520px;
    height: 620px;
    z-index: 12;
    border: 8px solid #8B4513;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 8px 30px rgba(0,0,0,0.5), inset 0 0 20px rgba(0,0,0,0.3);
    background: #2a1a0a;
    opacity: 0;
  }
  #first-photo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  /* Stacking poster containers */
  .poster-container {
    position: absolute;
    top: 0; left: 0;
    width: ${W}px;
    height: ${H}px;
    z-index: 8;
    opacity: 0;
    pointer-events: none;
  }

  .poster-bg {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse at 30% 20%, rgba(212,167,106,0.95), transparent 60%),
      radial-gradient(ellipse at 70% 80%, rgba(180,130,70,0.8), transparent 50%),
      radial-gradient(ellipse at 50% 50%, rgba(212,167,106,1), rgba(160,110,50,1));
  }

  .poster-burnt {
    position: absolute;
    inset: 0;
    box-shadow:
      inset 0 0 120px 40px rgba(20,10,0,0.7),
      inset 0 0 250px 80px rgba(30,15,0,0.4);
  }

  .poster-wanted {
    position: absolute;
    top: ${SAFE_TOP + 40}px;
    left: 0;
    width: ${W}px;
    text-align: center;
    font-family: 'Georgia', serif;
    font-size: 72px;
    font-weight: 900;
    color: #2a1a0a;
    letter-spacing: 14px;
    text-shadow: 4px 4px 0 rgba(139,69,19,0.3);
  }

  .poster-line {
    position: absolute;
    top: ${SAFE_TOP + 185}px;
    left: 50%;
    transform: translateX(-50%);
    width: 650px;
    height: 5px;
    background: #2a1a0a;
    border-radius: 3px;
  }

  .photo-frame {
    position: absolute;
    top: ${SAFE_TOP + 300}px;
    left: 50%;
    transform: translateX(-50%);
    width: 520px;
    height: 620px;
    border: 8px solid #8B4513;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 8px 30px rgba(0,0,0,0.5), inset 0 0 20px rgba(0,0,0,0.3);
    background: #2a1a0a;
  }

  .photo-frame img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .poster-bottom-text {
    position: absolute;
    top: ${SAFE_TOP + 950}px;
    left: 0;
    width: ${W}px;
    text-align: center;
    font-family: 'Georgia', serif;
    font-size: 34px;
    color: #2a1a0a;
    letter-spacing: 8px;
    font-weight: 700;
  }

  .poster-nail {
    position: absolute;
    top: ${SAFE_TOP + 20}px;
    left: 50%;
    transform: translateX(-50%);
    width: 22px;
    height: 22px;
    background: radial-gradient(circle, #888 30%, #444 70%);
    border-radius: 50%;
    box-shadow: 2px 2px 4px rgba(0,0,0,0.5);
  }

  .crinkle-overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0;
    background:
      repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(0,0,0,0.03) 8px, rgba(0,0,0,0.03) 9px),
      repeating-linear-gradient(-45deg, transparent, transparent 12px, rgba(0,0,0,0.02) 12px, rgba(0,0,0,0.02) 13px);
  }

  /* Reward text */
  #reward-text {
    position: absolute;
    top: ${SAFE_TOP + 960}px;
    left: 0;
    width: ${W}px;
    text-align: center;
    z-index: 15;
    opacity: 0;
    font-family: 'Georgia', serif;
    font-size: 72px;
    font-weight: 900;
    color: #2a1a0a;
    letter-spacing: 10px;
    text-shadow: 3px 3px 0 rgba(139,69,19,0.3);
  }

  #reward-sub {
    position: absolute;
    top: ${SAFE_TOP + 1050}px;
    left: 0;
    width: ${W}px;
    text-align: center;
    z-index: 15;
    opacity: 0;
    font-family: 'Georgia', serif;
    font-size: 44px;
    color: #8B4513;
    letter-spacing: 4px;
    font-style: italic;
  }

  /* Star decorations */
  .star-deco {
    position: absolute;
    z-index: 15;
    opacity: 0;
    font-size: 55px;
    color: #8B4513;
  }
  #star-left { top: ${SAFE_TOP + 975}px; left: 70px; }
  #star-right { top: ${SAFE_TOP + 975}px; right: 70px; }

  /* Sheriff badge */
  #sheriff-badge {
    position: absolute;
    top: ${SAFE_TOP + 1130}px;
    left: 50%;
    transform: translateX(-50%) scale(0);
    z-index: 16;
    opacity: 0;
    width: 200px;
    height: 200px;
  }

  /* CTA section */
  #cta-handle {
    position: absolute;
    top: ${SAFE_TOP + 1140}px;
    left: 0;
    width: ${W}px;
    text-align: center;
    z-index: 18;
    opacity: 0;
    font-family: 'Georgia', serif;
    font-size: 58px;
    font-weight: 900;
    color: #2a1a0a;
    letter-spacing: 3px;
  }

  #cta-message {
    position: absolute;
    top: ${SAFE_TOP + 1220}px;
    left: 0;
    width: ${W}px;
    text-align: center;
    z-index: 18;
    opacity: 0;
    font-family: 'Georgia', serif;
    font-size: 34px;
    color: #8B4513;
    letter-spacing: 2px;
    font-style: italic;
  }

  /* Shake container */
  #shake-container {
    position: absolute;
    inset: 0;
    z-index: 5;
  }

</style>
</head>
<body>
<div id="root">

  <div id="shake-container">
    <div id="parchment"></div>
    <div id="paper-noise"></div>
    <div id="burnt-edges"></div>
    <div id="stains"></div>

    <div id="wanted-title">WANTED IN MANILA</div>
    <div id="wanted-line"></div>

    <div id="subtitle"><span id="subtitle-text"></span></div>

    <div id="first-photo">
      <img id="first-photo-img" src="" alt="Wanted"/>
    </div>

    ${(function() {
      var html = '';
      for (var i = 0; i < 8; i++) {
        html += '<div id="poster-' + i + '" class="poster-container">';
        html += '<div class="poster-bg"></div>';
        html += '<div class="poster-burnt"></div>';
        html += '<div class="poster-wanted">WANTED IN MANILA</div>';
        html += '<div class="poster-line"></div>';
        html += '<div class="photo-frame"><img id="poster-img-' + i + '" src="" alt="Wanted"/></div>';
        html += '<div class="poster-bottom-text">DEAD OR ALIVE</div>';
        html += '<div class="poster-nail"></div>';
        html += '<div class="crinkle-overlay"></div>';
        html += '</div>';
      }
      return html;
    })()}

    <div id="reward-text">REWARD</div>
    <div id="reward-sub">FREE PHOTO SHOOT</div>

    <div id="star-left" class="star-deco">&#9733;</div>
    <div id="star-right" class="star-deco">&#9733;</div>

    <div id="sheriff-badge">
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <polygon points="100,10 118,65 175,45 140,90 190,110 140,130 160,185 100,155 40,185 60,130 10,110 60,90 25,45 82,65"
          fill="#8B4513" stroke="#2a1a0a" stroke-width="4"/>
        <circle cx="100" cy="110" r="42" fill="none" stroke="#d4a76a" stroke-width="3"/>
        <text x="100" y="105" text-anchor="middle" font-size="18" font-weight="bold" fill="#d4a76a" font-family="Georgia, serif">SHERIFF</text>
        <text x="100" y="125" text-anchor="middle" font-size="12" fill="#d4a76a" font-family="Georgia, serif">MANILA</text>
      </svg>
    </div>

    <div id="cta-handle">@madebyaidan</div>
    <div id="cta-message">Turn yourself in &mdash; DM me</div>
  </div>

</div>

<script>
  var W = ${W};
  var H = ${H};
  var PHOTO_COUNT = ${photoCount};
  var IMG_DATA = ${imgDataJSON};
  var SAFE_TOP = ${SAFE_TOP};
  var SAFE_BOTTOM = ${SAFE_BOTTOM};

  // Inject first photo
  document.getElementById('first-photo-img').src = IMG_DATA[0];

  // Inject poster photos (photos 1-8, wrapping)
  for (var i = 0; i < 8; i++) {
    var imgEl = document.getElementById('poster-img-' + i);
    if (imgEl) imgEl.src = IMG_DATA[(i + 1) % PHOTO_COUNT];
  }

  // ---- Easing ----
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function easeIn(t) { return Math.pow(t, 3); }
  function easeInOut(t) { return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2; }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function lerp(a, b, t) { return a + (b - a) * clamp(t, 0, 1); }
  function prog(t, start, end) { return clamp((t - start) / (end - start), 0, 1); }
  function bounceOut(t) {
    if (t < 1/2.75) return 7.5625*t*t;
    if (t < 2/2.75) { t -= 1.5/2.75; return 7.5625*t*t + 0.75; }
    if (t < 2.5/2.75) { t -= 2.25/2.75; return 7.5625*t*t + 0.9375; }
    t -= 2.625/2.75; return 7.5625*t*t + 0.984375;
  }

  var SUBTITLE_FULL = 'FOR BEING TOO PHOTOGENIC';

  // Poster stacking offsets
  var posterAngles = [-3, 4, -2, 5, -4, 3, -5, 2];
  var posterOffsetX = [10, -15, 20, -10, 15, -20, 8, -12];
  var posterOffsetY = [5, -8, 10, -5, 8, -10, 6, -7];

  window.__applyUpTo = function(t) {
    var shakeContainer = document.getElementById('shake-container');
    var shakeX = 0, shakeY = 0;

    // ---- 0-1.5s: Parchment + WANTED IN MANILA stamp ----
    var parchment = document.getElementById('parchment');
    var paperNoise = document.getElementById('paper-noise');
    var burntEdges = document.getElementById('burnt-edges');
    var stains = document.getElementById('stains');

    var parchOpacity = easeOut(prog(t, 0, 0.8));
    parchment.style.opacity = String(parchOpacity);
    paperNoise.style.opacity = String(parchOpacity * 0.8);
    burntEdges.style.opacity = String(parchOpacity);
    stains.style.opacity = String(parchOpacity * 0.6);

    var wantedTitle = document.getElementById('wanted-title');
    var wantedLine = document.getElementById('wanted-line');

    if (t < 0.6) {
      wantedTitle.style.opacity = '0';
      wantedTitle.style.transform = 'scale(3)';
      wantedLine.style.opacity = '0';
    } else if (t < 1.0) {
      var wp = prog(t, 0.6, 1.0);
      var wScale = lerp(3, 1, bounceOut(wp));
      wantedTitle.style.opacity = String(Math.min(1, wp * 3));
      wantedTitle.style.transform = 'scale(' + wScale + ')';
      if (t < 0.85) {
        var shakeIntensity = (1 - prog(t, 0.6, 0.85)) * 12;
        shakeX = Math.sin(t * 60) * shakeIntensity;
        shakeY = Math.cos(t * 47) * shakeIntensity;
      }
      wantedLine.style.opacity = String(easeOut(prog(t, 0.85, 1.0)));
    } else {
      wantedTitle.style.opacity = '1';
      wantedTitle.style.transform = 'scale(1)';
      wantedLine.style.opacity = '1';
    }

    // ---- 1.5-3s: Subtitle + first photo ----
    var subtitle = document.getElementById('subtitle');
    var subtitleText = document.getElementById('subtitle-text');

    if (t < 1.5) {
      subtitle.style.opacity = '0';
    } else if (t < 3.0) {
      subtitle.style.opacity = '1';
      var typeProgress = prog(t, 1.5, 2.8);
      var charCount = Math.floor(typeProgress * SUBTITLE_FULL.length);
      subtitleText.textContent = SUBTITLE_FULL.substring(0, charCount);
    } else {
      subtitle.style.opacity = '1';
      subtitleText.textContent = SUBTITLE_FULL;
    }

    var firstPhoto = document.getElementById('first-photo');
    if (t < 2.0) {
      firstPhoto.style.opacity = '0';
      firstPhoto.style.transform = 'translateX(-50%) scale(0.8)';
    } else if (t < 2.6) {
      var fp = easeOut(prog(t, 2.0, 2.6));
      firstPhoto.style.opacity = String(fp);
      firstPhoto.style.transform = 'translateX(-50%) scale(' + lerp(0.8, 1, fp) + ')';
    } else if (t < 3.0) {
      firstPhoto.style.opacity = '1';
      firstPhoto.style.transform = 'translateX(-50%) scale(1)';
    } else {
      var fadeOut = 1 - easeIn(prog(t, 3.0, 3.4));
      firstPhoto.style.opacity = String(Math.max(0, fadeOut));
      firstPhoto.style.transform = 'translateX(-50%) scale(1)';
    }

    // ---- 3-9s: Posters stack ----
    if (t >= 3.0 && t < 9.0) {
      var hideP = easeIn(prog(t, 3.0, 3.3));
      wantedTitle.style.opacity = String(1 - hideP);
      wantedLine.style.opacity = String(1 - hideP);
      subtitle.style.opacity = String(1 - hideP);
    }

    var POSTER_START = 3.0;
    var POSTER_STRIDE = 0.75;

    for (var i = 0; i < 8; i++) {
      var poster = document.getElementById('poster-' + i);
      if (!poster) continue;
      var pStart = POSTER_START + i * POSTER_STRIDE;
      var pEnd = pStart + 0.5;

      if (t < pStart) {
        poster.style.opacity = '0';
        poster.style.transform = 'translate(0px, -100px) rotate(0deg) scale(1.1)';
      } else if (t < pEnd) {
        var pp = prog(t, pStart, pEnd);
        var slamP = bounceOut(pp);
        poster.style.opacity = String(Math.min(1, pp * 4));
        var rot = posterAngles[i] * (1 - slamP * 0.3);
        var offX = posterOffsetX[i];
        var offY = lerp(-60, posterOffsetY[i], slamP);
        poster.style.transform = 'translate(' + offX + 'px, ' + offY + 'px) rotate(' + rot + 'deg) scale(' + lerp(1.08, 1, slamP) + ')';
        var crinkle = poster.querySelector('.crinkle-overlay');
        if (crinkle) crinkle.style.opacity = String((1 - pp) * 0.5);
        if (pp < 0.4) {
          var si = (1 - pp / 0.4) * 6;
          shakeX += Math.sin(t * 80 + i) * si;
          shakeY += Math.cos(t * 63 + i) * si;
        }
      } else {
        poster.style.opacity = '1';
        poster.style.transform = 'translate(' + posterOffsetX[i] + 'px, ' + posterOffsetY[i] + 'px) rotate(' + (posterAngles[i] * 0.7) + 'deg) scale(1)';
        var crinkle2 = poster.querySelector('.crinkle-overlay');
        if (crinkle2) crinkle2.style.opacity = '0';
        if (t >= 8.5) {
          var fadeAll = 1 - easeIn(prog(t, 8.5, 9.2));
          poster.style.opacity = String(Math.max(0, fadeAll));
        }
      }
    }

    // ---- 9-11s: REWARD + stars ----
    if (t >= 9.0) {
      parchment.style.opacity = '1';
      paperNoise.style.opacity = '0.8';
      burntEdges.style.opacity = '1';
      stains.style.opacity = '0.6';
    }

    if (t >= 9.0 && t < 9.5) {
      var reshow = easeOut(prog(t, 9.0, 9.5));
      wantedTitle.style.opacity = String(reshow);
      wantedLine.style.opacity = String(reshow);
    } else if (t >= 9.5 && t < 12.0) {
      wantedTitle.style.opacity = '1';
      wantedLine.style.opacity = '1';
    }

    var rewardText = document.getElementById('reward-text');
    var rewardSub = document.getElementById('reward-sub');
    var starLeft = document.getElementById('star-left');
    var starRight = document.getElementById('star-right');

    if (t < 9.3) {
      rewardText.style.opacity = '0';
      rewardText.style.transform = 'scale(2)';
      rewardSub.style.opacity = '0';
      starLeft.style.opacity = '0';
      starRight.style.opacity = '0';
    } else if (t < 10.0) {
      var rp = prog(t, 9.3, 10.0);
      rewardText.style.opacity = String(easeOut(rp));
      rewardText.style.transform = 'scale(' + lerp(2, 1, bounceOut(rp)) + ')';
      rewardSub.style.opacity = String(easeOut(prog(t, 9.6, 10.0)));
      starLeft.style.opacity = String(easeOut(prog(t, 9.5, 10.0)));
      starRight.style.opacity = String(easeOut(prog(t, 9.5, 10.0)));
      if (rp < 0.3) {
        shakeX += Math.sin(t * 50) * 5;
        shakeY += Math.cos(t * 40) * 5;
      }
    } else if (t < 11.0) {
      rewardText.style.opacity = '1';
      rewardText.style.transform = 'scale(1)';
      rewardSub.style.opacity = '1';
      starLeft.style.opacity = '1';
      starRight.style.opacity = '1';
      var starScale = 1 + 0.15 * Math.sin(t * 6);
      starLeft.style.transform = 'scale(' + starScale + ')';
      starRight.style.transform = 'scale(' + starScale + ')';
    } else {
      var fadR = 1 - easeIn(prog(t, 11.0, 11.5));
      rewardText.style.opacity = String(Math.max(0, fadR));
      rewardSub.style.opacity = String(Math.max(0, fadR));
      starLeft.style.opacity = String(Math.max(0, fadR));
      starRight.style.opacity = String(Math.max(0, fadR));
    }

    // ---- 11-12s: Sheriff badge ----
    var badge = document.getElementById('sheriff-badge');
    if (t < 11.0) {
      badge.style.opacity = '0';
      badge.style.transform = 'translateX(-50%) scale(0) rotate(-180deg)';
    } else if (t < 11.8) {
      var bp = prog(t, 11.0, 11.8);
      badge.style.opacity = String(easeOut(bp));
      var bScale = lerp(0, 1, bounceOut(bp));
      var bRot = lerp(-180, 0, easeOut(bp));
      badge.style.transform = 'translateX(-50%) scale(' + bScale + ') rotate(' + bRot + 'deg)';
      if (bp < 0.3) {
        shakeX += Math.sin(t * 40) * 4;
        shakeY += Math.cos(t * 35) * 4;
      }
    } else if (t < 12.0) {
      badge.style.opacity = '1';
      badge.style.transform = 'translateX(-50%) scale(1) rotate(0deg)';
    } else {
      var fadB = 1 - easeIn(prog(t, 12.0, 12.3));
      badge.style.opacity = String(Math.max(0, fadB));
      badge.style.transform = 'translateX(-50%) scale(' + lerp(1, 0.8, prog(t, 12.0, 12.3)) + ') rotate(0deg)';
    }

    // ---- 12-14s: CTA ----
    var ctaHandle = document.getElementById('cta-handle');
    var ctaMessage = document.getElementById('cta-message');

    if (t >= 12.0) {
      var wFade = 1 - easeIn(prog(t, 12.0, 12.5));
      wantedTitle.style.opacity = String(Math.max(0, wFade));
      wantedLine.style.opacity = String(Math.max(0, wFade));
    }

    if (t < 12.2) {
      ctaHandle.style.opacity = '0';
      ctaHandle.style.transform = 'translateY(30px)';
      ctaMessage.style.opacity = '0';
      ctaMessage.style.transform = 'translateY(30px)';
    } else if (t < 13.0) {
      var cp = easeOut(prog(t, 12.2, 13.0));
      ctaHandle.style.opacity = String(cp);
      ctaHandle.style.transform = 'translateY(' + lerp(30, 0, cp) + 'px)';
      var cp2 = easeOut(prog(t, 12.5, 13.0));
      ctaMessage.style.opacity = String(cp2);
      ctaMessage.style.transform = 'translateY(' + lerp(30, 0, cp2) + 'px)';
    } else {
      ctaHandle.style.opacity = '1';
      ctaHandle.style.transform = 'translateY(0px)';
      ctaMessage.style.opacity = '1';
      ctaMessage.style.transform = 'translateY(0px)';
    }

    // Apply shake
    shakeContainer.style.transform = 'translate(' + shakeX + 'px, ' + shakeY + 'px)';
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
  console.log('=== Wanted Poster Reel v68a ===');
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

  var outputMp4 = path.join(OUT_DIR, '68a-wanted-poster.mp4');
  execSync(
    'ffmpeg -y -framerate ' + FPS + ' -i "' + path.join(framesDir, 'frame_%05d.png') + '" ' +
    '-c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r ' + FPS + ' -an "' + outputMp4 + '"',
    { stdio: 'inherit' }
  );

  rmSync(framesDir, { recursive: true, force: true });

  var reelsDir = path.join(__dirname, 'reels');
  if (!existsSync(reelsDir)) mkdirSync(reelsDir, { recursive: true });
  execSync('cp "' + outputMp4 + '" "' + path.join(reelsDir, '68a-wanted-poster.mp4') + '"');

  var sz = statSync(outputMp4);
  console.log('Final: ' + (sz.size / (1024 * 1024)).toFixed(1) + ' MB');
  console.log('Copied to reels/68a-wanted-poster.mp4');
  console.log('=== Done ===');
}

main().catch(function(err) {
  console.error(err);
  process.exit(1);
});
