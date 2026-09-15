import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

// ANTALYA CASTING CALLOUT — v17 · "pick your vibe" as a Meta POLL story ad (Aidan, 9/13).
// One static 1080x1920 Stories ad frame per language, built to carry Meta's interactive poll sticker, which Aidan adds
// in Ads Manager (Stories placement → Stories customisations → "Add interactive poll"). Lineage: concept v6 "pick your vibe"
// in render-antalya-casting-v3b-v7b.mjs — black frame, centred lowercase system-sans typed text, matted film prints.
// The options come from applicants' moodboard picks (indoor 284 > sea 161 > old town 118 > boat 90). Ad polls allow exactly
// TWO answers (organic polls allow up to 4), question ≤80 chars, each answer ≤24 chars — so the default frame shows two
// prints (indoor · by the sea) that map 1:1 onto the two poll answers; --tiles=3 renders an alt with old town added.
// Safe zones: the top ~250px and bottom ~340px are covered by IG UI (Meta's current ads guide says 14% top / 35% bottom /
// 6% sides). The poll sticker zone (ZONE, lower-middle) is deliberately empty in the final frame. Every frame renders twice:
// 01-poll.jpg (final, NO guide marks) + 01-poll-guide.jpg (dashed sticker outline, safe bands, mock sticker with the copy).
// POLL.md in the output dir has the sticker question/answers per language. "free" is said once per frame; no dates.
// Run from repo root: node marketing/carousel/render-antalya-casting-v17-poll.mjs [--lang=en|tr|ru] [--tiles=3]
// Outputs (gitignored): marketing/carousel/output-antalya-casting-v17-poll/<lang>/01-poll.jpg + 01-poll-guide.jpg
//                       (--tiles=3 → <lang>/alt-3-tiles/)
const CITY = { name: 'Antalya', slug: 'antalya' }
const ARG = k => process.argv.find(a => a.startsWith(`--${k}=`))?.split('=')[1]
const LANG = ARG('lang')                    // en | tr | ru | unset = all three
const TILES = Number(ARG('tiles') || 2)     // 2 = default (matches the two poll answers) · 3 = alt with old town

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const IMG = '/Users/aidantorrence/Documents/aidan-modern/public/images'
const enc = p => 'data:image/jpeg;base64,' + fs.readFileSync(path.join(IMG, p)).toString('base64')

// vibe prints, ranked by applicants' moodboard picks — indoor is never dropped. all local portfolio prints the antalya
// sets already use: the sign-up form's own 'indoor' print, the v14-v16 hero sea print, the v4 green-door print.
const VIBES = [
  { key: 'indoor', img: 'large/000048750034.jpg', pos: 'center top' },
  { key: 'sea', img: 'large/aidanto-r4-047-22.jpg', pos: 'center top' },
  { key: 'oldtown', img: 'headliners/000050-6.jpg', pos: 'center top' },
]

const LANGS = {
  en: { hi: "hi, i'm in antalya.", collab: 'free photo collab', q: 'which vibe would you pick?',
    labels: ['indoor', 'by the sea', 'old town'], cta: 'vote, then dm me your pick 🙂',
    poll: { q: 'which vibe?', a: ['indoor', 'by the sea'] } },
  tr: { hi: "selam, antalya'dayım.", collab: 'ücretsiz fotoğraf çekimi', q: 'sen hangisini seçerdin?',
    labels: ['iç mekan', 'deniz kenarı', 'eski şehir'], cta: "oy ver, sonra seçimini dm'le 🙂",
    poll: { q: 'hangisi?', a: ['iç mekan', 'deniz kenarı'] } },
  ru: { hi: 'привет, я в анталии.', collab: 'бесплатная фотосессия', q: 'какой вайб выберешь?',
    labels: ['в помещении', 'у моря', 'старый город'], cta: 'проголосуй,<br/>потом напиши мне свой выбор 🙂',
    poll: { q: 'какой вайб?', a: ['в помещении', 'у моря'] } },
}

// poll sticker zone — kept empty on the final frame; the guide frame outlines it. bands = IG UI cover.
const ZONE = { l: 200, t: 1210, w: 680, h: 220 }
const SAFE = { top: 250, bottom: 340 }

