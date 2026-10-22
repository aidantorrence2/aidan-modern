"""Keep the approved lettering, composite original photographs without retouching.

Only ordinary crop, resize, and perspective placement are applied to photographs.
Run with --canary to check one portfolio insert before rendering all three.
"""
import argparse
import hashlib
import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageOps

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
TEMPLATE = HERE / 'renders-v20-personal-story/01-personal-note-with-work.png'
OUT = HERE / 'renders-v21-original-photos'
INSERTS = [
    {
        'name': 'male-portfolio',
        'source': ROOT / 'public/images/new_top_tier_candidates/R1-09794-021A.jpg',
        'outer': [(35, 628), (451, 599), (483, 1163), (56, 1188)],
        'inner': [(46, 640), (441, 612), (470, 1150), (67, 1176)],
    },
    {
        'name': 'female-portfolio',
        'source': ROOT / 'public/images/new_top_tier_candidates/000014.jpg',
        'outer': [(462, 591), (897, 580), (915, 1158), (477, 1167)],
        'inner': [(474, 604), (885, 592), (902, 1146), (490, 1154)],
    },
    {
        'name': 'photographer-selfie',
        'source': ROOT / 'marketing/charlotte-video-ads/work/src2/aidan-real-selfie.jpg',
        'outer': [(57, 256), (315, 239), (330, 541), (72, 555)],
        'inner': [(57, 256), (315, 239), (330, 541), (72, 555)],
        'crop': (125, 30, 725, 740),
    },
]


def polygon_mask(size, points):
    mask = Image.new('L', size)
    ImageDraw.Draw(mask).polygon(points, fill=255)
    return mask


def place_original(canvas, spec):
    """Map decoded original photo pixels into a print slot; no color processing."""
    with Image.open(spec['source']) as im:
        source = ImageOps.exif_transpose(im).convert('RGB')
    if 'crop' in spec:
        source = source.crop(spec['crop'])
    quad = np.asarray(spec['inner'], dtype=float)
    width = round((np.linalg.norm(quad[1] - quad[0]) + np.linalg.norm(quad[2] - quad[3])) / 2)
    height = round((np.linalg.norm(quad[3] - quad[0]) + np.linalg.norm(quad[2] - quad[1])) / 2)
    source = ImageOps.fit(source, (width, height), method=Image.Resampling.LANCZOS)
    # Inverse perspective mapping from canvas points to the original photo crop.
    corners = [(0, 0), (width - 1, 0), (width - 1, height - 1), (0, height - 1)]
    rows, values = [], []
    for (x, y), (u, v) in zip(quad, corners):
        rows.extend([[x, y, 1, 0, 0, 0, -u*x, -u*y], [0, 0, 0, x, y, 1, -v*x, -v*y]])
        values.extend([u, v])
    coefficients = np.linalg.solve(np.asarray(rows), np.asarray(values))
    photo = source.transform(canvas.size, Image.Transform.PERSPECTIVE, coefficients,
                             resample=Image.Resampling.BICUBIC)
    outer = polygon_mask(canvas.size, spec['outer'])
    inner = polygon_mask(canvas.size, spec['inner'])
    canvas.paste((243, 237, 222), mask=outer)
    canvas.paste(photo, mask=inner)
    # Every output pixel inside this mask comes directly from the ordinary photo render.
    assert ImageChops.difference(canvas, photo).getbbox() is not None
    assert ImageChops.multiply(ImageChops.difference(canvas, photo).convert('L'), inner).getbbox() is None
    return outer


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--canary', action='store_true')
    args = parser.parse_args()
    OUT.mkdir(exist_ok=True)
    canvas = Image.open(TEMPLATE).convert('RGB')
    original = canvas.copy()
    changed = Image.new('L', canvas.size)
    specs = INSERTS[:1] if args.canary else INSERTS
    for spec in specs:
        changed = ImageChops.lighter(changed, place_original(canvas, spec))
    # Lettering and paper outside the photo areas must be exactly preserved.
    diff = ImageChops.difference(canvas, original).convert('L')
    assert ImageChops.multiply(diff, ImageOps.invert(changed)).getbbox() is None
    if args.canary:
        target = OUT / 'canary-one-original-photo.png'
        canvas.save(target)
    else:
        target = OUT / '01-personal-note-original-photos.png'
        canvas.save(target)
        canvas.resize((1080, 1920), Image.Resampling.LANCZOS).save(OUT / '01-personal-note-original-photos-1080x1920.png')
        manifest = {
            'method': 'Pillow compositing only; no image generation or photographic retouching',
            'design_template': str(TEMPLATE),
            'preserved_design': 'Existing blue lettering, paper and illustration from the approved draft',
            'photo_operations': ['crop to fit', 'resize', 'perspective placement'],
            'photos': [{
                **spec,
                'source': str(spec['source']),
                'source_sha256': hashlib.sha256(spec['source'].read_bytes()).hexdigest(),
            } for spec in specs],
            'checks': ['all photo slot pixels equal direct source-photo render',
                       'all pixels outside photo slots unchanged'],
        }
        (OUT / 'sources-and-validation.json').write_text(json.dumps(manifest, indent=2) + '\n')
    print(target)
    print('PASS: direct source photo pixels; lettering/background preserved')


if __name__ == '__main__':
    main()
