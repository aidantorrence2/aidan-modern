import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

// Delhi — 3 REDESIGNED 5-slide carousel variations.
//   big images  -> public/images/headliners (16 hero shots)
//   small images-> public/images/faves (182 favorites)
// Variation A: full-bleed editorial   B: dark gallery wall   C: cream magazine

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, 'output-delhi-redesign')
const HEAD = '/Users/aidantorrence/Documents/aidan-modern/public/images/headliners'
const FAVE = '/Users/aidantorrence/Documents/aidan-modern/public/images/faves'
fs.mkdirSync(OUT, { recursive: true })

const enc = p => 'data:image/jpeg;base64,' + fs.readFileSync(p).toString('base64')
const H = f => enc(path.join(HEAD, f))
const faveFiles = fs.readdirSync(FAVE).filter(f => /\.jpe?g$/i.test(f)).sort()
const F = f => enc(path.join(FAVE, f))
// deterministic spread of n faves starting at offset
function favs(off, n) {
  const a = []
  for (let i = 0; i < n; i++) a.push(F(faveFiles[(off + i * 7) % faveFiles.length]))
  return a
}

const SE = "Georgia, 'Times New Roman', serif"
const SA = "Inter, -apple-system, system-ui, sans-serif"
const SH = 'text-shadow:0 2px 6px rgba(0,0,0,0.9),0 10px 40px rgba(0,0,0,0.6);'

function grain(o = 0.08) {
  return `<div style="position:absolute;inset:0;pointer-events:none;opacity:${o};mix-blend-mode:soft-light;background-image:radial-gradient(circle at 14% 18%,rgba(255,255,255,0.5),transparent 17%),radial-gradient(circle at 84% 12%,rgba(255,255,255,0.28),transparent 15%),repeating-linear-gradient(0deg,rgba(255,255,255,0.08) 0 1px,transparent 1px 4px);"></div>`
}
function frame(w, h) { return `width:1080px;height:1920px;position:relative;overflow:hidden;` + (w || '') }
// white-bordered print
function print(src, l, t, w, h, rot, b) {
  b = b || 12
  return `<div style="position:absolute;left:${l}px;top:${t}px;width:${w + b * 2}px;height:${h + b * 2}px;background:#fff;padding:${b}px;transform:rotate(${rot}deg);box-shadow:0 10px 40px rgba(0,0,0,0.45),0 2px 8px rgba(0,0,0,0.25);"><img src="${src}" style="width:${w}px;height:${h}px;object-fit:cover;object-position:center top;display:block;"/></div>`
}
function full(src, filt) { return `<img src="${src}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center top;display:block;filter:${filt || 'saturate(1.08) contrast(1.04)'};"/>` }

const STEPS = ['Sign up — it’s free, takes a minute', 'We chat and plan your shoot', 'Show up — I direct every frame']
const GETS = ['A guided shoot — I direct you throughout', 'Edited photos, ready to post', 'Help with vibe, outfits & locations', 'Direct line to me, start to finish']

