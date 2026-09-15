import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

// ANTALYA CASTING CALLOUT — v17b · "pick your vibe" poll story, PINTEREST VIBES (Aidan, 9/13: "poll is bad… should be
// like different pinterest vibes"). v17 used two of Aidan's own prints (same model, two white dresses — the options read as
// one vibe). v17b uses the sign-up picker's Pinterest reference library instead (public/images/moodboard/ on main; the four
// picks are copied to pinterest-antalya/, gitignored), so every option is a visibly different vibe: indoor · by the sea ·
// boat · old town — the four themes applicants actually pick from on /sign-up-collab.
// Two modes, same black frame / typed lowercase text / matted prints as every casting story:
//   --tiles=2  (default)  AD poll: Meta ad polls take exactly two answers → two big prints. --pair=oldtown,sea picks the pair
//                         (default indoor,sea = applicants' top two picks; oldtown,sea = the two most Antalya-specific).
//   --tiles=4             ORGANIC story poll: Instagram's native poll sticker takes up to four answers → 2×2 grid of all four.
//                         (Can't be run as an ad — post it from the account, and you see who voted per option.)
// Each frame renders twice: 01-poll.jpg (final) + 01-poll-guide.jpg (dashed sticker zone + IG safe bands). POLL.md has the
// sticker copy. Rules: "free" once, no dates, "free photo collab" (never tfp). Pinterest images are references — fine for the
// organic story; for the paid ad Aidan decides whether to run third-party photos.
// Run from repo root: node marketing/carousel/render-antalya-casting-v17b-poll.mjs [--lang=en|tr|ru] [--tiles=2|4] [--pair=a,b]
// Outputs (gitignored): marketing/carousel/output-antalya-casting-v17b-poll/<lang>/{ad-<pair>,organic-4}/01-poll[-guide].jpg
const CITY = { name: 'Antalya', slug: 'antalya' }
const ARG = k => process.argv.find(a => a.startsWith(`--${k}=`))?.split('=')[1]
const LANG = ARG('lang')
const TILES = Number(ARG('tiles') || 2)
const PAIR = (ARG('pair') || 'indoor,sea').split(',')

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PIN = path.join(__dirname, 'pinterest-antalya')
const enc = f => 'data:image/jpeg;base64,' + fs.readFileSync(path.join(PIN, f)).toString('base64')

// the sign-up picker's four themes, one Pinterest reference each (picked 9/13 for maximum contrast between vibes)
const VIBES = {
  indoor: { img: 'indoor-927319379546387717.jpg', pos: 'center 40%' },
  sea: { img: 'sea-596515913194746171.jpg', pos: 'center center' },   // the rocky cove — the picker's own sea tile
  boat: { img: 'boat-380765343501508400.jpg', pos: 'center top' },
  oldtown: { img: 'old-town-2322237300893074.jpg', pos: 'center center' },
}
const ORDER = ['indoor', 'sea', 'boat', 'oldtown']

const LANGS = {
  en: { hi: "hi, i'm in antalya.", collab: 'free photo collab', q: 'which vibe would you pick?',
    labels: { indoor: 'indoor', sea: 'by the sea', boat: 'on a boat', oldtown: 'old town' },
    ctaAd: 'vote, then dm me your pick 🙂', ctaOrganic: 'vote 🙂 then reply with your pick', pollQ: 'which vibe?' },
  tr: { hi: "selam, antalya'dayım.", collab: 'ücretsiz fotoğraf çekimi', q: 'sen hangisini seçerdin?',
    labels: { indoor: 'iç mekan', sea: 'deniz kenarı', boat: 'teknede', oldtown: 'eski şehir' },
    ctaAd: "oy ver, sonra seçimini dm'le 🙂", ctaOrganic: 'oy ver 🙂 sonra seçimini yanıtla', pollQ: 'hangisi?' },
  ru: { hi: 'привет, я в анталии.', collab: 'бесплатная фотосессия', q: 'какой вайб выберешь?',
    labels: { indoor: 'в помещении', sea: 'у моря', boat: 'на лодке', oldtown: 'старый город' },
    ctaAd: 'проголосуй,<br/>потом напиши мне свой выбор 🙂', ctaOrganic: 'проголосуй 🙂 и ответь, что выбрал(а)', pollQ: 'какой вайб?' },
}

