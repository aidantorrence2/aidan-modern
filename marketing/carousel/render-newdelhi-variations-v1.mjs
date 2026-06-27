import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, 'output-newdelhi-variations-v1')
const NT = '/Users/aidantorrence/Documents/aidan-modern/public/images/nature'
fs.mkdirSync(OUT, { recursive: true })

function nn(f){return 'data:image/jpeg;base64,'+fs.readFileSync(path.join(NT,f)).toString('base64')}

const SE="Georgia,'Times New Roman',serif"
const SA="Inter,-apple-system,system-ui,sans-serif"
const SH='text-shadow:0 3px 6px rgba(0,0,0,1),0 10px 40px rgba(0,0,0,0.8),0 0 100px rgba(0,0,0,0.5);'
const GR='<div style="position:absolute;inset:0;pointer-events:none;opacity:0.08;mix-blend-mode:soft-light;background-image:radial-gradient(circle at 14% 18%,rgba(255,255,255,0.5),transparent 17%),radial-gradient(circle at 84% 12%,rgba(255,255,255,0.28),transparent 15%);"></div>'

function img(s,l,t,w,h,x){x=x||'';return '<img src="'+s+'" style="position:absolute;left:'+l+'px;top:'+t+'px;width:'+w+'px;height:'+h+'px;object-fit:cover;object-position:center top;display:block;'+x+'"/>'}
function pr(s,l,t,w,h,r,b){b=b||12;return '<div style="position:absolute;left:'+l+'px;top:'+t+'px;width:'+(w+b*2)+'px;height:'+(h+b*2)+'px;background:white;padding:'+b+'px;transform:rotate('+r+'deg);box-shadow:0 8px 40px rgba(0,0,0,0.45),0 2px 8px rgba(0,0,0,0.2);"><img src="'+s+'" style="width:'+w+'px;height:'+h+'px;object-fit:cover;object-position:center top;display:block;"/></div>'}

function hero(s,inner){return '<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">'+img(s,0,0,1080,1920,'filter:saturate(1.1) contrast(1.05);')+'<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0.08) 0%,transparent 15%,rgba(0,0,0,0.35) 55%,rgba(0,0,0,0.96) 100%);"></div>'+inner+GR+'</div>'}
function dark(inner){return '<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#0a0e08;"><div style="position:absolute;inset:0;background:linear-gradient(170deg,#0e1410 0%,#0a0e08 50%,#080c06 100%);"></div><div style="position:absolute;inset:0;background:radial-gradient(circle at 20% 20%,rgba(80,160,80,0.1),transparent 30%),radial-gradient(circle at 80% 80%,rgba(180,150,80,0.08),transparent 25%);"></div>'+inner+GR+'</div>'}
function warm(inner){return '<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#f0ebe0;"><div style="position:absolute;inset:0;background:linear-gradient(170deg,#f5f0e4 0%,#ece4d4 50%,#e0d8c4 100%);"></div>'+inner+'</div>'}
function cta(s,inner){return '<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">'+img(s,0,0,1080,1920,'filter:saturate(1.1) brightness(0.5);')+'<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0.4) 0%,rgba(0,0,0,0.15) 30%,rgba(0,0,0,0.15) 50%,rgba(0,0,0,0.95) 100%);"></div>'+inner+GR+'</div>'}

function h1(t,bot,sz){sz=sz||108;return '<div style="position:absolute;bottom:'+bot+'px;left:64px;right:64px;"><p style="font-family:'+SE+';font-size:'+sz+'px;font-weight:700;font-style:italic;color:white;line-height:0.92;margin:0;'+SH+'">'+t+'</p></div>'}
function h2(t,bot,sz){sz=sz||64;return '<div style="position:absolute;bottom:'+bot+'px;left:64px;right:64px;"><p style="font-family:'+SE+';font-size:'+sz+'px;font-weight:700;font-style:italic;color:white;line-height:1.0;margin:0;'+SH+'">'+t+'</p></div>'}
function sub(t,bot,sz){sz=sz||34;return '<div style="position:absolute;bottom:'+bot+'px;left:64px;right:64px;"><p style="font-family:'+SA+';font-size:'+sz+'px;font-weight:500;color:rgba(255,255,255,0.85);line-height:1.35;margin:0;'+SH+'">'+t+'</p></div>'}
function tag(t,l,top){return '<p style="position:absolute;left:'+l+'px;top:'+top+'px;font-family:'+SA+';font-size:24px;font-weight:700;color:rgba(255,255,255,0.7);letter-spacing:0.12em;text-transform:uppercase;margin:0;'+SH+'">'+t+'</p>'}
function dtag(t,l,top){return '<p style="position:absolute;left:'+l+'px;top:'+top+'px;font-family:'+SA+';font-size:18px;font-weight:700;color:rgba(0,0,0,0.3);letter-spacing:0.15em;text-transform:uppercase;margin:0;">'+t+'</p>'}
function dh(t,bot,sz){sz=sz||52;return '<div style="position:absolute;bottom:'+bot+'px;left:64px;right:64px;"><p style="font-family:'+SE+';font-size:'+sz+'px;font-weight:700;font-style:italic;color:#1a1a1a;line-height:0.95;margin:0;">'+t+'</p></div>'}

