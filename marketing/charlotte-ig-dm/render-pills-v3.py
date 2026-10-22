#!/usr/bin/env python3
"""Pill-overlay story frames (1080x1920) — 'want to collab?' / 'charlotte free photo shoot'.
Usage: python3 render-pills-v3.py <src_dir> <out_dir>
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


# y = top of the pill stack as a fraction of H; align = left|center. Chosen per photo so the stack
# sits in background/clothing, never on the face.
ANCHORS = {
    "p2": (0.15, "left"),    # extreme close-up: only the sticky-note/forehead strip is free
    "p3": (0.62, "left"),    # face at 38-50%: stack over the polka-dot top
    "p4": (0.16, "center"),  # face at 30-55%: grey backdrop above the hair
    "p5": (0.15, "center"),  # face at 30-55%: trees above
    "p6": (0.16, "left"),    # face at 35-58% right: green wall top-left
    "p7": (0.62, "center"),  # full body, face at 20-30%: stack over the dress
    "p8": (0.15, "center"),  # face at 40-70%: bokeh above the curls
}

def stack(base, pills, y, align, gap=12, jitter=(0, 0)):
    for i, p in enumerate(pills):
        dx = jitter[i % len(jitter)]
        if align == "left": paste(base, p, x=70 + dx, y=y)
        else: paste(base, p, cx=W // 2 + dx, y=y)
        y += p.height + gap

def variant_a(base, y, align):
    stack(base, [pill("want to collab?", 120, BLACK, WHITE, rot=3),
                 pill("charlotte free photo shoot", 62, WHITE, BLACK, rot=3)], y, align, gap=-6, jitter=(-20, 40))

def variant_b(base, y, align):
    stack(base, [pill("want to collab?", 78, WHITE, BLACK, rot=2),
                 pill("charlotte", 150, BLACK, WHITE, rot=2),
                 pill("free photo shoot", 78, WHITE, BLACK, rot=2)], y, align, gap=-24, jitter=(0, -10, 30))

def variant_c(base, y, align):
    stack(base, [pill("want to collab?", 104, BLACK, WHITE),
                 pill("charlotte free photo shoot", 60, WHITE, BLACK)], y, align, gap=18)

VARIANTS = {"a": variant_a, "b": variant_b, "c": variant_c}

def main(src, out):
    os.makedirs(out, exist_ok=True)
    for path in sorted(glob.glob(os.path.join(src, "*.jpg"))):
        name = os.path.splitext(os.path.basename(path))[0]
        photo = cover(Image.open(path)).convert("RGBA")
        for k, fn in VARIANTS.items():
            yf, al = ANCHORS.get(name, (0.05, "center")); base = photo.copy(); fn(base, int(H * yf), al)
            dst = os.path.join(out, f"charlotte-pill-{name}-{k}.jpg")
            base.convert("RGB").save(dst, quality=92)
            print(dst)

if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
