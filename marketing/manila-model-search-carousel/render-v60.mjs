import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v60')
const WIDTH = 1080, HEIGHT = 1920, SAFE_BOTTOM = 410
const SF = "-apple-system, 'Helvetica Neue', Arial, sans-serif"
const MANILA_COLOR = '#E8443A'
const SPOTIFY_GREEN = '#1ED760'

// 8 lyrics x 2.7s = 21.6s + 0.5s initial pause = 22.1s, fade at 22s
const INITIAL_PAUSE = 0.5
const LYRIC_DURATION = 2.7  // seconds per lyric
const LYRICS_COUNT = 8
const FADE_START = INITIAL_PAUSE + LYRICS_COUNT * LYRIC_DURATION // ~22.1s
const FADE_DURATION = 0.3
const TOTAL_ANIM_S = FADE_START + FADE_DURATION + 1.0 // ~23.4s — recording ends ~1s after fade
const TOTAL_DURATION_MS = Math.ceil(TOTAL_ANIM_S * 1000)

const LYRICS = [
  { text: 'she DM\'d me out of nowhere', photo: 'manila-gallery-purple-001.jpg', purple: true },
  { text: 'said she wanted to shoot in Manila', photo: 'manila-gallery-purple-003.jpg', purple: true },
  { text: 'she\'d never modeled before', photo: 'manila-gallery-purple-005.jpg', purple: true },
  { text: 'I said just show up', photo: 'manila-gallery-garden-001.jpg', purple: false },
  { text: 'I\'ll direct everything', photo: 'manila-gallery-purple-006.jpg', purple: true },
  { text: 'these are the photos', photo: 'manila-gallery-purple-002.jpg', purple: true },
  { text: 'from her first shoot ever', photo: 'manila-gallery-purple-004.jpg', purple: true },
  { text: 'sign up below', photo: 'manila-gallery-purple-001.jpg', purple: true },
]

