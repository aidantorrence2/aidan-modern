import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE_OUT = path.join(__dirname, 'output-bali-proof-v4b')
const NEW_DIR = '/Users/aidantorrence/Documents/aidan-modern/public/images/new'

fs.mkdirSync(BASE_OUT, { recursive: true })

function n(filename) {
  const buf = fs.readFileSync(path.join(NEW_DIR, filename))
  return `data:image/jpeg;base64,${buf.toString('base64')}`
}

const SERIF = "Georgia, 'Times New Roman', serif"
const SANS = "Inter, -apple-system, system-ui, sans-serif"
const S = 'text-shadow: 0 2px 4px rgba(0,0,0,0.95), 0 8px 30px rgba(0,0,0,0.7), 0 0 80px rgba(0,0,0,0.4);'

function filmGrain(opacity = 0.08) {
  return `<div style="position:absolute;inset:0;pointer-events:none;opacity:${opacity};mix-blend-mode:soft-light;background-image:
    radial-gradient(circle at 14% 18%, rgba(255,255,255,0.5), transparent 17%),
    radial-gradient(circle at 84% 12%, rgba(255,255,255,0.28), transparent 15%),
    radial-gradient(circle at 50% 80%, rgba(255,255,255,0.22), transparent 22%),
    repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0 1px, transparent 1px 4px),
    repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 5px);"></div>`
}

function darkBg(inner) {
  return '<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#080a0e;">'
    + '<div style="position:absolute;inset:0;background:linear-gradient(170deg, #0c1420 0%, #080c14 50%, #060a10 100%);"></div>'
    + '<div style="position:absolute;inset:0;background:radial-gradient(circle at 20% 20%, rgba(80,140,220,0.12), transparent 30%), radial-gradient(circle at 80% 80%, rgba(220,170,100,0.08), transparent 25%);"></div>'
    + inner + filmGrain(0.08) + '</div>'
}

function warmBg(inner) {
  return '<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#f5f0e8;">'
    + '<div style="position:absolute;inset:0;background:linear-gradient(170deg, #faf6ee 0%, #f0e8d8 50%, #e8dcc8 100%);"></div>'
    + inner + filmGrain(0.04) + '</div>'
}

function heroBg(src, inner) {
  return '<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">'
    + '<img src="' + src + '" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center top;filter:saturate(1.1) contrast(1.05);"/>'
    + '<div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(0,0,0,0.1) 0%, transparent 20%, rgba(0,0,0,0.3) 55%, rgba(0,0,0,0.95) 100%);"></div>'
    + inner + filmGrain(0.1) + '</div>'
}

function ctaBg(src, inner) {
  return '<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">'
    + '<img src="' + src + '" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center top;filter:saturate(1.1) brightness(0.55);"/>'
    + '<div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.15) 30%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.92) 100%);"></div>'
    + inner + filmGrain(0.1) + '</div>'
}

// Print with white border
function pr(src, l, t, w, h, rot, b) {
  b = b || 12
  return '<div style="position:absolute;left:'+l+'px;top:'+t+'px;width:'+(w+b*2)+'px;height:'+(h+b*2)+'px;background:white;padding:'+b+'px;transform:rotate('+rot+'deg);box-shadow:0 8px 40px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.2);"><img src="'+src+'" style="width:'+w+'px;height:'+h+'px;object-fit:cover;object-position:center top;display:block;"/></div>'
}

// Floating with shadow
function fl(src, l, t, w, h, rot) {
  return '<img src="'+src+'" style="position:absolute;left:'+l+'px;top:'+t+'px;width:'+w+'px;height:'+h+'px;object-fit:cover;object-position:center top;display:block;transform:rotate('+rot+'deg);filter:drop-shadow(0 16px 40px rgba(0,0,0,0.5));"/>'
}

// Text helpers
function heading(text, bottom, size, color) {
  size = size || 96; color = color || 'white'
  return '<div style="position:absolute;bottom:'+bottom+'px;left:64px;right:64px;"><p style="font-family:'+SERIF+';font-size:'+size+'px;font-weight:700;font-style:italic;color:'+color+';line-height:0.95;margin:0;'+S+'">'+text+'</p></div>'
}

function subtext(text, bottom, size) {
  size = size || 38
  return '<div style="position:absolute;bottom:'+bottom+'px;left:64px;right:64px;"><p style="font-family:'+SANS+';font-size:'+size+'px;font-weight:500;color:rgba(255,255,255,0.9);line-height:1.35;margin:0;'+S+'">'+text+'</p></div>'
}

function tag(text, l, t) {
  return '<p style="position:absolute;left:'+l+'px;top:'+t+'px;font-family:'+SANS+';font-size:24px;font-weight:700;color:rgba(255,255,255,0.7);letter-spacing:0.12em;text-transform:uppercase;margin:0;'+S+'">'+text+'</p>'
}

