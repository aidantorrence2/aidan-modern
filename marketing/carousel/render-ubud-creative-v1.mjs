import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, 'output-ubud-creative-v1')
const HD = '/Users/aidantorrence/Documents/aidan-modern/public/images/headliners'
const FV = '/Users/aidantorrence/Documents/aidan-modern/public/images/faves'
fs.mkdirSync(OUT, { recursive: true })

function nh(f){return 'data:image/jpeg;base64,'+fs.readFileSync(path.join(HD,f)).toString('base64')}
function nf(f){return 'data:image/jpeg;base64,'+fs.readFileSync(path.join(FV,f)).toString('base64')}

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

// === NATURE/OUTDOOR PHOTOS — hand-picked ===
// Beach/ocean rocks (brunette wet hair)
const N = {
  // Beach rocks
  br1:nf('DSC_0309-2.jpg'), br2:nf('DSC_0310-2.jpg'), br3:nf('DSC_0314.jpg'),
  br4:nf('DSC_0316.jpg'), br5:nf('DSC_0320-2.jpg'), br6:nf('DSC_0320.jpg'),
  br7:nf('DSC_0321.jpg'), br8:nf('DSC_0321-2.jpg'),
  // Cave/water (filipina)
  cv1:nf('DSC_0462.jpg'), cv2:nf('DSC_0480.jpg'), cv3:nf('DSC_0775.jpg'),
  // Cave/rocks (redhead)
  rd1:nf('DSC_0074.jpg'), rd2:nf('DSC_0075.jpg'), rd3:nf('DSC_0943.jpg'),
  rd4:nf('DSC_0945.jpg'), rd5:nf('DSC_0951.jpg'), rd6:nf('DSC_0956.jpg'),
  rd7:nf('DSC_0957.jpg'), rd8:nf('DSC_0960.jpg'), rd9:nf('DSC_0962.jpg'),
  rd10:nf('DSC_0979.jpg'), rd11:nf('DSC_0994.jpg'),
  // Village outdoor Bali (blonde)
  vl1:nf('DSC_0343.jpg'), vl2:nf('DSC_0347.jpg'), vl3:nf('DSC_0358.jpg'),
  vl4:nf('DSC_0360.jpg'), vl5:nf('DSC_0368.jpg'), vl6:nf('DSC_0372.jpg'),
  vl7:nf('DSC_0375.jpg'), vl8:nf('DSC_0376.jpg'),
  // Villa/pool natural light (blonde)
  vi1:nf('DSC_0526.jpg'), vi2:nf('DSC_0542.jpg'), vi3:nf('DSC_0544.jpg'),
  vi4:nf('DSC_0558.jpg'), vi5:nf('DSC_0561.jpg'),
  // Temple bench (dark hair)
  tm1:nf('DSC_0232.jpg'), tm2:nf('DSC_0249.jpg'), tm3:nf('DSC_0256.jpg'),
  // Garden/greenery
  gd1:nf('000001-4.jpg'), gd2:nf('000001-8.jpg'),
  // Ivy/leaves
  iv1:nf('000011-6.jpg'), iv2:nf('000010-6.jpg'),
  // Forest trail (blonde)
  fr1:nf('000037.jpg'), fr2:nf('000037-4.jpg'), fr3:nf('000037-4-2.jpg'), fr4:nf('000037-3-3.jpg'),
  // Golden hour outdoor
  gh1:nf('000039.jpg'), gh2:nf('000039-3.jpg'), gh3:nf('000039-5.jpg'),
  // Ocean rocks (blue dress)
  oc1:nf('000035-2.jpg'), oc2:nf('000035-4.jpg'), oc3:nf('000035-5.jpg'),
  // Swimsuit beach
  sw1:nf('000036-5.jpg'), sw2:nf('000036-5-2.jpg'),
  // Waterfall/stone greenery
  wf1:nf('000002-11.jpg'),
  // Plants/flowers
  pl1:nf('000019-2.jpg'),
}

// Headliners for hooks — pick nature-appropriate ones
const HK = [
  nh('DSC_0075.jpg'),     // redhead cave — very nature
  nh('DSC_0526.jpg'),     // blonde villa pool — nature/villa
  nh('DSC_0321.jpg'),     // brunette ocean rocks — beach
  nh('000001-8.jpg'),     // blonde garden — nature
  nh('000036-5.jpg'),     // swimsuit beach trees — nature
]

console.log('Loaded nature photos + headliners')

