import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE_OUT = path.join(__dirname, 'output-bali-proof-v9')
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
// Photos loaded in variations below

const ctaBlock = '<div style="position:absolute;bottom:380px;left:64px;right:64px;"><p style="font-family:'+SANS+';font-size:38px;font-weight:600;color:white;margin:0;'+S+'">Click the link below to sign up.</p><p style="font-family:'+SANS+';font-size:32px;color:rgba(255,255,255,0.7);margin:20px 0 0;'+S+'">I handle everything. No experience needed.</p></div>'

const V = []

function hook(photo) {
  return { name: '01-hook', html: hero(photo, tag('Shot on 35mm film', 64, 60) + h1("I'm looking for<br/>models in Bali.", 540) + sub('Sign up if you want<br/>photos like this.', 420, 44)) }
}
function ctaEnd(photo) {
  return { name: '10-cta', html: cta(photo, h1('Sign up.', 520) + ctaBlock) }
}

// Layout A: Original scattered proof style — 3 rows of staggered prints, well-spaced
function scatterA(name, tagText, imgs, bottomText) {
  return { name, html: dark(
    tag(tagText, 64, 40) +
    pr(imgs[0], 50,  90,  280, 380, -2.5) +
    pr(imgs[1], 370, 70,  280, 380, 1.8) +
    pr(imgs[2], 700, 100, 280, 380, -1.2) +
    pr(imgs[3], 90,  510, 270, 360, 1.6) +
    pr(imgs[4], 430, 490, 270, 360, -2.0) +
    pr(imgs[5], 740, 520, 270, 360, 2.4) +
    pr(imgs[6], 170, 920, 300, 400, -1.4) +
    pr(imgs[7], 570, 900, 300, 400, 1.9) +
    sub(bottomText, 60)
  )}
}

// Layout B: Cascading diagonal — large prints stepping down
function cascadeB(name, tagText, imgs, bottomText) {
  return { name, html: dark(
    tag(tagText, 64, 40) +
    pr(imgs[0], 40,  80,  420, 560, -2.5, 14) +
    pr(imgs[1], 500, 200, 440, 580, 2, 14) +
    pr(imgs[2], 80,  640, 400, 540, 1.8, 14) +
    pr(imgs[3], 520, 760, 420, 560, -2.5, 14) +
    sub(bottomText, 60)
  )}
}

// Layout C: Hero center + 4 small accents at corners
function heroAccents(name, tagText, imgs, bottomText) {
  return { name, html: dark(
    tag(tagText, 64, 40) +
    pr(imgs[0], 160, 160, 740, 560, -0.5, 16) +
    pr(imgs[1], 20,  80,  220, 300, -5, 10) +
    pr(imgs[2], 820, 60,  220, 300, 4, 10) +
    pr(imgs[3], 40,  760, 220, 300, 3, 10) +
    pr(imgs[4], 800, 780, 220, 300, -4, 10) +
    sub(bottomText, 60)
  )}
}

// Layout D: Photo booth strip — 3 photos in a vertical white strip
function boothStrip(name, tagText, imgs, bottomText) {
  return { name, html: dark(
    tag(tagText, 64, 40) +
    '<div style="position:absolute;left:240px;top:80px;width:640px;background:white;padding:24px 24px 60px;transform:rotate(-1.5deg);box-shadow:8px 8px 40px rgba(0,0,0,0.5);">' +
    '<img src="' + imgs[0] + '" style="width:592px;height:440px;object-fit:cover;object-position:center top;display:block;margin-bottom:16px;"/>' +
    '<img src="' + imgs[1] + '" style="width:592px;height:440px;object-fit:cover;object-position:center top;display:block;margin-bottom:16px;"/>' +
    '<img src="' + imgs[2] + '" style="width:592px;height:440px;object-fit:cover;object-position:center top;display:block;"/>' +
    '</div>' +
    sub(bottomText, 60)
  )}
}

// Layout E: 5 prints in a fan arc
function fanArc(name, tagText, imgs, bottomText) {
  return { name, html: dark(
    tag(tagText, 64, 40) +
    pr(imgs[0], 20,  240, 280, 400, -10, 12) +
    pr(imgs[1], 200, 140, 300, 420, -3, 12) +
    pr(imgs[2], 400, 100, 300, 420, 2, 12) +
    pr(imgs[3], 600, 160, 280, 400, 7, 12) +
    pr(imgs[4], 760, 280, 260, 380, 12, 12) +
    sub(bottomText, 60)
  )}
}

