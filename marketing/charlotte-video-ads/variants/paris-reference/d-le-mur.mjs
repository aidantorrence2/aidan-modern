// D · "le mur" — a moving moodboard wall. Three columns of photos drift in opposite directions on gallery-white; a
// band through the middle carries the copy. On the beat the wall whips (real motion blur: 4 subframes, 180° shutter),
// lands one photo dead centre, and that photo opens to full frame for the CTA.
import path from 'node:path'
import { pageHTML } from '../lib/engine.mjs'
import { faceFocus, HANDLE } from '../lib/common.mjs'

export async function build({ stage, beatOf, ROOT, W, H }) {
  const name = 'd-le-mur'
  const work = path.join(ROOT, 'work', name)
  const { beat, bed } = beatOf('bed-d', 116)
  const PAPER = '#f1ece4', INK = '#151311'
  const GAP = 14, CW = (W - GAP * 4) / 3, COLX = [0, 1, 2].map(i => GAP + i * (CW + GAP))

  const COLS = [
    ['bangkok-dana-11777-neon-500t-35', 'seoul-tokyo-ulaanbaatar-etc-fun-000058-6', 'manila-gallery-garden-002', 'bangkok-lefroncee-000046-4', 'seoul-tokyo-ulaanbaatar-etc-model-000047-6', 'bangkok-pink-old-000042-2', 'r1-05460-0022'],
    ['hk-taiwan-chinese-in-taipei-000018-8', 'seoul-tokyo-ulaanbaatar-etc-arisa-000031', 'bangkok-dana-11777-neon-500t-21', 'manila-gallery-ivy-001', 'bangkok-rosie-11893-250d-ahu-10', 'seoul-tokyo-ulaanbaatar-etc-indian-000019-2', 'korea-russian-000029-3'],
    ['taiwan-philippines-model-0004-4-6', 'manila-gallery-park-001', 'bali-sofiatann2-000004-3', 'seoul-tokyo-ulaanbaatar-etc-fun-000050-6', 'manila-gallery-urban-002', '2026-09-29-000042', 'bangkok-natcha-000070'],
  ]
  const HERO_STEM = 'bangkok-dana-11777-neon-500t-21'
  const assets = {}
  const cols = COLS.map((stems, ci) => {
    let y = 0
    const items = stems.map(stem => {
      const a = assets[stem] || (assets[stem] = stage(work, stem, { long: 1600 }))
      const h = Math.round(CW * a.h / a.w)
      const it = { stem, src: a.src, w: a.w, h: a.h, y, ch: h }
      y += h + GAP
      return it
    })
    return { items, loop: y }
  })
  const hero = stage(work, HERO_STEM)
  const heroFocus = faceFocus(hero)

  // ---- timeline (beats) ----
  const B = x => +(x * beat).toFixed(4)
  const SWAP = B(8), R1 = B(14), LAND = B(18), OPEN = B(19.25), CTA = B(19.75), DUR = B(28)
  const BASE = [-120, 120, -120]       // px/s drift (up, down, up)
  const START = [-260, -900, -60]
  // middle column must land the hero cell centred on y = 960 at LAND
  const mid = cols[1], hi = mid.items.findIndex(i => i.stem === HERO_STEM), hc = mid.items[hi]
  const sBefore = START[1] + BASE[1] * R1                                 // column offset at R1
  // offset(t) = START + S(t); cell centre on screen = offset + hc.y + hc.ch/2 (mod loop) → want 960
  let want = 960 - hc.y - hc.ch / 2 - sBefore
  want = ((want % mid.loop) + mid.loop) % mid.loop
  const SPIN = want + mid.loop * 2                                       // ≥ 2 loops of whip
  const css = `
  html,body{background:${PAPER}}
  .col{position:absolute;top:0;width:${CW}px;height:${H}px;overflow:visible}
  .cell{position:absolute;left:0;width:${CW}px;overflow:hidden;background:#ddd}
  .cell img{position:absolute;left:0;top:0;width:100%;height:100%;object-fit:cover}
  #band{position:absolute;left:0;right:0;background:${PAPER};overflow:hidden}
  .bt{position:absolute;left:0;right:0;text-align:center;color:${INK}}
  .didot{font-family:'Didot','Bodoni 72',serif}
  #hero{position:absolute;overflow:hidden;visibility:hidden}
  #hero img{position:absolute;left:0;top:0;transform-origin:0 0}
  #hshade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0) 46%,rgba(0,0,0,.28) 60%,rgba(0,0,0,.66) 82%,rgba(0,0,0,.7) 100%)}
  #cta{position:absolute;left:70px;right:70px;top:1050px;color:#fff;text-shadow:0 2px 12px rgba(0,0,0,.5)}`
  // each column is rendered 3× (loop copies) so it always fills the frame
  const colHTML = cols.map((c, ci) => `<div class="col" id="col${ci}" style="left:${COLX[ci]}px">${[0, 1, 2, 3].map(r => c.items.map((it, ii) =>
    `<div class="cell${ci === 1 && ii === hi ? ' herocell' : ''}" style="top:${it.y + r * c.loop}px;height:${it.ch}px"><img src="${it.src}"></div>`).join('')).join('')}</div>`).join('')
  const body = `${colHTML}
  <div id="band">
    <div class="bt" id="b1"><div class="didot t" style="font-style:italic;font-size:210px;line-height:1">Paris</div><div class="t" style="font:600 46px system-ui,-apple-system,sans-serif;margin-top:6px;letter-spacing:.01em">je cherche des modèles</div></div>
    <div class="bt" id="b2"><div class="t" style="font:600 40px system-ui,-apple-system,sans-serif;letter-spacing:.3em;text-transform:uppercase">shooting photo</div><div class="didot t" style="font-style:italic;font-size:200px;line-height:1;margin-top:4px">gratuit.</div></div>
  </div>
  <div id="hero"><img src="${hero.src}" width="${hero.w}" height="${hero.h}"><div id="hshade"></div>
    <div id="cta"><div class="didot t" style="font-style:italic;font-size:150px;line-height:.95">écris-moi.</div>
    <div class="t" style="font:600 44px/1.3 system-ui,-apple-system,sans-serif;margin-top:26px">shooting photo gratuit à Paris</div>
    <div class="t" style="font:500 36px system-ui,-apple-system,sans-serif;opacity:.85;margin-top:14px;letter-spacing:.03em">${HANDLE}</div></div></div>`

  const script = `
  const COLS=${JSON.stringify(cols.map(c => ({ loop: c.loop })))}, BASE=${JSON.stringify(BASE)}, START=${JSON.stringify(START)};
  const SWAP=${SWAP}, R1=${R1}, LAND=${LAND}, OPEN=${OPEN}, CTA=${CTA}, DUR=${DUR}, SPIN=${SPIN}, beat=${beat};
  const HC=${JSON.stringify({ x: COLX[1], w: CW, h: hc.ch })}, HI=${JSON.stringify({ w: hero.w, h: hero.h, fx: heroFocus.fx, fy: heroFocus.fy })};
  const $=id=>document.getElementById(id), cols=[0,1,2].map(i=>$('col'+i)), heroCells=[...document.querySelectorAll('.herocell')];
  // Hermite: leaves R1 at drift speed, whips, stops dead at LAND
  function S(i,t){
    const base=BASE[i];
    if(t<=R1) return base*t;
    const T=LAND-R1, D=(i===1?SPIN:Math.sign(base)*SPIN*1.15), u=U.clamp((t-R1)/T), m0=base*T/D;
    const F=(u*u*u-2*u*u+u)*m0+(-2*u*u*u+3*u*u);
    return base*R1 + D*F + (t>LAND ? 0 : 0);
  }
  function off(i,t){ const L=COLS[i].loop; let o=START[i]+S(i,t); o=((o%L)+L)%L; return o-L }   // in [-L,0)
  window.renderFrame=function(t){
    // columns (hold position after landing)
    cols.forEach((c,i)=>{ if(i===1) return; const L=COLS[i].loop, tt=Math.min(t,LAND+0.6); let o=START[i]+S(i,Math.min(tt,LAND)); o=((o%L)+L)%L-L; c.style.transform='translateY('+o+'px)' });
    // the middle column is not wrapped (so the landing is exact); keep its copies on screen by wrapping in whole loops
    { const L=COLS[1].loop, tt=Math.min(t,LAND); let o=START[1]+S(1,tt); const k=Math.floor((o + L)/L); cols[1].style.transform='translateY('+(o-k*L)+'px)' }
    // band: open from a hairline at the start, swap copy on SWAP, close at R1
    const bOpen=U.eo5(U.p(t,-0.2,0.35)), bClose=U.eio(U.p(t,R1-0.25,R1+0.15));
    const bh=360*bOpen*(1-bClose), band=$('band'); band.style.top=(960-bh/2)+'px'; band.style.height=bh+'px';
    const sw=U.eio(U.p(t,SWAP-0.15,SWAP+0.25)), b1=$('b1'), b2=$('b2');
    b1.style.top=(bh/2-b1.offsetHeight/2-8-360*sw)+'px'; b1.style.opacity=1-sw;
    b2.style.top=(bh/2-b2.offsetHeight/2+360*(1-sw))+'px'; b2.style.opacity=sw;
    if(t<SWAP-0.15) $('b2').style.visibility='hidden'; else $('b2').style.visibility='visible';
    if(t>SWAP+0.25) $('b1').style.visibility='hidden'; else $('b1').style.visibility='visible';
    // hero opens from its cell to full frame
    const hero=$('hero'), img=hero.firstChild;
    if(t>=LAND){
      const r=heroCells.map(e=>e.getBoundingClientRect()).sort((a,b)=>Math.abs(a.top+a.height/2-960)-Math.abs(b.top+b.height/2-960))[0], q=U.eio(U.p(t,LAND+0.05,OPEN));
      const x=U.lerp(r.left,0,q), y=U.lerp(r.top,0,q), w=U.lerp(r.width,${W},q), h=U.lerp(r.height,${H},q);
      hero.style.visibility='visible'; hero.style.left=x+'px'; hero.style.top=y+'px'; hero.style.width=w+'px'; hero.style.height=h+'px';
      const z = 1 + 0.05*U.eio(U.p(t,OPEN,DUR+0.6));
      const c=U.cover(HI.w,HI.h,U.lerp(.5,HI.fx,q),U.lerp(.5,HI.fy,q),z,w,h);
      img.style.transform='translate('+c.x+'px,'+c.y+'px) scale('+c.k+')';
      $('hshade').style.opacity=U.eo(U.p(t,OPEN-0.2,CTA+0.3));
      [...$('cta').children].forEach((e,i)=>{const k=U.eo(U.p(t,CTA+i*0.25,CTA+0.5+i*0.25)); e.style.opacity=k; e.style.transform='translateY('+(18*(1-k))+'px)'});
    } else hero.style.visibility='hidden';
  };`
  const html = pageHTML({ css, body, script })
  const events = [
    { t: Math.max(0, R1 - 0.05), file: 'sfx-whoosh-soft.wav', gainDb: -6 },
    { t: LAND - 0.01, file: 'sfx-shutter.wav', gainDb: -5 },
  ]
  // motion blur only where it moves fast: blur length (180° shutter) / ~4 px per sample
  const speed = t => {
    if (t <= R1 || t >= LAND) return t >= LAND && t < OPEN + 0.1 ? 1400 : Math.abs(BASE[0]) * 1.15
    const T = LAND - R1, u = (t - R1) / T, m0 = BASE[1] * T / SPIN
    return 1.15 * SPIN / T * Math.abs(m0 * (3 * u * u - 4 * u + 1) + (-6 * u * u + 6 * u))
  }
  const blurAt = t => Math.min(28, Math.max(1, Math.ceil(speed(t) * 0.5 / 30 / 4)))
  return {
    name, fps: 30, blurAt, duration: DUR, html,
    fontsCheck: ["italic 100px 'Didot'"],
    timeline: { starts: [0, SWAP, R1, LAND, OPEN, CTA], DUR, beat },
    audio: { bed: bed ? { file: bed, groove: 'bed-d', section: 'lift', alignAt: R1, gainDb: 0, fadeOut: 1.5 } : null, events },
    sheet: [0.15, 0.6, 2.5, SWAP + 0.4, R1 - 0.4, R1 + 0.5, R1 + 1.2, LAND - 0.3, LAND + 0.3, OPEN, CTA + 1, DUR - 0.2],
  }
}
