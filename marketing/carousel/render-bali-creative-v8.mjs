import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, 'output-bali-creative-v8')
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

function hero(s,inner){return '<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">'+img(s,0,0,1080,1920,'filter:saturate(1.1) contrast(1.05);')+'<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0.08) 0%,transparent 15%,rgba(0,0,0,0.35) 55%,rgba(0,0,0,0.96) 100%);"></div>'+inner+GR+'</div>'}
function dark(inner){return '<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#080a0e;"><div style="position:absolute;inset:0;background:linear-gradient(170deg,#0c1420 0%,#080c14 50%,#060a10 100%);"></div><div style="position:absolute;inset:0;background:radial-gradient(circle at 20% 20%,rgba(80,140,220,0.12),transparent 30%),radial-gradient(circle at 80% 80%,rgba(220,170,100,0.08),transparent 25%);"></div>'+inner+GR+'</div>'}
function warm(inner){return '<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#f5f0e6;"><div style="position:absolute;inset:0;background:linear-gradient(170deg,#faf6ee 0%,#f0e8d8 50%,#e5d8c4 100%);"></div>'+inner+'</div>'}
function cta(s,inner){return '<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">'+img(s,0,0,1080,1920,'filter:saturate(1.1) brightness(0.5);')+'<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0.4) 0%,rgba(0,0,0,0.15) 30%,rgba(0,0,0,0.15) 50%,rgba(0,0,0,0.95) 100%);"></div>'+inner+GR+'</div>'}

function h1(t,bot,sz){sz=sz||108;return '<div style="position:absolute;bottom:'+bot+'px;left:64px;right:64px;"><p style="font-family:'+SE+';font-size:'+sz+'px;font-weight:700;font-style:italic;color:white;line-height:0.92;margin:0;'+SH+'">'+t+'</p></div>'}
function h2(t,bot,sz){sz=sz||64;return '<div style="position:absolute;bottom:'+bot+'px;left:64px;right:64px;"><p style="font-family:'+SE+';font-size:'+sz+'px;font-weight:700;font-style:italic;color:white;line-height:1.0;margin:0;'+SH+'">'+t+'</p></div>'}
function sub(t,bot,sz){sz=sz||34;return '<div style="position:absolute;bottom:'+bot+'px;left:64px;right:64px;"><p style="font-family:'+SA+';font-size:'+sz+'px;font-weight:500;color:rgba(255,255,255,0.85);line-height:1.35;margin:0;'+SH+'">'+t+'</p></div>'}
function tag(t,l,top){return '<p style="position:absolute;left:'+l+'px;top:'+top+'px;font-family:'+SA+';font-size:24px;font-weight:700;color:rgba(255,255,255,0.7);letter-spacing:0.12em;text-transform:uppercase;margin:0;'+SH+'">'+t+'</p>'}
function dtag(t,l,top){return '<p style="position:absolute;left:'+l+'px;top:'+top+'px;font-family:'+SA+';font-size:18px;font-weight:700;color:rgba(0,0,0,0.3);letter-spacing:0.15em;text-transform:uppercase;margin:0;">'+t+'</p>'}
function dh(t,bot,sz){sz=sz||52;return '<div style="position:absolute;bottom:'+bot+'px;left:64px;right:64px;"><p style="font-family:'+SE+';font-size:'+sz+'px;font-weight:700;font-style:italic;color:#1a1a1a;line-height:0.95;margin:0;">'+t+'</p></div>'}

// === LAYOUTS — each visually distinct ===

// A: Full bleed hero + text (1 photo)
function L_hero(nm,s,tg,hl,sl){return {name:nm,html:hero(s,tag(tg,64,60)+h2(hl,440)+sub(sl,370))}}

// B: Single large print centered on dark (1 photo)
function L_single(nm,s,hl,sl){return {name:nm,html:dark(pr(s,100,80,860,1200,-0.5,16)+h2(hl,160)+sub(sl,90))}}

