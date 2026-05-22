import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE_OUT = path.join(__dirname, 'output-bali-proof-v5')
const NEW_DIR = '/Users/aidantorrence/Documents/aidan-modern/public/images/new'

fs.mkdirSync(BASE_OUT, { recursive: true })

function n(f) {
  const buf = fs.readFileSync(path.join(NEW_DIR, f))
  return 'data:image/jpeg;base64,' + buf.toString('base64')
}

const SERIF = "Georgia, 'Times New Roman', serif"
const SANS = "Inter, -apple-system, system-ui, sans-serif"
const S = 'text-shadow: 0 3px 6px rgba(0,0,0,1), 0 10px 40px rgba(0,0,0,0.8), 0 0 100px rgba(0,0,0,0.5);'

function grain(o) {
  o = o || 0.08
  return '<div style="position:absolute;inset:0;pointer-events:none;opacity:'+o+';mix-blend-mode:soft-light;background-image:radial-gradient(circle at 14% 18%, rgba(255,255,255,0.5), transparent 17%),radial-gradient(circle at 84% 12%, rgba(255,255,255,0.28), transparent 15%),repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0 1px, transparent 1px 4px);"></div>'
}

function hero(src, inner) {
  return '<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;"><img src="'+src+'" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center top;filter:saturate(1.1) contrast(1.05);"/><div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(0,0,0,0.1) 0%, transparent 15%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.96) 100%);"></div>'+inner+grain(0.1)+'</div>'
}

function dark(inner) {
  return '<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#080a0e;"><div style="position:absolute;inset:0;background:linear-gradient(170deg, #0c1420 0%, #080c14 50%, #060a10 100%);"></div><div style="position:absolute;inset:0;background:radial-gradient(circle at 20% 20%, rgba(80,140,220,0.12), transparent 30%), radial-gradient(circle at 80% 80%, rgba(220,170,100,0.08), transparent 25%);"></div>'+inner+grain(0.08)+'</div>'
}

function cta(src, inner) {
  return '<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;"><img src="'+src+'" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center top;filter:saturate(1.1) brightness(0.5);"/><div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.15) 30%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.95) 100%);"></div>'+inner+grain(0.1)+'</div>'
}

function pr(src, l, t, w, h, rot, b) {
  b = b || 12
  return '<div style="position:absolute;left:'+l+'px;top:'+t+'px;width:'+(w+b*2)+'px;height:'+(h+b*2)+'px;background:white;padding:'+b+'px;transform:rotate('+rot+'deg);box-shadow:0 8px 40px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.2);"><img src="'+src+'" style="width:'+w+'px;height:'+h+'px;object-fit:cover;object-position:center top;display:block;"/></div>'
}

function fl(src, l, t, w, h, rot) {
  return '<img src="'+src+'" style="position:absolute;left:'+l+'px;top:'+t+'px;width:'+w+'px;height:'+h+'px;object-fit:cover;object-position:center top;display:block;transform:rotate('+rot+'deg);filter:drop-shadow(0 16px 40px rgba(0,0,0,0.5));"/>'
}

function h1(text, bot, sz) { sz=sz||108; return '<div style="position:absolute;bottom:'+bot+'px;left:64px;right:64px;"><p style="font-family:'+SERIF+';font-size:'+sz+'px;font-weight:700;font-style:italic;color:white;line-height:0.92;margin:0;'+S+'">'+text+'</p></div>' }
function h2(text, bot, sz) { sz=sz||64; return '<div style="position:absolute;bottom:'+bot+'px;left:64px;right:64px;"><p style="font-family:'+SERIF+';font-size:'+sz+'px;font-weight:700;font-style:italic;color:white;line-height:1.0;margin:0;'+S+'">'+text+'</p></div>' }
function sub(text, bot, sz) { sz=sz||34; return '<div style="position:absolute;bottom:'+bot+'px;left:64px;right:64px;"><p style="font-family:'+SANS+';font-size:'+sz+'px;font-weight:500;color:rgba(255,255,255,0.85);line-height:1.4;margin:0;'+S+'">'+text+'</p></div>' }
function tag(text, l, t) { return '<p style="position:absolute;left:'+l+'px;top:'+t+'px;font-family:'+SANS+';font-size:24px;font-weight:700;color:rgba(255,255,255,0.7);letter-spacing:0.12em;text-transform:uppercase;margin:0;'+S+'">'+text+'</p>' }
function locTag(city, l, t) { return '<p style="position:absolute;left:'+l+'px;top:'+t+'px;font-family:'+SANS+';font-size:20px;font-weight:600;color:rgba(255,255,255,0.5);letter-spacing:0.08em;margin:0;'+S+'">'+city+'</p>' }

