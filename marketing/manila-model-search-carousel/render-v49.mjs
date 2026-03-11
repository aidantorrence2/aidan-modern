import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v49')

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 410

const SF = "-apple-system, 'Helvetica Neue', Arial, sans-serif"

const MANILA_COLOR = '#E8443A'

// Total animation: lock screen (3s) + answer transition (1s) + 5 photos x 1.5s (7.5s) + fade out (1.5s) = ~13s
const TOTAL_DURATION = 14
const TOTAL_DURATION_MS = 16000

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

const PURPLE_PHOTOS = ['purple-001', 'purple-002', 'purple-003', 'purple-004', 'purple-005']

function isPurple(name) {
  return PURPLE_PHOTOS.some(p => name.includes(p))
}

function imgStyle(name, extra = '') {
  if (isPurple(name)) {
    // Crop film borders: scale up 130%, shift up 15%
    return `width:130%;height:130%;object-fit:cover;object-position:center;position:absolute;top:-15%;left:-15%;${extra}`
  }
  return `width:100%;height:100%;object-fit:cover;object-position:center;${extra}`
}

const p = (t) => ((t / TOTAL_DURATION) * 100).toFixed(2)

function buildFaceTimeHTML(images) {
  // Timeline:
  // 0-3s: Lock screen with incoming FaceTime call
  // 3-4s: Answer transition (slide up, screen goes green briefly then shows first photo)
  // 4-5.5s: Photo 1
  // 5.5-7s: Photo 2
  // 7-8.5s: Photo 3
  // 8.5-10s: Photo 4
  // 10-11.5s: Photo 5
  // 11.5-14s: Fade to black

  const photoStart = 4 // when first photo appears
  const photoDur = 1.5

  return `<!DOCTYPE html>
<html>
<head>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { margin: 0; padding: 0; background: #000; -webkit-font-smoothing: antialiased; overflow: hidden; }

  @keyframes slideToAnswer {
    0% { transform: translateX(0); }
    30% { transform: translateX(30px); }
    60% { transform: translateX(60px); }
    100% { transform: translateX(200px); opacity: 0; }
  }

  @keyframes pulseGlow {
    0%, 100% { box-shadow: 0 0 20px rgba(76,217,100,0.3); }
    50% { box-shadow: 0 0 40px rgba(76,217,100,0.6); }
  }

  @keyframes shimmer {
    0% { background-position: -200px 0; }
    100% { background-position: 200px 0; }
  }

  @keyframes fadeIn {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }
  @keyframes fadeOut {
    0% { opacity: 1; }
    100% { opacity: 0; }
  }

  @keyframes scaleIn {
    0% { opacity: 0; transform: scale(1.08); }
    100% { opacity: 1; transform: scale(1); }
  }

  @keyframes lockScreenOut {
    0% { opacity: 1; filter: blur(0px); }
    60% { opacity: 0.5; filter: blur(10px); }
    100% { opacity: 0; filter: blur(20px); }
  }

  @keyframes answerFlash {
    0% { opacity: 0; }
    30% { opacity: 1; }
    100% { opacity: 0; }
  }

  @keyframes callConnecting {
    0% { opacity: 0; }
    20% { opacity: 1; }
    80% { opacity: 1; }
    100% { opacity: 0; }
  }

  @keyframes slideHintLeft {
    0%, 100% { transform: translateX(0); opacity: 0.4; }
    50% { transform: translateX(40px); opacity: 0.8; }
  }

  /* Photo keyframes — each photo fades in, stays, then fades out */
  ${[0,1,2,3,4].map(i => {
    const start = photoStart + i * photoDur
    const fadeInEnd = start + 0.3
    const holdEnd = start + photoDur - 0.3
    const end = start + photoDur
    return `
  @keyframes photo${i} {
    0%, ${p(start)}% { opacity: 0; transform: scale(1.05); }
    ${p(fadeInEnd)}% { opacity: 1; transform: scale(1); }
    ${p(holdEnd)}% { opacity: 1; transform: scale(1); }
    ${p(end)}% { opacity: 0; transform: scale(0.98); }
    100% { opacity: 0; }
  }`
  }).join('\n')}

  /* Lock screen fade out at 2.8s */
  @keyframes lockOut {
    0%, ${p(2.8)}% { opacity: 1; }
    ${p(3.3)}% { opacity: 0; filter: blur(8px); }
    100% { opacity: 0; }
  }

  /* FaceTime UI appears at 3.5s */
  @keyframes ftUIIn {
    0%, ${p(3.5)}% { opacity: 0; }
    ${p(4.0)}% { opacity: 1; }
    ${p(11.5)}% { opacity: 1; }
    ${p(12.5)}% { opacity: 0; }
    100% { opacity: 0; }
  }

  /* Green answer flash */
  @keyframes greenFlash {
    0%, ${p(2.9)}% { opacity: 0; }
    ${p(3.1)}% { opacity: 0.6; }
    ${p(3.6)}% { opacity: 0; }
    100% { opacity: 0; }
  }

  /* Final fade to black */
  @keyframes fadeToBlack {
    0%, ${p(11.5)}% { opacity: 0; }
    ${p(13.0)}% { opacity: 1; }
    100% { opacity: 1; }
  }

  /* Slide-to-answer hint animation */
  @keyframes slideHint {
    0%, ${p(0.5)}% { transform: translateX(0); opacity: 0; }
    ${p(1.0)}% { transform: translateX(0); opacity: 0.5; }
    ${p(1.5)}% { transform: translateX(60px); opacity: 0.9; }
    ${p(2.0)}% { transform: translateX(120px); opacity: 0.5; }
    ${p(2.5)}% { transform: translateX(200px); opacity: 0; }
    ${p(2.8)}% { transform: translateX(200px); opacity: 0; }
    100% { transform: translateX(200px); opacity: 0; }
  }

  /* Ringing pulse on profile pic */
  @keyframes ringPulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(255,255,255,0.3); }
    50% { box-shadow: 0 0 0 20px rgba(255,255,255,0); }
  }

</style>
</head>
<body>
<div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#000;">

  <!-- ===== LOCK SCREEN ===== -->
  <div style="position:absolute;inset:0;z-index:10;animation:lockOut ${TOTAL_DURATION}s linear forwards;">

    <!-- Blurred background image -->
    <div style="position:absolute;inset:0;overflow:hidden;">
      <img src="${images.bg}" style="width:100%;height:100%;object-fit:cover;filter:blur(40px) brightness(0.4) saturate(1.3);transform:scale(1.2);"/>
    </div>

    <!-- Dark overlay for readability -->
    <div style="position:absolute;inset:0;background:rgba(0,0,0,0.35);"></div>

    <!-- Status bar -->
    <div style="position:absolute;left:0;right:0;top:0;height:54px;padding:14px 32px 0;display:flex;align-items:center;justify-content:space-between;z-index:5;">
      <span style="font-family:${SF};font-size:20px;font-weight:600;color:white;">9:41</span>
      <div style="display:flex;align-items:center;gap:6px;">
        <svg width="20" height="14" viewBox="0 0 18 12"><rect x="0" y="3" width="3" height="9" rx="1" fill="white"/><rect x="5" y="2" width="3" height="10" rx="1" fill="white"/><rect x="10" y="0" width="3" height="12" rx="1" fill="white"/><rect x="15" y="0" width="3" height="12" rx="1" fill="white" opacity="0.3"/></svg>
        <svg width="18" height="14" viewBox="0 0 18 14"><path d="M1 10 L5 2 L9 10 L13 4 L17 10" stroke="white" stroke-width="1.5" fill="none"/></svg>
        <svg width="30" height="15" viewBox="0 0 27 13"><rect x="0" y="0" width="23" height="13" rx="3.5" stroke="white" stroke-width="1" fill="none"/><rect x="2" y="2" width="18" height="9" rx="2" fill="white"/></svg>
      </div>
    </div>

    <!-- Lock icon + time -->
    <div style="position:absolute;top:70px;left:0;right:0;display:flex;flex-direction:column;align-items:center;">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style="margin-bottom:8px;">
        <rect x="5" y="11" width="14" height="10" rx="2" fill="white"/>
        <path d="M8 11V8a4 4 0 118 0v3" stroke="white" stroke-width="2" fill="none"/>
      </svg>
      <span style="font-family:${SF};font-size:96px;font-weight:200;color:white;letter-spacing:-4px;">9:41</span>
      <span style="font-family:${SF};font-size:24px;font-weight:400;color:rgba(255,255,255,0.7);margin-top:4px;">Wednesday, March 11</span>
    </div>

    <!-- FaceTime incoming call notification - frosted glass card -->
    <div style="position:absolute;top:340px;left:40px;right:40px;border-radius:28px;overflow:hidden;backdrop-filter:blur(40px);-webkit-backdrop-filter:blur(40px);background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.2);padding:30px;animation:fadeIn 0.5s ease-out 0.3s both;">

      <!-- Profile picture + caller info -->
      <div style="display:flex;flex-direction:column;align-items:center;gap:12px;">
        <div style="width:100px;height:100px;border-radius:50%;overflow:hidden;border:3px solid rgba(255,255,255,0.3);animation:ringPulse 2s ease-in-out infinite;">
          <img src="${images.avatar}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="text-align:center;">
          <p style="font-family:${SF};font-size:30px;font-weight:600;color:white;margin:0;">madebyaidan</p>
          <p style="font-family:${SF};font-size:22px;font-weight:400;color:rgba(255,255,255,0.7);margin:6px 0 0;">FaceTime Video</p>
        </div>
      </div>

      <!-- Action buttons row -->
      <div style="display:flex;justify-content:space-around;margin-top:28px;">
        <!-- Remind Me -->
        <div style="display:flex;flex-direction:column;align-items:center;gap:6px;">
          <div style="width:64px;height:64px;border-radius:50%;background:rgba(255,255,255,0.2);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="white" stroke-width="2"/><path d="M12 7v5l3 3" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>
          </div>
          <span style="font-family:${SF};font-size:16px;color:rgba(255,255,255,0.7);">Remind Me</span>
        </div>
        <!-- Message -->
        <div style="display:flex;flex-direction:column;align-items:center;gap:6px;">
          <div style="width:64px;height:64px;border-radius:50%;background:rgba(255,255,255,0.2);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="white" stroke-width="2" fill="none"/></svg>
          </div>
          <span style="font-family:${SF};font-size:16px;color:rgba(255,255,255,0.7);">Message</span>
        </div>
      </div>
    </div>

    <!-- Slide to answer bar -->
    <div style="position:absolute;bottom:${SAFE_BOTTOM + 60}px;left:80px;right:80px;">
      <div style="position:relative;height:80px;border-radius:40px;background:rgba(255,255,255,0.08);overflow:hidden;border:1px solid rgba(255,255,255,0.12);">
        <!-- Shimmer bg -->
        <div style="position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.05),transparent);background-size:200px 100%;animation:shimmer 2s linear infinite;"></div>
        <!-- Text -->
        <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;">
          <span style="font-family:${SF};font-size:24px;font-weight:500;color:rgba(255,255,255,0.4);letter-spacing:0.5px;">slide to answer</span>
        </div>
        <!-- Green answer circle with slide animation -->
        <div style="position:absolute;left:6px;top:6px;width:68px;height:68px;border-radius:50%;background:#4CD964;display:flex;align-items:center;justify-content:center;animation:slideHint ${TOTAL_DURATION}s linear forwards;">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke="white" stroke-width="2" fill="none"/></svg>
        </div>
      </div>
      <!-- Decline button -->
      <div style="display:flex;justify-content:center;margin-top:20px;">
        <div style="display:flex;align-items:center;gap:8px;opacity:0.6;">
          <div style="width:48px;height:48px;border-radius:50%;background:#FF3B30;display:flex;align-items:center;justify-content:center;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M18.36 5.64l-12.72 12.72M5.64 5.64l12.72 12.72" stroke="white" stroke-width="2.5" stroke-linecap="round"/></svg>
          </div>
          <span style="font-family:${SF};font-size:20px;color:rgba(255,255,255,0.5);">Decline</span>
        </div>
      </div>
    </div>
  </div>

  <!-- ===== GREEN FLASH (answer transition) ===== -->
  <div style="position:absolute;inset:0;background:#4CD964;z-index:15;pointer-events:none;opacity:0;animation:greenFlash ${TOTAL_DURATION}s linear forwards;"></div>

  <!-- ===== FACETIME PHOTO VIEWER ===== -->
  <div style="position:absolute;inset:0;z-index:20;opacity:0;animation:ftUIIn ${TOTAL_DURATION}s linear forwards;">

    <!-- Black background -->
    <div style="position:absolute;inset:0;background:#000;"></div>

    <!-- Photos container — each photo absolutely positioned, animated in/out -->
    ${[0,1,2,3,4].map(i => {
      const key = `photo${i+1}`
      const name = ['manila-gallery-garden-001.jpg','manila-gallery-purple-003.jpg','manila-gallery-graffiti-001.jpg','manila-gallery-night-001.jpg','manila-gallery-canal-001.jpg'][i]
      return `
    <div style="position:absolute;top:60px;left:0;right:0;bottom:${SAFE_BOTTOM + 100}px;overflow:hidden;opacity:0;animation:photo${i} ${TOTAL_DURATION}s linear forwards;">
      <div style="width:100%;height:100%;position:relative;overflow:hidden;border-radius:16px;margin:0 16px;width:calc(100% - 32px);">
        <img src="${images[key]}" style="${imgStyle(name, 'display:block;border-radius:16px;')}"/>
      </div>
    </div>`
    }).join('\n')}

    <!-- FaceTime top bar — frosted glass -->
    <div style="position:absolute;left:0;right:0;top:0;height:110px;background:linear-gradient(180deg,rgba(0,0,0,0.7),transparent);z-index:5;padding:14px 32px 0;">
      <!-- Status bar -->
      <div style="display:flex;align-items:center;justify-content:space-between;">
        <span style="font-family:${SF};font-size:20px;font-weight:600;color:white;">9:41</span>
        <div style="display:flex;align-items:center;gap:6px;">
          <svg width="20" height="14" viewBox="0 0 18 12"><rect x="0" y="3" width="3" height="9" rx="1" fill="white"/><rect x="5" y="2" width="3" height="10" rx="1" fill="white"/><rect x="10" y="0" width="3" height="12" rx="1" fill="white"/><rect x="15" y="0" width="3" height="12" rx="1" fill="white" opacity="0.3"/></svg>
          <svg width="30" height="15" viewBox="0 0 27 13"><rect x="0" y="0" width="23" height="13" rx="3.5" stroke="white" stroke-width="1" fill="none"/><rect x="2" y="2" width="18" height="9" rx="2" fill="white"/></svg>
        </div>
      </div>
      <!-- Caller name -->
      <div style="display:flex;align-items:center;justify-content:center;margin-top:6px;gap:10px;">
        <div style="width:8px;height:8px;border-radius:50%;background:#4CD964;"></div>
        <span style="font-family:${SF};font-size:22px;font-weight:600;color:white;">madebyaidan</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" stroke="rgba(255,255,255,0.6)" stroke-width="2" stroke-linecap="round"/></svg>
      </div>
    </div>

    <!-- Self-camera pip (small rectangle in corner) -->
    <div style="position:absolute;right:20px;top:120px;width:160px;height:220px;border-radius:18px;overflow:hidden;border:2px solid rgba(255,255,255,0.2);box-shadow:0 4px 20px rgba(0,0,0,0.5);z-index:10;">
      <img src="${images.selfCam}" style="width:100%;height:100%;object-fit:cover;filter:brightness(0.85);"/>
    </div>

    <!-- FaceTime bottom controls -->
    <div style="position:absolute;left:0;right:0;bottom:${SAFE_BOTTOM + 20}px;z-index:5;">
      <div style="display:flex;justify-content:center;gap:24px;padding:0 40px;">
        <!-- Mute -->
        <div style="display:flex;flex-direction:column;align-items:center;gap:6px;">
          <div style="width:60px;height:60px;border-radius:50%;background:rgba(255,255,255,0.15);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" stroke="white" stroke-width="2"/><path d="M19 10v2a7 7 0 01-14 0v-2" stroke="white" stroke-width="2" stroke-linecap="round"/><line x1="12" y1="19" x2="12" y2="23" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>
          </div>
          <span style="font-family:${SF};font-size:14px;color:rgba(255,255,255,0.6);">Mute</span>
        </div>
        <!-- End -->
        <div style="display:flex;flex-direction:column;align-items:center;gap:6px;">
          <div style="width:72px;height:72px;border-radius:50%;background:#FF3B30;display:flex;align-items:center;justify-content:center;">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M18.36 5.64l-12.72 12.72M5.64 5.64l12.72 12.72" stroke="white" stroke-width="3" stroke-linecap="round"/></svg>
          </div>
          <span style="font-family:${SF};font-size:14px;color:rgba(255,255,255,0.6);">End</span>
        </div>
        <!-- Flip -->
        <div style="display:flex;flex-direction:column;align-items:center;gap:6px;">
          <div style="width:60px;height:60px;border-radius:50%;background:rgba(255,255,255,0.15);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M20 16v4a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h2" stroke="white" stroke-width="2" stroke-linecap="round"/><rect x="9" y="2" width="13" height="10" rx="2" stroke="white" stroke-width="2" fill="none"/></svg>
          </div>
          <span style="font-family:${SF};font-size:14px;color:rgba(255,255,255,0.6);">Flip</span>
        </div>
        <!-- Speaker -->
        <div style="display:flex;flex-direction:column;align-items:center;gap:6px;">
          <div style="width:60px;height:60px;border-radius:50%;background:rgba(255,255,255,0.15);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19" stroke="white" stroke-width="2" fill="none"/><path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>
          </div>
          <span style="font-family:${SF};font-size:14px;color:rgba(255,255,255,0.6);">Speaker</span>
        </div>
      </div>
    </div>
  </div>

  <!-- ===== FADE TO BLACK ===== -->
  <div style="position:absolute;inset:0;background:#000;z-index:30;pointer-events:none;opacity:0;animation:fadeToBlack ${TOTAL_DURATION}s linear forwards;"></div>

</div>
</body>
</html>`
}


