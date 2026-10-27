// A · "notes" — the Notes-app still as motion. A note types itself out (key clicks, blinking cursor), portraits pop
// into the bottom of the note as each line lands, then the note slides up off a full-frame portrait and the CTA is
// written on below her face. Looks like a story a person posted, not an ad.
import path from 'node:path'
import { pageHTML, layer } from '../lib/engine.mjs'
import { typeTimes, keyEvents, faceFocus } from '../lib/common.mjs'
import { FONTS, HW, SANS, SH, CITY, FONT_CHECK, spans, SHOW } from '../lib/charlotte.mjs'

export async function build({ stage, beatOf, ROOT, W, H, arg }) {
  // --set=mixed: each pair is one man + one woman (men's five-stars T39–T44)
  // --set=top: only Aidan's top_tier_candidates picks (20 Oct), each pair one woman + one man
  const SET = arg?.('set') || 'women', MIXED = SET === 'mixed', TOP = SET === 'top'
  const name = SET === 'women' ? 'a-notes' : `a-notes-${SET}`
  const work = path.join(ROOT, 'work', name)
  const { beat, bed } = beatOf('bed-a', 90)

  // note tiles (two at a time, swapped as lines land) and the end frame
  // Aidan's Lightroom five-stars only (v4, 20 Oct): three pairs, each mixing a face close-up with a full look
  const TILES = (TOP ? ['T14', 'T39', 'T73', 'T91', 'T31', 'T16'] : MIXED ? ['T43', 'T55', 'T51', 'T39', 'T42', 'T46'] : ['T54', 'T37', 'T38', 'T47', 'T53', 'T28']).map(s => stage(work, s))
  const END = stage(work, TOP ? 'T48' : MIXED ? 'T44' : 'T48'); Object.assign(END, faceFocus(END))

  const LINES = [
    { s: `free photo shoots in ${CITY.toLowerCase()}📍`, px: 60, w: 700, cps: 15, gap: 0.5 },
    { s: "i'm a portrait photographer, in town for a few weeks.", px: 42, w: 400, cps: 24, gap: 0.35 },
    { s: '– no experience needed, i direct everything', px: 42, w: 400, cps: 26, gap: 0.25 },
    { s: '– about an hour, anywhere in the city', px: 42, w: 400, cps: 26, gap: 0.25 },
    { s: '– you keep the edited photos', px: 42, w: 400, cps: 26, gap: 0.25 },
    { s: '– $0', px: 42, w: 400, cps: 14, gap: 0.45 },
    { s: 'tap the button and say hi 👋', px: 42, w: 400, cps: 20, gap: 0.2 },
  ]
  let t = 0.2   // typing starts almost at once and the first two portraits are already on the page: frame 1 has to stop the scroll
  const sched = LINES.map((l, i) => { const r = typeTimes(l.s, t, { cps: l.cps, seed: 40 + i }); t = r.end + l.gap; return r })
  // a new pair of tiles lands with lines 2, 3 and 5
  const TILE_T = [0, sched[3].times[0], sched[5].times[0]]
  const SLIDE = t + 0.7                      // note slides away
  const CTA_T = SLIDE + 0.55
  const DUR = +(CTA_T + 2.6).toFixed(2)
  const ct = { a: CTA_T, b: CTA_T + 0.55, line: CTA_T + 1.15 }

  const css = `${FONTS}
  #note{position:absolute;inset:0;background:#fbfaf6;will-change:transform}
  #txt{position:absolute;left:70px;right:70px;top:300px;font-family:${SANS};color:#1c1c1e}
  #hdr{font:600 30px ${SANS};color:#e0a100;margin:0 0 34px}
  .ln{white-space:pre-wrap;margin:0 0 16px;line-height:1.35}
  .ln.h{font-weight:700;line-height:1.1;margin:0 0 30px}
  #cursor{position:absolute;width:4px;background:#e0a100}
  .tile{position:absolute;top:0;left:0;width:430px;height:560px;overflow:hidden;opacity:0}
  #end{position:absolute;inset:0;overflow:hidden}
  #scrim{position:absolute;inset:0;background:linear-gradient(180deg,transparent 0%,transparent 45%,rgba(0,0,0,.55) 65%,rgba(0,0,0,.9) 100%)}
  #cta{position:absolute;left:56px;right:56px;top:1010px;text-align:center}
  .hw{font:700 138px/0.95 ${HW};color:#fff;${SH}clip-path:inset(0 100% 0 0)}
  #ctl{font:34px Georgia,serif;color:rgba(255,255,255,.92);margin-top:30px;${SH}opacity:0}`
  // tile pairs: left at x 90, right at x 560, y 1120 (below all note text; tiles are photos, not text)
  const pairs = [[0, 1], [2, 3], [4, 5]]
  const body = `
  <div id="end">${layer(END, 'endph')}<div id="scrim"></div>
    <div id="cta"><div class="hw t" id="c1">Interested?</div><div class="hw t" id="c2">Let's chat.</div><div class="t" id="ctl">I'm only in ${CITY} for a short time — let's shoot.</div></div></div>
  <div id="note" data-card><div id="txt"><div id="hdr" class="t">‹ Notes</div>
    ${LINES.map((l, i) => `<div class="ln t${i === 0 ? ' h' : ''}" id="l${i}" style="font-size:${l.px}px;font-weight:${i === 0 ? 700 : 400}">${spans(l.s)}</div>`).join('')}</div>
    ${pairs.map((p, j) => p.map((ti, k) => `<div class="tile" id="tile${j}${k}" style="left:${k ? 560 : 90}px;top:1120px">${layer(TILES[ti], `tp${ti}`)}</div>`).join('')).join('')}
    <div id="cursor"></div></div>`

  const script = `${SHOW}
  const S=${JSON.stringify(sched.map(s => s.times))}, TT=${JSON.stringify(TILE_T)}, SLIDE=${SLIDE}, CT=${JSON.stringify(ct)};
  const TI=${JSON.stringify(TILES.map(a => ({ w: a.w, h: a.h, ...faceFocus(a, 430, 560) })))}, EN=${JSON.stringify({ w: END.w, h: END.h, fx: END.fx, fy: END.fy })};
  const $=id=>document.getElementById(id), lines=S.map((_,i)=>$('l'+i));
  // tiles: cover-fit each photo into its 430×560 window around the face
  ${'[0,1,2,3,4,5]'}.forEach(i=>{const a=TI[i],c=U.cover(a.w,a.h,a.fx,a.fy,1,430,560);$('tp'+i).style.transform='translate('+c.x+'px,'+c.y+'px) scale('+c.k+')'});
  window.renderFrame=function(t){
    let host=null,n=0,last=0;
    lines.forEach((el,i)=>{const k=show(el,S[i],t); if(t>=S[i][0]){host=el;n=k;last=S[i][S[i].length-1]}});
    // tile pairs: each pair pops in (scale 0.92→1, fade) and the previous pair fades out
    for(let j=0;j<3;j++){const on=U.p(t,TT[j],TT[j]+0.35), off=j<2?U.p(t,TT[j+1],TT[j+1]+0.3):0;
      for(let k=0;k<2;k++){const el=$('tile'+j+k), d=k*0.12, o=(j===0?1:U.eo(U.p(t,TT[j]+d,TT[j]+d+0.35)))*(1-off), s=j===0?1:0.92+0.08*U.eo(U.p(t,TT[j]+d,TT[j]+d+0.4)); // first pair is on the page from frame 1
        el.style.opacity=o; el.style.transform='scale('+s+')';}}
    // cursor follows the line being typed, blinks when idle
    const cur=$('cursor');
    if(host&&t<SLIDE){const kids=host.children,ref=(n>0?kids[n-1]:kids[0]).getBoundingClientRect(),fs=parseFloat(host.style.fontSize);
      cur.style.left=(n>0?ref.right+3:ref.left)+'px'; cur.style.top=(ref.top+fs*.1)+'px'; cur.style.height=(fs*1.05)+'px';
      cur.style.opacity=(n<kids.length||Math.floor((t-last)/0.5)%2===0)?1:0;} else cur.style.opacity=0;
    // the note slides up and away, revealing the portrait underneath
    const sp=U.eio(U.p(t,SLIDE,SLIDE+0.6)); $('note').style.transform='translateY('+(-${H}*sp)+'px)'; $('note').style.display=sp>=1?'none':'block'; if(t>=SLIDE) $('note').dataset.nosafe='1'; else delete $('note').dataset.nosafe;
    const z=1.04+0.05*U.p(t,SLIDE,${DUR}), c=U.cover(EN.w,EN.h,EN.fx,EN.fy,z); $('endph').style.transform='translate('+c.x+'px,'+c.y+'px) scale('+c.k+')';
    // CTA written on: a left→right reveal per handwritten line, then the small line fades in
    $('c1').style.clipPath='inset(0 '+(100-100*U.eio(U.p(t,CT.a,CT.a+0.5)))+'% 0 0)';
    $('c2').style.clipPath='inset(0 '+(100-100*U.eio(U.p(t,CT.b,CT.b+0.5)))+'% 0 0)';
    $('ctl').style.opacity=U.eo(U.p(t,CT.line,CT.line+0.5));
    $('cta').style.visibility=t>=CT.a?'visible':'hidden'; $('end').style.visibility=t>=SLIDE?'visible':'hidden';
  };`

  const events = [...sched.flatMap((s, i) => keyEvents(s, { gainDb: i === 0 ? -5 : -9, seed: 60 + i })), { t: SLIDE + 0.05, file: 'sfx-whoosh-soft.wav', gainDb: -9 }]
  return {
    name, fps: 30, duration: DUR, html: pageHTML({ css, body, script }), fontsCheck: ['700 64px Caveat'],
    timeline: { starts: [0, TILE_T[0], TILE_T[1], TILE_T[2], SLIDE, CTA_T], DUR },
    audio: { bed: bed ? { file: bed, groove: 'bed-a', alignAt: SLIDE, gainDb: -2, fadeOut: 1.4 } : null, events },
    sheet: [0.4, 1.6, sched[1].times[10], TILE_T[0] + 0.5, sched[2].times[20], TILE_T[1] + 0.5, sched[4].times[10], TILE_T[2] + 0.5, SLIDE - 0.3, SLIDE + 0.3, CTA_T + 0.7, DUR - 0.2],
  }
}