// ============ VARIATION A — FULL-BLEED EDITORIAL ============
function variantA() {
  const heroes = { hook: '000016-3.jpg', how: '000020-5.jpg', what: '000038-4.jpg', cta: 'DSC_0526.jpg' }
  const grid = favs(3, 6)
  const dim = 'linear-gradient(180deg,rgba(0,0,0,0.32) 0%,transparent 22%,transparent 50%,rgba(0,0,0,0.94) 100%)'
  const panel = (top, inner) => `<div style="position:absolute;left:0;right:0;top:${top}px;bottom:0;background:linear-gradient(180deg,transparent,rgba(0,0,0,0.86) 24%,rgba(0,0,0,0.92));"></div><div style="position:absolute;left:72px;right:72px;top:${top + 120}px;">${inner}</div>`
  const kick = t => `<p style="font-family:${SA};font-size:25px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.62);margin:0 0 18px;${SH}">${t}</p>`
  const slides = []
  // 01 hook
  slides.push({ name: 'a-01-hook', html: `<div style="${frame('background:#000;')}">${full(H(heroes.hook))}<div style="position:absolute;inset:0;background:${dim};"></div><div style="position:absolute;bottom:250px;left:72px;right:72px;">${kick('Shot on 35mm film')}<h1 style="font-family:${SE};font-size:150px;font-weight:700;font-style:italic;color:#fff;line-height:0.86;margin:0;${SH}">Delhi</h1><h2 style="font-family:${SE};font-size:86px;font-weight:700;font-style:italic;color:#fff;line-height:0.95;margin:14px 0 0;${SH}">free photo<br/>shoot.</h2><p style="font-family:${SA};font-size:32px;color:rgba(255,255,255,0.8);margin:28px 0 0;${SH}">Want photos like these? No experience needed.</p></div>${grain(0.1)}</div>` })
  // 02 work — contact-sheet of faves
  const cells = grid.map((s, i) => `<div style="overflow:hidden;border-radius:4px;"><img src="${s}" style="width:100%;height:100%;object-fit:cover;object-position:center top;display:block;"/></div>`).join('')
  slides.push({ name: 'a-02-work', html: `<div style="${frame('background:#0b0b0d;')}"><div style="position:absolute;top:150px;left:72px;right:72px;">${kick('Recent work')}<h2 style="font-family:${SE};font-size:78px;font-weight:700;font-style:italic;color:#fff;margin:0;line-height:0.95;">A few from<br/>the book.</h2></div><div style="position:absolute;top:520px;left:48px;right:48px;bottom:160px;display:grid;grid-template-columns:1fr 1fr;grid-auto-rows:1fr;gap:18px;">${cells}</div><div style="position:absolute;bottom:70px;left:0;right:0;text-align:center;"><p style="font-family:${SA};font-size:26px;color:rgba(255,255,255,0.5);margin:0;">No experience needed · I direct everything</p></div>${grain(0.06)}</div>` })
  // 03 how
  slides.push({ name: 'a-03-how', html: `<div style="${frame('background:#000;')}">${full(H(heroes.how))}${panel(980, kick('How it works') + STEPS.map((s, i) => `<div style="display:flex;gap:22px;align-items:baseline;margin:0 0 22px;"><span style="font-family:${SE};font-size:46px;font-style:italic;font-weight:700;color:#e9c986;${SH}">${i + 1}</span><span style="font-family:${SA};font-size:34px;color:rgba(255,255,255,0.92);line-height:1.3;${SH}">${s}</span></div>`).join(''))}${grain(0.1)}</div>` })
  // 04 what
  slides.push({ name: 'a-04-what', html: `<div style="${frame('background:#000;')}">${full(H(heroes.what))}${panel(900, kick('All of this · for free') + GETS.map(s => `<div style="display:flex;gap:18px;align-items:baseline;margin:0 0 18px;"><span style="font-family:${SE};font-size:34px;color:#e9c986;${SH}">—</span><span style="font-family:${SA};font-size:33px;color:rgba(255,255,255,0.92);line-height:1.3;${SH}">${s}</span></div>`).join(''))}${grain(0.1)}</div>` })
  // 05 cta
  slides.push({ name: 'a-05-cta', html: `<div style="${frame('background:#000;')}">${full(H(heroes.cta), 'saturate(1.05) brightness(0.6)')}<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0.45) 0%,rgba(0,0,0,0.2) 35%,rgba(0,0,0,0.92) 100%);"></div><div style="position:absolute;bottom:330px;left:72px;right:72px;">${kick('Sign up')}<h2 style="font-family:${SE};font-size:120px;font-weight:700;font-style:italic;color:#fff;line-height:0.92;margin:0;${SH}">Your turn.</h2><p style="font-family:${SA};font-size:35px;color:rgba(255,255,255,0.9);line-height:1.4;margin:32px 0 0;${SH}">Tap the link to sign up for a free photo shoot in Delhi.</p><p style="font-family:${SA};font-size:30px;color:rgba(255,255,255,0.6);line-height:1.4;margin:16px 0 0;${SH}">Pick your vibe, send a selfie — I’ll plan the rest.</p></div>${grain(0.1)}</div>` })
  return slides
}

