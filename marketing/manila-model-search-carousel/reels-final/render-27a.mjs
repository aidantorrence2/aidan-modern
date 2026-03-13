import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, "output-27a")

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 430
const SAFE_TOP = 213
const SAFE_LEFT = 66
const SAFE_RIGHT = 1027
const MANILA_COLOR = '#E8443A'

const SF = "-apple-system, 'Helvetica Neue', Arial, sans-serif"
const BOLD = "'Avenir Next', 'Helvetica Neue', Arial, sans-serif"

const TOTAL_DURATION_MS = 20000

// Selected photos for proof section
const PROOF_PHOTOS = [
  'manila-gallery-dsc-0190.jpg',
  'manila-gallery-night-001.jpg',
  'manila-gallery-garden-001.jpg',
  'manila-gallery-urban-001.jpg',
  'manila-gallery-canal-001.jpg',
  'manila-gallery-ivy-001.jpg',
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
  return `<!DOCTYPE html>
<html>
<head>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { margin: 0; padding: 0; background: #000; -webkit-font-smoothing: antialiased; }

  .page {
    width: ${WIDTH}px;
    height: ${HEIGHT}px;
    position: relative;
    overflow: hidden;
    background: #0a0a0a;
    font-family: ${SF};
  }

  /* Animations */
  @keyframes bounceIn {
    0% { transform: scale(0); opacity: 0; }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); opacity: 1; }
  }

  @keyframes floatEmoji {
    0% { transform: translateY(0) rotate(0deg); }
    25% { transform: translateY(-20px) rotate(5deg); }
    50% { transform: translateY(0) rotate(0deg); }
    75% { transform: translateY(-10px) rotate(-3deg); }
    100% { transform: translateY(0) rotate(0deg); }
  }

  @keyframes slideUp {
    0% { transform: translateY(60px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }

  @keyframes slideDown {
    0% { transform: translateY(-40px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }

  @keyframes fadeIn {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }

  @keyframes popIn {
    0% { transform: scale(0) rotate(-10deg); opacity: 0; }
    60% { transform: scale(1.15) rotate(3deg); }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
  }

  @keyframes wiggle {
    0%, 100% { transform: rotate(0deg); }
    15% { transform: rotate(-12deg); }
    30% { transform: rotate(10deg); }
    45% { transform: rotate(-8deg); }
    60% { transform: rotate(6deg); }
    75% { transform: rotate(-3deg); }
    90% { transform: rotate(2deg); }
  }

  @keyframes sparkle {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.4; transform: scale(0.8); }
  }

  @keyframes rocketFly {
    0% { transform: translateY(200px) rotate(-15deg); opacity: 0; }
    30% { opacity: 1; }
    100% { transform: translateY(-400px) rotate(-15deg); opacity: 0; }
  }

  @keyframes confettiFall {
    0% { transform: translateY(-50px) rotate(0deg); opacity: 1; }
    100% { transform: translateY(300px) rotate(720deg); opacity: 0; }
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.08); }
  }

  @keyframes tileReveal {
    0% { opacity: 0; transform: scale(0.7) rotate(-5deg); }
    100% { opacity: 1; transform: scale(1) rotate(0deg); }
  }

  /* Scene visibility */
  @keyframes scene1Vis {
    0%     { opacity: 1; }
    23%    { opacity: 1; }
    25%    { opacity: 0; }
    100%   { opacity: 0; }
  }
  @keyframes scene2Vis {
    0%     { opacity: 0; }
    23%    { opacity: 0; }
    25%    { opacity: 1; }
    48%    { opacity: 1; }
    50%    { opacity: 0; }
    100%   { opacity: 0; }
  }
  @keyframes scene3Vis {
    0%     { opacity: 0; }
    48%    { opacity: 0; }
    50%    { opacity: 1; }
    73%    { opacity: 1; }
    75%    { opacity: 0; }
    100%   { opacity: 0; }
  }
  @keyframes scene4Vis {
    0%     { opacity: 0; }
    73%    { opacity: 0; }
    75%    { opacity: 1; }
    100%   { opacity: 1; }
  }

  .scene-1 { animation: scene1Vis 18s linear forwards; }
  .scene-2 { animation: scene2Vis 18s linear forwards; }
  .scene-3 { animation: scene3Vis 18s linear forwards; }
  .scene-4 { animation: scene4Vis 18s linear forwards; }

  .scene {
    position: absolute;
    inset: 0;
    width: ${WIDTH}px;
    height: ${HEIGHT}px;
    overflow: hidden;
  }

  /* Emoji text styling */
  .emoji-huge { font-size: 200px; line-height: 1; }
  .emoji-large { font-size: 140px; line-height: 1; }
  .emoji-medium { font-size: 100px; line-height: 1; }
  .emoji-small { font-size: 72px; line-height: 1; }

  .headline {
    font-family: ${BOLD};
    font-weight: 800;
    color: #fff;
    text-align: center;
  }

  .subtext {
    font-family: ${SF};
    font-weight: 500;
    color: rgba(255,255,255,0.8);
    text-align: center;
  }

  /* Floating emoji background decorations */
  .float-emoji {
    position: absolute;
    animation: floatEmoji 3s ease-in-out infinite;
    opacity: 0.15;
    font-size: 80px;
    pointer-events: none;
  }
</style>
</head>
<body>
  <div class="page">

    <!-- ═══ SCENE 4: CTA ═══ -->
    <div class="scene scene-4" style="background:radial-gradient(circle at 50% 40%, #1a0a08 0%, #0a0a0a 100%);">
      <!-- Confetti emojis -->
      <div style="position:absolute;left:100px;top:0;" id="confetti1">🎉</div>
      <div style="position:absolute;left:400px;top:0;" id="confetti2">🎊</div>
      <div style="position:absolute;left:700px;top:0;" id="confetti3">✨</div>
      <div style="position:absolute;left:250px;top:0;" id="confetti4">🎉</div>
      <div style="position:absolute;left:850px;top:0;" id="confetti5">🎊</div>

      <div style="position:absolute;left:0;right:0;top:${SAFE_TOP + 40}px;display:flex;flex-direction:column;align-items:center;">
        <div style="opacity:0;" id="cta-emoji-row">
          <span style="font-size:120px;">📸</span>
          <span style="font-size:120px;margin:0 20px;">💬</span>
          <span style="font-size:120px;">🔥</span>
        </div>

        <h1 class="headline" style="font-size:90px;line-height:1.0;margin:40px 60px 0;opacity:0;" id="cta-head">
          DM me<br/>if interested!!
        </h1>

        <div style="margin-top:50px;opacity:0;" id="cta-handle-box">
          <div style="background:${MANILA_COLOR};border-radius:28px;padding:28px 50px;display:inline-flex;align-items:center;gap:20px;box-shadow:0 8px 40px rgba(232,68,58,0.5);">
            <span style="font-size:56px;">👋</span>
            <span style="font-family:${BOLD};font-size:42px;font-weight:700;color:#fff;">@madebyaidan</span>
          </div>
        </div>

        <p class="subtext" style="font-size:36px;margin-top:40px;opacity:0;" id="cta-ig">
          on Instagram
        </p>

        <!-- Photo strip -->
        <div style="display:flex;gap:12px;margin-top:50px;opacity:0;" id="cta-strip">
          ${PROOF_PHOTOS.slice(0, 4).map((p, i) => `
            <div style="width:190px;height:250px;border-radius:18px;overflow:hidden;border:3px solid rgba(255,255,255,0.15);">
              <img src="${imageDataMap[p]}" style="width:100%;height:100%;object-fit:cover;"/>
            </div>
          `).join('')}
        </div>

        <div style="margin-top:50px;display:flex;align-items:center;gap:16px;opacity:0;" id="cta-limited">
          <span style="font-size:48px;">⚡</span>
          <span style="font-family:${SF};font-size:34px;color:rgba(255,255,255,0.6);">Limited spots this month</span>
        </div>
      </div>
    </div>

    <!-- ═══ SCENE 3: HOW IT WORKS ═══ -->
    <div class="scene scene-3" style="background:#0a0a0a;">
      <!-- Floating bg emojis -->
      <div class="float-emoji" style="left:30px;top:400px;animation-delay:0s;">📷</div>
      <div class="float-emoji" style="right:40px;top:800px;animation-delay:1s;">🎨</div>
      <div class="float-emoji" style="left:60px;bottom:500px;animation-delay:0.5s;">💫</div>

      <div style="position:absolute;left:0;right:0;top:${SAFE_TOP + 20}px;display:flex;flex-direction:column;align-items:center;">
        <div style="opacity:0;" id="steps-title-emoji">
          <span style="font-size:100px;">👆</span>
          <span style="font-size:100px;">✌️</span>
          <span style="font-size:100px;">🤟</span>
        </div>
        <h2 class="headline" style="font-size:78px;margin-top:20px;opacity:0;" id="steps-title">
          3 easy steps
        </h2>
        <p class="subtext" style="font-size:38px;margin-top:10px;opacity:0;" id="steps-sub">That's literally it 😌</p>
      </div>

      <!-- Step cards -->
      <div style="position:absolute;left:${SAFE_LEFT + 20}px;right:${WIDTH - SAFE_RIGHT + 20}px;top:${SAFE_TOP + 340}px;display:flex;flex-direction:column;gap:28px;">

        <div style="padding:32px 36px;border-radius:26px;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);display:flex;align-items:flex-start;gap:24px;opacity:0;" id="step1-card">
          <div style="font-size:72px;flex-shrink:0;margin-top:-4px;">💬</div>
          <div>
            <p style="font-family:${BOLD};font-size:42px;font-weight:700;color:#fff;margin:0 0 8px;">DM me on Instagram</p>
            <p style="font-family:${SF};font-size:30px;color:rgba(255,255,255,0.6);margin:0;">Just say hey! I'll message back 🙋‍♂️</p>
          </div>
        </div>

        <div style="padding:32px 36px;border-radius:26px;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);display:flex;align-items:flex-start;gap:24px;opacity:0;" id="step2-card">
          <div style="font-size:72px;flex-shrink:0;margin-top:-4px;">📅</div>
          <div>
            <p style="font-family:${BOLD};font-size:42px;font-weight:700;color:#fff;margin:0 0 8px;">We pick a date</p>
            <p style="font-family:${SF};font-size:30px;color:rgba(255,255,255,0.6);margin:0;">Location + vibe planned together 🤝</p>
          </div>
        </div>

        <div style="padding:32px 36px;border-radius:26px;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);display:flex;align-items:flex-start;gap:24px;opacity:0;" id="step3-card">
          <div style="font-size:72px;flex-shrink:0;margin-top:-4px;">📸</div>
          <div>
            <p style="font-family:${BOLD};font-size:42px;font-weight:700;color:#fff;margin:0 0 8px;">Show up. I guide you.</p>
            <p style="font-family:${SF};font-size:30px;color:rgba(255,255,255,0.6);margin:0;">Zero experience needed 💪</p>
          </div>
        </div>
      </div>

      <!-- Rocket flying across at end of scene -->
      <div style="position:absolute;right:120px;bottom:${SAFE_BOTTOM + 100}px;font-size:80px;opacity:0;" id="rocket">🚀</div>
    </div>

    <!-- ═══ SCENE 2: PROOF — photo grid ═══ -->
    <div class="scene scene-2" style="background:#0a0a0a;">
      <div style="position:absolute;left:0;right:0;top:${SAFE_TOP + 20}px;display:flex;flex-direction:column;align-items:center;">
        <div style="display:flex;align-items:center;gap:20px;opacity:0;" id="proof-header">
          <span style="font-size:72px;">🔥</span>
          <h2 class="headline" style="font-size:72px;">This is my work</h2>
          <span style="font-size:72px;">🔥</span>
        </div>
        <p class="subtext" style="font-size:32px;margin-top:10px;opacity:0;" id="proof-sub">
          real photos. real people. real free. 💯
        </p>
      </div>

      <!-- Photo grid with playful rotation -->
      <div style="position:absolute;left:30px;right:30px;top:${SAFE_TOP + 220}px;display:grid;grid-template-columns:1fr 1fr;gap:16px;">
        ${PROOF_PHOTOS.map((p, i) => {
          const rotations = [-3, 2, -1, 3, -2, 1]
          const rot = rotations[i] || 0
          const emoji = ['✨', '💫', '🌟', '⭐', '💥', '🔥'][i]
          return `
          <div style="position:relative;border-radius:20px;overflow:hidden;aspect-ratio:3/4;opacity:0;transform:scale(0.7) rotate(${rot}deg);" id="proof-img-${i}">
            <img src="${imageDataMap[p]}" style="width:100%;height:100%;object-fit:cover;display:block;"/>
            <div style="position:absolute;top:12px;right:12px;font-size:40px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5));">${emoji}</div>
          </div>`
        }).join('')}
      </div>
    </div>

    <!-- ═══ SCENE 1: HOOK ═══ -->
    <div class="scene scene-1" style="background:radial-gradient(circle at 50% 30%, #1a0a08 0%, #0a0a0a 100%);">
      <!-- Floating decorative emojis -->
      <div class="float-emoji" style="left:50px;top:300px;animation-delay:0.2s;">✨</div>
      <div class="float-emoji" style="right:80px;top:600px;animation-delay:0.8s;">📷</div>
      <div class="float-emoji" style="left:100px;bottom:600px;animation-delay:1.2s;">💫</div>
      <div class="float-emoji" style="right:50px;top:350px;animation-delay:0.5s;">🌟</div>

      <div style="position:absolute;left:0;right:0;top:${SAFE_TOP + 60}px;display:flex;flex-direction:column;align-items:center;">
        <!-- Big camera emoji -->
        <div style="opacity:0;" id="hook-camera">
          <span style="font-size:200px;">📸</span>
        </div>

        <!-- Manila badge -->
        <div style="margin-top:30px;opacity:0;" id="hook-badge">
          <div style="background:${MANILA_COLOR};border-radius:16px;padding:12px 36px;display:inline-block;">
            <span style="font-family:${BOLD};font-size:36px;font-weight:700;color:#fff;letter-spacing:0.15em;text-transform:uppercase;">Manila</span>
          </div>
        </div>

        <!-- Main headline -->
        <h1 class="headline" style="font-size:110px;line-height:0.95;margin:30px 60px 0;opacity:0;" id="hook-head">
          Models<br/>wanted
        </h1>

        <!-- Fun emoji row -->
        <div style="display:flex;gap:20px;margin-top:40px;opacity:0;" id="hook-emoji-row">
          <span style="font-size:72px;">🙋‍♀️</span>
          <span style="font-size:72px;">🙋</span>
          <span style="font-size:72px;">🙋‍♂️</span>
        </div>

        <!-- Subtext -->
        <p class="subtext" style="font-size:40px;margin:30px 70px 0;line-height:1.4;opacity:0;" id="hook-sub">
          Editorial portrait shoots<br/>No experience needed 🎉
        </p>

        <!-- FREE badge -->
        <div style="margin-top:40px;opacity:0;" id="hook-free">
          <div style="background:#1a1a1a;border:2px solid rgba(255,255,255,0.15);border-radius:22px;padding:18px 44px;display:flex;align-items:center;gap:16px;">
            <span style="font-size:56px;">🆓</span>
            <span style="font-family:${BOLD};font-size:42px;font-weight:700;color:#fff;">100% Free</span>
          </div>
        </div>
      </div>
    </div>

  </div>

  <script>
    function fadeIn(id, startMs, dur) {
      dur = dur || 400
      setTimeout(() => {
        const el = document.getElementById(id)
        if (el) {
          el.style.transition = 'opacity ' + dur + 'ms ease-out, transform ' + dur + 'ms ease-out'
          el.style.opacity = '1'
          el.style.transform = 'scale(1) rotate(0deg)'
        }
      }, startMs)
    }

    function bounceIn(id, startMs) {
      setTimeout(() => {
        const el = document.getElementById(id)
        if (el) {
          el.style.animation = 'bounceIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards'
        }
      }, startMs)
    }

    function popIn(id, startMs) {
      setTimeout(() => {
        const el = document.getElementById(id)
        if (el) {
          el.style.animation = 'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards'
        }
      }, startMs)
    }

    function wiggle(id, startMs) {
      setTimeout(() => {
        const el = document.getElementById(id)
        if (el) {
          el.style.animation = 'wiggle 0.6s ease-in-out'
        }
      }, startMs)
    }

    // ═══ SCENE 1: HOOK (0–4.5s) ═══
    bounceIn('hook-camera', 300)
    popIn('hook-badge', 700)
    fadeIn('hook-head', 1000, 500)
    popIn('hook-emoji-row', 1600)
    fadeIn('hook-sub', 2000, 500)
    bounceIn('hook-free', 2600)
    wiggle('hook-camera', 3200)

    // ═══ SCENE 2: PROOF (4.5–9s) ═══
    // Scene visible at ~25% of 18s = 4.5s
    fadeIn('proof-header', 4600, 400)
    fadeIn('proof-sub', 4900, 400)
    ${PROOF_PHOTOS.map((_, i) => `
    setTimeout(() => {
      const el = document.getElementById('proof-img-${i}')
      if (el) el.style.animation = 'tileReveal 0.4s cubic-bezier(0.34,1.56,0.64,1) ${5200 + i * 200}ms forwards'
    }, 0)
    `).join('')}

    // ═══ SCENE 3: STEPS (9–13.5s) ═══
    // Scene visible at ~50% of 18s = 9s
    popIn('steps-title-emoji', 9200)
    fadeIn('steps-title', 9500, 400)
    fadeIn('steps-sub', 9800, 400)

    // Step cards pop in one by one
    popIn('step1-card', 10200)
    popIn('step2-card', 10800)
    popIn('step3-card', 11400)

    // Rocket flies
    setTimeout(() => {
      const rocket = document.getElementById('rocket')
      if (rocket) rocket.style.animation = 'rocketFly 1.5s ease-in-out 12000ms forwards'
    }, 0)

    // ═══ SCENE 4: CTA (13.5–18s) ═══
    // Scene visible at ~75% of 18s = 13.5s
    popIn('cta-emoji-row', 13700)
    fadeIn('cta-head', 14000, 500)
    bounceIn('cta-handle-box', 14800)
    fadeIn('cta-ig', 15400, 400)
    fadeIn('cta-strip', 15800, 500)
    fadeIn('cta-limited', 16400, 400)

    // Confetti animation
    const confettiEmojis = ['confetti1','confetti2','confetti3','confetti4','confetti5']
    confettiEmojis.forEach((id, i) => {
      setTimeout(() => {
        const el = document.getElementById(id)
        if (el) {
          el.style.fontSize = '60px'
          el.style.animation = 'confettiFall 2s ease-in ' + (i * 200) + 'ms forwards'
        }
      }, 14500)
    })

    // Pulse the CTA button
    setTimeout(() => {
      const btn = document.getElementById('cta-handle-box')
      if (btn) btn.style.animation = 'pulse 1.5s ease-in-out infinite'
    }, 15500)
  </script>
</body>
</html>`
}

