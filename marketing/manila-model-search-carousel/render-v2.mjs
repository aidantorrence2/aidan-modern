import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v2')

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 430

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

function getTopLargeImages(count = 7) {
  return fs.readdirSync(IMAGE_DIR)
    .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file))
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
    strategy: 'first sorted image files from public/images/large',
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

function badge(text, light = false) {
  return `
    <div style="display:inline-flex;align-items:center;gap:10px;padding:12px 18px;border-radius:999px;border:1px solid ${light ? 'rgba(61,43,34,0.12)' : 'rgba(255,255,255,0.18)'};background:${light ? 'rgba(255,255,255,0.72)' : 'rgba(255,255,255,0.08)'};backdrop-filter:blur(10px);">
      <span style="width:9px;height:9px;border-radius:999px;background:${light ? '#a56f55' : '#f2c48d'};display:block;"></span>
      <span style="font-family:${NARROW};font-size:18px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:${light ? '#2c1f18' : '#ffffff'};">${text}</span>
    </div>
  `
}

function safeZoneHint() {
  return `
    <div style="position:absolute;left:0;right:0;bottom:0;height:${SAFE_BOTTOM}px;background:linear-gradient(180deg, rgba(7,11,17,0) 0%, rgba(7,11,17,0.2) 28%, rgba(7,11,17,0.72) 100%);"></div>
  `
}

function textCard({ left = 56, top = 76, width = 620, title, body, badgeText, dark = true, accent = '' }) {
  const bg = dark ? 'rgba(7,11,17,0.54)' : 'rgba(255,251,247,0.8)'
  const border = dark ? 'rgba(255,255,255,0.16)' : 'rgba(78,54,41,0.1)'
  const titleColor = dark ? '#ffffff' : '#271b15'
  const bodyColor = dark ? 'rgba(240,244,252,0.9)' : '#5d4638'

  return `
    <div style="position:absolute;left:${left}px;top:${top}px;width:${width}px;padding:34px 34px 32px;border-radius:34px;background:${bg};border:1px solid ${border};backdrop-filter:blur(14px);box-shadow:0 24px 54px rgba(0,0,0,0.16);">
      ${badge(badgeText, !dark)}
      <h1 style="font-family:${DISPLAY};font-size:92px;font-weight:700;line-height:0.93;color:${titleColor};margin:22px 0 20px;">${title}</h1>
      <p style="font-family:${SANS};font-size:34px;line-height:1.3;color:${bodyColor};margin:0;">${body}</p>
      ${accent ? `<p style="font-family:${NARROW};font-size:20px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:${dark ? 'rgba(242,196,141,0.88)' : '#a56f55'};margin:22px 0 0;">${accent}</p>` : ''}
    </div>
  `
}

function framedImage(src, style, options = {}) {
  const background = options.background || 'white'
  const pad = options.pad || 12
  const radius = options.radius || 28
  const shadow = options.shadow || '0 24px 54px rgba(0,0,0,0.22)'
  const fit = options.fit || 'cover'

  return `
    <div style="position:absolute;${style};padding:${pad}px;background:${background};border-radius:${radius}px;box-shadow:${shadow};">
      <img src="${src}" style="width:100%;height:100%;display:block;border-radius:${Math.max(12, radius - 10)}px;object-fit:${fit};object-position:center;"/>
    </div>
  `
}

