import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, 'output-bali-creative-v6')
const HD = '/Users/aidantorrence/Documents/aidan-modern/public/images/headliners'
const FV = '/Users/aidantorrence/Documents/aidan-modern/public/images/faves'
fs.mkdirSync(OUT, { recursive: true })

function nh(f) { return 'data:image/jpeg;base64,' + fs.readFileSync(path.join(HD, f)).toString('base64') }
function nf(f) { return 'data:image/jpeg;base64,' + fs.readFileSync(path.join(FV, f)).toString('base64') }

const SE = "Georgia, 'Times New Roman', serif"
const SA = "Inter, -apple-system, system-ui, sans-serif"
const SH = 'text-shadow: 0 3px 6px rgba(0,0,0,1), 0 10px 40px rgba(0,0,0,0.8), 0 0 100px rgba(0,0,0,0.5);'
const GR = '<div style="position:absolute;inset:0;pointer-events:none;opacity:0.08;mix-blend-mode:soft-light;background-image:radial-gradient(circle at 14% 18%, rgba(255,255,255,0.5), transparent 17%),radial-gradient(circle at 84% 12%, rgba(255,255,255,0.28), transparent 15%);"></div>'

function img(src,l,t,w,h,x){x=x||'';return '<img src="'+src+'" style="position:absolute;left:'+l+'px;top:'+t+'px;width:'+w+'px;height:'+h+'px;object-fit:cover;object-position:center top;display:block;'+x+'"/>'}
function pr(src,l,t,w,h,rot,b){b=b||12;return '<div style="position:absolute;left:'+l+'px;top:'+t+'px;width:'+(w+b*2)+'px;height:'+(h+b*2)+'px;background:white;padding:'+b+'px;transform:rotate('+rot+'deg);box-shadow:0 8px 40px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.2);"><img src="'+src+'" style="width:'+w+'px;height:'+h+'px;object-fit:cover;object-position:center top;display:block;"/></div>'}

function hero(src,inner){return '<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">'+img(src,0,0,1080,1920,'filter:saturate(1.1) contrast(1.05);')+'<div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(0,0,0,0.08) 0%, transparent 15%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.96) 100%);"></div>'+inner+GR+'</div>'}
function dark(inner){return '<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#080a0e;"><div style="position:absolute;inset:0;background:linear-gradient(170deg, #0c1420 0%, #080c14 50%, #060a10 100%);"></div><div style="position:absolute;inset:0;background:radial-gradient(circle at 20% 20%, rgba(80,140,220,0.12), transparent 30%), radial-gradient(circle at 80% 80%, rgba(220,170,100,0.08), transparent 25%);"></div>'+inner+GR+'</div>'}
function warm(inner){return '<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#f5f0e6;"><div style="position:absolute;inset:0;background:linear-gradient(170deg, #faf6ee 0%, #f0e8d8 50%, #e5d8c4 100%);"></div>'+inner+'</div>'}
function cta(src,inner){return '<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">'+img(src,0,0,1080,1920,'filter:saturate(1.1) brightness(0.5);')+'<div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.15) 30%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.95) 100%);"></div>'+inner+GR+'</div>'}

function h1(t,bot,sz){sz=sz||108;return '<div style="position:absolute;bottom:'+bot+'px;left:64px;right:64px;"><p style="font-family:'+SE+';font-size:'+sz+'px;font-weight:700;font-style:italic;color:white;line-height:0.92;margin:0;'+SH+'">'+t+'</p></div>'}
function h2(t,bot,sz){sz=sz||64;return '<div style="position:absolute;bottom:'+bot+'px;left:64px;right:64px;"><p style="font-family:'+SE+';font-size:'+sz+'px;font-weight:700;font-style:italic;color:white;line-height:1.0;margin:0;'+SH+'">'+t+'</p></div>'}
function sub(t,bot,sz){sz=sz||34;return '<div style="position:absolute;bottom:'+bot+'px;left:64px;right:64px;"><p style="font-family:'+SA+';font-size:'+sz+'px;font-weight:500;color:rgba(255,255,255,0.85);line-height:1.35;margin:0;'+SH+'">'+t+'</p></div>'}
function tag(t,l,top){return '<p style="position:absolute;left:'+l+'px;top:'+top+'px;font-family:'+SA+';font-size:24px;font-weight:700;color:rgba(255,255,255,0.7);letter-spacing:0.12em;text-transform:uppercase;margin:0;'+SH+'">'+t+'</p>'}
function dtag(t,l,top){return '<p style="position:absolute;left:'+l+'px;top:'+top+'px;font-family:'+SA+';font-size:18px;font-weight:700;color:rgba(0,0,0,0.3);letter-spacing:0.15em;text-transform:uppercase;margin:0;">'+t+'</p>'}
function dh(t,bot,sz){sz=sz||52;return '<div style="position:absolute;bottom:'+bot+'px;left:64px;right:64px;"><p style="font-family:'+SE+';font-size:'+sz+'px;font-weight:700;font-style:italic;color:#1a1a1a;line-height:0.95;margin:0;">'+t+'</p></div>'}
function ctaBlock(){return '<div style="position:absolute;bottom:380px;left:64px;right:64px;"><p style="font-family:'+SA+';font-size:38px;font-weight:600;color:white;margin:0;'+SH+'">Click the link below to sign up.</p><p style="font-family:'+SA+';font-size:32px;color:rgba(255,255,255,0.7);margin:20px 0 0;'+SH+'">I handle everything. No experience needed.</p></div>'}