// Layouts
function L_hook(s,C){return {name:'01-hook',html:hero(s,tag(C.title+' · Shot on 35mm film',64,60)+h1(C.hookH,540,108)+sub(C.hookS,400,42))}}
function L_cta(s){return {name:'11-cta',html:cta(s,h1('Sign up.',560)+'<div style="position:absolute;bottom:300px;left:64px;right:64px;"><p style="font-family:'+SA+';font-size:38px;font-weight:600;color:white;margin:0;'+SH+'">Click the link below to sign up.</p><p style="font-family:'+SA+';font-size:32px;color:rgba(255,255,255,0.75);margin:18px 0 0;'+SH+'">Free photo shoot. I pick the spots, direct everything, and send you the edited film photos.</p><p style="font-family:'+SA+';font-size:28px;color:rgba(255,255,255,0.6);margin:16px 0 0;'+SH+'">No cost, no catch — I’m building my portfolio.</p></div>')}}
// How it works — numbered steps
function L_steps(nm,place){
  const row=(n,t,d,top)=>'<div style="position:absolute;left:64px;top:'+top+'px;font-family:'+SE+';font-size:60px;font-weight:700;font-style:italic;color:#c9a86a;line-height:1;'+SH+'">'+n+'</div><div style="position:absolute;left:160px;right:64px;top:'+(top+2)+'px;"><p style="font-family:'+SE+';font-size:42px;font-weight:700;font-style:italic;color:#fff;margin:0;line-height:1.05;'+SH+'">'+t+'</p><p style="font-family:'+SA+';font-size:26px;color:rgba(255,255,255,0.62);margin:10px 0 0;line-height:1.3;">'+d+'</p></div>'
  const inner=tag('How it works',64,110)
    +'<div style="position:absolute;left:64px;right:64px;top:180px;"><p style="font-family:'+SE+';font-size:66px;font-weight:700;font-style:italic;color:#fff;margin:0;line-height:0.95;'+SH+'">Here’s how<br/>it works.</p></div>'
    +row('1','Sign up — it’s free.','Tap the link below. Takes a minute.',470)
    +row('2','We pick a spot.','A '+place+' location + time that works for you.',700)
    +row('3','I direct everything.','Posing, angles, light. No experience needed.',930)
    +row('4','You get the photos.','Edited 35mm film shots, yours to keep.',1160)
    +'<div style="position:absolute;left:64px;right:64px;bottom:150px;"><p style="font-family:'+SA+';font-size:24px;color:rgba(255,255,255,0.5);margin:0;line-height:1.4;'+SH+'">Why free? I’m building my '+place+' film portfolio — real photo shoots, real people.</p></div>'
  return {name:nm,html:dark(inner)}
}
function L_hero(nm,s,tg,hl,sl){return {name:nm,html:hero(s,tag(tg,64,60)+h2(hl,440)+sub(sl,370))}}
function L_trio(nm,a,b,c,tg,sl){return {name:nm,html:dark(tag(tg,64,40)+pr(a,10,80,320,900,-2.5,10)+pr(b,355,60,320,900,1.5,10)+pr(c,700,80,320,900,-1,10)+sub(sl,60))}}
// 2-column max: one tall photo left, two stacked right
function L_stack2(nm,a,b,c,tg,sl){return {name:nm,html:dark(tag(tg,64,40)+pr(a,40,90,470,1230,-2,14)+pr(b,560,90,440,600,2,12)+pr(c,560,720,440,600,-1.5,12)+sub(sl,80))}}
function L_duo(nm,a,b,tg,sl){return {name:nm,html:dark(tag(tg,64,40)+pr(a,30,80,460,850,-2,12)+pr(b,530,100,460,850,2,12)+sub(sl,60))}}
function L_single(nm,s,hl,sl){return {name:nm,html:dark(pr(s,100,80,860,1200,-0.5,16)+h2(hl,160)+sub(sl,90))}}
function L_mag(nm,s,tg,hl,body,ins){return {name:nm,html:'<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#f0ebe0;"><div style="position:absolute;inset:0;background:linear-gradient(170deg,#f5f0e4 0%,#ece4d4 50%,#e0d8c4 100%);"></div>'+img(s,40,40,580,860,'object-position:center top;border-radius:8px;')+'<div style="position:absolute;left:64px;top:940px;right:64px;"><p style="font-family:'+SA+';font-size:16px;font-weight:700;color:rgba(0,0,0,0.3);letter-spacing:0.15em;text-transform:uppercase;margin:0 0 16px;">'+tg+'</p><p style="font-family:'+SE+';font-size:60px;font-weight:700;font-style:italic;color:#1a1a1a;line-height:0.95;margin:0;">'+hl+'</p><p style="font-family:'+SA+';font-size:24px;color:rgba(0,0,0,0.4);line-height:1.5;margin:28px 0 0;">'+body+'</p></div><div style="position:absolute;right:40px;bottom:60px;width:240px;height:340px;background:white;padding:10px;transform:rotate(3deg);box-shadow:4px 4px 20px rgba(0,0,0,0.12);"><img src="'+ins+'" style="width:220px;height:320px;object-fit:cover;object-position:center top;display:block;"/></div></div>'}}
function L_landscape(nm,s,tg,hl,sl){return {name:nm,html:dark(tag(tg,64,40)+'<div style="position:absolute;left:40px;top:120px;right:40px;height:640px;border-radius:12px;overflow:hidden;"><img src="'+s+'" style="width:100%;height:100%;object-fit:cover;object-position:center;display:block;"/></div>'+h2(hl,340)+sub(sl,260))}}

