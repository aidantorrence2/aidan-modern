import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, 'output')
const IMG_DIR = '/Users/aidantorrence/Documents/aidan-modern/public/images/large'

// ── Image loader (same pattern as render-v4.mjs) ──

function img(filename) {
  const buf = fs.readFileSync(path.join(IMG_DIR, filename))
  return `data:image/jpeg;base64,${buf.toString('base64')}`
}

// ── Load all photos ──

const img0075 = img('manila-gallery-dsc-0075.jpg')
const img0130 = img('manila-gallery-dsc-0130.jpg')
const img0190 = img('manila-gallery-dsc-0190.jpg')
const img0911 = img('manila-gallery-dsc-0911.jpg')
const imgNight1 = img('manila-gallery-night-001.jpg')
const imgNight3 = img('manila-gallery-night-003.jpg')
const imgMarket = img('manila-gallery-market-001.jpg')
const imgTropical = img('manila-gallery-tropical-001.jpg')
const imgUrban3 = img('manila-gallery-urban-003.jpg')
const imgGarden1 = img('manila-gallery-garden-001.jpg')
const imgGarden2 = img('manila-gallery-garden-002.jpg')
const imgCanal1 = img('manila-gallery-canal-001.jpg')
const imgCanal2 = img('manila-gallery-canal-002.jpg')
const imgFloor = img('manila-gallery-floor-001.jpg')
const imgRocks = img('manila-gallery-rocks-001.jpg')
const imgIvy1 = img('manila-gallery-ivy-001.jpg')
const imgIvy2 = img('manila-gallery-ivy-002.jpg')
const imgPark = img('manila-gallery-park-001.jpg')
const imgStatue = img('manila-gallery-statue-001.jpg')
const imgStreet = img('manila-gallery-street-001.jpg')
const imgCloseup = img('manila-gallery-closeup-001.jpg')
const imgShadow = img('manila-gallery-shadow-001.jpg')

// Photo pools per theme
const vhsPhotos = [img0911, img0190, imgCanal1, imgMarket, imgUrban3, imgNight1, imgNight3, imgStreet]
const boothPhotos = [img0075, img0130, img0190, img0911, imgGarden1, imgGarden2, imgIvy1, imgIvy2, imgPark, imgStatue]
const slotPhotos = [imgMarket, imgTropical, imgUrban3, imgCanal1, imgCanal2, imgFloor, imgRocks]
const btsPhotos = [img0075, img0130, img0190, img0911, imgNight1, imgNight3, imgMarket, imgGarden1, imgGarden2, imgCloseup, imgShadow, imgStreet]
const tetrisPhotos = [imgIvy1, imgIvy2, imgPark, imgStatue, imgStreet, imgCloseup, imgShadow, imgRocks, imgFloor]

const SERIF = "Georgia, 'Times New Roman', serif"
const SANS = "-apple-system, system-ui, 'Helvetica Neue', sans-serif"
const MONO = "'Courier New', Courier, monospace"
const S = 'text-shadow: 0 2px 4px rgba(0,0,0,0.95), 0 8px 30px rgba(0,0,0,0.7);'

const locations = ['Manila', 'Antipolo', 'Subic']

const steps = [
  'DM me on Instagram',
  'We plan your shoot together',
  'Show up and get amazing photos'
]

const deliverables = [
  'A fun, guided photo shoot',
  'Edited photos ready to post',
  'Help with outfits & location',
  'Direct communication start to finish'
]

// ── Shared helpers ──

function filmGrain(opacity = 0.1) {
  return `<div style="position:absolute;inset:0;pointer-events:none;opacity:${opacity};mix-blend-mode:soft-light;background-image:
    radial-gradient(circle at 14% 18%, rgba(255,255,255,0.5), transparent 17%),
    radial-gradient(circle at 84% 12%, rgba(255,255,255,0.28), transparent 15%),
    radial-gradient(circle at 50% 80%, rgba(255,255,255,0.22), transparent 22%),
    repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0 1px, transparent 1px 4px),
    repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 5px);"></div>`
}

function wrap(content) {
  return `<div style="width:1080px;height:1920px;position:relative;overflow:hidden;">${content}</div>`
}

// ═══════════════════════════════════════════════════════════════
// THEME 1: VHS
// ═══════════════════════════════════════════════════════════════

function vhsScanlines() {
  return `<div style="position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(
    0deg, transparent 0px, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px);"></div>`
}

function vhsTrackingLines() {
  return `<div style="position:absolute;top:32%;left:0;right:0;height:8px;background:rgba(255,255,255,0.08);filter:blur(2px);"></div>
  <div style="position:absolute;top:67%;left:0;right:0;height:6px;background:rgba(255,255,255,0.06);filter:blur(3px);"></div>`
}

function vhsRecDot() {
  return `<div style="position:absolute;top:60px;left:60px;display:flex;align-items:center;gap:14px;z-index:5;">
    <div style="width:20px;height:20px;border-radius:50%;background:#ff0000;box-shadow:0 0 12px rgba(255,0,0,0.8);"></div>
    <span style="font-family:${MONO};font-size:28px;color:#ff0000;font-weight:700;letter-spacing:2px;">REC</span>
  </div>`
}

function vhsTimestamp(text) {
  return `<span style="font-family:${MONO};font-size:22px;color:rgba(255,255,255,0.7);letter-spacing:1px;">${text}</span>`
}

function vhsSlide1(location) {
  return {
    name: '01-hook',
    html: wrap(`
      <div style="position:absolute;inset:0;background:#000;">
        <img src="${vhsPhotos[0]}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(0.85) contrast(1.15) brightness(0.9);"/>
        <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(0,0,0,0.4) 0%, transparent 30%, transparent 60%, rgba(0,0,0,0.85) 100%);"></div>
        ${vhsScanlines()}
        ${vhsRecDot()}
        <div style="position:absolute;top:60px;right:60px;z-index:5;">
          ${vhsTimestamp('PM 03:42:17')}
        </div>
        <div style="position:absolute;bottom:480px;left:64px;right:64px;z-index:5;">
          <div style="font-family:${MONO};font-size:26px;color:rgba(255,255,255,0.5);letter-spacing:6px;margin-bottom:16px;">PLAY ▶</div>
          <h1 style="font-family:${MONO};font-size:88px;font-weight:700;color:white;line-height:1.05;margin:0;${S}">FREE<br/>PHOTO<br/>SHOOT</h1>
          <p style="font-family:${MONO};font-size:34px;color:rgba(255,255,255,0.7);margin:28px 0 0;letter-spacing:3px;">${location.toUpperCase()} 2026</p>
        </div>
        ${vhsTrackingLines()}
        ${filmGrain(0.15)}
      </div>
    `)
  }
}

