import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

// === Kolkata carousel v3 — 5 MORE VARIATIONS, built on v2's d/f/g DNA ===
// Same rules as v2: every variant opens with the locked "Kolkata free photo
// shoot." title slide; every later slide carries the "Kolkata · Free photo
// shoot" tag top right. Same core message: outfit + location + show up,
// zero production. These five lean harder into the conversational /
// objection-killing angle that made d (chat), f (myth) and g (excuses) work:
//
//   i  the-catch     — the skeptic's DM: "free? what's the catch?" answered
//   j  rapid-qa      — one question per slide, answered in five words
//   k  myth-stamps   — one myth per slide, struck through and corrected
//   l  overthinking  — the "I'll do it when…" spiral, interrupted
//   m  receipt       — the itemized bill: everything ₹0, you pay by showing up

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, 'output-kolkata-variations-v3')
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
const SM="'Courier New',Courier,monospace"
const SH='text-shadow:0 3px 6px rgba(0,0,0,1),0 10px 40px rgba(0,0,0,0.85),0 0 120px rgba(0,0,0,0.6);'
const GR='<div style="position:absolute;inset:0;pointer-events:none;opacity:0.08;mix-blend-mode:soft-light;background-image:radial-gradient(circle at 14% 18%,rgba(255,255,255,0.5),transparent 17%),radial-gradient(circle at 84% 12%,rgba(255,255,255,0.28),transparent 15%);"></div>'

// Top-right campaign tag for every slide after the title slide.
const BADGE='<p style="position:absolute;right:64px;top:64px;font-family:'+SA+';font-size:24px;font-weight:700;color:rgba(255,255,255,0.7);letter-spacing:0.12em;text-transform:uppercase;margin:0;text-align:right;'+SH+'">Kolkata · Free photo shoot</p>'
function withBadge(s){return {...s, html:s.html.slice(0,-'</div>'.length)+BADGE+'</div>'}}

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

// === Layouts ===
// LOCKED title slide — every variant opens with the same "Kolkata free photo shoot." headline.
function L_hook(s,hookS){return {name:'01',html:heroHook(s,tagTop('Kolkata · Shot on 35mm film',64,64)+h1B('Kolkata<br/>free photo shoot.',540,108)+subB(hookS,400,42))}}
// Wide tiles crop portrait frames at 'center 22%' so faces land in the slot instead of top-of-head.
function L_collage(nm,a,b,d,c){return {name:nm,html:dark(pr(a,55,90,430,510,-2,12)+pr(b,545,90,430,240,2,10,'center 22%')+pr(d,545,378,430,250,-1.5,10,'center 22%')+copyMid(c,true))}}
function L_duo(nm,a,b,c){return {name:nm,html:dark(pr(a,70,100,440,500,-2,12)+pr(b,560,120,440,490,2,12)+copyMid(c,true))}}
function L_single(nm,s,c){return {name:nm,html:dark(pr(s,244,86,560,520,-0.5,16)+copyMid(c,true))}}
function L_hero(nm,s,c){return {name:nm,html:hero(s,copyMid(c,false))}}
function L_cta(nm,s,c){return {name:nm,html:ctaBg(s,copyMid(c,false))}}

// DM-style conversation (variants i, l). msgs = [{me?, t}]
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

// One myth per slide, struck through and corrected in gold (variant k).
function L_myth(nm,s,n,myth,truth,sub,pos){
  const top=pos==='high'?600:pos==='low'?940:730
  const blk='<div style="position:absolute;left:0;right:0;top:'+(top-140)+'px;height:760px;background:linear-gradient(180deg,transparent,rgba(0,0,0,0.34) 16%,rgba(0,0,0,0.68) 50%,rgba(0,0,0,0.34) 84%,transparent);"></div>'
    +'<div style="position:absolute;left:74px;right:74px;top:'+top+'px;">'
    +'<p style="font-family:'+SA+';font-size:25px;font-weight:700;color:#dcbb7d;letter-spacing:0.14em;text-transform:uppercase;margin:0 0 22px;'+SH+'">Myth #'+n+'</p>'
    +'<p style="font-family:'+SE+';font-size:64px;font-weight:700;font-style:italic;color:rgba(255,255,255,0.55);line-height:1.02;margin:0;'+SH+'"><span style="text-decoration:line-through;text-decoration-color:rgba(233,201,134,0.9);text-decoration-thickness:5px;">'+myth+'</span></p>'
    +'<p style="font-family:'+SE+';font-size:88px;font-weight:700;font-style:italic;color:#e9c986;line-height:0.97;margin:20px 0 0;'+SH+'">'+truth+'</p>'
    +'<p style="font-family:'+SA+';font-size:37px;font-weight:500;color:rgba(255,255,255,0.92);line-height:1.34;margin:26px 0 0;'+SH+'">'+sub+'</p></div>'
  return {name:nm,html:hero(s,blk)}
}

