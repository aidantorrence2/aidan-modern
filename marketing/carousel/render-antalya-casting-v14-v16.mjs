import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Format variations for the SAME open-ended Antalya day-trip model callout.
// No destination, date, route, departure time, or return time is booked.
// v14: invitation / v15: moodboard / v16: photo essay.
// All photography is Aidan's existing portfolio, not destination reference imagery.
const ROOT = path.dirname(fileURLToPath(import.meta.url))
const IMG = path.resolve(ROOT, '../../public/images')
const only = process.argv.find(x => x.startsWith('--only='))?.split('=')[1]
const limit = Number(process.argv.find(x => x.startsWith('--limit='))?.split('=')[1] || 3)
const photo = f => `data:image/jpeg;base64,${fs.readFileSync(path.join(IMG, f)).toString('base64')}`
const P = ['large/aidanto-r4-047-22.jpg', 'large/0604804-0043.jpg', 'large/aidanto-r2-035-16.jpg', 'large/aidanto-r4-053-25.jpg', 'faves/DSC_0310-2.jpg', 'large/manila-gallery-floor-001.jpg']
const line = (text, size = 64, mt = 0, opacity = 1) => `<p data-copy style="font-size:${size}px;margin:${mt}px 0 0;opacity:${opacity};line-height:1.25;font-weight:500">${text}</p>`
const box = (top, content, align = 'left', left = 90, right = 90) => `<div style="position:absolute;top:${top}px;left:${left}px;right:${right}px;text-align:${align}">${content}</div>`
const print = (i, x, y, w, h, rotate = 0) => `<div style="position:absolute;left:${x}px;top:${y}px;width:${w+24}px;padding:12px 12px 18px;background:#fafafa;transform:rotate(${rotate}deg);box-shadow:0 14px 30px #0007"><img src="${photo(P[i])}" style="display:block;width:${w}px;height:${h}px;object-fit:cover;object-position:center top"></div>`
const frame = inner => `<main style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000">${inner}</main>`
const tag = text => line(text, 34, 0, .65)
const handle = top => box(top, line('@madebyaidan', 42, 0, .8), 'center')
const strip = (y = 1110) => print(0, 70, y, 240, 360, -6) + print(1, 395, y+100, 240, 360, 2.5) + print(2, 720, y+175, 240, 360, -3)
const full = (i, inner) => frame(`<img src="${photo(P[i])}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center top"><div style="position:absolute;inset:0;background:linear-gradient(180deg,#0009,transparent 40%,#0009 64%,#000e)"></div>${inner}`)
const slide = (name, html) => ({ name, html })

