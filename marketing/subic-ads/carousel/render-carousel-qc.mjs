import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, 'output-qc')
const IMG_DIR = '/Users/aidantorrence/Documents/aidan-modern/public/images/large'

fs.mkdirSync(OUT, { recursive: true })

function img(filename) {
  const buf = fs.readFileSync(path.join(IMG_DIR, filename))
  return `data:image/jpeg;base64,${buf.toString('base64')}`
}

const img0075 = img('manila-gallery-dsc-0075.jpg')
const img0130 = img('manila-gallery-dsc-0130.jpg')
const img0911 = img('manila-gallery-dsc-0911.jpg')
const img0190 = img('manila-gallery-dsc-0190.jpg')
const imgNight3 = img('manila-gallery-night-003.jpg')
const imgMarket = img('manila-gallery-market-001.jpg')
const imgTropical = img('manila-gallery-tropical-001.jpg')
const imgUrban3 = img('manila-gallery-urban-003.jpg')
const imgGarden2 = img('manila-gallery-garden-002.jpg')
const imgCanal1 = img('manila-gallery-canal-001.jpg')
const imgCanal2 = img('manila-gallery-canal-002.jpg')
const imgFloor = img('manila-gallery-floor-001.jpg')
const imgRocks = img('manila-gallery-rocks-001.jpg')
const imgIvy2 = img('manila-gallery-ivy-002.jpg')
const imgPark = img('manila-gallery-park-001.jpg')
const imgStatue = img('manila-gallery-statue-001.jpg')
const imgStreet = img('manila-gallery-street-001.jpg')
const imgNight1 = img('manila-gallery-night-001.jpg')
const imgIvy1 = img('manila-gallery-ivy-001.jpg')
const imgGarden1 = img('manila-gallery-garden-001.jpg')
const imgCloseup = img('manila-gallery-closeup-001.jpg')
const imgShadow = img('manila-gallery-shadow-001.jpg')

// The 8 proof images (same across all versions)
const proof8 = [img0190, imgCanal1, img0911, imgMarket, imgPark, imgStatue, imgStreet, imgUrban3]

const SERIF = "Georgia, 'Times New Roman', serif"
const SANS = "Inter, -apple-system, system-ui, sans-serif"
const S = 'text-shadow: 0 2px 4px rgba(0,0,0,0.95), 0 8px 30px rgba(0,0,0,0.7), 0 0 80px rgba(0,0,0,0.4);'

// -- Shared layers (inspired by ultimate) --

function filmGrain(opacity = 0.1) {
  return `
    <div style="position:absolute;inset:0;pointer-events:none;opacity:${opacity};mix-blend-mode:soft-light;background-image:
      radial-gradient(circle at 14% 18%, rgba(255,255,255,0.5), transparent 17%),
      radial-gradient(circle at 84% 12%, rgba(255,255,255,0.28), transparent 15%),
      radial-gradient(circle at 50% 80%, rgba(255,255,255,0.22), transparent 22%),
      repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0 1px, transparent 1px 4px),
      repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 5px);"></div>
  `
}

function darkShell(bgPhoto, photoOpacity, content) {
  return `
    <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#080a0e;">
      <div style="position:absolute;inset:0;background:linear-gradient(180deg, #0a1a3a 0%, #080e1a 50%, #060a12 100%);"></div>
      ${bgPhoto ? `<img src="${bgPhoto}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;object-position:center;display:block;opacity:${photoOpacity};filter:saturate(1.07) contrast(1.04);"/>` : ''}
      <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(8,8,14,0.74) 0%, rgba(8,8,14,0.26) 48%, rgba(8,8,14,0.84) 100%);"></div>
      <div style="position:absolute;inset:0;background:
        radial-gradient(circle at 17% 15%, rgba(90,166,255,0.18), transparent 24%),
        radial-gradient(circle at 84% 84%, rgba(255,190,120,0.12), transparent 22%),
        linear-gradient(135deg, rgba(162,194,255,0.1), transparent 26%);"></div>
      ${content}
      ${filmGrain(0.1)}
    </div>
  `
}

function warmShell(bgPhoto, content) {
  return `
    <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#f6ede4;">
      <div style="position:absolute;inset:0;background:linear-gradient(170deg, #fff8f0 0%, #f3e5d7 58%, #eecfb9 100%);"></div>
      <div style="position:absolute;inset:0;background:
        radial-gradient(circle at 82% 14%, rgba(255,170,130,0.2), transparent 22%),
        radial-gradient(circle at 14% 88%, rgba(255,224,184,0.18), transparent 22%);"></div>
      ${bgPhoto ? `<img src="${bgPhoto}" style="position:absolute;right:-90px;bottom:-120px;width:760px;height:1040px;object-fit:contain;object-position:center;opacity:1;display:block;filter:saturate(1.05) contrast(1.03);"/>` : ''}
      ${content}
      ${filmGrain(0.06)}
    </div>
  `
}

