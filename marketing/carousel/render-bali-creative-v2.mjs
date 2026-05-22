import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, 'output-bali-creative-v2')
const ND = '/Users/aidantorrence/Documents/aidan-modern/public/images/new'
fs.mkdirSync(OUT, { recursive: true })

function n(f) { return 'data:image/jpeg;base64,' + fs.readFileSync(path.join(ND, f)).toString('base64') }

const SE = "Georgia, 'Times New Roman', serif"
const SA = "Inter, -apple-system, system-ui, sans-serif"
const MO = "'Courier New', monospace"
const SH = 'text-shadow: 0 3px 6px rgba(0,0,0,1), 0 10px 40px rgba(0,0,0,0.8), 0 0 100px rgba(0,0,0,0.5);'
const GR = '<div style="position:absolute;inset:0;pointer-events:none;opacity:0.08;mix-blend-mode:soft-light;background-image:radial-gradient(circle at 14% 18%, rgba(255,255,255,0.5), transparent 17%),radial-gradient(circle at 84% 12%, rgba(255,255,255,0.28), transparent 15%),repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0 1px, transparent 1px 4px);"></div>'

// Portrait image helper — always taller than wide
function img(src, l, t, w, h, extra) { extra=extra||''; return '<img src="'+src+'" style="position:absolute;left:'+l+'px;top:'+t+'px;width:'+w+'px;height:'+h+'px;object-fit:cover;object-position:center top;display:block;'+extra+'"/>' }
// Print — portrait with white border
function pr(src, l, t, w, h, rot, b) { b=b||12; return '<div style="position:absolute;left:'+l+'px;top:'+t+'px;width:'+(w+b*2)+'px;height:'+(h+b*2)+'px;background:white;padding:'+b+'px;transform:rotate('+rot+'deg);box-shadow:0 8px 40px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.2);"><img src="'+src+'" style="width:'+w+'px;height:'+h+'px;object-fit:cover;object-position:center top;display:block;"/></div>' }
// Dark print — black border
function bpr(src, l, t, w, h, rot, b) { b=b||6; return '<div style="position:absolute;left:'+l+'px;top:'+t+'px;width:'+(w+b*2)+'px;height:'+(h+b*2)+'px;background:#1a1a1a;padding:'+b+'px;transform:rotate('+rot+'deg);box-shadow:0 8px 40px rgba(0,0,0,0.5);"><img src="'+src+'" style="width:'+w+'px;height:'+h+'px;object-fit:cover;object-position:center top;display:block;"/></div>' }

function hero(src, inner) { return '<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">'+img(src,0,0,1080,1920,'filter:saturate(1.1) contrast(1.05);')+'<div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(0,0,0,0.1) 0%, transparent 15%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.96) 100%);"></div>'+inner+GR+'</div>' }
function dark(inner) { return '<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#080a0e;"><div style="position:absolute;inset:0;background:linear-gradient(170deg, #0c1420 0%, #080c14 50%, #060a10 100%);"></div><div style="position:absolute;inset:0;background:radial-gradient(circle at 20% 20%, rgba(80,140,220,0.12), transparent 30%), radial-gradient(circle at 80% 80%, rgba(220,170,100,0.08), transparent 25%);"></div>'+inner+GR+'</div>' }
function warm(inner) { return '<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#f5f0e6;"><div style="position:absolute;inset:0;background:linear-gradient(170deg, #faf6ee 0%, #f0e8d8 50%, #e5d8c4 100%);"></div>'+inner+'</div>' }
function cta(src, inner) { return '<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">'+img(src,0,0,1080,1920,'filter:saturate(1.1) brightness(0.5);')+'<div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.15) 30%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.95) 100%);"></div>'+inner+GR+'</div>' }

