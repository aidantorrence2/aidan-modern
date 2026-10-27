// E · "behind" — magazine-cover depth (port of paris-reference/b-couverture). Each frame becomes a cover: a huge serif
// word rises up BEHIND the subject (Apple Vision cut-out on top), the cut-out pushes in a little faster than the
// background (2.5D parallax), a shutter click on every beat-cut. Words read across the covers:
// Charlotte / free / photo / shoot. — the last cover carries the masthead and the coverlines (the CTA).
import path from 'node:path'
import { pageHTML, fboxes } from '../lib/engine.mjs'
import { faceFocus } from '../lib/common.mjs'

export async function build({ stage, beatOf, ROOT, W, H }) {
  const name = 'e-behind'
  const work = path.join(ROOT, 'work', name)
  const { beat, bed } = beatOf('bed-b', 84)

  // word: text; y: word box centre (px, frame coords); size: px; italic; beats on screen
  const COVERS = [
    { stem: 'T62', word: 'Charlotte', size: 300, y: 560, italic: true, beats: 4 },   // blue sky
    { stem: 'T61', word: 'free', size: 330, y: 580, italic: true, beats: 3 },        // blue sky
    { stem: 'T14', word: 'photo', size: 270, y: 500, italic: true, beats: 3 },       // dark wall
    { stem: 'T65', word: 'shoot.', size: 260, y: 495, italic: true, beats: 3 },      // bridge
    { stem: 'T21', word: 'Charlotte', size: 300, y: 475, italic: true, beats: 7, final: true }, // dark studio wall
  ].map(c => { const a = stage(work, c.stem, { cutout: true }); return { ...c, ...a, ...faceFocus(a) } })

  const starts = []; let t = 0.0
  COVERS.forEach(c => { starts.push(+t.toFixed(4)); t += c.beats * beat })
  const DUR = +t.toFixed(2)
  const F = COVERS.length - 1

  const SERIF = "Georgia,'Times New Roman',serif"
  const css = `
  .cv{position:absolute;inset:0;overflow:hidden;visibility:hidden}
  .cv .bg,.cv .fg{position:absolute;left:0;top:0;transform-origin:0 0}
  .cv .fg img{width:100%;height:100%;display:block}
  .word{position:absolute;left:50%;white-space:nowrap;font-family:${SERIF};line-height:1;color:#fbf8f2;text-shadow:0 2px 18px rgba(0,0,0,.28)}
  .word .m{display:inline-block;overflow:hidden;vertical-align:top;padding:0 .03em .1em}
  .word .m span{display:inline-block}
  .lines{position:absolute;left:66px;right:66px}
  .kick{font:600 38px system-ui,-apple-system,sans-serif;letter-spacing:.24em;text-transform:uppercase;color:#fff;text-shadow:0 1px 8px rgba(0,0,0,.55)}
  .cl{font-family:${SERIF};font-style:italic;color:#fff;text-shadow:0 2px 10px rgba(0,0,0,.6),0 8px 36px rgba(0,0,0,.4)}
  #grad{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0) 48%,rgba(0,0,0,.3) 60%,rgba(0,0,0,.66) 78%,rgba(0,0,0,.7) 100%)}`
  const letters = w => Array.from(w).map(ch => `<span class="m"><span>${ch}</span></span>`).join('')
  const body = COVERS.map((c, i) => `
  <div class="cv" id="c${i}">
    <img class="bg" src="${c.src}" width="${c.w}" height="${c.h}">
    <div data-behind><div class="word t" style="top:${c.y - c.size * 0.55}px;font-size:${c.size}px;font-style:${c.italic ? 'italic' : 'normal'};font-weight:400">${letters(c.word)}</div></div>
    <div class="fg" style="width:${c.w}px;height:${c.h}px"><img src="${c.cut}">${fboxes(c)}</div>
    ${c.final ? `<div id="grad"></div>
    <div class="lines" style="top:1060px">
      <div class="kick t">Free Photo Shoot</div>
      <div class="cl t" style="font-size:124px;line-height:.98;margin-top:14px">Interested?</div>
      <div class="cl t" style="font-size:84px;line-height:1.05;margin-top:12px">Let’s chat.</div>
    </div>` : ''}
  </div>`).join('')

  const script = `
  const CV=${JSON.stringify(COVERS.map(c => ({ w: c.w, h: c.h, fx: c.fx, fy: c.fy, face: c.face, final: !!c.final })))}, ST=${JSON.stringify(starts)}, DUR=${DUR}, beat=${beat};
  const els=[...document.querySelectorAll('.cv')];
  // fit every word to ≤ 900 px wide (it grows ~10 % with the push) and centre it
  els.forEach(e=>{const w=e.querySelector('.word');let fs=parseFloat(w.style.fontSize);
    while(w.getBoundingClientRect().width>900&&fs>80){fs-=4;w.style.fontSize=fs+'px'}
    w.style.marginLeft=(-w.getBoundingClientRect().width/2)+'px'});
  function xf(c,ax,ay,s){ const k=c.k*s, x=ax+(c.x-ax)*s, y=ay+(c.y-ay)*s; return 'translate('+x+'px,'+y+'px) scale('+k+')' }
  window.renderFrame=function(t){
    let cur=0; for(let i=0;i<ST.length;i++) if(t>=ST[i]) cur=i;
    els.forEach((e,i)=>e.style.visibility=i===cur?'visible':'hidden');
    const c=CV[cur], e=els[cur], t0=ST[cur], t1=cur+1<ST.length?ST[cur+1]:DUR, p=U.p(t,t0,t1+0.25);
    const base=U.cover(c.w,c.h,c.fx,c.fy,1.0);
    let ax=${W / 2}, ay=${H * 0.4};
    if(c.face){ ax=base.x+(c.face.box[0]+c.face.box[2]/2)*base.k; ay=base.y+(c.face.box[1]+c.face.box[3]/2)*base.k }
    const settle=1+0.06*(1-U.eo5(U.p(t,t0,t0+0.55)));
    const bgS=settle*(1+0.025*U.eio(p)), fgS=settle*(1+0.058*U.eio(p));
    e.querySelector('.bg').style.transform=xf(base,ax,ay,bgS);
    e.querySelector('.fg').style.transform=xf(base,ax,ay,fgS);
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
    fontsCheck: ['italic 100px Georgia'],
    timeline: { starts, DUR, beat },
    audio: { bed: bed ? { file: bed, groove: 'bed-b', alignAt: starts[1], gainDb: 0, fadeOut: 1.6 } : null, events },
    sheet: [...starts.slice(0, F).flatMap(s => [s + 0.25, s + 1.3]), starts[F] + 0.4, starts[F] + 1.6, starts[F] + 3, DUR - 0.2],
  }
}
