import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_SLUG = process.env.CPC_OUT_SLUG || 'antipolo-low-cpc-v3'
const OUT = path.join(__dirname, 'output', OUT_SLUG)
const IMG_DIR = '/Users/aidantorrence/Documents/aidan-modern/public/images/large'

const CITY = 'Antipolo'
const CITY_UPPER = CITY.toUpperCase()
const HANDLE = '@madebyaidan'

fs.rmSync(OUT, { recursive: true, force: true })
fs.mkdirSync(OUT, { recursive: true })

function img(filename) {
  const buf = fs.readFileSync(path.join(IMG_DIR, filename))
  return `data:image/jpeg;base64,${buf.toString('base64')}`
}

const photoFiles = [
  'manila-gallery-dsc-0075.jpg',
  'manila-gallery-dsc-0130.jpg',
  'manila-gallery-dsc-0190.jpg',
  'manila-gallery-dsc-0911.jpg',
  'manila-gallery-night-001.jpg',
  'manila-gallery-night-002.jpg',
  'manila-gallery-night-003.jpg',
  'manila-gallery-market-001.jpg',
  'manila-gallery-urban-001.jpg',
  'manila-gallery-urban-002.jpg',
  'manila-gallery-urban-003.jpg',
  'manila-gallery-garden-001.jpg',
  'manila-gallery-garden-002.jpg',
  'manila-gallery-canal-001.jpg',
  'manila-gallery-canal-002.jpg',
  'manila-gallery-ivy-001.jpg',
  'manila-gallery-ivy-002.jpg',
  'manila-gallery-closeup-001.jpg',
  'manila-gallery-park-001.jpg',
  'manila-gallery-statue-001.jpg',
  'manila-gallery-street-001.jpg',
  'manila-gallery-shadow-001.jpg',
  'manila-gallery-rocks-001.jpg',
  'manila-gallery-floor-001.jpg',
  'manila-gallery-tropical-001.jpg'
]

const photos = Object.fromEntries(photoFiles.map((name) => [name, img(name)]))
const proofPool = [
  'manila-gallery-dsc-0190.jpg',
  'manila-gallery-dsc-0911.jpg',
  'manila-gallery-garden-001.jpg',
  'manila-gallery-market-001.jpg',
  'manila-gallery-urban-001.jpg',
  'manila-gallery-ivy-001.jpg',
  'manila-gallery-street-001.jpg',
  'manila-gallery-park-001.jpg'
]

const FONT_SANS = "'Space Grotesk', 'Helvetica Neue', sans-serif"
const FONT_DISPLAY = "'Bebas Neue', 'Archivo Black', Impact, sans-serif"
const FONT_SERIF = "'Fraunces', Georgia, serif"
const FONT_MONO = "'IBM Plex Mono', 'Courier New', monospace"

const PALETTES = {
  citron: { accent: '#ffcf40', accent2: '#fff0bd', panel: 'rgba(8,8,8,0.76)', text: '#ffffff', dark: '#12100c' },
  ember: { accent: '#ff6b4a', accent2: '#ffd8cb', panel: 'rgba(18,8,8,0.76)', text: '#ffffff', dark: '#1a0e0b' },
  mint: { accent: '#6df2d7', accent2: '#d8fff7', panel: 'rgba(7,15,14,0.78)', text: '#ffffff', dark: '#0d1514' },
  cobalt: { accent: '#5f84ff', accent2: '#dce4ff', panel: 'rgba(8,10,18,0.8)', text: '#ffffff', dark: '#0b0e1a' },
  coral: { accent: '#ff7b72', accent2: '#ffe0dc', panel: 'rgba(20,9,9,0.8)', text: '#ffffff', dark: '#1d0f0f' },
  neon: { accent: '#b4ff3a', accent2: '#ecffd0', panel: 'rgba(8,14,6,0.76)', text: '#ffffff', dark: '#101709' },
  cream: { accent: '#d44f1e', accent2: '#fff2e8', panel: 'rgba(255,245,236,0.92)', text: '#19130d', dark: '#1c1208' },
  violet: { accent: '#be8dff', accent2: '#f1e5ff', panel: 'rgba(16,10,21,0.8)', text: '#ffffff', dark: '#120d1a' },
  gold: { accent: '#d9b54a', accent2: '#fff2cc', panel: 'rgba(20,16,8,0.8)', text: '#ffffff', dark: '#171308' },
  mono: { accent: '#f2f2f2', accent2: '#ffffff', panel: 'rgba(8,8,8,0.82)', text: '#ffffff', dark: '#111111' }
}

function grain(opacity) {
  return `<div style="position:absolute;inset:0;pointer-events:none;opacity:${opacity};mix-blend-mode:soft-light;background-image:
    radial-gradient(circle at 16% 20%, rgba(255,255,255,0.3), transparent 18%),
    radial-gradient(circle at 83% 13%, rgba(255,255,255,0.16), transparent 14%),
    repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 4px);"></div>`
}

function rail(concept, pal) {
  return `<div style="position:absolute;top:38px;left:38px;right:38px;display:flex;justify-content:space-between;align-items:center;z-index:5;">
    <div style="padding:12px 18px;border-radius:999px;background:rgba(6,6,6,0.64);font-family:${FONT_MONO};font-size:21px;font-weight:700;letter-spacing:1.2px;color:${pal.accent};text-transform:uppercase;backdrop-filter:blur(7px);">${CITY_UPPER}</div>
    <div style="padding:12px 18px;border-radius:999px;border:1px solid rgba(255,255,255,0.22);background:rgba(6,6,6,0.44);font-family:${FONT_MONO};font-size:19px;font-weight:700;letter-spacing:1px;color:white;text-transform:uppercase;backdrop-filter:blur(7px);">${concept.chips[0] || 'Free Session'}</div>
  </div>`
}

function chipRow(concept, pal, top = 1450) {
  const chips = concept.chips.slice(0, 3)
  return `<div style="position:absolute;left:42px;right:42px;top:${top}px;display:flex;gap:12px;flex-wrap:wrap;z-index:5;">
    ${chips.map((chip) => `<div style="padding:10px 14px;border-radius:999px;background:rgba(0,0,0,0.48);border:1px solid rgba(255,255,255,0.16);font-family:${FONT_MONO};font-size:18px;font-weight:700;color:${pal.accent2};text-transform:uppercase;letter-spacing:0.6px;">${chip}</div>`).join('')}
  </div>`
}

function bgImage(file, extra = '') {
  return `<img src="${photos[file]}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;${extra}"/>`
}