function h1(t, bot, sz) { sz=sz||108; return '<div style="position:absolute;bottom:'+bot+'px;left:64px;right:64px;"><p style="font-family:'+SE+';font-size:'+sz+'px;font-weight:700;font-style:italic;color:white;line-height:0.92;margin:0;'+SH+'">'+t+'</p></div>' }
function h2(t, bot, sz) { sz=sz||64; return '<div style="position:absolute;bottom:'+bot+'px;left:64px;right:64px;"><p style="font-family:'+SE+';font-size:'+sz+'px;font-weight:700;font-style:italic;color:white;line-height:1.0;margin:0;'+SH+'">'+t+'</p></div>' }
function sub(t, bot, sz) { sz=sz||34; return '<div style="position:absolute;bottom:'+bot+'px;left:64px;right:64px;"><p style="font-family:'+SA+';font-size:'+sz+'px;font-weight:500;color:rgba(255,255,255,0.85);line-height:1.35;margin:0;'+SH+'">'+t+'</p></div>' }
function tag(t, l, top) { return '<p style="position:absolute;left:'+l+'px;top:'+top+'px;font-family:'+SA+';font-size:24px;font-weight:700;color:rgba(255,255,255,0.7);letter-spacing:0.12em;text-transform:uppercase;margin:0;'+SH+'">'+t+'</p>' }
function dtag(t, l, top) { return '<p style="position:absolute;left:'+l+'px;top:'+top+'px;font-family:'+SA+';font-size:18px;font-weight:700;color:rgba(0,0,0,0.3);letter-spacing:0.15em;text-transform:uppercase;margin:0;">'+t+'</p>' }
function dh(t, bot, sz) { sz=sz||56; return '<div style="position:absolute;bottom:'+bot+'px;left:64px;right:64px;"><p style="font-family:'+SE+';font-size:'+sz+'px;font-weight:700;font-style:italic;color:#1a1a1a;line-height:0.95;margin:0;">'+t+'</p></div>' }
function dsub(t, bot, sz) { sz=sz||28; return '<div style="position:absolute;bottom:'+bot+'px;left:64px;right:200px;"><p style="font-family:'+SA+';font-size:'+sz+'px;color:rgba(0,0,0,0.45);line-height:1.5;margin:0;">'+t+'</p></div>' }
function ctaBlock() { return '<div style="position:absolute;bottom:380px;left:64px;right:64px;"><p style="font-family:'+SA+';font-size:38px;font-weight:600;color:white;margin:0;'+SH+'">Click the link below to sign up.</p><p style="font-family:'+SA+';font-size:32px;color:rgba(255,255,255,0.7);margin:20px 0 0;'+SH+'">I handle everything. No experience needed.</p></div>' }
function hookSlide(src) { return { name: '01-hook', html: hero(src, tag('Shot on 35mm film', 64, 60) + h1("I'm looking for<br/>models in Bali.", 540) + sub('Sign up if you want<br/>photos like this.', 420, 44)) } }
function ctaSlide(src) { return { name: '10-cta', html: cta(src, h1('Sign up.', 520) + ctaBlock()) } }

// === LOAD 80+ PHOTOS ===
const P = {
  // HK night
  a1:n('000022.jpg'), a2:n('000022-4.jpg'), a3:n('000022-6.jpg'),
  a4:n('000023.jpg'), a5:n('000023-4.jpg'), a6:n('000023-6.jpg'),
  a7:n('000024.jpg'), a8:n('000024-3.jpg'), a9:n('000024-4.jpg'),
  a10:n('000025.jpg'), a11:n('000025-2.jpg'), a12:n('000025-3.jpg'),
  a13:n('000026-2.jpg'), a14:n('000026-3.jpg'), a15:n('000026-4.jpg'), a16:n('000026-8.jpg'),
  // HK extended
  a17:n('000027.jpg'), a18:n('000027-2.jpg'), a19:n('000027-3.jpg'), a20:n('000027-4.jpg'),
  a21:n('000028-3.jpg'), a22:n('000028-9.jpg'), a23:n('000028-10.jpg'),
  a24:n('000029-3.jpg'), a25:n('000029-10.jpg'),
  a26:n('000030.jpg'), a27:n('000030-4.jpg'),
  // Chongqing
  b1:n('000020-4.jpg'), b2:n('000020-5.jpg'), b3:n('000020-6.jpg'), b4:n('000020-9.jpg'),
  b5:n('000021-4.jpg'), b6:n('000021.jpg'),
  // More range
  c1:n('000032-3.jpg'), c2:n('000040-7.jpg'),
  // Proven heroes
  d1:n('000005-3.jpg'), d2:n('000008-3.jpg'), d3:n('000016.jpg'), d4:n('000009.jpg'),
  d5:n('000015-3.jpg'), d6:n('000013-3.jpg'), d7:n('000017-4.jpg'), d8:n('000012.jpg'),
  d9:n('000013-7-2.jpg'), d10:n('000015-8.jpg'), d11:n('000001-8.jpg'), d12:n('000011-6.jpg'),
  d13:n('000010-10.jpg'), d14:n('000003.jpg'), d15:n('000004.jpg'),
}

