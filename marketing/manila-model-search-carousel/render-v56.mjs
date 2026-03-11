import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v56')

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 410

const SF = "-apple-system, 'Helvetica Neue', Arial, sans-serif"
const MANILA_COLOR = '#E8443A'
const AIRBNB_CORAL = '#FF385C'
const AIRBNB_BG = '#fafafa'
const AIRBNB_TEXT = '#222222'
const AIRBNB_GRAY = '#717171'
const AIRBNB_BORDER = '#DDDDDD'

const TOTAL_DURATION = 23        // 18s scroll + 5s CTA
const SCROLL_DURATION = 18
const SCROLL_DURATION_MS = 20000 // extra buffer for recording

const PURPLE_PHOTOS = [
  'manila-gallery-purple-001.jpg',
  'manila-gallery-purple-002.jpg',
  'manila-gallery-purple-003.jpg',
  'manila-gallery-purple-004.jpg',
  'manila-gallery-purple-005.jpg',
]

// Hero carousel images
const HERO_IMAGES = [
  'manila-gallery-garden-001.jpg',
  'manila-gallery-graffiti-001.jpg',
  'manila-gallery-ivy-001.jpg',
]

// CTA staggered photos
const CTA_IMAGES = [
  'manila-gallery-dsc-0075.jpg',
  'manila-gallery-floor-001.jpg',
  'manila-gallery-purple-002.jpg',
]

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

function isPurple(name) {
  return PURPLE_PHOTOS.includes(name)
}

function imageStyle(name, extra = '') {
  if (isPurple(name)) {
    return `width:130%;height:130%;object-fit:cover;object-position:center;margin:-15% 0 0 -15%;display:block;${extra}`
  }
  return `width:100%;height:100%;object-fit:cover;object-position:center top;display:block;${extra}`
}

// Percentage helper for keyframes
const p = (t) => ((t / SCROLL_DURATION) * 100).toFixed(2)

