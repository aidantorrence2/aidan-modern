import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const out='/Users/aidantorrence/Documents/Antalya-IG-campaign';
const images=path.resolve(root,'../../public/images');
const pic=f=>'data:image/jpeg;base64,'+fs.readFileSync(path.join(images,f)).toString('base64');
const img=(f,x,y,w,h,pos='center')=>`<img src="${pic(f)}" style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;object-fit:cover;object-position:${pos}">`;
const text=(s,x,y,w,size=48)=>`<div data-copy style="position:absolute;left:${x}px;top:${y}px;width:${w}px;font-size:${size}px;line-height:1.12;font-weight:500">${s}</div>`;
const sets={
 notice:[
  {name:'01-casting-notice',html:text('free photo shoot',76,76,940,84)+text('antalya',80,190,900,46)+img('large/aidanto-r4-047-22.jpg',76,302,928,750,'center 38%')+text('looking for models',80,1110,930,60)+text('dm if interested',80,1203,640,42)+text('@madebyaidan',740,1210,290,28)}
 ],
 concept:[
  {name:'01-concept',html:img('large/aidanto-r2-035-16.jpg',390,0,690,1040)+`<div style="position:absolute;inset:0;background:linear-gradient(90deg,#000 0%,#000c 20%,transparent 75%)"></div>`+text('antalya',76,76,800,38)+text('swimwear<br>+ fashion<br>editorial',76,280,940,96)+text('free photo collab',80,1090,900,56)+text('looking for models · dm if interested',80,1190,930,38)},
  {name:'02-direction',html:text('the direction',76,76,900,70)+img('large/aidanto-r4-053-25.jpg',76,240,438,760,'center')+img('large/aidanto-r2-035-16.jpg',552,240,452,760,'center')+text('swimwear. flowing clothes.<br>beach light.',80,1070,900,54)+text('we plan the styling together.',80,1230,900,34)},
  {name:'03-invitation',html:text('interested in<br>this kind of shoot?',76,90,950,78)+img('large/0604804-0043.jpg',570,400,430,650)+text('free photo collab<br>in antalya',80,540,460,52)+text('we choose the location<br>and date together.',80,760,470,38)+text('dm if interested',80,1130,900,62)+text('@madebyaidan',80,1240,900,34)}
 ]
};
const selected=process.argv[2]||'notice';if(!sets[selected])throw Error('Unknown set');
fs.mkdirSync(path.join(out,selected),{recursive:true});
const browser=await chromium.launch();
try{
const page=await browser.newPage({viewport:{width:1080,height:1350},deviceScaleFactor:1});
for(const s of sets[selected]){
 await page.setContent(`<html><head><meta charset="UTF-8"><style>*{box-sizing:border-box}body{margin:0;background:#000;color:#fff;font-family:-apple-system,'Helvetica Neue',sans-serif;-webkit-font-smoothing:antialiased}main{position:relative;width:1080px;height:1350px;overflow:hidden}</style></head><body><main>${s.html}</main></body></html>`);
 await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
 const errors=await page.evaluate(()=>[...document.querySelectorAll('[data-copy]')].filter(p=>{const r=p.getBoundingClientRect();return r.bottom>1320||r.right>1080||p.scrollWidth>p.clientWidth}).map(p=>p.textContent));
 if(errors.length)throw Error(errors.join(';'));
 await page.screenshot({path:path.join(out,selected,s.name+'.jpg'),type:'jpeg',quality:95});
 console.log(selected+'/'+s.name+': rendered and text bounds checked');
}
}finally{await browser.close();}