// C: Two prints side by side on dark (2 photos)
function L_duo(nm,a,b,tg,hl){return {name:nm,html:dark(tag(tg,64,40)+pr(a,30,80,460,850,-2,12)+pr(b,530,100,460,850,2,12)+sub(hl,60))}}

// D: Two prints offset/cascade on dark (2 photos)
function L_cascade(nm,a,b,tg,sl){return {name:nm,html:dark(tag(tg,64,40)+pr(a,40,60,500,720,-2.5,14)+pr(b,460,480,500,720,2,14)+sub(sl,60))}}

// E: Three tall prints in a row on dark (3 photos)
function L_trio(nm,a,b,c,tg,sl){return {name:nm,html:dark(tag(tg,64,40)+pr(a,10,80,320,900,-2.5,10)+pr(b,355,60,320,900,1.5,10)+pr(c,700,80,320,900,-1,10)+sub(sl,60))}}

// F: Magazine — photo left + warm text panel + inset (2 photos)
function L_mag(nm,s,tg,hl,body,ins){return {name:nm,html:'<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#f5f0e6;"><div style="position:absolute;inset:0;background:linear-gradient(170deg,#faf6ee 0%,#f0e8d8 50%,#e5d8c4 100%);"></div>'+img(s,40,40,580,860,'object-position:center top;border-radius:8px;')+'<div style="position:absolute;left:64px;top:940px;right:64px;"><p style="font-family:'+SA+';font-size:16px;font-weight:700;color:rgba(0,0,0,0.3);letter-spacing:0.15em;text-transform:uppercase;margin:0 0 16px;">'+tg+'</p><p style="font-family:'+SE+';font-size:60px;font-weight:700;font-style:italic;color:#1a1a1a;line-height:0.95;margin:0;">'+hl+'</p><p style="font-family:'+SA+';font-size:24px;color:rgba(0,0,0,0.4);line-height:1.5;margin:28px 0 0;">'+body+'</p></div><div style="position:absolute;right:40px;bottom:60px;width:240px;height:340px;background:white;padding:10px;transform:rotate(3deg);box-shadow:4px 4px 20px rgba(0,0,0,0.12);"><img src="'+ins+'" style="width:220px;height:320px;object-fit:cover;object-position:center top;display:block;"/></div></div>'}}

// G: Three prints on warm paper (3 photos)
function L_warm3(nm,tg,a,b,c,sl){return {name:nm,html:warm(dtag(tg,64,50)+pr(a,10,80,320,900,-3,10)+pr(b,355,60,320,900,2,10)+pr(c,700,80,320,900,-1.5,10)+dh(sl,60))}}

// H: Full bleed CTA (1 photo)
function L_cta(nm,s){return {name:nm,html:cta(s,h1('Sign up.',520)+'<div style="position:absolute;bottom:380px;left:64px;right:64px;"><p style="font-family:'+SA+';font-size:38px;font-weight:600;color:white;margin:0;'+SH+'">Click the link below to sign up.</p><p style="font-family:'+SA+';font-size:32px;color:rgba(255,255,255,0.7);margin:20px 0 0;'+SH+'">I handle everything. No experience needed.</p></div>')}}

// I: Hook (1 photo)
function L_hook(s){return {name:'01-hook',html:hero(s,tag('Shot on 35mm film',64,60)+h1("I'm looking for<br/>models in Bali.",540)+sub('Sign up if you are interested<br/>in collaborating.',420,42))}}

// === 5 headliners ===
const HK = [nh('DSC_0075.jpg'),nh('000041.jpg'),nh('DSC_0526.jpg'),nh('000016-3.jpg'),nh('000038-4.jpg')]

// === Load all portrait faves ===
const ALL_FILES = fs.readFileSync('/tmp/all-portrait-faves.txt','utf8').trim().split('\n')
console.log('Loading '+ALL_FILES.length+' portrait faves...')
const loaded = {}
for(const f of ALL_FILES){try{loaded[f]=nf(f)}catch(e){}}
const valid = Object.keys(loaded)
console.log('Loaded '+valid.length)

