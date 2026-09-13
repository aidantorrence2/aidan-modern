import {chromium} from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const out='/Users/aidantorrence/Documents/Antalya-IG-campaign/concept';
const pic=(id,x,y,w,h,fit='cover')=>`<img src="data:image/jpeg;base64,${fs.readFileSync(path.join(root,'pinterest',id+'.jpg')).toString('base64')}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;object-fit:${fit}">`;
const txt=(s,x,y,w,size=48)=>`<div data-copy style="left:${x}px;top:${y}px;width:${w}px;font-size:${size}px">${s}</div>`;
const footer='';
const slides=[
 ['01-concept',txt('photo collab',64,58,952,32)+txt('free photo shoot<br>in antalya',64,126,980,78)+pic('15762667444508000',64,350,548,690)+pic('140806235144869',636,350,380,690)+txt('looking for people to shoot with',64,1100,952,50)+txt('dm if interested',64,1180,952,40)+footer],
 ['02-direction',txt('the mood',64,64,952,76)+txt('sea air. simple styling. beach light.',64,169,952,36)+pic('894879388481085674',64,270,470,650)+pic('1058205243703273898',558,270,458,480)+pic('17029304836389441',558,774,458,450)+txt('light layers,<br>your own style.',64,984,470,48)+footer],
 ['03-invitation',txt('into this kind<br>of shoot?',64,65,952,86)+pic('3025924747258283',64,330,530,770)+txt('free photo collab<br>in antalya',642,410,380,43)+txt('we plan the<br>styling, location<br>and date together.',642,620,380,36)+txt('dm if interested',64,1150,952,58)+txt('@madebyaidan',64,1230,952,28)]
];
fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch();
try{const page=await browser.newPage({viewport:{width:1080,height:1350},deviceScaleFactor:1});
for(const [name,html] of slides){await page.setContent(`<html><head><meta charset="utf-8"><style>body{margin:0;background:#f3f0e9;color:#202721;font-family:Helvetica,Arial,sans-serif}*{box-sizing:border-box}main{width:1080px;height:1350px;position:relative}img,main>div{position:absolute}div{line-height:1.12;letter-spacing:-1px}img{display:block}</style></head><body><main>${html}</main></body></html>`);await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()))});const bad=await page.evaluate(()=>[...document.querySelectorAll('[data-copy]')].filter(e=>{const r=e.getBoundingClientRect();return r.bottom>1330||r.right>1050||e.scrollWidth>e.clientWidth}).map(e=>e.textContent));if(bad.length)throw Error(bad.join(';'));await page.screenshot({path:path.join(out,name+'.jpg'),type:'jpeg',quality:95});console.log(name+' rendered; images and text bounds checked');}
}finally{await browser.close()}
