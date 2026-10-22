#!/usr/bin/env python3
"""About-me card v7: stair layout, three base photos of Aidan, four new work prints, surrounded by prints of his work, pills with his copy.
Usage: python3 render-about-v7.py <out_dir>
"""
import sys, os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H = 1080, 1920
HERE = os.path.dirname(os.path.abspath(__file__))
FONT = "/System/Library/Fonts/HelveticaNeue.ttc"
WHITE, BLACK = (255, 255, 255, 255), (12, 12, 12, 255)
W_, B_ = (BLACK, WHITE), (WHITE, BLACK)
BG = (14, 14, 14, 255)
# (slug, file, focus, print w/h for the corners layout, print w/h for the row layout) - sized to the photo's own aspect
MES = [("mirror", "src-self/aidan-udaipur-mirror-03.jpg", 0.5, (420, 560), (540, 720)),
       ("cow", "src-self/aidan-cow.jpg", 0.0, (380, 590), (470, 740)),
       ("horse", "src-self/aidan-horse.jpg", 1.0, (420, 560), (540, 720))]
ME = None; ME_FOCUS = 0.15; ME_SZ1 = (500, 670); ME_SZ2 = (540, 720)
WORK = {k: os.path.join(HERE, f"src-work/{k}.jpg") for k in ["w15", "w16", "w17", "w18"]}  # orange, b&w, black top, mirror girl

def font(size): return ImageFont.truetype(FONT, size, index=1)

def pill(text, size, fg, bg, padx=40, pady=16, rot=0):
    f = font(size); d = ImageDraw.Draw(Image.new("RGBA", (10, 10)))
    l, t, r, b = d.textbbox((0, 0), text, font=f)
    pw, ph = r - l + 2 * padx, b - t + 2 * pady
    im = Image.new("RGBA", (pw, ph), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rounded_rectangle((0, 0, pw - 1, ph - 1), radius=ph // 4, fill=bg)
    d.text((padx - l, pady - t), text, font=f, fill=fg)
    return im.rotate(rot, expand=True, resample=Image.BICUBIC) if rot else im

def stack(base, pills, y, align="center", gap=-4, x0=60):
    for text, size, fg, bg, rot, dx in pills:
        p = pill(text, size, fg, bg, rot=rot)
        x = x0 + dx if align == "left" else W // 2 - p.width // 2 + dx
        base.alpha_composite(p, (int(x), int(y))); y += p.height + gap
    return y

def cover(path, w, h, focus=0.35):
    im = Image.open(path).convert("RGB")
    sc = max(w / im.width, h / im.height)
    im = im.resize((round(im.width * sc), round(im.height * sc)), Image.LANCZOS)
    x = (im.width - w) // 2; y = int((im.height - h) * focus)
    return im.crop((x, y, x + w, y + h))

def print_(base, path, cx, cy, w, h, rot=0, border=14, focus=0.35):
    """a bordered print with a soft shadow, centred at (cx, cy)"""
    ph = Image.new("RGBA", (w + 2 * border, h + 2 * border), (250, 250, 250, 255))
    ph.paste(cover(path, w, h, focus), (border, border))
    ph = ph.rotate(rot, expand=True, resample=Image.BICUBIC)
    sh = Image.new("RGBA", (ph.width + 80, ph.height + 80), (0, 0, 0, 0))
    a = Image.new("L", ph.size, 0); a.paste(ph.getchannel("A"), (0, 0))
    sh.paste((0, 0, 0, 150), (40, 52), a); sh = sh.filter(ImageFilter.GaussianBlur(22))
    base.alpha_composite(sh, (cx - sh.width // 2, cy - sh.height // 2))
    base.alpha_composite(ph, (cx - ph.width // 2, cy - ph.height // 2))

COPY = [("about me", 50, *B_, 0, 0),
        ("hi, i’m aidan", 112, *W_, 0, 0),
        ("for the past 3 years i’ve been", 46, *B_, 0, 0),
        ("traveling and taking portraits.", 46, *B_, 0, 0),
        ("now i’m in charlotte.", 62, *W_, 0, 0)]

def tilt(copy, rots, dxs): return [(t, s, fg, bg, r, dx) for (t, s, fg, bg, _, _), r, dx in zip(copy, rots, dxs)]

def v01(base):
    # me centred as a print, four work prints tucked behind at the corners, copy under me
    print_(base, WORK["p5"], 160, 330, 300, 400, rot=-7)
    print_(base, WORK["p7"], 930, 300, 300, 400, rot=6, focus=0.2)
    print_(base, WORK["p3"], 150, 1700, 300, 400, rot=5)
    print_(base, WORK["p8"], 940, 1710, 300, 400, rot=-6)
    print_(base, ME, 540, 520, *ME_SZ1, rot=-2, focus=ME_FOCUS)
    stack(base, tilt(COPY, [-2] * 5, [-280, 0, 10, -10, 0]), 920)

def v02(base):
    # me top, copy middle, a row of three work prints at the bottom
    print_(base, ME, 540, 480, *ME_SZ2, rot=0, focus=ME_FOCUS)
    stack(base, COPY, 900)
    for i, (k, r) in enumerate([("p5", -4), ("p7", 2), ("p6", -3)]):
        print_(base, WORK[k], 190 + i * 350, 1620, 300, 400, rot=r, focus=0.25)

def v03(base):
    # me small top-left, copy to the right/below, two work prints stepping down the right, two along the bottom
    print_(base, ME, 290, 420, *ME_SZ1, rot=-3, focus=ME_FOCUS)
    print_(base, WORK["w15"], 860, 300, 260, 350, rot=5, focus=0.3)
    print_(base, WORK["w16"], 880, 720, 260, 350, rot=-4, focus=0.35)
    stack(base, tilt(COPY, [2] * 5, [0, 0, 0, 0, 0]), 800, align="left", x0=70)
    print_(base, WORK["w17"], 300, 1630, 380, 480, rot=3, focus=0.3)
    print_(base, WORK["w18"], 750, 1640, 380, 480, rot=-3, focus=0.3)

def main(out):
    global ME, ME_FOCUS, ME_SZ1, ME_SZ2
    os.makedirs(out, exist_ok=True)
    for who, rel, focus, sz1, sz2 in MES:
        ME, ME_FOCUS, ME_SZ1, ME_SZ2 = os.path.join(HERE, rel), focus, sz1, sz2
        for name, fn in [("03-stair", v03)]:
            base = Image.new("RGBA", (W, H), BG); fn(base)
            dst = os.path.join(out, f"charlotte-about-{who}-{name}.jpg")
            base.convert("RGB").save(dst, quality=92); print(dst)

if __name__ == "__main__":
    main(sys.argv[1])
