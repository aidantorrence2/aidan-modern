import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, 'output')
const IMG_DIR = '/Users/aidantorrence/Documents/aidan-modern/public/images/large'

// ── Image loader ──

function img(filename) {
  const buf = fs.readFileSync(path.join(IMG_DIR, filename))
  return `data:image/jpeg;base64,${buf.toString('base64')}`
}

// ── Load all photos ──

const photos = {
  dsc0075: img('manila-gallery-dsc-0075.jpg'),
  dsc0130: img('manila-gallery-dsc-0130.jpg'),
  dsc0190: img('manila-gallery-dsc-0190.jpg'),
  dsc0911: img('manila-gallery-dsc-0911.jpg'),
  night1:  img('manila-gallery-night-001.jpg'),
  night3:  img('manila-gallery-night-003.jpg'),
  market:  img('manila-gallery-market-001.jpg'),
  urban3:  img('manila-gallery-urban-003.jpg'),
  garden1: img('manila-gallery-garden-001.jpg'),
  garden2: img('manila-gallery-garden-002.jpg'),
  canal1:  img('manila-gallery-canal-001.jpg'),
  canal2:  img('manila-gallery-canal-002.jpg'),
  ivy1:    img('manila-gallery-ivy-001.jpg'),
  ivy2:    img('manila-gallery-ivy-002.jpg'),
  park:    img('manila-gallery-park-001.jpg'),
  statue:  img('manila-gallery-statue-001.jpg'),
  street:  img('manila-gallery-street-001.jpg'),
  closeup: img('manila-gallery-closeup-001.jpg'),
  shadow:  img('manila-gallery-shadow-001.jpg'),
  rocks:   img('manila-gallery-rocks-001.jpg'),
  floor:   img('manila-gallery-floor-001.jpg'),
  tropical:img('manila-gallery-tropical-001.jpg'),
}

// Best photos for hero/impact use
const heroPhotos = [photos.dsc0075, photos.dsc0130, photos.dsc0190, photos.dsc0911, photos.night1, photos.night3]
const proofPhotos = [photos.garden1, photos.canal1, photos.ivy1, photos.park, photos.market, photos.urban3, photos.statue, photos.street, photos.closeup]
const bgPhotos = [photos.shadow, photos.rocks, photos.tropical, photos.garden2, photos.canal2, photos.ivy2, photos.floor]

const LOCATIONS = [
  { slug: 'manila', name: 'Manila', upper: 'MANILA' },
  { slug: 'antipolo', name: 'Antipolo', upper: 'ANTIPOLO' },
  { slug: 'subic', name: 'Subic', upper: 'SUBIC' },
]

// ── Common CSS reset ──

const RESET_CSS = `
  * { margin:0; padding:0; box-sizing:border-box; }
  body { width:1080px; height:1920px; overflow:hidden; }
  img { display:block; }
`

// ── Shared text shadow for readability ──

const HEAVY_SHADOW = '4px 4px 20px rgba(0,0,0,0.9), 0 0 40px rgba(0,0,0,0.7), 0 0 80px rgba(0,0,0,0.5)'

// ═══════════════════════════════════════════════════════════════
// THEME 1: VHS
// ═══════════════════════════════════════════════════════════════

function vhsScanlines() {
  return `
    <div style="position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;
      background:repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 2px, transparent 2px, transparent 4px);
      z-index:10;"></div>
  `
}

function vhsRec() {
  return `<div style="position:absolute;top:40px;left:40px;z-index:20;display:flex;align-items:center;gap:12px;">
    <div style="width:24px;height:24px;border-radius:50%;background:#ff0000;box-shadow:0 0 20px #ff0000;"></div>
    <span style="font-family:'Courier New',monospace;font-size:36px;color:#ff0000;font-weight:bold;text-shadow:2px 2px 8px rgba(0,0,0,0.8);">REC</span>
  </div>`
}

function vhsTimestamp(text) {
  return `<div style="position:absolute;top:40px;right:40px;z-index:20;font-family:'Courier New',monospace;font-size:30px;color:#fff;text-shadow:2px 2px 8px rgba(0,0,0,0.9);opacity:0.9;">${text}</div>`
}

function vhsFooterBadge(city) {
  return `<div style="position:absolute;bottom:60px;left:0;width:100%;z-index:20;text-align:center;">
    <span style="background:rgba(0,0,0,0.7);padding:12px 40px;font-family:'Courier New',monospace;font-size:32px;color:#0f0;letter-spacing:3px;border:2px solid #0f0;">FREE SHOOT &bull; ${city}</span>
  </div>`
}