// Load tons of photos
const p = {
  // Group by rough location for storytelling
  // Taiwan
  tw1: n('000005-3.jpg'), tw2: n('000005-4.jpg'), tw3: n('000005-5.jpg'),
  tw4: n('000006-4.jpg'), tw5: n('000006-12.jpg'), tw6: n('000007-3.jpg'),
  tw7: n('000007-4.jpg'), tw8: n('000007-7.jpg'),
  // HK / city night
  hk1: n('000013-3.jpg'), hk2: n('000014-3.jpg'), hk3: n('000015-3.jpg'),
  hk4: n('000013-7.jpg'), hk5: n('000014-5.jpg'),
  // Seoul / Korea
  kr1: n('000008-3.jpg'), kr2: n('000008-4.jpg'), kr3: n('000008-7.jpg'), kr4: n('000008-8.jpg'),
  // Street / market
  st1: n('000009.jpg'), st2: n('000009-7.jpg'), st3: n('000009-11.jpg'), st4: n('000009-12.jpg'),
  st5: n('000012.jpg'), st6: n('000016.jpg'), st7: n('000016-3.jpg'), st8: n('000016-7.jpg'),
  // Intimate / indoor
  in1: n('000017-4.jpg'), in2: n('000017-7.jpg'), in3: n('000017-9.jpg'),
  in4: n('000011-4.jpg'), in5: n('000011-6.jpg'),
  // Outdoor / nature
  ou1: n('000010-11.jpg'), ou2: n('000010-3.jpg'), ou3: n('000010-6.jpg'),
  ou4: n('000002-4.jpg'), ou5: n('000002-11.jpg'),
  // Bali area / casual
  ba1: n('000001.jpg'), ba2: n('000001-3.jpg'), ba3: n('000001-4.jpg'),
  ba4: n('000001-5.jpg'), ba5: n('000001-8.jpg'),
  ba6: n('000003.jpg'), ba7: n('000003-4.jpg'), ba8: n('000003-5.jpg'), ba9: n('000003-8.jpg'),
  ba10: n('000004.jpg'), ba11: n('000004-5.jpg'), ba12: n('000004-8.jpg'), ba13: n('000004-12.jpg'),
  // More subjects
  m1: n('000041.jpg'), m2: n('000041-3.jpg'), m3: n('000041-6.jpg'),
  m4: n('000042-2.jpg'), m5: n('000042-5.jpg'), m6: n('000042-6.jpg'), m7: n('000042-11.jpg'),
  m8: n('000043-4.jpg'), m9: n('000043-11.jpg'),
  m10: n('000044-2.jpg'), m11: n('000044-4.jpg'),
  m12: n('000045.jpg'), m13: n('000045-4.jpg'),
  m14: n('000046-4.jpg'), m15: n('000046-5.jpg'),
  m16: n('000047-4.jpg'), m17: n('000047-12.jpg'),
  m18: n('000048-2.jpg'), m19: n('000048-11.jpg'),
  m20: n('000049-4.jpg'), m21: n('000050-6.jpg'),
  m22: n('000062.jpg'), m23: n('000062-2.jpg'), m24: n('000062-7.jpg'),
  m25: n('000063.jpg'), m26: n('000065.jpg'), m27: n('000065-10.jpg'),
  m28: n('000066-2.jpg'), m29: n('000066-5.jpg'),
  m30: n('000067-9.jpg'), m31: n('000068-2.jpg'), m32: n('000068-9.jpg'),
  m33: n('000015-2.jpg'), m34: n('000015-4.jpg'), m35: n('000015-8.jpg'),
}

const ctaBlock = '<div style="position:absolute;bottom:380px;left:64px;right:64px;"><p style="font-family:'+SANS+';font-size:38px;font-weight:600;color:white;margin:0;'+S+'">Click the link below to sign up.</p><p style="font-family:'+SANS+';font-size:32px;color:rgba(255,255,255,0.7);margin:20px 0 0;'+S+'">I handle everything. No experience needed.</p></div>'

