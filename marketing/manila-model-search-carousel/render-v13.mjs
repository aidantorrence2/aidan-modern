import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v13')

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 410

const DISPLAY = "'Baskerville', 'Iowan Old Style', Georgia, serif"
const SANS = "'Avenir Next', 'Helvetica Neue', Arial, sans-serif"
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
    strategy: 'manually selected from sorted manila* files in public/images/large',
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

function safeShade(dark = true) {
  return `
    <div style="position:absolute;left:0;right:0;bottom:0;height:${SAFE_BOTTOM}px;background:linear-gradient(180deg, rgba(0,0,0,0) 0%, ${dark ? 'rgba(5,9,14,0.08)' : 'rgba(52,35,28,0.05)'} 24%, ${dark ? 'rgba(5,9,14,0.26)' : 'rgba(52,35,28,0.16)'} 100%);"></div>
  `
}

function topLabel(dark = false) {
  return `
    <div style="position:absolute;left:58px;top:42px;right:58px;display:flex;align-items:center;justify-content:space-between;">
      <span style="font-family:${NARROW};font-size:34px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${dark ? '#d7a16f' : '#9d6e54'};">Manila Model Search</span>
      <span style="width:88px;height:5px;border-radius:999px;background:${dark ? '#d7a16f' : '#9d6e54'};opacity:0.8;"></span>
    </div>
  `
}

function framed(src, style, fit = 'cover', bg = 'white') {
  return `
    <div style="position:absolute;${style};padding:12px;background:${bg};border-radius:30px;box-shadow:0 26px 54px rgba(0,0,0,0.16);">
      <img src="${src}" style="width:100%;height:100%;display:block;border-radius:20px;object-fit:${fit};object-position:center;"/>
    </div>
  `
}

function cleanImage(src, style, fit = 'cover', radius = 34) {
  return `
    <div style="position:absolute;${style};overflow:hidden;border-radius:${radius}px;box-shadow:0 28px 58px rgba(0,0,0,0.18);">
      <img src="${src}" style="width:100%;height:100%;display:block;object-fit:${fit};object-position:center;"/>
    </div>
  `
}

function darkBox({ left, top, width, title, body }) {
  return `
    <div style="position:absolute;left:${left}px;top:${top}px;width:${width}px;padding:34px 34px 32px;border-radius:34px;background:rgba(6,10,15,0.9);border:1px solid rgba(255,255,255,0.12);box-shadow:0 28px 60px rgba(0,0,0,0.24);">
      <h1 style="font-family:${DISPLAY};font-size:92px;font-weight:700;line-height:0.9;color:#fff;margin:0 0 18px;">${title}</h1>
      <p style="font-family:${SANS};font-size:33px;line-height:1.32;color:rgba(243,246,252,0.92);margin:0;">${body}</p>
    </div>
  `
}

function lightBox({ left, top, width, title, body }) {
  return `
    <div style="position:absolute;left:${left}px;top:${top}px;width:${width}px;padding:34px 34px 32px;border-radius:34px;background:rgba(255,250,245,0.96);border:1px solid rgba(84,58,43,0.1);box-shadow:0 22px 48px rgba(84,58,43,0.08);">
      <h2 style="font-family:${DISPLAY};font-size:78px;font-weight:700;line-height:0.92;color:#241914;margin:0 0 18px;">${title}</h2>
      <p style="font-family:${SANS};font-size:30px;line-height:1.34;color:#5b4335;margin:0;">${body}</p>
    </div>
  `
}

function chip(text, left, top, width) {
  return `
    <div style="position:absolute;left:${left}px;top:${top}px;width:${width}px;padding:20px 22px;border-radius:22px;background:rgba(255,250,245,0.96);border:1px solid rgba(84,58,43,0.08);box-shadow:0 18px 40px rgba(84,58,43,0.06);">
      <p style="font-family:${SANS};font-size:28px;line-height:1.34;color:#453128;margin:0;">${text}</p>
    </div>
  `
}

