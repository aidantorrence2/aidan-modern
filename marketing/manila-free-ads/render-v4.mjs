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
const DARK = '#0c1014'
const WARM = '#f5f2ed'
const S = 'text-shadow: 0 2px 4px rgba(0,0,0,0.95), 0 8px 30px rgba(0,0,0,0.7), 0 0 80px rgba(0,0,0,0.4);'

const card = (text) => `
  <div style="background:rgba(12,16,20,0.03);border-radius:16px;padding:22px 28px;border:1px solid rgba(12,16,20,0.06);">
    <p style="font-family:${SANS};font-size:30px;color:#3a3a3a;margin:0;line-height:1.35;">${text}</p>
  </div>
`
const cardWhite = (text) => `
  <div style="background:rgba(255,255,255,0.06);border-radius:16px;padding:22px 28px;border:1px solid rgba(255,255,255,0.08);">
    <p style="font-family:${SANS};font-size:30px;color:rgba(255,255,255,0.85);margin:0;line-height:1.35;">${text}</p>
  </div>
`

function hookSlide(name, heroImg, subtext) {
  return {
    name,
    html: `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
        <img src="${heroImg}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(1.1) contrast(1.05);"/>
        <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 20%, transparent 45%, rgba(0,0,0,0.92) 100%);"></div>
        <div style="position:absolute;bottom:280px;left:64px;right:64px;">
          <h1 style="font-family:${SERIF};font-size:148px;font-weight:700;font-style:italic;color:white;line-height:0.88;margin:0;${S}">Manila</h1>
          <h2 style="font-family:${SERIF};font-size:108px;font-weight:700;font-style:italic;color:white;line-height:0.92;margin:12px 0 0;${S}">Free photo<br/>shoot</h2>
          <p style="font-family:${SANS};font-size:30px;color:rgba(255,255,255,0.6);margin:32px 0 0 4px;${S}">${subtext}</p>
        </div>
      </div>
    `
  }
}

function proofSlide(name, headline, images, bg = DARK) {
  const isDark = bg === DARK
  const color = isDark ? 'white' : '#0c1014'
  const subColor = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(12,16,20,0.45)'
  // Scattered mosaic layout — 8 images with slight rotations and drop shadows
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
  return {
    name,
    html: `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:${bg};">
        <div style="position:absolute;bottom:200px;left:64px;right:64px;text-align:center;">
          <h2 style="font-family:${SERIF};font-size:72px;font-weight:700;font-style:italic;color:${color};line-height:0.98;margin:0;">${headline}</h2>
          <p style="font-family:${SANS};font-size:28px;color:${subColor};margin:16px 0 0;">No experience needed. I direct everything.</p>
        </div>
        ${imgHtml}
      </div>
    `
  }
}

function howSlide(name, headline, steps) {
  const stepsHtml = steps.map((step, i) => `
            <div>
              <p style="font-family:${SANS};font-size:32px;font-weight:800;color:rgba(255,255,255,0.15);margin:0 0 8px;">${String(i+1).padStart(2,'0')}</p>
              <p style="font-family:${SERIF};font-size:42px;font-weight:700;color:white;margin:0;line-height:1.2;">${step}</p>
            </div>
            ${i < steps.length - 1 ? '<div style="width:100%;height:1px;background:rgba(255,255,255,0.08);"></div>' : ''}
  `).join('')
  return {
    name,
    html: `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:${DARK};">
        <div style="position:absolute;top:0;left:0;right:0;bottom:0;display:flex;flex-direction:column;justify-content:center;padding:0 64px;">
          <h2 style="font-family:${SERIF};font-size:86px;font-weight:700;font-style:italic;color:white;line-height:0.98;margin:0 0 56px;">${headline}</h2>
          <div style="display:flex;flex-direction:column;gap:36px;">${stepsHtml}</div>
          <p style="font-family:${SANS};font-size:28px;color:rgba(255,255,255,0.3);margin:52px 0 0;">100% free</p>
        </div>
      </div>
    `
  }
}

function howSlideWarm(name, headline, steps) {
  const stepsHtml = steps.map((step, i) => `
            <div style="display:flex;align-items:flex-start;gap:20px;">
              <span style="font-family:${SANS};display:flex;align-items:center;justify-content:center;width:52px;height:52px;border-radius:50%;background:#0c1014;color:white;font-size:24px;font-weight:700;flex-shrink:0;">${i+1}</span>
              <p style="font-family:${SERIF};font-size:38px;font-weight:700;color:#0c1014;margin:0;line-height:1.2;padding-top:4px;">${step}</p>
            </div>
            ${i < steps.length - 1 ? '<div style="width:100%;height:1px;background:rgba(12,16,20,0.08);"></div>' : ''}
  `).join('')
  return {
    name,
    html: `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:${WARM};">
        <div style="position:absolute;top:0;left:0;right:0;bottom:0;display:flex;flex-direction:column;justify-content:center;padding:0 64px;">
          <h2 style="font-family:${SERIF};font-size:86px;font-weight:700;font-style:italic;color:#0c1014;line-height:0.98;margin:0 0 56px;">${headline}</h2>
          <div style="display:flex;flex-direction:column;gap:32px;">${stepsHtml}</div>
        </div>
      </div>
    `
  }
}

