import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, 'output-bali-creative-v7')
const HD = '/Users/aidantorrence/Documents/aidan-modern/public/images/headliners'
const FV = '/Users/aidantorrence/Documents/aidan-modern/public/images/faves'
fs.mkdirSync(OUT, { recursive: true })

function nh(f) { return 'data:image/jpeg;base64,' + fs.readFileSync(path.join(HD, f)).toString('base64') }
function nf(f) { return 'data:image/jpeg;base64,' + fs.readFileSync(path.join(FV, f)).toString('base64') }

const SE = "Georgia, 'Times New Roman', serif"
const SA = "Inter, -apple-system, system-ui, sans-serif"
const SH = 'text-shadow: 0 3px 6px rgba(0,0,0,1), 0 10px 40px rgba(0,0,0,0.8), 0 0 100px rgba(0,0,0,0.5);'
const GR = '<div style="position:absolute;inset:0;pointer-events:none;opacity:0.08;mix-blend-mode:soft-light;background-image:radial-gradient(circle at 14% 18%, rgba(255,255,255,0.5), transparent 17%),radial-gradient(circle at 84% 12%, rgba(255,255,255,0.28), transparent 15%);"></div>'

function img(s,l,t,w,h,x){x=x||'';return '<img src="'+s+'" style="position:absolute;left:'+l+'px;top:'+t+'px;width:'+w+'px;height:'+h+'px;object-fit:cover;object-position:center top;display:block;'+x+'"/>'}
function pr(s,l,t,w,h,r,b){b=b||12;return '<div style="position:absolute;left:'+l+'px;top:'+t+'px;width:'+(w+b*2)+'px;height:'+(h+b*2)+'px;background:white;padding:'+b+'px;transform:rotate('+r+'deg);box-shadow:0 8px 40px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.2);"><img src="'+s+'" style="width:'+w+'px;height:'+h+'px;object-fit:cover;object-position:center top;display:block;"/></div>'}

function hero(s,inner){return '<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">'+img(s,0,0,1080,1920,'filter:saturate(1.1) contrast(1.05);')+'<div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(0,0,0,0.08) 0%, transparent 15%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.96) 100%);"></div>'+inner+GR+'</div>'}
function dark(inner){return '<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#080a0e;"><div style="position:absolute;inset:0;background:linear-gradient(170deg, #0c1420 0%, #080c14 50%, #060a10 100%);"></div><div style="position:absolute;inset:0;background:radial-gradient(circle at 20% 20%, rgba(80,140,220,0.12), transparent 30%), radial-gradient(circle at 80% 80%, rgba(220,170,100,0.08), transparent 25%);"></div>'+inner+GR+'</div>'}
function warm(inner){return '<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#f5f0e6;"><div style="position:absolute;inset:0;background:linear-gradient(170deg, #faf6ee 0%, #f0e8d8 50%, #e5d8c4 100%);"></div>'+inner+'</div>'}
function cta(s,inner){return '<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">'+img(s,0,0,1080,1920,'filter:saturate(1.1) brightness(0.5);')+'<div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.15) 30%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.95) 100%);"></div>'+inner+GR+'</div>'}

