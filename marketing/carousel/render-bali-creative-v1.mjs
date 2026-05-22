import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, 'output-bali-creative-v1')
const NEW_DIR = '/Users/aidantorrence/Documents/aidan-modern/public/images/new'
fs.mkdirSync(OUT, { recursive: true })

function n(f) {
  return 'data:image/jpeg;base64,' + fs.readFileSync(path.join(NEW_DIR, f)).toString('base64')
}

const SERIF = "Georgia, 'Times New Roman', serif"
const SANS = "Inter, -apple-system, system-ui, sans-serif"
const MONO = "'Courier New', monospace"
const S = 'text-shadow: 0 3px 6px rgba(0,0,0,1), 0 10px 40px rgba(0,0,0,0.8), 0 0 100px rgba(0,0,0,0.5);'
const grain = '<div style="position:absolute;inset:0;pointer-events:none;opacity:0.08;mix-blend-mode:soft-light;background-image:radial-gradient(circle at 14% 18%, rgba(255,255,255,0.5), transparent 17%),radial-gradient(circle at 84% 12%, rgba(255,255,255,0.28), transparent 15%),repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0 1px, transparent 1px 4px);"></div>'

// Photos — all fresh picks
const a = n('000023.jpg')       // sitting on tile floor, denim
const b = n('000025.jpg')       // HK taxi pole, sequin top
const c = n('000027.jpg')       // blue peeling door, sequin top
const d = n('000029-3.jpg')     // bar counter, lace bra, white shirt
const e = n('000020-4.jpg')     // chongqing street sign, brown dress
const f = n('000022.jpg')       // night market, checkered dress
const g = n('000024.jpg')       // sitting on bench, looking down
const h = n('000026-8.jpg')     // graffiti wall, market alley
const i = n('000028-9.jpg')     // close up, earring
const j = n('000030.jpg')       // against painted wall, market
const k = n('000021.jpg')       // sitting on floor, white top
const l = n('000023-6.jpg')     // tile wall close up
const m = n('000025-3.jpg')     // street at night, walking
const nn = n('000027-3.jpg')    // close up, peeling paint
const o = n('000008-3.jpg')     // corset circular frame (Seoul)
const p = n('000016.jpg')       // close up hands face
const q = n('000005-3.jpg')     // silver dress cafe (Taipei)
const r = n('000013-3.jpg')     // night dragon top (HK)
const s = n('000017-4.jpg')     // lying down pink
const t = n('000009.jpg')       // market stall dark dress
const u = n('000015-3.jpg')     // night street fashion
const v = n('000012.jpg')       // dark dress shutter

const slides = []

// ── SLIDE 1: Hook — full bleed, big text ──
slides.push({ name: '01-hook', html:
  '<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">' +
  '<img src="'+q+'" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center top;filter:saturate(1.1) contrast(1.05);"/>' +
  '<div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(0,0,0,0.1) 0%, transparent 15%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.96) 100%);"></div>' +
  '<p style="position:absolute;top:60px;left:64px;font-family:'+SANS+';font-size:24px;font-weight:700;color:rgba(255,255,255,0.7);letter-spacing:0.12em;text-transform:uppercase;margin:0;'+S+'">Shot on 35mm film</p>' +
  '<div style="position:absolute;bottom:540px;left:64px;right:64px;"><p style="font-family:'+SERIF+';font-size:108px;font-weight:700;font-style:italic;color:white;line-height:0.92;margin:0;'+S+'">I\'m looking for<br/>models in Bali.</p></div>' +
  '<div style="position:absolute;bottom:420px;left:64px;right:64px;"><p style="font-family:'+SANS+';font-size:44px;font-weight:500;color:rgba(255,255,255,0.85);line-height:1.35;margin:0;'+S+'">Sign up if you want<br/>photos like this.</p></div>' +
  grain + '</div>'
})

