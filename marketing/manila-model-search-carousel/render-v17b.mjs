import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v17b')

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 620
const MANILA_COLOR = '#E8443A'

const BOLD = "'Avenir Next', 'Helvetica Neue', Arial, sans-serif"
const BODY = "'Avenir Next', 'Helvetica Neue', Arial, sans-serif"
const NARROW = "Futura, 'Arial Narrow', sans-serif"

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
    strategy: 'v17b — single continuous animated MP4, message-based CTA, no sign-up language',
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

// ─── SCENE 1: HOOK (0–3s) ───
// Full-bleed hero image with bold headline, fades in
function sceneHookHtml(images) {
  return `
    <div id="scene-hook" style="position:absolute;inset:0;width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden;background:#000;">
      <img src="${images.hero}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 20%;opacity:0;animation:imgFade 1s ease-out 0.2s forwards;"/>
      <div style="position:absolute;left:0;right:0;top:0;height:900px;background:linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0) 100%);"></div>
      <div style="position:absolute;left:0;right:0;bottom:0;height:${SAFE_BOTTOM + 120}px;background:linear-gradient(0deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 100%);"></div>
      <div style="position:absolute;left:54px;top:80px;width:756px;opacity:0;animation:slideDown 0.7s ease-out 0.3s forwards;">
        <p style="font-family:${NARROW};font-size:72px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:${MANILA_COLOR};margin:0 0 18px;">Manila</p>
        <h1 style="font-family:${BOLD};font-size:120px;font-weight:800;line-height:0.90;color:#fff;margin:0 0 32px;letter-spacing:-0.02em;">Models<br/>wanted.</h1>
        <p style="font-family:${BODY};font-size:42px;font-weight:500;line-height:1.32;color:rgba(255,255,255,0.92);margin:0;">Editorial portrait shoots.<br/>No experience needed.</p>
      </div>
    </div>
  `
}

// ─── SCENE 2: PROOF MOSAIC (3–7s) ───
// Animated tile reveal of portfolio work
function sceneProofHtml(images) {
  const HEADER_END = 260
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
      const delay = imgIndex * 0.25
      tilesHtml += `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${row.height}px;border-radius:14px;overflow:hidden;opacity:0;transform:scale(0.85);animation:tileReveal 0.55s ease-out ${delay}s forwards;">
        <img src="${row.images[i].src}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center;"/>
      </div>`
      x += w + GAP
      imgIndex++
    }
    y += row.height + GAP
  }

  return `
    <div id="scene-proof" style="position:absolute;inset:0;width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden;background:#0a0a0a;">
      <div style="position:absolute;left:54px;top:68px;width:756px;opacity:0;animation:slideDown 0.5s ease-out 0s forwards;">
        <p style="font-family:${NARROW};font-size:72px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:${MANILA_COLOR};margin:0 0 12px;">Manila</p>
        <h2 style="font-family:${BOLD};font-size:72px;font-weight:800;line-height:0.94;color:#fff;margin:0;letter-spacing:-0.02em;">This is my work.</h2>
      </div>
      ${tilesHtml}
    </div>
  `
}

