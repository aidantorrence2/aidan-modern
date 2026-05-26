import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, 'output-ubud-creative-v2')
const HD = '/Users/aidantorrence/Documents/aidan-modern/public/images/headliners'
const NT = '/Users/aidantorrence/Documents/aidan-modern/public/images/nature'
fs.mkdirSync(OUT, { recursive: true })

function nh(f){return 'data:image/jpeg;base64,'+fs.readFileSync(path.join(HD,f)).toString('base64')}
function nn(f){return 'data:image/jpeg;base64,'+fs.readFileSync(path.join(NT,f)).toString('base64')}

const SE="Georgia,'Times New Roman',serif"
const SA="Inter,-apple-system,system-ui,sans-serif"
const SH='text-shadow:0 3px 6px rgba(0,0,0,1),0 10px 40px rgba(0,0,0,0.8),0 0 100px rgba(0,0,0,0.5);'
const GR='<div style="position:absolute;inset:0;pointer-events:none;opacity:0.08;mix-blend-mode:soft-light;background-image:radial-gradient(circle at 14% 18%,rgba(255,255,255,0.5),transparent 17%),radial-gradient(circle at 84% 12%,rgba(255,255,255,0.28),transparent 15%);"></div>'

function img(s,l,t,w,h,x){x=x||'';return '<img src="'+s+'" style="position:absolute;left:'+l+'px;top:'+t+'px;width:'+w+'px;height:'+h+'px;object-fit:cover;object-position:center top;display:block;'+x+'"/>'}
function pr(s,l,t,w,h,r,b){b=b||12;return '<div style="position:absolute;left:'+l+'px;top:'+t+'px;width:'+(w+b*2)+'px;height:'+(h+b*2)+'px;background:white;padding:'+b+'px;transform:rotate('+r+'deg);box-shadow:0 8px 40px rgba(0,0,0,0.45),0 2px 8px rgba(0,0,0,0.2);"><img src="'+s+'" style="width:'+w+'px;height:'+h+'px;object-fit:cover;object-position:center top;display:block;"/></div>'}

// Earthy warm dark bg for Ubud vibe
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

// === ALL 42 NATURE PHOTOS ===
const N = {
  // Portrait photos
  n01:nn('000001-4.jpg'),       // blonde garden park
  n02:nn('000002-11.jpg'),      // denim jacket stone wall greenery
  n03:nn('000010-6.jpg'),       // polkadot dress in green leaves
  n04:nn('000011-6.jpg'),       // polkadot in ivy
  n05:nn('000019-2.jpg'),       // blue dress with flowers/plants
  n06:nn('000019-6.jpg'),       // brown dress, flower stall
  n07:nn('000023600024.jpg'),   // beach flowing dress
  n08:nn('000024-5.jpg'),       // nature portrait
  n09:nn('000025-2.jpg'),       // nature portrait
  n10:nn('000026-2.jpg'),       // outdoor
  n11:nn('000035-2.jpg'),       // blue dress ocean rocks
  n12:nn('000038-4-2.jpg'),     // outdoor fashion
  n13:nn('000041.jpg'),         // HK street but outdoor
  n14:nn('000042-2.jpg'),       // outdoor
  n15:nn('000045-12.jpg'),      // outdoor
  n16:nn('000048800004.jpg'),   // nature
  n17:nn('000066-2.jpg'),       // red dress outdoor
  n18:nn('000067-9.jpg'),       // night outdoor
  n19:nn('000068-9.jpg'),       // outdoor
  n20:nn('0604804-0043.jpg'),   // beach white dress flowing
  n21:nn('aidanto-r2-013-5.jpg'), // golden hour beach silhouette
  n22:nn('aidanto-r2-035-16.jpg'), // bikini golden hour surf
  n23:nn('aidanto-r4-047-22.jpg'), // white dress in ocean waves
  n24:nn('aidanto-r4-053-25.jpg'), // white dress ocean walking
  n25:nn('DSC_0274-2.jpg'),     // bodysuit water
  n26:nn('DSC_0310-2.jpg'),     // brunette beach rocks
  n27:nn('DSC_0320-2.jpg'),     // brunette ocean rocks
  n28:nn('DSC_0320.jpg'),       // brunette ocean
  n29:nn('DSC_0321-2.jpg'),     // brunette ocean
  n30:nn('DSC_0321.jpg'),       // brunette ocean
  n31:nn('DSC_0542.jpg'),       // blonde villa pool
  n32:nn('DSC_0544.jpg'),       // blonde villa
  n33:nn('r1-05457-0032.jpg'),  // blonde garden trees golden
  n34:nn('r1-05459-0036.jpg'),  // curly hair green grass field
  n35:nn('r1-05459-0037.jpg'),  // nature
  n36:nn('r1-05460-0022.jpg'),  // brunette garden statue
  n37:nn('r1-05460-0023.jpg'),  // garden
  n38:nn('manila-gallery-dsc-0190.jpg'), // manila garden
  n39:nn('manila-gallery-ivy-002.jpg'),  // ivy portrait
  n40:nn('manila-gallery-white-001.jpg'), // white outdoor
  // Landscape photos — for contained frames only
  nL1:nn('manila-gallery-garden-001.jpg'), // landscape garden
  nL2:nn('manila-gallery-garden-002.jpg'), // landscape garden
}

