import { chromium } from 'playwright';
import { execSync } from 'child_process';
import { mkdirSync, rmSync, existsSync, readFileSync, writeFileSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

var __dirname = path.dirname(fileURLToPath(import.meta.url));
var OUT_DIR = path.join(__dirname, 'output-65a');

var W = 1080;
var H = 1920;
var FPS = 30;
var TOTAL_FRAMES = 720; // 24s at 30fps
var TOTAL_DURATION = 24;

var FILM_SCANS_DIR = '/Volumes/PortableSSD/Exports/film scans';
var PHOTO_NAMES = [
  'DSC_0797.jpg',
  'DSC_0804.jpg',
  'DSC_0807.jpg',
  'DSC_0835-2.jpg',
  'DSC_0839.jpg',
  'DSC_0841.jpg',
  'DSC_0853.jpg',
  'DSC_0855-2.jpg',
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
  var photoImgTags = PHOTO_NAMES.map(function(name, i) {
    return '<img id="vinyl-photo-' + i + '" src="' + imageDataMap[name] + '" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity 0.1s;" />';
  }).join('\n      ');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { margin: 0; padding: 0; overflow: hidden; }

  @keyframes spin-record {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes needle-swing-in {
    from { transform: rotate(-28deg); transform-origin: 90% 5%; }
    to { transform: rotate(-5deg); transform-origin: 90% 5%; }
  }
  @keyframes needle-swing-out {
    from { transform: rotate(-5deg); transform-origin: 90% 5%; }
    to { transform: rotate(-28deg); transform-origin: 90% 5%; }
  }
  @keyframes sleeve-slide-in {
    from { transform: translateY(120%); opacity: 0; }
    to { transform: translateY(0%); opacity: 1; }
  }
  @keyframes sleeve-slide-out {
    from { transform: translateY(0%); opacity: 1; }
    to { transform: translateY(-110%); opacity: 0; }
  }
  @keyframes record-slide-up {
    from { transform: translateY(60px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  @keyframes flip-record {
    0%   { transform: scaleX(1); }
    50%  { transform: scaleX(0); }
    100% { transform: scaleX(1); }
  }
  @keyframes fade-in-line {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes scratch-jitter {
    0%   { transform: translate(0,0) rotate(0deg); }
    20%  { transform: translate(-3px, 2px) rotate(-1deg); }
    40%  { transform: translate(3px, -2px) rotate(1deg); }
    60%  { transform: translate(-2px, 3px) rotate(-0.5deg); }
    80%  { transform: translate(2px, -1px) rotate(0.5deg); }
    100% { transform: translate(0,0) rotate(0deg); }
  }
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 20px rgba(212,175,55,0.3); }
    50% { box-shadow: 0 0 40px rgba(212,175,55,0.7); }
  }
  @keyframes track-blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
  @keyframes record-appear {
    from { transform: translateY(80px) scale(0.85); opacity: 0; }
    to { transform: translateY(0) scale(1); opacity: 1; }
  }
</style>
</head>
<body>
<div id="root" style="
  width:${W}px;
  height:${H}px;
  position:relative;
  overflow:hidden;
  background:#1a1510;
  font-family: 'Georgia', 'Times New Roman', serif;
">

  <!-- Wood grain background texture -->
  <div style="
    position:absolute;inset:0;
    background:
      repeating-linear-gradient(
        88deg,
        transparent 0px,
        rgba(120,80,30,0.04) 1px,
        transparent 2px,
        transparent 18px,
        rgba(90,55,15,0.03) 19px,
        transparent 20px,
        transparent 34px
      ),
      repeating-linear-gradient(
        92deg,
        transparent 0px,
        rgba(100,65,20,0.03) 1px,
        transparent 2px,
        transparent 27px,
        rgba(140,95,35,0.04) 28px,
        transparent 29px
      ),
      linear-gradient(175deg, #221a0f 0%, #1a1510 40%, #16120e 100%);
    z-index:0;
  "></div>

  <!-- Ambient warm light top -->
  <div style="
    position:absolute;top:-200px;left:50%;transform:translateX(-50%);
    width:900px;height:600px;
    background:radial-gradient(ellipse at center, rgba(180,120,40,0.12) 0%, transparent 70%);
    z-index:1;pointer-events:none;
  "></div>

  <!-- ===================== ALBUM SLEEVE ===================== -->
  <div id="sleeve" style="
    position:absolute;
    left:50%;
    top:520px;
    transform:translateX(-50%) translateY(120%);
    width:720px;
    height:720px;
    z-index:30;
    opacity:0;
  ">
    <!-- Sleeve body -->
    <div style="
      position:absolute;inset:0;
      background:linear-gradient(145deg, #2e2318 0%, #1e1810 60%, #141008 100%);
      border-radius:12px;
      border:2px solid rgba(212,175,55,0.25);
      box-shadow:
        8px 12px 40px rgba(0,0,0,0.7),
        inset 1px 1px 0 rgba(255,255,255,0.06),
        inset -1px -1px 0 rgba(0,0,0,0.4);
    ">
      <!-- Spine highlight -->
      <div style="
        position:absolute;left:0;top:0;bottom:0;width:18px;
        background:linear-gradient(90deg, rgba(212,175,55,0.15) 0%, transparent 100%);
        border-radius:12px 0 0 12px;
      "></div>

      <!-- Album art area -->
      <div style="
        position:absolute;
        top:40px;left:40px;right:40px;
        height:380px;
        background:linear-gradient(135deg, #2a1f0e 0%, #1a1208 100%);
        border:1px solid rgba(212,175,55,0.2);
        border-radius:6px;
        overflow:hidden;
      ">
        <!-- Decorative art deco pattern -->
        <div style="
          position:absolute;inset:0;
          background:
            repeating-linear-gradient(45deg, transparent 0, transparent 12px, rgba(212,175,55,0.04) 12px, rgba(212,175,55,0.04) 13px),
            repeating-linear-gradient(-45deg, transparent 0, transparent 12px, rgba(212,175,55,0.03) 12px, rgba(212,175,55,0.03) 13px);
        "></div>
        <!-- Center vinyl circle hint -->
        <div style="
          position:absolute;
          top:50%;left:50%;transform:translate(-50%,-50%);
          width:200px;height:200px;
          border-radius:50%;
          background:radial-gradient(circle, #111 0%, #1a1a1a 60%, transparent 100%);
          border:2px solid rgba(212,175,55,0.15);
        "></div>
        <!-- Art label text -->
        <div style="position:absolute;bottom:18px;left:0;right:0;text-align:center;">
          <div style="font-size:11px;letter-spacing:4px;color:rgba(212,175,55,0.5);text-transform:uppercase;">Original Issue</div>
        </div>
      </div>

      <!-- Album title area -->
      <div style="
        position:absolute;
        top:450px;left:40px;right:40px;
      ">
        <div style="
          font-size:13px;
          letter-spacing:5px;
          color:rgba(212,175,55,0.6);
          text-transform:uppercase;
          margin-bottom:10px;
          font-family:'Georgia',serif;
        ">@madebyaidan presents</div>
        <div style="
          font-size:52px;
          font-weight:700;
          color:#d4af37;
          line-height:1.0;
          letter-spacing:1px;
          font-family:'Georgia',serif;
          text-shadow: 0 2px 12px rgba(212,175,55,0.4);
        ">MANILA</div>
        <div style="
          font-size:28px;
          font-weight:400;
          color:rgba(212,175,55,0.8);
          letter-spacing:3px;
          font-family:'Georgia',serif;
          margin-top:2px;
        ">FREE PHOTO SHOOT</div>
        <div style="
          margin-top:18px;
          font-size:11px;
          letter-spacing:3px;
          color:rgba(255,255,255,0.25);
          text-transform:uppercase;
        ">Limited Edition · Not For Sale</div>
      </div>

      <!-- Bottom strip -->
      <div style="
        position:absolute;bottom:0;left:0;right:0;height:30px;
        background:linear-gradient(90deg, #d4af37 0%, #8b6914 30%, #d4af37 60%, #8b6914 100%);
        border-radius:0 0 10px 10px;
        opacity:0.4;
      "></div>
    </div>
  </div>

  <!-- ===================== VINYL RECORD SCENE ===================== -->
  <div id="vinyl-scene" style="
    position:absolute;
    left:50%;
    top:460px;
    transform:translateX(-50%);
    width:760px;
    height:760px;
    z-index:20;
    opacity:0;
  ">
    <!-- Spinning record wrapper -->
    <div id="record-spinner" style="
      position:absolute;
      top:50%;left:50%;
      transform:translate(-50%,-50%);
      width:700px;height:700px;
    ">
      <!-- Record disc -->
      <div id="record-disc" style="
        width:700px;height:700px;
        border-radius:50%;
        background:
          repeating-radial-gradient(
            circle at center,
            #0d0d0d 0px,
            #111 1.5px,
            #0a0a0a 3px,
            #151515 4.5px,
            #0d0d0d 6px,
            #0a0a0a 7px,
            #131313 9px,
            #0d0d0d 10.5px,
            #111 12px
          );
        box-shadow:
          0 0 0 2px #222,
          0 8px 60px rgba(0,0,0,0.9),
          inset 0 0 40px rgba(0,0,0,0.5);
        position:relative;
        overflow:hidden;
      ">
        <!-- Groove shine overlay — rotating shimmer -->
        <div style="
          position:absolute;inset:0;border-radius:50%;
          background:
            conic-gradient(
              from 0deg at 50% 50%,
              transparent 0deg,
              rgba(255,255,255,0.03) 15deg,
              transparent 30deg,
              rgba(255,255,255,0.015) 60deg,
              transparent 90deg,
              rgba(255,255,255,0.04) 120deg,
              transparent 150deg,
              rgba(255,255,255,0.02) 200deg,
              transparent 240deg,
              rgba(255,255,255,0.035) 270deg,
              transparent 300deg,
              rgba(255,255,255,0.01) 330deg,
              transparent 360deg
            );
        "></div>

        <!-- Inner dead-wax ring -->
        <div style="
          position:absolute;
          top:50%;left:50%;
          transform:translate(-50%,-50%);
          width:260px;height:260px;
          border-radius:50%;
          background:radial-gradient(circle, #181818 0%, #111 100%);
          border:1px solid #333;
        "></div>

        <!-- CENTER LABEL — photo area -->
        <div id="vinyl-label" style="
          position:absolute;
          top:50%;left:50%;
          transform:translate(-50%,-50%);
          width:220px;height:220px;
          border-radius:50%;
          overflow:hidden;
          background:linear-gradient(135deg, #2e1a08 0%, #1a0e04 100%);
          border:3px solid #d4af37;
          box-shadow:0 0 20px rgba(212,175,55,0.3);
        ">
          <!-- Photo layers (circular clipped) -->
          ${photoImgTags}

          <!-- Label overlay text (hidden when photo is showing) -->
          <div id="label-text-overlay" style="
            position:absolute;inset:0;
            display:flex;flex-direction:column;
            align-items:center;justify-content:center;
            background:radial-gradient(circle, rgba(30,15,5,0.0) 0%, rgba(20,10,3,0.6) 100%);
            z-index:10;
          ">
            <div id="track-display" style="
              font-size:11px;
              letter-spacing:2px;
              color:rgba(212,175,55,0.9);
              text-transform:uppercase;
              font-family:'Georgia',serif;
              text-align:center;
              line-height:1.4;
              padding:0 14px;
            ">
              <div id="track-num" style="font-size:18px;font-weight:700;color:#d4af37;margin-bottom:2px;"></div>
              <div id="track-status" style="font-size:9px;letter-spacing:3px;color:rgba(212,175,55,0.6);"></div>
            </div>
          </div>

          <!-- Spindle hole -->
          <div style="
            position:absolute;
            top:50%;left:50%;
            transform:translate(-50%,-50%);
            width:14px;height:14px;
            border-radius:50%;
            background:#050505;
            border:1px solid #333;
            z-index:20;
          "></div>
        </div>

        <!-- Outer edge ring -->
        <div style="
          position:absolute;inset:0;border-radius:50%;
          border:3px solid rgba(60,60,60,0.8);
          pointer-events:none;
        "></div>
      </div>
    </div>
  </div>

  <!-- ===================== TONEARM ===================== -->
  <div id="tonearm-pivot" style="
    position:absolute;
    top:340px;
    right:50px;
    width:280px;
    height:400px;
    z-index:40;
    transform-origin: 90% 8%;
    transform: rotate(-28deg);
    opacity:0;
  ">
    <!-- Arm body -->
    <div style="
      position:absolute;
      top:28px;
      right:28px;
      width:14px;
      height:360px;
      background:linear-gradient(90deg, #666 0%, #aaa 20%, #888 50%, #777 80%, #555 100%);
      border-radius:7px;
      transform:rotate(-8deg);
      transform-origin:top center;
      box-shadow:2px 4px 12px rgba(0,0,0,0.7);
    "></div>
    <!-- Headshell -->
    <div style="
      position:absolute;
      bottom:0;
      right:14px;
      width:32px;
      height:50px;
      background:linear-gradient(180deg, #999 0%, #666 100%);
      border-radius:4px 4px 0 0;
      transform:rotate(5deg);
      transform-origin:top center;
      box-shadow:2px 4px 10px rgba(0,0,0,0.6);
    "></div>
    <!-- Needle/stylus -->
    <div style="
      position:absolute;
      bottom:-12px;
      right:24px;
      width:4px;
      height:18px;
      background:linear-gradient(180deg, #ccc 0%, #888 100%);
      border-radius:0 0 3px 3px;
      transform:rotate(5deg);
      transform-origin:top center;
    "></div>
    <!-- Pivot circle -->
    <div style="
      position:absolute;
      top:8px;
      right:14px;
      width:30px;height:30px;
      border-radius:50%;
      background:radial-gradient(circle, #bbb 0%, #777 60%, #444 100%);
      border:2px solid #555;
      box-shadow:0 2px 8px rgba(0,0,0,0.6);
    "></div>
  </div>

  <!-- ===================== TRACK LISTING PANEL ===================== -->
  <div id="track-panel" style="
    position:absolute;
    top:1310px;
    left:60px;
    right:60px;
    z-index:50;
    opacity:0;
  ">
    <div style="
      border-top:1px solid rgba(212,175,55,0.3);
      padding-top:16px;
    ">
      <div id="now-playing-label" style="
        font-size:11px;
        letter-spacing:4px;
        color:rgba(212,175,55,0.5);
        text-transform:uppercase;
        margin-bottom:8px;
        font-family:'Georgia',serif;
      ">Side A — Now Playing</div>
      <div id="now-playing-track" style="
        font-size:32px;
        font-weight:700;
        color:#d4af37;
        font-family:'Georgia',serif;
        letter-spacing:1px;
        animation:track-blink 1.2s ease-in-out infinite;
      ">Track 01</div>
      <div style="
        margin-top:10px;
        display:flex;gap:6px;align-items:center;
      ">
        <div id="eq-bar-1" style="width:4px;height:14px;background:#d4af37;border-radius:2px;animation:pulse-bar1 0.4s ease-in-out infinite alternate;"></div>
        <div id="eq-bar-2" style="width:4px;height:22px;background:#d4af37;border-radius:2px;animation:pulse-bar2 0.35s ease-in-out infinite alternate;"></div>
        <div id="eq-bar-3" style="width:4px;height:10px;background:#d4af37;border-radius:2px;animation:pulse-bar3 0.5s ease-in-out infinite alternate;"></div>
        <div id="eq-bar-4" style="width:4px;height:18px;background:#d4af37;border-radius:2px;animation:pulse-bar1 0.45s ease-in-out infinite alternate;"></div>
        <div id="eq-bar-5" style="width:4px;height:26px;background:#d4af37;border-radius:2px;animation:pulse-bar2 0.38s ease-in-out infinite alternate;"></div>
        <div id="eq-bar-6" style="width:4px;height:8px;background:#d4af37;border-radius:2px;animation:pulse-bar3 0.42s ease-in-out infinite alternate;"></div>
        <div id="eq-bar-7" style="width:4px;height:20px;background:#d4af37;border-radius:2px;animation:pulse-bar1 0.36s ease-in-out infinite alternate;"></div>
        <div style="margin-left:8px;font-size:13px;color:rgba(212,175,55,0.5);letter-spacing:2px;font-family:'Georgia',serif;">▶ PLAYING</div>
      </div>
    </div>
  </div>

  <!-- ===================== LINER NOTES PANEL ===================== -->
  <div id="liner-notes" style="
    position:absolute;
    top:460px;
    left:80px;
    right:80px;
    z-index:60;
    opacity:0;
  ">
    <div style="
      border:1px solid rgba(212,175,55,0.2);
      border-radius:10px;
      padding:50px 60px;
      background:rgba(26,21,16,0.95);
      box-shadow:0 8px 40px rgba(0,0,0,0.7);
    ">
      <div style="
        font-size:11px;
        letter-spacing:6px;
        color:rgba(212,175,55,0.5);
        text-transform:uppercase;
        margin-bottom:36px;
        font-family:'Georgia',serif;
      ">LINER NOTES</div>
      <div style="
        font-size:26px;
        color:rgba(212,175,55,0.7);
        margin-bottom:30px;
        font-family:'Georgia',serif;
        letter-spacing:1px;
      ">Side A: How to Book</div>

      <div id="liner-line-1" style="
        opacity:0;
        font-size:32px;
        color:rgba(255,255,255,0.9);
        font-family:'Georgia',serif;
        margin-bottom:20px;
        line-height:1.3;
      "><span style="color:#d4af37;margin-right:14px;">1.</span>DM @madebyaidan on Instagram</div>

      <div id="liner-line-2" style="
        opacity:0;
        font-size:32px;
        color:rgba(255,255,255,0.9);
        font-family:'Georgia',serif;
        margin-bottom:20px;
        line-height:1.3;
      "><span style="color:#d4af37;margin-right:14px;">2.</span>Pick your date</div>

      <div id="liner-line-3" style="
        opacity:0;
        font-size:32px;
        color:rgba(255,255,255,0.9);
        font-family:'Georgia',serif;
        margin-bottom:36px;
        line-height:1.3;
      "><span style="color:#d4af37;margin-right:14px;">3.</span>Show up. Get photographed.</div>

      <div id="liner-line-4" style="
        opacity:0;
        border-top:1px solid rgba(212,175,55,0.15);
        padding-top:28px;
        font-size:18px;
        color:rgba(212,175,55,0.4);
        font-family:'Georgia',serif;
        letter-spacing:2px;
        text-transform:uppercase;
      ">Produced in Manila · @madebyaidan · Free of charge</div>
    </div>
  </div>

  <!-- ===================== SIDE B / CTA ===================== -->
  <div id="side-b-scene" style="
    position:absolute;
    left:50%;
    top:430px;
    transform:translateX(-50%);
    width:760px;
    height:870px;
    z-index:70;
    opacity:0;
  ">
    <!-- Side B record -->
    <div id="side-b-record" style="
      position:absolute;
      top:0;left:50%;
      transform:translateX(-50%);
      width:680px;height:680px;
    ">
      <div style="
        width:680px;height:680px;
        border-radius:50%;
        background:
          repeating-radial-gradient(
            circle at center,
            #0d0d0d 0px,
            #111 1.5px,
            #0a0a0a 3px,
            #151515 4.5px,
            #0d0d0d 6px,
            #0a0a0a 7px,
            #131313 9px,
            #0d0d0d 10.5px,
            #111 12px
          );
        box-shadow:
          0 0 0 2px #222,
          0 8px 60px rgba(0,0,0,0.9),
          inset 0 0 40px rgba(0,0,0,0.5);
        position:relative;
        overflow:hidden;
      ">
        <!-- Groove shimmer -->
        <div style="
          position:absolute;inset:0;border-radius:50%;
          background:conic-gradient(
            from 45deg at 50% 50%,
            transparent 0deg,
            rgba(255,255,255,0.03) 20deg,
            transparent 40deg,
            rgba(255,255,255,0.02) 90deg,
            transparent 130deg,
            rgba(255,255,255,0.04) 200deg,
            transparent 250deg,
            rgba(255,255,255,0.02) 300deg,
            transparent 360deg
          );
        "></div>

        <!-- Dead wax ring -->
        <div style="
          position:absolute;top:50%;left:50%;
          transform:translate(-50%,-50%);
          width:280px;height:280px;
          border-radius:50%;
          background:radial-gradient(circle, #181818 0%, #111 100%);
          border:1px solid #333;
        "></div>

        <!-- Side B label — CTA -->
        <div style="
          position:absolute;
          top:50%;left:50%;
          transform:translate(-50%,-50%);
          width:240px;height:240px;
          border-radius:50%;
          background:radial-gradient(circle, #1a0d04 0%, #100802 100%);
          border:3px solid #d4af37;
          box-shadow:0 0 30px rgba(212,175,55,0.5);
          display:flex;flex-direction:column;
          align-items:center;justify-content:center;
          animation:pulse-glow 2s ease-in-out infinite;
        ">
          <div style="font-size:9px;letter-spacing:3px;color:rgba(212,175,55,0.5);text-transform:uppercase;margin-bottom:8px;font-family:'Georgia',serif;">Side B</div>
          <div style="font-size:28px;font-weight:700;color:#d4af37;font-family:'Georgia',serif;text-align:center;line-height:1.1;">@madebyaidan</div>
          <div style="margin:8px 0;width:60px;height:1px;background:rgba(212,175,55,0.3);"></div>
          <div style="font-size:8px;letter-spacing:2px;color:rgba(212,175,55,0.5);text-transform:uppercase;font-family:'Georgia',serif;text-align:center;">Instagram</div>
          <!-- Spindle hole -->
          <div style="
            position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
            width:14px;height:14px;border-radius:50%;
            background:#050505;border:1px solid #333;
          "></div>
        </div>
      </div>
    </div>

    <!-- DM me text below -->
    <div style="
      position:absolute;
      top:700px;
      left:0;right:0;
      text-align:center;
    ">
      <div style="
        font-size:40px;
        font-weight:700;
        color:#d4af37;
        font-family:'Georgia',serif;
        letter-spacing:3px;
        text-transform:uppercase;
        text-shadow:0 2px 20px rgba(212,175,55,0.5);
        margin-bottom:14px;
      ">DM ME ON INSTAGRAM</div>
      <div style="
        font-size:18px;
        color:rgba(212,175,55,0.5);
        letter-spacing:3px;
        text-transform:uppercase;
        font-family:'Georgia',serif;
      ">FREE · NO STRINGS · LIMITED EDITION</div>
    </div>
  </div>

  <!-- ===================== TITLE OVERLAY (top, always on) ===================== -->
  <div id="top-title" style="
    position:absolute;
    top:200px;
    left:80px;
    right:80px;
    z-index:80;
    opacity:0;
    text-align:center;
  ">
    <div style="
      font-size:13px;
      letter-spacing:6px;
      color:rgba(212,175,55,0.5);
      text-transform:uppercase;
      font-family:'Georgia',serif;
      margin-bottom:12px;
    ">@madebyaidan presents</div>
    <div style="
      font-size:66px;
      font-weight:700;
      color:#d4af37;
      font-family:'Georgia',serif;
      letter-spacing:2px;
      line-height:1.0;
      text-shadow:0 3px 20px rgba(212,175,55,0.4);
    ">MANILA</div>
    <div style="
      font-size:26px;
      color:rgba(212,175,55,0.7);
      font-family:'Georgia',serif;
      letter-spacing:4px;
      text-transform:uppercase;
      margin-top:6px;
    ">Free Photo Shoot</div>
  </div>

  <!-- Vignette overlay -->
  <div style="
    position:absolute;inset:0;
    background:radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.5) 100%);
    z-index:90;pointer-events:none;
  "></div>

  <!-- Extra EQ animation styles -->
  <style>
    @keyframes pulse-bar1 { from { height:6px; } to { height:22px; } }
    @keyframes pulse-bar2 { from { height:10px; } to { height:30px; } }
    @keyframes pulse-bar3 { from { height:4px; } to { height:18px; } }
  </style>

</div>

<script>
  var PHOTO_COUNT = ${PHOTO_NAMES.length};
  var FPS = ${FPS};

  // Element refs
  var sleeve = document.getElementById('sleeve');
  var vinylScene = document.getElementById('vinyl-scene');
  var recordSpinner = document.getElementById('record-spinner');
  var recordDisc = document.getElementById('record-disc');
  var tonearm = document.getElementById('tonearm-pivot');
  var trackPanel = document.getElementById('track-panel');
  var linerNotes = document.getElementById('liner-notes');
  var sideBScene = document.getElementById('side-b-scene');
  var sideBRecord = document.getElementById('side-b-record');
  var topTitle = document.getElementById('top-title');
  var trackNumEl = document.getElementById('track-num');
  var trackStatusEl = document.getElementById('track-status');
  var nowPlayingTrack = document.getElementById('now-playing-track');
  var trackPanelEl = document.getElementById('track-panel');
  var labelTextOverlay = document.getElementById('label-text-overlay');

  function showPhoto(idx) {
    for (var i = 0; i < PHOTO_COUNT; i++) {
      var el = document.getElementById('vinyl-photo-' + i);
      if (el) el.style.opacity = i === idx ? '1' : '0';
    }
    if (trackNumEl) {
      var n = String(idx + 1).padStart(2, '0');
      trackNumEl.textContent = 'TRACK ' + n;
      trackStatusEl.textContent = '▶ NOW PLAYING';
    }
    if (nowPlayingTrack) nowPlayingTrack.textContent = 'Track ' + String(idx + 1).padStart(2, '0');
    if (labelTextOverlay) labelTextOverlay.style.opacity = '0.6';
  }

  function hideAllPhotos() {
    for (var i = 0; i < PHOTO_COUNT; i++) {
      var el = document.getElementById('vinyl-photo-' + i);
      if (el) el.style.opacity = '0';
    }
    if (labelTextOverlay) labelTextOverlay.style.opacity = '1';
  }

  function ease(t, from, to, duration) {
    if (t <= from) return 0;
    if (t >= from + duration) return 1;
    var p = (t - from) / duration;
    return p * p * (3 - 2 * p); // smoothstep
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  window.__applyUpTo = function(t) {
    // ---- 0-2s: Sleeve slides in, title fades in ----
    if (t < 2.0) {
      var sleeveProgress = ease(t, 0, 1.0, 1.2);
      var sleeveY = lerp(120, 0, sleeveProgress);
      sleeve.style.transform = 'translateX(-50%) translateY(' + sleeveY + '%)';
      sleeve.style.opacity = sleeveProgress > 0 ? '1' : '0';

      topTitle.style.opacity = ease(t, 0.3, 1.0, 0.8).toString();

      vinylScene.style.opacity = '0';
      tonearm.style.opacity = '0';
      tonearm.style.transform = 'rotate(-28deg)';
      trackPanel.style.opacity = '0';
      linerNotes.style.opacity = '0';
      sideBScene.style.opacity = '0';
      hideAllPhotos();
      recordSpinner.style.transform = 'translate(-50%,-50%) rotate(0deg)';
    }

    // ---- 2-3s: Record slides out of sleeve. Sleeve slides away. ----
    else if (t < 3.0) {
      sleeve.style.opacity = '1';
      topTitle.style.opacity = '1';

      var sleeveOut = ease(t, 2.0, 0.7, 0.8);
      var sleeveY2 = lerp(0, -110, sleeveOut);
      sleeve.style.transform = 'translateX(-50%) translateY(' + sleeveY2 + '%)';

      var recordIn = ease(t, 2.0, 0.5, 0.8);
      vinylScene.style.opacity = recordIn.toString();
      vinylScene.style.transform = 'translateX(-50%) translateY(' + lerp(40, 0, recordIn) + 'px)';

      tonearm.style.opacity = recordIn.toString();
      tonearm.style.transform = 'rotate(-28deg)';
      trackPanel.style.opacity = '0';
      linerNotes.style.opacity = '0';
      sideBScene.style.opacity = '0';
      hideAllPhotos();
      recordSpinner.style.transform = 'translate(-50%,-50%) rotate(0deg)';
    }

    // ---- 3-4s: Needle swings in, record starts spinning ----
    else if (t < 4.0) {
      sleeve.style.opacity = '0';
      topTitle.style.opacity = '1';
      vinylScene.style.opacity = '1';
      vinylScene.style.transform = 'translateX(-50%)';
      tonearm.style.opacity = '1';

      // needle swings from -28deg to -5deg
      var armProgress = ease(t, 3.0, 0.7, 0.9);
      var armAngle = lerp(-28, -5, armProgress);
      tonearm.style.transform = 'rotate(' + armAngle + 'deg)';

      // record starts spinning — ramp up from 0
      var spinProgress = ease(t, 3.4, 0.5, 0.5);
      var spinDeg = spinProgress * 60;
      recordSpinner.style.transform = 'translate(-50%,-50%) rotate(' + spinDeg + 'deg)';

      trackPanel.style.opacity = '0';
      linerNotes.style.opacity = '0';
      sideBScene.style.opacity = '0';
      hideAllPhotos();
    }

    // ---- 4-14s: Photos appear as album art, record spins ----
    else if (t < 14.0) {
      sleeve.style.opacity = '0';
      topTitle.style.opacity = '1';
      vinylScene.style.opacity = '1';
      vinylScene.style.transform = 'translateX(-50%)';
      tonearm.style.opacity = '1';
      tonearm.style.transform = 'rotate(-5deg)';
      linerNotes.style.opacity = '0';
      sideBScene.style.opacity = '0';

      // Full speed spinning — 1.5 rotations per second = 540deg/s from t=4
      var spinAngle = (t - 3.4) * 540;
      recordSpinner.style.transform = 'translate(-50%,-50%) rotate(' + spinAngle + 'deg)';

      // Track panel
      trackPanel.style.opacity = ease(t, 4.0, 0.3, 0.5).toString();

      // 8 photos, ~1.25s each, starting at t=4
      var photoInterval = 1.25;
      var photoIndex = Math.floor((t - 4.0) / photoInterval);
      var photoFrac = ((t - 4.0) % photoInterval) / photoInterval;

      // scratch jitter at track change
      var isScratch = photoFrac < 0.1;
      if (photoIndex >= 0 && photoIndex < PHOTO_COUNT) {
        showPhoto(photoIndex);
        if (isScratch && photoIndex > 0) {
          // brief stutter visual — slight opacity flicker
          var flickerOpacity = 0.6 + 0.4 * Math.sin(photoFrac * 60);
          var el = document.getElementById('vinyl-photo-' + photoIndex);
          if (el) el.style.opacity = flickerOpacity.toString();
        }
      } else if (photoIndex >= PHOTO_COUNT) {
        showPhoto(PHOTO_COUNT - 1);
      }
    }

    // ---- 14-15s: Needle lifts, record slows ----
    else if (t < 15.0) {
      sleeve.style.opacity = '0';
      topTitle.style.opacity = '1';
      vinylScene.style.opacity = '1';
      vinylScene.style.transform = 'translateX(-50%)';
      tonearm.style.opacity = '1';
      linerNotes.style.opacity = '0';
      sideBScene.style.opacity = '0';
      showPhoto(PHOTO_COUNT - 1);

      // Needle swings back out
      var liftProgress = ease(t, 14.0, 0.6, 0.8);
      var liftAngle = lerp(-5, -28, liftProgress);
      tonearm.style.transform = 'rotate(' + liftAngle + 'deg)';

      // Record slows down
      var slowProgress = ease(t, 14.0, 0.8, 1.0);
      var baseAngle = (10.6) * 540; // angle at t=14
      var currentSpin = baseAngle + lerp(0, 80, 1 - Math.pow(1 - slowProgress, 2));
      recordSpinner.style.transform = 'translate(-50%,-50%) rotate(' + currentSpin + 'deg)';

      trackPanel.style.opacity = lerp(1, 0, liftProgress).toString();
    }

    // ---- 15-18s: Liner notes ----
    else if (t < 18.0) {
      sleeve.style.opacity = '0';
      topTitle.style.opacity = lerp(1, 0, ease(t, 15.0, 0.4, 0.5)).toString();
      vinylScene.style.opacity = lerp(1, 0, ease(t, 15.0, 0.4, 0.5)).toString();
      tonearm.style.opacity = lerp(1, 0, ease(t, 15.0, 0.4, 0.5)).toString();
      trackPanel.style.opacity = '0';
      sideBScene.style.opacity = '0';
      hideAllPhotos();

      // Liner notes fade in
      linerNotes.style.opacity = ease(t, 15.3, 0.4, 0.7).toString();

      // Sequential line reveals
      var l1 = document.getElementById('liner-line-1');
      var l2 = document.getElementById('liner-line-2');
      var l3 = document.getElementById('liner-line-3');
      var l4 = document.getElementById('liner-line-4');
      if (l1) l1.style.opacity = ease(t, 15.6, 0.3, 0.4).toString();
      if (l2) l2.style.opacity = ease(t, 16.1, 0.3, 0.4).toString();
      if (l3) l3.style.opacity = ease(t, 16.6, 0.3, 0.4).toString();
      if (l4) l4.style.opacity = ease(t, 17.2, 0.3, 0.4).toString();

      // record stays at rest angle
      recordSpinner.style.transform = 'translate(-50%,-50%) rotate(' + ((10.6 * 540) + 80) + 'deg)';
    }

    // ---- 18-22s: Side B flip + CTA ----
    else if (t < 22.0) {
      sleeve.style.opacity = '0';
      topTitle.style.opacity = '0';
      vinylScene.style.opacity = '0';
      tonearm.style.opacity = '0';
      trackPanel.style.opacity = '0';
      linerNotes.style.opacity = '0';
      hideAllPhotos();

      sideBScene.style.opacity = ease(t, 18.0, 0.3, 0.5).toString();

      // Flip animation: scale X 1 -> 0 -> 1
      var flipT = t - 18.0;
      var flipDuration = 1.2;
      var scaleX;
      if (flipT < flipDuration) {
        var flipP = flipT / flipDuration;
        if (flipP < 0.5) {
          scaleX = lerp(1, 0, flipP * 2);
        } else {
          scaleX = lerp(0, 1, (flipP - 0.5) * 2);
        }
        sideBRecord.style.transform = 'translateX(-50%) scaleX(' + scaleX + ')';
      } else {
        sideBRecord.style.transform = 'translateX(-50%) scaleX(1)';
      }

      // Side B record spins slowly
      var sideBSpin = (t - 18.0) * 60; // slow rotation 1 rev per 6 seconds
      sideBRecord.style.transform = 'translateX(-50%) scaleX(' + (flipT < flipDuration ? scaleX : 1) + ') rotate(' + sideBSpin + 'deg)';
    }

    // ---- 22-24s: Hold, record keeps spinning ----
    else {
      sleeve.style.opacity = '0';
      topTitle.style.opacity = '0';
      vinylScene.style.opacity = '0';
      tonearm.style.opacity = '0';
      trackPanel.style.opacity = '0';
      linerNotes.style.opacity = '0';
      hideAllPhotos();

      sideBScene.style.opacity = '1';
      var holdSpin = (t - 18.0) * 60;
      sideBRecord.style.transform = 'translateX(-50%) rotate(' + holdSpin + 'deg)';
    }
  };

  if (location.search.includes('capture=1')) {
    var style = document.createElement('style');
    style.textContent = '*, *::before, *::after { transition-duration: 0s !important; animation-duration: 0.001s !important; animation-play-state: paused !important; }';
    document.head.appendChild(style);
  }
</script>
</body>
</html>`;
}

async function main() {
  console.log('=== Vinyl Record Reel v65a ===');
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
  await page.waitForTimeout(500);

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

  var outputMp4 = path.join(OUT_DIR, 'manila-vinyl-v65a.mp4');
  execSync(
    'ffmpeg -y -framerate ' + FPS + ' -i "' + path.join(framesDir, 'frame_%05d.png') + '" ' +
    '-c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r ' + FPS + ' -an "' + outputMp4 + '"',
    { stdio: 'inherit' }
  );

  rmSync(framesDir, { recursive: true, force: true });

  var reelsDir = path.join(__dirname, 'reels');
  if (!existsSync(reelsDir)) mkdirSync(reelsDir, { recursive: true });
  var reelsDst = path.join(reelsDir, 'manila-vinyl-v65a.mp4');
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