// === LOAD AVAILABLE PORTRAITS (25) — current nature pool ===
const P=[
 nn('000001-4.jpg'),nn('000002-11.jpg'),nn('000010-6.jpg'),nn('000011-6.jpg'),nn('000019-2.jpg'),
 nn('000019-6.jpg'),nn('000023600024.jpg'),nn('000025-2.jpg'),nn('000026-2.jpg'),nn('000035-2.jpg'),
 nn('000038-4-2.jpg'),nn('000041.jpg'),nn('000042-2.jpg'),nn('000045-12.jpg'),nn('000066-2.jpg'),
 nn('000067-9.jpg'),nn('000068-9.jpg'),nn('DSC_0274-2.jpg'),nn('DSC_0310-2.jpg'),nn('DSC_0320-2.jpg'),
 nn('DSC_0320.jpg'),nn('DSC_0321-2.jpg'),nn('DSC_0321.jpg'),nn('DSC_0542.jpg'),nn('DSC_0544.jpg'),
]
const L1=P[23], L2=P[24]
console.log('Loaded '+P.length+' nature photos')

// rotate the portrait pool by offset so each location uses a distinct set
function pick(off){const a=[];for(let i=0;i<11;i++)a.push(P[(off+i)%P.length]);return a}

// === 3 LOCATIONS — Delhi themed copy ===
const LOCATIONS=[
 // Variant A — Humayun's Tomb & Lodhi Gardens (Mughal gardens)
 { slug:'a', title:'Delhi', land:L1, off:0,
   hookH:'Delhi<br/>free photo shoot.', hookS:'Free photo shoot on 35mm film.<br/>Mughal gardens, golden hour. Sign up below.',
   s:[
    ['Lodhi Gardens · 35mm','Domes. Old stone. Film grain.'],
    ['Golden hour','Garden light at sunset. Real film.'],
    ['Garden light on film<br/>hits different.','Arches. Real 35mm.'],
    ['Delhi','Humayun’s Tomb.<br/>Lodhi arches.<br/>Film.','Mughal-garden photo shoots on 35mm.'],
    ['Your face.<br/>Garden light.<br/>Real film.','Free collab. I direct everything. Humayun’s Tomb, Lodhi Gardens, Sunder Nursery — your choice.'],
    ['Delhi','Still gardens.<br/>Stone domes.','Film loves soft garden light.'],
    ['Garden<br/>portraits.','Arches. Lawns. Warm dusk.'],
    ['Delhi','This could<br/>be you.','Sign up below. It is free.'],
   ]},
 // Variant B — India Gate & Lutyens' Delhi (boulevards, sandstone)
 { slug:'b', title:'Delhi', land:L2, off:13,
   hookH:'Delhi<br/>free photo shoot.', hookS:'Free photo shoot on 35mm film.<br/>Boulevards & sandstone. Sign up below.',
   s:[
    ['India Gate · 35mm','Wide avenues. Sandstone. Film grain.'],
    ['Golden hour','Kartavya Path at sunset. Real film.'],
    ['Delhi light on film<br/>hits different.','Open boulevards. Real 35mm.'],
    ['Delhi','India Gate.<br/>Kartavya Path.<br/>Film.','Boulevard photo shoots on 35mm.'],
    ['Your face.<br/>City light.<br/>Real film.','Free collab. I direct everything. India Gate, Kartavya Path, Connaught Place — your choice.'],
    ['Delhi','Grand avenues.<br/>Warm sandstone.','Film loves wide city light.'],
    ['Avenue<br/>portraits.','Boulevards. Arches. Soft dusk.'],
    ['Delhi','This could<br/>be you.','Sign up below. It is free.'],
   ]},
 // Variant C — Old Delhi: Qutub Minar, Jama Masjid, Chandni Chowk (heritage)
 { slug:'c', title:'Delhi', land:L1, off:26,
   hookH:'Delhi<br/>free photo shoot.', hookS:'Free photo shoot on 35mm film.<br/>Old city & heritage. Sign up below.',
   s:[
    ['Old Delhi · 35mm','Red sandstone. Narrow lanes. Film grain.'],
    ['Golden hour','Qutub at sunset. Real film.'],
    ['Heritage light on film<br/>hits different.','Old stone. Real 35mm.'],
    ['Delhi','Qutub Minar.<br/>Chandni Chowk.<br/>Film.','Heritage photo shoots on 35mm.'],
    ['Your face.<br/>Heritage light.<br/>Real film.','Free collab. I direct everything. Qutub Minar, Jama Masjid, Chandni Chowk lanes — your choice.'],
    ['Delhi','Red sandstone.<br/>Old-city lanes.','Film loves warm heritage light.'],
    ['Old-city<br/>portraits.','Minarets. Lanes. Golden hour.'],
    ['Delhi','This could<br/>be you.','Sign up below. It is free.'],
   ]},
]

