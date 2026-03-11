import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v53')

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 410

const SF = "-apple-system, 'Helvetica Neue', Arial, sans-serif"
const HAND = "'Marker Felt', cursive"
const MANILA_COLOR = '#E8443A'

const TOTAL_DURATION = 18
const TOTAL_DURATION_MS = 20000

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

// Five polaroids — mix of purple (cropped 130%/-15%) and non-purple
const POLAROIDS = [
  {
    file: 'manila-gallery-purple-001.jpg',
    purple: true,
    caption: 'manila magic ✨',
    x: 60, y: 140, rot: -6,
  },
  {
    file: 'manila-gallery-garden-001.jpg',
    purple: false,
    caption: 'first shoot ever!',
    x: 520, y: 100, rot: 4,
  },
  {
    file: 'manila-gallery-purple-003.jpg',
    purple: true,
    caption: 'she killed it 🔥',
    x: 180, y: 520, rot: 3,
  },
  {
    file: 'manila-gallery-graffiti-001.jpg',
    purple: false,
    caption: 'no experience needed',
    x: 540, y: 560, rot: -5,
  },
  {
    file: 'manila-gallery-purple-005.jpg',
    purple: true,
    caption: '@madebyaidan',
    x: 280, y: 900, rot: 7,
  },
]

function buildPolaroidAnimation(images) {
  // Each polaroid gets 3s: appear at t, develop from t+0.3 to t+2.3, caption at t+1.5
  // 5 polaroids × 3s = 15s, then 1.5s admire, then 1.5s fade to black = 18s total
  const POLAROID_W = 400
  const PHOTO_AREA_H = 420
  const BORDER = 28
  const BOTTOM_BORDER = 90
  const TOTAL_H = BORDER + PHOTO_AREA_H + BOTTOM_BORDER + BORDER

  function polaroidKeyframes(idx) {
    const startTime = idx * 3
    const appearAt = startTime
    const developStart = startTime + 0.3
    const developEnd = startTime + 2.3
    const captionAt = startTime + 1.5

    return { appearAt, developStart, developEnd, captionAt }
  }

  const polaroidElements = POLAROIDS.map((pol, idx) => {
    const { appearAt, developStart, developEnd, captionAt } = polaroidKeyframes(idx)
    const imgSrc = images[`photo${idx}`]

    // Purple photos: crop 130% with -15% offset to trim film borders
    const imgStyle = pol.purple
      ? `width:130%;height:130%;object-fit:cover;object-position:center center;display:block;margin:-15% 0 0 -15%;`
      : `width:100%;height:100%;object-fit:cover;object-position:center 20%;display:block;`

    return `
      <!-- Polaroid ${idx + 1} -->
      <div style="
        position:absolute;
        left:${pol.x}px;
        top:${pol.y}px;
        width:${POLAROID_W}px;
        transform:rotate(${pol.rot}deg);
        opacity:0;
        animation:polaroidAppear 0.6s cubic-bezier(0.34,1.56,0.64,1) ${appearAt}s forwards;
        z-index:${10 + idx};
        filter: drop-shadow(0 8px 24px rgba(0,0,0,0.5));
      ">
        <!-- White polaroid frame -->
        <div style="
          background:#fafafa;
          border-radius:4px;
          padding:${BORDER}px ${BORDER}px ${BOTTOM_BORDER}px;
          box-shadow: inset 0 0 0 1px rgba(0,0,0,0.08);
        ">
          <!-- Photo area -->
          <div style="
            width:${POLAROID_W - BORDER * 2}px;
            height:${PHOTO_AREA_H}px;
            overflow:hidden;
            position:relative;
            background:#f0ece4;
          ">
            <!-- Developing photo — starts white/washed, fades to full color -->
            <div style="
              position:absolute;inset:0;
              opacity:0;
              filter:saturate(0) brightness(1.4);
              animation:
                photoDevelop-opacity 2s ease-in ${developStart}s forwards,
                photoDevelop-color 2s ease-in ${developStart}s forwards;
            ">
              <img src="${imgSrc}" style="${imgStyle}"/>
            </div>
          </div>

          <!-- Handwritten caption -->
          <div style="
            text-align:center;
            padding-top:14px;
            opacity:0;
            animation:captionFade 0.6s ease-out ${captionAt}s forwards;
          ">
            <p style="
              font-family:${HAND};
              font-size:28px;
              color:#333;
              margin:0;
              line-height:1.2;
            ">${pol.caption}</p>
          </div>
        </div>
      </div>
    `
  }).join('\n')

  // Fade to black starts at 16.5s
  const fadeAt = 16.5

  return `<!DOCTYPE html>
<html>
  <head>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      html, body { margin: 0; padding: 0; background: #000; -webkit-font-smoothing: antialiased; }

      @keyframes polaroidAppear {
        0% { opacity: 0; transform: rotate(var(--rot, 0deg)) scale(0.6) translateY(60px); }
        100% { opacity: 1; transform: rotate(var(--rot, 0deg)) scale(1) translateY(0); }
      }

      @keyframes photoDevelop-opacity {
        0% { opacity: 0; }
        30% { opacity: 0.4; }
        100% { opacity: 1; }
      }

      @keyframes photoDevelop-color {
        0% { filter: saturate(0) brightness(1.5); }
        40% { filter: saturate(0.3) brightness(1.2); }
        100% { filter: saturate(1) brightness(1); }
      }

      @keyframes captionFade {
        0% { opacity: 0; transform: translateY(6px); }
        100% { opacity: 1; transform: translateY(0); }
      }

      @keyframes fadeToBlack {
        0% { opacity: 0; }
        100% { opacity: 1; }
      }
    </style>
  </head>
  <body>
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;
      background:
        repeating-linear-gradient(
          90deg,
          rgba(60,40,20,0.04) 0px,
          rgba(60,40,20,0.04) 2px,
          transparent 2px,
          transparent 18px
        ),
        repeating-linear-gradient(
          0deg,
          rgba(60,40,20,0.03) 0px,
          rgba(60,40,20,0.03) 1px,
          transparent 1px,
          transparent 22px
        ),
        linear-gradient(160deg, #1a1410 0%, #0d0a07 50%, #151210 100%);
    ">

      ${polaroidElements}

      <!-- Fade to black overlay -->
      <div style="position:absolute;inset:0;background:#000;z-index:50;pointer-events:none;opacity:0;animation:fadeToBlack 0.8s ease-out ${fadeAt}s forwards;"></div>

    </div>
  </body>
</html>`
}