function stepCard(number, title, body, left, top, width) {
  return `
    <div style="position:absolute;left:${left}px;top:${top}px;width:${width}px;padding:24px 24px 22px;border-radius:26px;background:rgba(6,10,15,0.88);border:1px solid rgba(255,255,255,0.1);box-shadow:0 24px 52px rgba(0,0,0,0.18);">
      <p style="font-family:${NARROW};font-size:18px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#d7a16f;margin:0 0 10px;">Step ${number}</p>
      <p style="font-family:${DISPLAY};font-size:42px;font-weight:700;line-height:1.02;color:#fff;margin:0 0 10px;">${title}</p>
      <p style="font-family:${SANS};font-size:27px;line-height:1.36;color:rgba(243,246,252,0.9);margin:0;">${body}</p>
    </div>
  `
}

function slideOne(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#efe6dc;">
      <div style="position:absolute;inset:0;background:radial-gradient(circle at 14% 16%, rgba(255,255,255,0.8), transparent 18%), linear-gradient(180deg, #f8f1ea 0%, #ebddd0 100%);"></div>
      ${safeShade(false)}
      ${topLabel(false)}
      ${darkBox({
        left: 58,
        top: 148,
        width: 964,
        title: 'Looking for models in Manila.',
        body: 'Editorial-style portrait shoots. Experience not required. If you want strong photos and guided direction, apply.'
      })}
      ${cleanImage(images.hero, 'left:66px;top:640px;width:948px;height:956px;', 'contain', 36)}
    </div>
  `
}

function slideTwo(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#efe6dc;">
      <div style="position:absolute;inset:0;background:radial-gradient(circle at 18% 16%, rgba(255,255,255,0.82), transparent 18%), linear-gradient(180deg, #faf4ed 0%, #eadbcd 100%);"></div>
      ${safeShade(false)}
      ${topLabel(false)}
      <div style="position:absolute;left:58px;top:148px;right:58px;padding:30px 32px;border-radius:32px;background:rgba(255,250,245,0.96);border:1px solid rgba(84,58,43,0.1);box-shadow:0 22px 48px rgba(84,58,43,0.08);">
        <h2 style="font-family:${DISPLAY};font-size:68px;font-weight:700;line-height:0.94;color:#241914;margin:0 0 14px;">Photos I’ve already made.</h2>
        <p style="font-family:${SANS};font-size:29px;line-height:1.34;color:#5b4335;margin:0;">This is the kind of work I’m known for: clean direction, strong frames, and photos that actually feel considered.</p>
      </div>
      ${framed(images.keepOne, 'left:58px;top:432px;width:308px;height:420px;transform:rotate(-2deg);')}
      ${framed(images.keepTwo, 'left:386px;top:432px;width:308px;height:420px;transform:rotate(2deg);')}
      ${framed(images.proofA, 'left:714px;top:432px;width:308px;height:420px;transform:rotate(-1deg);')}
      ${framed(images.proofB, 'left:58px;top:886px;width:472px;height:704px;')}
      ${framed(images.proofC, 'left:550px;top:886px;width:472px;height:704px;')}
    </div>
  `
}

