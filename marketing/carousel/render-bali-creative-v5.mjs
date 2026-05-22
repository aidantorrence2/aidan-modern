import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, 'output-bali-creative-v5')
const FAVES = '/Users/aidantorrence/Documents/aidan-modern/public/images/faves'
fs.mkdirSync(OUT, { recursive: true })

function n(f) { return 'data:image/jpeg;base64,' + fs.readFileSync(path.join(FAVES, f)).toString('base64') }

const SE = "Georgia, 'Times New Roman', serif"
const SA = "Inter, -apple-system, system-ui, sans-serif"
const SH = 'text-shadow: 0 3px 6px rgba(0,0,0,1), 0 10px 40px rgba(0,0,0,0.8), 0 0 100px rgba(0,0,0,0.5);'
const GR = '<div style="position:absolute;inset:0;pointer-events:none;opacity:0.08;mix-blend-mode:soft-light;background-image:radial-gradient(circle at 14% 18%, rgba(255,255,255,0.5), transparent 17%),radial-gradient(circle at 84% 12%, rgba(255,255,255,0.28), transparent 15%);"></div>'

function img(src,l,t,w,h,x){x=x||'';return '<img src="'+src+'" style="position:absolute;left:'+l+'px;top:'+t+'px;width:'+w+'px;height:'+h+'px;object-fit:cover;object-position:center top;display:block;'+x+'"/>'}
function pr(src,l,t,w,h,rot,b){b=b||12;return '<div style="position:absolute;left:'+l+'px;top:'+t+'px;width:'+(w+b*2)+'px;height:'+(h+b*2)+'px;background:white;padding:'+b+'px;transform:rotate('+rot+'deg);box-shadow:0 8px 40px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.2);"><img src="'+src+'" style="width:'+w+'px;height:'+h+'px;object-fit:cover;object-position:center top;display:block;"/></div>'}

function hero(src,inner){return '<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">'+img(src,0,0,1080,1920,'filter:saturate(1.1) contrast(1.05);')+'<div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(0,0,0,0.1) 0%, transparent 15%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.96) 100%);"></div>'+inner+GR+'</div>'}
function dark(inner){return '<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#080a0e;"><div style="position:absolute;inset:0;background:linear-gradient(170deg, #0c1420 0%, #080c14 50%, #060a10 100%);"></div><div style="position:absolute;inset:0;background:radial-gradient(circle at 20% 20%, rgba(80,140,220,0.12), transparent 30%), radial-gradient(circle at 80% 80%, rgba(220,170,100,0.08), transparent 25%);"></div>'+inner+GR+'</div>'}
function warm(inner){return '<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#f5f0e6;"><div style="position:absolute;inset:0;background:linear-gradient(170deg, #faf6ee 0%, #f0e8d8 50%, #e5d8c4 100%);"></div>'+inner+'</div>'}
function cta(src,inner){return '<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">'+img(src,0,0,1080,1920,'filter:saturate(1.1) brightness(0.5);')+'<div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.15) 30%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.95) 100%);"></div>'+inner+GR+'</div>'}