function vhsSlide2() {
  const gridPhotos = [vhsPhotos[1], vhsPhotos[2], vhsPhotos[3], vhsPhotos[4]]
  const timestamps = ['PM 01:12:33', 'PM 02:45:08', 'AM 11:22:41', 'PM 04:58:19']
  const cells = gridPhotos.map((p, i) => {
    const col = i % 2
    const row = Math.floor(i / 2)
    const x = 40 + col * 510
    const y = 440 + row * 520
    return `<div style="position:absolute;left:${x}px;top:${y}px;width:490px;height:500px;overflow:hidden;border:3px solid rgba(255,255,255,0.15);">
      <img src="${p}" style="width:100%;height:100%;object-fit:cover;filter:saturate(0.8) contrast(1.1);"/>
      <div style="position:absolute;bottom:12px;right:16px;">${vhsTimestamp(timestamps[i])}</div>
      ${vhsScanlines()}
    </div>`
  }).join('\n')
  return {
    name: '02-proof',
    html: wrap(`
      <div style="position:absolute;inset:0;background:#0a0a0a;">
        <div style="position:absolute;top:200px;left:64px;z-index:5;">
          <h2 style="font-family:${MONO};font-size:56px;font-weight:700;color:white;letter-spacing:4px;margin:0;">RECENT FOOTAGE</h2>
          <div style="width:120px;height:4px;background:#ff0000;margin-top:16px;"></div>
        </div>
        ${cells}
        <div style="position:absolute;bottom:380px;left:64px;right:64px;text-align:center;z-index:5;">
          <p style="font-family:${MONO};font-size:28px;color:rgba(255,255,255,0.5);">No experience needed. I direct everything.</p>
        </div>
        ${vhsRecDot()}
        ${vhsTrackingLines()}
        ${filmGrain(0.12)}
      </div>
    `)
  }
}

function vhsSlide3() {
  const stepLines = steps.map((s, i) =>
    `<div style="margin-bottom:40px;">
      <span style="color:#00ff00;font-size:32px;">$ step_${i + 1}:</span>
      <span style="color:#33ff33;font-size:30px;margin-left:12px;">${s}</span>
      <div style="color:rgba(0,255,0,0.4);font-size:22px;margin-top:6px;">// confirmed ✓</div>
    </div>`
  ).join('\n')
  return {
    name: '03-how',
    html: wrap(`
      <div style="position:absolute;inset:0;background:#0a0e08;">
        <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 50%, rgba(0,40,0,0.3), transparent 70%);"></div>
        ${vhsScanlines()}
        <div style="position:absolute;top:200px;left:64px;z-index:5;">
          <h2 style="font-family:${MONO};font-size:52px;font-weight:700;color:#00ff00;letter-spacing:4px;margin:0;">HOW IT WORKS</h2>
          <div style="width:100px;height:3px;background:#00ff00;margin-top:14px;opacity:0.6;"></div>
        </div>
        <div style="position:absolute;top:420px;left:80px;right:80px;font-family:${MONO};z-index:5;">
          <div style="color:rgba(0,255,0,0.3);font-size:24px;margin-bottom:30px;">C:\\PHOTOSHOOT\\> run process.exe</div>
          ${stepLines}
          <div style="color:rgba(0,255,0,0.5);font-size:24px;margin-top:40px;">
            > process complete.<br/>
            > awaiting your input...<br/>
            <span style="animation:blink 1s infinite;">_</span>
          </div>
        </div>
        ${vhsTrackingLines()}
        ${filmGrain(0.1)}
      </div>
    `)
  }
}

function vhsSlide4() {
  const itemLines = deliverables.map(d =>
    `<div style="display:flex;align-items:flex-start;gap:16px;margin-bottom:28px;">
      <span style="color:white;font-size:28px;flex-shrink:0;">▸</span>
      <span style="color:rgba(255,255,255,0.85);font-size:30px;line-height:1.4;">${d}</span>
    </div>`
  ).join('\n')
  return {
    name: '04-what',
    html: wrap(`
      <div style="position:absolute;inset:0;background:#0a0a0a;">
        <img src="${vhsPhotos[5]}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(0.8) contrast(1.1) brightness(0.35);"/>
        ${vhsScanlines()}
        <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.8) 100%);"></div>
        <!-- VHS UI elements -->
        <div style="position:absolute;top:60px;left:60px;font-family:${MONO};font-size:24px;color:rgba(255,255,255,0.4);z-index:5;">SP ▶ PLAY</div>
        <div style="position:absolute;top:60px;right:60px;z-index:5;">${vhsTimestamp('PM 05:30:00')}</div>
        <div style="position:absolute;top:90px;right:60px;font-family:${MONO};font-size:20px;color:rgba(255,255,255,0.3);z-index:5;">CH 03</div>
        <div style="position:absolute;top:260px;left:64px;right:64px;z-index:5;">
          <h2 style="font-family:${MONO};font-size:56px;font-weight:700;color:white;letter-spacing:3px;margin:0 0 16px;">WHAT YOU GET</h2>
          <div style="width:100px;height:4px;background:#ff0000;margin-bottom:50px;"></div>
          <div style="font-family:${MONO};">${itemLines}</div>
          <div style="margin-top:40px;padding:24px 30px;border:2px solid rgba(255,255,255,0.2);display:inline-block;">
            <span style="font-family:${MONO};font-size:36px;color:white;font-weight:700;">COST: FREE</span>
          </div>
        </div>
        ${vhsTrackingLines()}
        ${filmGrain(0.12)}
      </div>
    `)
  }
}

function vhsSlide5(location) {
  return {
    name: '05-cta',
    html: wrap(`
      <div style="position:absolute;inset:0;background:#0a0a0a;">
        <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 40%, rgba(30,30,50,0.6), transparent 70%);"></div>
        ${vhsScanlines()}
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;z-index:5;width:900px;">
          <!-- Pause icon -->
          <div style="display:flex;justify-content:center;gap:20px;margin-bottom:50px;">
            <div style="width:28px;height:80px;background:white;"></div>
            <div style="width:28px;height:80px;background:white;"></div>
          </div>
          <h2 style="font-family:${MONO};font-size:72px;font-weight:700;color:white;letter-spacing:4px;margin:0 0 24px;">DM ME</h2>
          <p style="font-family:${MONO};font-size:44px;color:#ff0000;margin:0 0 40px;letter-spacing:2px;">@madebyaidan</p>
          <div style="width:200px;height:3px;background:rgba(255,255,255,0.2);margin:0 auto 40px;"></div>
          <p style="font-family:${MONO};font-size:28px;color:rgba(255,255,255,0.5);letter-spacing:2px;">FREE PHOTO SHOOT</p>
          <p style="font-family:${MONO};font-size:28px;color:rgba(255,255,255,0.5);letter-spacing:2px;">${location.toUpperCase()} 2026</p>
          <!-- Play button -->
          <div style="margin-top:60px;">
            <div style="display:inline-block;border:3px solid rgba(255,255,255,0.4);border-radius:50%;width:90px;height:90px;position:relative;">
              <div style="position:absolute;top:50%;left:55%;transform:translate(-50%,-50%);width:0;height:0;border-top:22px solid transparent;border-bottom:22px solid transparent;border-left:36px solid rgba(255,255,255,0.7);"></div>
            </div>
          </div>
        </div>
        ${vhsTrackingLines()}
        ${filmGrain(0.1)}
      </div>
    `)
  }
}

// ═══════════════════════════════════════════════════════════════
// THEME 2: PHOTO BOOTH
// ═══════════════════════════════════════════════════════════════

