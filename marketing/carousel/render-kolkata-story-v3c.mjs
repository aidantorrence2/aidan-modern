import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

// STORY v3 — KOLKATA. Base = the varanasi story (render-story.mjs, output-varanasi-story)
// with these changes:
//   + three d-chat text-message slides (prepare / makeup / where) inserted after 05-proof
//     (copy identical to kolkata-variations v2m-nepal)
//   04-work: print-pile images swapped to Nepal faves (v3c)
//   05-proof: triptych images swapped to Nepal faves (SSD must be mounted)
//   08-proof: IMAGE swapped to v2m-nepal slide-1 photo (DSC_0383); base 'act now' text kept (v3b)
//   09-how: 'We plan it' desc -> 'We will discuss the location, outfit, and timing.';
//           'I direct every frame' -> 'I will guide you'
//   10-cta: REPLACED by v2m-nepal closing (d-chat-09: 'Want in? / Sign up below.' over DSC_0315)
const CITY = { name: 'Kolkata', slug: 'kolkata' }

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const HEAD = '/Users/aidantorrence/Documents/aidan-modern/public/images/headliners'
const FAVE = '/Users/aidantorrence/Documents/aidan-modern/public/images/faves'
const SELF = '/Users/aidantorrence/Documents/aidan-modern/public/images/self'
const NEPAL = '/Volumes/PortableSSD/Exports/nepal faves'

const enc = p => 'data:image/jpeg;base64,' + fs.readFileSync(p).toString('base64')
const H = f => enc(path.join(HEAD, f))
const Fv = f => enc(path.join(FAVE, f))
const Sf = f => enc(path.join(SELF, f))
const NP = f => enc(path.join(NEPAL, f))

const SE = "Georgia, 'Times New Roman', serif"
const RD = "'Poppins', 'Arial Rounded MT Bold', sans-serif"
const HW = "'Caveat', 'Bradley Hand', cursive"
const SA = "Inter,-apple-system,system-ui,sans-serif"
const SH = 'text-shadow:0 2px 8px rgba(0,0,0,0.85),0 12px 50px rgba(0,0,0,0.6);'
// heavier shadow used by the kolkata-variations slides being transplanted
const SHV = 'text-shadow:0 3px 6px rgba(0,0,0,1),0 10px 40px rgba(0,0,0,0.85),0 0 120px rgba(0,0,0,0.6);'

// embed real fonts (base64) so they render reliably in headless chromium
const FDIR = path.join(__dirname, 'fonts')
const fontB64 = f => fs.readFileSync(path.join(FDIR, f)).toString('base64')
const face = (fam, file, weight) => `@font-face{font-family:'${fam}';font-weight:${weight};font-style:normal;font-display:block;src:url(data:font/woff2;base64,${fontB64(file)}) format('woff2');}`
const FONTCSS = [face('Poppins', 'poppins-700.woff2', '700'), face('Caveat', 'caveat-700.woff2', '700')].join('')

// city-independent helpers
const BADGE_BG = `<div style="position:absolute;top:0;right:0;width:620px;height:300px;z-index:55;pointer-events:none;background:radial-gradient(125% 125% at 100% 0%,rgba(0,0,0,0.6) 0%,rgba(0,0,0,0.3) 40%,transparent 70%);"></div>`
const grain = (o = 0.06) => `<div style="position:absolute;inset:0;pointer-events:none;opacity:${o};mix-blend-mode:soft-light;background-image:radial-gradient(circle at 14% 18%,rgba(255,255,255,0.5),transparent 17%),radial-gradient(circle at 84% 12%,rgba(255,255,255,0.28),transparent 15%),repeating-linear-gradient(0deg,rgba(255,255,255,0.08) 0 1px,transparent 1px 4px);"></div>`
const photo = (src, w, h, l, t, rad = 8, pos = 'center top') => `<img src="${src}" style="position:absolute;left:${l}px;top:${t}px;width:${w}px;height:${h}px;object-fit:cover;object-position:${pos};display:block;border-radius:${rad}px;"/>`
const TITLE = (txt, size = 64) => `<p style="font-family:${SE};font-style:italic;font-size:${size}px;font-weight:700;color:#fff;margin:0;line-height:1.0;">${txt}</p>`
const cap = (big, small, pos = 'top:1120px') => `<div style="position:absolute;${pos};left:64px;right:64px;text-align:center;">
   <p style="font-family:${SE};font-style:italic;font-size:64px;font-weight:700;color:#fff;margin:0;line-height:1.02;${SH}">${big}</p>
   <p style="font-family:${SE};font-size:35px;font-style:italic;color:rgba(255,255,255,0.92);margin:18px 0 0;line-height:1.3;${SH}">${small}</p>
 </div>`
