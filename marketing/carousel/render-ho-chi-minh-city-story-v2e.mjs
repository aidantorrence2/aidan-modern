import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

// HO CHI MINH CITY STORY v2e — v2b with two image swaps:
//   - 04-nervous: nepal triptych → five-print collage (nature/000025-2, nature/000010-6,
//     nature/000041, faves/000018-8, faves/DSC_0960)
//   - 06-casting: manila market print → faves/DSC_0558 (white bodysuit in water)
// All prints matted at native aspect — no crops.
const CITY = { name: 'Ho Chi Minh City', slug: 'ho-chi-minh-city' }
const ONLY = process.argv.find(arg => arg.startsWith('--only='))?.split('=')[1]

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const LARGE = '/Users/aidantorrence/Documents/aidan-modern/public/images/large'
const SELF = '/Users/aidantorrence/Documents/aidan-modern/public/images/self'
const HEAD = '/Users/aidantorrence/Documents/aidan-modern/public/images/headliners'
const NATURE = '/Users/aidantorrence/Documents/aidan-modern/public/images/nature'
const FAVES = '/Users/aidantorrence/Documents/aidan-modern/public/images/faves'

const enc = p => 'data:image/jpeg;base64,' + fs.readFileSync(p).toString('base64')
const L = f => enc(path.join(LARGE, f))
const H = f => enc(path.join(HEAD, f))
const Sf = f => enc(path.join(SELF, f))
const NT = f => enc(path.join(NATURE, f))
const FV = f => enc(path.join(FAVES, f))

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
   ${small ? `<p style="font-family:${SE};font-size:35px;font-style:italic;color:rgba(255,255,255,0.92);margin:18px 0 0;line-height:1.3;${SH}">${small}</p>` : ''}
 </div>`
const proofScrim = 'linear-gradient(180deg,transparent 0%,transparent 40%,rgba(0,0,0,0.5) 60%,rgba(0,0,0,0.92) 100%)'
// film print matted at the photo's native aspect (w/h passed per photo — no crop)
const pr = (src, l, t, w, h, rot) => `<div style="position:absolute;left:${l}px;top:${t}px;width:${w + 24}px;height:${h + 26}px;background:#fafafa;padding:12px 12px 14px;transform:rotate(${rot}deg);box-shadow:0 16px 44px rgba(0,0,0,0.55),0 3px 10px rgba(0,0,0,0.3);"><img src="${src}" style="width:${w}px;height:${h}px;object-fit:cover;object-position:center;display:block;"/></div>`
// borderless print — no white mat, shadow only (scans keep their own film borders)
const prx = (src, l, t, w, h, rot) => `<div style="position:absolute;left:${l}px;top:${t}px;width:${w}px;height:${h}px;transform:rotate(${rot}deg);box-shadow:0 16px 44px rgba(0,0,0,0.55),0 3px 10px rgba(0,0,0,0.3);"><img src="${src}" style="width:${w}px;height:${h}px;object-fit:cover;object-position:center;display:block;"/></div>`
// borderless print cropped to a sub-rect of the source (trims the scan's white paper
// rebate, keeps the black film border). iw/ih = source px, cx/cy/cw/ch = crop box px.
const prt = (src, l, t, w, rot, iw, ih, cx, cy, cw, ch) => {
  const s = w / cw, h = Math.round(ch * s)
  return `<div style="position:absolute;left:${l}px;top:${t}px;width:${w}px;height:${h}px;overflow:hidden;transform:rotate(${rot}deg);box-shadow:0 16px 44px rgba(0,0,0,0.55),0 3px 10px rgba(0,0,0,0.3);"><img src="${src}" style="position:absolute;left:${-Math.round(cx * s)}px;top:${-Math.round(cy * s)}px;width:${Math.round(iw * s)}px;height:${Math.round(ih * s)}px;display:block;"/></div>`
}

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

  // 02 — my recent work: the glam grid, up front
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

  // 03 — about me (trust/legitimacy; haveli mirror selfie — camera in hand, on location in India)
  slides.push({
    name: '03-about', html: frame(`
      <div style="position:absolute;top:240px;left:60px;right:60px;text-align:center;">${TITLE('about me')}</div>
      <div style="position:absolute;top:400px;left:120px;right:120px;text-align:center;">
        <p style="font-family:${SE};font-size:36px;color:rgba(255,255,255,0.94);line-height:1.42;margin:0;">hi, i'm aidan — a photographer from the USA. for the past 3 years i've been traveling the world shooting film.</p>
        <p style="font-family:${SE};font-size:36px;color:rgba(255,255,255,0.94);line-height:1.42;margin:24px 0 0;">right now i'm in Vietnam, and i'm shooting in ${name}.</p>
        <p style="font-family:${SE};font-size:36px;color:rgba(255,255,255,0.94);line-height:1.42;margin:24px 0 0;">if you're here, let's make something special.</p>
      </div>
      <img src="${Sf('aidan-udaipur-mirror-03.jpg')}" style="position:absolute;left:310px;top:880px;width:460px;height:631px;object-fit:cover;object-position:center top;display:block;border-radius:28px;border:12px solid #fafafa;box-shadow:0 16px 44px rgba(0,0,0,0.55),0 3px 10px rgba(0,0,0,0.3);"/>
    ` + grain(), '#0a0a0a')
  })

  // 04 — never done this before? five-print staggered collage
  {
    const collage =
      prx(NT('000025-2.jpg'), 45, 500, 350, 520, -5) +
      prx(NT('000010-6.jpg'), 615, 460, 370, 549, 4) +
      prx(NT('000041.jpg'), 100, 1080, 360, 528, 3) +
      prx(FV('000018-8.jpg'), 605, 1090, 370, 552, -4) +
      prt(FV('DSC_0960.jpg'), 360, 775, 340, 2, 3114, 4761, 19, 29, 3049, 4699)
    slides.push({
      name: '04-nervous', html: frame(`
        <div style="position:absolute;top:220px;left:64px;right:64px;text-align:center;">
          ${TITLE('never done this before?', 60)}
          <p style="font-family:${SE};font-size:35px;color:rgba(255,255,255,0.85);margin:20px 0 0;line-height:1.3;">don't worry — i'll direct you through every frame.</p>
        </div>
        ${collage}
      ` + grain(), '#0a0a0a')
    })
  }

  // 05 — full-bleed editorial proof (red dress / green wall — strongest single frame)
  slides.push(bleed('05-proof', H('000050-6.jpg'), cap('shot on 35mm film', ''), proofScrim))

  // 06 — casting framing (selective, not a giveaway; "free" not repeated in body)
  slides.push({
    name: '06-casting', html: frame(`
      <div style="position:absolute;top:240px;left:60px;right:60px;text-align:center;">
        ${TITLE(`now in ${name}`)}
        <p style="font-family:${SE};font-size:38px;font-style:italic;color:rgba(255,255,255,0.85);margin:24px 0 0;line-height:1.3;">it's totally free</p>
      </div>
      ${prt(FV('DSC_0558.jpg'), 178, 620, 700, -1.5, 3624, 4768, 138, 57, 2979, 4511)}
    ` + grain(), '#0a0a0a')
  })

  // 07 — how it works (single reassurance line lives in step 3)
  slides.push({
    name: '07-how', html: frame(`
      <div style="position:absolute;top:250px;left:60px;right:60px;text-align:center;">${TITLE('how it works')}</div>
      <div style="position:absolute;top:500px;left:120px;right:120px;">
        ${[['1', 'Sign up', 'Tap the link below — takes a minute.'], ['2', 'We plan it', 'A quick chat to pick the spot, time & look.'], ['3', 'We shoot', 'About an hour. I direct every frame.']].map(s => `<div style="display:flex;gap:30px;align-items:flex-start;margin:0 0 58px;"><span style="font-family:${SE};font-size:78px;font-weight:700;color:rgba(255,255,255,0.5);line-height:0.85;">${s[0]}</span><div><p style="font-family:${SE};font-size:46px;font-weight:700;color:#fff;margin:0;">${s[1]}</p><p style="font-family:${SE};font-size:33px;color:rgba(255,255,255,0.62);margin:8px 0 0;line-height:1.3;">${s[2]}</p></div></div>`).join('')}
      </div>
    ` + grain(), '#0a0a0a')
  })

  // 08 — CTA (glam full-bleed; honest scarcity, no "act now"; text mid-lower, off the face)
  slides.push(bleed('08-cta', L('manila-gallery-ivy-002.jpg'),
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
  const allSlides = buildSlides(CITY)
  const slides = ONLY ? allSlides.filter(slide => slide.name === ONLY) : allSlides
  if (slides.length === 0) throw new Error(`Unknown slide for --only: ${ONLY}`)
  const dir = path.join(__dirname, `output-${CITY.slug}-story-v2e`, CITY.slug)
  fs.mkdirSync(dir, { recursive: true })
  // clean stale slides so renamed/removed slides never linger (old + new mixed)
  if (!ONLY) {
    for (const f of fs.readdirSync(dir)) {
      if (f.toLowerCase().endsWith('.jpg')) fs.rmSync(path.join(dir, f))
    }
  }
  for (const s of slides) {
    const page = await ctx.newPage()
    await page.setContent(`<!doctype html><html><head><style>${FONTCSS}*{box-sizing:border-box}html,body{margin:0;width:1080px;height:1920px;background:#000;overflow:hidden}body{-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}</style></head><body>${s.html}</body></html>`, { waitUntil: 'load' })
    await page.evaluate(() => document.fonts.ready)
    await page.waitForTimeout(300)
    await page.screenshot({ path: path.join(dir, `${s.name}.jpg`), type: 'jpeg', quality: 92 })
    await page.close()
  }
  console.log(`${CITY.name}: ${slides.length} slides -> ${dir}`)
  await browser.close()
  console.log('Done.')
}
render()
