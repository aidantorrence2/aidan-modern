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

const SF = "-apple-system, 'Helvetica Neue', Arial, sans-serif"
const MANILA_COLOR = '#E8443A'
const IG_BG = '#000'

const TOTAL_DURATION_MS = 26000

const PHOTOS = [
  'manila-gallery-purple-001-cropped.jpg',
  'manila-gallery-purple-002-cropped.jpg',
  'manila-gallery-purple-003-cropped.jpg',
  'manila-gallery-purple-004-cropped.jpg',
  'manila-gallery-purple-005-cropped.jpg',
  'manila-gallery-purple-006-cropped.jpg',
]

// Use a variety of clean photos too
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
  // Bubble configs: each bubble pops in at a specific time with a size, position, and content
  const bubbles = [
    // Phase 1: MANILA text pops huge (0.3s)
    { id: 'b-manila', type: 'text', text: 'MANILA', x: 540, y: 500, size: 500, delay: 0.3, fontSize: 140, fontWeight: 900, color: '#fff', bg: MANILA_COLOR, letterSpacing: 12 },

    // Phase 2: Photo bubbles pop in around it (1-3s)
    { id: 'b-photo1', type: 'photo', src: PHOTOS[0], x: 180, y: 320, size: 320, delay: 1.0 },
    { id: 'b-photo2', type: 'photo', src: PHOTOS[1], x: 820, y: 260, size: 280, delay: 1.4 },
    { id: 'b-photo3', type: 'photo', src: PHOTOS[2], x: 260, y: 780, size: 260, delay: 1.8 },
    { id: 'b-photo4', type: 'photo', src: PHOTOS[3], x: 780, y: 700, size: 300, delay: 2.2 },
    { id: 'b-photo5', type: 'photo', src: PHOTOS[4], x: 540, y: 950, size: 240, delay: 2.6 },

    // Phase 3: Text bubbles with Manila details (3.5-6s)
    { id: 'b-free', type: 'text', text: 'FREE', x: 200, y: 1100, size: 200, delay: 3.5, fontSize: 64, fontWeight: 800, color: '#fff', bg: '#1ED760' },
    { id: 'b-loc', type: 'text', text: '📍 BGC\nMakati\nManila', x: 850, y: 1050, size: 240, delay: 4.0, fontSize: 40, fontWeight: 700, color: '#fff', bg: '#333', lineHeight: 1.5 },
    { id: 'b-pro', type: 'text', text: 'Professional\nPhotographer', x: 500, y: 1250, size: 280, delay: 4.5, fontSize: 42, fontWeight: 700, color: '#000', bg: '#fff' },
    { id: 'b-dir', type: 'text', text: 'Directed\nPhoto Shoot', x: 180, y: 1380, size: 220, delay: 5.0, fontSize: 38, fontWeight: 700, color: '#fff', bg: MANILA_COLOR },

    // Phase 4: More photos pop (6-8s)
    { id: 'b-photo6', type: 'photo', src: PHOTOS[5], x: 750, y: 1350, size: 260, delay: 6.0 },
    { id: 'b-photo7', type: 'photo', src: EXTRA_PHOTOS[0], x: 350, y: 200, size: 200, delay: 6.5 },
    { id: 'b-photo8', type: 'photo', src: EXTRA_PHOTOS[1], x: 900, y: 500, size: 220, delay: 7.0 },
  ]

  const bubbleHTML = bubbles.map(b => {
    const left = b.x - b.size / 2
    const top = b.y - b.size / 2
    const common = `position:absolute;left:${left}px;top:${top}px;width:${b.size}px;height:${b.size}px;border-radius:50%;overflow:hidden;opacity:0;z-index:${b.type === 'text' && b.id === 'b-manila' ? 10 : 5};`

    if (b.type === 'photo') {
      return `<div class="bubble-pop" id="${b.id}" data-delay="${b.delay}" style="${common}border:4px solid rgba(255,255,255,0.15);box-shadow:0 8px 32px rgba(0,0,0,0.5);">
        <img src="${imageDataMap[b.src]}" style="width:100%;height:100%;object-fit:cover;" />
      </div>`
    } else {
      const fs = b.fontSize || 48
      const fw = b.fontWeight || 700
      const lh = b.lineHeight || 1.2
      const ls = b.letterSpacing ? `letter-spacing:${b.letterSpacing}px;` : ''
      return `<div class="bubble-pop" id="${b.id}" data-delay="${b.delay}" style="${common}background:${b.bg || '#333'};display:flex;align-items:center;justify-content:center;text-align:center;box-shadow:0 8px 32px rgba(0,0,0,0.5);">
        <span style="font-family:${SF};font-size:${fs}px;font-weight:${fw};color:${b.color || '#fff'};line-height:${lh};${ls}white-space:pre-line;padding:20px;">${b.text}</span>
      </div>`
    }
  }).join('\n')

  return `<!DOCTYPE html>
<html>
<head>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { margin: 0; padding: 0; background: ${IG_BG}; -webkit-font-smoothing: antialiased; }

  @keyframes bubblePop {
    0% { opacity: 0; transform: scale(0); }
    50% { opacity: 1; transform: scale(1.15); }
    70% { transform: scale(0.92); }
    85% { transform: scale(1.05); }
    100% { opacity: 1; transform: scale(1); }
  }

  @keyframes bubbleFloat {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-12px); }
  }

  @keyframes bubbleShrinkOut {
    0% { opacity: 1; transform: scale(1); }
    100% { opacity: 0; transform: scale(0); }
  }

  @keyframes fadeIn {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }

  @keyframes slideUp {
    0% { opacity: 0; transform: translateY(50px); }
    100% { opacity: 1; transform: translateY(0); }
  }

  @keyframes scaleIn {
    0% { opacity: 0; transform: scale(0.8); }
    100% { opacity: 1; transform: scale(1); }
  }

  @keyframes pulseGlow {
    0%, 100% { box-shadow: 0 0 0 0 rgba(232, 68, 58, 0.5); }
    50% { box-shadow: 0 0 0 20px rgba(232, 68, 58, 0); }
  }

  @keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }

  @keyframes manilaGlow {
    0%, 100% { text-shadow: 0 0 20px rgba(232, 68, 58, 0.3); }
    50% { text-shadow: 0 0 60px rgba(232, 68, 58, 0.8), 0 0 120px rgba(232, 68, 58, 0.3); }
  }

  .page {
    width: ${WIDTH}px;
    height: ${HEIGHT}px;
    position: relative;
    overflow: hidden;
    background: ${IG_BG};
    font-family: ${SF};
  }

  /* Subtle grid pattern background */
  .page::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 20% 30%, rgba(232, 68, 58, 0.06) 0%, transparent 50%),
      radial-gradient(circle at 80% 60%, rgba(232, 68, 58, 0.04) 0%, transparent 40%),
      radial-gradient(circle at 50% 80%, rgba(232, 68, 58, 0.05) 0%, transparent 45%);
    z-index: 1;
  }

  .bubble-layer {
    position: absolute;
    inset: 0;
    z-index: 5;
  }

  .bubble-pop {
    will-change: transform, opacity;
  }

  /* ===== PHASE 5: CLEAR → BIG MANILA + CTA ===== */
  .cta-phase {
    position: absolute;
    inset: 0;
    z-index: 50;
    background: ${IG_BG};
    opacity: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-bottom: ${SAFE_BOTTOM}px;
  }

  .cta-manila-big {
    font-size: 160px;
    font-weight: 900;
    color: #fff;
    letter-spacing: 16px;
    text-align: center;
    opacity: 0;
    margin-bottom: 10px;
    animation: manilaGlow 3s ease-in-out infinite;
  }

  .cta-philippines {
    font-size: 36px;
    font-weight: 500;
    color: rgba(255,255,255,0.5);
    letter-spacing: 20px;
    text-align: center;
    text-transform: uppercase;
    opacity: 0;
    margin-bottom: 60px;
  }

  .cta-photo-strip {
    display: flex;
    gap: 10px;
    margin-bottom: 50px;
    opacity: 0;
  }

  .cta-photo-strip img {
    width: 140px;
    height: 180px;
    object-fit: cover;
    border-radius: 16px;
    border: 2px solid rgba(255,255,255,0.1);
  }

  .cta-handle {
    font-size: 52px;
    font-weight: 800;
    color: ${MANILA_COLOR};
    text-align: center;
    opacity: 0;
    margin-bottom: 16px;
  }

  .cta-subtext {
    font-size: 36px;
    color: #aaa;
    text-align: center;
    opacity: 0;
    margin-bottom: 40px;
  }

  .cta-button {
    background: ${MANILA_COLOR};
    color: #fff;
    font-size: 36px;
    font-weight: 700;
    padding: 22px 56px;
    border-radius: 50px;
    opacity: 0;
    letter-spacing: 0.5px;
  }

  /* Floating particles */
  .particle {
    position: absolute;
    border-radius: 50%;
    opacity: 0;
    z-index: 2;
  }
</style>
</head>
<body>
  <div class="page">

    <!-- Subtle floating particles -->
    ${Array.from({length: 12}, (_, i) => {
      const x = Math.random() * WIDTH
      const y = Math.random() * (HEIGHT - SAFE_BOTTOM)
      const s = 4 + Math.random() * 8
      const d = 0.5 + Math.random() * 3
      const dur = 3 + Math.random() * 4
      return `<div class="particle" id="p${i}" style="left:${x}px;top:${y}px;width:${s}px;height:${s}px;background:${MANILA_COLOR};animation:fadeIn 1s ${d}s ease-out forwards, bubbleFloat ${dur}s ${d}s ease-in-out infinite;"></div>`
    }).join('\n    ')}

    <!-- Bubble layer -->
    <div class="bubble-layer" id="bubbleLayer">
      ${bubbleHTML}
    </div>

    <!-- CTA phase -->
    <div class="cta-phase" id="ctaPhase">
      <div class="cta-manila-big" id="ctaManila">MANILA</div>
      <div class="cta-philippines" id="ctaPhilippines">PHILIPPINES</div>
      <div class="cta-photo-strip" id="ctaStrip">
        ${PHOTOS.slice(0, 4).map(p => `<img src="${imageDataMap[p]}" />`).join('')}
      </div>
      <div class="cta-handle" id="ctaHandle">@madebyaidan</div>
      <div class="cta-subtext" id="ctaSub">free photo shoots in Manila</div>
      <div class="cta-button" id="ctaBtn">DM on Instagram</div>
    </div>

  </div>

  <script>
    // ======= Phase 1-4: Bubbles popping in =======
    const allBubbles = document.querySelectorAll('.bubble-pop')

    allBubbles.forEach(bubble => {
      const delay = parseFloat(bubble.dataset.delay) * 1000

      setTimeout(() => {
        bubble.style.animation = 'bubblePop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
      }, delay)

      // Add gentle floating after pop
      setTimeout(() => {
        const floatDur = 3 + Math.random() * 2
        const floatDelay = Math.random() * 1
        bubble.style.animation = 'bubbleFloat ' + floatDur + 's ' + floatDelay + 's ease-in-out infinite'
        bubble.style.opacity = '1'
      }, delay + 700)
    })

    // ======= Phase 5: All bubbles shrink out, CTA appears (10s) =======
    const CLEAR_TIME = 10000
    const CTA_TIME = 11000

    setTimeout(() => {
      allBubbles.forEach((bubble, i) => {
        setTimeout(() => {
          bubble.style.animation = 'bubbleShrinkOut 0.4s ease-in forwards'
        }, i * 60)
      })
    }, CLEAR_TIME)

    // CTA phase fades in
    setTimeout(() => {
      const cta = document.getElementById('ctaPhase')
      cta.style.transition = 'opacity 0.8s ease-out'
      cta.style.opacity = '1'
    }, CTA_TIME)

    // MANILA text
    setTimeout(() => {
      document.getElementById('ctaManila').style.animation = 'scaleIn 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
    }, CTA_TIME + 300)

    // PHILIPPINES
    setTimeout(() => {
      document.getElementById('ctaPhilippines').style.animation = 'fadeIn 0.5s ease-out forwards'
    }, CTA_TIME + 800)

    // Photo strip
    setTimeout(() => {
      document.getElementById('ctaStrip').style.animation = 'scaleIn 0.6s ease-out forwards'
    }, CTA_TIME + 1200)

    // Handle
    setTimeout(() => {
      document.getElementById('ctaHandle').style.animation = 'slideUp 0.5s ease-out forwards'
    }, CTA_TIME + 1800)

    // Subtext
    setTimeout(() => {
      document.getElementById('ctaSub').style.animation = 'slideUp 0.5s ease-out forwards'
    }, CTA_TIME + 2200)

    // Button
    setTimeout(() => {
      const btn = document.getElementById('ctaBtn')
      btn.style.animation = 'scaleIn 0.5s ease-out forwards'
      setTimeout(() => {
        btn.style.animation = 'pulseGlow 1.5s ease-in-out infinite'
        btn.style.opacity = '1'
      }, 600)
    }, CTA_TIME + 2700)

    // === PHASE 6: Second wave of bubbles behind CTA with Manila facts (16s) ===
    // Small detail bubbles pop behind the CTA for visual texture
    const phase6Time = 16000
    const factBubbles = [
      { text: '🇵🇭', x: 120, y: 200, size: 100 },
      { text: '☀️', x: 950, y: 180, size: 90 },
      { text: '📸', x: 180, y: 1000, size: 80 },
      { text: '✨', x: 880, y: 900, size: 70 },
      { text: 'BGC', x: 100, y: 600, size: 110 },
      { text: 'Makati', x: 920, y: 550, size: 130 },
    ]

    factBubbles.forEach((fb, i) => {
      setTimeout(() => {
        const el = document.createElement('div')
        el.style.cssText = 'position:absolute;left:' + (fb.x - fb.size/2) + 'px;top:' + (fb.y - fb.size/2) + 'px;width:' + fb.size + 'px;height:' + fb.size + 'px;border-radius:50%;background:rgba(232,68,58,0.15);border:1px solid rgba(232,68,58,0.3);display:flex;align-items:center;justify-content:center;font-size:' + (fb.size * 0.4) + 'px;color:#fff;font-weight:700;z-index:45;opacity:0;animation:bubblePop 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards;font-family:' + SF + ';'
        el.textContent = fb.text
        document.querySelector('.page').appendChild(el)

        // Float after pop
        setTimeout(() => {
          el.style.animation = 'bubbleFloat ' + (3 + Math.random() * 2) + 's ease-in-out infinite'
          el.style.opacity = '1'
        }, 600)
      }, phase6Time + i * 300)
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
    strategy: 'v75 — bubble popping concept, heavy Manila emphasis',
    safeBottomPixels: SAFE_BOTTOM,
    photos: allPhotos,
  })

  const { execSync } = await import('child_process')
  const browser = await chromium.launch()

  console.log('Recording bubble pop Manila animation...')

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
    document.documentElement.style.background = '#000'
    document.body.style.background = '#000'
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
