import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

// COAST STORY v2i — Kaş / Fethiye / Çıralı decks cloned from output-antalya-story-v2i
// (the athens/antalya story-v2h layout: hook · work · about · nervous · proof · casting · how · cta),
// re-cast with Aidan's own coastal frames (Bali rock coves, surf/cliff series, pebble coves,
// lighthouse rocks, coracle-boat beach) instead of the Manila city set.
//
// Three deck styles per city:
//   a  "original"  — the exact v2i 8-slide layout, every photo swapped for a coastal one
//   b  "by the sea" — creative: handwritten hook, full-canvas 2×3 sea grid, "where we'd shoot"
//                     (three real spots per town), "what to wear", handwritten CTA
//   c  "postcard"  — shorter 5-slide deck: one big matted print as the hook, a print strip,
//                     two-print reassurance, how it works, CTA
//
// Copy rules kept from the casting callouts: "free" appears in the offer name only, no dates,
// no car, no "act now". Location is the BIG headline on every hook.
//
// Usage: node render-coast-story-v2i.mjs [--city=kas|fethiye|cirali] [--variant=a|b|c] [--only=NN-name]
//        [--lang=en|tr|en,tr] [--cta=signup|dm|signup,dm]   (variant a only; b/c are en + signup)
//   output folder: <city>-<variant> for en/signup, otherwise <city>-<variant>-<lang>-<cta>
//   default renders every city × every variant into output-coast-story-v2i/<city>-<variant>/

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ARG = k => process.argv.find(a => a.startsWith(`--${k}=`))?.split('=')[1]
const ONLY_CITY = ARG('city'), ONLY_VARIANT = ARG('variant'), ONLY = ARG('only')
// --lang=en|tr and --cta=signup|dm apply to variant a (the v2i layout); comma lists render every combo.
const LANGS = (ARG('lang') || 'en').split(','), CTAS = (ARG('cta') || 'signup').split(',')

const IMG = '/Users/aidantorrence/Documents/aidan-modern/public/images'
const enc = p => 'data:image/jpeg;base64,' + fs.readFileSync(p).toString('base64')
// JPEG SOF parser → native pixel size, so prints keep their own aspect (no crops)
function dim(p) {
  const b = fs.readFileSync(p); let i = 2
  while (i < b.length) {
    if (b[i] !== 0xff) throw new Error(`bad jpeg ${p}`)
    const m = b[i + 1]
    if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return { w: b.readUInt16BE(i + 7), h: b.readUInt16BE(i + 5) }
    i += 2 + b.readUInt16BE(i + 2)
  }
  throw new Error(`no SOF in ${p}`)
}
const cache = new Map()
const photo = rel => {
  if (!cache.has(rel)) { const p = path.join(IMG, rel); cache.set(rel, { src: enc(p), ...dim(p) }) }
  return cache.get(rel)
}
const L = f => photo(`large/${f}`), FV = f => ({ ...photo(`faves/${f}`), scan: true }), Sf = f => photo(`self/${f}`)

const SE = "Georgia, 'Times New Roman', serif"
const RD = "'Poppins', 'Arial Rounded MT Bold', sans-serif"
const HW = "'Caveat', 'Bradley Hand', cursive"
const SH = 'text-shadow:0 2px 8px rgba(0,0,0,0.85),0 12px 50px rgba(0,0,0,0.6);'

const FDIR = path.join(__dirname, 'fonts')
const fontB64 = f => fs.readFileSync(path.join(FDIR, f)).toString('base64')
const face = (fam, file, weight) => `@font-face{font-family:'${fam}';font-weight:${weight};font-style:normal;font-display:block;src:url(data:font/woff2;base64,${fontB64(file)}) format('woff2');}`
const FONTCSS = [face('Poppins', 'poppins-700.woff2', '700'), face('Caveat', 'caveat-700.woff2', '700')].join('')

