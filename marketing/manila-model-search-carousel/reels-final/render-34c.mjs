import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.join(__dirname, 'output-34c')

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 430
const SAFE_TOP = 213
const SAFE_LEFT = 66
const SAFE_RIGHT = 1027

const TOTAL_DURATION_MS = 24000

// Font stacks — use escaped single quotes so they survive injection into
// double-quoted CSS strings inside the browser JS.
const MONO = "\\\"SF Mono\\\", \\\"Menlo\\\", \\\"Courier New\\\", monospace"
const SANS = "\\\"SF Pro Display\\\", \\\"Helvetica Neue\\\", Arial, sans-serif"

// Same font stacks but for use in HTML attributes (no extra escaping needed)
const MONO_HTML = "'SF Mono', 'Menlo', 'Courier New', monospace"
const SANS_HTML = "'SF Pro Display', 'Helvetica Neue', Arial, sans-serif"

function resetOutputDir() {
  fs.rmSync(OUT_DIR, { recursive: true, force: true })
  fs.mkdirSync(OUT_DIR, { recursive: true })
}

function writeSources(payload) {
  fs.writeFileSync(path.join(OUT_DIR, 'sources.json'), JSON.stringify(payload, null, 2))
}

/* ─────────────────────────────────────────────────────────
   Pre-compute visualization HTML strings in Node (no nested
   backtick problem because these are built with concatenation
   in Node-land, then injected as plain strings).
   ───────────────────────────────────────────────────────── */

function buildDNAHelixHTML() {
  const rungs = 24
  let html = '<div style="position:relative;width:200px;height:90%;perspective:600px;">'
  for (let i = 0; i < rungs; i++) {
    const yPct = (i / rungs) * 100
    const phase = (i / rungs) * Math.PI * 4
    const xOff1 = Math.cos(phase) * 60
    const xOff2 = Math.cos(phase + Math.PI) * 60
    const z1 = Math.sin(phase) * 40
    const z2 = Math.sin(phase + Math.PI) * 40
    const opacity1 = (0.5 + (Math.sin(phase) + 1) * 0.25).toFixed(2)
    const opacity2 = (0.5 + (Math.sin(phase + Math.PI) + 1) * 0.25).toFixed(2)
    const hue1 = 200 + i * 5
    const hue2 = 340 + i * 3
    const rungWidth = (Math.abs(xOff1 - xOff2) * 0.6).toFixed(1)
    html += '<div style="position:absolute;top:' + yPct.toFixed(1) + '%;left:50%;transform:translateX(-50%);width:140px;height:2px;display:flex;align-items:center;justify-content:space-between;">'
    html += '<div style="width:16px;height:16px;border-radius:50%;background:hsl(' + hue1 + ',80%,60%);opacity:' + opacity1 + ';box-shadow:0 0 10px hsl(' + hue1 + ',80%,60%);transform:translateX(' + xOff1.toFixed(1) + 'px) translateZ(' + z1.toFixed(1) + 'px);"></div>'
    html += '<div style="position:absolute;left:50%;top:50%;transform:translateX(-50%) translateY(-50%);width:' + rungWidth + 'px;height:2px;background:linear-gradient(90deg,hsl(' + hue1 + ',60%,50%,0.4),hsl(' + hue2 + ',60%,50%,0.4));"></div>'
    html += '<div style="width:16px;height:16px;border-radius:50%;background:hsl(' + hue2 + ',80%,60%);opacity:' + opacity2 + ';box-shadow:0 0 10px hsl(' + hue2 + ',80%,60%);transform:translateX(' + xOff2.toFixed(1) + 'px) translateZ(' + z2.toFixed(1) + 'px);"></div>'
    html += '</div>'
  }
  html += '</div>'
  html += '<div style="position:absolute;bottom:8%;left:0;right:0;text-align:center;font-family:' + SANS_HTML + ';font-size:36px;font-weight:700;color:rgba(255,255,255,0.6);letter-spacing:4px;">DNA HELIX</div>'
  return html
}

