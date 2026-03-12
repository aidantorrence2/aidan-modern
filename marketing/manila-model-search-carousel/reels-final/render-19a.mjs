import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, "output-19a")

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 430
const SAFE_TOP = 213
const SAFE_LEFT = 66
const SAFE_RIGHT = 1027
const USABLE_H = HEIGHT - SAFE_BOTTOM

const SF = "-apple-system, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif"
const MANILA_COLOR = '#E8443A'
const IG_BG = '#0a0a0a'

const TOTAL_DURATION_MS = 24000

// Phase 1 photos
const PHOTOS_P1 = [
  'manila-gallery-purple-001-cropped.jpg',
  'manila-gallery-purple-002-cropped.jpg',
  'manila-gallery-purple-003-cropped.jpg',
  'manila-gallery-purple-004-cropped.jpg',
  'manila-gallery-purple-005-cropped.jpg',
  'manila-gallery-purple-006-cropped.jpg',
  'manila-gallery-dsc-0190.jpg',
  'manila-gallery-dsc-0075.jpg',
]

// Phase 2 photos (different set)
const PHOTOS_P2 = [
  'manila-gallery-canal-001.jpg',
  'manila-gallery-garden-001.jpg',
  'manila-gallery-urban-001.jpg',
  'manila-gallery-night-001.jpg',
  'manila-gallery-ivy-001.jpg',
  'manila-gallery-dsc-0911.jpg',
  'manila-gallery-garden-002.jpg',
  'manila-gallery-park-001.jpg',
]

// Phase 3 photos (different set)
const PHOTOS_P3 = [
  'manila-gallery-canal-002.jpg',
  'manila-gallery-night-002.jpg',
  'manila-gallery-market-001.jpg',
  'manila-gallery-tropical-001.jpg',
  'manila-gallery-rocks-001.jpg',
  'manila-gallery-shadow-001.jpg',
  'manila-gallery-urban-002.jpg',
  'manila-gallery-ivy-002.jpg',
]

