import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, "output-18c")

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 430
const SAFE_TOP = 213
const SAFE_LEFT = 66
const SAFE_RIGHT = 1027
const USABLE_H = HEIGHT - SAFE_BOTTOM

const SF = "-apple-system, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif"
const MANILA_COLOR = '#E8443A'
const IG_BG = '#0a0a0a'

const TOTAL_DURATION_MS = 24000

const PHOTOS = [
  'manila-gallery-dsc-0190.jpg',
  'manila-gallery-garden-002.jpg',
  'manila-gallery-canal-002.jpg',
  'manila-gallery-rocks-001.jpg',
  'manila-gallery-garden-001.jpg',
  'manila-gallery-night-001.jpg',
  'manila-gallery-ivy-001.jpg',
  'manila-gallery-shadow-001.jpg',
]

function resetOutputDir() {
  fs.rmSync(OUT_DIR, { recursive: true, force: true })
  fs.mkdirSync(OUT_DIR, { recursive: true })
}

function readImage(name) {
  const buf = fs.readFileSync(path.join(IMAGE_DIR, name))
  return `data:image/jpeg;base64,${buf.toString('base64')}`
}

function writeSources(payload) {
  fs.writeFileSync(path.join(OUT_DIR, 'sources.json'), JSON.stringify(payload, null, 2))
}

