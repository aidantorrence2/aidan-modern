// Fully editable layouts: live typography and direct original-photo placement.
// No flattened lettering, masks, perspective warps, or generated photographs.
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '../..')
const out = path.join(here, 'renders-v27-editable')
fs.mkdirSync(out, { recursive: true })
const originals = {
  selfie: path.join(root, 'marketing/charlotte-video-ads/work/src2/aidan-real-selfie.jpg'),
  male: path.join(root, 'public/images/new_top_tier_candidates/R1-09794-021A.jpg'),
  female: path.join(root, 'public/images/new_top_tier_candidates/000014.jpg'),
}
execFileSync('python3', ['-c', `
from PIL import Image
im=Image.open(${JSON.stringify(originals.selfie)})
im.crop((140,25,740,745)).save(${JSON.stringify(path.join(out,'selfie-close.png'))})
`])
const data = file => fs.readFileSync(file).toString('base64')
const photos = Object.fromEntries(Object.entries(originals).map(([key,file]) => [key, 'data:image/jpeg;base64,' + data(file)]))
photos.close = 'data:image/png;base64,' + data(path.join(out,'selfie-close.png'))
const font = data(path.join(root,'marketing/carousel/fonts/caveat-700.woff2'))
const escape = text => text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
const T = (id, lines, x, y, w, size, color, extra='') => `<div class="type" id="${id}" style="left:${x}px;top:${y}px;width:${w}px;font-size:${size}px;color:${color};${extra}">${[].concat(lines).map(line=>`<span class="line">${escape(line)}</span>`).join('')}</div>`
const P = (key, x,y,w,h, extra='') => `<img class="photo" data-key="${key}" src="${photos[key]}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}" alt="${key==='male'?'Original portrait of a man in a brown jacket':key==='female'?'Original portrait of a woman in a black coat':"Aidan's original selfie"}">`
const paper = 'background:radial-gradient(ellipse at 15% 20%,#fbf7ed 0%,#f3eddf 80%);'
const cream = '#f5efe4', blue='#071b63', ink='#24251e'
const print = 'border:8px solid #f5efe4;box-shadow:0 8px 25px #0002;object-fit:contain;background:#f5efe4;'
const workPair = (y, {x=64,w=464,gap=24}={}) => P('male',x,y,w,w*1.495,print)+P('female',x+w+gap,y,w,w*1.495,print)

const concepts = [
  {
    id:'00-handwritten-rebuilt', title:'Handwritten card — clean rebuild', background:paper,
    html:T('city','Charlotte,',74,62,932,192,blue)+
      P('close',74,346,284,350,'border:6px solid #f5efe4;object-position:center top;')+
      T('intro',["i'm aidan.",'i make portraits.'],398,325,608,92,blue)+
      T('offer',["i'm doing a few free","collabs while i'm",'in town!'],398,568,608,68,blue)+
      T('work','my work',74,896,936,80,blue,'--underline:1;')+
      workPair(1048,{x:74,w:450,gap:32}),
  },
  {
    id:'01-hi-aidan', title:"hi, i'm aidan", background:'background:#10110f;',
    html:P('close',0,0,1080,1090,'object-position:center top;')+
      '<div style="position:absolute;left:0;right:0;top:580px;height:510px;background:linear-gradient(transparent,#10110ff5)"></div>'+
      T('hi',"hi, i'm aidan 👋",64,670,952,132,cream)+
      T('offer',["i'm doing a few free collabs","while i'm in charlotte."],64,850,952,58,cream)+
      T('work',"here's my work",64,1032,952,68,cream)+workPair(1148),
  },
  {
    id:'02-hello-charlotte',title:'A little hello from Charlotte',background:paper,
    html:T('hook',['a little hello','from charlotte.'],74,74,932,138,blue)+
      T('intro',["i'm aidan.","i'm in town and",'making portraits.'],74,438,420,76,blue)+
      P('close',540,427,466,559,'object-position:center top;')+
      T('offer',["a few free collabs.","let's make one."],74,782,420,63,blue)+
      T('work','a little of my work ↓',74,1000,932,67,blue)+workPair(1128,{x:74,w:450,gap:32}),
  },
  {
    id:'03-new-faces',title:'Looking for new faces',background:'background:#ce352d;',
    html:T('hook',["i'm looking for",'new faces.'],64,66,952,150,cream)+
      T('offer','free portrait collabs • charlotte',64,470,952,52,cream)+
      P('close',64,565,425,780,'object-position:center top;')+
      P('female',521,565,495,740,'object-fit:contain;background:#f5efe4;')+
      T('intro',["i'm aidan.",'say hi.'],64,1422,425,94,cream)+
      P('male',612,1357,330,493,'object-fit:contain;background:#f5efe4;'),
  },
  {
    id:'04-first-shoot',title:'Never done a photo shoot?',background:'background:#f4dfac;',
    html:T('hook',['never done','a photo shoot?'],74,66,932,142,ink)+
      P('female',74,492,560,836,'object-fit:contain;')+
      P('close',680,492,326,397,'object-position:center top;')+
      P('male',680,939,326,487,'object-fit:contain;')+
      T('intro',"i'm aidan. let's start here.",74,1498,932,78,ink)+
      T('offer','free collabs in charlotte.',74,1640,932,72,ink)+
      T('cta','message me.',74,1770,932,64,ink),
  },
  {
    id:'05-camera-roll',title:'From my camera to your camera roll',background:'background:#124eea;',
    html:T('hook',['from my camera','to your camera roll.'],64,74,952,128,'#fff')+
      P('close',64,483,370,444,'border-radius:16px;object-position:center top;')+
      T('hi',"hi, i'm aidan 👋",484,500,532,80,'#eaff7b')+
      T('offer',["i'm making portraits",'in charlotte.','a few free collabs.'],484,646,532,66,'#fff')+
      T('work','some of my work ↓',64,1026,952,68,'#eaff7b')+workPair(1148),
  },
  {
    id:'06-make-something',title:"Charlotte, let's make something",background:'background:#183c31;',
    html:T('city','charlotte,',64,70,952,172,cream)+
      T('hook',"let's make something.",64,326,952,98,'#edd98c')+
      P('close',64,496,360,432,'object-position:center top;')+
      T('intro',["i'm aidan.","i'm in town with",'my camera.'],480,500,536,75,cream)+
      T('offer','free portrait collabs.',480,816,536,58,'#edd98c')+
      P('male',64,1050,450,673,print)+P('female',564,1090,450,673,print)+
      T('cta','you could be next.',64,1790,952,61,cream),
  },
]

