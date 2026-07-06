import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

// === Kolkata carousel v1 — 5 CREATIVE VARIATIONS ===
// Core message on every variant: pick an outfit, pick a location, show up.
// No prep, no makeup team, no mood boards — the opposite of a "big production".
// Slides showcase top portfolio work (curated proof/ set) heavily.
// All copy lives in the SAFE MIDDLE THIRD (~y600–1280) on photo slides so it
// never covers the Meta link/CTA overlay (bottom) or the top profile overlay.
// Dark text-only slides may use y280–1300 (same envelope as the steps slide).
//
// Variants:
//   a  three-steps   — the manifesto: one giant numbered step per slide
//   b  no-list       — anti-checklist: strike through everything you DON'T need
//   c  thats-it      — minimal editorial: one short line per full-bleed image
//   d  chat          — DM-style conversation answering "what do I prepare?"
//   e  one-hour      — golden-hour timeline: zero prep before, photos after

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, 'output-kolkata-variations-v1')
const PROOF = path.join(__dirname, '../../public/images/proof')
const LARGE = path.join(__dirname, '../../public/images/large')
fs.mkdirSync(OUT, { recursive: true })

// Prefer the high-res large/ copy of a frame when one exists.
function nn(f){
  const p = fs.existsSync(path.join(LARGE,f)) ? path.join(LARGE,f) : path.join(PROOF,f)
  return 'data:image/jpeg;base64,'+fs.readFileSync(p).toString('base64')
}

const SE="Georgia,'Times New Roman',serif"
const SA="Inter,-apple-system,system-ui,sans-serif"
const SH='text-shadow:0 3px 6px rgba(0,0,0,1),0 10px 40px rgba(0,0,0,0.85),0 0 120px rgba(0,0,0,0.6);'
const GR='<div style="position:absolute;inset:0;pointer-events:none;opacity:0.08;mix-blend-mode:soft-light;background-image:radial-gradient(circle at 14% 18%,rgba(255,255,255,0.5),transparent 17%),radial-gradient(circle at 84% 12%,rgba(255,255,255,0.28),transparent 15%);"></div>'

function img(s,l,t,w,h,x){x=x||'';return '<img src="'+s+'" style="position:absolute;left:'+l+'px;top:'+t+'px;width:'+w+'px;height:'+h+'px;object-fit:cover;object-position:center top;display:block;'+x+'"/>'}
function pr(s,l,t,w,h,r,b,op){b=b||12;op=op||'center top';return '<div style="position:absolute;left:'+l+'px;top:'+t+'px;width:'+(w+b*2)+'px;height:'+(h+b*2)+'px;background:white;padding:'+b+'px;transform:rotate('+r+'deg);box-shadow:0 8px 40px rgba(0,0,0,0.45),0 2px 8px rgba(0,0,0,0.2);"><img src="'+s+'" style="width:'+w+'px;height:'+h+'px;object-fit:cover;object-position:'+op+';display:block;"/></div>'}

// Backgrounds
function hero(s,inner){return '<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">'+img(s,0,0,1080,1920,'filter:saturate(1.08) contrast(1.04);')+'<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0.28) 0%,transparent 22%,transparent 55%,rgba(0,0,0,0.55) 100%);"></div>'+inner+GR+'</div>'}
function dark(inner){return '<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#0a0e08;"><div style="position:absolute;inset:0;background:linear-gradient(170deg,#0e1410 0%,#0a0e08 50%,#080c06 100%);"></div><div style="position:absolute;inset:0;background:radial-gradient(circle at 20% 18%,rgba(80,160,80,0.10),transparent 30%),radial-gradient(circle at 80% 82%,rgba(180,150,80,0.08),transparent 25%);"></div>'+inner+GR+'</div>'}
function ctaBg(s,inner){return '<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">'+img(s,0,0,1080,1920,'filter:saturate(1.05) brightness(0.46);')+'<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0.45) 0%,rgba(0,0,0,0.2) 30%,rgba(0,0,0,0.35) 60%,rgba(0,0,0,0.9) 100%);"></div>'+inner+GR+'</div>'}
// Title-slide background — ORIGINAL gradient (dark at the very bottom so the lower-third headline reads). LOCKED.
function heroHook(s,inner){return '<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">'+img(s,0,0,1080,1920,'filter:saturate(1.1) contrast(1.05);')+'<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0.08) 0%,transparent 15%,rgba(0,0,0,0.35) 55%,rgba(0,0,0,0.96) 100%);"></div>'+inner+GR+'</div>'}

