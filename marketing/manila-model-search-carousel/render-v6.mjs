import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v6')

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 410

const DISPLAY = "Baskerville, 'Iowan Old Style', Georgia, serif"
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

function safeShade() {
  return `
    <div style="position:absolute;left:0;right:0;bottom:0;height:${SAFE_BOTTOM}px;background:linear-gradient(180deg, rgba(10,12,15,0) 0%, rgba(10,12,15,0.05) 24%, rgba(10,12,15,0.24) 100%);"></div>
  `
}

function manilaLabel(light = false) {
  return `
    <div style="position:absolute;left:56px;top:58px;font-family:${NARROW};font-size:34px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:${light ? '#8f624b' : '#f2c790'};">
      Manila
    </div>
  `
}

function frameImage(src, style, fit = 'cover') {
  return `
    <div style="position:absolute;${style};padding:12px;background:white;border-radius:30px;box-shadow:0 24px 52px rgba(19,15,12,0.16);">
      <img src="${src}" style="width:100%;height:100%;display:block;border-radius:20px;object-fit:${fit};object-position:center;"/>
    </div>
  `
}

function darkPanel({ left, top, width, title, body, accent }) {
  return `
    <div style="position:absolute;left:${left}px;top:${top}px;width:${width}px;padding:34px 34px 32px;border-radius:34px;background:rgba(10,14,20,0.82);border:1px solid rgba(255,255,255,0.12);box-shadow:0 24px 52px rgba(0,0,0,0.22);">
      <h1 style="font-family:${DISPLAY};font-size:88px;font-weight:700;line-height:0.93;color:#ffffff;margin:0 0 18px;">${title}</h1>
      <p style="font-family:${SANS};font-size:33px;line-height:1.32;color:rgba(240,244,252,0.9);margin:0;">${body}</p>
      ${accent ? `<p style="font-family:${NARROW};font-size:20px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#f4c992;margin:22px 0 0;">${accent}</p>` : ''}
    </div>
  `
}

function lightPanel({ left, top, width, title, body }) {
  return `
    <div style="position:absolute;left:${left}px;top:${top}px;width:${width}px;padding:34px 34px 32px;border-radius:34px;background:rgba(255,251,247,0.92);border:1px solid rgba(67,47,36,0.1);box-shadow:0 24px 52px rgba(74,49,35,0.08);">
      <h2 style="font-family:${DISPLAY};font-size:80px;font-weight:700;line-height:0.94;color:#2b1e17;margin:0 0 18px;">${title}</h2>
      <p style="font-family:${SANS};font-size:31px;line-height:1.34;color:#5b4335;margin:0;">${body}</p>
    </div>
  `
}

function bullet(text, left, top, width) {
  return `
    <div style="position:absolute;left:${left}px;top:${top}px;width:${width}px;display:flex;gap:14px;align-items:flex-start;padding:22px 24px;border-radius:26px;background:rgba(255,251,247,0.92);border:1px solid rgba(67,47,36,0.08);box-shadow:0 14px 34px rgba(74,49,35,0.08);">
      <span style="width:12px;height:12px;border-radius:999px;background:#a36f57;display:block;flex-shrink:0;margin-top:12px;"></span>
      <p style="font-family:${SANS};font-size:28px;line-height:1.36;color:#47342a;margin:0;">${text}</p>
    </div>
  `
}

function stepCard(number, title, body, left, top, width) {
  return `
    <div style="position:absolute;left:${left}px;top:${top}px;width:${width}px;padding:26px 26px 24px;border-radius:28px;background:rgba(10,14,20,0.82);border:1px solid rgba(255,255,255,0.12);box-shadow:0 22px 44px rgba(0,0,0,0.18);">
      <p style="font-family:${NARROW};font-size:18px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#f4c992;margin:0 0 12px;">Step ${number}</p>
      <p style="font-family:${DISPLAY};font-size:42px;font-weight:700;line-height:1.02;color:#ffffff;margin:0 0 12px;">${title}</p>
      <p style="font-family:${SANS};font-size:27px;line-height:1.38;color:rgba(240,244,252,0.88);margin:0;">${body}</p>
    </div>
  `
}

