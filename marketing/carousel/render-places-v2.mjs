import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, 'output-places-v2')
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
function L_cta(s){return {name:'10-cta',html:cta(s,h1('Sign up.',520)+'<div style="position:absolute;bottom:380px;left:64px;right:64px;"><p style="font-family:'+SA+';font-size:38px;font-weight:600;color:white;margin:0;'+SH+'">Click the link below to sign up.</p><p style="font-family:'+SA+';font-size:32px;color:rgba(255,255,255,0.7);margin:20px 0 0;'+SH+'">Free photo shoot. I handle everything.</p></div>')}}
function L_hero(nm,s,tg,hl,sl){return {name:nm,html:hero(s,tag(tg,64,60)+h2(hl,440)+sub(sl,370))}}
function L_trio(nm,a,b,c,tg,sl){return {name:nm,html:dark(tag(tg,64,40)+pr(a,10,80,320,900,-2.5,10)+pr(b,355,60,320,900,1.5,10)+pr(c,700,80,320,900,-1,10)+sub(sl,60))}}
function L_duo(nm,a,b,tg,sl){return {name:nm,html:dark(tag(tg,64,40)+pr(a,30,80,460,850,-2,12)+pr(b,530,100,460,850,2,12)+sub(sl,60))}}
function L_single(nm,s,hl,sl){return {name:nm,html:dark(pr(s,100,80,860,1200,-0.5,16)+h2(hl,160)+sub(sl,90))}}
function L_mag(nm,s,tg,hl,body,ins){return {name:nm,html:'<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#f0ebe0;"><div style="position:absolute;inset:0;background:linear-gradient(170deg,#f5f0e4 0%,#ece4d4 50%,#e0d8c4 100%);"></div>'+img(s,40,40,580,860,'object-position:center top;border-radius:8px;')+'<div style="position:absolute;left:64px;top:940px;right:64px;"><p style="font-family:'+SA+';font-size:16px;font-weight:700;color:rgba(0,0,0,0.3);letter-spacing:0.15em;text-transform:uppercase;margin:0 0 16px;">'+tg+'</p><p style="font-family:'+SE+';font-size:60px;font-weight:700;font-style:italic;color:#1a1a1a;line-height:0.95;margin:0;">'+hl+'</p><p style="font-family:'+SA+';font-size:24px;color:rgba(0,0,0,0.4);line-height:1.5;margin:28px 0 0;">'+body+'</p></div><div style="position:absolute;right:40px;bottom:60px;width:240px;height:340px;background:white;padding:10px;transform:rotate(3deg);box-shadow:4px 4px 20px rgba(0,0,0,0.12);"><img src="'+ins+'" style="width:220px;height:320px;object-fit:cover;object-position:center top;display:block;"/></div></div>'}}
function L_landscape(nm,s,tg,hl,sl){return {name:nm,html:dark(tag(tg,64,40)+'<div style="position:absolute;left:40px;top:120px;right:40px;height:640px;border-radius:12px;overflow:hidden;"><img src="'+s+'" style="width:100%;height:100%;object-fit:cover;object-position:center;display:block;"/></div>'+h2(hl,340)+sub(sl,260))}}

// === LOAD 42 NATURE PHOTOS ===
const P=[
 nn('000001-4.jpg'),nn('000002-11.jpg'),nn('000010-6.jpg'),nn('000011-6.jpg'),nn('000019-2.jpg'),
 nn('000019-6.jpg'),nn('000023600024.jpg'),nn('000024-5.jpg'),nn('000025-2.jpg'),nn('000026-2.jpg'),
 nn('000035-2.jpg'),nn('000038-4-2.jpg'),nn('000041.jpg'),nn('000042-2.jpg'),nn('000045-12.jpg'),
 nn('000048800004.jpg'),nn('000066-2.jpg'),nn('000067-9.jpg'),nn('000068-9.jpg'),nn('0604804-0043.jpg'),
 nn('aidanto-r2-013-5.jpg'),nn('aidanto-r2-035-16.jpg'),nn('aidanto-r4-047-22.jpg'),nn('aidanto-r4-053-25.jpg'),
 nn('DSC_0274-2.jpg'),nn('DSC_0310-2.jpg'),nn('DSC_0320-2.jpg'),nn('DSC_0320.jpg'),nn('DSC_0321-2.jpg'),
 nn('DSC_0321.jpg'),nn('DSC_0542.jpg'),nn('DSC_0544.jpg'),nn('manila-gallery-dsc-0190.jpg'),
 nn('manila-gallery-ivy-002.jpg'),nn('manila-gallery-white-001.jpg'),nn('r1-05457-0032.jpg'),
 nn('r1-05459-0036.jpg'),nn('r1-05459-0037.jpg'),nn('r1-05460-0022.jpg'),nn('r1-05460-0023.jpg'),
]
const L1=nn('manila-gallery-garden-001.jpg'), L2=nn('manila-gallery-garden-002.jpg')
console.log('Loaded '+(P.length+2)+' nature photos')

