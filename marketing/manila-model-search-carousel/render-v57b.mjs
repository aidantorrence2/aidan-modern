import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v57b')

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 410

const SF = "-apple-system, 'Helvetica Neue', Arial, sans-serif"
const MANILA_COLOR = '#E8443A'

const TOTAL_DURATION = 24
const TOTAL_DURATION_MS = 26000

const PHOTOS = [
  'manila-gallery-garden-001.jpg',
  'manila-gallery-dsc-0075.jpg',
  'manila-gallery-dsc-0190.jpg',
  'manila-gallery-night-001.jpg',
  'manila-gallery-canal-001.jpg',
  'manila-gallery-ivy-001.jpg',
  'manila-gallery-graffiti-001.jpg',
  'manila-gallery-urban-001.jpg',
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

/* ── Build the event invitation HTML ── */
function buildHTML(imageDataMap) {
  // Timeline (seconds)
  const T = {
    // 0-1s: Full skeleton shimmer visible
    headerReveal: 1.0,       // "YOU'RE INVITED" headline
    subtitleReveal: 1.8,     // "to a free photo shoot"
    divider1: 2.5,           // decorative line
    locationReveal: 3.0,     // Manila, Philippines
    dateReveal: 3.5,         // This week
    // 4-8s: photo mosaic loads
    photoStart: 4.2,
    photoInterval: 0.6,
    // 8.5-10s: details
    detail1: 8.8,            // "No experience needed"
    detail2: 9.4,            // "I direct everything"
    detail3: 10.0,           // "You just show up"
    divider2: 10.8,
    // 11-13s: photographer info
    photographerPic: 11.2,
    photographerName: 11.8,
    photographerHandle: 12.2,
    // 13-15s: CTA sequence
    ctaLine1: 13.5,          // "this is your chance"
    ctaLine2: 14.5,          // "message me to get started"
    ctaButton: 15.5,         // pulsing button
    // 15.5-24s: hold with pulse
  }

  // Photo grid: 2x3 layout with varied sizes
  const gridPhotos = PHOTOS.slice(0, 6)
  const photoDelays = gridPhotos.map((_, i) => T.photoStart + i * T.photoInterval)

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
    0% { opacity: 0; transform: translateY(18px); }
    100% { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeSlideDown {
    0% { opacity: 0; transform: translateY(-18px); }
    100% { opacity: 1; transform: translateY(0); }
  }

  @keyframes photoPop {
    0% { opacity: 0; transform: scale(0.3); }
    60% { opacity: 1; transform: scale(1.06); }
    80% { transform: scale(0.97); }
    100% { opacity: 1; transform: scale(1); }
  }

  @keyframes lineGrow {
    0% { transform: scaleX(0); opacity: 0; }
    100% { transform: scaleX(1); opacity: 1; }
  }

  @keyframes profilePop {
    0% { opacity: 0; transform: scale(0); }
    50% { opacity: 1; transform: scale(1.1); }
    70% { transform: scale(0.95); }
    100% { opacity: 1; transform: scale(1); }
  }

  @keyframes ctaPulse {
    0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(232, 68, 58, 0.5); }
    50% { transform: scale(1.03); box-shadow: 0 0 0 16px rgba(232, 68, 58, 0); }
  }

  @keyframes dotPulse {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 1; }
  }

  .shimmer-bar {
    background: linear-gradient(90deg, #1a1a1a 0%, #2a2a2a 40%, #333 50%, #2a2a2a 60%, #1a1a1a 100%);
    background-size: 800px 100%;
    animation: shimmer 1.5s infinite linear;
    border-radius: 10px;
  }

  .shimmer-circle {
    background: linear-gradient(90deg, #1a1a1a 0%, #2a2a2a 40%, #333 50%, #2a2a2a 60%, #1a1a1a 100%);
    background-size: 800px 100%;
    animation: shimmer 1.5s infinite linear;
    border-radius: 50%;
  }

  .page {
    width: ${WIDTH}px;
    height: ${HEIGHT}px;
    position: relative;
    overflow: hidden;
    background: #0a0a0a;
    font-family: ${SF};
  }

  /* Subtle grain overlay */
  .page::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 50% 0%, rgba(232, 68, 58, 0.06) 0%, transparent 60%);
    z-index: 1;
    pointer-events: none;
  }

  /* ── Header area ── */
  .header-area {
    position: absolute;
    top: 80px;
    left: 60px; right: 60px;
    z-index: 10;
    text-align: center;
  }

  .header-label {
    font-size: 28px;
    font-weight: 600;
    letter-spacing: 0.35em;
    color: rgba(255,255,255,0.35);
    text-transform: uppercase;
    opacity: 0;
  }

  .header-title {
    font-size: 72px;
    font-weight: 800;
    color: #fff;
    letter-spacing: -0.02em;
    line-height: 1.05;
    margin-top: 16px;
    opacity: 0;
  }

  .header-subtitle {
    font-size: 38px;
    font-weight: 400;
    color: rgba(255,255,255,0.6);
    margin-top: 14px;
    opacity: 0;
  }

  /* ── Divider ── */
  .divider {
    height: 2px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
    transform-origin: center;
    transform: scaleX(0);
    opacity: 0;
  }

  /* ── Location + Date ── */
  .details-row {
    position: absolute;
    top: 330px;
    left: 60px; right: 60px;
    z-index: 10;
  }

  .detail-item {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 14px;
  }

  .detail-icon {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
  }

  .detail-text {
    font-size: 34px;
    font-weight: 500;
    color: rgba(255,255,255,0.85);
    opacity: 0;
  }

  /* ── Photo mosaic ── */
  .photo-mosaic {
    position: absolute;
    top: 480px;
    left: 40px; right: 40px;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 8px;
    z-index: 10;
  }

  .mosaic-cell {
    position: relative;
    overflow: hidden;
    border-radius: 14px;
    aspect-ratio: 1;
  }

  /* First photo spans 2 rows for variety */
  .mosaic-cell:first-child {
    grid-row: 1 / 3;
    aspect-ratio: auto;
  }

  .mosaic-skel {
    position: absolute;
    inset: 0;
    border-radius: 14px;
  }

  .mosaic-img {
    position: absolute;
    inset: 0;
    opacity: 0;
    transform: scale(0.3);
    border-radius: 14px;
    overflow: hidden;
  }

  .mosaic-img img {
    width: 100%; height: 100%;
    object-fit: cover;
    object-position: center 20%;
    display: block;
  }

  /* ── Info bullets ── */
  .info-section {
    position: absolute;
    top: 880px;
    left: 60px; right: 60px;
    z-index: 10;
  }

  .info-line {
    position: relative;
    height: 50px;
    margin-bottom: 8px;
  }

  .info-text {
    font-size: 34px;
    font-weight: 400;
    color: rgba(255,255,255,0.75);
    position: absolute;
    top: 6px; left: 0;
    display: flex;
    align-items: center;
    gap: 14px;
    opacity: 0;
  }

  .info-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: ${MANILA_COLOR};
    flex-shrink: 0;
  }

  .info-skel {
    position: absolute;
    top: 10px; left: 0;
    height: 30px;
  }

  /* ── Photographer section ── */
  .photographer {
    position: absolute;
    top: 1080px;
    left: 60px; right: 60px;
    z-index: 10;
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .photographer-pic-wrap {
    width: 90px; height: 90px;
    border-radius: 50%;
    position: relative;
    flex-shrink: 0;
  }

  .photographer-pic-skel {
    position: absolute; inset: 0;
  }

  .photographer-pic-img {
    position: absolute; inset: 0;
    border-radius: 50%;
    overflow: hidden;
    opacity: 0;
    transform: scale(0);
  }

  .photographer-pic-img img {
    width: 100%; height: 100%;
    object-fit: cover;
    object-position: center 20%;
  }

  .photographer-info {
    flex: 1;
  }

  .photographer-name {
    font-size: 36px;
    font-weight: 700;
    color: #fff;
    opacity: 0;
  }

  .photographer-handle {
    font-size: 28px;
    font-weight: 400;
    color: rgba(255,255,255,0.5);
    margin-top: 4px;
    opacity: 0;
  }

  /* ── CTA area ── */
  .cta-area {
    position: absolute;
    bottom: ${SAFE_BOTTOM + 40}px;
    left: 60px; right: 60px;
    z-index: 10;
    text-align: center;
  }

  .cta-line1 {
    font-size: 52px;
    font-weight: 800;
    color: #fff;
    letter-spacing: -0.01em;
    opacity: 0;
  }

  .cta-line2 {
    font-size: 36px;
    font-weight: 400;
    color: rgba(255,255,255,0.6);
    margin-top: 12px;
    opacity: 0;
  }

  .cta-button {
    margin-top: 28px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 22px 64px;
    border-radius: 50px;
    background: ${MANILA_COLOR};
    opacity: 0;
    transform: scale(0.8);
  }

  .cta-button span {
    font-size: 34px;
    font-weight: 700;
    color: #fff;
    letter-spacing: 0.02em;
  }

  /* ── Skeleton placeholders for CTA ── */
  .cta-skel-1 {
    width: 520px; height: 48px;
    margin: 0 auto;
  }

  .cta-skel-2 {
    width: 420px; height: 36px;
    margin: 14px auto 0;
  }

  .cta-skel-btn {
    width: 340px; height: 70px;
    margin: 28px auto 0;
    border-radius: 50px;
  }
</style>
</head>
<body>
  <div class="page">

    <!-- ===== HEADER ===== -->
    <div class="header-area">
      <!-- Skeleton bars -->
      <div class="shimmer-bar" style="width:300px;height:24px;margin:0 auto;animation: shimmer 1.5s infinite linear, shimmerFadeOut 0.3s ease-out ${T.headerReveal}s forwards;"></div>
      <div class="shimmer-bar" style="width:680px;height:60px;margin:18px auto 0;animation: shimmer 1.5s infinite linear, shimmerFadeOut 0.3s ease-out ${T.headerReveal}s forwards;"></div>
      <div class="shimmer-bar" style="width:500px;height:36px;margin:14px auto 0;animation: shimmer 1.5s infinite linear, shimmerFadeOut 0.3s ease-out ${T.subtitleReveal}s forwards;"></div>

      <!-- Revealed content -->
      <div class="header-label" style="position:absolute;top:0;left:0;right:0;animation: fadeSlideDown 0.6s ease-out ${T.headerReveal + 0.15}s forwards;">
        Exclusive Invite
      </div>
      <div class="header-title" style="position:absolute;top:40px;left:0;right:0;animation: fadeSlideUp 0.7s ease-out ${T.headerReveal + 0.2}s forwards;">
        Free Photo Shoot
      </div>
      <div class="header-subtitle" style="position:absolute;top:138px;left:0;right:0;animation: fadeSlideUp 0.6s ease-out ${T.subtitleReveal + 0.15}s forwards;">
        a collaboration in Manila
      </div>
    </div>

    <!-- ===== DIVIDER 1 ===== -->
    <div class="divider" style="position:absolute;top:315px;left:80px;right:80px;z-index:10;animation: lineGrow 0.6s ease-out ${T.divider1}s forwards;"></div>

    <!-- ===== LOCATION + DATE ===== -->
    <div class="details-row">
      <!-- Location skeleton + content -->
      <div class="detail-item">
        <div class="shimmer-bar" style="width:44px;height:44px;border-radius:50%;animation: shimmer 1.5s infinite linear, shimmerFadeOut 0.3s ease-out ${T.locationReveal}s forwards;"></div>
        <div class="shimmer-bar" style="width:360px;height:32px;animation: shimmer 1.5s infinite linear, shimmerFadeOut 0.3s ease-out ${T.locationReveal}s forwards;"></div>
        <div class="detail-icon" style="position:absolute;left:0;animation: fadeIn 0.5s ease-out ${T.locationReveal + 0.15}s forwards;">
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="${MANILA_COLOR}" stroke-width="2.5" stroke-linecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
        <div class="detail-text" style="position:absolute;left:58px;animation: fadeSlideUp 0.5s ease-out ${T.locationReveal + 0.2}s forwards;">Manila, Philippines</div>
      </div>

      <!-- Date skeleton + content -->
      <div class="detail-item" style="margin-top:8px;">
        <div class="shimmer-bar" style="width:44px;height:44px;border-radius:50%;animation: shimmer 1.5s infinite linear, shimmerFadeOut 0.3s ease-out ${T.dateReveal}s forwards;"></div>
        <div class="shimmer-bar" style="width:280px;height:32px;animation: shimmer 1.5s infinite linear, shimmerFadeOut 0.3s ease-out ${T.dateReveal}s forwards;"></div>
        <div class="detail-icon" style="position:absolute;left:0;animation: fadeIn 0.5s ease-out ${T.dateReveal + 0.15}s forwards;">
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="${MANILA_COLOR}" stroke-width="2.5" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        </div>
        <div class="detail-text" style="position:absolute;left:58px;animation: fadeSlideUp 0.5s ease-out ${T.dateReveal + 0.2}s forwards;">Available this week</div>
      </div>
    </div>

    <!-- ===== PHOTO MOSAIC ===== -->
    <div class="photo-mosaic">
      ${gridPhotos.map((photo, i) => `<div class="mosaic-cell">
        <div class="shimmer-bar mosaic-skel" style="animation: shimmer 1.5s infinite linear, shimmerFadeOut 0.3s ease-out ${photoDelays[i]}s forwards;"></div>
        <div class="mosaic-img" style="animation: photoPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${photoDelays[i]}s forwards;">
          <img src="${imageDataMap[photo]}" />
        </div>
      </div>`).join('\n      ')}
    </div>

    <!-- ===== INFO BULLETS ===== -->
    <div class="info-section">
      <div class="info-line">
        <div class="shimmer-bar info-skel" style="width:440px;animation: shimmer 1.5s infinite linear, shimmerFadeOut 0.3s ease-out ${T.detail1}s forwards;"></div>
        <div class="info-text" style="animation: fadeSlideUp 0.5s ease-out ${T.detail1 + 0.15}s forwards;">
          <div class="info-dot"></div>
          No experience needed
        </div>
      </div>
      <div class="info-line">
        <div class="shimmer-bar info-skel" style="width:380px;animation: shimmer 1.5s infinite linear, shimmerFadeOut 0.3s ease-out ${T.detail2}s forwards;"></div>
        <div class="info-text" style="animation: fadeSlideUp 0.5s ease-out ${T.detail2 + 0.15}s forwards;">
          <div class="info-dot"></div>
          I direct everything
        </div>
      </div>
      <div class="info-line">
        <div class="shimmer-bar info-skel" style="width:320px;animation: shimmer 1.5s infinite linear, shimmerFadeOut 0.3s ease-out ${T.detail3}s forwards;"></div>
        <div class="info-text" style="animation: fadeSlideUp 0.5s ease-out ${T.detail3 + 0.15}s forwards;">
          <div class="info-dot"></div>
          You just show up
        </div>
      </div>
    </div>

    <!-- ===== DIVIDER 2 ===== -->
    <div class="divider" style="position:absolute;top:1060px;left:80px;right:80px;z-index:10;animation: lineGrow 0.6s ease-out ${T.divider2}s forwards;"></div>

    <!-- ===== PHOTOGRAPHER ===== -->
    <div class="photographer">
      <div class="photographer-pic-wrap">
        <div class="shimmer-circle photographer-pic-skel" style="width:90px;height:90px;animation: shimmer 1.5s infinite linear, shimmerFadeOut 0.3s ease-out ${T.photographerPic}s forwards;"></div>
        <div class="photographer-pic-img" style="animation: profilePop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${T.photographerPic}s forwards;">
          <img src="${imageDataMap[PHOTOS[0]]}" />
        </div>
      </div>
      <div class="photographer-info">
        <div style="position:relative;height:44px;">
          <div class="shimmer-bar" style="width:260px;height:32px;position:absolute;top:6px;left:0;animation: shimmer 1.5s infinite linear, shimmerFadeOut 0.3s ease-out ${T.photographerName}s forwards;"></div>
          <div class="photographer-name" style="position:absolute;top:0;left:0;animation: fadeSlideUp 0.5s ease-out ${T.photographerName + 0.15}s forwards;">Aidan Torrence</div>
        </div>
        <div style="position:relative;height:36px;">
          <div class="shimmer-bar" style="width:200px;height:24px;position:absolute;top:6px;left:0;animation: shimmer 1.5s infinite linear, shimmerFadeOut 0.3s ease-out ${T.photographerHandle}s forwards;"></div>
          <div class="photographer-handle" style="position:absolute;top:0;left:0;animation: fadeSlideUp 0.5s ease-out ${T.photographerHandle + 0.15}s forwards;">@madebyaidan</div>
        </div>
      </div>
    </div>

    <!-- ===== CTA AREA ===== -->
    <div class="cta-area">
      <!-- Skeleton placeholders -->
      <div class="shimmer-bar cta-skel-1" style="animation: shimmer 1.5s infinite linear, shimmerFadeOut 0.3s ease-out ${T.ctaLine1}s forwards;"></div>
      <div class="shimmer-bar cta-skel-2" style="animation: shimmer 1.5s infinite linear, shimmerFadeOut 0.3s ease-out ${T.ctaLine2}s forwards;"></div>
      <div class="shimmer-bar cta-skel-btn" style="animation: shimmer 1.5s infinite linear, shimmerFadeOut 0.3s ease-out ${T.ctaButton}s forwards;"></div>

      <!-- Revealed CTA -->
      <div class="cta-line1" style="position:absolute;top:0;left:0;right:0;animation: fadeSlideUp 0.6s ease-out ${T.ctaLine1 + 0.15}s forwards;">this is your chance</div>
      <div class="cta-line2" style="position:absolute;top:66px;left:0;right:0;animation: fadeSlideUp 0.6s ease-out ${T.ctaLine2 + 0.15}s forwards;">message me to get started</div>
      <div class="cta-button" id="ctaBtn" style="position:absolute;top:120px;left:50%;transform:translateX(-50%) scale(0.8);animation: fadeIn 0.5s ease-out ${T.ctaButton + 0.1}s forwards;">
        <span>Message @madebyaidan</span>
      </div>
    </div>

  </div>

  <script>
    // Start CTA button pulse after it appears
    setTimeout(() => {
      const btn = document.getElementById('ctaBtn')
      if (btn) {
        btn.style.opacity = '1'
        btn.style.transform = 'translateX(-50%) scale(1)'
        btn.style.animation = 'ctaPulse 2s ease-in-out infinite'
      }
    }, ${(T.ctaButton + 0.6) * 1000})
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
    strategy: 'v57b — Event invitation skeleton loading concept',
    safeBottomPixels: SAFE_BOTTOM,
    photos: PHOTOS,
  })

  const { execSync } = await import('child_process')
  const browser = await chromium.launch()

  console.log('Recording event invitation skeleton loading...')
  console.log(`  Total duration: ${TOTAL_DURATION}s, recording ${TOTAL_DURATION_MS}ms`)

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
  const finalMp4 = path.join(OUT_DIR, '01_invite_loading.mp4')

  try {
    execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${finalMp4}"`, { stdio: 'pipe' })
    fs.unlinkSync(srcVideo)
    console.log('Rendered 01_invite_loading.mp4')
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
