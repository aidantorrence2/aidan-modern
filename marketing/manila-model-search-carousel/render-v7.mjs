import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v7')

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
    <div style="position:absolute;left:58px;top:48px;right:58px;display:flex;align-items:center;justify-content:space-between;">
      <span style="font-family:${NARROW};font-size:34px;font-weight:700;letter-spacing:0.24em;text-transform:uppercase;color:${dark ? '#d7a16f' : '#9d6e54'};">Manila</span>
      <span style="width:132px;height:4px;border-radius:999px;background:${dark ? '#d7a16f' : '#9d6e54'};opacity:0.8;"></span>
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

function darkCopyBox({ left, top, width, title, body, kicker }) {
  return `
    <div style="position:absolute;left:${left}px;top:${top}px;width:${width}px;padding:34px 34px 32px;border-radius:34px;background:rgba(6,10,15,0.88);border:1px solid rgba(255,255,255,0.12);box-shadow:0 28px 60px rgba(0,0,0,0.24);">
      ${kicker ? `<p style="font-family:${NARROW};font-size:19px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#d7a16f;margin:0 0 18px;">${kicker}</p>` : ''}
      <h1 style="font-family:${DISPLAY};font-size:90px;font-weight:700;line-height:0.9;color:#fff;margin:0 0 18px;">${title}</h1>
      <p style="font-family:${SANS};font-size:33px;line-height:1.32;color:rgba(243,246,252,0.92);margin:0;">${body}</p>
    </div>
  `
}

function lightCopyBox({ left, top, width, title, body, kicker }) {
  return `
    <div style="position:absolute;left:${left}px;top:${top}px;width:${width}px;padding:34px 34px 32px;border-radius:34px;background:rgba(255,250,245,0.96);border:1px solid rgba(84,58,43,0.1);box-shadow:0 22px 48px rgba(84,58,43,0.08);">
      ${kicker ? `<p style="font-family:${NARROW};font-size:19px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#9d6e54;margin:0 0 18px;">${kicker}</p>` : ''}
      <h2 style="font-family:${DISPLAY};font-size:78px;font-weight:700;line-height:0.92;color:#241914;margin:0 0 18px;">${title}</h2>
      <p style="font-family:${SANS};font-size:30px;line-height:1.34;color:#5b4335;margin:0;">${body}</p>
    </div>
  `
}

function statBullet(text, left, top, width) {
  return `
    <div style="position:absolute;left:${left}px;top:${top}px;width:${width}px;padding:22px 24px 22px 54px;border-radius:24px;background:rgba(255,250,245,0.96);border:1px solid rgba(84,58,43,0.08);box-shadow:0 18px 40px rgba(84,58,43,0.06);">
      <span style="position:absolute;left:22px;top:26px;width:16px;height:16px;border-radius:999px;background:#c17d56;"></span>
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
      ${darkCopyBox({
        left: 58,
        top: 138,
        width: 432,
        kicker: 'Model search',
        title: 'Looking for models in Manila.',
        body: 'Editorial-style portrait shoots. Experience not required. If you want strong photos and guided direction, apply.'
      })}
      ${framed(images.hero, 'right:58px;top:128px;width:474px;height:1460px;')}
    </div>
  `
}

