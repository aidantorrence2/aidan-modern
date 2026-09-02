import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

// ALMATY CASTING CALLOUT — Claude (Fable 5.1) version, run head-to-head with a Codex build.
// Plain black story / reel frame, white text only: a casting call for models in Almaty,
// Mon–Wed Sep 7–9, with an explicit share ask. No photos — text-only reads as a personal
// note rather than an ad, which is what gets a casting call re-shared.
// Copy hierarchy: who/where/when → why it's worth it (3 bullets) → one CTA → share ask.
const CITY = { name: 'Almaty', slug: 'almaty', dates: 'mon–wed · sep 7–9' }
const TAG = 'claude-fable-5-1'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const SE = "Georgia, 'Times New Roman', serif"
const RD = "'Poppins', 'Arial Rounded MT Bold', sans-serif"
const HW = "'Caveat', 'Bradley Hand', cursive"

// embed real fonts (base64) so they render reliably in headless chromium
const FDIR = path.join(__dirname, 'fonts')
const fontB64 = f => fs.readFileSync(path.join(FDIR, f)).toString('base64')
const face = (fam, file, weight) => `@font-face{font-family:'${fam}';font-weight:${weight};font-style:normal;font-display:block;src:url(data:font/woff2;base64,${fontB64(file)}) format('woff2');}`
const FONTCSS = [face('Poppins', 'poppins-700.woff2', '700'), face('Caveat', 'caveat-700.woff2', '700')].join('')

const grain = (o = 0.05) => `<div style="position:absolute;inset:0;pointer-events:none;opacity:${o};mix-blend-mode:soft-light;background-image:radial-gradient(circle at 14% 18%,rgba(255,255,255,0.5),transparent 17%),radial-gradient(circle at 84% 12%,rgba(255,255,255,0.28),transparent 15%),repeating-linear-gradient(0deg,rgba(255,255,255,0.08) 0 1px,transparent 1px 4px);"></div>`

function buildSlides({ name, dates }) {
  const lower = name.toLowerCase()
  const frame = inner => `<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">${inner}${grain()}</div>`

  const slides = []

  // 01 — the callout. Everything sits inside the story safe zone (y 280–1640) so the
  // profile chip on top and the reply bar at the bottom never cover a line.
  slides.push({
    name: '01-callout', html: frame(`
      <div style="position:absolute;top:300px;left:72px;right:72px;text-align:center;">
        <p style="font-family:${SE};font-size:104px;font-weight:700;font-style:italic;color:#fff;margin:0;line-height:0.95;">looking for<br/>models</p>
        <p style="font-family:${RD};font-size:30px;font-weight:700;letter-spacing:0.26em;text-transform:uppercase;color:rgba(255,255,255,0.7);margin:36px 0 0;">${lower} &nbsp;·&nbsp; ${dates}</p>
      </div>

      <div style="position:absolute;top:650px;left:110px;right:110px;text-align:center;">
        <p style="font-family:${SE};font-size:40px;color:rgba(255,255,255,0.92);line-height:1.4;margin:0;">i'm a film photographer from the US.<br/>i'm in ${lower} for three days and<br/>shooting a few free sessions.</p>
      </div>

      <div style="position:absolute;top:905px;left:150px;right:110px;">
        ${['completely free', 'you get all the edited photos', 'never modeled? i direct every frame'].map(t => `<p style="font-family:${SE};font-size:38px;color:#fff;line-height:1.35;margin:0 0 18px;"><span style="color:rgba(255,255,255,0.45);margin-right:22px;">·</span>${t}</p>`).join('')}
      </div>

      <div style="position:absolute;top:1170px;left:72px;right:72px;text-align:center;">
        <p style="font-family:${HW};font-size:150px;font-weight:700;color:#fff;margin:0;line-height:0.9;">DM me</p>
        <p style="font-family:${RD};font-size:24px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:rgba(255,255,255,0.5);margin:26px 0 0;">@madebyaidan &nbsp;·&nbsp; no experience needed</p>
      </div>

      <div style="position:absolute;top:1440px;left:120px;right:120px;border:2px solid rgba(255,255,255,0.85);border-radius:22px;padding:40px 30px 44px;text-align:center;">
        <p style="font-family:${SE};font-size:40px;font-weight:700;font-style:italic;color:#fff;margin:0;line-height:1.15;">know someone in ${lower}?</p>
        <p style="font-family:${SE};font-size:34px;color:rgba(255,255,255,0.85);margin:12px 0 0;line-height:1.3;">please send them this &nbsp;↗</p>
      </div>
    `)
  })

  return slides
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