// === LAYOUT BUILDERS ===
function L_hook(s){return {name:'01-hook',html:hero(s,tag('Ubud \u00b7 Shot on 35mm film',64,60)+h1("I'm looking for<br/>models in Ubud.",540)+sub('Rice fields. Jungle. Golden hour.<br/>Sign up if you are interested.',420,40))}}
function L_cta(s){return {name:'10-cta',html:cta(s,h1('Sign up.',520)+'<div style="position:absolute;bottom:380px;left:64px;right:64px;"><p style="font-family:'+SA+';font-size:38px;font-weight:600;color:white;margin:0;'+SH+'">Click the link below to sign up.</p><p style="font-family:'+SA+';font-size:32px;color:rgba(255,255,255,0.7);margin:20px 0 0;'+SH+'">Nature shoots. Golden hour. I handle everything.</p></div>')}}
function L_hero(nm,s,tg,hl,sl){return {name:nm,html:hero(s,tag(tg,64,60)+h2(hl,440)+sub(sl,370))}}
function L_trio(nm,a,b,c,tg,sl){return {name:nm,html:dark(tag(tg,64,40)+pr(a,10,80,320,900,-2.5,10)+pr(b,355,60,320,900,1.5,10)+pr(c,700,80,320,900,-1,10)+sub(sl,60))}}
function L_duo(nm,a,b,tg,sl){return {name:nm,html:dark(tag(tg,64,40)+pr(a,30,80,460,850,-2,12)+pr(b,530,100,460,850,2,12)+sub(sl,60))}}
function L_cascade(nm,a,b,tg,sl){return {name:nm,html:dark(tag(tg,64,40)+pr(a,40,60,500,720,-2.5,14)+pr(b,460,480,500,720,2,14)+sub(sl,60))}}
function L_warm3(nm,tg,a,b,c,sl){return {name:nm,html:warm(dtag(tg,64,50)+pr(a,10,80,320,900,-3,10)+pr(b,355,60,320,900,2,10)+pr(c,700,80,320,900,-1.5,10)+dh(sl,60))}}
function L_mag(nm,s,tg,hl,body,ins){return {name:nm,html:'<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#f0ebe0;"><div style="position:absolute;inset:0;background:linear-gradient(170deg,#f5f0e4 0%,#ece4d4 50%,#e0d8c4 100%);"></div>'+img(s,40,40,580,860,'object-position:center top;border-radius:8px;')+'<div style="position:absolute;left:64px;top:940px;right:64px;"><p style="font-family:'+SA+';font-size:16px;font-weight:700;color:rgba(0,0,0,0.3);letter-spacing:0.15em;text-transform:uppercase;margin:0 0 16px;">'+tg+'</p><p style="font-family:'+SE+';font-size:60px;font-weight:700;font-style:italic;color:#1a1a1a;line-height:0.95;margin:0;">'+hl+'</p><p style="font-family:'+SA+';font-size:24px;color:rgba(0,0,0,0.4);line-height:1.5;margin:28px 0 0;">'+body+'</p></div><div style="position:absolute;right:40px;bottom:60px;width:240px;height:340px;background:white;padding:10px;transform:rotate(3deg);box-shadow:4px 4px 20px rgba(0,0,0,0.12);"><img src="'+ins+'" style="width:220px;height:320px;object-fit:cover;object-position:center top;display:block;"/></div></div>'}}
function L_single(nm,s,hl,sl){return {name:nm,html:dark(pr(s,100,80,860,1200,-0.5,16)+h2(hl,160)+sub(sl,90))}}
function L_herodup(nm,a,b,c,tg,hl,sl){return {name:nm,html:hero(a,tag(tg,64,60)+pr(b,40,1200,420,600,-3,12)+pr(c,560,1180,420,600,2.5,12)+h2(hl,200)+sub(sl,130))}}
function L_split(nm,a,b,c,tg,sl){return {name:nm,html:dark(tag(tg,64,40)+pr(a,20,60,540,1200,-1,14)+pr(b,590,60,420,580,1.5,10)+pr(c,590,670,420,580,-1,10)+sub(sl,60))}}

