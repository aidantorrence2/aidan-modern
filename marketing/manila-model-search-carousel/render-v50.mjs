import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v50')

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 410

const SF = "-apple-system, 'Helvetica Neue', Arial, sans-serif"
const MANILA_COLOR = '#E8443A'

const DARK_BG = '#111111'
const CARD_BG = '#1C1C1E'
const CARD_RADIUS = 16
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

// Purple dress photos need crop treatment: 130% scale, -15% margin, overflow hidden
const PURPLE_PHOTOS = [
  'manila-gallery-purple-001.jpg',
  'manila-gallery-purple-002.jpg',
  'manila-gallery-purple-003.jpg',
  'manila-gallery-purple-004.jpg',
  'manila-gallery-purple-005.jpg',
]

const CARD_IMAGES = [
  'manila-gallery-purple-002.jpg',   // purple - card 1
  'manila-gallery-graffiti-001.jpg',  // non-purple - card 2
  'manila-gallery-purple-004.jpg',    // purple - card 3
  'manila-gallery-garden-001.jpg',    // non-purple - card 4
  'manila-gallery-purple-001.jpg',    // purple - card 5
]

const CTA_IMAGES = [
  'manila-gallery-dsc-0075.jpg',
  'manila-gallery-floor-001.jpg',
  'manila-gallery-ivy-001.jpg',
]

function isPurple(name) {
  return PURPLE_PHOTOS.includes(name)
}

function imageStyle(name) {
  if (isPurple(name)) {
    return 'width:130%;height:130%;object-fit:cover;object-position:center;margin:-15% 0 0 -15%;display:block;'
  }
  return 'width:100%;height:100%;object-fit:cover;object-position:center top;display:block;'
}

const p = (t) => ((t / TOTAL_DURATION) * 100).toFixed(1)

// Each card: appear at startTime, pause 1.5s, swipe right with rotation
// Card timing: card appears, stays 1.5s, swipes out over 0.5s, next card appears
// Cards are stacked, each one on top; we animate them swiping right to reveal the one below