function slideThree(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#f1e6d9;">
      <div style="position:absolute;inset:0;background:radial-gradient(circle at 84% 16%, rgba(255,255,255,0.74), transparent 18%), linear-gradient(180deg, #faf4ed 0%, #eadccd 100%);"></div>
      ${safeShade(false)}
      ${topLabel(false)}
      ${lightBox({
        left: 58,
        top: 148,
        width: 964,
        title: 'What you get.',
        body: 'Portfolio-quality images, direction throughout the shoot, and a look that feels intentional.'
      })}
      ${framed(images.closeup, 'left:58px;top:486px;width:450px;height:688px;')}
      ${framed(images.softPortrait, 'left:544px;top:486px;width:478px;height:530px;')}
      ${chip('Guided direction so first-timers feel comfortable.', 544, 1044, 420)}
      ${chip('Edited photos ready for portfolio or social.', 544, 1180, 420)}
      ${chip('Help with vibe, styling, and overall look.', 544, 1316, 420)}
      ${framed(images.banner, 'left:58px;top:1212px;width:450px;height:376px;', 'cover')}
    </div>
  `
}

function slideFour(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#0f1721;">
      <img src="${images.processPhoto}" style="position:absolute;right:0;top:0;width:560px;height:100%;display:block;object-fit:cover;object-position:center;"/>
      <div style="position:absolute;inset:0;background:linear-gradient(90deg, rgba(7,12,18,0.98) 0%, rgba(7,12,18,0.94) 48%, rgba(7,12,18,0.24) 100%);"></div>
      ${safeShade(true)}
      ${topLabel(true)}
      <h2 style="position:absolute;left:58px;top:148px;width:390px;font-family:${DISPLAY};font-size:68px;font-weight:700;line-height:0.9;color:#fff;margin:0;">How the shoot works.</h2>
      <p style="position:absolute;left:58px;top:332px;width:390px;font-family:${SANS};font-size:25px;line-height:1.34;color:rgba(243,246,252,0.9);margin:0;">Simple process. No experience needed before you show up.</p>
      ${stepCard(1, 'Fill out the form.', 'It only takes a minute to send your details and preferred shoot vibe.', 58, 438, 430)}
      ${stepCard(2, 'We pick the plan.', 'I message you back and we choose the date, location, and look together.', 58, 756, 430)}
      ${stepCard(3, 'Show up and I guide you.', 'You do not need to know how to pose. I direct the session throughout.', 58, 1074, 430)}
    </div>
  `
}

function slideFive(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#0f1721;">
      <div style="position:absolute;inset:0;background:radial-gradient(circle at 84% 18%, rgba(39,70,111,0.34), transparent 18%), linear-gradient(180deg, #111b27 0%, #09111a 100%);"></div>
      ${safeShade(true)}
      ${topLabel(true)}
      <div style="position:absolute;left:58px;top:148px;width:964px;padding:34px 34px 32px;border-radius:34px;background:rgba(6,10,15,0.9);border:1px solid rgba(255,255,255,0.12);box-shadow:0 30px 62px rgba(0,0,0,0.24);">
        <h2 style="font-family:${DISPLAY};font-size:82px;font-weight:700;line-height:0.9;color:#fff;margin:0 0 18px;">Tap sign up to apply.</h2>
        <p style="font-family:${SANS};font-size:30px;line-height:1.34;color:rgba(243,246,252,0.92);margin:0;">Fill out the short form and I’ll message you back.</p>
      </div>
      ${cleanImage(images.ctaMain, 'left:66px;top:648px;width:948px;height:948px;', 'contain', 36)}
    </div>
  `
}

async function render() {
  resetOutputDir()

  const all = getTopManilaImages()
  const selection = {
    hero: 'manila-gallery-canal-001.jpg',
    banner: 'manila-gallery-canal-002.jpg',
    keepOne: 'manila-gallery-dsc-0190.jpg',
    keepTwo: 'manila-gallery-dsc-0911.jpg',
    proofA: 'manila-gallery-market-001.jpg',
    proofB: 'manila-gallery-garden-002.jpg',
    proofC: 'manila-gallery-night-003.jpg',
    closeup: 'manila-gallery-closeup-001.jpg',
    softPortrait: 'manila-gallery-dsc-0075.jpg',
    processPhoto: 'manila-gallery-dsc-0911.jpg',
    ctaMain: 'manila-gallery-floor-001.jpg'
  }

  writeSources({ all_considered: all, selected: selection })

  const images = Object.fromEntries(
    Object.entries(selection).map(([key, file]) => [key, readImage(file)])
  )

  const slides = [
    ['01_models_in_manila_story.png', slideOne(images)],
    ['02_portfolio_images_story.png', slideTwo(images)],
    ['03_what_you_get_story.png', slideThree(images)],
    ['04_how_the_shoot_works_story.png', slideFour(images)],
    ['05_sign_up_story.png', slideFive(images)]
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