const V = []

// ── V1: "13 countries. Now Bali." — globe-trotter proof ──
V.push({ slug: 'v1-13-countries', slides: [
  { name: '01-hook', html: hero(p.tw1, tag('Shot on film', 64, 60) + h1('13 cities.<br/>Now Bali.', 480) + sub('I\u2019m looking for models in Bali.<br/>Sign up if you want photos like this.', 380)) },
  { name: '02-taipei', html: dark(tag('Taipei', 64, 50) + pr(p.tw1, 60, 120, 440, 580, -3) + pr(p.tw4, 460, 100, 520, 660, 2.5) + pr(p.tw2, 140, 740, 520, 660, 2) + pr(p.tw5, 480, 780, 480, 600, -2.5) + sub('Shot on 35mm film.', 100)) },
  { name: '03-hk', html: dark(tag('Hong Kong', 64, 50) + pr(p.hk1, 40, 100, 480, 620, -2.5) + pr(p.hk2, 440, 80, 540, 680, 3) + pr(p.hk3, 120, 740, 560, 700, 1.8) + pr(p.hk4, 500, 780, 480, 600, -3) + sub('Night shoots. City lights. Film grain.', 100)) },
  { name: '04-seoul', html: hero(p.kr1, tag('Seoul', 64, 60) + h2('Different city.<br/>Same quality.', 420)) },
  { name: '05-streets', html: dark(tag('Kaohsiung \u00b7 Tainan \u00b7 Chongqing', 64, 50) + pr(p.st1, 60, 100, 440, 580, 3) + pr(p.st5, 440, 80, 540, 680, -2) + pr(p.st6, 80, 720, 520, 660, -2.5) + pr(p.ba6, 480, 740, 480, 600, 3) + sub('Markets. Alleys. Real places.', 100)) },
  { name: '06-outdoor', html: hero(p.ou1, tag('La Union', 64, 60) + h2('Beach. Jungle.<br/>Golden hour.', 420) + sub('Wherever the light is good.', 350)) },
  { name: '07-intimate', html: dark(tag('Shot on film', 64, 50) + pr(p.in1, 80, 100, 560, 720, -1.5, 16) + pr(p.in4, 440, 620, 520, 660, 2.5) + sub('Intimate. Editorial. Personal.', 100)) },
  { name: '08-more', html: dark(tag('Singapore \u00b7 Ulaanbaatar \u00b7 Tokyo', 64, 50) + pr(p.m5, 40, 100, 480, 620, -3) + pr(p.m22, 460, 80, 540, 680, 2) + pr(p.m8, 80, 740, 520, 660, 2.5) + pr(p.m12, 480, 760, 480, 600, -2) + sub('Every face tells a different story.', 100)) },
  { name: '09-you', html: hero(p.ba10, h1('Now it\u2019s<br/>Bali\u2019s turn.', 480) + sub('Sign up if you want photos like this.', 400)) },
  { name: '10-cta', html: cta(p.m30, h1('Sign up.', 520) + ctaBlock) },
]})