function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]};return a}
const shuffled = shuffle([...valid])
const PER = Math.ceil(shuffled.length/5)
const groups = []
for(let i=0;i<5;i++) groups.push(shuffled.slice(i*PER,(i+1)*PER))

// Each variant: 10 slides, different layout every slide, ~30 photos
// Layout sequence per variant (never same back-to-back):
// 1:hook(1) 2:trio(3) 3:hero(1) 4:duo(2) 5:mag(2) 6:trio(3) 7:single(1) 8:warm3(3) 9:cascade(2) 10:cta(1)
// = 19 photos per variant... need more. Let me use heavier layouts.
// 1:hook(1) 2:trio(3) 3:duo(2) 4:mag(2) 5:trio(3) 6:hero(1) 7:warm3(3) 8:trio(3) 9:cascade(2) 10:cta(1)
// = 21. Still short. Add duo to cascade, trio more.
// 1:hook(1) 2:trio(3) 3:cascade(2) 4:trio(3) 5:mag(2) 6:trio(3) 7:duo(2) 8:warm3(3) 9:hero(1) 10:cta+trio(3+1=4?)
// Actually: 5 variants × 30 = 150. Need 30 per variant.
// 10 slides. To get 30: avg 3 per slide. But hook=1, cta=1, hero=1 = only 3 photos for 3 slides, need 27 from 7 slides = ~3.9 each.
// Use: trio(3)×5 + duo(2)×1 + mag(2)×1 = 15+2+2 = 19 + hook+cta+hero = 22. Not 30.
// Need more slides with 3. Or: make some slides pack 3 AND have text.
// Let's do hook(1) + 8×trio(3) + cta(1) = 26. Close. Or use some quad layouts.
// Better: vary the STYLE of trio — dark trio, warm trio, prints-on-hero trio

// NEW APPROACH: 10 slides, each uses 3 photos but with DIFFERENT visual treatment
// This gives 1 hook + 27 faves + 1 CTA = 29 per variant, 145 total. Close enough.

const SLIDE_LAYOUTS = [
  // name, layout_fn — each takes (nm, p0, p1, p2, tag_text, sub_text)
  'hook',        // 1 photo
  'dark_trio',   // 3 — prints on dark
  'warm_trio',   // 3 — prints on warm paper
  'hero_duo',    // 3 — hero bleed + 2 small prints overlapping bottom
  'mag_trio',    // 3 — magazine with big photo + 2 insets
  'cascade_trio',// 3 — 3 prints cascading diagonally
  'split_trio',  // 3 — 1 big left + 2 stacked right (all portrait)
  'overlap_trio',// 3 — 3 overlapping prints, fan-like
  'dark_duo_text',// 3 — 2 big prints + text panel between (uses 2 photos but 3rd as bg)
  'cta',         // 1 photo
]