function boothStrip(photos, x, y, rot = 0, w = 280, photoH = 200) {
  const padding = 16
  const gap = 10
  const totalH = padding * 2 + photos.length * photoH + (photos.length - 1) * gap + 60
  const cells = photos.map((p, i) =>
    `<div style="width:${w - padding * 2}px;height:${photoH}px;overflow:hidden;border-radius:2px;">
      <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
    </div>`
  ).join('\n')
  return `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${totalH}px;background:white;padding:${padding}px;display:flex;flex-direction:column;gap:${gap}px;align-items:center;transform:rotate(${rot}deg);box-shadow:0 12px 40px rgba(0,0,0,0.5);border-radius:4px;">
    ${cells}
    <div style="height:40px;display:flex;align-items:center;justify-content:center;">
      <span style="font-family:${SERIF};font-size:16px;color:#888;font-style:italic;">photo booth</span>
    </div>
  </div>`
}

function boothSlide1(location) {
  const stripPhotos = [boothPhotos[0], boothPhotos[1], boothPhotos[2]]
  return {
    name: '01-hook',
    html: wrap(`
      <div style="position:absolute;inset:0;background:#1a0f0a;">
        <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 50%, rgba(80,40,10,0.5), transparent 70%);"></div>
        <!-- Warm curtain texture -->
        <div style="position:absolute;inset:0;background:repeating-linear-gradient(90deg, rgba(60,20,0,0.15) 0px, transparent 3px, transparent 20px);"></div>
        <!-- Sign -->
        <div style="position:absolute;top:160px;left:50%;transform:translateX(-50%);text-align:center;z-index:5;width:800px;">
          <div style="background:rgba(0,0,0,0.6);border:3px solid rgba(255,200,120,0.5);border-radius:12px;padding:30px 40px;">
            <p style="font-family:${SERIF};font-size:28px;color:rgba(255,200,120,0.7);margin:0 0 8px;letter-spacing:6px;">★ ${location.toUpperCase()} ★</p>
            <h1 style="font-family:${SERIF};font-size:64px;font-weight:700;color:white;margin:0;line-height:1.1;${S}">STEP INTO<br/>THE BOOTH</h1>
            <p style="font-family:${SANS};font-size:28px;color:rgba(255,200,120,0.8);margin:18px 0 0;">Free Photo Shoot</p>
          </div>
        </div>
        <!-- Photo strip -->
        ${boothStrip(stripPhotos, 380, 620, -2, 320, 280)}
        <!-- Warm glow -->
        <div style="position:absolute;bottom:0;left:0;right:0;height:300px;background:linear-gradient(transparent, rgba(255,150,50,0.08));"></div>
        ${filmGrain(0.08)}
      </div>
    `)
  }
}

function boothSlide2() {
  const strip1 = [boothPhotos[0], boothPhotos[1], boothPhotos[2], boothPhotos[3]]
  const strip2 = [boothPhotos[4], boothPhotos[5], boothPhotos[6], boothPhotos[7]]
  return {
    name: '02-proof',
    html: wrap(`
      <div style="position:absolute;inset:0;background:#1a0f0a;">
        <div style="position:absolute;inset:0;background:repeating-linear-gradient(90deg, rgba(60,20,0,0.12) 0px, transparent 3px, transparent 20px);"></div>
        <div style="position:absolute;top:120px;left:50%;transform:translateX(-50%);text-align:center;z-index:5;">
          <h2 style="font-family:${SERIF};font-size:52px;font-weight:700;color:white;margin:0;${S}">Recent Sessions</h2>
          <p style="font-family:${SANS};font-size:26px;color:rgba(255,200,120,0.6);margin:12px 0 0;">No experience needed</p>
        </div>
        ${boothStrip(strip1, 90, 320, -3, 400, 240)}
        ${boothStrip(strip2, 570, 350, 2.5, 400, 240)}
        ${filmGrain(0.08)}
      </div>
    `)
  }
}

function boothSlide3() {
  const stepCards = steps.map((s, i) =>
    `<div style="background:rgba(255,248,240,0.95);border-radius:8px;padding:30px 36px;display:flex;align-items:flex-start;gap:20px;box-shadow:0 4px 16px rgba(0,0,0,0.15);">
      <span style="font-family:${SERIF};font-size:42px;font-weight:700;color:#8B4513;flex-shrink:0;">${i + 1}</span>
      <span style="font-family:${SANS};font-size:30px;color:#3a2a1a;line-height:1.4;padding-top:6px;">${s}</span>
    </div>`
  ).join('\n')
  return {
    name: '03-how',
    html: wrap(`
      <div style="position:absolute;inset:0;background:#f5ede4;">
        <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 30%, rgba(255,220,180,0.3), transparent 60%);"></div>
        <div style="position:absolute;top:200px;left:64px;right:64px;z-index:5;">
          <h2 style="font-family:${SERIF};font-size:58px;font-weight:700;color:#2a1a0a;margin:0 0 12px;">How It Works</h2>
          <div style="width:80px;height:4px;background:#8B4513;margin-bottom:50px;"></div>
          <div style="display:flex;flex-direction:column;gap:28px;">
            ${stepCards}
          </div>
          <p style="font-family:${SANS};font-size:28px;color:#6a5040;margin:44px 0 0;line-height:1.5;">No experience needed.<br/>I guide you the whole time.</p>
        </div>
        ${filmGrain(0.05)}
      </div>
    `)
  }
}

function boothSlide4() {
  const items = deliverables.map(d =>
    `<div style="background:white;border-radius:6px;padding:22px 28px;display:flex;align-items:center;gap:16px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
      <span style="font-family:${SANS};font-size:24px;color:#8B4513;">●</span>
      <span style="font-family:${SANS};font-size:28px;color:#3a2a1a;line-height:1.35;">${d}</span>
    </div>`
  ).join('\n')
  return {
    name: '04-what',
    html: wrap(`
      <div style="position:absolute;inset:0;background:#f5ede4;">
        <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 60%, rgba(255,220,180,0.25), transparent 60%);"></div>
        <!-- Small strip decoration -->
        ${boothStrip([boothPhotos[8], boothPhotos[9]], 740, 900, 4, 260, 200)}
        <div style="position:absolute;top:200px;left:64px;right:640px;z-index:5;">
          <h2 style="font-family:${SERIF};font-size:56px;font-weight:700;color:#2a1a0a;margin:0 0 12px;">What You Get</h2>
          <div style="width:80px;height:4px;background:#8B4513;margin-bottom:44px;"></div>
        </div>
        <div style="position:absolute;top:400px;left:64px;right:80px;z-index:5;display:flex;flex-direction:column;gap:20px;">
          ${items}
          <div style="margin-top:24px;padding:20px 28px;background:#2a1a0a;border-radius:8px;display:inline-block;">
            <span style="font-family:${SERIF};font-size:34px;font-weight:700;color:white;">100% Free</span>
          </div>
        </div>
        ${filmGrain(0.05)}
      </div>
    `)
  }
}

