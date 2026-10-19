#!/usr/bin/env python3
"""Subject cut-outs (alpha from the Apple Vision masks) + hair-top row + per-photo accent colour for render-v8/v9.
Usage: python3 gen-cutouts.py   (reads work/src2 + work/vision2 -> work/cut2/<stem>.png, work/cut2/tops.json, ../charlotte-ig-dm/palette-v5.json accent)"""
import os, json, colorsys
from PIL import Image, ImageFilter
os.makedirs('work/cut2', exist_ok=True)
heroes = ['R1-09952-0012','R1-09797-0016','R1-00006-008A','R1-09997-0009','R1-09952-0013','R1-09794-031A','R1-09799-0034','R1-09952-0026','R1-09952-0019','R1-00008-0005','R1-09793-0011','R1-09792-0026','R1-00009-0034','R1-00009-0028','R1-09952-0003','R1-09793-0028','R1-09794-021A','R1-00007-025A','R1-09793-0013','000042','R1-09995-0010','R1-09997-0003','R1-00009-0002','R1-00009-0021']
tops = {}
for s in heroes:
    im = Image.open(f'work/src2/{s}.jpg').convert('RGB'); m = Image.open(f'work/vision2/{s}.mask.png').convert('L').resize(im.size, Image.LANCZOS).filter(ImageFilter.GaussianBlur(1.2))
    im.putalpha(m); im.save(f'work/cut2/{s}.png')
    a = m.resize((im.width // 4, im.height // 4)).point(lambda v: 255 if v > 128 else 0).getbbox(); tops[s] = {'top': (a[1] * 4) if a else 0}
json.dump(tops, open('work/cut2/tops.json', 'w'))
pal = json.load(open('../charlotte-ig-dm/palette-v5.json'))
for s in pal:
    im = Image.open(f'work/src2/{s}.jpg').convert('RGB'); im.thumbnail((80, 80)); best = None
    for r, g, b in im.getdata():
        h, sat, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255); score = sat * min(1, v * 1.4)
        if v > 0.25 and (best is None or score > best[0]): best = (score, h)
    h = best[1] if best and best[0] > 0.25 else 0.07
    r, g, b = colorsys.hsv_to_rgb(h, 0.78, 0.86); pal[s]['accent'] = '#%02x%02x%02x' % (int(r * 255), int(g * 255), int(b * 255))
json.dump(pal, open('../charlotte-ig-dm/palette-v5.json', 'w'), indent=0)