function buildCTA(images) {
  return `<!DOCTYPE html>
<html>
<head>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { margin: 0; padding: 0; background: #000; }
</style>
</head>
<body>
<div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#000;">

  <!-- Photo collage — 3 staggered/rotated images -->
  <div style="position:absolute;inset:0;">
    <!-- Photo 1 — large, left-leaning -->
    <div style="position:absolute;top:120px;left:-40px;width:600px;height:800px;overflow:hidden;border-radius:16px;transform:rotate(-6deg);box-shadow:0 8px 40px rgba(0,0,0,0.6);">
      <img src="${images.ctaPhoto1}" style="${imgStyle('manila-gallery-garden-002.jpg', 'display:block;')}"/>
    </div>
    <!-- Photo 2 — right, tilted other way -->
    <div style="position:absolute;top:200px;right:-60px;width:560px;height:750px;overflow:hidden;border-radius:16px;transform:rotate(5deg);box-shadow:0 8px 40px rgba(0,0,0,0.6);">
      <img src="${images.ctaPhoto2}" style="${imgStyle('manila-gallery-purple-001.jpg', 'display:block;')}"/>
    </div>
    <!-- Photo 3 — center bottom, slightly tilted -->
    <div style="position:absolute;top:500px;left:160px;width:520px;height:680px;overflow:hidden;border-radius:16px;transform:rotate(-2deg);box-shadow:0 8px 40px rgba(0,0,0,0.6);">
      <img src="${images.ctaPhoto3}" style="${imgStyle('manila-gallery-night-002.jpg', 'display:block;')}"/>
    </div>
  </div>

  <!-- Dark gradient overlay so text pops -->
  <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0.3) 0%,rgba(0,0,0,0.55) 30%,rgba(0,0,0,0.85) 65%,rgba(0,0,0,0.95) 100%);"></div>

  <!-- Text content — all above SAFE_BOTTOM -->
  <div style="position:absolute;left:0;right:0;bottom:${SAFE_BOTTOM + 40}px;display:flex;flex-direction:column;align-items:center;padding:0 60px;">

    <!-- MANILA -->
    <p style="font-family:${SF};font-size:180px;font-weight:900;color:white;text-transform:uppercase;letter-spacing:0.06em;line-height:1;margin:0;text-shadow:0 4px 30px rgba(0,0,0,0.5);">MANILA</p>

    <!-- MODEL SEARCH -->
    <p style="font-family:${SF};font-size:42px;font-weight:300;color:rgba(255,255,255,0.9);letter-spacing:0.25em;text-transform:uppercase;margin:16px 0 0;">MODEL SEARCH</p>

    <!-- Red CTA button -->
    <div style="margin:40px 0 0;background:${MANILA_COLOR};border-radius:50px;padding:22px 80px;box-shadow:0 4px 20px rgba(232,68,58,0.4);">
      <span style="font-family:${SF};font-size:28px;font-weight:700;color:white;letter-spacing:0.05em;">SIGN UP NOW</span>
    </div>

    <!-- Subtext -->
    <p style="font-family:${SF};font-size:22px;font-weight:400;color:rgba(255,255,255,0.5);margin:20px 0 0;">60-second form &middot; No experience needed</p>

    <!-- IG handle -->
    <p style="font-family:${SF};font-size:20px;font-weight:500;color:rgba(255,255,255,0.35);margin:14px 0 0;">@madebyaidan</p>

  </div>

</div>
</body>
</html>`
}


