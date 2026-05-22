import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, 'output-v2')
const IMG_DIR = '/Users/aidantorrence/Documents/aidan-modern/public/images/large'
const NEW_DIR = '/Users/aidantorrence/Documents/aidan-modern/public/images/new'

fs.mkdirSync(OUT, { recursive: true })

function img(filename) {
  const buf = fs.readFileSync(path.join(IMG_DIR, filename))
  return `data:image/jpeg;base64,${buf.toString('base64')}`
}

function newImg(filename) {
  const buf = fs.readFileSync(path.join(NEW_DIR, filename))
  return `data:image/jpeg;base64,${buf.toString('base64')}`
}

const img0075 = img('manila-gallery-dsc-0075.jpg')
const img0911 = img('manila-gallery-dsc-0911.jpg')
const img0190 = img('manila-gallery-dsc-0190.jpg')
const imgNight3 = img('manila-gallery-night-003.jpg')
const imgMarket = img('manila-gallery-market-001.jpg')
const imgUrban3 = img('manila-gallery-urban-003.jpg')
const imgIvy2 = img('manila-gallery-ivy-002.jpg')
const imgCanal1 = img('manila-gallery-canal-001.jpg')
const imgPark = img('manila-gallery-park-001.jpg')
const imgStatue = img('manila-gallery-statue-001.jpg')
const imgStreet = img('manila-gallery-street-001.jpg')

const proof8 = [img0190, imgCanal1, img0911, imgMarket, imgPark, imgStatue, imgStreet, imgUrban3]

const SERIF = "Georgia, 'Times New Roman', serif"
const SANS = "Inter, -apple-system, system-ui, sans-serif"
const S = 'text-shadow: 0 2px 4px rgba(0,0,0,0.95), 0 8px 30px rgba(0,0,0,0.7), 0 0 80px rgba(0,0,0,0.4);'

const cities = ['Quezon City', 'Baguio', 'La Union', 'Busan', 'Singapore', 'Bali', 'Canggu', 'Ubud', 'Amed', 'Uluwatu']

function slug(city) {
  return city.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '')
}

function cs(base, city) {
  if (city.length <= 6) return base
  if (city.length <= 8) return Math.round(base * 0.85)
  return Math.round(base * 0.62)
}

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

// -- Slide templates --

function hookSlide(prefix, city, heroImg, subtext, imgPos = 'center') {
  return {
    name: `${prefix}-01-hook`,
    html: `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
        <img src="${heroImg}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:${imgPos};filter:saturate(1.1) contrast(1.05);"/>
        <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 20%, transparent 45%, rgba(0,0,0,0.92) 100%);"></div>
        <div style="position:absolute;bottom:440px;left:64px;right:64px;">
          <h1 style="font-family:${SERIF};font-size:${cs(148,city)}px;font-weight:700;font-style:italic;color:white;line-height:0.88;margin:0;${S}">${city}</h1>
          <h2 style="font-family:${SERIF};font-size:108px;font-weight:700;font-style:italic;color:white;line-height:0.92;margin:12px 0 0;${S}">Free photo<br/>shoot</h2>
          <p style="font-family:${SANS};font-size:30px;color:rgba(255,255,255,0.6);margin:32px 0 0 4px;${S}">${subtext}</p>
        </div>
        ${filmGrain(0.1)}
      </div>
    `
  }
}