// === ORIGINAL title-slide helpers — DO NOT CHANGE. Kicker top, big headline + sub in the lower third. ===
function tagTop(t,l,top){return '<p style="position:absolute;left:'+l+'px;top:'+top+'px;font-family:'+SA+';font-size:24px;font-weight:700;color:rgba(255,255,255,0.7);letter-spacing:0.12em;text-transform:uppercase;margin:0;'+SH+'">'+t+'</p>'}
function h1B(t,bot,sz){sz=sz||108;return '<div style="position:absolute;bottom:'+bot+'px;left:64px;right:64px;"><p style="font-family:'+SE+';font-size:'+sz+'px;font-weight:700;font-style:italic;color:white;line-height:0.92;margin:0;'+SH+'">'+t+'</p></div>'}
function subB(t,bot,sz){sz=sz||34;return '<div style="position:absolute;bottom:'+bot+'px;left:64px;right:64px;"><p style="font-family:'+SA+';font-size:'+sz+'px;font-weight:500;color:rgba(255,255,255,0.85);line-height:1.35;margin:0;'+SH+'">'+t+'</p></div>'}

// === Copy block — middle third, POSITION + COLOR vary per slide for rhythm ===
// c = {eyebrow,head,sub,headSz,pos:'high'|'mid'|'low',accent:'gold'}
function copyMid(c,noScrim){
  const headSz=c.headSz||92
  const top=c.pos==='high'?600:c.pos==='low'?940:760
  const hcol=c.accent==='gold'?'#e9c986':'#fff'
  const ebcol=c.accent==='gold'?'rgba(255,255,255,0.82)':'#dcbb7d'
  const sc=noScrim?'':'<div style="position:absolute;left:0;right:0;top:'+(top-110)+'px;height:700px;background:linear-gradient(180deg,transparent,rgba(0,0,0,0.34) 16%,rgba(0,0,0,0.68) 50%,rgba(0,0,0,0.34) 84%,transparent);"></div>'
  const eb=c.eyebrow?'<p style="font-family:'+SA+';font-size:25px;font-weight:700;color:'+ebcol+';letter-spacing:0.14em;text-transform:uppercase;margin:0 0 22px;'+SH+'">'+c.eyebrow+'</p>':''
  const blk='<div style="position:absolute;left:74px;right:74px;top:'+top+'px;">'+eb
    +'<p style="font-family:'+SE+';font-size:'+headSz+'px;font-weight:700;font-style:italic;color:'+hcol+';line-height:0.97;margin:0;'+SH+'">'+c.head+'</p>'
    +'<p style="font-family:'+SA+';font-size:37px;font-weight:500;color:rgba(255,255,255,0.92);line-height:1.34;margin:26px 0 0;'+SH+'">'+c.sub+'</p></div>'
  return sc+blk
}

// === Shared layouts ===
function L_hook(s,F){return {name:'01',html:heroHook(s,tagTop(F.tag+' · Shot on 35mm film',64,64)+h1B(F.hookH,540,F.hookSz||108)+subB(F.hookS,400,42))}}
// Wide tiles crop portrait frames at 'center 22%' so faces land in the slot instead of top-of-head.
function L_collage(nm,a,b,d,c){return {name:nm,html:dark(pr(a,55,90,430,510,-2,12)+pr(b,545,90,430,240,2,10,'center 22%')+pr(d,545,378,430,250,-1.5,10,'center 22%')+copyMid(c,true))}}
function L_duo(nm,a,b,c){return {name:nm,html:dark(pr(a,70,100,440,500,-2,12)+pr(b,560,120,440,490,2,12)+copyMid(c,true))}}
function L_single(nm,s,c){return {name:nm,html:dark(pr(s,244,86,560,520,-0.5,16)+copyMid(c,true))}}
function L_hero(nm,s,c){return {name:nm,html:hero(s,copyMid(c,false))}}
function L_cta(nm,s,c){return {name:nm,html:ctaBg(s,copyMid(c,false))}}

