import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE_OUT = path.join(__dirname, 'output-bali-proof-v8')
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

function hook(photo) {
  return { name: '01-hook', html: hero(photo, tag('Shot on 35mm film', 64, 60) + h1("I'm looking for<br/>models in Bali.", 540) + sub('Sign up if you want<br/>photos like this.', 420, 44)) }
}
function ctaEnd(photo) {
  return { name: '10-cta', html: cta(photo, h1('Sign up.', 520) + ctaBlock) }
}
// 8 portrait prints — 3 rows staggered
function d8(name, tagText, imgs, bottomText) {
  return { name, html: dark(
    tag(tagText, 64, 40) +
    pr(imgs[0], 20, 80, 240, 340, -3.5, 10) +
    pr(imgs[1], 280, 60, 260, 360, 2, 10) +
    pr(imgs[2], 560, 90, 240, 330, -1.5, 10) +
    pr(imgs[3], 800, 70, 220, 320, 3, 10) +
    pr(imgs[4], 40, 460, 260, 370, 2.5, 10) +
    pr(imgs[5], 320, 440, 240, 340, -2, 10) +
    pr(imgs[6], 580, 470, 260, 360, 1.5, 10) +
    pr(imgs[7], 840, 450, 200, 300, -3, 10) +
    sub(bottomText, 80)
  )}
}
// 6 portrait floating
function d6(name, tagText, imgs, bottomText) {
  return { name, html: dark(
    tag(tagText, 64, 40) +
    fl(imgs[0], 20, 60, 320, 460, -3) +
    fl(imgs[1], 360, 40, 340, 480, 2.5) +
    fl(imgs[2], 700, 80, 320, 450, -1.5) +
    fl(imgs[3], 60, 540, 340, 480, 2) +
    fl(imgs[4], 400, 560, 320, 450, -2) +
    fl(imgs[5], 720, 540, 310, 440, 2.5) +
    sub(bottomText, 80)
  )}
}
// 5 portrait prints — 2 top + 3 bottom
function d5(name, tagText, imgs, bottomText) {
  return { name, html: dark(
    tag(tagText, 64, 40) +
    pr(imgs[0], 40, 80, 320, 460, -3, 12) +
    pr(imgs[1], 400, 60, 340, 480, 2.5, 12) +
    pr(imgs[2], 760, 100, 260, 380, -1.5, 12) +
    pr(imgs[3], 100, 580, 380, 520, 2, 12) +
    pr(imgs[4], 500, 600, 420, 560, -2.5, 12) +
    sub(bottomText, 80)
  )}
}
// 4 large portrait prints — 2x2 scattered
function d4(name, tagText, imgs, bottomText) {
  return { name, html: dark(
    tag(tagText, 64, 40) +
    pr(imgs[0], 30, 80, 380, 540, -3, 14) +
    pr(imgs[1], 460, 60, 400, 560, 2.5, 14) +
    pr(imgs[2], 60, 660, 400, 560, 2, 14) +
    pr(imgs[3], 480, 680, 380, 540, -2.5, 14) +
    sub(bottomText, 80)
  )}
}

V.push({ slug: 'v1-dense-global', slides: [
  hook(p.tw1),
  d8('02', 'Taipei \u00b7 Shot on film', [p.tw1, p.tw2, p.tw3, p.tw4, p.tw5, p.tw6, p.tw7, p.tw8], 'One city. Eight different people.'),
  d5('03', 'Hong Kong \u00b7 Night', [p.hk1, p.hk2, p.hk3, p.hk4, p.hk5, p.st3, p.st4, p.st2], 'City lights. Film grain. No flash.'),
  { name: '04', html: hero(p.kr1, tag('Seoul', 64, 60) + h2('Every face<br/>is different.', 440) + sub('Same film. Same photographer.', 370)) },
  d8('05', 'Kaohsiung \u00b7 Tainan \u00b7 Chongqing', [p.st1, p.st5, p.st6, p.ba6, p.ba7, p.ba9, p.m10, p.m11], 'Markets. Streets. Real life.'),
  d5('06', 'Singapore \u00b7 Ulaanbaatar \u00b7 Tokyo', [p.m5, p.m1, p.m8, p.m22, p.m12, p.m16], 'I find people worth shooting everywhere.'),
  { name: '07', html: hero(p.ou1, tag('La Union \u00b7 Baguio', 64, 60) + h2('Nature on film<br/>hits different.', 440) + sub('Golden hour. Mountains. Beach.', 370)) },
  d8('08', 'All 35mm film \u00b7 All directed by me', [p.in1, p.in4, p.ba5, p.ba10, p.m29, p.m28, p.m30, p.m31], 'No experience needed. I handle everything.'),
  { name: '09', html: hero(p.ba10, h1('Now Bali.', 500) + sub('Sign up if you want photos like this.', 420)) },
  ctaEnd(p.m30),
]})

