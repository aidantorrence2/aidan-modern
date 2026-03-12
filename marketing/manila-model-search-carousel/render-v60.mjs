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

/* ── Clean photos only (no purple film borders) ── */
const PHOTOS = [
  'manila-gallery-garden-001.jpg',
  'manila-gallery-dsc-0075.jpg',
  'manila-gallery-dsc-0190.jpg',
  'manila-gallery-night-001.jpg',
  'manila-gallery-canal-001.jpg',
  'manila-gallery-ivy-001.jpg',
  'manila-gallery-street-001.jpg',
  'manila-gallery-urban-001.jpg',
]

/* ── Lyrics with individual timing ── */
const LYRICS = [
  { text: 'she messaged me on Instagram',   dur: 2.5 },
  { text: 'said she wanted photos in Manila', dur: 2.5 },
  { text: "she'd never done a shoot before", dur: 2.5 },
  { text: "I said don't worry",              dur: 2.0 },
  { text: 'just show up \u2014 I direct everything', dur: 2.5 },
  { text: "BGC, Makati? we'll make it happen", dur: 2.5 },
  { text: 'from stranger to supermodel',      dur: 4.0 }, // hold + fast photo cycle
  { text: 'interested?',                    dur: 2.5, cta: true },
  { text: 'message me to get started',       dur: 3.0, cta: true, last: true },
]

// Compute cumulative start times
let _t = 0
const LYRIC_TIMES = LYRICS.map(l => { const s = _t; _t += l.dur; return s })
const TOTAL_DURATION = _t // ~24s
const TOTAL_DURATION_MS = Math.ceil(TOTAL_DURATION * 1000) + 2000 // 2s buffer for recording

/* ── Helpers ── */
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

