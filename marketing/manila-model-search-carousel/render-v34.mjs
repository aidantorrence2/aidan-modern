import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v34')

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 410

// IG system fonts
const SF = "-apple-system, 'Helvetica Neue', Arial, sans-serif"
const SF_BOLD = "-apple-system, 'Helvetica Neue', Arial, sans-serif"

// IG colors
const IG_BLUE = '#0095F6'
const IG_DARK = '#262626'
const IG_GRAY = '#8E8E8E'
const IG_BORDER = '#DBDBDB'
const IG_BG = '#FFFFFF'
const IG_LIGHT_BG = '#FAFAFA'
const MANILA_COLOR = '#E8443A' // distinctive red-coral accent for MANILA

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

function getTopManilaImages(count = 20) {
  return fs.readdirSync(IMAGE_DIR)
    .filter(file => file.startsWith('manila') && /\.(jpg|jpeg|png|webp)$/i.test(file))
    .sort((a, b) => a.localeCompare(b))
    .slice(0, count)
}

function readImage(name) {
  const filePath = path.join(IMAGE_DIR, name)
  const buf = fs.readFileSync(filePath)
  return `data:${imageMime(name)};base64,${buf.toString('base64')}`
}

function writeSources(selected) {
  const payload = {
    createdAt: new Date().toISOString(),
    strategy: 'v34 — Instagram Notification / UI concept, platform-native design with animated profile grid',
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
        html, body { margin: 0; padding: 0; background: ${IG_BG}; }
      </style>
    </head>
    <body>${html}</body>
  </html>`
}

// ── Slide 1: IG Notification Hook ──
// Looks like an IG notification: "manila.portraits wants to shoot with you"
function slideOne(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${IG_BG};">
      <!-- MANILA huge at top -->
      <div style="position:absolute;left:0;right:0;top:80px;text-align:center;">
        <p style="font-family:${SF_BOLD};font-size:82px;font-weight:900;letter-spacing:0.06em;color:${MANILA_COLOR};margin:0;text-transform:uppercase;">MANILA</p>
      </div>

      <!-- Fake IG notification card -->
      <div style="position:absolute;left:48px;right:48px;top:220px;background:#fff;border-radius:24px;box-shadow:0 4px 24px rgba(0,0,0,0.12);padding:36px 32px;border:1px solid ${IG_BORDER};">
        <!-- notification header -->
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:20px;">
          <div style="width:28px;height:28px;border-radius:8px;background:linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888);display:flex;align-items:center;justify-content:center;">
            <span style="color:#fff;font-size:16px;font-weight:700;font-family:${SF};">IG</span>
          </div>
          <span style="font-family:${SF};font-size:22px;color:${IG_GRAY};font-weight:500;">INSTAGRAM</span>
          <span style="font-family:${SF};font-size:22px;color:${IG_GRAY};margin-left:auto;">now</span>
        </div>

        <!-- profile row -->
        <div style="display:flex;align-items:center;gap:20px;">
          <div style="width:88px;height:88px;border-radius:50%;overflow:hidden;border:3px solid ${IG_BORDER};flex-shrink:0;">
            <img src="${images.profilePic}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <div style="flex:1;">
            <p style="font-family:${SF_BOLD};font-size:28px;font-weight:700;color:${IG_DARK};margin:0 0 6px;">manila.portraits</p>
            <p style="font-family:${SF};font-size:24px;font-weight:400;color:${IG_DARK};margin:0;line-height:1.35;">wants to shoot with you</p>
          </div>
        </div>
      </div>

      <!-- Main content card below notification -->
      <div style="position:absolute;left:48px;right:48px;top:520px;background:${IG_LIGHT_BG};border-radius:24px;padding:36px 32px;border:1px solid ${IG_BORDER};">
        <p style="font-family:${SF_BOLD};font-size:40px;font-weight:800;color:${IG_DARK};margin:0 0 16px;line-height:1.15;">Models wanted in Manila</p>
        <p style="font-family:${SF};font-size:28px;font-weight:400;color:${IG_GRAY};margin:0 0 28px;line-height:1.4;">Editorial portrait shoots. No experience needed. I guide the entire session.</p>

        <!-- Follow button -->
        <div style="display:inline-flex;align-items:center;padding:16px 48px;background:${IG_BLUE};border-radius:12px;">
          <span style="font-family:${SF_BOLD};font-size:26px;font-weight:700;color:#fff;">Follow</span>
        </div>
        <div style="display:inline-flex;align-items:center;padding:16px 48px;background:#fff;border-radius:12px;border:1px solid ${IG_BORDER};margin-left:12px;">
          <span style="font-family:${SF_BOLD};font-size:26px;font-weight:700;color:${IG_DARK};">Message</span>
        </div>
      </div>

      <!-- Hero image preview (like a post preview) -->
      <div style="position:absolute;left:48px;right:48px;top:880px;height:560px;border-radius:20px;overflow:hidden;border:1px solid ${IG_BORDER};">
        <img src="${images.hero}" style="width:100%;height:100%;object-fit:cover;object-position:center 20%;"/>
      </div>

      <!-- Bottom spacer text -->
      <div style="position:absolute;left:48px;right:48px;bottom:${SAFE_BOTTOM + 20}px;text-align:center;">
        <p style="font-family:${SF};font-size:22px;font-weight:500;color:${IG_GRAY};margin:0;">Swipe to see more</p>
      </div>
    </div>
  `
}

// ── Slide 2: Animated IG Profile Grid ──
// Fake IG profile that loads in, showing the photographer's "feed" filling up
function slideTwoAnimated(images) {
  const gridImages = [
    images.gridA, images.gridB, images.gridC,
    images.gridD, images.gridE, images.gridF,
    images.gridG, images.gridH, images.gridI,
  ]

  let gridHtml = ''
  const CELL_SIZE = 314 // 3 cells + 2 gaps of 4px = 946px, centered in 984px (48px padding each side)
  const GAP = 4
  const GRID_LEFT = 48 + Math.floor((WIDTH - 96 - (CELL_SIZE * 3 + GAP * 2)) / 2)
  const GRID_TOP = 650

  for (let i = 0; i < 9; i++) {
    const row = Math.floor(i / 3)
    const col = i % 3
    const x = GRID_LEFT + col * (CELL_SIZE + GAP)
    const y = GRID_TOP + row * (CELL_SIZE + GAP)
    const delay = 0.4 + i * 0.25

    gridHtml += `<div class="grid-cell" style="position:absolute;left:${x}px;top:${y}px;width:${CELL_SIZE}px;height:${CELL_SIZE}px;overflow:hidden;opacity:0;transform:scale(0.9);animation:cellReveal 0.4s ease-out ${delay}s forwards;">
      <img src="${gridImages[i]}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center;"/>
    </div>`
  }

  return `<!DOCTYPE html>
  <html>
    <head>
      <style>
        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; background: ${IG_BG}; }
        @keyframes cellReveal {
          0% { opacity: 0; transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes headerFade {
          0% { opacity: 0; transform: translateY(-15px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes counterUp {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .header-section {
          opacity: 0;
          animation: headerFade 0.4s ease-out 0s forwards;
        }
        .stat-item {
          opacity: 0;
        }
        .stat-1 { animation: counterUp 0.3s ease-out 0.2s forwards; }
        .stat-2 { animation: counterUp 0.3s ease-out 0.35s forwards; }
        .stat-3 { animation: counterUp 0.3s ease-out 0.5s forwards; }
      </style>
    </head>
    <body>
      <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${IG_BG};">
        <!-- MANILA huge -->
        <div class="header-section" style="position:absolute;left:0;right:0;top:60px;text-align:center;">
          <p style="font-family:${SF_BOLD};font-size:82px;font-weight:900;letter-spacing:0.06em;color:${MANILA_COLOR};margin:0;text-transform:uppercase;">MANILA</p>
        </div>

        <!-- Profile header area -->
        <div class="header-section" style="position:absolute;left:48px;right:48px;top:190px;">
          <!-- Profile pic + stats row -->
          <div style="display:flex;align-items:center;gap:28px;">
            <div style="width:120px;height:120px;border-radius:50%;overflow:hidden;border:3px solid ${IG_BORDER};flex-shrink:0;">
              <img src="${images.profilePic}" style="width:100%;height:100%;object-fit:cover;"/>
            </div>
            <div style="flex:1;display:flex;justify-content:space-around;">
              <div class="stat-item stat-1" style="text-align:center;">
                <p style="font-family:${SF_BOLD};font-size:32px;font-weight:800;color:${IG_DARK};margin:0;">247</p>
                <p style="font-family:${SF};font-size:20px;color:${IG_GRAY};margin:4px 0 0;">Posts</p>
              </div>
              <div class="stat-item stat-2" style="text-align:center;">
                <p style="font-family:${SF_BOLD};font-size:32px;font-weight:800;color:${IG_DARK};margin:0;">1.2K</p>
                <p style="font-family:${SF};font-size:20px;color:${IG_GRAY};margin:4px 0 0;">Followers</p>
              </div>
              <div class="stat-item stat-3" style="text-align:center;">
                <p style="font-family:${SF_BOLD};font-size:32px;font-weight:800;color:${IG_DARK};margin:0;">186</p>
                <p style="font-family:${SF};font-size:20px;color:${IG_GRAY};margin:4px 0 0;">Following</p>
              </div>
            </div>
          </div>

          <!-- Bio -->
          <div style="margin-top:20px;">
            <p style="font-family:${SF_BOLD};font-size:26px;font-weight:700;color:${IG_DARK};margin:0;">manila.portraits</p>
            <p style="font-family:${SF};font-size:24px;color:${IG_DARK};margin:6px 0 0;line-height:1.35;">Photographer<br/>Editorial portraits in Manila<br/>DM for bookings</p>
          </div>

          <!-- Edit Profile / Share Profile buttons -->
          <div style="display:flex;gap:8px;margin-top:20px;">
            <div style="flex:1;padding:12px 0;background:${IG_LIGHT_BG};border-radius:10px;border:1px solid ${IG_BORDER};text-align:center;">
              <span style="font-family:${SF_BOLD};font-size:22px;font-weight:700;color:${IG_DARK};">Following</span>
            </div>
            <div style="flex:1;padding:12px 0;background:${IG_BLUE};border-radius:10px;text-align:center;">
              <span style="font-family:${SF_BOLD};font-size:22px;font-weight:700;color:#fff;">Message</span>
            </div>
          </div>
        </div>

        <!-- Grid / Reels / Tagged tabs -->
        <div class="header-section" style="position:absolute;left:0;right:0;top:600px;display:flex;border-bottom:1px solid ${IG_BORDER};">
          <div style="flex:1;padding:16px 0;text-align:center;border-bottom:2px solid ${IG_DARK};">
            <span style="font-family:${SF};font-size:20px;color:${IG_DARK};font-weight:600;">GRID</span>
          </div>
          <div style="flex:1;padding:16px 0;text-align:center;">
            <span style="font-family:${SF};font-size:20px;color:${IG_GRAY};">REELS</span>
          </div>
          <div style="flex:1;padding:16px 0;text-align:center;">
            <span style="font-family:${SF};font-size:20px;color:${IG_GRAY};">TAGGED</span>
          </div>
        </div>

        <!-- Grid -->
        ${gridHtml}
      </div>
    </body>
  </html>`
}

// ── Slide 3: IG Story Highlights Process ──
// Styled like IG story highlights with circular icons for each step
function slideThree(images) {
  const steps = [
    { label: 'Sign Up', desc: '60-second form. I message you back within a day.', icon: '1' },
    { label: 'Plan It', desc: 'We pick a date, location, and vibe together.', icon: '2' },
    { label: 'Show Up', desc: 'I guide the whole shoot. No experience needed.', icon: '3' },
    { label: 'Get Pics', desc: '25+ edited photos delivered within a week.', icon: '4' },
  ]

  let highlightsHtml = ''
  const HIGHLIGHT_SIZE = 116
  const HIGHLIGHT_GAP = 24
  const totalWidth = steps.length * HIGHLIGHT_SIZE + (steps.length - 1) * HIGHLIGHT_GAP
  const startX = Math.floor((WIDTH - totalWidth) / 2)

  for (let i = 0; i < steps.length; i++) {
    const x = startX + i * (HIGHLIGHT_SIZE + HIGHLIGHT_GAP)
    highlightsHtml += `
      <div style="position:absolute;left:${x}px;top:320px;width:${HIGHLIGHT_SIZE}px;text-align:center;">
        <!-- ring -->
        <div style="width:${HIGHLIGHT_SIZE}px;height:${HIGHLIGHT_SIZE}px;border-radius:50%;background:linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888);padding:4px;margin:0 auto;">
          <div style="width:100%;height:100%;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;">
            <span style="font-family:${SF_BOLD};font-size:42px;font-weight:800;color:${MANILA_COLOR};">${steps[i].icon}</span>
          </div>
        </div>
        <p style="font-family:${SF_BOLD};font-size:20px;font-weight:700;color:${IG_DARK};margin:10px 0 0;">${steps[i].label}</p>
      </div>
    `
  }

  let stepsDetailHtml = ''
  for (let i = 0; i < steps.length; i++) {
    stepsDetailHtml += `
      <div style="padding:24px 28px;background:${IG_LIGHT_BG};border-radius:16px;border:1px solid ${IG_BORDER};display:flex;align-items:flex-start;gap:18px;">
        <div style="width:48px;height:48px;border-radius:50%;background:${MANILA_COLOR};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <span style="font-family:${SF_BOLD};font-size:24px;font-weight:800;color:#fff;">${steps[i].icon}</span>
        </div>
        <div style="flex:1;">
          <p style="font-family:${SF_BOLD};font-size:28px;font-weight:700;color:${IG_DARK};margin:0 0 6px;">${steps[i].label}</p>
          <p style="font-family:${SF};font-size:23px;color:${IG_GRAY};margin:0;line-height:1.35;">${steps[i].desc}</p>
        </div>
      </div>
    `
  }

  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${IG_BG};">
      <!-- MANILA huge -->
      <div style="position:absolute;left:0;right:0;top:80px;text-align:center;">
        <p style="font-family:${SF_BOLD};font-size:82px;font-weight:900;letter-spacing:0.06em;color:${MANILA_COLOR};margin:0;text-transform:uppercase;">MANILA</p>
      </div>

      <div style="position:absolute;left:0;right:0;top:200px;text-align:center;">
        <p style="font-family:${SF_BOLD};font-size:44px;font-weight:800;color:${IG_DARK};margin:0;">How it works</p>
      </div>

      <!-- Story highlight circles -->
      ${highlightsHtml}

      <!-- Step detail cards -->
      <div style="position:absolute;left:48px;right:48px;top:510px;display:flex;flex-direction:column;gap:16px;">
        ${stepsDetailHtml}
      </div>

      <!-- Small accent image -->
      <div style="position:absolute;left:48px;right:48px;bottom:${SAFE_BOTTOM + 20}px;height:260px;border-radius:16px;overflow:hidden;border:1px solid ${IG_BORDER};">
        <img src="${images.process}" style="width:100%;height:100%;object-fit:cover;object-position:center 30%;"/>
      </div>
    </div>
  `
}

// ── Slide 4: CTA — Book Now screen ──
// Looks like a "book now" screen with photographer profile, rating, availability
function slideFour(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${IG_BG};">
      <!-- MANILA huge -->
      <div style="position:absolute;left:0;right:0;top:80px;text-align:center;">
        <p style="font-family:${SF_BOLD};font-size:82px;font-weight:900;letter-spacing:0.06em;color:${MANILA_COLOR};margin:0;text-transform:uppercase;">MANILA</p>
      </div>

      <!-- Photographer card -->
      <div style="position:absolute;left:48px;right:48px;top:220px;background:#fff;border-radius:24px;box-shadow:0 4px 24px rgba(0,0,0,0.10);padding:36px 32px;border:1px solid ${IG_BORDER};">
        <div style="display:flex;align-items:center;gap:20px;margin-bottom:20px;">
          <div style="width:96px;height:96px;border-radius:50%;overflow:hidden;border:3px solid ${IG_BORDER};flex-shrink:0;">
            <img src="${images.profilePic}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <div style="flex:1;">
            <p style="font-family:${SF_BOLD};font-size:30px;font-weight:700;color:${IG_DARK};margin:0 0 4px;">manila.portraits</p>
            <p style="font-family:${SF};font-size:22px;color:${IG_GRAY};margin:0;">Portrait Photographer</p>
            <div style="display:flex;align-items:center;gap:4px;margin-top:8px;">
              <span style="color:#FFB800;font-size:22px;">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
              <span style="font-family:${SF};font-size:20px;color:${IG_GRAY};margin-left:4px;">5.0 (24 reviews)</span>
            </div>
          </div>
        </div>

        <!-- Info rows -->
        <div style="border-top:1px solid ${IG_BORDER};padding-top:20px;display:flex;flex-direction:column;gap:14px;">
          <div style="display:flex;align-items:center;gap:12px;">
            <span style="font-size:24px;">&#128205;</span>
            <span style="font-family:${SF};font-size:24px;color:${IG_DARK};">Manila, Philippines</span>
          </div>
          <div style="display:flex;align-items:center;gap:12px;">
            <span style="font-size:24px;">&#128247;</span>
            <span style="font-family:${SF};font-size:24px;color:${IG_DARK};">Editorial / Portrait</span>
          </div>
          <div style="display:flex;align-items:center;gap:12px;">
            <span style="font-size:24px;">&#9989;</span>
            <span style="font-family:${SF};font-size:24px;color:#00A67E;font-weight:600;">Available this month</span>
          </div>
        </div>
      </div>

      <!-- Recent work preview -->
      <div style="position:absolute;left:48px;right:48px;top:740px;">
        <p style="font-family:${SF_BOLD};font-size:24px;font-weight:700;color:${IG_DARK};margin:0 0 14px;">Recent work</p>
        <div style="display:flex;gap:6px;">
          <div style="flex:1;height:200px;border-radius:12px;overflow:hidden;">
            <img src="${images.recentA}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <div style="flex:1;height:200px;border-radius:12px;overflow:hidden;">
            <img src="${images.recentB}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <div style="flex:1;height:200px;border-radius:12px;overflow:hidden;">
            <img src="${images.recentC}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
        </div>
      </div>

      <!-- CTA -->
      <div style="position:absolute;left:48px;right:48px;top:1020px;">
        <p style="font-family:${SF_BOLD};font-size:42px;font-weight:800;color:${IG_DARK};margin:0 0 12px;text-align:center;">Sign up below</p>
        <p style="font-family:${SF};font-size:26px;color:${IG_GRAY};margin:0 0 24px;text-align:center;line-height:1.4;">60-second form. I'll message you back within a day.</p>

        <!-- Book Now button -->
        <div style="width:100%;padding:22px 0;background:${IG_BLUE};border-radius:14px;text-align:center;">
          <span style="font-family:${SF_BOLD};font-size:30px;font-weight:700;color:#fff;">Book Now</span>
        </div>

        <!-- Urgency -->
        <div style="margin-top:18px;padding:16px 24px;background:rgba(232,68,58,0.08);border-radius:12px;text-align:center;border:1px solid rgba(232,68,58,0.2);">
          <span style="font-family:${SF_BOLD};font-size:24px;font-weight:700;color:${MANILA_COLOR};">Limited spots this month</span>
        </div>
      </div>
    </div>
  `
}

async function render() {
  resetOutputDir()

  const all = getTopManilaImages()
  const selection = {
    hero: 'manila-gallery-canal-001.jpg',
    profilePic: 'manila-gallery-closeup-001.jpg',
    gridA: 'manila-gallery-garden-002.jpg',
    gridB: 'manila-gallery-dsc-0911.jpg',
    gridC: 'manila-gallery-night-003.jpg',
    gridD: 'manila-gallery-canal-002.jpg',
    gridE: 'manila-gallery-graffiti-001.jpg',
    gridF: 'manila-gallery-urban-001.jpg',
    gridG: 'manila-gallery-ivy-001.jpg',
    gridH: 'manila-gallery-shadow-001.jpg',
    gridI: 'manila-gallery-tropical-001.jpg',
    process: 'manila-gallery-dsc-0190.jpg',
    recentA: 'manila-gallery-statue-001.jpg',
    recentB: 'manila-gallery-street-001.jpg',
    recentC: 'manila-gallery-floor-001.jpg',
  }

  writeSources({ all_considered: all, selected: selection })

  const images = Object.fromEntries(
    Object.entries(selection).map(([key, file]) => [key, readImage(file)])
  )

  // --- Render static slides (1, 3, 4) as PNGs ---
  const staticSlides = [
    ['01_ig_notification_story.png', wrap(slideOne(images))],
    ['03_ig_highlights_story.png', wrap(slideThree(images))],
    ['04_ig_book_now_story.png', wrap(slideFour(images))]
  ]

  const browser = await chromium.launch()
  const staticCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1
  })

  for (const [filename, html] of staticSlides) {
    const page = await staticCtx.newPage()
    await page.setContent(html, { waitUntil: 'load' })
    await page.waitForTimeout(200)
    await page.screenshot({ path: path.join(OUT_DIR, filename), type: 'png' })
    await page.close()
    console.log(`Rendered ${filename}`)
  }
  await staticCtx.close()

  // --- Render slide 2 as animated MP4 video ---
  console.log('Recording animated profile grid as MP4...')

  // 9 images * 250ms stagger + 400ms initial delay + 400ms anim duration + 1000ms hold
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
    const dstVideo = path.join(OUT_DIR, '02_ig_profile_grid_story.mp4')

    const { execSync } = await import('child_process')
    try {
      execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${dstVideo}"`, {
        stdio: 'pipe'
      })
      fs.unlinkSync(srcVideo)
      console.log('Rendered 02_ig_profile_grid_story.mp4')
    } catch (err) {
      console.warn('ffmpeg not available, keeping as webm and renaming to mp4...')
      fs.renameSync(srcVideo, dstVideo)
      console.log('Rendered 02_ig_profile_grid_story.mp4 (webm container)')
    }
  }

  await browser.close()
  console.log(`Done: 3 static PNGs + 1 animated MP4 written to ${OUT_DIR}`)
}

render().catch(error => {
  console.error(error)
  process.exit(1)
})
