import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v62')
const WIDTH = 1080, HEIGHT = 1920, SAFE_BOTTOM = 410

// Fonts
const BOLD = "'Avenir Next', 'Helvetica Neue', Arial, sans-serif"
const NARROW = "Futura, 'Arial Narrow', sans-serif"
const MONO = "'SF Mono', 'Fira Code', 'Courier New', monospace"

// Colors — v25 design language
const MANILA_COLOR = '#FF4D2A'
const ACCENT = '#FF6B3D'
const DARK_BG = '#0C0A0A'

// Animation total: ~17.3s recording + ~1s buffer = ~18.5s
const TOTAL_DURATION_MS = 19000

// Box fill photos (tiny thumbnails inside countdown boxes)
const BOX_PHOTOS = [
  { file: 'manila-gallery-dsc-0911.jpg', purple: false },
  { file: 'manila-gallery-garden-002.jpg', purple: false },
  { file: 'manila-gallery-rocks-001.jpg', purple: false },
]

// Photo strip thumbnails (more photos for wider strip)
const STRIP_PHOTOS = [
  { file: 'manila-gallery-urban-002.jpg', purple: false },
  { file: 'manila-gallery-park-001.jpg', purple: false },
  { file: 'manila-gallery-market-001.jpg', purple: false },
  { file: 'manila-gallery-shadow-001.jpg', purple: false },
  { file: 'manila-gallery-tropical-001.jpg', purple: false },
  { file: 'manila-gallery-night-002.jpg', purple: false },
]

// Center hero
const HERO_PHOTO = { file: 'manila-gallery-dsc-0075.jpg', purple: false }

function resetOutputDir() {
  fs.rmSync(OUT_DIR, { recursive: true, force: true })
  fs.mkdirSync(OUT_DIR, { recursive: true })
}

function readImage(name) {
  const buf = fs.readFileSync(path.join(IMAGE_DIR, name))
  const ext = path.extname(name).toLowerCase()
  const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg'
  return `data:${mime};base64,${buf.toString('base64')}`
}

function writeSources(payload) {
  fs.writeFileSync(path.join(OUT_DIR, 'sources.json'), JSON.stringify(payload, null, 2))
}

function imgStyle(purple, pos = 'center 20%') {
  return purple
    ? `width:130%;height:130%;object-fit:cover;object-position:center center;display:block;margin:-15% 0 0 -15%;`
    : `width:100%;height:100%;object-fit:cover;object-position:${pos};display:block;`
}