// ── V2: "From Tokyo to Bali." — journey narrative ──
V.push({ slug: 'v2-tokyo-to-bali', slides: [
  { name: '01-hook', html: hero(p.kr1, tag('Film photography', 64, 60) + h1('From Tokyo<br/>to Bali.', 480) + sub('I\u2019m looking for models. Sign up if you want photos like this.', 380)) },
  { name: '02', html: hero(p.st1, tag('Kaohsiung', 64, 60) + h2('Started in markets<br/>and alleyways.', 420)) },
  { name: '03', html: dark(tag('Hong Kong \u00b7 35mm', 64, 50) + pr(p.hk1, 60, 100, 560, 720, -2, 16) + pr(p.hk3, 420, 620, 540, 680, 2.5) + sub('Then the cities at night.', 100)) },
  { name: '04', html: dark(tag('Taipei \u00b7 Seoul', 64, 50) + pr(p.tw1, 40, 80, 480, 620, 3) + pr(p.kr2, 460, 60, 520, 660, -2.5) + pr(p.tw3, 80, 740, 520, 660, -2) + pr(p.kr4, 460, 760, 480, 600, 3) + sub('Fashion meets street.', 100)) },
  { name: '05', html: hero(p.in1, tag('Intimate', 64, 60) + h2('The quiet ones<br/>are my favorite.', 420)) },
  { name: '06', html: dark(tag('Guangzhou \u00b7 Chongqing \u00b7 Mui Wo', 64, 50) + pr(p.m1, 60, 100, 440, 580, -3.5) + pr(p.m5, 440, 80, 540, 680, 2) + pr(p.m22, 80, 720, 520, 660, 2.5) + pr(p.m25, 480, 740, 480, 600, -2) + sub('Everywhere I go, I find people worth shooting.', 100)) },
  { name: '07', html: hero(p.ou1, tag('Baguio', 64, 60) + h2('Mountains.<br/>Film grain.<br/>Magic.', 380)) },
  { name: '08', html: dark(pr(p.ba5, 60, 80, 440, 580, 3) + pr(p.ba8, 440, 60, 540, 680, -2) + pr(p.st6, 80, 700, 520, 660, -2.5) + pr(p.m8, 480, 720, 480, 600, 3) + tag('All shot on film', 64, 50) + sub('And now I\u2019m in Bali.', 100)) },
  { name: '09', html: hero(p.m29, h1('Your turn.', 480) + sub('I\u2019m looking for models in Bali.<br/>Sign up if you want photos like this.', 380)) },
  { name: '10-cta', html: cta(p.tw6, h1('Sign up.', 520) + ctaBlock) },
]})

// ── V3: "Shot across Asia." — volume/range proof ──
V.push({ slug: 'v3-across-asia', slides: [
  { name: '01-hook', html: hero(p.m5, tag('Bali \u00b7 Model collab', 64, 60) + h1('Shot across<br/>Asia.', 480) + sub('Looking for models in Bali. Sign up if you want photos like this.', 380)) },
  { name: '02', html: dark(tag('Taiwan \u00b7 Film', 64, 50) + pr(p.tw1, 40, 80, 480, 620, -3) + pr(p.tw4, 460, 60, 520, 660, 2) + pr(p.tw7, 80, 740, 520, 660, 2.5) + pr(p.tw8, 480, 760, 480, 600, -2.5)) },
  { name: '03', html: dark(tag('Korea', 64, 50) + pr(p.kr1, 80, 100, 560, 720, -1.5, 16) + pr(p.kr3, 440, 620, 520, 660, 2.5) + sub('Same photographer. Different continent.', 100)) },
  { name: '04', html: dark(tag('Hong Kong \u00b7 Night', 64, 50) + pr(p.hk1, 60, 80, 440, 580, 3) + pr(p.hk2, 440, 60, 540, 680, -2) + pr(p.hk3, 80, 700, 520, 660, -2.5) + pr(p.hk5, 480, 720, 480, 600, 3)) },
  { name: '05', html: hero(p.st5, tag('Singapore', 64, 60) + h2('Every city<br/>has a look.', 420)) },
  { name: '06', html: dark(tag('Philippines \u00b7 Mongolia', 64, 50) + pr(p.ba1, 40, 80, 480, 620, -3.5) + pr(p.ou1, 460, 60, 520, 660, 2) + pr(p.m1, 80, 740, 520, 660, 2) + pr(p.ba10, 480, 760, 480, 600, -2)) },
  { name: '07', html: dark(tag('Chongqing \u00b7 Guangzhou', 64, 50) + pr(p.m10, 60, 80, 440, 580, 3) + pr(p.m15, 440, 60, 540, 680, -2) + pr(p.m18, 80, 700, 520, 660, -2.5) + pr(p.m20, 480, 720, 480, 600, 3) + sub('Markets. Rooftops. Back alleys.', 100)) },
  { name: '08', html: hero(p.in1, h2('Every shoot is<br/>different. Every<br/>one is real.', 400) + sub('All shot on 35mm film.', 330)) },
  { name: '09', html: hero(p.ba11, h1('Next stop:<br/>Bali.', 480) + sub('I\u2019m looking for models. Sign up below.', 400)) },
  { name: '10-cta', html: cta(p.st6, h1('Sign up.', 520) + ctaBlock) },
]})

