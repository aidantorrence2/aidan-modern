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
const IMG = '/Users/aidantorrence/Documents/aidan-modern/public/images'
const enc = p => 'data:image/jpeg;base64,' + fs.readFileSync(path.join(IMG, p)).toString('base64')
// bottom row, left → right (order as asked: last, middle, first of the picked set)
const STRIP = ['large/r1-05460-0022.jpg', 'nature/000042-2.jpg', 'faves/000024-3.jpg']

const SS = "-apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif"

// embed real fonts (base64) so they render reliably in headless chromium
const FDIR = path.join(__dirname, 'fonts')
const fontB64 = f => fs.readFileSync(path.join(FDIR, f)).toString('base64')
const face = (fam, file, weight) => `@font-face{font-family:'${fam}';font-weight:${weight};font-style:normal;font-display:block;src:url(data:font/woff2;base64,${fontB64(file)}) format('woff2');}`
const FONTCSS = ''

const grain = (o = 0.05) => `<div style="position:absolute;inset:0;pointer-events:none;opacity:${o};mix-blend-mode:soft-light;background-image:radial-gradient(circle at 14% 18%,rgba(255,255,255,0.5),transparent 17%),radial-gradient(circle at 84% 12%,rgba(255,255,255,0.28),transparent 15%),repeating-linear-gradient(0deg,rgba(255,255,255,0.08) 0 1px,transparent 1px 4px);"></div>`

// three matted film prints laid loosely along the bottom, each tilted a touch
const PR_W = 240, PR_H = 360
const pr = (src, l, t, rot) => `<div style="position:absolute;left:${l}px;top:${t}px;width:${PR_W + 24}px;height:${PR_H + 26}px;background:#fafafa;padding:12px 12px 14px;transform:rotate(${rot}deg);box-shadow:0 16px 44px rgba(0,0,0,0.55),0 3px 10px rgba(0,0,0,0.3);"><img src="${src}" style="width:${PR_W}px;height:${PR_H}px;object-fit:cover;object-position:center top;display:block;"/></div>`
const prints = () => {
  const lay = [[96, 1310, -6], [408, 1288, 2.5], [720, 1316, -3]]
  return STRIP.map((f, i) => pr(enc(f), lay[i][0], lay[i][1], lay[i][2])).join('')
}

function buildSlides({ name, dates }) {
  const lower = name.toLowerCase()
  const frame = inner => `<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">${inner}</div>`
  // plain typed-on-a-story text: one block, centred, lowercase, nothing else
  const line = (t, size = 66, dim = 1, mt = 0) => `<p style="font-family:${SS};font-size:${size}px;font-weight:500;color:rgba(255,255,255,${dim});margin:${mt}px 0 0;line-height:1.3;">${t}</p>`
  return [{
    name: '01-callout', html: frame(`
      <div style="position:absolute;top:260px;left:90px;right:90px;text-align:center;">
        ${line(`hi, i'm in ${lower}.`)}
        ${line(`looking for models<br/>for tfp collabs ${dates}`, 66, 1, 90)}
        ${line('dm me if interested', 66, 1, 90)}
        ${line('share 🙂', 66, 1, 90)}
      </div>
      ${prints()}
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
