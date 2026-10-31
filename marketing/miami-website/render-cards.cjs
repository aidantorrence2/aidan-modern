// Miami adaptation of the CLT four-card website carousel.
// Uses existing portfolio photographs, with code-rendered type and layout.
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const PHOTO = process.argv[2];
const OUT = process.argv[3];
if (!PHOTO || !OUT) throw new Error('Usage: node render-cards.cjs <photo-directory> <output-directory>');
fs.mkdirSync(OUT, {recursive:true});
const W=1080,H=1920;
const xml=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const svg=inner=>Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${inner}</svg>`);
const t=(s,x,y,size,opts={})=>`<text x="${x}" y="${y}" fill="${opts.fill||'#fff'}" font-family="${opts.sans?'DejaVu Sans':'DejaVu Serif'}" font-size="${size}" font-weight="${opts.bold?'bold':'normal'}" font-style="${opts.italic?'italic':'normal'}" text-anchor="${opts.anchor||'start'}">${xml(s)}</text>`;
const badge=t('MIAMI',1025,105,48,{bold:true,anchor:'end'})+t('FREE PHOTO SHOOT',1025,150,22,{sans:true,anchor:'end'});
const gradient=`<defs><linearGradient id="shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".12"/><stop offset=".42" stop-color="#000" stop-opacity="0"/><stop offset=".66" stop-color="#000" stop-opacity=".65"/><stop offset="1" stop-color="#000" stop-opacity=".9"/></linearGradient></defs><rect width="1080" height="1920" fill="url(#shade)"/>`;
const img=(name,w,h,position='attention')=>sharp(path.join(PHOTO,name+'.jpg')).resize(w,h,{fit:'cover',position}).toBuffer();
async function bleed(name,photo,type){
 const base=await img(photo,W,H,'centre');
 await sharp(base).composite([{input:svg(gradient+type)}]).jpeg({quality:94}).toFile(path.join(OUT,name+'.jpg'));
}
async function print(photo,x,y,w,h){
 const im=await img(photo,w-24,h-26,'attention');
 const buffer=await sharp({create:{width:w,height:h,channels:3,background:'#faf8f3'}}).composite([{input:im,left:12,top:12}]).png().toBuffer();
 return {input:buffer,left:x,top:y};
}
(async()=>{
 await bleed('miami-web-01','R1-00007-025A',
  t('Miami',540,1240,154,{bold:true,italic:true,anchor:'middle'})+
  t('Free Photo Shoot.',540,1335,70,{bold:true,italic:true,anchor:'middle'})+
  t('Want photos like these?',540,1415,30,{italic:true,anchor:'middle'}));
 const c2=[{input:svg(badge+t('my recent work',540,325,68,{italic:true,anchor:'middle'})),left:0,top:0}];
 for (const [p,x,y] of [['R1-00006-015A',42,420],['R1-09997-0011',560,440],['R1-09798-032A',42,1080],['R1-09952-0019',560,1060]])c2.push(await print(p,x,y,478,620));
 await sharp({create:{width:W,height:H,channels:3,background:'#0a0a0a'}}).composite(c2).jpeg({quality:94}).toFile(path.join(OUT,'miami-web-02.jpg'));
 const c3=[{input:svg(badge+t('I direct every frame.',540,325,62,{italic:true,anchor:'middle'})+t('You bring yourself. We plan the look together.',540,403,31,{italic:true,anchor:'middle'})),left:0,top:0},await print('R1-00005-0027',42,540,478,800),await print('R1-09793-0028',560,570,478,800)];
 await sharp({create:{width:W,height:H,channels:3,background:'#0a0a0a'}}).composite(c3).jpeg({quality:94}).toFile(path.join(OUT,'miami-web-03.jpg'));
 await bleed('miami-web-04','R1-00009-0028',badge+
  t('Interested?',540,1120,110,{italic:true,anchor:'middle'})+
  t('Sign up below.',540,1250,98,{italic:true,anchor:'middle'})+
  t('A free creative collaboration in Miami.',540,1345,34,{italic:true,anchor:'middle'}));
 const thumbs=await Promise.all([1,2,3,4].map(n=>sharp(path.join(OUT,`miami-web-0${n}.jpg`)).resize(270,480).toBuffer()));
 await sharp({create:{width:1080,height:480,channels:3,background:'white'}}).composite(thumbs.map((input,i)=>({input,left:i*270,top:0}))).jpeg({quality:90}).toFile(path.join(OUT,'miami-carousel-preview.jpg'));
 console.log('Rendered four Miami carousel cards, 1080 × 1920.');
})().catch(e=>{console.error(e);process.exit(1)});
