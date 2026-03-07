import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = __dirname
const IMG_DIR = '/Users/aidantorrence/Documents/aidan-modern/public/images/large'

const DISPLAY = "'Didot', 'Bodoni MT', 'Times New Roman', serif"
const SANS = "'Avenir Next', 'Helvetica Neue', Arial, sans-serif"
const NARROW = "'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif"

const photos = {
  hero: readImage('manila-hero-dsc-0898.jpg'),
  stone: readImage('manila-gallery-dsc-0075.jpg'),
  closeup: readImage('manila-gallery-dsc-0130.jpg'),
  redwall: readImage('manila-gallery-dsc-0190.jpg'),
  arcade: readImage('manila-gallery-dsc-0911.jpg')
}

function readImage(file) {
  const data = fs.readFileSync(path.join(IMG_DIR, file))
  return `data:image/jpeg;base64,${data.toString('base64')}`
}

function deckBackground(theme) {
  return `
    <div style="position:absolute;inset:0;background:linear-gradient(160deg, ${theme.bgA} 0%, ${theme.bgB} 54%, ${theme.bgC} 100%);"></div>
    <div style="position:absolute;inset:0;background:
      radial-gradient(circle at 82% 14%, ${theme.glowA}, transparent 20%),
      radial-gradient(circle at 16% 84%, ${theme.glowB}, transparent 20%);"></div>
  `
}

function grain(opacity = 0.08) {
  return `
    <div style="position:absolute;inset:0;opacity:${opacity};pointer-events:none;mix-blend-mode:soft-light;background-image:
      radial-gradient(circle at 14% 18%, rgba(255,255,255,0.35), transparent 16%),
      radial-gradient(circle at 84% 12%, rgba(255,255,255,0.2), transparent 14%),
      repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 4px);"></div>
  `
}

function heroPhoto(image, top = 1110, width = 760, height = 860) {
  return `
    <img src="${image}" style="position:absolute;left:50%;top:${top}px;transform:translate(-50%,-50%);width:${width}px;height:${height}px;object-fit:contain;object-position:center;display:block;filter:drop-shadow(0 26px 40px rgba(0,0,0,0.36));"/>
  `
}

function proofStack(images) {
  const slots = [
    { left: 96, top: 620, w: 360, h: 360, rot: -2.5 },
    { left: 624, top: 600, w: 360, h: 360, rot: 2.2 },
    { left: 80, top: 1010, w: 380, h: 360, rot: 1.8 },
    { left: 620, top: 1010, w: 380, h: 360, rot: -1.5 }
  ]

  return images
    .map((image, index) => {
      const slot = slots[index]
      return `
        <img src="${image}" style="position:absolute;left:${slot.left}px;top:${slot.top}px;width:${slot.w}px;height:${slot.h}px;object-fit:contain;object-position:center;display:block;transform:rotate(${slot.rot}deg);filter:drop-shadow(0 20px 28px rgba(0,0,0,0.32));"/>
      `
    })
    .join('')
}

function stepLines(steps, theme, top = 560) {
  return `
    <div style="position:absolute;left:120px;right:120px;top:${top}px;">
      ${steps.map((step, i) => `
        <div style="padding:20px 0;border-bottom:1px solid ${theme.rule};display:flex;gap:16px;align-items:flex-start;">
          <span style="font-family:${DISPLAY};font-size:46px;line-height:1;color:${theme.text};width:36px;flex-shrink:0;">${i + 1}</span>
          <p style="font-family:${SANS};font-size:34px;line-height:1.3;color:${theme.textSoft};margin:0;">${step}</p>
        </div>
      `).join('')}
    </div>
  `
}

function bulletList(items, theme, top = 540) {
  return `
    <div style="position:absolute;left:120px;right:120px;top:${top}px;">
      ${items.map((item, i) => `
        <div style="display:flex;gap:14px;align-items:flex-start;padding:14px 0;border-bottom:1px solid ${theme.rule};">
          <span style="font-family:${NARROW};font-size:21px;line-height:1.2;letter-spacing:0.08em;text-transform:uppercase;color:${theme.meta};width:34px;flex-shrink:0;">0${i + 1}</span>
          <p style="font-family:${SANS};font-size:34px;line-height:1.32;color:${theme.textSoft};margin:0;">${item}</p>
        </div>
      `).join('')}
    </div>
  `
}

function ctaStrip(text, theme) {
  return `
    <div style="position:absolute;left:120px;right:120px;bottom:300px;padding:18px 0;border-top:1px solid ${theme.ruleStrong};border-bottom:1px solid ${theme.ruleStrong};display:flex;justify-content:space-between;align-items:center;">
      <span style="font-family:${SANS};font-size:30px;font-weight:600;letter-spacing:0.01em;color:${theme.text};">${text}</span>
      <span style="font-family:${NARROW};font-size:32px;font-weight:700;color:${theme.text};">-></span>
    </div>
  `
}