// Headliners for hooks
const HK = [
  nh('DSC_0075.jpg'),     // redhead cave
  nh('DSC_0526.jpg'),     // blonde villa
  nh('DSC_0321.jpg'),     // brunette ocean
  nh('000001-8.jpg'),     // blonde garden
  nh('000036-5.jpg'),     // swimsuit beach
]

console.log('Loaded 42 nature photos + 5 headliners')

// === LAYOUT BUILDERS ===
function L_hook(s){return {name:'01-hook',html:hero(s,tag('Ubud \u00b7 Shot on 35mm film',64,60)+h1("I'm looking for<br/>models in Ubud.",540,108)+sub('Rice fields. Jungle. Golden hour.<br/>Sign up if you are interested.',400,42))}}
function L_cta(s){return {name:'10-cta',html:cta(s,h1('Sign up.',520)+'<div style="position:absolute;bottom:380px;left:64px;right:64px;"><p style="font-family:'+SA+';font-size:38px;font-weight:600;color:white;margin:0;'+SH+'">Click the link below to sign up.</p><p style="font-family:'+SA+';font-size:32px;color:rgba(255,255,255,0.7);margin:20px 0 0;'+SH+'">Nature shoots. Golden hour. I handle everything.</p></div>')}}
function L_hero(nm,s,tg,hl,sl){return {name:nm,html:hero(s,tag(tg,64,60)+h2(hl,440)+sub(sl,370))}}
function L_trio(nm,a,b,c,tg,sl){return {name:nm,html:dark(tag(tg,64,40)+pr(a,10,80,320,900,-2.5,10)+pr(b,355,60,320,900,1.5,10)+pr(c,700,80,320,900,-1,10)+sub(sl,60))}}
function L_duo(nm,a,b,tg,sl){return {name:nm,html:dark(tag(tg,64,40)+pr(a,30,80,460,850,-2,12)+pr(b,530,100,460,850,2,12)+sub(sl,60))}}
function L_cascade(nm,a,b,tg,sl){return {name:nm,html:dark(tag(tg,64,40)+pr(a,40,60,500,720,-2.5,14)+pr(b,460,480,500,720,2,14)+sub(sl,60))}}
function L_warm3(nm,tg,a,b,c,sl){return {name:nm,html:warm(dtag(tg,64,50)+pr(a,10,80,320,900,-3,10)+pr(b,355,60,320,900,2,10)+pr(c,700,80,320,900,-1.5,10)+dh(sl,60))}}
function L_mag(nm,s,tg,hl,body,ins){return {name:nm,html:'<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#f0ebe0;"><div style="position:absolute;inset:0;background:linear-gradient(170deg,#f5f0e4 0%,#ece4d4 50%,#e0d8c4 100%);"></div>'+img(s,40,40,580,860,'object-position:center top;border-radius:8px;')+'<div style="position:absolute;left:64px;top:940px;right:64px;"><p style="font-family:'+SA+';font-size:16px;font-weight:700;color:rgba(0,0,0,0.3);letter-spacing:0.15em;text-transform:uppercase;margin:0 0 16px;">'+tg+'</p><p style="font-family:'+SE+';font-size:60px;font-weight:700;font-style:italic;color:#1a1a1a;line-height:0.95;margin:0;">'+hl+'</p><p style="font-family:'+SA+';font-size:24px;color:rgba(0,0,0,0.4);line-height:1.5;margin:28px 0 0;">'+body+'</p></div><div style="position:absolute;right:40px;bottom:60px;width:240px;height:340px;background:white;padding:10px;transform:rotate(3deg);box-shadow:4px 4px 20px rgba(0,0,0,0.12);"><img src="'+ins+'" style="width:220px;height:320px;object-fit:cover;object-position:center top;display:block;"/></div></div>'}}
function L_single(nm,s,hl,sl){return {name:nm,html:dark(pr(s,100,80,860,1200,-0.5,16)+h2(hl,160)+sub(sl,90))}}
// Landscape photo in contained frame on dark
function L_landscape(nm,s,hl,sl){return {name:nm,html:dark(tag('Ubud \u00b7 35mm film',64,40)+'<div style="position:absolute;left:40px;top:120px;right:40px;height:640px;border-radius:12px;overflow:hidden;"><img src="'+s+'" style="width:100%;height:100%;object-fit:cover;object-position:center;display:block;"/></div>'+h2(hl,340)+sub(sl,260))}}
function L_herodup(nm,a,b,c,tg,hl,sl){return {name:nm,html:hero(a,tag(tg,64,60)+pr(b,40,1200,420,600,-3,12)+pr(c,560,1180,420,600,2.5,12)+h2(hl,200)+sub(sl,130))}}
function L_split(nm,a,b,c,tg,sl){return {name:nm,html:dark(tag(tg,64,40)+pr(a,20,60,540,1200,-1,14)+pr(b,590,60,420,580,1.5,10)+pr(c,590,670,420,580,-1,10)+sub(sl,60))}}

