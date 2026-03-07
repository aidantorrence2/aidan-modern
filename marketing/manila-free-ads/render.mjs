import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = __dirname
const IMG_DIR = '/Users/aidantorrence/Documents/aidan-modern/public/images/large'

function imgDataUri(filename) {
  const buf = fs.readFileSync(path.join(IMG_DIR, filename))
  return `data:image/jpeg;base64,${buf.toString('base64')}`
}

const img0075 = imgDataUri('manila-gallery-dsc-0075.jpg')
const img0130 = imgDataUri('manila-gallery-dsc-0130.jpg')
const img0911 = imgDataUri('manila-gallery-dsc-0911.jpg')
const img0190 = imgDataUri('manila-gallery-dsc-0190.jpg')
const imgHero = imgDataUri('manila-hero-dsc-0898.jpg')

// IG safe zone: top ~200px, bottom ~280px are covered by overlays
// So content should live roughly between y=200 and y=1640

const FONT_DISPLAY = "Georgia, 'Times New Roman', ui-serif, serif"
const FONT_BODY = "Inter, -apple-system, system-ui, 'Segoe UI', sans-serif"

const ads = [
  {
    name: 'ad01_hero',
    html: `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;">
        <img src="${img0911}" style="width:100%;height:100%;object-fit:cover;display:block;"/>
        <div style="position:absolute;inset:0;background:linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.15) 35%, rgba(0,0,0,0.1) 55%, rgba(0,0,0,0.65) 100%);"></div>
        <div style="position:absolute;top:220px;left:0;right:0;text-align:center;padding:0 80px;">
          <div style="display:inline-block;border:1.5px solid rgba(255,255,255,0.5);border-radius:999px;padding:10px 28px;margin-bottom:40px;">
            <span style="font-family:${FONT_BODY};font-size:22px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:white;">Free Collab Sessions</span>
          </div>
          <h1 style="font-family:${FONT_DISPLAY};font-size:100px;font-weight:700;color:white;line-height:1.05;margin:0;text-shadow:0 4px 20px rgba(0,0,0,0.4);">
            Get amazing photos for free.
          </h1>
        </div>
        <div style="position:absolute;bottom:310px;left:0;right:0;text-align:center;padding:0 90px;">
          <p style="font-family:${FONT_BODY};font-size:38px;color:white;line-height:1.45;margin:0 0 28px 0;text-shadow:0 2px 10px rgba(0,0,0,0.4);">
            I'm looking for people to collaborate with in Manila. You get edited photos at no cost.
          </p>
          <p style="font-family:${FONT_BODY};font-size:34px;color:rgba(255,255,255,0.8);margin:0;text-shadow:0 2px 8px rgba(0,0,0,0.3);">
            No modeling experience needed.
          </p>
        </div>
      </div>
    `
  },
  {
    name: 'ad02_what_you_get',
    html: `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#f7f6f2;">
        <img src="${img0190}" style="width:100%;height:50%;object-fit:cover;object-position:center top;display:block;"/>
        <div style="position:absolute;top:0;left:0;right:0;height:50%;background:linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 35%, transparent 75%, rgba(247,246,242,1) 100%);"></div>
        <div style="position:absolute;top:210px;left:0;right:0;text-align:center;">
          <div style="display:inline-block;border:1.5px solid rgba(255,255,255,0.5);border-radius:999px;padding:8px 24px;">
            <span style="font-family:${FONT_BODY};font-size:20px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:white;">Free Collab Sessions</span>
          </div>
        </div>
        <div style="position:absolute;bottom:300px;left:0;right:0;padding:0 80px;">
          <h2 style="font-family:${FONT_DISPLAY};font-size:62px;font-weight:700;color:#0a0a0a;margin:0 0 36px 0;line-height:1.1;">What you get</h2>
          <div style="display:flex;flex-direction:column;gap:20px;">
            <div style="display:flex;align-items:flex-start;gap:14px;">
              <span style="font-family:${FONT_BODY};font-size:34px;color:#0a0a0a;flex-shrink:0;">-</span>
              <span style="font-family:${FONT_BODY};font-size:34px;color:#404040;line-height:1.35;">30 to 60 minute directed session in Manila</span>
            </div>
            <div style="display:flex;align-items:flex-start;gap:14px;">
              <span style="font-family:${FONT_BODY};font-size:34px;color:#0a0a0a;flex-shrink:0;">-</span>
              <span style="font-family:${FONT_BODY};font-size:34px;color:#404040;line-height:1.35;">10+ edited photos ready for IG, dating, and personal brand use</span>
            </div>
            <div style="display:flex;align-items:flex-start;gap:14px;">
              <span style="font-family:${FONT_BODY};font-size:34px;color:#0a0a0a;flex-shrink:0;">-</span>
              <span style="font-family:${FONT_BODY};font-size:34px;color:#404040;line-height:1.35;">Location and outfit guidance before we shoot</span>
            </div>
            <div style="display:flex;align-items:flex-start;gap:14px;">
              <span style="font-family:${FONT_BODY};font-size:34px;color:#0a0a0a;flex-shrink:0;">-</span>
              <span style="font-family:${FONT_BODY};font-size:34px;color:#404040;line-height:1.35;">Final gallery in 7 days</span>
            </div>
          </div>
          <p style="font-family:${FONT_BODY};margin:36px 0 0;font-size:32px;font-weight:700;color:#15803d;">100% free - no cost, no catch</p>
        </div>
      </div>
    `
  },
  {
    name: 'ad03_how_it_works',
    html: `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#f7f6f2;">
        <img src="${img0075}" style="width:100%;height:46%;object-fit:cover;object-position:center top;display:block;"/>
        <div style="position:absolute;top:0;left:0;right:0;height:46%;background:linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 35%, transparent 75%, rgba(247,246,242,1) 100%);"></div>
        <div style="position:absolute;top:210px;left:0;right:0;text-align:center;">
          <div style="display:inline-block;border:1.5px solid rgba(255,255,255,0.5);border-radius:999px;padding:8px 24px;">
            <span style="font-family:${FONT_BODY};font-size:20px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:white;">Free Collab Sessions</span>
          </div>
        </div>
        <div style="position:absolute;bottom:310px;left:0;right:0;padding:0 80px;">
          <h2 style="font-family:${FONT_DISPLAY};font-size:62px;font-weight:700;color:#0a0a0a;margin:0 0 44px 0;line-height:1.1;">How it works</h2>
          <div style="display:flex;flex-direction:column;gap:32px;">
            <div style="display:flex;align-items:flex-start;gap:20px;">
              <span style="font-family:${FONT_BODY};display:flex;align-items:center;justify-content:center;width:52px;height:52px;border-radius:50%;background:#0a0a0a;color:white;font-size:26px;font-weight:700;flex-shrink:0;">1</span>
              <span style="font-family:${FONT_BODY};font-size:34px;color:#404040;line-height:1.35;padding-top:4px;">Sign up and pick a time for a quick intro call</span>
            </div>
            <div style="display:flex;align-items:flex-start;gap:20px;">
              <span style="font-family:${FONT_BODY};display:flex;align-items:center;justify-content:center;width:52px;height:52px;border-radius:50%;background:#0a0a0a;color:white;font-size:26px;font-weight:700;flex-shrink:0;">2</span>
              <span style="font-family:${FONT_BODY};font-size:34px;color:#404040;line-height:1.35;padding-top:4px;">We chat to make sure it's a good fit for both of us</span>
            </div>
            <div style="display:flex;align-items:flex-start;gap:20px;">
              <span style="font-family:${FONT_BODY};display:flex;align-items:center;justify-content:center;width:52px;height:52px;border-radius:50%;background:#0a0a0a;color:white;font-size:26px;font-weight:700;flex-shrink:0;">3</span>
              <span style="font-family:${FONT_BODY};font-size:34px;color:#404040;line-height:1.35;padding-top:4px;">Show up, have fun, and get great photos at no cost</span>
            </div>
          </div>
          <p style="font-family:${FONT_BODY};margin:44px 0 0;font-size:36px;font-weight:600;color:#0a0a0a;line-height:1.3;">No modeling experience needed.<br/>I guide you the whole time.</p>
        </div>
      </div>
    `
  },
  {
    name: 'ad04_cta',
    html: `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;">
        <img src="${img0130}" style="width:100%;height:100%;object-fit:cover;display:block;"/>
        <div style="position:absolute;inset:0;background:linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.05) 55%, rgba(0,0,0,0.6) 100%);"></div>
        <div style="position:absolute;top:220px;left:0;right:0;text-align:center;padding:0 80px;">
          <div style="display:inline-block;border:1.5px solid rgba(255,255,255,0.5);border-radius:999px;padding:10px 28px;margin-bottom:40px;">
            <span style="font-family:${FONT_BODY};font-size:22px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:white;">Free Collab Sessions</span>
          </div>
          <h1 style="font-family:${FONT_DISPLAY};font-size:92px;font-weight:700;color:white;line-height:1.05;margin:0;text-shadow:0 4px 20px rgba(0,0,0,0.4);">
            Want free photos? Let's make it happen.
          </h1>
        </div>
        <div style="position:absolute;bottom:310px;left:0;right:0;text-align:center;padding:0 90px;">
          <p style="font-family:${FONT_BODY};font-size:36px;color:white;line-height:1.45;margin:0 0 24px 0;text-shadow:0 2px 10px rgba(0,0,0,0.4);">
            Pick a time for a quick intro call. We'll chat to see if it's a good fit and plan your shoot.
          </p>
          <p style="font-family:${FONT_BODY};font-size:34px;font-weight:700;color:#86efac;margin:0;text-shadow:0 2px 8px rgba(0,0,0,0.4);">
            100% free - no cost, no catch
          </p>
        </div>
      </div>
    `
  },
  {
    name: 'ad05_gallery',
    html: `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#0a0a0a;">
        <div style="position:absolute;top:220px;left:0;right:0;text-align:center;z-index:2;">
          <div style="display:inline-block;border:1.5px solid rgba(255,255,255,0.4);border-radius:999px;padding:8px 24px;margin-bottom:24px;">
            <span style="font-family:${FONT_BODY};font-size:20px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:white;">Free Collab Sessions</span>
          </div>
          <h2 style="font-family:${FONT_DISPLAY};font-size:58px;font-weight:700;color:white;margin:0;padding:0 60px;line-height:1.1;">Photos from Real Sessions</h2>
        </div>
        <div style="position:absolute;top:440px;left:40px;right:40px;display:grid;grid-template-columns:1fr 1fr;gap:14px;">
          <img src="${img0075}" style="width:100%;height:500px;object-fit:cover;border-radius:10px;display:block;"/>
          <img src="${img0130}" style="width:100%;height:500px;object-fit:cover;border-radius:10px;display:block;"/>
          <img src="${img0911}" style="width:100%;height:500px;object-fit:cover;border-radius:10px;display:block;"/>
          <img src="${img0190}" style="width:100%;height:500px;object-fit:cover;border-radius:10px;display:block;"/>
        </div>
        <div style="position:absolute;bottom:310px;left:0;right:0;text-align:center;padding:0 70px;">
          <p style="font-family:${FONT_DISPLAY};font-size:42px;font-weight:600;color:white;margin:0 0 14px;">Get amazing photos for free.</p>
          <p style="font-family:${FONT_BODY};font-size:32px;color:rgba(255,255,255,0.65);margin:0;">No modeling experience needed. I guide everything.</p>
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

  for (const ad of ads) {
    const page = await context.newPage()
    await page.setContent(`<!DOCTYPE html><html><head><style>*{margin:0;padding:0;box-sizing:border-box;}</style></head><body>${ad.html}</body></html>`, { waitUntil: 'load' })
    await page.waitForTimeout(500)
    const outPath = path.join(OUT, `${ad.name}.png`)
    await page.screenshot({ path: outPath, type: 'png' })
    await page.close()
    console.log(`Rendered ${ad.name}.png`)
  }

  await browser.close()
}

render()