function darkTag(text, l, t) {
  return '<p style="position:absolute;left:'+l+'px;top:'+t+'px;font-family:'+SANS+';font-size:24px;font-weight:700;color:rgba(0,0,0,0.5);letter-spacing:0.12em;text-transform:uppercase;margin:0;">'+text+'</p>'
}

// Load a big pool of photos
const photos = {
  a01: n('000001.jpg'),     a01_3: n('000001-3.jpg'),   a01_4: n('000001-4.jpg'),
  a01_5: n('000001-5.jpg'), a01_8: n('000001-8.jpg'),
  a02_4: n('000002-4.jpg'), a02_11: n('000002-11.jpg'),
  a03: n('000003.jpg'),     a03_4: n('000003-4.jpg'),   a03_5: n('000003-5.jpg'),
  a03_8: n('000003-8.jpg'), a03_12: n('000003-12.jpg'),
  a04: n('000004.jpg'),     a04_5: n('000004-5.jpg'),   a04_8: n('000004-8.jpg'),
  a04_12: n('000004-12.jpg'),
  a05_3: n('000005-3.jpg'), a05_4: n('000005-4.jpg'),   a05_5: n('000005-5.jpg'),
  a05_11: n('000005-11.jpg'), a05_12: n('000005-12.jpg'),
  a06_4: n('000006-4.jpg'), a06_12: n('000006-12.jpg'),
  a07_3: n('000007-3.jpg'), a07_4: n('000007-4.jpg'),   a07_7: n('000007-7.jpg'),
  a08_3: n('000008-3.jpg'), a08_4: n('000008-4.jpg'),   a08_7: n('000008-7.jpg'),
  a08_8: n('000008-8.jpg'),
  a09: n('000009.jpg'),     a09_7: n('000009-7.jpg'),   a09_11: n('000009-11.jpg'),
  a09_12: n('000009-12.jpg'),
  a10_3: n('000010-3.jpg'), a10_6: n('000010-6.jpg'),   a10_10: n('000010-10.jpg'),
  a10_11: n('000010-11.jpg'),
  a11_4: n('000011-4.jpg'), a11_6: n('000011-6.jpg'),
  a12: n('000012.jpg'),
  a13_3: n('000013-3.jpg'), a13_7: n('000013-7.jpg'),
  a14_3: n('000014-3.jpg'), a14_5: n('000014-5.jpg'),
  a15_2: n('000015-2.jpg'), a15_3: n('000015-3.jpg'),   a15_4: n('000015-4.jpg'),
  a15_8: n('000015-8.jpg'),
  a16: n('000016.jpg'),     a16_3: n('000016-3.jpg'),   a16_7: n('000016-7.jpg'),
  a17_4: n('000017-4.jpg'), a17_7: n('000017-7.jpg'),   a17_9: n('000017-9.jpg'),
  a41: n('000041.jpg'),     a41_3: n('000041-3.jpg'),   a41_6: n('000041-6.jpg'),
  a42_2: n('000042-2.jpg'), a42_5: n('000042-5.jpg'),   a42_6: n('000042-6.jpg'),
  a42_11: n('000042-11.jpg'),
  a43_4: n('000043-4.jpg'), a43_11: n('000043-11.jpg'),
  a44_2: n('000044-2.jpg'), a44_4: n('000044-4.jpg'),
  a45: n('000045.jpg'),     a45_4: n('000045-4.jpg'),
  a46_4: n('000046-4.jpg'), a46_5: n('000046-5.jpg'),
  a47_4: n('000047-4.jpg'), a47_12: n('000047-12.jpg'),
  a48_2: n('000048-2.jpg'), a48_11: n('000048-11.jpg'),
  a49_4: n('000049-4.jpg'),
  a50_6: n('000050-6.jpg'),
  a62: n('000062.jpg'),     a62_2: n('000062-2.jpg'),   a62_7: n('000062-7.jpg'),
  a63: n('000063.jpg'),
  a65: n('000065.jpg'),     a65_10: n('000065-10.jpg'),
  a66_2: n('000066-2.jpg'), a66_5: n('000066-5.jpg'),
  a67_9: n('000067-9.jpg'),
  a68_2: n('000068-2.jpg'), a68_9: n('000068-9.jpg'),
  b03: n('0003_3-3.jpg'),   b04: n('0004_4-6.jpg'),
  b12: n('0012_12-6.jpg'),  b13: n('0013_13.jpg'),
  b14: n('0014_14-6.jpg'),  b15: n('0015_15-6.jpg'),
  b16: n('0016_16-5.jpg'),  b17: n('0017_17-6.jpg'),
  b20: n('0020_20-6.jpg'),  b21: n('0021_21-6.jpg'),
  b33: n('0033_33-5.jpg'),  b37: n('0037_E-2.jpg'),
  b38: n('0038_36.jpg'),
}
const p = photos

