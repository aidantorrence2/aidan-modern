import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, "output-26b")

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 430
const SAFE_TOP = 213
const SAFE_LEFT = 66
const SAFE_RIGHT = 1027
const MANILA_COLOR = '#E8443A'

const TOTAL_DURATION_MS = 22000

const MONO = "'SF Mono', 'Menlo', 'Courier New', monospace"

const PROOF_PHOTOS = [
  'manila-gallery-dsc-0190.jpg',
  'manila-gallery-night-001.jpg',
  'manila-gallery-garden-001.jpg',
  'manila-gallery-urban-001.jpg',
  'manila-gallery-canal-001.jpg',
  'manila-gallery-ivy-001.jpg',
  'manila-gallery-closeup-001.jpg',
  'manila-gallery-dsc-0911.jpg',
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
  const photoGridHtml = PROOF_PHOTOS.map((p, i) => `
    <div id="photo-${i}" style="border-radius:8px;overflow:hidden;aspect-ratio:3/4;border:2px solid #333;opacity:0;">
      <img src="${imageDataMap[p]}" style="width:100%;height:100%;object-fit:cover;display:block;"/>
    </div>
  `).join('')

  return `<!DOCTYPE html>
<html>
<head>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { margin: 0; padding: 0; background: #0c0c0c; font-family: ${MONO}; }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  @keyframes photoIn {
    0% { opacity: 0; transform: scale(0.9); border-color: #333; }
    50% { border-color: #22c55e; }
    100% { opacity: 1; transform: scale(1); border-color: #333; }
  }

  /* Scene crossfades — 20s total */
  @keyframes s1v { 0%{opacity:1} 24%{opacity:1} 26%{opacity:0} 100%{opacity:0} }
  @keyframes s2v { 0%{opacity:0} 24%{opacity:0} 26%{opacity:1} 49%{opacity:1} 51%{opacity:0} 100%{opacity:0} }
  @keyframes s3v { 0%{opacity:0} 49%{opacity:0} 51%{opacity:1} 74%{opacity:1} 76%{opacity:0} 100%{opacity:0} }
  @keyframes s4v { 0%{opacity:0} 74%{opacity:0} 76%{opacity:1} 100%{opacity:1} }
</style>
</head>
<body>
  <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#0c0c0c;">

    <!-- CRT scanlines -->
    <div style="position:absolute;inset:0;z-index:100;pointer-events:none;background:repeating-linear-gradient(0deg,rgba(0,0,0,0.12) 0px,rgba(0,0,0,0.12) 1px,transparent 1px,transparent 3px);"></div>
    <div style="position:absolute;inset:0;z-index:99;pointer-events:none;background:radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.45) 100%);"></div>

    <!-- SCENE 4: CTA -->
    <div id="scene4" style="position:absolute;inset:0;padding:${SAFE_TOP+20}px ${SAFE_LEFT}px ${SAFE_BOTTOM+20}px;animation:s4v 20s linear forwards;overflow:hidden;">
      <div id="s4" style="font-family:${MONO};"></div>
    </div>

    <!-- SCENE 3: STEPS -->
    <div id="scene3" style="position:absolute;inset:0;padding:${SAFE_TOP+20}px ${SAFE_LEFT}px ${SAFE_BOTTOM+20}px;animation:s3v 20s linear forwards;overflow:hidden;">
      <div id="s3" style="font-family:${MONO};"></div>
    </div>

    <!-- SCENE 2: PORTFOLIO -->
    <div id="scene2" style="position:absolute;inset:0;padding:${SAFE_TOP+20}px ${SAFE_LEFT}px ${SAFE_BOTTOM+20}px;animation:s2v 20s linear forwards;overflow:hidden;">
      <div id="s2" style="font-family:${MONO};"></div>
      <div id="s2-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:0 10px;margin-top:14px;position:absolute;left:${SAFE_LEFT}px;right:${WIDTH-SAFE_RIGHT}px;opacity:0;">
        ${photoGridHtml}
      </div>
    </div>

    <!-- SCENE 1: HOOK -->
    <div id="scene1" style="position:absolute;inset:0;padding:${SAFE_TOP+20}px ${SAFE_LEFT}px ${SAFE_BOTTOM+20}px;animation:s1v 20s linear forwards;overflow:hidden;">
      <div id="s1" style="font-family:${MONO};"></div>
    </div>

  </div>

  <script>
    // ── Terminal typewriter engine ──
    function addLine(containerId, html, delay) {
      setTimeout(() => {
        const c = document.getElementById(containerId)
        if (!c) return
        const div = document.createElement('div')
        div.style.cssText = 'font-size:32px;line-height:1.6;white-space:pre-wrap;word-break:break-word;'
        div.innerHTML = html
        c.appendChild(div)
      }, delay)
    }

    function typeLine(containerId, prefix, text, color, delay, charMs, cursorColor) {
      charMs = charMs || 40
      cursorColor = cursorColor || '#22c55e'
      color = color || '#fff'
      setTimeout(() => {
        const c = document.getElementById(containerId)
        if (!c) return
        const div = document.createElement('div')
        div.style.cssText = 'font-size:32px;line-height:1.6;white-space:pre-wrap;word-break:break-word;'
        if (prefix) {
          const pre = document.createElement('span')
          pre.innerHTML = prefix
          div.appendChild(pre)
        }
        const textSpan = document.createElement('span')
        textSpan.style.color = color
        div.appendChild(textSpan)
        const cursor = document.createElement('span')
        cursor.style.cssText = 'display:inline-block;width:12px;height:28px;background:'+cursorColor+';animation:blink 0.7s step-end infinite;vertical-align:text-bottom;margin-left:2px;'
        div.appendChild(cursor)
        c.appendChild(div)
        const chars = [...text]
        chars.forEach((ch, i) => {
          setTimeout(() => { textSpan.textContent += ch }, i * charMs)
        })
        setTimeout(() => { cursor.style.display = 'none' }, chars.length * charMs + 300)
      }, delay)
    }

    function addProgressBar(containerId, delay, duration) {
      setTimeout(() => {
        const c = document.getElementById(containerId)
        if (!c) return
        const bar = document.createElement('div')
        bar.style.cssText = 'height:8px;background:#222;border-radius:4px;overflow:hidden;margin:10px 0;'
        const fill = document.createElement('div')
        fill.style.cssText = 'height:100%;background:#22c55e;width:0%;border-radius:4px;transition:width '+duration+'ms ease-out;'
        bar.appendChild(fill)
        c.appendChild(bar)
        requestAnimationFrame(() => { fill.style.width = '100%' })
      }, delay)
    }

    const P = '<span style="color:${MANILA_COLOR};">manila</span> <span style="color:#555;">~</span> '

    // ═══ SCENE 1: HOOK (0–5s) ═══
    addLine('s1', '<span style="color:#555;">$ last login: today on ttys001</span>', 200)
    typeLine('s1', P, './manila --search "models wanted"', '#fff', 500, 38, '${MANILA_COLOR}')

    // Thinking dots
    setTimeout(() => {
      const c = document.getElementById('s1')
      if (!c) return
      const div = document.createElement('div')
      div.id = 's1-dots'
      div.style.cssText = 'font-size:32px;line-height:1.6;color:#22c55e;'
      div.textContent = '...'
      c.appendChild(div)
    }, 2200)

    setTimeout(() => {
      const dots = document.getElementById('s1-dots')
      if (dots) dots.remove()
    }, 3000)

    addLine('s1', '<span style="color:#22c55e;">✓ Match found: Manila Free Photo Shoot</span>', 3000)
    addLine('s1', '<span style="color:#22c55e;">  Connecting to photographer...</span>', 3300)
    addLine('s1', '<span style="color:#555;">───────────────────────────────────</span>', 3700)
    addLine('s1', '<span style="color:#fff;">  type:       editorial portraits</span>', 3900)
    addLine('s1', '<span style="color:#fff;">  experience: none required</span>', 4100)
    addLine('s1', '<span style="color:#facc15;font-weight:700;">  cost:       FREE</span>', 4300)
    addLine('s1', '<span style="color:#fff;">  status:     accepting new models</span>', 4500)

    setTimeout(() => {
      const c = document.getElementById('s1')
      if (!c) return
      const box = document.createElement('div')
      box.style.cssText = 'margin-top:30px;padding:24px;border:2px solid #22c55e;border-radius:12px;text-align:center;opacity:0;transition:opacity 0.4s ease-out;'
      box.innerHTML = '<p style="font-size:48px;font-weight:700;color:#22c55e;margin:0;">MODELS WANTED</p><p style="font-size:28px;color:#555;margin:10px 0 0;">editorial portraits · free · no experience</p>'
      c.appendChild(box)
      requestAnimationFrame(() => { box.style.opacity = '1' })
    }, 4800)

    // ═══ SCENE 2: PORTFOLIO (5–10s) ═══
    typeLine('s2', P, './manila --portfolio --latest', '#fff', 5400, 35, '${MANILA_COLOR}')
    addLine('s2', '<span style="color:#22c55e;">Loading portfolio samples...</span>', 6600)
    addProgressBar('s2', 6800, 900)
    addLine('s2', '<span style="color:#22c55e;">✓ 8 images loaded</span>', 7800)

    setTimeout(() => {
      const s2el = document.getElementById('s2')
      const grid = document.getElementById('s2-grid')
      if (s2el && grid) {
        const rect = s2el.getBoundingClientRect()
        grid.style.top = (rect.bottom + 14) + 'px'
        grid.style.opacity = '1'
      }
    }, 8000)

    ${PROOF_PHOTOS.map((_, i) => `
    setTimeout(() => {
      const el = document.getElementById('photo-${i}')
      if (el) el.style.animation = 'photoIn 0.4s ease-out forwards'
    }, ${8100 + i * 200})
    `).join('')}

    addLine('s2', '<span style="color:#555;">  all shoots directed by @madebyaidan</span>', 9600)

    // ═══ SCENE 3: STEPS (10–15s) ═══
    typeLine('s3', P, './manila --how-it-works', '#fff', 10400, 40, '${MANILA_COLOR}')
    addLine('s3', '<span style="color:#22c55e;">Initializing booking sequence...</span>', 11500)
    addLine('s3', '<br><span style="color:#facc15;font-weight:700;">[1/3] DM me on Instagram</span>', 12000)
    addLine('s3', '<span style="color:#fff;">      Just say hey — I\\'ll reply back</span>', 12200)
    addLine('s3', '<span style="color:#555;">      ✓ confirmed</span>', 12500)
    addProgressBar('s3', 12600, 500)
    addLine('s3', '<br><span style="color:#facc15;font-weight:700;">[2/3] We pick a date</span>', 13100)
    addLine('s3', '<span style="color:#fff;">      Location, vibe, look — planned together</span>', 13300)
    addLine('s3', '<span style="color:#555;">      ✓ confirmed</span>', 13600)
    addLine('s3', '<br><span style="color:#facc15;font-weight:700;">[3/3] Show up. I guide you.</span>', 14000)
    addLine('s3', '<span style="color:#fff;">      Poses, angles, expressions — everything</span>', 14200)
    addLine('s3', '<span style="color:#555;">      ✓ no experience needed</span>', 14500)
    addLine('s3', '<br><span style="color:#22c55e;font-weight:700;">✓ All steps complete. Ready to book.</span>', 15000)

    // ═══ SCENE 4: CTA (15–20s) ═══
    typeLine('s4', P, './manila --book-now', '#fff', 15400, 45, '${MANILA_COLOR}')
    addLine('s4', '<span style="color:#22c55e;">→ Opening Instagram...</span>', 16400)
    addLine('s4', '<span style="color:#22c55e;">→ Launching DM composer...</span>', 16700)

    setTimeout(() => {
      const c = document.getElementById('s4')
      if (!c) return
      const box = document.createElement('div')
      box.style.cssText = 'margin-top:24px;border:3px solid ${MANILA_COLOR};border-radius:16px;padding:36px;text-align:center;opacity:0;transition:opacity 0.5s ease-out;'
      box.innerHTML = '<p style="font-size:60px;font-weight:700;color:#fff;margin:0 0 12px;">@madebyaidan</p><p style="font-size:34px;color:rgba(255,255,255,0.55);margin:0 0 28px;">on Instagram</p><div style="display:inline-block;background:${MANILA_COLOR};border-radius:16px;padding:20px 44px;"><span style="font-size:36px;font-weight:700;color:#fff;">Send me a DM →</span></div>'
      c.appendChild(box)
      requestAnimationFrame(() => { box.style.opacity = '1' })
    }, 17200)

    addLine('s4', '<span style="color:#555;">───────────────────────────────────</span>', 18200)
    addLine('s4', '<span style="color:#facc15;font-weight:700;">⚡ limited spots this month</span>', 18500)

    setTimeout(() => {
      const c = document.getElementById('s4')
      if (!c) return
      const div = document.createElement('div')
      div.style.cssText = 'font-size:32px;line-height:1.6;margin-top:20px;color:#555;'
      div.innerHTML = '$ <span style="display:inline-block;width:12px;height:28px;background:#22c55e;animation:blink 0.7s step-end infinite;vertical-align:text-bottom;"></span>'
      c.appendChild(div)
    }, 19000)
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
    strategy: 'v26b — terminal/CLI hacker aesthetic typewriter with search query narrative',
    safeBottomPixels: SAFE_BOTTOM,
    photos: PROOF_PHOTOS,
  })

  const browser = await chromium.launch()
  console.log('Recording terminal typewriter version...')

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
  const dstVideo = path.join(OUT_DIR, 'manila-terminal-v26b.mp4')

  const { execSync } = await import('child_process')
  try {
    execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${dstVideo}"`, { stdio: 'pipe' })
    fs.unlinkSync(srcVideo)
    console.log('Rendered manila-terminal-v26b.mp4')
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
