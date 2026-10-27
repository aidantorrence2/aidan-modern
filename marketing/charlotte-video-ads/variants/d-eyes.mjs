// D · "eyes" — eye-locked match cuts (port of paris-reference/c-regard). Every portrait is scaled + rotated (Apple
// Vision pupils) so the eyes sit on the exact same pixels; the cuts accelerate like a motor drive (a shutter click per
// cut) and stop dead on one face, which tilts up to make room for the offer + CTA below it.
import path from 'node:path'
import { pageHTML, fboxes } from '../lib/engine.mjs'

export async function build({ stage, beatOf, ROOT, W, H }) {
  const name = 'd-eyes'
  const work = path.join(ROOT, 'work', name)
  const { beat, bed } = beatOf('bed-c', 124)
  const P = { x: W / 2, y: 640 }      // where both eyes' midpoint lands
  const HERO_LIFT = 170
  const DEYE = 210                     // target pupil distance (px) — grows when a frame needs more scale to cover

  // close portraits on the slow beats, the rest inside the 1/8-note burst; women's frames with Vision pupils only
  const SEQ = [
    ['T37', 4],
    ['T70', 1],
    ['T24', 1],
    ['T12', 0.5],
    ['T33', 0.5],
    ['T76', 0.5],
    ['T14', 0.5],
    ['T9', 0.25],
    ['T65', 0.25],
    ['T72', 0.25],
    ['T60', 0.25],
    ['T88', 0.25],
    ['T6', 0.25],
    ['T49', 0.125],
    ['T58', 0.125],
    ['T73', 0.125],
    ['T87', 0.125],
    ['T21', 0.125],
    ['T13', 0.125],
    ['T15', 0.125],
    ['T66', 0.125],
    ['T47', 9],   // the face it stops on
  ]
  const cache = {}
  const FR = SEQ.map(([stem, beats], i) => {
    const a = cache[stem] || (cache[stem] = stage(work, stem))
    const [lx, ly] = a.face.le, [rx, ry] = a.face.re
    const d = Math.hypot(rx - lx, ry - ly), ang = Math.atan2(ry - ly, rx - lx)
    const mx = (lx + rx) / 2, my = (ly + ry) / 2
    const covers = (s, py = P.y) => [[0, 0], [W, 0], [0, H], [W, H]].every(([X, Y]) => {
      const dx = (X - P.x) / s, dy = (Y - py) / s, c = Math.cos(ang), si = Math.sin(ang)
      const ix = mx + c * dx - si * dy, iy = my + si * dx + c * dy
      return ix >= 0 && ix <= a.w && iy >= 0 && iy <= a.h
    })
    let s = DEYE / d
    while (!covers(s)) s *= 1.01
    if (i === SEQ.length - 1) while (!covers(s, P.y - HERO_LIFT)) s *= 1.01
    return { stem, beats, a, s: +s.toFixed(5), ang: +(-ang * 180 / Math.PI).toFixed(3), mx, my, up: +(s * 2400 / 2153).toFixed(2) }
  })
  const starts = []; let t = 0
  FR.forEach(f => { starts.push(+t.toFixed(4)); t += f.beats * beat })
  const HERO = starts.at(-1)
  const L2 = HERO + 0.6, L3 = HERO + 0.6 + 2 * beat
  const DUR = +t.toFixed(2)

  const SERIF = "Georgia,'Times New Roman',serif"
  const css = `
  .f{position:absolute;inset:0;overflow:hidden;visibility:hidden}
  .f .ph{position:absolute;left:0;top:0;transform-origin:0 0}
  .f .ph img{width:100%;height:100%;display:block}
  #shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0) 48%,rgba(0,0,0,.22) 60%,rgba(0,0,0,.58) 82%,rgba(0,0,0,.62) 100%)}
  .blk{position:absolute;left:64px;right:64px;text-align:center}
  .big{font-family:${SERIF};font-style:italic;font-weight:400;color:#fff;line-height:1;text-shadow:0 2px 14px rgba(0,0,0,.45),0 8px 40px rgba(0,0,0,.3)}
  .small{font:500 44px/1.25 system-ui,-apple-system,sans-serif;color:#fff;letter-spacing:.02em;text-shadow:0 2px 10px rgba(0,0,0,.6)}`
  const body = FR.map((f, i) => `<div class="f" id="f${i}"><div class="ph" style="width:${f.a.w}px;height:${f.a.h}px"><img src="${f.a.src}">${fboxes(f.a)}</div></div>`).join('') + `
  <div id="shade"></div>
  <div class="blk" id="hook" style="top:1150px"><div class="big t" style="font-size:170px">Charlotte</div><div class="small t" style="margin-top:18px;font-size:54px;font-weight:600">free photo shoot</div></div>
  <div class="blk" id="offer" style="top:1060px"><div class="big t" style="font-size:132px;line-height:.98">Free Photo<br>Shoot.</div></div>
  <div class="blk" id="cta" style="top:1335px"><div class="small t" style="font-size:52px;font-weight:600">Interested? Let’s chat.</div></div>`

  const script = `
  const FR=${JSON.stringify(FR.map(f => ({ s: f.s, ang: f.ang, mx: f.mx, my: f.my })))}, ST=${JSON.stringify(starts)};
  const HERO=${HERO}, L2=${L2}, L3=${L3}, DUR=${DUR}, beat=${beat}, P=${JSON.stringify(P)};
  const fs=[...document.querySelectorAll('.f')], $=id=>document.getElementById(id);
  window.renderFrame=function(t){
    let cur=0; for(let i=0;i<ST.length;i++) if(t>=ST[i]+1e-6) cur=i;
    fs.forEach((e,i)=>e.style.visibility=i===cur?'visible':'hidden');
    const f=FR[cur];
    const g = t<HERO ? 1+0.10*U.eio(U.p(t,0,HERO)) : 1.10-0.06*U.eo(U.p(t,HERO,DUR));
    const s=f.s*g, lift = t>=HERO ? ${HERO_LIFT}*U.eio(U.p(t,HERO+0.1,HERO+0.85)) : 0;
    fs[cur].firstChild.style.transform='translate('+P.x+'px,'+(P.y-lift)+'px) rotate('+f.ang+'deg) scale('+s+') translate('+(-f.mx)+'px,'+(-f.my)+'px)';
    const hk=U.p(t,-0.3,0.12), hkOut=U.p(t,ST[1]-0.18,ST[1]);
    $('hook').style.opacity=U.eo(hk)*(1-hkOut); $('hook').style.transform='translateY('+(16*(1-U.eo(hk)))+'px)';
    const o=U.eo(U.p(t,L2,L2+0.35)); $('offer').style.opacity=o; $('offer').style.transform='translateY('+(16*(1-o))+'px)';
    const c=U.eo(U.p(t,L3,L3+0.4)); $('cta').style.opacity=c; $('cta').style.transform='translateY('+(16*(1-c))+'px)';
    $('shade').style.opacity = Math.min(1,(t<ST[1]? 1 : 0) + (t>=HERO? U.eo(U.p(t,HERO,HERO+0.4)) : 0));
  };`
  const html = pageHTML({ css, body, script })
  const sh = ['sfx-shutter.wav', 'sfx-shutter-2.wav', 'sfx-shutter-3.wav']
  const events = starts.map((s, i) => ({ t: Math.max(0, s - 0.008), file: sh[i % 3], gainDb: i === 0 ? -6 : (FR[i].beats <= 0.125 ? -11 : FR[i].beats <= 0.25 ? -9 : -7) + (i === FR.length - 1 ? 3 : 0) }))
  return {
    name, fps: 30, duration: DUR, html,
    fontsCheck: ['italic 100px Georgia'],
    frames: FR.map(f => `${f.stem} s=${f.s} up≈${f.up}x ang=${f.ang}`),
    timeline: { starts, HERO, DUR, beat },
    audio: { bed: bed ? { file: bed, groove: 'bed-c', alignAt: starts[1], gainDb: 0, fadeOut: 1.4 } : null, events },
    sheet: [0.5, starts[1] + 0.1, starts[2] + 0.1, starts[3] + 0.05, starts[5] + 0.05, starts[7] + 0.03, starts[9] + 0.03, starts[11] + 0.03, starts[14] + 0.02, HERO + 0.2, L3 + 0.6, DUR - 0.2],
  }
}