// Slide builders — all portrait crops (h > w in every container)
function hookSlide(src){return {name:'01-hook',html:hero(src,tag('Shot on 35mm film',64,60)+h1("I'm looking for<br/>models in Bali.",540)+sub('Sign up if you are interested<br/>in collaborating.',420,42))}}
function ctaSlide(src){return {name:'10-cta',html:cta(src,h1('Sign up.',520)+ctaBlock())}}
function heroText(nm,src,tg,hl,sl){return {name:nm,html:hero(src,tag(tg,64,60)+h2(hl,440)+sub(sl,370))}}
function darkSingle(nm,src,hl,sl){return {name:nm,html:dark(pr(src,100,100,860,1100,-0.5,18)+h2(hl,200)+sub(sl,130))}}
function split2(nm,s1,s2,tg,hl){return {name:nm,html:dark(tag(tg,64,40)+pr(s1,30,80,460,650,-2,14)+pr(s2,530,80,460,650,2,14)+h2(hl,200)+sub('Sign up if you are interested in collaborating.',130))}}
function stacked(nm,s1,s2,t){return {name:nm,html:dark(tag('Shot on 35mm film',64,40)+pr(s1,40,80,480,680,-2.5,14)+pr(s2,480,520,480,680,2,14)+'<div style="position:absolute;bottom:100px;left:64px;right:64px;"><p style="font-family:'+SE+';font-size:48px;font-weight:700;font-style:italic;color:white;line-height:1.0;margin:0;'+SH+'">'+t+'</p></div>')}}
function darkDuo(nm,s1,s2,tg,sl){return {name:nm,html:dark(tag(tg,64,40)+pr(s1,40,100,460,640,-2.5,14)+pr(s2,500,80,480,660,2,14)+sub(sl,60))}}
function warm3(nm,tg,s1,s2,s3,sl){return {name:nm,html:warm(dtag(tg,64,50)+pr(s1,30,80,310,440,-3,12)+pr(s2,370,60,310,440,2,12)+pr(s3,700,90,310,440,-1.5,12)+dh(sl,60))}}
function magazine(nm,src,tg,hl,body,ins){return {name:nm,html:'<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#f5f0e6;"><div style="position:absolute;inset:0;background:linear-gradient(170deg, #faf6ee 0%, #f0e8d8 50%, #e5d8c4 100%);"></div>'+img(src,40,40,580,860,'object-position:center top;border-radius:8px;')+'<div style="position:absolute;left:64px;top:940px;right:64px;"><p style="font-family:'+SA+';font-size:16px;font-weight:700;color:rgba(0,0,0,0.3);letter-spacing:0.15em;text-transform:uppercase;margin:0 0 16px;">'+tg+'</p><p style="font-family:'+SE+';font-size:60px;font-weight:700;font-style:italic;color:#1a1a1a;line-height:0.95;margin:0;">'+hl+'</p><p style="font-family:'+SA+';font-size:24px;color:rgba(0,0,0,0.4);line-height:1.5;margin:28px 0 0;">'+body+'</p></div><div style="position:absolute;right:40px;bottom:60px;width:240px;height:340px;background:white;padding:10px;transform:rotate(3deg);box-shadow:4px 4px 20px rgba(0,0,0,0.12);"><img src="'+ins+'" style="width:220px;height:320px;object-fit:cover;object-position:center top;display:block;"/></div></div>'}}