function gradientOverlay(type = 0) {
  if (type === 1) return '<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(8,8,8,0.16) 0%,rgba(8,8,8,0.12) 30%,rgba(8,8,8,0.56) 72%,rgba(8,8,8,0.95) 100%);"></div>'
  if (type === 2) return '<div style="position:absolute;inset:0;background:radial-gradient(circle at 40% 24%,rgba(255,255,255,0.1) 0%,rgba(10,10,10,0.2) 24%,rgba(10,10,10,0.86) 100%);"></div>'
  if (type === 3) return '<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(3,3,3,0.35) 0%,rgba(3,3,3,0.18) 35%,rgba(3,3,3,0.65) 74%,rgba(3,3,3,0.96) 100%);"></div>'
  return '<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(7,7,7,0.12) 0%,rgba(7,7,7,0.1) 28%,rgba(7,7,7,0.5) 70%,rgba(7,7,7,0.94) 100%);"></div>'
}

function bulletPoints(concept) {
  const points = concept.points.length ? concept.points : [
    'Guided posing from start to finish',
    'Outfit and location direction',
    'Edited photos delivered fast'
  ]
  return points.slice(0, 3)
}

function cardCta(concept, pal) {
  return `<div style="margin-top:22px;display:inline-flex;align-items:center;gap:10px;padding:14px 18px;border-radius:14px;background:${pal.accent};color:${pal.dark};font-family:${FONT_MONO};font-size:20px;font-weight:800;letter-spacing:1px;text-transform:uppercase;">${concept.cta}</div>`
}

function layoutHero(concept, idx) {
  const pal = PALETTES[concept.palette]
  return `<div style="position:relative;width:1080px;height:1920px;overflow:hidden;background:#000;">
    ${bgImage(concept.photo, `filter:saturate(1.06) contrast(1.04) brightness(${0.7 + (idx % 4) * 0.05});`)}
    ${gradientOverlay(idx % 4)}
    ${rail(concept, pal)}
    <div style="position:absolute;left:44px;right:44px;bottom:300px;z-index:5;">
      <div style="font-family:${FONT_DISPLAY};font-size:124px;line-height:0.86;letter-spacing:-1.8px;color:white;text-transform:uppercase;text-shadow:0 2px 12px rgba(0,0,0,0.9),0 14px 42px rgba(0,0,0,0.55);">${concept.hook}</div>
      <div style="font-family:${FONT_SANS};font-size:35px;line-height:1.3;color:rgba(255,255,255,0.9);margin-top:18px;max-width:780px;">${concept.sub}</div>
      <div style="font-family:${FONT_SANS};font-size:28px;line-height:1.35;color:${pal.accent2};margin-top:18px;max-width:760px;">${concept.detail}</div>
      ${cardCta(concept, pal)}
    </div>
    ${chipRow(concept, pal, 1600)}
    ${grain(0.05)}
  </div>`
}

function layoutGlass(concept, idx) {
  const pal = PALETTES[concept.palette]
  return `<div style="position:relative;width:1080px;height:1920px;overflow:hidden;background:#000;">
    ${bgImage(concept.photo, `filter:saturate(1.02) contrast(1.05) brightness(${0.64 + (idx % 3) * 0.06});`)}
    ${gradientOverlay((idx + 1) % 4)}
    ${rail(concept, pal)}
    <div style="position:absolute;left:48px;right:48px;bottom:220px;z-index:5;background:rgba(10,10,10,0.62);backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,0.18);border-radius:30px;padding:40px 36px 36px;">
      <div style="font-family:${FONT_SERIF};font-size:94px;line-height:0.9;color:${pal.accent};font-style:italic;">${concept.hook}</div>
      <div style="font-family:${FONT_SANS};font-size:33px;line-height:1.32;color:white;margin-top:14px;">${concept.sub}</div>
      <div style="font-family:${FONT_SANS};font-size:27px;line-height:1.35;color:rgba(255,255,255,0.8);margin-top:14px;">${concept.detail}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:18px;">
        ${bulletPoints(concept).map((point) => `<div style="padding:12px 13px;border-radius:12px;background:rgba(255,255,255,0.07);font-family:${FONT_SANS};font-size:21px;color:${pal.accent2};line-height:1.25;">${point}</div>`).join('')}
      </div>
      ${cardCta(concept, pal)}
    </div>
    ${grain(0.05)}
  </div>`
}

function layoutProof(concept, idx) {
  const pal = PALETTES[concept.palette]
  const p1 = photos[proofPool[idx % proofPool.length]]
  const p2 = photos[proofPool[(idx + 1) % proofPool.length]]
  const p3 = photos[proofPool[(idx + 2) % proofPool.length]]
  const p4 = photos[proofPool[(idx + 3) % proofPool.length]]
  return `<div style="position:relative;width:1080px;height:1920px;overflow:hidden;background:#050505;">
    ${bgImage(concept.photo, 'filter:blur(8px) brightness(0.45) saturate(0.8);transform:scale(1.15);')}
    <div style="position:absolute;inset:0;background:rgba(8,8,8,0.55);"></div>
    ${rail(concept, pal)}
    <div style="position:absolute;top:180px;left:0;right:0;text-align:center;z-index:5;">
      <div style="font-family:${FONT_SERIF};font-size:74px;color:white;font-style:italic;">${concept.hook}</div>
      <div style="font-family:${FONT_SANS};font-size:30px;color:${pal.accent2};margin-top:8px;">${concept.sub}</div>
    </div>
    <div style="position:absolute;left:82px;top:360px;width:410px;height:500px;transform:rotate(-3deg);background:white;padding:12px;box-shadow:0 18px 50px rgba(0,0,0,0.45);z-index:5;"><img src="${p1}" style="width:100%;height:100%;object-fit:cover;"/></div>
    <div style="position:absolute;right:82px;top:390px;width:410px;height:500px;transform:rotate(3deg);background:white;padding:12px;box-shadow:0 18px 50px rgba(0,0,0,0.45);z-index:5;"><img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/></div>
    <div style="position:absolute;left:96px;top:930px;width:410px;height:500px;transform:rotate(2deg);background:white;padding:12px;box-shadow:0 18px 50px rgba(0,0,0,0.45);z-index:5;"><img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/></div>
    <div style="position:absolute;right:96px;top:965px;width:410px;height:500px;transform:rotate(-2deg);background:white;padding:12px;box-shadow:0 18px 50px rgba(0,0,0,0.45);z-index:5;"><img src="${p4}" style="width:100%;height:100%;object-fit:cover;"/></div>
    <div style="position:absolute;left:70px;right:70px;bottom:130px;display:flex;justify-content:space-between;align-items:center;padding:18px 20px;border-radius:999px;background:rgba(8,8,8,0.8);z-index:5;">
      <div style="font-family:${FONT_MONO};font-size:20px;color:${pal.accent};text-transform:uppercase;letter-spacing:1px;">${concept.cta}</div>
      <div style="font-family:${FONT_SANS};font-size:24px;color:white;">${concept.detail}</div>
    </div>
    ${grain(0.04)}
  </div>`
}