function proofSlide(prefix, headline, images) {
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
          <h2 style="font-family:${SERIF};font-size:72px;font-weight:700;font-style:italic;color:white;line-height:0.98;margin:0;${S}">${headline}</h2>
          <p style="font-family:${SANS};font-size:28px;color:rgba(255,255,255,0.55);margin:16px 0 0;">No experience needed. I direct everything.</p>
        </div>
        ${imgHtml}
  `
  return { name: `${prefix}-02-proof`, html: darkShell(null, 0, inner) }
}

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

function howSlide(prefix, headline, steps, bgPhoto) {
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
  return splitSlide(`${prefix}-03-how`, bgPhoto, content)
}

function whatSlide(prefix, headline, items, bgPhoto) {
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
  return splitSlide(`${prefix}-04-what`, bgPhoto, content)
}

function ctaSlide(prefix, city, heroImg) {
  return {
    name: `${prefix}-05-cta`,
    html: `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
        <img src="${heroImg}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(1.1) brightness(0.7);"/>
        <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.25) 30%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.92) 100%);"></div>
        <div style="position:absolute;bottom:380px;left:64px;right:64px;">
          <h2 style="font-family:${SERIF};font-size:110px;font-weight:700;font-style:italic;color:white;line-height:0.95;margin:0;${S}">Your turn.</h2>
          <div style="margin:36px 0 0;display:flex;flex-direction:column;gap:20px;">
            <p style="font-family:${SANS};font-size:36px;color:rgba(255,255,255,0.9);line-height:1.45;margin:0;${S}">Click the button below to sign up for a free photo shoot in ${city}.</p>
            <p style="font-family:${SANS};font-size:32px;color:rgba(255,255,255,0.55);line-height:1.45;margin:0;${S}">Pick your vibe, upload a selfie, and I'll reach out to plan everything. No experience needed.</p>
          </div>
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
  'Click the button below and sign up',
  'We chat and plan your shoot',
  'Show up and get great photos'
]

// -- Build slides for all cities --

const allSlides = []
for (const city of cities) {
  const s = slug(city)
  const prefix = `${s}-carousel`
  allSlides.push(
    hookSlide(prefix, city, imgUrban3, 'Want photos like these? No experience needed.'),
    proofSlide(prefix, 'My recent work', proof8),
    howSlide(prefix, 'Super simple.', steps, img0075),
    whatSlide(prefix, 'All of this.<br/>For free.', deliverables, imgNight3),
    ctaSlide(prefix, city, imgIvy2)
  )
}

// -- Bali paid variant --
{
  const s = 'bali-paid'
  const prefix = `${s}-carousel`
  const paidDeliverables = [
    '1–2 hour directed shoot at your dream location',
    'Edited photos delivered within 48 hours',
    'Outfit, vibe, and location planning together',
    'Direct communication from start to finish'
  ]
  const paidSteps = [
    'Click below and sign up — choose your price',
    'We plan your shoot together',
    'Show up, shoot, and get incredible photos'
  ]
  allSlides.push(
    {
      name: `${prefix}-01-hook`,
      html: `
        <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
          <img src="${imgUrban3}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;filter:saturate(1.1) contrast(1.05);"/>
          <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 20%, transparent 45%, rgba(0,0,0,0.92) 100%);"></div>
          <div style="position:absolute;bottom:440px;left:64px;right:64px;">
            <h1 style="font-family:${SERIF};font-size:148px;font-weight:700;font-style:italic;color:white;line-height:0.88;margin:0;${S}">Bali</h1>
            <h2 style="font-family:${SERIF};font-size:96px;font-weight:700;font-style:italic;color:white;line-height:0.92;margin:12px 0 0;${S}">Photo shoot</h2>
            <p style="font-family:${SANS};font-size:30px;color:rgba(255,255,255,0.6);margin:32px 0 0 4px;${S}">Pay what you want. No minimums.</p>
          </div>
          ${filmGrain(0.1)}
        </div>
      `
    },
    proofSlide(prefix, 'My recent work', proof8),
    howSlide(prefix, 'Super simple.', paidSteps, img0075),
    {
      name: `${prefix}-04-what`,
      html: splitSlide(`${prefix}-04-what`, imgNight3, `
          <h2 style="font-family:${SERIF};font-size:62px;font-weight:700;color:#0a0a0a;margin:0 0 32px;line-height:1.1;">What you get.</h2>
          <div style="display:flex;flex-direction:column;gap:18px;">
            ${paidDeliverables.map(item => `
              <div style="display:flex;align-items:flex-start;gap:14px;">
                <span style="font-family:${SANS};font-size:34px;color:#0a0a0a;flex-shrink:0;">-</span>
                <span style="font-family:${SANS};font-size:34px;color:#404040;line-height:1.35;">${item}</span>
              </div>
            `).join('\n')}
          </div>
          <p style="font-family:${SANS};margin:36px 0 0;font-size:34px;font-weight:600;color:#0a0a0a;line-height:1.3;">Pay what you want.<br/>Seriously — you choose the price.</p>
      `).html
    },
    {
      name: `${prefix}-05-cta`,
      html: `
        <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
          <img src="${imgIvy2}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(1.1) brightness(0.7);"/>
          <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.25) 30%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.92) 100%);"></div>
          <div style="position:absolute;bottom:380px;left:64px;right:64px;">
            <h2 style="font-family:${SERIF};font-size:110px;font-weight:700;font-style:italic;color:white;line-height:0.95;margin:0;${S}">Your turn.</h2>
            <div style="margin:36px 0 0;display:flex;flex-direction:column;gap:20px;">
              <p style="font-family:${SANS};font-size:36px;color:rgba(255,255,255,0.9);line-height:1.45;margin:0;${S}">Click the button below to book your photo shoot in Bali.</p>
              <p style="font-family:${SANS};font-size:32px;color:rgba(255,255,255,0.55);line-height:1.45;margin:0;${S}">Choose your price, pick your vibe, and I'll plan everything. No experience needed.</p>
            </div>
          </div>
          ${filmGrain(0.1)}
        </div>
      `
    }
  )
}