// ─── SCENE 3: HOW IT WORKS (7–11s) ───
// 3 steps with DM-based flow
function sceneStepsHtml(images) {
  return `
    <div id="scene-steps" style="position:absolute;inset:0;width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden;background:#0a0a0a;">
      <div style="position:absolute;right:0;top:0;width:480px;height:100%;overflow:hidden;">
        <img src="${images.process}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center;"/>
        <div style="position:absolute;inset:0;background:linear-gradient(90deg, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.15) 30%, rgba(10,10,10,0) 50%);"></div>
        <div style="position:absolute;left:0;right:0;bottom:0;height:${SAFE_BOTTOM + 60}px;background:linear-gradient(0deg, rgba(10,10,10,0.6) 0%, rgba(10,10,10,0) 100%);"></div>
      </div>
      <div style="position:absolute;left:54px;top:68px;width:540px;opacity:0;animation:slideDown 0.5s ease-out 0s forwards;">
        <p style="font-family:${NARROW};font-size:72px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:${MANILA_COLOR};margin:0 0 12px;">Manila</p>
        <h2 style="font-family:${BOLD};font-size:80px;font-weight:800;line-height:0.94;color:#fff;margin:0 0 14px;letter-spacing:-0.02em;">3 steps.</h2>
        <p style="font-family:${BODY};font-size:36px;font-weight:500;color:rgba(255,255,255,0.6);margin:0;">That's it.</p>
      </div>
      <div style="position:absolute;left:54px;top:380px;width:540px;display:flex;flex-direction:column;gap:22px;">
        <div style="padding:30px 34px;border-radius:22px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.1);opacity:0;animation:stepReveal 0.5s ease-out 0.3s forwards;">
          <p style="font-family:${NARROW};font-size:26px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:${MANILA_COLOR};margin:0 0 12px;">Step 1</p>
          <p style="font-family:${BOLD};font-size:42px;font-weight:700;color:#fff;margin:0 0 10px;line-height:1.1;">DM me on Instagram</p>
          <p style="font-family:${BODY};font-size:30px;color:rgba(255,255,255,0.7);margin:0;line-height:1.3;">Just say hey! I'll message you back.</p>
        </div>
        <div style="padding:30px 34px;border-radius:22px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.1);opacity:0;animation:stepReveal 0.5s ease-out 0.6s forwards;">
          <p style="font-family:${NARROW};font-size:26px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:${MANILA_COLOR};margin:0 0 12px;">Step 2</p>
          <p style="font-family:${BOLD};font-size:42px;font-weight:700;color:#fff;margin:0 0 10px;line-height:1.1;">We pick a date</p>
          <p style="font-family:${BODY};font-size:30px;color:rgba(255,255,255,0.7);margin:0;line-height:1.3;">Location, vibe, and look — planned together.</p>
        </div>
        <div style="padding:30px 34px;border-radius:22px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.1);opacity:0;animation:stepReveal 0.5s ease-out 0.9s forwards;">
          <p style="font-family:${NARROW};font-size:26px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:${MANILA_COLOR};margin:0 0 12px;">Step 3</p>
          <p style="font-family:${BOLD};font-size:42px;font-weight:700;color:#fff;margin:0 0 10px;line-height:1.1;">Show up. I guide you.</p>
          <p style="font-family:${BODY};font-size:30px;color:rgba(255,255,255,0.7);margin:0;line-height:1.3;">No posing experience needed.</p>
        </div>
      </div>
    </div>
  `
}

// ─── SCENE 4: CTA (11–15s) ───
// Full-bleed photo with DM CTA
function sceneCtaHtml(images) {
  return `
    <div id="scene-cta" style="position:absolute;inset:0;width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden;background:#000;">
      <img src="${images.cta}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 60%;"/>
      <div style="position:absolute;left:0;right:0;top:0;height:820px;background:linear-gradient(180deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.65) 55%, rgba(0,0,0,0) 100%);"></div>
      <div style="position:absolute;left:0;right:0;bottom:0;height:${SAFE_BOTTOM + 120}px;background:linear-gradient(0deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 100%);"></div>
      <div style="position:absolute;left:54px;top:80px;width:756px;">
        <p style="font-family:${NARROW};font-size:72px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:${MANILA_COLOR};margin:0 0 18px;">Manila</p>
        <h2 style="font-family:${BOLD};font-size:100px;font-weight:800;line-height:0.92;color:#fff;margin:0 0 36px;letter-spacing:-0.02em;">dm me if<br/>interested!!</h2>
        <p style="font-family:${BODY};font-size:42px;font-weight:600;line-height:1.38;color:rgba(255,255,255,0.95);margin:0 0 50px;">@madebyaidan on Instagram</p>
      </div>
      <div style="position:absolute;left:54px;top:600px;display:inline-flex;align-items:center;gap:16px;padding:22px 36px;border-radius:20px;background:${MANILA_COLOR};box-shadow:0 8px 32px rgba(232,68,58,0.4);">
        <!-- DM icon (chat bubble) -->
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        <span style="font-family:${BOLD};font-size:34px;font-weight:700;color:#fff;letter-spacing:0.02em;">Send me a message</span>
      </div>
      <div style="position:absolute;left:54px;top:710px;">
        <p style="font-family:${BODY};font-size:30px;font-weight:500;color:rgba(255,255,255,0.65);margin:0;">Limited spots this month</p>
      </div>
    </div>
  `
}

