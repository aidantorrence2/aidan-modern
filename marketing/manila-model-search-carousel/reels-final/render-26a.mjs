import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, "output-26a")

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 430
const SAFE_TOP = 213
const SAFE_LEFT = 66
const SAFE_RIGHT = 1027
const MANILA_COLOR = '#E8443A'

const MONO = "'SF Mono', 'Fira Code', 'Courier New', monospace"
const BOLD = "'Avenir Next', 'Helvetica Neue', Arial, sans-serif"
const BODY = "'Avenir Next', 'Helvetica Neue', Arial, sans-serif"
const NARROW = "Futura, 'Arial Narrow', sans-serif"

const TOTAL_DURATION_MS = 19000 // 18s animation + 1s buffer

function resetOutputDir() {
  fs.rmSync(OUT_DIR, { recursive: true, force: true })
  fs.mkdirSync(OUT_DIR, { recursive: true })
}

function imageMime(name) {
  const ext = path.extname(name).toLowerCase()
  if (ext === '.png') return 'image/png'
  if (ext === '.webp') return 'image/webp'
  return 'image/jpeg'
}

function readImage(name) {
  const filePath = path.join(IMAGE_DIR, name)
  const buf = fs.readFileSync(filePath)
  return `data:${imageMime(name)};base64,${buf.toString('base64')}`
}

function writeSources(selected) {
  const payload = {
    createdAt: new Date().toISOString(),
    strategy: 'v26a — typewriter text reveal with 4-scene structure',
    safeBottomPixels: SAFE_BOTTOM,
    images: selected
  }
  fs.writeFileSync(path.join(OUT_DIR, 'sources.json'), JSON.stringify(payload, null, 2))
}

// Justified gallery layout helpers
function justifiedRows(imageList, containerWidth, gap, targetH) {
  const rows = []
  let currentRow = []
  for (const img of imageList) {
    currentRow.push(img)
    const totalAspect = currentRow.reduce((s, i) => s + i.aspect, 0)
    const totalGaps = (currentRow.length - 1) * gap
    const rowHeight = (containerWidth - totalGaps) / totalAspect
    if (rowHeight <= targetH && currentRow.length >= 2) {
      rows.push({ images: [...currentRow], height: Math.round(rowHeight) })
      currentRow = []
    }
  }
  if (currentRow.length > 0) {
    const totalAspect = currentRow.reduce((s, i) => s + i.aspect, 0)
    const totalGaps = (currentRow.length - 1) * gap
    const rowHeight = (containerWidth - totalGaps) / totalAspect
    rows.push({ images: [...currentRow], height: Math.round(Math.min(targetH, rowHeight)) })
  }
  return rows
}

function totalLayoutHeight(rows, gap) {
  return rows.reduce((s, r) => s + r.height, 0) + (rows.length - 1) * gap
}

function fitJustifiedLayout(imageList, containerWidth, availableHeight, gap) {
  let lo = 100, hi = 800
  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2
    const rows = justifiedRows(imageList, containerWidth, gap, mid)
    const h = totalLayoutHeight(rows, gap)
    if (h < availableHeight) lo = mid
    else hi = mid
  }
  return justifiedRows(imageList, containerWidth, gap, (lo + hi) / 2)
}