// ── SLIDE 2: Contact sheet — 35mm film strip with sprocket holes ──
slides.push({ name: '02-contact-sheet', html:
  '<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#1a1a1a;">' +
  // Film strip background
  '<div style="position:absolute;left:0;top:0;width:1080px;height:1920px;background:#1a1a1a;">' +
  // Sprocket holes left
  Array.from({length:12}, (_,i) => '<div style="position:absolute;left:20px;top:'+(40+i*155)+'px;width:40px;height:28px;background:#0a0a0a;border-radius:4px;"></div>').join('') +
  // Sprocket holes right
  Array.from({length:12}, (_,i) => '<div style="position:absolute;right:20px;top:'+(40+i*155)+'px;width:40px;height:28px;background:#0a0a0a;border-radius:4px;"></div>').join('') +
  '</div>' +
  // Photos in film frames — 5 frames vertically
  '<img src="'+a+'" style="position:absolute;left:90px;top:30px;width:900px;height:340px;object-fit:cover;object-position:center top;"/>' +
  '<img src="'+b+'" style="position:absolute;left:90px;top:390px;width:900px;height:340px;object-fit:cover;object-position:center top;"/>' +
  '<img src="'+c+'" style="position:absolute;left:90px;top:750px;width:900px;height:340px;object-fit:cover;object-position:center top;"/>' +
  '<img src="'+d+'" style="position:absolute;left:90px;top:1110px;width:900px;height:340px;object-fit:cover;object-position:center top;"/>' +
  '<img src="'+e+'" style="position:absolute;left:90px;top:1470px;width:900px;height:340px;object-fit:cover;object-position:center top;"/>' +
  // Frame numbers
  '<p style="position:absolute;left:100px;top:1830px;font-family:'+MONO+';font-size:16px;color:rgba(255,180,60,0.6);margin:0;">KODAK 35MM  &nbsp; 13 &nbsp; 14 &nbsp; 15 &nbsp; 16 &nbsp; 17</p>' +
  '<p style="position:absolute;right:100px;top:1830px;font-family:'+SANS+';font-size:20px;font-weight:600;color:rgba(255,255,255,0.5);letter-spacing:0.1em;text-transform:uppercase;margin:0;">Hong Kong \u00b7 35mm</p>' +
  grain + '</div>'
})

// ── SLIDE 3: Magazine spread — big text panel + inset photo ──
slides.push({ name: '03-magazine', html:
  '<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#f5f0e6;">' +
  // Top half — photo
  '<img src="'+p+'" style="position:absolute;left:0;top:0;width:1080px;height:1100px;object-fit:cover;object-position:center top;"/>' +
  // Bottom panel — warm paper
  '<div style="position:absolute;left:0;top:1060px;width:1080px;height:860px;background:#f5f0e6;"></div>' +
  // Text on paper
  '<p style="position:absolute;left:64px;top:1100px;font-family:'+SANS+';font-size:16px;font-weight:700;color:rgba(0,0,0,0.3);letter-spacing:0.15em;text-transform:uppercase;margin:0;">Kaohsiung \u00b7 Shot on film</p>' +
  '<p style="position:absolute;left:64px;top:1150px;right:64px;font-family:'+SERIF+';font-size:72px;font-weight:700;font-style:italic;color:#1a1a1a;line-height:0.95;margin:0;">Every face<br/>tells a<br/>different story.</p>' +
  '<p style="position:absolute;left:64px;top:1430px;right:200px;font-family:'+SANS+';font-size:28px;color:rgba(0,0,0,0.45);line-height:1.5;margin:0;">I direct everything. No experience needed. All shot on 35mm film across 13 cities in Asia.</p>' +
  // Small inset photo bottom right
  '<div style="position:absolute;right:40px;bottom:60px;width:240px;height:320px;background:white;padding:10px;transform:rotate(3deg);box-shadow:4px 4px 20px rgba(0,0,0,0.15);"><img src="'+t+'" style="width:220px;height:300px;object-fit:cover;object-position:center top;display:block;"/></div>' +
  '</div>'
})