function buildAnimated(images) {
  // Card timing (seconds):
  // Card 5 (bottom) is always visible
  // Card 4 sits on top of 5, card 3 on top of 4, etc.
  // Card 1 (top): visible at 0.5s, swipes at 2.5s
  // Card 2: revealed at 3s, swipes at 5s
  // Card 3: revealed at 5.5s, swipes at 7.5s
  // Card 4: revealed at 8s, swipes at 10s
  // Card 5: revealed at 10.5s, stays until match screen
  // Match screen: 12.5s -> fade to black at 16s

  const cardTimings = [
    { appear: 0.3, swipeStart: 2.8 },   // card 1
    { appear: 3.3, swipeStart: 5.8 },   // card 2
    { appear: 6.3, swipeStart: 8.8 },   // card 3
    { appear: 9.3, swipeStart: 11.5 },  // card 4
    { appear: 11.5, swipeStart: null },  // card 5 (no swipe, stays)
  ]

  // Generate card keyframes
  let cardKeyframes = ''
  let cardDivs = ''

  for (let i = 0; i < 5; i++) {
    const t = cardTimings[i]
    const name = `card${i}`
    const imgSrc = images[`card${i}`]
    const imgName = CARD_IMAGES[i]

    if (t.swipeStart !== null) {
      // Card appears, stays, then swipes right with rotation
      const swipeEnd = t.swipeStart + 0.5
      cardKeyframes += `
        @keyframes ${name}Anim {
          0% { opacity: 0; transform: scale(0.92) translateX(0) rotate(0deg); }
          ${p(t.appear)}% { opacity: 0; transform: scale(0.92) translateX(0) rotate(0deg); }
          ${p(t.appear + 0.3)}% { opacity: 1; transform: scale(1) translateX(0) rotate(0deg); }
          ${p(t.swipeStart)}% { opacity: 1; transform: scale(1) translateX(0) rotate(0deg); }
          ${p(swipeEnd)}% { opacity: 0; transform: scale(1) translateX(${WIDTH + 200}px) rotate(18deg); }
          100% { opacity: 0; transform: translateX(${WIDTH + 200}px) rotate(18deg); }
        }
      `
    } else {
      // Last card: appears and stays
      cardKeyframes += `
        @keyframes ${name}Anim {
          0% { opacity: 0; transform: scale(0.92); }
          ${p(t.appear)}% { opacity: 0; transform: scale(0.92); }
          ${p(t.appear + 0.3)}% { opacity: 1; transform: scale(1); }
          ${p(12.5)}% { opacity: 1; transform: scale(1); }
          ${p(12.8)}% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 0; }
        }
      `
    }

    // Green heart icon on swipe (only for cards that swipe)
    const heartId = `heart${i}`
    let heartKeyframes = ''
    let heartDiv = ''
    if (t.swipeStart !== null) {
      const heartAppear = t.swipeStart - 0.2
      const heartDisappear = t.swipeStart + 0.6
      heartKeyframes = `
        @keyframes ${heartId}Anim {
          0% { opacity: 0; transform: scale(0); }
          ${p(heartAppear)}% { opacity: 0; transform: scale(0); }
          ${p(heartAppear + 0.15)}% { opacity: 1; transform: scale(1.3); }
          ${p(heartAppear + 0.3)}% { opacity: 1; transform: scale(1); }
          ${p(heartDisappear)}% { opacity: 0; transform: scale(0.5); }
          100% { opacity: 0; }
        }
      `
      cardKeyframes += heartKeyframes
      heartDiv = `
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:${15 - i};opacity:0;animation:${heartId}Anim ${TOTAL_DURATION}s ease-out forwards;pointer-events:none;">
          <div style="width:120px;height:120px;border-radius:50%;background:rgba(52,199,89,0.9);display:flex;align-items:center;justify-content:center;box-shadow:0 0 40px rgba(52,199,89,0.5);">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="white"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          </div>
        </div>
      `
    }

    // Card content
    const photoHeight = '75%'
    const cardContent = `
      <div style="position:absolute;left:50%;top:40%;transform:translate(-50%,-50%);width:720px;height:960px;z-index:${10 - i};opacity:0;animation:${name}Anim ${TOTAL_DURATION}s ease-out forwards;">
        <div style="width:100%;height:100%;background:#fff;border-radius:${CARD_RADIUS}px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.5);">
          <!-- Photo area -->
          <div style="width:100%;height:${photoHeight};overflow:hidden;position:relative;">
            <img src="${imgSrc}" style="${imageStyle(imgName)}"/>
          </div>
          <!-- Info area -->
          <div style="padding:20px 28px;">
            <div style="display:flex;align-items:baseline;gap:14px;">
              <span style="font-family:${SF};font-size:36px;font-weight:700;color:#111;">Manila Model Search</span>
            </div>
            <p style="font-family:${SF};font-size:24px;color:#666;margin:8px 0 0;">Sign up below</p>
          </div>
        </div>
      </div>
      ${heartDiv}
    `
    cardDivs += cardContent
  }

  // "It's a Match!" screen — appears at 12.5s
  const matchAppear = 12.5
  const fadeToBlack = 16
  const matchKeyframes = `
    @keyframes matchBg {
      0% { opacity: 0; }
      ${p(matchAppear)}% { opacity: 0; }
      ${p(matchAppear + 0.3)}% { opacity: 1; }
      ${p(fadeToBlack)}% { opacity: 1; }
      ${p(fadeToBlack + 0.5)}% { opacity: 1; background: #000; }
      100% { opacity: 1; background: #000; }
    }
    @keyframes matchTextIn {
      0% { opacity: 0; transform: scale(0.7); }
      ${p(matchAppear + 0.2)}% { opacity: 0; transform: scale(0.7); }
      ${p(matchAppear + 0.7)}% { opacity: 1; transform: scale(1.05); }
      ${p(matchAppear + 1)}% { opacity: 1; transform: scale(1); }
      ${p(fadeToBlack)}% { opacity: 1; }
      ${p(fadeToBlack + 0.5)}% { opacity: 0; }
      100% { opacity: 0; }
    }
    @keyframes matchSubIn {
      0% { opacity: 0; transform: translateY(20px); }
      ${p(matchAppear + 0.8)}% { opacity: 0; transform: translateY(20px); }
      ${p(matchAppear + 1.3)}% { opacity: 1; transform: translateY(0); }
      ${p(fadeToBlack)}% { opacity: 1; }
      ${p(fadeToBlack + 0.5)}% { opacity: 0; }
      100% { opacity: 0; }
    }
  `

  // Confetti-like elements
  let confettiDivs = ''
  const confettiColors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#FF8E53', '#A78BFA', '#34D399', '#F472B6', '#60A5FA']
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * WIDTH
    const delay = matchAppear + 0.3 + Math.random() * 0.8
    const dur = 1.5 + Math.random() * 1.5
    const color = confettiColors[i % confettiColors.length]
    const size = 8 + Math.random() * 14
    const rotation = Math.random() * 360
    const driftX = (Math.random() - 0.5) * 200
    const animName = `confetti${i}`

    cardKeyframes += `
      @keyframes ${animName} {
        0% { opacity: 0; transform: translateY(-40px) translateX(0) rotate(0deg); }
        ${p(delay)}% { opacity: 0; transform: translateY(-40px) translateX(0) rotate(0deg); }
        ${p(delay + 0.1)}% { opacity: 1; transform: translateY(0) translateX(0) rotate(${rotation}deg); }
        ${p(delay + dur)}% { opacity: 0; transform: translateY(${600 + Math.random() * 400}px) translateX(${driftX}px) rotate(${rotation + 360}deg); }
        100% { opacity: 0; }
      }
    `
    confettiDivs += `<div style="position:absolute;left:${x}px;top:${80 + Math.random() * 200}px;width:${size}px;height:${size * (0.4 + Math.random() * 0.6)}px;background:${color};border-radius:2px;opacity:0;animation:${animName} ${TOTAL_DURATION}s linear forwards;z-index:52;"></div>`
  }

  return `<!DOCTYPE html>
<html>
  <head>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      html, body { margin: 0; padding: 0; background: ${DARK_BG}; -webkit-font-smoothing: antialiased; }
      ${cardKeyframes}
      ${matchKeyframes}
    </style>
  </head>
  <body>
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${DARK_BG};">

      <!-- Status bar -->
      <div style="position:absolute;left:0;right:0;top:0;height:54px;padding:14px 32px 0;display:flex;align-items:center;justify-content:space-between;z-index:60;">
        <span style="font-family:${SF};font-size:20px;font-weight:600;color:#fff;">9:41</span>
        <div style="display:flex;align-items:center;gap:6px;">
          <svg width="20" height="14" viewBox="0 0 18 12"><rect x="0" y="3" width="3" height="9" rx="1" fill="#fff"/><rect x="5" y="2" width="3" height="10" rx="1" fill="#fff"/><rect x="10" y="0" width="3" height="12" rx="1" fill="#fff"/><rect x="15" y="0" width="3" height="12" rx="1" fill="#fff" opacity="0.3"/></svg>
          <svg width="30" height="15" viewBox="0 0 27 13"><rect x="0" y="0" width="23" height="13" rx="3.5" stroke="#fff" stroke-width="1" fill="none"/><rect x="2" y="2" width="18" height="9" rx="2" fill="#fff"/></svg>
        </div>
      </div>

      <!-- App header bar -->
      <div style="position:absolute;left:0;right:0;top:54px;height:70px;display:flex;align-items:center;justify-content:center;z-index:55;background:${DARK_BG};">
        <!-- Flame icon -->
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" style="margin-right:10px;">
          <path d="M12 23c-4.97 0-9-3.58-9-8 0-3.19 2.13-6.04 4-8 0 0 1 3 3 4 0-5 3-8 6-10 0 3 2 5 3 6 1.5-1 2-3 2-3 1.87 1.96 3 4.81 3 7 0 4.42-4.03 8-9 8h-3z" fill="${MANILA_COLOR}"/>
          <path d="M12 23c-2.21 0-4-1.79-4-4 0-1.5 1-3 2-4 .5 1.5 1.5 2 1.5 2s1-2 2-3c.5 1 1 1.5 1.5 2 .5-.5 1-1.5 1-1.5.93.96 1 2.5 1 3.5 0 2.21-1.79 4-4 4h-1z" fill="#FF9500"/>
        </svg>
        <span style="font-family:${SF};font-size:32px;font-weight:800;color:${MANILA_COLOR};letter-spacing:0.02em;">manila</span>
      </div>

      <!-- Card stack area -->
      <div style="position:absolute;left:0;right:0;top:140px;bottom:${SAFE_BOTTOM}px;overflow:hidden;">
        <!-- Nope / Like labels at bottom of card area -->
        <div style="position:absolute;bottom:40px;left:0;right:0;display:flex;justify-content:center;gap:80px;z-index:2;">
          <!-- X button -->
          <div style="width:70px;height:70px;border-radius:50%;border:3px solid #FF3B30;display:flex;align-items:center;justify-content:center;">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="#FF3B30" stroke-width="3" stroke-linecap="round"/></svg>
          </div>
          <!-- Star button -->
          <div style="width:56px;height:56px;border-radius:50%;border:3px solid #007AFF;display:flex;align-items:center;justify-content:center;margin-top:7px;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#007AFF"/></svg>
          </div>
          <!-- Heart button -->
          <div style="width:70px;height:70px;border-radius:50%;border:3px solid #34C759;display:flex;align-items:center;justify-content:center;">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="#34C759"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          </div>
        </div>

        <!-- Cards (stacked, bottom card rendered first) -->
        ${cardDivs}
      </div>

      <!-- "It's a Match!" overlay -->
      <div style="position:absolute;inset:0;z-index:50;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;animation:matchBg ${TOTAL_DURATION}s ease-out forwards;background:linear-gradient(180deg, rgba(232,68,58,0.15) 0%, ${DARK_BG} 100%);">
        <p style="font-family:${SF};font-size:80px;font-weight:900;color:${MANILA_COLOR};letter-spacing:0.02em;text-shadow:0 0 60px rgba(232,68,58,0.4);opacity:0;animation:matchTextIn ${TOTAL_DURATION}s ease-out forwards;">It's a Match!</p>
        <p style="font-family:${SF};font-size:30px;color:rgba(255,255,255,0.8);margin:20px 0 0;opacity:0;animation:matchSubIn ${TOTAL_DURATION}s ease-out forwards;">Manila Model Search liked you</p>
        <p style="font-family:${SF};font-size:24px;color:rgba(255,255,255,0.5);margin:12px 0 0;opacity:0;animation:matchSubIn ${TOTAL_DURATION}s ease-out forwards;">@madebyaidan</p>
      </div>

      <!-- Confetti -->
      ${confettiDivs}

    </div>
  </body>
</html>`
}

