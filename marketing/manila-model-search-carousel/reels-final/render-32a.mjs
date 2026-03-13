import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, "output-32a")

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 430
const SAFE_TOP = 213
const SAFE_LEFT = 66
const SAFE_RIGHT = 1027

const TOTAL_DURATION_MS = 24000

const MONO = "'SF Mono', 'Menlo', 'Courier New', monospace"

const PROOF_PHOTOS = [
  { file: 'manila-gallery-dsc-0075.jpg', name: 'Jill', city: 'Bali' },
  { file: 'manila-gallery-night-001.jpg', name: 'Dorahan', city: 'Tokyo' },
  { file: 'manila-gallery-garden-001.jpg', name: 'Sumika', city: 'Tokyo' },
  { file: 'manila-gallery-canal-001.jpg', name: 'Hana', city: 'Bratislava' },
  { file: 'manila-gallery-ivy-001.jpg', name: 'Ellie', city: 'Tokyo' },
  { file: 'manila-gallery-urban-001.jpg', name: 'Yana', city: 'Warsaw' },
  { file: 'manila-gallery-shadow-001.jpg', name: 'Josephine', city: 'Bali' },
  { file: 'manila-gallery-dsc-0190.jpg', name: 'Dia', city: 'Bali' },
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
  const photosJSON = JSON.stringify(PROOF_PHOTOS.map(p => ({
    src: imageDataMap[p.file],
    name: p.name,
    city: p.city,
  })))

  return `<!DOCTYPE html>
<html>
<head>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { margin: 0; padding: 0; background: #000; font-family: ${MONO}; overflow: hidden; }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  @keyframes scanline-move {
    0% { transform: translateY(0); }
    100% { transform: translateY(6px); }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideFromLeft {
    from { transform: translateX(-120%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  @keyframes slideFromRight {
    from { transform: translateX(120%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  @keyframes scoreFlash {
    0% { color: #fff; }
    25% { color: #ff0; }
    50% { color: #fff; }
    75% { color: #ff0; }
    100% { color: #fff; }
  }
</style>
</head>
<body>
  <div id="root" style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#000;">

    <!-- CRT scanlines overlay -->
    <div style="position:absolute;inset:0;z-index:100;pointer-events:none;background:repeating-linear-gradient(0deg,rgba(0,0,0,0.15) 0px,rgba(0,0,0,0.15) 1px,transparent 1px,transparent 3px);animation:scanline-move 0.15s linear infinite;"></div>
    <div style="position:absolute;inset:0;z-index:99;pointer-events:none;background:radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.5) 100%);"></div>

    <!-- Persistent header -->
    <div id="persistent-header" style="position:absolute;top:${SAFE_TOP - 10}px;left:${SAFE_LEFT}px;right:${WIDTH - SAFE_RIGHT}px;z-index:50;pointer-events:none;text-align:center;padding:8px 0;">
      <div style="font-family:${MONO};font-size:26px;font-weight:700;color:#fff;letter-spacing:3px;text-transform:uppercase;">Manila Free Photo Shoot</div>
    </div>

    <!-- Score display -->
    <div id="score-display" style="position:absolute;top:${SAFE_TOP + 40}px;left:${SAFE_LEFT}px;right:${WIDTH - SAFE_RIGHT}px;z-index:50;pointer-events:none;display:flex;justify-content:center;align-items:center;gap:60px;">
      <span id="score-left" style="font-family:${MONO};font-size:72px;font-weight:700;color:#fff;">FREE</span>
      <span style="font-family:${MONO};font-size:48px;color:#555;">:</span>
      <span id="score-right" style="font-family:${MONO};font-size:72px;font-weight:700;color:#fff;">SHOOT</span>
    </div>

    <!-- Pong game canvas area -->
    <div id="pong-area" style="position:absolute;top:${SAFE_TOP + 140}px;left:${SAFE_LEFT}px;right:${WIDTH - SAFE_RIGHT}px;bottom:${SAFE_BOTTOM + 20}px;z-index:10;overflow:hidden;">

      <!-- Center dashed line -->
      <div id="center-line" style="position:absolute;left:50%;top:0;bottom:0;width:4px;transform:translateX(-50%);background:repeating-linear-gradient(to bottom, #555 0px, #555 16px, transparent 16px, transparent 32px);"></div>

      <!-- Left paddle -->
      <div id="paddle-left" style="position:absolute;left:10px;top:50%;width:16px;height:120px;background:#fff;transform:translateY(-50%);transition:top 0.15s ease-out;"></div>

      <!-- Right paddle -->
      <div id="paddle-right" style="position:absolute;right:10px;top:50%;width:16px;height:120px;background:#fff;transform:translateY(-50%);transition:top 0.15s ease-out;"></div>

      <!-- Ball -->
      <div id="ball" style="position:absolute;left:50%;top:50%;width:20px;height:20px;background:#fff;transform:translate(-50%,-50%);"></div>

      <!-- Center text overlay -->
      <div id="center-text" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;z-index:20;opacity:0;transition:opacity 0.5s ease;">
        <div id="center-text-content" style="font-family:${MONO};font-size:38px;font-weight:700;color:#fff;line-height:1.5;letter-spacing:1px;text-shadow:0 0 20px rgba(255,255,255,0.3);"></div>
      </div>

      <!-- Photo display area -->
      <div id="photo-area" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;z-index:15;pointer-events:none;"></div>

      <!-- Rounds display -->
      <div id="rounds-area" style="position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:40px;z-index:20;opacity:0;transition:opacity 0.4s ease;padding:20px;"></div>

      <!-- Final CTA area -->
      <div id="final-area" style="position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;align-items:center;z-index:25;opacity:0;transition:opacity 0.5s ease;"></div>
    </div>

    <!-- Photo data -->
    <script id="photo-data" type="application/json">${photosJSON}</script>

  </div>

  <script>
    const pongArea = document.getElementById('pong-area')
    const paddleLeft = document.getElementById('paddle-left')
    const paddleRight = document.getElementById('paddle-right')
    const ball = document.getElementById('ball')
    const centerLine = document.getElementById('center-line')
    const scoreLeft = document.getElementById('score-left')
    const scoreRight = document.getElementById('score-right')
    const centerText = document.getElementById('center-text')
    const centerTextContent = document.getElementById('center-text-content')
    const photoArea = document.getElementById('photo-area')
    const roundsArea = document.getElementById('rounds-area')
    const finalArea = document.getElementById('final-area')
    const photos = JSON.parse(document.getElementById('photo-data').textContent)

    const areaW = pongArea.offsetWidth
    const areaH = pongArea.offsetHeight

    // Ball state
    let bx = areaW / 2
    let by = areaH / 2
    let bvx = 6
    let bvy = 4.5
    let ballActive = true
    const BALL_SIZE = 20
    const PADDLE_W = 16
    const PADDLE_H = 120

    function updateBall() {
      if (!ballActive) return

      bx += bvx
      by += bvy

      // Bounce top/bottom
      if (by <= BALL_SIZE / 2) { by = BALL_SIZE / 2; bvy = Math.abs(bvy) }
      if (by >= areaH - BALL_SIZE / 2) { by = areaH - BALL_SIZE / 2; bvy = -Math.abs(bvy) }

      // Bounce off paddles
      const plTop = parseFloat(paddleLeft.style.top) || areaH / 2
      if (bx <= 10 + PADDLE_W + BALL_SIZE / 2 && bx > 10) {
        bvx = Math.abs(bvx)
        // Vary angle slightly
        bvy += (Math.random() - 0.5) * 2
      }
      if (bx >= areaW - 10 - PADDLE_W - BALL_SIZE / 2 && bx < areaW - 10) {
        bvx = -Math.abs(bvx)
        bvy += (Math.random() - 0.5) * 2
      }

      // Wrap around if escapes
      if (bx < 0) bx = areaW / 2
      if (bx > areaW) bx = areaW / 2

      // Clamp velocity
      if (Math.abs(bvy) > 8) bvy = 8 * Math.sign(bvy)
      if (Math.abs(bvy) < 2) bvy = 2 * Math.sign(bvy)

      ball.style.left = bx + 'px'
      ball.style.top = by + 'px'

      // Paddles follow ball with slight delay (already via CSS transition)
      const paddleY = Math.max(PADDLE_H / 2, Math.min(areaH - PADDLE_H / 2, by))
      paddleLeft.style.top = paddleY + 'px'
      // Right paddle slightly offset for realism
      const rpY = Math.max(PADDLE_H / 2, Math.min(areaH - PADDLE_H / 2, by + 30 * Math.sin(Date.now() / 500)))
      paddleRight.style.top = rpY + 'px'
    }

    let animFrame
    function gameLoop() {
      updateBall()
      animFrame = requestAnimationFrame(gameLoop)
    }
    gameLoop()

    // ---- SCENE 1: Pong plays, score reveals, center text (0-4s) ----
    // Score is already showing "FREE : SHOOT"
    // At 3s, show center text
    setTimeout(() => {
      centerText.style.opacity = '1'
      centerTextContent.innerHTML = 'Models Wanted<br><span style="font-size:28px;color:#aaa;">No Experience Needed</span>'
    }, 2800)

    // ---- SCENE 2: Photos slide in (4-14s) ----
    setTimeout(() => {
      // Hide center text
      centerText.style.opacity = '0'
      // Hide center line, dim paddles/ball
      centerLine.style.opacity = '0.15'
      ballActive = false
      ball.style.opacity = '0'
      paddleLeft.style.opacity = '0.15'
      paddleRight.style.opacity = '0.15'
      // Update score
      scoreLeft.textContent = 'PROOF'
      scoreRight.textContent = 'SHOTS'
    }, 4000)

    // Show each photo sliding in
    photos.forEach((photo, i) => {
      const fromLeft = i % 2 === 0
      const delay = 4200 + i * 1200

      setTimeout(() => {
        // Clear previous
        photoArea.innerHTML = ''

        const container = document.createElement('div')
        container.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:16px;animation:' +
          (fromLeft ? 'slideFromLeft' : 'slideFromRight') + ' 0.5s ease-out forwards;'

        const imgWrap = document.createElement('div')
        imgWrap.style.cssText = 'width:680px;height:900px;overflow:hidden;border:4px solid #fff;'
        imgWrap.innerHTML = '<img src="' + photo.src + '" style="width:100%;height:100%;object-fit:cover;display:block;"/>'

        const caption = document.createElement('div')
        caption.style.cssText = 'font-family:${MONO};font-size:28px;color:#aaa;letter-spacing:2px;text-transform:uppercase;'
        caption.textContent = photo.name + '  //  ' + photo.city

        container.appendChild(imgWrap)
        container.appendChild(caption)
        photoArea.appendChild(container)
      }, delay)
    })

    // ---- SCENE 3: Rounds (14-18s) ----
    setTimeout(() => {
      photoArea.innerHTML = ''
      centerLine.style.opacity = '0.3'
      paddleLeft.style.opacity = '0.3'
      paddleRight.style.opacity = '0.3'
      scoreLeft.textContent = 'HOW'
      scoreRight.textContent = 'TO'
      roundsArea.style.opacity = '1'
    }, 14000)

    const rounds = [
      { time: 14200, label: 'ROUND 1', text: 'DM me on Instagram' },
      { time: 15500, label: 'ROUND 2', text: 'We pick a date' },
      { time: 16800, label: 'ROUND 3', text: 'Show up. I guide you.' },
    ]

    rounds.forEach((r, i) => {
      setTimeout(() => {
        const row = document.createElement('div')
        row.style.cssText = 'text-align:center;animation:fadeIn 0.4s ease-out forwards;'
        row.innerHTML =
          '<div style="font-family:${MONO};font-size:24px;color:#555;letter-spacing:3px;margin-bottom:8px;">' + r.label + '</div>' +
          '<div style="font-family:${MONO};font-size:36px;font-weight:700;color:#fff;letter-spacing:1px;">' + r.text + '</div>'
        roundsArea.appendChild(row)

        // Flash score for effect
        scoreLeft.style.animation = 'scoreFlash 0.4s ease'
        scoreRight.style.animation = 'scoreFlash 0.4s ease'
        setTimeout(() => {
          scoreLeft.style.animation = ''
          scoreRight.style.animation = ''
        }, 500)
      }, r.time)
    })

    // ---- SCENE 4: Final CTA (18-22s) ----
    setTimeout(() => {
      roundsArea.style.opacity = '0'
      centerLine.style.opacity = '0.1'
      paddleLeft.style.opacity = '0.1'
      paddleRight.style.opacity = '0.1'

      scoreLeft.textContent = '@madebyaidan'
      scoreLeft.style.fontSize = '42px'
      scoreRight.textContent = 'WINS'
      scoreRight.style.fontSize = '42px'

      finalArea.style.opacity = '1'
      finalArea.innerHTML = \`
        <div style="text-align:center;animation:fadeIn 0.6s ease-out;">
          <div style="font-family:${MONO};font-size:52px;font-weight:700;color:#fff;margin-bottom:16px;letter-spacing:2px;">@madebyaidan</div>
          <div style="font-family:${MONO};font-size:26px;color:#555;margin-bottom:40px;letter-spacing:3px;">W I N S</div>
          <div style="display:inline-block;border:4px solid #fff;padding:20px 48px;margin-bottom:32px;">
            <span style="font-family:${MONO};font-size:36px;font-weight:700;color:#fff;letter-spacing:2px;">DM Me</span>
          </div>
          <div style="font-family:${MONO};font-size:22px;color:#888;margin-top:24px;letter-spacing:1px;">on Instagram</div>
          <div style="font-family:${MONO};font-size:20px;color:#555;margin-top:32px;animation:blink 1.2s step-end infinite;">LIMITED SPOTS</div>
        </div>
      \`
    }, 18000)

  </script>
</body>
</html>`
}

async function render() {
  resetOutputDir()

  const imageDataMap = {}
  for (const photo of PROOF_PHOTOS) {
    imageDataMap[photo.file] = readImage(photo.file)
  }

  writeSources({
    createdAt: new Date().toISOString(),
    strategy: 'v32a — Pong game aesthetic with bouncing ball, paddles, and score-based progression',
    safeBottomPixels: SAFE_BOTTOM,
    photos: PROOF_PHOTOS.map(p => p.file),
  })

  const browser = await chromium.launch()
  console.log('Recording Pong ad version...')

  const videoCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    recordVideo: { dir: OUT_DIR, size: { width: WIDTH, height: HEIGHT } }
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
  const dstVideo = path.join(OUT_DIR, 'manila-pong-v32a.mp4')

  const { execSync } = await import('child_process')
  try {
    execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${dstVideo}"`, { stdio: 'pipe' })
    fs.unlinkSync(srcVideo)
    console.log('Rendered manila-pong-v32a.mp4')
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
