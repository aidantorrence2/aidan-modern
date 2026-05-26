import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, 'output-bali-free-v2')
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
function L_hook(s){return {name:'01-hook',html:hero(s,tag('Bali \u00b7 Shot on 35mm film',64,60)+h1("Bali free<br/>photo shoot.",540,108)+sub('Free photo shoot on 35mm film.<br/>Sign up below. It is free.',400,42))}}
function L_cta(s){return {name:'10-cta',html:cta(s,h1('Sign up.',520)+'<div style="position:absolute;bottom:380px;left:64px;right:64px;"><p style="font-family:'+SA+';font-size:38px;font-weight:600;color:white;margin:0;'+SH+'">Click the link below to sign up.</p><p style="font-family:'+SA+';font-size:32px;color:rgba(255,255,255,0.7);margin:20px 0 0;'+SH+'">Free photo shoot. I handle everything.</p></div>')}}
function L_hero(nm,s,tg,hl,sl){return {name:nm,html:hero(s,tag(tg,64,60)+h2(hl,440)+sub(sl,370))}}
function L_trio(nm,a,b,c,tg,sl){return {name:nm,html:dark(tag(tg,64,40)+pr(a,10,80,320,900,-2.5,10)+pr(b,355,60,320,900,1.5,10)+pr(c,700,80,320,900,-1,10)+sub(sl,60))}}
function L_duo(nm,a,b,tg,sl){return {name:nm,html:dark(tag(tg,64,40)+pr(a,30,80,460,850,-2,12)+pr(b,530,100,460,850,2,12)+sub(sl,60))}}
function L_single(nm,s,hl,sl){return {name:nm,html:dark(pr(s,100,80,860,1200,-0.5,16)+h2(hl,160)+sub(sl,90))}}
function L_warm3(nm,tg,a,b,c,sl){return {name:nm,html:warm(dtag(tg,64,50)+pr(a,10,80,320,900,-3,10)+pr(b,355,60,320,900,2,10)+pr(c,700,80,320,900,-1.5,10)+dh(sl,60))}}
function L_mag(nm,s,tg,hl,body,ins){return {name:nm,html:'<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#f0ebe0;"><div style="position:absolute;inset:0;background:linear-gradient(170deg,#f5f0e4 0%,#ece4d4 50%,#e0d8c4 100%);"></div>'+img(s,40,40,580,860,'object-position:center top;border-radius:8px;')+'<div style="position:absolute;left:64px;top:940px;right:64px;"><p style="font-family:'+SA+';font-size:16px;font-weight:700;color:rgba(0,0,0,0.3);letter-spacing:0.15em;text-transform:uppercase;margin:0 0 16px;">'+tg+'</p><p style="font-family:'+SE+';font-size:60px;font-weight:700;font-style:italic;color:#1a1a1a;line-height:0.95;margin:0;">'+hl+'</p><p style="font-family:'+SA+';font-size:24px;color:rgba(0,0,0,0.4);line-height:1.5;margin:28px 0 0;">'+body+'</p></div><div style="position:absolute;right:40px;bottom:60px;width:240px;height:340px;background:white;padding:10px;transform:rotate(3deg);box-shadow:4px 4px 20px rgba(0,0,0,0.12);"><img src="'+ins+'" style="width:220px;height:320px;object-fit:cover;object-position:center top;display:block;"/></div></div>'}}
function L_landscape(nm,s,hl,sl){return {name:nm,html:dark(tag('Bali \u00b7 35mm film',64,40)+'<div style="position:absolute;left:40px;top:120px;right:40px;height:640px;border-radius:12px;overflow:hidden;"><img src="'+s+'" style="width:100%;height:100%;object-fit:cover;object-position:center;display:block;"/></div>'+h2(hl,340)+sub(sl,260))}}
function L_cascade(nm,a,b,tg,sl){return {name:nm,html:dark(tag(tg,64,40)+pr(a,40,60,500,720,-2.5,14)+pr(b,460,480,500,720,2,14)+sub(sl,60))}}
function L_herodup(nm,a,b,c,tg,hl,sl){return {name:nm,html:hero(a,tag(tg,64,60)+pr(b,40,1200,420,600,-3,12)+pr(c,560,1180,420,600,2.5,12)+h2(hl,200)+sub(sl,130))}}

