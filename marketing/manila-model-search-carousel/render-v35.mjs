import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v35')

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 410

// Zine / collage fonts
const MONO = "'Courier New', Courier, monospace"
const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif"
const SERIF = "Georgia, 'Times New Roman', serif"

// Palette: bright, chaotic, fun
const PINK = '#FF2D87'
const YELLOW = '#FFE135'
const CYAN = '#00E5FF'
const RED = '#FF3B30'
const BLACK = '#1A1A1A'
const CREAM = '#FFF8E7'
const TAPE_YELLOW = 'rgba(255,225,53,0.55)'
const TAPE_PINK = 'rgba(255,45,135,0.35)'

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
    strategy: 'v35 -- Cut & Paste Collage / Zine DIY punk aesthetic',
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
        html, body { margin: 0; padding: 0; background: ${CREAM}; }
      </style>
    </head>
    <body>${html}</body>
  </html>`
}

// Washi tape strip element
function tapeStrip(x, y, width, height, rotation, color = TAPE_YELLOW) {
  return `<div style="position:absolute;left:${x}px;top:${y}px;width:${width}px;height:${height}px;background:${color};transform:rotate(${rotation}deg);z-index:20;opacity:0.85;"></div>`
}

// Torn edge effect via clip-path with jagged polygon
function tornEdgeClip() {
  // Create a jagged polygon for torn paper effect
  let points = ['0% 2%']
  // Top edge - jagged
  for (let i = 5; i <= 95; i += 5) {
    const jag = Math.random() * 3
    points.push(`${i}% ${jag}%`)
  }
  points.push('100% 1%')
  // Right edge
  points.push('100% 98%')
  // Bottom edge - jagged
  for (let i = 95; i >= 5; i -= 5) {
    const jag = 97 + Math.random() * 3
    points.push(`${i}% ${jag}%`)
  }
  points.push('0% 99%')
  return `polygon(${points.join(', ')})`
}

// Doodle circle (CSS border)
function doodleCircle(x, y, size, color = RED) {
  return `<div style="position:absolute;left:${x}px;top:${y}px;width:${size}px;height:${size}px;border:4px solid ${color};border-radius:50%;transform:rotate(-5deg);z-index:25;opacity:0.8;"></div>`
}

// Doodle arrow (simple CSS triangle + line)
function doodleArrow(x, y, rotation, color = BLACK) {
  return `<div style="position:absolute;left:${x}px;top:${y}px;z-index:25;transform:rotate(${rotation}deg);">
    <div style="width:60px;height:4px;background:${color};border-radius:2px;"></div>
    <div style="position:absolute;right:-2px;top:-8px;width:0;height:0;border-left:16px solid ${color};border-top:10px solid transparent;border-bottom:10px solid transparent;"></div>
  </div>`
}

// Star burst sticker element
function starBurst(x, y, size, color, text, textColor = '#fff', fontSize = 20) {
  return `<div style="position:absolute;left:${x}px;top:${y}px;width:${size}px;height:${size}px;z-index:30;display:flex;align-items:center;justify-content:center;">
    <svg viewBox="0 0 100 100" style="position:absolute;inset:0;width:100%;height:100%;">
      <polygon points="50,0 61,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 39,35" fill="${color}"/>
    </svg>
    <span style="position:relative;z-index:1;font-family:${SANS};font-size:${fontSize}px;font-weight:900;color:${textColor};text-align:center;line-height:1.1;text-transform:uppercase;">${text}</span>
  </div>`
}

// ==========================================
// SLIDE 1: HOOK -- collage letters + taped photo + handwritten text
// ==========================================
function slideOne(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${CREAM};">
      <!-- Notebook line texture -->
      ${Array.from({length: 30}, (_, i) => `<div style="position:absolute;left:0;right:0;top:${80 + i * 60}px;height:1px;background:rgba(0,120,215,0.12);"></div>`).join('')}

      <!-- MANILA in huge mixed-case collage letters -->
      <div style="position:absolute;left:40px;top:70px;right:40px;display:flex;flex-wrap:wrap;align-items:baseline;gap:0;">
        <span style="font-family:${SANS};font-size:130px;font-weight:900;color:${PINK};letter-spacing:-2px;transform:rotate(-3deg);display:inline-block;">M</span>
        <span style="font-family:${SERIF};font-size:110px;font-weight:700;color:${BLACK};font-style:italic;transform:rotate(2deg);display:inline-block;margin-left:-4px;">A</span>
        <span style="font-family:${MONO};font-size:120px;font-weight:700;color:${CYAN};transform:rotate(-1deg);display:inline-block;background:${BLACK};padding:0 8px;margin-left:-2px;">N</span>
        <span style="font-family:${SANS};font-size:140px;font-weight:900;color:${YELLOW};-webkit-text-stroke:3px ${BLACK};transform:rotate(1.5deg);display:inline-block;margin-left:-2px;">I</span>
        <span style="font-family:${SERIF};font-size:115px;font-weight:900;color:${RED};transform:rotate(-2.5deg);display:inline-block;margin-left:-4px;">L</span>
        <span style="font-family:${MONO};font-size:125px;font-weight:700;color:${PINK};transform:rotate(3deg);display:inline-block;background:${YELLOW};padding:0 10px;margin-left:-2px;">A</span>
      </div>

      <!-- Photo taped at an angle -->
      <div style="position:absolute;left:80px;top:360px;width:560px;height:700px;transform:rotate(-4deg);z-index:10;">
        <!-- Shadow -->
        <div style="position:absolute;inset:8px -6px -8px 6px;background:rgba(0,0,0,0.15);filter:blur(12px);border-radius:4px;"></div>
        <!-- Photo with torn edge feel -->
        <div style="width:100%;height:100%;border:6px solid #fff;box-shadow:2px 3px 8px rgba(0,0,0,0.2);overflow:hidden;background:#fff;padding:6px;">
          <img src="${images.hero}" style="width:100%;height:100%;object-fit:cover;object-position:center 20%;display:block;"/>
        </div>
      </div>

      <!-- Washi tape strips on photo -->
      ${tapeStrip(100, 340, 120, 28, 15, TAPE_YELLOW)}
      ${tapeStrip(520, 340, 110, 28, -8, TAPE_PINK)}
      ${tapeStrip(280, 1030, 130, 26, -5, TAPE_YELLOW)}

      <!-- Second small photo overlapping -->
      <div style="position:absolute;right:40px;top:680px;width:340px;height:420px;transform:rotate(6deg);z-index:15;">
        <div style="width:100%;height:100%;border:5px solid #fff;box-shadow:3px 4px 10px rgba(0,0,0,0.2);overflow:hidden;padding:5px;background:#fff;">
          <img src="${images.heroB}" style="width:100%;height:100%;object-fit:cover;object-position:center;display:block;"/>
        </div>
      </div>
      ${tapeStrip(740, 660, 100, 24, -12, TAPE_YELLOW)}

      <!-- "models wanted!!" in handwritten style -->
      <div style="position:absolute;left:60px;top:1140px;z-index:20;">
        <span style="font-family:${SERIF};font-size:72px;font-weight:700;font-style:italic;color:${BLACK};transform:rotate(-2deg);display:inline-block;line-height:1;">models wanted!!</span>
      </div>

      <!-- Underline scribble -->
      <div style="position:absolute;left:55px;top:1215px;width:580px;z-index:21;">
        <svg viewBox="0 0 580 20" style="width:100%;height:20px;">
          <path d="M0,10 Q60,2 120,12 T240,8 T360,14 T480,6 T580,10" stroke="${RED}" stroke-width="4" fill="none" stroke-linecap="round"/>
        </svg>
      </div>

      <!-- "no experience needed" in typewriter -->
      <div style="position:absolute;left:70px;top:1260px;z-index:20;">
        <span style="font-family:${MONO};font-size:32px;color:${BLACK};background:${YELLOW};padding:4px 12px;transform:rotate(1deg);display:inline-block;">no experience needed.</span>
      </div>

      <!-- "editorial portraits" -->
      <div style="position:absolute;left:70px;top:1330px;z-index:20;">
        <span style="font-family:${SANS};font-size:34px;font-weight:700;color:${PINK};transform:rotate(-1deg);display:inline-block;">editorial portraits in Manila</span>
      </div>

      <!-- Doodle elements -->
      ${doodleCircle(680, 1150, 80, RED)}
      ${doodleArrow(700, 1270, 140, BLACK)}
      ${starBurst(820, 1120, 130, PINK, 'FREE', '#fff', 22)}

      <!-- Sticker -->
      <div style="position:absolute;right:60px;top:240px;z-index:25;transform:rotate(12deg);">
        <div style="background:${RED};color:#fff;font-family:${SANS};font-size:24px;font-weight:900;padding:10px 18px;border-radius:40px;text-transform:uppercase;letter-spacing:1px;">open call</div>
      </div>
    </div>
  `
}

