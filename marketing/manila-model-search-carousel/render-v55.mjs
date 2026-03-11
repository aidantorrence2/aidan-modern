import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v55')

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 410

const SF = "-apple-system, 'Helvetica Neue', Arial, sans-serif"

const BG = '#000000'
const MANILA_COLOR = '#E8443A'
const TT_DARK = '#010101'
const TT_WHITE = '#FFFFFF'
const TT_GRAY = 'rgba(255,255,255,0.55)'
const TT_PINK = '#FE2C55'

const TOTAL_DURATION = 16
const TOTAL_DURATION_MS = 18000

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

const isPurple = (name) => name.includes('purple')

function imageStyle(name) {
  if (isPurple(name)) {
    return 'width:130%;height:130%;object-fit:cover;object-position:center;margin:-15% 0 0 -15%;'
  }
  return 'width:100%;height:100%;object-fit:cover;object-position:center;'
}

const p = (t) => ((t / TOTAL_DURATION) * 100).toFixed(1)

/* ---------- Comment timing ---------- */
const COMMENTS = [
  { text: 'HOW DO I SIGN UP 😭',            user: 'jasmineee',    t: 2.0 },
  { text: 'wait this is in Manila??',        user: 'kyla.mn',      t: 2.8 },
  { text: "she's never modeled before?! INSANE", user: 'ava_vibes', t: 3.8 },
  { text: 'I need this experience omg',      user: 'luna.arts',    t: 4.6 },
  { text: 'link in bio everyone GO',         user: 'mia_creates',  t: 5.5 },
  { text: 'just signed up!!! 🔥🔥🔥',        user: 'sofiaaa_22',   t: 6.3 },
  { text: 'no experience needed?? bet',      user: 'camille.ph',   t: 7.2 },
  { text: 'these photos are UNREAL',         user: 'dani.mnl',     t: 8.0 },
  { text: 'LIMITED SPOTS go go go',          user: 'nicole.xo',    t: 8.8 },
  { text: 'best photographer in Manila fr',  user: 'ella_mae',     t: 9.6 },
]

/* ---------- Background photo crossfade timing ---------- */
const BG_PHOTOS = [
  { key: 'bg1', fadeIn: 0,    fadeOut: 5.5 },
  { key: 'bg2', fadeIn: 5.0,  fadeOut: 10.5 },
  { key: 'bg3', fadeIn: 10.0, fadeOut: 14.0 },
]

/* ---------- Like count animation ---------- */
const LIKE_STEPS = [
  { t: 0,   val: '12.4K' },
  { t: 2,   val: '24.1K' },
  { t: 4,   val: '89.3K' },
  { t: 6,   val: '214K' },
  { t: 8,   val: '412K' },
  { t: 10,  val: '623K' },
  { t: 12,  val: '847K' },
]