function h1(t,bot,sz){sz=sz||108;return '<div style="position:absolute;bottom:'+bot+'px;left:64px;right:64px;"><p style="font-family:'+SE+';font-size:'+sz+'px;font-weight:700;font-style:italic;color:white;line-height:0.92;margin:0;'+SH+'">'+t+'</p></div>'}
function h2(t,bot,sz){sz=sz||64;return '<div style="position:absolute;bottom:'+bot+'px;left:64px;right:64px;"><p style="font-family:'+SE+';font-size:'+sz+'px;font-weight:700;font-style:italic;color:white;line-height:1.0;margin:0;'+SH+'">'+t+'</p></div>'}
function sub(t,bot,sz){sz=sz||34;return '<div style="position:absolute;bottom:'+bot+'px;left:64px;right:64px;"><p style="font-family:'+SA+';font-size:'+sz+'px;font-weight:500;color:rgba(255,255,255,0.85);line-height:1.35;margin:0;'+SH+'">'+t+'</p></div>'}
function tag(t,l,top){return '<p style="position:absolute;left:'+l+'px;top:'+top+'px;font-family:'+SA+';font-size:24px;font-weight:700;color:rgba(255,255,255,0.7);letter-spacing:0.12em;text-transform:uppercase;margin:0;'+SH+'">'+t+'</p>'}
function dtag(t,l,top){return '<p style="position:absolute;left:'+l+'px;top:'+top+'px;font-family:'+SA+';font-size:18px;font-weight:700;color:rgba(0,0,0,0.3);letter-spacing:0.15em;text-transform:uppercase;margin:0;">'+t+'</p>'}
function dh(t,bot,sz){sz=sz||56;return '<div style="position:absolute;bottom:'+bot+'px;left:64px;right:64px;"><p style="font-family:'+SE+';font-size:'+sz+'px;font-weight:700;font-style:italic;color:#1a1a1a;line-height:0.95;margin:0;">'+t+'</p></div>'}
function ctaBlock(){return '<div style="position:absolute;bottom:380px;left:64px;right:64px;"><p style="font-family:'+SA+';font-size:38px;font-weight:600;color:white;margin:0;'+SH+'">Click the link below to sign up.</p><p style="font-family:'+SA+';font-size:32px;color:rgba(255,255,255,0.7);margin:20px 0 0;'+SH+'">I handle everything. No experience needed.</p></div>'}

// Slide builders — 1-3 photos each, portrait only
function hookSlide(src){return {name:'01-hook',html:hero(src,tag('Shot on 35mm film',64,60)+h1("I'm looking for<br/>models in Bali.",540)+sub('Sign up if you want<br/>photos like this.',420,44))}}
function ctaSlide(src){return {name:'10-cta',html:cta(src,h1('Sign up.',520)+ctaBlock())}}

// 1-photo: full bleed hero
function heroText(nm,src,tg,headline,subline){return {name:nm,html:hero(src,tag(tg,64,60)+h2(headline,440)+sub(subline,370))}}
// 1-photo: single large print on dark
function darkSingle(nm,src,headline,subline){return {name:nm,html:dark(pr(src,100,100,860,1100,-0.5,18)+h2(headline,200)+sub(subline,130))}}
// 2-photo: two portrait prints side by side on dark — each 460x650 (portrait ratio)
function split2(nm,s1,s2,tg,headline){return {name:nm,html:dark(tag(tg,64,40)+pr(s1,30,80,460,650,-2,14)+pr(s2,530,80,460,650,2,14)+h2(headline,200)+sub('Sign up if you want photos like this.',130))}}
// 2-photo: two portrait prints offset on dark — top-left and bottom-right
function stacked(nm,s1,s2,text){return {name:nm,html:dark(tag('Shot on 35mm film',64,40)+pr(s1,40,80,480,680,-2.5,14)+pr(s2,480,520,480,680,2,14)+'<div style="position:absolute;bottom:100px;left:64px;right:64px;"><p style="font-family:'+SE+';font-size:48px;font-weight:700;font-style:italic;color:white;line-height:1.0;margin:0;'+SH+'">'+text+'</p></div>')}}
// 2-photo: two prints on dark
function darkDuo(nm,s1,s2,tg,subline){return {name:nm,html:dark(tag(tg,64,40)+pr(s1,40,100,460,640,-2.5,14)+pr(s2,500,80,480,660,2,14)+sub(subline,60))}}
// 3-photo: warm paper with 3 portrait prints
function warm3(nm,tg,s1,s2,s3,subline){return {name:nm,html:warm(dtag(tg,64,50)+pr(s1,30,80,310,440,-3,12)+pr(s2,370,60,310,440,2,12)+pr(s3,700,90,310,440,-1.5,12)+dh(subline,60))}}
// 2-photo: magazine — portrait photo left + text right + inset print bottom
function magazine(nm,src,tg,headline,body,insetSrc){return {name:nm,html:'<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#f5f0e6;"><div style="position:absolute;inset:0;background:linear-gradient(170deg, #faf6ee 0%, #f0e8d8 50%, #e5d8c4 100%);"></div>'+img(src,40,40,580,860,'object-position:center top;border-radius:8px;')+'<div style="position:absolute;left:64px;top:940px;right:64px;"><p style="font-family:'+SA+';font-size:16px;font-weight:700;color:rgba(0,0,0,0.3);letter-spacing:0.15em;text-transform:uppercase;margin:0 0 16px;">'+tg+'</p><p style="font-family:'+SE+';font-size:64px;font-weight:700;font-style:italic;color:#1a1a1a;line-height:0.95;margin:0;">'+headline+'</p><p style="font-family:'+SA+';font-size:24px;color:rgba(0,0,0,0.4);line-height:1.5;margin:28px 0 0;">'+body+'</p></div><div style="position:absolute;right:40px;bottom:60px;width:240px;height:340px;background:white;padding:10px;transform:rotate(3deg);box-shadow:4px 4px 20px rgba(0,0,0,0.12);"><img src="'+insetSrc+'" style="width:220px;height:320px;object-fit:cover;object-position:center top;display:block;"/></div></div>'}}