function vhsTheme(loc) {
  const city = loc.upper
  return [
    // Slide 1: Hook
    `<html><head><style>${RESET_CSS}</style></head><body style="background:#000;">
      <div style="position:relative;width:1080px;height:1920px;">
        <img src="${heroPhotos[0]}" style="width:100%;height:100%;object-fit:cover;filter:saturate(0.8) contrast(1.1);">
        <div style="position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.6) 100%);"></div>
        ${vhsScanlines()}
        ${vhsRec()}
        ${vhsTimestamp('2026.03.18  14:32:07')}
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:20;text-align:center;width:90%;">
          <div style="font-family:'Courier New',monospace;font-size:120px;font-weight:900;color:#fff;text-shadow:${HEAVY_SHADOW};line-height:1.1;letter-spacing:-2px;">FREE<br>PHOTO<br>SHOOT</div>
          <div style="font-family:'Courier New',monospace;font-size:70px;color:#0f0;margin-top:30px;text-shadow:${HEAVY_SHADOW};letter-spacing:8px;">${city} 2026</div>
        </div>
      </div>
    </body></html>`,

    // Slide 2: Proof - 3 stacked photos
    `<html><head><style>${RESET_CSS}</style></head><body style="background:#0a0a0a;">
      <div style="position:relative;width:1080px;height:1920px;">
        <div style="position:absolute;top:0;left:0;width:100%;padding:30px 40px;z-index:20;background:rgba(0,0,0,0.8);">
          <span style="font-family:'Courier New',monospace;font-size:60px;color:#0f0;letter-spacing:6px;">RECENT FOOTAGE</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;padding:120px 20px 140px 20px;height:100%;">
          ${[heroPhotos[1], heroPhotos[2], heroPhotos[3]].map((p, i) => `
            <div style="flex:1;position:relative;overflow:hidden;">
              <img src="${p}" style="width:100%;height:100%;object-fit:cover;filter:saturate(0.8);">
              <div style="position:absolute;bottom:12px;left:16px;font-family:'Courier New',monospace;font-size:24px;color:#0f0;text-shadow:2px 2px 6px rgba(0,0,0,0.9);">PLAY ${String(i+1).padStart(2,'0')}:${String(14+i*3).padStart(2,'0')}:${String(22+i*17).padStart(2,'0')}</div>
            </div>
          `).join('')}
        </div>
        ${vhsScanlines()}
        ${vhsFooterBadge(city)}
      </div>
    </body></html>`,

    // Slide 3: How it works
    `<html><head><style>${RESET_CSS}</style></head><body style="background:#000;">
      <div style="position:relative;width:1080px;height:1920px;">
        <img src="${bgPhotos[0]}" style="width:100%;height:100%;object-fit:cover;filter:saturate(0.6) brightness(0.35);">
        <div style="position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.55);"></div>
        ${vhsScanlines()}
        ${vhsRec()}
        <div style="position:absolute;top:0;left:0;width:100%;height:100%;display:flex;flex-direction:column;justify-content:center;padding:0 60px;z-index:20;">
          <div style="font-family:'Courier New',monospace;font-size:100px;color:#0f0;font-weight:bold;letter-spacing:4px;text-shadow:0 0 30px rgba(0,255,0,0.5);margin-bottom:100px;">HOW IT<br>WORKS</div>
          <div style="display:flex;flex-direction:column;gap:80px;">
            ${[
              ['01', 'DM @madebyaidan on Instagram'],
              ['02', 'We pick a date & location'],
              ['03', 'Show up — get your photos free'],
            ].map(([num, text]) => `
              <div style="display:flex;align-items:flex-start;gap:30px;">
                <div style="font-family:'Courier New',monospace;font-size:100px;color:#0f0;font-weight:bold;text-shadow:0 0 20px rgba(0,255,0,0.4);line-height:1;">${num}</div>
                <div style="font-family:'Courier New',monospace;font-size:50px;color:#eee;line-height:1.3;padding-top:16px;text-shadow:${HEAVY_SHADOW};">${text}</div>
              </div>
            `).join('')}
          </div>
        </div>
        <!-- VHS tracking lines -->
        <div style="position:absolute;top:1500px;left:0;width:100%;height:6px;background:rgba(0,255,0,0.2);z-index:20;"></div>
        <div style="position:absolute;top:1520px;left:0;width:70%;height:3px;background:rgba(0,255,0,0.15);z-index:20;"></div>
        <div style="position:absolute;top:1540px;left:20%;width:60%;height:4px;background:rgba(0,255,0,0.1);z-index:20;"></div>
        <div style="position:absolute;bottom:80px;left:0;width:100%;text-align:center;z-index:20;">
          <span style="font-family:'Courier New',monospace;font-size:40px;color:#0f0;letter-spacing:4px;text-shadow:0 0 20px rgba(0,255,0,0.4);">FREE PHOTO SHOOT &bull; ${city}</span>
        </div>
      </div>
    </body></html>`,

    // Slide 4: What you get
    `<html><head><style>${RESET_CSS}</style></head><body style="background:#000;">
      <div style="position:relative;width:1080px;height:1920px;">
        <img src="${heroPhotos[4]}" style="width:100%;height:100%;object-fit:cover;filter:saturate(0.7) brightness(0.45);">
        <div style="position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.45);"></div>
        ${vhsScanlines()}
        ${vhsRec()}
        <div style="position:absolute;top:0;left:0;width:100%;height:100%;display:flex;flex-direction:column;justify-content:center;padding:0 60px;z-index:20;">
          <div style="font-family:'Courier New',monospace;font-size:100px;color:#fff;font-weight:bold;text-shadow:${HEAVY_SHADOW};margin-bottom:80px;letter-spacing:2px;">WHAT<br>YOU GET</div>
          ${[
            '30-minute session',
            '15+ edited photos',
            'All digital files',
            'Use anywhere you want',
            '100% free, no catch',
          ].map(item => `
            <div style="font-family:'Courier New',monospace;font-size:50px;color:#fff;margin-bottom:50px;text-shadow:${HEAVY_SHADOW};display:flex;align-items:center;gap:20px;">
              <span style="color:#0f0;font-size:44px;">&#9654;</span> ${item}
            </div>
          `).join('')}
        </div>
        <div style="position:absolute;bottom:80px;left:0;width:100%;text-align:center;z-index:20;">
          <span style="font-family:'Courier New',monospace;font-size:36px;color:#0f0;letter-spacing:4px;">FREE &bull; ${city} &bull; 2026</span>
        </div>
      </div>
    </body></html>`,

    // Slide 5: CTA
    `<html><head><style>${RESET_CSS}</style></head><body style="background:#000;">
      <div style="position:relative;width:1080px;height:1920px;">
        <img src="${heroPhotos[5]}" style="width:100%;height:100%;object-fit:cover;filter:saturate(0.7);">
        <div style="position:absolute;top:0;left:0;width:100%;height:100%;background:radial-gradient(ellipse at center, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.85) 100%);"></div>
        ${vhsScanlines()}
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:20;text-align:center;width:90%;">
          <div style="font-family:'Courier New',monospace;font-size:40px;color:#0f0;margin-bottom:30px;letter-spacing:6px;">&#9632; STOP &nbsp; &#9654; PLAY</div>
          <div style="font-family:'Courier New',monospace;font-size:90px;font-weight:900;color:#fff;text-shadow:${HEAVY_SHADOW};line-height:1.2;">DM<br>@madebyaidan</div>
          <div style="font-family:'Courier New',monospace;font-size:44px;color:#ccc;margin-top:40px;text-shadow:${HEAVY_SHADOW};">Free photo shoot &bull; ${loc.name}</div>
        </div>
      </div>
    </body></html>`,
  ]
}

// ═══════════════════════════════════════════════════════════════
// THEME 2: PHOTO BOOTH
// ═══════════════════════════════════════════════════════════════

function photoStrip(images, rotation = -3) {
  return `
    <div style="display:inline-block;background:#fff;padding:20px 20px 60px 20px;transform:rotate(${rotation}deg);box-shadow:8px 8px 30px rgba(0,0,0,0.6);">
      ${images.map(src => `
        <div style="width:280px;height:280px;margin-bottom:12px;overflow:hidden;">
          <img src="${src}" style="width:100%;height:100%;object-fit:cover;">
        </div>
      `).join('')}
    </div>
  `
}

function boothFooter(city) {
  return `<div style="position:absolute;bottom:0;left:0;width:100%;height:100px;background:#1a0a08;z-index:20;display:flex;align-items:center;justify-content:center;">
    <span style="font-family:Georgia,serif;font-size:36px;color:#d4a060;letter-spacing:6px;font-weight:bold;">FREE PHOTO SHOOT &bull; ${city}</span>
  </div>`
}

