#!/usr/bin/env python3
"""About-me story slide variations. Pink-shirt selfie survives only as a 600x720 crop
(renders-v27-editable/selfie-close.png), so it sits full-width on black with pills in the black
band, like the original 'hi, i'm aidan' frame. One alternate uses the Udaipur mirror selfie.
Usage: python3 render-about-v1.py <out_dir>
"""
import sys, os
from PIL import Image, ImageDraw, ImageFont

W, H = 1080, 1920
FONT = "/System/Library/Fonts/HelveticaNeue.ttc"
WHITE, BLACK = (255, 255, 255, 255), (12, 12, 12, 255)
W_, B_ = (BLACK, WHITE), (WHITE, BLACK)
ROOT = os.path.expanduser("~/Documents/aidan-modern")
PINK = os.path.join(ROOT, "marketing/charlotte-ig-dm/renders-v27-editable/selfie-close.png")
UDAIPUR = os.path.join(ROOT, "public/images/self/aidan-udaipur-mirror-01.jpg")

def font(size): return ImageFont.truetype(FONT, size, index=1)

def pill(text, size, fg, bg, padx=44, pady=18, rot=0):
    f = font(size); d = ImageDraw.Draw(Image.new("RGBA", (10, 10)))
    l, t, r, b = d.textbbox((0, 0), text, font=f)
    pw, ph = r - l + 2 * padx, b - t + 2 * pady
    im = Image.new("RGBA", (pw, ph), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rounded_rectangle((0, 0, pw - 1, ph - 1), radius=ph // 4, fill=bg)
    d.text((padx - l, pady - t), text, font=f, fill=fg)
    return im.rotate(rot, expand=True, resample=Image.BICUBIC) if rot else im

def stack(base, pills, y, align, gap=-6):
    y = int(H * y)
    for text, size, fg, bg, rot, dx in pills:
        p = pill(text, size, fg, bg, rot=rot)
        x = 70 + dx if align == "left" else W // 2 - p.width // 2 + dx
        base.alpha_composite(p, (int(x), int(y))); y += p.height + gap

def fit_width_on_black(path, top):
    im = Image.open(path).convert("RGB")
    im = im.resize((W, round(im.height * W / im.width)), Image.LANCZOS)
    base = Image.new("RGBA", (W, H), (0, 0, 0, 255))
    base.paste(im, (0, top)); return base

# pink selfie is 1080x1296 when fit to width -> sits at y=624..1920, pills live in the black band above
PINK_TOP = H - 1296
ADS = [
    ("01-hi-im-aidan", PINK, PINK_TOP, 0.14, "center", [
        ("hi, i’m aidan", 150, *W_, 3, -20),
        ("free photo shoot in charlotte", 60, *B_, 3, 40)]),
    ("02-photographer", PINK, PINK_TOP, 0.13, "left", [
        ("hi, i’m aidan", 120, *W_, 2, 0),
        ("photographer", 76, *B_, 2, 30),
        ("free photo shoot in charlotte", 56, *W_, 2, 10)]),
    ("03-want-to-collab", PINK, PINK_TOP, 0.14, "center", [
        ("i’m aidan", 140, *W_, -2, 0),
        ("shooting in charlotte", 66, *B_, -2, 30),
        ("want to collab?", 66, *W_, -2, -10)]),
    # udaipur mirror: 1080x1362 fit to width, centred; face/camera at top, pills on the tiled floor
    ("04-udaipur-mirror", UDAIPUR, (H - 1362) // 2, 0.60, "left", [
        ("hi, i’m aidan", 130, *W_, 3, 0),
        ("free photo shoot in charlotte", 58, *B_, 3, 30)]),
]

def main(out):
    os.makedirs(out, exist_ok=True)
    for slug, photo, top, y, align, pills in ADS:
        base = fit_width_on_black(photo, top); stack(base, pills, y, align)
        dst = os.path.join(out, f"charlotte-about-{slug}.jpg")
        base.convert("RGB").save(dst, quality=92); print(dst)

if __name__ == "__main__":
    main(sys.argv[1])
