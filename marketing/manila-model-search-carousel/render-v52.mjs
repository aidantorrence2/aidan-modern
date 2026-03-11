import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v52')

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 410

const SF = "-apple-system, 'Helvetica Neue', Arial, sans-serif"

const MAP_BG = '#1a1a2e'
const MAP_GRID = '#252545'
const MAP_ROAD = '#2a2a50'
const PIN_RED = '#E8443A'
const CARD_BG = '#ffffff'
const CARD_SHADOW = '0 4px 20px rgba(0,0,0,0.35)'
const MANILA_COLOR = '#E8443A'
const STAR_GOLD = '#F4B400'

const HANDLE = 'madebyaidan'
const TOTAL_DURATION = 22
const TOTAL_DURATION_MS = 24000

function resetOutputDir() {
  fs.rmSync(OUT_DIR, { recursive: true, force: true })
  fs.mkdirSync(OUT_DIR, { recursive: true })
}

function imageMime(name) {
  const ext = path.extname(name).toLowerCase()
  if (ext === '.png') return 'image/png'
  if (ext === '.webp') return 'image/webp'
  return 'image/jpeg'
}

function readImage(name) {
  const filePath = path.join(IMAGE_DIR, name)
  const buf = fs.readFileSync(filePath)
  return `data:${imageMime(name)};base64,${buf.toString('base64')}`
}

function writeSources(payload) {
  fs.writeFileSync(path.join(OUT_DIR, 'sources.json'), JSON.stringify(payload, null, 2))
}

const p = (t) => ((t / TOTAL_DURATION) * 100).toFixed(1)

function isPurple(name) {
  return name.includes('purple')
}

// Purple photos have film borders — use 130% scale / -15% offset to crop them out
function imgStyle(src, name, pos = 'center 20%') {
  if (isPurple(name)) {
    return `width:130%;height:130%;object-fit:cover;object-position:${pos};display:block;margin:-15% 0 0 -15%;`
  }
  return `width:100%;height:100%;object-fit:cover;object-position:${pos};display:block;`
}