// 5 VARIANTS — using nature folder, varied layouts, landscape photos included
const variations = [
  { slug: 'v1', slides: [
    L_hook(HK[0]),
    L_trio('02', N.n23, N.n24, N.n21, 'Beach \u00b7 35mm', 'Ocean. Golden hour. Film grain.'),
    L_hero('03', N.n34, 'Ubud', 'Jungle portraits<br/>on film.', 'Rice fields. Waterfalls. Greenery.'),
    L_landscape('04', N.nL1, 'Nature on film<br/>hits different.', 'Garden light. Real 35mm.'),
    L_mag('05', N.n36, 'Ubud \u00b7 Nature', 'Your face.<br/>Natural light.<br/>Real film.', 'Free collaboration. I direct everything. Rice fields, jungle, golden hour — your choice.', N.n33),
    L_duo('06', N.n26, N.n30, 'Ocean \u00b7 Film', 'Wet hair. Salt water. 35mm.'),
    L_warm3('07', 'Shot on 35mm', N.n03, N.n04, N.n01, 'Greenery. Leaves.<br/>Film warmth.'),
    L_cascade('08', N.n11, N.n20, 'Beach \u00b7 Film', 'Ocean rocks on 35mm.'),
    L_hero('09', N.n22, 'Ubud', 'This could<br/>be you.', 'Sign up if you are interested in collaborating.'),
    L_cta(N.n25),
  ]},
  { slug: 'v2', slides: [
    L_hook(HK[1]),
    L_duo('02', N.n31, N.n32, 'Villa \u00b7 Natural light', 'Morning sun. Real film. No studio.'),
    L_trio('03', N.n27, N.n28, N.n29, 'Beach rocks \u00b7 35mm', 'Wet hair. Ocean spray. Film.'),
    L_landscape('04', N.nL2, 'Garden light<br/>on 35mm.', 'The grain makes it real.'),
    L_mag('05', N.n33, 'Nature \u00b7 Film', 'Golden hour<br/>portraits<br/>in Ubud.', 'Rice fields, jungle paths, hidden waterfalls. I direct everything. You just show up.', N.n37),
    L_hero('06', N.n05, 'Ubud', 'Plants. Flowers.<br/>Natural light.', 'Film captures this better than digital.'),
    L_single('07', N.n02, 'Nature on film<br/>hits different.', 'Stone. Water. Greenery.'),
    L_warm3('08', 'Ubud \u00b7 35mm', N.n38, N.n39, N.n40, 'Garden.<br/>Golden hour.'),
    L_hero('09', N.n34, 'Ubud', 'This could<br/>be you.', 'Sign up below.'),
    L_cta(N.n36),
  ]},
  { slug: 'v3', slides: [
    L_hook(HK[2]),
    L_herodup('06', N.n23, N.n21, N.n22, 'Beach \u00b7 35mm', 'Salt air.<br/>Golden hour.', 'Film captures this better than anything.'),
    L_trio('03', N.n26, N.n27, N.n30, 'Ocean rocks', 'Three models. One beach. All film.'),
    L_mag('04', N.n06, 'Ubud \u00b7 Nature', 'Bali beyond<br/>the resorts.', 'Real nature. Real light. All on 35mm film. I direct everything.', N.n05),
    L_landscape('05', N.nL1, 'Garden portraits<br/>on film.', 'Natural light does the work.'),
    L_hero('06b', N.n31, 'Villa', 'Morning sun.<br/>No flash.<br/>Just light.', 'Villa shoots in Ubud.'),
    L_warm3('07', 'Beach \u00b7 35mm', N.n11, N.n20, N.n07, 'Ocean. Sand.<br/>Real film.'),
    L_duo('08', N.n08, N.n09, 'Nature \u00b7 Film', 'Every face looks good in natural light.'),
    L_hero('09', N.n24, 'Ubud', 'This could<br/>be you.', 'Sign up if you are interested in collaborating.'),
    L_cta(N.n03),
  ]},
  { slug: 'v4', slides: [
    L_hook(HK[3]),
    L_trio('02', N.n33, N.n34, N.n36, 'Garden \u00b7 Film', 'Trees. Statues. Golden light.'),
    L_hero('03', N.n23, 'Beach', 'White dress.<br/>Ocean waves.<br/>Film.', 'Beach shoots in Ubud.'),
    L_duo('04', N.n31, N.n32, 'Villa \u00b7 Ubud', 'Natural light. No filter needed.'),
    L_split('05', N.n26, N.n28, N.n29, 'Beach \u00b7 Rocks', 'Ocean portraits on 35mm.'),
    L_mag('06', N.n01, 'Golden hour', 'The best<br/>light in Bali<br/>is free.', 'Sunset. Rice fields. Jungle paths. I direct everything. You get every photo.', N.n02),
    L_single('07', N.n04, 'Jungle shoots<br/>on 35mm.', 'Greenery. Shade. Film warmth.'),
    L_warm3('08', 'Nature \u00b7 Film', N.n35, N.n37, N.n38, 'Garden. Grass.<br/>Golden hour.'),
    L_hero('09', N.n22, 'Ubud', 'This could<br/>be you.', 'Sign up below.'),
    L_cta(N.n25),
  ]},
  { slug: 'v5', slides: [
    L_hook(HK[4]),
    L_duo('02', N.n11, N.n20, 'Ocean rocks \u00b7 Film', 'Beach portraits on 35mm.'),
    L_trio('03', N.n21, N.n23, N.n24, 'Golden hour beach', 'Sunset. Waves. Film grain.'),
    L_hero('04', N.n36, 'Garden', 'Statues.<br/>Trees.<br/>Dappled light.', 'Nature portraits on film.'),
    L_herodup('05', N.n31, N.n32, N.n25, 'Villa \u00b7 Morning', 'Natural light<br/>does the work.', 'I just direct.'),
    L_landscape('06', N.nL2, 'Garden light<br/>on 35mm.', 'Film captures what digital cannot.'),
    L_warm3('07', 'Ubud \u00b7 Nature', N.n03, N.n34, N.n39, 'Forest. Ivy.<br/>Grass fields.'),
    L_cascade('08', N.n10, N.n12, 'Outdoors \u00b7 Film', 'Natural light. Natural grain.'),
    L_hero('09', N.n24, 'Ubud', 'This could<br/>be you.', 'Sign up if you are interested in collaborating.'),
    L_cta(N.n40),
  ]},
]

async function render(){
  const all=[]
  for(const v of variations){const dir=path.join(OUT,v.slug);fs.mkdirSync(dir,{recursive:true});for(const s of v.slides)all.push({...s,name:v.slug+'-'+s.name,dir:v.slug})}
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