// ============================================================
// 10 VARIATIONS — each is a 10-slide carousel in its own folder
// ============================================================

const variations = []

// ── V1: "The work speaks." — scattered prints on dark ──
variations.push({ slug: 'v1-work-speaks', slides: [
  { name: '01-hook', html: heroBg(p.a05_3, tag('Shot on film', 64, 60) + heading('I\u2019m looking for<br/>models in Bali.', 540) + subtext('Sign up if you want<br/>photos like this.', 420, 44)) },
  { name: '02', html: darkBg(tag('Recent work \u00b7 Shot on film', 64, 50) + pr(p.a16, 60, 120, 600, 750, -1.5, 14) + pr(p.a13_3, 520, 680, 460, 580, 2.5) + pr(p.a01_8, 80, 1360, 400, 480, 3)) },
  { name: '03', html: darkBg(pr(p.a09, 40, 80, 480, 640, -3) + pr(p.a08_3, 460, 60, 540, 680, 2) + pr(p.a15_3, 140, 780, 700, 520, -1) + subtext('All directed by me. No experience needed.', 180)) },
  { name: '04', html: heroBg(p.a12, heading('Every shoot<br/>tells a story.', 420, 88)) },
  { name: '05', html: darkBg(pr(p.a03, 60, 100, 440, 560, 2.5) + pr(p.a14_3, 500, 140, 500, 620, -2) + pr(p.a04, 120, 720, 520, 660, -1.8) + pr(p.a17_4, 540, 800, 440, 560, 3.5) + subtext('Different faces. Different stories.', 140)) },
  { name: '06', html: heroBg(p.a41, heading('Your face.<br/>My lens.', 420, 96)) },
  { name: '07', html: darkBg(tag('@madebyaidan', 64, 50) + pr(p.a42_5, 40, 120, 460, 580, -4) + pr(p.a05_5, 460, 80, 520, 660, 3) + pr(p.a62, 80, 740, 540, 680, 2.2) + pr(p.a45, 500, 780, 480, 600, -3)) },
  { name: '08', html: darkBg(fl(p.a43_4, 60, 80, 500, 660, -2) + fl(p.a46_4, 440, 400, 560, 700, 2) + fl(p.a48_2, 100, 860, 480, 600, 1.5) + fl(p.a66_5, 460, 1100, 520, 660, -2.5) + subtext('TFP \u00b7 We both build our books.', 120)) },
  { name: '09', html: heroBg(p.a10_11, heading('This could<br/>be you.', 440, 96) + subtext('Sign up below. I direct everything.', 380)) },
  { name: '10-cta', html: ctaBg(p.a07_3, heading('Let\u2019s<br/>collaborate.', 500, 100) + '<div style="position:absolute;bottom:380px;left:64px;right:64px;"><p style="font-family:'+SANS+';font-size:36px;color:rgba(255,255,255,0.9);margin:0;'+S+'">Click the link below to sign up.</p><p style="font-family:'+SANS+';font-size:30px;color:rgba(255,255,255,0.85);margin:20px 0 0;'+S+'">Send me your look. I handle everything.</p></div>') },
]})

// ── V2: "I shoot people." — bold, minimal, full bleed heroes ──
variations.push({ slug: 'v2-i-shoot-people', slides: [
  { name: '01-hook', html: heroBg(p.a08_3, tag('35mm film', 64, 60) + heading('I\u2019m looking for<br/>models in Bali.', 540) + subtext('Sign up if you want<br/>photos like this.', 420, 44)) },
  { name: '02', html: heroBg(p.a09, tag('01', 64, 60)) },
  { name: '03', html: heroBg(p.a13_3, tag('02', 64, 60)) },
  { name: '04', html: heroBg(p.a05_3, tag('03', 64, 60)) },
  { name: '05', html: heroBg(p.a42_5, tag('04', 64, 60)) },
  { name: '06', html: heroBg(p.a15_3, tag('05', 64, 60)) },
  { name: '07', html: heroBg(p.a62, tag('06', 64, 60)) },
  { name: '08', html: heroBg(p.a16, tag('07', 64, 60)) },
  { name: '09', html: heroBg(p.a44_2, heading('Want in?', 440, 120) + subtext('No experience needed. I direct everything.', 380)) },
  { name: '10-cta', html: ctaBg(p.a12, heading('Sign up.', 500, 120) + '<div style="position:absolute;bottom:380px;left:64px;right:64px;"><p style="font-family:'+SANS+';font-size:36px;color:rgba(255,255,255,0.9);margin:0;'+S+'">Click the link below to sign up.</p><p style="font-family:'+SANS+';font-size:30px;color:rgba(255,255,255,0.85);margin:20px 0 0;'+S+'">Collab spots open this month.</p></div>') },
]})