function buildContinuousHtml(images) {
  // Timeline:
  // 0–4s     Scene 1 (hook) — typewriter headline
  // 4–4.5s   Crossfade to scene 2
  // 4.5–9s   Scene 2 (proof) — tiles + typewriter caption
  // 9–9.5s   Crossfade to scene 3
  // 9.5–14s  Scene 3 (steps) — steps type in one by one
  // 14–14.5s Crossfade to scene 4
  // 14.5–18s Scene 4 (CTA) — typewriter CTA

  // Build proof mosaic
  const HEADER_END = SAFE_TOP + 192
  const BOTTOM_LIMIT = HEIGHT - SAFE_BOTTOM - 16
  const PAD = 28
  const GAP = 8
  const CONTAINER_W = WIDTH - PAD * 2
  const AVAILABLE_H = BOTTOM_LIMIT - HEADER_END

  const mosaicImages = [
    { src: images.gridA, aspect: 1059 / 1600 },
    { src: images.gridB, aspect: 957 / 1510 },
    { src: images.gridC, aspect: 1600 / 1061 },
    { src: images.gridD, aspect: 1080 / 1080 },
    { src: images.gridE, aspect: 968 / 1508 },
    { src: images.gridF, aspect: 1600 / 1072 },
    { src: images.gridG, aspect: 1228 / 1818 },
    { src: images.gridH, aspect: 1228 / 1818 },
    { src: images.gridI, aspect: 1067 / 1600 },
    { src: images.gridJ, aspect: 1600 / 1061 },
  ]

  const rows = fitJustifiedLayout(mosaicImages, CONTAINER_W, AVAILABLE_H, GAP)

  let tilesHtml = ''
  let y = HEADER_END
  let imgIndex = 0
  for (const row of rows) {
    const totalGaps = (row.images.length - 1) * GAP
    const widths = row.images.map(img => Math.round(row.height * img.aspect))
    const usedWidth = widths.reduce((s, w) => s + w, 0) + totalGaps
    widths[widths.length - 1] += (CONTAINER_W - usedWidth)

    let x = PAD
    for (let i = 0; i < row.images.length; i++) {
      const w = widths[i]
      const delay = imgIndex * 0.15
      tilesHtml += `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${row.height}px;border-radius:14px;overflow:hidden;opacity:0;transform:scale(0.85);animation:tileReveal 0.55s ease-out ${delay}s forwards;">
        <img src="${row.images[i].src}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center;"/>
      </div>`
      x += w + GAP
      imgIndex++
    }
    y += row.height + GAP
  }

  return `<!DOCTYPE html>
<html>
  <head>
    <style>
      * { box-sizing: border-box; }
      html, body { margin: 0; padding: 0; background: #000; }

      @keyframes imgFade {
        0% { opacity: 0; }
        100% { opacity: 1; }
      }
      @keyframes slideDown {
        0% { opacity: 0; transform: translateY(-24px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      @keyframes tileReveal {
        0% { opacity: 0; transform: scale(0.85); }
        100% { opacity: 1; transform: scale(1); }
      }
      @keyframes stepReveal {
        0% { opacity: 0; transform: translateX(-20px); }
        100% { opacity: 1; transform: translateX(0); }
      }

      /* Blinking cursor */
      @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
      }

      .cursor {
        display: inline-block;
        width: 4px;
        background: ${MANILA_COLOR};
        animation: blink 0.6s step-end infinite;
        margin-left: 4px;
        vertical-align: baseline;
      }

      /* Typewriter containers — text starts empty, JS fills char by char */
      .tw-text {
        display: inline;
      }

      /* Scene visibility timeline */
      @keyframes scene1Vis {
        0%     { opacity: 1; }
        21%    { opacity: 1; }
        23%    { opacity: 0; }
        100%   { opacity: 0; }
      }
      @keyframes scene2Vis {
        0%     { opacity: 0; }
        21%    { opacity: 0; }
        23%    { opacity: 1; }
        49%    { opacity: 1; }
        51%    { opacity: 0; }
        100%   { opacity: 0; }
      }
      @keyframes scene3Vis {
        0%     { opacity: 0; }
        49%    { opacity: 0; }
        51%    { opacity: 1; }
        76%    { opacity: 1; }
        78%    { opacity: 0; }
        100%   { opacity: 0; }
      }
      @keyframes scene4Vis {
        0%     { opacity: 0; }
        76%    { opacity: 0; }
        78%    { opacity: 1; }
        100%   { opacity: 1; }
      }

      #scene-hook  { animation: scene1Vis 18s linear forwards; }
      #scene-proof { animation: scene2Vis 18s linear forwards; }
      #scene-steps { animation: scene3Vis 18s linear forwards; }
      #scene-cta   { animation: scene4Vis 18s linear forwards; }
    </style>
  </head>
  <body>
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#000;">

      <!-- SCENE 4: CTA -->
      <div id="scene-cta" style="position:absolute;inset:0;width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden;background:#000;">
        <img src="${images.cta}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 60%;"/>
        <div style="position:absolute;left:0;right:0;top:0;height:820px;background:linear-gradient(180deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.65) 55%, rgba(0,0,0,0) 100%);"></div>
        <div style="position:absolute;left:0;right:0;bottom:0;height:${SAFE_BOTTOM + 120}px;background:linear-gradient(0deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 100%);"></div>
        <div style="position:absolute;left:${SAFE_LEFT}px;top:${SAFE_TOP}px;right:${WIDTH - SAFE_RIGHT}px;">
          <p style="font-family:${NARROW};font-size:72px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:${MANILA_COLOR};margin:0 0 18px;opacity:0;" id="cta-manila">Manila</p>
          <h2 style="font-family:${MONO};font-size:86px;font-weight:800;line-height:0.95;color:#fff;margin:0 0 36px;letter-spacing:-0.02em;">
            <span class="tw-text" id="tw-cta-head"></span><span class="cursor" id="cursor-cta-head" style="height:86px;display:none;"></span>
          </h2>
          <p style="font-family:${MONO};font-size:40px;font-weight:600;line-height:1.38;color:rgba(255,255,255,0.95);margin:0 0 50px;">
            <span class="tw-text" id="tw-cta-handle"></span><span class="cursor" id="cursor-cta-handle" style="height:40px;display:none;"></span>
          </p>
        </div>
        <div style="position:absolute;left:${SAFE_LEFT}px;top:${SAFE_TOP + 420}px;display:inline-flex;align-items:center;gap:16px;padding:22px 36px;border-radius:20px;background:${MANILA_COLOR};box-shadow:0 8px 32px rgba(232,68,58,0.4);opacity:0;" id="cta-btn">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <span style="font-family:${BOLD};font-size:34px;font-weight:700;color:#fff;letter-spacing:0.02em;">Send me a message</span>
        </div>
        <div style="position:absolute;left:${SAFE_LEFT}px;top:${SAFE_TOP + 530}px;opacity:0;" id="cta-limited">
          <p style="font-family:${MONO};font-size:28px;font-weight:500;color:rgba(255,255,255,0.5);margin:0;">
            <span class="tw-text" id="tw-cta-limited"></span><span class="cursor" id="cursor-cta-limited" style="height:28px;display:none;"></span>
          </p>
        </div>
      </div>

      <!-- SCENE 3: HOW IT WORKS -->
      <div id="scene-steps" style="position:absolute;inset:0;width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden;background:#0a0a0a;">
        <div style="position:absolute;right:0;top:0;width:480px;height:100%;overflow:hidden;">
          <img src="${images.process}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center;"/>
          <div style="position:absolute;inset:0;background:linear-gradient(90deg, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.15) 30%, rgba(10,10,10,0) 50%);"></div>
          <div style="position:absolute;left:0;right:0;bottom:0;height:${SAFE_BOTTOM + 60}px;background:linear-gradient(0deg, rgba(10,10,10,0.6) 0%, rgba(10,10,10,0) 100%);"></div>
        </div>
        <div style="position:absolute;left:${SAFE_LEFT}px;top:${SAFE_TOP}px;width:540px;">
          <p style="font-family:${NARROW};font-size:72px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:${MANILA_COLOR};margin:0 0 12px;opacity:0;" id="steps-manila">Manila</p>
          <h2 style="font-family:${MONO};font-size:72px;font-weight:800;line-height:0.94;color:#fff;margin:0 0 14px;letter-spacing:-0.02em;">
            <span class="tw-text" id="tw-steps-head"></span><span class="cursor" id="cursor-steps-head" style="height:72px;display:none;"></span>
          </h2>
          <p style="font-family:${MONO};font-size:34px;font-weight:500;color:rgba(255,255,255,0.6);margin:0;">
            <span class="tw-text" id="tw-steps-sub"></span><span class="cursor" id="cursor-steps-sub" style="height:34px;display:none;"></span>
          </p>
        </div>
        <div style="position:absolute;left:${SAFE_LEFT}px;top:${SAFE_TOP + 220}px;width:540px;display:flex;flex-direction:column;gap:22px;">
          <div style="padding:30px 34px;border-radius:22px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.1);opacity:0;" id="step-1">
            <p style="font-family:${NARROW};font-size:26px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:${MANILA_COLOR};margin:0 0 12px;">Step 1</p>
            <p style="font-family:${MONO};font-size:38px;font-weight:700;color:#fff;margin:0 0 10px;line-height:1.1;">
              <span class="tw-text" id="tw-step1-title"></span><span class="cursor" id="cursor-step1-title" style="height:38px;display:none;"></span>
            </p>
            <p style="font-family:${MONO};font-size:28px;color:rgba(255,255,255,0.7);margin:0;line-height:1.3;">
              <span class="tw-text" id="tw-step1-desc"></span><span class="cursor" id="cursor-step1-desc" style="height:28px;display:none;"></span>
            </p>
          </div>
          <div style="padding:30px 34px;border-radius:22px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.1);opacity:0;" id="step-2">
            <p style="font-family:${NARROW};font-size:26px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:${MANILA_COLOR};margin:0 0 12px;">Step 2</p>
            <p style="font-family:${MONO};font-size:38px;font-weight:700;color:#fff;margin:0 0 10px;line-height:1.1;">
              <span class="tw-text" id="tw-step2-title"></span><span class="cursor" id="cursor-step2-title" style="height:38px;display:none;"></span>
            </p>
            <p style="font-family:${MONO};font-size:28px;color:rgba(255,255,255,0.7);margin:0;line-height:1.3;">
              <span class="tw-text" id="tw-step2-desc"></span><span class="cursor" id="cursor-step2-desc" style="height:28px;display:none;"></span>
            </p>
          </div>
          <div style="padding:30px 34px;border-radius:22px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.1);opacity:0;" id="step-3">
            <p style="font-family:${NARROW};font-size:26px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:${MANILA_COLOR};margin:0 0 12px;">Step 3</p>
            <p style="font-family:${MONO};font-size:38px;font-weight:700;color:#fff;margin:0 0 10px;line-height:1.1;">
              <span class="tw-text" id="tw-step3-title"></span><span class="cursor" id="cursor-step3-title" style="height:38px;display:none;"></span>
            </p>
            <p style="font-family:${MONO};font-size:28px;color:rgba(255,255,255,0.7);margin:0;line-height:1.3;">
              <span class="tw-text" id="tw-step3-desc"></span><span class="cursor" id="cursor-step3-desc" style="height:28px;display:none;"></span>
            </p>
          </div>
        </div>
      </div>

      <!-- SCENE 2: PROOF MOSAIC -->
      <div id="scene-proof" style="position:absolute;inset:0;width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden;background:#0a0a0a;">
        <div style="position:absolute;left:${SAFE_LEFT}px;top:${SAFE_TOP}px;right:${WIDTH - SAFE_RIGHT}px;">
          <p style="font-family:${NARROW};font-size:72px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:${MANILA_COLOR};margin:0 0 12px;opacity:0;" id="proof-manila">Manila</p>
          <h2 style="font-family:${MONO};font-size:68px;font-weight:800;line-height:0.94;color:#fff;margin:0;letter-spacing:-0.02em;">
            <span class="tw-text" id="tw-proof-head"></span><span class="cursor" id="cursor-proof-head" style="height:68px;display:none;"></span>
          </h2>
        </div>
        ${tilesHtml}
      </div>

      <!-- SCENE 1: HOOK -->
      <div id="scene-hook" style="position:absolute;inset:0;width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden;background:#000;">
        <img src="${images.hero}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 20%;opacity:0;animation:imgFade 1s ease-out 0.2s forwards;"/>
        <div style="position:absolute;left:0;right:0;top:0;height:900px;background:linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0) 100%);"></div>
        <div style="position:absolute;left:0;right:0;bottom:0;height:${SAFE_BOTTOM + 120}px;background:linear-gradient(0deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 100%);"></div>
        <div style="position:absolute;left:${SAFE_LEFT}px;top:${SAFE_TOP}px;right:${WIDTH - SAFE_RIGHT}px;">
          <p style="font-family:${NARROW};font-size:72px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:${MANILA_COLOR};margin:0 0 18px;opacity:0;" id="hook-manila">Manila</p>
          <h1 style="font-family:${MONO};font-size:108px;font-weight:800;line-height:0.92;color:#fff;margin:0 0 32px;letter-spacing:-0.03em;">
            <span class="tw-text" id="tw-hook-head"></span><span class="cursor" id="cursor-hook-head" style="height:108px;display:none;"></span>
          </h1>
          <p style="font-family:${MONO};font-size:38px;font-weight:500;line-height:1.32;color:rgba(255,255,255,0.92);margin:0;">
            <span class="tw-text" id="tw-hook-sub"></span><span class="cursor" id="cursor-hook-sub" style="height:38px;display:none;"></span>
          </p>
        </div>
      </div>

    </div>

    <script>
      // Typewriter engine
      function typewrite(elementId, cursorId, text, startMs, charMs) {
        charMs = charMs || 45
        const el = document.getElementById(elementId)
        const cursor = document.getElementById(cursorId)
        if (!el) return

        // Show cursor at start
        setTimeout(() => {
          if (cursor) cursor.style.display = 'inline-block'
        }, startMs)

        const chars = [...text]
        chars.forEach((char, i) => {
          setTimeout(() => {
            // Use innerHTML to support line breaks
            if (char === '\\n') {
              el.innerHTML += '<br/>'
            } else {
              el.innerHTML += char === ' ' ? '&nbsp;' : char
            }
          }, startMs + i * charMs)
        })

        // Hide cursor shortly after done
        setTimeout(() => {
          if (cursor) cursor.style.display = 'none'
        }, startMs + chars.length * charMs + 400)
      }

      function fadeIn(elementId, startMs, durationMs) {
        durationMs = durationMs || 300
        setTimeout(() => {
          const el = document.getElementById(elementId)
          if (el) {
            el.style.transition = 'opacity ' + durationMs + 'ms ease-out'
            el.style.opacity = '1'
          }
        }, startMs)
      }

      // ═══ SCENE 1: HOOK (0–4s) ═══
      fadeIn('hook-manila', 400)
      typewrite('tw-hook-head', 'cursor-hook-head', 'Models\\nwanted.', 600, 55)
      // "Models\\nwanted." = 14 chars × 55ms = 770ms, done ~1370ms
      typewrite('tw-hook-sub', 'cursor-hook-sub', 'Editorial portrait shoots.\\nNo experience needed.', 1800, 35)
      // 48 chars × 35ms = 1680ms, done ~3480ms

      // ═══ SCENE 2: PROOF (4–9s) ═══
      // Scene 2 becomes visible at ~4s (23% of 18s ≈ 4.14s)
      fadeIn('proof-manila', 4200)
      typewrite('tw-proof-head', 'cursor-proof-head', 'This is my work.', 4400, 50)
      // 16 chars × 50ms = 800ms, done ~5200ms
      // Tiles animate via CSS with staggered delays from scene start

      // ═══ SCENE 3: STEPS (9–14s) ═══
      // Scene 3 becomes visible at ~9s (51% of 18s ≈ 9.18s)
      fadeIn('steps-manila', 9300)
      typewrite('tw-steps-head', 'cursor-steps-head', '3 steps.', 9500, 60)
      typewrite('tw-steps-sub', 'cursor-steps-sub', "That's it.", 10200, 50)

      // Step 1 card
      fadeIn('step-1', 10800, 400)
      typewrite('tw-step1-title', 'cursor-step1-title', 'DM me on Instagram', 10900, 40)
      typewrite('tw-step1-desc', 'cursor-step1-desc', "Just say hey!", 11700, 40)

      // Step 2 card
      fadeIn('step-2', 12100, 400)
      typewrite('tw-step2-title', 'cursor-step2-title', 'We pick a date', 12200, 40)
      typewrite('tw-step2-desc', 'cursor-step2-desc', 'Location, vibe, look.', 12900, 40)

      // Step 3 card
      fadeIn('step-3', 13200, 400)
      typewrite('tw-step3-title', 'cursor-step3-title', 'Show up. I guide you.', 13300, 40)
      typewrite('tw-step3-desc', 'cursor-step3-desc', 'No posing experience needed.', 14100, 35)

      // ═══ SCENE 4: CTA (14–18s) ═══
      // Scene 4 becomes visible at ~14s (78% of 18s ≈ 14.04s)
      fadeIn('cta-manila', 14200)
      typewrite('tw-cta-head', 'cursor-cta-head', 'dm me if\\ninterested!!', 14400, 50)
      // 21 chars × 50ms = 1050ms, done ~15450ms
      typewrite('tw-cta-handle', 'cursor-cta-handle', '@madebyaidan on Instagram', 15600, 40)
      // 25 chars × 40ms = 1000ms, done ~16600ms
      fadeIn('cta-btn', 16200, 500)
      fadeIn('cta-limited', 16800, 400)
      typewrite('tw-cta-limited', 'cursor-cta-limited', '> limited spots this month_', 17000, 35)
    </script>
  </body>
</html>`
}