function buildCTA(images) {
  // 3 staggered photos on black with gradient, bold MANILA CTA
  function cropImg(src, w, h, purple, pos = 'center 20%') {
    const imgStyle = purple
      ? `width:130%;height:130%;object-fit:cover;object-position:center center;display:block;margin:-15% 0 0 -15%;`
      : `width:100%;height:100%;object-fit:cover;object-position:${pos};display:block;`
    return `<div style="width:${w}px;height:${h}px;overflow:hidden;border-radius:16px;box-shadow:0 8px 40px rgba(0,0,0,0.5);">
      <img src="${src}" style="${imgStyle}"/>
    </div>`
  }

  return `<!DOCTYPE html><html><head>
    <style>* { box-sizing:border-box;margin:0;padding:0; } html,body { background:#000; -webkit-font-smoothing:antialiased; }</style>
  </head><body>
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#000;">

      <!-- Photo grid — 3 photos staggered -->
      <div style="position:absolute;top:120px;left:50px;transform:rotate(-3deg);">
        ${cropImg(images.photo0, 460, 620, true, 'center 20%')}
      </div>
      <div style="position:absolute;top:180px;right:50px;transform:rotate(2.5deg);">
        ${cropImg(images.photo3, 420, 560, false, 'center 25%')}
      </div>
      <div style="position:absolute;top:620px;left:280px;transform:rotate(-1deg);z-index:5;">
        ${cropImg(images.photo2, 500, 380, true, 'center 30%')}
      </div>

      <!-- Dark gradient overlay -->
      <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 20%, rgba(0,0,0,0.0) 35%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.95) 72%, #000 85%);"></div>

      <!-- Text content above SAFE_BOTTOM -->
      <div style="position:absolute;left:0;right:0;bottom:${SAFE_BOTTOM + 40}px;padding:0 70px;text-align:center;">

        <!-- Thin red accent line -->
        <div style="width:50px;height:3px;background:${MANILA_COLOR};margin:0 auto 30px;"></div>

        <!-- MANILA — 180px white bold -->
        <p style="font-family:${SF};font-size:180px;font-weight:900;letter-spacing:0.14em;color:#fff;margin:0;text-transform:uppercase;text-shadow:0 4px 80px rgba(232,68,58,0.4), 0 2px 20px rgba(0,0,0,0.8);">MANILA</p>

        <!-- MODEL SEARCH -->
        <p style="font-family:${SF};font-size:38px;font-weight:300;color:rgba(255,255,255,0.9);margin:4px 0 0;letter-spacing:0.3em;text-transform:uppercase;">MODEL SEARCH</p>

        <!-- Divider -->
        <div style="width:100px;height:1px;background:rgba(255,255,255,0.25);margin:36px auto;"></div>

        <!-- CTA button -->
        <div style="display:inline-block;background:${MANILA_COLOR};border-radius:40px;padding:20px 70px;box-shadow:0 6px 30px rgba(232,68,58,0.45);">
          <p style="font-family:${SF};font-size:26px;font-weight:700;color:#fff;margin:0;letter-spacing:0.1em;text-transform:uppercase;">SIGN UP NOW</p>
        </div>

        <!-- Subtext -->
        <p style="font-family:${SF};font-size:22px;font-weight:400;color:rgba(255,255,255,0.45);margin:22px 0 0;letter-spacing:0.04em;">60-second form · No experience needed</p>
      </div>
    </div>
  </body></html>`
}