// ── SLIDE 4: Split screen — two portraits side by side ──
slides.push({ name: '04-split', html:
  '<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">' +
  '<img src="'+r+'" style="position:absolute;left:0;top:0;width:536px;height:1920px;object-fit:cover;object-position:center top;"/>' +
  '<img src="'+u+'" style="position:absolute;left:544px;top:0;width:536px;height:1920px;object-fit:cover;object-position:center top;"/>' +
  '<div style="position:absolute;left:536px;top:0;width:8px;height:1920px;background:#000;"></div>' +
  // Text overlay at bottom spanning both
  '<div style="position:absolute;bottom:0;left:0;right:0;height:400px;background:linear-gradient(180deg, transparent, rgba(0,0,0,0.95));"></div>' +
  '<p style="position:absolute;bottom:260px;left:64px;font-family:'+SANS+';font-size:20px;font-weight:700;color:rgba(255,255,255,0.5);letter-spacing:0.12em;text-transform:uppercase;margin:0;'+S+'">Hong Kong \u00b7 Two strangers \u00b7 One night</p>' +
  '<p style="position:absolute;bottom:140px;left:64px;right:64px;font-family:'+SERIF+';font-size:64px;font-weight:700;font-style:italic;color:white;line-height:0.95;margin:0;'+S+'">Same camera.<br/>Different energy.</p>' +
  grain + '</div>'
})

// ── SLIDE 5: Scattered prints on warm paper background ──
slides.push({ name: '05-warm-scatter', html:
  '<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#f0e8d8;">' +
  '<div style="position:absolute;inset:0;background:linear-gradient(170deg, #faf6ee 0%, #f0e8d8 50%, #e5d8c4 100%);"></div>' +
  '<div style="position:absolute;left:40px;top:100px;width:420px;height:560px;background:white;padding:14px;transform:rotate(-3deg);box-shadow:4px 4px 20px rgba(0,0,0,0.12);"><img src="'+f+'" style="width:392px;height:532px;object-fit:cover;object-position:center top;display:block;"/></div>' +
  '<div style="position:absolute;left:480px;top:60px;width:460px;height:600px;background:white;padding:14px;transform:rotate(2.5deg);box-shadow:4px 4px 20px rgba(0,0,0,0.12);"><img src="'+g+'" style="width:432px;height:572px;object-fit:cover;object-position:center top;display:block;"/></div>' +
  '<div style="position:absolute;left:80px;top:700px;width:480px;height:640px;background:white;padding:14px;transform:rotate(2deg);box-shadow:4px 4px 20px rgba(0,0,0,0.12);"><img src="'+h+'" style="width:452px;height:612px;object-fit:cover;object-position:center top;display:block;"/></div>' +
  '<div style="position:absolute;left:500px;top:720px;width:440px;height:580px;background:white;padding:14px;transform:rotate(-2.5deg);box-shadow:4px 4px 20px rgba(0,0,0,0.12);"><img src="'+i+'" style="width:412px;height:552px;object-fit:cover;object-position:center top;display:block;"/></div>' +
  // Text at bottom
  '<p style="position:absolute;bottom:180px;left:64px;font-family:'+SANS+';font-size:18px;font-weight:700;color:rgba(0,0,0,0.3);letter-spacing:0.15em;text-transform:uppercase;margin:0;">Chongqing \u00b7 Taipei \u00b7 HK \u00b7 35mm film</p>' +
  '<p style="position:absolute;bottom:80px;left:64px;right:64px;font-family:'+SERIF+';font-size:52px;font-weight:700;font-style:italic;color:rgba(0,0,0,0.7);line-height:1.0;margin:0;">Real people. Real places.</p>' +
  '</div>'
})