function h1(t,bot,sz){sz=sz||108;return '<div style="position:absolute;bottom:'+bot+'px;left:64px;right:64px;"><p style="font-family:'+SE+';font-size:'+sz+'px;font-weight:700;font-style:italic;color:white;line-height:0.92;margin:0;'+SH+'">'+t+'</p></div>'}
function h2(t,bot,sz){sz=sz||64;return '<div style="position:absolute;bottom:'+bot+'px;left:64px;right:64px;"><p style="font-family:'+SE+';font-size:'+sz+'px;font-weight:700;font-style:italic;color:white;line-height:1.0;margin:0;'+SH+'">'+t+'</p></div>'}
function sub(t,bot,sz){sz=sz||34;return '<div style="position:absolute;bottom:'+bot+'px;left:64px;right:64px;"><p style="font-family:'+SA+';font-size:'+sz+'px;font-weight:500;color:rgba(255,255,255,0.85);line-height:1.35;margin:0;'+SH+'">'+t+'</p></div>'}
function tag(t,l,top){return '<p style="position:absolute;left:'+l+'px;top:'+top+'px;font-family:'+SA+';font-size:24px;font-weight:700;color:rgba(255,255,255,0.7);letter-spacing:0.12em;text-transform:uppercase;margin:0;'+SH+'">'+t+'</p>'}
function dtag(t,l,top){return '<p style="position:absolute;left:'+l+'px;top:'+top+'px;font-family:'+SA+';font-size:18px;font-weight:700;color:rgba(0,0,0,0.3);letter-spacing:0.15em;text-transform:uppercase;margin:0;">'+t+'</p>'}
function dh(t,bot,sz){sz=sz||52;return '<div style="position:absolute;bottom:'+bot+'px;left:64px;right:64px;"><p style="font-family:'+SE+';font-size:'+sz+'px;font-weight:700;font-style:italic;color:#1a1a1a;line-height:0.95;margin:0;">'+t+'</p></div>'}
function ctaBlock(){return '<div style="position:absolute;bottom:380px;left:64px;right:64px;"><p style="font-family:'+SA+';font-size:38px;font-weight:600;color:white;margin:0;'+SH+'">Click the link below to sign up.</p><p style="font-family:'+SA+';font-size:32px;color:rgba(255,255,255,0.7);margin:20px 0 0;'+SH+'">I handle everything. No experience needed.</p></div>'}

// Layouts — all portrait crops
function hookSlide(s){return {name:'01-hook',html:hero(s,tag('Shot on 35mm film',64,60)+h1("I'm looking for<br/>models in Bali.",540)+sub('Sign up if you are interested<br/>in collaborating.',420,42))}}
function ctaSlide(s){return {name:'10-cta',html:cta(s,h1('Sign up.',520)+ctaBlock())}}
function heroText(nm,s,tg,hl,sl){return {name:nm,html:hero(s,tag(tg,64,60)+h2(hl,440)+sub(sl,370))}}
function darkSingle(nm,s,hl,sl){return {name:nm,html:dark(pr(s,100,100,860,1100,-0.5,18)+h2(hl,200)+sub(sl,130))}}
// 2 photos side by side
function duo(nm,a,b,tg,hl){return {name:nm,html:dark(tag(tg,64,40)+pr(a,30,80,460,650,-2,14)+pr(b,530,80,460,650,2,14)+h2(hl,200)+sub('Sign up if you are interested in collaborating.',130))}}
// 2 photos offset cascade
function cascade2(nm,a,b,tg,sl){return {name:nm,html:dark(tag(tg,64,40)+pr(a,40,80,480,680,-2.5,14)+pr(b,480,520,480,680,2,14)+sub(sl,80))}}
// 3 photos in a row
function trio(nm,a,b,c,tg,sl){return {name:nm,html:dark(tag(tg,64,40)+pr(a,10,80,320,900,-2.5,10)+pr(b,355,60,320,900,1.5,10)+pr(c,700,80,320,900,-1,10)+sub(sl,60))}}
// 3 photos warm paper
function warm3(nm,tg,a,b,c,sl){return {name:nm,html:warm(dtag(tg,64,50)+pr(a,10,80,320,900,-3,10)+pr(b,355,60,320,900,2,10)+pr(c,700,80,320,900,-1.5,10)+dh(sl,60))}}
// 2-photo magazine
function magazine(nm,s,tg,hl,body,ins){return {name:nm,html:'<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#f5f0e6;"><div style="position:absolute;inset:0;background:linear-gradient(170deg, #faf6ee 0%, #f0e8d8 50%, #e5d8c4 100%);"></div>'+img(s,40,40,580,860,'object-position:center top;border-radius:8px;')+'<div style="position:absolute;left:64px;top:940px;right:64px;"><p style="font-family:'+SA+';font-size:16px;font-weight:700;color:rgba(0,0,0,0.3);letter-spacing:0.15em;text-transform:uppercase;margin:0 0 16px;">'+tg+'</p><p style="font-family:'+SE+';font-size:60px;font-weight:700;font-style:italic;color:#1a1a1a;line-height:0.95;margin:0;">'+hl+'</p><p style="font-family:'+SA+';font-size:24px;color:rgba(0,0,0,0.4);line-height:1.5;margin:28px 0 0;">'+body+'</p></div><div style="position:absolute;right:40px;bottom:60px;width:240px;height:340px;background:white;padding:10px;transform:rotate(3deg);box-shadow:4px 4px 20px rgba(0,0,0,0.12);"><img src="'+ins+'" style="width:220px;height:320px;object-fit:cover;object-position:center top;display:block;"/></div></div>'}}

