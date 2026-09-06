import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

// ANTALYA CASTING CALLOUT — v3b..v7b = v3..v7 with the dates removed and 'tfp' → 'free photo collab' (Aidan, 9/12).
// v3..v7: five variations of the 5-slide story set, asked as
// "try another variation… or 5". Slide 1 (the approved callout) is identical in every set;
// slides 2-5 change concept per variation, all in the callout's language (black frame, typed
// system-sans lowercase like native IG story text, matted tilted film prints):
//   v3 photos do the talking — one full-bleed frame + one typed line per slide, copy position rotates
//   v4 prints on the table  — everything as prints on black; "how it works" is a 4-print photo-story
//   v5 about me             — trust-led: who i am + selfie print, work diptych, merged what/how, cta
//   v6 pick your vibe       — three vibes (old town / by the water / after dark) as numbered slides; cta = reply 1/2/3
//   v7 the plan             — the actual free windows (sat 12 / sun 13) + "questions i get" q&a, cta
// Specifics match the live /sign-up-collab/faq. "free" is said once per set. Every CTA keeps the
// bottom ~300px clear for a link sticker.  Run: node render-antalya-casting-v3b-v7b.mjs [--only=v4]  (outputs go to output-antalya-casting-v4b/…)
const CITY = { name: 'Antalya', slug: 'antalya' }
const ONLY = process.argv.find(a => a.startsWith('--only='))?.split('=')[1]

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const IMG = '/Users/aidantorrence/Documents/aidan-modern/public/images'
const enc = p => 'data:image/jpeg;base64,' + fs.readFileSync(path.join(IMG, p)).toString('base64')
const STRIP = ['large/r1-05460-0022.jpg', 'nature/000042-2.jpg', 'faves/000024-3.jpg']

const SS = "-apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif"
const SH = 'text-shadow:0 2px 8px rgba(0,0,0,0.85),0 12px 50px rgba(0,0,0,0.6);'
const grain = (o = 0.05) => `<div style="position:absolute;inset:0;pointer-events:none;opacity:${o};mix-blend-mode:soft-light;background-image:radial-gradient(circle at 14% 18%,rgba(255,255,255,0.5),transparent 17%),radial-gradient(circle at 84% 12%,rgba(255,255,255,0.28),transparent 15%),repeating-linear-gradient(0deg,rgba(255,255,255,0.08) 0 1px,transparent 1px 4px);"></div>`
const pr = (src, l, t, w, h, rot, pos = 'center top') => `<div style="position:absolute;left:${l}px;top:${t}px;width:${w + 24}px;height:${h + 26}px;background:#fafafa;padding:12px 12px 14px;transform:rotate(${rot}deg);box-shadow:0 16px 44px rgba(0,0,0,0.55),0 3px 10px rgba(0,0,0,0.3);"><img src="${src}" style="width:${w}px;height:${h}px;object-fit:cover;object-position:${pos};display:block;"/></div>`
const line = (t, size = 66, dim = 1, mt = 0, extra = '') => `<p style="font-family:${SS};font-size:${size}px;font-weight:500;color:rgba(255,255,255,${dim});margin:${mt}px 0 0;line-height:1.3;${extra}">${t}</p>`
const box = (top, inner, align = 'center', l = 90, r = 90, extra = '') => `<div style="position:absolute;top:${top}px;left:${l}px;right:${r}px;text-align:${align};${extra}">${inner}</div>`
const frame = (inner, bg = '#000') => `<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:${bg};">${inner}</div>`
const bleed = (src, scrim, overlay, pos = 'center top') => frame(`<img src="${src}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:${pos};display:block;filter:saturate(1.04) contrast(1.02);"/><div style="position:absolute;inset:0;background:${scrim};"></div>${overlay}${grain(0.07)}`)
const SC_TOP = 'linear-gradient(180deg,rgba(0,0,0,0.66) 0%,rgba(0,0,0,0.28) 26%,transparent 44%,transparent 80%,rgba(0,0,0,0.5) 100%)'
const SC_LOW = 'linear-gradient(180deg,rgba(0,0,0,0.25) 0%,transparent 22%,transparent 40%,rgba(0,0,0,0.55) 60%,rgba(0,0,0,0.92) 100%)'
const SC_MID = 'linear-gradient(180deg,rgba(0,0,0,0.2) 0%,transparent 25%,rgba(0,0,0,0.35) 52%,rgba(0,0,0,0.7) 72%,rgba(0,0,0,0.92) 100%)'

