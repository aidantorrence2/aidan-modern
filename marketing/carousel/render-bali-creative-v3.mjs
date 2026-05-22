import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, 'output-bali-creative-v3')
const ND = '/Users/aidantorrence/Documents/aidan-modern/public/images/faves'
fs.mkdirSync(OUT, { recursive: true })

function n(f) { return 'data:image/jpeg;base64,' + fs.readFileSync(path.join(ND, f)).toString('base64') }

const SE = "Georgia, 'Times New Roman', serif"
const SA = "Inter, -apple-system, system-ui, sans-serif"
const MO = "'Courier New', monospace"
const SH = 'text-shadow: 0 3px 6px rgba(0,0,0,1), 0 10px 40px rgba(0,0,0,0.8), 0 0 100px rgba(0,0,0,0.5);'
const GR = '<div style="position:absolute;inset:0;pointer-events:none;opacity:0.08;mix-blend-mode:soft-light;background-image:radial-gradient(circle at 14% 18%, rgba(255,255,255,0.5), transparent 17%),radial-gradient(circle at 84% 12%, rgba(255,255,255,0.28), transparent 15%),repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0 1px, transparent 1px 4px);"></div>'

// 35mm filmit image helper — always taller than wide
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
  '<p style="position:absolute;left:80px;bottom:80px;font-family:'+MO+';font-size:14px;color:rgba(255,180,60,0.5);margin:0;">KODAK 35MM &nbsp;&nbsp; 24A &nbsp; 25A &nbsp; 26A</p>' +
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

// === LOAD FROM FAVES — 80+ photos ===
const P = {
  // Strong portraits
  f01:n('000001-4.jpg'), f02:n('000001-8.jpg'),
  f03:n('000002-11.jpg'), f04:n('000002-4.jpg'),
  f05:n('000003-4.jpg'), f06:n('000003-8.jpg'), f07:n('000003.jpg'),
  f08:n('000004-8.jpg'), f09:n('000004.jpg'),
  f10:n('000005-11.jpg'), f11:n('000005-3.jpg'),
  f12:n('000007-3.jpg'), f13:n('000007-4.jpg'),
  f14:n('000008-3-2.jpg'), f15:n('000008-7.jpg'), f16:n('000008-8.jpg'), f17:n('000008.jpg'),
  f18:n('000009-7.jpg'), f19:n('000009.jpg'),
  f20:n('000010-10.jpg'), f21:n('000010-3.jpg'), f22:n('000010-6.jpg'),
  f23:n('000011-6.jpg'),
  f24:n('000013-3.jpg'), f25:n('000014-3.jpg'), f26:n('000014-5.jpg'),
  f27:n('000015-2.jpg'), f28:n('000015-3.jpg'), f29:n('000015-8.jpg'),
  f30:n('000016-3.jpg'), f31:n('000016.jpg'), f32:n('000016-7.jpg'),
  f33:n('000017-9.jpg'),
  f34:n('000018-4.jpg'), f35:n('000018-6.jpg'), f36:n('000018-8.jpg'),
  f37:n('000019-10.jpg'), f38:n('000019-4.jpg'), f39:n('000019-6.jpg'),
  f40:n('000020-5.jpg'), f41:n('000020-7.jpg'),
  f42:n('000021.jpg'), f43:n('000022.jpg'), f44:n('000023.jpg'), f45:n('000023-6.jpg'),
  f46:n('000024-3.jpg'), f47:n('000024.jpg'),
  f48:n('000025-2.jpg'), f49:n('000025.jpg'), f50:n('000025-4.jpg'),
  f51:n('000026-2.jpg'), f52:n('000026-3.jpg'), f53:n('000026-4.jpg'), f54:n('000026-8.jpg'),
  f55:n('000027.jpg'), f56:n('000027-4.jpg'), f57:n('000027-10.jpg'),
  f58:n('000028-10.jpg'), f59:n('000029-3-2.jpg'), f60:n('000029-10.jpg'),
  f61:n('000030-10.jpg'), f62:n('000030-2.jpg'),
  f63:n('000032-3.jpg'), f64:n('000035-4.jpg'), f65:n('000035-5.jpg'),
  f66:n('000037-4.jpg'), f67:n('000037.jpg'),
  f68:n('000039-3.jpg'), f69:n('000039-5.jpg'), f70:n('000039.jpg'),
  f71:n('000041.jpg'), f72:n('000042-5.jpg'), f73:n('000042-2.jpg'),
  f74:n('000044-2.jpg'), f75:n('000045.jpg'),
  f76:n('000048-2.jpg'), f77:n('000050-6.jpg'),
  f78:n('000062.jpg'), f79:n('000062-2.jpg'),
  f80:n('000063.jpg'), f81:n('000066-5.jpg'), f82:n('000067-9.jpg'),
  f83:n('000068-2.jpg'), f84:n('000068-9.jpg'),
  f85:n('0017_17.jpg'), f86:n('0021_21-6.jpg'),
  f87:n('r1-05460-0022.jpg'),
}

