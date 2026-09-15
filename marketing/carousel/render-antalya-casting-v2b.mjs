import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

// ANTALYA CASTING CALLOUT v2b — v2 with the dates removed and 'tfp' → 'free photo collab' everywhere (Aidan, 9/12).
// v2 was: the v1 single callout expanded to a 5-slide story set.
// Slide 1 is the approved callout unchanged (render-antalya-casting-v1.mjs). Slides 2-5 keep
// its language — black frame, white typed system-sans lowercase (reads like native IG story
// text), matted film prints tilted a few degrees — and add: work / what you get / how it
// works / DM CTA. Specifics (1-2 hrs, plan over dm, scans in ~2 weeks, free + tfp) match the
// live /sign-up-collab/faq copy. "free" is said once (slide 3). CTA slide keeps the bottom
// ~300px clear for a link sticker; the DM keyword is the city so replies are easy to spot.
const CITY = { name: 'Antalya', slug: 'antalya' }
const TAG = 'v2b'
const ONLY = process.argv.find(arg => arg.startsWith('--only='))?.split('=')[1]

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const IMG = '/Users/aidantorrence/Documents/aidan-modern/public/images'
const enc = p => 'data:image/jpeg;base64,' + fs.readFileSync(path.join(IMG, p)).toString('base64')
// slide 1 prints — bottom row, left → right (Aidan's picked set, order as asked)
const STRIP = ['large/r1-05460-0022.jpg', 'nature/000042-2.jpg', 'faves/000024-3.jpg']

const SS = "-apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif"
const FONTCSS = ''
const SH = 'text-shadow:0 2px 8px rgba(0,0,0,0.85),0 12px 50px rgba(0,0,0,0.6);'

const grain = (o = 0.05) => `<div style="position:absolute;inset:0;pointer-events:none;opacity:${o};mix-blend-mode:soft-light;background-image:radial-gradient(circle at 14% 18%,rgba(255,255,255,0.5),transparent 17%),radial-gradient(circle at 84% 12%,rgba(255,255,255,0.28),transparent 15%),repeating-linear-gradient(0deg,rgba(255,255,255,0.08) 0 1px,transparent 1px 4px);"></div>`

// matted film print (white mat, soft shadow, tilted)
const pr = (src, l, t, w, h, rot) => `<div style="position:absolute;left:${l}px;top:${t}px;width:${w + 24}px;height:${h + 26}px;background:#fafafa;padding:12px 12px 14px;transform:rotate(${rot}deg);box-shadow:0 16px 44px rgba(0,0,0,0.55),0 3px 10px rgba(0,0,0,0.3);"><img src="${src}" style="width:${w}px;height:${h}px;object-fit:cover;object-position:center top;display:block;"/></div>`
const PR_W = 240, PR_H = 360
const strip = () => {
  const lay = [[70, 1100, -6], [395, 1215, 2.5], [730, 1290, -3]]   // step down left → right
  return STRIP.map((f, i) => pr(enc(f), lay[i][0], lay[i][1], PR_W, PR_H, lay[i][2])).join('')
}

// plain typed-on-a-story text
const line = (t, size = 66, dim = 1, mt = 0, extra = '') => `<p style="font-family:${SS};font-size:${size}px;font-weight:500;color:rgba(255,255,255,${dim});margin:${mt}px 0 0;line-height:1.3;${extra}">${t}</p>`