// -- Bali collab variant (model search) --
{
  const s = 'bali-collab'
  const prefix = `${s}-carousel`
  allSlides.push(
    {
      name: `${prefix}-01-hook`,
      html: `
        <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
          <img src="${imgUrban3}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;filter:saturate(1.1) contrast(1.05);"/>
          <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(0,0,0,0.25) 0%, transparent 20%, transparent 40%, rgba(0,0,0,0.94) 100%);"></div>
          <div style="position:absolute;bottom:420px;left:64px;right:64px;">
            <p style="font-family:${SANS};font-size:26px;font-weight:600;color:rgba(255,255,255,0.5);letter-spacing:0.08em;text-transform:uppercase;margin:0 0 16px;${S}">Open call · Bali</p>
            <h1 style="font-family:${SERIF};font-size:108px;font-weight:700;font-style:italic;color:white;line-height:0.92;margin:0;${S}">Looking for<br/>models to<br/>collaborate</h1>
            <p style="font-family:${SANS};font-size:30px;color:rgba(255,255,255,0.55);margin:32px 0 0 4px;line-height:1.5;${S}">I'm a traveling photographer building<br/>new work in Bali. Let's create together.</p>
          </div>
          ${filmGrain(0.1)}
        </div>
      `
    },
    proofSlide(prefix, 'Recent collaborations', proof8),
    {
      name: `${prefix}-03-how`,
      html: splitSlide(`${prefix}-03-how`, img0075, `
          <h2 style="font-family:${SERIF};font-size:62px;font-weight:700;color:#0a0a0a;margin:0 0 36px;line-height:1.1;">How it works</h2>
          <div style="display:flex;flex-direction:column;gap:28px;">
            <div style="display:flex;align-items:flex-start;gap:20px;">
              <span style="font-family:${SANS};display:flex;align-items:center;justify-content:center;width:52px;height:52px;border-radius:50%;background:#0a0a0a;color:white;font-size:26px;font-weight:700;flex-shrink:0;">1</span>
              <span style="font-family:${SANS};font-size:34px;color:#404040;line-height:1.35;padding-top:4px;">DM me or sign up below</span>
            </div>
            <div style="display:flex;align-items:flex-start;gap:20px;">
              <span style="font-family:${SANS};display:flex;align-items:center;justify-content:center;width:52px;height:52px;border-radius:50%;background:#0a0a0a;color:white;font-size:26px;font-weight:700;flex-shrink:0;">2</span>
              <span style="font-family:${SANS};font-size:34px;color:#404040;line-height:1.35;padding-top:4px;">We plan the concept together</span>
            </div>
            <div style="display:flex;align-items:flex-start;gap:20px;">
              <span style="font-family:${SANS};display:flex;align-items:center;justify-content:center;width:52px;height:52px;border-radius:50%;background:#0a0a0a;color:white;font-size:26px;font-weight:700;flex-shrink:0;">3</span>
              <span style="font-family:${SANS};font-size:34px;color:#404040;line-height:1.35;padding-top:4px;">We both walk away with great content</span>
            </div>
          </div>
          <p style="font-family:${SANS};margin:36px 0 0;font-size:34px;font-weight:600;color:#0a0a0a;line-height:1.3;">No experience needed.<br/>I direct the whole shoot.</p>
      `).html
    },
    {
      name: `${prefix}-04-what`,
      html: splitSlide(`${prefix}-04-what`, imgNight3, `
          <h2 style="font-family:${SERIF};font-size:62px;font-weight:700;color:#0a0a0a;margin:0 0 32px;line-height:1.1;">What you get</h2>
          <div style="display:flex;flex-direction:column;gap:18px;">
            ${[
              'Edited photos you can use however you want',
              'Creative direction — I handle posing, lighting, everything',
              'A real collaboration, not a transactional shoot',
              'Content for your portfolio, socials, or agencies',
            ].map(item => `
              <div style="display:flex;align-items:flex-start;gap:14px;">
                <span style="font-family:${SANS};font-size:34px;color:#0a0a0a;flex-shrink:0;">-</span>
                <span style="font-family:${SANS};font-size:34px;color:#404040;line-height:1.35;">${item}</span>
              </div>
            `).join('\n')}
          </div>
          <p style="font-family:${SANS};margin:36px 0 0;font-size:34px;font-weight:600;color:#0a0a0a;line-height:1.3;">TFP — we both build our books.</p>
      `).html
    },
    {
      name: `${prefix}-05-cta`,
      html: `
        <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
          <img src="${imgIvy2}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(1.1) brightness(0.7);"/>
          <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.25) 30%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.92) 100%);"></div>
          <div style="position:absolute;bottom:380px;left:64px;right:64px;">
            <h2 style="font-family:${SERIF};font-size:100px;font-weight:700;font-style:italic;color:white;line-height:0.95;margin:0;${S}">Let's shoot.</h2>
            <div style="margin:36px 0 0;display:flex;flex-direction:column;gap:20px;">
              <p style="font-family:${SANS};font-size:36px;color:rgba(255,255,255,0.9);line-height:1.45;margin:0;${S}">DM me on Instagram or click below to sign up.</p>
              <p style="font-family:${SANS};font-size:32px;color:rgba(255,255,255,0.55);line-height:1.45;margin:0;${S}">Tell me your vibe, send a few photos, and we'll make something worth posting.</p>
            </div>
          </div>
          ${filmGrain(0.1)}
        </div>
      `
    }
  )
}