function photoBoothTheme(loc) {
  const city = loc.upper
  const gold = '#d4a060'
  const warmBg = '#1a0a08'
  const creamBg = '#f8f4ef'

  return [
    // Slide 1: Hook
    `<html><head><style>${RESET_CSS}</style></head><body style="background:${warmBg};">
      <div style="position:relative;width:1080px;height:1920px;">
        <!-- Curtain texture -->
        <div style="position:absolute;top:0;left:0;width:100%;height:100%;background:repeating-linear-gradient(90deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 30px, transparent 30px, transparent 60px);"></div>
        <div style="position:absolute;top:100px;left:50%;transform:translateX(-50%);z-index:10;text-align:center;width:90%;">
          <div style="font-family:Georgia,serif;font-size:96px;font-weight:bold;color:${gold};text-shadow:0 4px 30px rgba(212,160,96,0.4);line-height:1.1;">STEP INTO<br>THE BOOTH</div>
          <div style="font-family:Georgia,serif;font-size:44px;color:#e8d5c0;margin-top:20px;letter-spacing:3px;">Free Photo Shoot &bull; ${city}</div>
        </div>
        <div style="position:absolute;top:480px;left:50%;transform:translateX(-50%);z-index:10;">
          ${photoStrip([heroPhotos[0], heroPhotos[1], heroPhotos[2]], -3)}
        </div>
      </div>
    </body></html>`,

    // Slide 2: Proof - two strips side by side
    `<html><head><style>${RESET_CSS}</style></head><body style="background:${warmBg};">
      <div style="position:relative;width:1080px;height:1920px;">
        <div style="position:absolute;top:50px;left:0;width:100%;text-align:center;z-index:20;">
          <span style="font-family:Georgia,serif;font-size:80px;font-weight:bold;color:${gold};text-shadow:0 4px 20px rgba(212,160,96,0.3);">MY WORK</span>
        </div>
        <div style="position:absolute;top:220px;left:50%;transform:translateX(-50%);z-index:10;display:flex;gap:40px;">
          ${photoStrip([proofPhotos[0], proofPhotos[1], proofPhotos[2]], -2)}
          ${photoStrip([proofPhotos[3], proofPhotos[4], proofPhotos[5]], 2)}
        </div>
        <div style="position:absolute;bottom:60px;left:0;width:100%;text-align:center;z-index:20;">
          <span style="font-family:Georgia,serif;font-size:40px;color:${gold};letter-spacing:4px;">Free photo shoot &bull; ${city}</span>
        </div>
      </div>
    </body></html>`,

    // Slide 3: How it works
    `<html><head><style>${RESET_CSS}</style></head><body style="background:#000;">
      <div style="position:relative;width:1080px;height:1920px;">
        <img src="${bgPhotos[1]}" style="width:100%;height:100%;object-fit:cover;filter:saturate(0.7) brightness(0.35);">
        <div style="position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(to bottom, rgba(26,10,8,0.85) 0%, rgba(26,10,8,0.7) 50%, rgba(26,10,8,0.85) 100%);"></div>
        <div style="position:absolute;top:0;left:0;width:100%;height:100%;display:flex;flex-direction:column;justify-content:center;padding:0 60px;z-index:10;">
          <div style="font-family:Georgia,serif;font-size:90px;font-weight:bold;color:${gold};margin-bottom:100px;line-height:1.1;text-shadow:0 4px 20px rgba(212,160,96,0.3);">HOW IT<br>WORKS</div>
          <div style="display:flex;flex-direction:column;gap:60px;">
            ${[
              ['1', 'DM @madebyaidan on Instagram'],
              ['2', 'We plan the shoot together'],
              ['3', 'Show up & get free photos'],
            ].map(([num, text]) => `
              <div style="background:rgba(26,10,8,0.8);padding:50px 40px;display:flex;align-items:center;gap:30px;border:2px solid ${gold}40;">
                <div style="font-family:Georgia,serif;font-size:90px;color:${gold};font-weight:bold;min-width:90px;text-align:center;">${num}</div>
                <div style="font-family:Georgia,serif;font-size:48px;color:#e8d5c0;line-height:1.3;">${text}</div>
              </div>
            `).join('')}
          </div>
        </div>
        ${boothFooter(city)}
      </div>
    </body></html>`,

    // Slide 4: What's included
    `<html><head><style>${RESET_CSS}</style></head><body style="background:#000;">
      <div style="position:relative;width:1080px;height:1920px;">
        <img src="${bgPhotos[2]}" style="width:100%;height:100%;object-fit:cover;filter:saturate(0.7) brightness(0.35);">
        <div style="position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(to bottom, rgba(26,10,8,0.85) 0%, rgba(26,10,8,0.65) 50%, rgba(26,10,8,0.85) 100%);"></div>
        <div style="position:absolute;top:0;left:0;width:100%;height:100%;display:flex;flex-direction:column;justify-content:center;padding:0 60px;z-index:10;">
          <div style="font-family:Georgia,serif;font-size:90px;font-weight:bold;color:${gold};margin-bottom:100px;text-shadow:0 4px 20px rgba(212,160,96,0.3);line-height:1.1;">WHAT'S<br>INCLUDED</div>
          ${[
            '30-minute session',
            '15+ edited photos',
            'All digital files',
            'No cost, ever',
          ].map(item => `
            <div style="background:rgba(26,10,8,0.7);border:2px solid ${gold};padding:44px 40px;margin-bottom:30px;display:flex;align-items:center;gap:20px;">
              <div style="width:20px;height:20px;background:${gold};border-radius:50%;flex-shrink:0;"></div>
              <span style="font-family:Georgia,serif;font-size:50px;color:#e8d5c0;">${item}</span>
            </div>
          `).join('')}
        </div>
        <div style="position:absolute;bottom:80px;left:0;width:100%;text-align:center;z-index:20;">
          <span style="font-family:Georgia,serif;font-size:40px;color:${gold};letter-spacing:3px;">FREE &bull; ${city}</span>
        </div>
      </div>
    </body></html>`,

    // Slide 5: CTA
    `<html><head><style>${RESET_CSS}</style></head><body style="background:${warmBg};">
      <div style="position:relative;width:1080px;height:1920px;">
        <div style="position:absolute;top:0;left:0;width:100%;height:100%;background:repeating-linear-gradient(90deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 30px, transparent 30px, transparent 60px);"></div>
        <div style="position:absolute;top:100px;left:50%;transform:translateX(-50%);z-index:10;">
          ${photoStrip([heroPhotos[3], heroPhotos[4], heroPhotos[5]], 2)}
        </div>
        <div style="position:absolute;bottom:200px;left:50%;transform:translateX(-50%);z-index:20;text-align:center;width:90%;">
          <div style="font-family:Georgia,serif;font-size:88px;font-weight:bold;color:${gold};text-shadow:0 4px 30px rgba(212,160,96,0.5);line-height:1.2;">DM<br>@madebyaidan</div>
          <div style="font-family:Georgia,serif;font-size:42px;color:#e8d5c0;margin-top:30px;">${loc.name} &bull; Free Photo Shoot</div>
        </div>
      </div>
    </body></html>`,
  ]
}