// Location suggestions checked against https://goturkiye.com/antalya/routes
// Three slides per format: callout / possible places / collab + CTA.
const sets = {
  v14: { title: 'the invitation', slides: [
    slide('01-callout', frame(box(220, line("hi, i'm in antalya.") + line('looking for models<br>for a free photo collab', 64, 72) + line("let’s take a trip<br>+ take some photos", 60, 64) + line('dm me if interested 🙂', 54, 64), 'center') + strip())),
    slide('02-possible-places', frame(box(220, tag('a few places we could go') + line('where could we go?', 72, 30) + line('phaselis', 66, 65) + line('ruins + little bays', 42, 12, .75) + line('olympos / çıralı', 66, 48) + line('ancient ruins + the beach', 42, 12, .75) + line('adrasan', 66, 48) + line('a day by the water', 42, 12, .75) + line('just ideas — we pick one together.<br>or send me somewhere you’ve saved.', 44, 65)) + print(0, 650, 1330, 280, 360, 3))),
    slide('03-collab-cta', frame(box(240, line('let’s make it happen.', 72) + line('free photo collab.<br>photos in about 2 weeks.', 48, 50) + line('we choose the place, day + look together.', 42, 40, .85) + line('dm me if interested 🙂', 66, 65)) + print(3, 290, 920, 480, 570, -2) + handle(1570))),
  ]},
  v15: { title: 'the moodboard', slides: [
    slide('01-callout', frame(box(190, line('looking for models<br>in antalya.', 76)) + print(0, 90, 660, 440, 600, -5) + print(1, 590, 790, 340, 480, 4) + box(1400, line('free photo collab', 50) + line('let’s take a trip + some photos.', 42, 22, .85)))),
    slide('02-possible-places', frame(box(190, line('possible shoot<br>locations.', 82)) + box(580, line('phaselis', 62) + line('ruins + bays', 40, 15, .75) + line('olympos / çıralı', 60, 70) + line('ruins + beach', 40, 15, .75) + line('adrasan', 62, 70) + line('by the water', 40, 15, .75), 'left', 90, 390) + print(0, 680, 560, 260, 370, 5) + print(5, 660, 1060, 280, 360, -4) + box(1480, line('location suggestions welcome.', 44) + line('we’ll agree on a spot before the shoot.', 40, 22, .8)))),
    slide('03-collab-cta', frame(box(200, line('about the shoot.', 88) + line('free photo collab.<br>photos in about 2 weeks.', 46, 45)) + print(0, 100, 780, 360, 500, -5) + print(1, 580, 850, 350, 490, 4) + box(1450, line('dm me if interested', 62) + line('we’ll work out the details over dm.', 40, 25, .85) + line('@madebyaidan', 38, 25, .8)))),
  ]},
  v16: { title: 'the photo essay', slides: [
    slide('01-callout', full(0, box(180, tag('antalya') + line('let’s take<br>a trip.', 96, 32)) + box(1260, line('looking for models', 64) + line('for a free photo collab.<br>let’s take a trip.', 50, 28)))),
    slide('02-possible-places', full(5, box(190, tag('possible places') + line('where could we go?', 72, 25)) + box(1020, line('phaselis<br>olympos / çıralı<br>adrasan', 76) + line('a few ideas, not a set plan.<br>we choose the place together.', 46, 50)))),
    slide('03-collab-cta', full(3, box(1020, line('come shoot with me.', 72) + line('free photo collab.<br>photos in about 2 weeks.', 44, 40) + line('dm me if interested 🙂', 62, 55) + line('let’s pick a place + day.', 44, 30) + line('@madebyaidan', 40, 30, .85)))),
  ]},
}

if (only && !sets[only]) throw new Error(`Unknown format: ${only}`)
const browser = await chromium.launch()
try {
  const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 2 })
  for (const [version, set] of Object.entries(sets)) {
    if (only && only !== version) continue
    const out = path.join(ROOT, `output-antalya-casting-${version}-3slides`, 'antalya')
    fs.mkdirSync(out, { recursive: true })
    const previews = []
    for (const s of set.slides.slice(0, limit)) {
      const page = await ctx.newPage()
      await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>*{box-sizing:border-box}html,body{margin:0;background:#000;color:white;font-family:-apple-system,'Helvetica Neue',sans-serif;-webkit-font-smoothing:antialiased}p{overflow-wrap:normal}</style></head><body>${s.html}</body></html>`)
      await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(i => i.decode())) })
      const issues = await page.evaluate(() => [...document.querySelectorAll('[data-copy]')].flatMap(p => { const r = p.getBoundingClientRect(); return r.left < 0 || r.right > 1080 || r.bottom > 1750 || p.scrollWidth > p.clientWidth ? [p.textContent] : [] }))
      if (issues.length) throw new Error(`${version}/${s.name}: copy overflow: ${issues.join('; ')}`)
      await page.screenshot({ path: path.join(out, `${s.name}.jpg`), type: 'jpeg', quality: 92 })
      previews.push(`<div style="width:270px;height:480px;overflow:hidden;flex:none"><div style="transform:scale(.25);transform-origin:top left">${s.html}</div></div>`)
      await page.close()
    }
    const preview = await browser.newPage({ viewport: { width: 270 * previews.length, height: 480 }, deviceScaleFactor: 2 })
    await preview.setContent(`<html><head><style>*{box-sizing:border-box}body{margin:0;display:flex;color:white;font-family:-apple-system,'Helvetica Neue',sans-serif;-webkit-font-smoothing:antialiased}</style></head><body>${previews.join('')}</body></html>`)
    await preview.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(i => i.decode())) })
    await preview.screenshot({ path: path.join(out, '../preview.jpg'), type: 'jpeg', quality: 90 })
    await preview.close()
    console.log(`${version} / ${set.title}: ${previews.length} slides rendered; images decoded and text bounds passed`)
  }
} finally { await browser.close() }