// === 10 VARIATIONS — 12 unique photos each, catchy copy every slide ===

const variations = [
  // V1: Film noir meets fashion
  { slug: 'v1', slides: [
    hookSlide(P.f11),
    scatter8('02', 'Hong Kong \u00b7 Shot on film', [P.f24, P.f25, P.f26, P.f28, P.f43, P.f44, P.f46, P.f47], 'Eight strangers. One roll of film.'),
    { name: '03', html: hero(P.f14, tag('Seoul', 64, 60) + h2('First-timers<br/>shoot like pros<br/>when I direct.', 400) + sub('No experience needed. Ever.', 330)) },
    cascade4('04', 'Taipei \u00b7 35mm', [P.f48, P.f49, P.f50, P.f52], 'Four faces. Four alleyways.'),
    magazine('05', P.f31, 'Kaohsiung \u00b7 Shot on film', 'Your face.<br/>My film.<br/>Magic.', 'All directed. All on 35mm. Across 13 cities in Asia.', P.f19),
    pile6('06', 'Chongqing \u00b7 Guangzhou \u00b7 Tainan', [P.f40, P.f41, P.f42, P.f55, P.f56, P.f58], 'Some of these people had never been photographed.'),
    split2('07', P.f37, P.f38, 'La Union \u00b7 Philippines', 'Same golden hour.<br/>Different soul.'),
    fan5('08', 'Singapore \u00b7 Ulaanbaatar \u00b7 Tokyo', [P.f72, P.f71, P.f78, P.f76, P.f82], 'I shoot everywhere. Seriously.'),
    warm4('09', 'All 35mm', [P.f34, P.f35, P.f36, P.f33], 'The grain is<br/>not a flaw.'),
    { name: '10', html: hero(P.f09, h1('Now Bali.', 500) + sub('Sign up if you want photos like this.', 420)) },
    ctaSlide(P.f28),
  ]},

  // V2: Intimate + street contrast
  { slug: 'v2', slides: [
    hookSlide(P.f31),
    split2('02', P.f24, P.f28, 'Hong Kong \u00b7 Same night', 'One shoots under neon.<br/>One in shadow.'),
    scatter8('03', 'Taipei \u00b7 Night streets', [P.f48, P.f49, P.f50, P.f51, P.f52, P.f53, P.f54, P.f47], 'Nobody here was a model. Swear.'),
    booth3('04', 'Seoul \u00b7 Film', [P.f14, P.f15, P.f16], 'Three frames. One corset. Zero experience.'),
    { name: '05', html: hero(P.f33, h2('The nervous ones<br/>always look best<br/>on film.', 400) + sub('Trust the process.', 330)) },
    cascade4('06', 'Chongqing \u00b7 35mm', [P.f40, P.f41, P.f42, P.f55], 'Street signs. Flower stalls. Real life.'),
    heroAcc('07', 'Philippines \u00b7 Mongolia', [P.f03, P.f20, P.f21, P.f22, P.f23], 'Mountains at dawn. Markets at dusk.'),
    pile6('08', 'Singapore \u00b7 Tokyo \u00b7 Everywhere', [P.f72, P.f78, P.f80, P.f82, P.f83, P.f84], 'I do not run out of cities. Or film.'),
    warm4('09', 'Shot on 35mm', [P.f68, P.f69, P.f70, P.f67], 'Grain, warmth,<br/>and honesty.'),
    { name: '10', html: hero(P.f09, h1('Your move,<br/>Bali.', 500) + sub('Sign up if you want photos like this.', 420)) },
    ctaSlide(P.f11),
  ]},

  // V3: Magazine editorial feel
  { slug: 'v3', slides: [
    hookSlide(P.f44),
    magazine('02', P.f31, 'Kaohsiung \u00b7 Film', 'I see a face.<br/>I ask.<br/>I shoot.', '13 cities. 35mm film. Zero professional models. That is the whole point.', P.f19),
    scatter8('03', 'Hong Kong \u00b7 After dark', [P.f24, P.f25, P.f26, P.f43, P.f45, P.f46, P.f47, P.f44], 'Film grain and city lights. Name a better combo.'),
    magazine('04', P.f33, 'Intimate', 'The photos nobody<br/>expects to love<br/>the most.', 'Quiet light. Soft moments. These are always the keepers.', P.f37),
    fan5('05', 'Taipei \u00b7 Seoul', [P.f48, P.f50, P.f52, P.f14, P.f16], 'Fashion meets 35mm. No studio. No rules.'),
    { name: '06', html: hero(P.f40, tag('Chongqing', 64, 60) + h2('She was selling<br/>flowers. I asked<br/>for 20 minutes.', 380) + sub('Best decision she made that day.', 310)) },
    pile6('07', 'The world on film', [P.f72, P.f71, P.f78, P.f03, P.f20, P.f63], 'Singapore. Mongolia. Philippines. Same camera.'),
    stacked('08', P.f64, P.f65, 'Two looks.<br/>Same person.<br/>Same roll.'),
    warm4('09', 'All 35mm', [P.f34, P.f38, P.f39, P.f87], 'Real film.<br/>Real people.<br/>Real Bali, soon.'),
    { name: '10', html: hero(P.f09, h1('Sign up.<br/>Show up.<br/>Get shot.', 480, 88) + sub('(On film. With me. In Bali.)', 400)) },
    ctaSlide(P.f28),
  ]},

  // V4: Storytelling — each slide is a chapter
  { slug: 'v4', slides: [
    hookSlide(P.f24),
    { name: '02', html: hero(P.f44, tag('Chapter 1: Hong Kong', 64, 60) + sub('She was eating noodles. I had one frame left.', 420)) },
    cascade4('03', 'Chapter 2: The pattern', [P.f40, P.f19, P.f55, P.f48], 'Ask a stranger. Shoot a stranger. Repeat.'),
    { name: '04', html: hero(P.f14, tag('Chapter 3: Seoul', 64, 60) + h2('She said<br/>"I am not<br/>photogenic."', 400) + sub('The film disagreed.', 330)) },
    scatter8('05', 'Chapter 4: Everywhere', [P.f43, P.f46, P.f51, P.f53, P.f25, P.f26, P.f28, P.f47], 'One camera. One film stock. 13 cities.'),
    { name: '06', html: hero(P.f33, tag('Chapter 5: Quiet', 64, 60) + h2('Not every shoot<br/>needs a location.', 440) + sub('Sometimes a bed and a window are enough.', 370)) },
    pile6('07', 'Chapter 6: Proof', [P.f72, P.f71, P.f78, P.f82, P.f20, P.f63], 'Six more faces. Six more cities. Same film.'),
    booth3('08', 'Chapter 7: The strip', [P.f34, P.f38, P.f39], 'Three frames from one afternoon in La Union.'),
    warm4('09', 'Chapter 8: The film', [P.f64, P.f65, P.f68, P.f70], '35mm film.<br/>Every single time.'),
    { name: '10', html: hero(P.f09, h1('Chapter 9:<br/>Bali.', 500) + sub('This chapter needs you. Sign up below.', 420)) },
    ctaSlide(P.f11),
  ]},

  // V5: Bold type-forward
  { slug: 'v5', slides: [
    hookSlide(P.f14),
    { name: '02', html: dark(h1('13 cities.<br/>150+ faces.<br/>All film.', 600, 88) + sub('Here is the proof.', 500) + pr(P.f44, 580, 680, 400, 540, 2, 14) + pr(P.f31, 40, 720, 380, 520, -3, 14)) },
    scatter8('03', 'Hong Kong', [P.f24, P.f25, P.f26, P.f43, P.f44, P.f45, P.f46, P.f47], 'Zero of these people are professional models.'),
    { name: '04', html: dark(h1('No experience<br/>needed.', 700, 96) + sub('I direct every single frame.', 600) + pr(P.f14, 100, 800, 380, 520, -2, 14) + pr(P.f33, 520, 780, 420, 560, 2.5, 14)) },
    fan5('05', 'Taipei \u00b7 Seoul \u00b7 Kaohsiung', [P.f48, P.f50, P.f52, P.f15, P.f16], 'Fashion. Street. Night. Film handles them all.'),
    { name: '06', html: hero(P.f40, h1('Real<br/>people.', 500, 120) + sub('Chongqing. Golden hour. 35mm film.', 420)) },
    pile6('07', 'The rest of Asia', [P.f72, P.f78, P.f71, P.f20, P.f03, P.f63], 'Singapore. Mongolia. Philippines. Tokyo.'),
    { name: '08', html: dark(h1('Same camera<br/>since 2023.', 700, 88) + sub('Same film. Different continent every month.', 600) + pr(P.f68, 120, 800, 360, 500, -2, 14) + pr(P.f34, 520, 780, 400, 540, 2, 14)) },
    warm4('09', 'Shot on 35mm', [P.f64, P.f65, P.f38, P.f39], 'The grain<br/>is the point.'),
    { name: '10', html: hero(P.f09, h1('Bali is<br/>next.', 500, 120) + sub('Sign up if you want photos like this.', 420)) },
    ctaSlide(P.f28),
  ]},

  // V6: Warm paper all through
  { slug: 'v6', slides: [
    hookSlide(P.f43),
    warm4('02', 'Taipei', [P.f48, P.f49, P.f50, P.f52], 'Her first shoot.<br/>My hundredth.'),
    warm4('03', 'Hong Kong', [P.f24, P.f25, P.f43, P.f44], 'Night markets<br/>on 35mm film.'),
    { name: '04', html: hero(P.f14, h2('Seoul in<br/>one frame.', 460) + sub('Corset. Concrete. Film grain.', 390)) },
    warm4('05', 'Chongqing \u00b7 Guangzhou', [P.f40, P.f41, P.f42, P.f55], 'China on film.<br/>Pure and honest.'),
    warm4('06', 'Singapore \u00b7 Mongolia', [P.f72, P.f71, P.f78, P.f76], 'Even the most<br/>unlikely cities.'),
    { name: '07', html: hero(P.f33, h2('Intimate<br/>does not mean<br/>boring.', 400) + sub('It means real.', 330)) },
    warm4('08', 'Philippines', [P.f03, P.f20, P.f37, P.f38], 'Beach towns.<br/>Mountain towns.<br/>Film towns.'),
    warm4('09', 'All 35mm', [P.f34, P.f64, P.f68, P.f87], 'Same camera.<br/>Same warmth.<br/>Now: Bali.'),
    { name: '10', html: hero(P.f09, h1('Your face<br/>belongs here.', 480) + sub('Sign up below.', 420)) },
    ctaSlide(P.f11),
  ]},

  // V7: Film strips + booth heavy
  { slug: 'v7', slides: [
    hookSlide(P.f19),
    filmStrip('02', 'Hong Kong \u00b7 35mm', [P.f43, P.f44, P.f46], 'Three strangers. One roll.'),
    booth3('03', 'Seoul \u00b7 Film', [P.f14, P.f15, P.f16], 'She walked in nervous. Walked out a model.'),
    { name: '04', html: hero(P.f31, tag('Kaohsiung', 64, 60) + h2('The best photos<br/>happen when<br/>you stop trying.', 380) + sub('I direct. You breathe.', 310)) },
    filmStrip('05', 'Taipei \u00b7 Night', [P.f48, P.f50, P.f52], '35mm film after midnight.'),
    booth3('06', 'Chongqing', [P.f40, P.f55, P.f42], 'Street stalls. Film frames. Done.'),
    scatter8('07', 'Everywhere else', [P.f72, P.f78, P.f71, P.f03, P.f20, P.f63, P.f82, P.f83], 'Singapore to Mongolia. All on one camera.'),
    { name: '08', html: hero(P.f33, h2('Quiet light.<br/>Loud photos.', 460) + sub('35mm does not lie.', 390)) },
    filmStrip('09', 'The grain is the point', [P.f34, P.f38, P.f64], '35mm film. Always.'),
    { name: '10', html: hero(P.f09, h1('Bali.<br/>Your turn.', 500) + sub('Sign up if you want photos like this.', 420)) },
    ctaSlide(P.f28),
  ]},

  // V8: Hero-heavy — let photos breathe
  { slug: 'v8', slides: [
    hookSlide(P.f31),
    { name: '02', html: hero(P.f44, tag('Hong Kong', 64, 60) + sub('She was buying fruit. I had film loaded.', 420)) },
    { name: '03', html: hero(P.f14, tag('Seoul', 64, 60) + sub('No posing experience. Could not tell.', 420)) },
    heroAcc('04', '35mm film \u00b7 13 cities', [P.f48, P.f24, P.f40, P.f72, P.f03], 'One camera does not get boring if the faces change.'),
    { name: '05', html: hero(P.f33, tag('Intimate', 64, 60) + h2('Soft light is<br/>underrated.', 460) + sub('Film knows this.', 390)) },
    { name: '06', html: hero(P.f40, tag('Chongqing', 64, 60) + sub('20 minutes between her shift and mine.', 420)) },
    { name: '07', html: hero(P.f55, tag('Ulaanbaatar', 64, 60) + sub('She had never seen a film camera before.', 420)) },
    { name: '08', html: hero(P.f37, tag('La Union', 64, 60) + h2('Golden hour.<br/>No filter.<br/>Just film.', 400)) },
    { name: '09', html: hero(P.f78, tag('Singapore', 64, 60) + sub('Fashion week dropout. My favorite kind.', 420)) },
    { name: '10', html: hero(P.f09, h1('Bali needs<br/>your face.', 500) + sub('Sign up below. I handle everything.', 420)) },
    ctaSlide(P.f11),
  ]},

  // V9: Mix of everything
  { slug: 'v9', slides: [
    hookSlide(P.f48),
    scatter8('02', 'Hong Kong \u00b7 Taipei \u00b7 Seoul', [P.f24, P.f25, P.f43, P.f44, P.f48, P.f50, P.f14, P.f16], 'Eight faces from three countries. All 35mm.'),
    split2('03', P.f33, P.f37, 'Indoor vs outdoor', 'Both on film.<br/>Both first-timers.'),
    magazine('04', P.f31, 'Kaohsiung \u00b7 Film', 'I do not need<br/>models. I need<br/>faces.', 'The best subjects are people who do not think they are photogenic.', P.f19),
    cascade4('05', 'Chongqing \u00b7 35mm', [P.f40, P.f41, P.f55, P.f42], 'Street vendors. Flower girls. Film rolls.'),
    { name: '06', html: hero(P.f78, tag('Singapore', 64, 60) + h2('She brought<br/>three outfits.<br/>We used one.', 400) + sub('Less is always more on film.', 330)) },
    pile6('07', 'Everywhere else', [P.f72, P.f71, P.f03, P.f20, P.f82, P.f63], 'Mongolia. Philippines. Tokyo. Same film.'),
    booth3('08', 'The range', [P.f34, P.f64, P.f68], 'Nature. Night. Intimate. All film.'),
    warm4('09', 'Shot on 35mm', [P.f38, P.f39, P.f65, P.f70], 'The warmth<br/>is not a filter.'),
    { name: '10', html: hero(P.f09, h1('Bali.<br/>Let us<br/>make this.', 480, 96) + sub('Sign up if you want photos like this.', 400)) },
    ctaSlide(P.f28),
  ]},

  // V10: Proof overload
  { slug: 'v10', slides: [
    hookSlide(P.f14),
    scatter8('02', 'Hong Kong', [P.f24, P.f25, P.f26, P.f43, P.f44, P.f45, P.f46, P.f47], 'Night shift on 35mm film.'),
    scatter8('03', 'Taipei \u00b7 Seoul', [P.f48, P.f49, P.f50, P.f52, P.f53, P.f14, P.f15, P.f16], 'Fashion capitals. Film camera.'),
    scatter8('04', 'Chongqing \u00b7 Guangzhou', [P.f40, P.f41, P.f42, P.f55, P.f56, P.f58, P.f59, P.f60], 'China on one roll.'),
    { name: '05', html: hero(P.f33, h1('Still not<br/>convinced?', 500) + sub('Keep swiping.', 420)) },
    scatter8('06', 'Philippines \u00b7 Mongolia \u00b7 Singapore', [P.f03, P.f20, P.f21, P.f72, P.f71, P.f78, P.f82, P.f63], 'I have not stopped.'),
    pile6('07', 'More', [P.f34, P.f37, P.f38, P.f68, P.f70, P.f87], 'And I am not going to.'),
    fan5('08', 'Even more', [P.f64, P.f65, P.f80, P.f81, P.f84], 'All 35mm. All directed by me.'),
    warm4('09', 'All on film', [P.f35, P.f36, P.f39, P.f67], 'Every. Single. Frame.'),
    { name: '10', html: hero(P.f09, h1('OK now<br/>sign up.', 500) + sub('Bali. Film. Your face. Let us go.', 420)) },
    ctaSlide(P.f11),
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