// -- Bali collab v2: scarcity/urgency hook --
{
  const s = 'bali-collab-v2'
  const prefix = `${s}-carousel`
  allSlides.push(
    {
      name: `${prefix}-01-hook`,
      html: `
        <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
          <img src="${img0190}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center top;filter:saturate(1.1) contrast(1.05);"/>
          <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(0,0,0,0.25) 0%, transparent 20%, transparent 40%, rgba(0,0,0,0.94) 100%);"></div>
          <div style="position:absolute;bottom:420px;left:64px;right:64px;">
            <h1 style="font-family:${SERIF};font-size:98px;font-weight:700;font-style:italic;color:white;line-height:0.92;margin:0;${S}">Collaboration<br/>spots open<br/>this month.</h1>
            <p style="font-family:${SANS};font-size:30px;color:rgba(255,255,255,0.5);margin:32px 0 0 4px;line-height:1.5;${S}">Bali. Traveling photographer. Let's create together.</p>
          </div>
          ${filmGrain(0.1)}
        </div>
      `
    },
    proofSlide(prefix, 'Recent collaborations', proof8),
    howSlide(prefix, 'Super simple.', ['DM me or click the link below', 'We plan the concept together', 'We both get amazing content'], img0075),
    whatSlide(prefix, 'What you get.', [
      'Edited photos — use them however you want',
      'Full creative direction from me',
      'Content for your portfolio or socials',
      'A real creative collaboration'
    ], imgNight3),
    {
      name: `${prefix}-05-cta`,
      html: `
        <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
          <img src="${imgIvy2}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(1.1) brightness(0.7);"/>
          <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.25) 30%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.92) 100%);"></div>
          <div style="position:absolute;bottom:380px;left:64px;right:64px;">
            <h2 style="font-family:${SERIF};font-size:100px;font-weight:700;font-style:italic;color:white;line-height:0.95;margin:0;${S}">Limited spots.</h2>
            <div style="margin:36px 0 0;display:flex;flex-direction:column;gap:20px;">
              <p style="font-family:${SANS};font-size:36px;color:rgba(255,255,255,0.9);line-height:1.45;margin:0;${S}">DM me or click the link to sign up.</p>
              <p style="font-family:${SANS};font-size:32px;color:rgba(255,255,255,0.55);line-height:1.45;margin:0;${S}">I'm only here for a short time. Send me your look and let's make it happen.</p>
            </div>
          </div>
          ${filmGrain(0.1)}
        </div>
      `
    }
  )
}