// ── V4: "Same film. Different faces." — consistency angle ──
V.push({ slug: 'v4-same-film', slides: [
  { name: '01-hook', html: hero(p.hk1, tag('35mm film', 64, 60) + h1('Same film.<br/>Different<br/>faces.', 420) + sub('Looking for models in Bali. Sign up below.', 340)) },
  { name: '02', html: dark(pr(p.tw1, 60, 80, 480, 620, -2.5, 14) + pr(p.hk1, 480, 60, 500, 640, 2, 14) + pr(p.kr1, 120, 740, 520, 660, 2, 14) + pr(p.st1, 480, 760, 480, 600, -2.5, 14) + tag('Taipei \u00b7 HK \u00b7 Seoul \u00b7 Kaohsiung', 64, 50)) },
  { name: '03', html: hero(p.m5, h2('The film doesn\u2019t<br/>change. The face<br/>does.', 400)) },
  { name: '04', html: dark(pr(p.ba6, 40, 80, 480, 620, 3, 14) + pr(p.m8, 460, 60, 520, 660, -2, 14) + pr(p.m22, 80, 740, 520, 660, -2.5, 14) + pr(p.ou1, 480, 760, 480, 600, 3, 14) + tag('Baguio \u00b7 Singapore \u00b7 La Union', 64, 50)) },
  { name: '05', html: hero(p.in1, tag('Intimate', 64, 60) + h2('Quiet moments<br/>on 35mm.', 420)) },
  { name: '06', html: dark(pr(p.hk3, 60, 80, 560, 720, -1.5, 16) + pr(p.m30, 420, 600, 540, 680, 2.5, 14) + tag('All shot on film', 64, 50) + sub('Every roll tells a story.', 100)) },
  { name: '07', html: dark(pr(p.m1, 40, 80, 440, 580, 3) + pr(p.ba5, 440, 60, 540, 680, -2) + pr(p.m14, 80, 700, 520, 660, -2.5) + pr(p.m28, 480, 720, 480, 600, 3) + tag('Ulaanbaatar \u00b7 Tokyo \u00b7 Tainan', 64, 50)) },
  { name: '08', html: hero(p.ba10, h1('Now I\u2019m<br/>in Bali.', 480) + sub('And I need new faces.', 400)) },
  { name: '09', html: dark(fl(p.m5, 60, 60, 960, 760, 0) + h2('This could<br/>be you.', 240) + sub('Sign up if you want photos like this.', 170)) },
  { name: '10-cta', html: cta(p.kr1, h1('Sign up.', 520) + ctaBlock) },
]})

// ── V5: "Every city. One camera." — minimalist ──
V.push({ slug: 'v5-one-camera', slides: [
  { name: '01-hook', html: hero(p.st6, h1('Every city.<br/>One camera.', 480) + sub('I\u2019m looking for models in Bali.<br/>Sign up if you want photos like this.', 380)) },
  { name: '02', html: hero(p.tw1, tag('Taipei', 64, 60)) },
  { name: '03', html: hero(p.hk1, tag('Hong Kong', 64, 60)) },
  { name: '04', html: hero(p.kr1, tag('Seoul', 64, 60)) },
  { name: '05', html: hero(p.st1, tag('Kaohsiung', 64, 60)) },
  { name: '06', html: hero(p.m1, tag('Ulaanbaatar', 64, 60)) },
  { name: '07', html: hero(p.ou1, tag('La Union', 64, 60)) },
  { name: '08', html: hero(p.m5, tag('Singapore', 64, 60)) },
  { name: '09', html: hero(p.ba10, tag('Bali \u2014 your turn', 64, 60) + h1('Now you.', 480) + sub('Shot on 35mm film. I direct everything.', 400)) },
  { name: '10-cta', html: cta(p.in1, h1('Sign up.', 520) + ctaBlock) },
]})