// Build the full continuous animation HTML
function buildContinuousHtml(images) {
  // Timeline:
  // 0–3.5s   Scene 1 (hook) — fade in, hold
  // 3.5–4s   Crossfade to scene 2
  // 4–8s     Scene 2 (proof) — tiles animate in
  // 8–8.5s   Crossfade to scene 3
  // 8.5–12s  Scene 3 (steps) — steps animate in
  // 12–12.5s Crossfade to scene 4
  // 12.5–16s Scene 4 (CTA) — hold

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

      /* Scene visibility timeline using keyframes */
      @keyframes scene1Vis {
        0%     { opacity: 1; }
        20%    { opacity: 1; }  /* 3.5s / 16s = ~22% */
        25%    { opacity: 0; }
        100%   { opacity: 0; }
      }
      @keyframes scene2Vis {
        0%     { opacity: 0; }
        22%    { opacity: 0; }
        25%    { opacity: 1; }
        48%    { opacity: 1; }  /* ~8s */
        53%    { opacity: 0; }
        100%   { opacity: 0; }
      }
      @keyframes scene3Vis {
        0%     { opacity: 0; }
        50%    { opacity: 0; }
        53%    { opacity: 1; }
        73%    { opacity: 1; }  /* ~12s */
        78%    { opacity: 0; }
        100%   { opacity: 0; }
      }
      @keyframes scene4Vis {
        0%     { opacity: 0; }
        75%    { opacity: 0; }
        78%    { opacity: 1; }
        100%   { opacity: 1; }
      }

      #scene-hook  { animation: scene1Vis 16s linear forwards; }
      #scene-proof { animation: scene2Vis 16s linear forwards; }
      #scene-steps { animation: scene3Vis 16s linear forwards; }
      #scene-cta   { animation: scene4Vis 16s linear forwards; }
    </style>
  </head>
  <body>
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#000;">
      ${sceneCtaHtml(images)}
      ${sceneStepsHtml(images)}
      ${sceneProofHtml(images)}
      ${sceneHookHtml(images)}
    </div>
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

  // --- Record single continuous animated MP4 ---
  console.log('Recording continuous animated video...')

  const TOTAL_DURATION_MS = 17000 // 16s animation + 1s buffer

  const videoCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: OUT_DIR,
      size: { width: WIDTH, height: HEIGHT }
    }
  })

  const videoPage = await videoCtx.newPage()

  // Prevent white flash: set background to black before loading content
  await videoPage.evaluate(() => {
    document.documentElement.style.background = '#000'
    document.body.style.background = '#000'
  })

  const html = buildContinuousHtml(images)
  await videoPage.setContent(html, { waitUntil: 'load' })

  // Wait for images to load
  await videoPage.waitForTimeout(500)

  // Wait for full animation
  await videoPage.waitForTimeout(TOTAL_DURATION_MS)

  // Finalize video
  await videoPage.close()
  await videoCtx.close()

  // Find and convert webm to mp4
  const videoFiles = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.webm'))
  if (videoFiles.length === 0) {
    console.error('No video file was generated!')
  } else {
    const srcVideo = path.join(OUT_DIR, videoFiles[0])
    const dstVideo = path.join(OUT_DIR, 'manila-model-search-v17b.mp4')

    const { execSync } = await import('child_process')
    try {
      execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${dstVideo}"`, {
        stdio: 'pipe'
      })
      fs.unlinkSync(srcVideo)
      console.log('Rendered manila-model-search-v17b.mp4')
    } catch (err) {
      console.warn('ffmpeg not available, keeping as webm and renaming to mp4...')
      fs.renameSync(srcVideo, dstVideo)
      console.log('Rendered manila-model-search-v17b.mp4 (webm container)')
    }
  }

  await browser.close()
  console.log(`Done: single continuous MP4 written to ${OUT_DIR}`)
}

render().catch(error => {
  console.error(error)
  process.exit(1)
})