// ---- helpers (same as the v2h story renderer) ----
const BADGE_BG = `<div style="position:absolute;top:0;right:0;width:620px;height:300px;z-index:55;pointer-events:none;background:radial-gradient(125% 125% at 100% 0%,rgba(0,0,0,0.6) 0%,rgba(0,0,0,0.3) 40%,transparent 70%);"></div>`
const grain = (o = 0.06) => `<div style="position:absolute;inset:0;pointer-events:none;opacity:${o};mix-blend-mode:soft-light;background-image:radial-gradient(circle at 14% 18%,rgba(255,255,255,0.5),transparent 17%),radial-gradient(circle at 84% 12%,rgba(255,255,255,0.28),transparent 15%),repeating-linear-gradient(0deg,rgba(255,255,255,0.08) 0 1px,transparent 1px 4px);"></div>`
const TITLE = (txt, size = 64) => `<p style="font-family:${SE};font-style:italic;font-size:${size}px;font-weight:700;color:#fff;margin:0;line-height:1.0;">${txt}</p>`
const SUB = (txt, size = 35, top = 20) => `<p style="font-family:${SE};font-size:${size}px;font-style:italic;color:rgba(255,255,255,0.85);margin:${top}px 0 0;line-height:1.3;">${txt}</p>`
const cap = (big, small, pos = 'top:1120px') => `<div style="position:absolute;${pos};left:64px;right:64px;text-align:center;">
   <p style="font-family:${SE};font-style:italic;font-size:64px;font-weight:700;color:#fff;margin:0;line-height:1.02;${SH}">${big}</p>
   ${small ? `<p style="font-family:${SE};font-size:35px;font-style:italic;color:rgba(255,255,255,0.92);margin:18px 0 0;line-height:1.3;${SH}">${small}</p>` : ''}
 </div>`
const proofScrim = 'linear-gradient(180deg,transparent 0%,transparent 40%,rgba(0,0,0,0.5) 60%,rgba(0,0,0,0.92) 100%)'
const shadow = 'box-shadow:0 16px 44px rgba(0,0,0,0.55),0 3px 10px rgba(0,0,0,0.3);'
// matted film print at native aspect: width given, height derived
const pr = (ph, l, t, w, rot) => { const h = Math.round(w * ph.h / ph.w); return `<div style="position:absolute;left:${l}px;top:${t}px;width:${w + 24}px;height:${h + 26}px;background:#fafafa;padding:12px 12px 14px;transform:rotate(${rot}deg);${shadow}"><img src="${ph.src}" style="width:${w}px;height:${h}px;object-fit:cover;object-position:center;display:block;"/></div>` }
// borderless print at native aspect (scans keep their own film borders)
const prx = (ph, l, t, w, rot) => { const h = Math.round(w * ph.h / ph.w); return `<div style="position:absolute;left:${l}px;top:${t}px;width:${w}px;height:${h}px;transform:rotate(${rot}deg);${shadow}"><img src="${ph.src}" style="width:${w}px;height:${h}px;object-fit:cover;object-position:center;display:block;"/></div>` }
// cover tile (crops) for grids
const tile = (ph, l, t, w, h, pos = 'center 30%') => `<img src="${ph.src}" style="position:absolute;left:${l}px;top:${t}px;width:${w}px;height:${h}px;object-fit:cover;object-position:${pos};display:block;"/>`