// ═══════════════════════════════════════════════════════════════
// THEME 3: SLOT MACHINE
// ═══════════════════════════════════════════════════════════════

function marqueeBorder() {
  // Yellow dots border using CSS
  return `
    <div style="position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:15;">
      <!-- Top row -->
      <div style="position:absolute;top:10px;left:10px;right:10px;height:30px;display:flex;justify-content:space-around;align-items:center;">
        ${Array(20).fill(0).map((_, i) => `<div style="width:18px;height:18px;border-radius:50%;background:${i % 2 === 0 ? '#ffd700' : '#ff8c00'};box-shadow:0 0 10px ${i % 2 === 0 ? '#ffd700' : '#ff8c00'};"></div>`).join('')}
      </div>
      <!-- Bottom row -->
      <div style="position:absolute;bottom:10px;left:10px;right:10px;height:30px;display:flex;justify-content:space-around;align-items:center;">
        ${Array(20).fill(0).map((_, i) => `<div style="width:18px;height:18px;border-radius:50%;background:${i % 2 !== 0 ? '#ffd700' : '#ff8c00'};box-shadow:0 0 10px ${i % 2 !== 0 ? '#ffd700' : '#ff8c00'};"></div>`).join('')}
      </div>
      <!-- Left col -->
      <div style="position:absolute;top:40px;left:10px;bottom:40px;width:30px;display:flex;flex-direction:column;justify-content:space-around;align-items:center;">
        ${Array(30).fill(0).map((_, i) => `<div style="width:16px;height:16px;border-radius:50%;background:${i % 2 === 0 ? '#ffd700' : '#ff8c00'};box-shadow:0 0 8px ${i % 2 === 0 ? '#ffd700' : '#ff8c00'};"></div>`).join('')}
      </div>
      <!-- Right col -->
      <div style="position:absolute;top:40px;right:10px;bottom:40px;width:30px;display:flex;flex-direction:column;justify-content:space-around;align-items:center;">
        ${Array(30).fill(0).map((_, i) => `<div style="width:16px;height:16px;border-radius:50%;background:${i % 2 !== 0 ? '#ffd700' : '#ff8c00'};box-shadow:0 0 8px ${i % 2 !== 0 ? '#ffd700' : '#ff8c00'};"></div>`).join('')}
      </div>
    </div>
  `
}