// ── V3: "Not your average photographer." — alternating prints + heroes ──
variations.push({ slug: 'v3-not-average', slides: [
  { name: '01-hook', html: heroBg(p.a17_4, tag('Shot on film', 64, 60) + heading('Looking for<br/>models in Bali.', 540) + subtext('Sign up if you want<br/>photos like this.', 420, 44)) },
  { name: '02', html: darkBg(tag('Shot on 35mm film', 64, 50) + pr(p.a03, 80, 120, 560, 720, -2, 16) + pr(p.a14_3, 440, 660, 500, 640, 3)) },
  { name: '03', html: heroBg(p.a41_3, subtext('@madebyaidan', 420)) },
  { name: '04', html: darkBg(pr(p.a63, 40, 80, 480, 620, 3) + pr(p.a47_4, 460, 100, 520, 680, -2) + pr(p.a65, 160, 780, 680, 500, -1.5, 14) + subtext('Film. Digital. Whatever works.', 140)) },
  { name: '05', html: heroBg(p.a66_2, heading('Every face<br/>has a story.', 420, 88)) },
  { name: '06', html: darkBg(pr(p.a68_2, 60, 100, 440, 560, -3.5) + pr(p.a48_11, 480, 120, 500, 640, 2) + pr(p.a49_4, 100, 720, 520, 660, 2.5) + pr(p.a50_6, 500, 800, 480, 600, -2)) },
  { name: '07', html: heroBg(p.a43_11, subtext('I direct. You show up.', 420)) },
  { name: '08', html: darkBg(tag('TFP collaboration', 64, 50) + pr(p.a67_9, 80, 120, 560, 720, -1.5, 14) + pr(p.a15_4, 420, 640, 540, 680, 2.5) + subtext('We both walk away with great content.', 120)) },
  { name: '09', html: heroBg(p.a04, heading('This could<br/>be you.', 440, 96) + subtext('No experience needed.', 380)) },
  { name: '10-cta', html: ctaBg(p.a01, heading('Let\u2019s create.', 500, 100) + '<div style="position:absolute;bottom:380px;left:64px;right:64px;"><p style="font-family:'+SANS+';font-size:36px;color:rgba(255,255,255,0.9);margin:0;'+S+'">Click the link below to sign up.</p><p style="font-family:'+SANS+';font-size:30px;color:rgba(255,255,255,0.85);margin:20px 0 0;'+S+'">Open for collabs this month.</p></div>') },
]})

// ── V4: "Casting call." — editorial grid/cluster heavy ──
variations.push({ slug: 'v4-casting-call', slides: [
  { name: '01-hook', html: heroBg(p.a09, tag('35mm film \u00b7 Bali', 64, 60) + heading('Looking for<br/>models in Bali.', 540) + subtext('Sign up if you want<br/>photos like this.', 420, 44)) },
  { name: '02', html: darkBg(pr(p.a16, 40, 80, 620, 800, -1, 16) + pr(p.a11_4, 520, 700, 480, 600, 3) + tag('Shot on film', 64, 50)) },
  { name: '03', html: darkBg(pr(p.a42_6, 60, 80, 460, 580, 3.5) + pr(p.a43_4, 460, 60, 520, 660, -2) + pr(p.a44_4, 140, 700, 500, 640, -2.5) + pr(p.a45_4, 520, 740, 460, 580, 2) + subtext('All shot on film.', 140)) },
  { name: '04', html: heroBg(p.a62, heading('I need<br/>new faces.', 420, 96)) },
  { name: '05', html: darkBg(fl(p.a46_5, 40, 60, 500, 660, -3) + fl(p.a47_12, 460, 380, 560, 700, 2) + fl(p.a07_4, 80, 800, 480, 600, 2.5) + fl(p.a08_4, 460, 1060, 520, 660, -1.5) + subtext('Different vibes. Same quality.', 100)) },
  { name: '06', html: heroBg(p.a03_12, tag('@madebyaidan', 64, 60)) },
  { name: '07', html: darkBg(tag('What you get', 64, 50) + pr(p.a15_2, 60, 120, 440, 560, -3) + pr(p.a10_6, 460, 100, 520, 660, 2.5) + '<div style="position:absolute;bottom:320px;left:64px;right:64px;"><p style="font-family:'+SERIF+';font-size:56px;font-weight:700;font-style:italic;color:rgba(255,255,255,0.9);line-height:1.15;margin:0;'+S+'">Edited photos.<br/>Creative direction.<br/>Content for your book.</p></div>') },
  { name: '08', html: heroBg(p.a17_9, heading('No experience<br/>needed.', 420, 88) + subtext('I direct the whole shoot.', 360)) },
  { name: '09', html: darkBg(pr(p.a68_9, 80, 80, 560, 720, -1.5, 16) + pr(p.a06_4, 420, 600, 540, 680, 2.5) + subtext('Your photos could be here.', 100)) },
  { name: '10-cta', html: ctaBg(p.a05_3, heading('Sign up.', 500, 120) + '<div style="position:absolute;bottom:380px;left:64px;right:64px;"><p style="font-family:'+SANS+';font-size:36px;color:rgba(255,255,255,0.9);margin:0;'+S+'">Click the link below to sign up.</p><p style="font-family:'+SANS+';font-size:30px;color:rgba(255,255,255,0.85);margin:20px 0 0;'+S+'">Casting now. Limited spots.</p></div>') },
]})

