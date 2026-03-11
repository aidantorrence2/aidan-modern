import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v47')

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 410

const SF = "-apple-system, 'Helvetica Neue', Arial, sans-serif"

const NOTES_BG = '#1C1C1E'
const NOTES_YELLOW = '#FFD60A'
const NOTES_WHITE = '#FFFFFF'
const NOTES_BODY = '#E5E5EA'
const NOTES_GRAY = '#8E8E93'
const MANILA_COLOR = '#E8443A'

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

function buildNotesAd(images) {
  const p = (t) => ((t / TOTAL_DURATION) * 100).toFixed(2)

  // Scroll keyframes — start scrolling at ~10s when photos appear
  const scrollKeyframes = `
    0% { transform: translateY(0); }
    ${p(9.8)}% { transform: translateY(0); }
    ${p(11.0)}% { transform: translateY(-320px); }
    ${p(12.5)}% { transform: translateY(-700px); }
    ${p(13.5)}% { transform: translateY(-900px); }
    ${p(14.3)}% { transform: translateY(-1020px); }
    ${p(14.4)}% { transform: translateY(-1020px); }
    100% { transform: translateY(-1020px); }
  `

  return `<!DOCTYPE html>
<html>
<head>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      margin: 0; padding: 0;
      background: ${NOTES_BG};
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    /* --- Typing cursor --- */
    @keyframes cursorBlink {
      0%, 49% { opacity: 1; }
      50%, 100% { opacity: 0; }
    }
    .cursor {
      display: inline-block;
      width: 2px;
      height: 1.1em;
      background: ${NOTES_YELLOW};
      vertical-align: middle;
      margin-left: 2px;
      animation: cursorBlink 0.6s step-end infinite;
    }

    /* --- Fade-in for lines --- */
    @keyframes fadeInUp {
      0% { opacity: 0; transform: translateY(10px); }
      100% { opacity: 1; transform: translateY(0); }
    }

    /* --- Checkbox check animation --- */
    @keyframes checkFill {
      0% { opacity: 0; transform: scale(0.5); }
      60% { transform: scale(1.15); }
      100% { opacity: 1; transform: scale(1); }
    }

    /* --- Photo slide in from bottom with bounce --- */
    @keyframes photoSlideIn {
      0% { opacity: 0; transform: translateY(60px) scale(0.92); }
      65% { transform: translateY(-8px) scale(1.01); }
      100% { opacity: 1; transform: translateY(0) scale(1); }
    }

    /* --- MANILA flash --- */
    @keyframes manilaFlash {
      0% { opacity: 0; }
      15% { opacity: 1; }
      100% { opacity: 1; }
    }
    @keyframes manilaTextIn {
      0% { opacity: 0; transform: scale(0.92); letter-spacing: 0.15em; }
      60% { opacity: 1; transform: scale(1.02); }
      100% { opacity: 1; transform: scale(1); letter-spacing: 0.08em; }
    }
    @keyframes glowPulse {
      0%, 100% { text-shadow: 0 0 30px rgba(232,68,58,0.35), 0 0 60px rgba(232,68,58,0.15); }
      50% { text-shadow: 0 0 55px rgba(232,68,58,0.55), 0 0 110px rgba(232,68,58,0.25); }
    }
    @keyframes subtextIn {
      0% { opacity: 0; transform: translateY(10px); }
      100% { opacity: 1; transform: translateY(0); }
    }

    /* --- Scroll container --- */
    @keyframes chatScroll {
      ${scrollKeyframes}
    }
    .notes-scroll {
      animation: chatScroll ${TOTAL_DURATION}s ease-in-out 0s forwards;
    }
  </style>
</head>
<body>
  <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${NOTES_BG};">

    <!-- Status bar -->
    <div style="position:absolute;left:0;right:0;top:0;height:54px;padding:14px 36px 0;display:flex;align-items:center;justify-content:space-between;z-index:20;">
      <span style="font-family:${SF};font-size:20px;font-weight:600;color:${NOTES_WHITE};">9:41</span>
      <div style="display:flex;align-items:center;gap:7px;">
        <svg width="20" height="14" viewBox="0 0 18 12"><rect x="0" y="3" width="3" height="9" rx="1" fill="${NOTES_WHITE}"/><rect x="5" y="2" width="3" height="10" rx="1" fill="${NOTES_WHITE}"/><rect x="10" y="0" width="3" height="12" rx="1" fill="${NOTES_WHITE}"/><rect x="15" y="0" width="3" height="12" rx="1" fill="${NOTES_WHITE}" opacity="0.3"/></svg>
        <svg width="30" height="15" viewBox="0 0 27 13"><rect x="0" y="0" width="23" height="13" rx="3.5" stroke="${NOTES_WHITE}" stroke-width="1" fill="none"/><rect x="2" y="2" width="18" height="9" rx="2" fill="${NOTES_WHITE}"/></svg>
      </div>
    </div>

    <!-- Notes top bar -->
    <div style="position:absolute;left:0;right:0;top:54px;height:72px;padding:0 28px;display:flex;align-items:center;justify-content:space-between;z-index:20;background:${NOTES_BG};">
      <!-- Back button -->
      <div style="display:flex;align-items:center;gap:4px;">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="${NOTES_YELLOW}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <span style="font-family:${SF};font-size:22px;color:${NOTES_YELLOW};font-weight:400;">Notes</span>
      </div>
      <!-- Right icons: share + ellipsis -->
      <div style="display:flex;align-items:center;gap:24px;">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98M21 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM9 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM21 19a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" stroke="${NOTES_YELLOW}" stroke-width="1.8" stroke-linecap="round"/></svg>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><circle cx="5" cy="12" r="1.5" fill="${NOTES_YELLOW}"/><circle cx="12" cy="12" r="1.5" fill="${NOTES_YELLOW}"/><circle cx="19" cy="12" r="1.5" fill="${NOTES_YELLOW}"/></svg>
      </div>
    </div>

    <!-- Thin separator -->
    <div style="position:absolute;left:0;right:0;top:126px;height:1px;background:rgba(255,255,255,0.08);z-index:20;"></div>

    <!-- Top fade -->
    <div style="position:absolute;left:0;right:0;top:127px;height:50px;background:linear-gradient(180deg,${NOTES_BG},transparent);z-index:15;pointer-events:none;"></div>

    <!-- Scrollable notes body -->
    <div style="position:absolute;left:0;right:0;top:127px;bottom:${SAFE_BOTTOM + 90}px;overflow:hidden;">
      <div class="notes-scroll" style="padding:32px 40px 500px 40px;">

        <!-- Note title typed out -->
        <div style="
          opacity:0;
          animation: fadeInUp 0.4s ease-out 0.3s forwards;
          margin-bottom: 28px;
        ">
          <span style="font-family:${SF};font-size:36px;font-weight:700;color:${NOTES_WHITE};line-height:1.2;">manila model shoot checklist ✨</span>
        </div>

        <!-- Date / metadata line -->
        <div style="
          opacity:0;
          animation: fadeInUp 0.3s ease-out 0.7s forwards;
          margin-bottom: 36px;
        ">
          <span style="font-family:${SF};font-size:18px;color:${NOTES_GRAY};">Today  9:41 AM</span>
        </div>

        <!-- CHECKLIST ITEMS -->

        <!-- Item 1: find a photographer -->
        <div style="margin-bottom:18px;">
          <!-- Row: checkbox + text -->
          <div style="display:flex;align-items:center;gap:16px;
            opacity:0;animation:fadeInUp 0.35s ease-out 1.5s forwards;">
            <!-- Unchecked circle -->
            <div id="cb1" style="width:28px;height:28px;border-radius:50%;border:2px solid ${NOTES_YELLOW};flex-shrink:0;display:flex;align-items:center;justify-content:center;position:relative;">
              <!-- Filled check — appears at 3s -->
              <div style="
                position:absolute;inset:0;border-radius:50%;background:${NOTES_YELLOW};
                display:flex;align-items:center;justify-content:center;
                opacity:0;
                animation:checkFill 0.3s cubic-bezier(0.34,1.56,0.64,1) 3s forwards;
              ">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8.5l3.5 3.5 6.5-7" stroke="#1C1C1E" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>
            <span style="font-family:${SF};font-size:26px;color:${NOTES_BODY};line-height:1.3;">find a photographer</span>
          </div>
          <!-- Sub-text -->
          <div style="padding-left:44px;margin-top:4px;
            opacity:0;animation:fadeInUp 0.3s ease-out 3.2s forwards;">
            <span style="font-family:${SF};font-size:20px;color:${NOTES_GRAY};">@madebyaidan — he directs everything</span>
          </div>
        </div>

        <!-- Item 2: sign up -->
        <div style="margin-bottom:18px;">
          <div style="display:flex;align-items:center;gap:16px;
            opacity:0;animation:fadeInUp 0.35s ease-out 2.0s forwards;">
            <div style="width:28px;height:28px;border-radius:50%;border:2px solid ${NOTES_YELLOW};flex-shrink:0;display:flex;align-items:center;justify-content:center;position:relative;">
              <div style="
                position:absolute;inset:0;border-radius:50%;background:${NOTES_YELLOW};
                display:flex;align-items:center;justify-content:center;
                opacity:0;
                animation:checkFill 0.3s cubic-bezier(0.34,1.56,0.64,1) 4.5s forwards;
              ">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8.5l3.5 3.5 6.5-7" stroke="#1C1C1E" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>
            <span style="font-family:${SF};font-size:26px;color:${NOTES_BODY};line-height:1.3;">sign up</span>
          </div>
          <div style="padding-left:44px;margin-top:4px;
            opacity:0;animation:fadeInUp 0.3s ease-out 4.7s forwards;">
            <span style="font-family:${SF};font-size:20px;color:${NOTES_GRAY};">took 60 seconds lol</span>
          </div>
        </div>

        <!-- Item 3: plan the vibe -->
        <div style="margin-bottom:18px;">
          <div style="display:flex;align-items:center;gap:16px;
            opacity:0;animation:fadeInUp 0.35s ease-out 2.5s forwards;">
            <div style="width:28px;height:28px;border-radius:50%;border:2px solid ${NOTES_YELLOW};flex-shrink:0;display:flex;align-items:center;justify-content:center;position:relative;">
              <div style="
                position:absolute;inset:0;border-radius:50%;background:${NOTES_YELLOW};
                display:flex;align-items:center;justify-content:center;
                opacity:0;
                animation:checkFill 0.3s cubic-bezier(0.34,1.56,0.64,1) 6s forwards;
              ">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8.5l3.5 3.5 6.5-7" stroke="#1C1C1E" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>
            <span style="font-family:${SF};font-size:26px;color:${NOTES_BODY};line-height:1.3;">plan the vibe</span>
          </div>
          <div style="padding-left:44px;margin-top:4px;
            opacity:0;animation:fadeInUp 0.3s ease-out 6.2s forwards;">
            <span style="font-family:${SF};font-size:20px;color:${NOTES_GRAY};">he messaged me back same day</span>
          </div>
        </div>

        <!-- Item 4: show up to shoot -->
        <div style="margin-bottom:18px;">
          <div style="display:flex;align-items:center;gap:16px;
            opacity:0;animation:fadeInUp 0.35s ease-out 3.1s forwards;">
            <div style="width:28px;height:28px;border-radius:50%;border:2px solid ${NOTES_YELLOW};flex-shrink:0;display:flex;align-items:center;justify-content:center;position:relative;">
              <div style="
                position:absolute;inset:0;border-radius:50%;background:${NOTES_YELLOW};
                display:flex;align-items:center;justify-content:center;
                opacity:0;
                animation:checkFill 0.3s cubic-bezier(0.34,1.56,0.64,1) 7.5s forwards;
              ">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8.5l3.5 3.5 6.5-7" stroke="#1C1C1E" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>
            <span style="font-family:${SF};font-size:26px;color:${NOTES_BODY};line-height:1.3;">show up to shoot</span>
          </div>
          <div style="padding-left:44px;margin-top:4px;
            opacity:0;animation:fadeInUp 0.3s ease-out 7.7s forwards;">
            <span style="font-family:${SF};font-size:20px;color:${NOTES_GRAY};">literally just had to exist</span>
          </div>
        </div>

        <!-- Item 5: get photos back -->
        <div style="margin-bottom:36px;">
          <div style="display:flex;align-items:center;gap:16px;
            opacity:0;animation:fadeInUp 0.35s ease-out 3.7s forwards;">
            <div style="width:28px;height:28px;border-radius:50%;border:2px solid ${NOTES_YELLOW};flex-shrink:0;display:flex;align-items:center;justify-content:center;position:relative;">
              <div style="
                position:absolute;inset:0;border-radius:50%;background:${NOTES_YELLOW};
                display:flex;align-items:center;justify-content:center;
                opacity:0;
                animation:checkFill 0.3s cubic-bezier(0.34,1.56,0.64,1) 9s forwards;
              ">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8.5l3.5 3.5 6.5-7" stroke="#1C1C1E" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>
            <span style="font-family:${SF};font-size:26px;color:${NOTES_BODY};line-height:1.3;">get photos back</span>
          </div>
          <div style="padding-left:44px;margin-top:4px;
            opacity:0;animation:fadeInUp 0.3s ease-out 9.2s forwards;">
            <span style="font-family:${SF};font-size:20px;color:${NOTES_GRAY};">1 week. and they're INSANE</span>
          </div>
        </div>

        <!-- Photo 1: graffiti — appears at 10s, slight rotation like pasted in -->
        <div style="
          margin-bottom:24px;
          opacity:0;
          animation:photoSlideIn 0.55s cubic-bezier(0.34,1.46,0.64,1) 10s forwards;
          transform-origin: center;
        ">
          <div style="
            width:600px;
            border-radius:18px;
            overflow:hidden;
            transform:rotate(-1.5deg);
            box-shadow:0 8px 40px rgba(0,0,0,0.6);
          ">
            <img src="${images.photo1}" style="width:100%;display:block;object-fit:cover;object-position:center;max-height:440px;" />
          </div>
        </div>

        <!-- Photo 2: floor — appears at 11.5s, different rotation -->
        <div style="
          margin-bottom:36px;
          opacity:0;
          animation:photoSlideIn 0.55s cubic-bezier(0.34,1.46,0.64,1) 11.5s forwards;
          transform-origin: center;
        ">
          <div style="
            width:600px;
            border-radius:18px;
            overflow:hidden;
            transform:rotate(1.2deg);
            box-shadow:0 8px 40px rgba(0,0,0,0.6);
          ">
            <img src="${images.photo2}" style="width:100%;display:block;object-fit:cover;object-position:center;max-height:440px;" />
          </div>
        </div>

        <!-- Text lines after photos -->
        <div style="margin-bottom:10px;
          opacity:0;animation:fadeInUp 0.35s ease-out 13s forwards;">
          <span style="font-family:${SF};font-size:26px;color:${NOTES_BODY};">10/10 would recommend</span>
        </div>

        <div style="margin-bottom:8px;
          opacity:0;animation:fadeInUp 0.35s ease-out 13.5s forwards;">
          <span style="font-family:${SF};font-size:26px;color:${NOTES_BODY};">sign up → </span><span style="font-family:${SF};font-size:26px;color:${NOTES_YELLOW};">@madebyaidan</span>
          <span class="cursor" style="animation-delay:0s;opacity:0;animation:cursorBlink 0.6s step-end 13.5s infinite;"></span>
        </div>

      </div>
    </div>

    <!-- Bottom fade -->
    <div style="position:absolute;left:0;right:0;bottom:${SAFE_BOTTOM + 90}px;height:70px;background:linear-gradient(0deg,${NOTES_BG},transparent);z-index:15;pointer-events:none;"></div>

    <!-- iOS keyboard hint bar -->
    <div style="position:absolute;left:0;right:0;bottom:${SAFE_BOTTOM}px;height:90px;background:#2C2C2E;z-index:20;display:flex;flex-direction:column;">
      <!-- Suggestion strip -->
      <div style="height:44px;display:flex;align-items:center;justify-content:space-around;border-bottom:1px solid rgba(255,255,255,0.08);padding:0 12px;">
        <span style="font-family:${SF};font-size:19px;color:${NOTES_BODY};opacity:0.7;">"the"</span>
        <div style="width:1px;height:24px;background:rgba(255,255,255,0.12);"></div>
        <span style="font-family:${SF};font-size:19px;color:${NOTES_BODY};opacity:0.7;">"and"</span>
        <div style="width:1px;height:24px;background:rgba(255,255,255,0.12);"></div>
        <span style="font-family:${SF};font-size:19px;color:${NOTES_BODY};opacity:0.7;">"to"</span>
      </div>
      <!-- Keyboard grab bar indicator -->
      <div style="flex:1;display:flex;align-items:center;justify-content:center;">
        <div style="width:130px;height:5px;border-radius:3px;background:rgba(255,255,255,0.25);"></div>
      </div>
    </div>

    <!-- MANILA flash overlay — appears at 14.5s -->
    <div style="
      position:absolute;inset:0;
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      background:#000;z-index:30;pointer-events:none;
      opacity:0;
      animation:manilaFlash 0.45s ease-out 14.5s forwards;
    ">
      <p style="
        font-family:${SF};font-size:160px;font-weight:900;
        letter-spacing:0.08em;color:${MANILA_COLOR};
        margin:0;text-transform:uppercase;
        opacity:0;
        animation:manilaTextIn 0.65s cubic-bezier(0.16,1,0.3,1) 14.6s forwards, glowPulse 3s ease-in-out 15.3s infinite;
      ">MANILA</p>
      <p style="
        font-family:${SF};font-size:40px;font-weight:600;color:${NOTES_WHITE};
        margin:20px 0 0;letter-spacing:0.04em;
        opacity:0;
        animation:subtextIn 0.45s ease-out 15.0s forwards;
      ">Model Search</p>
      <p style="
        font-family:${SF};font-size:26px;color:${NOTES_GRAY};
        margin:14px 0 0;
        opacity:0;
        animation:subtextIn 0.45s ease-out 15.3s forwards;
      ">Sign up below</p>
    </div>

  </div>
</body>
</html>`
}

