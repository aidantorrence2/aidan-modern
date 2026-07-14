import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

// === AHMEDABAD CHAT v1 — "d-chat" skeptic-conversation angle ===
// Adapts the Kolkata d-chat concept (render-kolkata-variations-v2j-nepal.mjs) to
// Ahmedabad: same chat visual idiom (bubbles, colors, radii, fonts), new copy.
//   01  hook — full-bleed, city HUGE + "free photo shoot." below
//   02  chat — "is this real?"       -> free TFP collab, we both get content
//   03  chat — "what's the catch?"   -> daytime public spots, you keep the scans
//   04  results — triptych of strong frames
//   05  chat — "okay… where?"        -> old-city pols / riverfront, about an hour
//   06  close — city HUGE + "free photo shoot" + sign-up line
// Canvas: 1080x1350 (4:5 — Meta carousel ratio). deviceScaleFactor 2 -> 2160x2700.
// All photos local (headliners + nepal-headliners); no SSD required.
const CITY = { name: 'Ahmedabad', slug: 'ahmedabad' }
const ONLY = process.argv.find(a => a.startsWith('--only='))?.split('=')[1]

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const HEAD = '/Users/aidantorrence/Documents/aidan-modern/public/images/headliners'
const NEPAL = '/Users/aidantorrence/Documents/aidan-modern/public/images/nepal-headliners'
const enc = p => 'data:image/jpeg;base64,' + fs.readFileSync(p).toString('base64')
const H = f => enc(path.join(HEAD, f))
const NP = f => enc(path.join(NEPAL, f))

const W = 1080, HT = 1350
const SE = "Georgia,'Times New Roman',serif"
const SA = 'Inter,-apple-system,system-ui,sans-serif'

const FDIR = path.join(__dirname, 'fonts')
const fontB64 = f => fs.readFileSync(path.join(FDIR, f)).toString('base64')
const face = (fam, file, weight) => `@font-face{font-family:'${fam}';font-weight:${weight};font-style:normal;font-display:block;src:url(data:font/woff2;base64,${fontB64(file)}) format('woff2');}`
const FONTCSS = face('Poppins', 'poppins-700.woff2', '700')
const SH = 'text-shadow:0 3px 6px rgba(0,0,0,1),0 10px 40px rgba(0,0,0,0.85),0 0 120px rgba(0,0,0,0.6);'
const GR = '<div style="position:absolute;inset:0;pointer-events:none;opacity:0.08;mix-blend-mode:soft-light;background-image:radial-gradient(circle at 14% 18%,rgba(255,255,255,0.5),transparent 17%),radial-gradient(circle at 84% 12%,rgba(255,255,255,0.28),transparent 15%);"></div>'

// Top-right campaign tag for every slide after the title slide (kolkata d-chat idiom).
const BADGE = `<p style="position:absolute;right:56px;top:52px;font-family:${SA};font-size:23px;font-weight:700;color:rgba(255,255,255,0.7);letter-spacing:0.12em;text-transform:uppercase;margin:0;text-align:right;${SH}">${CITY.name} · Free photo shoot</p>`
const withBadge = s => ({ ...s, html: s.html.slice(0, -'</div>'.length) + BADGE + '</div>' })

const img = (s, l, t, w, h, x = '') => `<img src="${s}" style="position:absolute;left:${l}px;top:${t}px;width:${w}px;height:${h}px;object-fit:cover;object-position:center top;display:block;${x}"/>`
const pr = (s, l, t, w, h, r, b = 12, op = 'center top') => `<div style="position:absolute;left:${l}px;top:${t}px;width:${w + b * 2}px;height:${h + b * 2}px;background:white;padding:${b}px;transform:rotate(${r}deg);box-shadow:0 8px 40px rgba(0,0,0,0.45),0 2px 8px rgba(0,0,0,0.2);"><img src="${s}" style="width:${w}px;height:${h}px;object-fit:cover;object-position:${op};display:block;"/></div>`

