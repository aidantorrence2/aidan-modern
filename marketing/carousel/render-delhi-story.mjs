import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

// Delhi STORY carousel — offer-led spine (sell the free shoot; story = proof).
// Visual language from maciejsphotos: black slides, Poppins titles, Georgia serif
// body, Caveat handwriting on the CTA.
// big -> headliners/ , small -> faves/ , self -> self/

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, 'output-delhi-story')
const HEAD = '/Users/aidantorrence/Documents/aidan-modern/public/images/headliners'
const FAVE = '/Users/aidantorrence/Documents/aidan-modern/public/images/faves'
const SELF = '/Users/aidantorrence/Documents/aidan-modern/public/images/self'
fs.mkdirSync(OUT, { recursive: true })

const enc = p => 'data:image/jpeg;base64,' + fs.readFileSync(p).toString('base64')
const H = f => enc(path.join(HEAD, f))
const Fv = f => enc(path.join(FAVE, f))
const Sf = f => enc(path.join(SELF, f))
const faveFiles = fs.readdirSync(FAVE).filter(f => /\.jpe?g$/i.test(f)).sort()
const favs = (off, n) => { const a = []; for (let i = 0; i < n; i++) a.push(Fv(faveFiles[(off + i * 11) % faveFiles.length])); return a }

const SE = "Georgia, 'Times New Roman', serif"
const RD = "'Poppins', 'Arial Rounded MT Bold', sans-serif"
const HW = "'Caveat', 'Bradley Hand', cursive"
const SH = 'text-shadow:0 2px 8px rgba(0,0,0,0.85),0 12px 50px rgba(0,0,0,0.6);'

// embed real fonts (base64) so they render reliably in headless chromium
const FDIR = path.join(__dirname, 'fonts')
const fontB64 = f => fs.readFileSync(path.join(FDIR, f)).toString('base64')
const face = (fam, file, weight) => `@font-face{font-family:'${fam}';font-weight:${weight};font-style:normal;font-display:block;src:url(data:font/woff2;base64,${fontB64(file)}) format('woff2');}`
const FONTCSS = [face('Poppins', 'poppins-700.woff2', '700'), face('Caveat', 'caveat-700.woff2', '700')].join('')

const frame = (inner, bg) => `<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:${bg || '#000'};">${inner}</div>`
const grain = (o = 0.06) => `<div style="position:absolute;inset:0;pointer-events:none;opacity:${o};mix-blend-mode:soft-light;background-image:radial-gradient(circle at 14% 18%,rgba(255,255,255,0.5),transparent 17%),radial-gradient(circle at 84% 12%,rgba(255,255,255,0.28),transparent 15%),repeating-linear-gradient(0deg,rgba(255,255,255,0.08) 0 1px,transparent 1px 4px);"></div>`
const photo = (src, w, h, l, t, rad = 8, pos = 'center top') => `<img src="${src}" style="position:absolute;left:${l}px;top:${t}px;width:${w}px;height:${h}px;object-fit:cover;object-position:${pos};display:block;border-radius:${rad}px;"/>`

function story(name, title, body, photosHtml) {
  return {
    name, html: frame(`
    <div style="position:absolute;top:150px;left:60px;right:60px;text-align:center;"><p style="font-family:${RD};font-size:60px;font-weight:700;color:#fff;margin:0;line-height:1.0;letter-spacing:-0.01em;">${title}</p></div>
    <div style="position:absolute;top:300px;left:74px;right:74px;text-align:center;"><p style="font-family:${SE};font-size:38px;color:rgba(255,255,255,0.92);line-height:1.45;margin:0;">${body}</p></div>
    ${photosHtml || ''}` + grain(), '#0a0a0a')
  }
}
function bleed(name, src, overlay, scrim) {
  const sc = scrim || 'linear-gradient(180deg,rgba(0,0,0,0.45) 0%,transparent 30%,transparent 55%,rgba(0,0,0,0.9) 100%)'
  return { name, html: frame(`<img src="${src}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center top;display:block;filter:saturate(1.06) contrast(1.03);"/><div style="position:absolute;inset:0;background:${sc};"></div>${overlay}${grain(0.08)}`) }
}

const slides = []

// 01 — HOOK (full-bleed work shot) — location BIG, Georgia
slides.push(bleed('01-hook', H('000016-7.jpg'),
  `<div style="position:absolute;bottom:300px;left:64px;right:64px;text-align:center;">
     <p style="font-family:${SE};font-size:150px;font-weight:700;font-style:italic;color:#fff;margin:0;line-height:0.88;${SH}">Delhi</p>
     <p style="font-family:${SE};font-size:80px;font-weight:700;font-style:italic;color:#fff;margin:10px 0 0;line-height:0.98;${SH}">free photo shoot.</p>
     <p style="font-family:${SE};font-size:33px;font-style:italic;color:rgba(255,255,255,0.85);margin:30px 0 0;${SH}">Here's the deal →</p>
   </div>`))

