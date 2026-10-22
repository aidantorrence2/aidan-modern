#!/usr/bin/env python3
"""v4: seven different ADS (hook/angle/copy), one per photo. Pill treatment is the shared look.
Usage: python3 render-pills-v4.py <src_dir> <out_dir>
"""
import sys, os
from PIL import Image, ImageDraw, ImageFont

W, H = 1080, 1920
FONT = "/System/Library/Fonts/HelveticaNeue.ttc"
WHITE, BLACK = (255, 255, 255, 255), (12, 12, 12, 255)

def font(size):
    return ImageFont.truetype(FONT, size, index=1)  # Helvetica Neue Bold

def cover(im):
    im = im.convert("RGB")
    s = max(W / im.width, H / im.height)
    im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    x = (im.width - W) // 2; y = (im.height - H) // 2
    return im.crop((x, y, x + W, y + H)).convert("RGBA")

def pill(text, size, fg, bg, padx=44, pady=18, rot=0):
    f = font(size)
    d = ImageDraw.Draw(Image.new("RGBA", (10, 10)))
    l, t, r, b = d.textbbox((0, 0), text, font=f)
    pw, ph = r - l + 2 * padx, b - t + 2 * pady
    im = Image.new("RGBA", (pw, ph), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((0, 0, pw - 1, ph - 1), radius=ph // 4, fill=bg)
    d.text((padx - l, pady - t), text, font=f, fill=fg)
    return im.rotate(rot, expand=True, resample=Image.BICUBIC) if rot else im

def stack(base, pills, y, align, gap=-6):
    """pills: list of (text, size, fg, bg, rot, dx). y = top as fraction of H."""
    y = int(H * y)
    for text, size, fg, bg, rot, dx in pills:
        p = pill(text, size, fg, bg, rot=rot)
        x = 70 + dx if align == "left" else W // 2 - p.width // 2 + dx
        base.alpha_composite(p, (int(x), int(y)))
        y += p.height + gap

W_, B_ = (BLACK, WHITE), (WHITE, BLACK)   # (fg, bg): white pill / black pill

# Each entry = one ad. (slug, photo, anchor_y, align, pills)
ADS = [
    # 1. the plain ask (your two lines) — golden-hour guy
    ("01-want-to-collab", "p5", 0.62, "center", [
        ("want to collab?", 120, *W_, 3, -20),
        ("charlotte free photo shoot", 62, *B_, 3, 40)]),
    # 2. casting call — neon sign
    ("02-looking-for-models", "p3", 0.60, "left", [
        ("looking for models", 96, *W_, 2, 0),
        ("in charlotte", 96, *W_, 2, 30),
        ("free photo shoot", 64, *B_, 2, 10)]),
    # 3. location-first + DM CTA — elevator
    ("03-charlotte-dm-collab", "p7", 0.60, "center", [
        ("charlotte", 170, *W_, 0, 0),
        ("free photo shoot", 80, *B_, 0, 0),
        ("dm me “collab”", 64, *W_, 0, 0)]),
    # 4. plain casting line — b&w guy
    ("04-models-wanted", "p8", 0.15, "center", [
        ("models wanted", 110, *W_, -2, 0),
        ("charlotte · free photo shoot", 60, *B_, -2, 20)]),
    # 5. in-town hook — close-up smile
    ("05-shooting-in-charlotte", "p2", 0.15, "left", [
        ("shooting in charlotte", 92, *W_, 2, 0),
        ("free photo shoot", 72, *B_, 2, 20),
        ("want to collab?", 64, *W_, 2, 40)]),
    # 6. the intro — dark portrait
    ("06-hi-im-aidan", "p4", 0.15, "left", [
        ("hi, i’m aidan", 120, *W_, 3, 0),
        ("i shoot in charlotte", 66, *B_, 3, 30),
        ("free photo shoot, want in?", 56, *W_, 3, 10)]),
    # 7. this-could-be-you — green wall
    ("07-this-could-be-you", "p6", 0.15, "left", [
        ("this could be you", 104, *W_, -3, 0),
        ("charlotte free photo shoot", 62, *B_, -3, 30)]),
]

def main(src, out):
    os.makedirs(out, exist_ok=True)
    for slug, photo, y, align, pills in ADS:
        base = cover(Image.open(os.path.join(src, photo + ".jpg")))
        stack(base, pills, y, align)
        dst = os.path.join(out, f"charlotte-ad-{slug}.jpg")
        base.convert("RGB").save(dst, quality=92); print(dst)

if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