// === LAYOUT BUILDERS (all portrait crops) ===

// 8 portrait scattered prints — 3 rows
function scatter8(nm, tg, p8, btm) { return { name: nm, html: dark(
  tag(tg, 64, 40) +
  pr(p8[0], 50,  90,  280, 380, -2.5) + pr(p8[1], 370, 70,  280, 380, 1.8) + pr(p8[2], 700, 100, 280, 380, -1.2) +
  pr(p8[3], 90,  510, 270, 360, 1.6) + pr(p8[4], 430, 490, 270, 360, -2.0) + pr(p8[5], 740, 520, 270, 360, 2.4) +
  pr(p8[6], 170, 920, 300, 400, -1.4) + pr(p8[7], 570, 900, 300, 400, 1.9) +
  sub(btm, 60)
)}}
// 5 portrait fan
function fan5(nm, tg, p5, btm) { return { name: nm, html: dark(
  tag(tg, 64, 40) +
  pr(p5[0], 20,  240, 280, 400, -10, 12) + pr(p5[1], 200, 140, 300, 420, -3, 12) +
  pr(p5[2], 400, 100, 300, 420, 2, 12) + pr(p5[3], 600, 160, 280, 400, 7, 12) +
  pr(p5[4], 760, 280, 260, 380, 12, 12) +
  sub(btm, 60)
)}}
// 4 large portrait cascade
function cascade4(nm, tg, p4, btm) { return { name: nm, html: dark(
  tag(tg, 64, 40) +
  pr(p4[0], 40,  80,  420, 560, -2.5, 14) + pr(p4[1], 500, 200, 440, 580, 2, 14) +
  pr(p4[2], 80,  640, 400, 540, 1.8, 14) + pr(p4[3], 520, 760, 420, 560, -2.5, 14) +
  sub(btm, 60)
)}}
// Photo booth strip — 3 portrait frames in white strip
function booth3(nm, tg, p3, btm) { return { name: nm, html: dark(
  tag(tg, 64, 40) +
  '<div style="position:absolute;left:260px;top:80px;width:560px;background:white;padding:20px 20px 50px;transform:rotate(-1.5deg);box-shadow:8px 8px 40px rgba(0,0,0,0.5);">' +
  '<img src="'+p3[0]+'" style="width:520px;height:400px;object-fit:cover;object-position:center top;display:block;margin-bottom:14px;"/>' +
  '<img src="'+p3[1]+'" style="width:520px;height:400px;object-fit:cover;object-position:center top;display:block;margin-bottom:14px;"/>' +
  '<img src="'+p3[2]+'" style="width:520px;height:400px;object-fit:cover;object-position:center top;display:block;"/>' +
  '</div>' +
  sub(btm, 60)
)}}
// 5 hero-accent — 1 big center + 4 small portrait corners
function heroAcc(nm, tg, p5, btm) { return { name: nm, html: dark(
  tag(tg, 64, 40) +
  pr(p5[0], 160, 160, 740, 560, -0.5, 16) +
  pr(p5[1], 20,  80,  200, 280, -5, 10) + pr(p5[2], 840, 60,  200, 280, 4, 10) +
  pr(p5[3], 40,  760, 200, 280, 3, 10) + pr(p5[4], 820, 780, 200, 280, -4, 10) +
  sub(btm, 60)
)}}
// 6 tight pile portrait
function pile6(nm, tg, p6, btm) { return { name: nm, html: dark(
  tag(tg, 64, 40) +
  pr(p6[0], 60,  100, 300, 420, -4, 12) + pr(p6[1], 380, 80,  320, 440, 3, 12) + pr(p6[2], 700, 120, 280, 400, -2, 12) +
  pr(p6[3], 100, 560, 320, 440, 2.5, 12) + pr(p6[4], 420, 540, 300, 420, -3, 12) + pr(p6[5], 720, 580, 280, 400, 2, 12) +
  sub(btm, 60)
)}}
// Film strip — 3 portrait frames with sprocket holes
function filmStrip(nm, tg, p3, btm) { return { name: nm, html:
  '<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#1a1a1a;">' +
  Array.from({length:10}, (_,i) => '<div style="position:absolute;left:20px;top:'+(60+i*190)+'px;width:36px;height:24px;background:#0a0a0a;border-radius:3px;"></div><div style="position:absolute;right:20px;top:'+(60+i*190)+'px;width:36px;height:24px;background:#0a0a0a;border-radius:3px;"></div>').join('') +
  img(p3[0], 80, 40, 440, 600) + img(p3[1], 560, 40, 440, 600) +
  img(p3[2], 80, 680, 920, 700, 'object-position:center top;') +
  '<p style="position:absolute;left:80px;bottom:80px;font-family:'+MO+';font-size:14px;color:rgba(255,180,60,0.5);margin:0;">KODAK PORTRA 400 &nbsp;&nbsp; 24A &nbsp; 25A &nbsp; 26A</p>' +
  '<p style="position:absolute;right:80px;bottom:80px;font-family:'+SA+';font-size:20px;font-weight:600;color:rgba(255,255,255,0.5);letter-spacing:0.1em;text-transform:uppercase;margin:0;">'+tg+'</p>' +
  sub(btm, 120) + GR + '</div>'
}}
// Warm paper — 4 portrait prints
function warm4(nm, tg, p4, btm) { return { name: nm, html: warm(
  dtag(tg, 64, 50) +
  pr(p4[0], 40, 100, 420, 560, -3, 14) + pr(p4[1], 500, 60, 460, 600, 2.5, 14) +
  pr(p4[2], 80, 700, 480, 640, 2, 14) + pr(p4[3], 500, 720, 440, 580, -2.5, 14) +
  dh(btm, 80)
)}}
// Magazine — photo top + warm text panel bottom + inset print
function magazine(nm, heroImg, tg, headline, body, insetImg) { return { name: nm, html:
  '<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#f5f0e6;">' +
  img(heroImg, 0, 0, 1080, 1060, 'object-position:center top;') +
  '<div style="position:absolute;left:0;top:1020px;width:1080px;height:900px;background:#f5f0e6;"></div>' +
  '<p style="position:absolute;left:64px;top:1060px;font-family:'+SA+';font-size:16px;font-weight:700;color:rgba(0,0,0,0.3);letter-spacing:0.15em;text-transform:uppercase;margin:0;">'+tg+'</p>' +
  '<p style="position:absolute;left:64px;top:1110px;right:64px;font-family:'+SE+';font-size:68px;font-weight:700;font-style:italic;color:#1a1a1a;line-height:0.95;margin:0;">'+headline+'</p>' +
  '<p style="position:absolute;left:64px;top:1380px;right:300px;font-family:'+SA+';font-size:26px;color:rgba(0,0,0,0.4);line-height:1.5;margin:0;">'+body+'</p>' +
  '<div style="position:absolute;right:40px;bottom:60px;width:220px;height:300px;background:white;padding:10px;transform:rotate(3deg);box-shadow:4px 4px 20px rgba(0,0,0,0.12);"><img src="'+insetImg+'" style="width:200px;height:280px;object-fit:cover;object-position:center top;display:block;"/></div>' +
  '</div>'
}}
// Split — 2 tall portrait photos side by side
function split2(nm, img1, img2, tg, headline) { return { name: nm, html:
  '<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">' +
  img(img1, 0, 0, 534, 1920) + img(img2, 546, 0, 534, 1920) +
  '<div style="position:absolute;left:534px;top:0;width:12px;height:1920px;background:#000;"></div>' +
  '<div style="position:absolute;bottom:0;left:0;right:0;height:400px;background:linear-gradient(180deg, transparent, rgba(0,0,0,0.95));"></div>' +
  '<p style="position:absolute;bottom:260px;left:64px;font-family:'+SA+';font-size:20px;font-weight:700;color:rgba(255,255,255,0.5);letter-spacing:0.12em;text-transform:uppercase;margin:0;'+SH+'">'+tg+'</p>' +
  '<p style="position:absolute;bottom:140px;left:64px;right:64px;font-family:'+SE+';font-size:64px;font-weight:700;font-style:italic;color:white;line-height:0.95;margin:0;'+SH+'">'+headline+'</p>' +
  GR + '</div>'
}}
// Stacked diptych — 2 portrait photos stacked with text band
function stacked(nm, topImg, botImg, text) { return { name: nm, html:
  '<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#0a0a0a;">' +
  img(topImg, 60, 60, 960, 680, 'object-position:center top;') +
  '<div style="position:absolute;left:0;top:740px;width:1080px;height:200px;background:#0a0a0a;display:flex;align-items:center;padding:0 64px;">' +
  '<p style="font-family:'+SE+';font-size:52px;font-weight:700;font-style:italic;color:white;line-height:1.0;margin:0;'+SH+'">'+text+'</p></div>' +
  img(botImg, 60, 940, 960, 680, 'object-position:center top;') +
  '<p style="position:absolute;bottom:60px;left:64px;font-family:'+SA+';font-size:20px;font-weight:600;color:rgba(255,255,255,0.4);letter-spacing:0.1em;text-transform:uppercase;margin:0;'+SH+'">Both shot on 35mm \u00b7 @madebyaidan</p>' +
  GR + '</div>'
}}