// ---- cities: three real spots each, and the per-city photo slots ----
const CITIES = {
  kas: {
    name: 'Kaş', tr: { in: "Kaş'ta", inAm: "Kaş'tayım" }, spots: ['Küçükçakıl and the little coves', 'the harbour at golden hour', 'the old town lanes'],
    hookA: () => L('000032-5.jpg'), castingA: () => L('000021.jpg'), ctaA: () => FV('DSC_0956.jpg'),
    hookB: () => L('000013.jpg'), whereB: () => L('000023-5.jpg'), ctaB: () => FV('DSC_0945.jpg'),
    heroC: () => L('000029.jpg'), ctaC: () => L('000020.jpg'),
  },
  fethiye: {
    name: 'Fethiye', tr: { in: "Fethiye'de", inAm: "Fethiye'deyim" }, spots: ['Ölüdeniz and the lagoon', 'Çalış beach at sunset', 'Paspatur, the old town'],
    hookA: () => L('aidanto-r4-047-22.jpg'), castingA: () => L('000041-10.jpg'), ctaA: () => L('aidanto-r2-035-16.jpg'),
    hookB: () => L('0604804-0043.jpg'), whereB: () => L('000044-10.jpg'), ctaB: () => L('aidanto-r4-051-24.jpg'),
    heroC: () => L('aidanto-r4-063-30.jpg'), ctaC: () => L('0604804-0053.jpg'),
  },
  cirali: {
    name: 'Çıralı', tr: { in: "Çıralı'da", inAm: "Çıralı'dayım" }, spots: ['the beach at first light', 'the Olympos ruins', 'the pines along the river'],
    hookA: () => L('aidanto-r4-053-25.jpg'), castingA: () => FV('DSC_0316.jpg'), ctaA: () => L('000047-10.jpg'),
    hookB: () => FV('DSC_0314.jpg'), whereB: () => L('000041-6.jpg'), ctaB: () => FV('DSC_0310-2.jpg'),
    heroC: () => L('aidanto-r4-059-28.jpg'), ctaC: () => L('000040-10.jpg'),
  },
}

// ---- copy for the v2i layout (variant a). TR wording = the Antalya TR deck (output-antalya-tr-story-v2i). ----
const COPY = {
  en: {
    badge: 'FREE PHOTO SHOOT', hookTitle: 'Free Photo Shoot.', hookSub: 'Want photos like these? →',
    work: 'my recent work', about: 'about me',
    about1: "hi, i'm aidan — a photographer from the USA. for the past 3 years i've been traveling the world shooting film.",
    about2: c => `right now i'm in Turkey, and i'm shooting in ${c.name}.`,
    about3: "if you're here, let's make something special.",
    nervous: 'never done this before?', nervousSub: "don't worry — i'll direct you through every frame.",
    proof: 'shot on 35mm film', casting: c => `now in ${c.name}`, castingSub: "it's totally free",
    how: 'how it works',
    steps: { signup: [['1', 'Sign up', 'Tap the link below — takes a minute.']], dm: [['1', 'DM me', 'Send me a message on Instagram — takes a minute.']] },
    steps23: [['2', 'We plan it', 'A quick chat to pick the spot, time & look.'], ['3', 'We shoot', 'About an hour. I direct every frame.']],
    cta: { signup: ['Want in?', 'Sign up below.'], dm: ['Interested?', 'DM me.'] },
    ctaLine: c => `I'm only in ${c.name} for a short time — let's shoot.`,
  },
  tr: {
    badge: 'ÜCRETSİZ FOTOĞRAF ÇEKİMİ', hookTitle: 'Ücretsiz Fotoğraf Çekimi', hookTitleSize: 66, hookSub: 'Böyle fotoğraflar ister misin? →',
    work: 'son çalışmalarım', about: 'hakkımda',
    about1: 'selam, ben aidan — ABD\'li bir fotoğrafçıyım. son 3 yıldır dünyayı gezip film ile fotoğraf çekiyorum.',
    about2: c => `şu an Türkiye'deyim ve ${c.tr.in} çekim yapıyorum.`,
    about3: 'sen de buradaysan, birlikte özel bir şey yaratalım.',
    nervous: 'daha önce hiç çekilmedin mi?', nervousSub: 'merak etme — her karede seni ben yönlendiririm.',
    proof: '35mm film ile çekildi', casting: c => `şu an ${c.tr.inAm}`, castingSub: 'tamamen ücretsiz',
    how: 'nasıl işliyor?',
    steps: { signup: [['1', 'Kaydol', 'Aşağıdaki linke tıkla — bir dakika sürer.']], dm: [['1', 'Bana yaz', "Instagram'dan DM at — bir dakika sürer."]] },
    steps23: [['2', 'Planlayalım', 'Kısa bir sohbetle yeri, zamanı ve tarzı seçeriz.'], ['3', 'Çekelim', 'Yaklaşık bir saat. Her kareyi ben yönlendiririm.']],
    cta: { signup: ['Var mısın?', 'Aşağıdan kaydol.'], dm: ['ilgileniyorsan', 'DM at.'] /* lowercase: Caveat lacks a dotted capital İ */ },
    ctaLine: c => `${c.tr.in} sadece kısa bir süre kalacağım — hadi çekelim.`,
  },
}