function boothSlide5(location) {
  return {
    name: '05-cta',
    html: wrap(`
      <div style="position:absolute;inset:0;background:#1a0f0a;">
        <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 45%, rgba(120,60,10,0.35), transparent 65%);"></div>
        <div style="position:absolute;inset:0;background:repeating-linear-gradient(90deg, rgba(60,20,0,0.12) 0px, transparent 3px, transparent 20px);"></div>
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;z-index:5;width:800px;">
          <!-- Photo booth slot -->
          <div style="background:white;border-radius:10px;padding:50px 40px;box-shadow:0 20px 60px rgba(0,0,0,0.5);margin-bottom:40px;">
            <p style="font-family:${SERIF};font-size:36px;color:#8B4513;margin:0 0 20px;letter-spacing:4px;">${location.toUpperCase()}</p>
            <h2 style="font-family:${SERIF};font-size:80px;font-weight:700;color:#1a0f0a;margin:0 0 16px;line-height:1;">DM ME</h2>
            <p style="font-family:${SANS};font-size:44px;color:#8B4513;margin:0 0 24px;font-weight:600;">@madebyaidan</p>
            <div style="width:200px;height:2px;background:#d4a574;margin:0 auto 24px;"></div>
            <p style="font-family:${SANS};font-size:26px;color:#8a7060;">Free Photo Shoot</p>
          </div>
          <!-- Warm glow effect -->
          <div style="width:400px;height:4px;background:linear-gradient(90deg, transparent, rgba(255,180,100,0.4), transparent);margin:0 auto;"></div>
        </div>
        ${filmGrain(0.08)}
      </div>
    `)
  }
}

// ═══════════════════════════════════════════════════════════════
// THEME 3: SLOT MACHINE
// ═══════════════════════════════════════════════════════════════

function marqueeLight(x, y, on = true) {
  const color = on ? '#FFD700' : 'rgba(255,215,0,0.15)'
  const shadow = on ? 'box-shadow:0 0 10px rgba(255,215,0,0.6);' : ''
  return `<div style="position:absolute;left:${x}px;top:${y}px;width:16px;height:16px;border-radius:50%;background:${color};${shadow}"></div>`
}

function marqueeBorder(top, left, width, height) {
  const lights = []
  const spacing = 36
  // Top edge
  for (let x = 0; x < width; x += spacing) {
    lights.push(marqueeLight(left + x, top, (x / spacing) % 2 === 0))
  }
  // Bottom edge
  for (let x = 0; x < width; x += spacing) {
    lights.push(marqueeLight(left + x, top + height, (x / spacing) % 2 !== 0))
  }
  // Left edge
  for (let y = spacing; y < height; y += spacing) {
    lights.push(marqueeLight(left, top + y, (y / spacing) % 2 === 0))
  }
  // Right edge
  for (let y = spacing; y < height; y += spacing) {
    lights.push(marqueeLight(left + width, top + y, (y / spacing) % 2 !== 0))
  }
  return lights.join('\n')
}

function slotSlide1(location) {
  return {
    name: '01-hook',
    html: wrap(`
      <div style="position:absolute;inset:0;background:linear-gradient(180deg, #1a0000 0%, #0d0000 50%, #1a0000 100%);">
        <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 35%, rgba(200,150,0,0.15), transparent 60%);"></div>
        <!-- Marquee border -->
        ${marqueeBorder(80, 40, 1000, 500)}
        <!-- Marquee sign -->
        <div style="position:absolute;top:120px;left:80px;right:80px;background:linear-gradient(180deg, #2a0000, #1a0000);border:4px solid #FFD700;border-radius:16px;padding:50px 40px;text-align:center;z-index:5;">
          <p style="font-family:${SERIF};font-size:30px;color:#FFD700;margin:0 0 12px;letter-spacing:8px;">★ ★ ★ JACKPOT ★ ★ ★</p>
          <h1 style="font-family:${SERIF};font-size:90px;font-weight:700;color:white;margin:0;line-height:1;${S}">FREE<br/>PHOTO SHOOT</h1>
          <p style="font-family:${SANS};font-size:32px;color:#FFD700;margin:24px 0 0;letter-spacing:4px;">${location.toUpperCase()}</p>
        </div>
        <!-- Slot reel preview -->
        <div style="position:absolute;top:700px;left:100px;right:100px;display:flex;gap:20px;z-index:5;">
          ${[0, 1, 2].map(i => `
            <div style="flex:1;height:400px;background:#0a0a0a;border:3px solid #FFD700;border-radius:10px;overflow:hidden;">
              <img src="${slotPhotos[i]}" style="width:100%;height:100%;object-fit:cover;filter:saturate(1.1);"/>
            </div>
          `).join('\n')}
        </div>
        <div style="position:absolute;bottom:480px;left:50%;transform:translateX(-50%);z-index:5;">
          <div style="background:linear-gradient(180deg, #FFD700, #B8860B);border-radius:50%;width:120px;height:120px;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 30px rgba(255,215,0,0.3);">
            <span style="font-family:${SANS};font-size:20px;font-weight:900;color:#1a0000;text-align:center;line-height:1.1;">PULL<br/>HERE</span>
          </div>
        </div>
        ${filmGrain(0.1)}
      </div>
    `)
  }
}

function slotSlide2() {
  return {
    name: '02-proof',
    html: wrap(`
      <div style="position:absolute;inset:0;background:linear-gradient(180deg, #1a0000, #0d0000);">
        <div style="position:absolute;top:160px;left:50%;transform:translateX(-50%);text-align:center;z-index:5;">
          <h2 style="font-family:${SERIF};font-size:72px;font-weight:700;color:#FFD700;margin:0;${S}">JACKPOT</h2>
          <p style="font-family:${SANS};font-size:26px;color:rgba(255,215,0,0.6);margin:12px 0 0;letter-spacing:4px;">RECENT WINNERS</p>
        </div>
        <!-- Three slot windows -->
        <div style="position:absolute;top:380px;left:60px;right:60px;display:flex;gap:24px;z-index:5;">
          ${[0, 1, 2].map(i => `
            <div style="flex:1;background:#0a0a0a;border:4px solid #FFD700;border-radius:12px;overflow:hidden;box-shadow:0 0 20px rgba(255,215,0,0.15);">
              <img src="${slotPhotos[i]}" style="width:100%;height:440px;object-fit:cover;"/>
              <div style="padding:14px;text-align:center;background:linear-gradient(#1a0a00, #0d0500);">
                <span style="font-family:${MONO};font-size:20px;color:#FFD700;">★ ★ ★</span>
              </div>
            </div>
          `).join('\n')}
        </div>
        <!-- Bottom row -->
        <div style="position:absolute;top:920px;left:120px;right:120px;display:flex;gap:24px;z-index:5;">
          ${[3, 4].map(i => `
            <div style="flex:1;background:#0a0a0a;border:4px solid #B8860B;border-radius:12px;overflow:hidden;">
              <img src="${slotPhotos[i]}" style="width:100%;height:380px;object-fit:cover;"/>
              <div style="padding:12px;text-align:center;background:linear-gradient(#1a0a00, #0d0500);">
                <span style="font-family:${MONO};font-size:20px;color:#B8860B;">★ ★ ★</span>
              </div>
            </div>
          `).join('\n')}
        </div>
        <div style="position:absolute;bottom:380px;left:50%;transform:translateX(-50%);z-index:5;">
          <p style="font-family:${SANS};font-size:28px;color:rgba(255,215,0,0.5);">No experience needed</p>
        </div>
        ${filmGrain(0.1)}
      </div>
    `)
  }
}

