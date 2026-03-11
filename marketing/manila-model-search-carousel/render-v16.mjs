import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v16')

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 410

const BOLD = "'Avenir Next', 'Helvetica Neue', Arial, sans-serif"
const BODY = "'Avenir Next', 'Helvetica Neue', Arial, sans-serif"
const NARROW = "Futura, 'Arial Narrow', sans-serif"

function resetOutputDir() {
  fs.rmSync(OUT_DIR, { recursive: true, force: true })
  fs.mkdirSync(OUT_DIR, { recursive: true })
}

function imageMime(name) {
  const ext = path.extname(name).toLowerCase()
  if (ext === '.png') return 'image/png'
  if (ext === '.webp') return 'image/webp'
  return 'image/jpeg'
}

function getTopManilaImages(count = 20) {
  return fs.readdirSync(IMAGE_DIR)
    .filter(file => file.startsWith('manila') && /\.(jpg|jpeg|png|webp)$/i.test(file))
    .sort((a, b) => a.localeCompare(b))
    .slice(0, count)
}

function readImage(name) {
  const filePath = path.join(IMAGE_DIR, name)
  const buf = fs.readFileSync(filePath)
  return `data:${imageMime(name)};base64,${buf.toString('base64')}`
}

function writeSources(selected) {
  const payload = {
    createdAt: new Date().toISOString(),
    strategy: 'v16 — full-bleed DR creative, manually selected manila* files',
    safeBottomPixels: SAFE_BOTTOM,
    images: selected
  }
  fs.writeFileSync(path.join(OUT_DIR, 'sources.json'), JSON.stringify(payload, null, 2))
}

function wrap(html) {
  return `<!DOCTYPE html>
  <html>
    <head>
      <style>
        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; background: #000; }
      </style>
    </head>
    <body>${html}</body>
  </html>`
}

// Slide 1: HOOK — full bleed hero, huge bold headline, pattern interrupt
function slideOne(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#000;">
      <img src="${images.hero}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top 20%;"/>
      <!-- top gradient for headline -->
      <div style="position:absolute;left:0;right:0;top:0;height:820px;background:linear-gradient(180deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0) 100%);"></div>
      <!-- bottom gradient for safe zone -->
      <div style="position:absolute;left:0;right:0;bottom:0;height:${SAFE_BOTTOM + 100}px;background:linear-gradient(0deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%);"></div>

      <!-- headline -->
      <div style="position:absolute;left:54px;top:72px;right:54px;">
        <p style="font-family:${NARROW};font-size:64px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#e8b880;margin:0 0 14px;">Manila</p>
        <h1 style="font-family:${BOLD};font-size:108px;font-weight:800;line-height:0.92;color:#fff;margin:0 0 28px;letter-spacing:-0.02em;">Models<br/>wanted.</h1>
        <p style="font-family:${BODY};font-size:34px;font-weight:500;line-height:1.34;color:rgba(255,255,255,0.92);margin:0;">Editorial portrait shoots.<br/>No experience needed.</p>
      </div>

      <!-- swipe indicator -->
      <div style="position:absolute;left:54px;bottom:${SAFE_BOTTOM + 40}px;display:flex;align-items:center;gap:14px;">
        <span style="font-family:${BODY};font-size:24px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:rgba(255,255,255,0.6);">Swipe</span>
        <span style="display:inline-block;width:40px;height:2px;background:rgba(255,255,255,0.5);"></span>
      </div>
    </div>
  `
}

// Slide 2: PROOF — asymmetric mosaic, magazine feel
function slideTwo(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#0a0a0a;">
      <!-- header -->
      <div style="position:absolute;left:54px;top:62px;right:54px;">
        <p style="font-family:${NARROW};font-size:64px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#e8b880;margin:0 0 10px;">Manila</p>
        <h2 style="font-family:${BOLD};font-size:62px;font-weight:800;line-height:0.94;color:#fff;margin:0;letter-spacing:-0.02em;">This is my work.</h2>
      </div>

      <!-- large hero image left -->
      <div style="position:absolute;left:28px;top:248px;width:580px;height:740px;border-radius:22px;overflow:hidden;">
        <img src="${images.gridA}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center;"/>
      </div>

      <!-- two stacked right -->
      <div style="position:absolute;left:622px;top:248px;width:430px;height:358px;border-radius:22px;overflow:hidden;">
        <img src="${images.gridB}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center;"/>
      </div>
      <div style="position:absolute;left:622px;top:620px;width:430px;height:368px;border-radius:22px;overflow:hidden;">
        <img src="${images.gridC}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center;"/>
      </div>

      <!-- wide bottom image -->
      <div style="position:absolute;left:28px;top:1002px;right:28px;height:460px;border-radius:22px;overflow:hidden;">
        <img src="${images.gridE}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:top;"/>
      </div>

      <!-- bottom text -->
      <div style="position:absolute;left:54px;bottom:${SAFE_BOTTOM + 36}px;right:54px;display:flex;align-items:center;justify-content:space-between;">
        <p style="font-family:${BODY};font-size:30px;font-weight:600;color:rgba(255,255,255,0.8);margin:0;">You could look like this.</p>
        <div style="display:flex;align-items:center;gap:14px;">
          <span style="font-family:${BODY};font-size:24px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:rgba(255,255,255,0.5);">Swipe</span>
          <span style="display:inline-block;width:40px;height:2px;background:rgba(255,255,255,0.4);"></span>
        </div>
      </div>
    </div>
  `
}