function slotMachineTheme(loc) {
  const city = loc.upper
  const gold = '#ffd700'
  const darkBg = '#0c0008'

  return [
    // Slide 1: Hook
    `<html><head><style>${RESET_CSS}</style></head><body style="background:${darkBg};">
      <div style="position:relative;width:1080px;height:1920px;">
        ${marqueeBorder()}
        <div style="position:absolute;top:120px;left:50%;transform:translateX(-50%);z-index:20;text-align:center;width:90%;">
          <div style="font-family:Georgia,serif;font-size:130px;font-weight:900;color:${gold};text-shadow:0 0 40px rgba(255,215,0,0.6), 0 4px 8px rgba(0,0,0,0.8);line-height:1.05;letter-spacing:-2px;">FREE<br>PHOTO<br>SHOOT</div>
          <div style="font-family:Georgia,serif;font-size:70px;color:${gold};margin-top:30px;text-shadow:0 0 20px rgba(255,215,0,0.4);letter-spacing:8px;">${city}</div>
        </div>
        <div style="position:absolute;bottom:100px;left:50%;transform:translateX(-50%);z-index:20;display:flex;gap:16px;">
          ${[heroPhotos[0], heroPhotos[1], heroPhotos[2]].map(src => `
            <div style="width:310px;height:400px;border:4px solid ${gold};overflow:hidden;box-shadow:0 0 20px rgba(255,215,0,0.3);">
              <img src="${src}" style="width:100%;height:100%;object-fit:cover;">
            </div>
          `).join('')}
        </div>
      </div>
    </body></html>`,

    // Slide 2: Jackpot proof
    `<html><head><style>${RESET_CSS}</style></head><body style="background:${darkBg};">
      <div style="position:relative;width:1080px;height:1920px;">
        ${marqueeBorder()}
        <div style="position:absolute;top:80px;left:0;width:100%;text-align:center;z-index:20;">
          <div style="font-family:Georgia,serif;font-size:110px;font-weight:900;color:${gold};text-shadow:0 0 40px rgba(255,215,0,0.5);letter-spacing:4px;">JACKPOT</div>
          <div style="font-family:Georgia,serif;font-size:40px;color:#e8d5c0;margin-top:10px;">My recent work</div>
        </div>
        <div style="position:absolute;top:320px;left:50%;transform:translateX(-50%);z-index:20;display:grid;grid-template-columns:1fr 1fr;gap:16px;">
          ${[proofPhotos[0], proofPhotos[1], proofPhotos[2], proofPhotos[3]].map(src => `
            <div style="width:470px;height:580px;border:4px solid ${gold};overflow:hidden;box-shadow:0 0 15px rgba(255,215,0,0.2);">
              <img src="${src}" style="width:100%;height:100%;object-fit:cover;">
            </div>
          `).join('')}
        </div>
        <div style="position:absolute;bottom:70px;left:0;width:100%;text-align:center;z-index:20;">
          <span style="font-family:Georgia,serif;font-size:40px;color:${gold};letter-spacing:4px;">Free shoot &bull; ${city}</span>
        </div>
      </div>
    </body></html>`,

    // Slide 3: How to win
    `<html><head><style>${RESET_CSS}</style></head><body style="background:#000;">
      <div style="position:relative;width:1080px;height:1920px;">
        <img src="${bgPhotos[3]}" style="width:100%;height:100%;object-fit:cover;filter:saturate(0.6) brightness(0.3);">
        <div style="position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(180deg, rgba(26,0,8,0.8) 0%, rgba(42,0,16,0.75) 50%, rgba(26,0,8,0.85) 100%);"></div>
        ${marqueeBorder()}
        <div style="position:absolute;top:0;left:0;width:100%;height:100%;display:flex;flex-direction:column;justify-content:center;padding:0 60px;z-index:20;">
          <div style="font-family:Georgia,serif;font-size:100px;font-weight:900;color:${gold};text-shadow:0 0 30px rgba(255,215,0,0.5);margin-bottom:100px;line-height:1.1;">HOW TO<br>WIN</div>
          <div style="display:flex;flex-direction:column;gap:60px;">
            ${[
              ['&#127920; 1.', 'DM me on Instagram'],
              ['&#127920; 2.', 'We plan the shoot'],
              ['&#127920; 3.', 'Get your photos free'],
            ].map(([label, text]) => `
              <div style="background:rgba(255,215,0,0.08);border:3px solid ${gold};padding:55px 40px;display:flex;align-items:center;gap:24px;box-shadow:0 0 20px rgba(255,215,0,0.1);">
                <span style="font-family:Georgia,serif;font-size:64px;color:${gold};white-space:nowrap;">${label}</span>
                <span style="font-family:Georgia,serif;font-size:52px;color:#fff;">${text}</span>
              </div>
            `).join('')}
          </div>
        </div>
        <div style="position:absolute;bottom:80px;left:0;width:100%;text-align:center;z-index:20;">
          <span style="font-family:Georgia,serif;font-size:44px;color:${gold};letter-spacing:4px;">FREE PHOTO SHOOT &bull; ${city}</span>
        </div>
      </div>
    </body></html>`,

    // Slide 4: What you win
    `<html><head><style>${RESET_CSS}</style></head><body style="background:#000;">
      <div style="position:relative;width:1080px;height:1920px;">
        <img src="${bgPhotos[4]}" style="width:100%;height:100%;object-fit:cover;filter:saturate(0.6) brightness(0.3);">
        <div style="position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(180deg, rgba(12,0,8,0.8) 0%, rgba(12,0,8,0.7) 50%, rgba(12,0,8,0.85) 100%);"></div>
        ${marqueeBorder()}
        <div style="position:absolute;top:0;left:0;width:100%;height:100%;display:flex;flex-direction:column;justify-content:center;padding:0 60px;z-index:20;">
          <div style="font-family:Georgia,serif;font-size:100px;font-weight:900;color:${gold};text-shadow:0 0 30px rgba(255,215,0,0.5);margin-bottom:90px;line-height:1.1;">WHAT<br>YOU WIN</div>
          ${[
            '30-minute session',
            '15+ edited photos',
            'All digital files',
            'Use them anywhere',
            '100% free',
          ].map(item => `
            <div style="font-family:Georgia,serif;font-size:54px;color:${gold};margin-bottom:50px;display:flex;align-items:center;gap:24px;">
              <span style="font-size:48px;">&#9733;</span> ${item}
            </div>
          `).join('')}
        </div>
        <div style="position:absolute;bottom:80px;left:0;width:100%;text-align:center;z-index:20;">
          <span style="font-family:Georgia,serif;font-size:40px;color:${gold};letter-spacing:3px;">FREE &bull; ${city}</span>
        </div>
      </div>
    </body></html>`,

    // Slide 5: CTA
    `<html><head><style>${RESET_CSS}</style></head><body style="background:#000;">
      <div style="position:relative;width:1080px;height:1920px;">
        <img src="${heroPhotos[3]}" style="width:100%;height:100%;object-fit:cover;filter:brightness(0.4);">
        <div style="position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.4);"></div>
        ${marqueeBorder()}
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:20;text-align:center;width:90%;">
          <div style="font-family:Georgia,serif;font-size:60px;color:${gold};text-shadow:0 0 30px rgba(255,215,0,0.5);letter-spacing:6px;margin-bottom:30px;">PULL THE LEVER</div>
          <div style="font-family:Georgia,serif;font-size:88px;font-weight:900;color:#fff;text-shadow:${HEAVY_SHADOW};line-height:1.2;">DM<br>@madebyaidan</div>
          <div style="font-family:Georgia,serif;font-size:40px;color:${gold};margin-top:40px;">Free photo shoot &bull; ${loc.name}</div>
        </div>
      </div>
    </body></html>`,
  ]
}

// ═══════════════════════════════════════════════════════════════
// THEME 4: BTS CONTACT SHEET
// ═══════════════════════════════════════════════════════════════

function filmPerforations() {
  return `
    <div style="position:absolute;top:0;left:0;width:50px;height:100%;z-index:15;background:#111;display:flex;flex-direction:column;justify-content:space-around;align-items:center;padding:20px 0;">
      ${Array(30).fill(0).map(() => `<div style="width:24px;height:16px;border-radius:3px;background:#000;border:1px solid #333;"></div>`).join('')}
    </div>
    <div style="position:absolute;top:0;right:0;width:50px;height:100%;z-index:15;background:#111;display:flex;flex-direction:column;justify-content:space-around;align-items:center;padding:20px 0;">
      ${Array(30).fill(0).map(() => `<div style="width:24px;height:16px;border-radius:3px;background:#000;border:1px solid #333;"></div>`).join('')}
    </div>
  `
}

