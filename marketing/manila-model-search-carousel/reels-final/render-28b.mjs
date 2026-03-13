import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, "output-28b")

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 430
const SAFE_TOP = 213
const SAFE_LEFT = 66
const SAFE_RIGHT = 1027

const TOTAL_DURATION_MS = 24000 // 22s + 2s buffer

// Selected photos for the slideshow scenes
const SLIDESHOW_PHOTOS = [
  { src: 'manila-gallery-dsc-0075.jpg', name: 'Jill', city: 'Bali' },
  { src: 'manila-gallery-night-001.jpg', name: 'Dorahan', city: 'Tokyo' },
  { src: 'manila-gallery-garden-001.jpg', name: 'Sumika', city: 'Tokyo' },
  { src: 'manila-gallery-canal-001.jpg', name: 'Hana', city: 'Bratislava' },
  { src: 'manila-gallery-ivy-001.jpg', name: 'Ellie', city: 'Tokyo' },
  { src: 'manila-gallery-urban-001.jpg', name: 'Yana', city: 'Warsaw' },
  { src: 'manila-gallery-shadow-001.jpg', name: 'Josephine', city: 'Bali' },
  { src: 'manila-gallery-dsc-0190.jpg', name: 'Dia', city: 'Bali' },
  { src: 'manila-gallery-floor-001.jpg', name: 'Francisca', city: 'Cascais' },
  { src: 'manila-gallery-closeup-001.jpg', name: 'Jill', city: 'Bali' },
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
  const CREAM = 'rgba(255, 240, 200'
  const MONO = "'Courier New', monospace"

  // Timeline:
  // 0–3s     Scene 1: Title burn-in "Models Wanted" + subtitle
  // 3–3.2s   Blackout
  // 3.2–13s  Scene 2: Rapid photo slideshow (10 photos, ~1s each with blackout flashes)
  // 13–13.2s Blackout
  // 13.2–18s Scene 3: "3 steps" with film projector text
  // 18–18.2s Blackout
  // 18.2–22s Scene 4: CTA

  // Build photo slides HTML — stacked, JS will cycle through them
  const photoSlidesHtml = SLIDESHOW_PHOTOS.map((p, i) => `
    <div id="slide-${i}" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:0;">
      <img src="${imageDataMap[p.src]}" style="max-width:92%;max-height:88%;object-fit:contain;display:block;"/>
      <!-- Caption -->
      <div style="position:absolute;bottom:120px;left:40px;font-family:${MONO};z-index:10;">
        <div style="font-size:34px;letter-spacing:6px;color:${CREAM}, 0.75);text-transform:uppercase;">${p.name}</div>
        <div style="font-size:24px;letter-spacing:8px;color:${CREAM}, 0.45);text-transform:uppercase;margin-top:6px;">${p.city}</div>
      </div>
      <!-- Frame counter -->
      <div style="position:absolute;bottom:120px;right:40px;font-family:${MONO};font-size:26px;letter-spacing:4px;color:${CREAM}, 0.4);z-index:10;">
        FRAME ${String(i + 1).padStart(2, '0')}/${String(SLIDESHOW_PHOTOS.length).padStart(2, '0')}
      </div>
    </div>
  `).join('')

  return `<!DOCTYPE html>
<html>
<head>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { margin: 0; padding: 0; background: #0c0c0c; overflow: hidden; }

  @keyframes burnIn {
    0% { opacity: 0; filter: brightness(3) blur(6px); }
    40% { opacity: 1; filter: brightness(1.8) blur(2px); }
    100% { opacity: 1; filter: brightness(1) blur(0); }
  }

  @keyframes grainShift {
    0% { transform: translate(0, 0); }
    33% { transform: translate(-2px, 1px); }
    66% { transform: translate(1px, -2px); }
    100% { transform: translate(0, 0); }
  }

  @keyframes hueShift {
    0%, 100% { background: rgba(255, 200, 150, 0.02); }
    33% { background: rgba(200, 255, 200, 0.015); }
    66% { background: rgba(200, 180, 255, 0.015); }
  }

  @keyframes dustFloat {
    0% { transform: translate(0, 0); }
    25% { transform: translate(15px, -25px); }
    50% { transform: translate(-10px, -15px); }
    75% { transform: translate(20px, -5px); }
    100% { transform: translate(0, 0); }
  }

  @keyframes fadeTextIn {
    0% { opacity: 0; transform: translateY(10px); }
    100% { opacity: 1; transform: translateY(0); }
  }

  @keyframes blinkCursor {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
</style>
</head>
<body>
  <div id="root" style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#0c0c0c;">

    <!-- ═══ PERSISTENT OVERLAYS ═══ -->

    <!-- Projector light beam from top -->
    <div style="position:absolute;top:-20px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:${WIDTH*0.45}px solid transparent;border-right:${WIDTH*0.45}px solid transparent;border-top:200px solid ${CREAM}, 0.025);pointer-events:none;z-index:50;"></div>

    <!-- Warm color temperature -->
    <div style="position:absolute;inset:0;background:rgba(180,120,60,0.06);mix-blend-mode:multiply;pointer-events:none;z-index:51;"></div>

    <!-- Color shift -->
    <div style="position:absolute;inset:0;pointer-events:none;z-index:52;animation:hueShift 12s ease-in-out infinite;"></div>

    <!-- Vignette -->
    <div style="position:absolute;inset:0;background:radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 80%, rgba(0,0,0,0.85) 100%);pointer-events:none;z-index:53;"></div>

    <!-- Film grain -->
    <div style="position:absolute;inset:0;opacity:0.06;pointer-events:none;z-index:54;background-image:url(&quot;data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E&quot;);background-size:150px 150px;animation:grainShift 0.3s steps(3) infinite;"></div>

    <!-- Scanlines -->
    <div style="position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.03) 3px,rgba(0,0,0,0.03) 4px);pointer-events:none;z-index:55;"></div>

    <!-- Dust particles -->
    <div style="position:absolute;left:15%;top:25%;width:3px;height:3px;border-radius:50%;background:${CREAM},0.6);z-index:56;filter:blur(0.5px);animation:dustFloat 8s ease-in-out infinite;"></div>
    <div style="position:absolute;left:72%;top:40%;width:2px;height:2px;border-radius:50%;background:${CREAM},0.5);z-index:56;filter:blur(0.5px);animation:dustFloat 11s ease-in-out infinite 2s;"></div>
    <div style="position:absolute;left:45%;top:65%;width:2.5px;height:2.5px;border-radius:50%;background:${CREAM},0.4);z-index:56;filter:blur(0.5px);animation:dustFloat 9s ease-in-out infinite 4s;"></div>
    <div style="position:absolute;left:85%;top:15%;width:2px;height:2px;border-radius:50%;background:${CREAM},0.5);z-index:56;filter:blur(0.5px);animation:dustFloat 10s ease-in-out infinite 1s;"></div>

    <!-- Blackout overlay -->
    <div id="blackout" style="position:absolute;inset:0;background:#000;z-index:60;opacity:0;transition:opacity 0.05s ease;pointer-events:none;"></div>

    <!-- ═══ SCENE CONTAINERS ═══ -->

    <!-- Scene 1: Title -->
    <div id="scene1" style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:2;">
      <div id="title-content" style="text-align:center;opacity:0;">
        <h1 style="font-family:${MONO};font-size:100px;font-weight:400;letter-spacing:10px;color:${CREAM},0.95);text-transform:uppercase;margin:0;line-height:1.05;text-shadow:0 0 40px rgba(255,220,150,0.4),0 0 80px rgba(255,200,100,0.15);">Manila<br/>Free<br/>Photo<br/>Shoot</h1>
        <div style="font-family:${MONO};font-size:28px;letter-spacing:6px;color:${CREAM},0.55);text-transform:uppercase;margin-top:40px;">No Experience Needed</div>
      </div>
    </div>

    <!-- Scene 2: Photo slideshow -->
    <div id="scene2" style="position:absolute;inset:0;z-index:1;opacity:0;">
      <!-- Persistent header -->
      <div style="position:absolute;top:${SAFE_TOP}px;left:0;right:0;text-align:center;z-index:10;pointer-events:none;">
        <div style="font-family:${MONO};font-size:34px;font-weight:400;letter-spacing:10px;color:${CREAM},0.7);text-transform:uppercase;">Aidan Torrence</div>
        <div style="font-family:${MONO};font-size:20px;letter-spacing:6px;color:${CREAM},0.4);text-transform:uppercase;margin-top:6px;">Film Photographer</div>
      </div>
      ${photoSlidesHtml}
    </div>

    <!-- Scene 3: How it works -->
    <div id="scene3" style="position:absolute;inset:0;z-index:1;opacity:0;display:flex;flex-direction:column;align-items:center;justify-content:center;">
      <div id="steps-content" style="text-align:center;width:${SAFE_RIGHT - SAFE_LEFT}px;">
        <div style="font-family:${MONO};font-size:30px;letter-spacing:10px;color:${CREAM},0.55);text-transform:uppercase;margin-bottom:20px;opacity:0;" id="steps-pre">How It Works</div>
        <h2 style="font-family:${MONO};font-size:84px;font-weight:400;letter-spacing:10px;color:${CREAM},0.95);text-transform:uppercase;margin:0;text-shadow:0 0 30px rgba(255,220,150,0.3);opacity:0;" id="steps-title">3 Steps</h2>

        <div style="margin-top:60px;text-align:left;padding:0 40px;">
          <div style="margin-bottom:50px;opacity:0;" id="step-1">
            <div style="font-family:${MONO};font-size:24px;letter-spacing:8px;color:${CREAM},0.5);text-transform:uppercase;">Step 01</div>
            <div style="font-family:${MONO};font-size:44px;font-weight:400;letter-spacing:4px;color:${CREAM},0.9);text-transform:uppercase;margin-top:10px;">DM me on Instagram</div>
            <div style="font-family:${MONO};font-size:28px;letter-spacing:4px;color:${CREAM},0.5);margin-top:8px;">Just say hey. I'll reply back.</div>
          </div>

          <div style="margin-bottom:50px;opacity:0;" id="step-2">
            <div style="font-family:${MONO};font-size:24px;letter-spacing:8px;color:${CREAM},0.5);text-transform:uppercase;">Step 02</div>
            <div style="font-family:${MONO};font-size:44px;font-weight:400;letter-spacing:4px;color:${CREAM},0.9);text-transform:uppercase;margin-top:10px;">We pick a date</div>
            <div style="font-family:${MONO};font-size:28px;letter-spacing:4px;color:${CREAM},0.5);margin-top:8px;">Location + vibe planned together.</div>
          </div>

          <div style="opacity:0;" id="step-3">
            <div style="font-family:${MONO};font-size:24px;letter-spacing:8px;color:${CREAM},0.5);text-transform:uppercase;">Step 03</div>
            <div style="font-family:${MONO};font-size:44px;font-weight:400;letter-spacing:4px;color:${CREAM},0.9);text-transform:uppercase;margin-top:10px;">Show up. I guide you.</div>
            <div style="font-family:${MONO};font-size:28px;letter-spacing:4px;color:${CREAM},0.5);margin-top:8px;">No posing experience needed.</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Scene 4: CTA -->
    <div id="scene4" style="position:absolute;inset:0;z-index:1;opacity:0;display:flex;flex-direction:column;align-items:center;justify-content:center;">
      <div id="cta-content" style="text-align:center;opacity:0;">
        <div style="font-family:${MONO};font-size:28px;letter-spacing:8px;color:${CREAM},0.55);text-transform:uppercase;margin-bottom:20px;">Interested?</div>
        <h2 style="font-family:${MONO};font-size:80px;font-weight:400;letter-spacing:10px;color:${CREAM},0.95);text-transform:uppercase;margin:0;text-shadow:0 0 30px rgba(255,220,150,0.3);">DM Me</h2>
        <div style="margin-top:50px;display:inline-block;border:1px solid ${CREAM},0.2);padding:24px 50px;opacity:0;" id="cta-handle">
          <div style="font-family:${MONO};font-size:44px;letter-spacing:6px;color:${CREAM},0.8);text-transform:uppercase;">@madebyaidan</div>
          <div style="font-family:${MONO};font-size:20px;letter-spacing:6px;color:${CREAM},0.3);text-transform:uppercase;margin-top:10px;">On Instagram</div>
        </div>
        <div style="margin-top:40px;opacity:0;" id="cta-spots">
          <div style="font-family:${MONO};font-size:22px;letter-spacing:6px;color:${CREAM},0.25);text-transform:uppercase;animation:blinkCursor 2s ease-in-out infinite;">Limited Spots This Month</div>
        </div>
        <div style="font-family:${MONO};font-size:18px;letter-spacing:4px;color:${CREAM},0.15);text-transform:uppercase;margin-top:60px;opacity:0;" id="cta-free">100% Free · No Strings Attached</div>
      </div>
    </div>

  </div>

  <script>
    const blackout = document.getElementById('blackout')

    function flash(duration) {
      return new Promise(resolve => {
        blackout.style.opacity = '1'
        setTimeout(() => {
          blackout.style.opacity = '0'
          resolve()
        }, duration || 200)
      })
    }

    function showEl(id, delay, animDuration) {
      animDuration = animDuration || 600
      setTimeout(() => {
        const el = document.getElementById(id)
        if (el) {
          el.style.transition = 'opacity ' + animDuration + 'ms ease-out, transform ' + animDuration + 'ms ease-out'
          el.style.opacity = '1'
          el.style.transform = 'translateY(0)'
        }
      }, delay)
    }

    function burnIn(id, delay) {
      setTimeout(() => {
        const el = document.getElementById(id)
        if (el) {
          el.style.animation = 'burnIn 2s ease-out forwards'
        }
      }, delay)
    }

    function hideScene(id) {
      const el = document.getElementById(id)
      if (el) el.style.opacity = '0'
    }

    function showScene(id) {
      const el = document.getElementById(id)
      if (el) el.style.opacity = '1'
    }

    // Flicker effect
    const root = document.getElementById('root')
    function flicker() {
      root.style.opacity = (0.95 + Math.random() * 0.05).toString()
      requestAnimationFrame(flicker)
    }
    requestAnimationFrame(flicker)

    // ═══ SCENE 1: TITLE (0–3s) ═══
    burnIn('title-content', 200)

    // ═══ SCENE 2: PHOTO SLIDESHOW (3–13s) ═══
    // At 3s: blackout, hide scene1, show scene2, cycle through photos
    setTimeout(async () => {
      await flash(200)
      hideScene('scene1')
      showScene('scene2')

      // Cycle through 10 photos, ~0.9s each with 0.1s blackout between
      for (let i = 0; i < ${SLIDESHOW_PHOTOS.length}; i++) {
        const slide = document.getElementById('slide-' + i)
        if (slide) slide.style.opacity = '1'

        await new Promise(r => setTimeout(r, 850))

        if (i < ${SLIDESHOW_PHOTOS.length - 1}) {
          await flash(100)
          if (slide) slide.style.opacity = '0'
        }
      }
    }, 3000)

    // ═══ SCENE 3: STEPS (13–18s) ═══
    setTimeout(async () => {
      await flash(200)
      hideScene('scene2')
      showScene('scene3')

      burnIn('steps-pre', 0)
      burnIn('steps-title', 400)
    }, 13000)

    showEl('step-1', 14000, 800)
    showEl('step-2', 15200, 800)
    showEl('step-3', 16400, 800)

    // ═══ SCENE 4: CTA (18–22s) ═══
    setTimeout(async () => {
      await flash(200)
      hideScene('scene3')
      showScene('scene4')

      burnIn('cta-content', 0)
    }, 18000)

    showEl('cta-handle', 19000, 800)
    showEl('cta-spots', 19800, 600)
    showEl('cta-free', 20500, 600)
  </script>
</body>
</html>`
}

async function render() {
  resetOutputDir()

  const imageDataMap = {}
  for (const photo of SLIDESHOW_PHOTOS) {
    imageDataMap[photo.src] = readImage(photo.src)
  }

  writeSources({
    createdAt: new Date().toISOString(),
    strategy: 'v28b — film projector aesthetic (based on /home/v20) with more readable text + Manila Free Photo Shoot title',
    safeBottomPixels: SAFE_BOTTOM,
    photos: SLIDESHOW_PHOTOS.map(p => p.src),
  })

  const browser = await chromium.launch()
  console.log('Recording film projector version...')

  const videoCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    recordVideo: { dir: OUT_DIR, size: { width: WIDTH, height: HEIGHT } }
  })

  const videoPage = await videoCtx.newPage()
  await videoPage.evaluate(() => {
    document.documentElement.style.background = '#0c0c0c'
    document.body.style.background = '#0c0c0c'
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
  const dstVideo = path.join(OUT_DIR, 'manila-film-projector-v28b.mp4')

  const { execSync } = await import('child_process')
  try {
    execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${dstVideo}"`, { stdio: 'pipe' })
    fs.unlinkSync(srcVideo)
    console.log('Rendered manila-film-projector-v28b.mp4')
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