async function render() {
  resetOutputDir()

  const selection = {
    photo1: 'manila-gallery-graffiti-001.jpg',
    photo2: 'manila-gallery-floor-001.jpg',
  }

  const sources = {
    createdAt: new Date().toISOString(),
    strategy: 'v47 — Animated iPhone Notes app checklist ad for Manila Model Search',
    safeBottomPixels: SAFE_BOTTOM,
    images: selection,
  }
  fs.writeFileSync(path.join(OUT_DIR, 'sources.json'), JSON.stringify(sources, null, 2))

  const images = Object.fromEntries(
    Object.entries(selection).map(([key, file]) => [key, readImage(file)])
  )

  console.log('Recording Notes-style animated checklist ad as MP4...')

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
  const html = buildNotesAd(images)
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
    const dstVideo = path.join(OUT_DIR, '01_notes_checklist.mp4')

    const { execSync } = await import('child_process')
    try {
      execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${dstVideo}"`, {
        stdio: 'pipe'
      })
      fs.unlinkSync(srcVideo)
      console.log('Rendered 01_notes_checklist.mp4')
    } catch (err) {
      console.warn('ffmpeg not available, keeping as webm...')
      fs.renameSync(srcVideo, dstVideo)
      console.log('Rendered 01_notes_checklist.mp4 (webm container)')
    }
  }

  await browser.close()
  console.log(`Done: 1 animated MP4 written to ${OUT_DIR}`)
}

render().catch(error => {
  console.error(error)
  process.exit(1)
})