function buildVariant(C){
  const ph=pick(C.off)
  const t='35mm film'
  return [
    L_hook(ph[0],C),
    L_stack2('02',ph[1],ph[2],ph[3],C.s[0][0],C.s[0][1]),
    L_duo('03',ph[4],ph[5],C.s[1][0],C.s[1][1]),
    L_landscape('04',C.land,C.title+' · '+t,C.s[2][0],C.s[2][1]),
    L_hero('05',ph[6],C.title,C.s[3][1],C.s[3][2]),
    L_mag('06',ph[7],C.title+' · Nature',C.s[4][0],C.s[4][1],ph[8]),
    L_hero('07',ph[9],C.title,C.s[5][1],C.s[5][2]),
    L_single('08',ph[10],C.s[6][0],C.s[6][1]),
    L_steps('09-how',C.title),
    L_hero('10',ph[(2)%11],C.title,C.s[7][1],C.s[7][2]),
    L_cta(ph[4]),
  ]
}

async function render(){
  const all=[]
  for(const C of LOCATIONS){const dir=path.join(OUT,C.slug);fs.mkdirSync(dir,{recursive:true});for(const s of buildVariant(C))all.push({...s,name:C.slug+'-'+s.name,dir:C.slug})}
  console.log('Rendering '+all.length+' slides...')
  const browser=await chromium.launch()
  const ctx=await browser.newContext({viewport:{width:1080,height:1920},deviceScaleFactor:2})
  for(let i=0;i<all.length;i++){
    const s=all[i];const page=await ctx.newPage()
    await page.setContent('<!doctype html><html><head><style>*{box-sizing:border-box}html,body{margin:0;width:1080px;height:1920px;background:#000;overflow:hidden}body{-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}</style></head><body>'+s.html+'</body></html>',{waitUntil:'load'})
    await page.waitForTimeout(300)
    await page.screenshot({path:path.join(OUT,s.dir,s.name+'.png'),type:'png'})
    await page.close()
    if((i+1)%10===0||i===0)console.log('  ['+(i+1)+'/'+all.length+'] '+s.name)
  }
  await browser.close()
  console.log('\nDone — '+all.length+' slides -> '+OUT)
}
render()