function buildAnimation(images) {
  return `<!DOCTYPE html>
<html>
<head>
<style>
  * { box-sizing:border-box; margin:0; padding:0; }
  html, body {
    margin:0; padding:0;
    background:${DARK_BG};
    -webkit-font-smoothing:antialiased;
    overflow:hidden;
  }

  /* ======== KEYFRAMES ======== */

  @keyframes fadeIn {
    0% { opacity:0; }
    100% { opacity:1; }
  }

  @keyframes fadeInUp {
    0% { opacity:0; transform:translateY(30px); }
    100% { opacity:1; transform:translateY(0); }
  }

  @keyframes glowPulse {
    0%, 100% { text-shadow:0 0 40px rgba(255,77,42,0.3); }
    50% { text-shadow:0 0 80px rgba(255,77,42,0.6), 0 0 120px rgba(255,77,42,0.2); }
  }

  @keyframes dotPulse {
    0%, 100% { opacity:1; transform:scale(1); }
    50% { opacity:0.4; transform:scale(0.7); }
  }

  @keyframes strikeThrough {
    0% { width:0; }
    100% { width:70%; }
  }

  @keyframes boxDim {
    0% { border-color:rgba(255,255,255,0.6); }
    100% { border-color:rgba(255,255,255,0.15); }
  }

  @keyframes numberDim {
    0% { color:rgba(255,255,255,0.9); }
    100% { color:rgba(255,255,255,0.15); }
  }

  @keyframes thumbFadeIn {
    0% { opacity:0; transform:scale(0.5); }
    100% { opacity:0.6; transform:scale(1); }
  }

  @keyframes toastSlide {
    0% { transform:translateY(-100px); opacity:0; }
    10% { transform:translateY(0); opacity:1; }
    80% { transform:translateY(0); opacity:1; }
    100% { transform:translateY(-100px); opacity:0; }
  }

  @keyframes pulseGlow {
    0%, 100% { box-shadow:0 0 0 0 rgba(255,77,42,0); }
    50% { box-shadow:0 0 20px 4px rgba(255,77,42,0.4); }
  }

  @keyframes kenBurns {
    0% { transform:scale(1); }
    100% { transform:scale(1.08); }
  }

  @keyframes heroFadeIn {
    0% { opacity:0; transform:scale(0.95); }
    100% { opacity:1; transform:scale(1); }
  }

  @keyframes bigTextIn {
    0% { opacity:0; transform:translateY(40px); }
    100% { opacity:1; transform:translateY(0); }
  }

  @keyframes fadeToBlack {
    0% { opacity:0; }
    100% { opacity:1; }
  }

  @keyframes stripScroll {
    0% { transform:translateX(0); }
    100% { transform:translateX(-100px); }
  }

  @keyframes countPulse {
    0% { transform:scale(1); }
    50% { transform:scale(1.08); }
    100% { transform:scale(1); }
  }

  /* ======== TOAST NOTIFICATIONS ======== */
  .toast {
    position:absolute;
    top:60px; left:50%; transform:translateX(-50%) translateY(-100px);
    width:auto; max-width:800px;
    padding:20px 36px;
    border-radius:16px;
    background:rgba(255,77,42,0.15);
    backdrop-filter:blur(16px);
    -webkit-backdrop-filter:blur(16px);
    border:1px solid rgba(255,77,42,0.35);
    font-family:${BOLD}; font-size:26px; font-weight:600;
    color:#fff; white-space:nowrap;
    z-index:30;
    opacity:0;
  }

  /* ======== COUNTDOWN BOXES ======== */
  .countdown-box {
    width:100px; height:100px;
    border-radius:16px;
    background:rgba(255,255,255,0.04);
    border:2px solid rgba(255,255,255,0.6);
    display:flex; align-items:center; justify-content:center;
    position:relative; overflow:hidden;
  }

  .countdown-box .number {
    font-family:${MONO}; font-size:36px; font-weight:700;
    color:rgba(255,255,255,0.9);
    z-index:2;
  }

  .countdown-box .strike {
    position:absolute;
    height:3px;
    background:rgba(255,255,255,0.5);
    transform:rotate(-45deg);
    width:0;
    z-index:3;
  }

  .countdown-box .thumb-overlay {
    position:absolute; inset:0;
    opacity:0; z-index:1;
  }

  .countdown-box .thumb-overlay img {
    width:100%; height:100%;
    object-fit:cover; display:block;
    filter:brightness(0.5);
  }

  /* ======== PHOTO STRIP ======== */
  .photo-strip {
    position:absolute;
    left:54px; right:54px;
    display:flex; gap:12px;
    opacity:0;
  }

  .photo-strip .strip-thumb {
    width:200px; height:260px;
    border-radius:12px; overflow:hidden;
    flex-shrink:0;
  }

  .photo-strip .strip-thumb img {
    width:100%; height:100%;
    object-fit:cover; display:block;
  }

  /* ======== COUNTER TEXT LAYERS ======== */
  .counter-layer {
    position:absolute;
    display:flex; align-items:center; gap:10px;
    opacity:0;
    transition:opacity 0.3s ease;
  }

  .counter-layer .dot {
    width:10px; height:10px; border-radius:50%;
    background:${MANILA_COLOR};
    animation:dotPulse 1.2s ease-in-out infinite;
  }

  .counter-layer .text {
    font-family:${MONO}; font-weight:600;
    letter-spacing:0.08em; text-transform:uppercase;
  }

</style>
</head>
<body>
<div id="root" style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${DARK_BG};">

  <!-- ======== PHASE 1: HOOK (0-3s) ======== -->

  <!-- MANILA title -->
  <div id="manilaTitle" style="
    position:absolute; left:54px; top:100px; right:54px;
    opacity:0;
  ">
    <p style="font-family:${NARROW};font-size:100px;font-weight:900;letter-spacing:0.22em;text-transform:uppercase;color:${MANILA_COLOR};margin:0;text-shadow:0 0 40px rgba(255,77,42,0.3);animation:glowPulse 2s ease-in-out infinite;">MANILA</p>
  </div>

  <!-- PHOTO SHOOT subtitle -->
  <div id="photoShootText" style="
    position:absolute; left:54px; top:240px; right:54px;
    opacity:0;
  ">
    <p style="font-family:${BOLD};font-size:60px;font-weight:800;color:#fff;margin:0;letter-spacing:-0.01em;">PHOTO SHOOT</p>
  </div>

  <!-- "5 spots left this month" counter layers -->
  <div id="counter5" class="counter-layer" style="left:54px;top:340px;">
    <div class="dot"></div>
    <span class="text" style="font-size:24px;color:${MANILA_COLOR};">5 spots left this month</span>
  </div>
  <div id="counter4" class="counter-layer" style="left:54px;top:340px;">
    <div class="dot"></div>
    <span class="text" style="font-size:24px;color:#FF5533;">4 spots left this month</span>
  </div>
  <div id="counter3" class="counter-layer" style="left:54px;top:340px;">
    <div class="dot"></div>
    <span class="text" style="font-size:24px;color:#FF4422;">3 spots left this month</span>
  </div>
  <div id="counter2" class="counter-layer" style="left:54px;top:340px;">
    <div class="dot"></div>
    <span class="text" style="font-size:26px;color:#FF3311;font-weight:700;">2 spots left this month</span>
  </div>

  <!-- 5 Countdown boxes -->
  <div id="boxRow" style="position:absolute;left:54px;top:410px;display:flex;gap:16px;opacity:0;">
    <!-- Box 01 -->
    <div class="countdown-box" id="box1">
      <span class="number" id="num1">01</span>
      <div class="strike" id="strike1"></div>
      <div class="thumb-overlay" id="thumb1">
        <img src="${images.box0}" style="${imgStyle(BOX_PHOTOS[0].purple, 'center')}"/>
      </div>
    </div>
    <!-- Box 02 -->
    <div class="countdown-box" id="box2">
      <span class="number" id="num2">02</span>
      <div class="strike" id="strike2"></div>
      <div class="thumb-overlay" id="thumb2">
        <img src="${images.box1}" style="${imgStyle(BOX_PHOTOS[1].purple, 'center')}"/>
      </div>
    </div>
    <!-- Box 03 -->
    <div class="countdown-box" id="box3">
      <span class="number" id="num3">03</span>
      <div class="strike" id="strike3"></div>
      <div class="thumb-overlay" id="thumb3">
        <img src="${images.box2}" style="${imgStyle(BOX_PHOTOS[2].purple, 'center')}"/>
      </div>
    </div>
    <!-- Box 04 -->
    <div class="countdown-box" id="box4">
      <span class="number" id="num4">04</span>
    </div>
    <!-- Box 05 -->
    <div class="countdown-box" id="box5">
      <span class="number" id="num5">05</span>
    </div>
  </div>

  <!-- ======== TOASTS ======== -->
  <div class="toast" id="toast1" style="animation:toastSlide 2s ease 3.5s forwards;">Sarah just messaged &#x1F525;</div>
  <div class="toast" id="toast2" style="animation:toastSlide 2s ease 6.0s forwards;">Michelle just messaged &#x2728;</div>
  <div class="toast" id="toast3" style="animation:toastSlide 2s ease 8.5s forwards;">Anna just messaged &#x1F4F8;</div>

  <!-- ======== PHOTO STRIP (appears Phase 2) ======== -->
  <div class="photo-strip" id="photoStrip" style="top:560px;">
    <div style="display:flex;gap:12px;animation:stripScroll 12s linear infinite;">
      ${STRIP_PHOTOS.map((sp, i) => `
      <div class="strip-thumb">
        <img src="${images['strip' + i]}" style="${imgStyle(sp.purple, 'center')}"/>
      </div>`).join('')}
      ${STRIP_PHOTOS.slice(0, 3).map((sp, i) => `
      <div class="strip-thumb">
        <img src="${images['strip' + i]}" style="${imgStyle(sp.purple, 'center')}"/>
      </div>`).join('')}
    </div>
  </div>

  <!-- ======== PHASE 3: Hero photo (10-14s) ======== -->
  <div id="heroSection" style="
    position:absolute;
    left:50%; top:50%; transform:translate(-50%,-50%);
    width:600px; height:800px;
    border-radius:16px; overflow:hidden;
    box-shadow:0 20px 80px rgba(0,0,0,0.6);
    opacity:0; z-index:10;
  ">
    <div style="width:100%;height:100%;overflow:hidden;animation:kenBurns 5s ease-out forwards;">
      <img src="${images.hero}" style="${imgStyle(HERO_PHOTO.purple)}"/>
    </div>
  </div>

  <!-- "Don't miss out." over hero -->
  <div id="dontMissText" style="
    position:absolute;
    left:0; right:0; top:180px;
    text-align:center; z-index:15;
    opacity:0;
  ">
    <p style="font-family:${BOLD};font-size:72px;font-weight:800;color:#fff;margin:0;text-shadow:0 4px 30px rgba(0,0,0,0.7);">Don't miss out.</p>
  </div>

  <!-- "No experience needed" under hero -->
  <div id="noExpText" style="
    position:absolute;
    left:0; right:0; bottom:${SAFE_BOTTOM + 140}px;
    text-align:center; z-index:15;
    opacity:0;
  ">
    <p style="font-family:${BOLD};font-size:28px;font-weight:500;color:rgba(255,255,255,0.6);margin:0;">No experience needed. I direct everything.</p>
  </div>

  <!-- Timer urgency element in phase 3 -->
  <div id="timerElement" style="
    position:absolute;
    left:50%; transform:translateX(-50%);
    bottom:${SAFE_BOTTOM + 60}px;
    display:inline-flex; align-items:center; gap:12px;
    padding:14px 28px;
    border-radius:16px;
    background:rgba(255,77,42,0.15);
    backdrop-filter:blur(16px);
    border:1px solid rgba(255,77,42,0.35);
    z-index:15;
    opacity:0;
  ">
    <div style="width:10px;height:10px;border-radius:50%;background:${MANILA_COLOR};animation:dotPulse 0.8s ease-in-out infinite;"></div>
    <span style="font-family:${MONO};font-size:22px;font-weight:600;color:${MANILA_COLOR};letter-spacing:0.06em;">2 SPOTS LEFT</span>
  </div>

  <!-- ======== PHASE 4: CTA integrated (14-17s) ======== -->
  <div id="ctaSection" style="
    position:absolute;
    left:0; right:0; top:0; height:${HEIGHT - SAFE_BOTTOM}px;
    display:flex; flex-direction:column;
    align-items:center; justify-content:center;
    gap:24px;
    z-index:20;
    opacity:0;
  ">
    <p style="font-family:${NARROW};font-size:80px;font-weight:900;letter-spacing:0.18em;color:${MANILA_COLOR};margin:0;text-shadow:0 0 40px rgba(255,77,42,0.3);">MANILA</p>
    <p style="font-family:${BOLD};font-size:42px;font-weight:300;color:rgba(255,255,255,0.9);margin:0;letter-spacing:0.25em;">PHOTO SHOOT</p>
    <div style="height:20px;"></div>
    <p style="font-family:${BOLD};font-size:52px;font-weight:800;color:#fff;margin:0;text-shadow:0 4px 30px rgba(0,0,0,0.5);">dm me if interested!!</p>
    <p style="font-family:${MONO};font-size:34px;font-weight:600;color:${MANILA_COLOR};margin:0;letter-spacing:0.1em;">@madebyaidan</p>
    <p style="font-family:${MONO};font-size:24px;font-weight:500;color:rgba(255,255,255,0.5);margin:0;letter-spacing:0.06em;">on Instagram</p>
    <div style="height:10px;"></div>
    <!-- 2 remaining boxes pulsing -->
    <div style="display:flex;gap:20px;">
      <div style="width:100px;height:100px;border-radius:16px;background:rgba(255,255,255,0.04);border:2px solid ${MANILA_COLOR};display:flex;align-items:center;justify-content:center;animation:pulseGlow 1.5s ease-in-out infinite;">
        <span style="font-family:${MONO};font-size:36px;font-weight:700;color:#fff;">04</span>
      </div>
      <div style="width:100px;height:100px;border-radius:16px;background:rgba(255,255,255,0.04);border:2px solid ${MANILA_COLOR};display:flex;align-items:center;justify-content:center;animation:pulseGlow 1.5s ease-in-out 0.75s infinite;">
        <span style="font-family:${MONO};font-size:36px;font-weight:700;color:#fff;">05</span>
      </div>
    </div>
    <div style="display:flex;align-items:center;gap:10px;">
      <div style="width:10px;height:10px;border-radius:50%;background:${MANILA_COLOR};animation:dotPulse 0.8s ease-in-out infinite;"></div>
      <span style="font-family:${MONO};font-size:24px;font-weight:700;color:${MANILA_COLOR};letter-spacing:0.08em;animation:countPulse 1.5s ease-in-out infinite;">2 SPOTS LEFT</span>
    </div>
  </div>

</div>

<script>
  // ======== TIMING ========
  const manilaTitle = document.getElementById('manilaTitle');
  const photoShootText = document.getElementById('photoShootText');
  const boxRow = document.getElementById('boxRow');
  const photoStrip = document.getElementById('photoStrip');
  const heroSection = document.getElementById('heroSection');
  const dontMissText = document.getElementById('dontMissText');
  const noExpText = document.getElementById('noExpText');
  const timerElement = document.getElementById('timerElement');
  const ctaSection = document.getElementById('ctaSection');

  const counter5 = document.getElementById('counter5');
  const counter4 = document.getElementById('counter4');
  const counter3 = document.getElementById('counter3');
  const counter2 = document.getElementById('counter2');

  // ======== PHASE 1: Hook (0-3s) ========

  // 0.3s — MANILA fades in
  setTimeout(() => {
    manilaTitle.style.transition = 'opacity 0.6s ease';
    manilaTitle.style.opacity = '1';
  }, 300);

  // 0.8s — PHOTO SHOOT fades in
  setTimeout(() => {
    photoShootText.style.transition = 'opacity 0.5s ease';
    photoShootText.style.opacity = '1';
  }, 800);

  // 1.3s — "5 spots left" counter
  setTimeout(() => {
    counter5.style.opacity = '1';
  }, 1300);

  // 2.0s — Countdown boxes appear
  setTimeout(() => {
    boxRow.style.transition = 'opacity 0.5s ease';
    boxRow.style.opacity = '1';
  }, 2000);

  // ======== PHASE 2: Spots filling up (3-10s) ========

  function claimBox(boxId, numId, strikeId, thumbId, delay) {
    setTimeout(() => {
      // Strike through
      const strike = document.getElementById(strikeId);
      if (strike) {
        strike.style.animation = 'strikeThrough 0.4s ease-out forwards';
      }
      // Dim number
      const num = document.getElementById(numId);
      if (num) {
        num.style.transition = 'color 0.4s ease';
        num.style.color = 'rgba(255,255,255,0.15)';
      }
      // Dim box border
      const box = document.getElementById(boxId);
      if (box) {
        box.style.transition = 'border-color 0.4s ease';
        box.style.borderColor = 'rgba(255,255,255,0.15)';
      }
      // Show thumbnail
      const thumb = document.getElementById(thumbId);
      if (thumb) {
        thumb.style.animation = 'thumbFadeIn 0.5s ease 0.2s forwards';
      }
    }, delay);
  }

  // Box 01 claimed at 3s
  claimBox('box1', 'num1', 'strike1', 'thumb1', 3000);

  // Update counter 5 → 4 at 3.5s
  setTimeout(() => {
    counter5.style.opacity = '0';
    counter4.style.opacity = '1';
  }, 3500);

  // Show photo strip at 4s
  setTimeout(() => {
    photoStrip.style.transition = 'opacity 0.6s ease';
    photoStrip.style.opacity = '1';
  }, 4000);

  // Box 02 claimed at 5.5s
  claimBox('box2', 'num2', 'strike2', 'thumb2', 5500);

  // Update counter 4 → 3 at 6s
  setTimeout(() => {
    counter4.style.opacity = '0';
    counter3.style.opacity = '1';
  }, 6000);

  // Box 03 claimed at 8s
  claimBox('box3', 'num3', 'strike3', 'thumb3', 8000);

  // Update counter 3 → 2 at 8.5s
  setTimeout(() => {
    counter3.style.opacity = '0';
    counter2.style.opacity = '1';
  }, 8500);

  // ======== PHASE 3: Urgency Peak (10-14s) ========

  // Hide phase 1/2 elements, show hero
  setTimeout(() => {
    // Fade out hook elements
    manilaTitle.style.transition = 'opacity 0.5s ease';
    manilaTitle.style.opacity = '0';
    photoShootText.style.transition = 'opacity 0.5s ease';
    photoShootText.style.opacity = '0';
    counter2.style.opacity = '0';
    boxRow.style.transition = 'opacity 0.5s ease';
    boxRow.style.opacity = '0';
    photoStrip.style.transition = 'opacity 0.5s ease';
    photoStrip.style.opacity = '0';
  }, 9800);

  // Show hero photo
  setTimeout(() => {
    heroSection.style.transition = 'opacity 0.8s ease';
    heroSection.style.opacity = '1';
  }, 10300);

  // "Don't miss out."
  setTimeout(() => {
    dontMissText.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    dontMissText.style.opacity = '1';
  }, 10800);

  // "No experience needed"
  setTimeout(() => {
    noExpText.style.transition = 'opacity 0.5s ease';
    noExpText.style.opacity = '1';
  }, 11300);

  // Timer urgency element
  setTimeout(() => {
    timerElement.style.transition = 'opacity 0.4s ease';
    timerElement.style.opacity = '1';
  }, 11500);

  // ======== PHASE 4: Final push (14-17s) ========

  // Fade out hero elements
  setTimeout(() => {
    heroSection.style.transition = 'opacity 0.5s ease';
    heroSection.style.opacity = '0';
    dontMissText.style.transition = 'opacity 0.5s ease';
    dontMissText.style.opacity = '0';
    noExpText.style.transition = 'opacity 0.5s ease';
    noExpText.style.opacity = '0';
    timerElement.style.transition = 'opacity 0.5s ease';
    timerElement.style.opacity = '0';
  }, 13800);

  // Show CTA section
  setTimeout(() => {
    ctaSection.style.transition = 'opacity 0.6s ease';
    ctaSection.style.opacity = '1';
  }, 14300);

</script>
</body>
</html>`;
}