// ==========================================
// SLIDE 2: ANIMATED -- photos slam onto page at random angles with tape
// ==========================================
function slideTwoAnimated(images) {
  const photoList = [
    { src: images.gridA, x: 60,  y: 320, w: 420, h: 520, rot: -5, tapeX: 80, tapeY: 300, tapeRot: 15 },
    { src: images.gridB, x: 540, y: 280, w: 440, h: 500, rot: 4,  tapeX: 620, tapeY: 260, tapeRot: -10 },
    { src: images.gridC, x: 100, y: 800, w: 380, h: 480, rot: 3,  tapeX: 160, tapeY: 780, tapeRot: 8 },
    { src: images.gridD, x: 500, y: 750, w: 460, h: 520, rot: -6, tapeX: 600, tapeY: 730, tapeRot: -15 },
    { src: images.gridE, x: 280, y: 560, w: 400, h: 500, rot: 7,  tapeX: 360, tapeY: 540, tapeRot: 5 },
  ]

  let photoHtml = ''
  photoList.forEach((p, i) => {
    const delay = 0.4 + i * 0.55
    const tapeDelay = delay + 0.25
    photoHtml += `
      <div class="photo photo-${i}" style="position:absolute;left:${p.x}px;top:${p.y}px;width:${p.w}px;height:${p.h}px;transform:rotate(${p.rot}deg) scale(1.3);opacity:0;z-index:${10 + i};animation:slamIn 0.35s cubic-bezier(0.17,0.67,0.3,1.3) ${delay}s forwards;">
        <div style="width:100%;height:100%;border:5px solid #fff;box-shadow:3px 5px 15px rgba(0,0,0,0.3);overflow:hidden;padding:4px;background:#fff;">
          <img src="${p.src}" style="width:100%;height:100%;object-fit:cover;object-position:center;display:block;"/>
        </div>
      </div>
      <div class="tape tape-${i}" style="position:absolute;left:${p.tapeX}px;top:${p.tapeY}px;width:110px;height:26px;background:${i % 2 === 0 ? TAPE_YELLOW : TAPE_PINK};transform:rotate(${p.tapeRot}deg);z-index:${20 + i};opacity:0;animation:tapeAppear 0.2s ease-out ${tapeDelay}s forwards;"></div>
    `
  })

  return `<!DOCTYPE html>
  <html>
    <head>
      <style>
        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; background: ${CREAM}; }
        @keyframes slamIn {
          0% { opacity: 0; transform: rotate(var(--rot, 0deg)) scale(1.5); }
          60% { opacity: 1; transform: rotate(var(--rot, 0deg)) scale(0.95); }
          100% { opacity: 1; transform: rotate(var(--rot, 0deg)) scale(1); }
        }
        @keyframes tapeAppear {
          0% { opacity: 0; transform: rotate(var(--rot, 0deg)) scaleX(0); }
          100% { opacity: 0.85; transform: rotate(var(--rot, 0deg)) scaleX(1); }
        }
        @keyframes headerSlam {
          0% { opacity: 0; transform: rotate(-2deg) scale(1.3); }
          50% { opacity: 1; transform: rotate(-2deg) scale(0.95); }
          100% { opacity: 1; transform: rotate(-2deg) scale(1); }
        }
        @keyframes captionFade {
          0% { opacity: 0; transform: translateY(15px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        ${photoList.map((p, i) => `.photo-${i} { --rot: ${p.rot}deg; }`).join('\n')}
        ${photoList.map((p, i) => `.tape-${i} { --rot: ${p.tapeRot}deg; }`).join('\n')}
      </style>
    </head>
    <body>
      <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${CREAM};">
        <!-- Notebook lines -->
        ${Array.from({length: 30}, (_, i) => `<div style="position:absolute;left:0;right:0;top:${80 + i * 60}px;height:1px;background:rgba(0,120,215,0.10);"></div>`).join('')}

        <!-- MANILA header slams in -->
        <div style="position:absolute;left:40px;top:60px;opacity:0;animation:headerSlam 0.4s cubic-bezier(0.17,0.67,0.3,1.3) 0.1s forwards;transform:rotate(-2deg);">
          <div style="display:flex;align-items:baseline;gap:0;">
            <span style="font-family:${SANS};font-size:90px;font-weight:900;color:${PINK};">M</span>
            <span style="font-family:${SERIF};font-size:78px;font-weight:700;color:${BLACK};font-style:italic;">A</span>
            <span style="font-family:${MONO};font-size:82px;font-weight:700;color:${CYAN};background:${BLACK};padding:0 6px;">N</span>
            <span style="font-family:${SANS};font-size:95px;font-weight:900;color:${YELLOW};-webkit-text-stroke:3px ${BLACK};">I</span>
            <span style="font-family:${SERIF};font-size:80px;font-weight:900;color:${RED};">L</span>
            <span style="font-family:${MONO};font-size:85px;font-weight:700;color:${PINK};background:${YELLOW};padding:0 8px;">A</span>
          </div>
        </div>

        <!-- "my work ^" caption -->
        <div style="position:absolute;left:50px;top:200px;opacity:0;animation:captionFade 0.4s ease-out 0.3s forwards;">
          <span style="font-family:${SERIF};font-size:42px;font-style:italic;color:${BLACK};">this is my work</span>
          <span style="font-family:${SANS};font-size:38px;font-weight:900;color:${RED};margin-left:8px;">!!</span>
        </div>

        ${photoHtml}

        <!-- Bottom scrawl -->
        <div style="position:absolute;left:60px;bottom:${SAFE_BOTTOM + 40}px;opacity:0;animation:captionFade 0.4s ease-out 3.2s forwards;z-index:30;">
          <span style="font-family:${MONO};font-size:28px;color:${BLACK};background:${YELLOW};padding:4px 12px;display:inline-block;transform:rotate(-1deg);">you could look like this --></span>
        </div>
      </div>
    </body>
  </html>`
}