// ============ VARIATION B — DARK GALLERY WALL ============
function variantB() {
  const heroes = { hook: 'DSC_0321.jpg', how: '000041.jpg', cta: '000036-5.jpg' }
  const wall = favs(20, 5)
  const what = favs(60, 4)
  const gbg = inner => `<div style="${frame('background:#0d0e10;')}"><div style="position:absolute;inset:0;background:radial-gradient(circle at 30% 20%,#17181c,transparent 55%),linear-gradient(160deg,#101113,#0a0a0c);"></div>${inner}${grain(0.07)}</div>`
  const kick = t => `<p style="font-family:${SA};font-size:24px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.45);margin:0 0 14px;">${t}</p>`
  const slides = []
  // 01 hook — big framed headliner + caption
  slides.push({ name: 'b-01-hook', html: gbg(`<div style="position:absolute;top:90px;left:0;right:0;text-align:center;">${kick('Open call · Free film shoot')}</div>${print(H(heroes.hook), 215, 200, 650, 940, -1.5, 20)}<div style="position:absolute;bottom:150px;left:72px;right:72px;text-align:center;"><h1 style="font-family:${SE};font-size:138px;font-weight:700;font-style:italic;color:#fff;line-height:0.9;margin:0;">Delhi</h1><h2 style="font-family:${SE};font-size:62px;font-weight:700;font-style:italic;color:#fff;line-height:0.98;margin:8px 0 0;">free photo shoot.</h2><p style="font-family:${SA};font-size:29px;color:rgba(255,255,255,0.55);margin:20px 0 0;">No experience needed. I direct everything.</p></div>`) })
  // 02 work — gallery wall of faves
  slides.push({ name: 'b-02-work', html: gbg(`<div style="position:absolute;top:120px;left:72px;right:72px;">${kick('Recent work')}<h2 style="font-family:${SE};font-size:74px;font-weight:700;font-style:italic;color:#fff;margin:0;">The gallery.</h2></div>${print(wall[0], 60, 420, 380, 480, -3.5)}${print(wall[1], 560, 360, 440, 540, 3)}${print(wall[2], 120, 980, 420, 520, 2.2)}${print(wall[3], 600, 980, 400, 500, -2.5)}${print(wall[4], 360, 1420, 380, 420, 1.5)}`) })
  // 03 how — big print left, steps right
  slides.push({ name: 'b-03-how', html: gbg(`${print(H(heroes.how), -70, 250, 560, 1340, -2, 16)}<div style="position:absolute;top:300px;left:560px;right:60px;">${kick('How it works')}<h2 style="font-family:${SE};font-size:60px;font-weight:700;font-style:italic;color:#fff;margin:0 0 40px;">Super<br/>simple.</h2>${STEPS.map((s, i) => `<div style="margin:0 0 34px;"><div style="font-family:${SA};display:inline-flex;align-items:center;justify-content:center;width:50px;height:50px;border-radius:50%;border:2px solid #e9c986;color:#e9c986;font-size:24px;font-weight:700;margin:0 0 12px;">${i + 1}</div><p style="font-family:${SA};font-size:30px;color:rgba(255,255,255,0.85);line-height:1.3;margin:0;">${s}</p></div>`).join('')}</div>`) })
  // 04 what — fave cluster + list
  slides.push({ name: 'b-04-what', html: gbg(`<div style="position:absolute;top:120px;left:72px;right:72px;">${kick('All of this · free')}<h2 style="font-family:${SE};font-size:66px;font-weight:700;font-style:italic;color:#fff;margin:0;">What you get.</h2></div>${print(what[0], 80, 360, 280, 350, -4)}${print(what[1], 360, 330, 280, 350, 2.5)}${print(what[2], 640, 360, 290, 360, -2)}<div style="position:absolute;bottom:170px;left:72px;right:72px;">${GETS.map(s => `<div style="display:flex;gap:16px;align-items:baseline;margin:0 0 18px;"><span style="font-family:${SE};font-size:32px;color:#e9c986;">—</span><span style="font-family:${SA};font-size:31px;color:rgba(255,255,255,0.9);line-height:1.3;">${s}</span></div>`).join('')}</div>`) })
  // 05 cta
  slides.push({ name: 'b-05-cta', html: gbg(`<div style="position:absolute;top:150px;left:0;right:0;text-align:center;">${kick('Sign up · Delhi')}</div>${print(H(heroes.cta), 230, 230, 620, 900, 1.5, 20)}<div style="position:absolute;bottom:230px;left:72px;right:72px;text-align:center;"><h2 style="font-family:${SE};font-size:104px;font-weight:700;font-style:italic;color:#fff;line-height:0.95;margin:0;">Your turn.</h2><p style="font-family:${SA};font-size:32px;color:rgba(255,255,255,0.82);line-height:1.4;margin:26px 0 0;">Tap the link to sign up for a free shoot in Delhi.</p></div>`) })
  return slides
}

