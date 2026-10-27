// J · "develop" — 5 s Reel. Black frame; the portrait fades up out of the dark (a print developing), the city lands,
// the call is written on in the last second; fades to black so it loops. For the cheap Reels placement (CPC-PLAN S3).
import path from 'node:path'
import { pageHTML, layer } from '../lib/engine.mjs'
import { faceFocus } from '../lib/common.mjs'
import { FONTS, SE, HW, SH, CITY, PRELOAD } from '../lib/charlotte.mjs'

export async function build({ stage, beatOf, ROOT, W, H }) {
  const name = 'j-develop', work = path.join(ROOT, 'work', name), { bed } = beatOf('bed-b', 95)
  const a = stage(work, 'R1-09797-0018'); Object.assign(a, faceFocus(a, W, H, 1.04, { x: 0, y: -0.1 }))
  const DUR = 5.0
  const css = `${FONTS}#ph{visibility:visible}.scr{position:absolute;inset:0}.hk1{font:italic 700 150px/.88 ${SE};color:#fff;${SH}}.hk2{font:italic 700 80px/.98 ${SE};color:#fff;${SH};margin-top:12px}
  .hw{font:700 138px/.95 ${HW};color:#fff;${SH}clip-path:inset(-20% 100% -20% 0)}.cta{position:absolute;left:56px;right:56px;text-align:center}`
  const body = `${PRELOAD}<div class="scr" style="background:#000"></div>${layer(a, 'ph')}<div class="scr" id="dark" style="background:#000"></div>
    <div class="scr" id="low" style="background:linear-gradient(180deg,transparent 0%,transparent 50%,rgba(0,0,0,.5) 64%,rgba(0,0,0,.9) 100%);opacity:0"></div>
    <div class="cta" id="c0" style="top:1060px;opacity:0"><div class="t hk1">${CITY}</div><div class="t hk2">Free Photo Shoot.</div></div>
    <div class="cta" id="c1" style="top:1040px;opacity:0"><div class="t hw" id="h1">Interested?</div><div class="t hw" id="h2">Let's chat.</div></div>`
  const script = `const A={w:${a.w},h:${a.h},fx:${a.fx},fy:${a.fy}};const $=id=>document.getElementById(id);
  const wipe=(id,s,e,t)=>$(id).style.clipPath='inset(-20% '+(100-100*U.eio(U.p(t,s,e)))+'% -20% 0)';
  window.renderFrame=function(t){
    const c=U.cover(A.w,A.h,A.fx,A.fy,1.0+0.1*U.p(t,0.3,${DUR})); $('ph').style.transform='translate('+c.x+'px,'+c.y+'px) scale('+c.k+')';
    // develop: black → image over 0.3–1.9 s with an ease-in so shadows arrive last; fade out in the last 0.35 s (loop)
    const dev=U.eio(U.p(t,0.3,1.9)), out=U.p(t,${DUR - 0.35},${DUR});
    $('dark').style.opacity=Math.max(1-dev,out); $('ph').style.filter='contrast('+(0.7+0.3*dev)+') brightness('+(0.5+0.5*dev)+')';
    const city=U.p(t,2.2,2.7), cta=U.p(t,3.55,3.7);
    $('low').style.opacity=U.eo(U.p(t,2.0,2.6));
    $('c0').style.opacity=U.eo(city)*(1-cta); $('c1').style.opacity=cta;
    wipe('h1',3.6,4.0,t); wipe('h2',4.0,4.4,t);
  };`
  return { name, fps: 30, duration: DUR, html: pageHTML({ css, body, script }), fontsCheck: ['700 64px Caveat'],
    timeline: { starts: [0, 2.2, 3.6], DUR },
    audio: { bed: bed ? { file: bed, groove: 'bed-b', alignAt: 1.9, gainDb: -2, fadeOut: 0.5 } : null, events: [{ t: 1.0, file: 'sfx-whoosh-soft.wav', gainDb: -9 }, { t: 2.2, file: 'sfx-shutter-2.wav', gainDb: -11 }] },
    sheet: [0.2, 0.9, 1.5, 2.1, 2.8, 3.5, 4.1, 4.7] }
}