// === LOAD ALL 42 NATURE PHOTOS ===
// 40 portrait
const p01=nn('000001-4.jpg'), p02=nn('000002-11.jpg'), p03=nn('000010-6.jpg'),
      p04=nn('000011-6.jpg'), p05=nn('000019-2.jpg'), p06=nn('000019-6.jpg'),
      p07=nn('000023600024.jpg'), p08=nn('000024-5.jpg'), p09=nn('000025-2.jpg'),
      p10=nn('000026-2.jpg'), p11=nn('000035-2.jpg'), p12=nn('000038-4-2.jpg'),
      p13=nn('000041.jpg'), p14=nn('000042-2.jpg'), p15=nn('000045-12.jpg'),
      p16=nn('000048800004.jpg'), p17=nn('000066-2.jpg'), p18=nn('000067-9.jpg'),
      p19=nn('000068-9.jpg'), p20=nn('0604804-0043.jpg'), p21=nn('aidanto-r2-013-5.jpg'),
      p22=nn('aidanto-r2-035-16.jpg'), p23=nn('aidanto-r4-047-22.jpg'),
      p24=nn('aidanto-r4-053-25.jpg'), p25=nn('DSC_0274-2.jpg'),
      p26=nn('DSC_0310-2.jpg'), p27=nn('DSC_0320-2.jpg'), p28=nn('DSC_0320.jpg'),
      p29=nn('DSC_0321-2.jpg'), p30=nn('DSC_0321.jpg'), p31=nn('DSC_0542.jpg'),
      p32=nn('DSC_0544.jpg'), p33=nn('manila-gallery-dsc-0190.jpg'),
      p34=nn('manila-gallery-ivy-002.jpg'), p35=nn('manila-gallery-white-001.jpg'),
      p36=nn('r1-05457-0032.jpg'), p37=nn('r1-05459-0036.jpg'),
      p38=nn('r1-05459-0037.jpg'), p39=nn('r1-05460-0022.jpg'),
      p40=nn('r1-05460-0023.jpg')
// 2 landscape
const L1=nn('manila-gallery-garden-001.jpg'), L2=nn('manila-gallery-garden-002.jpg')

console.log('Loaded all 42 nature photos')