// ==========================================
// SLIDE 3: PROCESS -- steps in mixed typewriter/handwritten styles
// ==========================================
function slideThree(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${CREAM};">
      <!-- Notebook lines -->
      ${Array.from({length: 30}, (_, i) => `<div style="position:absolute;left:0;right:0;top:${80 + i * 60}px;height:1px;background:rgba(0,120,215,0.12);"></div>`).join('')}

      <!-- MANILA collage header -->
      <div style="position:absolute;left:40px;top:60px;display:flex;align-items:baseline;">
        <span style="font-family:${SANS};font-size:90px;font-weight:900;color:${PINK};">M</span>
        <span style="font-family:${SERIF};font-size:78px;font-weight:700;color:${BLACK};font-style:italic;">A</span>
        <span style="font-family:${MONO};font-size:82px;font-weight:700;color:${CYAN};background:${BLACK};padding:0 6px;">N</span>
        <span style="font-family:${SANS};font-size:95px;font-weight:900;color:${YELLOW};-webkit-text-stroke:3px ${BLACK};">I</span>
        <span style="font-family:${SERIF};font-size:80px;font-weight:900;color:${RED};">L</span>
        <span style="font-family:${MONO};font-size:85px;font-weight:700;color:${PINK};background:${YELLOW};padding:0 8px;">A</span>
      </div>

      <!-- "how it works:" in handwritten -->
      <div style="position:absolute;left:50px;top:200px;">
        <span style="font-family:${SERIF};font-size:52px;font-style:italic;color:${BLACK};transform:rotate(-1deg);display:inline-block;">how it works:</span>
      </div>

      <!-- Step 1 -->
      <div style="position:absolute;left:60px;top:310px;transform:rotate(-1deg);">
        <div style="display:flex;align-items:flex-start;gap:16px;">
          <span style="font-family:${SANS};font-size:80px;font-weight:900;color:${PINK};line-height:0.9;">1</span>
          <div>
            <span style="font-family:${MONO};font-size:36px;font-weight:700;color:${BLACK};background:${YELLOW};padding:2px 10px;display:inline-block;">sign up below</span>
            <p style="font-family:${SERIF};font-size:28px;color:${BLACK};margin:8px 0 0;font-style:italic;opacity:0.7;">takes 60 seconds. seriously.</p>
          </div>
        </div>
      </div>
      ${doodleArrow(700, 380, 90, RED)}

      <!-- Step 2 -->
      <div style="position:absolute;left:80px;top:520px;transform:rotate(1deg);">
        <div style="display:flex;align-items:flex-start;gap:16px;">
          <span style="font-family:${SERIF};font-size:80px;font-weight:900;color:${CYAN};line-height:0.9;font-style:italic;">2</span>
          <div>
            <span style="font-family:${SANS};font-size:36px;font-weight:900;color:${BLACK};display:inline-block;">we plan the shoot</span>
            <p style="font-family:${MONO};font-size:26px;color:${BLACK};margin:8px 0 0;opacity:0.7;">location + vibe + look</p>
          </div>
        </div>
      </div>
      ${doodleCircle(620, 510, 100, PINK)}

      <!-- Step 3 -->
      <div style="position:absolute;left:50px;top:730px;transform:rotate(-1.5deg);">
        <div style="display:flex;align-items:flex-start;gap:16px;">
          <span style="font-family:${MONO};font-size:80px;font-weight:700;color:${RED};line-height:0.9;">3</span>
          <div>
            <span style="font-family:${SERIF};font-size:38px;font-weight:700;color:${BLACK};font-style:italic;display:inline-block;">show up. I guide you.</span>
            <p style="font-family:${SANS};font-size:26px;color:${BLACK};margin:8px 0 0;font-weight:700;opacity:0.7;">zero posing experience needed</p>
          </div>
        </div>
      </div>
      ${doodleArrow(640, 800, 130, BLACK)}

      <!-- Small taped photo -->
      <div style="position:absolute;right:50px;top:920px;width:380px;height:460px;transform:rotate(5deg);z-index:10;">
        <div style="width:100%;height:100%;border:5px solid #fff;box-shadow:3px 4px 12px rgba(0,0,0,0.2);overflow:hidden;padding:4px;background:#fff;">
          <img src="${images.process}" style="width:100%;height:100%;object-fit:cover;object-position:center;display:block;"/>
        </div>
      </div>
      ${tapeStrip(740, 900, 120, 26, -10, TAPE_YELLOW)}
      ${tapeStrip(850, 1350, 100, 24, 12, TAPE_PINK)}

      <!-- "that's it!!" scrawl -->
      <div style="position:absolute;left:60px;top:1020px;z-index:15;">
        <span style="font-family:${SANS};font-size:64px;font-weight:900;color:${PINK};transform:rotate(-3deg);display:inline-block;">that's it!!</span>
      </div>

      <!-- Squiggly underline -->
      <div style="position:absolute;left:55px;top:1090px;width:380px;z-index:15;">
        <svg viewBox="0 0 380 16" style="width:100%;height:16px;">
          <path d="M0,8 Q40,0 80,8 T160,8 T240,8 T320,8 T380,8" stroke="${PINK}" stroke-width="4" fill="none" stroke-linecap="round"/>
        </svg>
      </div>

      ${starBurst(50, 1130, 140, RED, 'FREE!', '#fff', 24)}

      <!-- Small doodle stars scattered -->
      <div style="position:absolute;left:300px;top:290px;font-size:32px;color:${YELLOW};transform:rotate(15deg);z-index:5;">*</div>
      <div style="position:absolute;left:800px;top:190px;font-size:44px;color:${PINK};transform:rotate(-10deg);z-index:5;">*</div>
      <div style="position:absolute;left:150px;top:940px;font-size:38px;color:${CYAN};transform:rotate(25deg);z-index:5;">*</div>
    </div>
  `
}

// ==========================================
// SLIDE 4: CTA -- "SIGN UP!!" in big messy type + photo + sticker urgency
// ==========================================
function slideFour(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${CREAM};">
      <!-- Notebook lines -->
      ${Array.from({length: 30}, (_, i) => `<div style="position:absolute;left:0;right:0;top:${80 + i * 60}px;height:1px;background:rgba(0,120,215,0.12);"></div>`).join('')}

      <!-- MANILA collage header -->
      <div style="position:absolute;left:40px;top:55px;display:flex;align-items:baseline;">
        <span style="font-family:${SANS};font-size:90px;font-weight:900;color:${PINK};">M</span>
        <span style="font-family:${SERIF};font-size:78px;font-weight:700;color:${BLACK};font-style:italic;">A</span>
        <span style="font-family:${MONO};font-size:82px;font-weight:700;color:${CYAN};background:${BLACK};padding:0 6px;">N</span>
        <span style="font-family:${SANS};font-size:95px;font-weight:900;color:${YELLOW};-webkit-text-stroke:3px ${BLACK};">I</span>
        <span style="font-family:${SERIF};font-size:80px;font-weight:900;color:${RED};">L</span>
        <span style="font-family:${MONO};font-size:85px;font-weight:700;color:${PINK};background:${YELLOW};padding:0 8px;">A</span>
      </div>

      <!-- Large taped photo -->
      <div style="position:absolute;left:100px;top:260px;width:540px;height:680px;transform:rotate(-3deg);z-index:10;">
        <div style="width:100%;height:100%;border:6px solid #fff;box-shadow:4px 6px 16px rgba(0,0,0,0.25);overflow:hidden;padding:5px;background:#fff;">
          <img src="${images.cta}" style="width:100%;height:100%;object-fit:cover;object-position:center 30%;display:block;"/>
        </div>
      </div>
      ${tapeStrip(130, 240, 130, 28, 12, TAPE_YELLOW)}
      ${tapeStrip(500, 240, 110, 26, -8, TAPE_PINK)}
      ${tapeStrip(300, 910, 120, 26, -5, TAPE_YELLOW)}

      <!-- Small overlapping photo -->
      <div style="position:absolute;right:40px;top:560px;width:320px;height:400px;transform:rotate(7deg);z-index:15;">
        <div style="width:100%;height:100%;border:5px solid #fff;box-shadow:3px 4px 10px rgba(0,0,0,0.2);overflow:hidden;padding:4px;background:#fff;">
          <img src="${images.ctaB}" style="width:100%;height:100%;object-fit:cover;object-position:center;display:block;"/>
        </div>
      </div>
      ${tapeStrip(760, 540, 100, 24, -15, TAPE_YELLOW)}

      <!-- "SIGN UP!!" in huge messy mixed type -->
      <div style="position:absolute;left:40px;top:1000px;z-index:20;">
        <div style="display:flex;align-items:baseline;flex-wrap:wrap;">
          <span style="font-family:${SANS};font-size:100px;font-weight:900;color:${BLACK};transform:rotate(-2deg);display:inline-block;">SIGN</span>
          <span style="font-family:${SERIF};font-size:110px;font-weight:900;color:${PINK};font-style:italic;transform:rotate(3deg);display:inline-block;margin-left:16px;">UP</span>
          <span style="font-family:${MONO};font-size:90px;font-weight:700;color:${RED};transform:rotate(-4deg);display:inline-block;margin-left:8px;">!!</span>
        </div>
      </div>

      <!-- Scribble underline -->
      <div style="position:absolute;left:35px;top:1120px;width:650px;z-index:20;">
        <svg viewBox="0 0 650 20" style="width:100%;height:20px;">
          <path d="M0,10 Q70,0 140,12 T280,6 T420,14 T560,8 T650,10" stroke="${RED}" stroke-width="5" fill="none" stroke-linecap="round"/>
        </svg>
      </div>

      <!-- Subtext -->
      <div style="position:absolute;left:50px;top:1160px;z-index:20;">
        <span style="font-family:${MONO};font-size:30px;color:${BLACK};background:${YELLOW};padding:4px 14px;display:inline-block;transform:rotate(1deg);">60-second form. I message you back.</span>
      </div>

      <div style="position:absolute;left:50px;top:1230px;z-index:20;">
        <span style="font-family:${SERIF};font-size:30px;color:${BLACK};font-style:italic;display:inline-block;transform:rotate(-0.5deg);">no experience needed. just sign up.</span>
      </div>

      <!-- Urgency sticker -->
      ${starBurst(700, 970, 200, RED, 'LIMITED<br>SPOTS!!', '#fff', 22)}

      <!-- Arrow pointing down -->
      <div style="position:absolute;left:240px;top:1290px;z-index:25;">
        <svg viewBox="0 0 60 80" style="width:60px;height:80px;">
          <path d="M30,0 L30,60 M15,45 L30,65 L45,45" stroke="${BLACK}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>

      <!-- Doodle elements -->
      ${doodleCircle(50, 960, 60, CYAN)}
      <div style="position:absolute;left:800px;top:200px;font-size:48px;color:${YELLOW};transform:rotate(20deg);z-index:5;">*</div>
      <div style="position:absolute;left:40px;top:200px;font-size:36px;color:${PINK};transform:rotate(-15deg);z-index:5;">*</div>
    </div>
  `
}