function buildTikTokAd(images) {
  // Build background photo layers with crossfade
  const bgLayers = BG_PHOTOS.map((bg, i) => {
    const imgStyle = imageStyle(images[`${bg.key}_name`] || '')
    return `<div style="position:absolute;inset:0;opacity:0;animation:bgFade${i} ${TOTAL_DURATION}s linear 0s forwards;">
      <img src="${images[bg.key]}" style="${imgStyle}display:block;position:absolute;inset:0;min-width:100%;min-height:100%;"/>
      <div style="position:absolute;inset:0;background:rgba(0,0,0,0.45);"></div>
    </div>`
  }).join('\n')

  // Build bg fade keyframes
  const bgKeyframes = BG_PHOTOS.map((bg, i) => `
    @keyframes bgFade${i} {
      0% { opacity: ${i === 0 ? 1 : 0}; }
      ${i === 0 ? `${p(bg.fadeOut - 0.5)}% { opacity: 1; }` : `${p(bg.fadeIn)}% { opacity: 0; } ${p(bg.fadeIn + 0.5)}% { opacity: 1; }`}
      ${p(bg.fadeOut)}% { opacity: 1; }
      ${p(bg.fadeOut + 0.5)}% { opacity: ${i === BG_PHOTOS.length - 1 ? 1 : 0}; }
      100% { opacity: ${i === BG_PHOTOS.length - 1 ? 1 : 0}; }
    }
  `).join('\n')

  // Build comment elements
  const commentEls = COMMENTS.map((c, i) => `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;opacity:0;transform:translateX(120px);animation:commentSlide 0.5s cubic-bezier(0.34,1.2,0.64,1) ${c.t}s forwards;">
      <div style="width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
        <span style="font-family:${SF};font-size:14px;font-weight:600;color:rgba(255,255,255,0.7);">${c.user[0].toUpperCase()}</span>
      </div>
      <div style="flex:1;">
        <span style="font-family:${SF};font-size:17px;font-weight:700;color:${TT_WHITE};">${c.user}</span>
        <span style="font-family:${SF};font-size:18px;color:rgba(255,255,255,0.9);margin-left:8px;">${c.text}</span>
      </div>
    </div>
  `).join('\n')

  // Like count keyframes
  const likeKeyframes = LIKE_STEPS.map((step, i) => {
    const next = LIKE_STEPS[i + 1]
    if (!next) return `${p(step.t)}% { } 100% { }`
    return `${p(step.t)}% { } ${p(next.t - 0.01)}% { }`
  }).join('\n')

  // Build like count display with JS-driven counter
  const likeStepsJSON = JSON.stringify(LIKE_STEPS)

  return `<!DOCTYPE html>
<html>
  <head>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      html, body { margin: 0; padding: 0; background: ${TT_DARK}; overflow: hidden; -webkit-font-smoothing: antialiased; }

      @keyframes commentSlide {
        0% { opacity: 0; transform: translateX(120px); }
        60% { transform: translateX(-6px); }
        100% { opacity: 1; transform: translateX(0); }
      }

      @keyframes fadeIn {
        0% { opacity: 0; }
        100% { opacity: 1; }
      }
      @keyframes fadeUp {
        0% { opacity: 0; transform: translateY(16px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      @keyframes heartPop {
        0% { transform: scale(1); }
        30% { transform: scale(1.35); }
        60% { transform: scale(0.95); }
        100% { transform: scale(1); }
      }
      @keyframes heartColor {
        0% { fill: ${TT_WHITE}; }
        100% { fill: ${TT_PINK}; }
      }
      @keyframes scrollUp {
        0% { transform: translateY(0); }
        100% { transform: translateY(-200px); }
      }
      @keyframes musicScroll {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      @keyframes discSpin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes fadeToBlack {
        0% { opacity: 0; }
        ${p(14.5)}% { opacity: 0; }
        ${p(15.5)}% { opacity: 1; }
        100% { opacity: 1; }
      }

      ${bgKeyframes}

      /* Comment container scrolls up as comments stack */
      @keyframes commentScroll {
        0% { transform: translateY(0); }
        ${p(4)}% { transform: translateY(0); }
        ${p(6)}% { transform: translateY(-60px); }
        ${p(8)}% { transform: translateY(-140px); }
        ${p(10)}% { transform: translateY(-240px); }
        100% { transform: translateY(-240px); }
      }
    </style>
  </head>
  <body>
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${TT_DARK};">

      <!-- Background photos with crossfade -->
      ${bgLayers}

      <!-- TikTok top gradient -->
      <div style="position:absolute;top:0;left:0;right:0;height:200px;background:linear-gradient(180deg,rgba(0,0,0,0.5),transparent);z-index:5;pointer-events:none;"></div>

      <!-- Username + caption area (left side, above SAFE_BOTTOM) -->
      <div style="position:absolute;left:24px;bottom:${SAFE_BOTTOM + 80}px;right:120px;z-index:10;opacity:0;animation:fadeUp 0.5s ease-out 0.3s forwards;">
        <!-- Username with verified badge -->
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
          <span style="font-family:${SF};font-size:24px;font-weight:800;color:${TT_WHITE};">@madebyaidan</span>
          <!-- Verified checkmark -->
          <svg width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" fill="#20D5EC"/><path d="M6 10.5 L8.5 13 L14 7.5" stroke="white" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <!-- Caption -->
        <p style="font-family:${SF};font-size:20px;color:${TT_WHITE};line-height:1.4;margin:0;text-shadow:0 1px 4px rgba(0,0,0,0.5);">Found models in Manila who've never shot before... 📸 <span style="color:rgba(255,255,255,0.7);">#manila #modelsearch #photography</span></p>
      </div>

      <!-- Music bar at bottom (above SAFE_BOTTOM) -->
      <div style="position:absolute;left:24px;bottom:${SAFE_BOTTOM + 30}px;right:100px;z-index:10;display:flex;align-items:center;gap:10px;opacity:0;animation:fadeIn 0.4s ease-out 0.5s forwards;">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="${TT_WHITE}"><path d="M13.5 1v9.1a2.4 2.4 0 1 1-1-2V3.5L6 4.7v7a2.4 2.4 0 1 1-1-2V1.5L13.5 1z"/></svg>
        <div style="overflow:hidden;flex:1;">
          <div style="white-space:nowrap;animation:musicScroll 8s linear infinite;">
            <span style="font-family:${SF};font-size:18px;color:${TT_WHITE};">original sound - madebyaidan &nbsp;&nbsp;&nbsp;&nbsp; original sound - madebyaidan &nbsp;&nbsp;&nbsp;&nbsp;</span>
          </div>
        </div>
      </div>

      <!-- TikTok right sidebar icons -->
      <div style="position:absolute;right:16px;bottom:${SAFE_BOTTOM + 80}px;display:flex;flex-direction:column;align-items:center;gap:22px;z-index:10;">

        <!-- Profile pic -->
        <div style="position:relative;margin-bottom:8px;opacity:0;animation:fadeIn 0.3s ease-out 0.3s forwards;">
          <div style="width:56px;height:56px;border-radius:50%;overflow:hidden;border:2px solid ${TT_WHITE};">
            <img src="${images.avatar}" style="width:100%;height:100%;object-fit:cover;display:block;"/>
          </div>
          <div style="position:absolute;bottom:-8px;left:50%;transform:translateX(-50%);width:22px;height:22px;border-radius:50%;background:${TT_PINK};display:flex;align-items:center;justify-content:center;">
            <span style="font-family:${SF};font-size:16px;font-weight:700;color:white;line-height:1;">+</span>
          </div>
        </div>

        <!-- Heart icon - animate from white to red at 3s -->
        <div style="display:flex;flex-direction:column;align-items:center;gap:4px;opacity:0;animation:fadeIn 0.3s ease-out 0.4s forwards;">
          <div style="animation:heartPop 0.4s ease-out 3.0s forwards;">
            <svg id="heartIcon" width="42" height="42" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" style="fill:${TT_WHITE};animation:heartColor 0.2s ease-out 3.0s forwards;"/>
            </svg>
          </div>
          <span id="likeCount" style="font-family:${SF};font-size:16px;font-weight:600;color:${TT_WHITE};">12.4K</span>
        </div>

        <!-- Comment bubble -->
        <div style="display:flex;flex-direction:column;align-items:center;gap:4px;opacity:0;animation:fadeIn 0.3s ease-out 0.5s forwards;">
          <svg width="38" height="38" viewBox="0 0 24 24" fill="${TT_WHITE}"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <span id="commentCount" style="font-family:${SF};font-size:16px;font-weight:600;color:${TT_WHITE};">847</span>
        </div>

        <!-- Share arrow -->
        <div style="display:flex;flex-direction:column;align-items:center;gap:4px;opacity:0;animation:fadeIn 0.3s ease-out 0.6s forwards;">
          <svg width="38" height="38" viewBox="0 0 24 24" fill="${TT_WHITE}"><path d="M18 8L22 12L18 16V13H11V11H18V8Z"/><path d="M4 4H14V6H6V18H14V20H4V4Z"/></svg>
          <span style="font-family:${SF};font-size:16px;font-weight:600;color:${TT_WHITE};">2,148</span>
        </div>

        <!-- Spinning disc -->
        <div style="width:44px;height:44px;border-radius:50%;border:3px solid #333;overflow:hidden;animation:discSpin 3s linear infinite;opacity:0;animation:discSpin 3s linear infinite, fadeIn 0.3s ease-out 0.7s forwards;">
          <img src="${images.avatar}" style="width:100%;height:100%;object-fit:cover;display:block;"/>
        </div>
      </div>

      <!-- Comments overlay area -->
      <div style="position:absolute;left:16px;right:100px;bottom:${SAFE_BOTTOM + 200}px;height:400px;overflow:hidden;z-index:12;">
        <div style="position:absolute;bottom:0;left:0;right:0;animation:commentScroll ${TOTAL_DURATION}s linear 0s forwards;">
          ${commentEls}
        </div>
      </div>

      <!-- Fade to black -->
      <div style="position:absolute;inset:0;background:#000;z-index:50;pointer-events:none;opacity:0;animation:fadeToBlack ${TOTAL_DURATION}s linear 0s forwards;"></div>

    </div>

    <script>
      // Animate like count
      const likeSteps = ${likeStepsJSON};
      const likeEl = document.getElementById('likeCount');
      const totalDur = ${TOTAL_DURATION} * 1000;
      const start = Date.now();
      let currentIdx = 0;
      function updateLike() {
        const elapsed = (Date.now() - start) / 1000;
        for (let i = likeSteps.length - 1; i >= 0; i--) {
          if (elapsed >= likeSteps[i].t) {
            if (likeEl) likeEl.textContent = likeSteps[i].val;
            break;
          }
        }
        if (elapsed < ${TOTAL_DURATION}) requestAnimationFrame(updateLike);
      }
      requestAnimationFrame(updateLike);

      // Animate comment count
      const commentEl = document.getElementById('commentCount');
      let cCount = 847;
      function updateComments() {
        const elapsed = (Date.now() - start) / 1000;
        const newCount = 847 + Math.floor(elapsed * 40);
        if (commentEl) commentEl.textContent = newCount.toLocaleString();
        if (elapsed < ${TOTAL_DURATION}) requestAnimationFrame(updateComments);
      }
      requestAnimationFrame(updateComments);
    </script>
  </body>
</html>`
}

