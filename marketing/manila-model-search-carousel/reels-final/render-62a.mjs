import { chromium } from 'playwright';
import { execSync } from 'child_process';
import { mkdirSync, rmSync, existsSync, readFileSync, writeFileSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

var __dirname = path.dirname(fileURLToPath(import.meta.url));
var OUT_DIR = path.join(__dirname, 'output-62a');

var W = 1080;
var H = 1920;
var FPS = 30;

var FILM_SCANS_DIR = '/Volumes/PortableSSD/Exports/film scans';
var PHOTO_NAMES = [
  'DSC_0243.jpg',
  'DSC_0255.jpg',
  'DSC_0258.jpg',
  'DSC_0260.jpg',
  'DSC_0270.jpg',
  'DSC_0274-2.jpg',
  'DSC_0276.jpg',
  'DSC_0281.jpg',
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
  // Build photo img tags with data URIs
  var photoImgTags = PHOTO_NAMES.map(function(name, i) {
    return '<img id="photo-' + i + '" src="' + imageDataMap[name] + '" style="width:100%;height:100%;object-fit:cover;display:block;" />';
  }).join('\n');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=UnifrakturMaguntia&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    margin: 0; padding: 0;
    background: #f4f0e0;
    font-family: Georgia, 'Times New Roman', Times, serif;
    overflow: hidden;
  }

  /* Paper texture via CSS noise */
  @keyframes none {}

  .paper-texture {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background-image:
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23noise)' opacity='0.06'/%3E%3C/svg%3E");
    opacity: 0.5;
    z-index: 200;
    mix-blend-mode: multiply;
  }

  /* Aged paper edge vignette */
  .paper-edge {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: radial-gradient(ellipse at center, transparent 70%, rgba(180,160,100,0.25) 100%);
    z-index: 201;
  }

  /* Ink print effect */
  @keyframes stampIn {
    0% { transform: scale(1.15); filter: blur(3px); opacity: 0; }
    40% { transform: scale(0.98); filter: blur(0.5px); opacity: 1; }
    60% { transform: scale(1.01); filter: blur(0px); }
    100% { transform: scale(1); filter: blur(0px); opacity: 1; }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideInLeft {
    from { transform: translateX(-40px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  @keyframes typewriter {
    from { width: 0; }
    to { width: 100%; }
  }

  @keyframes scanlineWipe {
    from { transform: translateX(-100%); }
    to { transform: translateX(0); }
  }

  @keyframes breakingSlide {
    from { transform: translateX(-110%); }
    to { transform: translateX(0); }
  }

  @keyframes blinkCursor {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  /* Halftone dot overlay */
  .halftone {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background-image: radial-gradient(circle, rgba(0,0,0,0.85) 1.5px, transparent 1.5px);
    background-size: 6px 6px;
    mix-blend-mode: multiply;
    z-index: 5;
    transition: opacity 1.2s ease;
  }

  .photo-cell {
    position: relative;
    overflow: hidden;
    background: #888;
  }

  .photo-cell img {
    transition: filter 1.4s ease;
  }

  .photo-cell.bw img {
    filter: grayscale(100%) contrast(1.1);
  }

  .photo-cell.color img {
    filter: grayscale(0%) contrast(1.0);
  }

  /* Horizontal rule */
  .rule {
    width: 100%;
    height: 2px;
    background: #111;
    margin: 0;
  }

  .rule-thin {
    width: 100%;
    height: 1px;
    background: #444;
    margin: 0;
  }

  .rule-double {
    width: 100%;
    border-top: 3px solid #111;
    border-bottom: 1px solid #111;
    padding-top: 3px;
    margin: 0;
  }

  /* Column separator */
  .col-sep {
    width: 1px;
    background: #555;
    flex-shrink: 0;
  }

  /* Masthead */
  .masthead-title {
    font-family: 'UnifrakturMaguntia', 'Times New Roman', Georgia, serif;
    font-size: 86px;
    font-weight: 400;
    color: #111;
    text-align: center;
    letter-spacing: 2px;
    line-height: 1;
    text-shadow: 2px 2px 0 rgba(0,0,0,0.15);
  }

  .dateline {
    font-family: Georgia, serif;
    font-size: 22px;
    color: #333;
    text-align: center;
    letter-spacing: 3px;
    text-transform: uppercase;
    margin: 4px 0;
  }

  /* Headlines */
  .headline-main {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 74px;
    font-weight: 700;
    color: #0a0a0a;
    line-height: 1.0;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: -1px;
  }

  .headline-sub {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 30px;
    font-weight: 400;
    color: #222;
    text-align: center;
    font-style: italic;
    letter-spacing: 0.5px;
    margin-top: 10px;
  }

  /* Section header */
  .section-header {
    font-family: Georgia, serif;
    font-size: 36px;
    font-weight: 700;
    color: #0a0a0a;
    text-transform: uppercase;
    letter-spacing: 4px;
    text-align: center;
    padding: 8px 0;
  }

  /* Caption */
  .photo-caption {
    font-family: Georgia, serif;
    font-size: 21px;
    color: #333;
    font-style: italic;
    text-align: center;
    padding: 6px 8px;
    background: #f4f0e0;
    border-top: 1px solid #aaa;
    line-height: 1.3;
  }

  .photo-counter {
    font-family: Georgia, serif;
    font-size: 18px;
    color: #666;
    text-align: right;
    font-style: italic;
    padding: 2px 8px;
  }

  /* Body text */
  .body-text {
    font-family: Georgia, serif;
    font-size: 22px;
    color: #111;
    line-height: 1.55;
  }

  /* Classified box */
  .classified-box {
    border: 2px solid #111;
    outline: 3px solid #111;
    outline-offset: 3px;
    padding: 28px 32px;
    margin: 0 24px;
    background: #f4f0e0;
    text-align: center;
    position: relative;
  }

  .classified-title {
    font-family: Georgia, serif;
    font-size: 28px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 5px;
    color: #111;
    border-bottom: 1px solid #111;
    padding-bottom: 8px;
    margin-bottom: 12px;
  }

  .classified-line {
    font-family: Georgia, serif;
    font-size: 26px;
    color: #111;
    line-height: 1.7;
  }

  /* Breaking banner */
  .breaking-banner {
    background: #111;
    color: #f4f0e0;
    font-family: Georgia, serif;
    font-size: 38px;
    font-weight: 700;
    letter-spacing: 4px;
    text-transform: uppercase;
    padding: 14px 32px;
    white-space: nowrap;
    position: absolute;
    left: 0; right: 0;
    z-index: 60;
  }

  /* Breaking takeover */
  .breaking-takeover {
    position: absolute;
    inset: 0;
    background: #f4f0e0;
    z-index: 55;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 50px;
  }

  /* Typewriter line */
  .tw-line {
    overflow: hidden;
    white-space: nowrap;
    display: block;
  }

  /* Step lines */
  .step-text {
    font-family: Georgia, serif;
    font-size: 27px;
    color: #111;
    line-height: 1.5;
    padding: 4px 0;
  }

  .step-num {
    font-weight: 700;
    font-style: italic;
    color: #111;
    font-size: 29px;
  }
</style>
</head>
<body>
<div id="root" style="width:${W}px;height:${H}px;position:relative;overflow:hidden;background:#f4f0e0;">

  <!-- Paper texture overlay -->
  <div class="paper-texture"></div>
  <div class="paper-edge"></div>

  <!-- === PHOTO DATA (hidden, referenced by JS) === -->
  <div id="photo-store" style="display:none;">
    ${photoImgTags}
  </div>

  <!-- ========== MAIN NEWSPAPER PAGE ========== -->
  <div id="newspaper" style="position:absolute;inset:0;padding:30px 36px 30px;display:flex;flex-direction:column;gap:0;opacity:0;">

    <!-- MASTHEAD AREA -->
    <div id="masthead" style="opacity:0;text-align:center;padding-bottom:0;">
      <div id="paper-name" class="masthead-title" style="opacity:0;">The Manila Times</div>
      <div id="dateline" class="dateline" style="opacity:0;">Manila, Philippines · Vol. LXII No. 1 · Free Photo Edition</div>
    </div>

    <div id="rule-masthead" style="opacity:0;" class="rule-double" style="margin-top:6px;margin-bottom:6px;"></div>

    <!-- HEADLINE SECTION -->
    <div id="headline-block" style="opacity:0;padding:18px 0 12px;">
      <div id="headline-main" class="headline-main" style="opacity:0;">Free Photo Shoot<br>Offered To All</div>
      <div id="headline-sub" class="headline-sub" style="opacity:0;">"No experience needed," say organizers</div>
    </div>

    <div id="rule-hl" style="opacity:0;" class="rule"></div>

    <!-- LEAD PHOTO BLOCK (Photo 1) -->
    <div id="lead-photo-block" style="opacity:0;display:flex;flex-direction:column;gap:0;margin-top:10px;">
      <div id="photo-0-cell" class="photo-cell bw" style="width:100%;height:400px;overflow:hidden;position:relative;">
        <div class="halftone" id="halftone-0"></div>
        <img id="disp-photo-0" style="width:100%;height:100%;object-fit:cover;display:block;" />
      </div>
      <div class="photo-caption" id="caption-0">Participants from recent Manila sessions — all first-time subjects</div>
      <div class="photo-counter" id="counter-0">Photo 1 of 8</div>
    </div>

    <!-- GRID PHOTOS SECTION (Photos 2-8) -->
    <div id="grid-section" style="display:flex;flex-direction:column;gap:0;margin-top:8px;opacity:0;">

      <!-- Row 1: Full width photo 2 -->
      <div id="photo-1-wrap" style="opacity:0;display:flex;flex-direction:column;gap:0;">
        <div id="photo-1-cell" class="photo-cell bw" style="width:100%;height:300px;overflow:hidden;position:relative;">
          <div class="halftone" id="halftone-1"></div>
          <img id="disp-photo-1" style="width:100%;height:100%;object-fit:cover;display:block;" />
        </div>
        <div class="photo-caption">The streets of Manila — natural backdrops, no studio required</div>
        <div class="photo-counter">Photo 2 of 8</div>
      </div>

      <!-- Row 2: Two-column photos 3+4 -->
      <div id="photo-23-wrap" style="opacity:0;display:flex;flex-direction:row;gap:0;height:280px;margin-top:6px;">
        <div style="flex:1;display:flex;flex-direction:column;">
          <div id="photo-2-cell" class="photo-cell bw" style="flex:1;overflow:hidden;position:relative;">
            <div class="halftone" id="halftone-2"></div>
            <img id="disp-photo-2" style="width:100%;height:100%;object-fit:cover;display:block;" />
          </div>
          <div class="photo-counter" style="font-size:16px;padding:2px 6px;">Photo 3 of 8</div>
        </div>
        <div class="col-sep"></div>
        <div style="flex:1;display:flex;flex-direction:column;">
          <div id="photo-3-cell" class="photo-cell bw" style="flex:1;overflow:hidden;position:relative;">
            <div class="halftone" id="halftone-3"></div>
            <img id="disp-photo-3" style="width:100%;height:100%;object-fit:cover;display:block;" />
          </div>
          <div class="photo-counter" style="font-size:16px;padding:2px 6px;">Photo 4 of 8</div>
        </div>
      </div>

      <!-- Row 3: Two-column photos 5+6 -->
      <div id="photo-45-wrap" style="opacity:0;display:flex;flex-direction:row;gap:0;height:280px;margin-top:6px;">
        <div style="flex:1;display:flex;flex-direction:column;">
          <div id="photo-4-cell" class="photo-cell bw" style="flex:1;overflow:hidden;position:relative;">
            <div class="halftone" id="halftone-4"></div>
            <img id="disp-photo-4" style="width:100%;height:100%;object-fit:cover;display:block;" />
          </div>
          <div class="photo-counter" style="font-size:16px;padding:2px 6px;">Photo 5 of 8</div>
        </div>
        <div class="col-sep"></div>
        <div style="flex:1;display:flex;flex-direction:column;">
          <div id="photo-5-cell" class="photo-cell bw" style="flex:1;overflow:hidden;position:relative;">
            <div class="halftone" id="halftone-5"></div>
            <img id="disp-photo-5" style="width:100%;height:100%;object-fit:cover;display:block;" />
          </div>
          <div class="photo-counter" style="font-size:16px;padding:2px 6px;">Photo 6 of 8</div>
        </div>
      </div>

      <!-- Row 4: Full-width photo 7 -->
      <div id="photo-6-wrap" style="opacity:0;display:flex;flex-direction:column;gap:0;margin-top:6px;">
        <div id="photo-6-cell" class="photo-cell bw" style="width:100%;height:260px;overflow:hidden;position:relative;">
          <div class="halftone" id="halftone-6"></div>
          <img id="disp-photo-6" style="width:100%;height:100%;object-fit:cover;display:block;" />
        </div>
        <div class="photo-caption">Golden hour in Intramuros — locations chosen for each subject</div>
        <div class="photo-counter">Photo 7 of 8</div>
      </div>

      <!-- Row 5: Full-width photo 8 -->
      <div id="photo-7-wrap" style="opacity:0;display:flex;flex-direction:column;gap:0;margin-top:6px;">
        <div id="photo-7-cell" class="photo-cell bw" style="width:100%;height:260px;overflow:hidden;position:relative;">
          <div class="halftone" id="halftone-7"></div>
          <img id="disp-photo-7" style="width:100%;height:100%;object-fit:cover;display:block;" />
        </div>
        <div class="photo-caption">Film photography — delivered digitally in full resolution</div>
        <div class="photo-counter">Photo 8 of 8</div>
      </div>
    </div>

    <!-- HOW TO APPLY SECTION -->
    <div id="apply-section" style="opacity:0;margin-top:12px;">
      <div class="rule-double" style="margin-bottom:8px;"></div>
      <div class="section-header">How To Apply</div>
      <div class="rule-thin" style="margin-bottom:10px;"></div>
      <div id="step-1" style="opacity:0;" class="step-text"><span class="step-num">Step 1:</span> Send a DM to @madebyaidan on Instagram</div>
      <div id="step-2" style="opacity:0;" class="step-text"><span class="step-num">Step 2:</span> Choose a date and location together</div>
      <div id="step-3" style="opacity:0;" class="step-text"><span class="step-num">Step 3:</span> Show up. Photographer guides the session.</div>
    </div>

    <!-- CLASSIFIED SECTION -->
    <div id="classified-section" style="opacity:0;margin-top:16px;">
      <div class="rule-double" style="margin-bottom:10px;"></div>
      <div class="section-header" style="font-size:28px;letter-spacing:8px;margin-bottom:10px;">Classifieds</div>
      <div class="classified-box" id="classified-box" style="opacity:0;">
        <div class="classified-title">Free Photo Shoot</div>
        <div class="classified-line">@madebyaidan</div>
        <div class="classified-line">DM on Instagram</div>
        <div class="classified-line" style="font-style:italic;font-size:22px;color:#444;">Limited spots available</div>
      </div>
    </div>

  </div><!-- end #newspaper -->

  <!-- BREAKING BANNER (slides in) -->
  <div id="breaking-banner" class="breaking-banner" style="top:540px;transform:translateX(-110%);opacity:1;">
    &#9654; BREAKING: Free Shoot Available Now &nbsp;&nbsp;&nbsp; &#9654; BREAKING: Free Shoot Available Now &nbsp;&nbsp;&nbsp;
  </div>

  <!-- BREAKING TAKEOVER -->
  <div id="breaking-takeover" class="breaking-takeover" style="opacity:0;pointer-events:none;">
    <div style="border-top:4px solid #111;border-bottom:4px solid #111;padding:16px 0;margin-bottom:36px;width:100%;text-align:center;">
      <div style="font-family:Georgia,serif;font-size:34px;font-weight:700;letter-spacing:8px;text-transform:uppercase;color:#111;">Breaking News</div>
    </div>

    <div style="font-family:Georgia,'Times New Roman',serif;font-size:100px;font-weight:700;color:#111;text-align:center;line-height:1;letter-spacing:-2px;text-transform:uppercase;">
      @made<br>by<br>aidan
    </div>

    <div style="width:100%;border-top:2px solid #111;margin:30px 0;"></div>

    <div style="font-family:Georgia,serif;font-size:38px;font-weight:400;font-style:italic;color:#111;text-align:center;margin-bottom:14px;">
      Free photo shoot in Manila
    </div>

    <div style="font-family:Georgia,serif;font-size:28px;color:#444;text-align:center;letter-spacing:2px;margin-bottom:40px;">
      No experience necessary
    </div>

    <div style="background:#111;padding:28px 56px;display:inline-block;">
      <div style="font-family:Georgia,serif;font-size:44px;font-weight:700;color:#f4f0e0;letter-spacing:4px;text-transform:uppercase;">DM ME</div>
    </div>

    <div style="font-family:Georgia,serif;font-size:22px;color:#666;text-align:center;margin-top:20px;font-style:italic;">
      on Instagram · @madebyaidan
    </div>

    <div style="width:100%;border-top:1px solid #999;margin-top:40px;padding-top:14px;text-align:center;">
      <div style="font-family:Georgia,serif;font-size:18px;color:#888;letter-spacing:3px;text-transform:uppercase;">The Manila Times · Special Edition</div>
    </div>
  </div>

</div><!-- end #root -->

<script>
  // Preload all photos into display slots
  (function() {
    var names = ${JSON.stringify(PHOTO_NAMES)};
    for (var i = 0; i < names.length; i++) {
      var src = document.getElementById('photo-' + i);
      var dst = document.getElementById('disp-photo-' + i);
      if (src && dst) {
        dst.src = src.src;
      }
    }
  })();

  // Easing helpers
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function easeInOut(t) { return t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t+2,2)/2; }
  function clamp01(t) { return Math.max(0, Math.min(1, t)); }
  function progress(t, start, end) { return clamp01((t - start) / (end - start)); }

  // Stamp-in effect: scale + blur
  function stampIn(el, p) {
    // p: 0..1
    var scale = 1.15 - 0.15 * easeOut(p);
    var blur = 3 * (1 - easeOut(p));
    var opacity = Math.min(1, p * 3);
    el.style.transform = 'scale(' + scale + ')';
    el.style.filter = blur > 0.1 ? 'blur(' + blur.toFixed(2) + 'px)' : '';
    el.style.opacity = opacity;
  }

  // Slide-in from left
  function slideInFromLeft(el, p) {
    var x = -60 * (1 - easeOut(p));
    el.style.transform = 'translateX(' + x.toFixed(1) + 'px)';
    el.style.opacity = Math.min(1, p * 2);
  }

  // Photo B&W -> Color + halftone fade
  function setPhotoColorProgress(photoIdx, p) {
    var cell = document.getElementById('photo-' + photoIdx + '-cell');
    var halftone = document.getElementById('halftone-' + photoIdx);
    var img = document.getElementById('disp-photo-' + photoIdx);
    if (!cell || !halftone || !img) return;

    var gray = 100 * (1 - p);
    img.style.filter = 'grayscale(' + gray.toFixed(0) + '%) contrast(' + (1.1 - 0.1*p).toFixed(2) + ')';
    halftone.style.opacity = (1 - p).toFixed(3);
  }

  // Typewriter reveal
  function typewriterReveal(el, p) {
    if (!el) return;
    var text = el.getAttribute('data-text') || el.textContent;
    if (!el.getAttribute('data-text')) el.setAttribute('data-text', text);
    // We'll use clip-path approach: just set opacity and overflow clip
    var charsTotal = text.length;
    var charsShow = Math.floor(p * charsTotal);
    // Use inner span trick
    el.style.opacity = p > 0 ? '1' : '0';
    if (!el.querySelector('.tw-inner')) {
      var inner = document.createElement('span');
      inner.className = 'tw-inner';
      inner.style.display = 'inline';
      el.appendChild(inner);
    }
    // Show partial text by using character slicing
    el.innerHTML = text.slice(0, charsShow) + (p < 1 ? '<span style="display:inline-block;width:2px;height:1em;background:#111;animation:blinkCursor 0.6s step-end infinite;vertical-align:text-bottom;margin-left:1px;"></span>' : '');
  }

  // ─── TIMELINE DEFINITION ────────────────────────────────────────────────────
  // Each entry: { time, endTime, fn(t, localP) }
  // fn is called every frame; localP is 0..1 within the entry's time range

  function __applyUpTo(t) {
    var newspaper = document.getElementById('newspaper');
    var masthead = document.getElementById('masthead');
    var paperName = document.getElementById('paper-name');
    var dateline = document.getElementById('dateline');
    var ruleMasthead = document.getElementById('rule-masthead');
    var headlineBlock = document.getElementById('headline-block');
    var headlineMain = document.getElementById('headline-main');
    var headlineSub = document.getElementById('headline-sub');
    var ruleHl = document.getElementById('rule-hl');
    var leadPhotoBlock = document.getElementById('lead-photo-block');
    var gridSection = document.getElementById('grid-section');
    var applySection = document.getElementById('apply-section');
    var step1 = document.getElementById('step-1');
    var step2 = document.getElementById('step-2');
    var step3 = document.getElementById('step-3');
    var classifiedSection = document.getElementById('classified-section');
    var classifiedBox = document.getElementById('classified-box');
    var breakingBanner = document.getElementById('breaking-banner');
    var breakingTakeover = document.getElementById('breaking-takeover');

    // Reset step text content each frame (typewriter)
    var stepTexts = {
      'step-1': 'Step 1: Send a DM to @madebyaidan on Instagram',
      'step-2': 'Step 2: Choose a date and location together',
      'step-3': 'Step 3: Show up. Photographer guides the session.',
    };

    // ── 0–2s: Paper appears, masthead stamps in ──────────────────────────
    if (t >= 0) {
      newspaper.style.opacity = clamp01((t - 0) / 0.3).toFixed(3);
    }

    // Paper name stamp: 0.2 → 1.2s
    if (t >= 0.2) {
      masthead.style.opacity = '1';
      var p = progress(t, 0.2, 1.2);
      stampIn(paperName, p);
    }

    // Dateline fade in: 1.0 → 1.6s
    if (t >= 1.0) {
      var p = progress(t, 1.0, 1.6);
      dateline.style.opacity = easeOut(p).toFixed(3);
    }

    // Rule below masthead: 1.3 → 1.8s
    if (t >= 1.3) {
      var p = progress(t, 1.3, 1.8);
      ruleMasthead.style.opacity = easeOut(p).toFixed(3);
    }

    // ── 2–4s: Main headline slams in ────────────────────────────────────
    if (t >= 2.0) {
      headlineBlock.style.opacity = '1';
      var p = progress(t, 2.0, 2.7);
      stampIn(headlineMain, p);
    }

    // Subhead: 2.8 → 3.5s
    if (t >= 2.8) {
      var p = progress(t, 2.8, 3.5);
      headlineSub.style.opacity = easeOut(p).toFixed(3);
    }

    // Rule below headline: 3.2 → 3.6s
    if (t >= 3.2) {
      var p = progress(t, 3.2, 3.6);
      ruleHl.style.opacity = easeOut(p).toFixed(3);
    }

    // ── 4–6s: Lead photo appears ─────────────────────────────────────────
    if (t >= 4.0) {
      var p = progress(t, 4.0, 5.2);
      var fade = easeOut(p);
      leadPhotoBlock.style.opacity = fade.toFixed(3);

      // B&W → color transition for photo 0: starts at 4.5s, ends at 6.0s
      var colorP = progress(t, 4.5, 6.0);
      setPhotoColorProgress(0, colorP);
    }

    // ── 6–14s: Grid photos appear one by one ────────────────────────────
    if (t >= 6.0) {
      gridSection.style.opacity = '1';
    }

    // Photo 1 (full-width): 6.0 → 6.8s
    var photo1Wrap = document.getElementById('photo-1-wrap');
    if (t >= 6.0 && photo1Wrap) {
      var p = progress(t, 6.0, 6.8);
      stampIn(photo1Wrap, p);
      var colorP = progress(t, 6.4, 7.8);
      setPhotoColorProgress(1, colorP);
    }

    // Photos 2+3 (pair row): 7.0 → 7.8s
    var photo23Wrap = document.getElementById('photo-23-wrap');
    if (t >= 7.0 && photo23Wrap) {
      var p = progress(t, 7.0, 7.8);
      stampIn(photo23Wrap, p);
      var colorP = progress(t, 7.4, 8.8);
      setPhotoColorProgress(2, colorP);
      setPhotoColorProgress(3, colorP);
    }

    // Photos 4+5 (pair row): 8.0 → 8.8s
    var photo45Wrap = document.getElementById('photo-45-wrap');
    if (t >= 8.0 && photo45Wrap) {
      var p = progress(t, 8.0, 8.8);
      stampIn(photo45Wrap, p);
      var colorP = progress(t, 8.4, 9.8);
      setPhotoColorProgress(4, colorP);
      setPhotoColorProgress(5, colorP);
    }

    // Photo 6 (full-width): 9.5 → 10.3s
    var photo6Wrap = document.getElementById('photo-6-wrap');
    if (t >= 9.5 && photo6Wrap) {
      var p = progress(t, 9.5, 10.3);
      stampIn(photo6Wrap, p);
      var colorP = progress(t, 9.9, 11.2);
      setPhotoColorProgress(6, colorP);
    }

    // Photo 7 (full-width): 10.5 → 11.3s
    var photo7Wrap = document.getElementById('photo-7-wrap');
    if (t >= 10.5 && photo7Wrap) {
      var p = progress(t, 10.5, 11.3);
      stampIn(photo7Wrap, p);
      var colorP = progress(t, 10.9, 12.2);
      setPhotoColorProgress(7, colorP);
    }

    // ── 14–16s: "How To Apply" section ──────────────────────────────────
    if (t >= 14.0) {
      var p = progress(t, 14.0, 14.5);
      applySection.style.opacity = easeOut(p).toFixed(3);
    }

    // Typewriter steps
    if (t >= 14.5 && step1) {
      var fullText = 'Step 1: Send a DM to @madebyaidan on Instagram';
      var p = progress(t, 14.5, 15.4);
      var chars = Math.floor(p * fullText.length);
      step1.style.opacity = '1';
      step1.innerHTML = '<span class="step-num">Step 1:</span> ' + fullText.slice(7, chars) +
        (chars < fullText.length ? '<span style="display:inline-block;width:2px;height:1em;background:#111;vertical-align:text-bottom;margin-left:1px;"></span>' : '');
    }

    if (t >= 15.2 && step2) {
      var fullText = 'Step 2: Choose a date and location together';
      var p = progress(t, 15.2, 15.9);
      var chars = Math.floor(p * fullText.length);
      step2.style.opacity = '1';
      step2.innerHTML = '<span class="step-num">Step 2:</span> ' + fullText.slice(7, chars) +
        (chars < fullText.length ? '<span style="display:inline-block;width:2px;height:1em;background:#111;vertical-align:text-bottom;margin-left:1px;"></span>' : '');
    }

    if (t >= 15.7 && step3) {
      var fullText = 'Step 3: Show up. Photographer guides the session.';
      var p = progress(t, 15.7, 16.5);
      var chars = Math.floor(p * fullText.length);
      step3.style.opacity = '1';
      step3.innerHTML = '<span class="step-num">Step 3:</span> ' + fullText.slice(7, chars) +
        (chars < fullText.length ? '<span style="display:inline-block;width:2px;height:1em;background:#111;vertical-align:text-bottom;margin-left:1px;"></span>' : '');
    }

    // ── 16–18s: Classified section ───────────────────────────────────────
    if (t >= 16.0) {
      var p = progress(t, 16.0, 16.5);
      classifiedSection.style.opacity = easeOut(p).toFixed(3);
    }

    if (t >= 16.4) {
      var p = progress(t, 16.4, 17.2);
      stampIn(classifiedBox, p);
    }

    // ── 18–22s: BREAKING banner slides in, then takeover ────────────────
    if (t >= 18.0) {
      var p = progress(t, 18.0, 18.6);
      var x = -110 * (1 - easeOut(p));
      breakingBanner.style.transform = 'translateX(' + x.toFixed(1) + '%)';
    }

    if (t >= 18.8) {
      var p = progress(t, 18.8, 19.6);
      breakingTakeover.style.opacity = easeOut(p).toFixed(3);
      breakingTakeover.style.pointerEvents = 'auto';
    }

    // ── 22–24s: Hold ─────────────────────────────────────────────────────
    // Nothing changes — hold the takeover state
  }

  window.__applyUpTo = __applyUpTo;

  // Disable transitions/animations in capture mode
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
  console.log('=== Newspaper / Tabloid Reel v62a ===');
  resetOutputDir();

  console.log('Processing photos...');
  var imageDataMap = processPhotos();

  var html = buildHTML(imageDataMap);
  var htmlPath = path.join(OUT_DIR, 'index.html');
  writeFileSync(htmlPath, html);
  console.log('HTML written to ' + htmlPath);

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

  var outputMp4 = path.join(OUT_DIR, 'manila-newspaper-v62a.mp4');
  execSync(
    'ffmpeg -y -framerate ' + FPS + ' -i "' + path.join(framesDir, 'frame_%05d.png') + '" ' +
    '-c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r ' + FPS + ' -an "' + outputMp4 + '"',
    { stdio: 'inherit' }
  );

  rmSync(framesDir, { recursive: true, force: true });

  // Copy to reels/ (sibling of reels-final/ in manila-model-search-carousel/)
  var reelsDir = path.join(__dirname, '..', 'reels');
  if (!existsSync(reelsDir)) mkdirSync(reelsDir, { recursive: true });
  var reelsDest = path.join(reelsDir, 'manila-newspaper-v62a.mp4');
  execSync('cp "' + outputMp4 + '" "' + reelsDest + '"');

  var sz = statSync(outputMp4);
  console.log('Final: ' + (sz.size / (1024 * 1024)).toFixed(1) + ' MB → ' + outputMp4);
  console.log('Copied to ' + reelsDest);
  console.log('=== Done ===');
}

main().catch(function(err) {
  console.error(err);
  process.exit(1);
});