async function render() {
  resetOutputDir()

  const all = getTopManilaImages()
  const selection = {
    hero: 'manila-gallery-canal-001.jpg',
    heroB: 'manila-gallery-closeup-001.jpg',
    gridA: 'manila-gallery-garden-002.jpg',
    gridB: 'manila-gallery-graffiti-001.jpg',
    gridC: 'manila-gallery-urban-001.jpg',
    gridD: 'manila-gallery-night-003.jpg',
    gridE: 'manila-gallery-ivy-001.jpg',
    process: 'manila-gallery-dsc-0190.jpg',
    cta: 'manila-gallery-floor-001.jpg',
    ctaB: 'manila-gallery-shadow-001.jpg',
  }

  writeSources({ all_considered: all, selected: selection })

  const images = Object.fromEntries(
    Object.entries(selection).map(([key, file]) => [key, readImage(file)])
  )

  // --- Render static slides (1, 3, 4) as PNGs ---
  const staticSlides = [
    ['01_hook_story.png', wrap(slideOne(images))],
    ['03_process_story.png', wrap(slideThree(images))],
    ['04_cta_story.png', wrap(slideFour(images))]
  ]

  const browser = await chromium.launch()
  const staticCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1
  })

  for (const [filename, html] of staticSlides) {
    const page = await staticCtx.newPage()
    await page.setContent(html, { waitUntil: 'load' })
    await page.waitForTimeout(300)
    await page.screenshot({ path: path.join(OUT_DIR, filename), type: 'png' })
    await page.close()
    console.log(`Rendered ${filename}`)
  }
  await staticCtx.close()

  // --- Render slide 2 as animated MP4 video ---
  console.log('Recording animated collage slide as MP4...')

  // 5 photos * 550ms stagger + 350ms animation + 1500ms hold = ~5 seconds
  const TOTAL_DURATION_MS = 5500

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

  // Convert WebM to MP4
  const videoFiles = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.webm'))
  if (videoFiles.length === 0) {
    console.error('No video file was generated!')
  } else {
    const srcVideo = path.join(OUT_DIR, videoFiles[0])
    const dstVideo = path.join(OUT_DIR, '02_collage_story.mp4')

    const { execSync } = await import('child_process')
    try {
      execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${dstVideo}"`, {
        stdio: 'pipe'
      })
      fs.unlinkSync(srcVideo)
      console.log('Rendered 02_collage_story.mp4')
    } catch (err) {
      console.warn('ffmpeg not available, keeping as webm and renaming to mp4...')
      fs.renameSync(srcVideo, dstVideo)
      console.log('Rendered 02_collage_story.mp4 (webm container)')
    }
  }

  await browser.close()
  console.log(`Done: 3 static PNGs + 1 animated MP4 written to ${OUT_DIR}`)
}

render().catch(error => {
  console.error(error)
  process.exit(1)
})
