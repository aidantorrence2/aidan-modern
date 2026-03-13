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
  // Build photo grid HTML for scene 2
  const photoGridHtml = PROOF_PHOTOS.map((p, i) => `
    <div class="photo-cell" id="photo-${i}" style="opacity:0;">
      <img src="${imageDataMap[p]}" />
    </div>
  `).join('')

  return `<!DOCTYPE html>
<html>
<head>
<style>
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { margin: 0; padding: 0; background: #0c0c0c; }

  .page {
    width: ${WIDTH}px;
    height: ${HEIGHT}px;
    position: relative;
    overflow: hidden;
    background: #0c0c0c;
    font-family: 'JetBrains Mono', 'SF Mono', 'Fira Code', 'Courier New', monospace;
  }

  /* CRT scanline overlay */
  .scanlines {
    position: absolute;
    inset: 0;
    z-index: 100;
    pointer-events: none;
    background: repeating-linear-gradient(
      0deg,
      rgba(0,0,0,0.15) 0px,
      rgba(0,0,0,0.15) 1px,
      transparent 1px,
      transparent 3px
    );
  }

  /* Subtle CRT vignette */
  .vignette {
    position: absolute;
    inset: 0;
    z-index: 99;
    pointer-events: none;
    background: radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.5) 100%);
  }

  /* Terminal colors */
  .prompt { color: ${MANILA_COLOR}; }
  .cmd { color: #fff; }
  .output { color: #22c55e; }
  .dim { color: #555; }
  .accent { color: ${MANILA_COLOR}; }
  .highlight { color: #facc15; }
  .link { color: #3b82f6; text-decoration: underline; }

  /* Blinking cursor */
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }
  .cursor {
    display: inline-block;
    width: 12px;
    height: 28px;
    background: #22c55e;
    animation: blink 0.7s step-end infinite;
    vertical-align: text-bottom;
    margin-left: 2px;
  }
  .cursor.red { background: ${MANILA_COLOR}; }

  /* Terminal line */
  .line {
    font-size: 32px;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-word;
    opacity: 0;
  }
  .line.visible { opacity: 1; }

  /* Photo grid */
  .photo-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    padding: 0 10px;
  }
  .photo-cell {
    border-radius: 8px;
    overflow: hidden;
    aspect-ratio: 3/4;
    border: 2px solid #333;
  }
  .photo-cell img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  @keyframes photoReveal {
    0% { opacity: 0; transform: scale(0.9); border-color: #333; }
    50% { border-color: #22c55e; }
    100% { opacity: 1; transform: scale(1); border-color: #333; }
  }

  @keyframes glitchFlash {
    0% { opacity: 1; }
    5% { opacity: 0; }
    10% { opacity: 1; }
    15% { opacity: 0; }
    20% { opacity: 1; }
    100% { opacity: 1; }
  }

  /* Big ascii art style heading */
  .ascii-heading {
    font-size: 28px;
    line-height: 1.2;
    color: ${MANILA_COLOR};
    white-space: pre;
    opacity: 0;
  }

  /* Progress bar */
  .progress-bar {
    height: 8px;
    background: #222;
    border-radius: 4px;
    overflow: hidden;
    margin: 10px 0;
  }
  .progress-fill {
    height: 100%;
    background: #22c55e;
    width: 0%;
    border-radius: 4px;
    transition: width 0.3s ease-out;
  }

  /* Scene containers */
  .scene {
    position: absolute;
    inset: 0;
    width: ${WIDTH}px;
    height: ${HEIGHT}px;
    overflow: hidden;
    padding: ${SAFE_TOP + 20}px ${SAFE_LEFT}px ${SAFE_BOTTOM + 20}px;
  }

  /* Scene visibility — 20s total */
  @keyframes s1v {
    0%    { opacity:1; } 24%   { opacity:1; } 26%   { opacity:0; } 100%  { opacity:0; }
  }
  @keyframes s2v {
    0%    { opacity:0; } 24%   { opacity:0; } 26%   { opacity:1; } 49%   { opacity:1; } 51%   { opacity:0; } 100%  { opacity:0; }
  }
  @keyframes s3v {
    0%    { opacity:0; } 49%   { opacity:0; } 51%   { opacity:1; } 74%   { opacity:1; } 76%   { opacity:0; } 100%  { opacity:0; }
  }
  @keyframes s4v {
    0%    { opacity:0; } 74%   { opacity:0; } 76%   { opacity:1; } 100%  { opacity:1; }
  }

  #scene1 { animation: s1v 20s linear forwards; }
  #scene2 { animation: s2v 20s linear forwards; }
  #scene3 { animation: s3v 20s linear forwards; }
  #scene4 { animation: s4v 20s linear forwards; }

  /* Big CTA box */
  .cta-box {
    border: 3px solid ${MANILA_COLOR};
    border-radius: 16px;
    padding: 30px;
    margin-top: 20px;
    opacity: 0;
  }

  /* Typing indicator dots */
  @keyframes typingDot {
    0%, 20% { opacity: 0.2; }
    40% { opacity: 1; }
    60%, 100% { opacity: 0.2; }
  }
  .typing-dots span {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #22c55e;
    margin: 0 3px;
  }
  .typing-dots span:nth-child(1) { animation: typingDot 1.4s ease-in-out infinite 0s; }
  .typing-dots span:nth-child(2) { animation: typingDot 1.4s ease-in-out infinite 0.2s; }
  .typing-dots span:nth-child(3) { animation: typingDot 1.4s ease-in-out infinite 0.4s; }
</style>
</head>
<body>
  <div class="page">
    <div class="scanlines"></div>
    <div class="vignette"></div>

    <!-- ═══ SCENE 4: CTA ═══ -->
    <div class="scene" id="scene4" style="background:#0c0c0c;">
      <div class="line" id="s4-l1"><span class="prompt">manila</span> <span class="dim">~</span> <span class="cmd" id="s4-t1"></span><span class="cursor red" id="s4-c1" style="display:none;"></span></div>
      <div style="margin-top:20px;">
        <div class="line" id="s4-l2"><span class="output" id="s4-t2"></span></div>
        <div class="line" id="s4-l3"><span class="output" id="s4-t3"></span></div>
      </div>
      <div class="cta-box" id="s4-cta">
        <div style="text-align:center;">
          <p style="font-size:60px;font-weight:700;color:#fff;margin:0 0 16px;">@madebyaidan</p>
          <p style="font-size:34px;color:rgba(255,255,255,0.6);margin:0 0 30px;">on Instagram</p>
          <div style="display:inline-block;background:${MANILA_COLOR};border-radius:16px;padding:20px 44px;">
            <span style="font-size:36px;font-weight:700;color:#fff;">Send me a DM →</span>
          </div>
        </div>
      </div>
      <div style="margin-top:30px;">
        <div class="line" id="s4-l4"><span class="dim" id="s4-t4"></span></div>
        <div class="line" id="s4-l5"><span class="highlight" id="s4-t5"></span></div>
      </div>
      <div style="margin-top:30px;">
        <div class="line" id="s4-l6"><span class="dim" id="s4-t6"></span></div>
      </div>
    </div>

    <!-- ═══ SCENE 3: HOW IT WORKS ═══ -->
    <div class="scene" id="scene3" style="background:#0c0c0c;">
      <div class="line" id="s3-l1"><span class="prompt">manila</span> <span class="dim">~</span> <span class="cmd" id="s3-t1"></span><span class="cursor red" id="s3-c1" style="display:none;"></span></div>
      <div style="margin-top:16px;">
        <div class="line" id="s3-l2"><span class="output" id="s3-t2"></span></div>
      </div>
      <div style="margin-top:30px;">
        <div class="line" id="s3-l3"><span class="highlight" id="s3-t3"></span></div>
        <div class="line" id="s3-l4"><span class="cmd" id="s3-t4"></span></div>
        <div class="line" id="s3-l5"><span class="dim" id="s3-t5"></span></div>
      </div>
      <div style="margin-top:16px;">
        <div class="progress-bar" id="s3-prog1" style="opacity:0;"><div class="progress-fill" id="s3-fill1"></div></div>
      </div>
      <div style="margin-top:30px;">
        <div class="line" id="s3-l6"><span class="highlight" id="s3-t6"></span></div>
        <div class="line" id="s3-l7"><span class="cmd" id="s3-t7"></span></div>
        <div class="line" id="s3-l8"><span class="dim" id="s3-t8"></span></div>
      </div>
      <div style="margin-top:30px;">
        <div class="line" id="s3-l9"><span class="highlight" id="s3-t9"></span></div>
        <div class="line" id="s3-l10"><span class="cmd" id="s3-t10"></span></div>
        <div class="line" id="s3-l11"><span class="dim" id="s3-t11"></span></div>
      </div>
      <div style="margin-top:30px;">
        <div class="line" id="s3-done"><span class="output" id="s3-t12"></span></div>
      </div>
    </div>

    <!-- ═══ SCENE 2: PORTFOLIO ═══ -->
    <div class="scene" id="scene2" style="background:#0c0c0c;">
      <div class="line" id="s2-l1"><span class="prompt">manila</span> <span class="dim">~</span> <span class="cmd" id="s2-t1"></span><span class="cursor red" id="s2-c1" style="display:none;"></span></div>
      <div style="margin-top:12px;">
        <div class="line" id="s2-l2"><span class="output" id="s2-t2"></span></div>
        <div class="progress-bar" id="s2-prog" style="opacity:0;"><div class="progress-fill" id="s2-fill"></div></div>
        <div class="line" id="s2-l3"><span class="output" id="s2-t3"></span></div>
      </div>
      <div style="margin-top:16px;">
        <div class="photo-grid">
          ${photoGridHtml}
        </div>
      </div>
      <div style="margin-top:16px;">
        <div class="line" id="s2-l4"><span class="dim" id="s2-t4"></span></div>
      </div>
    </div>

    <!-- ═══ SCENE 1: SEARCH/HOOK ═══ -->
    <div class="scene" id="scene1" style="background:#0c0c0c;">
      <div class="line" id="s1-l0"><span class="dim" id="s1-t0"></span></div>
      <div style="margin-top:8px;">
        <div class="line" id="s1-l1"><span class="prompt">manila</span> <span class="dim">~</span> <span class="cmd" id="s1-t1"></span><span class="cursor red" id="s1-c1" style="display:none;"></span></div>
      </div>
      <div style="margin-top:20px;">
        <div class="line" id="s1-l2">
          <span class="typing-dots" id="s1-dots" style="display:none;"><span></span><span></span><span></span></span>
        </div>
      </div>
      <div style="margin-top:12px;">
        <div class="line" id="s1-l3"><span class="output" id="s1-t3"></span></div>
        <div class="line" id="s1-l4"><span class="output" id="s1-t4"></span></div>
      </div>
      <div style="margin-top:30px;">
        <div class="line" id="s1-l5"><span class="dim" id="s1-t5"></span></div>
        <div class="line" id="s1-l6"><span class="cmd" id="s1-t6"></span></div>
        <div class="line" id="s1-l7"><span class="cmd" id="s1-t7"></span></div>
        <div class="line" id="s1-l8"><span class="highlight" id="s1-t8"></span></div>
        <div class="line" id="s1-l9"><span class="cmd" id="s1-t9"></span></div>
      </div>
      <div style="margin-top:30px;padding:24px;border:2px solid #22c55e;border-radius:12px;opacity:0;" id="s1-box">
        <p style="font-size:46px;font-weight:700;color:#22c55e;margin:0;text-align:center;">MODELS WANTED</p>
        <p style="font-size:30px;color:#555;margin:10px 0 0;text-align:center;">editorial portraits · free · no experience</p>
      </div>
    </div>

  </div>

  <script>
    // ── Typewriter engine ──
    function type(elId, cursorId, text, startMs, charMs, cb) {
      charMs = charMs || 40
      const el = document.getElementById(elId)
      const cur = cursorId ? document.getElementById(cursorId) : null
      if (!el) return
      const parentLine = el.closest('.line')
      if (parentLine) parentLine.classList.add('visible')

      setTimeout(() => { if (cur) cur.style.display = 'inline-block' }, startMs)

      const chars = [...text]
      chars.forEach((ch, i) => {
        setTimeout(() => {
          el.textContent += ch
        }, startMs + i * charMs)
      })

      const endMs = startMs + chars.length * charMs + 200
      setTimeout(() => { if (cur) cur.style.display = 'none' }, endMs)
      if (cb) setTimeout(cb, endMs)
    }

    function showLine(elId, ms) {
      setTimeout(() => {
        const el = document.getElementById(elId)
        if (el) {
          const line = el.closest ? el.closest('.line') : el
          if (line) { line.classList.add('visible'); line.style.opacity = '1' }
          el.style.opacity = '1'
        }
      }, ms)
    }

    function typeInstant(elId, text, ms) {
      setTimeout(() => {
        const el = document.getElementById(elId)
        if (el) {
          el.textContent = text
          const line = el.closest('.line')
          if (line) line.classList.add('visible')
        }
      }, ms)
    }

    function fadeIn(id, ms, dur) {
      dur = dur || 300
      setTimeout(() => {
        const el = document.getElementById(id)
        if (el) { el.style.transition = 'opacity '+dur+'ms ease-out'; el.style.opacity = '1' }
      }, ms)
    }

    function animProgress(fillId, barId, ms, dur) {
      setTimeout(() => {
        const bar = document.getElementById(barId)
        const fill = document.getElementById(fillId)
        if (bar) bar.style.opacity = '1'
        if (fill) {
          fill.style.transition = 'width '+dur+'ms ease-out'
          fill.style.width = '100%'
        }
      }, ms)
    }

    // ═══════════════════════════════════════
    // SCENE 1: HOOK (0–5s)
    // Looks like running a CLI search query
    // ═══════════════════════════════════════
    typeInstant('s1-t0', '$ last login: today on ttys001', 200)
    showLine('s1-l0', 200)

    type('s1-t1', 's1-c1', './manila --search "models wanted"', 600, 38)
    // ~1800ms to type

    // Show thinking dots
    setTimeout(() => {
      const dots = document.getElementById('s1-dots')
      const line = document.getElementById('s1-l2')
      if (dots) dots.style.display = 'inline-flex'
      if (line) line.style.opacity = '1'
    }, 2600)

    // Search results appear
    typeInstant('s1-t3', '✓ Match found: Manila Free Photo Shoot', 3200)
    showLine('s1-l3', 3200)
    // Hide dots
    setTimeout(() => {
      const dots = document.getElementById('s1-dots')
      if (dots) dots.style.display = 'none'
    }, 3200)

    typeInstant('s1-t4', '  Connecting to photographer...', 3500)
    showLine('s1-l4', 3500)

    // Details
    typeInstant('s1-t5', '───────────────────────────────', 3900)
    showLine('s1-l5', 3900)
    typeInstant('s1-t6', '  type:       editorial portraits', 4100)
    showLine('s1-l6', 4100)
    typeInstant('s1-t7', '  experience: none required', 4300)
    showLine('s1-l7', 4300)
    typeInstant('s1-t8', '  cost:       FREE', 4500)
    showLine('s1-l8', 4500)
    typeInstant('s1-t9', '  status:     accepting new models', 4700)
    showLine('s1-l9', 4700)

    // Big box
    fadeIn('s1-box', 5000, 400)

    // ═══════════════════════════════════════
    // SCENE 2: PORTFOLIO (5–10s)
    // Scene visible at 26% of 20s = 5.2s
    // ═══════════════════════════════════════
    type('s2-t1', 's2-c1', './manila --portfolio --latest', 5400, 35)
    // ~1400ms

    typeInstant('s2-t2', 'Loading portfolio samples...', 7000)
    showLine('s2-l2', 7000)
    animProgress('s2-fill', 's2-prog', 7200, 800)

    typeInstant('s2-t3', '✓ 8 images loaded', 8100)
    showLine('s2-l3', 8100)

    // Photos reveal one by one with green border flash
    ${PROOF_PHOTOS.map((_, i) => `
    setTimeout(() => {
      const el = document.getElementById('photo-${i}')
      if (el) el.style.animation = 'photoReveal 0.4s ease-out forwards'
    }, ${8300 + i * 200})
    `).join('')}

    typeInstant('s2-t4', '  all shoots directed by @madebyaidan', 9800)
    showLine('s2-l4', 9800)

    // ═══════════════════════════════════════
    // SCENE 3: HOW IT WORKS (10–15s)
    // Scene visible at 51% of 20s = 10.2s
    // ═══════════════════════════════════════
    type('s3-t1', 's3-c1', './manila --how-it-works', 10400, 40)

    typeInstant('s3-t2', 'Initializing booking sequence...', 11400)
    showLine('s3-l2', 11400)

    // Step 1
    typeInstant('s3-t3', '[1/3] DM me on Instagram', 11800)
    showLine('s3-l3', 11800)
    typeInstant('s3-t4', '      Just say hey — I\'ll reply back', 12000)
    showLine('s3-l4', 12000)
    typeInstant('s3-t5', '      ✓ confirmed', 12300)
    showLine('s3-l5', 12300)

    // Progress
    fadeIn('s3-prog1', 12400)
    animProgress('s3-fill1', 's3-prog1', 12400, 600)

    // Step 2
    typeInstant('s3-t6', '[2/3] We pick a date', 13000)
    showLine('s3-l6', 13000)
    typeInstant('s3-t7', '      Location, vibe, and look — planned together', 13200)
    showLine('s3-l7', 13200)
    typeInstant('s3-t8', '      ✓ confirmed', 13500)
    showLine('s3-l8', 13500)

    // Step 3
    typeInstant('s3-t9', '[3/3] Show up. I guide you.', 14000)
    showLine('s3-l9', 14000)
    typeInstant('s3-t10', '      Poses, angles, expressions — everything', 14200)
    showLine('s3-l10', 14200)
    typeInstant('s3-t11', '      ✓ no experience needed', 14500)
    showLine('s3-l11', 14500)

    typeInstant('s3-t12', '✓ All steps complete. Ready to book.', 15000)
    showLine('s3-done', 15000)

    // ═══════════════════════════════════════
    // SCENE 4: CTA (15–20s)
    // Scene visible at 76% of 20s = 15.2s
    // ═══════════════════════════════════════
    type('s4-t1', 's4-c1', './manila --book-now', 15400, 45)

    typeInstant('s4-t2', '→ Opening Instagram...', 16400)
    showLine('s4-l2', 16400)
    typeInstant('s4-t3', '→ Launching DM composer...', 16700)
    showLine('s4-l3', 16700)

    // Big CTA box
    fadeIn('s4-cta', 17200, 500)

    typeInstant('s4-t4', '───────────────────────────────', 18000)
    showLine('s4-l4', 18000)
    typeInstant('s4-t5', '⚡ limited spots this month', 18300)
    showLine('s4-l5', 18300)

    typeInstant('s4-t6', '$ _', 19000)
    showLine('s4-l6', 19000)
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