async function render() {
  resetOutputDir()

  const selection = {
    boxPhotos: BOX_PHOTOS.map(p => p.file),
    stripPhotos: STRIP_PHOTOS.map(p => p.file),
    heroPhoto: HERO_PHOTO.file,
  }

  writeSources({
    createdAt: new Date().toISOString(),
    strategy: 'v62 — animated FOMO countdown with spots filling up, integrated CTA',
    safeBottomPixels: SAFE_BOTTOM,
    images: selection,
  })

  // Load images
  const images = {
    box0: readImage(BOX_PHOTOS[0].file),
    box1: readImage(BOX_PHOTOS[1].file),
    box2: readImage(BOX_PHOTOS[2].file),
    hero: readImage(HERO_PHOTO.file),
  }
  STRIP_PHOTOS.forEach((sp, i) => {
    images['strip' + i] = readImage(sp.file)
  })

  const { execSync } = await import('child_process')
  const browser = await chromium.launch()

  console.log('Recording FOMO countdown animation...')

  const videoCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: OUT_DIR,
      size: { width: WIDTH, height: HEIGHT },
    },
  })

  const videoPage = await videoCtx.newPage()
  const animationHTML = buildAnimation(images)
  await videoPage.setContent(animationHTML, { waitUntil: 'load' })
  await videoPage.waitForTimeout(500)
  await videoPage.waitForTimeout(TOTAL_DURATION_MS)
  await videoPage.close()
  await videoCtx.close()

  await browser.close()

  // --- Step 2: Convert webm to mp4 ---
  const videoFiles = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.webm'))
  if (videoFiles.length === 0) {
    console.error('No video file was generated!')
    return
  }

  const srcVideo = path.join(OUT_DIR, videoFiles[0])
  const finalMp4 = path.join(OUT_DIR, '01_fomo_countdown.mp4')

  try {
    execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${finalMp4}"`, { stdio: 'pipe' })
    fs.unlinkSync(srcVideo)
    console.log('Rendered 01_fomo_countdown.mp4')
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
