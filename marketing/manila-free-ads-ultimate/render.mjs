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
  hero: img('manila-hero-dsc-0898.jpg'),
  stone: img('manila-gallery-dsc-0075.jpg'),
  closeup: img('manila-gallery-dsc-0130.jpg'),
  redwall: img('manila-gallery-dsc-0190.jpg'),
  arcade: img('manila-gallery-dsc-0911.jpg')
}

function img(file) {
  const data = fs.readFileSync(path.join(IMG_DIR, file))
  return `data:image/jpeg;base64,${data.toString('base64')}`
}

function chip(text, theme, muted = false) {
  const color = muted ? theme.textSoft : theme.text
  const border = muted ? theme.borderSoft : theme.border
  const bg = muted ? theme.panelSoft : theme.panel
  return `
    <span style="display:inline-flex;align-items:center;gap:9px;padding:10px 16px;border-radius:999px;background:${bg};border:1.4px solid ${border};backdrop-filter:blur(8px);">
      <span style="width:6px;height:6px;border-radius:99px;background:${color};display:block;"></span>
      <span style="font-family:${NARROW};font-size:19px;font-weight:700;letter-spacing:0.13em;text-transform:uppercase;color:${color};">${text}</span>
    </span>
  `
}

function footer(text, theme, dark = false) {
  return `
    <div style="position:absolute;left:0;right:0;bottom:152px;text-align:center;">
      <span style="font-family:${NARROW};font-size:21px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:${dark ? 'rgba(12,12,12,0.46)' : 'rgba(255,255,255,0.72)'};">${text}</span>
    </div>
  `
}

function grain(opacity = 0.08) {
  return `
    <div style="position:absolute;inset:0;pointer-events:none;opacity:${opacity};mix-blend-mode:soft-light;background-image:
      radial-gradient(circle at 12% 18%, rgba(255,255,255,0.45), transparent 16%),
      radial-gradient(circle at 82% 12%, rgba(255,255,255,0.24), transparent 14%),
      radial-gradient(circle at 44% 80%, rgba(255,255,255,0.2), transparent 18%),
      repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 4px);"></div>
  `
}

function imagePanel(image, top = 760, height = 820) {
  return `
    <div style="position:absolute;left:56px;right:56px;top:${top}px;height:${height}px;border-radius:28px;background:rgba(255,255,255,0.08);border:1.5px solid rgba(255,255,255,0.16);padding:18px;display:flex;align-items:center;justify-content:center;overflow:hidden;box-shadow:0 18px 32px rgba(0,0,0,0.24);">
      <img src="${image}" style="width:100%;height:100%;object-fit:contain;object-position:center;display:block;"/>
    </div>
  `
}

function proofGrid(images) {
  return `
    <div style="position:absolute;left:56px;right:56px;top:600px;display:grid;grid-template-columns:1fr 1fr;gap:14px;">
      ${images.map(image => `
        <div style="height:340px;border-radius:22px;background:rgba(255,255,255,0.1);border:1.5px solid rgba(255,255,255,0.16);padding:12px;display:flex;align-items:center;justify-content:center;overflow:hidden;">
          <img src="${image}" style="width:100%;height:100%;object-fit:contain;object-position:center;display:block;"/>
        </div>
      `).join('')}
    </div>
  `
}

function shell(theme, content, dark = true) {
  return `
    <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:${theme.bgBottom};">
      <div style="position:absolute;inset:0;background:linear-gradient(180deg, ${theme.bgTop} 0%, ${theme.bgBottom} 100%);"></div>
      <div style="position:absolute;inset:0;background:
        radial-gradient(circle at 84% 16%, ${theme.accentA}, transparent 18%),
        radial-gradient(circle at 12% 86%, ${theme.accentB}, transparent 18%);"></div>
      ${content}
      ${grain(dark ? 0.1 : 0.07)}
    </div>
  `
}

function darkTitle(text) {
  return `font-family:${DISPLAY};font-size:104px;line-height:0.94;color:white;margin:0;text-shadow:0 3px 14px rgba(0,0,0,0.55),0 1px 3px rgba(0,0,0,0.75);max-width:830px;`
}

function darkBody() {
  return `font-family:${SANS};font-size:33px;line-height:1.33;color:rgba(255,255,255,0.9);margin:0;max-width:770px;text-shadow:0 2px 10px rgba(0,0,0,0.56);`
}