// Copy lines — model-enticing, no fake stories
const HOOKS = [
  ['Want photos<br/>like this?', 'Sign up. I direct everything.'],
  ['Your face<br/>deserves film.', 'TFP collaboration in Bali.'],
  ['No experience<br/>needed.', 'I direct every frame.'],
  ['Free 35mm<br/>portraits.', 'TFP. You get every photo.'],
  ['Be part of<br/>something real.', 'Film portraits. Bali. This month.'],
  ['Your portfolio<br/>needs this.', 'Shot on 35mm. Directed by me.'],
  ['Content that<br/>stands out.', 'Film photos for your socials.'],
  ['Get shot<br/>on film.', 'Free collaboration. Bali.'],
  ['Models wanted<br/>in Bali.', 'TFP. All skill levels.'],
  ['Limited spots<br/>this month.', 'Sign up for a free film session.'],
]
const SLIDE_COPY = [
  // [tag, headline, subline] for hero/dark slides
  ['35mm film', 'Want content<br/>like this?', 'Sign up below.'],
  ['Shot on film', 'No posing<br/>experience needed.', 'I direct the entire shoot.'],
  ['TFP collaboration', 'You get every<br/>edited photo.', 'Use them however you want.'],
  ['Bali', 'Golden hour.<br/>Beach. Jungle.', 'Your choice of location.'],
  ['35mm film', 'Film portraits<br/>hit different.', 'No filter. Just grain and light.'],
  ['@madebyaidan', 'I handle<br/>everything.', 'Posing. Lighting. Editing.'],
  ['Model collab', 'Build your<br/>portfolio.', 'Content for socials, agencies, or just for you.'],
  ['Shot on film', 'This could<br/>be you.', 'Sign up if you want photos like this.'],
  ['Bali \u00b7 35mm', 'Every face<br/>is worth<br/>shooting.', 'Yours included.'],
  ['No cost', 'TFP means<br/>we both win.', 'I build my book. You build yours.'],
]
const SPLIT_COPY = [
  ['35mm film', 'Same camera.<br/>Different energy.'],
  ['Two faces. One roll.', 'Film portraits<br/>in Bali.'],
  ['All shot on film', 'Real grain.<br/>Real light.'],
  ['Bali', 'Your photos<br/>could look<br/>like this.'],
  ['TFP collaboration', 'No cost.<br/>Real content.'],
]
const STACKED_COPY = [
  'Different looks.<br/>Same session.',
  'Film on top.<br/>Film below.',
  'Every shoot is<br/>different.',
  'Two vibes.<br/>One afternoon.',
  'Fashion meets<br/>nature.',
]
const WARM_COPY = [
  ['Shot on 35mm', 'Real film.<br/>Real people.'],
  ['All 35mm', 'The grain<br/>is the point.'],
  ['Film portraits', 'Timeless<br/>content.'],
  ['Bali \u00b7 35mm', 'Warm light.<br/>Real film.'],
  ['TFP', 'Free content.<br/>Real quality.'],
]
const MAG_COPY = [
  ['Bali \u00b7 Film', 'Your face.<br/>My film.<br/>Magic.', 'All directed. All on 35mm. No experience needed. You show up, I handle the rest.'],
  ['What you get', 'Edited 35mm<br/>film portraits.', 'Professional direction. Beautiful locations in Bali. Every photo yours to keep.'],
  ['TFP collaboration', 'We both build<br/>our books.', 'Free session. I direct everything. All skill levels welcome.'],
  ['Shot on film', 'Content that<br/>actually<br/>stands out.', 'Film grain. Warm tones. Directed portraits that look nothing like an iPhone.'],
  ['Model collab', 'Sign up.<br/>Show up.<br/>Get photos.', 'I plan the location, direct the shoot, edit the photos, and send them to you.'],
]