async function render() {
  resetOutputDir()

  const selection = {
    bg: 'manila-gallery-tropical-001.jpg',
    avatar: 'manila-gallery-closeup-001.jpg',
    selfCam: 'manila-gallery-closeup-001.jpg',
    photo1: 'manila-gallery-garden-001.jpg',
    photo2: 'manila-gallery-purple-003.jpg',
    photo3: 'manila-gallery-graffiti-001.jpg',
    photo4: 'manila-gallery-night-001.jpg',
    photo5: 'manila-gallery-canal-001.jpg',
    ctaPhoto1: 'manila-gallery-garden-002.jpg',
    ctaPhoto2: 'manila-gallery-purple-001.jpg',
    ctaPhoto3: 'manila-gallery-night-002.jpg',
  }

  writeSources({
    createdAt: new Date().toISOString(),
    strategy: 'v49 — FaceTime incoming call animated ad',
    safeBottomPixels: SAFE_BOTTOM,
    images: selection
  })

  const images = Object.fromEntries(
    Object.entries(selection).map(([key, file]) => [key, readImage(file)])
  )

  const { execSync } = await import('child_process')
  const browser = await chromium.launch()

  // ── Step 1: Record animated video ──
  console.log('Recording FaceTime animation as video...')
  const videoCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: OUT_DIR,
      size: { width: WIDTH, height: HEIGHT }
    }
  })

  const videoPage = await videoCtx.newPage()
  const html = buildFaceTimeHTML(images)
  await videoPage.setContent(html, { waitUntil: 'load' })
  await videoPage.waitForTimeout(500)
  await videoPage.waitForTimeout(TOTAL_DURATION_MS)

  await videoPage.close()
  await videoCtx.close()

  // ── Step 2: Screenshot CTA ──
  console.log('Capturing CTA screenshot...')
  const ctaPath = path.join(OUT_DIR, 'cta.png')
  const ctaCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1
  })
  const ctaPage = await ctaCtx.newPage()
  await ctaPage.setContent(buildCTA(images), { waitUntil: 'load' })
  await ctaPage.waitForTimeout(300)
  await ctaPage.screenshot({ path: ctaPath })
  await ctaPage.close()
  await ctaCtx.close()

  await browser.close()

  // ── Step 3: ffmpeg compose ──
  console.log('Compositing with ffmpeg...')
  const videoFiles = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.webm'))
  if (videoFiles.length === 0) {
    console.error('No video file was generated!')
    process.exit(1)
  }

  const srcVideo = path.join(OUT_DIR, videoFiles[0])
  const chatMp4 = path.join(OUT_DIR, 'part_animation.mp4')
  const ctaMp4 = path.join(OUT_DIR, 'part_cta.mp4')
  const concatFile = path.join(OUT_DIR, 'concat.txt')
  const finalMp4 = path.join(OUT_DIR, 'facetime_manila_ad.mp4')

  try {
    // Convert webm to mp4
    execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${chatMp4}"`, { stdio: 'pipe' })

    // CTA as 5-sec still video
    execSync(`ffmpeg -y -loop 1 -i "${ctaPath}" -c:v libx264 -t 5 -pix_fmt yuv420p -r 30 -vf "scale=${WIDTH}:${HEIGHT}" -an "${ctaMp4}"`, { stdio: 'pipe' })

    // Concatenate
    fs.writeFileSync(concatFile, `file '${chatMp4}'\nfile '${ctaMp4}'\n`)
    execSync(`ffmpeg -y -f concat -safe 0 -i "${concatFile}" -c copy "${finalMp4}"`, { stdio: 'pipe' })

    // Cleanup temp files
    fs.unlinkSync(srcVideo)
    fs.unlinkSync(chatMp4)
    fs.unlinkSync(ctaMp4)
    fs.unlinkSync(concatFile)
    fs.unlinkSync(ctaPath)

    console.log(`Done! Final video: ${finalMp4}`)
  } catch (err) {
    console.error('ffmpeg error:', err.message)
    // Fallback: just rename webm
    const fallback = path.join(OUT_DIR, 'facetime_manila_ad.mp4')
    fs.renameSync(srcVideo, fallback)
    console.log(`Fallback: saved as ${fallback} (webm container)`)
  }

  console.log(`Output directory: ${OUT_DIR}`)
}

render().catch(error => {
  console.error(error)
  process.exit(1)
})