// Slide 3: HOW EASY — full bleed image, 3 dead-simple steps overlaid
function slideThree(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#000;">
      <img src="${images.process}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;"/>
      <!-- dark overlay -->
      <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.65) 100%);"></div>

      <div style="position:absolute;left:54px;top:62px;right:54px;">
        <p style="font-family:${NARROW};font-size:64px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#e8b880;margin:0 0 10px;">Manila</p>
        <h2 style="font-family:${BOLD};font-size:72px;font-weight:800;line-height:0.94;color:#fff;margin:0;letter-spacing:-0.02em;">3 steps.<br/>That's it.</h2>
      </div>

      <!-- steps -->
      <div style="position:absolute;left:54px;right:54px;top:340px;display:flex;flex-direction:column;gap:24px;">
        <div style="padding:32px 36px;border-radius:24px;background:rgba(255,255,255,0.12);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.15);">
          <div style="display:flex;align-items:baseline;gap:18px;">
            <span style="font-family:${BOLD};font-size:52px;font-weight:800;color:#fff;line-height:1;">1</span>
            <div>
              <p style="font-family:${BOLD};font-size:38px;font-weight:700;color:#fff;margin:0 0 6px;line-height:1.1;">Sign up below</p>
              <p style="font-family:${BODY};font-size:26px;color:rgba(255,255,255,0.75);margin:0;line-height:1.3;">Takes 60 seconds. I message you back.</p>
            </div>
          </div>
        </div>
        <div style="padding:32px 36px;border-radius:24px;background:rgba(255,255,255,0.12);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.15);">
          <div style="display:flex;align-items:baseline;gap:18px;">
            <span style="font-family:${BOLD};font-size:52px;font-weight:800;color:#fff;line-height:1;">2</span>
            <div>
              <p style="font-family:${BOLD};font-size:38px;font-weight:700;color:#fff;margin:0 0 6px;line-height:1.1;">We pick a date</p>
              <p style="font-family:${BODY};font-size:26px;color:rgba(255,255,255,0.75);margin:0;line-height:1.3;">Location, vibe, and look — we plan it together.</p>
            </div>
          </div>
        </div>
        <div style="padding:32px 36px;border-radius:24px;background:rgba(255,255,255,0.12);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.15);">
          <div style="display:flex;align-items:baseline;gap:18px;">
            <span style="font-family:${BOLD};font-size:52px;font-weight:800;color:#fff;line-height:1;">3</span>
            <div>
              <p style="font-family:${BOLD};font-size:38px;font-weight:700;color:#fff;margin:0 0 6px;line-height:1.1;">Show up. I guide you.</p>
              <p style="font-family:${BODY};font-size:26px;color:rgba(255,255,255,0.75);margin:0;line-height:1.3;">No posing experience needed. You just show up.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- swipe -->
      <div style="position:absolute;left:54px;bottom:${SAFE_BOTTOM + 36}px;display:flex;align-items:center;gap:14px;">
        <span style="font-family:${BODY};font-size:24px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:rgba(255,255,255,0.5);">Swipe</span>
        <span style="display:inline-block;width:40px;height:2px;background:rgba(255,255,255,0.4);"></span>
      </div>
    </div>
  `
}

// Slide 4: CTA — full bleed, urgency, one clear action
function slideFour(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#000;">
      <img src="${images.cta}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top 20%;"/>
      <!-- heavy top gradient -->
      <div style="position:absolute;left:0;right:0;top:0;height:900px;background:linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 55%, rgba(0,0,0,0) 100%);"></div>
      <!-- bottom gradient -->
      <div style="position:absolute;left:0;right:0;bottom:0;height:${SAFE_BOTTOM + 100}px;background:linear-gradient(0deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%);"></div>

      <div style="position:absolute;left:54px;top:72px;right:54px;">
        <p style="font-family:${NARROW};font-size:64px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#e8b880;margin:0 0 14px;">Manila</p>
        <h2 style="font-family:${BOLD};font-size:96px;font-weight:800;line-height:0.92;color:#fff;margin:0 0 30px;letter-spacing:-0.02em;">Sign up<br/>below.</h2>
        <p style="font-family:${BODY};font-size:34px;font-weight:500;line-height:1.38;color:rgba(255,255,255,0.9);margin:0 0 40px;">60-second form. I'll message<br/>you back within a day.</p>
      </div>

      <!-- urgency badge -->
      <div style="position:absolute;left:54px;top:520px;display:inline-flex;align-items:center;padding:16px 28px;border-radius:16px;background:rgba(255,255,255,0.14);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.2);">
        <span style="font-family:${BOLD};font-size:26px;font-weight:700;color:#fff;letter-spacing:0.02em;">Limited spots this month</span>
      </div>
    </div>
  `
}