// 02 — a bit about me (who) — self photo, bigger, less gap
slides.push(story('02-about', 'a bit about me',
  "I'm Aidan, from the USA. For the last 3 years I've been traveling the world with my camera — 47 countries so far. Right now, I'm in Delhi.",
  photo(Sf('aidan-cropped-01.jpg'), 560, 700, 260, 580, 8, 'center top')))

// 03 — the deal (what you get)
slides.push(story('03-deal', 'here’s the deal',
  "I'll photograph you on 35mm film — a full shoot, directed start to finish, edited photos to keep. Completely free.",
  photo(H('DSC_0321.jpg'), 700, 990, 190, 700)))

// 04 — some of my work (scattered film prints, portrait aspect kept)
{
  const f = favs(8, 5)
  const pr = (src, l, t, w, h, rot) => `<div style="position:absolute;left:${l}px;top:${t}px;width:${w + 24}px;height:${h + 24}px;background:#fafafa;padding:12px 12px 14px;transform:rotate(${rot}deg);box-shadow:0 16px 44px rgba(0,0,0,0.55),0 3px 10px rgba(0,0,0,0.3);"><img src="${src}" style="width:${w}px;height:${h}px;object-fit:cover;object-position:center top;display:block;"/></div>`
  const collage =
    pr(f[0], 50, 480, 350, 460, -5) +
    pr(f[1], 620, 440, 370, 490, 4) +
    pr(f[2], 110, 1010, 360, 480, 3) +
    pr(f[3], 600, 1020, 370, 490, -4) +
    pr(f[4], 370, 760, 340, 450, 2)   // center, on top — photo-pile
  slides.push({
    name: '04-work', html: frame(`
      <div style="position:absolute;top:120px;left:60px;right:60px;text-align:center;"><p style="font-family:${RD};font-size:60px;font-weight:700;color:#fff;margin:0;">some of my work</p></div>
      ${collage}
    ` + grain(), '#0a0a0a')
  })
}

// 05 — how it works
slides.push({
  name: '05-how', html: frame(`
    <div style="position:absolute;top:210px;left:60px;right:60px;text-align:center;"><p style="font-family:${RD};font-size:60px;font-weight:700;color:#fff;margin:0;">how it works</p></div>
    <div style="position:absolute;top:480px;left:120px;right:120px;">
      ${[['1', 'Sign up', 'Tap the link below — takes a minute.'], ['2', 'We plan it', 'A quick chat to pick the spot, time & look.'], ['3', 'We shoot', 'About an hour. I direct every frame.']].map(s => `<div style="display:flex;gap:30px;align-items:flex-start;margin:0 0 58px;"><span style="font-family:${SE};font-size:78px;font-style:italic;font-weight:700;color:#e9c986;line-height:0.85;">${s[0]}</span><div><p style="font-family:${RD};font-size:44px;font-weight:700;color:#fff;margin:0;">${s[1]}</p><p style="font-family:${SE};font-size:33px;color:rgba(255,255,255,0.62);margin:8px 0 0;line-height:1.3;">${s[2]}</p></div></div>`).join('')}
    </div>
    <div style="position:absolute;bottom:230px;left:74px;right:74px;text-align:center;"><p style="font-family:${SE};font-size:34px;font-style:italic;color:rgba(255,255,255,0.6);margin:0;">No experience needed — that's my job.</p></div>
  ` + grain(), '#0a0a0a')
})

// 06 — CTA (full-bleed, handwritten, no @handle)
slides.push(bleed('06-cta', H('DSC_0249.jpg'),
  `<div style="position:absolute;bottom:330px;left:64px;right:64px;text-align:center;">
     <p style="font-family:${HW};font-size:138px;font-weight:700;color:#fff;margin:0;line-height:0.95;${SH}">Want in?</p>
     <p style="font-family:${HW};font-size:138px;font-weight:700;color:#fff;margin:0;line-height:0.95;${SH}">Sign up below.</p>
     <p style="font-family:${SE};font-size:34px;color:rgba(255,255,255,0.9);margin:34px 0 0;${SH}">A free photo shoot in Delhi. I direct everything.</p>
   </div>`,
  'linear-gradient(180deg,rgba(0,0,0,0.35) 0%,rgba(0,0,0,0.12) 35%,rgba(0,0,0,0.9) 100%)'))

async function render() {
  const dir = path.join(OUT, 'delhi'); fs.mkdirSync(dir, { recursive: true })
  console.log(`Rendering ${slides.length} slides...`)
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 2 })
  for (let i = 0; i < slides.length; i++) {
    const s = slides[i]; const page = await ctx.newPage()
    await page.setContent(`<!doctype html><html><head><style>${FONTCSS}*{box-sizing:border-box}html,body{margin:0;width:1080px;height:1920px;background:#000;overflow:hidden}body{-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}</style></head><body>${s.html}</body></html>`, { waitUntil: 'load' })
    await page.evaluate(() => document.fonts.ready)
    await page.waitForTimeout(300)
    await page.screenshot({ path: path.join(dir, `${s.name}.jpg`), type: 'jpeg', quality: 92 })
    await page.close()
    console.log(`  [${i + 1}/${slides.length}] ${s.name}`)
  }
  await browser.close()
  console.log(`\nDone — ${slides.length} slides -> ${dir}`)
}
render()
