import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, 'output')
const IMG_DIR = '/Users/aidantorrence/Documents/aidan-modern/public/images/large'

fs.mkdirSync(OUT, { recursive: true })

function img(filename) {
  const buf = fs.readFileSync(path.join(IMG_DIR, filename))
  return `data:image/jpeg;base64,${buf.toString('base64')}`
}

// Portrait photos (h > w) — for portrait-oriented containers
const portraitPhotos = [
  img('manila-gallery-dsc-0075.jpg'),       // 976x1551
  img('manila-gallery-dsc-0130.jpg'),       // 968x1508
  img('manila-gallery-dsc-0911.jpg'),       // 957x1510
  img('manila-gallery-dsc-0190.jpg'),       // 992x1505
  img('manila-gallery-market-001.jpg'),     // 1600x2362
  img('manila-gallery-urban-003.jpg'),      // 1228x1818
  img('manila-gallery-canal-001.jpg'),      // 1600x2392
  img('manila-gallery-ivy-002.jpg'),        // 1600x2380
  img('manila-gallery-park-001.jpg'),       // 1600x2400
  img('manila-gallery-statue-001.jpg'),     // 1600x2392
  img('manila-gallery-street-001.jpg'),     // 1600x2387
  img('manila-gallery-closeup-001.jpg'),    // 1059x1600
  img('manila-gallery-shadow-001.jpg'),     // 1067x1600
  img('manila-gallery-floor-001.jpg'),      // 1600x2408
  img('manila-gallery-tropical-001.jpg'),   // 1600x2384
  img('manila-gallery-white-001.jpg'),      // 1600x2366
  img('manila-gallery-urban-001.jpg'),      // 1228x1818
]

// Landscape photos (w > h) — for landscape-oriented containers
const landscapePhotos = [
  img('manila-gallery-canal-002.jpg'),      // 1600x1072
  img('manila-gallery-garden-001.jpg'),     // 1600x1061
  img('manila-gallery-garden-002.jpg'),     // 1600x1061
  img('manila-gallery-ivy-001.jpg'),        // 1600x1061
  img('manila-gallery-rocks-001.jpg'),      // 1600x1075
  img('manila-gallery-night-001.jpg'),      // 1080x1080 (square — works for landscape)
  img('manila-gallery-night-002.jpg'),      // 1080x1080
  img('manila-gallery-night-003.jpg'),      // 1080x1080
]

// Variants that have landscape-oriented image containers
const LANDSCAPE_VARIANTS = new Set([0, 1, 2, 6, 9, 10, 13, 19, 23, 29])

// macOS system fonts that render perfectly in Playwright
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