// Giant numbered step over a full-bleed portrait (variant a).
function L_bignum(nm,s,n,c){
  const top=c.pos==='high'?600:c.pos==='low'?940:760
  const num='<p style="position:absolute;left:74px;top:'+(top-190)+'px;font-family:'+SE+';font-size:150px;font-weight:700;font-style:italic;color:#e9c986;line-height:1;margin:0;'+SH+'">'+n+'</p>'
  return {name:nm,html:hero(s,'<div style="position:absolute;left:0;right:0;top:'+(top-300)+'px;height:820px;background:linear-gradient(180deg,transparent,rgba(0,0,0,0.34) 16%,rgba(0,0,0,0.68) 50%,rgba(0,0,0,0.34) 84%,transparent);"></div>'+num+copyMid({...c,eyebrow:undefined},true))}
}

// Anti-checklist — everything you DON'T need struck through, then what you do (variant b).
function L_nolist(nm){
  const no=(t,top)=>'<div style="position:absolute;left:74px;right:74px;top:'+top+'px;"><p style="font-family:'+SE+';font-size:58px;font-weight:700;font-style:italic;color:rgba(255,255,255,0.38);margin:0;line-height:1;'+SH+'"><span style="text-decoration:line-through;text-decoration-color:rgba(233,201,134,0.9);text-decoration-thickness:5px;">'+t+'</span></p></div>'
  const inner='<div style="position:absolute;left:74px;right:74px;top:300px;"><p style="font-family:'+SA+';font-size:25px;font-weight:700;color:#dcbb7d;letter-spacing:0.14em;text-transform:uppercase;margin:0 0 20px;'+SH+'">What you need</p></div>'
    +no('A makeup team',392)+no('A mood board',492)+no('Modeling experience',592)+no('Weeks of planning',692)
    +'<div style="position:absolute;left:74px;right:74px;top:850px;"><p style="font-family:'+SE+';font-size:84px;font-weight:700;font-style:italic;color:#e9c986;margin:0;line-height:1.02;'+SH+'">An outfit.<br/>A location.<br/>You.</p>'
    +'<p style="font-family:'+SA+';font-size:36px;font-weight:500;color:rgba(255,255,255,0.9);line-height:1.35;margin:30px 0 0;'+SH+'">That&rsquo;s the whole list. I handle everything else.</p></div>'
  return {name:nm,html:dark(inner)}
}

// DM-style conversation (variant d). msgs = [{me?, t}]
function L_chat(nm,title,msgs){
  let top=560
  let rows=''
  for(const m of msgs){
    const lines=Math.ceil(m.t.length/26)
    const h=74+(lines-1)*44
    rows+=m.me
      ?'<div style="position:absolute;right:74px;top:'+top+'px;max-width:720px;background:linear-gradient(135deg,#2f6e4f,#245a40);border-radius:36px 36px 8px 36px;padding:26px 34px;box-shadow:0 6px 24px rgba(0,0,0,0.4);"><p style="font-family:'+SA+';font-size:33px;font-weight:500;color:#fff;line-height:1.32;margin:0;">'+m.t+'</p></div>'
      :'<div style="position:absolute;left:74px;top:'+top+'px;max-width:720px;background:rgba(255,255,255,0.10);border:1px solid rgba(255,255,255,0.08);border-radius:36px 36px 36px 8px;padding:26px 34px;"><p style="font-family:'+SA+';font-size:33px;font-weight:500;color:rgba(255,255,255,0.92);line-height:1.32;margin:0;">'+m.t+'</p></div>'
    top+=h+66
  }
  const head='<div style="position:absolute;left:74px;right:74px;top:320px;"><p style="font-family:'+SA+';font-size:25px;font-weight:700;color:#dcbb7d;letter-spacing:0.14em;text-transform:uppercase;margin:0 0 20px;'+SH+'">Real questions I get</p><p style="font-family:'+SE+';font-size:64px;font-weight:700;font-style:italic;color:#fff;margin:0;line-height:0.98;'+SH+'">'+title+'</p></div>'
  return {name:nm,html:dark(head+rows)}
}

