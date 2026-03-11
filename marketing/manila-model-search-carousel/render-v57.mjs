import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v57')

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 410

const SF = "-apple-system, 'Helvetica Neue', Arial, sans-serif"

const MANILA_COLOR = '#E8443A'
const HANDLE = 'madebyaidan'

const TOTAL_DURATION = 22
const TOTAL_DURATION_MS = 24000

function resetOutputDir() {
  fs.rmSync(OUT_DIR, { recursive: true, force: true })
  fs.mkdirSync(OUT_DIR, { recursive: true })
}

function imageMime(name) {
  const ext = path.extname(name).toLowerCase()
  if (ext === '.png') return 'image/png'
  if (ext === '.webp') return 'image/webp'
  return 'image/jpeg'
}

function readImage(name) {
  const filePath = path.join(IMAGE_DIR, name)
  const buf = fs.readFileSync(filePath)
  return `data:${imageMime(name)};base64,${buf.toString('base64')}`
}

function writeSources(payload) {
  fs.writeFileSync(path.join(OUT_DIR, 'sources.json'), JSON.stringify(payload, null, 2))
}

function buildAnimated(images) {
  // Timeline (seconds) — Instagram Profile Loading concept
  const T = {
    // 0-0.5s: Full skeleton visible
    topBarReveal: 0.5,         // 0.5-1.5s
    profilePicPop: 1.5,       // 1.5-2.5s
    usernameReveal: 2.5,      // 2.5-3.5s
    nameReveal: 2.8,
    bioLine1: 3.5,            // 3.5-5s bio lines staggered
    bioLine2: 4.0,
    bioLine3: 4.5,
    statsIn: 5.0,             // 5-6s stats
    buttonsIn: 6.0,           // 6-7s buttons
    // 7-13s: photo grid fills
    gridStart: 7.0,
    gridInterval: 0.8,
    // 13-14s: toast notification
    toastIn: 13.0,
    // 14-16s: bio updates to CTA
    bioToCta: 14.5,
    // 16-22s: hold
  }

  // Grid photo delays
  const gridDelays = []
  for (let i = 0; i < 6; i++) {
    gridDelays.push(T.gridStart + i * T.gridInterval)
  }

  return `<!DOCTYPE html>
<html>
  <head>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      html, body { margin: 0; padding: 0; background: #000; -webkit-font-smoothing: antialiased; }

      @keyframes shimmer {
        0% { background-position: -400px 0; }
        100% { background-position: 400px 0; }
      }

      @keyframes shimmerFadeOut {
        0% { opacity: 1; }
        100% { opacity: 0; }
      }

      @keyframes fadeIn {
        0% { opacity: 0; }
        100% { opacity: 1; }
      }

      @keyframes fadeSlideUp {
        0% { opacity: 0; transform: translateY(14px); }
        100% { opacity: 1; transform: translateY(0); }
      }

      @keyframes photoPop {
        0% { opacity: 0; transform: scale(0.3); }
        60% { opacity: 1; transform: scale(1.08); }
        80% { transform: scale(0.96); }
        100% { opacity: 1; transform: scale(1); }
      }

      @keyframes profilePicPop {
        0% { opacity: 0; transform: scale(0); }
        50% { opacity: 1; transform: scale(1.12); }
        70% { transform: scale(0.94); }
        85% { transform: scale(1.04); }
        100% { opacity: 1; transform: scale(1); }
      }

      @keyframes toastSlide {
        0% { opacity: 0; transform: translateY(-100px); }
        40% { opacity: 1; transform: translateY(8px); }
        60% { transform: translateY(-3px); }
        100% { opacity: 1; transform: translateY(0); }
      }

      @keyframes buttonReveal {
        0% { opacity: 0; transform: scale(0.85); }
        60% { opacity: 1; transform: scale(1.03); }
        100% { opacity: 1; transform: scale(1); }
      }

      @keyframes countUp {
        0% { opacity: 0; transform: translateY(10px); }
        100% { opacity: 1; transform: translateY(0); }
      }

      @keyframes bioSwap {
        0% { opacity: 1; transform: translateY(0); }
        40% { opacity: 0; transform: translateY(-12px); }
        60% { opacity: 0; transform: translateY(12px); }
        100% { opacity: 1; transform: translateY(0); }
      }

      .shimmer-bar {
        background: linear-gradient(90deg, #222 0%, #333 40%, #444 50%, #333 60%, #222 100%);
        background-size: 800px 100%;
        animation: shimmer 1.5s infinite linear;
        border-radius: 12px;
      }

      .shimmer-circle {
        background: linear-gradient(90deg, #222 0%, #333 40%, #444 50%, #333 60%, #222 100%);
        background-size: 800px 100%;
        animation: shimmer 1.5s infinite linear;
        border-radius: 50%;
      }

      .page {
        width: ${WIDTH}px;
        height: ${HEIGHT}px;
        position: relative;
        overflow: hidden;
        background: #000;
        font-family: ${SF};
      }

      /* IG top bar */
      .top-bar {
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 90px;
        padding: 30px 24px 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        z-index: 10;
      }

      .top-bar-text-skel {
        width: 200px; height: 32px;
      }

      .top-bar-icons-skel {
        display: flex; gap: 16px;
      }

      .top-bar-icon-skel {
        width: 32px; height: 32px;
        border-radius: 8px;
      }

      .top-bar-text {
        font-size: 36px;
        font-weight: 700;
        color: #fff;
        letter-spacing: -0.02em;
        opacity: 0;
      }

      .top-bar-icons {
        display: flex; gap: 20px;
        opacity: 0;
      }

      /* Profile section */
      .profile-section {
        position: absolute;
        top: 100px;
        left: 0; right: 0;
        padding: 20px 32px;
      }

      .profile-header {
        display: flex;
        align-items: center;
        gap: 28px;
        margin-bottom: 18px;
      }

      .profile-pic-wrap {
        width: 160px; height: 160px;
        border-radius: 50%;
        position: relative;
        flex-shrink: 0;
      }

      .profile-pic-skel {
        position: absolute; inset: 0;
      }

      .profile-pic-img {
        position: absolute; inset: 0;
        border-radius: 50%;
        overflow: hidden;
        opacity: 0;
        transform: scale(0);
      }

      .profile-pic-img img {
        width: 100%; height: 100%;
        object-fit: cover;
        object-position: center 20%;
      }

      .profile-info {
        flex: 1;
      }

      /* Stats row */
      .stats-row {
        display: flex;
        justify-content: space-around;
        padding: 20px 0;
        margin: 0 32px;
        border-top: 1px solid #222;
        border-bottom: 1px solid #222;
      }

      .stat-item {
        text-align: center;
        position: relative;
      }

      .stat-number {
        font-size: 40px;
        font-weight: 700;
        color: #fff;
        opacity: 0;
      }

      .stat-label {
        font-size: 24px;
        color: rgba(255,255,255,0.5);
        margin-top: 2px;
        opacity: 0;
      }

      .stat-skel {
        position: absolute;
        top: 2px;
        left: 50%;
        transform: translateX(-50%);
      }

      /* Bio */
      .bio-section {
        padding: 16px 32px 0;
      }

      .bio-line {
        position: relative;
        height: 42px;
        margin-bottom: 6px;
      }

      .bio-text {
        font-size: 32px;
        color: #fff;
        font-weight: 400;
        line-height: 1.3;
        opacity: 0;
        position: absolute;
        top: 4px; left: 0;
      }

      .bio-skel {
        position: absolute;
        top: 6px; left: 0;
        height: 28px;
      }

      /* Action buttons */
      .action-buttons {
        display: flex;
        gap: 12px;
        padding: 20px 32px 0;
      }

      .btn-primary {
        flex: 1.6;
        height: 62px;
        border-radius: 14px;
        background: #34C759;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transform: scale(0.85);
      }

      .btn-primary span {
        font-size: 30px;
        font-weight: 700;
        color: #fff;
        letter-spacing: 0.02em;
      }

      .btn-secondary {
        flex: 1;
        height: 62px;
        border-radius: 14px;
        background: #333;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transform: scale(0.85);
      }

      .btn-secondary span {
        font-size: 30px;
        font-weight: 600;
        color: #fff;
      }

      .btn-skel {
        height: 62px;
        border-radius: 14px;
        position: absolute;
        top: 0; left: 0; right: 0;
      }

      /* Photo grid */
      .photo-grid {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 4px;
        padding: 20px 32px 0;
      }

      .grid-cell {
        aspect-ratio: 1;
        position: relative;
        overflow: hidden;
        border-radius: 6px;
      }

      .grid-skel {
        position: absolute; inset: 0;
        border-radius: 6px;
      }

      .grid-img {
        position: absolute; inset: 0;
        opacity: 0;
        transform: scale(0.3);
      }

      .grid-img img {
        width: 100%; height: 100%;
        object-fit: cover;
        object-position: center 20%;
        border-radius: 6px;
      }

      /* Toast */
      .toast {
        position: absolute;
        left: 40px; right: 40px;
        top: 40px;
        z-index: 20;
        opacity: 0;
        transform: translateY(-100px);
      }

      .toast-inner {
        background: rgba(30,30,30,0.95);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border-radius: 18px;
        padding: 22px 28px;
        border: 1px solid rgba(255,255,255,0.12);
      }

      .toast-text {
        font-size: 30px;
        font-weight: 600;
        color: rgba(255,255,255,0.95);
        line-height: 1.3;
      }

      /* CTA overlay on bio */
      .cta-bio {
        position: absolute;
        opacity: 0;
      }

      .cta-bio .cta-line1 {
        font-size: 36px;
        font-weight: 800;
        color: ${MANILA_COLOR};
        margin-bottom: 6px;
      }

      .cta-bio .cta-line2 {
        font-size: 30px;
        font-weight: 500;
        color: rgba(255,255,255,0.7);
      }
    </style>
  </head>
  <body>
    <div class="page">

      <!-- ===== TOP BAR ===== -->
      <div class="top-bar">
        <!-- Skeleton -->
        <div class="shimmer-bar top-bar-text-skel" style="animation: shimmer 1.5s infinite linear, shimmerFadeOut 0.3s ease-out ${T.topBarReveal}s forwards;"></div>
        <div class="top-bar-icons-skel">
          <div class="shimmer-bar top-bar-icon-skel" style="animation: shimmer 1.5s infinite linear, shimmerFadeOut 0.3s ease-out ${T.topBarReveal}s forwards;"></div>
          <div class="shimmer-bar top-bar-icon-skel" style="animation: shimmer 1.5s infinite linear, shimmerFadeOut 0.3s ease-out ${T.topBarReveal + 0.1}s forwards;"></div>
          <div class="shimmer-bar top-bar-icon-skel" style="animation: shimmer 1.5s infinite linear, shimmerFadeOut 0.3s ease-out ${T.topBarReveal + 0.2}s forwards;"></div>
        </div>
        <!-- Revealed content -->
        <div class="top-bar-text" style="position:absolute;left:24px;top:30px;animation: fadeSlideUp 0.5s ease-out ${T.topBarReveal + 0.15}s forwards;">Instagram</div>
        <div class="top-bar-icons" style="position:absolute;right:24px;top:32px;animation: fadeIn 0.5s ease-out ${T.topBarReveal + 0.2}s forwards;">
          <!-- Simple SVG icons: heart, messenger, add -->
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
        </div>
      </div>

      <!-- ===== PROFILE SECTION ===== -->
      <div class="profile-section">
        <div class="profile-header">
          <!-- Profile pic -->
          <div class="profile-pic-wrap">
            <div class="shimmer-circle profile-pic-skel" style="width:160px;height:160px;animation: shimmer 1.5s infinite linear, shimmerFadeOut 0.3s ease-out ${T.profilePicPop}s forwards;"></div>
            <div class="profile-pic-img" style="animation: profilePicPop 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) ${T.profilePicPop}s forwards;">
              <img src="${images.profilePic}" alt="profile" />
            </div>
          </div>

          <!-- Username + Name next to pic -->
          <div class="profile-info">
            <!-- Username skeleton + text -->
            <div style="position:relative;height:52px;margin-bottom:4px;">
              <div class="shimmer-bar" style="width:280px;height:36px;position:absolute;top:8px;left:0;animation: shimmer 1.5s infinite linear, shimmerFadeOut 0.3s ease-out ${T.usernameReveal}s forwards;"></div>
              <div style="font-size:48px;font-weight:700;color:#fff;position:absolute;top:0;left:0;opacity:0;animation: fadeSlideUp 0.5s ease-out ${T.usernameReveal + 0.15}s forwards;">@${HANDLE}</div>
            </div>
            <!-- Name skeleton + text -->
            <div style="position:relative;height:44px;">
              <div class="shimmer-bar" style="width:220px;height:28px;position:absolute;top:8px;left:0;animation: shimmer 1.5s infinite linear, shimmerFadeOut 0.3s ease-out ${T.nameReveal}s forwards;"></div>
              <div style="font-size:38px;font-weight:400;color:rgba(255,255,255,0.7);position:absolute;top:0;left:0;opacity:0;animation: fadeSlideUp 0.5s ease-out ${T.nameReveal + 0.15}s forwards;">Aidan Torrence</div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== BIO SECTION ===== -->
      <div class="bio-section" style="position:absolute;top:372px;left:0;right:0;">
        <!-- Bio line 1 -->
        <div class="bio-line">
          <div class="shimmer-bar bio-skel" style="width:420px;animation: shimmer 1.5s infinite linear, shimmerFadeOut 0.3s ease-out ${T.bioLine1}s forwards;"></div>
          <div class="bio-text" id="bio1" style="animation: fadeSlideUp 0.5s ease-out ${T.bioLine1 + 0.15}s forwards;">Photographer in Manila</div>
        </div>
        <!-- Bio line 2 -->
        <div class="bio-line">
          <div class="shimmer-bar bio-skel" style="width:480px;animation: shimmer 1.5s infinite linear, shimmerFadeOut 0.3s ease-out ${T.bioLine2}s forwards;"></div>
          <div class="bio-text" id="bio2" style="animation: fadeSlideUp 0.5s ease-out ${T.bioLine2 + 0.15}s forwards;">Free photo shoot collabs</div>
        </div>
        <!-- Bio line 3 -->
        <div class="bio-line">
          <div class="shimmer-bar bio-skel" style="width:370px;animation: shimmer 1.5s infinite linear, shimmerFadeOut 0.3s ease-out ${T.bioLine3}s forwards;"></div>
          <div class="bio-text" id="bio3" style="animation: fadeSlideUp 0.5s ease-out ${T.bioLine3 + 0.15}s forwards;">No experience needed</div>
        </div>

        <!-- CTA text that replaces bio -->
        <div class="cta-bio" id="ctaBio" style="position:absolute;top:0;left:32px;right:32px;">
          <div class="cta-line1">PHOTO SHOOT</div>
          <div class="cta-line2" style="margin-top:4px;">sign up below</div>
          <div style="font-size:28px;font-weight:400;color:rgba(255,255,255,0.5);margin-top:6px;">it takes just a minute</div>
        </div>
      </div>

      <!-- ===== STATS ROW ===== -->
      <div class="stats-row" style="position:absolute;top:520px;left:0;right:0;margin:0 32px;">
        <!-- Posts -->
        <div class="stat-item" style="width:180px;">
          <div class="shimmer-bar stat-skel" style="width:80px;height:34px;animation: shimmer 1.5s infinite linear, shimmerFadeOut 0.3s ease-out ${T.statsIn}s forwards;"></div>
          <div class="stat-number" style="animation: countUp 0.5s ease-out ${T.statsIn + 0.15}s forwards;">127</div>
          <div class="stat-label" style="animation: fadeIn 0.4s ease-out ${T.statsIn + 0.3}s forwards;">posts</div>
        </div>
        <!-- Followers -->
        <div class="stat-item" style="width:180px;">
          <div class="shimmer-bar stat-skel" style="width:80px;height:34px;animation: shimmer 1.5s infinite linear, shimmerFadeOut 0.3s ease-out ${T.statsIn + 0.2}s forwards;"></div>
          <div class="stat-number" style="animation: countUp 0.5s ease-out ${T.statsIn + 0.3}s forwards;">2.4K</div>
          <div class="stat-label" style="animation: fadeIn 0.4s ease-out ${T.statsIn + 0.45}s forwards;">followers</div>
        </div>
        <!-- Following -->
        <div class="stat-item" style="width:180px;">
          <div class="shimmer-bar stat-skel" style="width:80px;height:34px;animation: shimmer 1.5s infinite linear, shimmerFadeOut 0.3s ease-out ${T.statsIn + 0.4}s forwards;"></div>
          <div class="stat-number" style="animation: countUp 0.5s ease-out ${T.statsIn + 0.5}s forwards;">843</div>
          <div class="stat-label" style="animation: fadeIn 0.4s ease-out ${T.statsIn + 0.6}s forwards;">following</div>
        </div>
      </div>

      <!-- ===== ACTION BUTTONS ===== -->
      <div class="action-buttons" style="position:absolute;top:640px;left:0;right:0;">
        <div style="position:relative;flex:1.6;">
          <div class="shimmer-bar btn-skel" style="animation: shimmer 1.5s infinite linear, shimmerFadeOut 0.3s ease-out ${T.buttonsIn}s forwards;"></div>
          <div class="btn-primary" style="animation: buttonReveal 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${T.buttonsIn + 0.1}s forwards;">
            <span>Sign Up</span>
          </div>
        </div>
        <div style="position:relative;flex:1;">
          <div class="shimmer-bar btn-skel" style="animation: shimmer 1.5s infinite linear, shimmerFadeOut 0.3s ease-out ${T.buttonsIn + 0.15}s forwards;"></div>
          <div class="btn-secondary" style="animation: buttonReveal 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${T.buttonsIn + 0.25}s forwards;">
            <span>Message</span>
          </div>
        </div>
      </div>

      <!-- ===== PHOTO GRID ===== -->
      <!-- Grid separator line -->
      <div style="position:absolute;top:732px;left:32px;right:32px;height:1px;background:#222;"></div>
      <!-- Grid tab icons -->
      <div style="position:absolute;top:740px;left:32px;right:32px;display:flex;justify-content:center;gap:120px;padding:10px 0;">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="white" opacity="0.8"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
        <svg width="30" height="30" viewBox="0 0 24 24" fill="white" opacity="0.3"><path d="M17 2H7a5 5 0 0 0-5 5v10a5 5 0 0 0 5 5h10a5 5 0 0 0 5-5V7a5 5 0 0 0-5-5zm-5 14a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"/></svg>
        <svg width="30" height="30" viewBox="0 0 24 24" fill="white" opacity="0.3"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/></svg>
      </div>

      <div class="photo-grid" style="position:absolute;top:790px;left:0;right:0;padding:0 4px;">
        ${images.grid.map((img, i) => {
          const delay = gridDelays[i]
          return `<div class="grid-cell">
            <div class="shimmer-bar grid-skel" style="animation: shimmer 1.5s infinite linear, shimmerFadeOut 0.3s ease-out ${delay}s forwards;"></div>
            <div class="grid-img" style="animation: photoPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}s forwards;">
              <img src="${img}" />
            </div>
          </div>`
        }).join('\n        ')}
      </div>

      <!-- ===== TOAST NOTIFICATION ===== -->
      <div class="toast" style="animation: toastSlide 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) ${T.toastIn}s forwards;">
        <div class="toast-inner" style="display:flex;align-items:center;gap:14px;">
          <div style="width:48px;height:48px;border-radius:50%;background:${MANILA_COLOR};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="white"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6.002 6.002 0 0 0-4-5.659V5a2 2 0 1 0-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9"/></svg>
          </div>
          <div class="toast-text">Free photo shoot collabs — sign up below</div>
        </div>
      </div>

    </div>

    <script>
      // Bio → CTA swap at ${T.bioToCta}s
      setTimeout(() => {
        // Fade out original bio lines
        const bio1 = document.getElementById('bio1')
        const bio2 = document.getElementById('bio2')
        const bio3 = document.getElementById('bio3')
        const ctaBio = document.getElementById('ctaBio');

        [bio1, bio2, bio3].forEach((el, i) => {
          el.style.transition = 'opacity 0.4s ease-out, transform 0.4s ease-out'
          el.style.opacity = '0'
          el.style.transform = 'translateY(-10px)'
        })

        // Also hide the skeleton bar containers
        const bioLines = document.querySelectorAll('.bio-line .shimmer-bar')
        bioLines.forEach(el => { el.style.display = 'none' })

        // Show CTA bio after fade out
        setTimeout(() => {
          ctaBio.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out'
          ctaBio.style.opacity = '1'
          ctaBio.style.transform = 'translateY(0)'
        }, 450)
      }, ${T.bioToCta * 1000})
    </script>
  </body>
</html>`
}