function buildSkylineHTML() {
  // Stars
  let html = ''
  for (let i = 0; i < 40; i++) {
    const x = (Math.random() * 100).toFixed(1)
    const y = (Math.random() * 50).toFixed(1)
    const s = (1 + Math.random() * 2).toFixed(1)
    const op = (0.3 + Math.random() * 0.7).toFixed(2)
    html += '<div style="position:absolute;top:' + y + '%;left:' + x + '%;width:' + s + 'px;height:' + s + 'px;background:#fff;border-radius:50%;opacity:' + op + ';"></div>'
  }
  // Moon
  html += '<div style="position:absolute;top:12%;right:15%;width:60px;height:60px;background:radial-gradient(circle at 35% 35%,#ffe,#ddc);border-radius:50%;box-shadow:0 0 40px rgba(255,255,200,0.3);"></div>'

  // Buildings
  const buildings = [
    { x: 0, w: 80, h: 350, color: '#1a1a2e', delay: 0 },
    { x: 70, w: 60, h: 250, color: '#16213e', delay: 0.05 },
    { x: 120, w: 100, h: 450, color: '#0f3460', delay: 0.1 },
    { x: 210, w: 70, h: 300, color: '#1a1a2e', delay: 0.15 },
    { x: 270, w: 110, h: 500, color: '#16213e', delay: 0.2 },
    { x: 370, w: 80, h: 380, color: '#0f3460', delay: 0.25 },
    { x: 440, w: 90, h: 420, color: '#1a1a2e', delay: 0.3 },
    { x: 520, w: 120, h: 550, color: '#16213e', delay: 0.35 },
    { x: 630, w: 70, h: 280, color: '#0f3460', delay: 0.4 },
    { x: 690, w: 100, h: 360, color: '#1a1a2e', delay: 0.45 },
    { x: 780, w: 80, h: 320, color: '#16213e', delay: 0.5 },
    { x: 850, w: 120, h: 480, color: '#0f3460', delay: 0.55 },
  ]

  let buildingsHTML = ''
  buildings.forEach(function(b) {
    let windowsHTML = ''
    const rows = Math.floor(b.h / 35)
    const cols = Math.floor(b.w / 25)
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const lit = Math.random() > 0.35
        const wColor = lit ? (Math.random() > 0.5 ? '#ffd700' : '#ffe4a0') : 'rgba(255,255,255,0.05)'
        const dur = (3 + Math.random() * 4).toFixed(1)
        const del = (Math.random() * 3).toFixed(1)
        const topPx = 12 + r * 35
        const leftPx = 8 + c * 25
        windowsHTML += '<div style="position:absolute;top:' + topPx + 'px;left:' + leftPx + 'px;width:12px;height:18px;background:' + wColor + ';border-radius:1px;'
        if (lit) windowsHTML += 'box-shadow:0 0 4px ' + wColor + ';animation:windowBlink ' + dur + 's ease-in-out ' + del + 's infinite;'
        windowsHTML += '"></div>'
      }
    }
    buildingsHTML += '<div style="position:absolute;bottom:0;left:' + b.x + 'px;width:' + b.w + 'px;height:' + b.h + 'px;background:' + b.color + ';animation:riseUp 0.6s cubic-bezier(0.16,1,0.3,1) ' + b.delay + 's both;">' + windowsHTML + '</div>'
  })

  html += '<div style="position:absolute;bottom:0;left:0;right:0;height:60%;">' + buildingsHTML + '</div>'
  html += '<div style="position:absolute;bottom:8%;left:0;right:0;text-align:center;font-family:' + SANS_HTML + ';font-size:36px;font-weight:700;color:rgba(255,255,255,0.6);letter-spacing:4px;z-index:5;">CITY SKYLINE</div>'
  return html
}

function buildEKGHTML() {
  const svgW = 900
  const svgH = 400
  const ekgPath = 'M 0,200 L 100,200 L 130,200 L 150,180 L 160,200 L 200,200 L 230,200 L 250,50 L 270,350 L 290,150 L 310,200 L 400,200 L 430,200 L 450,180 L 460,200 L 500,200 L 530,200 L 550,50 L 570,350 L 590,150 L 610,200 L 700,200 L 730,200 L 750,180 L 760,200 L 800,200 L 830,200 L 850,50 L 870,350 L 890,150 L 900,200'

  let gridLines = ''
  for (let i = 0; i < 20; i++) {
    gridLines += '<line x1="0" y1="' + (i * 20) + '" x2="' + svgW + '" y2="' + (i * 20) + '" stroke="#00ff88" stroke-width="0.5"/>'
  }
  for (let i = 0; i < 46; i++) {
    gridLines += '<line x1="' + (i * 20) + '" y1="0" x2="' + (i * 20) + '" y2="' + svgH + '" stroke="#00ff88" stroke-width="0.5"/>'
  }

  let html = '<svg width="' + svgW + '" height="' + svgH + '" viewBox="0 0 ' + svgW + ' ' + svgH + '" style="overflow:visible;">'
  html += '<defs><linearGradient id="ekgGrad" x1="0" y1="0" x2="1" y2="0">'
  html += '<stop offset="0%" stop-color="#00ff88" stop-opacity="0.3"/>'
  html += '<stop offset="50%" stop-color="#00ff88" stop-opacity="1"/>'
  html += '<stop offset="100%" stop-color="#00ff88" stop-opacity="0.5"/>'
  html += '</linearGradient></defs>'
  html += '<g opacity="0.08">' + gridLines + '</g>'
  html += '<path d="' + ekgPath + '" fill="none" stroke="url(#ekgGrad)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="2000" style="animation:drawLine 1.2s ease-out forwards;filter:drop-shadow(0 0 8px #00ff88);"/>'
  html += '</svg>'
  html += '<div style="position:absolute;top:12%;right:10%;font-family:' + MONO_HTML + ';font-size:64px;font-weight:700;color:#00ff88;text-shadow:0 0 20px #00ff88;animation:cursorBlink 1s ease-in-out infinite;">72 BPM</div>'
  html += '<div style="position:absolute;bottom:8%;left:0;right:0;text-align:center;font-family:' + SANS_HTML + ';font-size:36px;font-weight:700;color:rgba(255,255,255,0.6);letter-spacing:4px;">HEARTBEAT MONITOR</div>'
  return html
}

/* ─────────────────────────────────────────────────────────
   buildHTML — returns the complete page HTML.

   CRITICAL FIX (v34c): The entire HTML string is built via
   single/double-quoted string concatenation. NO backtick
   template literals anywhere. Font family names that contain
   quotes use escaped double-quotes (\" in the browser JS)
   so they never collide with the JS string delimiters.

   Pre-computed visualization HTML is injected via
   JSON.stringify, which produces a valid JS string literal
   (double-quoted, all special chars escaped).
   ───────────────────────────────────────────────────────── */