function btsContactSheetTheme(loc) {
  const city = loc.upper

  return [
    // Slide 1: Hook with film frame
    `<html><head><style>${RESET_CSS}</style></head><body style="background:#111;">
      <div style="position:relative;width:1080px;height:1920px;">
        <img src="${heroPhotos[0]}" style="width:100%;height:100%;object-fit:cover;">
        <div style="position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.1) 30%, rgba(0,0,0,0.6) 100%);"></div>
        ${filmPerforations()}
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:20;text-align:center;width:85%;">
          <div style="font-family:Georgia,serif;font-size:100px;font-weight:900;color:#fff;text-shadow:${HEAVY_SHADOW};line-height:1.1;letter-spacing:2px;">BEHIND<br>THE<br>SCENES</div>
          <div style="font-family:system-ui,sans-serif;font-size:44px;color:#ddd;margin-top:30px;text-shadow:${HEAVY_SHADOW};letter-spacing:4px;">${loc.name} — Free Photo Shoot</div>
        </div>
      </div>
    </body></html>`,

    // Slide 2: Contact sheet 3x3 grid
    `<html><head><style>${RESET_CSS}</style></head><body style="background:#111;">
      <div style="position:relative;width:1080px;height:1920px;">
        <div style="position:absolute;top:40px;left:0;width:100%;text-align:center;z-index:20;">
          <span style="font-family:Georgia,serif;font-size:80px;font-weight:bold;color:#fff;text-shadow:${HEAVY_SHADOW};">SELECTS</span>
        </div>
        <div style="position:absolute;top:180px;left:50%;transform:translateX(-50%);z-index:10;display:grid;grid-template-columns:repeat(3,1fr);gap:10px;width:1000px;">
          ${[...proofPhotos.slice(0, 9)].map((src, i) => `
            <div style="position:relative;width:326px;height:326px;overflow:hidden;">
              <img src="${src}" style="width:100%;height:100%;object-fit:cover;">
              ${i === 1 || i === 5 || i === 7 ? `<div style="position:absolute;top:10px;right:10px;width:60px;height:60px;border:4px solid #ff3333;border-radius:50%;"></div>` : ''}
              <div style="position:absolute;bottom:6px;left:8px;font-family:'Courier New',monospace;font-size:18px;color:#fff;text-shadow:1px 1px 4px rgba(0,0,0,0.9);">${String(i+1).padStart(3,'0')}</div>
            </div>
          `).join('')}
        </div>
        <div style="position:absolute;bottom:60px;left:0;width:100%;text-align:center;z-index:20;">
          <span style="font-family:Georgia,serif;font-size:40px;color:#fff;letter-spacing:4px;text-shadow:${HEAVY_SHADOW};">Free shoot &bull; ${city}</span>
        </div>
      </div>
    </body></html>`,

    // Slide 3: The Process
    `<html><head><style>${RESET_CSS}</style></head><body style="background:#000;">
      <div style="position:relative;width:1080px;height:1920px;">
        <img src="${bgPhotos[5]}" style="width:100%;height:100%;object-fit:cover;filter:brightness(0.3) saturate(0.7);">
        <div style="position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(to bottom, rgba(17,17,17,0.8) 0%, rgba(17,17,17,0.65) 50%, rgba(17,17,17,0.8) 100%);"></div>
        ${filmPerforations()}
        <!-- Subtle grid -->
        <div style="position:absolute;top:0;left:0;width:100%;height:100%;background:repeating-linear-gradient(0deg, transparent 0px, transparent 99px, rgba(255,255,255,0.03) 99px, rgba(255,255,255,0.03) 100px), repeating-linear-gradient(90deg, transparent 0px, transparent 99px, rgba(255,255,255,0.03) 99px, rgba(255,255,255,0.03) 100px);"></div>
        <div style="position:absolute;top:0;left:0;width:100%;height:100%;display:flex;flex-direction:column;justify-content:center;padding:0 80px;z-index:10;">
          <div style="font-family:Georgia,serif;font-size:100px;font-weight:bold;color:#fff;margin-bottom:100px;line-height:1.1;text-shadow:${HEAVY_SHADOW};">THE<br>PROCESS</div>
          <div style="display:flex;flex-direction:column;gap:55px;">
            ${[
              ['01', 'DM @madebyaidan on IG'],
              ['02', 'Pick a date & location'],
              ['03', 'Show up, get photos free'],
            ].map(([num, text]) => `
              <div style="background:rgba(26,26,26,0.8);border:2px solid #555;padding:50px 40px;display:flex;align-items:center;gap:30px;">
                <div style="font-family:'Courier New',monospace;font-size:80px;color:#999;font-weight:bold;min-width:120px;">${num}</div>
                <div style="font-family:Georgia,serif;font-size:48px;color:#eee;line-height:1.3;text-shadow:${HEAVY_SHADOW};">${text}</div>
              </div>
            `).join('')}
          </div>
        </div>
        <div style="position:absolute;bottom:80px;left:0;width:100%;text-align:center;z-index:20;">
          <span style="font-family:Georgia,serif;font-size:42px;color:#fff;letter-spacing:4px;text-shadow:${HEAVY_SHADOW};">FREE PHOTO SHOOT &bull; ${city}</span>
        </div>
      </div>
    </body></html>`,

    // Slide 4: What's in the package
    `<html><head><style>${RESET_CSS}</style></head><body style="background:#000;">
      <div style="position:relative;width:1080px;height:1920px;">
        <img src="${heroPhotos[2]}" style="width:100%;height:100%;object-fit:cover;filter:brightness(0.4);">
        <div style="position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.4);"></div>
        ${filmPerforations()}
        <div style="position:absolute;top:0;left:0;width:100%;height:100%;display:flex;flex-direction:column;justify-content:center;padding:0 80px;z-index:20;">
          <div style="font-family:Georgia,serif;font-size:90px;font-weight:bold;color:#fff;text-shadow:${HEAVY_SHADOW};margin-bottom:90px;line-height:1.1;">WHAT'S IN<br>THE PACKAGE</div>
          ${[
            '30-minute session',
            '15+ edited photos',
            'All digital files',
            'Use anywhere you want',
            'Completely free',
          ].map(item => `
            <div style="font-family:Georgia,serif;font-style:italic;font-size:50px;color:#eee;margin-bottom:48px;text-shadow:${HEAVY_SHADOW};display:flex;align-items:center;gap:20px;">
              <span style="color:#ff6666;font-size:40px;font-style:normal;">&#10003;</span> ${item}
            </div>
          `).join('')}
        </div>
        <div style="position:absolute;bottom:80px;left:0;width:100%;text-align:center;z-index:20;">
          <span style="font-family:Georgia,serif;font-size:36px;color:#ddd;letter-spacing:3px;text-shadow:${HEAVY_SHADOW};">Free &bull; ${loc.name}</span>
        </div>
      </div>
    </body></html>`,

    // Slide 5: CTA
    `<html><head><style>${RESET_CSS}</style></head><body style="background:#000;">
      <div style="position:relative;width:1080px;height:1920px;">
        <img src="${heroPhotos[4]}" style="width:100%;height:100%;object-fit:cover;filter:brightness(0.75);">
        <div style="position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.35) 100%);"></div>
        ${filmPerforations()}
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:20;text-align:center;width:85%;">
          <div style="font-family:Georgia,serif;font-size:96px;font-weight:900;color:#fff;text-shadow:${HEAVY_SHADOW};line-height:1.15;">BOOK YOUR<br>SESSION</div>
          <div style="font-family:Georgia,serif;font-size:64px;color:#fff;margin-top:40px;text-shadow:${HEAVY_SHADOW};">DM @madebyaidan</div>
          <div style="font-family:Georgia,serif;font-size:40px;color:#ccc;margin-top:30px;text-shadow:${HEAVY_SHADOW};">Free photo shoot &bull; ${loc.name}</div>
        </div>
      </div>
    </body></html>`,
  ]
}

// ═══════════════════════════════════════════════════════════════
// THEME 5: TETRIS
// ═══════════════════════════════════════════════════════════════

