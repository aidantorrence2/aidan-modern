import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v36')

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 410

const SANS = "'Avenir Next', 'Helvetica Neue', Arial, sans-serif"

// Gradient palette: purple -> pink -> orange
const GRAD_BG = 'linear-gradient(145deg, #6B2FA0 0%, #D946A8 40%, #F97316 100%)'
const GRAD_BG_ALT = 'linear-gradient(160deg, #7C3AED 0%, #EC4899 50%, #F59E0B 100%)'
const GRAD_ACCENT = 'linear-gradient(90deg, #D946A8 0%, #F97316 100%)'
const MANILA_COLOR = '#FFFFFF'

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

function getTopManilaImages(count = 20) {
  return fs.readdirSync(IMAGE_DIR)
    .filter(file => file.startsWith('manila') && /\.(jpg|jpeg|png|webp)$/i.test(file))
    .sort((a, b) => a.localeCompare(b))
    .slice(0, count)
}

function writeSources(selected) {
  const payload = {
    createdAt: new Date().toISOString(),
    strategy: 'v36 — Gradient App UI ad concept, modern dating/social app aesthetic',
    safeBottomPixels: SAFE_BOTTOM,
    images: selected
  }
  fs.writeFileSync(path.join(OUT_DIR, 'sources.json'), JSON.stringify(payload, null, 2))
}

function wrap(html) {
  return `<!DOCTYPE html>
  <html>
    <head>
      <style>
        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; background: #000; }
      </style>
    </head>
    <body>${html}</body>
  </html>`
}

