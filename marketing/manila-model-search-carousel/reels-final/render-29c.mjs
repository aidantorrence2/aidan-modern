import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, "output-29c")

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 430
const SAFE_TOP = 213
const SAFE_LEFT = 66
const SAFE_RIGHT = 1027

const TOTAL_DURATION_MS = 24000

const PHOTOS = [
  { src: 'manila-gallery-dsc-0075.jpg', name: 'Jill', city: 'Bali' },
  { src: 'manila-gallery-night-001.jpg', name: 'Dorahan', city: 'Tokyo' },
  { src: 'manila-gallery-garden-001.jpg', name: 'Sumika', city: 'Tokyo' },
  { src: 'manila-gallery-canal-001.jpg', name: 'Hana', city: 'Bratislava' },
  { src: 'manila-gallery-ivy-001.jpg', name: 'Ellie', city: 'Tokyo' },
  { src: 'manila-gallery-urban-001.jpg', name: 'Yana', city: 'Warsaw' },
  { src: 'manila-gallery-shadow-001.jpg', name: 'Josephine', city: 'Bali' },
  { src: 'manila-gallery-dsc-0190.jpg', name: 'Dia', city: 'Bali' },
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
  // Timeline:
  // 0–14s    Scene 2: Photos develop one by one (dark red → full color) — starts immediately
  // 14–18s   Scene 3: Steps in darkroom text style
  // 18–22s   Scene 4: CTA

  const photoHtml = PHOTOS.map((p, i) => `
    <div id="photo-wrap-${i}" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:0;">
      <!-- Darkroom frame border -->
      <div style="position:relative;border:1px solid rgba(140,30,30,0.3);padding:14px;background:rgba(40,5,5,0.3);max-width:90%;max-height:80%;">
        <div style="position:relative;overflow:hidden;line-height:0;">
          <img id="photo-img-${i}" src="${imageDataMap[p.src]}" style="width:100%;height:auto;display:block;max-height:${HEIGHT - SAFE_BOTTOM - SAFE_TOP - 300}px;object-fit:contain;filter:brightness(0.3) saturate(0) sepia(1) hue-rotate(320deg);transition:filter 1.8s cubic-bezier(0.25,0.46,0.45,0.94);"/>
          <!-- Red safelight reflection -->
          <div id="photo-red-${i}" style="position:absolute;inset:0;background:radial-gradient(ellipse at 30% 20%, rgba(180,30,30,0.2) 0%, transparent 50%);pointer-events:none;transition:opacity 1.8s ease;"></div>
          <!-- Chemical wash overlay -->
          <div id="photo-wash-${i}" style="position:absolute;inset:0;overflow:hidden;pointer-events:none;transition:opacity 2s ease;">
            <div style="position:absolute;top:0;left:0;width:200%;height:100%;background:linear-gradient(90deg, transparent 0%, rgba(180,40,40,0.08) 40%, rgba(180,40,40,0.12) 50%, rgba(180,40,40,0.08) 60%, transparent 100%);animation:chemWash 3s ease-in-out infinite;"></div>
          </div>
        </div>
        <!-- Caption below image -->
        <div style="display:flex;justify-content:space-between;align-items:baseline;margin-top:16px;padding:0 4px;">
          <span style="font-family:system-ui,sans-serif;font-size:28px;color:#aa8888;letter-spacing:4px;text-transform:uppercase;font-weight:300;">${p.name}</span>
          <span style="font-family:ui-monospace,monospace;font-size:22px;color:#664444;letter-spacing:2px;">${p.city}</span>
        </div>
        <!-- Film frame number -->
        <div style="position:absolute;top:-20px;right:14px;font-family:ui-monospace,monospace;font-size:20px;color:#442222;letter-spacing:2px;">${String(i + 1).padStart(2, '0')}A</div>
      </div>
    </div>
  `).join('')

  return `<!DOCTYPE html>
<html>
<head>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { margin: 0; padding: 0; background: #1a0000; overflow: hidden; }

  @keyframes safelightPulse {
    0%, 100% { opacity: 0.03; }
    50% { opacity: 0.08; }
  }

  @keyframes chemWash {
    0% { transform: translateX(-100%) skewX(-5deg); opacity: 0; }
    30% { opacity: 0.08; }
    100% { transform: translateX(100%) skewX(-5deg); opacity: 0; }
  }

  @keyframes devDrip {
    0% { height: 0%; opacity: 0.4; }
    100% { height: 100%; opacity: 0; }
  }

  @keyframes captionIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes heroGlow {
    0%, 100% { text-shadow: 0 0 40px rgba(180,40,40,0.3); }
    50% { text-shadow: 0 0 60px rgba(180,40,40,0.5); }
  }

  @keyframes developReveal {
    0% { opacity: 0; filter: brightness(0.2) saturate(0) sepia(1) hue-rotate(320deg); }
    30% { opacity: 1; filter: brightness(0.4) saturate(0.2) sepia(0.8) hue-rotate(320deg); }
    100% { opacity: 1; filter: brightness(1) saturate(1) sepia(0) hue-rotate(0deg); }
  }

  @keyframes textDevelop {
    0% { opacity: 0; color: #3a0000; }
    30% { opacity: 0.6; color: #884444; }
    100% { opacity: 1; color: #cc9999; }
  }
</style>
</head>
<body>
  <div id="root" style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#1a0000;">

    <!-- ═══ PERSISTENT OVERLAYS ═══ -->

    <!-- Safelight glow from top -->
    <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 0%, rgba(180,30,30,0.15) 0%, transparent 60%);pointer-events:none;z-index:50;animation:safelightPulse 4s ease-in-out infinite;"></div>

    <!-- Chemical tray reflection at bottom -->
    <div style="position:absolute;bottom:0;left:0;width:100%;height:200px;background:linear-gradient(to top, rgba(140,20,20,0.06) 0%, transparent 100%);pointer-events:none;z-index:50;"></div>

    <!-- Developer drip lines on sides -->
    <div style="position:absolute;top:0;left:30px;width:1px;background:linear-gradient(180deg, rgba(180,30,30,0.15) 0%, transparent 100%);z-index:51;pointer-events:none;animation:devDrip 4s ease-in-out infinite;"></div>
    <div style="position:absolute;top:0;right:45px;width:1px;background:linear-gradient(180deg, rgba(180,30,30,0.1) 0%, transparent 100%);z-index:51;pointer-events:none;animation:devDrip 4s ease-in-out infinite 1.5s;"></div>

    <!-- Persistent "Manila Free Photo Shoot" title — one line, always on screen -->
    <div id="persistent-title" style="position:absolute;top:${SAFE_TOP + 20}px;left:0;right:0;text-align:center;z-index:45;pointer-events:none;opacity:0;">
      <h1 style="font-family:system-ui,sans-serif;font-size:42px;font-weight:300;letter-spacing:5px;text-transform:uppercase;color:#cc9999;margin:0;white-space:nowrap;animation:heroGlow 3s ease-in-out infinite;">Manila Free Photo Shoot</h1>
    </div>

    <!-- Counter -->
    <div id="counter" style="position:absolute;right:40px;bottom:${SAFE_BOTTOM + 30}px;z-index:55;font-family:ui-monospace,monospace;font-size:24px;color:#884444;letter-spacing:2px;"></div>

    <!-- ═══ SCENE 2: PHOTO SLIDESHOW (starts immediately) ═══ -->
    <div id="scene2" style="position:absolute;inset:0;z-index:5;opacity:1;">
      ${photoHtml}
    </div>

    <!-- ═══ SCENE 3: STEPS ═══ -->
    <div id="scene3" style="position:absolute;inset:0;z-index:5;opacity:0;display:flex;flex-direction:column;justify-content:center;padding:0 ${SAFE_LEFT + 20}px;">
      <div style="opacity:0;" id="steps-head">
        <div style="font-family:system-ui,sans-serif;font-size:24px;letter-spacing:6px;color:#664444;text-transform:uppercase;font-weight:300;margin-bottom:16px;">How It Works</div>
        <h2 style="font-family:system-ui,sans-serif;font-size:80px;font-weight:300;letter-spacing:6px;color:#cc9999;text-transform:uppercase;margin:0;animation:heroGlow 3s ease-in-out infinite;">3 Steps</h2>
      </div>

      <div style="margin-top:60px;">
        <div style="margin-bottom:50px;opacity:0;border-left:2px solid rgba(140,30,30,0.3);padding-left:28px;" id="s3-step1">
          <div style="font-family:ui-monospace,monospace;font-size:20px;letter-spacing:4px;color:#442222;text-transform:uppercase;">01</div>
          <div style="font-family:system-ui,sans-serif;font-size:42px;font-weight:300;letter-spacing:3px;color:#cc9999;text-transform:uppercase;margin-top:8px;">DM me on Instagram</div>
          <div style="font-family:system-ui,sans-serif;font-size:26px;color:#664444;letter-spacing:2px;margin-top:8px;">Just say hey. I'll reply back.</div>
        </div>

        <div style="margin-bottom:50px;opacity:0;border-left:2px solid rgba(140,30,30,0.3);padding-left:28px;" id="s3-step2">
          <div style="font-family:ui-monospace,monospace;font-size:20px;letter-spacing:4px;color:#442222;text-transform:uppercase;">02</div>
          <div style="font-family:system-ui,sans-serif;font-size:42px;font-weight:300;letter-spacing:3px;color:#cc9999;text-transform:uppercase;margin-top:8px;">We pick a date</div>
          <div style="font-family:system-ui,sans-serif;font-size:26px;color:#664444;letter-spacing:2px;margin-top:8px;">Location + vibe planned together.</div>
        </div>

        <div style="opacity:0;border-left:2px solid rgba(140,30,30,0.3);padding-left:28px;" id="s3-step3">
          <div style="font-family:ui-monospace,monospace;font-size:20px;letter-spacing:4px;color:#442222;text-transform:uppercase;">03</div>
          <div style="font-family:system-ui,sans-serif;font-size:42px;font-weight:300;letter-spacing:3px;color:#cc9999;text-transform:uppercase;margin-top:8px;">Show up. I guide you.</div>
          <div style="font-family:system-ui,sans-serif;font-size:26px;color:#664444;letter-spacing:2px;margin-top:8px;">No posing experience needed.</div>
        </div>
      </div>
    </div>

    <!-- ═══ SCENE 4: CTA ═══ -->
    <div id="scene4" style="position:absolute;inset:0;z-index:5;opacity:0;display:flex;flex-direction:column;align-items:center;justify-content:center;">
      <div id="cta-content" style="text-align:center;opacity:0;">
        <div style="font-family:system-ui,sans-serif;font-size:24px;letter-spacing:6px;color:#664444;text-transform:uppercase;font-weight:300;margin-bottom:20px;">Interested?</div>
        <h2 style="font-family:system-ui,sans-serif;font-size:80px;font-weight:300;letter-spacing:8px;color:#cc9999;text-transform:uppercase;margin:0;animation:heroGlow 3s ease-in-out infinite;">DM Me</h2>

        <div style="margin-top:50px;border:1px solid rgba(204,153,153,0.2);padding:28px 56px;opacity:0;" id="cta-handle">
          <div style="font-family:system-ui,sans-serif;font-size:48px;letter-spacing:4px;color:#cc9999;font-weight:300;">@madebyaidan</div>
          <div style="font-family:system-ui,sans-serif;font-size:20px;letter-spacing:4px;color:#664444;text-transform:uppercase;margin-top:10px;">On Instagram</div>
        </div>

        <div style="margin-top:40px;opacity:0;" id="cta-spots">
          <div style="font-family:ui-monospace,monospace;font-size:22px;letter-spacing:4px;color:#884444;">Limited Spots This Month</div>
        </div>
        <div style="margin-top:24px;font-family:ui-monospace,monospace;font-size:18px;color:#442222;letter-spacing:3px;opacity:0;" id="cta-free">100% Free · No Strings</div>
      </div>
    </div>

  </div>

  <script>
    const counter = document.getElementById('counter')

    function fadeIn(id, ms, dur) {
      dur = dur || 600
      setTimeout(() => {
        const el = document.getElementById(id)
        if (el) {
          el.style.transition = 'opacity '+dur+'ms ease-out, transform '+dur+'ms ease-out, filter 2s ease'
          el.style.opacity = '1'
        }
      }, ms)
    }

    function hide(id) {
      const el = document.getElementById(id)
      if (el) el.style.opacity = '0'
    }
    function show(id) {
      const el = document.getElementById(id)
      if (el) { el.style.transition = 'opacity 0.4s ease'; el.style.opacity = '1' }
    }

    // Develop a photo: reveal from darkroom red to full color
    function developPhoto(index, startMs) {
      // Show the photo wrapper
      setTimeout(() => {
        const wrap = document.getElementById('photo-wrap-' + index)
        if (wrap) { wrap.style.transition = 'opacity 0.3s ease'; wrap.style.opacity = '1' }
        counter.textContent = String(index + 1).padStart(2, '0') + ' / ' + String(${PHOTOS.length}).padStart(2, '0')
      }, startMs)

      // Start developing (remove sepia filter)
      setTimeout(() => {
        const img = document.getElementById('photo-img-' + index)
        if (img) img.style.filter = 'brightness(1) saturate(1) sepia(0) hue-rotate(0deg)'
        const red = document.getElementById('photo-red-' + index)
        if (red) red.style.opacity = '0'
        const wash = document.getElementById('photo-wash-' + index)
        if (wash) wash.style.opacity = '0'
      }, startMs + 300)

      // Hide photo before next
      if (index < ${PHOTOS.length - 1}) {
        setTimeout(() => {
          const wrap = document.getElementById('photo-wrap-' + index)
          if (wrap) { wrap.style.transition = 'opacity 0.2s ease'; wrap.style.opacity = '0' }
        }, startMs + 1450)
      }
    }

    // ═══ PERSISTENT TITLE (always on screen) ═══
    setTimeout(() => {
      const el = document.getElementById('persistent-title')
      if (el) el.style.animation = 'developReveal 2s ease-out forwards'
    }, 200)

    // ═══ SCENE 2: PHOTOS (0–14s, starts immediately) ═══
    // Each photo gets ~1.6s (develop + hold + fade out)
    ${PHOTOS.map((_, i) => `developPhoto(${i}, ${500 + i * 1650})`).join('\n    ')}

    // ═══ SCENE 3: STEPS (14–18s) ═══
    setTimeout(() => {
      hide('scene2')
      show('scene3')
    }, 14000)

    fadeIn('steps-head', 14200, 800)
    fadeIn('s3-step1', 14800, 800)
    fadeIn('s3-step2', 15800, 800)
    fadeIn('s3-step3', 16800, 800)

    // ═══ SCENE 4: CTA (18–22s) ═══
    setTimeout(() => {
      hide('scene3')
      show('scene4')
      counter.textContent = ''
    }, 18000)

    setTimeout(() => {
      const el = document.getElementById('cta-content')
      if (el) el.style.animation = 'developReveal 2s ease-out forwards'
    }, 18200)

    fadeIn('cta-handle', 19200, 800)
    fadeIn('cta-spots', 20000, 600)
    fadeIn('cta-free', 20600, 600)
  </script>
</body>
</html>`
}

async function render() {
  resetOutputDir()

  const imageDataMap = {}
  for (const photo of PHOTOS) {
    imageDataMap[photo.src] = readImage(photo.src)
  }

  writeSources({
    createdAt: new Date().toISOString(),
    strategy: 'v29c — darkroom reveal aesthetic (based on /home/v12) with chemical develop transitions',
    safeBottomPixels: SAFE_BOTTOM,
    photos: PHOTOS.map(p => p.src),
  })

  const browser = await chromium.launch()
  console.log('Recording darkroom version...')

  const videoCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    recordVideo: { dir: OUT_DIR, size: { width: WIDTH, height: HEIGHT } }
  })

  const videoPage = await videoCtx.newPage()
  await videoPage.evaluate(() => {
    document.documentElement.style.background = '#1a0000'
    document.body.style.background = '#1a0000'
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
  const dstVideo = path.join(OUT_DIR, 'manila-darkroom-v29c.mp4')

  const { execSync } = await import('child_process')
  try {
    execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${dstVideo}"`, { stdio: 'pipe' })
    fs.unlinkSync(srcVideo)
    console.log('Rendered manila-darkroom-v29c.mp4')
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
