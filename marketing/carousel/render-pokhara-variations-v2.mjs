import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

// === Pokhara carousel v2 ===
// New creative. 10 slides (only 10 go into Meta). Anti-scam copy on EVERY slide.
// All copy lives in the SAFE MIDDLE THIRD (~y760–1280) so it never covers the
// Meta link/CTA overlay (bottom) and is never too high (top profile overlay).

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, 'output-pokhara-variations-v2')
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

// === Copy block — ALWAYS in the safe middle third (y ~760–1280) ===
// scrim: soft spotlight band so white copy reads over any photo (skip on dark bg)
function copyMid(eyebrow,head,sub,pill,headSz,noScrim){
  headSz=headSz||92
  const sc=noScrim?'':'<div style="position:absolute;left:0;right:0;top:660px;height:720px;background:linear-gradient(180deg,transparent,rgba(0,0,0,0.34) 16%,rgba(0,0,0,0.68) 50%,rgba(0,0,0,0.34) 84%,transparent);"></div>'
  const eb=eyebrow?'<p style="font-family:'+SA+';font-size:25px;font-weight:700;color:#dcbb7d;letter-spacing:0.14em;text-transform:uppercase;margin:0 0 22px;'+SH+'">'+eyebrow+'</p>':''
  const pl=pill?'<p style="display:inline-block;font-family:'+SA+';font-size:26px;font-weight:700;color:#0a0e08;background:#dcbb7d;padding:13px 26px;border-radius:999px;letter-spacing:0.02em;margin:32px 0 0;box-shadow:0 6px 24px rgba(0,0,0,0.4);">'+pill+'</p>':''
  const blk='<div style="position:absolute;left:74px;right:74px;top:760px;">'+eb
    +'<p style="font-family:'+SE+';font-size:'+headSz+'px;font-weight:700;font-style:italic;color:#fff;line-height:0.97;margin:0;'+SH+'">'+head+'</p>'
    +'<p style="font-family:'+SA+';font-size:37px;font-weight:500;color:rgba(255,255,255,0.92);line-height:1.34;margin:26px 0 0;'+SH+'">'+sub+'</p>'+pl+'</div>'
  return sc+blk
}

// === Layouts (10 distinct slides) ===
function L_hook(s,c){return {name:'01',html:hero(s,copyMid(c.eyebrow,c.head,c.sub,c.pill,98))}}
function L_collage(nm,a,b,d,c){return {name:nm,html:dark(pr(a,55,90,430,510,-2,12)+pr(b,545,90,430,240,2,10)+pr(d,545,378,430,250,-1.5,10)+copyMid(c.eyebrow,c.head,c.sub,c.pill,84,true))}}
function L_duo(nm,a,b,c){return {name:nm,html:dark(pr(a,70,100,440,500,-2,12)+pr(b,560,120,440,490,2,12)+copyMid(c.eyebrow,c.head,c.sub,c.pill,86,true))}}
function L_single(nm,s,c){return {name:nm,html:dark(pr(s,244,86,560,520,-0.5,16)+copyMid(c.eyebrow,c.head,c.sub,c.pill,86,true))}}
function L_hero(nm,s,c){return {name:nm,html:hero(s,copyMid(c.eyebrow,c.head,c.sub,c.pill,92))}}
function L_cta(nm,s,c){return {name:nm,html:ctaBg(s,copyMid(c.eyebrow,c.head,c.sub,c.pill,104))}}

