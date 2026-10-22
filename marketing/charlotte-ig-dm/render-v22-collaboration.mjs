import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '../..')
const edgeToEdge = process.argv.includes('--edge-to-edge')
const out = path.join(here, edgeToEdge ? 'renders-v24-collaboration-full-bleed' : 'renders-v22-collaboration')
const sources = {
  selfie: path.join(root, 'marketing/charlotte-video-ads/work/src2/aidan-real-selfie.jpg'),
  male: path.join(root, 'public/images/new_top_tier_candidates/R1-09794-021A.jpg'),
  female: path.join(root, 'public/images/new_top_tier_candidates/000014.jpg'),
}
const encode = file => fs.readFileSync(file).toString('base64')
const photo = key => `data:image/jpeg;base64,${encode(sources[key])}`
const font = encode(path.join(root, 'marketing/carousel/fonts/caveat-700.woff2'))
const copy = "i am doing a few free collaboration photo shoots while i'm in charlotte."
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Caveat;src:url(data:font/woff2;base64,${font}) format('woff2');font-weight:700;font-display:block}
*{box-sizing:border-box}html,body{width:1080px;height:1920px;margin:0;overflow:hidden;background:#000;color:white}
body{-webkit-font-smoothing:antialiased}p{margin:0}
.selfie{position:absolute;left:0;top:230px;width:1080px;height:1690px;overflow:hidden}
.selfie img{position:absolute;left:-106px;top:0;width:1272px;height:1690px;display:block}
${edgeToEdge ? '.selfie{top:0;height:1920px}.selfie img{left:-182px;width:1445px;height:1920px}' : ''}
.shade{position:absolute;left:0;right:0;top:627px;bottom:0;background:linear-gradient(180deg,transparent 0%,rgba(0,0,0,.72) 38%,rgba(0,0,0,.9) 100%)}
.headline{position:absolute;left:30px;top:767px;width:1020px;text-align:center;font:700 150px/1 Caveat,'Bradley Hand',cursive;text-shadow:0 2px 8px #000d,0 12px 50px #0009}
.copy{position:absolute;left:70px;top:943px;width:940px;text-align:center;font:italic 46px/1.25 Georgia,'Times New Roman',serif;text-shadow:0 2px 8px #000d,0 12px 50px #0009}
.work-title{position:absolute;left:64px;top:1103px;width:952px;text-align:center;font:700 72px/1 Caveat,'Bradley Hand',cursive;text-shadow:0 2px 8px #000d}
.gallery{position:absolute;left:64px;top:1202px;width:952px;display:grid;grid-template-columns:1fr 1fr;gap:24px}
.print{margin:0;padding:8px;background:#f4f1e9;box-shadow:0 8px 30px #0006}
.print img{width:100%;height:565px;display:block;object-fit:cover;object-position:center 24%}
</style></head><body>
<div class="selfie"><img data-source="selfie" src="${photo('selfie')}" alt="Aidan's original mirror selfie"></div>
<div class="shade"></div>
<p class="headline">hi, i'm aidan 👋</p>
<p class="copy">${copy}</p>
<p class="work-title">here's my work</p>
<div class="gallery">
  <figure class="print"><img data-source="male" src="${photo('male')}" alt="Original portrait of a man in a brown jacket"></figure>
  <figure class="print"><img data-source="female" src="${photo('female')}" alt="Original portrait of a woman in a black coat"></figure>
</div>
</body></html>`

fs.mkdirSync(out, { recursive: true })
fs.writeFileSync(path.join(out, '01-hi-collaboration.html'), html)
const browser = await chromium.launch()
try {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 })
  await page.setContent(html, { waitUntil: 'load' })
  await page.evaluate(() => document.fonts.ready)
  await page.evaluate(() => Promise.all([...document.images].map(image => image.decode())))
  const audit = await page.evaluate(() => {
    const bounds = selector => {
      const r = document.querySelector(selector).getBoundingClientRect()
      return { top: r.top, bottom: r.bottom, left: r.left, right: r.right }
    }
    return {
      headline: document.querySelector('.headline').textContent,
      copy: document.querySelector('.copy').textContent,
      label: document.querySelector('.work-title').textContent,
      bounds: ['.headline', '.copy', '.work-title', '.gallery'].map(bounds),
      originals: [...document.images].map(im => ({ key: im.dataset.source, src: im.src, loaded: im.naturalWidth > 0 })),
    }
  })
  if (audit.copy !== copy || audit.label !== "here's my work") throw Error('Copy mismatch')
  for (let i = 1; i < audit.bounds.length; i++) {
    if (audit.bounds[i].top < audit.bounds[i - 1].bottom) throw Error('Layout overlap')
  }
  if (audit.bounds.at(-1).bottom > 1850) throw Error('Photos exceed bottom margin')
  for (const original of audit.originals) {
    if (!original.loaded || original.src !== photo(original.key)) throw Error('Photo source changed')
  }
  await page.screenshot({ path: path.join(out, '01-hi-collaboration.png'), type: 'png' })
  await page.screenshot({ path: path.join(out, '01-hi-collaboration.jpg'), type: 'jpeg', quality: 96 })
  const provenance = Object.fromEntries(Object.entries(sources).map(([key, file]) => [key, {
    file, sha256: createHash('sha256').update(fs.readFileSync(file)).digest('hex'),
  }]))
  fs.writeFileSync(path.join(out, 'validation.json'), JSON.stringify({
    copy: audit.copy, label: audit.label, bounds: audit.bounds, sources: provenance,
    checks: ['exact requested copy', 'no element overlaps', 'all three original JPEGs embedded byte-for-byte', 'all images decoded'],
  }, null, 2) + '\n')
  console.log(`Rendered and checked: ${out}/01-hi-collaboration.png`)
} finally {
  await browser.close()
}