// ── SLIDE 6: Stacked diptych — two tall photos stacked with text between ──
slides.push({ name: '06-diptych', html:
  '<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#0a0a0a;">' +
  '<img src="'+o+'" style="position:absolute;left:60px;top:60px;width:960px;height:720px;object-fit:cover;object-position:center top;"/>' +
  // Text band in the middle
  '<div style="position:absolute;left:0;top:780px;width:1080px;height:200px;background:#0a0a0a;display:flex;align-items:center;padding:0 64px;">' +
  '<p style="font-family:'+SERIF+';font-size:56px;font-weight:700;font-style:italic;color:white;line-height:1.0;margin:0;'+S+'">Seoul on top.<br/>Taipei below.</p>' +
  '</div>' +
  '<img src="'+q+'" style="position:absolute;left:60px;top:980px;width:960px;height:720px;object-fit:cover;object-position:center top;"/>' +
  '<p style="position:absolute;bottom:60px;left:64px;font-family:'+SANS+';font-size:20px;font-weight:600;color:rgba(255,255,255,0.4);letter-spacing:0.1em;text-transform:uppercase;margin:0;'+S+'">Both shot on 35mm \u00b7 @madebyaidan</p>' +
  grain + '</div>'
})

// ── SLIDE 7: Full bleed hero — intimate ──
slides.push({ name: '07-intimate', html:
  '<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">' +
  '<img src="'+s+'" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;filter:saturate(1.08);"/>' +
  '<div style="position:absolute;inset:0;background:linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.9) 100%);"></div>' +
  '<div style="position:absolute;bottom:440px;left:64px;right:64px;">' +
  '<p style="font-family:'+SERIF+';font-size:88px;font-weight:700;font-style:italic;color:white;line-height:0.95;margin:0;'+S+'">The quiet<br/>ones are<br/>always best.</p>' +
  '</div>' +
  '<div style="position:absolute;bottom:360px;left:64px;right:64px;">' +
  '<p style="font-family:'+SANS+';font-size:34px;font-weight:500;color:rgba(255,255,255,0.7);margin:0;'+S+'">35mm film. Directed by me.</p>' +
  '</div>' +
  grain + '</div>'
})

// ── SLIDE 8: Dark scattered with large prints — editorial table ──
slides.push({ name: '08-editorial', html:
  '<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#080a0e;">' +
  '<div style="position:absolute;inset:0;background:linear-gradient(170deg, #0c1420 0%, #080c14 50%, #060a10 100%);"></div>' +
  '<div style="position:absolute;inset:0;background:radial-gradient(circle at 20% 20%, rgba(80,140,220,0.12), transparent 30%), radial-gradient(circle at 80% 80%, rgba(220,170,100,0.08), transparent 25%);"></div>' +
  '<p style="position:absolute;left:64px;top:40px;font-family:'+SANS+';font-size:24px;font-weight:700;color:rgba(255,255,255,0.7);letter-spacing:0.12em;text-transform:uppercase;margin:0;'+S+'">La Union \u00b7 Singapore \u00b7 Ulaanbaatar</p>' +
  '<div style="position:absolute;left:50px;top:90px;width:340px;height:480px;background:white;padding:14px;transform:rotate(-3.5deg);box-shadow:0 8px 40px rgba(0,0,0,0.45);"><img src="'+j+'" style="width:312px;height:452px;object-fit:cover;object-position:center top;display:block;"/></div>' +
  '<div style="position:absolute;left:420px;top:70px;width:360px;height:500px;background:white;padding:14px;transform:rotate(2deg);box-shadow:0 8px 40px rgba(0,0,0,0.45);"><img src="'+k+'" style="width:332px;height:472px;object-fit:cover;object-position:center top;display:block;"/></div>' +
  '<div style="position:absolute;left:760px;top:110px;width:280px;height:400px;background:white;padding:12px;transform:rotate(-1.5deg);box-shadow:0 8px 40px rgba(0,0,0,0.45);"><img src="'+l+'" style="width:256px;height:376px;object-fit:cover;object-position:center top;display:block;"/></div>' +
  '<div style="position:absolute;left:80px;top:600px;width:380px;height:520px;background:white;padding:14px;transform:rotate(2.5deg);box-shadow:0 8px 40px rgba(0,0,0,0.45);"><img src="'+m+'" style="width:352px;height:492px;object-fit:cover;object-position:center top;display:block;"/></div>' +
  '<div style="position:absolute;left:480px;top:620px;width:360px;height:500px;background:white;padding:14px;transform:rotate(-2deg);box-shadow:0 8px 40px rgba(0,0,0,0.45);"><img src="'+nn+'" style="width:332px;height:472px;object-fit:cover;object-position:center top;display:block;"/></div>' +
  '<div style="position:absolute;bottom:80px;left:64px;right:64px;">' +
  '<p style="font-family:'+SANS+';font-size:34px;font-weight:500;color:rgba(255,255,255,0.85);line-height:1.4;margin:0;'+S+'">I find people worth shooting everywhere.</p>' +
  '</div>' +
  grain + '</div>'
})