const SS = "-apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif"
const pr = (src, l, t, w, h, rot, pos = 'center top') => `<div style="position:absolute;left:${l}px;top:${t}px;width:${w + 24}px;height:${h + 26}px;background:#fafafa;padding:12px 12px 14px;transform:rotate(${rot}deg);box-shadow:0 16px 44px rgba(0,0,0,0.55),0 3px 10px rgba(0,0,0,0.3);"><img src="${src}" style="width:${w}px;height:${h}px;object-fit:cover;object-position:${pos};display:block;"/></div>`
const line = (t, size = 66, dim = 1, mt = 0, extra = '') => `<p style="font-family:${SS};font-size:${size}px;font-weight:500;color:rgba(255,255,255,${dim});margin:${mt}px 0 0;line-height:1.3;${extra}">${t}</p>`
const box = (top, inner, align = 'center', l = 90, r = 90, extra = '') => `<div style="position:absolute;top:${top}px;left:${l}px;right:${r}px;text-align:${align};${extra}">${inner}</div>`
const frame = (inner, bg = '#000') => `<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:${bg};">${inner}</div>`

// ── the frame ──────────────────────────────────────────────────────────────
const layout = n => n === 3
  ? { w: 280, h: 380, top: 610, gap: 24, rot: [-2.5, 1.5, -2], label: 40 }
  : { w: 360, h: 470, top: 610, gap: 48, rot: [-2, 1.5], label: 42 }

const art = (L, n) => {
  const g = layout(n), outer = g.w + 24, total = n * outer + (n - 1) * g.gap, left = Math.round((1080 - total) / 2)
  const tiles = VIBES.slice(0, n).map((v, i) => {
    const x = left + i * (outer + g.gap)
    return pr(enc(v.img), x, g.top, g.w, g.h, g.rot[i], v.pos) +
      `<div style="position:absolute;left:${x}px;top:${g.top + g.h + 26 + 30}px;width:${outer}px;text-align:center;">${line(L.labels[i], g.label, 0.92)}</div>`
  }).join('')
  return box(280, line(L.hi) + line(L.collab) + line(L.q, 66, 1, 40)) + tiles + box(1450, line(L.cta, 46, 0.9))
}

// ── guide overlay (never on the final frame) ───────────────────────────────
const G = '#3ee0ff'
const gt = (t, size = 26, extra = '') => `<p style="font-family:${SS};font-size:${size}px;font-weight:600;color:${G};margin:0;line-height:1.3;${extra}">${t}</p>`
const hatch = 'repeating-linear-gradient(135deg,rgba(62,224,255,0.16) 0 12px,transparent 12px 26px)'
const mockSticker = p => `<div style="position:absolute;left:${ZONE.l + (ZONE.w - 520) / 2}px;top:${ZONE.t + 46}px;width:520px;background:#fff;border-radius:22px;box-shadow:0 10px 30px rgba(0,0,0,0.45);overflow:hidden;font-family:${SS};">
  <div style="padding:22px 26px 16px;text-align:center;font-size:30px;font-weight:700;color:#111;">${p.q}</div>
  <div style="display:flex;border-top:2px solid #e8e8e8;"><div style="flex:1;padding:18px 8px;text-align:center;font-size:30px;font-weight:700;color:#7b3fe4;border-right:2px solid #e8e8e8;">${p.a[0]}</div><div style="flex:1;padding:18px 8px;text-align:center;font-size:30px;font-weight:700;color:#f2711c;">${p.a[1]}</div></div></div>`
const guide = L => `
  <div style="position:absolute;left:0;top:0;width:1080px;height:${SAFE.top}px;background:${hatch};border-bottom:2px dashed ${G};"><div style="position:absolute;left:30px;bottom:14px;">${gt(`top ${SAFE.top}px · covered by ig ui (profile, progress bar)`)}</div></div>
  <div style="position:absolute;left:0;top:${1920 - SAFE.bottom}px;width:1080px;height:${SAFE.bottom}px;background:${hatch};border-top:2px dashed ${G};"><div style="position:absolute;left:30px;right:30px;top:16px;">${gt(`bottom ${SAFE.bottom}px · covered by ig ui (cta / reply bar)`)}${gt('guide frame — do not upload. poll sticker: question ≤80 chars · exactly 2 answers · ≤24 chars each', 24, 'margin-top:14px;opacity:0.9')}${gt('meta ads guide: keep 14% top / 35% bottom / 6% sides free of key elements', 24, 'margin-top:6px;opacity:0.9')}</div></div>
  <div style="position:absolute;left:0;top:${Math.round(1920 * 0.65)}px;width:1080px;border-top:2px dotted rgba(62,224,255,0.55);"><div style="position:absolute;right:30px;top:4px;">${gt('meta 35% line', 22, 'opacity:0.8')}</div></div>
  <div style="position:absolute;left:${ZONE.l}px;top:${ZONE.t}px;width:${ZONE.w}px;height:${ZONE.h}px;border:3px dashed ${G};border-radius:18px;"><div style="position:absolute;left:18px;top:8px;">${gt('▼ poll sticker goes here (ads manager → add interactive poll)', 24)}</div></div>
  ${mockSticker(L.poll)}`