async function render() {
  resetOutputDir()

  const all = getTopManilaImages()
  const selection = {
    hero: 'manila-gallery-canal-001.jpg',
    gridA: 'manila-gallery-closeup-001.jpg',
    gridB: 'manila-gallery-dsc-0911.jpg',
    gridC: 'manila-gallery-garden-002.jpg',
    gridD: 'manila-gallery-night-003.jpg',
    gridE: 'manila-gallery-dsc-0075.jpg',
    process: 'manila-gallery-dsc-0190.jpg',
    cta: 'manila-gallery-floor-001.jpg'
  }

  writeSources({ all_considered: all, selected: selection })

  const images = Object.fromEntries(
    Object.entries(selection).map(([key, file]) => [key, readImage(file)])
  )

  const slides = [
    ['01_hook_story.png', slideOne(images)],
    ['02_proof_story.png', slideTwo(images)],
    ['03_how_easy_story.png', slideThree(images)],
    ['04_sign_up_story.png', slideFour(images)]
  ]

  const browser = await chromium.launch()
  const context = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1
  })

  for (const [filename, html] of slides) {
    const page = await context.newPage()
    await page.setContent(wrap(html), { waitUntil: 'load' })
    await page.waitForTimeout(200)
    await page.screenshot({ path: path.join(OUT_DIR, filename), type: 'png' })
    await page.close()
    console.log(`Rendered ${filename}`)
  }

  await browser.close()
  console.log(`Done: ${slides.length} story/reels slides written to ${OUT_DIR}`)
}

render().catch(error => {
  console.error(error)
  process.exit(1)
})
