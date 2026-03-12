import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v72')

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 410

const SF = "-apple-system, 'Helvetica Neue', Arial, sans-serif"
const MANILA_COLOR = '#E8443A'
const IG_BG = '#000'

const TOTAL_DURATION_MS = 26000

const PHOTOS = [
  'manila-gallery-dsc-0190.jpg',
  'manila-gallery-night-001.jpg',
  'manila-gallery-garden-001.jpg',
  'manila-gallery-urban-001.jpg',
  'manila-gallery-dsc-0075.jpg',
  'manila-gallery-canal-001.jpg',
  'manila-gallery-ivy-001.jpg',
  'manila-gallery-garden-002.jpg',
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
  // Timeline
  const T = {
    // Phase 1: Camera roll grid — photos get selected one by one
    gridAppear: 0.3,
    select1: 1.0,
    select2: 1.8,
    select3: 2.6,
    select4: 3.4,
    select5: 4.2,
    select6: 5.0,

    // Phase 2: Story editor — photo fills screen, text typed, sticker slides in
    editorIn: 6.2,
    typeStart: 7.0,
    typeEnd: 8.8,
    stickerIn: 9.0,

    // Phase 3: Post to story — button tap, upload progress, confirmation
    addBtnAppear: 10.2,
    addBtnTap: 11.0,
    uploadStart: 11.4,
    uploadDone: 12.8,
    sharedConfirm: 13.2,

    // Phase 4: Story engagement — views climbing, reply bubbles, CTA reveal
    storyView: 14.2,
    viewsStart: 15.0,
    reply1: 16.0,
    reply2: 17.0,
    reply3: 17.8,
    ctaReveal: 19.0,
    ctaHandle: 20.5,
    // Hold until ~24s
  }

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
    0% { opacity: 0; transform: translateY(20px); }
    100% { opacity: 1; transform: translateY(0); }
  }

  @keyframes checkPop {
    0% { opacity: 0; transform: scale(0); }
    50% { transform: scale(1.3); }
    100% { opacity: 1; transform: scale(1); }
  }

  @keyframes slideInRight {
    0% { opacity: 0; transform: translateX(80px); }
    100% { opacity: 1; transform: translateX(0); }
  }

  @keyframes slideInLeft {
    0% { opacity: 0; transform: translateX(-80px); }
    100% { opacity: 1; transform: translateX(0); }
  }

  @keyframes tapPulse {
    0% { transform: scale(1); }
    30% { transform: scale(0.92); }
    60% { transform: scale(1.02); }
    100% { transform: scale(1); }
  }

  @keyframes uploadSpin {
    0% { stroke-dashoffset: 283; }
    100% { stroke-dashoffset: 0; }
  }

  @keyframes popIn {
    0% { opacity: 0; transform: scale(0.5); }
    60% { transform: scale(1.1); }
    100% { opacity: 1; transform: scale(1); }
  }

  @keyframes countUp {
    0% { content: '0'; }
    100% { content: '47'; }
  }

  @keyframes replySlide {
    0% { opacity: 0; transform: translateY(30px) scale(0.9); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
  }

  @keyframes pulseGlow {
    0%, 100% { box-shadow: 0 0 0 0 rgba(232, 68, 58, 0.5); }
    50% { box-shadow: 0 0 0 16px rgba(232, 68, 58, 0); }
  }

  @keyframes typeChar {
    0% { width: 0; }
    100% { width: 100%; }
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  @keyframes progressBar {
    0% { width: 0%; }
    100% { width: 100%; }
  }

  @keyframes scaleIn {
    0% { opacity: 0; transform: scale(1.15); }
    100% { opacity: 1; transform: scale(1); }
  }

  .page {
    width: ${WIDTH}px;
    height: ${HEIGHT}px;
    position: relative;
    overflow: hidden;
    background: ${IG_BG};
    font-family: ${SF};
  }

  /* ===== PHASE 1: Camera Roll Grid ===== */
  .phase1 {
    position: absolute;
    inset: 0;
    z-index: 10;
    background: #000;
    opacity: 0;
  }

  .cam-roll-header {
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 140px;
    background: #000;
    display: flex;
    align-items: flex-end;
    padding: 0 24px 14px;
    z-index: 5;
    border-bottom: 1px solid #222;
  }

  .cam-roll-header .cancel {
    font-size: 30px;
    color: #fff;
    font-weight: 400;
  }

  .cam-roll-header .title {
    flex: 1;
    text-align: center;
    font-size: 30px;
    font-weight: 700;
    color: #fff;
  }

  .cam-roll-header .next-btn {
    font-size: 30px;
    font-weight: 700;
    color: #3797f0;
  }

  .recents-bar {
    position: absolute;
    top: 140px; left: 0; right: 0;
    height: 56px;
    background: #000;
    display: flex;
    align-items: center;
    padding: 0 24px;
    z-index: 5;
  }

  .recents-bar span {
    font-size: 28px;
    font-weight: 600;
    color: #fff;
  }

  .recents-bar .chevron {
    font-size: 22px;
    color: #888;
    margin-left: 8px;
  }

  .recents-bar .multi-select {
    margin-left: auto;
    font-size: 26px;
    color: #3797f0;
    font-weight: 600;
  }

  .photo-grid {
    position: absolute;
    top: 196px;
    left: 0; right: 0;
    bottom: ${SAFE_BOTTOM}px;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 3px;
    padding: 3px;
    overflow: hidden;
  }

  .grid-cell {
    position: relative;
    aspect-ratio: 1;
    overflow: hidden;
  }

  .grid-cell img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .grid-cell .check {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 3px solid rgba(255,255,255,0.6);
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 3;
    transition: all 0.2s;
  }

  .grid-cell .check.selected {
    background: #3797f0;
    border-color: #3797f0;
  }

  .grid-cell .check svg {
    opacity: 0;
  }

  .grid-cell .check.selected svg {
    opacity: 1;
  }

  .grid-cell .check .num {
    position: absolute;
    font-size: 20px;
    font-weight: 700;
    color: #fff;
    opacity: 0;
  }

  .grid-cell .check.selected .num {
    opacity: 1;
  }

  .grid-cell .overlay {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0);
    transition: background 0.2s;
    z-index: 2;
  }

  .grid-cell .overlay.dimmed {
    background: rgba(0,0,0,0.3);
  }

  /* Touch ripple */
  .tap-ring {
    position: absolute;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    border: 3px solid rgba(255,255,255,0.4);
    opacity: 0;
    z-index: 4;
    pointer-events: none;
  }

  /* ===== PHASE 2: Story Editor ===== */
  .phase2 {
    position: absolute;
    inset: 0;
    z-index: 20;
    background: #000;
    opacity: 0;
  }

  .editor-photo {
    position: absolute;
    inset: 0;
    bottom: ${SAFE_BOTTOM}px;
  }

  .editor-photo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .editor-top-bar {
    position: absolute;
    top: 60px;
    left: 0; right: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
    z-index: 5;
  }

  .editor-top-bar .close-x {
    font-size: 42px;
    color: #fff;
    text-shadow: 0 2px 8px rgba(0,0,0,0.5);
  }

  .editor-tools {
    display: flex;
    gap: 20px;
  }

  .editor-tool-icon {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .story-text-overlay {
    position: absolute;
    top: 380px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0,0,0,0.65);
    padding: 16px 28px;
    border-radius: 12px;
    z-index: 6;
    opacity: 0;
    white-space: nowrap;
  }

  .story-text-overlay .typed-text {
    font-size: 38px;
    font-weight: 700;
    color: #fff;
    overflow: hidden;
    white-space: nowrap;
    display: inline-block;
    width: 0;
  }

  .story-text-overlay .cursor {
    display: inline-block;
    width: 3px;
    height: 38px;
    background: #fff;
    margin-left: 2px;
    vertical-align: middle;
    animation: blink 0.6s step-end infinite;
  }

  .location-sticker {
    position: absolute;
    top: 480px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(255,255,255,0.92);
    padding: 12px 24px;
    border-radius: 20px;
    z-index: 6;
    opacity: 0;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .location-sticker .pin {
    font-size: 26px;
  }

  .location-sticker .loc-text {
    font-size: 26px;
    font-weight: 700;
    color: #222;
  }

  .editor-bottom-tray {
    position: absolute;
    bottom: ${SAFE_BOTTOM + 20}px;
    left: 0; right: 0;
    display: flex;
    justify-content: center;
    gap: 18px;
    padding: 0 24px;
    z-index: 6;
    opacity: 0;
  }

  .tray-item {
    width: 70px;
    height: 70px;
    border-radius: 50%;
    background: rgba(255,255,255,0.15);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .tray-item svg {
    width: 32px;
    height: 32px;
  }

  /* ===== PHASE 3: Add to Story ===== */
  .phase3 {
    position: absolute;
    inset: 0;
    z-index: 30;
    opacity: 0;
    pointer-events: none;
  }

  .add-story-btn {
    position: absolute;
    bottom: ${SAFE_BOTTOM + 30}px;
    left: 50%;
    transform: translateX(-50%);
    background: #fff;
    color: #000;
    font-size: 30px;
    font-weight: 700;
    padding: 20px 60px;
    border-radius: 30px;
    z-index: 7;
    opacity: 0;
    white-space: nowrap;
  }

  .upload-circle-container {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    opacity: 0;
    z-index: 8;
  }

  .shared-confirmation {
    position: absolute;
    top: 40%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    opacity: 0;
    z-index: 8;
  }

  .shared-confirmation .check-big {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    border: 5px solid #2ecc71;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
  }

  .shared-confirmation .shared-text {
    font-size: 40px;
    font-weight: 700;
    color: #fff;
  }

  /* ===== PHASE 4: Story Engagement + CTA ===== */
  .phase4 {
    position: absolute;
    inset: 0;
    z-index: 40;
    background: #000;
    opacity: 0;
  }

  .story-view-container {
    position: absolute;
    top: 0; left: 0; right: 0;
    bottom: ${SAFE_BOTTOM}px;
  }

  .story-photo {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .story-top-bar {
    position: absolute;
    top: 0; left: 0; right: 0;
    padding: 60px 20px 0;
    z-index: 5;
  }

  .story-progress {
    display: flex;
    gap: 4px;
    margin-bottom: 14px;
  }

  .story-progress-bar {
    flex: 1;
    height: 4px;
    background: rgba(255,255,255,0.3);
    border-radius: 2px;
    overflow: hidden;
  }

  .story-progress-bar .fill {
    height: 100%;
    background: #fff;
    width: 0%;
  }

  .story-user-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .story-user-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid #fff;
  }

  .story-user-avatar img {
    width: 100%; height: 100%;
    object-fit: cover;
  }

  .story-user-name {
    font-size: 26px;
    font-weight: 600;
    color: #fff;
    text-shadow: 0 1px 4px rgba(0,0,0,0.5);
  }

  .story-time {
    font-size: 22px;
    color: rgba(255,255,255,0.7);
    text-shadow: 0 1px 4px rgba(0,0,0,0.5);
  }

  .story-text-on-photo {
    position: absolute;
    top: 380px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0,0,0,0.65);
    padding: 16px 28px;
    border-radius: 12px;
    z-index: 5;
    white-space: nowrap;
  }

  .story-text-on-photo p {
    font-size: 38px;
    font-weight: 700;
    color: #fff;
  }

  .story-loc-sticker {
    position: absolute;
    top: 480px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(255,255,255,0.92);
    padding: 12px 24px;
    border-radius: 20px;
    z-index: 5;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .story-loc-sticker .pin { font-size: 26px; }
  .story-loc-sticker .loc-text { font-size: 26px; font-weight: 700; color: #222; }

  /* Views bar */
  .views-bar {
    position: absolute;
    bottom: ${SAFE_BOTTOM + 20}px;
    left: 24px;
    display: flex;
    align-items: center;
    gap: 10px;
    opacity: 0;
    z-index: 6;
  }

  .views-bar .eye-icon {
    font-size: 28px;
    color: #fff;
  }

  .views-bar .view-count {
    font-size: 28px;
    font-weight: 600;
    color: #fff;
  }

  /* Reply bubbles */
  .reply-bubble {
    position: absolute;
    right: 24px;
    background: #262626;
    border-radius: 22px;
    padding: 14px 22px;
    opacity: 0;
    z-index: 6;
    max-width: 500px;
  }

  .reply-bubble p {
    font-size: 28px;
    color: #fff;
    margin: 0;
    white-space: nowrap;
  }

  .reply-bubble .reply-name {
    font-size: 22px;
    color: #888;
    margin-bottom: 4px;
  }

  /* CTA overlay */
  .cta-overlay {
    position: absolute;
    inset: 0;
    bottom: ${SAFE_BOTTOM}px;
    background: rgba(0,0,0,0.85);
    z-index: 50;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    opacity: 0;
    gap: 24px;
  }

  .cta-line1 {
    font-size: 56px;
    font-weight: 800;
    color: #fff;
    text-align: center;
    line-height: 1.2;
    opacity: 0;
  }

  .cta-line2 {
    font-size: 44px;
    font-weight: 700;
    color: ${MANILA_COLOR};
    text-align: center;
    opacity: 0;
  }

  .cta-handle {
    font-size: 34px;
    font-weight: 600;
    color: rgba(255,255,255,0.6);
    text-align: center;
    opacity: 0;
    margin-top: 8px;
  }
</style>
</head>
<body>
  <div class="page">

    <!-- ===== PHASE 1: Camera Roll Grid ===== -->
    <div class="phase1" id="phase1">
      <div class="cam-roll-header">
        <span class="cancel">Cancel</span>
        <span class="title">New Story</span>
        <span class="next-btn" id="nextBtn">Next</span>
      </div>
      <div class="recents-bar">
        <span>Recents</span>
        <span class="chevron">▾</span>
        <span class="multi-select" id="multiLabel">SELECT MULTIPLE</span>
      </div>

      <div class="photo-grid" id="photoGrid">
        ${PHOTOS.map((photo, i) => `
          <div class="grid-cell" id="cell${i}">
            <img src="${imageDataMap[photo]}" alt="photo ${i}" />
            <div class="overlay" id="overlay${i}"></div>
            <div class="check" id="check${i}">
              <span class="num" id="num${i}">${i + 1}</span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- ===== PHASE 2: Story Editor ===== -->
    <div class="phase2" id="phase2">
      <div class="editor-photo">
        <img src="${imageDataMap[PHOTOS[0]]}" alt="story" />
      </div>

      <div class="editor-top-bar">
        <span class="close-x">✕</span>
        <div class="editor-tools">
          <div class="editor-tool-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          </div>
          <div class="editor-tool-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/></svg>
          </div>
          <div class="editor-tool-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </div>
        </div>
      </div>

      <div class="story-text-overlay" id="textOverlay">
        <span class="typed-text" id="typedText">best shoot of my life 🔥</span>
        <span class="cursor" id="typeCursor"></span>
      </div>

      <div class="location-sticker" id="locSticker">
        <span class="pin">📍</span>
        <span class="loc-text">Manila, Philippines</span>
      </div>

      <div class="editor-bottom-tray" id="editorTray">
        <div class="tray-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
        </div>
        <div class="tray-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
        </div>
        <div class="tray-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
        <div class="tray-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 3v18"/><path d="M3 12h18"/></svg>
        </div>
      </div>
    </div>

    <!-- ===== PHASE 3: Post Confirmation ===== -->
    <div class="phase3" id="phase3">
      <div class="add-story-btn" id="addStoryBtn">Add to Your Story</div>

      <div class="upload-circle-container" id="uploadCircle">
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="45" fill="none" stroke="#333" stroke-width="6"/>
          <circle cx="60" cy="60" r="45" fill="none" stroke="#fff" stroke-width="6"
                  stroke-dasharray="283" stroke-dashoffset="283" stroke-linecap="round"
                  id="progressRing"
                  transform="rotate(-90 60 60)"/>
        </svg>
      </div>

      <div class="shared-confirmation" id="sharedConfirm">
        <div class="check-big">
          <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#2ecc71" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div class="shared-text">Story shared!</div>
      </div>
    </div>

    <!-- ===== PHASE 4: Engagement + CTA ===== -->
    <div class="phase4" id="phase4">
      <div class="story-view-container">
        <img class="story-photo" src="${imageDataMap[PHOTOS[0]]}" alt="story" />

        <div class="story-top-bar">
          <div class="story-progress">
            <div class="story-progress-bar"><div class="fill" id="progressFill"></div></div>
          </div>
          <div class="story-user-row">
            <div class="story-user-avatar">
              <img src="${imageDataMap[PHOTOS[4]]}" alt="avatar" />
            </div>
            <span class="story-user-name">Your Story</span>
            <span class="story-time" id="storyTime">Just now</span>
          </div>
        </div>

        <div class="story-text-on-photo">
          <p>best shoot of my life 🔥</p>
        </div>

        <div class="story-loc-sticker">
          <span class="pin">📍</span>
          <span class="loc-text">Manila, Philippines</span>
        </div>

        <div class="views-bar" id="viewsBar">
          <span class="eye-icon">👁</span>
          <span class="view-count" id="viewCount">0</span>
          <span style="font-size:26px;color:rgba(255,255,255,0.7);">views</span>
        </div>

        <div class="reply-bubble" id="reply1" style="bottom:${SAFE_BOTTOM + 180}px;">
          <p class="reply-name">jessica_m</p>
          <p>omg you look amazing!! 😍</p>
        </div>

        <div class="reply-bubble" id="reply2" style="bottom:${SAFE_BOTTOM + 110}px;">
          <p class="reply-name">travel.mike</p>
          <p>who's your photographer?? 📸</p>
        </div>

        <div class="reply-bubble" id="reply3" style="bottom:${SAFE_BOTTOM + 40}px;">
          <p class="reply-name">sarah.k</p>
          <p>need this for my feed 🙌</p>
        </div>
      </div>

      <!-- CTA Overlay -->
      <div class="cta-overlay" id="ctaOverlay">
        <div class="cta-line1" id="ctaLine1">this could be<br/>your story</div>
        <div class="cta-line2" id="ctaLine2">dm me if interested!!</div>
        <div class="cta-handle" id="ctaHandleText">@madebyaidan on Instagram</div>
      </div>
    </div>

  </div>

  <script>
    // ===== PHASE 1: Camera Roll Grid =====
    const phase1 = document.getElementById('phase1')
    const phase2 = document.getElementById('phase2')
    const phase3 = document.getElementById('phase3')
    const phase4 = document.getElementById('phase4')

    // Show grid
    setTimeout(() => {
      phase1.style.animation = 'fadeIn 0.4s ease-out forwards'
    }, ${T.gridAppear * 1000})

    // Select photos one by one
    const selectionTimes = [
      ${T.select1 * 1000},
      ${T.select2 * 1000},
      ${T.select3 * 1000},
      ${T.select4 * 1000},
      ${T.select5 * 1000},
      ${T.select6 * 1000},
    ]

    let selectCount = 0
    selectionTimes.forEach((t, i) => {
      setTimeout(() => {
        const check = document.getElementById('check' + i)
        const overlay = document.getElementById('overlay' + i)
        const num = document.getElementById('num' + i)
        if (check) {
          check.classList.add('selected')
          check.style.animation = 'checkPop 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards'
        }
        if (overlay) overlay.classList.add('dimmed')
        selectCount++
        const label = document.getElementById('multiLabel')
        if (label) label.textContent = selectCount + ' SELECTED'
      }, t)
    })

    // ===== PHASE 2: Story Editor =====
    setTimeout(() => {
      phase1.style.transition = 'opacity 0.4s ease-out'
      phase1.style.opacity = '0'
      phase2.style.animation = 'scaleIn 0.5s ease-out forwards'
    }, ${T.editorIn * 1000})

    // Show bottom tray
    setTimeout(() => {
      const tray = document.getElementById('editorTray')
      if (tray) tray.style.animation = 'fadeIn 0.4s ease-out forwards'
    }, ${(T.editorIn + 0.4) * 1000})

    // Type text
    setTimeout(() => {
      const overlay = document.getElementById('textOverlay')
      const typed = document.getElementById('typedText')
      if (overlay) overlay.style.opacity = '1'
      if (typed) {
        typed.style.animation = 'typeChar 1.8s steps(24) ${T.typeStart}s forwards'
      }
    }, ${T.typeStart * 1000})

    // Hide cursor after typing
    setTimeout(() => {
      const cursor = document.getElementById('typeCursor')
      if (cursor) cursor.style.opacity = '0'
    }, ${T.typeEnd * 1000})

    // Slide in location sticker
    setTimeout(() => {
      const sticker = document.getElementById('locSticker')
      if (sticker) sticker.style.animation = 'slideInRight 0.5s ease-out forwards'
    }, ${T.stickerIn * 1000})

    // ===== PHASE 3: Add to Story =====
    // Show "Add to Your Story" button
    setTimeout(() => {
      phase3.style.opacity = '1'
      const btn = document.getElementById('addStoryBtn')
      if (btn) btn.style.animation = 'slideUp 0.4s ease-out forwards'
    }, ${T.addBtnAppear * 1000})

    // Tap animation on button
    setTimeout(() => {
      const btn = document.getElementById('addStoryBtn')
      if (btn) btn.style.animation = 'tapPulse 0.3s ease-out forwards'
    }, ${T.addBtnTap * 1000})

    // Show upload progress
    setTimeout(() => {
      const btn = document.getElementById('addStoryBtn')
      if (btn) btn.style.opacity = '0'
      phase2.style.transition = 'opacity 0.3s'
      phase2.style.opacity = '0'

      const circle = document.getElementById('uploadCircle')
      if (circle) circle.style.opacity = '1'

      const ring = document.getElementById('progressRing')
      if (ring) {
        ring.style.transition = 'stroke-dashoffset 1.4s ease-in-out'
        ring.style.strokeDashoffset = '0'
      }
    }, ${T.uploadStart * 1000})

    // Show confirmation
    setTimeout(() => {
      const circle = document.getElementById('uploadCircle')
      if (circle) circle.style.opacity = '0'

      const confirm = document.getElementById('sharedConfirm')
      if (confirm) confirm.style.animation = 'popIn 0.5s ease-out forwards'
    }, ${T.uploadDone * 1000})

    // ===== PHASE 4: Story Engagement =====
    setTimeout(() => {
      const confirm = document.getElementById('sharedConfirm')
      if (confirm) {
        confirm.style.transition = 'opacity 0.3s'
        confirm.style.opacity = '0'
      }
      phase3.style.transition = 'opacity 0.3s'
      phase3.style.opacity = '0'

      phase4.style.animation = 'scaleIn 0.5s ease-out forwards'

      // Animate progress bar
      const fill = document.getElementById('progressFill')
      if (fill) {
        fill.style.transition = 'width 8s linear'
        fill.style.width = '100%'
      }
    }, ${T.storyView * 1000})

    // Views counting up
    setTimeout(() => {
      const viewsBar = document.getElementById('viewsBar')
      if (viewsBar) viewsBar.style.animation = 'fadeIn 0.4s ease-out forwards'

      let count = 0
      const target = 47
      const viewEl = document.getElementById('viewCount')
      const interval = setInterval(() => {
        count += Math.ceil(Math.random() * 4)
        if (count >= target) {
          count = target
          clearInterval(interval)
        }
        if (viewEl) viewEl.textContent = count
      }, 120)
    }, ${T.viewsStart * 1000})

    // Reply bubbles
    setTimeout(() => {
      const r1 = document.getElementById('reply1')
      if (r1) r1.style.animation = 'replySlide 0.4s ease-out forwards'
    }, ${T.reply1 * 1000})

    setTimeout(() => {
      const r2 = document.getElementById('reply2')
      if (r2) r2.style.animation = 'replySlide 0.4s ease-out forwards'
    }, ${T.reply2 * 1000})

    setTimeout(() => {
      const r3 = document.getElementById('reply3')
      if (r3) r3.style.animation = 'replySlide 0.4s ease-out forwards'
    }, ${T.reply3 * 1000})

    // CTA Reveal
    setTimeout(() => {
      const overlay = document.getElementById('ctaOverlay')
      if (overlay) {
        overlay.style.transition = 'opacity 0.6s ease-out'
        overlay.style.opacity = '1'
      }

      setTimeout(() => {
        const l1 = document.getElementById('ctaLine1')
        if (l1) l1.style.animation = 'slideUp 0.5s ease-out forwards'
      }, 200)

      setTimeout(() => {
        const l2 = document.getElementById('ctaLine2')
        if (l2) l2.style.animation = 'slideUp 0.5s ease-out forwards'
      }, 600)

      setTimeout(() => {
        const handle = document.getElementById('ctaHandleText')
        if (handle) handle.style.animation = 'fadeIn 0.5s ease-out forwards'
      }, 1000)

      // Pulse on CTA line2
      setTimeout(() => {
        const l2 = document.getElementById('ctaLine2')
        if (l2) l2.style.animation = 'pulseGlow 2s ease-in-out infinite'
      }, 1500)
    }, ${T.ctaReveal * 1000})
  </script>
</body>
</html>`
}

async function render() {
  resetOutputDir()

  const imageDataMap = {}
  for (const photo of PHOTOS) {
    imageDataMap[photo] = readImage(photo)
  }

  writeSources({
    createdAt: new Date().toISOString(),
    strategy: 'v72 — add to story flow animation',
    safeBottomPixels: SAFE_BOTTOM,
    photos: PHOTOS,
  })

  const { execSync } = await import('child_process')
  const browser = await chromium.launch()

  console.log('Recording Add to Story flow animation...')

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
  const finalMp4 = path.join(OUT_DIR, '01_add_to_story.mp4')

  try {
    execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${finalMp4}"`, { stdio: 'pipe' })
    fs.unlinkSync(srcVideo)
    console.log('Rendered 01_add_to_story.mp4')
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