function slotSlide3() {
  const combos = steps.map((s, i) => {
    const symbols = ['7️⃣ 7️⃣ 7️⃣', '🍒 🍒 🍒', '💎 💎 💎'][i]
    return `<div style="background:rgba(0,0,0,0.6);border:3px solid #FFD700;border-radius:12px;padding:28px 32px;display:flex;align-items:center;gap:24px;">
      <div style="background:#1a0a00;border:2px solid #B8860B;border-radius:8px;padding:12px 18px;flex-shrink:0;">
        <span style="font-size:36px;">${symbols}</span>
      </div>
      <div>
        <span style="font-family:${SANS};font-size:22px;color:#FFD700;letter-spacing:2px;">STEP ${i + 1}</span>
        <p style="font-family:${SANS};font-size:28px;color:white;margin:6px 0 0;line-height:1.3;">${s}</p>
      </div>
    </div>`
  }).join('\n')
  return {
    name: '03-how',
    html: wrap(`
      <div style="position:absolute;inset:0;background:linear-gradient(180deg, #1a0000, #0d0000);">
        <div style="position:absolute;top:200px;left:64px;right:64px;z-index:5;">
          <h2 style="font-family:${SERIF};font-size:58px;font-weight:700;color:#FFD700;margin:0 0 16px;">How to Win</h2>
          <div style="width:100px;height:4px;background:#FFD700;margin-bottom:50px;"></div>
          <div style="display:flex;flex-direction:column;gap:28px;">
            ${combos}
          </div>
          <p style="font-family:${SANS};font-size:28px;color:rgba(255,215,0,0.5);margin:44px 0 0;">Every spin is a winner.</p>
        </div>
        ${filmGrain(0.1)}
      </div>
    `)
  }
}

function slotSlide4() {
  const items = deliverables.map(d =>
    `<div style="display:flex;align-items:flex-start;gap:18px;margin-bottom:26px;">
      <span style="font-family:${SANS};font-size:28px;color:#FFD700;flex-shrink:0;">★</span>
      <span style="font-family:${SANS};font-size:30px;color:rgba(255,255,255,0.9);line-height:1.4;">${d}</span>
    </div>`
  ).join('\n')
  return {
    name: '04-what',
    html: wrap(`
      <div style="position:absolute;inset:0;background:linear-gradient(180deg, #1a0000, #0d0000);">
        <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 50%, rgba(200,150,0,0.08), transparent 60%);"></div>
        <div style="position:absolute;top:200px;left:64px;right:64px;z-index:5;">
          <h2 style="font-family:${SERIF};font-size:60px;font-weight:700;color:#FFD700;margin:0 0 16px;">Your Payout</h2>
          <div style="width:100px;height:4px;background:#FFD700;margin-bottom:50px;"></div>
          <div style="font-family:${SANS};">${items}</div>
          <div style="margin-top:40px;background:linear-gradient(135deg, #FFD700, #B8860B);border-radius:10px;padding:24px 36px;display:inline-block;">
            <span style="font-family:${SERIF};font-size:38px;font-weight:700;color:#1a0000;">COST: $0</span>
          </div>
        </div>
        ${filmGrain(0.1)}
      </div>
    `)
  }
}

function slotSlide5(location) {
  return {
    name: '05-cta',
    html: wrap(`
      <div style="position:absolute;inset:0;background:linear-gradient(180deg, #1a0000, #0d0000);">
        ${marqueeBorder(100, 60, 960, 1700)}
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;z-index:5;width:800px;">
          <p style="font-family:${SERIF};font-size:30px;color:#FFD700;margin:0 0 20px;letter-spacing:6px;">★ ${location.toUpperCase()} ★</p>
          <h2 style="font-family:${SERIF};font-size:80px;font-weight:700;color:white;margin:0 0 20px;line-height:1;${S}">PULL THE<br/>LEVER</h2>
          <div style="width:200px;height:3px;background:#FFD700;margin:0 auto 30px;"></div>
          <p style="font-family:${SANS};font-size:44px;color:#FFD700;margin:0 0 16px;font-weight:600;">DM @madebyaidan</p>
          <p style="font-family:${SANS};font-size:28px;color:rgba(255,215,0,0.5);margin:0;">Free Photo Shoot</p>
          <!-- Lever -->
          <div style="margin-top:50px;display:inline-block;">
            <div style="width:8px;height:100px;background:linear-gradient(#C0C0C0, #808080);margin:0 auto;border-radius:4px;"></div>
            <div style="width:50px;height:50px;background:linear-gradient(135deg, #FF0000, #AA0000);border-radius:50%;margin:-4px auto 0;border:3px solid #FFD700;"></div>
          </div>
        </div>
        ${filmGrain(0.1)}
      </div>
    `)
  }
}

// ═══════════════════════════════════════════════════════════════
// THEME 4: BTS / CONTACT SHEET
// ═══════════════════════════════════════════════════════════════

function filmPerfs(side = 'left') {
  const perfs = []
  for (let y = 0; y < 1920; y += 60) {
    const x = side === 'left' ? 10 : 1050
    perfs.push(`<div style="position:absolute;left:${x}px;top:${y}px;width:20px;height:30px;background:#222;border-radius:3px;"></div>`)
  }
  return perfs.join('\n')
}

function btsSlide1(location) {
  // Contact sheet grid of small thumbnails
  const thumbs = btsPhotos.slice(0, 12)
  const cols = 4
  const thumbW = 220
  const thumbH = 165
  const gap = 12
  const startX = 60
  const startY = 440
  const grid = thumbs.map((p, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    const x = startX + col * (thumbW + gap)
    const y = startY + row * (thumbH + gap)
    return `<div style="position:absolute;left:${x}px;top:${y}px;width:${thumbW}px;height:${thumbH}px;border:2px solid rgba(255,255,255,0.15);overflow:hidden;">
      <img src="${p}" style="width:100%;height:100%;object-fit:cover;filter:saturate(0.7) contrast(1.05);"/>
      <div style="position:absolute;bottom:4px;left:6px;font-family:${MONO};font-size:12px;color:rgba(255,255,255,0.4);">${String(i + 1).padStart(2, '0')}</div>
    </div>`
  }).join('\n')
  return {
    name: '01-hook',
    html: wrap(`
      <div style="position:absolute;inset:0;background:#111111;">
        ${filmPerfs('left')}
        ${filmPerfs('right')}
        <div style="position:absolute;top:160px;left:64px;right:64px;z-index:5;">
          <p style="font-family:${MONO};font-size:22px;color:rgba(255,255,255,0.4);letter-spacing:4px;margin:0 0 12px;">KODAK SAFETY FILM 5063</p>
          <h1 style="font-family:${SERIF};font-size:72px;font-weight:700;color:white;margin:0;line-height:1.05;${S}">BEHIND<br/>THE SCENES</h1>
          <p style="font-family:${SANS};font-size:30px;color:rgba(255,255,255,0.5);margin:18px 0 0;">${location} — Free Photo Shoot</p>
        </div>
        ${grid}
        <div style="position:absolute;bottom:380px;left:64px;right:64px;text-align:center;z-index:5;">
          <p style="font-family:${MONO};font-size:22px;color:rgba(255,255,255,0.3);">CONTACT SHEET — ${location.toUpperCase()} 2026</p>
        </div>
        ${filmGrain(0.12)}
      </div>
    `)
  }
}