// 5 VARIANTS — 10 slides each, Ubud/nature copy
const variations = [
  { slug: 'v1', slides: [
    L_hook(HK[0]),
    L_trio('02', N.br3, N.br1, N.br5, 'Beach \u00b7 35mm film', 'Ocean rocks. Golden hour. Film grain.'),
    L_hero('03', N.rd1, 'Ubud', 'Jungle shoots<br/>on film.', 'Caves. Waterfalls. Rice terraces.'),
    L_duo('04', N.vl2, N.vl5, 'Village life', 'Bali as it really looks.'),
    L_mag('05', N.vi1, 'Ubud \u00b7 Nature', 'Your face.<br/>Natural light.<br/>Real film.', 'Free collaboration. I direct everything. Rice fields, jungle, golden hour — your choice.', N.vi4),
    L_herodup('06', N.gh1, N.gh2, N.gh3, 'Golden hour', 'The light does<br/>the work.', 'I just point the camera.'),
    L_warm3('07', 'Shot on 35mm', N.fr1, N.fr2, N.iv1, 'Forest. Greenery.<br/>Film warmth.'),
    L_cascade('08', N.oc1, N.oc2, 'Beach \u00b7 Film', 'Ocean rocks on 35mm.'),
    L_hero('09', N.cv1, 'Ubud', 'This could<br/>be you.', 'Sign up if you are interested in collaborating.'),
    L_cta(N.tm2),
  ]},
  { slug: 'v2', slides: [
    L_hook(HK[1]),
    L_duo('02', N.vi2, N.vi3, 'Villa \u00b7 Natural light', 'Morning sun. Real film. No studio needed.'),
    L_trio('03', N.rd3, N.rd5, N.rd8, 'Cave \u00b7 35mm', 'Water. Rocks. Film grain.'),
    L_hero('04', N.vl7, 'Bali village', 'Real places.<br/>Real light.', 'No studio. Just Bali.'),
    L_mag('05', N.gd1, 'Nature \u00b7 Film', 'Golden hour<br/>portraits<br/>in Ubud.', 'Rice fields, jungle paths, hidden waterfalls. I direct everything. You just show up.', N.gd2),
    L_split('06', N.br7, N.br2, N.br4, 'Ocean \u00b7 Film', 'Wet hair. Salt water. 35mm.'),
    L_single('07', N.wf1, 'Nature on film<br/>hits different.', 'The grain is the whole point.'),
    L_warm3('08', 'Ubud \u00b7 35mm', N.gh1, N.iv2, N.fr3, 'Jungle. Garden.<br/>Golden hour.'),
    L_hero('09', N.cv2, 'Ubud', 'This could<br/>be you.', 'Sign up below.'),
    L_cta(N.rd2),
  ]},
  { slug: 'v3', slides: [
    L_hook(HK[2]),
    L_herodup('02', N.br3, N.br6, N.br8, 'Beach \u00b7 35mm', 'Salt air.<br/>Wet rocks.', 'Film captures this better than anything.'),
    L_trio('03', N.rd6, N.rd7, N.rd9, 'Cave light', 'Shadows and film grain.'),
    L_mag('04', N.vl2, 'Ubud \u00b7 Village', 'Bali beyond<br/>the resorts.', 'Real village life. Dogs, motorbikes, golden hour. All on 35mm film.', N.vl4),
    L_duo('05', N.tm1, N.tm3, 'Temple \u00b7 Film', 'Offerings. Color. Warmth.'),
    L_hero('06', N.vi4, 'Natural light', 'Morning sun<br/>through a<br/>villa window.', 'No flash. No studio. Just light.'),
    L_warm3('07', 'Beach \u00b7 35mm', N.oc1, N.oc3, N.sw1, 'Ocean. Sand.<br/>Real film.'),
    L_cascade('08', N.fr1, N.gh3, 'Jungle trail', 'Forest light on 35mm.'),
    L_hero('09', N.pl1, 'Ubud', 'This could<br/>be you.', 'Sign up if you are interested in collaborating.'),
    L_cta(N.vl6),
  ]},
  { slug: 'v4', slides: [
    L_hook(HK[3]),
    L_trio('02', N.vl1, N.vl3, N.vl8, 'Bali village \u00b7 Film', 'Real life. Real light. Real film.'),
    L_hero('03', N.rd10, 'Cave', 'Caves at<br/>golden hour.', 'Water. Rocks. Film.'),
    L_duo('04', N.vi1, N.vi5, 'Villa \u00b7 Ubud', 'Natural light. No filter needed.'),
    L_split('05', N.br3, N.cv1, N.cv3, 'Beach \u00b7 Cave', 'Two locations. One roll of film.'),
    L_mag('06', N.gh1, 'Golden hour', 'The best<br/>light in Bali<br/>is free.', 'Sunset. Rice fields. Jungle paths. I direct everything. You get every photo.', N.gh2),
    L_single('07', N.iv1, 'Jungle shoots<br/>on 35mm.', 'Greenery. Shade. Film warmth.'),
    L_warm3('08', 'Nature \u00b7 Film', N.oc2, N.sw2, N.gd2, 'Beach. Garden.<br/>Golden hour.'),
    L_hero('09', N.rd4, 'Ubud', 'This could<br/>be you.', 'Sign up below.'),
    L_cta(N.fr2),
  ]},
  { slug: 'v5', slides: [
    L_hook(HK[4]),
    L_duo('02', N.oc1, N.oc3, 'Ocean rocks \u00b7 Film', 'Salt spray on 35mm.'),
    L_trio('03', N.vl2, N.vl5, N.vl7, 'Village \u00b7 Bali', 'Dogs. Motorbikes. Golden light.'),
    L_hero('04', N.rd1, 'Cave', 'Water and<br/>rock on film.', 'No filter needed.'),
    L_herodup('05', N.vi2, N.vi3, N.vi5, 'Villa \u00b7 Morning', 'Natural light<br/>does the work.', 'I just direct.'),
    L_mag('06', N.br3, 'Beach \u00b7 35mm', 'Wet hair.<br/>Salt water.<br/>Film grain.', 'Beach shoots in Bali. I direct everything. No experience needed.', N.br1),
    L_warm3('07', 'Ubud \u00b7 Nature', N.fr1, N.fr4, N.iv2, 'Forest trails<br/>on film.'),
    L_cascade('08', N.gh2, N.gh3, 'Golden hour', 'The best light happens twice a day.'),
    L_hero('09', N.tm2, 'Ubud', 'This could<br/>be you.', 'Sign up if you are interested in collaborating.'),
    L_cta(N.cv2),
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