// Layout F: 6 tight cluster — overlapping pile
function tightPile(name, tagText, imgs, bottomText) {
  return { name, html: dark(
    tag(tagText, 64, 40) +
    pr(imgs[0], 60,  100, 340, 460, -5, 12) +
    pr(imgs[1], 360, 80,  320, 440, 3.5, 12) +
    pr(imgs[2], 660, 120, 300, 420, -2, 12) +
    pr(imgs[3], 120, 560, 320, 440, 2.5, 12) +
    pr(imgs[4], 440, 540, 340, 460, -3.5, 12) +
    pr(imgs[5], 720, 580, 280, 400, 2, 12) +
    sub(bottomText, 60)
  )}
}

// Load fresh photos not used before
const f = {
  // Chongqing / China street
  c1: n('000020-4.jpg'), c2: n('000020-5.jpg'), c3: n('000020-6.jpg'), c4: n('000020-9.jpg'),
  c5: n('000021-4.jpg'), c6: n('000021.jpg'),
  // HK night (new subjects)
  h1: n('000022-4.jpg'), h2: n('000022-6.jpg'), h3: n('000022.jpg'),
  h4: n('000023-4.jpg'), h5: n('000023-6.jpg'), h6: n('000023.jpg'),
  h7: n('000024-3.jpg'), h8: n('000024-4.jpg'), h9: n('000024.jpg'),
  // HK/night extended
  h10: n('000025-2.jpg'), h11: n('000025-3.jpg'), h12: n('000025.jpg'),
  h13: n('000026-2.jpg'), h14: n('000026-3.jpg'), h15: n('000026-4.jpg'),
  h16: n('000026-8.jpg'),
  // More subjects
  s1: n('000027.jpg'), s2: n('000027-2.jpg'), s3: n('000027-3.jpg'), s4: n('000027-4.jpg'),
  s5: n('000028-3.jpg'), s6: n('000028-9.jpg'), s7: n('000028-10.jpg'),
  s8: n('000029-3.jpg'), s9: n('000029-10.jpg'),
  s10: n('000030.jpg'), s11: n('000030-4.jpg'),
  // Extended range
  e1: n('000032-3.jpg'), e2: n('000040-4-2.jpg'), e3: n('000040-7.jpg'),
  // Also pull some proven favorites for hero shots
  fav1: n('000005-3.jpg'), fav2: n('000008-3.jpg'), fav3: n('000016.jpg'),
  fav4: n('000009.jpg'), fav5: n('000015-3.jpg'), fav6: n('000013-3.jpg'),
  fav7: n('000017-4.jpg'), fav8: n('000012.jpg'),
}

// V1: Dense scattered + cascades — all fresh photos
V.push({ slug: 'v1-fresh-scattered', slides: [
  hook(f.h6),
  scatterA('02', 'Hong Kong \u00b7 Shot on film', [f.h1, f.h2, f.h3, f.h4, f.h5, f.h6, f.h7, f.h8], 'Eight strangers. One city. All film.'),
  cascadeB('03', 'Chongqing \u00b7 35mm', [f.c1, f.c2, f.c3, f.c4], 'Street fashion at its rawest.'),
  { name: '04', html: hero(f.fav2, tag('Seoul', 64, 60) + h2('Every face<br/>is different.', 440) + sub('Same photographer. Same film.', 370)) },
  scatterA('05', 'Taipei \u00b7 Kaohsiung \u00b7 Tainan', [f.h9, f.h10, f.h11, f.h12, f.h13, f.h14, f.h15, f.h16], 'Markets. Night streets. Neon.'),
  heroAccents('06', 'Singapore \u00b7 35mm', [f.s1, f.s2, f.s3, f.s4, f.s5], 'One hero. Four more behind the scenes.'),
  { name: '07', html: hero(f.s8, tag('La Union \u00b7 Baguio', 64, 60) + h2('Nature on film<br/>hits different.', 440) + sub('Golden hour. Mountains. Beach.', 370)) },
  tightPile('08', 'All directed by me', [f.s6, f.s7, f.s9, f.s10, f.e1, f.e2], 'No experience needed. I handle everything.'),
  { name: '09', html: hero(f.fav3, h1('Now Bali.', 500) + sub('Sign up if you want photos like this.', 420)) },
  ctaEnd(f.fav5),
]})

