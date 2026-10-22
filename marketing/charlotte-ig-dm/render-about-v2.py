#!/usr/bin/env python3
"""About-me story card (card 3 of the deck, after the hook) in pill form, on the pink-shirt mirror selfie.
Copy = the deck's about card (render-v2.mjs ABOUT), cut into pills. Usage: python3 render-about-v2.py <out_dir>
"""
import sys, os
from PIL import Image, ImageDraw, ImageFont

W, H = 1080, 1920
FONT = "/System/Library/Fonts/HelveticaNeue.ttc"
WHITE, BLACK = (255, 255, 255, 255), (12, 12, 12, 255)
W_, B_ = (BLACK, WHITE), (WHITE, BLACK)
SELFIE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "src-self/aidan-pink-selfie.jpg")

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
    # selfie fit to width, bottom-aligned; black band on top like the original hook frame
    im = Image.open(SELFIE).convert("RGB")
    im = im.resize((W, round(im.height * W / im.width)), Image.LANCZOS)
    base = Image.new("RGBA", (W, H), (0, 0, 0, 255)); base.paste(im, (0, H - im.height)); return base

# face sits ~17-36% of H; pills go on the backpack/chest band (46-75%) where the hook frame had them
ADS = [
    ("01-full", 0.46, "center", [
        ("about me", 52, *B_, -2, -300),
        ("hi, i’m aidan", 118, *W_, -2, 0),
        ("a photographer from the usa", 56, *B_, -2, 30),
        ("3 years traveling the world taking portraits", 44, *W_, -2, -10),
        ("now back in the states, shooting in charlotte", 44, *B_, -2, 20)]),
    ("02-short", 0.48, "left", [
        ("about me", 52, *B_, 2, 0),
        ("hi, i’m aidan", 124, *W_, 2, 0),
        ("photographer, 3 years on the road", 54, *B_, 2, 30),
        ("back in the states · shooting in charlotte", 48, *W_, 2, 10)]),
    ("03-lets-make-something", 0.47, "center", [
        ("about me", 52, *B_, 0, 0),
        ("hi, i’m aidan", 118, *W_, 0, 0),
        ("i take portraits all over the world", 54, *B_, 0, 0),
        ("right now: charlotte", 64, *W_, 0, 0),
        ("let’s make something special", 50, *B_, 0, 0)]),
]

def main(out):
    os.makedirs(out, exist_ok=True)
    for slug, y, align, pills in ADS:
        base = canvas(); stack(base, pills, y, align)
        dst = os.path.join(out, f"charlotte-about-{slug}.jpg")
        base.convert("RGB").save(dst, quality=92); print(dst)

if __name__ == "__main__":
    main(sys.argv[1])
