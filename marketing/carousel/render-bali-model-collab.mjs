import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import fs from 'fs'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, 'output-v3', 'bali-model-collab')
const IMG_DIR = path.join(__dirname, '..', '..', 'public', 'images', 'large')
const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 410

const SERIF = "Georgia, 'Times New Roman', serif"
const SANS = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
const MONO = "'SFMono-Regular', Consolas, 'Liberation Mono', monospace"

const photos = {
  hero: 'manila-gallery-urban-003.jpg',
  proofA: 'manila-gallery-dsc-0190.jpg',
  proofB: 'manila-gallery-canal-001.jpg',
  proofC: 'manila-gallery-dsc-0911.jpg',
  proofD: 'manila-gallery-dsc-0075.jpg',
  detail: 'manila-gallery-night-003.jpg',
  cta: 'manila-gallery-ivy-002.jpg'
}

function img(filename) {
  const file = path.join(IMG_DIR, filename)
  const buf = fs.readFileSync(file)
  return `data:image/jpeg;base64,${buf.toString('base64')}`
}

const imageData = Object.fromEntries(
  Object.entries(photos).map(([key, filename]) => [key, img(filename)])
)

function grain(opacity = 0.12) {
  return `
    <div style="position:absolute;inset:0;pointer-events:none;opacity:${opacity};mix-blend-mode:soft-light;background-image:
      repeating-linear-gradient(0deg, rgba(255,255,255,0.10) 0 1px, transparent 1px 5px),
      repeating-linear-gradient(90deg, rgba(255,255,255,0.07) 0 1px, transparent 1px 7px),
      radial-gradient(circle at 23% 18%, rgba(255,255,255,0.44), transparent 19%),
      radial-gradient(circle at 75% 86%, rgba(255,255,255,0.22), transparent 21%);"></div>
  `
}

function label(text, color = '#f5efe3') {
  return `<div style="font-family:${MONO};font-size:23px;letter-spacing:0.17em;text-transform:uppercase;color:${color};">${text}</div>`
}