// The itemized ₹0 receipt (variant m).
function L_receipt(nm){
  const row=(t,bold)=>'<div style="display:flex;align-items:baseline;gap:14px;margin:0 0 '+(bold?'0':'26px')+';"><span style="font-family:'+SM+';font-size:'+(bold?'40px':'32px')+';font-weight:'+(bold?'700':'400')+';color:#1d1d1d;white-space:nowrap;">'+t[0]+'</span><span style="flex:1;border-bottom:3px dotted #999;transform:translateY(-6px);"></span><span style="font-family:'+SM+';font-size:'+(bold?'40px':'32px')+';font-weight:'+(bold?'700':'400')+';color:#1d1d1d;white-space:nowrap;">'+t[1]+'</span></div>'
  const card='<div style="position:absolute;left:165px;top:120px;width:750px;background:#faf8f2;padding:54px 58px 46px;transform:rotate(-1.2deg);box-shadow:0 14px 60px rgba(0,0,0,0.55),0 3px 10px rgba(0,0,0,0.3);">'
    +'<p style="font-family:'+SM+';font-size:34px;font-weight:700;color:#1d1d1d;letter-spacing:0.08em;text-align:center;margin:0;">KOLKATA PHOTO SHOOT</p>'
    +'<p style="font-family:'+SM+';font-size:26px;color:#666;text-align:center;letter-spacing:0.12em;margin:8px 0 0;">* * *  RECEIPT  * * *</p>'
    +'<div style="border-bottom:3px dashed #bbb;margin:30px 0 34px;"></div>'
    +row(['Stylist','₹0'])+row(['Makeup artist','₹0'])+row(['Studio rental','₹0'])+row(['Photographer','₹0'])+row(['35mm film + editing','₹0'])
    +'<div style="border-bottom:3px dashed #bbb;margin:8px 0 30px;"></div>'
    +row(['TOTAL','₹0'],true)
    +'<p style="font-family:'+SM+';font-size:27px;color:#555;text-align:center;margin:38px 0 0;">You pay by showing up.</p>'
    +'</div>'
  const copy='<div style="position:absolute;left:74px;right:74px;top:1010px;">'
    +'<p style="font-family:'+SE+';font-size:84px;font-weight:700;font-style:italic;color:#e9c986;line-height:0.97;margin:0;'+SH+'">The whole shoot,<br/>on the house.</p>'
    +'<p style="font-family:'+SA+';font-size:37px;font-weight:500;color:rgba(255,255,255,0.92);line-height:1.34;margin:26px 0 0;'+SH+'">A collab, not a transaction — I build my Kolkata portfolio, you keep the photos.</p></div>'
  return {name:nm,html:dark(card+copy)}
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

// === 5 VARIANTS — the d/f/g family, extended ===

// i — THE CATCH: the skeptic's DM, answered head-on.
function buildI(){
  const p=pick(2)
  return [
    L_hook(p[0],'&ldquo;Free? What&rsquo;s the catch?&rdquo;<br/>There isn&rsquo;t one. Sign up below.'),
    L_chat('02','&ldquo;What&rsquo;s<br/>the catch?&rdquo;',[
      {t:'free photo shoot? okay… what&rsquo;s the catch 🤨'},
      {me:true,t:'no catch — I&rsquo;m building my Kolkata portfolio.'},
      {me:true,t:'you get edited photos, I get new work. we both win.'},
    ]),
    L_chat('03','&ldquo;So I pay…<br/>nothing?&rdquo;',[
      {t:'so I don&rsquo;t pay anything at all?'},
      {me:true,t:'nothing. it&rsquo;s a collab — TFP, not a transaction.'},
      {me:true,t:'your only job: outfit, location, show up.'},
    ]),
    L_collage('04',p[1],p[2],p[3],{eyebrow:'Recent work', head:'The work speaks<br/>for itself.', sub:'Frames from recent free shoots — all on 35mm film.', headSz:84, pos:'mid'}),
    L_chat('05','&ldquo;Is it…<br/>safe?&rdquo;',[
      {t:'this isn&rsquo;t sketchy right? 😅'},
      {me:true,t:'fair question! daytime, public places only.'},
      {me:true,t:'bring a friend, and we talk on a call before anything is booked.'},
    ]),
    L_hero('06',p[4],{eyebrow:'Zero pressure', head:'Zero prep,<br/>zero pressure.', sub:'Pick an outfit, pick a spot, show up. I direct everything else.', headSz:88, pos:'high', accent:'gold'}),
    L_steps('07'),
    L_cta('08',p[5],{eyebrow:'Sign up', head:'Still skeptical?<br/>Good. Call me.', sub:'Sign up below and we&rsquo;ll talk it through on a call before anything is booked.', headSz:88, pos:'low'}),
  ]
}

// j — RAPID Q&A: one question per slide, answered in five words.
function buildJ(){
  const p=pick(6)
  return [
    L_hook(p[0],'Your questions, answered — on 35mm film.<br/>Outfit, location, show up. Sign up below.'),
    L_hero('02',p[1],{eyebrow:'Q: What does it cost?', head:'A: Nothing.', sub:'It&rsquo;s a TFP collab — I build my portfolio, you keep the photos.', headSz:100, pos:'high'}),
    L_hero('03',p[2],{eyebrow:'Q: What do I wear?', head:'A: Your favourite<br/>outfit.', sub:'The one you already love. That&rsquo;s the whole styling.', headSz:84, pos:'low', accent:'gold'}),
    L_hero('04',p[3],{eyebrow:'Q: What if I can&rsquo;t pose?', head:'A: I direct<br/>every frame.', sub:'Posing, angles, light — my job. You just show up.', headSz:84, pos:'mid'}),
    L_collage('05',p[4],p[5],p[6],{eyebrow:'Q: How do they turn out?', head:'A: Like this.', sub:'Frames from recent shoots — all on 35mm film.', headSz:92, pos:'mid'}),
    L_single('06',p[7],{eyebrow:'Q: Where?', head:'A: You pick<br/>the spot.', sub:SPOTS+' — daytime and public.', headSz:84, pos:'mid', accent:'gold'}),
    L_steps('07'),
    L_cta('08',p[8],{eyebrow:'Last question', head:'Q: How do<br/>I start?', sub:'A: Tap the link below. Quick form, quick call, then we shoot.', headSz:92, pos:'low'}),
  ]
}

// k — MYTH STAMPS: one myth per slide, struck through and corrected.
function buildK(){
  const p=pick(10)
  return [
    L_hook(p[0],'Everything you think a shoot needs —<br/>you don&rsquo;t. Sign up below.'),
    L_myth('02',p[1],'1','You need a whole team.','You need an outfit.','No stylist, no makeup chair. Come as you are.','mid'),
    L_myth('03',p[2],'2','You need a studio.','You have Kolkata.',SPOTS+' — daytime and public.','high'),
    L_myth('04',p[3],'3','You need experience.','You need an hour.','I direct every frame. Almost nobody I shoot has modeled before.','mid'),
    L_collage('05',p[4],p[5],p[6],{eyebrow:'Recent work', head:'Myths, meet<br/>the results.', sub:'All shot on 35mm film with zero production.', headSz:84, pos:'mid'}),
    L_duo('06',p[7],p[8],{eyebrow:'What you get', head:'Edited photos,<br/>yours to keep.', sub:'Scanned 35mm film, color-graded, sent straight to you. Free — we both get content.', headSz:84, pos:'mid', accent:'gold'}),
    L_steps('07'),
    L_cta('08',p[9],{eyebrow:'Sign up', head:'The last myth:<br/>&ldquo;maybe later.&rdquo;', sub:'I&rsquo;m only shooting in Kolkata this month. Quick form below — outfit, spot, show up.', headSz:84, pos:'low'}),
  ]
}

// l — OVERTHINKING: the "I'll do it when…" spiral, interrupted.
function buildL(){
  const p=pick(14)
  return [
    L_hook(p[0],'For everyone still overthinking it.<br/>Outfit, location, show up. Sign up below.'),
    L_chat('02','&ldquo;I&rsquo;ll do it<br/>when…&rdquo;',[
      {t:'…when I lose a little weight'},
      {t:'…when my skin clears up'},
      {t:'…when I find the perfect outfit'},
      {me:true,t:'you&rsquo;re ready now. come as you are.'},
    ]),
    L_hero('03',p[1],{eyebrow:'The truth', head:'&ldquo;I&rsquo;m not<br/>ready.&rdquo;', sub:'There&rsquo;s nothing to be ready for. The prep list is one outfit long.', headSz:88, pos:'high'}),
    L_collage('04',p[2],p[3],p[4],{eyebrow:'Recent work', head:'None of them<br/>felt ready.', sub:'Regular people, one hour on film — this is how it went.', headSz:84, pos:'mid'}),
    L_hero('05',p[5],{eyebrow:'The fix', head:'Stop planning.<br/>Start showing up.', sub:'One hour, daytime and public. Bring a friend if it helps.', headSz:82, pos:'low', accent:'gold'}),
    L_duo('06',p[6],p[7],{eyebrow:'What you get', head:'Edited photos,<br/>yours to keep.', sub:'Scanned 35mm film, color-graded, sent straight to you. Free — we both get content.', headSz:84, pos:'mid', accent:'gold'}),
    L_steps('07'),
    L_cta('08',p[8],{eyebrow:'Sign up', head:'Done<br/>overthinking?', sub:'Quick form below — pick an outfit, pick a spot, and I&rsquo;ll handle the rest.', headSz:100, pos:'low'}),
  ]
}

// m — RECEIPT: the itemized bill. Everything ₹0.
function buildM(){
  const p=pick(18)
  return [
    L_hook(p[0],'Total cost: ₹0. Total prep: one outfit.<br/>Sign up below.'),
    L_receipt('02'),
    L_collage('03',p[1],p[2],p[3],{eyebrow:'Recent work', head:'What ₹0<br/>gets you.', sub:'Frames from recent shoots — all on 35mm film.', headSz:84, pos:'mid'}),
    L_hero('04',p[4],{eyebrow:'Why free?', head:'Free, because<br/>we both win.', sub:'I&rsquo;m building my Kolkata portfolio; you get edited film scans to keep.', headSz:84, pos:'high'}),
    L_hero('05',p[5],{eyebrow:'Your side of the bill', head:'You pay by<br/>showing up.', sub:'Outfit, location, one hour. Daytime and public.', headSz:88, pos:'low', accent:'gold'}),
    L_single('06',p[6],{eyebrow:'Where', head:'You pick<br/>the spot.', sub:SPOTS+' — daytime and public. We lock it on a quick call.', headSz:86, pos:'mid'}),
    L_steps('07'),
    L_cta('08',p[7],{eyebrow:'Sign up', head:'Zero rupees.<br/>One sign-up.', sub:'Quick form below, quick call, then we shoot.', headSz:92, pos:'low'}),
  ]
}

const VARIANTS=[
  {slug:'i-the-catch', build:buildI},
  {slug:'j-rapid-qa', build:buildJ},
  {slug:'k-myth-stamps', build:buildK},
  {slug:'l-overthinking', build:buildL},
  {slug:'m-receipt', build:buildM},
]

async function render(){
  const all=[]
  for(const V of VARIANTS){
    const dir=path.join(OUT,V.slug);fs.mkdirSync(dir,{recursive:true})
    V.build().forEach((s,i)=>{const sl=i===0?s:withBadge(s);all.push({...sl,name:V.slug+'-'+sl.name,dir:V.slug})})
  }
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
