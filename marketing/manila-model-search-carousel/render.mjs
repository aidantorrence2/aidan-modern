import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const OUT_DIR = path.join(__dirname, 'output')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const LIVE_HOME = 'https://aidantorrence.com'
const WIDTH = 1080
const HEIGHT = 1350

const DISPLAY = "Baskerville, 'Iowan Old Style', Georgia, serif"
const SANS = "'Avenir Next', 'Helvetica Neue', Arial, sans-serif"
const CONDENSED = "Futura, 'Arial Narrow', sans-serif"

const manilaFiles = {
  hero: 'manila-gallery-market-001.jpg',
  support: 'manila-gallery-graffiti-001.jpg',
  detail: 'manila-gallery-dsc-0190.jpg',
  cta: 'manila-gallery-night-003.jpg'
}

const fallbackProofFiles = [
  'merasa-jewelry-11.jpg',
  '000008-7.jpg',
  '000048750031.jpg',
  'r1-05454-0002.jpg'
]

fs.mkdirSync(OUT_DIR, { recursive: true })

function mimeType(filename) {
  const ext = path.extname(filename).toLowerCase()

  if (ext === '.png') return 'image/png'
  if (ext === '.webp') return 'image/webp'
  return 'image/jpeg'
}

function localImagePath(filename) {
  return path.join(IMAGE_DIR, filename)
}

function readLocalImage(filename) {
  const filePath = localImagePath(filename)
  const buf = fs.readFileSync(filePath)
  return `data:${mimeType(filename)};base64,${buf.toString('base64')}`
}

function lightTheme() {
  return {
    bg: '#f4eee6',
    bgTop: '#fbf7f1',
    bgBottom: '#eed8c4',
    text: '#251914',
    textSoft: '#5b4335',
    meta: '#8f6c58',
    panel: 'rgba(255,255,255,0.82)',
    panelBorder: 'rgba(74,49,35,0.09)'
  }
}

function darkTheme() {
  return {
    bg: '#081727',
    bgTop: '#102943',
    bgBottom: '#081727',
    text: '#ffffff',
    textSoft: 'rgba(242,246,255,0.88)',
    meta: 'rgba(201,224,255,0.76)',
    panel: 'rgba(7,12,20,0.54)',
    panelBorder: 'rgba(191,222,255,0.16)'
  }
}

