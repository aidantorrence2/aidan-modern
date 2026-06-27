import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

// === New Delhi carousel v2 ===
// New creative. 10 slides (only 10 go into Meta). Anti-scam copy on EVERY slide.
// All copy lives in the SAFE MIDDLE THIRD (~y760–1280) so it never covers the
// Meta link/CTA overlay (bottom) and is never too high (top profile overlay).

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, 'output-newdelhi-variations-v2')
const NT = '/Users/aidantorrence/Documents/aidan-modern/public/images/nature'
fs.mkdirSync(OUT, { recursive: true })

function nn(f){return 'data:image/jpeg;base64,'+fs.readFileSync(path.join(NT,f)).toString('base64')}

const SE="Georgia,'Times New Roman',serif"
const SA="Inter,-apple-system,system-ui,sans-serif"
const SH='text-shadow:0 3px 6px rgba(0,0,0,1),0 10px 40px rgba(0,0,0,0.85),0 0 120px rgba(0,0,0,0.6);'
const GR='<div style="position:absolute;inset:0;pointer-events:none;opacity:0.08;mix-blend-mode:soft-light;background-image:radial-gradient(circle at 14% 18%,rgba(255,255,255,0.5),transparent 17%),radial-gradient(circle at 84% 12%,rgba(255,255,255,0.28),transparent 15%);"></div>'

function img(s,l,t,w,h,x){x=x||'';return '<img src="'+s+'" style="position:absolute;left:'+l+'px;top:'+t+'px;width:'+w+'px;height:'+h+'px;object-fit:cover;object-position:center top;display:block;'+x+'"/>'}
function pr(s,l,t,w,h,r,b){b=b||12;return '<div style="position:absolute;left:'+l+'px;top:'+t+'px;width:'+(w+b*2)+'px;height:'+(h+b*2)+'px;background:white;padding:'+b+'px;transform:rotate('+r+'deg);box-shadow:0 8px 40px rgba(0,0,0,0.45),0 2px 8px rgba(0,0,0,0.2);"><img src="'+s+'" style="width:'+w+'px;height:'+h+'px;object-fit:cover;object-position:center top;display:block;"/></div>'}

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

// === Copy block — middle third, but POSITION + COLOR vary per slide for rhythm ===
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

// === Layouts (10 distinct slides) ===
// LOCKED title slide — original structure, always this way.
function L_hook(s,F){return {name:'01',html:heroHook(s,tagTop(F.title+' · Shot on 35mm film',64,64)+h1B(F.hookH,540,108)+subB(F.hookS,400,42))}}
function L_collage(nm,a,b,d,c){return {name:nm,html:dark(pr(a,55,90,430,510,-2,12)+pr(b,545,90,430,240,2,10)+pr(d,545,378,430,250,-1.5,10)+copyMid(c,true))}}
function L_duo(nm,a,b,c){return {name:nm,html:dark(pr(a,70,100,440,500,-2,12)+pr(b,560,120,440,490,2,12)+copyMid(c,true))}}
function L_single(nm,s,c){return {name:nm,html:dark(pr(s,244,86,560,520,-0.5,16)+copyMid(c,true))}}
function L_hero(nm,s,c){return {name:nm,html:hero(s,copyMid(c,false))}}
function L_cta(nm,s,c){return {name:nm,html:ctaBg(s,copyMid(c,false))}}

// How it works — numbered, compressed to stay clear of the bottom link zone
function L_steps(nm,place){
  const row=(n,t,d,top)=>'<div style="position:absolute;left:74px;top:'+top+'px;font-family:'+SE+';font-size:52px;font-weight:700;font-style:italic;color:#dcbb7d;line-height:1;'+SH+'">'+n+'</div><div style="position:absolute;left:160px;right:74px;top:'+(top+1)+'px;"><p style="font-family:'+SE+';font-size:40px;font-weight:700;font-style:italic;color:#fff;margin:0;line-height:1.04;'+SH+'">'+t+'</p><p style="font-family:'+SA+';font-size:25px;color:rgba(255,255,255,0.66);margin:9px 0 0;line-height:1.3;">'+d+'</p></div>'
  const inner='<div style="position:absolute;left:74px;right:74px;top:300px;"><p style="font-family:'+SA+';font-size:25px;font-weight:700;color:#dcbb7d;letter-spacing:0.14em;text-transform:uppercase;margin:0 0 20px;'+SH+'">How it works</p><p style="font-family:'+SE+';font-size:64px;font-weight:700;font-style:italic;color:#fff;margin:0;line-height:0.95;'+SH+'">Here’s how<br/>it works.</p></div>'
    +row('1','Sign up.','Quick form below — takes a minute.',560)
    +row('2','We plan it.','A call to pick the spot, time, and look.',730)
    +row('3','We shoot.','About an hour. I direct every frame.',900)
    +row('4','You get the photos.','Edited 35mm scans, yours to keep.',1070)
    +'<div style="position:absolute;left:74px;right:74px;top:1240px;"><p style="font-family:'+SA+';font-size:25px;color:rgba(255,255,255,0.6);margin:0;line-height:1.4;'+SH+'">Shooting around '+place+' on 35mm film this month.</p></div>'
  return {name:nm,html:dark(inner)}
}