// 4 variants, 10 slides each, every photo used exactly once
// v1: 11 photos, v2: 11, v3: 10, v4: 10 = 42
const variations = [
  // V1: 11 photos — hook(1) + trio(3) + duo(2) + landscape(1) + hero(1) + duo(2) + hero(1) = 11
  { slug: 'v1', slides: [
    L_hook(p23),  // white dress ocean waves — stunning nature hook
    L_trio('02', p26, p27, p30, 'Beach \u00b7 35mm', 'Ocean rocks. Wet hair. Film grain.'),
    L_duo('03', p21, p22, 'Golden hour', 'Sunset on the beach. Real film.'),
    L_landscape('04', L1, 'Nature on film<br/>hits different.', 'Garden light. Real 35mm.'),
    L_hero('05', p24, 'Bali', 'White dress.<br/>Ocean waves.<br/>Film.', 'Beach shoots on 35mm.'),
    L_mag('06', p39, 'Bali \u00b7 Nature', 'Your face.<br/>Natural light.<br/>Real film.', 'Free collab. I direct everything. Rice fields, jungle, golden hour — your choice.', p36),
    L_hero('07', p20, 'Bali', 'Beach. Waves.<br/>Flowing fabric.', 'Film captures movement better.'),
    L_single('08', p34, 'Jungle<br/>portraits.', 'Ivy. Greenery. Shade.'),
    L_hero('09', p37, 'Bali', 'This could<br/>be you.', 'Sign up below. It is free.in collaborating.'),
    L_cta(p25),
  ]},
  // V2: 11 photos — hook(1) + herodup(3) + trio(3) + hero(1) + duo(2) + hero(1) = 11
  { slug: 'v2', slides: [
    L_hook(p31),  // blonde villa pool
    L_herodup('02', p28, p29, p26, 'Beach \u00b7 35mm', 'Salt air.<br/>Wet rocks.', 'Film handles water better than digital.'),
    L_trio('03', p01, p02, p03, 'Greenery \u00b7 Film', 'Garden. Leaves. Stone walls.'),
    L_hero('04', p38, 'Ubud', 'Forest light<br/>on film.', 'Dappled sun. Real grain.'),
    L_landscape('05', L2, 'Garden portraits<br/>on 35mm.', 'The grain makes it real.'),
    L_mag('06', p33, 'Nature \u00b7 Film', 'Golden hour<br/>portraits<br/>in Bali.', 'Rice fields, jungle paths, waterfalls. I direct everything. You just show up.', p40),
    L_duo('07', p04, p05, 'Nature \u00b7 Ubud', 'Ivy. Flowers. Natural light.'),
    L_hero('08', p32, 'Villa', 'Morning sun.<br/>No flash.<br/>Just light.', 'Villa shoots in Bali.'),
    L_hero('09', p07, 'Bali', 'This could<br/>be you.', 'Sign up below.'),
    L_cta(p06),
  ]},
  // V3: 10 photos — hook(1) + duo(2) + hero(1) + trio(3) + hero(1) + hero(1) + hero(1) = 10
  { slug: 'v3', slides: [
    L_hook(p11),  // blue dress ocean rocks
    L_duo('02', p08, p09, 'Outdoor \u00b7 Film', 'Natural light does the work.'),
    L_hero('03', p10, 'Ubud', 'Every face<br/>looks good in<br/>natural light.', 'No studio needed.'),
    L_trio('04', p12, p13, p14, 'Shot on 35mm', 'Different people. Same film.'),
    L_cascade('05', p15, p16, 'Nature \u00b7 Film', 'Outdoor portraits on 35mm.'),
    L_hero('06', p17, 'Ubud', 'Red dress.<br/>Green alley.<br/>Film.', 'Color on 35mm is unmatched.'),
    L_single('07', p18, 'Night nature<br/>on film.', 'Warm light. Real grain.'),
    L_hero('08', p19, 'Ubud', 'Golden hour<br/>outdoors.', 'I direct everything.'),
    L_hero('09', p35, 'Bali', 'This could<br/>be you.', 'Sign up below. It is free.in collaborating.'),
    L_cta(p33),
  ]},
  // V4: 10 photos — hook(1) + warm3(3) + duo(2) + hero(1) + hero(1) + hero(1) + hero(1) = 10
  { slug: 'v4', slides: [
    L_hook(p36),  // blonde garden trees golden light
    L_warm3('02', 'Bali \u00b7 35mm', p37, p38, p40, 'Forest. Grass.<br/>Golden hour.'),
    L_duo('03', p31, p32, 'Villa \u00b7 Natural light', 'Morning sun. Real film.'),
    L_hero('04', p39, 'Garden', 'Statues. Trees.<br/>Dappled light.', 'Nature portraits on film.'),
    L_mag('05', p01, 'Bali \u00b7 Nature', 'The best light<br/>in Bali<br/>is free.', 'Sunset. Rice fields. Jungle paths. I direct everything.', p34),
    L_hero('06', p30, 'Beach', 'Ocean rocks<br/>on 35mm.', 'Wet hair. Salt water. Film.'),
    L_single('07', p03, 'Jungle shoots<br/>on film.', 'Greenery. Shade. Film warmth.'),
    L_hero('08', p23, 'Bali', 'White dress.<br/>Ocean waves.', 'Beach shoots in Bali.'),
    L_hero('09', p24, 'Bali', 'This could<br/>be you.', 'Sign up below.'),
    L_cta(p20),
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