// How it works — numbered, compressed to stay clear of the bottom link zone
function L_steps(nm){
  const row=(n,t,d,top)=>'<div style="position:absolute;left:74px;top:'+top+'px;font-family:'+SE+';font-size:52px;font-weight:700;font-style:italic;color:#dcbb7d;line-height:1;'+SH+'">'+n+'</div><div style="position:absolute;left:160px;right:74px;top:'+(top+1)+'px;"><p style="font-family:'+SE+';font-size:40px;font-weight:700;font-style:italic;color:#fff;margin:0;line-height:1.04;'+SH+'">'+t+'</p><p style="font-family:'+SA+';font-size:25px;color:rgba(255,255,255,0.66);margin:9px 0 0;line-height:1.3;">'+d+'</p></div>'
  const inner='<div style="position:absolute;left:74px;right:74px;top:300px;"><p style="font-family:'+SA+';font-size:25px;font-weight:700;color:#dcbb7d;letter-spacing:0.14em;text-transform:uppercase;margin:0 0 20px;'+SH+'">How it works</p><p style="font-family:'+SE+';font-size:64px;font-weight:700;font-style:italic;color:#fff;margin:0;line-height:0.95;'+SH+'">Here’s how<br/>it works.</p></div>'
    +row('1','Sign up — it’s free.','Tap the link below. Takes a minute.',560)
    +row('2','We chat first.','Phone or video call to go over the details.',730)
    +row('3','We shoot — I direct it all.','Posing, angles, light. No experience needed.',900)
    +row('4','You keep the photos.','Edited 35mm film shots, yours forever.',1070)
    +'<div style="position:absolute;left:74px;right:74px;top:1240px;"><p style="font-family:'+SA+';font-size:25px;color:rgba(255,255,255,0.6);margin:0;line-height:1.4;'+SH+'">A real photographer building a real Pokhara film portfolio. 100% free — no payment, ever.</p></div>'
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

// === 3 VARIANTS — Pokhara location flavor; shared anti-scam spine ===
const VARIANTS=[
 { slug:'a', off:0,
   hookSub:'Lakeside golden hour, shot on real 35mm film. 100% free.',
   collH:'Phewa Lake.<br/>On real film.', collS:'Still water, wooden boats, golden light. These are my actual shoots — not stock, not AI.',
   teaseS:'Lakeside golden hour on real film. Free collab — I direct everything.',
   spots:'Phewa shoreline, wooden boats, Tal Barahi temple' },
 { slug:'b', off:13,
   hookSub:'Himalayan sunrise, shot on real 35mm film. 100% free.',
   collH:'Annapurna.<br/>On real film.', collS:'Snow peaks, sea of cloud, dawn light. These are my actual shoots — not stock, not AI.',
   teaseS:'Fishtail at sunrise on real film. Free collab — I direct everything.',
   spots:'Sarangkot sunrise, Fishtail backdrop, hill terraces' },
 { slug:'c', off:26,
   hookSub:'Pagoda & open-sky views, shot on real 35mm film. 100% free.',
   collH:'Peace Pagoda.<br/>On real film.', collS:'White pagoda, wide skies, warm light. These are my actual shoots — not stock, not AI.',
   teaseS:'Hilltop golden hour on real film. Free collab — I direct everything.',
   spots:'World Peace Pagoda, paragliding ridges, old bazaar' },
]

function buildVariant(F){
  const p=pick(F.off)
  return [
    L_hook(p[0],  {eyebrow:'Pokhara · Shot on 35mm film', head:'Free film<br/>photo shoot.', sub:F.hookSub, pill:'No payment — ever'}),
    L_collage('02',p[1],p[2],p[3], {eyebrow:'My actual work', head:F.collH, sub:F.collS}),
    L_duo('03',p[4],p[5], {eyebrow:'Not a scam', head:'Real photos.<br/>Real people.', sub:'A genuine portfolio of real film shoots. Check my profile — it’s all there.', pill:'See my work'}),
    L_hero('04',p[6], {eyebrow:'The catch?', head:'There is<br/>no catch.', sub:'Completely free. You keep every edited photo. No upsells, no hidden fees, no strings.', pill:'100% free'}),
    L_hero('05',p[7], {eyebrow:'Why free?', head:'I’m building<br/>my portfolio.', sub:'I’m a real photographer who needs fresh faces for my book. That’s the whole deal.', pill:'Real photographer'}),
    L_hero('06',p[8], {eyebrow:'Before we shoot', head:'Let’s talk<br/>first.', sub:'We can schedule a phone or video call to go over every detail. Ask me anything.', pill:'Phone or video call'}),
    L_single('07',p[9], {eyebrow:'On your terms', head:'Public spots.<br/>Bring a friend.', sub:'Daytime, public locations — think '+F.spots+'. A time that suits you.', pill:'Your call'}),
    L_steps('08'),
    L_hero('09',p[10], {eyebrow:'Pokhara', head:'This could<br/>be you.', sub:F.teaseS, pill:'Limited spots'}),
    L_cta('10',p[2], {eyebrow:'Ready?', head:'Sign up free.', sub:'Tap the link below. Prefer to chat first? We can hop on a quick call.', pill:'Free · No catch · Real film'}),
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