// Build slide by type
function buildSlide(type, nm, p, idx, tg, hl, sl) {
  const a = p[idx], b = p[idx+1], c = p[idx+2]
  switch(type) {
    case 'dark_trio': return {name:nm, html:dark(tag(tg,64,40)+pr(a,10,80,320,900,-2.5,10)+pr(b,355,60,320,900,1.5,10)+pr(c,700,80,320,900,-1,10)+sub(sl,60))}
    case 'warm_trio': return {name:nm, html:warm(dtag(tg,64,50)+pr(a,10,80,320,900,-3,10)+pr(b,355,60,320,900,2,10)+pr(c,700,80,320,900,-1.5,10)+dh(sl,60))}
    case 'hero_duo': return {name:nm, html:hero(a,tag(tg,64,60)+pr(b,40,1200,420,600,-3,12)+pr(c,560,1180,420,600,2.5,12)+h2(hl,200)+sub(sl,130))}
    case 'mag_trio': return {name:nm, html:'<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#f5f0e6;"><div style="position:absolute;inset:0;background:linear-gradient(170deg,#faf6ee 0%,#f0e8d8 50%,#e5d8c4 100%);"></div>'+img(a,40,40,600,880,'object-position:center top;border-radius:8px;')+'<div style="position:absolute;left:64px;top:960px;right:64px;"><p style="font-family:'+SA+';font-size:16px;font-weight:700;color:rgba(0,0,0,0.3);letter-spacing:0.15em;text-transform:uppercase;margin:0 0 16px;">'+tg+'</p><p style="font-family:'+SE+';font-size:56px;font-weight:700;font-style:italic;color:#1a1a1a;line-height:0.95;margin:0;">'+hl+'</p></div><div style="position:absolute;right:40px;bottom:180px;width:220px;height:310px;background:white;padding:10px;transform:rotate(3deg);box-shadow:4px 4px 20px rgba(0,0,0,0.12);"><img src="'+b+'" style="width:200px;height:290px;object-fit:cover;object-position:center top;display:block;"/></div><div style="position:absolute;right:280px;bottom:140px;width:200px;height:280px;background:white;padding:10px;transform:rotate(-2deg);box-shadow:4px 4px 20px rgba(0,0,0,0.12);"><img src="'+c+'" style="width:180px;height:260px;object-fit:cover;object-position:center top;display:block;"/></div></div>'}
    case 'cascade_trio': return {name:nm, html:dark(tag(tg,64,40)+pr(a,40,60,460,650,-2.5,14)+pr(b,400,400,460,650,2,14)+pr(c,120,780,460,650,-1.5,14)+sub(sl,60))}
    case 'split_trio': return {name:nm, html:dark(tag(tg,64,40)+pr(a,20,60,540,1200,-1,14)+pr(b,590,60,420,580,1.5,10)+pr(c,590,670,420,580,-1,10)+sub(sl,60))}
    case 'overlap_trio': return {name:nm, html:dark(tag(tg,64,40)+pr(a,60,100,500,720,-4,14)+pr(b,300,300,500,720,2,14)+pr(c,500,500,460,680,-1.5,14)+sub(sl,60))}
    case 'dark_duo_text': return {name:nm, html:'<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">'+img(c,0,0,1080,1920,'filter:brightness(0.15) saturate(0.5);')+'<div style="position:absolute;inset:0;background:rgba(0,0,0,0.7);"></div>'+pr(a,40,100,440,620,-2,14)+pr(b,530,120,440,620,2,14)+'<div style="position:absolute;bottom:340px;left:64px;right:64px;"><p style="font-family:'+SE+';font-size:72px;font-weight:700;font-style:italic;color:white;line-height:0.95;margin:0;'+SH+'">'+hl+'</p></div><div style="position:absolute;bottom:260px;left:64px;right:64px;"><p style="font-family:'+SA+';font-size:34px;font-weight:500;color:rgba(255,255,255,0.85);line-height:1.35;margin:0;'+SH+'">'+sl+'</p></div>'+GR+'</div>'}
  }
}