// Load 5 headliners for hooks
const headliners = [
  nh('DSC_0075.jpg'),     // v1
  nh('000041.jpg'),       // v2
  nh('DSC_0526.jpg'),     // v3
  nh('000016-3.jpg'),     // v4
  nh('000038-4.jpg'),     // v5
]

// Load ALL portrait faves
const ALL_FILES = fs.readFileSync('/tmp/all-portrait-faves.txt','utf8').trim().split('\n')
console.log('Loading ' + ALL_FILES.length + ' portrait faves...')
const loaded = {}
for (const f of ALL_FILES) {
  try { loaded[f] = nf(f) } catch(e) { console.warn('Skip: ' + f) }
}
const valid = Object.keys(loaded)
console.log('Loaded ' + valid.length + ' photos')

// Shuffle and split into 5 groups of ~38
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]};return a}
const shuffled = shuffle([...valid])
const PER = Math.ceil(shuffled.length / 5)
const groups = []
for (let i = 0; i < 5; i++) {
  groups.push(shuffled.slice(i * PER, (i + 1) * PER))
}

// Copy per variant for safe indexing
const COPY = [
  // [hero_tag, hero_hl, hero_sub, duo_tag, duo_hl, trio_tag, trio_sub, cascade_tag, cascade_sub, warm_tag, warm_sub, mag_tag, mag_hl, mag_body, dark_hl, dark_sub, cta_hero_tag, cta_hero_hl, cta_hero_sub]
  { ht:'35mm film', hh:'Want content<br/>like this?', hs:'Sign up below. I direct everything.',
    dt:'Shot on film', dh:'Two faces.<br/>One camera.',
    tt:'All 35mm', ts:'Every face tells a story.',
    ct:'Bali \u00b7 Film', cs:'No experience needed. I handle everything.',
    wt:'Shot on film', ws:'Real film.<br/>Real people.',
    mt:'Bali \u00b7 Film', mh:'Your face.<br/>My film.<br/>Magic.', mb:'Free collaboration. I direct everything. You get every edited photo.',
    sh:'No experience<br/>needed.', ss:'I direct the entire shoot.',
    eh:'This could<br/>be you.', es:'Sign up if you are interested in collaborating.' },
  { ht:'Bali \u00b7 35mm', hh:'Film portraits<br/>hit different.', hs:'No filter. Just grain and light.',
    dt:'TFP collaboration', dh:'You get photos.<br/>I get to shoot.',
    tt:'Shot on 35mm', ts:'Different vibes. Same quality.',
    ct:'All directed by me', cs:'Beach. Villa. Night. Your choice.',
    wt:'All 35mm', ws:'The grain<br/>is the point.',
    mt:'What you get', mh:'Edited 35mm<br/>film portraits.', mb:'Professional direction. Beautiful locations. Every photo yours to keep.',
    sh:'I handle<br/>everything.', ss:'Posing. Lighting. Editing.',
    eh:'This could<br/>be you.', es:'Sign up below.' },
  { ht:'TFP collaboration', hh:'You get every<br/>edited photo.', hs:'Use them however you want.',
    dt:'35mm film', dh:'Content that<br/>stands out.',
    tt:'Film portraits', ts:'No experience needed. I direct everything.',
    ct:'Shot on film', cs:'Same camera. Different continent.',
    wt:'Film portraits', ws:'Timeless<br/>content.',
    mt:'Model collab', mh:'Sign up.<br/>Show up.<br/>Get photos.', mb:'I plan the location, direct the shoot, edit the photos, and send them to you.',
    sh:'Limited spots<br/>this month.', ss:'Sign up for a free film session.',
    eh:'This could<br/>be you.', es:'Sign up if you are interested in collaborating.' },
  { ht:'Bali', hh:'Golden hour.<br/>Beach. Jungle.', hs:'Your choice of location.',
    dt:'Shot on 35mm film', dh:'Same camera.<br/>Different energy.',
    tt:'All directed by me', ts:'Build your portfolio with real film.',
    ct:'TFP collaboration', cs:'No cost. Real content.',
    wt:'Bali \u00b7 35mm', ws:'Warm light.<br/>Real film.',
    mt:'TFP collaboration', mh:'We both build<br/>our books.', mb:'Free session. I direct everything. All skill levels welcome.',
    sh:'Your face<br/>deserves film.', ss:'TFP collaboration in Bali.',
    eh:'This could<br/>be you.', es:'Sign up below.' },
  { ht:'@madebyaidan', hh:'Be part of<br/>something real.', hs:'Film portraits. Bali. This month.',
    dt:'Model collab', dh:'Your portfolio<br/>needs this.',
    tt:'Shot on film', ts:'Every shoot is different.',
    ct:'35mm film', cs:'Film grain. Warm tones. Real.',
    wt:'Shot on 35mm', ws:'Free content.<br/>Real quality.',
    mt:'Shot on 35mm', mh:'Content that<br/>actually<br/>stands out.', mb:'Film grain. Warm tones. Directed portraits that look nothing like an iPhone.',
    sh:'Get shot<br/>on film.', ss:'Free collaboration. Bali.',
    eh:'This could<br/>be you.', es:'Sign up if you are interested in collaborating.' },
]