// ── V6: "Faces I've found." — people-first, warm ──
V.push({ slug: 'v6-faces-found', slides: [
  { name: '01-hook', html: hero(p.st6, tag('Bali \u00b7 Open call', 64, 60) + h1('Faces I\u2019ve<br/>found.', 480) + sub('Looking for models in Bali. Sign up below.', 400)) },
  { name: '02', html: dark(tag('She was a barista in Taipei', 64, 50) + pr(p.tw1, 80, 120, 880, 700, -0.5, 18) + sub('First shoot ever. Couldn\u2019t tell.', 200)) },
  { name: '03', html: dark(tag('Met her at a night market in HK', 64, 50) + pr(p.hk1, 80, 120, 560, 720, -1.5, 16) + pr(p.hk3, 440, 640, 520, 660, 2.5)) },
  { name: '04', html: hero(p.kr1, tag('Seoul', 64, 60) + h2('She said she\u2019d<br/>never modeled.<br/>Look at her.', 380)) },
  { name: '05', html: dark(tag('A designer in Kaohsiung', 64, 50) + pr(p.st1, 80, 120, 880, 700, 0.5, 18) + sub('She brought her own collection.', 200)) },
  { name: '06', html: dark(tag('Strangers who became subjects', 64, 50) + pr(p.m5, 40, 120, 480, 620, -3) + pr(p.m8, 460, 100, 520, 660, 2) + pr(p.ba6, 80, 780, 520, 660, 2.5) + pr(p.ba10, 480, 800, 480, 600, -2)) },
  { name: '07', html: hero(p.ou1, tag('Philippines', 64, 60) + h2('Mountains at<br/>golden hour.', 420) + sub('All on 35mm film.', 350)) },
  { name: '08', html: dark(pr(p.in1, 80, 100, 560, 720, -1, 16) + pr(p.m22, 440, 620, 520, 660, 2.5) + tag('The intimate ones', 64, 50) + sub('Are always the best.', 100)) },
  { name: '09', html: hero(p.m29, h1('Who\u2019s next<br/>in Bali?', 480) + sub('Maybe you. Sign up below.', 400)) },
  { name: '10-cta', html: cta(p.tw6, h1('Sign up.', 520) + ctaBlock) },
]})

// ── V7: "Not stock photos." — anti-generic ──
V.push({ slug: 'v7-not-stock', slides: [
  { name: '01-hook', html: hero(p.hk1, tag('35mm film \u00b7 Bali', 64, 60) + h1('Not stock<br/>photos.', 480) + sub('I\u2019m looking for models in Bali. Sign up if you want photos like this.', 380)) },
  { name: '02', html: dark(tag('Real people', 64, 50) + pr(p.st6, 60, 100, 440, 580, -3) + pr(p.st1, 440, 80, 540, 680, 2) + pr(p.tw1, 80, 720, 520, 660, 2.5) + pr(p.kr1, 480, 740, 480, 600, -2.5) + sub('Real locations. Real film.', 100)) },
  { name: '03', html: hero(p.in1, h2('Not posed.<br/>Directed.', 420) + sub('There\u2019s a difference.', 350)) },
  { name: '04', html: dark(tag('Taipei \u00b7 HK \u00b7 Seoul \u00b7 Kaohsiung', 64, 50) + pr(p.hk3, 40, 100, 480, 620, 3) + pr(p.m5, 460, 80, 520, 660, -2) + pr(p.m22, 80, 760, 520, 660, -2.5) + pr(p.ba6, 480, 780, 480, 600, 3)) },
  { name: '05', html: hero(p.ou1, h2('No studio.<br/>No backdrop.<br/>Just us.', 380)) },
  { name: '06', html: dark(pr(p.m1, 60, 80, 560, 720, -1.5, 16) + pr(p.m8, 420, 600, 540, 680, 2.5) + tag('Ulaanbaatar \u00b7 Tokyo \u00b7 Singapore', 64, 50) + sub('Film. Everywhere.', 100)) },
  { name: '07', html: dark(pr(p.ba5, 40, 80, 480, 620, 3) + pr(p.hk2, 460, 60, 520, 660, -2) + pr(p.m30, 80, 740, 520, 660, -2.5) + pr(p.tw5, 480, 760, 480, 600, 3) + tag('All 35mm film', 64, 50)) },
  { name: '08', html: hero(p.m29, h2('I don\u2019t do<br/>boring.', 440) + sub('And neither should you.', 370)) },
  { name: '09', html: hero(p.ba10, h1('Now Bali.', 480) + sub('Looking for models. Sign up if this is your vibe.', 400)) },
  { name: '10-cta', html: cta(p.st5, h1('Sign up.', 520) + ctaBlock) },
]})

