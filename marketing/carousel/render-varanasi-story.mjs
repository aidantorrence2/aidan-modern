import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

// Varanasi STORY carousel — offer-led spine (sell the free shoot; story = proof).
// Order: hook -> deal -> about -> work -> proofs -> how -> cta.
// Persistent "varanasi free photo shoot" badge top-right of every slide.
// big -> headliners/ , small -> faves/ , self -> self/

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, 'output-varanasi-story')
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

// persistent corner wordmark — refined editorial mark, top-right of every slide
const BADGE_BG = `<div style="position:absolute;top:0;right:0;width:620px;height:300px;z-index:55;pointer-events:none;background:radial-gradient(125% 125% at 100% 0%,rgba(0,0,0,0.6) 0%,rgba(0,0,0,0.3) 40%,transparent 70%);"></div>`
const BADGE = `<div style="position:absolute;top:52px;right:54px;z-index:60;text-align:right;text-shadow:0 2px 12px rgba(0,0,0,0.95),0 1px 3px rgba(0,0,0,0.9);">
  <div style="font-family:${SE};font-size:37px;font-weight:700;letter-spacing:0.17em;color:#fff;line-height:1;">VARANASI</div>
  <div style="display:flex;align-items:center;justify-content:flex-end;gap:13px;margin-top:11px;">
    <span style="width:56px;height:1.5px;background:rgba(255,255,255,0.75);display:inline-block;"></span>
    <span style="font-family:${RD};font-size:17px;font-weight:600;letter-spacing:0.3em;color:#fff;">FREE PHOTO SHOOT</span>
  </div>
</div>`
const frame = (inner, bg, showBadge = true) => `<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:${bg || '#000'};">${inner}${showBadge ? BADGE_BG + BADGE : ''}</div>`
const grain = (o = 0.06) => `<div style="position:absolute;inset:0;pointer-events:none;opacity:${o};mix-blend-mode:soft-light;background-image:radial-gradient(circle at 14% 18%,rgba(255,255,255,0.5),transparent 17%),radial-gradient(circle at 84% 12%,rgba(255,255,255,0.28),transparent 15%),repeating-linear-gradient(0deg,rgba(255,255,255,0.08) 0 1px,transparent 1px 4px);"></div>`
const photo = (src, w, h, l, t, rad = 8, pos = 'center top') => `<img src="${src}" style="position:absolute;left:${l}px;top:${t}px;width:${w}px;height:${h}px;object-fit:cover;object-position:${pos};display:block;border-radius:${rad}px;"/>`

function story(name, title, body, photosHtml) {
  return {
    name, html: frame(`
    <div style="position:absolute;top:150px;left:60px;right:60px;text-align:center;">${TITLE(title)}</div>
    <div style="position:absolute;top:300px;left:74px;right:74px;text-align:center;"><p style="font-family:${SE};font-size:38px;color:rgba(255,255,255,0.92);line-height:1.45;margin:0;">${body}</p></div>
    ${photosHtml || ''}` + grain(), '#0a0a0a')
  }
}
function bleed(name, src, overlay, scrim, showBadge = true) {
  const sc = scrim || 'linear-gradient(180deg,rgba(0,0,0,0.45) 0%,transparent 30%,transparent 55%,rgba(0,0,0,0.9) 100%)'
  return { name, html: frame(`<img src="${src}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center top;display:block;filter:saturate(1.06) contrast(1.03);"/><div style="position:absolute;inset:0;background:${sc};"></div>${overlay}${grain(0.08)}`, null, showBadge) }
}

// serif title style for section headings (replaces the old Poppins look)
const TITLE = (txt, size = 64) => `<p style="font-family:${SE};font-style:italic;font-size:${size}px;font-weight:700;color:#fff;margin:0;line-height:1.0;">${txt}</p>`

const slides = []

// 01 — HOOK (full-bleed work shot) — location BIG, Georgia
slides.push(bleed('01-hook', H('000016-7.jpg'),
  `<div style="position:absolute;bottom:300px;left:64px;right:64px;text-align:center;">
     <p style="font-family:${SE};font-size:150px;font-weight:700;font-style:italic;color:#fff;margin:0;line-height:0.88;${SH}">Varanasi</p>
     <p style="font-family:${SE};font-size:80px;font-weight:700;font-style:italic;color:#fff;margin:10px 0 0;line-height:0.98;${SH}">free photo shoot.</p>
     <p style="font-family:${SE};font-size:33px;font-style:italic;color:rgba(255,255,255,0.85);margin:30px 0 0;${SH}">Here's the deal →</p>
   </div>`, undefined, false))