// -- Slide templates --

function hookSlide(name, heroImg, subtext, imgPos = 'center') {
  return {
    name,
    html: `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
        <img src="${heroImg}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:${imgPos};filter:saturate(1.1) contrast(1.05);"/>
        <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 20%, transparent 45%, rgba(0,0,0,0.92) 100%);"></div>
        <div style="position:absolute;bottom:440px;left:64px;right:64px;">
          <h1 style="font-family:${SERIF};font-size:108px;font-weight:700;font-style:italic;color:white;line-height:0.88;margin:0;${S}">Quezon City</h1>
          <h2 style="font-family:${SERIF};font-size:108px;font-weight:700;font-style:italic;color:white;line-height:0.92;margin:12px 0 0;${S}">Free photo<br/>shoot</h2>
          <p style="font-family:${SANS};font-size:30px;color:rgba(255,255,255,0.6);margin:32px 0 0 4px;${S}">${subtext}</p>
        </div>
        ${filmGrain(0.1)}
      </div>
    `
  }
}

function proofSlide(name, headline, images, variant = 'dark') {
  const isDark = variant === 'dark'
  const bg = isDark ? '#0c1014' : '#f5f2ed'
  const color = isDark ? 'white' : '#0c1014'
  const subColor = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(12,16,20,0.45)'
  const slots = [
    { left: 40,  top: 380,  w: 290, h: 370, rot: -2.5 },
    { left: 380, top: 350,  w: 290, h: 370, rot: 1.8 },
    { left: 720, top: 400,  w: 290, h: 370, rot: -1.2 },
    { left: 80,  top: 770,  w: 280, h: 350, rot: 1.6 },
    { left: 420, top: 740,  w: 280, h: 350, rot: -2.0 },
    { left: 730, top: 780,  w: 280, h: 350, rot: 2.4 },
    { left: 160, top: 1130, w: 310, h: 390, rot: -1.4 },
    { left: 560, top: 1110, w: 310, h: 390, rot: 1.9 }
  ]
  const imgHtml = images.map((src, i) => {
    const s = slots[i]
    return `<img src="${src}" style="position:absolute;left:${s.left}px;top:${s.top}px;width:${s.w}px;height:${s.h}px;object-fit:contain;object-position:center;display:block;transform:rotate(${s.rot}deg);filter:drop-shadow(0 20px 36px rgba(0,0,0,0.4));"/>`
  }).join('\n        ')

  const inner = `
        <div style="position:absolute;top:220px;left:64px;right:64px;text-align:center;z-index:2;">
          <h2 style="font-family:${SERIF};font-size:72px;font-weight:700;font-style:italic;color:${color};line-height:0.98;margin:0;${isDark ? S : ''}">${headline}</h2>
          <p style="font-family:${SANS};font-size:28px;color:${subColor};margin:16px 0 0;">No experience needed. I direct everything.</p>
        </div>
        ${imgHtml}
  `

  if (isDark) {
    return { name, html: darkShell(null, 0, inner) }
  }
  return { name, html: warmShell(null, inner) }
}

// Split layout: photo top half, warm beige bottom half with text (v1 style)
function splitSlide(name, photo, content) {
  return {
    name,
    html: `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#f7f6f2;">
        <img src="${photo}" style="width:100%;height:50%;object-fit:cover;object-position:center;display:block;"/>
        <div style="position:absolute;top:0;left:0;right:0;height:50%;background:linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 30%, transparent 75%, rgba(247,246,242,1) 100%);"></div>
        <div style="position:absolute;bottom:420px;left:80px;right:80px;">
          ${content}
        </div>
      </div>
    `
  }
}

function howSlide(name, headline, steps, bgPhoto) {
  const stepsHtml = steps.map((step, i) => `
          <div style="display:flex;align-items:flex-start;gap:20px;">
            <span style="font-family:${SANS};display:flex;align-items:center;justify-content:center;width:52px;height:52px;border-radius:50%;background:#0a0a0a;color:white;font-size:26px;font-weight:700;flex-shrink:0;">${i + 1}</span>
            <span style="font-family:${SANS};font-size:34px;color:#404040;line-height:1.35;padding-top:4px;">${step}</span>
          </div>
  `).join('\n')
  const content = `
          <h2 style="font-family:${SERIF};font-size:62px;font-weight:700;color:#0a0a0a;margin:0 0 36px;line-height:1.1;">${headline}</h2>
          <div style="display:flex;flex-direction:column;gap:28px;">${stepsHtml}</div>
          <p style="font-family:${SANS};margin:36px 0 0;font-size:34px;font-weight:600;color:#0a0a0a;line-height:1.3;">No experience needed.<br/>I guide you the whole time.</p>
  `
  return splitSlide(name, bgPhoto, content)
}

function howSlideWarm(name, headline, steps, bgPhoto) {
  return howSlide(name, headline, steps, bgPhoto)
}

