import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v76')

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 410
const USABLE_H = HEIGHT - SAFE_BOTTOM

const SF = "-apple-system, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif"
const MANILA_COLOR = '#E8443A'
const IG_BG = '#0a0a0a'

const TOTAL_DURATION_MS = 24000

const PHOTOS = [
  'manila-gallery-dsc-0190.jpg',
  'manila-gallery-dsc-0075.jpg',
  'manila-gallery-canal-001.jpg',
  'manila-gallery-urban-001.jpg',
  'manila-gallery-garden-001.jpg',
  'manila-gallery-night-001.jpg',
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
  /*
   * SKELETON LOADING CONCEPT:
   *
   * Phase 1 (0-3s):   Full skeleton UI — shimmer placeholders for header, hero image,
   *                    text lines, card row, and button
   * Phase 2 (3-7s):   Header + hero resolve — title and photo fade in over skeletons
   * Phase 3 (7-13s):  Step cards resolve one by one — DM, show up, get photos
   * Phase 4 (13-20s): CTA resolves — @madebyaidan button loads in
   *
   * Dark background (#0a0a0a) with premium shimmer animation on skeleton blocks.
   */

  return `<!DOCTYPE html>
<html>
<head>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { margin: 0; padding: 0; background: ${IG_BG}; -webkit-font-smoothing: antialiased; }

  @keyframes shimmer {
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
  }

  @keyframes fadeIn {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }

  @keyframes fadeOut {
    0% { opacity: 1; }
    100% { opacity: 0; }
  }

  .page {
    width: ${WIDTH}px;
    height: ${HEIGHT}px;
    position: relative;
    overflow: hidden;
    background: ${IG_BG};
    font-family: ${SF};
  }

  .content-area {
    position: absolute;
    left: 0; right: 0; top: 0;
    height: ${USABLE_H}px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 60px 48px 40px;
  }

  .skeleton {
    background: linear-gradient(90deg, #1a1a1a 0%, #2a2a2a 50%, #1a1a1a 100%);
    background-size: 1000px 100%;
    animation: shimmer 2s infinite linear;
    border-radius: 12px;
  }

  .skeleton-pill {
    background: linear-gradient(90deg, #1a1a1a 0%, #2a2a2a 50%, #1a1a1a 100%);
    background-size: 1000px 100%;
    animation: shimmer 2s infinite linear;
    border-radius: 60px;
  }

  /* Skeleton elements */
  .skel-header {
    width: 700px;
    height: 56px;
    margin-bottom: 40px;
  }

  .skel-hero {
    width: 900px;
    height: 520px;
    border-radius: 20px;
    margin-bottom: 36px;
  }

  .skel-text-1 {
    width: 800px;
    height: 28px;
    margin-bottom: 16px;
  }

  .skel-text-2 {
    width: 650px;
    height: 28px;
    margin-bottom: 16px;
  }

  .skel-text-3 {
    width: 500px;
    height: 28px;
    margin-bottom: 44px;
  }

  .skel-cards-row {
    display: flex;
    gap: 24px;
    margin-bottom: 44px;
  }

  .skel-card {
    width: 280px;
    height: 300px;
    border-radius: 16px;
  }

  .skel-button {
    width: 680px;
    height: 72px;
  }

  /* Real content layers — positioned on top of skeletons */
  .real-content {
    position: absolute;
    opacity: 0;
    transition: opacity 0.5s ease-out;
  }

  .real-content.visible {
    opacity: 1;
  }

  /* Header real */
  .real-header {
    top: 60px;
    left: 48px; right: 48px;
    display: flex;
    justify-content: center;
  }

  .real-header h1 {
    font-size: 40px;
    font-weight: 800;
    color: #fff;
    letter-spacing: 6px;
    text-transform: uppercase;
    text-align: center;
  }

  .real-header h1 span {
    color: ${MANILA_COLOR};
  }

  /* Hero real */
  .real-hero {
    top: 156px;
    left: calc(50% - 450px);
    width: 900px;
    height: 520px;
    border-radius: 20px;
    overflow: hidden;
  }

  .real-hero img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  /* Text real */
  .real-text {
    top: 712px;
    left: 48px; right: 48px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }

  .real-text p {
    font-size: 30px;
    font-weight: 500;
    color: rgba(255,255,255,0.9);
    text-align: center;
    line-height: 1.4;
  }

  .real-text p.highlight {
    color: ${MANILA_COLOR};
    font-weight: 700;
  }

  /* Step cards real */
  .real-cards {
    top: 832px;
    left: 48px; right: 48px;
    display: flex;
    justify-content: center;
    gap: 24px;
  }

  .step-card {
    width: 280px;
    height: 300px;
    border-radius: 16px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 24px;
    opacity: 0;
    transition: opacity 0.5s ease-out, transform 0.5s ease-out;
    transform: translateY(20px);
  }

  .step-card.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .step-card .icon {
    font-size: 56px;
    line-height: 1;
  }

  .step-card .step-num {
    font-size: 16px;
    font-weight: 700;
    color: ${MANILA_COLOR};
    letter-spacing: 3px;
    text-transform: uppercase;
  }

  .step-card .step-text {
    font-size: 24px;
    font-weight: 600;
    color: #fff;
    text-align: center;
    line-height: 1.3;
  }

  /* CTA real */
  .real-cta {
    top: 1176px;
    left: 48px; right: 48px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  .cta-button {
    width: 680px;
    height: 72px;
    border-radius: 60px;
    background: ${MANILA_COLOR};
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 24px rgba(232,68,58,0.4);
    opacity: 0;
    transition: opacity 0.5s ease-out, transform 0.5s ease-out;
    transform: scale(0.95);
  }

  .cta-button.visible {
    opacity: 1;
    transform: scale(1);
  }

  .cta-button span {
    font-size: 32px;
    font-weight: 800;
    color: #fff;
    letter-spacing: 1px;
  }

  .cta-sub {
    font-size: 26px;
    font-weight: 500;
    color: rgba(255,255,255,0.7);
    text-align: center;
    opacity: 0;
    transition: opacity 0.5s ease-out;
  }

  .cta-sub.visible {
    opacity: 1;
  }

  @keyframes pulseGlow {
    0%, 100% { box-shadow: 0 0 0 0 rgba(232,68,58,0.6), 0 4px 24px rgba(232,68,58,0.4); }
    50% { box-shadow: 0 0 0 14px rgba(232,68,58,0), 0 4px 24px rgba(232,68,58,0.4); }
  }
</style>
</head>
<body>
  <div class="page">
    <div class="content-area">

      <!-- Skeleton: Header -->
      <div class="skeleton skeleton-pill skel-header" id="skel-header"></div>

      <!-- Skeleton: Hero image -->
      <div class="skeleton skel-hero" id="skel-hero"></div>

      <!-- Skeleton: Text lines -->
      <div class="skeleton skel-text-1" id="skel-text-1"></div>
      <div class="skeleton skel-text-2" id="skel-text-2"></div>
      <div class="skeleton skel-text-3" id="skel-text-3"></div>

      <!-- Skeleton: 3 cards -->
      <div class="skel-cards-row">
        <div class="skeleton skel-card" id="skel-card-1"></div>
        <div class="skeleton skel-card" id="skel-card-2"></div>
        <div class="skeleton skel-card" id="skel-card-3"></div>
      </div>

      <!-- Skeleton: Button -->
      <div class="skeleton skeleton-pill skel-button" id="skel-button"></div>

    </div>

    <!-- Real content: Header -->
    <div class="real-content real-header" id="real-header">
      <h1><span>MANILA</span> FREE PHOTO SHOOT</h1>
    </div>

    <!-- Real content: Hero image -->
    <div class="real-content real-hero" id="real-hero">
      <img src="${imageDataMap[PHOTOS[0]]}" />
    </div>

    <!-- Real content: Text lines -->
    <div class="real-content real-text" id="real-text">
      <p>Professional photos.</p>
      <p class="highlight">No cost. No experience needed.</p>
    </div>

    <!-- Real content: Step cards -->
    <div class="real-content real-cards" id="real-cards">
      <div class="step-card" id="card-1">
        <div class="icon">\u{1F4AC}</div>
        <div class="step-num">STEP 1</div>
        <div class="step-text">DM me on Instagram</div>
      </div>
      <div class="step-card" id="card-2">
        <div class="icon">\u{1F4F7}</div>
        <div class="step-num">STEP 2</div>
        <div class="step-text">Show up to the shoot</div>
      </div>
      <div class="step-card" id="card-3">
        <div class="icon">\u{2728}</div>
        <div class="step-num">STEP 3</div>
        <div class="step-text">Get your photos</div>
      </div>
    </div>

    <!-- Real content: CTA -->
    <div class="real-content real-cta" id="real-cta">
      <div class="cta-button" id="cta-btn">
        <span>@madebyaidan</span>
      </div>
      <div class="cta-sub" id="cta-sub">DM me to book your free shoot</div>
    </div>

  </div>

  <script>
    // ======= Helper: fade out a skeleton element =======
    function fadeSkeleton(id, delay) {
      setTimeout(() => {
        const el = document.getElementById(id)
        if (!el) return
        el.style.transition = 'opacity 0.5s ease-out'
        el.style.opacity = '0'
      }, delay)
    }

    // ======= Helper: show real content =======
    function showReal(id, delay) {
      setTimeout(() => {
        const el = document.getElementById(id)
        if (!el) return
        el.classList.add('visible')
      }, delay)
    }

    function showCard(id, delay) {
      setTimeout(() => {
        const el = document.getElementById(id)
        if (!el) return
        el.classList.add('visible')
      }, delay)
    }

    // ======= PHASE 2 (3-7s): Header + Hero + Text resolve =======

    // Fade out header skeleton, show real header
    fadeSkeleton('skel-header', 3000)
    showReal('real-header', 3200)

    // Fade out hero skeleton, show real hero image
    fadeSkeleton('skel-hero', 3800)
    showReal('real-hero', 4000)

    // Fade out text skeletons, show real text
    fadeSkeleton('skel-text-1', 5000)
    fadeSkeleton('skel-text-2', 5200)
    fadeSkeleton('skel-text-3', 5400)
    showReal('real-text', 5500)

    // ======= PHASE 3 (7-13s): Step cards resolve one by one =======

    // Show the cards container
    showReal('real-cards', 7000)

    // Fade skeleton cards and reveal real cards one by one
    fadeSkeleton('skel-card-1', 7500)
    showCard('card-1', 7700)

    fadeSkeleton('skel-card-2', 9500)
    showCard('card-2', 9700)

    fadeSkeleton('skel-card-3', 11500)
    showCard('card-3', 11700)

    // ======= PHASE 4 (13-20s): CTA resolves =======

    fadeSkeleton('skel-button', 13500)
    showReal('real-cta', 13800)

    // Show the CTA button
    setTimeout(() => {
      const btn = document.getElementById('cta-btn')
      if (btn) btn.classList.add('visible')
    }, 14000)

    // Show the CTA sub text
    setTimeout(() => {
      const sub = document.getElementById('cta-sub')
      if (sub) sub.classList.add('visible')
    }, 14800)

    // Pulse the CTA button after everything is loaded
    setTimeout(() => {
      const btn = document.getElementById('cta-btn')
      if (btn) {
        btn.style.animation = 'pulseGlow 1.5s ease-in-out infinite'
      }
    }, 16000)

    // ======= Bonus: swap hero image mid-way for visual interest =======
    const heroImages = [
      '${imageDataMap[PHOTOS[0]]}',
      '${imageDataMap[PHOTOS[1]]}',
      '${imageDataMap[PHOTOS[2]]}',
      '${imageDataMap[PHOTOS[3]]}',
      '${imageDataMap[PHOTOS[4]]}',
      '${imageDataMap[PHOTOS[5]]}',
    ]

    let currentHeroIdx = 0
    function cycleHero() {
      const heroEl = document.querySelector('.real-hero img')
      if (!heroEl) return
      heroEl.style.transition = 'opacity 0.4s ease-out'
      heroEl.style.opacity = '0'
      setTimeout(() => {
        currentHeroIdx = (currentHeroIdx + 1) % heroImages.length
        heroEl.src = heroImages[currentHeroIdx]
        heroEl.style.opacity = '1'
      }, 400)
    }

    // Cycle hero images every 3s after the hero loads
    setTimeout(() => {
      setInterval(cycleHero, 3000)
    }, 7000)

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
    strategy: 'v76 — skeleton loading UI that progressively resolves to reveal Manila free photo shoot content',
    safeBottomPixels: SAFE_BOTTOM,
    photos: PHOTOS,
  })

  const { execSync } = await import('child_process')
  const browser = await chromium.launch()

  console.log('Recording skeleton loading Manila animation...')

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
    document.documentElement.style.background = '#0a0a0a'
    document.body.style.background = '#0a0a0a'
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
  const finalMp4 = path.join(OUT_DIR, '01_skeleton_loading_manila.mp4')

  try {
    execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${finalMp4}"`, { stdio: 'pipe' })
    fs.unlinkSync(srcVideo)
    console.log('Rendered 01_skeleton_loading_manila.mp4')
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
