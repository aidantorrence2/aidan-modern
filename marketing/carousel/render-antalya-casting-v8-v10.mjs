import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

// ANTALYA CASTING CALLOUT — v8..v10: trip-centred variations of the v6b "pick your vibe" set.
// Aidan (9/12): "6b was cool but i want some variations centered around antalya trips" — he has a
// car for day trips, but the copy never mentions it (his call: "they don't need to know that much").
//   v8  pick your trip      — three day-trip options (phaselis / olympos + çıralı / kaputaş), reply 1-2-3
//   v9  one day, three stops — the classic coast day as a sequence (phaselis → olympos → çıralı sunset), dm "trip"
//   v10 the menu            — six numbered spots in one grid (in town + out of town), reply with a number
// Slide 1 = the approved callout (no dates, "free photo collab"). Place photos are real, geotagged
// Wikimedia Commons frames (CC BY / BY-SA — credits in places-antalya/sources.json; fetched by
// fetch-antalya-places.py, reviewed on contact sheets). They are matted as prints so the mixed
// sources sit together; portfolio prints stay on slide 1 only.  Run: node … [--only=v9]
const CITY = { name: 'Antalya', slug: 'antalya' }
const ONLY = process.argv.find(a => a.startsWith('--only='))?.split('=')[1]

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const IMG = '/Users/aidantorrence/Documents/aidan-modern/public/images'
const PL = path.join(__dirname, 'places-antalya')
const enc = p => 'data:image/jpeg;base64,' + fs.readFileSync(path.join(IMG, p)).toString('base64')
const pl = f => 'data:image/jpeg;base64,' + fs.readFileSync(path.join(PL, f)).toString('base64')
const STRIP = ['large/r1-05460-0022.jpg', 'nature/000042-2.jpg', 'faves/000024-3.jpg']

const SS = "-apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif"
const grain = (o = 0.05) => `<div style="position:absolute;inset:0;pointer-events:none;opacity:${o};mix-blend-mode:soft-light;background-image:radial-gradient(circle at 14% 18%,rgba(255,255,255,0.5),transparent 17%),radial-gradient(circle at 84% 12%,rgba(255,255,255,0.28),transparent 15%),repeating-linear-gradient(0deg,rgba(255,255,255,0.08) 0 1px,transparent 1px 4px);"></div>`
const pr = (src, l, t, w, h, rot, pos = 'center') => `<div style="position:absolute;left:${l}px;top:${t}px;width:${w + 24}px;height:${h + 26}px;background:#fafafa;padding:12px 12px 14px;transform:rotate(${rot}deg);box-shadow:0 16px 44px rgba(0,0,0,0.55),0 3px 10px rgba(0,0,0,0.3);"><img src="${src}" style="width:${w}px;height:${h}px;object-fit:cover;object-position:${pos};display:block;"/></div>`
const line = (t, size = 66, dim = 1, mt = 0, extra = '') => `<p style="font-family:${SS};font-size:${size}px;font-weight:500;color:rgba(255,255,255,${dim});margin:${mt}px 0 0;line-height:1.3;${extra}">${t}</p>`
const box = (top, inner, align = 'center', l = 90, r = 90) => `<div style="position:absolute;top:${top}px;left:${l}px;right:${r}px;text-align:${align};">${inner}</div>`
const frame = (inner, bg = '#000') => `<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:${bg};">${inner}</div>`
const HANDLE = '@madebyaidan'

const callout = ({ lower }) => ({
  name: '01-callout', html: frame(
    box(260, line(`hi, i'm in ${lower}.`) + line('looking for models<br/>for a free photo collab', 66, 1, 90) + line('dm me if interested', 66, 1, 90) + line('share 🙂', 66, 1, 90)) +
    [[70, 1100, -6], [395, 1215, 2.5], [730, 1290, -3]].map((p, i) => pr(enc(STRIP[i]), p[0], p[1], 240, 360, p[2], 'center top')).join(''))
})

const V = {}

// ── v8 · pick your trip (three day trips, tall 4:5 prints like v6b) ────────
V.v8 = c => {
  const trips = [
    ['1 · phaselis', 'ancient harbour in a pine forest,<br/>about an hour from antalya', 'phaselis-03.jpg', -2, 'center'],
    ['2 · olympos + çıralı', 'ruins in the jungle,<br/>then a wild beach for sunset', 'olympos-01.jpg', 2, 'center'],
    ['3 · kaputaş', 'the turquoise cove way down the coast.<br/>a long day, worth it', 'kaputas-06.jpg', -1.5, 'center'],
  ]
  const slide = (t, i) => ({ name: `0${i + 2}-trip-${i + 1}`, html: frame(box(170, line('day trip · pick one', 46, 0.7) + line(t[0], 66, 1, 14) + line(t[1], 44, 0.9, 20)) + pr(pl(t[2]), 180, 580, 720, 900, t[3], t[4])) })
  return [callout(c), ...trips.map(slide),
    { name: '05-cta', html: frame(box(280, line('reply 1, 2 or 3 🙂', 72) + line("free photo collab —<br/>i'll plan the day around it", 44, 0.85, 24)) +
      trips.map((t, i) => pr(pl(t[2]), 90 + i * 320, 660, 240, 300, [-4, 2, -2][i], t[4]) + `<div style="position:absolute;left:${90 + i * 320}px;top:1010px;width:264px;text-align:center;">${line(String(i + 1), 54, 0.9)}</div>`).join('') +
      box(1190, line(HANDLE, 46, 0.85))) },
  ]
}