function frame(theme, content) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${theme.bg};">
      <div style="position:absolute;inset:0;background:linear-gradient(180deg, ${theme.bgTop} 0%, ${theme.bgBottom} 100%);"></div>
      <div style="position:absolute;inset:0;background:
        radial-gradient(circle at 10% 14%, rgba(255,255,255,0.65), transparent 18%),
        radial-gradient(circle at 88% 18%, rgba(255,215,176,0.18), transparent 22%),
        radial-gradient(circle at 84% 86%, rgba(131,182,255,0.14), transparent 20%);"></div>
      <div style="position:absolute;inset:0;opacity:0.08;mix-blend-mode:soft-light;background-image:
        radial-gradient(circle at 20% 24%, rgba(255,255,255,0.55), transparent 15%),
        radial-gradient(circle at 72% 66%, rgba(255,255,255,0.42), transparent 14%),
        repeating-linear-gradient(0deg, rgba(255,255,255,0.09) 0 1px, transparent 1px 4px),
        repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 5px);"></div>
      ${content}
    </div>
  `
}

function pill(label, theme, invert = false) {
  const fg = invert ? theme.text : '#ffffff'
  const bg = invert ? 'rgba(255,255,255,0.68)' : 'rgba(255,255,255,0.08)'
  const border = invert ? 'rgba(37,25,20,0.12)' : 'rgba(255,255,255,0.18)'
  const dot = invert ? theme.meta : '#f8c89b'
  return `
    <div style="display:inline-flex;align-items:center;gap:10px;padding:11px 18px;border-radius:999px;background:${bg};border:1px solid ${border};backdrop-filter:blur(8px);">
      <span style="width:10px;height:10px;border-radius:999px;background:${dot};display:block;"></span>
      <span style="font-family:${CONDENSED};font-size:17px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${fg};">${label}</span>
    </div>
  `
}

function proofMosaic(images) {
  const slots = [
    { left: 0, top: 0, width: 252, height: 334, rotate: -3.4 },
    { left: 274, top: 18, width: 252, height: 334, rotate: 2.6 },
    { left: 18, top: 356, width: 222, height: 292, rotate: 2.4 },
    { left: 254, top: 370, width: 256, height: 320, rotate: -2.2 }
  ]

  return images.slice(0, 4).map((image, index) => {
    const slot = slots[index]

    return `
      <div style="position:absolute;left:${slot.left}px;top:${slot.top}px;width:${slot.width}px;height:${slot.height}px;padding:10px;background:white;border-radius:22px;transform:rotate(${slot.rotate}deg);box-shadow:0 24px 44px rgba(14,16,18,0.22);">
        <img src="${image.dataUrl}" style="width:100%;height:100%;display:block;border-radius:14px;object-fit:cover;object-position:center;"/>
      </div>
    `
  }).join('')
}

function faqCard(question, answer, left, top, width, height) {
  return `
    <div style="position:absolute;left:${left}px;top:${top}px;width:${width}px;height:${height}px;padding:28px 28px 24px;border-radius:28px;background:rgba(255,255,255,0.76);border:1px solid rgba(74,49,35,0.1);box-shadow:0 16px 36px rgba(39,26,18,0.08);">
      <p style="font-family:${CONDENSED};font-size:17px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#8f6c58;margin:0 0 14px;">${question}</p>
      <p style="font-family:${SANS};font-size:28px;line-height:1.34;color:#3f2d24;margin:0;">${answer}</p>
    </div>
  `
}

function valueItem(text) {
  return `
    <div style="display:flex;gap:14px;align-items:flex-start;padding:18px 20px;border-radius:22px;background:rgba(255,255,255,0.86);border:1px solid rgba(74,49,35,0.08);box-shadow:0 12px 28px rgba(39,26,18,0.06);">
      <span style="width:12px;height:12px;border-radius:999px;background:#a56f55;display:block;flex-shrink:0;margin-top:11px;"></span>
      <p style="font-family:${SANS};font-size:27px;line-height:1.32;color:#3d2a20;margin:0;">${text}</p>
    </div>
  `
}

function stepCard(number, title, body) {
  return `
    <div style="padding:24px 26px;border-radius:28px;background:rgba(6,11,18,0.52);border:1px solid rgba(191,222,255,0.15);box-shadow:0 18px 36px rgba(0,0,0,0.24);">
      <p style="font-family:${CONDENSED};font-size:17px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:rgba(214,232,255,0.72);margin:0 0 14px;">Step ${number}</p>
      <p style="font-family:${DISPLAY};font-size:36px;font-weight:700;line-height:1.05;color:white;margin:0 0 12px;">${title}</p>
      <p style="font-family:${SANS};font-size:24px;line-height:1.36;color:rgba(242,246,255,0.86);margin:0;">${body}</p>
    </div>
  `
}

async function fetchPortfolioImageList() {
  const response = await fetch(LIVE_HOME)

  if (!response.ok) {
    throw new Error(`Homepage scrape failed with status ${response.status}`)
  }

  const html = await response.text()
  const matches = html.matchAll(/alt="[^"]+ photo by Aidan Torrence" src="\/images\/thumbs\/([^"]+)"/g)
  const unique = []

  for (const match of matches) {
    const filename = match[1]
    if (!unique.includes(filename)) {
      unique.push(filename)
    }
  }

  if (unique.length === 0) {
    throw new Error('Homepage scrape returned no portfolio thumbnails')
  }

  return unique
}

async function loadDataUrlFromFilename(filename) {
  const localPath = localImagePath(filename)

  if (fs.existsSync(localPath)) {
    return {
      filename,
      dataUrl: readLocalImage(filename),
      sourceUrl: `${LIVE_HOME}/images/large/${filename}`,
      source: 'local-cache'
    }
  }

  const remote = await fetch(`${LIVE_HOME}/images/large/${filename}`)

  if (!remote.ok) {
    throw new Error(`Unable to load remote image ${filename}`)
  }

  const buf = Buffer.from(await remote.arrayBuffer())
  return {
    filename,
    dataUrl: `data:${mimeType(filename)};base64,${buf.toString('base64')}`,
    sourceUrl: `${LIVE_HOME}/images/large/${filename}`,
    source: 'live-download'
  }
}

async function resolveProofImages(limit = 4) {
  const attempted = []

  try {
    const filenames = await fetchPortfolioImageList()
    const selected = []

    for (const filename of filenames) {
      attempted.push(filename)

      try {
        selected.push(await loadDataUrlFromFilename(filename))
      } catch (error) {
        console.warn(`Skipping ${filename}: ${error.message}`)
      }

      if (selected.length === limit) {
        return {
          mode: 'scraped-homepage',
          images: selected,
          attempted
        }
      }
    }
  } catch (error) {
    console.warn(`Falling back to local proof images: ${error.message}`)
  }

  const fallbackImages = fallbackProofFiles.slice(0, limit).map(filename => ({
    filename,
    dataUrl: readLocalImage(filename),
    sourceUrl: `${LIVE_HOME}/images/large/${filename}`,
    source: 'local-fallback'
  }))

  return {
    mode: 'fallback',
    images: fallbackImages,
    attempted
  }
}

function slideOne(images) {
  const theme = lightTheme()

  return frame(theme, `
    <div style="position:absolute;left:62px;top:56px;">
      ${pill('Model Search', theme, true)}
    </div>

    <div style="position:absolute;left:64px;top:140px;width:420px;">
      <p style="font-family:${CONDENSED};font-size:17px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:${theme.meta};margin:0 0 18px;">Manila</p>
      <h1 style="font-family:${DISPLAY};font-size:92px;font-weight:700;line-height:0.93;color:${theme.text};margin:0;">
        Looking for models in Manila.
      </h1>
      <p style="font-family:${SANS};font-size:33px;line-height:1.28;color:${theme.textSoft};margin:24px 0 0;">
        Editorial-style portrait shoots. Experience not required.
      </p>

      <div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:28px;">
        <div style="padding:12px 16px;border-radius:999px;background:${theme.panel};border:1px solid ${theme.panelBorder};font-family:${SANS};font-size:18px;font-weight:700;color:${theme.textSoft};">Beginners welcome</div>
        <div style="padding:12px 16px;border-radius:999px;background:${theme.panel};border:1px solid ${theme.panelBorder};font-family:${SANS};font-size:18px;font-weight:700;color:${theme.textSoft};">Portrait / fashion / lifestyle</div>
      </div>

      <p style="font-family:${SANS};font-size:24px;line-height:1.45;color:${theme.textSoft};margin:34px 0 0;max-width:360px;">
        If you have strong style, good energy, or just want a guided shoot that feels intentional, apply.
      </p>
    </div>

    <div style="position:absolute;right:58px;top:82px;width:472px;height:1140px;">
      <div style="position:absolute;right:0;top:0;width:416px;height:900px;padding:14px;background:white;border-radius:34px;box-shadow:0 34px 70px rgba(34,21,16,0.18);">
        <img src="${images.hero}" style="width:100%;height:100%;display:block;border-radius:22px;object-fit:cover;object-position:center;"/>
      </div>
      <div style="position:absolute;left:0;bottom:92px;width:236px;height:312px;padding:10px;background:white;border-radius:24px;transform:rotate(-5deg);box-shadow:0 24px 44px rgba(34,21,16,0.14);">
        <img src="${images.support}" style="width:100%;height:100%;display:block;border-radius:16px;object-fit:cover;object-position:center;"/>
      </div>
    </div>

    <div style="position:absolute;left:64px;bottom:56px;">
      <p style="font-family:${CONDENSED};font-size:16px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:rgba(143,108,88,0.78);margin:0;">Aidan Torrence Photography</p>
    </div>
  `)
}

function slideTwo(proof) {
  const theme = lightTheme()

  return frame(theme, `
    <div style="position:absolute;left:62px;top:56px;">
      ${pill('What You Get', theme, true)}
    </div>

    <div style="position:absolute;left:64px;top:148px;width:430px;">
      <h2 style="font-family:${DISPLAY};font-size:84px;font-weight:700;line-height:0.95;color:${theme.text};margin:0 0 20px;">
        What you get.
      </h2>
      <p style="font-family:${SANS};font-size:28px;line-height:1.36;color:${theme.textSoft};margin:0 0 28px;">
        A guided shoot plus polished images you can actually use for your portfolio and socials.
      </p>

      <div style="display:grid;gap:14px;">
        ${valueItem('Guided portrait session with posing help throughout')}
        ${valueItem('Edited photos with an intentional, editorial feel')}
        ${valueItem('Direction on location, outfits, and overall vibe')}
        ${valueItem('Real portfolio quality, not test-shoot guesswork')}
      </div>
    </div>

    <div style="position:absolute;right:58px;top:190px;width:528px;height:710px;">
      ${proofMosaic(proof)}
    </div>

    <div style="position:absolute;right:64px;bottom:80px;width:470px;padding:22px 24px;border-radius:26px;background:rgba(255,255,255,0.76);border:1px solid rgba(74,49,35,0.1);box-shadow:0 16px 36px rgba(39,26,18,0.08);">
      <p style="font-family:${CONDENSED};font-size:17px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#8f6c58;margin:0 0 10px;">Proof</p>
      <p style="font-family:${SANS};font-size:24px;line-height:1.4;color:#4a362c;margin:0;">
        Real portfolio images pulled from <span style="font-weight:700;">aidantorrence.com</span>.
      </p>
    </div>
  `)
}

function slideThree(images) {
  const theme = darkTheme()

  return frame(theme, `
    <img src="${images.detail}" style="position:absolute;right:-70px;bottom:-80px;width:500px;height:760px;display:block;object-fit:cover;object-position:center;opacity:0.28;border-radius:36px;"/>
    <div style="position:absolute;inset:0;background:linear-gradient(90deg, rgba(8,23,39,0.96) 0%, rgba(8,23,39,0.76) 64%, rgba(8,23,39,0.38) 100%);"></div>

    <div style="position:absolute;left:62px;top:56px;">
      ${pill('How The Shoot Works', theme)}
    </div>

    <div style="position:absolute;left:64px;top:146px;width:948px;">
      <h2 style="font-family:${DISPLAY};font-size:84px;font-weight:700;line-height:0.95;color:${theme.text};margin:0 0 18px;max-width:500px;">
        How the shoot works.
      </h2>
      <p style="font-family:${SANS};font-size:29px;line-height:1.38;color:${theme.textSoft};margin:0 0 34px;max-width:520px;">
        The process is simple. You do not need to know how to pose before you arrive.
      </p>

      <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:18px;max-width:880px;">
        ${stepCard(1, 'Fill out the form.', 'Share your basic info, photos, and the type of shoot vibe you want.')}
        ${stepCard(2, 'I reach out if it is a fit.', 'We pick a date, location, and wardrobe direction that matches the concept.')}
        ${stepCard(3, 'We shoot in Manila.', 'I direct the session so it feels easy and you leave with strong images.')}
      </div>
    </div>

    <div style="position:absolute;left:64px;bottom:58px;padding:16px 18px;border-radius:22px;background:rgba(255,255,255,0.08);border:1px solid rgba(191,222,255,0.15);">
      <p style="font-family:${SANS};font-size:22px;line-height:1.38;color:${theme.textSoft};margin:0;">
        Beginner-friendly from start to finish.
      </p>
    </div>
  `)
}

function slideFour() {
  const theme = lightTheme()

  return frame(theme, `
    <div style="position:absolute;left:62px;top:56px;">
      ${pill('FAQ', theme, true)}
    </div>

    <div style="position:absolute;left:64px;top:142px;right:64px;">
      <h2 style="font-family:${DISPLAY};font-size:84px;font-weight:700;line-height:0.95;color:${theme.text};margin:0 0 22px;">
        FAQ
      </h2>
      <p style="font-family:${SANS};font-size:29px;line-height:1.36;color:${theme.textSoft};margin:0;">
        The main questions people usually have before applying.
      </p>
    </div>

    ${faqCard('Do I need experience?', 'No. First-timers are welcome and I direct posing, movement, and expression.', 64, 336, 456, 296)}
    ${faqCard('Where in Manila?', 'Usually BGC, Makati, Intramuros, or another location that matches the concept.', 560, 336, 456, 296)}
    ${faqCard('What kind of look?', 'Editorial portrait, fashion, lifestyle, or something a little more cinematic and styled.', 64, 668, 456, 314)}
    ${faqCard('How long is the shoot?', 'Usually around 60 to 90 minutes, depending on the concept and location.', 560, 668, 456, 314)}
  `)
}

function slideFive(images) {
  const theme = darkTheme()

  return frame(theme, `
    <img src="${images.cta}" style="position:absolute;inset:0;width:100%;height:100%;display:block;object-fit:cover;object-position:center;opacity:0.42;filter:saturate(1.06);"/>
    <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(8,23,39,0.52) 0%, rgba(8,23,39,0.64) 28%, rgba(8,23,39,0.94) 100%);"></div>

    <div style="position:absolute;left:62px;top:56px;">
      ${pill('Sign Up', theme)}
    </div>

    <div style="position:absolute;left:64px;right:64px;bottom:82px;padding:36px 38px 40px;border-radius:34px;background:rgba(6,11,18,0.5);border:1px solid rgba(191,222,255,0.16);backdrop-filter:blur(10px);box-shadow:0 26px 54px rgba(0,0,0,0.28);">
      <p style="font-family:${CONDENSED};font-size:17px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:${theme.meta};margin:0 0 18px;">Short application</p>
      <h2 style="font-family:${DISPLAY};font-size:82px;font-weight:700;line-height:0.94;color:${theme.text};margin:0 0 18px;max-width:760px;">
        Want to sign up for the shoot?
      </h2>
      <p style="font-family:${SANS};font-size:30px;line-height:1.38;color:${theme.textSoft};margin:0 0 30px;max-width:780px;">
        Tap sign up and fill out the short form. There will be a Google Form or signup link attached to this carousel ad.
      </p>

      <div style="display:inline-flex;align-items:center;justify-content:center;padding:18px 28px;border-radius:999px;background:white;box-shadow:0 18px 36px rgba(0,0,0,0.22);">
        <span style="font-family:${CONDENSED};font-size:21px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#081727;">Sign Up For The Shoot</span>
      </div>

      <p style="font-family:${SANS};font-size:22px;line-height:1.4;color:rgba(242,246,255,0.76);margin:22px 0 0;">
        Limited spots. I review submissions personally.
      </p>
    </div>
  `)
}

async function writeProofManifest(proof) {
  const manifest = {
    scrapedAt: new Date().toISOString(),
    sourcePage: LIVE_HOME,
    mode: proof.mode,
    attempted: proof.attempted,
    images: proof.images.map(image => ({
      filename: image.filename,
      sourceUrl: image.sourceUrl,
      source: image.source
    }))
  }

  fs.writeFileSync(
    path.join(OUT_DIR, 'proof-sources.json'),
    JSON.stringify(manifest, null, 2)
  )
}

async function renderSlides() {
  const proof = await resolveProofImages()
  await writeProofManifest(proof)

  const staticImages = {
    hero: readLocalImage(manilaFiles.hero),
    support: readLocalImage(manilaFiles.support),
    detail: readLocalImage(manilaFiles.detail),
    cta: readLocalImage(manilaFiles.cta)
  }

  const slides = [
    { name: '01_models_in_manila', html: slideOne(staticImages) },
    { name: '02_what_you_get', html: slideTwo(proof.images) },
    { name: '03_how_the_shoot_works', html: slideThree(staticImages) },
    { name: '04_faq', html: slideFour() },
    { name: '05_sign_up', html: slideFive(staticImages) }
  ]

  const browser = await chromium.launch()
  const context = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1
  })

  for (const slide of slides) {
    const page = await context.newPage()
    await page.setContent(
      `<!DOCTYPE html><html><head><style>*{box-sizing:border-box;}html,body{margin:0;padding:0;background:#000;}</style></head><body>${slide.html}</body></html>`,
      { waitUntil: 'load' }
    )
    await page.waitForTimeout(250)
    await page.screenshot({
      path: path.join(OUT_DIR, `${slide.name}.png`),
      type: 'png'
    })
    await page.close()
    console.log(`Rendered ${slide.name}.png`)
  }

  await browser.close()
  console.log(`Done: ${slides.length} slides written to ${OUT_DIR}`)
}

renderSlides().catch(error => {
  console.error(error)
  process.exit(1)
})