function tetrisGrid() {
  return `<div style="position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;
    background:repeating-linear-gradient(0deg, transparent 0px, transparent 59px, rgba(255,255,255,0.03) 59px, rgba(255,255,255,0.03) 60px),
    repeating-linear-gradient(90deg, transparent 0px, transparent 59px, rgba(255,255,255,0.03) 59px, rgba(255,255,255,0.03) 60px);
    z-index:5;"></div>`
}

const tetrisColors = ['#00f0f0', '#f0a000', '#a000f0', '#00f000', '#f00000', '#0000f0', '#f0f000']

function tetrisTheme(loc) {
  const city = loc.upper
  const darkBg = '#0a0e1a'
  const cyan = '#00f0f0'

  return [
    // Slide 1: FREE / PHOTO / SHOOT as Tetris blocks
    `<html><head><style>${RESET_CSS}</style></head><body style="background:${darkBg};">
      <div style="position:relative;width:1080px;height:1920px;">
        ${tetrisGrid()}
        <!-- Decorative small tetris pieces -->
        <div style="position:absolute;top:40px;right:60px;width:80px;height:80px;background:#f0a000;z-index:6;"></div>
        <div style="position:absolute;top:40px;right:140px;width:80px;height:40px;background:#f0a000;z-index:6;"></div>

        <div style="position:absolute;top:120px;left:50%;transform:translateX(-50%);z-index:20;width:90%;display:flex;flex-direction:column;gap:20px;">
          ${[
            { text: 'FREE', color: '#00f0f0' },
            { text: 'PHOTO', color: '#f0a000' },
            { text: 'SHOOT', color: '#a000f0' },
          ].map(({ text, color }) => `
            <div style="background:${color};padding:55px 0;text-align:center;border:4px solid rgba(255,255,255,0.3);box-shadow:inset 0 0 30px rgba(0,0,0,0.3), 0 0 20px ${color}40;">
              <span style="font-family:'Courier New',monospace;font-size:120px;font-weight:900;color:#fff;text-shadow:4px 4px 0 rgba(0,0,0,0.5);letter-spacing:8px;">${text}</span>
            </div>
          `).join('')}
        </div>

        <div style="position:absolute;top:820px;left:0;width:100%;text-align:center;z-index:20;">
          <div style="font-family:'Courier New',monospace;font-size:80px;color:${cyan};letter-spacing:10px;text-shadow:0 0 30px ${cyan}60;">${city}</div>
        </div>

        <!-- Photo tetris blocks filling bottom -->
        <div style="position:absolute;bottom:0;left:0;width:100%;z-index:15;display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;padding:0 8px 8px 8px;">
          ${[proofPhotos[0], proofPhotos[1], proofPhotos[2]].map((src, i) => `
            <div style="height:360px;overflow:hidden;border:4px solid ${tetrisColors[i % tetrisColors.length]};box-shadow:0 0 15px ${tetrisColors[i % tetrisColors.length]}30;">
              <img src="${src}" style="width:100%;height:100%;object-fit:cover;">
            </div>
          `).join('')}
          ${[proofPhotos[3], proofPhotos[4]].map((src, i) => `
            <div style="height:280px;overflow:hidden;border:4px solid ${tetrisColors[(i+3) % tetrisColors.length]};box-shadow:0 0 15px ${tetrisColors[(i+3) % tetrisColors.length]}30;">
              <img src="${src}" style="width:100%;height:100%;object-fit:cover;">
            </div>
          `).join('')}
          <div style="height:280px;display:flex;flex-direction:column;gap:8px;">
            <div style="flex:1;background:#a000f0;border:4px solid rgba(255,255,255,0.3);"></div>
            <div style="flex:1;background:#f00000;border:4px solid rgba(255,255,255,0.3);"></div>
          </div>
        </div>
      </div>
    </body></html>`,

    // Slide 2: Photos as Tetris blocks
    `<html><head><style>${RESET_CSS}</style></head><body style="background:${darkBg};">
      <div style="position:relative;width:1080px;height:1920px;">
        ${tetrisGrid()}
        <div style="position:absolute;top:50px;left:0;width:100%;text-align:center;z-index:20;">
          <span style="font-family:'Courier New',monospace;font-size:80px;font-weight:bold;color:${cyan};text-shadow:0 0 30px ${cyan}60;letter-spacing:4px;">MY WORK</span>
        </div>
        <!-- 6 photos in varied block sizes -->
        <div style="position:absolute;top:200px;left:30px;z-index:20;display:grid;grid-template-columns:1fr 1fr;gap:12px;width:1020px;">
          ${[proofPhotos[0], proofPhotos[1], proofPhotos[2], proofPhotos[3], proofPhotos[4], proofPhotos[5]].map((src, i) => `
            <div style="height:${i < 2 ? 520 : 400}px;overflow:hidden;border:4px solid ${tetrisColors[i % tetrisColors.length]};box-shadow:0 0 15px ${tetrisColors[i % tetrisColors.length]}30;">
              <img src="${src}" style="width:100%;height:100%;object-fit:cover;">
            </div>
          `).join('')}
        </div>
        <div style="position:absolute;bottom:60px;left:0;width:100%;text-align:center;z-index:20;">
          <span style="font-family:'Courier New',monospace;font-size:40px;color:${cyan};letter-spacing:4px;">Free shoot &bull; ${city}</span>
        </div>
      </div>
    </body></html>`,

    // Slide 3: How to play (levels)
    `<html><head><style>${RESET_CSS}</style></head><body style="background:#000;">
      <div style="position:relative;width:1080px;height:1920px;">
        <img src="${bgPhotos[6]}" style="width:100%;height:100%;object-fit:cover;filter:brightness(0.25) saturate(0.5);">
        <div style="position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(to bottom, rgba(10,14,26,0.85) 0%, rgba(10,14,26,0.7) 50%, rgba(10,14,26,0.85) 100%);"></div>
        ${tetrisGrid()}
        <!-- Score display -->
        <div style="position:absolute;top:80px;left:60px;right:60px;z-index:20;display:flex;justify-content:space-between;">
          <span style="font-family:'Courier New',monospace;font-size:28px;color:#666;">SCORE: 999999</span>
          <span style="font-family:'Courier New',monospace;font-size:28px;color:#666;">LINES: 075</span>
        </div>
        <div style="position:absolute;top:0;left:0;width:100%;height:100%;display:flex;flex-direction:column;justify-content:center;padding:0 60px;z-index:20;">
          <div style="font-family:'Courier New',monospace;font-size:100px;font-weight:bold;color:${cyan};text-shadow:0 0 30px ${cyan}60;margin-bottom:100px;line-height:1.1;">HOW TO<br>PLAY</div>
          <div style="display:flex;flex-direction:column;gap:70px;">
            ${[
              { level: 'LEVEL 1', text: 'DM @madebyaidan on IG', color: '#00f0f0' },
              { level: 'LEVEL 2', text: 'Plan the shoot together', color: '#f0a000' },
              { level: 'LEVEL 3', text: 'Show up & get free photos', color: '#a000f0' },
            ].map(({ level, text, color }) => `
              <div style="background:rgba(10,14,26,0.7);border-left:6px solid ${color};padding:40px 30px;">
                <div style="font-family:'Courier New',monospace;font-size:60px;color:${color};font-weight:bold;text-shadow:0 0 15px ${color}40;margin-bottom:12px;">${level}</div>
                <div style="font-family:'Courier New',monospace;font-size:46px;color:#eee;padding-left:10px;text-shadow:${HEAVY_SHADOW};">${text}</div>
              </div>
            `).join('')}
          </div>
        </div>
        <div style="position:absolute;bottom:80px;left:0;width:100%;text-align:center;z-index:20;">
          <span style="font-family:'Courier New',monospace;font-size:40px;color:${cyan};letter-spacing:4px;">FREE PHOTO SHOOT &bull; ${city}</span>
        </div>
      </div>
    </body></html>`,

    // Slide 4: Power-ups (what you get)
    `<html><head><style>${RESET_CSS}</style></head><body style="background:#000;">
      <div style="position:relative;width:1080px;height:1920px;">
        <img src="${bgPhotos[0]}" style="width:100%;height:100%;object-fit:cover;filter:brightness(0.25) saturate(0.5);">
        <div style="position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(to bottom, rgba(10,14,26,0.85) 0%, rgba(10,14,26,0.7) 50%, rgba(10,14,26,0.85) 100%);"></div>
        ${tetrisGrid()}
        <div style="position:absolute;top:0;left:0;width:100%;height:100%;display:flex;flex-direction:column;justify-content:center;padding:0 60px;z-index:20;">
          <div style="font-family:'Courier New',monospace;font-size:100px;font-weight:bold;color:${cyan};text-shadow:0 0 30px ${cyan}60;margin-bottom:90px;line-height:1.1;">POWER<br>UPS</div>
          ${[
            { text: '30-minute session', color: '#00f0f0' },
            { text: '15+ edited photos', color: '#f0a000' },
            { text: 'All digital files', color: '#a000f0' },
            { text: 'Use them anywhere', color: '#00f000' },
            { text: '100% free', color: '#f00000' },
          ].map(({ text, color }) => `
            <div style="display:flex;align-items:center;gap:24px;margin-bottom:50px;">
              <div style="width:50px;height:50px;background:${color};border:3px solid rgba(255,255,255,0.3);box-shadow:0 0 10px ${color}40;flex-shrink:0;"></div>
              <span style="font-family:'Courier New',monospace;font-size:52px;color:#fff;text-shadow:${HEAVY_SHADOW};">${text}</span>
            </div>
          `).join('')}
        </div>
        <div style="position:absolute;bottom:80px;left:0;width:100%;text-align:center;z-index:20;">
          <span style="font-family:'Courier New',monospace;font-size:40px;color:${cyan};letter-spacing:4px;">FREE PHOTO SHOOT &bull; ${city}</span>
        </div>
      </div>
    </body></html>`,

    // Slide 5: CTA - Press Start
    `<html><head><style>${RESET_CSS}</style></head><body style="background:${darkBg};">
      <div style="position:relative;width:1080px;height:1920px;">
        ${tetrisGrid()}
        <!-- Retro border -->
        <div style="position:absolute;top:20px;left:20px;right:20px;bottom:20px;border:4px solid ${cyan};box-shadow:0 0 20px ${cyan}30;z-index:10;"></div>
        <!-- Large centered photo -->
        <div style="position:absolute;top:120px;left:80px;right:80px;height:900px;z-index:15;overflow:hidden;border:4px solid ${cyan};box-shadow:0 0 30px ${cyan}40;">
          <img src="${heroPhotos[3]}" style="width:100%;height:100%;object-fit:cover;">
        </div>
        <div style="position:absolute;bottom:300px;left:50%;transform:translateX(-50%);z-index:20;text-align:center;width:90%;">
          <div style="font-family:'Courier New',monospace;font-size:100px;font-weight:900;color:${cyan};text-shadow:0 0 40px ${cyan}, 0 0 80px ${cyan}60;letter-spacing:4px;">PRESS START</div>
          <div style="font-family:'Courier New',monospace;font-size:64px;color:#fff;margin-top:30px;text-shadow:${HEAVY_SHADOW};">DM @madebyaidan</div>
          <div style="font-family:'Courier New',monospace;font-size:40px;color:${cyan};margin-top:20px;">${loc.name} &bull; Free Photo Shoot</div>
        </div>
      </div>
    </body></html>`,
  ]
}