// 02 — what you get (personal, natural copy — narrow column)
slides.push({
  name: '02-deal', html: frame(`
    <div style="position:absolute;top:240px;left:60px;right:60px;text-align:center;">${TITLE('here are the details')}</div>
    <div style="position:absolute;top:410px;left:120px;right:120px;text-align:center;">
      ${["we'll take photos on film", "i'll direct you throughout", "i'll send you the photos afterwards", "and it's totally free"].map((p, i) => `<p style="font-family:${SE};font-size:38px;color:rgba(255,255,255,0.95);line-height:1.3;margin:${i ? '22px' : '0'} 0 0;">${p}</p>`).join('')}
    </div>
    ${photo(H('000019-6.jpg'), 640, 870, 220, 880)}
  ` + grain(), '#0a0a0a')
})

// 03 — about me (professional, photographer-based) — text above, photo below
slides.push({
  name: '03-about', html: frame(`
    <div style="position:absolute;top:240px;left:60px;right:60px;text-align:center;">${TITLE('about me')}</div>
    <div style="position:absolute;top:400px;left:120px;right:120px;text-align:center;">
      <p style="font-family:${SE};font-size:36px;color:rgba(255,255,255,0.94);line-height:1.42;margin:0;">hi, i'm aidan. i'm a photographer from the united states. for the past 3 years i've been traveling the world taking photos and documenting my experiences.</p>
      <p style="font-family:${SE};font-size:36px;color:rgba(255,255,255,0.94);line-height:1.42;margin:24px 0 0;">currently i'm in india, looking to create something special. are you in varanasi?</p>
    </div>
    ${photo(Sf('aidan-cropped-01.jpg'), 460, 580, 310, 880, 8, 'center top')}
  ` + grain(), '#0a0a0a')
})

// 04 — some of my work (scattered film prints, portrait aspect kept)
// keeper = 000016-3 (chinese-characters print) at f[2]; rest swapped fresh
{
  const f = [Fv('000035-4.jpg'), Fv('000041.jpg'), Fv('000016-3.jpg'), Fv('0012_12-6.jpg'), Fv('000020-5.jpg')]
  const pr = (src, l, t, w, h, rot) => `<div style="position:absolute;left:${l}px;top:${t}px;width:${w + 24}px;height:${h + 24}px;background:#fafafa;padding:12px 12px 14px;transform:rotate(${rot}deg);box-shadow:0 16px 44px rgba(0,0,0,0.55),0 3px 10px rgba(0,0,0,0.3);"><img src="${src}" style="width:${w}px;height:${h}px;object-fit:cover;object-position:center top;display:block;"/></div>`
  const collage =
    pr(f[0], 50, 480, 350, 460, -5) +
    pr(f[1], 620, 440, 370, 490, 4) +
    pr(f[2], 110, 1010, 360, 480, 3) +
    pr(f[3], 600, 1020, 370, 490, -4) +
    pr(f[4], 370, 760, 340, 450, 2)   // center, on top — photo-pile
  slides.push({
    name: '04-work', html: frame(`
      <div style="position:absolute;top:200px;left:60px;right:60px;text-align:center;">${TITLE('some of my work')}</div>
      ${collage}
    ` + grain(), '#0a0a0a')
  })
}

// 05–08 — image proofs (each line busts an objection & nudges to sign up)
const cap = (big, small, pos = 'top:1120px') => `<div style="position:absolute;${pos};left:64px;right:64px;text-align:center;">
   <p style="font-family:${SE};font-style:italic;font-size:64px;font-weight:700;color:#fff;margin:0;line-height:1.02;${SH}">${big}</p>
   <p style="font-family:${SE};font-size:35px;font-style:italic;color:rgba(255,255,255,0.92);margin:18px 0 0;line-height:1.3;${SH}">${small}</p>
 </div>`
// scrim that darkens the lower-middle band where the (now lower) captions sit
const proofScrim = 'linear-gradient(180deg,transparent 0%,transparent 40%,rgba(0,0,0,0.5) 60%,rgba(0,0,0,0.92) 100%)'

