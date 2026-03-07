import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = __dirname
const IMG_DIR = '/Users/aidantorrence/Documents/aidan-modern/public/images/large'

const DISPLAY = "Baskerville, 'Iowan Old Style', Georgia, serif"
const SANS = "'Avenir Next', 'Helvetica Neue', Arial, sans-serif"
const NARROW = "Futura, 'Avenir Next Condensed', 'Arial Narrow', sans-serif"

const photos = {
  hero: readImage('manila-hero-dsc-0898.jpg'),
  stone: readImage('manila-gallery-dsc-0075.jpg'),
  closeup: readImage('manila-gallery-dsc-0130.jpg'),
  redwall: readImage('manila-gallery-dsc-0190.jpg'),
  arcade: readImage('manila-gallery-dsc-0911.jpg'),
  nightClose: readImage('manila-gallery-night-003.jpg'),
  alleyBlueEyes: readImage('manila-gallery-graffiti-001.jpg'),
  marketJumpsuit: readImage('manila-gallery-market-001.jpg')
}

function readImage(file) {
  const data = fs.readFileSync(path.join(IMG_DIR, file))
  return `data:image/jpeg;base64,${data.toString('base64')}`
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

function darkShell(
  theme,
  {
    photo = null,
    photoOpacity = 1,
    overlayTop = 0.74,
    overlayMid = 0.26,
    overlayBottom = 0.84,
    grainOpacity = 0.12,
    content
  }
) {
  return `
    <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:${theme.bgBottom};">
      <div style="position:absolute;inset:0;background:linear-gradient(180deg, ${theme.bgTop} 0%, ${theme.bgMid} 50%, ${theme.bgBottom} 100%);"></div>
      ${photo ? `<img src="${photo}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;object-position:center;display:block;opacity:${photoOpacity};filter:saturate(1.07) contrast(1.04);"/>` : ''}
      <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(8,8,8,${overlayTop}) 0%, rgba(8,8,8,${overlayMid}) 48%, rgba(8,8,8,${overlayBottom}) 100%);"></div>
      <div style="position:absolute;inset:0;background:
        radial-gradient(circle at 17% 15%, ${theme.glowA}, transparent 24%),
        radial-gradient(circle at 84% 84%, ${theme.glowB}, transparent 22%),
        linear-gradient(135deg, ${theme.sheenA}, transparent 26%);"></div>
      ${content}
      ${filmGrain(grainOpacity)}
    </div>
  `
}

function lightShell(theme, { photo = null, content }) {
  return `
    <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:${theme.lightBase};">
      <div style="position:absolute;inset:0;background:linear-gradient(170deg, ${theme.lightTop} 0%, ${theme.lightMid} 58%, ${theme.lightBottom} 100%);"></div>
      <div style="position:absolute;inset:0;background:
        radial-gradient(circle at 82% 14%, ${theme.lightGlowA}, transparent 22%),
        radial-gradient(circle at 14% 88%, ${theme.lightGlowB}, transparent 22%);"></div>
      ${photo ? `<img src="${photo}" style="position:absolute;right:-90px;bottom:-120px;width:760px;height:1040px;object-fit:contain;object-position:center;opacity:0.34;display:block;filter:saturate(1.02) contrast(1.02);"/>` : ''}
      ${content}
      ${filmGrain(0.07)}
    </div>
  `
}

function introBlock({
  title,
  body,
  theme,
  top = 220,
  titleSize = 112,
  bodySize = 36,
  maxWidth = 860
}) {
  return `
    <div style="position:absolute;left:90px;right:90px;top:${top}px;text-align:center;">
      <h1 style="font-family:${DISPLAY};font-size:${titleSize}px;font-weight:700;line-height:0.95;color:${theme.text};margin:0 auto;text-shadow:${theme.titleShadow};max-width:${maxWidth}px;">
        ${title}
      </h1>
      ${body ? `<p style="font-family:${SANS};font-size:${bodySize}px;line-height:1.34;color:${theme.textSoft};margin:22px auto 0;max-width:760px;text-shadow:${theme.bodyShadow};">${body}</p>` : ''}
    </div>
  `
}

function proofMosaic(images) {
  const slots = [
    { left: 70, top: 620, width: 460, height: 620, rotate: -2.2 },
    { left: 550, top: 620, width: 460, height: 620, rotate: 2.1 },
    { left: 150, top: 1250, width: 320, height: 410, rotate: 1.4 },
    { left: 610, top: 1250, width: 320, height: 410, rotate: -1.8 }
  ]

  return images.map((image, index) => {
    const slot = slots[index]
    return `
      <img src="${image}" style="position:absolute;left:${slot.left}px;top:${slot.top}px;width:${slot.width}px;height:${slot.height}px;object-fit:contain;object-position:center;display:block;transform:rotate(${slot.rotate}deg);filter:drop-shadow(0 26px 42px rgba(0,0,0,0.34));"/>
    `
  }).join('')
}

function stepsCards(steps, theme) {
  return `
    <div style="position:absolute;left:90px;right:90px;top:560px;display:grid;gap:16px;">
      ${steps.map((step, index) => `
        <div style="display:flex;gap:16px;align-items:flex-start;padding:22px 24px;border-radius:24px;background:rgba(255,255,255,0.11);border:1.5px solid ${theme.ruleStrong};backdrop-filter:blur(10px);box-shadow:0 16px 30px rgba(0,0,0,0.2);">
          <span style="font-family:${DISPLAY};font-size:46px;line-height:1;color:${theme.text};width:34px;flex-shrink:0;">${index + 1}</span>
          <p style="font-family:${SANS};font-size:33px;line-height:1.32;color:${theme.textSoft};margin:0;">${step}</p>
        </div>
      `).join('')}
    </div>
  `
}

function valueSplit(items, theme, image, top = 600) {
  return `
    <div style="position:absolute;left:70px;right:70px;top:${top}px;display:grid;grid-template-columns:1.06fr 0.94fr;gap:24px;align-items:start;">
      <div style="display:grid;gap:14px;">
        ${items.map((item, index) => `
          <div style="display:flex;gap:14px;align-items:flex-start;padding:20px 22px;border-radius:22px;background:white;border:1.5px solid rgba(55,37,26,0.1);box-shadow:0 14px 28px rgba(40,26,18,0.08);">
            <span style="width:14px;height:14px;border-radius:999px;background:${theme.lightMeta};display:block;margin-top:14px;flex-shrink:0;"></span>
            <p style="font-family:${SANS};font-size:31px;line-height:1.32;color:${theme.lightTextSoft};margin:0;">${item}</p>
          </div>
        `).join('')}
      </div>
      <div style="border-radius:28px;overflow:hidden;background:#1b130f;color:white;box-shadow:0 20px 40px rgba(20,13,10,0.2);">
        <img src="${image}" style="width:100%;height:430px;object-fit:contain;object-position:center;display:block;background:rgba(0,0,0,0.08);"/>
        <div style="padding:24px 24px 28px;">
          <p style="font-family:${NARROW};font-size:22px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,220,190,0.78);margin:0 0 12px;">Real upgrade</p>
          <p style="font-family:${SANS};font-size:29px;line-height:1.34;color:rgba(255,242,232,0.88);margin:0;">
            Personal direction, polished edits, and photos you can actually use right away.
          </p>
        </div>
      </div>
    </div>
  `
}

function ctaRail(text, theme) {
  return `
    <div style="position:absolute;left:130px;right:130px;bottom:230px;text-align:center;">
      <div style="height:1.5px;background:${theme.ruleStrong};opacity:0.92;margin-bottom:20px;"></div>
      <p style="font-family:${SANS};font-size:31px;font-weight:600;line-height:1.34;color:${theme.textSoft};margin:0;text-shadow:${theme.bodyShadow};">${text}</p>
    </div>
  `
}

const funnels = [
  {
    folder: 'funnel-01_last-chance-electric',
    theme: {
      bgTop: '#0a1a4a',
      bgMid: '#071434',
      bgBottom: '#040d25',
      glowA: 'rgba(90,166,255,0.26)',
      glowB: 'rgba(255,190,120,0.18)',
      sheenA: 'rgba(162,194,255,0.14)',
      text: '#ffffff',
      textSoft: 'rgba(245,247,255,0.9)',
      rule: 'rgba(217,228,255,0.25)',
      ruleStrong: 'rgba(217,228,255,0.4)',
      titleShadow: '0 4px 20px rgba(0,0,0,0.56), 0 2px 8px rgba(0,0,0,0.72)',
      bodyShadow: '0 2px 10px rgba(0,0,0,0.58)',
      lightBase: '#f6ede4',
      lightTop: '#fff8f0',
      lightMid: '#f3e5d7',
      lightBottom: '#eecfb9',
      lightGlowA: 'rgba(255,170,130,0.28)',
      lightGlowB: 'rgba(255,224,184,0.24)',
      lightText: '#35231a',
      lightTextSoft: '#5d4334',
      lightMeta: '#9f6a52',
      lightRule: 'rgba(83,54,39,0.2)'
    },
    hero: photos.nightClose,
    processPhoto: photos.closeup,
    getPhoto: photos.redwall,
    cta: photos.redwall,
    proof: [photos.arcade, photos.closeup, photos.redwall, photos.stone],
    copy: {
      hookTitle: 'Manila<br/>Free Photo Shoot',
      hookBody: 'I am offering free shoots for a limited time. Message me now before these last slots are gone.',
      proofTitle: 'A quick peek at recent shoots.',
      proofBody: 'So you can see the vibe and quality we can create together.',
      howTitle: "If you want in, here's the flow.",
      steps: [
        'Message me and say you want a free shoot spot (or ask anything).',
        'I reply with the remaining dates and all the details.',
        'You choose what works and we lock it in by message.'
      ],
      getTitle: 'What you get from the free shoot.',
      getItems: [
        'A fun guided shoot where I direct you throughout',
        'Edited photos ready to post right away',
        'Help with vibe, outfits, and location ideas',
        'Direct communication with me from start to finish'
      ],
      getBody: 'Simple process, great photos, no complicated steps.',
      ctaTitle: 'Last chance. Only a few free spots left.',
      ctaBody: 'Message me now if you want one, or message me with questions. I reply personally.',
      ctaButton: 'Message me now'
    }
  },
  {
    folder: 'funnel-02_last-chance-fresh',
    theme: {
      bgTop: '#0a3021',
      bgMid: '#07261b',
      bgBottom: '#041911',
      glowA: 'rgba(112,255,203,0.22)',
      glowB: 'rgba(255,255,255,0.12)',
      sheenA: 'rgba(167,255,224,0.14)',
      text: '#f6fff9',
      textSoft: 'rgba(232,255,244,0.9)',
      rule: 'rgba(189,255,226,0.25)',
      ruleStrong: 'rgba(189,255,226,0.4)',
      titleShadow: '0 4px 20px rgba(0,0,0,0.56), 0 2px 8px rgba(0,0,0,0.72)',
      bodyShadow: '0 2px 10px rgba(0,0,0,0.56)',
      lightBase: '#f4efe5',
      lightTop: '#fffaf1',
      lightMid: '#efe4d3',
      lightBottom: '#e4d3be',
      lightGlowA: 'rgba(139,219,183,0.24)',
      lightGlowB: 'rgba(255,219,168,0.24)',
      lightText: '#30241b',
      lightTextSoft: '#59463a',
      lightMeta: '#8f705f',
      lightRule: 'rgba(79,58,45,0.2)'
    },
    hero: photos.alleyBlueEyes,
    processPhoto: photos.arcade,
    getPhoto: photos.stone,
    cta: photos.hero,
    proof: [photos.closeup, photos.stone, photos.arcade, photos.redwall],
    copy: {
      hookTitle: 'Manila<br/>Free Photo Shoot',
      hookBody: 'I only have a few spots left for this limited-time offer. If you want one, message me now.',
      proofTitle: 'Some recent frames I shot.',
      proofBody: 'This is the style and energy I can create for you too.',
      howTitle: 'How it works (super simple).',
      steps: [
        'You message me with interest or questions.',
        'I send open slot options and how we prep.',
        'If it feels right, we confirm your free slot in chat.'
      ],
      getTitle: "What's included for you.",
      getItems: [
        'A relaxed, directed shoot so you never feel lost',
        'Edited photos ready for your socials',
        'Creative input on outfits and location',
        'Fast message-based process directly with me'
      ],
      getBody: 'It should feel easy and exciting, not stressful.',
      ctaTitle: 'Limited time. Last few spots.',
      ctaBody: 'If you want to lock one in, message me now before this batch closes.',
      ctaButton: 'Message me to grab a spot'
    }
  },
  {
    folder: 'funnel-03_last-chance-bold',
    theme: {
      bgTop: '#3a1611',
      bgMid: '#2b100c',
      bgBottom: '#1a0907',
      glowA: 'rgba(255,144,114,0.24)',
      glowB: 'rgba(255,216,162,0.2)',
      sheenA: 'rgba(255,181,150,0.14)',
      text: '#fff8f5',
      textSoft: 'rgba(255,238,230,0.9)',
      rule: 'rgba(255,218,202,0.26)',
      ruleStrong: 'rgba(255,218,202,0.42)',
      titleShadow: '0 4px 20px rgba(0,0,0,0.56), 0 2px 8px rgba(0,0,0,0.74)',
      bodyShadow: '0 2px 10px rgba(0,0,0,0.56)',
      lightBase: '#f5eee6',
      lightTop: '#fff8f1',
      lightMid: '#f2e2d1',
      lightBottom: '#e8cfbb',
      lightGlowA: 'rgba(255,168,132,0.24)',
      lightGlowB: 'rgba(255,219,177,0.24)',
      lightText: '#321f18',
      lightTextSoft: '#5b4438',
      lightMeta: '#976652',
      lightRule: 'rgba(88,57,43,0.2)'
    },
    hero: photos.marketJumpsuit,
    processPhoto: photos.stone,
    getPhoto: photos.closeup,
    cta: photos.closeup,
    proof: [photos.redwall, photos.arcade, photos.hero, photos.stone],
    copy: {
      hookTitle: 'Manila<br/>Free Photo Shoot',
      hookBody: 'I still have a few slots, but not for long. Message me now if you want to grab one.',
      proofTitle: 'A few shots from recent sessions.',
      proofBody: 'So you can see what the final look actually feels like.',
      howTitle: 'Want in? Here is the quick flow.',
      steps: [
        'Message me if you are interested or just curious.',
        'I send details plus the last open slots.',
        'You claim a spot by message and we move forward.'
      ],
      getTitle: 'What you get when you book.',
      getItems: [
        'A guided shoot with clear direction from me',
        'Edited images you can use immediately',
        'Support with styling and creative vibe',
        'Friendly direct chat with me the whole way'
      ],
      getBody: 'Fun, personal, and built to give you strong photos fast.',
      ctaTitle: 'Final chance. Limited slots left.',
      ctaBody: 'If you want one, message me now. I handle every reply myself.',
      ctaButton: 'Message me now'
    }
  }
]

function buildSlides(funnel) {
  const t = funnel.theme
  const c = funnel.copy

  return [
    {
      name: '01_hey_free_photo_shoot',
      html: darkShell(t, {
        photo: funnel.hero,
        overlayTop: 0.48,
        overlayMid: 0.12,
        overlayBottom: 0.58,
        grainOpacity: 0.08,
        content: `
          ${introBlock({
            title: c.hookTitle,
            body: c.hookBody,
            theme: t,
            top: 180,
            titleSize: 94,
            bodySize: 33
          })}
          <div style="position:absolute;left:140px;right:140px;bottom:220px;height:2px;background:${t.ruleStrong};"></div>
        `
      })
    },
    {
      name: '02_proof',
      html: darkShell(t, {
        photo: funnel.processPhoto,
        photoOpacity: 0.26,
        content: `
          ${introBlock({
            title: c.proofTitle,
            body: c.proofBody,
            theme: t,
            top: 220,
            titleSize: 96,
            bodySize: 34
          })}
          ${proofMosaic(funnel.proof)}
        `
      })
    },
    {
      name: '03_how_it_works',
      html: darkShell(t, {
        photo: funnel.processPhoto,
        photoOpacity: 0.78,
        overlayTop: 0.48,
        overlayMid: 0.1,
        overlayBottom: 0.56,
        content: `
          <div style="position:absolute;left:90px;right:90px;top:220px;text-align:left;">
            <h2 style="font-family:${DISPLAY};font-size:102px;font-weight:700;line-height:0.95;color:${t.text};margin:0;max-width:760px;text-shadow:${t.titleShadow};">${c.howTitle}</h2>
            <div style="margin-top:20px;max-width:760px;padding:20px 24px;border-radius:22px;background:rgba(255,255,255,0.11);border:1.5px solid ${t.ruleStrong};backdrop-filter:blur(10px);">
              <p style="font-family:${SANS};font-size:31px;line-height:1.34;color:${t.textSoft};margin:0;">Message me and I will walk you through everything directly.</p>
            </div>
          </div>
          ${stepsCards(c.steps, t)}
        `
      })
    },
    {
      name: '04_what_you_get',
      html: `
        <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:${t.lightBase};">
          <div style="position:absolute;inset:0;background:linear-gradient(170deg, ${t.lightTop} 0%, ${t.lightMid} 58%, ${t.lightBottom} 100%);"></div>
          <div style="position:absolute;inset:0;background:
            radial-gradient(circle at 84% 14%, ${t.lightGlowA}, transparent 20%),
            radial-gradient(circle at 16% 86%, ${t.lightGlowB}, transparent 22%);"></div>
          <div style="position:absolute;left:82px;right:82px;top:210px;text-align:left;">
            <h2 style="font-family:${DISPLAY};font-size:84px;font-weight:700;line-height:0.95;color:${t.lightText};margin:0;max-width:820px;">${c.getTitle}</h2>
            <p style="font-family:${SANS};font-size:29px;line-height:1.34;color:${t.lightTextSoft};margin:14px 0 0;max-width:760px;">${c.getBody}</p>
          </div>
          ${valueSplit(c.getItems, t, funnel.getPhoto, 600)}
          ${filmGrain(0.07)}
        </div>
      `
    },
    {
      name: '05_cta',
      html: darkShell(t, {
        photo: funnel.cta,
        content: `
          ${introBlock({
            title: c.ctaTitle,
            body: c.ctaBody,
            theme: t,
            top: 220,
            titleSize: 104,
            bodySize: 35
          })}
          ${ctaRail(c.ctaButton, t)}
        `
      })
    }
  ]
}

function cleanOutputFolders() {
  const entries = fs.readdirSync(OUT, { withFileTypes: true })
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    if (entry.name.startsWith('story-') || entry.name.startsWith('funnel-')) {
      fs.rmSync(path.join(OUT, entry.name), { recursive: true, force: true })
    }
  }
}

async function render() {
  cleanOutputFolders()

  const browser = await chromium.launch()
  const context = await browser.newContext({
    viewport: { width: 1080, height: 1920 },
    deviceScaleFactor: 1
  })

  let total = 0

  for (const funnel of funnels) {
    const slides = buildSlides(funnel)
    const outFolder = path.join(OUT, funnel.folder)
    fs.mkdirSync(outFolder, { recursive: true })

    for (const slide of slides) {
      total += 1
      const page = await context.newPage()
      await page.setContent(
        `<!doctype html><html><head><style>
          * { box-sizing: border-box; }
          html, body { margin: 0; width: 1080px; height: 1920px; background: #000; overflow: hidden; }
          body { -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; }
        </style></head><body>${slide.html}</body></html>`,
        { waitUntil: 'load' }
      )
      await page.waitForTimeout(300)
      const file = path.join(outFolder, `${slide.name}.png`)
      await page.screenshot({ path: file, type: 'png' })
      await page.close()
      console.log(`Rendered ${funnel.folder}/${slide.name}.png`)
    }
  }

  await browser.close()
  console.log(`Done. Rendered ${total} slides.`)
}

render()
