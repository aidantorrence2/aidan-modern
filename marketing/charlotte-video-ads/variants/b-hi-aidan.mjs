// B · "hi, i'm aidan" — the photographer introduces himself before anyone asks "who is this?". Mirror selfie with a
// slow push and his handwritten hello (written below his head), then "here's what i shoot": eye-locked cuts through
// full-frame portraits (the eyes stay put while the photos change), accelerating like a motor drive and stopping dead on
// one face, then the offer and the CTA. Photos: Aidan's Lightroom five-stars only (v2, 20 Oct). Photo-motion stand-in until
// Aidan films the 10-second selfie version (see HI-AIDAN-SHOTLIST.md).
import path from 'node:path'
import { pageHTML, layer } from '../lib/engine.mjs'
import { faceFocus } from '../lib/common.mjs'
import { FONTS, SE, HW, SH, CITY } from '../lib/charlotte.mjs'
import { eyeLock, motorDrive, EYE_PUT } from '../lib/eyelock.mjs'

export async function build({ stage, beatOf, ROOT, W, H, arg }) {
  // --set=mixed: men's five-stars alternate with the women's (eyes locked higher, at 0.28H, so the street frames line up)
  // --set=top: only Aidan's top_tier_candidates picks (20 Oct), men and women alternating, eyes locked at 0.38H
  const SET = arg?.('set') || 'women', MIXED = SET === 'mixed', TOP = SET === 'top'
  const name = SET === 'women' ? 'b-hi-aidan' : `b-hi-aidan-${SET}`
  const work = path.join(ROOT, 'work', name)
  const { beat, bed } = beatOf('bed-b', 95)

  const SELF = stage(work, 'aidan-udaipur-mirror-01'); Object.assign(SELF, { fx: 0.5, fy: 0.5 })
  // five-star portraits, eye-locked at (540, 0.4H); the last one is where the motor drive stops dead
  const LOCK = { X0: W / 2, Y0: H * (MIXED ? 0.28 : TOP ? 0.38 : 0.4), maxZ: 1.4 }
  const MONTAGE = (TOP ? ['T73', 'T16', 'T31', 'T39', 'T14', 'T91', 'T10', 'T89', 'T58', 'T20', 'T49', 'T64'] : MIXED ? ['T43', 'T35', 'T42', 'T46', 'T44', 'T51', 'T40', 'T67', 'T52', 'T39'] : ['T37', 'T38', 'T30', 'T53', 'T28', 'T48', 'T56', 'T47']).map(s => { const a = stage(work, s); return { ...a, L: { ...eyeLock(a, LOCK), w: a.w, h: a.h, ...LOCK } } })
  const OFFER = stage(work, TOP ? 'T8' : MIXED ? 'T41' : 'T54'); Object.assign(OFFER, faceFocus(OFFER, W, H, 1.04, { x: 0, y: -0.14 }))
  const END = stage(work, TOP ? 'T35' : MIXED ? 'T55' : 'T45'); Object.assign(END, faceFocus(END, W, H, 1.04, { x: 0, y: -0.14 }))

  // timeline (s): intro on the selfie, montage on the beat, offer, CTA
  const HI = 0.35, LINE = 1.55, M0 = 3.6
  const md = motorDrive(MONTAGE.length - 1, M0, { first: 0.6, last: 0.14 })
  const MST = [...md.starts, md.end]                 // last face starts where the drive stops, and holds
  const HOLD = 1.0
  const starts = [0, ...MST]
  const O0 = md.end + HOLD; starts.push(O0)
  const E0 = O0 + 2.6; starts.push(E0)
  const DUR = +(E0 + 2.9).toFixed(2)

  const css = `${FONTS}
  .ph{visibility:hidden}
  .scrim{position:absolute;inset:0;pointer-events:none}
  #s-low{background:linear-gradient(180deg,transparent 0%,transparent 48%,rgba(0,0,0,.5) 66%,rgba(0,0,0,.85) 100%)}
  #s-top{background:linear-gradient(180deg,rgba(0,0,0,.55) 0%,transparent 30%)}
  .blk{position:absolute;left:56px;right:56px;text-align:center}
  .hw{font:700 120px/1 ${HW};color:#fff;${SH}clip-path:inset(0 100% 0 0)}
  .se{font:italic 44px/1.3 ${SE};color:#fff;${SH}}
  .big{font:italic 700 66px/1.05 ${SE};color:#fff;${SH}}
  .sm{font:italic 36px/1.3 ${SE};color:rgba(255,255,255,.92);${SH}}
  .cta{font:700 138px/.95 ${HW};color:#fff;${SH}clip-path:inset(0 100% 0 0)}`
  const body = `
  ${layer(SELF, 'p-self')}${MONTAGE.map((a, i) => layer(a, 'p-m' + i)).join('')}${layer(OFFER, 'p-off')}${layer(END, 'p-end')}
  <div class="scrim" id="s-low"></div><div class="scrim" id="s-top"></div>
  <div class="blk" id="b-hi" style="top:1090px"><div class="hw t" id="hi">hi, i'm aidan 👋</div>
    <div class="se t" id="who" style="margin-top:26px">i take portraits, and i'm in ${CITY}<br>for a few weeks.</div></div>
  <div class="blk" id="b-shoot" style="top:${MIXED ? 1300 : 290}px"><div class="sm t" id="shoot" style="font-size:48px">here's what i shoot →</div></div>
  <div class="blk" id="b-off" style="top:1130px"><div class="big t" id="o1">want photos like these?</div><div class="sm t" id="o2" style="margin-top:16px">it's a free photo shoot, about an hour. i direct everything.</div></div>
  <div class="blk" id="b-end" style="top:1010px"><div class="cta t" id="c1">Interested?</div><div class="cta t" id="c2">Let's chat.</div></div>`

  const all = [SELF, ...MONTAGE, OFFER, END]
  const script = `
  const A=${JSON.stringify(all.map(a => ({ w: a.w, h: a.h, fx: a.fx, fy: a.fy })))}, LK=${JSON.stringify(MONTAGE.map(a => a.L))}, MST=${JSON.stringify(MST)}, beat=${beat};
  ${EYE_PUT}
  const HI=${HI}, LINE=${LINE}, M0=${M0}, O0=${O0}, E0=${E0}, DUR=${DUR};
  const $=id=>document.getElementById(id), ids=['p-self',${MONTAGE.map((_, i) => `'p-m${i}'`).join(',')},'p-off','p-end'];
  const put=(i,z)=>{const a=A[i],c=U.cover(a.w,a.h,a.fx,a.fy,z),el=$(ids[i]);el.style.visibility='visible';el.style.transform='translate('+c.x+'px,'+c.y+'px) scale('+c.k+')'};
  const vis=(id,on)=>$(id).style.display=on?'block':'none';
  const wipe=(id,a,b,t)=>$(id).style.clipPath='inset(-20% '+(100-100*U.eio(U.p(t,a,b)))+'% -20% 0)';
  window.renderFrame=function(t){
    ids.forEach(id=>$(id).style.visibility='hidden');
    let i; // which photo
    if(t>=M0&&t<O0){ // eye-locked montage: which cut, and a small push about the eye point (eyes never move)
      let m=0; for(let j=0;j<MST.length;j++) if(t>=MST[j]) m=j;
      const el=$(ids[1+m]); el.style.visibility='visible';
      const s0=MST[m], s1=m+1<MST.length?MST[m+1]:O0;
      eyePut(el,LK[m],1+0.035*U.p(t,s0,s1));
    } else {
      const i = t<M0 ? 0 : (t<E0 ? ${MONTAGE.length + 1} : ${MONTAGE.length + 2}), s0 = i===0?0:(i===${MONTAGE.length + 1}?O0:E0), s1 = i===0?M0:(i===${MONTAGE.length + 1}?E0:DUR);
      put(i, i===0 ? 1.0+0.08*U.eio(U.p(t,0,M0)) : 1.04+0.04*U.p(t,s0,s1));
    }
    // intro
    vis('b-hi',t<M0); wipe('hi',HI,HI+0.9,t); $('who').style.opacity=U.eo(U.p(t,LINE,LINE+0.5));
    // montage label
    vis('b-shoot',t>=M0&&t<O0); $('shoot').style.opacity=U.eo(U.p(t,M0,M0+0.3));
    // offer
    vis('b-off',t>=O0&&t<E0); $('o1').style.opacity=U.eo(U.p(t,O0+0.15,O0+0.6)); $('o2').style.opacity=U.eo(U.p(t,O0+0.8,O0+1.3));
    // CTA
    vis('b-end',t>=E0); wipe('c1',E0+0.3,E0+0.8,t); wipe('c2',E0+0.85,E0+1.35,t);
    $('s-low').style.opacity=1; $('s-top').style.opacity=(t>=M0&&t<O0)?1:0;
  };`

  const events = [...starts.slice(1).map((s, i) => ({ t: s, file: 'sfx-shutter-2.wav', gainDb: i < MST.length ? -12 : -15 }))]
  return {
    name, fps: 30, duration: DUR, html: pageHTML({ css, body, script }), fontsCheck: ['700 64px Caveat'],
    timeline: { starts, DUR, beat },
    audio: { bed: bed ? { file: bed, groove: 'bed-b', alignAt: M0, gainDb: -1, fadeOut: 1.4 } : null, events },
    sheet: [1.2, 2.6, ...MST.slice(0, 8).map((s, i) => +(s + ((MST[i + 1] ?? O0) - s) / 2).toFixed(3)), O0 + 1.6, DUR - 0.2],
  }
}
