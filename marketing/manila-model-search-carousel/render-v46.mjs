import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v46')

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 410

const SF = "-apple-system, 'Helvetica Neue', Arial, sans-serif"

const MANILA_COLOR = '#E8443A'

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

function writeSources(selected) {
  const payload = {
    createdAt: new Date().toISOString(),
    strategy: 'v46 — Spotify Wrapped / Year-in-Review animated stat cards',
    safeBottomPixels: SAFE_BOTTOM,
    images: selected
  }
  fs.writeFileSync(path.join(OUT_DIR, 'sources.json'), JSON.stringify(payload, null, 2))
}

function buildSpotifyWrapped(images) {
  // Card timing (seconds)
  // Card 1: 0s - 3s
  // Card 2: 3s - 5.5s
  // Card 3: 5.5s - 8s
  // Card 4: 8s - 10.5s
  // Card 5: 10.5s - 13s
  // Card 6: 13s - 15s
  // Card 7: 15s - 18s

  const TOTAL_DURATION = 18

  // Helper: generate card CSS animation keyframes
  // Each card fades in then fades out
  // showAt, peakAt, hideAt in seconds
  function cardAnimation(id, showAt, hideAt) {
    const T = TOTAL_DURATION
    const fadeIn = 0.4
    const fadeOut = 0.4
    const peakStart = showAt + fadeIn
    const peakEnd = hideAt - fadeOut

    const s0 = ((showAt / T) * 100).toFixed(2)
    const s1 = ((peakStart / T) * 100).toFixed(2)
    const s2 = ((peakEnd / T) * 100).toFixed(2)
    const s3 = ((hideAt / T) * 100).toFixed(2)

    // For the last card, don't fade out
    if (hideAt >= T) {
      return `
        @keyframes card_${id} {
          0% { opacity: 0; }
          ${s0}% { opacity: 0; }
          ${s1}% { opacity: 1; }
          100% { opacity: 1; }
        }
        #${id} { opacity: 0; animation: card_${id} ${T}s linear 0s forwards; }
      `
    }

    return `
      @keyframes card_${id} {
        0% { opacity: 0; }
        ${s0}% { opacity: 0; }
        ${s1}% { opacity: 1; }
        ${s2}% { opacity: 1; }
        ${s3}% { opacity: 0; }
        100% { opacity: 0; }
      }
      #${id} { opacity: 0; animation: card_${id} ${T}s linear 0s forwards; }
    `
  }

  // Counter animation: elements appear one by one to simulate counting
  // showAt = when card appears, duration = how long to count
  function counterStyle(id, maxNum, showAt, countDuration) {
    const T = TOTAL_DURATION
    const step = countDuration / 10
    let kf = ''
    for (let i = 0; i <= 10; i++) {
      const t = showAt + 0.4 + i * step
      const pct = ((t / T) * 100).toFixed(2)
      kf += `${pct}% { content: "${Math.round((maxNum * i) / 10)}"; }\n`
    }
    return `
      @keyframes count_${id} { ${kf} }
      #${id}::before { content: "0"; animation: count_${id} ${T}s linear 0s forwards; }
    `
  }

  // Photo flash animation — shows photo i out of n, cycling
  function photoFlashStyle(id, showAt, duration, delay) {
    const T = TOTAL_DURATION
    const s0 = (((showAt + delay) / T) * 100).toFixed(2)
    const s1 = (((showAt + delay + 0.3) / T) * 100).toFixed(2)
    const s2 = (((showAt + delay + duration) / T) * 100).toFixed(2)
    const s3 = (((showAt + delay + duration + 0.3) / T) * 100).toFixed(2)
    return `
      @keyframes flash_${id} {
        0% { opacity: 0; }
        ${s0}% { opacity: 0; }
        ${s1}% { opacity: 0.15; }
        ${s2}% { opacity: 0.15; }
        ${s3}% { opacity: 0; }
        100% { opacity: 0; }
      }
      #${id} { opacity: 0; animation: flash_${id} ${T}s linear 0s forwards; }
    `
  }

  // Photo collage scale-in
  function photoScaleStyle(id, showAt) {
    const T = TOTAL_DURATION
    const s0 = ((showAt / T) * 100).toFixed(2)
    const s1 = (((showAt + 0.5) / T) * 100).toFixed(2)
    const s2 = (((showAt + 1.0) / T) * 100).toFixed(2)
    return `
      @keyframes scale_${id} {
        0% { opacity: 0; transform: scale(0.6) var(--rot); }
        ${s0}% { opacity: 0; transform: scale(0.6) var(--rot); }
        ${s1}% { opacity: 1; transform: scale(1.05) var(--rot); }
        ${s2}% { opacity: 1; transform: scale(1) var(--rot); }
        100% { opacity: 1; transform: scale(1) var(--rot); }
      }
      #${id} { opacity: 0; animation: scale_${id} ${T}s cubic-bezier(0.34,1.56,0.64,1) 0s forwards; }
    `
  }

  // Text slide-up animation
  function textSlideStyle(id, showAt, hideAt) {
    const T = TOTAL_DURATION
    const s0 = ((showAt / T) * 100).toFixed(2)
    const s1 = (((showAt + 0.5) / T) * 100).toFixed(2)
    const s2 = hideAt >= T ? '100' : (((hideAt - 0.3) / T) * 100).toFixed(2)
    const s3 = hideAt >= T ? '100' : (((hideAt) / T) * 100).toFixed(2)

    if (hideAt >= T) {
      return `
        @keyframes slide_${id} {
          0% { opacity: 0; transform: translateY(30px); }
          ${s0}% { opacity: 0; transform: translateY(30px); }
          ${s1}% { opacity: 1; transform: translateY(0); }
          100% { opacity: 1; transform: translateY(0); }
        }
        #${id} { opacity: 0; animation: slide_${id} ${T}s ease-out 0s forwards; }
      `
    }

    return `
      @keyframes slide_${id} {
        0% { opacity: 0; transform: translateY(30px); }
        ${s0}% { opacity: 0; transform: translateY(30px); }
        ${s1}% { opacity: 1; transform: translateY(0); }
        ${s2}% { opacity: 1; transform: translateY(0); }
        ${s3}% { opacity: 0; transform: translateY(-20px); }
        100% { opacity: 0; transform: translateY(-20px); }
      }
      #${id} { opacity: 0; animation: slide_${id} ${T}s ease-out 0s forwards; }
    `
  }

  const glowAnim = `
    @keyframes glowPulse {
      0%, 100% { text-shadow: 0 0 40px rgba(232,68,58,0.4), 0 0 80px rgba(232,68,58,0.2); }
      50% { text-shadow: 0 0 80px rgba(232,68,58,0.7), 0 0 160px rgba(232,68,58,0.4); }
    }
  `

  const nowPulse = `
    @keyframes nowPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.04); }
    }
  `

  const manilaGlowIn = `
    @keyframes manilaGlowIn {
      0% { opacity: 0; transform: scale(0.88); letter-spacing: 0.2em; }
      60% { opacity: 1; transform: scale(1.03); }
      100% { opacity: 1; transform: scale(1); letter-spacing: 0.1em; }
    }
  `

  return `<!DOCTYPE html>
<html>
  <head>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      html, body { margin: 0; padding: 0; background: #000; -webkit-font-smoothing: antialiased; }

      .card {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 80px 60px ${SAFE_BOTTOM + 60}px;
      }

      ${glowAnim}
      ${nowPulse}
      ${manilaGlowIn}

      ${cardAnimation('card1', 0, 3)}
      ${cardAnimation('card2', 3, 5.5)}
      ${cardAnimation('card3', 5.5, 8)}
      ${cardAnimation('card4', 8, 10.5)}
      ${cardAnimation('card5', 10.5, 13)}
      ${cardAnimation('card6', 13, 15)}
      ${cardAnimation('card7', 15, 18)}

      ${textSlideStyle('c1_title', 0.4, 3)}
      ${textSlideStyle('c1_sub', 0.6, 3)}
      ${textSlideStyle('c1_recap', 0.8, 3)}

      ${counterStyle('c2_num', 847, 3, 1.8)}
      ${textSlideStyle('c2_label', 3.6, 5.5)}

      ${photoFlashStyle('ph_f1', 3, 0.7, 0.2)}
      ${photoFlashStyle('ph_f2', 3, 0.7, 0.9)}
      ${photoFlashStyle('ph_f3', 3, 0.7, 1.6)}

      ${counterStyle('c3_num', 23, 5.5, 1.8)}
      ${textSlideStyle('c3_label', 6.1, 8)}
      ${textSlideStyle('c3_sub', 6.3, 8)}

      ${textSlideStyle('c4_num', 8.4, 10.5)}
      ${textSlideStyle('c4_label', 8.6, 10.5)}
      ${textSlideStyle('c4_sub', 8.8, 10.5)}

      ${photoScaleStyle('ph_c1', 10.7)}
      ${photoScaleStyle('ph_c2', 11.2)}
      ${photoScaleStyle('ph_c3', 11.7)}
      ${textSlideStyle('c5_credit', 12.2, 13)}

      ${textSlideStyle('c6_next', 13.4, 15)}
      ${textSlideStyle('c6_now', 13.6, 15)}
      ${textSlideStyle('c6_signup', 13.9, 15)}

      ${textSlideStyle('c7_manila', 15.4, 18)}
      ${textSlideStyle('c7_sub', 15.7, 18)}
      ${textSlideStyle('c7_cta', 15.9, 18)}
    </style>
  </head>
  <body>
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#000;">

      <!-- CARD 1: Intro — Spotify green gradient -->
      <div id="card1" class="card" style="background:linear-gradient(160deg, #1DB954 0%, #17a049 40%, #191414 100%);">
        <div style="text-align:center;">
          <p id="c1_title" style="font-family:${SF};font-size:108px;font-weight:900;color:#fff;letter-spacing:0.06em;text-transform:uppercase;margin:0;line-height:1;">MANILA</p>
          <p id="c1_sub" style="font-family:${SF};font-size:38px;font-weight:600;color:#fff;margin:18px 0 0;letter-spacing:0.03em;">Model Search 2026</p>
          <p id="c1_recap" style="font-family:${SF};font-size:26px;font-weight:400;color:rgba(255,255,255,0.6);margin:14px 0 0;letter-spacing:0.02em;">Your creative recap</p>
        </div>
      </div>

      <!-- CARD 2: 847 photos — red gradient -->
      <div id="card2" class="card" style="background:linear-gradient(160deg, #E8443A 0%, #c0392b 40%, #1a1a1a 100%);overflow:hidden;">
        <!-- Background photo flashes -->
        <div id="ph_f1" style="position:absolute;inset:0;background-image:url('${images.photo1}');background-size:cover;background-position:center;"></div>
        <div id="ph_f2" style="position:absolute;inset:0;background-image:url('${images.photo2}');background-size:cover;background-position:center;"></div>
        <div id="ph_f3" style="position:absolute;inset:0;background-image:url('${images.photo3}');background-size:cover;background-position:center;"></div>
        <!-- Content -->
        <div style="text-align:center;position:relative;z-index:2;">
          <p style="font-family:${SF};font-size:130px;font-weight:900;color:#fff;margin:0;line-height:1;"><span id="c2_num"></span></p>
          <p id="c2_label" style="font-family:${SF};font-size:34px;font-weight:500;color:rgba(255,255,255,0.9);margin:20px 0 0;letter-spacing:0.01em;">photos taken this month</p>
        </div>
      </div>

      <!-- CARD 3: 23 models — purple gradient -->
      <div id="card3" class="card" style="background:linear-gradient(160deg, #833AB4 0%, #6d2d97 40%, #1a1a1a 100%);">
        <div style="text-align:center;">
          <p style="font-family:${SF};font-size:130px;font-weight:900;color:#fff;margin:0;line-height:1;"><span id="c3_num"></span></p>
          <p id="c3_label" style="font-family:${SF};font-size:34px;font-weight:500;color:rgba(255,255,255,0.9);margin:20px 0 0;letter-spacing:0.01em;">models discovered</p>
          <p id="c3_sub" style="font-family:${SF};font-size:26px;font-weight:400;color:rgba(255,255,255,0.55);margin:12px 0 0;">and counting...</p>
        </div>
      </div>

      <!-- CARD 4: 60 seconds — blue gradient -->
      <div id="card4" class="card" style="background:linear-gradient(160deg, #405DE6 0%, #3451c7 40%, #1a1a1a 100%);">
        <div style="text-align:center;">
          <p id="c4_num" style="font-family:${SF};font-size:140px;font-weight:900;color:#fff;margin:0;line-height:1;">60</p>
          <p id="c4_label" style="font-family:${SF};font-size:34px;font-weight:500;color:rgba(255,255,255,0.9);margin:20px 0 0;letter-spacing:0.01em;">seconds to sign up</p>
          <p id="c4_sub" style="font-family:${SF};font-size:26px;font-weight:400;color:rgba(255,255,255,0.55);margin:12px 0 0;">that's it. seriously.</p>
        </div>
      </div>

      <!-- CARD 5: Photo collage showcase -->
      <div id="card5" class="card" style="background:#000;justify-content:flex-end;padding-bottom:${SAFE_BOTTOM + 80}px;">
        <div style="position:relative;width:900px;height:880px;margin-bottom:40px;">
          <!-- Photo 1 — tilted left -->
          <div id="ph_c1" style="position:absolute;left:0;top:60px;width:520px;height:700px;border-radius:18px;overflow:hidden;--rot:rotate(-5deg);box-shadow:0 20px 60px rgba(0,0,0,0.6);">
            <img src="${images.photo1}" style="width:100%;height:100%;object-fit:cover;object-position:center 20%;display:block;"/>
          </div>
          <!-- Photo 2 — center, on top -->
          <div id="ph_c2" style="position:absolute;left:180px;top:0;width:520px;height:700px;border-radius:18px;overflow:hidden;--rot:rotate(0deg);box-shadow:0 20px 60px rgba(0,0,0,0.7);z-index:2;">
            <img src="${images.photo2}" style="width:100%;height:100%;object-fit:cover;object-position:center;display:block;"/>
          </div>
          <!-- Photo 3 — tilted right -->
          <div id="ph_c3" style="position:absolute;right:0;top:60px;width:520px;height:700px;border-radius:18px;overflow:hidden;--rot:rotate(5deg);box-shadow:0 20px 60px rgba(0,0,0,0.6);">
            <img src="${images.photo3}" style="width:100%;height:100%;object-fit:cover;object-position:center;display:block;"/>
          </div>
        </div>
        <p id="c5_credit" style="font-family:${SF};font-size:30px;font-weight:500;color:rgba(255,255,255,0.7);text-align:center;letter-spacing:0.02em;">shot by @madebyaidan</p>
      </div>

      <!-- CARD 6: Your next shoot NOW — pink gradient -->
      <div id="card6" class="card" style="background:linear-gradient(160deg, #C13584 0%, #a12d70 40%, #1a1a1a 100%);">
        <div style="text-align:center;">
          <p id="c6_next" style="font-family:${SF};font-size:42px;font-weight:600;color:rgba(255,255,255,0.85);margin:0 0 10px;letter-spacing:0.01em;">Your next shoot:</p>
          <p id="c6_now" style="font-family:${SF};font-size:150px;font-weight:900;color:#fff;margin:0;line-height:0.9;animation:nowPulse 1.5s ease-in-out 14s infinite;">NOW</p>
          <p id="c6_signup" style="font-family:${SF};font-size:30px;font-weight:400;color:rgba(255,255,255,0.6);margin:24px 0 0;">sign up below</p>
        </div>
      </div>

      <!-- CARD 7: MANILA flash — black with red glow -->
      <div id="card7" class="card" style="background:#000;">
        <div style="text-align:center;">
          <p id="c7_manila" style="font-family:${SF};font-size:160px;font-weight:900;letter-spacing:0.1em;color:${MANILA_COLOR};margin:0;text-transform:uppercase;line-height:1;animation:glowPulse 2s ease-in-out 16s infinite;">MANILA</p>
          <p id="c7_sub" style="font-family:${SF};font-size:42px;font-weight:600;color:#fff;margin:24px 0 0;letter-spacing:0.04em;">Model Search</p>
          <p id="c7_cta" style="font-family:${SF};font-size:28px;font-weight:400;color:rgba(255,255,255,0.55);margin:16px 0 0;">Sign up below</p>
        </div>
      </div>

    </div>
  </body>
</html>`
}

