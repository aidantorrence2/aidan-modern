import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, 'output-bali-creative-v4')
const ND = '/Users/aidantorrence/Documents/aidan-modern/public/images/faves'
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
  '<p style="position:absolute;bottom:60px;left:64px;font-family:'+SA+';font-size:20px;font-weight:600;color:rgba(255,255,255,0.4);letter-spacing:0.1em;text-transform:uppercase;margin:0;'+SH+'">Shot on 35mm \u00b7 @madebyaidan</p>' +
  GR + '</div>'
}}
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
// Warm paper with 2-3 scattered prints
function warm3(nm, tg, p3, headline) { return { name: nm, html: warm(
  dtag(tg, 64, 50) +
  pr(p3[0], 40, 120, 460, 620, -3, 14) + pr(p3[1], 520, 80, 440, 600, 2.5, 14) +
  (p3[2] ? pr(p3[2], 240, 760, 480, 640, 1.5, 14) : '') +
  dh(headline, 80)
)}}
// Single large print on dark background with text
function darkSingle(nm, src, headline, subtitle) { return { name: nm, html: dark(
  pr(src, 140, 100, 780, 1060, -0.5, 16) +
  '<div style="position:absolute;bottom:360px;left:64px;right:64px;"><p style="font-family:'+SE+';font-size:64px;font-weight:700;font-style:italic;color:white;line-height:0.95;margin:0;'+SH+'">'+headline+'</p></div>' +
  '<div style="position:absolute;bottom:280px;left:64px;right:64px;"><p style="font-family:'+SA+';font-size:30px;font-weight:500;color:rgba(255,255,255,0.7);line-height:1.35;margin:0;'+SH+'">'+subtitle+'</p></div>'
)}}
// Two prints side by side on dark background
function darkDuo(nm, img1, img2, headline, subtitle) { return { name: nm, html: dark(
  pr(img1, 30, 100, 460, 660, -2, 14) + pr(img2, 540, 80, 460, 660, 2, 14) +
  '<div style="position:absolute;bottom:400px;left:64px;right:64px;"><p style="font-family:'+SE+';font-size:60px;font-weight:700;font-style:italic;color:white;line-height:0.95;margin:0;'+SH+'">'+headline+'</p></div>' +
  '<div style="position:absolute;bottom:310px;left:64px;right:64px;"><p style="font-family:'+SA+';font-size:28px;font-weight:500;color:rgba(255,255,255,0.7);line-height:1.35;margin:0;'+SH+'">'+subtitle+'</p></div>'
)}}

// === REUSABLE SLIDE BUILDERS ===
function hookSlide(src, hookLine, subLine) {
  hookLine = hookLine || "I'm looking for<br/>models in Bali."
  subLine = subLine || 'Want photos like this? Sign up below.'
  return { name: '01-hook', html: hero(src, tag('Shot on 35mm film', 64, 60) + h1(hookLine, 540) + sub(subLine, 420, 44)) }
}
function ctaSlide(src) { return { name: '10-cta', html: cta(src, h1('Sign up.', 520) + ctaBlock()) } }

// === LOAD FROM FAVES ===
const P = {
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
  f78:n('000062.jpg'), f79:n('000062-7.jpg'),
  f80:n('000063.jpg'), f81:n('000066-5.jpg'), f82:n('000067-9.jpg'),
  f83:n('000068-2.jpg'), f84:n('000068-9.jpg'),
  f85:n('0017_17.jpg'), f86:n('0021_21-6.jpg'),
  f87:n('r1-05460-0022.jpg'),
  // Additional faves
  f88:n('000008-11.jpg'), f89:n('000019-11.jpg'), f90:n('000025-3.jpg'),
  f91:n('000029-4.jpg'), f92:n('000030-5.jpg'), f93:n('000033-4.jpg'),
  f94:n('000036-5.jpg'), f95:n('000040-5.jpg'), f96:n('000041-6.jpg'),
  f97:n('000043-5.jpg'), f98:n('000047-4.jpg'), f99:n('000048-11.jpg'),
  f100:n('000051-12.jpg'), f101:n('000053-5.jpg'), f102:n('000056-2.jpg'),
  f103:n('000071.jpg'), f104:n('0003_3-3.jpg'), f105:n('0004_4-6.jpg'),
  f106:n('0012_12-6.jpg'), f107:n('0013_13.jpg'), f108:n('0015_15-6.jpg'),
  f109:n('0016_16-5.jpg'), f110:n('0017_17-6.jpg'),
}

// === 10 VARIATIONS — 1-3 images per slide, model-enticing copy on every slide ===

