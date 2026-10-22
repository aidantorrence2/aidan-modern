#!/usr/bin/env python3
"""About-me story card (card 3 of the deck, after the hook) in pill form, on the standing pink-shirt photo.
Copy is Aidan's own (22 Oct). Usage: python3 render-about-v4.py <out_dir>
"""
import sys, os
from PIL import Image, ImageDraw, ImageFont

W, H = 1080, 1920
FONT = "/System/Library/Fonts/HelveticaNeue.ttc"
WHITE, BLACK = (255, 255, 255, 255), (12, 12, 12, 255)
W_, B_ = (BLACK, WHITE), (WHITE, BLACK)
SELFIE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "src-self/aidan-pink-shirt-standing.jpg")

def font(size): return ImageFont.truetype(FONT, size, index=1)

def pill(text, size, fg, bg, padx=40, pady=16, rot=0):
    f = font(size); d = ImageDraw.Draw(Image.new("RGBA", (10, 10)))
    l, t, r, b = d.textbbox((0, 0), text, font=f)
    pw, ph = r - l + 2 * padx, b - t + 2 * pady
    im = Image.new("RGBA", (pw, ph), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rounded_rectangle((0, 0, pw - 1, ph - 1), radius=ph // 4, fill=bg)
    d.text((padx - l, pady - t), text, font=f, fill=fg)
    return im.rotate(rot, expand=True, resample=Image.BICUBIC) if rot else im

def stack(base, pills, y, align, gap=-4):
    y = int(H * y)
    for text, size, fg, bg, rot, dx in pills:
        p = pill(text, size, fg, bg, rot=rot)
        x = 60 + dx if align == "left" else W // 2 - p.width // 2 + dx
        base.alpha_composite(p, (int(x), int(y))); y += p.height + gap

def canvas():
    im = Image.open(SELFIE).convert("RGB")
    sc = max(W / im.width, H / im.height)
    im = im.resize((round(im.width * sc), round(im.height * sc)), Image.LANCZOS)
    x = (im.width - W) // 2; y = (im.height - H) // 2
    return im.crop((x, y, x + W, y + H)).convert("RGBA")

# face sits ~8-26% of H; pills go on the shirt (38-66%)
ADS = [
    ("01-center", 0.38, "center", [
        ("about me", 52, *B_, -2, -300),
        ("hi, i\u2019m aidan", 124, *W_, -2, 0),
        ("for the past 3 years i\u2019ve been", 50, *B_, -2, 20),
        ("traveling and taking portraits.", 50, *B_, -2, -10),
        ("now i\u2019m in charlotte.", 68, *W_, -2, 10)]),
    ("02-left", 0.39, "left", [
        ("about me", 52, *B_, 2, 0),
        ("hi, i\u2019m aidan", 124, *W_, 2, 0),
        ("for the past 3 years i\u2019ve been", 50, *B_, 2, 20),
        ("traveling and taking portraits.", 50, *B_, 2, 0),
        ("now i\u2019m in charlotte.", 68, *W_, 2, 10)]),
    ("03-straight", 0.39, "center", [
        ("about me", 52, *B_, 0, 0),
        ("hi, i\u2019m aidan", 124, *W_, 0, 0),
        ("for the past 3 years i\u2019ve been", 50, *B_, 0, 0),
        ("traveling and taking portraits.", 50, *B_, 0, 0),
        ("now i\u2019m in charlotte.", 68, *W_, 0, 0)]),
]

def main(out):
    os.makedirs(out, exist_ok=True)
    for slug, y, align, pills in ADS:
        base = canvas(); stack(base, pills, y, align)
        dst = os.path.join(out, f"charlotte-about-{slug}.jpg")
        base.convert("RGB").save(dst, quality=92); print(dst)

if __name__ == "__main__":
    main(sys.argv[1])
