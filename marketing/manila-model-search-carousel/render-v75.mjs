import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v75')

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 410

const SF = "-apple-system, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif"
const MANILA_COLOR = '#E8443A'
const IG_BG = '#0a0a0a'

const TOTAL_DURATION_MS = 16000

const PHOTOS = [
  'manila-gallery-purple-001-cropped.jpg',
  'manila-gallery-purple-002-cropped.jpg',
  'manila-gallery-purple-003-cropped.jpg',
  'manila-gallery-purple-004-cropped.jpg',
  'manila-gallery-purple-005-cropped.jpg',
  'manila-gallery-purple-006-cropped.jpg',
]

const EXTRA_PHOTOS = [
  'manila-gallery-dsc-0190.jpg',
  'manila-gallery-dsc-0075.jpg',
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
  // Glass bubble configs
  const bubbles = [
    // Phase 1: MANILA hero glass pill (0.3s)
    { id: 'b-manila', type: 'glass-text', text: 'MANILA', x: 540, y: 440, w: 900, h: 240, delay: 0.3, fontSize: 140, fontWeight: 900, letterSpacing: 28, radius: 120 },

    // Phase 2: Photo bubbles pop in with glass borders (0.8-3s)
    { id: 'b-photo1', type: 'photo', src: PHOTOS[0], x: 220, y: 230, size: 420, delay: 0.8 },
    { id: 'b-photo2', type: 'photo', src: PHOTOS[1], x: 850, y: 180, size: 380, delay: 1.2 },
    { id: 'b-photo3', type: 'photo', src: PHOTOS[2], x: 250, y: 740, size: 400, delay: 1.6 },
    { id: 'b-photo4', type: 'photo', src: PHOTOS[3], x: 820, y: 660, size: 420, delay: 2.0 },
    { id: 'b-photo5', type: 'photo', src: PHOTOS[4], x: 540, y: 960, size: 360, delay: 2.4 },
    { id: 'b-photo6', type: 'photo', src: PHOTOS[5], x: 180, y: 1100, size: 340, delay: 2.8 },

    // Phase 3: Info + CTA glass pills (3.5-7s)
    { id: 'b-free', type: 'glass-pill', text: 'FREE PHOTO SHOOT', x: 540, y: 1200, w: 520, h: 110, delay: 3.5, fontSize: 42, accent: true },
    { id: 'b-loc', type: 'glass-pill', text: '📍 BGC · Makati · Manila', x: 540, y: 1330, w: 680, h: 100, delay: 4.0, fontSize: 38 },
    { id: 'b-handle', type: 'glass-pill', text: '@madebyaidan', x: 540, y: 1460, w: 480, h: 110, delay: 5.0, fontSize: 44, accent: true },
    { id: 'b-dm', type: 'glass-pill', text: 'DM on Instagram', x: 540, y: 1580, w: 480, h: 96, delay: 5.8, fontSize: 34 },

    // Extra photos fill gaps (5.5-7s)
    { id: 'b-photo7', type: 'photo', src: EXTRA_PHOTOS[0], x: 880, y: 1020, size: 320, delay: 4.5 },
    { id: 'b-photo8', type: 'photo', src: EXTRA_PHOTOS[1], x: 540, y: 160, size: 300, delay: 5.2 },
  ]

  function glassBubbleHTML(b) {
    if (b.type === 'photo') {
      const left = b.x - b.size / 2
      const top = b.y - b.size / 2
      return `<div class="bubble-pop" id="${b.id}" data-delay="${b.delay}" style="
        position:absolute;left:${left}px;top:${top}px;width:${b.size}px;height:${b.size}px;
        border-radius:50%;overflow:hidden;opacity:0;z-index:5;
        box-shadow:
          0 8px 32px rgba(0,0,0,0.4),
          inset 0 1px 0 rgba(255,255,255,0.2),
          0 0 0 1px rgba(255,255,255,0.08);
      ">
        <img src="${imageDataMap[b.src]}" style="width:100%;height:100%;object-fit:cover;" />
        <!-- Glass highlight overlay -->
        <div style="
          position:absolute;inset:0;border-radius:50%;
          background: linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 50%, rgba(0,0,0,0.1) 100%);
          pointer-events:none;
        "></div>
        <!-- Inner rim light -->
        <div style="
          position:absolute;inset:3px;border-radius:50%;
          border:1px solid rgba(255,255,255,0.1);
          pointer-events:none;
        "></div>
      </div>`
    }

    if (b.type === 'glass-text') {
      const left = b.x - b.w / 2
      const top = b.y - b.h / 2
      return `<div class="bubble-pop" id="${b.id}" data-delay="${b.delay}" style="
        position:absolute;left:${left}px;top:${top}px;width:${b.w}px;height:${b.h}px;
        border-radius:${b.radius || 40}px;opacity:0;z-index:10;
        background: linear-gradient(135deg, rgba(232,68,58,0.35) 0%, rgba(232,68,58,0.15) 100%);
        backdrop-filter: blur(40px) saturate(180%);
        -webkit-backdrop-filter: blur(40px) saturate(180%);
        border: 1px solid rgba(255,255,255,0.18);
        box-shadow:
          0 8px 32px rgba(232,68,58,0.3),
          inset 0 1px 0 rgba(255,255,255,0.25),
          inset 0 -1px 0 rgba(0,0,0,0.1);
        display:flex;align-items:center;justify-content:center;
      ">
        <span style="
          font-family:${SF};font-size:${b.fontSize}px;font-weight:${b.fontWeight || 800};
          color:#fff;letter-spacing:${b.letterSpacing || 4}px;
          text-shadow: 0 2px 8px rgba(0,0,0,0.3);
        ">${b.text}</span>
        <!-- Glass specular highlight -->
        <div style="
          position:absolute;top:0;left:10%;right:10%;height:50%;
          border-radius:${b.radius || 40}px ${b.radius || 40}px 0 0;
          background: linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 100%);
          pointer-events:none;
        "></div>
      </div>`
    }

    if (b.type === 'glass-pill') {
      const left = b.x - b.w / 2
      const top = b.y - b.h / 2
      const bgColor = b.accent
        ? 'linear-gradient(135deg, rgba(232,68,58,0.4) 0%, rgba(232,68,58,0.2) 100%)'
        : 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 100%)'
      const borderColor = b.accent
        ? 'rgba(232,68,58,0.4)'
        : 'rgba(255,255,255,0.15)'
      const shadowColor = b.accent
        ? '0 4px 20px rgba(232,68,58,0.25)'
        : '0 4px 20px rgba(0,0,0,0.3)'

      return `<div class="bubble-pop" id="${b.id}" data-delay="${b.delay}" style="
        position:absolute;left:${left}px;top:${top}px;width:${b.w}px;height:${b.h}px;
        border-radius:${b.h / 2}px;opacity:0;z-index:8;
        background: ${bgColor};
        backdrop-filter: blur(30px) saturate(160%);
        -webkit-backdrop-filter: blur(30px) saturate(160%);
        border: 1px solid ${borderColor};
        box-shadow: ${shadowColor}, inset 0 1px 0 rgba(255,255,255,0.15);
        display:flex;align-items:center;justify-content:center;
      ">
        <span style="
          font-family:${SF};font-size:${b.fontSize}px;font-weight:${b.accent ? 800 : 600};
          color:rgba(255,255,255,${b.accent ? '1' : '0.9'});
          letter-spacing:${b.accent ? 3 : 1}px;
          text-shadow: 0 1px 4px rgba(0,0,0,0.2);
        ">${b.text}</span>
        <!-- Top highlight -->
        <div style="
          position:absolute;top:0;left:15%;right:15%;height:45%;
          border-radius:${b.h / 2}px ${b.h / 2}px 0 0;
          background: linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 100%);
          pointer-events:none;
        "></div>
      </div>`
    }

    return ''
  }

  const bubbleHTML = bubbles.map(glassBubbleHTML).join('\n')

  return `<!DOCTYPE html>
<html>
<head>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { margin: 0; padding: 0; background: ${IG_BG}; -webkit-font-smoothing: antialiased; }

  @keyframes bubblePop {
    0% { opacity: 0; transform: scale(0) rotate(-5deg); }
    40% { opacity: 1; transform: scale(1.12) rotate(1deg); }
    60% { transform: scale(0.95) rotate(-0.5deg); }
    80% { transform: scale(1.03) rotate(0deg); }
    100% { opacity: 1; transform: scale(1) rotate(0deg); }
  }

  @keyframes bubbleFloat {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    33% { transform: translateY(-8px) rotate(0.5deg); }
    66% { transform: translateY(4px) rotate(-0.3deg); }
  }

  @keyframes bubbleShrinkOut {
    0% { opacity: 1; transform: scale(1); }
    100% { opacity: 0; transform: scale(0) rotate(10deg); }
  }

  @keyframes fadeIn {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }

  @keyframes slideUp {
    0% { opacity: 0; transform: translateY(40px); }
    100% { opacity: 1; transform: translateY(0); }
  }

  @keyframes scaleIn {
    0% { opacity: 0; transform: scale(0.85); }
    100% { opacity: 1; transform: scale(1); }
  }

  @keyframes pulseGlow {
    0%, 100% { box-shadow: 0 0 0 0 rgba(232,68,58,0.5), 0 4px 20px rgba(232,68,58,0.3), inset 0 1px 0 rgba(255,255,255,0.2); }
    50% { box-shadow: 0 0 0 16px rgba(232,68,58,0), 0 4px 20px rgba(232,68,58,0.3), inset 0 1px 0 rgba(255,255,255,0.2); }
  }

  @keyframes glowPulse {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 0.6; }
  }

  @keyframes shimmerSlide {
    0% { transform: translateX(-100%) rotate(25deg); }
    100% { transform: translateX(200%) rotate(25deg); }
  }

  .page {
    width: ${WIDTH}px;
    height: ${HEIGHT}px;
    position: relative;
    overflow: hidden;
    background: ${IG_BG};
    font-family: ${SF};
  }

  /* Ambient color blobs behind everything */
  .ambient-layer {
    position: absolute;
    inset: 0;
    z-index: 1;
    overflow: hidden;
  }

  .ambient-blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(120px);
    opacity: 0;
    will-change: transform;
  }

  .bubble-layer {
    position: absolute;
    inset: 0;
    z-index: 5;
  }

  .bubble-pop {
    will-change: transform, opacity;
  }

</style>
</head>
<body>
  <div class="page">

    <!-- Ambient color blobs -->
    <div class="ambient-layer">
      <div class="ambient-blob" id="amb1" style="
        width:600px;height:600px;left:-100px;top:100px;
        background:radial-gradient(circle, rgba(232,68,58,0.25) 0%, transparent 70%);
      "></div>
      <div class="ambient-blob" id="amb2" style="
        width:500px;height:500px;right:-80px;top:500px;
        background:radial-gradient(circle, rgba(232,68,58,0.15) 0%, transparent 70%);
      "></div>
      <div class="ambient-blob" id="amb3" style="
        width:700px;height:700px;left:200px;top:900px;
        background:radial-gradient(circle, rgba(180,60,50,0.12) 0%, transparent 70%);
      "></div>
    </div>

    <!-- Bubble layer -->
    <div class="bubble-layer" id="bubbleLayer">
      ${bubbleHTML}
    </div>


  </div>

  <script>
    // ======= Ambient blobs fade in =======
    setTimeout(() => {
      document.getElementById('amb1').style.transition = 'opacity 2s ease-out'
      document.getElementById('amb1').style.opacity = '1'
    }, 100)
    setTimeout(() => {
      document.getElementById('amb2').style.transition = 'opacity 2s ease-out'
      document.getElementById('amb2').style.opacity = '0.8'
    }, 500)
    setTimeout(() => {
      document.getElementById('amb3').style.transition = 'opacity 2s ease-out'
      document.getElementById('amb3').style.opacity = '0.6'
    }, 800)

    // Animate ambient blobs slowly
    function animateBlob(id, dx, dy, dur) {
      const el = document.getElementById(id)
      if (!el) return
      let t = 0
      const animate = () => {
        t += 0.005
        el.style.transform = 'translate(' + (Math.sin(t) * dx) + 'px,' + (Math.cos(t * 0.7) * dy) + 'px)'
        requestAnimationFrame(animate)
      }
      animate()
    }
    animateBlob('amb1', 40, 30, 8)
    animateBlob('amb2', -30, 40, 10)
    animateBlob('amb3', 35, -25, 12)

    // ======= Bubbles popping in =======
    const allBubbles = document.querySelectorAll('.bubble-pop')

    allBubbles.forEach(bubble => {
      const delay = parseFloat(bubble.dataset.delay) * 1000

      setTimeout(() => {
        bubble.style.animation = 'bubblePop 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
      }, delay)

      // Gentle float after pop
      setTimeout(() => {
        const floatDur = 4 + Math.random() * 3
        bubble.style.animation = 'bubbleFloat ' + floatDur + 's ease-in-out infinite'
        bubble.style.opacity = '1'
      }, delay + 800)
    })


  </script>
</body>
</html>`
}