function buildHTML() {
  const SW = SAFE_RIGHT - SAFE_LEFT
  const SH = HEIGHT - SAFE_TOP - SAFE_BOTTOM

  // Pre-build complex HTML in Node, then inject as JSON-encoded strings
  const dnaHTML = JSON.stringify(buildDNAHelixHTML())
  const skylineHTML = JSON.stringify(buildSkylineHTML())
  const ekgHTML = JSON.stringify(buildEKGHTML())

  // Chalkboard equations (pre-built in Node)
  const equations = [
    'E = mc\u00B2',
    '\u2207 \u00D7 B = \u03BC\u2080J + \u03BC\u2080\u03B5\u2080 \u2202E/\u2202t',
    'i\u0127 \u2202\u03C8/\u2202t = H\u0302\u03C8',
    'ds\u00B2 = -(1-2GM/rc\u00B2)dt\u00B2',
    'S = k\u2082 ln \u03A9',
    '\u2207\u00B2\u03C6 = 4\u03C0G\u03C1',
  ]
  const equationsJSON = JSON.stringify(equations)

  // Solar system HTML (pre-built as a string, no backticks)
  let solarHTML = ''
  solarHTML += '<div style="position:relative;width:500px;height:500px;">'
  // Orbit rings
  solarHTML += '<div style="position:absolute;top:50%;left:50%;width:160px;height:160px;border:1px solid rgba(255,255,255,0.08);border-radius:50%;transform:translate(-50%,-50%);"></div>'
  solarHTML += '<div style="position:absolute;top:50%;left:50%;width:260px;height:260px;border:1px solid rgba(255,255,255,0.06);border-radius:50%;transform:translate(-50%,-50%);"></div>'
  solarHTML += '<div style="position:absolute;top:50%;left:50%;width:370px;height:370px;border:1px solid rgba(255,255,255,0.05);border-radius:50%;transform:translate(-50%,-50%);"></div>'
  solarHTML += '<div style="position:absolute;top:50%;left:50%;width:480px;height:480px;border:1px solid rgba(255,255,255,0.04);border-radius:50%;transform:translate(-50%,-50%);"></div>'
  // Sun
  solarHTML += '<div style="position:absolute;top:50%;left:50%;width:50px;height:50px;background:radial-gradient(circle,#fff 0%,#ffd700 30%,#ff8c00 70%,transparent 100%);border-radius:50%;transform:translate(-50%,-50%);animation:sunPulse 2s ease-in-out infinite;"></div>'
  // Planets
  solarHTML += '<div style="position:absolute;top:50%;left:50%;width:0;height:0;animation:orbit1 3s linear infinite;"><div style="width:14px;height:14px;border-radius:50%;background:radial-gradient(circle at 30% 30%,#8cc,#466);box-shadow:0 0 8px rgba(100,200,200,0.5);transform:translate(-50%,-50%);"></div></div>'
  solarHTML += '<div style="position:absolute;top:50%;left:50%;width:0;height:0;animation:orbit2 5s linear infinite;"><div style="width:22px;height:22px;border-radius:50%;background:radial-gradient(circle at 30% 30%,#6af,#248);box-shadow:0 0 12px rgba(80,150,255,0.5);transform:translate(-50%,-50%);"></div></div>'
  solarHTML += '<div style="position:absolute;top:50%;left:50%;width:0;height:0;animation:orbit3 7s linear infinite;"><div style="width:18px;height:18px;border-radius:50%;background:radial-gradient(circle at 30% 30%,#e84,#a42);box-shadow:0 0 10px rgba(230,100,60,0.5);transform:translate(-50%,-50%);"></div></div>'
  solarHTML += '<div style="position:absolute;top:50%;left:50%;width:0;height:0;animation:orbit4 10s linear infinite;"><div style="width:30px;height:30px;border-radius:50%;background:radial-gradient(circle at 30% 30%,#fa6,#a64);box-shadow:0 0 15px rgba(255,170,80,0.4);transform:translate(-50%,-50%);"></div></div>'
  solarHTML += '</div>'
  // Stars
  solarHTML += '<div style="position:absolute;top:10%;left:15%;width:2px;height:2px;background:#fff;border-radius:50%;box-shadow:0 0 4px #fff;animation:cursorBlink 2s ease-in-out infinite;"></div>'
  solarHTML += '<div style="position:absolute;top:25%;right:20%;width:3px;height:3px;background:#fff;border-radius:50%;box-shadow:0 0 6px #fff;animation:cursorBlink 3s ease-in-out 0.5s infinite;"></div>'
  solarHTML += '<div style="position:absolute;bottom:20%;left:25%;width:2px;height:2px;background:#fff;border-radius:50%;box-shadow:0 0 4px #fff;animation:cursorBlink 2.5s ease-in-out 1s infinite;"></div>'
  solarHTML += '<div style="position:absolute;top:60%;right:10%;width:2px;height:2px;background:#fff;border-radius:50%;box-shadow:0 0 4px #fff;animation:cursorBlink 1.8s ease-in-out 0.3s infinite;"></div>'
  solarHTML += '<div style="position:absolute;bottom:8%;left:0;right:0;text-align:center;font-family:' + SANS_HTML + ';font-size:36px;font-weight:700;color:rgba(255,255,255,0.6);letter-spacing:4px;">SOLAR SYSTEM</div>'
  const solarJSON = JSON.stringify(solarHTML)

  // Matrix characters
  const matrixChars = '\u30A2\u30A4\u30A6\u30A8\u30AA\u30AB\u30AD\u30AF\u30B1\u30B3\u30B5\u30B7\u30B9\u30BB\u30BD\u30BF\u30C1\u30C4\u30C6\u30C80123456789ABCDEF'
  const matrixCharsJSON = JSON.stringify(matrixChars)

  // ═══════════════════════════════════════════════════════
  // Build the full HTML page as a single concatenated string.
  // ZERO backtick template literals anywhere in this function.
  // Font families inside browser JS use escaped double-quotes
  // so they sit safely inside double-quoted cssText strings.
  // ═══════════════════════════════════════════════════════

  var page = ''

  // ── head + CSS ──
  page += '<!DOCTYPE html>\n<html>\n<head>\n<style>\n'
  page += '* { box-sizing: border-box; margin: 0; padding: 0; }\n'
  page += 'html, body { margin: 0; padding: 0; background: #0a0a0a; overflow: hidden; }\n'
  page += '\n'
  page += '@keyframes cursorBlink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }\n'
  page += '@keyframes textGlow { 0%, 100% { text-shadow: 0 0 20px rgba(255,255,255,0.3), 0 0 40px rgba(255,255,255,0.1); } 50% { text-shadow: 0 0 40px rgba(255,255,255,0.6), 0 0 80px rgba(255,255,255,0.3), 0 0 120px rgba(100,200,255,0.15); } }\n'
  page += '@keyframes fadeInUp { 0% { opacity: 0; transform: translateY(40px); } 100% { opacity: 1; transform: translateY(0); } }\n'
  page += '@keyframes fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }\n'
  page += '@keyframes fadeOut { 0% { opacity: 1; } 100% { opacity: 0; } }\n'
  page += '@keyframes scaleIn { 0% { opacity: 0; transform: scale(0.5); } 60% { opacity: 1; transform: scale(1.05); } 100% { opacity: 1; transform: scale(1); } }\n'
  page += '@keyframes punchIn { 0% { opacity: 0; transform: scale(2) translateY(10px); filter: blur(8px); } 60% { opacity: 1; transform: scale(0.95) translateY(-2px); filter: blur(0); } 100% { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); } }\n'
  page += '@keyframes glowPulse { 0%, 100% { box-shadow: 0 0 20px rgba(100,200,255,0.3); } 50% { box-shadow: 0 0 60px rgba(100,200,255,0.6), 0 0 100px rgba(100,200,255,0.2); } }\n'
  page += '@keyframes starFloat { 0% { opacity: 0; transform: translateY(0) scale(0.5); } 20% { opacity: 1; } 80% { opacity: 1; } 100% { opacity: 0; transform: translateY(-200px) scale(0.2); } }\n'
  page += '@keyframes driftSlow { 0% { transform: translateY(0) translateX(0); } 50% { transform: translateY(-30px) translateX(15px); } 100% { transform: translateY(0) translateX(0); } }\n'
  page += '@keyframes chalkWrite { 0% { width: 0; opacity: 0.8; } 100% { width: 100%; opacity: 1; } }\n'
  page += '@keyframes helixSpin { 0% { transform: rotateY(0deg); } 100% { transform: rotateY(360deg); } }\n'
  page += '@keyframes orbit1 { 0% { transform: rotate(0deg) translateX(80px) rotate(0deg); } 100% { transform: rotate(360deg) translateX(80px) rotate(-360deg); } }\n'
  page += '@keyframes orbit2 { 0% { transform: rotate(0deg) translateX(130px) rotate(0deg); } 100% { transform: rotate(360deg) translateX(130px) rotate(-360deg); } }\n'
  page += '@keyframes orbit3 { 0% { transform: rotate(0deg) translateX(185px) rotate(0deg); } 100% { transform: rotate(360deg) translateX(185px) rotate(-360deg); } }\n'
  page += '@keyframes orbit4 { 0% { transform: rotate(0deg) translateX(240px) rotate(0deg); } 100% { transform: rotate(360deg) translateX(240px) rotate(-360deg); } }\n'
  page += '@keyframes sunPulse { 0%, 100% { box-shadow: 0 0 30px rgba(255,200,50,0.6), 0 0 60px rgba(255,150,0,0.3); } 50% { box-shadow: 0 0 50px rgba(255,200,50,0.8), 0 0 100px rgba(255,150,0,0.5); } }\n'
  page += '@keyframes riseUp { 0% { transform: translateY(100%); } 100% { transform: translateY(0); } }\n'
  page += '@keyframes windowBlink { 0%, 100% { opacity: 1; } 30% { opacity: 0.3; } 60% { opacity: 0.9; } }\n'
  page += '@keyframes drawLine { 0% { stroke-dashoffset: 2000; } 100% { stroke-dashoffset: 0; } }\n'
  page += '@keyframes matrixFall { 0% { transform: translateY(-100%); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(100vh); opacity: 0; } }\n'
  page += '@keyframes matrixGlow { 0%, 100% { color: #00ff41; text-shadow: 0 0 8px #00ff41; } 50% { color: #80ff80; text-shadow: 0 0 20px #00ff41, 0 0 40px #00ff41; } }\n'
  page += '@keyframes zoomBlur { 0% { opacity: 0; transform: scale(1.5); filter: blur(20px); } 100% { opacity: 1; transform: scale(1); filter: blur(0); } }\n'
  page += '@keyframes readyGlow { 0%, 100% { text-shadow: 0 0 30px rgba(100,200,255,0.5), 0 0 60px rgba(100,200,255,0.3); } 50% { text-shadow: 0 0 60px rgba(100,200,255,0.9), 0 0 120px rgba(100,200,255,0.5), 0 0 200px rgba(100,150,255,0.3); } }\n'
  page += '@keyframes brandShine { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }\n'
  page += '\n</style>\n</head>\n<body>\n'

  // ── body structure ──
  page += '<div id="root" style="width:' + WIDTH + 'px;height:' + HEIGHT + 'px;position:relative;overflow:hidden;background:#0a0a0a;">\n'
  page += '<div id="particles" style="position:absolute;inset:0;z-index:1;pointer-events:none;overflow:hidden;"></div>\n'
  page += '<div id="scene" style="position:absolute;top:' + SAFE_TOP + 'px;left:' + SAFE_LEFT + 'px;width:' + SW + 'px;height:' + SH + 'px;z-index:10;overflow:hidden;display:flex;align-items:center;justify-content:center;"></div>\n'
  page += '</div>\n'

  // ── script — ALL browser JS uses single/double quotes, ZERO backticks ──
  page += '<script>\n'
  page += 'var scene = document.getElementById("scene");\n'
  page += 'var particles = document.getElementById("particles");\n'
  page += 'var W = ' + SW + ';\n'
  page += 'var H = ' + SH + ';\n'
  page += '\n'

  // Ambient particles
  page += '(function spawnParticles() {\n'
  page += '  for (var i = 0; i < 30; i++) {\n'
  page += '    var p = document.createElement("div");\n'
  page += '    var x = Math.random() * ' + WIDTH + ';\n'
  page += '    var y = Math.random() * ' + HEIGHT + ';\n'
  page += '    var size = 1 + Math.random() * 3;\n'
  page += '    var dur = 4 + Math.random() * 6;\n'
  page += '    var delay = Math.random() * 5;\n'
  page += '    p.style.cssText = "position:absolute;border-radius:50%;background:rgba(100,180,255,0.3);pointer-events:none;";\n'
  page += '    p.style.width = size + "px";\n'
  page += '    p.style.height = size + "px";\n'
  page += '    p.style.left = x + "px";\n'
  page += '    p.style.top = y + "px";\n'
  page += '    p.style.animation = "driftSlow " + dur + "s ease-in-out " + delay + "s infinite";\n'
  page += '    particles.appendChild(p);\n'
  page += '  }\n'
  page += '})();\n'
  page += '\n'
  page += 'function clearScene() { scene.innerHTML = ""; }\n'
  page += '\n'

  // ═══ SCENE 1 (0-3s): Terminal + WELCOME TO THE FUTURE ═══
  page += '(function scene1() {\n'
  page += '  var container = document.createElement("div");\n'
  page += '  container.style.cssText = "display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%;";\n'
  page += '  var termLine = document.createElement("div");\n'
  page += '  termLine.style.cssText = "font-family:' + MONO + ';font-size:24px;color:#4af;letter-spacing:2px;margin-bottom:40px;opacity:0;";\n'
  page += '  termLine.innerHTML = \'<span style="color:#4af;">$</span> <span style="color:#888;">claude-code</span> <span id="cursor1" style="display:inline-block;width:12px;height:24px;background:#4af;vertical-align:middle;animation:cursorBlink 0.8s step-end infinite;"></span>\';\n'
  page += '  container.appendChild(termLine);\n'
  page += '  var title = document.createElement("div");\n'
  page += '  title.id = "welcome-title";\n'
  page += '  title.style.cssText = "font-family:' + SANS + ';font-weight:800;font-size:72px;color:#fff;text-align:center;letter-spacing:6px;text-transform:uppercase;opacity:0;line-height:1.15;";\n'
  page += '  title.innerHTML = "WELCOME<br>TO THE<br>FUTURE";\n'
  page += '  container.appendChild(title);\n'
  page += '  scene.appendChild(container);\n'
  page += '  setTimeout(function() { termLine.style.opacity = "1"; termLine.style.animation = "fadeIn 0.3s ease-out forwards"; }, 200);\n'
  page += '  setTimeout(function() {\n'
  page += '    termLine.style.opacity = "0";\n'
  page += '    var t = document.getElementById("welcome-title");\n'
  page += '    if (t) { t.style.opacity = "1"; t.style.animation = "punchIn 0.8s cubic-bezier(0.16,1,0.3,1) forwards"; }\n'
  page += '  }, 1200);\n'
  page += '  setTimeout(function() {\n'
  page += '    var t = document.getElementById("welcome-title");\n'
  page += '    if (t) t.style.animation = "textGlow 2s ease-in-out infinite";\n'
  page += '  }, 2200);\n'
  page += '})();\n'
  page += '\n'

  // ═══ SCENE 2 (3-7s): "Imagine you could tell any story..." ═══
  page += 'setTimeout(function() {\n'
  page += '  clearScene();\n'
  page += '  var container = document.createElement("div");\n'
  page += '  container.style.cssText = "display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%;padding:30px;gap:0;";\n'
  page += '  var lines = [\n'
  page += '    { text: "Imagine you could", delay: 0, size: "48px", color: "rgba(255,255,255,0.7)" },\n'
  page += '    { text: "tell any story", delay: 800, size: "56px", color: "#fff" },\n'
  page += '    { text: "you want.", delay: 1600, size: "56px", color: "#fff" },\n'
  page += '    { text: "Exactly how", delay: 2400, size: "48px", color: "rgba(255,255,255,0.7)" },\n'
  page += '    { text: "you wanted.", delay: 3000, size: "60px", color: "#4af" }\n'
  page += '  ];\n'
  page += '  lines.forEach(function(l) {\n'
  page += '    var el = document.createElement("div");\n'
  page += '    el.style.cssText = "font-family:' + SANS + ';font-weight:700;text-align:center;letter-spacing:2px;opacity:0;margin:8px 0;";\n'
  page += '    el.style.fontSize = l.size;\n'
  page += '    el.style.color = l.color;\n'
  page += '    el.textContent = l.text;\n'
  page += '    container.appendChild(el);\n'
  page += '    setTimeout(function() { el.style.animation = "fadeInUp 0.7s cubic-bezier(0.16,1,0.3,1) forwards"; }, l.delay);\n'
  page += '  });\n'
  page += '  scene.appendChild(container);\n'
  page += '}, 3000);\n'
  page += '\n'

  // ═══ SCENE 3a (7-8.5s): Chalkboard equations ═══
  page += 'setTimeout(function() {\n'
  page += '  clearScene();\n'
  page += '  var container = document.createElement("div");\n'
  page += '  container.style.cssText = "width:100%;height:100%;background:#1a2a1a;border-radius:12px;position:relative;overflow:hidden;animation:zoomBlur 0.4s ease-out forwards;";\n'
  page += '  var inner = "";\n'
  page += '  inner += \'<div style="position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.02) 0%,transparent 50%,rgba(255,255,255,0.01) 100%);"></div>\';\n'
  page += '  inner += \'<div style="position:absolute;top:8%;left:0;right:0;text-align:center;font-family:' + SANS + ';font-size:28px;color:rgba(255,255,200,0.5);letter-spacing:6px;text-transform:uppercase;">Chalkboard</div>\';\n'
  page += '  inner += \'<div id="eq-container" style="position:absolute;top:18%;left:8%;right:8%;bottom:10%;display:flex;flex-direction:column;gap:20px;justify-content:center;"></div>\';\n'
  page += '  container.innerHTML = inner;\n'
  page += '  scene.appendChild(container);\n'
  page += '  var equations = ' + equationsJSON + ';\n'
  page += '  var eqC = document.getElementById("eq-container");\n'
  page += '  equations.forEach(function(eq, i) {\n'
  page += '    var line = document.createElement("div");\n'
  page += '    line.style.cssText = "font-family:Georgia,serif;color:rgba(255,255,240,0.9);text-shadow:0 0 6px rgba(255,255,200,0.3);letter-spacing:3px;opacity:0;overflow:hidden;white-space:nowrap;";\n'
  page += '    line.style.fontSize = (i === 0 ? "52px" : "32px");\n'
  page += '    line.style.fontStyle = (i > 0 ? "italic" : "normal");\n'
  page += '    line.textContent = eq;\n'
  page += '    eqC.appendChild(line);\n'
  page += '    setTimeout(function() { line.style.animation = "fadeIn 0.25s ease-out forwards"; }, i * 200);\n'
  page += '  });\n'
  page += '}, 7000);\n'
  page += '\n'

  // ═══ SCENE 3b (8.5-10s): DNA Helix ═══
  page += 'setTimeout(function() {\n'
  page += '  clearScene();\n'
  page += '  var container = document.createElement("div");\n'
  page += '  container.style.cssText = "width:100%;height:100%;display:flex;align-items:center;justify-content:center;position:relative;animation:zoomBlur 0.3s ease-out forwards;";\n'
  page += '  container.innerHTML = ' + dnaHTML + ';\n'
  page += '  scene.appendChild(container);\n'
  page += '}, 8500);\n'
  page += '\n'

  // ═══ SCENE 3c (10-11.5s): Solar System ═══
  page += 'setTimeout(function() {\n'
  page += '  clearScene();\n'
  page += '  var container = document.createElement("div");\n'
  page += '  container.style.cssText = "width:100%;height:100%;display:flex;align-items:center;justify-content:center;position:relative;animation:zoomBlur 0.3s ease-out forwards;background:radial-gradient(ellipse at center, #0a0a2a 0%, #0a0a0a 100%);";\n'
  page += '  container.innerHTML = ' + solarJSON + ';\n'
  page += '  scene.appendChild(container);\n'
  page += '}, 10000);\n'
  page += '\n'

  // ═══ SCENE 3d (11.5-13s): City Skyline ═══
  page += 'setTimeout(function() {\n'
  page += '  clearScene();\n'
  page += '  var container = document.createElement("div");\n'
  page += '  container.style.cssText = "width:100%;height:100%;position:relative;overflow:hidden;animation:fadeIn 0.3s ease-out forwards;background:linear-gradient(180deg,#0a0a2a 0%,#1a1040 40%,#2a1050 70%,#3a1560 100%);";\n'
  page += '  container.innerHTML = ' + skylineHTML + ';\n'
  page += '  scene.appendChild(container);\n'
  page += '}, 11500);\n'
  page += '\n'

  // ═══ SCENE 3e (13-14.5s): EKG Heartbeat ═══
  page += 'setTimeout(function() {\n'
  page += '  clearScene();\n'
  page += '  var container = document.createElement("div");\n'
  page += '  container.style.cssText = "width:100%;height:100%;display:flex;align-items:center;justify-content:center;position:relative;animation:zoomBlur 0.3s ease-out forwards;background:#0a0a0a;";\n'
  page += '  container.innerHTML = ' + ekgHTML + ';\n'
  page += '  scene.appendChild(container);\n'
  page += '}, 13000);\n'
  page += '\n'

  // ═══ SCENE 3f (14.5-16s): Matrix Rain ═══
  page += 'setTimeout(function() {\n'
  page += '  clearScene();\n'
  page += '  var container = document.createElement("div");\n'
  page += '  container.style.cssText = "width:100%;height:100%;position:relative;overflow:hidden;animation:fadeIn 0.2s ease-out forwards;background:#000a00;";\n'
  page += '  var chars = ' + matrixCharsJSON + ';\n'
  page += '  var columns = 25;\n'
  page += '  var colWidth = Math.floor(W / columns);\n'
  page += '  for (var c = 0; c < columns; c++) {\n'
  page += '    var col = document.createElement("div");\n'
  page += '    col.style.cssText = "position:absolute;top:0;font-family:' + MONO + ';font-size:22px;line-height:28px;color:#00ff41;text-shadow:0 0 8px #00ff41;writing-mode:vertical-lr;white-space:nowrap;";\n'
  page += '    col.style.left = (c * colWidth) + "px";\n'
  page += '    col.style.animation = "matrixFall " + (1 + Math.random() * 1.5) + "s linear " + (Math.random() * 0.8) + "s both";\n'
  page += '    col.style.opacity = String(0.3 + Math.random() * 0.7);\n'
  page += '    var text = "";\n'
  page += '    var len = 15 + Math.floor(Math.random() * 25);\n'
  page += '    for (var j = 0; j < len; j++) { text += chars[Math.floor(Math.random() * chars.length)]; }\n'
  page += '    col.textContent = text;\n'
  page += '    container.appendChild(col);\n'
  page += '  }\n'
  page += '  var label = document.createElement("div");\n'
  page += '  label.style.cssText = "position:absolute;bottom:8%;left:0;right:0;text-align:center;font-family:' + SANS + ';font-size:36px;font-weight:700;color:rgba(0,255,65,0.7);letter-spacing:4px;z-index:5;text-shadow:0 0 20px rgba(0,255,65,0.5);";\n'
  page += '  label.textContent = "MATRIX RAIN";\n'
  page += '  container.appendChild(label);\n'
  page += '  scene.appendChild(container);\n'
  page += '}, 14500);\n'
  page += '\n'

  // ═══ SCENE 4 (16-19s): "Any animation. Any graphic. Any visualization." ═══
  page += 'setTimeout(function() {\n'
  page += '  clearScene();\n'
  page += '  var container = document.createElement("div");\n'
  page += '  container.style.cssText = "display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%;gap:50px;";\n'
  page += '  var phrases = [\n'
  page += '    { text: "Any animation.", delay: 0 },\n'
  page += '    { text: "Any graphic.", delay: 800 },\n'
  page += '    { text: "Any visualization.", delay: 1600 }\n'
  page += '  ];\n'
  page += '  phrases.forEach(function(p) {\n'
  page += '    var el = document.createElement("div");\n'
  page += '    el.style.cssText = "font-family:' + SANS + ';font-weight:800;font-size:64px;color:#fff;text-align:center;letter-spacing:3px;opacity:0;";\n'
  page += '    el.textContent = p.text;\n'
  page += '    container.appendChild(el);\n'
  page += '    setTimeout(function() { el.style.animation = "punchIn 0.5s cubic-bezier(0.16,1,0.3,1) forwards"; }, p.delay);\n'
  page += '  });\n'
  page += '  scene.appendChild(container);\n'
  page += '}, 16000);\n'
  page += '\n'

  // ═══ SCENE 5 (19-24s): "ARE YOU READY?" + branding ═══
  page += 'setTimeout(function() {\n'
  page += '  clearScene();\n'
  page += '  var container = document.createElement("div");\n'
  page += '  container.style.cssText = "display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%;gap:40px;";\n'
  page += '  var ready = document.createElement("div");\n'
  page += '  ready.id = "ready-text";\n'
  page += '  ready.style.cssText = "font-family:' + SANS + ';font-weight:900;font-size:80px;color:#fff;text-align:center;letter-spacing:6px;opacity:0;line-height:1.1;";\n'
  page += '  ready.textContent = "ARE YOU READY?";\n'
  page += '  container.appendChild(ready);\n'
  page += '  var divider = document.createElement("div");\n'
  page += '  divider.id = "divider";\n'
  page += '  divider.style.cssText = "width:200px;height:2px;background:linear-gradient(90deg,transparent,#4af,transparent);opacity:0;";\n'
  page += '  container.appendChild(divider);\n'
  page += '  var brand = document.createElement("div");\n'
  page += '  brand.id = "brand-name";\n'
  page += '  brand.style.cssText = "font-family:' + SANS + ';font-weight:800;font-size:68px;letter-spacing:4px;opacity:0;text-align:center;background:linear-gradient(90deg,#4af,#a78bfa,#f472b6,#4af);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;";\n'
  page += '  brand.textContent = "Claude Code";\n'
  page += '  container.appendChild(brand);\n'
  page += '  var tagline = document.createElement("div");\n'
  page += '  tagline.id = "tagline";\n'
  page += '  tagline.style.cssText = "font-family:' + SANS + ';font-weight:500;font-size:36px;color:rgba(255,255,255,0.6);letter-spacing:6px;text-transform:uppercase;opacity:0;text-align:center;";\n'
  page += '  tagline.textContent = "The future of building.";\n'
  page += '  container.appendChild(tagline);\n'
  page += '  scene.appendChild(container);\n'
  page += '  setTimeout(function() { var r = document.getElementById("ready-text"); if (r) { r.style.animation = "punchIn 0.6s cubic-bezier(0.16,1,0.3,1) forwards"; } }, 200);\n'
  page += '  setTimeout(function() { var r = document.getElementById("ready-text"); if (r) r.style.animation = "readyGlow 1.5s ease-in-out infinite"; }, 1200);\n'
  page += '  setTimeout(function() { var d = document.getElementById("divider"); if (d) d.style.animation = "fadeIn 0.5s ease-out forwards"; }, 1500);\n'
  page += '  setTimeout(function() { var b = document.getElementById("brand-name"); if (b) { b.style.animation = "scaleIn 0.7s cubic-bezier(0.16,1,0.3,1) forwards"; } }, 2000);\n'
  page += '  setTimeout(function() { var b = document.getElementById("brand-name"); if (b) b.style.animation = "brandShine 3s linear infinite"; }, 2800);\n'
  page += '  setTimeout(function() { var t = document.getElementById("tagline"); if (t) t.style.animation = "fadeInUp 0.6s ease-out forwards"; }, 3000);\n'
  page += '}, 19000);\n'
  page += '\n'
  page += '</script>\n</body>\n</html>'

  return page
}