// -- Bali collab v3: bold/direct hook --
{
  const s = 'bali-collab-v3'
  const prefix = `${s}-carousel`
  allSlides.push(
    {
      name: `${prefix}-01-hook`,
      html: `
        <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
          <img src="${imgNight3}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;filter:saturate(1.1) contrast(1.05);"/>
          <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 20%, transparent 40%, rgba(0,0,0,0.94) 100%);"></div>
          <div style="position:absolute;bottom:420px;left:64px;right:64px;">
            <h1 style="font-family:${SERIF};font-size:118px;font-weight:700;font-style:italic;color:white;line-height:0.90;margin:0;${S}">You should<br/>be in my<br/>portfolio.</h1>
            <h2 style="font-family:${SERIF};font-size:64px;font-weight:700;font-style:italic;color:rgba(255,255,255,0.6);line-height:0.95;margin:28px 0 0;${S}">Open for collaborations<br/>this month.</h2>
          </div>
          ${filmGrain(0.1)}
        </div>
      `
    },
    proofSlide(prefix, 'My work', proof8),
    howSlide(prefix, 'Super simple.', ['DM me on Instagram', 'We plan your shoot together', 'Show up and we create something great'], img0075),
    whatSlide(prefix, 'What you get.', [
      'Edited photos for your portfolio and socials',
      'I direct everything — no experience needed',
      'We plan the concept, location, and vibe together',
      'A collaboration, not a transaction'
    ], imgNight3),
    {
      name: `${prefix}-05-cta`,
      html: `
        <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
          <img src="${imgCanal1}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(1.1) brightness(0.7);"/>
          <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.25) 30%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.92) 100%);"></div>
          <div style="position:absolute;bottom:380px;left:64px;right:64px;">
            <h2 style="font-family:${SERIF};font-size:110px;font-weight:700;font-style:italic;color:white;line-height:0.95;margin:0;${S}">DM me.</h2>
            <div style="margin:36px 0 0;display:flex;flex-direction:column;gap:20px;">
              <p style="font-family:${SANS};font-size:36px;color:rgba(255,255,255,0.9);line-height:1.45;margin:0;${S}">@madebyaidan on Instagram.</p>
              <p style="font-family:${SANS};font-size:32px;color:rgba(255,255,255,0.55);line-height:1.45;margin:0;${S}">Send me a few photos and your vibe. I'll handle the rest.</p>
            </div>
          </div>
          ${filmGrain(0.1)}
        </div>
      `
    }
  )
}

