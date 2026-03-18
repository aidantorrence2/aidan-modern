import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, 'output')
const IMG_DIR = '/Users/aidantorrence/Documents/aidan-modern/public/images/large'

fs.mkdirSync(OUT, { recursive: true })

function img(filename) {
  const buf = fs.readFileSync(path.join(IMG_DIR, filename))
  return `data:image/jpeg;base64,${buf.toString('base64')}`
}

// Load all portfolio photos
const photos = [
  img('manila-gallery-dsc-0075.jpg'),
  img('manila-gallery-dsc-0130.jpg'),
  img('manila-gallery-dsc-0911.jpg'),
  img('manila-gallery-dsc-0190.jpg'),
  img('manila-gallery-night-003.jpg'),
  img('manila-gallery-market-001.jpg'),
  img('manila-gallery-urban-003.jpg'),
  img('manila-gallery-garden-002.jpg'),
  img('manila-gallery-canal-001.jpg'),
  img('manila-gallery-canal-002.jpg'),
  img('manila-gallery-ivy-002.jpg'),
  img('manila-gallery-park-001.jpg'),
  img('manila-gallery-statue-001.jpg'),
  img('manila-gallery-street-001.jpg'),
  img('manila-gallery-night-001.jpg'),
  img('manila-gallery-ivy-001.jpg'),
  img('manila-gallery-garden-001.jpg'),
  img('manila-gallery-closeup-001.jpg'),
  img('manila-gallery-shadow-001.jpg'),
  img('manila-gallery-rocks-001.jpg'),
  img('manila-gallery-floor-001.jpg'),
  img('manila-gallery-tropical-001.jpg'),
]

const SERIF = "Georgia, 'Times New Roman', serif"
const SANS = "Inter, -apple-system, system-ui, sans-serif"

const cities = ['Manila', 'Antipolo', 'Subic']

// CTA copy variations — tested conversion-focused messaging
const ctas = [
  'DM me to book',
  'Message me on IG',
  'DM @madebyaidan',
  'Send me a message',
  'Tap to message me',
  'DM me — it\'s free',
  'Just message me',
  'DM for details',
  'Message me today',
  'DM to get started',
]

// 10 layout variants per city — each one is a different visual approach
// but ALL share the hierarchy: CITY (biggest) > FREE PHOTO SHOOT > CTA > photo

function citySize(base, city) {
  // Scale down for longer names so text never overflows
  if (city.length <= 5) return base          // SUBIC
  if (city.length <= 6) return Math.round(base * 0.9)  // MANILA
  return Math.round(base * 0.65)             // ANTIPOLO
}