// === LOAD HEADLINERS ===
const H = {
  h01: nh('000001-8.jpg'),   h02: nh('000015-2.jpg'),  h03: nh('000016-3.jpg'),
  h04: nh('000016-7.jpg'),   h05: nh('000019-6.jpg'),  h06: nh('000020-5.jpg'),
  h07: nh('000023.jpg'),     h08: nh('000036-5.jpg'),  h09: nh('000038-4.jpg'),
  h10: nh('000041.jpg'),     h11: nh('000050-6.jpg'),  h12: nh('000053-5.jpg'),
  h13: nh('000062-7.jpg'),   h14: nh('DSC_0075.jpg'),  h15: nh('DSC_0249.jpg'),
  h16: nh('DSC_0321.jpg'),   h17: nh('DSC_0526.jpg'),  h18: nh('manila-gallery-night-001-original.jpg'),
}

// === LOAD FAVES FOR INNER SLIDES ===
const F = {
  f01:nf('000003.jpg'),     f02:nf('000004.jpg'),     f03:nf('000005-3.jpg'),
  f04:nf('000007-3.jpg'),   f05:nf('000008-3-2.jpg'), f06:nf('000009.jpg'),
  f07:nf('000013-3.jpg'),   f08:nf('000014-3.jpg'),   f09:nf('000017-9.jpg'),
  f10:nf('000022.jpg'),     f11:nf('000025.jpg'),     f12:nf('000027.jpg'),
  f13:nf('000029.jpg'),     f14:nf('000039.jpg'),     f15:nf('000042-5.jpg'),
  f16:nf('000044-2.jpg'),   f17:nf('000045.jpg'),     f18:nf('000048-2.jpg'),
  f19:nf('000062.jpg'),     f20:nf('000063.jpg'),     f21:nf('000066-5.jpg'),
  f22:nf('000068-2.jpg'),   f23:nf('DSC_0163.jpg'),   f24:nf('DSC_0343.jpg'),
  f25:nf('DSC_0462.jpg'),   f26:nf('DSC_0677.jpg'),   f27:nf('DSC_0943.jpg'),
  f28:nf('000037.jpg'),     f29:nf('000026-4.jpg'),   f30:nf('000030-5.jpg'),
  f31:nf('000035-2.jpg'),   f32:nf('000010-10.jpg'),  f33:nf('000018-4.jpg'),
  f34:nf('000011-6.jpg'),   f35:nf('0017_17.jpg'),    f36:nf('000008-7.jpg'),
}

console.log('Loaded 18 headliners + 36 faves')

