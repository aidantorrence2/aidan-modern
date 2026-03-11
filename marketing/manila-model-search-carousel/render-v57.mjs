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

const TOTAL_DURATION = 17
const TOTAL_DURATION_MS = 19000

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

const p = (t) => ((t / TOTAL_DURATION) * 100).toFixed(1)

function buildAnimated(images) {
  // Timeline
  const T = {
    cardAppear: 0.3,
    shimmer: 0.5,
    mainPhotoDrop: 3.0,
    grid1: 5.0,
    grid2: 5.8,
    grid3: 6.6,
    grid4: 7.4,
    bioType: 8.0,
    statsIn: 10.0,
    verified: 12.0,
    toast: 14.0,
    fadeOut: 15.5,
  }

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

      @keyframes fadeToBlack {
        0% { opacity: 0; }
        100% { opacity: 1; }
      }

      @keyframes buildingDots {
        0% { content: ''; }
        25% { content: '.'; }
        50% { content: '..'; }
        75% { content: '...'; }
        100% { content: ''; }
      }

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
    </style>
  </head>
  <body>
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#111;">

      <!-- Status text at top -->
      <div style="position:absolute;left:0;right:0;top:80px;text-align:center;z-index:10;opacity:0;animation:fadeSlideUp 0.6s ease-out ${T.cardAppear}s forwards;">
        <p style="font-family:${SF};font-size:28px;font-weight:400;color:rgba(255,255,255,0.5);letter-spacing:0.06em;">Building your portfolio...</p>
      </div>

      <!-- Profile Card -->
      <div style="position:absolute;left:50px;right:50px;top:160px;bottom:${SAFE_BOTTOM + 30}px;background:#1a1a1a;border-radius:20px;border:1px solid #333;overflow:hidden;opacity:0;animation:cardSlideUp 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) ${T.cardAppear}s forwards;">

        <!-- Profile header area -->
        <div style="padding:36px 36px 0;">

          <!-- Name skeleton / text -->
          <div style="position:relative;height:44px;margin-bottom:12px;">
            <!-- Skeleton bar (fades out when photo drops) -->
            <div class="shimmer-bar" style="width:280px;height:36px;position:absolute;top:4px;left:0;animation:shimmer 1.5s infinite linear, shimmerFadeOut 0.3s ease-out ${T.mainPhotoDrop}s forwards;"></div>
            <!-- Name text (appears when photo drops) -->
            <p style="font-family:${SF};font-size:36px;font-weight:700;color:#fff;letter-spacing:0.02em;position:absolute;top:0;left:0;opacity:0;animation:fadeSlideUp 0.5s ease-out ${T.mainPhotoDrop + 0.2}s forwards;">Your Name Here</p>
          </div>

          <!-- Location skeleton -->
          <div style="position:relative;height:24px;margin-bottom:28px;">
            <div class="shimmer-bar" style="width:160px;height:18px;position:absolute;top:3px;left:0;animation:shimmer 1.5s infinite linear, shimmerFadeOut 0.3s ease-out ${T.mainPhotoDrop}s forwards;"></div>
            <p style="font-family:${SF};font-size:20px;font-weight:400;color:rgba(255,255,255,0.4);position:absolute;top:0;left:0;opacity:0;animation:fadeSlideUp 0.5s ease-out ${T.mainPhotoDrop + 0.3}s forwards;">Manila, Philippines</p>
          </div>

          <!-- Main photo slot -->
          <div style="width:100%;aspect-ratio:4/5;border-radius:16px;overflow:hidden;position:relative;margin-bottom:24px;">
            <!-- Skeleton placeholder -->
            <div class="shimmer-bar" style="position:absolute;inset:0;border-radius:16px;animation:shimmer 1.5s infinite linear, shimmerFadeOut 0.3s ease-out ${T.mainPhotoDrop}s forwards;"></div>
            <!-- Actual photo -->
            <div class="photo-crop" style="position:absolute;inset:0;border-radius:16px;opacity:0;transform:scale(0.3);animation:photoPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${T.mainPhotoDrop}s forwards;">
              <img src="${images.main}" style="object-position:center 15%;"/>
            </div>
          </div>

          <!-- 2x2 Grid -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:28px;">
            ${[images.grid1, images.grid2, images.grid3, images.grid4].map((img, i) => {
              const delay = T.grid1 + i * 0.8
              return `<div style="aspect-ratio:1;border-radius:12px;overflow:hidden;position:relative;">
                <div class="shimmer-bar" style="position:absolute;inset:0;border-radius:12px;animation:shimmer 1.5s infinite linear, shimmerFadeOut 0.3s ease-out ${delay}s forwards;"></div>
                <div class="photo-crop" style="position:absolute;inset:0;border-radius:12px;opacity:0;transform:scale(0.3);animation:photoPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}s forwards;">
                  <img src="${img}" style="object-position:center 20%;"/>
                </div>
              </div>`
            }).join('\n')}
          </div>

          <!-- Bio text (types in) -->
          <div style="margin-bottom:20px;height:32px;position:relative;">
            <div style="overflow:hidden;white-space:nowrap;opacity:0;animation:fadeSlideUp 0.1s ease-out ${T.bioType}s forwards;">
              <p style="font-family:${SF};font-size:24px;font-weight:400;color:rgba(255,255,255,0.7);overflow:hidden;white-space:nowrap;width:0;animation:typeIn 1.8s steps(35) ${T.bioType + 0.1}s forwards;border-right:2px solid rgba(255,255,255,0.5);">Shot by @${HANDLE} in Manila</p>
            </div>
          </div>

          <!-- Stats -->
          <div style="display:flex;gap:20px;align-items:center;margin-bottom:24px;opacity:0;animation:fadeSlideUp 0.6s ease-out ${T.statsIn}s forwards;">
            <span style="font-family:${SF};font-size:20px;font-weight:600;color:rgba(255,255,255,0.85);">5 photos</span>
            <span style="font-family:${SF};font-size:20px;color:rgba(255,255,255,0.3);">·</span>
            <span style="font-family:${SF};font-size:20px;font-weight:600;color:rgba(255,255,255,0.85);">1 session</span>
            <span style="font-family:${SF};font-size:20px;color:rgba(255,255,255,0.3);">·</span>
            <span style="font-family:${SF};font-size:20px;font-weight:600;color:rgba(255,255,255,0.85);">0 exp needed</span>
          </div>

          <!-- Verified Badge -->
          <div style="display:inline-flex;align-items:center;gap:10px;background:rgba(76,175,80,0.12);border:1px solid rgba(76,175,80,0.3);border-radius:30px;padding:10px 24px;opacity:0;transform:scale(0.5);animation:badgeGlow 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${T.verified}s forwards, glowPulse 2s ease-in-out ${T.verified + 0.6}s infinite;">
            <span style="font-family:${SF};font-size:22px;font-weight:700;color:#4CAF50;letter-spacing:0.08em;">VERIFIED ✓</span>
          </div>

        </div>
      </div>

      <!-- Toast notification -->
      <div style="position:absolute;left:40px;right:40px;top:90px;z-index:20;opacity:0;transform:translateY(-100px);animation:toastSlide 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) ${T.toast}s forwards;">
        <div style="background:rgba(30,30,30,0.95);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-radius:16px;padding:20px 28px;border:1px solid rgba(255,255,255,0.1);display:flex;align-items:center;gap:14px;">
          <span style="font-size:32px;">🔥</span>
          <p style="font-family:${SF};font-size:22px;font-weight:600;color:rgba(255,255,255,0.9);margin:0;">47 people viewed your portfolio today</p>
        </div>
      </div>

      <!-- Fade to black overlay -->
      <div style="position:absolute;inset:0;background:#000;z-index:30;pointer-events:none;opacity:0;animation:fadeToBlack 0.8s ease-out ${T.fadeOut}s forwards;"></div>

    </div>
  </body>
</html>`
}

function buildCTA(images) {
  function cropImg(src, w, h, pos = 'center 20%') {
    return `<div style="width:${w}px;height:${h}px;overflow:hidden;border-radius:16px;box-shadow:0 8px 40px rgba(0,0,0,0.5);">
      <img src="${src}" style="width:130%;height:130%;object-fit:cover;object-position:${pos};display:block;margin:-15% 0 0 -15%;"/>
    </div>`
  }

  return `<!DOCTYPE html><html><head>
    <style>* { box-sizing:border-box;margin:0;padding:0; } html,body { background:#000; -webkit-font-smoothing:antialiased; }</style>
  </head><body>
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#000;">

      <!-- Photo grid — 3 photos staggered -->
      <div style="position:absolute;top:120px;left:50px;transform:rotate(-3deg);">
        ${cropImg(images.ctaPhoto1, 460, 620, 'center 20%')}
      </div>
      <div style="position:absolute;top:180px;right:50px;transform:rotate(2.5deg);">
        ${cropImg(images.ctaPhoto2, 420, 560, 'center 25%')}
      </div>
      <div style="position:absolute;top:620px;left:280px;transform:rotate(-1deg);z-index:5;">
        ${cropImg(images.ctaPhoto3, 500, 380, 'center 30%')}
      </div>

      <!-- Dark gradient overlay -->
      <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 20%, rgba(0,0,0,0.0) 35%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.95) 72%, #000 85%);"></div>

      <!-- Text content above SAFE_BOTTOM -->
      <div style="position:absolute;left:0;right:0;bottom:${SAFE_BOTTOM + 40}px;padding:0 70px;text-align:center;">

        <!-- Thin red accent line -->
        <div style="width:50px;height:3px;background:${MANILA_COLOR};margin:0 auto 30px;"></div>

        <!-- MANILA — 180px -->
        <p style="font-family:${SF};font-size:180px;font-weight:900;letter-spacing:0.14em;color:#fff;margin:0;text-transform:uppercase;text-shadow:0 4px 80px rgba(232,68,58,0.4), 0 2px 20px rgba(0,0,0,0.8);">MANILA</p>

        <!-- MODEL SEARCH -->
        <p style="font-family:${SF};font-size:38px;font-weight:300;color:rgba(255,255,255,0.9);margin:4px 0 0;letter-spacing:0.3em;text-transform:uppercase;">MODEL SEARCH</p>

        <!-- Divider -->
        <div style="width:100px;height:1px;background:rgba(255,255,255,0.25);margin:36px auto;"></div>

        <!-- CTA button -->
        <div style="display:inline-block;background:${MANILA_COLOR};border-radius:40px;padding:20px 70px;box-shadow:0 6px 30px rgba(232,68,58,0.45);">
          <p style="font-family:${SF};font-size:26px;font-weight:700;color:#fff;margin:0;letter-spacing:0.1em;text-transform:uppercase;">SIGN UP NOW</p>
        </div>

        <!-- Subtext -->
        <p style="font-family:${SF};font-size:22px;font-weight:400;color:rgba(255,255,255,0.45);margin:22px 0 0;letter-spacing:0.04em;">60-second form · @${HANDLE}</p>
      </div>
    </div>
  </body></html>`
}

async function render() {
  resetOutputDir()

  const selection = {
    main: 'manila-gallery-garden-001.jpg',
    grid1: 'manila-gallery-purple-001.jpg',
    grid2: 'manila-gallery-graffiti-001.jpg',
    grid3: 'manila-gallery-canal-001.jpg',
    grid4: 'manila-gallery-night-001.jpg',
    ctaPhoto1: 'manila-gallery-purple-002.jpg',
    ctaPhoto2: 'manila-gallery-purple-003.jpg',
    ctaPhoto3: 'manila-gallery-garden-002.jpg',
  }

  writeSources({
    createdAt: new Date().toISOString(),
    strategy: 'v57 — Dating app profile build animated ad',
    safeBottomPixels: SAFE_BOTTOM,
    images: selection
  })

  const images = Object.fromEntries(
    Object.entries(selection).map(([key, file]) => [key, readImage(file)])
  )

  const { execSync } = await import('child_process')
  const browser = await chromium.launch()

  // --- Step 1: Record the profile build animation ---
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

  // --- Step 2: Render CTA as a high-quality screenshot ---
  console.log('Rendering CTA screenshot...')
  const ctaCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
  })
  const ctaPage = await ctaCtx.newPage()
  await ctaPage.setContent(buildCTA(images), { waitUntil: 'load' })
  await ctaPage.waitForTimeout(300)
  const ctaPath = path.join(OUT_DIR, 'cta_frame.png')
  await ctaPage.screenshot({ path: ctaPath })
  await ctaPage.close()
  await ctaCtx.close()
  await browser.close()

  // --- Step 3: Convert webm to mp4, then concat with CTA still frame ---
  const videoFiles = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.webm'))
  if (videoFiles.length === 0) {
    console.error('No video file was generated!')
    return
  }

  const srcVideo = path.join(OUT_DIR, videoFiles[0])
  const animMp4 = path.join(OUT_DIR, 'profile_part.mp4')
  const ctaMp4 = path.join(OUT_DIR, 'cta_part.mp4')
  const finalMp4 = path.join(OUT_DIR, '01_profile_build.mp4')
  const concatFile = path.join(OUT_DIR, 'concat.txt')

  try {
    // Convert animation webm to mp4
    execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${animMp4}"`, { stdio: 'pipe' })

    // Create 5-second CTA video from static image
    execSync(`ffmpeg -y -loop 1 -i "${ctaPath}" -c:v libx264 -t 5 -pix_fmt yuv420p -r 30 -vf "scale=${WIDTH}:${HEIGHT}" -an "${ctaMp4}"`, { stdio: 'pipe' })

    // Concat animation + CTA
    fs.writeFileSync(concatFile, `file '${animMp4}'\nfile '${ctaMp4}'\n`)
    execSync(`ffmpeg -y -f concat -safe 0 -i "${concatFile}" -c copy "${finalMp4}"`, { stdio: 'pipe' })

    // Cleanup temp files
    fs.unlinkSync(srcVideo)
    fs.unlinkSync(animMp4)
    fs.unlinkSync(ctaMp4)
    fs.unlinkSync(concatFile)
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