// Backgrounds (kolkata d-chat idiom, 4:5 canvas)
const dark = inner => `<div style="width:${W}px;height:${HT}px;position:relative;overflow:hidden;background:#0a0e08;"><div style="position:absolute;inset:0;background:linear-gradient(170deg,#0e1410 0%,#0a0e08 50%,#080c06 100%);"></div><div style="position:absolute;inset:0;background:radial-gradient(circle at 20% 18%,rgba(80,160,80,0.10),transparent 30%),radial-gradient(circle at 80% 82%,rgba(180,150,80,0.08),transparent 25%);"></div>${inner}${GR}</div>`
// `oversize` pushes baked-in film-scan borders off every edge (object-position
// alone can't — "center top" pins the scan's top border in view)
const heroHook = (s, inner, oversize) => {
  const ov = oversize ? 54 : 0
  const ovY = Math.round(ov * HT / W)
  return `<div style="width:${W}px;height:${HT}px;position:relative;overflow:hidden;background:#000;">${img(s, -ov, -ovY, W + 2 * ov, HT + 2 * ovY, 'filter:saturate(1.1) contrast(1.05);')}<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0.08) 0%,transparent 15%,rgba(0,0,0,0.35) 55%,rgba(0,0,0,0.96) 100%);"></div>${inner}${GR}</div>`
}

// 01 — hook. Kicker top, city HUGE + "free photo shoot." lower third; the whole
// headline block clears the bottom quadrant (ends ~y1005 of 1350).
function L_hook(s, z) {
  const tag = `<p style="position:absolute;left:56px;top:52px;font-family:${SA};font-size:23px;font-weight:700;color:rgba(255,255,255,0.7);letter-spacing:0.12em;text-transform:uppercase;margin:0;${SH}">${CITY.name} · Shot on 35mm film</p>`
  const h1 = `<div style="position:absolute;bottom:345px;left:56px;right:56px;"><p style="font-family:${SE};font-size:128px;font-weight:700;font-style:italic;color:white;line-height:0.92;margin:0;${SH}">${CITY.name}</p><p style="font-family:${SE};font-size:62px;font-weight:700;font-style:italic;color:white;line-height:1;margin:16px 0 0;${SH}">free photo shoot.</p></div>`
  return { name: '01-hook', html: heroHook(s, tag + h1, z) }
}

// DM-style conversation (kolkata L_chat idiom, compressed for 4:5). msgs = [{me?, t}]
function L_chat(nm, title, msgs) {
  let top = 386
  let rows = ''
  for (const m of msgs) {
    const lines = Math.ceil(m.t.length / 26)
    const h = 74 + (lines - 1) * 44
    rows += m.me
      ? `<div style="position:absolute;right:56px;top:${top}px;max-width:760px;background:linear-gradient(135deg,#2f6e4f,#245a40);border-radius:36px 36px 8px 36px;padding:26px 34px;box-shadow:0 6px 24px rgba(0,0,0,0.4);"><p style="font-family:${SA};font-size:33px;font-weight:500;color:#fff;line-height:1.32;margin:0;">${m.t}</p></div>`
      : `<div style="position:absolute;left:56px;top:${top}px;max-width:760px;background:rgba(255,255,255,0.10);border:1px solid rgba(255,255,255,0.08);border-radius:36px 36px 36px 8px;padding:26px 34px;"><p style="font-family:${SA};font-size:33px;font-weight:500;color:rgba(255,255,255,0.92);line-height:1.32;margin:0;">${m.t}</p></div>`
    top += h + 56
  }
  const head = `<div style="position:absolute;left:56px;right:56px;top:150px;"><p style="font-family:${SA};font-size:25px;font-weight:700;color:#dcbb7d;letter-spacing:0.14em;text-transform:uppercase;margin:0 0 20px;${SH}">Real questions I get</p><p style="font-family:${SE};font-size:60px;font-weight:700;font-style:italic;color:#fff;margin:0;line-height:0.98;${SH}">${title}</p></div>`
  return { name: nm, html: dark(head + rows) }
}

// 04 — results: staggered triptych of white-matted prints under a centered head.
function L_results(nm, ims) {
  const head = `<div style="position:absolute;left:56px;right:56px;top:104px;text-align:center;"><p style="font-family:${SA};font-size:25px;font-weight:700;color:#dcbb7d;letter-spacing:0.14em;text-transform:uppercase;margin:0 0 18px;${SH}">Recent work</p><p style="font-family:${SE};font-size:88px;font-weight:700;font-style:italic;color:#fff;margin:0;line-height:0.97;${SH}">the results</p></div>`
  const trip = pr(ims[0], 42, 356, 430, 560, -3)
    + pr(ims[1], 566, 430, 430, 560, 2.5)
    + pr(ims[2], 302, 738, 440, 566, 1)
  return { name: nm, html: dark(head + trip) }
}