function buildCTA(images) {
  return `<!DOCTYPE html>
<html>
  <head>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      html, body { margin: 0; padding: 0; background: #000; -webkit-font-smoothing: antialiased; }
    </style>
  </head>
  <body>
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#000;">

      <!-- 3 staggered photos -->
      <div style="position:absolute;top:140px;left:50%;transform:translateX(-50%);width:900px;height:680px;">
        <div style="position:absolute;left:0;top:40px;width:340px;height:480px;border-radius:14px;overflow:hidden;transform:rotate(-4deg);box-shadow:0 8px 30px rgba(0,0,0,0.6);">
          <img src="${images.cta1}" style="${imageStyle(images.cta1_name)}display:block;"/>
        </div>
        <div style="position:absolute;left:280px;top:0;width:340px;height:480px;border-radius:14px;overflow:hidden;z-index:2;box-shadow:0 8px 30px rgba(0,0,0,0.6);">
          <img src="${images.cta2}" style="${imageStyle(images.cta2_name)}display:block;"/>
        </div>
        <div style="position:absolute;right:0;top:60px;width:340px;height:480px;border-radius:14px;overflow:hidden;transform:rotate(3deg);box-shadow:0 8px 30px rgba(0,0,0,0.6);">
          <img src="${images.cta3}" style="${imageStyle(images.cta3_name)}display:block;"/>
        </div>
        <!-- Gradient overlay -->
        <div style="position:absolute;inset:0;background:linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.7) 70%, #000 100%);z-index:3;"></div>
      </div>

      <!-- CTA text block (above SAFE_BOTTOM) -->
      <div style="position:absolute;left:0;right:0;bottom:${SAFE_BOTTOM + 60}px;display:flex;flex-direction:column;align-items:center;z-index:10;">
        <p style="font-family:${SF};font-size:180px;font-weight:900;color:${TT_WHITE};letter-spacing:0.06em;margin:0;text-transform:uppercase;text-shadow:0 0 40px rgba(232,68,58,0.3);">MANILA</p>
        <p style="font-family:${SF};font-size:40px;font-weight:600;color:rgba(255,255,255,0.85);letter-spacing:0.12em;margin:10px 0 0;text-transform:uppercase;">MODEL SEARCH</p>

        <!-- Red button -->
        <div style="margin:40px 0 0;background:${MANILA_COLOR};border-radius:40px;padding:20px 80px;">
          <span style="font-family:${SF};font-size:30px;font-weight:800;color:${TT_WHITE};letter-spacing:0.04em;text-transform:uppercase;">SIGN UP NOW</span>
        </div>

        <!-- Subtext -->
        <p style="font-family:${SF};font-size:22px;color:rgba(255,255,255,0.5);margin:20px 0 0;">@madebyaidan · Limited spots · No experience needed</p>
      </div>

    </div>
  </body>
</html>`
}

