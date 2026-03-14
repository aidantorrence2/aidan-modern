import { chromium } from 'playwright';
import { execSync } from 'child_process';
import { mkdirSync, rmSync, existsSync, readFileSync, writeFileSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

var __dirname = path.dirname(fileURLToPath(import.meta.url));
var OUT_DIR = path.join(__dirname, 'output-69a');

var W = 1080;
var H = 1920;
var FPS = 30;
var TOTAL_FRAMES = 720; // 24s at 30fps
var TOTAL_DURATION = 24;

var FILM_SCANS_DIR = '/Volumes/PortableSSD/Exports/film scans';
var PHOTO_NAMES = [
  'DSC_0288.jpg',
  'DSC_0289.jpg',
  'DSC_0292.jpg',
  'DSC_0300.jpg',
  'DSC_0304.jpg',
  'DSC_0308-2.jpg',
  'DSC_0310-2.jpg',
  'DSC_0311-2.jpg',
];

// Per-issue cover line data
var ISSUES = [
  {
    num: '01',
    main: 'FREE PHOTO SHOOT',
    sub1: 'No experience needed',
    sub2: 'The photographer everyone',
    sub3: 'is talking about',
    extra1: 'MANILA SESSIONS',
    extra2: 'Limited spots available',
  },
  {
    num: '02',
    main: 'BEHIND THE LENS',
    sub1: 'How one photographer is',
    sub2: 'changing the game',
    sub3: 'in Southeast Asia',
    extra1: 'FILM PHOTOGRAPHY',
    extra2: 'Shot on 35mm in the streets',
  },
  {
    num: '03',
    main: 'EXCLUSIVE ACCESS',
    sub1: 'Free sessions available',
    sub2: 'DM @madebyaidan',
    sub3: 'to claim your shoot',
    extra1: 'NO PORTFOLIO NEEDED',
    extra2: 'First-timers welcome',
  },
  {
    num: '04',
    main: 'STYLE GUIDE',
    sub1: 'Film photography',
    sub2: 'on location in Manila',
    sub3: 'Natural light, real moments',
    extra1: 'GOLDEN HOUR',
    extra2: 'Every frame hand-developed',
  },
  {
    num: '05',
    main: 'THE NEXT FACE',
    sub1: 'Could be you — no',
    sub2: 'experience required',
    sub3: 'Just show up',
    extra1: 'OPEN CALL',
    extra2: 'Manila · April 2024',
  },
  {
    num: '06',
    main: 'RAW & REAL',
    sub1: 'Candid portraits that',
    sub2: 'tell your story',
    sub3: 'Film never lies',
    extra1: 'ANALOG REVIVAL',
    extra2: 'Why film is back in style',
  },
  {
    num: '07',
    main: 'YOUR BEST SHOT',
    sub1: 'A free session with',
    sub2: 'a professional eye',
    sub3: 'Limited spots — act now',
    extra1: 'PHOTOGRAPHER PROFILE',
    extra2: '@madebyaidan · Manila',
  },
  {
    num: '08',
    main: 'FINAL CALL',
    sub1: 'Last chance to book',
    sub2: 'your free photo shoot',
    sub3: 'DM now on Instagram',
    extra1: 'THIS WEEK ONLY',
    extra2: 'Spots filling fast',
  },
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

  // Build all 8 magazine cover layers
  var coverLayers = PHOTO_NAMES.map(function(name, i) {
    var issue = ISSUES[i];
    return `
    <div id="cover-${i}" style="
      position:absolute;inset:0;
      opacity:0;
      z-index:${10 + i};
      overflow:hidden;
      background:#000;
    ">
      <!-- Full-bleed cover photo -->
      <img src="${imageDataMap[name]}" id="cover-img-${i}" style="
        position:absolute;inset:0;
        width:100%;height:100%;
        object-fit:cover;
        object-position:center top;
        display:block;
      " />

      <!-- Dark gradient overlay for text legibility -->
      <div style="
        position:absolute;inset:0;
        background: linear-gradient(
          180deg,
          rgba(0,0,0,0.55) 0%,
          rgba(0,0,0,0.0) 35%,
          rgba(0,0,0,0.0) 55%,
          rgba(0,0,0,0.65) 100%
        );
        pointer-events:none;
      "></div>

      <!-- Spine left edge -->
      <div style="
        position:absolute;top:0;left:0;bottom:0;width:18px;
        background: linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 100%);
        z-index:5;
      "></div>

      <!-- ── MASTHEAD ── -->
      <div id="masthead-${i}" style="
        position:absolute;
        top:0;left:18px;right:0;
        height:160px;
        display:flex;flex-direction:column;align-items:center;justify-content:center;
        z-index:10;
        opacity:0;
        transform:translateY(-40px);
      ">
        <div style="
          font-family:'Arial Black','Helvetica Neue',Arial,sans-serif;
          font-size:120px;
          font-weight:900;
          font-style:italic;
          color:rgba(255,255,255,0.92);
          letter-spacing:-4px;
          line-height:1;
          text-transform:uppercase;
          text-shadow: 0 0 40px rgba(0,0,0,0.6), 2px 2px 0 rgba(0,0,0,0.4);
          mix-blend-mode:screen;
        ">MANILA</div>
        <div style="
          font-family:'Arial','Helvetica Neue',Arial,sans-serif;
          font-size:20px;
          font-weight:400;
          color:rgba(255,255,255,0.75);
          letter-spacing:8px;
          text-transform:uppercase;
          margin-top:-6px;
          text-shadow:0 1px 4px rgba(0,0,0,0.7);
        ">PHOTOGRAPHY</div>
      </div>

      <!-- ── ISSUE INFO TOP RIGHT ── -->
      <div id="issue-info-${i}" style="
        position:absolute;
        top:14px;right:18px;
        text-align:right;
        z-index:11;
        opacity:0;
      ">
        <div style="
          font-family:'Arial','Helvetica Neue',Arial,sans-serif;
          font-size:22px;
          font-weight:700;
          color:#fff;
          letter-spacing:2px;
          text-shadow:0 1px 4px rgba(0,0,0,0.8);
          text-transform:uppercase;
        ">ISSUE ${issue.num}</div>
        <div style="
          font-family:'Arial','Helvetica Neue',Arial,sans-serif;
          font-size:18px;
          font-weight:400;
          color:rgba(255,255,255,0.8);
          letter-spacing:1px;
          text-shadow:0 1px 4px rgba(0,0,0,0.8);
        ">2024</div>
        <div style="
          font-family:'Arial','Helvetica Neue',Arial,sans-serif;
          font-size:16px;
          font-weight:400;
          color:rgba(255,255,255,0.65);
          letter-spacing:0px;
          text-shadow:0 1px 4px rgba(0,0,0,0.8);
          margin-top:2px;
        ">$0.00 FREE</div>
      </div>

      <!-- ── COVER LINES LEFT ── -->
      <div id="cover-lines-${i}" style="
        position:absolute;
        left:36px;
        bottom:220px;
        width:580px;
        z-index:10;
        opacity:0;
        transform:translateX(-30px);
      ">
        <!-- Main cover line -->
        <div style="
          font-family:'Arial Black','Helvetica Neue',Arial,sans-serif;
          font-size:54px;
          font-weight:900;
          color:#fff;
          line-height:1.0;
          text-transform:uppercase;
          letter-spacing:-1px;
          text-shadow: 2px 2px 12px rgba(0,0,0,0.9), 0 0 30px rgba(0,0,0,0.7);
          margin-bottom:10px;
        ">${issue.main}</div>

        <!-- Thin rule under main -->
        <div style="width:200px;height:2px;background:rgba(255,255,255,0.6);margin-bottom:12px;"></div>

        <!-- Sub lines -->
        <div style="
          font-family:'Arial','Helvetica Neue',Arial,sans-serif;
          font-size:28px;
          font-weight:300;
          color:rgba(255,255,255,0.92);
          line-height:1.35;
          text-shadow: 1px 1px 6px rgba(0,0,0,0.9);
          letter-spacing:0.3px;
        ">${issue.sub1}<br>${issue.sub2}<br>${issue.sub3}</div>

        <!-- Extra cover lines with bullets -->
        <div style="margin-top:22px;display:flex;flex-direction:column;gap:6px;">
          <div style="
            font-family:'Arial','Helvetica Neue',Arial,sans-serif;
            font-size:22px;
            font-weight:700;
            color:#fff;
            text-transform:uppercase;
            letter-spacing:2px;
            text-shadow: 1px 1px 6px rgba(0,0,0,0.9);
          ">&#9632; ${issue.extra1}</div>
          <div style="
            font-family:'Arial','Helvetica Neue',Arial,sans-serif;
            font-size:20px;
            font-weight:300;
            color:rgba(255,255,255,0.8);
            letter-spacing:0.5px;
            text-shadow: 1px 1px 6px rgba(0,0,0,0.9);
            padding-left:22px;
          ">${issue.extra2}</div>
        </div>
      </div>

      <!-- ── BARCODE BOTTOM RIGHT ── -->
      <div id="barcode-${i}" style="
        position:absolute;
        bottom:30px;right:24px;
        z-index:10;
        opacity:0;
      ">
        <!-- Barcode CSS lines -->
        <div style="
          display:flex;flex-direction:row;align-items:flex-end;
          gap:0;
          width:120px;height:60px;
          overflow:hidden;
        ">
          ${generateBarcode()}
        </div>
        <div style="
          font-family:'Courier New',Courier,monospace;
          font-size:13px;
          color:rgba(255,255,255,0.7);
          letter-spacing:1px;
          text-align:center;
          margin-top:3px;
          text-shadow:0 1px 3px rgba(0,0,0,0.9);
        ">0 00000 00000 ${i}</div>
      </div>

      <!-- ── PAGE FLIP COVER ── (for transition) -->
      <div id="flip-cover-${i}" style="
        position:absolute;inset:0;
        background:#1a1a1a;
        z-index:20;
        transform-origin:left center;
        transform:scaleX(0);
        pointer-events:none;
      "></div>

    </div>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { margin:0;padding:0;overflow:hidden;background:#000; }
</style>
</head>
<body>
<div id="root" style="width:${W}px;height:${H}px;position:relative;overflow:hidden;background:#111;">

  ${coverLayers}

  <!-- ========== INSIDE PAGES (14–18s) ========== -->
  <div id="inside-pages" style="
    position:absolute;inset:0;
    background:#fafafa;
    z-index:100;
    opacity:0;
    transform:translateX(100%);
    display:flex;flex-direction:column;
    padding:80px 70px 60px;
    overflow:hidden;
  ">
    <!-- Inside top rule -->
    <div style="width:100%;height:3px;background:#111;margin-bottom:8px;"></div>
    <div style="width:100%;height:1px;background:#111;margin-bottom:40px;"></div>

    <div style="
      font-family:'Arial','Helvetica Neue',Arial,sans-serif;
      font-size:16px;
      font-weight:400;
      color:#888;
      letter-spacing:5px;
      text-transform:uppercase;
      margin-bottom:18px;
    ">HOW TO BOOK</div>

    <div style="
      font-family:Georgia,'Times New Roman',serif;
      font-size:68px;
      font-weight:700;
      color:#111;
      line-height:1.0;
      letter-spacing:-2px;
      margin-bottom:40px;
    ">Your Free<br>Photo Shoot</div>

    <div style="width:80px;height:3px;background:#111;margin-bottom:48px;"></div>

    <div id="inside-step-1" style="
      opacity:0;transform:translateX(60px);
      display:flex;flex-direction:row;align-items:flex-start;gap:24px;
      margin-bottom:44px;
    ">
      <div style="
        font-family:'Arial Black','Helvetica Neue',Arial,sans-serif;
        font-size:52px;font-weight:900;color:#e0e0e0;
        line-height:1;flex-shrink:0;width:60px;text-align:right;
      ">1</div>
      <div>
        <div style="
          font-family:'Arial','Helvetica Neue',Arial,sans-serif;
          font-size:32px;font-weight:700;color:#111;
          line-height:1.1;margin-bottom:6px;
        ">DM @madebyaidan</div>
        <div style="
          font-family:Georgia,serif;font-size:24px;
          color:#555;font-style:italic;line-height:1.4;
        ">on Instagram</div>
      </div>
    </div>

    <div id="inside-step-2" style="
      opacity:0;transform:translateX(60px);
      display:flex;flex-direction:row;align-items:flex-start;gap:24px;
      margin-bottom:44px;
    ">
      <div style="
        font-family:'Arial Black','Helvetica Neue',Arial,sans-serif;
        font-size:52px;font-weight:900;color:#e0e0e0;
        line-height:1;flex-shrink:0;width:60px;text-align:right;
      ">2</div>
      <div>
        <div style="
          font-family:'Arial','Helvetica Neue',Arial,sans-serif;
          font-size:32px;font-weight:700;color:#111;
          line-height:1.1;margin-bottom:6px;
        ">Choose your date and vibe</div>
        <div style="
          font-family:Georgia,serif;font-size:24px;
          color:#555;font-style:italic;line-height:1.4;
        ">Location, mood, time of day</div>
      </div>
    </div>

    <div id="inside-step-3" style="
      opacity:0;transform:translateX(60px);
      display:flex;flex-direction:row;align-items:flex-start;gap:24px;
      margin-bottom:60px;
    ">
      <div style="
        font-family:'Arial Black','Helvetica Neue',Arial,sans-serif;
        font-size:52px;font-weight:900;color:#e0e0e0;
        line-height:1;flex-shrink:0;width:60px;text-align:right;
      ">3</div>
      <div>
        <div style="
          font-family:'Arial','Helvetica Neue',Arial,sans-serif;
          font-size:32px;font-weight:700;color:#111;
          line-height:1.1;margin-bottom:6px;
        ">Show up. Leave with stunning photos.</div>
        <div style="
          font-family:Georgia,serif;font-size:24px;
          color:#555;font-style:italic;line-height:1.4;
        ">Delivered in full resolution</div>
      </div>
    </div>

    <!-- Inside bottom rule -->
    <div style="flex:1;"></div>
    <div style="width:100%;height:1px;background:#ddd;margin-bottom:8px;"></div>
    <div style="width:100%;height:3px;background:#111;"></div>
  </div>

  <!-- ========== BACK COVER (18–22s) ========== -->
  <div id="back-cover" style="
    position:absolute;inset:0;
    background:#0a0a0a;
    z-index:110;
    opacity:0;
    display:flex;flex-direction:column;
    align-items:center;justify-content:center;
    padding:60px 50px;
    overflow:hidden;
  ">
    <!-- Back cover photo strip top -->
    <div id="back-photo-strip" style="
      position:absolute;top:0;left:0;right:0;height:420px;
      overflow:hidden;opacity:0.4;
    ">
      <img src="${imageDataMap[PHOTO_NAMES[0]]}" style="
        width:100%;height:100%;object-fit:cover;object-position:center 30%;
      " />
      <div style="
        position:absolute;inset:0;
        background:linear-gradient(180deg, transparent 0%, #0a0a0a 100%);
      "></div>
    </div>

    <div style="
      position:relative;z-index:2;
      display:flex;flex-direction:column;align-items:center;
      gap:20px;
    ">
      <!-- Brand name big -->
      <div id="back-brand" style="
        font-family:'Arial Black','Helvetica Neue',Arial,sans-serif;
        font-size:96px;
        font-weight:900;
        color:#fff;
        letter-spacing:-3px;
        text-transform:lowercase;
        text-align:center;
        line-height:0.9;
        opacity:0;transform:scale(0.85);
      ">@madebyaidan</div>

      <div id="back-sub1" style="
        font-family:'Arial','Helvetica Neue',Arial,sans-serif;
        font-size:30px;
        font-weight:300;
        color:rgba(255,255,255,0.7);
        letter-spacing:4px;
        text-transform:uppercase;
        text-align:center;
        opacity:0;
      ">DM on Instagram</div>

      <div style="width:60px;height:1px;background:rgba(255,255,255,0.3);"></div>

      <div id="back-sub2" style="
        font-family:Georgia,'Times New Roman',serif;
        font-size:26px;
        font-weight:400;
        font-style:italic;
        color:rgba(255,255,255,0.55);
        text-align:center;
        letter-spacing:0.5px;
        opacity:0;
        line-height:1.6;
      ">Free photo shoot · Limited spots</div>
    </div>

    <!-- Barcode bottom center -->
    <div id="back-barcode" style="
      position:absolute;bottom:50px;left:50%;transform:translateX(-50%);
      display:flex;flex-direction:column;align-items:center;
      opacity:0;
    ">
      <div style="
        display:flex;flex-direction:row;align-items:flex-end;
        width:160px;height:72px;overflow:hidden;
      ">
        ${generateBarcode(true)}
      </div>
      <div style="
        font-family:'Courier New',Courier,monospace;
        font-size:14px;
        color:rgba(255,255,255,0.5);
        letter-spacing:2px;
        margin-top:4px;
        text-align:center;
      ">MANILA MAGAZINE · FREE</div>
    </div>
  </div>

  <!-- ========== FINAL FAN STACK (22–24s) ========== -->
  <div id="fan-stack" style="
    position:absolute;inset:0;
    z-index:120;
    opacity:0;
    pointer-events:none;
    perspective:1200px;
  ">
    ${buildFanCovers(imageDataMap)}
  </div>

</div>

<script>
  var FPS = ${FPS};
  var N = ${n};

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function lerp(a, b, t) { return a + (b - a) * clamp(t, 0, 1); }
  function easeOut(t) { var c = clamp(t,0,1); return 1 - Math.pow(1-c, 3); }
  function easeIn(t) { var c = clamp(t,0,1); return c * c; }
  function easeInOut(t) { var c = clamp(t,0,1); return c < 0.5 ? 2*c*c : -1+(4-2*c)*c; }
  function progress(t, start, end) { return clamp((t - start) / (end - start), 0, 1); }

  // ── COVER TIMING ──────────────────────────────────────────────────────────
  // 0–2s: First cover assembles
  // 2–12s: Covers cycle (8 covers, ~1.25s each flip duration — but all 8 covers shown in 10s)
  //         Cover 0 enters at 0s, covers 1-7 flip in starting at 2s, each flip takes ~1.25s
  // 12-14s: Cover "opens" — inside pages reveal
  // 14-18s: Inside pages with steps
  // 18-22s: Back cover
  // 22-24s: Fan stack

  var COVER_CYCLE_START = 2.0;
  var COVER_CYCLE_DUR = 1.25; // seconds per cover after the first

  // Page flip: scaleX 1→0 for outgoing, 0→1 for incoming
  // Flip pivot point is left edge (transform-origin: left center)
  // Each flip takes 0.5s total: 0.25s out, 0.25s in

  window.__applyUpTo = function(t) {

    // ── PHASE 1: Cover 0 assembles (0–2s) ─────────────────────────────────
    var cover0 = document.getElementById('cover-0');
    var mast0 = document.getElementById('masthead-0');
    var lines0 = document.getElementById('cover-lines-0');
    var info0 = document.getElementById('issue-info-0');
    var bar0 = document.getElementById('barcode-0');

    if (t < 12.0) {
      // Cover 0 is base layer — visible during 0–2s fully, partially during cycles
      var cv0p = easeOut(progress(t, 0, 0.5));
      cover0.style.opacity = t < 2.0 ? cv0p.toFixed(3) : (t < 2.6 ? (1 - easeIn(progress(t, 2.0, 2.6))).toFixed(3) : '0');
    }

    // Masthead slides down: 0.2 → 0.8s
    var mp0 = easeOut(progress(t, 0.2, 0.8));
    mast0.style.opacity = mp0.toFixed(3);
    mast0.style.transform = 'translateY(' + lerp(-40, 0, mp0).toFixed(1) + 'px)';

    // Cover lines type in: 0.6 → 1.4s
    var lp0 = easeOut(progress(t, 0.6, 1.4));
    lines0.style.opacity = lp0.toFixed(3);
    lines0.style.transform = 'translateX(' + lerp(-30, 0, lp0).toFixed(1) + 'px)';

    // Issue info: 0.8 → 1.2s
    var ip0 = easeOut(progress(t, 0.8, 1.2));
    info0.style.opacity = ip0.toFixed(3);

    // Barcode: 1.0 → 1.5s
    var bp0 = easeOut(progress(t, 1.0, 1.5));
    bar0.style.opacity = bp0.toFixed(3);

    // ── PHASE 2: Magazine covers cycle (2–12s) ─────────────────────────────
    // Each cover i (1..7) has a flip-in at: COVER_CYCLE_START + (i-1) * COVER_CYCLE_DUR
    // The flip: outgoing cover scaleX 1→0 in 0.35s, then incoming scaleX 0→1 in 0.4s

    for (var i = 1; i < N; i++) {
      var flipStart = COVER_CYCLE_START + (i - 1) * COVER_CYCLE_DUR;
      var outEnd = flipStart + 0.35;
      var inEnd = flipStart + 0.75;
      var coverEl = document.getElementById('cover-' + i);
      var prevCoverEl = document.getElementById('cover-' + (i - 1));
      var mastEl = document.getElementById('masthead-' + i);
      var linesEl = document.getElementById('cover-lines-' + i);
      var infoEl = document.getElementById('issue-info-' + i);
      var barEl = document.getElementById('barcode-' + i);

      if (t < flipStart) {
        coverEl.style.opacity = '0';
        if (mastEl) { mastEl.style.opacity = '0'; mastEl.style.transform = 'translateY(-40px)'; }
        if (linesEl) { linesEl.style.opacity = '0'; linesEl.style.transform = 'translateX(-30px)'; }
        if (infoEl) infoEl.style.opacity = '0';
        if (barEl) barEl.style.opacity = '0';
        continue;
      }

      var nextFlipStart = COVER_CYCLE_START + i * COVER_CYCLE_DUR;
      var isLast = (i === N - 1);
      var exitStart = isLast ? 11.8 : nextFlipStart;

      // Show this cover fully after its flip-in
      if (t >= inEnd) {
        coverEl.style.opacity = '1';

        // Apply page-flip depart: for outgoing (when next cover flips in)
        if (!isLast && t >= nextFlipStart) {
          var outP = easeInOut(progress(t, nextFlipStart, nextFlipStart + 0.35));
          coverEl.style.opacity = (1 - outP).toFixed(3);
        }

        // Last cover: fade out when opening
        if (isLast && t >= 11.8) {
          var fadeP = easeIn(progress(t, 11.8, 12.4));
          coverEl.style.opacity = (1 - fadeP).toFixed(3);
        }

        // Animate cover text elements in right after flip
        var textReveal = easeOut(progress(t, inEnd, inEnd + 0.3));
        if (mastEl) {
          mastEl.style.opacity = textReveal.toFixed(3);
          mastEl.style.transform = 'translateY(' + lerp(-20, 0, textReveal).toFixed(1) + 'px)';
        }
        if (linesEl) {
          linesEl.style.opacity = textReveal.toFixed(3);
          linesEl.style.transform = 'translateX(' + lerp(-20, 0, textReveal).toFixed(1) + 'px)';
        }
        if (infoEl) infoEl.style.opacity = textReveal.toFixed(3);
        if (barEl) barEl.style.opacity = textReveal.toFixed(3);
      } else if (t >= flipStart) {
        // During the flip itself
        var inP = easeInOut(progress(t, outEnd, inEnd));
        coverEl.style.opacity = inP.toFixed(3);
        // Also keep text hidden during flip
        if (mastEl) { mastEl.style.opacity = '0'; mastEl.style.transform = 'translateY(-20px)'; }
        if (linesEl) { linesEl.style.opacity = '0'; }
        if (infoEl) infoEl.style.opacity = '0';
        if (barEl) barEl.style.opacity = '0';
      }
    }

    // ── PHASE 3: Magazine opens (12–14s) ─────────────────────────────────
    var insidePages = document.getElementById('inside-pages');
    if (t >= 12.0) {
      var openP = easeInOut(progress(t, 12.0, 13.5));
      var slideP = easeOut(progress(t, 12.4, 13.8));
      insidePages.style.opacity = openP.toFixed(3);
      insidePages.style.transform = 'translateX(' + lerp(100, 0, slideP).toFixed(1) + '%)';
    } else {
      insidePages.style.opacity = '0';
      insidePages.style.transform = 'translateX(100%)';
    }

    // ── PHASE 4: Inside steps slide in (14–18s) ─────────────────────────
    var step1El = document.getElementById('inside-step-1');
    var step2El = document.getElementById('inside-step-2');
    var step3El = document.getElementById('inside-step-3');

    if (t >= 14.0 && step1El) {
      var s1p = easeOut(progress(t, 14.0, 14.7));
      step1El.style.opacity = s1p.toFixed(3);
      step1El.style.transform = 'translateX(' + lerp(60, 0, s1p).toFixed(1) + 'px)';
    }
    if (t >= 14.8 && step2El) {
      var s2p = easeOut(progress(t, 14.8, 15.5));
      step2El.style.opacity = s2p.toFixed(3);
      step2El.style.transform = 'translateX(' + lerp(60, 0, s2p).toFixed(1) + 'px)';
    }
    if (t >= 15.6 && step3El) {
      var s3p = easeOut(progress(t, 15.6, 16.3));
      step3El.style.opacity = s3p.toFixed(3);
      step3El.style.transform = 'translateX(' + lerp(60, 0, s3p).toFixed(1) + 'px)';
    }

    // Fade out inside pages before back cover
    if (t >= 17.5) {
      var fadeOut = easeIn(progress(t, 17.5, 18.2));
      insidePages.style.opacity = (1 - fadeOut).toFixed(3);
    }

    // ── PHASE 5: Back cover (18–22s) ────────────────────────────────────
    var backCover = document.getElementById('back-cover');
    var backBrand = document.getElementById('back-brand');
    var backSub1 = document.getElementById('back-sub1');
    var backSub2 = document.getElementById('back-sub2');
    var backBarcode = document.getElementById('back-barcode');

    if (t >= 18.0) {
      var bcp = easeOut(progress(t, 18.0, 18.8));
      backCover.style.opacity = bcp.toFixed(3);
    } else {
      backCover.style.opacity = '0';
    }

    if (t >= 18.5 && backBrand) {
      var bbp = easeOut(progress(t, 18.5, 19.5));
      backBrand.style.opacity = bbp.toFixed(3);
      backBrand.style.transform = 'scale(' + lerp(0.85, 1, bbp).toFixed(3) + ')';
    }

    if (t >= 19.3 && backSub1) {
      backSub1.style.opacity = easeOut(progress(t, 19.3, 19.9)).toFixed(3);
    }

    if (t >= 19.8 && backSub2) {
      backSub2.style.opacity = easeOut(progress(t, 19.8, 20.4)).toFixed(3);
    }

    if (t >= 20.5 && backBarcode) {
      backBarcode.style.opacity = easeOut(progress(t, 20.5, 21.0)).toFixed(3);
    }

    // Fade back cover before fan stack
    if (t >= 21.5) {
      var bcFade = easeIn(progress(t, 21.5, 22.1));
      backCover.style.opacity = (Math.max(0, 1 - bcFade)).toFixed(3);
    }

    // ── PHASE 6: Fan stack (22–24s) ─────────────────────────────────────
    var fanStack = document.getElementById('fan-stack');
    if (t >= 22.0) {
      fanStack.style.opacity = easeOut(progress(t, 22.0, 22.8)).toFixed(3);
      // Fan cards spread in
      var fanCovers = [
        { el: document.getElementById('fan-0'), targetRot: -14, targetX: -280 },
        { el: document.getElementById('fan-1'), targetRot: -9, targetX: -180 },
        { el: document.getElementById('fan-2'), targetRot: -5, targetX: -100 },
        { el: document.getElementById('fan-3'), targetRot: -1, targetX: -30 },
        { el: document.getElementById('fan-4'), targetRot: 3, targetX: 50 },
        { el: document.getElementById('fan-5'), targetRot: 7, targetX: 130 },
        { el: document.getElementById('fan-6'), targetRot: 11, targetX: 210 },
        { el: document.getElementById('fan-7'), targetRot: 15, targetX: 290 },
      ];
      var fanP = easeOut(progress(t, 22.0, 23.0));
      for (var fi = 0; fi < fanCovers.length; fi++) {
        var fc = fanCovers[fi];
        if (!fc.el) continue;
        var rot = lerp(0, fc.targetRot, fanP);
        var tx = lerp(0, fc.targetX, fanP);
        fc.el.style.transform = 'translateX(' + tx.toFixed(1) + 'px) rotate(' + rot.toFixed(2) + 'deg)';
        fc.el.style.opacity = '1';
      }
    } else {
      fanStack.style.opacity = '0';
    }
  };

  // Freeze CSS transitions/animations in capture mode
  if (location.search.includes('capture=1')) {
    var s = document.createElement('style');
    s.textContent = '*, *::before, *::after { transition-duration: 0s !important; animation-duration: 0.001s !important; }';
    document.head.appendChild(s);
  }
</script>
</body>
</html>`;
}

function generateBarcode(large) {
  // CSS-generated barcode from vertical lines
  var patterns = [2,1,3,1,2,2,1,3,2,1,1,2,3,1,2,1,1,3,2,1,2,2,1,3,1,2,3,1,2,1,1,2];
  var html = '';
  var colors = ['rgba(255,255,255,0.85)', 'transparent'];
  var baseH = large ? 72 : 60;
  for (var p = 0; p < patterns.length; p++) {
    var w = patterns[p];
    var color = p % 2 === 0 ? colors[0] : colors[1];
    html += '<div style="width:' + (w * (large ? 4 : 3)) + 'px;height:' + baseH + 'px;background:' + color + ';flex-shrink:0;"></div>';
  }
  return html;
}

function buildFanCovers(imageDataMap) {
  return PHOTO_NAMES.map(function(name, i) {
    return `
    <div id="fan-${i}" style="
      position:absolute;
      left:50%;top:50%;
      width:380px;height:600px;
      transform:translateX(0) rotate(0deg);
      transform-origin:center bottom;
      margin-left:-190px;
      margin-top:-300px;
      border-radius:4px;
      overflow:hidden;
      box-shadow: 0 20px 50px rgba(0,0,0,0.7);
      opacity:0;
    ">
      <img src="${imageDataMap[name]}" style="
        width:100%;height:100%;object-fit:cover;object-position:center top;
      " />
      <!-- Mini masthead overlay -->
      <div style="
        position:absolute;top:0;left:0;right:0;height:70px;
        background:linear-gradient(180deg,rgba(0,0,0,0.7) 0%,transparent 100%);
        display:flex;align-items:center;justify-content:center;
      ">
        <div style="
          font-family:'Arial Black','Helvetica Neue',Arial,sans-serif;
          font-size:38px;font-weight:900;font-style:italic;
          color:rgba(255,255,255,0.9);letter-spacing:-1px;
          text-shadow:0 0 15px rgba(0,0,0,0.5);
        ">MANILA</div>
      </div>
    </div>`;
  }).join('\n');
}

async function main() {
  console.log('=== Magazine Cover Reel v69a ===');
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

  var outputMp4 = path.join(OUT_DIR, 'manila-magazine-v69a.mp4');
  execSync(
    'ffmpeg -y -framerate ' + FPS + ' -i "' + path.join(framesDir, 'frame_%05d.png') + '" ' +
    '-c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r ' + FPS + ' -an "' + outputMp4 + '"',
    { stdio: 'inherit' }
  );

  rmSync(framesDir, { recursive: true, force: true });

  // Copy to reels/ (sibling of reels-final/ in manila-model-search-carousel/)
  var reelsDir = path.join(__dirname, '..', 'reels');
  if (!existsSync(reelsDir)) mkdirSync(reelsDir, { recursive: true });
  var reelsDest = path.join(reelsDir, 'manila-magazine-v69a.mp4');
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