const SAFE = { top: 250, bottom: 340 }
const SS = "-apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif"
const pr = (src, l, t, w, h, rot, pos = 'center top') => `<div style="position:absolute;left:${l}px;top:${t}px;width:${w + 24}px;height:${h + 26}px;background:#fafafa;padding:12px 12px 14px;transform:rotate(${rot}deg);box-shadow:0 16px 44px rgba(0,0,0,0.55),0 3px 10px rgba(0,0,0,0.3);"><img src="${src}" style="width:${w}px;height:${h}px;object-fit:cover;object-position:${pos};display:block;"/></div>`
const line = (t, size = 66, dim = 1, mt = 0, extra = '') => `<p style="font-family:${SS};font-size:${size}px;font-weight:500;color:rgba(255,255,255,${dim});margin:${mt}px 0 0;line-height:1.3;${extra}">${t}</p>`
const box = (top, inner, align = 'center', l = 90, r = 90, extra = '') => `<div style="position:absolute;top:${top}px;left:${l}px;right:${r}px;text-align:${align};${extra}">${inner}</div>`
const frame = (inner, bg = '#000') => `<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:${bg};">${inner}</div>`
const label = (x, top, w, t, size) => `<div style="position:absolute;left:${x}px;top:${top}px;width:${w}px;text-align:center;">${line(t, size, 0.92)}</div>`

// ── layouts ────────────────────────────────────────────────────────────────
// AD (2 tiles): two big prints side by side, sticker zone below, CTA above the bottom band.
const adArt = (L, keys) => {
  const w = 360, h = 470, top = 600, gap = 48, outer = w + 24, left = Math.round((1080 - (2 * outer + gap)) / 2)
  const tiles = keys.map((k, i) => { const x = left + i * (outer + gap); return pr(enc(VIBES[k].img), x, top, w, h, [-2, 1.5][i], VIBES[k].pos) + label(x, top + h + 56, outer, L.labels[k], 42) }).join('')
  return { html: box(280, line(L.hi) + line(L.collab) + line(L.q, 66, 1, 40)) + tiles + box(1450, line(L.ctaAd, 46, 0.9)), zone: { l: 200, t: 1210, w: 680, h: 220 } }
}
// ORGANIC (4 tiles): 2×2 grid of all four vibes; the native sticker (up to 4 answers) is placed by hand over the lower half —
// overlapping the prints is normal on an organic story, so the zone only marks the safe span.
const organicArt = L => {
  // rows: print (h) + mat (26) + label (~50) must end before the next row starts — 520+350+26+40+50 = 986 < 1010
  const w = 300, h = 350, gap = 40, outer = w + 24, left = Math.round((1080 - (2 * outer + gap)) / 2), rows = [520, 1010]
  const tiles = ORDER.map((k, i) => { const x = left + (i % 2) * (outer + gap), y = rows[Math.floor(i / 2)]; return pr(enc(VIBES[k].img), x, y, w, h, [-2, 1.5, 1.5, -2][i], VIBES[k].pos) + label(x, y + h + 40, outer, L.labels[k], 38) }).join('')
  return { html: box(250, line(L.hi, 58) + line(L.collab, 58) + line(L.q, 58, 1, 30)) + tiles + box(1500, line(L.ctaOrganic, 42, 0.9)), zone: { l: 140, t: 1120, w: 800, h: 360 } }
}

// ── guide overlay (never on the final frame) ───────────────────────────────
const G = '#3ee0ff'
const gt = (t, size = 26, extra = '') => `<p style="font-family:${SS};font-size:${size}px;font-weight:600;color:${G};margin:0;line-height:1.3;${extra}">${t}</p>`
const hatch = 'repeating-linear-gradient(135deg,rgba(62,224,255,0.16) 0 12px,transparent 12px 26px)'
const mockSticker = (zone, q, answers) => `<div style="position:absolute;left:${zone.l + (zone.w - 520) / 2}px;top:${zone.t + 30}px;width:520px;background:#fff;border-radius:22px;box-shadow:0 10px 30px rgba(0,0,0,0.45);overflow:hidden;font-family:${SS};">
  <div style="padding:20px 26px 14px;text-align:center;font-size:30px;font-weight:700;color:#111;">${q}</div>
  ${answers.length === 2
    ? `<div style="display:flex;border-top:2px solid #e8e8e8;"><div style="flex:1;padding:16px 8px;text-align:center;font-size:28px;font-weight:700;color:#7b3fe4;border-right:2px solid #e8e8e8;">${answers[0]}</div><div style="flex:1;padding:16px 8px;text-align:center;font-size:28px;font-weight:700;color:#f2711c;">${answers[1]}</div></div>`
    : answers.map(a => `<div style="border-top:2px solid #e8e8e8;padding:14px 8px;text-align:center;font-size:28px;font-weight:700;color:#7b3fe4;">${a}</div>`).join('')}</div>`
