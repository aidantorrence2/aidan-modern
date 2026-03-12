import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v54')

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 410

const SF = "-apple-system, 'Helvetica Neue', Arial, sans-serif"
const MONO = "'Courier New', Courier, monospace"
const MANILA_COLOR = '#E8443A'
const HANDLE = 'madebyaidan'

const TOTAL_DURATION = 20
const ANIM_DURATION_MS = 22000 // extra buffer for recording

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

function writeSources(payload) {
  fs.writeFileSync(path.join(OUT_DIR, 'sources.json'), JSON.stringify(payload, null, 2))
}

const p = (t) => ((t / TOTAL_DURATION) * 100).toFixed(2)

/**
 * Purple photos have film borders — crop 130% / -15%
 */
function isPurple(name) {
  return name.includes('purple')
}

function imgStyle(name, pos = 'center 20%') {
  if (isPurple(name)) {
    return `width:130%;height:130%;object-fit:cover;object-position:${pos};display:block;margin:-15% 0 0 -15%;`
  }
  return `width:100%;height:100%;object-fit:cover;object-position:${pos};display:block;`
}

/* ------------------------------------------------------------------ */
/*  Build the viewfinder animation HTML                               */
/* ------------------------------------------------------------------ */
function buildViewfinder(images, imageNames) {
  // 5 photos, each ~2.5s. Timeline:
  //  Photo 1: 0.0-2.0 visible, 2.0-2.15 flash, 2.15-2.5 shrink to strip
  //  Photo 2: 2.5-4.5, flash 4.5-4.65, shrink 4.65-5.0
  //  Photo 3: 5.0-7.0, flash 7.0-7.15, shrink 7.15-7.5
  //  Photo 4: 7.5-9.5, flash 9.5-9.65, shrink 9.65-10.0
  //  Photo 5: 10.0-12.0, flash 12.0-12.15, shrink 12.15-12.5
  //  CTA phase: 12.5+ viewfinder UI fades, CTA text over last photo

  const photos = [images.photo1, images.photo2, images.photo3, images.photo4, images.photo5]
  const photoNames = [imageNames.photo1, imageNames.photo2, imageNames.photo3, imageNames.photo4, imageNames.photo5]

  // Generate per-photo keyframes
  let photoKeyframes = ''
  let flashKeyframes = ''
  let stripKeyframes = ''
  let counterKeyframes = ''

  for (let i = 0; i < 5; i++) {
    const start = i * 2.5
    const visible = start
    const flashStart = start + 2.0
    const flashEnd = start + 2.15
    const shrinkStart = start + 2.15
    const shrinkEnd = start + 2.5
    const nextStart = (i + 1) * 2.5

    // Photo visibility: fade in at start, visible until flash, hidden after
    photoKeyframes += `
      @keyframes photo${i} {
        0% { opacity: 0; }
        ${p(visible)}% { opacity: 0; }
        ${p(visible + 0.2)}% { opacity: 1; }
        ${p(flashStart)}% { opacity: 1; }
        ${p(flashEnd)}% { opacity: 0; }
        100% { opacity: 0; }
      }
    `

    // Strip thumbnail: appears after capture
    stripKeyframes += `
      @keyframes strip${i} {
        0% { opacity: 0; transform: scale(0.3); }
        ${p(shrinkStart)}% { opacity: 0; transform: scale(0.3); }
        ${p(shrinkEnd)}% { opacity: 1; transform: scale(1); }
        100% { opacity: 1; transform: scale(1); }
      }
    `
  }

  // Flash keyframes (5 flashes)
  let flashKf = '0% { opacity: 0; }'
  for (let i = 0; i < 5; i++) {
    const flashStart = i * 2.5 + 2.0
    const flashPeak = i * 2.5 + 2.07
    const flashEnd = i * 2.5 + 2.2
    flashKf += `
      ${p(flashStart)}% { opacity: 0; }
      ${p(flashPeak)}% { opacity: 1; }
      ${p(flashEnd)}% { opacity: 0; }
    `
  }
  flashKf += '100% { opacity: 0; }'

  // REC blink
  const recBlink = `
    @keyframes recBlink {
      0%, 49% { opacity: 1; }
      50%, 100% { opacity: 0; }
    }
  `

  // Frame counter
  let counterKf = '0% { content: "01/05"; }'
  for (let i = 0; i < 5; i++) {
    const t = i * 2.5 + 0.1
    counterKf += `${p(t)}% { content: "0${i + 1}/05"; }`
  }
  counterKf += '100% { content: "05/05"; }'

  // CTA phase: after 12.5s, viewfinder UI fades, CTA text appears over last photo
  const ctaStart = 12.5

  // Scanlines via repeating gradient
  const scanlines = `background: repeating-linear-gradient(
    0deg,
    rgba(255,255,255,0.02) 0px,
    rgba(255,255,255,0.02) 1px,
    transparent 1px,
    transparent 3px
  );`

  // Film grain via CSS noise
  const grainOverlay = `
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E");
    background-size: 200px 200px;
  `

  // Build strip thumbnails HTML
  let stripThumbs = ''
  const stripY = HEIGHT - SAFE_BOTTOM - 120 // above safe bottom
  const stripThumbW = 100
  const stripThumbH = 140
  const stripGap = 16
  const totalStripW = 5 * stripThumbW + 4 * stripGap
  const stripStartX = (WIDTH - totalStripW) / 2

  for (let i = 0; i < 5; i++) {
    const x = stripStartX + i * (stripThumbW + stripGap)
    const imgSt = isPurple(photoNames[i])
      ? `width:130%;height:130%;object-fit:cover;object-position:center;display:block;margin:-15% 0 0 -15%;`
      : `width:100%;height:100%;object-fit:cover;object-position:center;display:block;`
    stripThumbs += `
      <div style="position:absolute;left:${x}px;top:${stripY}px;width:${stripThumbW}px;height:${stripThumbH}px;
        border:2px solid rgba(255,255,255,0.5);border-radius:4px;overflow:hidden;
        opacity:0;transform:scale(0.3);animation:strip${i} ${TOTAL_DURATION}s linear forwards;">
        <img src="${photos[i]}" style="${imgSt}"/>
      </div>
    `
  }

  return `<!DOCTYPE html><html><head>
<style>
  * { box-sizing:border-box;margin:0;padding:0; }
  html, body { background:#000; -webkit-font-smoothing:antialiased; overflow:hidden; }

  ${photoKeyframes}
  ${stripKeyframes}
  ${recBlink}

  @keyframes flash {
    ${flashKf}
  }

  @keyframes viewfinderUiFade {
    0% { opacity:1; }
    ${p(ctaStart)}% { opacity:1; }
    ${p(ctaStart + 0.6)}% { opacity:0; }
    100% { opacity:0; }
  }

  @keyframes ctaTextIn {
    0% { opacity:0; transform:translateY(12px); }
    100% { opacity:1; transform:translateY(0); }
  }

  @keyframes ctaDimOverlay {
    0% { opacity:0; }
    ${p(ctaStart)}% { opacity:0; }
    ${p(ctaStart + 0.8)}% { opacity:1; }
    100% { opacity:1; }
  }

  @keyframes settingsIn {
    0% { opacity:0; }
    5% { opacity:0.7; }
    ${p(ctaStart)}% { opacity:0.7; }
    ${p(ctaStart + 0.3)}% { opacity:0; }
    100% { opacity:0; }
  }

  @keyframes lastPhotoHold {
    0% { opacity:0; }
    ${p(10)}% { opacity:0; }
    ${p(10.2)}% { opacity:1; }
    100% { opacity:1; }
  }
</style>
</head><body>
<div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#000;">

  <!-- ============ VIEWFINDER LAYER ============ -->
  <div style="position:absolute;inset:0;">

    <!-- Photo layers (cycle through during capture phase) -->
    ${photos.map((src, i) => {
      const imgSt = isPurple(photoNames[i])
        ? `width:130%;height:130%;object-fit:cover;object-position:center 20%;display:block;margin:-15% 0 0 -15%;`
        : `width:100%;height:100%;object-fit:cover;object-position:center 20%;display:block;`
      return `
      <div style="position:absolute;inset:0;opacity:0;animation:photo${i} ${TOTAL_DURATION}s linear forwards;">
        <img src="${src}" style="${imgSt}"/>
      </div>`
    }).join('')}

    <!-- Last photo stays visible as CTA background -->
    <div style="position:absolute;inset:0;opacity:0;animation:lastPhotoHold ${TOTAL_DURATION}s linear forwards;z-index:2;">
      <img src="${photos[4]}" style="${isPurple(photoNames[4])
        ? `width:130%;height:130%;object-fit:cover;object-position:center 20%;display:block;margin:-15% 0 0 -15%;`
        : `width:100%;height:100%;object-fit:cover;object-position:center 20%;display:block;`}"/>
    </div>

    <!-- Film grain overlay (always active) -->
    <div style="position:absolute;inset:0;${grainOverlay}pointer-events:none;z-index:30;"></div>

    <!-- Scanlines (always active) -->
    <div style="position:absolute;inset:0;${scanlines}pointer-events:none;z-index:31;"></div>

    <!-- Dark vignette edges (always active) -->
    <div style="position:absolute;inset:0;background:radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.5) 100%);pointer-events:none;z-index:32;"></div>

    <!-- ============ VIEWFINDER UI (fades out for CTA) ============ -->
    <div style="position:absolute;inset:0;animation:viewfinderUiFade ${TOTAL_DURATION}s linear forwards;z-index:10;">

      <!-- Corner brackets — top left -->
      <div style="position:absolute;top:120px;left:80px;width:80px;height:80px;border-top:3px solid rgba(255,255,255,0.8);border-left:3px solid rgba(255,255,255,0.8);"></div>
      <!-- Corner brackets — top right -->
      <div style="position:absolute;top:120px;right:80px;width:80px;height:80px;border-top:3px solid rgba(255,255,255,0.8);border-right:3px solid rgba(255,255,255,0.8);"></div>
      <!-- Corner brackets — bottom left -->
      <div style="position:absolute;bottom:${SAFE_BOTTOM + 180}px;left:80px;width:80px;height:80px;border-bottom:3px solid rgba(255,255,255,0.8);border-left:3px solid rgba(255,255,255,0.8);"></div>
      <!-- Corner brackets — bottom right -->
      <div style="position:absolute;bottom:${SAFE_BOTTOM + 180}px;right:80px;width:80px;height:80px;border-bottom:3px solid rgba(255,255,255,0.8);border-right:3px solid rgba(255,255,255,0.8);"></div>

      <!-- Center crosshair -->
      <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);">
        <div style="width:40px;height:2px;background:rgba(255,255,255,0.5);position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);"></div>
        <div style="width:2px;height:40px;background:rgba(255,255,255,0.5);position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);"></div>
        <div style="width:60px;height:60px;border:1.5px solid rgba(255,255,255,0.35);border-radius:50%;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);"></div>
      </div>

      <!-- REC indicator — top left -->
      <div style="position:absolute;top:140px;left:100px;display:flex;align-items:center;gap:10px;">
        <div style="width:14px;height:14px;border-radius:50%;background:#FF0000;animation:recBlink 1s step-end infinite;"></div>
        <span style="font-family:${MONO};font-size:22px;font-weight:700;color:#FF0000;letter-spacing:0.05em;">REC</span>
      </div>

      <!-- MANILA + PHOTO SHOOT + frame counter — top right -->
      <div style="position:absolute;top:130px;right:80px;text-align:right;">
        <p style="font-family:${SF};font-size:80px;font-weight:900;color:#fff;letter-spacing:0.18em;margin:0;
          text-shadow:0 2px 24px rgba(0,0,0,0.7), 0 1px 6px rgba(0,0,0,0.5), 0 0 40px rgba(0,0,0,0.3);">MANILA</p>
        <p style="font-family:${SF};font-size:34px;font-weight:300;color:rgba(255,255,255,0.7);letter-spacing:0.3em;margin:6px 0 0;text-transform:uppercase;
          text-shadow:0 1px 12px rgba(0,0,0,0.6), 0 1px 4px rgba(0,0,0,0.4);">FREE PHOTO SHOOT</p>
        <p id="frameCounter" style="font-family:${MONO};font-size:18px;color:rgba(255,255,255,0.45);margin:12px 0 0;letter-spacing:0.15em;">01/05</p>
      </div>

      <!-- Camera settings — bottom of viewfinder area -->
      <div style="position:absolute;bottom:${SAFE_BOTTOM + 200}px;left:0;right:0;text-align:center;
        animation:settingsIn ${TOTAL_DURATION}s linear forwards;opacity:0;">
        <span style="font-family:${MONO};font-size:20px;color:rgba(255,255,255,0.6);letter-spacing:0.08em;">f/1.8 &nbsp; 1/200 &nbsp; ISO 400</span>
      </div>

      <!-- Date stamp — bottom right, orange monospace -->
      <div style="position:absolute;bottom:${SAFE_BOTTOM + 160}px;right:100px;
        animation:settingsIn ${TOTAL_DURATION}s linear forwards;opacity:0;">
        <span style="font-family:${MONO};font-size:22px;color:#FF8C00;letter-spacing:0.05em;">2026.03.11</span>
      </div>

      <!-- Film strip at bottom -->
      ${stripThumbs}

    </div>

  </div>

  <!-- ============ FLASH OVERLAY ============ -->
  <div style="position:absolute;inset:0;background:#fff;z-index:40;pointer-events:none;
    opacity:0;animation:flash ${TOTAL_DURATION}s linear forwards;"></div>

  <!-- ============ CTA TEXT (viewfinder-style, over last photo) ============ -->
  <div style="position:absolute;inset:0;z-index:35;pointer-events:none;
    opacity:0;animation:ctaDimOverlay ${TOTAL_DURATION}s linear forwards;
    background:linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.15) 35%, rgba(0,0,0,0.15) 55%, rgba(0,0,0,0.55) 80%, rgba(0,0,0,0.7) 100%);">
    <div style="position:absolute;left:0;right:0;top:260px;padding:0 80px;text-align:center;">
      <p style="font-family:${MONO};font-size:100px;font-weight:700;letter-spacing:0.18em;color:#fff;margin:0;
        text-shadow:0 2px 30px rgba(0,0,0,0.5);
        opacity:0;animation:ctaTextIn 0.7s ease-out ${ctaStart + 0.4}s forwards;">MANILA</p>
      <p style="font-family:${MONO};font-size:40px;font-weight:400;color:rgba(255,255,255,0.8);letter-spacing:0.35em;margin:14px 0 0;
        opacity:0;animation:ctaTextIn 0.7s ease-out ${ctaStart + 0.7}s forwards;">PHOTO SHOOT</p>
    </div>
    <div style="position:absolute;left:0;right:0;bottom:${SAFE_BOTTOM + 80}px;padding:0 80px;text-align:center;">
      <p style="font-family:${MONO};font-size:46px;font-weight:400;color:#fff;margin:0;letter-spacing:0.06em;
        text-shadow:0 1px 16px rgba(0,0,0,0.5);
        opacity:0;animation:ctaTextIn 0.7s ease-out ${ctaStart + 1.1}s forwards;">message me to get started</p>
      <p style="font-family:${MONO};font-size:28px;font-weight:400;color:rgba(255,255,255,0.5);margin:18px 0 0;letter-spacing:0.08em;
        opacity:0;animation:ctaTextIn 0.6s ease-out ${ctaStart + 1.5}s forwards;">@madebyaidan on Instagram</p>
    </div>
  </div>

</div>

<script>
  // Animate frame counter text
  const counter = document.getElementById('frameCounter');
  if (counter) {
    const schedule = [
      { t: 0, text: '01/05' },
      { t: 2500, text: '02/05' },
      { t: 5000, text: '03/05' },
      { t: 7500, text: '04/05' },
      { t: 10000, text: '05/05' },
    ];
    schedule.forEach(({ t, text }) => {
      setTimeout(() => { counter.textContent = text; }, t);
    });
  }
</script>
</body></html>`
}