// === 10 CAROUSEL VARIATIONS ===
const variations = [
  // V1: Film strip + scatter + magazine
  { slug: 'v1', slides: [
    hookSlide(P.d1),
    filmStrip('02', 'Hong Kong \u00b7 35mm', [P.a4, P.a10, P.a17], 'Shot on Portra 400.'),
    scatter8('03', 'Taipei \u00b7 Night', [P.a7, P.a8, P.a11, P.a12, P.a13, P.a14, P.a15, P.a16], 'Eight people. One city. All film.'),
    magazine('04', P.d3, 'Kaohsiung \u00b7 Shot on film', 'Every face<br/>tells a<br/>different story.', 'I direct everything. No experience needed. All shot on 35mm film across 13 cities.', P.d4),
    pile6('05', 'Chongqing \u00b7 Guangzhou', [P.b1, P.b2, P.b3, P.b4, P.b5, P.b6], 'Markets. Streets. Real life.'),
    { name: '06', html: hero(P.d7, h2('The quiet ones<br/>are always best.', 440) + sub('35mm film. Directed by me.', 370)) },
    fan5('07', 'Singapore \u00b7 Ulaanbaatar \u00b7 La Union', [P.a21, P.a24, P.a26, P.c1, P.d13], 'I find people worth shooting everywhere.'),
    warm4('08', 'All 35mm film', [P.a1, P.a5, P.d6, P.d5], 'Real people.<br/>Real places.'),
    { name: '09', html: hero(P.d15, h1('Now Bali.', 500) + sub('Sign up if you want photos like this.', 420)) },
    ctaSlide(P.d8),
  ]},
  // V2: Split + booth + cascade
  { slug: 'v2', slides: [
    hookSlide(P.d2),
    split2('02', P.d6, P.d5, 'Hong Kong \u00b7 One night', 'Same camera.<br/>Different energy.'),
    booth3('03', 'Taipei \u00b7 Film', [P.a4, P.a10, P.a17], 'Three faces. One strip.'),
    cascade4('04', 'Chongqing \u00b7 35mm', [P.b1, P.b2, P.b3, P.b4], 'Street fashion at its rawest.'),
    { name: '05', html: hero(P.d2, tag('Seoul', 64, 60) + h2('She had never<br/>modeled before.', 440) + sub('Look at her.', 370)) },
    scatter8('06', 'Everywhere \u00b7 35mm', [P.a7, P.b5, P.a21, P.a24, P.d13, P.d4, P.c1, P.a26], 'Different people. Same quality.'),
    stacked('07', P.d2, P.d1, 'Seoul on top.<br/>Taipei below.'),
    pile6('08', 'All directed by me', [P.a1, P.a5, P.a13, P.a22, P.d12, P.d11], 'No experience needed.'),
    { name: '09', html: hero(P.d3, h1('Your turn.', 500) + sub('Sign up if you want photos like this.', 420)) },
    ctaSlide(P.d5),
  ]},
  // V3: Magazine heavy
  { slug: 'v3', slides: [
    hookSlide(P.a4),
    magazine('02', P.d3, 'Kaohsiung \u00b7 Film', 'I direct<br/>everything.', 'No experience needed. 35mm film. 13 cities across Asia.', P.d4),
    scatter8('03', 'Hong Kong \u00b7 Night', [P.a1, P.a2, P.a3, P.a4, P.a5, P.a6, P.a7, P.a8], 'City lights. Film grain.'),
    magazine('04', P.d7, 'Intimate', 'The best<br/>shoots are<br/>unplanned.', 'I just need the right face and the right light.', P.d6),
    fan5('05', 'Taipei \u00b7 Seoul', [P.a10, P.a12, P.a14, P.d2, P.a16], 'Fashion meets street.'),
    { name: '06', html: hero(P.b1, tag('Chongqing', 64, 60) + h2('China on film.', 460) + sub('Markets. Alleyways. Real life.', 390)) },
    scatter8('07', 'Singapore \u00b7 Mongolia \u00b7 Philippines', [P.a21, P.a24, P.a26, P.b5, P.c1, P.d13, P.d11, P.d14], 'Everywhere I go.'),
    warm4('08', 'Shot on 35mm', [P.a17, P.a22, P.b2, P.d12], 'Same camera<br/>since day one.'),
    { name: '09', html: hero(P.d15, h1('Next: Bali.', 500) + sub('Sign up if you want photos like this.', 420)) },
    ctaSlide(P.d8),
  ]},
  // V4: Story beats
  { slug: 'v4', slides: [
    hookSlide(P.d6),
    { name: '02', html: hero(P.a4, tag('She was sitting at a night market', 64, 60) + sub('I asked if she wanted photos. She said yes.', 420)) },
    cascade4('03', 'Then it became a pattern', [P.b1, P.d4, P.a17, P.a10], 'Strangers who trusted a guy with a camera.'),
    { name: '04', html: hero(P.d2, tag('Seoul', 64, 60) + h2('She almost<br/>cancelled.', 460) + sub('Glad she did not.', 400)) },
    scatter8('05', 'Night shoots across Asia', [P.a1, P.a5, P.a8, P.d6, P.d5, P.d9, P.a13, P.a22], 'City lights. Film grain. Real moments.'),
    magazine('06', P.b1, 'Chongqing', 'A flower seller.<br/>20 minutes.<br/>36 frames.', 'Sometimes the best subjects find you.', P.b3),
    pile6('07', 'All 35mm film', [P.a24, P.a26, P.c1, P.d13, P.b5, P.d11], 'Every single one directed by me.'),
    { name: '08', html: hero(P.d7, h2('None of them<br/>had modeled<br/>before.', 400) + sub('That is the point.', 330)) },
    { name: '09', html: hero(P.d3, h1('Who is next<br/>in Bali?', 500) + sub('Maybe you. Sign up below.', 420)) },
    ctaSlide(P.a17),
  ]},
  // V5: Warm paper + dark alternating
  { slug: 'v5', slides: [
    hookSlide(P.d3),
    warm4('02', 'Taipei', [P.a7, P.a10, P.a12, P.a14], 'Her first time<br/>in front of a camera.'),
    scatter8('03', 'Hong Kong', [P.a1, P.a2, P.a3, P.a4, P.a5, P.a6, P.a8, P.a9], 'Night. Film. No flash.'),
    warm4('04', 'Chongqing \u00b7 Guangzhou', [P.b1, P.b2, P.b3, P.b4], 'Street fashion<br/>on 35mm.'),
    { name: '05', html: hero(P.d7, h2('Soft light.<br/>Close up.<br/>Real.', 400)) },
    scatter8('06', 'Singapore \u00b7 Baguio \u00b7 La Union', [P.a21, P.a24, P.a26, P.c1, P.d13, P.d11, P.b5, P.d14], 'Beach. Mountains. Everywhere.'),
    warm4('07', 'Seoul \u00b7 Tokyo', [P.d2, P.a17, P.a22, P.d12], 'Same film.<br/>Different faces.'),
    { name: '08', html: hero(P.a17, tag('Ulaanbaatar', 64, 60) + sub('Yes, even Mongolia.', 420)) },
    { name: '09', html: hero(P.d15, h1('Now Bali.', 500) + sub('Sign up if you want photos like this.', 420)) },
    ctaSlide(P.d5),
  ]},
  // V6: Hero-heavy + accents
  { slug: 'v6', slides: [
    hookSlide(P.a17),
    { name: '02', html: hero(P.a4, tag('Hong Kong', 64, 60)) },
    heroAcc('03', 'Then I kept shooting', [P.d6, P.a1, P.a5, P.b1, P.a21], 'Every city. New faces. Same film.'),
    { name: '04', html: hero(P.b1, tag('Chongqing', 64, 60)) },
    { name: '05', html: hero(P.d2, tag('Seoul', 64, 60)) },
    heroAcc('06', '35mm film \u00b7 everywhere', [P.a17, P.a24, P.d13, P.c1, P.d14], 'I find people worth shooting everywhere.'),
    { name: '07', html: hero(P.d7, tag('Intimate', 64, 60)) },
    { name: '08', html: hero(P.a10, tag('Taipei', 64, 60)) },
    { name: '09', html: hero(P.d15, tag('Bali \u2014 your turn', 64, 60) + h1('Now you.', 500) + sub('I direct everything. No experience needed.', 420)) },
    ctaSlide(P.d5),
  ]},
  // V7: Booth + film strip + fan
  { slug: 'v7', slides: [
    hookSlide(P.d4),
    filmStrip('02', 'Hong Kong \u00b7 Night', [P.a1, P.a5, P.a17], 'Kodak Portra 400.'),
    booth3('03', 'Taipei', [P.a7, P.a12, P.a15], 'Fashion meets film.'),
    { name: '04', html: hero(P.b1, tag('Chongqing', 64, 60) + h2('Street markets<br/>at golden hour.', 440)) },
    fan5('05', 'Night people', [P.a2, P.a6, P.a8, P.d6, P.d9], 'City lights. Film grain.'),
    booth3('06', 'Singapore \u00b7 Ulaanbaatar', [P.a21, P.a24, P.a26], 'Proof I shoot everywhere.'),
    { name: '07', html: hero(P.d7, h2('I direct<br/>everything.', 460) + sub('No experience needed.', 390)) },
    scatter8('08', 'All 35mm film', [P.b2, P.a13, P.a22, P.c1, P.d11, P.d13, P.d14, P.b5], 'The grain is the point.'),
    { name: '09', html: hero(P.d3, h1('Now Bali.', 500) + sub('Sign up if you want photos like this.', 420)) },
    ctaSlide(P.d8),
  ]},
  // V8: Stats + mixed dense
  { slug: 'v8', slides: [
    hookSlide(P.d3),
    scatter8('02', 'Baguio \u00b7 La Union \u00b7 Kaohsiung \u00b7 Taipei', [P.a7, P.a12, P.a14, P.d13, P.d11, P.b2, P.c1, P.d14], '8 shoots. 4 cities. All 35mm.'),
    fan5('03', 'Hong Kong \u00b7 Night', [P.a1, P.a4, P.a5, P.a10, P.a17], 'Night shoots. No flash. Film grain.'),
    { name: '04', html: hero(P.d2, h2('Every one<br/>directed by me.', 440) + sub('No experience needed.', 370)) },
    scatter8('05', 'Ulaanbaatar \u00b7 Singapore \u00b7 Chongqing', [P.a21, P.a24, P.a26, P.b1, P.b3, P.b5, P.a22, P.c1], 'I find faces everywhere.'),
    split2('06', P.d7, P.a10, 'The range', 'Street. Intimate.<br/>Editorial.'),
    stacked('07', P.d2, P.d1, 'Different cities.<br/>Same quality.'),
    pile6('08', 'Same camera since day one', [P.a13, P.a16, P.a22, P.a25, P.b4, P.d12], 'Film. Everywhere.'),
    { name: '09', html: hero(P.d15, h1('City #14:<br/>Bali.', 500) + sub('I need new faces. Sign up below.', 420)) },
    ctaSlide(P.d5),
  ]},
  // V9: Journey + dense
  { slug: 'v9', slides: [
    hookSlide(P.a10),
    { name: '02', html: hero(P.a7, tag('Taipei \u2014 where it started', 64, 60) + sub('First roll of film. First stranger.', 420)) },
    scatter8('03', 'Then everywhere', [P.a1, P.a4, P.b1, P.d4, P.d2, P.a21, P.d13, P.c1], 'Same camera. Different continent every month.'),
    { name: '04', html: hero(P.a4, tag('Hong Kong', 64, 60) + h2('Night shoots<br/>are my thing.', 440)) },
    cascade4('05', 'Night people', [P.a5, P.d6, P.d9, P.d5], 'Best work happens after dark.'),
    scatter8('06', 'Mongolia \u00b7 Singapore \u00b7 Philippines', [P.a24, P.a26, P.d13, P.b5, P.d14, P.d11, P.a22, P.a25], 'People everywhere want great photos.'),
    { name: '07', html: hero(P.d7, h2('The best shoots<br/>are unplanned.', 440) + sub('I just need the right face.', 370)) },
    fan5('08', 'All 35mm film', [P.b2, P.a14, P.a22, P.a25, P.a16], 'Same camera since day one.'),
    { name: '09', html: hero(P.d15, h1('Now: Bali.', 500) + sub('Sign up if you want photos like this.', 420)) },
    ctaSlide(P.d8),
  ]},
  // V10: Aspirational
  { slug: 'v10', slides: [
    hookSlide(P.d2),
    scatter8('02', 'Taipei', [P.a7, P.a8, P.a10, P.a11, P.a12, P.a13, P.a14, P.a15], 'Her first time in front of a camera.'),
    split2('03', P.a4, P.a17, 'Hong Kong', 'Two strangers.<br/>One night.'),
    { name: '04', html: hero(P.d2, tag('Seoul', 64, 60) + h2('She almost<br/>cancelled.', 460) + sub('Glad she did not.', 400)) },
    pile6('05', 'Kaohsiung \u00b7 Tainan \u00b7 Chongqing', [P.b1, P.b2, P.b3, P.b4, P.b5, P.b6], 'Every face has something.'),
    { name: '06', html: hero(P.d13, tag('La Union \u00b7 Baguio', 64, 60) + h2('Nature shoots<br/>hit different<br/>on film.', 400)) },
    heroAcc('07', 'Ulaanbaatar \u00b7 Singapore \u00b7 Tokyo', [P.a21, P.a24, P.c1, P.d11, P.d14], 'I find interesting people everywhere.'),
    warm4('08', 'Shot on 35mm film', [P.d7, P.a22, P.d12, P.d10], 'The grain<br/>is the point.'),
    { name: '09', html: hero(P.d15, h1('Now imagine<br/>yourself here.', 480) + sub('Bali. Sign up below.', 400)) },
    ctaSlide(P.d5),
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
  const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 })
  for (let i = 0; i < all.length; i++) {
    const s = all[i]
    const page = await ctx.newPage()
    await page.setContent('<!doctype html><html><head><style>*{box-sizing:border-box}html,body{margin:0;width:1080px;height:1920px;background:#000;overflow:hidden}body{-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}</style></head><body>' + s.html + '</body></html>', { waitUntil: 'load' })
    await page.waitForTimeout(500)
    await page.screenshot({ path: path.join(OUT, s.dir, s.name + '.png'), type: 'png' })
    await page.close()
    if ((i+1) % 10 === 0 || i === 0) console.log('  [' + (i+1) + '/' + all.length + '] ' + s.name)
  }
  await browser.close()
  console.log('\nDone — ' + all.length + ' slides -> ' + OUT)
}
render()
