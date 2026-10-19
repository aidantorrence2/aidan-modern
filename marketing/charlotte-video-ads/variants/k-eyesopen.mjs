// K · "eyes first" — 5 s Reel. The first second is only her eyes, big and locked; the frame pulls back to the whole
// portrait, the city lands, the call is written on. Shortest path from scroll to a face (CPC-PLAN S5).
import path from 'node:path'
import { pageHTML, layer } from '../lib/engine.mjs'
import { faceFocus } from '../lib/common.mjs'
import { FONTS, SE, HW, SH, CITY, PRELOAD } from '../lib/charlotte.mjs'

export async function build({ stage, beatOf, ROOT, W, H }) {
  const name = 'k-eyesopen', work = path.join(ROOT, 'work', name), { bed } = beatOf('bed-c', 120)
  const a = stage(work, 'R1-00009-0028'); Object.assign(a, faceFocus(a, W, H, 1.04, { x: 0, y: -0.1 }))
  const ex = (a.face.le[0] + a.face.re[0]) / 2, ey = (a.face.le[1] + a.face.re[1]) / 2, ipd = Math.hypot(a.face.re[0] - a.face.le[0], a.face.re[1] - a.face.le[1])
  const DUR = 5.0
  const css = `${FONTS}.scr{position:absolute;inset:0}.hk1{font:italic 700 150px/.88 ${SE};color:#fff;${SH}}.hk2{font:italic 700 80px/.98 ${SE};color:#fff;${SH};margin-top:12px}
  .hw{font:700 138px/.95 ${HW};color:#fff;${SH}clip-path:inset(-20% 100% -20% 0)}.cta{position:absolute;left:56px;right:56px;text-align:center}`
  const body = `${PRELOAD}<div class="scr" style="background:#000"></div>${layer(a, 'ph')}<div class="scr" id="low" style="background:linear-gradient(180deg,transparent 0%,transparent 50%,rgba(0,0,0,.5) 64%,rgba(0,0,0,.9) 100%);opacity:0"></div>
    <div class="scr" id="dark" style="background:#000;opacity:0"></div>
    <div class="cta" id="c0" style="top:1060px;opacity:0"><div class="t hk1">${CITY}</div><div class="t hk2">Free Photo Shoot.</div></div>
    <div class="cta" id="c1" style="top:1040px;opacity:0"><div class="t hw" id="h1">Interested?</div><div class="t hw" id="h2">Let's chat.</div></div>`
  const script = `const A={w:${a.w},h:${a.h},fx:${a.fx},fy:${a.fy},ex:${ex},ey:${ey},ipd:${ipd}};const $=id=>document.getElementById(id);
  const wipe=(id,s,e,t)=>$(id).style.clipPath='inset(-20% '+(100-100*U.eio(U.p(t,s,e)))+'% -20% 0)';
  window.renderFrame=function(t){
    // state 0: eyes — inter-pupil distance 560 px, eye line at y 760. state 1: the cover framing used for the end.
    const k0=560/A.ipd, x0=540-A.ex*k0, y0=760-A.ey*k0, c=U.cover(A.w,A.h,A.fx,A.fy,1.04+0.05*U.p(t,1.6,${DUR}));
    const p=U.eio(U.p(t,1.0,1.9)), k=U.lerp(k0,c.k,p), x=U.lerp(x0,c.x,p), y=U.lerp(y0,c.y,p);
    $('ph').style.transform='translate('+x+'px,'+y+'px) scale('+k+')';
    $('low').style.opacity=U.eo(U.p(t,2.0,2.5)); $('dark').style.opacity=U.p(t,${DUR - 0.3},${DUR});
    const city=U.p(t,2.1,2.6), cta=U.p(t,3.55,3.7);
    $('c0').style.opacity=U.eo(city)*(1-cta); $('c1').style.opacity=cta; wipe('h1',3.6,4.0,t); wipe('h2',4.0,4.4,t);
  };`
  return { name, fps: 30, duration: DUR, html: pageHTML({ css, body, script }), fontsCheck: ['700 64px Caveat'],
    timeline: { starts: [0, 1.0, 2.1, 3.6], DUR },
    audio: { bed: bed ? { file: bed, groove: 'bed-c', alignAt: 1.0, gainDb: -2, fadeOut: 0.5 } : null, events: [{ t: 1.0, file: 'sfx-shutter-2.wav', gainDb: -9 }, { t: 2.1, file: 'sfx-shutter-2.wav', gainDb: -13 }] },
    sheet: [0.3, 0.9, 1.4, 1.9, 2.5, 3.2, 4.0, 4.7] }
}
