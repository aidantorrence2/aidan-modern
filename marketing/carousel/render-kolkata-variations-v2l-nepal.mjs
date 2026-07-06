import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

// === Kolkata carousel v2l-nepal — d-chat, NEPAL FAVES, photos-first ===
// v2l changes vs v2k-nepal:
//   collage header: just 'recent work' big (eyebrow + 'the results' dropped)
//   collage + photo slides: WHITE FRAMES REMOVED (scans carry their own black film borders)
//   full-bleed photo slides get title-only CTAs: 'Want photos like these?' / 'Want in?' /
//     'Sign up below.'
// v2k changes vs v2j-nepal:
//   collage: scrim REMOVED, header moved above the grid — photos fully visible
//   three NEW full-bleed photo slides (05-07: DSC_0238 arch, DSC_0318 market, DSC_0397
//     red canopy) — no gradients or copy, just the image + corner badge
//   deck now 9 slides: hook, prepare chat, makeup chat, results grid, 3 photo slides,
//     where chat, closing
// v2j-nepal: identical deck/copy to v2i, but every photo slot uses the Nepal faves
//   from /Volumes/PortableSSD/Exports/nepal faves (SSD must be mounted to render):
//   hook DSC_0383 (saree temple steps), collage DSC_0242/0020-2/0330/0299/0404/0166,
//   closing DSC_0315.
// v2i: full 6-slide deck restored (v2h wrongly removed slides); collage images 2/5/6 REPLACED
//   with fresh portfolio frames (p7/p8/p9); keeps v2h big 2x3 collage grid.
// v2h changes vs v2g (d-chat):
//   slides 02 (prepare chat), 05 (where chat) and 06 (closing) REMOVED ->
//     3 slides total: 01 hook, 02 makeup chat, 03 results collage
//   collage: six BIG prints in a full-canvas 2x3 grid (was small 3+3 with dead middle band),
//     copy dead-center on a soft scrim
// v2g changes vs v2f (d-chat):
//   slide 04: six portrait prints (3 top + 3 bottom) instead of four, same centered copy
// v2f changes vs v2e (d-chat):
//   slide 04 rebalanced: copy centered between the print rows, bottom row pushed down to
//   mirror the top margin, equalized column gutters (was left-stranded copy + dead bottom band)
// v2e changes vs v2d (d-chat):
//   slide 04: head 'This is how they turn out.' -> 'the results';
//     sub 'All shot on 35mm film, with zero prep from anyone.' removed
// v2d changes vs v2c (d-chat):
//   slide 04: collage rebuilt — four portrait prints, two top + two bottom, copy in the middle
//   slide 05 replies -> 'maybe one of the ghats? like Kumartuli Ghat or Champatala Ghat?'
//     + 'we can shoot during the day, maybe before sunset. it takes around an hour.'
//   slides 06 (We both get the photos) and 07 (How it works) removed
//   closing slide (was 08, now 06) rebuilt like the ORIGINAL kolkata story closing slide:
//     Caveat handwriting 'Want in? / Sign up below.', ivy-wall photo, stacked KOLKATA badge
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
const OUT = path.join(__dirname, 'output-kolkata-variations-v2l-nepal')
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
const HW="'Caveat','Bradley Hand',cursive"
const RD="'Poppins','Arial Rounded MT Bold',sans-serif"