function makeSlide(city, photoSrc, ctaText, variant) {
  const cityUpper = city.toUpperCase()

  // Gradient and text position variations
  switch (variant) {
    case 0: // Classic bottom stack — heavy gradient, centered text
      return `
        <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
          <img src="${photoSrc}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(1.1) contrast(1.05);"/>
          <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.1) 30%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.95) 100%);"></div>
          <div style="position:absolute;bottom:380px;left:60px;right:60px;">
            <div style="font-family:${SERIF};font-size:${citySize(220, city)}px;font-weight:900;font-style:italic;color:white;line-height:0.85;text-shadow:0 4px 8px rgba(0,0,0,0.9),0 0 60px rgba(0,0,0,0.5);">${cityUpper}</div>
            <div style="font-family:${SANS};font-size:64px;font-weight:800;color:white;margin-top:24px;letter-spacing:2px;text-shadow:0 2px 6px rgba(0,0,0,0.8);">FREE PHOTO SHOOT</div>
            <div style="font-family:${SANS};font-size:36px;font-weight:500;color:rgba(255,255,255,0.7);margin-top:28px;text-shadow:0 2px 4px rgba(0,0,0,0.8);">${ctaText}</div>
          </div>
        </div>`

    case 1: // Top-heavy — city name at top, photo dominates
      return `
        <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
          <img src="${photoSrc}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(1.1) contrast(1.05);"/>
          <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.5) 25%, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0.4) 80%, rgba(0,0,0,0.9) 100%);"></div>
          <div style="position:absolute;top:160px;left:60px;right:60px;">
            <div style="font-family:${SERIF};font-size:${citySize(200, city)}px;font-weight:900;font-style:italic;color:white;line-height:0.85;text-shadow:0 4px 8px rgba(0,0,0,0.9);">${cityUpper}</div>
            <div style="font-family:${SANS};font-size:58px;font-weight:800;color:white;margin-top:20px;letter-spacing:2px;text-shadow:0 2px 6px rgba(0,0,0,0.8);">FREE PHOTO SHOOT</div>
          </div>
          <div style="position:absolute;bottom:420px;left:60px;right:60px;">
            <div style="font-family:${SANS};font-size:40px;font-weight:600;color:rgba(255,255,255,0.8);text-shadow:0 2px 6px rgba(0,0,0,0.9);">${ctaText}</div>
          </div>
        </div>`

    case 2: // Center punch — everything centered vertically with strong vignette
      return `
        <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
          <img src="${photoSrc}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(1.05) brightness(0.7);"/>
          <div style="position:absolute;inset:0;background:radial-gradient(ellipse at center, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.85) 100%);"></div>
          <div style="position:absolute;top:50%;left:60px;right:60px;transform:translateY(-50%);text-align:center;">
            <div style="font-family:${SANS};font-size:52px;font-weight:700;color:rgba(255,255,255,0.7);letter-spacing:8px;text-transform:uppercase;text-shadow:0 2px 4px rgba(0,0,0,0.8);">FREE PHOTO SHOOT</div>
            <div style="font-family:${SERIF};font-size:${citySize(240, city)}px;font-weight:900;font-style:italic;color:white;line-height:0.82;margin-top:16px;text-shadow:0 6px 12px rgba(0,0,0,0.9),0 0 80px rgba(0,0,0,0.4);">${cityUpper}</div>
            <div style="font-family:${SANS};font-size:38px;font-weight:500;color:rgba(255,255,255,0.65);margin-top:40px;text-shadow:0 2px 4px rgba(0,0,0,0.8);">${ctaText}</div>
          </div>
        </div>`

    case 3: // Split diagonal — warm overlay with city name bleeding across
      return `
        <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
          <img src="${photoSrc}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(1.15) contrast(1.05);"/>
          <div style="position:absolute;inset:0;background:linear-gradient(160deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 35%, rgba(0,0,0,0.1) 55%, rgba(0,0,0,0.7) 100%);"></div>
          <div style="position:absolute;top:200px;left:50px;right:50px;">
            <div style="font-family:${SANS};font-size:48px;font-weight:700;color:rgba(255,255,255,0.75);letter-spacing:6px;text-shadow:0 2px 6px rgba(0,0,0,0.8);">FREE PHOTO SHOOT</div>
            <div style="font-family:${SERIF};font-size:${citySize(210, city)}px;font-weight:900;font-style:italic;color:white;line-height:0.82;margin-top:12px;text-shadow:0 4px 10px rgba(0,0,0,0.9),0 0 60px rgba(0,0,0,0.3);">${cityUpper}</div>
          </div>
          <div style="position:absolute;bottom:400px;left:60px;">
            <div style="font-family:${SANS};font-size:42px;font-weight:600;color:white;text-shadow:0 2px 8px rgba(0,0,0,0.9);padding:16px 32px;background:rgba(0,0,0,0.4);border-radius:8px;backdrop-filter:blur(4px);">${ctaText}</div>
          </div>
        </div>`

    case 4: // Minimal — huge city, small supporting text, photo speaks
      return `
        <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
          <img src="${photoSrc}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(1.1);"/>
          <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.85) 75%, rgba(0,0,0,0.98) 100%);"></div>
          <div style="position:absolute;bottom:340px;left:60px;right:60px;">
            <div style="font-family:${SERIF};font-size:${citySize(260, city)}px;font-weight:900;font-style:italic;color:white;line-height:0.78;text-shadow:0 6px 16px rgba(0,0,0,0.95),0 0 80px rgba(0,0,0,0.4);">${cityUpper}</div>
            <div style="display:flex;align-items:center;gap:24px;margin-top:28px;">
              <div style="font-family:${SANS};font-size:54px;font-weight:800;color:white;text-shadow:0 2px 6px rgba(0,0,0,0.8);">Free photo shoot</div>
            </div>
            <div style="font-family:${SANS};font-size:34px;color:rgba(255,255,255,0.6);margin-top:20px;text-shadow:0 2px 4px rgba(0,0,0,0.8);">${ctaText}</div>
          </div>
        </div>`

    case 5: // Bold stripe — semi-transparent dark band across middle
      return `
        <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
          <img src="${photoSrc}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(1.1) contrast(1.05);"/>
          <div style="position:absolute;top:620px;left:0;right:0;height:700px;background:rgba(0,0,0,0.82);backdrop-filter:blur(2px);"></div>
          <div style="position:absolute;top:660px;left:60px;right:60px;">
            <div style="font-family:${SERIF};font-size:${citySize(230, city)}px;font-weight:900;font-style:italic;color:white;line-height:0.82;">${cityUpper}</div>
            <div style="font-family:${SANS};font-size:60px;font-weight:800;color:white;margin-top:16px;letter-spacing:2px;">FREE PHOTO SHOOT</div>
            <div style="font-family:${SANS};font-size:36px;font-weight:500;color:rgba(255,255,255,0.65);margin-top:24px;">${ctaText}</div>
          </div>
        </div>`

    case 6: // Left-aligned editorial — city stacked vertically, tight leading
      return `
        <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
          <img src="${photoSrc}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(1.1);"/>
          <div style="position:absolute;inset:0;background:linear-gradient(90deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.6) 45%, rgba(0,0,0,0.05) 100%);"></div>
          <div style="position:absolute;top:300px;left:50px;width:550px;">
            <div style="font-family:${SANS};font-size:42px;font-weight:700;color:rgba(255,255,255,0.7);letter-spacing:6px;text-transform:uppercase;">FREE</div>
            <div style="font-family:${SANS};font-size:42px;font-weight:700;color:rgba(255,255,255,0.7);letter-spacing:6px;text-transform:uppercase;">PHOTO</div>
            <div style="font-family:${SANS};font-size:42px;font-weight:700;color:rgba(255,255,255,0.7);letter-spacing:6px;text-transform:uppercase;">SHOOT</div>
            <div style="font-family:${SERIF};font-size:${citySize(180, city)}px;font-weight:900;font-style:italic;color:white;line-height:0.82;margin-top:24px;text-shadow:0 4px 8px rgba(0,0,0,0.6);">${cityUpper}</div>
            <div style="width:120px;height:4px;background:white;margin:32px 0;opacity:0.5;"></div>
            <div style="font-family:${SANS};font-size:36px;font-weight:500;color:rgba(255,255,255,0.7);">${ctaText}</div>
          </div>
        </div>`

    case 7: // Bottom card — floating card over photo
      return `
        <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
          <img src="${photoSrc}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(1.1) contrast(1.02);"/>
          <div style="position:absolute;inset:0;background:linear-gradient(180deg, transparent 0%, transparent 50%, rgba(0,0,0,0.3) 100%);"></div>
          <div style="position:absolute;bottom:280px;left:40px;right:40px;background:rgba(255,255,255,0.95);border-radius:16px;padding:48px 52px;box-shadow:0 20px 60px rgba(0,0,0,0.5);">
            <div style="font-family:${SERIF};font-size:${citySize(120, city)}px;font-weight:900;font-style:italic;color:#0a0a0a;line-height:0.85;">${city}</div>
            <div style="font-family:${SANS};font-size:48px;font-weight:800;color:#0a0a0a;margin-top:12px;letter-spacing:1px;">Free photo shoot</div>
            <div style="width:80px;height:3px;background:#0a0a0a;margin:20px 0;"></div>
            <div style="font-family:${SANS};font-size:32px;font-weight:500;color:rgba(10,10,10,0.6);">${ctaText}</div>
          </div>
        </div>`

    case 8: // Full dark overlay — huge centered city with accent line
      return `
        <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
          <img src="${photoSrc}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(1.05) brightness(0.55);"/>
          <div style="position:absolute;inset:0;background:rgba(0,0,0,0.35);"></div>
          <div style="position:absolute;top:50%;left:60px;right:60px;transform:translateY(-55%);text-align:center;">
            <div style="font-family:${SERIF};font-size:${citySize(250, city)}px;font-weight:900;font-style:italic;color:white;line-height:0.8;text-shadow:0 4px 12px rgba(0,0,0,0.5);">${cityUpper}</div>
            <div style="width:200px;height:4px;background:white;margin:36px auto;opacity:0.6;"></div>
            <div style="font-family:${SANS};font-size:58px;font-weight:800;color:white;letter-spacing:3px;text-shadow:0 2px 6px rgba(0,0,0,0.6);">FREE PHOTO SHOOT</div>
            <div style="font-family:${SANS};font-size:36px;font-weight:500;color:rgba(255,255,255,0.6);margin-top:32px;">${ctaText}</div>
          </div>
        </div>`

    case 9: // Warm gradient — golden hour feel
      return `
        <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
          <img src="${photoSrc}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(1.2) contrast(1.05) brightness(0.9);"/>
          <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(40,20,0,0.6) 0%, rgba(0,0,0,0.1) 30%, rgba(0,0,0,0.15) 50%, rgba(20,10,0,0.85) 80%, rgba(10,5,0,0.98) 100%);"></div>
          <div style="position:absolute;bottom:360px;left:60px;right:60px;">
            <div style="font-family:${SERIF};font-size:${citySize(220, city)}px;font-weight:900;font-style:italic;color:#fff;line-height:0.82;text-shadow:0 4px 12px rgba(0,0,0,0.8),0 0 40px rgba(200,150,50,0.15);">${cityUpper}</div>
            <div style="font-family:${SANS};font-size:56px;font-weight:800;color:rgba(255,240,210,0.95);margin-top:20px;letter-spacing:2px;text-shadow:0 2px 6px rgba(0,0,0,0.7);">FREE PHOTO SHOOT</div>
            <div style="font-family:${SANS};font-size:36px;font-weight:500;color:rgba(255,230,190,0.6);margin-top:24px;text-shadow:0 2px 4px rgba(0,0,0,0.7);">${ctaText}</div>
          </div>
        </div>`
  }
}