function buildAnimated(images) {
  // Content is taller than the viewport — we auto-scroll via CSS translateY
  // Total content height ~3600px, viewport usable: HEIGHT - SAFE_BOTTOM ≈ 1510
  // Scroll from 0 to -(contentHeight - viewportHeight) over 18s
  const CONTENT_HEIGHT = 3800
  const VIEWPORT_USABLE = HEIGHT - SAFE_BOTTOM - 60 // top padding
  const SCROLL_AMOUNT = CONTENT_HEIGHT - VIEWPORT_USABLE + 200

  // Hero image carousel: crossfade between 3 images over time
  // Image 1: 0–4s, Image 2: 4–8s, Image 3: 8–18s
  const heroKeyframes = `
    @keyframes heroImg1 {
      0% { opacity: 1; }
      ${p(3.5)}% { opacity: 1; }
      ${p(4.5)}% { opacity: 0; }
      100% { opacity: 0; }
    }
    @keyframes heroImg2 {
      0% { opacity: 0; }
      ${p(3.5)}% { opacity: 0; }
      ${p(4.5)}% { opacity: 1; }
      ${p(7.5)}% { opacity: 1; }
      ${p(8.5)}% { opacity: 0; }
      100% { opacity: 0; }
    }
    @keyframes heroImg3 {
      0% { opacity: 0; }
      ${p(7.5)}% { opacity: 0; }
      ${p(8.5)}% { opacity: 1; }
      100% { opacity: 1; }
    }
    @keyframes heroDot1 { 0% { background: #222; } ${p(3.5)}% { background: #222; } ${p(4.5)}% { background: #ccc; } 100% { background: #ccc; } }
    @keyframes heroDot2 { 0% { background: #ccc; } ${p(3.5)}% { background: #ccc; } ${p(4.5)}% { background: #222; } ${p(7.5)}% { background: #222; } ${p(8.5)}% { background: #ccc; } 100% { background: #ccc; } }
    @keyframes heroDot3 { 0% { background: #ccc; } ${p(7.5)}% { background: #ccc; } ${p(8.5)}% { background: #222; } 100% { background: #222; } }
  `

  // Auto-scroll keyframes — smooth scroll then fade to black
  const scrollKeyframes = `
    @keyframes autoScroll {
      0% { transform: translateY(0); }
      5% { transform: translateY(0); }
      85% { transform: translateY(-${SCROLL_AMOUNT}px); }
      100% { transform: translateY(-${SCROLL_AMOUNT}px); }
    }
    @keyframes fadeToBlack {
      0% { opacity: 0; }
      ${p(16)}% { opacity: 0; }
      ${p(17.5)}% { opacity: 1; }
      100% { opacity: 1; }
    }
  `

  const stars = '&#9733;&#9733;&#9733;&#9733;&#9733;'

  return `<!DOCTYPE html>
<html>
  <head>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      html, body { margin: 0; padding: 0; background: ${AIRBNB_BG}; -webkit-font-smoothing: antialiased; }
      ${heroKeyframes}
      ${scrollKeyframes}
    </style>
  </head>
  <body>
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${AIRBNB_BG};">

      <!-- Scrolling content wrapper -->
      <div style="position:absolute;left:0;right:0;top:0;animation:autoScroll ${SCROLL_DURATION}s cubic-bezier(0.25,0.1,0.25,1) forwards;">

        <!-- Hero photo carousel area: 1080 x 700 -->
        <div style="width:${WIDTH}px;height:700px;position:relative;overflow:hidden;">
          <!-- Image 1 -->
          <div style="position:absolute;inset:0;overflow:hidden;animation:heroImg1 ${SCROLL_DURATION}s ease forwards;">
            <img src="${images.hero0}" style="${imageStyle(HERO_IMAGES[0])}"/>
          </div>
          <!-- Image 2 -->
          <div style="position:absolute;inset:0;overflow:hidden;opacity:0;animation:heroImg2 ${SCROLL_DURATION}s ease forwards;">
            <img src="${images.hero1}" style="${imageStyle(HERO_IMAGES[1])}"/>
          </div>
          <!-- Image 3 -->
          <div style="position:absolute;inset:0;overflow:hidden;opacity:0;animation:heroImg3 ${SCROLL_DURATION}s ease forwards;">
            <img src="${images.hero2}" style="${imageStyle(HERO_IMAGES[2])}"/>
          </div>
        </div>

        <!-- Carousel dots -->
        <div style="display:flex;justify-content:center;gap:8px;padding:16px 0;">
          <div style="width:8px;height:8px;border-radius:50%;animation:heroDot1 ${SCROLL_DURATION}s ease forwards;"></div>
          <div style="width:8px;height:8px;border-radius:50%;animation:heroDot2 ${SCROLL_DURATION}s ease forwards;"></div>
          <div style="width:8px;height:8px;border-radius:50%;animation:heroDot3 ${SCROLL_DURATION}s ease forwards;"></div>
        </div>

        <!-- Title section -->
        <div style="padding:20px 48px 0;">
          <p style="font-family:${SF};font-size:46px;font-weight:700;color:${AIRBNB_TEXT};line-height:1.2;">Photography Experience<br/>in Manila</p>
        </div>

        <!-- Host info -->
        <div style="padding:20px 48px 0;display:flex;align-items:center;gap:16px;">
          <div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);display:flex;align-items:center;justify-content:center;">
            <span style="font-family:${SF};font-size:24px;font-weight:700;color:#fff;">A</span>
          </div>
          <div>
            <p style="font-family:${SF};font-size:28px;font-weight:600;color:${AIRBNB_TEXT};">Hosted by Aidan</p>
            <p style="font-family:${SF};font-size:22px;color:${AIRBNB_GRAY};margin-top:2px;">Superhost &middot; 2 years hosting</p>
          </div>
        </div>

        <!-- Rating row -->
        <div style="padding:20px 48px 0;display:flex;align-items:center;gap:10px;">
          <span style="font-family:${SF};font-size:28px;color:${AIRBNB_TEXT};">${stars}</span>
          <span style="font-family:${SF};font-size:24px;font-weight:600;color:${AIRBNB_TEXT};">4.98</span>
          <span style="font-family:${SF};font-size:22px;color:${AIRBNB_GRAY};">(127 reviews)</span>
        </div>

        <!-- Divider -->
        <div style="margin:32px 48px;height:1px;background:${AIRBNB_BORDER};"></div>

        <!-- What you'll do -->
        <div style="padding:0 48px;">
          <p style="font-family:${SF};font-size:36px;font-weight:700;color:${AIRBNB_TEXT};margin-bottom:24px;">What you'll do</p>

          <div style="display:flex;align-items:flex-start;gap:20px;margin-bottom:24px;">
            <div style="width:44px;height:44px;border-radius:50%;background:#F0EFEF;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:4px;">
              <span style="font-size:22px;">📸</span>
            </div>
            <div>
              <p style="font-family:${SF};font-size:26px;font-weight:600;color:${AIRBNB_TEXT};">Show up — no experience needed</p>
              <p style="font-family:${SF};font-size:22px;color:${AIRBNB_GRAY};margin-top:4px;">First-time models welcome</p>
            </div>
          </div>

          <div style="display:flex;align-items:flex-start;gap:20px;margin-bottom:24px;">
            <div style="width:44px;height:44px;border-radius:50%;background:#F0EFEF;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:4px;">
              <span style="font-size:22px;">🎬</span>
            </div>
            <div>
              <p style="font-family:${SF};font-size:26px;font-weight:600;color:${AIRBNB_TEXT};">I direct the entire shoot</p>
              <p style="font-family:${SF};font-size:22px;color:${AIRBNB_GRAY};margin-top:4px;">Posing, angles, everything</p>
            </div>
          </div>

          <div style="display:flex;align-items:flex-start;gap:20px;margin-bottom:24px;">
            <div style="width:44px;height:44px;border-radius:50%;background:#F0EFEF;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:4px;">
              <span style="font-size:22px;">✨</span>
            </div>
            <div>
              <p style="font-family:${SF};font-size:26px;font-weight:600;color:${AIRBNB_TEXT};">Get edited photos in a week</p>
              <p style="font-family:${SF};font-size:22px;color:${AIRBNB_GRAY};margin-top:4px;">Professionally retouched</p>
            </div>
          </div>

          <div style="display:flex;align-items:flex-start;gap:20px;margin-bottom:12px;">
            <div style="width:44px;height:44px;border-radius:50%;background:#F0EFEF;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:4px;">
              <span style="font-size:22px;">⚡</span>
            </div>
            <div>
              <p style="font-family:${SF};font-size:26px;font-weight:600;color:${AIRBNB_TEXT};">60-second signup form</p>
              <p style="font-family:${SF};font-size:22px;color:${AIRBNB_GRAY};margin-top:4px;">Quick and easy</p>
            </div>
          </div>
        </div>

        <!-- Divider -->
        <div style="margin:32px 48px;height:1px;background:${AIRBNB_BORDER};"></div>

        <!-- Reviews section -->
        <div style="padding:0 48px;">
          <p style="font-family:${SF};font-size:36px;font-weight:700;color:${AIRBNB_TEXT};margin-bottom:24px;">${stars} 127 reviews</p>

          <!-- Review 1 -->
          <div style="background:#fff;border-radius:16px;padding:28px;margin-bottom:20px;border:1px solid ${AIRBNB_BORDER};">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
              <div style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#f093fb,#f5576c);display:flex;align-items:center;justify-content:center;">
                <span style="font-family:${SF};font-size:20px;font-weight:700;color:#fff;">S</span>
              </div>
              <div>
                <p style="font-family:${SF};font-size:22px;font-weight:600;color:${AIRBNB_TEXT};">Sarah</p>
                <p style="font-family:${SF};font-size:18px;color:${AIRBNB_GRAY};">2 weeks ago</p>
              </div>
            </div>
            <p style="font-family:${SF};font-size:22px;color:${AIRBNB_TEXT};line-height:1.45;">${stars}<br/>I've never modeled before and the photos were INSANE</p>
          </div>

          <!-- Review 2 -->
          <div style="background:#fff;border-radius:16px;padding:28px;margin-bottom:20px;border:1px solid ${AIRBNB_BORDER};">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
              <div style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#a18cd1,#fbc2eb);display:flex;align-items:center;justify-content:center;">
                <span style="font-family:${SF};font-size:20px;font-weight:700;color:#fff;">M</span>
              </div>
              <div>
                <p style="font-family:${SF};font-size:22px;font-weight:600;color:${AIRBNB_TEXT};">Michelle</p>
                <p style="font-family:${SF};font-size:18px;color:${AIRBNB_GRAY};">1 week ago</p>
              </div>
            </div>
            <p style="font-family:${SF};font-size:22px;color:${AIRBNB_TEXT};line-height:1.45;">${stars}<br/>Best experience in Manila. Worth every second</p>
          </div>

          <!-- Review 3 -->
          <div style="background:#fff;border-radius:16px;padding:28px;margin-bottom:20px;border:1px solid ${AIRBNB_BORDER};">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
              <div style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#ffecd2,#fcb69f);display:flex;align-items:center;justify-content:center;">
                <span style="font-family:${SF};font-size:20px;font-weight:700;color:#fff;">A</span>
              </div>
              <div>
                <p style="font-family:${SF};font-size:22px;font-weight:600;color:${AIRBNB_TEXT};">Anna</p>
                <p style="font-family:${SF};font-size:18px;color:${AIRBNB_GRAY};">3 days ago</p>
              </div>
            </div>
            <p style="font-family:${SF};font-size:22px;color:${AIRBNB_TEXT};line-height:1.45;">${stars}<br/>Sign up immediately. You won't regret it 🔥</p>
          </div>
        </div>

        <!-- Divider -->
        <div style="margin:32px 48px;height:1px;background:${AIRBNB_BORDER};"></div>

        <!-- Limited spots -->
        <div style="padding:0 48px;text-align:center;">
          <p style="font-family:${SF};font-size:30px;font-weight:700;color:${AIRBNB_CORAL};margin-bottom:28px;">Limited spots remaining</p>

          <!-- Sign Up button -->
          <div style="display:inline-block;background:${AIRBNB_CORAL};border-radius:12px;padding:22px 120px;">
            <span style="font-family:${SF};font-size:28px;font-weight:700;color:#fff;">Sign Up</span>
          </div>

          <p style="font-family:${SF};font-size:20px;color:${AIRBNB_GRAY};margin-top:16px;">@madebyaidan</p>
        </div>

        <!-- Bottom spacer so scroll reaches the button -->
        <div style="height:300px;"></div>

      </div><!-- end scrolling content -->

      <!-- Fixed Airbnb-style bottom bar (stays in place) -->
      <div style="position:absolute;left:0;right:0;bottom:0;height:120px;background:#fff;border-top:1px solid ${AIRBNB_BORDER};display:flex;align-items:center;justify-content:space-between;padding:0 48px;z-index:20;">
        <div>
          <p style="font-family:${SF};font-size:24px;font-weight:700;color:${AIRBNB_TEXT};">Free</p>
          <p style="font-family:${SF};font-size:18px;color:${AIRBNB_GRAY};text-decoration:underline;">per person</p>
        </div>
        <div style="background:${AIRBNB_CORAL};border-radius:10px;padding:18px 48px;">
          <span style="font-family:${SF};font-size:24px;font-weight:700;color:#fff;">Reserve</span>
        </div>
      </div>

      <!-- Fade-to-black overlay -->
      <div style="position:absolute;inset:0;background:#000;opacity:0;animation:fadeToBlack ${SCROLL_DURATION}s ease forwards;z-index:30;pointer-events:none;"></div>

    </div>
  </body>
</html>`
}