function build(city, variant, lang = 'en', cta = 'signup') {
  const { name, spots } = city
  const T = COPY[lang]
  const BADGE = `<div style="position:absolute;top:52px;right:54px;z-index:60;text-align:right;text-shadow:0 2px 12px rgba(0,0,0,0.95),0 1px 3px rgba(0,0,0,0.9);">
  <div style="font-family:${SE};font-size:50px;font-weight:700;letter-spacing:0.15em;color:#fff;line-height:1;">${name.toUpperCase()}</div>
  <div style="display:flex;align-items:center;justify-content:flex-end;gap:15px;margin-top:13px;">
    <span style="width:70px;height:2px;background:rgba(255,255,255,0.8);display:inline-block;"></span>
    <span style="font-family:${RD};font-size:22px;font-weight:600;letter-spacing:0.28em;color:#fff;">${T.badge}</span>
  </div>
</div>`
  const frame = (inner, bg, showBadge = true) => `<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:${bg || '#000'};">${inner}${showBadge ? BADGE_BG + BADGE : ''}</div>`
  // scans from faves/ carry the film rebate (orange frame numbers) on their long edges; a
  // full-bleed 9:16 crop of a 2:3 frame keeps the top/bottom, so zoom those ~8% to lose the rebate
  const bleed = (nm, ph, overlay, scrim, showBadge = true, pos = 'center top') => {
    const sc = scrim || 'linear-gradient(180deg,rgba(0,0,0,0.45) 0%,transparent 30%,transparent 55%,rgba(0,0,0,0.9) 100%)'
    const zoom = ph.scan ? 'transform:scale(1.14);transform-origin:center 42%;' : ''
    return { name: nm, html: frame(`<img src="${ph.src}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:${pos};display:block;filter:saturate(1.06) contrast(1.03);${zoom}"/><div style="position:absolute;inset:0;background:${sc};"></div>${overlay}${grain(0.08)}`, null, showBadge) }
  }
  const dark = (nm, inner) => ({ name: nm, html: frame(inner + grain(), '#0a0a0a') })

  const about = dark('03-about', `
      <div style="position:absolute;top:240px;left:60px;right:60px;text-align:center;">${TITLE(T.about)}</div>
      <div style="position:absolute;top:400px;left:120px;right:120px;text-align:center;">
        <p style="font-family:${SE};font-size:36px;color:rgba(255,255,255,0.94);line-height:1.42;margin:0;">${T.about1}</p>
        <p style="font-family:${SE};font-size:36px;color:rgba(255,255,255,0.94);line-height:1.42;margin:24px 0 0;">${T.about2(city)}</p>
        <p style="font-family:${SE};font-size:36px;color:rgba(255,255,255,0.94);line-height:1.42;margin:24px 0 0;">${T.about3}</p>
      </div>
      <img src="${Sf('aidan-udaipur-mirror-03.jpg').src}" style="position:absolute;left:310px;top:880px;width:460px;height:631px;object-fit:cover;object-position:center top;display:block;border-radius:28px;border:12px solid #fafafa;${shadow}"/>`)
  const how = (nm = '07-how') => dark(nm, `
      <div style="position:absolute;top:250px;left:60px;right:60px;text-align:center;">${TITLE(T.how)}</div>
      <div style="position:absolute;top:500px;left:120px;right:120px;">
        ${[...T.steps[cta], ...T.steps23].map(s => `<div style="display:flex;gap:30px;align-items:flex-start;margin:0 0 58px;"><span style="font-family:${SE};font-size:78px;font-weight:700;color:rgba(255,255,255,0.5);line-height:0.9;width:70px;flex:none;">${s[0]}</span><div><p style="font-family:${SE};font-size:44px;font-weight:700;color:#fff;margin:0;line-height:1.1;">${s[1]}</p><p style="font-family:${SE};font-size:30px;font-style:italic;color:rgba(255,255,255,0.72);margin:10px 0 0;line-height:1.35;">${s[2]}</p></div></div>`).join('')}
      </div>`)
  const ctaHand = (nm, ph, line, lines = T.cta[cta]) => bleed(nm, ph,
    `<div style="position:absolute;top:980px;left:64px;right:64px;text-align:center;">
       <p style="font-family:${HW};font-size:138px;font-weight:700;color:#fff;margin:0;line-height:0.95;${SH}">${lines[0]}</p>
       <p style="font-family:${HW};font-size:138px;font-weight:700;color:#fff;margin:0;line-height:0.95;${SH}">${lines[1]}</p>
       <p style="font-family:${SE};font-size:34px;color:rgba(255,255,255,0.9);margin:34px 0 0;${SH}">${line}</p>
     </div>`, proofScrim)

  const slides = []

  if (variant === 'a') {
    // ---- A: the v2i layout, coastal photos ----
    slides.push(bleed('01-hook', city.hookA(),
      `<div style="position:absolute;bottom:300px;left:64px;right:64px;text-align:center;">
         <p style="font-family:${SE};font-size:150px;font-weight:700;font-style:italic;color:#fff;margin:0;line-height:0.88;${SH}">${name}</p>
         <p style="font-family:${SE};font-size:80px;font-weight:700;font-style:italic;color:#fff;margin:10px 0 0;line-height:0.98;white-space:nowrap;font-size:${T.hookTitleSize || 80}px;${SH}">${T.hookTitle}</p>
         <p style="font-family:${SE};font-size:33px;font-style:italic;color:rgba(255,255,255,0.85);margin:30px 0 0;${SH}">${T.hookSub}</p>
       </div>`, undefined, false))
    slides.push(dark('02-work', `
        <div style="position:absolute;top:200px;left:60px;right:60px;text-align:center;">${TITLE(T.work)}</div>
        ${pr(FV('DSC_0310-2.jpg'), 45, 470, 350, -5)}
        ${pr(L('000013.jpg'), 615, 430, 370, 4)}
        ${pr(L('aidanto-r4-027-12.jpg'), 100, 1060, 360, 3)}
        ${pr(L('000030-5.jpg'), 605, 1075, 370, -4)}
        ${pr(L('0604804-0050.jpg'), 360, 745, 340, 2)}`))
    slides.push(about)
    slides.push(dark('04-nervous', `
        <div style="position:absolute;top:220px;left:64px;right:64px;text-align:center;">${TITLE(T.nervous, 60)}${SUB(T.nervousSub)}</div>
        ${prx(FV('DSC_0321.jpg'), 45, 500, 350, -5)}
        ${prx(FV('DSC_0480.jpg'), 615, 460, 370, 4)}
        ${prx(L('000023.jpg'), 100, 1080, 360, 3)}
        ${prx(L('000024.jpg'), 605, 1090, 370, -4)}
        ${prx(L('aidanto-r4-051-24.jpg'), 360, 775, 340, 2)}`))
    slides.push(bleed('05-proof', L('aidanto-r4-061-29.jpg'), cap(T.proof, ''), proofScrim, true, 'center 20%'))
    slides.push(dark('06-casting', `
      <div style="position:absolute;top:240px;left:60px;right:60px;text-align:center;">${TITLE(T.casting(city))}${SUB(T.castingSub, 38, 24)}</div>
      ${prx(city.castingA(), 178, 620, 700, -1.5)}`))
    slides.push(how())
    slides.push(ctaHand('08-cta', city.ctaA(), T.ctaLine(city)))
  }

  if (variant === 'b') {
    // ---- B: "by the sea" creative deck ----
    slides.push(bleed('01-hook', city.hookB(),
      `<div style="position:absolute;bottom:280px;left:64px;right:64px;text-align:center;">
         <p style="font-family:${HW};font-size:190px;font-weight:700;color:#fff;margin:0;line-height:0.85;${SH}">${name}</p>
         <p style="font-family:${SE};font-size:70px;font-weight:700;font-style:italic;color:#fff;margin:14px 0 0;line-height:1;${SH}">free photo shoot</p>
         <p style="font-family:${SE};font-size:33px;font-style:italic;color:rgba(255,255,255,0.85);margin:30px 0 0;${SH}">by the sea, on 35mm film →</p>
       </div>`, undefined, false))
    {
      const g = [FV('DSC_0310-2.jpg'), L('aidanto-r4-061-29.jpg'), L('000032-5.jpg'), FV('DSC_0480.jpg'), L('aidanto-r4-047-22.jpg'), L('000023.jpg')]
      const W = 540, H = 640
      const grid = g.map((ph, i) => tile(ph, (i % 2) * W, Math.floor(i / 2) * H, W, H)).join('')
      slides.push({ name: '02-sea', html: frame(`${grid}
        <div style="position:absolute;inset:0;background:radial-gradient(60% 30% at 50% 50%,rgba(0,0,0,0.78) 0%,rgba(0,0,0,0.55) 55%,transparent 100%);"></div>
        <div style="position:absolute;top:0;left:0;right:0;height:300px;background:linear-gradient(180deg,rgba(0,0,0,0.55),transparent);"></div>
        <div style="position:absolute;top:860px;left:64px;right:64px;text-align:center;">
          <p style="font-family:${SE};font-style:italic;font-size:76px;font-weight:700;color:#fff;margin:0;line-height:1;${SH}">my recent work</p>
          <p style="font-family:${SE};font-size:36px;font-style:italic;color:rgba(255,255,255,0.9);margin:18px 0 0;${SH}">all of it by the water</p>
        </div>${grain(0.08)}`) })
    }
    {
      const ph = city.whereB()
      const wide = ph.w > ph.h
      const w = wide ? 900 : 520
      const h = Math.round(w * ph.h / ph.w)
      const l = Math.round((1080 - w) / 2)
      slides.push(dark('03-where', `
        <div style="position:absolute;top:220px;left:60px;right:60px;text-align:center;">${TITLE("where we'd shoot")}${SUB('a few ideas — or your favourite spot')}</div>
        <div style="position:absolute;top:470px;left:130px;right:100px;">
          ${spots.map((s, i) => `<div style="display:flex;gap:26px;align-items:baseline;margin:0 0 30px;"><span style="font-family:${SE};font-size:44px;font-weight:700;color:rgba(255,255,255,0.45);width:56px;flex:none;">${i + 1}</span><p style="font-family:${SE};font-size:42px;font-style:italic;color:#fff;margin:0;line-height:1.2;">${s}</p></div>`).join('')}
        </div>
        ${pr(ph, l, 1920 - h - 200, w, wide ? 1.5 : -2)}`))
    }
    slides.push({ ...about, name: '04-about' })
    slides.push(dark('05-wear', `
        <div style="position:absolute;top:220px;left:60px;right:60px;text-align:center;">${TITLE('what to wear')}${SUB('light layers. flowing clothes. beach light.')}</div>
        ${pr(L('aidanto-r4-053-25.jpg'), 60, 560, 440, -3)}
        ${pr(L('aidanto-r2-013-5.jpg'), 560, 620, 440, 3)}
        <div style="position:absolute;top:1480px;left:64px;right:64px;text-align:center;">${SUB('we plan the styling together — you bring what you love.', 34, 0)}</div>`))
    slides.push(how('06-how'))
    slides.push(ctaHand('07-cta', city.ctaB(), `${name}, for a short while — let's make something by the sea.`, COPY.en.cta.signup))
  }

  if (variant === 'c') {
    // ---- C: "postcard" short deck ----
    {
      const ph = city.heroC()
      const w = 760, h = Math.round(w * ph.h / ph.w)
      slides.push({ name: '01-hook', html: frame(`
        ${pr(ph, 160 - 12, 150, w, -2)}
        <div style="position:absolute;top:${150 + h + 90}px;left:64px;right:64px;text-align:center;">
          <p style="font-family:${HW};font-size:150px;font-weight:700;color:#fff;margin:0;line-height:0.9;">${name}, on film.</p>
          <p style="font-family:${SE};font-size:44px;font-weight:700;font-style:italic;color:#fff;margin:26px 0 0;line-height:1.1;">free photo shoot</p>
          <p style="font-family:${SE};font-size:32px;font-style:italic;color:rgba(255,255,255,0.8);margin:22px 0 0;">want in? →</p>
        </div>${grain()}`, '#0a0a0a', false) })
    }
    slides.push(dark('02-work', `
        <div style="position:absolute;top:200px;left:60px;right:60px;text-align:center;">${TITLE('my recent work')}${SUB('shot on 35mm film')}</div>
        ${pr(FV('DSC_0316.jpg'), 30, 540, 330, -4)}
        ${pr(L('aidanto-r4-027-12.jpg'), 375, 500, 330, 1)}
        ${pr(L('000030-5.jpg'), 720, 560, 330, 4)}
        ${pr(L('000041-10.jpg'), 200, 1130, 330, -2)}
        ${pr(L('aidanto-r4-047-22.jpg'), 550, 1110, 330, 3)}`))
    slides.push(dark('03-nervous', `
        <div style="position:absolute;top:220px;left:64px;right:64px;text-align:center;">${TITLE('never done this before?', 60)}${SUB("don't worry — i'll direct you through every frame.")}</div>
        ${prx(FV('DSC_0321.jpg'), 70, 560, 520, -3)}
        ${prx(L('000021.jpg'), 500, 820, 520, 3)}`))
    slides.push(how('04-how'))
    slides.push(ctaHand('05-cta', city.ctaC(), `I'm only in ${name} for a short time — let's shoot.`, COPY.en.cta.signup))
  }

  return slides
}

