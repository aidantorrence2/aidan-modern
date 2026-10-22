#!/usr/bin/env python3
"""Pill-overlay story frames (1080x1920) — 'want to collab?' / 'charlotte free photo shoot'.
Usage: python3 render-pills-v1.py <src_dir> <out_dir>
"""
import sys, os, glob
from PIL import Image, ImageDraw, ImageFont

W, H = 1080, 1920
FONT = "/System/Library/Fonts/HelveticaNeue.ttc"
BOLD_IDX = 1  # Helvetica Neue Bold

def font(size):
    for idx in (BOLD_IDX, 0):
        try:
            f = ImageFont.truetype(FONT, size, index=idx)
            if "Bold" in f.getname()[1] or idx == 0: return f
        except Exception: pass
    return ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", size, index=1)

def cover(im):
    im = im.convert("RGB")
    s = max(W / im.width, H / im.height)
    im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    x = (im.width - W) // 2; y = (im.height - H) // 2
    return im.crop((x, y, x + W, y + H))

def pill(text, size, fg, bg, padx=44, pady=18, rot=0):
    f = font(size)
    tmp = Image.new("RGBA", (10, 10)); d = ImageDraw.Draw(tmp)
    l, t, r, b = d.textbbox((0, 0), text, font=f)
    tw, th = r - l, b - t
    pw, ph = tw + 2 * padx, th + 2 * pady
    im = Image.new("RGBA", (pw, ph), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((0, 0, pw - 1, ph - 1), radius=ph // 4, fill=bg)
    d.text((padx - l, pady - t), text, font=f, fill=fg)
    if rot: im = im.rotate(rot, expand=True, resample=Image.BICUBIC)
    return im

WHITE, BLACK = (255, 255, 255, 255), (12, 12, 12, 255)

def paste(base, p, cx=None, cy=None, x=None, y=None):
    if cx is not None: x = cx - p.width // 2
    if cy is not None: y = cy - p.height // 2
    base.alpha_composite(p, (int(x), int(y)))

def variant_a(base):
    # Reference style: big white pill centred, black pill tucked under, offset right, slight tilt
    p1 = pill("want to collab?", 120, BLACK, WHITE, rot=3)
    p2 = pill("charlotte free photo shoot", 62, WHITE, BLACK, rot=3)
    cy = int(H * 0.46)
    paste(base, p1, cx=W // 2 - 20, cy=cy)
    paste(base, p2, cx=W // 2 + 40, cy=cy + p1.height // 2 + 10)

def variant_b(base):
    # Location-big stack, left aligned, upper-mid
    p1 = pill("want to collab?", 78, WHITE, BLACK, rot=2)
    p2 = pill("charlotte", 150, BLACK, WHITE, rot=2)
    p3 = pill("free photo shoot", 78, WHITE, BLACK, rot=2)
    x = 70; y = int(H * 0.30)
    paste(base, p1, x=x, y=y)
    paste(base, p2, x=x - 10, y=y + p1.height - 30)
    paste(base, p3, x=x + 30, y=y + p1.height + p2.height - 60)

def variant_c(base):
    # Lower-third, no tilt, two clean pills, right-leaning
    p1 = pill("want to collab?", 104, BLACK, WHITE)
    p2 = pill("charlotte free photo shoot", 60, WHITE, BLACK)
    y = int(H * 0.60)
    paste(base, p1, cx=W // 2, y=y)
    paste(base, p2, cx=W // 2, y=y + p1.height + 18)

VARIANTS = {"a": variant_a, "b": variant_b, "c": variant_c}

def main(src, out):
    os.makedirs(out, exist_ok=True)
    for path in sorted(glob.glob(os.path.join(src, "*.jpg"))):
        name = os.path.splitext(os.path.basename(path))[0]
        photo = cover(Image.open(path)).convert("RGBA")
        for k, fn in VARIANTS.items():
            base = photo.copy(); fn(base)
            dst = os.path.join(out, f"charlotte-pill-{name}-{k}.jpg")
            base.convert("RGB").save(dst, quality=92)
            print(dst)

if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