// 05 — multi-image proof (triptych on black)
{
  const g = [Fv('000002-11.jpg'), Fv('000019-10.jpg'), Fv('000063.jpg')]
  const pr = (src, l, t, w, h, rot) => `<div style="position:absolute;left:${l}px;top:${t}px;width:${w + 22}px;height:${h + 22}px;background:#fafafa;padding:11px 11px 13px;transform:rotate(${rot}deg);box-shadow:0 14px 40px rgba(0,0,0,0.5),0 3px 9px rgba(0,0,0,0.3);"><img src="${src}" style="width:${w}px;height:${h}px;object-fit:cover;object-position:center top;display:block;"/></div>`
  // staggered: middle highest, left lower, right lowest
  const trip = pr(g[1], 305, 660, 480, 630, 1) + pr(g[0], -20, 900, 460, 600, -4) + pr(g[2], 630, 1010, 460, 600, 4)
  slides.push({
    name: '05-proof', html: frame(`
      <div style="position:absolute;top:220px;left:64px;right:64px;text-align:center;">
        ${TITLE('never done this before?', 60)}
        <p style="font-family:${SE};font-size:35px;color:rgba(255,255,255,0.85);margin:20px 0 0;line-height:1.3;">perfect — i'll direct you through every frame.</p>
      </div>
      ${trip}
    ` + grain(), '#0a0a0a')
  })
}
slides.push(bleed('06-proof', H('000050-6.jpg'), cap('shot on 35mm film', 'a full, directed shoot — completely free.'), proofScrim))
slides.push(bleed('07-proof', H('000001-8.jpg'), cap('the photos are yours', 'edited, high-res — sent straight to you.'), proofScrim))
slides.push(bleed('08-proof', H('000062-7.jpg'), cap('act now', 'before it’s too late →'), proofScrim))

// 09 — how it works
slides.push({
  name: '09-how', html: frame(`
    <div style="position:absolute;top:250px;left:60px;right:60px;text-align:center;">${TITLE('how it works')}</div>
    <div style="position:absolute;top:500px;left:120px;right:120px;">
      ${[['1', 'Sign up', 'Tap the link below — takes a minute.'], ['2', 'We plan it', 'A quick chat to pick the spot, time & look.'], ['3', 'We shoot', 'About an hour. I direct every frame.']].map(s => `<div style="display:flex;gap:30px;align-items:flex-start;margin:0 0 58px;"><span style="font-family:${SE};font-size:78px;font-weight:700;color:rgba(255,255,255,0.5);line-height:0.85;">${s[0]}</span><div><p style="font-family:${SE};font-size:46px;font-weight:700;color:#fff;margin:0;">${s[1]}</p><p style="font-family:${SE};font-size:33px;color:rgba(255,255,255,0.62);margin:8px 0 0;line-height:1.3;">${s[2]}</p></div></div>`).join('')}
    </div>
    <div style="position:absolute;bottom:230px;left:74px;right:74px;text-align:center;"><p style="font-family:${SE};font-size:34px;font-style:italic;color:rgba(255,255,255,0.6);margin:0;">No experience needed — that's my job.</p></div>
  ` + grain(), '#0a0a0a')
})

// 10 — CTA (full-bleed, handwritten, no @handle)
slides.push(bleed('10-cta', H('DSC_0249.jpg'),
  `<div style="position:absolute;top:250px;left:64px;right:64px;text-align:center;">
     <p style="font-family:${HW};font-size:138px;font-weight:700;color:#fff;margin:0;line-height:0.95;${SH}">Want in?</p>
     <p style="font-family:${HW};font-size:138px;font-weight:700;color:#fff;margin:0;line-height:0.95;${SH}">Sign up below.</p>
     <p style="font-family:${SE};font-size:34px;color:rgba(255,255,255,0.9);margin:34px 0 0;${SH}">A free photo shoot in Varanasi. I direct everything.</p>
   </div>`,
  'linear-gradient(180deg,rgba(0,0,0,0.9) 0%,rgba(0,0,0,0.5) 32%,rgba(0,0,0,0.12) 60%,rgba(0,0,0,0.5) 100%)'))

async function render() {
  const dir = path.join(OUT, 'varanasi'); fs.mkdirSync(dir, { recursive: true })
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
