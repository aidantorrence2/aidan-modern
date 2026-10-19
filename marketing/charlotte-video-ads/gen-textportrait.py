#!/usr/bin/env python3
"""Text-mosaic portraits for render-v9 (concept G04): a photo redrawn as the word CHARLOTTE, letter size and colour following the
photo. Usage: python3 gen-textportrait.py <stem> [faceH]   (reads work/src2/<stem>.jpg + work/vision2/<stem>.face.json -> work/textportrait/<stem>.png)"""
import json, sys
from PIL import Image, ImageDraw, ImageFont, ImageOps
def font(sz): return ImageFont.truetype('/System/Library/Fonts/HelveticaNeue.ttc', sz, index=1)
def gen(stem, faceH=540, fy=0.40, word='CHARLOTTE', cw=8, ch=11, gamma=1.15, thr=0.07):
    im = Image.open(f'work/src2/{stem}.jpg').convert('RGB'); d = json.load(open(f'work/vision2/{stem}.face.json')); k0 = im.width / d['w']
    g = max(d['faces'], key=lambda x: x['box'][2] * x['box'][3])['box']; f = [v * k0 for v in g]
    s = faceH / f[3]; im2 = im.resize((int(im.width * s), int(im.height * s)), Image.LANCZOS)
    cx = (f[0] + f[2] / 2) * s; cy = (f[1] + f[3] * 0.45) * s
    left = int(max(0, min(im2.width - 1080, cx - 540))); top = int(max(0, min(im2.height - 1920, cy - 1920 * fy)))
    crop = im2.crop((left, top, left + 1080, top + 1920))
    if crop.size != (1080, 1920): crop = crop.resize((1080, 1920))
    crop = ImageOps.autocontrast(crop, cutoff=0.5)
    cols, rows = 1080 // cw, 1920 // ch; small = crop.resize((cols, rows), Image.LANCZOS)
    out = Image.new('RGB', (1080, 1920), (6, 6, 6)); dr = ImageDraw.Draw(out); fc = {}
    for j in range(rows):
        for i in range(cols):
            r, g_, b = small.getpixel((i, j)); L = ((0.299 * r + 0.587 * g_ + 0.114 * b) / 255) ** gamma
            if L < thr: continue
            sz = int(5 + 12 * L); fc.setdefault(sz, font(sz)); boost = lambda v: min(255, int(v * 1.15 + 15))
            dr.text((i * cw + cw / 2, j * ch + ch / 2), word[(i + j * 2) % len(word)], font=fc[sz], fill=(boost(r), boost(g_), boost(b)), anchor='mm')
    out.save(f'work/textportrait/{stem}.png')
if __name__ == '__main__':
    gen(sys.argv[1], float(sys.argv[2]) if len(sys.argv) > 2 else 540)
