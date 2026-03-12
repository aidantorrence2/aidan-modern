import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, "output-20a")

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 430
const SAFE_TOP = 213
const SAFE_LEFT = 66
const SAFE_RIGHT = 1027

const SF = "-apple-system, 'Helvetica Neue', Arial, sans-serif"
const HAND = "'Marker Felt', cursive"
const MANILA_COLOR = '#E8443A'

const TOTAL_DURATION = 22
const TOTAL_DURATION_MS = 24000

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

// Five polaroids — clean, non-purple photos with storytelling captions
const POLAROIDS = [
  {
    file: 'manila-gallery-dsc-0190.jpg',
    caption: 'step 1: DM me on instagram',
    x: 66, y: 360, rot: -6,
  },
  {
    file: 'manila-gallery-canal-001.jpg',
    caption: 'step 2: show up to the shoot',
    x: 520, y: 320, rot: 4,
  },
  {
    file: 'manila-gallery-garden-001.jpg',
    caption: 'step 3: I direct everything',
    x: 180, y: 720, rot: 3,
  },
  {
    file: 'manila-gallery-urban-001.jpg',
    caption: 'step 4: get your photos \u2728',
    x: 540, y: 760, rot: -5,
  },
  {
    file: 'manila-gallery-night-001.jpg',
    caption: 'dm me if interested!!',
    x: 280, y: 950, rot: 7,
  },
]

function buildPolaroidAnimation(images) {
  // Each polaroid gets 3s: appear at t, develop from t+0.3 to t+2.3, caption at t+1.5
  // 5 polaroids x 3s = 15s, then CTA text fades in at 16s, hold until 22s
  const POLAROID_W = 400
  const PHOTO_AREA_H = 420
  const BORDER = 28
  const BOTTOM_BORDER = 90

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

    const imgStyle = `width:100%;height:100%;object-fit:cover;object-position:center 20%;display:block;`

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

  // CTA text fades in at 16s, no fade-to-black
  const ctaFadeAt = 16

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

      @keyframes ctaFadeIn {
        0% { opacity: 0; transform: translateY(16px); }
        100% { opacity: 1; transform: translateY(0); }
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

      <!-- MANILA FREE PHOTO SHOOT header -->
      <div style="
        position:absolute;
        top:${SAFE_TOP}px;
        left:${SAFE_LEFT}px;
        right:${WIDTH - SAFE_RIGHT}px;
        text-align:center;
        z-index:100;
      ">
        <p style="
          font-family:Georgia, 'Times New Roman', serif;
          font-style:italic;
          font-size:64px;
          font-weight:bold;
          color:${MANILA_COLOR};
          margin:0;
          line-height:1.1;
          text-shadow:0 4px 20px rgba(0,0,0,0.6);
          letter-spacing:0.06em;
        ">MANILA</p>
        <p style="
          font-family:Georgia, 'Times New Roman', serif;
          font-style:italic;
          font-size:36px;
          font-weight:normal;
          color:#fff;
          margin:6px 0 0;
          line-height:1.2;
          text-shadow:0 3px 16px rgba(0,0,0,0.6);
          letter-spacing:0.08em;
        ">FREE PHOTO SHOOT</p>
      </div>

      ${polaroidElements}

      <!-- CTA is the 5th polaroid card -->

    </div>
  </body>
</html>`
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
    strategy: 'v53b — Polaroid developing animation with MANILA FREE PHOTO SHOOT header and storytelling captions',
    safeBottomPixels: SAFE_BOTTOM,
    images: selection,
  })

  const images = Object.fromEntries(
    Object.entries(selection).map(([key, file]) => [key, readImage(file)])
  )

  const { execSync } = await import('child_process')
  const browser = await chromium.launch()

  // --- Record the polaroid animation video ---
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
  await browser.close()

  // --- Convert webm to mp4 ---
  const videoFiles = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.webm'))
  if (videoFiles.length === 0) {
    console.error('No video file was generated!')
    return
  }

  const srcVideo = path.join(OUT_DIR, videoFiles[0])
  const finalMp4 = path.join(OUT_DIR, '01_polaroid_developing.mp4')

  try {
    execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${finalMp4}"`, { stdio: 'pipe' })
    fs.unlinkSync(srcVideo)
    console.log('Rendered 01_polaroid_developing.mp4')
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
