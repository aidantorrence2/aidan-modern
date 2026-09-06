import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

// ANTALYA CASTING CALLOUT — v11..v13: ONE trip, ONE destination, and the callout itself pitches it.
// Aidan (9/12) on v8-v10: "the first page needs to adapt, it's specifically pitching the trip.
// and it's not multiple stops." So: slide 1 = the callout with the trip in it ("looking for a model
// / for a free photo collab / day trip to phaselis"), slide 2 = the place, slide 3 = how the day goes
// (out in the morning, one spot, back by sunset), slide 4 = what you get, slide 5 = dm the place name.
// Same template rendered for three destinations so he can post the one he's actually doing:
//   v11 phaselis · v12 olympos (çıralı beach + the ruins, one place) · v13 kaputaş
// Place photos: geotagged Commons frames (credits in places-antalya/sources.json). Car never mentioned.
const CITY = { name: 'Antalya', slug: 'antalya' }
const ONLY = process.argv.find(a => a.startsWith('--only='))?.split('=')[1]

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const IMG = '/Users/aidantorrence/Documents/aidan-modern/public/images'
const PL = path.join(__dirname, 'places-antalya')
const enc = p => 'data:image/jpeg;base64,' + fs.readFileSync(path.join(IMG, p)).toString('base64')
const pl = f => 'data:image/jpeg;base64,' + fs.readFileSync(path.join(PL, f)).toString('base64')
const STRIP = ['large/r1-05460-0022.jpg', 'nature/000042-2.jpg', 'faves/000024-3.jpg']

const SS = "-apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif"
const pr = (src, l, t, w, h, rot, pos = 'center') => `<div style="position:absolute;left:${l}px;top:${t}px;width:${w + 24}px;height:${h + 26}px;background:#fafafa;padding:12px 12px 14px;transform:rotate(${rot}deg);box-shadow:0 16px 44px rgba(0,0,0,0.55),0 3px 10px rgba(0,0,0,0.3);"><img src="${src}" style="width:${w}px;height:${h}px;object-fit:cover;object-position:${pos};display:block;"/></div>`
const line = (t, size = 66, dim = 1, mt = 0) => `<p style="font-family:${SS};font-size:${size}px;font-weight:500;color:rgba(255,255,255,${dim});margin:${mt}px 0 0;line-height:1.3;">${t}</p>`
const box = (top, inner, align = 'center', l = 90, r = 90) => `<div style="position:absolute;top:${top}px;left:${l}px;right:${r}px;text-align:${align};">${inner}</div>`
const frame = inner => `<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">${inner}</div>`
const HANDLE = '@madebyaidan'

const TRIPS = {
  v11: { name: 'phaselis', kw: 'phaselis', desc: 'ancient harbour ruins in a pine forest,<br/>three little bays to swim in.<br/>about an hour from antalya', hero: ['phaselis-03.jpg', 'center'], day: 'phaselis-00.jpg', cta: 'phaselis-09.jpg', swim: 'then a swim off the ruins' },
  v12: { name: 'olympos', kw: 'olympos', desc: 'ruins hidden in the jungle that open<br/>onto a wild pebble beach.<br/>about 1.5 hrs from antalya', hero: ['olympos-01.jpg', 'center'], day: 'olympos-03.jpg', cta: 'cirali-11.jpg', swim: 'then the beach for the afternoon' },
  v13: { name: 'kaputaş', kw: 'kaputas', desc: 'the turquoise cove between the cliffs.<br/>a long day down the coast,<br/>worth every minute', hero: ['kaputas-06.jpg', 'center'], day: 'kaputas-13.jpg', cta: 'kaputas-11.jpg', swim: 'then the water. it is that colour' },
}

const build = (t, lower) => [
  { name: '01-callout', html: frame(
      box(230, line(`hi, i'm in ${lower}.`) + line(`looking for a model<br/>for a free photo collab<br/>day trip to ${t.name}`, 66, 1, 80) + line('dm me if interested', 66, 1, 80) + line('share 🙂', 66, 1, 80)) +
      [[70, 1130, -6], [395, 1245, 2.5], [730, 1320, -3]].map((p, i) => pr(enc(STRIP[i]), p[0], p[1], 240, 360, p[2], 'center top')).join('')) },
  { name: '02-place', html: frame(box(170, line('the trip', 46, 0.7) + line(t.name, 66, 1, 14) + line(t.desc, 44, 0.9, 20)) + pr(pl(t.hero[0]), 180, 620, 720, 900, -2, t.hero[1])) },
  { name: '03-day', html: frame(box(240, line('how the day goes') + line(`we head out of ${lower}<br/>in the morning`, 52, 0.95, 60) + line('one spot, no rush', 52, 0.95, 30) + line('shoot 1-2 hrs on 35mm film,<br/>' + t.swim, 52, 0.95, 30) + line(`back in ${lower} by sunset`, 52, 0.95, 30), 'left', 100, 100) + pr(pl(t.day), 560, 1300, 440, 330, 3)) },
  { name: '04-what', html: frame(box(240, line('what you get') + line(`a day at ${t.name}`, 52, 0.95, 60) + line('full-res scans in about 2 weeks', 52, 0.95, 30) + line('free photo collab — i post a few too', 52, 0.95, 30), 'left', 100, 100) + pr(enc('large/manila-gallery-park-001.jpg'), 620, 1130, 400, 600, 3, 'center top')) },
  { name: '05-cta', html: frame(box(260, line(`dm me "${t.kw}" 🙂`, 72) + line(`free photo collab, one day out of ${lower}`, 44, 0.85, 24) + line(HANDLE, 46, 0.85, 40)) + pr(pl(t.cta), 60, 780, 936, 702, -1.5)) },
]

async function render() {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 2 })
  const lower = CITY.name.toLowerCase()
  for (const [tag, t] of Object.entries(TRIPS)) {
    if (ONLY && ONLY !== tag) continue
    const dir = path.join(__dirname, `output-${CITY.slug}-casting-${tag}`, CITY.slug)
    fs.mkdirSync(dir, { recursive: true })
    for (const f of fs.readdirSync(dir)) if (f.toLowerCase().endsWith('.jpg')) fs.rmSync(path.join(dir, f))
    for (const s of build(t, lower)) {
      const page = await ctx.newPage()
      await page.setContent(`<!doctype html><html><head><style>*{box-sizing:border-box}html,body{margin:0;width:1080px;height:1920px;background:#000;overflow:hidden}body{-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}</style></head><body>${s.html}</body></html>`, { waitUntil: 'load' })
      await page.evaluate(() => document.fonts.ready)
      await page.waitForTimeout(250)
      await page.screenshot({ path: path.join(dir, `${s.name}.jpg`), type: 'jpeg', quality: 92 })
      await page.close()
    }
    console.log(`${CITY.name} casting ${tag} (${t.name}): 5 slides -> ${dir}`)
  }
  await browser.close()
  console.log('Done.')
}
render()