// Build 30 slides: 10 per city, each with different photo + layout + CTA
const slides = []

for (let ci = 0; ci < cities.length; ci++) {
  const city = cities[ci]
  for (let v = 0; v < 10; v++) {
    // Distribute photos across variants — offset by city index for variety
    const photoIdx = (v * 2 + ci * 3) % photos.length
    const ctaIdx = (v + ci * 3) % ctas.length
    slides.push({
      name: `${city.toLowerCase()}-${String(v + 1).padStart(2, '0')}`,
      city,
      html: makeSlide(city, photos[photoIdx], ctas[ctaIdx], v),
    })
  }
}

async function render() {
  for (const city of cities) {
    fs.mkdirSync(path.join(OUT, city.toLowerCase()), { recursive: true })
  }

  console.log(`Launching browser — rendering ${slides.length} CPC ads...`)
  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 })

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i]
    const page = await context.newPage()
    await page.setContent(`<!doctype html><html><head><style>
      * { box-sizing: border-box; }
      html, body { margin: 0; width: 1080px; height: 1920px; background: #000; overflow: hidden; }
      body { -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; }
    </style></head><body>${slide.html}</body></html>`, { waitUntil: 'load' })
    await page.waitForTimeout(300)
    const outPath = path.join(OUT, slide.city.toLowerCase(), `${slide.name}.png`)
    await page.screenshot({ path: outPath, type: 'png' })
    await page.close()
    console.log(`  [${i + 1}/${slides.length}] ${slide.name}`)
  }

  await browser.close()
  console.log(`\nDone — ${slides.length} CPC ads rendered to ${OUT}`)
}

render()
