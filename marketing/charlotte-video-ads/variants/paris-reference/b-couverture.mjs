// B · "couverture" — magazine-cover depth. Each frame becomes a cover: a huge Didot word rises up BEHIND the model
// (Apple Vision subject cut-out on top), the cut-out pushes in a little faster than the background (2.5D parallax),
// a shutter click on every beat-cut. Words read across the covers: PARIS / shooting / photo / gratuit. — the last
// cover carries the masthead and the coverlines (the CTA).
import path from 'node:path'
import { pageHTML } from '../lib/engine.mjs'
import { faceFocus, HANDLE } from '../lib/common.mjs'

export async function build({ stage, beatOf, ROOT, W, H }) {
  const name = 'b-couverture'
  const work = path.join(ROOT, 'work', name)
  const { beat, bed } = beatOf('bed-b', 84)

  // word: text; y: word box centre (px, frame coords); size: px; color; italic; beats on screen
  const COVERS = [
    { stem: 'seoul-tokyo-ulaanbaatar-etc-fun-000050-6', word: 'PARIS', size: 330, y: 492, color: '#f4efe6', italic: false, beats: 4, track: '-0.02em' }, // red dress, green wall
    { stem: 'bangkok-rosie-11893-250d-ahu-10', word: 'shooting', size: 250, y: 470, color: '#f6efe2', italic: true, beats: 3 },                        // neon night
    { stem: 'seoul-tokyo-ulaanbaatar-etc-model-000047-6', word: 'photo', size: 285, y: 458, color: '#14110f', italic: true, beats: 3 },               // black dress, fence
    { stem: 'seoul-tokyo-ulaanbaatar-etc-fun-000058-6', word: 'gratuit.', size: 260, y: 560, color: '#f6f0e8', italic: true, beats: 3 },             // red wall
    { stem: 'manila-gallery-park-001', word: 'PARIS', size: 330, y: 560, color: '#f4efe6', italic: false, beats: 7, final: true, track: '-0.02em' }, // blonde, park
  ].map(c => { const a = stage(work, c.stem, { cutout: true }); return { ...c, ...a, ...faceFocus(a), ...(c.f || {}) } })

  const starts = []; let t = 0.0
  COVERS.forEach(c => { starts.push(+t.toFixed(4)); t += c.beats * beat })
  const DUR = +t.toFixed(2)
  const F = COVERS.length - 1

  const DIDOT = "'Didot','Bodoni 72',serif"
  const css = `
  .cv{position:absolute;inset:0;overflow:hidden;visibility:hidden}
  .cv img{position:absolute;left:0;top:0;transform-origin:0 0}
  .word{position:absolute;left:50%;white-space:nowrap;font-family:${DIDOT};line-height:1}
  .word .m{display:inline-block;overflow:hidden;vertical-align:top;padding:0 .02em .08em}
  .word .m span{display:inline-block}
  .lines{position:absolute;left:66px;right:66px}
  .kick{font:600 36px system-ui,-apple-system,sans-serif;letter-spacing:.28em;text-transform:uppercase;color:#f4efe6;text-shadow:0 1px 8px rgba(0,0,0,.55)}
  .cl{font-family:${DIDOT};font-style:italic;color:#fff;text-shadow:0 2px 10px rgba(0,0,0,.6),0 8px 36px rgba(0,0,0,.4)}
  .rule{height:2px;background:rgba(255,255,255,.85);width:120px;margin:22px 0;box-shadow:0 1px 6px rgba(0,0,0,.4)}
  #grad{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0) 48%,rgba(0,0,0,.3) 60%,rgba(0,0,0,.66) 78%,rgba(0,0,0,.7) 100%)}`
  const letters = w => Array.from(w).map(ch => `<span class="m"><span>${ch}</span></span>`).join('')
  const body = COVERS.map((c, i) => `
  <div class="cv" id="c${i}">
    <img class="bg" src="${c.src}" width="${c.w}" height="${c.h}">
    ${c.final ? '<div id="grad"></div>' : ''}
    <div class="word t" style="top:${c.y - c.size * 0.55}px;font-size:${c.size}px;color:${c.color};font-style:${c.italic ? 'italic' : 'normal'};font-weight:${c.italic ? 400 : 700};letter-spacing:${c.track || '0'}">${letters(c.word)}</div>
    <img class="fg" src="${c.cut}" width="${c.w}" height="${c.h}">
    ${c.final ? `
    <div class="lines" style="top:1086px">
      <div class="kick t">shooting photo</div>
      <div class="cl t" style="font-size:128px;line-height:.95;margin-top:6px">gratuit.</div>
      <div class="cl t" style="font-size:72px;line-height:1.05;margin-top:18px">écris-moi&nbsp;→</div>
      <div class="kick t" style="margin-top:20px;letter-spacing:.06em;text-transform:none;font-weight:500;font-size:36px">${HANDLE}</div>
    </div>` : ''}
  </div>`).join('')

  const script = `
  const CV=${JSON.stringify(COVERS.map(c => ({ w: c.w, h: c.h, fx: c.fx, fy: c.fy, face: c.face, final: !!c.final })))}, ST=${JSON.stringify(starts)}, DUR=${DUR}, beat=${beat};
  const els=[...document.querySelectorAll('.cv')];
  // fit every word to ≤ 900 px wide (it grows ~10 % with the push) and centre it
  els.forEach(e=>{const w=e.querySelector('.word');let fs=parseFloat(w.style.fontSize);
    while(w.getBoundingClientRect().width>900&&fs>80){fs-=4;w.style.fontSize=fs+'px'}
    w.style.marginLeft=(-w.getBoundingClientRect().width/2)+'px'});
  function xf(c,z,ax,ay,s){ // cover transform, then an extra scale s about frame point (ax,ay)
    const k=c.k*s, x=ax+(c.x-ax)*s, y=ay+(c.y-ay)*s; return 'translate('+x+'px,'+y+'px) scale('+k+')' }
  window.renderFrame=function(t){
    let cur=0; for(let i=0;i<ST.length;i++) if(t>=ST[i]) cur=i;
    els.forEach((e,i)=>e.style.visibility=i===cur?'visible':'hidden');
    const c=CV[cur], e=els[cur], t0=ST[cur], t1=cur+1<ST.length?ST[cur+1]:DUR, p=U.p(t,t0,t1+0.25);
    const base=U.cover(c.w,c.h,c.fx,c.fy,1.0);
    // anchor = face centre in frame coords (fallback: upper middle)
    let ax=${W / 2}, ay=${H * 0.4};
    if(c.face){ ax=base.x+(c.face.box[0]+c.face.box[2]/2)*base.k; ay=base.y+(c.face.box[1]+c.face.box[3]/2)*base.k }
    // arrival: a short settle from 1.06 on the cut, then the slow 2.5D push (fg faster than bg)
    const settle=1+0.06*(1-U.eo5(U.p(t,t0,t0+0.55)));
    const bgS=settle*(1+0.025*U.eio(p)), fgS=settle*(1+0.058*U.eio(p));
    e.querySelector('.bg').style.transform=xf(base,1,ax,ay,bgS);
    e.querySelector('.fg').style.transform=xf(base,1,ax,ay,fgS);
    // the word: rises letter by letter behind the model, and drifts with a parallax between bg and fg
    const w=e.querySelector('.word'), ms=[...w.querySelectorAll('.m>span')];
    const wS=settle*(1+0.04*U.eio(p));
    w.style.transformOrigin=(ax-w.offsetLeft)+'px '+(ay-w.offsetTop)+'px'; w.style.transform='scale('+wS+')';
    ms.forEach((m,i)=>{ const q=U.eo5(U.p(t,t0+0.08+i*0.045,t0+0.08+i*0.045+0.6)); m.style.transform='translateY('+(105*(1-q))+'%)' });
    if(c.final){ const L=[...e.querySelectorAll('.lines>*')];
      L.forEach((l,i)=>{ const q=U.eo(U.p(t,t0+0.9+i*0.22,t0+1.5+i*0.22)); l.style.opacity=q; l.style.transform='translateY('+(18*(1-q))+'px)' });
      e.querySelector('#grad').style.opacity=U.eo(U.p(t,t0+0.6,t0+1.4)) }
  };`
  const html = pageHTML({ css, body, script })
  const shutters = ['sfx-shutter.wav', 'sfx-shutter-2.wav', 'sfx-shutter-3.wav']
  const events = starts.map((s, i) => ({ t: Math.max(0, s - 0.012), file: shutters[i % 3], gainDb: i === 0 ? -5 : -7 }))
  return {
    name, fps: 30, duration: DUR, html,
    fontsCheck: ["bold 100px 'Didot'", "italic 100px 'Didot'"],
    timeline: { starts, DUR, beat },
    audio: { bed: bed ? { file: bed, groove: 'bed-b', alignAt: starts[1], gainDb: 0, fadeOut: 1.6 } : null, events },
    sheet: [...starts.slice(0, F).flatMap(s => [s + 0.25, s + 1.3]), starts[F] + 0.4, starts[F] + 1.6, starts[F] + 3, DUR - 0.2],
  }
}
