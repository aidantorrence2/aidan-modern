import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v73')

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 410

const SF = "-apple-system, 'Helvetica Neue', Arial, sans-serif"
const MANILA_COLOR = '#E8443A'
const IG_BG = '#000'

const TOTAL_DURATION_MS = 28000

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
  // Phase 1 (0-4s): IG story with photo, user swipes up
  // Phase 2 (4-16s): Insights panel slides up with animating counters
  // Phase 3 (16-20s): "your story is going viral" notification
  // Phase 4 (20-26s): CTA transition

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
    0% { transform: translateY(100%); }
    100% { transform: translateY(0); }
  }

  @keyframes slideDown {
    0% { transform: translateY(-100%); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }

  @keyframes swipeHint {
    0% { transform: translateY(0); opacity: 1; }
    50% { transform: translateY(-40px); opacity: 0.6; }
    100% { transform: translateY(-80px); opacity: 0; }
  }

  @keyframes barGrow {
    0% { width: 0%; }
    100% { width: var(--bar-target); }
  }

  @keyframes avatarPop {
    0% { opacity: 0; transform: scale(0.3); }
    70% { opacity: 1; transform: scale(1.1); }
    100% { opacity: 1; transform: scale(1); }
  }

  @keyframes notifSlide {
    0% { transform: translateY(-120px); opacity: 0; }
    15% { transform: translateY(0); opacity: 1; }
    85% { transform: translateY(0); opacity: 1; }
    100% { transform: translateY(-120px); opacity: 0; }
  }

  @keyframes pulseGlow {
    0%, 100% { box-shadow: 0 0 0 0 rgba(232, 68, 58, 0.4); }
    50% { box-shadow: 0 0 0 16px rgba(232, 68, 58, 0); }
  }

  @keyframes ctaFadeIn {
    0% { opacity: 0; transform: translateY(30px); }
    100% { opacity: 1; transform: translateY(0); }
  }

  @keyframes scrollViewers {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }

  .page {
    width: ${WIDTH}px;
    height: ${HEIGHT}px;
    position: relative;
    overflow: hidden;
    background: ${IG_BG};
    font-family: ${SF};
  }

  /* ===== PHASE 1: IG Story ===== */
  .story-view {
    position: absolute;
    inset: 0;
    z-index: 10;
  }

  .story-image {
    position: absolute;
    inset: 0;
    z-index: 1;
  }

  .story-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .story-progress {
    position: absolute;
    top: 50px;
    left: 16px;
    right: 16px;
    height: 4px;
    z-index: 5;
    display: flex;
    gap: 4px;
  }

  .story-progress-bar {
    flex: 1;
    background: rgba(255,255,255,0.3);
    border-radius: 2px;
    overflow: hidden;
  }

  .story-progress-fill {
    height: 100%;
    background: #fff;
    width: 0%;
    animation: progressFill 4s linear 0s forwards;
  }

  @keyframes progressFill {
    0% { width: 0%; }
    100% { width: 100%; }
  }

  .story-header {
    position: absolute;
    top: 64px;
    left: 16px;
    right: 16px;
    z-index: 5;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .story-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid #fff;
  }

  .story-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .story-username {
    font-size: 28px;
    font-weight: 600;
    color: #fff;
    text-shadow: 0 1px 4px rgba(0,0,0,0.5);
  }

  .story-time {
    font-size: 24px;
    color: rgba(255,255,255,0.7);
    text-shadow: 0 1px 4px rgba(0,0,0,0.5);
  }

  /* Swipe up hint */
  .swipe-hint {
    position: absolute;
    bottom: ${SAFE_BOTTOM + 60}px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 6;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    opacity: 0;
    animation: fadeIn 0.5s ease-out 1.5s forwards;
  }

  .swipe-chevron {
    animation: swipeHint 1.2s ease-in-out 2.5s forwards;
  }

  .swipe-text {
    font-size: 26px;
    color: rgba(255,255,255,0.9);
    font-weight: 500;
    text-shadow: 0 1px 4px rgba(0,0,0,0.5);
  }

  /* Gradient overlay on story */
  .story-gradient {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 400px;
    background: linear-gradient(transparent, rgba(0,0,0,0.7));
    z-index: 3;
  }

  /* ===== PHASE 2: Insights Panel ===== */
  .insights-panel {
    position: absolute;
    top: 0; left: 0; right: 0;
    bottom: 0;
    z-index: 20;
    background: #1a1a1a;
    transform: translateY(100%);
    animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 4s forwards;
  }

  .insights-inner {
    position: absolute;
    top: 0; left: 0; right: 0;
    bottom: ${SAFE_BOTTOM}px;
    overflow: hidden;
    padding: 0;
  }

  /* Drag handle */
  .drag-handle {
    width: 50px;
    height: 5px;
    background: #555;
    border-radius: 3px;
    margin: 14px auto 0;
  }

  /* Insights header */
  .insights-title-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px 24px 16px;
    position: relative;
  }

  .insights-title {
    font-size: 34px;
    font-weight: 700;
    color: #fff;
    text-align: center;
  }

  .insights-close {
    position: absolute;
    right: 24px;
    top: 20px;
    font-size: 36px;
    color: #888;
    cursor: pointer;
  }

  /* Story thumbnail */
  .insights-thumb-row {
    display: flex;
    align-items: center;
    padding: 16px 32px 20px;
    gap: 16px;
  }

  .insights-thumb {
    width: 90px;
    height: 160px;
    border-radius: 12px;
    overflow: hidden;
    flex-shrink: 0;
    border: 2px solid #333;
  }

  .insights-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .insights-thumb-info {
    flex: 1;
  }

  .insights-thumb-date {
    font-size: 24px;
    color: #888;
    margin-bottom: 4px;
  }

  .insights-thumb-type {
    font-size: 28px;
    color: #fff;
    font-weight: 600;
  }

  /* Divider */
  .insights-divider {
    height: 1px;
    background: #333;
    margin: 0 32px;
  }

  /* Overview section */
  .insights-section {
    padding: 24px 32px;
  }

  .insights-section-title {
    font-size: 24px;
    font-weight: 600;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 20px;
  }

  /* Big stat row */
  .big-stat {
    display: flex;
    align-items: baseline;
    gap: 12px;
    margin-bottom: 16px;
  }

  .big-stat-number {
    font-size: 72px;
    font-weight: 800;
    color: #fff;
    font-variant-numeric: tabular-nums;
  }

  .big-stat-label {
    font-size: 28px;
    color: #aaa;
  }

  .big-stat-change {
    font-size: 24px;
    color: #4cd964;
    font-weight: 600;
  }

  /* Interaction grid */
  .interaction-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-top: 16px;
  }

  .interaction-item {
    background: #262626;
    border-radius: 16px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .interaction-icon-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .interaction-icon {
    font-size: 28px;
  }

  .interaction-label {
    font-size: 24px;
    color: #888;
  }

  .interaction-number {
    font-size: 48px;
    font-weight: 800;
    color: #fff;
    font-variant-numeric: tabular-nums;
  }

  /* Bar chart */
  .bar-chart {
    margin-top: 16px;
  }

  .bar-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 10px;
  }

  .bar-label {
    font-size: 22px;
    color: #888;
    width: 140px;
    text-align: right;
    flex-shrink: 0;
  }

  .bar-track {
    flex: 1;
    height: 24px;
    background: #262626;
    border-radius: 12px;
    overflow: hidden;
  }

  .bar-fill {
    height: 100%;
    border-radius: 12px;
    width: 0%;
  }

  .bar-fill.followers { background: #3797f0; }
  .bar-fill.non-followers { background: #8e8e8e; }

  .bar-value {
    font-size: 22px;
    color: #fff;
    font-weight: 600;
    width: 100px;
    flex-shrink: 0;
  }

  /* Viewer avatars */
  .viewer-row {
    display: flex;
    align-items: center;
    padding: 16px 32px;
    gap: 12px;
    overflow: hidden;
  }

  .viewer-avatars {
    display: flex;
    gap: -8px;
    animation: scrollViewers 12s linear 6s infinite;
  }

  .viewer-circle {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    flex-shrink: 0;
    margin-right: -8px;
    border: 2px solid #1a1a1a;
    opacity: 0;
  }

  .viewer-label {
    font-size: 24px;
    color: #888;
    white-space: nowrap;
    margin-left: 12px;
  }

  /* ===== PHASE 3: Notification ===== */
  .notif-banner {
    position: absolute;
    top: 50px;
    left: 24px;
    right: 24px;
    z-index: 30;
    background: #262626;
    border-radius: 20px;
    padding: 20px 24px;
    display: flex;
    align-items: center;
    gap: 16px;
    opacity: 0;
    transform: translateY(-120px);
    animation: notifSlide 4s ease-in-out 16s forwards;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5);
  }

  .notif-icon {
    width: 52px;
    height: 52px;
    border-radius: 12px;
    background: linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .notif-icon svg {
    fill: #fff;
  }

  .notif-text {
    flex: 1;
  }

  .notif-app {
    font-size: 22px;
    color: #888;
    font-weight: 500;
    margin-bottom: 4px;
  }

  .notif-msg {
    font-size: 30px;
    color: #fff;
    font-weight: 600;
  }

  .notif-time {
    font-size: 20px;
    color: #666;
    margin-top: 2px;
  }

  /* ===== PHASE 4: CTA ===== */
  .cta-overlay {
    position: absolute;
    inset: 0;
    z-index: 40;
    background: ${IG_BG};
    opacity: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding-top: 200px;
  }

  .cta-line1 {
    font-size: 52px;
    font-weight: 700;
    color: #fff;
    text-align: center;
    padding: 0 48px;
    line-height: 1.35;
    opacity: 0;
    transform: translateY(30px);
  }

  .cta-line2 {
    font-size: 68px;
    font-weight: 900;
    color: ${MANILA_COLOR};
    text-align: center;
    margin-top: 40px;
    padding: 0 48px;
    line-height: 1.25;
    text-transform: uppercase;
    opacity: 0;
    transform: translateY(30px);
  }

  .cta-line3 {
    font-size: 52px;
    font-weight: 700;
    color: #fff;
    text-align: center;
    margin-top: 48px;
    padding: 0 48px;
    line-height: 1.35;
    opacity: 0;
    transform: translateY(30px);
  }

  .cta-handle {
    font-size: 38px;
    color: rgba(255,255,255,0.5);
    text-align: center;
    margin-top: 24px;
    opacity: 0;
    transform: translateY(30px);
  }

  .cta-photo-strip {
    display: flex;
    gap: 12px;
    margin-top: 60px;
    opacity: 0;
    transform: translateY(30px);
  }

  .cta-photo-strip img {
    width: 160px;
    height: 220px;
    object-fit: cover;
    border-radius: 12px;
  }
</style>
</head>
<body>
  <div class="page">

    <!-- ===== PHASE 1: IG Story View ===== -->
    <div class="story-view" id="storyView">
      <div class="story-image">
        <img src="${imageDataMap[PHOTOS[0]]}" alt="story" />
      </div>
      <div class="story-gradient"></div>

      <div class="story-progress">
        <div class="story-progress-bar"><div class="story-progress-fill"></div></div>
        <div class="story-progress-bar"></div>
        <div class="story-progress-bar"></div>
      </div>

      <div class="story-header">
        <div class="story-avatar">
          <img src="${imageDataMap[PHOTOS[4]]}" alt="avatar" />
        </div>
        <span class="story-username">madebyaidan</span>
        <span class="story-time">2h</span>
      </div>

      <div class="swipe-hint" id="swipeHint">
        <div class="swipe-chevron">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="18 15 12 9 6 15"></polyline>
          </svg>
        </div>
        <div class="swipe-chevron" style="margin-top:-20px;opacity:0.5;">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="18 15 12 9 6 15"></polyline>
          </svg>
        </div>
        <span class="swipe-text">Swipe up for insights</span>
      </div>
    </div>

    <!-- ===== PHASE 2: Insights Panel ===== -->
    <div class="insights-panel" id="insightsPanel">
      <div class="insights-inner">
        <div class="drag-handle"></div>

        <div class="insights-title-bar">
          <span class="insights-title">Story Insights</span>
          <span class="insights-close">&times;</span>
        </div>

        <!-- Story thumbnail -->
        <div class="insights-thumb-row">
          <div class="insights-thumb">
            <img src="${imageDataMap[PHOTOS[0]]}" alt="thumb" />
          </div>
          <div class="insights-thumb-info">
            <div class="insights-thumb-date">Today at 2:34 PM</div>
            <div class="insights-thumb-type">Photo Story</div>
          </div>
        </div>

        <div class="insights-divider"></div>

        <!-- Overview: Accounts Reached -->
        <div class="insights-section">
          <div class="insights-section-title">Overview</div>

          <div class="big-stat">
            <div class="big-stat-number" id="reachedCounter">0</div>
            <div style="display:flex;flex-direction:column;">
              <div class="big-stat-label">Accounts reached</div>
              <div class="big-stat-change" id="reachedChange" style="opacity:0;">+847% vs. usual</div>
            </div>
          </div>

          <!-- Bar chart: Followers vs Non-followers -->
          <div class="bar-chart">
            <div class="bar-row">
              <div class="bar-label">Followers</div>
              <div class="bar-track">
                <div class="bar-fill followers" id="barFollowers" style="--bar-target:35%;"></div>
              </div>
              <div class="bar-value" id="barFollowersVal">0</div>
            </div>
            <div class="bar-row">
              <div class="bar-label">Non-followers</div>
              <div class="bar-track">
                <div class="bar-fill non-followers" id="barNonFollowers" style="--bar-target:80%;"></div>
              </div>
              <div class="bar-value" id="barNonFollowersVal">0</div>
            </div>
          </div>
        </div>

        <div class="insights-divider"></div>

        <!-- Content Interactions -->
        <div class="insights-section">
          <div class="insights-section-title">Content Interactions</div>

          <div class="interaction-grid">
            <div class="interaction-item">
              <div class="interaction-icon-row">
                <span class="interaction-icon">\u2764\uFE0F</span>
                <span class="interaction-label">Likes</span>
              </div>
              <div class="interaction-number" id="likesCounter">0</div>
            </div>
            <div class="interaction-item">
              <div class="interaction-icon-row">
                <span class="interaction-icon">\u{1F4AC}</span>
                <span class="interaction-label">Replies</span>
              </div>
              <div class="interaction-number" id="repliesCounter">0</div>
            </div>
            <div class="interaction-item">
              <div class="interaction-icon-row">
                <span class="interaction-icon">\u{1F4E4}</span>
                <span class="interaction-label">Shares</span>
              </div>
              <div class="interaction-number" id="sharesCounter">0</div>
            </div>
            <div class="interaction-item">
              <div class="interaction-icon-row">
                <span class="interaction-icon">\u{1F464}</span>
                <span class="interaction-label">Profile visits</span>
              </div>
              <div class="interaction-number" id="visitsCounter">0</div>
            </div>
          </div>
        </div>

        <div class="insights-divider"></div>

        <!-- Viewer avatars -->
        <div class="insights-section" style="padding-bottom:8px;">
          <div class="insights-section-title">Viewers</div>
        </div>
        <div class="viewer-row" id="viewerRow">
          <div class="viewer-avatars" id="viewerAvatars">
            ${generateViewerAvatars(40)}
          </div>
          <span class="viewer-label" id="viewerLabel">0 viewers</span>
        </div>
      </div>
    </div>

    <!-- ===== PHASE 3: Notification Banner ===== -->
    <div class="notif-banner" id="notifBanner">
      <div class="notif-icon">
        <svg width="28" height="28" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
      </div>
      <div class="notif-text">
        <div class="notif-app">Instagram</div>
        <div class="notif-msg">your story is going viral \u{1F525}</div>
        <div class="notif-time">just now</div>
      </div>
    </div>

    <!-- ===== PHASE 4: CTA Overlay ===== -->
    <div class="cta-overlay" id="ctaOverlay">
      <div class="cta-line1" id="ctaLine1">imagine YOUR story<br/>blowing up like this</div>
      <div class="cta-line2" id="ctaLine2">free photo shoot<br/>in Manila</div>
      <div class="cta-line3" id="ctaLine3">dm me if interested!!</div>
      <div class="cta-handle" id="ctaHandle">@madebyaidan on Instagram</div>
      <div class="cta-photo-strip" id="ctaPhotos">
        <img src="${imageDataMap[PHOTOS[1]]}" />
        <img src="${imageDataMap[PHOTOS[2]]}" />
        <img src="${imageDataMap[PHOTOS[3]]}" />
        <img src="${imageDataMap[PHOTOS[6]]}" />
        <img src="${imageDataMap[PHOTOS[7]]}" />
      </div>
    </div>

  </div>

  <script>
    // Easing: slow start, accelerate, decelerate at end
    function easeOutExpo(t) {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    // Count up animation with satisfying easing
    function animateCounter(elementId, target, duration, startDelay) {
      const el = document.getElementById(elementId);
      if (!el) return;

      setTimeout(() => {
        const startTime = performance.now();
        function update(now) {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easedProgress = easeOutExpo(progress);
          const current = Math.round(easedProgress * target);
          el.textContent = current.toLocaleString();
          if (progress < 1) {
            requestAnimationFrame(update);
          }
        }
        requestAnimationFrame(update);
      }, startDelay);
    }

    // ===== PHASE 2: Insights counters start at 4.6s (panel finishes sliding up) =====
    const PANEL_READY = 4600; // 4s delay + 0.6s animation

    // Accounts reached: big number, long animation
    animateCounter('reachedCounter', 4892, 4000, PANEL_READY + 200);

    // Show percentage change after counter finishes
    setTimeout(() => {
      const change = document.getElementById('reachedChange');
      if (change) {
        change.style.transition = 'opacity 0.5s ease-out';
        change.style.opacity = '1';
      }
    }, PANEL_READY + 4400);

    // Bar chart animation
    setTimeout(() => {
      const barF = document.getElementById('barFollowers');
      const barNF = document.getElementById('barNonFollowers');
      if (barF) {
        barF.style.transition = 'width 2s cubic-bezier(0.16, 1, 0.3, 1)';
        barF.style.width = '35%';
      }
      if (barNF) {
        barNF.style.transition = 'width 2.5s cubic-bezier(0.16, 1, 0.3, 1)';
        barNF.style.width = '80%';
      }
    }, PANEL_READY + 800);

    // Bar chart value counters
    animateCounter('barFollowersVal', 1712, 2000, PANEL_READY + 800);
    animateCounter('barNonFollowersVal', 3180, 2500, PANEL_READY + 800);

    // Content interaction counters (stagger start)
    animateCounter('likesCounter', 342, 3000, PANEL_READY + 1500);
    animateCounter('repliesCounter', 89, 2500, PANEL_READY + 2000);
    animateCounter('sharesCounter', 156, 2800, PANEL_READY + 2500);
    animateCounter('visitsCounter', 267, 2600, PANEL_READY + 3000);

    // Viewer avatars pop in one by one
    const avatars = document.querySelectorAll('.viewer-circle');
    avatars.forEach((av, i) => {
      setTimeout(() => {
        av.style.animation = 'avatarPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards';
      }, PANEL_READY + 2000 + i * 120);
    });

    // Viewer count label
    const viewerLabel = document.getElementById('viewerLabel');
    if (viewerLabel) {
      let viewerCount = 0;
      avatars.forEach((av, i) => {
        setTimeout(() => {
          viewerCount++;
          viewerLabel.textContent = viewerCount + (viewerCount > 30 ? '+ viewers' : ' viewers');
        }, PANEL_READY + 2000 + i * 120);
      });
    }

    // ===== PHASE 4: CTA Transition at 20s =====
    setTimeout(() => {
      const cta = document.getElementById('ctaOverlay');
      if (cta) {
        cta.style.transition = 'opacity 0.8s ease-out';
        cta.style.opacity = '1';
      }
    }, 20000);

    // CTA lines fade in sequentially
    const ctaTimings = [
      { id: 'ctaLine1', delay: 20400 },
      { id: 'ctaLine2', delay: 21200 },
      { id: 'ctaLine3', delay: 22200 },
      { id: 'ctaHandle', delay: 23000 },
      { id: 'ctaPhotos', delay: 23600 },
    ];

    ctaTimings.forEach(({ id, delay }) => {
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }
      }, delay);
    });

    // Pulse CTA line
    setTimeout(() => {
      const ctaLine2 = document.getElementById('ctaLine2');
      if (ctaLine2) {
        ctaLine2.style.animation = 'pulseGlow 2s ease-in-out infinite';
      }
    }, 22000);
  </script>