function lightTitle() {
  return `font-family:${DISPLAY};font-size:86px;line-height:0.96;color:#2b1f1a;margin:0;max-width:830px;`
}

function lightBody() {
  return `font-family:${SANS};font-size:31px;line-height:1.33;color:#5a4438;margin:0;`
}

const funnels = [
  {
    folder: 'funnel-01_last-chance-electric',
    theme: {
      bgTop: '#0a1538',
      bgBottom: '#08112b',
      accentA: 'rgba(97,172,255,0.25)',
      accentB: 'rgba(255,202,107,0.22)',
      text: '#ffffff',
      textSoft: 'rgba(255,255,255,0.82)',
      border: 'rgba(255,255,255,0.3)',
      borderSoft: 'rgba(255,255,255,0.2)',
      panel: 'rgba(255,255,255,0.12)',
      panelSoft: 'rgba(255,255,255,0.08)'
    },
    hero: photos.arcade,
    cta: photos.redwall,
    proof: [photos.arcade, photos.closeup, photos.redwall, photos.stone],
    copy: {
      hookTitle: 'Free Manila shoot spots are open.',
      hookBody: 'Last-chance batch. If you have been thinking about it, now is the time.',
      proofTitle: 'Real results.',
      proofBody: 'Actual photos from Manila sessions. Limited slots are almost gone.',
      howTitle: 'How it works.',
      steps: [
        'Message me if you are interested or if you have questions.',
        'I send details and current open limited-time slots.',
        'If you want in, we confirm your shoot directly by message.'
      ],
      whatTitle: 'What you get.',
      whatItems: [
        'A guided shoot with clear direction',
        'Edited photos ready to post',
        'Help with vibe, looks, and location',
        'Fast turnaround and easy communication',
        'A real free-shot opportunity before slots close'
      ],
      ctaTitle: 'Final call for free Manila slots.',
      ctaBody: 'If interested or if you have questions, message me now to move forward.',
      ctaButton: 'Message to reserve slot'
    }
  },
  {
    folder: 'funnel-02_last-chance-fresh',
    theme: {
      bgTop: '#0a2b1c',
      bgBottom: '#072014',
      accentA: 'rgba(110,255,195,0.24)',
      accentB: 'rgba(255,255,255,0.16)',
      text: '#ffffff',
      textSoft: 'rgba(255,255,255,0.82)',
      border: 'rgba(255,255,255,0.3)',
      borderSoft: 'rgba(255,255,255,0.2)',
      panel: 'rgba(255,255,255,0.12)',
      panelSoft: 'rgba(255,255,255,0.08)'
    },
    hero: photos.closeup,
    cta: photos.hero,
    proof: [photos.closeup, photos.stone, photos.arcade, photos.redwall],
    copy: {
      hookTitle: 'Free shoot. Fresh photos. Limited slots.',
      hookBody: 'Best time to upgrade your profile photos is right now while this batch is open.',
      proofTitle: 'Session proof.',
      proofBody: 'These are real outputs from past shoots. Last-chance free slots are active now.',
      howTitle: 'How it works.',
      steps: [
        'Message me if you are interested or if you want details.',
        'I share open limited-time slots and answer your questions.',
        'If it feels right, we lock your shoot by message.'
      ],
      whatTitle: 'What you get.',
      whatItems: [
        'Directed shoot flow from start to finish',
        'Edited photos you can use immediately',
        'Guidance on style, location, and vibe',
        'Simple process with fast replies',
        'A chance to claim a free slot before this batch closes'
      ],
      ctaTitle: 'Last chance to lock a free shoot spot.',
      ctaBody: 'If interested or if you have questions, message me now and I will send the next step.',
      ctaButton: 'Message to claim spot'
    }
  },
  {
    folder: 'funnel-03_last-chance-bold',
    theme: {
      bgTop: '#38140d',
      bgBottom: '#261009',
      accentA: 'rgba(255,136,108,0.26)',
      accentB: 'rgba(255,220,165,0.22)',
      text: '#ffffff',
      textSoft: 'rgba(255,255,255,0.82)',
      border: 'rgba(255,255,255,0.3)',
      borderSoft: 'rgba(255,255,255,0.2)',
      panel: 'rgba(255,255,255,0.12)',
      panelSoft: 'rgba(255,255,255,0.08)'
    },
    hero: photos.redwall,
    cta: photos.closeup,
    proof: [photos.redwall, photos.arcade, photos.hero, photos.stone],
    copy: {
      hookTitle: 'Quick heads up: free Manila shoot slots.',
      hookBody: 'This is a limited-time last-chance offer. Once filled, it is closed.',
      proofTitle: 'Proof you can trust.',
      proofBody: 'Real photos, real sessions, real results. Very few free slots left.',
      howTitle: 'How it works.',
      steps: [
        'Message me if you are interested or if you have questions.',
        'I send details and the remaining limited-time slot options.',
        'If you want one, we confirm everything by message.'
      ],
      whatTitle: 'What you get.',
      whatItems: [
        'A fun shoot with direction so it feels easy',
        'Edited final photos ready for socials',
        'Support on look and creative direction',
        'Fast and clear message-based process',
        'A last-chance free slot while this batch is live'
      ],
      ctaTitle: 'Limited time. Limited slots. Last call.',
      ctaBody: 'If interested or if you have questions, message me right now to move forward.',
      ctaButton: 'Message now'
    }
  }
]