// Build 5 variations — each uses ~32 photos from its group
const variations = groups.map((files, vi) => {
  const raw = files.map(f => loaded[f])
  const p = Array.from({length: 40}, (_, i) => raw[i % raw.length])
  const c = COPY[vi]
  const hk = headliners[vi]

  return { slug: 'v' + (vi + 1), slides: [
    // Slide 1: headliner hook (1)
    hookSlide(hk),
    // Slide 2: trio (3)
    trio('02', p[0], p[1], p[2], c.ht, c.ts),
    // Slide 3: trio (3)
    trio('03', p[3], p[4], p[5], c.tt, 'I direct every frame.'),
    // Slide 4: magazine (2)
    magazine('04', p[6], c.mt, c.mh, c.mb, p[7]),
    // Slide 5: trio (3)
    trio('05', p[8], p[9], p[10], c.dt, c.cs),
    // Slide 6: trio (3)
    trio('06', p[11], p[12], p[13], c.ct, 'No experience needed. I handle everything.'),
    // Slide 7: warm3 (3)
    warm3('07', c.wt, p[14], p[15], p[16], c.ws),
    // Slide 8: trio (3)
    trio('08', p[17], p[18], p[19], 'All directed by me', 'Build your portfolio with real film.'),
    // Slide 9: trio (3) + duo (2) = cascade + duo
    cascade2('09', p[20], p[21], 'Bali', 'This could be you. Sign up below.'),
    // Slide 10: CTA with trio behind
    {name:'10-cta', html: dark(
      tag('Sign up below',64,40) +
      pr(p[22],10,80,320,900,-2.5,10) + pr(p[23],355,60,320,900,1.5,10) + pr(p[24],700,80,320,900,-1,10) +
      h1('Sign up.',540) +
      sub('Click the link below. I handle everything.',420)
    )},
  ]}
})

// Count total unique photos used
const totalUsed = 5 + groups.reduce((sum, g) => sum + Math.min(g.length, 29), 0)
console.log('Total photos used: ~' + totalUsed + ' (5 headliners + faves)')

async function render() {
  const all = []
  for (const v of variations) {
    const dir = path.join(OUT, v.slug)
    fs.mkdirSync(dir, { recursive: true })
    for (const s of v.slides) all.push({ ...s, name: v.slug + '-' + s.name, dir: v.slug })
  }
  console.log('Rendering ' + all.length + ' slides across ' + variations.length + ' variations...')
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 2 })
  for (let i = 0; i < all.length; i++) {
    const s = all[i]
    const page = await ctx.newPage()
    await page.setContent('<!doctype html><html><head><style>*{box-sizing:border-box}html,body{margin:0;width:1080px;height:1920px;background:#000;overflow:hidden}body{-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}</style></head><body>' + s.html + '</body></html>', { waitUntil: 'load' })
    await page.waitForTimeout(300)
    await page.screenshot({ path: path.join(OUT, s.dir, s.name + '.png'), type: 'png' })
    await page.close()
    if ((i+1) % 10 === 0 || i === 0) console.log('  [' + (i+1) + '/' + all.length + '] ' + s.name)
  }
  await browser.close()
  console.log('\nDone — ' + all.length + ' slides -> ' + OUT)
}
render()
