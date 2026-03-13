import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, "output-33a")

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
  const photoDataJSON = JSON.stringify(PROOF_PHOTOS.map(p => ({
    src: imageDataMap[p.file],
    name: p.name,
    city: p.city,
  })))

  return `<!DOCTYPE html>
<html>
<head>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { margin: 0; padding: 0; background: #5c94fc; font-family: ${MONO}; overflow: hidden; }

  @keyframes blockBounce {
    0% { transform: translateY(0); }
    30% { transform: translateY(-18px); }
    60% { transform: translateY(0); }
    80% { transform: translateY(-6px); }
    100% { transform: translateY(0); }
  }

  @keyframes coinPop {
    0% { opacity: 1; transform: translateY(0) rotate(0deg); }
    50% { opacity: 1; transform: translateY(-120px) rotate(180deg); }
    80% { opacity: 0.6; transform: translateY(-80px) rotate(360deg); }
    100% { opacity: 0; transform: translateY(-60px) rotate(360deg); }
  }

  @keyframes photoSlideUp {
    0% { opacity: 0; transform: translateY(60px) scale(0.8); }
    60% { opacity: 1; transform: translateY(-10px) scale(1.02); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
  }

  @keyframes coinCollect {
    0% { opacity: 0; transform: scale(0.3) rotate(-20deg); }
    50% { opacity: 1; transform: scale(1.15) rotate(5deg); }
    100% { opacity: 1; transform: scale(1) rotate(0deg); }
  }

  @keyframes flagRaise {
    0% { height: 0; }
    100% { height: 80px; }
  }

  @keyframes groundScroll {
    0% { background-position: 0 0; }
    100% { background-position: -48px 0; }
  }

  @keyframes fadeIn {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }

  @keyframes slideDown {
    0% { opacity: 0; transform: translateY(-40px); }
    100% { opacity: 1; transform: translateY(0); }
  }

  @keyframes flashIn {
    0% { opacity: 0; transform: scale(1.3); }
    30% { opacity: 1; transform: scale(0.95); }
    100% { opacity: 1; transform: scale(1); }
  }

  @keyframes starBlink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
</style>
</head>
<body>
  <div id="root" style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#5c94fc;">

    <!-- Clouds (CSS) -->
    <div id="cloud1" style="position:absolute;top:${SAFE_TOP + 80}px;left:100px;z-index:1;">
      <div style="width:80px;height:32px;background:#fff;border-radius:16px;position:relative;">
        <div style="width:40px;height:24px;background:#fff;border-radius:12px;position:absolute;top:-14px;left:10px;"></div>
        <div style="width:50px;height:28px;background:#fff;border-radius:14px;position:absolute;top:-18px;left:30px;"></div>
      </div>
    </div>
    <div id="cloud2" style="position:absolute;top:${SAFE_TOP + 200}px;left:650px;z-index:1;">
      <div style="width:100px;height:36px;background:#fff;border-radius:18px;position:relative;">
        <div style="width:50px;height:28px;background:#fff;border-radius:14px;position:absolute;top:-16px;left:15px;"></div>
        <div style="width:60px;height:32px;background:#fff;border-radius:16px;position:absolute;top:-20px;left:40px;"></div>
      </div>
    </div>
    <div id="cloud3" style="position:absolute;top:${SAFE_TOP + 350}px;left:350px;z-index:1;">
      <div style="width:70px;height:28px;background:#fff;border-radius:14px;position:relative;">
        <div style="width:35px;height:20px;background:#fff;border-radius:10px;position:absolute;top:-12px;left:18px;"></div>
      </div>
    </div>

    <!-- HUD (Mario-style top bar) -->
    <div id="hud" style="position:absolute;top:${SAFE_TOP}px;left:${SAFE_LEFT}px;right:${WIDTH - SAFE_RIGHT}px;z-index:50;padding:8px 0;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;font-family:${MONO};font-size:18px;letter-spacing:3px;text-transform:uppercase;color:#fff;text-shadow:2px 2px 0 #000;">
        <div style="text-align:center;">
          <div style="font-size:15px;color:#fff;">MANILA</div>
          <div id="hud-score" style="font-size:18px;font-weight:700;">000000</div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:15px;">COINS</div>
          <div style="font-size:18px;font-weight:700;">x<span id="hud-coins">00</span></div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:15px;">WORLD</div>
          <div style="font-size:18px;font-weight:700;">1-1</div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:15px;">TIME</div>
          <div id="hud-time" style="font-size:18px;font-weight:700;">400</div>
        </div>
      </div>
      <!-- Persistent title under HUD -->
      <div style="text-align:center;margin-top:6px;font-family:${MONO};font-size:22px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:#facc15;text-shadow:2px 2px 0 #000;">
        Manila Free Photo Shoot
      </div>
    </div>

    <!-- Ground blocks (bottom) -->
    <div id="ground" style="position:absolute;bottom:0;left:0;right:0;height:${SAFE_BOTTOM + 60}px;z-index:5;overflow:hidden;">
      <!-- Top row of bricks -->
      <div style="display:flex;flex-wrap:wrap;width:200%;animation:groundScroll 2s linear infinite;">
        ${Array(46).fill(0).map(() => `
          <div style="width:48px;height:48px;background:#c84c0c;border:3px solid #e8a060;border-top-color:#f8d8b0;border-left-color:#f8d8b0;border-bottom-color:#703010;border-right-color:#703010;flex-shrink:0;"></div>
        `).join('')}
      </div>
      <!-- Fill below -->
      <div style="background:#c84c0c;flex:1;min-height:400px;"></div>
    </div>

    <!-- Pipe (left side) -->
    <div id="pipe-left" style="position:absolute;bottom:${SAFE_BOTTOM + 60}px;left:80px;z-index:6;">
      <div style="width:96px;height:48px;background:#00a800;border:4px solid #005800;border-radius:6px 6px 0 0;"></div>
      <div style="width:80px;height:80px;background:#00a800;border:4px solid #005800;margin:0 auto;margin-left:8px;"></div>
    </div>

    <!-- Pipe (right side) -->
    <div id="pipe-right" style="position:absolute;bottom:${SAFE_BOTTOM + 60}px;right:60px;z-index:6;">
      <div style="width:96px;height:48px;background:#00a800;border:4px solid #005800;border-radius:6px 6px 0 0;"></div>
      <div style="width:80px;height:80px;background:#00a800;border:4px solid #005800;margin:0 auto;margin-left:8px;"></div>
    </div>

    <!-- Question blocks row -->
    <div id="qblocks" style="position:absolute;top:${SAFE_TOP + 160}px;left:${SAFE_LEFT + 100}px;display:flex;gap:16px;z-index:10;">
      <div class="qblock" id="qblock1" style="width:64px;height:64px;background:#e8a010;border:4px solid #f8d878;border-bottom-color:#885808;border-right-color:#885808;display:flex;align-items:center;justify-content:center;font-size:36px;font-weight:900;color:#fff;text-shadow:2px 2px 0 #885808;font-family:${MONO};border-radius:4px;">?</div>
      <div class="qblock" id="qblock2" style="width:64px;height:64px;background:#e8a010;border:4px solid #f8d878;border-bottom-color:#885808;border-right-color:#885808;display:flex;align-items:center;justify-content:center;font-size:36px;font-weight:900;color:#fff;text-shadow:2px 2px 0 #885808;font-family:${MONO};border-radius:4px;">?</div>
      <div class="qblock" id="qblock3" style="width:64px;height:64px;background:#e8a010;border:4px solid #f8d878;border-bottom-color:#885808;border-right-color:#885808;display:flex;align-items:center;justify-content:center;font-size:36px;font-weight:900;color:#fff;text-shadow:2px 2px 0 #885808;font-family:${MONO};border-radius:4px;">?</div>
      <div class="qblock" id="qblock4" style="width:64px;height:64px;background:#e8a010;border:4px solid #f8d878;border-bottom-color:#885808;border-right-color:#885808;display:flex;align-items:center;justify-content:center;font-size:36px;font-weight:900;color:#fff;text-shadow:2px 2px 0 #885808;font-family:${MONO};border-radius:4px;">?</div>
    </div>

    <!-- Main content area (between HUD and ground) -->
    <div id="main-content" style="position:absolute;top:${SAFE_TOP + 120}px;left:${SAFE_LEFT}px;right:${WIDTH - SAFE_RIGHT}px;bottom:${SAFE_BOTTOM + 120}px;z-index:20;overflow:hidden;">
    </div>

    <!-- Photo data -->
    <script id="photo-data" type="application/json">${photoDataJSON}</script>

  </div>

  <script>
    const mainContent = document.getElementById('main-content')
    const photos = JSON.parse(document.getElementById('photo-data').textContent)
    let coinCount = 0
    let score = 0

    function updateHUD() {
      document.getElementById('hud-coins').textContent = String(coinCount).padStart(2, '0')
      document.getElementById('hud-score').textContent = String(score).padStart(6, '0')
    }

    function addScore(pts) {
      score += pts
      updateHUD()
    }

    function addCoin() {
      coinCount++
      updateHUD()
    }

    function bounceBlock(id) {
      const el = document.getElementById(id)
      if (el) {
        el.style.animation = 'blockBounce 0.4s ease-out'
        setTimeout(() => {
          el.style.animation = ''
          // Turn block brown (used up)
          el.style.background = '#885808'
          el.textContent = ''
        }, 400)
      }
    }

    function spawnCoinAboveBlock(id) {
      const block = document.getElementById(id)
      if (!block) return
      const rect = block.getBoundingClientRect()
      const coin = document.createElement('div')
      coin.style.cssText = 'position:fixed;z-index:60;width:32px;height:40px;border-radius:50%;background:linear-gradient(135deg,#ffd700,#ffaa00);border:3px solid #c88000;animation:coinPop 0.6s ease-out forwards;pointer-events:none;'
      coin.style.left = (rect.left + rect.width/2 - 16) + 'px'
      coin.style.top = (rect.top - 10) + 'px'
      document.body.appendChild(coin)
      setTimeout(() => coin.remove(), 700)
    }

    // Countdown timer
    let timeLeft = 400
    const timerInterval = setInterval(() => {
      timeLeft -= 2
      if (timeLeft < 0) timeLeft = 0
      document.getElementById('hud-time').textContent = String(timeLeft)
    }, 120)

    // ═══ SCENE 1 (0-4s): Question blocks hit, MODELS WANTED ═══

    // Bounce blocks sequentially
    setTimeout(() => { bounceBlock('qblock1'); spawnCoinAboveBlock('qblock1'); addCoin(); addScore(200) }, 800)
    setTimeout(() => { bounceBlock('qblock2'); spawnCoinAboveBlock('qblock2'); addCoin(); addScore(200) }, 1200)

    // Show "MODELS WANTED" text popping out of block area
    setTimeout(() => {
      const txt = document.createElement('div')
      txt.style.cssText = 'position:absolute;top:20px;left:0;right:0;text-align:center;z-index:30;animation:slideDown 0.5s ease-out forwards;'
      txt.innerHTML = '<div style="font-family:${MONO};font-size:56px;font-weight:900;color:#fff;text-shadow:4px 4px 0 #000;letter-spacing:5px;text-transform:uppercase;">MODELS WANTED</div>'
      mainContent.appendChild(txt)
    }, 1600)

    // "No Experience Needed" subtitle
    setTimeout(() => {
      const sub = document.createElement('div')
      sub.style.cssText = 'position:absolute;top:100px;left:0;right:0;text-align:center;z-index:30;animation:fadeIn 0.4s ease-out forwards;'
      sub.innerHTML = '<div style="font-family:${MONO};font-size:28px;color:#facc15;text-shadow:2px 2px 0 #000;letter-spacing:3px;text-transform:uppercase;">No Experience Needed</div>'
      mainContent.appendChild(sub)
    }, 2400)

    // Bounce remaining blocks
    setTimeout(() => { bounceBlock('qblock3'); spawnCoinAboveBlock('qblock3'); addCoin(); addScore(200) }, 2800)
    setTimeout(() => { bounceBlock('qblock4'); spawnCoinAboveBlock('qblock4'); addCoin(); addScore(200) }, 3200)

    // ═══ SCENE 2 (4-14s): Photos as power-ups from blocks/pipes ═══

    // Clear scene 1 text
    setTimeout(() => {
      mainContent.innerHTML = ''
    }, 3900)

    // Show photos in a grid, each appearing with power-up animation
    setTimeout(() => {
      const grid = document.createElement('div')
      grid.id = 'photo-grid'
      grid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:80px 10px 10px 10px;width:100%;'
      photos.forEach((p, i) => {
        const cell = document.createElement('div')
        cell.id = 'mario-photo-' + i
        cell.style.cssText = 'opacity:0;position:relative;'
        // Mario-style blocky border frame
        cell.innerHTML = \`
          <div style="border:5px solid #e8a010;border-radius:4px;overflow:hidden;background:#000;box-shadow:3px 3px 0 #885808;">
            <div style="aspect-ratio:3/4;overflow:hidden;">
              <img src="\${p.src}" style="width:100%;height:100%;object-fit:cover;display:block;"/>
            </div>
            <div style="background:#1a1a1a;padding:6px 8px;text-align:center;border-top:3px solid #e8a010;">
              <span style="font-family:${MONO};font-size:18px;color:#facc15;text-shadow:1px 1px 0 #000;letter-spacing:2px;text-transform:uppercase;">\${p.name}</span>
              <span style="font-family:${MONO};font-size:14px;color:#fff;margin-left:6px;text-shadow:1px 1px 0 #000;">\${p.city}</span>
            </div>
          </div>
        \`
        grid.appendChild(cell)
      })
      mainContent.appendChild(grid)

      // Stagger photo appearances (~1.2s each)
      photos.forEach((_, i) => {
        setTimeout(() => {
          const el = document.getElementById('mario-photo-' + i)
          if (el) {
            el.style.animation = 'photoSlideUp 0.5s ease-out forwards'
            addScore(100)
            addCoin()
          }
        }, i * 1200)
      })
    }, 4000)

    // ═══ SCENE 3 (14-18s): Three coins with steps ═══

    setTimeout(() => {
      mainContent.innerHTML = ''

      const stepsContainer = document.createElement('div')
      stepsContainer.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:40px;padding:60px 20px;'

      const steps = [
        { num: '1', text: 'DM me on Instagram', delay: 0 },
        { num: '2', text: 'We pick a date', delay: 1200 },
        { num: '3', text: 'Show up. I guide you.', delay: 2400 },
      ]

      steps.forEach(s => {
        const row = document.createElement('div')
        row.id = 'step-' + s.num
        row.style.cssText = 'display:flex;align-items:center;gap:24px;opacity:0;'
        row.innerHTML = \`
          <div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#ffd700,#ffaa00);border:4px solid #c88000;display:flex;align-items:center;justify-content:center;font-family:${MONO};font-size:28px;font-weight:900;color:#885808;text-shadow:1px 1px 0 #ffd700;flex-shrink:0;box-shadow:3px 3px 0 rgba(0,0,0,0.3);">\${s.num}</div>
          <div style="font-family:${MONO};font-size:28px;color:#fff;text-shadow:3px 3px 0 #000;letter-spacing:2px;text-transform:uppercase;">\${s.text}</div>
        \`
        stepsContainer.appendChild(row)

        setTimeout(() => {
          const el = document.getElementById('step-' + s.num)
          if (el) {
            el.style.animation = 'coinCollect 0.5s ease-out forwards'
            addCoin()
            addScore(500)
          }
        }, s.delay)
      })

      mainContent.appendChild(stepsContainer)
    }, 14000)

    // ═══ SCENE 4 (18-22s): COURSE CLEAR! ═══

    setTimeout(() => {
      mainContent.innerHTML = ''

      // Hide question blocks and pipes
      document.getElementById('qblocks').style.display = 'none'

      const finale = document.createElement('div')
      finale.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:20px;padding:40px 20px;'

      // COURSE CLEAR banner
      const banner = document.createElement('div')
      banner.id = 'course-clear'
      banner.style.cssText = 'opacity:0;text-align:center;'
      banner.innerHTML = \`
        <div style="font-family:${MONO};font-size:52px;font-weight:900;color:#facc15;text-shadow:4px 4px 0 #000;letter-spacing:6px;text-transform:uppercase;animation:flashIn 0.6s ease-out forwards;">COURSE CLEAR!</div>
      \`
      finale.appendChild(banner)

      // Time bonus
      const bonus = document.createElement('div')
      bonus.id = 'time-bonus'
      bonus.style.cssText = 'opacity:0;text-align:center;margin-top:12px;'
      bonus.innerHTML = \`
        <div style="font-family:${MONO};font-size:24px;color:#fff;text-shadow:2px 2px 0 #000;letter-spacing:3px;">TIME BONUS: 5000</div>
      \`
      finale.appendChild(bonus)

      // Handle / castle
      const handle = document.createElement('div')
      handle.id = 'castle-cta'
      handle.style.cssText = 'opacity:0;text-align:center;margin-top:20px;'
      handle.innerHTML = \`
        <div style="display:inline-block;position:relative;padding:0 30px;">
          <!-- Flag pole -->
          <div style="position:absolute;left:50%;top:-90px;transform:translateX(-50%);width:6px;height:80px;background:#888;border:2px solid #555;">
            <div style="position:absolute;top:0;left:6px;width:0;height:0;overflow:hidden;">
              <div id="flag-inner" style="width:40px;height:30px;background:#00a800;border:2px solid #005800;animation:flagRaise 0.6s ease-out forwards;clip-path:polygon(0 0, 100% 50%, 0 100%);"></div>
            </div>
          </div>
          <div style="font-family:${MONO};font-size:48px;font-weight:900;color:#fff;text-shadow:3px 3px 0 #000;letter-spacing:4px;">@madebyaidan</div>
          <div style="font-family:${MONO};font-size:22px;color:rgba(255,255,255,0.7);text-shadow:2px 2px 0 #000;margin-top:4px;letter-spacing:2px;">on Instagram</div>
        </div>
      \`
      finale.appendChild(handle)

      // DM Me button styled as Mario brick
      const dmBtn = document.createElement('div')
      dmBtn.id = 'dm-button'
      dmBtn.style.cssText = 'opacity:0;margin-top:24px;'
      dmBtn.innerHTML = \`
        <div style="display:inline-block;background:#00a800;border:5px solid #005800;border-radius:6px;padding:18px 48px;box-shadow:4px 4px 0 rgba(0,0,0,0.4);">
          <span style="font-family:${MONO};font-size:34px;font-weight:900;color:#fff;text-shadow:2px 2px 0 #005800;letter-spacing:4px;text-transform:uppercase;">DM Me</span>
        </div>
      \`
      finale.appendChild(dmBtn)

      // Limited spots
      const limited = document.createElement('div')
      limited.id = 'limited-spots'
      limited.style.cssText = 'opacity:0;margin-top:16px;'
      limited.innerHTML = \`
        <div style="font-family:${MONO};font-size:22px;color:#facc15;text-shadow:2px 2px 0 #000;letter-spacing:3px;text-transform:uppercase;animation:starBlink 1.5s infinite;">
          ★ Limited Spots This Month ★
        </div>
      \`
      finale.appendChild(limited)

      mainContent.appendChild(finale)

      // Sequence the finale elements
      setTimeout(() => {
        document.getElementById('course-clear').style.opacity = '1'
        addScore(5000)
      }, 100)
      setTimeout(() => {
        document.getElementById('time-bonus').style.opacity = '1'
        document.getElementById('time-bonus').style.animation = 'fadeIn 0.4s ease-out forwards'
        addScore(5000)
      }, 800)
      setTimeout(() => {
        document.getElementById('castle-cta').style.opacity = '1'
        document.getElementById('castle-cta').style.animation = 'fadeIn 0.5s ease-out forwards'
      }, 1500)
      setTimeout(() => {
        document.getElementById('dm-button').style.opacity = '1'
        document.getElementById('dm-button').style.animation = 'fadeIn 0.4s ease-out forwards'
      }, 2200)
      setTimeout(() => {
        document.getElementById('limited-spots').style.opacity = '1'
        document.getElementById('limited-spots').style.animation = 'fadeIn 0.4s ease-out forwards'
      }, 2800)
    }, 18000)

    // Stop timer at end
    setTimeout(() => { clearInterval(timerInterval) }, 22000)

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
    strategy: 'v33a — Super Mario Bros NES aesthetic with question blocks, coins, pipes, and course clear',
    safeBottomPixels: SAFE_BOTTOM,
    photos: PROOF_PHOTOS.map(p => p.file),
  })

  const browser = await chromium.launch()
  console.log('Recording Mario-themed version...')

  const videoCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    recordVideo: { dir: OUT_DIR, size: { width: WIDTH, height: HEIGHT } }
  })

  const videoPage = await videoCtx.newPage()
  await videoPage.evaluate(() => {
    document.documentElement.style.background = '#5c94fc'
    document.body.style.background = '#5c94fc'
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
  const dstVideo = path.join(OUT_DIR, 'manila-mario-v33a.mp4')

  const { execSync } = await import('child_process')
  try {
    execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${dstVideo}"`, { stdio: 'pipe' })
    fs.unlinkSync(srcVideo)
    console.log('Rendered manila-mario-v33a.mp4')
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