function slideOne(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#0f1115;">
      <img src="${images[1]}" style="position:absolute;inset:0;width:100%;height:100%;display:block;object-fit:cover;object-position:center;filter:saturate(1.04) contrast(1.02);"/>
      <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(10,12,16,0.7) 0%, rgba(10,12,16,0.38) 36%, rgba(10,12,16,0.08) 60%, rgba(10,12,16,0.28) 100%);"></div>
      ${safeZoneHint()}
      ${textCard({
        title: 'Looking for models in Manila.',
        body: 'Editorial-style shoots. Experience not required. If you have strong style, good energy, or just want a guided shoot, apply.',
        badgeText: 'Model Search',
        dark: true,
        accent: 'Beginners welcome'
      })}
      ${framedImage(images[5], 'right:56px;top:120px;width:288px;height:416px;', { radius: 26 })}
      ${framedImage(images[0], 'right:88px;top:570px;width:230px;height:322px;transform:rotate(-5deg);', { radius: 24 })}
    </div>
  `
}

function slideTwo(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#ece0d3;">
      <div style="position:absolute;inset:0;background:linear-gradient(180deg, #fbf7f1 0%, #efdfcf 100%);"></div>
      <div style="position:absolute;inset:0;background:radial-gradient(circle at 18% 18%, rgba(255,255,255,0.65), transparent 18%), radial-gradient(circle at 82% 14%, rgba(244,198,154,0.28), transparent 18%);"></div>
      ${safeZoneHint()}

      <div style="position:absolute;left:56px;top:78px;right:56px;">
        ${badge('What You Get', true)}
        <h2 style="font-family:${DISPLAY};font-size:88px;font-weight:700;line-height:0.94;color:#271b15;margin:22px 0 16px;">What you get.</h2>
        <p style="font-family:${SANS};font-size:32px;line-height:1.34;color:#5d4638;margin:0;max-width:720px;">Guided direction, strong edited photos, and proof that the style is real.</p>
      </div>

      ${framedImage(images[2], 'left:56px;top:368px;width:464px;height:252px;', { radius: 24 })}
      ${framedImage(images[3], 'left:560px;top:368px;width:464px;height:252px;', { radius: 24 })}
      ${framedImage(images[0], 'left:56px;top:650px;width:300px;height:428px;transform:rotate(-2deg);', { radius: 26 })}
      ${framedImage(images[4], 'left:404px;top:632px;width:312px;height:448px;transform:rotate(2deg);', { radius: 26 })}
      ${framedImage(images[5], 'left:760px;top:662px;width:264px;height:380px;transform:rotate(-3deg);', { radius: 24 })}

      <div style="position:absolute;left:56px;right:56px;top:1110px;padding:28px 30px;border-radius:32px;background:rgba(255,255,255,0.78);border:1px solid rgba(78,54,41,0.1);box-shadow:0 18px 40px rgba(61,43,34,0.08);">
        <p style="font-family:${NARROW};font-size:18px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#a56f55;margin:0 0 14px;">Proof + value</p>
        <p style="font-family:${SANS};font-size:27px;line-height:1.42;color:#47342a;margin:0;">Recent work with a cinematic feel, guided posing throughout, and edited images you can actually post or use in your portfolio.</p>
      </div>
    </div>
  `
}

function step(number, title, body, top) {
  return `
    <div style="position:absolute;left:56px;right:56px;top:${top}px;padding:28px 28px 26px;border-radius:32px;background:rgba(7,11,17,0.54);border:1px solid rgba(255,255,255,0.14);backdrop-filter:blur(12px);box-shadow:0 20px 48px rgba(0,0,0,0.18);">
      <p style="font-family:${NARROW};font-size:18px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:rgba(242,196,141,0.9);margin:0 0 12px;">Step ${number}</p>
      <p style="font-family:${DISPLAY};font-size:46px;font-weight:700;line-height:1.02;color:#ffffff;margin:0 0 12px;">${title}</p>
      <p style="font-family:${SANS};font-size:29px;line-height:1.38;color:rgba(240,244,252,0.88);margin:0;">${body}</p>
    </div>
  `
}