function buildMapAnimation(images) {
  // Timeline
  const T = {
    searchBarIn: 0.3,
    searchType: 0.8,
    mapZoom: 2.0,
    mainPinDrop: 3.2,
    ripple: 3.5,
    infoCardIn: 4.2,
    starsIn: 4.8,
    thumbRowIn: 5.4,
    pin2: 6.5,
    pin2photo: 7.0,
    pin3: 7.8,
    pin3photo: 8.3,
    pin4: 9.0,
    pin4photo: 9.5,
    pin5: 10.2,
    pin5photo: 10.7,
    cardExpand: 12.0,
    gridIn: 12.8,
    ctaIn: 14.5,
  }

  // Generate street grid SVG pattern
  const gridLines = []
  // Horizontal streets
  for (let y = 0; y < 2200; y += 80) {
    const w = (Math.random() * 0.6 + 0.3)
    gridLines.push(`<line x1="0" y1="${y}" x2="${WIDTH}" y2="${y}" stroke="${MAP_GRID}" stroke-width="${w}" opacity="${Math.random() * 0.4 + 0.2}"/>`)
  }
  // Vertical streets
  for (let x = 0; x < 1200; x += 100) {
    const w = (Math.random() * 0.8 + 0.3)
    gridLines.push(`<line x1="${x}" y1="0" x2="${x}" y2="${HEIGHT}" stroke="${MAP_GRID}" stroke-width="${w}" opacity="${Math.random() * 0.4 + 0.2}"/>`)
  }
  // Some diagonal roads
  gridLines.push(`<line x1="0" y1="600" x2="1080" y2="300" stroke="${MAP_ROAD}" stroke-width="3" opacity="0.3"/>`)
  gridLines.push(`<line x1="200" y1="0" x2="900" y2="1500" stroke="${MAP_ROAD}" stroke-width="2.5" opacity="0.25"/>`)
  gridLines.push(`<line x1="0" y1="900" x2="1080" y2="1100" stroke="${MAP_ROAD}" stroke-width="2" opacity="0.2"/>`)
  // Some wider "main roads"
  gridLines.push(`<line x1="540" y1="0" x2="540" y2="2000" stroke="${MAP_ROAD}" stroke-width="4" opacity="0.35"/>`)
  gridLines.push(`<line x1="0" y1="750" x2="1080" y2="750" stroke="${MAP_ROAD}" stroke-width="4" opacity="0.35"/>`)

  const stars = Array(5).fill(null).map((_, i) =>
    `<span style="color:${STAR_GOLD};font-size:22px;">&#9733;</span>`
  ).join('')

  // Mini photo thumbs for the info card scroll row
  const thumbs = [
    { src: images.thumb1, name: images._thumb1Name || '' },
    { src: images.thumb2, name: images._thumb2Name || '' },
    { src: images.thumb3, name: images._thumb3Name || '' },
    { src: images.thumb4, name: images._thumb4Name || '' },
    { src: images.thumb5, name: images._thumb5Name || '' },
    { src: images.thumb6, name: images._thumb6Name || '' },
  ]

  const thumbHTML = thumbs.map((t, i) => {
    const style = isPurple(t.name)
      ? `width:130%;height:130%;object-fit:cover;object-position:center 20%;display:block;margin:-15% 0 0 -15%;`
      : `width:100%;height:100%;object-fit:cover;object-position:center 20%;display:block;`
    return `<div style="width:90px;height:120px;border-radius:8px;overflow:hidden;flex-shrink:0;">
      <img src="${t.src}" style="${style}"/>
    </div>`
  }).join('')

  // Expanded grid photos (for card expand at ~12s)
  const gridPhotos = [
    { src: images.grid1, name: images._grid1Name || '' },
    { src: images.grid2, name: images._grid2Name || '' },
    { src: images.grid3, name: images._grid3Name || '' },
    { src: images.grid4, name: images._grid4Name || '' },
    { src: images.grid5, name: images._grid5Name || '' },
    { src: images.grid6, name: images._grid6Name || '' },
  ]

  const gridHTML = gridPhotos.map((g, i) => {
    const style = isPurple(g.name)
      ? `width:130%;height:130%;object-fit:cover;object-position:center 20%;display:block;margin:-15% 0 0 -15%;`
      : `width:100%;height:100%;object-fit:cover;object-position:center 20%;display:block;`
    return `<div style="width:calc(33.33% - 6px);aspect-ratio:3/4;border-radius:8px;overflow:hidden;">
      <img src="${g.src}" style="${style}"/>
    </div>`
  }).join('')

  // Secondary pins with popup photos
  const secondaryPins = [
    { x: 260, y: 420, src: images.pin2photo, name: images._pin2photoName || '', pinT: T.pin2, photoT: T.pin2photo },
    { x: 780, y: 360, src: images.pin3photo, name: images._pin3photoName || '', pinT: T.pin3, photoT: T.pin3photo },
    { x: 180, y: 680, src: images.pin4photo, name: images._pin4photoName || '', pinT: T.pin4, photoT: T.pin4photo },
    { x: 820, y: 620, src: images.pin5photo, name: images._pin5photoName || '', pinT: T.pin5, photoT: T.pin5photo },
  ]

  const pinsHTML = secondaryPins.map((pin, i) => {
    const imgS = isPurple(pin.name)
      ? `width:130%;height:130%;object-fit:cover;object-position:center 20%;display:block;margin:-15% 0 0 -15%;`
      : `width:100%;height:100%;object-fit:cover;object-position:center 20%;display:block;`

    return `
      <!-- Pin ${i + 2} -->
      <div style="position:absolute;left:${pin.x}px;top:${pin.y}px;z-index:10;opacity:0;animation:pinDrop 0.5s cubic-bezier(0.34,1.56,0.64,1) ${pin.pinT}s forwards;">
        <svg width="36" height="48" viewBox="0 0 36 48">
          <path d="M18 0C8 0 0 8 0 18c0 14 18 30 18 30s18-16 18-30C36 8 28 0 18 0z" fill="${PIN_RED}"/>
          <circle cx="18" cy="16" r="7" fill="white"/>
        </svg>
      </div>
      <!-- Pin ${i + 2} photo popup -->
      <div style="position:absolute;left:${pin.x - 60}px;top:${pin.y - 200}px;z-index:12;opacity:0;transform:scale(0.6) translateY(20px);animation:cardPopIn 0.4s cubic-bezier(0.34,1.56,0.64,1) ${pin.photoT}s forwards, cardPopOut 0.4s ease-in ${pin.photoT + 2.0}s forwards;">
        <div style="background:white;border-radius:12px;padding:6px;box-shadow:${CARD_SHADOW};width:160px;">
          <div style="width:148px;height:180px;border-radius:8px;overflow:hidden;">
            <img src="${pin.src}" style="${imgS}"/>
          </div>
          <p style="font-family:${SF};font-size:13px;font-weight:600;color:#333;margin:6px 4px 4px;text-align:center;">@${HANDLE}</p>
        </div>
        <!-- Triangle pointer -->
        <div style="width:0;height:0;border-left:10px solid transparent;border-right:10px solid transparent;border-top:10px solid white;margin:0 auto;"></div>
      </div>
    `
  }).join('')

  return `<!DOCTYPE html>
<html>
  <head>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      html, body { margin: 0; padding: 0; background: ${MAP_BG}; -webkit-font-smoothing: antialiased; }

      @keyframes searchBarIn {
        0% { opacity: 0; transform: translateY(-30px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      @keyframes typeText {
        0% { width: 0; }
        100% { width: 100%; }
      }
      @keyframes mapZoom {
        0% { transform: scale(0.6); opacity: 0.3; }
        100% { transform: scale(1); opacity: 1; }
      }
      @keyframes pinDrop {
        0% { opacity: 0; transform: translateY(-120px) scale(0.5); }
        60% { opacity: 1; transform: translateY(10px) scale(1.1); }
        80% { transform: translateY(-5px) scale(0.95); }
        100% { opacity: 1; transform: translateY(0) scale(1); }
      }
      @keyframes ripple {
        0% { transform: scale(0); opacity: 0.6; }
        100% { transform: scale(4); opacity: 0; }
      }
      @keyframes cardPopIn {
        0% { opacity: 0; transform: scale(0.6) translateY(20px); }
        100% { opacity: 1; transform: scale(1) translateY(0); }
      }
      @keyframes cardPopOut {
        0% { opacity: 1; transform: scale(1) translateY(0); }
        100% { opacity: 0; transform: scale(0.8) translateY(10px); }
      }
      @keyframes fadeIn {
        0% { opacity: 0; }
        100% { opacity: 1; }
      }
      @keyframes fadeUp {
        0% { opacity: 0; transform: translateY(16px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      @keyframes slideUp {
        0% { opacity: 0; transform: translateY(100px) scale(0.9); }
        100% { opacity: 1; transform: translateY(0) scale(1); }
      }
      @keyframes thumbScroll {
        0% { transform: translateX(0); }
        50% { transform: translateX(-120px); }
        100% { transform: translateX(0); }
      }
      @keyframes expandCard {
        0% { max-height: 420px; }
        100% { max-height: 900px; }
      }
      @keyframes narrativeIn {
        0% { opacity: 0; transform: translateY(12px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      @keyframes narrativeOut {
        0% { opacity: 1; }
        100% { opacity: 0; }
      }
      @keyframes ctaDarken {
        0% { opacity: 0; }
        100% { opacity: 1; }
      }
      @keyframes starPop {
        0% { transform: scale(0); }
        60% { transform: scale(1.3); }
        100% { transform: scale(1); }
      }
      @keyframes blinkCursor {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
      }
    </style>
  </head>
  <body>
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${MAP_BG};">

      <!-- Map background grid -->
      <div style="position:absolute;inset:0;opacity:0;animation:mapZoom 1.5s ease-out ${T.mapZoom}s forwards;">
        <svg width="${WIDTH}" height="${HEIGHT}" style="position:absolute;inset:0;">
          ${gridLines.join('\n          ')}
          <!-- Area labels like Google Maps -->
          <text x="120" y="350" fill="${MAP_GRID}" font-family="${SF}" font-size="16" font-weight="600" opacity="0.5" letter-spacing="3">INTRAMUROS</text>
          <text x="700" y="500" fill="${MAP_GRID}" font-family="${SF}" font-size="14" font-weight="600" opacity="0.4" letter-spacing="3">ERMITA</text>
          <text x="150" y="850" fill="${MAP_GRID}" font-family="${SF}" font-size="14" font-weight="600" opacity="0.4" letter-spacing="3">MALATE</text>
          <text x="680" y="180" fill="${MAP_GRID}" font-family="${SF}" font-size="13" font-weight="600" opacity="0.35" letter-spacing="3">BINONDO</text>
          <text x="350" y="1000" fill="${MAP_GRID}" font-family="${SF}" font-size="12" font-weight="600" opacity="0.3" letter-spacing="2">PACO</text>
        </svg>
      </div>

      <!-- Status bar -->
      <div style="position:absolute;left:0;right:0;top:0;height:54px;padding:14px 32px 0;display:flex;align-items:center;justify-content:space-between;z-index:30;">
        <span style="font-family:${SF};font-size:20px;font-weight:600;color:#fff;">9:41</span>
        <div style="display:flex;align-items:center;gap:6px;">
          <svg width="20" height="14" viewBox="0 0 18 12"><rect x="0" y="3" width="3" height="9" rx="1" fill="#fff"/><rect x="5" y="2" width="3" height="10" rx="1" fill="#fff"/><rect x="10" y="0" width="3" height="12" rx="1" fill="#fff"/><rect x="15" y="0" width="3" height="12" rx="1" fill="#fff" opacity="0.3"/></svg>
          <svg width="30" height="15" viewBox="0 0 27 13"><rect x="0" y="0" width="23" height="13" rx="3.5" stroke="#fff" stroke-width="1" fill="none"/><rect x="2" y="2" width="18" height="9" rx="2" fill="#fff"/></svg>
        </div>
      </div>

      <!-- Google Maps style search bar -->
      <div style="position:absolute;left:30px;right:30px;top:70px;z-index:25;opacity:0;animation:searchBarIn 0.5s ease-out ${T.searchBarIn}s forwards;">
        <div style="background:white;border-radius:28px;padding:16px 24px;display:flex;align-items:center;gap:16px;box-shadow:0 4px 20px rgba(0,0,0,0.3);">
          <!-- Search icon -->
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="#5F6368" stroke-width="2.5"/><path d="M16.5 16.5L21 21" stroke="#5F6368" stroke-width="2.5" stroke-linecap="round"/></svg>
          <!-- Typing text -->
          <div style="flex:1;overflow:hidden;position:relative;">
            <div style="overflow:hidden;white-space:nowrap;animation:typeText 1.2s steps(22) ${T.searchType}s forwards;width:0;">
              <span style="font-family:${SF};font-size:22px;color:#333;font-weight:400;">Manila, Philippines</span>
            </div>
            <div style="position:absolute;right:0;top:0;bottom:0;width:2px;background:#4285F4;animation:blinkCursor 1s infinite;"></div>
          </div>
          <!-- Mic icon -->
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="9" y="2" width="6" height="12" rx="3" fill="#4285F4"/><path d="M5 11v1a7 7 0 0014 0v-1" stroke="#4285F4" stroke-width="2" stroke-linecap="round"/><path d="M12 19v3M8 22h8" stroke="#4285F4" stroke-width="2" stroke-linecap="round"/></svg>
        </div>
      </div>

      <!-- Main pin (center) -->
      <div style="position:absolute;left:${WIDTH / 2 - 25}px;top:480px;z-index:15;opacity:0;animation:pinDrop 0.6s cubic-bezier(0.34,1.56,0.64,1) ${T.mainPinDrop}s forwards;">
        <svg width="50" height="66" viewBox="0 0 36 48">
          <path d="M18 0C8 0 0 8 0 18c0 14 18 30 18 30s18-16 18-30C36 8 28 0 18 0z" fill="${PIN_RED}"/>
          <circle cx="18" cy="16" r="7" fill="white"/>
        </svg>
      </div>

      <!-- Ripple animation from pin drop -->
      <div style="position:absolute;left:${WIDTH / 2 - 40}px;top:530px;z-index:14;">
        <div style="width:80px;height:40px;border-radius:50%;border:3px solid ${PIN_RED};opacity:0;animation:ripple 1s ease-out ${T.ripple}s forwards;"></div>
        <div style="position:absolute;inset:0;width:80px;height:40px;border-radius:50%;border:2px solid ${PIN_RED};opacity:0;animation:ripple 1s ease-out ${T.ripple + 0.2}s forwards;"></div>
        <div style="position:absolute;inset:0;width:80px;height:40px;border-radius:50%;border:1px solid ${PIN_RED};opacity:0;animation:ripple 1s ease-out ${T.ripple + 0.4}s forwards;"></div>
      </div>

      <!-- Google Maps info card -->
      <div style="position:absolute;left:40px;right:40px;top:570px;z-index:20;opacity:0;animation:slideUp 0.5s cubic-bezier(0.16,1,0.3,1) ${T.infoCardIn}s forwards;">
        <div style="background:${CARD_BG};border-radius:16px;overflow:hidden;box-shadow:${CARD_SHADOW};">

          <!-- Card header -->
          <div style="padding:22px 24px 0;">
            <p style="font-family:${SF};font-size:30px;font-weight:700;color:#202124;margin:0;">Manila Model Search</p>
            <!-- Stars row -->
            <div style="display:flex;align-items:center;gap:6px;margin-top:8px;opacity:0;animation:fadeIn 0.3s ease-out ${T.starsIn}s forwards;">
              <div style="display:flex;gap:2px;">
                ${Array(5).fill(null).map((_, i) =>
                  `<span style="color:${STAR_GOLD};font-size:22px;opacity:0;animation:starPop 0.25s cubic-bezier(0.34,1.56,0.64,1) ${T.starsIn + i * 0.1}s forwards;">&#9733;</span>`
                ).join('')}
              </div>
              <span style="font-family:${SF};font-size:18px;color:#70757A;margin-left:4px;">5.0 (127 reviews)</span>
            </div>
            <p style="font-family:${SF};font-size:18px;color:#70757A;margin:6px 0 0;">Photography Experience</p>
          </div>

          <!-- Google Maps action buttons row -->
          <div style="display:flex;justify-content:space-around;padding:18px 24px 14px;border-bottom:1px solid #E8EAED;opacity:0;animation:fadeIn 0.3s ease-out ${T.starsIn + 0.3}s forwards;">
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px;">
              <div style="width:44px;height:44px;border-radius:50%;background:#E8F0FE;display:flex;align-items:center;justify-content:center;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#1A73E8"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/></svg>
              </div>
              <span style="font-family:${SF};font-size:14px;color:#1A73E8;font-weight:500;">Directions</span>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px;">
              <div style="width:44px;height:44px;border-radius:50%;background:#E8F0FE;display:flex;align-items:center;justify-content:center;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#1A73E8"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/></svg>
              </div>
              <span style="font-family:${SF};font-size:14px;color:#1A73E8;font-weight:500;">Sign Up</span>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px;">
              <div style="width:44px;height:44px;border-radius:50%;background:#E8F0FE;display:flex;align-items:center;justify-content:center;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#1A73E8"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg>
              </div>
              <span style="font-family:${SF};font-size:14px;color:#1A73E8;font-weight:500;">Share</span>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px;">
              <div style="width:44px;height:44px;border-radius:50%;background:#E8F0FE;display:flex;align-items:center;justify-content:center;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#1A73E8"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/></svg>
              </div>
              <span style="font-family:${SF};font-size:14px;color:#1A73E8;font-weight:500;">Save</span>
            </div>
          </div>

          <!-- Photo thumbnails row -->
          <div style="padding:14px 0;overflow:hidden;opacity:0;animation:fadeIn 0.4s ease-out ${T.thumbRowIn}s forwards;">
            <p style="font-family:${SF};font-size:16px;font-weight:600;color:#202124;margin:0 0 10px 24px;">Photos</p>
            <div style="display:flex;gap:8px;padding:0 24px;animation:thumbScroll 6s ease-in-out ${T.thumbRowIn + 0.5}s infinite;">
              ${thumbHTML}
            </div>
          </div>

          <!-- Expanded photo grid (appears later) -->
          <div style="padding:0 16px 16px;overflow:hidden;max-height:0;opacity:0;animation:expandCard 0.6s ease-out ${T.cardExpand}s forwards, fadeIn 0.4s ease-out ${T.gridIn}s forwards;">
            <div style="display:flex;flex-wrap:wrap;gap:8px;">
              ${gridHTML}
            </div>
          </div>

        </div>
      </div>

      <!-- Secondary pins with photo popups -->
      ${pinsHTML}

      <!-- Narrative text: "looking for models in Manila" — appears when main pin drops -->
      <div style="position:absolute;left:0;right:0;top:380px;z-index:18;text-align:center;pointer-events:none;opacity:0;animation:narrativeIn 0.5s ease-out ${T.mainPinDrop + 0.2}s forwards, narrativeOut 0.4s ease-in ${T.infoCardIn - 0.1}s forwards;">
        <p style="font-family:${SF};font-size:60px;font-weight:800;color:#fff;text-shadow:0 3px 20px rgba(0,0,0,0.7),0 1px 4px rgba(0,0,0,0.9);margin:0;line-height:1.15;">looking for<br>models in Manila</p>
      </div>

      <!-- Narrative text: "no experience needed" — appears when secondary pins start -->
      <div style="position:absolute;left:0;right:0;top:320px;z-index:18;text-align:center;pointer-events:none;opacity:0;animation:narrativeIn 0.5s ease-out ${T.pin2 + 0.3}s forwards, narrativeOut 0.4s ease-in ${T.pin3 + 0.2}s forwards;">
        <p style="font-family:${SF};font-size:58px;font-weight:800;color:#fff;text-shadow:0 3px 20px rgba(0,0,0,0.7),0 1px 4px rgba(0,0,0,0.9);margin:0;">no experience needed</p>
      </div>

      <!-- Narrative text: "I direct everything" — appears after -->
      <div style="position:absolute;left:0;right:0;top:320px;z-index:18;text-align:center;pointer-events:none;opacity:0;animation:narrativeIn 0.5s ease-out ${T.pin3 + 0.8}s forwards, narrativeOut 0.4s ease-in ${T.pin5 + 0.3}s forwards;">
        <p style="font-family:${SF};font-size:58px;font-weight:800;color:#fff;text-shadow:0 3px 20px rgba(0,0,0,0.7),0 1px 4px rgba(0,0,0,0.9);margin:0;">I direct everything</p>
      </div>

      <!-- Narrative text: "these are the photos" — appears when card expands with grid -->
      <div style="position:absolute;left:0;right:0;top:420px;z-index:22;text-align:center;pointer-events:none;opacity:0;animation:narrativeIn 0.5s ease-out ${T.cardExpand + 0.3}s forwards, narrativeOut 0.4s ease-in ${T.ctaIn - 0.2}s forwards;">
        <p style="font-family:${SF};font-size:56px;font-weight:800;color:#fff;text-shadow:0 3px 20px rgba(0,0,0,0.7),0 1px 4px rgba(0,0,0,0.9);margin:0;">these are the photos</p>
      </div>

      <!-- Natural CTA: darken overlay + sign up below text -->
      <div style="position:absolute;inset:0;z-index:35;pointer-events:none;opacity:0;animation:ctaDarken 0.8s ease-out ${T.ctaIn}s forwards;">
        <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.55) 40%, rgba(0,0,0,0.75) 70%, rgba(0,0,0,0.85) 100%);"></div>
        <div style="position:absolute;left:0;right:0;top:50%;transform:translateY(-50%);text-align:center;padding:0 60px;">
          <p style="font-family:${SF};font-size:72px;font-weight:900;color:${MANILA_COLOR};margin:0;text-shadow:0 4px 30px rgba(232,68,58,0.4),0 2px 8px rgba(0,0,0,0.6);line-height:1.15;">sign up below</p>
          <div style="width:60px;height:3px;background:${MANILA_COLOR};margin:28px auto;opacity:0.7;"></div>
          <p style="font-family:${SF};font-size:30px;font-weight:500;color:rgba(255,255,255,0.9);margin:0 0 10px;letter-spacing:0.02em;">60-second form</p>
          <p style="font-family:${SF};font-size:26px;font-weight:400;color:rgba(255,255,255,0.6);margin:0;letter-spacing:0.02em;">limited spots this month</p>
        </div>
      </div>

    </div>
  </body>
