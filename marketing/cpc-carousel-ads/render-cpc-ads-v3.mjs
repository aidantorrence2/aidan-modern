import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, 'output-v3')
const IMG_DIR = '/Volumes/PortableSSD/Exports/film scans selected'

fs.mkdirSync(OUT, { recursive: true })

function img(filename) {
  const buf = fs.readFileSync(path.join(IMG_DIR, filename))
  return `data:image/jpeg;base64,${buf.toString('base64')}`
}

const LANDSCAPE_FILES = new Set([
  'DSC_0017.jpg','DSC_0280.jpg','DSC_0314-2.jpg','DSC_0466.jpg','DSC_0487.jpg',
  'DSC_0505.jpg','DSC_0507.jpg','DSC_0520.jpg','DSC_0528.jpg','DSC_0539.jpg',
  'DSC_0563.jpg','DSC_0565.jpg','DSC_0621.jpg','DSC_0692.jpg','DSC_0781.jpg',
  'DSC_0861-2.jpg','DSC_0988.jpg'
])

const allFiles = fs.readdirSync(IMG_DIR).filter(f => f.endsWith('.jpg') && !f.startsWith('._'))
const portraitPhotos = allFiles.filter(f => !LANDSCAPE_FILES.has(f)).map(f => img(f))
const landscapePhotos = allFiles.filter(f => LANDSCAPE_FILES.has(f)).map(f => img(f))

console.log(`Loaded ${portraitPhotos.length} portrait, ${landscapePhotos.length} landscape photos`)

// Variants that use landscape-oriented photo containers (width > height)
const LANDSCAPE_VARIANTS = new Set([5, 7, 12, 17, 22, 27])

const SERIF = "Georgia, 'Times New Roman', serif"
const SANS = "'Helvetica Neue', 'Arial', sans-serif"
const DISPLAY = "Impact, 'Arial Black', sans-serif"
const MONO = "Menlo, 'Courier New', monospace"
const FUTURA = "Futura, 'Trebechet MS', sans-serif"
const AVENIR = "'Avenir Next', 'Avenir', 'Helvetica Neue', sans-serif"

const cities = ['Manila', 'Antipolo', 'Subic']
const CTA = 'if interested, message me for details'

function cs(base, city) {
  if (city.length <= 5) return base
  if (city.length <= 6) return Math.round(base * 0.88)
  return Math.round(base * 0.6)
}