function layoutChecklist(concept, idx) {
  const pal = PALETTES[concept.palette]
  return `<div style="position:relative;width:1080px;height:1920px;overflow:hidden;background:#000;">
    ${bgImage(concept.photo, `filter:saturate(0.96) contrast(1.08) brightness(${0.56 + (idx % 4) * 0.05});`)}
    ${gradientOverlay((idx + 2) % 4)}
    ${rail(concept, pal)}
    <div style="position:absolute;left:48px;right:48px;bottom:210px;z-index:5;background:${pal.panel};border-radius:28px;padding:34px 30px 30px;border:1px solid rgba(255,255,255,0.14);">
      <div style="font-family:${FONT_DISPLAY};font-size:102px;line-height:0.86;letter-spacing:-1px;color:${pal.text};text-transform:uppercase;">${concept.hook}</div>
      <div style="font-family:${FONT_SANS};font-size:31px;line-height:1.3;color:${pal.accent2};margin-top:10px;">${concept.sub}</div>
      <div style="margin-top:20px;display:flex;flex-direction:column;gap:12px;">
        ${bulletPoints(concept).map((point) => `<div style="display:flex;gap:14px;align-items:flex-start;padding:11px 12px;border-radius:12px;background:rgba(255,255,255,0.06);"><div style="font-family:${FONT_MONO};font-size:22px;color:${pal.accent};">✓</div><div style="font-family:${FONT_SANS};font-size:24px;line-height:1.3;color:white;">${point}</div></div>`).join('')}
      </div>
      ${cardCta(concept, pal)}
    </div>
    ${grain(0.05)}
  </div>`
}

function layoutSplit(concept, idx) {
  const pal = PALETTES[concept.palette]
  return `<div style="position:relative;width:1080px;height:1920px;overflow:hidden;background:#000;">
    <div style="position:absolute;top:0;left:0;bottom:0;width:54%;background:#0a0a0a;z-index:1;"></div>
    <div style="position:absolute;top:0;right:0;bottom:0;width:52%;overflow:hidden;z-index:1;">
      <img src="${photos[concept.photo]}" style="width:100%;height:100%;object-fit:cover;object-position:center;filter:saturate(1.03) contrast(1.05) brightness(${0.72 + (idx % 3) * 0.06});"/>
    </div>
    <div style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(8,8,8,0.96) 0%,rgba(8,8,8,0.84) 44%,rgba(8,8,8,0.28) 69%,rgba(8,8,8,0.28) 100%);z-index:2;"></div>
    ${rail(concept, pal)}
    <div style="position:absolute;left:44px;top:260px;width:520px;z-index:5;">
      <div style="font-family:${FONT_DISPLAY};font-size:106px;line-height:0.84;color:white;text-transform:uppercase;">${concept.hook}</div>
      <div style="font-family:${FONT_SANS};font-size:31px;line-height:1.31;color:${pal.accent2};margin-top:18px;">${concept.sub}</div>
      <div style="font-family:${FONT_SANS};font-size:27px;line-height:1.35;color:rgba(255,255,255,0.86);margin-top:16px;">${concept.detail}</div>
      ${cardCta(concept, pal)}
    </div>
    ${chipRow(concept, pal, 1570)}
    ${grain(0.05)}
  </div>`
}

function layoutChat(concept, idx) {
  const pal = PALETTES[concept.palette]
  const points = bulletPoints(concept)
  return `<div style="position:relative;width:1080px;height:1920px;overflow:hidden;background:#000;">
    ${bgImage(concept.photo, `filter:saturate(0.88) contrast(1.08) brightness(${0.4 + (idx % 2) * 0.08});`)}
    <div style="position:absolute;inset:0;background:rgba(6,6,6,0.58);"></div>
    ${rail(concept, pal)}
    <div style="position:absolute;left:42px;right:42px;top:220px;z-index:5;display:flex;flex-direction:column;gap:14px;">
      <div style="align-self:flex-start;max-width:760px;padding:18px 20px;border-radius:22px 22px 22px 6px;background:rgba(255,255,255,0.13);backdrop-filter:blur(8px);font-family:${FONT_SANS};font-size:38px;font-weight:700;color:white;line-height:1.25;">${concept.hook}</div>
      <div style="align-self:flex-end;max-width:760px;padding:16px 18px;border-radius:22px 22px 6px 22px;background:${pal.accent};font-family:${FONT_SANS};font-size:30px;font-weight:700;color:${pal.dark};line-height:1.28;">${concept.sub}</div>
      <div style="align-self:flex-start;max-width:760px;padding:16px 18px;border-radius:22px 22px 22px 6px;background:rgba(255,255,255,0.1);font-family:${FONT_SANS};font-size:28px;color:${pal.accent2};line-height:1.3;">${concept.detail}</div>
      ${points.map((point, pIdx) => `<div style="align-self:${pIdx % 2 === 0 ? 'flex-end' : 'flex-start'};max-width:700px;padding:14px 16px;border-radius:20px;background:rgba(0,0,0,0.45);border:1px solid rgba(255,255,255,0.14);font-family:${FONT_SANS};font-size:25px;color:white;line-height:1.3;">${point}</div>`).join('')}
      <div style="align-self:flex-end;margin-top:8px;padding:14px 18px;border-radius:14px;background:${pal.accent};font-family:${FONT_MONO};font-size:21px;font-weight:800;color:${pal.dark};text-transform:uppercase;">${concept.cta}</div>
    </div>
    ${grain(0.05)}
  </div>`
}

function layoutMagazine(concept, idx) {
  const pal = PALETTES[concept.palette]
  return `<div style="position:relative;width:1080px;height:1920px;overflow:hidden;background:#000;">
    ${bgImage(concept.photo, `filter:saturate(1.1) contrast(1.06) brightness(${0.66 + (idx % 4) * 0.05});`)}
    ${gradientOverlay((idx + 3) % 4)}
    ${rail(concept, pal)}
    <div style="position:absolute;left:44px;top:140px;transform:rotate(-90deg);transform-origin:left top;z-index:5;font-family:${FONT_MONO};font-size:18px;letter-spacing:3px;color:${pal.accent};text-transform:uppercase;">ANTIPOLO EDITION</div>
    <div style="position:absolute;left:74px;right:70px;bottom:250px;z-index:5;">
      <div style="font-family:${FONT_SERIF};font-size:118px;line-height:0.88;font-style:italic;color:${pal.accent2};">${concept.hook}</div>
      <div style="font-family:${FONT_DISPLAY};font-size:68px;line-height:0.9;color:white;text-transform:uppercase;margin-top:14px;">${concept.sub}</div>
      <div style="font-family:${FONT_SANS};font-size:30px;line-height:1.34;color:rgba(255,255,255,0.88);margin-top:16px;max-width:760px;">${concept.detail}</div>
      ${cardCta(concept, pal)}
    </div>
    ${chipRow(concept, pal, 1580)}
    ${grain(0.05)}
  </div>`
}

