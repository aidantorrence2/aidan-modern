import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v38')

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 410

// IG system fonts
const SF = "-apple-system, 'Helvetica Neue', Arial, sans-serif"

// IG colors
const IG_BLUE = '#0095F6'
const IG_DARK = '#000000'
const IG_SECONDARY = '#262626'
const IG_GRAY = '#8E8E8E'
const IG_LIGHT_GRAY = '#C7C7C7'
const IG_BORDER = '#DBDBDB'
const IG_BG = '#FFFFFF'
const IG_LIGHT_BG = '#FAFAFA'
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
    strategy: 'v38 — Authentic IG UI concept with @madebyaidan, 4:5 grid, redesigned pages 3+4',
    safeBottomPixels: SAFE_BOTTOM,
    images: selected
  }
  fs.writeFileSync(path.join(OUT_DIR, 'sources.json'), JSON.stringify(payload, null, 2))
}

function wrap(html) {
  return `<!DOCTYPE html>
  <html>
    <head>
      <style>
        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; background: ${IG_BG}; }
      </style>
    </head>
    <body>${html}</body>
  </html>`
}

// iOS status bar
function statusBar() {
  return `
    <div style="position:absolute;left:0;right:0;top:0;height:54px;padding:14px 24px 0;display:flex;align-items:center;justify-content:space-between;z-index:10;">
      <span style="font-family:${SF};font-size:17px;font-weight:600;color:${IG_DARK};">9:41</span>
      <div style="display:flex;align-items:center;gap:6px;">
        <svg width="18" height="12" viewBox="0 0 18 12"><rect x="0" y="3" width="3" height="9" rx="1" fill="${IG_DARK}"/><rect x="5" y="2" width="3" height="10" rx="1" fill="${IG_DARK}"/><rect x="10" y="0" width="3" height="12" rx="1" fill="${IG_DARK}"/><rect x="15" y="0" width="3" height="12" rx="1" fill="${IG_DARK}" opacity="0.3"/></svg>
        <svg width="17" height="12" viewBox="0 0 17 12"><path d="M8.5 2.5C6.2 2.5 4.1 3.4 2.6 4.9L1 3.3C2.9 1.4 5.5 0.2 8.5 0.2S14.1 1.4 16 3.3L14.4 4.9C12.9 3.4 10.8 2.5 8.5 2.5Z" fill="${IG_DARK}"/><path d="M8.5 6.5C7.2 6.5 6 7 5.1 7.9L3.5 6.3C4.8 5 6.6 4.2 8.5 4.2S12.2 5 13.5 6.3L11.9 7.9C11 7 9.8 6.5 8.5 6.5Z" fill="${IG_DARK}"/><circle cx="8.5" cy="11" r="1.5" fill="${IG_DARK}"/></svg>
        <svg width="27" height="13" viewBox="0 0 27 13"><rect x="0" y="0" width="23" height="13" rx="3.5" stroke="${IG_DARK}" stroke-width="1" fill="none"/><rect x="2" y="2" width="18" height="9" rx="2" fill="${IG_DARK}"/><rect x="24.5" y="4" width="2.5" height="5" rx="1" fill="${IG_DARK}" opacity="0.4"/></svg>
      </div>
    </div>
  `
}