function makeSlide(city, p, p2, p3, variant) {
  const C = city.toUpperCase()
  const PH = (color, font = SANS) => `<div style="font-family:${font};font-size:20px;letter-spacing:4px;color:${color};margin-top:2px;">PHILIPPINES</div>`

  switch (variant) {

    // 0: MINIMALIST — white top banner, single large portrait photo below
    case 0: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#fff;display:flex;flex-direction:column;">
        <div style="padding:80px 70px 50px;flex-shrink:0;">
          <div style="font-family:${SERIF};font-size:${cs(90,city)}px;font-weight:bold;color:#111;line-height:1;">${C}</div>
          ${PH('#999')}
          <div style="font-family:${SANS};font-size:42px;font-weight:600;color:#111;margin-top:20px;letter-spacing:2px;">FREE PHOTO SHOOT</div>
          <div style="width:60px;height:4px;background:#111;margin-top:20px;"></div>
          <div style="font-family:${SANS};font-size:22px;color:#888;margin-top:16px;">${CTA}</div>
        </div>
        <div style="flex:1;overflow:hidden;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;display:block;"/>
        </div>
      </div>`

    // 1: BRUTALIST — bold black banner top, red accents, raw photo below
    case 1: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#111;display:flex;flex-direction:column;">
        <div style="background:#111;padding:60px 60px 40px;flex-shrink:0;border-bottom:8px solid #ff2020;">
          <div style="font-family:${DISPLAY};font-size:${cs(120,city)}px;color:#ff2020;letter-spacing:6px;line-height:1;">${C}</div>
          ${PH('#ff2020', MONO)}
          <div style="font-family:${MONO};font-size:38px;color:#fff;margin-top:16px;text-transform:uppercase;letter-spacing:3px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${MONO};font-size:18px;color:#666;margin-top:12px;text-transform:uppercase;">${CTA}</div>
        </div>
        <div style="flex:1;overflow:hidden;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;display:block;"/>
        </div>
      </div>`

    // 2: LUXURY GOLD — dark bg, gold text, elegant serif, portrait below
    case 2: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#0a0a0a;display:flex;flex-direction:column;">
        <div style="padding:80px 70px 50px;flex-shrink:0;border-bottom:2px solid #c9a84c;">
          <div style="font-family:${SERIF};font-size:${cs(100,city)}px;font-weight:bold;font-style:italic;color:#c9a84c;line-height:1;">${C}</div>
          ${PH('#c9a84c80', SERIF)}
          <div style="font-family:${SERIF};font-size:36px;color:#c9a84c;margin-top:20px;letter-spacing:8px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SERIF};font-size:20px;color:#c9a84c80;margin-top:14px;font-style:italic;">${CTA}</div>
        </div>
        <div style="flex:1;overflow:hidden;margin:30px;border:1px solid #c9a84c40;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;display:block;"/>
        </div>
      </div>`

    // 3: NEON — dark purple bg, glowing neon cyan/pink text, photo below
    case 3: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#0d0015;display:flex;flex-direction:column;">
        <div style="padding:70px 60px 40px;flex-shrink:0;">
          <div style="font-family:${FUTURA};font-size:${cs(110,city)}px;font-weight:bold;color:#00fff7;text-shadow:0 0 30px #00fff7,0 0 60px #00fff780;line-height:1;">${C}</div>
          ${PH('#ff00ff', FUTURA)}
          <div style="font-family:${FUTURA};font-size:44px;font-weight:bold;color:#ff00ff;text-shadow:0 0 20px #ff00ff,0 0 40px #ff00ff80;margin-top:14px;letter-spacing:4px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:20px;color:#00fff780;margin-top:14px;">${CTA}</div>
        </div>
        <div style="flex:1;overflow:hidden;margin:0 30px 30px;border:2px solid #00fff740;border-radius:4px;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;display:block;"/>
        </div>
      </div>`

    // 4: RETRO 80s — gradient pink/purple bg, bold sans, two stacked photos
    case 4: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:linear-gradient(180deg,#ff6ec7 0%,#7873f5 50%,#2d1b69 100%);display:flex;flex-direction:column;">
        <div style="padding:70px 60px 30px;flex-shrink:0;">
          <div style="font-family:${DISPLAY};font-size:${cs(110,city)}px;color:#fff;text-shadow:4px 4px 0 #ff00ff,-2px -2px 0 #00ffff;line-height:1;">${C}</div>
          ${PH('#ffffffcc', FUTURA)}
          <div style="font-family:${FUTURA};font-size:44px;font-weight:bold;color:#ffff00;margin-top:10px;letter-spacing:3px;text-shadow:2px 2px 0 #ff00ff;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:20px;color:#ffffffaa;margin-top:10px;">${CTA}</div>
        </div>
        <div style="flex:1;display:flex;flex-direction:column;gap:12px;padding:10px 40px 40px;overflow:hidden;">
          <div style="flex:1;overflow:hidden;border-radius:8px;border:3px solid #fff;"><img src="${p}" style="width:100%;height:100%;object-fit:cover;display:block;"/></div>
          <div style="flex:1;overflow:hidden;border-radius:8px;border:3px solid #fff;"><img src="${p2}" style="width:100%;height:100%;object-fit:cover;display:block;"/></div>
        </div>
      </div>`

    // 5: ART DECO — cream/gold, geometric lines, landscape photo in wide frame
    case 5: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#1a1611;display:flex;flex-direction:column;align-items:center;">
        <div style="padding:70px 60px 20px;text-align:center;flex-shrink:0;">
          <div style="font-family:${SERIF};font-size:18px;letter-spacing:12px;color:#c9a84c;">&#9670; &#9670; &#9670;</div>
          <div style="font-family:${SERIF};font-size:${cs(100,city)}px;font-weight:bold;color:#c9a84c;line-height:1;margin-top:10px;">${C}</div>
          ${PH('#c9a84c80', SERIF)}
          <div style="width:200px;height:2px;background:linear-gradient(90deg,transparent,#c9a84c,transparent);margin:16px auto;"></div>
          <div style="font-family:${SERIF};font-size:38px;color:#f5e6c8;letter-spacing:6px;">FREE PHOTO SHOOT</div>
          <div style="width:200px;height:2px;background:linear-gradient(90deg,transparent,#c9a84c,transparent);margin:16px auto;"></div>
          <div style="font-family:${SERIF};font-size:18px;color:#c9a84c80;margin-top:8px;font-style:italic;">${CTA}</div>
        </div>
        <div style="width:940px;height:560px;overflow:hidden;border:3px solid #c9a84c;margin-top:20px;flex-shrink:0;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;display:block;"/>
        </div>
        <div style="display:flex;gap:20px;margin-top:20px;flex-shrink:0;">
          <div style="width:450px;height:560px;overflow:hidden;border:2px solid #c9a84c60;"><img src="${p2}" style="width:100%;height:100%;object-fit:cover;display:block;"/></div>
          <div style="width:450px;height:560px;overflow:hidden;border:2px solid #c9a84c60;"><img src="${p3}" style="width:100%;height:100%;object-fit:cover;display:block;"/></div>
        </div>
      </div>`

    // 6: BAUHAUS — primary colors, geometric blocks, text left + photo right concept stacked vertically
    case 6: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#f5f0e8;display:flex;flex-direction:column;">
        <div style="background:#e63946;padding:50px 60px 30px;flex-shrink:0;">
          <div style="font-family:${FUTURA};font-size:${cs(100,city)}px;font-weight:bold;color:#fff;line-height:1;">${C}</div>
          ${PH('#ffffff80', FUTURA)}
        </div>
        <div style="background:#1d3557;padding:20px 60px;flex-shrink:0;">
          <div style="font-family:${FUTURA};font-size:42px;font-weight:bold;color:#f1faee;letter-spacing:4px;">FREE PHOTO SHOOT</div>
        </div>
        <div style="background:#f5f0e8;padding:16px 60px;flex-shrink:0;">
          <div style="font-family:${SANS};font-size:20px;color:#333;">${CTA}</div>
        </div>
        <div style="flex:1;display:flex;overflow:hidden;">
          <div style="flex:1;overflow:hidden;"><img src="${p}" style="width:100%;height:100%;object-fit:cover;display:block;"/></div>
          <div style="width:20px;background:#f1c40f;flex-shrink:0;"></div>
          <div style="flex:1;overflow:hidden;"><img src="${p2}" style="width:100%;height:100%;object-fit:cover;display:block;"/></div>
        </div>
      </div>`

    // 7: SWISS/INTERNATIONAL — grid-based, clean helvetica, landscape photo
    case 7: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#fff;display:flex;flex-direction:column;">
        <div style="padding:60px 70px 30px;flex-shrink:0;">
          <div style="font-family:${SANS};font-size:16px;letter-spacing:6px;color:#999;text-transform:uppercase;">Free Photo Shoot</div>
          <div style="font-family:${SANS};font-size:${cs(130,city)}px;font-weight:700;color:#111;line-height:0.95;margin-top:10px;">${C}</div>
          ${PH('#999')}
          <div style="height:2px;background:#e00;margin-top:20px;width:120px;"></div>
          <div style="font-family:${SANS};font-size:20px;color:#666;margin-top:14px;">${CTA}</div>
        </div>
        <div style="flex:1;overflow:hidden;margin:0 40px 40px;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;display:block;"/>
        </div>
      </div>`

    // 8: POP ART — bright yellow bg, halftone dots, bold outlines
    case 8: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#ffe100;display:flex;flex-direction:column;">
        <div style="padding:60px 60px 30px;flex-shrink:0;">
          <div style="font-family:${DISPLAY};font-size:${cs(120,city)}px;color:#111;line-height:1;-webkit-text-stroke:3px #111;">${C}</div>
          ${PH('#111', DISPLAY)}
          <div style="font-family:${DISPLAY};font-size:50px;color:#e00;margin-top:10px;-webkit-text-stroke:2px #e00;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:22px;color:#111;font-weight:bold;margin-top:10px;">${CTA}</div>
        </div>
        <div style="flex:1;overflow:hidden;margin:10px 40px 40px;border:6px solid #111;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;display:block;"/>
        </div>
      </div>`

    // 9: PASTEL — soft pink/lavender, rounded photo frame
    case 9: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:linear-gradient(180deg,#fce4ec,#e8eaf6);display:flex;flex-direction:column;align-items:center;">
        <div style="padding:80px 60px 30px;text-align:center;flex-shrink:0;">
          <div style="font-family:${SERIF};font-size:${cs(90,city)}px;font-weight:bold;color:#5c3d6e;line-height:1;">${C}</div>
          ${PH('#8e6aa0', SERIF)}
          <div style="font-family:${SANS};font-size:38px;color:#5c3d6e;margin-top:16px;font-weight:600;">free photo shoot</div>
          <div style="font-family:${SANS};font-size:20px;color:#8e6aa0;margin-top:10px;">${CTA}</div>
        </div>
        <div style="flex:1;width:900px;overflow:hidden;margin:20px 0 40px;border-radius:30px;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;display:block;"/>
        </div>
      </div>`

    // 10: GEOMETRIC — teal triangles/shapes, modern layout
    case 10: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#003333;display:flex;flex-direction:column;">
        <div style="padding:70px 60px 30px;flex-shrink:0;">
          <div style="display:flex;gap:12px;align-items:center;margin-bottom:8px;">
            <div style="width:40px;height:40px;background:#00bfa5;transform:rotate(45deg);"></div>
            <div style="width:30px;height:30px;background:#ff6f61;border-radius:50%;"></div>
            <div style="width:0;height:0;border-left:20px solid transparent;border-right:20px solid transparent;border-bottom:35px solid #f1c40f;"></div>
          </div>
          <div style="font-family:${FUTURA};font-size:${cs(100,city)}px;font-weight:bold;color:#00bfa5;line-height:1;">${C}</div>
          ${PH('#00bfa580', FUTURA)}
          <div style="font-family:${FUTURA};font-size:40px;font-weight:bold;color:#fff;margin-top:14px;letter-spacing:3px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:20px;color:#00bfa580;margin-top:10px;">${CTA}</div>
        </div>
        <div style="flex:1;overflow:hidden;margin:10px 50px 50px;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;display:block;"/>
        </div>
      </div>`

    // 11: TECH/FUTURISTIC — dark bg, scan lines, monospace, portrait photo
    case 11: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#0a0e17;display:flex;flex-direction:column;">
        <div style="padding:60px;flex-shrink:0;">
          <div style="font-family:${MONO};font-size:14px;color:#0f0;letter-spacing:3px;">// LOCATION_ID: ${C}</div>
          <div style="font-family:${MONO};font-size:${cs(80,city)}px;font-weight:bold;color:#0f0;line-height:1;margin-top:8px;text-shadow:0 0 10px #0f0;">${C}</div>
          ${PH('#0f080', MONO)}
          <div style="font-family:${MONO};font-size:32px;color:#0f0;margin-top:16px;">FREE_PHOTO_SHOOT.exe</div>
          <div style="height:1px;background:#0f040;margin-top:16px;"></div>
          <div style="font-family:${MONO};font-size:16px;color:#0f060;margin-top:10px;">$ ${CTA}</div>
        </div>
        <div style="flex:1;overflow:hidden;margin:0 40px 40px;border:1px solid #0f030;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;display:block;filter:contrast(1.1);"/>
        </div>
      </div>`

    // 12: JAPANESE — vertical text influence, clean minimal, landscape photo
    case 12: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#f7f3ee;display:flex;flex-direction:column;">
        <div style="padding:70px 70px 30px;flex-shrink:0;">
          <div style="font-family:${SERIF};font-size:${cs(90,city)}px;font-weight:bold;color:#2d2d2d;line-height:1;">${C}</div>
          ${PH('#999', SERIF)}
          <div style="display:flex;align-items:center;gap:16px;margin-top:20px;">
            <div style="width:50px;height:2px;background:#c0392b;"></div>
            <div style="font-family:${SANS};font-size:32px;color:#2d2d2d;letter-spacing:6px;">FREE PHOTO SHOOT</div>
          </div>
          <div style="font-family:${SANS};font-size:18px;color:#999;margin-top:14px;">${CTA}</div>
        </div>
        <div style="flex:1;overflow:hidden;margin:10px 50px 50px;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;display:block;"/>
        </div>
      </div>`

    // 13: EDITORIAL — magazine style, large serif, photo below
    case 13: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#faf8f5;display:flex;flex-direction:column;">
        <div style="padding:70px 60px 20px;flex-shrink:0;border-bottom:1px solid #ddd;">
          <div style="display:flex;justify-content:space-between;align-items:baseline;">
            <div style="font-family:${SERIF};font-size:14px;letter-spacing:6px;color:#999;text-transform:uppercase;">Issue no. 1</div>
            <div style="font-family:${SERIF};font-size:14px;color:#999;">${city}, Philippines</div>
          </div>
          <div style="font-family:${SERIF};font-size:${cs(120,city)}px;font-weight:bold;font-style:italic;color:#111;line-height:0.95;margin-top:20px;">${C}</div>
          <div style="font-family:${SANS};font-size:40px;font-weight:300;color:#333;margin-top:10px;letter-spacing:4px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SERIF};font-size:18px;color:#999;font-style:italic;margin-top:12px;padding-bottom:16px;">${CTA}</div>
        </div>
        <div style="flex:1;overflow:hidden;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;display:block;"/>
        </div>
      </div>`

    // 14: FASHION — high contrast, thin sans, portrait photo
    case 14: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#000;display:flex;flex-direction:column;">
        <div style="padding:80px 70px 30px;flex-shrink:0;">
          <div style="font-family:${AVENIR};font-size:${cs(110,city)}px;font-weight:200;color:#fff;letter-spacing:10px;line-height:1;">${C}</div>
          ${PH('#ffffff40', AVENIR)}
          <div style="font-family:${AVENIR};font-size:34px;font-weight:600;color:#fff;letter-spacing:8px;margin-top:16px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${AVENIR};font-size:18px;font-weight:300;color:#ffffff50;margin-top:14px;letter-spacing:3px;">${CTA}</div>
        </div>
        <div style="flex:1;overflow:hidden;margin:10px 60px 60px;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;display:block;"/>
        </div>
      </div>`

    // 15: SPORTS CARD — bold header bar, stats layout, portrait photo
    case 15: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#1a1a2e;display:flex;flex-direction:column;">
        <div style="background:linear-gradient(90deg,#e63946,#d62828);padding:40px 60px 30px;flex-shrink:0;">
          <div style="font-family:${DISPLAY};font-size:${cs(80,city)}px;color:#fff;line-height:1;">${C}</div>
          ${PH('#ffffffcc', DISPLAY)}
        </div>
        <div style="background:#16213e;padding:16px 60px;flex-shrink:0;display:flex;justify-content:space-between;align-items:center;">
          <div style="font-family:${SANS};font-size:36px;font-weight:bold;color:#f1c40f;">FREE PHOTO SHOOT</div>
          <div style="font-family:${MONO};font-size:18px;color:#ffffff60;">2025 EDITION</div>
        </div>
        <div style="flex:1;overflow:hidden;margin:20px;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;display:block;border-radius:10px;"/>
        </div>
        <div style="padding:0 60px 40px;flex-shrink:0;">
          <div style="font-family:${SANS};font-size:18px;color:#ffffff50;">${CTA}</div>
        </div>
      </div>`

    // 16: EVENT FLYER — bold stacked text, accent line, photo below
    case 16: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#111;display:flex;flex-direction:column;">
        <div style="padding:70px 60px 30px;flex-shrink:0;">
          <div style="font-family:${SANS};font-size:16px;letter-spacing:8px;color:#ff6b6b;text-transform:uppercase;">Now Booking</div>
          <div style="font-family:${DISPLAY};font-size:${cs(140,city)}px;color:#fff;line-height:0.9;margin-top:10px;">${C}</div>
          ${PH('#ffffff40')}
          <div style="height:6px;background:linear-gradient(90deg,#ff6b6b,#ffa502);margin-top:16px;width:300px;"></div>
          <div style="font-family:${SANS};font-size:44px;font-weight:bold;color:#ff6b6b;margin-top:14px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:20px;color:#ffffff40;margin-top:10px;">${CTA}</div>
        </div>
        <div style="flex:1;overflow:hidden;margin:10px 40px 40px;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;display:block;"/>
        </div>
      </div>`

    // 17: REAL ESTATE LISTING — clean header, landscape photo, property-style
    case 17: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#f8f8f8;display:flex;flex-direction:column;">
        <div style="padding:60px 60px 30px;flex-shrink:0;background:#fff;border-bottom:3px solid #2c3e50;">
          <div style="font-family:${SANS};font-size:14px;letter-spacing:5px;color:#7f8c8d;text-transform:uppercase;">Location</div>
          <div style="font-family:${SERIF};font-size:${cs(90,city)}px;font-weight:bold;color:#2c3e50;line-height:1;margin-top:4px;">${C}</div>
          ${PH('#7f8c8d', SERIF)}
          <div style="display:flex;gap:30px;margin-top:16px;align-items:center;">
            <div style="font-family:${SANS};font-size:36px;font-weight:bold;color:#27ae60;">FREE</div>
            <div style="width:2px;height:30px;background:#ddd;"></div>
            <div style="font-family:${SANS};font-size:28px;color:#2c3e50;">Photo Shoot</div>
          </div>
          <div style="font-family:${SANS};font-size:18px;color:#999;margin-top:12px;">${CTA}</div>
        </div>
        <div style="flex:1;overflow:hidden;margin:20px;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;display:block;border-radius:8px;"/>
        </div>
      </div>`

    // 18: APP UI MOCKUP — phone-like card layout, notification style
    case 18: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#f0f2f5;display:flex;flex-direction:column;align-items:center;">
        <div style="width:960px;margin-top:60px;background:#fff;border-radius:20px;padding:40px;box-shadow:0 4px 20px rgba(0,0,0,0.08);flex-shrink:0;">
          <div style="display:flex;align-items:center;gap:16px;margin-bottom:16px;">
            <div style="width:50px;height:50px;border-radius:50%;background:#e63946;display:flex;align-items:center;justify-content:center;font-family:${SANS};font-size:22px;font-weight:bold;color:#fff;">A</div>
            <div>
              <div style="font-family:${SANS};font-size:22px;font-weight:bold;color:#111;">@madebyaidan</div>
              <div style="font-family:${SANS};font-size:16px;color:#999;">${city}, Philippines</div>
            </div>
          </div>
          <div style="font-family:${SANS};font-size:${cs(60,city)}px;font-weight:bold;color:#111;line-height:1.1;">${C}</div>
          <div style="font-family:${SANS};font-size:34px;color:#e63946;font-weight:600;margin-top:8px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:18px;color:#999;margin-top:8px;">${CTA}</div>
        </div>
        <div style="flex:1;width:960px;overflow:hidden;margin:16px 0 60px;border-radius:20px;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;display:block;"/>
        </div>
      </div>`

    // 19: BOOK COVER — serif heavy, centered, portrait photo below
    case 19: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#2c1810;display:flex;flex-direction:column;align-items:center;">
        <div style="padding:90px 80px 40px;text-align:center;flex-shrink:0;">
          <div style="font-family:${SERIF};font-size:18px;letter-spacing:10px;color:#d4a574;">A PHOTOGRAPHIC EXPERIENCE</div>
          <div style="width:100px;height:1px;background:#d4a574;margin:20px auto;"></div>
          <div style="font-family:${SERIF};font-size:${cs(110,city)}px;font-weight:bold;font-style:italic;color:#f5e6c8;line-height:0.95;">${C}</div>
          ${PH('#d4a574', SERIF)}
          <div style="width:100px;height:1px;background:#d4a574;margin:20px auto;"></div>
          <div style="font-family:${SERIF};font-size:32px;color:#d4a574;font-style:italic;">Free Photo Shoot</div>
          <div style="font-family:${SERIF};font-size:18px;color:#d4a57480;margin-top:14px;font-style:italic;">${CTA}</div>
        </div>
        <div style="flex:1;width:860px;overflow:hidden;margin-bottom:60px;border:2px solid #d4a57440;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;display:block;"/>
        </div>
      </div>`

    // 20: ALBUM ART — centered square-ish photo, text above, dark bg
    case 20: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#0c0c0c;display:flex;flex-direction:column;align-items:center;">
        <div style="padding:80px 60px 30px;text-align:center;flex-shrink:0;">
          <div style="font-family:${SANS};font-size:16px;letter-spacing:8px;color:#666;">${city.toUpperCase()}, PHILIPPINES</div>
          <div style="font-family:${SANS};font-size:${cs(80,city)}px;font-weight:800;color:#fff;line-height:1;margin-top:14px;">FREE PHOTO<br/>SHOOT</div>
          <div style="font-family:${SANS};font-size:18px;color:#666;margin-top:14px;">${CTA}</div>
        </div>
        <div style="width:880px;height:880px;overflow:hidden;flex-shrink:0;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;display:block;"/>
        </div>
        <div style="flex:1;display:flex;gap:12px;padding:16px 100px;overflow:hidden;">
          <div style="flex:1;overflow:hidden;"><img src="${p2}" style="width:100%;height:100%;object-fit:cover;display:block;"/></div>
          <div style="flex:1;overflow:hidden;"><img src="${p3}" style="width:100%;height:100%;object-fit:cover;display:block;"/></div>
        </div>
      </div>`

    // 21: BILLBOARD — ultra bold, wide text, photo underneath
    case 21: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#222;display:flex;flex-direction:column;">
        <div style="padding:60px;flex-shrink:0;background:#111;">
          <div style="font-family:${DISPLAY};font-size:${cs(160,city)}px;color:#fff;line-height:0.85;letter-spacing:-3px;">${C}</div>
          ${PH('#ffffff40', DISPLAY)}
          <div style="font-family:${DISPLAY};font-size:56px;color:#ff4444;margin-top:10px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:20px;color:#ffffff30;margin-top:8px;">${CTA}</div>
        </div>
        <div style="flex:1;overflow:hidden;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;display:block;"/>
        </div>
      </div>`

    // 22: PRICE TAG — off-white bg, dotted border, landscape photo below
    case 22: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#f5f0e0;display:flex;flex-direction:column;align-items:center;">
        <div style="margin:60px;padding:50px;border:3px dashed #333;flex-shrink:0;text-align:center;width:920px;">
          <div style="font-family:${MONO};font-size:14px;letter-spacing:6px;color:#999;">PHOTOGRAPHY</div>
          <div style="font-family:${SERIF};font-size:${cs(90,city)}px;font-weight:bold;color:#333;line-height:1;margin-top:8px;">${C}</div>
          ${PH('#666', SERIF)}
          <div style="font-family:${DISPLAY};font-size:70px;color:#c0392b;margin-top:14px;">FREE</div>
          <div style="font-family:${SANS};font-size:32px;color:#333;margin-top:4px;">Photo Shoot</div>
          <div style="font-family:${MONO};font-size:16px;color:#999;margin-top:12px;">${CTA}</div>
        </div>
        <div style="flex:1;width:920px;overflow:hidden;margin:0 60px 60px;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;display:block;"/>
        </div>
      </div>`

    // 23: AWARD CERTIFICATE — ornate border, formal serif
    case 23: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#1a1a2e;display:flex;flex-direction:column;align-items:center;">
        <div style="margin:50px;padding:50px;border:4px double #c9a84c;flex-shrink:0;text-align:center;width:940px;background:#1a1a2eee;">
          <div style="font-family:${SERIF};font-size:16px;letter-spacing:10px;color:#c9a84c;">PRESENTED IN</div>
          <div style="font-family:${SERIF};font-size:${cs(100,city)}px;font-weight:bold;font-style:italic;color:#f5e6c8;line-height:1;margin-top:10px;">${C}</div>
          ${PH('#c9a84c80', SERIF)}
          <div style="width:200px;height:1px;background:#c9a84c;margin:20px auto;"></div>
          <div style="font-family:${SERIF};font-size:36px;color:#c9a84c;">Free Photo Shoot</div>
          <div style="font-family:${SERIF};font-size:18px;color:#c9a84c80;font-style:italic;margin-top:14px;">${CTA}</div>
        </div>
        <div style="flex:1;width:860px;overflow:hidden;margin:0 0 60px;border:2px solid #c9a84c40;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;display:block;"/>
        </div>
      </div>`

    // 24: GRUNGE — textured dark bg, scratchy text feel, photo bottom
    case 24: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#1a1a1a;display:flex;flex-direction:column;">
        <div style="padding:70px 60px 30px;flex-shrink:0;">
          <div style="font-family:${DISPLAY};font-size:${cs(110,city)}px;color:#ccc;line-height:1;text-shadow:3px 3px 0 #333,-1px -1px 0 #555;">${C}</div>
          ${PH('#666', DISPLAY)}
          <div style="font-family:${DISPLAY};font-size:48px;color:#ff6b35;margin-top:10px;text-shadow:2px 2px 0 #333;">FREE PHOTO SHOOT</div>
          <div style="height:4px;background:#ff6b35;width:200px;margin-top:14px;"></div>
          <div style="font-family:${MONO};font-size:18px;color:#666;margin-top:12px;">${CTA}</div>
        </div>
        <div style="flex:1;overflow:hidden;margin:10px 30px 30px;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;display:block;"/>
        </div>
      </div>`

    // 25: BOTANICAL — sage green bg, elegant serif, nature vibes
    case 25: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#2d4a3e;display:flex;flex-direction:column;">
        <div style="padding:80px 70px 40px;flex-shrink:0;">
          <div style="font-family:${SERIF};font-size:${cs(100,city)}px;font-weight:bold;font-style:italic;color:#e8d5b7;line-height:1;">${C}</div>
          ${PH('#e8d5b780', SERIF)}
          <div style="width:80px;height:2px;background:#e8d5b7;margin-top:20px;"></div>
          <div style="font-family:${SERIF};font-size:34px;color:#c4dab8;margin-top:16px;font-style:italic;">Free Photo Shoot</div>
          <div style="font-family:${SANS};font-size:18px;color:#e8d5b760;margin-top:14px;">${CTA}</div>
        </div>
        <div style="flex:1;overflow:hidden;margin:0 50px 50px;border-radius:12px;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;display:block;"/>
        </div>
      </div>`

    // 26: TWO-TONE SPLIT — left color block text, right photo, side by side
    case 26: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#111;display:flex;flex-direction:column;">
        <div style="display:flex;flex:1;">
          <div style="width:420px;background:#e63946;display:flex;flex-direction:column;justify-content:center;padding:50px;">
            <div style="font-family:${FUTURA};font-size:${cs(70,city)}px;font-weight:bold;color:#fff;line-height:1;">${C}</div>
            ${PH('#ffffffcc', FUTURA)}
            <div style="width:50px;height:4px;background:#fff;margin-top:20px;"></div>
            <div style="font-family:${FUTURA};font-size:28px;font-weight:bold;color:#fff;margin-top:16px;letter-spacing:2px;">FREE<br/>PHOTO<br/>SHOOT</div>
            <div style="font-family:${SANS};font-size:16px;color:#ffffffaa;margin-top:20px;">${CTA}</div>
          </div>
          <div style="flex:1;overflow:hidden;">
            <img src="${p}" style="width:100%;height:100%;object-fit:cover;display:block;"/>
          </div>
        </div>
      </div>`

    // 27: MUSEUM EXHIBIT — white walls, label card, landscape photo
    case 27: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#f5f5f0;display:flex;flex-direction:column;">
        <div style="padding:70px 70px 30px;flex-shrink:0;">
          <div style="font-family:${SANS};font-size:14px;letter-spacing:8px;color:#999;text-transform:uppercase;">Exhibition</div>
          <div style="font-family:${SERIF};font-size:${cs(90,city)}px;font-weight:bold;color:#222;line-height:1;margin-top:8px;">${C}</div>
          ${PH('#999', SERIF)}
          <div style="font-family:${SANS};font-size:32px;color:#222;margin-top:16px;">Free Photo Shoot</div>
          <div style="font-family:${SANS};font-size:16px;color:#999;margin-top:8px;">${city}, Philippines &mdash; Now Booking</div>
          <div style="font-family:${SANS};font-size:16px;color:#bbb;margin-top:10px;">${CTA}</div>
        </div>
        <div style="flex:1;overflow:hidden;margin:10px 60px 30px;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;display:block;"/>
        </div>
        <div style="display:flex;gap:16px;padding:0 60px 50px;flex-shrink:0;">
          <div style="flex:1;height:280px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.08);"><img src="${p2}" style="width:100%;height:100%;object-fit:cover;display:block;"/></div>
          <div style="flex:1;height:280px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.08);"><img src="${p3}" style="width:100%;height:100%;object-fit:cover;display:block;"/></div>
        </div>
      </div>`

    // 28: SOCIAL MEDIA POST MOCKUP — rounded card, engagement row, photo below card
    case 28: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#000;display:flex;flex-direction:column;align-items:center;">
        <div style="width:960px;margin-top:60px;background:#1a1a1a;border-radius:16px;padding:30px;flex-shrink:0;">
          <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px;">
            <div style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#f58529,#dd2a7b,#8134af);"></div>
            <div style="font-family:${SANS};font-size:20px;color:#fff;font-weight:bold;">madebyaidan</div>
            <div style="margin-left:auto;font-family:${SANS};font-size:14px;color:#0095f6;">Follow</div>
          </div>
          <div style="font-family:${SANS};font-size:${cs(50,city)}px;font-weight:bold;color:#fff;line-height:1.1;">${C} Free Photo Shoot</div>
          ${PH('#ffffff40')}
          <div style="display:flex;gap:20px;margin-top:16px;">
            <div style="font-family:${SANS};font-size:14px;color:#999;">&#10084; 2.4k</div>
            <div style="font-family:${SANS};font-size:14px;color:#999;">&#128172; 89</div>
            <div style="font-family:${SANS};font-size:14px;color:#999;">&#10148; 312</div>
          </div>
          <div style="font-family:${SANS};font-size:16px;color:#666;margin-top:10px;">${CTA}</div>
        </div>
        <div style="flex:1;width:960px;overflow:hidden;margin:16px 0 60px;border-radius:16px;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;display:block;"/>
        </div>
      </div>`

    // 29: STREET ART — spray paint vibe, bright on dark, 3 photo grid at bottom
    case 29: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#1a1a1a;display:flex;flex-direction:column;">
        <div style="padding:70px 60px 30px;flex-shrink:0;">
          <div style="font-family:${DISPLAY};font-size:${cs(130,city)}px;color:#ff3366;line-height:0.9;-webkit-text-stroke:2px #ff3366;">${C}</div>
          ${PH('#ff336680', DISPLAY)}
          <div style="font-family:${DISPLAY};font-size:50px;color:#33ff99;margin-top:10px;">FREE PHOTO SHOOT</div>
          <div style="display:flex;gap:8px;margin-top:14px;">
            <div style="padding:6px 16px;background:#ff3366;font-family:${SANS};font-size:14px;color:#fff;font-weight:bold;">NOW BOOKING</div>
            <div style="padding:6px 16px;background:#33ff99;font-family:${SANS};font-size:14px;color:#111;font-weight:bold;">${C}</div>
          </div>
          <div style="font-family:${SANS};font-size:18px;color:#ffffff40;margin-top:14px;">${CTA}</div>
        </div>
        <div style="flex:1;display:flex;gap:10px;padding:10px 30px 40px;overflow:hidden;">
          <div style="flex:1;overflow:hidden;border-radius:6px;"><img src="${p}" style="width:100%;height:100%;object-fit:cover;display:block;"/></div>
          <div style="flex:1;overflow:hidden;border-radius:6px;"><img src="${p2}" style="width:100%;height:100%;object-fit:cover;display:block;"/></div>
          <div style="flex:1;overflow:hidden;border-radius:6px;"><img src="${p3}" style="width:100%;height:100%;object-fit:cover;display:block;"/></div>
        </div>
      </div>`

    default: return `<div style="width:1080px;height:1920px;background:#111;display:flex;align-items:center;justify-content:center;">
      <div style="font-family:${SANS};font-size:48px;color:white;">Variant ${variant}</div>
    </div>`
  }
}

// Build 90 slides: 30 per city
const slides = []

for (let ci = 0; ci < cities.length; ci++) {
  const city = cities[ci]
  for (let v = 0; v < 30; v++) {
    const pool = LANDSCAPE_VARIANTS.has(v) ? landscapePhotos : portraitPhotos
    const pi1 = (v * 3 + ci * 7) % pool.length
    const pi2 = (v * 3 + ci * 7 + 1) % pool.length
    const pi3 = (v * 3 + ci * 7 + 2) % pool.length
    slides.push({
      name: `${city.toLowerCase()}-${String(v + 1).padStart(3, '0')}`,
      city,
      html: makeSlide(city, pool[pi1], pool[pi2], pool[pi3], v),
    })
  }
}

async function render() {
  for (const city of cities) {
    fs.mkdirSync(path.join(OUT, city.toLowerCase()), { recursive: true })
  }

  console.log(`Launching browser — rendering ${slides.length} CPC ads...`)
  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 })

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i]
    const page = await context.newPage()
    await page.setContent(`<!doctype html><html><head><style>
      * { box-sizing: border-box; }
      html, body { margin: 0; width: 1080px; height: 1920px; background: #000; overflow: hidden; }
      body { -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; }
    </style></head><body>${slide.html}</body></html>`, { waitUntil: 'load' })
    await page.waitForTimeout(300)
    const outPath = path.join(OUT, slide.city.toLowerCase(), `${slide.name}.png`)
    await page.screenshot({ path: outPath, type: 'png' })
    await page.close()
    console.log(`  [${i + 1}/${slides.length}] ${slide.name}`)
  }

  await browser.close()
  console.log(`\nDone — ${slides.length} CPC ads rendered to ${OUT}`)
}

render()
