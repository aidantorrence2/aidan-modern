import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, 'output-v2')
const IMG_DIR = '/Volumes/PortableSSD/Exports/film scans selected'

fs.mkdirSync(OUT, { recursive: true })

function img(filename) {
  const buf = fs.readFileSync(path.join(IMG_DIR, filename))
  return `data:image/jpeg;base64,${buf.toString('base64')}`
}

// Landscape filenames
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

// Variants with landscape-oriented containers
const LANDSCAPE_VARIANTS = new Set([0,1,2,6,9,10,13,19,23,29,35,42,50,58,65,72,80,88,95])

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
  const bg = `<img src="${p}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;"`

  switch (variant) {

    // 0: PHOTO BOOTH STRIP
    case 0: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#1a0808;">
        <div style="position:absolute;inset:0;background:linear-gradient(180deg,#3d0c0c 0%,#6b1a1a 30%,#4a1212 70%,#2a0808 100%);"></div>
        <div style="position:absolute;inset:0;background:repeating-linear-gradient(90deg,rgba(0,0,0,0.15) 0px,transparent 2px,transparent 35px);"></div>
        <div style="position:absolute;top:0;left:0;right:0;height:20px;background:linear-gradient(180deg,#c4974a,#a0763c,#6b4f2a);box-shadow:0 4px 12px rgba(0,0,0,0.5);z-index:2;"></div>
        <div style="position:absolute;top:40px;left:60px;right:60px;">
          <div style="font-family:${SERIF};font-size:${cs(100,city)}px;font-weight:bold;font-style:italic;color:#FFD700;text-shadow:0 4px 12px rgba(0,0,0,0.8);">${C}</div>
          ${PH('rgba(255,215,0,0.5)')}
          <div style="font-family:${FUTURA};font-size:46px;font-weight:bold;color:white;letter-spacing:6px;margin-top:4px;">FREE PHOTO SHOOT</div>
        </div>
        <div style="position:absolute;top:260px;left:200px;width:680px;background:white;border-radius:8px;padding:24px;box-shadow:0 20px 60px rgba(0,0,0,0.6);transform:rotate(-2deg);">
          <div style="width:100%;height:340px;overflow:hidden;margin-bottom:16px;"><img src="${p}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="width:100%;height:340px;overflow:hidden;margin-bottom:16px;"><img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="width:100%;height:340px;overflow:hidden;"><img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="text-align:center;padding:16px 0 4px;font-family:${MONO};font-size:20px;color:#888;letter-spacing:2px;">PHOTO BOOTH — ${C}</div>
        </div>
        <div style="position:absolute;bottom:540px;left:60px;font-family:${SANS};font-size:22px;color:rgba(255,255,255,0.4);">${CTA}</div>
      </div>`

    // 1: POLAROID
    case 1: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#1a1614;">
        <div style="position:absolute;inset:0;background:linear-gradient(160deg,#2a2420,#1a1614,#0f0d0c);"></div>
        <div style="position:absolute;top:60px;left:60px;right:60px;">
          <div style="font-family:${SERIF};font-size:${cs(130,city)}px;font-weight:bold;font-style:italic;color:white;text-shadow:0 4px 16px rgba(0,0,0,0.6);">${C}</div>
          ${PH('rgba(255,255,255,0.4)')}
          <div style="font-family:${FUTURA};font-size:50px;font-weight:bold;color:white;letter-spacing:6px;margin-top:8px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:22px;color:rgba(255,255,255,0.4);margin-top:10px;">${CTA}</div>
        </div>
        <div style="position:absolute;top:380px;left:60px;width:260px;background:white;padding:14px 14px 44px;transform:rotate(-12deg);box-shadow:0 8px 30px rgba(0,0,0,0.4);">
          <img src="${p2}" style="width:100%;height:180px;object-fit:cover;"/>
        </div>
        <div style="position:absolute;top:460px;right:40px;width:260px;background:white;padding:14px 14px 44px;transform:rotate(8deg);box-shadow:0 8px 30px rgba(0,0,0,0.4);">
          <img src="${p3}" style="width:100%;height:180px;object-fit:cover;"/>
        </div>
        <div style="position:absolute;top:700px;left:130px;width:820px;background:white;padding:24px 24px 80px;transform:rotate(2deg);box-shadow:0 20px 60px rgba(0,0,0,0.5);">
          <img src="${p}" style="width:100%;height:680px;object-fit:cover;"/>
          <div style="font-family:${SERIF};font-size:38px;font-style:italic;color:#333;margin-top:14px;text-align:center;">free photo shoot</div>
        </div>
      </div>`

    // 2: FILM STRIP
    case 2: {
      const sprockets = Array.from({length:22}, (_,i) =>
        `<div style="position:absolute;top:${i*88}px;width:40px;height:52px;background:#111;border-radius:6px;"></div>`
      ).join('')
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#111;">
        <div style="position:absolute;top:0;left:60px;right:60px;bottom:0;background:#1a1a1a;"></div>
        <div style="position:absolute;top:0;left:14px;">${sprockets}</div>
        <div style="position:absolute;top:0;right:14px;">${sprockets}</div>
        <div style="position:absolute;top:60px;left:100px;right:100px;text-align:center;">
          <div style="font-family:${SERIF};font-size:${cs(130,city)}px;font-weight:bold;font-style:italic;color:white;">${C}</div>
          ${PH('rgba(255,255,255,0.4)')}
          <div style="font-family:${FUTURA};font-size:56px;font-weight:bold;color:#FF6600;letter-spacing:6px;margin-top:4px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${MONO};font-size:20px;color:rgba(255,102,0,0.5);margin-top:12px;">${CTA}</div>
        </div>
        <div style="position:absolute;top:420px;left:100px;right:100px;height:560px;overflow:hidden;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;top:390px;left:110px;font-family:${MONO};font-size:18px;color:#FF6600;letter-spacing:2px;">36A  KODAK 400TX</div>
        <div style="position:absolute;top:1040px;left:100px;right:100px;height:560px;overflow:hidden;">
          <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;top:1010px;left:110px;font-family:${MONO};font-size:18px;color:#FF6600;">37A  KODAK 400TX</div>
      </div>`
    }

    // 3: CONTACT SHEET
    case 3: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#f5f0e8;">
        <div style="position:absolute;top:50px;left:50px;right:50px;display:flex;justify-content:space-between;align-items:flex-end;">
          <div>
            <div style="font-family:${SERIF};font-size:${cs(100,city)}px;font-weight:bold;font-style:italic;color:#111;">${C}</div>
            ${PH('rgba(0,0,0,0.35)')}
            <div style="font-family:${FUTURA};font-size:48px;font-weight:bold;color:#E63946;letter-spacing:4px;">FREE PHOTO SHOOT</div>
          </div>
          <div style="font-family:${SERIF};font-size:32px;font-style:italic;color:#E63946;transform:rotate(-8deg);">selects</div>
        </div>
        <div style="position:absolute;top:300px;left:50px;right:50px;display:grid;grid-template-columns:repeat(3,1fr);gap:12px;">
          ${[p,p2,p3,p,p2,p3,p,p2,p3].map((ph,i) => `
            <div style="position:relative;height:420px;overflow:hidden;">
              <img src="${ph}" style="width:100%;height:100%;object-fit:cover;filter:contrast(1.1);"/>
              <div style="position:absolute;top:4px;left:6px;font-family:${MONO};font-size:14px;color:rgba(255,102,0,0.8);">${i+32}A</div>
              ${i===1||i===5||i===7 ? `<div style="position:absolute;inset:8px;border:4px solid #E63946;border-radius:50%;"></div>` : ''}
            </div>
          `).join('')}
        </div>
        <div style="position:absolute;bottom:540px;left:50px;font-family:${SANS};font-size:22px;color:#999;">${CTA}</div>
      </div>`

    // 4: VHS TAPE
    case 4: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
        ${bg}/>
        <div style="position:absolute;inset:0;background:repeating-linear-gradient(180deg,transparent 0px,rgba(0,0,0,0.12) 1px,transparent 2px,transparent 3px);pointer-events:none;"></div>
        <div style="position:absolute;inset:0;background:radial-gradient(ellipse at center,transparent 50%,rgba(0,0,0,0.6) 100%);"></div>
        <div style="position:absolute;top:60px;left:60px;display:flex;align-items:center;gap:14px;">
          <div style="width:20px;height:20px;border-radius:50%;background:#FF0000;box-shadow:0 0 12px rgba(255,0,0,0.8);"></div>
          <div style="font-family:${MONO};font-size:28px;font-weight:bold;color:white;text-shadow:0 0 8px rgba(255,255,255,0.5);">REC</div>
        </div>
        <div style="position:absolute;top:60px;right:60px;font-family:${MONO};font-size:24px;color:rgba(255,255,255,0.7);">03:14:22 PM</div>
        <div style="position:absolute;top:200px;left:60px;right:60px;">
          <div style="font-family:${DISPLAY};font-size:${cs(200,city)}px;color:white;text-transform:uppercase;line-height:0.85;text-shadow:0 4px 8px rgba(0,0,0,0.8);">${C}</div>
          ${PH('rgba(255,255,255,0.5)', MONO)}
          <div style="font-family:${FUTURA};font-size:68px;font-weight:bold;color:white;letter-spacing:6px;margin-top:12px;text-shadow:0 2px 6px rgba(0,0,0,0.8);">FREE PHOTO SHOOT</div>
          <div style="font-family:${MONO};font-size:22px;color:rgba(255,255,255,0.5);margin-top:16px;">${CTA}</div>
        </div>
      </div>`

    // 5: SLOT MACHINE
    case 5: {
      const leds = Array.from({length:30}, (_,i) => {
        const col = ['#FFD700','#FF1744','#FF8800'][i%3]
        const glow = ['rgba(255,215,0,0.6)','rgba(255,23,68,0.6)','rgba(255,136,0,0.6)'][i%3]
        if (i < 15) return `<div style="position:absolute;top:${i*90+120}px;left:18px;width:14px;height:14px;border-radius:50%;background:${col};box-shadow:0 0 8px ${glow};"></div>`
        return `<div style="position:absolute;top:${(i-15)*90+120}px;right:18px;width:14px;height:14px;border-radius:50%;background:${col};box-shadow:0 0 8px ${glow};"></div>`
      }).join('')
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:linear-gradient(160deg,#2a1a00,#1a1000,#0d0800);">
        ${leds}
        <div style="position:absolute;top:60px;left:50px;right:50px;height:8px;background:linear-gradient(90deg,#8B7355,#D4AF37,#FFD700,#D4AF37,#8B7355);border-radius:4px;"></div>
        <div style="position:absolute;top:90px;left:50px;right:50px;text-align:center;">
          <div style="font-family:${DISPLAY};font-size:80px;color:#FFD700;text-shadow:0 0 20px rgba(255,215,0,0.5),0 4px 8px rgba(0,0,0,0.8);letter-spacing:8px;">FREE SHOOT</div>
        </div>
        <div style="position:absolute;top:220px;left:60px;right:60px;text-align:center;">
          <div style="font-family:${SERIF};font-size:${cs(150,city)}px;font-weight:bold;font-style:italic;color:#FFD700;text-shadow:0 0 30px rgba(255,215,0,0.4);">${C}</div>
          ${PH('rgba(255,215,0,0.4)')}
          <div style="font-family:${FUTURA};font-size:60px;font-weight:bold;color:white;letter-spacing:6px;margin-top:8px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:22px;color:rgba(255,215,0,0.4);margin-top:14px;">${CTA}</div>
        </div>
        <div style="position:absolute;top:640px;left:80px;right:80px;display:flex;gap:20px;">
          ${[p,p2,p3].map(ph => `
            <div style="flex:1;height:500px;border:4px solid #FFD700;border-radius:8px;overflow:hidden;box-shadow:inset 0 0 20px rgba(0,0,0,0.5);">
              <img src="${ph}" style="width:100%;height:100%;object-fit:cover;"/>
            </div>
          `).join('')}
        </div>
      </div>`
    }

    // 6: TETRIS
    case 6: {
      const colors = ['#00f0f0','#f0f000','#a000f0','#00f000','#f00000','#0000f0','#f0a000']
      const blocks = Array.from({length:24}, (_,i) => {
        const x = (i % 12) * 90
        const y = Math.floor(i / 12) * 90 + 1560
        const c = colors[i % 7]
        return `<div style="position:absolute;left:${x}px;top:${y}px;width:88px;height:88px;background:${c};border:3px solid rgba(255,255,255,0.3);border-right-color:rgba(0,0,0,0.3);border-bottom-color:rgba(0,0,0,0.3);"></div>`
      }).join('')
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#0a0a0a;">
        <div style="position:absolute;inset:0;background:repeating-linear-gradient(90deg,rgba(255,255,255,0.04) 0px,transparent 1px,transparent 90px),repeating-linear-gradient(180deg,rgba(255,255,255,0.04) 0px,transparent 1px,transparent 90px);"></div>
        <div style="position:absolute;top:60px;right:60px;text-align:right;">
          <div style="font-family:${MONO};font-size:22px;color:rgba(255,255,255,0.4);">SCORE</div>
          <div style="font-family:${MONO};font-size:42px;font-weight:bold;color:#00f0f0;text-shadow:0 0 10px rgba(0,240,240,0.5);">099999</div>
        </div>
        <div style="position:absolute;top:200px;left:60px;right:60px;text-align:center;">
          <div style="font-family:${MONO};font-size:${cs(120,city)}px;font-weight:bold;color:white;text-shadow:0 0 20px rgba(0,240,240,0.4);">${C}</div>
          ${PH('rgba(0,240,240,0.35)', MONO)}
          <div style="font-family:${MONO};font-size:48px;font-weight:bold;color:#00f0f0;margin-top:8px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${MONO};font-size:18px;color:rgba(0,240,240,0.35);margin-top:14px;">${CTA}</div>
        </div>
        <div style="position:absolute;top:560px;left:90px;right:90px;height:700px;border:4px solid rgba(255,255,255,0.2);overflow:hidden;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        ${blocks}
      </div>`
    }

    // 7: MAGAZINE COVER
    case 7: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
        ${bg} filter:saturate(1.15) contrast(1.05);"/>
        <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0.6) 0%,transparent 25%,transparent 50%,rgba(0,0,0,0.3) 80%,rgba(0,0,0,0.5) 100%);"></div>
        <div style="position:absolute;top:50px;left:60px;right:60px;display:flex;justify-content:space-between;align-items:flex-start;">
          <div>
            <div style="font-family:${FUTURA};font-size:22px;font-weight:bold;color:rgba(255,255,255,0.6);letter-spacing:10px;">ISSUE 47 - 2026</div>
            <div style="font-family:${SERIF};font-size:100px;font-weight:bold;font-style:italic;color:white;line-height:0.85;margin-top:4px;">AIDAN</div>
          </div>
        </div>
        <div style="position:absolute;top:800px;left:60px;right:60px;">
          <div style="font-family:${FUTURA};font-size:36px;font-weight:bold;color:white;letter-spacing:4px;margin-bottom:12px;">EXCLUSIVE</div>
          <div style="font-family:${SERIF};font-size:${cs(150,city)}px;font-weight:bold;font-style:italic;color:white;line-height:0.82;">${C}</div>
          ${PH('rgba(255,255,255,0.4)')}
          <div style="font-family:${FUTURA};font-size:64px;font-weight:bold;color:#FF4444;letter-spacing:4px;margin-top:12px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:24px;color:rgba(255,255,255,0.5);margin-top:16px;">${CTA}</div>
        </div>
      </div>`

    // 8: MOVIE POSTER
    case 8: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
        <div style="position:absolute;top:0;left:0;right:0;height:120px;background:#000;display:flex;align-items:flex-end;padding:0 60px 16px;">
          <div style="font-family:${FUTURA};font-size:24px;color:rgba(255,255,255,0.5);letter-spacing:12px;">A MADEBYAIDAN PRODUCTION</div>
        </div>
        <div style="position:absolute;top:140px;left:60px;right:60px;">
          <div style="font-family:${SERIF};font-size:${cs(160,city)}px;font-weight:bold;font-style:italic;color:white;line-height:0.82;">${C}</div>
          ${PH('rgba(255,255,255,0.4)')}
          <div style="font-family:${FUTURA};font-size:62px;font-weight:bold;color:#FFD700;letter-spacing:6px;margin-top:12px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:22px;color:rgba(255,255,255,0.4);margin-top:12px;">${CTA}</div>
        </div>
        <div style="position:absolute;top:560px;left:0;right:0;bottom:0;overflow:hidden;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;filter:saturate(1.1) contrast(1.05);"/>
          <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0.5) 0%,transparent 30%);"></div>
        </div>
      </div>`

    // 9: GIG POSTER
    case 9: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#F5F0E0;">
        <div style="position:absolute;top:40px;left:50px;right:50px;">
          <div style="font-family:${DISPLAY};font-size:${cs(160,city)}px;color:#111;text-transform:uppercase;line-height:0.82;">${C}</div>
          ${PH('rgba(0,0,0,0.35)')}
          <div style="font-family:${DISPLAY};font-size:72px;color:#E63946;text-transform:uppercase;letter-spacing:2px;margin-top:4px;">FREE PHOTO SHOOT</div>
        </div>
        <div style="position:absolute;top:380px;left:0;right:0;height:600px;overflow:hidden;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;filter:contrast(1.3) saturate(0.8);"/>
        </div>
        <div style="position:absolute;top:1020px;left:50px;right:50px;">
          <div style="width:100%;height:3px;background:#111;margin-bottom:24px;"></div>
          <div style="display:flex;justify-content:space-between;">
            <div>
              <div style="font-family:${FUTURA};font-size:38px;font-weight:bold;color:#111;letter-spacing:4px;">WHEN</div>
              <div style="font-family:${SERIF};font-size:32px;font-style:italic;color:#555;">Anytime you want</div>
              <div style="font-family:${FUTURA};font-size:38px;font-weight:bold;color:#111;letter-spacing:4px;margin-top:16px;">WHERE</div>
              <div style="font-family:${SERIF};font-size:32px;font-style:italic;color:#555;">${city}</div>
              <div style="font-family:${FUTURA};font-size:38px;font-weight:bold;color:#111;letter-spacing:4px;margin-top:16px;">COST</div>
              <div style="font-family:${SERIF};font-size:44px;font-style:italic;color:#E63946;font-weight:bold;">FREE</div>
            </div>
            <div style="text-align:right;">
              <div style="font-family:${MONO};font-size:18px;color:#999;">${CTA}</div>
            </div>
          </div>
        </div>
      </div>`

    // 10: NEWSPAPER
    case 10: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#F5F0E0;">
        <div style="position:absolute;top:0;left:0;right:0;padding:30px 50px 16px;border-bottom:4px double #111;">
          <div style="text-align:center;">
            <div style="font-family:${SERIF};font-size:18px;color:#666;letter-spacing:4px;">THE</div>
            <div style="font-family:${SERIF};font-size:64px;font-weight:bold;font-style:italic;color:#111;line-height:0.9;">${city} Times</div>
            <div style="font-family:${SERIF};font-size:16px;color:#888;margin-top:2px;letter-spacing:2px;">EST. 2026</div>
          </div>
        </div>
        <div style="position:absolute;top:200px;left:50px;right:50px;">
          <div style="font-family:${SERIF};font-size:76px;font-weight:bold;color:#111;line-height:1.0;">Free Photo Shoot Announced in ${city}, Philippines</div>
          <div style="font-family:${SERIF};font-size:22px;font-style:italic;color:#555;margin-top:8px;">Photographer offers complimentary sessions to locals</div>
        </div>
        <div style="position:absolute;top:520px;left:50px;right:50px;height:700px;overflow:hidden;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;filter:contrast(1.1);"/>
        </div>
        <div style="position:absolute;top:1250px;left:50px;right:50px;">
          <div style="font-family:${SERIF};font-size:22px;color:#333;line-height:1.5;column-count:2;column-gap:30px;">
            ${C} — In a move that has stunned the local photography scene, photographer Aidan Torrence has announced free photo shoots for anyone in ${city}. Sessions last 30-60 minutes at scenic locations.
          </div>
        </div>
      </div>`

    // 11: BOARDING PASS
    case 11: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#1a1a2e;">
        ${bg} filter:brightness(0.3) saturate(0.8);"/>
        <div style="position:absolute;top:60px;left:60px;right:60px;text-align:center;">
          <div style="font-family:${SERIF};font-size:${cs(120,city)}px;font-weight:bold;font-style:italic;color:white;text-shadow:0 4px 16px rgba(0,0,0,0.8);">${C}</div>
          ${PH('rgba(255,255,255,0.4)')}
          <div style="font-family:${FUTURA};font-size:50px;font-weight:bold;color:white;letter-spacing:4px;margin-top:8px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:22px;color:rgba(255,255,255,0.4);margin-top:10px;">${CTA}</div>
        </div>
        <div style="position:absolute;top:380px;left:60px;right:60px;background:white;border-radius:16px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.5);">
          <div style="background:#E63946;padding:20px 36px;display:flex;justify-content:space-between;align-items:center;">
            <div style="font-family:${FUTURA};font-size:26px;font-weight:bold;color:white;letter-spacing:6px;">BOARDING PASS</div>
            <div style="font-family:${SANS};font-size:20px;color:rgba(255,255,255,0.8);">CLASS: FREE</div>
          </div>
          <div style="padding:36px;display:flex;justify-content:space-between;align-items:center;">
            <div style="text-align:center;">
              <div style="font-family:${FUTURA};font-size:18px;color:#999;letter-spacing:4px;">FROM</div>
              <div style="font-family:${FUTURA};font-size:64px;font-weight:bold;color:#111;">YOU</div>
            </div>
            <div style="font-family:${SANS};font-size:36px;color:#ccc;">---></div>
            <div style="text-align:center;">
              <div style="font-family:${FUTURA};font-size:18px;color:#999;letter-spacing:4px;">TO</div>
              <div style="font-family:${FUTURA};font-size:${cs(64,city)}px;font-weight:bold;color:#E63946;">${C}</div>
            </div>
          </div>
          <div style="padding:0 36px 24px;display:flex;justify-content:space-between;">
            <div><div style="font-family:${SANS};font-size:14px;color:#999;letter-spacing:2px;">FLIGHT</div><div style="font-family:${FUTURA};font-size:24px;font-weight:bold;color:#111;">AT-2026</div></div>
            <div><div style="font-family:${SANS};font-size:14px;color:#999;letter-spacing:2px;">GATE</div><div style="font-family:${FUTURA};font-size:24px;font-weight:bold;color:#111;">FREE</div></div>
            <div><div style="font-family:${SANS};font-size:14px;color:#999;letter-spacing:2px;">SEAT</div><div style="font-family:${FUTURA};font-size:24px;font-weight:bold;color:#111;">VIP</div></div>
          </div>
          <div style="border-top:3px dashed #ddd;margin:0 20px;"></div>
          <div style="padding:24px 36px;">
            <div style="font-family:${FUTURA};font-size:40px;font-weight:bold;color:#111;">FREE PHOTO SHOOT</div>
            <div style="display:flex;gap:2px;margin-top:16px;">${Array.from({length:40},(_,i)=>`<div style="width:${i%3===0?4:2}px;height:50px;background:#111;"></div>`).join('')}</div>
          </div>
        </div>
      </div>`

    // 12: NEON SIGN
    case 12: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#0a0a0a;">
        <div style="position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(60,30,20,0.3) 0px,rgba(40,20,15,0.3) 30px,rgba(50,25,18,0.3) 32px,rgba(50,25,18,0.3) 62px);"></div>
        <div style="position:absolute;top:120px;left:60px;right:60px;text-align:center;">
          <div style="font-family:${SERIF};font-size:${cs(160,city)}px;font-weight:bold;font-style:italic;color:#FF1493;text-shadow:0 0 20px rgba(255,20,147,0.8),0 0 60px rgba(255,20,147,0.4);line-height:0.85;">${C}</div>
          ${PH('rgba(255,20,147,0.4)')}
          <div style="font-family:${FUTURA};font-size:60px;font-weight:bold;color:#00FF88;text-shadow:0 0 15px rgba(0,255,136,0.7),0 0 50px rgba(0,255,136,0.3);margin-top:16px;letter-spacing:4px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:22px;color:rgba(255,20,147,0.4);margin-top:16px;">${CTA}</div>
        </div>
        <div style="position:absolute;top:620px;left:140px;right:140px;height:800px;border:6px solid rgba(255,255,255,0.1);overflow:hidden;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
      </div>`

    // 13: POSTCARD
    case 13: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#F5E6D0;">
        <div style="position:absolute;inset:30px;border:4px solid #C4A882;border-radius:8px;"></div>
        <div style="position:absolute;top:60px;right:60px;width:160px;height:200px;border:3px dashed #C4A882;display:flex;align-items:center;justify-content:center;transform:rotate(3deg);">
          <div style="text-align:center;"><div style="font-family:${SERIF};font-size:14px;color:#999;">PHILIPPINES</div><div style="font-family:${SERIF};font-size:44px;font-weight:bold;color:#E63946;">FREE</div></div>
        </div>
        <div style="position:absolute;top:60px;left:60px;">
          <div style="font-family:${SERIF};font-size:32px;font-style:italic;color:#8B7355;">Greetings from</div>
          <div style="font-family:${SERIF};font-size:${cs(110,city)}px;font-weight:bold;font-style:italic;color:#E63946;line-height:0.85;">${city}</div>
          ${PH('#8B7355')}
          <div style="font-family:${FUTURA};font-size:36px;font-weight:bold;color:#E63946;letter-spacing:4px;margin-top:8px;">FREE PHOTO SHOOT</div>
        </div>
        <div style="position:absolute;top:340px;left:60px;right:60px;height:800px;overflow:hidden;border:6px solid white;box-shadow:0 8px 30px rgba(0,0,0,0.15);">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;top:1180px;left:60px;right:60px;">
          <div style="font-family:${SERIF};font-size:28px;font-style:italic;color:#555;line-height:1.5;">Dear friend, I'm offering a free photo shoot in ${city}. Wish you were here! - Aidan</div>
          <div style="font-family:${SANS};font-size:18px;color:#999;margin-top:12px;">${CTA}</div>
        </div>
      </div>`

    // 14: GALLERY EXHIBITION
    case 14: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#F8F6F3;">
        <div style="position:absolute;top:60px;left:60px;right:60px;text-align:center;">
          <div style="font-family:${FUTURA};font-size:48px;font-weight:bold;color:#111;letter-spacing:6px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:20px;color:#999;margin-top:8px;">${CTA}</div>
        </div>
        <div style="position:absolute;top:200px;left:120px;right:120px;background:white;padding:36px;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
          <div style="height:820px;overflow:hidden;"><img src="${p}" style="width:100%;height:100%;object-fit:cover;"/></div>
        </div>
        <div style="position:absolute;top:1120px;left:50%;transform:translateX(-50%);width:480px;background:white;padding:24px 32px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <div style="font-family:${SANS};font-size:22px;font-weight:bold;color:#111;letter-spacing:2px;">${C}, PHILIPPINES</div>
          <div style="font-family:${SERIF};font-size:18px;font-style:italic;color:#666;margin-top:4px;">Free Photo Shoot, 2026</div>
          <div style="font-family:${SANS};font-size:14px;color:#999;margin-top:6px;">Digital photography - Courtesy of @madebyaidan</div>
        </div>
      </div>`

    // 15: DARKROOM
    case 15: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#0a0000;">
        <div style="position:absolute;top:0;left:50%;width:600px;height:400px;transform:translateX(-50%);background:radial-gradient(ellipse,rgba(180,30,30,0.15) 0%,transparent 70%);"></div>
        <div style="position:absolute;top:80px;left:80px;right:80px;">
          <div style="font-family:${SERIF};font-size:${cs(140,city)}px;font-weight:bold;font-style:italic;color:rgba(220,180,180,0.9);line-height:0.82;text-shadow:0 0 20px rgba(180,30,30,0.2);">${C}</div>
          ${PH('rgba(200,120,120,0.4)')}
          <div style="font-family:${FUTURA};font-size:56px;font-weight:bold;color:rgba(200,120,120,0.8);letter-spacing:6px;margin-top:12px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${MONO};font-size:20px;color:rgba(200,100,100,0.35);margin-top:14px;">${CTA}</div>
        </div>
        <div style="position:absolute;top:460px;left:140px;right:140px;height:1000px;border:2px solid rgba(180,30,30,0.2);overflow:hidden;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;filter:sepia(0.3) contrast(1.1) brightness(0.85);"/>
        </div>
      </div>`

    // 16: MARQUEE / BROADWAY
    case 16: {
      const bulbs = []
      for (let i = 0; i < 60; i++) {
        const on = i % 3 !== 0
        const col = on ? '#FFE44D' : 'rgba(255,228,77,0.2)'
        const glow = on ? '0 0 8px rgba(255,228,77,0.6)' : 'none'
        if (i < 15) bulbs.push(`<div style="position:absolute;top:26px;left:${i*72+20}px;width:18px;height:18px;border-radius:50%;background:${col};box-shadow:${glow};"></div>`)
        else if (i < 30) bulbs.push(`<div style="position:absolute;bottom:26px;left:${(i-15)*72+20}px;width:18px;height:18px;border-radius:50%;background:${col};box-shadow:${glow};"></div>`)
        else if (i < 45) bulbs.push(`<div style="position:absolute;left:26px;top:${(i-30)*128+20}px;width:18px;height:18px;border-radius:50%;background:${col};box-shadow:${glow};"></div>`)
        else bulbs.push(`<div style="position:absolute;right:26px;top:${(i-45)*128+20}px;width:18px;height:18px;border-radius:50%;background:${col};box-shadow:${glow};"></div>`)
      }
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#1a0a00;">
        <div style="position:absolute;inset:10px;border:8px solid #8B7355;border-radius:8px;">${bulbs.join('')}</div>
        <div style="position:absolute;top:100px;left:80px;right:80px;text-align:center;">
          <div style="font-family:${SERIF};font-size:40px;font-style:italic;color:#FFE44D;">now showing</div>
          <div style="font-family:${DISPLAY};font-size:${cs(140,city)}px;color:white;text-transform:uppercase;line-height:0.85;">${C}</div>
          ${PH('rgba(255,228,77,0.4)')}
          <div style="font-family:${FUTURA};font-size:58px;font-weight:bold;color:#FFE44D;letter-spacing:4px;margin-top:8px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:22px;color:rgba(255,228,77,0.4);margin-top:14px;">${CTA}</div>
        </div>
        <div style="position:absolute;top:620px;left:80px;right:80px;bottom:80px;overflow:hidden;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
      </div>`
    }

    // 17: TYPEWRITER
    case 17: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#F5F0E0;">
        <div style="position:absolute;inset:0;background:repeating-linear-gradient(180deg,transparent 0px,transparent 48px,rgba(0,100,200,0.08) 48px,rgba(0,100,200,0.08) 49px);"></div>
        <div style="position:absolute;top:0;left:120px;width:2px;height:100%;background:rgba(255,0,0,0.15);"></div>
        <div style="position:absolute;top:80px;left:140px;right:100px;">
          <div style="font-family:${MONO};font-size:26px;color:rgba(0,0,0,0.7);line-height:2.0;">TO: You<br>FROM: Aidan Torrence<br>RE: Free Photo Shoot</div>
          <div style="font-family:${MONO};font-size:${cs(70,city)}px;font-weight:bold;color:#111;line-height:1.0;margin-top:20px;">${C}</div>
          ${PH('rgba(0,0,0,0.35)', MONO)}
          <div style="font-family:${MONO};font-size:44px;font-weight:bold;color:#111;margin-top:16px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${MONO};font-size:22px;color:rgba(0,0,0,0.5);margin-top:16px;">${CTA}</div>
        </div>
        <div style="position:absolute;top:620px;left:160px;right:160px;height:1000px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.1);transform:rotate(-1deg);">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;top:608px;left:200px;width:100px;height:28px;background:rgba(255,230,150,0.6);transform:rotate(-5deg);"></div>
        <div style="position:absolute;top:608px;right:200px;width:100px;height:28px;background:rgba(255,230,150,0.6);transform:rotate(3deg);"></div>
      </div>`

    // 18: CASSETTE TAPE
    case 18: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#2a2a2a;">
        ${bg} filter:brightness(0.25) saturate(0.6);"/>
        <div style="position:absolute;top:200px;left:80px;right:80px;background:linear-gradient(180deg,#E8DDD0,#D4C8B8,#C4B8A8);border-radius:12px;padding:36px;box-shadow:0 20px 60px rgba(0,0,0,0.5);">
          <div style="background:white;border:2px solid #999;border-radius:4px;padding:26px;margin-bottom:26px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
              <div style="font-family:${MONO};font-size:14px;color:#999;">SIDE A</div>
              <div style="font-family:${MONO};font-size:14px;color:#999;">C-90</div>
            </div>
            <div style="font-family:${SERIF};font-size:${cs(72,city)}px;font-weight:bold;font-style:italic;color:#111;line-height:0.85;">${city}</div>
            ${PH('#999')}
            <div style="font-family:${FUTURA};font-size:38px;font-weight:bold;color:#E63946;letter-spacing:4px;margin-top:8px;">FREE PHOTO SHOOT</div>
            <div style="width:100%;height:2px;background:#ddd;margin:12px 0;"></div>
            <div style="font-family:${MONO};font-size:16px;color:#666;line-height:1.8;">01. Show up<br>02. Look amazing<br>03. Get free photos<br>04. That's it</div>
          </div>
          <div style="display:flex;justify-content:space-around;align-items:center;">
            <div style="width:140px;height:140px;border-radius:50%;border:4px solid #888;background:radial-gradient(circle,#333 30%,#555 32%,#555 60%,#444 62%);display:flex;align-items:center;justify-content:center;">
              <div style="width:36px;height:36px;border-radius:50%;background:#222;border:3px solid #666;"></div>
            </div>
            <div style="width:140px;height:140px;border-radius:50%;border:4px solid #888;background:radial-gradient(circle,#333 30%,#555 32%,#555 60%,#444 62%);display:flex;align-items:center;justify-content:center;">
              <div style="width:36px;height:36px;border-radius:50%;background:#222;border:3px solid #666;"></div>
            </div>
          </div>
        </div>
        <div style="position:absolute;top:1020px;left:80px;font-family:${SANS};font-size:22px;color:rgba(255,255,255,0.4);">${CTA}</div>
      </div>`

    // 19: iMESSAGE
    case 19: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
        <div style="position:absolute;top:0;left:0;right:0;height:80px;background:#1c1c1e;display:flex;align-items:center;justify-content:center;">
          <div style="font-family:${SANS};font-size:26px;font-weight:bold;color:white;">Aidan Torrence</div>
        </div>
        <div style="position:absolute;top:80px;left:0;right:0;bottom:0;background:#000;padding:24px;">
          <div style="max-width:700px;margin-bottom:16px;"><div style="background:#2C2C2E;border-radius:18px;padding:18px 24px;display:inline-block;"><div style="font-family:${SANS};font-size:28px;color:white;">hey are you still doing free photo shoots?</div></div></div>
          <div style="max-width:700px;margin-left:auto;margin-bottom:16px;"><div style="background:#0B93F6;border-radius:18px;padding:18px 24px;display:inline-block;"><div style="font-family:${SANS};font-size:28px;color:white;">yes! completely free in ${city}</div></div></div>
          <div style="max-width:580px;margin-left:auto;margin-bottom:16px;"><div style="border-radius:18px;overflow:hidden;height:440px;"><img src="${p}" style="width:100%;height:100%;object-fit:cover;"/></div></div>
          <div style="max-width:700px;margin-left:auto;margin-bottom:16px;"><div style="background:#0B93F6;border-radius:18px;padding:18px 24px;display:inline-block;"><div style="font-family:${SANS};font-size:28px;color:white;">here's some of my recent work</div></div></div>
          <div style="max-width:700px;margin-bottom:16px;"><div style="background:#2C2C2E;border-radius:18px;padding:18px 24px;display:inline-block;"><div style="font-family:${SANS};font-size:28px;color:white;">omg these are amazing! how do I book??</div></div></div>
          <div style="max-width:700px;margin-left:auto;margin-bottom:16px;"><div style="background:#0B93F6;border-radius:18px;padding:18px 24px;display:inline-block;"><div style="font-family:${SANS};font-size:28px;color:white;">just DM me! it's really that easy</div></div></div>
        </div>
        <div style="position:absolute;bottom:560px;left:0;right:0;height:200px;background:linear-gradient(180deg,transparent,rgba(0,0,0,0.95));display:flex;flex-direction:column;justify-content:flex-end;align-items:center;padding-bottom:20px;">
          <div style="font-family:${FUTURA};font-size:${cs(72,city)}px;font-weight:bold;color:white;letter-spacing:4px;">${C}</div>
          ${PH('rgba(255,255,255,0.4)')}
          <div style="font-family:${FUTURA};font-size:44px;font-weight:bold;color:#0B93F6;letter-spacing:4px;margin-top:2px;">FREE PHOTO SHOOT</div>
        </div>
      </div>`

    // 20: RECEIPT
    case 20: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#111;">
        ${bg} filter:brightness(0.2);"/>
        <div style="position:absolute;top:60px;left:60px;right:60px;text-align:center;">
          <div style="font-family:${SERIF};font-size:${cs(110,city)}px;font-weight:bold;font-style:italic;color:white;">${C}</div>
          ${PH('rgba(255,255,255,0.4)')}
          <div style="font-family:${FUTURA};font-size:48px;font-weight:bold;color:white;letter-spacing:4px;margin-top:6px;">FREE PHOTO SHOOT</div>
        </div>
        <div style="position:absolute;top:340px;left:200px;right:200px;background:#F5F0E0;padding:36px 32px;box-shadow:0 20px 60px rgba(0,0,0,0.5);">
          <div style="text-align:center;border-bottom:2px dashed #ccc;padding-bottom:16px;margin-bottom:16px;">
            <div style="font-family:${MONO};font-size:32px;font-weight:bold;color:#111;">MADEBYAIDAN</div>
            <div style="font-family:${MONO};font-size:16px;color:#888;">${city}, Philippines</div>
          </div>
          <div style="font-family:${MONO};font-size:20px;color:#333;line-height:2.2;">Photo Shoot (1hr)    P0.00<br>Edited Photos        P0.00<br>Digital Delivery      P0.00<br>Good Vibes           P0.00</div>
          <div style="border-top:2px dashed #ccc;margin-top:14px;padding-top:14px;">
            <div style="font-family:${MONO};font-size:26px;font-weight:bold;color:#111;display:flex;justify-content:space-between;"><span>TOTAL</span><span>P0.00</span></div>
            <div style="font-family:${MONO};font-size:32px;font-weight:bold;color:#E63946;text-align:center;margin-top:12px;">*** FREE ***</div>
          </div>
          <div style="border-top:2px dashed #ccc;margin-top:12px;padding-top:12px;text-align:center;">
            <div style="font-family:${MONO};font-size:16px;color:#888;">THANK YOU!</div>
            <div style="font-family:${MONO};font-size:14px;color:#aaa;margin-top:6px;">${CTA}</div>
          </div>
        </div>
      </div>`

    // 21: INVITATION
    case 21: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#0F1923;">
        ${bg} filter:brightness(0.2) saturate(0.7);"/>
        <div style="position:absolute;top:200px;left:80px;right:80px;background:rgba(255,252,245,0.97);padding:70px 56px;text-align:center;">
          <div style="width:200px;height:2px;background:#D4AF37;margin:0 auto 36px;"></div>
          <div style="font-family:${SERIF};font-size:26px;font-style:italic;color:#999;letter-spacing:4px;">you are invited to a</div>
          <div style="font-family:${SERIF};font-size:72px;font-weight:bold;font-style:italic;color:#111;margin-top:14px;line-height:0.9;">Free Photo Shoot</div>
          <div style="width:80px;height:1px;background:#D4AF37;margin:28px auto;"></div>
          <div style="font-family:${FUTURA};font-size:22px;color:#999;letter-spacing:8px;margin-bottom:12px;">LOCATION</div>
          <div style="font-family:${SERIF};font-size:${cs(90,city)}px;font-weight:bold;font-style:italic;color:#D4AF37;line-height:0.85;">${city}</div>
          <div style="font-family:${SANS};font-size:18px;letter-spacing:6px;color:#999;margin-top:6px;">PHILIPPINES</div>
          <div style="width:80px;height:1px;background:#D4AF37;margin:28px auto;"></div>
          <div style="font-family:${FUTURA};font-size:22px;color:#999;letter-spacing:8px;margin-bottom:6px;">HOSTED BY</div>
          <div style="font-family:${SERIF};font-size:32px;font-style:italic;color:#555;">Aidan Torrence</div>
          <div style="font-family:${SANS};font-size:24px;color:#111;margin-top:28px;font-weight:500;">RSVP: ${CTA}</div>
          <div style="width:200px;height:2px;background:#D4AF37;margin:36px auto 0;"></div>
        </div>
      </div>`

    // 22: WANTED POSTER
    case 22: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#3a2a1a;">
        <div style="position:absolute;inset:60px;background:linear-gradient(160deg,#E8D5B0,#D4C09A,#C4B088);border-radius:4px;box-shadow:inset 0 0 60px rgba(0,0,0,0.2);"></div>
        <div style="position:absolute;inset:80px;display:flex;flex-direction:column;align-items:center;padding:40px 40px 0;">
          <div style="font-family:${SERIF};font-size:76px;font-weight:bold;color:#3a2a1a;letter-spacing:8px;text-align:center;">WANTED</div>
          <div style="width:80%;height:4px;background:#3a2a1a;margin:12px 0;"></div>
          <div style="font-family:${SERIF};font-size:28px;font-style:italic;color:#5a4a3a;letter-spacing:4px;">DEAD OR ALIVE</div>
          <div style="width:560px;height:640px;margin-top:24px;border:6px solid #3a2a1a;overflow:hidden;">
            <img src="${p}" style="width:100%;height:100%;object-fit:cover;filter:sepia(0.4) contrast(1.1);"/>
          </div>
          <div style="font-family:${SERIF};font-size:${cs(80,city)}px;font-weight:bold;color:#3a2a1a;margin-top:20px;">${C}</div>
          <div style="font-family:${SANS};font-size:18px;letter-spacing:4px;color:#5a4a3a;margin-top:2px;">PHILIPPINES</div>
          <div style="width:60%;height:3px;background:#3a2a1a;margin:16px 0;opacity:0.5;"></div>
          <div style="font-family:${SERIF};font-size:32px;color:#5a4a3a;text-align:center;">FOR LOOKING TOO GOOD IN FREE PHOTOS</div>
          <div style="margin-top:20px;text-align:center;">
            <div style="font-family:${SERIF};font-size:56px;font-weight:bold;color:#8B0000;">FREE PHOTO SHOOT</div>
          </div>
          <div style="font-family:${SERIF};font-size:20px;font-style:italic;color:rgba(90,74,58,0.6);margin-top:16px;">${CTA}</div>
        </div>
      </div>`

    // 23: TRADING CARD
    case 23: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#1a1a2e;">
        <div style="position:absolute;top:80px;left:100px;right:100px;bottom:520px;background:linear-gradient(180deg,#F8F4E8,#F0ECE0);border-radius:20px;border:6px solid #D4AF37;box-shadow:0 20px 60px rgba(0,0,0,0.4);overflow:hidden;">
          <div style="background:linear-gradient(90deg,#B8860B,#FFD700,#B8860B);padding:14px 26px;display:flex;justify-content:space-between;">
            <div style="font-family:${FUTURA};font-size:18px;font-weight:bold;color:#3a2a1a;letter-spacing:4px;">RARE CARD</div>
            <div style="font-family:${MONO};font-size:16px;color:#3a2a1a;">*****</div>
          </div>
          <div style="margin:16px;height:600px;overflow:hidden;border:3px solid #D4AF37;border-radius:8px;">
            <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <div style="padding:0 26px;">
            <div style="font-family:${SERIF};font-size:${cs(72,city)}px;font-weight:bold;font-style:italic;color:#111;line-height:0.85;">${city}</div>
            ${PH('#999')}
            <div style="font-family:${FUTURA};font-size:32px;font-weight:bold;color:#E63946;letter-spacing:4px;margin-top:6px;">FREE PHOTO SHOOT</div>
          </div>
          <div style="margin:14px;padding:16px;background:rgba(0,0,0,0.03);border-radius:8px;">
            <div style="display:flex;justify-content:space-around;text-align:center;">
              <div><div style="font-family:${MONO};font-size:14px;color:#999;">VIBES</div><div style="font-family:${FUTURA};font-size:32px;font-weight:bold;color:#111;">100</div></div>
              <div><div style="font-family:${MONO};font-size:14px;color:#999;">COST</div><div style="font-family:${FUTURA};font-size:32px;font-weight:bold;color:#E63946;">FREE</div></div>
              <div><div style="font-family:${MONO};font-size:14px;color:#999;">PHOTOS</div><div style="font-family:${FUTURA};font-size:32px;font-weight:bold;color:#111;">50+</div></div>
            </div>
          </div>
          <div style="padding:0 26px 14px;text-align:center;"><div style="font-family:${SANS};font-size:18px;color:#999;">${CTA}</div></div>
        </div>
      </div>`

    // 24: TICKET STUB
    case 24: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#111;">
        ${bg} filter:brightness(0.25);"/>
        <div style="position:absolute;top:35%;left:80px;right:80px;transform:translateY(-50%);display:flex;">
          <div style="flex:1;background:#FFE44D;padding:44px 36px;border-radius:12px 0 0 12px;">
            <div style="font-family:${FUTURA};font-size:20px;font-weight:bold;color:rgba(0,0,0,0.3);letter-spacing:8px;">ADMIT ONE</div>
            <div style="font-family:${DISPLAY};font-size:${cs(90,city)}px;color:#111;text-transform:uppercase;line-height:0.85;margin-top:10px;">${C}</div>
            ${PH('rgba(0,0,0,0.3)')}
            <div style="font-family:${FUTURA};font-size:46px;font-weight:bold;color:#E63946;letter-spacing:2px;margin-top:10px;">FREE PHOTO SHOOT</div>
            <div style="width:100%;height:2px;background:rgba(0,0,0,0.1);margin:16px 0;"></div>
            <div style="font-family:${SANS};font-size:20px;color:rgba(0,0,0,0.5);">DATE: Whenever you want</div>
            <div style="font-family:${SANS};font-size:20px;color:rgba(0,0,0,0.5);margin-top:4px;">VENUE: ${city}, Philippines</div>
            <div style="font-family:${SANS};font-size:20px;color:rgba(0,0,0,0.5);margin-top:4px;">PRICE: FREE</div>
            <div style="font-family:${SANS};font-size:18px;color:rgba(0,0,0,0.35);margin-top:14px;">${CTA}</div>
          </div>
          <div style="width:28px;background:#FFE44D;display:flex;flex-direction:column;align-items:center;justify-content:space-around;">
            ${Array.from({length:12},()=>`<div style="width:14px;height:14px;border-radius:50%;background:#111;"></div>`).join('')}
          </div>
          <div style="width:160px;background:#FFE44D;border-radius:0 12px 12px 0;padding:26px 18px;display:flex;align-items:center;justify-content:center;">
            <div style="font-family:${MONO};font-size:16px;color:rgba(0,0,0,0.3);transform:rotate(90deg);white-space:nowrap;">NO. 000001</div>
          </div>
        </div>
      </div>`

    // 25: SPOTIFY WRAPPED
    case 25: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:linear-gradient(160deg,#1DB954,#191414,#1DB954);">
        <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0.3),transparent 30%,transparent 70%,rgba(0,0,0,0.5));"></div>
        <div style="position:absolute;top:100px;left:80px;right:80px;">
          <div style="font-family:${FUTURA};font-size:26px;font-weight:bold;color:rgba(255,255,255,0.5);letter-spacing:6px;">YOUR 2026 WRAPPED</div>
          <div style="font-family:${AVENIR};font-size:${cs(130,city)}px;font-weight:bold;color:white;line-height:0.85;margin-top:8px;">${C}</div>
          ${PH('rgba(255,255,255,0.4)')}
          <div style="font-family:${FUTURA};font-size:58px;font-weight:bold;color:#1DB954;letter-spacing:4px;margin-top:12px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:22px;color:rgba(255,255,255,0.35);margin-top:12px;">${CTA}</div>
        </div>
        <div style="position:absolute;top:620px;left:50%;transform:translateX(-50%);width:500px;height:500px;border-radius:50%;overflow:hidden;border:6px solid rgba(255,255,255,0.1);">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;top:1200px;left:80px;right:80px;display:flex;gap:30px;">
          <div style="flex:1;background:rgba(255,255,255,0.08);border-radius:16px;padding:24px;text-align:center;">
            <div style="font-family:${FUTURA};font-size:44px;font-weight:bold;color:#1DB954;">50+</div>
            <div style="font-family:${SANS};font-size:16px;color:rgba(255,255,255,0.5);margin-top:4px;">photos</div>
          </div>
          <div style="flex:1;background:rgba(255,255,255,0.08);border-radius:16px;padding:24px;text-align:center;">
            <div style="font-family:${FUTURA};font-size:44px;font-weight:bold;color:#1DB954;">P0</div>
            <div style="font-family:${SANS};font-size:16px;color:rgba(255,255,255,0.5);margin-top:4px;">cost</div>
          </div>
          <div style="flex:1;background:rgba(255,255,255,0.08);border-radius:16px;padding:24px;text-align:center;">
            <div style="font-family:${FUTURA};font-size:44px;font-weight:bold;color:#1DB954;">1hr</div>
            <div style="font-family:${SANS};font-size:16px;color:rgba(255,255,255,0.5);margin-top:4px;">session</div>
          </div>
        </div>
      </div>`

    // 26: CLAPPERBOARD
    case 26: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#111;">
        ${bg} filter:brightness(0.3);"/>
        <div style="position:absolute;top:60px;left:80px;right:80px;text-align:center;">
          <div style="font-family:${SERIF};font-size:${cs(140,city)}px;font-weight:bold;font-style:italic;color:white;line-height:0.82;">${C}</div>
          ${PH('rgba(255,255,255,0.4)')}
          <div style="font-family:${FUTURA};font-size:56px;font-weight:bold;color:#FFD700;letter-spacing:4px;margin-top:12px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:22px;color:rgba(255,255,255,0.4);margin-top:14px;">${CTA}</div>
        </div>
        <div style="position:absolute;top:480px;left:80px;right:80px;">
          <div style="height:90px;background:repeating-linear-gradient(135deg,#111 0px,#111 30px,white 30px,white 60px);border-radius:8px 8px 0 0;border:4px solid #333;"></div>
          <div style="background:#222;border:4px solid #333;border-top:none;padding:26px 32px;">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
              <div><div style="font-family:${SANS};font-size:16px;color:#888;letter-spacing:2px;">PRODUCTION</div><div style="font-family:${FUTURA};font-size:28px;font-weight:bold;color:white;">FREE SHOOT</div></div>
              <div><div style="font-family:${SANS};font-size:16px;color:#888;letter-spacing:2px;">DIRECTOR</div><div style="font-family:${FUTURA};font-size:28px;font-weight:bold;color:white;">AIDAN T.</div></div>
              <div><div style="font-family:${SANS};font-size:16px;color:#888;letter-spacing:2px;">LOCATION</div><div style="font-family:${FUTURA};font-size:28px;font-weight:bold;color:#FFD700;">${C}</div></div>
              <div><div style="font-family:${SANS};font-size:16px;color:#888;letter-spacing:2px;">COST</div><div style="font-family:${FUTURA};font-size:28px;font-weight:bold;color:#E63946;">FREE</div></div>
            </div>
          </div>
        </div>
      </div>`

    // 27: CAUTION SIGN
    case 27: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#111;">
        ${bg} filter:brightness(0.4) contrast(1.2);"/>
        <div style="position:absolute;top:0;left:0;right:0;height:80px;background:repeating-linear-gradient(135deg,#FFE600 0px,#FFE600 30px,#111 30px,#111 60px);"></div>
        <div style="position:absolute;top:180px;left:60px;right:60px;text-align:center;">
          <div style="font-family:${DISPLAY};font-size:56px;color:#FFE600;letter-spacing:10px;">WARNING</div>
          <div style="font-family:${DISPLAY};font-size:${cs(180,city)}px;color:white;text-transform:uppercase;line-height:0.82;margin-top:16px;">${C}</div>
          ${PH('rgba(255,230,0,0.5)')}
          <div style="font-family:${DISPLAY};font-size:74px;color:#FFE600;margin-top:16px;letter-spacing:4px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:28px;color:rgba(255,255,255,0.5);margin-top:20px;">CAUTION: MAY CAUSE EXCESSIVE COMPLIMENTS</div>
          <div style="font-family:${SANS};font-size:22px;color:rgba(255,230,0,0.4);margin-top:20px;">${CTA}</div>
        </div>
        <div style="position:absolute;bottom:0;left:0;right:0;height:80px;background:repeating-linear-gradient(135deg,#FFE600 0px,#FFE600 30px,#111 30px,#111 60px);"></div>
      </div>`

    // 28: VINYL RECORD
    case 28: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#1a1a1a;">
        <div style="position:absolute;top:60px;left:80px;right:80px;">
          <div style="font-family:${SERIF};font-size:${cs(130,city)}px;font-weight:bold;font-style:italic;color:white;line-height:0.85;">${C}</div>
          ${PH('rgba(255,255,255,0.3)')}
          <div style="font-family:${FUTURA};font-size:54px;font-weight:bold;color:#E63946;letter-spacing:4px;margin-top:10px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${MONO};font-size:16px;color:rgba(255,255,255,0.3);margin-top:12px;">SIDE A - TRACK 01 - NOW PLAYING</div>
          <div style="font-family:${SANS};font-size:20px;color:rgba(255,255,255,0.35);margin-top:8px;">${CTA}</div>
        </div>
        <div style="position:absolute;top:550px;right:-100px;width:800px;height:800px;border-radius:50%;background:radial-gradient(circle,#111 18%,#222 19%,#222 20%,#111 21%,#111 38%,#1a1a1a 39%,#1a1a1a 40%,#111 41%);border:4px solid #333;"></div>
        <div style="position:absolute;top:420px;left:80px;width:660px;height:660px;background:#111;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.5);">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
          <div style="position:absolute;bottom:0;left:0;right:0;padding:20px;background:linear-gradient(180deg,transparent,rgba(0,0,0,0.8));">
            <div style="font-family:${SERIF};font-size:42px;font-weight:bold;font-style:italic;color:white;">${city}</div>
          </div>
        </div>
      </div>`

    // 29: LOCK SCREEN
    case 29: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
        ${bg} filter:brightness(0.5) blur(20px) saturate(1.3);"/>
        <div style="position:absolute;top:140px;left:0;right:0;text-align:center;">
          <div style="font-family:${SANS};font-size:160px;font-weight:200;color:white;letter-spacing:-4px;">3:14</div>
          <div style="font-family:${SANS};font-size:28px;font-weight:300;color:rgba(255,255,255,0.6);">Tuesday, March 18</div>
        </div>
        <div style="position:absolute;top:480px;left:40px;right:40px;background:rgba(255,255,255,0.12);border-radius:18px;padding:20px;display:flex;gap:16px;align-items:flex-start;">
          <div style="width:60px;height:60px;border-radius:14px;background:linear-gradient(135deg,#833AB4,#FD1D1D,#F77737);flex-shrink:0;"></div>
          <div style="flex:1;">
            <div style="display:flex;justify-content:space-between;">
              <div style="font-family:${SANS};font-size:22px;font-weight:bold;color:white;">INSTAGRAM</div>
              <div style="font-family:${SANS};font-size:18px;color:rgba(255,255,255,0.4);">now</div>
            </div>
            <div style="font-family:${SANS};font-size:24px;color:rgba(255,255,255,0.8);margin-top:4px;line-height:1.4;"><b>@madebyaidan</b> is offering a FREE photo shoot in ${city}! DM to book</div>
          </div>
        </div>
        <div style="position:absolute;top:860px;left:140px;right:140px;height:400px;border-radius:16px;overflow:hidden;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;top:1300px;left:60px;right:60px;text-align:center;">
          <div style="font-family:${FUTURA};font-size:${cs(72,city)}px;font-weight:bold;color:white;">${C}</div>
          ${PH('rgba(255,255,255,0.4)')}
          <div style="font-family:${FUTURA};font-size:44px;font-weight:bold;color:rgba(255,255,255,0.8);letter-spacing:4px;margin-top:2px;">FREE PHOTO SHOOT</div>
        </div>
      </div>`


    // 30: TINDER / DATING APP PROFILE
    case 30: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#111;">
        <div style="position:absolute;top:0;left:0;right:0;height:1200px;overflow:hidden;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
          <div style="position:absolute;inset:0;background:linear-gradient(180deg,transparent 50%,rgba(0,0,0,0.8) 100%);"></div>
        </div>
        <div style="position:absolute;top:1020px;left:60px;right:60px;">
          <div style="display:flex;align-items:baseline;gap:16px;">
            <div style="font-family:${SANS};font-size:${cs(80,city)}px;font-weight:bold;color:white;">${city}</div>
            <div style="font-family:${SANS};font-size:36px;color:rgba(255,255,255,0.6);">0 km away</div>
          </div>
          ${PH('rgba(255,255,255,0.4)')}
          <div style="font-family:${SANS};font-size:28px;color:rgba(255,255,255,0.7);margin-top:10px;line-height:1.5;">FREE photo shoot! I'm a photographer offering complimentary sessions. Let's make some art together.</div>
          <div style="font-family:${SANS};font-size:22px;color:rgba(255,255,255,0.4);margin-top:16px;">${CTA}</div>
        </div>
        <div style="position:absolute;bottom:500px;left:0;right:0;display:flex;justify-content:center;gap:40px;">
          <div style="width:80px;height:80px;border-radius:50%;border:3px solid #FF4458;display:flex;align-items:center;justify-content:center;">
            <div style="font-family:${SANS};font-size:36px;color:#FF4458;">X</div>
          </div>
          <div style="width:100px;height:100px;border-radius:50%;border:4px solid #1DB954;display:flex;align-items:center;justify-content:center;">
            <div style="font-family:${SERIF};font-size:48px;color:#1DB954;">FREE</div>
          </div>
          <div style="width:80px;height:80px;border-radius:50%;border:3px solid #29ABE2;display:flex;align-items:center;justify-content:center;">
            <div style="font-family:${SANS};font-size:28px;color:#29ABE2;">*</div>
          </div>
        </div>
      </div>`

    // 31: INSTAGRAM STORY HIGHLIGHT
    case 31: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:linear-gradient(160deg,#405DE6,#5851DB,#833AB4,#C13584,#E1306C,#FD1D1D,#F56040,#F77737,#FCAF45);">
        <div style="position:absolute;top:40px;left:0;right:0;display:flex;align-items:center;padding:0 30px;gap:12px;">
          <div style="flex:1;height:4px;background:rgba(255,255,255,0.8);border-radius:2px;"></div>
          <div style="flex:1;height:4px;background:rgba(255,255,255,0.3);border-radius:2px;"></div>
          <div style="flex:1;height:4px;background:rgba(255,255,255,0.3);border-radius:2px;"></div>
        </div>
        <div style="position:absolute;top:70px;left:30px;display:flex;align-items:center;gap:16px;">
          <div style="width:56px;height:56px;border-radius:50%;border:3px solid white;overflow:hidden;">
            <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <div style="font-family:${SANS};font-size:24px;font-weight:bold;color:white;">madebyaidan</div>
          <div style="font-family:${SANS};font-size:20px;color:rgba(255,255,255,0.5);">2h</div>
        </div>
        <div style="position:absolute;top:180px;left:60px;right:60px;bottom:520px;border-radius:16px;overflow:hidden;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
          <div style="position:absolute;inset:0;background:linear-gradient(180deg,transparent 40%,rgba(0,0,0,0.7) 100%);"></div>
          <div style="position:absolute;bottom:40px;left:40px;right:40px;">
            <div style="font-family:${AVENIR};font-size:${cs(100,city)}px;font-weight:bold;color:white;line-height:0.85;">${C}</div>
            ${PH('rgba(255,255,255,0.5)')}
            <div style="font-family:${FUTURA};font-size:52px;font-weight:bold;color:white;letter-spacing:4px;margin-top:8px;">FREE PHOTO SHOOT</div>
            <div style="font-family:${SANS};font-size:22px;color:rgba(255,255,255,0.5);margin-top:10px;">${CTA}</div>
          </div>
        </div>
      </div>`

    // 32: FASHION LOOKBOOK
    case 32: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#F8F4F0;">
        <div style="position:absolute;top:60px;left:60px;right:60px;display:flex;justify-content:space-between;align-items:flex-start;">
          <div style="font-family:${FUTURA};font-size:18px;font-weight:bold;color:#111;letter-spacing:10px;">LOOKBOOK</div>
          <div style="font-family:${FUTURA};font-size:18px;color:#999;letter-spacing:4px;">SS 2026</div>
        </div>
        <div style="position:absolute;top:120px;left:60px;right:60px;">
          <div style="font-family:${SERIF};font-size:${cs(160,city)}px;font-weight:bold;font-style:italic;color:#111;line-height:0.82;">${city}</div>
          ${PH('#999')}
        </div>
        <div style="position:absolute;top:380px;left:60px;width:480px;height:700px;overflow:hidden;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;top:480px;right:60px;width:480px;height:700px;overflow:hidden;">
          <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;top:1220px;left:60px;right:60px;">
          <div style="font-family:${FUTURA};font-size:56px;font-weight:bold;color:#111;letter-spacing:6px;">FREE PHOTO SHOOT</div>
          <div style="width:80px;height:3px;background:#111;margin:16px 0;"></div>
          <div style="font-family:${SERIF};font-size:24px;font-style:italic;color:#666;line-height:1.5;">Complimentary portrait sessions in ${city}, Philippines. Professional quality, zero cost.</div>
          <div style="font-family:${SANS};font-size:20px;color:#999;margin-top:16px;">${CTA}</div>
        </div>
      </div>`

    // 33: ZINE / DIY CUT-AND-PASTE
    case 33: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#F0E8D8;">
        <div style="position:absolute;inset:0;background:repeating-linear-gradient(90deg,transparent 0,transparent 539px,rgba(0,0,0,0.05) 540px);"></div>
        <div style="position:absolute;top:40px;left:40px;right:40px;">
          <div style="font-family:${MONO};font-size:${cs(100,city)}px;font-weight:bold;color:#111;text-transform:uppercase;transform:rotate(-3deg);background:white;display:inline-block;padding:4px 16px;border:3px solid #111;">${C}</div>
          ${PH('#111', MONO)}
        </div>
        <div style="position:absolute;top:260px;right:40px;transform:rotate(5deg);">
          <div style="font-family:${DISPLAY};font-size:60px;color:#E63946;background:#FFE44D;display:inline-block;padding:4px 20px;">FREE</div>
        </div>
        <div style="position:absolute;top:380px;left:80px;width:400px;height:500px;overflow:hidden;transform:rotate(-4deg);border:6px solid white;box-shadow:4px 4px 0 #111;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;top:500px;right:60px;width:400px;height:500px;overflow:hidden;transform:rotate(3deg);border:6px solid white;box-shadow:4px 4px 0 #111;">
          <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;top:1080px;left:40px;right:40px;">
          <div style="font-family:${MONO};font-size:48px;font-weight:bold;color:#111;transform:rotate(-1deg);background:#FFE44D;display:inline-block;padding:4px 16px;">PHOTO SHOOT</div>
          <div style="font-family:${MONO};font-size:24px;color:#555;margin-top:24px;line-height:1.8;transform:rotate(1deg);">* completely free *<br>* ${city}, philippines *<br>* message for details *</div>
          <div style="font-family:${MONO};font-size:18px;color:#888;margin-top:16px;">${CTA}</div>
        </div>
      </div>`

    // 34: YEARBOOK PAGE
    case 34: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#1a2744;">
        <div style="position:absolute;inset:0;background:radial-gradient(ellipse at center,rgba(255,255,255,0.05) 0%,transparent 70%);"></div>
        <div style="position:absolute;top:60px;left:60px;right:60px;text-align:center;">
          <div style="font-family:${SERIF};font-size:32px;font-style:italic;color:#D4AF37;letter-spacing:6px;">CLASS OF 2026</div>
          <div style="font-family:${SERIF};font-size:${cs(120,city)}px;font-weight:bold;font-style:italic;color:#D4AF37;margin-top:8px;">${C}</div>
          ${PH('#D4AF37')}
          <div style="font-family:${FUTURA};font-size:48px;font-weight:bold;color:white;letter-spacing:6px;margin-top:12px;">FREE PHOTO SHOOT</div>
        </div>
        <div style="position:absolute;top:420px;left:60px;right:60px;display:grid;grid-template-columns:repeat(3,1fr);gap:20px;">
          ${[p,p2,p3].map((ph,i) => `
            <div style="text-align:center;">
              <div style="height:340px;overflow:hidden;border:4px solid #D4AF37;border-radius:8px;">
                <img src="${ph}" style="width:100%;height:100%;object-fit:cover;"/>
              </div>
              <div style="font-family:${SERIF};font-size:20px;font-style:italic;color:rgba(255,255,255,0.6);margin-top:8px;">${['Most Photogenic','Best Smile','Most Likely to Slay'][i]}</div>
            </div>
          `).join('')}
        </div>
        <div style="position:absolute;top:900px;left:60px;right:60px;text-align:center;">
          <div style="font-family:${SERIF};font-size:48px;font-style:italic;color:#D4AF37;">Most Likely to Get Free Photos</div>
          <div style="width:200px;height:2px;background:#D4AF37;margin:20px auto;"></div>
          <div style="font-family:${SERIF};font-size:28px;font-style:italic;color:rgba(255,255,255,0.6);">Awarded to: YOU</div>
          <div style="font-family:${SANS};font-size:22px;color:rgba(255,255,255,0.4);margin-top:24px;">${CTA}</div>
        </div>
      </div>`

    // 35: SURVEILLANCE / CCTV
    case 35: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#0a0a0a;">
        <div style="position:absolute;inset:0;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;filter:grayscale(0.8) contrast(1.3) brightness(0.7);"/>
        </div>
        <div style="position:absolute;inset:0;background:repeating-linear-gradient(180deg,transparent 0px,rgba(0,0,0,0.15) 1px,transparent 2px,transparent 4px);"></div>
        <div style="position:absolute;inset:0;background:radial-gradient(ellipse at center,transparent 60%,rgba(0,0,0,0.5) 100%);"></div>
        <div style="position:absolute;top:40px;left:40px;">
          <div style="font-family:${MONO};font-size:28px;font-weight:bold;color:rgba(255,255,255,0.7);">CAM 03 - ${C}</div>
          ${PH('rgba(255,255,255,0.4)', MONO)}
        </div>
        <div style="position:absolute;top:40px;right:40px;text-align:right;">
          <div style="font-family:${MONO};font-size:24px;color:rgba(255,255,255,0.5);">2026-03-19</div>
          <div style="font-family:${MONO};font-size:24px;color:rgba(255,255,255,0.5);">15:14:22</div>
        </div>
        <div style="position:absolute;top:40px;left:40px;width:20px;height:20px;border-radius:50%;background:#FF0000;box-shadow:0 0 12px rgba(255,0,0,0.6);"></div>
        <div style="position:absolute;top:120px;left:40px;">
          <div style="font-family:${MONO};font-size:20px;color:rgba(255,255,255,0.4);">REC</div>
        </div>
        <div style="position:absolute;bottom:560px;left:40px;right:40px;background:rgba(0,0,0,0.6);padding:20px;">
          <div style="font-family:${MONO};font-size:${cs(60,city)}px;font-weight:bold;color:#00FF00;text-shadow:0 0 10px rgba(0,255,0,0.5);">[SUBJECT DETECTED]</div>
          <div style="font-family:${MONO};font-size:40px;font-weight:bold;color:white;margin-top:8px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${MONO};font-size:20px;color:rgba(0,255,0,0.5);margin-top:8px;">${CTA}</div>
        </div>
      </div>`

    // 36: MEME FORMAT
    case 36: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
        <div style="position:absolute;top:0;left:0;right:0;padding:40px 60px;background:#000;z-index:2;text-align:center;">
          <div style="font-family:${DISPLAY};font-size:${cs(100,city)}px;color:white;text-transform:uppercase;">${C}</div>
          ${PH('rgba(255,255,255,0.4)')}
          <div style="font-family:${DISPLAY};font-size:64px;color:white;margin-top:8px;">FREE PHOTO SHOOT</div>
        </div>
        <div style="position:absolute;top:340px;left:0;right:0;bottom:480px;overflow:hidden;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;bottom:480px;left:0;right:0;padding:30px 60px;background:#000;text-align:center;">
          <div style="font-family:${DISPLAY};font-size:56px;color:white;text-transform:uppercase;">WHEN SOMEONE SAYS "FREE"</div>
          <div style="font-family:${DISPLAY};font-size:56px;color:#FFE44D;text-transform:uppercase;margin-top:8px;">AND THEY ACTUALLY MEAN IT</div>
          <div style="font-family:${SANS};font-size:22px;color:rgba(255,255,255,0.4);margin-top:16px;">${CTA}</div>
        </div>
      </div>`

    // 37: CD JEWEL CASE / ALBUM ART
    case 37: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#0a0a0a;">
        <div style="position:absolute;top:60px;left:60px;right:60px;text-align:center;">
          <div style="font-family:${SERIF};font-size:${cs(120,city)}px;font-weight:bold;font-style:italic;color:white;">${C}</div>
          ${PH('rgba(255,255,255,0.4)')}
          <div style="font-family:${FUTURA};font-size:50px;font-weight:bold;color:white;letter-spacing:6px;margin-top:8px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:22px;color:rgba(255,255,255,0.4);margin-top:10px;">${CTA}</div>
        </div>
        <div style="position:absolute;top:380px;left:90px;right:90px;">
          <div style="position:relative;width:900px;height:900px;">
            <div style="position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.1),transparent);border-radius:8px;overflow:hidden;border:2px solid rgba(255,255,255,0.1);">
              <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
              <div style="position:absolute;bottom:0;left:0;right:0;padding:30px;background:linear-gradient(transparent,rgba(0,0,0,0.8));">
                <div style="font-family:${SANS};font-size:20px;color:rgba(255,255,255,0.5);letter-spacing:4px;">ALBUM</div>
                <div style="font-family:${SERIF};font-size:48px;font-weight:bold;font-style:italic;color:white;">${city}</div>
                <div style="font-family:${SANS};font-size:22px;color:rgba(255,255,255,0.5);margin-top:4px;">by @madebyaidan</div>
              </div>
            </div>
            <div style="position:absolute;right:-30px;top:50%;transform:translateY(-50%);width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,#555 20%,#333 22%,#444 60%,#333 62%,#222 100%);opacity:0.5;z-index:-1;"></div>
          </div>
        </div>
      </div>`

    // 38: TV GUIDE LISTING
    case 38: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#F5F0E0;">
        <div style="position:absolute;top:0;left:0;right:0;background:#E63946;padding:30px 50px;">
          <div style="font-family:${DISPLAY};font-size:64px;color:white;letter-spacing:4px;">TV GUIDE</div>
          <div style="font-family:${SANS};font-size:22px;color:rgba(255,255,255,0.7);">March 19, 2026 - ${city} Edition</div>
        </div>
        <div style="position:absolute;top:180px;left:50px;right:50px;">
          <div style="border-bottom:2px solid #ddd;padding:20px 0;">
            <div style="font-family:${MONO};font-size:22px;color:#999;">7:00 PM</div>
            <div style="font-family:${SANS};font-size:28px;color:#666;">News Hour</div>
          </div>
          <div style="border-bottom:2px solid #ddd;padding:20px 0;background:rgba(230,57,70,0.05);">
            <div style="display:flex;align-items:center;gap:8px;">
              <div style="font-family:${MONO};font-size:22px;color:#E63946;">8:00 PM</div>
              <div style="font-family:${SANS};font-size:16px;color:#E63946;background:rgba(230,57,70,0.1);padding:2px 8px;border-radius:4px;">NEW</div>
            </div>
            <div style="font-family:${SERIF};font-size:${cs(56,city)}px;font-weight:bold;color:#111;margin-top:4px;">FREE PHOTO SHOOT: ${C}</div>
            ${PH('#999')}
            <div style="font-family:${SERIF};font-size:22px;font-style:italic;color:#666;margin-top:8px;">A photographer offers free sessions in ${city}. Locals line up for the chance of a lifetime. (60 min)</div>
          </div>
        </div>
        <div style="position:absolute;top:640px;left:50px;right:50px;height:600px;overflow:hidden;border:4px solid #ddd;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
          <div style="position:absolute;top:16px;right:16px;background:#E63946;padding:8px 16px;border-radius:4px;">
            <div style="font-family:${FUTURA};font-size:20px;font-weight:bold;color:white;">TONIGHT</div>
          </div>
        </div>
        <div style="position:absolute;top:1280px;left:50px;right:50px;">
          <div style="border-bottom:2px solid #ddd;padding:20px 0;">
            <div style="font-family:${MONO};font-size:22px;color:#999;">9:00 PM</div>
            <div style="font-family:${SANS};font-size:28px;color:#666;">Late Show</div>
          </div>
          <div style="font-family:${SANS};font-size:20px;color:#999;margin-top:24px;">${CTA}</div>
        </div>
      </div>`

    // 39: WEATHER FORECAST
    case 39: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#1a3a5c;">
        <div style="position:absolute;inset:0;background:linear-gradient(180deg,#1a3a5c,#0d1f33);"></div>
        <div style="position:absolute;top:60px;left:60px;right:60px;">
          <div style="font-family:${SANS};font-size:24px;font-weight:bold;color:rgba(255,255,255,0.5);letter-spacing:4px;">WEATHER CHANNEL</div>
          <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:20px;">
            <div>
              <div style="font-family:${SANS};font-size:${cs(90,city)}px;font-weight:bold;color:white;">${C}</div>
              ${PH('rgba(255,255,255,0.4)')}
            </div>
            <div style="font-family:${SANS};font-size:120px;font-weight:200;color:white;">32°</div>
          </div>
        </div>
        <div style="position:absolute;top:340px;left:60px;right:60px;background:rgba(255,255,255,0.08);border-radius:16px;padding:30px;">
          <div style="font-family:${SANS};font-size:28px;font-weight:bold;color:#FFD700;">TODAY'S FORECAST</div>
          <div style="font-family:${SANS};font-size:36px;color:white;margin-top:8px;">100% chance of FREE PHOTOS</div>
          <div style="font-family:${SANS};font-size:22px;color:rgba(255,255,255,0.5);margin-top:8px;">High: AMAZING | Low: STILL AMAZING</div>
        </div>
        <div style="position:absolute;top:580px;left:60px;right:60px;height:600px;border-radius:16px;overflow:hidden;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
          <div style="position:absolute;bottom:0;left:0;right:0;padding:24px;background:linear-gradient(transparent,rgba(0,0,0,0.8));">
            <div style="font-family:${FUTURA};font-size:48px;font-weight:bold;color:white;">FREE PHOTO SHOOT</div>
          </div>
        </div>
        <div style="position:absolute;top:1240px;left:60px;right:60px;display:flex;gap:12px;">
          ${['MON','TUE','WED','THU','FRI'].map(d => `
            <div style="flex:1;background:rgba(255,255,255,0.06);border-radius:12px;padding:16px;text-align:center;">
              <div style="font-family:${SANS};font-size:18px;color:rgba(255,255,255,0.4);">${d}</div>
              <div style="font-family:${SANS};font-size:28px;color:white;margin-top:4px;">FREE</div>
            </div>
          `).join('')}
        </div>
        <div style="position:absolute;bottom:540px;left:60px;font-family:${SANS};font-size:22px;color:rgba(255,255,255,0.4);">${CTA}</div>
      </div>`

    // 40: SPORTS CARD
    case 40: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#111;">
        <div style="position:absolute;top:60px;left:80px;right:80px;bottom:480px;background:linear-gradient(180deg,#E63946,#B71C1C);border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.5);">
          <div style="padding:20px 30px;display:flex;justify-content:space-between;align-items:center;">
            <div style="font-family:${FUTURA};font-size:22px;font-weight:bold;color:white;letter-spacing:6px;">PHOTO PROS</div>
            <div style="font-family:${MONO};font-size:18px;color:rgba(255,255,255,0.5);">2026</div>
          </div>
          <div style="margin:0 24px;height:700px;border-radius:12px;overflow:hidden;border:4px solid rgba(255,255,255,0.3);">
            <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <div style="padding:20px 30px;">
            <div style="font-family:${SERIF};font-size:${cs(72,city)}px;font-weight:bold;font-style:italic;color:white;">${city}</div>
            ${PH('rgba(255,255,255,0.5)')}
            <div style="font-family:${FUTURA};font-size:36px;font-weight:bold;color:#FFD700;letter-spacing:4px;margin-top:4px;">FREE PHOTO SHOOT</div>
          </div>
          <div style="margin:0 24px;padding:16px;background:rgba(0,0,0,0.2);border-radius:8px;display:flex;justify-content:space-around;text-align:center;">
            <div><div style="font-family:${MONO};font-size:14px;color:rgba(255,255,255,0.5);">RATING</div><div style="font-family:${FUTURA};font-size:36px;font-weight:bold;color:white;">99</div></div>
            <div><div style="font-family:${MONO};font-size:14px;color:rgba(255,255,255,0.5);">SHOTS</div><div style="font-family:${FUTURA};font-size:36px;font-weight:bold;color:white;">50+</div></div>
            <div><div style="font-family:${MONO};font-size:14px;color:rgba(255,255,255,0.5);">COST</div><div style="font-family:${FUTURA};font-size:36px;font-weight:bold;color:#FFD700;">FREE</div></div>
          </div>
          <div style="padding:16px 30px;text-align:center;">
            <div style="font-family:${SANS};font-size:18px;color:rgba(255,255,255,0.5);">${CTA}</div>
          </div>
        </div>
      </div>`

    // 41: FILM NOIR DETECTIVE BOARD
    case 41: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#2a1a0a;">
        <div style="position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(0,0,0,0.1) 0px,transparent 1px,transparent 20px);"></div>
        <div style="position:absolute;top:60px;left:60px;right:60px;">
          <div style="font-family:${MONO};font-size:22px;color:rgba(255,255,255,0.4);">CASE FILE #2026</div>
          <div style="font-family:${SERIF};font-size:${cs(110,city)}px;font-weight:bold;font-style:italic;color:rgba(255,200,150,0.9);">${C}</div>
          ${PH('rgba(255,200,150,0.4)')}
          <div style="font-family:${FUTURA};font-size:50px;font-weight:bold;color:rgba(255,200,150,0.8);letter-spacing:4px;margin-top:8px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${MONO};font-size:20px;color:rgba(255,200,150,0.35);margin-top:12px;">${CTA}</div>
        </div>
        <div style="position:absolute;top:440px;left:80px;width:420px;height:520px;transform:rotate(-4deg);background:white;padding:16px;box-shadow:4px 4px 12px rgba(0,0,0,0.4);">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;filter:sepia(0.3) contrast(1.1);"/>
        </div>
        <div style="position:absolute;top:560px;right:80px;width:380px;height:480px;transform:rotate(3deg);background:white;padding:16px;box-shadow:4px 4px 12px rgba(0,0,0,0.4);">
          <img src="${p2}" style="width:100%;height:100%;object-fit:cover;filter:sepia(0.3) contrast(1.1);"/>
        </div>
        <div style="position:absolute;top:700px;left:300px;width:200px;height:2px;background:#E63946;transform:rotate(15deg);"></div>
        <div style="position:absolute;top:600px;left:480px;width:12px;height:12px;border-radius:50%;background:#E63946;"></div>
        <div style="position:absolute;top:1100px;left:100px;right:100px;">
          <div style="font-family:${MONO};font-size:22px;color:rgba(255,200,150,0.5);line-height:2;">SUBJECT: Free photo shoot<br>LOCATION: ${city}, Philippines<br>STATUS: Open for booking<br>EVIDENCE: Outstanding photos</div>
        </div>
      </div>`

    // 42: PASSPORT PHOTO PAGE
    case 42: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#1a2744;">
        <div style="position:absolute;inset:40px;background:linear-gradient(180deg,#E8E0D0,#D8D0C0);border-radius:8px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.4);">
          <div style="padding:40px;border-bottom:3px solid rgba(0,0,0,0.1);">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;">
              <div>
                <div style="font-family:${SANS};font-size:20px;color:#999;letter-spacing:4px;">REPUBLIC OF THE PHILIPPINES</div>
                <div style="font-family:${SERIF};font-size:48px;font-weight:bold;color:#1a2744;margin-top:4px;">PASSPORT</div>
              </div>
              <div style="font-family:${SERIF};font-size:60px;color:#D4AF37;">PH</div>
            </div>
          </div>
          <div style="padding:30px 40px;display:flex;gap:30px;">
            <div style="width:380px;height:480px;border:3px solid #999;overflow:hidden;flex-shrink:0;">
              <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
            </div>
            <div style="flex:1;">
              <div style="margin-bottom:16px;"><div style="font-family:${SANS};font-size:14px;color:#999;">TYPE</div><div style="font-family:${MONO};font-size:24px;color:#111;">FREE</div></div>
              <div style="margin-bottom:16px;"><div style="font-family:${SANS};font-size:14px;color:#999;">SURNAME</div><div style="font-family:${MONO};font-size:24px;color:#111;">YOUR NAME</div></div>
              <div style="margin-bottom:16px;"><div style="font-family:${SANS};font-size:14px;color:#999;">DESTINATION</div><div style="font-family:${MONO};font-size:${cs(24,city)}px;color:#111;">${C}</div></div>
              <div style="margin-bottom:16px;"><div style="font-family:${SANS};font-size:14px;color:#999;">PURPOSE</div><div style="font-family:${MONO};font-size:24px;color:#E63946;">PHOTO SHOOT</div></div>
              <div><div style="font-family:${SANS};font-size:14px;color:#999;">COST</div><div style="font-family:${MONO};font-size:32px;color:#E63946;font-weight:bold;">FREE</div></div>
            </div>
          </div>
          <div style="padding:20px 40px;">
            <div style="font-family:${FUTURA};font-size:44px;font-weight:bold;color:#1a2744;letter-spacing:4px;">FREE PHOTO SHOOT</div>
            <div style="font-family:${SANS};font-size:20px;color:#999;margin-top:8px;">${CTA}</div>
          </div>
          <div style="padding:16px 40px;background:rgba(0,0,0,0.03);">
            <div style="font-family:${MONO};font-size:16px;color:#999;letter-spacing:2px;">P&lt;PHL&lt;FREESHOOT&lt;&lt;${C.replace(/ /g,'')}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</div>
          </div>
        </div>
      </div>`

    // 43: MANGA / COMIC PANEL
    case 43: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#F5F0E0;">
        <div style="position:absolute;top:20px;left:20px;right:20px;height:800px;border:6px solid #111;overflow:hidden;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;filter:contrast(1.2);"/>
          <div style="position:absolute;top:20px;right:20px;background:white;border:4px solid #111;border-radius:30px;padding:16px 28px;transform:rotate(5deg);">
            <div style="font-family:${DISPLAY};font-size:36px;color:#111;">FREE!?</div>
          </div>
        </div>
        <div style="position:absolute;top:840px;left:20px;width:520px;height:540px;border:6px solid #111;overflow:hidden;">
          <img src="${p2}" style="width:100%;height:100%;object-fit:cover;filter:contrast(1.2);"/>
        </div>
        <div style="position:absolute;top:840px;right:20px;width:520px;height:540px;border:6px solid #111;background:white;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:30px;">
          <div style="font-family:${DISPLAY};font-size:${cs(80,city)}px;color:#111;text-transform:uppercase;text-align:center;">${C}</div>
          ${PH('#666')}
          <div style="font-family:${DISPLAY};font-size:48px;color:#E63946;margin-top:12px;text-align:center;">FREE PHOTO SHOOT</div>
        </div>
        <div style="position:absolute;top:1400px;left:20px;right:20px;border:6px solid #111;background:white;padding:30px;text-align:center;">
          <div style="position:absolute;top:-30px;left:50%;transform:translateX(-50%);background:white;border:4px solid #111;border-radius:30px;padding:8px 24px;">
            <div style="font-family:${DISPLAY};font-size:28px;color:#111;">NEXT EPISODE:</div>
          </div>
          <div style="font-family:${SERIF};font-size:36px;font-style:italic;color:#111;margin-top:16px;">Your free photo shoot in ${city}</div>
          <div style="font-family:${SANS};font-size:22px;color:#888;margin-top:12px;">${CTA}</div>
        </div>
      </div>`

    // 44: BREAKING NEWS CHYRON
    case 44: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
        <div style="position:absolute;inset:0;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;inset:0;background:linear-gradient(180deg,transparent 30%,rgba(0,0,0,0.3) 100%);"></div>
        <div style="position:absolute;top:60px;left:60px;">
          <div style="background:#CC0000;padding:8px 20px;display:inline-block;">
            <div style="font-family:${SANS};font-size:28px;font-weight:bold;color:white;letter-spacing:2px;">BREAKING NEWS</div>
          </div>
        </div>
        <div style="position:absolute;top:60px;right:60px;background:rgba(0,0,0,0.6);padding:8px 16px;">
          <div style="font-family:${MONO};font-size:22px;color:white;">LIVE</div>
        </div>
        <div style="position:absolute;bottom:480px;left:0;right:0;">
          <div style="background:#CC0000;padding:20px 60px;">
            <div style="font-family:${SANS};font-size:${cs(60,city)}px;font-weight:bold;color:white;">${C}: FREE PHOTO SHOOT ANNOUNCED</div>
            ${PH('rgba(255,255,255,0.6)')}
          </div>
          <div style="background:#1a1a1a;padding:16px 60px;display:flex;justify-content:space-between;">
            <div style="font-family:${SANS};font-size:24px;color:rgba(255,255,255,0.7);">Photographer Aidan Torrence offers complimentary sessions to anyone in ${city}</div>
          </div>
          <div style="background:#CC0000;padding:8px 60px;overflow:hidden;">
            <div style="font-family:${SANS};font-size:20px;color:white;white-space:nowrap;">FREE PHOTO SHOOT /// ${CTA} /// ${C}, PHILIPPINES /// FREE PHOTO SHOOT /// ${CTA}</div>
          </div>
        </div>
      </div>`

    // 45: BOOK COVER
    case 45: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#1a1a2e;">
        <div style="position:absolute;inset:40px;background:#F8F4E8;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.5);">
          <div style="position:absolute;left:0;top:0;bottom:0;width:60px;background:linear-gradient(90deg,rgba(0,0,0,0.15),transparent);"></div>
          <div style="padding:80px 80px 40px;">
            <div style="font-family:${SANS};font-size:22px;color:#999;letter-spacing:8px;">A NOVEL EXPERIENCE</div>
            <div style="font-family:${SERIF};font-size:${cs(120,city)}px;font-weight:bold;font-style:italic;color:#111;line-height:0.85;margin-top:20px;">${city}</div>
            ${PH('#999')}
            <div style="width:80px;height:4px;background:#E63946;margin:28px 0;"></div>
            <div style="font-family:${SERIF};font-size:52px;font-style:italic;color:#E63946;">Free Photo Shoot</div>
          </div>
          <div style="position:absolute;top:560px;left:60px;right:60px;bottom:200px;overflow:hidden;">
            <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <div style="position:absolute;bottom:60px;left:80px;right:80px;display:flex;justify-content:space-between;align-items:flex-end;">
            <div style="font-family:${SERIF};font-size:32px;font-style:italic;color:#555;">by Aidan Torrence</div>
            <div style="font-family:${SANS};font-size:18px;color:#999;">${CTA}</div>
          </div>
        </div>
      </div>`

    // 46: TAROT CARD
    case 46: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#1a0a2e;">
        <div style="position:absolute;inset:0;background:radial-gradient(ellipse at center,rgba(100,0,200,0.1) 0%,transparent 70%);"></div>
        <div style="position:absolute;top:80px;left:120px;right:120px;bottom:480px;background:#F8F0E0;border-radius:16px;border:4px solid #D4AF37;box-shadow:0 20px 60px rgba(0,0,0,0.5);overflow:hidden;">
          <div style="padding:30px;text-align:center;border-bottom:2px solid #D4AF37;">
            <div style="font-family:${SERIF};font-size:22px;color:#D4AF37;letter-spacing:6px;">THE</div>
            <div style="font-family:${SERIF};font-size:${cs(72,city)}px;font-weight:bold;font-style:italic;color:#1a0a2e;">${city}</div>
            ${PH('#999')}
          </div>
          <div style="margin:20px;height:580px;overflow:hidden;border:3px solid #D4AF37;border-radius:8px;">
            <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <div style="padding:0 30px 20px;text-align:center;">
            <div style="font-family:${SERIF};font-size:44px;font-weight:bold;font-style:italic;color:#1a0a2e;">FREE PHOTO SHOOT</div>
            <div style="font-family:${SERIF};font-size:20px;font-style:italic;color:#888;margin-top:8px;">The cards foretell... amazing photos in your future</div>
          </div>
          <div style="padding:0 30px 30px;display:flex;justify-content:center;gap:8px;">
            ${Array.from({length:5},()=>`<div style="font-family:${SERIF};font-size:28px;color:#D4AF37;">*</div>`).join('')}
          </div>
        </div>
        <div style="position:absolute;bottom:520px;left:0;right:0;text-align:center;">
          <div style="font-family:${SANS};font-size:22px;color:rgba(255,255,255,0.4);">${CTA}</div>
        </div>
      </div>`

    // 47: BINGO CARD
    case 47: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#0a4a2a;">
        <div style="position:absolute;inset:0;background:radial-gradient(ellipse at center,rgba(0,100,50,0.3) 0%,transparent 70%);"></div>
        <div style="position:absolute;top:60px;left:60px;right:60px;text-align:center;">
          <div style="font-family:${DISPLAY};font-size:120px;color:#FFD700;text-shadow:0 4px 12px rgba(0,0,0,0.5);">BINGO!</div>
          <div style="font-family:${FUTURA};font-size:${cs(60,city)}px;font-weight:bold;color:white;letter-spacing:4px;margin-top:4px;">${C}</div>
          ${PH('rgba(255,255,255,0.4)')}
        </div>
        <div style="position:absolute;top:380px;left:80px;right:80px;background:white;border-radius:12px;padding:24px;box-shadow:0 20px 60px rgba(0,0,0,0.4);">
          <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;text-align:center;">
            ${['F','R','E','E','!'].map(l => `<div style="font-family:${DISPLAY};font-size:48px;color:#E63946;padding:8px;">${l}</div>`).join('')}
            ${Array.from({length:25},(_, i) => {
              const items = ['POSE','SMILE','LAUGH','SHINE','MODEL','GLOW','FLEX','SNAP','CLICK','LOOK','SLAY','WORK','SERVE','FIRE','BOSS','MOOD','VIBE','STUN','ICON','STAR','GLAM','CHIC','BOLD','EPIC','CHEF']
              return i === 12 
                ? `<div style="height:100px;display:flex;align-items:center;justify-content:center;border-radius:8px;overflow:hidden;border:2px solid #ddd;"><img src="${p}" style="width:100%;height:100%;object-fit:cover;"/></div>`
                : `<div style="height:100px;display:flex;align-items:center;justify-content:center;background:#f5f5f5;border-radius:8px;border:2px solid #ddd;"><div style="font-family:${MONO};font-size:16px;color:#333;">${items[i]}</div></div>`
            }).join('')}
          </div>
        </div>
        <div style="position:absolute;bottom:540px;left:80px;right:80px;text-align:center;">
          <div style="font-family:${FUTURA};font-size:48px;font-weight:bold;color:#FFD700;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:22px;color:rgba(255,255,255,0.4);margin-top:12px;">${CTA}</div>
        </div>
      </div>`

    // 48: LOTTERY TICKET
    case 48: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#111;">
        ${bg} filter:brightness(0.2);"/>
        <div style="position:absolute;top:60px;left:60px;right:60px;text-align:center;">
          <div style="font-family:${SERIF};font-size:${cs(120,city)}px;font-weight:bold;font-style:italic;color:white;">${C}</div>
          ${PH('rgba(255,255,255,0.4)')}
          <div style="font-family:${FUTURA};font-size:50px;font-weight:bold;color:white;letter-spacing:4px;margin-top:8px;">FREE PHOTO SHOOT</div>
        </div>
        <div style="position:absolute;top:380px;left:80px;right:80px;background:linear-gradient(135deg,#FFD700,#FFE44D,#FFD700);border-radius:16px;padding:40px;box-shadow:0 20px 60px rgba(0,0,0,0.5);">
          <div style="text-align:center;">
            <div style="font-family:${DISPLAY};font-size:64px;color:#111;">GOLDEN TICKET</div>
            <div style="font-family:${SERIF};font-size:28px;font-style:italic;color:#8B7355;margin-top:4px;">${city}, Philippines</div>
          </div>
          <div style="height:400px;margin:24px 0;border-radius:12px;overflow:hidden;border:4px solid #8B7355;">
            <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <div style="background:rgba(0,0,0,0.05);border-radius:8px;padding:24px;text-align:center;">
            <div style="font-family:${FUTURA};font-size:20px;color:#8B7355;letter-spacing:6px;">YOU HAVE WON</div>
            <div style="font-family:${DISPLAY};font-size:56px;color:#111;margin-top:4px;">1 FREE PHOTO SHOOT</div>
            <div style="font-family:${SERIF};font-size:22px;font-style:italic;color:#8B7355;margin-top:8px;">No purchase necessary. Void nowhere.</div>
          </div>
          <div style="text-align:center;margin-top:16px;">
            <div style="font-family:${SANS};font-size:18px;color:#8B7355;">${CTA}</div>
          </div>
        </div>
      </div>`

    // 49: DRIVE-IN MOVIE
    case 49: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#0a0a1a;">
        <div style="position:absolute;top:0;left:0;right:0;height:300px;background:linear-gradient(180deg,#0a0a2e,#0a0a1a);"></div>
        <div style="position:absolute;top:30px;left:0;right:0;display:flex;justify-content:center;gap:4px;">
          ${Array.from({length:30},(_,i)=>`<div style="width:3px;height:3px;border-radius:50%;background:rgba(255,255,255,${0.2+Math.random()*0.6});"></div>`).join('')}
        </div>
        <div style="position:absolute;top:80px;left:60px;right:60px;text-align:center;">
          <div style="font-family:${SERIF};font-size:32px;font-style:italic;color:rgba(255,255,255,0.4);">now showing at the drive-in</div>
          <div style="font-family:${SERIF};font-size:${cs(130,city)}px;font-weight:bold;font-style:italic;color:white;margin-top:8px;">${C}</div>
          ${PH('rgba(255,255,255,0.4)')}
          <div style="font-family:${FUTURA};font-size:56px;font-weight:bold;color:#FFE44D;letter-spacing:4px;margin-top:12px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:22px;color:rgba(255,255,255,0.4);margin-top:12px;">${CTA}</div>
        </div>
        <div style="position:absolute;top:520px;left:100px;right:100px;height:700px;background:#111;border:8px solid #333;border-radius:4px;overflow:hidden;box-shadow:0 0 60px rgba(255,255,255,0.05);">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;top:1240px;left:200px;width:8px;height:300px;background:linear-gradient(180deg,#333,#555);"></div>
        <div style="position:absolute;top:1240px;right:200px;width:8px;height:300px;background:linear-gradient(180deg,#333,#555);"></div>
      </div>`

    // 50: POLAROID WALL / COLLAGE
    case 50: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#3a2a1a;">
        <div style="position:absolute;inset:0;background:repeating-linear-gradient(90deg,rgba(0,0,0,0.05) 0px,transparent 1px,transparent 100px);"></div>
        <div style="position:absolute;top:60px;left:60px;right:60px;text-align:center;">
          <div style="font-family:${SERIF};font-size:${cs(100,city)}px;font-weight:bold;font-style:italic;color:white;">${C}</div>
          ${PH('rgba(255,255,255,0.4)')}
          <div style="font-family:${FUTURA};font-size:48px;font-weight:bold;color:white;letter-spacing:4px;margin-top:8px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:22px;color:rgba(255,255,255,0.4);margin-top:10px;">${CTA}</div>
        </div>
        ${[
          {x:60,y:340,w:280,r:-8},{x:380,y:380,w:280,r:5},{x:700,y:320,w:280,r:-3},
          {x:120,y:720,w:320,r:4},{x:520,y:760,w:320,r:-6},
          {x:200,y:1100,w:300,r:7},{x:560,y:1060,w:300,r:-4}
        ].map((item,i) => `
          <div style="position:absolute;top:${item.y}px;left:${item.x}px;width:${item.w}px;background:white;padding:12px 12px 40px;transform:rotate(${item.r}deg);box-shadow:0 4px 16px rgba(0,0,0,0.3);">
            <img src="${[p,p2,p3,p,p2,p3,p][i]}" style="width:100%;height:${item.w * 0.8}px;object-fit:cover;"/>
          </div>
        `).join('')}
      </div>`

    // 51: PRICE TAG
    case 51: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#F8F4F0;">
        <div style="position:absolute;top:60px;left:60px;right:60px;">
          <div style="font-family:${SERIF};font-size:${cs(120,city)}px;font-weight:bold;font-style:italic;color:#111;">${C}</div>
          ${PH('#999')}
          <div style="font-family:${FUTURA};font-size:50px;font-weight:bold;color:#E63946;letter-spacing:4px;margin-top:8px;">FREE PHOTO SHOOT</div>
        </div>
        <div style="position:absolute;top:380px;left:60px;right:60px;height:700px;overflow:hidden;border-radius:12px;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;top:950px;right:80px;transform:rotate(12deg);">
          <div style="background:white;padding:30px 40px;border:3px dashed #E63946;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,0.15);position:relative;">
            <div style="position:absolute;top:-12px;left:50%;transform:translateX(-50%);width:24px;height:24px;border-radius:50%;border:3px solid #E63946;background:white;"></div>
            <div style="font-family:${MONO};font-size:18px;color:#999;text-decoration:line-through;">P5,000</div>
            <div style="font-family:${DISPLAY};font-size:72px;color:#E63946;">FREE</div>
            <div style="font-family:${SANS};font-size:16px;color:#999;">photo shoot</div>
          </div>
        </div>
        <div style="position:absolute;top:1200px;left:60px;right:60px;">
          <div style="font-family:${SERIF};font-size:32px;font-style:italic;color:#555;line-height:1.5;">Professional photo shoot in ${city}. Usually costs thousands. Today? Absolutely free.</div>
          <div style="font-family:${SANS};font-size:22px;color:#999;margin-top:16px;">${CTA}</div>
        </div>
      </div>`

    // 52: BILLBOARD
    case 52: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:linear-gradient(180deg,#87CEEB,#B0D4E8);">
        <div style="position:absolute;top:200px;left:40px;right:40px;background:white;border:8px solid #555;box-shadow:0 20px 60px rgba(0,0,0,0.3);">
          <div style="display:flex;">
            <div style="flex:1;height:700px;overflow:hidden;">
              <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
            </div>
            <div style="flex:1;padding:40px;display:flex;flex-direction:column;justify-content:center;background:#111;">
              <div style="font-family:${DISPLAY};font-size:${cs(80,city)}px;color:white;text-transform:uppercase;line-height:0.85;">${C}</div>
              ${PH('rgba(255,255,255,0.4)')}
              <div style="font-family:${FUTURA};font-size:44px;font-weight:bold;color:#FFE44D;letter-spacing:4px;margin-top:16px;">FREE PHOTO SHOOT</div>
              <div style="font-family:${SANS};font-size:20px;color:rgba(255,255,255,0.5);margin-top:16px;">${CTA}</div>
            </div>
          </div>
        </div>
        <div style="position:absolute;top:920px;left:50%;transform:translateX(-50%);">
          <div style="width:20px;height:600px;background:linear-gradient(180deg,#555,#777);margin:0 auto;"></div>
          <div style="width:200px;height:20px;background:#666;border-radius:0 0 4px 4px;margin:-1px auto 0;"></div>
        </div>
      </div>`

    // 53: FORTUNE COOKIE
    case 53: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#8B0000;">
        <div style="position:absolute;inset:0;background:radial-gradient(ellipse at center,rgba(200,0,0,0.3) 0%,transparent 70%);"></div>
        <div style="position:absolute;top:60px;left:60px;right:60px;text-align:center;">
          <div style="font-family:${SERIF};font-size:${cs(130,city)}px;font-weight:bold;font-style:italic;color:#FFD700;text-shadow:0 4px 12px rgba(0,0,0,0.5);">${C}</div>
          ${PH('rgba(255,215,0,0.5)')}
          <div style="font-family:${FUTURA};font-size:54px;font-weight:bold;color:white;letter-spacing:4px;margin-top:8px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:22px;color:rgba(255,255,255,0.4);margin-top:12px;">${CTA}</div>
        </div>
        <div style="position:absolute;top:440px;left:100px;right:100px;height:600px;border-radius:16px;overflow:hidden;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;top:1100px;left:140px;right:140px;background:#F8F0E0;padding:40px;transform:rotate(-2deg);box-shadow:0 8px 30px rgba(0,0,0,0.4);">
          <div style="font-family:${SERIF};font-size:28px;font-style:italic;color:#333;text-align:center;line-height:1.5;">A free photo shoot in ${city} awaits you. Your photos will be legendary.</div>
          <div style="width:100%;height:2px;background:#ddd;margin:20px 0;"></div>
          <div style="font-family:${MONO};font-size:16px;color:#999;text-align:center;">Lucky numbers: 0 0 0 0 0 (all free)</div>
        </div>
      </div>`

    // 54: GAME BOY SCREEN
    case 54: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#4A4A6A;">
        <div style="position:absolute;top:40px;left:80px;right:80px;bottom:480px;background:#2a2a3a;border-radius:24px;padding:40px;box-shadow:inset 0 4px 12px rgba(0,0,0,0.3);">
          <div style="background:#9BBC0F;border-radius:8px;padding:30px;height:100%;">
            <div style="position:relative;height:100%;overflow:hidden;">
              <div style="text-align:center;margin-bottom:20px;">
                <div style="font-family:${MONO};font-size:${cs(60,city)}px;font-weight:bold;color:#0F380F;">${C}</div>
                <div style="font-family:${MONO};font-size:16px;color:#306230;letter-spacing:4px;">PHILIPPINES</div>
                <div style="font-family:${MONO};font-size:36px;font-weight:bold;color:#0F380F;margin-top:8px;">FREE PHOTO SHOOT</div>
              </div>
              <div style="height:500px;border:4px solid #0F380F;overflow:hidden;border-radius:4px;">
                <img src="${p}" style="width:100%;height:100%;object-fit:cover;filter:sepia(0.3) saturate(0.5) brightness(1.1);"/>
              </div>
              <div style="text-align:center;margin-top:16px;">
                <div style="font-family:${MONO};font-size:20px;color:#0F380F;">PRESS START</div>
                <div style="font-family:${MONO};font-size:14px;color:#306230;margin-top:8px;">${CTA}</div>
              </div>
            </div>
          </div>
        </div>
        <div style="position:absolute;bottom:520px;left:50%;transform:translateX(-50%);display:flex;gap:40px;">
          <div style="width:60px;height:60px;border-radius:50%;background:#222;border:3px solid #444;"></div>
          <div style="width:60px;height:60px;border-radius:50%;background:#222;border:3px solid #444;"></div>
        </div>
      </div>`

    // 55: LOADING SCREEN
    case 55: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#0a0a0a;">
        <div style="position:absolute;top:100px;left:80px;right:80px;text-align:center;">
          <div style="font-family:${MONO};font-size:24px;color:rgba(255,255,255,0.4);">LOADING...</div>
          <div style="font-family:${AVENIR};font-size:${cs(120,city)}px;font-weight:bold;color:white;margin-top:16px;">${C}</div>
          ${PH('rgba(255,255,255,0.4)')}
          <div style="font-family:${FUTURA};font-size:52px;font-weight:bold;color:#00BFFF;letter-spacing:4px;margin-top:12px;">FREE PHOTO SHOOT</div>
        </div>
        <div style="position:absolute;top:500px;left:100px;right:100px;height:700px;border-radius:12px;overflow:hidden;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
          <div style="position:absolute;inset:0;background:linear-gradient(180deg,transparent 80%,#0a0a0a 100%);"></div>
        </div>
        <div style="position:absolute;top:1240px;left:100px;right:100px;">
          <div style="height:8px;background:rgba(255,255,255,0.1);border-radius:4px;overflow:hidden;">
            <div style="width:87%;height:100%;background:linear-gradient(90deg,#00BFFF,#00FF88);border-radius:4px;"></div>
          </div>
          <div style="display:flex;justify-content:space-between;margin-top:8px;">
            <div style="font-family:${MONO};font-size:18px;color:rgba(255,255,255,0.4);">87% complete</div>
            <div style="font-family:${MONO};font-size:18px;color:rgba(255,255,255,0.4);">ETA: NOW</div>
          </div>
        </div>
        <div style="position:absolute;bottom:540px;left:100px;right:100px;text-align:center;">
          <div style="font-family:${MONO};font-size:18px;color:rgba(255,255,255,0.3);">TIP: ${CTA}</div>
        </div>
      </div>`

    // 56: BROWSER WINDOW
    case 56: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#2a2a2a;">
        <div style="position:absolute;top:80px;left:40px;right:40px;bottom:480px;background:white;border-radius:12px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.4);">
          <div style="height:50px;background:#E8E8E8;display:flex;align-items:center;padding:0 16px;gap:10px;">
            <div style="width:16px;height:16px;border-radius:50%;background:#FF5F57;"></div>
            <div style="width:16px;height:16px;border-radius:50%;background:#FEBC2E;"></div>
            <div style="width:16px;height:16px;border-radius:50%;background:#28C840;"></div>
            <div style="flex:1;margin-left:20px;background:white;border-radius:6px;padding:6px 16px;">
              <div style="font-family:${SANS};font-size:16px;color:#666;">madebyaidan.com/free-photo-shoot</div>
            </div>
          </div>
          <div style="padding:40px;text-align:center;">
            <div style="font-family:${SERIF};font-size:${cs(80,city)}px;font-weight:bold;font-style:italic;color:#111;">${city}</div>
            ${PH('#999')}
            <div style="font-family:${FUTURA};font-size:44px;font-weight:bold;color:#E63946;letter-spacing:4px;margin-top:12px;">FREE PHOTO SHOOT</div>
            <div style="font-family:${SANS};font-size:22px;color:#666;margin-top:12px;">${CTA}</div>
          </div>
          <div style="margin:0 40px;height:600px;border-radius:12px;overflow:hidden;">
            <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <div style="padding:30px 40px;">
            <div style="background:#E63946;color:white;font-family:${FUTURA};font-size:28px;font-weight:bold;text-align:center;padding:18px;border-radius:8px;letter-spacing:4px;">BOOK NOW - IT'S FREE</div>
          </div>
        </div>
      </div>`

    // 57: FACETIME CALL
    case 57: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
        <div style="position:absolute;inset:0;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;filter:blur(2px) brightness(0.7);"/>
        </div>
        <div style="position:absolute;top:60px;left:0;right:0;text-align:center;">
          <div style="font-family:${SANS};font-size:28px;color:rgba(255,255,255,0.7);">FaceTime</div>
          <div style="font-family:${SANS};font-size:${cs(48,city)}px;font-weight:bold;color:white;margin-top:4px;">${city} Photo Shoot</div>
          ${PH('rgba(255,255,255,0.5)')}
        </div>
        <div style="position:absolute;top:240px;left:60px;right:60px;bottom:560px;border-radius:24px;overflow:hidden;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;top:260px;right:80px;width:200px;height:280px;border-radius:16px;overflow:hidden;border:3px solid rgba(255,255,255,0.3);">
          <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;bottom:520px;left:0;right:0;display:flex;justify-content:center;gap:60px;">
          <div style="width:80px;height:80px;border-radius:50%;background:rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center;">
            <div style="font-family:${SANS};font-size:24px;color:white;">mute</div>
          </div>
          <div style="width:80px;height:80px;border-radius:50%;background:#FF3B30;display:flex;align-items:center;justify-content:center;">
            <div style="font-family:${SANS};font-size:20px;color:white;font-weight:bold;">end</div>
          </div>
          <div style="width:80px;height:80px;border-radius:50%;background:rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center;">
            <div style="font-family:${SANS};font-size:24px;color:white;">flip</div>
          </div>
        </div>
        <div style="position:absolute;bottom:620px;left:0;right:0;text-align:center;">
          <div style="font-family:${FUTURA};font-size:44px;font-weight:bold;color:white;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:20px;color:rgba(255,255,255,0.5);margin-top:4px;">${CTA}</div>
        </div>
      </div>`

    // 58: GOOGLE MAPS PIN
    case 58: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#E8E0D0;">
        <div style="position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(0,0,0,0.02) 0px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,rgba(0,0,0,0.02) 0px,transparent 1px,transparent 40px);"></div>
        <div style="position:absolute;top:60px;left:60px;right:60px;">
          <div style="display:flex;align-items:center;gap:16px;">
            <div style="width:48px;height:48px;border-radius:50%;background:#4285F4;display:flex;align-items:center;justify-content:center;">
              <div style="font-family:${SANS};font-size:24px;font-weight:bold;color:white;">G</div>
            </div>
            <div style="flex:1;background:white;border-radius:24px;padding:12px 24px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
              <div style="font-family:${SANS};font-size:22px;color:#333;">Free photo shoot near ${city}</div>
            </div>
          </div>
        </div>
        <div style="position:absolute;top:180px;left:0;right:0;height:700px;overflow:hidden;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;filter:brightness(0.9);"/>
          <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-100%);">
            <div style="width:60px;height:80px;background:#EA4335;border-radius:50% 50% 50% 50% / 60% 60% 40% 40%;display:flex;align-items:center;justify-content:center;padding-bottom:20px;box-shadow:0 4px 12px rgba(0,0,0,0.3);">
              <div style="width:20px;height:20px;border-radius:50%;background:white;"></div>
            </div>
          </div>
        </div>
        <div style="position:absolute;top:900px;left:40px;right:40px;background:white;border-radius:16px;padding:30px;box-shadow:0 4px 16px rgba(0,0,0,0.1);">
          <div style="font-family:${SANS};font-size:${cs(48,city)}px;font-weight:bold;color:#111;">${city} Photo Shoot</div>
          ${PH('#999')}
          <div style="display:flex;align-items:center;gap:8px;margin-top:8px;">
            <div style="font-family:${SANS};font-size:22px;color:#FBBC04;">*****</div>
            <div style="font-family:${SANS};font-size:20px;color:#666;">5.0 (free)</div>
          </div>
          <div style="font-family:${SANS};font-size:20px;color:#1A73E8;margin-top:4px;">Photographer - Open now</div>
          <div style="width:100%;height:1px;background:#eee;margin:16px 0;"></div>
          <div style="font-family:${FUTURA};font-size:40px;font-weight:bold;color:#111;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:20px;color:#666;margin-top:8px;">${CTA}</div>
        </div>
      </div>`

    // 59: DELIVERY PACKAGE LABEL
    case 59: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#C4A882;">
        <div style="position:absolute;inset:0;background:repeating-linear-gradient(45deg,transparent 0,transparent 40px,rgba(0,0,0,0.03) 40px,rgba(0,0,0,0.03) 80px);"></div>
        <div style="position:absolute;top:60px;left:60px;right:60px;text-align:center;">
          <div style="font-family:${SERIF};font-size:${cs(100,city)}px;font-weight:bold;font-style:italic;color:#3a2a1a;">${C}</div>
          ${PH('#5a4a3a')}
          <div style="font-family:${FUTURA};font-size:50px;font-weight:bold;color:#3a2a1a;letter-spacing:4px;margin-top:8px;">FREE PHOTO SHOOT</div>
        </div>
        <div style="position:absolute;top:340px;left:80px;right:80px;background:white;padding:36px;box-shadow:0 8px 24px rgba(0,0,0,0.15);">
          <div style="display:flex;justify-content:space-between;border-bottom:3px solid #111;padding-bottom:16px;margin-bottom:16px;">
            <div style="font-family:${MONO};font-size:20px;color:#111;font-weight:bold;">SHIPPING LABEL</div>
            <div style="font-family:${MONO};font-size:20px;color:#999;">PRIORITY</div>
          </div>
          <div style="margin-bottom:16px;">
            <div style="font-family:${SANS};font-size:16px;color:#999;">FROM:</div>
            <div style="font-family:${MONO};font-size:22px;color:#111;">AIDAN TORRENCE<br>@MADEBYAIDAN</div>
          </div>
          <div style="margin-bottom:16px;">
            <div style="font-family:${SANS};font-size:16px;color:#999;">TO:</div>
            <div style="font-family:${MONO};font-size:28px;font-weight:bold;color:#111;">YOU<br>${C}, PHILIPPINES</div>
          </div>
          <div style="margin-bottom:16px;">
            <div style="font-family:${SANS};font-size:16px;color:#999;">CONTENTS:</div>
            <div style="font-family:${MONO};font-size:28px;font-weight:bold;color:#E63946;">1x FREE PHOTO SHOOT</div>
          </div>
          <div style="display:flex;gap:2px;margin-top:16px;">${Array.from({length:40},(_,i)=>`<div style="width:${i%3===0?4:2}px;height:60px;background:#111;"></div>`).join('')}</div>
        </div>
        <div style="position:absolute;top:960px;left:80px;right:80px;height:400px;overflow:hidden;border:4px solid white;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;bottom:540px;left:80px;font-family:${SANS};font-size:22px;color:#5a4a3a;">${CTA}</div>
      </div>`

    // 60: CONCERT WRISTBAND
    case 60: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#111;">
        ${bg} filter:brightness(0.3);"/>
        <div style="position:absolute;top:80px;left:60px;right:60px;text-align:center;">
          <div style="font-family:${SERIF};font-size:${cs(130,city)}px;font-weight:bold;font-style:italic;color:white;">${C}</div>
          ${PH('rgba(255,255,255,0.4)')}
          <div style="font-family:${FUTURA};font-size:54px;font-weight:bold;color:#FF6B6B;letter-spacing:4px;margin-top:8px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:22px;color:rgba(255,255,255,0.4);margin-top:12px;">${CTA}</div>
        </div>
        <div style="position:absolute;top:500px;left:0;right:0;height:360px;background:linear-gradient(180deg,#FF6B6B,#E63946);transform:rotate(-5deg);display:flex;align-items:center;padding:0 80px;">
          <div style="flex:1;">
            <div style="font-family:${FUTURA};font-size:22px;color:rgba(255,255,255,0.6);letter-spacing:8px;">VIP ACCESS</div>
            <div style="font-family:${DISPLAY};font-size:${cs(80,city)}px;color:white;text-transform:uppercase;margin-top:4px;">${C}</div>
            <div style="font-family:${FUTURA};font-size:36px;font-weight:bold;color:white;letter-spacing:4px;margin-top:4px;">FREE PHOTO SHOOT</div>
            <div style="font-family:${MONO};font-size:18px;color:rgba(255,255,255,0.5);margin-top:8px;">ADMIT ONE - NO CHARGE</div>
          </div>
        </div>
        <div style="position:absolute;top:920px;left:100px;right:100px;height:500px;border-radius:16px;overflow:hidden;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
      </div>`

    // 61: AWARD CERTIFICATE
    case 61: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#1a1a2e;">
        <div style="position:absolute;top:60px;left:60px;right:60px;bottom:480px;background:#FFFBF0;border:8px double #D4AF37;padding:60px;text-align:center;">
          <div style="font-family:${SERIF};font-size:28px;font-style:italic;color:#D4AF37;letter-spacing:6px;">CERTIFICATE OF</div>
          <div style="font-family:${SERIF};font-size:72px;font-weight:bold;font-style:italic;color:#111;margin-top:16px;">Free Photo Shoot</div>
          <div style="width:200px;height:3px;background:#D4AF37;margin:28px auto;"></div>
          <div style="font-family:${SERIF};font-size:24px;font-style:italic;color:#555;">This certifies that YOU are entitled to</div>
          <div style="font-family:${SERIF};font-size:44px;font-weight:bold;color:#E63946;margin-top:16px;">One (1) Complimentary Photo Session</div>
          <div style="font-family:${SERIF};font-size:28px;font-style:italic;color:#555;margin-top:16px;">in the beautiful city of</div>
          <div style="font-family:${SERIF};font-size:${cs(80,city)}px;font-weight:bold;font-style:italic;color:#D4AF37;margin-top:8px;">${city}</div>
          ${PH('#999')}
          <div style="width:200px;height:3px;background:#D4AF37;margin:28px auto;"></div>
          <div style="height:300px;width:400px;margin:0 auto;border-radius:12px;overflow:hidden;border:3px solid #D4AF37;">
            <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <div style="margin-top:28px;">
            <div style="font-family:${SERIF};font-size:32px;font-style:italic;color:#555;">Aidan Torrence</div>
            <div style="width:200px;height:1px;background:#999;margin:4px auto;"></div>
            <div style="font-family:${SANS};font-size:16px;color:#999;">Photographer</div>
          </div>
          <div style="font-family:${SANS};font-size:18px;color:#999;margin-top:20px;">${CTA}</div>
        </div>
      </div>`

    // 62: ACHIEVEMENT UNLOCKED
    case 62: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#1a1a1a;">
        <div style="position:absolute;inset:0;background:radial-gradient(ellipse at center,rgba(0,100,255,0.05) 0%,transparent 70%);"></div>
        <div style="position:absolute;top:80px;left:60px;right:60px;text-align:center;">
          <div style="font-family:${MONO};font-size:24px;color:#FFD700;letter-spacing:6px;">* ACHIEVEMENT UNLOCKED *</div>
          <div style="font-family:${AVENIR};font-size:${cs(110,city)}px;font-weight:bold;color:white;margin-top:16px;">${C}</div>
          ${PH('rgba(255,255,255,0.4)')}
          <div style="font-family:${FUTURA};font-size:52px;font-weight:bold;color:#FFD700;letter-spacing:4px;margin-top:12px;">FREE PHOTO SHOOT</div>
        </div>
        <div style="position:absolute;top:460px;left:50%;transform:translateX(-50%);width:300px;height:300px;border-radius:50%;background:linear-gradient(135deg,#FFD700,#FFA000);display:flex;align-items:center;justify-content:center;box-shadow:0 0 40px rgba(255,215,0,0.3);">
          <div style="width:260px;height:260px;border-radius:50%;background:#1a1a1a;display:flex;align-items:center;justify-content:center;overflow:hidden;">
            <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
        </div>
        <div style="position:absolute;top:820px;left:80px;right:80px;">
          <div style="background:rgba(255,255,255,0.05);border:2px solid rgba(255,215,0,0.2);border-radius:16px;padding:30px;">
            <div style="font-family:${SANS};font-size:24px;font-weight:bold;color:white;margin-bottom:12px;">REWARD DETAILS</div>
            <div style="font-family:${SANS};font-size:22px;color:rgba(255,255,255,0.6);line-height:1.8;">
              +50 Professional Photos<br>
              +1 Hour Session<br>
              +Scenic ${city} Location<br>
              +Zero Cost (FREE!)
            </div>
          </div>
          <div style="margin-top:20px;background:rgba(255,255,255,0.05);border-radius:12px;padding:20px;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <div style="font-family:${MONO};font-size:18px;color:rgba(255,255,255,0.4);">RARITY</div>
              <div style="font-family:${MONO};font-size:18px;color:#FFD700;">LEGENDARY</div>
            </div>
            <div style="height:6px;background:rgba(255,255,255,0.1);border-radius:3px;margin-top:8px;overflow:hidden;">
              <div style="width:100%;height:100%;background:linear-gradient(90deg,#FFD700,#FFA000);border-radius:3px;"></div>
            </div>
          </div>
        </div>
        <div style="position:absolute;bottom:540px;left:0;right:0;text-align:center;">
          <div style="font-family:${SANS};font-size:22px;color:rgba(255,255,255,0.4);">${CTA}</div>
        </div>
      </div>`

    // 63: CHARACTER SELECT SCREEN
    case 63: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#0a0a2e;">
        <div style="position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(0,0,255,0.02) 0px,transparent 1px,transparent 4px);"></div>
        <div style="position:absolute;top:60px;left:60px;right:60px;text-align:center;">
          <div style="font-family:${MONO};font-size:28px;color:#00BFFF;letter-spacing:6px;">SELECT YOUR CITY</div>
          <div style="font-family:${DISPLAY};font-size:56px;color:white;margin-top:8px;">FREE PHOTO SHOOT</div>
        </div>
        <div style="position:absolute;top:260px;left:60px;right:60px;display:flex;gap:20px;">
          ${[p,p2,p3].map((ph,i) => `
            <div style="flex:1;${i===0?'border:4px solid #00BFFF;box-shadow:0 0 20px rgba(0,191,255,0.3);':'border:4px solid rgba(255,255,255,0.1);'}border-radius:12px;overflow:hidden;">
              <div style="height:500px;overflow:hidden;">
                <img src="${ph}" style="width:100%;height:100%;object-fit:cover;${i!==0?'filter:brightness(0.5);':''}"/>
              </div>
              <div style="padding:16px;background:rgba(0,0,0,0.3);text-align:center;">
                <div style="font-family:${MONO};font-size:22px;color:${i===0?'#00BFFF':'rgba(255,255,255,0.4)'};">${['P1','P2','P3'][i]}</div>
              </div>
            </div>
          `).join('')}
        </div>
        <div style="position:absolute;top:860px;left:60px;right:60px;text-align:center;">
          <div style="font-family:${DISPLAY};font-size:${cs(100,city)}px;color:#00BFFF;text-transform:uppercase;text-shadow:0 0 20px rgba(0,191,255,0.4);">${C}</div>
          ${PH('rgba(0,191,255,0.4)', MONO)}
          <div style="margin-top:20px;display:flex;justify-content:center;gap:24px;">
            ${['VIBES: MAX','COST: FREE','SKILL: 99'].map(s => `
              <div style="background:rgba(0,191,255,0.1);border:1px solid rgba(0,191,255,0.3);border-radius:8px;padding:12px 20px;">
                <div style="font-family:${MONO};font-size:18px;color:#00BFFF;">${s}</div>
              </div>
            `).join('')}
          </div>
        </div>
        <div style="position:absolute;bottom:540px;left:0;right:0;text-align:center;">
          <div style="font-family:${MONO};font-size:22px;color:rgba(0,191,255,0.5);">PRESS START // ${CTA}</div>
        </div>
      </div>`

    // 64: SPOTIFY NOW PLAYING
    case 64: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#121212;">
        <div style="position:absolute;top:60px;left:60px;right:60px;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div style="font-family:${SANS};font-size:20px;color:rgba(255,255,255,0.5);">PLAYING FROM PLAYLIST</div>
            <div style="font-family:${SANS};font-size:16px;color:rgba(255,255,255,0.3);">...</div>
          </div>
          <div style="font-family:${SANS};font-size:24px;font-weight:bold;color:white;margin-top:4px;">${city} Vibes</div>
        </div>
        <div style="position:absolute;top:160px;left:80px;right:80px;height:900px;border-radius:12px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.5);">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;top:1100px;left:80px;right:80px;">
          <div style="font-family:${SANS};font-size:${cs(48,city)}px;font-weight:bold;color:white;">${city} - Free Photo Shoot</div>
          ${PH('rgba(255,255,255,0.4)')}
          <div style="font-family:${SANS};font-size:24px;color:rgba(255,255,255,0.5);margin-top:4px;">Aidan Torrence</div>
          <div style="margin-top:24px;">
            <div style="height:4px;background:rgba(255,255,255,0.1);border-radius:2px;">
              <div style="width:65%;height:100%;background:#1DB954;border-radius:2px;"></div>
            </div>
            <div style="display:flex;justify-content:space-between;margin-top:4px;">
              <div style="font-family:${SANS};font-size:16px;color:rgba(255,255,255,0.3);">2:14</div>
              <div style="font-family:${SANS};font-size:16px;color:rgba(255,255,255,0.3);">3:30</div>
            </div>
          </div>
          <div style="display:flex;justify-content:center;align-items:center;gap:50px;margin-top:20px;">
            <div style="font-family:${SANS};font-size:28px;color:rgba(255,255,255,0.5);">|&lt;&lt;</div>
            <div style="width:70px;height:70px;border-radius:50%;background:white;display:flex;align-items:center;justify-content:center;">
              <div style="width:0;height:0;border-left:24px solid #111;border-top:14px solid transparent;border-bottom:14px solid transparent;margin-left:6px;"></div>
            </div>
            <div style="font-family:${SANS};font-size:28px;color:rgba(255,255,255,0.5);">&gt;&gt;|</div>
          </div>
        </div>
      </div>`

    // 65: YOUTUBE THUMBNAIL
    case 65: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#0f0f0f;">
        <div style="position:absolute;top:80px;left:40px;right:40px;height:560px;border-radius:16px;overflow:hidden;position:relative;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
          <div style="position:absolute;inset:0;background:linear-gradient(180deg,transparent 50%,rgba(0,0,0,0.7) 100%);"></div>
          <div style="position:absolute;bottom:20px;left:20px;right:20px;display:flex;justify-content:space-between;align-items:flex-end;">
            <div style="font-family:${DISPLAY};font-size:48px;color:white;text-shadow:0 2px 8px rgba(0,0,0,0.8);">FREE SHOOT!!</div>
            <div style="font-family:${MONO};font-size:18px;color:white;background:rgba(0,0,0,0.7);padding:4px 8px;border-radius:4px;">12:34</div>
          </div>
          <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:80px;height:80px;border-radius:50%;background:rgba(255,0,0,0.9);display:flex;align-items:center;justify-content:center;">
            <div style="width:0;height:0;border-left:28px solid white;border-top:16px solid transparent;border-bottom:16px solid transparent;margin-left:6px;"></div>
          </div>
        </div>
        <div style="position:absolute;top:680px;left:40px;right:40px;">
          <div style="font-family:${SANS};font-size:36px;font-weight:bold;color:white;line-height:1.3;">I Offered FREE Photo Shoots in ${city} Philippines and THIS Happened...</div>
          <div style="display:flex;align-items:center;gap:12px;margin-top:16px;">
            <div style="width:48px;height:48px;border-radius:50%;background:#E63946;display:flex;align-items:center;justify-content:center;">
              <div style="font-family:${SANS};font-size:20px;font-weight:bold;color:white;">A</div>
            </div>
            <div>
              <div style="font-family:${SANS};font-size:20px;font-weight:bold;color:white;">madebyaidan</div>
              <div style="font-family:${SANS};font-size:16px;color:rgba(255,255,255,0.4);">2.5M views - 1 day ago</div>
            </div>
          </div>
        </div>
        <div style="position:absolute;top:920px;left:40px;right:40px;">
          <div style="font-family:${DISPLAY};font-size:${cs(90,city)}px;color:white;text-transform:uppercase;">${C}</div>
          ${PH('rgba(255,255,255,0.4)')}
          <div style="font-family:${FUTURA};font-size:48px;font-weight:bold;color:#FF0000;margin-top:8px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:22px;color:rgba(255,255,255,0.4);margin-top:12px;">${CTA}</div>
        </div>
      </div>`

    // 66: TIKTOK SCREENSHOT
    case 66: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
        <div style="position:absolute;inset:0;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;inset:0;background:linear-gradient(180deg,transparent 40%,rgba(0,0,0,0.6) 100%);"></div>
        <div style="position:absolute;right:20px;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;gap:30px;align-items:center;">
          ${[{icon:'heart',num:'420K',col:'#FF2D55'},{icon:'chat',num:'12K',col:'white'},{icon:'share',num:'8K',col:'white'},{icon:'save',num:'25K',col:'white'}].map(item => `
            <div style="text-align:center;">
              <div style="width:50px;height:50px;border-radius:50%;background:rgba(255,255,255,0.1);margin:0 auto;"></div>
              <div style="font-family:${SANS};font-size:16px;color:white;margin-top:4px;">${item.num}</div>
            </div>
          `).join('')}
        </div>
        <div style="position:absolute;bottom:500px;left:20px;right:80px;">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
            <div style="font-family:${SANS};font-size:24px;font-weight:bold;color:white;">@madebyaidan</div>
          </div>
          <div style="font-family:${SANS};font-size:26px;color:white;line-height:1.4;">FREE photo shoot in ${city}! No catch, just vibes. DM me to book your session #freephotoshoot #${city.toLowerCase()} #philippines</div>
          <div style="margin-top:16px;">
            <div style="font-family:${DISPLAY};font-size:${cs(72,city)}px;color:white;text-shadow:0 0 20px rgba(255,45,85,0.5);">${C}</div>
            ${PH('rgba(255,255,255,0.5)')}
            <div style="font-family:${FUTURA};font-size:40px;font-weight:bold;color:#FF2D55;margin-top:4px;">FREE PHOTO SHOOT</div>
          </div>
        </div>
      </div>`

    // 67: TWITTER/X POST
    case 67: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
        <div style="position:absolute;top:80px;left:60px;right:60px;">
          <div style="display:flex;gap:16px;align-items:flex-start;">
            <div style="width:64px;height:64px;border-radius:50%;overflow:hidden;flex-shrink:0;">
              <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
            </div>
            <div style="flex:1;">
              <div style="display:flex;align-items:center;gap:8px;">
                <div style="font-family:${SANS};font-size:24px;font-weight:bold;color:white;">Aidan Torrence</div>
                <div style="font-family:${SANS};font-size:20px;color:rgba(255,255,255,0.4);">@madebyaidan</div>
              </div>
              <div style="font-family:${SANS};font-size:32px;color:white;margin-top:12px;line-height:1.4;">
                offering FREE photo shoots in ${city}, Philippines. no catch. no strings. just show up and look amazing.
              </div>
              <div style="margin-top:16px;border-radius:16px;overflow:hidden;height:580px;">
                <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
              </div>
              <div style="display:flex;justify-content:space-between;margin-top:16px;padding-right:40px;">
                ${['12.4K','8.2K','42K','2.1M'].map(n => `
                  <div style="font-family:${SANS};font-size:20px;color:rgba(255,255,255,0.4);">${n}</div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
        <div style="position:absolute;top:1060px;left:60px;right:60px;text-align:center;">
          <div style="font-family:${DISPLAY};font-size:${cs(100,city)}px;color:white;text-transform:uppercase;">${C}</div>
          ${PH('rgba(255,255,255,0.4)')}
          <div style="font-family:${FUTURA};font-size:52px;font-weight:bold;color:#1D9BF0;letter-spacing:4px;margin-top:8px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:22px;color:rgba(255,255,255,0.4);margin-top:16px;">${CTA}</div>
        </div>
      </div>`

    // 68: STICKY NOTE
    case 68: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#4A6741;">
        <div style="position:absolute;inset:0;background:linear-gradient(180deg,#4A6741,#3A5731);"></div>
        <div style="position:absolute;top:60px;left:60px;right:60px;text-align:center;">
          <div style="font-family:${SERIF};font-size:${cs(120,city)}px;font-weight:bold;font-style:italic;color:white;">${C}</div>
          ${PH('rgba(255,255,255,0.5)')}
          <div style="font-family:${FUTURA};font-size:52px;font-weight:bold;color:#FFE44D;letter-spacing:4px;margin-top:8px;">FREE PHOTO SHOOT</div>
        </div>
        <div style="position:absolute;top:380px;left:160px;width:760px;height:700px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.3);transform:rotate(-2deg);">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;top:360px;left:380px;width:120px;height:40px;background:rgba(200,200,200,0.5);transform:rotate(-2deg);"></div>
        <div style="position:absolute;top:1120px;left:200px;width:680px;background:#FFE44D;padding:40px;box-shadow:0 8px 24px rgba(0,0,0,0.2);transform:rotate(3deg);">
          <div style="font-family:${SERIF};font-size:36px;font-style:italic;color:#333;line-height:1.5;">Remember:<br>- Free photo shoot<br>- ${city}, Philippines<br>- Message @madebyaidan</div>
          <div style="font-family:${SANS};font-size:18px;color:#888;margin-top:16px;">${CTA}</div>
        </div>
      </div>`

    // 69: MOOD BOARD
    case 69: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#F0ECE4;">
        <div style="position:absolute;top:40px;left:40px;right:40px;text-align:center;">
          <div style="font-family:${FUTURA};font-size:24px;font-weight:bold;color:#111;letter-spacing:10px;">MOOD BOARD</div>
          <div style="font-family:${SERIF};font-size:${cs(90,city)}px;font-weight:bold;font-style:italic;color:#111;margin-top:8px;">${city}</div>
          ${PH('#999')}
        </div>
        <div style="position:absolute;top:280px;left:40px;width:500px;height:650px;overflow:hidden;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;top:320px;right:40px;width:480px;height:400px;overflow:hidden;">
          <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;top:740px;right:40px;width:480px;height:400px;overflow:hidden;">
          <img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;top:960px;left:40px;width:500px;background:white;padding:30px;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
          <div style="font-family:${FUTURA};font-size:40px;font-weight:bold;color:#111;letter-spacing:4px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SERIF};font-size:24px;font-style:italic;color:#666;margin-top:12px;">Inspired by the beauty of ${city}, Philippines</div>
          <div style="display:flex;gap:8px;margin-top:16px;">
            ${['#E8D5B0','#8B7355','#E63946','#1a2744','#4A6741'].map(c => `<div style="width:40px;height:40px;background:${c};border-radius:4px;"></div>`).join('')}
          </div>
          <div style="font-family:${SANS};font-size:18px;color:#999;margin-top:16px;">${CTA}</div>
        </div>
      </div>`

    // 70: PAINT SWATCH CARD
    case 70: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#E8E0D0;">
        <div style="position:absolute;top:60px;left:60px;right:60px;">
          <div style="font-family:${FUTURA};font-size:24px;font-weight:bold;color:#555;letter-spacing:8px;">COLOR PALETTE</div>
          <div style="font-family:${SERIF};font-size:${cs(100,city)}px;font-weight:bold;font-style:italic;color:#111;margin-top:8px;">${city}</div>
          ${PH('#999')}
        </div>
        <div style="position:absolute;top:320px;left:100px;right:100px;background:white;border-radius:12px;padding:30px;box-shadow:0 8px 24px rgba(0,0,0,0.1);">
          <div style="height:500px;border-radius:8px;overflow:hidden;margin-bottom:20px;">
            <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          ${['#E63946','#457B9D','#1D3557','#A8DADC','#F1FAEE'].map((c,i) => `
            <div style="display:flex;align-items:center;gap:16px;padding:12px 0;${i<4?'border-bottom:1px solid #eee;':''}">
              <div style="width:60px;height:60px;background:${c};border-radius:8px;"></div>
              <div>
                <div style="font-family:${MONO};font-size:18px;color:#111;">${c}</div>
                <div style="font-family:${SANS};font-size:16px;color:#999;">${['Free','Photo','Shoot','In',city][i]}</div>
              </div>
            </div>
          `).join('')}
        </div>
        <div style="position:absolute;bottom:540px;left:100px;right:100px;text-align:center;">
          <div style="font-family:${FUTURA};font-size:44px;font-weight:bold;color:#111;letter-spacing:4px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:22px;color:#999;margin-top:12px;">${CTA}</div>
        </div>
      </div>`

    // 71: CLASSIFIED AD
    case 71: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#F5F0E0;">
        <div style="position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent 0px,transparent 24px,rgba(0,0,0,0.04) 24px,rgba(0,0,0,0.04) 25px);"></div>
        <div style="position:absolute;top:40px;left:40px;right:40px;column-count:2;column-gap:30px;">
          <div style="font-family:${SERIF};font-size:14px;color:#888;line-height:1.6;break-inside:avoid;">FOR SALE: Vintage camera. Good condition. $200 OBO. Call 555-0123.</div>
          <div style="font-family:${SERIF};font-size:14px;color:#888;line-height:1.6;break-inside:avoid;margin-top:8px;">LOST: Orange tabby cat. Answers to "Whiskers." Reward.</div>
          <div style="font-family:${SERIF};font-size:14px;color:#888;line-height:1.6;break-inside:avoid;margin-top:8px;">TUTORING: Math & Science. All levels. $30/hr.</div>
        </div>
        <div style="position:absolute;top:220px;left:60px;right:60px;border:6px solid #111;padding:30px;background:rgba(255,255,240,0.9);">
          <div style="text-align:center;border-bottom:3px solid #111;padding-bottom:16px;margin-bottom:16px;">
            <div style="font-family:${SERIF};font-size:${cs(80,city)}px;font-weight:bold;color:#111;">${C}</div>
            ${PH('#666')}
            <div style="font-family:${DISPLAY};font-size:64px;color:#E63946;margin-top:4px;">FREE PHOTO SHOOT</div>
          </div>
          <div style="height:500px;overflow:hidden;margin-bottom:16px;">
            <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <div style="font-family:${SERIF};font-size:28px;color:#333;line-height:1.6;">PHOTOGRAPHER offering FREE portrait sessions in ${city}, Philippines. Professional quality. No strings attached. All ages welcome. Message for details.</div>
          <div style="border-top:3px solid #111;margin-top:16px;padding-top:16px;">
            <div style="font-family:${SERIF};font-size:22px;font-style:italic;color:#666;">${CTA}</div>
          </div>
        </div>
      </div>`

    // 72: FOOD DELIVERY APP
    case 72: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#F5F5F5;">
        <div style="position:absolute;top:0;left:0;right:0;height:60px;background:white;display:flex;align-items:center;padding:0 30px;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
          <div style="font-family:${SANS};font-size:22px;font-weight:bold;color:#111;">FreeEats</div>
          <div style="margin-left:auto;font-family:${SANS};font-size:18px;color:#999;">Delivering to: ${city}</div>
        </div>
        <div style="position:absolute;top:80px;left:20px;right:20px;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.08);">
          <div style="height:600px;overflow:hidden;">
            <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <div style="padding:24px;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;">
              <div>
                <div style="font-family:${SANS};font-size:${cs(40,city)}px;font-weight:bold;color:#111;">Free Photo Shoot - ${city}</div>
                ${PH('#999')}
              </div>
              <div style="background:#1DB954;padding:8px 16px;border-radius:8px;">
                <div style="font-family:${SANS};font-size:22px;font-weight:bold;color:white;">4.9</div>
              </div>
            </div>
            <div style="font-family:${SANS};font-size:20px;color:#666;margin-top:8px;">Photography - 30-60 min - Free delivery</div>
            <div style="display:flex;gap:12px;margin-top:16px;">
              <div style="background:#F0F0F0;padding:8px 16px;border-radius:20px;"><div style="font-family:${SANS};font-size:16px;color:#666;">Free</div></div>
              <div style="background:#F0F0F0;padding:8px 16px;border-radius:20px;"><div style="font-family:${SANS};font-size:16px;color:#666;">50+ Photos</div></div>
              <div style="background:#F0F0F0;padding:8px 16px;border-radius:20px;"><div style="font-family:${SANS};font-size:16px;color:#666;">Professional</div></div>
            </div>
          </div>
          <div style="padding:0 24px 24px;">
            <div style="border-top:1px solid #eee;padding-top:16px;">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <div>
                  <div style="font-family:${SANS};font-size:24px;font-weight:bold;color:#111;">Photo Shoot Session</div>
                  <div style="font-family:${SANS};font-size:20px;color:#999;text-decoration:line-through;">P5,000</div>
                  <div style="font-family:${SANS};font-size:28px;font-weight:bold;color:#E63946;">P0.00 FREE</div>
                </div>
                <div style="background:#E63946;width:48px;height:48px;border-radius:50%;display:flex;align-items:center;justify-content:center;">
                  <div style="font-family:${SANS};font-size:28px;color:white;">+</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div style="position:absolute;bottom:540px;left:20px;right:20px;text-align:center;">
          <div style="font-family:${SANS};font-size:22px;color:#999;">${CTA}</div>
        </div>
      </div>`

    // 73: HOROSCOPE CARD
    case 73: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#0a0a2e;">
        <div style="position:absolute;inset:0;background:radial-gradient(ellipse at top,rgba(100,0,200,0.15) 0%,transparent 50%);"></div>
        ${Array.from({length:40},()=>{
          const x=Math.floor(Math.random()*1080),y=Math.floor(Math.random()*1920),s=1+Math.floor(Math.random()*3)
          return `<div style="position:absolute;left:${x}px;top:${y}px;width:${s}px;height:${s}px;background:white;border-radius:50%;opacity:${0.2+Math.random()*0.5};"></div>`
        }).join('')}
        <div style="position:absolute;top:80px;left:60px;right:60px;text-align:center;">
          <div style="font-family:${SERIF};font-size:28px;font-style:italic;color:#C4A0FF;letter-spacing:4px;">YOUR COSMIC READING</div>
          <div style="font-family:${SERIF};font-size:${cs(120,city)}px;font-weight:bold;font-style:italic;color:white;margin-top:8px;">${C}</div>
          ${PH('rgba(196,160,255,0.5)')}
        </div>
        <div style="position:absolute;top:380px;left:50%;transform:translateX(-50%);width:500px;height:500px;border-radius:50%;overflow:hidden;border:4px solid rgba(196,160,255,0.3);box-shadow:0 0 40px rgba(100,0,200,0.2);">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;top:940px;left:80px;right:80px;text-align:center;">
          <div style="font-family:${SERIF};font-size:32px;font-style:italic;color:#C4A0FF;line-height:1.5;">The stars align in your favor. A free photo shoot in ${city} awaits you. Your beauty is written in the cosmos.</div>
          <div style="width:100px;height:2px;background:rgba(196,160,255,0.3);margin:24px auto;"></div>
          <div style="font-family:${FUTURA};font-size:48px;font-weight:bold;color:white;letter-spacing:4px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:22px;color:rgba(196,160,255,0.4);margin-top:16px;">${CTA}</div>
        </div>
      </div>`

    // 74: STREET SIGN
    case 74: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#87CEEB;">
        <div style="position:absolute;inset:0;background:linear-gradient(180deg,#87CEEB 0%,#B0D4E8 100%);"></div>
        <div style="position:absolute;top:100px;left:50%;transform:translateX(-50%);">
          <div style="background:#006B3F;padding:20px 50px;border-radius:8px;border:4px solid white;box-shadow:0 8px 24px rgba(0,0,0,0.2);transform:rotate(-3deg);">
            <div style="font-family:${SANS};font-size:${cs(72,city)}px;font-weight:bold;color:white;">${C}</div>
            <div style="font-family:${SANS};font-size:22px;color:rgba(255,255,255,0.7);">PHILIPPINES</div>
          </div>
        </div>
        <div style="position:absolute;top:300px;left:50%;transform:translateX(-50%);">
          <div style="background:#FFE44D;padding:16px 40px;border:4px solid #111;transform:rotate(2deg);">
            <div style="font-family:${DISPLAY};font-size:52px;color:#111;">FREE PHOTO SHOOT</div>
            <div style="font-family:${SANS};font-size:20px;color:#555;">AHEAD - 0 KM</div>
          </div>
        </div>
        <div style="position:absolute;top:520px;left:50%;transform:translateX(-50%);width:16px;height:400px;background:linear-gradient(180deg,#888,#666);"></div>
        <div style="position:absolute;top:520px;left:100px;right:100px;height:800px;border-radius:16px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.2);">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;bottom:540px;left:0;right:0;text-align:center;">
          <div style="font-family:${SANS};font-size:22px;color:#555;">${CTA}</div>
        </div>
      </div>`

    // 75: ID BADGE / LANYARD
    case 75: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#2a2a2a;">
        <div style="position:absolute;top:0;left:50%;transform:translateX(-50%);width:80px;height:200px;background:linear-gradient(180deg,transparent,#E63946);"></div>
        <div style="position:absolute;top:180px;left:140px;right:140px;background:white;border-radius:16px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.4);">
          <div style="background:#E63946;padding:24px;text-align:center;">
            <div style="font-family:${FUTURA};font-size:28px;font-weight:bold;color:white;letter-spacing:8px;">PHOTO SHOOT</div>
            <div style="font-family:${SANS};font-size:18px;color:rgba(255,255,255,0.7);">${city}, Philippines</div>
          </div>
          <div style="padding:30px;text-align:center;">
            <div style="width:380px;height:480px;margin:0 auto;border-radius:12px;overflow:hidden;border:4px solid #eee;">
              <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
            </div>
            <div style="font-family:${SERIF};font-size:${cs(56,city)}px;font-weight:bold;font-style:italic;color:#111;margin-top:20px;">${city}</div>
            ${PH('#999')}
            <div style="font-family:${FUTURA};font-size:36px;font-weight:bold;color:#E63946;letter-spacing:4px;margin-top:12px;">FREE PHOTO SHOOT</div>
            <div style="width:100%;height:2px;background:#eee;margin:20px 0;"></div>
            <div style="font-family:${SANS};font-size:20px;color:#999;">ACCESS LEVEL: VIP (FREE)</div>
            <div style="display:flex;gap:2px;justify-content:center;margin-top:16px;">${Array.from({length:30},(_,i)=>`<div style="width:${i%3===0?3:2}px;height:50px;background:#111;"></div>`).join('')}</div>
          </div>
        </div>
        <div style="position:absolute;bottom:540px;left:0;right:0;text-align:center;">
          <div style="font-family:${SANS};font-size:22px;color:rgba(255,255,255,0.4);">${CTA}</div>
        </div>
      </div>`

    // 76: VINTAGE TRAVEL AD
    case 76: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#E8D5B0;">
        <div style="position:absolute;inset:40px;border:6px solid #8B7355;">
          <div style="position:absolute;inset:8px;border:2px solid #8B7355;"></div>
        </div>
        <div style="position:absolute;top:80px;left:80px;right:80px;text-align:center;">
          <div style="font-family:${SERIF};font-size:28px;font-style:italic;color:#8B7355;letter-spacing:4px;">VISIT BEAUTIFUL</div>
          <div style="font-family:${SERIF};font-size:${cs(140,city)}px;font-weight:bold;font-style:italic;color:#3a2a1a;line-height:0.85;margin-top:8px;">${city}</div>
          ${PH('#8B7355')}
          <div style="font-family:${FUTURA};font-size:28px;font-weight:bold;color:#E63946;letter-spacing:8px;margin-top:12px;">THE PEARL OF THE ORIENT</div>
        </div>
        <div style="position:absolute;top:440px;left:100px;right:100px;height:700px;overflow:hidden;border:6px solid white;box-shadow:0 8px 30px rgba(0,0,0,0.15);">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;filter:saturate(1.2) contrast(1.05);"/>
        </div>
        <div style="position:absolute;top:1180px;left:100px;right:100px;text-align:center;">
          <div style="font-family:${SERIF};font-size:52px;font-weight:bold;font-style:italic;color:#3a2a1a;">Free Photo Shoot</div>
          <div style="font-family:${SERIF};font-size:24px;font-style:italic;color:#8B7355;margin-top:12px;">Complimentary portrait sessions by @madebyaidan</div>
          <div style="width:100px;height:3px;background:#8B7355;margin:20px auto;"></div>
          <div style="font-family:${SANS};font-size:20px;color:#8B7355;">${CTA}</div>
        </div>
      </div>`

    // 77: MIXTAPE COVER
    case 77: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#111;">
        <div style="position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,0,100,0.1),rgba(0,200,255,0.1));"></div>
        <div style="position:absolute;top:60px;left:60px;right:60px;">
          <div style="font-family:${DISPLAY};font-size:32px;color:rgba(255,255,255,0.4);letter-spacing:8px;">VOLUME 01</div>
          <div style="font-family:${DISPLAY};font-size:${cs(160,city)}px;color:white;text-transform:uppercase;line-height:0.82;margin-top:8px;">${C}</div>
          ${PH('rgba(255,255,255,0.4)')}
          <div style="font-family:${DISPLAY};font-size:64px;color:#FF6B6B;margin-top:8px;">FREE PHOTO SHOOT</div>
        </div>
        <div style="position:absolute;top:520px;left:60px;right:60px;height:700px;overflow:hidden;border:4px solid rgba(255,255,255,0.1);">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
          <div style="position:absolute;inset:0;background:linear-gradient(180deg,transparent 60%,rgba(0,0,0,0.6) 100%);"></div>
        </div>
        <div style="position:absolute;top:1260px;left:60px;right:60px;">
          <div style="font-family:${MONO};font-size:18px;color:rgba(255,255,255,0.3);line-height:2;">
            01. Free Photo Shoot ft. You<br>
            02. ${city} Vibes<br>
            03. No Strings Attached<br>
            04. Just Show Up<br>
            05. Look Amazing (Bonus Track)
          </div>
          <div style="font-family:${SANS};font-size:20px;color:rgba(255,255,255,0.3);margin-top:16px;">${CTA}</div>
        </div>
      </div>`

    // 78: ARCADE GAME SCREEN
    case 78: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
        <div style="position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(0,0,0,0.3) 0px,transparent 1px,transparent 3px);"></div>
        <div style="position:absolute;top:60px;left:60px;right:60px;text-align:center;">
          <div style="font-family:${MONO};font-size:24px;color:#FFD700;">INSERT COIN: 0 (FREE!)</div>
          <div style="font-family:${MONO};font-size:${cs(100,city)}px;font-weight:bold;color:#FF6B6B;text-shadow:0 0 20px rgba(255,107,107,0.5);margin-top:16px;">${C}</div>
          <div style="font-family:${MONO};font-size:18px;color:rgba(255,255,255,0.4);letter-spacing:4px;margin-top:4px;">PHILIPPINES</div>
          <div style="font-family:${MONO};font-size:48px;font-weight:bold;color:#00FF00;text-shadow:0 0 15px rgba(0,255,0,0.5);margin-top:12px;">FREE PHOTO SHOOT</div>
        </div>
        <div style="position:absolute;top:440px;left:80px;right:80px;height:600px;border:4px solid #FFD700;overflow:hidden;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
          <div style="position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(0,0,0,0.1) 0px,transparent 1px,transparent 3px);"></div>
        </div>
        <div style="position:absolute;top:1100px;left:80px;right:80px;text-align:center;">
          <div style="font-family:${MONO};font-size:28px;color:#FFD700;">HIGH SCORES</div>
          <div style="font-family:${MONO};font-size:24px;color:#00FF00;margin-top:12px;line-height:2;">
            1ST  AAT  999999  FREE<br>
            2ND  YOU  000000  SOON<br>
            3RD  ???  ??????  ????
          </div>
          <div style="font-family:${MONO};font-size:20px;color:rgba(255,255,255,0.3);margin-top:20px;">${CTA}</div>
          <div style="font-family:${MONO};font-size:24px;color:#FF6B6B;margin-top:16px;">PRESS START</div>
        </div>
      </div>`

    // 79: CALENDAR INVITE
    case 79: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#F5F5F5;">
        <div style="position:absolute;top:0;left:0;right:0;height:80px;background:white;display:flex;align-items:center;padding:0 30px;box-shadow:0 1px 4px rgba(0,0,0,0.05);">
          <div style="font-family:${SANS};font-size:24px;font-weight:bold;color:#111;">Calendar</div>
          <div style="margin-left:auto;font-family:${SANS};font-size:20px;color:#007AFF;">Today</div>
        </div>
        <div style="position:absolute;top:100px;left:20px;right:20px;background:white;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
          <div style="background:#E63946;padding:24px;text-align:center;">
            <div style="font-family:${SANS};font-size:20px;color:rgba(255,255,255,0.7);">MARCH 2026</div>
            <div style="font-family:${SANS};font-size:36px;font-weight:bold;color:white;">Wednesday 19</div>
          </div>
          <div style="padding:24px;">
            <div style="border-left:4px solid #E63946;padding-left:16px;">
              <div style="font-family:${SANS};font-size:16px;color:#E63946;">ALL DAY</div>
              <div style="font-family:${SANS};font-size:${cs(36,city)}px;font-weight:bold;color:#111;">Free Photo Shoot - ${city}</div>
              ${PH('#999')}
              <div style="font-family:${SANS};font-size:20px;color:#666;margin-top:8px;">Location: ${city}, Philippines</div>
              <div style="font-family:${SANS};font-size:20px;color:#666;margin-top:4px;">Organizer: @madebyaidan</div>
              <div style="font-family:${SANS};font-size:20px;color:#1DB954;margin-top:4px;">Price: FREE</div>
            </div>
          </div>
          <div style="margin:0 24px;height:500px;border-radius:12px;overflow:hidden;">
            <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <div style="padding:24px;">
            <div style="font-family:${SANS};font-size:20px;color:#666;line-height:1.5;">Professional photo shoot - 30 to 60 min session. Scenic locations in ${city}. Completely free, no catch!</div>
            <div style="display:flex;gap:12px;margin-top:16px;">
              <div style="flex:1;background:#E63946;padding:14px;border-radius:8px;text-align:center;">
                <div style="font-family:${SANS};font-size:20px;font-weight:bold;color:white;">Accept</div>
              </div>
              <div style="flex:1;background:#F0F0F0;padding:14px;border-radius:8px;text-align:center;">
                <div style="font-family:${SANS};font-size:20px;color:#666;">Maybe</div>
              </div>
            </div>
          </div>
        </div>
        <div style="position:absolute;bottom:540px;left:0;right:0;text-align:center;">
          <div style="font-family:${SANS};font-size:22px;color:#999;">${CTA}</div>
        </div>
      </div>`

    // 80: GRAB/UBER RIDE RECEIPT
    case 80: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#111;">
        ${bg} filter:brightness(0.25);"/>
        <div style="position:absolute;top:60px;left:60px;right:60px;text-align:center;">
          <div style="font-family:${SERIF};font-size:${cs(110,city)}px;font-weight:bold;font-style:italic;color:white;">${C}</div>
          ${PH('rgba(255,255,255,0.4)')}
          <div style="font-family:${FUTURA};font-size:50px;font-weight:bold;color:white;letter-spacing:4px;margin-top:8px;">FREE PHOTO SHOOT</div>
        </div>
        <div style="position:absolute;top:360px;left:80px;right:80px;background:white;border-radius:16px;padding:36px;box-shadow:0 20px 60px rgba(0,0,0,0.5);">
          <div style="text-align:center;margin-bottom:24px;">
            <div style="font-family:${SANS};font-size:28px;font-weight:bold;color:#111;">Your trip to Free Photos</div>
            <div style="font-family:${SANS};font-size:18px;color:#999;margin-top:4px;">March 19, 2026</div>
          </div>
          <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px;">
            <div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
              <div style="width:12px;height:12px;border-radius:50%;background:#1DB954;"></div>
              <div style="width:2px;height:40px;background:#ddd;"></div>
              <div style="width:12px;height:12px;border-radius:50%;background:#E63946;"></div>
            </div>
            <div>
              <div style="font-family:${SANS};font-size:22px;color:#111;">Your Location</div>
              <div style="height:30px;"></div>
              <div style="font-family:${SANS};font-size:22px;color:#111;">${city} Photo Shoot</div>
            </div>
          </div>
          <div style="height:320px;border-radius:12px;overflow:hidden;margin-bottom:20px;">
            <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <div style="border-top:2px solid #eee;padding-top:20px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
              <div style="font-family:${SANS};font-size:22px;color:#666;">Photo Shoot Fee</div>
              <div style="font-family:${SANS};font-size:22px;color:#666;text-decoration:line-through;">P3,000</div>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
              <div style="font-family:${SANS};font-size:22px;color:#666;">Discount</div>
              <div style="font-family:${SANS};font-size:22px;color:#1DB954;">-P3,000</div>
            </div>
            <div style="display:flex;justify-content:space-between;border-top:2px solid #111;padding-top:12px;margin-top:12px;">
              <div style="font-family:${SANS};font-size:28px;font-weight:bold;color:#111;">Total</div>
              <div style="font-family:${SANS};font-size:28px;font-weight:bold;color:#E63946;">P0.00 FREE</div>
            </div>
          </div>
        </div>
        <div style="position:absolute;bottom:540px;left:0;right:0;text-align:center;">
          <div style="font-family:${SANS};font-size:22px;color:rgba(255,255,255,0.4);">${CTA}</div>
        </div>
      </div>`

    // 81: QUEST / MISSION BRIEFING
    case 81: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#1a1a0a;">
        <div style="position:absolute;inset:0;background:radial-gradient(ellipse at center,rgba(200,180,0,0.05) 0%,transparent 70%);"></div>
        <div style="position:absolute;top:60px;left:60px;right:60px;text-align:center;">
          <div style="font-family:${MONO};font-size:22px;color:#FFD700;letter-spacing:6px;">NEW QUEST AVAILABLE</div>
          <div style="font-family:${DISPLAY};font-size:${cs(100,city)}px;color:white;text-transform:uppercase;margin-top:8px;">${C}</div>
          ${PH('rgba(255,215,0,0.4)', MONO)}
        </div>
        <div style="position:absolute;top:340px;left:60px;right:60px;border:2px solid rgba(255,215,0,0.3);border-radius:12px;padding:30px;background:rgba(0,0,0,0.3);">
          <div style="display:flex;justify-content:space-between;margin-bottom:16px;">
            <div style="font-family:${MONO};font-size:20px;color:#FFD700;">QUEST: Free Photo Shoot</div>
            <div style="font-family:${MONO};font-size:20px;color:#FF6B6B;">LEGENDARY</div>
          </div>
          <div style="height:400px;border-radius:8px;overflow:hidden;border:2px solid rgba(255,215,0,0.2);margin-bottom:16px;">
            <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <div style="font-family:${MONO};font-size:20px;color:rgba(255,255,255,0.6);line-height:2;">
            OBJECTIVE: Get a free photo shoot<br>
            LOCATION: ${city}, Philippines<br>
            DIFFICULTY: Easy<br>
            COST: 0 gold (FREE)<br>
            REWARD: 50+ amazing photos
          </div>
        </div>
        <div style="position:absolute;top:1100px;left:60px;right:60px;display:flex;gap:20px;">
          <div style="flex:1;background:#FFD700;padding:20px;border-radius:8px;text-align:center;">
            <div style="font-family:${FUTURA};font-size:28px;font-weight:bold;color:#111;">ACCEPT QUEST</div>
          </div>
          <div style="flex:1;border:2px solid rgba(255,255,255,0.2);padding:20px;border-radius:8px;text-align:center;">
            <div style="font-family:${FUTURA};font-size:28px;font-weight:bold;color:rgba(255,255,255,0.4);">DECLINE</div>
          </div>
        </div>
        <div style="position:absolute;bottom:540px;left:0;right:0;text-align:center;">
          <div style="font-family:${MONO};font-size:20px;color:rgba(255,215,0,0.3);">${CTA}</div>
        </div>
      </div>`

    // 82: TEXT NOTIFICATION BANNER
    case 82: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
        ${bg} filter:brightness(0.4) blur(8px);"/>
        <div style="position:absolute;top:100px;left:40px;right:40px;">
          ${[
            {app:'Messages',text:`Aidan: Hey! I'm doing free photo shoots in ${city}. Interested?`,time:'now'},
            {app:'Instagram',text:'@madebyaidan started a live video: Free Photo Shoot Q&A',time:'2m ago'},
            {app:'Mail',text:`Your Free Photo Shoot Confirmation - ${city}`,time:'5m ago'}
          ].map((n,i) => `
            <div style="background:rgba(255,255,255,0.12);border-radius:18px;padding:20px;margin-bottom:12px;display:flex;gap:16px;align-items:flex-start;">
              <div style="width:48px;height:48px;border-radius:12px;background:${['#1DB954','linear-gradient(135deg,#833AB4,#FD1D1D)','#007AFF'][i]};flex-shrink:0;"></div>
              <div style="flex:1;">
                <div style="display:flex;justify-content:space-between;">
                  <div style="font-family:${SANS};font-size:20px;font-weight:bold;color:white;">${n.app}</div>
                  <div style="font-family:${SANS};font-size:16px;color:rgba(255,255,255,0.4);">${n.time}</div>
                </div>
                <div style="font-family:${SANS};font-size:22px;color:rgba(255,255,255,0.8);margin-top:4px;">${n.text}</div>
              </div>
            </div>
          `).join('')}
        </div>
        <div style="position:absolute;top:560px;left:80px;right:80px;height:600px;border-radius:20px;overflow:hidden;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;top:1200px;left:60px;right:60px;text-align:center;">
          <div style="font-family:${AVENIR};font-size:${cs(80,city)}px;font-weight:bold;color:white;">${C}</div>
          ${PH('rgba(255,255,255,0.4)')}
          <div style="font-family:${FUTURA};font-size:48px;font-weight:bold;color:white;letter-spacing:4px;margin-top:8px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:22px;color:rgba(255,255,255,0.4);margin-top:12px;">${CTA}</div>
        </div>
      </div>`

    // 83: STORE WINDOW DISPLAY
    case 83: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#1a1a1a;">
        <div style="position:absolute;top:60px;left:60px;right:60px;text-align:center;">
          <div style="font-family:${SERIF};font-size:${cs(120,city)}px;font-weight:bold;font-style:italic;color:white;">${C}</div>
          ${PH('rgba(255,255,255,0.4)')}
          <div style="font-family:${FUTURA};font-size:52px;font-weight:bold;color:white;letter-spacing:4px;margin-top:8px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:22px;color:rgba(255,255,255,0.4);margin-top:10px;">${CTA}</div>
        </div>
        <div style="position:absolute;top:380px;left:60px;right:60px;bottom:480px;background:#F8F4F0;border-radius:4px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.5);">
          <div style="position:absolute;inset:0;border:16px solid rgba(0,0,0,0.05);"></div>
          <div style="position:absolute;inset:20px;display:flex;align-items:center;justify-content:center;">
            <img src="${p}" style="width:90%;height:90%;object-fit:cover;"/>
          </div>
          <div style="position:absolute;top:50%;left:0;right:0;height:2px;background:rgba(255,255,255,0.15);"></div>
          <div style="position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.1) 0%,transparent 50%);"></div>
          <div style="position:absolute;bottom:24px;left:0;right:0;text-align:center;">
            <div style="display:inline-block;background:white;padding:8px 24px;border-radius:4px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
              <div style="font-family:${FUTURA};font-size:24px;font-weight:bold;color:#E63946;letter-spacing:4px;">NOW SHOWING</div>
            </div>
          </div>
        </div>
      </div>`

    // 84: BUS STOP AD
    case 84: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#87CEEB;">
        <div style="position:absolute;inset:0;background:linear-gradient(180deg,#87CEEB,#d4e8f0);"></div>
        <div style="position:absolute;top:100px;left:80px;right:80px;bottom:480px;background:white;border:6px solid #555;overflow:hidden;">
          <div style="height:60%;overflow:hidden;">
            <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <div style="padding:30px;text-align:center;">
            <div style="font-family:${SERIF};font-size:${cs(80,city)}px;font-weight:bold;font-style:italic;color:#111;">${city}</div>
            ${PH('#999')}
            <div style="font-family:${FUTURA};font-size:48px;font-weight:bold;color:#E63946;letter-spacing:4px;margin-top:8px;">FREE PHOTO SHOOT</div>
            <div style="font-family:${SANS};font-size:24px;color:#666;margin-top:12px;">Professional portraits, zero cost</div>
            <div style="font-family:${SANS};font-size:20px;color:#999;margin-top:8px;">${CTA}</div>
          </div>
        </div>
        <div style="position:absolute;bottom:480px;left:120px;width:8px;height:300px;background:#555;"></div>
        <div style="position:absolute;bottom:480px;right:120px;width:8px;height:300px;background:#555;"></div>
        <div style="position:absolute;bottom:470px;left:100px;right:100px;height:16px;background:#666;border-radius:4px;"></div>
      </div>`

    // 85: DESKTOP WALLPAPER
    case 85: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#2a2a2a;">
        <div style="position:absolute;top:40px;left:40px;right:40px;bottom:480px;background:#111;border-radius:12px;overflow:hidden;border:4px solid #333;">
          <div style="height:40px;background:linear-gradient(180deg,#444,#333);display:flex;align-items:center;padding:0 16px;gap:8px;">
            <div style="width:12px;height:12px;border-radius:50%;background:#FF5F57;"></div>
            <div style="width:12px;height:12px;border-radius:50%;background:#FEBC2E;"></div>
            <div style="width:12px;height:12px;border-radius:50%;background:#28C840;"></div>
          </div>
          <div style="position:relative;height:calc(100% - 40px);">
            <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
            <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(0,0,0,0.3);">
              <div style="font-family:${SERIF};font-size:${cs(120,city)}px;font-weight:bold;font-style:italic;color:white;text-shadow:0 4px 20px rgba(0,0,0,0.5);">${C}</div>
              ${PH('rgba(255,255,255,0.5)')}
              <div style="font-family:${FUTURA};font-size:56px;font-weight:bold;color:white;letter-spacing:6px;margin-top:12px;text-shadow:0 4px 20px rgba(0,0,0,0.5);">FREE PHOTO SHOOT</div>
              <div style="font-family:${SANS};font-size:22px;color:rgba(255,255,255,0.5);margin-top:16px;">${CTA}</div>
            </div>
          </div>
        </div>
        <div style="position:absolute;bottom:500px;left:40px;right:40px;height:60px;background:#222;border-radius:8px;display:flex;align-items:center;justify-content:center;gap:24px;">
          ${Array.from({length:8},()=>`<div style="width:36px;height:36px;border-radius:8px;background:rgba(255,255,255,0.1);"></div>`).join('')}
        </div>
      </div>`

    // 86: SHOPPING BAG
    case 86: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#E8DDD0;">
        <div style="position:absolute;top:80px;left:140px;right:140px;bottom:480px;background:white;box-shadow:0 20px 60px rgba(0,0,0,0.15);">
          <div style="position:absolute;top:-40px;left:35%;width:4px;height:80px;background:#C4A882;transform:rotate(-15deg);"></div>
          <div style="position:absolute;top:-40px;right:35%;width:4px;height:80px;background:#C4A882;transform:rotate(15deg);"></div>
          <div style="position:absolute;top:-50px;left:25%;right:25%;height:60px;border:4px solid #C4A882;border-bottom:none;border-radius:100px 100px 0 0;background:transparent;"></div>
          <div style="padding:60px 40px 40px;text-align:center;">
            <div style="font-family:${SERIF};font-size:${cs(80,city)}px;font-weight:bold;font-style:italic;color:#111;">${city}</div>
            ${PH('#999')}
            <div style="font-family:${FUTURA};font-size:40px;font-weight:bold;color:#E63946;letter-spacing:4px;margin-top:12px;">FREE PHOTO SHOOT</div>
          </div>
          <div style="margin:0 40px;height:500px;overflow:hidden;">
            <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <div style="padding:24px 40px;text-align:center;">
            <div style="font-family:${SERIF};font-size:24px;font-style:italic;color:#888;">by @madebyaidan</div>
            <div style="font-family:${SANS};font-size:18px;color:#aaa;margin-top:8px;">${CTA}</div>
          </div>
        </div>
      </div>`

    // 87: CROSSWORD PUZZLE
    case 87: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#F5F0E0;">
        <div style="position:absolute;top:40px;left:40px;right:40px;">
          <div style="font-family:${SERIF};font-size:48px;font-weight:bold;color:#111;">THE DAILY CROSSWORD</div>
          <div style="font-family:${SERIF};font-size:22px;font-style:italic;color:#888;">March 19, 2026 - ${city} Edition</div>
        </div>
        <div style="position:absolute;top:180px;left:40px;right:40px;display:grid;grid-template-columns:repeat(10,1fr);gap:2px;">
          ${(() => {
            const word1 = 'FREE'
            const word2 = 'PHOTO'
            const word3 = city.toUpperCase().slice(0,6)
            const cells = Array(60).fill(null)
            for(let i=0;i<word1.length;i++) cells[10+i]=word1[i]
            for(let i=0;i<word2.length;i++) cells[20+i]=word2[i]
            for(let i=0;i<word3.length;i++) cells[30+i]=word3[i]
            for(let i=0;i<5;i++) cells[40+i]='SHOOT'[i]
            return cells.map((c,i) => {
              if(c) return `<div style="width:100%;aspect-ratio:1;background:white;border:2px solid #111;display:flex;align-items:center;justify-content:center;font-family:${MONO};font-size:28px;font-weight:bold;color:#111;">${c}</div>`
              if(i<50&&Math.random()>0.4) return `<div style="width:100%;aspect-ratio:1;background:#111;border:2px solid #111;"></div>`
              return `<div style="width:100%;aspect-ratio:1;background:white;border:2px solid #111;"></div>`
            }).join('')
          })()}
        </div>
        <div style="position:absolute;top:820px;left:40px;right:40px;height:500px;overflow:hidden;border:4px solid #111;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;top:1360px;left:40px;right:40px;">
          <div style="font-family:${SERIF};font-size:24px;font-weight:bold;color:#111;">CLUES:</div>
          <div style="font-family:${SERIF};font-size:22px;color:#555;margin-top:8px;line-height:1.6;">
            1 Across: Cost of the photo shoot (4)<br>
            2 Across: Type of shoot (5)<br>
            3 Across: City in Philippines (${city.length})<br>
            4 Across: Photo _____ (5)
          </div>
          <div style="font-family:${SANS};font-size:20px;color:#999;margin-top:20px;">${CTA}</div>
        </div>
      </div>`

    // 88: MOVIE THEATER SCREEN
    case 88: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#0a0000;">
        <div style="position:absolute;bottom:0;left:0;right:0;height:500px;background:linear-gradient(180deg,#1a0808,#2a1010);"></div>
        <div style="position:absolute;top:80px;left:60px;right:60px;text-align:center;">
          <div style="font-family:${SERIF};font-size:24px;font-style:italic;color:rgba(255,255,255,0.3);">NOW SHOWING IN</div>
          <div style="font-family:${SERIF};font-size:${cs(140,city)}px;font-weight:bold;font-style:italic;color:white;margin-top:4px;">${C}</div>
          ${PH('rgba(255,255,255,0.4)')}
          <div style="font-family:${FUTURA};font-size:56px;font-weight:bold;color:#FFD700;letter-spacing:4px;margin-top:8px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:22px;color:rgba(255,255,255,0.3);margin-top:12px;">${CTA}</div>
        </div>
        <div style="position:absolute;top:500px;left:100px;right:100px;height:800px;background:#111;overflow:hidden;box-shadow:0 0 100px rgba(255,255,255,0.05);">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
          <div style="position:absolute;inset:0;background:radial-gradient(ellipse at center,transparent 60%,rgba(0,0,0,0.3) 100%);"></div>
        </div>
        <div style="position:absolute;bottom:480px;left:60px;right:60px;display:flex;justify-content:center;gap:4px;">
          ${Array.from({length:30},()=>`<div style="width:20px;height:24px;background:#8B4513;border-radius:4px 4px 0 0;"></div>`).join('')}
        </div>
      </div>`

    // 89: SCRAPBOOK PAGE
    case 89: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#D4C8B8;">
        <div style="position:absolute;inset:0;background:repeating-linear-gradient(90deg,transparent 0,transparent 539px,rgba(0,0,0,0.03) 540px);"></div>
        <div style="position:absolute;top:40px;left:60px;">
          <div style="font-family:${SERIF};font-size:${cs(80,city)}px;font-weight:bold;font-style:italic;color:#3a2a1a;transform:rotate(-3deg);">${city}</div>
          ${PH('#8B7355')}
        </div>
        <div style="position:absolute;top:200px;left:80px;width:480px;height:600px;background:white;padding:16px;transform:rotate(-5deg);box-shadow:4px 4px 12px rgba(0,0,0,0.15);">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;top:180px;left:120px;width:120px;height:30px;background:rgba(255,200,150,0.6);transform:rotate(-8deg);"></div>
        <div style="position:absolute;top:380px;right:60px;width:440px;height:550px;background:white;padding:16px;transform:rotate(4deg);box-shadow:4px 4px 12px rgba(0,0,0,0.15);">
          <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;top:360px;right:100px;width:100px;height:30px;background:rgba(200,220,255,0.6);transform:rotate(6deg);"></div>
        <div style="position:absolute;top:1000px;left:200px;transform:rotate(-2deg);">
          <div style="font-family:${SERIF};font-size:48px;font-weight:bold;font-style:italic;color:#E63946;">FREE PHOTO SHOOT</div>
        </div>
        <div style="position:absolute;top:1100px;left:80px;right:80px;background:rgba(255,255,240,0.9);padding:24px;transform:rotate(1deg);border:2px dashed #C4A882;">
          <div style="font-family:${SERIF};font-size:28px;font-style:italic;color:#555;line-height:1.5;">Memories from ${city}, Philippines. Free photo shoot - just message @madebyaidan for details!</div>
        </div>
        <div style="position:absolute;top:1320px;right:100px;transform:rotate(5deg);">
          <div style="font-family:${SERIF};font-size:24px;font-style:italic;color:#8B7355;">${CTA}</div>
        </div>
      </div>`

    // 90: SOCIAL MEDIA PROFILE
    case 90: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
        <div style="position:absolute;top:0;left:0;right:0;height:400px;overflow:hidden;">
          <img src="${p2}" style="width:100%;height:100%;object-fit:cover;filter:brightness(0.7);"/>
        </div>
        <div style="position:absolute;top:300px;left:50%;transform:translateX(-50%);width:200px;height:200px;border-radius:50%;border:6px solid #000;overflow:hidden;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;top:520px;left:0;right:0;text-align:center;">
          <div style="font-family:${SANS};font-size:36px;font-weight:bold;color:white;">@madebyaidan</div>
          <div style="font-family:${SANS};font-size:22px;color:rgba(255,255,255,0.5);margin-top:4px;">Photographer - ${city}, Philippines</div>
        </div>
        <div style="position:absolute;top:630px;left:60px;right:60px;display:flex;justify-content:space-around;text-align:center;border-top:1px solid rgba(255,255,255,0.1);border-bottom:1px solid rgba(255,255,255,0.1);padding:16px 0;">
          <div><div style="font-family:${SANS};font-size:28px;font-weight:bold;color:white;">500+</div><div style="font-family:${SANS};font-size:16px;color:rgba(255,255,255,0.4);">photos</div></div>
          <div><div style="font-family:${SANS};font-size:28px;font-weight:bold;color:white;">FREE</div><div style="font-family:${SANS};font-size:16px;color:rgba(255,255,255,0.4);">price</div></div>
          <div><div style="font-family:${SANS};font-size:28px;font-weight:bold;color:white;">5.0</div><div style="font-family:${SANS};font-size:16px;color:rgba(255,255,255,0.4);">rating</div></div>
        </div>
        <div style="position:absolute;top:740px;left:60px;right:60px;text-align:center;">
          <div style="font-family:${SANS};font-size:24px;color:rgba(255,255,255,0.7);line-height:1.5;">Offering FREE photo shoots in ${city}. Professional quality portraits at absolutely no cost.</div>
          <div style="background:white;padding:14px;border-radius:8px;margin-top:16px;">
            <div style="font-family:${SANS};font-size:22px;font-weight:bold;color:#111;">Book Free Session</div>
          </div>
        </div>
        <div style="position:absolute;top:960px;left:0;right:0;display:grid;grid-template-columns:repeat(3,1fr);gap:2px;">
          ${[p,p2,p3,p,p2,p3].map(ph => `
            <div style="height:180px;overflow:hidden;"><img src="${ph}" style="width:100%;height:100%;object-fit:cover;"/></div>
          `).join('')}
        </div>
        <div style="position:absolute;top:1340px;left:60px;right:60px;text-align:center;">
          <div style="font-family:${DISPLAY};font-size:${cs(80,city)}px;color:white;text-transform:uppercase;">${C}</div>
          ${PH('rgba(255,255,255,0.4)')}
          <div style="font-family:${FUTURA};font-size:44px;font-weight:bold;color:white;letter-spacing:4px;margin-top:4px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:22px;color:rgba(255,255,255,0.4);margin-top:12px;">${CTA}</div>
        </div>
      </div>`

    // 91: MUSEUM EXHIBIT LABEL
    case 91: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#2a2a2a;">
        <div style="position:absolute;top:60px;left:60px;right:60px;text-align:center;">
          <div style="font-family:${FUTURA};font-size:22px;font-weight:bold;color:rgba(255,255,255,0.4);letter-spacing:10px;">THE MUSEUM OF FREE ART</div>
        </div>
        <div style="position:absolute;top:140px;left:100px;right:100px;height:900px;overflow:hidden;box-shadow:0 0 0 12px #111,0 0 0 14px rgba(255,255,255,0.1);">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;top:1080px;left:200px;right:200px;background:white;padding:30px;box-shadow:0 4px 12px rgba(0,0,0,0.2);">
          <div style="font-family:${SERIF};font-size:${cs(48,city)}px;font-weight:bold;font-style:italic;color:#111;">${city}, Philippines</div>
          <div style="font-family:${SERIF};font-size:22px;font-style:italic;color:#666;margin-top:4px;">Free Photo Shoot, 2026</div>
          <div style="width:40px;height:2px;background:#111;margin:12px 0;"></div>
          <div style="font-family:${SANS};font-size:18px;color:#666;line-height:1.5;">Digital photography on location<br>Courtesy of @madebyaidan<br>Complimentary - No admission fee</div>
          <div style="font-family:${SANS};font-size:16px;color:#999;margin-top:12px;">${CTA}</div>
        </div>
      </div>`

    // 92: LAPTOP / PHONE MOCKUP
    case 92: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:linear-gradient(180deg,#1a1a2e,#0a0a1a);">
        <div style="position:absolute;top:80px;left:60px;right:60px;text-align:center;">
          <div style="font-family:${SERIF};font-size:${cs(120,city)}px;font-weight:bold;font-style:italic;color:white;">${C}</div>
          ${PH('rgba(255,255,255,0.4)')}
          <div style="font-family:${FUTURA};font-size:52px;font-weight:bold;color:white;letter-spacing:4px;margin-top:8px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:22px;color:rgba(255,255,255,0.4);margin-top:10px;">${CTA}</div>
        </div>
        <div style="position:absolute;top:440px;left:50%;transform:translateX(-50%);width:360px;height:720px;background:#111;border-radius:40px;border:6px solid #333;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.5);">
          <div style="position:absolute;top:0;left:50%;transform:translateX(-50%);width:120px;height:30px;background:#111;border-radius:0 0 16px 16px;z-index:2;"></div>
          <div style="position:absolute;inset:4px;border-radius:36px;overflow:hidden;">
            <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
            <div style="position:absolute;bottom:0;left:0;right:0;padding:20px;background:linear-gradient(transparent,rgba(0,0,0,0.8));">
              <div style="font-family:${SANS};font-size:20px;font-weight:bold;color:white;">Free Photo Shoot</div>
              <div style="font-family:${SANS};font-size:16px;color:rgba(255,255,255,0.6);">${city}, Philippines</div>
            </div>
          </div>
        </div>
        <div style="position:absolute;top:500px;left:60px;width:280px;height:560px;background:#111;border-radius:32px;border:5px solid #333;overflow:hidden;transform:rotate(-15deg) translateX(-40px);box-shadow:0 20px 40px rgba(0,0,0,0.4);opacity:0.7;">
          <div style="position:absolute;inset:4px;border-radius:28px;overflow:hidden;">
            <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
        </div>
        <div style="position:absolute;top:500px;right:60px;width:280px;height:560px;background:#111;border-radius:32px;border:5px solid #333;overflow:hidden;transform:rotate(15deg) translateX(40px);box-shadow:0 20px 40px rgba(0,0,0,0.4);opacity:0.7;">
          <div style="position:absolute;inset:4px;border-radius:28px;overflow:hidden;">
            <img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
        </div>
      </div>`

    // 93: POWER-UP / LEVEL-UP SCREEN
    case 93: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#0a0a1a;">
        <div style="position:absolute;inset:0;background:radial-gradient(ellipse at center,rgba(0,200,255,0.1) 0%,transparent 60%);"></div>
        <div style="position:absolute;top:80px;left:0;right:0;text-align:center;">
          <div style="font-family:${MONO};font-size:28px;color:#FFD700;letter-spacing:6px;">LEVEL UP!</div>
          <div style="font-family:${DISPLAY};font-size:${cs(120,city)}px;color:white;text-transform:uppercase;margin-top:8px;text-shadow:0 0 30px rgba(0,200,255,0.4);">${C}</div>
          ${PH('rgba(0,200,255,0.5)', MONO)}
        </div>
        <div style="position:absolute;top:380px;left:50%;transform:translateX(-50%);width:480px;height:480px;border-radius:50%;background:linear-gradient(135deg,rgba(0,200,255,0.2),rgba(255,215,0,0.2));display:flex;align-items:center;justify-content:center;box-shadow:0 0 60px rgba(0,200,255,0.2);">
          <div style="width:420px;height:420px;border-radius:50%;overflow:hidden;border:4px solid rgba(0,200,255,0.3);">
            <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
        </div>
        <div style="position:absolute;top:920px;left:80px;right:80px;">
          <div style="font-family:${MONO};font-size:36px;font-weight:bold;color:#FFD700;text-align:center;">FREE PHOTO SHOOT UNLOCKED!</div>
          <div style="margin-top:20px;">
            ${[{stat:'PHOTOS',val:'50+',max:100},{stat:'COST',val:'FREE',max:100},{stat:'VIBES',val:'MAX',max:100}].map(s => `
              <div style="display:flex;align-items:center;gap:16px;margin-bottom:12px;">
                <div style="font-family:${MONO};font-size:18px;color:rgba(255,255,255,0.5);width:80px;">${s.stat}</div>
                <div style="flex:1;height:8px;background:rgba(255,255,255,0.1);border-radius:4px;overflow:hidden;">
                  <div style="width:100%;height:100%;background:linear-gradient(90deg,#00BFFF,#FFD700);border-radius:4px;"></div>
                </div>
                <div style="font-family:${MONO};font-size:18px;color:#FFD700;width:60px;text-align:right;">${s.val}</div>
              </div>
            `).join('')}
          </div>
        </div>
        <div style="position:absolute;bottom:540px;left:0;right:0;text-align:center;">
          <div style="font-family:${MONO};font-size:22px;color:rgba(0,200,255,0.4);">PRESS START // ${CTA}</div>
        </div>
      </div>`

    // 94: VS FIGHTING GAME
    case 94: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#111;">
        <div style="position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,0,0,0.1),rgba(0,0,255,0.1));"></div>
        <div style="position:absolute;top:60px;left:0;right:0;text-align:center;">
          <div style="font-family:${DISPLAY};font-size:${cs(100,city)}px;color:white;text-transform:uppercase;text-shadow:0 4px 12px rgba(0,0,0,0.5);">${C}</div>
          ${PH('rgba(255,255,255,0.4)')}
        </div>
        <div style="position:absolute;top:280px;left:40px;width:480px;height:700px;overflow:hidden;border:4px solid #FF4444;border-radius:8px;transform:perspective(800px) rotateY(5deg);">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
          <div style="position:absolute;bottom:0;left:0;right:0;padding:16px;background:linear-gradient(transparent,rgba(255,0,0,0.8));">
            <div style="font-family:${DISPLAY};font-size:36px;color:white;">YOU</div>
          </div>
        </div>
        <div style="position:absolute;top:280px;right:40px;width:480px;height:700px;overflow:hidden;border:4px solid #4444FF;border-radius:8px;transform:perspective(800px) rotateY(-5deg);">
          <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
          <div style="position:absolute;bottom:0;left:0;right:0;padding:16px;background:linear-gradient(transparent,rgba(0,0,255,0.8));">
            <div style="font-family:${DISPLAY};font-size:36px;color:white;text-align:right;">CAMERA</div>
          </div>
        </div>
        <div style="position:absolute;top:520px;left:50%;transform:translate(-50%,-50%);z-index:2;">
          <div style="font-family:${DISPLAY};font-size:120px;color:#FFD700;text-shadow:0 0 30px rgba(255,215,0,0.5),0 4px 12px rgba(0,0,0,0.8);">VS</div>
        </div>
        <div style="position:absolute;top:1040px;left:60px;right:60px;text-align:center;">
          <div style="font-family:${DISPLAY};font-size:64px;color:#FFD700;">FREE PHOTO SHOOT</div>
          <div style="font-family:${MONO};font-size:22px;color:rgba(255,255,255,0.4);margin-top:12px;">ROUND 1 - FIGHT! // ${CTA}</div>
        </div>
      </div>`

    // 95: FILM FESTIVAL BADGE
    case 95: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#0a0a0a;">
        <div style="position:absolute;top:80px;left:120px;right:120px;background:white;border-radius:16px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.4);">
          <div style="background:#111;padding:24px;text-align:center;">
            <div style="font-family:${FUTURA};font-size:24px;font-weight:bold;color:white;letter-spacing:8px;">PHOTO FESTIVAL</div>
            <div style="font-family:${SANS};font-size:18px;color:rgba(255,255,255,0.5);">${city}, Philippines - 2026</div>
          </div>
          <div style="padding:30px;text-align:center;">
            <div style="height:500px;border-radius:12px;overflow:hidden;margin-bottom:20px;">
              <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
            </div>
            <div style="font-family:${SERIF};font-size:${cs(56,city)}px;font-weight:bold;font-style:italic;color:#111;">${city}</div>
            ${PH('#999')}
            <div style="font-family:${FUTURA};font-size:36px;font-weight:bold;color:#E63946;letter-spacing:4px;margin-top:8px;">FREE PHOTO SHOOT</div>
            <div style="width:200px;height:2px;background:#eee;margin:20px auto;"></div>
            <div style="font-family:${SANS};font-size:22px;color:#666;">OFFICIAL SELECTION</div>
            <div style="font-family:${SANS};font-size:20px;color:#999;margin-top:8px;">Photographer: Aidan Torrence</div>
            <div style="font-family:${SANS};font-size:18px;color:#999;margin-top:4px;">Access: ALL AREAS (FREE)</div>
            <div style="display:flex;gap:2px;justify-content:center;margin-top:16px;">${Array.from({length:30},(_,i)=>`<div style="width:${i%3===0?3:2}px;height:50px;background:#111;"></div>`).join('')}</div>
          </div>
        </div>
        <div style="position:absolute;bottom:540px;left:0;right:0;text-align:center;">
          <div style="font-family:${SANS};font-size:22px;color:rgba(255,255,255,0.4);">${CTA}</div>
        </div>
      </div>`

    // 96: APPLE MUSIC NOW PLAYING
    case 96: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:linear-gradient(180deg,#E63946,#8B0000);">
        <div style="position:absolute;inset:0;background:radial-gradient(ellipse at top,rgba(255,255,255,0.1) 0%,transparent 60%);"></div>
        <div style="position:absolute;top:100px;left:0;right:0;text-align:center;">
          <div style="font-family:${SANS};font-size:22px;color:rgba(255,255,255,0.6);">Now Playing</div>
        </div>
        <div style="position:absolute;top:180px;left:50%;transform:translateX(-50%);width:700px;height:700px;border-radius:20px;overflow:hidden;box-shadow:0 30px 80px rgba(0,0,0,0.4);">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;top:940px;left:80px;right:80px;">
          <div style="font-family:${SANS};font-size:${cs(44,city)}px;font-weight:bold;color:white;">${city} - Free Photo Shoot</div>
          <div style="font-family:${SANS};font-size:24px;color:rgba(255,255,255,0.6);margin-top:4px;">Aidan Torrence - Philippines</div>
          <div style="margin-top:24px;">
            <div style="height:4px;background:rgba(255,255,255,0.2);border-radius:2px;">
              <div style="width:45%;height:100%;background:white;border-radius:2px;"></div>
            </div>
            <div style="display:flex;justify-content:space-between;margin-top:4px;">
              <div style="font-family:${SANS};font-size:16px;color:rgba(255,255,255,0.4);">1:34</div>
              <div style="font-family:${SANS};font-size:16px;color:rgba(255,255,255,0.4);">3:30</div>
            </div>
          </div>
          <div style="display:flex;justify-content:center;align-items:center;gap:50px;margin-top:20px;">
            <div style="font-family:${SANS};font-size:32px;color:rgba(255,255,255,0.6);">|&lt;&lt;</div>
            <div style="width:70px;height:70px;border-radius:50%;background:white;display:flex;align-items:center;justify-content:center;">
              <div style="width:0;height:0;border-left:24px solid #E63946;border-top:14px solid transparent;border-bottom:14px solid transparent;margin-left:6px;"></div>
            </div>
            <div style="font-family:${SANS};font-size:32px;color:rgba(255,255,255,0.6);">&gt;&gt;|</div>
          </div>
        </div>
        <div style="position:absolute;bottom:540px;left:0;right:0;text-align:center;">
          <div style="font-family:${SANS};font-size:22px;color:rgba(255,255,255,0.4);">${CTA}</div>
        </div>
      </div>`

    // 97: AUCTION CATALOG
    case 97: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#F8F4E8;">
        <div style="position:absolute;top:60px;left:60px;right:60px;">
          <div style="display:flex;justify-content:space-between;align-items:flex-end;border-bottom:2px solid #111;padding-bottom:12px;">
            <div style="font-family:${SERIF};font-size:24px;font-style:italic;color:#888;">Lot 001</div>
            <div style="font-family:${SERIF};font-size:32px;font-weight:bold;color:#111;">AUCTION</div>
            <div style="font-family:${SERIF};font-size:24px;font-style:italic;color:#888;">Est. FREE</div>
          </div>
        </div>
        <div style="position:absolute;top:160px;left:80px;right:80px;">
          <div style="font-family:${SERIF};font-size:${cs(72,city)}px;font-weight:bold;font-style:italic;color:#111;text-align:center;">${city}, Philippines</div>
          ${PH('#888')}
          <div style="font-family:${SERIF};font-size:22px;font-style:italic;color:#888;text-align:center;margin-top:4px;">Free Photo Shoot, 2026</div>
        </div>
        <div style="position:absolute;top:380px;left:100px;right:100px;height:700px;overflow:hidden;border:8px solid white;box-shadow:0 8px 30px rgba(0,0,0,0.1);">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;top:1120px;left:80px;right:80px;">
          <div style="font-family:${SERIF};font-size:20px;font-style:italic;color:#666;line-height:1.6;">A rare opportunity: complimentary portrait photography session by Aidan Torrence (@madebyaidan). Professional quality digital photography at scenic ${city} locations. Duration 30-60 minutes. No reserve.</div>
          <div style="border-top:2px solid #111;margin-top:20px;padding-top:20px;display:flex;justify-content:space-between;">
            <div>
              <div style="font-family:${FUTURA};font-size:20px;color:#888;letter-spacing:4px;">ESTIMATE</div>
              <div style="font-family:${SERIF};font-size:44px;font-weight:bold;color:#E63946;">FREE</div>
            </div>
            <div style="text-align:right;">
              <div style="font-family:${FUTURA};font-size:20px;color:#888;letter-spacing:4px;">CONDITION</div>
              <div style="font-family:${SERIF};font-size:44px;font-weight:bold;color:#111;">MINT</div>
            </div>
          </div>
          <div style="font-family:${SANS};font-size:20px;color:#999;margin-top:20px;">${CTA}</div>
        </div>
      </div>`

    // 98: PRESCRIPTION LABEL
    case 98: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#F0F8FF;">
        <div style="position:absolute;top:60px;left:60px;right:60px;text-align:center;">
          <div style="font-family:${SERIF};font-size:${cs(100,city)}px;font-weight:bold;font-style:italic;color:#111;">${C}</div>
          ${PH('#666')}
          <div style="font-family:${FUTURA};font-size:48px;font-weight:bold;color:#0066CC;letter-spacing:4px;margin-top:8px;">FREE PHOTO SHOOT</div>
        </div>
        <div style="position:absolute;top:340px;left:80px;right:80px;background:white;border:3px solid #0066CC;border-radius:12px;padding:30px;box-shadow:0 8px 24px rgba(0,0,0,0.1);">
          <div style="display:flex;justify-content:space-between;border-bottom:2px solid #eee;padding-bottom:16px;margin-bottom:16px;">
            <div style="font-family:${SANS};font-size:24px;font-weight:bold;color:#0066CC;">Rx PHOTO PHARMACY</div>
            <div style="font-family:${MONO};font-size:18px;color:#999;">No. 000001</div>
          </div>
          <div style="margin-bottom:20px;">
            <div style="font-family:${SANS};font-size:18px;color:#999;">PATIENT:</div>
            <div style="font-family:${SANS};font-size:24px;font-weight:bold;color:#111;">YOU</div>
          </div>
          <div style="height:380px;border-radius:8px;overflow:hidden;margin-bottom:20px;">
            <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <div style="background:#F0F8FF;border-radius:8px;padding:20px;margin-bottom:16px;">
            <div style="font-family:${SANS};font-size:22px;font-weight:bold;color:#111;">Rx: One (1) Free Photo Shoot</div>
            <div style="font-family:${SANS};font-size:20px;color:#666;margin-top:8px;line-height:1.5;">
              DOSAGE: 30-60 minutes<br>
              LOCATION: ${city}, Philippines<br>
              REFILLS: Unlimited<br>
              SIDE EFFECTS: Excessive confidence, looking amazing
            </div>
          </div>
          <div style="border-top:2px solid #eee;padding-top:16px;display:flex;justify-content:space-between;">
            <div style="font-family:${SANS};font-size:18px;color:#999;">Dr. Aidan Torrence</div>
            <div style="font-family:${SANS};font-size:18px;color:#0066CC;font-weight:bold;">COST: FREE</div>
          </div>
        </div>
        <div style="position:absolute;bottom:540px;left:0;right:0;text-align:center;">
          <div style="font-family:${SANS};font-size:22px;color:#999;">${CTA}</div>
        </div>
      </div>`

    // 99: PHOTO ALBUM PAGE
    case 99: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#3a3028;">
        <div style="position:absolute;inset:40px;background:#222;border-radius:4px;box-shadow:inset 0 0 40px rgba(0,0,0,0.3);"></div>
        <div style="position:absolute;top:80px;left:80px;right:80px;text-align:center;">
          <div style="font-family:${SERIF};font-size:${cs(100,city)}px;font-weight:bold;font-style:italic;color:rgba(255,255,255,0.8);">${C}</div>
          ${PH('rgba(255,255,255,0.4)')}
          <div style="font-family:${FUTURA};font-size:48px;font-weight:bold;color:rgba(255,255,255,0.7);letter-spacing:4px;margin-top:8px;">FREE PHOTO SHOOT</div>
        </div>
        <div style="position:absolute;top:380px;left:120px;width:500px;height:400px;background:white;padding:16px;transform:rotate(-6deg);box-shadow:0 8px 24px rgba(0,0,0,0.4);">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;top:580px;right:100px;width:500px;height:400px;background:white;padding:16px;transform:rotate(4deg);box-shadow:0 8px 24px rgba(0,0,0,0.4);">
          <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;top:820px;left:200px;width:400px;height:320px;background:white;padding:12px;transform:rotate(-2deg);box-shadow:0 8px 24px rgba(0,0,0,0.4);">
          <img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;top:1180px;left:80px;right:80px;text-align:center;">
          <div style="font-family:${SERIF};font-size:36px;font-style:italic;color:rgba(255,255,255,0.5);">memories from ${city}, Philippines</div>
          <div style="font-family:${SANS};font-size:22px;color:rgba(255,255,255,0.3);margin-top:16px;">${CTA}</div>
        </div>
      </div>`

    default: return `<div style="width:1080px;height:1920px;background:#111;display:flex;align-items:center;justify-content:center;">
      <div style="font-family:${SANS};font-size:48px;color:white;">Variant ${variant}</div>
    </div>`
  }
}

// Build 300 slides: 100 per city
const slides = []

for (let ci = 0; ci < cities.length; ci++) {
  const city = cities[ci]
  for (let v = 0; v < 100; v++) {
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
