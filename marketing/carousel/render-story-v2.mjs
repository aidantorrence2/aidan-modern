import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

// STORY v2 — selection-optimized rework of render-story.mjs.
// Why v2 exists: the v1 story converted broadly but pulled a lower-glam applicant
// pool than the 5-slide. v2 keeps the story spine but restores the casting bar:
//   - glam editorial photos (the proven 5-slide manila set) in cards 1-3
//   - aspirational hook line ("Want photos like these?") instead of deal framing
//   - "casting" selectivity framing; "free" appears once (the offer name itself)
//   - reassurance cut to a single "I direct every frame" (no "don't worry"/"act now")
//   - 7 cards instead of 10 (swipe-through decay buried v1's best images)
// Prints are matted at each photo's native aspect — no crops.
const CITIES = [
  { name: 'Varanasi', slug: 'varanasi' },
  { name: 'Kolkata', slug: 'kolkata' },
  { name: 'Jaipur', slug: 'jaipur' },
]

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const LARGE = '/Users/aidantorrence/Documents/aidan-modern/public/images/large'
const SELF = '/Users/aidantorrence/Documents/aidan-modern/public/images/self'

const HEAD = '/Users/aidantorrence/Documents/aidan-modern/public/images/headliners'

const enc = p => 'data:image/jpeg;base64,' + fs.readFileSync(p).toString('base64')
const L = f => enc(path.join(LARGE, f))
const H = f => enc(path.join(HEAD, f))
const Sf = f => enc(path.join(SELF, f))

const SE = "Georgia, 'Times New Roman', serif"
const RD = "'Poppins', 'Arial Rounded MT Bold', sans-serif"
const HW = "'Caveat', 'Bradley Hand', cursive"
const SH = 'text-shadow:0 2px 8px rgba(0,0,0,0.85),0 12px 50px rgba(0,0,0,0.6);'

// embed real fonts (base64) so they render reliably in headless chromium
const FDIR = path.join(__dirname, 'fonts')
const fontB64 = f => fs.readFileSync(path.join(FDIR, f)).toString('base64')
const face = (fam, file, weight) => `@font-face{font-family:'${fam}';font-weight:${weight};font-style:normal;font-display:block;src:url(data:font/woff2;base64,${fontB64(file)}) format('woff2');}`
const FONTCSS = [face('Poppins', 'poppins-700.woff2', '700'), face('Caveat', 'caveat-700.woff2', '700')].join('')

// city-independent helpers
const BADGE_BG = `<div style="position:absolute;top:0;right:0;width:620px;height:300px;z-index:55;pointer-events:none;background:radial-gradient(125% 125% at 100% 0%,rgba(0,0,0,0.6) 0%,rgba(0,0,0,0.3) 40%,transparent 70%);"></div>`
const grain = (o = 0.06) => `<div style="position:absolute;inset:0;pointer-events:none;opacity:${o};mix-blend-mode:soft-light;background-image:radial-gradient(circle at 14% 18%,rgba(255,255,255,0.5),transparent 17%),radial-gradient(circle at 84% 12%,rgba(255,255,255,0.28),transparent 15%),repeating-linear-gradient(0deg,rgba(255,255,255,0.08) 0 1px,transparent 1px 4px);"></div>`
const TITLE = (txt, size = 64) => `<p style="font-family:${SE};font-style:italic;font-size:${size}px;font-weight:700;color:#fff;margin:0;line-height:1.0;">${txt}</p>`
const cap = (big, small, pos = 'top:1120px') => `<div style="position:absolute;${pos};left:64px;right:64px;text-align:center;">
   <p style="font-family:${SE};font-style:italic;font-size:64px;font-weight:700;color:#fff;margin:0;line-height:1.02;${SH}">${big}</p>
   <p style="font-family:${SE};font-size:35px;font-style:italic;color:rgba(255,255,255,0.92);margin:18px 0 0;line-height:1.3;${SH}">${small}</p>
 </div>`