V.push({ slug: 'v2-journey-dense', slides: [
  hook(p.kr1),
  { name: '02', html: hero(p.st1, tag('Kaohsiung', 64, 60) + h2('It started in<br/>alleyways.', 440) + sub('Shooting strangers on 35mm.', 370)) },
  d5('03', 'Then everywhere', [p.tw1, p.hk1, p.kr1, p.m5, p.st6, p.ba6, p.m22, p.ou1], 'Same camera. Different continents.'),
  d8('04', 'Night shoots across Asia', [p.hk1, p.hk2, p.hk3, p.hk4, p.hk5, p.st3, p.m30, p.m31], 'Hong Kong. Taipei. Kaohsiung. All film.'),
  { name: '05', html: hero(p.in1, h2('The quiet<br/>moments are<br/>the best.', 400) + sub('Intimate on 35mm.', 330)) },
  d8('06', 'Guangzhou \u00b7 Chongqing \u00b7 Mui Wo \u00b7 Tainan', [p.m1, p.m5, p.m8, p.m10, p.m15, p.m18, p.m20, p.m22], 'Everywhere I go I find faces.'),
  d6('07', 'Philippines \u00b7 Mongolia', [p.ba1, p.ba5, p.ba10, p.ou1, p.ou2, p.ou3], 'Mountains. Beach. Golden hour.'),
  d8('08', 'All shot on film', [p.tw4, p.ba8, p.st6, p.m8, p.kr2, p.m25, p.m29, p.in4], 'And now I am in Bali.'),
  { name: '09', html: hero(p.m29, h1('Your turn.', 500) + sub('Sign up if you want photos like this.', 420)) },
  ctaEnd(p.tw6),
]})

V.push({ slug: 'v3-city-dense', slides: [
  hook(p.m5),
  d8('02', 'Taiwan', [p.tw1, p.tw2, p.tw3, p.tw4, p.tw5, p.tw6, p.tw7, p.tw8], 'Taipei \u00b7 Kaohsiung \u00b7 Tainan'),
  d5('03', 'Hong Kong', [p.hk1, p.hk2, p.hk3, p.hk4, p.hk5, p.st2, p.st3, p.st4], 'Night markets. Neon. Film grain.'),
  d4('04', 'Korea', [p.kr1, p.kr2, p.kr3, p.kr4, p.m29, p.m28], 'Seoul on 35mm.'),
  d8('05', 'Singapore \u00b7 Ulaanbaatar \u00b7 Tokyo', [p.m1, p.m5, p.m8, p.m12, p.m16, p.m20, p.m22, p.m25], 'Asia. Everywhere.'),
  d8('06', 'Philippines', [p.ba1, p.ba3, p.ba5, p.ba6, p.ba7, p.ba10, p.ou1, p.ou2], 'Baguio. La Union. Manila.'),
  { name: '07', html: hero(p.in1, h2('Every one of<br/>these people<br/>trusted me.', 400) + sub('None of them had modeled before.', 330)) },
  d8('08', 'Guangzhou \u00b7 Chongqing', [p.m10, p.m11, p.m14, p.m15, p.m18, p.m19, p.m21, p.m26], 'China on film.'),
  { name: '09', html: hero(p.ba10, h1('Next: Bali.', 500) + sub('I need new faces. Sign up below.', 420)) },
  ctaEnd(p.st6),
]})

V.push({ slug: 'v4-stories-dense', slides: [
  hook(p.hk1),
  { name: '02', html: hero(p.tw1, tag('She was a barista in Taipei', 64, 60) + sub('First shoot ever. Could not tell.', 420)) },
  d5('03', 'Then I kept going', [p.hk1, p.kr1, p.st1, p.m5, p.ba6, p.m22, p.ou1, p.in1], 'Every city. New strangers. Same camera.'),
  { name: '04', html: hero(p.kr1, tag('Seoul', 64, 60) + h2('She almost<br/>cancelled.', 460) + sub('Glad she did not.', 400)) },
  d8('05', 'Night people', [p.hk1, p.hk2, p.hk3, p.hk4, p.hk5, p.st3, p.st4, p.m30], 'Some of my best work happens after dark.'),
  { name: '06', html: hero(p.m5, tag('Singapore', 64, 60) + h2('She had never<br/>done this before.', 440) + sub('Most of them have not.', 370)) },
  d4('07', 'All real. All directed by me.', [p.tw4, p.ba5, p.m8, p.m1, p.kr2, p.st6, p.m22, p.in4], 'No experience needed. That is the point.'),
  d4('08', 'Shot on 35mm film', [p.ba10, p.ou1, p.ba1, p.ou2, p.m26, p.m27], 'Mountains. Golden hour. Nature.'),
  { name: '09', html: hero(p.ba10, h1('Who is next<br/>in Bali?', 500) + sub('Maybe you. Sign up below.', 420)) },
  ctaEnd(p.tw6),
]})