const guide = (zone, q, answers, mode) => `
  <div style="position:absolute;left:0;top:0;width:1080px;height:${SAFE.top}px;background:${hatch};border-bottom:2px dashed ${G};"><div style="position:absolute;left:30px;bottom:14px;">${gt(`top ${SAFE.top}px · covered by ig ui`)}</div></div>
  <div style="position:absolute;left:0;top:${1920 - SAFE.bottom}px;width:1080px;height:${SAFE.bottom}px;background:${hatch};border-top:2px dashed ${G};"><div style="position:absolute;left:30px;right:30px;top:16px;">${gt(`bottom ${SAFE.bottom}px · covered by ig ui`)}${gt(mode === 'ad' ? 'guide frame — do not upload. ad poll: exactly 2 answers · question ≤80 chars · answers ≤24 · instagram stories must be the only placement' : 'guide frame — do not post. organic poll sticker: up to 4 answers · you see who voted per option · overlapping the prints is fine', 24, 'margin-top:14px;opacity:0.9')}</div></div>
  <div style="position:absolute;left:${zone.l}px;top:${zone.t}px;width:${zone.w}px;height:${zone.h}px;border:3px dashed ${G};border-radius:18px;"><div style="position:absolute;left:18px;top:8px;">${gt(mode === 'ad' ? '▼ poll sticker here (ads manager → add interactive poll)' : '▼ poll sticker here (instagram app → poll sticker)', 24)}</div></div>
  ${mockSticker(zone, q, answers)}`

const n = s => [...s].length
const pollMd = () => `# v17b poll story — sticker copy (pinterest vibes)\n\n` +
  `## ad poll (--tiles=2): exactly 2 answers, question ≤80, answers ≤24; Instagram Stories must be the ONLY placement.\n` +
  Object.entries(LANGS).map(([k, L]) => `- ${k}: \`${L.pollQ}\` → \`${L.labels.indoor}\` / \`${L.labels.sea}\` (default pair) · alt pair \`${L.labels.oldtown}\` / \`${L.labels.sea}\``).join('\n') +
  `\n\n## organic poll (--tiles=4): native sticker, up to 4 answers, posted from @madebyaidan (you see who voted per option → DM them).\n` +
  Object.entries(LANGS).map(([k, L]) => `- ${k}: \`${L.pollQ}\` → ${ORDER.map(o => `\`${L.labels[o]}\` (${n(L.labels[o])})`).join(' / ')}`).join('\n') +
  `\n\n## placement\n- ad: sticker inside the dashed box on 01-poll-guide.jpg (centre ≈ 50% across, 69% down, width ≈ 48%).\n- organic: drop the sticker over the lower half; resize so all four answers show above the reply bar.\n\nImages: Pinterest references from the sign-up picker library (public/images/moodboard on main) — fine for the organic story; your call for the paid ad.\n`

async function render() {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 2 })
  const root = path.join(__dirname, `output-${CITY.slug}-casting-v17b-poll`)
  for (const lang of (LANG ? [LANG] : Object.keys(LANGS))) {
    const L = LANGS[lang]
    if (!L) throw new Error(`unknown --lang=${lang}`)
    const mode = TILES === 4 ? 'organic' : 'ad'
    const keys = mode === 'ad' ? PAIR : ORDER
    if (keys.some(k => !VIBES[k])) throw new Error(`unknown vibe in --pair (${Object.keys(VIBES).join('|')})`)
    const dir = path.join(root, lang, mode === 'ad' ? `ad-${keys.join('-')}` : 'organic-4')
    fs.mkdirSync(dir, { recursive: true })
    const { html, zone } = mode === 'ad' ? adArt(L, keys) : organicArt(L)
    const answers = keys.map(k => L.labels[k])
    for (const [name, body] of [['01-poll', frame(html)], ['01-poll-guide', frame(html + guide(zone, L.pollQ, answers, mode))]]) {
      const page = await ctx.newPage()
      await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>*{box-sizing:border-box}html,body{margin:0;width:1080px;height:1920px;background:#000;overflow:hidden}body{-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}</style></head><body>${body}</body></html>`, { waitUntil: 'load' })
      await page.evaluate(() => document.fonts.ready)
      await page.waitForTimeout(250)
      await page.screenshot({ path: path.join(dir, `${name}.jpg`), type: 'jpeg', quality: 92, scale: 'css' })
      await page.close()
    }
    console.log(`${CITY.name} casting v17b poll [${lang}] ${mode} ${keys.join('+')} -> ${dir}`)
  }
  fs.writeFileSync(path.join(root, 'POLL.md'), pollMd())
  await browser.close()
  console.log('Done.')
}
render()
