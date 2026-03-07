import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, 'v4')
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

// The 8 proof images (same across all versions)
const proof8 = [img0190, imgCanal1, img0911, imgMarket, imgPark, imgStatue, imgStreet, imgUrban3]

const SERIF = "Georgia, 'Times New Roman', serif"
const SANS = "Inter, -apple-system, system-ui, sans-serif"
const S = 'text-shadow: 0 2px 4px rgba(0,0,0,0.95), 0 8px 30px rgba(0,0,0,0.7), 0 0 80px rgba(0,0,0,0.4);'

// ── Shared layers (inspired by ultimate) ──

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
      ${bgPhoto ? `<img src="${bgPhoto}" style="position:absolute;right:-90px;bottom:-120px;width:760px;height:1040px;object-fit:contain;object-position:center;opacity:0.3;display:block;filter:saturate(1.02) contrast(1.02);"/>` : ''}
      ${content}
      ${filmGrain(0.06)}
    </div>
  `
}

// ── Slide templates ──

function hookSlide(name, heroImg, subtext) {
  return {
    name,
    html: `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
        <img src="${heroImg}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(1.1) contrast(1.05);"/>
        <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 20%, transparent 45%, rgba(0,0,0,0.92) 100%);"></div>
        <div style="position:absolute;bottom:440px;left:64px;right:64px;">
          <h1 style="font-family:${SERIF};font-size:148px;font-weight:700;font-style:italic;color:white;line-height:0.88;margin:0;${S}">Manila</h1>
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
    { left: 40,  top: 260,  w: 310, h: 400, rot: -2.5 },
    { left: 380, top: 230,  w: 310, h: 400, rot: 1.8 },
    { left: 720, top: 280,  w: 310, h: 400, rot: -1.2 },
    { left: 80,  top: 680,  w: 290, h: 380, rot: 1.6 },
    { left: 420, top: 650,  w: 290, h: 380, rot: -2.0 },
    { left: 730, top: 700,  w: 290, h: 380, rot: 2.4 },
    { left: 160, top: 1080, w: 340, h: 440, rot: -1.4 },
    { left: 560, top: 1060, w: 340, h: 440, rot: 1.9 }
  ]
  const imgHtml = images.map((src, i) => {
    const s = slots[i]
    return `<img src="${src}" style="position:absolute;left:${s.left}px;top:${s.top}px;width:${s.w}px;height:${s.h}px;object-fit:contain;object-position:center;display:block;transform:rotate(${s.rot}deg);filter:drop-shadow(0 20px 36px rgba(0,0,0,0.4));"/>`
  }).join('\n        ')

  const inner = `
        <div style="position:absolute;bottom:400px;left:64px;right:64px;text-align:center;">
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

function howSlide(name, headline, steps, bgPhoto) {
  const stepsHtml = steps.map((step, i) => `
        <div style="display:flex;gap:18px;align-items:flex-start;padding:24px 0;border-bottom:1px solid rgba(217,228,255,0.2);">
          <span style="font-family:${SERIF};font-size:50px;line-height:1;color:white;width:38px;flex-shrink:0;">${i + 1}</span>
          <p style="font-family:${SANS};font-size:35px;line-height:1.32;color:rgba(245,247,255,0.9);margin:0;">${step}</p>
        </div>
  `).join('')

  const content = `
      <div style="position:absolute;left:90px;right:90px;top:300px;text-align:center;">
        <h2 style="font-family:${SERIF};font-size:96px;font-weight:700;line-height:0.95;color:white;margin:0;${S}">${headline}</h2>
      </div>
      <div style="position:absolute;left:120px;right:120px;top:640px;">${stepsHtml}</div>
      <div style="position:absolute;left:120px;right:120px;bottom:420px;text-align:center;">
        <p style="font-family:${SANS};font-size:28px;color:rgba(255,255,255,0.3);">100% free</p>
      </div>
  `
  return { name, html: darkShell(bgPhoto, 0.35, content) }
}

function howSlideWarm(name, headline, steps, bgPhoto) {
  const stepsHtml = steps.map((step, i) => `
        <div style="display:flex;gap:18px;align-items:flex-start;padding:20px 0;border-bottom:1px solid rgba(83,54,39,0.15);">
          <span style="font-family:'Futura','Avenir Next Condensed',sans-serif;font-size:23px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#9f6a52;width:42px;flex-shrink:0;">0${i + 1}</span>
          <p style="font-family:${SANS};font-size:34px;line-height:1.34;color:#5d4334;margin:0;">${step}</p>
        </div>
  `).join('')

  const content = `
      <div style="position:absolute;left:90px;right:90px;top:300px;text-align:center;">
        <h2 style="font-family:${SERIF};font-size:96px;font-weight:700;line-height:0.95;color:#35231a;margin:0;">${headline}</h2>
      </div>
      <div style="position:absolute;left:110px;right:110px;top:630px;">${stepsHtml}</div>
  `
  return { name, html: warmShell(bgPhoto, content) }
}

function whatSlide(name, headline, items, bgPhoto) {
  const itemsHtml = items.map((item, i) => `
        <div style="display:flex;gap:18px;align-items:flex-start;padding:18px 0;border-bottom:1px solid rgba(83,54,39,0.15);">
          <span style="font-family:'Futura','Avenir Next Condensed',sans-serif;font-size:23px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#9f6a52;width:42px;flex-shrink:0;">0${i + 1}</span>
          <p style="font-family:${SANS};font-size:34px;line-height:1.34;color:#5d4334;margin:0;">${item}</p>
        </div>
  `).join('')

  const content = `
      <div style="position:absolute;left:90px;right:90px;top:300px;text-align:center;">
        <h2 style="font-family:${SERIF};font-size:96px;font-weight:700;line-height:0.95;color:#35231a;margin:0;">${headline}</h2>
        <p style="font-family:${SANS};font-size:30px;line-height:1.34;color:#5d4334;margin:18px auto 0;max-width:760px;">Simple process, great photos, no complicated steps.</p>
      </div>
      <div style="position:absolute;left:110px;right:110px;top:630px;">${itemsHtml}</div>
  `
  return { name, html: warmShell(bgPhoto, content) }
}

function whatSlideDark(name, headline, items, bgPhoto) {
  const itemsHtml = items.map((item, i) => `
        <div style="display:flex;gap:18px;align-items:flex-start;padding:24px 0;border-bottom:1px solid rgba(217,228,255,0.2);">
          <span style="font-family:${SERIF};font-size:50px;line-height:1;color:white;width:38px;flex-shrink:0;">${i + 1}</span>
          <p style="font-family:${SANS};font-size:35px;line-height:1.32;color:rgba(245,247,255,0.9);margin:0;">${item}</p>
        </div>
  `).join('')

  const content = `
      <div style="position:absolute;left:90px;right:90px;top:300px;text-align:center;">
        <h2 style="font-family:${SERIF};font-size:96px;font-weight:700;line-height:0.95;color:white;margin:0;${S}">${headline}</h2>
      </div>
      <div style="position:absolute;left:120px;right:120px;top:640px;">${itemsHtml}</div>
  `
  return { name, html: darkShell(bgPhoto, 0.3, content) }
}

function ctaSlide(name, heroImg, headline, subtext) {
  const content = `
      <div style="position:absolute;left:90px;right:90px;top:340px;text-align:center;">
        <h2 style="font-family:${SERIF};font-size:104px;font-weight:700;line-height:0.95;color:white;margin:0;${S}">${headline}</h2>
        <p style="font-family:${SANS};font-size:33px;line-height:1.34;color:rgba(245,247,255,0.85);margin:22px auto 0;max-width:760px;${S}">${subtext}</p>
      </div>
      <div style="position:absolute;left:120px;right:120px;bottom:440px;display:flex;align-items:center;justify-content:center;padding:20px 0;border-top:1.5px solid rgba(217,228,255,0.35);border-bottom:1.5px solid rgba(217,228,255,0.35);">
        <span style="font-family:${SANS};font-size:33px;font-weight:600;line-height:1.2;color:white;">Message me now</span>
      </div>
  `
  return { name, html: darkShell(heroImg, 0.6, content) }
}

// ── Content ──

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

// ── 5 Versions ──

const versionA = [
  hookSlide('A_01_hook', img0911, 'No experience needed. I direct everything.'),
  proofSlide('A_02_proof', 'My recent work', proof8),
  howSlide('A_03_how', 'Three steps.', steps, img0130),
  whatSlide('A_04_what', 'Everything<br/>included.', deliverables, img0190),
  ctaSlide('A_05_cta', imgTropical, "Let's shoot.", 'DM me on Instagram or WhatsApp to book your free session.')
]

const versionB = [
  hookSlide('B_01_hook', imgUrban3, 'Want photos like these? No experience needed.'),
  proofSlide('B_02_proof', 'My recent work', proof8),
  howSlideWarm('B_03_how', 'Super simple.', steps, img0075),
  whatSlideDark('B_04_what', 'All of this.<br/>For free.', deliverables, imgNight3),
  ctaSlide('B_05_cta', imgIvy2, 'Your turn.', 'DM me to book your free photo shoot in Manila.')
]

const versionC = [
  hookSlide('C_01_hook', imgMarket, 'Limited spots available.'),
  proofSlide('C_02_proof', 'My work', proof8),
  howSlide('C_03_how', 'Dead simple.', steps, imgGarden2),
  whatSlide('C_04_what', 'What you<br/>walk away with.', deliverables, img0911),
  ctaSlide('C_05_cta', imgNight3, "Don't miss out.", 'Message me to lock in your free session.')
]

const versionD = [
  hookSlide('D_01_hook', imgGarden2, 'No experience needed. I direct everything.'),
  proofSlide('D_02_proof', 'Recent shoots', proof8, 'warm'),
  howSlide('D_03_how', 'Easy as 1-2-3.', steps, imgFloor),
  whatSlide('D_04_what', "Here's what<br/>you get.", deliverables, imgCanal2),
  ctaSlide('D_05_cta', imgFloor, "Let's create<br/>something.", 'Message me to book your free session.')
]

const versionE = [
  hookSlide('E_01_hook', imgRocks, 'Build your portfolio for free.'),
  proofSlide('E_02_proof', 'Photos I take', proof8),
  howSlideWarm('E_03_how', 'Three steps<br/>to great photos.', steps, imgIvy2),
  whatSlideDark('E_04_what', 'Portfolio-ready<br/>photos. Free.', deliverables, imgRocks),
  ctaSlide('E_05_cta', imgGarden2, 'Ready?', 'DM me on Instagram or WhatsApp. Free photo shoot in Manila.')
]

const allSlides = [...versionA, ...versionB, ...versionC, ...versionD, ...versionE]

async function render() {
  for (const v of ['A', 'B', 'C', 'D', 'E']) {
    fs.mkdirSync(path.join(OUT, v), { recursive: true })
  }
  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 })

  for (const slide of allSlides) {
    const version = slide.name.charAt(0)
    const page = await context.newPage()
    await page.setContent(`<!doctype html><html><head><style>
      * { box-sizing: border-box; }
      html, body { margin: 0; width: 1080px; height: 1920px; background: #000; overflow: hidden; }
      body { -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; }
    </style></head><body>${slide.html}</body></html>`, { waitUntil: 'load' })
    await page.waitForTimeout(500)
    await page.screenshot({ path: path.join(OUT, version, `${slide.name}.png`), type: 'png' })
    await page.close()
    console.log(`OK ${slide.name}`)
  }

  await browser.close()
  console.log(`\nDone — ${allSlides.length} slides -> ${OUT}`)
}

render()
