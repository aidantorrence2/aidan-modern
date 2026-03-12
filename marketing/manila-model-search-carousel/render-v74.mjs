import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v74')

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 410

const SF = "-apple-system, 'Helvetica Neue', Arial, sans-serif"
const MANILA_COLOR = '#E8443A'
const IG_BG = '#000'

const TOTAL_DURATION_MS = 24000

const PHOTOS = [
  'manila-gallery-purple-001-cropped.jpg',
  'manila-gallery-purple-002-cropped.jpg',
  'manila-gallery-purple-003-cropped.jpg',
  'manila-gallery-purple-004-cropped.jpg',
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
  // Timeline (seconds)
  const T = {
    // Phase 1: Single IG post card (0–6s)
    postAppear: 0.3,
    heartAnim: 1.8,
    likeCount: 2.2,

    // Phase 2: Swipe to 2x2 grid (6–12s)
    swipeStart: 6.0,
    swipeDuration: 0.8,
    gridSettle: 7.0,
    gridLabelAppear: 7.6,

    // Phase 3: Engagement (12–17s)
    comment1: 8.5,
    comment2: 10.0,
    comment3: 11.5,
    likeCountUp: 8.0,

    // Phase 4: CTA (17–24s)
    ctaStart: 17.0,
    ctaHandle: 17.5,
    ctaSub: 18.5,
    ctaPulse: 19.5,
    // Hold to 24s
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

  @keyframes fadeOut {
    0% { opacity: 1; }
    100% { opacity: 0; }
  }

  @keyframes scaleIn {
    0% { opacity: 0; transform: scale(0.9); }
    100% { opacity: 1; transform: scale(1); }
  }

  @keyframes slideUp {
    0% { transform: translateY(40px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }

  @keyframes slideInRight {
    0% { transform: translateX(60px); opacity: 0; }
    100% { transform: translateX(0); opacity: 1; }
  }

  @keyframes heartPop {
    0% { transform: scale(0); opacity: 0; }
    30% { transform: scale(1.4); opacity: 1; }
    50% { transform: scale(0.9); }
    70% { transform: scale(1.15); }
    100% { transform: scale(1); opacity: 1; }
  }

  @keyframes doubleTapHeart {
    0% { transform: scale(0) rotate(-15deg); opacity: 0; }
    25% { transform: scale(1.3) rotate(5deg); opacity: 1; }
    50% { transform: scale(1) rotate(0deg); opacity: 1; }
    75% { opacity: 1; }
    100% { transform: scale(1.2) rotate(0deg); opacity: 0; }
  }

  @keyframes commentSlide {
    0% { transform: translateY(20px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }

  @keyframes pulseGlow {
    0%, 100% { box-shadow: 0 0 0 0 rgba(232, 68, 58, 0.5); }
    50% { box-shadow: 0 0 0 18px rgba(232, 68, 58, 0); }
  }

  @keyframes countBump {
    0% { transform: scale(1); }
    50% { transform: scale(1.15); }
    100% { transform: scale(1); }
  }

  @keyframes gridItemReveal {
    0% { opacity: 0; transform: scale(0.85); }
    100% { opacity: 1; transform: scale(1); }
  }

  @keyframes swipeLeft {
    0% { transform: translateX(0); opacity: 1; }
    100% { transform: translateX(-110%); opacity: 0; }
  }

  @keyframes dotSlide {
    0% { background: #fff; }
    100% { background: rgba(255,255,255,0.4); }
  }

  .page {
    width: ${WIDTH}px;
    height: ${HEIGHT}px;
    position: relative;
    overflow: hidden;
    background: ${IG_BG};
    font-family: ${SF};
  }

  /* ===== PHASE 1: SINGLE IG POST ===== */
  .post-view {
    position: absolute;
    inset: 0;
    z-index: 20;
    background: ${IG_BG};
    opacity: 0;
  }

  .post-header {
    position: absolute;
    top: 60px;
    left: 0; right: 0;
    height: 90px;
    display: flex;
    align-items: center;
    padding: 0 20px;
    z-index: 5;
  }

  .post-avatar {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    overflow: hidden;
    margin-right: 14px;
    border: 3px solid ${MANILA_COLOR};
    flex-shrink: 0;
  }

  .post-avatar img {
    width: 100%; height: 100%;
    object-fit: cover;
  }

  .post-username {
    font-size: 30px;
    font-weight: 700;
    color: #fff;
    flex: 1;
  }

  .post-location {
    font-size: 22px;
    color: #aaa;
    margin-top: 2px;
  }

  .post-dots {
    font-size: 32px;
    color: #fff;
    letter-spacing: 2px;
  }

  .post-image-container {
    position: absolute;
    top: 160px;
    left: 0; right: 0;
    height: 860px;
    overflow: hidden;
    background: #111;
  }

  .post-image-slider {
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    transition: none;
  }

  .post-image-slider img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .post-double-tap-heart {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0);
    z-index: 10;
    opacity: 0;
    filter: drop-shadow(0 4px 20px rgba(0,0,0,0.5));
  }

  /* Carousel dots */
  .post-carousel-dots {
    position: absolute;
    top: 1035px;
    left: 0; right: 0;
    display: flex;
    justify-content: center;
    gap: 6px;
    z-index: 5;
  }

  .carousel-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: rgba(255,255,255,0.4);
    transition: background 0.3s;
  }

  .carousel-dot.active {
    background: #fff;
  }

  .post-actions {
    position: absolute;
    top: 1060px;
    left: 0; right: 0;
    display: flex;
    align-items: center;
    padding: 16px 20px;
    gap: 20px;
  }

  .action-icon {
    opacity: 0.9;
  }

  .action-icon.heart-filled {
    opacity: 0;
  }

  .post-spacer {
    flex: 1;
  }

  .post-likes {
    position: absolute;
    top: 1130px;
    left: 20px;
    font-size: 28px;
    font-weight: 700;
    color: #fff;
    opacity: 0;
  }

  .post-caption {
    position: absolute;
    top: 1170px;
    left: 20px;
    right: 20px;
    opacity: 0;
  }

  .post-caption .cap-user {
    font-size: 28px;
    font-weight: 700;
    color: #fff;
    margin-right: 8px;
  }

  .post-caption .cap-text {
    font-size: 28px;
    color: #ddd;
    line-height: 1.5;
  }

  /* ===== PHASE 2: 2x2 GRID VIEW ===== */
  .grid-view {
    position: absolute;
    inset: 0;
    z-index: 15;
    background: ${IG_BG};
    opacity: 0;
  }

  .grid-header {
    position: absolute;
    top: 60px;
    left: 0; right: 0;
    text-align: center;
    z-index: 5;
    padding: 0 20px;
  }

  .grid-handle {
    font-size: 34px;
    font-weight: 700;
    color: #fff;
    margin-bottom: 4px;
  }

  .grid-label {
    font-size: 24px;
    color: #aaa;
    opacity: 0;
  }

  .grid-container {
    position: absolute;
    top: 170px;
    left: 30px;
    right: 30px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 12px;
    height: 880px;
  }

  .grid-item {
    border-radius: 16px;
    overflow: hidden;
    opacity: 0;
    position: relative;
  }

  .grid-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .grid-item-number {
    position: absolute;
    top: 12px;
    right: 12px;
    background: rgba(0,0,0,0.6);
    color: #fff;
    font-size: 22px;
    font-weight: 700;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* ===== COMMENTS OVERLAY ===== */
  .comments-section {
    position: absolute;
    top: 1090px;
    left: 0; right: 0;
    bottom: ${SAFE_BOTTOM}px;
    padding: 16px 24px;
    z-index: 25;
    overflow: hidden;
  }

  .comment-row {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    margin-bottom: 18px;
    opacity: 0;
  }

  .comment-avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .comment-avatar-letter {
    font-size: 20px;
    font-weight: 700;
    color: #fff;
  }

  .comment-body {
    flex: 1;
  }

  .comment-name {
    font-size: 26px;
    font-weight: 700;
    color: #fff;
    margin-bottom: 2px;
  }

  .comment-text {
    font-size: 26px;
    color: #ddd;
    line-height: 1.4;
  }

  .comment-meta {
    font-size: 20px;
    color: #888;
    margin-top: 4px;
  }

  /* ===== PHASE 4: CTA ===== */
  .cta-overlay {
    position: absolute;
    inset: 0;
    z-index: 40;
    background: rgba(0,0,0,0.88);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    opacity: 0;
    padding-bottom: ${SAFE_BOTTOM}px;
  }

  .cta-handle {
    font-size: 56px;
    font-weight: 800;
    color: #fff;
    text-align: center;
    opacity: 0;
    margin-bottom: 24px;
  }

  .cta-subtext {
    font-size: 38px;
    font-weight: 600;
    color: ${MANILA_COLOR};
    text-align: center;
    opacity: 0;
    margin-bottom: 40px;
  }

  .cta-button {
    background: ${MANILA_COLOR};
    color: #fff;
    font-size: 36px;
    font-weight: 700;
    padding: 22px 56px;
    border-radius: 50px;
    opacity: 0;
    letter-spacing: 0.5px;
  }

  .cta-mini-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    width: 320px;
    height: 320px;
    margin-bottom: 50px;
    border-radius: 20px;
    overflow: hidden;
    opacity: 0;
  }

  .cta-mini-grid img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
</style>
</head>
<body>
  <div class="page">

    <!-- ===== PHASE 1: SINGLE IG POST ===== -->
    <div class="post-view" id="postView">
      <div class="post-header">
        <div class="post-avatar">
          <img src="${imageDataMap[PHOTOS[0]]}" alt="avatar" />
        </div>
        <div>
          <div class="post-username">your_username</div>
          <div class="post-location">Manila, Philippines</div>
        </div>
        <div class="post-dots">···</div>
      </div>

      <div class="post-image-container">
        <div class="post-image-slider" id="postSlider">
          <img src="${imageDataMap[PHOTOS[0]]}" alt="photo" />
        </div>
        <div class="post-double-tap-heart" id="doubleTapHeart">
          <svg width="140" height="140" viewBox="0 0 24 24" fill="${MANILA_COLOR}" stroke="none">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </div>
      </div>

      <!-- Carousel dots -->
      <div class="post-carousel-dots" id="carouselDots">
        <div class="carousel-dot active" id="dot0"></div>
        <div class="carousel-dot" id="dot1"></div>
        <div class="carousel-dot" id="dot2"></div>
        <div class="carousel-dot" id="dot3"></div>
      </div>

      <div class="post-actions">
        <!-- Heart outline -->
        <svg class="action-icon" id="heartOutline" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
        <!-- Heart filled (hidden initially) -->
        <svg class="action-icon heart-filled" id="heartFilled" width="44" height="44" viewBox="0 0 24 24" fill="${MANILA_COLOR}" stroke="none" style="position:absolute;left:20px;">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
        <!-- Comment -->
        <svg class="action-icon" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <!-- Share -->
        <svg class="action-icon" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
        <div class="post-spacer"></div>
        <!-- Bookmark -->
        <svg class="action-icon" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
        </svg>
      </div>

      <div class="post-likes" id="postLikes">0 likes</div>

      <div class="post-caption" id="postCaption">
        <span class="cap-user">your_username</span>
        <span class="cap-text">manila photo shoot results are in 📸✨ @madebyaidan</span>
      </div>
    </div>

    <!-- ===== PHASE 2: 2x2 GRID ===== -->
    <div class="grid-view" id="gridView">
      <div class="grid-header">
        <div class="grid-handle">your_username</div>
        <div class="grid-label" id="gridLabel">4 photos from this shoot</div>
      </div>

      <div class="grid-container" id="gridContainer">
        <div class="grid-item" id="gridItem0">
          <img src="${imageDataMap[PHOTOS[0]]}" />
          <div class="grid-item-number">1</div>
        </div>
        <div class="grid-item" id="gridItem1">
          <img src="${imageDataMap[PHOTOS[1]]}" />
          <div class="grid-item-number">2</div>
        </div>
        <div class="grid-item" id="gridItem2">
          <img src="${imageDataMap[PHOTOS[2]]}" />
          <div class="grid-item-number">3</div>
        </div>
        <div class="grid-item" id="gridItem3">
          <img src="${imageDataMap[PHOTOS[3]]}" />
          <div class="grid-item-number">4</div>
        </div>
      </div>

      <!-- Comments that appear over the grid -->
      <div class="comments-section" id="commentsSection">
        <div class="comment-row" id="comment1">
          <div class="comment-avatar" style="background:#E056A0;">
            <span class="comment-avatar-letter">S</span>
          </div>
          <div class="comment-body">
            <span class="comment-name">sarah_m</span>
            <span class="comment-text">obsessed 🔥🔥🔥</span>
            <div class="comment-meta">2m · 14 likes · Reply</div>
          </div>
        </div>
        <div class="comment-row" id="comment2">
          <div class="comment-avatar" style="background:#56B4E0;">
            <span class="comment-avatar-letter">J</span>
          </div>
          <div class="comment-body">
            <span class="comment-name">j.reyes</span>
            <span class="comment-text">photographer?? 😍</span>
            <div class="comment-meta">1m · 8 likes · Reply</div>
          </div>
        </div>
        <div class="comment-row" id="comment3">
          <div class="comment-avatar" style="background:#56E098;">
            <span class="comment-avatar-letter">K</span>
          </div>
          <div class="comment-body">
            <span class="comment-name">kath.mnl</span>
            <span class="comment-text">wait these are free?! 🤯</span>
            <div class="comment-meta">just now · Reply</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== PHASE 4: CTA OVERLAY ===== -->
    <div class="cta-overlay" id="ctaOverlay">
      <div class="cta-mini-grid" id="ctaMiniGrid">
        <img src="${imageDataMap[PHOTOS[0]]}" />
        <img src="${imageDataMap[PHOTOS[1]]}" />
        <img src="${imageDataMap[PHOTOS[2]]}" />
        <img src="${imageDataMap[PHOTOS[3]]}" />
      </div>
      <div class="cta-handle" id="ctaHandle">@madebyaidan<br>on Instagram</div>
      <div class="cta-subtext" id="ctaSub">DM for your free shoot</div>
      <div class="cta-button" id="ctaButton">Send a DM →</div>
    </div>

  </div>

  <script>
    const postView = document.getElementById('postView')
    const gridView = document.getElementById('gridView')
    const ctaOverlay = document.getElementById('ctaOverlay')

    // ======= Phase 1: Post appears =======
    setTimeout(() => {
      postView.style.animation = 'scaleIn 0.6s ease-out forwards'
    }, ${T.postAppear * 1000})

    // Like count and caption fade in
    setTimeout(() => {
      document.getElementById('postLikes').style.animation = 'fadeIn 0.4s ease-out forwards'
      document.getElementById('postCaption').style.animation = 'fadeIn 0.4s ease-out forwards'
    }, ${(T.postAppear + 0.8) * 1000})

    // Double-tap heart animation
    setTimeout(() => {
      const heart = document.getElementById('doubleTapHeart')
      heart.style.animation = 'doubleTapHeart 1.2s ease-out forwards'

      // Fill the heart icon
      setTimeout(() => {
        document.getElementById('heartOutline').style.opacity = '0'
        const filled = document.getElementById('heartFilled')
        filled.style.opacity = '1'
        filled.style.animation = 'heartPop 0.5s ease-out forwards'
      }, 300)
    }, ${T.heartAnim * 1000})

    // Like count animates up
    let likeCount = 0
    const likeTarget = 847
    const likeEl = document.getElementById('postLikes')
    setTimeout(() => {
      const steps = 30
      const interval = 80
      let step = 0
      const tick = setInterval(() => {
        step++
        likeCount = Math.round((step / steps) * likeTarget)
        if (step >= steps) {
          likeCount = likeTarget
          clearInterval(tick)
        }
        likeEl.textContent = likeCount.toLocaleString() + ' likes'
        likeEl.style.animation = 'none'
        void likeEl.offsetWidth
        likeEl.style.animation = 'countBump 0.15s ease-out'
      }, interval)
    }, ${T.likeCount * 1000})

    // ======= Phase 2: Swipe to grid =======
    setTimeout(() => {
      // Slide the post view out to the left
      postView.style.transition = 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.7s ease-out'
      postView.style.transform = 'translateX(-100%) scale(0.92)'
      postView.style.opacity = '0'

      // Bring in the grid view
      gridView.style.opacity = '1'
      gridView.style.animation = 'fadeIn 0.5s ease-out forwards'

      // Stagger the grid items
      const delays = [0, 150, 300, 450]
      delays.forEach((d, i) => {
        setTimeout(() => {
          const item = document.getElementById('gridItem' + i)
          item.style.animation = 'gridItemReveal 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
        }, d + 200)
      })
    }, ${T.swipeStart * 1000})

    // Grid label
    setTimeout(() => {
      document.getElementById('gridLabel').style.animation = 'fadeIn 0.5s ease-out forwards'
    }, ${T.gridLabelAppear * 1000})

    // ======= Phase 3: Comments pop in =======
    const comments = [
      { id: 'comment1', t: ${T.comment1 * 1000} },
      { id: 'comment2', t: ${T.comment2 * 1000} },
      { id: 'comment3', t: ${T.comment3 * 1000} },
    ]

    comments.forEach(({ id, t }) => {
      setTimeout(() => {
        const el = document.getElementById(id)
        if (el) {
          el.style.animation = 'commentSlide 0.4s ease-out forwards'
        }
      }, t)
    })

    // ======= Phase 4: CTA overlay =======
    setTimeout(() => {
      ctaOverlay.style.transition = 'opacity 0.6s ease-out'
      ctaOverlay.style.opacity = '1'
    }, ${T.ctaStart * 1000})

    setTimeout(() => {
      document.getElementById('ctaMiniGrid').style.animation = 'scaleIn 0.6s ease-out forwards'
    }, ${T.ctaStart * 1000 + 200})

    setTimeout(() => {
      document.getElementById('ctaHandle').style.animation = 'slideUp 0.6s ease-out forwards'
    }, ${T.ctaHandle * 1000})

    setTimeout(() => {
      document.getElementById('ctaSub').style.animation = 'slideUp 0.5s ease-out forwards'
    }, ${T.ctaSub * 1000})

    setTimeout(() => {
      const btn = document.getElementById('ctaButton')
      btn.style.animation = 'scaleIn 0.5s ease-out forwards'
      // Start pulsing after it appears
      setTimeout(() => {
        btn.style.animation = 'pulseGlow 1.5s ease-in-out infinite'
        btn.style.opacity = '1'
      }, 600)
    }, ${T.ctaPulse * 1000})

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
    strategy: 'v74 — 4-image spread IG carousel post animation',
    safeBottomPixels: SAFE_BOTTOM,
    photos: PHOTOS,
  })

  const { execSync } = await import('child_process')
  const browser = await chromium.launch()

  console.log('Recording 4-image spread carousel animation...')

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
  const finalMp4 = path.join(OUT_DIR, '01_photo_spread_carousel.mp4')

  try {
    execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${finalMp4}"`, { stdio: 'pipe' })
    fs.unlinkSync(srcVideo)
    console.log('Rendered 01_photo_spread_carousel.mp4')
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