</body>
</html>`;
}

function generateViewerAvatars(count) {
  const colors = [
    '#E8443A', '#3797f0', '#4cd964', '#ff9500', '#af52de',
    '#ff2d55', '#5ac8fa', '#ffcc00', '#ff6b6b', '#34c759',
    '#007aff', '#ff9f0a', '#bf5af2', '#64d2ff', '#30d158',
  ];
  let html = '';
  for (let i = 0; i < count * 2; i++) { // double for scroll loop
    const c = colors[i % colors.length];
    html += `<div class="viewer-circle" style="background:${c};"></div>`;
  }
  return html;
}

async function render() {
  resetOutputDir()

  const imageDataMap = {}
  for (const photo of PHOTOS) {
    imageDataMap[photo] = readImage(photo)
  }

  writeSources({
    createdAt: new Date().toISOString(),
    strategy: 'v73 — story insights/analytics checking animation',
    safeBottomPixels: SAFE_BOTTOM,
    photos: PHOTOS,
  })

  const { execSync } = await import('child_process')
  const browser = await chromium.launch()

  console.log('Recording story insights animation (v73)...')

  const videoCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: OUT_DIR,
      size: { width: WIDTH, height: HEIGHT },
    },
  })

  const videoPage = await videoCtx.newPage()

  // Set dark background before setContent to prevent white flash
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
  const finalMp4 = path.join(OUT_DIR, '01_story_insights.mp4')

  try {
    execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${finalMp4}"`, { stdio: 'pipe' })
    fs.unlinkSync(srcVideo)
    console.log('Rendered 01_story_insights.mp4')
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