// ── V5: "Swipe through my portfolio." — warm bg, clean prints ──
variations.push({ slug: 'v5-warm-portfolio', slides: [
  { name: '01-hook', html: heroBg(p.a08_3, tag('Shot on film', 64, 60) + heading('Looking for<br/>models in Bali.', 540) + subtext('Sign up if you want<br/>photos like this.', 420, 44)) },
  { name: '02', html: warmBg(darkTag('@madebyaidan', 64, 50) + pr(p.a16, 120, 120, 800, 1000, -0.5, 20)) },
  { name: '03', html: warmBg(pr(p.a09, 60, 80, 440, 580, -3, 14) + pr(p.a12, 500, 100, 480, 620, 2, 14) + pr(p.a03, 180, 720, 680, 500, 1, 16)) },
  { name: '04', html: warmBg(darkTag('Film photography', 64, 50) + pr(p.a05_3, 100, 100, 840, 700, -0.8, 18) + pr(p.a06_12, 160, 860, 460, 580, 2.5, 14) + pr(p.a13_7, 540, 880, 400, 520, -2, 14)) },
  { name: '05', html: heroBg(p.a04, heading('Imagine<br/>yourself here.', 420, 96)) },
  { name: '06', html: warmBg(pr(p.a41_6, 60, 80, 480, 620, 3, 14) + pr(p.a42_11, 460, 60, 520, 660, -2, 14) + pr(p.a15_8, 120, 740, 520, 660, -2.5, 14) + pr(p.a14_5, 500, 780, 480, 600, 2.5, 14)) },
  { name: '07', html: warmBg(darkTag('Directed. Edited. Delivered.', 64, 50) + pr(p.a10_11, 80, 120, 880, 700, 0.5, 20) + pr(p.a62_7, 200, 880, 600, 480, -1, 16)) },
  { name: '08', html: heroBg(p.a66_5, heading('This could<br/>be you.', 440, 96) + subtext('TFP. I handle everything.', 380)) },
  { name: '09', html: warmBg(pr(p.a65_10, 40, 60, 460, 600, -3.5, 14) + pr(p.a63, 480, 80, 500, 640, 2, 14) + pr(p.a67_9, 140, 720, 540, 680, 2, 16) + pr(p.a43_11, 520, 760, 460, 580, -3, 14) + '<div style="position:absolute;bottom:100px;left:64px;right:64px;text-align:center;"><p style="font-family:'+SERIF+';font-size:40px;font-weight:700;font-style:italic;color:rgba(0,0,0,0.35);line-height:1.1;margin:0;">Your photos could be here.</p></div>') },
  { name: '10-cta', html: ctaBg(p.a17_4, heading('Let\u2019s shoot.', 500, 110) + '<div style="position:absolute;bottom:380px;left:64px;right:64px;"><p style="font-family:'+SANS+';font-size:36px;color:rgba(255,255,255,0.9);margin:0;'+S+'">Click the link below to sign up.</p><p style="font-family:'+SANS+';font-size:30px;color:rgba(255,255,255,0.85);margin:20px 0 0;'+S+'">Open for collabs. No experience needed.</p></div>') },
]})