async function render() {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 2 })
  const cities = Object.entries(CITIES).filter(([slug]) => !ONLY_CITY || ONLY_CITY.split(',').includes(slug))
  const variants = ['a', 'b', 'c'].filter(v => !ONLY_VARIANT || ONLY_VARIANT.split(',').includes(v))
  if (!cities.length || !variants.length) throw new Error(`nothing matches --city=${ONLY_CITY} --variant=${ONLY_VARIANT}`)
  const combos = []
  for (const variant of variants) {
    if (variant === 'a') for (const lang of LANGS) for (const cta of CTAS) combos.push({ variant, lang, cta })
    else combos.push({ variant, lang: 'en', cta: 'signup' })
  }
  for (const [slug, city] of cities) for (const { variant, lang, cta } of combos) {
    const all = build(city, variant, lang, cta)
    const slides = ONLY ? all.filter(s => s.name === ONLY) : all
    if (!slides.length) throw new Error(`Unknown slide for --only: ${ONLY}`)
    const suffix = lang === 'en' && cta === 'signup' ? '' : `-${lang}-${cta}`
    const dir = path.join(__dirname, 'output-coast-story-v2i', `${slug}-${variant}${suffix}`)
    fs.mkdirSync(dir, { recursive: true })
    if (!ONLY) for (const f of fs.readdirSync(dir)) if (f.toLowerCase().endsWith('.jpg')) fs.rmSync(path.join(dir, f))
    for (const s of slides) {
      const page = await ctx.newPage()
      await page.setContent(`<!doctype html><html><head><style>${FONTCSS}*{box-sizing:border-box}html,body{margin:0;width:1080px;height:1920px;background:#000;overflow:hidden}body{-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}</style></head><body>${s.html}</body></html>`, { waitUntil: 'load' })
      await page.evaluate(() => document.fonts.ready)
      await page.waitForTimeout(300)
      // text must stay inside the canvas and out of the bottom quadrant's safe zone check is visual; here: overflow guard
      const overflow = await page.evaluate(() => [...document.querySelectorAll('p')].filter(p => { const r = p.getBoundingClientRect(); return r.right > 1080 || r.bottom > 1920 || r.left < 0 }).map(p => p.textContent.slice(0, 40)))
      if (overflow.length) console.warn(`  ! text outside canvas on ${slug}-${variant}/${s.name}:`, overflow)
      await page.screenshot({ path: path.join(dir, `${s.name}.jpg`), type: 'jpeg', quality: 92 })
      await page.close()
    }
    console.log(`${city.name} ${variant} ${lang}/${cta}: ${slides.length} slides -> ${path.relative(__dirname, dir)}`)
  }
  await browser.close()
  console.log('Done.')
}
render()
