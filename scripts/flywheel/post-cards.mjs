// Render a post card (1080x1350 feed, 1080x1920 story) per live offer: hook text on the dark
// theme, the plain ask, the page address. Output static-offers/posts/<slug>-feed.png and
// -story.png so the gh-pages publish gives every card a public URL (Instagram's publishing API
// needs one). Also writes data/post-queue.json: one pending post per offer, newest first.
import fs from 'node:fs'
import path from 'node:path'
import { chromium } from 'playwright'

const root = path.resolve(new URL('.', import.meta.url).pathname, '../..')
const cfg = JSON.parse(fs.readFileSync(path.join(root, 'flywheel/config.json'), 'utf8'))
const offers = JSON.parse(fs.readFileSync(path.join(root, 'data/offers.json'), 'utf8')).filter(o => o.status !== 'draft' && o.status !== 'killed')
const out = path.join(root, 'static-offers/posts')
fs.mkdirSync(out, { recursive: true })
const only = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1] : null
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
const host = cfg.publicBase.replace(/^https?:\/\//, '')

function card(o, w, h) {
  const big = h > 1500
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  html,body{margin:0;width:${w}px;height:${h}px;background:#0c0c0c;color:#fff;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
  .c{box-sizing:border-box;width:${w}px;height:${h}px;padding:${big ? 160 : 96}px 88px;display:flex;flex-direction:column;justify-content:space-between}
  .k{font-size:30px;letter-spacing:.16em;text-transform:uppercase;color:#9a9a9a}
  h1{font-family:Georgia,'Times New Roman',serif;font-weight:400;font-size:${big ? 78 : 70}px;line-height:1.12;letter-spacing:-.01em;margin:40px 0 0}
  .ask{font-size:38px;line-height:1.4;color:#d6d6d6;margin-top:48px}
  .f{display:flex;justify-content:space-between;align-items:flex-end;border-top:1px solid #2a2a2a;padding-top:36px}
  .n{font-family:Georgia,serif;font-size:40px}.p{color:#9a9a9a;font-size:32px}.u{color:#9a9a9a;font-size:30px}
  </style></head><body><div class="c"><div><p class="k">Not built yet · asking first</p><h1>${esc(o.kit.hook)}</h1><p class="ask">If this sounds like your week: say so and I build it. Link in bio, nothing is charged.</p></div>
  <div class="f"><div><div class="n">${esc(o.name)}</div><div class="p">${esc(o.price)}</div></div><div class="u">${esc(host)}/${esc(o.slug)}</div></div></div></body></html>`
}

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium' })
const page = await browser.newPage()
let n = 0
for (const o of offers) {
  if (only && o.slug !== only) continue
  for (const [tag, w, h] of [['feed', 1080, 1350], ['story', 1080, 1920]]) {
    const file = path.join(out, `${o.slug}-${tag}.png`)
    if (fs.existsSync(file) && !process.argv.includes('--force')) continue
    await page.setViewportSize({ width: w, height: h })
    await page.setContent(card(o, w, h))
    await page.screenshot({ path: file, type: 'png' })
    n++
  }
}
await browser.close()

const qPath = path.join(root, 'data/post-queue.json')
const queue = fs.existsSync(qPath) ? JSON.parse(fs.readFileSync(qPath, 'utf8')) : { _note: 'Post queue. status: pending (needs Aidan\'s approve), approved, posted:<channel>:<id>, skipped. Media URLs are public once gh-pages is published.', posts: [] }
const have = new Set(queue.posts.map(p => p.slug))
for (const o of [...offers].reverse()) {
  if (have.has(o.slug)) continue
  queue.posts.push({
    slug: o.slug, status: 'pending', created: new Date().toISOString().slice(0, 16) + 'Z',
    feed_image: `${cfg.publicBase}/posts/${o.slug}-feed.png`, story_image: `${cfg.publicBase}/posts/${o.slug}-story.png`,
    caption: o.kit.caption.replace(`${host}/${o.slug}`, `${host}/${o.slug} (link in bio)`),
    link: `${cfg.publicBase}/${o.slug}/?src=post`, community: o.kit.community, script: o.kit.script,
  })
}
fs.writeFileSync(qPath, JSON.stringify(queue, null, 2) + '\n')
console.log(`rendered ${n} card(s); queue has ${queue.posts.length} posts (${queue.posts.filter(p => p.status === 'pending').length} pending)`)