// ── POLL.md — sticker copy per language ────────────────────────────────────
const n = s => [...s].length
const pollMd = () => {
  const cy = Math.round((ZONE.t + ZONE.h / 2) / 1920 * 100), cx = Math.round((ZONE.l + ZONE.w / 2) / 1080 * 100)
  return `# v17 poll story ad — sticker copy\n\nAdd in Ads Manager: Stories placement → Stories customisations → **Add interactive poll**.\nAd polls take exactly **2 answers** (question ≤ 80 chars, each answer ≤ 24 chars).\n\n` +
    Object.entries(LANGS).map(([k, L]) => `## ${k}\n- question: \`${L.poll.q}\` (${n(L.poll.q)} chars) — or the full line \`${L.q}\` (${n(L.q)} chars)\n- answer 1: \`${L.poll.a[0]}\` (${n(L.poll.a[0])} chars)\n- answer 2: \`${L.poll.a[1]}\` (${n(L.poll.a[1])} chars)\n- third vibe (not pollable in ads): \`${L.labels[2]}\` — used only by --tiles=3\n`).join('\n') +
    `\n## placement\nPut the sticker inside the dashed box on \`01-poll-guide.jpg\`: x ${ZONE.l}–${ZONE.l + ZONE.w}px, y ${ZONE.t}–${ZONE.t + ZONE.h}px of 1080x1920 → centre ≈ ${cx}% across, ${cy}% down, width ≈ ${Math.round(520 / 1080 * 100)}% of the frame, rotation 0.\nUpload \`01-poll.jpg\` (no guide marks). Keep the top ${SAFE.top}px / bottom ${SAFE.bottom}px clear (Meta: 14% top / 35% bottom / 6% sides).\n\n## sources\n- Meta Business Help — polling sticker ads: https://www.facebook.com/business/help/292906701405923\n- Meta ads guide, Instagram Stories image (safe area 14% / 35% / 6%): https://www.facebook.com/business/ads-guide/update/image/instagram-story\n- 2 answers · 80 / 24 chars: https://storrito.com/resources/instagram-stories-poll-ad/ · https://www.socialmediaexaminer.com/how-to-create-instagram-stories-polling-sticker-ads/\n- Sprinklr (Ads Manager fields: width / rotation / horizontal + vertical 0–100): https://www.sprinklr.com/help/articles/facebook-ad-formats/compose-interactive-polls-for-instagram-story-ads/67c6aebdc10b2770b79eebae\n`
}

async function render() {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 2 })
  const root = path.join(__dirname, `output-${CITY.slug}-casting-v17-poll`)
  const langs = LANG ? [LANG] : Object.keys(LANGS)
  for (const lang of langs) {
    const L = LANGS[lang]
    if (!L) throw new Error(`unknown --lang=${lang} (en|tr|ru)`)
    const dir = TILES === 3 ? path.join(root, lang, 'alt-3-tiles') : path.join(root, lang)
    fs.mkdirSync(dir, { recursive: true })
    const a = art(L, TILES)
    for (const [name, html] of [['01-poll', frame(a)], ['01-poll-guide', frame(a + guide(L))]]) {
      const page = await ctx.newPage()
      await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>*{box-sizing:border-box}html,body{margin:0;width:1080px;height:1920px;background:#000;overflow:hidden}body{-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}</style></head><body>${html}</body></html>`, { waitUntil: 'load' })
      await page.evaluate(() => document.fonts.ready)
      await page.waitForTimeout(250)
      await page.screenshot({ path: path.join(dir, `${name}.jpg`), type: 'jpeg', quality: 92, scale: 'css' })
      await page.close()
    }
    console.log(`${CITY.name} casting v17 poll [${lang}] ${TILES} tiles -> ${dir}`)
  }
  fs.writeFileSync(path.join(root, 'POLL.md'), pollMd())
  await browser.close()
  console.log('Done.')
}
render()
