import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, 'v3')
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

// Fonts
const SERIF = "Georgia, 'Times New Roman', serif"
const SANS = "Inter, -apple-system, system-ui, sans-serif"

// Heavy text shadow that actually works on any background
const S = 'text-shadow: 0 2px 4px rgba(0,0,0,0.95), 0 8px 30px rgba(0,0,0,0.7), 0 0 80px rgba(0,0,0,0.4);'

const slides = [

  // ─── SLIDE 1: THE HOOK ───
  // Full bleed photo. Magazine cover energy. "Manila" dominates.
  {
    name: '01_hook',
    html: `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
        <img src="${img0911}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(1.1) contrast(1.05);"/>
        <div style="position:absolute;inset:0;background:linear-gradient(180deg, transparent 0%, transparent 55%, rgba(0,0,0,0.85) 100%);"></div>

        <!-- Title block anchored bottom -->
        <div style="position:absolute;bottom:320px;left:64px;right:64px;">
          <h1 style="font-family:${SERIF};font-size:148px;font-weight:700;color:white;line-height:0.9;margin:0;${S}">
            Manila
          </h1>
          <h2 style="font-family:${SERIF};font-size:108px;font-weight:700;color:white;line-height:0.92;margin:16px 0 0;${S}">
            Free Photo Shoot
          </h2>
        </div>
      </div>
    `
  },

  // ─── SLIDE 2: THE PROOF (single hero) ───
  // One stunning full-bleed photo. Tiny label. The image IS the ad.
  {
    name: '02_proof',
    html: `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
        <img src="${img0190}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(1.1);"/>
        <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 20%, transparent 75%, rgba(0,0,0,0.5) 100%);"></div>

        <div style="position:absolute;bottom:320px;left:64px;right:64px;">
          <p style="font-family:${SANS};font-size:26px;font-weight:500;letter-spacing:0.25em;text-transform:uppercase;color:rgba(255,255,255,0.65);margin:0 0 16px 2px;${S}">
            From recent sessions
          </p>
          <p style="font-family:${SERIF};font-size:48px;font-weight:700;color:white;line-height:1.2;margin:0;${S}">
            10+ edited photos for your portfolio.
          </p>
        </div>
      </div>
    `
  },

  // ─── SLIDE 3: SECOND PROOF (different subject) ───
  // Shows range. Different person, different vibe.
  {
    name: '03_range',
    html: `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
        <img src="${img0075}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(1.1);"/>
        <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 20%, transparent 75%, rgba(0,0,0,0.5) 100%);"></div>

        <div style="position:absolute;bottom:320px;left:64px;right:64px;">
          <p style="font-family:${SERIF};font-size:48px;font-weight:700;color:white;line-height:1.2;margin:0;${S}">
            No experience needed. I direct everything.
          </p>
        </div>
      </div>
    `
  },

  // ─── SLIDE 4: THIRD PROOF (close-up) ───
  {
    name: '04_closeup',
    html: `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
        <img src="${img0130}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(1.1);"/>
        <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 20%, transparent 75%, rgba(0,0,0,0.5) 100%);"></div>

        <div style="position:absolute;bottom:320px;left:64px;right:64px;">
          <p style="font-family:${SERIF};font-size:48px;font-weight:700;color:white;line-height:1.2;margin:0;${S}">
            Location and outfit guidance included.
          </p>
        </div>
      </div>
    `
  },

  // ─── SLIDE 5: HOW IT WORKS ───
  // Clean, dark, editorial. Three lines. Nothing else.
  {
    name: '05_how',
    html: `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#0a0a0a;">

        <div style="position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;padding:0 80px;">

          <p style="font-family:${SANS};font-size:26px;font-weight:500;letter-spacing:0.3em;text-transform:uppercase;color:rgba(255,255,255,0.4);margin:0 0 60px 0;">
            How it works
          </p>

          <div style="display:flex;flex-direction:column;gap:52px;">

            <div style="display:flex;align-items:baseline;gap:28px;">
              <span style="font-family:${SERIF};font-size:72px;font-weight:700;color:rgba(255,255,255,0.15);line-height:1;">01</span>
              <div>
                <p style="font-family:${SERIF};font-size:44px;font-weight:700;color:white;margin:0;line-height:1.2;">Message me on Instagram or WhatsApp</p>
              </div>
            </div>

            <div style="width:100%;height:1px;background:rgba(255,255,255,0.08);"></div>

            <div style="display:flex;align-items:baseline;gap:28px;">
              <span style="font-family:${SERIF};font-size:72px;font-weight:700;color:rgba(255,255,255,0.15);line-height:1;">02</span>
              <div>
                <p style="font-family:${SERIF};font-size:44px;font-weight:700;color:white;margin:0;line-height:1.2;">We chat and plan your shoot</p>
              </div>
            </div>

            <div style="width:100%;height:1px;background:rgba(255,255,255,0.08);"></div>

            <div style="display:flex;align-items:baseline;gap:28px;">
              <span style="font-family:${SERIF};font-size:72px;font-weight:700;color:rgba(255,255,255,0.15);line-height:1;">03</span>
              <div>
                <p style="font-family:${SERIF};font-size:44px;font-weight:700;color:white;margin:0;line-height:1.2;">Show up and get great photos</p>
              </div>
            </div>

          </div>

          <p style="font-family:${SANS};font-size:30px;color:rgba(255,255,255,0.4);margin:64px 0 0;">100% free</p>

        </div>
      </div>
    `
  },

  // ─── SLIDE 6: CLOSE ───
  // Direct. "Message me." That's it.
  {
    name: '06_close',
    html: `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#0a0a0a;">

        <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0 80px;text-align:center;">

          <h2 style="font-family:${SERIF};font-size:108px;font-weight:700;color:white;line-height:1.0;margin:0;">
            Message<br/>me.
          </h2>

          <div style="width:60px;height:2px;background:rgba(255,255,255,0.2);margin:48px 0;"></div>

          <p style="font-family:${SANS};font-size:32px;color:rgba(255,255,255,0.5);line-height:1.5;margin:0;">
            Instagram DM or WhatsApp<br/>to book your free shoot in Manila
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
    await page.screenshot({ path: path.join(OUT, `${slide.name}.png`), type: 'png' })
    await page.close()
    console.log(`✓ ${slide.name}`)
  }

  await browser.close()
  console.log(`\nDone — ${slides.length} slides → ${OUT}`)
}

render()