function whatSlide(name, headline, items, thumbs = []) {
  const thumbHtml = thumbs.length ? `
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:auto;">
            ${thumbs.map(src => `<img src="${src}" style="width:100%;height:280px;object-fit:cover;border-radius:14px;display:block;"/>`).join('\n            ')}
          </div>` : ''
  return {
    name,
    html: `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:${WARM};">
        <div style="position:absolute;top:180px;left:64px;right:64px;bottom:100px;display:flex;flex-direction:column;">
          <h2 style="font-family:${SERIF};font-size:86px;font-weight:700;font-style:italic;color:#0c1014;line-height:0.98;margin:0 0 44px;">${headline}</h2>
          <div style="display:flex;flex-direction:column;gap:14px;margin-bottom:40px;">
            ${items.map(t => card(t)).join('\n            ')}
          </div>
          <p style="font-family:${SANS};font-size:28px;font-weight:700;color:#15803d;margin:0 0 20px;">100% free</p>
          ${thumbHtml}
        </div>
      </div>
    `
  }
}

function whatSlideDark(name, headline, items, thumbs = []) {
  const thumbHtml = thumbs.length ? `
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:auto;">
            ${thumbs.map(src => `<img src="${src}" style="width:100%;height:240px;object-fit:cover;border-radius:14px;display:block;"/>`).join('\n            ')}
          </div>` : ''
  return {
    name,
    html: `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:${DARK};">
        <div style="position:absolute;top:180px;left:64px;right:64px;bottom:100px;display:flex;flex-direction:column;">
          <h2 style="font-family:${SERIF};font-size:86px;font-weight:700;font-style:italic;color:white;line-height:0.98;margin:0 0 44px;">${headline}</h2>
          <div style="display:flex;flex-direction:column;gap:14px;margin-bottom:40px;">
            ${items.map(t => cardWhite(t)).join('\n            ')}
          </div>
          ${thumbHtml}
        </div>
      </div>
    `
  }
}

function ctaSlide(name, heroImg, headline, subtext) {
  return {
    name,
    html: `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
        <img src="${heroImg}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(1.1) brightness(0.8);"/>
        <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.15) 30%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.88) 100%);"></div>
        <div style="position:absolute;bottom:280px;left:64px;right:64px;">
          <h2 style="font-family:${SERIF};font-size:108px;font-weight:700;font-style:italic;color:white;line-height:0.95;margin:0;${S}">${headline}</h2>
          <p style="font-family:${SANS};font-size:32px;color:rgba(255,255,255,0.7);margin:28px 0 0 4px;line-height:1.4;${S}">${subtext}</p>
        </div>
        <div style="position:absolute;bottom:120px;left:64px;">
          <div style="display:inline-flex;align-items:center;border-radius:999px;padding:18px 40px;background:white;">
            <span style="font-family:${SANS};font-size:22px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#0c1014;">Message me</span>
          </div>
        </div>
      </div>
    `
  }
}

const deliverables = [
  'Directed photo session in Manila',
  '10+ edited photos for your portfolio',
  'Location and outfit guidance',
  'Gallery delivered in 7 days'
]
const steps = [
  'Message me on Instagram or WhatsApp',
  'We chat and plan your shoot',
  'Show up and get great photos'
]

const versionA = [
  hookSlide('A_01_hook', img0911, 'No experience needed. I direct everything.'),
  proofSlide('A_02_proof', 'My recent work', proof8),
  howSlide('A_03_how', 'Three steps.', steps),
  whatSlide('A_04_what', 'Everything<br/>included.', deliverables, [imgGarden2, imgUrban3]),
  ctaSlide('A_05_cta', imgTropical, "Let's shoot.", 'DM me on Instagram or WhatsApp to book your free session.')
]

const versionB = [
  hookSlide('B_01_hook', imgUrban3, 'Want photos like these? No experience needed.'),
  proofSlide('B_02_proof', 'My recent work', proof8),
  howSlideWarm('B_03_how', 'Super simple.', steps),
  whatSlideDark('B_04_what', 'All of this.<br/>For free.', deliverables),
  ctaSlide('B_05_cta', imgIvy2, 'Your turn.', 'DM me to book your free photo shoot in Manila.')
]

const versionC = [
  hookSlide('C_01_hook', imgMarket, "Limited spots available."),
  proofSlide('C_02_proof', 'My work', proof8),
  howSlide('C_03_how', 'Dead simple.', steps),
  whatSlide('C_04_what', 'What you<br/>walk away with.', deliverables),
  ctaSlide('C_05_cta', imgNight3, "Don't miss out.", 'Message me to lock in your free session.')
]

const versionD = [
  hookSlide('D_01_hook', imgGarden2, 'No experience needed. I direct everything.'),
  proofSlide('D_02_proof', 'Recent shoots', proof8, WARM),
  howSlide('D_03_how', 'Easy as 1-2-3.', steps),
  whatSlide('D_04_what', "Here's what<br/>you get.", deliverables),
  ctaSlide('D_05_cta', imgFloor, "Let's create<br/>something.", 'Message me to book your free session.')
]

const versionE = [
  hookSlide('E_01_hook', imgRocks, 'Build your portfolio for free.'),
  proofSlide('E_02_proof', 'Photos I take', proof8),
  howSlideWarm('E_03_how', 'Three steps<br/>to great photos.', steps),
  whatSlideDark('E_04_what', 'Portfolio-ready<br/>photos. Free.', deliverables, [imgCanal2, imgIvy2]),
  ctaSlide('E_05_cta', imgGarden2, 'Ready?', 'DM me on Instagram or WhatsApp.<br/>Free photo shoot in Manila.')
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
    await page.setContent(`<!DOCTYPE html><html><head><style>*{margin:0;padding:0;box-sizing:border-box;}</style></head><body>${slide.html}</body></html>`, { waitUntil: 'load' })
    await page.waitForTimeout(500)
    await page.screenshot({ path: path.join(OUT, version, `${slide.name}.png`), type: 'png' })
    await page.close()
    console.log(`OK ${slide.name}`)
  }

  await browser.close()
  console.log(`\nDone — ${allSlides.length} slides -> ${OUT}`)
}

render()
