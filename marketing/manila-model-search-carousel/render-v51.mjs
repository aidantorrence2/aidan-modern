import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v51')

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 410

const SF = "-apple-system, 'Helvetica Neue', Arial, sans-serif"

const MANILA_COLOR = '#E8443A'
const HANDLE = 'madebyaidan'

const TOTAL_DURATION = 18
const TOTAL_DURATION_MS = 20000

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
  // Notification timing (staggered 1-1.5s apart)
  const T = {
    notif1: 1.0,
    notif2: 2.5,
    notif3: 4.0,
    notif4: 5.5,
    notif5: 7.0,
    notif6: 8.5,
    fadeOut: 15.0,
  }

  function notification(id, appIcon, title, subtitle, time, delay, idx) {
    // Each notification slides up from bottom with iOS spring animation
    // Stacks push earlier ones up
    const pushUpAmount = 130 // height of each card + gap
    const pushKeyframes = []

    // Generate push-up keyframes for earlier notifications when later ones appear
    // This notification starts at its entry position and stays
    return `<div id="${id}" style="
      width: 1000px;
      margin: 0 auto 14px;
      background: rgba(255,255,255,0.15);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-radius: 20px;
      padding: 18px 22px;
      display: flex;
      align-items: flex-start;
      gap: 16px;
      opacity: 0;
      transform: translateY(40px);
      animation: notifIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}s forwards;
      border: 1px solid rgba(255,255,255,0.08);
    ">
      <!-- App icon -->
      <div style="width:48px;height:48px;border-radius:12px;overflow:hidden;flex-shrink:0;background:linear-gradient(135deg, #833AB4, #C13584, #E1306C, #F77737, #FCAF45);display:flex;align-items:center;justify-content:center;">
        <!-- Camera icon approximation -->
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="5" stroke="white" stroke-width="1.8" fill="none"/>
          <circle cx="12" cy="12" r="4.5" stroke="white" stroke-width="1.8" fill="none"/>
          <circle cx="18" cy="6" r="1.3" fill="white"/>
        </svg>
      </div>
      <!-- Content -->
      <div style="flex:1;min-width:0;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
          <span style="font-family:${SF};font-size:20px;font-weight:700;color:rgba(255,255,255,0.95);letter-spacing:0.01em;">Instagram</span>
          <span style="font-family:${SF};font-size:17px;color:rgba(255,255,255,0.5);">${time}</span>
        </div>
        <p style="font-family:${SF};font-size:22px;font-weight:600;color:rgba(255,255,255,0.9);margin:0 0 3px;line-height:1.3;">${title}</p>
        ${subtitle ? `<p style="font-family:${SF};font-size:21px;color:rgba(255,255,255,0.65);margin:0;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${subtitle}</p>` : ''}
      </div>
      ${images.thumb && idx === 1 ? `<div style="width:56px;height:56px;border-radius:8px;overflow:hidden;flex-shrink:0;margin-top:4px;"><img src="${images.thumb}" style="width:130%;height:130%;object-fit:cover;object-position:center 20%;display:block;margin:-15% 0 0 -15%;"/></div>` : ''}
    </div>`
  }

  const notifications = [
    notification('n1', '', `${HANDLE} sent you a message`, 'hey are you free for a photoshoot?', 'now', T.notif1, 0),
    notification('n2', '', `${HANDLE} sent a photo`, '', 'now', T.notif2, 1),
    notification('n3', '', `${HANDLE}`, 'these turned out INSANE \u{1F525}', 'now', T.notif3, 2),
    notification('n4', '', `${HANDLE} sent 5 photos`, '', 'now', T.notif4, 3),
    notification('n5', '', `${HANDLE}`, 'you should sign up for the next one', 'now', T.notif5, 4),
    notification('n6', '', `${HANDLE}`, '60 second form, link in bio', 'now', T.notif6, 5),
  ]

  // Scroll amount as notifications pile up
  const scrollKeyframes = `
    0% { transform: translateY(0); }
    ${p(T.notif1)}% { transform: translateY(0); }
    ${p(T.notif3)}% { transform: translateY(0); }
    ${p(T.notif4)}% { transform: translateY(-80px); }
    ${p(T.notif5)}% { transform: translateY(-200px); }
    ${p(T.notif6)}% { transform: translateY(-320px); }
    ${p(T.notif6 + 1)}% { transform: translateY(-320px); }
    100% { transform: translateY(-320px); }
  `

  return `<!DOCTYPE html>
<html>
  <head>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      html, body { margin: 0; padding: 0; background: #000; -webkit-font-smoothing: antialiased; }

      @keyframes notifIn {
        0% { opacity: 0; transform: translateY(60px) scale(0.95); }
        50% { opacity: 1; transform: translateY(-8px) scale(1.01); }
        70% { transform: translateY(3px) scale(0.995); }
        100% { opacity: 1; transform: translateY(0) scale(1); }
      }

      @keyframes fadeToBlack {
        0% { opacity: 0; }
        100% { opacity: 1; }
      }

      @keyframes notifScroll {
        ${scrollKeyframes}
      }
      .notif-scroll {
        animation: notifScroll ${TOTAL_DURATION}s ease-in-out 0s forwards;
      }

      @keyframes pulseGlow {
        0%, 100% { opacity: 0.3; }
        50% { opacity: 0.6; }
      }
    </style>
  </head>
  <body>
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;">

      <!-- Wallpaper (blurred manila gallery photo) -->
      <div style="position:absolute;inset:0;overflow:hidden;">
        <img src="${images.wallpaper}" style="width:120%;height:120%;object-fit:cover;object-position:center;display:block;margin:-10%;filter:blur(30px) brightness(0.4);"/>
      </div>

      <!-- Dark overlay for readability -->
      <div style="position:absolute;inset:0;background:rgba(0,0,0,0.25);"></div>

      <!-- Status bar -->
      <div style="position:absolute;left:0;right:0;top:0;height:54px;padding:14px 32px 0;display:flex;align-items:center;justify-content:space-between;z-index:20;">
        <div style="display:flex;align-items:center;gap:6px;">
          <!-- Lock icon -->
          <svg width="14" height="16" viewBox="0 0 14 16" fill="none">
            <rect x="1" y="7" width="12" height="8" rx="2" fill="white"/>
            <path d="M4 7V5a3 3 0 016 0v2" stroke="white" stroke-width="1.5" fill="none" stroke-linecap="round"/>
          </svg>
        </div>
        <div style="display:flex;align-items:center;gap:6px;">
          <svg width="20" height="14" viewBox="0 0 18 12"><rect x="0" y="3" width="3" height="9" rx="1" fill="#fff"/><rect x="5" y="2" width="3" height="10" rx="1" fill="#fff"/><rect x="10" y="0" width="3" height="12" rx="1" fill="#fff"/><rect x="15" y="0" width="3" height="12" rx="1" fill="#fff" opacity="0.3"/></svg>
          <svg width="18" height="14" viewBox="0 0 18 14"><path d="M1 11 Q9 -2 17 11" stroke="white" stroke-width="1.8" fill="none" opacity="0.3"/><path d="M4 11 Q9 2 14 11" stroke="white" stroke-width="1.8" fill="none" opacity="0.5"/><path d="M6.5 11 Q9 5.5 11.5 11" stroke="white" stroke-width="1.8" fill="none"/></svg>
          <svg width="30" height="15" viewBox="0 0 27 13"><rect x="0" y="0" width="23" height="13" rx="3.5" stroke="#fff" stroke-width="1" fill="none"/><rect x="2" y="2" width="18" height="9" rx="2" fill="#fff"/></svg>
        </div>
      </div>

      <!-- iOS Lock Screen Time Display -->
      <div style="position:absolute;left:0;right:0;top:140px;text-align:center;z-index:10;">
        <p style="font-family:${SF};font-size:24px;font-weight:400;color:rgba(255,255,255,0.7);margin:0 0 4px;letter-spacing:0.02em;">Tuesday, March 11</p>
        <p style="font-family:${SF};font-size:140px;font-weight:700;color:#fff;margin:0;line-height:1;letter-spacing:-0.02em;">9:41</p>
      </div>

      <!-- Notification stack area -->
      <div style="position:absolute;left:0;right:0;top:520px;bottom:${SAFE_BOTTOM}px;overflow:hidden;z-index:15;">
        <div class="notif-scroll" style="padding:20px 40px 400px;">
          ${notifications.join('\n')}
        </div>
      </div>

      <!-- Fade to black overlay at end -->
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
    wallpaper: 'manila-gallery-garden-001.jpg',
    thumb: 'manila-gallery-purple-001.jpg',
    ctaPhoto1: 'manila-gallery-purple-002.jpg',
    ctaPhoto2: 'manila-gallery-purple-003.jpg',
    ctaPhoto3: 'manila-gallery-graffiti-001.jpg',
  }

  writeSources({
    createdAt: new Date().toISOString(),
    strategy: 'v51 — iPhone lock screen notification flood ad',
    safeBottomPixels: SAFE_BOTTOM,
    images: selection
  })

  const images = Object.fromEntries(
    Object.entries(selection).map(([key, file]) => [key, readImage(file)])
  )

  const { execSync } = await import('child_process')
  const browser = await chromium.launch()

  // --- Step 1: Record the notification flood video ---
  console.log('Recording lock screen notification flood...')

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
  const chatMp4 = path.join(OUT_DIR, 'lockscreen_part.mp4')
  const ctaMp4 = path.join(OUT_DIR, 'cta_part.mp4')
  const finalMp4 = path.join(OUT_DIR, '01_lockscreen_notification_flood.mp4')
  const concatFile = path.join(OUT_DIR, 'concat.txt')

  try {
    // Convert lock screen webm to mp4
    execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${chatMp4}"`, { stdio: 'pipe' })

    // Create 5-second CTA video from static image
    execSync(`ffmpeg -y -loop 1 -i "${ctaPath}" -c:v libx264 -t 5 -pix_fmt yuv420p -r 30 -vf "scale=${WIDTH}:${HEIGHT}" -an "${ctaMp4}"`, { stdio: 'pipe' })

    // Concat lock screen + CTA
    fs.writeFileSync(concatFile, `file '${chatMp4}'\nfile '${ctaMp4}'\n`)
    execSync(`ffmpeg -y -f concat -safe 0 -i "${concatFile}" -c copy "${finalMp4}"`, { stdio: 'pipe' })

    // Cleanup temp files
    fs.unlinkSync(srcVideo)
    fs.unlinkSync(chatMp4)
    fs.unlinkSync(ctaMp4)
    fs.unlinkSync(concatFile)
    console.log('Rendered 01_lockscreen_notification_flood.mp4')
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
