import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v69')

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 410

const SF = "-apple-system, 'Helvetica Neue', Arial, sans-serif"
const MANILA_COLOR = '#E8443A'
const IG_BG = '#000'

const TOTAL_DURATION_MS = 24000

const PHOTOS = [
  'manila-gallery-dsc-0190.jpg',
  'manila-gallery-night-001.jpg',
  'manila-gallery-garden-001.jpg',
  'manila-gallery-urban-001.jpg',
  'manila-gallery-dsc-0075.jpg',
  'manila-gallery-canal-001.jpg',
  'manila-gallery-ivy-001.jpg',
  'manila-gallery-garden-002.jpg',
  'manila-gallery-closeup-001.jpg',
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
  // Timeline — IG Story draft creation flow
  const T = {
    // Phase 1: "New Story" screen appears with camera roll grid
    screenAppear:    0.3,
    gridReveal:      0.8,     // camera roll grid slides up

    // Phase 2: Tap first photo — it fills the story frame
    tap1:            2.5,
    fill1:           2.8,

    // Phase 3: Add text sticker "best day ever 📸"
    sticker1Appear:  4.2,
    sticker1Settle:  4.8,

    // Phase 4: Swipe / tap second photo
    swipeOut1:       6.5,
    gridReturn1:     6.8,
    tap2:            7.8,
    fill2:           8.1,

    // Phase 5: Add "@madebyaidan" tag sticker
    sticker2Appear:  9.5,
    sticker2Settle:  10.0,

    // Phase 6: Swipe / tap third photo
    swipeOut2:       11.8,
    gridReturn2:     12.1,
    tap3:            13.0,
    fill3:           13.3,

    // Phase 7: Add "link in bio 🔗" text
    sticker3Appear:  14.8,
    sticker3Settle:  15.3,

    // Phase 8: "Share to Story" button tap + posted confirmation
    shareBtn:        16.8,
    shareTap:        17.5,
    posted:          18.2,

    // Phase 9: CTA overlay
    ctaAppear:       19.5,
    ctaHandle:       20.5,
    // Hold until 24s
  }

  // Grid photos (bottom camera roll) — use 6 photos in 2 rows of 3
  const gridPhotos = [PHOTOS[0], PHOTOS[1], PHOTOS[2], PHOTOS[3], PHOTOS[5], PHOTOS[6]]
  // Story frame photos — cycle through 3
  const storyPhotos = [PHOTOS[0], PHOTOS[2], PHOTOS[4]]

  return `<!DOCTYPE html>
<html>
<head>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { margin: 0; padding: 0; background: ${IG_BG}; -webkit-font-smoothing: antialiased; }

  @keyframes fadeIn {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }

  @keyframes slideUp {
    0% { transform: translateY(60px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }

  @keyframes slideDown {
    0% { transform: translateY(0); opacity: 1; }
    100% { transform: translateY(60px); opacity: 0; }
  }

  @keyframes photoFill {
    0% { opacity: 0; transform: scale(0.4); border-radius: 24px; }
    60% { opacity: 1; transform: scale(1.02); border-radius: 8px; }
    100% { opacity: 1; transform: scale(1); border-radius: 0; }
  }

  @keyframes photoExit {
    0% { opacity: 1; transform: scale(1) translateX(0); }
    100% { opacity: 0; transform: scale(0.9) translateX(-120px); }
  }

  @keyframes stickerPop {
    0% { opacity: 0; transform: scale(0) rotate(-12deg); }
    60% { opacity: 1; transform: scale(1.15) rotate(2deg); }
    80% { transform: scale(0.95) rotate(-1deg); }
    100% { opacity: 1; transform: scale(1) rotate(0deg); }
  }

  @keyframes stickerFloat {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    25% { transform: translateY(-4px) rotate(0.5deg); }
    75% { transform: translateY(4px) rotate(-0.5deg); }
  }

  @keyframes tapRipple {
    0% { transform: scale(0); opacity: 0.5; }
    100% { transform: scale(2.5); opacity: 0; }
  }

  @keyframes btnPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.04); }
  }

  @keyframes shareConfirm {
    0% { opacity: 0; transform: scale(0.6); }
    50% { opacity: 1; transform: scale(1.1); }
    100% { opacity: 1; transform: scale(1); }
  }

  @keyframes gridItemPop {
    0% { opacity: 0; transform: scale(0.8); }
    100% { opacity: 1; transform: scale(1); }
  }

  @keyframes ctaSlideUp {
    0% { opacity: 0; transform: translateY(40px); }
    100% { opacity: 1; transform: translateY(0); }
  }

  @keyframes progressBar {
    0% { width: 0%; }
    100% { width: 100%; }
  }

  @keyframes checkPop {
    0% { transform: scale(0) rotate(-45deg); opacity: 0; }
    60% { transform: scale(1.2) rotate(5deg); opacity: 1; }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
  }

  .page {
    width: ${WIDTH}px;
    height: ${HEIGHT}px;
    position: relative;
    overflow: hidden;
    background: ${IG_BG};
    font-family: ${SF};
  }

  /* ===== IG Story Creation Header ===== */
  .story-header {
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 120px;
    background: rgba(0,0,0,0.85);
    backdrop-filter: blur(20px);
    display: flex;
    align-items: flex-end;
    padding: 0 24px 14px;
    z-index: 50;
    opacity: 0;
    animation: fadeIn 0.4s ease-out ${T.screenAppear}s forwards;
  }

  .story-header-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .story-header-title {
    font-size: 36px;
    font-weight: 700;
    color: #fff;
    letter-spacing: -0.5px;
  }

  .story-header-right {
    margin-left: auto;
    display: flex;
    gap: 20px;
    align-items: center;
  }

  .settings-icon {
    width: 40px; height: 40px;
    display: flex; align-items: center; justify-content: center;
  }

  /* ===== Story Preview Frame ===== */
  .story-frame {
    position: absolute;
    top: 120px;
    left: 0; right: 0;
    bottom: ${SAFE_BOTTOM + 340}px;
    background: #111;
    z-index: 10;
    overflow: hidden;
    border-radius: 0 0 16px 16px;
    opacity: 0;
    animation: fadeIn 0.4s ease-out ${T.screenAppear}s forwards;
  }

  .story-frame-placeholder {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 16px;
  }

  .story-frame-placeholder-icon {
    width: 80px; height: 80px;
    border: 3px solid rgba(255,255,255,0.3);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
  }

  .story-frame-placeholder p {
    font-size: 28px;
    color: rgba(255,255,255,0.4);
  }

  .story-photo {
    position: absolute;
    inset: 0;
    opacity: 0;
    z-index: 5;
  }

  .story-photo img {
    width: 100%; height: 100%;
    object-fit: cover;
  }

  /* ===== Text Stickers ===== */
  .text-sticker {
    position: absolute;
    z-index: 20;
    opacity: 0;
    pointer-events: none;
  }

  .sticker-best-day {
    top: 160px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0,0,0,0.65);
    backdrop-filter: blur(12px);
    padding: 16px 32px;
    border-radius: 14px;
  }

  .sticker-best-day p {
    font-size: 44px;
    font-weight: 700;
    color: #fff;
    white-space: nowrap;
    letter-spacing: -0.5px;
  }

  .sticker-tag {
    bottom: 120px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(255,255,255,0.2);
    backdrop-filter: blur(12px);
    padding: 12px 28px;
    border-radius: 12px;
    border: 1.5px solid rgba(255,255,255,0.3);
  }

  .sticker-tag p {
    font-size: 34px;
    font-weight: 600;
    color: #fff;
    white-space: nowrap;
  }

  .sticker-link {
    top: 280px;
    right: 60px;
    background: rgba(0,0,0,0.7);
    backdrop-filter: blur(12px);
    padding: 14px 28px;
    border-radius: 14px;
  }

  .sticker-link p {
    font-size: 36px;
    font-weight: 600;
    color: #fff;
    white-space: nowrap;
  }

  /* ===== Camera Roll Grid ===== */
  .camera-roll {
    position: absolute;
    left: 0; right: 0;
    bottom: ${SAFE_BOTTOM}px;
    height: 340px;
    background: rgba(0,0,0,0.9);
    backdrop-filter: blur(20px);
    z-index: 30;
    opacity: 0;
    transform: translateY(60px);
  }

  .camera-roll-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 24px 8px;
  }

  .camera-roll-label {
    font-size: 26px;
    font-weight: 600;
    color: rgba(255,255,255,0.7);
  }

  .camera-roll-label-right {
    font-size: 26px;
    color: #3897f0;
    font-weight: 600;
  }

  .grid-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(2, 1fr);
    gap: 3px;
    padding: 0 3px;
    height: 280px;
  }

  .grid-item {
    position: relative;
    overflow: hidden;
    opacity: 0;
  }

  .grid-item img {
    width: 100%; height: 100%;
    object-fit: cover;
  }

  .grid-item-selected {
    position: absolute;
    inset: 0;
    border: 3px solid #3897f0;
    z-index: 2;
    opacity: 0;
    transition: opacity 0.2s;
  }

  .grid-item-check {
    position: absolute;
    top: 8px; right: 8px;
    width: 28px; height: 28px;
    border-radius: 50%;
    background: #3897f0;
    display: flex; align-items: center; justify-content: center;
    z-index: 3;
    opacity: 0;
    transition: opacity 0.2s;
  }

  .grid-item-check svg {
    width: 16px; height: 16px;
  }

  /* ===== Tap Ripple ===== */
  .tap-ripple {
    position: absolute;
    width: 60px; height: 60px;
    border-radius: 50%;
    background: rgba(255,255,255,0.3);
    z-index: 40;
    opacity: 0;
    pointer-events: none;
  }

  /* ===== Share Button ===== */
  .share-bar {
    position: absolute;
    left: 0; right: 0;
    bottom: ${SAFE_BOTTOM + 340}px;
    height: 80px;
    background: rgba(0,0,0,0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 35;
    opacity: 0;
  }

  .share-btn {
    background: #3897f0;
    color: #fff;
    font-size: 32px;
    font-weight: 700;
    padding: 16px 80px;
    border-radius: 12px;
    letter-spacing: 0.5px;
  }

  /* ===== "Shared" Confirmation ===== */
  .posted-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.8);
    z-index: 60;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 20px;
    opacity: 0;
  }

  .posted-check {
    width: 100px; height: 100px;
    border-radius: 50%;
    background: #2ecc71;
    display: flex; align-items: center; justify-content: center;
    opacity: 0;
  }

  .posted-text {
    font-size: 40px;
    font-weight: 700;
    color: #fff;
    opacity: 0;
  }

  /* ===== CTA Overlay ===== */
  .cta-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.92);
    z-index: 70;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 24px;
    opacity: 0;
  }

  .cta-main {
    font-size: 52px;
    font-weight: 800;
    color: #fff;
    text-align: center;
    line-height: 1.25;
    padding: 0 60px;
    opacity: 0;
  }

  .cta-handle {
    font-size: 38px;
    font-weight: 700;
    color: ${MANILA_COLOR};
    opacity: 0;
  }

  .cta-subtext {
    font-size: 28px;
    color: rgba(255,255,255,0.5);
    opacity: 0;
  }

  /* ===== Story top tools bar ===== */
  .story-tools {
    position: absolute;
    top: 130px;
    left: 0; right: 0;
    height: 70px;
    z-index: 25;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0 20px;
    gap: 16px;
    opacity: 0;
  }

  .tool-btn {
    width: 48px; height: 48px;
    border-radius: 50%;
    background: rgba(0,0,0,0.4);
    display: flex; align-items: center; justify-content: center;
  }
</style>
</head>
<body>
  <div class="page">

    <!-- ===== IG Story Header ===== -->
    <div class="story-header">
      <div class="story-header-left">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        <div class="story-header-title">New Story</div>
      </div>
      <div class="story-header-right">
        <div class="settings-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        </div>
      </div>
    </div>

    <!-- ===== Story Frame ===== -->
    <div class="story-frame" id="storyFrame">
      <!-- Placeholder when no photo selected -->
      <div class="story-frame-placeholder" id="placeholder">
        <div class="story-frame-placeholder-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
        </div>
        <p>Tap a photo below</p>
      </div>

      <!-- Photo layers -->
      <div class="story-photo" id="storyPhoto1">
        <img src="${imageDataMap[storyPhotos[0]]}" alt="story1" />
      </div>
      <div class="story-photo" id="storyPhoto2">
        <img src="${imageDataMap[storyPhotos[1]]}" alt="story2" />
      </div>
      <div class="story-photo" id="storyPhoto3">
        <img src="${imageDataMap[storyPhotos[2]]}" alt="story3" />
      </div>

      <!-- Text stickers (inside frame) -->
      <div class="text-sticker sticker-best-day" id="sticker1">
        <p>best day ever 📸</p>
      </div>

      <div class="text-sticker sticker-tag" id="sticker2">
        <p>@madebyaidan</p>
      </div>

      <div class="text-sticker sticker-link" id="sticker3">
        <p>link in bio 🔗</p>
      </div>
    </div>

    <!-- ===== Story Tools (text, sticker, draw icons) ===== -->
    <div class="story-tools" id="storyTools">
      <div class="tool-btn">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
      </div>
      <div class="tool-btn">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/></svg>
      </div>
      <div class="tool-btn">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
      </div>
    </div>

    <!-- ===== Camera Roll Grid ===== -->
    <div class="camera-roll" id="cameraRoll">
      <div class="camera-roll-header">
        <span class="camera-roll-label">RECENTS</span>
        <span class="camera-roll-label-right">Gallery</span>
      </div>
      <div class="grid-container">
        ${gridPhotos.map((photo, i) => `
          <div class="grid-item" id="gridItem${i}" style="animation: gridItemPop 0.35s ease-out ${T.gridReveal + i * 0.08}s forwards;">
            <img src="${imageDataMap[photo]}" alt="grid${i}" />
            <div class="grid-item-selected" id="gridSel${i}"></div>
            <div class="grid-item-check" id="gridCheck${i}">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- ===== Share Bar ===== -->
    <div class="share-bar" id="shareBar">
      <div class="share-btn" id="shareBtn">Share to Story</div>
    </div>

    <!-- ===== Tap Ripples ===== -->
    <div class="tap-ripple" id="ripple1"></div>
    <div class="tap-ripple" id="ripple2"></div>
    <div class="tap-ripple" id="ripple3"></div>

    <!-- ===== Posted Confirmation ===== -->
    <div class="posted-overlay" id="postedOverlay">
      <div class="posted-check" id="postedCheck">
        <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>
      </div>
      <div class="posted-text" id="postedText">Shared to your story</div>
    </div>

    <!-- ===== CTA Overlay ===== -->
    <div class="cta-overlay" id="ctaOverlay">
      <div class="cta-main" id="ctaMain">dm me if interested!!</div>
      <div class="cta-handle" id="ctaHandle">@madebyaidan on Instagram</div>
      <div class="cta-subtext" id="ctaSub">free photo shoots in Manila</div>
    </div>

  </div>

  <script>
    // Helper: show tap ripple at a position
    function showRipple(id, x, y, delay) {
      setTimeout(() => {
        const el = document.getElementById(id);
        if (!el) return;
        el.style.left = (x - 30) + 'px';
        el.style.top = (y - 30) + 'px';
        el.style.animation = 'tapRipple 0.5s ease-out forwards';
      }, delay);
    }

    // Helper: select a grid item
    function selectGrid(idx, delay) {
      setTimeout(() => {
        const sel = document.getElementById('gridSel' + idx);
        const chk = document.getElementById('gridCheck' + idx);
        if (sel) sel.style.opacity = '1';
        if (chk) chk.style.opacity = '1';
      }, delay);
    }

    // Helper: deselect all grid items
    function deselectAllGrid(delay) {
      setTimeout(() => {
        for (let i = 0; i < 6; i++) {
          const sel = document.getElementById('gridSel' + i);
          const chk = document.getElementById('gridCheck' + i);
          if (sel) sel.style.opacity = '0';
          if (chk) chk.style.opacity = '0';
        }
      }, delay);
    }

    const cameraRoll = document.getElementById('cameraRoll');
    const storyTools = document.getElementById('storyTools');
    const placeholder = document.getElementById('placeholder');

    // Phase 1: Camera roll grid slides up
    setTimeout(() => {
      cameraRoll.style.animation = 'slideUp 0.5s ease-out forwards';
    }, ${T.gridReveal * 1000});

    // Phase 2: Tap first photo (gridItem0) -> fills story frame
    // Show ripple on grid item 0
    showRipple('ripple1', 180, ${HEIGHT - SAFE_BOTTOM - 200}, ${T.tap1 * 1000});
    selectGrid(0, ${T.tap1 * 1000});

    setTimeout(() => {
      placeholder.style.opacity = '0';
      placeholder.style.transition = 'opacity 0.2s';
      const sp1 = document.getElementById('storyPhoto1');
      sp1.style.animation = 'photoFill 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards';
      storyTools.style.animation = 'fadeIn 0.4s ease-out forwards';
    }, ${T.fill1 * 1000});

    // Phase 3: Sticker "best day ever 📸" pops in
    setTimeout(() => {
      const s1 = document.getElementById('sticker1');
      s1.style.animation = 'stickerPop 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards';
    }, ${T.sticker1Appear * 1000});

    setTimeout(() => {
      const s1 = document.getElementById('sticker1');
      s1.style.animation = 'stickerFloat 3s ease-in-out infinite';
      s1.style.opacity = '1';
    }, ${T.sticker1Settle * 1000});

    // Phase 4: Swipe out photo 1, return to grid, select photo 2
    setTimeout(() => {
      const sp1 = document.getElementById('storyPhoto1');
      const s1 = document.getElementById('sticker1');
      sp1.style.animation = 'photoExit 0.4s ease-in forwards';
      s1.style.animation = 'photoExit 0.4s ease-in forwards';
      storyTools.style.opacity = '0';
      storyTools.style.transition = 'opacity 0.3s';
    }, ${T.swipeOut1 * 1000});

    deselectAllGrid(${T.gridReturn1 * 1000});

    // Tap second photo (gridItem2)
    showRipple('ripple2', 540 + 180, ${HEIGHT - SAFE_BOTTOM - 200}, ${T.tap2 * 1000});
    selectGrid(2, ${T.tap2 * 1000});

    setTimeout(() => {
      const sp2 = document.getElementById('storyPhoto2');
      sp2.style.animation = 'photoFill 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards';
      storyTools.style.opacity = '1';
      storyTools.style.transition = 'opacity 0.3s';
    }, ${T.fill2 * 1000});

    // Phase 5: "@madebyaidan" tag sticker
    setTimeout(() => {
      const s2 = document.getElementById('sticker2');
      s2.style.animation = 'stickerPop 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards';
    }, ${T.sticker2Appear * 1000});

    setTimeout(() => {
      const s2 = document.getElementById('sticker2');
      s2.style.animation = 'stickerFloat 3s ease-in-out infinite';
      s2.style.opacity = '1';
    }, ${T.sticker2Settle * 1000});

    // Phase 6: Swipe out photo 2, select photo 3
    setTimeout(() => {
      const sp2 = document.getElementById('storyPhoto2');
      const s2 = document.getElementById('sticker2');
      sp2.style.animation = 'photoExit 0.4s ease-in forwards';
      s2.style.animation = 'photoExit 0.4s ease-in forwards';
      storyTools.style.opacity = '0';
      storyTools.style.transition = 'opacity 0.3s';
    }, ${T.swipeOut2 * 1000});

    deselectAllGrid(${T.gridReturn2 * 1000});

    // Tap third photo (gridItem3)
    showRipple('ripple3', 180, ${HEIGHT - SAFE_BOTTOM - 60}, ${T.tap3 * 1000});
    selectGrid(3, ${T.tap3 * 1000});

    setTimeout(() => {
      const sp3 = document.getElementById('storyPhoto3');
      sp3.style.animation = 'photoFill 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards';
      storyTools.style.opacity = '1';
      storyTools.style.transition = 'opacity 0.3s';
    }, ${T.fill3 * 1000});

    // Phase 7: "link in bio 🔗" sticker
    setTimeout(() => {
      const s3 = document.getElementById('sticker3');
      s3.style.animation = 'stickerPop 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards';
    }, ${T.sticker3Appear * 1000});

    setTimeout(() => {
      const s3 = document.getElementById('sticker3');
      s3.style.animation = 'stickerFloat 3s ease-in-out infinite';
      s3.style.opacity = '1';
    }, ${T.sticker3Settle * 1000});

    // Phase 8: Share button appears, gets tapped
    setTimeout(() => {
      const shareBar = document.getElementById('shareBar');
      shareBar.style.animation = 'fadeIn 0.4s ease-out forwards';
    }, ${T.shareBtn * 1000});

    setTimeout(() => {
      const shareBtn = document.getElementById('shareBtn');
      shareBtn.style.transform = 'scale(0.95)';
      shareBtn.style.transition = 'transform 0.15s';
      setTimeout(() => {
        shareBtn.style.transform = 'scale(1)';
      }, 150);
    }, ${T.shareTap * 1000});

    // Posted confirmation
    setTimeout(() => {
      const overlay = document.getElementById('postedOverlay');
      overlay.style.animation = 'fadeIn 0.3s ease-out forwards';

      const check = document.getElementById('postedCheck');
      check.style.animation = 'checkPop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.2s forwards';

      const text = document.getElementById('postedText');
      text.style.animation = 'fadeIn 0.4s ease-out 0.5s forwards';
    }, ${T.posted * 1000});

    // Phase 9: CTA overlay
    setTimeout(() => {
      const cta = document.getElementById('ctaOverlay');
      cta.style.animation = 'fadeIn 0.5s ease-out forwards';

      const main = document.getElementById('ctaMain');
      main.style.animation = 'ctaSlideUp 0.5s ease-out 0.2s forwards';

      const sub = document.getElementById('ctaSub');
      sub.style.animation = 'ctaSlideUp 0.5s ease-out 0.4s forwards';
    }, ${T.ctaAppear * 1000});

    setTimeout(() => {
      const handle = document.getElementById('ctaHandle');
      handle.style.animation = 'ctaSlideUp 0.5s ease-out forwards';
    }, ${T.ctaHandle * 1000});
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
    strategy: 'v69 — IG story draft UI animation',
    safeBottomPixels: SAFE_BOTTOM,
    photos: PHOTOS,
  })

  const { execSync } = await import('child_process')
  const browser = await chromium.launch()

  console.log('Recording IG Story Draft animation...')

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
    document.documentElement.style.background = '#000'
    document.body.style.background = '#000'
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
  const finalMp4 = path.join(OUT_DIR, '01_story_draft.mp4')

  try {
    execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${finalMp4}"`, { stdio: 'pipe' })
    fs.unlinkSync(srcVideo)
    console.log('Rendered 01_story_draft.mp4')
  } catch (err) {
    console.error('ffmpeg error:', err.message)
    fs.renameSync(srcVideo, finalMp4)
  }

  console.log(`Done: output written to ${OUT_DIR}`)
}

render().catch(error => {
  console.error(error)
  process.exit(1)
})
