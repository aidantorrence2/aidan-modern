import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v40')

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 410

const SF = "-apple-system, 'Helvetica Neue', Arial, sans-serif"

// IG dark mode colors (matching reference screenshots)
const IG_BLACK = '#000000'
const IG_DARK_BG = '#000000'
const IG_DARK_CARD = '#262626'
const IG_DARK_BORDER = '#363636'
const IG_WHITE = '#FAFAFA'
const IG_GRAY = '#A8A8A8'
const IG_BLUE = '#0095F6'
const IG_DM_SENT = 'linear-gradient(90deg, #6C5CE7, #A855F7, #3B82F6)' // purple-blue gradient for sent
const IG_DM_RECEIVED = '#262626'
const MANILA_COLOR = '#E8443A'

const HANDLE = 'madebyaidan'

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

function getTopManilaImages(count = 28) {
  return fs.readdirSync(IMAGE_DIR)
    .filter(file => file.startsWith('manila') && /\.(jpg|jpeg|png|webp)$/i.test(file))
    .sort((a, b) => a.localeCompare(b))
    .slice(0, count)
}

function readImage(name) {
  const filePath = path.join(IMAGE_DIR, name)
  const buf = fs.readFileSync(filePath)
  return `data:${imageMime(name)};base64,${buf.toString('base64')}`
}

function writeSources(selected) {
  const payload = {
    createdAt: new Date().toISOString(),
    strategy: 'v40 — Pixel-accurate IG UI: frosted lock screen notifs, dark mode grid, purple gradient DMs',
    safeBottomPixels: SAFE_BOTTOM,
    images: selected
  }
  fs.writeFileSync(path.join(OUT_DIR, 'sources.json'), JSON.stringify(payload, null, 2))
}

function wrap(html, bg = IG_BLACK) {
  return `<!DOCTYPE html>
  <html>
    <head>
      <style>
        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; background: ${bg}; }
      </style>
    </head>
    <body>${html}</body>
  </html>`
}

// IG app icon (gradient square with camera outline)
function igAppIcon(size = 36) {
  return `<div style="width:${size}px;height:${size}px;border-radius:${Math.round(size * 0.22)}px;background:linear-gradient(135deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
    <svg width="${Math.round(size * 0.6)}" height="${Math.round(size * 0.6)}" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="5" stroke="white" stroke-width="2"/>
      <circle cx="12" cy="12" r="5" stroke="white" stroke-width="2"/>
      <circle cx="18" cy="6" r="1.5" fill="white"/>
    </svg>
  </div>`
}

// White status bar for lock screen
function statusBarWhite() {
  return `
    <div style="position:absolute;left:0;right:0;top:0;height:54px;padding:14px 32px 0;display:flex;align-items:center;justify-content:space-between;z-index:10;">
      <span style="font-family:${SF};font-size:17px;font-weight:600;color:#fff;">9:41</span>
      <div style="display:flex;align-items:center;gap:6px;">
        <svg width="18" height="12" viewBox="0 0 18 12"><rect x="0" y="3" width="3" height="9" rx="1" fill="#fff"/><rect x="5" y="2" width="3" height="10" rx="1" fill="#fff"/><rect x="10" y="0" width="3" height="12" rx="1" fill="#fff"/><rect x="15" y="0" width="3" height="12" rx="1" fill="#fff" opacity="0.3"/></svg>
        <svg width="17" height="12" viewBox="0 0 17 12"><path d="M8.5 2.5C6.2 2.5 4.1 3.4 2.6 4.9L1 3.3C2.9 1.4 5.5 0.2 8.5 0.2S14.1 1.4 16 3.3L14.4 4.9C12.9 3.4 10.8 2.5 8.5 2.5Z" fill="#fff"/><path d="M8.5 6.5C7.2 6.5 6 7 5.1 7.9L3.5 6.3C4.8 5 6.6 4.2 8.5 4.2S12.2 5 13.5 6.3L11.9 7.9C11 7 9.8 6.5 8.5 6.5Z" fill="#fff"/><circle cx="8.5" cy="11" r="1.5" fill="#fff"/></svg>
        <svg width="27" height="13" viewBox="0 0 27 13"><rect x="0" y="0" width="23" height="13" rx="3.5" stroke="#fff" stroke-width="1" fill="none"/><rect x="2" y="2" width="18" height="9" rx="2" fill="#fff"/><rect x="24.5" y="4" width="2.5" height="5" rx="1" fill="#fff" opacity="0.4"/></svg>
      </div>
    </div>
  `
}