function titleStyle(theme, size = 92) {
  return `font-family:${DISPLAY};font-size:${size}px;line-height:0.95;color:${theme.text};margin:0 auto;text-shadow:${theme.shadow};max-width:780px;text-align:center;`
}

function bodyStyle(theme) {
  return `font-family:${SANS};font-size:32px;line-height:1.34;color:${theme.textSoft};margin:0 auto;text-shadow:${theme.bodyShadow};max-width:760px;text-align:center;`
}

const funnels = [
  {
    folder: 'funnel-01_last-chance-electric',
    theme: {
      bgA: '#091743',
      bgB: '#071231',
      bgC: '#050d24',
      glowA: 'rgba(89,163,255,0.24)',
      glowB: 'rgba(255,203,110,0.18)',
      text: '#f8f9ff',
      textSoft: 'rgba(238,242,255,0.88)',
      meta: 'rgba(226,233,255,0.86)',
      metaSoft: 'rgba(200,212,255,0.66)',
      rule: 'rgba(214,225,255,0.22)',
      ruleStrong: 'rgba(214,225,255,0.34)',
      shadow: '0 3px 14px rgba(0,0,0,0.55),0 1px 3px rgba(0,0,0,0.75)',
      bodyShadow: '0 2px 10px rgba(0,0,0,0.56)'
    },
    hero: photos.arcade,
    cta: photos.redwall,
    proof: [photos.arcade, photos.closeup, photos.redwall, photos.stone],
    copy: {
      hookTitle: "Hey, I'm opening a few free photo shoot spots in Manila.",
      hookBody: 'If you have been meaning to do this, message me. I only have a small number of spots this round.',
      proofTitle: 'Photos from recent shoots.',
      proofBody: "Just sharing these so you can see my style and what we can create together.",
      howTitle: 'How it works.',
      steps: [
        'Message me if you are interested or even if you just have questions.',
        'I reply with details and the free spots that are still open.',
        'If it feels like a fit, we confirm your shoot by message.'
      ],
      getTitle: 'What you get.',
      getItems: [
        'A shoot where I guide you the whole time',
        'Edited photos you can post and use right away',
        'Help with look, vibe, and location if you want it',
        'Fast, easy communication directly with me'
      ],
      ctaTitle: 'If you want one of these free spots, message me now.',
      ctaBody: "It's me on the other side. Happy to answer anything before we book.",
      ctaButton: 'Message me to grab a spot'
    }
  },
  {
    folder: 'funnel-02_last-chance-fresh',
    theme: {
      bgA: '#062c1d',
      bgB: '#052218',
      bgC: '#041710',
      glowA: 'rgba(92,255,192,0.2)',
      glowB: 'rgba(255,255,255,0.12)',
      text: '#f2fff9',
      textSoft: 'rgba(229,255,244,0.86)',
      meta: 'rgba(201,255,231,0.84)',
      metaSoft: 'rgba(173,240,209,0.64)',
      rule: 'rgba(188,255,225,0.22)',
      ruleStrong: 'rgba(188,255,225,0.34)',
      shadow: '0 3px 14px rgba(0,0,0,0.55),0 1px 3px rgba(0,0,0,0.72)',
      bodyShadow: '0 2px 10px rgba(0,0,0,0.52)'
    },
    hero: photos.closeup,
    cta: photos.hero,
    proof: [photos.closeup, photos.stone, photos.arcade, photos.redwall],
    copy: {
      hookTitle: "I'm doing a free Manila shoot round and spots are almost gone.",
      hookBody: 'If you want fresh photos soon, send me a message now while I still have space.',
      proofTitle: 'More shots from recent sessions.',
      proofBody: 'So you can get a real feel for the look and quality.',
      howTitle: 'How it works.',
      steps: [
        'You message me with interest or questions.',
        'I send details and what free spots are still available.',
        'If you are in, we lock it in right there.'
      ],
      getTitle: 'What you get.',
      getItems: [
        'A relaxed shoot with direction from me',
        'Edited photos you can use immediately',
        'Help with styling and location planning',
        'A simple process from first message to final files'
      ],
      ctaTitle: 'Last few free spots are still open right now.',
      ctaBody: 'If you want one, message me and I will walk you through the next step.',
      ctaButton: 'Message me for a free spot'
    }
  },
  {
    folder: 'funnel-03_last-chance-bold',
    theme: {
      bgA: '#3a140e',
      bgB: '#2b100c',
      bgC: '#1c0a08',
      glowA: 'rgba(255,137,109,0.22)',
      glowB: 'rgba(255,221,170,0.18)',
      text: '#fff8f6',
      textSoft: 'rgba(255,236,230,0.86)',
      meta: 'rgba(255,215,201,0.86)',
      metaSoft: 'rgba(255,196,175,0.66)',
      rule: 'rgba(255,220,206,0.22)',
      ruleStrong: 'rgba(255,220,206,0.34)',
      shadow: '0 3px 14px rgba(0,0,0,0.55),0 1px 3px rgba(0,0,0,0.72)',
      bodyShadow: '0 2px 10px rgba(0,0,0,0.52)'
    },
    hero: photos.redwall,
    cta: photos.closeup,
    proof: [photos.redwall, photos.arcade, photos.hero, photos.stone],
    copy: {
      hookTitle: 'Quick note: I still have a few free Manila shoot spots.',
      hookBody: 'This round is nearly full, so I wanted to post this before I close it.',
      proofTitle: 'A few more examples.',
      proofBody: 'These are from recent sessions and show the direction I can give you.',
      howTitle: 'How it works.',
      steps: [
        'Message me if you are interested or have questions.',
        'I send you details and the remaining open spots.',
        'If you want to move forward, we confirm your slot by message.'
      ],
      getTitle: 'What you get.',
      getItems: [
        'Direction all throughout the shoot',
        'Edited photos ready for socials',
        'Support on styling and creative direction',
        'Direct communication with me from start to finish'
      ],
      ctaTitle: 'If you want in, message me before these spots close.',
      ctaBody: 'I only have a few left and I handle replies personally.',
      ctaButton: 'Message me now'
    }
  }
]