function buildCTA(images) {
  const contentTop = 80
  const contentBottom = HEIGHT - SAFE_BOTTOM
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
          <div style="width:100%;height:100%;overflow:hidden;">
            <img src="${images.cta2}" style="${imageStyle(CTA_IMAGES[2])}"/>
          </div>
        </div>
      </div>

      <!-- Dark gradient overlay -->
      <div style="position:absolute;left:0;right:0;top:${contentTop + 300}px;height:600px;background:linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.7) 30%, #000 70%);z-index:5;"></div>

      <!-- Text content — all above SAFE_BOTTOM -->
      <div style="position:absolute;left:0;right:0;top:${contentTop + 620}px;z-index:10;display:flex;flex-direction:column;align-items:center;">
        <!-- MANILA -->
        <p style="font-family:${SF};font-size:180px;font-weight:900;color:#fff;letter-spacing:0.06em;line-height:1;margin:0;">MANILA</p>
        <!-- MODEL SEARCH -->
        <p style="font-family:${SF};font-size:38px;font-weight:300;color:rgba(255,255,255,0.85);letter-spacing:0.35em;margin:10px 0 0;">MODEL SEARCH</p>

        <!-- Sign up button -->
        <div style="margin:50px 0 0;background:${MANILA_COLOR};border-radius:40px;padding:22px 80px;">
          <span style="font-family:${SF};font-size:30px;font-weight:700;color:#fff;letter-spacing:0.04em;">SIGN UP NOW</span>
        </div>

        <!-- Subtext -->
        <p style="font-family:${SF};font-size:22px;color:rgba(255,255,255,0.5);margin:24px 0 0;letter-spacing:0.03em;">60-second form &middot; No experience needed</p>
        <p style="font-family:${SF};font-size:20px;color:rgba(255,255,255,0.4);margin:10px 0 0;">@madebyaidan</p>
      </div>

    </div>
  </body>
</html>`
}

async function render() {
  resetOutputDir()

  const selection = {
    hero0: HERO_IMAGES[0],
    hero1: HERO_IMAGES[1],
    hero2: HERO_IMAGES[2],
    cta0: CTA_IMAGES[0],
    cta1: CTA_IMAGES[1],
    cta2: CTA_IMAGES[2],
  }

  writeSources({
    createdAt: new Date().toISOString(),
    strategy: 'v56 — Airbnb Experience listing page auto-scrolling animated ad with CTA',
    safeBottomPixels: SAFE_BOTTOM,
    images: selection
  })

  const images = Object.fromEntries(
    Object.entries(selection).map(([key, file]) => [key, readImage(file)])
  )

  const { execSync } = await import('child_process')

  // --- Part 1: Record animated scrolling video ---
  console.log('Recording animated Airbnb scroll video...')

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
  await videoPage.waitForTimeout(SCROLL_DURATION_MS)

  await videoPage.close()
  await videoCtx.close()

  // Convert webm -> mp4
  const videoFiles = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.webm'))
  const srcWebm = path.join(OUT_DIR, videoFiles[0])
  const scrollMp4 = path.join(OUT_DIR, 'scroll.mp4')

  try {
    execSync(`ffmpeg -y -i "${srcWebm}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${scrollMp4}"`, { stdio: 'pipe' })
    fs.unlinkSync(srcWebm)
    console.log('Converted webm -> scroll.mp4')
  } catch (err) {
    console.error('ffmpeg conversion failed:', err.message)
    fs.renameSync(srcWebm, scrollMp4)
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
  fs.writeFileSync(concatTxt, `file 'scroll.mp4'\nfile 'cta.mp4'\n`)

  const finalMp4 = path.join(OUT_DIR, 'final.mp4')
  try {
    execSync(`ffmpeg -y -f concat -safe 0 -i "${concatTxt}" -c copy "${finalMp4}"`, { stdio: 'pipe' })
    console.log('Created final.mp4')
  } catch (err) {
    console.error('Concat failed:', err.message)
    process.exit(1)
  }

  // --- Cleanup temp files ---
  fs.unlinkSync(scrollMp4)
  fs.unlinkSync(ctaMp4)
  fs.unlinkSync(concatTxt)
  console.log('Cleaned up temp files')

  console.log(`Done: final.mp4 + cta.png written to ${OUT_DIR}`)
}

render().catch(error => {
  console.error(error)
  process.exit(1)
})