// IG top nav bar (profile page style)
function igProfileNav() {
  return `
    <div style="position:absolute;left:0;right:0;top:54px;height:48px;padding:0 16px;display:flex;align-items:center;justify-content:space-between;">
      <div style="display:flex;align-items:center;gap:4px;">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M0 6L5 1V4.5C11 4.5 11 9 11 11C9.5 8 5 8 5 8V11L0 6Z" fill="${IG_DARK}" opacity="0"/></svg>
        <span style="font-family:${SF};font-size:22px;font-weight:700;color:${IG_DARK};">${HANDLE}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="margin-left:2px;"><path d="M7 10l5 5 5-5" stroke="${IG_DARK}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>
      <div style="display:flex;align-items:center;gap:22px;">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="3" stroke="${IG_DARK}" stroke-width="2" fill="none"/><line x1="12" y1="7" x2="12" y2="17" stroke="${IG_DARK}" stroke-width="2" stroke-linecap="round"/><line x1="7" y1="12" x2="17" y2="12" stroke="${IG_DARK}" stroke-width="2" stroke-linecap="round"/></svg>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><line x1="4" y1="6" x2="20" y2="6" stroke="${IG_DARK}" stroke-width="2" stroke-linecap="round"/><line x1="4" y1="12" x2="20" y2="12" stroke="${IG_DARK}" stroke-width="2" stroke-linecap="round"/><line x1="4" y1="18" x2="20" y2="18" stroke="${IG_DARK}" stroke-width="2" stroke-linecap="round"/></svg>
      </div>
    </div>
  `
}