// ═══════════════════════════════════════════════════════════════
// RENDER ENGINE
// ═══════════════════════════════════════════════════════════════

const THEMES = [
  { slug: 'vhs',                fn: vhsTheme },
  { slug: 'photo-booth',        fn: photoBoothTheme },
  { slug: 'slot-machine',       fn: slotMachineTheme },
  { slug: 'bts-contact-sheet',  fn: btsContactSheetTheme },
  { slug: 'tetris',             fn: tetrisTheme },
]

const SLIDE_NAMES = ['01-hook', '02-proof', '03-how', '04-what', '05-cta']

async function main() {
  console.log('Launching browser...')
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 } })

  let total = 0

  for (const theme of THEMES) {
    for (const loc of LOCATIONS) {
      const dir = path.join(OUT, theme.slug, loc.slug)
      fs.mkdirSync(dir, { recursive: true })

      const slides = theme.fn(loc)

      for (let i = 0; i < slides.length; i++) {
        const page = await ctx.newPage()
        await page.setContent(slides[i], { waitUntil: 'load' })
        // Give images a moment to decode
        await page.waitForTimeout(300)

        const outPath = path.join(dir, `${SLIDE_NAMES[i]}.png`)
        await page.screenshot({ path: outPath, type: 'png' })
        await page.close()

        total++
        console.log(`  [${total}/75] ${theme.slug}/${loc.slug}/${SLIDE_NAMES[i]}.png`)
      }
    }
  }

  await browser.close()
  console.log(`\nDone! Rendered ${total} slides to ${OUT}`)
}

main().catch(err => { console.error(err); process.exit(1) })