// Golden-hour timeline (variant e).
function L_timeline(nm,rows,foot){
  const row=(tm,t,d,top)=>'<div style="position:absolute;left:74px;top:'+top+'px;width:150px;"><p style="font-family:'+SA+';font-size:30px;font-weight:700;color:#e9c986;margin:0;letter-spacing:0.04em;'+SH+'">'+tm+'</p></div><div style="position:absolute;left:250px;right:74px;top:'+(top-4)+'px;"><p style="font-family:'+SE+';font-size:42px;font-weight:700;font-style:italic;color:#fff;margin:0;line-height:1.04;'+SH+'">'+t+'</p><p style="font-family:'+SA+';font-size:25px;color:rgba(255,255,255,0.66);margin:9px 0 0;line-height:1.3;">'+d+'</p></div>'
  let inner='<div style="position:absolute;left:74px;right:74px;top:300px;"><p style="font-family:'+SA+';font-size:25px;font-weight:700;color:#dcbb7d;letter-spacing:0.14em;text-transform:uppercase;margin:0 0 20px;'+SH+'">The whole production</p><p style="font-family:'+SE+';font-size:64px;font-weight:700;font-style:italic;color:#fff;margin:0;line-height:0.95;'+SH+'">One golden hour.<br/>Start to finish.</p></div>'
  let top=580
  for(const r of rows){inner+=row(r[0],r[1],r[2],top);top+=160}
  inner+='<div style="position:absolute;left:74px;right:74px;top:'+(top+20)+'px;"><p style="font-family:'+SA+';font-size:25px;color:rgba(255,255,255,0.6);margin:0;line-height:1.4;'+SH+'">'+foot+'</p></div>'
  return {name:nm,html:dark(inner)}
}

// How it works — numbered, compressed to stay clear of the bottom link zone
function L_steps(nm){
  const row=(n,t,d,top)=>'<div style="position:absolute;left:74px;top:'+top+'px;font-family:'+SE+';font-size:52px;font-weight:700;font-style:italic;color:#dcbb7d;line-height:1;'+SH+'">'+n+'</div><div style="position:absolute;left:160px;right:74px;top:'+(top+1)+'px;"><p style="font-family:'+SE+';font-size:40px;font-weight:700;font-style:italic;color:#fff;margin:0;line-height:1.04;'+SH+'">'+t+'</p><p style="font-family:'+SA+';font-size:25px;color:rgba(255,255,255,0.66);margin:9px 0 0;line-height:1.3;">'+d+'</p></div>'
  const inner='<div style="position:absolute;left:74px;right:74px;top:300px;"><p style="font-family:'+SA+';font-size:25px;font-weight:700;color:#dcbb7d;letter-spacing:0.14em;text-transform:uppercase;margin:0 0 20px;'+SH+'">How it works</p><p style="font-family:'+SE+';font-size:64px;font-weight:700;font-style:italic;color:#fff;margin:0;line-height:0.95;'+SH+'">Here&rsquo;s how<br/>it works.</p></div>'
    +row('1','Sign up.','Quick form below — takes a minute.',560)
    +row('2','Pick your outfit & spot.','One quick call to lock the time. That&rsquo;s all the planning.',730)
    +row('3','Show up. We shoot.','About an hour, daytime and public. I direct every frame.',900)
    +row('4','You get the photos.','Edited 35mm scans, yours to keep. Free — we both get content.',1070)
    +'<div style="position:absolute;left:74px;right:74px;top:1240px;"><p style="font-family:'+SA+';font-size:25px;color:rgba(255,255,255,0.6);margin:0;line-height:1.4;'+SH+'">Shooting around Kolkata on 35mm film this month.</p></div>'
  return {name:nm,html:dark(inner)}
}