V.push({ slug: 'v5-minimal-heroes', slides: [
  hook(p.st6),
  { name: '02', html: hero(p.tw1, tag('Taipei', 64, 60)) },
  { name: '03', html: hero(p.hk1, tag('Hong Kong', 64, 60)) },
  { name: '04', html: hero(p.kr1, tag('Seoul', 64, 60)) },
  d8('05', '13 cities on 35mm film', [p.st1, p.m5, p.m1, p.ba6, p.ou1, p.m22, p.in1, p.ba10], 'Same camera everywhere.'),
  { name: '06', html: hero(p.m1, tag('Ulaanbaatar', 64, 60)) },
  { name: '07', html: hero(p.m5, tag('Singapore', 64, 60)) },
  { name: '08', html: hero(p.ou1, tag('La Union', 64, 60)) },
  { name: '09', html: hero(p.ba10, tag('Bali - your turn', 64, 60) + h1('Now you.', 500) + sub('I direct everything. No experience needed.', 420)) },
  ctaEnd(p.in1),
]})

V.push({ slug: 'v6-faces-stories', slides: [
  hook(p.st6),
  { name: '02', html: hero(p.tw1, tag('Taipei', 64, 60) + sub('A barista. Her first shoot. Shot on 35mm.', 420)) },
  d5('03', 'Then I kept finding people', [p.hk1, p.hk3, p.kr1, p.st1, p.m5, p.tw4, p.ba6, p.in1], 'Strangers who became subjects.'),
  { name: '04', html: hero(p.kr1, tag('Seoul', 64, 60) + h2('She said she had<br/>never modeled.', 460) + sub('Look at her.', 400)) },
  d8('05', 'Hong Kong at night', [p.hk1, p.hk2, p.hk3, p.hk4, p.hk5, p.st2, p.st3, p.st4], 'Three strangers. One night. All film.'),
  { name: '06', html: hero(p.m5, tag('Singapore', 64, 60) + sub('A designer. She brought her own collection.', 420)) },
  d4('07', 'Everywhere else', [p.m1, p.m8, p.m22, p.ou1, p.ba1, p.ba10, p.m26, p.m30], 'Ulaanbaatar. Baguio. La Union. Chongqing.'),
  d4('08', 'The intimate ones', [p.in1, p.in4, p.in2, p.m29, p.m28, p.m35], 'Are always the best.'),
  { name: '09', html: hero(p.ba10, h1('Who is next<br/>in Bali?', 500) + sub('Maybe you. Sign up below.', 420)) },
  ctaEnd(p.tw6),
]})

V.push({ slug: 'v7-not-boring', slides: [
  hook(p.hk1),
  d8('02', 'Real people \u00b7 Real film', [p.st6, p.st1, p.tw1, p.kr1, p.hk1, p.m5, p.ba6, p.m22], 'Not stock photos. Not AI. Real.'),
  { name: '03', html: hero(p.in1, h2('Not posed.<br/>Directed.', 440) + sub('There is a difference.', 370)) },
  d8('04', 'Taipei \u00b7 HK \u00b7 Seoul \u00b7 Kaohsiung', [p.tw1, p.tw4, p.hk3, p.hk5, p.kr2, p.st1, p.st5, p.m10], 'Four countries. One roll of film.'),
  { name: '05', html: hero(p.ou1, h2('No studio.<br/>No backdrop.', 440) + sub('Just us and the light.', 370)) },
  d8('06', 'Ulaanbaatar \u00b7 Singapore \u00b7 Tokyo', [p.m1, p.m5, p.m8, p.m12, p.m22, p.m25, p.m30, p.m31], '35mm film. Everywhere.'),
  d6('07', 'Philippines', [p.ba1, p.ba5, p.ba10, p.ou1, p.ou2, p.ou3], 'Beach. Mountains. Golden hour.'),
  { name: '08', html: hero(p.m29, h2('I do not do<br/>boring.', 460) + sub('And neither should you.', 390)) },
  { name: '09', html: hero(p.ba10, h1('Now Bali.', 500) + sub('Sign up if this is your vibe.', 420)) },
  ctaEnd(p.st5),
]})