async function render() {
  resetOutputDir()

  writeSources({
    createdAt: new Date().toISOString(),
    strategy: 'v34c — Claude Code showcase (nested template literal bug fully fixed)',
    safeBottomPixels: SAFE_BOTTOM,
  })

  // Write the HTML to a debug file so we can inspect it
  const html = buildHTML()
  const debugHTML = path.join(OUT_DIR, 'debug-page.html')
  fs.writeFileSync(debugHTML, html)
  console.log('Wrote debug HTML to ' + debugHTML)

  // Verify no backticks leaked into the generated HTML
  if (html.indexOf('`') !== -1) {
    console.error('BUG: backtick found in generated HTML! Aborting.')
    process.exit(1)
  }
  console.log('Verified: zero backticks in generated HTML (' + html.length + ' chars)')

  const browser = await chromium.launch()
  console.log('Recording Claude Code showcase v34c...')

  const videoCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    recordVideo: { dir: OUT_DIR, size: { width: WIDTH, height: HEIGHT } }
  })

  const videoPage = await videoCtx.newPage()

  // Set background before loading content
  await videoPage.evaluate(function() {
    document.documentElement.style.background = '#0a0a0a'
    document.body.style.background = '#0a0a0a'
  })

  await videoPage.setContent(html, { waitUntil: 'load' })

  // Check for JS errors in the page
  videoPage.on('pageerror', function(err) {
    console.error('PAGE JS ERROR:', err.message)
  })

  await videoPage.waitForTimeout(500)
  await videoPage.waitForTimeout(TOTAL_DURATION_MS)

  await videoPage.close()
  await videoCtx.close()
  await browser.close()

  const videoFiles = fs.readdirSync(OUT_DIR).filter(function(f) { return f.endsWith('.webm') })
  if (videoFiles.length === 0) {
    console.error('No video file was generated!')
    return
  }

  const srcVideo = path.join(OUT_DIR, videoFiles[0])
  const stats = fs.statSync(srcVideo)
  console.log('WebM file size: ' + (stats.size / 1024).toFixed(1) + ' KB')

  if (stats.size < 10000) {
    console.error('WARNING: WebM file is suspiciously small (' + stats.size + ' bytes) — likely a blank recording')
  }

  const dstVideo = path.join(OUT_DIR, 'claude-code-showcase-v34c.mp4')

  var execSync = (await import('child_process')).execSync
  try {
    execSync('ffmpeg -y -i "' + srcVideo + '" -c:v libx264 -pix_fmt yuv420p -r 30 -an "' + dstVideo + '"', { stdio: 'pipe' })
    fs.unlinkSync(srcVideo)
    console.log('Rendered claude-code-showcase-v34c.mp4')
  } catch (err) {
    console.warn('ffmpeg conversion failed, keeping webm as fallback...')
    var webmDst = path.join(OUT_DIR, 'claude-code-showcase-v34c.webm')
    fs.renameSync(srcVideo, webmDst)
    console.log('Saved as ' + webmDst)
  }

  // Copy to videos directory
  var videosDir = path.join(__dirname, 'videos')
  if (!fs.existsSync(videosDir)) fs.mkdirSync(videosDir, { recursive: true })
  var finalVideo = fs.existsSync(dstVideo) ? dstVideo : path.join(OUT_DIR, 'claude-code-showcase-v34c.webm')
  var finalName = fs.existsSync(dstVideo) ? 'claude-code-showcase-v34c.mp4' : 'claude-code-showcase-v34c.webm'
  fs.copyFileSync(finalVideo, path.join(videosDir, finalName))
  console.log('Copied to videos/' + finalName)

  console.log('Done: output written to ' + OUT_DIR)
}

render().catch(function(error) {
  console.error(error)
  process.exit(1)
})
