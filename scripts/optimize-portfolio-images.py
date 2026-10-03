#!/usr/bin/env python3
"""Pre-generates the WebP copies the homepage serves.

Reads data/portfolio-tiers.json, takes each photo from public/images/tier1 or tier2 and writes
public/images/opt/<width>/<name>.webp for every width in WIDTHS that is smaller than the photo,
plus public/images/opt/full/<name>.webp (capped at FULL px wide). Skips files that are up to date.
Run after adding or replacing photos:  python3 scripts/optimize-portfolio-images.py
"""
import json, os, sys
from PIL import Image, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WIDTHS = [256, 384, 640, 1080]   # keep in sync with WIDTHS in app/designs/shared.tsx
FULL = 1920
QUALITY = {256: 74, 384: 76, 640: 78, 1080: 80, 'full': 80}

def main():
    tiers = json.load(open(os.path.join(ROOT, 'data', 'portfolio-tiers.json')))
    made = skipped = 0; total = 0
    for tier in ('tier1', 'tier2'):
        for name, w, h in tiers[tier]:
            src = os.path.join(ROOT, 'public', 'images', tier, name + '.jpg')
            if not os.path.exists(src): sys.exit(f'missing {src}')
            im = None
            for key in [v for v in WIDTHS if v < w] + ['full']:
                out = os.path.join(ROOT, 'public', 'images', 'opt', str(key), name + '.webp')
                if os.path.exists(out) and os.path.getmtime(out) >= os.path.getmtime(src):
                    skipped += 1; total += os.path.getsize(out); continue
                if im is None:
                    im = ImageOps.exif_transpose(Image.open(src)).convert('RGB')
                    if im.size != (w, h): sys.exit(f'{name}: file is {im.size}, tiers.json says {(w, h)}')
                tw = min(w, FULL) if key == 'full' else key
                os.makedirs(os.path.dirname(out), exist_ok=True)
                im.resize((tw, round(h * tw / w)), Image.LANCZOS).save(out, 'WEBP', quality=QUALITY[key], method=6)
                made += 1; total += os.path.getsize(out)
    print(f'made {made}, up to date {skipped}, opt folder total {total / 1e6:.1f} MB')

if __name__ == '__main__':
    main()
