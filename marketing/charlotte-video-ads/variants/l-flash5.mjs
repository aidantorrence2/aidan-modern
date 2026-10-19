// L · "flash loop" — 5 s Reel. Ten full-frame portraits, eyes locked on the same two points, flashing faster like a motor
// drive, a hard stop on one frame with the city under the face, last half-second the call. Loops clean (CPC-PLAN C4).
import path from 'node:path'
import { pageHTML, layer } from '../lib/engine.mjs'
import { faceFocus } from '../lib/common.mjs'
import { eyeLock, motorDrive, EYE_PUT } from '../lib/eyelock.mjs'
import { FONTS, SE, HW, SH, CITY, PRELOAD } from '../lib/charlotte.mjs'

export async function build({ stage, beatOf, ROOT, W, H }) {
  const name = 'l-flash5', work = path.join(ROOT, 'work', name), { bed } = beatOf('bed-d', 120)
  const LOCK = { X0: W / 2, Y0: H * 0.38, maxZ: 1.4 }
  const FL = ['R1-09952-0012', 'R1-09794-031A', 'R1-09799-0007', 'R1-00009-0002', 'R1-09952-0003', 'R1-09794-035A', 'R1-09997-0011', 'R1-09797-0016', 'R1-00009-0034', 'R1-09792-0026'].map(s => { const a = stage(work, s); return { ...a, L: { ...eyeLock(a, LOCK), w: a.w, h: a.h, ...LOCK } } })
  const HERO = stage(work, 'R1-09952-0013'); Object.assign(HERO, faceFocus(HERO, W, H, 1.04, { x: 0, y: -0.1 }))
  const md = motorDrive(FL.length, 0.0, { first: 0.42, last: 0.11 }), STOP = md.end, DUR = 5.0
  const css = `${FONTS}.scr{position:absolute;inset:0}.fl{visibility:hidden}.hk1{font:italic 700 150px/.88 ${SE};color:#fff;${SH}}.hk2{font:italic 700 80px/.98 ${SE};color:#fff;${SH};margin-top:12px}
  .hw{font:700 138px/.95 ${HW};color:#fff;${SH}clip-path:inset(-20% 100% -20% 0)}.cta{position:absolute;left:56px;right:56px;text-align:center}`
  const body = `${PRELOAD}<div class="scr" style="background:#000"></div>${FL.map((a, i) => layer(a, 'f' + i, 'visibility:hidden;')).join('')}${layer(HERO, 'hero', 'visibility:hidden;')}
    <div class="scr" id="low" style="background:linear-gradient(180deg,transparent 0%,transparent 50%,rgba(0,0,0,.5) 64%,rgba(0,0,0,.9) 100%);opacity:0"></div>
    <div class="cta" id="c0" style="top:1060px;opacity:0"><div class="t hk1">${CITY}</div><div class="t hk2">Free Photo Shoot.</div></div>
    <div class="cta" id="c1" style="top:1040px;opacity:0"><div class="t hw" id="h1">Interested?</div><div class="t hw" id="h2">Let's chat.</div></div>`
  const script = `${EYE_PUT}const LK=${JSON.stringify(FL.map(a => a.L))}, ST=${JSON.stringify(md.starts)}, STOP=${STOP}, HR={w:${HERO.w},h:${HERO.h},fx:${HERO.fx},fy:${HERO.fy}};const $=id=>document.getElementById(id);
  const wipe=(id,s,e,t)=>$(id).style.clipPath='inset(-20% '+(100-100*U.eio(U.p(t,s,e)))+'% -20% 0)';
  window.renderFrame=function(t){
    LK.forEach((_,i)=>$('f'+i).style.visibility='hidden'); $('hero').style.visibility='hidden';
    if(t<STOP){let m=0;for(let j=0;j<ST.length;j++)if(t>=ST[j])m=j;const el=$('f'+m);el.style.visibility='visible';eyePut(el,LK[m],1+0.03*U.p(t,ST[m],ST[m]+0.4));}
    else{const c=U.cover(HR.w,HR.h,HR.fx,HR.fy,1.12-0.08*U.eo(U.p(t,STOP,STOP+0.35))+0.04*U.p(t,STOP,${DUR}));$('hero').style.visibility='visible';$('hero').style.transform='translate('+c.x+'px,'+c.y+'px) scale('+c.k+')';}
    const cta=U.p(t,${DUR - 1.3},${DUR - 1.2});
    $('low').style.opacity=U.eo(U.p(t,STOP,STOP+0.4)); $('c0').style.opacity=U.eo(U.p(t,STOP+0.2,STOP+0.6))*(1-cta); $('c1').style.opacity=cta; wipe('h1',${DUR - 1.2},${DUR - 0.85},t); wipe('h2',${DUR - 0.85},${DUR - 0.5},t);
  };`
  return { name, fps: 30, duration: DUR, html: pageHTML({ css, body, script }), fontsCheck: ['700 64px Caveat'],
    timeline: { starts: [...md.starts, STOP], DUR },
    audio: { bed: bed ? { file: bed, groove: 'bed-d', alignAt: 0.0, gainDb: -3, fadeOut: 0.4 } : null, events: [...md.starts.map((s, i) => ({ t: s, file: 'sfx-shutter-2.wav', gainDb: -12 })), { t: STOP, file: 'sfx-shutter-2.wav', gainDb: -6 }] },
    sheet: [0.2, 0.8, 1.4, 1.9, 2.3, STOP + 0.2, STOP + 0.8, DUR - 0.4] }
}
