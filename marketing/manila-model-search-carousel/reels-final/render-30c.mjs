import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, "output-30c")

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

  @keyframes pulse {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 1; }
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

    <!-- Photo slideshow overlay — absolutely positioned over terminal -->
    <div id="photo-overlay" style="position:absolute;top:${SAFE_TOP + 60}px;left:${SAFE_LEFT}px;right:${WIDTH - SAFE_RIGHT}px;bottom:${SAFE_BOTTOM + 20}px;z-index:40;pointer-events:none;opacity:0;">
      ${PROOF_PHOTOS.map((p, i) => `<img id="slide-${i}" src="${imageDataMap[p]}" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);max-width:100%;max-height:100%;object-fit:contain;border-radius:8px;border:2px solid #333;opacity:0;transition:opacity 0.3s ease;"/>`).join('\n      ')}
    </div>

  </div>

  <script>
    const content = document.getElementById('content')
    const terminal = document.getElementById('terminal')
    const overlay = document.getElementById('photo-overlay')

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

    // Show a single photo in the overlay, hide others
    function showSlide(index) {
      for (let i = 0; i < 8; i++) {
        const img = document.getElementById('slide-' + i)
        if (img) img.style.opacity = i === index ? '1' : '0'
      }
    }

    const P = '<span style="color:${CLAUDE_ORANGE};">claude</span> <span style="color:#555;">~</span> '

    // Show persistent header
    setTimeout(() => {
      const h = document.getElementById('persistent-header')
      if (h) { h.style.transition = 'opacity 0.8s ease-out'; h.style.opacity = '1' }
    }, 100)

    // ═══ ONE CONTINUOUS CLAUDE CODE SESSION ═══

    addLine('<span style="color:#555;font-size:22px;">claude-code v1.0.23 · session started</span>', 200)

    // User prompt
    typeLine('<span style="color:#e5e7eb;">> </span>', 'find me a free photo shoot in manila', '#e5e7eb', 500, 35)

    // Thinking
    setTimeout(() => {
      const div = document.createElement('div')
      div.id = 'thinking-1'
      div.style.cssText = 'font-size:28px;line-height:1.6;display:flex;align-items:center;gap:6px;padding:4px 0;'
      div.innerHTML = '<span style="color:${CLAUDE_ORANGE};animation:pulse 1.5s ease-in-out infinite;">⟳ Searching...</span>'
      content.appendChild(div)
      scrollToBottom()
    }, 2200)
    setTimeout(() => { const d = document.getElementById('thinking-1'); if (d) d.remove() }, 3200)

    // Results stream in
    addLine('<span style="color:#22c55e;">✓ Found: Manila Free Photo Shoot</span>', 3200)
    addLine('<span style="color:#555;">─────────────────────────────────</span>', 3400)
    addLine('<span style="color:#e5e7eb;">  type:       editorial portraits</span>', 3600)
    addLine('<span style="color:#e5e7eb;">  experience: none required</span>', 3800)
    addLine('<span style="color:${CLAUDE_AMBER};font-weight:700;">  cost:       FREE</span>', 4000)
    addLine('<span style="color:#e5e7eb;">  status:     <span style="color:#22c55e;">accepting models</span></span>', 4200)
    addLine('<span style="color:#555;">─────────────────────────────────</span>', 4400)

    // Portfolio
    addLine('', 5000)
    addLine('<span style="color:${CLAUDE_ORANGE};">⟳ Loading portfolio samples...</span>', 5200)

    // Show photo overlay slideshow
    setTimeout(() => {
      overlay.style.transition = 'opacity 0.3s ease'
      overlay.style.opacity = '1'
    }, 5600)

    // Cycle through 8 photos
    for (let i = 0; i < 8; i++) {
      setTimeout(() => showSlide(i), 5700 + i * 250)
    }

    // Hide overlay
    setTimeout(() => {
      overlay.style.transition = 'opacity 0.3s ease'
      overlay.style.opacity = '0'
    }, 8000)

    addLine('<span style="color:#22c55e;">✓ 8 samples loaded</span>', 8200)
    addLine('<span style="color:#555;">  all shoots by @madebyaidan</span>', 8400)

    // Steps
    addLine('', 9000)
    addLine('<span style="color:${CLAUDE_ORANGE};">⟳ How to book — 3 steps:</span>', 9200)
    addLine('<br><span style="color:${CLAUDE_AMBER};font-weight:700;">[1/3] DM me on Instagram</span>', 9700)
    addLine('<span style="color:#e5e7eb;">      Just say hey — I\\'ll reply back</span>', 9900)
    addLine('<span style="color:#22c55e;">      ✓ confirmed</span>', 10200)
    addLine('<br><span style="color:${CLAUDE_AMBER};font-weight:700;">[2/3] We pick a date</span>', 10600)
    addLine('<span style="color:#e5e7eb;">      Location + vibe planned together</span>', 10800)
    addLine('<span style="color:#22c55e;">      ✓ confirmed</span>', 11100)
    addLine('<br><span style="color:${CLAUDE_AMBER};font-weight:700;">[3/3] Show up. I guide you.</span>', 11500)
    addLine('<span style="color:#e5e7eb;">      No posing experience needed</span>', 11700)
    addLine('<span style="color:#22c55e;">      ✓ confirmed</span>', 12000)
    addLine('<br><span style="color:#22c55e;font-weight:700;">✓ All steps complete. Ready to book.</span>', 12500)

    // CTA box
    setTimeout(() => {
      const box = document.createElement('div')
      box.style.cssText = 'margin:16px 0;border:3px solid ${CLAUDE_ORANGE};border-radius:16px;padding:32px;text-align:center;opacity:0;transition:opacity 0.5s ease-out;background:rgba(217,119,6,0.08);'
      box.innerHTML = '<p style="font-size:50px;font-weight:700;color:#fff;margin:0 0 8px;">@madebyaidan</p><p style="font-size:26px;color:rgba(255,255,255,0.5);margin:0 0 22px;">on Instagram</p><div style="display:inline-block;background:${CLAUDE_ORANGE};border-radius:12px;padding:16px 36px;"><span style="font-size:30px;font-weight:700;color:#fff;">Send me a DM →</span></div>'
      content.appendChild(box)
      scrollToBottom()
      requestAnimationFrame(() => { box.style.opacity = '1' })
    }, 13300)

    addLine('<span style="color:#555;">─────────────────────────────────</span>', 14300)
    addLine('<span style="color:${CLAUDE_AMBER};font-weight:700;">⚡ limited spots this month</span>', 14600)

    // Final cursor
    setTimeout(() => {
      const div = document.createElement('div')
      div.style.cssText = 'font-size:28px;line-height:1.6;margin-top:12px;color:#555;'
      div.innerHTML = '> <span style="display:inline-block;width:11px;height:24px;background:${CLAUDE_ORANGE};animation:blink 0.7s step-end infinite;vertical-align:text-bottom;"></span>'
      content.appendChild(div)
      scrollToBottom()
    }, 15100)
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
    strategy: 'v30c — Claude Code with overlay photo slideshow',
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
  const dstVideo = path.join(OUT_DIR, 'manila-claude-code-v30c.mp4')

  const { execSync } = await import('child_process')
  try {
    execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${dstVideo}"`, { stdio: 'pipe' })
    fs.unlinkSync(srcVideo)
    console.log('Rendered manila-claude-code-v30c.mp4')
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
