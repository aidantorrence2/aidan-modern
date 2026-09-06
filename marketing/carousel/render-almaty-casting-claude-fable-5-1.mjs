import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

// ALMATY CASTING CALLOUT — Claude (Fable 5.1) version, run head-to-head with a Codex build.
// Black story frame, white typed text, informal: the ask in Aidan's own words with the
// smallest useful additions (what it is + how to reply).
const CITY = { name: 'Almaty', slug: 'almaty', dates: 'sep 7-9' }
const TAG = 'claude-fable-5-1'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const SS = "-apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif"

// embed real fonts (base64) so they render reliably in headless chromium
const FDIR = path.join(__dirname, 'fonts')
const fontB64 = f => fs.readFileSync(path.join(FDIR, f)).toString('base64')
const face = (fam, file, weight) => `@font-face{font-family:'${fam}';font-weight:${weight};font-style:normal;font-display:block;src:url(data:font/woff2;base64,${fontB64(file)}) format('woff2');}`
const FONTCSS = ''

const grain = (o = 0.05) => `<div style="position:absolute;inset:0;pointer-events:none;opacity:${o};mix-blend-mode:soft-light;background-image:radial-gradient(circle at 14% 18%,rgba(255,255,255,0.5),transparent 17%),radial-gradient(circle at 84% 12%,rgba(255,255,255,0.28),transparent 15%),repeating-linear-gradient(0deg,rgba(255,255,255,0.08) 0 1px,transparent 1px 4px);"></div>`

function buildSlides({ name, dates }) {
  const lower = name.toLowerCase()
  const frame = inner => `<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">${inner}</div>`
  // plain typed-on-a-story text: one block, centred, lowercase, nothing else
  const line = (t, size = 66, dim = 1, mt = 0) => `<p style="font-family:${SS};font-size:${size}px;font-weight:500;color:rgba(255,255,255,${dim});margin:${mt}px 0 0;line-height:1.3;">${t}</p>`
  return [{
    name: '01-callout', html: frame(`
      <div style="position:absolute;top:50%;left:90px;right:90px;transform:translateY(-50%);text-align:center;">
        ${line(lower)}
        ${line('looking for models', 66, 1, 90)}
        ${line('tfp collaboration', 66, 1, 90)}
        ${line(dates, 66, 1, 90)}
        ${line('dm me if interested', 66, 1, 90)}
        ${line('share 🙂', 66, 1, 90)}
      </div>
    `)
  }]
}

async function render() {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 2 })
  const slides = buildSlides(CITY)
  const dir = path.join(__dirname, `output-${CITY.slug}-casting-${TAG}`, CITY.slug)
  fs.mkdirSync(dir, { recursive: true })
  for (const f of fs.readdirSync(dir)) {
    if (f.toLowerCase().endsWith('.jpg')) fs.rmSync(path.join(dir, f))
  }
  for (const s of slides) {
    const page = await ctx.newPage()
    await page.setContent(`<!doctype html><html><head><style>${FONTCSS}*{box-sizing:border-box}html,body{margin:0;width:1080px;height:1920px;background:#000;overflow:hidden}body{-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}</style></head><body>${s.html}</body></html>`, { waitUntil: 'load' })
    await page.evaluate(() => document.fonts.ready)
    await page.waitForTimeout(300)
    await page.screenshot({ path: path.join(dir, `${s.name}.jpg`), type: 'jpeg', quality: 92 })
    await page.close()
  }
  console.log(`${CITY.name} casting (${TAG}): ${slides.length} slide -> ${dir}`)
  await browser.close()
  console.log('Done.')
}
render()