function layoutUrgency(concept, idx) {
  const pal = PALETTES[concept.palette]
  return `<div style="position:relative;width:1080px;height:1920px;overflow:hidden;background:#000;">
    ${bgImage(concept.photo, `filter:saturate(1.0) contrast(1.12) brightness(${0.58 + (idx % 4) * 0.06});`)}
    ${gradientOverlay(idx % 4)}
    <div style="position:absolute;top:0;left:0;right:0;height:72px;background:${pal.accent};display:flex;align-items:center;padding:0 26px;z-index:5;font-family:${FONT_MONO};font-size:20px;font-weight:800;letter-spacing:1px;color:${pal.dark};text-transform:uppercase;">${concept.chips[0] || 'Limited slots'} - ${CITY_UPPER}</div>
    <div style="position:absolute;bottom:0;left:0;right:0;height:92px;background:${pal.accent};display:flex;align-items:center;justify-content:center;z-index:5;font-family:${FONT_MONO};font-size:24px;font-weight:800;letter-spacing:1px;color:${pal.dark};text-transform:uppercase;">${concept.cta}</div>
    <div style="position:absolute;left:48px;right:48px;bottom:230px;z-index:5;">
      <div style="font-family:${FONT_DISPLAY};font-size:118px;line-height:0.84;color:white;text-transform:uppercase;">${concept.hook}</div>
      <div style="font-family:${FONT_SANS};font-size:34px;line-height:1.32;color:${pal.accent2};margin-top:16px;">${concept.sub}</div>
      <div style="font-family:${FONT_SANS};font-size:28px;line-height:1.33;color:rgba(255,255,255,0.88);margin-top:14px;">${concept.detail}</div>
    </div>
    ${grain(0.04)}
  </div>`
}

function layoutTimeline(concept, idx) {
  const pal = PALETTES[concept.palette]
  const points = bulletPoints(concept)
  return `<div style="position:relative;width:1080px;height:1920px;overflow:hidden;background:#000;">
    ${bgImage(concept.photo, `filter:saturate(0.96) contrast(1.05) brightness(${0.52 + (idx % 4) * 0.06});`)}
    <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(8,8,8,0.56) 0%,rgba(8,8,8,0.5) 45%,rgba(8,8,8,0.92) 100%);"></div>
    ${rail(concept, pal)}
    <div style="position:absolute;left:52px;right:52px;top:260px;z-index:5;">
      <div style="font-family:${FONT_DISPLAY};font-size:102px;line-height:0.85;color:white;text-transform:uppercase;">${concept.hook}</div>
      <div style="font-family:${FONT_SANS};font-size:32px;color:${pal.accent2};margin-top:14px;line-height:1.32;">${concept.sub}</div>
      <div style="margin-top:34px;display:flex;flex-direction:column;gap:14px;">
        ${points.map((point, pIdx) => `<div style="display:flex;align-items:flex-start;gap:14px;padding:16px 16px;border-radius:14px;background:rgba(0,0,0,0.42);border:1px solid rgba(255,255,255,0.14);"><div style="width:34px;height:34px;border-radius:999px;background:${pal.accent};display:flex;align-items:center;justify-content:center;font-family:${FONT_MONO};font-size:16px;font-weight:800;color:${pal.dark};">${pIdx + 1}</div><div style="font-family:${FONT_SANS};font-size:25px;line-height:1.32;color:white;">${point}</div></div>`).join('')}
      </div>
      <div style="font-family:${FONT_SANS};font-size:28px;line-height:1.33;color:rgba(255,255,255,0.88);margin-top:18px;">${concept.detail}</div>
      ${cardCta(concept, pal)}
    </div>
    ${grain(0.04)}
  </div>`
}

function layoutSticky(concept, idx) {
  const pal = PALETTES[concept.palette]
  const points = bulletPoints(concept)
  return `<div style="position:relative;width:1080px;height:1920px;overflow:hidden;background:#050505;">
    ${bgImage(concept.photo, `filter:saturate(0.88) contrast(1.05) brightness(${0.44 + (idx % 4) * 0.07});`)}
    <div style="position:absolute;inset:0;background:rgba(8,8,8,0.52);"></div>
    ${rail(concept, pal)}
    <div style="position:absolute;left:72px;top:240px;width:450px;padding:26px 24px;background:#fff7d4;transform:rotate(-2deg);box-shadow:0 18px 44px rgba(0,0,0,0.45);z-index:5;">
      <div style="font-family:${FONT_DISPLAY};font-size:74px;line-height:0.86;color:#1e1a12;text-transform:uppercase;">${concept.hook}</div>
    </div>
    <div style="position:absolute;right:74px;top:600px;width:430px;padding:22px 20px;background:#dff7ff;transform:rotate(2deg);box-shadow:0 18px 44px rgba(0,0,0,0.45);z-index:5;">
      <div style="font-family:${FONT_SANS};font-size:31px;line-height:1.26;color:#10202b;font-weight:700;">${concept.sub}</div>
    </div>
    <div style="position:absolute;left:90px;bottom:300px;width:460px;padding:22px 20px;background:#ffe4e0;transform:rotate(-1deg);box-shadow:0 18px 44px rgba(0,0,0,0.45);z-index:5;">
      <div style="font-family:${FONT_SANS};font-size:26px;line-height:1.32;color:#2d1511;">${concept.detail}</div>
      <div style="margin-top:14px;font-family:${FONT_MONO};font-size:20px;color:#2d1511;text-transform:uppercase;">${points[0]}</div>
    </div>
    <div style="position:absolute;right:72px;bottom:170px;z-index:5;padding:14px 18px;border-radius:14px;background:${pal.accent};font-family:${FONT_MONO};font-size:21px;font-weight:800;color:${pal.dark};text-transform:uppercase;">${concept.cta}</div>
    ${grain(0.04)}
  </div>`
}

const RENDERERS = {
  hero: layoutHero,
  glass: layoutGlass,
  proof: layoutProof,
  checklist: layoutChecklist,
  split: layoutSplit,
  chat: layoutChat,
  magazine: layoutMagazine,
  urgency: layoutUrgency,
  timeline: layoutTimeline,
  sticky: layoutSticky
}

