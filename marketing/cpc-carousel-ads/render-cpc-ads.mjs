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

// Google Fonts loaded in the HTML head
const SERIF = "'Playfair Display', Georgia, serif"
const SANS = "'Inter', 'Helvetica Neue', sans-serif"
const DISPLAY = "'Oswald', 'Impact', sans-serif"
const MONO = "'Space Mono', 'Courier New', monospace"
const CONDENSED = "'Barlow Condensed', 'Arial Narrow', sans-serif"

const cities = ['Manila', 'Antipolo', 'Subic']
const CTA = 'if interested, message me for details'

function cs(base, city) {
  if (city.length <= 5) return base
  if (city.length <= 6) return Math.round(base * 0.88)
  return Math.round(base * 0.62)
}

// 30 unique creative variants
function makeSlide(city, photoSrc, variant) {
  const C = city.toUpperCase()
  const bg = `<img src="${photoSrc}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;"`

  switch (variant) {

    // ═══════════════════════════════════════════════════════════════
    // 0: GOLD EDITORIAL — gold city name, cream "FREE PHOTO SHOOT"
    // ═══════════════════════════════════════════════════════════════
    case 0: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
        ${bg}/>
        <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0.2) 0%,rgba(0,0,0,0.05) 30%,rgba(0,0,0,0.7) 65%,rgba(0,0,0,0.97) 100%);"></div>
        <div style="position:absolute;bottom:320px;left:60px;right:60px;">
          <div style="font-family:${SERIF};font-size:${cs(240,city)}px;font-weight:900;font-style:italic;color:#FFD700;line-height:0.82;text-shadow:0 4px 20px rgba(0,0,0,0.9),0 0 60px rgba(255,215,0,0.3);">${C}</div>
          <div style="font-family:${CONDENSED};font-size:82px;font-weight:700;color:#FFF5E0;margin-top:20px;letter-spacing:8px;text-transform:uppercase;text-shadow:0 2px 8px rgba(0,0,0,0.8);">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:32px;font-weight:400;color:rgba(255,245,224,0.6);margin-top:28px;letter-spacing:1px;">${CTA}</div>
        </div>
      </div>`

    // ═══════════════════════════════════════════════════════════════
    // 1: OUTLINED CITY — stroke-only city, solid "FREE PHOTO SHOOT"
    // ═══════════════════════════════════════════════════════════════
    case 1: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
        ${bg}/>
        <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0.1) 0%,rgba(0,0,0,0.6) 55%,rgba(0,0,0,0.95) 100%);"></div>
        <div style="position:absolute;bottom:340px;left:50px;right:50px;">
          <div style="font-family:${DISPLAY};font-size:${cs(220,city)}px;font-weight:700;color:transparent;-webkit-text-stroke:4px white;line-height:0.85;text-transform:uppercase;">${C}</div>
          <div style="font-family:${DISPLAY};font-size:78px;font-weight:700;color:white;margin-top:24px;letter-spacing:4px;text-transform:uppercase;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:30px;color:rgba(255,255,255,0.55);margin-top:28px;">${CTA}</div>
        </div>
      </div>`

    // ═══════════════════════════════════════════════════════════════
    // 2: CORAL PUNCH — coral/salmon city, white "FREE PHOTO SHOOT" on dark band
    // ═══════════════════════════════════════════════════════════════
    case 2: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
        ${bg}/>
        <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 60%,rgba(0,0,0,0.1) 0%,rgba(0,0,0,0.85) 100%);"></div>
        <div style="position:absolute;top:50%;left:0;right:0;transform:translateY(-50%);text-align:center;">
          <div style="font-family:${SERIF};font-size:${cs(260,city)}px;font-weight:900;font-style:italic;color:#FF6B6B;line-height:0.78;text-shadow:0 6px 30px rgba(255,107,107,0.4),0 2px 10px rgba(0,0,0,0.8);">${C}</div>
          <div style="font-family:${CONDENSED};font-size:86px;font-weight:700;color:white;margin-top:28px;letter-spacing:10px;text-shadow:0 2px 8px rgba(0,0,0,0.8);">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:30px;color:rgba(255,200,200,0.5);margin-top:32px;">${CTA}</div>
        </div>
      </div>`

    // ═══════════════════════════════════════════════════════════════
    // 3: MAGAZINE COVER — mixed sizes, overlapping, editorial chaos
    // ═══════════════════════════════════════════════════════════════
    case 3: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
        ${bg}/>
        <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0.8) 0%,rgba(0,0,0,0.15) 35%,rgba(0,0,0,0.15) 55%,rgba(0,0,0,0.9) 100%);"></div>
        <div style="position:absolute;top:120px;left:50px;right:50px;">
          <div style="font-family:${CONDENSED};font-size:100px;font-weight:700;color:#00E5FF;letter-spacing:14px;text-transform:uppercase;">FREE PHOTO SHOOT</div>
        </div>
        <div style="position:absolute;bottom:300px;left:40px;right:40px;">
          <div style="font-family:${SERIF};font-size:${cs(280,city)}px;font-weight:900;font-style:italic;color:white;line-height:0.75;text-shadow:0 8px 30px rgba(0,0,0,0.9);">${C}</div>
          <div style="font-family:${MONO};font-size:26px;color:rgba(0,229,255,0.6);margin-top:36px;letter-spacing:2px;">${CTA}</div>
        </div>
      </div>`

    // ═══════════════════════════════════════════════════════════════
    // 4: SPLIT HALF — top half dark with text, bottom half photo
    // ═══════════════════════════════════════════════════════════════
    case 4: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#0a0a0a;">
        <div style="position:absolute;top:960px;left:0;right:0;bottom:0;overflow:hidden;">
          <img src="${photoSrc}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="position:absolute;top:0;left:0;right:0;height:960px;display:flex;flex-direction:column;justify-content:center;padding:0 60px;">
          <div style="font-family:${SERIF};font-size:${cs(200,city)}px;font-weight:900;font-style:italic;color:#FF9F43;line-height:0.82;">${C}</div>
          <div style="font-family:${DISPLAY};font-size:90px;font-weight:700;color:white;margin-top:16px;letter-spacing:6px;">FREE PHOTO SHOOT</div>
          <div style="width:160px;height:5px;background:#FF9F43;margin:28px 0;"></div>
          <div style="font-family:${SANS};font-size:30px;color:rgba(255,255,255,0.5);">${CTA}</div>
        </div>
      </div>`

    // ═══════════════════════════════════════════════════════════════
    // 5: NEON GLOW — electric blue city, magenta "FREE PHOTO SHOOT"
    // ═══════════════════════════════════════════════════════════════
    case 5: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
        ${bg} filter:brightness(0.4) saturate(0.8);"/>
        <div style="position:absolute;inset:0;background:rgba(0,0,20,0.5);"></div>
        <div style="position:absolute;top:50%;left:50px;right:50px;transform:translateY(-50%);text-align:center;">
          <div style="font-family:${DISPLAY};font-size:${cs(240,city)}px;font-weight:700;color:#00F0FF;line-height:0.82;text-transform:uppercase;text-shadow:0 0 40px rgba(0,240,255,0.6),0 0 120px rgba(0,240,255,0.3),0 4px 8px rgba(0,0,0,0.9);">${C}</div>
          <div style="font-family:${CONDENSED};font-size:84px;font-weight:700;color:#FF00FF;margin-top:28px;letter-spacing:8px;text-shadow:0 0 30px rgba(255,0,255,0.5),0 0 80px rgba(255,0,255,0.2);">FREE PHOTO SHOOT</div>
          <div style="font-family:${MONO};font-size:26px;color:rgba(0,240,255,0.4);margin-top:36px;letter-spacing:3px;">${CTA}</div>
        </div>
      </div>`

    // ═══════════════════════════════════════════════════════════════
    // 6: WHITE CARD — clean white card with black text, photo behind
    // ═══════════════════════════════════════════════════════════════
    case 6: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
        ${bg} filter:saturate(1.15) contrast(1.05);"/>
        <div style="position:absolute;inset:0;background:linear-gradient(180deg,transparent 0%,transparent 40%,rgba(0,0,0,0.4) 100%);"></div>
        <div style="position:absolute;bottom:240px;left:40px;right:40px;background:white;border-radius:0;padding:56px 52px;">
          <div style="font-family:${SERIF};font-size:${cs(130,city)}px;font-weight:900;font-style:italic;color:#111;line-height:0.82;">${city}</div>
          <div style="font-family:${DISPLAY};font-size:56px;font-weight:700;color:#111;margin-top:14px;letter-spacing:4px;text-transform:uppercase;">FREE PHOTO SHOOT</div>
          <div style="width:100%;height:3px;background:#FF4444;margin:22px 0;"></div>
          <div style="font-family:${SANS};font-size:28px;color:#666;">${CTA}</div>
        </div>
      </div>`

    // ═══════════════════════════════════════════════════════════════
    // 7: DIAGONAL STRIPE — rotated color bar behind city name
    // ═══════════════════════════════════════════════════════════════
    case 7: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
        ${bg}/>
        <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0.15) 0%,rgba(0,0,0,0.6) 50%,rgba(0,0,0,0.95) 100%);"></div>
        <div style="position:absolute;bottom:520px;left:-40px;right:-40px;height:200px;background:#E63946;transform:rotate(-3deg);"></div>
        <div style="position:absolute;bottom:540px;left:60px;right:60px;">
          <div style="font-family:${DISPLAY};font-size:${cs(200,city)}px;font-weight:700;color:white;text-transform:uppercase;line-height:0.85;text-shadow:0 4px 12px rgba(0,0,0,0.5);">${C}</div>
        </div>
        <div style="position:absolute;bottom:340px;left:60px;right:60px;">
          <div style="font-family:${CONDENSED};font-size:80px;font-weight:700;color:white;letter-spacing:6px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:28px;color:rgba(255,255,255,0.5);margin-top:24px;">${CTA}</div>
        </div>
      </div>`

    // ═══════════════════════════════════════════════════════════════
    // 8: DUOTONE WARM — sepia overlay, vintage feel, cream text
    // ═══════════════════════════════════════════════════════════════
    case 8: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
        ${bg} filter:sepia(0.6) saturate(1.4) contrast(1.1);"/>
        <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(60,30,0,0.5) 0%,rgba(0,0,0,0.1) 30%,rgba(40,20,0,0.8) 70%,rgba(20,10,0,0.97) 100%);"></div>
        <div style="position:absolute;bottom:340px;left:60px;right:60px;">
          <div style="font-family:${SERIF};font-size:${cs(230,city)}px;font-weight:900;font-style:italic;color:#FFEEBB;line-height:0.82;text-shadow:0 4px 16px rgba(0,0,0,0.8);">${C}</div>
          <div style="font-family:${SERIF};font-size:76px;font-weight:700;font-style:italic;color:#FFD700;margin-top:20px;text-shadow:0 2px 8px rgba(0,0,0,0.7);">Free Photo Shoot</div>
          <div style="font-family:${SANS};font-size:28px;color:rgba(255,238,187,0.5);margin-top:28px;letter-spacing:1px;">${CTA}</div>
        </div>
      </div>`

    // ═══════════════════════════════════════════════════════════════
    // 9: MONOSPACE BRUTALIST — raw, monospace type, green accent
    // ═══════════════════════════════════════════════════════════════
    case 9: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
        ${bg} filter:grayscale(0.7) contrast(1.2);"/>
        <div style="position:absolute;inset:0;background:rgba(0,0,0,0.6);"></div>
        <div style="position:absolute;top:200px;left:50px;right:50px;">
          <div style="font-family:${MONO};font-size:36px;font-weight:700;color:#00FF88;letter-spacing:6px;text-transform:uppercase;">/// FREE PHOTO SHOOT</div>
          <div style="width:100%;height:2px;background:#00FF88;margin:20px 0;opacity:0.4;"></div>
        </div>
        <div style="position:absolute;bottom:400px;left:50px;right:50px;">
          <div style="font-family:${DISPLAY};font-size:${cs(260,city)}px;font-weight:700;color:white;text-transform:uppercase;line-height:0.78;">${C}</div>
          <div style="font-family:${CONDENSED};font-size:80px;font-weight:600;color:#00FF88;margin-top:16px;letter-spacing:6px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${MONO};font-size:24px;color:rgba(0,255,136,0.4);margin-top:28px;">&gt; ${CTA}</div>
        </div>
      </div>`

    // ═══════════════════════════════════════════════════════════════
    // 10: OVERSIZED BLEED — city name so big it bleeds off edges
    // ═══════════════════════════════════════════════════════════════
    case 10: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
        ${bg}/>
        <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0.7) 0%,rgba(0,0,0,0.2) 40%,rgba(0,0,0,0.2) 60%,rgba(0,0,0,0.85) 100%);"></div>
        <div style="position:absolute;top:50%;left:-30px;right:-30px;transform:translateY(-60%);">
          <div style="font-family:${DISPLAY};font-size:${cs(380,city)}px;font-weight:700;color:rgba(255,255,255,0.12);text-transform:uppercase;line-height:0.75;text-align:center;">${C}</div>
        </div>
        <div style="position:absolute;bottom:360px;left:60px;right:60px;text-align:center;">
          <div style="font-family:${SERIF};font-size:${cs(180,city)}px;font-weight:900;font-style:italic;color:white;line-height:0.85;text-shadow:0 4px 16px rgba(0,0,0,0.9);">${C}</div>
          <div style="font-family:${CONDENSED};font-size:84px;font-weight:700;color:#FF6B6B;margin-top:20px;letter-spacing:8px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:28px;color:rgba(255,255,255,0.45);margin-top:28px;">${CTA}</div>
        </div>
      </div>`

    // ═══════════════════════════════════════════════════════════════
    // 11: TEAL CINEMA — teal/cyan mood, cinematic bars
    // ═══════════════════════════════════════════════════════════════
    case 11: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
        ${bg} filter:saturate(0.8) contrast(1.1);"/>
        <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,30,40,0.85) 0%,rgba(0,20,30,0.3) 30%,rgba(0,20,30,0.3) 60%,rgba(0,30,40,0.95) 100%);"></div>
        <div style="position:absolute;top:0;left:0;right:0;height:160px;background:#000;"></div>
        <div style="position:absolute;bottom:0;left:0;right:0;height:160px;background:#000;"></div>
        <div style="position:absolute;top:200px;left:60px;">
          <div style="font-family:${CONDENSED};font-size:72px;font-weight:600;color:#4ECDC4;letter-spacing:10px;">FREE PHOTO SHOOT</div>
        </div>
        <div style="position:absolute;bottom:220px;left:60px;right:60px;">
          <div style="font-family:${SERIF};font-size:${cs(200,city)}px;font-weight:900;font-style:italic;color:#4ECDC4;line-height:0.82;text-shadow:0 0 40px rgba(78,205,196,0.3);">${C}</div>
          <div style="font-family:${SANS};font-size:28px;color:rgba(78,205,196,0.45);margin-top:24px;">${CTA}</div>
        </div>
      </div>`

    // ═══════════════════════════════════════════════════════════════
    // 12: VERTICAL STACK — city letters stacked vertically, bold
    // ═══════════════════════════════════════════════════════════════
    case 12: {
      const letters = C.split('').map(l =>
        `<div style="font-family:${DISPLAY};font-size:140px;font-weight:700;color:white;line-height:0.9;letter-spacing:-4px;">${l}</div>`
      ).join('')
      return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
        ${bg}/>
        <div style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,0.92) 0%,rgba(0,0,0,0.5) 40%,rgba(0,0,0,0.05) 100%);"></div>
        <div style="position:absolute;top:180px;left:60px;">
          ${letters}
        </div>
        <div style="position:absolute;bottom:400px;left:60px;right:60px;">
          <div style="font-family:${CONDENSED};font-size:86px;font-weight:700;color:#FFD54F;letter-spacing:6px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:28px;color:rgba(255,213,79,0.5);margin-top:24px;">${CTA}</div>
        </div>
      </div>`
    }

    // ═══════════════════════════════════════════════════════════════
    // 13: PINK GRADIENT — hot pink to magenta, bold display type
    // ═══════════════════════════════════════════════════════════════
    case 13: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
        ${bg}/>
        <div style="position:absolute;inset:0;background:linear-gradient(135deg,rgba(200,0,80,0.7) 0%,rgba(0,0,0,0.2) 40%,rgba(0,0,0,0.2) 60%,rgba(120,0,200,0.7) 100%);"></div>
        <div style="position:absolute;bottom:340px;left:50px;right:50px;">
          <div style="font-family:${DISPLAY};font-size:${cs(250,city)}px;font-weight:700;color:white;text-transform:uppercase;line-height:0.78;text-shadow:0 4px 20px rgba(200,0,80,0.5);">${C}</div>
          <div style="font-family:${CONDENSED};font-size:82px;font-weight:700;color:#FFB6C1;margin-top:20px;letter-spacing:8px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:28px;color:rgba(255,182,193,0.5);margin-top:28px;">${CTA}</div>
        </div>
      </div>`

    // ═══════════════════════════════════════════════════════════════
    // 14: RETRO WARM — 70s vibes, rounded feel, earth tones
    // ═══════════════════════════════════════════════════════════════
    case 14: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#2C1810;">
        ${bg} filter:sepia(0.3) saturate(1.3) brightness(0.85);"/>
        <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(60,20,0,0.6) 0%,rgba(0,0,0,0.1) 40%,rgba(0,0,0,0.1) 50%,rgba(40,15,0,0.9) 80%,rgba(30,10,0,0.98) 100%);"></div>
        <div style="position:absolute;bottom:330px;left:60px;right:60px;">
          <div style="font-family:${SERIF};font-size:${cs(220,city)}px;font-weight:900;font-style:italic;color:#FF8C42;line-height:0.82;text-shadow:0 4px 12px rgba(0,0,0,0.7);">${C}</div>
          <div style="font-family:${SERIF};font-size:78px;font-weight:700;font-style:italic;color:#FFECD2;margin-top:18px;">Free Photo Shoot</div>
          <div style="font-family:${SANS};font-size:28px;color:rgba(255,140,66,0.5);margin-top:28px;">${CTA}</div>
        </div>
      </div>`

    // ═══════════════════════════════════════════════════════════════
    // 15: DARK LUXURY — dark overlay, thin serif, gold accents
    // ═══════════════════════════════════════════════════════════════
    case 15: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
        ${bg} filter:brightness(0.35) saturate(0.9);"/>
        <div style="position:absolute;inset:80px;border:1px solid rgba(212,175,55,0.3);"></div>
        <div style="position:absolute;top:50%;left:80px;right:80px;transform:translateY(-50%);text-align:center;">
          <div style="font-family:${CONDENSED};font-size:56px;font-weight:300;color:#D4AF37;letter-spacing:20px;text-transform:uppercase;">FREE PHOTO SHOOT</div>
          <div style="width:200px;height:1px;background:#D4AF37;margin:30px auto;"></div>
          <div style="font-family:${SERIF};font-size:${cs(220,city)}px;font-weight:900;font-style:italic;color:#D4AF37;line-height:0.82;text-shadow:0 0 40px rgba(212,175,55,0.2);">${C}</div>
          <div style="width:200px;height:1px;background:#D4AF37;margin:30px auto;"></div>
          <div style="font-family:${CONDENSED};font-size:70px;font-weight:600;color:white;letter-spacing:8px;margin-top:10px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:26px;color:rgba(212,175,55,0.4);margin-top:28px;letter-spacing:4px;">${CTA}</div>
        </div>
      </div>`

    // ═══════════════════════════════════════════════════════════════
    // 16: BOLD BLACK BAR — solid black bars top/bottom, photo in middle
    // ═══════════════════════════════════════════════════════════════
    case 16: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
        <div style="position:absolute;top:440px;left:0;right:0;height:700px;overflow:hidden;">
          <img src="${photoSrc}" style="width:100%;height:100%;object-fit:cover;filter:saturate(1.15);"/>
        </div>
        <div style="position:absolute;top:0;left:0;right:0;height:440px;background:#000;display:flex;flex-direction:column;justify-content:center;padding:0 60px;">
          <div style="font-family:${DISPLAY};font-size:${cs(200,city)}px;font-weight:700;color:#FF4757;text-transform:uppercase;line-height:0.85;">${C}</div>
          <div style="font-family:${CONDENSED};font-size:76px;font-weight:700;color:white;letter-spacing:8px;margin-top:8px;">FREE PHOTO SHOOT</div>
        </div>
        <div style="position:absolute;bottom:0;left:0;right:0;height:780px;background:linear-gradient(180deg,transparent 0%,#000 15%);display:flex;align-items:flex-start;padding:200px 60px 0;">
          <div style="font-family:${SANS};font-size:30px;color:rgba(255,71,87,0.5);">${CTA}</div>
        </div>
      </div>`

    // ═══════════════════════════════════════════════════════════════
    // 17: ELECTRIC YELLOW — yellow city on dark, high energy
    // ═══════════════════════════════════════════════════════════════
    case 17: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
        ${bg} filter:brightness(0.5) contrast(1.2);"/>
        <div style="position:absolute;inset:0;background:rgba(0,0,0,0.4);"></div>
        <div style="position:absolute;bottom:360px;left:50px;right:50px;">
          <div style="font-family:${DISPLAY};font-size:${cs(270,city)}px;font-weight:700;color:#FFE600;text-transform:uppercase;line-height:0.76;text-shadow:0 0 60px rgba(255,230,0,0.3),0 4px 12px rgba(0,0,0,0.9);">${C}</div>
          <div style="font-family:${DISPLAY};font-size:80px;font-weight:700;color:white;margin-top:24px;letter-spacing:4px;text-transform:uppercase;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:28px;color:rgba(255,230,0,0.4);margin-top:28px;">${CTA}</div>
        </div>
      </div>`

    // ═══════════════════════════════════════════════════════════════
    // 18: FILM GRAIN — grainy BW with red accent text
    // ═══════════════════════════════════════════════════════════════
    case 18: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
        ${bg} filter:grayscale(1) contrast(1.3) brightness(0.9);"/>
        <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0.3) 0%,rgba(0,0,0,0.05) 30%,rgba(0,0,0,0.6) 65%,rgba(0,0,0,0.95) 100%);"></div>
        <div style="position:absolute;bottom:340px;left:60px;right:60px;">
          <div style="font-family:${SERIF};font-size:${cs(230,city)}px;font-weight:900;font-style:italic;color:white;line-height:0.82;text-shadow:0 4px 12px rgba(0,0,0,0.8);">${C}</div>
          <div style="font-family:${CONDENSED};font-size:82px;font-weight:700;color:#FF3333;margin-top:20px;letter-spacing:6px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:28px;color:rgba(255,51,51,0.45);margin-top:28px;">${CTA}</div>
        </div>
      </div>`

    // ═══════════════════════════════════════════════════════════════
    // 19: FLOATING CIRCLES — abstract circles behind text
    // ═══════════════════════════════════════════════════════════════
    case 19: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
        ${bg}/>
        <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0.6) 0%,rgba(0,0,0,0.2) 35%,rgba(0,0,0,0.7) 65%,rgba(0,0,0,0.96) 100%);"></div>
        <div style="position:absolute;top:400px;left:200px;width:500px;height:500px;border-radius:50%;border:2px solid rgba(255,165,0,0.2);"></div>
        <div style="position:absolute;top:600px;left:350px;width:350px;height:350px;border-radius:50%;border:2px solid rgba(255,165,0,0.15);"></div>
        <div style="position:absolute;bottom:340px;left:60px;right:60px;">
          <div style="font-family:${DISPLAY};font-size:${cs(240,city)}px;font-weight:700;color:white;text-transform:uppercase;line-height:0.8;">${C}</div>
          <div style="font-family:${CONDENSED};font-size:80px;font-weight:700;color:#FFA500;margin-top:20px;letter-spacing:8px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:28px;color:rgba(255,165,0,0.4);margin-top:28px;">${CTA}</div>
        </div>
      </div>`

    // ═══════════════════════════════════════════════════════════════
    // 20: REVERSED CLEAN — white bg strip, dark text, photo top
    // ═══════════════════════════════════════════════════════════════
    case 20: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#F5F5F0;">
        <div style="position:absolute;top:0;left:0;right:0;height:1100px;overflow:hidden;">
          <img src="${photoSrc}" style="width:100%;height:100%;object-fit:cover;filter:saturate(1.1);"/>
        </div>
        <div style="position:absolute;bottom:0;left:0;right:0;height:820px;background:#F5F5F0;display:flex;flex-direction:column;justify-content:center;padding:0 60px;">
          <div style="font-family:${SERIF};font-size:${cs(160,city)}px;font-weight:900;font-style:italic;color:#111;line-height:0.82;">${city}</div>
          <div style="font-family:${DISPLAY};font-size:70px;font-weight:700;color:#111;letter-spacing:4px;margin-top:14px;">FREE PHOTO SHOOT</div>
          <div style="width:120px;height:4px;background:#E63946;margin:24px 0;"></div>
          <div style="font-family:${SANS};font-size:28px;color:#888;">${CTA}</div>
        </div>
      </div>`

    // ═══════════════════════════════════════════════════════════════
    // 21: GLITCH DOUBLE — doubled offset text for glitch effect
    // ═══════════════════════════════════════════════════════════════
    case 21: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
        ${bg} filter:contrast(1.2) brightness(0.6);"/>
        <div style="position:absolute;inset:0;background:rgba(0,0,0,0.4);"></div>
        <div style="position:absolute;bottom:380px;left:50px;right:50px;">
          <div style="position:relative;">
            <div style="font-family:${DISPLAY};font-size:${cs(230,city)}px;font-weight:700;color:rgba(0,255,255,0.5);text-transform:uppercase;line-height:0.8;position:absolute;left:8px;top:8px;">${C}</div>
            <div style="font-family:${DISPLAY};font-size:${cs(230,city)}px;font-weight:700;color:rgba(255,0,100,0.5);text-transform:uppercase;line-height:0.8;position:absolute;left:-8px;top:-8px;">${C}</div>
            <div style="font-family:${DISPLAY};font-size:${cs(230,city)}px;font-weight:700;color:white;text-transform:uppercase;line-height:0.8;position:relative;">${C}</div>
          </div>
          <div style="font-family:${CONDENSED};font-size:80px;font-weight:700;color:#00FFFF;margin-top:28px;letter-spacing:6px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${MONO};font-size:24px;color:rgba(0,255,255,0.4);margin-top:28px;">${CTA}</div>
        </div>
      </div>`

    // ═══════════════════════════════════════════════════════════════
    // 22: SUNSET GRADIENT — warm orange-to-purple gradient overlay
    // ═══════════════════════════════════════════════════════════════
    case 22: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
        ${bg}/>
        <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(255,100,0,0.5) 0%,rgba(200,0,100,0.3) 40%,rgba(80,0,150,0.6) 70%,rgba(20,0,60,0.95) 100%);"></div>
        <div style="position:absolute;bottom:340px;left:60px;right:60px;">
          <div style="font-family:${SERIF};font-size:${cs(240,city)}px;font-weight:900;font-style:italic;color:white;line-height:0.8;text-shadow:0 4px 20px rgba(200,0,100,0.5);">${C}</div>
          <div style="font-family:${CONDENSED};font-size:84px;font-weight:700;color:#FFD4A0;margin-top:20px;letter-spacing:8px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:28px;color:rgba(255,212,160,0.45);margin-top:28px;">${CTA}</div>
        </div>
      </div>`

    // ═══════════════════════════════════════════════════════════════
    // 23: TYPE COLLAGE — mixed fonts/sizes, chaotic energy
    // ═══════════════════════════════════════════════════════════════
    case 23: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
        ${bg} filter:brightness(0.45);"/>
        <div style="position:absolute;inset:0;background:rgba(0,0,0,0.3);"></div>
        <div style="position:absolute;top:180px;left:50px;right:50px;">
          <div style="font-family:${MONO};font-size:44px;color:#00FF88;letter-spacing:8px;">FREE</div>
          <div style="font-family:${SERIF};font-size:120px;font-weight:900;font-style:italic;color:#FF6B6B;">PHOTO</div>
          <div style="font-family:${DISPLAY};font-size:140px;font-weight:700;color:white;letter-spacing:12px;margin-top:-20px;">SHOOT</div>
        </div>
        <div style="position:absolute;bottom:320px;left:50px;right:50px;">
          <div style="font-family:${SERIF};font-size:${cs(260,city)}px;font-weight:900;font-style:italic;color:#FFD700;line-height:0.78;text-shadow:0 6px 20px rgba(0,0,0,0.8);">${C}</div>
          <div style="font-family:${SANS};font-size:26px;color:rgba(255,215,0,0.4);margin-top:32px;">${CTA}</div>
        </div>
      </div>`

    // ═══════════════════════════════════════════════════════════════
    // 24: MINIMAL OUTLINE — thin border, centered, quiet power
    // ═══════════════════════════════════════════════════════════════
    case 24: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
        ${bg} filter:brightness(0.5) saturate(0.9);"/>
        <div style="position:absolute;inset:0;background:rgba(0,0,0,0.3);"></div>
        <div style="position:absolute;inset:50px;border:2px solid rgba(255,255,255,0.3);display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:60px;">
          <div style="font-family:${CONDENSED};font-size:60px;font-weight:300;color:rgba(255,255,255,0.6);letter-spacing:18px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SERIF};font-size:${cs(210,city)}px;font-weight:900;font-style:italic;color:white;line-height:0.82;margin-top:16px;text-shadow:0 4px 16px rgba(0,0,0,0.6);">${C}</div>
          <div style="font-family:${CONDENSED};font-size:72px;font-weight:700;color:white;letter-spacing:10px;margin-top:16px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:26px;color:rgba(255,255,255,0.35);margin-top:32px;">${CTA}</div>
        </div>
      </div>`

    // ═══════════════════════════════════════════════════════════════
    // 25: EMERALD DARK — deep green tones, nature luxury
    // ═══════════════════════════════════════════════════════════════
    case 25: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
        ${bg}/>
        <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,40,20,0.7) 0%,rgba(0,0,0,0.1) 35%,rgba(0,0,0,0.1) 55%,rgba(0,40,20,0.85) 75%,rgba(0,20,10,0.98) 100%);"></div>
        <div style="position:absolute;bottom:340px;left:60px;right:60px;">
          <div style="font-family:${SERIF};font-size:${cs(230,city)}px;font-weight:900;font-style:italic;color:#50C878;line-height:0.82;text-shadow:0 4px 16px rgba(0,0,0,0.7),0 0 40px rgba(80,200,120,0.2);">${C}</div>
          <div style="font-family:${CONDENSED};font-size:80px;font-weight:700;color:rgba(200,255,220,0.9);margin-top:20px;letter-spacing:8px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:28px;color:rgba(80,200,120,0.4);margin-top:28px;">${CTA}</div>
        </div>
      </div>`

    // ═══════════════════════════════════════════════════════════════
    // 26: TRIPLE REPEAT — city name repeated 3x, increasing opacity
    // ═══════════════════════════════════════════════════════════════
    case 26: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
        ${bg}/>
        <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0.8) 0%,rgba(0,0,0,0.2) 40%,rgba(0,0,0,0.8) 70%,rgba(0,0,0,0.97) 100%);"></div>
        <div style="position:absolute;bottom:280px;left:50px;right:50px;">
          <div style="font-family:${DISPLAY};font-size:${cs(140,city)}px;font-weight:700;color:rgba(255,255,255,0.15);text-transform:uppercase;line-height:0.9;">${C}</div>
          <div style="font-family:${DISPLAY};font-size:${cs(140,city)}px;font-weight:700;color:rgba(255,255,255,0.4);text-transform:uppercase;line-height:0.9;">${C}</div>
          <div style="font-family:${DISPLAY};font-size:${cs(140,city)}px;font-weight:700;color:white;text-transform:uppercase;line-height:0.9;">${C}</div>
          <div style="font-family:${CONDENSED};font-size:78px;font-weight:700;color:#FF6348;margin-top:24px;letter-spacing:6px;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:28px;color:rgba(255,99,72,0.4);margin-top:24px;">${CTA}</div>
        </div>
      </div>`

    // ═══════════════════════════════════════════════════════════════
    // 27: LAVENDER DREAM — soft purple/lavender, dreamy mood
    // ═══════════════════════════════════════════════════════════════
    case 27: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
        ${bg} filter:saturate(0.9) brightness(0.8);"/>
        <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(100,50,150,0.5) 0%,rgba(0,0,0,0.1) 35%,rgba(0,0,0,0.1) 55%,rgba(80,30,120,0.8) 75%,rgba(40,10,60,0.97) 100%);"></div>
        <div style="position:absolute;bottom:340px;left:60px;right:60px;">
          <div style="font-family:${SERIF};font-size:${cs(230,city)}px;font-weight:900;font-style:italic;color:#DDA0DD;line-height:0.82;text-shadow:0 4px 20px rgba(221,160,221,0.3);">${C}</div>
          <div style="font-family:${SERIF};font-size:76px;font-weight:700;font-style:italic;color:white;margin-top:20px;">Free Photo Shoot</div>
          <div style="font-family:${SANS};font-size:28px;color:rgba(221,160,221,0.45);margin-top:28px;">${CTA}</div>
        </div>
      </div>`

    // ═══════════════════════════════════════════════════════════════
    // 28: HARD CUT — photo left half, solid color right half
    // ═══════════════════════════════════════════════════════════════
    case 28: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#111;">
        <div style="position:absolute;top:0;left:0;width:540px;height:100%;overflow:hidden;">
          <img src="${photoSrc}" style="width:200%;height:100%;object-fit:cover;object-position:center;filter:saturate(1.1);"/>
        </div>
        <div style="position:absolute;top:0;left:540px;right:0;bottom:0;background:#111;display:flex;flex-direction:column;justify-content:center;padding:0 50px;">
          <div style="font-family:${DISPLAY};font-size:${cs(120,city)}px;font-weight:700;color:#FF6B6B;text-transform:uppercase;line-height:0.85;">${C}</div>
          <div style="font-family:${CONDENSED};font-size:52px;font-weight:700;color:white;margin-top:16px;letter-spacing:4px;">FREE<br>PHOTO<br>SHOOT</div>
          <div style="width:80px;height:3px;background:#FF6B6B;margin:24px 0;"></div>
          <div style="font-family:${SANS};font-size:22px;color:rgba(255,255,255,0.4);line-height:1.5;">${CTA}</div>
        </div>
      </div>`

    // ═══════════════════════════════════════════════════════════════
    // 29: FULL SCREEN BOLD — max size everything, no subtlety
    // ═══════════════════════════════════════════════════════════════
    case 29: return `
      <div style="width:1080px;height:1920px;position:relative;overflow:hidden;background:#000;">
        ${bg} filter:brightness(0.3);"/>
        <div style="position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:40px;">
          <div style="font-family:${DISPLAY};font-size:${cs(300,city)}px;font-weight:700;color:white;text-transform:uppercase;line-height:0.75;text-shadow:0 8px 30px rgba(0,0,0,0.5);">${C}</div>
          <div style="font-family:${DISPLAY};font-size:100px;font-weight:700;color:#FF4757;margin-top:28px;letter-spacing:6px;text-transform:uppercase;">FREE PHOTO SHOOT</div>
          <div style="font-family:${SANS};font-size:30px;color:rgba(255,71,87,0.5);margin-top:32px;">${CTA}</div>
        </div>
      </div>`
  }
}

// Build 90 slides: 30 per city
const slides = []

for (let ci = 0; ci < cities.length; ci++) {
  const city = cities[ci]
  for (let v = 0; v < 30; v++) {
    const photoIdx = (v * 3 + ci * 7) % photos.length
    slides.push({
      name: `${city.toLowerCase()}-${String(v + 1).padStart(2, '0')}`,
      city,
      html: makeSlide(city, photos[photoIdx], v),
    })
  }
}

const GOOGLE_FONTS = `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700;1,900&family=Inter:wght@300;400;500;600;700;800;900&family=Oswald:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&family=Barlow+Condensed:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
`

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
    await page.setContent(`<!doctype html><html><head>
      ${GOOGLE_FONTS}
      <style>
        * { box-sizing: border-box; }
        html, body { margin: 0; width: 1080px; height: 1920px; background: #000; overflow: hidden; }
        body { -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; }
      </style>
    </head><body>${slide.html}</body></html>`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(500)
    const outPath = path.join(OUT, slide.city.toLowerCase(), `${slide.name}.png`)
    await page.screenshot({ path: outPath, type: 'png' })
    await page.close()
    console.log(`  [${i + 1}/${slides.length}] ${slide.name}`)
  }

  await browser.close()
  console.log(`\nDone — ${slides.length} CPC ads rendered to ${OUT}`)
}

render()
