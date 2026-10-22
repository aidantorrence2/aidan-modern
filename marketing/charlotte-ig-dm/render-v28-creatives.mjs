// New graphic plates + direct original JPEGs + live text. One browser, one page.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createHash } from 'node:crypto'
import { chromium } from 'playwright'

const here=path.dirname(fileURLToPath(import.meta.url))
const out=path.join(here,'renders-v28-30-new-creatives')
const manifest=JSON.parse(fs.readFileSync(path.join(out,'manifest.json'),'utf8'))
const only=process.argv.find(a=>a.startsWith('--only='))?.slice(7).split(',')
const assets=path.join(out,'assets'),htmlDir=path.join(out,'html')
for(const dir of ['jpg','png','thumbs','html','assets/photos','assets/fonts','audits'])fs.mkdirSync(path.join(out,dir),{recursive:true})
for(const f of ['caveat-700.woff2','fraunces-600.woff2','fraunces-500i.woff2','poppins-700.woff2']){
  fs.copyFileSync(path.join(here,'../carousel/fonts',f),path.join(assets,'fonts',f))
}

const configs=[
  {x:130,top:655,w:820,bottom:1490,frame:18,kind:'gallery',size:145,align:'left'},
  {x:140,top:640,w:800,bottom:1480,frame:2,kind:'archive',size:164,align:'center'},
  {x:145,top:675,w:790,bottom:1485,frame:14,kind:'playful',size:132,align:'center'},
  {x:90,top:670,w:900,bottom:1485,frame:0,kind:'editorial',size:162,align:'left'},
  {x:130,top:655,w:820,bottom:1480,frame:10,kind:'sketch',size:162,align:'left'},
  {x:120,top:655,w:840,bottom:1490,frame:18,kind:'dispatch',size:136,align:'left'},
  {x:160,top:640,w:760,bottom:1480,frame:8,kind:'arch',size:156,align:'center'},
  {x:150,top:675,w:780,bottom:1480,frame:16,kind:'conversation',size:130,align:'center'},
  {x:90,top:640,w:900,bottom:1490,frame:0,kind:'zine',size:176,align:'left'},
  {x:150,top:670,w:780,bottom:1480,frame:16,kind:'keepsake',size:148,align:'left'},
]
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;')
const sha=file=>createHash('sha256').update(fs.readFileSync(file)).digest('hex')
const sourceAudit=[]

function placement(v,box,variant){
  const f=v.face
  if(!f)throw Error('Missing face box: '+v.photo_stem)
  const fw=f[2]*v.width,fh=f[3]*v.height
  const target=[400,435,375][variant]
  const k=Math.max(box.w/v.width,box.h/v.height,target/fh)
  const cx=(f[0]+f[2]/2)*v.width,cy=(f[1]+f[3]/2)*v.height
  const fx=0.5,fy=box.kind==='arch'?0.49:[0.43,0.45,0.41][variant]
  const minX=Math.max(box.w-v.width*k,12-f[0]*v.width*k)
  const maxX=Math.min(0,box.w-12-(f[0]*v.width+fw)*k)
  const minY=Math.max(box.h-v.height*k,12-f[1]*v.height*k)
  const maxY=Math.min(0,box.h-12-(f[1]*v.height+fh)*k)
  if(minX>maxX||minY>maxY)throw Error('Photo aspect cannot preserve full face: '+v.photo_stem)
  const x=Math.min(maxX,Math.max(minX,box.w*fx-cx*k))
  const y=Math.min(maxY,Math.max(minY,box.h*fy-cy*k))
  const face={left:x+f[0]*v.width*k,top:y+f[1]*v.height*k,w:fw*k,h:fh*k}
  if(face.left<8||face.top<8||face.left+face.w>box.w-8||face.top+face.h>box.h-8)throw Error('Face clipped: '+v.photo_stem)
  return {x,y,width:v.width*k,height:v.height*k,face}
}

