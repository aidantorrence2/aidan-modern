import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v3')

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

function getTopManilaImages(count = 8) {
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
    strategy: 'first sorted manila* image files from public/images/large',
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

function pill(text, light = false) {
  return `
    <div style="display:inline-flex;align-items:center;gap:10px;padding:12px 18px;border-radius:999px;border:1px solid ${light ? 'rgba(67,47,36,0.12)' : 'rgba(255,255,255,0.16)'};background:${light ? 'rgba(255,255,255,0.78)' : 'rgba(255,255,255,0.08)'};">
      <span style="width:9px;height:9px;border-radius:999px;background:${light ? '#a36f57' : '#f4c992'};display:block;"></span>
      <span style="font-family:${NARROW};font-size:18px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:${light ? '#2b1e17' : '#ffffff'};">${text}</span>
    </div>
  `
}

function safeShade() {
  return `
    <div style="position:absolute;left:0;right:0;bottom:0;height:${SAFE_BOTTOM}px;background:linear-gradient(180deg, rgba(10,12,15,0) 0%, rgba(10,12,15,0.12) 30%, rgba(10,12,15,0.42) 100%);"></div>
  `
}

function frameImage(src, style, fit = 'cover') {
  return `
    <div style="position:absolute;${style};padding:12px;background:white;border-radius:30px;box-shadow:0 24px 52px rgba(19,15,12,0.16);">
      <img src="${src}" style="width:100%;height:100%;display:block;border-radius:20px;object-fit:${fit};object-position:center;"/>
    </div>
  `
}

function darkPanel({ left, top, width, title, body, badgeText, accent }) {
  return `
    <div style="position:absolute;left:${left}px;top:${top}px;width:${width}px;padding:34px 34px 32px;border-radius:34px;background:rgba(10,14,20,0.82);border:1px solid rgba(255,255,255,0.12);box-shadow:0 24px 52px rgba(0,0,0,0.22);">
      ${pill(badgeText)}
      <h1 style="font-family:${DISPLAY};font-size:88px;font-weight:700;line-height:0.93;color:#ffffff;margin:22px 0 18px;">${title}</h1>
      <p style="font-family:${SANS};font-size:33px;line-height:1.32;color:rgba(240,244,252,0.9);margin:0;">${body}</p>
      ${accent ? `<p style="font-family:${NARROW};font-size:20px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#f4c992;margin:22px 0 0;">${accent}</p>` : ''}
    </div>
  `
}

function lightPanel({ left, top, width, title, body, badgeText }) {
  return `
    <div style="position:absolute;left:${left}px;top:${top}px;width:${width}px;padding:34px 34px 32px;border-radius:34px;background:rgba(255,251,247,0.9);border:1px solid rgba(67,47,36,0.1);box-shadow:0 24px 52px rgba(74,49,35,0.08);">
      ${pill(badgeText, true)}
      <h2 style="font-family:${DISPLAY};font-size:84px;font-weight:700;line-height:0.94;color:#2b1e17;margin:22px 0 18px;">${title}</h2>
      <p style="font-family:${SANS};font-size:32px;line-height:1.34;color:#5b4335;margin:0;">${body}</p>
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

function faqCard(question, answer, left, top) {
  return `
    <div style="position:absolute;left:${left}px;top:${top}px;width:456px;height:282px;padding:24px 24px 22px;border-radius:28px;background:rgba(255,251,247,0.92);border:1px solid rgba(67,47,36,0.08);box-shadow:0 16px 38px rgba(74,49,35,0.08);">
      <p style="font-family:${NARROW};font-size:17px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#a36f57;margin:0 0 14px;">${question}</p>
      <p style="font-family:${SANS};font-size:28px;line-height:1.38;color:#47342a;margin:0;">${answer}</p>
    </div>
  `
}

function slideOne(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#efe4d7;">
      <div style="position:absolute;inset:0;background:linear-gradient(180deg, #fbf7f1 0%, #efe1d3 100%);"></div>
      ${safeShade()}
      ${darkPanel({
        left: 56,
        top: 72,
        width: 440,
        title: 'Looking for models in Manila.',
        body: 'Editorial-style portrait shoots. Experience not required. If you want strong photos and guided direction, apply.',
        badgeText: 'Model Search',
        accent: 'Manila'
      })}
      ${frameImage(images[0], 'right:56px;top:82px;width:472px;height:670px;')}
      ${frameImage(images[1], 'left:88px;top:980px;width:904px;height:334px;', 'cover')}
    </div>
  `
}

function slideTwo(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#f2e5d7;">
      <div style="position:absolute;inset:0;background:linear-gradient(180deg, #fbf7f1 0%, #eddccc 100%);"></div>
      ${safeShade()}
      ${lightPanel({
        left: 56,
        top: 72,
        width: 968,
        title: 'What you get.',
        body: 'Real portfolio-quality images, direction throughout the shoot, and a look that feels intentional.'
      , badgeText: 'What You Get'})}
      ${bullet('Guided posing and direction so first-timers feel comfortable.', 56, 386, 450)}
      ${bullet('Edited photos you can use for your portfolio or social media.', 56, 532, 450)}
      ${bullet('Help with overall vibe, styling, and location feel before we shoot.', 56, 698, 450)}
      ${frameImage(images[2], 'right:56px;top:384px;width:432px;height:604px;')}
      ${frameImage(images[3], 'right:112px;top:1030px;width:320px;height:430px;transform:rotate(-3deg);')}
    </div>
  `
}

function slideThree(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#121820;">
      <img src="${images[4]}" style="position:absolute;right:0;top:0;width:450px;height:100%;display:block;object-fit:cover;object-position:center;"/>
      <div style="position:absolute;inset:0;background:linear-gradient(90deg, rgba(11,16,23,0.96) 0%, rgba(11,16,23,0.92) 58%, rgba(11,16,23,0.48) 100%);"></div>
      ${safeShade()}
      <div style="position:absolute;left:56px;top:72px;">
        ${pill('How The Shoot Works')}
      </div>
      <h2 style="position:absolute;left:56px;top:142px;width:560px;font-family:${DISPLAY};font-size:86px;font-weight:700;line-height:0.94;color:#ffffff;margin:0;">How the shoot works.</h2>
      <p style="position:absolute;left:56px;top:334px;width:520px;font-family:${SANS};font-size:31px;line-height:1.34;color:rgba(240,244,252,0.9);margin:0;">Simple process. No experience needed before you show up.</p>
      ${stepCard(1, 'Fill out the form.', 'Share your details, photos, and the kind of shoot you want.', 56, 470, 548)}
      ${stepCard(2, 'I reach out if it is a fit.', 'We align on date, location, and wardrobe direction.', 56, 770, 548)}
      ${stepCard(3, 'We shoot in Manila.', 'I direct the session so the final images feel strong and natural.', 56, 1070, 548)}
    </div>
  `
}

function slideFour(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#efe3d5;">
      <div style="position:absolute;inset:0;background:linear-gradient(180deg, #fbf7f1 0%, #eedecf 100%);"></div>
      ${safeShade()}
      ${frameImage(images[5], 'right:74px;top:88px;width:296px;height:448px;transform:rotate(4deg);')}
      ${frameImage(images[6], 'right:388px;top:132px;width:248px;height:372px;transform:rotate(-4deg);')}
      <div style="position:absolute;left:56px;top:72px;width:510px;">
        ${pill('FAQ', true)}
        <h2 style="font-family:${DISPLAY};font-size:86px;font-weight:700;line-height:0.94;color:#2b1e17;margin:22px 0 18px;">FAQ</h2>
        <p style="font-family:${SANS};font-size:31px;line-height:1.34;color:#5b4335;margin:0;">The main questions people usually have before applying.</p>
      </div>
      ${faqCard('Do I need experience?', 'No. First-timers are welcome and I direct posing throughout the session.', 56, 586)}
      ${faqCard('Where in Manila?', 'Usually BGC, Makati, Intramuros, or another spot that fits the concept.', 568, 586)}
      ${faqCard('What kind of shoot?', 'Editorial portrait, fashion, lifestyle, or something more cinematic and styled.', 56, 906)}
      ${faqCard('How long is it?', 'Usually around 60 to 90 minutes depending on the look and location.', 568, 906)}
    </div>
  `
}

function slideFive(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#121820;">
      <div style="position:absolute;inset:0;background:linear-gradient(180deg, #171e27 0%, #10151c 100%);"></div>
      ${safeShade()}
      ${frameImage(images[7], 'right:56px;top:90px;width:458px;height:720px;')}
      <div style="position:absolute;left:56px;top:92px;width:476px;padding:34px 34px 32px;border-radius:34px;background:rgba(10,14,20,0.86);border:1px solid rgba(255,255,255,0.12);box-shadow:0 24px 52px rgba(0,0,0,0.22);">
        ${pill('Sign Up')}
        <h2 style="font-family:${DISPLAY};font-size:82px;font-weight:700;line-height:0.94;color:#ffffff;margin:22px 0 18px;">Want to sign up for the shoot?</h2>
        <p style="font-family:${SANS};font-size:32px;line-height:1.36;color:rgba(240,244,252,0.9);margin:0;">Use the Sign Up button on the ad to open the form. I review submissions personally and follow up if it feels like a fit.</p>
        <p style="font-family:${NARROW};font-size:20px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#f4c992;margin:22px 0 0;">Experience not required</p>
      </div>
      ${frameImage(images[0], 'left:120px;top:980px;width:360px;height:500px;transform:rotate(-4deg);')}
    </div>
  `
}

async function render() {
  resetOutputDir()

  const selectedFiles = getTopManilaImages()
  writeSources(selectedFiles)
  const images = selectedFiles.map(readImage)

  const slides = [
    ['01_models_in_manila_story.png', slideOne(images)],
    ['02_what_you_get_story.png', slideTwo(images)],
    ['03_how_the_shoot_works_story.png', slideThree(images)],
    ['04_faq_story.png', slideFour(images)],
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