// V2: Photo booth + fan + hero
V.push({ slug: 'v2-booth-fan', slides: [
  hook(f.fav4),
  boothStrip('02', 'Hong Kong \u00b7 Film', [f.h6, f.h3, f.h1], 'Three faces. One strip. All real.'),
  fanArc('03', 'Taipei \u00b7 Night', [f.h9, f.h12, f.h14, f.h15, f.h16], 'Five people I met on the street.'),
  { name: '04', html: hero(f.c1, tag('Chongqing', 64, 60) + h2('She had never<br/>done this before.', 440) + sub('Most of them have not.', 370)) },
  scatterA('05', 'Everywhere \u00b7 All 35mm', [f.s1, f.c2, f.h4, f.s5, f.fav6, f.h7, f.c5, f.s10], 'Different people. Same quality.'),
  boothStrip('06', 'Ulaanbaatar \u00b7 Mongolia', [f.s3, f.s6, f.s9], 'Even in places you would not expect.'),
  { name: '07', html: hero(f.fav7, h2('The quiet ones<br/>are always<br/>the best.', 400) + sub('Intimate. Editorial. Personal.', 330)) },
  tightPile('08', 'Shot on film since day one', [f.h10, f.c3, f.s7, f.e3, f.s11, f.e1], 'Same camera. Same process.'),
  { name: '09', html: hero(f.fav3, h1('Your turn.', 500) + sub('Sign up if you want photos like this.', 420)) },
  ctaEnd(f.fav8),
]})

// V3: All hero breathers + dense proof
V.push({ slug: 'v3-hero-heavy', slides: [
  hook(f.s1),
  { name: '02', html: hero(f.h6, tag('Hong Kong', 64, 60)) },
  scatterA('03', 'Then I kept shooting', [f.h1, f.h2, f.h3, f.h4, f.h5, f.c1, f.c2, f.c3], 'Every city. New faces. Same film.'),
  { name: '04', html: hero(f.c1, tag('Chongqing', 64, 60)) },
  { name: '05', html: hero(f.fav2, tag('Seoul', 64, 60)) },
  scatterA('06', '35mm film \u00b7 everywhere', [f.s1, f.s3, f.s5, f.s8, f.h9, f.h12, f.e1, f.e2], 'I find people worth shooting everywhere.'),
  { name: '07', html: hero(f.fav7, tag('Intimate', 64, 60)) },
  { name: '08', html: hero(f.h12, tag('Taipei', 64, 60)) },
  { name: '09', html: hero(f.fav3, tag('Bali \u2014 your turn', 64, 60) + h1('Now you.', 500) + sub('I direct everything. No experience needed.', 420)) },
  ctaEnd(f.fav5),
]})

// V4: Story-driven — one hero per story beat
V.push({ slug: 'v4-story-beats', slides: [
  hook(f.h3),
  { name: '02', html: hero(f.h6, tag('She was sitting at a night market in HK', 64, 60) + sub('I asked if she wanted photos. She said yes.', 420)) },
  cascadeB('03', 'Then it became a pattern', [f.c1, f.fav4, f.s1, f.h9], 'Strangers who trusted a guy with a camera.'),
  { name: '04', html: hero(f.fav2, tag('Seoul', 64, 60) + h2('She almost<br/>cancelled.', 460) + sub('Glad she did not.', 400)) },
  fanArc('05', 'Night shoots across Asia', [f.h1, f.h4, f.h7, f.fav6, f.fav5], 'City lights. Film grain. Real moments.'),
  { name: '06', html: hero(f.c1, tag('Chongqing', 64, 60) + sub('A flower seller. 20 minutes. 36 frames.', 420)) },
  scatterA('07', 'All 35mm film', [f.s3, f.s5, f.s8, f.s10, f.h12, f.h14, f.e1, f.c5], 'Every single one directed by me.'),
  { name: '08', html: hero(f.fav7, h2('None of them<br/>had modeled<br/>before.', 400) + sub('That is the point.', 330)) },
  { name: '09', html: hero(f.fav3, h1('Who is next<br/>in Bali?', 500) + sub('Maybe you. Sign up below.', 420)) },
  ctaEnd(f.s1),
]})