const CTA_PHOTOS = [
  { file: 'manila-gallery-purple-001.jpg', purple: true },
  { file: 'manila-gallery-purple-005.jpg', purple: true },
  { file: 'manila-gallery-purple-006.jpg', purple: true },
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

function buildVisualLyrics(imageDataMap) {
  // Total animation length for CSS percentage calculations
  const ANIM_TOTAL = FADE_START + FADE_DURATION + 0.5
  const pct = (s) => ((s / ANIM_TOTAL) * 100).toFixed(2)

  // Build photo layer keyframes — each photo fades in during its lyric slot
  // Photo crossfade: 0.6s transition
  const CROSSFADE = 0.6
  let photoKeyframes = ''
  let photoHTML = ''

  LYRICS.forEach((lyric, i) => {
    const start = INITIAL_PAUSE + i * LYRIC_DURATION
    const end = start + LYRIC_DURATION
    const imgSrc = imageDataMap[lyric.photo]
    const isPurple = lyric.purple

    // Image styling for purple film border crops
    const imgStyle = isPurple
      ? 'width:130%;height:130%;object-fit:cover;object-position:center center;margin:-15% 0 0 -15%;'
      : 'width:100%;height:100%;object-fit:cover;object-position:center 20%;'

    photoHTML += `
      <div class="photo-layer photo-${i}" style="position:absolute;inset:0;opacity:0;">
        <img src="${imgSrc}" style="
          position:absolute;inset:0;display:block;
          ${imgStyle}
          filter:brightness(0.4) saturate(1.2);
        "/>
      </div>
    `

    // First photo starts visible
    if (i === 0) {
      photoKeyframes += `
        @keyframes photo${i} {
          0% { opacity:1; transform:scale(1); }
          ${pct(start)}% { opacity:1; transform:scale(1); }
          ${pct(end - CROSSFADE)}% { opacity:1; transform:scale(1.08); }
          ${pct(end)}% { opacity:0; transform:scale(1.08); }
          100% { opacity:0; transform:scale(1.08); }
        }
      `
    } else if (i === LYRICS.length - 1) {
      // Last photo stays until fade to black
      photoKeyframes += `
        @keyframes photo${i} {
          0%, ${pct(start - CROSSFADE)}% { opacity:0; transform:scale(1); }
          ${pct(start)}% { opacity:1; transform:scale(1); }
          ${pct(FADE_START)}% { opacity:1; transform:scale(1.08); }
          100% { opacity:1; transform:scale(1.08); }
        }
      `
    } else {
      photoKeyframes += `
        @keyframes photo${i} {
          0%, ${pct(start - CROSSFADE)}% { opacity:0; transform:scale(1); }
          ${pct(start)}% { opacity:1; transform:scale(1); }
          ${pct(end - CROSSFADE)}% { opacity:1; transform:scale(1.08); }
          ${pct(end)}% { opacity:0; transform:scale(1.08); }
          100% { opacity:0; transform:scale(1.08); }
        }
      `
    }
  })

  // Build lyric text keyframes — fade in, stay, fade out
  const LYRIC_FADE_IN = 0.4
  const LYRIC_FADE_OUT = 0.3
  let lyricKeyframes = ''
  let lyricHTML = ''

  LYRICS.forEach((lyric, i) => {
    const start = INITIAL_PAUSE + i * LYRIC_DURATION
    const end = start + LYRIC_DURATION

    lyricHTML += `
      <div class="lyric-text lyric-${i}" style="
        position:absolute;
        left:60px;right:60px;
        top:50%;transform:translateY(-50%) translateY(10px);
        font-family:${SF};
        font-size:72px;
        font-weight:800;
        color:#fff;
        line-height:1.15;
        text-align:center;
        opacity:0;
        text-shadow:0 4px 30px rgba(0,0,0,0.8), 0 0 60px rgba(0,0,0,0.5);
      ">${lyric.text}</div>
    `

    lyricKeyframes += `
      @keyframes lyric${i} {
        0%, ${pct(start)}% {
          opacity:0; transform:translateY(-50%) translateY(10px);
        }
        ${pct(start + LYRIC_FADE_IN)}% {
          opacity:1; transform:translateY(-50%) translateY(0);
        }
        ${pct(end - LYRIC_FADE_OUT)}% {
          opacity:1; transform:translateY(-50%) translateY(0);
        }
        ${pct(end)}% {
          opacity:0; transform:translateY(-50%) translateY(-10px);
        }
        100% {
          opacity:0; transform:translateY(-50%) translateY(-10px);
        }
      }
    `
  })

  // Progress bar: song is 3:27 = 207s, we show ~24s of progress starting at 0:24
  const songTotalS = 207
  const songStartS = 24
  const progressStartPct = (songStartS / songTotalS * 100).toFixed(1)
  const progressEndPct = ((songStartS + FADE_START) / songTotalS * 100).toFixed(1)

  // Timestamp animation — we'll just use static start/end
  const formatTime = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
  const timeStart = formatTime(songStartS)
  const timeEnd = formatTime(songTotalS)

  // First album art for the corner thumbnail
  const cornerArtSrc = imageDataMap[LYRICS[0].photo]

  return `<!DOCTYPE html>
<html>
<head>
  <style>
    * { box-sizing:border-box;margin:0;padding:0; }
    html, body {
      margin:0;padding:0;background:#000;
      -webkit-font-smoothing:antialiased;
    }

    /* Photo layer animations */
    ${photoKeyframes}

    ${LYRICS.map((_, i) => `
      .photo-${i} {
        animation: photo${i} ${ANIM_TOTAL}s linear forwards;
      }
    `).join('')}

    /* Lyric text animations */
    ${lyricKeyframes}

    ${LYRICS.map((_, i) => `
      .lyric-${i} {
        animation: lyric${i} ${ANIM_TOTAL}s linear forwards;
      }
    `).join('')}

    /* Progress bar fill */
    @keyframes progressFill {
      0% { width: ${progressStartPct}%; }
      100% { width: ${progressEndPct}%; }
    }

    /* Fade to black */
    @keyframes fadeToBlack {
      0% { opacity:0; }
      100% { opacity:1; }
    }

    /* Timestamp update */
    @keyframes timestampTick {
      0% { content: "${timeStart}"; }
      100% { content: "${formatTime(songStartS + FADE_START)}"; }
    }
  </style>
</head>
<body>
  <div id="root" style="
    width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#000;
  ">

    <!-- ===== FULL-SCREEN PHOTO BACKGROUNDS ===== -->
    ${photoHTML}

    <!-- ===== LYRICS OVERLAY (centered vertically) ===== -->
    <div style="position:absolute;inset:0;z-index:10;pointer-events:none;">
      ${lyricHTML}
    </div>

    <!-- ===== SPOTIFY TOP BAR (minimal) ===== -->
    <div style="
      position:absolute;top:0;left:0;right:0;z-index:20;
      padding:54px 24px 0;
      display:flex;align-items:center;gap:12px;
    ">
      <!-- Small album art thumbnail -->
      <div style="
        width:52px;height:52px;border-radius:4px;overflow:hidden;flex-shrink:0;
      ">
        <img src="${cornerArtSrc}" style="
          width:130%;height:130%;object-fit:cover;object-position:center center;
          display:block;margin:-15% 0 0 -15%;
        "/>
      </div>
      <div>
        <p style="font-family:${SF};font-size:16px;font-weight:700;color:#fff;margin:0;text-shadow:0 1px 8px rgba(0,0,0,0.6);">Manila Photo Shoot</p>
        <p style="font-family:${SF};font-size:14px;font-weight:400;color:rgba(255,255,255,0.7);margin:2px 0 0;text-shadow:0 1px 8px rgba(0,0,0,0.6);">madebyaidan</p>
      </div>
    </div>

    <!-- ===== GREEN PROGRESS BAR (above SAFE_BOTTOM) ===== -->
    <div style="
      position:absolute;left:48px;right:48px;bottom:${SAFE_BOTTOM + 40}px;z-index:20;
    ">
      <div style="position:relative;width:100%;height:3px;background:rgba(255,255,255,0.2);border-radius:2px;">
        <div style="
          position:absolute;left:0;top:0;height:100%;
          background:${SPOTIFY_GREEN};border-radius:2px;
          width:${progressStartPct}%;
          animation:progressFill ${FADE_START}s linear forwards;
        "></div>
      </div>
      <!-- Timestamps -->
      <div style="display:flex;justify-content:space-between;margin-top:6px;">
        <p id="timeElapsed" style="font-family:${SF};font-size:11px;font-weight:400;color:rgba(255,255,255,0.5);margin:0;text-shadow:0 1px 4px rgba(0,0,0,0.5);">${timeStart}</p>
        <p style="font-family:${SF};font-size:11px;font-weight:400;color:rgba(255,255,255,0.5);margin:0;text-shadow:0 1px 4px rgba(0,0,0,0.5);">${timeEnd}</p>
      </div>
    </div>

    <!-- ===== FADE TO BLACK OVERLAY ===== -->
    <div style="
      position:absolute;inset:0;
      background:#000;z-index:50;
      pointer-events:none;
      opacity:0;
      animation:fadeToBlack ${FADE_DURATION}s ease-out ${FADE_START}s forwards;
    "></div>
  </div>

  <script>
    // Update elapsed timestamp every second
    const startSeconds = ${songStartS};
    const el = document.getElementById('timeElapsed');
    let elapsed = 0;
    setInterval(() => {
      elapsed++;
      const t = startSeconds + elapsed;
      const m = Math.floor(t / 60);
      const s = String(t % 60).padStart(2, '0');
      if (el) el.textContent = m + ':' + s;
    }, 1000);
  </script>
</body>
</html>`
}

function buildCTA(images) {
  function cropImg(src, w, h, purple, pos = 'center 20%') {
    const imgStyle = purple
      ? 'width:130%;height:130%;object-fit:cover;object-position:center center;display:block;margin:-15% 0 0 -15%;'
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

        <!-- Thin accent line -->
        <div style="width:50px;height:3px;background:${MANILA_COLOR};margin:0 auto 30px;"></div>

        <!-- MANILA — 180px white bold -->
        <p style="font-family:${SF};font-size:180px;font-weight:900;letter-spacing:0.14em;color:#fff;margin:0;text-transform:uppercase;text-shadow:0 4px 80px rgba(232,68,58,0.4), 0 2px 20px rgba(0,0,0,0.8);">MANILA</p>

        <!-- PHOTO SHOOT -->
        <p style="font-family:${SF};font-size:38px;font-weight:300;color:rgba(255,255,255,0.9);margin:4px 0 0;letter-spacing:0.3em;text-transform:uppercase;">PHOTO SHOOT</p>
      </div>
    </div>
  </body></html>`
}

async function render() {
  resetOutputDir()

  // Collect unique photos needed
  const uniquePhotos = new Set()
  LYRICS.forEach(l => uniquePhotos.add(l.photo))
  CTA_PHOTOS.forEach(p => uniquePhotos.add(p.file))

  const imageDataMap = {}
  for (const photoFile of uniquePhotos) {
    imageDataMap[photoFile] = readImage(photoFile)
  }

  writeSources({
    createdAt: new Date().toISOString(),
    strategy: 'v60 — Full-screen photo backgrounds with HUGE story-driven lyrics, Spotify overlay',
    safeBottomPixels: SAFE_BOTTOM,
    lyrics: LYRICS.map(l => l.text),
    images: {
      lyricPhotos: LYRICS.map(l => l.photo),
      ctaPhotos: CTA_PHOTOS.map(p => p.file),
    },
    timing: {
      lyricDuration: LYRIC_DURATION,
      totalLyrics: LYRICS_COUNT,
      fadeStart: FADE_START,
      totalRecording: TOTAL_ANIM_S,
    },
  })

  const { execSync } = await import('child_process')
  const browser = await chromium.launch()

  // --- Step 1: Record the visual lyrics video ---
  console.log('Recording visual lyrics animation...')
  console.log(`  ${LYRICS_COUNT} lyrics x ${LYRIC_DURATION}s = ${LYRICS_COUNT * LYRIC_DURATION}s`)
  console.log(`  Fade to black at ${FADE_START.toFixed(1)}s, recording ${TOTAL_ANIM_S.toFixed(1)}s total`)

  const videoCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: OUT_DIR,
      size: { width: WIDTH, height: HEIGHT },
    },
  })

  const videoPage = await videoCtx.newPage()
  const animationHTML = buildVisualLyrics(imageDataMap)
  await videoPage.setContent(animationHTML, { waitUntil: 'load' })
  await videoPage.waitForTimeout(500)
  await videoPage.waitForTimeout(TOTAL_DURATION_MS)
  await videoPage.close()
  await videoCtx.close()

  // --- Step 2: Render CTA as a screenshot ---
  console.log('Rendering CTA screenshot...')
  const ctaCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
  })
  const ctaPage = await ctaCtx.newPage()
  const ctaImageData = {
    cta0: imageDataMap[CTA_PHOTOS[0].file],
    cta1: imageDataMap[CTA_PHOTOS[1].file],
    cta2: imageDataMap[CTA_PHOTOS[2].file],
  }
  await ctaPage.setContent(buildCTA(ctaImageData), { waitUntil: 'load' })
  await ctaPage.waitForTimeout(300)
  const ctaPath = path.join(OUT_DIR, 'cta_frame.png')
  await ctaPage.screenshot({ path: ctaPath })
  await ctaPage.close()
  await ctaCtx.close()
  await browser.close()

  // --- Step 3: Convert webm to mp4, concat with CTA still ---
  const videoFiles = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.webm'))
  if (videoFiles.length === 0) {
    console.error('No video file was generated!')
    return
  }

  const srcVideo = path.join(OUT_DIR, videoFiles[0])
  const animMp4 = path.join(OUT_DIR, 'animation_part.mp4')
  const ctaMp4 = path.join(OUT_DIR, 'cta_part.mp4')
  const finalMp4 = path.join(OUT_DIR, '01_spotify_lyrics.mp4')
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
    console.log('Rendered 01_spotify_lyrics.mp4 (animation + CTA)')
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