const ALL_PHOTOS = [...new Set([...PHOTOS_P1, ...PHOTOS_P2, ...PHOTOS_P3])]

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
  /*
   * NARRATIVE FLOW:
   * Phase 1 (0-6s):   "FREE PHOTO SHOOT IN MANILA" — big glass title + location pills float in
   * Phase 2 (6-14s):  Photo proof — glass photo bubbles continuously float around
   * Phase 3 (14-18s): How it works — glass pills explain the process
   * Phase 4 (18-24s): CTA — DM @madebyaidan
   *
   * Photo bubbles float the ENTIRE time as background texture.
   * Text/pill content fades in/out per phase.
   */

  // 8 photo bubbles that float continuously
  const photoBubbles = [
    { id: 'pb0', src: PHOTOS_P1[0], cx: 180, cy: 300,  r: 200, vx: 0.4, vy: 0.3 },
    { id: 'pb1', src: PHOTOS_P1[1], cx: 860, cy: 220,  r: 180, vx: -0.3, vy: 0.4 },
    { id: 'pb2', src: PHOTOS_P1[2], cx: 300, cy: 700,  r: 190, vx: 0.35, vy: -0.25 },
    { id: 'pb3', src: PHOTOS_P1[3], cx: 780, cy: 620,  r: 210, vx: -0.4, vy: 0.3 },
    { id: 'pb4', src: PHOTOS_P1[4], cx: 500, cy: 1000, r: 170, vx: 0.3, vy: -0.35 },
    { id: 'pb5', src: PHOTOS_P1[5], cx: 200, cy: 1150, r: 160, vx: 0.45, vy: 0.2 },
    { id: 'pb6', src: PHOTOS_P1[6], cx: 820, cy: 950, r: 150, vx: -0.35, vy: -0.3 },
    { id: 'pb7', src: PHOTOS_P1[7], cx: 540, cy: 450, r: 140, vx: 0.25, vy: 0.4 },
  ]

  const photoBubblesHTML = photoBubbles.map(pb => `
    <div class="photo-bubble" id="${pb.id}" style="
      position:absolute;
      left:${pb.cx - pb.r}px;top:${pb.cy - pb.r}px;
      width:${pb.r * 2}px;height:${pb.r * 2}px;
      border-radius:50%;overflow:hidden;
      box-shadow:
        0 8px 40px rgba(0,0,0,0.5),
        inset 0 -4px 16px rgba(0,0,0,0.3),
        inset 0 4px 16px rgba(255,255,255,0.15),
        0 0 0 2px rgba(255,255,255,0.06);
      z-index:3;
    ">
      <img src="${imageDataMap[pb.src]}" style="width:100%;height:100%;object-fit:cover;opacity:0.7;" />
      <!-- Glass refraction overlay — gradient highlight like a soap bubble -->
      <div style="position:absolute;inset:0;border-radius:50%;background:
        radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.35) 0%, transparent 45%),
        radial-gradient(ellipse at 70% 80%, rgba(0,0,0,0.2) 0%, transparent 50%),
        linear-gradient(160deg, rgba(255,255,255,0.12) 0%, transparent 40%, rgba(0,0,0,0.15) 100%);
        pointer-events:none;"></div>
      <!-- Inner edge highlight ring -->
      <div style="position:absolute;inset:4px;border-radius:50%;border:1.5px solid rgba(255,255,255,0.15);pointer-events:none;"></div>
      <!-- Specular spot -->
      <div style="position:absolute;top:12%;left:22%;width:25%;height:18%;border-radius:50%;background:radial-gradient(ellipse, rgba(255,255,255,0.4) 0%, transparent 70%);pointer-events:none;transform:rotate(-20deg);"></div>
    </div>
  `).join('')

  // Glass pill helper
  function glassPill(id, text, opts = {}) {
    const { accent, fontSize = 36, w = 'auto', extraStyle = '' } = opts
    const bg = accent
      ? 'linear-gradient(135deg, rgba(232,68,58,0.55) 0%, rgba(232,68,58,0.3) 100%)'
      : 'linear-gradient(135deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.4) 100%)'
    const border = accent ? 'rgba(232,68,58,0.5)' : 'rgba(255,255,255,0.15)'
    const shadow = accent
      ? '0 4px 24px rgba(232,68,58,0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
      : '0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.12)'
    const fw = accent ? 800 : 600
    const widthStyle = w === 'auto' ? 'padding:18px 44px;' : `width:${w}px;`

    return `<div class="phase-el" id="${id}" style="
      display:inline-flex;align-items:center;justify-content:center;
      ${widthStyle}height:auto;padding-top:18px;padding-bottom:18px;
      border-radius:60px;opacity:0;
      background:${bg};
      backdrop-filter:blur(30px) saturate(160%);
      -webkit-backdrop-filter:blur(30px) saturate(160%);
      border:1px solid ${border};
      box-shadow:${shadow};
      ${extraStyle}
    ">
      <span style="font-family:${SF};font-size:${fontSize}px;font-weight:${fw};color:#fff;letter-spacing:${accent ? 2 : 0.5}px;text-shadow:0 1px 4px rgba(0,0,0,0.3);white-space:nowrap;">${text}</span>
    </div>`
  }

  return `<!DOCTYPE html>
<html>
<head>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { margin: 0; padding: 0; background: ${IG_BG}; -webkit-font-smoothing: antialiased; }

  @keyframes bubblePop {
    0% { opacity: 0; transform: scale(0); }
    50% { opacity: 1; transform: scale(1.1); }
    70% { transform: scale(0.95); }
    100% { opacity: 1; transform: scale(1); }
  }

  @keyframes fadeIn { 0% { opacity:0; } 100% { opacity:1; } }
  @keyframes fadeOut { 0% { opacity:1; } 100% { opacity:0; } }

  @keyframes scaleIn {
    0% { opacity: 0; transform: scale(0.7); }
    100% { opacity: 1; transform: scale(1); }
  }

  @keyframes slideUp {
    0% { opacity: 0; transform: translateY(40px); }
    100% { opacity: 1; transform: translateY(0); }
  }

  @keyframes pulseGlow {
    0%, 100% { box-shadow: 0 0 0 0 rgba(232,68,58,0.5), 0 4px 20px rgba(232,68,58,0.3), inset 0 1px 0 rgba(255,255,255,0.2); }
    50% { box-shadow: 0 0 0 16px rgba(232,68,58,0), 0 4px 20px rgba(232,68,58,0.3), inset 0 1px 0 rgba(255,255,255,0.2); }
  }

  .page {
    width: ${WIDTH}px;
    height: ${HEIGHT}px;
    position: relative;
    overflow: hidden;
    background: ${IG_BG};
    font-family: ${SF};
  }

  .ambient-layer {
    position: absolute; inset: 0; z-index: 1; overflow: hidden;
  }

  .ambient-blob {
    position: absolute; border-radius: 50%; filter: blur(120px); will-change: transform;
  }

  .photo-bubble {
    will-change: transform;
    transition: opacity 0.8s ease-out;
  }

  /* Phase content layers */
  .phase-layer {
    position: absolute;
    left: ${SAFE_LEFT}px; right: ${WIDTH - SAFE_RIGHT}px; top: ${SAFE_TOP}px;
    height: ${USABLE_H - SAFE_TOP}px;
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.6s ease-out;
  }

  .phase-el {
    transition: opacity 0.5s ease-out, transform 0.5s ease-out;
  }
</style>
</head>
<body>
  <div class="page">

    <!-- Ambient blobs -->
    <div class="ambient-layer">
      <div class="ambient-blob" id="amb1" style="width:600px;height:600px;left:-100px;top:100px;background:radial-gradient(circle, rgba(232,68,58,0.25) 0%, transparent 70%);opacity:0.8;"></div>
      <div class="ambient-blob" id="amb2" style="width:500px;height:500px;right:-80px;top:500px;background:radial-gradient(circle, rgba(232,68,58,0.15) 0%, transparent 70%);opacity:0.6;"></div>
      <div class="ambient-blob" id="amb3" style="width:700px;height:700px;left:200px;top:800px;background:radial-gradient(circle, rgba(180,60,50,0.12) 0%, transparent 70%);opacity:0.5;"></div>
    </div>

    <!-- Floating photo bubbles (always present) -->
    ${photoBubblesHTML}

    <!-- PHASE 1: Free photo shoot in Manila -->
    <div class="phase-layer" id="phase1">
      <div class="phase-el" id="p1-title" style="
        padding:24px 60px;border-radius:120px;
        background:linear-gradient(135deg, rgba(232,68,58,0.4) 0%, rgba(232,68,58,0.15) 100%);
        backdrop-filter:blur(40px) saturate(180%);-webkit-backdrop-filter:blur(40px) saturate(180%);
        border:1px solid rgba(255,255,255,0.18);
        box-shadow:0 8px 32px rgba(232,68,58,0.3), inset 0 1px 0 rgba(255,255,255,0.25);
        opacity:0;
      ">
        <span style="font-size:100px;font-weight:900;color:#fff;letter-spacing:16px;text-shadow:0 2px 12px rgba(0,0,0,0.3);">MANILA</span>
      </div>

      ${glassPill('p1-free', 'FREE PHOTO SHOOT', { accent: true, fontSize: 48 })}
      ${glassPill('p1-loc', '📍 BGC · Makati · Philippines', { fontSize: 36 })}
    </div>

    <!-- PHASE 2: Photo proof (bubbles grow bigger) -->
    <div class="phase-layer" id="phase2" style="justify-content:flex-start;padding-top:20px;">
      ${glassPill('p2-title', 'here are some of my photos', { fontSize: 44 })}
    </div>

    <!-- PHASE 3: How it works -->
    <div class="phase-layer" id="phase3" style="gap:24px;">
      <div class="phase-el" id="p3-title" style="
        padding:20px 56px;border-radius:80px;
        background:linear-gradient(135deg, rgba(232,68,58,0.4) 0%, rgba(232,68,58,0.15) 100%);
        backdrop-filter:blur(40px) saturate(180%);-webkit-backdrop-filter:blur(40px) saturate(180%);
        border:1px solid rgba(255,255,255,0.18);
        box-shadow:0 8px 32px rgba(232,68,58,0.3), inset 0 1px 0 rgba(255,255,255,0.25);
        opacity:0;
      ">
        <span style="font-size:52px;font-weight:800;color:#fff;letter-spacing:3px;">how it works</span>
      </div>
      ${glassPill('p3-step1', '1. DM me on Instagram', { fontSize: 38 })}
      ${glassPill('p3-step2', '2. show up to the shoot', { fontSize: 38 })}
      ${glassPill('p3-step3', '3. I direct everything — poses, angles, all of it', { fontSize: 32 })}
      ${glassPill('p3-step4', '4. get your photos ✨', { fontSize: 38 })}
      <div style="height:10px;"></div>
      ${glassPill('p3-exp', 'no modeling experience needed', { accent: true, fontSize: 34 })}
    </div>

    <!-- PHASE 4: CTA -->
    <div class="phase-layer" id="phase4" style="gap:28px;">
      <div class="phase-el" id="p4-handle" style="
        padding:24px 56px;border-radius:100px;
        background:linear-gradient(135deg, rgba(232,68,58,0.45) 0%, rgba(232,68,58,0.2) 100%);
        backdrop-filter:blur(40px) saturate(180%);-webkit-backdrop-filter:blur(40px) saturate(180%);
        border:1px solid rgba(232,68,58,0.5);
        box-shadow:0 8px 32px rgba(232,68,58,0.35), inset 0 1px 0 rgba(255,255,255,0.25);
        opacity:0;
      ">
        <span style="font-size:64px;font-weight:900;color:#fff;letter-spacing:2px;">@madebyaidan</span>
      </div>
      ${glassPill('p4-sub', 'on Instagram', { fontSize: 36 })}
      <div style="height:10px;"></div>
      ${glassPill('p4-dm', 'DM me to book your free shoot', { accent: true, fontSize: 38 })}
      ${glassPill('p4-manila', '📍 Manila, Philippines', { fontSize: 34 })}
    </div>

  </div>

  <script>
    // ======= Ambient blob drift =======
    function animateBlob(id, dx, dy) {
      const el = document.getElementById(id)
      if (!el) return
      let t = Math.random() * 100
      const animate = () => {
        t += 0.003
        el.style.transform = 'translate(' + (Math.sin(t) * dx) + 'px,' + (Math.cos(t * 0.7) * dy) + 'px)'
        requestAnimationFrame(animate)
      }
      animate()
    }
    animateBlob('amb1', 50, 40)
    animateBlob('amb2', -40, 50)
    animateBlob('amb3', 45, -35)

    // ======= Photo data for swapping between phases =======
    const phase2Srcs = [
      ${PHOTOS_P2.map(p => `'${imageDataMap[p]}'`).join(',\n      ')}
    ]
    const phase3Srcs = [
      ${PHOTOS_P3.map(p => `'${imageDataMap[p]}'`).join(',\n      ')}
    ]

    function swapPhotos(srcs) {
      bubbleState.forEach((b, i) => {
        const img = b.el.querySelector('img')
        if (img && srcs[i]) {
          b.el.style.transition = 'opacity 0.4s ease-out'
          b.el.style.opacity = '0.3'
          setTimeout(() => {
            img.src = srcs[i]
            b.el.style.opacity = '1'
          }, 400)
        }
      })
    }

    // ======= Photo bubble physics — continuous float =======
    const bubbleData = ${JSON.stringify(photoBubbles.map(pb => ({
      id: pb.id, cx: pb.cx, cy: pb.cy, r: pb.r, vx: pb.vx, vy: pb.vy
    })))}

    const bubbleState = bubbleData.map(b => ({
      el: document.getElementById(b.id),
      x: b.cx, y: b.cy, r: b.r,
      vx: b.vx * (0.8 + Math.random() * 0.4),
      vy: b.vy * (0.8 + Math.random() * 0.4),
      baseScale: 1,
    }))

    // Bubbles visible immediately (no black space at start)
    bubbleState.forEach((b) => {
      b.el.style.opacity = '1'
    })

    // Physics loop
    const PADDING = 20
    const MAX_Y = ${USABLE_H}

    function physicsTick() {
      bubbleState.forEach(b => {
        b.x += b.vx
        b.y += b.vy

        // Bounce off edges
        if (b.x - b.r < PADDING) { b.x = b.r + PADDING; b.vx *= -1 }
        if (b.x + b.r > ${WIDTH} - PADDING) { b.x = ${WIDTH} - b.r - PADDING; b.vx *= -1 }
        if (b.y - b.r < PADDING) { b.y = b.r + PADDING; b.vy *= -1 }
        if (b.y + b.r > MAX_Y - PADDING) { b.y = MAX_Y - b.r - PADDING; b.vy *= -1 }

        // Simple bubble-bubble collision
        bubbleState.forEach(other => {
          if (other === b) return
          const dx = other.x - b.x
          const dy = other.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          const minDist = b.r + other.r + 10
          if (dist < minDist && dist > 0) {
            const nx = dx / dist
            const ny = dy / dist
            const overlap = (minDist - dist) / 2
            b.x -= nx * overlap
            b.y -= ny * overlap
            other.x += nx * overlap
            other.y += ny * overlap
            // Swap velocities along collision normal
            const dvx = b.vx - other.vx
            const dvy = b.vy - other.vy
            const dot = dvx * nx + dvy * ny
            b.vx -= dot * nx * 0.5
            b.vy -= dot * ny * 0.5
            other.vx += dot * nx * 0.5
            other.vy += dot * ny * 0.5
          }
        })

        b.el.style.left = (b.x - b.r) + 'px'
        b.el.style.top = (b.y - b.r) + 'px'
      })

      requestAnimationFrame(physicsTick)
    }

    // Start physics immediately
    physicsTick()

    // ======= Phase transitions =======
    function showPhase(id) {
      document.getElementById(id).style.opacity = '1'
      // Animate children in staggered
      const els = document.getElementById(id).querySelectorAll('.phase-el')
      els.forEach((el, i) => {
        setTimeout(() => {
          el.style.animation = 'scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
        }, i * 200)
      })
    }

    function hidePhase(id) {
      const phase = document.getElementById(id)
      const els = phase.querySelectorAll('.phase-el')
      els.forEach((el, i) => {
        setTimeout(() => {
          el.style.animation = 'fadeOut 0.4s ease-out forwards'
        }, i * 80)
      })
      setTimeout(() => { phase.style.opacity = '0' }, els.length * 80 + 400)
    }

    // Phase 2: make photo bubbles bigger
    function growBubbles() {
      bubbleState.forEach(b => {
        b.r = b.r * 1.25
        b.el.style.width = (b.r * 2) + 'px'
        b.el.style.height = (b.r * 2) + 'px'
        b.el.style.transition = 'width 0.8s ease-out, height 0.8s ease-out'
      })
    }

    function shrinkBubbles() {
      bubbleState.forEach(b => {
        b.r = b.r / 1.25
        b.el.style.width = (b.r * 2) + 'px'
        b.el.style.height = (b.r * 2) + 'px'
        b.el.style.transition = 'width 0.8s ease-out, height 0.8s ease-out'
      })
    }

    // PHASE 1: Free photo shoot in Manila (0-6s) — show immediately
    showPhase('phase1')

    // PHASE 2: Photo proof (6-14s)
    setTimeout(() => hidePhase('phase1'), 5500)
    setTimeout(() => {
      swapPhotos(phase2Srcs)
      growBubbles()
      showPhase('phase2')
    }, 6500)

    // PHASE 3: How it works (14-18s)
    setTimeout(() => hidePhase('phase2'), 13000)
    setTimeout(() => {
      swapPhotos(phase3Srcs)
      shrinkBubbles()
      showPhase('phase3')
    }, 14000)

    // PHASE 4: CTA (18-24s)
    setTimeout(() => hidePhase('phase3'), 17500)
    setTimeout(() => showPhase('phase4'), 18500)

    // Pulse the DM button at the end
    setTimeout(() => {
      const dm = document.getElementById('p4-dm')
      if (dm) {
        dm.style.animation = 'pulseGlow 1.5s ease-in-out infinite'
        dm.style.opacity = '1'
      }
    }, 20000)

  </script>
</body>
</html>`
}

async function render() {
  resetOutputDir()

  const imageDataMap = {}
  for (const photo of ALL_PHOTOS) {
    imageDataMap[photo] = readImage(photo)
  }

  writeSources({
    createdAt: new Date().toISOString(),
    strategy: 'v75 — glass floating bubbles with narrative: Manila free shoot → proof → how it works → DM CTA',
    safeBottomPixels: SAFE_BOTTOM,
    photos: ALL_PHOTOS,
  })

  const { execSync } = await import('child_process')
  const browser = await chromium.launch()

  console.log('Recording glass floating bubbles Manila animation...')

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