function buildHTML(imageDataMap) {
  /*
   * PHOTO EXPAND + ELECTRICITY/ENERGY EFFECT (18c)
   *
   * Phase 1 (0-3s):   Full skeleton UI — warm-toned shimmer with editorial layout
   * Phase 2 (3-7s):   First photo EXPANDS from 30% to full with electricity crackling
   * Phase 3 (7-18s):  Each subsequent photo does expand+electricity, cycling every 2.5s
   * Phase 4 (18-24s): CTA with pulsing glow
   */

  // Build the hero image sources as a JS array string using concatenation to avoid nested backticks
  var heroSrcArray = 'var heroSrcs = ['
  heroSrcArray += '"' + imageDataMap[PHOTOS[0]] + '",'
  heroSrcArray += '"' + imageDataMap[PHOTOS[4]] + '",'
  heroSrcArray += '"' + imageDataMap[PHOTOS[5]] + '",'
  heroSrcArray += '"' + imageDataMap[PHOTOS[6]] + '",'
  heroSrcArray += '"' + imageDataMap[PHOTOS[7]] + '"'
  heroSrcArray += '];'

  return `<!DOCTYPE html>
<html>
<head>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { margin: 0; padding: 0; background: #080808; -webkit-font-smoothing: antialiased; }

  @keyframes shimmer {
    0% { background-position: -1200px 0; }
    100% { background-position: 1200px 0; }
  }

  @keyframes revealUp {
    0% { opacity: 0; transform: translateY(30px); }
    100% { opacity: 1; transform: translateY(0); }
  }

  @keyframes pulseGlow {
    0%, 100% { box-shadow: 0 0 0 0 rgba(232,68,58,0.5), 0 6px 32px rgba(232,68,58,0.3); }
    50% { box-shadow: 0 0 0 16px rgba(232,68,58,0), 0 6px 32px rgba(232,68,58,0.3); }
  }

  /* ── Photo expand animation ── */
  @keyframes photoExpand {
    0% {
      opacity: 0;
      transform: scale(0.3);
    }
    15% {
      opacity: 1;
    }
    70% {
      transform: scale(1.04);
    }
    85% {
      transform: scale(0.98);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }

  /* ── Electricity effects ── */
  @keyframes electricBorder {
    0% { border-color: #00bfff; box-shadow: 0 0 15px #00bfff, 0 0 30px #00bfff, inset 0 0 15px rgba(0,191,255,0.1); }
    25% { border-color: #fff; box-shadow: 0 0 25px #fff, 0 0 50px #00bfff, inset 0 0 20px rgba(255,255,255,0.1); }
    50% { border-color: #00e5ff; box-shadow: 0 0 20px #00e5ff, 0 0 40px #00bfff, inset 0 0 15px rgba(0,229,255,0.1); }
    75% { border-color: #fff; box-shadow: 0 0 30px #fff, 0 0 60px #00e5ff, inset 0 0 25px rgba(255,255,255,0.15); }
    100% { border-color: #00bfff; box-shadow: 0 0 15px #00bfff, 0 0 30px #00bfff, inset 0 0 15px rgba(0,191,255,0.1); }
  }

  @keyframes electricDash {
    0% { stroke-dashoffset: 0; }
    100% { stroke-dashoffset: -60; }
  }

  @keyframes pulseRing1 {
    0% { transform: translate(-50%, -50%) scale(0.95); opacity: 0.8; border-color: #00bfff; }
    50% { transform: translate(-50%, -50%) scale(1.08); opacity: 0.2; border-color: #fff; }
    100% { transform: translate(-50%, -50%) scale(0.95); opacity: 0.8; border-color: #00bfff; }
  }

  @keyframes pulseRing2 {
    0% { transform: translate(-50%, -50%) scale(1.02); opacity: 0.6; border-color: #00e5ff; }
    50% { transform: translate(-50%, -50%) scale(1.15); opacity: 0.1; border-color: #fff; }
    100% { transform: translate(-50%, -50%) scale(1.02); opacity: 0.6; border-color: #00e5ff; }
  }

  @keyframes pulseRing3 {
    0% { transform: translate(-50%, -50%) scale(1.06); opacity: 0.4; }
    50% { transform: translate(-50%, -50%) scale(1.22); opacity: 0; }
    100% { transform: translate(-50%, -50%) scale(1.06); opacity: 0.4; }
  }

  @keyframes sparkTopLeft {
    0%, 100% { opacity: 0.3; transform: rotate(0deg) scale(1); box-shadow: 0 0 8px #00bfff; }
    25% { opacity: 1; transform: rotate(15deg) scale(1.3); box-shadow: 0 0 20px #fff, 0 0 40px #00bfff; }
    50% { opacity: 0.5; transform: rotate(-10deg) scale(0.9); box-shadow: 0 0 12px #00e5ff; }
    75% { opacity: 0.9; transform: rotate(5deg) scale(1.2); box-shadow: 0 0 25px #fff, 0 0 35px #00e5ff; }
  }

  @keyframes sparkTopRight {
    0%, 100% { opacity: 0.5; transform: rotate(0deg) scale(1); box-shadow: 0 0 10px #00e5ff; }
    30% { opacity: 0.2; transform: rotate(-20deg) scale(1.4); box-shadow: 0 0 30px #fff; }
    60% { opacity: 1; transform: rotate(10deg) scale(0.8); box-shadow: 0 0 15px #00bfff; }
    80% { opacity: 0.7; transform: rotate(-5deg) scale(1.1); box-shadow: 0 0 22px #fff, 0 0 40px #00bfff; }
  }

  @keyframes sparkBottomLeft {
    0%, 100% { opacity: 0.4; transform: rotate(0deg) scale(1.1); }
    20% { opacity: 0.9; transform: rotate(25deg) scale(1.5); box-shadow: 0 0 30px #00bfff, 0 0 50px #fff; }
    45% { opacity: 0.2; transform: rotate(-15deg) scale(0.7); }
    70% { opacity: 1; transform: rotate(8deg) scale(1.3); box-shadow: 0 0 20px #00e5ff; }
  }

  @keyframes sparkBottomRight {
    0%, 100% { opacity: 0.6; transform: rotate(0deg) scale(0.9); }
    15% { opacity: 0.3; transform: rotate(-30deg) scale(1.2); }
    40% { opacity: 1; transform: rotate(20deg) scale(1.6); box-shadow: 0 0 35px #fff, 0 0 50px #00bfff; }
    65% { opacity: 0.4; transform: rotate(-8deg) scale(1); box-shadow: 0 0 10px #00e5ff; }
  }

  @keyframes borderDashCycle {
    0% { border-style: dashed; }
    33% { border-style: dotted; }
    66% { border-style: dashed; }
    100% { border-style: dashed; }
  }

  @keyframes energyFlash {
    0% { opacity: 0; }
    5% { opacity: 0.8; }
    10% { opacity: 0; }
    15% { opacity: 0.6; }
    20% { opacity: 0; }
    100% { opacity: 0; }
  }

  .page {
    width: ${WIDTH}px;
    height: ${HEIGHT}px;
    position: relative;
    overflow: hidden;
    background:
      radial-gradient(ellipse at 50% 0%, rgba(232,68,58,0.06) 0%, transparent 60%),
      linear-gradient(180deg, #0c0a09 0%, #080808 40%, #0a0908 100%);
    font-family: ${SF};
  }

  /* ── Skeleton base ── */
  .skel {
    background: linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 100%);
    background-size: 1200px 100%;
    animation: shimmer 1.8s infinite linear;
    transition: opacity 0.6s ease-out;
  }

  /* ── Skeleton layout ── */
  .skel-title {
    position: absolute;
    top: ${SAFE_TOP}px;
    left: 50%;
    transform: translateX(-50%);
    width: 520px;
    height: 44px;
    border-radius: 8px;
  }

  .skel-subtitle {
    position: absolute;
    top: ${SAFE_TOP + 60}px;
    left: 50%;
    transform: translateX(-50%);
    width: 360px;
    height: 28px;
    border-radius: 6px;
  }

  .skel-hero {
    position: absolute;
    top: ${SAFE_TOP + 160}px;
    left: ${SAFE_LEFT}px;
    right: ${WIDTH - SAFE_RIGHT}px;
    height: 520px;
    border-radius: 24px;
  }

  .skel-tagline {
    position: absolute;
    top: 900px;
    left: 50%;
    transform: translateX(-50%);
    width: 700px;
    height: 32px;
    border-radius: 6px;
  }

  .skel-tagline-2 {
    position: absolute;
    top: 948px;
    left: 50%;
    transform: translateX(-50%);
    width: 480px;
    height: 32px;
    border-radius: 6px;
  }

  .skel-card {
    position: absolute;
    width: 290px;
    height: 300px;
    border-radius: 20px;
  }

  .skel-card-1 { left: ${SAFE_LEFT}px; top: 1020px; }
  .skel-card-2 { left: 395px; top: 1020px; }
  .skel-card-3 { left: 730px; top: 1020px; }

  .skel-cta {
    position: absolute;
    top: 1360px;
    left: 50%;
    transform: translateX(-50%);
    width: 720px;
    height: 80px;
    border-radius: 50px;
  }

  .skel-cta-sub {
    position: absolute;
    top: ${HEIGHT - SAFE_BOTTOM - 50}px;
    left: 50%;
    transform: translateX(-50%);
    width: 400px;
    height: 24px;
    border-radius: 4px;
  }

  /* ── Real content ── */
  .real {
    position: absolute;
    opacity: 0;
    transition: none;
  }

  /* Title section */
  .real-title {
    top: ${SAFE_TOP}px;
    left: ${SAFE_LEFT}px; right: ${WIDTH - SAFE_RIGHT}px;
    text-align: center;
  }

  .real-title .brand {
    font-family: Georgia, 'Times New Roman', serif;
    font-style: italic;
    font-size: 82px;
    font-weight: bold;
    color: ${MANILA_COLOR};
    letter-spacing: 0.08em;
    line-height: 1;
    text-shadow: 0 4px 24px rgba(232,68,58,0.4), 0 2px 8px rgba(232,68,58,0.3);
  }

  .real-title .sub {
    font-family: ${SF};
    font-size: 28px;
    font-weight: 700;
    color: rgba(255,255,255,0.95);
    letter-spacing: 0.15em;
    text-transform: uppercase;
    margin-top: 12px;
    text-shadow: 0 2px 12px rgba(0,0,0,0.5);
  }

  /* Hero image container with electricity */
  .real-hero {
    top: ${SAFE_TOP + 160}px;
    left: ${SAFE_LEFT}px;
    right: ${WIDTH - SAFE_RIGHT}px;
    height: 520px;
    border-radius: 24px;
    overflow: visible;
  }

  .hero-inner {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 24px;
    overflow: hidden;
    transform: scale(0.3);
    opacity: 0;
  }

  .hero-inner.expanding {
    animation: photoExpand 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  .hero-inner img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center 20%;
    display: block;
  }

  /* Electricity container — wraps around hero */
  .electricity-wrap {
    position: absolute;
    top: ${SAFE_TOP + 160}px;
    left: ${SAFE_LEFT}px;
    right: ${WIDTH - SAFE_RIGHT}px;
    height: 520px;
    pointer-events: none;
    opacity: 0;
  }

  .electricity-wrap.active {
    opacity: 1;
    transition: opacity 0.2s ease-in;
  }

  .electricity-wrap.fading {
    opacity: 0;
    transition: opacity 0.3s ease-out;
  }

  /* Electric border overlay */
  .electric-border {
    position: absolute;
    top: -4px; left: -4px; right: -4px; bottom: -4px;
    border: 3px dashed #00bfff;
    border-radius: 28px;
    animation: electricBorder 0.3s linear infinite, borderDashCycle 0.6s steps(1) infinite;
  }

  /* Pulsing glow rings */
  .pulse-ring {
    position: absolute;
    top: 50%; left: 50%;
    width: 105%;
    height: 105%;
    border: 2px solid #00bfff;
    border-radius: 28px;
    pointer-events: none;
  }

  .pulse-ring-1 {
    animation: pulseRing1 0.8s ease-in-out infinite;
  }

  .pulse-ring-2 {
    animation: pulseRing2 1.1s ease-in-out infinite;
  }

  .pulse-ring-3 {
    width: 110%;
    height: 110%;
    border: 1px solid rgba(0,191,255,0.4);
    animation: pulseRing3 1.4s ease-in-out infinite;
  }

  /* Corner spark effects */
  .spark {
    position: absolute;
    width: 16px;
    height: 16px;
    background: #fff;
    border-radius: 2px;
  }

  .spark-tl {
    top: -8px; left: -8px;
    animation: sparkTopLeft 0.4s linear infinite;
  }

  .spark-tr {
    top: -8px; right: -8px;
    animation: sparkTopRight 0.35s linear infinite;
  }

  .spark-bl {
    bottom: -8px; left: -8px;
    animation: sparkBottomLeft 0.45s linear infinite;
  }

  .spark-br {
    bottom: -8px; right: -8px;
    animation: sparkBottomRight 0.38s linear infinite;
  }

  /* Energy flash overlay */
  .energy-flash {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: radial-gradient(ellipse at center, rgba(0,191,255,0.3), transparent 70%);
    border-radius: 24px;
    animation: energyFlash 0.5s ease-out forwards;
    pointer-events: none;
  }

  /* Tagline */
  .real-tagline {
    top: 890px;
    left: ${SAFE_LEFT}px; right: ${WIDTH - SAFE_RIGHT}px;
    text-align: center;
  }

  .real-tagline .main-tag {
    font-size: 44px;
    font-weight: 800;
    color: #fff;
    line-height: 1.3;
    letter-spacing: -0.01em;
    text-shadow: 0 2px 16px rgba(0,0,0,0.6);
  }

  .real-tagline .accent {
    color: ${MANILA_COLOR};
    text-shadow: 0 2px 12px rgba(232,68,58,0.4);
  }

  .real-tagline .sub-tag {
    font-size: 30px;
    font-weight: 600;
    color: rgba(255,255,255,0.9);
    margin-top: 8px;
    line-height: 1.4;
    text-shadow: 0 2px 12px rgba(0,0,0,0.5);
  }

  /* Step cards */
  .step-card {
    position: absolute;
    width: 290px;
    height: 300px;
    border-radius: 20px;
    overflow: hidden;
    opacity: 0;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.12);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }

  .step-card .card-photo {
    width: 100%;
    height: 150px;
    object-fit: cover;
    object-position: center 20%;
    display: block;
  }

  .step-card .card-body {
    padding: 20px 22px;
  }

  .step-card .card-num {
    font-size: 16px;
    font-weight: 800;
    color: ${MANILA_COLOR};
    letter-spacing: 0.2em;
    text-transform: uppercase;
    margin-bottom: 8px;
    text-shadow: 0 1px 6px rgba(232,68,58,0.3);
  }

  .step-card .card-text {
    font-size: 28px;
    font-weight: 700;
    color: #fff;
    line-height: 1.25;
    text-shadow: 0 2px 8px rgba(0,0,0,0.4);
  }

  .card-1 { left: ${SAFE_LEFT}px; top: 1020px; }
  .card-2 { left: 395px; top: 1020px; }
  .card-3 { left: 730px; top: 1020px; }

  /* CTA */
  .real-cta {
    top: 1360px;
    left: ${SAFE_LEFT}px; right: ${WIDTH - SAFE_RIGHT}px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 18px;
  }

  .cta-btn {
    width: 720px;
    height: 80px;
    border-radius: 50px;
    background: ${MANILA_COLOR};
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    box-shadow: 0 6px 32px rgba(232,68,58,0.3);
  }

  .cta-btn span {
    font-size: 38px;
    font-weight: 900;
    color: #fff;
    letter-spacing: 0.5px;
    text-shadow: 0 2px 8px rgba(0,0,0,0.3);
  }

  .cta-handle {
    font-size: 32px;
    font-weight: 700;
    color: rgba(255,255,255,0.95);
    letter-spacing: 0.02em;
    opacity: 0;
    text-shadow: 0 2px 12px rgba(0,0,0,0.5);
  }

  /* CTA electricity glow */
  @keyframes ctaElectricGlow {
    0%, 100% {
      box-shadow: 0 0 10px rgba(0,191,255,0.3), 0 0 20px rgba(0,191,255,0.15), 0 6px 32px rgba(232,68,58,0.3);
    }
    25% {
      box-shadow: 0 0 20px rgba(0,191,255,0.5), 0 0 40px rgba(0,191,255,0.25), 0 6px 32px rgba(232,68,58,0.4);
    }
    50% {
      box-shadow: 0 0 15px rgba(255,255,255,0.4), 0 0 30px rgba(0,191,255,0.3), 0 6px 32px rgba(232,68,58,0.3);
    }
    75% {
      box-shadow: 0 0 25px rgba(0,229,255,0.5), 0 0 50px rgba(0,191,255,0.2), 0 6px 32px rgba(232,68,58,0.4);
    }
  }

  .accent-line { display: none; }
</style>
</head>
<body>
  <div class="page">

    <!-- ── Skeleton Layer ── -->
    <div class="skel skel-title" id="sk-title"></div>
    <div class="skel skel-subtitle" id="sk-subtitle"></div>
    <div class="skel skel-hero" id="sk-hero"></div>
    <div class="skel skel-tagline" id="sk-tag1"></div>
    <div class="skel skel-tagline-2" id="sk-tag2"></div>
    <div class="skel skel-card skel-card-1" id="sk-c1"></div>
    <div class="skel skel-card skel-card-2" id="sk-c2"></div>
    <div class="skel skel-card skel-card-3" id="sk-c3"></div>
    <div class="skel skel-cta" id="sk-cta"></div>
    <div class="skel skel-cta-sub" id="sk-cta-sub"></div>

    <!-- ── Real Content Layer ── -->

    <!-- Title -->
    <div class="real real-title" id="r-title">
      <div class="brand">MANILA</div>
      <div class="sub">free photo shoot</div>
    </div>

    <!-- Accent line -->
    <div class="accent-line" id="r-accent"></div>

    <!-- Electricity wrapper (sits behind/around hero) -->
    <div class="electricity-wrap" id="elec-wrap">
      <div class="electric-border"></div>
      <div class="pulse-ring pulse-ring-1"></div>
      <div class="pulse-ring pulse-ring-2"></div>
      <div class="pulse-ring pulse-ring-3"></div>
      <div class="spark spark-tl"></div>
      <div class="spark spark-tr"></div>
      <div class="spark spark-bl"></div>
      <div class="spark spark-br"></div>
    </div>

    <!-- Hero image with expand effect -->
    <div class="real real-hero" id="r-hero">
      <div class="hero-inner" id="hero-inner">
        <img src="${imageDataMap[PHOTOS[0]]}" id="hero-img" />
      </div>
    </div>

    <!-- Tagline -->
    <div class="real real-tagline" id="r-tagline">
      <p class="main-tag">Professional photos. <span class="accent">Totally free.</span></p>
      <p class="sub-tag">No experience needed.</p>
    </div>

    <!-- Step cards with photo thumbnails -->
    <div class="step-card card-1" id="c1">
      <img class="card-photo" src="${imageDataMap[PHOTOS[1]]}" />
      <div class="card-body">
        <div class="card-num">Step 1</div>
        <div class="card-text">DM me on Instagram</div>
      </div>
    </div>

    <div class="step-card card-2" id="c2">
      <img class="card-photo" src="${imageDataMap[PHOTOS[2]]}" />
      <div class="card-body">
        <div class="card-num">Step 2</div>
        <div class="card-text">Show up to the shoot</div>
      </div>
    </div>

    <div class="step-card card-3" id="c3">
      <img class="card-photo" src="${imageDataMap[PHOTOS[3]]}" />
      <div class="card-body">
        <div class="card-num">Step 3</div>
        <div class="card-text">Get your photos</div>
      </div>
    </div>

    <!-- CTA -->
    <div class="real real-cta" id="r-cta">
      <div class="cta-btn" id="cta-btn">
        <span>dm me if interested!!</span>
      </div>
      <div class="cta-handle" id="cta-handle">@madebyaidan on Instagram</div>
    </div>

  </div>

  <script>
    // Hero image sources (built without template literals to avoid nested backtick bug)
    ${heroSrcArray}
    var hIdx = 0;

    function fade(id, delay, dir) {
      setTimeout(function() {
        var el = document.getElementById(id);
        if (!el) return;
        el.style.transition = 'opacity 0.6s ease-out';
        el.style.opacity = dir === 'in' ? '1' : '0';
      }, delay);
    }

    function reveal(id, delay, anim) {
      setTimeout(function() {
        var el = document.getElementById(id);
        if (!el) return;
        el.style.animation = anim + ' 0.7s cubic-bezier(0.16,1,0.3,1) forwards';
      }, delay);
    }

    function triggerExpand() {
      var inner = document.getElementById('hero-inner');
      var elecWrap = document.getElementById('elec-wrap');
      if (!inner || !elecWrap) return;

      // Reset for re-expand
      inner.classList.remove('expanding');
      inner.style.transform = 'scale(0.3)';
      inner.style.opacity = '0';

      // Remove old flash if any
      var oldFlash = document.querySelector('.energy-flash');
      if (oldFlash) oldFlash.remove();

      // Force reflow
      void inner.offsetWidth;

      // Show electricity
      elecWrap.classList.remove('fading');
      elecWrap.classList.add('active');

      // Start expand
      inner.classList.add('expanding');

      // Add energy flash
      var flash = document.createElement('div');
      flash.className = 'energy-flash';
      inner.appendChild(flash);

      // Remove flash after animation
      setTimeout(function() {
        if (flash.parentNode) flash.parentNode.removeChild(flash);
      }, 600);
    }

    function cycleHeroExpand() {
      var inner = document.getElementById('hero-inner');
      var elecWrap = document.getElementById('elec-wrap');
      var img = document.getElementById('hero-img');
      if (!inner || !img || !elecWrap) return;

      // Fade electricity out briefly
      elecWrap.classList.remove('active');
      elecWrap.classList.add('fading');

      // Shrink current photo
      inner.classList.remove('expanding');
      inner.style.transition = 'transform 0.3s ease-in, opacity 0.3s ease-in';
      inner.style.transform = 'scale(0.3)';
      inner.style.opacity = '0';

      setTimeout(function() {
        // Swap image
        hIdx = (hIdx + 1) % heroSrcs.length;
        img.src = heroSrcs[hIdx];
        inner.style.transition = 'none';

        // Small delay then expand with electricity
        setTimeout(function() {
          triggerExpand();
        }, 100);
      }, 350);
    }

    // ── Phase 1 (0-3s): Skeleton shimmer ──
    // (skeleton elements animate via CSS)

    // ── Phase 2 (3s): Title + Hero expand with electricity ──
    fade('sk-title', 3000, 'out');
    fade('sk-subtitle', 3200, 'out');
    reveal('r-title', 3200, 'revealUp');
    reveal('r-accent', 3600, 'revealUp');

    fade('sk-hero', 3800, 'out');

    // Show hero container, then trigger expand
    setTimeout(function() {
      var hero = document.getElementById('r-hero');
      if (hero) hero.style.opacity = '1';
      triggerExpand();
    }, 4000);

    // ── Phase 2b (5.5s): Tagline ──
    fade('sk-tag1', 5500, 'out');
    fade('sk-tag2', 5700, 'out');
    reveal('r-tagline', 5800, 'revealUp');

    // ── Phase 3 (7-18s): Photo cycling with expand+electricity, every 2.5s ──
    setTimeout(function() {
      setInterval(cycleHeroExpand, 2500);
    }, 7000);

    // ── Step cards (staggered entrance during phase 3) ──
    fade('sk-c1', 7500, 'out');
    reveal('c1', 7700, 'revealUp');

    fade('sk-c2', 9200, 'out');
    reveal('c2', 9400, 'revealUp');

    fade('sk-c3', 10900, 'out');
    reveal('c3', 11100, 'revealUp');

    // ── Phase 4 (18s): CTA ──
    fade('sk-cta', 18000, 'out');
    fade('sk-cta-sub', 18200, 'out');
    fade('r-cta', 18400, 'in');

    setTimeout(function() {
      var btn = document.getElementById('cta-btn');
      if (btn) {
        btn.style.transition = 'opacity 0.6s ease-out, transform 0.6s cubic-bezier(0.16,1,0.3,1)';
        btn.style.opacity = '1';
        btn.style.transform = 'scale(1)';
      }
    }, 18600);

    setTimeout(function() {
      var h = document.getElementById('cta-handle');
      if (h) {
        h.style.transition = 'opacity 0.5s ease-out';
        h.style.opacity = '1';
      }
    }, 19400);

    // Pulse CTA with electric glow
    setTimeout(function() {
      var btn = document.getElementById('cta-btn');
      if (btn) btn.style.animation = 'ctaElectricGlow 1.2s ease-in-out infinite';
    }, 20000);
  </script>
</body>
</html>`;
}