// ============ VARIATION C — CREAM MAGAZINE ============
function variantC() {
  const heroes = { hook: '000023.jpg', how: 'DSC_0075.jpg', what: '000050-6.jpg', cta: '000016-7.jpg' }
  const polas = favs(40, 3)
  const grid = favs(95, 4)
  const cbg = inner => `<div style="${frame('background:#efe9dd;')}"><div style="position:absolute;inset:0;background:linear-gradient(165deg,#f5f0e6 0%,#ece4d4 55%,#e2d8c6 100%);"></div>${inner}</div>`
  const kick = t => `<p style="font-family:${SA};font-size:22px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#b08948;margin:0 0 16px;">${t}</p>`
  const ink = '#23201b'
  const slides = []
  // 01 hook — big image block top, headline on the cream below
  slides.push({ name: 'c-01-hook', html: cbg(`<img src="${H(heroes.hook)}" style="position:absolute;top:0;left:0;width:1080px;height:1020px;object-fit:cover;object-position:center top;display:block;box-shadow:0 20px 50px rgba(0,0,0,0.25);"/><div style="position:absolute;top:1110px;left:64px;right:64px;">${kick('The Film Series · on 35mm')}<h1 style="font-family:${SE};font-size:138px;font-weight:700;font-style:italic;color:${ink};line-height:0.86;margin:0;">Delhi</h1><h2 style="font-family:${SE};font-size:76px;font-weight:700;font-style:italic;color:${ink};line-height:0.95;margin:10px 0 0;">free photo shoot.</h2><p style="font-family:${SA};font-size:29px;color:rgba(35,32,27,0.6);margin:24px 0 0;line-height:1.4;">Want photos like these? No experience needed.</p></div>` + grain(0.04)) })
  // 02 work — polaroids on cream
  slides.push({ name: 'c-02-work', html: cbg(`<div style="position:absolute;top:130px;left:64px;right:64px;">${kick('Recent work')}<h2 style="font-family:${SE};font-size:80px;font-weight:700;font-style:italic;color:${ink};margin:0;">Recent<br/>frames.</h2></div>${[[100, 560, -4], [560, 500, 3], [300, 1060, -1.5]].map((p, i) => `<div style="position:absolute;left:${p[0]}px;top:${p[1]}px;background:#fff;padding:18px 18px 64px;transform:rotate(${p[2]}deg);box-shadow:0 16px 40px rgba(80,60,30,0.22);"><img src="${polas[i]}" style="width:420px;height:520px;object-fit:cover;object-position:center top;display:block;"/></div>`).join('')}<div style="position:absolute;bottom:80px;left:64px;right:64px;text-align:center;"><p style="font-family:${SA};font-size:25px;color:rgba(35,32,27,0.5);margin:0;">No experience needed · I direct everything</p></div>`) })
  // 03 how — image right, steps left
  slides.push({ name: 'c-03-how', html: cbg(`<img src="${H(heroes.how)}" style="position:absolute;top:0;right:0;width:520px;height:1920px;object-fit:cover;object-position:center top;display:block;"/><div style="position:absolute;top:200px;left:64px;width:480px;">${kick('How it works')}<h2 style="font-family:${SE};font-size:72px;font-weight:700;font-style:italic;color:${ink};margin:0 0 46px;line-height:0.95;">Super<br/>simple.</h2>${STEPS.map((s, i) => `<div style="margin:0 0 38px;"><span style="font-family:${SE};font-size:52px;font-style:italic;font-weight:700;color:#b08948;">${i + 1}.</span><p style="font-family:${SA};font-size:31px;color:rgba(35,32,27,0.82);line-height:1.32;margin:8px 0 0;">${s}</p></div>`).join('')}</div>`) })
  // 04 what — list left, image-grid right
  slides.push({ name: 'c-04-what', html: cbg(`<div style="position:absolute;top:170px;left:64px;right:64px;">${kick('All of this · for free')}<h2 style="font-family:${SE};font-size:74px;font-weight:700;font-style:italic;color:${ink};margin:0 0 44px;">What you get.</h2>${GETS.map(s => `<div style="display:flex;gap:18px;align-items:baseline;margin:0 0 26px;"><span style="font-family:${SE};font-size:34px;color:#b08948;">—</span><span style="font-family:${SA};font-size:34px;color:rgba(35,32,27,0.82);line-height:1.32;">${s}</span></div>`).join('')}</div><div style="position:absolute;top:880px;left:64px;right:64px;bottom:80px;display:grid;grid-template-columns:1fr 1fr;grid-auto-rows:1fr;gap:18px;">${grid.map(s => `<div style="overflow:hidden;border:10px solid #fff;box-shadow:0 12px 30px rgba(80,60,30,0.2);"><img src="${s}" style="width:100%;height:100%;object-fit:cover;object-position:center top;display:block;"/></div>`).join('')}</div>`) })
  // 05 cta — full-bleed headliner, cream caption bar
  slides.push({ name: 'c-05-cta', html: `<div style="${frame('background:#000;')}">${full(H(heroes.cta), 'saturate(1.05) brightness(0.78)')}<div style="position:absolute;inset:0;background:linear-gradient(180deg,transparent 40%,rgba(20,16,10,0.92) 100%);"></div><div style="position:absolute;bottom:300px;left:64px;right:64px;"><p style="font-family:${SA};font-size:22px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#e9c986;margin:0 0 16px;${SH}">Sign up · Delhi</p><h2 style="font-family:${SE};font-size:112px;font-weight:700;font-style:italic;color:#fff;line-height:0.92;margin:0;${SH}">Your turn.</h2><p style="font-family:${SA};font-size:33px;color:rgba(255,255,255,0.9);line-height:1.4;margin:28px 0 0;${SH}">Tap the link to sign up for a free photo shoot in Delhi. Pick your vibe, send a selfie — I’ll plan the rest.</p></div>${grain(0.08)}</div>` })
  return slides
}

const VARIANTS = { a: variantA(), b: variantB(), c: variantC() }

async function render() {
  const all = []
  for (const [slug, slides] of Object.entries(VARIANTS)) {
    fs.mkdirSync(path.join(OUT, slug), { recursive: true })
    for (const s of slides) all.push({ ...s, dir: slug })
  }
  console.log(`Rendering ${all.length} slides...`)
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 2 })
  for (let i = 0; i < all.length; i++) {
    const s = all[i]; const page = await ctx.newPage()
    await page.setContent(`<!doctype html><html><head><style>*{box-sizing:border-box}html,body{margin:0;width:1080px;height:1920px;background:#000;overflow:hidden}body{-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}</style></head><body>${s.html}</body></html>`, { waitUntil: 'load' })
    await page.waitForTimeout(300)
    await page.screenshot({ path: path.join(OUT, s.dir, `${s.name}.jpg`), type: 'jpeg', quality: 92 })
    await page.close()
    console.log(`  [${i + 1}/${all.length}] ${s.name}`)
  }
  await browser.close()
  console.log(`\nDone — ${all.length} slides -> ${OUT}`)
}
render()