// ── V6: "You + me + Bali." — relationship/partnership energy ──
variations.push({ slug: 'v6-you-me-bali', slides: [
  { name: '01-hook', html: heroBg(p.a03, tag('Shot on film', 64, 60) + heading('Looking for<br/>models in Bali.', 540) + subtext('Sign up if you want<br/>photos like this.', 420, 44)) },
  { name: '02', html: darkBg(tag('What I bring', 64, 50) + fl(p.a16, 80, 120, 900, 700, -0.5) + heading('The eye.<br/>The direction.<br/>The edit.', 280, 64, 'rgba(255,255,255,0.6)')) },
  { name: '03', html: darkBg(tag('What you bring', 64, 50) + fl(p.a41, 80, 120, 900, 700, 0.5) + heading('The face.<br/>The energy.<br/>The vibe.', 280, 64, 'rgba(255,255,255,0.6)')) },
  { name: '04', html: darkBg(tag('What we make', 64, 50) + pr(p.a42_5, 60, 120, 440, 560, -3) + pr(p.a43_4, 460, 100, 520, 660, 2) + pr(p.a62, 140, 720, 520, 660, 2.5) + pr(p.a15_3, 500, 780, 460, 580, -2.5) + heading('Something worth posting.', 100, 48, 'rgba(255,255,255,0.5)')) },
  { name: '05', html: heroBg(p.a44_2, heading('No experience<br/>needed.', 440, 96) + subtext('I direct the entire shoot.', 380)) },
  { name: '06', html: darkBg(pr(p.a45, 80, 80, 560, 720, -2, 16) + pr(p.a46_5, 460, 600, 500, 640, 3) + tag('Recent collabs', 64, 50)) },
  { name: '07', html: heroBg(p.a47_4, subtext('@madebyaidan \u00b7 Film + Digital', 420)) },
  { name: '08', html: darkBg(pr(p.a48_2, 60, 80, 480, 620, 3) + pr(p.a49_4, 460, 60, 520, 660, -2.5) + pr(p.a50_6, 120, 740, 520, 660, -2) + pr(p.a68_2, 500, 760, 480, 600, 3) + subtext('Every shoot is different.', 100)) },
  { name: '09', html: heroBg(p.a10_3, heading('This could<br/>be us.', 440, 100)) },
  { name: '10-cta', html: ctaBg(p.a08_3, heading('Sign up.', 500, 120) + '<div style="position:absolute;bottom:380px;left:64px;right:64px;"><p style="font-family:'+SANS+';font-size:36px;color:rgba(255,255,255,0.9);margin:0;'+S+'">Click the link below to sign up.</p><p style="font-family:'+SANS+';font-size:30px;color:rgba(255,255,255,0.85);margin:20px 0 0;'+S+'">Send your look. Let\u2019s plan something.</p></div>') },
]})

// ── V7: "Proof, not promises." — heavy proof, numbers ──
variations.push({ slug: 'v7-proof-not-promises', slides: [
  { name: '01-hook', html: heroBg(p.a05_3, tag('35mm film', 64, 60) + heading('I\u2019m looking for<br/>models in Bali.', 540) + subtext('Sign up if you want<br/>photos like this.', 420, 44)) },
  { name: '02', html: darkBg(pr(p.a16, 60, 80, 920, 720, -0.5, 18) + heading('50+ collaborations<br/>across Asia.', 280, 56, 'rgba(255,255,255,0.5)')) },
  { name: '03', html: darkBg(pr(p.a09, 40, 60, 460, 580, -4) + pr(p.a12, 480, 40, 520, 660, 2.5) + pr(p.a03, 60, 680, 480, 600, 2) + pr(p.a14_3, 480, 700, 500, 640, -2) + tag('All real. All mine.', 64, 50)) },
  { name: '04', html: heroBg(p.a13_3, tag('Film', 64, 60)) },
  { name: '05', html: darkBg(pr(p.a04, 60, 60, 440, 560, 3.5) + pr(p.a01_8, 460, 40, 520, 660, -2) + pr(p.a17_4, 80, 660, 520, 660, -2.5) + pr(p.a11_4, 500, 700, 480, 600, 3) + subtext('Every shoot directed by me.', 120)) },
  { name: '06', html: heroBg(p.a41, tag('Digital', 64, 60)) },
  { name: '07', html: darkBg(pr(p.a42_5, 40, 60, 480, 620, -3) + pr(p.a62, 460, 80, 540, 680, 2) + pr(p.a45, 100, 720, 560, 720, 2) + pr(p.a66_5, 520, 780, 460, 580, -3) + tag('Fashion. Street. Intimate. Nature.', 64, 50)) },
  { name: '08', html: heroBg(p.a43_11, heading('No experience<br/>required.', 440, 88) + subtext('First-timers welcome. I handle everything.', 380)) },
  { name: '09', html: darkBg(pr(p.a67_9, 80, 80, 880, 700, 0.5, 20) + heading('Your turn.', 280, 88, 'rgba(255,255,255,0.6)') + subtext('TFP. We both build our portfolios.', 220)) },
  { name: '10-cta', html: ctaBg(p.a15_3, heading('Sign up.', 500, 120) + '<div style="position:absolute;bottom:380px;left:64px;right:64px;"><p style="font-family:'+SANS+';font-size:36px;color:rgba(255,255,255,0.9);margin:0;'+S+'">Click the link below to sign up.</p><p style="font-family:'+SANS+';font-size:30px;color:rgba(255,255,255,0.85);margin:20px 0 0;'+S+'">Spots open now.</p></div>') },
]})