function whatSlide(name, headline, items, bgPhoto) {
  const itemsHtml = items.map(item => `
          <div style="display:flex;align-items:flex-start;gap:14px;">
            <span style="font-family:${SANS};font-size:34px;color:#0a0a0a;flex-shrink:0;">-</span>
            <span style="font-family:${SANS};font-size:34px;color:#404040;line-height:1.35;">${item}</span>
          </div>
  `).join('\n')
  const content = `
          <h2 style="font-family:${SERIF};font-size:62px;font-weight:700;color:#0a0a0a;margin:0 0 32px;line-height:1.1;">${headline}</h2>
          <div style="display:flex;flex-direction:column;gap:18px;">${itemsHtml}</div>
  `
  return splitSlide(name, bgPhoto, content)
}

function whatSlideDark(name, headline, items, bgPhoto) {
  return whatSlide(name, headline, items, bgPhoto)
}

function ctaSlide(name, heroImg, headline, subtext) {
  return {
    name,
    html: `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
        <img src="${heroImg}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(1.1) brightness(0.85);"/>
        <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.2) 30%, rgba(0,0,0,0.2) 55%, rgba(0,0,0,0.9) 100%);"></div>
        <div style="position:absolute;bottom:480px;left:64px;right:64px;">
          <h2 style="font-family:${SERIF};font-size:120px;font-weight:700;font-style:italic;color:white;line-height:0.95;margin:0;${S}">${headline}</h2>
          <p style="font-family:${SANS};font-size:36px;color:rgba(255,255,255,0.75);line-height:1.4;margin:28px 0 0 4px;${S}">${subtext}</p>
        </div>
        ${filmGrain(0.1)}
      </div>
    `
  }
}

// -- Content --

const deliverables = [
  'A fun guided shoot where I direct you throughout',
  'Edited photos ready to post right away',
  'Help with vibe, outfits, and location ideas',
  'Direct communication with me from start to finish'
]
const steps = [
  'Message me on Instagram or WhatsApp',
  'We chat and plan your shoot',
  'Show up and get great photos'
]

function signupSlide(name, cityName, heroImg) {
  return {
    name,
    html: `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
        <img src="${heroImg}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(1.05) brightness(0.55);"/>
        <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.3) 30%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.85) 80%, rgba(0,0,0,0.95) 100%);"></div>
        <div style="position:absolute;top:0;left:0;right:0;bottom:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px;">
          <div style="font-family:${SERIF};font-size:100px;font-weight:700;font-style:italic;color:white;text-align:center;line-height:1;margin-bottom:20px;${S}">Sign up</div>
          <div style="font-family:${SANS};font-size:30px;color:rgba(255,255,255,0.6);letter-spacing:2px;text-transform:uppercase;margin-bottom:60px;">FREE PHOTO SHOOT — ${cityName.toUpperCase()}</div>
          <div style="background:white;border-radius:16px;padding:40px 60px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.5);">
            <div style="font-family:${SANS};font-size:28px;font-weight:600;color:#1a1a1a;letter-spacing:1px;margin-bottom:12px;">FILL OUT THE FORM AT</div>
            <div style="font-family:${SERIF};font-size:52px;font-weight:700;color:#1a1a1a;line-height:1.2;">aidantorrence.com/signup</div>
          </div>
          <div style="font-family:${SANS};font-size:28px;color:rgba(255,255,255,0.6);margin-top:40px;text-align:center;line-height:1.5;">Pick your location, share your moodboard,<br/>and choose your photo shoot vibe</div>
        </div>
        ${filmGrain(0.1)}
      </div>
    `
  }
}

// -- Version B only --

const slides = [
  hookSlide('qc-carousel-01-hook', imgUrban3, 'Want photos like these? No experience needed.'),
  proofSlide('qc-carousel-02-proof', 'My recent work', proof8),
  howSlideWarm('qc-carousel-03-how', 'Super simple.', steps, img0075),
  whatSlideDark('qc-carousel-04-what', 'All of this.<br/>For free.', deliverables, imgNight3),
  ctaSlide('qc-carousel-05-cta', imgIvy2, 'Your turn.', 'DM me to book your free photo shoot in Quezon City.'),
  signupSlide('qc-carousel-06-signup', 'Quezon City', imgIvy2)
]

async function render() {
  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 })

  for (const slide of slides) {
    const page = await context.newPage()
    await page.setContent(`<!doctype html><html><head><style>
      * { box-sizing: border-box; }
      html, body { margin: 0; width: 1080px; height: 1920px; background: #000; overflow: hidden; }
      body { -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; }
    </style></head><body>${slide.html}</body></html>`, { waitUntil: 'load' })
    await page.waitForTimeout(500)
    await page.screenshot({ path: path.join(OUT, `${slide.name}.png`), type: 'png' })
    await page.close()
    console.log(`OK ${slide.name}`)
  }

  await browser.close()
  console.log(`\nDone — ${slides.length} slides -> ${OUT}`)
}

render()