// === 9 VARIATIONS — 2 headliners each for slides 1-2, rest from faves ===
const variations = [
  { slug: 'v1', slides: [
    hookSlide(H.h14), // DSC_0075 — redhead cave
    heroText('02', H.h16, '35mm film', 'Want content<br/>like this?', 'Sign up below. I direct everything.'), // DSC_0321
    split2('03', F.f03, F.f07, 'Shot on film', 'Two faces.<br/>One camera.'),
    darkSingle('04', F.f06, 'No experience<br/>needed.', 'I direct the entire shoot.'),
    magazine('05', F.f01, 'Bali \u00b7 Film', 'Your face.<br/>My film.<br/>Magic.', 'Free collaboration. I direct everything. You get every edited photo.', F.f02),
    stacked('06', F.f10, F.f11, 'Every shoot is<br/>different.'),
    darkDuo('07', F.f23, F.f24, 'Shot on 35mm film', 'Beach. Villa. Night. Your choice.'),
    warm3('08', 'All 35mm', F.f27, F.f26, F.f25, 'Film portraits<br/>in Bali.'),
    heroText('09', F.f14, 'Bali', 'This could<br/>be you.', 'Sign up if you are interested in collaborating.'),
    ctaSlide(F.f08),
  ]},
  { slug: 'v2', slides: [
    hookSlide(H.h07), // 000023 — tile floor girl
    heroText('02', H.h10, 'Bali \u00b7 35mm', 'Film portraits<br/>hit different.', 'No filter. Just grain and light.'), // 000041
    darkDuo('03', F.f05, F.f36, 'Seoul \u00b7 Film', 'Same camera. Different continent.'),
    magazine('04', F.f19, 'What you get', 'Edited 35mm<br/>film portraits.', 'Professional direction. Beautiful locations. Every photo yours to keep.', F.f20),
    split2('05', F.f12, F.f29, 'TFP collaboration', 'You get photos.<br/>I get to shoot.'),
    heroText('06', F.f09, 'Intimate', 'The quiet<br/>moments are<br/>always best.', '35mm film. Directed by me.'),
    darkDuo('07', F.f15, F.f16, 'All directed by me', 'No experience needed. I handle everything.'),
    warm3('08', 'Shot on film', F.f31, F.f28, F.f34, 'Real film.<br/>Real people.'),
    heroText('09', F.f32, 'Bali', 'This could<br/>be you.', 'Sign up below.'),
    ctaSlide(F.f22),
  ]},
  { slug: 'v3', slides: [
    hookSlide(H.h17), // DSC_0526 — blonde villa
    heroText('02', H.h15, 'Bali', 'Golden hour.<br/>Beach. Jungle.', 'Your choice of location.'), // DSC_0249
    darkSingle('03', F.f07, 'Want photos<br/>like this?', 'Sign up below.'),
    split2('04', F.f13, F.f30, 'All 35mm film', 'Content that<br/>stands out.'),
    heroText('05', F.f03, 'TFP collaboration', 'You get every<br/>edited photo.', 'Use them however you want.'),
    stacked('06', F.f17, F.f18, 'Build your<br/>portfolio with<br/>real film.'),
    magazine('07', F.f21, 'Model collab', 'Sign up.<br/>Show up.<br/>Get photos.', 'I plan the location, direct the shoot, edit the photos, and send them to you.', F.f22),
    darkDuo('08', F.f33, F.f35, '@madebyaidan', 'I handle posing. Lighting. Editing.'),
    heroText('09', F.f27, 'Bali', 'This could<br/>be you.', 'Sign up if you are interested in collaborating.'),
    ctaSlide(F.f06),
  ]},
  { slug: 'v4', slides: [
    hookSlide(H.h03), // 000016-3 — hands face closeup
    heroText('02', H.h05, 'Film', 'Your face<br/>deserves 35mm.', 'TFP collaboration in Bali.'), // 000019-6
    split2('03', F.f08, F.f07, 'Night shoots', 'City lights.<br/>Film grain.'),
    darkSingle('04', F.f26, 'No cost.<br/>No catch.', 'TFP means we both win.'),
    heroText('05', F.f24, 'Bali', 'Beach towns.<br/>Mountain towns.', 'Wherever the light is good.'),
    stacked('06', F.f01, F.f02, 'Different vibes.<br/>Same quality.'),
    magazine('07', F.f05, 'What you get', 'Professionally<br/>directed film<br/>portraits.', 'Edited high-res scans. Yours to use however you want.', F.f36),
    warm3('08', 'All 35mm', F.f14, F.f34, F.f28, 'Nature on film<br/>hits different.'),
    heroText('09', F.f23, 'Bali', 'This could<br/>be you.', 'Sign up below.'),
    ctaSlide(F.f11),
  ]},
  { slug: 'v5', slides: [
    hookSlide(H.h01), // 000001-8 — blonde garden
    heroText('02', H.h12, '35mm film', 'Be part of<br/>something real.', 'Film portraits. Bali. This month.'), // 000053-5
    darkDuo('03', F.f10, F.f12, 'Shot on film', 'Every face tells a story.'),
    heroText('04', F.f09, 'Intimate', 'Soft light.<br/>Close up.<br/>Real.', 'The best ones are always quiet.'),
    split2('05', F.f19, F.f20, 'Model collab', 'Your portfolio<br/>needs this.'),
    darkSingle('06', F.f27, 'Limited spots<br/>this month.', 'Sign up for a free film session.'),
    stacked('07', F.f25, F.f26, 'I direct<br/>everything.'),
    magazine('08', F.f06, 'TFP collaboration', 'We both build<br/>our books.', 'Free session. I direct everything. All skill levels welcome.', F.f15),
    heroText('09', F.f31, 'Bali', 'This could<br/>be you.', 'Sign up if you are interested in collaborating.'),
    ctaSlide(F.f07),
  ]},
  { slug: 'v6', slides: [
    hookSlide(H.h09), // 000038-4
    heroText('02', H.h11, 'Bali', 'Your face<br/>on film.', 'Free collaboration. Sign up below.'), // 000050-6
    split2('03', F.f03, F.f05, 'Taipei \u00b7 Seoul', 'Same camera.<br/>Different energy.'),
    darkDuo('04', F.f16, F.f17, 'All directed by me', 'No experience needed.'),
    magazine('05', F.f08, 'Shot on 35mm', 'Content that<br/>actually<br/>stands out.', 'Film grain. Warm tones. Directed portraits that look nothing like an iPhone.', F.f07),
    heroText('06', F.f30, 'Intimate', 'The grain is<br/>not a flaw.', 'It is the whole point.'),
    stacked('07', F.f29, F.f33, 'Every face<br/>is worth<br/>shooting.'),
    warm3('08', 'Film portraits', F.f23, F.f24, F.f27, 'Timeless<br/>content.'),
    heroText('09', F.f32, 'Bali', 'This could<br/>be you.', 'Sign up below.'),
    ctaSlide(F.f21),
  ]},
  { slug: 'v7', slides: [
    hookSlide(H.h04), // 000016-7
    heroText('02', H.h06, 'Bali \u00b7 Film', 'Get shot<br/>on film.', 'Free collaboration. I direct everything.'), // 000020-5
    darkSingle('03', F.f11, 'Want content<br/>like this?', 'Sign up below. It is free.'),
    split2('04', F.f22, F.f21, 'All 35mm film', 'Real grain.<br/>Real light.'),
    heroText('05', F.f14, 'Nature', 'Golden hour<br/>on film.', 'Beach. Jungle. Rice fields.'),
    magazine('06', F.f01, 'Model collab', 'Sign up.<br/>Show up.<br/>Get photos.', 'I plan the location, direct the shoot, and send you every edited photo.', F.f02),
    darkDuo('07', F.f35, F.f36, 'Shot on 35mm', 'No experience needed. I handle everything.'),
    stacked('08', F.f18, F.f19, 'Film portraits<br/>in Bali.'),
    heroText('09', F.f25, 'Bali', 'This could<br/>be you.', 'Sign up if you are interested in collaborating.'),
    ctaSlide(F.f13),
  ]},
  { slug: 'v8', slides: [
    hookSlide(H.h02), // 000015-2
    heroText('02', H.h08, '35mm film', 'Free 35mm<br/>portraits.', 'TFP. You get every photo.'), // 000036-5
    darkDuo('03', F.f26, F.f23, 'Bali shoots', 'Villa. Beach. Night. Your call.'),
    heroText('04', F.f03, 'Shot on film', 'Film portraits<br/>hit different.', 'No filter. Just grain and light.'),
    split2('05', F.f06, F.f15, 'TFP collaboration', 'No cost.<br/>Real content.'),
    darkSingle('06', F.f09, 'I handle<br/>everything.', 'Posing. Lighting. Location. Editing.'),
    warm3('07', 'All 35mm', F.f31, F.f28, F.f14, 'Warm light.<br/>Real film.'),
    stacked('08', F.f10, F.f12, 'Different looks.<br/>Same session.'),
    heroText('09', F.f24, 'Bali', 'This could<br/>be you.', 'Sign up below.'),
    ctaSlide(F.f20),
  ]},
  { slug: 'v9', slides: [
    // Custom hook for landscape photo — contained in frame, not cropped
    {name:'01-hook',html:dark(tag('Shot on 35mm film',64,60)+'<div style="position:absolute;left:40px;top:120px;right:40px;height:640px;border-radius:12px;overflow:hidden;"><img src="'+H.h13+'" style="width:100%;height:100%;object-fit:cover;object-position:center;display:block;"/></div>'+h1("I'm looking for<br/>models in Bali.",540)+sub('Sign up if you are interested<br/>in collaborating.',420,42))},
    heroText('02', H.h18, 'Bali', 'Models wanted<br/>in Bali.', 'TFP. All skill levels.'), // manila square, works as hero
    split2('03', F.f07, F.f08, 'Night shoots', 'City lights<br/>on film.'),
    magazine('04', F.f05, 'What you get', 'Edited 35mm<br/>portraits.', 'Professional direction. Every photo yours to keep. No cost.', F.f36),
    heroText('05', F.f27, 'Bali', 'Beach. Cave.<br/>Golden hour.', 'Your choice of location.'),
    darkDuo('06', F.f16, F.f17, 'All directed by me', 'No experience needed.'),
    stacked('07', F.f33, F.f35, 'Every face<br/>is worth<br/>shooting.'),
    warm3('08', 'Shot on film', F.f34, F.f30, F.f13, 'The grain<br/>is the point.'),
    heroText('09', F.f32, 'Bali', 'This could<br/>be you.', 'Sign up if you are interested in collaborating.'),
    ctaSlide(F.f19),
  ]},
]

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