// ── V8: "Looking for interesting faces." — casting director energy ──
variations.push({ slug: 'v8-interesting-faces', slides: [
  { name: '01-hook', html: heroBg(p.a16, tag('Shot on film', 64, 60) + heading('Looking for<br/>models in Bali.', 540) + subtext('Sign up if you want<br/>photos like this.', 420, 44)) },
  { name: '02', html: darkBg(fl(p.a08_3, 40, 40, 1000, 800, 0) + heading('Not perfect.<br/>Interesting.', 200, 72, 'rgba(255,255,255,0.55)')) },
  { name: '03', html: darkBg(pr(p.a03, 60, 80, 460, 580, -3) + pr(p.a42_5, 460, 60, 520, 660, 2) + pr(p.a13_3, 80, 700, 500, 640, 2.5) + pr(p.a62, 480, 740, 480, 600, -2) + tag('People I\u2019ve shot', 64, 50)) },
  { name: '04', html: heroBg(p.a04, heading('Freckles.<br/>Tattoos.<br/>Character.', 380, 88)) },
  { name: '05', html: darkBg(pr(p.a41_3, 60, 60, 560, 720, -1.5, 16) + pr(p.a66_2, 440, 580, 520, 660, 2.5) + tag('I love flaws', 64, 50)) },
  { name: '06', html: heroBg(p.a01, subtext('Shot on 35mm film \u00b7 @madebyaidan', 420)) },
  { name: '07', html: darkBg(pr(p.a17_4, 40, 60, 480, 620, 3.5) + pr(p.a15_3, 460, 40, 540, 680, -2) + pr(p.a10_11, 80, 720, 520, 660, -2.5) + pr(p.a48_2, 480, 740, 500, 620, 3) + heading('Real people.<br/>Real photos.', 100, 52, 'rgba(255,255,255,0.5)')) },
  { name: '08', html: heroBg(p.a44_4, heading('No modeling<br/>experience<br/>needed.', 380, 80) + subtext('I direct the whole thing.', 320)) },
  { name: '09', html: darkBg(fl(p.a09, 80, 80, 920, 720, 0) + fl(p.a05_3, 60, 860, 460, 580, -2) + fl(p.a68_9, 460, 900, 540, 680, 2) + subtext('This could be you.', 80)) },
  { name: '10-cta', html: ctaBg(p.a14_3, heading('Sign up.', 500, 120) + '<div style="position:absolute;bottom:380px;left:64px;right:64px;"><p style="font-family:'+SANS+';font-size:36px;color:rgba(255,255,255,0.9);margin:0;'+S+'">Click the link below to sign up.</p><p style="font-family:'+SANS+';font-size:30px;color:rgba(255,255,255,0.85);margin:20px 0 0;'+S+'">Show me your face. I\u2019ll show you what I can do with it.</p></div>') },
]})

// ── V9: "Free content. Real quality." — value proposition forward ──
variations.push({ slug: 'v9-free-content', slides: [
  { name: '01-hook', html: heroBg(p.a12, tag('35mm film \u00b7 Bali', 64, 60) + heading('Looking for<br/>models in Bali.', 540) + subtext('Sign up if you want<br/>photos like this.', 420, 44)) },
  { name: '02', html: darkBg(tag('Here\u2019s what you get', 64, 50) + '<div style="position:absolute;top:120px;left:64px;right:64px;"><p style="font-family:'+SERIF+';font-size:64px;font-weight:700;font-style:italic;color:white;line-height:1.15;margin:0;'+S+'">Edited photos<br/>for your portfolio,<br/>socials, or agency.</p><p style="font-family:'+SANS+';font-size:30px;color:rgba(255,255,255,0.45);margin:36px 0 0;'+S+'">Full creative direction.<br/>No cost. No catch.</p></div>' + pr(p.a16, 120, 760, 800, 640, -0.5, 18)) },
  { name: '03', html: darkBg(pr(p.a42_5, 40, 60, 480, 620, -3) + pr(p.a05_3, 460, 40, 540, 680, 2) + pr(p.a41, 80, 720, 520, 660, 2) + pr(p.a15_3, 500, 740, 480, 600, -2.5) + tag('Recent work \u00b7 Shot on film', 64, 50)) },
  { name: '04', html: heroBg(p.a03, heading('I handle<br/>everything.', 440, 96) + subtext('Posing. Lighting. Location. Editing.', 380)) },
  { name: '05', html: darkBg(pr(p.a09, 60, 60, 560, 720, -1.5, 16) + pr(p.a14_3, 440, 580, 540, 680, 2.5) + subtext('All shot on 35mm film.', 120)) },
  { name: '06', html: heroBg(p.a43_4, tag('@madebyaidan', 64, 60)) },
  { name: '07', html: darkBg(pr(p.a04, 60, 60, 440, 560, 3) + pr(p.a66_5, 440, 40, 540, 680, -2) + pr(p.a48_11, 80, 660, 520, 660, -2.5) + pr(p.a01_8, 500, 700, 480, 600, 3.5) + heading('Different people.<br/>Same quality.', 100, 48, 'rgba(255,255,255,0.5)')) },
  { name: '08', html: heroBg(p.a10_11, heading('No experience<br/>needed.', 440, 96) + subtext('First-timers especially welcome.', 380)) },
  { name: '09', html: darkBg(fl(p.a62, 60, 60, 960, 760, 0) + heading('This could<br/>be you.', 240, 80) + subtext('TFP \u00b7 We both get content.', 180)) },
  { name: '10-cta', html: ctaBg(p.a17_4, heading('Let\u2019s do it.', 500, 110) + '<div style="position:absolute;bottom:380px;left:64px;right:64px;"><p style="font-family:'+SANS+';font-size:36px;color:rgba(255,255,255,0.9);margin:0;'+S+'">Click the link below to sign up.</p><p style="font-family:'+SANS+';font-size:30px;color:rgba(255,255,255,0.85);margin:20px 0 0;'+S+'">Free. Professional. No strings.</p></div>') },
]})