function htmlFor(c,v,cfg,variant){
  const headline=v.headline.map(line=>`<span class="headline-line">${esc(c.font==='Condensed'?line.toUpperCase():line)}</span>`).join('')
  const profile='profile-bubble.png'
  const variantTag=['A','B','C'][variant]
  const initialTop=cfg.top
  const border=cfg.frame
  const headLeft=c.id==='04-more-you'?200:c.id==='09-yourself'?218:c.id==='10-small-plan'?150:c.id==='05-next-idea'?145:98
  const headWidth=1080-headLeft-(c.id==='04-more-you'?160:98)
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(v.id)}</title><style>
  @font-face{font-family:Hand;src:url('../assets/fonts/caveat-700.woff2') format('woff2');font-weight:700;font-display:block}
  @font-face{font-family:Fraunces;src:url('../assets/fonts/fraunces-500i.woff2') format('woff2');font-weight:500;font-style:italic;font-display:block}
  @font-face{font-family:Grotesk;src:url('../assets/fonts/poppins-700.woff2') format('woff2');font-weight:700;font-display:block}
  *{box-sizing:border-box}html,body{margin:0;width:1080px;height:1920px;overflow:visible}
  body{position:relative;background:${c.bg};color:${c.ink};-webkit-font-smoothing:antialiased}
  .background{position:absolute;inset:0;width:1080px;height:1920px;object-fit:fill}
  .geo{position:absolute;left:98px;top:108px;width:884px;font:700 34px/1.4 Grotesk,sans-serif;letter-spacing:.13em;padding:8px 0;overflow:visible;text-align:${cfg.align};}
  .geo span{display:inline-block;padding:4px 12px;background:${c.bg};border-radius:3px}
  .headline{position:absolute;left:${headLeft}px;top:204px;width:${headWidth}px;padding:14px 10px 18px 0;overflow:visible;font-family:${c.font==='Condensed'?"Impact, 'Arial Narrow', sans-serif":c.font};font-weight:${c.font==='Fraunces'?500:700};font-style:${c.font==='Fraunces'?'italic':'normal'};font-size:${cfg.size}px;text-align:${cfg.align};line-height:1.12;}
  .headline-line{display:block;white-space:nowrap;overflow:visible;padding:0 4px 4px;}
  .offer{position:absolute;left:${headLeft}px;top:550px;width:${headWidth}px;padding:10px 0 12px;overflow:visible;font:700 45px/1.3 Hand,cursive;text-align:${cfg.align};white-space:nowrap}
  body[data-concept="08-group-chat"] .headline{background:#fbf2e6;border-radius:18px;box-shadow:0 5px 0 #3e24621c}
  .photo-frame{position:absolute;left:${cfg.x}px;top:${initialTop}px;width:${cfg.w}px;height:${cfg.bottom-initialTop}px;padding:${border}px;background:${cfg.kind==='archive'?'#cbd8e7':cfg.kind==='sketch'?'#c93226':'#f7f1e5'};box-shadow:${['gallery','dispatch','keepsake','playful'].includes(cfg.kind)?'0 10px 28px #0003':'none'};}
  .photo-window{position:relative;width:100%;height:100%;overflow:hidden;isolation:isolate;background:#222;}
  .portrait{position:absolute;display:block;max-width:none;filter:none;opacity:1;transform:none;}
  .photo-frame.archive{border-radius:260px 260px 5px 5px}.archive .photo-window{border-radius:258px 258px 3px 3px}
  .photo-frame.arch{border-radius:390px 390px 8px 8px}.arch .photo-window{border-radius:382px 382px 2px 2px}
  .photo-frame.conversation{border-radius:34px}.conversation .photo-window{border-radius:20px}
  .photo-frame.gallery:after{content:'';position:absolute;inset:-10px;border:2px solid ${c.ink};pointer-events:none}
  .photo-frame.sketch:after{content:'';position:absolute;inset:-11px;border:2px dashed ${c.accent};pointer-events:none}
  .profile-row{position:absolute;left:98px;top:1555px;width:884px;height:130px;display:flex;align-items:flex-start;gap:24px;isolation:isolate}
  .profile-row:before{content:'';position:absolute;inset:-14px -14px -10px -14px;background:${c.bg};opacity:.97;border:1px solid ${c.ink}30;border-radius:8px;z-index:-1}
  .profile-bubble{flex:0 0 112px;width:112px;height:112px;border-radius:50%;border:5px solid #faf4e7;box-shadow:0 3px 10px #0002;overflow:hidden;background:#fff}
  .profile-bubble img{width:100%;height:100%;object-fit:cover;display:block;filter:none}
  .profile-copy{flex:1;min-width:0;padding:0 2px 8px;overflow:visible}
  .signature{font:700 58px/1.2 Hand,cursive;padding:4px 0 10px;white-space:nowrap;overflow:visible}
  .cta{font:700 32px/1.4 Grotesk,sans-serif;padding:2px 0 8px;white-space:nowrap;overflow:visible}
  </style></head><body data-id="${v.id}" data-concept="${c.id}" data-variant="${variantTag}">
  <img class="background" src="../${c.background_path}" alt="Graphic paper and ink background; no generated people">
  <div class="geo" data-text><span>CHARLOTTE</span></div>
  <div class="headline" data-text>${headline}</div>
  <div class="offer" data-text>free collab photo shoots</div>
  <div class="photo-frame ${cfg.kind}"><div class="photo-window"><img class="portrait" src="../assets/photos/${esc(v.photo_stem)}.jpg" alt="Original portrait photograph" data-original="${esc(v.photo_stem)}"></div></div>
  <div class="profile-row"><div class="profile-bubble"><img src="../assets/${profile}" alt="Aidan's original profile photograph"></div><div class="profile-copy"><div class="signature" data-text>hi, i'm aidan</div><div class="cta" data-text>DM me. Let's make a portrait.</div></div></div>
  </body></html>`
}

const browser=await chromium.launch()
try{
  const page=await browser.newPage({viewport:{width:1080,height:1920},deviceScaleFactor:1})
  for(let ci=0;ci<manifest.concepts.length;ci++){
    const c=manifest.concepts[ci],cfg=configs[ci]
    for(let vi=0;vi<c.variants.length;vi++){
      const v=c.variants[vi]
      if(only&&!only.includes(v.id))continue
      const target=path.join(assets,'photos',v.photo_stem+'.jpg')
      if(!fs.existsSync(target))fs.copyFileSync(v.photo_path,target)
      if(sha(target)!==v.source_sha256)throw Error('Original source mismatch: '+v.photo_stem)
      const htmlFile=path.join(htmlDir,v.id+'.html')
      fs.writeFileSync(htmlFile,htmlFor(c,v,cfg,vi))
      await page.goto(pathToFileURL(htmlFile).href,{waitUntil:'load'})
      await page.evaluate(()=>document.fonts.ready)
      await page.evaluate(()=>Promise.all([...document.images].map(im=>im.decode())))
      // Measure actual glyph widths, not character counts or cropped lettering.
      const header=await page.evaluate(()=>{
        const ctx=document.createElement('canvas').getContext('2d')
        const head=document.querySelector('.headline'),cs=getComputedStyle(head)
        let size=parseFloat(cs.fontSize)
        const fontAt=s=>`${cs.fontStyle} ${cs.fontWeight} ${s}px ${cs.fontFamily}`
        for(let i=0;i<4;i++){
          ctx.font=fontAt(size)
          const max=Math.max(...[...head.children].map(line=>{
            const m=ctx.measureText(line.textContent)
            return Math.max(m.width,m.actualBoundingBoxRight)+Math.max(0,m.actualBoundingBoxLeft)
          }))
          if(max>head.clientWidth-38)size*=((head.clientWidth-38)/max)
          head.style.fontSize=size+'px'
          if(head.getBoundingClientRect().height>330)size*=330/head.getBoundingClientRect().height
        }
        head.style.fontSize=size+'px'
        const offer=document.querySelector('.offer')
        offer.style.top=(head.getBoundingClientRect().bottom+15)+'px'
        return {offerBottom:offer.getBoundingClientRect().bottom,size}
      })
      const frameTop=Math.max(cfg.top,Math.ceil(header.offerBottom+35))
      const outerH=cfg.bottom-frameTop,box={w:cfg.w-2*cfg.frame,h:outerH-2*cfg.frame,kind:cfg.kind}
      if(box.h<680)throw Error('Photo window too short: '+v.id)
      const pos=placement(v,box,vi)
      await page.evaluate(({cfg,frameTop,outerH,pos})=>{
        const f=document.querySelector('.photo-frame'),im=document.querySelector('.portrait')
        f.style.top=frameTop+'px';f.style.height=outerH+'px'
        Object.assign(im.style,{left:pos.x+'px',top:pos.y+'px',width:pos.width+'px',height:pos.height+'px'})
      },{cfg,frameTop,outerH,pos})
      const audit=await page.evaluate(({face,cfg,frameTop})=>{
        const ctx=document.createElement('canvas').getContext('2d'),errors=[],type=[]
        const rect=e=>{const r=e.getBoundingClientRect();return {left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height}}
        const texts=[...document.querySelectorAll('[data-text]')]
        for(const block of texts){
          const lines=block.classList.contains('headline')?[...block.children]:[block]
          for(const line of lines){
            const cs=getComputedStyle(line),r=rect(line)
            ctx.font=`${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`
            const m=ctx.measureText(line.textContent)
            const x=r.left+parseFloat(cs.paddingLeft)
            const left=x-Math.max(0,m.actualBoundingBoxLeft),right=x+Math.max(m.width,m.actualBoundingBoxRight)
            // Centered lines get a text-aligned ink origin rather than the left edge.
            const centered=cs.textAlign==='center'
            const inkLeft=centered?r.left+(r.width-m.width)/2-Math.max(0,m.actualBoundingBoxLeft):left
            const inkRight=centered?r.left+(r.width-m.width)/2+Math.max(m.width,m.actualBoundingBoxRight):right
            if(inkLeft<55||inkRight>1025||r.top<65||r.bottom>1730)errors.push('Unsafe/clipped type: '+line.textContent)
            if(m.width>r.width-8)errors.push('Text exceeds available width: '+line.textContent)
            if(line.classList.contains('headline-line')&&parseFloat(cs.fontSize)<72)errors.push('Headline too small')
            type.push({text:line.textContent,fontSize:cs.fontSize,inkLeft,inkRight,...r})
          }
        }
        const photo=rect(document.querySelector('.photo-window'))
        const f={left:photo.left+face.left,top:photo.top+face.top,right:photo.left+face.left+face.w,bottom:photo.top+face.top+face.h}
        for(const block of texts){
          const r=rect(block)
          if(Math.min(r.right,f.right)>Math.max(r.left,f.left)&&Math.min(r.bottom,f.bottom)>Math.max(r.top,f.top))errors.push('Text covers face: '+block.textContent)
        }
        // Essential text blocks must not overlap each other or the portrait window.
        for(let i=0;i<texts.length;i++)for(let j=i+1;j<texts.length;j++){
          const a=rect(texts[i]),b=rect(texts[j])
          if(Math.min(a.right,b.right)>Math.max(a.left,b.left)&&Math.min(a.bottom,b.bottom)>Math.max(a.top,b.top))errors.push('Overlapping type blocks')
        }
        for(const block of texts){
          const a=rect(block)
          if(Math.min(a.right,photo.right)>Math.max(a.left,photo.left)&&Math.min(a.bottom,photo.bottom)>Math.max(a.top,photo.top))errors.push('Type overlaps photo window')
        }
        if(cfg.kind==='arch'||cfg.kind==='archive'){
          const radius=cfg.kind==='arch'?Math.min(382,photo.width/2):Math.min(258,photo.width/2)
          // Check the upper face corners against the rounded photographic opening.
          for(const px of [face.left,face.left+face.w]){
            if(face.top<radius){
              const cx=px<radius?radius:px>photo.width-radius?photo.width-radius:px
              if((px-cx)**2+(face.top-radius)**2>radius**2)errors.push('Face clipped by rounded frame')
            }
          }
        }
        const profile=rect(document.querySelector('.profile-bubble'))
        if(profile.width!==112||profile.height!==112)errors.push('Profile bubble missing/incorrect size')
        if([...document.images].some(im=>!im.complete||!im.naturalWidth))errors.push('Unloaded image')
        return {errors,type,photo,face:f,profile,headerSize:getComputedStyle(document.querySelector('.headline')).fontSize,html:document.documentElement.outerHTML}
      },{face:pos.face,cfg,frameTop})
      if(audit.errors.length)throw Error(v.id+': '+audit.errors.join('; '))
      fs.writeFileSync(htmlFile,'<!doctype html>'+audit.html)
      await page.screenshot({path:path.join(out,'png',v.id+'.png'),type:'png'})
      await page.screenshot({path:path.join(out,'jpg',v.id+'.jpg'),type:'jpeg',quality:95})
      const record={id:v.id,concept:c.title,photo:v.photo_stem,source_sha256:v.source_sha256,checks:['complete original JPEG copied byte-for-byte','face fully within photo crop','no type/face overlap','glyph width and canvas margins checked','no overlapping type blocks','112px original profile-photo bubble present'],...audit}
      delete record.html
      fs.writeFileSync(path.join(out,'audits',v.id+'.json'),JSON.stringify(record,null,2)+'\n')
      sourceAudit.push(record)
      console.log('PASS '+v.id+' / '+v.photo_stem)
    }
  }
}finally{await browser.close()}
console.log(`Rendered ${sourceAudit.length} card(s), sequentially. ${out}`)