// rotate the 40-portrait pool by offset so each location uses a distinct set
function pick(off){const a=[];for(let i=0;i<11;i++)a.push(P[(off+i)%P.length]);return a}

// === 8 LOCATIONS — themed copy ===
const LOCATIONS=[
 { slug:'kintamani', title:'Kintamani', land:L1, off:0,
   hookH:'Kintamani<br/>free shoot.', hookS:'Free photo shoot on 35mm film.<br/>Mount Batur. Sign up below.',
   s:[
    ['Lake Batur · 35mm','Caldera rim. Cool highland air.'],
    ['Sunrise','Volcano sunrise. Real film.'],
    ['Mount Batur on film<br/>hits different.','Highland light. Real 35mm.'],
    ['Kintamani','Volcano views.<br/>Misty pines.<br/>Film.','Highland shoots on 35mm.'],
    ['Your face.<br/>Volcano light.<br/>Real film.','Free collab. I direct everything. Lake Batur, caldera rim, sunrise mist — your choice.'],
    ['Kintamani','Pine forest.<br/>Cool mountain air.','Film loves highland light.'],
    ['Highland<br/>portraits.','Mist. Pines. Volcanic black sand.'],
    ['Kintamani','This could<br/>be you.','Sign up below. It is free.'],
   ]},
 { slug:'amed', title:'Amed', land:L2, off:5,
   hookH:'Amed<br/>free shoot.', hookS:'Free photo shoot on 35mm film.<br/>Black sand coast. Sign up below.',
   s:[
    ['East coast · 35mm','Black sand. Calm sea. Film grain.'],
    ['Sunrise coast','Fishing boats at dawn. Real film.'],
    ['The sea on film<br/>hits different.','Quiet coast. Real 35mm.'],
    ['Amed','Black sand.<br/>Jukung boats.<br/>Film.','Coastal shoots on 35mm.'],
    ['Your face.<br/>Ocean light.<br/>Real film.','Free collab. I direct everything. Black sand, fishing boats, Mount Agung backdrop — your choice.'],
    ['Amed','Salt air.<br/>Still water.','Film handles water better than digital.'],
    ['Coastal<br/>portraits.','Black sand. Calm sea. Sunrise.'],
    ['Amed','This could<br/>be you.','Sign up below. It is free.'],
   ]},
 { slug:'ubud', title:'Ubud', land:L1, off:10,
   hookH:'Ubud<br/>free shoot.', hookS:'Free photo shoot on 35mm film.<br/>Rice fields & jungle. Sign up below.',
   s:[
    ['Jungle · 35mm','Rice terraces. Green light. Film grain.'],
    ['Golden hour','Sunset on the terraces. Real film.'],
    ['Nature on film<br/>hits different.','Jungle light. Real 35mm.'],
    ['Ubud','Rice fields.<br/>Jungle paths.<br/>Film.','Jungle shoots on 35mm.'],
    ['Your face.<br/>Natural light.<br/>Real film.','Free collab. I direct everything. Rice fields, waterfalls, jungle paths — your choice.'],
    ['Ubud','Forest light.<br/>Dappled sun.','Film loves green.'],
    ['Jungle<br/>portraits.','Ivy. Greenery. Temple shade.'],
    ['Ubud','This could<br/>be you.','Sign up below. It is free.'],
   ]},
 { slug:'uluwatu', title:'Uluwatu', land:L2, off:15,
   hookH:'Uluwatu<br/>free shoot.', hookS:'Free photo shoot on 35mm film.<br/>Clifftops & surf. Sign up below.',
   s:[
    ['Cliffs · 35mm','Limestone cliffs. Blue ocean. Film grain.'],
    ['Golden hour','Sunset over the cliffs. Real film.'],
    ['The coast on film<br/>hits different.','Cliff light. Real 35mm.'],
    ['Uluwatu','Limestone cliffs.<br/>Surf below.<br/>Film.','Clifftop shoots on 35mm.'],
    ['Your face.<br/>Sunset light.<br/>Real film.','Free collab. I direct everything. Clifftops, white sand, sunset over the surf — your choice.'],
    ['Uluwatu','Salt air.<br/>Endless blue.','Film handles the ocean better.'],
    ['Clifftop<br/>portraits.','Limestone. Surf. Sunset.'],
    ['Uluwatu','This could<br/>be you.','Sign up below. It is free.'],
   ]},
 { slug:'banyuwangi', title:'Banyuwangi', land:L1, off:20,
   hookH:'Banyuwangi<br/>free shoot.', hookS:'Free photo shoot on 35mm film.<br/>Ijen & savanna. Sign up below.',
   s:[
    ['East Java · 35mm','Savanna. Crater mist. Film grain.'],
    ['Sunrise','Ijen sunrise. Real film.'],
    ['Wild Java on film<br/>hits different.','Savanna light. Real 35mm.'],
    ['Banyuwangi','Ijen crater.<br/>Open savanna.<br/>Film.','Wild-nature shoots on 35mm.'],
    ['Your face.<br/>Wild light.<br/>Real film.','Free collab. I direct everything. Ijen crater, Baluran savanna, quiet beaches — your choice.'],
    ['Banyuwangi','Crater mist.<br/>Golden grass.','Film loves wild light.'],
    ['Savanna<br/>portraits.','Grass. Mist. Java sunrise.'],
    ['Banyuwangi','This could<br/>be you.','Sign up below. It is free.'],
   ]},
 { slug:'malang', title:'Malang', land:L2, off:25,
   hookH:'Malang<br/>free shoot.', hookS:'Free photo shoot on 35mm film.<br/>Highlands & old streets. Sign up below.',
   s:[
    ['East Java · 35mm','Cool highlands. Colonial streets. Film grain.'],
    ['Golden hour','Tea plantations at sunset. Real film.'],
    ['Highland Java on film<br/>hits different.','Mountain light. Real 35mm.'],
    ['Malang','Flower gardens.<br/>Old streets.<br/>Film.','Highland shoots on 35mm.'],
    ['Your face.<br/>Cool light.<br/>Real film.','Free collab. I direct everything. Tea plantations, flower gardens, colonial streets — your choice.'],
    ['Malang','Colorful walls.<br/>Mountain air.','Film loves color.'],
    ['Garden<br/>portraits.','Flowers. Tea fields. Cool light.'],
    ['Malang','This could<br/>be you.','Sign up below. It is free.'],
   ]},
 { slug:'yogyakarta', title:'Yogyakarta', land:L1, off:30,
   hookH:'Yogyakarta<br/>free shoot.', hookS:'Free photo shoot on 35mm film.<br/>Temples & old city. Sign up below.',
   s:[
    ['Java · 35mm','Borobudur. Royal city. Film grain.'],
    ['Golden hour','Temple sunrise. Real film.'],
    ['Old Java on film<br/>hits different.','Temple light. Real 35mm.'],
    ['Yogyakarta','Borobudur.<br/>Batik streets.<br/>Film.','Heritage shoots on 35mm.'],
    ['Your face.<br/>Temple light.<br/>Real film.','Free collab. I direct everything. Borobudur, Prambanan, old city, Parangtritis beach — your choice.'],
    ['Yogyakarta','Stone temples.<br/>Royal heritage.','Film loves old stone.'],
    ['Heritage<br/>portraits.','Batik. Temples. Warm light.'],
    ['Yogyakarta','This could<br/>be you.','Sign up below. It is free.'],
   ]},
 { slug:'jakarta', title:'Jakarta', land:L2, off:2,
   hookH:'Jakarta<br/>free shoot.', hookS:'Free photo shoot on 35mm film.<br/>Skyline & old town. Sign up below.',
   s:[
    ['The city · 35mm','Skyline. Old town. Film grain.'],
    ['Golden hour','Rooftop sunset. Real film.'],
    ['The city on film<br/>hits different.','Urban light. Real 35mm.'],
    ['Jakarta','Kota Tua.<br/>City rooftops.<br/>Film.','City shoots on 35mm.'],
    ['Your face.<br/>City light.<br/>Real film.','Free collab. I direct everything. Kota Tua old town, rooftops, café streets, night lights — your choice.'],
    ['Jakarta','Old town.<br/>Neon nights.','Film loves city light.'],
    ['Street<br/>portraits.','Brick. Cafés. Golden hour.'],
    ['Jakarta','This could<br/>be you.','Sign up below. It is free.'],
   ]},
]

function buildVariant(C){
  const ph=pick(C.off)
  const t='35mm film'
  return [
    L_hook(ph[0],C),
    L_trio('02',ph[1],ph[2],ph[3],C.s[0][0],C.s[0][1]),
    L_duo('03',ph[4],ph[5],C.s[1][0],C.s[1][1]),
    L_landscape('04',C.land,C.title+' · '+t,C.s[2][0],C.s[2][1]),
    L_hero('05',ph[6],C.title,C.s[3][1],C.s[3][2]),
    L_mag('06',ph[7],C.title+' · Nature',C.s[4][0],C.s[4][1],ph[8]),
    L_hero('07',ph[9],C.title,C.s[5][1],C.s[5][2]),
    L_single('08',ph[10],C.s[6][0],C.s[6][1]),
    L_hero('09',ph[(2)%11],C.title,C.s[7][1],C.s[7][2]),
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