async function render() {
  resetOutputDir()

  const imageDataMap = {}
  for (const photo of PROOF_PHOTOS) {
    imageDataMap[photo] = readImage(photo)
  }

  writeSources({
    createdAt: new Date().toISOString(),
    strategy: 'v27a — emoji/cartoon playful storytelling version',
    safeBottomPixels: SAFE_BOTTOM,
    photos: PROOF_PHOTOS,
  })

  const browser = await chromium.launch()

  console.log('Recording emoji storytelling version...')

  const videoCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: OUT_DIR,
      size: { width: WIDTH, height: HEIGHT }
    }
  })

  const videoPage = await videoCtx.newPage()

  await videoPage.evaluate(() => {
    document.documentElement.style.background = '#000'
    document.body.style.background = '#000'
  })

  const html = buildHTML(imageDataMap)
  await videoPage.setContent(html, { waitUntil: 'load' })
  await videoPage.waitForTimeout(500)
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
  const dstVideo = path.join(OUT_DIR, 'manila-emoji-v27a.mp4')

  const { execSync } = await import('child_process')
  try {
    execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${dstVideo}"`, { stdio: 'pipe' })
    fs.unlinkSync(srcVideo)
    console.log('Rendered manila-emoji-v27a.mp4')
  } catch (err) {
    console.warn('ffmpeg not available, keeping as webm...')
    fs.renameSync(srcVideo, dstVideo)
  }

  console.log(`Done: output written to ${OUT_DIR}`)
}

render().catch(error => {
  console.error(error)
  process.exit(1)
})