function btsSlide2() {
  // Lightbox grid with red grease pencil circles on "selects"
  const photos = btsPhotos.slice(0, 8)
  const selectIndices = [1, 3, 5] // photos with red circles
  const cols = 2
  const w = 440
  const h = 340
  const gap = 20
  const startX = 60
  const startY = 380
  const grid = photos.map((p, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    const x = startX + col * (w + gap)
    const y = startY + row * (h + gap)
    const isSelect = selectIndices.includes(i)
    return `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;background:#1a1a1a;overflow:hidden;">
      <img src="${p}" style="width:100%;height:100%;object-fit:cover;"/>
      ${isSelect ? `<div style="position:absolute;inset:10px;border:4px solid #cc3333;border-radius:50%;opacity:0.7;"></div>
      <div style="position:absolute;top:8px;right:12px;font-family:${MONO};font-size:18px;color:#cc3333;font-weight:700;">SELECT</div>` : ''}
      <div style="position:absolute;bottom:6px;left:8px;font-family:${MONO};font-size:14px;color:rgba(255,255,255,0.4);">FR ${String(i + 1).padStart(2, '0')}</div>
    </div>`
  }).join('\n')
  return {
    name: '02-proof',
    html: wrap(`
      <div style="position:absolute;inset:0;background:#111111;">
        ${filmPerfs('left')}
        ${filmPerfs('right')}
        <div style="position:absolute;top:180px;left:64px;right:64px;z-index:5;">
          <h2 style="font-family:${SERIF};font-size:56px;font-weight:700;color:white;margin:0;${S}">Selects</h2>
          <p style="font-family:${MONO};font-size:24px;color:rgba(255,255,255,0.4);margin:12px 0 0;">LIGHTBOX VIEW — RECENT WORK</p>
        </div>
        ${grid}
        ${filmGrain(0.12)}
      </div>
    `)
  }
}

function btsSlide3() {
  const frames = steps.map((s, i) =>
    `<div style="background:#1a1a1a;border:3px solid rgba(255,255,255,0.15);border-radius:4px;padding:30px 32px;display:flex;align-items:flex-start;gap:22px;">
      <div style="flex-shrink:0;width:60px;height:60px;background:#222;border:2px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;">
        <span style="font-family:${MONO};font-size:28px;color:rgba(255,255,255,0.6);">${String(i + 1).padStart(2, '0')}</span>
      </div>
      <div style="padding-top:8px;">
        <p style="font-family:${MONO};font-size:18px;color:rgba(255,255,255,0.4);margin:0 0 6px;">FRAME ${String(i + 1).padStart(2, '0')}</p>
        <p style="font-family:${SANS};font-size:30px;color:rgba(255,255,255,0.85);margin:0;line-height:1.35;">${s}</p>
      </div>
    </div>`
  ).join('\n')
  return {
    name: '03-how',
    html: wrap(`
      <div style="position:absolute;inset:0;background:#111111;">
        ${filmPerfs('left')}
        ${filmPerfs('right')}
        <div style="position:absolute;top:200px;left:64px;right:64px;z-index:5;">
          <h2 style="font-family:${SERIF};font-size:56px;font-weight:700;color:white;margin:0 0 12px;${S}">The Process</h2>
          <p style="font-family:${MONO};font-size:22px;color:rgba(255,255,255,0.35);margin:0 0 50px;">EXPOSURE SEQUENCE</p>
          <div style="display:flex;flex-direction:column;gap:28px;">
            ${frames}
          </div>
          <p style="font-family:${SANS};font-size:28px;color:rgba(255,255,255,0.5);margin:44px 0 0;">No experience needed. I direct everything.</p>
        </div>
        ${filmGrain(0.12)}
      </div>
    `)
  }
}

function btsSlide4() {
  const notes = deliverables.map(d =>
    `<div style="display:flex;align-items:flex-start;gap:14px;margin-bottom:22px;">
      <span style="font-family:${SERIF};font-size:28px;color:rgba(255,255,255,0.4);flex-shrink:0;font-style:italic;">→</span>
      <span style="font-family:${SERIF};font-size:30px;color:rgba(255,255,255,0.8);line-height:1.4;font-style:italic;">${d}</span>
    </div>`
  ).join('\n')
  return {
    name: '04-what',
    html: wrap(`
      <div style="position:absolute;inset:0;background:#111111;">
        ${filmPerfs('left')}
        ${filmPerfs('right')}
        <div style="position:absolute;top:200px;left:80px;right:80px;z-index:5;">
          <p style="font-family:${MONO};font-size:20px;color:rgba(255,255,255,0.3);margin:0 0 12px;">PHOTOGRAPHER'S NOTES</p>
          <h2 style="font-family:${SERIF};font-size:56px;font-weight:700;color:white;margin:0 0 50px;font-style:italic;${S}">What You Get</h2>
          <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.1);border-radius:4px;padding:36px 32px;">
            ${notes}
          </div>
          <div style="margin-top:36px;padding:20px 28px;border:2px solid rgba(255,255,255,0.2);display:inline-block;">
            <span style="font-family:${SERIF};font-size:34px;color:white;font-style:italic;">Completely free.</span>
          </div>
        </div>
        ${filmGrain(0.12)}
      </div>
    `)
  }
}

function btsSlide5(location) {
  return {
    name: '05-cta',
    html: wrap(`
      <div style="position:absolute;inset:0;background:#111111;">
        ${filmPerfs('left')}
        ${filmPerfs('right')}
        <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 45%, rgba(40,40,40,0.5), transparent 60%);"></div>
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;z-index:5;width:800px;">
          <!-- Film frame border -->
          <div style="border:4px solid rgba(255,255,255,0.2);padding:60px 40px;">
            <p style="font-family:${MONO};font-size:20px;color:rgba(255,255,255,0.3);margin:0 0 24px;letter-spacing:4px;">${location.toUpperCase()} 2026</p>
            <h2 style="font-family:${SERIF};font-size:64px;font-weight:700;color:white;margin:0 0 20px;line-height:1.1;${S}">BOOK YOUR<br/>SESSION</h2>
            <div style="width:160px;height:2px;background:rgba(255,255,255,0.2);margin:0 auto 28px;"></div>
            <p style="font-family:${SANS};font-size:42px;color:white;margin:0 0 12px;font-weight:600;">DM @madebyaidan</p>
            <p style="font-family:${SANS};font-size:26px;color:rgba(255,255,255,0.45);margin:0;">Free Photo Shoot</p>
          </div>
          <div style="margin-top:20px;">
            <p style="font-family:${MONO};font-size:18px;color:rgba(255,255,255,0.25);">KODAK 5063 — EXPOSED</p>
          </div>
        </div>
        ${filmGrain(0.12)}
      </div>
    `)
  }
}