async function render() {
  resetOutputDir()

  const imageDataMap = {}
  for (const photo of PHOTOS) {
    imageDataMap[photo] = readImage(photo)
  }

  writeSources({
    createdAt: new Date().toISOString(),
    strategy: 'v76c — photo expand with electricity/energy effect around hero image',
    safeBottomPixels: SAFE_BOTTOM,
    photos: PHOTOS,
  })

  const { execSync } = await import('child_process')
  const browser = await chromium.launch()

  console.log('Recording photo expand + electricity Manila animation (18c)...')

  const videoCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: OUT_DIR,
      size: { width: WIDTH, height: HEIGHT },
    },
  })

  const videoPage = await videoCtx.newPage()

  await videoPage.evaluate(() => {
    document.documentElement.style.background = '#0a0a0a'
    document.body.style.background = '#0a0a0a'
  })

  const html = buildHTML(imageDataMap)
  await videoPage.setContent(html, { waitUntil: 'load' })
  await videoPage.waitForTimeout(TOTAL_DURATION_MS)

  await videoPage.close()
  await videoCtx.close()
  await browser.close()

  const videoFiles = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.webm'))
  if (videoFiles.length === 0) {
    console.error('No video file was generated!')
    return
  }

  const srcVideo = path.join(OUT_DIR, videoFiles[0])
  const finalMp4 = path.join(OUT_DIR, '01_skeleton_expand_electricity.mp4')

  try {
    execSync('ffmpeg -y -i "' + srcVideo + '" -c:v libx264 -pix_fmt yuv420p -r 30 -an "' + finalMp4 + '"', { stdio: 'pipe' })
    fs.unlinkSync(srcVideo)
    console.log('Rendered 01_skeleton_expand_electricity.mp4')
  } catch (err) {
    console.error('ffmpeg error:', err.message)
    fs.renameSync(srcVideo, finalMp4)
  }

  console.log('Done: output written to ' + OUT_DIR)
}

render().catch(error => {
  console.error(error)
  process.exit(1)
})