function buildSlides({ name }) {
  const lower = name.toLowerCase()
  const frame = (inner, bg = '#000') => `<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:${bg};">${inner}</div>`
  const bleed = (src, scrim, overlay) => frame(`<img src="${src}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center top;display:block;filter:saturate(1.04) contrast(1.02);"/><div style="position:absolute;inset:0;background:${scrim};"></div>${overlay}${grain(0.07)}`)
  const slides = []

  // 01 — the callout, unchanged from v1
  slides.push({
    name: '01-callout', html: frame(`
      <div style="position:absolute;top:260px;left:90px;right:90px;text-align:center;">
        ${line(`hi, i'm in ${lower}.`)}
        ${line('looking for models<br/>for a free photo collab', 66, 1, 90)}
        ${line('dm me if interested', 66, 1, 90)}
        ${line('share 🙂', 66, 1, 90)}
      </div>
      ${strip()}
    `)
  })

  // 02 — work: one full-bleed frame (strongest single image), two typed lines up top
  slides.push({
    name: '02-work', html: bleed(enc('headliners/000050-6.jpg'),
      'linear-gradient(180deg,rgba(0,0,0,0.62) 0%,rgba(0,0,0,0.25) 26%,transparent 42%,transparent 78%,rgba(0,0,0,0.55) 100%)',
      `<div style="position:absolute;top:200px;left:90px;right:90px;text-align:center;${SH}">
         ${line('some of my work')}
         ${line('all 35mm film, natural light', 46, 0.9, 26)}
       </div>`)
  })

  // 03 — what you get: typed list, two prints along the bottom
  slides.push({
    name: '03-what', html: frame(`
      <div style="position:absolute;top:220px;left:90px;right:90px;text-align:center;">
        ${line('what you get')}
        ${line('a 1-2 hour shoot on 35mm film', 50, 0.95, 70)}
        ${line('somewhere in kaleiçi, the old harbour,<br/>or the cliffs at karaalioğlu park', 50, 0.95, 44)}
        ${line('we plan the look together over dm', 50, 0.95, 44)}
        ${line('full-res scans in about 2 weeks,<br/>yours to keep', 50, 0.95, 44)}
        ${line('free photo collab — i post a few too', 50, 0.95, 44)}
      </div>
      ${pr(enc('large/manila-gallery-dsc-0190.jpg'), 110, 1300, 300, 455, -5)}
      ${pr(enc('large/manila-gallery-canal-001.jpg'), 640, 1340, 300, 449, 3.5)}
    `)
  })

  // 04 — how it works: numbered lines set left, one big print bleeding off the bottom-right
  slides.push({
    name: '04-how', html: frame(`
      <div style="position:absolute;top:240px;left:100px;right:100px;text-align:left;">
        ${line('how it works')}
        ${line(`1. dm me "${lower}"`, 54, 0.95, 70)}
        ${line('2. we pick a spot + a time<br/>&nbsp;&nbsp;&nbsp;&nbsp;(sunset here is 19:10)', 54, 0.95, 40)}
        ${line('3. we shoot for an hour or two', 54, 0.95, 40)}
        ${line('4. i develop the film +<br/>&nbsp;&nbsp;&nbsp;&nbsp;send you the scans', 54, 0.95, 40)}
      </div>
      ${pr(enc('large/manila-gallery-park-001.jpg'), 600, 1130, 440, 660, 4)}
    `)
  })

  // 05 — CTA: full-bleed glam (face clears the text band), DM keyword + handle, bottom clear for the link sticker
  slides.push({
    name: '05-cta', html: bleed(enc('faves/000051-12.jpg'),
      'linear-gradient(180deg,transparent 0%,transparent 38%,rgba(0,0,0,0.55) 58%,rgba(0,0,0,0.92) 100%)',
      `<div style="position:absolute;top:960px;left:80px;right:80px;text-align:center;${SH}">
         ${line(`dm me "${lower}" 🙂`, 72)}
         ${line('@madebyaidan', 54, 0.92, 30)}
         ${line("or share this with someone<br/>who'd be into it", 40, 0.85, 70)}
       </div>`)
  })

  return slides
}

async function render() {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 2 })
  const all = buildSlides(CITY)
  const slides = ONLY ? all.filter(s => s.name === ONLY) : all
  if (slides.length === 0) throw new Error(`Unknown slide for --only: ${ONLY}`)
  const dir = path.join(__dirname, `output-${CITY.slug}-casting-${TAG}`, CITY.slug)
  fs.mkdirSync(dir, { recursive: true })
  if (!ONLY) for (const f of fs.readdirSync(dir)) if (f.toLowerCase().endsWith('.jpg')) fs.rmSync(path.join(dir, f))
  for (const s of slides) {
    const page = await ctx.newPage()
    await page.setContent(`<!doctype html><html><head><style>${FONTCSS}*{box-sizing:border-box}html,body{margin:0;width:1080px;height:1920px;background:#000;overflow:hidden}body{-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}</style></head><body>${s.html}</body></html>`, { waitUntil: 'load' })
    await page.evaluate(() => document.fonts.ready)
    await page.waitForTimeout(300)
    await page.screenshot({ path: path.join(dir, `${s.name}.jpg`), type: 'jpeg', quality: 92 })
    await page.close()
  }
  console.log(`${CITY.name} casting (${TAG}): ${slides.length} slides -> ${dir}`)
  await browser.close()
  console.log('Done.')
}
render()