// === TOP PORTFOLIO — curated proof set (the "Recent work" images from the site) ===
const P=[
 nn('000041.jpg'),nn('000019-6.jpg'),nn('000001-8.jpg'),nn('000038-4.jpg'),nn('000023.jpg'),
 nn('000005-3.jpg'),nn('000012.jpg'),nn('000009.jpg'),nn('000016.jpg'),nn('000062.jpg'),
 nn('000013-3.jpg'),nn('000014-3.jpg'),nn('000015-3.jpg'),nn('000025.jpg'),nn('000039.jpg'),
 nn('000042-5.jpg'),nn('000053-5.jpg'),nn('000008-3.jpg'),nn('000008-3-2.jpg'),nn('DSC_0075.jpg'),
 nn('DSC_0321.jpg'),nn('DSC_0347.jpg'),nn('DSC_0526.jpg'),
]
console.log('Loaded '+P.length+' portraits')
function pick(off){const a=[];for(let i=0;i<11;i++)a.push(P[(off+i)%P.length]);return a}

const SPOTS='Victoria Memorial, Prinsep Ghat, the North Kolkata lanes'

// === 5 CREATIVE VARIANTS — one message: outfit + location + show up ===

// a — THREE STEPS: the manifesto, one giant numbered step per slide.
function buildA(){
  const p=pick(0)
  return [
    L_hook(p[0],{tag:'Kolkata', hookH:'Kolkata<br/>free photo shoot.', hookS:'No prep. No makeup team. Pick an outfit,<br/>pick a location, show up. Sign up below.'}),
    L_collage('02',p[1],p[2],p[3],{eyebrow:'Recent work', head:'This is what<br/>we&rsquo;ll make.', sub:'A few frames from recent shoots — all on 35mm film.', headSz:84, pos:'mid'}),
    L_bignum('03',p[4],'1',{head:'Pick an outfit.', sub:'Whatever you feel best in. Your closet is the styling department.', headSz:92, pos:'mid'}),
    L_bignum('04',p[5],'2',{head:'Pick a location.', sub:SPOTS+' — or your own para. Daytime, public, your call.', headSz:92, pos:'mid'}),
    L_bignum('05',p[6],'3',{head:'Show up.', sub:'That&rsquo;s your whole job. Posing, angles, light — I direct every frame.', headSz:92, pos:'mid'}),
    L_duo('06',p[7],p[8],{eyebrow:'What you get', head:'Edited photos,<br/>yours to keep.', sub:'Scanned 35mm film, color-graded, and sent straight to you. Free — we both build our portfolios.', headSz:84, pos:'mid', accent:'gold'}),
    L_steps('07'),
    L_cta('08',p[9],{eyebrow:'Sign up', head:'Tap the link<br/>below.', sub:'Quick form, then a quick call to pick your outfit and spot. That&rsquo;s all the planning there is.', headSz:100, pos:'low'}),
  ]
}

// b — NO-LIST: strike through everything you don't need.
function buildB(){
  const p=pick(5)
  return [
    L_hook(p[0],{tag:'Kolkata', hookH:'The photo shoot<br/>with no prep.', hookS:'Free shoot on 35mm film in Kolkata.<br/>An outfit, a location, you. Sign up below.', hookSz:100}),
    L_nolist('02'),
    L_collage('03',p[1],p[2],p[3],{eyebrow:'Recent work', head:'Made with<br/>zero prep.', sub:'Every one of these — just an outfit, a location, and an hour on film.', headSz:84, pos:'mid'}),
    L_hero('04',p[4],{eyebrow:'No styling team', head:'Your outfit is<br/>the styling.', sub:'Wear the thing you already love. It always photographs better than a costume.', headSz:88, pos:'high'}),
    L_hero('05',p[5],{eyebrow:'No studio', head:'Kolkata is<br/>the studio.', sub:SPOTS+' — daytime and public. You pick, I&rsquo;ll frame it.', headSz:88, pos:'low', accent:'gold'}),
    L_hero('06',p[6],{eyebrow:'No experience needed', head:'Come as<br/>you are.', sub:'Never modeled? Perfect. I direct every shot — posing, angles, light.', headSz:88, pos:'mid'}),
    L_duo('07',p[7],p[8],{eyebrow:'What you get', head:'Edited photos,<br/>yours to keep.', sub:'Scanned 35mm film, color-graded, sent straight to you. Free — we both get content.', headSz:84, pos:'mid', accent:'gold'}),
    L_cta('08',p[9],{eyebrow:'Sign up', head:'Bring the outfit.<br/>I&rsquo;ll bring the film.', sub:'Quick form below, then a quick call to lock the spot. That&rsquo;s the entire plan.', headSz:84, pos:'low'}),
  ]
}