function buildSlides(funnel) {
  const theme = funnel.theme
  const c = funnel.copy

  return [
    {
      name: '01_hey_free_photo_shoot',
      html: shell(theme, `
        <div style="position:absolute;top:200px;left:56px;right:56px;display:flex;justify-content:space-between;align-items:center;">
          ${chip('Hey free photo shoot', theme)}
          ${chip('Limited time', theme, true)}
        </div>
        <div style="position:absolute;left:56px;right:56px;top:430px;">
          <h1 style="${darkTitle()}">${c.hookTitle}</h1>
          <p style="${darkBody()}margin-top:18px;">${c.hookBody}</p>
        </div>
        ${imagePanel(funnel.hero, 860, 700)}
        ${footer('Proof', theme)}
      `, true)
    },
    {
      name: '02_proof',
      html: shell(theme, `
        <div style="position:absolute;top:200px;left:56px;right:56px;display:flex;justify-content:space-between;align-items:center;">
          ${chip('Proof', theme)}
          ${chip('Few slots left', theme, true)}
        </div>
        <div style="position:absolute;left:56px;right:56px;top:390px;">
          <h2 style="${darkTitle()}font-size:92px;">${c.proofTitle}</h2>
          <p style="${darkBody()}margin-top:16px;">${c.proofBody}</p>
        </div>
        ${proofGrid(funnel.proof)}
        ${footer('How it works', theme)}
      `, true)
    },
    {
      name: '03_how_it_works',
      html: shell(theme, `
        <div style="position:absolute;top:200px;left:56px;right:56px;display:flex;justify-content:space-between;align-items:center;">
          ${chip('How it works', theme)}
          ${chip('Last chance slots', theme, true)}
        </div>
        <div style="position:absolute;left:56px;right:56px;top:390px;">
          <h2 style="${darkTitle()}font-size:92px;">${c.howTitle}</h2>
        </div>
        <div style="position:absolute;left:56px;right:56px;top:590px;display:grid;gap:14px;">
          ${c.steps.map((text, index) => `
            <div style="display:flex;gap:16px;align-items:flex-start;padding:18px 20px;border-radius:20px;background:rgba(255,255,255,0.12);border:1.5px solid rgba(255,255,255,0.16);">
              <div style="width:42px;height:42px;border-radius:99px;background:rgba(255,255,255,0.82);display:flex;align-items:center;justify-content:center;color:#1b1512;font-family:${NARROW};font-size:23px;font-weight:700;flex-shrink:0;">${index + 1}</div>
              <p style="${darkBody()}font-size:30px;margin:0;">${text}</p>
            </div>
          `).join('')}
        </div>
        ${footer('What you get', theme)}
      `, true)
    },
    {
      name: '04_what_you_get',
      html: shell(
        {
          ...theme,
          bgTop: '#fdf7ef',
          bgBottom: '#f4e8db',
          accentA: 'rgba(255,173,132,0.26)',
          accentB: 'rgba(255,222,174,0.2)',
          text: '#2b1f1a',
          textSoft: '#5a4438',
          border: 'rgba(43,31,26,0.22)',
          borderSoft: 'rgba(43,31,26,0.14)',
          panel: 'rgba(255,255,255,0.78)',
          panelSoft: 'rgba(255,255,255,0.56)'
        },
        `
          <div style="position:absolute;top:200px;left:56px;right:56px;display:flex;justify-content:space-between;align-items:center;">
            ${chip('What you get', { ...theme, text: '#2b1f1a', textSoft: '#5a4438', border: 'rgba(43,31,26,0.22)', borderSoft: 'rgba(43,31,26,0.14)', panel: 'rgba(255,255,255,0.78)', panelSoft: 'rgba(255,255,255,0.56)' })}
            ${chip('Limited-time offer', { ...theme, text: '#2b1f1a', textSoft: '#5a4438', border: 'rgba(43,31,26,0.22)', borderSoft: 'rgba(43,31,26,0.14)', panel: 'rgba(255,255,255,0.78)', panelSoft: 'rgba(255,255,255,0.56)' }, true)}
          </div>
          <div style="position:absolute;left:56px;right:56px;top:390px;">
            <h2 style="${lightTitle()}">${c.whatTitle}</h2>
          </div>
          <div style="position:absolute;left:56px;right:56px;top:560px;display:grid;gap:13px;">
            ${c.whatItems.map(item => `
              <div style="padding:18px 20px;border-radius:18px;background:rgba(255,255,255,0.86);border:1.4px solid rgba(43,31,26,0.12);display:flex;align-items:center;gap:13px;">
                <div style="width:14px;height:14px;border-radius:99px;background:#ff8a60;flex-shrink:0;"></div>
                <p style="${lightBody()}font-size:29px;">${item}</p>
              </div>
            `).join('')}
          </div>
          ${footer('CTA', theme, true)}
        `,
        false
      )
    },
    {
      name: '05_cta',
      html: shell(theme, `
        <div style="position:absolute;top:200px;left:56px;right:56px;display:flex;justify-content:space-between;align-items:center;">
          ${chip('CTA', theme)}
          ${chip('Last chance', theme, true)}
        </div>
        <div style="position:absolute;left:56px;right:56px;top:430px;">
          <h2 style="${darkTitle()}">${c.ctaTitle}</h2>
          <p style="${darkBody()}margin-top:18px;">${c.ctaBody}</p>
        </div>
        ${imagePanel(funnel.cta, 860, 620)}
        <div style="position:absolute;left:56px;right:56px;bottom:282px;padding:23px 26px;border-radius:24px;background:rgba(255,255,255,0.12);border:1.5px solid rgba(255,255,255,0.16);backdrop-filter:blur(8px);display:flex;justify-content:space-between;align-items:center;">
          <span style="font-family:${NARROW};font-size:24px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:white;">${c.ctaButton}</span>
          <span style="font-family:${NARROW};font-size:32px;font-weight:700;color:#ffffff;">-></span>
        </div>
      `, true)
    }
  ]
}

