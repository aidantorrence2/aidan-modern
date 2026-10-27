// A · "salut" — the casting-callout story as motion. Black frame, the line "salut, je suis à paris." is typed
// (key clicks), the letters fill with a photo and the camera flies THROUGH the dot of the "i" into the first frame on
// the music's downbeat; a beat-cut montage of full-frame photos with slow pushes carries the typed caption, then a
// typed CTA on black.
import path from 'node:path'
import { pageHTML } from '../lib/engine.mjs'
import { typeTimes, keyEvents, faceFocus, HANDLE } from '../lib/common.mjs'

export async function build({ stage, beatOf, ROOT, W, H }) {
  const name = 'a-salut'
  const work = path.join(ROOT, 'work', name)
  const { beat, bed } = beatOf('bed-a', 92)

  const SHOTS = [
    { stem: 'seoul-tokyo-ulaanbaatar-etc-fun-000050-6', beats: 2 },       // red dress, green wall (revealed through the dot)
    { stem: 'bangkok-lefroncee-000046-4', beats: 2 },                      // portrait, white tee
    { stem: 'seoul-tokyo-ulaanbaatar-etc-arisa-000031', beats: 1 },        // arms up, dappled light
    { stem: 'hk-taiwan-chinese-in-taipei-000018-8', beats: 1 },            // floral slip, room
    { stem: 'taiwan-philippines-model-0004-4-6', beats: 2 },               // silver train
    { stem: 'manila-gallery-park-001', beats: 1 },                         // blonde, park
    { stem: 'bangkok-rosie-11893-250d-ahu-10', beats: 1 },                 // yellow dress, neon night
    { stem: 'seoul-tokyo-ulaanbaatar-etc-indian-000019-2', beats: 3 },     // close portrait, red top
  ].map(s => { const a = stage(work, s.stem); return { ...s, ...a, ...faceFocus(a), ...(s.f || {}) } })

  // ---- timeline ----
  const L1 = 'salut, je suis à paris.'
  const L1PX = 78
  const t1 = typeTimes(L1, 0.3, { cps: 17, seed: 11 })
  const ZOOM0 = Math.max(t1.end + 0.45, 2.0)          // letters fill with the photo, then the fly-through
  const FILL = 0.28
  const D = ZOOM0 + FILL + 0.78                         // downbeat: the dot has swallowed the frame
  const starts = [ZOOM0]; let t = D
  SHOTS.forEach((s, i) => { if (i > 0) starts.push(t); t += s.beats * beat })
  const E = t                                           // end card
  const CAP_A = 'je cherche des modèles', CAP_B = 'pour un shooting photo gratuit.'
  const ca = typeTimes(CAP_A, D + 0.6 * beat, { cps: 19, seed: 21 })
  const cb = typeTimes(CAP_B, ca.end + 0.35, { cps: 19, seed: 22 })
  const CTA = 'écris-moi si ça t’intéresse 🙂'
  const ct = typeTimes(CTA, E + 0.35, { cps: 17, seed: 31 })
  const HANDLE_T = ct.end + 0.45
  const DUR = +(HANDLE_T + 2.0).toFixed(2)

  const css = `
  #photos,#white,#ov,#cap,#end,#cur{position:absolute;inset:0}
  #white{background:#fff}
  .shot{position:absolute;inset:0;overflow:hidden;visibility:hidden}
  .shot img{position:absolute;left:0;top:0;transform-origin:0 0}
  #ov{background:#000;mix-blend-mode:multiply;isolation:isolate}
  #zoom{position:absolute;left:0;top:0;width:${W}px;height:${H}px;transform-origin:0 0}
  .line{position:absolute;white-space:pre;font:600 ${L1PX}px/1.15 system-ui,-apple-system,sans-serif;color:#fff;letter-spacing:-0.005em}
  .line span{visibility:hidden}
  #cur{pointer-events:none}
  #cursor{position:absolute;width:5px;background:#fff}
  #scrim{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0) 45%,rgba(0,0,0,.28) 62%,rgba(0,0,0,.62) 100%)}
  #capbox{position:absolute;left:72px;right:72px;bottom:520px}
  .cap{white-space:pre;font:600 56px/1.18 system-ui,-apple-system,sans-serif;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,.55),0 8px 32px rgba(0,0,0,.4)}
  .cap span{visibility:hidden}
  #end{background:#000;visibility:hidden}
  #endbox{position:absolute;left:60px;right:60px;top:820px;text-align:center}
  #cta{white-space:pre;font:600 60px/1.2 system-ui,-apple-system,sans-serif;color:#fff;display:inline-block;text-align:left}
  #cta span{visibility:hidden}
  #handle{margin-top:34px;font:500 38px system-ui,-apple-system,sans-serif;color:rgba(255,255,255,.78);letter-spacing:.02em}`
  const spans = s => Array.from(s).map(c => `<span>${c === ' ' ? ' ' : c}</span>`).join('')
  const body = `
  <div id="photos">${SHOTS.map((s, i) => `<div class="shot" id="s${i}"><img src="${s.src}" width="${s.w}" height="${s.h}"></div>`).join('')}</div>
  <div id="white"></div>
  <div id="ov"><div id="zoom"><div class="line t" id="l1">${spans(L1)}</div></div></div>
  <div id="cap"><div id="scrim"></div><div id="capbox"><div class="cap t" id="ca">${spans(CAP_A)}</div><div class="cap t" id="cb">${spans(CAP_B)}</div></div></div>
  <div id="end"><div id="endbox"><div id="cta" class="t">${spans(CTA)}</div><div id="handle" class="t">${HANDLE}</div></div></div>
  <div id="cur"><div id="cursor"></div></div>`

  const script = `
  const SH=${JSON.stringify(SHOTS.map(s => ({ w: s.w, h: s.h, fx: s.fx, fy: s.fy })))}, ST=${JSON.stringify(starts)};
  const T1=${JSON.stringify(t1.times)}, CA=${JSON.stringify(ca.times)}, CB=${JSON.stringify(cb.times)}, CT=${JSON.stringify(ct.times)};
  const ZOOM0=${ZOOM0}, FILL=${FILL}, D=${D}, E=${E}, HANDLE_T=${HANDLE_T}, beat=${beat};
  const $=id=>document.getElementById(id), shots=[...document.querySelectorAll('.shot')];
  const l1=$('l1'), l1s=[...l1.children];
  // centre the full line once; layout never moves while typing (all glyphs exist, hidden)
  const lw=l1.getBoundingClientRect().width; l1.style.left=((${W}-lw)/2)+'px'; l1.style.top='860px';
  // the dot of the "i" in "paris": x = centre of the glyph box, y from canvas ink metrics (dot top + radius)
  const iIdx=${JSON.stringify(Array.from(L1).lastIndexOf('i'))}, ib=l1s[iIdx].getBoundingClientRect();
  const probe=document.createElement('span'); probe.style.cssText='display:inline-block;width:0;height:0;vertical-align:baseline'; l1.appendChild(probe);
  const baseY=probe.getBoundingClientRect().top; probe.remove();
  const cx2=document.createElement('canvas').getContext('2d'); cx2.font='600 ${L1PX}px system-ui';
  const mi=cx2.measureText('i'), mdot=cx2.measureText('\\u0131');
  const stem=mdot.actualBoundingBoxLeft+mdot.actualBoundingBoxRight;
  const DOT={x:ib.left+ib.width/2, y:baseY-mi.actualBoundingBoxAscent+stem*0.55, d:stem*1.1};
  const SMAX=3600/DOT.d;
  const show=(spans,times,t)=>{let n=0;spans.forEach((s,i)=>{const v=t>=times[i];s.style.visibility=v?'visible':'hidden';if(v)n=i+1});return n};
  function place(i,z){const s=SH[i],c=U.cover(s.w,s.h,s.fx,s.fy,z),im=shots[i].firstChild;im.style.transform='translate('+c.x+'px,'+c.y+'px) scale('+c.k+')'}
  window.renderFrame=function(t){
    // which shot
    let cur=0; for(let i=0;i<ST.length;i++) if(t>=ST[i]) cur=i;
    const inEnd=t>=E;
    shots.forEach((s,i)=>s.style.visibility=(i===cur&&t>=ZOOM0&&!inEnd)?'visible':'hidden');
    if(t>=ZOOM0&&!inEnd){
      const s0=cur===0?ZOOM0:ST[cur], s1=cur+1<ST.length?ST[cur+1]:E;
      let z;
      if(cur===0){ // fly-through: the window frame races ahead of the scene → scene grows a little
        z = t<D ? 1+0.10*U.ei(U.p(t,ZOOM0,D)) : 1.10+0.05*U.p(t,D,s1);
      } else z = 1.03+0.06*U.eio(U.p(t,s0,s1+0.3));
      place(cur,z);
    }
    // white letters → photo letters, then zoom into the dot
    $('white').style.opacity = 1-U.eio(U.p(t,ZOOM0,ZOOM0+FILL));
    const zp=U.p(t,ZOOM0+FILL*0.6,D);
    $('ov').style.display = t>=D ? 'none' : 'block';
    if(t>=ZOOM0) $('ov').dataset.nosafe='1'; else delete $('ov').dataset.nosafe;
    const s=Math.exp(Math.log(SMAX)*Math.pow(zp,2.35));
    const ax=U.lerp(DOT.x,${W / 2},U.eio(zp)), ay=U.lerp(DOT.y,${H / 2},U.eio(zp));
    $('zoom').style.transform='translate('+ax+'px,'+ay+'px) scale('+s+') translate('+(-DOT.x)+'px,'+(-DOT.y)+'px)';
    const n1=show(l1s,T1,t);
    // captions over the montage
    const capOn=t>=D&&!inEnd;
    $('cap').style.display=capOn?'block':'none';
    $('scrim').style.opacity=U.eo(U.p(t,D,D+0.4));
    const na=show([...$('ca').children],CA,t), nb=show([...$('cb').children],CB,t);
    // end card
    $('end').style.visibility=inEnd?'visible':'hidden';
    const nc=show([...$('cta').children],CT,t);
    $('handle').style.opacity=U.eo(U.p(t,HANDLE_T,HANDLE_T+0.5));
    // one blinking text cursor that follows whatever is being typed
    let host=null,n=0,typing=false,last=0;
    if(inEnd){host=$('cta');n=nc;last=CT[CT.length-1]}
    else if(capOn&&t>=CA[0]){ if(t<CB[0]){host=$('ca');n=na;last=CA[CA.length-1]} else {host=$('cb');n=nb;last=CB[CB.length-1]} }
    else if(t<ZOOM0){host=l1;n=n1;last=T1[T1.length-1]}
    const cur$=$('cursor');
    if(host){
      const kids=host.children, ref=n>0?kids[n-1].getBoundingClientRect():kids[0].getBoundingClientRect();
      const fs=parseFloat(getComputedStyle(host).fontSize);
      const x=n>0?ref.right+3:ref.left-2;
      cur$.style.left=x+'px'; cur$.style.top=(ref.top+fs*0.12)+'px'; cur$.style.height=(fs*0.95)+'px';
      const idle=t-(n>0?(n<kids.length?t:last):t);
      const blinkOn = n<kids.length ? true : (Math.floor((t-last)/0.5)%2===0);
      cur$.style.opacity = (blinkOn && !(capOn && t>CB[CB.length-1]+1.2)) ? (host===l1?1:.92) : 0;
      if(host!==l1&&!inEnd) cur$.style.boxShadow='0 2px 8px rgba(0,0,0,.5)'; else cur$.style.boxShadow='none';
    } else cur$.style.opacity=0;
  };`

  const html = pageHTML({ css, body, script })

  // ---- audio: keys while typing, a soft air swish into the dot, bed's groove lands on D ----
  const events = [
    ...keyEvents(t1, { gainDb: -4, seed: 5 }),
    { t: ZOOM0 + FILL * 0.4, file: 'sfx-whoosh-soft.wav', gainDb: -8 },
    ...keyEvents(ca, { gainDb: -10, seed: 6 }), ...keyEvents(cb, { gainDb: -10, seed: 7 }),
    ...keyEvents(ct, { gainDb: -5, seed: 8 }),
  ]
  return {
    name, fps: 30, duration: DUR, html,
    fontsCheck: ['600 64px system-ui'],
    timeline: { ZOOM0, D, E, starts, DUR, beat },
    audio: { bed: bed ? { file: bed, groove: 'bed-a', alignAt: D, gainDb: 0, fadeOut: 1.4 } : null, events },
    sheet: [0.6, 1.2, ZOOM0 + 0.2, ZOOM0 + FILL + 0.35, ZOOM0 + FILL + 0.6, D + 0.1, starts[2] + 0.2, starts[4] + 0.3, starts[6] + 0.2, E - 0.3, E + 1.2, DUR - 0.2],
  }
}