// ═══════════════════════════════════════════════════════════════
// THEME 5: TETRIS
// ═══════════════════════════════════════════════════════════════

const tetrisColors = ['#00f0f0', '#f0f000', '#a000f0', '#00f000', '#f00000', '#f0a000', '#0000f0']

function tetrisGrid() {
  return `<div style="position:absolute;inset:0;pointer-events:none;background:
    repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 54px),
    repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 54px);"></div>`
}

function tetrisBlock(x, y, w, h, color) {
  return `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;background:${color};border:3px solid rgba(255,255,255,0.3);box-shadow:inset 2px 2px 0 rgba(255,255,255,0.2), inset -2px -2px 0 rgba(0,0,0,0.2);"></div>`
}

function pixelText(text, size, color) {
  return `<span style="font-family:${MONO};font-size:${size}px;font-weight:700;color:${color};letter-spacing:3px;text-transform:uppercase;">${text}</span>`
}

function tetrisSlide1(location) {
  // Build "FREE" and "PHOTO SHOOT" from blocks
  return {
    name: '01-hook',
    html: wrap(`
      <div style="position:absolute;inset:0;background:#0a0a1a;">
        ${tetrisGrid()}
        <!-- Score display -->
        <div style="position:absolute;top:60px;right:60px;text-align:right;z-index:5;">
          <p style="font-family:${MONO};font-size:20px;color:rgba(255,255,255,0.4);margin:0;">SCORE</p>
          <p style="font-family:${MONO};font-size:36px;color:white;margin:4px 0 0;font-weight:700;">000000</p>
        </div>
        <div style="position:absolute;top:60px;left:60px;z-index:5;">
          <p style="font-family:${MONO};font-size:20px;color:rgba(255,255,255,0.4);margin:0;">LEVEL</p>
          <p style="font-family:${MONO};font-size:36px;color:${tetrisColors[0]};margin:4px 0 0;font-weight:700;">01</p>
        </div>
        <!-- Main text built from blocks -->
        <div style="position:absolute;top:300px;left:50%;transform:translateX(-50%);text-align:center;z-index:5;width:900px;">
          <!-- Block letters effect -->
          <div style="position:relative;margin-bottom:20px;">
            ${tetrisBlock(-20, -10, 940, 160, 'rgba(0,240,240,0.15)')}
            <h1 style="font-family:${MONO};font-size:120px;font-weight:900;color:#00f0f0;margin:0;letter-spacing:12px;position:relative;text-shadow:4px 4px 0 rgba(0,0,0,0.5), 0 0 30px rgba(0,240,240,0.3);">FREE</h1>
          </div>
          <div style="position:relative;margin-bottom:20px;">
            ${tetrisBlock(-20, -10, 940, 160, 'rgba(240,240,0,0.1)')}
            <h1 style="font-family:${MONO};font-size:100px;font-weight:900;color:#f0f000;margin:0;letter-spacing:8px;position:relative;text-shadow:4px 4px 0 rgba(0,0,0,0.5), 0 0 30px rgba(240,240,0,0.3);">PHOTO</h1>
          </div>
          <div style="position:relative;">
            ${tetrisBlock(-20, -10, 940, 160, 'rgba(160,0,240,0.1)')}
            <h1 style="font-family:${MONO};font-size:100px;font-weight:900;color:#a000f0;margin:0;letter-spacing:8px;position:relative;text-shadow:4px 4px 0 rgba(0,0,0,0.5), 0 0 30px rgba(160,0,240,0.3);">SHOOT</h1>
          </div>
        </div>
        <!-- Falling pieces decoration -->
        ${tetrisBlock(80, 950, 54, 54, tetrisColors[0])}
        ${tetrisBlock(134, 950, 54, 54, tetrisColors[0])}
        ${tetrisBlock(188, 950, 54, 54, tetrisColors[0])}
        ${tetrisBlock(134, 896, 54, 54, tetrisColors[0])}
        ${tetrisBlock(800, 1050, 54, 108, tetrisColors[3])}
        ${tetrisBlock(854, 1050, 54, 108, tetrisColors[3])}
        ${tetrisBlock(600, 1150, 54, 54, tetrisColors[1])}
        ${tetrisBlock(654, 1150, 54, 54, tetrisColors[1])}
        ${tetrisBlock(600, 1204, 54, 54, tetrisColors[1])}
        ${tetrisBlock(654, 1204, 54, 54, tetrisColors[1])}
        <!-- Location -->
        <div style="position:absolute;bottom:460px;left:50%;transform:translateX(-50%);z-index:5;text-align:center;">
          <p style="font-family:${MONO};font-size:36px;color:rgba(255,255,255,0.6);letter-spacing:8px;">${location.toUpperCase()}</p>
        </div>
        ${filmGrain(0.08)}
      </div>
    `)
  }
}

function tetrisSlide2() {
  // Photos arranged as Tetris pieces
  const pieces = [
    { x: 60,  y: 360, w: 300, h: 420, rot: -3, ci: 0 },
    { x: 400, y: 320, w: 260, h: 380, rot: 2,  ci: 1 },
    { x: 700, y: 380, w: 280, h: 400, rot: -1, ci: 2 },
    { x: 120, y: 820, w: 340, h: 260, rot: 1.5, ci: 3 },
    { x: 520, y: 840, w: 320, h: 280, rot: -2, ci: 4 },
    { x: 200, y: 1140, w: 280, h: 380, rot: 2.5, ci: 5 },
    { x: 540, y: 1160, w: 300, h: 360, rot: -1.5, ci: 6 },
  ]
  const photoElements = pieces.map((p, i) => {
    const color = tetrisColors[i % tetrisColors.length]
    return `<div style="position:absolute;left:${p.x}px;top:${p.y}px;width:${p.w}px;height:${p.h}px;transform:rotate(${p.rot}deg);border:4px solid ${color};overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.4);">
      <img src="${tetrisPhotos[p.ci]}" style="width:100%;height:100%;object-fit:cover;"/>
    </div>`
  }).join('\n')
  return {
    name: '02-proof',
    html: wrap(`
      <div style="position:absolute;inset:0;background:#0a0a1a;">
        ${tetrisGrid()}
        <div style="position:absolute;top:180px;left:50%;transform:translateX(-50%);text-align:center;z-index:10;">
          <h2 style="font-family:${MONO};font-size:52px;font-weight:700;color:white;margin:0;letter-spacing:4px;text-shadow:0 4px 20px rgba(0,0,0,0.8);">RECENT WORK</h2>
          <p style="font-family:${MONO};font-size:24px;color:rgba(255,255,255,0.4);margin:10px 0 0;letter-spacing:2px;">NO EXPERIENCE NEEDED</p>
        </div>
        ${photoElements}
        ${filmGrain(0.08)}
      </div>
    `)
  }
}

