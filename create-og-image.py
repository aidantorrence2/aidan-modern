#!/usr/bin/env python3
from PIL import Image
import random
import os

thumbs_dir = '/Users/aidantorrence/Documents/aidan-modern/public/images/thumbs'
output_path = '/Users/aidantorrence/Documents/aidan-modern/public/og-image.jpg'

all_images = [f for f in os.listdir(thumbs_dir) if f.endswith(('.jpg', '.jpeg', '.png'))]
selected = random.sample(all_images, min(7, len(all_images)))

images = []
for img_name in selected:
    img = Image.open(os.path.join(thumbs_dir, img_name))
    img = img.convert('RGB')
    images.append(img)

canvas = Image.new('RGB', (1200, 630), (255, 255, 255))

positions = [
    (0, 0, 400, 315),
    (400, 0, 400, 315),
    (800, 0, 400, 315),
    (0, 315, 300, 315),
    (300, 315, 300, 315),
    (600, 315, 300, 315),
    (900, 315, 300, 315)
]

for idx, img in enumerate(images[:7]):
    x, y, w, h = positions[idx]
    aspect = img.width / img.height
    target_aspect = w / h
    
    if aspect > target_aspect:
        new_height = img.height
        new_width = int(new_height * target_aspect)
        left = (img.width - new_width) // 2
        img = img.crop((left, 0, left + new_width, new_height))
    else:
        new_width = img.width
        new_height = int(new_width / target_aspect)
        top = (img.height - new_height) // 2
        img = img.crop((0, top, new_width, top + new_height))
    
    img = img.resize((w, h), Image.Resampling.LANCZOS)
    canvas.paste(img, (x, y))

canvas.save(output_path, 'JPEG', quality=90, optimize=True)
print(f'Created OG image at {output_path}')