// ── v9 · one day, three stops (a sequence, wide landscape prints) ──────────
V.v9 = c => {
  const stops = [
    ['stop 1 · phaselis', 'morning at the ancient harbour', 'phaselis-00.jpg', -1.5],
    ['stop 2 · olympos', 'ruins hidden in the jungle', 'olympos-03.jpg', 1.5],
    ['stop 3 · çıralı', 'sunset on the beach (19:10)', 'cirali-11.jpg', -1],
  ]
  const slide = (s, i) => ({ name: `0${i + 2}-stop-${i + 1}`, html: frame(box(200, line('one day out of antalya', 46, 0.7) + line(s[0], 66, 1, 14) + line(s[1], 44, 0.9, 20)) + pr(pl(s[2]), 60, 640, 936, 702, s[3])) })
  return [callout(c), ...stops.map(slide),
    { name: '05-cta', html: frame(box(240, line('in? dm me "trip" 🙂', 72) + line('three stops, a free photo collab,<br/>all the photos yours', 44, 0.85, 24) + line(HANDLE, 46, 0.85, 40)) +
      pr(pl('phaselis-00.jpg'), 40, 880, 400, 300, -4) + pr(pl('olympos-03.jpg'), 330, 1080, 400, 300, 2) + pr(pl('cirali-11.jpg'), 620, 1280, 400, 300, -2)) },
  ]
}

// ── v10 · the menu (six numbered spots in one grid) ────────────────────────
V.v10 = c => {
  const spots = [['kaleiçi', 'kaleici-10.jpg'], ['düden falls', 'duden-03.jpg'], ['phaselis', 'phaselis-03.jpg'], ['olympos', 'olympos-01.jpg'], ['side', 'side-05.jpg'], ['kaputaş', 'kaputas-13.jpg']]
  const cell = (s, i) => { const l = 60 + (i % 3) * 330, t = i < 3 ? 430 : 990; return pr(pl(s[1]), l, t, 280, 350, [-3, 2, -2, 3, -2, 2][i]) + `<div style="position:absolute;left:${l - 30}px;top:${t + 400}px;width:364px;text-align:center;">${line(`${i + 1} · ${s[0]}`, 36, 0.95)}</div>` }
  return [callout(c),
    { name: '02-menu', html: frame(box(200, line('pick a spot') + line('in town, or a day out', 44, 0.7, 12)) + spots.map(cell).join('')) },
    { name: '03-day', html: frame(box(240, line('how a day out goes') + line('we leave antalya in the morning', 52, 0.95, 60) + line('shoot two or three spots on the way', 52, 0.95, 30) + line('back by sunset —<br/>or we shoot that too', 52, 0.95, 30), 'left', 100, 100) + pr(pl('koprulu-13.jpg'), 620, 1130, 400, 600, 3)) },
    { name: '04-what', html: frame(box(240, line('what you get') + line('1-2 hours per spot, on 35mm film', 52, 0.95, 60) + line('full-res scans in about 2 weeks', 52, 0.95, 30) + line('free photo collab — i post a few too', 52, 0.95, 30), 'left', 100, 100) + pr(pl('adrasan-01.jpg'), 80, 1120, 560, 420, -3)) },
    { name: '05-cta', html: frame(box(300, line('reply with a number 🙂', 72) + line("and i'll plan a free photo collab around it", 44, 0.85, 24)) + pr(pl('cirali-09.jpg'), 70, 700, 916, 687, -1.5) + box(1520, line(HANDLE, 46, 0.85))) },
  ]
}

async function render() {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 2 })
  const c = { ...CITY, lower: CITY.name.toLowerCase() }
  for (const [tag, build] of Object.entries(V)) {
    if (ONLY && ONLY !== tag) continue
    const dir = path.join(__dirname, `output-${CITY.slug}-casting-${tag}`, CITY.slug)
    fs.mkdirSync(dir, { recursive: true })
    for (const f of fs.readdirSync(dir)) if (f.toLowerCase().endsWith('.jpg')) fs.rmSync(path.join(dir, f))
    for (const s of build(c)) {
      const page = await ctx.newPage()
      await page.setContent(`<!doctype html><html><head><style>*{box-sizing:border-box}html,body{margin:0;width:1080px;height:1920px;background:#000;overflow:hidden}body{-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}</style></head><body>${s.html}</body></html>`, { waitUntil: 'load' })
      await page.evaluate(() => document.fonts.ready)
      await page.waitForTimeout(250)
      await page.screenshot({ path: path.join(dir, `${s.name}.jpg`), type: 'jpeg', quality: 92 })
      await page.close()
    }
    console.log(`${CITY.name} casting ${tag}: 5 slides -> ${dir}`)
  }
  await browser.close()
  console.log('Done.')
}
render()