</html>`
}


async function render() {
  resetOutputDir()

  const selection = {
    // Info card thumbs
    thumb1: 'manila-gallery-purple-001.jpg',
    thumb2: 'manila-gallery-garden-001.jpg',
    thumb3: 'manila-gallery-purple-002.jpg',
    thumb4: 'manila-gallery-graffiti-001.jpg',
    thumb5: 'manila-gallery-purple-003.jpg',
    thumb6: 'manila-gallery-urban-001.jpg',
    // Expanded grid
    grid1: 'manila-gallery-purple-001.jpg',
    grid2: 'manila-gallery-garden-001.jpg',
    grid3: 'manila-gallery-dsc-0075.jpg',
    grid4: 'manila-gallery-purple-004.jpg',
    grid5: 'manila-gallery-ivy-001.jpg',
    grid6: 'manila-gallery-purple-005.jpg',
    // Secondary pin popups
    pin2photo: 'manila-gallery-purple-002.jpg',
    pin3photo: 'manila-gallery-graffiti-001.jpg',
    pin4photo: 'manila-gallery-purple-003.jpg',
    pin5photo: 'manila-gallery-garden-002.jpg',
  }

  writeSources({
    createdAt: new Date().toISOString(),
    strategy: 'v52 — Google Maps Manila pin drop animated ad',
    safeBottomPixels: SAFE_BOTTOM,
    images: selection
  })

  // Build images map with base64 data, and attach _*Name keys for purple detection
  const images = {}
  for (const [key, file] of Object.entries(selection)) {
    images[key] = readImage(file)
    images[`_${key}Name`] = file
  }

  const { execSync } = await import('child_process')
  const browser = await chromium.launch()

  // --- Step 1: Record the map animation video ---
  console.log('Recording Google Maps pin drop animation...')

  const videoCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: OUT_DIR,
      size: { width: WIDTH, height: HEIGHT }
    }
  })

  const videoPage = await videoCtx.newPage()
  await videoPage.setContent(buildMapAnimation(images), { waitUntil: 'load' })
  await videoPage.waitForTimeout(500)
  await videoPage.waitForTimeout(TOTAL_DURATION_MS)
  await videoPage.close()
  await videoCtx.close()

  await browser.close()

  // --- Step 2: Convert webm to mp4 ---
  const videoFiles = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.webm'))
  if (videoFiles.length === 0) {
    console.error('No video file was generated!')
    return
  }

  const srcVideo = path.join(OUT_DIR, videoFiles[0])
  const finalMp4 = path.join(OUT_DIR, '01_google_maps_manila.mp4')

  try {
    execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${finalMp4}"`, { stdio: 'pipe' })
    fs.unlinkSync(srcVideo)
    console.log('Rendered 01_google_maps_manila.mp4')
  } catch (err) {
    console.error('ffmpeg error:', err.message)
    fs.renameSync(srcVideo, finalMp4)
  }

  console.log(`Done: output written to ${OUT_DIR}`)
}

render().catch(error => {
  console.error(error)
  process.exit(1)
})
