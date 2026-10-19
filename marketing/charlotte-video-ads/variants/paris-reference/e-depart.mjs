// E · "départ" — the whole screen is a split-flap departures board (11 × 14 flaps). The flaps rattle into
// PARIS / SHOOTING / PHOTO / GRATUIT, then flip in a diagonal wave into a photo (each flap carries a tile of it),
// photos change with one full-screen flap, and the board rattles back for the CTA. Every flap is a real 3D hinge
// (top leaf falls, bottom leaf lands), shaded as it turns.
import path from 'node:path'
import { pageHTML } from '../lib/engine.mjs'
import { faceFocus, rng, HANDLE } from '../lib/common.mjs'

export async function build({ stage, beatOf, ROOT, W, H }) {
  const name = 'e-depart'
  const work = path.join(ROOT, 'work', name)
  const { beat, bed } = beatOf('bed-e', 100)
  const C = 11, R = 14, CWD = W / C, CHT = H / R, GAP = 3
  const FLIP = 0.075                       // one character flip (s)
  const DRUM = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ-ÉÈ@.0123456789'

  const PHOTOS = [
    'seoul-tokyo-ulaanbaatar-etc-fun-000050-6',
    'bangkok-dana-11777-neon-500t-35',
    'seoul-tokyo-ulaanbaatar-etc-arisa-000031',
    '2026-09-29-000036-2',
    'bangkok-rosie-11893-250d-ahu-10',
    'seoul-tokyo-ulaanbaatar-etc-indian-000019-2',
  ].map(stem => { const a = stage(work, stem); return { stem, src: a.src, w: a.w, h: a.h, ...faceFocus(a) } })

  const B = x => +(x * beat).toFixed(4)
  // boards: row → word (centred on the 11 columns)
  const BOARD1 = { 4: 'PARIS', 5: 'SHOOTING', 6: 'PHOTO', 7: 'GRATUIT' }
  const BOARD2 = { 4: 'PARIS', 5: 'SHOOTING', 6: 'GRATUIT', 8: 'ÉCRIS-MOI' }
  const T_BOARD1 = 0.0, T_WAVE1 = B(5), WAVE = 0.95, CELLFLIP = 0.2
  // every photo lands on a beat
  const PH = []; { let t = T_WAVE1 + B(1); PHOTOS.forEach((p, i) => { PH.push(+t.toFixed(4)); t += B(i === 0 ? 3 : 2) }) }
  const T_WAVE2 = PH.at(-1) + B(2), T_BOARD2 = T_WAVE2 + WAVE * 0.9, T_HANDLE = T_BOARD2 + 0.9, DUR = +(T_BOARD2 + B(6)).toFixed(2)
  const PFLIP = 0.36                       // full-screen photo flap

  // per-cell flip schedules for the two text boards (random rattle → target)
  const r = rng(42)
  const cellsFor = (board, t0) => {
    const out = []
    for (let y = 0; y < R; y++) for (let x = 0; x < C; x++) {
      const word = board[y]; let ch = ' '
      if (word) { const chars = Array.from(word), x0 = Math.floor((C - chars.length) / 2); if (x >= x0 && x < x0 + chars.length) ch = chars[x - x0] }
      const n = ch === ' ' ? (r() < 0.18 ? 2 + Math.floor(r() * 3) : 0) : 5 + Math.floor(r() * 7)
      const seq = [' ']; for (let k = 0; k < n - 1; k++) seq.push(DRUM[Math.floor(r() * 26)]); if (n) seq.push(ch)
      out.push({ seq, t0: +(t0 + x * 0.028 + Math.abs(y - 5.5) * 0.05 + r() * 0.05).toFixed(4) })
    }
    return out
  }
  const S1 = cellsFor(BOARD1, T_BOARD1 - 0.3), S2 = cellsFor(BOARD2, T_BOARD2)   // S1 already rattling on frame 1
  // diagonal wave delays (photo in at WAVE1 from top-left; board back at WAVE2 from bottom-right)
  const wave = (x, y, rev) => { const d = (x / (C - 1) * 0.45 + y / (R - 1) * 0.55); return +(WAVE * (rev ? 1 - d : d) * 0.8 + r() * 0.04).toFixed(4) }
  const W1 = [], W2 = []; for (let y = 0; y < R; y++) for (let x = 0; x < C; x++) { W1.push(wave(x, y, false)); W2.push(wave(x, y, true)) }

  const DIN = "'DIN Condensed','Avenir Next Condensed','Helvetica Neue',sans-serif"
  const css = `
  html,body{background:#0b0b0b}
  #grid{position:absolute;inset:0}
  .cell{position:absolute;width:${CWD - GAP}px;height:${CHT - GAP}px;perspective:520px}
  .h{position:absolute;left:0;width:100%;height:50%;overflow:hidden;background:#1b1b1a;backface-visibility:hidden}
  .h.top{top:0;border-radius:7px 7px 0 0;transform-origin:50% 100%;background:linear-gradient(#232322,#1b1b1a)}
  .h.bot{top:50%;border-radius:0 0 7px 7px;transform-origin:50% 0;background:linear-gradient(#191918,#141413)}
  .g{position:absolute;left:0;width:100%;height:${CHT - GAP}px;text-align:center;font-family:${DIN};font-weight:700;font-size:${Math.round(CHT * 0.86)}px;line-height:${CHT - GAP + 10}px;color:#efe7d6}
  .h.top .g{top:0}.h.bot .g{top:-${(CHT - GAP) / 2}px}
  .img{position:absolute;left:0;top:0;background-repeat:no-repeat}
  .shade{position:absolute;inset:0;background:#000;opacity:0;pointer-events:none}
  .seam{position:absolute;left:0;right:0;top:calc(50% - 1px);height:2px;background:#050505;opacity:.9}
  #photo,#flapA,#flapB{position:absolute;inset:0;overflow:hidden}
  #photo{visibility:hidden}
  .ph{position:absolute;left:0;width:${W}px;height:${H / 2}px;overflow:hidden;backface-visibility:hidden}
  .ph.top{top:0;transform-origin:50% 100%}.ph.bot{top:${H / 2}px;transform-origin:50% 0}
  .ph img{position:absolute;left:0;top:0;transform-origin:0 0}
  #pshade{position:absolute;inset:0;background:#000;opacity:0}
  #handle{position:absolute;left:0;right:0;top:${Math.round(9 * CHT + 26)}px;text-align:center;font:500 40px system-ui,-apple-system,sans-serif;letter-spacing:.06em;color:#efe7d6;opacity:0}
  #tag{position:absolute;left:0;right:0;top:${Math.round(3 * CHT + 34)}px;text-align:center;font:600 30px system-ui,-apple-system,sans-serif;letter-spacing:.42em;color:#c9a75a;opacity:0}`
  // grid: each cell has top/bottom static halves + falling leaf (front = current top) + landing leaf (back = next bottom)
  let grid = ''
  for (let y = 0; y < R; y++) for (let x = 0; x < C; x++) {
    const L = x * CWD + GAP / 2, T = y * CHT + GAP / 2
    grid += `<div class="cell" style="left:${L}px;top:${T}px">${['st', 'sb', 'ft', 'fb'].map(k => `<div class="h ${k[1] === 't' ? 'top' : 'bot'} ${k}"><div class="img"></div><div class="g"></div><div class="shade"></div></div>`).join('')}<div class="seam"></div></div>`
  }
  const half = (cls) => `<div class="ph ${cls}"><img><div class="shade"></div></div>`
  const body = `<div id="grid">${grid}</div>
  <div id="photo">${half('top st')}${half('bot sb')}${half('top ft')}${half('bot fb')}</div>
  <div id="tag" class="t">DÉPART</div>
  <div id="handle" class="t">${HANDLE}</div>`

  const script = `
  const C=${C}, R=${R}, CW=${CWD}, CH=${CHT}, GAP=${GAP}, FLIP=${FLIP}, CELLFLIP=${CELLFLIP}, PFLIP=${PFLIP};
  const S1=${JSON.stringify(S1)}, S2=${JSON.stringify(S2)}, W1=${JSON.stringify(W1)}, W2=${JSON.stringify(W2)};
  const PH=${JSON.stringify(PHOTOS.map(p => ({ src: p.src, w: p.w, h: p.h, fx: p.fx, fy: p.fy })))}, PT=${JSON.stringify(PH)};
  const T_WAVE1=${T_WAVE1}, T_WAVE2=${T_WAVE2}, T_BOARD2=${T_BOARD2}, T_HANDLE=${T_HANDLE}, DUR=${DUR};
  const cells=[...document.querySelectorAll('.cell')].map(c=>{const q=s=>c.querySelector('.'+s);return{st:q('st'),sb:q('sb'),ft:q('ft'),fb:q('fb'),x:parseFloat(c.style.left),y:parseFloat(c.style.top)}});
  // a face is either {ch} (character) or {p, z} (tile of photo p)
  const covers=PH.map(p=>U.cover(p.w,p.h,p.fx,p.fy,1.04));
  function paint(h, face, cell, isBot){
    const g=h.children[1], im=h.children[0];
    if(face.ch!==undefined){ im.style.display='none'; g.style.display='block'; if(g.textContent!==face.ch) g.textContent=face.ch }
    else { g.style.display='none'; im.style.display='block'; const c=covers[face.p];
      im.style.width=c.sw+'px'; im.style.height=c.sh+'px'; im.style.backgroundImage='url('+PH[face.p].src+')'; im.style.backgroundSize=c.sw+'px '+c.sh+'px';
      im.style.transform='translate('+(c.x-cell.x)+'px,'+(c.y-cell.y-(isBot?(CH-GAP)/2:0))+'px)'; }
  }
  // generic flap state: from face A to face B, progress q (0..1). top leaf falls 0→-90° (q<.5), bottom leaf lands 90°→0 (q≥.5)
  function flap(cell, A, Bf, q){
    paint(cell.st, q>0?Bf:A, cell, false); paint(cell.sb, A, cell, true);
    if(q<=0||q>=1){ cell.ft.style.visibility='hidden'; cell.fb.style.visibility='hidden'; paint(cell.sb, q>=1?Bf:A, cell, true); paint(cell.st, q>=1?Bf:A, cell, false); cell.st.children[2].style.opacity=0; cell.sb.children[2].style.opacity=0; return }
    const e = q<0.5 ? U.ei(q*2)*0.5 : 0.5+U.eo(q*2-1)*0.5;   // gravity in, settle out
    if(e<0.5){ cell.ft.style.visibility='visible'; cell.fb.style.visibility='hidden'; paint(cell.ft, A, cell, false);
      cell.ft.style.transform='rotateX('+(-180*e)+'deg)'; cell.ft.children[2].style.opacity=e*1.1; cell.st.children[2].style.opacity=0.5-e; cell.sb.children[2].style.opacity=0 }
    else { cell.ft.style.visibility='hidden'; cell.fb.style.visibility='visible'; paint(cell.fb, Bf, cell, true);
      cell.fb.style.transform='rotateX('+(180-180*e)+'deg)'; cell.fb.children[2].style.opacity=(1-e)*1.1; cell.st.children[2].style.opacity=0; cell.sb.children[2].style.opacity=(1-e)*0.8 }
  }
  function charState(s,t){ // returns [A,B,q] for a rattle schedule
    const n=s.seq.length-1; if(n<=0||t<s.t0) return [{ch:s.seq[0]},{ch:s.seq[0]},0];
    const k=Math.floor((t-s.t0)/FLIP); if(k>=n) return [{ch:s.seq[n]},{ch:s.seq[n]},1];
    return [{ch:s.seq[k]},{ch:s.seq[k+1]},(t-s.t0-k*FLIP)/FLIP];
  }
  const photo=document.getElementById('photo'), halves=[...photo.children];
  function placeHalf(h,p,isBot){ const c=covers[p], im=h.querySelector('img'); if(im.getAttribute('src')!==PH[p].src) im.setAttribute('src',PH[p].src);
    im.style.transform='translate('+c.x+'px,'+(c.y-(isBot?${H / 2}:0))+'px) scale('+c.k+')' }
  window.renderFrame=function(t){
    const gridOn = t < PT[0]+0.35 || t >= T_WAVE2-0.05;
    document.getElementById('grid').style.visibility=gridOn?'visible':'hidden';
    photo.style.visibility = (t>=PT[0]+0.3 && t<T_WAVE2+0.9) ? 'visible':'hidden';
    if(gridOn) cells.forEach((cell,i)=>{
      let A,Bf,q;
      if(t<T_WAVE1){ [A,Bf,q]=charState(S1[i],t) }
      else if(t<T_WAVE2-0.05){ const s=S1[i]; A={ch:s.seq[s.seq.length-1]}; Bf={p:0}; q=U.p(t,T_WAVE1+W1[i],T_WAVE1+W1[i]+CELLFLIP) }
      else if(t<T_BOARD2){ A={p:PH.length-1}; Bf={ch:' '}; q=U.p(t,T_WAVE2+W2[i],T_WAVE2+W2[i]+CELLFLIP) }
      else { [A,Bf,q]=charState(S2[i],t) }
      flap(cell,A,Bf,q);
    });
    // full-screen photo flaps between photos (and the mosaic seams dissolve into the clean frame)
    if(photo.style.visibility==='visible'){
      let k=0; for(let i=0;i<PT.length;i++) if(t>=PT[i]) k=i;
      const tq=k+1<PT.length? U.p(t,PT[k+1]-PFLIP,PT[k+1]) : 0;
      const A=k, Bp=Math.min(k+1,PH.length-1);
      const [st,sb,ft,fb]=halves;
      // gentle push on the photo being shown
      if(tq<=0){ placeHalf(st,A,false); placeHalf(sb,A,true); ft.style.visibility='hidden'; fb.style.visibility='hidden'; st.lastChild.style.opacity=0; sb.lastChild.style.opacity=0 }
      else { const e=tq<0.5?U.ei(tq*2)*0.5:0.5+U.eo(tq*2-1)*0.5; placeHalf(st,Bp,false); placeHalf(sb,A,true);
        if(e<0.5){ ft.style.visibility='visible'; fb.style.visibility='hidden'; placeHalf(ft,A,false); ft.style.transform='perspective(2600px) rotateX('+(-180*e)+'deg)'; ft.lastChild.style.opacity=e*1.2; st.lastChild.style.opacity=0.6-e; sb.lastChild.style.opacity=0 }
        else { ft.style.visibility='hidden'; fb.style.visibility='visible'; placeHalf(fb,Bp,true); fb.style.transform='perspective(2600px) rotateX('+(180-180*e)+'deg)'; fb.lastChild.style.opacity=(1-e)*1.2; st.lastChild.style.opacity=0; sb.lastChild.style.opacity=(1-e)*0.7 } }
      // the clean photo fades in over the mosaic once the wave has landed; the board-back wave covers it at the end
      photo.style.opacity = t<T_WAVE2 ? U.eio(U.p(t,PT[0]+0.3,PT[0]+0.75)) : 1-U.p(t,T_WAVE2-0.05,T_WAVE2);
    }
    document.getElementById('tag').style.opacity = (t<T_WAVE1? U.eo(U.p(t,0.6,1.0))*(1-U.p(t,T_WAVE1,T_WAVE1+0.2)) : 0) + (t>=T_BOARD2? U.eo(U.p(t,T_BOARD2+0.5,T_BOARD2+0.9)):0);
    document.getElementById('handle').style.opacity=U.eo(U.p(t,T_HANDLE,T_HANDLE+0.5));
  };`
  const html = pageHTML({ css, body, script })
  // board rows are text: give each word row an audit box (flaps are divs, glyph boxes are what we check)
  const events = [
    { t: 0.0, file: 'sfx-flap-cascade.wav', gainDb: -3 },
    { t: 0.3, file: 'sfx-flap-cascade.wav', gainDb: -5 },
    { t: T_WAVE1 + 0.05, file: 'sfx-flap-cascade.wav', gainDb: -4 },
    { t: T_WAVE1 + 0.45, file: 'sfx-flap-cascade.wav', gainDb: -7 },
    ...PH.slice(1).map((t, i) => ({ t: t - PFLIP * 0.5, file: `sfx-flap-${1 + (i % 4)}.wav`, gainDb: -1 })),
    { t: T_WAVE2 + 0.05, file: 'sfx-flap-cascade.wav', gainDb: -4 },
    { t: T_BOARD2 + 0.02, file: 'sfx-flap-cascade.wav', gainDb: -3 },
    { t: T_BOARD2 + 0.4, file: 'sfx-flap-cascade.wav', gainDb: -7 },
  ]
  // a little shutter blur on the flaps while they move
  const busy = t => t < 1.3 || (t > T_WAVE1 - 0.05 && t < T_WAVE1 + WAVE + 0.3) || PH.some(p => t > p - PFLIP - 0.04 && t < p + 0.04) || (t > T_WAVE2 - 0.05 && t < T_BOARD2 + 1.3)
  const blurAt = t => busy(t) ? 4 : 1
  return {
    name, fps: 30, blurAt, duration: DUR, html,
    fontsCheck: ["bold 100px 'DIN Condensed'"],
    timeline: { starts: [0, T_WAVE1, ...PH, T_WAVE2, T_BOARD2], DUR, beat },
    audio: { bed: bed ? { file: bed, groove: 'bed-e', alignAt: T_WAVE1, gainDb: -1, fadeOut: 1.4 } : null, events },
    sheet: [0, 0.3, 0.6, 1.6, T_WAVE1 + 0.3, T_WAVE1 + 0.7, PH[0] + 0.8, PH[1] - 0.2, PH[1] + 0.5, PH[3] + 0.4, T_WAVE2 + 0.4, DUR - 0.2],
  }
}
