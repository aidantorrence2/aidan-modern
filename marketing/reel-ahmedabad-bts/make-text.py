#!/usr/bin/env python3
"""Render transparent 1080x1920 PNG text overlays for reel 104 (Ahmedabad BTS).

The system ffmpeg (/opt/homebrew/bin/ffmpeg) has no drawtext filter and
ffmpeg-full is broken (x265 dylib mismatch), so text is composited as PNG
overlays instead. Typography matches the house style: Playfair italic titles,
Inter-SemiBold 54px captions (>=50px SemiBold per feedback), soft drop shadow.
"""
from PIL import Image, ImageDraw, ImageFont
import os

W, H = 1080, 1920
F = "/Users/aidantorrence/Documents/aidan-modern/marketing/bts-reels/fonts"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "text-overlays")
os.makedirs(OUT, exist_ok=True)

SERIF_IT = os.path.join(F, "PlayfairDisplay-MediumItalic.ttf")
SERIF = os.path.join(F, "PlayfairDisplay-Regular.ttf")
# NB: Inter-Light/Medium/SemiBold.ttf in the fonts dir are corrupt (HTML error
# pages, not fonts). Inter-Regular.ttf is the real Inter VARIABLE font — use
# named instances instead.
INTER_VAR = os.path.join(F, "Inter-Regular.ttf")


def inter(weight, size):
    f = ImageFont.truetype(INTER_VAR, size)
    f.set_variation_by_name(weight)
    return f


def draw_centered(draw, text, font, y, fill=(255, 255, 255, 255),
                  shadow=(0, 0, 0, 140), off=2):
    x = (W - draw.textlength(text, font=font)) / 2
    draw.text((x + off, y + off), text, font=font, fill=shadow)
    draw.text((x, y), text, font=font, fill=fill)


def strip(name, specs):
    """specs: list of (text, font, y)"""
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    for text, font, y in specs:
        draw_centered(d, text, font, y)
    img.save(os.path.join(OUT, name))
    print("wrote", name)


def fit_font(draw, text, fontpath, target_w, start=200):
    size = start
    while size > 40:
        f = ImageFont.truetype(fontpath, size)
        if draw.textlength(text, font=f) <= target_w:
            return f, size
        size -= 2
    return ImageFont.truetype(fontpath, 40), 40


# --- title + captions (all well above the bottom quadrant, y < 1440) ---
cap = inter("SemiBold", 54)  # >=50px SemiBold per feedback
strip("title-bts.png", [("behind the scenes", ImageFont.truetype(SERIF_IT, 64), 210)])
strip("cap-wait.png", [("wait, wait, wait, wait", cap, 1270)])
strip("cap-look.png", [("look here again", cap, 1270)])
strip("cap-perfect.png", [("perfect.", cap, 1270)])
strip("cap-hold.png", [("hold on — hold it", cap, 1270)])

# --- end card: city HUGE, "free photo shoot" below, small sign-up line ---
img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
d = ImageDraw.Draw(img)
city_font, city_size = fit_font(d, "Ahmedabad", SERIF, 950)
draw_centered(d, "Ahmedabad", city_font, 700, shadow=(0, 0, 0, 170), off=3)
draw_centered(d, "free photo shoot", inter("Light", 72), 700 + city_size + 60)
draw_centered(d, "sign up — link below", inter("Medium", 44),
              700 + city_size + 60 + 72 + 70, fill=(255, 255, 255, 235))
img.save(os.path.join(OUT, "endcard.png"))
print("wrote endcard.png (city size %dpx)" % city_size)
