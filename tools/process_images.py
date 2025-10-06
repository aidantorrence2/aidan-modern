#!/usr/bin/env python3
"""
Process photos for the site:
 - Reads from a source folder (e.g. ~/Downloads/selected)
 - Auto-orients using EXIF
 - Trims uniform black/white borders with tolerance
 - Converts to sRGB JPEG
 - Exports 1600px (large) and 600px (thumb)
 - Writes public/images/manifest.json with slugs

Requires: Pillow
Optional: pillow-heif (to read HEIC)

Usage:
  python3 tools/process_images.py /path/to/source
"""
from __future__ import annotations
import json, os, re, sys, traceback
from pathlib import Path
from typing import Tuple

try:
    from PIL import Image, ImageOps, ImageChops
except Exception:
    print("Error: Pillow is required. Install with: pip install pillow pillow-heif", file=sys.stderr)
    sys.exit(1)

# Try HEIC support
try:
    from pillow_heif import register_heif_opener  # type: ignore
    register_heif_opener()
except Exception:
    pass

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / 'public' / 'images'
LARGE_DIR = OUT_DIR / 'large'
THUMB_DIR = OUT_DIR / 'thumbs'
MANIFEST = OUT_DIR / 'manifest.json'

def slugify(name: str) -> str:
    name = name.lower()
    name = re.sub(r"[^a-z0-9]+", "-", name).strip('-')
    return name

def ensure_dirs():
    LARGE_DIR.mkdir(parents=True, exist_ok=True)
    THUMB_DIR.mkdir(parents=True, exist_ok=True)
    OUT_DIR.mkdir(parents=True, exist_ok=True)

def close_to(color: Tuple[int,int,int], target: int, tol: int) -> bool:
    return all(abs(c - target) <= tol for c in color)

def guess_border_color(im: Image.Image, tol: int=12) -> int | None:
    # Sample corners and edges; if most close to black or white, choose that
    im_small = im.resize((min(64, im.width), min(64, im.height)))
    px = im_small.convert('RGB').load()
    w, h = im_small.size
    samples = []
    for x in range(w):
        samples.append(px[x,0])
        samples.append(px[x,h-1])
    for y in range(h):
        samples.append(px[0,y])
        samples.append(px[w-1,y])
    black = sum(1 for c in samples if close_to(c, 0, tol))
    white = sum(1 for c in samples if close_to(c, 255, tol))
    if black/(len(samples) or 1) > 0.6:
        return 0
    if white/(len(samples) or 1) > 0.6:
        return 255
    return None

def trim_uniform_border(im: Image.Image, tol: int=12) -> Image.Image:
    # Only trims if a uniform nearly-black or nearly-white border is detected
    color = guess_border_color(im, tol)
    if color is None:
        return im
    bg = Image.new('RGB', im.size, (color, color, color))
    diff = ImageChops.difference(im.convert('RGB'), bg)
    # Add small blur via bounding-box expansion tolerance using ImageChops.add
    bbox = diff.getbbox()
    if not bbox:
        return im
    left, top, right, bottom = bbox
    # Pad a touch to avoid over-cropping into subject
    pad = 2
    left = max(0, left - pad)
    top = max(0, top - pad)
    right = min(im.width, right + pad)
    bottom = min(im.height, bottom + pad)
    cropped = im.crop((left, top, right, bottom))
    return cropped

def exif_transpose(im: Image.Image) -> Image.Image:
    try:
        return ImageOps.exif_transpose(im)
    except Exception:
        return im

def convert_srgb_jpeg(im: Image.Image) -> Image.Image:
    # Force to RGB; Pillow embeds sRGB profile when saving as JPEG by default
    if im.mode not in ('RGB','RGBA'):
        im = im.convert('RGB')
    if im.mode == 'RGBA':
        bg = Image.new('RGB', im.size, (255,255,255))
        bg.paste(im, mask=im.split()[-1])
        im = bg
    return im

def resize_long_edge(im: Image.Image, size: int) -> Image.Image:
    im_copy = im.copy()
    im_copy.thumbnail((size, size*10), Image.LANCZOS)
    return im_copy

def save_jpeg(im: Image.Image, path: Path, quality: int=88):
    im.save(path, format='JPEG', quality=quality, optimize=True, progressive=True)

def process_one(src: Path) -> str | None:
    try:
        stem = slugify(src.stem)
        with Image.open(src) as im0:
            im = exif_transpose(im0)
            im = convert_srgb_jpeg(im)
            im = trim_uniform_border(im, tol=14)
            large = resize_long_edge(im, 1600)
            thumb = resize_long_edge(im, 600)
            save_jpeg(large, LARGE_DIR / f"{stem}.jpg")
            save_jpeg(thumb, THUMB_DIR / f"{stem}.jpg")
        return stem
    except Exception:
        print(f"Failed to process {src}")
        traceback.print_exc()
        return None

def main():
    if len(sys.argv) < 2:
        print("Usage: process_images.py <source_dir>", file=sys.stderr)
        sys.exit(2)
    src_dir = Path(os.path.expanduser(sys.argv[1])).resolve()
    ensure_dirs()
    files = []
    exts = {'.jpg','.jpeg','.png','.tif','.tiff','.heic','.HEIC','.JPG','.JPEG','.PNG','.TIF','.TIFF'}
    if not src_dir.exists():
        print(f"Source not found: {src_dir}", file=sys.stderr)
        sys.exit(1)
    for p in src_dir.iterdir():
        if p.suffix in exts and p.is_file():
            files.append(p)
    if not files:
        print("No images found.")
        sys.exit(1)
    slugs = []
    for f in files:
        slug = process_one(f)
        if slug: slugs.append(slug)
    slugs = sorted(set(slugs))
    MANIFEST.write_text(json.dumps(slugs))
    print(f"Done. {len(slugs)} images processed. Manifest: {MANIFEST}")

if __name__ == '__main__':
    main()
