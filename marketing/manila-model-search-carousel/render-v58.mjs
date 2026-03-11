import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v58')

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 410

const SF = "-apple-system, 'Helvetica Neue', Arial, sans-serif"
const MANILA_COLOR = '#E8443A'

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

// Album art photos that cycle through — mix of purple (cropped) and non-purple
const ALBUM_PHOTOS = [
  { file: 'manila-gallery-garden-001.jpg', purple: false },
  { file: 'manila-gallery-purple-001.jpg', purple: true },
  { file: 'manila-gallery-graffiti-001.jpg', purple: false },
  { file: 'manila-gallery-purple-003.jpg', purple: true },
  { file: 'manila-gallery-ivy-001.jpg', purple: false },
  { file: 'manila-gallery-purple-005.jpg', purple: true },
]

// CTA photos
const CTA_PHOTOS = [
  { file: 'manila-gallery-purple-001.jpg', purple: true },
  { file: 'manila-gallery-garden-001.jpg', purple: false },
  { file: 'manila-gallery-purple-003.jpg', purple: true },
]

const LYRICS = [
  'looking for models in Manila',
  'no experience needed',
  'I direct everything',
  'show up and be yourself',
  '60 second signup',
  'edited photos in a week',
  'sign up below',
]

function buildNowPlayingAnimation(images) {
  const albumArtSize = 700
  const albumArtTop = 180
  const albumArtLeft = (WIDTH - albumArtSize) / 2
  const PHOTO_INTERVAL = 3 // seconds per photo crossfade

  // Build album art layers — each fades in at staggered times
  const albumLayers = images.albumPhotos.map((src, idx) => {
    const photo = ALBUM_PHOTOS[idx]
    const imgStyle = photo.purple
      ? `width:130%;height:130%;object-fit:cover;object-position:center center;display:block;margin:-15% 0 0 -15%;`
      : `width:100%;height:100%;object-fit:cover;object-position:center 20%;display:block;`

    const fadeInDelay = idx * PHOTO_INTERVAL
    // First image visible immediately, others crossfade in
    const initialOpacity = idx === 0 ? 1 : 0
    const animationRule = idx === 0
      ? ''
      : `animation: albumFadeIn 1s ease-in-out ${fadeInDelay}s forwards;`

    return `<div style="
      position:absolute;inset:0;overflow:hidden;border-radius:16px;
      opacity:${initialOpacity};
      z-index:${idx};
      ${animationRule}
    "><img src="${src}" style="${imgStyle}"/></div>`
  }).join('\n')

  // Build lyrics with staggered timing
  // Lyrics start appearing after first photo is shown, ~2s in
  const lyricStartTime = 2
  const lyricDuration = 2 // each lyric stays ~2s
  const lyricsHTML = LYRICS.map((line, idx) => {
    const fadeInAt = lyricStartTime + idx * lyricDuration
    return `<p class="lyric lyric-${idx}" style="
      font-family:${SF};
      font-size:32px;
      font-weight:600;
      color:rgba(255,255,255,0.35);
      margin:0;
      padding:8px 0;
      line-height:1.6;
      opacity:0;
      transition:color 0.4s ease, opacity 0.4s ease;
      animation:lyricAppear 0.5s ease-out ${fadeInAt}s forwards;
    ">${line}</p>`
  }).join('\n')

  // Lyric highlight keyframes — each lyric becomes bright then dims
  let lyricHighlightCSS = ''
  LYRICS.forEach((_, idx) => {
    const fadeInAt = lyricStartTime + idx * lyricDuration
    const highlightEnd = fadeInAt + lyricDuration
    lyricHighlightCSS += `
      @keyframes lyricHighlight${idx} {
        0% { color: #fff; }
        100% { color: rgba(255,255,255,0.35); }
      }
    `
  })

  // Build lyric highlight animations via JS-driven classes
  // We'll use CSS animation delays instead of JS for simplicity
  let lyricAnimationCSS = ''
  LYRICS.forEach((_, idx) => {
    const fadeInAt = lyricStartTime + idx * lyricDuration
    lyricAnimationCSS += `
      .lyric-${idx} {
        animation:
          lyricAppear 0.5s ease-out ${fadeInAt}s forwards,
          lyricGlow${idx} ${lyricDuration}s ease-in-out ${fadeInAt}s forwards;
      }
      @keyframes lyricGlow${idx} {
        0% { color: #fff; text-shadow: 0 0 20px rgba(255,255,255,0.3); }
        80% { color: #fff; text-shadow: 0 0 20px rgba(255,255,255,0.3); }
        100% { color: rgba(255,255,255,0.35); text-shadow: none; }
      }
    `
  })

  // Progress bar total time = 18s, fill animation over 18s
  const totalPlaybackSec = 18

  // Background tint keyframes — subtle color shift as album art changes
  let bgTintStops = ALBUM_PHOTOS.map((_, idx) => {
    const pct = (idx / (ALBUM_PHOTOS.length - 1)) * 100
    const colors = [
      'rgba(60, 20, 40, 0.95)',
      'rgba(50, 15, 50, 0.95)',
      'rgba(30, 25, 45, 0.95)',
      'rgba(55, 20, 35, 0.95)',
      'rgba(25, 35, 30, 0.95)',
      'rgba(45, 15, 45, 0.95)',
    ]
    return `${pct}% { background: ${colors[idx] || colors[0]}; }`
  }).join('\n')

  // Fade-to-black overlay at ~16.5s
  const fadeToBlackAt = 16.5

  return `<!DOCTYPE html>
<html>
  <head>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      html, body { margin: 0; padding: 0; background: #000; -webkit-font-smoothing: antialiased; }

      @keyframes albumFadeIn {
        0% { opacity: 0; }
        100% { opacity: 1; }
      }

      @keyframes lyricAppear {
        0% { opacity: 0; transform: translateY(10px); }
        100% { opacity: 1; transform: translateY(0); }
      }

      @keyframes progressFill {
        0% { width: 0%; }
        100% { width: 100%; }
      }

      @keyframes fadeToBlack {
        0% { opacity: 0; }
        100% { opacity: 1; }
      }

      @keyframes bgTintShift {
        ${bgTintStops}
      }

      @keyframes playPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }

      ${lyricAnimationCSS}
    </style>
  </head>
  <body>
    <div style="
      width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;
    ">
      <!-- Animated background tint -->
      <div style="
        position:absolute;inset:0;
        background:rgba(45, 15, 35, 0.95);
        animation:bgTintShift ${totalPlaybackSec}s ease-in-out infinite;
      "></div>

      <!-- Subtle noise texture overlay -->
      <div style="
        position:absolute;inset:0;
        background:
          radial-gradient(ellipse at 50% 30%, rgba(80,30,60,0.3) 0%, transparent 70%),
          radial-gradient(ellipse at 50% 80%, rgba(20,10,30,0.5) 0%, transparent 60%);
        z-index:1;
      "></div>

      <!-- Content container -->
      <div style="position:relative;z-index:2;width:100%;height:100%;">

        <!-- Album art container -->
        <div style="
          position:absolute;
          left:${albumArtLeft}px;
          top:${albumArtTop}px;
          width:${albumArtSize}px;
          height:${albumArtSize}px;
          border-radius:16px;
          overflow:hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06);
        ">
          ${albumLayers}
        </div>

        <!-- Song info below album art -->
        <div style="
          position:absolute;
          top:${albumArtTop + albumArtSize + 40}px;
          left:0;right:0;
          padding:0 100px;
          text-align:center;
        ">
          <!-- Song title -->
          <p style="
            font-family:${SF};
            font-size:28px;
            font-weight:700;
            color:#fff;
            margin:0;
            letter-spacing:0.02em;
          ">Manila Model Search</p>

          <!-- Artist -->
          <p style="
            font-family:${SF};
            font-size:20px;
            font-weight:400;
            color:#999;
            margin:6px 0 0;
          ">madebyaidan</p>

          <!-- Progress bar -->
          <div style="
            margin:28px 0 8px;
            display:flex;
            align-items:center;
            gap:14px;
          ">
            <span style="font-family:${SF};font-size:14px;color:#999;min-width:36px;text-align:right;">0:00</span>
            <div style="
              flex:1;
              height:4px;
              background:rgba(255,255,255,0.15);
              border-radius:2px;
              overflow:hidden;
              position:relative;
            ">
              <div style="
                position:absolute;
                left:0;top:0;bottom:0;
                background:${MANILA_COLOR};
                border-radius:2px;
                width:0%;
                animation:progressFill ${totalPlaybackSec}s linear forwards;
              "></div>
            </div>
            <span style="font-family:${SF};font-size:14px;color:#999;min-width:36px;">3:27</span>
          </div>

          <!-- Playback controls -->
          <div style="
            display:flex;
            justify-content:center;
            align-items:center;
            gap:60px;
            margin:20px 0 0;
          ">
            <!-- Previous -->
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" style="opacity:0.8;">
              <path d="M6 6h2v12H6V6zm3.5 6l8.5 6V6l-8.5 6z" fill="white"/>
            </svg>
            <!-- Play button -->
            <div style="
              width:72px;height:72px;
              background:rgba(255,255,255,0.12);
              border-radius:50%;
              display:flex;
              align-items:center;
              justify-content:center;
              animation:playPulse 2s ease-in-out infinite;
            ">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M8 5v14l11-7L8 5z" fill="white"/>
              </svg>
            </div>
            <!-- Next -->
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" style="opacity:0.8;">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" fill="white"/>
            </svg>
          </div>
        </div>

        <!-- Lyrics section -->
        <div style="
          position:absolute;
          top:${albumArtTop + albumArtSize + 280}px;
          left:0;right:0;
          bottom:${SAFE_BOTTOM + 20}px;
          padding:0 80px;
          text-align:center;
          overflow:hidden;
        ">
          <!-- Lyrics divider -->
          <div style="
            width:40px;height:3px;
            background:rgba(255,255,255,0.2);
            margin:0 auto 24px;
          "></div>
          <p style="
            font-family:${SF};
            font-size:14px;
            font-weight:600;
            color:rgba(255,255,255,0.4);
            letter-spacing:0.15em;
            text-transform:uppercase;
            margin:0 0 20px;
          ">LYRICS</p>

          ${lyricsHTML}
        </div>
      </div>

      <!-- Fade to black overlay -->
      <div style="
        position:absolute;inset:0;
        background:#000;z-index:50;
        pointer-events:none;
        opacity:0;
        animation:fadeToBlack 1s ease-out ${fadeToBlackAt}s forwards;
      "></div>

    </div>
  </body>
</html>`
}