function chrome(content, bg = '#0c0d0c') {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${bg};">
      ${content}
      ${grain(0.1)}
    </div>
  `
}

function slide01() {
  return {
    name: '01-bali-model-test-collab',
    html: chrome(`
      <img src="${imageData.hero}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;filter:saturate(1.02) contrast(1.05);"/>
      <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(3,7,7,0.20) 0%, rgba(3,7,7,0.12) 35%, rgba(3,7,7,0.92) 82%, rgba(3,7,7,0.98) 100%);"></div>
      <div style="position:absolute;left:64px;right:64px;bottom:430px;">
        ${label('Canggu / Ubud / Uluwatu')}
        <h1 style="font-family:${SERIF};font-size:128px;font-weight:700;font-style:italic;line-height:0.90;color:#fff7ea;margin:30px 0 0;text-shadow:0 10px 34px rgba(0,0,0,0.55);">Bali model<br/>test collab</h1>
        <p style="font-family:${SANS};font-size:36px;line-height:1.35;color:rgba(255,247,234,0.82);margin:34px 0 0;max-width:840px;">Casting 3-5 people for an editorial portrait series. No session fee. Selected applicants only.</p>
      </div>
    `)
  }
}

function slide02() {
  const items = [
    ['In Bali this week', 'You can meet in Canggu, Ubud, or Uluwatu.'],
    ['Can confirm fast', 'WhatsApp confirmation keeps the slot.'],
    ['Want editorial photos', 'Portfolio, creator, or personal brand use.'],
    ['Comfortable being directed', 'No modeling agency required.']
  ]
  const cards = items.map(([title, body], i) => `
    <div style="display:grid;grid-template-columns:64px 1fr;gap:22px;align-items:flex-start;border-top:1px solid rgba(24,24,22,0.16);padding-top:${i === 0 ? 0 : 28}px;">
      <div style="width:64px;height:64px;border-radius:50%;background:#111;color:#f7f1e6;display:flex;align-items:center;justify-content:center;font-family:${MONO};font-size:28px;font-weight:700;">${i + 1}</div>
      <div>
        <div style="font-family:${SANS};font-size:38px;font-weight:800;color:#111;line-height:1.06;">${title}</div>
        <div style="font-family:${SANS};font-size:29px;color:#57534c;line-height:1.34;margin-top:10px;">${body}</div>
      </div>
    </div>
  `).join('')

  return {
    name: '02-who-qualifies',
    html: chrome(`
      <div style="position:absolute;inset:0;background:#f7f1e6;"></div>
      <div style="position:absolute;top:80px;left:64px;right:64px;">
        ${label('Not a random freebie', '#6c5b44')}
        <h2 style="font-family:${SERIF};font-size:100px;font-weight:700;font-style:italic;line-height:0.94;color:#111;margin:28px 0 0;">This is for you if...</h2>
      </div>
      <div style="position:absolute;left:64px;right:64px;top:505px;display:flex;flex-direction:column;gap:28px;">
        ${cards}
      </div>
      <div style="position:absolute;left:64px;right:64px;bottom:430px;background:#18241e;border-radius:28px;padding:30px 34px;">
        <div style="font-family:${SANS};font-size:33px;font-weight:800;color:#fff7ea;line-height:1.18;">Selected collaboration, not an open-call shoot for everyone.</div>
      </div>
    `, '#f7f1e6')
  }
}

function slide03() {
  const slots = [
    { src: imageData.proofA, x: 72, y: 520, w: 308, h: 430, r: -2.4 },
    { src: imageData.proofB, x: 408, y: 490, w: 300, h: 440, r: 1.4 },
    { src: imageData.proofC, x: 735, y: 535, w: 270, h: 410, r: -1.6 },
    { src: imageData.proofD, x: 122, y: 980, w: 305, h: 410, r: 1.8 },
    { src: imageData.detail, x: 492, y: 958, w: 470, h: 430, r: -1.2 }
  ]
  const images = slots.map(slot => `
    <img src="${slot.src}" style="position:absolute;left:${slot.x}px;top:${slot.y}px;width:${slot.w}px;height:${slot.h}px;object-fit:cover;transform:rotate(${slot.r}deg);border:14px solid #fbf5ea;box-shadow:0 26px 60px rgba(0,0,0,0.32);"/>
  `).join('')

  return {
    name: '03-style-proof',
    html: chrome(`
      <div style="position:absolute;inset:0;background:linear-gradient(180deg,#0e1713 0%,#12100d 100%);"></div>
      <div style="position:absolute;top:96px;left:64px;right:64px;text-align:center;">
        ${label('The mood')}
        <h2 style="font-family:${SERIF};font-size:82px;font-weight:700;font-style:italic;color:#fff7ea;line-height:0.96;margin:24px 0 0;">Editorial, cinematic,<br/>guided.</h2>
      </div>
      ${images}
      <div style="position:absolute;left:64px;right:64px;bottom:430px;text-align:center;">
        <p style="font-family:${SANS};font-size:34px;font-weight:700;line-height:1.28;color:#fff7ea;margin:0;">You do not need to know poses. I direct the whole shoot.</p>
      </div>
    `)
  }
}

function slide04() {
  const items = [
    '1-2 hour directed portrait shoot',
    'Edited images for portfolio and social',
    'Location, outfit, and moodboard planning',
    'Simple usage agreement before we shoot'
  ]
  const bullets = items.map(item => `
    <div style="display:flex;gap:18px;align-items:flex-start;">
      <div style="width:20px;height:20px;border-radius:50%;background:#d84f35;margin-top:13px;flex:0 0 auto;"></div>
      <div style="font-family:${SANS};font-size:36px;line-height:1.24;color:#222;">${item}</div>
    </div>
  `).join('')

  return {
    name: '04-what-you-get',
    html: chrome(`
      <img src="${imageData.cta}" style="position:absolute;inset:0;width:100%;height:49%;object-fit:cover;object-position:center 35%;"/>
      <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0.16) 0%,rgba(0,0,0,0.0) 28%,#f8f0e1 49%,#f8f0e1 100%);"></div>
      <div style="position:absolute;top:110px;left:64px;right:64px;">
        ${label('TFP / time-for-photos')}
      </div>
      <div style="position:absolute;left:64px;right:64px;top:890px;">
        <h2 style="font-family:${SERIF};font-size:86px;font-weight:700;font-style:italic;line-height:0.98;color:#111;margin:0 0 34px;">No session fee.<br/>Real deliverables.</h2>
        <div style="display:flex;flex-direction:column;gap:22px;">${bullets}</div>
      </div>
      <div style="position:absolute;left:64px;right:64px;bottom:430px;background:#111;border-radius:26px;padding:28px 32px;">
        <p style="font-family:${SANS};font-size:30px;line-height:1.30;color:#fff7ea;margin:0;">This is a collaboration, not a paid modeling job.</p>
      </div>
    `, '#f8f0e1')
  }
}

function slide05() {
  return {
    name: '05-apply',
    html: chrome(`
      <img src="${imageData.proofB}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;filter:saturate(1.02) contrast(1.03) brightness(0.86);"/>
      <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(4,6,6,0.24) 0%, rgba(4,6,6,0.36) 34%, rgba(4,6,6,0.94) 84%, rgba(4,6,6,0.98) 100%);"></div>
      <div style="position:absolute;left:64px;right:64px;bottom:430px;">
        ${label('Apply if you can actually show up')}
        <h2 style="font-family:${SERIF};font-size:122px;font-weight:700;font-style:italic;color:#fff7ea;line-height:0.90;margin:28px 0 0;">Send<br/>BALI</h2>
        <div style="margin-top:36px;display:flex;flex-direction:column;gap:18px;">
          <p style="font-family:${SANS};font-size:36px;font-weight:800;line-height:1.25;color:#fff7ea;margin:0;">Include your IG, Bali area, availability, and 2 recent photos.</p>
          <p style="font-family:${SANS};font-size:30px;line-height:1.34;color:rgba(255,247,234,0.70);margin:0;">I will send the concept, exact location options, and confirmation details.</p>
        </div>
      </div>
    `)
  }
}

const slides = [slide01(), slide02(), slide03(), slide04(), slide05()]

async function render() {
  fs.rmSync(OUT, { recursive: true, force: true })
  fs.mkdirSync(OUT, { recursive: true })

  fs.writeFileSync(path.join(OUT, 'sources.json'), JSON.stringify({
    strategy: 'Bali model-test / TFP collaboration carousel. Replaces broad free-shoot framing with selective, high-intent qualification.',
    format: `${WIDTH}x${HEIGHT} story/reels safe carousel`,
    safeBottomPixels: SAFE_BOTTOM,
    slides: slides.map(slide => slide.name),
    photos
  }, null, 2))

  const browser = await chromium.launch()
  const context = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1
  })

  for (const [index, slide] of slides.entries()) {
    const page = await context.newPage()
    await page.setContent(`<!doctype html><html><head><meta charset="utf-8"/><style>
      * { box-sizing: border-box; }
      html, body { margin: 0; width: ${WIDTH}px; height: ${HEIGHT}px; background: #000; overflow: hidden; }
      body { -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; }
    </style></head><body>${slide.html}</body></html>`, { waitUntil: 'load' })
    await page.screenshot({
      path: path.join(OUT, `${slide.name}.png`),
      type: 'png'
    })
    await page.close()
    console.log(`[${index + 1}/${slides.length}] ${slide.name}`)
  }

  await browser.close()
  console.log(`Done -> ${OUT}`)
}

render().catch(err => {
  console.error(err)
  process.exit(1)
})