const HANDLE = '@madebyaidan'
const callout = ({ lower }) => ({
  name: '01-callout', html: frame(
    box(260, line(`hi, i'm in ${lower}.`) + line('looking for models<br/>for a free photo collab', 66, 1, 90) + line('dm me if interested', 66, 1, 90) + line('share 🙂', 66, 1, 90)) +
    [[70, 1100, -6], [395, 1215, 2.5], [730, 1290, -3]].map((p, i) => pr(enc(STRIP[i]), p[0], p[1], 240, 360, p[2])).join(''))
})

const V = {}

// ── v3 · photos do the talking ─────────────────────────────────────────────
V.v3 = c => [callout(c),
  { name: '02-work', html: bleed(enc('headliners/000015-2.jpg'), SC_LOW, box(1180, line('35mm film.') + line('natural light.'), 'left', 100, 100, SH)) },
  { name: '03-where', html: bleed(enc('large/manila-gallery-floor-001.jpg'), SC_TOP, box(170, line('1-2 hours.') + line('kaleiçi, the old harbour,<br/>or the cliffs at karaalioğlu park.', 50, 0.95, 24), 'center', 90, 90, SH)) },
  { name: '04-free', html: bleed(enc('headliners/000019-6.jpg'), SC_MID, box(1160, line("it's a free photo collab.") + line('you keep the full-res scans,<br/>usually within 2 weeks.', 50, 0.95, 24), 'center', 90, 90, SH)) },
  { name: '05-cta', html: bleed(enc('large/manila-gallery-ivy-002.jpg'), SC_LOW, box(1080, line(`dm me "${c.lower}" 🙂`, 72) + line(HANDLE, 54, 0.92, 28), 'center', 80, 80, SH)) },
]

// ── v4 · prints on the table ───────────────────────────────────────────────
V.v4 = c => {
  const six = [['large/manila-gallery-dsc-0190.jpg', 60, 420, -5], ['large/manila-gallery-canal-001.jpg', 400, 460, 3], ['large/manila-gallery-statue-001.jpg', 745, 430, -2],
    ['large/manila-gallery-dsc-0911.jpg', 90, 930, 4], ['headliners/000050-6.jpg', 420, 980, -3], ['headliners/000019-6.jpg', 760, 940, 2]]
  const story = [['large/manila-gallery-closeup-001.jpg', `1. dm me "${c.lower}"`], ['large/manila-gallery-street-001.jpg', '2. we pick a spot + time'], ['large/manila-gallery-urban-003.jpg', '3. we shoot for 1-2 hrs'], ['large/manila-gallery-dsc-0130.jpg', '4. scans in ~2 weeks']]
  const cell = (s, i) => { const l = i % 2 ? 640 : 110, t = i < 2 ? 330 : 990; return pr(enc(s[0]), l, t, 300, 400, i % 2 ? 2.5 : -2.5) + `<div style="position:absolute;left:${l - 40}px;top:${t + 450}px;width:400px;text-align:center;">${line(s[1], 34, 0.95)}</div>` }
  return [callout(c),
    { name: '02-work', html: frame(box(220, line('some of my work')) + six.map(p => pr(enc(p[0]), p[1], p[2], 260, 390, p[3])).join('')) },
    { name: '03-what', html: frame(box(300, line('what you get') + line('a 1-2 hour shoot on 35mm film,<br/>somewhere in kaleiçi or by the water', 50, 0.95, 60) + line('full-res scans in about 2 weeks,<br/>yours to keep', 50, 0.95, 40) + line('free photo collab — i post a few too', 50, 0.95, 40)) +
      pr(enc('large/manila-gallery-tropical-001.jpg'), -150, 1130, 340, 510, 6) + pr(enc('headliners/000041.jpg'), 880, 1220, 340, 510, -5)) },
    { name: '04-how', html: frame(box(170, line('how it works')) + story.map(cell).join('')) },
    { name: '05-cta', html: frame(box(300, line(`dm me "${c.lower}" 🙂`, 72)) + pr(enc('large/manila-gallery-park-001.jpg'), 260, 520, 560, 840, -2) + box(1440, line(HANDLE, 46, 0.85))) },
  ]
}