// Load ALL portrait photos
const ALL = [
  "000001-4.jpg","000001-8.jpg","000002-11.jpg","000002-4.jpg","000003-4.jpg",
  "000003-8.jpg","000003.jpg","000004-8.jpg","000004.jpg","000005-11.jpg",
  "000005-3.jpg","000007-3.jpg","000007-4.jpg","000008-11.jpg","000008-3-2.jpg",
  "000008-7.jpg","000008-8.jpg","000008.jpg","000009 copy.jpg","000009-7 copy.jpg",
  "000009-7.jpg","000009.jpg","000010-10.jpg","000010-3.jpg","000010-6.jpg",
  "000011-6.jpg","000013-3-2.jpg","000013-3.jpg","000014-3.jpg","000014-5.jpg",
  "000015-2.jpg","000015-3.jpg","000015-8.jpg","000016-3-2.jpg","000016-3.jpg",
  "000016-7.jpg","000016.jpg","000017-9.jpg","000018-2-2.jpg","000018-4.jpg",
  "000018-6.jpg","000018-8.jpg","000019-10.jpg","000019-11.jpg","000019-2.jpg",
  "000019-4.jpg","000019-6.jpg","000020-5.jpg","000020-7.jpg","000021 copy.jpg",
  "000021.jpg","000022.jpg","000023-6.jpg","000023.jpg","000023580032.jpg",
  "000024-3.jpg","000024.jpg","000025-2.jpg","000025-3.jpg","000025-4-2.jpg",
  "000025-4.jpg","000025-5.jpg","000025.jpg","000026-2.jpg","000026-3 copy.jpg",
  "000026-3.jpg","000026-4-2.jpg","000026-4.jpg","000026-8.jpg","000026.jpg",
  "000027-10.jpg","000027-4.jpg","000027-9.jpg","000027.jpg","000028-10.jpg",
  "000029 copy.jpg","000029-10.jpg","000029-3-2.jpg","000029-4.jpg","000029.jpg",
  "000030-10.jpg","000030-2.jpg","000030-5.jpg","000031.jpg","000032-3.jpg",
  "000033-4.jpg","000035-2.jpg","000035-4.jpg","000035-5.jpg","000036-5-2.jpg",
  "000036-5.jpg","000037-3-3.jpg","000037-4-2.jpg","000037-4.jpg","000037.jpg",
  "000038-4-2.jpg","000038-4.jpg","000039-3.jpg","000039-5.jpg","000039.jpg",
  "000040-5.jpg","000041-6.jpg","000041.jpg","000042-12.jpg","000042-2.jpg",
  "000042-5.jpg","000043-5.jpg","000044-2.jpg","000045.jpg","000047-4.jpg",
  "000048-11.jpg","000048-2.jpg","000050-6.jpg","000051-12.jpg","000053-5.jpg",
  "000056-2.jpg","000062-2.jpg","000062.jpg","000063.jpg","000066-2.jpg",
  "000066-5.jpg","000067-9.jpg","000068-2.jpg","000068-9.jpg","000071.jpg",
  "0003_3-3.jpg","0004_4-6.jpg","0012_12-6.jpg","0013_13.jpg","0015_15-6.jpg",
  "0016_16-5.jpg","0017_17-6.jpg","0017_17.jpg","0021_21-2.jpg","0021_21-6.jpg",
  "0037_E-2.jpg","manila-gallery-dsc-0075.jpg","manila-gallery-dsc-0190.jpg",
  "manila-gallery-night-001-original.jpg","manila-gallery-night-003.jpg",
  "manila-gallery-purple-001-cropped.jpg","manila-gallery-purple-004-cropped.jpg",
  "manila-gallery-statue-001.jpg","r1-05460-0022.jpg",
  "DSC_0074.jpg","DSC_0075.jpg","DSC_0163.jpg","DSC_0208.jpg","DSC_0217.jpg",
  "DSC_0232.jpg","DSC_0249.jpg","DSC_0256.jpg","DSC_0274-2.jpg","DSC_0276.jpg",
  "DSC_0309-2.jpg","DSC_0310-2.jpg","DSC_0314.jpg","DSC_0316.jpg","DSC_0320-2.jpg",
  "DSC_0320.jpg","DSC_0321-2.jpg","DSC_0321.jpg","DSC_0343.jpg","DSC_0347.jpg",
  "DSC_0358.jpg","DSC_0360.jpg","DSC_0368.jpg","DSC_0372.jpg","DSC_0375.jpg",
  "DSC_0376.jpg","DSC_0462.jpg","DSC_0480.jpg","DSC_0526.jpg","DSC_0542.jpg",
  "DSC_0544.jpg","DSC_0558.jpg","DSC_0561.jpg","DSC_0677.jpg","DSC_0678.jpg",
  "DSC_0679-2.jpg","DSC_0775.jpg","DSC_0807.jpg","DSC_0817-2.jpg","DSC_0869.jpg",
  "DSC_0943.jpg","DSC_0945.jpg","DSC_0951.jpg","DSC_0956.jpg","DSC_0957.jpg",
  "DSC_0960.jpg","DSC_0962.jpg","DSC_0979.jpg","DSC_0994.jpg",
]

