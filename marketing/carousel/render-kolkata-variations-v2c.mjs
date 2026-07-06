import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

// === Kolkata carousel v2c — d-chat only ===
// v2c changes vs v2 (d-chat):
//   slide 01: hook subtitle ('"What do I prepare?" Nothing. Outfit, location...') removed
//   slide 02 chat thread:
//     reply bubble: 'honestly? nothing. pick an outfit you love and a spot you like.'
//       -> 'honestly? not much. we just need to figure out the outfit and a location that works.'
//     bubble 'that's the entire prep. I handle the rest.' removed
//   slide 03: 'nope — come as you are. I direct every single frame.'
//     -> 'nope you don't need to do makeup, light and natural is my preference...'
// Everything else identical to v2. (a-three-steps subtitle removals live in v2b.)

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, 'output-kolkata-variations-v2c')
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
  const sub=c.sub?'<p style="font-family:'+SA+';font-size:37px;font-weight:500;color:rgba(255,255,255,0.92);line-height:1.34;margin:26px 0 0;'+SH+'">'+c.sub+'</p>':''
  const blk='<div style="position:absolute;left:74px;right:74px;top:'+top+'px;">'+eb
    +'<p style="font-family:'+SE+';font-size:'+headSz+'px;font-weight:700;font-style:italic;color:'+hcol+';line-height:0.97;margin:0;'+SH+'">'+c.head+'</p>'
    +sub+'</div>'
  return sc+blk
}

// === Layouts ===
// LOCKED title slide — every variant opens with the same "Kolkata free photo shoot." headline.
function L_hook(s,hookS){return {name:'01',html:heroHook(s,tagTop('Kolkata · Shot on 35mm film',64,64)+h1B('Kolkata<br/>free photo shoot.',540,108)+(hookS?subB(hookS,400,42):''))}}
// Wide tiles crop portrait frames at 'center 22%' so faces land in the slot instead of top-of-head.
function L_collage(nm,a,b,d,c){return {name:nm,html:dark(pr(a,55,90,430,510,-2,12)+pr(b,545,90,430,240,2,10,'center 22%')+pr(d,545,378,430,250,-1.5,10,'center 22%')+copyMid(c,true))}}
function L_hero(nm,s,c){return {name:nm,html:hero(s,copyMid(c,false))}}
function L_cta(nm,s,c){return {name:nm,html:ctaBg(s,copyMid(c,false))}}

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

// d — CHAT: the DM conversation everyone actually has with me. (v2c: slide 02 reply softened, third bubble removed)
function buildD(){
  const p=pick(15)
  return [
    L_hook(p[0]),
    L_chat('02','&ldquo;So what do<br/>I prepare?&rdquo;',[
      {t:'hey! saw the free shoot — what do I need to prepare? 😅'},
      {me:true,t:'honestly? not much. we just need to figure out the outfit and a location that works.'},
    ]),
    L_chat('03','&ldquo;Makeup?<br/>Posing?&rdquo;',[
      {t:'do I need a makeup artist? I&rsquo;ve never modeled before…'},
      {me:true,t:'nope you don&rsquo;t need to do makeup, light and natural is my preference or even no makeup is fine.'},
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

const VARIANTS=[
  {slug:'d-chat', build:buildD},
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