const browser = await chromium.launch()
const results=[]
try {
  const page=await browser.newPage({viewport:{width:1080,height:1920},deviceScaleFactor:1})
  for (const c of concepts) {
    const html=`<!doctype html><html><head><meta charset="utf-8"><style>
    @font-face{font-family:Hand;src:url(data:font/woff2;base64,${font}) format('woff2');font-weight:700;font-display:block}
    *{box-sizing:border-box}html,body{margin:0;width:1080px;height:1920px}body{position:relative;${c.background}-webkit-font-smoothing:antialiased}
    .photo{position:absolute;display:block;object-fit:cover}
    .type{position:absolute;font:700 70px/1.2 Hand,'Bradley Hand',cursive;overflow:visible;padding:8px 0 12px}
    .line{display:block;white-space:nowrap;overflow:visible}
    #work[style*="--underline"] .line{width:max-content;border-bottom:4px solid currentColor;padding:0 10px 8px 0}
    </style></head><body>${c.html}</body></html>`
    await page.setContent(html,{waitUntil:'load'})
    await page.evaluate(()=>document.fonts.ready)
    await page.evaluate(()=>Promise.all([...document.images].map(im=>im.decode())))
    const audit=await page.evaluate(()=>{
      const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d')
      const blocks=[...document.querySelectorAll('.type')]
      // Fit based on actual font glyph widths, including overhangs; retain wide margins.
      for(const block of blocks){
        const cs=getComputedStyle(block)
        let size=parseFloat(cs.fontSize)
        for(let attempt=0;attempt<2;attempt++){
          ctx.font=`700 ${size}px Hand`
          const width=Math.max(...[...block.children].map(line=>{
            const m=ctx.measureText(line.textContent)
            return Math.max(m.width,m.actualBoundingBoxRight)+Math.max(0,m.actualBoundingBoxLeft)
          }))
          const available=block.getBoundingClientRect().width-28
          if(width>available)size*=available/width
        }
        block.style.fontSize=`${size}px`
      }
      const errors=[],lines=[]
      for(const block of blocks){
        const cs=getComputedStyle(block),size=parseFloat(cs.fontSize)
        ctx.font=`700 ${size}px Hand`
        for(const line of block.children){
          const r=line.getBoundingClientRect(),m=ctx.measureText(line.textContent)
          const left=r.left-Math.max(0,m.actualBoundingBoxLeft)
          const right=r.left+Math.max(m.width,m.actualBoundingBoxRight)
          if(left<38||right>1042||r.top<38||r.bottom>1882)errors.push(`Clipped/unsafe text: ${line.textContent}`)
          if(size<42)errors.push(`Text too small: ${line.textContent}`)
          lines.push({id:block.id,text:line.textContent,size,left,right,top:r.top,bottom:r.bottom})
        }
      }
      for(let i=0;i<blocks.length;i++)for(let j=i+1;j<blocks.length;j++){
        const a=blocks[i].getBoundingClientRect(),b=blocks[j].getBoundingClientRect()
        if(Math.min(a.right,b.right)>Math.max(a.left,b.left)&&Math.min(a.bottom,b.bottom)>Math.max(a.top,b.top))errors.push(`Overlapping type: ${blocks[i].id}/${blocks[j].id}`)
      }
      return {errors,lines,images:[...document.images].map(im=>({key:im.dataset.key,src:im.src,naturalWidth:im.naturalWidth})),html:document.documentElement.outerHTML}
    })
    if(audit.errors.length)throw Error(c.id+': '+audit.errors.join('; '))
    for(const im of audit.images)if(im.src!==photos[im.key]||!im.naturalWidth)throw Error('Original photo source mismatch')
    fs.writeFileSync(path.join(out,c.id+'.html'),'<!doctype html>'+audit.html)
    await page.screenshot({path:path.join(out,c.id+'.png'),type:'png'})
    await page.screenshot({path:path.join(out,c.id+'.jpg'),type:'jpeg',quality:96})
    results.push({id:c.id,title:c.title,lines:audit.lines})
    console.log('PASS: '+c.id+' — full glyph margins, no type overlaps, original photo sources')
  }
}finally{await browser.close()}
const sources=Object.fromEntries(Object.entries(originals).map(([key,file])=>[key,{file,sha256:createHash('sha256').update(fs.readFileSync(file)).digest('hex')}]))
fs.writeFileSync(path.join(out,'validation.json'),JSON.stringify({method:'Editable HTML/CSS. Original JPEG bytes directly embedded. One ordinary selfie crop. No image generation.',sources,results},null,2)+'\n')
console.log(out)