// -- Bali proof-heavy: 10 slides, new photos, beautiful layouts, collab framing --
{
  const s = 'bali-proof'
  const prefix = s + '-carousel'
  const G = 6 // gap between images
  // Load new portfolio photos
  const n01 = newImg('000001.jpg')       // bicycle street
  const n03 = newImg('000003.jpg')       // blue wall sitting
  const n04 = newImg('000004.jpg')       // blue wall curly hair
  const n05 = newImg('000005-3.jpg')     // silver dress cafe
  const n06 = newImg('000006-12.jpg')    // silver dress smoking
  const n07 = newImg('000007-3.jpg')     // silver dress kegs
  const n08 = newImg('000008-3.jpg')     // corset circular frame
  const n09 = newImg('000009.jpg')       // market stall dark dress
  const n10 = newImg('000010-11.jpg')    // denim jacket waterfall
  const n11 = newImg('000011-4.jpg')     // arms up white top
  const n12 = newImg('000012.jpg')       // dark dress shutter
  const n13 = newImg('000013-3.jpg')     // night dragon top wall
  const n14 = newImg('000014-3.jpg')     // night railing
  const n15 = newImg('000015-3.jpg')     // night street fashion
  const n16 = newImg('000016.jpg')       // closeup hands face
  const n17 = newImg('000017-4.jpg')     // lying down pink intimate
  const n18 = newImg('000001-8.jpg')     // red top stairs
  const n19 = newImg('000003-5.jpg')     // varied
  const n20 = newImg('000004-5.jpg')     // varied
  const n21 = newImg('000005-4.jpg')     // varied
  const n22 = newImg('000009-11.jpg')    // varied
  const n23 = newImg('000010-3.jpg')     // varied
  const n24 = newImg('000015-8.jpg')     // varied
  const n25 = newImg('000016-3.jpg')     // varied
  const n26 = newImg('000002-4.jpg')     // varied
  const n27 = newImg('000003-8.jpg')     // varied

  function fImg(src, l, t, w, h, pos) {
    pos = pos || 'center'
    return '<img src="' + src + '" style="position:absolute;left:' + l + 'px;top:' + t + 'px;width:' + w + 'px;height:' + h + 'px;object-fit:cover;object-position:' + pos + ';display:block;"/>'
  }

  function slide(name, inner) {
    return { name, html: '<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#0a0a0a;">' + inner + filmGrain(0.06) + '</div>' }
  }

  // Photo with white border, rotation, and shadow — like a real print
  function print(src, l, t, w, h, rot, border) {
    border = border || 12
    return '<div style="position:absolute;left:' + l + 'px;top:' + t + 'px;width:' + (w + border*2) + 'px;height:' + (h + border*2) + 'px;background:white;padding:' + border + 'px;transform:rotate(' + rot + 'deg);box-shadow:0 8px 40px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.2);"><img src="' + src + '" style="width:' + w + 'px;height:' + h + 'px;object-fit:cover;object-position:center;display:block;"/></div>'
  }

  // Floating photo with shadow, no border
  function floating(src, l, t, w, h, rot) {
    return '<img src="' + src + '" style="position:absolute;left:' + l + 'px;top:' + t + 'px;width:' + w + 'px;height:' + h + 'px;object-fit:cover;object-position:center;display:block;transform:rotate(' + rot + 'deg);filter:drop-shadow(0 16px 40px rgba(0,0,0,0.5));"/>'
  }

  function darkBg(inner) {
    return '<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#080a0e;">'
      + '<div style="position:absolute;inset:0;background:linear-gradient(170deg, #0c1420 0%, #080c14 50%, #060a10 100%);"></div>'
      + '<div style="position:absolute;inset:0;background:radial-gradient(circle at 20% 20%, rgba(80,140,220,0.12), transparent 30%), radial-gradient(circle at 80% 80%, rgba(220,170,100,0.08), transparent 25%);"></div>'
      + inner + filmGrain(0.08) + '</div>'
  }

  // Slide 1: Hook
  allSlides.push({
    name: prefix + '-01-hook',
    html: '<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">'
      + '<img src="' + n05 + '" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;filter:saturate(1.1) contrast(1.05);"/>'
      + '<div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(0,0,0,0.1) 0%, transparent 25%, transparent 50%, rgba(0,0,0,0.92) 100%);"></div>'
      + '<div style="position:absolute;bottom:420px;left:64px;right:64px;">'
      + '<p style="font-family:' + SANS + ';font-size:22px;font-weight:700;color:rgba(255,255,255,0.4);letter-spacing:0.15em;text-transform:uppercase;margin:0 0 16px;' + S + '">Bali \u00b7 Model collab</p>'
      + '<h1 style="font-family:' + SERIF + ';font-size:108px;font-weight:700;font-style:italic;color:white;line-height:0.90;margin:0;' + S + '">I don\u2019t need<br/>to explain.<br/>Just look.</h1>'
      + '</div>' + filmGrain(0.1) + '</div>'
  })

  // Slide 2: One big tilted print center + two small prints tucked behind
  allSlides.push({ name: prefix + '-02-prints', html: darkBg(
    print(n13, 40, 100, 380, 500, -4) +
    print(n15, 580, 60, 420, 540, 3.5) +
    print(n16, 180, 620, 700, 880, -1.2, 16) +
    print(n18, 50, 1480, 340, 380, 2.8) +
    print(n11, 480, 1420, 480, 440, -2)
  )})

  // Slide 3: Diagonal cascade — photos stepping down L to R like dropped cards
  allSlides.push({ name: prefix + '-03-cascade', html: darkBg(
    floating(n08, 40, 60, 520, 650, -2.5) +
    floating(n09, 440, 380, 560, 700, 1.8) +
    floating(n03, 80, 820, 480, 600, 2.2) +
    floating(n14, 460, 1150, 540, 680, -1.5)
  )})

  // Slide 4: One massive hero (80% of frame) + tiny accent overlapping corner
  allSlides.push({ name: prefix + '-04-hero', html: darkBg(
    '<img src="' + n12 + '" style="position:absolute;left:60px;top:120px;width:960px;height:1400px;object-fit:cover;object-position:center;display:block;filter:drop-shadow(0 30px 60px rgba(0,0,0,0.6));"/>' +
    print(n17, 560, 1340, 420, 500, 3, 10) +
    print(n04, -20, 1380, 340, 440, -4, 10)
  )})

  // Slide 5: Tight cluster — 4 overlapping prints dropped on a table, centered
  allSlides.push({ name: prefix + '-05-cluster', html: darkBg(
    print(n01, 80, 280, 480, 620, -6) +
    print(n06, 420, 200, 520, 660, 4) +
    print(n10, 140, 880, 520, 650, 3.5) +
    print(n07, 380, 940, 560, 700, -2.5) +
    print(n22, 200, 1560, 600, 340, 1.2, 10)
  )})

  // Slide 6: Fan spread — photos radiating from bottom center like a hand of cards
  allSlides.push({ name: prefix + '-06-fan', html: darkBg(
    floating(n23, 40, 200, 360, 500, -12) +
    floating(n24, 220, 120, 380, 520, -4) +
    floating(n25, 380, 80, 380, 520, 2) +
    floating(n26, 560, 140, 380, 520, 8) +
    floating(n27, 680, 260, 360, 500, 14) +
    '<div style="position:absolute;bottom:380px;left:64px;right:64px;text-align:center;">'
    + '<p style="font-family:' + SERIF + ';font-size:80px;font-weight:700;font-style:italic;color:white;line-height:0.95;margin:0;' + S + '">All real.<br/>All directed<br/>by me.</p></div>'
  )})

  // Slide 7: Vertical triptych — 3 tall photos with slight offsets and tilts
  allSlides.push({ name: prefix + '-07-triptych', html: darkBg(
    floating(n19, 20, 80, 330, 1760, -1.5) +
    floating(n21, 370, 40, 330, 1760, 0.8) +
    floating(n20, 720, 100, 330, 1760, -0.5)
  )})

  // Slide 8: "This could be you" — single breathtaking photo with text
  allSlides.push({
    name: prefix + '-08-you',
    html: '<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">'
      + '<img src="' + n16 + '" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(1.08);"/>'
      + '<div style="position:absolute;inset:0;background:linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.88) 100%);"></div>'
      + '<div style="position:absolute;bottom:400px;left:64px;right:64px;">'
      + '<p style="font-family:' + SERIF + ';font-size:96px;font-weight:700;font-style:italic;color:white;line-height:0.95;margin:0;' + S + '">This could<br/>be you.</p>'
      + '<p style="font-family:' + SANS + ';font-size:30px;color:rgba(255,255,255,0.5);margin:28px 0 0;' + S + '">TFP. I direct everything. No experience needed.</p>'
      + '</div>' + filmGrain(0.1) + '</div>'
  })

  // Slide 9: Scattered prints with mixed sizes — messy editorial table
  allSlides.push({ name: prefix + '-09-editorial', html: darkBg(
    print(n15, 20, 40, 500, 380, -3, 14) +
    print(n05, 480, 20, 540, 420, 2.5, 14) +
    print(n08, 60, 460, 440, 560, 1.8, 12) +
    print(n09, 500, 500, 500, 620, -2.8, 12) +
    print(n03, 120, 1080, 420, 340, -1.5, 10) +
    print(n12, 520, 1140, 480, 380, 3.2, 10) +
    print(n14, 200, 1460, 600, 440, -0.8, 14)
  )})

  // Slide 10: CTA
  allSlides.push({
    name: prefix + '-10-cta',
    html: '<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">'
      + '<img src="' + n13 + '" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(1.1) brightness(0.55);"/>'
      + '<div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.15) 30%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.92) 100%);"></div>'
      + '<div style="position:absolute;bottom:380px;left:64px;right:64px;">'
      + '<h2 style="font-family:' + SERIF + ';font-size:100px;font-weight:700;font-style:italic;color:white;line-height:0.95;margin:0;' + S + '">Let\u2019s<br/>collaborate.</h2>'
      + '<div style="margin:36px 0 0;display:flex;flex-direction:column;gap:20px;">'
      + '<p style="font-family:' + SANS + ';font-size:36px;color:rgba(255,255,255,0.9);line-height:1.45;margin:0;' + S + '">DM @madebyaidan on Instagram.</p>'
      + '<p style="font-family:' + SANS + ';font-size:32px;color:rgba(255,255,255,0.55);line-height:1.45;margin:0;' + S + '">Send me your look. No experience needed. I handle everything.</p>'
      + '</div></div>' + filmGrain(0.1) + '</div>'
  })
}

