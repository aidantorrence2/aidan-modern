// Keep the approved handwritten introduction. Recompose using original photos only.
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '../..')
const collabs = process.argv.includes('--collabs')
const out = path.join(here, collabs ? 'renders-v26-collabs-note' : 'renders-v25-free-note-corrected')
fs.mkdirSync(out, { recursive: true })
const python = `
import importlib.util
from pathlib import Path
from PIL import Image, ImageDraw
import numpy as np
here = Path(${JSON.stringify(here)})
spec = importlib.util.spec_from_file_location('compose', here/'compose-original-photos.py')
compose = importlib.util.module_from_spec(spec)
spec.loader.exec_module(compose)
source = Image.open(here/'renders-v21-original-photos/01-personal-note-original-photos.png').convert('RGB')
paper = source.crop((0,1644,941,1672))
canvas = Image.new('RGB', source.size)
for y in range(0,1672,paper.height):
    canvas.paste(paper,(0,y))
clean_paper = canvas.copy()
canvas.paste(source.crop((0,0,941,555)),(0,0))
if ${collabs ? 'True' : 'False'}:
    # Remove only the previous paragraph; keep the original header and selfie.
    canvas.paste(clean_paper.crop((335,380,941,555)),(335,380))
    canvas.paste(clean_paper.crop((650,365,941,380)),(650,365))
# Keep the entire handwritten label and underline. The lower boundary follows
# the clear paper above the old photo, rather than slicing off the ink at y=618.
label = source.crop((30,555,325,633))
label_mask = Image.new('L',label.size)
ImageDraw.Draw(label_mask).polygon([(0,0),(295,0),(295,57),(0,78)],fill=255)
pixels = np.asarray(label).astype(int)
ink = (pixels[:,:,2] > pixels[:,:,0]+25) & (pixels[:,:,2] > pixels[:,:,1]+25) & (pixels[:,:,0] < 180)
assert np.all(np.asarray(label_mask)[ink] == 255), 'Handwriting or underline would be clipped'
label_y = ${collabs ? 625 : 570}
canvas.paste(label,(30,label_y),label_mask)
assert np.array_equal(np.asarray(canvas)[label_y:label_y+78,30:325][ink],np.asarray(label)[ink])
specs = [
    {**compose.INSERTS[0], 'outer':[(36,661),(463,637),(483,1607),(53,1633)], 'inner':[(48,673),(452,650),(470,1596),(65,1619)]},
    {**compose.INSERTS[1], 'outer':[(473,643),(901,632),(919,1607),(485,1618)], 'inner':[(485,655),(890,645),(906,1595),(497,1605)]},
]
if ${collabs ? 'True' : 'False'}:
    # Lower the tops of the prints with their label, keeping a clean gap below it.
    for item in specs:
        for key in ['outer','inner']:
            item[key] = [(x,y+55 if i<2 else y) for i,(x,y) in enumerate(item[key])]
for item in specs:
    compose.place_original(canvas,item)
# The original introduction and selfie are copied exactly, not generated again.
assert canvas.crop((0,0,941,365)).tobytes() == source.crop((0,0,941,365)).tobytes()
assert canvas.crop((0,365,650,380)).tobytes() == source.crop((0,365,650,380)).tobytes()
assert canvas.crop((0,380,335,555)).tobytes() == source.crop((0,380,335,555)).tobytes()
canvas.save(Path(${JSON.stringify(out)})/'layout-without-footer.png')
print('PASS: complete original handwriting/underline preserved; original photo sources used')
`
console.log(execFileSync('python3', ['-c', python], { encoding: 'utf8' }).trim())
const enc = file => fs.readFileSync(file).toString('base64')
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Caveat;src:url(data:font/woff2;base64,${enc(path.join(root,'marketing/carousel/fonts/caveat-700.woff2'))}) format('woff2');font-weight:700;font-display:block}
*{box-sizing:border-box}html,body{margin:0;width:941px;height:1672px;overflow:hidden}
.art{position:absolute;inset:0;width:941px;height:1672px}
.free{position:absolute;left:620px;top:584px;width:280px;padding:0 10px 3px;margin:0;transform:rotate(-5deg);background:#f3edde;color:#00115f;text-align:center;font:700 62px/1.1 Caveat,cursive;white-space:nowrap}
.free:after{content:'';position:absolute;left:25px;right:16px;bottom:4px;height:3px;border-radius:50%;background:#00115f;transform:rotate(-1deg)}
.collabs{position:absolute;left:357px;top:389px;width:565px;margin:0;color:#00115f;font:700 65px/1 Caveat,cursive}
.collabs span{display:block}
</style></head><body><img class="art" src="data:image/png;base64,${enc(path.join(out,'layout-without-footer.png'))}" alt="Aidan's handwritten introduction and original portfolio photographs">${collabs ? `<p class="collabs"><span>i'm doing a few free</span> <span>collabs while i'm</span> <span>in town!</span></p>` : `<p class="free">it's free!!</p>`}</body></html>`
fs.writeFileSync(path.join(out,'01-free-note.html'),html)
const browser = await chromium.launch()
try {
  const page = await browser.newPage({viewport:{width:941,height:1672},deviceScaleFactor:1})
  await page.setContent(html,{waitUntil:'load'})
  await page.evaluate(()=>document.fonts.ready)
  await page.evaluate(()=>Promise.all([...document.images].map(im=>im.decode())))
  if (collabs) {
    const copy = await page.locator('.collabs').textContent()
    if (copy !== "i'm doing a few free collabs while i'm in town!") throw Error('Copy mismatch')
  }
  await page.screenshot({path:path.join(out,'01-free-note.png')})
} finally {await browser.close()}
execFileSync('python3',['-c',`
from PIL import Image
from pathlib import Path
p=Path(${JSON.stringify(out)})
im=Image.open(p/'01-free-note.png').convert('RGB')
im.resize((1080,1920),Image.Resampling.LANCZOS).save(p/'01-free-note-1080x1920.png')
print('PASS: 1080x1920 export saved')
`],{stdio:'inherit'})
console.log(path.join(out,'01-free-note-1080x1920.png'))