const RAW_CONCEPTS = `
beginner-no-model|No model experience good|Free Antipolo sessions for first timers|I direct every pose so you never feel lost|hero|citron|Beginner Safe,Free Slot,Antipolo|Pose coaching included;Outfit guidance before shoot;Edited photos in 7 days
awkward-to-confident|Camera shy to confident|You do not need to know angles|I coach the full flow from first frame to last frame|glass|mint|No Pressure,Guided,Free Session|Warm up poses first;Simple direction all shoot;Fast final gallery
confidence-reset|Confidence reset portraits|If your feed feels stale this is your reset|One free session can give you a fresh month of content|magazine|ember|Confidence,Fresh Feed,Antipolo|Planning chat before shoot;Three look ideas suggested;Cinematic edits delivered
sunday-main-character|Sunday main character energy|Antipolo light plus your best outfit|We build images that feel like a scene not random snapshots|split|gold|Main Character,Free Shoot,Weekend|Location matching your vibe;Shot list built together;Guided posing throughout
soft-glam-free|Soft glam photos for free|Want clean dreamy portraits without studio stress|Natural light and direction can look premium fast|hero|cream|Soft Glam,No Fee,Antipolo|Wardrobe notes before shoot;Beauty first framing;Edited set in one week
street-cool-antipolo|Street cool Antipolo set|For people who want edge not cheesy smiles|Urban textures plus clean direction equals sharp results|split|cobalt|Street Style,Creative,Free Session|Location scouting support;Movement based posing;Color graded outputs
date-app-refresh|Dating app refresh day|Your next profile photo should look intentional|Free Antipolo session built for high signal first photos|checklist|coral|Dating Profile,Antipolo,Free|Hero portrait for first slot;Full body and detail shots;Natural expressions coached
profile-glow-up|Profile glow up now|Stop recycling old mirror selfies|Get a new profile set in one guided free shoot|urgency|neon|Profile Upgrade,Free,Limited|Clear shot sequence plan;Strong opener images;Quick delivery timeline
breakup-comeback|Breakup comeback portraits|New chapter deserves new visuals|Come back cleaner stronger and more confident on camera|magazine|violet|New Era,Free Shoot,Antipolo|Moodboard built together;Power poses and softer options;Edited set ready to post
new-hair-new-feed|New hair new feed|If you changed your look lock it in now|Free Antipolo session while the look is fresh|hero|ember|Fresh Look,Free,Antipolo|Hair forward framing;Close and wide coverage;Edited highlights delivered
birthday-week-shoot|Birthday week shoot idea|Celebrate with photos you actually keep|Free Antipolo portraits for your birthday content run|glass|gold|Birthday,Free Session,Antipolo|Celebration shot list;Outfit switch options;Seven day turnaround
quarter-life-rebrand|Quarter life rebrand visuals|When life shifts your photos should too|Free session built for your next era online|timeline|cobalt|Rebrand,Free,Antipolo|Vibe planning message;Three scene sequence;Edits tuned to your tone
first-job-photo-upgrade|First job photo upgrade|Look sharp for work profiles without looking stiff|Free Antipolo portraits with natural direction|checklist|mono|Career Ready,Free,Guided|Professional plus personality shots;Expression coaching;Quick final delivery
grad-season-content|Grad season content bank|Cap and gown plus clean portraits after|Make one free shoot cover all graduation posts|timeline|citron|Graduation,Antipolo,Free|Formal and casual frames;Family add on option;Edited post ready files
board-exam-finished|Board exam done now celebrate|You survived the grind now mark the win|Free Antipolo portraits for your victory week|sticky|cream|Milestone,Free Shoot,Antipolo|Victory concept planning;Confident pose support;Edited reel cover options
creator-content-bank|Creator content bank day|Shoot once post for weeks|Free Antipolo session focused on reusable content|checklist|mint|Creator,Content Bank,Free|Multiple framing styles;Thumbnail friendly shots;Batch ready edits
entrepreneur-brand-face|Entrepreneur brand face set|People buy from people they trust|Free portraits that make your brand look real and premium|split|cobalt|Branding,Founder,Free|Personal brand shot list;Action and portrait mix;Fast social ready edits
fitness-coach-photos|Fitness coach photo refresh|Your body of work needs matching visuals|Free Antipolo session with movement friendly direction|timeline|neon|Fitness,Branding,Antipolo|Motion pose coaching;Strong posture cues;Edited set for promos
musician-press-kit|Musician press kit starter|Need clean artist images for releases|Free Antipolo portraits with mood and edge|magazine|violet|Music Artist,Free Session,Creative|Cover art style frames;Profile and banner crops;Color grade options
dancer-motion-portraits|Dancer motion portraits free|Capture movement without blur chaos|Guided timing and angles for dynamic images|proof|ember|Dance,Motion,Antipolo|Burst sequence shooting;Pose timing cues;Final selects edited clean
tattoo-fresh-ink|Fresh ink portrait set|New tattoo deserves proper photos|Free Antipolo shoot built around ink details|hero|coral|Tattoo,Detail Shots,Free|Macro and wide combinations;Skin tone conscious edits;Simple guided posing
thrift-fit-editorial|Thrift fit editorial day|Your outfit game deserves better photos|Free Antipolo shoot for lookbook style posts|magazine|gold|Outfit Focus,Editorial,Free|Lookbook flow planning;Fabric detail shots;Natural movement direction
sneakerhead-lookbook|Sneakerhead lookbook free|Show the kicks and the full fit together|Free Antipolo session for fashion content|split|mono|Sneaker Fit,Lookbook,Free|Low angle sneaker frames;Street texture backgrounds;Edited carousel set
cafe-owner-story|Cafe owner story portraits|Put your face behind your brand|Free Antipolo shoot for authentic business content|timeline|cream|Cafe Owner,Brand Story,Free|Owner at work frames;Product plus portrait mix;Social first edits
real-estate-agent-headshots|Real estate profile upgrade|Trust starts with a strong photo|Free Antipolo portraits that look polished not fake|checklist|cobalt|Agent Profile,Trust,Free|Friendly confident expressions;Phone and signboard props;Ready for listings
makeup-artist-portfolio|Makeup artist portfolio portraits|Show your face and your craft in one set|Free Antipolo shoot with beauty focused framing|glass|coral|MUA,Portfolio,Free|Beauty closeups and wides;Color accurate retouching;Story highlight crops
lash-tech-branding|Lash tech brand photos|Your service quality should be visible online|Free Antipolo portraits to level your booking page|split|mint|Lash Tech,Branding,Free|Client and owner style frames;Before and after concepts;Optimized social edits
barber-reel-thumbnails|Barber reel thumbnail pack|Scroll stopping reels need a killer cover|Free Antipolo portraits with gritty barber energy|urgency|ember|Barber,Reel Covers,Free|High contrast portraits;Tool and chair props;Thumbnail safe crops
chef-social-content|Chef social content portraits|If people see your face they remember your food|Free Antipolo shoot for chef brand pages|timeline|gold|Chef Brand,Personal Story,Free|Kitchen and portrait blend;Action hand shots;Edited cross platform set
wedding-vendor-profile|Wedding vendor profile shots|Couples trust faces not logos|Free Antipolo portraits for planners and coordinators|checklist|cream|Wedding Vendor,Profile,Free|Elegant pose coaching;Warm light treatment;Booking page ready images
couple-no-cringe|Couple photos without cringe|Natural chemistry over forced poses|Free Antipolo session that feels like a date not a chore|hero|citron|Couples,Natural,Free|Prompt based direction;Walking and laughing frames;Soft color edits
bestfriend-shoot-day|Best friend shoot day|Make memories that do not look staged|Free Antipolo portraits for you and your ride or die|proof|mint|Best Friends,Free,Antipolo|Fun prompt sequence;Solo and duo frames;Edited share ready set
siblings-finally|Sibling photos finally|You have zero good sibling photos fix that|Free Antipolo session for real family keeps|glass|gold|Siblings,Memories,Free|Comfort first direction;Individual plus group frames;Edited keepsake gallery
mom-and-daughter|Mom and daughter portraits|A simple shoot now becomes forever later|Free Antipolo portraits with warm natural style|sticky|cream|Family,Free Session,Antipolo|Gentle posing guidance;Connection focused frames;Timeless edit style
dad-and-kid|Dad and kid photo day|Document this stage before it flies by|Free Antipolo portraits that feel real and playful|timeline|mint|Dad Life,Family,Free|Play based prompts;Movement friendly shooting;Edited memory set
engaged-but-chill|Engaged but chill portraits|No dramatic prenup required|Free Antipolo couple session with clean modern vibe|split|cobalt|Engaged,Minimal,Free|Relaxed pose prompts;Natural light locations;Social and print crops
prenup-style-free|Prenup style test shoot free|Try your chemistry on camera before booking bigger|Free Antipolo practice session for engaged couples|checklist|coral|Prenup Prep,Free,Antipolo|Style planning first;Comfortable pacing;Edited preview gallery
anniversary-reset|Anniversary reset shoot|Celebrate your story with better photos this year|Free Antipolo portraits for couples wanting new memories|hero|violet|Anniversary,Couple,Free|Romantic but natural prompts;Golden hour targeting;Cinematic edit mix
travel-before-you-go|Travel before you go portraits|Leaving soon capture your current chapter|Free Antipolo session before your next flight|magazine|ember|Travel Era,Free Shoot,Antipolo|Luggage and street concepts;Quick scheduling support;Fast final turnaround
balikbayan-week|Balikbayan week photo slot|Home for a short time lock photos now|Free Antipolo portraits while you are here|urgency|gold|Balikbayan,Limited,Free|Priority scheduling;Simple fast process;Edited files before departure
introvert-safe-shoot|Introvert safe photo session|Quiet direction no loud chaos|Free Antipolo portraits built for low pressure people|glass|mint|Introvert Friendly,Free,Guided|Slow warm up pacing;Clear simple prompts;Comfort first approach
anxious-no-problem|Anxious on camera no problem|Nervous energy is normal and manageable|Free Antipolo shoot with step by step guidance|timeline|cobalt|Anxiety Friendly,Free,Supportive|Breathing and posture cues;Micro direction each frame;Confidence building flow
hate-smile-photos|You hate your smile in photos|Then we shoot with expressions that feel natural|Free Antipolo portraits without fake grin pressure|hero|mono|Natural Expression,Free,Antipolo|Expression coaching;Multiple mood options;Final picks you approve
never-photogenic|Never photogenic until now|Most people just need direction and light|Free Antipolo session built for real people not models|checklist|citron|No Model Needed,Free,Guided|Angle matching by face;Pose cues every shot;Confidence focused edits
tired-of-selfies|Tired of selfie era|Your next level starts with proper photos|Free Antipolo shoot for clean polished images|split|gold|Selfie Upgrade,Free,Antipolo|Pro camera depth and color;Varied compositions;Edited final pack
same-old-mirror|Same old mirror pics stop|Your feed deserves new scenes|Free Antipolo portraits with real locations and vibe|magazine|ember|Feed Refresh,Free Session,Creative|Scene variety in one shoot;Outfit change guidance;Post ready exports
blurry-night-pics|Blurry night pics no more|Low light can still look sharp and cinematic|Free Antipolo night style portraits with pro lighting|hero|violet|Night Portrait,Free,Antipolo|Controlled low light setup;Crisp eyes and skin detail;Moody color grading
no-one-to-shoot-you|No one to shoot you properly|That is exactly why this offer exists|Free Antipolo session with full direction and pacing|urgency|neon|No Photographer Friend,Free,Apply|Solo friendly process;Hands on direction;Clear deliverable promise
no-idea-what-to-wear|No idea what to wear|I help you pick outfits that read well on camera|Free Antipolo portraits with styling support|checklist|cream|Outfit Help,Free,Antipolo|Pre shoot outfit check;Color and texture advice;Looks matched to locations
dont-know-locations|Do not know where to shoot|I suggest Antipolo spots based on your vibe|Free session with location planning included|timeline|mint|Location Help,Antipolo,Free|Urban and nature options;Time of day optimization;Travel efficient route
golden-hour-rideout|Golden hour ride out portraits|Warm light plus motion equals premium feel|Free Antipolo session timed for sunset glow|hero|gold|Golden Hour,Free,Antipolo|Sunset timing lock;Movement prompts;Warm cinematic edits
rain-day-cinematic|Rain day cinematic portraits|Cloudy weather can look expensive on camera|Free Antipolo portraits with moody film feel|magazine|cobalt|Rain Mood,Creative,Free|Weather adaptive plan;Umbrella and texture shots;Deep contrast grade
neon-night-antipolo|Neon night Antipolo set|City lights plus attitude|Free session for bold night content|split|violet|Night Energy,Free,Antipolo|Neon background selection;Edge posing direction;High impact final edits
morning-coffee-portraits|Morning coffee portrait vibe|Soft morning light and relaxed expressions|Free Antipolo session for calm aesthetic feeds|glass|cream|Morning Light,Free,Soft|Early hour scheduling;Natural candid prompts;Clean warm edits
film-look-digital-price|Film look zero shoot fee|You can get analog mood without paying session fee|Free Antipolo portraits with film inspired grading|checklist|gold|Film Look,Free Session,Antipolo|Grain and tone styling;Timeless color balance;Consistent edit set
moody-black-and-white|Moody black and white set|Strong contrast portraits with classic punch|Free Antipolo session for timeless images|hero|mono|Black and White,Free,Classic|Lighting for facial structure;Expression depth coaching;Monochrome finish pack
clean-white-minimal|Clean white minimal portraits|Simple backgrounds heavy impact|Free Antipolo portraits for modern personal brands|split|cobalt|Minimal,Branding,Free|Minimal framing strategy;Neutral outfit direction;Crisp clean retouch
gritty-street-mode|Gritty street mode portraits|Texture shadow and attitude in one frame|Free Antipolo session for bold urban style|magazine|ember|Gritty Street,Free,Creative|Street texture scouting;Power pose prompts;Contrast rich edits
garden-soft-light|Garden soft light set|Natural greens plus soft skin tones|Free Antipolo portraits for dreamy look|glass|mint|Nature Mood,Free Session,Antipolo|Shade and highlight control;Relaxed prompts;Airy final treatment
rooftop-energy|Rooftop energy portraits|Skyline mood and confident framing|Free Antipolo shoot for elevated visuals|timeline|cobalt|Rooftop,Free,Antipolo|Safe rooftop positioning;Wide and close sequence;City tone color grade
before-after-photos|Before and after glow up|Walk in unsure walk out with strong photos|Free Antipolo session with visible transformation|checklist|coral|Glow Up,Free,Result|Warm up then power shots;Preview feedback during shoot;Final best picks
one-hour-new-you|One hour new you|You do not need a whole day|Free Antipolo portrait session in under one hour|urgency|citron|Fast Shoot,Free,Antipolo|Efficient shot flow;Three location angles;Quick final turnaround
zero-budget-banger|Zero budget banger portraits|No fee does not mean low quality|Free Antipolo session with premium style direction|hero|neon|No Budget,High Quality,Free|Deliberate shot list;Lighting and composition focus;Professional final edits
free-not-cheap|Free not cheap|The offer is free the execution is not basic|Antipolo session with careful art direction and edits|glass|gold|Free Offer,Premium Feel,Antipolo|Creative direction included;Consistent quality control;Edited outputs polished
quality-over-filter|Quality over filters|Real lighting beats heavy apps every time|Free Antipolo session for clean trustworthy images|split|mono|No Filter Needed,Free,Antipolo|Natural light control;Skin friendly editing;True to life tones
stop-waiting-look-good|Stop waiting look good now|If you keep delaying your feed stays outdated|Free Antipolo slot open right now|urgency|ember|Act Now,Free Session,Antipolo|Simple DM booking;Flexible scheduling options;Clear delivery promise
shoot-now-post-month|Shoot now post all month|One session can fill weeks of posts|Free Antipolo content batch for creators and pros|timeline|mint|Content Batch,Free,Antipolo|Multiple scenes in one run;Portrait and detail mix;Exported for multiple platforms
content-for-30-days|30 days of content one shoot|Build your next month in one guided session|Free Antipolo portraits designed for posting cadence|checklist|cobalt|30 Day Content,Free,Antipolo|Hook image first priority;Series continuity planning;Batch edit consistency
one-session-many-looks|One session many looks|Different moods without a huge production|Free Antipolo shoot with smart outfit switches|hero|coral|Multi Look,Free,Antipolo|Look order optimized;Quick change strategy;Distinct style per set
outfit-switch-magic|Outfit switch magic|Two to three looks can triple content value|Free Antipolo portraits with wardrobe flow planning|timeline|cream|Outfit Switch,Free Session,Antipolo|Pre arranged look sequence;Location pairing per outfit;Post ready grouped edits
ig-story-magnet|IG story magnet portraits|Make people pause and tap profile|Free Antipolo session built for story safe framing|split|violet|IG Stories,Free,Antipolo|Story safe composition;Vertical first approach;Sharp text friendly backgrounds
reel-cover-pack|Reel cover pack portraits|Better covers equal better plays|Free Antipolo session for striking reel thumbnails|checklist|ember|Reel Covers,Free Session,Antipolo|Title safe composition;Bold expression options;Cover optimized crops
tinder-bumble-hinge-pack|Dating app hero set|Get photos that open conversations fast|Free Antipolo session for dating profile upgrades|hero|coral|Dating Apps,Free,Antipolo|Main photo strategy;Varied lifestyle frames;Natural confidence coaching
linkedin-but-not-boring|LinkedIn but not boring|Professional can still look human and modern|Free Antipolo portrait session for career profiles|glass|mono|LinkedIn,Career,Free|Friendly authority poses;Neutral plus creative options;Professional polish edits
portfolio-for-auditions|Audition portfolio starter|Casting needs clean current photos|Free Antipolo session for actors and performers|timeline|cobalt|Audition Ready,Free,Antipolo|Headshot and profile coverage;Expression range coaching;Fast casting ready delivery
casting-call-ready|Casting call ready now|When opportunity hits your photos should be ready|Free Antipolo portrait set for submissions|urgency|gold|Casting,Free,Antipolo|Submission format crops;Simple wardrobe guidance;Delivery timeline clear
model-search-vibes|Model search vibes free|Want agency style photos without agency stress|Free Antipolo portraits with clean model test energy|magazine|mono|Model Test,Free Session,Antipolo|Simple pose progression;Body line direction;Minimal retouch style
campus-famous-photos|Campus famous photo set|Pull up with better photos this semester|Free Antipolo portraits for student creators|sticky|citron|Campus,Student,Free|Youthful location picks;Casual confidence prompts;Share ready delivery
barkada-jealous-post|Barkada jealous post pack|Post once and everyone asks who shot this|Free Antipolo portraits with high impact styling|proof|violet|Social Flex,Free,Antipolo|Attention grabbing opener;Story plus feed variants;Fast edit turnaround
make-your-ex-look|Make your ex look twice|New era photos with real confidence|Free Antipolo portrait session for your comeback arc|hero|ember|Comeback Era,Free,Antipolo|Power stance coaching;Mood shift sequence;Strong final selects
this-month-only|This month only free slots|Offer window is open now not forever|Antipolo slots close as soon as calendar fills|urgency|neon|This Month,Limited,Free|Priority to fast replies;Short booking process;Clear date options
last-few-slots|Last few Antipolo slots|Most people wait then miss|DM now if you want a free portrait session|urgency|coral|Last Few Slots,Antipolo,Free|Real time slot updates;Simple confirmation steps;Fast scheduling support
first-come-antipolo|First come first shoot|I book based on who confirms quickly|Free Antipolo portraits for fast movers|urgency|citron|First Come,Free Session,Antipolo|Quick DM triage;Clear booking order;Transparent slot status
dm-before-full|DM before calendar fills|If you are reading this there may still be room|Free Antipolo sessions close once this batch is full|urgency|ember|DM Fast,Limited,Free|Rapid response preferred;Flexible weekday options;Simple confirmation flow
weekend-slots-gone-fast|Weekend slots go fast|Prime times fill first every batch|Free Antipolo session book now for best timing|urgency|gold|Weekend Slots,Limited,Free|Weekend demand is high;Backup weekday options;Calendar updates daily
weekday-hidden-slots|Weekday hidden slots open|Want less crowds and cleaner locations|Free Antipolo sessions available on selected weekdays|timeline|mint|Weekday Slots,Free,Antipolo|Calmer shoot environment;Flexible time windows;Faster turnaround queue
sunrise-slot-limited|Sunrise slot limited run|Best soft light has very few windows|Free Antipolo sunrise sessions for dreamy portraits|hero|cream|Sunrise,Limited,Free|Early light advantage;Quiet locations at dawn;Soft cinematic edits
sunset-slot-limited|Sunset slot limited run|Golden hour is short and competitive|Free Antipolo sunset sessions available now|hero|gold|Sunset,Limited,Free|Timed sunset sequence;Warm tone grading;Efficient shot pacing
no-form-dm-only|No long form DM only|Two messages and you are in process|Free Antipolo sessions with direct booking flow|chat|cobalt|DM Only,Easy Booking,Free|No long questionnaire;Quick vibe check;Fast schedule lock
two-message-booking|Two message booking flow|Message one for slot message two to confirm|Free Antipolo portraits with zero friction signup|chat|mint|Quick Booking,Free Session,Antipolo|Simple booking script;Prompt replies rewarded;No complicated steps
quick-reply-priority|Quick reply gets priority|I prioritize people who respond fast|Free Antipolo slots move quickly once opened|urgency|neon|Priority Queue,Free,Antipolo|Fast reply advantage;Clear hold times;Instant confirmation when ready
anti-ghosting-process|Anti ghosting booking process|Clear timelines and clear expectations|Free Antipolo portraits with no messy scheduling|timeline|mono|Clear Process,Free,Antipolo|Message checkpoints;Auto release inactive holds;Simple reminders
show-up-get-files|Show up get files|No hidden upsell after shoot|Free Antipolo session with promised deliverables|checklist|citron|No Upsell,Free Session,Antipolo|Deliverables listed upfront;Transparent process;Reliable final handoff
delivered-in-7-days|Delivered in seven days|Fast enough for real posting momentum|Free Antipolo portraits with one week delivery target|glass|cobalt|7 Day Delivery,Free,Antipolo|Edit queue priority;Consistent color workflow;Quick handoff
free-coaching-included|Free coaching included|Not just photos direction is part of offer|Antipolo free session with real guidance from start|timeline|mint|Coaching,Guided,Free|Pose coaching live;Feedback during shoot;Confidence building prompts
location-guidance-included|Location guidance included|You do not need to scout anything|I suggest Antipolo spots that match your vibe|checklist|cream|Location Help,Free Session,Antipolo|Spot options by mood;Travel efficient route;Lighting aware timing
outfit-guidance-included|Outfit guidance included|Send options first I help choose|Free Antipolo session with wardrobe strategy|chat|coral|Outfit Support,Free,Antipolo|Pre shoot outfit review;Texture and color advice;Look sequencing support
creative-direction-included|Creative direction included|You bring yourself I handle vision|Free Antipolo portraits with clear artistic direction|magazine|violet|Creative Direction,Free,Antipolo|Moodboard alignment first;Shot intention each frame;Cohesive final story
personal-hype-photographer|Personal hype photographer mode|If you need energy and direction I got you|Free Antipolo session that keeps you confident throughout|hero|neon|Hype Support,Free Session,Antipolo|Confidence cues all shoot;Momentum based pacing;Strong final selects
your-turn-antipolo|Your turn Antipolo|You have seen enough now take your slot|DM now for a free guided portrait session|proof|gold|Your Turn,Free Session,Antipolo|Simple booking in DM;Guided shoot experience;Edited files delivered fast
`.trim()