// Copy banks per variant
const BANKS = [
  {tags:['35mm film','Shot on film','Bali \u00b7 Film','All directed by me','TFP collaboration','@madebyaidan','Model collab','Shot on 35mm'],
   hls:['Want content<br/>like this?','Film portraits<br/>hit different.','Your face.<br/>My film.','No experience<br/>needed.','You get every<br/>edited photo.','Every face<br/>is worth shooting.','Build your<br/>portfolio.','This could<br/>be you.'],
   sls:['Sign up below.','No filter. Just grain and light.','Free collaboration in Bali.','I direct the entire shoot.','Use them however you want.','Sign up if you are interested.','Content for your socials or agency.','Sign up below. I handle everything.']},
  {tags:['Bali \u00b7 35mm','Film portraits','All 35mm','Shot on film','TFP \u00b7 Free','Model collab','@madebyaidan','35mm film'],
   hls:['Golden hour.<br/>Beach. Jungle.','Your portfolio<br/>needs this.','Same camera.<br/>Different energy.','I handle<br/>everything.','Limited spots<br/>this month.','Content that<br/>stands out.','Be part of<br/>something real.','This could<br/>be you.'],
   sls:['Your choice of location.','Shot on 35mm. Directed by me.','Sign up below.','Posing. Lighting. Editing.','Sign up for a free film session.','Film photos for your socials.','Film portraits. Bali. This month.','Sign up if you are interested.']},
  {tags:['TFP collaboration','35mm film','Bali','All directed by me','Shot on film','Film portraits','Model collab','@madebyaidan'],
   hls:['Free 35mm<br/>portraits.','We both build<br/>our books.','Get shot<br/>on film.','No cost.<br/>No catch.','Your face<br/>deserves film.','Sign up.<br/>Show up.','Real film.<br/>Real content.','This could<br/>be you.'],
   sls:['TFP. You get every photo.','Free session. All skill levels welcome.','Free collaboration. Bali.','TFP means we both win.','TFP collaboration in Bali.','I direct everything.','The grain is the point.','Sign up below.']},
  {tags:['Bali','Shot on 35mm','Film','All directed by me','TFP \u00b7 Free','Model collab','35mm film','@madebyaidan'],
   hls:['Models wanted<br/>in Bali.','Film portraits<br/>in Bali.','Beach. Cave.<br/>Golden hour.','No experience<br/>needed.','Every shoot<br/>is different.','I direct<br/>everything.','Warm light.<br/>Real film.','This could<br/>be you.'],
   sls:['TFP. All skill levels.','Sign up below.','Your choice of location.','I direct the entire shoot.','Build your portfolio with real film.','No experience needed.','Free content. Real quality.','Sign up if you are interested.']},
  {tags:['35mm film','Bali \u00b7 Film','Shot on film','Model collab','TFP collaboration','All directed by me','@madebyaidan','Film'],
   hls:['Your face<br/>on film.','Be part of<br/>something real.','Content that<br/>stands out.','Want photos<br/>like this?','Film portraits<br/>hit different.','Sign up.<br/>Get shot.','Free 35mm<br/>portraits.','This could<br/>be you.'],
   sls:['Free collaboration. Sign up below.','Film portraits. Bali. This month.','Film grain. Warm tones. Real.','Sign up below. I direct everything.','No filter. Just grain and light.','I handle everything.','TFP. You get every photo.','Sign up if you are interested.']},
]

// Build layout sequence — never same back to back
const SEQUENCES = [
  ['hook','dark_trio','hero_duo','warm_trio','cascade_trio','mag_trio','split_trio','overlap_trio','dark_duo_text','cta'],
  ['hook','split_trio','dark_duo_text','cascade_trio','dark_trio','hero_duo','overlap_trio','warm_trio','mag_trio','cta'],
  ['hook','overlap_trio','mag_trio','dark_trio','hero_duo','warm_trio','dark_duo_text','cascade_trio','split_trio','cta'],
  ['hook','cascade_trio','warm_trio','split_trio','mag_trio','dark_duo_text','dark_trio','hero_duo','overlap_trio','cta'],
  ['hook','warm_trio','overlap_trio','hero_duo','dark_duo_text','split_trio','cascade_trio','mag_trio','dark_trio','cta'],
]

const variations = groups.map((files,vi) => {
  const raw = files.map(f=>loaded[f])
  const p = Array.from({length:40},(_,i)=>raw[i%raw.length])
  const seq = SEQUENCES[vi]
  const bank = BANKS[vi]
  const slides = []
  let pidx = 0

  for(let si=0;si<seq.length;si++){
    const type = seq[si]
    const nm = si===0?'01-hook':si===9?'10-cta':('0'+(si+1)).slice(-2)
    if(type==='hook'){
      slides.push(L_hook(HK[vi]))
    } else if(type==='cta'){
      slides.push(L_cta(nm,p[pidx])); pidx++
    } else {
      slides.push(buildSlide(type,nm,p,pidx,bank.tags[si-1],bank.hls[si-1],bank.sls[si-1]))
      pidx+=3
    }
  }
  return {slug:'v'+(vi+1), slides}
})

const totalUsed = 5 + groups.reduce((s,g)=>s+Math.min(g.length,25),0)
console.log('Total photos: ~'+totalUsed)

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
