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

// 10 lyrics x 2.7s = 27s + 0.5s initial pause = 27.5s, hold last lyric 3s extra
const INITIAL_PAUSE = 0.5
const LYRIC_DURATION = 2.7  // seconds per lyric
const LYRICS_COUNT = 10
const LAST_HOLD = 3.0  // extra hold on final lyric
const TOTAL_ANIM_S = INITIAL_PAUSE + LYRICS_COUNT * LYRIC_DURATION + LAST_HOLD // ~30.5s
const TOTAL_DURATION_MS = Math.ceil(TOTAL_ANIM_S * 1000)

const LYRICS = [
  { text: 'she DM\'d me out of nowhere', photo: 'manila-gallery-purple-001.jpg', purple: true },
  { text: 'said she wanted to shoot in Manila', photo: 'manila-gallery-purple-003.jpg', purple: true },
  { text: 'she\'d never modeled before', photo: 'manila-gallery-purple-005.jpg', purple: true },
  { text: 'I said just show up', photo: 'manila-gallery-garden-001.jpg', purple: false },
  { text: 'I\'ll direct everything', photo: 'manila-gallery-purple-006.jpg', purple: true },
  { text: 'these are the photos', photo: 'manila-gallery-purple-002.jpg', purple: true },
  { text: 'from a single afternoon', photo: 'manila-gallery-purple-004.jpg', purple: true },
  { text: 'sign up below', photo: 'manila-gallery-purple-001.jpg', purple: true, cta: true },
  { text: '60-second form', photo: 'manila-gallery-purple-003.jpg', purple: true, cta: true },
  { text: 'limited spots this month', photo: 'manila-gallery-purple-005.jpg', purple: true, cta: true },
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
  const ANIM_TOTAL = TOTAL_ANIM_S
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
      // Last photo stays until the end
      photoKeyframes += `
        @keyframes photo${i} {
          0%, ${pct(start - CROSSFADE)}% { opacity:0; transform:scale(1); }
          ${pct(start)}% { opacity:1; transform:scale(1); }
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
    const isLast = i === LYRICS.length - 1
    const isCta = lyric.cta

    // CTA lyrics get slightly different styling
    const fontSize = isCta ? '64px' : '72px'
    const fontWeight = isCta ? '700' : '800'
    const color = isCta && i === 7 ? MANILA_COLOR : '#fff' // "sign up below" in red

    lyricHTML += `
      <div class="lyric-text lyric-${i}" style="
        position:absolute;
        left:60px;right:60px;
        top:50%;transform:translateY(-50%) translateY(10px);
        font-family:${SF};
        font-size:${fontSize};
        font-weight:${fontWeight};
        color:${color};
        line-height:1.15;
        text-align:center;
        opacity:0;
        text-shadow:0 4px 30px rgba(0,0,0,0.8), 0 0 60px rgba(0,0,0,0.5);
      ">${lyric.text}</div>
    `

    if (isLast) {
      // Last lyric stays visible until end
      lyricKeyframes += `
        @keyframes lyric${i} {
          0%, ${pct(start)}% {
            opacity:0; transform:translateY(-50%) translateY(10px);
          }
          ${pct(start + LYRIC_FADE_IN)}% {
            opacity:1; transform:translateY(-50%) translateY(0);
          }
          100% {
            opacity:1; transform:translateY(-50%) translateY(0);
          }
        }
      `
    } else {
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
    }
  })

  // Progress bar: song is 3:27 = 207s, we show ~24s of progress starting at 0:24
  const songTotalS = 207
  const songStartS = 24
  const progressStartPct = (songStartS / songTotalS * 100).toFixed(1)
  const progressEndPct = ((songStartS + TOTAL_ANIM_S) / songTotalS * 100).toFixed(1)

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

    /* Timestamp update */
    @keyframes timestampTick {
      0% { content: "${timeStart}"; }
      100% { content: "${formatTime(songStartS + TOTAL_ANIM_S)}"; }
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
          animation:progressFill ${TOTAL_ANIM_S}s linear forwards;
        "></div>
      </div>
      <!-- Timestamps -->
      <div style="display:flex;justify-content:space-between;margin-top:6px;">
        <p id="timeElapsed" style="font-family:${SF};font-size:11px;font-weight:400;color:rgba(255,255,255,0.5);margin:0;text-shadow:0 1px 4px rgba(0,0,0,0.5);">${timeStart}</p>
        <p style="font-family:${SF};font-size:11px;font-weight:400;color:rgba(255,255,255,0.5);margin:0;text-shadow:0 1px 4px rgba(0,0,0,0.5);">${timeEnd}</p>
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

async function render() {
  resetOutputDir()

  // Collect unique photos needed
  const uniquePhotos = new Set()
  LYRICS.forEach(l => uniquePhotos.add(l.photo))

  const imageDataMap = {}
  for (const photoFile of uniquePhotos) {
    imageDataMap[photoFile] = readImage(photoFile)
  }

  writeSources({
    createdAt: new Date().toISOString(),
    strategy: 'v60 — Full-screen photo backgrounds with HUGE story-driven lyrics, Spotify overlay, natural CTA ending',
    safeBottomPixels: SAFE_BOTTOM,
    lyrics: LYRICS.map(l => l.text),
    images: {
      lyricPhotos: LYRICS.map(l => l.photo),
    },
    timing: {
      lyricDuration: LYRIC_DURATION,
      totalLyrics: LYRICS_COUNT,
      lastHold: LAST_HOLD,
      totalRecording: TOTAL_ANIM_S,
    },
  })

  const { execSync } = await import('child_process')
  const browser = await chromium.launch()

  // --- Record the visual lyrics video (CTA integrated as final lyrics) ---
  console.log('Recording visual lyrics animation...')
  console.log(`  ${LYRICS_COUNT} lyrics x ${LYRIC_DURATION}s + ${LAST_HOLD}s hold = ${TOTAL_ANIM_S.toFixed(1)}s total`)

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
  await browser.close()

  // --- Convert webm to mp4 (single file, no concat) ---
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