async function render() {
  resetOutputDir()

  const selection = {
    photo0: POLAROIDS[0].file,
    photo1: POLAROIDS[1].file,
    photo2: POLAROIDS[2].file,
    photo3: POLAROIDS[3].file,
    photo4: POLAROIDS[4].file,
  }

  writeSources({
    createdAt: new Date().toISOString(),
    strategy: 'v53 — Polaroid photos developing one by one on dark wood background',
    safeBottomPixels: SAFE_BOTTOM,
    images: selection,
  })

  const images = Object.fromEntries(
    Object.entries(selection).map(([key, file]) => [key, readImage(file)])
  )

  const { execSync } = await import('child_process')
  const browser = await chromium.launch()

  // --- Step 1: Record the polaroid animation video ---
  console.log('Recording polaroid developing animation...')

  const videoCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: OUT_DIR,
      size: { width: WIDTH, height: HEIGHT },
    },
  })

  const videoPage = await videoCtx.newPage()
  await videoPage.setContent(buildPolaroidAnimation(images), { waitUntil: 'load' })
  await videoPage.waitForTimeout(500)
  await videoPage.waitForTimeout(TOTAL_DURATION_MS)
  await videoPage.close()
  await videoCtx.close()

  // --- Step 2: Render CTA as a high-quality screenshot ---
  console.log('Rendering CTA screenshot...')
  const ctaCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
  })
  const ctaPage = await ctaCtx.newPage()
  await ctaPage.setContent(buildCTA(images), { waitUntil: 'load' })
  await ctaPage.waitForTimeout(300)
  const ctaPath = path.join(OUT_DIR, 'cta_frame.png')
  await ctaPage.screenshot({ path: ctaPath })
  await ctaPage.close()
  await ctaCtx.close()
  await browser.close()

  // --- Step 3: Convert webm to mp4, then concat with CTA still frame ---
  const videoFiles = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.webm'))
  if (videoFiles.length === 0) {
    console.error('No video file was generated!')
    return
  }

  const srcVideo = path.join(OUT_DIR, videoFiles[0])
  const chatMp4 = path.join(OUT_DIR, 'animation_part.mp4')
  const ctaMp4 = path.join(OUT_DIR, 'cta_part.mp4')
  const finalMp4 = path.join(OUT_DIR, '01_polaroid_developing.mp4')
  const concatFile = path.join(OUT_DIR, 'concat.txt')

  try {
    // Convert animation webm to mp4
    execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${chatMp4}"`, { stdio: 'pipe' })

    // Create 5-second CTA video from static image
    execSync(`ffmpeg -y -loop 1 -i "${ctaPath}" -c:v libx264 -t 5 -pix_fmt yuv420p -r 30 -vf "scale=${WIDTH}:${HEIGHT}" -an "${ctaMp4}"`, { stdio: 'pipe' })

    // Concat animation + CTA
    fs.writeFileSync(concatFile, `file '${chatMp4}'\nfile '${ctaMp4}'\n`)
    execSync(`ffmpeg -y -f concat -safe 0 -i "${concatFile}" -c copy "${finalMp4}"`, { stdio: 'pipe' })

    // Cleanup temp files
    fs.unlinkSync(srcVideo)
    fs.unlinkSync(chatMp4)
    fs.unlinkSync(ctaMp4)
    fs.unlinkSync(concatFile)
    console.log('Rendered 01_polaroid_developing.mp4 (animation + CTA)')
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
