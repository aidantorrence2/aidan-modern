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

const photos = [
  img('manila-gallery-dsc-0075.jpg'),
  img('manila-gallery-dsc-0130.jpg'),
  img('manila-gallery-dsc-0911.jpg'),
  img('manila-gallery-dsc-0190.jpg'),
  img('manila-gallery-night-003.jpg'),
  img('manila-gallery-market-001.jpg'),
  img('manila-gallery-urban-003.jpg'),
  img('manila-gallery-garden-002.jpg'),
  img('manila-gallery-canal-001.jpg'),
  img('manila-gallery-canal-002.jpg'),
  img('manila-gallery-ivy-002.jpg'),
  img('manila-gallery-park-001.jpg'),
  img('manila-gallery-statue-001.jpg'),
  img('manila-gallery-street-001.jpg'),
  img('manila-gallery-night-001.jpg'),
  img('manila-gallery-ivy-001.jpg'),
  img('manila-gallery-garden-001.jpg'),
  img('manila-gallery-closeup-001.jpg'),
  img('manila-gallery-shadow-001.jpg'),
  img('manila-gallery-rocks-001.jpg'),
  img('manila-gallery-floor-001.jpg'),
  img('manila-gallery-tropical-001.jpg'),
]

// macOS system fonts that render perfectly in Playwright
const SERIF = "Georgia, 'Times New Roman', serif"
const SANS = "'Helvetica Neue', 'Arial', sans-serif"
const DISPLAY = "Impact, 'Arial Black', sans-serif"
const MONO = "Menlo, 'Courier New', monospace"
const FUTURA = "Futura, 'Trebuchet MS', sans-serif"
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

  switch (variant) {

    // ─────────────────────────────────────────────────────────────
    // 0: PHOTO BOOTH STRIP — red curtain, white photo strip, 3 pics
    // ─────────────────────────────────────────────────────────────
    case 0: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#1a0808;">
        <!-- Red curtain background -->
        <div style="position:absolute;inset:0;background:linear-gradient(180deg,#3d0c0c 0%,#6b1a1a 30%,#4a1212 70%,#2a0808 100%);"></div>
        <div style="position:absolute;inset:0;background:repeating-linear-gradient(90deg,rgba(0,0,0,0.15) 0px,transparent 2px,transparent 35px);"></div>
        <!-- Brass rod -->
        <div style="position:absolute;top:0;left:0;right:0;height:20px;background:linear-gradient(180deg,#c4974a,#a0763c,#6b4f2a);box-shadow:0 4px 12px rgba(0,0,0,0.5);z-index:2;"></div>
        <!-- White photo strip -->
        <div style="position:absolute;top:180px;left:200px;width:680px;background:white;border-radius:8px;padding:30px;box-shadow:0 20px 60px rgba(0,0,0,0.6);transform:rotate(-2deg);">
          <div style="width:100%;height:380px;overflow:hidden;margin-bottom:20px;"><img src="${p}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="width:100%;height:380px;overflow:hidden;margin-bottom:20px;"><img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="width:100%;height:380px;overflow:hidden;"><img src="${p3}" style="width:100%;height:100%;object-fit:cover;"/></div>
          <div style="text-align:center;padding:20px 0 8px;font-family:${MONO};font-size:22px;color:#888;letter-spacing:2px;">PHOTO BOOTH — ${C}</div>
        </div>
        <!-- Bottom text -->
        <div style="position:absolute;bottom:120px;left:60px;right:60px;text-align:center;">
          <div style="font-family:${SERIF};font-size:${cs(120,city)}px;font-weight:bold;font-style:italic;color:#FFD700;text-shadow:0 4px 12px rgba(0,0,0,0.8);">${C}</div>
          <div style="font-family:${FUTURA};font-size:56px;font-weight:bold;color:white;letter-spacing:6px;margin-top:8px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:26px;color:rgba(255,255,255,0.5);margin-top:16px;">${CTA}</div>
        </div>
      </div>`

    // ─────────────────────────────────────────────────────────────
    // 1: POLAROID — tilted polaroid on dark wood surface
    // ─────────────────────────────────────────────────────────────
    case 1: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#1a1614;">
        <div style="position:absolute;inset:0;background:linear-gradient(160deg,#2a2420,#1a1614,#0f0d0c);"></div>
        <!-- Scattered small polaroids behind -->
        <div style="position:absolute;top:100px;left:60px;width:280px;background:white;padding:16px 16px 50px;transform:rotate(-12deg);box-shadow:0 8px 30px rgba(0,0,0,0.4);">
          <img src="${p2}" style="width:100%;height:200px;object-fit:cover;"/>
        </div>
        <div style="position:absolute;top:200px;right:40px;width:280px;background:white;padding:16px 16px 50px;transform:rotate(8deg);box-shadow:0 8px 30px rgba(0,0,0,0.4);">
          <img src="${p3}" style="width:100%;height:200px;object-fit:cover;"/>
        </div>
        <!-- Main polaroid -->
        <div style="position:absolute;top:420px;left:120px;width:840px;background:white;padding:28px 28px 90px;transform:rotate(2deg);box-shadow:0 20px 60px rgba(0,0,0,0.5);">
          <img src="${p}" style="width:100%;height:680px;object-fit:cover;"/>
          <div style="font-family:${SERIF};font-size:42px;font-style:italic;color:#333;margin-top:16px;text-align:center;">free photo shoot ♥</div>
        </div>
        <!-- Bottom text -->
        <div style="position:absolute;bottom:140px;left:60px;right:60px;text-align:center;">
          <div style="font-family:${SERIF};font-size:${cs(140,city)}px;font-weight:bold;font-style:italic;color:white;text-shadow:0 4px 16px rgba(0,0,0,0.6);">${C}</div>
          <div style="font-family:${FUTURA};font-size:54px;font-weight:bold;color:white;letter-spacing:6px;margin-top:10px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:24px;color:rgba(255,255,255,0.4);margin-top:16px;">${CTA}</div>
        </div>
      </div>`

    // ─────────────────────────────────────────────────────────────
    // 2: FILM STRIP — sprocket holes, frame numbers
    // ─────────────────────────────────────────────────────────────
    case 2: {
      const sprockets = Array.from({length:22}, (_,i) =>
        `<div style="position:absolute;top:${i*88}px;width:40px;height:52px;background:#111;border-radius:6px;"></div>`
      ).join('')
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#111;">
        <!-- Film strip body -->
        <div style="position:absolute;top:0;left:60px;right:60px;bottom:0;background:#1a1a1a;"></div>
        <!-- Sprocket holes left -->
        <div style="position:absolute;top:0;left:14px;">${sprockets}</div>
        <!-- Sprocket holes right -->
        <div style="position:absolute;top:0;right:14px;">${sprockets}</div>
        <!-- Frame 1 -->
        <div style="position:absolute;top:80px;left:100px;right:100px;height:560px;overflow:hidden;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;top:50px;left:110px;font-family:${MONO};font-size:18px;color:#FF6600;letter-spacing:2px;">▶ 36A  KODAK 400TX</div>
        <!-- Frame 2 -->
        <div style="position:absolute;top:700px;left:100px;right:100px;height:560px;overflow:hidden;">
          <img src="${p2}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;top:670px;left:110px;font-family:${MONO};font-size:18px;color:#FF6600;">▶ 37A  KODAK 400TX</div>
        <!-- Text area -->
        <div style="position:absolute;bottom:140px;left:100px;right:100px;text-align:center;">
          <div style="font-family:${SERIF};font-size:${cs(140,city)}px;font-weight:bold;font-style:italic;color:white;">${C}</div>
          <div style="font-family:${FUTURA};font-size:60px;font-weight:bold;color:#FF6600;letter-spacing:6px;margin-top:8px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${MONO};font-size:22px;color:rgba(255,102,0,0.5);margin-top:20px;">${CTA}</div>
        </div>
      </div>`
    }

    // ─────────────────────────────────────────────────────────────
    // 3: CONTACT SHEET — grid of photos, grease pencil circles
    // ─────────────────────────────────────────────────────────────
    case 3: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#f5f0e8;">
        <!-- Grid of photos -->
        <div style="position:absolute;top:80px;left:50px;right:50px;display:grid;grid-template-columns:repeat(3,1fr);gap:12px;">
          ${[p,p2,p3,p,p2,p3,p,p2,p3].map((ph,i) => `
            <div style="position:relative;height:280px;overflow:hidden;">
              <img src="${ph}" style="width:100%;height:100%;object-fit:cover;filter:contrast(1.1);"/>
              <div style="position:absolute;top:4px;left:6px;font-family:${MONO};font-size:14px;color:rgba(255,102,0,0.8);">${i+32}A</div>
              ${i===1||i===5||i===7 ? `<div style="position:absolute;inset:8px;border:4px solid #E63946;border-radius:50%;"></div>` : ''}
            </div>
          `).join('')}
        </div>
        <!-- Bottom area -->
        <div style="position:absolute;bottom:100px;left:50px;right:50px;text-align:center;">
          <div style="font-family:${SERIF};font-size:${cs(130,city)}px;font-weight:bold;font-style:italic;color:#111;">${C}</div>
          <div style="font-family:${FUTURA};font-size:56px;font-weight:bold;color:#E63946;letter-spacing:4px;margin-top:8px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:24px;color:#999;margin-top:16px;">${CTA}</div>
        </div>
        <!-- Grease pencil marks -->
        <div style="position:absolute;top:60px;right:60px;font-family:${SERIF};font-size:36px;font-style:italic;color:#E63946;transform:rotate(-8deg);">selects ✓</div>
      </div>`

    // ─────────────────────────────────────────────────────────────
    // 4: VHS TAPE — scanlines, REC dot, timestamp, tracking
    // ─────────────────────────────────────────────────────────────
    case 4: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
        <img src="${p}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(1.2) contrast(1.1) brightness(0.9);"/>
        <!-- CRT scanlines -->
        <div style="position:absolute;inset:0;background:repeating-linear-gradient(180deg,transparent 0px,rgba(0,0,0,0.12) 1px,transparent 2px,transparent 3px);pointer-events:none;"></div>
        <!-- Vignette -->
        <div style="position:absolute;inset:0;background:radial-gradient(ellipse at center,transparent 50%,rgba(0,0,0,0.6) 100%);"></div>
        <!-- Tracking distortion bar -->
        <div style="position:absolute;top:680px;left:0;right:0;height:12px;background:rgba(255,255,255,0.15);filter:blur(2px);"></div>
        <!-- REC indicator -->
        <div style="position:absolute;top:60px;left:60px;display:flex;align-items:center;gap:14px;">
          <div style="width:20px;height:20px;border-radius:50%;background:#FF0000;box-shadow:0 0 12px rgba(255,0,0,0.8);"></div>
          <div style="font-family:${MONO};font-size:28px;font-weight:bold;color:white;text-shadow:0 0 8px rgba(255,255,255,0.5);">REC</div>
        </div>
        <!-- Timestamp -->
        <div style="position:absolute;top:60px;right:60px;font-family:${MONO};font-size:24px;color:rgba(255,255,255,0.7);">03:14:22 PM</div>
        <!-- SP indicator -->
        <div style="position:absolute;top:110px;right:60px;font-family:${MONO};font-size:20px;color:rgba(255,255,255,0.5);">SP ▶</div>
        <!-- Bottom text -->
        <div style="position:absolute;bottom:180px;left:60px;right:60px;">
          <div style="font-family:${DISPLAY};font-size:${cs(200,city)}px;color:white;text-transform:uppercase;line-height:0.85;text-shadow:0 4px 8px rgba(0,0,0,0.8),0 0 30px rgba(255,255,255,0.1);">${C}</div>
          <div style="font-family:${FUTURA};font-size:68px;font-weight:bold;color:white;letter-spacing:6px;margin-top:12px;text-shadow:0 2px 6px rgba(0,0,0,0.8);">FREE PHOTO SHOOT</div>
          <div style="font-family:${MONO};font-size:22px;color:rgba(255,255,255,0.5);margin-top:16px;">${CTA}</div>
        </div>
        <!-- Channel badge -->
        <div style="position:absolute;bottom:60px;right:60px;font-family:${MONO};font-size:36px;font-weight:bold;color:rgba(255,255,255,0.3);">CH 03</div>
      </div>`

    // ─────────────────────────────────────────────────────────────
    // 5: SLOT MACHINE — gold frame, LED dots, reel windows
    // ─────────────────────────────────────────────────────────────
    case 5: {
      const leds = Array.from({length:30}, (_,i) =>
        `<div style="position:absolute;top:${Math.floor(i/2)*90+120}px;${i%2===0?'left:18px':'right:18px'};width:14px;height:14px;border-radius:50%;background:${['#FFD700','#FF1744','#FF8800'][i%3]};box-shadow:0 0 8px ${['rgba(255,215,0,0.6)','rgba(255,23,68,0.6)','rgba(255,136,0,0.6)'][i%3]};"></div>`
      ).join('')
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:linear-gradient(160deg,#2a1a00,#1a1000,#0d0800);">
        <!-- LED lights -->
        ${leds}
        <!-- Chrome trim top -->
        <div style="position:absolute;top:60px;left:50px;right:50px;height:8px;background:linear-gradient(90deg,#8B7355,#D4AF37,#FFD700,#D4AF37,#8B7355);border-radius:4px;"></div>
        <!-- JACKPOT header -->
        <div style="position:absolute;top:90px;left:50px;right:50px;text-align:center;">
          <div style="font-family:${DISPLAY};font-size:80px;color:#FFD700;text-shadow:0 0 20px rgba(255,215,0,0.5),0 4px 8px rgba(0,0,0,0.8);letter-spacing:8px;">★ FREE SHOOT ★</div>
        </div>
        <!-- 3 reel windows -->
        <div style="position:absolute;top:250px;left:80px;right:80px;display:flex;gap:20px;">
          ${[p,p2,p3].map(ph => `
            <div style="flex:1;height:500px;border:4px solid #FFD700;border-radius:8px;overflow:hidden;box-shadow:inset 0 0 20px rgba(0,0,0,0.5),0 4px 12px rgba(0,0,0,0.4);">
              <img src="${ph}" style="width:100%;height:100%;object-fit:cover;"/>
              <div style="position:absolute;top:50%;left:0;right:0;height:3px;background:rgba(255,215,0,0.4);"></div>
            </div>
          `).join('')}
        </div>
        <!-- Center line across reels -->
        <div style="position:absolute;top:498px;left:60px;right:60px;height:4px;background:#FFD700;box-shadow:0 0 10px rgba(255,215,0,0.5);"></div>
        <!-- Bottom text -->
        <div style="position:absolute;bottom:300px;left:60px;right:60px;text-align:center;">
          <div style="font-family:${SERIF};font-size:${cs(160,city)}px;font-weight:bold;font-style:italic;color:#FFD700;text-shadow:0 0 30px rgba(255,215,0,0.4),0 4px 12px rgba(0,0,0,0.8);">${C}</div>
          <div style="font-family:${FUTURA};font-size:64px;font-weight:bold;color:white;letter-spacing:6px;margin-top:12px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:24px;color:rgba(255,215,0,0.4);margin-top:20px;">${CTA}</div>
        </div>
        <!-- Chrome trim bottom -->
        <div style="position:absolute;bottom:240px;left:50px;right:50px;height:8px;background:linear-gradient(90deg,#8B7355,#D4AF37,#FFD700,#D4AF37,#8B7355);border-radius:4px;"></div>
        <!-- Lever -->
        <div style="position:absolute;top:400px;right:20px;width:30px;height:300px;background:linear-gradient(90deg,#888,#ccc,#888);border-radius:4px;">
          <div style="position:absolute;top:-20px;left:-10px;width:50px;height:50px;border-radius:50%;background:radial-gradient(circle at 40% 40%,#FF4444,#CC0000,#880000);box-shadow:0 4px 12px rgba(0,0,0,0.5);"></div>
        </div>
      </div>`
    }

    // ─────────────────────────────────────────────────────────────
    // 6: TETRIS — colored blocks border, grid, pixel aesthetic
    // ─────────────────────────────────────────────────────────────
    case 6: {
      const colors = ['#00f0f0','#f0f000','#a000f0','#00f000','#f00000','#0000f0','#f0a000']
      const blocks = Array.from({length:40}, (_,i) => {
        const x = (i % 12) * 90
        const y = Math.floor(i / 12) * 90 + 1560
        const c = colors[i % 7]
        return `<div style="position:absolute;left:${x}px;top:${y}px;width:88px;height:88px;background:${c};border:3px solid rgba(255,255,255,0.3);border-right-color:rgba(0,0,0,0.3);border-bottom-color:rgba(0,0,0,0.3);box-shadow:inset 2px 2px 4px rgba(255,255,255,0.2);"></div>`
      }).join('')
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#0a0a0a;">
        <!-- Grid -->
        <div style="position:absolute;inset:0;background:repeating-linear-gradient(90deg,rgba(255,255,255,0.04) 0px,transparent 1px,transparent 90px),repeating-linear-gradient(180deg,rgba(255,255,255,0.04) 0px,transparent 1px,transparent 90px);"></div>
        <!-- CRT scanlines -->
        <div style="position:absolute;inset:0;background:repeating-linear-gradient(180deg,transparent 0px,rgba(0,0,0,0.1) 1px,transparent 2px,transparent 3px);"></div>
        <!-- Photo in middle -->
        <div style="position:absolute;top:300px;left:90px;right:90px;height:700px;border:4px solid rgba(255,255,255,0.2);overflow:hidden;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <!-- Score display -->
        <div style="position:absolute;top:60px;right:60px;text-align:right;">
          <div style="font-family:${MONO};font-size:22px;color:rgba(255,255,255,0.4);">SCORE</div>
          <div style="font-family:${MONO};font-size:42px;font-weight:bold;color:#00f0f0;text-shadow:0 0 10px rgba(0,240,240,0.5);">099999</div>
        </div>
        <!-- Level -->
        <div style="position:absolute;top:60px;left:60px;">
          <div style="font-family:${MONO};font-size:22px;color:rgba(255,255,255,0.4);">LEVEL</div>
          <div style="font-family:${MONO};font-size:42px;font-weight:bold;color:#f0a000;text-shadow:0 0 10px rgba(240,160,0,0.5);">FREE</div>
        </div>
        <!-- City + text -->
        <div style="position:absolute;top:1080px;left:60px;right:60px;text-align:center;">
          <div style="font-family:${MONO};font-size:${cs(130,city)}px;font-weight:bold;color:white;text-shadow:0 0 20px rgba(0,240,240,0.4);">${C}</div>
          <div style="font-family:${MONO};font-size:52px;font-weight:bold;color:#00f0f0;text-shadow:0 0 15px rgba(0,240,240,0.5);margin-top:12px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${MONO};font-size:20px;color:rgba(0,240,240,0.35);margin-top:20px;">${CTA}</div>
        </div>
        <!-- Tetris blocks at bottom -->
        ${blocks}
      </div>`
    }

    // ─────────────────────────────────────────────────────────────
    // 7: MAGAZINE COVER — masthead, coverlines, barcode
    // ─────────────────────────────────────────────────────────────
    case 7: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
        <img src="${p}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(1.15) contrast(1.05);"/>
        <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0.4) 0%,transparent 20%,transparent 50%,rgba(0,0,0,0.7) 80%,rgba(0,0,0,0.9) 100%);"></div>
        <!-- Masthead -->
        <div style="position:absolute;top:50px;left:60px;right:60px;display:flex;justify-content:space-between;align-items:flex-start;">
          <div>
            <div style="font-family:${FUTURA};font-size:22px;font-weight:bold;color:rgba(255,255,255,0.6);letter-spacing:10px;">ISSUE 47 • 2026</div>
            <div style="font-family:${SERIF};font-size:100px;font-weight:bold;font-style:italic;color:white;line-height:0.85;margin-top:4px;">AIDAN</div>
          </div>
          <div style="font-family:${SANS};font-size:20px;color:rgba(255,255,255,0.5);">₱0.00</div>
        </div>
        <!-- Cover lines -->
        <div style="position:absolute;bottom:260px;left:60px;right:60px;">
          <div style="font-family:${FUTURA};font-size:36px;font-weight:bold;color:white;letter-spacing:4px;margin-bottom:12px;">EXCLUSIVE</div>
          <div style="font-family:${SERIF};font-size:${cs(150,city)}px;font-weight:bold;font-style:italic;color:white;line-height:0.82;">${C}</div>
          <div style="font-family:${FUTURA};font-size:64px;font-weight:bold;color:#FF4444;letter-spacing:4px;margin-top:12px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:24px;color:rgba(255,255,255,0.5);margin-top:16px;">${CTA}</div>
        </div>
        <!-- Barcode -->
        <div style="position:absolute;bottom:60px;right:60px;display:flex;gap:2px;">
          ${Array.from({length:20},(_,i)=>`<div style="width:${i%3===0?4:2}px;height:50px;background:rgba(255,255,255,0.4);"></div>`).join('')}
        </div>
      </div>`

    // ─────────────────────────────────────────────────────────────
    // 8: MOVIE POSTER — cinematic bars, credits, tagline
    // ─────────────────────────────────────────────────────────────
    case 8: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
        <img src="${p}" style="position:absolute;top:200px;left:0;right:0;height:1200px;object-fit:cover;filter:saturate(1.1) contrast(1.05);"/>
        <div style="position:absolute;top:200px;left:0;right:0;height:1200px;background:linear-gradient(180deg,rgba(0,0,0,0.3) 0%,transparent 20%,transparent 60%,rgba(0,0,0,0.8) 100%);"></div>
        <!-- Cinematic bars -->
        <div style="position:absolute;top:0;left:0;right:0;height:200px;background:#000;display:flex;flex-direction:column;justify-content:flex-end;padding:0 60px 20px;">
          <div style="font-family:${FUTURA};font-size:28px;color:rgba(255,255,255,0.5);letter-spacing:12px;">A MADEBYAIDAN PRODUCTION</div>
        </div>
        <div style="position:absolute;bottom:0;left:0;right:0;height:520px;background:linear-gradient(180deg,transparent,#000 30%);">
          <div style="position:absolute;bottom:200px;left:60px;right:60px;">
            <div style="font-family:${SERIF};font-size:${cs(160,city)}px;font-weight:bold;font-style:italic;color:white;line-height:0.82;">${C}</div>
            <div style="font-family:${FUTURA};font-size:62px;font-weight:bold;color:#FFD700;letter-spacing:6px;margin-top:12px;">FREE PHOTO SHOOT</div>
          </div>
          <!-- Credits block -->
          <div style="position:absolute;bottom:60px;left:60px;right:60px;">
            <div style="font-family:${SANS};font-size:18px;color:rgba(255,255,255,0.3);letter-spacing:2px;">DIRECTED BY AIDAN TORRENCE • STARRING YOU • ${C} • NOW BOOKING</div>
            <div style="font-family:${SANS};font-size:22px;color:rgba(255,255,255,0.4);margin-top:12px;">${CTA}</div>
          </div>
        </div>
      </div>`

    // ─────────────────────────────────────────────────────────────
    // 9: GIG POSTER — bold stacked type, event-style, torn paper
    // ─────────────────────────────────────────────────────────────
    case 9: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#F5F0E0;">
        <!-- Photo strip -->
        <div style="position:absolute;top:340px;left:0;right:0;height:600px;overflow:hidden;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;filter:contrast(1.3) saturate(0.8);"/>
        </div>
        <!-- Top text area -->
        <div style="position:absolute;top:40px;left:50px;right:50px;">
          <div style="font-family:${DISPLAY};font-size:${cs(180,city)}px;color:#111;text-transform:uppercase;line-height:0.82;">${C}</div>
          <div style="font-family:${DISPLAY};font-size:80px;color:#E63946;text-transform:uppercase;letter-spacing:2px;margin-top:4px;">FREE PHOTO SHOOT</div>
        </div>
        <!-- Bottom details -->
        <div style="position:absolute;bottom:80px;left:50px;right:50px;">
          <div style="width:100%;height:3px;background:#111;margin-bottom:24px;"></div>
          <div style="display:flex;justify-content:space-between;align-items:flex-start;">
            <div>
              <div style="font-family:${FUTURA};font-size:42px;font-weight:bold;color:#111;letter-spacing:4px;">WHEN</div>
              <div style="font-family:${SERIF};font-size:36px;font-style:italic;color:#555;">Anytime you want</div>
              <div style="font-family:${FUTURA};font-size:42px;font-weight:bold;color:#111;letter-spacing:4px;margin-top:20px;">WHERE</div>
              <div style="font-family:${SERIF};font-size:36px;font-style:italic;color:#555;">${city}</div>
              <div style="font-family:${FUTURA};font-size:42px;font-weight:bold;color:#111;letter-spacing:4px;margin-top:20px;">COST</div>
              <div style="font-family:${SERIF};font-size:48px;font-style:italic;color:#E63946;font-weight:bold;">FREE</div>
            </div>
            <div style="text-align:right;">
              <div style="font-family:${MONO};font-size:20px;color:#999;">${CTA}</div>
              <div style="font-family:${SERIF};font-size:28px;font-style:italic;color:#555;margin-top:8px;">@madebyaidan</div>
            </div>
          </div>
        </div>
      </div>`

    // ─────────────────────────────────────────────────────────────
    // 10: NEWSPAPER — masthead, headline, columns, dateline
    // ─────────────────────────────────────────────────────────────
    case 10: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#F5F0E0;">
        <!-- Masthead -->
        <div style="position:absolute;top:0;left:0;right:0;padding:40px 50px 20px;border-bottom:4px double #111;">
          <div style="text-align:center;">
            <div style="font-family:${SERIF};font-size:20px;color:#666;letter-spacing:4px;">THE</div>
            <div style="font-family:${SERIF};font-size:72px;font-weight:bold;font-style:italic;color:#111;line-height:0.9;">${city} Times</div>
            <div style="font-family:${SERIF};font-size:18px;color:#888;margin-top:4px;letter-spacing:2px;">EST. 2026 • "ALL THE PHOTOS FIT TO SHOOT"</div>
          </div>
        </div>
        <div style="position:absolute;top:200px;left:50px;right:50px;height:2px;background:#111;"></div>
        <!-- Headline -->
        <div style="position:absolute;top:220px;left:50px;right:50px;">
          <div style="font-family:${SERIF};font-size:86px;font-weight:bold;color:#111;line-height:1.0;">Free Photo Shoot Announced in ${city}</div>
          <div style="font-family:${SERIF};font-size:24px;font-style:italic;color:#555;margin-top:12px;">Photographer Aidan Torrence offers complimentary sessions to locals</div>
        </div>
        <!-- Photo -->
        <div style="position:absolute;top:580px;left:50px;right:50px;height:700px;overflow:hidden;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;filter:contrast(1.1);"/>
          <div style="position:absolute;bottom:0;left:0;right:0;padding:8px 12px;background:rgba(245,240,224,0.9);">
            <div style="font-family:${SERIF};font-size:16px;font-style:italic;color:#555;">Photo by Aidan Torrence / @madebyaidan</div>
          </div>
        </div>
        <!-- Article text -->
        <div style="position:absolute;top:1310px;left:50px;right:50px;">
          <div style="font-family:${SERIF};font-size:24px;color:#333;line-height:1.5;column-count:2;column-gap:30px;">
            ${city.toUpperCase()} — In a move that has stunned the local photography scene, photographer Aidan Torrence has announced free photo shoots for anyone in ${city}. "I want to capture real people," Torrence said. "No experience needed — just show up and look like yourself." The offer includes fully edited digital photos delivered within days. Sessions typically last 30-60 minutes at scenic locations throughout ${city}.
          </div>
        </div>
        <!-- Bottom -->
        <div style="position:absolute;bottom:60px;left:50px;right:50px;text-align:center;border-top:2px solid #111;padding-top:16px;">
          <div style="font-family:${FUTURA};font-size:36px;font-weight:bold;color:#E63946;letter-spacing:4px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SERIF};font-size:22px;font-style:italic;color:#888;margin-top:8px;">${CTA}</div>
        </div>
      </div>`

    // ─────────────────────────────────────────────────────────────
    // 11: BOARDING PASS — flight ticket with perforations
    // ─────────────────────────────────────────────────────────────
    case 11: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#1a1a2e;">
        <!-- Photo background -->
        <img src="${p}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:brightness(0.3) saturate(0.8);"/>
        <!-- Boarding pass card -->
        <div style="position:absolute;top:300px;left:60px;right:60px;background:white;border-radius:16px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.5);">
          <!-- Header -->
          <div style="background:#E63946;padding:24px 40px;display:flex;justify-content:space-between;align-items:center;">
            <div style="font-family:${FUTURA};font-size:28px;font-weight:bold;color:white;letter-spacing:6px;">BOARDING PASS</div>
            <div style="font-family:${SANS};font-size:22px;color:rgba(255,255,255,0.8);">CLASS: FREE</div>
          </div>
          <!-- Route -->
          <div style="padding:40px;display:flex;justify-content:space-between;align-items:center;">
            <div style="text-align:center;">
              <div style="font-family:${FUTURA};font-size:20px;color:#999;letter-spacing:4px;">FROM</div>
              <div style="font-family:${FUTURA};font-size:72px;font-weight:bold;color:#111;">YOU</div>
            </div>
            <div style="font-family:${SANS};font-size:40px;color:#ccc;">✈ → →</div>
            <div style="text-align:center;">
              <div style="font-family:${FUTURA};font-size:20px;color:#999;letter-spacing:4px;">TO</div>
              <div style="font-family:${FUTURA};font-size:${cs(72,city)}px;font-weight:bold;color:#E63946;">${C}</div>
            </div>
          </div>
          <!-- Details row -->
          <div style="padding:0 40px 30px;display:flex;justify-content:space-between;">
            <div>
              <div style="font-family:${SANS};font-size:16px;color:#999;letter-spacing:2px;">FLIGHT</div>
              <div style="font-family:${FUTURA};font-size:28px;font-weight:bold;color:#111;">AT-2026</div>
            </div>
            <div>
              <div style="font-family:${SANS};font-size:16px;color:#999;letter-spacing:2px;">GATE</div>
              <div style="font-family:${FUTURA};font-size:28px;font-weight:bold;color:#111;">FREE</div>
            </div>
            <div>
              <div style="font-family:${SANS};font-size:16px;color:#999;letter-spacing:2px;">SEAT</div>
              <div style="font-family:${FUTURA};font-size:28px;font-weight:bold;color:#111;">VIP</div>
            </div>
          </div>
          <!-- Perforation line -->
          <div style="border-top:3px dashed #ddd;margin:0 20px;"></div>
          <!-- Bottom section -->
          <div style="padding:30px 40px;">
            <div style="font-family:${FUTURA};font-size:20px;color:#999;letter-spacing:4px;">PASSENGER SERVICE</div>
            <div style="font-family:${FUTURA};font-size:44px;font-weight:bold;color:#111;margin-top:4px;">FREE PHOTO SHOOT</div>
            <!-- Barcode -->
            <div style="display:flex;gap:2px;margin-top:20px;">
              ${Array.from({length:40},(_,i)=>`<div style="width:${i%3===0?4:i%5===0?3:2}px;height:60px;background:#111;"></div>`).join('')}
            </div>
          </div>
        </div>
        <!-- Bottom CTA -->
        <div style="position:absolute;bottom:180px;left:60px;right:60px;text-align:center;">
          <div style="font-family:${SERIF};font-size:${cs(120,city)}px;font-weight:bold;font-style:italic;color:white;text-shadow:0 4px 16px rgba(0,0,0,0.8);">${C}</div>
          <div style="font-family:${SANS};font-size:26px;color:rgba(255,255,255,0.5);margin-top:16px;">${CTA}</div>
        </div>
      </div>`

    // ─────────────────────────────────────────────────────────────
    // 12: NEON SIGN — dark brick, glowing text
    // ─────────────────────────────────────────────────────────────
    case 12: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#0a0a0a;">
        <!-- Brick texture -->
        <div style="position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(60,30,20,0.3) 0px,rgba(40,20,15,0.3) 30px,rgba(50,25,18,0.3) 32px,rgba(50,25,18,0.3) 62px),repeating-linear-gradient(90deg,rgba(60,30,20,0.2) 0px,rgba(40,20,15,0.2) 80px,rgba(50,25,18,0.2) 82px);"></div>
        <!-- Photo in frame -->
        <div style="position:absolute;top:150px;left:140px;right:140px;height:700px;border:6px solid rgba(255,255,255,0.1);overflow:hidden;box-shadow:0 0 40px rgba(0,0,0,0.5);">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <!-- Neon text -->
        <div style="position:absolute;bottom:400px;left:60px;right:60px;text-align:center;">
          <div style="font-family:${SERIF};font-size:${cs(180,city)}px;font-weight:bold;font-style:italic;color:#FF1493;text-shadow:0 0 20px rgba(255,20,147,0.8),0 0 60px rgba(255,20,147,0.4),0 0 120px rgba(255,20,147,0.2);line-height:0.85;">${C}</div>
          <div style="font-family:${FUTURA};font-size:66px;font-weight:bold;color:#00FF88;text-shadow:0 0 15px rgba(0,255,136,0.7),0 0 50px rgba(0,255,136,0.3);margin-top:20px;letter-spacing:4px;">FREE PHOTO SHOOT</div>
        </div>
        <div style="position:absolute;bottom:300px;left:60px;right:60px;text-align:center;">
          <div style="font-family:${SANS};font-size:24px;color:rgba(255,20,147,0.4);">${CTA}</div>
        </div>
        <!-- Wire from neon -->
        <div style="position:absolute;bottom:620px;right:200px;width:2px;height:100px;background:rgba(255,255,255,0.1);"></div>
      </div>`

    // ─────────────────────────────────────────────────────────────
    // 13: POSTCARD — "Greetings from..." retro style
    // ─────────────────────────────────────────────────────────────
    case 13: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#F5E6D0;">
        <!-- Postcard border -->
        <div style="position:absolute;inset:30px;border:4px solid #C4A882;border-radius:8px;"></div>
        <!-- Stamp -->
        <div style="position:absolute;top:60px;right:60px;width:180px;height:220px;border:3px dashed #C4A882;display:flex;align-items:center;justify-content:center;transform:rotate(3deg);">
          <div style="text-align:center;">
            <div style="font-family:${SERIF};font-size:16px;color:#999;">PHILIPPINES</div>
            <div style="font-family:${SERIF};font-size:48px;font-weight:bold;color:#E63946;">FREE</div>
            <div style="font-family:${SERIF};font-size:14px;color:#999;">₱0.00</div>
          </div>
        </div>
        <!-- Postmark -->
        <div style="position:absolute;top:100px;right:180px;width:140px;height:140px;border:3px solid rgba(230,57,70,0.3);border-radius:50%;display:flex;align-items:center;justify-content:center;transform:rotate(-15deg);">
          <div style="text-align:center;font-family:${SANS};font-size:14px;color:rgba(230,57,70,0.4);">${C}<br>2026</div>
        </div>
        <!-- Greetings text -->
        <div style="position:absolute;top:80px;left:60px;">
          <div style="font-family:${SERIF};font-size:36px;font-style:italic;color:#8B7355;">Greetings from</div>
          <div style="font-family:${SERIF};font-size:${cs(120,city)}px;font-weight:bold;font-style:italic;color:#E63946;line-height:0.85;">${city}</div>
        </div>
        <!-- Photo -->
        <div style="position:absolute;top:360px;left:60px;right:60px;height:800px;overflow:hidden;border:6px solid white;box-shadow:0 8px 30px rgba(0,0,0,0.15);">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <!-- Message -->
        <div style="position:absolute;bottom:200px;left:60px;right:60px;">
          <div style="font-family:${SERIF};font-size:32px;font-style:italic;color:#555;line-height:1.5;">Dear friend,<br>I'm offering a free photo shoot here in ${city}. Wish you were here!</div>
          <div style="font-family:${SERIF};font-size:28px;font-style:italic;color:#8B7355;margin-top:16px;">— Aidan</div>
        </div>
        <!-- Bottom -->
        <div style="position:absolute;bottom:80px;left:60px;right:60px;display:flex;justify-content:space-between;align-items:center;border-top:2px solid #C4A882;padding-top:16px;">
          <div style="font-family:${FUTURA};font-size:40px;font-weight:bold;color:#E63946;letter-spacing:4px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:18px;color:#999;">${CTA}</div>
        </div>
      </div>`

    // ─────────────────────────────────────────────────────────────
    // 14: GALLERY EXHIBITION — white wall, framed photo, placard
    // ─────────────────────────────────────────────────────────────
    case 14: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#F8F6F3;">
        <!-- Wall texture -->
        <div style="position:absolute;inset:0;background:linear-gradient(180deg,#F8F6F3 0%,#F0EDE8 100%);"></div>
        <!-- Shadow on wall -->
        <div style="position:absolute;top:200px;left:130px;right:130px;height:920px;background:rgba(0,0,0,0.04);filter:blur(20px);transform:translate(8px,8px);"></div>
        <!-- Framed photo -->
        <div style="position:absolute;top:200px;left:120px;right:120px;background:white;padding:40px;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
          <div style="height:840px;overflow:hidden;">
            <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
        </div>
        <!-- Museum placard -->
        <div style="position:absolute;bottom:260px;left:50%;transform:translateX(-50%);width:500px;background:white;padding:28px 36px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <div style="font-family:${SANS};font-size:24px;font-weight:bold;color:#111;letter-spacing:2px;">${C}</div>
          <div style="font-family:${SERIF};font-size:20px;font-style:italic;color:#666;margin-top:4px;">Free Photo Shoot, 2026</div>
          <div style="font-family:${SANS};font-size:16px;color:#999;margin-top:8px;">Digital photography, dimensions variable</div>
          <div style="font-family:${SANS};font-size:16px;color:#999;">Courtesy of the artist, @madebyaidan</div>
        </div>
        <!-- Bottom text -->
        <div style="position:absolute;bottom:100px;left:60px;right:60px;text-align:center;">
          <div style="font-family:${FUTURA};font-size:52px;font-weight:bold;color:#111;letter-spacing:6px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:22px;color:#999;margin-top:12px;">${CTA}</div>
        </div>
      </div>`

    // ─────────────────────────────────────────────────────────────
    // 15: DARKROOM — red safelight, developing photo
    // ─────────────────────────────────────────────────────────────
    case 15: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#0a0000;">
        <!-- Safelight glow -->
        <div style="position:absolute;top:0;left:50%;width:600px;height:400px;transform:translateX(-50%);background:radial-gradient(ellipse,rgba(180,30,30,0.15) 0%,transparent 70%);"></div>
        <!-- Chemical tray reflection -->
        <div style="position:absolute;bottom:0;left:0;right:0;height:200px;background:linear-gradient(180deg,transparent,rgba(140,20,20,0.1));"></div>
        <!-- Developer drip lines -->
        <div style="position:absolute;top:0;left:80px;width:1px;height:100%;background:linear-gradient(180deg,transparent,rgba(180,30,30,0.1),transparent);"></div>
        <div style="position:absolute;top:0;right:80px;width:1px;height:100%;background:linear-gradient(180deg,transparent,rgba(180,30,30,0.1),transparent);"></div>
        <!-- Photo developing in tray -->
        <div style="position:absolute;top:300px;left:100px;right:100px;height:800px;border:2px solid rgba(180,30,30,0.2);overflow:hidden;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;filter:sepia(0.3) contrast(1.1) brightness(0.85);"/>
        </div>
        <!-- Clip at top of photo -->
        <div style="position:absolute;top:280px;left:50%;transform:translateX(-50%);width:60px;height:40px;background:linear-gradient(180deg,#666,#444);border-radius:4px 4px 0 0;box-shadow:0 2px 6px rgba(0,0,0,0.4);"></div>
        <!-- Counter -->
        <div style="position:absolute;top:80px;right:80px;font-family:${MONO};font-size:24px;color:rgba(200,100,100,0.4);">01/08</div>
        <!-- Text -->
        <div style="position:absolute;bottom:280px;left:80px;right:80px;">
          <div style="font-family:${SERIF};font-size:${cs(160,city)}px;font-weight:bold;font-style:italic;color:rgba(220,180,180,0.9);line-height:0.82;text-shadow:0 0 20px rgba(180,30,30,0.2);">${C}</div>
          <div style="font-family:${FUTURA};font-size:60px;font-weight:bold;color:rgba(200,120,120,0.8);letter-spacing:6px;margin-top:16px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${MONO};font-size:22px;color:rgba(200,100,100,0.35);margin-top:20px;">${CTA}</div>
        </div>
      </div>`

    // ─────────────────────────────────────────────────────────────
    // 16: MARQUEE / BROADWAY — light bulb border, theater
    // ─────────────────────────────────────────────────────────────
    case 16: {
      const bulbs = []
      for (let i = 0; i < 60; i++) {
        const on = i % 3 !== 0
        const col = on ? '#FFE44D' : 'rgba(255,228,77,0.2)'
        const glow = on ? '0 0 8px rgba(255,228,77,0.6)' : 'none'
        // Top row
        if (i < 15) bulbs.push(`<div style="position:absolute;top:26px;left:${i*72+20}px;width:18px;height:18px;border-radius:50%;background:${col};box-shadow:${glow};"></div>`)
        // Bottom row
        else if (i < 30) bulbs.push(`<div style="position:absolute;bottom:26px;left:${(i-15)*72+20}px;width:18px;height:18px;border-radius:50%;background:${col};box-shadow:${glow};"></div>`)
        // Left col
        else if (i < 45) bulbs.push(`<div style="position:absolute;left:26px;top:${(i-30)*128+20}px;width:18px;height:18px;border-radius:50%;background:${col};box-shadow:${glow};"></div>`)
        // Right col
        else bulbs.push(`<div style="position:absolute;right:26px;top:${(i-45)*128+20}px;width:18px;height:18px;border-radius:50%;background:${col};box-shadow:${glow};"></div>`)
      }
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#1a0a00;">
        <!-- Marquee border -->
        <div style="position:absolute;inset:10px;border:8px solid #8B7355;border-radius:8px;">
          ${bulbs.join('')}
        </div>
        <!-- Photo -->
        <div style="position:absolute;top:120px;left:80px;right:80px;height:900px;overflow:hidden;">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;filter:saturate(1.1);"/>
          <div style="position:absolute;inset:0;background:linear-gradient(180deg,transparent 40%,rgba(0,0,0,0.7) 100%);"></div>
        </div>
        <!-- Text -->
        <div style="position:absolute;bottom:300px;left:80px;right:80px;text-align:center;">
          <div style="font-family:${SERIF};font-size:44px;font-style:italic;color:#FFE44D;text-shadow:0 0 10px rgba(255,228,77,0.3);">now showing</div>
          <div style="font-family:${DISPLAY};font-size:${cs(160,city)}px;color:white;text-transform:uppercase;line-height:0.85;text-shadow:0 4px 12px rgba(0,0,0,0.5);">${C}</div>
          <div style="font-family:${FUTURA};font-size:64px;font-weight:bold;color:#FFE44D;letter-spacing:4px;margin-top:12px;text-shadow:0 0 15px rgba(255,228,77,0.4);">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:24px;color:rgba(255,228,77,0.4);margin-top:20px;">${CTA}</div>
        </div>
      </div>`
    }

    // ─────────────────────────────────────────────────────────────
    // 17: TYPEWRITER — paper texture, typed text, cursor
    // ─────────────────────────────────────────────────────────────
    case 17: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#F5F0E0;">
        <!-- Paper lines -->
        <div style="position:absolute;inset:0;background:repeating-linear-gradient(180deg,transparent 0px,transparent 48px,rgba(0,100,200,0.08) 48px,rgba(0,100,200,0.08) 49px);"></div>
        <!-- Red margin line -->
        <div style="position:absolute;top:0;left:120px;width:2px;height:100%;background:rgba(255,0,0,0.15);"></div>
        <!-- Photo taped on -->
        <div style="position:absolute;top:160px;left:160px;right:160px;height:680px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.1);transform:rotate(-1deg);">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <!-- Tape pieces -->
        <div style="position:absolute;top:148px;left:200px;width:100px;height:30px;background:rgba(255,230,150,0.6);transform:rotate(-5deg);"></div>
        <div style="position:absolute;top:148px;right:200px;width:100px;height:30px;background:rgba(255,230,150,0.6);transform:rotate(3deg);"></div>
        <!-- Typed text -->
        <div style="position:absolute;top:920px;left:140px;right:100px;">
          <div style="font-family:${MONO};font-size:28px;color:rgba(0,0,0,0.7);line-height:2.0;">
            TO: You<br>
            FROM: Aidan Torrence<br>
            RE: Free Photo Shoot<br>
            <br>
          </div>
          <div style="font-family:${MONO};font-size:${cs(80,city)}px;font-weight:bold;color:#111;line-height:1.0;margin-top:20px;">${C}</div>
          <div style="font-family:${MONO};font-size:48px;font-weight:bold;color:#111;margin-top:24px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${MONO};font-size:24px;color:rgba(0,0,0,0.5);margin-top:24px;">${CTA}</div>
          <!-- Cursor -->
          <div style="display:inline-block;width:4px;height:28px;background:#111;margin-left:4px;vertical-align:bottom;"></div>
        </div>
      </div>`

    // ─────────────────────────────────────────────────────────────
    // 18: CASSETTE TAPE — tape label design
    // ─────────────────────────────────────────────────────────────
    case 18: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#2a2a2a;">
        <!-- Photo background -->
        <img src="${p}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:brightness(0.25) saturate(0.6);"/>
        <!-- Cassette body -->
        <div style="position:absolute;top:50%;left:80px;right:80px;transform:translateY(-50%);background:linear-gradient(180deg,#E8DDD0,#D4C8B8,#C4B8A8);border-radius:12px;padding:40px;box-shadow:0 20px 60px rgba(0,0,0,0.5);">
          <!-- Label area -->
          <div style="background:white;border:2px solid #999;border-radius:4px;padding:30px;margin-bottom:30px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
              <div style="font-family:${MONO};font-size:16px;color:#999;">SIDE A</div>
              <div style="font-family:${MONO};font-size:16px;color:#999;">C-90</div>
            </div>
            <div style="font-family:${SERIF};font-size:${cs(80,city)}px;font-weight:bold;font-style:italic;color:#111;line-height:0.85;">${city}</div>
            <div style="font-family:${FUTURA};font-size:42px;font-weight:bold;color:#E63946;letter-spacing:4px;margin-top:10px;">FREE PHOTO SHOOT</div>
            <div style="width:100%;height:2px;background:#ddd;margin:16px 0;"></div>
            <div style="font-family:${MONO};font-size:18px;color:#666;line-height:1.8;">
              01. Show up<br>
              02. Look amazing<br>
              03. Get free photos<br>
              04. That's it
            </div>
          </div>
          <!-- Tape reels -->
          <div style="display:flex;justify-content:space-around;align-items:center;">
            <div style="width:160px;height:160px;border-radius:50%;border:4px solid #888;background:radial-gradient(circle,#333 30%,#555 32%,#555 60%,#444 62%);display:flex;align-items:center;justify-content:center;">
              <div style="width:40px;height:40px;border-radius:50%;background:#222;border:3px solid #666;"></div>
            </div>
            <div style="width:160px;height:160px;border-radius:50%;border:4px solid #888;background:radial-gradient(circle,#333 30%,#555 32%,#555 60%,#444 62%);display:flex;align-items:center;justify-content:center;">
              <div style="width:40px;height:40px;border-radius:50%;background:#222;border:3px solid #666;"></div>
            </div>
          </div>
        </div>
        <!-- Bottom text -->
        <div style="position:absolute;bottom:120px;left:60px;right:60px;text-align:center;">
          <div style="font-family:${SANS};font-size:24px;color:rgba(255,255,255,0.4);">${CTA}</div>
        </div>
      </div>`

    // ─────────────────────────────────────────────────────────────
    // 19: TEXT MESSAGE — iMessage conversation mockup
    // ─────────────────────────────────────────────────────────────
    case 19: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
        <!-- Status bar -->
        <div style="position:absolute;top:0;left:0;right:0;height:100px;background:#1c1c1e;display:flex;align-items:center;justify-content:center;">
          <div style="font-family:${SANS};font-size:28px;font-weight:bold;color:white;">Aidan Torrence</div>
        </div>
        <!-- Chat background -->
        <div style="position:absolute;top:100px;left:0;right:0;bottom:100px;background:#000;padding:30px;">
          <!-- Their message -->
          <div style="max-width:720px;margin-bottom:20px;">
            <div style="background:#2C2C2E;border-radius:20px;padding:20px 28px;display:inline-block;">
              <div style="font-family:${SANS};font-size:30px;color:white;">hey are you still doing free photo shoots?</div>
            </div>
          </div>
          <!-- My reply -->
          <div style="max-width:720px;margin-left:auto;margin-bottom:20px;">
            <div style="background:#0B93F6;border-radius:20px;padding:20px 28px;display:inline-block;">
              <div style="font-family:${SANS};font-size:30px;color:white;">yes! completely free in ${city} 📸</div>
            </div>
          </div>
          <!-- Photo message -->
          <div style="max-width:600px;margin-left:auto;margin-bottom:20px;">
            <div style="border-radius:20px;overflow:hidden;height:500px;">
              <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
            </div>
          </div>
          <!-- More messages -->
          <div style="max-width:720px;margin-left:auto;margin-bottom:20px;">
            <div style="background:#0B93F6;border-radius:20px;padding:20px 28px;display:inline-block;">
              <div style="font-family:${SANS};font-size:30px;color:white;">here's some of my recent work ^</div>
            </div>
          </div>
          <div style="max-width:720px;margin-bottom:20px;">
            <div style="background:#2C2C2E;border-radius:20px;padding:20px 28px;display:inline-block;">
              <div style="font-family:${SANS};font-size:30px;color:white;">omg these are amazing 😍 how do I book??</div>
            </div>
          </div>
          <div style="max-width:720px;margin-left:auto;margin-bottom:20px;">
            <div style="background:#0B93F6;border-radius:20px;padding:20px 28px;display:inline-block;">
              <div style="font-family:${SANS};font-size:30px;color:white;">just DM me! it's really that easy</div>
            </div>
          </div>
        </div>
        <!-- Bottom overlay -->
        <div style="position:absolute;bottom:0;left:0;right:0;height:300px;background:linear-gradient(180deg,transparent,rgba(0,0,0,0.9) 40%);display:flex;flex-direction:column;justify-content:flex-end;align-items:center;padding-bottom:60px;">
          <div style="font-family:${FUTURA};font-size:${cs(80,city)}px;font-weight:bold;color:white;letter-spacing:4px;">${C}</div>
          <div style="font-family:${FUTURA};font-size:48px;font-weight:bold;color:#0B93F6;letter-spacing:4px;margin-top:4px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:22px;color:rgba(255,255,255,0.4);margin-top:12px;">${CTA}</div>
        </div>
      </div>`

    // ─────────────────────────────────────────────────────────────
    // 20: RECEIPT — thermal receipt style
    // ─────────────────────────────────────────────────────────────
    case 20: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#111;">
        <img src="${p}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:brightness(0.2);"/>
        <!-- Receipt -->
        <div style="position:absolute;top:200px;left:180px;right:180px;background:#F5F0E0;padding:40px 36px;box-shadow:0 20px 60px rgba(0,0,0,0.5);">
          <div style="text-align:center;border-bottom:2px dashed #ccc;padding-bottom:20px;margin-bottom:20px;">
            <div style="font-family:${MONO};font-size:36px;font-weight:bold;color:#111;">MADEBYAIDAN</div>
            <div style="font-family:${MONO};font-size:18px;color:#888;">${city}, Philippines</div>
            <div style="font-family:${MONO};font-size:16px;color:#888;">03/18/2026 • 3:14 PM</div>
          </div>
          <div style="font-family:${MONO};font-size:22px;color:#333;line-height:2.2;">
            Photo Shoot (1hr)&nbsp;&nbsp;&nbsp;&nbsp;₱0.00<br>
            Edited Photos&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;₱0.00<br>
            Digital Delivery&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;₱0.00<br>
            Good Vibes&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;₱0.00<br>
          </div>
          <div style="border-top:2px dashed #ccc;margin-top:16px;padding-top:16px;">
            <div style="font-family:${MONO};font-size:28px;font-weight:bold;color:#111;display:flex;justify-content:space-between;">
              <span>TOTAL</span><span>₱0.00</span>
            </div>
            <div style="font-family:${MONO};font-size:36px;font-weight:bold;color:#E63946;text-align:center;margin-top:16px;">*** FREE ***</div>
          </div>
          <div style="border-top:2px dashed #ccc;margin-top:16px;padding-top:16px;text-align:center;">
            <div style="font-family:${MONO};font-size:18px;color:#888;">THANK YOU!</div>
            <div style="font-family:${MONO};font-size:16px;color:#aaa;margin-top:8px;">${CTA}</div>
            <!-- Barcode -->
            <div style="display:flex;gap:2px;justify-content:center;margin-top:16px;">
              ${Array.from({length:30},(_,i)=>`<div style="width:${i%3===0?3:i%5===0?4:2}px;height:50px;background:#111;"></div>`).join('')}
            </div>
          </div>
        </div>
        <!-- Bottom -->
        <div style="position:absolute;bottom:140px;left:60px;right:60px;text-align:center;">
          <div style="font-family:${SERIF};font-size:${cs(120,city)}px;font-weight:bold;font-style:italic;color:white;text-shadow:0 4px 16px rgba(0,0,0,0.8);">${C}</div>
          <div style="font-family:${FUTURA};font-size:52px;font-weight:bold;color:white;letter-spacing:4px;margin-top:8px;">FREE PHOTO SHOOT</div>
        </div>
      </div>`

    // ─────────────────────────────────────────────────────────────
    // 21: INVITATION — formal invite card, elegant
    // ─────────────────────────────────────────────────────────────
    case 21: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#0F1923;">
        <img src="${p}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:brightness(0.2) saturate(0.7);"/>
        <!-- Invitation card -->
        <div style="position:absolute;top:50%;left:80px;right:80px;transform:translateY(-50%);background:rgba(255,252,245,0.97);padding:80px 60px;text-align:center;">
          <!-- Decorative top border -->
          <div style="width:200px;height:2px;background:#D4AF37;margin:0 auto 40px;"></div>
          <div style="font-family:${SERIF};font-size:28px;font-style:italic;color:#999;letter-spacing:4px;">you are invited to a</div>
          <div style="font-family:${SERIF};font-size:80px;font-weight:bold;font-style:italic;color:#111;margin-top:16px;line-height:0.9;">Free Photo Shoot</div>
          <div style="width:80px;height:1px;background:#D4AF37;margin:32px auto;"></div>
          <div style="font-family:${FUTURA};font-size:24px;color:#999;letter-spacing:8px;margin-bottom:16px;">LOCATION</div>
          <div style="font-family:${SERIF};font-size:${cs(100,city)}px;font-weight:bold;font-style:italic;color:#D4AF37;line-height:0.85;">${city}</div>
          <div style="width:80px;height:1px;background:#D4AF37;margin:32px auto;"></div>
          <div style="font-family:${FUTURA};font-size:24px;color:#999;letter-spacing:8px;margin-bottom:8px;">HOSTED BY</div>
          <div style="font-family:${SERIF};font-size:36px;font-style:italic;color:#555;">Aidan Torrence</div>
          <div style="font-family:${SANS};font-size:28px;color:#111;margin-top:32px;font-weight:500;">RSVP: ${CTA}</div>
          <!-- Decorative bottom border -->
          <div style="width:200px;height:2px;background:#D4AF37;margin:40px auto 0;"></div>
        </div>
      </div>`

    // ─────────────────────────────────────────────────────────────
    // 22: WANTED POSTER — old west, sepia, reward
    // ─────────────────────────────────────────────────────────────
    case 22: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#3a2a1a;">
        <!-- Aged paper -->
        <div style="position:absolute;inset:60px;background:linear-gradient(160deg,#E8D5B0,#D4C09A,#C4B088,#D4C09A);border-radius:4px;box-shadow:inset 0 0 60px rgba(0,0,0,0.2);"></div>
        <!-- Content -->
        <div style="position:absolute;inset:80px;display:flex;flex-direction:column;align-items:center;padding:60px 40px;">
          <div style="font-family:${SERIF};font-size:80px;font-weight:bold;color:#3a2a1a;letter-spacing:8px;text-align:center;">WANTED</div>
          <div style="width:80%;height:4px;background:#3a2a1a;margin:16px 0;"></div>
          <div style="font-family:${SERIF};font-size:32px;font-style:italic;color:#5a4a3a;letter-spacing:4px;">DEAD OR ALIVE</div>
          <!-- Photo -->
          <div style="width:600px;height:700px;margin-top:32px;border:6px solid #3a2a1a;overflow:hidden;">
            <img src="${p}" style="width:100%;height:100%;object-fit:cover;filter:sepia(0.4) contrast(1.1);"/>
          </div>
          <div style="font-family:${SERIF};font-size:${cs(90,city)}px;font-weight:bold;color:#3a2a1a;margin-top:24px;">${C}</div>
          <div style="width:60%;height:3px;background:#3a2a1a;margin:20px 0;opacity:0.5;"></div>
          <div style="font-family:${SERIF};font-size:36px;color:#5a4a3a;text-align:center;">FOR LOOKING TOO GOOD<br>IN FREE PHOTOS</div>
          <div style="margin-top:28px;text-align:center;">
            <div style="font-family:${SERIF};font-size:28px;color:#5a4a3a;letter-spacing:4px;">REWARD</div>
            <div style="font-family:${SERIF};font-size:64px;font-weight:bold;color:#8B0000;">FREE PHOTO SHOOT</div>
          </div>
          <div style="font-family:${SERIF};font-size:22px;font-style:italic;color:rgba(90,74,58,0.6);margin-top:24px;">${CTA}</div>
        </div>
      </div>`

    // ─────────────────────────────────────────────────────────────
    // 23: TRADING CARD — card border, stats, holographic accent
    // ─────────────────────────────────────────────────────────────
    case 23: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#1a1a2e;">
        <!-- Holographic shimmer bg -->
        <div style="position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,0,100,0.05),rgba(0,200,255,0.05),rgba(255,200,0,0.05),rgba(0,255,100,0.05));"></div>
        <!-- Card -->
        <div style="position:absolute;top:120px;left:100px;right:100px;bottom:120px;background:linear-gradient(180deg,#F8F4E8,#F0ECE0);border-radius:20px;border:6px solid #D4AF37;box-shadow:0 20px 60px rgba(0,0,0,0.4);overflow:hidden;">
          <!-- Gold header bar -->
          <div style="background:linear-gradient(90deg,#B8860B,#FFD700,#B8860B);padding:16px 30px;display:flex;justify-content:space-between;align-items:center;">
            <div style="font-family:${FUTURA};font-size:20px;font-weight:bold;color:#3a2a1a;letter-spacing:4px;">RARE CARD</div>
            <div style="font-family:${MONO};font-size:18px;color:#3a2a1a;">★★★★★</div>
          </div>
          <!-- Photo -->
          <div style="margin:20px;height:700px;overflow:hidden;border:3px solid #D4AF37;border-radius:8px;">
            <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <!-- Name -->
          <div style="padding:0 30px;">
            <div style="font-family:${SERIF};font-size:${cs(80,city)}px;font-weight:bold;font-style:italic;color:#111;line-height:0.85;">${city}</div>
            <div style="font-family:${FUTURA};font-size:36px;font-weight:bold;color:#E63946;letter-spacing:4px;margin-top:8px;">FREE PHOTO SHOOT</div>
          </div>
          <!-- Stats -->
          <div style="margin:20px;padding:20px;background:rgba(0,0,0,0.03);border-radius:8px;border:1px solid rgba(0,0,0,0.08);">
            <div style="display:flex;justify-content:space-around;text-align:center;">
              <div>
                <div style="font-family:${MONO};font-size:16px;color:#999;">VIBES</div>
                <div style="font-family:${FUTURA};font-size:36px;font-weight:bold;color:#111;">100</div>
              </div>
              <div>
                <div style="font-family:${MONO};font-size:16px;color:#999;">COST</div>
                <div style="font-family:${FUTURA};font-size:36px;font-weight:bold;color:#E63946;">FREE</div>
              </div>
              <div>
                <div style="font-family:${MONO};font-size:16px;color:#999;">PHOTOS</div>
                <div style="font-family:${FUTURA};font-size:36px;font-weight:bold;color:#111;">50+</div>
              </div>
            </div>
          </div>
          <!-- Footer -->
          <div style="padding:0 30px 20px;text-align:center;">
            <div style="font-family:${SANS};font-size:20px;color:#999;">${CTA}</div>
          </div>
        </div>
      </div>`

    // ─────────────────────────────────────────────────────────────
    // 24: TICKET STUB — admit one, tear line
    // ─────────────────────────────────────────────────────────────
    case 24: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#111;">
        <img src="${p}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:brightness(0.25);"/>
        <!-- Ticket -->
        <div style="position:absolute;top:50%;left:80px;right:80px;transform:translateY(-50%);display:flex;">
          <!-- Main ticket -->
          <div style="flex:1;background:#FFE44D;padding:50px 40px;border-radius:12px 0 0 12px;">
            <div style="font-family:${FUTURA};font-size:22px;font-weight:bold;color:rgba(0,0,0,0.3);letter-spacing:8px;">ADMIT ONE</div>
            <div style="font-family:${DISPLAY};font-size:${cs(100,city)}px;color:#111;text-transform:uppercase;line-height:0.85;margin-top:12px;">${C}</div>
            <div style="font-family:${FUTURA};font-size:50px;font-weight:bold;color:#E63946;letter-spacing:2px;margin-top:12px;">FREE PHOTO SHOOT</div>
            <div style="width:100%;height:2px;background:rgba(0,0,0,0.1);margin:20px 0;"></div>
            <div style="font-family:${SANS};font-size:22px;color:rgba(0,0,0,0.5);">DATE: Whenever you want</div>
            <div style="font-family:${SANS};font-size:22px;color:rgba(0,0,0,0.5);margin-top:4px;">VENUE: ${city}, Philippines</div>
            <div style="font-family:${SANS};font-size:22px;color:rgba(0,0,0,0.5);margin-top:4px;">PRICE: ₱0.00 (FREE)</div>
            <div style="font-family:${SANS};font-size:20px;color:rgba(0,0,0,0.35);margin-top:16px;">${CTA}</div>
          </div>
          <!-- Perforation -->
          <div style="width:30px;background:#FFE44D;display:flex;flex-direction:column;align-items:center;justify-content:space-around;">
            ${Array.from({length:15},()=>`<div style="width:16px;height:16px;border-radius:50%;background:#111;"></div>`).join('')}
          </div>
          <!-- Stub -->
          <div style="width:180px;background:#FFE44D;border-radius:0 12px 12px 0;padding:30px 20px;display:flex;flex-direction:column;align-items:center;justify-content:center;">
            <div style="font-family:${MONO};font-size:18px;color:rgba(0,0,0,0.3);transform:rotate(90deg);white-space:nowrap;">NO. 000001</div>
          </div>
        </div>
      </div>`

    // ─────────────────────────────────────────────────────────────
    // 25: SPOTIFY WRAPPED — bold colors, stats layout
    // ─────────────────────────────────────────────────────────────
    case 25: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:linear-gradient(160deg,#1DB954,#191414,#1DB954);">
        <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0.3),transparent 30%,transparent 70%,rgba(0,0,0,0.5));"></div>
        <!-- Circle photo -->
        <div style="position:absolute;top:200px;left:50%;transform:translateX(-50%);width:500px;height:500px;border-radius:50%;overflow:hidden;border:6px solid rgba(255,255,255,0.1);box-shadow:0 20px 60px rgba(0,0,0,0.4);">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <!-- Stats -->
        <div style="position:absolute;top:780px;left:80px;right:80px;">
          <div style="font-family:${FUTURA};font-size:28px;font-weight:bold;color:rgba(255,255,255,0.5);letter-spacing:6px;margin-bottom:16px;">YOUR 2026 WRAPPED</div>
          <div style="font-family:${AVENIR};font-size:${cs(140,city)}px;font-weight:bold;color:white;line-height:0.85;">${C}</div>
          <div style="font-family:${FUTURA};font-size:64px;font-weight:bold;color:#1DB954;letter-spacing:4px;margin-top:16px;">FREE PHOTO SHOOT</div>
        </div>
        <!-- Stats grid -->
        <div style="position:absolute;bottom:280px;left:80px;right:80px;display:flex;gap:30px;">
          <div style="flex:1;background:rgba(255,255,255,0.08);border-radius:16px;padding:28px;text-align:center;">
            <div style="font-family:${FUTURA};font-size:48px;font-weight:bold;color:#1DB954;">50+</div>
            <div style="font-family:${SANS};font-size:18px;color:rgba(255,255,255,0.5);margin-top:4px;">photos</div>
          </div>
          <div style="flex:1;background:rgba(255,255,255,0.08);border-radius:16px;padding:28px;text-align:center;">
            <div style="font-family:${FUTURA};font-size:48px;font-weight:bold;color:#1DB954;">₱0</div>
            <div style="font-family:${SANS};font-size:18px;color:rgba(255,255,255,0.5);margin-top:4px;">cost</div>
          </div>
          <div style="flex:1;background:rgba(255,255,255,0.08);border-radius:16px;padding:28px;text-align:center;">
            <div style="font-family:${FUTURA};font-size:48px;font-weight:bold;color:#1DB954;">1hr</div>
            <div style="font-family:${SANS};font-size:18px;color:rgba(255,255,255,0.5);margin-top:4px;">session</div>
          </div>
        </div>
        <!-- CTA -->
        <div style="position:absolute;bottom:140px;left:80px;right:80px;text-align:center;">
          <div style="font-family:${SANS};font-size:24px;color:rgba(255,255,255,0.35);">${CTA}</div>
        </div>
      </div>`

    // ─────────────────────────────────────────────────────────────
    // 26: FILM CLAPPERBOARD — slate design
    // ─────────────────────────────────────────────────────────────
    case 26: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#111;">
        <img src="${p}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:brightness(0.3);"/>
        <!-- Clapperboard -->
        <div style="position:absolute;top:200px;left:80px;right:80px;">
          <!-- Clapper sticks (diagonal stripes) -->
          <div style="height:100px;background:repeating-linear-gradient(135deg,#111 0px,#111 30px,white 30px,white 60px);border-radius:8px 8px 0 0;border:4px solid #333;"></div>
          <!-- Slate body -->
          <div style="background:#222;border:4px solid #333;border-top:none;padding:30px 36px;">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
              <div>
                <div style="font-family:${SANS};font-size:18px;color:#888;letter-spacing:2px;">PRODUCTION</div>
                <div style="font-family:${FUTURA};font-size:32px;font-weight:bold;color:white;">FREE SHOOT</div>
              </div>
              <div>
                <div style="font-family:${SANS};font-size:18px;color:#888;letter-spacing:2px;">DIRECTOR</div>
                <div style="font-family:${FUTURA};font-size:32px;font-weight:bold;color:white;">AIDAN T.</div>
              </div>
              <div>
                <div style="font-family:${SANS};font-size:18px;color:#888;letter-spacing:2px;">LOCATION</div>
                <div style="font-family:${FUTURA};font-size:32px;font-weight:bold;color:#FFD700;">${C}</div>
              </div>
              <div>
                <div style="font-family:${SANS};font-size:18px;color:#888;letter-spacing:2px;">COST</div>
                <div style="font-family:${FUTURA};font-size:32px;font-weight:bold;color:#E63946;">FREE</div>
              </div>
            </div>
          </div>
        </div>
        <!-- Bottom text -->
        <div style="position:absolute;bottom:300px;left:80px;right:80px;text-align:center;">
          <div style="font-family:${SERIF};font-size:${cs(160,city)}px;font-weight:bold;font-style:italic;color:white;line-height:0.82;text-shadow:0 4px 16px rgba(0,0,0,0.6);">${C}</div>
          <div style="font-family:${FUTURA};font-size:62px;font-weight:bold;color:#FFD700;letter-spacing:4px;margin-top:16px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:24px;color:rgba(255,255,255,0.4);margin-top:20px;">${CTA}</div>
        </div>
      </div>`

    // ─────────────────────────────────────────────────────────────
    // 27: CAUTION/WARNING — hazard stripes, bold industrial
    // ─────────────────────────────────────────────────────────────
    case 27: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#111;">
        <img src="${p}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:brightness(0.4) contrast(1.2);"/>
        <!-- Hazard stripes top -->
        <div style="position:absolute;top:0;left:0;right:0;height:80px;background:repeating-linear-gradient(135deg,#FFE600 0px,#FFE600 30px,#111 30px,#111 60px);"></div>
        <!-- Hazard stripes bottom -->
        <div style="position:absolute;bottom:0;left:0;right:0;height:80px;background:repeating-linear-gradient(135deg,#FFE600 0px,#FFE600 30px,#111 30px,#111 60px);"></div>
        <!-- Warning sign -->
        <div style="position:absolute;top:50%;left:60px;right:60px;transform:translateY(-50%);text-align:center;">
          <div style="font-family:${DISPLAY};font-size:60px;color:#FFE600;letter-spacing:10px;">⚠ WARNING ⚠</div>
          <div style="font-family:${DISPLAY};font-size:${cs(200,city)}px;color:white;text-transform:uppercase;line-height:0.82;margin-top:20px;text-shadow:0 4px 12px rgba(0,0,0,0.8);">${C}</div>
          <div style="font-family:${DISPLAY};font-size:80px;color:#FFE600;margin-top:20px;letter-spacing:4px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:32px;color:rgba(255,255,255,0.5);margin-top:24px;">CAUTION: MAY CAUSE EXCESSIVE COMPLIMENTS</div>
          <div style="font-family:${SANS};font-size:24px;color:rgba(255,230,0,0.4);margin-top:28px;">${CTA}</div>
        </div>
      </div>`

    // ─────────────────────────────────────────────────────────────
    // 28: VINYL RECORD — record sleeve / album art
    // ─────────────────────────────────────────────────────────────
    case 28: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#1a1a1a;">
        <!-- Record peeking out -->
        <div style="position:absolute;top:350px;right:-100px;width:800px;height:800px;border-radius:50%;background:radial-gradient(circle,#111 18%,#222 19%,#222 20%,#111 21%,#111 38%,#1a1a1a 39%,#1a1a1a 40%,#111 41%,#111 48%,#1a1a1a 49%,#1a1a1a 50%,#111 51%);border:4px solid #333;"></div>
        <!-- Center label of record -->
        <div style="position:absolute;top:700px;right:250px;width:100px;height:100px;border-radius:50%;background:radial-gradient(circle,#333 30%,#E63946 32%,#E63946 90%,#333 92%);"></div>
        <!-- Album cover / sleeve -->
        <div style="position:absolute;top:200px;left:80px;width:700px;height:700px;background:#111;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.5);">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
          <!-- Album text overlay -->
          <div style="position:absolute;bottom:0;left:0;right:0;padding:24px;background:linear-gradient(180deg,transparent,rgba(0,0,0,0.8));">
            <div style="font-family:${SERIF};font-size:48px;font-weight:bold;font-style:italic;color:white;">${city}</div>
          </div>
        </div>
        <!-- Bottom text -->
        <div style="position:absolute;bottom:280px;left:80px;right:80px;">
          <div style="font-family:${SERIF};font-size:${cs(140,city)}px;font-weight:bold;font-style:italic;color:white;line-height:0.85;">${C}</div>
          <div style="font-family:${FUTURA};font-size:60px;font-weight:bold;color:#E63946;letter-spacing:4px;margin-top:12px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${MONO};font-size:18px;color:rgba(255,255,255,0.3);margin-top:20px;">SIDE A • TRACK 01 • NOW PLAYING</div>
          <div style="font-family:${SANS};font-size:22px;color:rgba(255,255,255,0.35);margin-top:12px;">${CTA}</div>
        </div>
      </div>`

    // ─────────────────────────────────────────────────────────────
    // 29: INSTAGRAM NOTIFICATION — lock screen style
    // ─────────────────────────────────────────────────────────────
    case 29: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
        <img src="${p}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:brightness(0.5) blur(20px) saturate(1.3);"/>
        <!-- Time -->
        <div style="position:absolute;top:200px;left:0;right:0;text-align:center;">
          <div style="font-family:${SANS};font-size:180px;font-weight:200;color:white;letter-spacing:-4px;">3:14</div>
          <div style="font-family:${SANS};font-size:32px;font-weight:300;color:rgba(255,255,255,0.6);">Tuesday, March 18</div>
        </div>
        <!-- Notification -->
        <div style="position:absolute;top:620px;left:40px;right:40px;background:rgba(255,255,255,0.12);backdrop-filter:blur(30px);border-radius:20px;padding:24px;display:flex;gap:20px;align-items:flex-start;">
          <!-- IG icon -->
          <div style="width:70px;height:70px;border-radius:16px;background:linear-gradient(135deg,#833AB4,#FD1D1D,#F77737);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            <div style="font-family:${SERIF};font-size:32px;font-weight:bold;color:white;">IG</div>
          </div>
          <div style="flex:1;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <div style="font-family:${SANS};font-size:24px;font-weight:bold;color:white;">INSTAGRAM</div>
              <div style="font-family:${SANS};font-size:20px;color:rgba(255,255,255,0.4);">now</div>
            </div>
            <div style="font-family:${SANS};font-size:26px;color:rgba(255,255,255,0.8);margin-top:6px;line-height:1.4;">
              <b>@madebyaidan</b> is offering a FREE photo shoot in ${city}! 📸 DM to book your spot
            </div>
          </div>
        </div>
        <!-- Second notification -->
        <div style="position:absolute;top:810px;left:40px;right:40px;background:rgba(255,255,255,0.08);backdrop-filter:blur(30px);border-radius:20px;padding:24px;display:flex;gap:20px;align-items:flex-start;">
          <div style="width:70px;height:70px;border-radius:16px;background:linear-gradient(135deg,#833AB4,#FD1D1D,#F77737);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            <div style="font-family:${SERIF};font-size:32px;font-weight:bold;color:white;">IG</div>
          </div>
          <div style="flex:1;">
            <div style="font-family:${SANS};font-size:24px;font-weight:bold;color:white;">INSTAGRAM</div>
            <div style="font-family:${SANS};font-size:26px;color:rgba(255,255,255,0.8);margin-top:6px;line-height:1.4;">3 of your friends just booked their free photo shoot 🔥</div>
          </div>
        </div>
        <!-- Photo preview -->
        <div style="position:absolute;bottom:360px;left:120px;right:120px;height:440px;border-radius:16px;overflow:hidden;box-shadow:0 16px 40px rgba(0,0,0,0.4);">
          <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <!-- Bottom -->
        <div style="position:absolute;bottom:140px;left:60px;right:60px;text-align:center;">
          <div style="font-family:${FUTURA};font-size:${cs(80,city)}px;font-weight:bold;color:white;">${C}</div>
          <div style="font-family:${FUTURA};font-size:48px;font-weight:bold;color:rgba(255,255,255,0.8);letter-spacing:4px;margin-top:4px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:22px;color:rgba(255,255,255,0.35);margin-top:12px;">${CTA}</div>
        </div>
      </div>`
  }
}

// Build 90 slides: 30 per city
const slides = []

for (let ci = 0; ci < cities.length; ci++) {
  const city = cities[ci]
  for (let v = 0; v < 30; v++) {
    const pi1 = (v * 3 + ci * 7) % photos.length
    const pi2 = (v * 3 + ci * 7 + 1) % photos.length
    const pi3 = (v * 3 + ci * 7 + 2) % photos.length
    slides.push({
      name: `${city.toLowerCase()}-${String(v + 1).padStart(2, '0')}`,
      city,
      html: makeSlide(city, photos[pi1], photos[pi2], photos[pi3], v),
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