async function render() {
  resetOutputDir()

  const selection = {
    avatar: 'manila-gallery-closeup-001.jpg',
    bg1: 'manila-gallery-graffiti-001.jpg',
    bg2: 'manila-gallery-garden-001.jpg',
    bg3: 'manila-gallery-night-001.jpg',
    cta1: 'manila-gallery-dsc-0075.jpg',
    cta2: 'manila-gallery-ivy-001.jpg',
    cta3: 'manila-gallery-floor-001.jpg',
  }

  writeSources({
    createdAt: new Date().toISOString(),
    strategy: 'v55 — TikTok viral video with comments flooding in',
    safeBottomPixels: SAFE_BOTTOM,
    images: selection
  })

  // Build data URIs, keeping track of original names for purple crop logic
  const images = {}
  for (const [key, file] of Object.entries(selection)) {
    images[key] = readImage(file)
    images[`${key}_name`] = file
  }

  /* ---------- Part 1: Record TikTok video ---------- */
  console.log('Recording TikTok comments video as MP4...')

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
  await videoPage.setContent(buildTikTokAd(images), { waitUntil: 'load' })
  await videoPage.waitForTimeout(500)
  await videoPage.waitForTimeout(TOTAL_DURATION_MS)

  await videoPage.close()
  await videoCtx.close()

  // Convert webm to mp4
  const videoFiles = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.webm'))
  const { execSync } = await import('child_process')
  let videoMp4 = null

  if (videoFiles.length > 0) {
    const srcVideo = path.join(OUT_DIR, videoFiles[0])
    videoMp4 = path.join(OUT_DIR, '01_tiktok_video.mp4')
    try {
      execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${videoMp4}"`, { stdio: 'pipe' })
      fs.unlinkSync(srcVideo)
      console.log('Rendered 01_tiktok_video.mp4')
    } catch {
      console.warn('ffmpeg convert failed, keeping webm...')
      fs.renameSync(srcVideo, videoMp4)
    }
  }

  /* ---------- Part 2: Render CTA screenshot ---------- */
  console.log('Rendering CTA screenshot...')

  const ctaCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
  })
  const ctaPage = await ctaCtx.newPage()
  await ctaPage.setContent(buildCTA(images), { waitUntil: 'load' })
  await ctaPage.waitForTimeout(300)
  const ctaPng = path.join(OUT_DIR, '02_cta.png')
  await ctaPage.screenshot({ path: ctaPng, type: 'png' })
  console.log('Rendered 02_cta.png')
  await ctaPage.close()
  await ctaCtx.close()
  await browser.close()

  /* ---------- Part 3: Composite via ffmpeg ---------- */
  if (videoMp4 && fs.existsSync(videoMp4)) {
    console.log('Compositing final video + CTA...')
    const finalMp4 = path.join(OUT_DIR, 'tiktok_manila_ad.mp4')
    try {
      // CTA as 5s still image, concat with video
      const ctaVideo = path.join(OUT_DIR, '_cta_segment.mp4')
      execSync(`ffmpeg -y -loop 1 -i "${ctaPng}" -c:v libx264 -t 5 -pix_fmt yuv420p -r 30 -vf "scale=${WIDTH}:${HEIGHT}" "${ctaVideo}"`, { stdio: 'pipe' })

      // Concat list
      const concatList = path.join(OUT_DIR, '_concat.txt')
      fs.writeFileSync(concatList, `file '01_tiktok_video.mp4'\nfile '_cta_segment.mp4'\n`)

      execSync(`ffmpeg -y -f concat -safe 0 -i "${concatList}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${finalMp4}"`, { stdio: 'pipe', cwd: OUT_DIR })

      // Clean up intermediates
      fs.unlinkSync(ctaVideo)
      fs.unlinkSync(concatList)
      console.log('Rendered tiktok_manila_ad.mp4 (video + CTA)')
    } catch (err) {
      console.warn('ffmpeg composite failed:', err.message)
      console.log('Individual files remain: 01_tiktok_video.mp4 + 02_cta.png')
    }
  }

  console.log(`Done: output written to ${OUT_DIR}`)
}

render().catch(error => {
  console.error(error)
  process.exit(1)
})