/* ── Build the full HTML page ── */
function buildHTML(imageDataMap) {
  const pct = (s) => ((s / TOTAL_DURATION) * 100).toFixed(3)

  // ── Background photo crossfade keyframes ──
  // Normal: crossfade every ~3s. During "and this is what we got" (lyric 6), cycle every 1s.
  // We pre-assign photos to time slots.
  const NORMAL_INTERVAL = 3.0
  const FAST_INTERVAL = 1.0
  const lyric6Start = LYRIC_TIMES[6]
  const lyric6End = lyric6Start + LYRICS[6].dur

  // Build photo schedule: [{start, end, photo}]
  const photoSchedule = []
  let t = 0
  let photoIdx = 0
  while (t < TOTAL_DURATION) {
    const isFastZone = t >= lyric6Start && t < lyric6End
    const interval = isFastZone ? FAST_INTERVAL : NORMAL_INTERVAL
    const end = Math.min(t + interval, TOTAL_DURATION)
    photoSchedule.push({ start: t, end, photo: PHOTOS[photoIdx % PHOTOS.length] })
    photoIdx++
    t = end
  }

  // Each photo layer gets opacity keyframes
  const FADE = 0.5
  let bgHTML = ''
  let bgCSS = ''
  photoSchedule.forEach((slot, i) => {
    const src = imageDataMap[slot.photo]
    bgHTML += `<div class="bg bg-${i}" style="background-image:url('${src}')"></div>\n`

    // Build keyframe: opacity 0 -> 1 at start, 1 -> 0 at end
    const fadeInStart = Math.max(0, slot.start - FADE)
    const fadeOutEnd = Math.min(TOTAL_DURATION, slot.end + FADE)
    const isLast = i === photoSchedule.length - 1

    bgCSS += `
      @keyframes bg${i} {
        0%, ${pct(fadeInStart)}% { opacity: 0; }
        ${pct(slot.start)}% { opacity: 1; }
        ${pct(slot.end)}% { opacity: 1; }
        ${isLast ? `100% { opacity: 1; }` : `${pct(fadeOutEnd)}% { opacity: 0; } 100% { opacity: 0; }`}
      }
      .bg-${i} { animation: bg${i} ${TOTAL_DURATION}s linear forwards; }
    `
  })

  // ── Lyrics area ──
  // We show a vertical stack of lyric lines. Each line appears at its start time,
  // the active line is bright/large, previous lines dim, and the whole block scrolls up.
  // We use CSS keyframes for each line's state transitions.
  const LYRICS_TOP = 200 // top of lyrics area
  const LYRICS_BOTTOM = HEIGHT - SAFE_BOTTOM // bottom of lyrics area
  const LINE_HEIGHT_ACTIVE = 90 // px spacing for active line
  const LINE_HEIGHT_INACTIVE = 75
  const ACTIVE_Y = 500 // vertical position of the active line (from top of lyrics area)

  // Each lyric line: starts invisible, becomes active (bright, large) at its time,
  // then dims and slides up as subsequent lyrics appear.
  let lyricsHTML = ''
  let lyricsCSS = ''

  LYRICS.forEach((lyric, i) => {
    const startT = LYRIC_TIMES[i]
    const isCta = lyric.cta
    const isLast = lyric.last
    const color = isCta ? MANILA_COLOR : '#fff'

    lyricsHTML += `<div class="lyric lyric-${i}" style="color:${color}">${lyric.text}</div>\n`

    // Build keyframe for this lyric:
    // Before its time: opacity 0, translateY at waiting position (below active)
    // At its time: opacity 1, large font, at ACTIVE_Y
    // After next lyric starts: dim, smaller, slide up
    // Each subsequent lyric pushes this one up by LINE_HEIGHT_INACTIVE

    let kf = ''
    const fadeIn = 0.3

    // Phase 1: invisible until just before activation
    kf += `0%, ${pct(Math.max(0, startT - fadeIn))}% {
      opacity: 0;
      font-size: 56px;
      font-weight: 600;
      transform: translateY(${ACTIVE_Y + 30}px);
      color: ${color};
    }\n`

    // Phase 2: active — bright and large
    kf += `${pct(startT + fadeIn)}% {
      opacity: 1;
      font-size: 68px;
      font-weight: 800;
      transform: translateY(${ACTIVE_Y}px);
      color: ${color};
      text-shadow: 0 0 40px rgba(255,255,255,0.3), 0 4px 20px rgba(0,0,0,0.8);
    }\n`

    if (!isLast) {
      // Phase 3: when next lyric activates, this one dims and moves up
      const nextStart = LYRIC_TIMES[i + 1]
      const dimStart = nextStart - fadeIn
      const dimEnd = nextStart + fadeIn

      kf += `${pct(dimStart)}% {
        opacity: 1;
        font-size: 68px;
        font-weight: 800;
        transform: translateY(${ACTIVE_Y}px);
      }\n`

      // Calculate how far up to slide: each subsequent lyric pushes this up
      let yOffset = ACTIVE_Y
      for (let j = i + 1; j < LYRICS.length; j++) {
        const jStart = LYRIC_TIMES[j]
        const jFade = jStart + fadeIn
        yOffset -= LINE_HEIGHT_INACTIVE

        // If this lyric would go off-screen (above lyrics top), fade it out
        if (yOffset < -50) {
          kf += `${pct(jFade)}% {
            opacity: 0;
            font-size: 56px;
            font-weight: 600;
            transform: translateY(${yOffset + LINE_HEIGHT_INACTIVE}px);
          }\n`
          break
        }

        const opacity = Math.max(0.15, 0.25 - (j - i - 1) * 0.05)
        kf += `${pct(jFade)}% {
          opacity: ${opacity.toFixed(2)};
          font-size: 56px;
          font-weight: 600;
          transform: translateY(${yOffset}px);
        }\n`
      }
    }

    // End state
    if (isLast) {
      kf += `100% {
        opacity: 1;
        font-size: 68px;
        font-weight: 800;
        transform: translateY(${ACTIVE_Y}px);
        color: ${color};
        text-shadow: 0 0 40px rgba(255,255,255,0.3), 0 4px 20px rgba(0,0,0,0.8);
      }\n`
    } else {
      // Keep wherever we ended up
      const finalY = ACTIVE_Y - (LYRICS.length - 1 - i) * LINE_HEIGHT_INACTIVE
      kf += `100% {
        opacity: ${finalY < -50 ? 0 : 0.15};
        font-size: 56px;
        font-weight: 600;
        transform: translateY(${Math.max(finalY, -100)}px);
      }\n`
    }

    lyricsCSS += `
      @keyframes lyric${i} { ${kf} }
      .lyric-${i} { animation: lyric${i} ${TOTAL_DURATION}s linear forwards; }
    `
  })

  // ── Progress bar timing ──
  const songTotalS = 207 // 3:27 song
  const songStartS = 24
  const progressStartPct = (songStartS / songTotalS * 100).toFixed(1)
  const progressEndPct = ((songStartS + TOTAL_DURATION) / songTotalS * 100).toFixed(1)
  const formatTime = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
  const timeStart = formatTime(songStartS)
  const timeEnd = formatTime(songTotalS)

  // Album art thumbnail (first clean photo)
  const albumArtSrc = imageDataMap[PHOTOS[0]]

  return `<!DOCTYPE html>
<html>
<head>
<style>
  * { box-sizing:border-box; margin:0; padding:0; }
  html, body {
    margin:0; padding:0; background:#000;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  #root {
    width: ${WIDTH}px;
    height: ${HEIGHT}px;
    position: relative;
    overflow: hidden;
    background: #000;
  }

  /* ── Background photos ── */
  .bg {
    position: absolute;
    inset: 0;
    background-size: cover;
    background-position: center 20%;
    opacity: 0;
    filter: brightness(0.35) saturate(1.1);
    transform: scale(1.05);
  }

  ${bgCSS}

  /* ── Lyrics container ── */
  .lyrics-container {
    position: absolute;
    left: 50px;
    right: 50px;
    top: ${LYRICS_TOP}px;
    bottom: ${SAFE_BOTTOM + 160}px;
    z-index: 10;
    overflow: hidden;
  }

  .lyric {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    font-family: ${SF};
    font-size: 56px;
    font-weight: 600;
    color: #fff;
    line-height: 1.15;
    text-align: left;
    opacity: 0;
    text-shadow: 0 4px 20px rgba(0,0,0,0.8);
    will-change: transform, opacity, font-size;
  }

  ${lyricsCSS}

  /* ── Now Playing bar ── */
  .now-playing {
    position: absolute;
    left: 36px;
    right: 36px;
    bottom: ${SAFE_BOTTOM + 20}px;
    z-index: 20;
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .album-art {
    width: 120px;
    height: 120px;
    border-radius: 12px;
    overflow: hidden;
    flex-shrink: 0;
    box-shadow: 0 4px 20px rgba(0,0,0,0.5);
  }

  .album-art img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .song-info {
    flex: 1;
    min-width: 0;
  }

  .song-title {
    font-family: ${SF};
    font-size: 42px;
    font-weight: 700;
    color: #fff;
    margin: 0;
    text-shadow: 0 2px 10px rgba(0,0,0,0.6);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .song-artist {
    font-family: ${SF};
    font-size: 32px;
    font-weight: 400;
    color: rgba(255,255,255,0.7);
    margin: 6px 0 0;
    text-shadow: 0 2px 8px rgba(0,0,0,0.5);
  }

  /* ── Progress bar ── */
  .progress-container {
    position: absolute;
    left: 36px;
    right: 36px;
    bottom: ${SAFE_BOTTOM + 160}px;
    z-index: 20;
  }

  .progress-track {
    width: 100%;
    height: 6px;
    background: rgba(255,255,255,0.2);
    border-radius: 2px;
    position: relative;
  }

  .progress-fill {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    background: ${SPOTIFY_GREEN};
    border-radius: 2px;
    width: ${progressStartPct}%;
    animation: progressFill ${TOTAL_DURATION}s linear forwards;
  }

  .progress-dot {
    position: absolute;
    top: 50%;
    right: -7px;
    transform: translateY(-50%);
    width: 14px;
    height: 14px;
    background: #fff;
    border-radius: 50%;
  }

  @keyframes progressFill {
    0% { width: ${progressStartPct}%; }
    100% { width: ${progressEndPct}%; }
  }

  .timestamps {
    display: flex;
    justify-content: space-between;
    margin-top: 8px;
  }

  .timestamp {
    font-family: ${SF};
    font-size: 28px;
    font-weight: 400;
    color: rgba(255,255,255,0.5);
    text-shadow: 0 1px 4px rgba(0,0,0,0.5);
  }
</style>
</head>
<body>
  <div id="root">

    <!-- Background photos -->
    ${bgHTML}

    <!-- Lyrics area -->
    <div class="lyrics-container">
      ${lyricsHTML}
    </div>

    <!-- Progress bar -->
    <div class="progress-container">
      <div class="progress-track">
        <div class="progress-fill">
          <div class="progress-dot"></div>
        </div>
      </div>
      <div class="timestamps">
        <span class="timestamp" id="timeElapsed">${timeStart}</span>
        <span class="timestamp">${timeEnd}</span>
      </div>
    </div>

    <!-- Now Playing bar -->
    <div class="now-playing">
      <div class="album-art">
        <img src="${albumArtSrc}" alt="Album art" />
      </div>
      <div class="song-info">
        <p class="song-title">Manila Photo Shoot</p>
        <p class="song-artist">madebyaidan</p>
      </div>
    </div>

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

/* ── Main render function ── */
async function render() {
  resetOutputDir()

  // Load all photos as base64 data URIs
  const imageDataMap = {}
  for (const photo of PHOTOS) {
    imageDataMap[photo] = readImage(photo)
  }

  writeSources({
    createdAt: new Date().toISOString(),
    strategy: 'v60 rebuild — Spotify full-screen lyrics with scrolling active line, clean photos only',
    safeBottomPixels: SAFE_BOTTOM,
    lyrics: LYRICS.map(l => l.text),
    photos: PHOTOS,
    timing: {
      lyrics: LYRICS.map((l, i) => ({ text: l.text, start: LYRIC_TIMES[i], dur: l.dur })),
      totalDuration: TOTAL_DURATION,
    },
  })

  const { execSync } = await import('child_process')
  const browser = await chromium.launch()

  console.log('Recording Spotify full-screen lyrics animation...')
  console.log(`  ${LYRICS.length} lyrics, total duration: ${TOTAL_DURATION}s`)
  console.log(`  Recording for ${TOTAL_DURATION_MS}ms`)

  const videoCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: OUT_DIR,
      size: { width: WIDTH, height: HEIGHT },
    },
  })

  const videoPage = await videoCtx.newPage()

  // Set background to black BEFORE loading content to prevent white flash
  await videoPage.evaluate(() => {
    document.documentElement.style.background = '#000'
    document.body.style.background = '#000'
  })

  const html = buildHTML(imageDataMap)
  await videoPage.setContent(html, { waitUntil: 'load' })

  // No initial wait — go straight into recording
  await videoPage.waitForTimeout(TOTAL_DURATION_MS)

  await videoPage.close()
  await videoCtx.close()
  await browser.close()

  // Convert webm to mp4
  const videoFiles = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.webm'))
  if (videoFiles.length === 0) {
    console.error('No video file was generated!')
    return
  }

  const srcVideo = path.join(OUT_DIR, videoFiles[0])
  const finalMp4 = path.join(OUT_DIR, '01_spotify_lyrics.mp4')

  try {
    execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${finalMp4}"`, { stdio: 'pipe' })
    fs.unlinkSync(srcVideo)
    console.log('Rendered 01_spotify_lyrics.mp4')
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
