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

const TOTAL_DURATION = 24
const TOTAL_DURATION_MS = 26000

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
  // Timeline (seconds)
  const T = {
    cardAppear: 0.3,
    shimmer: 0.5,
    // Story text 1: "you sign up"
    story1In: 0.3,
    story1Out: 2.6,
    mainPhotoDrop: 3.0,
    // Story text 2: "we shoot in Manila"
    story2In: 3.0,
    story2Out: 4.6,
    grid1: 5.0,
    grid2: 5.5,
    grid3: 6.0,
    grid4: 6.5,
    // Story text 3: "no experience needed"
    story3In: 5.0,
    story3Out: 7.2,
    bioType: 7.5,
    // Story text 4: "I direct everything"
    story4In: 7.5,
    story4Out: 9.5,
    statsIn: 9.8,
    // Story text 5: "photos delivered in a week"
    story5In: 9.8,
    story5Out: 11.8,
    verified: 12.0,
    // Story text 6: "this could be your portfolio"
    story6In: 12.0,
    story6Out: 14.0,
    toast: 14.5,
    // CTA fade in after toast
    ctaIn: 16.5,
    // Hold final state until TOTAL_DURATION
  }

  // Helper: story text with fade-in and fade-out using CSS keyframes
  // Each story text gets unique keyframes so timings don't collide
  function storyKeyframes(id, inTime, outTime) {
    const dur = TOTAL_DURATION
    const inPct = ((inTime / dur) * 100).toFixed(2)
    const inDonePct = (((inTime + 0.4) / dur) * 100).toFixed(2)
    const outStartPct = ((outTime / dur) * 100).toFixed(2)
    const outDonePct = (((outTime + 0.4) / dur) * 100).toFixed(2)
    return `
      @keyframes story${id} {
        0% { opacity: 0; transform: translateY(16px); }
        ${inPct}% { opacity: 0; transform: translateY(16px); }
        ${inDonePct}% { opacity: 1; transform: translateY(0); }
        ${outStartPct}% { opacity: 1; transform: translateY(0); }
        ${outDonePct}% { opacity: 0; transform: translateY(-10px); }
        100% { opacity: 0; transform: translateY(-10px); }
      }
    `
  }

  // CTA fade-in keyframes
  const ctaInPct = ((T.ctaIn / TOTAL_DURATION) * 100).toFixed(2)
  const ctaDonePct = (((T.ctaIn + 0.6) / TOTAL_DURATION) * 100).toFixed(2)

  const storyTexts = [
    { id: 1, text: 'you sign up', inTime: T.story1In, outTime: T.story1Out },
    { id: 2, text: 'we shoot in Manila', inTime: T.story2In, outTime: T.story2Out },
    { id: 3, text: 'no experience needed', inTime: T.story3In, outTime: T.story3Out },
    { id: 4, text: 'I direct everything', inTime: T.story4In, outTime: T.story4Out },
    { id: 5, text: 'photos delivered in a week', inTime: T.story5In, outTime: T.story5Out },
    { id: 6, text: 'this could be your portfolio', inTime: T.story6In, outTime: T.story6Out },
  ]

  const CARD_TOP = 140
  const CARD_LEFT = 60
  const CARD_RIGHT = 60
  const CARD_BOTTOM = SAFE_BOTTOM + 50

  return `<!DOCTYPE html>
<html>
  <head>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      html, body { margin: 0; padding: 0; background: #000; -webkit-font-smoothing: antialiased; }

      @keyframes cardSlideUp {
        0% { opacity: 0; transform: translateY(60px); }
        100% { opacity: 1; transform: translateY(0); }
      }

      @keyframes shimmer {
        0% { background-position: -400px 0; }
        100% { background-position: 400px 0; }
      }

      @keyframes shimmerFadeOut {
        0% { opacity: 1; }
        100% { opacity: 0; }
      }

      @keyframes photoPop {
        0% { opacity: 0; transform: scale(0.3); }
        60% { opacity: 1; transform: scale(1.08); }
        80% { transform: scale(0.96); }
        100% { opacity: 1; transform: scale(1); }
      }

      @keyframes typeIn {
        0% { width: 0; }
        100% { width: 100%; }
      }

      @keyframes fadeSlideUp {
        0% { opacity: 0; transform: translateY(20px); }
        100% { opacity: 1; transform: translateY(0); }
      }

      @keyframes badgeGlow {
        0% { opacity: 0; transform: scale(0.5); }
        50% { opacity: 1; transform: scale(1.15); }
        70% { transform: scale(0.95); }
        100% { opacity: 1; transform: scale(1); }
      }

      @keyframes glowPulse {
        0%, 100% { box-shadow: 0 0 10px rgba(76,175,80,0.3); }
        50% { box-shadow: 0 0 25px rgba(76,175,80,0.7), 0 0 50px rgba(76,175,80,0.3); }
      }

      @keyframes toastSlide {
        0% { opacity: 0; transform: translateY(-100px); }
        40% { opacity: 1; transform: translateY(8px); }
        60% { transform: translateY(-3px); }
        100% { opacity: 1; transform: translateY(0); }
      }

      @keyframes ctaFadeIn {
        0% { opacity: 0; transform: translateY(20px); }
        ${ctaInPct}% { opacity: 0; transform: translateY(20px); }
        ${ctaDonePct}% { opacity: 1; transform: translateY(0); }
        100% { opacity: 1; transform: translateY(0); }
      }

      ${storyTexts.map(s => storyKeyframes(s.id, s.inTime, s.outTime)).join('\n')}

      .shimmer-bar {
        background: linear-gradient(90deg, #333 0%, #444 40%, #555 50%, #444 60%, #333 100%);
        background-size: 800px 100%;
        animation: shimmer 1.5s infinite linear;
        border-radius: 8px;
      }

      .shimmer-hide {
        animation: shimmerFadeOut 0.3s ease-out forwards;
      }

      .photo-crop {
        overflow: hidden;
      }
      .photo-crop img {
        width: 130%;
        height: 130%;
        object-fit: cover;
        object-position: center 20%;
        display: block;
        margin: -15% 0 0 -15%;
      }

      .story-text {
        position: absolute;
        left: 0; right: 0;
        bottom: ${SAFE_BOTTOM + 10}px;
        text-align: center;
        z-index: 15;
        pointer-events: none;
        opacity: 0;
      }
      .story-text p {
        font-family: ${SF};
        font-size: 52px;
        font-weight: 700;
        color: #fff;
        text-shadow: 0 2px 20px rgba(0,0,0,0.8), 0 0 60px rgba(0,0,0,0.5);
        letter-spacing: 0.01em;
        line-height: 1.2;
        padding: 0 60px;
      }
    </style>
  </head>
  <body>
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#111;">

      <!-- Status text at top -->
      <div style="position:absolute;left:0;right:0;top:60px;text-align:center;z-index:10;opacity:0;animation:fadeSlideUp 0.6s ease-out ${T.cardAppear}s forwards;">
        <p style="font-family:${SF};font-size:24px;font-weight:500;color:rgba(255,255,255,0.4);letter-spacing:0.12em;text-transform:uppercase;">Building your portfolio</p>
      </div>

      <!-- Profile Card -->
      <div style="position:absolute;left:${CARD_LEFT}px;right:${CARD_RIGHT}px;top:${CARD_TOP}px;bottom:${CARD_BOTTOM}px;background:#1a1a1a;border-radius:20px;border:1px solid #333;overflow:hidden;opacity:0;animation:cardSlideUp 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) ${T.cardAppear}s forwards;">

        <!-- Profile header area -->
        <div style="padding:28px 28px 0;">

          <!-- Name skeleton / text -->
          <div style="position:relative;height:38px;margin-bottom:8px;">
            <div class="shimmer-bar" style="width:240px;height:30px;position:absolute;top:4px;left:0;animation:shimmer 1.5s infinite linear, shimmerFadeOut 0.3s ease-out ${T.mainPhotoDrop}s forwards;"></div>
            <p style="font-family:${SF};font-size:30px;font-weight:700;color:#fff;letter-spacing:0.02em;position:absolute;top:0;left:0;opacity:0;animation:fadeSlideUp 0.5s ease-out ${T.mainPhotoDrop + 0.2}s forwards;">Your Name Here</p>
          </div>

          <!-- Location skeleton -->
          <div style="position:relative;height:22px;margin-bottom:20px;">
            <div class="shimmer-bar" style="width:140px;height:16px;position:absolute;top:3px;left:0;animation:shimmer 1.5s infinite linear, shimmerFadeOut 0.3s ease-out ${T.mainPhotoDrop}s forwards;"></div>
            <p style="font-family:${SF};font-size:17px;font-weight:400;color:rgba(255,255,255,0.4);position:absolute;top:0;left:0;opacity:0;animation:fadeSlideUp 0.5s ease-out ${T.mainPhotoDrop + 0.3}s forwards;">Manila, Philippines</p>
          </div>

          <!-- Main photo slot -->
          <div style="width:100%;aspect-ratio:4/5;border-radius:14px;overflow:hidden;position:relative;margin-bottom:16px;">
            <div class="shimmer-bar" style="position:absolute;inset:0;border-radius:14px;animation:shimmer 1.5s infinite linear, shimmerFadeOut 0.3s ease-out ${T.mainPhotoDrop}s forwards;"></div>
            <div class="photo-crop" style="position:absolute;inset:0;border-radius:14px;opacity:0;transform:scale(0.3);animation:photoPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${T.mainPhotoDrop}s forwards;">
              <img src="${images.main}" style="object-position:center 15%;"/>
            </div>
          </div>

          <!-- 2x2 Grid -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">
            ${[images.grid1, images.grid2, images.grid3, images.grid4].map((img, i) => {
              const delay = T.grid1 + i * 0.5
              return `<div style="aspect-ratio:1;border-radius:10px;overflow:hidden;position:relative;">
                <div class="shimmer-bar" style="position:absolute;inset:0;border-radius:10px;animation:shimmer 1.5s infinite linear, shimmerFadeOut 0.3s ease-out ${delay}s forwards;"></div>
                <div class="photo-crop" style="position:absolute;inset:0;border-radius:10px;opacity:0;transform:scale(0.3);animation:photoPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}s forwards;">
                  <img src="${img}" style="object-position:center 20%;"/>
                </div>
              </div>`
            }).join('\n')}
          </div>

          <!-- Bio text (types in) -->
          <div style="margin-bottom:14px;height:26px;position:relative;">
            <div style="overflow:hidden;white-space:nowrap;opacity:0;animation:fadeSlideUp 0.1s ease-out ${T.bioType}s forwards;">
              <p style="font-family:${SF};font-size:20px;font-weight:400;color:rgba(255,255,255,0.7);overflow:hidden;white-space:nowrap;width:0;animation:typeIn 1.8s steps(35) ${T.bioType + 0.1}s forwards;border-right:2px solid rgba(255,255,255,0.5);">Shot by @${HANDLE} in Manila</p>
            </div>
          </div>

          <!-- Stats -->
          <div style="display:flex;gap:14px;align-items:center;margin-bottom:14px;opacity:0;animation:fadeSlideUp 0.6s ease-out ${T.statsIn}s forwards;">
            <span style="font-family:${SF};font-size:17px;font-weight:600;color:rgba(255,255,255,0.85);">5 photos</span>
            <span style="font-family:${SF};font-size:17px;color:rgba(255,255,255,0.3);">·</span>
            <span style="font-family:${SF};font-size:17px;font-weight:600;color:rgba(255,255,255,0.85);">1 session</span>
            <span style="font-family:${SF};font-size:17px;color:rgba(255,255,255,0.3);">·</span>
            <span style="font-family:${SF};font-size:17px;font-weight:600;color:rgba(255,255,255,0.85);">0 exp needed</span>
          </div>

          <!-- Verified Badge -->
          <div style="display:inline-flex;align-items:center;gap:8px;background:rgba(76,175,80,0.12);border:1px solid rgba(76,175,80,0.3);border-radius:24px;padding:8px 20px;opacity:0;transform:scale(0.5);animation:badgeGlow 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${T.verified}s forwards, glowPulse 2s ease-in-out ${T.verified + 0.6}s infinite;">
            <span style="font-family:${SF};font-size:18px;font-weight:700;color:#4CAF50;letter-spacing:0.08em;">VERIFIED ✓</span>
          </div>

        </div>
      </div>

      <!-- Story narrative text overlays -->
      ${storyTexts.map(s => `
      <div class="story-text" style="animation:story${s.id} ${TOTAL_DURATION}s linear forwards;">
        <p>${s.text}</p>
      </div>
      `).join('')}

      <!-- Toast notification -->
      <div style="position:absolute;left:40px;right:40px;top:70px;z-index:20;opacity:0;transform:translateY(-100px);animation:toastSlide 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) ${T.toast}s forwards;">
        <div style="background:rgba(30,30,30,0.95);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-radius:16px;padding:18px 24px;border:1px solid rgba(255,255,255,0.1);display:flex;align-items:center;gap:12px;">
          <span style="font-size:28px;">🔥</span>
          <p style="font-family:${SF};font-size:20px;font-weight:600;color:rgba(255,255,255,0.9);margin:0;">47 people viewed your portfolio today</p>
        </div>
      </div>

      <!-- Natural CTA ending (fades in after toast) -->
      <div style="position:absolute;left:0;right:0;bottom:${SAFE_BOTTOM + 10}px;text-align:center;z-index:25;opacity:0;animation:ctaFadeIn ${TOTAL_DURATION}s linear forwards;">
        <p style="font-family:${SF};font-size:54px;font-weight:800;color:${MANILA_COLOR};margin:0 0 16px;letter-spacing:0.02em;text-shadow:0 2px 30px rgba(232,68,58,0.4);">sign up below</p>
        <p style="font-family:${SF};font-size:26px;font-weight:500;color:rgba(255,255,255,0.7);margin:0 0 8px;letter-spacing:0.04em;">60-second form</p>
        <p style="font-family:${SF};font-size:22px;font-weight:400;color:rgba(255,255,255,0.45);margin:0;letter-spacing:0.03em;">limited spots this month</p>
      </div>

    </div>
  </body>
</html>`
}