function slideThree(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#0a1725;">
      <img src="${images[6]}" style="position:absolute;inset:0;width:100%;height:100%;display:block;object-fit:cover;object-position:center;"/>
      <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(8,17,27,0.82) 0%, rgba(8,17,27,0.62) 40%, rgba(8,17,27,0.18) 62%, rgba(8,17,27,0.48) 100%);"></div>
      ${safeZoneHint()}

      <div style="position:absolute;left:56px;top:78px;right:56px;">
        ${badge('How The Shoot Works')}
        <h2 style="font-family:${DISPLAY};font-size:88px;font-weight:700;line-height:0.94;color:#ffffff;margin:22px 0 16px;max-width:620px;">How the shoot works.</h2>
        <p style="font-family:${SANS};font-size:32px;line-height:1.34;color:rgba(240,244,252,0.88);margin:0;max-width:760px;">Simple process. You do not need experience before you show up.</p>
      </div>

      ${step(1, 'Fill out the form.', 'Share your name, photos, and the kind of shoot you want.', 420)}
      ${step(2, 'I reach out if it is a fit.', 'We align on location, styling, and timing in Manila.', 710)}
      ${step(3, 'We shoot and I guide you.', 'I direct posing, movement, and expressions so it feels easy.', 1000)}
    </div>
  `
}

function faqCard(question, answer, left, top) {
  return `
    <div style="position:absolute;left:${left}px;top:${top}px;width:460px;height:290px;padding:26px 26px 24px;border-radius:30px;background:rgba(255,255,255,0.8);border:1px solid rgba(78,54,41,0.1);box-shadow:0 18px 40px rgba(61,43,34,0.08);">
      <p style="font-family:${NARROW};font-size:17px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#a56f55;margin:0 0 14px;">${question}</p>
      <p style="font-family:${SANS};font-size:28px;line-height:1.4;color:#47342a;margin:0;">${answer}</p>
    </div>
  `
}

function slideFour(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#efe1d3;">
      <img src="${images[0]}" style="position:absolute;right:-120px;bottom:-40px;width:540px;height:760px;display:block;object-fit:cover;object-position:center;opacity:0.22;border-radius:42px;"/>
      <div style="position:absolute;inset:0;background:linear-gradient(180deg, #fbf7f1 0%, #efdfcf 100%);opacity:0.95;"></div>
      <div style="position:absolute;inset:0;background:radial-gradient(circle at 14% 14%, rgba(255,255,255,0.72), transparent 16%), radial-gradient(circle at 84% 22%, rgba(244,198,154,0.24), transparent 18%);"></div>
      ${safeZoneHint()}

      <div style="position:absolute;left:56px;top:78px;right:56px;">
        ${badge('FAQ', true)}
        <h2 style="font-family:${DISPLAY};font-size:88px;font-weight:700;line-height:0.94;color:#271b15;margin:22px 0 16px;">FAQ</h2>
        <p style="font-family:${SANS};font-size:32px;line-height:1.34;color:#5d4638;margin:0;max-width:760px;">The main things people usually want to know before applying.</p>
      </div>

      ${faqCard('Do I need experience?', 'No. First-timers are welcome and I direct posing the whole time.', 56, 408)}
      ${faqCard('Where in Manila?', 'Usually BGC, Makati, Intramuros, or a location that matches the concept.', 564, 408)}
      ${faqCard('What kind of shoot?', 'Editorial portrait, fashion, lifestyle, or something more cinematic and styled.', 56, 738)}
      ${faqCard('How long is it?', 'Usually around 60 to 90 minutes depending on the setup and location.', 564, 738)}
    </div>
  `
}

function slideFive(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#0e1219;">
      <img src="${images[4]}" style="position:absolute;inset:0;width:100%;height:100%;display:block;object-fit:cover;object-position:center;filter:saturate(1.03) contrast(1.02);"/>
      <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(10,12,16,0.78) 0%, rgba(10,12,16,0.48) 38%, rgba(10,12,16,0.12) 60%, rgba(10,12,16,0.46) 100%);"></div>
      ${safeZoneHint()}

      <div style="position:absolute;left:56px;top:78px;width:650px;padding:34px 34px 32px;border-radius:34px;background:rgba(7,11,17,0.54);border:1px solid rgba(255,255,255,0.16);backdrop-filter:blur(14px);box-shadow:0 24px 54px rgba(0,0,0,0.16);">
        ${badge('Sign Up')}
        <h2 style="font-family:${DISPLAY};font-size:88px;font-weight:700;line-height:0.94;color:#ffffff;margin:22px 0 18px;">Want to sign up for the shoot?</h2>
        <p style="font-family:${SANS};font-size:34px;line-height:1.34;color:rgba(240,244,252,0.9);margin:0;">Use the Sign Up button on this ad to open the form. I review submissions personally and reach out if it feels like a fit.</p>
        <p style="font-family:${NARROW};font-size:20px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:rgba(242,196,141,0.9);margin:24px 0 0;">No experience required</p>
      </div>
    </div>
  `
}

async function render() {
  resetOutputDir()

  const selectedFiles = getTopLargeImages()
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
    await page.screenshot({
      path: path.join(OUT_DIR, filename),
      type: 'png'
    })
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