function tetrisSlide3() {
  const levels = steps.map((s, i) => {
    const color = tetrisColors[i]
    return `<div style="background:rgba(255,255,255,0.04);border:3px solid ${color};border-radius:4px;padding:30px 32px;display:flex;align-items:flex-start;gap:22px;">
      <div style="flex-shrink:0;background:${color};padding:10px 18px;border-radius:2px;">
        <span style="font-family:${MONO};font-size:22px;font-weight:900;color:#0a0a1a;">LVL ${i + 1}</span>
      </div>
      <div style="padding-top:4px;">
        <p style="font-family:${MONO};font-size:30px;color:white;margin:0;line-height:1.35;">${s}</p>
      </div>
    </div>`
  }).join('\n')
  return {
    name: '03-how',
    html: wrap(`
      <div style="position:absolute;inset:0;background:#0a0a1a;">
        ${tetrisGrid()}
        <div style="position:absolute;top:200px;left:64px;right:64px;z-index:5;">
          <div style="display:flex;align-items:center;gap:16px;margin-bottom:16px;">
            ${pixelText('HOW TO PLAY', 44, '#00f0f0')}
          </div>
          <div style="width:100px;height:4px;background:#00f0f0;margin-bottom:50px;"></div>
          <div style="display:flex;flex-direction:column;gap:28px;">
            ${levels}
          </div>
          <p style="font-family:${MONO};font-size:26px;color:rgba(255,255,255,0.4);margin:44px 0 0;">DIFFICULTY: EASY</p>
        </div>
        ${filmGrain(0.08)}
      </div>
    `)
  }
}

function tetrisSlide4() {
  const powerups = deliverables.map((d, i) => {
    const color = tetrisColors[i % tetrisColors.length]
    const icons = ['📷', '✨', '👔', '💬']
    return `<div style="display:flex;align-items:flex-start;gap:20px;margin-bottom:26px;">
      <div style="flex-shrink:0;width:50px;height:50px;background:${color};display:flex;align-items:center;justify-content:center;border:2px solid rgba(255,255,255,0.2);">
        <span style="font-size:24px;">${icons[i]}</span>
      </div>
      <div style="padding-top:6px;">
        <p style="font-family:${MONO};font-size:16px;color:${color};margin:0 0 4px;">ITEM ${String(i + 1).padStart(2, '0')}</p>
        <p style="font-family:${SANS};font-size:28px;color:rgba(255,255,255,0.85);margin:0;line-height:1.35;">${d}</p>
      </div>
    </div>`
  }).join('\n')
  return {
    name: '04-what',
    html: wrap(`
      <div style="position:absolute;inset:0;background:#0a0a1a;">
        ${tetrisGrid()}
        <div style="position:absolute;top:200px;left:64px;right:64px;z-index:5;">
          ${pixelText('INVENTORY', 48, '#f0f000')}
          <div style="width:100px;height:4px;background:#f0f000;margin:16px 0 50px;"></div>
          ${powerups}
          <div style="margin-top:36px;background:rgba(0,240,0,0.15);border:3px solid #00f000;padding:20px 28px;display:inline-block;">
            <span style="font-family:${MONO};font-size:32px;font-weight:700;color:#00f000;">COST: 0 COINS</span>
          </div>
        </div>
        ${filmGrain(0.08)}
      </div>
    `)
  }
}

function tetrisSlide5(location) {
  return {
    name: '05-cta',
    html: wrap(`
      <div style="position:absolute;inset:0;background:#0a0a1a;">
        ${tetrisGrid()}
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;z-index:5;width:800px;">
          <!-- Blinking "INSERT COIN" -->
          <p style="font-family:${MONO};font-size:28px;color:rgba(255,255,255,0.4);letter-spacing:6px;margin:0 0 40px;">${location.toUpperCase()}</p>
          <h2 style="font-family:${MONO};font-size:80px;font-weight:900;color:#00f0f0;margin:0 0 20px;letter-spacing:4px;text-shadow:0 0 30px rgba(0,240,240,0.4);">PRESS<br/>START</h2>
          <div style="width:200px;height:4px;background:rgba(0,240,240,0.3);margin:0 auto 30px;"></div>
          <p style="font-family:${MONO};font-size:42px;color:#f0f000;margin:0 0 16px;font-weight:700;">DM @madebyaidan</p>
          <p style="font-family:${MONO};font-size:26px;color:rgba(255,255,255,0.4);margin:0 0 50px;">FREE PHOTO SHOOT</p>
          <!-- Start button -->
          <div style="display:inline-block;background:linear-gradient(180deg, #f00000, #aa0000);border:4px solid rgba(255,255,255,0.3);border-radius:8px;padding:18px 60px;">
            <span style="font-family:${MONO};font-size:28px;font-weight:900;color:white;letter-spacing:4px;">START</span>
          </div>
        </div>
        <!-- Decorative blocks at bottom -->
        ${tetrisBlock(0, 1810, 1080, 110, tetrisColors[4])}
        ${tetrisBlock(0, 1756, 540, 54, tetrisColors[5])}
        ${tetrisBlock(540, 1756, 270, 54, tetrisColors[2])}
        ${tetrisBlock(810, 1702, 270, 108, tetrisColors[0])}
        ${filmGrain(0.08)}
      </div>
    `)
  }
}

// ═══════════════════════════════════════════════════════════════
// RENDER
// ═══════════════════════════════════════════════════════════════

const themes = [
  {
    slug: 'vhs',
    slides: (loc) => [vhsSlide1(loc), vhsSlide2(), vhsSlide3(), vhsSlide4(), vhsSlide5(loc)]
  },
  {
    slug: 'photo-booth',
    slides: (loc) => [boothSlide1(loc), boothSlide2(), boothSlide3(), boothSlide4(), boothSlide5(loc)]
  },
  {
    slug: 'slot-machine',
    slides: (loc) => [slotSlide1(loc), slotSlide2(), slotSlide3(), slotSlide4(), slotSlide5(loc)]
  },
  {
    slug: 'bts-contact-sheet',
    slides: (loc) => [btsSlide1(loc), btsSlide2(), btsSlide3(), btsSlide4(), btsSlide5(loc)]
  },
  {
    slug: 'tetris',
    slides: (loc) => [tetrisSlide1(loc), tetrisSlide2(), tetrisSlide3(), tetrisSlide4(), tetrisSlide5(loc)]
  }
]

async function render() {
  // Create all output directories
  for (const theme of themes) {
    for (const loc of locations) {
      fs.mkdirSync(path.join(OUT, theme.slug, loc.toLowerCase()), { recursive: true })
    }
  }

  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 })

  let total = 0
  for (const theme of themes) {
    for (const loc of locations) {
      const slides = theme.slides(loc)
      const dir = path.join(OUT, theme.slug, loc.toLowerCase())
      for (const slide of slides) {
        const page = await context.newPage()
        await page.setContent(`<!doctype html><html><head><style>
          * { box-sizing: border-box; }
          html, body { margin: 0; width: 1080px; height: 1920px; background: #000; overflow: hidden; }
          body { -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; }
        </style></head><body>${slide.html}</body></html>`, { waitUntil: 'load' })
        await page.waitForTimeout(500)
        const outPath = path.join(dir, `${slide.name}.png`)
        await page.screenshot({ path: outPath, type: 'png' })
        await page.close()
        total++
        console.log(`OK  ${theme.slug}/${loc.toLowerCase()}/${slide.name}`)
      }
    }
  }

  await browser.close()
  console.log(`\nDone — ${total} slides rendered to ${OUT}`)
}

render()
