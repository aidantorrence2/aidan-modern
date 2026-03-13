import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, "output-31a")

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

const TETRIS_COLORS = ['#00f0f0', '#f0f000', '#a000f0', '#00f000', '#f00000', '#0000f0', '#f0a000']

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
  const photosJSON = JSON.stringify(PROOF_PHOTOS.map(p => ({ src: imageDataMap[p.file], name: p.name, city: p.city })))
  const colorsJSON = JSON.stringify(TETRIS_COLORS)

  return `<!DOCTYPE html>
<html>
<head>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { margin: 0; padding: 0; background: #0a0a0a; font-family: ${MONO}; overflow: hidden; }

  @keyframes fallDown {
    0% { transform: translateY(-100px); opacity: 0; }
    80% { opacity: 1; }
    100% { transform: translateY(0); opacity: 1; }
  }

  @keyframes lineClear {
    0% { background: rgba(255,255,255,0.9); transform: scaleX(1); }
    50% { background: rgba(255,255,255,0.6); transform: scaleX(1.02); }
    100% { background: transparent; transform: scaleX(1); }
  }

  @keyframes blockPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }

  @keyframes photoReveal {
    0% { opacity: 0; transform: scale(0.85); }
    100% { opacity: 1; transform: scale(1); }
  }

  @keyframes ctaGlow {
    0%, 100% { box-shadow: 0 0 20px rgba(0,240,240,0.3); }
    50% { box-shadow: 0 0 40px rgba(0,240,240,0.6); }
  }

  @keyframes scanlineMove {
    0% { transform: translateY(0); }
    100% { transform: translateY(6px); }
  }
</style>
</head>
<body>
  <div id="root" style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#0a0a0a;">

    <!-- Tetris grid background -->
    <canvas id="grid-bg" width="${WIDTH}" height="${HEIGHT}" style="position:absolute;inset:0;z-index:0;"></canvas>

    <!-- CRT scanlines -->
    <div style="position:absolute;inset:0;z-index:100;pointer-events:none;background:repeating-linear-gradient(0deg,rgba(0,0,0,0.15) 0px,rgba(0,0,0,0.15) 1px,transparent 1px,transparent 3px);animation:scanlineMove 0.3s linear infinite;"></div>
    <div style="position:absolute;inset:0;z-index:99;pointer-events:none;background:radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.5) 100%);"></div>

    <!-- Persistent header -->
    <div id="persistent-header" style="position:absolute;top:${SAFE_TOP}px;left:${SAFE_LEFT}px;right:${WIDTH - SAFE_RIGHT}px;z-index:50;pointer-events:none;opacity:0;padding:12px 0;">
      <div style="font-family:${MONO};font-size:26px;font-weight:900;color:#00f0f0;letter-spacing:3px;text-transform:uppercase;text-shadow:0 0 10px rgba(0,240,240,0.5),2px 2px 0 #0000f0;">MANILA FREE PHOTO SHOOT</div>
    </div>

    <!-- Main content area -->
    <div id="stage" style="position:absolute;top:${SAFE_TOP + 55}px;left:${SAFE_LEFT}px;right:${WIDTH - SAFE_RIGHT}px;bottom:${SAFE_BOTTOM + 20}px;overflow:hidden;z-index:10;"></div>

    <!-- Falling blocks layer (behind content, above grid) -->
    <canvas id="falling-blocks" width="${WIDTH}" height="${HEIGHT}" style="position:absolute;inset:0;z-index:5;pointer-events:none;"></canvas>

    <!-- Photo data -->
    <script id="photo-data" type="application/json">${photosJSON}</script>
    <script id="color-data" type="application/json">${colorsJSON}</script>

  </div>

  <script>
    const stage = document.getElementById('stage')
    const colors = JSON.parse(document.getElementById('color-data').textContent)
    const photos = JSON.parse(document.getElementById('photo-data').textContent)
    const BLOCK = 30

    // Draw grid background
    ;(function drawGrid() {
      const c = document.getElementById('grid-bg')
      const ctx = c.getContext('2d')
      ctx.strokeStyle = 'rgba(255,255,255,0.04)'
      ctx.lineWidth = 1
      for (let x = 0; x < ${WIDTH}; x += BLOCK) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, ${HEIGHT}); ctx.stroke()
      }
      for (let y = 0; y < ${HEIGHT}; y += BLOCK) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(${WIDTH}, y); ctx.stroke()
      }
      // Draw some static blocks at the bottom for atmosphere
      const bottomRows = 4
      for (let row = 0; row < bottomRows; row++) {
        for (let col = 0; col < Math.floor(${WIDTH} / BLOCK); col++) {
          if (Math.random() < 0.3 + row * 0.15) {
            const color = colors[Math.floor(Math.random() * colors.length)]
            const bx = col * BLOCK
            const by = ${HEIGHT} - (row + 1) * BLOCK
            ctx.fillStyle = color
            ctx.globalAlpha = 0.12
            ctx.fillRect(bx + 1, by + 1, BLOCK - 2, BLOCK - 2)
            ctx.globalAlpha = 0.06
            ctx.strokeStyle = color
            ctx.strokeRect(bx + 1, by + 1, BLOCK - 2, BLOCK - 2)
          }
        }
      }
      ctx.globalAlpha = 1
    })()

    // Animate falling blocks on the side canvas
    ;(function animateFallingBlocks() {
      const c = document.getElementById('falling-blocks')
      const ctx = c.getContext('2d')
      const blocks = []

      function spawnBlock() {
        blocks.push({
          x: Math.floor(Math.random() * (${WIDTH} / BLOCK)) * BLOCK,
          y: -BLOCK,
          color: colors[Math.floor(Math.random() * colors.length)],
          speed: 1 + Math.random() * 3,
          alpha: 0.15 + Math.random() * 0.2
        })
      }

      function tick() {
        ctx.clearRect(0, 0, ${WIDTH}, ${HEIGHT})
        if (Math.random() < 0.15) spawnBlock()
        for (let i = blocks.length - 1; i >= 0; i--) {
          const b = blocks[i]
          b.y += b.speed
          if (b.y > ${HEIGHT}) { blocks.splice(i, 1); continue }
          ctx.globalAlpha = b.alpha
          ctx.fillStyle = b.color
          ctx.fillRect(b.x + 1, b.y + 1, BLOCK - 2, BLOCK - 2)
          ctx.strokeStyle = b.color
          ctx.globalAlpha = b.alpha * 0.5
          ctx.strokeRect(b.x + 1, b.y + 1, BLOCK - 2, BLOCK - 2)
        }
        ctx.globalAlpha = 1
        requestAnimationFrame(tick)
      }
      tick()
    })()

    // Utility: create a block-styled text element
    function blockText(text, size, color, extraStyle) {
      const div = document.createElement('div')
      div.style.cssText = 'font-family:${MONO};font-size:'+size+'px;font-weight:900;color:'+color+';letter-spacing:3px;text-transform:uppercase;text-shadow:2px 2px 0 rgba(0,0,0,0.8),0 0 10px '+color+'40;' + (extraStyle||'')
      div.textContent = text
      return div
    }

    // Utility: create a tetris block border frame
    function blockFrame(width, height, borderColor) {
      const frame = document.createElement('div')
      const bSize = 8
      frame.style.cssText = 'position:relative;width:'+width+'px;height:'+height+'px;'
      // Top border
      for (let x = 0; x < width; x += bSize) {
        const b = document.createElement('div')
        b.style.cssText = 'position:absolute;top:0;left:'+x+'px;width:'+bSize+'px;height:'+bSize+'px;background:'+borderColor+';'
        frame.appendChild(b)
      }
      // Bottom border
      for (let x = 0; x < width; x += bSize) {
        const b = document.createElement('div')
        b.style.cssText = 'position:absolute;bottom:0;left:'+x+'px;width:'+bSize+'px;height:'+bSize+'px;background:'+borderColor+';'
        frame.appendChild(b)
      }
      // Left border
      for (let y = 0; y < height; y += bSize) {
        const b = document.createElement('div')
        b.style.cssText = 'position:absolute;top:'+y+'px;left:0;width:'+bSize+'px;height:'+bSize+'px;background:'+borderColor+';'
        frame.appendChild(b)
      }
      // Right border
      for (let y = 0; y < height; y += bSize) {
        const b = document.createElement('div')
        b.style.cssText = 'position:absolute;top:'+y+'px;right:0;width:'+bSize+'px;height:'+bSize+'px;background:'+borderColor+';'
        frame.appendChild(b)
      }
      return frame
    }

    function clearStage() {
      while (stage.firstChild) stage.removeChild(stage.firstChild)
    }

    // ═══ SHOW HEADER ═══
    setTimeout(() => {
      const h = document.getElementById('persistent-header')
      if (h) { h.style.transition = 'opacity 0.6s ease-out'; h.style.opacity = '1' }
    }, 200)

    // ═══ SCENE 1: Tetris blocks form "MODELS WANTED" (0-4s) ═══
    setTimeout(() => {
      const wrapper = document.createElement('div')
      wrapper.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:30px;'

      // "MODELS" text — blocks fall in
      const modelsRow = document.createElement('div')
      modelsRow.style.cssText = 'display:flex;gap:6px;'
      const modelsLetters = 'MODELS'
      modelsLetters.split('').forEach((ch, i) => {
        const letter = document.createElement('div')
        letter.style.cssText = 'width:70px;height:80px;display:flex;align-items:center;justify-content:center;font-family:${MONO};font-size:52px;font-weight:900;color:#fff;background:'+colors[i % colors.length]+';border:3px solid rgba(255,255,255,0.3);opacity:0;animation:fallDown 0.35s ease-out '+(0.15 * i)+'s forwards;text-shadow:2px 2px 0 rgba(0,0,0,0.5);'
        letter.textContent = ch
        modelsRow.appendChild(letter)
      })

      // "WANTED" text
      const wantedRow = document.createElement('div')
      wantedRow.style.cssText = 'display:flex;gap:6px;'
      const wantedLetters = 'WANTED'
      wantedLetters.split('').forEach((ch, i) => {
        const letter = document.createElement('div')
        letter.style.cssText = 'width:70px;height:80px;display:flex;align-items:center;justify-content:center;font-family:${MONO};font-size:52px;font-weight:900;color:#fff;background:'+colors[(i + 3) % colors.length]+';border:3px solid rgba(255,255,255,0.3);opacity:0;animation:fallDown 0.35s ease-out '+(1.0 + 0.15 * i)+'s forwards;text-shadow:2px 2px 0 rgba(0,0,0,0.5);'
        letter.textContent = ch
        wantedRow.appendChild(letter)
      })

      wrapper.appendChild(modelsRow)
      wrapper.appendChild(wantedRow)

      // "No Experience Needed" subtitle
      const sub = document.createElement('div')
      sub.style.cssText = 'font-family:${MONO};font-size:28px;color:#f0f000;letter-spacing:2px;text-transform:uppercase;opacity:0;margin-top:20px;text-shadow:0 0 8px rgba(240,240,0,0.4);'
      setTimeout(() => {
        sub.style.transition = 'opacity 0.5s ease-out'
        sub.style.opacity = '1'
      }, 2500)
      sub.textContent = 'No Experience Needed'
      wrapper.appendChild(sub)

      stage.appendChild(wrapper)
    }, 300)

    // ═══ SCENE 2: Photos with Tetris block frames (4-14s) ═══
    setTimeout(() => {
      clearStage()
      const container = document.createElement('div')
      container.id = 'photo-container'
      container.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;position:relative;'
      stage.appendChild(container)

      photos.forEach((photo, i) => {
        setTimeout(() => {
          // Clear previous photo
          while (container.firstChild) container.removeChild(container.firstChild)

          const frameColor = colors[i % colors.length]
          const frameW = 520
          const frameH = 650

          // Outer frame with block border
          const outer = document.createElement('div')
          outer.style.cssText = 'position:relative;padding:12px;background:rgba(0,0,0,0.8);animation:photoReveal 0.4s ease-out forwards;'

          // Block border top
          const borderTop = document.createElement('div')
          borderTop.style.cssText = 'display:flex;gap:0;margin-bottom:4px;'
          for (let b = 0; b < Math.floor(frameW / 16) + 2; b++) {
            const bl = document.createElement('div')
            bl.style.cssText = 'width:16px;height:16px;background:'+colors[(i+b)%colors.length]+';border:1px solid rgba(255,255,255,0.2);'
            borderTop.appendChild(bl)
          }
          outer.appendChild(borderTop)

          // Photo
          const imgWrap = document.createElement('div')
          imgWrap.style.cssText = 'width:'+frameW+'px;height:'+frameH+'px;overflow:hidden;position:relative;'
          const img = document.createElement('img')
          img.src = photo.src
          img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;'
          imgWrap.appendChild(img)

          // Side block accents
          const leftAccent = document.createElement('div')
          leftAccent.style.cssText = 'position:absolute;left:-16px;top:0;bottom:0;width:16px;display:flex;flex-direction:column;'
          for (let b = 0; b < Math.floor(frameH / 16); b++) {
            const bl = document.createElement('div')
            bl.style.cssText = 'width:16px;height:16px;background:'+frameColor+';border:1px solid rgba(255,255,255,0.15);opacity:'+(Math.random() > 0.3 ? '1' : '0.3')+';'
            leftAccent.appendChild(bl)
          }
          imgWrap.appendChild(leftAccent)

          const rightAccent = document.createElement('div')
          rightAccent.style.cssText = 'position:absolute;right:-16px;top:0;bottom:0;width:16px;display:flex;flex-direction:column;'
          for (let b = 0; b < Math.floor(frameH / 16); b++) {
            const bl = document.createElement('div')
            bl.style.cssText = 'width:16px;height:16px;background:'+frameColor+';border:1px solid rgba(255,255,255,0.15);opacity:'+(Math.random() > 0.3 ? '1' : '0.3')+';'
            rightAccent.appendChild(bl)
          }
          imgWrap.appendChild(rightAccent)

          outer.appendChild(imgWrap)

          // Block border bottom
          const borderBot = document.createElement('div')
          borderBot.style.cssText = 'display:flex;gap:0;margin-top:4px;'
          for (let b = 0; b < Math.floor(frameW / 16) + 2; b++) {
            const bl = document.createElement('div')
            bl.style.cssText = 'width:16px;height:16px;background:'+colors[(i+b+2)%colors.length]+';border:1px solid rgba(255,255,255,0.2);'
            borderBot.appendChild(bl)
          }
          outer.appendChild(borderBot)

          container.appendChild(outer)

          // Name / city caption
          const caption = document.createElement('div')
          caption.style.cssText = 'margin-top:18px;text-align:center;animation:photoReveal 0.3s ease-out 0.2s forwards;opacity:0;'
          caption.innerHTML = '<span style="font-family:${MONO};font-size:30px;font-weight:700;color:'+frameColor+';text-shadow:0 0 8px '+frameColor+'40;">'+photo.name+'</span><span style="font-family:${MONO};font-size:24px;color:rgba(255,255,255,0.5);margin-left:12px;">'+photo.city+'</span>'
          container.appendChild(caption)

        }, i * 1200)
      })
    }, 4000)

    // ═══ SCENE 3: Steps as "line clears" (14-18s) ═══
    setTimeout(() => {
      clearStage()
      const wrapper = document.createElement('div')
      wrapper.style.cssText = 'display:flex;flex-direction:column;justify-content:center;height:100%;gap:0;padding:0 10px;'
      stage.appendChild(wrapper)

      const steps = [
        { num: '1', text: 'DM me on Instagram', sub: 'Just say hey — I\\'ll reply', color: '#00f0f0' },
        { num: '2', text: 'We pick a date & location', sub: 'Planned together with you', color: '#f0f000' },
        { num: '3', text: 'Show up — I guide you', sub: 'No experience needed', color: '#00f000' },
      ]

      steps.forEach((step, i) => {
        setTimeout(() => {
          // Line clear flash
          const flash = document.createElement('div')
          flash.style.cssText = 'width:100%;height:120px;background:rgba(255,255,255,0.8);animation:lineClear 0.4s ease-out forwards;margin-bottom:20px;display:flex;align-items:center;padding:0 20px;position:relative;overflow:hidden;'

          // After flash, show step content
          setTimeout(() => {
            flash.style.background = 'transparent'
            flash.style.border = 'none'
            flash.innerHTML = ''

            // Block number
            const numBlock = document.createElement('div')
            numBlock.style.cssText = 'width:70px;height:70px;background:'+step.color+';display:flex;align-items:center;justify-content:center;font-family:${MONO};font-size:40px;font-weight:900;color:#000;border:3px solid rgba(255,255,255,0.3);margin-right:20px;flex-shrink:0;'
            numBlock.textContent = step.num
            flash.appendChild(numBlock)

            const textWrap = document.createElement('div')
            textWrap.innerHTML = '<div style="font-family:${MONO};font-size:28px;font-weight:700;color:#fff;margin-bottom:4px;">'+step.text+'</div><div style="font-family:${MONO};font-size:20px;color:rgba(255,255,255,0.5);">'+step.sub+'</div>'
            flash.appendChild(textWrap)

            // Bottom block row accent
            const blockRow = document.createElement('div')
            blockRow.style.cssText = 'position:absolute;bottom:0;left:0;right:0;height:6px;display:flex;'
            for (let b = 0; b < 60; b++) {
              const bl = document.createElement('div')
              bl.style.cssText = 'flex:1;height:6px;background:'+step.color+';opacity:'+(Math.random() > 0.4 ? '0.6' : '0.2')+';'
              blockRow.appendChild(bl)
            }
            flash.appendChild(blockRow)
          }, 400)

          wrapper.appendChild(flash)
        }, i * 1200)
      })
    }, 14000)

    // ═══ SCENE 4: CTA with Tetris blocks stacking (18-22s) ═══
    setTimeout(() => {
      clearStage()
      const wrapper = document.createElement('div')
      wrapper.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:20px;position:relative;'
      stage.appendChild(wrapper)

      // Stacking blocks on left and right
      const leftStack = document.createElement('div')
      leftStack.style.cssText = 'position:absolute;left:0;bottom:0;width:60px;display:flex;flex-direction:column-reverse;'
      const rightStack = document.createElement('div')
      rightStack.style.cssText = 'position:absolute;right:0;bottom:0;width:60px;display:flex;flex-direction:column-reverse;'

      for (let b = 0; b < 20; b++) {
        const lbl = document.createElement('div')
        lbl.style.cssText = 'width:60px;height:30px;background:'+colors[b%colors.length]+';border:1px solid rgba(255,255,255,0.15);opacity:0;animation:fallDown 0.3s ease-out '+(0.1*b)+'s forwards;'
        leftStack.appendChild(lbl)

        const rbl = document.createElement('div')
        rbl.style.cssText = 'width:60px;height:30px;background:'+colors[(b+3)%colors.length]+';border:1px solid rgba(255,255,255,0.15);opacity:0;animation:fallDown 0.3s ease-out '+(0.1*b+0.05)+'s forwards;'
        rightStack.appendChild(rbl)
      }

      wrapper.appendChild(leftStack)
      wrapper.appendChild(rightStack)

      // @madebyaidan
      const handle = document.createElement('div')
      handle.style.cssText = 'font-family:${MONO};font-size:48px;font-weight:900;color:#fff;text-align:center;opacity:0;text-shadow:0 0 15px rgba(0,240,240,0.4);'
      setTimeout(() => { handle.style.transition = 'opacity 0.6s ease-out'; handle.style.opacity = '1' }, 300)
      handle.textContent = '@madebyaidan'
      wrapper.appendChild(handle)

      // "on Instagram" subtext
      const igSub = document.createElement('div')
      igSub.style.cssText = 'font-family:${MONO};font-size:24px;color:rgba(255,255,255,0.45);text-align:center;opacity:0;'
      setTimeout(() => { igSub.style.transition = 'opacity 0.5s ease-out 0.2s'; igSub.style.opacity = '1' }, 500)
      igSub.textContent = 'on Instagram'
      wrapper.appendChild(igSub)

      // DM Me button as Tetris block
      const dmBtn = document.createElement('div')
      dmBtn.style.cssText = 'margin-top:20px;padding:20px 60px;background:#00f0f0;border:4px solid rgba(255,255,255,0.3);font-family:${MONO};font-size:36px;font-weight:900;color:#000;text-align:center;opacity:0;animation:ctaGlow 1.5s ease-in-out infinite;text-transform:uppercase;letter-spacing:3px;'
      setTimeout(() => { dmBtn.style.transition = 'opacity 0.5s ease-out'; dmBtn.style.opacity = '1' }, 800)
      dmBtn.textContent = 'DM ME'
      wrapper.appendChild(dmBtn)

      // "Limited spots" as falling block text
      const limited = document.createElement('div')
      limited.style.cssText = 'margin-top:30px;font-family:${MONO};font-size:22px;color:#f0f000;text-align:center;opacity:0;letter-spacing:2px;text-shadow:0 0 8px rgba(240,240,0,0.3);'
      setTimeout(() => { limited.style.transition = 'opacity 0.5s ease-out'; limited.style.opacity = '1' }, 1200)
      limited.textContent = '⚡ LIMITED SPOTS THIS MONTH'
      wrapper.appendChild(limited)

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
    strategy: 'v31a — Tetris themed reel ad with falling blocks and game aesthetic',
    safeBottomPixels: SAFE_BOTTOM,
    photos: PROOF_PHOTOS.map(p => p.file),
  })

  const browser = await chromium.launch()
  console.log('Recording Tetris themed reel...')

  const videoCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    recordVideo: { dir: OUT_DIR, size: { width: WIDTH, height: HEIGHT } }
  })

  const videoPage = await videoCtx.newPage()
  await videoPage.evaluate(() => {
    document.documentElement.style.background = '#0a0a0a'
    document.body.style.background = '#0a0a0a'
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
  const dstVideo = path.join(OUT_DIR, 'manila-tetris-v31a.mp4')

  const { execSync } = await import('child_process')
  try {
    execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${dstVideo}"`, { stdio: 'pipe' })
    fs.unlinkSync(srcVideo)
    console.log('Rendered manila-tetris-v31a.mp4')
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
