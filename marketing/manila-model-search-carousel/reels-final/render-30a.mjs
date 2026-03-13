import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, "output-30a")

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 430
const SAFE_TOP = 213
const SAFE_LEFT = 66
const SAFE_RIGHT = 1027
const CLAUDE_ORANGE = '#D97706'
const CLAUDE_AMBER = '#F59E0B'

const TOTAL_DURATION_MS = 24000

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
  return `<!DOCTYPE html>
<html>
<head>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { margin: 0; padding: 0; background: #1a1a2e; font-family: ${MONO}; overflow: hidden; }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  @keyframes photoIn {
    0% { opacity: 0; transform: scale(0.9); border-color: #333; }
    50% { border-color: ${CLAUDE_ORANGE}; }
    100% { opacity: 1; transform: scale(1); border-color: #333; }
  }

  @keyframes pulse {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 1; }
  }

  @keyframes dotBounce {
    0%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-6px); }
  }
</style>
</head>
<body>
  <div id="root" style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#1a1a2e;">

    <!-- Subtle scanlines -->
    <div style="position:absolute;inset:0;z-index:100;pointer-events:none;background:repeating-linear-gradient(0deg,rgba(0,0,0,0.08) 0px,rgba(0,0,0,0.08) 1px,transparent 1px,transparent 3px);"></div>
    <div style="position:absolute;inset:0;z-index:99;pointer-events:none;background:radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.4) 100%);"></div>

    <!-- Persistent Manila Free Photo Shoot header -->
    <div id="persistent-header" style="position:absolute;top:${SAFE_TOP}px;left:${SAFE_LEFT}px;right:${WIDTH - SAFE_RIGHT}px;z-index:50;pointer-events:none;opacity:0;padding:12px 0;border-bottom:1px solid #333;">
      <div style="font-family:${MONO};font-size:26px;font-weight:700;color:${CLAUDE_ORANGE};letter-spacing:2px;text-transform:uppercase;">Manila Free Photo Shoot</div>
    </div>

    <!-- Single scrolling terminal -->
    <div id="terminal" style="position:absolute;top:${SAFE_TOP + 60}px;left:${SAFE_LEFT}px;right:${WIDTH - SAFE_RIGHT}px;bottom:${SAFE_BOTTOM + 20}px;overflow:hidden;z-index:10;">
      <div id="content" style="font-family:${MONO};"></div>
    </div>

    <!-- Photo data for JS injection -->
    <script id="photo-data" type="application/json">${JSON.stringify(PROOF_PHOTOS.map(p => imageDataMap[p]))}</script>

  </div>

  <script>
    const content = document.getElementById('content')
    const terminal = document.getElementById('terminal')

    function scrollToBottom() {
      terminal.scrollTop = terminal.scrollHeight
    }

    function addLine(html, delay) {
      setTimeout(() => {
        const div = document.createElement('div')
        div.style.cssText = 'font-size:28px;line-height:1.6;white-space:pre-wrap;word-break:break-word;'
        div.innerHTML = html
        content.appendChild(div)
        scrollToBottom()
      }, delay)
    }

    function typeLine(prefix, text, color, delay, charMs, cursorColor) {
      charMs = charMs || 40
      cursorColor = cursorColor || '${CLAUDE_ORANGE}'
      color = color || '#fff'
      setTimeout(() => {
        const div = document.createElement('div')
        div.style.cssText = 'font-size:28px;line-height:1.6;white-space:pre-wrap;word-break:break-word;'
        if (prefix) {
          const pre = document.createElement('span')
          pre.innerHTML = prefix
          div.appendChild(pre)
        }
        const textSpan = document.createElement('span')
        textSpan.style.color = color
        div.appendChild(textSpan)
        const cursor = document.createElement('span')
        cursor.style.cssText = 'display:inline-block;width:11px;height:24px;background:'+cursorColor+';animation:blink 0.7s step-end infinite;vertical-align:text-bottom;margin-left:2px;'
        div.appendChild(cursor)
        content.appendChild(div)
        scrollToBottom()
        const chars = [...text]
        chars.forEach((ch, i) => {
          setTimeout(() => { textSpan.textContent += ch; scrollToBottom() }, i * charMs)
        })
        setTimeout(() => { cursor.style.display = 'none' }, chars.length * charMs + 300)
      }, delay)
    }

    function addThinkingDots(id, delay) {
      setTimeout(() => {
        const div = document.createElement('div')
        div.id = id
        div.style.cssText = 'font-size:28px;line-height:1.6;display:flex;align-items:center;gap:4px;padding:8px 0;'
        div.innerHTML = '<span style="color:${CLAUDE_ORANGE};font-weight:700;animation:pulse 1.5s ease-in-out infinite;">Thinking</span>' +
          '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${CLAUDE_ORANGE};animation:dotBounce 1.2s ease-in-out infinite;animation-delay:0s;"></span>' +
          '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${CLAUDE_ORANGE};animation:dotBounce 1.2s ease-in-out infinite;animation-delay:0.2s;"></span>' +
          '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${CLAUDE_ORANGE};animation:dotBounce 1.2s ease-in-out infinite;animation-delay:0.4s;"></span>'
        content.appendChild(div)
        scrollToBottom()
      }, delay)
    }

    // User message style
    const USER_PREFIX = '<span style="color:#6b7280;font-size:22px;">You</span><br>'
    // Claude message style
    const CLAUDE_PREFIX = '<span style="color:${CLAUDE_ORANGE};font-size:22px;font-weight:700;">Claude</span><br>'

    // Show persistent header
    setTimeout(() => {
      const h = document.getElementById('persistent-header')
      if (h) { h.style.transition = 'opacity 0.8s ease-out'; h.style.opacity = '1' }
    }, 100)

    // ═══ CLAUDE CODE CONVERSATION ═══

    // Claude Code session header
    addLine('<span style="color:#555;font-size:22px;">claude-code v1.0.23</span>', 200)
    addLine('<span style="color:#555;font-size:22px;">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</span>', 300)

    // User types query
    setTimeout(() => {
      const div = document.createElement('div')
      div.style.cssText = 'font-size:28px;line-height:1.6;white-space:pre-wrap;word-break:break-word;margin-top:12px;padding:14px 16px;background:rgba(255,255,255,0.05);border-radius:10px;border-left:3px solid #555;'
      div.innerHTML = USER_PREFIX
      const textSpan = document.createElement('span')
      textSpan.style.color = '#e5e7eb'
      div.appendChild(textSpan)
      const cursor = document.createElement('span')
      cursor.style.cssText = 'display:inline-block;width:11px;height:24px;background:#e5e7eb;animation:blink 0.7s step-end infinite;vertical-align:text-bottom;margin-left:2px;'
      div.appendChild(cursor)
      content.appendChild(div)
      scrollToBottom()
      const msg = 'find me a free photo shoot in manila'
      const chars = [...msg]
      chars.forEach((ch, i) => {
        setTimeout(() => { textSpan.textContent += ch; scrollToBottom() }, i * 38)
      })
      setTimeout(() => { cursor.style.display = 'none' }, chars.length * 38 + 300)
    }, 600)

    // Claude thinking
    addThinkingDots('thinking-1', 2400)
    setTimeout(() => { const d = document.getElementById('thinking-1'); if (d) d.remove() }, 3600)

    // Claude response - offer details
    setTimeout(() => {
      const div = document.createElement('div')
      div.style.cssText = 'font-size:28px;line-height:1.6;white-space:pre-wrap;word-break:break-word;margin-top:12px;padding:14px 16px;background:rgba(217,119,6,0.06);border-radius:10px;border-left:3px solid ${CLAUDE_ORANGE};'
      div.innerHTML = CLAUDE_PREFIX + '<span style="color:#e5e7eb;">I found a great option:</span>'
      content.appendChild(div)
      scrollToBottom()
    }, 3600)

    addLine('<span style="color:#555;">  ─────────────────────────────</span>', 3900)
    addLine('<span style="color:#fff;">  Type:       <span style="color:#e5e7eb;">Editorial portraits</span></span>', 4100)
    addLine('<span style="color:#fff;">  Experience: <span style="color:#e5e7eb;">None required</span></span>', 4300)
    addLine('<span style="color:${CLAUDE_AMBER};font-weight:700;">  Cost:       FREE</span>', 4500)
    addLine('<span style="color:#fff;">  Status:     <span style="color:#22c55e;">Accepting models</span></span>', 4700)
    addLine('<span style="color:#555;">  ─────────────────────────────</span>', 4900)

    // Claude shows portfolio
    setTimeout(() => {
      const div = document.createElement('div')
      div.style.cssText = 'font-size:28px;line-height:1.6;white-space:pre-wrap;word-break:break-word;margin-top:16px;padding:14px 16px;background:rgba(217,119,6,0.06);border-radius:10px;border-left:3px solid ${CLAUDE_ORANGE};'
      div.innerHTML = CLAUDE_PREFIX + '<span style="color:#e5e7eb;">Here\\'s the portfolio:</span>'
      content.appendChild(div)
      scrollToBottom()
    }, 5400)

    // Inject photo grid inline
    setTimeout(() => {
      const photos = JSON.parse(document.getElementById('photo-data').textContent)
      const grid = document.createElement('div')
      grid.id = 'photo-grid'
      grid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:10px 0;'
      photos.forEach((src, i) => {
        const cell = document.createElement('div')
        cell.id = 'photo-' + i
        cell.style.cssText = 'border-radius:8px;overflow:hidden;aspect-ratio:3/4;border:2px solid #333;opacity:0;'
        cell.innerHTML = '<img src="' + src + '" style="width:100%;height:100%;object-fit:cover;display:block;"/>'
        grid.appendChild(cell)
      })
      content.appendChild(grid)
      scrollToBottom()

      // Animate each photo in with stagger
      photos.forEach((_, i) => {
        setTimeout(() => {
          const el = document.getElementById('photo-' + i)
          if (el) el.style.animation = 'photoIn 0.4s ease-out forwards'
          scrollToBottom()
        }, 100 + i * 200)
      })
    }, 5800)

    addLine('<span style="color:#555;font-size:22px;">  All shoots by @madebyaidan</span>', 7800)

    // Fade grid
    setTimeout(() => {
      const grid = document.getElementById('photo-grid')
      if (grid) { grid.style.transition = 'opacity 0.3s ease'; grid.style.opacity = '0' }
    }, 9000)

    // Claude explains 3 steps
    setTimeout(() => {
      const div = document.createElement('div')
      div.style.cssText = 'font-size:28px;line-height:1.6;white-space:pre-wrap;word-break:break-word;margin-top:16px;padding:14px 16px;background:rgba(217,119,6,0.06);border-radius:10px;border-left:3px solid ${CLAUDE_ORANGE};'
      div.innerHTML = CLAUDE_PREFIX + '<span style="color:#e5e7eb;">Here\\'s how to book — 3 steps:</span>'
      content.appendChild(div)
      scrollToBottom()
    }, 9500)

    addLine('<br><span style="color:${CLAUDE_AMBER};font-weight:700;">  Step 1 ─ DM on Instagram</span>', 10000)
    addLine('<span style="color:#e5e7eb;">         Just say hey, I\\'ll reply</span>', 10200)
    addLine('<span style="color:#22c55e;font-size:22px;">         ✓ easy</span>', 10400)

    addLine('<br><span style="color:${CLAUDE_AMBER};font-weight:700;">  Step 2 ─ Pick a date</span>', 10800)
    addLine('<span style="color:#e5e7eb;">         Location + vibe planned</span>', 11000)
    addLine('<span style="color:#22c55e;font-size:22px;">         ✓ easy</span>', 11200)

    addLine('<br><span style="color:${CLAUDE_AMBER};font-weight:700;">  Step 3 ─ Show up</span>', 11600)
    addLine('<span style="color:#e5e7eb;">         No posing experience needed</span>', 11800)
    addLine('<span style="color:#22c55e;font-size:22px;">         ✓ easy</span>', 12000)

    addLine('<br><span style="color:#22c55e;font-weight:700;">  ✓ All steps complete. Ready to book.</span>', 12500)

    // CTA
    setTimeout(() => {
      const box = document.createElement('div')
      box.style.cssText = 'margin:24px 0;border:3px solid ${CLAUDE_ORANGE};border-radius:16px;padding:32px;text-align:center;opacity:0;transition:opacity 0.6s ease-out;background:rgba(217,119,6,0.08);'
      box.innerHTML = '<p style="font-size:50px;font-weight:700;color:#fff;margin:0 0 8px;">@madebyaidan</p>' +
        '<p style="font-size:26px;color:rgba(255,255,255,0.5);margin:0 0 22px;">on Instagram</p>' +
        '<div style="display:inline-block;background:${CLAUDE_ORANGE};border-radius:12px;padding:16px 36px;">' +
        '<span style="font-size:30px;font-weight:700;color:#fff;">Send me a DM</span></div>'
      content.appendChild(box)
      scrollToBottom()
      requestAnimationFrame(() => { box.style.opacity = '1' })
    }, 13200)

    addLine('<span style="color:#555;">  ─────────────────────────────</span>', 14200)
    addLine('<span style="color:${CLAUDE_AMBER};font-weight:700;">  ⚡ Limited spots this month</span>', 14500)

    // Final idle cursor
    setTimeout(() => {
      const div = document.createElement('div')
      div.style.cssText = 'font-size:28px;line-height:1.6;margin-top:16px;color:#555;'
      div.innerHTML = '> <span style="display:inline-block;width:11px;height:24px;background:${CLAUDE_ORANGE};animation:blink 0.7s step-end infinite;vertical-align:text-bottom;"></span>'
      content.appendChild(div)
      scrollToBottom()
    }, 15000)
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
    strategy: 'v30a — Claude Code terminal conversation theme',
    safeBottomPixels: SAFE_BOTTOM,
    photos: PROOF_PHOTOS,
  })

  const browser = await chromium.launch()
  console.log('Recording Claude Code terminal version...')

  const videoCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    recordVideo: { dir: OUT_DIR, size: { width: WIDTH, height: HEIGHT } }
  })

  const videoPage = await videoCtx.newPage()
  await videoPage.evaluate(() => {
    document.documentElement.style.background = '#1a1a2e'
    document.body.style.background = '#1a1a2e'
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
  const dstVideo = path.join(OUT_DIR, 'manila-claude-code-v30a.mp4')

  const { execSync } = await import('child_process')
  try {
    execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${dstVideo}"`, { stdio: 'pipe' })
    fs.unlinkSync(srcVideo)
    console.log('Rendered manila-claude-code-v30a.mp4')
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