async function render() {
  resetOutputDir()

  const selection = {
    main: 'manila-gallery-garden-001.jpg',
    grid1: 'manila-gallery-purple-001.jpg',
    grid2: 'manila-gallery-graffiti-001.jpg',
    grid3: 'manila-gallery-canal-001.jpg',
    grid4: 'manila-gallery-night-001.jpg',
  }

  writeSources({
    createdAt: new Date().toISOString(),
    strategy: 'v57 — Dating app profile build animated ad with story narrative + natural CTA ending',
    safeBottomPixels: SAFE_BOTTOM,
    images: selection
  })

  const images = Object.fromEntries(
    Object.entries(selection).map(([key, file]) => [key, readImage(file)])
  )

  const { execSync } = await import('child_process')
  const browser = await chromium.launch()

  // --- Record the animation (includes story text + natural CTA ending) ---
  console.log('Recording profile build animation...')

  const videoCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: OUT_DIR,
      size: { width: WIDTH, height: HEIGHT }
    }
  })

  const videoPage = await videoCtx.newPage()
  await videoPage.setContent(buildAnimated(images), { waitUntil: 'load' })
  await videoPage.waitForTimeout(500)
  await videoPage.waitForTimeout(TOTAL_DURATION_MS)
  await videoPage.close()
  await videoCtx.close()
  await browser.close()

  // --- Convert webm to mp4 directly (no concat) ---
  const videoFiles = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.webm'))
  if (videoFiles.length === 0) {
    console.error('No video file was generated!')
    return
  }

  const srcVideo = path.join(OUT_DIR, videoFiles[0])
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