// V5: Dense proof every other slide
V.push({ slug: 'v5-alternating', slides: [
  hook(f.fav3),
  scatterA('02', 'Hong Kong', [f.h1, f.h2, f.h3, f.h4, f.h5, f.h6, f.h7, f.h8], 'Night. Film. No flash.'),
  { name: '03', html: hero(f.c1, tag('Chongqing', 64, 60) + h2('Fashion on<br/>the street.', 440)) },
  scatterA('04', 'Taipei \u00b7 Seoul \u00b7 Kaohsiung', [f.h9, f.h12, f.h14, f.fav2, f.s1, f.c2, f.c4, f.s10], 'Different cities. Same quality.'),
  { name: '05', html: hero(f.fav7, tag('Intimate', 64, 60) + h2('Soft light.<br/>Close up.<br/>Real.', 400)) },
  tightPile('06', 'Baguio \u00b7 La Union \u00b7 Singapore', [f.s3, f.s5, f.s8, f.e1, f.e2, f.e3], 'Beach. Mountains. Studios. Everywhere.'),
  { name: '07', html: hero(f.s1, tag('Ulaanbaatar', 64, 60) + sub('Yes, even Mongolia.', 420)) },
  scatterA('08', 'All shot on 35mm film', [f.c5, f.c6, f.h10, f.h11, f.h13, f.h15, f.s7, f.s9], 'Same camera since day one.'),
  { name: '09', html: hero(f.fav3, h1('Now Bali.', 500) + sub('Sign up if you want photos like this.', 420)) },
  ctaEnd(f.fav8),
]})

// V6: Booth strips + hero breathers
V.push({ slug: 'v6-strip-series', slides: [
  hook(f.h6),
  boothStrip('02', 'Hong Kong \u00b7 Night', [f.h1, f.h4, f.h6], 'Three strangers. One night.'),
  { name: '03', html: hero(f.c1, tag('Chongqing', 64, 60) + h2('Street markets<br/>at golden hour.', 440)) },
  boothStrip('04', 'Taipei', [f.h9, f.h12, f.h15], 'Fashion meets film.'),
  { name: '05', html: hero(f.fav2, tag('Seoul', 64, 60) + sub('She was nervous. Could not tell from the photos.', 420)) },
  boothStrip('06', 'Singapore \u00b7 Ulaanbaatar', [f.s1, f.s5, f.s8], 'Proof I shoot everywhere.'),
  { name: '07', html: hero(f.fav7, h2('I direct<br/>everything.', 460) + sub('No experience needed.', 390)) },
  fanArc('08', 'All 35mm film', [f.c2, f.h2, f.s3, f.e1, f.fav5], 'The grain is the point.'),
  { name: '09', html: hero(f.fav3, h1('Now Bali.', 500) + sub('Sign up if you want photos like this.', 420)) },
  ctaEnd(f.s10),
]})

// V7: Hero accent compositions
V.push({ slug: 'v7-hero-accents', slides: [
  hook(f.fav4),
  heroAccents('02', 'Hong Kong \u00b7 35mm', [f.h6, f.h1, f.h3, f.h5, f.h7], 'One hero. Four more behind.'),
  { name: '03', html: hero(f.c1, tag('Chongqing', 64, 60) + h2('China on film.', 460)) },
  heroAccents('04', 'Taipei \u00b7 Night', [f.h12, f.h9, f.h14, f.h15, f.h16], 'Fashion in the street.'),
  { name: '05', html: hero(f.fav2, tag('Seoul', 64, 60) + h2('She said she had<br/>never modeled.', 440) + sub('Look at her.', 370)) },
  heroAccents('06', 'Everywhere else', [f.s1, f.s3, f.s5, f.c2, f.e1], 'Singapore. Mongolia. Philippines.'),
  { name: '07', html: hero(f.fav7, h2('Intimate<br/>on film.', 460) + sub('The best ones are always quiet.', 390)) },
  cascadeB('08', 'All directed by me', [f.s8, f.c5, f.h10, f.e2], 'No experience needed.'),
  { name: '09', html: hero(f.fav3, h1('Your turn.', 500) + sub('Sign up if you want photos like this.', 420)) },
  ctaEnd(f.fav6),
]})

