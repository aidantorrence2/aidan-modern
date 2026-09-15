import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
// Antalya "visual concept" carousel: three 1080x1350 slides rendered @2x, plus a 3-up preview.
// Layout unchanged since 13 Sept 2026. Reference images live in concept-refs/ (gitignored, disk only);
// credits for the current set are in output-concept-v4/SOURCES.md.
// v4 (15 Sept): the three slide heroes replaced with references Aidan picked from public/images/pinterest; slide 3 title 'interested?'.
// Run:  node marketing/antalya-ig-campaign/render-concept.mjs                 (dm CTA → output-concept-v4/)
//       node marketing/antalya-ig-campaign/render-concept.mjs --cta=signup    (sign-up CTA for the website ad → output-concept-v4b-signup/)
//       add --out=output-concept-v5 to write elsewhere
const root = path.dirname(fileURLToPath(import.meta.url))
const arg = (k, d) => (process.argv.find(a => a.startsWith(`--${k}=`)) || `--${k}=${d}`).slice(k.length + 3)
const cta = arg('cta', 'dm')                                  // dm | signup
if (!['dm', 'signup'].includes(cta)) throw new Error('--cta must be dm or signup')
const CTA = cta === 'signup' ? 'sign up below' : 'dm if interested'   // "sign up below" = the Sign Up button under a Leads → website ad
const outName = arg('out', cta === 'signup' ? 'output-concept-v4b-signup' : 'output-concept-v4')
const out = path.join(root, outName)
const REFS = path.join(root, 'concept-refs')
const R = f => 'data:image/jpeg;base64,' + fs.readFileSync(path.join(REFS, f)).toString('base64')
const IMG = {
  s1hero: ['f714ebb9d64616b6fda897ccc6a1af04.jpg', 'center 45%'], // fringe dress on a seaside railing, mountains behind (v4)
  s1top:  ['641200065745826313.jpg', 'center 82%'],               // walking past a Kaleiçi house
  s1bot:  ['605452743692672211.jpg', 'center 10%'],               // sun flare, white top, film border
  s2hero: ['8adac7c5ff898835869eceb70bb8f613.jpg', 'center'],     // white cliffs over the water, looking out (v4)
  s2top:  ['1058205243703273898.jpg', 'center'],                  // overhead on wet sand (kept, Aidan's pick)
  s2bot:  ['965599976371240696.jpg', 'center 45%'],               // black-and-white, crouched on a rock
  s3:     ['da4a081b0a7f3406421ff216e4c4bd9a.jpg', 'center'],     // green one-piece, harbour town behind (v4)
}
const F = "-apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif"
const im = (k, l, t, w, h) => `<img src="${R(IMG[k][0])}" style="position:absolute;left:${l}px;top:${t}px;width:${w}px;height:${h}px;object-fit:cover;object-position:${IMG[k][1]};display:block;"/>`
const tx = (t, l, top, size, lh = 1.08, extra = '') => `<div data-copy style="position:absolute;left:${l}px;top:${top}px;font-family:${F};font-size:${size}px;line-height:${lh};color:#141414;letter-spacing:-0.012em;${extra}">${t}</div>`
const frame = inner => `<div style="width:1080px;height:1350px;position:relative;overflow:hidden;background:#F2EFE8;">${inner}</div>`
const slides = [
  ['01-concept', frame(tx('photo collab', 62, 66, 28) + tx('free photo shoot<br/>in antalya', 62, 118, 86, 1.02) + im('s1hero', 62, 350, 548, 688) + im('s1top', 638, 350, 380, 330) + im('s1bot', 638, 708, 380, 330) + tx('looking for people to shoot with', 62, 1092, 48) + tx(CTA, 62, 1176, 35))],
  ['02-direction', frame(tx('the mood', 62, 70, 76, 1.0) + tx('sea air. simple styling. beach light.', 62, 178, 32) + im('s2hero', 62, 262, 473, 663) + im('s2top', 568, 262, 424, 488) + im('s2bot', 568, 775, 424, 455) + tx('light layers,<br/>your own style.', 62, 990, 50))],
  ['03-invitation', frame(tx('interested?', 62, 68, 90, 1.02) + im('s3', 62, 325, 538, 775) + tx('free photo collab<br/>in antalya', 638, 412, 40) + tx('we plan the<br/>styling, location<br/>and date together.', 638, 625, 33, 1.25) + tx(CTA, 62, 1148, 60) + tx('@madebyaidan', 62, 1240, 25))],
]
const CSS = `*{box-sizing:border-box}html,body{margin:0;background:#F2EFE8;overflow:hidden}body{-webkit-font-smoothing:antialiased}`
fs.mkdirSync(out, { recursive: true })
const browser = await chromium.launch()
try {
  const ctx = await browser.newContext({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 2 })
  for (const [name, html] of slides) {
    const page = await ctx.newPage()
    await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${CSS}html,body{width:1080px;height:1350px}</style></head><body>${html}</body></html>`, { waitUntil: 'load' })
    await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(i => i.decode())) })
    const bad = await page.evaluate(() => [...document.querySelectorAll('[data-copy]')].filter(e => { const r = e.getBoundingClientRect(); return r.bottom > 1330 || r.right > 1050 }).map(e => e.textContent))
    if (bad.length) throw new Error('copy out of bounds: ' + bad.join(' | '))
    await page.screenshot({ path: path.join(out, `${name}.jpg`), type: 'jpeg', quality: 90 })
    await page.close(); console.log(`${outName}/${name}.jpg rendered, text bounds checked`)
  }
  // 3-up preview of the rendered slides (720px each on the slide background)
  const W = 720, H = 900, G = 24
  const strip = slides.map(([name]) => `<img src="data:image/jpeg;base64,${fs.readFileSync(path.join(out, `${name}.jpg`)).toString('base64')}" style="width:${W}px;height:${H}px;display:block"/>`).join('')
  const pv = await browser.newPage({ viewport: { width: W * 3 + G * 4, height: H + G * 2 }, deviceScaleFactor: 1 })
  await pv.setContent(`<!doctype html><html><head><style>${CSS}body{display:flex;gap:${G}px;padding:${G}px}</style></head><body>${strip}</body></html>`, { waitUntil: 'load' })
  await pv.screenshot({ path: path.join(out, 'preview.jpg'), type: 'jpeg', quality: 85 })
  console.log(`${outName}/preview.jpg rendered`)
} finally { await browser.close() }
