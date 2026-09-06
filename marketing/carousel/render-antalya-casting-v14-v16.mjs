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
const limit = Number(process.argv.find(x => x.startsWith('--limit='))?.split('=')[1] || 5)
const photo = f => `data:image/jpeg;base64,${fs.readFileSync(path.join(IMG, f)).toString('base64')}`
const P = ['large/r1-05460-0022.jpg', 'nature/000042-2.jpg', 'faves/000024-3.jpg', 'large/manila-gallery-park-001.jpg', 'headliners/000019-6.jpg', 'large/manila-gallery-floor-001.jpg']
const line = (text, size = 64, mt = 0, opacity = 1) => `<p data-copy style="font-size:${size}px;margin:${mt}px 0 0;opacity:${opacity};line-height:1.25;font-weight:500">${text}</p>`
const box = (top, content, align = 'left', left = 90, right = 90) => `<div style="position:absolute;top:${top}px;left:${left}px;right:${right}px;text-align:${align}">${content}</div>`
const print = (i, x, y, w, h, rotate = 0) => `<div style="position:absolute;left:${x}px;top:${y}px;width:${w+24}px;padding:12px 12px 18px;background:#fafafa;transform:rotate(${rotate}deg);box-shadow:0 14px 30px #0007"><img src="${photo(P[i])}" style="display:block;width:${w}px;height:${h}px;object-fit:cover;object-position:center top"></div>`
const frame = inner => `<main style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000">${inner}</main>`
const tag = text => line(text, 34, 0, .65)
const handle = top => box(top, line('@madebyaidan', 42, 0, .8), 'center')
const strip = (y = 1110) => print(0, 70, y, 240, 360, -6) + print(1, 395, y+100, 240, 360, 2.5) + print(2, 720, y+175, 240, 360, -3)
const full = (i, inner) => frame(`<img src="${photo(P[i])}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center top"><div style="position:absolute;inset:0;background:linear-gradient(180deg,#0009,transparent 40%,#0009 64%,#000e)"></div>${inner}`)
const slide = (name, html) => ({ name, html })

const sets = {
  v14: { title: 'the invitation', slides: [
    slide('01-callout', frame(box(220, line("hi, i'm in antalya.") + line('looking for models<br>for a free photo collab', 64, 72) + line("let’s take a day trip<br>+ shoot some film", 60, 64) + line('dm me if interested 🙂', 54, 64), 'center') + strip())),
    slide('02-idea', frame(box(230, tag('the idea') + line('a day out of town.<br>somewhere worth<br>taking photos.', 76, 35) + line('by the water, among the trees,<br>or somewhere you’ve had saved.', 48, 60) + line('we pick the place together.', 48, 40)) + print(0, 140, 1070, 480, 650, -3))),
    slide('03-work', frame(box(200, line('some of my work') + line('35mm film, natural light.', 44, 20, .8), 'center') + print(1, 80, 500, 410, 650, -3) + print(4, 550, 810, 410, 650, 3))),
    slide('04-collab', frame(box(250, tag('the collab') + line('we plan it together.', 70, 30) + line('the place, the day, the look.', 48, 45) + line('i shoot on 35mm film.<br>you get the full-res scans<br>in about 2 weeks.', 52, 70) + line('free photo collab.<br>we both get photos to share.', 48, 60)) + print(3, 650, 1210, 300, 420, 3))),
    slide('05-cta', frame(box(260, line('fancy a day out?', 76) + line('dm me “antalya” 🙂', 68, 40) + line('let’s work out where to go.', 48, 35, .85), 'center') + print(3, 250, 720, 550, 740, -2) + handle(1540))),
  ]},
  v15: { title: 'the moodboard', slides: [
    slide('01-callout', frame(box(190, line('a day out.<br>a roll of film.<br>you?', 88)) + print(0, 90, 660, 440, 600, -5) + print(1, 590, 790, 340, 480, 4) + box(1400, line('looking for models in antalya', 50) + line('free photo collab · day trips', 44, 22, .85)))),
    slide('02-mood', frame(box(185, line('this kind of feeling.', 70) + line('a few frames from my portfolio', 38, 24, .7)) + print(0, 60, 480, 400, 560, -4) + print(4, 590, 440, 340, 480, 3) + print(1, 480, 1080, 400, 550, -2) + box(1240, line('soft light.<br>a bit of green.<br>no rush.', 46), 'left', 80, 610))),
    slide('03-space', frame(box(190, tag('room for your ideas') + line('somewhere<br>you’ve been<br>wanting to go?', 86, 35)) + print(5, 440, 760, 490, 650, 3) + box(1450, line('send it over.<br>we can build a shoot around it.', 48)))),
    slide('04-notes', frame(box(210, line('a few notes', 74)) + print(3, 70, 470, 370, 560, -4) + box(510, line('35mm film', 58) + line('a place + day<br>we choose together', 44, 50) + line('free photo collab', 44, 50), 'left', 530, 60) + box(1210, line('full-res scans in about 2 weeks.', 48) + line('photos for you.<br>a few for my portfolio too.', 48, 40)))),
    slide('05-cta', frame(box(240, line('let’s make<br>something like this.', 78) + line('dm me “antalya” 🙂', 60, 50)) + print(0, 80, 820, 290, 430, -5) + print(1, 390, 900, 290, 430, 2) + print(4, 700, 830, 270, 410, -3) + handle(1500))),
  ]},
  v16: { title: 'the photo essay', slides: [
    slide('01-callout', full(0, box(180, tag('antalya') + line('let’s get<br>out of town.', 96, 32)) + box(1260, line('looking for models', 64) + line('for a free photo collab.<br>a day trip + 35mm film.', 50, 28)))),
    slide('02-invitation', full(1, box(1210, line('somewhere new.<br>good light.<br>a few rolls of film.', 76) + line('that’s the idea.', 44, 34, .85)))),
    slide('03-together', frame(box(230, line('where are we going?', 70) + line('let’s figure that out together.', 52, 50)) + print(5, 110, 650, 820, 650, -2) + box(1450, line('bring a place you’ve saved,<br>or we’ll find one.', 48)))),
    slide('04-photos', full(4, box(1180, line('a day to remember.<br>photos to keep.', 76) + line('full-res film scans in about 2 weeks.<br>free photo collab, for both our portfolios.', 42, 40)))),
    slide('05-cta', full(3, box(1100, line('in antalya?<br>come shoot with me.', 76) + line('dm me “antalya” 🙂', 58, 45) + line('@madebyaidan', 42, 30, .85)))),
  ]},
}

if (only && !sets[only]) throw new Error(`Unknown format: ${only}`)
const browser = await chromium.launch()
try {
  const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 2 })
  for (const [version, set] of Object.entries(sets)) {
    if (only && only !== version) continue
    const out = path.join(ROOT, `output-antalya-casting-${version}`, 'antalya')
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