async function render() {
  for (const city of cities) {
    fs.mkdirSync(path.join(OUT, slug(city)), { recursive: true })
  }
  fs.mkdirSync(path.join(OUT, 'bali-paid'), { recursive: true })
  fs.mkdirSync(path.join(OUT, 'bali-collab'), { recursive: true })
  fs.mkdirSync(path.join(OUT, 'bali-collab-v2'), { recursive: true })
  fs.mkdirSync(path.join(OUT, 'bali-collab-v3'), { recursive: true })
  fs.mkdirSync(path.join(OUT, 'bali-proof'), { recursive: true })
  console.log(`Rendering ${allSlides.length} slides for ${cities.length} cities...`)
  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 })

  for (let i = 0; i < allSlides.length; i++) {
    const slide = allSlides[i]
    const citySlug = slide.name.replace(/-carousel-.*/, '')
    const page = await context.newPage()
    await page.setContent(`<!doctype html><html><head><style>
      * { box-sizing: border-box; }
      html, body { margin: 0; width: 1080px; height: 1920px; background: #000; overflow: hidden; }
      body { -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; }
    </style></head><body>${slide.html}</body></html>`, { waitUntil: 'load' })
    await page.waitForTimeout(500)
    await page.screenshot({ path: path.join(OUT, citySlug, `${slide.name}.png`), type: 'png' })
    await page.close()
    console.log(`  [${i + 1}/${allSlides.length}] ${slide.name}`)
  }

  await browser.close()
  console.log(`\nDone — ${allSlides.length} slides -> ${OUT}`)
}

render()