console.log('Loading ' + ALL.length + ' portrait photos...')
const loaded = {}
for (const f of ALL) {
  try { loaded[f] = n(f) } catch(e) { console.warn('Skip: ' + f) }
}
const validFiles = Object.keys(loaded)
console.log('Loaded ' + validFiles.length + ' photos')

// Shuffle and split into 10 groups of ~19
function shuffle(arr) { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]] }; return arr }
const shuffled = shuffle([...validFiles])
const groups = []
const perGroup = Math.ceil(shuffled.length / 10)
for (let i = 0; i < 10; i++) {
  groups.push(shuffled.slice(i * perGroup, (i + 1) * perGroup))
}

// Build 10 variations — wrap around if group is short
const variations = groups.map((photos, vi) => {
  const pRaw = photos.map(f => loaded[f])
  // Ensure at least 16 entries by wrapping
  const p = Array.from({length: 20}, (_, i) => pRaw[i % pRaw.length])
  const hk = HOOKS[vi]
  const sc = SLIDE_COPY[vi]
  const sp = SPLIT_COPY[vi % SPLIT_COPY.length]
  const st = STACKED_COPY[vi % STACKED_COPY.length]
  const wc = WARM_COPY[vi % WARM_COPY.length]
  const mc = MAG_COPY[vi % MAG_COPY.length]

  return { slug: 'v' + (vi + 1), slides: [
    // Slide 1: Hook
    hookSlide(p[0]),
    // Slide 2: Hero with copy
    heroText('02', p[1], sc[0], sc[1], sc[2]),
    // Slide 3: Split screen
    split2('03', p[2], p[3], sp[0], sp[1]),
    // Slide 4: Dark single large print
    darkSingle('04', p[4], 'Want photos<br/>like this?', 'Sign up below. I direct everything.'),
    // Slide 5: Magazine spread
    magazine('05', p[5], mc[0], mc[1], mc[2], p[6]),
    // Slide 6: Stacked diptych
    stacked('06', p[7], p[8], st),
    // Slide 7: Dark duo prints
    darkDuo('07', p[9], p[10], 'Shot on 35mm film', 'No experience needed. I handle everything.'),
    // Slide 8: Warm paper 3 prints
    warm3('08', wc[0], p[11], p[12], p[13], wc[1]),
    // Slide 9: Hero "this could be you"
    heroText('09', p[14], 'Bali', 'This could<br/>be you.', 'Sign up if you want photos like this.'),
    // Slide 10: CTA
    ctaSlide(p[15] || p[0]),
  ]}
})

// Render
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