// ── Slide 1: iOS Lock Screen Notifications (frosted glass pills) ──
function slideOne(images) {
  // Each notification is a frosted glass pill with: IG icon | username bold + message | time
  function notifPill(username, message, time, topPx) {
    return `
      <div style="position:absolute;left:36px;right:36px;top:${topPx}px;background:rgba(60,60,60,0.55);backdrop-filter:blur(40px);-webkit-backdrop-filter:blur(40px);border-radius:18px;padding:14px 16px;display:flex;align-items:center;gap:12px;">
        ${igAppIcon(42)}
        <div style="flex:1;min-width:0;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:3px;">
            <span style="font-family:${SF};font-size:16px;font-weight:600;color:#fff;">${username}</span>
            <span style="font-family:${SF};font-size:14px;color:rgba(255,255,255,0.5);flex-shrink:0;margin-left:8px;">${time}</span>
          </div>
          <p style="font-family:${SF};font-size:16px;color:rgba(255,255,255,0.85);margin:0;line-height:1.35;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">${message}</p>
        </div>
      </div>
    `
  }

  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#000;">
      <!-- Lock screen wallpaper (blurred dark photo) -->
      <img src="${images.hero}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:blur(20px) brightness(0.4) saturate(1.2);transform:scale(1.15);"/>

      ${statusBarWhite()}

      <!-- Time -->
      <div style="position:absolute;left:0;right:0;top:140px;text-align:center;">
        <p style="font-family:${SF};font-size:96px;font-weight:200;color:#fff;margin:0;letter-spacing:-2px;">9:41</p>
        <p style="font-family:${SF};font-size:22px;font-weight:400;color:rgba(255,255,255,0.65);margin:6px 0 0;">Monday, March 11</p>
      </div>

      <!-- MANILA -->
      <div style="position:absolute;left:0;right:0;top:370px;text-align:center;">
        <p style="font-family:${SF};font-size:88px;font-weight:900;letter-spacing:0.06em;color:${MANILA_COLOR};margin:0;text-transform:uppercase;text-shadow:0 2px 30px rgba(232,68,58,0.5);">MANILA</p>
        <p style="font-family:${SF};font-size:26px;font-weight:500;color:rgba(255,255,255,0.75);margin:8px 0 0;">Model Search</p>
      </div>

      <!-- "Instagram" group header -->
      <div style="position:absolute;left:36px;right:36px;top:538px;display:flex;align-items:center;justify-content:space-between;">
        <span style="font-family:${SF};font-size:20px;font-weight:700;color:#fff;">Instagram</span>
        <div style="display:flex;align-items:center;gap:12px;">
          <span style="font-family:${SF};font-size:15px;color:rgba(255,255,255,0.45);">Show less</span>
          <div style="width:28px;height:28px;border-radius:50%;background:rgba(120,120,120,0.4);display:flex;align-items:center;justify-content:center;">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><line x1="2" y1="2" x2="10" y2="10" stroke="rgba(255,255,255,0.6)" stroke-width="2" stroke-linecap="round"/><line x1="10" y1="2" x2="2" y2="10" stroke="rgba(255,255,255,0.6)" stroke-width="2" stroke-linecap="round"/></svg>
          </div>
        </div>
      </div>

      <!-- Notification pills (frosted glass, stacked) -->
      ${notifPill(HANDLE, 'hey! want to do a portrait shoot in Manila? I\'m looking for models right now', 'now', 590)}
      ${notifPill(HANDLE, 'no experience needed at all. I direct the entire shoot and you get all the edited photos', 'now', 710)}
      ${notifPill(HANDLE, 'sign up from the link below, it takes like 60 seconds. I\'ll message you back to plan everything', '1m ago', 830)}

      <!-- Bottom: flashlight + camera icons -->
      <div style="position:absolute;left:0;right:0;bottom:${SAFE_BOTTOM + 60}px;display:flex;justify-content:space-between;padding:0 100px;">
        <div style="width:52px;height:52px;border-radius:50%;background:rgba(120,120,120,0.35);display:flex;align-items:center;justify-content:center;">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M9 18h6M10 22h4M12 2v1M4.22 4.22l.7.7M1 12h1M4.22 19.78l.7-.7M20.49 4.93l-.7.7M23 12h-1M19.78 19.78l-.7-.7" stroke="#fff" stroke-width="2" stroke-linecap="round"/><path d="M15 9a3 3 0 11-6 0 3 3 0 016 0z" stroke="#fff" stroke-width="2"/></svg>
        </div>
        <div style="width:52px;height:52px;border-radius:50%;background:rgba(120,120,120,0.35);display:flex;align-items:center;justify-content:center;">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="#fff" stroke-width="2"/><circle cx="12" cy="13" r="4" stroke="#fff" stroke-width="2"/></svg>
        </div>
      </div>

      <!-- Home indicator -->
      <div style="position:absolute;left:50%;bottom:${SAFE_BOTTOM + 10}px;transform:translateX(-50%);width:160px;height:5px;border-radius:3px;background:rgba(255,255,255,0.3);"></div>
    </div>
  `
}

// ── Slide 2: IG Profile Page — Dark Mode, Square Grid ──
function slideTwoAnimated(images) {
  const gridImages = [
    images.gridA, images.gridB, images.gridC,
    images.gridD, images.gridE, images.gridF,
    images.gridG, images.gridH, images.gridI,
    images.gridJ, images.gridK, images.gridL,
  ]

  // Square cells, 2px gap (matching real IG grid)
  const GAP = 2
  const CELL = Math.floor((WIDTH - GAP * 2) / 3)
  const GRID_TOP = 520

  let gridHtml = ''
  for (let i = 0; i < 12; i++) {
    const row = Math.floor(i / 3)
    const col = i % 3
    const x = col * (CELL + GAP)
    const y = GRID_TOP + row * (CELL + GAP)
    const delay = 0.3 + i * 0.15

    gridHtml += `<div class="grid-cell" style="position:absolute;left:${x}px;top:${y}px;width:${CELL}px;height:${CELL}px;overflow:hidden;opacity:0;transform:scale(0.94);animation:cellReveal 0.3s ease-out ${delay}s forwards;">
      <img src="${gridImages[i]}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center 20%;"/>
    </div>`
  }

  return `<!DOCTYPE html>
  <html>
    <head>
      <style>
        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; background: ${IG_BLACK}; }
        @keyframes cellReveal {
          0% { opacity: 0; transform: scale(0.94); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes slideDown {
          0% { opacity: 0; transform: translateY(-10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .header-anim { opacity: 0; animation: slideDown 0.3s ease-out 0s forwards; }
        .profile-anim { opacity: 0; animation: fadeIn 0.25s ease-out 0.15s forwards; }
      </style>
    </head>
    <body>
      <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${IG_BLACK};">
        <!-- Status bar (white text on black) -->
        ${statusBarWhite()}

        <!-- Nav bar: back arrow + "madebyaidan" bold + menu -->
        <div class="header-anim" style="position:absolute;left:0;right:0;top:54px;height:48px;padding:0 16px;display:flex;align-items:center;justify-content:space-between;">
          <div style="display:flex;align-items:center;gap:8px;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <span style="font-family:${SF};font-size:24px;font-weight:700;color:#fff;">${HANDLE}</span>
          </div>
          <div style="display:flex;align-items:center;gap:22px;">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="3" stroke="#fff" stroke-width="2" fill="none"/><line x1="12" y1="7" x2="12" y2="17" stroke="#fff" stroke-width="2" stroke-linecap="round"/><line x1="7" y1="12" x2="17" y2="12" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><line x1="4" y1="6" x2="20" y2="6" stroke="#fff" stroke-width="2" stroke-linecap="round"/><line x1="4" y1="12" x2="20" y2="12" stroke="#fff" stroke-width="2" stroke-linecap="round"/><line x1="4" y1="18" x2="20" y2="18" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>
          </div>
        </div>

        <!-- Story highlights row -->
        <div class="profile-anim" style="position:absolute;left:0;right:0;top:110px;padding:16px 16px 12px;display:flex;gap:16px;overflow:hidden;">
          <div style="text-align:center;width:76px;flex-shrink:0;">
            <div style="width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,#feda75,#fa7e1e,#d62976,#962fbf);padding:3px;margin:0 auto;">
              <div style="width:100%;height:100%;border-radius:50%;border:3px solid ${IG_BLACK};overflow:hidden;">
                <img src="${images.profilePic}" style="width:100%;height:100%;object-fit:cover;"/>
              </div>
            </div>
            <p style="font-family:${SF};font-size:12px;color:${IG_WHITE};margin:5px 0 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">shoots</p>
          </div>
          <div style="text-align:center;width:76px;flex-shrink:0;">
            <div style="width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,#feda75,#fa7e1e,#d62976,#962fbf);padding:3px;margin:0 auto;">
              <div style="width:100%;height:100%;border-radius:50%;border:3px solid ${IG_BLACK};overflow:hidden;">
                <img src="${images.gridA}" style="width:100%;height:100%;object-fit:cover;"/>
              </div>
            </div>
            <p style="font-family:${SF};font-size:12px;color:${IG_WHITE};margin:5px 0 0;">manila</p>
          </div>
          <div style="text-align:center;width:76px;flex-shrink:0;">
            <div style="width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,#feda75,#fa7e1e,#d62976,#962fbf);padding:3px;margin:0 auto;">
              <div style="width:100%;height:100%;border-radius:50%;border:3px solid ${IG_BLACK};overflow:hidden;">
                <img src="${images.gridD}" style="width:100%;height:100%;object-fit:cover;"/>
              </div>
            </div>
            <p style="font-family:${SF};font-size:12px;color:${IG_WHITE};margin:5px 0 0;">reviews</p>
          </div>
          <div style="text-align:center;width:76px;flex-shrink:0;">
            <div style="width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,#feda75,#fa7e1e,#d62976,#962fbf);padding:3px;margin:0 auto;">
              <div style="width:100%;height:100%;border-radius:50%;border:3px solid ${IG_BLACK};overflow:hidden;">
                <img src="${images.gridF}" style="width:100%;height:100%;object-fit:cover;"/>
              </div>
            </div>
            <p style="font-family:${SF};font-size:12px;color:${IG_WHITE};margin:5px 0 0;">bts</p>
          </div>
        </div>

        <!-- Tab bar: Grid | Reels | Sparkle | Tagged -->
        <div class="profile-anim" style="position:absolute;left:0;right:0;top:${GRID_TOP - 54}px;display:flex;border-bottom:1px solid ${IG_DARK_BORDER};">
          <div style="flex:1;padding:14px 0;text-align:center;border-bottom:1px solid #fff;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" stroke="#fff" stroke-width="1.5"/><rect x="14" y="3" width="7" height="7" stroke="#fff" stroke-width="1.5"/><rect x="3" y="14" width="7" height="7" stroke="#fff" stroke-width="1.5"/><rect x="14" y="14" width="7" height="7" stroke="#fff" stroke-width="1.5"/></svg>
          </div>
          <div style="flex:1;padding:14px 0;text-align:center;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><polygon points="5,3 19,12 5,21" stroke="${IG_GRAY}" stroke-width="1.5" fill="none"/></svg>
          </div>
          <div style="flex:1;padding:14px 0;text-align:center;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6L12 2z" stroke="${IG_GRAY}" stroke-width="1.5" fill="none"/></svg>
          </div>
          <div style="flex:1;padding:14px 0;text-align:center;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="${IG_GRAY}" stroke-width="1.5"/><path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="${IG_GRAY}" stroke-width="1.5" fill="none"/></svg>
          </div>
        </div>

        <!-- Square Grid (12 images, 4 rows x 3 cols, 2px gap) -->
        ${gridHtml}

        <!-- MANILA watermark -->
        <div style="position:absolute;left:0;right:0;bottom:${SAFE_BOTTOM + 10}px;text-align:center;pointer-events:none;">
          <p style="font-family:${SF};font-size:82px;font-weight:900;letter-spacing:0.06em;color:${MANILA_COLOR};margin:0;text-transform:uppercase;text-shadow:0 2px 20px rgba(232,68,58,0.4);">MANILA</p>
        </div>
      </div>
    </body>
  </html>`
}

// ── Slide 3: IG Post (dark mode) ──
function slideThree(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${IG_BLACK};">
      ${statusBarWhite()}

      <!-- MANILA at top -->
      <div style="position:absolute;left:0;right:0;top:58px;text-align:center;">
        <p style="font-family:${SF};font-size:82px;font-weight:900;letter-spacing:0.06em;color:${MANILA_COLOR};margin:0;text-transform:uppercase;">MANILA</p>
      </div>

      <!-- Post header -->
      <div style="position:absolute;left:0;right:0;top:170px;padding:0 16px;display:flex;align-items:center;gap:12px;">
        <div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#feda75,#fa7e1e,#d62976,#962fbf);padding:2.5px;">
          <div style="width:100%;height:100%;border-radius:50%;border:2px solid ${IG_BLACK};overflow:hidden;">
            <img src="${images.profilePic}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
        </div>
        <div style="flex:1;">
          <p style="font-family:${SF};font-size:15px;font-weight:600;color:#fff;margin:0;">${HANDLE}</p>
          <p style="font-family:${SF};font-size:13px;color:${IG_GRAY};margin:2px 0 0;">Manila, Philippines</p>
        </div>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
      </div>

      <!-- Post image -->
      <div style="position:absolute;left:0;right:0;top:230px;height:680px;overflow:hidden;">
        <img src="${images.process}" style="width:100%;height:100%;object-fit:cover;object-position:center 15%;"/>
      </div>

      <!-- Post action icons -->
      <div style="position:absolute;left:0;right:0;top:918px;padding:12px 16px;display:flex;align-items:center;">
        <div style="display:flex;gap:18px;flex:1;">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><line x1="22" y1="2" x2="11" y2="13" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polygon points="22 2 15 22 11 13 2 9 22 2" stroke="#fff" stroke-width="2" fill="none"/></svg>
        </div>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>

      <!-- Likes -->
      <div style="position:absolute;left:16px;right:16px;top:966px;">
        <p style="font-family:${SF};font-size:15px;font-weight:600;color:#fff;margin:0;">2,847 likes</p>
      </div>

      <!-- Caption -->
      <div style="position:absolute;left:16px;right:16px;top:994px;">
        <p style="font-family:${SF};font-size:15px;color:#fff;margin:0;line-height:1.5;">
          <b>${HANDLE}</b> <span style="color:${MANILA_COLOR};font-weight:700;">MANILA MODEL SEARCH</span> — here's how it works:<br/><br/>
          <b>1.</b> Sign up (60-second form)<br/>
          <b>2.</b> We plan the shoot together<br/>
          <b>3.</b> Show up — I direct you the entire time<br/>
          <b>4.</b> Get your edited photos within a week<br/><br/>
          No experience needed. Link in bio.<br/>
          <span style="color:#E0F1FF;">#manilamodelsearch #portraitphotography #manila #models</span>
        </p>
      </div>

      <!-- View all comments -->
      <div style="position:absolute;left:16px;right:16px;top:1320px;">
        <p style="font-family:${SF};font-size:15px;color:${IG_GRAY};margin:0;">View all 43 comments</p>
        <p style="font-family:${SF};font-size:12px;color:${IG_GRAY};margin:8px 0 0;text-transform:uppercase;">2 hours ago</p>
      </div>
    </div>
  `
}

// ── Slide 4: IG DM Thread — Dark Mode with Purple Gradient Sent Bubbles ──
function slideFour(images) {
  // Received message (dark gray, left aligned with small avatar)
  function received(text, showAvatar = true) {
    return `
      <div style="display:flex;align-items:flex-end;gap:8px;margin-bottom:4px;">
        <div style="width:24px;height:24px;border-radius:50%;overflow:hidden;flex-shrink:0;${showAvatar ? '' : 'visibility:hidden;'}">
          <img src="${images.profilePic}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="max-width:72%;background:${IG_DM_RECEIVED};border-radius:20px 20px 20px 4px;padding:12px 16px;">
          <p style="font-family:${SF};font-size:16px;color:#fff;margin:0;line-height:1.4;">${text}</p>
        </div>
      </div>
    `
  }

  // Sent message (purple/blue gradient, right aligned)
  function sent(text) {
    return `
      <div style="display:flex;justify-content:flex-end;margin-bottom:4px;">
        <div style="max-width:72%;background:${IG_DM_SENT};border-radius:20px 20px 4px 20px;padding:12px 16px;">
          <p style="font-family:${SF};font-size:16px;color:#fff;margin:0;line-height:1.4;">${text}</p>
        </div>
      </div>
    `
  }

  // Inline photo share
  function photoMsg(src, showAvatar = false) {
    return `
      <div style="display:flex;align-items:flex-end;gap:8px;margin-bottom:4px;">
        <div style="width:24px;height:24px;flex-shrink:0;${showAvatar ? 'border-radius:50%;overflow:hidden;' : 'visibility:hidden;'}">
          ${showAvatar ? `<img src="${images.profilePic}" style="width:100%;height:100%;object-fit:cover;"/>` : ''}
        </div>
        <div style="width:260px;height:340px;border-radius:18px;overflow:hidden;">
          <img src="${src}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center 20%;"/>
        </div>
      </div>
    `
  }

  // Emoji reaction under a message
  function reaction(emoji, count) {
    return `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;margin-left:36px;">
        <div style="background:${IG_DM_RECEIVED};border-radius:16px;padding:4px 10px;display:flex;align-items:center;gap:4px;">
          <span style="font-size:16px;">${emoji}</span>
          <span style="font-family:${SF};font-size:13px;color:${IG_GRAY};">${count}</span>
        </div>
      </div>
    `
  }

  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${IG_BLACK};">
      ${statusBarWhite()}

      <!-- DM header -->
      <div style="position:absolute;left:0;right:0;top:54px;height:52px;padding:0 16px;display:flex;align-items:center;gap:12px;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <div style="width:32px;height:32px;border-radius:50%;overflow:hidden;flex-shrink:0;">
          <img src="${images.profilePic}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="flex:1;">
          <p style="font-family:${SF};font-size:16px;font-weight:600;color:#fff;margin:0;">${HANDLE}</p>
        </div>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M15.05 5A5 5 0 0119 8.95M15.05 1A9 9 0 0123 8.94M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M23 7l-7 5 7 5V7z" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><rect x="1" y="5" width="15" height="14" rx="2" stroke="#fff" stroke-width="2"/></svg>
      </div>

      <!-- MANILA -->
      <div style="position:absolute;left:0;right:0;top:120px;text-align:center;">
        <p style="font-family:${SF};font-size:82px;font-weight:900;letter-spacing:0.06em;color:${MANILA_COLOR};margin:0;text-transform:uppercase;">MANILA</p>
      </div>

      <!-- Messages -->
      <div style="position:absolute;left:0;right:0;top:240px;padding:0 16px;">
        ${received('hey! I\'m doing a model search in Manila. would you want to shoot?')}
        ${sent('omg yes!! but I\'ve never modeled before, is that ok?')}
        ${received('totally fine! I direct the whole shoot. here\'s what I shot last week:', true)}
        ${photoMsg(images.dmPhotoA)}
        ${reaction('😍', 1)}
        ${sent('wait these are incredible')}
        ${sent('how do I sign up??')}
        ${received('sign up below! it\'s a 60 second form. I\'ll message you back to plan everything', true)}
        ${photoMsg(images.dmPhotoB)}
        ${reaction('🔥', 2)}
      </div>

      <!-- DM input bar -->
      <div style="position:absolute;left:0;right:0;bottom:${SAFE_BOTTOM}px;padding:10px 16px;display:flex;align-items:center;gap:10px;">
        <div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#405DE6,#5B51D8,#833AB4);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="white" stroke-width="2.5" stroke-linecap="round"/></svg>
        </div>
        <div style="flex:1;padding:10px 16px;border:1px solid ${IG_DARK_BORDER};border-radius:22px;">
          <span style="font-family:${SF};font-size:16px;color:${IG_GRAY};">Message...</span>
        </div>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#fff" stroke-width="1.5"/><path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/><circle cx="9" cy="10" r="1" fill="#fff"/><circle cx="15" cy="10" r="1" fill="#fff"/></svg>
      </div>
    </div>
  `
}

async function render() {
  resetOutputDir()

  const all = getTopManilaImages()
  const selection = {
    hero: 'manila-gallery-canal-001.jpg',
    profilePic: 'manila-gallery-closeup-001.jpg',
    gridA: 'manila-gallery-garden-002.jpg',
    gridB: 'manila-gallery-dsc-0911.jpg',
    gridC: 'manila-gallery-night-003.jpg',
    gridD: 'manila-gallery-canal-002.jpg',
    gridE: 'manila-gallery-graffiti-001.jpg',
    gridF: 'manila-gallery-urban-001.jpg',
    gridG: 'manila-gallery-ivy-001.jpg',
    gridH: 'manila-gallery-shadow-001.jpg',
    gridI: 'manila-gallery-tropical-001.jpg',
    gridJ: 'manila-gallery-dsc-0075.jpg',
    gridK: 'manila-gallery-floor-001.jpg',
    gridL: 'manila-gallery-dsc-0190.jpg',
    process: 'manila-gallery-dsc-0190.jpg',
    dmPhotoA: 'manila-gallery-dsc-0075.jpg',
    dmPhotoB: 'manila-gallery-floor-001.jpg',
  }

  writeSources({ all_considered: all, selected: selection })

  const images = Object.fromEntries(
    Object.entries(selection).map(([key, file]) => [key, readImage(file)])
  )

  // --- Render static slides ---
  const staticSlides = [
    ['01_ig_lockscreen_story.png', wrap(slideOne(images), '#000')],
    ['03_ig_post_story.png', wrap(slideThree(images), '#000')],
    ['04_ig_dm_story.png', wrap(slideFour(images), '#000')]
  ]

  const browser = await chromium.launch()
  const staticCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1
  })

  for (const [filename, html] of staticSlides) {
    const page = await staticCtx.newPage()
    await page.setContent(html, { waitUntil: 'load' })
    await page.waitForTimeout(200)
    await page.screenshot({ path: path.join(OUT_DIR, filename), type: 'png' })
    await page.close()
    console.log(`Rendered ${filename}`)
  }
  await staticCtx.close()

  // --- Render slide 2 as animated MP4 ---
  console.log('Recording animated profile grid as MP4...')

  const TOTAL_DURATION_MS = 5000

  const videoCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: OUT_DIR,
      size: { width: WIDTH, height: HEIGHT }
    }
  })

  const videoPage = await videoCtx.newPage()
  const animatedHtml = slideTwoAnimated(images)
  await videoPage.setContent(animatedHtml, { waitUntil: 'load' })
  await videoPage.waitForTimeout(500)
  await videoPage.waitForTimeout(TOTAL_DURATION_MS)

  await videoPage.close()
  await videoCtx.close()

  // Convert webm to mp4
  const videoFiles = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.webm'))
  if (videoFiles.length === 0) {
    console.error('No video file was generated!')
  } else {
    const srcVideo = path.join(OUT_DIR, videoFiles[0])
    const dstVideo = path.join(OUT_DIR, '02_ig_profile_grid_story.mp4')

    const { execSync } = await import('child_process')
    try {
      execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${dstVideo}"`, {
        stdio: 'pipe'
      })
      fs.unlinkSync(srcVideo)
      console.log('Rendered 02_ig_profile_grid_story.mp4')
    } catch (err) {
      console.warn('ffmpeg not available, keeping as webm...')
      fs.renameSync(srcVideo, dstVideo)
      console.log('Rendered 02_ig_profile_grid_story.mp4 (webm container)')
    }
  }

  await browser.close()
  console.log(`Done: 3 static PNGs + 1 animated MP4 written to ${OUT_DIR}`)
}

render().catch(error => {
  console.error(error)
  process.exit(1)
})
