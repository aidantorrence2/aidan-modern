// C · "regard" — eye-locked match cuts. Every portrait is scaled + rotated (Apple Vision pupils) so the eyes sit on
// the exact same pixels; the cuts accelerate like a motor drive (a shutter click per cut) and stop dead on one face.
import path from 'node:path'
import { pageHTML } from '../lib/engine.mjs'
import { HANDLE } from '../lib/common.mjs'

export async function build({ stage, beatOf, ROOT, W, H }) {
  const name = 'c-regard'
  const work = path.join(ROOT, 'work', name)
  const { beat, bed } = beatOf('bed-c', 124)
  const P = { x: W / 2, y: 690 }      // where both eyes' midpoint lands
  const HERO_LIFT = 200
  const DEYE = 225                     // target pupil distance (px) — grows when a frame needs more scale to cover

  // order = rhythm: close portraits on the slow beats, medium frames inside the 1/8-note burst
  const SEQ = [
    ['bangkok-lefroncee-000046-4', 4],
    ['2026-09-29-000042', 1],
    ['bali-sofiatann2-000004-3', 1],
    ['seoul-tokyo-ulaanbaatar-etc-indian-000019-2', 0.5],
    ['bangkok-pink-old-000042-2', 0.5],
    ['taiwan-philippines-model-0004-4-6', 0.5],
    ['bangkok-natcha-000070', 0.5],
    ['manila-gallery-garden-002', 0.25],
    ['manila-gallery-urban-002', 0.25],
    ['hk-taiwan-chinese-in-taipei-000018-8', 0.25],
    ['seoul-tokyo-ulaanbaatar-etc-fun-000058-6', 0.25],
    ['manila-gallery-ivy-001', 0.25],
    ['2026-09-29-000036-2', 0.25],
    ['r1-05460-0022', 0.125],
    ['bangkok-natcha-000070', 0.125],
    ['bangkok-lefroncee-000046-4', 0.125],
    ['2026-09-29-000042', 0.125],
    ['bali-sofiatann2-000004-3', 0.125],
    ['seoul-tokyo-ulaanbaatar-etc-indian-000019-2', 0.125],
    ['bangkok-pink-old-000042-2', 0.125],
    ['taiwan-philippines-model-0004-4-6', 0.125],
    ['seoul-tokyo-ulaanbaatar-etc-arisa-000031', 9],   // the face it stops on
  ]
  const cache = {}
  const FR = SEQ.map(([stem, beats]) => {
    const a = cache[stem] || (cache[stem] = stage(work, stem))
    const [lx, ly] = a.face.le, [rx, ry] = a.face.re
    const d = Math.hypot(rx - lx, ry - ly), ang = Math.atan2(ry - ly, rx - lx)
    const mx = (lx + rx) / 2, my = (ly + ry) / 2
    // frame px = P + R(-ang)·s·(img px − eye mid); find the smallest s ≥ DEYE/d whose rotated image covers the frame
    const covers = s => [[0, 0], [W, 0], [0, H], [W, H]].every(([X, Y]) => {
      const dx = (X - P.x) / s, dy = (Y - P.y) / s, c = Math.cos(ang), si = Math.sin(ang)
      const ix = mx + c * dx - si * dy, iy = my + si * dx + c * dy
      return ix >= 0 && ix <= a.w && iy >= 0 && iy <= a.h
    })
    let s = DEYE / d
    while (!covers(s)) s *= 1.01
    if (beats >= 4 && stem === SEQ.at(-1)[0]) { // the hero tilts up HERO_LIFT px to make room for the offer — must still cover
      const P0 = { ...P }; P.y -= HERO_LIFT; while (!covers(s)) s *= 1.01; Object.assign(P, P0)
    }
    return { stem, beats, src: a.src, w: a.w, h: a.h, s: +s.toFixed(5), ang: +(-ang * 180 / Math.PI).toFixed(3), mx, my, up: +(s * 1600 / Math.max(a.w, a.h) * (a.w > a.h ? 1 : 1)).toFixed(2) }
  })
  const starts = []; let t = 0
  FR.forEach(f => { starts.push(+t.toFixed(4)); t += f.beats * beat })
  const HERO = starts.at(-1)
  const L2 = HERO + 0.6, L3 = HERO + 0.6 + 2 * beat
  const DUR = +t.toFixed(2)
  const BURST_END = HERO

  const GROT = "'Helvetica Neue',Helvetica,Arial,sans-serif"
  const css = `
  .f{position:absolute;inset:0;overflow:hidden;visibility:hidden}
  .f img{position:absolute;left:0;top:0;transform-origin:0 0}
  #shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0) 50%,rgba(0,0,0,.25) 64%,rgba(0,0,0,.6) 100%)}
  .blk{position:absolute;left:64px;right:64px;top:1080px;text-align:center}
  .big{font-family:${GROT};font-stretch:condensed;font-weight:800;text-transform:uppercase;color:#fff;line-height:.9;letter-spacing:.005em;text-shadow:0 2px 14px rgba(0,0,0,.45)}
  .small{font:500 40px/1.25 system-ui,-apple-system,sans-serif;color:#fff;letter-spacing:.01em;text-shadow:0 2px 10px rgba(0,0,0,.6)}
  .hand{font:500 34px system-ui,-apple-system,sans-serif;color:rgba(255,255,255,.85);letter-spacing:.04em;margin-top:18px;text-shadow:0 2px 10px rgba(0,0,0,.6)}`
  const body = FR.map((f, i) => `<div class="f" id="f${i}"><img src="${f.src}" width="${f.w}" height="${f.h}"></div>`).join('') + `
  <div id="shade"></div>
  <div class="blk" id="hook"><div class="big t" style="font-size:190px">Paris</div><div class="small t" style="margin-top:22px;font-size:54px;font-weight:600">je cherche des modèles.</div></div>
  <div class="blk" id="offer" style="top:1100px"><div class="big t" style="font-size:118px">shooting photo<br>gratuit</div></div>
  <div class="blk" id="cta" style="top:1335px"><div class="small t" style="font-size:48px;font-weight:600">écris-moi <span style="opacity:.8;font-weight:500">· ${HANDLE}</span></div></div>`

  const script = `
  const FR=${JSON.stringify(FR.map(f => ({ s: f.s, ang: f.ang, mx: f.mx, my: f.my })))}, ST=${JSON.stringify(starts)};
  const HERO=${HERO}, L2=${L2}, L3=${L3}, DUR=${DUR}, beat=${beat}, P=${JSON.stringify(P)};
  const fs=[...document.querySelectorAll('.f')], $=id=>document.getElementById(id);
  window.renderFrame=function(t){
    let cur=0; for(let i=0;i<ST.length;i++) if(t>=ST[i]+1e-6) cur=i;
    fs.forEach((e,i)=>e.style.visibility=i===cur?'visible':'hidden');
    const f=FR[cur];
    // one continuous push into the eyes across the burst, then a slow drift back on the hero
    const g = t<HERO ? 1+0.10*U.eio(U.p(t,0,HERO)) : 1.10-0.06*U.eo(U.p(t,HERO,DUR));
    const s=f.s*g, lift = t>=HERO ? ${HERO_LIFT}*U.eio(U.p(t,HERO+0.1,HERO+0.85)) : 0;
    fs[cur].firstChild.style.transform='translate('+P.x+'px,'+(P.y-lift)+'px) rotate('+f.ang+'deg) scale('+s+') translate('+(-f.mx)+'px,'+(-f.my)+'px)';
    // text
    const hk=U.p(t,-0.3,0.12), hkOut=U.p(t,ST[1]-0.18,ST[1]);
    $('hook').style.opacity=U.eo(hk)*(1-hkOut); $('hook').style.transform='translateY('+(16*(1-U.eo(hk)))+'px)';
    const o=U.eo(U.p(t,L2,L2+0.35)); $('offer').style.opacity=o; $('offer').style.transform='translateY('+(16*(1-o))+'px)';
    const c=U.eo(U.p(t,L3,L3+0.4)); $('cta').style.opacity=c; $('cta').style.transform='translateY('+(16*(1-c))+'px)';
    $('shade').style.opacity = (t<ST[1]? 1 : 0) + (t>=HERO? U.eo(U.p(t,HERO,HERO+0.4)) : 0);
  };`
  const html = pageHTML({ css, body, script })
  const sh = ['sfx-shutter.wav', 'sfx-shutter-2.wav', 'sfx-shutter-3.wav']
  const events = starts.map((s, i) => ({ t: Math.max(0, s - 0.008), file: sh[i % 3], gainDb: i === 0 ? -6 : (FR[i].beats <= 0.125 ? -11 : FR[i].beats <= 0.25 ? -9 : -7) + (i === FR.length - 1 ? 3 : 0) }))
  return {
    name, fps: 30, duration: DUR, html,
    fontsCheck: ["800 100px 'Helvetica Neue'"],
    frames: FR.map(f => `${f.stem} s=${f.s} up≈${f.up}x ang=${f.ang}`),
    timeline: { starts, HERO, DUR, beat },
    audio: { bed: bed ? { file: bed, groove: 'bed-c', alignAt: starts[1], gainDb: 0, fadeOut: 1.4 } : null, events },
    sheet: [0.5, starts[1] + 0.1, starts[2] + 0.1, starts[3] + 0.05, starts[5] + 0.05, starts[7] + 0.03, starts[9] + 0.03, starts[11] + 0.03, starts[14] + 0.02, HERO + 0.2, L3 + 0.6, DUR - 0.2],
  }
}