// ── V10: "My camera, your story." — emotional/storytelling angle ──
variations.push({ slug: 'v10-your-story', slides: [
  { name: '01-hook', html: heroBg(p.a17_4, tag('Shot on film', 64, 60) + heading('I\u2019m looking for<br/>models in Bali.', 540) + subtext('Sign up if you want<br/>photos like this.', 420, 44)) },
  { name: '02', html: darkBg(pr(p.a16, 80, 80, 880, 700, -0.5, 18) + heading('Everyone has<br/>a look worth<br/>capturing.', 240, 56, 'rgba(255,255,255,0.5)')) },
  { name: '03', html: darkBg(pr(p.a09, 40, 60, 460, 580, -4) + pr(p.a08_3, 460, 40, 540, 680, 2.5) + pr(p.a13_3, 80, 680, 500, 640, 2) + pr(p.a03, 480, 700, 480, 600, -2) + tag('Stories I\u2019ve told', 64, 50)) },
  { name: '04', html: heroBg(p.a42_5, heading('She was<br/>nervous.<br/>Didn\u2019t matter.', 380, 80)) },
  { name: '05', html: darkBg(pr(p.a12, 60, 60, 560, 720, -2, 16) + pr(p.a04, 420, 580, 540, 680, 2.5) + subtext('I direct every frame.', 120)) },
  { name: '06', html: heroBg(p.a44_2, heading('First shoot<br/>ever.<br/>Couldn\u2019t tell.', 380, 80)) },
  { name: '07', html: darkBg(pr(p.a62, 40, 60, 480, 620, 3) + pr(p.a45, 460, 40, 540, 680, -2.5) + pr(p.a41_3, 80, 720, 520, 660, -2) + pr(p.a66_2, 500, 740, 480, 600, 3) + tag('No experience needed', 64, 50)) },
  { name: '08', html: heroBg(p.a15_3, heading('Your turn.', 440, 120) + subtext('TFP. Free content. Real quality.', 380)) },
  { name: '09', html: darkBg(fl(p.a10_11, 40, 40, 1000, 800, 0) + fl(p.a68_2, 60, 900, 480, 620, -2) + fl(p.a49_4, 460, 920, 540, 680, 2) + subtext('Your photos could be here.', 80)) },
  { name: '10-cta', html: ctaBg(p.a05_3, heading('Let\u2019s<br/>collaborate.', 500, 100) + '<div style="position:absolute;bottom:380px;left:64px;right:64px;"><p style="font-family:'+SANS+';font-size:36px;color:rgba(255,255,255,0.9);margin:0;'+S+'">Click the link below to sign up.</p><p style="font-family:'+SANS+';font-size:30px;color:rgba(255,255,255,0.85);margin:20px 0 0;'+S+'">Send me your face. I\u2019ll handle the rest.</p></div>') },
]})

// ============================================================
// RENDER
// ============================================================

async function render() {
  const allSlides = []
  for (const v of variations) {
    const dir = path.join(BASE_OUT, v.slug)
    fs.mkdirSync(dir, { recursive: true })
    for (const slide of v.slides) {
      allSlides.push({ ...slide, name: v.slug + '-' + slide.name, dir: v.slug })
    }
  }

  console.log(`Rendering ${allSlides.length} slides across ${variations.length} variations...`)
  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 })

  for (let i = 0; i < allSlides.length; i++) {
    const slide = allSlides[i]
    const page = await context.newPage()
    await page.setContent(`<!doctype html><html><head><style>
      * { box-sizing: border-box; }
      html, body { margin: 0; width: 1080px; height: 1920px; background: #000; overflow: hidden; }
      body { -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; }
    </style></head><body>${slide.html}</body></html>`, { waitUntil: 'load' })
    await page.waitForTimeout(500)
    await page.screenshot({ path: path.join(BASE_OUT, slide.dir, slide.name + '.png'), type: 'png' })
    await page.close()
    console.log(`  [${i + 1}/${allSlides.length}] ${slide.name}`)
  }

  await browser.close()
  console.log(`\nDone — ${allSlides.length} slides -> ${BASE_OUT}`)
}

render()