function slideOne(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#efe4d7;">
      <div style="position:absolute;inset:0;background:linear-gradient(180deg, #fbf7f1 0%, #efe1d3 100%);"></div>
      ${safeShade()}
      ${manilaLabel(false)}
      ${darkPanel({
        left: 56,
        top: 128,
        width: 440,
        title: 'Looking for models in Manila.',
        body: 'Editorial-style portrait shoots. Experience not required. If you want strong photos and guided direction, apply.',
        accent: 'Models wanted'
      })}
      ${frameImage(images.hero, 'right:56px;top:118px;width:472px;height:1422px;')}
    </div>
  `
}

function slideTwo(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#efe3d5;">
      <div style="position:absolute;inset:0;background:linear-gradient(180deg, #fbf7f1 0%, #eedecf 100%);"></div>
      ${safeShade()}
      ${manilaLabel(true)}
      <div style="position:absolute;left:56px;top:128px;width:430px;">
        <h2 style="font-family:${DISPLAY};font-size:68px;font-weight:700;line-height:0.95;color:#2b1e17;margin:0 0 18px;">Portfolio images.</h2>
        <p style="font-family:${SANS};font-size:30px;line-height:1.34;color:#5b4335;margin:0;">A few examples from my portfolio so you can see the style, range, and quality.</p>
      </div>
      ${frameImage(images.keepOne, 'right:74px;top:108px;width:296px;height:448px;transform:rotate(4deg);')}
      ${frameImage(images.keepTwo, 'right:388px;top:152px;width:248px;height:372px;transform:rotate(-4deg);')}
      ${frameImage(images.proofA, 'left:56px;top:560px;width:310px;height:470px;')}
      ${frameImage(images.proofB, 'left:392px;top:560px;width:310px;height:470px;')}
      ${frameImage(images.proofC, 'left:728px;top:560px;width:296px;height:470px;')}
      ${frameImage(images.banner, 'left:56px;top:1100px;width:968px;height:440px;', 'cover')}
    </div>
  `
}

function slideThree(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#f2e5d7;">
      <div style="position:absolute;inset:0;background:linear-gradient(180deg, #fbf7f1 0%, #eddccc 100%);"></div>
      ${safeShade()}
      ${manilaLabel(true)}
      ${lightPanel({
        left: 56,
        top: 128,
        width: 968,
        title: 'What you get.',
        body: 'Real portfolio-quality images, direction throughout the shoot, and a look that feels intentional.'
      })}
      ${bullet('Guided posing and direction so first-timers feel comfortable.', 56, 432, 450)}
      ${bullet('Edited photos you can use for your portfolio or social media.', 56, 578, 450)}
      ${bullet('Help with overall vibe, styling, and location feel before we shoot.', 56, 744, 450)}
      ${frameImage(images.closeup, 'right:56px;top:430px;width:432px;height:660px;')}
      ${frameImage(images.softPortrait, 'right:56px;top:1136px;width:432px;height:374px;', 'cover')}
    </div>
  `
}

function slideFour(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#121820;">
      <img src="${images.processPhoto}" style="position:absolute;right:0;top:0;width:470px;height:100%;display:block;object-fit:cover;object-position:center;"/>
      <div style="position:absolute;inset:0;background:linear-gradient(90deg, rgba(11,16,23,0.96) 0%, rgba(11,16,23,0.92) 58%, rgba(11,16,23,0.34) 100%);"></div>
      ${safeShade()}
      ${manilaLabel(false)}
      <h2 style="position:absolute;left:56px;top:128px;width:560px;font-family:${DISPLAY};font-size:86px;font-weight:700;line-height:0.94;color:#ffffff;margin:0;">How the shoot works.</h2>
      <p style="position:absolute;left:56px;top:320px;width:520px;font-family:${SANS};font-size:31px;line-height:1.34;color:rgba(240,244,252,0.9);margin:0;">Simple process. No experience needed before you show up.</p>
      ${stepCard(1, 'Fill out the form.', 'It only takes a minute to send your details and preferred shoot vibe.', 56, 456, 548)}
      ${stepCard(2, 'We pick the plan.', 'I message you back and we choose the date, location, and look together.', 56, 756, 548)}
      ${stepCard(3, 'Show up and I guide you.', 'You do not need to know how to pose. I direct the session throughout.', 56, 1056, 548)}
    </div>
  `
}

function slideFive(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#121820;">
      <div style="position:absolute;inset:0;background:linear-gradient(180deg, #171e27 0%, #10151c 100%);"></div>
      ${safeShade()}
      ${manilaLabel(false)}
      ${frameImage(images.ctaMain, 'right:56px;top:118px;width:458px;height:720px;')}
      <div style="position:absolute;left:56px;top:128px;width:476px;padding:34px 34px 32px;border-radius:34px;background:rgba(10,14,20,0.86);border:1px solid rgba(255,255,255,0.12);box-shadow:0 24px 52px rgba(0,0,0,0.22);">
        <h2 style="font-family:${DISPLAY};font-size:82px;font-weight:700;line-height:0.94;color:#ffffff;margin:0 0 18px;">Want to sign up for the shoot?</h2>
        <p style="font-family:${SANS};font-size:32px;line-height:1.36;color:rgba(240,244,252,0.9);margin:0;">Use the Sign Up button on the ad to open the form. I will message you with the next step and shoot details.</p>
        <p style="font-family:${NARROW};font-size:20px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#f4c992;margin:22px 0 0;">Experience not required</p>
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