const proofScrim = 'linear-gradient(180deg,transparent 0%,transparent 40%,rgba(0,0,0,0.5) 60%,rgba(0,0,0,0.92) 100%)'

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

  // Dark green gradient inner layers (transplanted from the kolkata-variations dark() bg)
  const DARKBG = `<div style="position:absolute;inset:0;background:linear-gradient(170deg,#0e1410 0%,#0a0e08 50%,#080c06 100%);"></div><div style="position:absolute;inset:0;background:radial-gradient(circle at 20% 18%,rgba(80,160,80,0.10),transparent 30%),radial-gradient(circle at 80% 82%,rgba(180,150,80,0.08),transparent 25%);"></div>`

  // DM-style conversation slide (transplanted from kolkata-variations v2m-nepal)
  const chat = (nm, title, msgs) => {
    let top = 560
    let rows = ''
    for (const m of msgs) {
      const lines = Math.ceil(m.t.length / 26)
      const h = 74 + (lines - 1) * 44
      rows += m.me
        ? `<div style="position:absolute;right:74px;top:${top}px;max-width:720px;background:linear-gradient(135deg,#2f6e4f,#245a40);border-radius:36px 36px 8px 36px;padding:26px 34px;box-shadow:0 6px 24px rgba(0,0,0,0.4);"><p style="font-family:${SA};font-size:33px;font-weight:500;color:#fff;line-height:1.32;margin:0;">${m.t}</p></div>`
        : `<div style="position:absolute;left:74px;top:${top}px;max-width:720px;background:rgba(255,255,255,0.10);border:1px solid rgba(255,255,255,0.08);border-radius:36px 36px 36px 8px;padding:26px 34px;"><p style="font-family:${SA};font-size:33px;font-weight:500;color:rgba(255,255,255,0.92);line-height:1.32;margin:0;">${m.t}</p></div>`
      top += h + 66
    }
    const head = `<div style="position:absolute;left:74px;right:74px;top:320px;"><p style="font-family:${SA};font-size:25px;font-weight:700;color:#dcbb7d;letter-spacing:0.14em;text-transform:uppercase;margin:0 0 20px;${SHV}">Real questions I get</p><p style="font-family:${SE};font-size:64px;font-weight:700;font-style:italic;color:#fff;margin:0;line-height:0.98;${SHV}">${title}</p></div>`
    return { name: nm, html: frame(DARKBG + head + rows + grain(), '#0a0e08') }
  }

  const slides = []

  // 01 — HOOK (full-bleed) — location BIG
  slides.push(bleed('01-hook', H('000016-7.jpg'),
    `<div style="position:absolute;bottom:300px;left:64px;right:64px;text-align:center;">
       <p style="font-family:${SE};font-size:150px;font-weight:700;font-style:italic;color:#fff;margin:0;line-height:0.88;${SH}">${name}</p>
       <p style="font-family:${SE};font-size:80px;font-weight:700;font-style:italic;color:#fff;margin:10px 0 0;line-height:0.98;${SH}">Free Photo Shoot.</p>
       <p style="font-family:${SE};font-size:33px;font-style:italic;color:rgba(255,255,255,0.85);margin:30px 0 0;${SH}">Here's the deal →</p>
     </div>`, undefined, false))

  // 02 — it's simple (the deal)
  slides.push({
    name: '02-deal', html: frame(`
      <div style="position:absolute;top:240px;left:60px;right:60px;text-align:center;">${TITLE("it's simple")}</div>
      <div style="position:absolute;top:410px;left:120px;right:120px;text-align:center;">
        ${["we'll take photos on film.", "i'll direct you throughout.", "i'll send you the photos afterwards.", "and it's totally free."].map((p, i) => `<p style="font-family:${SE};font-size:38px;color:rgba(255,255,255,0.95);line-height:1.3;margin:${i ? '22px' : '0'} 0 0;">${p}</p>`).join('')}
      </div>
      ${photo(H('000019-6.jpg'), 770, 1020, 155, 800)}
    ` + grain(), '#0a0a0a')
  })

  // 03 — about me (professional, text above photo)
  slides.push({
    name: '03-about', html: frame(`
      <div style="position:absolute;top:240px;left:60px;right:60px;text-align:center;">${TITLE('about me')}</div>
      <div style="position:absolute;top:400px;left:120px;right:120px;text-align:center;">
        <p style="font-family:${SE};font-size:36px;color:rgba(255,255,255,0.94);line-height:1.42;margin:0;">hi, i'm aidan. i'm a photographer from USA. for the past 3 years i've been traveling the world taking photos and documenting my experiences.</p>
        <p style="font-family:${SE};font-size:36px;color:rgba(255,255,255,0.94);line-height:1.42;margin:24px 0 0;">currently i'm in India, looking to create something special.</p>
        <p style="font-family:${SE};font-size:36px;color:rgba(255,255,255,0.94);line-height:1.42;margin:24px 0 0;">if you're in ${name}, let's chat.</p>
      </div>
      ${photo(Sf('aidan-cropped-01.jpg'), 460, 580, 310, 880, 8, 'center top')}
    ` + grain(), '#0a0a0a')
  })

  // 04 — some of my work (film-print pile) — NEPAL faves (v3c)
  {
    const f = [NP('DSC_0020-2.jpg'), NP('DSC_0330.jpg'), NP('DSC_0404.jpg'), NP('DSC_0166.jpg'), NP('DSC_0299.jpg')]
    const pr = (src, l, t, w, h, rot) => `<div style="position:absolute;left:${l}px;top:${t}px;width:${w + 24}px;height:${h + 24}px;background:#fafafa;padding:12px 12px 14px;transform:rotate(${rot}deg);box-shadow:0 16px 44px rgba(0,0,0,0.55),0 3px 10px rgba(0,0,0,0.3);"><img src="${src}" style="width:${w}px;height:${h}px;object-fit:cover;object-position:center top;display:block;"/></div>`
    const collage =
      pr(f[0], 50, 480, 350, 460, -5) +
      pr(f[1], 620, 440, 370, 490, 4) +
      pr(f[2], 110, 1010, 360, 480, 3) +
      pr(f[3], 600, 1020, 370, 490, -4) +
      pr(f[4], 370, 760, 340, 450, 2)
    slides.push({
      name: '04-work', html: frame(`
        <div style="position:absolute;top:200px;left:60px;right:60px;text-align:center;">${TITLE('some of my work')}</div>
        ${collage}
      ` + grain(), '#0a0a0a')
    })
  }

  // 05 — multi-image proof (staggered triptych on black) — NEPAL faves (v3)
  {
    const g = [Fv('000002-11.jpg'), Fv('000019-10.jpg'), Fv('000010-6.jpg')]
    const n = [NP('DSC_0242.jpg'), NP('DSC_0093.jpg'), NP('DSC_0307.jpg')]
    const pr = (src, l, t, w, h, rot) => `<div style="position:absolute;left:${l}px;top:${t}px;width:${w + 22}px;height:${h + 22}px;background:#fafafa;padding:11px 11px 13px;transform:rotate(${rot}deg);box-shadow:0 14px 40px rgba(0,0,0,0.5),0 3px 9px rgba(0,0,0,0.3);"><img src="${src}" style="width:${w}px;height:${h}px;object-fit:cover;object-position:center top;display:block;"/></div>`
    const trip = pr(n[1], 305, 520, 470, 620, 1) + pr(n[0], -25, 870, 455, 595, -4) + pr(n[2], 480, 1215, 455, 595, 4)
    slides.push({
      name: '05-proof', html: frame(`
        <div style="position:absolute;top:220px;left:64px;right:64px;text-align:center;">
          ${TITLE('never done this before?', 60)}
          <p style="font-family:${SE};font-size:35px;color:rgba(255,255,255,0.85);margin:20px 0 0;line-height:1.3;">don't worry — i'll direct you through every frame.</p>
        </div>
        ${trip}
      ` + grain(), '#0a0a0a')
    })
  }

  // 05b–05d — the text-message slides (from kolkata-variations v2m-nepal)
  slides.push(chat('05b-chat', '&ldquo;So what do<br/>I prepare?&rdquo;', [
    { t: 'hey! saw the free shoot — what do I need to prepare? 😅' },
    { me: true, t: 'honestly? not much. we just need to figure out the outfit and a location that works.' },
  ]))
  slides.push(chat('05c-chat', '&ldquo;Makeup?<br/>Posing?&rdquo;', [
    { t: 'do I need a makeup artist? I&rsquo;ve never modeled before…' },
    { me: true, t: 'nope you don&rsquo;t need to do makeup, light and natural is my preference or even no makeup is fine.' },
    { me: true, t: 'posing, angles, light — that&rsquo;s my job, not yours.' },
  ]))
  slides.push(chat('05d-chat', '&ldquo;Okay…<br/>where?&rdquo;', [
    { t: 'okay I&rsquo;m in 👀 where would we shoot?' },
    { me: true, t: 'maybe one of the ghats? like Kumartuli Ghat or Champatala Ghat?' },
    { me: true, t: 'we can shoot during the day, maybe before sunset. it takes around an hour.' },
  ]))

  // 06–07 — full-bleed proofs (objection-busting caption + nudge)
  slides.push(bleed('06-proof', H('000050-6.jpg'), cap('shot on 35mm film', 'a full, directed shoot — completely free.'), proofScrim))
  slides.push(bleed('07-proof', H('000001-8.jpg'), cap('the photos are yours', 'edited, high-res — sent straight to you.'), proofScrim))

  // 08 — base 'act now' slide, IMAGE swapped to the v2m-nepal hook photo (DSC_0383)
  slides.push(bleed('08-proof', NP('DSC_0383.jpg'), cap('act now', 'before it’s too late →'), proofScrim))

  // 09 — how it works (v3 copy: plan desc + guide line)
  slides.push({
    name: '09-how', html: frame(`
      <div style="position:absolute;top:250px;left:60px;right:60px;text-align:center;">${TITLE('how it works')}</div>
      <div style="position:absolute;top:500px;left:120px;right:120px;">
        ${[['1', 'Sign up', 'Tap the link below — takes a minute.'], ['2', 'We plan it', 'We will discuss the location, outfit, and timing.'], ['3', 'We shoot', 'About an hour. I will guide you.']].map(s => `<div style="display:flex;gap:30px;align-items:flex-start;margin:0 0 58px;"><span style="font-family:${SE};font-size:78px;font-weight:700;color:rgba(255,255,255,0.5);line-height:0.85;">${s[0]}</span><div><p style="font-family:${SE};font-size:46px;font-weight:700;color:#fff;margin:0;">${s[1]}</p><p style="font-family:${SE};font-size:33px;color:rgba(255,255,255,0.62);margin:8px 0 0;line-height:1.3;">${s[2]}</p></div></div>`).join('')}
      </div>
      <div style="position:absolute;bottom:230px;left:74px;right:74px;text-align:center;"><p style="font-family:${SE};font-size:34px;font-style:italic;color:rgba(255,255,255,0.6);margin:0;">No experience needed — that's my job.</p></div>
    ` + grain(), '#0a0a0a')
  })

  // 10 — CTA: v2m-nepal closing transplant (d-chat-09) — 'Want in? / Sign up below.' over DSC_0315
  slides.push(bleed('10-cta', NP('DSC_0315.jpg'),
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
  const slides = buildSlides(CITY)
  const dir = path.join(__dirname, `output-${CITY.slug}-story-v3c`, CITY.slug)
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
  console.log(`${CITY.name}: ${slides.length} slides -> ${dir}`)
  await browser.close()
  console.log('Done.')
}
render()