const concepts = RAW_CONCEPTS.split('\n').map((line, idx) => {
  const [slug, hook, sub, detail, layout, palette, chipsRaw, pointsRaw] = line.split('|')
  return {
    index: idx + 1,
    slug,
    hook,
    sub,
    detail,
    layout,
    palette,
    chips: (chipsRaw || '').split(',').map((s) => s.trim()).filter(Boolean),
    points: (pointsRaw || '').split(';').map((s) => s.trim()).filter(Boolean),
    photo: photoFiles[idx % photoFiles.length],
    cta: `DM ${HANDLE} TO APPLY`
  }
})

if (concepts.length !== 100) {
  throw new Error(`Expected 100 concepts, got ${concepts.length}`)
}

function documentFor(body) {
  return `<!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Fraunces:opsz,wght,SOFT,WONK@9..144,500,0,0;9..144,700,0,0;9..144,700,100,0&family=IBM+Plex+Mono:wght@500;700&family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
        <style>
          * { box-sizing: border-box; }
          html, body { margin: 0; width: 1080px; height: 1920px; overflow: hidden; background: #000; }
          body { -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; font-family: ${FONT_SANS}; }
        </style>
      </head>
      <body>${body}</body>
    </html>`
}

async function render() {
  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 })

  const summary = {
    createdAt: new Date().toISOString(),
    city: CITY,
    folder: path.relative(__dirname, OUT),
    strategy: `Antipolo low-CPC (${OUT_SLUG}): 100 explicitly authored concepts with distinct hooks and visual treatments.`,
    handle: HANDLE,
    conceptCount: concepts.length,
    photos: photoFiles,
    concepts: concepts.map((c) => ({
      file: `${String(c.index).padStart(3, '0')}-${c.slug}.png`,
      slug: c.slug,
      hook: c.hook,
      layout: c.layout,
      palette: c.palette,
      photo: c.photo
    }))
  }

  for (const concept of concepts) {
    const renderer = RENDERERS[concept.layout] || layoutHero
    const page = await context.newPage()
    await page.setContent(documentFor(renderer(concept, concept.index - 1)), { waitUntil: 'networkidle' })
    await page.waitForTimeout(250)
    const filename = `${String(concept.index).padStart(3, '0')}-${concept.slug}.png`
    await page.screenshot({ path: path.join(OUT, filename), type: 'png' })
    await page.close()
    console.log(`OK ${filename}`)
  }

  fs.writeFileSync(path.join(OUT, 'sources.json'), JSON.stringify(summary, null, 2))
  await browser.close()
  console.log(`Done - ${concepts.length} Antipolo low-CPC ads -> ${OUT}`)
}

render()