async function render() {
  resetOutputDir()

  const allPhotos = [...PHOTOS, ...EXTRA_PHOTOS]
  const imageDataMap = {}
  for (const photo of allPhotos) {
    imageDataMap[photo] = readImage(photo)
  }

  writeSources({
    createdAt: new Date().toISOString(),
    strategy: 'v75 — glass/liquid bubble popping, heavy Manila emphasis, iOS glass aesthetic',
    safeBottomPixels: SAFE_BOTTOM,
    photos: allPhotos,
  })

  const { execSync } = await import('child_process')
  const browser = await chromium.launch()

  console.log('Recording glass bubble pop Manila animation...')

  const videoCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: OUT_DIR,
      size: { width: WIDTH, height: HEIGHT },
    },
  })

  const videoPage = await videoCtx.newPage()

  await videoPage.evaluate(() => {
    document.documentElement.style.background = '#0a0a0a'
    document.body.style.background = '#0a0a0a'
  })

  const html = buildHTML(imageDataMap)
  await videoPage.setContent(html, { waitUntil: 'load' })
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
  const finalMp4 = path.join(OUT_DIR, '01_bubble_pop_manila.mp4')

  try {
    execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${finalMp4}"`, { stdio: 'pipe' })
    fs.unlinkSync(srcVideo)
    console.log('Rendered 01_bubble_pop_manila.mp4')
  } catch (err) {
    console.error('ffmpeg error:', err.message)
    fs.renameSync(srcVideo, finalMp4)
  }

  console.log(`Done: output written to ${OUT_DIR}`)
}

render().catch(error => {
  console.error(error)
  process.exit(1)
})
