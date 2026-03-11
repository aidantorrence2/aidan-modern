import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v37')

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 410

const BOLD = "'Avenir Next', 'Helvetica Neue', Arial, sans-serif"
const BODY = "'Avenir Next', 'Helvetica Neue', Arial, sans-serif"
const NARROW = "Futura, 'Arial Narrow', sans-serif"

// Warm background and accent colors
const BG_WARM = '#FAF6F0'
const BG_CARD = '#FFFFFF'
const ACCENT = '#E8913A'
const TEXT_DARK = '#1A1A1A'
const TEXT_MED = '#555555'
const TEXT_LIGHT = '#888888'
const STAR_COLOR = '#F5A623'
const MANILA_COLOR = '#E8913A'

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
    strategy: 'v37 — review cards / testimonial social proof concept, animated slide 2',
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
        html, body { margin: 0; padding: 0; background: ${BG_WARM}; }
      </style>
    </head>
    <body>${html}</body>
  </html>`
}

function stars(rating, size = 28) {
  const fullStars = Math.floor(rating)
  const halfStar = rating % 1 >= 0.5
  let html = ''
  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      html += `<span style="color:${STAR_COLOR};font-size:${size}px;">&#9733;</span>`
    } else if (i === fullStars && halfStar) {
      html += `<span style="color:${STAR_COLOR};font-size:${size}px;">&#9733;</span>`
    } else {
      html += `<span style="color:#D4D0C8;font-size:${size}px;">&#9733;</span>`
    }
  }
  return html
}