function cleanOldOutputs() {
  const entries = fs.readdirSync(OUT, { withFileTypes: true })
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    if (entry.name.startsWith('story-') || entry.name.startsWith('funnel-')) {
      fs.rmSync(path.join(OUT, entry.name), { recursive: true, force: true })
    }
  }
}

async function render() {
  cleanOldOutputs()

  const browser = await chromium.launch()
  const context = await browser.newContext({
    viewport: { width: 1080, height: 1920 },
    deviceScaleFactor: 1
  })

  let total = 0

  for (const funnel of funnels) {
    const slides = buildSlides(funnel)
    const folder = path.join(OUT, funnel.folder)
    fs.mkdirSync(folder, { recursive: true })

    for (const slide of slides) {
      total += 1
      const page = await context.newPage()
      await page.setContent(
        `<!doctype html><html><head><style>
          * { box-sizing: border-box; }
          html, body { margin: 0; width: 1080px; height: 1920px; overflow: hidden; background: #000; }
          body { -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; }
        </style></head><body>${slide.html}</body></html>`,
        { waitUntil: 'load' }
      )
      await page.waitForTimeout(250)
      const file = path.join(folder, `${slide.name}.png`)
      await page.screenshot({ path: file, type: 'png' })
      await page.close()
      console.log(`Rendered ${funnel.folder}/${slide.name}.png`)
    }
  }

  await browser.close()
  console.log(`Done. Rendered ${total} slides.`)
}

render()