// embed real fonts (base64) so they render reliably in headless chromium — same as render-story-v2
const FDIR = path.join(__dirname, 'fonts')
const fontB64 = f => fs.readFileSync(path.join(FDIR, f)).toString('base64')
const face = (fam,file,weight)=>"@font-face{font-family:'"+fam+"';font-weight:"+weight+";font-style:normal;font-display:block;src:url(data:font/woff2;base64,"+fontB64(file)+") format('woff2');}"
const FONTCSS = face('Poppins','poppins-700.woff2','700')+face('Caveat','caveat-700.woff2','700')
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
// Six BIG portrait tiles — 2 cols x 3 rows, NO SCRIM, NO white frames (the scans carry
// their own black film borders); straight grid, headline above.
// v2l: 488x524 frameless tiles, 40px margins / 24px gutters, rows y240/788/1336.
const tl=(s,l,t,w,h)=>'<div style="position:absolute;left:'+l+'px;top:'+t+'px;width:'+w+'px;height:'+h+'px;box-shadow:0 8px 40px rgba(0,0,0,0.45);"><img src="'+s+'" style="width:100%;height:100%;object-fit:cover;object-position:center top;display:block;"/></div>'
function L_collage6(nm,ims,c){
  const headSz=c.headSz||84
  const eb=c.eyebrow?'<p style="font-family:'+SA+';font-size:25px;font-weight:700;color:#dcbb7d;letter-spacing:0.14em;text-transform:uppercase;margin:0 0 18px;'+SH+'">'+c.eyebrow+'</p>':''
  const copy='<div style="position:absolute;left:74px;right:440px;top:64px;">'+eb
    +'<p style="font-family:'+SE+';font-size:'+headSz+'px;font-weight:700;font-style:italic;color:#fff;line-height:0.97;margin:0;'+SH+'">'+c.head+'</p></div>'
  return {name:nm,html:dark(
    copy
    +tl(ims[0],40,240,488,524)+tl(ims[1],552,240,488,524)
    +tl(ims[2],40,788,488,524)+tl(ims[3],552,788,488,524)
    +tl(ims[4],40,1336,488,524)+tl(ims[5],552,1336,488,524))}
}

// Full-bleed photo showcase — the image IS the slide. No gradients, no white frame;
// optional title-only CTA (no sub) in the lower third + the corner badge from withBadge.
function L_photo(nm,s,t){
  const cta=t?'<div style="position:absolute;bottom:420px;left:64px;right:64px;"><p style="font-family:'+SE+';font-size:92px;font-weight:700;font-style:italic;color:#fff;line-height:0.95;margin:0;'+SH+'">'+t+'</p></div>':''
  return {name:nm,html:'<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">'+img(s,0,0,1080,1920,'filter:saturate(1.06) contrast(1.03);')+cta+GR+'</div>'}
}

// Closing slide — replica of the ORIGINAL kolkata story-v2 closing slide (07-cta).
const SH2='text-shadow:0 2px 8px rgba(0,0,0,0.85),0 12px 50px rgba(0,0,0,0.6);'
function L_close(nm,s){
  const badge='<div style="position:absolute;top:0;right:0;width:620px;height:300px;z-index:55;pointer-events:none;background:radial-gradient(125% 125% at 100% 0%,rgba(0,0,0,0.6) 0%,rgba(0,0,0,0.3) 40%,transparent 70%);"></div>'
    +'<div style="position:absolute;top:52px;right:54px;z-index:60;text-align:right;text-shadow:0 2px 12px rgba(0,0,0,0.95),0 1px 3px rgba(0,0,0,0.9);">'
    +'<div style="font-family:'+SE+';font-size:50px;font-weight:700;letter-spacing:0.15em;color:#fff;line-height:1;">KOLKATA</div>'
    +'<div style="display:flex;align-items:center;justify-content:flex-end;gap:15px;margin-top:13px;">'
    +'<span style="width:70px;height:2px;background:rgba(255,255,255,0.8);display:inline-block;"></span>'
    +'<span style="font-family:'+RD+';font-size:22px;font-weight:600;letter-spacing:0.28em;color:#fff;">FREE PHOTO SHOOT</span>'
    +'</div></div>'
  const scrim='linear-gradient(180deg,transparent 0%,transparent 40%,rgba(0,0,0,0.5) 60%,rgba(0,0,0,0.92) 100%)'
  const overlay='<div style="position:absolute;top:980px;left:64px;right:64px;text-align:center;">'
    +'<p style="font-family:'+HW+';font-size:138px;font-weight:700;color:#fff;margin:0;line-height:0.95;'+SH2+'">Want in?</p>'
    +'<p style="font-family:'+HW+';font-size:138px;font-weight:700;color:#fff;margin:0;line-height:0.95;'+SH2+'">Sign up below.</p>'
    +'<p style="font-family:'+SE+';font-size:34px;color:rgba(255,255,255,0.9);margin:34px 0 0;'+SH2+'">I&rsquo;m only in Kolkata for a short time — let&rsquo;s shoot.</p>'
    +'</div>'
  return {name:nm,noBadge:true,html:'<div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;"><img src="'+s+'" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center top;display:block;filter:saturate(1.06) contrast(1.03);"/><div style="position:absolute;inset:0;background:'+scrim+';"></div>'+overlay+badge+GR+'</div>'}
}

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