// ─── Slide 1: HOOK ─── gradient bg, MANILA huge, "Models Wanted" card, hero in rounded frame
function slideOne(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${GRAD_BG};">
      <!-- subtle noise overlay -->
      <div style="position:absolute;inset:0;opacity:0.06;background:repeating-conic-gradient(rgba(255,255,255,0.1) 0% 25%, transparent 0% 50%) 0 0 / 4px 4px;"></div>

      <!-- MANILA huge -->
      <p style="position:absolute;top:80px;left:0;right:0;text-align:center;font-family:${SANS};font-size:82px;font-weight:800;letter-spacing:0.22em;text-transform:uppercase;color:${MANILA_COLOR};margin:0;text-shadow:0 2px 30px rgba(0,0,0,0.25);">MANILA</p>

      <!-- Models Wanted card -->
      <div style="position:absolute;top:210px;left:50%;transform:translateX(-50%);background:rgba(255,255,255,0.18);backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,0.3);border-radius:60px;padding:16px 48px;">
        <p style="font-family:${SANS};font-size:32px;font-weight:600;color:#fff;margin:0;letter-spacing:0.04em;">Models Wanted</p>
      </div>

      <!-- Hero image in rounded phone-mockup frame -->
      <div style="position:absolute;top:330px;left:50%;transform:translateX(-50%);width:700px;height:940px;border-radius:40px;overflow:hidden;box-shadow:0 30px 80px rgba(0,0,0,0.4),0 0 0 6px rgba(255,255,255,0.15);">
        <img src="${images.hero}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center 20%;"/>
      </div>

      <!-- Subtitle below image -->
      <div style="position:absolute;top:1310px;left:0;right:0;text-align:center;">
        <p style="font-family:${SANS};font-size:30px;font-weight:500;color:rgba(255,255,255,0.9);margin:0;line-height:1.4;">Editorial portrait shoots.<br/>No experience needed.</p>
      </div>

      <!-- Swipe pill -->
      <div style="position:absolute;bottom:${SAFE_BOTTOM + 30}px;left:50%;transform:translateX(-50%);background:rgba(255,255,255,0.2);backdrop-filter:blur(16px);border-radius:40px;padding:10px 32px;">
        <p style="font-family:${SANS};font-size:22px;font-weight:600;color:#fff;margin:0;letter-spacing:0.03em;">Swipe to see more</p>
      </div>
    </div>
  `
}

// ─── Slide 2: ANIMATED ─── photo cards slide up from bottom one by one with slight rotation
function slideTwoAnimated(images) {
  const cards = [
    { src: images.cardA, rot: -4, x: 90,  w: 420, h: 560 },
    { src: images.cardB, rot: 3,  x: 570, w: 420, h: 560 },
    { src: images.cardC, rot: -2, x: 180, w: 420, h: 560 },
    { src: images.cardD, rot: 5,  x: 490, w: 420, h: 560 },
    { src: images.cardE, rot: -3, x: 330, w: 420, h: 560 },
  ]

  // Place cards in a stacked arrangement within the safe zone
  // Cards overlap and fan out
  const baseY = 380
  const yStep = 140

  let cardHtml = ''
  for (let i = 0; i < cards.length; i++) {
    const c = cards[i]
    const finalY = baseY + i * yStep
    const delay = i * 0.5
    cardHtml += `<div class="card card-${i}" style="
      position:absolute;
      left:${c.x}px;top:${finalY}px;
      width:${c.w}px;height:${c.h}px;
      border-radius:28px;overflow:hidden;
      box-shadow:0 20px 60px rgba(0,0,0,0.35),0 0 0 4px rgba(255,255,255,0.12);
      opacity:0;
      transform:translateY(600px) rotate(${c.rot}deg);
      animation:cardSlideUp 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}s forwards;
      z-index:${10 + i};
    ">
      <img src="${c.src}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center;"/>
    </div>`
  }

  return `<!DOCTYPE html>
  <html>
    <head>
      <style>
        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; }
        @keyframes cardSlideUp {
          0% { opacity: 0; transform: translateY(600px) rotate(var(--rot, 0deg)); }
          100% { opacity: 1; transform: translateY(0) rotate(var(--rot, 0deg)); }
        }
        @keyframes headerFade {
          0% { opacity: 0; transform: translateY(-30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .header { opacity: 0; animation: headerFade 0.6s ease-out 0s forwards; }
        ${cards.map((c, i) => `.card-${i} { --rot: ${c.rot}deg; }`).join('\n')}
      </style>
    </head>
    <body>
      <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${GRAD_BG_ALT};">
        <div style="position:absolute;inset:0;opacity:0.06;background:repeating-conic-gradient(rgba(255,255,255,0.1) 0% 25%, transparent 0% 50%) 0 0 / 4px 4px;"></div>

        <!-- Header -->
        <div class="header" style="position:absolute;top:70px;left:0;right:0;text-align:center;">
          <p style="font-family:${SANS};font-size:80px;font-weight:800;letter-spacing:0.22em;text-transform:uppercase;color:#fff;margin:0 0 12px;text-shadow:0 2px 30px rgba(0,0,0,0.25);">MANILA</p>
          <p style="font-family:${SANS};font-size:36px;font-weight:600;color:rgba(255,255,255,0.9);margin:0;">My recent work</p>
        </div>

        <!-- Cards -->
        ${cardHtml}
      </div>
    </body>
  </html>`
}

// ─── Slide 3: PROCESS ─── 3 numbered pill/card steps on gradient
function slideThree(images) {
  const steps = [
    { num: '01', title: 'Sign up below', desc: '60-second form. I message you back.', emoji: '&#9997;&#65039;' },
    { num: '02', title: 'Pick a date', desc: 'We plan the location, vibe, and look together.', emoji: '&#128197;' },
    { num: '03', title: 'Show up', desc: 'No experience needed. I guide every pose.', emoji: '&#10024;' },
  ]

  let stepsHtml = ''
  for (const step of steps) {
    stepsHtml += `
      <div style="display:flex;align-items:flex-start;gap:20px;background:rgba(255,255,255,0.14);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.22);border-radius:28px;padding:32px 36px;margin-bottom:24px;">
        <div style="flex-shrink:0;width:64px;height:64px;border-radius:50%;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;">
          <span style="font-family:${SANS};font-size:28px;font-weight:800;color:#fff;">${step.num}</span>
        </div>
        <div style="flex:1;">
          <p style="font-family:${SANS};font-size:34px;font-weight:700;color:#fff;margin:0 0 8px;line-height:1.15;">${step.title}</p>
          <p style="font-family:${SANS};font-size:24px;font-weight:400;color:rgba(255,255,255,0.8);margin:0;line-height:1.35;">${step.desc}</p>
        </div>
      </div>
    `
  }

  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${GRAD_BG};">
      <div style="position:absolute;inset:0;opacity:0.06;background:repeating-conic-gradient(rgba(255,255,255,0.1) 0% 25%, transparent 0% 50%) 0 0 / 4px 4px;"></div>

      <!-- MANILA -->
      <p style="position:absolute;top:80px;left:0;right:0;text-align:center;font-family:${SANS};font-size:80px;font-weight:800;letter-spacing:0.22em;text-transform:uppercase;color:#fff;margin:0;text-shadow:0 2px 30px rgba(0,0,0,0.25);">MANILA</p>

      <!-- Section heading -->
      <div style="position:absolute;top:210px;left:50%;transform:translateX(-50%);background:rgba(255,255,255,0.18);backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,0.3);border-radius:60px;padding:14px 44px;">
        <p style="font-family:${SANS};font-size:28px;font-weight:600;color:#fff;margin:0;letter-spacing:0.03em;">How it works</p>
      </div>

      <!-- Steps -->
      <div style="position:absolute;top:330px;left:64px;right:64px;">
        ${stepsHtml}
      </div>

      <!-- Small accent image -->
      <div style="position:absolute;bottom:${SAFE_BOTTOM + 40}px;left:50%;transform:translateX(-50%);width:280px;height:280px;border-radius:50%;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.3),0 0 0 4px rgba(255,255,255,0.15);">
        <img src="${images.accent}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center;"/>
      </div>
    </div>
  `
}

// ─── Slide 4: CTA ─── gradient bg, "Sign up below" large, urgency pill, clean photo
function slideFour(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${GRAD_BG_ALT};">
      <div style="position:absolute;inset:0;opacity:0.06;background:repeating-conic-gradient(rgba(255,255,255,0.1) 0% 25%, transparent 0% 50%) 0 0 / 4px 4px;"></div>

      <!-- MANILA -->
      <p style="position:absolute;top:80px;left:0;right:0;text-align:center;font-family:${SANS};font-size:80px;font-weight:800;letter-spacing:0.22em;text-transform:uppercase;color:#fff;margin:0;text-shadow:0 2px 30px rgba(0,0,0,0.25);">MANILA</p>

      <!-- CTA text -->
      <div style="position:absolute;top:210px;left:0;right:0;text-align:center;">
        <h2 style="font-family:${SANS};font-size:76px;font-weight:800;line-height:1.0;color:#fff;margin:0 0 24px;text-shadow:0 2px 20px rgba(0,0,0,0.2);">Sign up<br/>below.</h2>
        <p style="font-family:${SANS};font-size:30px;font-weight:500;color:rgba(255,255,255,0.9);margin:0 0 28px;line-height:1.4;">60-second form. I'll message<br/>you back within a day.</p>
      </div>

      <!-- Urgency pill -->
      <div style="position:absolute;top:530px;left:50%;transform:translateX(-50%);background:rgba(255,255,255,0.22);backdrop-filter:blur(24px);border:1.5px solid rgba(255,255,255,0.35);border-radius:60px;padding:16px 44px;">
        <p style="font-family:${SANS};font-size:26px;font-weight:700;color:#fff;margin:0;letter-spacing:0.06em;text-transform:uppercase;">Limited spots this month</p>
      </div>

      <!-- Hero image in rounded frame -->
      <div style="position:absolute;top:640px;left:50%;transform:translateX(-50%);width:740px;height:680px;border-radius:36px;overflow:hidden;box-shadow:0 30px 80px rgba(0,0,0,0.35),0 0 0 5px rgba(255,255,255,0.15);">
        <img src="${images.cta}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center 25%;"/>
      </div>
    </div>
  `
}

async function render() {
  resetOutputDir()

  const all = getTopManilaImages()
  const selection = {
    hero:   'manila-gallery-canal-001.jpg',
    cardA:  'manila-gallery-closeup-001.jpg',
    cardB:  'manila-gallery-garden-002.jpg',
    cardC:  'manila-gallery-graffiti-001.jpg',
    cardD:  'manila-gallery-urban-001.jpg',
    cardE:  'manila-gallery-ivy-001.jpg',
    accent: 'manila-gallery-dsc-0190.jpg',
    cta:    'manila-gallery-floor-001.jpg',
  }

  writeSources({ all_considered: all, selected: selection })

  const images = Object.fromEntries(
    Object.entries(selection).map(([key, file]) => [key, readImage(file)])
  )

  // --- Render static slides (1, 3, 4) as PNGs ---
  const staticSlides = [
    ['01_hook_story.png', wrap(slideOne(images))],
    ['03_process_story.png', wrap(slideThree(images))],
    ['04_cta_story.png', wrap(slideFour(images))]
  ]

  const browser = await chromium.launch()
  const staticCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1
  })

  for (const [filename, html] of staticSlides) {
    const page = await staticCtx.newPage()
    await page.setContent(html, { waitUntil: 'load' })
    await page.waitForTimeout(300)
    await page.screenshot({ path: path.join(OUT_DIR, filename), type: 'png' })
    await page.close()
    console.log(`Rendered ${filename}`)
  }
  await staticCtx.close()

  // --- Render slide 2 as animated MP4 video ---
  console.log('Recording animated proof slide as MP4...')

  // 5 cards * 500ms stagger = 2500ms for last card to start
  // + 700ms animation = 3200ms for last card to finish
  // + 1500ms hold = 4700ms total
  const TOTAL_DURATION_MS = 5000

  const videoCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: OUT_DIR,
      size: { width: WIDTH, height: HEIGHT }
    }
  })

  const videoPage = await videoCtx.newPage()
  const animatedHtml = slideTwoAnimated(images)
  await videoPage.setContent(animatedHtml, { waitUntil: 'load' })
  await videoPage.waitForTimeout(500)
  await videoPage.waitForTimeout(TOTAL_DURATION_MS)

  await videoPage.close()
  await videoCtx.close()

  // Convert webm to mp4
  const videoFiles = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.webm'))
  if (videoFiles.length === 0) {
    console.error('No video file was generated!')
  } else {
    const srcVideo = path.join(OUT_DIR, videoFiles[0])
    const dstVideo = path.join(OUT_DIR, '02_proof_story.mp4')
    const { execSync } = await import('child_process')
    try {
      execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${dstVideo}"`, { stdio: 'pipe' })
      fs.unlinkSync(srcVideo)
      console.log('Rendered 02_proof_story.mp4')
    } catch (err) {
      console.warn('ffmpeg not available, keeping as webm renamed to mp4...')
      fs.renameSync(srcVideo, dstVideo)
      console.log('Rendered 02_proof_story.mp4 (webm container)')
    }
  }

  await browser.close()
  console.log(`Done: 3 static PNGs + 1 animated MP4 written to ${OUT_DIR}`)
}

render().catch(error => {
  console.error(error)
  process.exit(1)
})