// V8: Stats + mixed layouts
V.push({ slug: 'v8-stats-mixed', slides: [
  hook(f.fav3),
  scatterA('02', 'Baguio \u00b7 La Union \u00b7 Kaohsiung \u00b7 Taipei', [f.h9, f.h12, f.h14, f.s3, f.s5, f.c2, f.e1, f.e2], '8 shoots. 4 cities. All 35mm.'),
  fanArc('03', 'Hong Kong \u00b7 Night', [f.h1, f.h3, f.h5, f.h6, f.h7], 'Night shoots. No flash. Film grain.'),
  { name: '04', html: hero(f.fav2, h2('Every one<br/>directed by me.', 440) + sub('No experience needed.', 370)) },
  scatterA('05', 'Ulaanbaatar \u00b7 Singapore \u00b7 Chongqing', [f.s1, f.s8, f.s10, f.c1, f.c3, f.c5, f.c6, f.s7], 'I find faces everywhere.'),
  boothStrip('06', 'The range', [f.fav4, f.fav7, f.h12], 'Street. Intimate. Editorial.'),
  { name: '07', html: hero(f.c1, h2('Markets.<br/>Rooftops.<br/>Back alleys.', 400) + sub('All shot on 35mm film.', 330)) },
  tightPile('08', 'Same camera since day one', [f.h10, f.h13, f.s6, f.s9, f.e3, f.c4], 'Film. Everywhere.'),
  { name: '09', html: hero(f.fav3, h1('City #14:<br/>Bali.', 500) + sub('I need new faces. Sign up below.', 420)) },
  ctaEnd(f.fav5),
]})

// V9: Journey with fresh faces
V.push({ slug: 'v9-journey-fresh', slides: [
  hook(f.s1),
  { name: '02', html: hero(f.h9, tag('Taipei \u2014 where it started', 64, 60) + sub('First roll of film. First stranger.', 420)) },
  scatterA('03', 'Then everywhere', [f.h1, f.h6, f.c1, f.s1, f.fav4, f.fav2, f.s8, f.e1], 'Same camera. Different continent every month.'),
  { name: '04', html: hero(f.h6, tag('Hong Kong', 64, 60) + h2('Night shoots<br/>are my thing.', 440)) },
  cascadeB('05', 'Night people', [f.h3, f.h5, f.fav6, f.fav5], 'Some of my best work happens after dark.'),
  scatterA('06', 'Mongolia \u00b7 Singapore \u00b7 Philippines', [f.s3, f.s5, f.s10, f.c5, f.e2, f.e3, f.h10, f.h13], 'People everywhere want great photos.'),
  { name: '07', html: hero(f.fav7, h2('The best shoots<br/>are unplanned.', 440) + sub('I just need the right face.', 370)) },
  fanArc('08', 'All 35mm film', [f.c2, f.h14, f.s7, f.s9, f.h16], 'Same camera since day one.'),
  { name: '09', html: hero(f.fav3, h1('Now: Bali.', 500) + sub('Sign up if you want photos like this.', 420)) },
  ctaEnd(f.fav8),
]})

// V10: Aspirational + fresh
V.push({ slug: 'v10-aspirational-fresh', slides: [
  hook(f.fav2),
  scatterA('02', 'Taipei', [f.h9, f.h10, f.h11, f.h12, f.h13, f.h14, f.h15, f.h16], 'Her first time in front of a camera.'),
  { name: '03', html: hero(f.h6, tag('Hong Kong', 64, 60) + h2('She almost<br/>cancelled.', 460) + sub('Glad she did not.', 400)) },
  tightPile('04', 'Chongqing \u00b7 Guangzhou', [f.c1, f.c2, f.c3, f.c4, f.c5, f.c6], 'Every face has something.'),
  { name: '05', html: hero(f.s1, tag('Ulaanbaatar', 64, 60) + h2('Even here.', 460) + sub('Especially here.', 400)) },
  scatterA('06', 'Singapore \u00b7 Baguio \u00b7 La Union', [f.s3, f.s5, f.s8, f.s10, f.e1, f.e2, f.s7, f.s9], 'I find people worth shooting everywhere.'),
  { name: '07', html: hero(f.fav7, h2('Nature shoots<br/>hit different<br/>on film.', 400)) },
  heroAccents('08', 'Shot on 35mm film', [f.h1, f.h3, f.fav6, f.c2, f.s6], 'The grain is the point.'),
  { name: '09', html: hero(f.fav3, h1('Now imagine<br/>yourself here.', 480) + sub('Bali. Sign up below.', 400)) },
  ctaEnd(f.fav5),
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