/* ------------------------------------------------------------------ */
/*  Main render pipeline                                              */
/* ------------------------------------------------------------------ */
async function render() {
  resetOutputDir()

  const imageNames = {
    photo1: 'manila-gallery-purple-001-cropped.jpg',
    photo2: 'manila-gallery-purple-002-cropped.jpg',
    photo3: 'manila-gallery-canal-001.jpg',
    photo4: 'manila-gallery-ivy-001.jpg',
    photo5: 'manila-gallery-purple-003-cropped.jpg',
  }

  writeSources({
    createdAt: new Date().toISOString(),
    strategy: 'v54 — Film camera viewfinder POV with integrated CTA overlay, single Playwright recordVideo render',
    safeBottomPixels: SAFE_BOTTOM,
    images: imageNames
  })

  const images = Object.fromEntries(
    Object.entries(imageNames).map(([key, file]) => [key, readImage(file)])
  )

  const { execSync } = await import('child_process')
  const browser = await chromium.launch()

  // --- Step 1: Record the full animation (viewfinder + integrated CTA) ---
  console.log('Recording viewfinder + CTA animation...')

  const videoCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: OUT_DIR,
      size: { width: WIDTH, height: HEIGHT }
    }
  })

  const videoPage = await videoCtx.newPage()
  await videoPage.evaluate(() => { document.body.style.background = '#000'; })
  await videoPage.setContent(buildViewfinder(images, imageNames), { waitUntil: 'load' })
  await videoPage.waitForTimeout(ANIM_DURATION_MS)
  await videoPage.close()
  await videoCtx.close()
  await browser.close()

  // --- Step 2: Convert webm to mp4 ---
  const videoFiles = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.webm'))
  if (videoFiles.length === 0) {
    console.error('No video file was generated!')
    return
  }

  const srcVideo = path.join(OUT_DIR, videoFiles[0])
  const finalMp4 = path.join(OUT_DIR, '01_viewfinder_manila_ad.mp4')

  try {
    execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${finalMp4}"`, { stdio: 'pipe' })
    fs.unlinkSync(srcVideo)
    console.log('Rendered 01_viewfinder_manila_ad.mp4')
  } catch (err) {
    console.error('ffmpeg error:', err.message)
    if (fs.existsSync(srcVideo)) {
      fs.renameSync(srcVideo, finalMp4)
      console.log('Rendered 01_viewfinder_manila_ad.mp4 (webm container, ffmpeg failed)')
    }
  }

  console.log(`Done: output written to ${OUT_DIR}`)
}

render().catch(error => {
  console.error(error)
  process.exit(1)
})