function buildCTA(images) {
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
        ${cropImg(images.cta0, 460, 620, CTA_PHOTOS[0].purple, 'center 20%')}
      </div>
      <div style="position:absolute;top:180px;right:50px;transform:rotate(2.5deg);">
        ${cropImg(images.cta1, 420, 560, CTA_PHOTOS[1].purple, 'center 25%')}
      </div>
      <div style="position:absolute;top:620px;left:280px;transform:rotate(-1deg);z-index:5;">
        ${cropImg(images.cta2, 500, 380, CTA_PHOTOS[2].purple, 'center 30%')}
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
    albumPhotos: ALBUM_PHOTOS.map(p => p.file),
    ctaPhotos: CTA_PHOTOS.map(p => p.file),
  }

  writeSources({
    createdAt: new Date().toISOString(),
    strategy: 'v58 — Apple Music Now Playing screen with cycling album art and lyric reveal',
    safeBottomPixels: SAFE_BOTTOM,
    images: selection,
  })

  // Load album art images
  const albumPhotoData = ALBUM_PHOTOS.map(p => readImage(p.file))
  // Load CTA images
  const ctaImageData = {
    cta0: readImage(CTA_PHOTOS[0].file),
    cta1: readImage(CTA_PHOTOS[1].file),
    cta2: readImage(CTA_PHOTOS[2].file),
  }

  const { execSync } = await import('child_process')
  const browser = await chromium.launch()

  // --- Step 1: Record the Now Playing animation video ---
  console.log('Recording Apple Music Now Playing animation...')

  const videoCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: OUT_DIR,
      size: { width: WIDTH, height: HEIGHT },
    },
  })

  const videoPage = await videoCtx.newPage()
  const animationHTML = buildNowPlayingAnimation({ albumPhotos: albumPhotoData })
  await videoPage.setContent(animationHTML, { waitUntil: 'load' })
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
  await ctaPage.setContent(buildCTA(ctaImageData), { waitUntil: 'load' })
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
  const animMp4 = path.join(OUT_DIR, 'animation_part.mp4')
  const ctaMp4 = path.join(OUT_DIR, 'cta_part.mp4')
  const finalMp4 = path.join(OUT_DIR, '01_apple_music_now_playing.mp4')
  const concatFile = path.join(OUT_DIR, 'concat.txt')

  try {
    // Convert animation webm to mp4
    execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${animMp4}"`, { stdio: 'pipe' })

    // Create 5-second CTA video from static image
    execSync(`ffmpeg -y -loop 1 -i "${ctaPath}" -c:v libx264 -t 5 -pix_fmt yuv420p -r 30 -vf "scale=${WIDTH}:${HEIGHT}" -an "${ctaMp4}"`, { stdio: 'pipe' })

    // Concat animation + CTA
    fs.writeFileSync(concatFile, `file '${animMp4}'\nfile '${ctaMp4}'\n`)
    execSync(`ffmpeg -y -f concat -safe 0 -i "${concatFile}" -c copy "${finalMp4}"`, { stdio: 'pipe' })

    // Cleanup temp files
    fs.unlinkSync(srcVideo)
    fs.unlinkSync(animMp4)
    fs.unlinkSync(ctaMp4)
    fs.unlinkSync(concatFile)
    console.log('Rendered 01_apple_music_now_playing.mp4 (animation + CTA)')
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
