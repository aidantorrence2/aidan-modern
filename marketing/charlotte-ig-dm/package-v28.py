"""Build lightweight review sheets, an offline gallery, and a JPEG-only bundle."""
import html
import json
import zipfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

BASE = Path(__file__).resolve().parent / 'renders-v28-30-new-creatives'
manifest = json.loads((BASE / 'manifest.json').read_text())
concepts = manifest['concepts']
variants = [v for c in concepts for v in c['variants']]
assert len(variants) == len({v['photo_stem'] for v in variants}) == 30
try:
    font = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf', 21)
    titlefont = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial Bold.ttf', 25)
except OSError:
    font = ImageFont.load_default()
    titlefont = font

for v in variants:
    for folder, extension in [('jpg', '.jpg'), ('png', '.png')]:
        file = BASE / folder / (v['id'] + extension)
        assert file.exists(), file
        with Image.open(file) as im:
            assert im.size == (1080, 1920)
            im.verify()
    audit = json.loads((BASE / 'audits' / (v['id'] + '.json')).read_text())
    assert not audit['errors']
    with Image.open(BASE / 'jpg' / (v['id'] + '.jpg')) as im:
        im.resize((360, 640), Image.Resampling.LANCZOS).save(BASE / 'thumbs' / (v['id'] + '.jpg'), quality=88)

review = BASE / 'review-sheets'
review.mkdir(exist_ok=True)
for start in range(0, len(concepts), 2):
    sheet = Image.new('RGB', (1140, 1500), '#e8e2d6')
    d = ImageDraw.Draw(sheet)
    for ci, c in enumerate(concepts[start:start+2]):
        y = ci * 750
        d.text((20, y+10), c['id'] + '  —  ' + c['title'], font=titlefont, fill='#20221f')
        for vi, v in enumerate(c['variants']):
            x = 20 + vi * 380
            d.text((x, y+54), v['id'], font=font, fill='#333')
            with Image.open(BASE / 'thumbs' / (v['id'] + '.jpg')) as im:
                sheet.paste(im, (x, y+88))
    sheet.save(review / f'concepts-{start+1:02}-{start+2:02}.jpg', quality=95)

# One compact board shows one representative from every new concept.
board = Image.new('RGB', (1400, 1110), '#e8e2d6')
d = ImageDraw.Draw(board)
for i, c in enumerate(concepts):
    x = (i % 5)*280 + 10
    y = (i // 5)*555
    d.text((x, y+10), c['id'], font=font, fill='#20221f')
    with Image.open(BASE / 'jpg' / (c['variants'][0]['id']+'.jpg')) as im:
        board.paste(im.resize((260, 462), Image.Resampling.LANCZOS), (x,y+52))
board.save(BASE / '10-concepts-overview.jpg', quality=95)

cards = []
for c in concepts:
    for v in c['variants']:
        ident = html.escape(v['id'])
        cards.append(f'''<article data-concept="{html.escape(c['id'])}">
        <a href="png/{ident}.png"><img src="thumbs/{ident}.jpg" loading="lazy" width="360" height="640" alt="{html.escape(' '.join(v['headline']))}"></a>
        <div class="details"><b>{ident}</b><p>{html.escape(' '.join(v['headline']))}</p>
        <div class="downloads"><a download href="jpg/{ident}.jpg">JPEG</a><a download href="png/{ident}.png">PNG</a><a href="html/{ident}.html">Editable layout</a></div>
        <details><summary>Why this photo</summary><p>{html.escape(v['rationale'])}</p><small>{html.escape(v['photo_stem'])}.jpg</small></details></div></article>''')
buttons = '<button class="active" data-filter="all">All 30</button>' + ''.join(
    f'<button data-filter="{html.escape(c["id"])}">{html.escape(c["title"])}</button>' for c in concepts)
gallery = f'''<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Charlotte — 30 new portrait invitations</title><style>
*{{box-sizing:border-box}}body{{margin:0;background:#efebe2;color:#242822;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}}main{{max-width:1500px;margin:auto;padding:40px 24px 80px}}h1{{font:500 clamp(32px,4vw,52px)/1.08 Georgia,serif;max-width:850px;margin:10px 0 18px}}.intro{{max-width:850px;line-height:1.6;color:#4d554b}}.navlinks{{display:flex;gap:22px;flex-wrap:wrap;margin:20px 0}}a{{color:#244e43}}.filters{{display:flex;gap:8px;flex-wrap:wrap;padding:22px 0 30px}}button{{border:1px solid #c1c6ba;padding:10px 14px;border-radius:24px;background:transparent;color:#334133;cursor:pointer}}button.active{{background:#294b3d;color:#fff;border-color:#294b3d}}.grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:28px}}article{{background:#fffaf0;border:1px solid #ddd6c8;border-radius:12px;overflow:hidden}}article>a{{display:block;background:#ddd6c8}}article img{{display:block;width:100%;height:auto}}.details{{padding:18px}}.details>b{{font-size:14px}}.details p{{line-height:1.4;margin:9px 0 14px}}.downloads{{display:flex;gap:14px;font-size:13px;flex-wrap:wrap}}details{{margin-top:18px;font-size:13px;color:#56604f}}details p{{line-height:1.5}}summary{{cursor:pointer}}[hidden]{{display:none!important}}
</style></head><body><main><div>CHARLOTTE / ORIGINAL PORTRAIT COLLABS</div><h1>Ten new concepts.<br>Thirty invitations.</h1><p class="intro">Three different copy/photo versions of each concept. Every card uses a different original portfolio photograph and a small bubble of Aidan's original profile photo. The decorative backgrounds are generated art; the photographs are direct source files and the lettering is editable.</p>
<p class="intro">Photo choices are an editorial testing shortlist after reviewing all 106 candidates. They are not measured engagement winners: no per-photo results were found.</p>
<div class="navlinks"><a href="30-creatives-jpg.zip" download>Download all 30 JPEGs</a><a href="10-concepts-overview.jpg">Ten-concept overview</a><a href="photo-selection.json">Photo-selection notes</a><a href="research-and-method.txt">Method and source</a></div>
<div class="filters">{buttons}</div><div class="grid">{''.join(cards)}</div></main><script>
for(const button of document.querySelectorAll('[data-filter]'))button.onclick=()=>{{for(const b of document.querySelectorAll('[data-filter]'))b.classList.toggle('active',b===button);for(const card of document.querySelectorAll('article'))card.hidden=button.dataset.filter!=='all'&&card.dataset.concept!==button.dataset.filter;}};
</script></body></html>'''
(BASE / 'index.html').write_text(gallery)
with zipfile.ZipFile(BASE / '30-creatives-jpg.zip', 'w', compression=zipfile.ZIP_STORED) as z:
    for v in variants:
        p = BASE / 'jpg' / (v['id'] + '.jpg')
        z.write(p, p.name)
    for name in ['10-concepts-overview.jpg', 'photo-selection.json', 'research-and-method.txt']:
        z.write(BASE / name, name)
with zipfile.ZipFile(BASE / '30-creatives-jpg.zip') as z:
    assert z.testzip() is None
print('PASS: 30 distinct original photos; 30 JPEGs; 30 PNGs; 30 successful layout audits; ZIP verified')
print(BASE / 'index.html')