async function render() {
  resetOutputDir()

  const selection = {
    hero: 'manila-gallery-canal-001.jpg',
    gridA: 'manila-gallery-closeup-001.jpg',
    gridB: 'manila-gallery-dsc-0911.jpg',
    gridC: 'manila-gallery-garden-002.jpg',
    gridD: 'manila-gallery-night-003.jpg',
    gridE: 'manila-gallery-dsc-0130.jpg',
    gridF: 'manila-gallery-canal-002.jpg',
    gridG: 'manila-gallery-urban-001.jpg',
    gridH: 'manila-gallery-urban-002.jpg',
    gridI: 'manila-gallery-shadow-001.jpg',
    gridJ: 'manila-gallery-ivy-001.jpg',
    process: 'manila-gallery-dsc-0190.jpg',
    cta: 'manila-gallery-floor-001.jpg'
  }

  writeSources({ selected: selection })

  console.log('Loading images...')
  const images = Object.fromEntries(
    Object.entries(selection).map(([key, file]) => [key, readImage(file)])
  )

  const browser = await chromium.launch()

  console.log('Recording typewriter version...')

  const videoCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: OUT_DIR,
      size: { width: WIDTH, height: HEIGHT }
    }
  })

  const videoPage = await videoCtx.newPage()

  await videoPage.evaluate(() => {
    document.documentElement.style.background = '#000'
    document.body.style.background = '#000'
  })

  const html = buildContinuousHtml(images)
  await videoPage.setContent(html, { waitUntil: 'load' })

  await videoPage.waitForTimeout(500)
  await videoPage.waitForTimeout(TOTAL_DURATION_MS)

  await videoPage.close()
  await videoCtx.close()

  const videoFiles = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.webm'))
  if (videoFiles.length === 0) {
    console.error('No video file was generated!')
  } else {
    const srcVideo = path.join(OUT_DIR, videoFiles[0])
    const dstVideo = path.join(OUT_DIR, 'manila-typewriter-v26a.mp4')

    const { execSync } = await import('child_process')
    try {
      execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${dstVideo}"`, {
        stdio: 'pipe'
      })
      fs.unlinkSync(srcVideo)
      console.log('Rendered manila-typewriter-v26a.mp4')
    } catch (err) {
      console.warn('ffmpeg not available, keeping as webm and renaming to mp4...')
      fs.renameSync(srcVideo, dstVideo)
      console.log('Rendered manila-typewriter-v26a.mp4 (webm container)')
    }
  }

  await browser.close()
  console.log(`Done: typewriter video written to ${OUT_DIR}`)
}

render().catch(error => {
  console.error(error)
  process.exit(1)
})