function buildCTA(images) {
  // 3 photos staggered/rotated on black background
  // Dark gradient overlay
  // 180px "MANILA" white bold
  // "MODEL SEARCH" light weight, wide tracking
  // Red (#E8443A) "SIGN UP NOW" button
  // Subtext "60-second form . No experience needed"
  // All above SAFE_BOTTOM

  const contentTop = 80
  const contentBottom = HEIGHT - SAFE_BOTTOM
  const contentHeight = contentBottom - contentTop

  return `<!DOCTYPE html>
<html>
  <head>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      html, body { margin: 0; padding: 0; background: #000; -webkit-font-smoothing: antialiased; }
    </style>
  </head>
  <body>
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#000;">

      <!-- Staggered photos -->
      <div style="position:absolute;top:${contentTop + 60}px;left:50%;transform:translateX(-50%);width:700px;height:520px;">
        <!-- Photo 1 - left, rotated -->
        <div style="position:absolute;left:-30px;top:40px;width:320px;height:420px;border-radius:12px;overflow:hidden;transform:rotate(-8deg);box-shadow:0 8px 30px rgba(0,0,0,0.6);">
          <img src="${images.cta0}" style="width:100%;height:100%;object-fit:cover;display:block;"/>
        </div>
        <!-- Photo 2 - center, straight -->
        <div style="position:absolute;left:190px;top:0;width:320px;height:420px;border-radius:12px;overflow:hidden;transform:rotate(0deg);box-shadow:0 8px 30px rgba(0,0,0,0.6);z-index:2;">
          <img src="${images.cta1}" style="width:100%;height:100%;object-fit:cover;display:block;"/>
        </div>
        <!-- Photo 3 - right, rotated -->
        <div style="position:absolute;right:-30px;top:40px;width:320px;height:420px;border-radius:12px;overflow:hidden;transform:rotate(8deg);box-shadow:0 8px 30px rgba(0,0,0,0.6);">
          <img src="${images.cta2}" style="width:100%;height:100%;object-fit:cover;display:block;"/>
        </div>
      </div>

      <!-- Dark gradient overlay -->
      <div style="position:absolute;left:0;right:0;top:${contentTop + 300}px;height:600px;background:linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.7) 30%, #000 70%);z-index:5;"></div>

      <!-- Text content -->
      <div style="position:absolute;left:0;right:0;top:${contentTop + 620}px;z-index:10;display:flex;flex-direction:column;align-items:center;">
        <!-- MANILA -->
        <p style="font-family:${SF};font-size:180px;font-weight:900;color:#fff;letter-spacing:0.06em;line-height:1;margin:0;">MANILA</p>
        <!-- MODEL SEARCH -->
        <p style="font-family:${SF};font-size:38px;font-weight:300;color:rgba(255,255,255,0.85);letter-spacing:0.35em;margin:10px 0 0;">MODEL SEARCH</p>

        <!-- Sign up button -->
        <div style="margin:50px 0 0;background:${MANILA_COLOR};border-radius:40px;padding:22px 80px;cursor:pointer;">
          <span style="font-family:${SF};font-size:30px;font-weight:700;color:#fff;letter-spacing:0.04em;">SIGN UP NOW</span>
        </div>

        <!-- Subtext -->
        <p style="font-family:${SF};font-size:22px;color:rgba(255,255,255,0.5);margin:24px 0 0;letter-spacing:0.03em;">60-second form &middot; No experience needed</p>
      </div>

    </div>
  </body>
</html>`
}