V.push({ slug: 'v8-stats-dense', slides: [
  hook(p.tw1),
  d8('02', 'Baguio \u00b7 La Union \u00b7 Kaohsiung \u00b7 Taipei', [p.ba1, p.ba5, p.tw1, p.tw4, p.ou1, p.ou2, p.st1, p.st5], '8 shoots. 4 cities. All 35mm.'),
  d5('03', 'Mui Wo \u00b7 HK \u00b7 Tainan \u00b7 Chongqing', [p.hk1, p.hk2, p.hk3, p.hk4, p.hk5, p.st3, p.m10, p.m15], 'Night. Markets. Neon. Film grain.'),
  d8('04', 'Guangzhou \u00b7 Seoul \u00b7 Tokyo', [p.kr1, p.kr2, p.kr3, p.kr4, p.m5, p.m8, p.m12, p.m16], 'Fashion meets documentary.'),
  d8('05', 'Ulaanbaatar \u00b7 Singapore', [p.m1, p.m22, p.m25, p.m26, p.m28, p.m29, p.m30, p.m31], 'I find faces everywhere I go.'),
  { name: '06', html: hero(p.in1, h2('Every single one<br/>directed by me.', 440) + sub('No experience needed.', 370)) },
  d4('07', 'The range', [p.tw1, p.st6, p.hk1, p.kr1, p.m5, p.in1, p.ou1, p.ba10], 'Street. Fashion. Intimate. Nature.'),
  { name: '08', html: hero(p.ba10, h1('City #14:<br/>Bali.', 500) + sub('I need new faces.', 420)) },
  d5('09', 'This could be you', [p.m29, p.ba10, p.in1, p.m28, p.ba5, p.tw4], 'Sign up below.'),
  ctaEnd(p.m30),
]})

V.push({ slug: 'v9-journey-packed', slides: [
  hook(p.st5),
  { name: '02', html: hero(p.tw1, tag('Taipei - where it started', 64, 60) + sub('First roll of film. First collaboration.', 420)) },
  d5('03', 'Then everywhere else', [p.hk1, p.kr1, p.st1, p.m5, p.ba6, p.m22, p.ou1, p.m1], 'Same camera. Different continent every month.'),
  d8('04', 'Night shoots', [p.hk1, p.hk2, p.hk3, p.hk4, p.hk5, p.st3, p.st4, p.m30], 'Hong Kong. Taipei. Kaohsiung. All after midnight.'),
  { name: '05', html: hero(p.ou1, tag('La Union \u00b7 Baguio', 64, 60) + h2('Beach towns.<br/>Mountain towns.', 440) + sub('Nature on film.', 370)) },
  d8('06', 'Mongolia \u00b7 Singapore \u00b7 Philippines', [p.m1, p.m8, p.m22, p.ba1, p.ba5, p.ba10, p.ou2, p.m26], 'People everywhere want great photos.'),
  { name: '07', html: hero(p.in1, h2('The best shoots<br/>are unplanned.', 440) + sub('I just need the right face.', 370)) },
  d8('08', 'All 35mm film', [p.tw4, p.ba8, p.st6, p.m8, p.kr2, p.m25, p.m29, p.in4], 'Same camera since day one.'),
  { name: '09', html: hero(p.ba10, h1('Now: Bali.', 500) + sub('Sign up if you want photos like this.', 420)) },
  ctaEnd(p.m29),
]})

V.push({ slug: 'v10-aspirational', slides: [
  hook(p.m5),
  d8('02', 'Taipei', [p.tw1, p.tw2, p.tw3, p.tw4, p.tw5, p.tw6, p.tw7, p.tw8], 'Her first time in front of a camera.'),
  d5('03', 'Hong Kong', [p.hk1, p.hk2, p.hk3, p.hk4, p.hk5, p.st2, p.st3, p.st4], 'Three strangers. One night. All film.'),
  { name: '04', html: hero(p.kr1, tag('Seoul', 64, 60) + h2('She almost<br/>cancelled.', 460) + sub('Glad she did not.', 400)) },
  d8('05', 'Kaohsiung \u00b7 Tainan \u00b7 Chongqing', [p.st1, p.st5, p.st6, p.ba6, p.ba7, p.ba9, p.m10, p.m11], 'Every face has something.'),
  { name: '06', html: hero(p.ou1, tag('La Union \u00b7 Baguio', 64, 60) + h2('Nature shoots<br/>hit different<br/>on film.', 400)) },
  d4('07', 'Ulaanbaatar \u00b7 Singapore \u00b7 Tokyo', [p.m1, p.m5, p.m8, p.m12, p.m22, p.m25, p.m30, p.m31], 'I find interesting people everywhere.'),
  d4('08', 'The intimate ones', [p.in1, p.in4, p.in2, p.m29, p.m28, p.m35], 'The grain is the point.'),
  { name: '09', html: hero(p.ba10, h1('Now imagine<br/>yourself here.', 480) + sub('Bali. Sign up below.', 400)) },
  ctaEnd(p.tw6),
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
