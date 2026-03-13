import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, "output-18b")

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 430
const SAFE_TOP = 213
const SAFE_LEFT = 66
const SAFE_RIGHT = 1027
const USABLE_H = HEIGHT - SAFE_BOTTOM

const SF = "-apple-system, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif"
const MANILA_COLOR = '#E8443A'
const IG_BG = '#0a0a0a'

const TOTAL_DURATION_MS = 24000

const PHOTOS = [
  'manila-gallery-dsc-0190.jpg',
  'manila-gallery-garden-002.jpg',
  'manila-gallery-canal-002.jpg',
  'manila-gallery-rocks-001.jpg',
  'manila-gallery-garden-001.jpg',
  'manila-gallery-night-001.jpg',
  'manila-gallery-ivy-001.jpg',
  'manila-gallery-shadow-001.jpg',
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
   * SKELETON LOADING CONCEPT — Premium Editorial Style (18b: boosted text readability)
   *
   * Phase 1 (0-3s):   Full skeleton UI — warm-toned shimmer with editorial layout
   * Phase 2 (3-7s):   Hero image + MANILA title resolve with cinematic reveal
   * Phase 3 (7-13s):  Step cards resolve with photo thumbnails, staggered entrance
   * Phase 4 (13-20s): CTA resolves — "dm me if interested!!" with pulse
   */

  return `<!DOCTYPE html>
<html>
<head>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { margin: 0; padding: 0; background: #080808; -webkit-font-smoothing: antialiased; }

  @keyframes shimmer {
    0% { background-position: -1200px 0; }
    100% { background-position: 1200px 0; }
  }

  @keyframes revealUp {
    0% { opacity: 0; transform: translateY(30px); }
    100% { opacity: 1; transform: translateY(0); }
  }

  @keyframes scaleReveal {
    0% { opacity: 0; transform: scale(0.92); }
    100% { opacity: 1; transform: scale(1); }
  }

  @keyframes pulseGlow {
    0%, 100% { box-shadow: 0 0 0 0 rgba(232,68,58,0.5), 0 6px 32px rgba(232,68,58,0.3); }
    50% { box-shadow: 0 0 0 16px rgba(232,68,58,0), 0 6px 32px rgba(232,68,58,0.3); }
  }

  .page {
    width: ${WIDTH}px;
    height: ${HEIGHT}px;
    position: relative;
    overflow: hidden;
    background:
      radial-gradient(ellipse at 50% 0%, rgba(232,68,58,0.06) 0%, transparent 60%),
      linear-gradient(180deg, #0c0a09 0%, #080808 40%, #0a0908 100%);
    font-family: ${SF};
  }

  /* ── Skeleton base ── */
  .skel {
    background: linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 100%);
    background-size: 1200px 100%;
    animation: shimmer 1.8s infinite linear;
    transition: opacity 0.6s ease-out;
  }

  /* ── Skeleton layout ── */
  .skel-title {
    position: absolute;
    top: ${SAFE_TOP}px;
    left: 50%;
    transform: translateX(-50%);
    width: 520px;
    height: 44px;
    border-radius: 8px;
  }

  .skel-subtitle {
    position: absolute;
    top: ${SAFE_TOP + 60}px;
    left: 50%;
    transform: translateX(-50%);
    width: 360px;
    height: 28px;
    border-radius: 6px;
  }

  .skel-hero {
    position: absolute;
    top: ${SAFE_TOP + 120}px;
    left: ${SAFE_LEFT}px;
    right: ${WIDTH - SAFE_RIGHT}px;
    height: 520px;
    border-radius: 24px;
  }

  .skel-tagline {
    position: absolute;
    top: 900px;
    left: 50%;
    transform: translateX(-50%);
    width: 700px;
    height: 32px;
    border-radius: 6px;
  }

  .skel-tagline-2 {
    position: absolute;
    top: 948px;
    left: 50%;
    transform: translateX(-50%);
    width: 480px;
    height: 32px;
    border-radius: 6px;
  }

  .skel-card {
    position: absolute;
    width: 290px;
    height: 300px;
    border-radius: 20px;
  }

  .skel-card-1 { left: ${SAFE_LEFT}px; top: 1020px; }
  .skel-card-2 { left: 395px; top: 1020px; }
  .skel-card-3 { left: 730px; top: 1020px; }

  .skel-cta {
    position: absolute;
    top: 1360px;
    left: 50%;
    transform: translateX(-50%);
    width: 720px;
    height: 80px;
    border-radius: 50px;
  }

  .skel-cta-sub {
    position: absolute;
    top: ${HEIGHT - SAFE_BOTTOM - 50}px;
    left: 50%;
    transform: translateX(-50%);
    width: 400px;
    height: 24px;
    border-radius: 4px;
  }

  /* ── Real content ── */
  .real {
    position: absolute;
    opacity: 0;
    transition: none;
  }

  /* Title section */
  .real-title {
    top: ${SAFE_TOP}px;
    left: ${SAFE_LEFT}px; right: ${WIDTH - SAFE_RIGHT}px;
    text-align: center;
  }

  .real-title .brand {
    font-family: Georgia, 'Times New Roman', serif;
    font-style: italic;
    font-size: 82px;
    font-weight: bold;
    color: ${MANILA_COLOR};
    letter-spacing: 0.08em;
    line-height: 1;
    text-shadow: 0 4px 24px rgba(232,68,58,0.4), 0 2px 8px rgba(232,68,58,0.3);
  }

  .real-title .sub {
    font-family: ${SF};
    font-size: 28px;
    font-weight: 700;
    color: rgba(255,255,255,0.95);
    letter-spacing: 0.15em;
    text-transform: uppercase;
    margin-top: 12px;
    text-shadow: 0 2px 12px rgba(0,0,0,0.5);
  }

  /* Hero image */
  .real-hero {
    top: ${SAFE_TOP + 120}px;
    left: ${SAFE_LEFT}px;
    right: ${WIDTH - SAFE_RIGHT}px;
    height: 520px;
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 16px 60px rgba(0,0,0,0.6);
  }

  .real-hero img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center 20%;
    display: block;
  }

  /* Tagline */
  .real-tagline {
    top: 890px;
    left: ${SAFE_LEFT}px; right: ${WIDTH - SAFE_RIGHT}px;
    text-align: center;
  }

  .real-tagline .main-tag {
    font-size: 44px;
    font-weight: 800;
    color: #fff;
    line-height: 1.3;
    letter-spacing: -0.01em;
    text-shadow: 0 2px 16px rgba(0,0,0,0.6);
  }

  .real-tagline .accent {
    color: ${MANILA_COLOR};
    text-shadow: 0 2px 12px rgba(232,68,58,0.4);
  }

  .real-tagline .sub-tag {
    font-size: 30px;
    font-weight: 600;
    color: rgba(255,255,255,0.9);
    margin-top: 8px;
    line-height: 1.4;
    text-shadow: 0 2px 12px rgba(0,0,0,0.5);
  }

  /* Step cards — editorial with photo thumbnails */
  .step-card {
    position: absolute;
    width: 290px;
    height: 300px;
    border-radius: 20px;
    overflow: hidden;
    opacity: 0;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.12);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }

  .step-card .card-photo {
    width: 100%;
    height: 150px;
    object-fit: cover;
    object-position: center 20%;
    display: block;
  }

  .step-card .card-body {
    padding: 20px 22px;
  }

  .step-card .card-num {
    font-size: 16px;
    font-weight: 800;
    color: ${MANILA_COLOR};
    letter-spacing: 0.2em;
    text-transform: uppercase;
    margin-bottom: 8px;
    text-shadow: 0 1px 6px rgba(232,68,58,0.3);
  }

  .step-card .card-text {
    font-size: 28px;
    font-weight: 700;
    color: #fff;
    line-height: 1.25;
    text-shadow: 0 2px 8px rgba(0,0,0,0.4);
  }

  .card-1 { left: ${SAFE_LEFT}px; top: 1020px; }
  .card-2 { left: 395px; top: 1020px; }
  .card-3 { left: 730px; top: 1020px; }

  /* CTA */
  .real-cta {
    top: 1360px;
    left: ${SAFE_LEFT}px; right: ${WIDTH - SAFE_RIGHT}px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 18px;
  }

  .cta-btn {
    width: 720px;
    height: 80px;
    border-radius: 50px;
    background: ${MANILA_COLOR};
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    box-shadow: 0 6px 32px rgba(232,68,58,0.3);
  }

  .cta-btn span {
    font-size: 38px;
    font-weight: 900;
    color: #fff;
    letter-spacing: 0.5px;
    text-shadow: 0 2px 8px rgba(0,0,0,0.3);
  }

  .cta-handle {
    font-size: 32px;
    font-weight: 700;
    color: rgba(255,255,255,0.95);
    letter-spacing: 0.02em;
    opacity: 0;
    text-shadow: 0 2px 12px rgba(0,0,0,0.5);
  }

  /* Decorative accent line — hidden, was causing stray line */
  .accent-line {
    display: none;
  }
</style>
</head>
<body>
  <div class="page">

    <!-- ── Skeleton Layer ── -->
    <div class="skel skel-title" id="sk-title"></div>
    <div class="skel skel-subtitle" id="sk-subtitle"></div>
    <div class="skel skel-hero" id="sk-hero"></div>
    <div class="skel skel-tagline" id="sk-tag1"></div>
    <div class="skel skel-tagline-2" id="sk-tag2"></div>
    <div class="skel skel-card skel-card-1" id="sk-c1"></div>
    <div class="skel skel-card skel-card-2" id="sk-c2"></div>
    <div class="skel skel-card skel-card-3" id="sk-c3"></div>
    <div class="skel skel-cta" id="sk-cta"></div>
    <div class="skel skel-cta-sub" id="sk-cta-sub"></div>

    <!-- ── Real Content Layer ── -->

    <!-- Title -->
    <div class="real real-title" id="r-title">
      <div class="brand">MANILA</div>
      <div class="sub">free photo shoot</div>
    </div>

    <!-- Accent line -->
    <div class="accent-line" id="r-accent"></div>

    <!-- Hero image -->
    <div class="real real-hero" id="r-hero">
      <img src="${imageDataMap[PHOTOS[0]]}" id="hero-img" />
    </div>

    <!-- Tagline -->
    <div class="real real-tagline" id="r-tagline">
      <p class="main-tag">Professional photos. <span class="accent">Totally free.</span></p>
      <p class="sub-tag">No experience needed.</p>
    </div>

    <!-- Step cards with photo thumbnails -->
    <div class="step-card card-1" id="c1">
      <img class="card-photo" src="${imageDataMap[PHOTOS[1]]}" />
      <div class="card-body">
        <div class="card-num">Step 1</div>
        <div class="card-text">DM me on Instagram</div>
      </div>
    </div>

    <div class="step-card card-2" id="c2">
      <img class="card-photo" src="${imageDataMap[PHOTOS[2]]}" />
      <div class="card-body">
        <div class="card-num">Step 2</div>
        <div class="card-text">Show up to the shoot</div>
      </div>
    </div>

    <div class="step-card card-3" id="c3">
      <img class="card-photo" src="${imageDataMap[PHOTOS[3]]}" />
      <div class="card-body">
        <div class="card-num">Step 3</div>
        <div class="card-text">Get your photos</div>
      </div>
    </div>

    <!-- CTA -->
    <div class="real real-cta" id="r-cta">
      <div class="cta-btn" id="cta-btn">
        <span>dm me if interested!!</span>
      </div>
      <div class="cta-handle" id="cta-handle">@madebyaidan on Instagram</div>
    </div>

  </div>

  <script>
    function fade(id, delay, dir) {
      setTimeout(() => {
        const el = document.getElementById(id)
        if (!el) return
        el.style.transition = 'opacity 0.6s ease-out'
        el.style.opacity = dir === 'in' ? '1' : '0'
      }, delay)
    }

    function reveal(id, delay, anim) {
      setTimeout(() => {
        const el = document.getElementById(id)
        if (!el) return
        el.style.animation = anim + ' 0.7s cubic-bezier(0.16,1,0.3,1) forwards'
      }, delay)
    }

    // ── Phase 2 (3s): Title + Hero ──
    fade('sk-title', 3000, 'out')
    fade('sk-subtitle', 3200, 'out')
    reveal('r-title', 3200, 'revealUp')
    reveal('r-accent', 3600, 'revealUp')

    fade('sk-hero', 4000, 'out')
    reveal('r-hero', 4200, 'scaleReveal')

    // ── Phase 2b (5.5s): Tagline ──
    fade('sk-tag1', 5500, 'out')
    fade('sk-tag2', 5700, 'out')
    reveal('r-tagline', 5800, 'revealUp')

    // ── Phase 3 (7-12s): Step cards ──
    fade('sk-c1', 7500, 'out')
    reveal('c1', 7700, 'revealUp')

    fade('sk-c2', 9200, 'out')
    reveal('c2', 9400, 'revealUp')

    fade('sk-c3', 10900, 'out')
    reveal('c3', 11100, 'revealUp')

    // ── Phase 4 (13s): CTA ──
    fade('sk-cta', 13000, 'out')
    fade('sk-cta-sub', 13200, 'out')
    fade('r-cta', 13400, 'in')

    setTimeout(() => {
      const btn = document.getElementById('cta-btn')
      if (btn) {
        btn.style.transition = 'opacity 0.6s ease-out, transform 0.6s cubic-bezier(0.16,1,0.3,1)'
        btn.style.opacity = '1'
        btn.style.transform = 'scale(1)'
      }
    }, 13600)

    setTimeout(() => {
      const h = document.getElementById('cta-handle')
      if (h) {
        h.style.transition = 'opacity 0.5s ease-out'
        h.style.opacity = '1'
      }
    }, 14400)

    // Pulse CTA
    setTimeout(() => {
      const btn = document.getElementById('cta-btn')
      if (btn) btn.style.animation = 'pulseGlow 1.5s ease-in-out infinite'
    }, 16000)

    // ── Hero image cycling ──
    const heroSrcs = [
      '${imageDataMap[PHOTOS[0]]}',
      '${imageDataMap[PHOTOS[4]]}',
      '${imageDataMap[PHOTOS[5]]}',
      '${imageDataMap[PHOTOS[6]]}',
      '${imageDataMap[PHOTOS[7]]}',
    ]
    let hIdx = 0
    function cycleHero() {
      const img = document.getElementById('hero-img')
      if (!img) return
      img.style.transition = 'opacity 0.5s ease-out'
      img.style.opacity = '0'
      setTimeout(() => {
        hIdx = (hIdx + 1) % heroSrcs.length
        img.src = heroSrcs[hIdx]
        img.style.opacity = '1'
      }, 500)
    }
    setTimeout(() => setInterval(cycleHero, 3000), 7000)
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
    strategy: 'v76b — skeleton loading UI with boosted text readability for Instagram phone viewing',
    safeBottomPixels: SAFE_BOTTOM,
    photos: PHOTOS,
  })

  const { execSync } = await import('child_process')
  const browser = await chromium.launch()

  console.log('Recording skeleton loading Manila animation (18b — boosted readability)...')

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