// ── V8: "I've shot in 13 cities." — stats-forward ──
V.push({ slug: 'v8-13-cities', slides: [
  { name: '01-hook', html: hero(p.tw1, tag('Now in Bali', 64, 60) + h1('I\u2019ve shot in<br/>13 cities.', 480) + sub('Looking for models. Sign up if you want photos like this.', 380)) },
  { name: '02', html: dark(tag('Baguio \u00b7 La Union \u00b7 Kaohsiung \u00b7 Taipei', 64, 50) + pr(p.ba1, 40, 120, 480, 620, -3) + pr(p.tw4, 460, 100, 520, 660, 2) + pr(p.ou1, 80, 780, 520, 660, 2.5) + pr(p.st1, 480, 800, 480, 600, -2)) },
  { name: '03', html: dark(tag('Mui Wo \u00b7 HK \u00b7 Tainan \u00b7 Chongqing', 64, 50) + pr(p.hk1, 60, 120, 440, 580, 3) + pr(p.hk3, 440, 100, 540, 680, -2) + pr(p.m10, 80, 740, 520, 660, -2.5) + pr(p.m15, 480, 760, 480, 600, 3)) },
  { name: '04', html: dark(tag('Guangzhou \u00b7 Seoul \u00b7 Tokyo', 64, 50) + pr(p.kr1, 80, 120, 560, 720, -1.5, 16) + pr(p.m5, 420, 640, 540, 680, 2.5) + sub('All on 35mm film.', 100)) },
  { name: '05', html: dark(tag('Ulaanbaatar \u00b7 Singapore', 64, 50) + pr(p.m1, 60, 120, 440, 580, -3) + pr(p.m22, 440, 100, 540, 680, 2) + pr(p.m8, 120, 740, 520, 660, 2.5) + pr(p.m25, 480, 760, 480, 600, -2)) },
  { name: '06', html: hero(p.in1, h2('Every single<br/>one directed<br/>by me.', 380) + sub('No experience needed.', 310)) },
  { name: '07', html: dark(pr(p.tw1, 40, 80, 480, 620, 3) + pr(p.st6, 460, 60, 520, 660, -2.5) + pr(p.hk1, 80, 740, 520, 660, -2) + pr(p.kr1, 480, 760, 480, 600, 3) + pr(p.m5, 180, 1400, 680, 460, -0.5, 16) + tag('The range', 64, 50)) },
  { name: '08', html: hero(p.ba10, h1('City #14:<br/>Bali.', 480) + sub('And I need new faces.', 400)) },
  { name: '09', html: dark(fl(p.m29, 60, 60, 960, 760, 0) + h2('This could<br/>be you.', 240) + sub('Sign up below.', 180)) },
  { name: '10-cta', html: cta(p.m30, h1('Sign up.', 520) + ctaBlock) },
]})

// ── V9: "Where I've been. Where I'm going." — journey ──
V.push({ slug: 'v9-where-ive-been', slides: [
  { name: '01-hook', html: hero(p.st5, tag('Film \u00b7 Bali', 64, 60) + h1('Where I\u2019ve<br/>been.', 500) + h2('Where I\u2019m going.', 420) + sub('Looking for models in Bali. Sign up below.', 340)) },
  { name: '02', html: hero(p.tw1, tag('Taipei \u2014 where it started', 64, 60) + sub('First roll of film. First collaboration.', 420)) },
  { name: '03', html: dark(tag('Then everywhere else', 64, 50) + pr(p.hk1, 40, 100, 480, 620, -3) + pr(p.kr1, 460, 80, 520, 660, 2) + pr(p.st1, 80, 760, 520, 660, 2.5) + pr(p.m5, 480, 780, 480, 600, -2)) },
  { name: '04', html: hero(p.ou1, tag('La Union', 64, 60) + h2('Beach towns.<br/>Mountain towns.', 420)) },
  { name: '05', html: dark(tag('Night shoots across Asia', 64, 50) + pr(p.hk3, 60, 100, 560, 720, -1.5, 16) + pr(p.hk2, 420, 620, 540, 680, 2.5) + sub('Hong Kong. Taipei. Kaohsiung.', 100)) },
  { name: '06', html: dark(pr(p.m1, 40, 80, 480, 620, 3) + pr(p.m22, 460, 60, 520, 660, -2.5) + pr(p.m8, 80, 740, 520, 660, -2) + pr(p.ba6, 480, 760, 480, 600, 3) + tag('Mongolia \u00b7 Singapore \u00b7 Philippines', 64, 50)) },
  { name: '07', html: hero(p.in1, h2('The best<br/>shoots are<br/>unplanned.', 380) + sub('I just need the right face.', 310)) },
  { name: '08', html: dark(pr(p.tw4, 60, 80, 440, 580, -3) + pr(p.ba5, 440, 60, 540, 680, 2) + pr(p.m30, 80, 700, 520, 660, 2.5) + pr(p.st6, 480, 720, 480, 600, -2.5) + tag('All 35mm film', 64, 50) + sub('Same camera since day one.', 100)) },
  { name: '09', html: hero(p.ba10, h1('Now: Bali.', 480) + sub('I\u2019m looking for models.<br/>Sign up if you want photos like this.', 380)) },
  { name: '10-cta', html: cta(p.m29, h1('Sign up.', 520) + ctaBlock) },
]})

