// C · "winner" — the current winning story deck (Istanbul DM, 8 cards) as one reel for Charlotte. Same cards, same
// order and type system, minus the film card: hook → my recent work → about me → never done this before? → now in
// Charlotte → how it works → CTA. One card per bar of the bed; prints drop onto the black table with a shutter, copy
// fades in line by line, the CTA is written on. Hook and CTA type sit under the faces (audited every 3rd frame).
import path from 'node:path'
import { pageHTML, layer } from '../lib/engine.mjs'
import { faceFocus } from '../lib/common.mjs'
import { FONTS, SE, HW, SH, CITY, BADGE, PRELOAD, print } from '../lib/charlotte.mjs'

export async function build({ stage, beatOf, ROOT, W, H, arg }) {
  // --set=top: only Aidan's top_tier_candidates picks (20 Oct), men and women
  const TOP = arg?.('set') === 'top'
  const name = TOP ? 'c-winner-top' : 'c-winner'
  const work = path.join(ROOT, 'work', name)
  const { beat, bed } = beatOf('bed-e', 110)
  const BAR = beat * 4

  const HOOK = stage(work, TOP ? 'T64' : 'T59'); Object.assign(HOOK, faceFocus(HOOK, W, H, 1.04, { x: 0, y: -0.1 }))
  const CTA = stage(work, TOP ? 'T35' : 'T64'); Object.assign(CTA, faceFocus(CTA, W, H, 1.04, { x: 0, y: -0.12 }))
  const ME = stage(work, 'aidan-udaipur-mirror-03')
  const WORK = (TOP ? ['T10', 'T39', 'T31', 'T89', 'T21'] : ['T54', 'T37', 'T25', 'T70', 'T47']).map(s => stage(work, s))
  const NERV = (TOP ? ['T14', 'T91', 'T58', 'T16', 'T49'] : ['T6', 'T12', 'T61', 'T35', 'T56']).map(s => stage(work, s))
  const NOW = stage(work, 'T8')

  // card starts: hook gets a bar and a half so the name can land
  const C = ['hook', 'work', 'about', 'nerv', 'now', 'how', 'cta']
  const len = { hook: 1.5 * BAR, work: BAR * 1.25, about: BAR * 1.25, nerv: BAR * 1.25, now: BAR, how: BAR * 1.25, cta: BAR * 1.5 }
  const start = {}; let t = 0
  for (const c of C) { start[c] = +t.toFixed(3); t += len[c] }
  const DUR = +t.toFixed(2)

  // prints: positions from the deck (x, y, width, rotation)
  const SPOTS = [[45, 560, 350, -5], [615, 520, 370, 4], [100, 1120, 360, 3], [605, 1135, 370, -4], [360, 815, 340, 2]]
  const prints = (list, pfx) => list.map((a, i) => print(a, `${pfx}${i}`, SPOTS[i][2])).join('')
  const title = (txt, size = 64) => `<div class="t ttl" style="font-size:${size}px">${txt}</div>`
  const sub = (txt, size = 35, mt = 20) => `<div class="t sub" style="font-size:${size}px;margin-top:${mt}px">${txt}</div>`
  const STEPS = [['1', 'Message me', 'Tap the button — takes a minute.'], ['2', 'We plan it', 'A quick chat to pick the spot, time & look.'], ['3', 'We shoot', 'About an hour. I direct every frame.']]

  const css = `${FONTS}
  .card{position:absolute;inset:0;display:none;overflow:hidden}
  .dark{background:#0a0a0a}
  .ttl{font:italic 700 64px/1 ${SE};color:#fff}
  .sub{font:italic 35px/1.3 ${SE};color:rgba(255,255,255,.85)}
  .head{position:absolute;left:60px;right:60px;text-align:center}
  .scrim{position:absolute;inset:0}
  .hk1{font:italic 700 150px/.88 ${SE};color:#fff;${SH}}
  .hk2{font:italic 700 80px/.98 ${SE};color:#fff;${SH};margin-top:12px}
  .hk3{font:italic 34px ${SE};color:rgba(255,255,255,.9);${SH};margin-top:28px}
  .para{font:36px/1.42 ${SE};color:rgba(255,255,255,.94);margin:0 0 24px}
  .step{display:flex;gap:30px;align-items:flex-start;margin:0 0 58px}
  .num{font:700 78px/.9 ${SE};color:rgba(255,255,255,.5);width:70px;flex:none}
  .s1{font:700 44px/1.1 ${SE};color:#fff}.s2{font:italic 30px/1.35 ${SE};color:rgba(255,255,255,.72);margin-top:10px}
  .hw{font:700 138px/.95 ${HW};color:#fff;${SH}clip-path:inset(-20% 100% -20% 0)}
  .ctl{font:34px ${SE};color:rgba(255,255,255,.92);${SH};margin-top:30px}`
  const body = `${PRELOAD}
  <div class="card" id="hook">${layer(HOOK, 'p-hook')}<div class="scrim" style="background:linear-gradient(180deg,rgba(0,0,0,.3) 0%,transparent 30%,transparent 50%,rgba(0,0,0,.88) 100%)"></div>
    <div class="head" style="top:1060px"><div class="t hk1" id="h1">${CITY}</div><div class="t hk2" id="h2">Free Photo Shoot.</div><div class="t hk3" id="h3">Want photos like these? →</div></div></div>
  <div class="card dark" id="work"><div class="head" style="top:395px">${title('my recent work')}</div>${prints(WORK, 'w')}${BADGE}</div>
  <div class="card dark" id="about"><div class="head" style="top:395px">${title('about me')}</div>
    <div class="head" style="top:520px;left:120px;right:120px">
      <div class="t para" id="a1">hi, i'm aidan — a photographer from the USA. for the past 3 years i've been traveling the world taking portraits.</div>
      <div class="t para" id="a2">right now i'm in ${CITY}.</div><div class="t para" id="a3">if you're here, let's make something special.</div></div>
    ${print(ME, 'me', 430, { mat: 12 })}${BADGE}</div>
  <div class="card dark" id="nerv"><div class="head" style="top:385px">${title('never done this before?', 60)}${sub("don't worry — i'll direct you through every frame.")}</div>${prints(NERV, 'n')}${BADGE}</div>
  <div class="card dark" id="now"><div class="head" style="top:395px">${title(`now in ${CITY}`)}${sub("it's totally free", 38, 24)}</div>${print(NOW, 'nowp', 600)}${BADGE}</div>
  <div class="card dark" id="how"><div class="head" style="top:395px">${title('how it works')}</div>
    <div style="position:absolute;top:600px;left:120px;right:120px">${STEPS.map((s, i) => `<div class="step" id="st${i}"><span class="t num">${s[0]}</span><div><div class="t s1">${s[1]}</div><div class="t s2">${s[2]}</div></div></div>`).join('')}</div>${BADGE}</div>
  <div class="card" id="cta">${layer(CTA, 'p-cta')}<div class="scrim" style="background:linear-gradient(180deg,transparent 0%,transparent 40%,rgba(0,0,0,.5) 60%,rgba(0,0,0,.92) 100%)"></div>
    <div class="head" style="top:1010px;left:56px;right:56px"><div class="t hw" id="c1">Interested?</div><div class="t hw" id="c2">Let's chat.</div><div class="t ctl" id="c3">I'm only in ${CITY} for a short time — let's shoot.</div></div>${BADGE}</div>`

  const script = `
  const ST=${JSON.stringify(start)}, LEN=${JSON.stringify(len)}, SP=${JSON.stringify(SPOTS)}, beat=${beat}, DUR=${DUR};
  const HK=${JSON.stringify({ w: HOOK.w, h: HOOK.h, fx: HOOK.fx, fy: HOOK.fy })}, CT=${JSON.stringify({ w: CTA.w, h: CTA.h, fx: CTA.fx, fy: CTA.fy })};
  const $=id=>document.getElementById(id), cards=${JSON.stringify(C)};
  const fade=(id,a,d=0.45,t)=>{const p=U.eo(U.p(t,a,a+d));$(id).style.opacity=p;$(id).style.transform='translateY('+(18*(1-p))+'px)'};
  // a print lands: from 1.12× and 0 opacity to its spot, settling into its rotation
  const drop=(id,i,a,t,spot)=>{const p=U.eo5(U.p(t,a,a+0.38)),s=spot||SP[i],el=$(id);
    el.style.opacity=U.p(t,a,a+0.12);el.style.transform='translate('+s[0]+'px,'+s[1]+'px) rotate('+(s[3]*(0.6+0.4*p))+'deg) scale('+(1.12-0.12*p)+')'};
  const wipe=(id,a,b,t)=>$(id).style.clipPath='inset(-20% '+(100-100*U.eio(U.p(t,a,b)))+'% -20% 0)';
  window.renderFrame=function(t){
    let cur=cards[0]; for(const c of cards) if(t>=ST[c]) cur=c;
    cards.forEach(c=>$(c).style.display=c===cur?'block':'none');
    const s=ST[cur], e=s+LEN[cur];
    if(cur==='hook'){const c=U.cover(HK.w,HK.h,HK.fx,HK.fy,1.04+0.06*U.p(t,0,e));$('p-hook').style.transform='translate('+c.x+'px,'+c.y+'px) scale('+c.k+')';
      fade('h1',0.25,0.6,t);fade('h2',0.25+beat,0.5,t);fade('h3',0.25+2*beat,0.5,t)}
    if(cur==='work') for(let i=0;i<5;i++) drop('w'+i,i,s+0.15+i*beat*0.5,t);
    if(cur==='about'){fade('a1',s+0.15,0.5,t);fade('a2',s+0.15+beat,0.5,t);fade('a3',s+0.15+2*beat,0.5,t);drop('me',0,s+0.3,t,[310,960,430,0])}
    if(cur==='nerv') for(let i=0;i<5;i++) drop('n'+i,i,s+0.15+i*beat*0.5,t);
    if(cur==='now') drop('nowp',0,s+0.2,t,[228,690,600,-1.5]);
    if(cur==='how') for(let i=0;i<3;i++) fade('st'+i,s+0.15+i*beat,0.45,t);
    if(cur==='cta'){const c=U.cover(CT.w,CT.h,CT.fx,CT.fy,1.04+0.05*U.p(t,s,DUR));$('p-cta').style.transform='translate('+c.x+'px,'+c.y+'px) scale('+c.k+')';
      wipe('c1',s+0.3,s+0.8,t);wipe('c2',s+0.85,s+1.35,t);$('c3').style.opacity=U.eo(U.p(t,s+1.5,s+2))}
  };`

  const drops = [...[0, 1, 2, 3, 4].map(i => start.work + 0.15 + i * beat * 0.5), start.about + 0.3, ...[0, 1, 2, 3, 4].map(i => start.nerv + 0.15 + i * beat * 0.5), start.now + 0.2]
  const events = drops.map((d, i) => ({ t: d + 0.3, file: 'sfx-shutter-2.wav', gainDb: -13 + (i % 2) }))
  return {
    name, fps: 30, duration: DUR, html: pageHTML({ css, body, script }), fontsCheck: ['700 64px Caveat', '700 22px Poppins'],
    timeline: { starts: C.map(c => start[c]), DUR, beat },
    audio: { bed: bed ? { file: bed, groove: 'bed-e', alignAt: start.work, gainDb: -1, fadeOut: 1.4 } : null, events },
    sheet: [1.6, start.hook + len.hook - 0.1, start.work + 1.0, start.work + len.work - 0.1, start.about + len.about - 0.1, start.nerv + 1.0, start.nerv + len.nerv - 0.1, start.now + len.now - 0.1, start.how + len.how - 0.1, start.cta + 0.6, start.cta + 1.2, DUR - 0.1],
  }
}