async function render() {
  resetOutputDir()

  const selection = {
    photo1: 'manila-gallery-dsc-0075.jpg',
    photo2: 'manila-gallery-graffiti-001.jpg',
    photo3: 'manila-gallery-floor-001.jpg',
    photo4: 'manila-gallery-closeup-001.jpg',
  }

  writeSources({ selected: selection })

  const images = Object.fromEntries(
    Object.entries(selection).map(([key, file]) => [key, readImage(file)])
  )

  console.log('Recording Spotify Wrapped stat cards animation as MP4...')

  const TOTAL_DURATION_MS = 20000

  const browser = await chromium.launch()
  const videoCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: OUT_DIR,
      size: { width: WIDTH, height: HEIGHT }
    }
  })

  const videoPage = await videoCtx.newPage()
  const html = buildSpotifyWrapped(images)
  await videoPage.setContent(html, { waitUntil: 'load' })
  await videoPage.waitForTimeout(500)
  await videoPage.waitForTimeout(TOTAL_DURATION_MS)

  await videoPage.close()
  await videoCtx.close()

  const videoFiles = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.webm'))
  if (videoFiles.length === 0) {
    console.error('No video file was generated!')
  } else {
    const srcVideo = path.join(OUT_DIR, videoFiles[0])
    const dstVideo = path.join(OUT_DIR, '01_spotify_wrapped_manila.mp4')

    const { execSync } = await import('child_process')
    try {
      execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${dstVideo}"`, {
        stdio: 'pipe'
      })
      fs.unlinkSync(srcVideo)
      console.log('Rendered 01_spotify_wrapped_manila.mp4')
    } catch (err) {
      console.warn('ffmpeg not available, keeping as webm...')
      fs.renameSync(srcVideo, dstVideo)
      console.log('Rendered 01_spotify_wrapped_manila.mp4 (webm container)')
    }
  }

  await browser.close()
  console.log(`Done: 1 animated MP4 written to ${OUT_DIR}`)
}

render().catch(error => {
  console.error(error)
  process.exit(1)
})