function slideTwo(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#efe6dc;">
      <div style="position:absolute;inset:0;background:radial-gradient(circle at 18% 16%, rgba(255,255,255,0.82), transparent 18%), linear-gradient(180deg, #faf4ed 0%, #eadbcd 100%);"></div>
      ${safeShade(false)}
      ${topLabel(false)}
      ${lightCopyBox({
        left: 58,
        top: 132,
        width: 404,
        kicker: 'Portfolio proof',
        title: 'Real portfolio images.',
        body: 'A few examples so people can instantly understand the look, quality, and range.'
      })}
      ${framed(images.keepOne, 'right:74px;top:118px;width:300px;height:432px;transform:rotate(4deg);')}
      ${framed(images.keepTwo, 'right:390px;top:156px;width:246px;height:352px;transform:rotate(-4deg);')}
      ${framed(images.proofA, 'left:58px;top:622px;width:300px;height:420px;')}
      ${framed(images.proofB, 'left:390px;top:622px;width:300px;height:420px;')}
      ${framed(images.proofC, 'left:722px;top:622px;width:300px;height:420px;')}
      ${framed(images.banner, 'left:58px;top:1096px;width:964px;height:492px;', 'cover')}
    </div>
  `
}

function slideThree(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#f1e6d9;">
      <div style="position:absolute;inset:0;background:radial-gradient(circle at 84% 16%, rgba(255,255,255,0.74), transparent 18%), linear-gradient(180deg, #faf4ed 0%, #eadccd 100%);"></div>
      ${safeShade(false)}
      ${topLabel(false)}
      ${lightCopyBox({
        left: 58,
        top: 132,
        width: 964,
        kicker: 'Offer',
        title: 'What you get.',
        body: 'Real portfolio-quality images, direction throughout the shoot, and a look that feels intentional.'
      })}
      ${statBullet('Guided posing and direction so first-timers feel comfortable.', 58, 426, 438)}
      ${statBullet('Edited photos you can use for your portfolio or social media.', 58, 574, 438)}
      ${statBullet('Help with overall vibe, styling, and location feel before we shoot.', 58, 742, 438)}
      ${framed(images.closeup, 'right:58px;top:420px;width:438px;height:694px;')}
      ${framed(images.softPortrait, 'right:58px;top:1162px;width:438px;height:426px;', 'cover')}
    </div>
  `
}

function slideFour(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#0f1721;">
      <img src="${images.processPhoto}" style="position:absolute;right:0;top:0;width:486px;height:100%;display:block;object-fit:cover;object-position:center;"/>
      <div style="position:absolute;inset:0;background:linear-gradient(90deg, rgba(7,12,18,0.98) 0%, rgba(7,12,18,0.94) 56%, rgba(7,12,18,0.3) 100%);"></div>
      ${safeShade(true)}
      ${topLabel(true)}
      <h2 style="position:absolute;left:58px;top:132px;width:558px;font-family:${DISPLAY};font-size:86px;font-weight:700;line-height:0.92;color:#fff;margin:0;">How the shoot works.</h2>
      <p style="position:absolute;left:58px;top:322px;width:520px;font-family:${SANS};font-size:31px;line-height:1.34;color:rgba(243,246,252,0.9);margin:0;">Simple process. No experience needed before you show up.</p>
      ${stepCard(1, 'Fill out the form.', 'It only takes a minute to send your details and preferred shoot vibe.', 58, 454, 550)}
      ${stepCard(2, 'We pick the plan.', 'I message you back and we choose the date, location, and look together.', 58, 748, 550)}
      ${stepCard(3, 'Show up and I guide you.', 'You do not need to know how to pose. I direct the session throughout.', 58, 1042, 550)}
    </div>
  `
}

function slideFive(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#0f1721;">
      <div style="position:absolute;inset:0;background:radial-gradient(circle at 84% 18%, rgba(39,70,111,0.34), transparent 18%), linear-gradient(180deg, #111b27 0%, #09111a 100%);"></div>
      ${safeShade(true)}
      ${topLabel(true)}
      ${framed(images.ctaMain, 'right:58px;top:130px;width:444px;height:760px;')}
      <div style="position:absolute;left:58px;top:132px;width:470px;padding:34px 34px 32px;border-radius:34px;background:rgba(6,10,15,0.9);border:1px solid rgba(255,255,255,0.12);box-shadow:0 30px 62px rgba(0,0,0,0.24);">
        <p style="font-family:${NARROW};font-size:19px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#d7a16f;margin:0 0 18px;">Call to action</p>
        <h2 style="font-family:${DISPLAY};font-size:84px;font-weight:700;line-height:0.9;color:#fff;margin:0 0 18px;">Want to sign up for the shoot?</h2>
        <p style="font-family:${SANS};font-size:32px;line-height:1.36;color:rgba(243,246,252,0.92);margin:0;">Use the Sign Up button on the ad to open the form. I will message you with the next step and shoot details.</p>
        <div style="margin-top:24px;padding:18px 22px;border-radius:20px;background:rgba(215,161,111,0.12);border:1px solid rgba(215,161,111,0.24);">
          <p style="font-family:${NARROW};font-size:20px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#f4c992;margin:0;">Experience not required</p>
        </div>
      </div>
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
