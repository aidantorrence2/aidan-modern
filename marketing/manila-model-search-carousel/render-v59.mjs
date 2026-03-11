import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v59')

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

function readImage(name) {
  const buf = fs.readFileSync(path.join(IMAGE_DIR, name))
  return `data:image/jpeg;base64,${buf.toString('base64')}`
}

function writeSources(payload) {
  fs.writeFileSync(path.join(OUT_DIR, 'sources.json'), JSON.stringify(payload, null, 2))
}

// Cards: 5 images to cycle through the Tinder swipe stack
const CARD_PHOTOS = [
  { file: 'manila-gallery-purple-001.jpg', purple: true },
  { file: 'manila-gallery-purple-003.jpg', purple: true },
  { file: 'manila-gallery-purple-005.jpg', purple: true },
  { file: 'manila-gallery-closeup-001.jpg', purple: false },
  { file: 'manila-gallery-purple-006.jpg', purple: true },
]

// CTA photos (3 staggered)
const CTA_PHOTOS = [
  { file: 'manila-gallery-purple-001.jpg', purple: true },
  { file: 'manila-gallery-closeup-001.jpg', purple: false },
  { file: 'manila-gallery-purple-003.jpg', purple: true },
]

function buildTinderAnimation(images) {
  // Build card HTML for the stacked cards
  // Cards animate in sequence: card 0 swipes at ~2s, card 1 at ~5s, etc.
  // Last card (index 4) triggers "match" instead of swiping

  const cardW = WIDTH - 32  // 16px margin each side
  const cardH = 1200
  const cardTop = 120
  const cardLeft = 16

  const swipeTimes = [2, 5, 8, 11] // when each card starts swiping (cards 0-3)
  const swipeDuration = 0.8 // seconds per swipe animation
  const matchTime = 14 // when match screen appears (card 4)
  const fadeToBlackTime = 16.5

  // Build card layers — card 0 on top (highest z-index)
  // Cards 1-4 are revealed as cards above them swipe away
  const cardLayers = images.map((src, idx) => {
    const photo = CARD_PHOTOS[idx]
    const imgStyle = photo.purple
      ? `width:130%;height:130%;object-fit:cover;object-position:center center;display:block;margin:-15% 0 0 -15%;`
      : `width:100%;height:100%;object-fit:cover;object-position:center 20%;display:block;`

    const zIndex = 10 + (CARD_PHOTOS.length - idx) // card 0 = highest z
    const swipeIdx = swipeTimes.indexOf(swipeTimes[idx])

    let animCSS = ''
    if (idx < 4) {
      // This card swipes right
      animCSS = `animation: swipeRight${idx} ${swipeDuration}s cubic-bezier(0.4, 0.0, 0.2, 1) ${swipeTimes[idx]}s forwards;`
    }

    // Scale down effect for cards behind (they appear slightly smaller)
    const behindScale = idx === 0 ? 1 : 0.96
    const behindY = idx === 0 ? 0 : 8

    return `
      <!-- Card ${idx} -->
      <div class="card card-${idx}" style="
        position:absolute;
        left:${cardLeft}px;
        top:${cardTop + behindY}px;
        width:${cardW}px;
        height:${cardH}px;
        border-radius:12px;
        overflow:hidden;
        z-index:${zIndex};
        transform:scale(${behindScale});
        transform-origin:center bottom;
        ${animCSS}
      ">
        <!-- Photo fill -->
        <div style="position:absolute;inset:0;overflow:hidden;">
          <img src="${src}" style="${imgStyle}"/>
        </div>

        <!-- Bottom gradient overlay -->
        <div style="
          position:absolute;bottom:0;left:0;right:0;height:300px;
          background:linear-gradient(transparent, rgba(0,0,0,0.6));
        "></div>

        <!-- Card info text over gradient -->
        <div style="
          position:absolute;bottom:24px;left:24px;right:24px;
          z-index:2;
        ">
          <p style="
            font-family:${SF};
            font-size:28px;font-weight:700;color:#fff;margin:0;
          ">Manila Photo Shoot <span style="font-size:24px;">✨</span></p>
          <p style="
            font-family:${SF};
            font-size:16px;font-weight:400;color:rgba(255,255,255,0.85);margin:6px 0 0;
          ">Sign up below · @madebyaidan</p>
        </div>

        <!-- LIKE stamp (only on cards 0-3, appears just before swipe) -->
        ${idx < 4 ? `
        <div class="like-stamp like-stamp-${idx}" style="
          position:absolute;
          top:180px;left:60px;
          border:6px solid #00D478;
          border-radius:12px;
          padding:8px 28px;
          transform:rotate(-15deg) scale(2);
          opacity:0;
          z-index:5;
        ">
          <p style="
            font-family:${SF};
            font-size:52px;
            font-weight:900;
            color:#00D478;
            letter-spacing:0.08em;
            margin:0;
          ">LIKE</p>
        </div>
        ` : ''}
      </div>
    `
  }).join('\n')

  // Build swipe keyframes for each card
  let swipeKeyframes = ''
  for (let i = 0; i < 4; i++) {
    swipeKeyframes += `
      @keyframes swipeRight${i} {
        0% { transform: translateX(0) rotate(0deg); opacity: 1; }
        100% { transform: translateX(150%) rotate(25deg); opacity: 0; }
      }
      @keyframes likeStamp${i} {
        0% { opacity: 0; transform: rotate(-20deg) scale(2); }
        30% { opacity: 1; transform: rotate(-15deg) scale(1); }
        100% { opacity: 1; transform: rotate(-15deg) scale(1); }
      }
    `
  }

  // "Scale up" animation for cards behind as the card in front leaves
  let revealKeyframes = ''
  for (let i = 1; i < 5; i++) {
    const revealAt = swipeTimes[i - 1] // when the card above swipes away
    revealKeyframes += `
      @keyframes revealCard${i} {
        0% { transform: scale(0.96); }
        100% { transform: scale(1); }
      }
    `
  }

  // Like stamp timings — stamp appears 0.3s before the swipe
  let stampAnimations = ''
  for (let i = 0; i < 4; i++) {
    const stampAppear = swipeTimes[i] - 0.3
    stampAnimations += `
      .like-stamp-${i} {
        animation: likeStamp${i} 0.4s ease-out ${stampAppear}s forwards;
      }
    `
  }

  // Card reveal animations (scale up when previous card leaves)
  let revealAnimations = ''
  for (let i = 1; i < 5; i++) {
    const revealAt = swipeTimes[i - 1] + 0.2
    revealAnimations += `
      .card-${i} {
        animation:
          ${i < 4 ? `revealCard${i} 0.5s ease-out ${revealAt}s forwards,
          swipeRight${i} ${swipeDuration}s cubic-bezier(0.4, 0.0, 0.2, 1) ${swipeTimes[i]}s forwards` : `revealCard${i} 0.5s ease-out ${revealAt}s forwards`};
      }
    `
  }

  // Match screen overlay (appears at matchTime)
  const matchScreenHTML = `
    <div class="match-overlay" style="
      position:absolute;inset:0;
      background:rgba(0,0,0,0.85);
      backdrop-filter:blur(20px);
      -webkit-backdrop-filter:blur(20px);
      z-index:30;
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      opacity:0;
      pointer-events:none;
    ">
      <!-- It's a Match! gradient text -->
      <p style="
        font-family:${SF};
        font-size:60px;
        font-weight:700;
        background:linear-gradient(135deg, #FD267A, #FF6036);
        -webkit-background-clip:text;
        -webkit-text-fill-color:transparent;
        background-clip:text;
        margin:0 0 40px;
        letter-spacing:0.02em;
      ">It's a Match!</p>

      <!-- Profile pics side by side -->
      <div style="display:flex;align-items:center;gap:30px;margin:0 0 30px;">
        <div style="
          width:130px;height:130px;border-radius:50%;overflow:hidden;
          border:3px solid #FD267A;
        ">
          <img src="${images[4]}" style="width:130%;height:130%;object-fit:cover;object-position:center center;margin:-15% 0 0 -15%;"/>
        </div>
        <div style="
          width:130px;height:130px;border-radius:50%;overflow:hidden;
          border:3px solid #FD267A;
          background:#333;display:flex;align-items:center;justify-content:center;
        ">
          <!-- User avatar placeholder -->
          <svg width="60" height="60" viewBox="0 0 24 24" fill="rgba(255,255,255,0.4)">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </div>
      </div>

      <p style="
        font-family:${SF};
        font-size:20px;
        font-weight:400;
        color:rgba(255,255,255,0.7);
        text-align:center;
        margin:0 0 50px;
        padding:0 60px;
      ">You and Manila Photo Shoot have liked each other</p>

      <!-- Send a Message button -->
      <div style="
        background:linear-gradient(135deg, #FD267A, #FF6036);
        border-radius:30px;
        padding:18px 70px;
        margin:0 0 18px;
      ">
        <p style="
          font-family:${SF};
          font-size:22px;font-weight:700;color:#fff;margin:0;
          letter-spacing:0.04em;
        ">Send a Message</p>
      </div>

      <!-- Keep Swiping button -->
      <p style="
        font-family:${SF};
        font-size:18px;font-weight:500;
        color:rgba(255,255,255,0.5);
        margin:0;
      ">Keep Swiping</p>
    </div>
  `

  // Tinder top navigation bar
  const topNavHTML = `
    <div style="
      position:absolute;top:0;left:0;right:0;
      height:100px;
      display:flex;align-items:flex-end;justify-content:center;
      padding:0 0 12px;
      z-index:20;
    ">
      <!-- Tinder flame icon (SVG) -->
      <svg width="36" height="42" viewBox="0 0 24 24" fill="url(#tinderGrad)" style="margin:0 auto;">
        <defs>
          <linearGradient id="tinderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#FD267A"/>
            <stop offset="100%" style="stop-color:#FF6036"/>
          </linearGradient>
        </defs>
        <path d="M12.36 1.53c.14-.11.34-.07.42.09.6 1.16 1.64 3.44 1.12 5.88-.25 1.2-.85 2.22-1.52 3.04.15.04.3.04.45 0 1.28-.42 3.54-2.2 3.04-6.26-.03-.24.2-.42.42-.34 2.8 1.02 6.68 4.26 6.68 10.16C22.97 19.48 18.14 23 13 23c-5.8 0-10-3.76-10-9.36 0-4.26 2.6-7.42 5.14-9.26.18-.13.42-.01.42.22-.02 1.54.6 3.76 2.1 4.26.12.04.24-.02.3-.14.62-1.22 1.02-3.72 1.4-7.19z"/>
      </svg>
    </div>
  `

  // Bottom action buttons — 5 circular buttons
  const bottomButtonsHTML = `
    <div style="
      position:absolute;
      bottom:${SAFE_BOTTOM + 80}px;
      left:0;right:0;
      display:flex;
      justify-content:center;
      align-items:center;
      gap:18px;
      z-index:20;
    ">
      <!-- Rewind (small, gold) -->
      <div style="
        width:50px;height:50px;border-radius:50%;
        border:2px solid #F5B83D;
        display:flex;align-items:center;justify-content:center;
        background:rgba(17,17,17,0.5);
      ">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F5B83D" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
        </svg>
      </div>

      <!-- Nope X (large, red) -->
      <div style="
        width:66px;height:66px;border-radius:50%;
        border:2px solid #FF4458;
        display:flex;align-items:center;justify-content:center;
        background:rgba(17,17,17,0.5);
      ">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#FF4458" stroke-width="3" stroke-linecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </div>

      <!-- Super Like star (small, blue) -->
      <div style="
        width:50px;height:50px;border-radius:50%;
        border:2px solid #17A5F5;
        display:flex;align-items:center;justify-content:center;
        background:rgba(17,17,17,0.5);
      ">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#17A5F5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      </div>

      <!-- Like heart (large, green) -->
      <div style="
        width:66px;height:66px;border-radius:50%;
        border:2px solid #00D478;
        display:flex;align-items:center;justify-content:center;
        background:rgba(17,17,17,0.5);
      ">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="#00D478">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </div>

      <!-- Boost lightning (small, purple) -->
      <div style="
        width:50px;height:50px;border-radius:50%;
        border:2px solid #A14FF5;
        display:flex;align-items:center;justify-content:center;
        background:rgba(17,17,17,0.5);
      ">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#A14FF5">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
        </svg>
      </div>
    </div>
  `

  return `<!DOCTYPE html>
<html>
  <head>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      html, body { margin: 0; padding: 0; background: #111111; -webkit-font-smoothing: antialiased; }

      ${swipeKeyframes}
      ${revealKeyframes}
      ${stampAnimations}
      ${revealAnimations}

      @keyframes matchFadeIn {
        0% { opacity: 0; }
        100% { opacity: 1; }
      }

      @keyframes fadeToBlack {
        0% { opacity: 0; }
        100% { opacity: 1; }
      }

      @keyframes matchTextPop {
        0% { transform: scale(0.5); opacity: 0; }
        60% { transform: scale(1.1); opacity: 1; }
        100% { transform: scale(1); opacity: 1; }
      }
    </style>
  </head>
  <body>
    <div style="
      width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;
      background:#111111;
    ">

      ${topNavHTML}

      <!-- Card stack -->
      <div style="position:relative;z-index:5;width:100%;height:100%;">
        ${cardLayers}
      </div>

      ${bottomButtonsHTML}

      <!-- Match overlay -->
      ${matchScreenHTML}

      <!-- Fade to black -->
      <div style="
        position:absolute;inset:0;
        background:#000;z-index:50;
        pointer-events:none;
        opacity:0;
        animation:fadeToBlack 1s ease-out ${fadeToBlackTime}s forwards;
      "></div>
    </div>

    <script>
      // Trigger match overlay at the right time
      setTimeout(() => {
        const overlay = document.querySelector('.match-overlay')
        if (overlay) {
          overlay.style.transition = 'opacity 0.5s ease-out'
          overlay.style.opacity = '1'
        }
      }, ${matchTime * 1000})
    </script>
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

  const selection = {
    cardPhotos: CARD_PHOTOS.map(p => p.file),
    ctaPhotos: CTA_PHOTOS.map(p => p.file),
  }

  writeSources({
    createdAt: new Date().toISOString(),
    strategy: 'v59 — Tinder swipe UI animated ad with LIKE stamps, card swipes, match screen',
    safeBottomPixels: SAFE_BOTTOM,
    images: selection,
  })

  // Load card images
  const cardImageData = CARD_PHOTOS.map(p => readImage(p.file))
  // Load CTA images
  const ctaImageData = {
    cta0: readImage(CTA_PHOTOS[0].file),
    cta1: readImage(CTA_PHOTOS[1].file),
    cta2: readImage(CTA_PHOTOS[2].file),
  }

  const { execSync } = await import('child_process')
  const browser = await chromium.launch()

  // --- Step 1: Record the Tinder animation video ---
  console.log('Recording Tinder swipe animation...')

  const videoCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: OUT_DIR,
      size: { width: WIDTH, height: HEIGHT },
    },
  })

  const videoPage = await videoCtx.newPage()
  const animationHTML = buildTinderAnimation(cardImageData)
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
  const finalMp4 = path.join(OUT_DIR, '01_tinder_swipe.mp4')
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
    console.log('Rendered 01_tinder_swipe.mp4 (animation + CTA)')
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