function slideShell(theme, content) {
  return `
    <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:${theme.bgC};">
      ${deckBackground(theme)}
      ${content}
      ${grain(0.09)}
    </div>
  `
}

function buildSlides(funnel) {
  const t = funnel.theme
  const c = funnel.copy

  return [
    {
      name: '01_hey_free_photo_shoot',
      html: slideShell(t, `
        <div style="position:absolute;left:60px;right:60px;top:220px;">
          <h1 style="${titleStyle(t)}">${c.hookTitle}</h1>
          <p style="${bodyStyle(t)}margin-top:18px;">${c.hookBody}</p>
        </div>
        ${heroPhoto(funnel.hero, 1160, 720, 780)}
      `)
    },
    {
      name: '02_proof',
      html: slideShell(t, `
        <div style="position:absolute;left:60px;right:60px;top:220px;">
          <h2 style="${titleStyle(t, 96)}">${c.proofTitle}</h2>
          <p style="${bodyStyle(t)}margin-top:14px;">${c.proofBody}</p>
        </div>
        ${proofStack(funnel.proof)}
      `)
    },
    {
      name: '03_how_it_works',
      html: slideShell(t, `
        <div style="position:absolute;left:60px;right:60px;top:220px;">
          <h2 style="${titleStyle(t, 96)}">${c.howTitle}</h2>
        </div>
        ${stepLines(c.steps, t, 500)}
      `)
    },
    {
      name: '04_what_you_get',
      html: `
        <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#f7efe6;">
          <div style="position:absolute;inset:0;background:linear-gradient(165deg, #fff9f1 0%, #f5e8d9 58%, #efd9c7 100%);"></div>
          <div style="position:absolute;inset:0;background:
            radial-gradient(circle at 84% 14%, rgba(255,164,124,0.26), transparent 20%),
            radial-gradient(circle at 18% 86%, rgba(255,223,180,0.24), transparent 22%);"></div>
          <div style="position:absolute;left:60px;right:60px;top:220px;">
            <h2 style="font-family:${DISPLAY};font-size:94px;line-height:0.95;color:#362419;margin:0;">${c.getTitle}</h2>
          </div>
          ${bulletList(c.getItems, {
            textSoft: '#5f4538',
            meta: '#9f6a50',
            rule: 'rgba(90,58,42,0.18)'
          }, 460)}
          ${grain(0.05)}
        </div>
      `
    },
    {
      name: '05_cta',
      html: slideShell(t, `
        <div style="position:absolute;left:60px;right:60px;top:220px;">
          <h2 style="${titleStyle(t, 98)}">${c.ctaTitle}</h2>
          <p style="${bodyStyle(t)}margin-top:16px;">${c.ctaBody}</p>
        </div>
        ${heroPhoto(funnel.cta, 1160, 720, 700)}
        ${ctaStrip(c.ctaButton, t)}
      `)
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
      await page.waitForTimeout(250)
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