// ── Slide 1: IG Notification on Lock Screen ──
function slideOne(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#000;">
      <!-- Lock screen background (blurred photo) -->
      <img src="${images.hero}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:blur(30px) brightness(0.35);transform:scale(1.1);"/>

      <!-- Time display -->
      <div style="position:absolute;left:0;right:0;top:160px;text-align:center;">
        <p style="font-family:${SF};font-size:96px;font-weight:300;color:#fff;margin:0;letter-spacing:-2px;">9:41</p>
        <p style="font-family:${SF};font-size:24px;font-weight:400;color:rgba(255,255,255,0.7);margin:8px 0 0;">Monday, March 11</p>
      </div>

      <!-- MANILA banner -->
      <div style="position:absolute;left:0;right:0;top:380px;text-align:center;">
        <p style="font-family:${SF};font-size:88px;font-weight:900;letter-spacing:0.06em;color:${MANILA_COLOR};margin:0;text-transform:uppercase;text-shadow:0 2px 20px rgba(232,68,58,0.4);">MANILA</p>
        <p style="font-family:${SF};font-size:28px;font-weight:500;color:rgba(255,255,255,0.8);margin:10px 0 0;">Model Search</p>
      </div>

      <!-- IG notification card (realistic iOS style) -->
      <div style="position:absolute;left:24px;right:24px;top:560px;background:rgba(255,255,255,0.95);backdrop-filter:blur(40px);border-radius:22px;padding:18px 20px;box-shadow:0 8px 40px rgba(0,0,0,0.3);">
        <!-- App header row -->
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
          <div style="width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045);display:flex;align-items:center;justify-content:center;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
          </div>
          <div style="flex:1;">
            <span style="font-family:${SF};font-size:17px;font-weight:600;color:#000;">Instagram</span>
            <span style="font-family:${SF};font-size:17px;color:#8E8E8E;margin-left:8px;">now</span>
          </div>
        </div>

        <!-- Notification body -->
        <div style="display:flex;align-items:center;gap:14px;">
          <div style="width:56px;height:56px;border-radius:50%;overflow:hidden;flex-shrink:0;">
            <img src="${images.profilePic}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <div style="flex:1;">
            <p style="font-family:${SF};font-size:19px;color:#000;margin:0;line-height:1.4;"><b>${HANDLE}</b> sent you a message: "hey! want to do a portrait shoot in Manila? I'm looking for models"</p>
          </div>
        </div>
      </div>

      <!-- Second notification -->
      <div style="position:absolute;left:24px;right:24px;top:790px;background:rgba(255,255,255,0.92);backdrop-filter:blur(40px);border-radius:22px;padding:18px 20px;box-shadow:0 8px 40px rgba(0,0,0,0.25);">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
          <div style="width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045);display:flex;align-items:center;justify-content:center;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
          </div>
          <div style="flex:1;">
            <span style="font-family:${SF};font-size:17px;font-weight:600;color:#000;">Instagram</span>
            <span style="font-family:${SF};font-size:17px;color:#8E8E8E;margin-left:8px;">2m ago</span>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:14px;">
          <div style="width:56px;height:56px;border-radius:50%;overflow:hidden;flex-shrink:0;">
            <img src="${images.profilePic}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <div style="flex:1;">
            <p style="font-family:${SF};font-size:19px;color:#000;margin:0;line-height:1.4;"><b>${HANDLE}</b> sent you a photo.</p>
            <!-- Photo preview strip -->
            <div style="display:flex;gap:6px;margin-top:10px;">
              <div style="width:80px;height:80px;border-radius:8px;overflow:hidden;"><img src="${images.gridA}" style="width:100%;height:100%;object-fit:cover;"/></div>
              <div style="width:80px;height:80px;border-radius:8px;overflow:hidden;"><img src="${images.gridB}" style="width:100%;height:100%;object-fit:cover;"/></div>
              <div style="width:80px;height:80px;border-radius:8px;overflow:hidden;"><img src="${images.gridC}" style="width:100%;height:100%;object-fit:cover;"/></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom hint -->
      <div style="position:absolute;left:0;right:0;bottom:${SAFE_BOTTOM + 40}px;text-align:center;">
        <p style="font-family:${SF};font-size:20px;font-weight:500;color:rgba(255,255,255,0.5);margin:0;">No experience needed. Sign up below.</p>
      </div>
    </div>
  `
}

// ── Slide 2: Animated IG Profile with 4:5 Grid ──
function slideTwoAnimated(images) {
  const gridImages = [
    images.gridA, images.gridB, images.gridC,
    images.gridD, images.gridE, images.gridF,
    images.gridG, images.gridH, images.gridI,
  ]

  // 4:5 portrait cells (like IG post format) — less crop on portrait photos
  const GAP = 3
  const CELL_WIDTH = Math.floor((WIDTH - GAP * 2) / 3)
  const CELL_HEIGHT = Math.floor(CELL_WIDTH * 5 / 4)
  const GRID_TOP = 530

  let gridHtml = ''
  for (let i = 0; i < 9; i++) {
    const row = Math.floor(i / 3)
    const col = i % 3
    const x = col * (CELL_WIDTH + GAP)
    const y = GRID_TOP + row * (CELL_HEIGHT + GAP)
    const delay = 0.3 + i * 0.2

    gridHtml += `<div class="grid-cell" style="position:absolute;left:${x}px;top:${y}px;width:${CELL_WIDTH}px;height:${CELL_HEIGHT}px;overflow:hidden;opacity:0;transform:scale(0.92);animation:cellReveal 0.35s ease-out ${delay}s forwards;">
      <img src="${gridImages[i]}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center 20%;"/>
    </div>`
  }

  return `<!DOCTYPE html>
  <html>
    <head>
      <style>
        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; background: ${IG_BG}; }
        @keyframes cellReveal {
          0% { opacity: 0; transform: scale(0.92); }
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
      <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${IG_BG};">
        <!-- Status bar -->
        <div class="header-anim" style="position:absolute;left:0;right:0;top:0;height:54px;padding:14px 24px 0;display:flex;align-items:center;justify-content:space-between;z-index:10;">
          <span style="font-family:${SF};font-size:17px;font-weight:600;color:${IG_DARK};">9:41</span>
          <div style="display:flex;align-items:center;gap:6px;">
            <svg width="18" height="12" viewBox="0 0 18 12"><rect x="0" y="3" width="3" height="9" rx="1" fill="${IG_DARK}"/><rect x="5" y="2" width="3" height="10" rx="1" fill="${IG_DARK}"/><rect x="10" y="0" width="3" height="12" rx="1" fill="${IG_DARK}"/><rect x="15" y="0" width="3" height="12" rx="1" fill="${IG_DARK}" opacity="0.3"/></svg>
            <svg width="27" height="13" viewBox="0 0 27 13"><rect x="0" y="0" width="23" height="13" rx="3.5" stroke="${IG_DARK}" stroke-width="1" fill="none"/><rect x="2" y="2" width="18" height="9" rx="2" fill="${IG_DARK}"/></svg>
          </div>
        </div>

        <!-- IG nav bar -->
        <div class="header-anim" style="position:absolute;left:0;right:0;top:54px;height:48px;padding:0 16px;display:flex;align-items:center;justify-content:space-between;">
          <div style="display:flex;align-items:center;gap:4px;">
            <span style="font-family:${SF};font-size:22px;font-weight:700;color:${IG_DARK};">${HANDLE}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M7 10l5 5 5-5" stroke="${IG_DARK}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          <div style="display:flex;align-items:center;gap:22px;">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="3" stroke="${IG_DARK}" stroke-width="2" fill="none"/><line x1="12" y1="7" x2="12" y2="17" stroke="${IG_DARK}" stroke-width="2" stroke-linecap="round"/><line x1="7" y1="12" x2="17" y2="12" stroke="${IG_DARK}" stroke-width="2" stroke-linecap="round"/></svg>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><line x1="4" y1="6" x2="20" y2="6" stroke="${IG_DARK}" stroke-width="2" stroke-linecap="round"/><line x1="4" y1="12" x2="20" y2="12" stroke="${IG_DARK}" stroke-width="2" stroke-linecap="round"/><line x1="4" y1="18" x2="20" y2="18" stroke="${IG_DARK}" stroke-width="2" stroke-linecap="round"/></svg>
          </div>
        </div>

        <!-- Profile section -->
        <div class="profile-anim" style="position:absolute;left:0;right:0;top:110px;">
          <!-- Profile pic + stats row -->
          <div style="padding:0 20px;display:flex;align-items:center;gap:28px;">
            <!-- Story ring around profile pic -->
            <div style="width:96px;height:96px;border-radius:50%;background:linear-gradient(135deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5);padding:3px;flex-shrink:0;">
              <div style="width:100%;height:100%;border-radius:50%;border:3px solid #fff;overflow:hidden;">
                <img src="${images.profilePic}" style="width:100%;height:100%;object-fit:cover;"/>
              </div>
            </div>
            <div style="flex:1;display:flex;justify-content:space-around;">
              <div style="text-align:center;">
                <p style="font-family:${SF};font-size:20px;font-weight:700;color:${IG_DARK};margin:0;">247</p>
                <p style="font-family:${SF};font-size:14px;color:${IG_DARK};margin:3px 0 0;">posts</p>
              </div>
              <div style="text-align:center;">
                <p style="font-family:${SF};font-size:20px;font-weight:700;color:${IG_DARK};margin:0;">1,247</p>
                <p style="font-family:${SF};font-size:14px;color:${IG_DARK};margin:3px 0 0;">followers</p>
              </div>
              <div style="text-align:center;">
                <p style="font-family:${SF};font-size:20px;font-weight:700;color:${IG_DARK};margin:0;">186</p>
                <p style="font-family:${SF};font-size:14px;color:${IG_DARK};margin:3px 0 0;">following</p>
              </div>
            </div>
          </div>

          <!-- Bio -->
          <div style="padding:12px 20px 0;">
            <p style="font-family:${SF};font-size:15px;font-weight:600;color:${IG_DARK};margin:0;">Aidan</p>
            <p style="font-family:${SF};font-size:15px;color:${IG_DARK};margin:3px 0 0;line-height:1.35;">Photographer<br/>Editorial portraits in Manila<br/>DM to book a shoot</p>
            <p style="font-family:${SF};font-size:15px;color:${IG_DARK};margin:3px 0 0;"><span style="font-weight:600;color:${MANILA_COLOR};">MANILA MODEL SEARCH</span> — open now</p>
          </div>

          <!-- Action buttons -->
          <div style="display:flex;gap:6px;padding:14px 20px 0;">
            <div style="flex:1;padding:8px 0;background:${IG_LIGHT_BG};border-radius:8px;border:1px solid ${IG_BORDER};text-align:center;">
              <span style="font-family:${SF};font-size:14px;font-weight:600;color:${IG_DARK};">Following</span>
            </div>
            <div style="flex:1;padding:8px 0;background:${IG_BLUE};border-radius:8px;text-align:center;">
              <span style="font-family:${SF};font-size:14px;font-weight:600;color:#fff;">Message</span>
            </div>
            <div style="width:36px;padding:8px 0;background:${IG_LIGHT_BG};border-radius:8px;border:1px solid ${IG_BORDER};text-align:center;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="vertical-align:middle;"><path d="M7 10l5 5 5-5" stroke="${IG_DARK}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
          </div>

          <!-- Story highlights -->
          <div style="display:flex;gap:16px;padding:16px 20px 0;">
            <div style="text-align:center;width:72px;">
              <div style="width:68px;height:68px;border-radius:50%;border:2px solid ${IG_BORDER};display:flex;align-items:center;justify-content:center;margin:0 auto;">
                <span style="font-size:28px;">&#128247;</span>
              </div>
              <p style="font-family:${SF};font-size:12px;color:${IG_DARK};margin:4px 0 0;">shoots</p>
            </div>
            <div style="text-align:center;width:72px;">
              <div style="width:68px;height:68px;border-radius:50%;border:2px solid ${IG_BORDER};display:flex;align-items:center;justify-content:center;margin:0 auto;">
                <span style="font-size:28px;">&#127468;&#127469;</span>
              </div>
              <p style="font-family:${SF};font-size:12px;color:${IG_DARK};margin:4px 0 0;">manila</p>
            </div>
            <div style="text-align:center;width:72px;">
              <div style="width:68px;height:68px;border-radius:50%;border:2px solid ${IG_BORDER};display:flex;align-items:center;justify-content:center;margin:0 auto;">
                <span style="font-size:28px;">&#11088;</span>
              </div>
              <p style="font-family:${SF};font-size:12px;color:${IG_DARK};margin:4px 0 0;">reviews</p>
            </div>
            <div style="text-align:center;width:72px;">
              <div style="width:68px;height:68px;border-radius:50%;border:2px solid ${IG_BORDER};display:flex;align-items:center;justify-content:center;margin:0 auto;">
                <span style="font-size:24px;">&#43;</span>
              </div>
              <p style="font-family:${SF};font-size:12px;color:${IG_DARK};margin:4px 0 0;">New</p>
            </div>
          </div>
        </div>

        <!-- Tab bar: Grid | Reels | Tagged -->
        <div class="profile-anim" style="position:absolute;left:0;right:0;top:${GRID_TOP - 44}px;display:flex;border-bottom:1px solid ${IG_BORDER};">
          <div style="flex:1;padding:12px 0;text-align:center;border-bottom:1px solid ${IG_DARK};">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" stroke="${IG_DARK}" stroke-width="2"/><rect x="14" y="3" width="7" height="7" stroke="${IG_DARK}" stroke-width="2"/><rect x="3" y="14" width="7" height="7" stroke="${IG_DARK}" stroke-width="2"/><rect x="14" y="14" width="7" height="7" stroke="${IG_DARK}" stroke-width="2"/></svg>
          </div>
          <div style="flex:1;padding:12px 0;text-align:center;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><polygon points="5,3 19,12 5,21" stroke="${IG_GRAY}" stroke-width="2" fill="none"/></svg>
          </div>
          <div style="flex:1;padding:12px 0;text-align:center;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="${IG_GRAY}" stroke-width="2"/><path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="${IG_GRAY}" stroke-width="2" fill="none"/></svg>
          </div>
        </div>

        <!-- 4:5 Grid -->
        ${gridHtml}

        <!-- MANILA watermark over grid -->
        <div style="position:absolute;left:0;right:0;bottom:${SAFE_BOTTOM + 10}px;text-align:center;pointer-events:none;">
          <p style="font-family:${SF};font-size:82px;font-weight:900;letter-spacing:0.06em;color:${MANILA_COLOR};margin:0;text-transform:uppercase;opacity:0.95;text-shadow:0 2px 12px rgba(0,0,0,0.15);">MANILA</p>
        </div>
      </div>
    </body>
  </html>`
}

// ── Slide 3: IG Post with Process Steps in Comments ──
function slideThree(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${IG_BG};">
      ${statusBar()}

      <!-- MANILA at top -->
      <div style="position:absolute;left:0;right:0;top:58px;text-align:center;">
        <p style="font-family:${SF};font-size:82px;font-weight:900;letter-spacing:0.06em;color:${MANILA_COLOR};margin:0;text-transform:uppercase;">MANILA</p>
      </div>

      <!-- Post header -->
      <div style="position:absolute;left:0;right:0;top:170px;padding:0 16px;display:flex;align-items:center;gap:12px;">
        <div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#feda75,#fa7e1e,#d62976,#962fbf);padding:2.5px;">
          <div style="width:100%;height:100%;border-radius:50%;border:2px solid #fff;overflow:hidden;">
            <img src="${images.profilePic}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
        </div>
        <div style="flex:1;">
          <p style="font-family:${SF};font-size:15px;font-weight:600;color:${IG_DARK};margin:0;">${HANDLE}</p>
          <p style="font-family:${SF};font-size:13px;color:${IG_GRAY};margin:2px 0 0;">Manila, Philippines</p>
        </div>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="${IG_DARK}"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
      </div>

      <!-- Post image (tall portrait — 4:5 ratio) -->
      <div style="position:absolute;left:0;right:0;top:230px;height:680px;overflow:hidden;">
        <img src="${images.process}" style="width:100%;height:100%;object-fit:cover;object-position:center 15%;"/>
      </div>

      <!-- Post action icons -->
      <div style="position:absolute;left:0;right:0;top:918px;padding:12px 16px;display:flex;align-items:center;">
        <div style="display:flex;gap:18px;flex:1;">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="${IG_DARK}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="${IG_DARK}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><line x1="22" y1="2" x2="11" y2="13" stroke="${IG_DARK}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polygon points="22 2 15 22 11 13 2 9 22 2" stroke="${IG_DARK}" stroke-width="2" fill="none"/></svg>
        </div>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" stroke="${IG_DARK}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>

      <!-- Likes -->
      <div style="position:absolute;left:16px;right:16px;top:966px;">
        <p style="font-family:${SF};font-size:15px;font-weight:600;color:${IG_DARK};margin:0;">2,847 likes</p>
      </div>

      <!-- Caption as "how it works" steps -->
      <div style="position:absolute;left:16px;right:16px;top:994px;">
        <p style="font-family:${SF};font-size:15px;color:${IG_DARK};margin:0;line-height:1.5;">
          <b>${HANDLE}</b> <span style="color:${MANILA_COLOR};font-weight:700;">MANILA MODEL SEARCH</span> — here's how it works:<br/><br/>
          <b>1.</b> Sign up (60-second form)<br/>
          <b>2.</b> We plan the shoot together<br/>
          <b>3.</b> Show up — I direct you the entire time<br/>
          <b>4.</b> Get your edited photos within a week<br/><br/>
          No experience needed. Link in bio.<br/>
          <span style="color:${IG_BLUE};">#manilamodelsearch #portraitphotography #manila #models #editorialshoot</span>
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

// ── Slide 4: IG DM Conversation Thread ──
function slideFour(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${IG_BG};">
      ${statusBar()}

      <!-- DM header bar -->
      <div style="position:absolute;left:0;right:0;top:54px;height:56px;padding:0 16px;display:flex;align-items:center;gap:12px;border-bottom:1px solid ${IG_BORDER};">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="${IG_DARK}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <div style="width:36px;height:36px;border-radius:50%;overflow:hidden;flex-shrink:0;">
          <img src="${images.profilePic}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="flex:1;">
          <p style="font-family:${SF};font-size:16px;font-weight:600;color:${IG_DARK};margin:0;">${HANDLE}</p>
          <p style="font-family:${SF};font-size:13px;color:${IG_GRAY};margin:1px 0 0;">Active now</p>
        </div>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M15.05 5A5 5 0 0119 8.95M15.05 1A9 9 0 0123 8.94M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke="${IG_DARK}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M23 7l-7 5 7 5V7z" stroke="${IG_DARK}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><rect x="1" y="5" width="15" height="14" rx="2" stroke="${IG_DARK}" stroke-width="2"/></svg>
      </div>

      <!-- MANILA banner -->
      <div style="position:absolute;left:0;right:0;top:135px;text-align:center;">
        <p style="font-family:${SF};font-size:82px;font-weight:900;letter-spacing:0.06em;color:${MANILA_COLOR};margin:0;text-transform:uppercase;">MANILA</p>
      </div>

      <!-- Chat messages -->
      <div style="position:absolute;left:0;right:0;top:260px;padding:0 16px;">

        <!-- Their message (gray bubble, left aligned) -->
        <div style="display:flex;align-items:flex-end;gap:8px;margin-bottom:12px;">
          <div style="width:28px;height:28px;border-radius:50%;overflow:hidden;flex-shrink:0;">
            <img src="${images.profilePic}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <div style="max-width:70%;background:#EFEFEF;border-radius:20px 20px 20px 4px;padding:14px 18px;">
            <p style="font-family:${SF};font-size:17px;color:${IG_DARK};margin:0;line-height:1.4;">hey! I'm doing a model search in Manila. would you want to shoot?</p>
          </div>
        </div>

        <!-- Your reply (blue bubble, right aligned) -->
        <div style="display:flex;justify-content:flex-end;margin-bottom:12px;">
          <div style="max-width:70%;background:${IG_BLUE};border-radius:20px 20px 4px 20px;padding:14px 18px;">
            <p style="font-family:${SF};font-size:17px;color:#fff;margin:0;line-height:1.4;">omg yes! but I've never modeled before, is that ok?</p>
          </div>
        </div>

        <!-- Their reply -->
        <div style="display:flex;align-items:flex-end;gap:8px;margin-bottom:12px;">
          <div style="width:28px;height:28px;border-radius:50%;overflow:hidden;flex-shrink:0;">
            <img src="${images.profilePic}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <div style="max-width:70%;background:#EFEFEF;border-radius:20px 20px 20px 4px;padding:14px 18px;">
            <p style="font-family:${SF};font-size:17px;color:${IG_DARK};margin:0;line-height:1.4;">totally fine! I direct the whole shoot. here's what I shot last week:</p>
          </div>
        </div>

        <!-- Photo share (looks like shared IG post) -->
        <div style="display:flex;align-items:flex-end;gap:8px;margin-bottom:12px;">
          <div style="width:28px;height:28px;flex-shrink:0;"></div>
          <div style="width:300px;border-radius:18px;overflow:hidden;border:1px solid ${IG_BORDER};">
            <img src="${images.dmPhotoA}" style="width:100%;height:240px;object-fit:cover;object-position:center 20%;display:block;"/>
            <div style="padding:10px 14px;background:#fff;">
              <p style="font-family:${SF};font-size:14px;font-weight:600;color:${IG_DARK};margin:0;">${HANDLE}</p>
              <p style="font-family:${SF};font-size:13px;color:${IG_GRAY};margin:2px 0 0;">from last week's shoot</p>
            </div>
          </div>
        </div>

        <!-- Your reply -->
        <div style="display:flex;justify-content:flex-end;margin-bottom:12px;">
          <div style="max-width:70%;background:${IG_BLUE};border-radius:20px 20px 4px 20px;padding:14px 18px;">
            <p style="font-family:${SF};font-size:17px;color:#fff;margin:0;line-height:1.4;">wait these are amazing 😍 how do I sign up??</p>
          </div>
        </div>

        <!-- Their reply with CTA -->
        <div style="display:flex;align-items:flex-end;gap:8px;margin-bottom:12px;">
          <div style="width:28px;height:28px;border-radius:50%;overflow:hidden;flex-shrink:0;">
            <img src="${images.profilePic}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <div style="max-width:72%;background:#EFEFEF;border-radius:20px 20px 20px 4px;padding:14px 18px;">
            <p style="font-family:${SF};font-size:17px;color:${IG_DARK};margin:0;line-height:1.4;">sign up below! it's a 60-second form. I'll message you back to plan everything</p>
          </div>
        </div>

        <!-- Reaction row -->
        <div style="display:flex;align-items:flex-end;gap:8px;margin-bottom:16px;">
          <div style="width:28px;height:28px;flex-shrink:0;"></div>
          <div style="background:#EFEFEF;border-radius:20px;padding:8px 14px;">
            <span style="font-size:28px;">&#128248;</span>
          </div>
        </div>

        <!-- Second photo share -->
        <div style="display:flex;align-items:flex-end;gap:8px;margin-bottom:16px;">
          <div style="width:28px;height:28px;flex-shrink:0;"></div>
          <div style="width:300px;border-radius:18px;overflow:hidden;border:1px solid ${IG_BORDER};">
            <img src="${images.dmPhotoB}" style="width:100%;height:240px;object-fit:cover;object-position:center 20%;display:block;"/>
            <div style="padding:10px 14px;background:#fff;">
              <p style="font-family:${SF};font-size:14px;font-weight:600;color:${IG_DARK};margin:0;">${HANDLE}</p>
              <p style="font-family:${SF};font-size:13px;color:${IG_GRAY};margin:2px 0 0;">another from the set</p>
            </div>
          </div>
        </div>
      </div>

      <!-- DM input bar at bottom (above safe zone) -->
      <div style="position:absolute;left:0;right:0;bottom:${SAFE_BOTTOM}px;padding:10px 16px;border-top:1px solid ${IG_BORDER};background:#fff;display:flex;align-items:center;gap:12px;">
        <div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#405DE6,#5B51D8,#833AB4);display:flex;align-items:center;justify-content:center;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 5v14M5 12h14" stroke="white" stroke-width="2.5" stroke-linecap="round"/></svg>
        </div>
        <div style="flex:1;padding:10px 16px;border:1px solid ${IG_BORDER};border-radius:22px;">
          <span style="font-family:${SF};font-size:16px;color:${IG_GRAY};">Message...</span>
        </div>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="${IG_DARK}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
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
    process: 'manila-gallery-dsc-0190.jpg',
    dmPhotoA: 'manila-gallery-dsc-0075.jpg',
    dmPhotoB: 'manila-gallery-floor-001.jpg',
  }

  writeSources({ all_considered: all, selected: selection })

  const images = Object.fromEntries(
    Object.entries(selection).map(([key, file]) => [key, readImage(file)])
  )

  // --- Render static slides (1, 3, 4) as PNGs ---
  const staticSlides = [
    ['01_ig_lockscreen_story.png', wrap(slideOne(images))],
    ['03_ig_post_story.png', wrap(slideThree(images))],
    ['04_ig_dm_story.png', wrap(slideFour(images))]
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

  // --- Render slide 2 as animated MP4 video ---
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
      console.warn('ffmpeg not available, keeping as webm and renaming to mp4...')
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