async function render() {
  resetOutputDir()

  const selection = {
    card0: CARD_IMAGES[0],
    card1: CARD_IMAGES[1],
    card2: CARD_IMAGES[2],
    card3: CARD_IMAGES[3],
    card4: CARD_IMAGES[4],
    cta0: CTA_IMAGES[0],
    cta1: CTA_IMAGES[1],
    cta2: CTA_IMAGES[2],
  }

  writeSources({
    createdAt: new Date().toISOString(),
    strategy: 'v50 — Tinder swipe dating app animated ad with CTA',
    safeBottomPixels: SAFE_BOTTOM,
    images: selection
  })

  const images = Object.fromEntries(
    Object.entries(selection).map(([key, file]) => [key, readImage(file)])
  )

  const { execSync } = await import('child_process')

  // --- Part 1: Record animated swipe video ---
  console.log('Recording animated swipe video...')

  const browser = await chromium.launch()
  const videoCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: OUT_DIR,
      size: { width: WIDTH, height: HEIGHT }
    }
  })

  const videoPage = await videoCtx.newPage()
  const animHtml = buildAnimated(images)
  await videoPage.setContent(animHtml, { waitUntil: 'load' })
  await videoPage.waitForTimeout(500)
  await videoPage.waitForTimeout(TOTAL_DURATION_MS)

  await videoPage.close()
  await videoCtx.close()

  // Convert webm -> mp4
  const videoFiles = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.webm'))
  const srcWebm = path.join(OUT_DIR, videoFiles[0])
  const chatMp4 = path.join(OUT_DIR, 'chat.mp4')

  try {
    execSync(`ffmpeg -y -i "${srcWebm}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${chatMp4}"`, { stdio: 'pipe' })
    fs.unlinkSync(srcWebm)
    console.log('Converted webm -> chat.mp4')
  } catch (err) {
    console.error('ffmpeg conversion failed:', err.message)
    fs.renameSync(srcWebm, chatMp4)
  }

  // --- Part 2: Screenshot CTA ---
  console.log('Rendering CTA screenshot...')

  const ctaCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
  })
  const ctaPage = await ctaCtx.newPage()
  const ctaHtml = buildCTA(images)
  await ctaPage.setContent(ctaHtml, { waitUntil: 'load' })
  await ctaPage.waitForTimeout(500)

  const ctaPng = path.join(OUT_DIR, 'cta.png')
  await ctaPage.screenshot({ path: ctaPng })
  console.log('Saved cta.png')

  await ctaPage.close()
  await ctaCtx.close()
  await browser.close()

  // --- Part 3: CTA image -> 5s video ---
  const ctaMp4 = path.join(OUT_DIR, 'cta.mp4')
  try {
    execSync(`ffmpeg -y -loop 1 -i "${ctaPng}" -c:v libx264 -t 5 -pix_fmt yuv420p -r 30 -vf "scale=1080:1920" -an "${ctaMp4}"`, { stdio: 'pipe' })
    console.log('Created cta.mp4 (5s)')
  } catch (err) {
    console.error('CTA video creation failed:', err.message)
    process.exit(1)
  }

  // --- Part 4: Concat ---
  const concatTxt = path.join(OUT_DIR, 'concat.txt')
  fs.writeFileSync(concatTxt, `file 'chat.mp4'\nfile 'cta.mp4'\n`)

  const finalMp4 = path.join(OUT_DIR, 'final.mp4')
  try {
    execSync(`ffmpeg -y -f concat -safe 0 -i "${concatTxt}" -c copy "${finalMp4}"`, { stdio: 'pipe' })
    console.log('Created final.mp4')
  } catch (err) {
    console.error('Concat failed:', err.message)
    process.exit(1)
  }

  // --- Cleanup temp files ---
  fs.unlinkSync(chatMp4)
  fs.unlinkSync(ctaMp4)
  fs.unlinkSync(concatTxt)
  console.log('Cleaned up temp files')

  console.log(`Done: final.mp4 + cta.png written to ${OUT_DIR}`)
}

render().catch(error => {
  console.error(error)
  process.exit(1)
})