const variations = [
  // V1: "Want photos like this?"
  { slug: 'v1', slides: [
    hookSlide(P.f11),
    darkSingle('02', P.f31, 'Want photos<br/>like this?', 'TFP collaboration. Completely free.'),
    split2('03', P.f24, P.f28, 'Shot on 35mm film', 'You bring the face.<br/>I bring the film.'),
    { name: '04', html: hero(P.f14, tag('No experience needed', 64, 60) + h2('I direct<br/>everything.', 460) + sub('You just show up and be yourself.', 380)) },
    magazine('05', P.f33, 'TFP Collaboration', 'This could<br/>be you.', 'I shoot on 35mm film. You get all the photos. No cost.', P.f19),
    stacked('06', P.f48, P.f50, 'Every face tells<br/>a different story.'),
    darkDuo('07', P.f72, P.f78, 'Looking for<br/>all vibes.', 'Editorial. Street. Natural. Whatever suits you.'),
    warm3('08', 'Shot on 35mm', [P.f34, P.f38, P.f64], 'Real film.<br/>Real warmth.'),
    { name: '09', html: hero(P.f40, tag('Bali', 64, 60) + h2('Limited spots<br/>available.', 460) + sub('I only shoot a few people per trip.', 380)) },
    ctaSlide(P.f09),
  ]},

  // V2: "Be my next muse"
  { slug: 'v2', slides: [
    hookSlide(P.f44, "Be my next<br/>muse in Bali.", 'I shoot on film. You get every photo.'),
    split2('02', P.f43, P.f46, 'All shot on Portra 400', 'No filters.<br/>Just film grain.'),
    darkSingle('03', P.f14, 'No modeling<br/>experience?', 'Perfect. I direct every single pose.'),
    stacked('04', P.f33, P.f37, 'Intimate or outdoor.<br/>Your call.'),
    magazine('05', P.f31, 'What you get', 'Free edited<br/>photos from<br/>a real shoot.', 'TFP means we both walk away with portfolio pieces. Win-win.', P.f55),
    { name: '06', html: hero(P.f48, tag('35mm Film', 64, 60) + h2('The look that<br/>only film gives.', 440) + sub('Grain. Warmth. Timeless.', 370)) },
    darkDuo('07', P.f82, P.f03, 'All body types.<br/>All styles.', 'I want to photograph real people.'),
    warm3('08', 'Portfolio work', [P.f68, P.f65, P.f70], 'Grow your<br/>portfolio.'),
    { name: '09', html: hero(P.f87, tag('Bali', 64, 60) + h2('Spots are<br/>filling up.', 460) + sub('Click the link below to reserve yours.', 380)) },
    ctaSlide(P.f11),
  ]},

  // V3: "TFP in Bali"
  { slug: 'v3', slides: [
    hookSlide(P.f24, "Free photo shoot<br/>in Bali.", 'I need models. You need photos.'),
    darkDuo('02', P.f25, P.f26, 'TFP collaboration.', 'That means free for both of us.'),
    { name: '03', html: hero(P.f31, tag('What is TFP?', 64, 60) + h2('Time for prints.<br/>I shoot. You pose.<br/>We both win.', 380) + sub('You get all edited photos for free.', 300)) },
    split2('04', P.f14, P.f33, 'Shot on 35mm film', 'Film portraits<br/>hit different.'),
    magazine('05', P.f48, 'How it works', 'Sign up.<br/>Show up.<br/>Get shot.', 'I direct everything. You just bring yourself and an outfit or two.', P.f52),
    darkSingle('06', P.f40, 'No experience<br/>needed.', 'First-timers always surprise themselves.'),
    stacked('07', P.f72, P.f78, 'Your next<br/>profile photo?'),
    warm3('08', 'All 35mm film', [P.f34, P.f64, P.f87], 'Film is<br/>forever.'),
    { name: '09', html: hero(P.f55, tag('Bali', 64, 60) + h2('Only a few<br/>spots left.', 460) + sub('Click the link below to sign up.', 380)) },
    ctaSlide(P.f28),
  ]},

  // V4: "Upgrade your portfolio"
  { slug: 'v4', slides: [
    hookSlide(P.f31, "Upgrade your<br/>portfolio.", 'Free 35mm film shoot in Bali.'),
    { name: '02', html: hero(P.f44, tag('Shot on film', 64, 60) + h2('This is what<br/>35mm looks like.', 440) + sub('No filters. No presets. Just film.', 370)) },
    darkDuo('03', P.f24, P.f43, 'Looking for<br/>fresh faces.', 'Models, creators, anyone who wants great photos.'),
    stacked('04', P.f14, P.f16, 'I direct every<br/>single frame.'),
    magazine('05', P.f33, 'The deal', 'You show up.<br/>I do the rest.', 'Posing, lighting, direction, editing. All handled. All free.', P.f37),
    split2('06', P.f48, P.f52, 'Portra 400', 'The film that<br/>makes everyone glow.'),
    darkSingle('07', P.f72, 'Want to<br/>be next?', 'Sign up and lock in your spot.'),
    warm3('08', 'Real film', [P.f68, P.f38, P.f65], 'Grain you<br/>can feel.'),
    { name: '09', html: hero(P.f09, tag('Bali', 64, 60) + h2('Limited spots.<br/>Sign up now.', 460) + sub('Click the link below.', 380)) },
    ctaSlide(P.f11),
  ]},

  // V5: "I direct everything"
  { slug: 'v5', slides: [
    hookSlide(P.f14, "You don't need<br/>to know how<br/>to pose.", 'I direct everything. Sign up below.'),
    darkSingle('02', P.f44, 'Zero experience<br/>required.', 'Seriously. I handle all the directing.'),
    split2('03', P.f31, P.f19, 'All on 35mm film', 'Same camera.<br/>Same magic.'),
    { name: '04', html: hero(P.f33, tag('TFP', 64, 60) + h2('Free photos.<br/>Free session.<br/>Real film.', 380) + sub('All you need is a face and a vibe.', 300)) },
    magazine('05', P.f48, 'What you get', 'Edited 35mm<br/>film portraits.', 'Professional direction. Beautiful locations in Bali. Every photo yours to keep.', P.f50),
    stacked('06', P.f40, P.f42, 'The camera<br/>loves everyone.'),
    darkDuo('07', P.f34, P.f64, 'Nature.<br/>Night.<br/>Golden hour.', 'We pick the best setting for your look.'),
    warm3('08', 'Shot on Portra 400', [P.f72, P.f78, P.f82], 'Film warmth<br/>is unmatched.'),
    { name: '09', html: hero(P.f87, tag('Bali', 64, 60) + h2('Spots going<br/>fast.', 480) + sub('Click the link below to sign up.', 400)) },
    ctaSlide(P.f28),
  ]},

  // V6: "Film portraits in Bali"
  { slug: 'v6', slides: [
    hookSlide(P.f48, "Film portraits<br/>in Bali.", 'Looking for models to collaborate with.'),
    { name: '02', html: hero(P.f24, tag('35mm', 64, 60) + h2('Shot on real film.<br/>Not a filter.', 440) + sub('Portra 400. Every frame.', 370)) },
    darkDuo('03', P.f43, P.f46, 'You could be<br/>in this collection.', 'All it takes is signing up.'),
    split2('04', P.f14, P.f31, 'No experience needed', 'I guide you<br/>through everything.'),
    magazine('05', P.f33, 'The vibe', 'Relaxed.<br/>Creative.<br/>Fun.', 'This is not a stiff studio shoot. We explore Bali and shoot what feels right.', P.f37),
    stacked('06', P.f55, P.f58, 'Every shoot is<br/>an adventure.'),
    darkSingle('07', P.f72, 'Add 35mm film<br/>to your book.', 'Stand out with something different.'),
    warm3('08', 'Portfolio pieces', [P.f38, P.f64, P.f68], 'Timeless<br/>portraits.'),
    { name: '09', html: hero(P.f09, tag('Bali', 64, 60) + h2('Ready?', 520, 96) + sub('Click the link below to sign up.', 420)) },
    ctaSlide(P.f11),
  ]},

  // V7: "Collab with me"
  { slug: 'v7', slides: [
    hookSlide(P.f33, "Let's collab<br/>in Bali.", 'Free 35mm film shoot. All photos yours.'),
    split2('02', P.f24, P.f44, 'Previous collaborations', 'These started<br/>as strangers.'),
    darkSingle('03', P.f14, 'One session.<br/>Dozens of frames.', 'All shot on 35mm film and hand-edited.'),
    { name: '04', html: hero(P.f31, tag('TFP Shoot', 64, 60) + h2('No cost.<br/>No catch.<br/>Just art.', 380) + sub('I build my portfolio. You build yours.', 300)) },
    magazine('05', P.f48, 'How it works', '1. Sign up.<br/>2. We plan.<br/>3. We shoot.', 'I bring the camera and the vision. You bring the energy.', P.f50),
    stacked('06', P.f40, P.f55, 'Golden hour or<br/>blue hour. You pick.'),
    darkDuo('07', P.f82, P.f78, 'Any look.<br/>Any style.', 'Casual. Edgy. Elegant. I shoot it all.'),
    warm3('08', 'All on film', [P.f34, P.f65, P.f87], 'The grain<br/>is the magic.'),
    { name: '09', html: hero(P.f09, tag('Bali', 64, 60) + h2('Sign up<br/>before spots<br/>fill up.', 400) + sub('Click the link below.', 320)) },
    ctaSlide(P.f28),
  ]},

  // V8: "Get shot on film"
  { slug: 'v8', slides: [
    hookSlide(P.f19, "Get shot<br/>on film.", 'Free 35mm portrait session in Bali.'),
    darkDuo('02', P.f24, P.f28, 'This is what<br/>film looks like.', 'No Instagram filters can replicate this.'),
    { name: '03', html: hero(P.f14, tag('I direct everything', 64, 60) + h2('You just<br/>show up.', 460) + sub('No posing skills needed. I handle it all.', 380)) },
    split2('04', P.f33, P.f37, 'TFP collaboration', 'Two vibes.<br/>Same film.'),
    magazine('05', P.f44, 'What you walk away with', 'Professionally<br/>directed film<br/>portraits.', 'Edited, high-res scans from 35mm Portra 400. Yours to use however you want.', P.f43),
    darkSingle('06', P.f48, 'Your portfolio<br/>deserves film.', 'Stand out from the digital crowd.'),
    stacked('07', P.f72, P.f82, 'Every face<br/>looks good on Portra.'),
    warm3('08', 'Bali locations', [P.f64, P.f68, P.f70], 'Beautiful<br/>backdrops.'),
    { name: '09', html: hero(P.f87, tag('Bali', 64, 60) + h2('Be next.', 520, 96) + sub('Click the link below to sign up.', 420)) },
    ctaSlide(P.f09),
  ]},

  // V9: "Your face on film"
  { slug: 'v9', slides: [
    hookSlide(P.f43, "Your face<br/>on film.", 'Bali. Portra 400. Free session.'),
    { name: '02', html: hero(P.f31, tag('35mm film', 64, 60) + h2('The texture<br/>digital cannot<br/>touch.', 380) + sub('Grain. Warmth. Soul.', 310)) },
    darkDuo('03', P.f14, P.f16, 'I bring the<br/>camera.', 'You bring the face. That is the whole deal.'),
    split2('04', P.f48, P.f52, 'All types welcome', 'Every face has<br/>a story.'),
    magazine('05', P.f33, 'The process', 'We meet.<br/>We explore.<br/>I shoot.', 'Relaxed, directed, and completely free. TFP collaboration.', P.f19),
    stacked('06', P.f40, P.f55, 'Bali has the<br/>best light.'),
    darkSingle('07', P.f72, 'Want to get<br/>published?', 'Film work stands out to agencies and magazines.'),
    warm3('08', 'Previous work', [P.f34, P.f38, P.f87], 'Your photos<br/>could look<br/>like this.'),
    { name: '09', html: hero(P.f09, tag('Bali', 64, 60) + h2('Spots are<br/>almost gone.', 460) + sub('Click the link below to sign up.', 380)) },
    ctaSlide(P.f11),
  ]},

  // V10: "Show up. Get shot. Keep everything."
  { slug: 'v10', slides: [
    hookSlide(P.f24, "Show up.<br/>Get shot.<br/>Keep everything.", 'Free 35mm film session in Bali.'),
    darkSingle('02', P.f44, 'I shoot<br/>on film.', 'Portra 400. The gold standard.'),
    split2('03', P.f14, P.f33, 'No experience needed', 'First-timers<br/>are my favorite.'),
    { name: '04', html: hero(P.f31, tag('What you get', 64, 60) + h2('All the photos.<br/>All edited.<br/>All free.', 380) + sub('TFP collaboration. We both win.', 300)) },
    magazine('05', P.f48, 'The shoot', 'Relaxed vibes.<br/>Beautiful<br/>locations.', 'I pick the spots. I direct the poses. You just enjoy the experience.', P.f50),
    stacked('06', P.f72, P.f78, 'Film makes<br/>everyone look good.'),
    darkDuo('07', P.f40, P.f55, 'Looking for<br/>all types.', 'Bring whatever energy you have.'),
    warm3('08', 'Shot on 35mm', [P.f64, P.f68, P.f82], 'Real film.<br/>Real results.'),
    { name: '09', html: hero(P.f87, tag('Bali', 64, 60) + h2('This is your sign.', 480, 80) + sub('Click the link below to sign up.', 400)) },
    ctaSlide(P.f28),
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
    await page.waitForTimeout(500)
    await page.screenshot({ path: path.join(OUT, s.dir, s.name + '.png'), type: 'png' })
    await page.close()
    if ((i+1) % 10 === 0 || i === 0) console.log('  [' + (i+1) + '/' + all.length + '] ' + s.name)
  }
  await browser.close()
  console.log('\nDone — ' + all.length + ' slides -> ' + OUT)
}
render()