// === NEPAL FAVES — proof set from the PortableSSD exports (requires the SSD mounted) ===
const NEPAL='/Volumes/PortableSSD/Exports/nepal faves'
const NP=f=>'data:image/jpeg;base64,'+fs.readFileSync(path.join(NEPAL,f)).toString('base64')
console.log('Loading nepal faves from '+NEPAL)

// d — CHAT: same deck & copy as v2i, all photo slots swapped to the Nepal faves set.
function buildD(){
  return [
    L_hook(NP('DSC_0383.jpg')),
    L_chat('02','&ldquo;So what do<br/>I prepare?&rdquo;',[
      {t:'hey! saw the free shoot — what do I need to prepare? 😅'},
      {me:true,t:'honestly? not much. we just need to figure out the outfit and a location that works.'},
    ]),
    L_chat('03','&ldquo;Makeup?<br/>Posing?&rdquo;',[
      {t:'do I need a makeup artist? I&rsquo;ve never modeled before…'},
      {me:true,t:'nope you don&rsquo;t need to do makeup, light and natural is my preference or even no makeup is fine.'},
      {me:true,t:'posing, angles, light — that&rsquo;s my job, not yours.'},
    ]),
    L_collage6('04',[NP('DSC_0246.jpg'),NP('DSC_0020-2.jpg'),NP('DSC_0330.jpg'),NP('DSC_0299.jpg'),NP('DSC_0404.jpg'),NP('DSC_0166.jpg')],{head:'recent work'}),
    L_photo('05',NP('DSC_0238.jpg'),'Want photos<br/>like these?'),
    L_photo('06',NP('DSC_0318.jpg'),'Want in?'),
    L_photo('07',NP('DSC_0397.jpg'),'Sign up below.'),
    L_chat('08','&ldquo;Okay…<br/>where?&rdquo;',[
      {t:'okay I&rsquo;m in 👀 where would we shoot?'},
      {me:true,t:'maybe one of the ghats? like Kumartuli Ghat or Champatala Ghat?'},
      {me:true,t:'we can shoot during the day, maybe before sunset. it takes around an hour.'},
    ]),
    L_close('09',NP('DSC_0315.jpg')),
  ]
}

const VARIANTS=[
  {slug:'d-chat', build:buildD},
]

async function render(){
  const all=[]
  for(const V of VARIANTS){
    const dir=path.join(OUT,V.slug);fs.mkdirSync(dir,{recursive:true})
    V.build().forEach((s,i)=>{const sl=(i===0||s.noBadge)?s:withBadge(s);all.push({...sl,name:V.slug+'-'+sl.name,dir:V.slug})})
  }
  console.log('Rendering '+all.length+' slides...')
  // CHROME_BIN: override for environments with a system chromium instead of the playwright download.
  const browser=await chromium.launch(process.env.CHROME_BIN?{executablePath:process.env.CHROME_BIN}:{})
  const ctx=await browser.newContext({viewport:{width:1080,height:1920},deviceScaleFactor:1})
  for(let i=0;i<all.length;i++){
    const s=all[i];const page=await ctx.newPage()
    await page.setContent('<!doctype html><html><head><style>'+FONTCSS+'*{box-sizing:border-box}html,body{margin:0;width:1080px;height:1920px;background:#000;overflow:hidden}body{-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}</style></head><body>'+s.html+'</body></html>',{waitUntil:'load'})
    await page.evaluate(()=>document.fonts.ready)
    await page.waitForTimeout(250)
    await page.screenshot({path:path.join(OUT,s.dir,s.name+'.jpg'),type:'jpeg',quality:92})
    await page.close()
    if((i+1)%5===0||i===0)console.log('  ['+(i+1)+'/'+all.length+'] '+s.name)
  }
  await browser.close()
  console.log('\nDone — '+all.length+' slides -> '+OUT)
}
render()