// Slide 1: Hook — "MANILA" huge + "4.9 stars" + hero photo + tagline
function slideOne(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${BG_WARM};">
      <!-- MANILA huge -->
      <div style="position:absolute;left:54px;top:60px;right:54px;">
        <p style="font-family:${NARROW};font-size:80px;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;color:${MANILA_COLOR};margin:0;">MANILA</p>
      </div>

      <!-- Star rating bar -->
      <div style="position:absolute;left:54px;top:160px;display:flex;align-items:center;gap:14px;">
        <div style="display:flex;gap:2px;">
          ${stars(4.9, 38)}
        </div>
        <span style="font-family:${BOLD};font-size:42px;font-weight:800;color:${TEXT_DARK};">4.9</span>
        <span style="font-family:${BODY};font-size:24px;font-weight:500;color:${TEXT_LIGHT};margin-left:4px;">from 50+ models</span>
      </div>

      <!-- Hero photo -->
      <div style="position:absolute;left:54px;right:54px;top:240px;height:880px;border-radius:24px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.12);">
        <img src="${images.hero}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center 20%;"/>
      </div>

      <!-- Tagline card -->
      <div style="position:absolute;left:54px;right:54px;top:1150px;bottom:${SAFE_BOTTOM + 30}px;">
        <p style="font-family:${BOLD};font-size:52px;font-weight:800;line-height:1.15;color:${TEXT_DARK};margin:0 0 16px;">"Models love this shoot."</p>
        <p style="font-family:${BODY};font-size:28px;font-weight:500;color:${TEXT_MED};margin:0;line-height:1.4;">No experience needed. Editorial portraits<br/>in Manila. Read what they said.</p>
      </div>
    </div>
  `
}

// Slide 2 (animated): Review cards slide in one by one
function slideTwoAnimated(images) {
  const reviews = [
    {
      name: 'Ava M.',
      avatar: images.reviewA,
      rating: 5,
      quote: '"I was so nervous but he directed everything. I just showed up."',
      time: '2 weeks ago'
    },
    {
      name: 'Sofia R.',
      avatar: images.reviewB,
      rating: 5,
      quote: '"Best photos I\'ve ever had. My friends couldn\'t believe it."',
      time: '1 week ago'
    },
    {
      name: 'Mia T.',
      avatar: images.reviewC,
      rating: 5,
      quote: '"Signed up Monday, had photos by Friday. So easy."',
      time: '3 days ago'
    },
    {
      name: 'Jade L.',
      avatar: images.reviewD,
      rating: 4.5,
      quote: '"I\'ve never done a photoshoot before. Now I have a whole portfolio."',
      time: '5 days ago'
    }
  ]

  let reviewCardsHtml = ''
  reviews.forEach((r, i) => {
    const delay = 0.6 + i * 1.0
    reviewCardsHtml += `
      <div class="review-card review-card-${i}" style="
        position:absolute;
        left:54px;right:54px;
        top:${280 + i * 230}px;
        height:210px;
        background:${BG_CARD};
        border-radius:20px;
        box-shadow:0 4px 24px rgba(0,0,0,0.08);
        padding:28px 32px;
        opacity:0;
        transform:translateX(${WIDTH}px);
        animation:slideInCard 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s forwards;
      ">
        <!-- Avatar + name + stars row -->
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:14px;">
          <div style="width:52px;height:52px;border-radius:50%;overflow:hidden;flex-shrink:0;">
            <img src="${r.avatar}" style="width:100%;height:100%;object-fit:cover;object-position:center 15%;"/>
          </div>
          <div style="flex:1;">
            <p style="font-family:${BOLD};font-size:24px;font-weight:700;color:${TEXT_DARK};margin:0 0 4px;">${r.name}</p>
            <div style="display:flex;align-items:center;gap:8px;">
              ${stars(r.rating, 20)}
              <span style="font-family:${BODY};font-size:18px;color:${TEXT_LIGHT};">${r.time}</span>
            </div>
          </div>
        </div>
        <!-- Quote -->
        <p style="font-family:${BODY};font-size:26px;font-weight:500;color:${TEXT_DARK};margin:0;line-height:1.35;">${r.quote}</p>
      </div>
    `
  })

  return `<!DOCTYPE html>
  <html>
    <head>
      <style>
        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; background: ${BG_WARM}; }
        @keyframes slideInCard {
          0% { opacity: 0; transform: translateX(${WIDTH}px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInDown {
          0% { opacity: 0; transform: translateY(-20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .header {
          opacity: 0;
          animation: fadeInDown 0.5s ease-out 0s forwards;
        }
      </style>
    </head>
    <body>
      <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${BG_WARM};">
        <!-- MANILA header -->
        <div class="header" style="position:absolute;left:54px;top:60px;right:54px;">
          <p style="font-family:${NARROW};font-size:80px;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;color:${MANILA_COLOR};margin:0 0 8px;">MANILA</p>
          <p style="font-family:${BOLD};font-size:48px;font-weight:800;color:${TEXT_DARK};margin:0;line-height:1.1;">What they're saying</p>
        </div>

        ${reviewCardsHtml}
      </div>
    </body>
  </html>`
}

// Slide 3: "What you get" styled as product listing
function slideThree(images) {
  const features = [
    { icon: '&#10003;', text: '25+ edited photos delivered' },
    { icon: '&#10003;', text: 'Full direction during the shoot' },
    { icon: '&#10003;', text: 'Zero experience needed' },
    { icon: '&#10003;', text: 'Unique Manila locations' },
    { icon: '&#10003;', text: 'Photos ready in 5 days' },
    { icon: '&#10003;', text: '60-second sign-up' }
  ]

  let featureHtml = ''
  features.forEach((f, i) => {
    featureHtml += `
      <div style="display:flex;align-items:center;gap:20px;padding:22px 0;${i < features.length - 1 ? `border-bottom:1px solid #E8E4DD;` : ''}">
        <div style="width:42px;height:42px;border-radius:50%;background:${ACCENT};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <span style="font-family:${BOLD};font-size:24px;font-weight:800;color:#fff;">${f.icon}</span>
        </div>
        <p style="font-family:${BODY};font-size:30px;font-weight:600;color:${TEXT_DARK};margin:0;">${f.text}</p>
      </div>
    `
  })

  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${BG_WARM};">
      <!-- MANILA header -->
      <div style="position:absolute;left:54px;top:60px;right:54px;">
        <p style="font-family:${NARROW};font-size:80px;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;color:${MANILA_COLOR};margin:0 0 8px;">MANILA</p>
        <p style="font-family:${BOLD};font-size:48px;font-weight:800;color:${TEXT_DARK};margin:0;line-height:1.1;">What you get</p>
      </div>

      <!-- Product-style image -->
      <div style="position:absolute;left:54px;right:54px;top:230px;height:380px;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);">
        <img src="${images.product}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center 30%;"/>
      </div>

      <!-- Feature list card -->
      <div style="position:absolute;left:54px;right:54px;top:634px;background:${BG_CARD};border-radius:20px;box-shadow:0 4px 24px rgba(0,0,0,0.06);padding:20px 32px;">
        ${featureHtml}
      </div>

      <!-- Star rating at bottom -->
      <div style="position:absolute;left:54px;bottom:${SAFE_BOTTOM + 30}px;display:flex;align-items:center;gap:12px;">
        ${stars(4.9, 32)}
        <span style="font-family:${BOLD};font-size:28px;font-weight:700;color:${TEXT_DARK};">4.9</span>
        <span style="font-family:${BODY};font-size:22px;color:${TEXT_LIGHT};">from 50+ models</span>
      </div>
    </div>
  `
}

// Slide 4: CTA — "Join 50+ models. Sign up below."
function slideFour(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${BG_WARM};">
      <!-- MANILA header -->
      <div style="position:absolute;left:54px;top:60px;right:54px;">
        <p style="font-family:${NARROW};font-size:80px;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;color:${MANILA_COLOR};margin:0;">MANILA</p>
      </div>

      <!-- Hero image -->
      <div style="position:absolute;left:54px;right:54px;top:170px;height:640px;border-radius:24px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.12);">
        <img src="${images.cta}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center 25%;"/>
      </div>

      <!-- CTA text block -->
      <div style="position:absolute;left:54px;right:54px;top:845px;">
        <p style="font-family:${BOLD};font-size:58px;font-weight:800;line-height:1.1;color:${TEXT_DARK};margin:0 0 20px;">Join 50+ models.<br/>Sign up below.</p>

        <!-- Aggregate rating -->
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:28px;">
          ${stars(4.9, 34)}
          <span style="font-family:${BOLD};font-size:30px;font-weight:700;color:${TEXT_DARK};">4.9</span>
          <span style="font-family:${BODY};font-size:22px;color:${TEXT_LIGHT};">average rating</span>
        </div>

        <!-- Urgency badge -->
        <div style="display:inline-flex;align-items:center;padding:18px 32px;border-radius:16px;background:${ACCENT};box-shadow:0 4px 16px rgba(232,145,58,0.35);">
          <span style="font-family:${BOLD};font-size:26px;font-weight:700;color:#fff;letter-spacing:0.04em;">LIMITED SPOTS THIS MONTH</span>
        </div>

        <p style="font-family:${BODY};font-size:24px;font-weight:500;color:${TEXT_MED};margin:20px 0 0;line-height:1.4;">60-second form. I'll message you<br/>back within a day.</p>
      </div>
    </div>
  `
}

async function render() {
  resetOutputDir()

  const all = getTopManilaImages()
  const selection = {
    hero: 'manila-gallery-canal-001.jpg',
    reviewA: 'manila-gallery-closeup-001.jpg',
    reviewB: 'manila-gallery-garden-002.jpg',
    reviewC: 'manila-gallery-ivy-001.jpg',
    reviewD: 'manila-gallery-urban-001.jpg',
    product: 'manila-gallery-graffiti-001.jpg',
    cta: 'manila-gallery-statue-001.jpg'
  }

  writeSources({ all_considered: all, selected: selection })

  const images = Object.fromEntries(
    Object.entries(selection).map(([key, file]) => [key, readImage(file)])
  )

  // --- Render static slides (1, 3, 4) as PNGs ---
  const staticSlides = [
    ['01_review_hook.png', wrap(slideOne(images))],
    ['03_what_you_get.png', wrap(slideThree(images))],
    ['04_cta_signup.png', wrap(slideFour(images))]
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
  console.log('Recording animated review cards slide as MP4...')

  // 4 cards * 1.0s stagger + 0.6s initial delay + 0.7s animation = ~5.3s
  // + 1.5s hold = ~6.8s total
  const TOTAL_DURATION_MS = 7000

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
    const dstVideo = path.join(OUT_DIR, '02_review_cards.mp4')
    const { execSync } = await import('child_process')
    try {
      execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${dstVideo}"`, {
        stdio: 'pipe'
      })
      fs.unlinkSync(srcVideo)
      console.log('Rendered 02_review_cards.mp4')
    } catch (err) {
      console.warn('ffmpeg not available, keeping as webm and renaming to mp4...')
      fs.renameSync(srcVideo, dstVideo)
      console.log('Rendered 02_review_cards.mp4 (webm container)')
    }
  }

  await browser.close()
  console.log(`Done: 3 static PNGs + 1 animated MP4 written to ${OUT_DIR}`)
}

render().catch(error => {
  console.error(error)
  process.exit(1)
})
