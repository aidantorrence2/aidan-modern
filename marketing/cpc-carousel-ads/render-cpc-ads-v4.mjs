import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, 'output-v4')
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

// Variants where photo containers are landscape (width > height)
// 3: two wide landscape rows stacked
// 9: wide landscape photo in center
// 15: two landscape rows
// 21: wide landscape photo center
// 27: landscape photo in center band
const LANDSCAPE_VARIANTS = new Set([3, 9, 15, 21, 27])

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

    // 0: LEFT/RIGHT SPLIT — left red panel with text, right portrait photo
    case 0: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;display:flex;">
        <div style="width:400px;background:#e63946;display:flex;flex-direction:column;justify-content:center;padding:50px 40px;">
          <div style="font-family:${FUTURA};font-size:${cs(72,city)}px;font-weight:bold;color:#fff;line-height:0.95;">${C}</div>
          ${PH('#ffffffcc', FUTURA)}
          <div style="width:50px;height:4px;background:#fff;margin:20px 0;"></div>
          <div style="font-family:${FUTURA};font-size:28px;font-weight:bold;color:#fff;letter-spacing:2px;">FREE<br/>PHOTO<br/>SHOOT</div>
          <div style="font-family:${SANS};font-size:16px;color:#ffffffaa;margin-top:24px;">${CTA}</div>
        </div>
        <div style="flex:1;overflow:hidden;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
      </div>`

    // 1: THREE-ROW MOSAIC — text banner, then 2 portrait photos side by side, then 1 portrait photo
    case 1: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#0c0c0c;display:flex;flex-direction:column;">
        <div style="padding:60px 60px 40px;flex-shrink:0;text-align:center;">
          <div style="font-family:${DISPLAY};font-size:${cs(100,city)}px;color:#fff;line-height:0.9;">${C}</div>
          ${PH('#ffffff50', DISPLAY)}
          <div style="font-family:${SANS};font-size:36px;font-weight:bold;color:#ff4444;margin-top:8px;letter-spacing:4px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:18px;color:#ffffff40;margin-top:8px;">${CTA}</div>
        </div>
        <div style="display:flex;gap:8px;padding:0 20px;height:680px;flex-shrink:0;">
          <div style="flex:1;overflow:hidden;"><img src="${p}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;"><img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/></div>
        </div>
        <div style="flex:1;overflow:hidden;margin:8px 20px 20px;">
          <img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
      </div>`

    // 2: DIAGONAL SPLIT — dark top-left triangle with text, photo fills rest via clip-path
    case 2: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#111;">
        <div style="position:absolute;inset:0;overflow:hidden;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;top:0;left:0;width:1080px;height:1920px;background:#111;clip-path:polygon(0 0, 100% 0, 0 55%);display:flex;flex-direction:column;justify-content:flex-start;padding:80px 60px;">
          <div style="font-family:${SERIF};font-size:${cs(120,city)}px;font-weight:bold;font-style:italic;color:#c9a84c;line-height:0.9;">${C}</div>
          ${PH('#c9a84c80', SERIF)}
          <div style="font-family:${SERIF};font-size:40px;color:#f5e6c8;letter-spacing:6px;margin-top:16px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SERIF};font-size:20px;color:#c9a84c60;margin-top:14px;font-style:italic;">${CTA}</div>
        </div>
      </div>`

    // 3: TWO LANDSCAPE ROWS — text header, two stacked landscape photos with gap
    case 3: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#f5f0e8;display:flex;flex-direction:column;">
        <div style="padding:60px 60px 30px;flex-shrink:0;">
          <div style="font-family:${DISPLAY};font-size:${cs(120,city)}px;color:#111;line-height:0.85;">${C}</div>
          ${PH('rgba(0,0,0,0.35)', DISPLAY)}
          <div style="font-family:${DISPLAY};font-size:50px;color:#e63946;margin-top:6px;">FREE PHOTO SHOOT</div>
          <div style="width:100%;height:3px;background:#111;margin-top:16px;"></div>
          <div style="font-family:${SANS};font-size:18px;color:#999;margin-top:10px;">${CTA}</div>
        </div>
        <div style="height:520px;overflow:hidden;margin:0 40px;flex-shrink:0;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="flex:1;overflow:hidden;margin:16px 40px 40px;">
          <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
      </div>`

    // 4: STACKED CARDS — three portrait photos as offset polaroid-style cards, text at top
    case 4: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#1a1614;">
        <div style="position:absolute;top:60px;left:60px;right:60px;z-index:10;">
          <div style="font-family:${SERIF};font-size:${cs(100,city)}px;font-weight:bold;font-style:italic;color:white;">${C}</div>
          ${PH('rgba(255,255,255,0.4)')}
          <div style="font-family:${FUTURA};font-size:44px;font-weight:bold;color:white;letter-spacing:4px;margin-top:6px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:20px;color:rgba(255,255,255,0.35);margin-top:10px;">${CTA}</div>
        </div>
        <div style="position:absolute;top:320px;left:40px;width:420px;height:560px;background:white;padding:16px;transform:rotate(-8deg);box-shadow:0 12px 40px rgba(0,0,0,0.5);">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;top:400px;left:340px;width:420px;height:560px;background:white;padding:16px;transform:rotate(5deg);box-shadow:0 12px 40px rgba(0,0,0,0.5);">
          <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;top:1060px;left:160px;width:700px;height:640px;background:white;padding:20px;transform:rotate(-2deg);box-shadow:0 16px 50px rgba(0,0,0,0.5);">
          <img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
      </div>`

    // 5: VERTICAL TRIPTYCH — three portrait photos in tall vertical strips, text rotated on left
    case 5: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
        <div style="position:absolute;top:60px;left:60px;right:60px;z-index:10;">
          <div style="font-family:${FUTURA};font-size:${cs(90,city)}px;font-weight:bold;color:#fff;line-height:0.9;text-shadow:0 4px 20px rgba(0,0,0,0.9);">${C}</div>
          ${PH('rgba(255,255,255,0.5)', FUTURA)}
          <div style="font-family:${FUTURA};font-size:38px;font-weight:bold;color:#00fff7;letter-spacing:4px;margin-top:8px;text-shadow:0 2px 10px rgba(0,0,0,0.9);">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:18px;color:rgba(255,255,255,0.4);margin-top:10px;text-shadow:0 2px 8px rgba(0,0,0,0.9);">${CTA}</div>
        </div>
        <div style="display:flex;height:100%;gap:6px;padding:280px 20px 20px;">
          <div style="flex:1;overflow:hidden;"><img src="${p}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;"><img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;"><img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/></div>
        </div>
      </div>`

    // 6: BAUHAUS COLOR BLOCKS — red/blue/yellow blocks with text, photo in reserved space
    case 6: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#f5f0e8;">
        <div style="position:absolute;top:0;left:0;width:1080px;height:300px;background:#e63946;display:flex;align-items:flex-end;padding:0 60px 30px;">
          <div>
            <div style="font-family:${FUTURA};font-size:${cs(100,city)}px;font-weight:bold;color:#fff;line-height:0.9;">${C}</div>
            ${PH('#ffffffcc', FUTURA)}
          </div>
        </div>
        <div style="position:absolute;top:300px;left:0;width:540px;height:60px;background:#1d3557;display:flex;align-items:center;padding:0 60px;">
          <div style="font-family:${FUTURA};font-size:28px;font-weight:bold;color:#f1faee;letter-spacing:4px;">FREE PHOTO SHOOT</div>
        </div>
        <div style="position:absolute;top:300px;right:0;width:540px;height:60px;background:#f1c40f;"></div>
        <div style="position:absolute;top:380px;left:30px;width:500px;height:750px;overflow:hidden;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;top:380px;right:30px;width:500px;height:750px;overflow:hidden;">
          <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;top:1160px;left:30px;right:30px;height:700px;overflow:hidden;">
          <img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;bottom:540px;right:60px;font-family:${SANS};font-size:18px;color:#999;">${CTA}</div>
      </div>`

    // 7: ASYMMETRIC GRID — large photo left, two smaller stacked right, text between
    case 7: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#111;display:flex;flex-direction:column;">
        <div style="padding:50px 50px 30px;flex-shrink:0;">
          <div style="font-family:${AVENIR};font-size:${cs(100,city)}px;font-weight:200;color:#fff;letter-spacing:8px;line-height:0.95;">${C}</div>
          ${PH('#ffffff40', AVENIR)}
          <div style="font-family:${AVENIR};font-size:34px;font-weight:600;color:#fff;letter-spacing:6px;margin-top:10px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${AVENIR};font-size:18px;font-weight:300;color:#ffffff40;margin-top:10px;">${CTA}</div>
        </div>
        <div style="flex:1;display:flex;gap:10px;padding:0 20px 20px;overflow:hidden;">
          <div style="flex:2;overflow:hidden;">
            <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <div style="flex:1;display:flex;flex-direction:column;gap:10px;">
            <div style="flex:1;overflow:hidden;"><img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/></div>
            <div style="flex:1;overflow:hidden;"><img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/></div>
          </div>
        </div>
      </div>`

    // 8: POP ART GRID — bright yellow, 2x2 grid of the same photo with different tints
    case 8: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#ffe100;">
        <div style="padding:60px 60px 20px;">
          <div style="font-family:${DISPLAY};font-size:${cs(110,city)}px;color:#111;line-height:0.9;-webkit-text-stroke:3px #111;">${C}</div>
          ${PH('#111', DISPLAY)}
          <div style="font-family:${DISPLAY};font-size:52px;color:#e00;margin-top:6px;-webkit-text-stroke:2px #e00;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:20px;color:#111;font-weight:bold;margin-top:8px;">${CTA}</div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:16px 30px 30px;height:1400px;">
          <div style="overflow:hidden;border:5px solid #111;"><img src="${p}" style="width:100%;height:100%;object-fit:cover;filter:saturate(2) hue-rotate(0deg);"/></div>
          <div style="overflow:hidden;border:5px solid #111;"><img src="${p}" style="width:100%;height:100%;object-fit:cover;filter:saturate(2) hue-rotate(90deg);"/></div>
          <div style="overflow:hidden;border:5px solid #111;"><img src="${p}" style="width:100%;height:100%;object-fit:cover;filter:saturate(2) hue-rotate(180deg);"/></div>
          <div style="overflow:hidden;border:5px solid #111;"><img src="${p}" style="width:100%;height:100%;object-fit:cover;filter:saturate(2) hue-rotate(270deg);"/></div>
        </div>
      </div>`

    // 9: HORIZONTAL BAND — photo as wide landscape strip across the middle, text above and below
    case 9: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#0d0015;">
        <div style="padding:120px 60px 40px;text-align:center;">
          <div style="font-family:${FUTURA};font-size:${cs(130,city)}px;font-weight:bold;color:#00fff7;text-shadow:0 0 40px #00fff7,0 0 80px #00fff740;line-height:0.9;">${C}</div>
          ${PH('#ff00ff', FUTURA)}
          <div style="font-family:${FUTURA};font-size:48px;font-weight:bold;color:#ff00ff;text-shadow:0 0 20px #ff00ff;margin-top:16px;letter-spacing:4px;">FREE PHOTO SHOOT</div>
        </div>
        <div style="height:600px;overflow:hidden;margin:40px 0;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="padding:40px 60px;text-align:center;">
          <div style="font-family:${SANS};font-size:22px;color:#00fff780;">${CTA}</div>
          <div style="display:flex;justify-content:center;gap:16px;margin-top:30px;">
            <div style="width:12px;height:12px;border-radius:50%;background:#ff00ff;box-shadow:0 0 10px #ff00ff;"></div>
            <div style="width:12px;height:12px;border-radius:50%;background:#00fff7;box-shadow:0 0 10px #00fff7;"></div>
            <div style="width:12px;height:12px;border-radius:50%;background:#ff00ff;box-shadow:0 0 10px #ff00ff;"></div>
          </div>
        </div>
      </div>`

    // 10: SWISS POSTER — strict grid, red bar, two portrait photos side by side below
    case 10: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#fff;">
        <div style="height:8px;background:#e00;"></div>
        <div style="padding:50px 70px 20px;">
          <div style="font-family:${SANS};font-size:${cs(140,city)}px;font-weight:700;color:#111;line-height:0.88;letter-spacing:-3px;">${C}</div>
          ${PH('#999')}
          <div style="height:3px;background:#e00;margin:20px 0;width:120px;"></div>
          <div style="display:flex;justify-content:space-between;align-items:baseline;">
            <div style="font-family:${SANS};font-size:36px;font-weight:300;color:#333;letter-spacing:4px;">FREE PHOTO SHOOT</div>
            <div style="font-family:${SANS};font-size:16px;color:#999;">${CTA}</div>
          </div>
        </div>
        <div style="display:flex;gap:16px;padding:20px 40px 40px;flex:1;height:1340px;">
          <div style="flex:1;overflow:hidden;"><img src="${p}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;"><img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/></div>
        </div>
      </div>`

    // 11: STAIRCASE LAYOUT — three photos at staggered heights, text in top-left
    case 11: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#1a1a2e;">
        <div style="position:absolute;top:60px;left:50px;z-index:10;">
          <div style="font-family:${MONO};font-size:${cs(80,city)}px;font-weight:bold;color:#0f0;text-shadow:0 0 15px #0f0;line-height:0.95;">${C}</div>
          ${PH('#0f080', MONO)}
          <div style="font-family:${MONO};font-size:30px;color:#0f0;margin-top:10px;">FREE_PHOTO_SHOOT</div>
          <div style="font-family:${MONO};font-size:16px;color:#0f050;margin-top:10px;">$ ${CTA}</div>
        </div>
        <div style="position:absolute;top:340px;left:30px;width:320px;height:500px;overflow:hidden;border:1px solid #0f030;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;top:540px;left:380px;width:320px;height:500px;overflow:hidden;border:1px solid #0f030;">
          <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;top:740px;left:730px;width:320px;height:500px;overflow:hidden;border:1px solid #0f030;">
          <img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
      </div>`

    // 12: MAGAZINE SPREAD — editorial layout with large photo, sidebar text, second photo below
    case 12: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#faf8f5;">
        <div style="display:flex;height:900px;">
          <div style="width:380px;padding:60px 40px;display:flex;flex-direction:column;justify-content:flex-end;">
            <div style="font-family:${SERIF};font-size:14px;letter-spacing:6px;color:#999;text-transform:uppercase;">Issue No. 1</div>
            <div style="font-family:${SERIF};font-size:${cs(80,city)}px;font-weight:bold;font-style:italic;color:#111;line-height:0.95;margin-top:10px;">${C}</div>
            ${PH('#999', SERIF)}
            <div style="width:40px;height:2px;background:#e63946;margin:16px 0;"></div>
            <div style="font-family:${SANS};font-size:30px;font-weight:300;color:#333;letter-spacing:3px;">FREE PHOTO SHOOT</div>
            <div style="font-family:${SERIF};font-size:16px;color:#999;font-style:italic;margin-top:12px;">${CTA}</div>
          </div>
          <div style="flex:1;overflow:hidden;">
            <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
        </div>
        <div style="height:1px;background:#ddd;margin:0 40px;"></div>
        <div style="display:flex;gap:16px;padding:20px 40px;height:980px;">
          <div style="flex:1;overflow:hidden;"><img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;"><img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/></div>
        </div>
      </div>`

    // 13: NEON FRAME — photo centered with thick neon border, text above
    case 13: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#0a0a0a;display:flex;flex-direction:column;align-items:center;">
        <div style="padding:80px 60px 30px;text-align:center;flex-shrink:0;">
          <div style="font-family:${FUTURA};font-size:${cs(100,city)}px;font-weight:bold;color:#ff00ff;text-shadow:0 0 30px #ff00ff,0 0 60px #ff00ff60;line-height:0.9;">${C}</div>
          ${PH('#00fff780', FUTURA)}
          <div style="font-family:${FUTURA};font-size:40px;font-weight:bold;color:#00fff7;text-shadow:0 0 20px #00fff7;margin-top:14px;letter-spacing:4px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:18px;color:#ff00ff60;margin-top:12px;">${CTA}</div>
        </div>
        <div style="width:800px;flex:1;margin:10px 0 80px;padding:10px;border:4px solid #ff00ff;box-shadow:0 0 30px #ff00ff60,inset 0 0 30px #ff00ff20;overflow:hidden;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
      </div>`

    // 14: OVERLAPPING GALLERY — three photos overlapping at angles, text in clear top zone
    case 14: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#2d4a3e;">
        <div style="position:absolute;top:60px;left:60px;right:60px;z-index:10;">
          <div style="font-family:${SERIF};font-size:${cs(100,city)}px;font-weight:bold;font-style:italic;color:#e8d5b7;line-height:0.9;">${C}</div>
          ${PH('#e8d5b780', SERIF)}
          <div style="width:60px;height:3px;background:#e8d5b7;margin:16px 0;"></div>
          <div style="font-family:${SERIF};font-size:36px;color:#c4dab8;font-style:italic;">Free Photo Shoot</div>
          <div style="font-family:${SANS};font-size:18px;color:#e8d5b760;margin-top:10px;">${CTA}</div>
        </div>
        <div style="position:absolute;top:420px;left:60px;width:600px;height:800px;overflow:hidden;transform:rotate(-5deg);box-shadow:0 10px 40px rgba(0,0,0,0.4);border:6px solid #e8d5b7;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;top:520px;right:40px;width:500px;height:700px;overflow:hidden;transform:rotate(4deg);box-shadow:0 10px 40px rgba(0,0,0,0.4);border:6px solid #c4dab8;">
          <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;top:1100px;left:200px;width:650px;height:500px;overflow:hidden;transform:rotate(-2deg);box-shadow:0 10px 40px rgba(0,0,0,0.4);border:6px solid #e8d5b7;">
          <img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
      </div>`

    // 15: LETTERBOX — text at top, two wide landscape photos stacked with thin black bars between
    case 15: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#000;display:flex;flex-direction:column;">
        <div style="padding:80px 60px 50px;flex-shrink:0;">
          <div style="font-family:${AVENIR};font-size:${cs(120,city)}px;font-weight:200;color:#fff;letter-spacing:10px;line-height:0.9;">${C}</div>
          ${PH('#ffffff40', AVENIR)}
          <div style="font-family:${AVENIR};font-size:38px;font-weight:600;color:#fff;letter-spacing:6px;margin-top:12px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${AVENIR};font-size:18px;font-weight:300;color:#ffffff40;margin-top:10px;">${CTA}</div>
        </div>
        <div style="height:500px;overflow:hidden;flex-shrink:0;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="height:40px;background:#000;flex-shrink:0;"></div>
        <div style="flex:1;overflow:hidden;">
          <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
      </div>`

    // 16: WINDOW PANES — 3x2 grid of photos with thick white mullions, text at top
    case 16: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#fff;">
        <div style="padding:50px 60px 20px;">
          <div style="font-family:${SERIF};font-size:${cs(90,city)}px;font-weight:bold;color:#111;line-height:1;">${C}</div>
          ${PH('#999')}
          <div style="font-family:${SANS};font-size:36px;font-weight:600;color:#111;margin-top:8px;letter-spacing:2px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:18px;color:#999;margin-top:8px;">${CTA}</div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(2,1fr);gap:20px;padding:20px 40px 40px;height:1480px;">
          <div style="overflow:hidden;"><img src="${p}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="overflow:hidden;"><img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="overflow:hidden;"><img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="overflow:hidden;"><img src="${p3}" style="width:100%;height:100%;object-fit:cover;filter:grayscale(1);"/></div>
          <div style="overflow:hidden;"><img src="${p}" style="width:100%;height:100%;object-fit:cover;filter:grayscale(1);"/></div>
          <div style="overflow:hidden;"><img src="${p2}" style="width:100%;height:100%;object-fit:cover;filter:grayscale(1);"/></div>
        </div>
      </div>`

    // 17: HERO + THUMBNAILS — right-aligned text bar, big photo left, 3 small thumbnails below
    case 17: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#222;">
        <div style="display:flex;height:1300px;">
          <div style="flex:1;overflow:hidden;">
            <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <div style="width:350px;background:#e63946;display:flex;flex-direction:column;justify-content:center;padding:40px;">
            <div style="font-family:${FUTURA};font-size:${cs(68,city)}px;font-weight:bold;color:#fff;line-height:0.95;">${C}</div>
            ${PH('#ffffffcc', FUTURA)}
            <div style="width:40px;height:4px;background:#fff;margin:16px 0;"></div>
            <div style="font-family:${FUTURA};font-size:24px;font-weight:bold;color:#fff;letter-spacing:2px;line-height:1.3;">FREE<br/>PHOTO<br/>SHOOT</div>
            <div style="font-family:${SANS};font-size:14px;color:#ffffffaa;margin-top:16px;">${CTA}</div>
          </div>
        </div>
        <div style="display:flex;gap:8px;padding:8px 20px 20px;height:600px;">
          <div style="flex:1;overflow:hidden;"><img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;"><img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;"><img src="${p}" style="width:100%;height:100%;object-fit:cover;filter:grayscale(1) contrast(1.2);"/></div>
        </div>
      </div>`

    // 18: SPLIT DIAGONAL — two photos split by a diagonal line, text in top-left corner
    case 18: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
        <div style="position:absolute;inset:0;clip-path:polygon(0 0, 100% 0, 0 100%);">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;inset:0;clip-path:polygon(100% 0, 100% 100%, 0 100%);">
          <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;top:0;left:0;right:0;height:400px;background:linear-gradient(180deg,rgba(0,0,0,0.85) 0%,transparent 100%);"></div>
        <div style="position:absolute;top:60px;left:60px;">
          <div style="font-family:${DISPLAY};font-size:${cs(110,city)}px;color:#fff;line-height:0.9;text-shadow:0 4px 20px rgba(0,0,0,0.8);">${C}</div>
          ${PH('rgba(255,255,255,0.5)', DISPLAY)}
          <div style="font-family:${SANS};font-size:40px;font-weight:bold;color:#ff4444;margin-top:10px;text-shadow:0 2px 10px rgba(0,0,0,0.8);">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:18px;color:rgba(255,255,255,0.5);margin-top:10px;text-shadow:0 2px 8px rgba(0,0,0,0.8);">${CTA}</div>
        </div>
      </div>`

    // 19: PASSPORT STAMP — beige bg, red circular badge, photo below in "stamp" border
    case 19: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#f5f0e0;">
        <div style="padding:60px;display:flex;align-items:flex-start;gap:30px;">
          <div style="width:260px;height:260px;border-radius:50%;border:6px solid #c0392b;display:flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0;transform:rotate(-12deg);">
            <div style="font-family:${SERIF};font-size:16px;letter-spacing:4px;color:#c0392b;text-transform:uppercase;">Approved</div>
            <div style="font-family:${SERIF};font-size:${cs(48,city)}px;font-weight:bold;color:#c0392b;line-height:0.95;">${C}</div>
            ${PH('#c0392b80', SERIF)}
            <div style="font-family:${SERIF};font-size:14px;color:#c0392b;margin-top:4px;">FREE SHOOT</div>
          </div>
          <div style="padding-top:40px;">
            <div style="font-family:${SERIF};font-size:56px;font-weight:bold;color:#333;line-height:0.95;">Free Photo<br/>Shoot</div>
            <div style="font-family:${SANS};font-size:18px;color:#999;margin-top:14px;">${CTA}</div>
          </div>
        </div>
        <div style="margin:20px 40px;height:700px;overflow:hidden;border:8px dashed #c0392b40;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="display:flex;gap:12px;padding:12px 40px;height:520px;">
          <div style="flex:1;overflow:hidden;border:4px dashed #c0392b20;"><img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;border:4px dashed #c0392b20;"><img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/></div>
        </div>
      </div>`

    // 20: RETRO 80s GRID — gradient bg, chrome text, 2x2 photo grid with rounded corners
    case 20: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:linear-gradient(180deg,#0a001a,#1a0033,#330066);">
        <div style="padding:70px 60px 30px;text-align:center;">
          <div style="font-family:${DISPLAY};font-size:${cs(110,city)}px;color:#ff6ec7;text-shadow:4px 4px 0 #ff00ff,-2px -2px 0 #00ffff,0 0 30px #ff6ec7;line-height:0.9;">${C}</div>
          ${PH('#ff6ec780', DISPLAY)}
          <div style="font-family:${FUTURA};font-size:46px;font-weight:bold;color:#00ffff;text-shadow:0 0 20px #00ffff;margin-top:12px;letter-spacing:4px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:18px;color:#ff6ec780;margin-top:10px;">${CTA}</div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;padding:20px 40px 40px;height:1370px;">
          <div style="overflow:hidden;border-radius:12px;border:2px solid #ff00ff60;"><img src="${p}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="overflow:hidden;border-radius:12px;border:2px solid #00ffff60;"><img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="overflow:hidden;border-radius:12px;border:2px solid #00ffff60;"><img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="overflow:hidden;border-radius:12px;border:2px solid #ff00ff60;"><img src="${p}" style="width:100%;height:100%;object-fit:cover;filter:saturate(1.5) contrast(1.1);"/></div>
        </div>
      </div>`

    // 21: CENTER BAND — text top, wide landscape photo as horizontal band, text bottom
    case 21: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#111;display:flex;flex-direction:column;">
        <div style="flex:1;display:flex;flex-direction:column;justify-content:flex-end;padding:0 60px 30px;">
          <div style="font-family:${DISPLAY};font-size:${cs(160,city)}px;color:#fff;line-height:0.82;letter-spacing:-3px;">${C}</div>
          ${PH('#ffffff40', DISPLAY)}
        </div>
        <div style="height:600px;overflow:hidden;flex-shrink:0;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="flex:1;display:flex;flex-direction:column;justify-content:flex-start;padding:30px 60px 0;">
          <div style="font-family:${DISPLAY};font-size:52px;color:#ff4444;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:20px;color:#ffffff40;margin-top:10px;">${CTA}</div>
        </div>
      </div>`

    // 22: ART DECO TRIPLE — ornate gold header, three photos in arched frames
    case 22: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#1a1611;">
        <div style="padding:70px 60px 30px;text-align:center;">
          <div style="font-family:${SERIF};font-size:18px;letter-spacing:12px;color:#c9a84c;">&#9670; &#9670; &#9670;</div>
          <div style="font-family:${SERIF};font-size:${cs(100,city)}px;font-weight:bold;color:#c9a84c;line-height:0.95;margin-top:8px;">${C}</div>
          ${PH('#c9a84c80', SERIF)}
          <div style="width:200px;height:2px;background:linear-gradient(90deg,transparent,#c9a84c,transparent);margin:16px auto;"></div>
          <div style="font-family:${SERIF};font-size:36px;color:#f5e6c8;letter-spacing:6px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SERIF};font-size:18px;color:#c9a84c60;margin-top:10px;font-style:italic;">${CTA}</div>
        </div>
        <div style="display:flex;gap:20px;padding:30px 50px 50px;height:1330px;">
          <div style="flex:1;overflow:hidden;border-radius:300px 300px 0 0;border:3px solid #c9a84c;">
            <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <div style="flex:1;overflow:hidden;border-radius:300px 300px 0 0;border:3px solid #c9a84c;">
            <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <div style="flex:1;overflow:hidden;border-radius:300px 300px 0 0;border:3px solid #c9a84c;">
            <img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
        </div>
      </div>`

    // 23: TORN PAPER — white text zone, jagged edge, photo below with slight rotation
    case 23: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#111;">
        <div style="position:absolute;top:0;left:0;right:0;background:#f5f0e8;padding:80px 60px 120px;clip-path:polygon(0 0,100% 0,100% calc(100% - 40px),85% 100%,70% calc(100% - 30px),55% 100%,40% calc(100% - 20px),25% 100%,10% calc(100% - 35px),0 100%);">
          <div style="font-family:${SERIF};font-size:${cs(110,city)}px;font-weight:bold;font-style:italic;color:#111;line-height:0.9;">${C}</div>
          ${PH('rgba(0,0,0,0.35)', SERIF)}
          <div style="font-family:${FUTURA};font-size:46px;font-weight:bold;color:#e63946;margin-top:10px;letter-spacing:3px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:20px;color:#999;margin-top:10px;">${CTA}</div>
        </div>
        <div style="position:absolute;top:400px;left:40px;right:40px;bottom:40px;overflow:hidden;transform:rotate(1deg);">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
      </div>`

    // 24: CONTACT SHEET — 3x3 grid, text in center cell
    case 24: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#f5f0e8;">
        <div style="display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(3,1fr);gap:8px;padding:20px;height:1920px;">
          <div style="overflow:hidden;"><img src="${p}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="overflow:hidden;"><img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="overflow:hidden;"><img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="overflow:hidden;"><img src="${p3}" style="width:100%;height:100%;object-fit:cover;filter:grayscale(1);"/></div>
          <div style="background:#111;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;">
            <div style="font-family:${DISPLAY};font-size:${cs(52,city)}px;color:#fff;line-height:0.9;text-align:center;">${C}</div>
            ${PH('#ffffff50', DISPLAY)}
            <div style="font-family:${SANS};font-size:20px;font-weight:bold;color:#e63946;margin-top:8px;text-align:center;">FREE PHOTO SHOOT</div>
            <div style="font-family:${SANS};font-size:12px;color:#666;margin-top:6px;text-align:center;">${CTA}</div>
          </div>
          <div style="overflow:hidden;"><img src="${p}" style="width:100%;height:100%;object-fit:cover;filter:grayscale(1);"/></div>
          <div style="overflow:hidden;"><img src="${p2}" style="width:100%;height:100%;object-fit:cover;filter:sepia(0.5);"/></div>
          <div style="overflow:hidden;"><img src="${p}" style="width:100%;height:100%;object-fit:cover;filter:sepia(0.5);"/></div>
          <div style="overflow:hidden;"><img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/></div>
        </div>
      </div>`

    // 25: VERTICAL SPLIT THREE — three vertical columns: text panel, photo, photo
    case 25: return `
      <div style="width:1080px;height:1920px;overflow:hidden;display:flex;">
        <div style="width:340px;background:#2d4a3e;display:flex;flex-direction:column;justify-content:center;padding:40px 30px;">
          <div style="font-family:${SERIF};font-size:${cs(64,city)}px;font-weight:bold;font-style:italic;color:#e8d5b7;line-height:0.95;">${C}</div>
          ${PH('#e8d5b780', SERIF)}
          <div style="width:40px;height:3px;background:#e8d5b7;margin:20px 0;"></div>
          <div style="font-family:${SERIF};font-size:24px;color:#c4dab8;font-style:italic;line-height:1.3;">Free<br/>Photo<br/>Shoot</div>
          <div style="font-family:${SANS};font-size:14px;color:#e8d5b760;margin-top:20px;">${CTA}</div>
        </div>
        <div style="flex:1;overflow:hidden;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="flex:1;overflow:hidden;">
          <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
      </div>`

    // 26: BIG + SMALL — one massive photo top 2/3, text bar, two small thumbnails
    case 26: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#000;display:flex;flex-direction:column;">
        <div style="height:1100px;overflow:hidden;flex-shrink:0;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="padding:24px 50px;flex-shrink:0;display:flex;justify-content:space-between;align-items:center;background:#111;">
          <div>
            <div style="font-family:${FUTURA};font-size:${cs(56,city)}px;font-weight:bold;color:#fff;line-height:1;">${C} <span style="color:#ff4444;">FREE PHOTO SHOOT</span></div>
            ${PH('#ffffff40', FUTURA)}
          </div>
        </div>
        <div style="font-family:${SANS};font-size:16px;color:#666;padding:8px 50px;flex-shrink:0;">${CTA}</div>
        <div style="flex:1;display:flex;gap:8px;padding:8px 20px 20px;">
          <div style="flex:1;overflow:hidden;"><img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;"><img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/></div>
        </div>
      </div>`

    // 27: HORIZONTAL TRIPTYCH — text top, three landscape photos stacked with thin gaps
    case 27: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#0c0c0c;display:flex;flex-direction:column;">
        <div style="padding:60px 60px 30px;flex-shrink:0;">
          <div style="font-family:${SANS};font-size:16px;letter-spacing:8px;color:#666;">${C}, PHILIPPINES</div>
          <div style="font-family:${SANS};font-size:${cs(80,city)}px;font-weight:800;color:#fff;line-height:1;margin-top:10px;">FREE PHOTO<br/>SHOOT</div>
          <div style="font-family:${SANS};font-size:18px;color:#666;margin-top:12px;">${CTA}</div>
        </div>
        <div style="flex:1;display:flex;flex-direction:column;gap:6px;padding:10px 30px 30px;">
          <div style="flex:1;overflow:hidden;"><img src="${p}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;"><img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="flex:1;overflow:hidden;"><img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/></div>
        </div>
      </div>`

    // 28: FLOATING CARD — dark bg, white card with text floating over large photo
    case 28: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
        <div style="position:absolute;top:300px;left:0;right:0;bottom:0;overflow:hidden;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;top:60px;left:60px;width:500px;background:#fff;padding:50px;box-shadow:0 20px 60px rgba(0,0,0,0.4);z-index:10;">
          <div style="font-family:${SERIF};font-size:${cs(80,city)}px;font-weight:bold;font-style:italic;color:#111;line-height:0.95;">${C}</div>
          ${PH('#999', SERIF)}
          <div style="width:40px;height:3px;background:#e63946;margin:16px 0;"></div>
          <div style="font-family:${FUTURA};font-size:32px;font-weight:bold;color:#111;letter-spacing:3px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:16px;color:#999;margin-top:12px;">${CTA}</div>
        </div>
        <div style="position:absolute;bottom:40px;right:40px;width:380px;height:500px;overflow:hidden;border:4px solid #fff;box-shadow:0 10px 30px rgba(0,0,0,0.5);">
          <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
      </div>`

    // 29: DUOTONE SPLIT — same photo twice, one normal one B&W, with text divider
    case 29: return `
      <div style="width:1080px;height:1920px;overflow:hidden;background:#111;display:flex;flex-direction:column;">
        <div style="height:750px;overflow:hidden;flex-shrink:0;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;filter:grayscale(1) contrast(1.2);"/>
        </div>
        <div style="padding:30px 60px;flex-shrink:0;background:#111;display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="font-family:${DISPLAY};font-size:${cs(80,city)}px;color:#fff;line-height:0.9;">${C}</div>
            ${PH('#ffffff40', DISPLAY)}
          </div>
          <div style="text-align:right;">
            <div style="font-family:${SANS};font-size:32px;font-weight:bold;color:#ff4444;">FREE PHOTO SHOOT</div>
            <div style="font-family:${SANS};font-size:16px;color:#ffffff40;margin-top:6px;">${CTA}</div>
          </div>
        </div>
        <div style="flex:1;overflow:hidden;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
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