// ── V10: "You've seen them everywhere. Now see yourself." — aspirational ──
V.push({ slug: 'v10-see-yourself', slides: [
  { name: '01-hook', html: hero(p.m5, tag('Bali \u00b7 Film', 64, 60) + h1('You\u2019ve seen<br/>them.<br/>Now see<br/>yourself.', 380, 88) + sub('Looking for models in Bali. Sign up below.', 300)) },
  { name: '02', html: dark(tag('Taipei', 64, 50) + pr(p.tw1, 80, 120, 880, 700, -0.5, 18) + sub('Her first time in front of a camera.', 200)) },
  { name: '03', html: dark(tag('Hong Kong', 64, 50) + pr(p.hk1, 60, 100, 440, 580, -3) + pr(p.hk3, 440, 80, 540, 680, 2) + pr(p.hk2, 120, 720, 520, 660, 2.5) + sub('Three strangers. One night.', 100)) },
  { name: '04', html: hero(p.kr1, tag('Seoul', 64, 60) + h2('She almost<br/>cancelled.', 440) + sub('Glad she didn\u2019t.', 380)) },
  { name: '05', html: dark(tag('Kaohsiung \u00b7 Tainan \u00b7 Chongqing', 64, 50) + pr(p.st1, 40, 100, 480, 620, 3) + pr(p.st5, 460, 80, 520, 660, -2.5) + pr(p.ba6, 80, 760, 520, 660, -2) + pr(p.m10, 480, 780, 480, 600, 3)) },
  { name: '06', html: hero(p.ou1, tag('La Union \u00b7 Baguio', 64, 60) + h2('Nature shoots<br/>hit different<br/>on film.', 380)) },
  { name: '07', html: dark(pr(p.m1, 60, 80, 560, 720, -1.5, 16) + pr(p.m8, 420, 600, 540, 680, 2.5) + tag('Ulaanbaatar \u00b7 Singapore \u00b7 Tokyo', 64, 50) + sub('I find interesting people everywhere.', 100)) },
  { name: '08', html: dark(pr(p.in1, 80, 80, 880, 700, 0.5, 18) + tag('Shot on 35mm film', 64, 50) + sub('The grain is the point.', 200)) },
  { name: '09', html: hero(p.ba10, h1('Now imagine<br/>yourself here.', 460) + sub('Bali. Sign up below.', 380)) },
  { name: '10-cta', html: cta(p.tw6, h1('Sign up.', 520) + ctaBlock) },
]})

// ── RENDER ──
async function render() {
  const all = []
  for (const v of V) {
    const dir = path.join(BASE_OUT, v.slug)
    fs.mkdirSync(dir, { recursive: true })
    for (const s of v.slides) all.push({ ...s, name: v.slug + '-' + s.name, dir: v.slug })
  }
  console.log('Rendering ' + all.length + ' slides across ' + V.length + ' variations...')
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 })
  for (let i = 0; i < all.length; i++) {
    const s = all[i]
    const page = await ctx.newPage()
    await page.setContent('<!doctype html><html><head><style>*{box-sizing:border-box}html,body{margin:0;width:1080px;height:1920px;background:#000;overflow:hidden}body{-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}</style></head><body>' + s.html + '</body></html>', { waitUntil: 'load' })
    await page.waitForTimeout(500)
    await page.screenshot({ path: path.join(BASE_OUT, s.dir, s.name + '.png'), type: 'png' })
    await page.close()
    if ((i+1) % 10 === 0 || i === 0) console.log('  [' + (i+1) + '/' + all.length + '] ' + s.name)
  }
  await browser.close()
  console.log('\nDone — ' + all.length + ' slides -> ' + BASE_OUT)
}
render()