// ── v5 · about me ──────────────────────────────────────────────────────────
V.v5 = c => [callout(c),
  { name: '02-about', html: frame(box(220, line('about me') + line("i'm aidan, a photographer<br/>from the usa.", 50, 0.95, 60) + line("3 years on the road, shooting film.", 50, 0.95, 24) + line(`in ${c.lower} now, then on to kaş.`, 50, 0.95, 24)) + pr(enc('self/aidan-udaipur-mirror-03.jpg'), 340, 960, 400, 560, 2)) },
  { name: '03-work', html: frame(box(200, line('some of my work')) + pr(enc('headliners/000050-6.jpg'), 70, 520, 430, 645, -2) + pr(enc('headliners/000038-4.jpg'), 580, 620, 430, 645, 2)) },
  { name: '04-how', html: frame(box(240, line('how it works') + line(`1. dm me "${c.lower}"`, 52, 0.95, 60) + line('2. we plan the look + a spot over dm', 52, 0.95, 34) + line('3. 1-2 hrs shooting on 35mm film', 52, 0.95, 34) + line('4. full-res scans in ~2 weeks', 52, 0.95, 34) + line('free photo collab', 52, 0.7, 50), 'left', 100, 100) + pr(enc('large/manila-gallery-tropical-001.jpg'), 660, 1230, 380, 570, 3)) },
  { name: '05-cta', html: bleed(enc('headliners/000020-5.jpg'), SC_LOW, box(1100, line(`dm me "${c.lower}" 🙂`, 72) + line(HANDLE, 54, 0.92, 28), 'left', 100, 100, SH)) },
]

// ── v6 · pick your vibe ────────────────────────────────────────────────────
V.v6 = c => {
  const vibes = [['1 · old town', "kaleiçi's streets + doors,<br/>late afternoon light", 'large/manila-gallery-dsc-0190.jpg', -2],
    ['2 · by the water', 'the cliffs at karaalioğlu park<br/>or the old harbour, at sunset', 'large/manila-gallery-floor-001.jpg', 2],
    ['3 · after dark', 'neon + streetlights<br/>around kaleiçi after sunset', 'headliners/000016-3.jpg', -1.5]]
  const vibe = (v, i) => ({ name: `0${i + 2}-vibe-${i + 1}`, html: frame(box(170, line('pick your vibe', 46, 0.7) + line(v[0], 66, 1, 14) + line(v[1], 44, 0.9, 20)) + pr(enc(v[2]), 220, 560, 640, 960, v[3])) })
  return [callout(c), ...vibes.map(vibe),
    { name: '05-cta', html: frame(box(280, line('reply 1, 2 or 3 🙂', 72) + line("and i'll plan a free photo collab around it", 46, 0.85, 24)) +
      vibes.map((v, i) => pr(enc(v[2]), 90 + i * 320, 660, 240, 360, [-4, 2, -2][i]) + `<div style="position:absolute;left:${90 + i * 320}px;top:1070px;width:264px;text-align:center;">${line(String(i + 1), 54, 0.9)}</div>`).join('') +
      box(1250, line(HANDLE, 46, 0.85))) },
  ]
}

// ── v7 · the plan ──────────────────────────────────────────────────────────
V.v7 = c => [callout(c),
  { name: '02-work', html: bleed(enc('large/manila-gallery-urban-003.jpg'), SC_LOW, box(1240, line('some of my work') + line('all 35mm film, natural light', 46, 0.9, 20), 'center', 90, 90, SH)) },
  { name: '03-when', html: frame(box(240, line('when i can shoot') + line('afternoons + sunset (19:10)', 50, 0.95, 60) + line('or early morning', 50, 0.95, 30) + line('1-2 hrs, 35mm film, anywhere central', 50, 0.7, 50)) + pr(enc('headliners/000023.jpg'), 360, 1080, 360, 540, -2)) },
  { name: '04-faq', html: frame(box(200, [['is it free?', 'yes — a free photo collab,<br/>i post a few too'], ['do i need experience?', 'no, i direct every frame'], ['what do i wear?', 'we plan the look together over dm'], ['when do i get the photos?', 'full-res scans in about 2 weeks']].map(q => line(q[0], 44, 0.65, 44) + line(q[1], 52, 1, 6)).join(''), 'left', 100, 100) + pr(enc('headliners/000036-5.jpg'), 740, 1380, 260, 390, 3)) },
  { name: '05-cta', html: bleed(enc('large/manila-gallery-shadow-001.jpg'), SC_LOW, box(1120, line(`dm me "${c.lower}" 🙂`, 72) + line('+ which day works for you', 46, 0.85, 20) + line(HANDLE, 54, 0.92, 28), 'center', 80, 80, SH)) },
]

async function render() {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 2 })
  const c = { ...CITY, lower: CITY.name.toLowerCase() }
  for (const [tag, build] of Object.entries(V)) {
    if (ONLY && ONLY !== tag) continue
    const dir = path.join(__dirname, `output-${CITY.slug}-casting-${tag}b`, CITY.slug)
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
    console.log(`${CITY.name} casting ${tag}b: 5 slides -> ${dir}`)
  }
  await browser.close()
  console.log('Done.')
}
render()
