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
var TOTAL_FRAMES = 420; // 14s at 30fps
var TOTAL_DURATION = 14;

var FILM_SCANS_DIR = '/Volumes/PortableSSD/Exports/film scans';
var PHOTO_NAMES = [
  'DSC_0797.jpg',
  'DSC_0804.jpg',
  'DSC_0807.jpg',
  'DSC_0809.jpg',
  'DSC_0824.jpg',
  'DSC_0835-2.jpg',
  'DSC_0839.jpg',
  'DSC_0840.jpg',
  'DSC_0841.jpg',
  'DSC_0842.jpg',
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
    return '<img id="vinyl-photo-' + i + '" src="' + imageDataMap[name] + '" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;" />';
  }).join('\n      ');

  // Full-screen photo display tags
  var fullPhotoTags = PHOTO_NAMES.map(function(name, i) {
    return '<div id="full-photo-' + i + '" style="position:absolute;left:0;top:0;width:' + W + 'px;height:' + H + 'px;display:flex;align-items:center;justify-content:center;z-index:35;opacity:0;pointer-events:none;"><img src="' + imageDataMap[name] + '" style="width:920px;height:690px;object-fit:cover;border-radius:8px;box-shadow:0 8px 60px rgba(0,0,0,0.7);" /></div>';
  }).join('\n    ');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { margin: 0; padding: 0; overflow: hidden; }
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

  <!-- Wood grain turntable background -->
  <div id="bg-surface" style="
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
      linear-gradient(175deg, #2a1810 0%, #221a0f 40%, #1a1510 100%);
    z-index:0;
    opacity:0;
  "></div>

  <!-- Ambient warm light -->
  <div style="
    position:absolute;top:-200px;left:50%;transform:translateX(-50%);
    width:900px;height:600px;
    background:radial-gradient(ellipse at center, rgba(180,120,40,0.12) 0%, transparent 70%);
    z-index:1;pointer-events:none;
  "></div>

  <!-- ===================== ALBUM SLEEVE ===================== -->
  <div id="sleeve" style="
    position:absolute;
    left:50%;top:520px;
    transform:translateX(-50%) translateY(120%);
    width:720px;height:720px;
    z-index:30;
    opacity:0;
  ">
    <div style="
      position:absolute;inset:0;
      background:linear-gradient(145deg, #2e2318 0%, #1e1810 60%, #141008 100%);
      border-radius:12px;
      border:2px solid rgba(212,175,55,0.25);
      box-shadow:8px 12px 40px rgba(0,0,0,0.7),inset 1px 1px 0 rgba(255,255,255,0.06),inset -1px -1px 0 rgba(0,0,0,0.4);
    ">
      <!-- Spine highlight -->
      <div style="position:absolute;left:0;top:0;bottom:0;width:18px;background:linear-gradient(90deg, rgba(212,175,55,0.15) 0%, transparent 100%);border-radius:12px 0 0 12px;"></div>
      <!-- Album art area -->
      <div style="position:absolute;top:40px;left:40px;right:40px;height:380px;background:linear-gradient(135deg, #2a1f0e 0%, #1a1208 100%);border:1px solid rgba(212,175,55,0.2);border-radius:6px;overflow:hidden;">
        <div style="position:absolute;inset:0;background:repeating-linear-gradient(45deg, transparent 0, transparent 12px, rgba(212,175,55,0.04) 12px, rgba(212,175,55,0.04) 13px),repeating-linear-gradient(-45deg, transparent 0, transparent 12px, rgba(212,175,55,0.03) 12px, rgba(212,175,55,0.03) 13px);"></div>
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:200px;height:200px;border-radius:50%;background:radial-gradient(circle, #111 0%, #1a1a1a 60%, transparent 100%);border:2px solid rgba(212,175,55,0.15);"></div>
        <div style="position:absolute;bottom:18px;left:0;right:0;text-align:center;">
          <div style="font-size:11px;letter-spacing:4px;color:rgba(212,175,55,0.5);text-transform:uppercase;">Original Issue</div>
        </div>
      </div>
      <!-- Album title -->
      <div style="position:absolute;top:450px;left:40px;right:40px;">
        <div style="font-size:13px;letter-spacing:5px;color:rgba(212,175,55,0.6);text-transform:uppercase;margin-bottom:10px;">@madebyaidan presents</div>
        <div style="font-size:52px;font-weight:700;color:#d4af37;line-height:1.0;letter-spacing:1px;text-shadow:0 2px 12px rgba(212,175,55,0.4);">MANILA</div>
        <div style="font-size:28px;font-weight:400;color:rgba(212,175,55,0.8);letter-spacing:3px;margin-top:2px;">FREE PHOTO SHOOT</div>
        <div style="margin-top:18px;font-size:11px;letter-spacing:3px;color:rgba(255,255,255,0.25);text-transform:uppercase;">Limited Edition</div>
      </div>
      <!-- Bottom strip -->
      <div style="position:absolute;bottom:0;left:0;right:0;height:30px;background:linear-gradient(90deg, #d4af37 0%, #8b6914 30%, #d4af37 60%, #8b6914 100%);border-radius:0 0 10px 10px;opacity:0.4;"></div>
    </div>
  </div>

  <!-- ===================== VINYL RECORD ===================== -->
  <div id="vinyl-scene" style="
    position:absolute;
    left:50%;top:460px;
    transform:translateX(-50%);
    width:760px;height:760px;
    z-index:20;
    opacity:0;
  ">
    <div id="record-spinner" style="
      position:absolute;
      top:50%;left:50%;
      transform:translate(-50%,-50%);
      width:700px;height:700px;
    ">
      <div id="record-disc" style="
        width:700px;height:700px;
        border-radius:50%;
        background:
          repeating-radial-gradient(
            circle at center,
            #0d0d0d 0px, #111 1.5px, #0a0a0a 3px,
            #151515 4.5px, #0d0d0d 6px, #0a0a0a 7px,
            #131313 9px, #0d0d0d 10.5px, #111 12px
          );
        box-shadow:0 0 0 2px #222,0 8px 60px rgba(0,0,0,0.9),inset 0 0 40px rgba(0,0,0,0.5);
        position:relative;overflow:hidden;
      ">
        <!-- Groove shimmer -->
        <div style="position:absolute;inset:0;border-radius:50%;background:conic-gradient(from 0deg at 50% 50%,transparent 0deg,rgba(255,255,255,0.03) 15deg,transparent 30deg,rgba(255,255,255,0.015) 60deg,transparent 90deg,rgba(255,255,255,0.04) 120deg,transparent 150deg,rgba(255,255,255,0.02) 200deg,transparent 240deg,rgba(255,255,255,0.035) 270deg,transparent 300deg,rgba(255,255,255,0.01) 330deg,transparent 360deg);"></div>
        <!-- Dead wax ring -->
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:260px;height:260px;border-radius:50%;background:radial-gradient(circle, #181818 0%, #111 100%);border:1px solid #333;"></div>
        <!-- Center label -->
        <div id="vinyl-label" style="
          position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
          width:220px;height:220px;border-radius:50%;overflow:hidden;
          background:linear-gradient(135deg, #2e1a08 0%, #1a0e04 100%);
          border:3px solid #d4af37;
          box-shadow:0 0 20px rgba(212,175,55,0.3);
        ">
          ${photoImgTags}
          <div id="label-text-overlay" style="
            position:absolute;inset:0;
            display:flex;flex-direction:column;
            align-items:center;justify-content:center;
            background:radial-gradient(circle, rgba(30,15,5,0.0) 0%, rgba(20,10,3,0.6) 100%);
            z-index:10;
          ">
            <div id="track-display" style="font-size:11px;letter-spacing:2px;color:rgba(212,175,55,0.9);text-transform:uppercase;text-align:center;line-height:1.4;padding:0 14px;">
              <div id="track-num" style="font-size:18px;font-weight:700;color:#d4af37;margin-bottom:2px;"></div>
              <div id="track-status" style="font-size:9px;letter-spacing:3px;color:rgba(212,175,55,0.6);"></div>
            </div>
          </div>
          <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:14px;height:14px;border-radius:50%;background:#050505;border:1px solid #333;z-index:20;"></div>
        </div>
        <!-- Outer edge ring -->
        <div style="position:absolute;inset:0;border-radius:50%;border:3px solid rgba(60,60,60,0.8);pointer-events:none;"></div>
      </div>
    </div>
  </div>

  <!-- ===================== TONEARM ===================== -->
  <div id="tonearm-pivot" style="
    position:absolute;top:340px;right:50px;
    width:280px;height:400px;z-index:40;
    transform-origin:90% 8%;
    transform:rotate(-28deg);
    opacity:0;
  ">
    <div style="position:absolute;top:28px;right:28px;width:14px;height:360px;background:linear-gradient(90deg, #666 0%, #aaa 20%, #888 50%, #777 80%, #555 100%);border-radius:7px;transform:rotate(-8deg);transform-origin:top center;box-shadow:2px 4px 12px rgba(0,0,0,0.7);"></div>
    <div style="position:absolute;bottom:0;right:14px;width:32px;height:50px;background:linear-gradient(180deg, #999 0%, #666 100%);border-radius:4px 4px 0 0;transform:rotate(5deg);transform-origin:top center;box-shadow:2px 4px 10px rgba(0,0,0,0.6);"></div>
    <div style="position:absolute;bottom:-12px;right:24px;width:4px;height:18px;background:linear-gradient(180deg, #ccc 0%, #888 100%);border-radius:0 0 3px 3px;transform:rotate(5deg);transform-origin:top center;"></div>
    <div style="position:absolute;top:8px;right:14px;width:30px;height:30px;border-radius:50%;background:radial-gradient(circle, #bbb 0%, #777 60%, #444 100%);border:2px solid #555;box-shadow:0 2px 8px rgba(0,0,0,0.6);"></div>
  </div>

  <!-- ===================== TRACK INFO PANEL ===================== -->
  <div id="track-panel" style="
    position:absolute;top:1310px;left:60px;right:60px;z-index:50;opacity:0;
  ">
    <div style="border-top:1px solid rgba(212,175,55,0.3);padding-top:16px;">
      <div style="font-size:11px;letter-spacing:4px;color:rgba(212,175,55,0.5);text-transform:uppercase;margin-bottom:8px;">Now Playing</div>
      <div id="now-playing-track" style="font-size:32px;font-weight:700;color:#d4af37;letter-spacing:1px;">Track 01</div>
      <div style="margin-top:10px;display:flex;gap:6px;align-items:center;">
        <div style="width:4px;height:14px;background:#d4af37;border-radius:2px;"></div>
        <div style="width:4px;height:22px;background:#d4af37;border-radius:2px;"></div>
        <div style="width:4px;height:10px;background:#d4af37;border-radius:2px;"></div>
        <div style="width:4px;height:18px;background:#d4af37;border-radius:2px;"></div>
        <div style="width:4px;height:26px;background:#d4af37;border-radius:2px;"></div>
        <div style="width:4px;height:8px;background:#d4af37;border-radius:2px;"></div>
        <div style="width:4px;height:20px;background:#d4af37;border-radius:2px;"></div>
      </div>
    </div>
  </div>

  <!-- ===================== FULL-SCREEN PHOTOS ===================== -->
  ${fullPhotoTags}

  <!-- ===================== HERO ZOOM SECTION ===================== -->
  <div id="hero-section" style="
    position:absolute;left:0;top:0;width:${W}px;height:${H}px;
    display:flex;align-items:center;justify-content:center;
    z-index:55;opacity:0;pointer-events:none;
  ">
    <div id="hero-circle" style="
      width:500px;height:500px;border-radius:50%;overflow:hidden;
      border:6px solid #d4af37;
      box-shadow:0 0 60px rgba(212,175,55,0.4),0 0 120px rgba(0,0,0,0.8);
    ">
      <img id="hero-img" src="${imageDataMap['DSC_0824.jpg']}" style="width:100%;height:100%;object-fit:cover;" />
    </div>
  </div>

  <!-- ===================== TEXT REVEAL ===================== -->
  <div id="text-reveal" style="
    position:absolute;left:0;top:0;width:${W}px;height:${H}px;
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    z-index:60;opacity:0;pointer-events:none;
  ">
    <div id="reveal-main" style="
      font-size:64px;font-weight:700;color:#f5e6c8;letter-spacing:3px;
      text-align:center;text-transform:uppercase;line-height:1.15;
      text-shadow:0 2px 20px rgba(0,0,0,0.6);
    ">MANILA FREE<br>PHOTO SHOOT</div>
    <div id="reveal-sub" style="
      font-size:18px;font-weight:300;letter-spacing:8px;color:#d4af37;
      text-transform:uppercase;margin-top:20px;opacity:0;
      font-family:'Helvetica Neue',Arial,sans-serif;
    ">Film Photography</div>
  </div>

  <!-- ===================== CTA ===================== -->
  <div id="cta-section" style="
    position:absolute;left:0;top:0;width:${W}px;height:${H}px;
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    z-index:70;opacity:0;pointer-events:none;
  ">
    <div id="cta-handle" style="
      font-size:72px;font-weight:400;color:#f5e6c8;letter-spacing:2px;
      text-shadow:0 2px 20px rgba(0,0,0,0.5);margin-bottom:16px;
    ">@madebyaidan</div>
    <div id="cta-dm" style="
      font-size:24px;font-weight:300;letter-spacing:6px;color:#d4af37;
      text-transform:uppercase;opacity:0;
      font-family:'Helvetica Neue',Arial,sans-serif;
    ">DM for a free session</div>
  </div>

  <!-- Vignette overlay -->
  <div style="
    position:absolute;inset:0;
    background:radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.5) 100%);
    z-index:90;pointer-events:none;
  "></div>

</div>

<script>
  var PHOTO_COUNT = ${PHOTO_NAMES.length};

  var sleeve = document.getElementById('sleeve');
  var bgSurface = document.getElementById('bg-surface');
  var vinylScene = document.getElementById('vinyl-scene');
  var recordSpinner = document.getElementById('record-spinner');
  var tonearm = document.getElementById('tonearm-pivot');
  var trackPanel = document.getElementById('track-panel');
  var trackNumEl = document.getElementById('track-num');
  var trackStatusEl = document.getElementById('track-status');
  var nowPlayingTrack = document.getElementById('now-playing-track');
  var labelTextOverlay = document.getElementById('label-text-overlay');
  var heroSection = document.getElementById('hero-section');
  var heroCircle = document.getElementById('hero-circle');
  var textReveal = document.getElementById('text-reveal');
  var revealMain = document.getElementById('reveal-main');
  var revealSub = document.getElementById('reveal-sub');
  var ctaSection = document.getElementById('cta-section');
  var ctaHandle = document.getElementById('cta-handle');
  var ctaDm = document.getElementById('cta-dm');

  function showPhoto(idx) {
    for (var i = 0; i < PHOTO_COUNT; i++) {
      var el = document.getElementById('vinyl-photo-' + i);
      if (el) el.style.opacity = i === idx ? '1' : '0';
    }
    if (trackNumEl) {
      trackNumEl.textContent = 'TRACK ' + String(idx + 1).padStart(2, '0');
      trackStatusEl.textContent = 'NOW PLAYING';
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

  function hideFullPhotos() {
    for (var i = 0; i < PHOTO_COUNT; i++) {
      var el = document.getElementById('full-photo-' + i);
      if (el) el.style.opacity = '0';
    }
  }

  function ease(t, from, dur) {
    if (t <= from) return 0;
    if (t >= from + dur) return 1;
    var p = (t - from) / dur;
    return p * p * (3 - 2 * p);
  }

  function lerp(a, b, t) { return a + (b - a) * Math.max(0, Math.min(1, t)); }

  window.__applyUpTo = function(t) {

    // ---- 0-0.8s: Surface fades in, sleeve slides up ----
    bgSurface.style.opacity = String(ease(t, 0, 0.8));

    // ---- 0-2s: Sleeve slides in from bottom, record emerges, tonearm lowers ----
    if (t < 2.0) {
      // Sleeve slides in (0-0.8s) then slides out (1.0-1.8s)
      if (t < 1.0) {
        var sleeveIn = ease(t, 0, 0.8);
        sleeve.style.transform = 'translateX(-50%) translateY(' + lerp(120, 0, sleeveIn) + '%)';
        sleeve.style.opacity = sleeveIn > 0.01 ? '1' : '0';
      } else {
        var sleeveOut = ease(t, 1.0, 0.8);
        sleeve.style.transform = 'translateX(-50%) translateY(' + lerp(0, -110, sleeveOut) + '%)';
        sleeve.style.opacity = String(1 - sleeveOut * 0.8);
      }

      // Record appears (0.8-1.5s)
      var recIn = ease(t, 0.8, 0.6);
      vinylScene.style.opacity = String(recIn);
      vinylScene.style.transform = 'translateX(-50%) translateY(' + lerp(40, 0, recIn) + 'px)';

      // Tonearm appears
      tonearm.style.opacity = String(ease(t, 1.0, 0.5));
      tonearm.style.transform = 'rotate(' + lerp(-28, -28, 0) + 'deg)';

      // Record not spinning yet
      recordSpinner.style.transform = 'translate(-50%,-50%) rotate(0deg)';

      trackPanel.style.opacity = '0';
      heroSection.style.opacity = '0';
      textReveal.style.opacity = '0';
      ctaSection.style.opacity = '0';
      hideAllPhotos();
      hideFullPhotos();
    }

    // ---- 2-2.5s: Tonearm drops, record starts spinning ----
    else if (t < 2.5) {
      sleeve.style.opacity = '0';
      vinylScene.style.opacity = '1';
      vinylScene.style.transform = 'translateX(-50%)';
      tonearm.style.opacity = '1';

      var armDrop = ease(t, 2.0, 0.4);
      tonearm.style.transform = 'rotate(' + lerp(-28, -5, armDrop) + 'deg)';

      var spinStart = ease(t, 2.2, 0.3);
      recordSpinner.style.transform = 'translate(-50%,-50%) rotate(' + (spinStart * 30) + 'deg)';

      trackPanel.style.opacity = '0';
      heroSection.style.opacity = '0';
      textReveal.style.opacity = '0';
      ctaSection.style.opacity = '0';
      hideAllPhotos();
      hideFullPhotos();
    }

    // ---- 2.5-8s: Record spins, photos pop out full-screen ----
    else if (t < 8.0) {
      sleeve.style.opacity = '0';
      vinylScene.style.opacity = '1';
      vinylScene.style.transform = 'translateX(-50%)';
      tonearm.style.opacity = '1';
      tonearm.style.transform = 'rotate(-5deg)';
      heroSection.style.opacity = '0';
      textReveal.style.opacity = '0';
      ctaSection.style.opacity = '0';

      // Full speed spinning
      var spinAngle = (t - 2.2) * 360;
      recordSpinner.style.transform = 'translate(-50%,-50%) rotate(' + spinAngle + 'deg)';

      // Track panel
      trackPanel.style.opacity = String(ease(t, 2.5, 0.4));

      // 8 photos (indices 0-7), ~0.69s each across 2.5-8.0 (5.5s)
      var photoInterval = 0.6875;
      var photoIdx = Math.floor((t - 2.5) / photoInterval);
      if (photoIdx >= 0 && photoIdx < 8) {
        showPhoto(photoIdx);

        // Full-screen photo display with pop effect
        var photoLocalT = ((t - 2.5) % photoInterval) / photoInterval;
        hideFullPhotos();
        var fullEl = document.getElementById('full-photo-' + photoIdx);
        if (fullEl) {
          var fadeIn = 0.15;
          var fadeOut = 0.15;
          if (photoLocalT < fadeIn) {
            var fi = photoLocalT / fadeIn;
            var fiEased = fi * fi * (3 - 2 * fi);
            fullEl.style.opacity = String(fiEased);
            fullEl.style.transform = 'scale(' + lerp(0.85, 1.0, fiEased) + ')';
          } else if (photoLocalT > 1 - fadeOut) {
            var fo = (photoLocalT - (1 - fadeOut)) / fadeOut;
            var foEased = fo * fo * (3 - 2 * fo);
            fullEl.style.opacity = String(1 - foEased);
            fullEl.style.transform = 'scale(1)';
          } else {
            fullEl.style.opacity = '1';
            fullEl.style.transform = 'scale(1)';
          }
        }
      } else {
        showPhoto(7);
        hideFullPhotos();
      }

      // Dim record while photos show
      vinylScene.style.opacity = '0.25';
    }

    // ---- 8-10s: Record label zooms in, hero photo ----
    else if (t < 10.0) {
      sleeve.style.opacity = '0';
      tonearm.style.opacity = String(1 - ease(t, 8.0, 0.4));
      trackPanel.style.opacity = String(1 - ease(t, 8.0, 0.3));
      textReveal.style.opacity = '0';
      ctaSection.style.opacity = '0';
      hideFullPhotos();
      hideAllPhotos();

      // Record zooms in and fades
      var zoomP = ease(t, 8.0, 1.2);
      var recScale = lerp(1, 2.5, zoomP);
      vinylScene.style.opacity = String(lerp(0.25, 1.0, ease(t, 8.0, 0.3)));
      vinylScene.style.transform = 'translateX(-50%) scale(' + recScale + ')';

      // Slow down spin
      var baseAngle = (8.0 - 2.2) * 360;
      var extraAngle = (t - 8.0) * 360 * (1 - ease(t, 8.0, 1.5));
      recordSpinner.style.transform = 'translate(-50%,-50%) rotate(' + (baseAngle + extraAngle) + 'deg)';

      // Hero circle fades in over the zoomed label
      var heroP = ease(t, 8.5, 0.8);
      heroSection.style.opacity = String(heroP);
      heroCircle.style.transform = 'scale(' + lerp(0.5, 1.0, heroP) + ')';

      // Fade record out as hero takes over
      if (t >= 9.0) {
        vinylScene.style.opacity = String(1 - ease(t, 9.0, 0.8));
      }
    }

    // ---- 10-12s: Text reveal ----
    else if (t < 12.0) {
      sleeve.style.opacity = '0';
      vinylScene.style.opacity = '0';
      tonearm.style.opacity = '0';
      trackPanel.style.opacity = '0';
      ctaSection.style.opacity = '0';
      hideFullPhotos();
      hideAllPhotos();

      // Hero fades out
      var heroFade = 1 - ease(t, 10.0, 0.5);
      heroSection.style.opacity = String(heroFade);

      // Text fades in
      var textP = ease(t, 10.2, 0.6);
      textReveal.style.opacity = String(textP);
      revealMain.style.transform = 'translateY(' + lerp(30, 0, textP) + 'px)';

      // Subtitle
      revealSub.style.opacity = String(ease(t, 10.8, 0.5));

      // Fade text out at end
      if (t >= 11.5) {
        var textFade = 1 - ease(t, 11.5, 0.5);
        textReveal.style.opacity = String(textFade);
      }

      // Dim background
      bgSurface.style.opacity = String(lerp(1, 0.3, ease(t, 10.0, 0.5)));
    }

    // ---- 12-14s: CTA ----
    else {
      sleeve.style.opacity = '0';
      vinylScene.style.opacity = '0';
      tonearm.style.opacity = '0';
      trackPanel.style.opacity = '0';
      heroSection.style.opacity = '0';
      textReveal.style.opacity = '0';
      hideFullPhotos();
      hideAllPhotos();
      bgSurface.style.opacity = '0.3';

      var ctaP = ease(t, 12.0, 0.6);
      ctaSection.style.opacity = String(ctaP);
      ctaHandle.style.transform = 'translateY(' + lerp(20, 0, ctaP) + 'px)';

      ctaDm.style.opacity = String(ease(t, 12.4, 0.5));
      ctaDm.style.transform = 'translateY(' + lerp(15, 0, ease(t, 12.4, 0.5)) + 'px)';
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

  var outputMp4 = path.join(OUT_DIR, 'reel-65a.mp4');
  execSync(
    'ffmpeg -y -framerate ' + FPS + ' -i "' + path.join(framesDir, 'frame_%05d.png') + '" ' +
    '-c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r ' + FPS + ' -an "' + outputMp4 + '"',
    { stdio: 'inherit' }
  );

  rmSync(framesDir, { recursive: true, force: true });

  var reelsDir = path.join(__dirname, 'reels');
  if (!existsSync(reelsDir)) mkdirSync(reelsDir, { recursive: true });
  var reelsDst = path.join(reelsDir, 'reel-65a.mp4');
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
