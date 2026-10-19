#!/usr/bin/env python3
"""Writes upright copies of the tier_candidates scans (rotation from TC in concepts.py) for render-v2.mjs.

Usage: python3 prep-photos.py <tier_candidates dir> <out dir>
"""
import os, sys
from PIL import Image, ImageOps

HERE = os.path.dirname(os.path.abspath(__file__))
exec(open(os.path.join(HERE, 'concepts.py')).read())  # defines TC
SRC, OUT = sys.argv[1:3]
os.makedirs(OUT, exist_ok=True)
for key, (stem, rot) in TC.items():
    im = ImageOps.exif_transpose(Image.open(os.path.join(SRC, stem + '.JPG')))
    im.draft('RGB', (2000, 2000))
    im = im.convert('RGB').rotate(rot, expand=True)
    im.thumbnail((1440, 2160), Image.LANCZOS)
    im.save(os.path.join(OUT, key + '.jpg'), quality=90)
print(len(TC), 'photos ->', OUT)