// c — THAT'S IT: minimal editorial, one short line per full-bleed image.
function buildC(){
  const p=pick(10)
  return [
    L_hook(p[0],{tag:'Kolkata', hookH:'Outfit.<br/>Location.<br/>Show up.', hookS:'A free photo shoot on 35mm film in Kolkata.<br/>That&rsquo;s the whole plan. Sign up below.'}),
    L_hero('02',p[1],{head:'Pick an outfit.', sub:'The one you feel unstoppable in.', headSz:96, pos:'mid'}),
    L_hero('03',p[2],{head:'Pick a spot.', sub:SPOTS+' — anywhere daytime and public.', headSz:96, pos:'high'}),
    L_hero('04',p[3],{head:'Show up.', sub:'I direct every frame. You just have to be there.', headSz:96, pos:'low'}),
    L_hero('05',p[4],{head:'That&rsquo;s it.', sub:'No makeup team. No mood boards. No three weeks of planning.', headSz:110, pos:'mid', accent:'gold'}),
    L_collage('06',p[5],p[6],p[7],{eyebrow:'Recent work', head:'Shot on<br/>35mm film.', sub:'Frames from recent shoots — edited scans, yours to keep, free.', headSz:84, pos:'mid'}),
    L_steps('07'),
    L_cta('08',p[8],{eyebrow:'Sign up', head:'Tap the link<br/>below.', sub:'One quick form. One quick call. Then we shoot.', headSz:100, pos:'low'}),
  ]
}

// d — CHAT: the DM conversation everyone actually has with me.
function buildD(){
  const p=pick(15)
  return [
    L_hook(p[0],{tag:'Kolkata', hookH:'&ldquo;What do I need<br/>to prepare?&rdquo;', hookS:'Nothing. Free photo shoot on 35mm film.<br/>Outfit, location, show up. Sign up below.', hookSz:96}),
    L_chat('02','&ldquo;So what do<br/>I prepare?&rdquo;',[
      {t:'hey! saw the free shoot — what do I need to prepare? 😅'},
      {me:true,t:'honestly? nothing. pick an outfit you love and a spot you like.'},
      {me:true,t:'that&rsquo;s the entire prep. I handle the rest.'},
    ]),
    L_chat('03','&ldquo;Makeup?<br/>Posing?&rdquo;',[
      {t:'do I need a makeup artist? I&rsquo;ve never modeled before…'},
      {me:true,t:'nope — come as you are. I direct every single frame.'},
      {me:true,t:'posing, angles, light — that&rsquo;s my job, not yours.'},
    ]),
    L_collage('04',p[1],p[2],p[3],{eyebrow:'Recent work', head:'This is how<br/>they turn out.', sub:'All shot on 35mm film, with zero prep from anyone.', headSz:84, pos:'mid'}),
    L_chat('05','&ldquo;Okay…<br/>where?&rdquo;',[
      {t:'okay I&rsquo;m in 👀 where would we shoot?'},
      {me:true,t:'you pick — '+SPOTS.replace('the ','')+'.'},
      {me:true,t:'daytime, public, about an hour. bring a friend if you like.'},
    ]),
    L_hero('06',p[4],{eyebrow:'Why it&rsquo;s free', head:'We both get<br/>the photos.', sub:'I&rsquo;m building my portfolio; you get edited 35mm scans to keep. A collab, not a transaction.', headSz:88, pos:'high', accent:'gold'}),
    L_steps('07'),
    L_cta('08',p[5],{eyebrow:'Sign up', head:'Send the form.<br/>I&rsquo;ll reply.', sub:'Quick form below — I&rsquo;ll reach out and we&rsquo;ll plan it over one call.', headSz:92, pos:'low'}),
  ]
}

