import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, 'v2')
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

const D = "Georgia, 'Times New Roman', ui-serif, serif"
const B = "Inter, -apple-system, system-ui, sans-serif"

const INK = '#0a0a0a'
const PAPER = '#f7f6f2'
const MUTED = '#767676'
const ACCENT = '#bfa06a'

const badge = (text, dark = false) => `
  <div style="display:inline-block;border:1.5px solid ${dark ? 'rgba(10,10,10,0.25)' : 'rgba(255,255,255,0.5)'};border-radius:999px;padding:9px 26px;">
    <span style="font-family:${B};font-size:20px;font-weight:600;letter-spacing:0.22em;text-transform:uppercase;color:${dark ? MUTED : 'white'};">${text}</span>
  </div>
`

const swipeHint = (dark = false) => `
  <div style="position:absolute;bottom:290px;left:0;right:0;text-align:center;">
    <span style="font-family:${B};font-size:22px;font-weight:500;letter-spacing:0.15em;text-transform:uppercase;color:${dark ? 'rgba(10,10,10,0.35)' : 'rgba(255,255,255,0.4)'};">swipe →</span>
  </div>
`

// Stronger text shadow for photo backgrounds
const TS = 'text-shadow:0 2px 4px rgba(0,0,0,0.8), 0 4px 16px rgba(0,0,0,0.5), 0 0px 40px rgba(0,0,0,0.3);'
const TS_SUB = 'text-shadow:0 2px 4px rgba(0,0,0,0.7), 0 4px 12px rgba(0,0,0,0.4);'

