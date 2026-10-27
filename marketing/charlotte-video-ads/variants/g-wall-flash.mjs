// G · "wall + flash" — v2 of the photo wall (f-wall) crossed with d-eyes' motor-drive cuts. Three columns of Aidan's
// five-star frames drift on gallery-white with the city band through the middle; on the beat the band closes, the wall
// whips + zooms (real motion blur) into a white exposure pop, and breaks into full-frame flashes that accelerate like a
// motor drive (1 → ½ → ¼ → ⅛ beat, a shutter click per cut, a few soft exposure pops / shutter blinks — never more than
// ~3 per second). Every flash is cover-fit and zoomed just enough (≤1.3×) to put the face centre on the same pixels, so
// the burst reads smooth. It slams to a stop on one hero frame full bleed for the CTA.
import path from 'node:path'
import { pageHTML, fboxes, layer } from '../lib/engine.mjs'
import { faceFocus } from '../lib/common.mjs'
import { FONTS, PRELOAD, FONT_CHECK, SE, HW } from '../lib/charlotte.mjs'

export async function build({ stage, beatOf, ROOT, W, H, arg }) {
  // --set=mixed (20 Oct, Aidan: "why are they all female photos"): men's five-stars T39–T44 alternate with the women's
  // --set=top: only Aidan's top_tier_candidates picks (20 Oct)
  const SET = arg?.('set') || 'women', MIXED = SET === 'mixed', TOP = SET === 'top'
  const name = SET === 'women' ? 'g-wall-flash' : `g-wall-flash-${SET}`
  const work = path.join(ROOT, 'work', name)
  const { beat, bed } = beatOf('bed-d', 120)
  const B = x => +(x * beat).toFixed(4)
  const PAPER = '#f1ece4', BAND = '#141210'
  const GAP = 14, CW = (W - GAP * 4) / 3, COLX = [0, 1, 2].map(i => GAP + i * (CW + GAP))
  const SH = 'text-shadow:0 2px 8px rgba(0,0,0,.85),0 12px 50px rgba(0,0,0,.6);'

  // ONLY the Lightroom five-star frames
  const FIVE = ['T28', 'T30', 'T35', 'T36', 'T37', 'T38', 'T45', 'T46', 'T47', 'T48', 'T51', 'T52', 'T53', 'T54', 'T55', 'T56', 'T67']
  const COLS = [
    ['T37', 'T52', 'T30', 'T46', 'T56', 'T53'],
    ['T45', 'T28', 'T48', 'T54', 'T36', 'T67'],
    ['T38', 'T51', 'T35', 'T55', 'T47', 'T30'],
  ]
  // burst: close frames on the slow beats, motor drive at the end (T36's face is only estimated and T56's sits too low
  // to align without a tight crop, so they stay on the wall; T48 is saved for the hero)
  const SEQ = [
    ['T37', 1], ['T30', 1], ['T53', 1], ['T38', 1],
    ['T47', 0.5], ['T54', 0.5], ['T52', 0.5], ['T67', 0.5],
    ['T35', 0.25], ['T45', 0.25], ['T55', 0.25], ['T46', 0.25],
    ['T51', 0.125], ['T52', 0.125], ['T37', 0.125], ['T30', 0.125], ['T53', 0.125], ['T47', 0.125], ['T38', 0.125], ['T54', 0.125],
  ]
  let HERO_STEM = 'T48'
  if (MIXED) {
    FIVE.push('T39', 'T40', 'T41', 'T42', 'T43', 'T44')
    COLS.splice(0, 3,
      ['T39', 'T46', 'T42', 'T51', 'T43', 'T55'],
      ['T44', 'T35', 'T40', 'T67', 'T41', 'T52'],
      ['T43', 'T45', 'T39', 'T53', 'T42', 'T36'])
    SEQ.splice(0, SEQ.length,
      ['T43', 1], ['T35', 1], ['T39', 1], ['T53', 1],
      ['T42', 0.5], ['T46', 0.5], ['T44', 0.5], ['T51', 0.5],
      ['T40', 0.25], ['T67', 0.25], ['T41', 0.25], ['T55', 0.25],
      ['T43', 0.125], ['T45', 0.125], ['T39', 0.125], ['T52', 0.125], ['T42', 0.125], ['T35', 0.125], ['T44', 0.125], ['T53', 0.125])
    HERO_STEM = 'T44'
  }
  if (TOP) {
    const TOPSET = ['T0', 'T3', 'T7', 'T8', 'T10', 'T11', 'T13', 'T14', 'T16', 'T18', 'T20', 'T21', 'T23', 'T31', 'T32', 'T34', 'T35', 'T39', 'T44', 'T48', 'T49', 'T58', 'T63', 'T64', 'T73', 'T75', 'T83', 'T85', 'T89', 'T91', 'T92']
    FIVE.splice(0, FIVE.length, ...TOPSET)
    COLS.splice(0, 3,
      ['T10', 'T18', 'T0', 'T89', 'T32', 'T63', 'T21', 'T85', 'T11', 'T34'],
      ['T31', 'T75', 'T16', 'T13', 'T92', 'T3', 'T58', 'T44', 'T23', 'T7'],
      ['T83', 'T14', 'T8', 'T39', 'T48', 'T20', 'T64', 'T91', 'T35', 'T49'])
    SEQ.splice(0, SEQ.length,
      ['T73', 1], ['T39', 1], ['T31', 1], ['T91', 1],
      ['T14', 0.5], ['T16', 0.5], ['T10', 0.5], ['T89', 0.5],
      ['T58', 0.25], ['T20', 0.25], ['T49', 0.25], ['T83', 0.25],
      ['T7', 0.125], ['T18', 0.125], ['T21', 0.125], ['T44', 0.125], ['T13', 0.125], ['T92', 0.125], ['T23', 0.125], ['T73', 0.125])
    HERO_STEM = 'T64'
  }
  for (const s of [...COLS.flat(), ...SEQ.map(x => x[0]), HERO_STEM]) if (!FIVE.includes(s)) throw new Error(`not a five-star frame: ${s}`)

  const wallA = {}, full = {}
  const W_ = s => wallA[s] || (wallA[s] = (a => ({ ...a, src: 'wall/' + a.src }))(stage(path.join(work, 'wall'), s, { long: 1600 })))
  const F_ = s => full[s] || (full[s] = stage(work, s))

  // ---- wall columns (cells carry scaled .fbox markers so the face audit sees them) ----
  const cols = COLS.map(stems => {
    let y = 0
    const items = stems.map(stem => {
      const a = W_(stem), h = Math.round(CW * a.h / a.w)
      const it = { stem, a, y, ch: h }
      y += h + GAP
      return it
    })
    return { items, loop: y }
  })

  // ---- flash framing: face centre → T (cover-fit, zoom ≤ ZMAX) ----
  const T = { x: W / 2, y: 690 }, ZMAX = 1.3
  const frame = a => {
    const big = (a.faces || []).slice().sort((p, q) => q[2] * q[3] - p[2] * p[3])[0]
    const cx = big[0] + big[2] / 2, cy = big[1] + big[3] / 2
    const k0 = Math.max(W / a.w, H / a.h)
    const place = z => {
      const k = k0 * z, sw = a.w * k, sh = a.h * k
      const x = Math.min(0, Math.max(W - sw, T.x - cx * k)), y = Math.min(0, Math.max(H - sh, T.y - cy * k))
      return { k, x, y, err: Math.hypot(x + cx * k - T.x, y + cy * k - T.y) }
    }
    let best = place(1)
    for (let z = 1; z <= ZMAX + 1e-9; z += 0.01) { const p = place(z); if (p.err < best.err - 2) best = { ...p, z }; if (p.err < 25) { best = { ...p, z }; break } }
    return { k: +best.k.toFixed(5), x: +best.x.toFixed(1), y: +best.y.toFixed(1), err: Math.round(best.err), z: +(best.z || 1).toFixed(2), fx: cx, fy: cy }
  }
  const FR = SEQ.map(([stem, beats]) => ({ stem, beats, a: F_(stem), ...frame(F_(stem)) }))
  const hero = F_(HERO_STEM), hf = faceFocus(hero)
  const hk0 = Math.max(W / hero.w, H / hero.h)
  const HC = { k: hk0, x: -(hero.w * hk0 - W) * hf.fx, y: -(hero.h * hk0 - H) * hf.fy }
  const hb = hero.faces[0], HF = { x: HC.x + (hb[0] + hb[2] / 2) * hk0, y: HC.y + (hb[1] + hb[3] / 2) * hk0 }

  // ---- timeline ----
  const BAND_OUT = B(5.5), WHIP = B(6), FL = B(8)
  const starts = []; let t = FL
  FR.forEach(f => { starts.push(+t.toFixed(4)); t += f.beats * beat })
  const HERO = +t.toFixed(4)                     // = B(16), a bar line
  const CTA = HERO + B(2.5), DUR = B(27)
  // exposure pops (soft white, decays in ~5 frames) and shutter blinks (one black frame before the cut)
  const POPS = [starts[0], starts[4], starts[8], HERO]
  const BLINKS = [starts[2], starts[6], starts[11]]

  const BASE = [-110, 110, -110], START = [-300, -1100, -80]
  const css = `${FONTS}
  html,body{background:${PAPER}}
  #wall{position:absolute;inset:0;transform-origin:540px 960px}
  .col{position:absolute;top:0;width:${CW}px;height:${H}px}
  .cell{position:absolute;left:0;width:${CW}px;overflow:hidden;background:#ddd}
  .cell .in{position:absolute;left:0;top:0;transform-origin:0 0}.cell .in img{width:100%;height:100%}
  #band{position:absolute;left:0;right:0;background:${BAND};overflow:hidden}
  #b1{position:absolute;left:0;right:0;text-align:center;color:#fff}
  .f{position:absolute;inset:0;overflow:hidden;visibility:hidden;background:#000}
  .f .ph img{width:100%;height:100%}
  #shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0) 50%,rgba(0,0,0,.25) 62%,rgba(0,0,0,.6) 80%,rgba(0,0,0,.66) 100%);opacity:0}
  .blk{position:absolute;left:60px;right:60px;text-align:center;color:#fff;${SH}}
  #pop{position:absolute;inset:0;background:#fff;opacity:0}#blink{position:absolute;inset:0;background:#000;opacity:0}`
  const cellHTML = (it, top) => `<div class="cell" style="top:${top}px;height:${it.ch}px"><div class="in" style="width:${it.a.w}px;height:${it.a.h}px;transform:scale(${(CW / it.a.w).toFixed(5)})"><img src="${it.a.src}">${fboxes(it.a)}</div></div>`
  const colHTML = cols.map((c, ci) => `<div class="col" id="col${ci}" style="left:${COLX[ci]}px">${[0, 1, 2].map(r => c.items.map(it => cellHTML(it, it.y + r * c.loop)).join('')).join('')}</div>`).join('')
  const body = `${PRELOAD}<div id="wall">${colHTML}</div>
  <div id="band" data-card><div id="b1"><div class="t" style="font-family:${SE};font-style:italic;font-size:200px;line-height:1">Charlotte</div>
    <div class="t" style="font-family:${SE};font-style:italic;font-size:50px;margin-top:8px;letter-spacing:.01em">free photo shoot</div></div></div>
  ${FR.map((f, i) => `<div class="f" id="f${i}">${layer(f.a, 'p' + i)}</div>`).join('')}
  <div class="f" id="fh">${layer(hero, 'ph')}</div>
  <div id="shade"></div>
  <div class="blk" id="burst" style="top:1250px"><div class="t" style="font-family:${SE};font-style:italic;font-size:108px;line-height:1;white-space:nowrap">Free Photo Shoot.</div></div>
  <div class="blk" id="cta1" style="top:1040px"><div class="t" style="font-family:${SE};font-style:italic;font-size:60px;line-height:1.05">free photo shoot in Charlotte</div></div>
  <div class="blk" id="cta2" style="top:1135px"><div class="t" style="font-family:${HW};font-weight:700;font-size:134px;line-height:.98;white-space:nowrap">Interested?<br>Let’s chat.</div></div>
  <div id="pop"></div><div id="blink"></div>`

  const script = `
  const COLS=${JSON.stringify(cols.map(c => ({ loop: c.loop })))}, BASE=${JSON.stringify(BASE)}, START=${JSON.stringify(START)};
  const FR=${JSON.stringify(FR.map(f => ({ k: f.k, x: f.x, y: f.y })))}, ST=${JSON.stringify(starts)}, T=${JSON.stringify(T)};
  const HC=${JSON.stringify(HC)}, HF=${JSON.stringify(HF)}, POPS=${JSON.stringify(POPS)}, BLINKS=${JSON.stringify(BLINKS)};
  const BAND_OUT=${BAND_OUT}, WHIP=${WHIP}, FL=${FL}, HERO=${HERO}, CTA=${CTA}, DUR=${DUR}, fr=1/30;
  const $=id=>document.getElementById(id), cols=[0,1,2].map(i=>$('col'+i)), fs=FR.map((_,i)=>$('f'+i));
  // drift, then the whip: an ease-in burst of extra travel (each column keeps its own direction)
  const wu=t=>U.clamp((t-WHIP)/(FL-WHIP));
  function off(i,t){ const L=COLS[i].loop; let o=START[i]+BASE[i]*Math.min(t,FL)+Math.sign(BASE[i])*4200*U.ei(wu(t)); return ((o%L)+L)%L-L }
  // a cut's transform about the aligned face point: settle-in from 1.035 (gives every flash a little life)
  const place=(el,c,s,px,py)=>{ el.style.transform='translate('+(px+(c.x-px)*s)+'px,'+(py+(c.y-py)*s)+'px) scale('+(c.k*s)+')' };
  window.renderFrame=function(t){
    // ---- wall ----
    const wallOn=t<FL; $('wall').style.visibility=wallOn?'visible':'hidden';
    if(wallOn){ cols.forEach((c,i)=>c.style.transform='translateY('+off(i,t)+'px)'); $('wall').style.transform='scale('+(1+1.5*U.ei(wu(t)))+')' }
    const bOpen=U.eo5(U.p(t,-0.2,0.35)), bClose=U.eio(U.p(t,BAND_OUT-0.2,WHIP));
    const bh=380*bOpen*(1-bClose), band=$('band'); band.style.top=(960-bh/2)+'px'; band.style.height=bh+'px'; band.style.visibility=bh<2?'hidden':'visible';
    const b1=$('b1'); b1.style.top=(bh/2-b1.offsetHeight/2-6)+'px';
    // ---- flashes ----
    let cur=-1; if(t>=FL&&t<HERO) for(let i=0;i<ST.length;i++) if(t>=ST[i]-1e-6) cur=i;
    fs.forEach((e,i)=>e.style.visibility=i===cur?'visible':'hidden');
    if(cur>=0){ const end=ST[cur+1]??HERO, s=1.035-0.035*U.eo(U.p(t,ST[cur],ST[cur]+Math.max(0.25,end-ST[cur]))); place($('p'+cur),FR[cur],s,T.x,T.y) }
    // ---- hero: slams in from 1.14 and stops dead, then a slow push ----
    const fh=$('fh'); fh.style.visibility=t>=HERO?'visible':'hidden';
    if(t>=HERO){ const s=1.14-0.14*U.eo5(U.p(t,HERO,HERO+0.22))+0.04*U.eio(U.p(t,HERO+0.22,DUR)); place($('ph'),HC,s,HF.x,HF.y) }
    // ---- copy ----
    const bi=U.eo(U.p(t,FL+0.05,FL+0.4)), bo=U.p(t,HERO-0.12,HERO);
    $('burst').style.opacity=t>=FL&&t<HERO? bi*(1-bo):0; $('burst').style.transform='translateY('+(14*(1-bi))+'px)';
    $('shade').style.opacity = t<FL?0 : t<HERO? 0.55*bi : 0.55+0.45*U.eo(U.p(t,HERO+0.2,CTA));
    const c1=U.eo(U.p(t,HERO+0.35,HERO+0.8)), c2=U.eo(U.p(t,CTA,CTA+0.45));
    $('cta1').style.opacity=t>=HERO?c1:0; $('cta1').style.transform='translateY('+(16*(1-c1))+'px)';
    $('cta2').style.opacity=t>=HERO?c2:0; $('cta2').style.transform='translateY('+(16*(1-c2))+'px)';
    // ---- exposure pops: soft (peak .6) and short; the wall's whip ramps into the first one ----
    let pop=0; for(const p of POPS){ if(t>=p) pop=Math.max(pop,0.6*Math.exp(-(t-p)/0.06)) }
    pop=Math.max(pop,0.45*U.ei(U.p(t,FL-0.18,FL))*(t<FL?1:0));
    $('pop').style.opacity=pop<0.01?0:pop;
    $('blink').style.opacity=BLINKS.some(b=>t>=b-fr-1e-6&&t<b-1e-6)?1:0;
  };`
  const html = pageHTML({ css, body, script })
  const sh = ['sfx-shutter.wav', 'sfx-shutter-2.wav', 'sfx-shutter-3.wav']
  const events = [
    { t: WHIP - 0.05, file: 'sfx-whoosh-soft.wav', gainDb: -5 },
    ...starts.map((s, i) => ({ t: Math.max(0, s - 0.008), file: sh[i % 3], gainDb: FR[i].beats <= 0.125 ? -11 : FR[i].beats <= 0.25 ? -9 : -7 })),
    { t: HERO - 0.008, file: 'sfx-shutter.wav', gainDb: -3 },
  ]
  // motion blur only on the whip (180° shutter, ~4 px per sample)
  const blurAt = t => {
    if (t < WHIP || t >= FL) return 1
    const u = (t - WHIP) / (FL - WHIP), v = 4200 * 3 * u * u / (FL - WHIP) + 1.5 * 3 * u * u / (FL - WHIP) * 960 + 110
    return Math.min(24, Math.max(1, Math.ceil(v * 0.5 / 30 / 4)))
  }
  return {
    name, fps: 30, blurAt, duration: DUR, html,
    fontsCheck: ['italic 100px Georgia', ...FONT_CHECK],
    frames: FR.map(f => `${f.stem} z=${f.z} faceErr=${f.err}px`),
    timeline: { starts: [0, B(3), WHIP, B(7.5), ...starts, HERO, CTA], DUR, beat },
    audio: { bed: bed ? { file: bed, groove: 'bed-d', alignAt: FL, gainDb: 0, fadeOut: 1.4 } : null, events },
    sheet: [0.4, 1.6, B(5), WHIP + 0.3, WHIP + 0.8, FL + 0.2, starts[2] + 0.1, starts[5] + 0.05, starts[9] + 0.05, starts[14] + 0.02, HERO + 0.15, HERO + 0.6, CTA + 0.2, CTA + 1, DUR - 0.2, starts[18] + 0.02],
  }
}