// e — ONE HOUR: the whole production is one golden hour.
function buildE(){
  const p=pick(19)
  return [
    L_hook(p[0],{tag:'Kolkata', hookH:'One hour.<br/>Zero prep.', hookS:'Free photo shoot on 35mm film in Kolkata.<br/>Outfit, spot, show up. Sign up below.'}),
    L_timeline('02',[
      ['4:45','You show up.','In the outfit you picked. That was your whole prep.'],
      ['4:50','First frame.','No warm-up needed — I direct you from the first shot.'],
      ['5:20','Golden hour.','The light does half the work. Kolkata does the rest.'],
      ['5:45','Done.','Edited 35mm scans on the way. Yours to keep, free.'],
    ],'One golden hour, daytime and public. Bring a friend if you like.'),
    L_collage('03',p[1],p[2],p[3],{eyebrow:'Recent work', head:'Made in<br/>an hour.', sub:'Frames from recent golden-hour shoots — all on 35mm film.', headSz:84, pos:'mid'}),
    L_hero('04',p[4],{eyebrow:'Before', head:'Zero prep.', sub:'No makeup team, no mood boards. An outfit and a location — done.', headSz:96, pos:'high'}),
    L_hero('05',p[5],{eyebrow:'During', head:'I direct<br/>everything.', sub:'Posing, angles, light. Never modeled? You&rsquo;ll never feel lost.', headSz:92, pos:'low', accent:'gold'}),
    L_duo('06',p[6],p[7],{eyebrow:'After', head:'The photos<br/>are yours.', sub:'Edited 35mm scans, color-graded, sent straight to you. Free — we both get content.', headSz:84, pos:'mid'}),
    L_single('07',p[8],{eyebrow:'Where', head:'You pick<br/>the spot.', sub:SPOTS+' — daytime and public. We lock it on a quick call.', headSz:86, pos:'mid'}),
    L_cta('08',p[9],{eyebrow:'Sign up', head:'Your hour&rsquo;s<br/>waiting.', sub:'Tap the link, fill the quick form, and I&rsquo;ll reach out to plan your golden hour.', headSz:92, pos:'low'}),
  ]
}

const VARIANTS=[
  {slug:'a-three-steps', build:buildA},
  {slug:'b-no-list', build:buildB},
  {slug:'c-thats-it', build:buildC},
  {slug:'d-chat', build:buildD},
  {slug:'e-one-hour', build:buildE},
]

async function render(){
  const all=[]
  for(const V of VARIANTS){const dir=path.join(OUT,V.slug);fs.mkdirSync(dir,{recursive:true});for(const s of V.build())all.push({...s,name:V.slug+'-'+s.name,dir:V.slug})}
  console.log('Rendering '+all.length+' slides...')
  // CHROME_BIN: override for environments with a system chromium instead of the playwright download.
  const browser=await chromium.launch(process.env.CHROME_BIN?{executablePath:process.env.CHROME_BIN}:{})
  const ctx=await browser.newContext({viewport:{width:1080,height:1920},deviceScaleFactor:1})
  for(let i=0;i<all.length;i++){
    const s=all[i];const page=await ctx.newPage()
    await page.setContent('<!doctype html><html><head><style>*{box-sizing:border-box}html,body{margin:0;width:1080px;height:1920px;background:#000;overflow:hidden}body{-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}</style></head><body>'+s.html+'</body></html>',{waitUntil:'load'})
    await page.waitForTimeout(250)
    await page.screenshot({path:path.join(OUT,s.dir,s.name+'.jpg'),type:'jpeg',quality:92})
    await page.close()
    if((i+1)%5===0||i===0)console.log('  ['+(i+1)+'/'+all.length+'] '+s.name)
  }
  await browser.close()
  console.log('\nDone — '+all.length+' slides -> '+OUT)
}
render()