// ALL main text (city, "FREE PHOTO SHOOT") stays in the top 75% (above y=1440)
function makeSlide(city, p, p2, p3, variant) {
  const C = city.toUpperCase()
  // "Philippines" subtitle — pass color to match variant theme
  const PH = (color, font = SANS) => `<div style="font-family:${font};font-size:20px;letter-spacing:4px;color:${color};margin-top:2px;">PHILIPPINES</div>`
  const bg = `<img src="${p}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;"`

  switch (variant) {

    // 0: PHOTO BOOTH STRIP
    case 0: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#1a0808;">
        <div style="position:absolute;inset:0;background:linear-gradient(180deg,#3d0c0c 0%,#6b1a1a 30%,#4a1212 70%,#2a0808 100%);"></div>
        <div style="position:absolute;inset:0;background:repeating-linear-gradient(90deg,rgba(0,0,0,0.15) 0px,transparent 2px,transparent 35px);"></div>
        <div style="position:absolute;top:0;left:0;right:0;height:20px;background:linear-gradient(180deg,#c4974a,#a0763c,#6b4f2a);box-shadow:0 4px 12px rgba(0,0,0,0.5);z-index:2;"></div>
        <!-- Top text -->
        <div style="position:absolute;top:40px;left:60px;right:60px;">
          <div style="font-family:${SERIF};font-size:${cs(100,city)}px;font-weight:bold;font-style:italic;color:#FFD700;text-shadow:0 4px 12px rgba(0,0,0,0.8);">${C}</div>
          ${PH('rgba(255,215,0,0.5)')}
          <div style="font-family:${FUTURA};font-size:46px;font-weight:bold;color:white;letter-spacing:6px;margin-top:4px;">FREE PHOTO SHOOT</div>
        </div>
        <!-- White photo strip -->
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
        <!-- Top text -->
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
          <div style="font-family:${SERIF};font-size:38px;font-style:italic;color:#333;margin-top:14px;text-align:center;">free photo shoot ♥</div>
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
        <!-- Text area top -->
        <div style="position:absolute;top:60px;left:100px;right:100px;text-align:center;">
          <div style="font-family:${SERIF};font-size:${cs(130,city)}px;font-weight:bold;font-style:italic;color:white;">${C}</div>
          ${PH('rgba(255,255,255,0.4)')}
          <div style="font-family:${FUTURA};font-size:56px;font-weight:bold;color:#FF6600;letter-spacing:6px;margin-top:4px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${MONO};font-size:20px;color:rgba(255,102,0,0.5);margin-top:12px;">${CTA}</div>
        </div>
        <!-- Frame 1 -->
        <div style="position:absolute;top:420px;left:100px;right:100px;height:560px;overflow:hidden;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;top:390px;left:110px;font-family:${MONO};font-size:18px;color:#FF6600;letter-spacing:2px;">▶ 36A  KODAK 400TX</div>
        <!-- Frame 2 -->
        <div style="position:absolute;top:1040px;left:100px;right:100px;height:560px;overflow:hidden;">
          <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;top:1010px;left:110px;font-family:${MONO};font-size:18px;color:#FF6600;">▶ 37A  KODAK 400TX</div>
      </div>`
    }

    // 3: CONTACT SHEET
    case 3: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#f5f0e8;">
        <!-- Top text -->
        <div style="position:absolute;top:50px;left:50px;right:50px;display:flex;justify-content:space-between;align-items:flex-end;">
          <div>
            <div style="font-family:${SERIF};font-size:${cs(100,city)}px;font-weight:bold;font-style:italic;color:#111;">${C}</div>
            ${PH('rgba(0,0,0,0.35)')}
            <div style="font-family:${FUTURA};font-size:48px;font-weight:bold;color:#E63946;letter-spacing:4px;">FREE PHOTO SHOOT</div>
          </div>
          <div style="font-family:${SERIF};font-size:32px;font-style:italic;color:#E63946;transform:rotate(-8deg);">selects ✓</div>
        </div>
        <!-- Grid of photos -->
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
        <div style="position:absolute;top:680px;left:0;right:0;height:12px;background:rgba(255,255,255,0.15);filter:blur(2px);"></div>
        <!-- REC -->
        <div style="position:absolute;top:60px;left:60px;display:flex;align-items:center;gap:14px;">
          <div style="width:20px;height:20px;border-radius:50%;background:#FF0000;box-shadow:0 0 12px rgba(255,0,0,0.8);"></div>
          <div style="font-family:${MONO};font-size:28px;font-weight:bold;color:white;text-shadow:0 0 8px rgba(255,255,255,0.5);">REC</div>
        </div>
        <div style="position:absolute;top:60px;right:60px;font-family:${MONO};font-size:24px;color:rgba(255,255,255,0.7);">03:14:22 PM</div>
        <div style="position:absolute;top:110px;right:60px;font-family:${MONO};font-size:20px;color:rgba(255,255,255,0.5);">SP ▶</div>
        <!-- Main text — upper area -->
        <div style="position:absolute;top:200px;left:60px;right:60px;">
          <div style="font-family:${DISPLAY};font-size:${cs(200,city)}px;color:white;text-transform:uppercase;line-height:0.85;text-shadow:0 4px 8px rgba(0,0,0,0.8),0 0 30px rgba(255,255,255,0.1);">${C}</div>
          ${PH('rgba(255,255,255,0.5)', MONO)}
          <div style="font-family:${FUTURA};font-size:68px;font-weight:bold;color:white;letter-spacing:6px;margin-top:12px;text-shadow:0 2px 6px rgba(0,0,0,0.8);">FREE PHOTO SHOOT</div>
          <div style="font-family:${MONO};font-size:22px;color:rgba(255,255,255,0.5);margin-top:16px;">${CTA}</div>
        </div>
        <div style="position:absolute;bottom:540px;right:60px;font-family:${MONO};font-size:36px;font-weight:bold;color:rgba(255,255,255,0.3);">CH 03</div>
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
        <!-- Header -->
        <div style="position:absolute;top:90px;left:50px;right:50px;text-align:center;">
          <div style="font-family:${DISPLAY};font-size:80px;color:#FFD700;text-shadow:0 0 20px rgba(255,215,0,0.5),0 4px 8px rgba(0,0,0,0.8);letter-spacing:8px;">★ FREE SHOOT ★</div>
        </div>
        <!-- City + text -->
        <div style="position:absolute;top:220px;left:60px;right:60px;text-align:center;">
          <div style="font-family:${SERIF};font-size:${cs(150,city)}px;font-weight:bold;font-style:italic;color:#FFD700;text-shadow:0 0 30px rgba(255,215,0,0.4),0 4px 12px rgba(0,0,0,0.8);">${C}</div>
          ${PH('rgba(255,215,0,0.4)')}
          <div style="font-family:${FUTURA};font-size:60px;font-weight:bold;color:white;letter-spacing:6px;margin-top:8px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:22px;color:rgba(255,215,0,0.4);margin-top:14px;">${CTA}</div>
        </div>
        <!-- 3 reel windows -->
        <div style="position:absolute;top:640px;left:80px;right:80px;display:flex;gap:20px;">
          ${[p,p2,p3].map(ph => `
            <div style="flex:1;height:500px;border:4px solid #FFD700;border-radius:8px;overflow:hidden;box-shadow:inset 0 0 20px rgba(0,0,0,0.5),0 4px 12px rgba(0,0,0,0.4);">
              <img src="${ph}" style="width:100%;height:100%;object-fit:cover;"/>
            </div>
          `).join('')}
        </div>
        <div style="position:absolute;top:888px;left:60px;right:60px;height:4px;background:#FFD700;box-shadow:0 0 10px rgba(255,215,0,0.5);"></div>
        <div style="position:absolute;top:640px;right:20px;width:30px;height:300px;background:linear-gradient(90deg,#888,#ccc,#888);border-radius:4px;">
          <div style="position:absolute;top:-20px;left:-10px;width:50px;height:50px;border-radius:50%;background:radial-gradient(circle at 40% 40%,#FF4444,#CC0000,#880000);box-shadow:0 4px 12px rgba(0,0,0,0.5);"></div>
        </div>
        <div style="position:absolute;bottom:540px;left:50px;right:50px;height:8px;background:linear-gradient(90deg,#8B7355,#D4AF37,#FFD700,#D4AF37,#8B7355);border-radius:4px;"></div>
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
        <div style="position:absolute;inset:0;background:repeating-linear-gradient(180deg,transparent 0px,rgba(0,0,0,0.1) 1px,transparent 2px,transparent 3px);"></div>
        <!-- Score -->
        <div style="position:absolute;top:60px;right:60px;text-align:right;">
          <div style="font-family:${MONO};font-size:22px;color:rgba(255,255,255,0.4);">SCORE</div>
          <div style="font-family:${MONO};font-size:42px;font-weight:bold;color:#00f0f0;text-shadow:0 0 10px rgba(0,240,240,0.5);">099999</div>
        </div>
        <div style="position:absolute;top:60px;left:60px;">
          <div style="font-family:${MONO};font-size:22px;color:rgba(255,255,255,0.4);">LEVEL</div>
          <div style="font-family:${MONO};font-size:42px;font-weight:bold;color:#f0a000;text-shadow:0 0 10px rgba(240,160,0,0.5);">FREE</div>
        </div>
        <!-- City + text -->
        <div style="position:absolute;top:200px;left:60px;right:60px;text-align:center;">
          <div style="font-family:${MONO};font-size:${cs(120,city)}px;font-weight:bold;color:white;text-shadow:0 0 20px rgba(0,240,240,0.4);">${C}</div>
          ${PH('rgba(0,240,240,0.35)', MONO)}
          <div style="font-family:${MONO};font-size:48px;font-weight:bold;color:#00f0f0;text-shadow:0 0 15px rgba(0,240,240,0.5);margin-top:8px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${MONO};font-size:18px;color:rgba(0,240,240,0.35);margin-top:14px;">${CTA}</div>
        </div>
        <!-- Photo -->
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
        <!-- Masthead -->
        <div style="position:absolute;top:50px;left:60px;right:60px;display:flex;justify-content:space-between;align-items:flex-start;">
          <div>
            <div style="font-family:${FUTURA};font-size:22px;font-weight:bold;color:rgba(255,255,255,0.6);letter-spacing:10px;">ISSUE 47 • 2026</div>
            <div style="font-family:${SERIF};font-size:100px;font-weight:bold;font-style:italic;color:white;line-height:0.85;margin-top:4px;">AIDAN</div>
          </div>
          <div style="font-family:${SANS};font-size:20px;color:rgba(255,255,255,0.5);">₱0.00</div>
        </div>
        <!-- Cover lines — mid area -->
        <div style="position:absolute;top:800px;left:60px;right:60px;">
          <div style="font-family:${FUTURA};font-size:36px;font-weight:bold;color:white;letter-spacing:4px;margin-bottom:12px;">EXCLUSIVE</div>
          <div style="font-family:${SERIF};font-size:${cs(150,city)}px;font-weight:bold;font-style:italic;color:white;line-height:0.82;">${C}</div>
          ${PH('rgba(255,255,255,0.4)')}
          <div style="font-family:${FUTURA};font-size:64px;font-weight:bold;color:#FF4444;letter-spacing:4px;margin-top:12px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:24px;color:rgba(255,255,255,0.5);margin-top:16px;">${CTA}</div>
        </div>
        <!-- Barcode -->
        <div style="position:absolute;bottom:540px;right:60px;display:flex;gap:2px;">
          ${Array.from({length:20},(_,i)=>`<div style="width:${i%3===0?4:2}px;height:50px;background:rgba(255,255,255,0.4);"></div>`).join('')}
        </div>
      </div>`

    // 8: MOVIE POSTER
    case 8: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
        <!-- Production line -->
        <div style="position:absolute;top:0;left:0;right:0;height:120px;background:#000;display:flex;align-items:flex-end;padding:0 60px 16px;">
          <div style="font-family:${FUTURA};font-size:24px;color:rgba(255,255,255,0.5);letter-spacing:12px;">A MADEBYAIDAN PRODUCTION</div>
        </div>
        <!-- Title block -->
        <div style="position:absolute;top:140px;left:60px;right:60px;">
          <div style="font-family:${SERIF};font-size:${cs(160,city)}px;font-weight:bold;font-style:italic;color:white;line-height:0.82;">${C}</div>
          ${PH('rgba(255,255,255,0.4)')}
          <div style="font-family:${FUTURA};font-size:62px;font-weight:bold;color:#FFD700;letter-spacing:6px;margin-top:12px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:22px;color:rgba(255,255,255,0.4);margin-top:12px;">${CTA}</div>
        </div>
        <!-- Photo -->
        <div style="position:absolute;top:560px;left:0;right:0;bottom:0;overflow:hidden;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;filter:saturate(1.1) contrast(1.05);"/>
          <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0.5) 0%,transparent 30%,transparent 70%,rgba(0,0,0,0.3) 100%);"></div>
        </div>
        <!-- Credits at very bottom (minor text, OK here) -->
        <div style="position:absolute;bottom:540px;left:60px;right:60px;">
          <div style="font-family:${SANS};font-size:18px;color:rgba(255,255,255,0.3);letter-spacing:2px;">DIRECTED BY AIDAN TORRENCE • STARRING YOU • ${C} • NOW BOOKING</div>
        </div>
      </div>`

    // 9: GIG POSTER
    case 9: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#F5F0E0;">
        <!-- Top text -->
        <div style="position:absolute;top:40px;left:50px;right:50px;">
          <div style="font-family:${DISPLAY};font-size:${cs(160,city)}px;color:#111;text-transform:uppercase;line-height:0.82;">${C}</div>
          ${PH('rgba(0,0,0,0.35)')}
          <div style="font-family:${DISPLAY};font-size:72px;color:#E63946;text-transform:uppercase;letter-spacing:2px;margin-top:4px;">FREE PHOTO SHOOT</div>
        </div>
        <!-- Photo strip -->
        <div style="position:absolute;top:380px;left:0;right:0;height:600px;overflow:hidden;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;filter:contrast(1.3) saturate(0.8);"/>
        </div>
        <!-- Details -->
        <div style="position:absolute;top:1020px;left:50px;right:50px;">
          <div style="width:100%;height:3px;background:#111;margin-bottom:24px;"></div>
          <div style="display:flex;justify-content:space-between;align-items:flex-start;">
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
              <div style="font-family:${SERIF};font-size:24px;font-style:italic;color:#555;margin-top:8px;">@madebyaidan</div>
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
            <div style="font-family:${SERIF};font-size:16px;color:#888;margin-top:2px;letter-spacing:2px;">EST. 2026 • "ALL THE PHOTOS FIT TO SHOOT"</div>
          </div>
        </div>
        <div style="position:absolute;top:180px;left:50px;right:50px;height:2px;background:#111;"></div>
        <div style="position:absolute;top:200px;left:50px;right:50px;">
          <div style="font-family:${SERIF};font-size:76px;font-weight:bold;color:#111;line-height:1.0;">Free Photo Shoot Announced in ${city}, Philippines</div>
          <div style="font-family:${SERIF};font-size:22px;font-style:italic;color:#555;margin-top:8px;">Photographer offers complimentary sessions to locals</div>
        </div>
        <div style="position:absolute;top:520px;left:50px;right:50px;height:700px;overflow:hidden;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;filter:contrast(1.1);"/>
          <div style="position:absolute;bottom:0;left:0;right:0;padding:6px 10px;background:rgba(245,240,224,0.9);">
            <div style="font-family:${SERIF};font-size:14px;font-style:italic;color:#555;">Photo by Aidan Torrence / @madebyaidan</div>
          </div>
        </div>
        <div style="position:absolute;top:1250px;left:50px;right:50px;">
          <div style="font-family:${SERIF};font-size:22px;color:#333;line-height:1.5;column-count:2;column-gap:30px;">
            ${C} — In a move that has stunned the local photography scene, photographer Aidan Torrence has announced free photo shoots for anyone in ${city}. "I want to capture real people," Torrence said. Sessions last 30-60 minutes at scenic locations.
          </div>
        </div>
      </div>`

    // 11: BOARDING PASS
    case 11: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#1a1a2e;">
        ${bg} filter:brightness(0.3) saturate(0.8);"/>
        <!-- Top text -->
        <div style="position:absolute;top:60px;left:60px;right:60px;text-align:center;">
          <div style="font-family:${SERIF};font-size:${cs(120,city)}px;font-weight:bold;font-style:italic;color:white;text-shadow:0 4px 16px rgba(0,0,0,0.8);">${C}</div>
          ${PH('rgba(255,255,255,0.4)')}
          <div style="font-family:${FUTURA};font-size:50px;font-weight:bold;color:white;letter-spacing:4px;margin-top:8px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:22px;color:rgba(255,255,255,0.4);margin-top:10px;">${CTA}</div>
        </div>
        <!-- Boarding pass card -->
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
            <div style="font-family:${SANS};font-size:36px;color:#ccc;">✈ → →</div>
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
            <div style="font-family:${FUTURA};font-size:18px;color:#999;letter-spacing:4px;">PASSENGER SERVICE</div>
            <div style="font-family:${FUTURA};font-size:40px;font-weight:bold;color:#111;margin-top:4px;">FREE PHOTO SHOOT</div>
            <div style="display:flex;gap:2px;margin-top:16px;">${Array.from({length:40},(_,i)=>`<div style="width:${i%3===0?4:2}px;height:50px;background:#111;"></div>`).join('')}</div>
          </div>
        </div>
      </div>`

    // 12: NEON SIGN
    case 12: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#0a0a0a;">
        <div style="position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(60,30,20,0.3) 0px,rgba(40,20,15,0.3) 30px,rgba(50,25,18,0.3) 32px,rgba(50,25,18,0.3) 62px),repeating-linear-gradient(90deg,rgba(60,30,20,0.2) 0px,rgba(40,20,15,0.2) 80px,rgba(50,25,18,0.2) 82px);"></div>
        <!-- Neon text at top -->
        <div style="position:absolute;top:120px;left:60px;right:60px;text-align:center;">
          <div style="font-family:${SERIF};font-size:${cs(160,city)}px;font-weight:bold;font-style:italic;color:#FF1493;text-shadow:0 0 20px rgba(255,20,147,0.8),0 0 60px rgba(255,20,147,0.4),0 0 120px rgba(255,20,147,0.2);line-height:0.85;">${C}</div>
          ${PH('rgba(255,20,147,0.4)')}
          <div style="font-family:${FUTURA};font-size:60px;font-weight:bold;color:#00FF88;text-shadow:0 0 15px rgba(0,255,136,0.7),0 0 50px rgba(0,255,136,0.3);margin-top:16px;letter-spacing:4px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:22px;color:rgba(255,20,147,0.4);margin-top:16px;">${CTA}</div>
        </div>
        <!-- Photo in frame -->
        <div style="position:absolute;top:620px;left:140px;right:140px;height:800px;border:6px solid rgba(255,255,255,0.1);overflow:hidden;box-shadow:0 0 40px rgba(0,0,0,0.5);">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;top:600px;right:200px;width:2px;height:80px;background:rgba(255,255,255,0.1);"></div>
      </div>`

    // 13: POSTCARD
    case 13: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#F5E6D0;">
        <div style="position:absolute;inset:30px;border:4px solid #C4A882;border-radius:8px;"></div>
        <!-- Stamp -->
        <div style="position:absolute;top:60px;right:60px;width:160px;height:200px;border:3px dashed #C4A882;display:flex;align-items:center;justify-content:center;transform:rotate(3deg);">
          <div style="text-align:center;"><div style="font-family:${SERIF};font-size:14px;color:#999;">PHILIPPINES</div><div style="font-family:${SERIF};font-size:44px;font-weight:bold;color:#E63946;">FREE</div><div style="font-family:${SERIF};font-size:12px;color:#999;">₱0.00</div></div>
        </div>
        <!-- Greetings text + city -->
        <div style="position:absolute;top:60px;left:60px;">
          <div style="font-family:${SERIF};font-size:32px;font-style:italic;color:#8B7355;">Greetings from</div>
          <div style="font-family:${SERIF};font-size:${cs(110,city)}px;font-weight:bold;font-style:italic;color:#E63946;line-height:0.85;">${city}</div>
          ${PH('#8B7355')}
          <div style="font-family:${FUTURA};font-size:36px;font-weight:bold;color:#E63946;letter-spacing:4px;margin-top:8px;">FREE PHOTO SHOOT</div>
        </div>
        <!-- Photo -->
        <div style="position:absolute;top:340px;left:60px;right:60px;height:800px;overflow:hidden;border:6px solid white;box-shadow:0 8px 30px rgba(0,0,0,0.15);">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <!-- Message -->
        <div style="position:absolute;top:1180px;left:60px;right:60px;">
          <div style="font-family:${SERIF};font-size:28px;font-style:italic;color:#555;line-height:1.5;">Dear friend, I'm offering a free photo shoot in ${city}. Wish you were here! — Aidan</div>
          <div style="font-family:${SANS};font-size:18px;color:#999;margin-top:12px;">${CTA}</div>
        </div>
      </div>`

    // 14: GALLERY EXHIBITION
    case 14: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#F8F6F3;">
        <div style="position:absolute;inset:0;background:linear-gradient(180deg,#F8F6F3 0%,#F0EDE8 100%);"></div>
        <!-- Top text -->
        <div style="position:absolute;top:60px;left:60px;right:60px;text-align:center;">
          <div style="font-family:${FUTURA};font-size:48px;font-weight:bold;color:#111;letter-spacing:6px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:20px;color:#999;margin-top:8px;">${CTA}</div>
        </div>
        <!-- Shadow -->
        <div style="position:absolute;top:200px;left:130px;right:130px;height:920px;background:rgba(0,0,0,0.04);filter:blur(20px);transform:translate(8px,8px);"></div>
        <!-- Framed photo -->
        <div style="position:absolute;top:200px;left:120px;right:120px;background:white;padding:36px;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
          <div style="height:820px;overflow:hidden;"><img src="${p}" style="width:100%;height:100%;object-fit:cover;"/></div>
        </div>
        <!-- Museum placard -->
        <div style="position:absolute;top:1120px;left:50%;transform:translateX(-50%);width:480px;background:white;padding:24px 32px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <div style="font-family:${SANS};font-size:22px;font-weight:bold;color:#111;letter-spacing:2px;">${C}, PHILIPPINES</div>
          <div style="font-family:${SERIF};font-size:18px;font-style:italic;color:#666;margin-top:4px;">Free Photo Shoot, 2026</div>
          <div style="font-family:${SANS};font-size:14px;color:#999;margin-top:6px;">Digital photography • Courtesy of @madebyaidan</div>
        </div>
      </div>`

    // 15: DARKROOM
    case 15: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#0a0000;">
        <div style="position:absolute;top:0;left:50%;width:600px;height:400px;transform:translateX(-50%);background:radial-gradient(ellipse,rgba(180,30,30,0.15) 0%,transparent 70%);"></div>
        <div style="position:absolute;bottom:0;left:0;right:0;height:200px;background:linear-gradient(180deg,transparent,rgba(140,20,20,0.1));"></div>
        <div style="position:absolute;top:0;left:80px;width:1px;height:100%;background:linear-gradient(180deg,transparent,rgba(180,30,30,0.1),transparent);"></div>
        <div style="position:absolute;top:0;right:80px;width:1px;height:100%;background:linear-gradient(180deg,transparent,rgba(180,30,30,0.1),transparent);"></div>
        <!-- Text top -->
        <div style="position:absolute;top:80px;left:80px;right:80px;">
          <div style="font-family:${SERIF};font-size:${cs(140,city)}px;font-weight:bold;font-style:italic;color:rgba(220,180,180,0.9);line-height:0.82;text-shadow:0 0 20px rgba(180,30,30,0.2);">${C}</div>
          ${PH('rgba(200,120,120,0.4)')}
          <div style="font-family:${FUTURA};font-size:56px;font-weight:bold;color:rgba(200,120,120,0.8);letter-spacing:6px;margin-top:12px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${MONO};font-size:20px;color:rgba(200,100,100,0.35);margin-top:14px;">${CTA}</div>
        </div>
        <div style="position:absolute;top:80px;right:80px;font-family:${MONO};font-size:22px;color:rgba(200,100,100,0.4);">01/08</div>
        <!-- Photo developing -->
        <div style="position:absolute;top:460px;left:140px;right:140px;height:1000px;border:2px solid rgba(180,30,30,0.2);overflow:hidden;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;filter:sepia(0.3) contrast(1.1) brightness(0.85);"/>
        </div>
        <div style="position:absolute;top:440px;left:50%;transform:translateX(-50%);width:60px;height:40px;background:linear-gradient(180deg,#666,#444);border-radius:4px 4px 0 0;box-shadow:0 2px 6px rgba(0,0,0,0.4);"></div>
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
        <!-- Text top -->
        <div style="position:absolute;top:100px;left:80px;right:80px;text-align:center;">
          <div style="font-family:${SERIF};font-size:40px;font-style:italic;color:#FFE44D;text-shadow:0 0 10px rgba(255,228,77,0.3);">now showing</div>
          <div style="font-family:${DISPLAY};font-size:${cs(140,city)}px;color:white;text-transform:uppercase;line-height:0.85;text-shadow:0 4px 12px rgba(0,0,0,0.5);">${C}</div>
          ${PH('rgba(255,228,77,0.4)')}
          <div style="font-family:${FUTURA};font-size:58px;font-weight:bold;color:#FFE44D;letter-spacing:4px;margin-top:8px;text-shadow:0 0 15px rgba(255,228,77,0.4);">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:22px;color:rgba(255,228,77,0.4);margin-top:14px;">${CTA}</div>
        </div>
        <!-- Photo -->
        <div style="position:absolute;top:620px;left:80px;right:80px;bottom:80px;overflow:hidden;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;filter:saturate(1.1);"/>
          <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0.3) 0%,transparent 30%,transparent 80%,rgba(26,10,0,0.5) 100%);"></div>
        </div>
      </div>`
    }

    // 17: TYPEWRITER
    case 17: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#F5F0E0;">
        <div style="position:absolute;inset:0;background:repeating-linear-gradient(180deg,transparent 0px,transparent 48px,rgba(0,100,200,0.08) 48px,rgba(0,100,200,0.08) 49px);"></div>
        <div style="position:absolute;top:0;left:120px;width:2px;height:100%;background:rgba(255,0,0,0.15);"></div>
        <!-- Typed text at top -->
        <div style="position:absolute;top:80px;left:140px;right:100px;">
          <div style="font-family:${MONO};font-size:26px;color:rgba(0,0,0,0.7);line-height:2.0;">TO: You<br>FROM: Aidan Torrence<br>RE: Free Photo Shoot</div>
          <div style="font-family:${MONO};font-size:${cs(70,city)}px;font-weight:bold;color:#111;line-height:1.0;margin-top:20px;">${C}</div>
          ${PH('rgba(0,0,0,0.35)', MONO)}
          <div style="font-family:${MONO};font-size:44px;font-weight:bold;color:#111;margin-top:16px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${MONO};font-size:22px;color:rgba(0,0,0,0.5);margin-top:16px;">${CTA}<span style="display:inline-block;width:4px;height:24px;background:#111;margin-left:4px;vertical-align:bottom;"></span></div>
        </div>
        <!-- Photo taped on -->
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
        <!-- Cassette body — centered vertically in top 75% -->
        <div style="position:absolute;top:200px;left:80px;right:80px;background:linear-gradient(180deg,#E8DDD0,#D4C8B8,#C4B8A8);border-radius:12px;padding:36px;box-shadow:0 20px 60px rgba(0,0,0,0.5);">
          <div style="background:white;border:2px solid #999;border-radius:4px;padding:26px;margin-bottom:26px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
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

    // 19: TEXT MESSAGE / iMessage
    case 19: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
        <div style="position:absolute;top:0;left:0;right:0;height:80px;background:#1c1c1e;display:flex;align-items:center;justify-content:center;">
          <div style="font-family:${SANS};font-size:26px;font-weight:bold;color:white;">Aidan Torrence</div>
        </div>
        <div style="position:absolute;top:80px;left:0;right:0;bottom:0;background:#000;padding:24px;">
          <div style="max-width:700px;margin-bottom:16px;"><div style="background:#2C2C2E;border-radius:18px;padding:18px 24px;display:inline-block;"><div style="font-family:${SANS};font-size:28px;color:white;">hey are you still doing free photo shoots?</div></div></div>
          <div style="max-width:700px;margin-left:auto;margin-bottom:16px;"><div style="background:#0B93F6;border-radius:18px;padding:18px 24px;display:inline-block;"><div style="font-family:${SANS};font-size:28px;color:white;">yes! completely free in ${city} 📸</div></div></div>
          <div style="max-width:580px;margin-left:auto;margin-bottom:16px;"><div style="border-radius:18px;overflow:hidden;height:440px;"><img src="${p}" style="width:100%;height:100%;object-fit:cover;"/></div></div>
          <div style="max-width:700px;margin-left:auto;margin-bottom:16px;"><div style="background:#0B93F6;border-radius:18px;padding:18px 24px;display:inline-block;"><div style="font-family:${SANS};font-size:28px;color:white;">here's some of my recent work ^</div></div></div>
          <div style="max-width:700px;margin-bottom:16px;"><div style="background:#2C2C2E;border-radius:18px;padding:18px 24px;display:inline-block;"><div style="font-family:${SANS};font-size:28px;color:white;">omg these are amazing 😍 how do I book??</div></div></div>
          <div style="max-width:700px;margin-left:auto;margin-bottom:16px;"><div style="background:#0B93F6;border-radius:18px;padding:18px 24px;display:inline-block;"><div style="font-family:${SANS};font-size:28px;color:white;">just DM me! it's really that easy</div></div></div>
        </div>
        <!-- Text overlay — above bottom quadrant -->
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
        <!-- Top text -->
        <div style="position:absolute;top:60px;left:60px;right:60px;text-align:center;">
          <div style="font-family:${SERIF};font-size:${cs(110,city)}px;font-weight:bold;font-style:italic;color:white;text-shadow:0 4px 16px rgba(0,0,0,0.8);">${C}</div>
          ${PH('rgba(255,255,255,0.4)')}
          <div style="font-family:${FUTURA};font-size:48px;font-weight:bold;color:white;letter-spacing:4px;margin-top:6px;">FREE PHOTO SHOOT</div>
        </div>
        <!-- Receipt -->
        <div style="position:absolute;top:340px;left:200px;right:200px;background:#F5F0E0;padding:36px 32px;box-shadow:0 20px 60px rgba(0,0,0,0.5);">
          <div style="text-align:center;border-bottom:2px dashed #ccc;padding-bottom:16px;margin-bottom:16px;">
            <div style="font-family:${MONO};font-size:32px;font-weight:bold;color:#111;">MADEBYAIDAN</div>
            <div style="font-family:${MONO};font-size:16px;color:#888;">${city}, Philippines</div>
          </div>
          <div style="font-family:${MONO};font-size:20px;color:#333;line-height:2.2;">Photo Shoot (1hr)&nbsp;&nbsp;&nbsp;&nbsp;₱0.00<br>Edited Photos&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;₱0.00<br>Digital Delivery&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;₱0.00<br>Good Vibes&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;₱0.00</div>
          <div style="border-top:2px dashed #ccc;margin-top:14px;padding-top:14px;">
            <div style="font-family:${MONO};font-size:26px;font-weight:bold;color:#111;display:flex;justify-content:space-between;"><span>TOTAL</span><span>₱0.00</span></div>
            <div style="font-family:${MONO};font-size:32px;font-weight:bold;color:#E63946;text-align:center;margin-top:12px;">*** FREE ***</div>
          </div>
          <div style="border-top:2px dashed #ccc;margin-top:12px;padding-top:12px;text-align:center;">
            <div style="font-family:${MONO};font-size:16px;color:#888;">THANK YOU!</div>
            <div style="font-family:${MONO};font-size:14px;color:#aaa;margin-top:6px;">${CTA}</div>
            <div style="display:flex;gap:2px;justify-content:center;margin-top:12px;">${Array.from({length:30},(_,i)=>`<div style="width:${i%3===0?3:2}px;height:44px;background:#111;"></div>`).join('')}</div>
          </div>
        </div>
      </div>`

    // 21: INVITATION
    case 21: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#0F1923;">
        ${bg} filter:brightness(0.2) saturate(0.7);"/>
        <!-- Invitation card — centered in upper portion -->
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
        <div style="position:absolute;inset:60px;background:linear-gradient(160deg,#E8D5B0,#D4C09A,#C4B088,#D4C09A);border-radius:4px;box-shadow:inset 0 0 60px rgba(0,0,0,0.2);"></div>
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
            <div style="font-family:${SERIF};font-size:24px;color:#5a4a3a;letter-spacing:4px;">REWARD</div>
            <div style="font-family:${SERIF};font-size:56px;font-weight:bold;color:#8B0000;">FREE PHOTO SHOOT</div>
          </div>
          <div style="font-family:${SERIF};font-size:20px;font-style:italic;color:rgba(90,74,58,0.6);margin-top:16px;">${CTA}</div>
        </div>
      </div>`

    // 23: TRADING CARD
    case 23: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#1a1a2e;">
        <div style="position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,0,100,0.05),rgba(0,200,255,0.05),rgba(255,200,0,0.05));"></div>
        <div style="position:absolute;top:80px;left:100px;right:100px;bottom:520px;background:linear-gradient(180deg,#F8F4E8,#F0ECE0);border-radius:20px;border:6px solid #D4AF37;box-shadow:0 20px 60px rgba(0,0,0,0.4);overflow:hidden;">
          <div style="background:linear-gradient(90deg,#B8860B,#FFD700,#B8860B);padding:14px 26px;display:flex;justify-content:space-between;align-items:center;">
            <div style="font-family:${FUTURA};font-size:18px;font-weight:bold;color:#3a2a1a;letter-spacing:4px;">RARE CARD</div>
            <div style="font-family:${MONO};font-size:16px;color:#3a2a1a;">★★★★★</div>
          </div>
          <div style="margin:16px;height:600px;overflow:hidden;border:3px solid #D4AF37;border-radius:8px;">
            <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <div style="padding:0 26px;">
            <div style="font-family:${SERIF};font-size:${cs(72,city)}px;font-weight:bold;font-style:italic;color:#111;line-height:0.85;">${city}</div>
            ${PH('#999')}
            <div style="font-family:${FUTURA};font-size:32px;font-weight:bold;color:#E63946;letter-spacing:4px;margin-top:6px;">FREE PHOTO SHOOT</div>
          </div>
          <div style="margin:14px;padding:16px;background:rgba(0,0,0,0.03);border-radius:8px;border:1px solid rgba(0,0,0,0.08);">
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
        <!-- Ticket — centered in upper 70% -->
        <div style="position:absolute;top:35%;left:80px;right:80px;transform:translateY(-50%);display:flex;">
          <div style="flex:1;background:#FFE44D;padding:44px 36px;border-radius:12px 0 0 12px;">
            <div style="font-family:${FUTURA};font-size:20px;font-weight:bold;color:rgba(0,0,0,0.3);letter-spacing:8px;">ADMIT ONE</div>
            <div style="font-family:${DISPLAY};font-size:${cs(90,city)}px;color:#111;text-transform:uppercase;line-height:0.85;margin-top:10px;">${C}</div>
            ${PH('rgba(0,0,0,0.3)')}
            <div style="font-family:${FUTURA};font-size:46px;font-weight:bold;color:#E63946;letter-spacing:2px;margin-top:10px;">FREE PHOTO SHOOT</div>
            <div style="width:100%;height:2px;background:rgba(0,0,0,0.1);margin:16px 0;"></div>
            <div style="font-family:${SANS};font-size:20px;color:rgba(0,0,0,0.5);">DATE: Whenever you want</div>
            <div style="font-family:${SANS};font-size:20px;color:rgba(0,0,0,0.5);margin-top:4px;">VENUE: ${city}, Philippines</div>
            <div style="font-family:${SANS};font-size:20px;color:rgba(0,0,0,0.5);margin-top:4px;">PRICE: ₱0.00 (FREE)</div>
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
        <!-- Top text -->
        <div style="position:absolute;top:100px;left:80px;right:80px;">
          <div style="font-family:${FUTURA};font-size:26px;font-weight:bold;color:rgba(255,255,255,0.5);letter-spacing:6px;">YOUR 2026 WRAPPED</div>
          <div style="font-family:${AVENIR};font-size:${cs(130,city)}px;font-weight:bold;color:white;line-height:0.85;margin-top:8px;">${C}</div>
          ${PH('rgba(255,255,255,0.4)')}
          <div style="font-family:${FUTURA};font-size:58px;font-weight:bold;color:#1DB954;letter-spacing:4px;margin-top:12px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:22px;color:rgba(255,255,255,0.35);margin-top:12px;">${CTA}</div>
        </div>
        <!-- Circle photo -->
        <div style="position:absolute;top:620px;left:50%;transform:translateX(-50%);width:500px;height:500px;border-radius:50%;overflow:hidden;border:6px solid rgba(255,255,255,0.1);box-shadow:0 20px 60px rgba(0,0,0,0.4);">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <!-- Stats -->
        <div style="position:absolute;top:1200px;left:80px;right:80px;display:flex;gap:30px;">
          <div style="flex:1;background:rgba(255,255,255,0.08);border-radius:16px;padding:24px;text-align:center;">
            <div style="font-family:${FUTURA};font-size:44px;font-weight:bold;color:#1DB954;">50+</div>
            <div style="font-family:${SANS};font-size:16px;color:rgba(255,255,255,0.5);margin-top:4px;">photos</div>
          </div>
          <div style="flex:1;background:rgba(255,255,255,0.08);border-radius:16px;padding:24px;text-align:center;">
            <div style="font-family:${FUTURA};font-size:44px;font-weight:bold;color:#1DB954;">₱0</div>
            <div style="font-family:${SANS};font-size:16px;color:rgba(255,255,255,0.5);margin-top:4px;">cost</div>
          </div>
          <div style="flex:1;background:rgba(255,255,255,0.08);border-radius:16px;padding:24px;text-align:center;">
            <div style="font-family:${FUTURA};font-size:44px;font-weight:bold;color:#1DB954;">1hr</div>
            <div style="font-family:${SANS};font-size:16px;color:rgba(255,255,255,0.5);margin-top:4px;">session</div>
          </div>
        </div>
      </div>`

    // 26: FILM CLAPPERBOARD
    case 26: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#111;">
        ${bg} filter:brightness(0.3);"/>
        <!-- Title block top -->
        <div style="position:absolute;top:60px;left:80px;right:80px;text-align:center;">
          <div style="font-family:${SERIF};font-size:${cs(140,city)}px;font-weight:bold;font-style:italic;color:white;line-height:0.82;text-shadow:0 4px 16px rgba(0,0,0,0.6);">${C}</div>
          ${PH('rgba(255,255,255,0.4)')}
          <div style="font-family:${FUTURA};font-size:56px;font-weight:bold;color:#FFD700;letter-spacing:4px;margin-top:12px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:22px;color:rgba(255,255,255,0.4);margin-top:14px;">${CTA}</div>
        </div>
        <!-- Clapperboard -->
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

    // 27: CAUTION/WARNING
    case 27: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#111;">
        ${bg} filter:brightness(0.4) contrast(1.2);"/>
        <div style="position:absolute;top:0;left:0;right:0;height:80px;background:repeating-linear-gradient(135deg,#FFE600 0px,#FFE600 30px,#111 30px,#111 60px);"></div>
        <!-- Text centered in upper portion -->
        <div style="position:absolute;top:180px;left:60px;right:60px;text-align:center;">
          <div style="font-family:${DISPLAY};font-size:56px;color:#FFE600;letter-spacing:10px;">⚠ WARNING ⚠</div>
          <div style="font-family:${DISPLAY};font-size:${cs(180,city)}px;color:white;text-transform:uppercase;line-height:0.82;margin-top:16px;text-shadow:0 4px 12px rgba(0,0,0,0.8);">${C}</div>
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
        <!-- Top text -->
        <div style="position:absolute;top:60px;left:80px;right:80px;">
          <div style="font-family:${SERIF};font-size:${cs(130,city)}px;font-weight:bold;font-style:italic;color:white;line-height:0.85;">${C}</div>
          ${PH('rgba(255,255,255,0.3)')}
          <div style="font-family:${FUTURA};font-size:54px;font-weight:bold;color:#E63946;letter-spacing:4px;margin-top:10px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${MONO};font-size:16px;color:rgba(255,255,255,0.3);margin-top:12px;">SIDE A • TRACK 01 • NOW PLAYING</div>
          <div style="font-family:${SANS};font-size:20px;color:rgba(255,255,255,0.35);margin-top:8px;">${CTA}</div>
        </div>
        <!-- Record peeking out -->
        <div style="position:absolute;top:550px;right:-100px;width:800px;height:800px;border-radius:50%;background:radial-gradient(circle,#111 18%,#222 19%,#222 20%,#111 21%,#111 38%,#1a1a1a 39%,#1a1a1a 40%,#111 41%,#111 48%,#1a1a1a 49%,#1a1a1a 50%,#111 51%);border:4px solid #333;"></div>
        <div style="position:absolute;top:900px;right:250px;width:100px;height:100px;border-radius:50%;background:radial-gradient(circle,#333 30%,#E63946 32%,#E63946 90%,#333 92%);"></div>
        <!-- Album cover -->
        <div style="position:absolute;top:420px;left:80px;width:660px;height:660px;background:#111;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.5);">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
          <div style="position:absolute;bottom:0;left:0;right:0;padding:20px;background:linear-gradient(180deg,transparent,rgba(0,0,0,0.8));">
            <div style="font-family:${SERIF};font-size:42px;font-weight:bold;font-style:italic;color:white;">${city}</div>
          </div>
        </div>
      </div>`

    // 29: INSTAGRAM NOTIFICATION / LOCK SCREEN
    case 29: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
        ${bg} filter:brightness(0.5) blur(20px) saturate(1.3);"/>
        <!-- Time -->
        <div style="position:absolute;top:140px;left:0;right:0;text-align:center;">
          <div style="font-family:${SANS};font-size:160px;font-weight:200;color:white;letter-spacing:-4px;">3:14</div>
          <div style="font-family:${SANS};font-size:28px;font-weight:300;color:rgba(255,255,255,0.6);">Tuesday, March 18</div>
        </div>
        <!-- Notifications -->
        <div style="position:absolute;top:480px;left:40px;right:40px;background:rgba(255,255,255,0.12);backdrop-filter:blur(30px);border-radius:18px;padding:20px;display:flex;gap:16px;align-items:flex-start;">
          <div style="width:60px;height:60px;border-radius:14px;background:linear-gradient(135deg,#833AB4,#FD1D1D,#F77737);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            <div style="font-family:${SERIF};font-size:28px;font-weight:bold;color:white;">IG</div>
          </div>
          <div style="flex:1;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <div style="font-family:${SANS};font-size:22px;font-weight:bold;color:white;">INSTAGRAM</div>
              <div style="font-family:${SANS};font-size:18px;color:rgba(255,255,255,0.4);">now</div>
            </div>
            <div style="font-family:${SANS};font-size:24px;color:rgba(255,255,255,0.8);margin-top:4px;line-height:1.4;"><b>@madebyaidan</b> is offering a FREE photo shoot in ${city}! 📸 DM to book</div>
          </div>
        </div>
        <div style="position:absolute;top:650px;left:40px;right:40px;background:rgba(255,255,255,0.08);backdrop-filter:blur(30px);border-radius:18px;padding:20px;display:flex;gap:16px;align-items:flex-start;">
          <div style="width:60px;height:60px;border-radius:14px;background:linear-gradient(135deg,#833AB4,#FD1D1D,#F77737);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            <div style="font-family:${SERIF};font-size:28px;font-weight:bold;color:white;">IG</div>
          </div>
          <div style="flex:1;">
            <div style="font-family:${SANS};font-size:22px;font-weight:bold;color:white;">INSTAGRAM</div>
            <div style="font-family:${SANS};font-size:24px;color:rgba(255,255,255,0.8);margin-top:4px;line-height:1.4;">3 of your friends just booked their free photo shoot 🔥</div>
          </div>
        </div>
        <!-- Photo preview -->
        <div style="position:absolute;top:860px;left:140px;right:140px;height:400px;border-radius:16px;overflow:hidden;box-shadow:0 16px 40px rgba(0,0,0,0.4);">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <!-- Text above bottom quadrant -->
        <div style="position:absolute;top:1300px;left:60px;right:60px;text-align:center;">
          <div style="font-family:${FUTURA};font-size:${cs(72,city)}px;font-weight:bold;color:white;">${C}</div>
          ${PH('rgba(255,255,255,0.4)')}
          <div style="font-family:${FUTURA};font-size:44px;font-weight:bold;color:rgba(255,255,255,0.8);letter-spacing:4px;margin-top:2px;">FREE PHOTO SHOOT</div>
        </div>
      </div>`
  }
}

// Build 90 slides: 30 per city
const slides = []

for (let ci = 0; ci < cities.length; ci++) {
  const city = cities[ci]
  for (let v = 0; v < 30; v++) {
    // Pick from the right pool based on container orientation
    const pool = LANDSCAPE_VARIANTS.has(v) ? landscapePhotos : portraitPhotos
    const pi1 = (v * 3 + ci * 7) % pool.length
    const pi2 = (v * 3 + ci * 7 + 1) % pool.length
    const pi3 = (v * 3 + ci * 7 + 2) % pool.length
    slides.push({
      name: `${city.toLowerCase()}-${String(v + 1).padStart(2, '0')}`,
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