const slides = [
  // SLIDE 1: HOOK
  {
    name: '01_hook',
    html: `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;">
        <img src="${img0911}" style="width:100%;height:100%;object-fit:cover;display:block;"/>
        <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.25) 40%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.7) 100%);"></div>

        <div style="position:absolute;top:0;left:0;right:0;bottom:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0 70px;text-align:center;">
          <h1 style="font-family:${D};font-size:120px;font-weight:700;color:white;line-height:1.0;margin:0;${TS}">
            Manila
          </h1>
          <h2 style="font-family:${D};font-size:88px;font-weight:700;color:rgba(255,255,255,0.9);line-height:1.05;margin:16px 0 0;${TS}">
            Free Photo Shoot
          </h1>
          <p style="font-family:${B};font-size:36px;color:rgba(255,255,255,0.95);margin:48px 0 0;line-height:1.4;${TS_SUB}">
            No experience needed.
          </p>
        </div>

        ${swipeHint()}
      </div>
    `
  },

  // SLIDE 2: PROOF
  {
    name: '02_proof',
    html: `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:${INK};">
        <div style="position:absolute;top:0;left:0;right:0;bottom:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0 36px;">

          <h2 style="font-family:${D};font-size:52px;font-weight:700;color:white;margin:0 0 36px;text-align:center;line-height:1.1;">
            From recent sessions
          </h2>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;width:100%;">
            <img src="${img0075}" style="width:100%;height:490px;object-fit:cover;border-radius:8px;display:block;"/>
            <img src="${img0130}" style="width:100%;height:490px;object-fit:cover;border-radius:8px;display:block;"/>
            <img src="${img0911}" style="width:100%;height:490px;object-fit:cover;border-radius:8px;display:block;"/>
            <img src="${img0190}" style="width:100%;height:490px;object-fit:cover;border-radius:8px;display:block;"/>
          </div>

        </div>
        ${swipeHint()}
      </div>
    `
  },

  // SLIDE 3: OBJECTION KILL
  {
    name: '03_no_experience',
    html: `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;">
        <img src="${img0190}" style="width:100%;height:100%;object-fit:cover;display:block;"/>
        <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.3) 35%, rgba(0,0,0,0.25) 55%, rgba(0,0,0,0.7) 100%);"></div>

        <div style="position:absolute;top:0;left:0;right:0;bottom:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0 80px;text-align:center;">
          <h2 style="font-family:${D};font-size:88px;font-weight:700;color:white;line-height:1.05;margin:0;${TS}">
            Not a model?<br/>Perfect.
          </h2>
          <div style="width:80px;height:3px;background:${ACCENT};margin:44px 0;border-radius:2px;"></div>
          <p style="font-family:${B};font-size:38px;color:white;line-height:1.45;margin:0;${TS_SUB}">
            I direct you throughout the session so you don't need to know how to pose.
          </p>
          <p style="font-family:${B};font-size:34px;color:rgba(255,255,255,0.85);line-height:1.4;margin:28px 0 0;${TS_SUB}">
            It feels easy and natural.
          </p>
        </div>

        ${swipeHint()}
      </div>
    `
  },

  // SLIDE 4: WHAT YOU GET
  {
    name: '04_what_you_get',
    html: `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:${PAPER};">

        <div style="position:absolute;top:0;left:0;right:0;bottom:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:200px 80px 290px;text-align:left;">

          <div style="width:100%;margin-bottom:50px;">
            <h2 style="font-family:${D};font-size:72px;font-weight:700;color:${INK};margin:0;line-height:1.05;">What you get</h2>
            <div style="width:60px;height:3px;background:${ACCENT};margin:28px 0 0;border-radius:2px;"></div>
          </div>

          <div style="display:flex;flex-direction:column;gap:36px;width:100%;">
            <div style="display:flex;align-items:flex-start;gap:24px;">
              <div style="width:48px;height:48px;border-radius:50%;background:${INK};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                <span style="font-family:${B};color:white;font-size:22px;font-weight:700;">1</span>
              </div>
              <div>
                <span style="font-family:${B};font-size:38px;font-weight:600;color:${INK};line-height:1.3;">Directed photo session</span>
                <p style="font-family:${B};font-size:30px;color:${MUTED};margin:6px 0 0;line-height:1.3;">In Manila — BGC, Makati, or Intramuros</p>
              </div>
            </div>
            <div style="display:flex;align-items:flex-start;gap:24px;">
              <div style="width:48px;height:48px;border-radius:50%;background:${INK};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                <span style="font-family:${B};color:white;font-size:22px;font-weight:700;">2</span>
              </div>
              <div>
                <span style="font-family:${B};font-size:38px;font-weight:600;color:${INK};line-height:1.3;">10+ edited photos</span>
                <p style="font-family:${B};font-size:30px;color:${MUTED};margin:6px 0 0;line-height:1.3;">For your portfolio</p>
              </div>
            </div>
            <div style="display:flex;align-items:flex-start;gap:24px;">
              <div style="width:48px;height:48px;border-radius:50%;background:${INK};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                <span style="font-family:${B};color:white;font-size:22px;font-weight:700;">3</span>
              </div>
              <div>
                <span style="font-family:${B};font-size:38px;font-weight:600;color:${INK};line-height:1.3;">Location + outfit guidance</span>
                <p style="font-family:${B};font-size:30px;color:${MUTED};margin:6px 0 0;line-height:1.3;">Before we even shoot</p>
              </div>
            </div>
            <div style="display:flex;align-items:flex-start;gap:24px;">
              <div style="width:48px;height:48px;border-radius:50%;background:${INK};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                <span style="font-family:${B};color:white;font-size:22px;font-weight:700;">4</span>
              </div>
              <div>
                <span style="font-family:${B};font-size:38px;font-weight:600;color:${INK};line-height:1.3;">Gallery in 7 days</span>
                <p style="font-family:${B};font-size:30px;color:${MUTED};margin:6px 0 0;line-height:1.3;">Fast turnaround, ready to post</p>
              </div>
            </div>
          </div>

          <div style="width:100%;margin-top:50px;padding:24px 32px;background:rgba(21,128,61,0.08);border-radius:16px;border:1.5px solid rgba(21,128,61,0.15);">
            <p style="font-family:${B};font-size:34px;font-weight:700;color:#15803d;margin:0;text-align:center;">100% free</p>
          </div>
        </div>

        ${swipeHint(true)}
      </div>
    `
  },

  // SLIDE 5: HOW EASY
  {
    name: '05_how_easy',
    html: `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;">
        <img src="${img0075}" style="width:100%;height:100%;object-fit:cover;display:block;filter:brightness(0.7);"/>
        <div style="position:absolute;inset:0;background:rgba(0,0,0,0.45);"></div>

        <div style="position:absolute;top:0;left:0;right:0;bottom:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:200px 80px 290px;text-align:center;">

          <h2 style="font-family:${D};font-size:72px;font-weight:700;color:white;margin:0 0 16px;line-height:1.05;${TS}">
            How it works
          </h2>
          <div style="width:60px;height:3px;background:${ACCENT};margin:0 0 52px;border-radius:2px;"></div>

          <div style="display:flex;flex-direction:column;gap:36px;text-align:left;width:100%;">
            <div style="background:rgba(0,0,0,0.35);border-radius:20px;padding:28px 32px;display:flex;align-items:flex-start;gap:24px;backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,0.08);">
              <div style="width:52px;height:52px;border-radius:50%;background:white;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                <span style="font-family:${B};color:${INK};font-size:24px;font-weight:800;">1</span>
              </div>
              <div style="padding-top:4px;">
                <span style="font-family:${B};font-size:36px;font-weight:600;color:white;line-height:1.3;">Sign up and pick a time</span>
                <p style="font-family:${B};font-size:28px;color:rgba(255,255,255,0.65);margin:6px 0 0;line-height:1.3;">Quick intro call — less than a minute to book</p>
              </div>
            </div>
            <div style="background:rgba(0,0,0,0.35);border-radius:20px;padding:28px 32px;display:flex;align-items:flex-start;gap:24px;backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,0.08);">
              <div style="width:52px;height:52px;border-radius:50%;background:white;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                <span style="font-family:${B};color:${INK};font-size:24px;font-weight:800;">2</span>
              </div>
              <div style="padding-top:4px;">
                <span style="font-family:${B};font-size:36px;font-weight:600;color:white;line-height:1.3;">We chat to plan your shoot</span>
                <p style="font-family:${B};font-size:28px;color:rgba(255,255,255,0.65);margin:6px 0 0;line-height:1.3;">Make sure it's a good fit for both of us</p>
              </div>
            </div>
            <div style="background:rgba(0,0,0,0.35);border-radius:20px;padding:28px 32px;display:flex;align-items:flex-start;gap:24px;backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,0.08);">
              <div style="width:52px;height:52px;border-radius:50%;background:white;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                <span style="font-family:${B};color:${INK};font-size:24px;font-weight:800;">3</span>
              </div>
              <div style="padding-top:4px;">
                <span style="font-family:${B};font-size:36px;font-weight:600;color:white;line-height:1.3;">Show up and have fun</span>
                <p style="font-family:${B};font-size:28px;color:rgba(255,255,255,0.65);margin:6px 0 0;line-height:1.3;">Get great photos at no cost</p>
              </div>
            </div>
          </div>

          <p style="font-family:${B};font-size:28px;color:rgba(255,255,255,0.55);margin:40px 0 0;${TS_SUB}">Simple flow. No long forms. No pressure.</p>
        </div>

        ${swipeHint()}
      </div>
    `
  },

  // SLIDE 6: CLOSE
  {
    name: '06_close',
    html: `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;">
        <img src="${img0130}" style="width:100%;height:100%;object-fit:cover;display:block;filter:brightness(0.65);"/>
        <div style="position:absolute;inset:0;background:rgba(0,0,0,0.4);"></div>

        <div style="position:absolute;top:0;left:0;right:0;bottom:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:200px 70px 290px;text-align:center;">

          <h2 style="font-family:${D};font-size:96px;font-weight:700;color:white;line-height:1.05;margin:0;${TS}">
            Want free photos?
          </h2>
          <h2 style="font-family:${D};font-size:96px;font-weight:700;color:white;line-height:1.05;margin:10px 0 0;${TS}">
            Let's make it happen.
          </h2>

          <div style="width:80px;height:3px;background:${ACCENT};margin:44px 0;border-radius:2px;"></div>

          <p style="font-family:${B};font-size:36px;color:white;line-height:1.45;margin:0 0 20px;${TS_SUB}">
            Pick a time for a quick intro call.<br/>We'll plan your shoot together.
          </p>

          <div style="margin-top:36px;padding:20px 44px;background:rgba(21,128,61,0.25);border-radius:999px;border:2px solid rgba(134,239,172,0.5);backdrop-filter:blur(8px);">
            <p style="font-family:${B};font-size:32px;font-weight:700;color:#86efac;margin:0;${TS_SUB}">100% free</p>
          </div>

          <p style="font-family:${B};font-size:28px;color:rgba(255,255,255,0.6);margin:32px 0 0;${TS_SUB}">
            Spots are limited.
          </p>
        </div>
      </div>
    `
  }
]

async function render() {
  const browser = await chromium.launch()
  const context = await browser.newContext({
    viewport: { width: 1080, height: 1920 },
    deviceScaleFactor: 1
  })

  for (const slide of slides) {
    const page = await context.newPage()
    await page.setContent(`<!DOCTYPE html><html><head><style>*{margin:0;padding:0;box-sizing:border-box;}</style></head><body>${slide.html}</body></html>`, { waitUntil: 'load' })
    await page.waitForTimeout(500)
    const outPath = path.join(OUT, `${slide.name}.png`)
    await page.screenshot({ path: outPath, type: 'png' })
    await page.close()
    console.log(`✓ ${slide.name}`)
  }

  await browser.close()
  console.log(`\nDone — ${slides.length} slides in ${OUT}`)
}

render()
