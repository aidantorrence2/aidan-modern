import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, '..', 'public', 'images', 'moodboards')
const IMG_DIR = '/Volumes/PortableSSD/Exports/film scans selected'

fs.mkdirSync(OUT, { recursive: true })

function imgUrl(filename) {
  return `file://${path.join(IMG_DIR, filename).replace(/ /g, '%20')}`
}

const allFiles = fs.readdirSync(IMG_DIR).filter(f => f.endsWith('.jpg') && !f.startsWith('._'))

// Hand-picked photos for each moodboard vibe
const moodboards = [
  {
    name: 'street-editorial',
    label: 'Street Editorial',
    color: '#1a1a1a',
    accent: '#e0c9a6',
    // Urban/street vibes
    photos: ['DSC_0130.jpg','DSC_0190.jpg','DSC_0075.jpg','DSC_0911.jpg','DSC_0120.jpg','DSC_0064.jpg']
      .filter(f => allFiles.includes(f))
  },
  {
    name: 'nature-editorial',
    label: 'Nature Editorial',
    color: '#1a2a1a',
    accent: '#8fbc8f',
    // Garden/park/outdoor
    photos: ['DSC_0487.jpg','DSC_0505.jpg','DSC_0528.jpg','DSC_0539.jpg','DSC_0563.jpg','DSC_0565.jpg']
      .filter(f => allFiles.includes(f))
  },
  {
    name: 'swim',
    label: 'Swim',
    color: '#0a1a2a',
    accent: '#5ca4c8',
    // Beach/water
    photos: ['DSC_0781.jpg','DSC_0692.jpg','DSC_0621.jpg','DSC_0620.jpg','DSC_0507.jpg','DSC_0520.jpg']
      .filter(f => allFiles.includes(f))
  },
  {
    name: 'indoor',
    label: 'Indoor',
    color: '#2a1a1a',
    accent: '#d4a574',
    // Indoor/studio
    photos: ['DSC_0034.jpg','DSC_0045.jpg','DSC_0049.jpg','DSC_0054.jpg','DSC_0055.jpg','DSC_0057.jpg']
      .filter(f => allFiles.includes(f))
  },
  {
    name: 'night',
    label: 'Night',
    color: '#0a0a1a',
    accent: '#9b7dd4',
    // Night/moody
    photos: ['DSC_0956.jpg','DSC_0988.jpg','DSC_0861-2.jpg','DSC_0885.jpg','DSC_0280.jpg','DSC_0314-2.jpg']
      .filter(f => allFiles.includes(f))
  }
]

// Fill any short arrays with random photos
for (const mb of moodboards) {
  while (mb.photos.length < 6) {
    const rand = allFiles[Math.floor(Math.random() * allFiles.length)]
    if (!mb.photos.includes(rand)) mb.photos.push(rand)
  }
}

function makeCollage(mb) {
  const [p1, p2, p3, p4, p5, p6] = mb.photos.map(f => imgUrl(f))
  return `
    <div style="width:600px;height:600px;position:relative;overflow:hidden;background:${mb.color};">
      <!-- 2x3 tight grid with small gaps -->
      <div style="position:absolute;top:8px;left:8px;width:286px;height:290px;overflow:hidden;border-radius:6px;">
        <img src="${p1}" style="width:100%;height:100%;object-fit:cover;"/>
      </div>
      <div style="position:absolute;top:8px;left:302px;width:290px;height:188px;overflow:hidden;border-radius:6px;">
        <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
      </div>
      <div style="position:absolute;top:204px;left:302px;width:140px;height:188px;overflow:hidden;border-radius:6px;">
        <img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/>
      </div>
      <div style="position:absolute;top:204px;left:450px;width:142px;height:188px;overflow:hidden;border-radius:6px;">
        <img src="${p4}" style="width:100%;height:100%;object-fit:cover;"/>
      </div>
      <div style="position:absolute;top:306px;left:8px;width:190px;height:286px;overflow:hidden;border-radius:6px;">
        <img src="${p5}" style="width:100%;height:100%;object-fit:cover;"/>
      </div>
      <div style="position:absolute;top:400px;left:206px;width:386px;height:192px;overflow:hidden;border-radius:6px;">
        <img src="${p6}" style="width:100%;height:100%;object-fit:cover;"/>
      </div>
      <!-- label overlay -->
      <div style="position:absolute;bottom:0;left:0;right:0;height:80px;background:linear-gradient(transparent,rgba(0,0,0,0.7));display:flex;align-items:flex-end;padding:0 16px 12px;">
        <span style="font-family:Georgia,serif;font-size:22px;font-weight:700;color:white;font-style:italic;text-shadow:0 1px 4px rgba(0,0,0,0.8);">${mb.label}</span>
      </div>
    </div>
  `
}

async function render() {
  console.log(`Rendering ${moodboards.length} moodboard collages...`)
  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: 600, height: 600 }, deviceScaleFactor: 2 })

  for (const mb of moodboards) {
    const html = makeCollage(mb)
    const tmpHtml = path.join(OUT, '_tmp.html')
    fs.writeFileSync(tmpHtml, `<!doctype html><html><head><style>*{margin:0;padding:0;box-sizing:border-box;}</style></head><body>${html}</body></html>`)
    const page = await context.newPage()
    await page.goto(`file://${tmpHtml}`, { waitUntil: 'load' })
    await page.waitForTimeout(500)
    await page.screenshot({ path: path.join(OUT, `${mb.name}.jpg`), type: 'jpeg', quality: 85 })
    await page.close()
    console.log(`  OK ${mb.name}`)
  }

  fs.unlinkSync(path.join(OUT, '_tmp.html'))
  await browser.close()
  console.log(`\nDone — ${moodboards.length} moodboards -> ${OUT}`)
}

render()
