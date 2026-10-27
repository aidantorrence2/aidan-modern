#!/usr/bin/env python3
"""Newsprint halftone portraits for render-v10 (concept: newspaper). Usage: python3 gen-halftone.py <stem> [w h faceH]
reads work/src2/<stem>.jpg + work/vision2 -> work/halftone/<stem>.png (ink dots on paper)."""
import json, os, sys
from PIL import Image, ImageDraw, ImageOps
def gen(stem, W=960, H=640, faceH=430, cell=8, paper=(233, 228, 214), ink=(26, 24, 20)):
    os.makedirs('work/halftone', exist_ok=True)
    im = Image.open(f'work/src2/{stem}.jpg').convert('L'); d = json.load(open(f'work/vision2/{stem}.face.json')); k0 = im.width / d['w']
    g = max(d['faces'], key=lambda x: x['box'][2] * x['box'][3])['box']; f = [v * k0 for v in g]
    s = faceH / f[3]; im2 = im.resize((int(im.width * s), int(im.height * s)), Image.LANCZOS)
    cx = (f[0] + f[2] / 2) * s; cy = (f[1] + f[3] * 0.5) * s
    left = int(max(0, min(im2.width - W, cx - W / 2))); top = int(max(0, min(im2.height - H, cy - H * 0.48)))
    crop = ImageOps.autocontrast(im2.crop((left, top, left + W, top + H)), cutoff=1)
    cols, rows = W // cell, H // cell; small = crop.resize((cols, rows), Image.LANCZOS)
    out = Image.new('RGB', (W, H), paper); dr = ImageDraw.Draw(out)
    for j in range(rows):
        for i in range(cols):
            L = small.getpixel((i, j)) / 255; r = (1 - L) ** 0.85 * cell * 0.72
            if r > 0.4: dr.ellipse((i * cell + cell / 2 - r, j * cell + cell / 2 - r, i * cell + cell / 2 + r, j * cell + cell / 2 + r), fill=ink)
    out.save(f'work/halftone/{stem}.png')
if __name__ == '__main__':
    a = sys.argv; gen(a[1], int(a[2]) if len(a) > 2 else 960, int(a[3]) if len(a) > 3 else 640, int(a[4]) if len(a) > 4 else 430)