async function render() {
  resetOutputDir()

  const photoFiles = [
    'manila-gallery-garden-001.jpg',
    'manila-gallery-dsc-0075.jpg',
    'manila-gallery-dsc-0190.jpg',
    'manila-gallery-night-001.jpg',
    'manila-gallery-canal-001.jpg',
    'manila-gallery-ivy-001.jpg',
    'manila-gallery-graffiti-001.jpg',
    'manila-gallery-urban-001.jpg',
  ]

  const selection = {
    profilePic: photoFiles[0],         // garden for profile pic
    grid: photoFiles.slice(1, 7),      // 6 grid photos (no purple)
  }

  writeSources({
    createdAt: new Date().toISOString(),
    strategy: 'v57 rebuild — Instagram profile skeleton loading concept',
    safeBottomPixels: SAFE_BOTTOM,
    images: selection
  })

  const images = {
    profilePic: readImage(selection.profilePic),
    grid: selection.grid.map(f => readImage(f)),
  }

  const { execSync } = await import('child_process')
  const browser = await chromium.launch()

  console.log('Recording Instagram profile loading animation...')

  const videoCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: OUT_DIR,
      size: { width: WIDTH, height: HEIGHT }
    }
  })

  const videoPage = await videoCtx.newPage()

  // Set black background before content to prevent white flash
  await videoPage.evaluate(() => {
    document.documentElement.style.background = '#000'
    document.body.style.background = '#000'
  })

  await videoPage.setContent(buildAnimated(images), { waitUntil: 'load' })
  await videoPage.waitForTimeout(500)
  await videoPage.waitForTimeout(TOTAL_DURATION_MS)
  await videoPage.close()
  await videoCtx.close()
  await browser.close()

  // Convert webm → mp4
  const videoFiles2 = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.webm'))
  if (videoFiles2.length === 0) {
    console.error('No video file was generated!')
    return
  }

  const srcVideo = path.join(OUT_DIR, videoFiles2[0])
  const finalMp4 = path.join(OUT_DIR, '01_profile_build.mp4')

  try {
    execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${finalMp4}"`, { stdio: 'pipe' })
    fs.unlinkSync(srcVideo)
    console.log('Rendered 01_profile_build.mp4')
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