// ── SLIDE 9: "This could be you" — full bleed ──
slides.push({ name: '09-you', html:
  '<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">' +
  '<img src="'+c+'" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center top;filter:saturate(1.08);"/>' +
  '<div style="position:absolute;inset:0;background:linear-gradient(180deg, transparent 35%, rgba(0,0,0,0.9) 100%);"></div>' +
  '<div style="position:absolute;bottom:480px;left:64px;right:64px;">' +
  '<p style="font-family:'+SERIF+';font-size:108px;font-weight:700;font-style:italic;color:white;line-height:0.92;margin:0;'+S+'">This could<br/>be you.</p>' +
  '</div>' +
  '<div style="position:absolute;bottom:400px;left:64px;right:64px;">' +
  '<p style="font-family:'+SANS+';font-size:36px;font-weight:500;color:rgba(255,255,255,0.8);margin:0;'+S+'">Sign up if you want photos like this.</p>' +
  '</div>' +
  grain + '</div>'
})

// ── SLIDE 10: CTA ──
slides.push({ name: '10-cta', html:
  '<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">' +
  '<img src="'+v+'" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center top;filter:saturate(1.1) brightness(0.5);"/>' +
  '<div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.15) 30%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.95) 100%);"></div>' +
  '<div style="position:absolute;bottom:520px;left:64px;right:64px;">' +
  '<p style="font-family:'+SERIF+';font-size:108px;font-weight:700;font-style:italic;color:white;line-height:0.92;margin:0;'+S+'">Sign up.</p>' +
  '</div>' +
  '<div style="position:absolute;bottom:380px;left:64px;right:64px;">' +
  '<p style="font-family:'+SANS+';font-size:38px;font-weight:600;color:white;margin:0;'+S+'">Click the link below to sign up.</p>' +
  '<p style="font-family:'+SANS+';font-size:32px;color:rgba(255,255,255,0.7);margin:20px 0 0;'+S+'">I handle everything. No experience needed.</p>' +
  '</div>' +
  grain + '</div>'
})

async function render() {
  console.log('Rendering ' + slides.length + ' slides...')
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 })
  for (let i = 0; i < slides.length; i++) {
    const s = slides[i]
    const page = await ctx.newPage()
    await page.setContent('<!doctype html><html><head><style>*{box-sizing:border-box}html,body{margin:0;width:1080px;height:1920px;background:#000;overflow:hidden}body{-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}</style></head><body>' + s.html + '</body></html>', { waitUntil: 'load' })
    await page.waitForTimeout(500)
    await page.screenshot({ path: path.join(OUT, s.name + '.png'), type: 'png' })
    await page.close()
    console.log('  [' + (i+1) + '/' + slides.length + '] ' + s.name)
  }
  await browser.close()
  console.log('\nDone — ' + slides.length + ' slides -> ' + OUT)
}
render()