const proofScrim = 'linear-gradient(180deg,transparent 0%,transparent 40%,rgba(0,0,0,0.5) 60%,rgba(0,0,0,0.92) 100%)'
// film print matted at the photo's native aspect (w/h passed per photo — no crop)
const pr = (src, l, t, w, h, rot) => `<div style="position:absolute;left:${l}px;top:${t}px;width:${w + 24}px;height:${h + 26}px;background:#fafafa;padding:12px 12px 14px;transform:rotate(${rot}deg);box-shadow:0 16px 44px rgba(0,0,0,0.55),0 3px 10px rgba(0,0,0,0.3);"><img src="${src}" style="width:${w}px;height:${h}px;object-fit:cover;object-position:center;display:block;"/></div>`

// build the 7 slides for one city (only the location text varies)
function buildSlides({ name }) {
  const BADGE = `<div style="position:absolute;top:52px;right:54px;z-index:60;text-align:right;text-shadow:0 2px 12px rgba(0,0,0,0.95),0 1px 3px rgba(0,0,0,0.9);">
  <div style="font-family:${SE};font-size:50px;font-weight:700;letter-spacing:0.15em;color:#fff;line-height:1;">${name.toUpperCase()}</div>
  <div style="display:flex;align-items:center;justify-content:flex-end;gap:15px;margin-top:13px;">
    <span style="width:70px;height:2px;background:rgba(255,255,255,0.8);display:inline-block;"></span>
    <span style="font-family:${RD};font-size:22px;font-weight:600;letter-spacing:0.28em;color:#fff;">FREE PHOTO SHOOT</span>
  </div>
</div>`
  const frame = (inner, bg, showBadge = true) => `<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:${bg || '#000'};">${inner}${showBadge ? BADGE_BG + BADGE : ''}</div>`
  const bleed = (nm, src, overlay, scrim, showBadge = true) => {
    const sc = scrim || 'linear-gradient(180deg,rgba(0,0,0,0.45) 0%,transparent 30%,transparent 55%,rgba(0,0,0,0.9) 100%)'
    return { name: nm, html: frame(`<img src="${src}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center top;display:block;filter:saturate(1.06) contrast(1.03);"/><div style="position:absolute;inset:0;background:${sc};"></div>${overlay}${grain(0.08)}`, null, showBadge) }
  }

  const slides = []

  // 01 — HOOK: the proven 5-slide hero (chiaroscuro) + aspirational line, location BIG
  slides.push(bleed('01-hook', L('manila-gallery-urban-003.jpg'),
    `<div style="position:absolute;bottom:300px;left:64px;right:64px;text-align:center;">
       <p style="font-family:${SE};font-size:150px;font-weight:700;font-style:italic;color:#fff;margin:0;line-height:0.88;${SH}">${name}</p>
       <p style="font-family:${SE};font-size:80px;font-weight:700;font-style:italic;color:#fff;margin:10px 0 0;line-height:0.98;${SH}">Free Photo Shoot.</p>
       <p style="font-family:${SE};font-size:33px;font-style:italic;color:rgba(255,255,255,0.85);margin:30px 0 0;${SH}">Want photos like these? →</p>
     </div>`, undefined, false))

  // 02 — my recent work: the glam grid, up front (v1 buried its best images at cards 6-8)
  {
    const collage =
      pr(L('manila-gallery-dsc-0190.jpg'), 45, 470, 350, 531, -5) +
      pr(L('manila-gallery-canal-001.jpg'), 615, 430, 370, 553, 4) +
      pr(L('manila-gallery-dsc-0911.jpg'), 100, 1060, 360, 568, 3) +
      pr(L('manila-gallery-park-001.jpg'), 605, 1075, 370, 555, -4) +
      pr(L('manila-gallery-statue-001.jpg'), 360, 745, 340, 508, 2)
    slides.push({
      name: '02-work', html: frame(`
        <div style="position:absolute;top:200px;left:60px;right:60px;text-align:center;">${TITLE('my recent work')}</div>
        ${collage}
      ` + grain(), '#0a0a0a')
    })
  }

  // 03 — full-bleed editorial proof (red dress / green wall — strongest single frame)
  slides.push(bleed('03-proof', H('000050-6.jpg'), cap('shot on 35mm film', 'a full, directed editorial shoot.'), proofScrim))

  // 04 — casting framing (selective, not a giveaway; "free" not repeated in body)
  slides.push({
    name: '04-casting', html: frame(`
      <div style="position:absolute;top:240px;left:60px;right:60px;text-align:center;">${TITLE(`i'm casting in ${name}`)}</div>
      <div style="position:absolute;top:410px;left:110px;right:110px;text-align:center;">
        ${["i'm looking for faces to shoot with while i'm in the city.", "a full directed shoot on 35mm film.", "the edited photos are yours."].map((p, i) => `<p style="font-family:${SE};font-size:38px;color:rgba(255,255,255,0.95);line-height:1.3;margin:${i ? '22px' : '0'} 0 0;">${p}</p>`).join('')}
      </div>
      ${pr(L('manila-gallery-market-001.jpg'), 178, 790, 700, 1034, -1.5)}
    ` + grain(), '#0a0a0a')
  })

  // 05 — about me (trust/legitimacy; kept tight)
  slides.push({
    name: '05-about', html: frame(`
      <div style="position:absolute;top:240px;left:60px;right:60px;text-align:center;">${TITLE('about me')}</div>
      <div style="position:absolute;top:400px;left:120px;right:120px;text-align:center;">
        <p style="font-family:${SE};font-size:36px;color:rgba(255,255,255,0.94);line-height:1.42;margin:0;">hi, i'm aidan — a photographer from the USA. for the past 3 years i've been traveling the world shooting film.</p>
        <p style="font-family:${SE};font-size:36px;color:rgba(255,255,255,0.94);line-height:1.42;margin:24px 0 0;">right now i'm in India, and ${name} is next.</p>
        <p style="font-family:${SE};font-size:36px;color:rgba(255,255,255,0.94);line-height:1.42;margin:24px 0 0;">if you're here, let's make something special.</p>
      </div>
      <img src="${Sf('aidan-cropped-01.jpg')}" style="position:absolute;left:310px;top:880px;width:460px;height:580px;object-fit:cover;object-position:center top;display:block;border-radius:8px;"/>
    ` + grain(), '#0a0a0a')
  })

  // 06 — how it works (single reassurance line lives in step 3; no "don't worry" footer)
  slides.push({
    name: '06-how', html: frame(`
      <div style="position:absolute;top:250px;left:60px;right:60px;text-align:center;">${TITLE('how it works')}</div>
      <div style="position:absolute;top:500px;left:120px;right:120px;">
        ${[['1', 'Sign up', 'Tap the link below — takes a minute.'], ['2', 'We plan it', 'A quick chat to pick the spot, time & look.'], ['3', 'We shoot', 'About an hour. I direct every frame.']].map(s => `<div style="display:flex;gap:30px;align-items:flex-start;margin:0 0 58px;"><span style="font-family:${SE};font-size:78px;font-weight:700;color:rgba(255,255,255,0.5);line-height:0.85;">${s[0]}</span><div><p style="font-family:${SE};font-size:46px;font-weight:700;color:#fff;margin:0;">${s[1]}</p><p style="font-family:${SE};font-size:33px;color:rgba(255,255,255,0.62);margin:8px 0 0;line-height:1.3;">${s[2]}</p></div></div>`).join('')}
      </div>
    ` + grain(), '#0a0a0a')
  })

  // 07 — CTA (glam full-bleed; honest scarcity, no "act now"; text mid-lower, off the face)
  slides.push(bleed('07-cta', L('manila-gallery-ivy-002.jpg'),
    `<div style="position:absolute;top:980px;left:64px;right:64px;text-align:center;">
       <p style="font-family:${HW};font-size:138px;font-weight:700;color:#fff;margin:0;line-height:0.95;${SH}">Want in?</p>
       <p style="font-family:${HW};font-size:138px;font-weight:700;color:#fff;margin:0;line-height:0.95;${SH}">Sign up below.</p>
       <p style="font-family:${SE};font-size:34px;color:rgba(255,255,255,0.9);margin:34px 0 0;${SH}">I'm only in ${name} for a short time — let's shoot.</p>
     </div>`,
    proofScrim))

  return slides
}

async function render() {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 2 })
  const only = process.argv[2] // optional slug: render just one city, leave other outputs untouched
  for (const city of CITIES.filter(c => !only || c.slug === only)) {
    const slides = buildSlides(city)
    const dir = path.join(__dirname, `output-${city.slug}-story-v2`, city.slug)
    fs.mkdirSync(dir, { recursive: true })
    // clean stale slides so renamed/removed slides never linger (old + new mixed)
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
    console.log(`${city.name}: ${slides.length} slides -> ${dir}`)
  }
  await browser.close()
  console.log('Done.')
}
render()