// === LOAD AVAILABLE PORTRAITS (25) ===
const P=[
 nn('000001-4.jpg'),nn('000002-11.jpg'),nn('000010-6.jpg'),nn('000011-6.jpg'),nn('000019-2.jpg'),
 nn('000019-6.jpg'),nn('000023600024.jpg'),nn('000025-2.jpg'),nn('000026-2.jpg'),nn('000035-2.jpg'),
 nn('000038-4-2.jpg'),nn('000041.jpg'),nn('000042-2.jpg'),nn('000045-12.jpg'),nn('000066-2.jpg'),
 nn('000067-9.jpg'),nn('000068-9.jpg'),nn('DSC_0274-2.jpg'),nn('DSC_0310-2.jpg'),nn('DSC_0320-2.jpg'),
 nn('DSC_0320.jpg'),nn('DSC_0321-2.jpg'),nn('DSC_0321.jpg'),nn('DSC_0542.jpg'),nn('DSC_0544.jpg'),
]
console.log('Loaded '+P.length+' portraits')
function pick(off){const a=[];for(let i=0;i<11;i++)a.push(P[(off+i)%P.length]);return a}

// === 3 VARIANTS — New Delhi location flavor; shared anti-scam spine ===
const VARIANTS=[
 { slug:'a', off:0, title:'New Delhi',
   hookH:'New Delhi<br/>free photo shoot.', hookS:'Free photo shoot on 35mm film.<br/>Mughal gardens, golden hour. Sign up below.',
   collH:'Shot around<br/>Lodhi Gardens.', collS:'A few frames from recent film shoots here in Delhi.',
   teaseS:'Garden golden hour, on film — the kind of frames worth printing.',
   spots:'Humayun’s Tomb, Lodhi Gardens, Sunder Nursery' },
 { slug:'b', off:13, title:'New Delhi',
   hookH:'New Delhi<br/>free photo shoot.', hookS:'Free photo shoot on 35mm film.<br/>Boulevards & sandstone. Sign up below.',
   collH:'Shot along<br/>Kartavya Path.', collS:'A few frames from recent film shoots here in Delhi.',
   teaseS:'Golden hour on the boulevards, on film — the kind of frames worth printing.',
   spots:'India Gate, Kartavya Path, Connaught Place' },
 { slug:'c', off:26, title:'New Delhi',
   hookH:'New Delhi<br/>free photo shoot.', hookS:'Free photo shoot on 35mm film.<br/>Old city & heritage. Sign up below.',
   collH:'Shot at<br/>Qutub Minar.', collS:'A few frames from recent film shoots here in Delhi.',
   teaseS:'Heritage golden hour, on film — the kind of frames worth printing.',
   spots:'Qutub Minar, Jama Masjid, Chandni Chowk lanes' },
]

// pos + accent vary per slide so the copy lands in a different spot/color as you swipe.
function buildVariant(F){
  const p=pick(F.off)
  return [
    L_hook(p[0], F),
    L_collage('02',p[1],p[2],p[3], {eyebrow:'Recent work', head:F.collH, sub:F.collS, headSz:84, pos:'mid'}),
    L_duo('03',p[4],p[5], {eyebrow:'What you get', head:'Edited photos,<br/>yours to keep.', sub:'Scanned 35mm film, color-graded, and sent straight to you.', headSz:84, pos:'mid', accent:'gold'}),
    L_hero('04',p[6], {eyebrow:'Why it’s free', head:'I’m building<br/>my portfolio.', sub:'I need new faces for my book, so the shoot’s on me. You just show up.', headSz:92, pos:'high'}),
    L_hero('05',p[7], {eyebrow:'On the day', head:'I direct<br/>every shot.', sub:'Posing, angles, light — no experience needed. I’ll walk you through all of it.', headSz:92, pos:'low', accent:'gold'}),
    L_hero('06',p[8], {eyebrow:'Before we shoot', head:'Let’s talk<br/>it through.', sub:'Happy to hop on a phone or video call first to plan the shoot and answer anything.', headSz:92, pos:'mid'}),
    L_single('07',p[9], {eyebrow:'Where', head:'You pick<br/>the spot.', sub:'Daytime and public — '+F.spots+'. Bring a friend if you like.', headSz:86, pos:'mid'}),
    L_steps('08',F.title),
    L_hero('09',p[10], {eyebrow:F.title, head:'Let’s create<br/>iconic photos.', sub:F.teaseS, headSz:88, pos:'high', accent:'gold'}),
    L_cta('10',p[2], {eyebrow:'Sign up', head:'Tap the link<br/>below.', sub:'Fill out a quick form and I’ll reach out. We can plan it over a call.', headSz:100, pos:'low'}),
  ]
}

async function render(){
  const all=[]
  for(const F of VARIANTS){const dir=path.join(OUT,F.slug);fs.mkdirSync(dir,{recursive:true});for(const s of buildVariant(F))all.push({...s,name:F.slug+'-'+s.name,dir:F.slug})}
  console.log('Rendering '+all.length+' slides...')
  const browser=await chromium.launch()
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