// 06 — close: city HUGE + "free photo shoot" below + one low-pressure line.
// Text block ends ~y1000 — clear of the bottom quadrant.
function L_close(nm, s) {
  const scrim = 'linear-gradient(180deg,rgba(0,0,0,0.35) 0%,rgba(0,0,0,0.15) 30%,rgba(0,0,0,0.55) 60%,rgba(0,0,0,0.92) 100%)'
  const overlay = `<div style="position:absolute;top:470px;left:56px;right:56px;text-align:center;">
      <p style="font-family:${SE};font-size:140px;font-weight:700;font-style:italic;color:#fff;margin:0;line-height:0.92;${SH}">${CITY.name}</p>
      <p style="font-family:${SE};font-size:64px;font-weight:700;font-style:italic;color:rgba(255,255,255,0.95);margin:24px 0 0;line-height:1;${SH}">free photo shoot</p>
      <p style="font-family:${SA};font-size:31px;font-weight:500;color:rgba(255,255,255,0.85);margin:52px 0 0;letter-spacing:0.03em;${SH}">sign up below — takes a minute</p>
    </div>`
  return { name: nm, noBadge: true, html: `<div style="width:${W}px;height:${HT}px;position:relative;overflow:hidden;background:#000;"><img src="${s}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center top;display:block;filter:saturate(1.06) contrast(1.03);"/><div style="position:absolute;inset:0;background:${scrim};"></div>${overlay}${GR}</div>` }
}

function buildSlides() {
  return [
    L_hook(NP('DSC_0383.jpg'), true), // film scan — oversize clears baked borders
    L_chat('02-real', '&ldquo;Is this<br/>real?&rdquo;', [
      { t: 'hey! saw the free shoot thing in ahmedabad&hellip; is this real? 😅' },
      { me: true, t: 'yep, 100% real. it&rsquo;s a free TFP collab &mdash; we shoot together and we both get content for our portfolios.' },
    ]),
    L_chat('03-catch', '&ldquo;What&rsquo;s<br/>the catch?&rdquo;', [
      { t: 'okay but what&rsquo;s the catch?' },
      { me: true, t: 'no catch &mdash; we shoot in the daytime at public spots around the city.' },
      { me: true, t: 'and you keep the edited 35mm scans. every frame i finish is yours.' },
    ]),
    L_results('04-results', [H('000016-3.jpg'), H('DSC_0249.jpg'), H('000019-6.jpg')]),
    L_chat('05-where', '&ldquo;Okay&hellip;<br/>where?&rdquo;', [
      { t: 'okay i&rsquo;m in 👀 where would we shoot?' },
      { me: true, t: 'the old city &mdash; the pols near Manek Chowk, or the riverfront before sunset.' },
      { me: true, t: 'takes about an hour, whenever works for you.' },
    ]),
    L_close('06-close', H('000015-2.jpg')),
  ]
}

async function render() {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: W, height: HT }, deviceScaleFactor: 2 })
  const allSlides = buildSlides().map((s, i) => (i === 0 || s.noBadge) ? s : withBadge(s))
  const slides = ONLY ? allSlides.filter(s => s.name === ONLY) : allSlides
  if (slides.length === 0) throw new Error(`Unknown slide for --only: ${ONLY}`)
  const dir = path.join(__dirname, 'output-ahmedabad-chat-v1')
  fs.mkdirSync(dir, { recursive: true })
  if (!ONLY) for (const f of fs.readdirSync(dir)) if (f.toLowerCase().endsWith('.jpg')) fs.rmSync(path.join(dir, f))
  for (const s of slides) {
    const page = await ctx.newPage()
    await page.setContent(`<!doctype html><html><head><style>${FONTCSS}*{box-sizing:border-box}html,body{margin:0;width:${W}px;height:${HT}px;background:#000;overflow:hidden}body{-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}</style></head><body>${s.html}</body></html>`, { waitUntil: 'load' })
    await page.evaluate(() => document.fonts.ready)
    await page.waitForTimeout(250)
    await page.screenshot({ path: path.join(dir, `${s.name}.jpg`), type: 'jpeg', quality: 92 })
    await page.close()
  }
  console.log(`${CITY.name} chat-v1: ${slides.length} slides -> ${dir}`)
  await browser.close()
  console.log('Done.')
}
render()
