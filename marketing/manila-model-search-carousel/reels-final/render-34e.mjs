import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

var __dirname = path.dirname(fileURLToPath(import.meta.url))
var OUT_DIR = path.join(__dirname, 'output-34e')
var REPO_ROOT = path.resolve(__dirname, '../../..')

var WIDTH = 1080
var HEIGHT = 1920
var SAFE_BOTTOM = 430
var SAFE_TOP = 213
var SAFE_LEFT = 66
var SAFE_RIGHT = 1027

var TOTAL_DURATION_MS = 22000

// Font stacks — use escaped single quotes so they survive injection into
// double-quoted CSS strings inside the browser JS.
var MONO = "\\\"SF Mono\\\", \\\"Menlo\\\", \\\"Courier New\\\", monospace"
var SANS = "\\\"SF Pro Display\\\", \\\"Helvetica Neue\\\", Arial, sans-serif"

// Same font stacks but for use in HTML attributes (no extra escaping needed)
var MONO_HTML = "'SF Mono', 'Menlo', 'Courier New', monospace"
var SANS_HTML = "'SF Pro Display', 'Helvetica Neue', Arial, sans-serif"

var PROOF_PHOTOS = [
  'manila-gallery-dsc-0190.jpg',
  'manila-gallery-night-001.jpg',
  'manila-gallery-garden-001.jpg',
  'manila-gallery-urban-001.jpg',
  'manila-gallery-canal-001.jpg',
]

function resetOutputDir() {
  fs.rmSync(OUT_DIR, { recursive: true, force: true })
  fs.mkdirSync(OUT_DIR, { recursive: true })
}

function writeSources(payload) {
  fs.writeFileSync(path.join(OUT_DIR, 'sources.json'), JSON.stringify(payload, null, 2))
}

/* ─────────────────────────────────────────────────────────
   Load photos as base64 data URIs
   ───────────────────────────────────────────────────────── */
function loadPhotosAsDataURIs() {
  var uris = []
  var imgDir = path.join(REPO_ROOT, 'public/images/large')
  PROOF_PHOTOS.forEach(function(filename) {
    var filePath = path.join(imgDir, filename)
    if (fs.existsSync(filePath)) {
      var buf = fs.readFileSync(filePath)
      var b64 = buf.toString('base64')
      uris.push('data:image/jpeg;base64,' + b64)
    } else {
      console.warn('Photo not found: ' + filePath)
      uris.push('')
    }
  })
  return uris
}

/* ─────────────────────────────────────────────────────────
   Pre-compute PHOTOGRAPHY visualization HTML strings in Node.
   All built with concatenation — no backticks.
   ───────────────────────────────────────────────────────── */

function buildApertureHTML() {
  // Camera aperture iris — 8 overlapping rounded rectangles rotated at 45deg intervals
  var html = '<div style="position:relative;width:400px;height:400px;display:flex;align-items:center;justify-content:center;">'
  // Outer ring
  html += '<div style="position:absolute;width:380px;height:380px;border:3px solid rgba(255,255,255,0.15);border-radius:50%;"></div>'
  // 8 aperture blades
  for (var i = 0; i < 8; i++) {
    var angle = i * 45
    var delay = (i * 0.05).toFixed(2)
    html += '<div style="position:absolute;width:140px;height:50px;background:linear-gradient(135deg,#2a2a3a,#1a1a2a);border-radius:25px;border:1px solid rgba(255,255,255,0.1);transform-origin:center center;transform:rotate(' + angle + 'deg) translateX(80px);animation:irisClose 1.2s ease-in-out ' + delay + 's infinite alternate;"></div>'
  }
  // Center lens element
  html += '<div style="position:absolute;width:100px;height:100px;border-radius:50%;background:radial-gradient(circle,rgba(100,180,255,0.4) 0%,rgba(60,120,200,0.2) 50%,transparent 70%);box-shadow:0 0 30px rgba(100,180,255,0.3);animation:lensPulse 1.2s ease-in-out infinite alternate;"></div>'
  // Inner highlight
  html += '<div style="position:absolute;width:60px;height:60px;border-radius:50%;background:radial-gradient(circle at 35% 35%,rgba(255,255,255,0.3),transparent 60%);"></div>'
  html += '</div>'
  html += '<div style="position:absolute;bottom:8%;left:0;right:0;text-align:center;font-family:' + SANS_HTML + ';font-size:36px;font-weight:700;color:rgba(255,255,255,0.6);letter-spacing:4px;">APERTURE</div>'
  return html
}

function buildColorWheelHTML() {
  // Color wheel with conic gradient and labels
  var html = '<div style="position:relative;width:400px;height:400px;display:flex;align-items:center;justify-content:center;">'
  // The wheel itself
  html += '<div style="width:340px;height:340px;border-radius:50%;background:conic-gradient(from 0deg,hsl(0,85%,55%),hsl(30,85%,55%),hsl(60,85%,55%),hsl(90,85%,55%),hsl(120,85%,55%),hsl(150,85%,55%),hsl(180,85%,55%),hsl(210,85%,55%),hsl(240,85%,55%),hsl(270,85%,55%),hsl(300,85%,55%),hsl(330,85%,55%),hsl(360,85%,55%));animation:wheelSpin 4s linear infinite;box-shadow:0 0 40px rgba(255,100,100,0.2),0 0 80px rgba(100,100,255,0.1);"></div>'
  // Center hole
  html += '<div style="position:absolute;width:120px;height:120px;border-radius:50%;background:#0a0a0a;box-shadow:inset 0 0 30px rgba(0,0,0,0.8);"></div>'
  // Center text
  html += '<div style="position:absolute;font-family:' + SANS_HTML + ';font-size:18px;font-weight:700;color:rgba(255,255,255,0.7);letter-spacing:2px;">COLOR</div>'
  // Warm label
  html += '<div style="position:absolute;top:5%;right:5%;font-family:' + SANS_HTML + ';font-size:22px;font-weight:600;color:#ff6644;letter-spacing:2px;text-shadow:0 0 10px rgba(255,100,50,0.5);">WARM</div>'
  // Cool label
  html += '<div style="position:absolute;bottom:5%;left:5%;font-family:' + SANS_HTML + ';font-size:22px;font-weight:600;color:#4488ff;letter-spacing:2px;text-shadow:0 0 10px rgba(50,100,255,0.5);">COOL</div>'
  html += '</div>'
  html += '<div style="position:absolute;bottom:8%;left:0;right:0;text-align:center;font-family:' + SANS_HTML + ';font-size:36px;font-weight:700;color:rgba(255,255,255,0.6);letter-spacing:4px;">COLOR THEORY</div>'
  return html
}

function buildRuleOfThirdsHTML() {
  // Rule of thirds grid — 4 lines drawing on screen
  var html = '<div style="position:relative;width:90%;height:80%;border:2px solid rgba(255,255,255,0.15);border-radius:8px;overflow:hidden;background:linear-gradient(135deg,#1a1a2a,#0a0a1a);">'
  // Vertical line 1
  html += '<div style="position:absolute;top:0;left:33.33%;width:2px;height:0%;background:rgba(255,200,50,0.7);animation:gridLineV 0.6s ease-out 0.1s forwards;box-shadow:0 0 8px rgba(255,200,50,0.4);"></div>'
  // Vertical line 2
  html += '<div style="position:absolute;top:0;left:66.66%;width:2px;height:0%;background:rgba(255,200,50,0.7);animation:gridLineV 0.6s ease-out 0.2s forwards;box-shadow:0 0 8px rgba(255,200,50,0.4);"></div>'
  // Horizontal line 1
  html += '<div style="position:absolute;top:33.33%;left:0;width:0%;height:2px;background:rgba(255,200,50,0.7);animation:gridLineH 0.6s ease-out 0.3s forwards;box-shadow:0 0 8px rgba(255,200,50,0.4);"></div>'
  // Horizontal line 2
  html += '<div style="position:absolute;top:66.66%;left:0;width:0%;height:2px;background:rgba(255,200,50,0.7);animation:gridLineH 0.6s ease-out 0.4s forwards;box-shadow:0 0 8px rgba(255,200,50,0.4);"></div>'
  // Intersection points (power points)
  var intersections = [
    { top: '33.33%', left: '33.33%' },
    { top: '33.33%', left: '66.66%' },
    { top: '66.66%', left: '33.33%' },
    { top: '66.66%', left: '66.66%' },
  ]
  for (var i = 0; i < intersections.length; i++) {
    var pt = intersections[i]
    var d = (0.5 + i * 0.1).toFixed(1)
    html += '<div style="position:absolute;top:' + pt.top + ';left:' + pt.left + ';width:16px;height:16px;border-radius:50%;background:rgba(255,200,50,0.8);transform:translate(-50%,-50%) scale(0);animation:dotAppear 0.3s ease-out ' + d + 's forwards;box-shadow:0 0 12px rgba(255,200,50,0.6);"></div>'
  }
  // Composition label in one quadrant
  html += '<div style="position:absolute;top:10%;left:10%;width:20%;height:20%;border:1px dashed rgba(255,255,255,0.2);border-radius:4px;animation:fadeIn 0.5s ease-out 0.8s both;"></div>'
  html += '<div style="position:absolute;top:4%;left:10%;font-family:' + SANS_HTML + ';font-size:14px;color:rgba(255,255,255,0.4);letter-spacing:2px;animation:fadeIn 0.5s ease-out 0.9s both;">SUBJECT</div>'
  html += '</div>'
  html += '<div style="position:absolute;bottom:8%;left:0;right:0;text-align:center;font-family:' + SANS_HTML + ';font-size:36px;font-weight:700;color:rgba(255,255,255,0.6);letter-spacing:4px;">RULE OF THIRDS</div>'
  return html
}

function buildHistogramHTML() {
  // Histogram — 36 bars showing exposure distribution
  var numBars = 36
  var html = '<div style="position:relative;width:90%;height:70%;display:flex;align-items:flex-end;justify-content:center;gap:3px;padding:0 20px;">'
  // Generate bar heights like a real histogram (bell curve with shadow/highlight tails)
  for (var i = 0; i < numBars; i++) {
    var x = (i / numBars) * 2 - 1 // -1 to 1
    // Bell curve shape with slight right skew
    var height = Math.exp(-Math.pow((x - 0.1) * 1.8, 2)) * 100
    // Add some noise
    height = height * (0.7 + Math.random() * 0.6)
    height = Math.max(5, Math.min(95, height))
    // Color from shadows (dark) to highlights (bright)
    var pct = i / numBars
    var r, g, b
    if (pct < 0.33) {
      // Shadows — deep blue/purple
      r = Math.floor(30 + pct * 3 * 60)
      g = Math.floor(20 + pct * 3 * 40)
      b = Math.floor(80 + pct * 3 * 80)
    } else if (pct < 0.66) {
      // Midtones — neutral gray-green
      var mp = (pct - 0.33) * 3
      r = Math.floor(90 + mp * 80)
      g = Math.floor(60 + mp * 100)
      b = Math.floor(160 - mp * 60)
    } else {
      // Highlights — warm yellow/white
      var hp = (pct - 0.66) * 3
      r = Math.floor(170 + hp * 85)
      g = Math.floor(160 + hp * 80)
      b = Math.floor(100 + hp * 100)
    }
    var color = 'rgb(' + r + ',' + g + ',' + b + ')'
    var delay = (i * 0.02).toFixed(2)
    html += '<div style="flex:1;height:0%;max-height:' + height.toFixed(0) + '%;background:' + color + ';border-radius:2px 2px 0 0;animation:histoBar 0.4s ease-out ' + delay + 's forwards;box-shadow:0 0 4px ' + color + ';"></div>'
  }
  html += '</div>'
  // Axis labels
  html += '<div style="position:absolute;bottom:18%;left:10%;font-family:' + MONO_HTML + ';font-size:16px;color:rgba(255,255,255,0.4);">SHADOWS</div>'
  html += '<div style="position:absolute;bottom:18%;left:50%;transform:translateX(-50%);font-family:' + MONO_HTML + ';font-size:16px;color:rgba(255,255,255,0.4);">MIDTONES</div>'
  html += '<div style="position:absolute;bottom:18%;right:10%;font-family:' + MONO_HTML + ';font-size:16px;color:rgba(255,255,255,0.4);">HIGHLIGHTS</div>'
  html += '<div style="position:absolute;bottom:8%;left:0;right:0;text-align:center;font-family:' + SANS_HTML + ';font-size:36px;font-weight:700;color:rgba(255,255,255,0.6);letter-spacing:4px;">HISTOGRAM</div>'
  return html
}

function buildLightRaysHTML() {
  // Golden hour light rays radiating from a point source
  var numRays = 14
  var html = '<div style="position:relative;width:100%;height:100%;overflow:hidden;">'
  // Warm gradient background
  html += '<div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 40%,rgba(255,168,50,0.15) 0%,rgba(255,100,20,0.05) 40%,transparent 70%);"></div>'
  // Light source point
  html += '<div style="position:absolute;top:35%;left:50%;transform:translate(-50%,-50%);width:40px;height:40px;border-radius:50%;background:radial-gradient(circle,#fff 0%,#ffd700 30%,#ffa832 60%,transparent 100%);box-shadow:0 0 60px rgba(255,168,50,0.8),0 0 120px rgba(255,100,20,0.4);animation:sunPulse 2s ease-in-out infinite;z-index:3;"></div>'
  // Radiating beams
  for (var i = 0; i < numRays; i++) {
    var angle = (i / numRays) * 360
    var width = 20 + Math.random() * 30
    var length = 300 + Math.random() * 200
    var opacity = (0.1 + Math.random() * 0.2).toFixed(2)
    var delay = (i * 0.08).toFixed(2)
    html += '<div style="position:absolute;top:35%;left:50%;width:0;height:0;z-index:1;">'
    html += '<div style="position:absolute;transform-origin:0 0;transform:rotate(' + angle + 'deg);width:' + length + 'px;height:' + width + 'px;background:linear-gradient(90deg,rgba(255,168,50,' + opacity + '),transparent);clip-path:polygon(0 40%,100% 0,100% 100%,0 60%);animation:rayGrow 0.8s ease-out ' + delay + 's both;filter:blur(3px);"></div>'
    html += '</div>'
  }
  // Lens flare artifacts
  html += '<div style="position:absolute;top:30%;left:55%;width:80px;height:8px;background:linear-gradient(90deg,transparent,rgba(255,200,100,0.3),transparent);border-radius:4px;animation:flareDrift 3s ease-in-out infinite;"></div>'
  html += '<div style="position:absolute;top:42%;left:42%;width:20px;height:20px;border-radius:50%;background:rgba(255,200,100,0.15);box-shadow:0 0 20px rgba(255,200,100,0.2);"></div>'
  html += '</div>'
  html += '<div style="position:absolute;bottom:8%;left:0;right:0;text-align:center;font-family:' + SANS_HTML + ';font-size:36px;font-weight:700;color:rgba(255,200,100,0.7);letter-spacing:4px;text-shadow:0 0 20px rgba(255,168,50,0.3);">GOLDEN HOUR</div>'
  return html
}

function buildFilmStripHTML() {
  // Film strip with 8 frames and sprocket holes
  var numFrames = 8
  var frameW = 110
  var frameH = 80
  var stripW = numFrames * (frameW + 10) + 20
  var html = '<div style="position:relative;width:100%;height:100%;display:flex;align-items:center;justify-content:center;overflow:hidden;">'
  // Film strip container — scrolling left
  html += '<div style="display:flex;align-items:center;gap:10px;padding:0 10px;animation:filmScroll 2s linear infinite;width:' + stripW + 'px;flex-shrink:0;">'
  for (var i = 0; i < numFrames; i++) {
    var hue = 20 + i * 30
    html += '<div style="position:relative;flex-shrink:0;width:' + frameW + 'px;height:' + (frameH + 50) + 'px;background:#1a1a1a;border:2px solid #333;border-radius:4px;">'
    // Sprocket holes top
    html += '<div style="position:absolute;top:4px;left:8px;width:10px;height:10px;border-radius:50%;background:#0a0a0a;border:1px solid #444;"></div>'
    html += '<div style="position:absolute;top:4px;right:8px;width:10px;height:10px;border-radius:50%;background:#0a0a0a;border:1px solid #444;"></div>'
    // Frame content
    html += '<div style="position:absolute;top:20px;left:8px;right:8px;bottom:20px;background:linear-gradient(135deg,hsl(' + hue + ',40%,25%),hsl(' + (hue + 40) + ',50%,35%));border-radius:2px;border:1px solid rgba(255,255,255,0.1);"></div>'
    // Sprocket holes bottom
    html += '<div style="position:absolute;bottom:4px;left:8px;width:10px;height:10px;border-radius:50%;background:#0a0a0a;border:1px solid #444;"></div>'
    html += '<div style="position:absolute;bottom:4px;right:8px;width:10px;height:10px;border-radius:50%;background:#0a0a0a;border:1px solid #444;"></div>'
    // Frame number
    html += '<div style="position:absolute;bottom:6px;left:50%;transform:translateX(-50%);font-family:' + MONO_HTML + ';font-size:10px;color:rgba(255,255,255,0.3);">' + (i + 1) + '</div>'
    html += '</div>'
  }
  html += '</div>'
  // Duplicate for seamless loop
  html += '<div style="position:absolute;display:flex;align-items:center;gap:10px;padding:0 10px;animation:filmScroll2 2s linear infinite;width:' + stripW + 'px;flex-shrink:0;">'
  for (var j = 0; j < numFrames; j++) {
    var hue2 = 20 + j * 30
    html += '<div style="position:relative;flex-shrink:0;width:' + frameW + 'px;height:' + (frameH + 50) + 'px;background:#1a1a1a;border:2px solid #333;border-radius:4px;">'
    html += '<div style="position:absolute;top:4px;left:8px;width:10px;height:10px;border-radius:50%;background:#0a0a0a;border:1px solid #444;"></div>'
    html += '<div style="position:absolute;top:4px;right:8px;width:10px;height:10px;border-radius:50%;background:#0a0a0a;border:1px solid #444;"></div>'
    html += '<div style="position:absolute;top:20px;left:8px;right:8px;bottom:20px;background:linear-gradient(135deg,hsl(' + hue2 + ',40%,25%),hsl(' + (hue2 + 40) + ',50%,35%));border-radius:2px;border:1px solid rgba(255,255,255,0.1);"></div>'
    html += '<div style="position:absolute;bottom:4px;left:8px;width:10px;height:10px;border-radius:50%;background:#0a0a0a;border:1px solid #444;"></div>'
    html += '<div style="position:absolute;bottom:4px;right:8px;width:10px;height:10px;border-radius:50%;background:#0a0a0a;border:1px solid #444;"></div>'
    html += '<div style="position:absolute;bottom:6px;left:50%;transform:translateX(-50%);font-family:' + MONO_HTML + ';font-size:10px;color:rgba(255,255,255,0.3);">' + (j + 1) + '</div>'
    html += '</div>'
  }
  html += '</div>'
  html += '</div>'
  html += '<div style="position:absolute;bottom:8%;left:0;right:0;text-align:center;font-family:' + SANS_HTML + ';font-size:36px;font-weight:700;color:rgba(255,255,255,0.6);letter-spacing:4px;">FILM STRIP</div>'
  return html
}

/* ─────────────────────────────────────────────────────────
   buildHTML — returns the complete page HTML.

   CRITICAL: The entire HTML string is built via
   single/double-quoted string concatenation. NO backtick
   template literals anywhere.
   ───────────────────────────────────────────────────────── */

function buildHTML(photoDataURIs) {
  var SW = SAFE_RIGHT - SAFE_LEFT
  var SH = HEIGHT - SAFE_TOP - SAFE_BOTTOM

  // Pre-build complex HTML in Node, then inject as JSON-encoded strings
  var apertureHTML = JSON.stringify(buildApertureHTML())
  var colorWheelHTML = JSON.stringify(buildColorWheelHTML())
  var ruleOfThirdsHTML = JSON.stringify(buildRuleOfThirdsHTML())
  var histogramHTML = JSON.stringify(buildHistogramHTML())
  var lightRaysHTML = JSON.stringify(buildLightRaysHTML())
  var filmStripHTML = JSON.stringify(buildFilmStripHTML())

  // Photo data URIs as JSON array
  var photosJSON = JSON.stringify(photoDataURIs)

  // ═══════════════════════════════════════════════════════
  // Build the full HTML page as a single concatenated string.
  // ZERO backtick template literals anywhere in this function.
  // ═══════════════════════════════════════════════════════

  var page = ''

  // ── head + CSS ──
  page += '<!DOCTYPE html>\n<html>\n<head>\n<style>\n'
  page += '* { box-sizing: border-box; margin: 0; padding: 0; }\n'
  page += 'html, body { margin: 0; padding: 0; background: #0a0a0a; overflow: hidden; }\n'
  page += '\n'
  page += '@keyframes cursorBlink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }\n'
  page += '@keyframes textGlow { 0%, 100% { text-shadow: 0 0 20px rgba(255,255,255,0.3), 0 0 40px rgba(255,255,255,0.1); } 50% { text-shadow: 0 0 40px rgba(255,255,255,0.6), 0 0 80px rgba(255,255,255,0.3), 0 0 120px rgba(232,68,58,0.15); } }\n'
  page += '@keyframes fadeInUp { 0% { opacity: 0; transform: translateY(40px); } 100% { opacity: 1; transform: translateY(0); } }\n'
  page += '@keyframes fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }\n'
  page += '@keyframes fadeOut { 0% { opacity: 1; } 100% { opacity: 0; } }\n'
  page += '@keyframes scaleIn { 0% { opacity: 0; transform: scale(0.5); } 60% { opacity: 1; transform: scale(1.05); } 100% { opacity: 1; transform: scale(1); } }\n'
  page += '@keyframes punchIn { 0% { opacity: 0; transform: scale(2) translateY(10px); filter: blur(8px); } 60% { opacity: 1; transform: scale(0.95) translateY(-2px); filter: blur(0); } 100% { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); } }\n'
  page += '@keyframes driftSlow { 0% { transform: translateY(0) translateX(0); } 50% { transform: translateY(-30px) translateX(15px); } 100% { transform: translateY(0) translateX(0); } }\n'
  page += '@keyframes zoomBlur { 0% { opacity: 0; transform: scale(1.5); filter: blur(20px); } 100% { opacity: 1; transform: scale(1); filter: blur(0); } }\n'
  page += '@keyframes readyGlow { 0%, 100% { text-shadow: 0 0 30px rgba(232,68,58,0.5), 0 0 60px rgba(232,68,58,0.3); } 50% { text-shadow: 0 0 60px rgba(232,68,58,0.9), 0 0 120px rgba(232,68,58,0.5), 0 0 200px rgba(232,68,58,0.3); } }\n'
  page += '@keyframes brandShine { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }\n'
  page += '@keyframes photoScaleIn { 0% { opacity: 0; transform: scale(0.7); } 50% { opacity: 1; transform: scale(1.02); } 100% { opacity: 1; transform: scale(1); } }\n'
  page += '@keyframes limitedPulse { 0%, 100% { opacity: 0.7; transform: scale(1); } 50% { opacity: 1; transform: scale(1.05); } }\n'
  // Photography-specific animations
  page += '@keyframes irisClose { 0% { transform: rotate(var(--blade-angle)) translateX(80px); } 100% { transform: rotate(var(--blade-angle)) translateX(30px); } }\n'
  page += '@keyframes lensPulse { 0% { box-shadow: 0 0 30px rgba(100,180,255,0.3); } 100% { box-shadow: 0 0 60px rgba(100,180,255,0.6), 0 0 100px rgba(100,180,255,0.2); } }\n'
  page += '@keyframes wheelSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }\n'
  page += '@keyframes gridLineV { 0% { height: 0%; } 100% { height: 100%; } }\n'
  page += '@keyframes gridLineH { 0% { width: 0%; } 100% { width: 100%; } }\n'
  page += '@keyframes dotAppear { 0% { transform: translate(-50%,-50%) scale(0); } 100% { transform: translate(-50%,-50%) scale(1); } }\n'
  page += '@keyframes histoBar { 0% { height: 0%; } 100% { height: 100%; } }\n'
  page += '@keyframes sunPulse { 0%, 100% { box-shadow: 0 0 30px rgba(255,200,50,0.6), 0 0 60px rgba(255,150,0,0.3); } 50% { box-shadow: 0 0 50px rgba(255,200,50,0.8), 0 0 100px rgba(255,150,0,0.5); } }\n'
  page += '@keyframes rayGrow { 0% { opacity: 0; transform: rotate(var(--ray-angle)) scaleX(0); } 100% { opacity: 1; transform: rotate(var(--ray-angle)) scaleX(1); } }\n'
  page += '@keyframes flareDrift { 0%, 100% { opacity: 0.3; transform: translateX(0); } 50% { opacity: 0.6; transform: translateX(30px); } }\n'
  page += '@keyframes filmScroll { 0% { transform: translateX(0); } 100% { transform: translateX(-100%); } }\n'
  page += '@keyframes filmScroll2 { 0% { transform: translateX(100%); } 100% { transform: translateX(0); } }\n'
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
  page += '    p.style.cssText = "position:absolute;border-radius:50%;background:rgba(232,68,58,0.2);pointer-events:none;";\n'
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

  // ═══ SCENE 1 (0-2.5s): Terminal + MANILA FREE PHOTO SHOOT ═══
  page += '(function scene1() {\n'
  page += '  var container = document.createElement("div");\n'
  page += '  container.style.cssText = "display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%;";\n'
  page += '  var termLine = document.createElement("div");\n'
  page += '  termLine.style.cssText = "font-family:' + MONO + ';font-size:24px;color:#E8443A;letter-spacing:2px;margin-bottom:40px;opacity:0;";\n'
  page += '  termLine.innerHTML = \'<span style="color:#E8443A;">$</span> <span style="color:#888;">claude-code</span> <span id="cursor1" style="display:inline-block;width:12px;height:24px;background:#E8443A;vertical-align:middle;animation:cursorBlink 0.8s step-end infinite;"></span>\';\n'
  page += '  container.appendChild(termLine);\n'
  page += '  var title = document.createElement("div");\n'
  page += '  title.id = "welcome-title";\n'
  page += '  title.style.cssText = "font-family:' + SANS + ';font-weight:900;font-size:66px;color:#fff;text-align:center;letter-spacing:6px;text-transform:uppercase;opacity:0;line-height:1.15;";\n'
  page += '  title.innerHTML = "MANILA<br>FREE PHOTO<br>SHOOT";\n'
  page += '  container.appendChild(title);\n'
  page += '  scene.appendChild(container);\n'
  page += '  setTimeout(function() { termLine.style.opacity = "1"; termLine.style.animation = "fadeIn 0.3s ease-out forwards"; }, 200);\n'
  page += '  setTimeout(function() {\n'
  page += '    termLine.style.opacity = "0";\n'
  page += '    var t = document.getElementById("welcome-title");\n'
  page += '    if (t) { t.style.opacity = "1"; t.style.animation = "punchIn 0.6s cubic-bezier(0.16,1,0.3,1) forwards"; }\n'
  page += '  }, 1000);\n'
  page += '  setTimeout(function() {\n'
  page += '    var t = document.getElementById("welcome-title");\n'
  page += '    if (t) t.style.animation = "textGlow 2s ease-in-out infinite";\n'
  page += '  }, 1800);\n'
  page += '})();\n'
  page += '\n'

  // ═══ SCENE 2 (2.5-4.5s): "What if your next photo shoot was completely free?" ═══
  page += 'setTimeout(function() {\n'
  page += '  clearScene();\n'
  page += '  var container = document.createElement("div");\n'
  page += '  container.style.cssText = "display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%;padding:30px;gap:0;";\n'
  page += '  var lines = [\n'
  page += '    { text: "What if your next photo shoot was", delay: 0, size: "42px", color: "rgba(255,255,255,0.7)" },\n'
  page += '    { text: "completely free?", delay: 500, size: "64px", color: "#E8443A" },\n'
  page += '    { text: "Professional. Editorial.", delay: 1000, size: "42px", color: "rgba(255,255,255,0.8)" }\n'
  page += '  ];\n'
  page += '  lines.forEach(function(l) {\n'
  page += '    var el = document.createElement("div");\n'
  page += '    el.style.cssText = "font-family:' + SANS + ';font-weight:700;text-align:center;letter-spacing:2px;opacity:0;margin:12px 0;";\n'
  page += '    el.style.fontSize = l.size;\n'
  page += '    el.style.color = l.color;\n'
  page += '    el.textContent = l.text;\n'
  page += '    container.appendChild(el);\n'
  page += '    setTimeout(function() { el.style.animation = "fadeInUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards"; }, l.delay);\n'
  page += '  });\n'
  page += '  scene.appendChild(container);\n'
  page += '}, 2500);\n'
  page += '\n'

  // ═══ SCENE 3a (4.5-5.75s): Camera Aperture Iris ═══
  page += 'setTimeout(function() {\n'
  page += '  clearScene();\n'
  page += '  var container = document.createElement("div");\n'
  page += '  container.style.cssText = "width:100%;height:100%;display:flex;align-items:center;justify-content:center;position:relative;animation:zoomBlur 0.3s ease-out forwards;";\n'
  page += '  container.innerHTML = ' + apertureHTML + ';\n'
  page += '  scene.appendChild(container);\n'
  page += '}, 4500);\n'
  page += '\n'

  // ═══ SCENE 3b (5.75-7s): Color Wheel ═══
  page += 'setTimeout(function() {\n'
  page += '  clearScene();\n'
  page += '  var container = document.createElement("div");\n'
  page += '  container.style.cssText = "width:100%;height:100%;display:flex;align-items:center;justify-content:center;position:relative;animation:zoomBlur 0.3s ease-out forwards;background:radial-gradient(ellipse at center,#0a0a1a 0%,#0a0a0a 100%);";\n'
  page += '  container.innerHTML = ' + colorWheelHTML + ';\n'
  page += '  scene.appendChild(container);\n'
  page += '}, 5750);\n'
  page += '\n'

  // ═══ SCENE 3c (7-8.25s): Rule of Thirds ═══
  page += 'setTimeout(function() {\n'
  page += '  clearScene();\n'
  page += '  var container = document.createElement("div");\n'
  page += '  container.style.cssText = "width:100%;height:100%;display:flex;align-items:center;justify-content:center;position:relative;animation:fadeIn 0.2s ease-out forwards;";\n'
  page += '  container.innerHTML = ' + ruleOfThirdsHTML + ';\n'
  page += '  scene.appendChild(container);\n'
  page += '}, 7000);\n'
  page += '\n'

  // ═══ SCENE 3d (8.25-9.5s): Histogram ═══
  page += 'setTimeout(function() {\n'
  page += '  clearScene();\n'
  page += '  var container = document.createElement("div");\n'
  page += '  container.style.cssText = "width:100%;height:100%;display:flex;align-items:center;justify-content:center;position:relative;animation:zoomBlur 0.3s ease-out forwards;background:#0a0a0a;";\n'
  page += '  container.innerHTML = ' + histogramHTML + ';\n'
  page += '  scene.appendChild(container);\n'
  page += '}, 8250);\n'
  page += '\n'

  // ═══ SCENE 3e (9.5-10.75s): Golden Hour Light Rays ═══
  page += 'setTimeout(function() {\n'
  page += '  clearScene();\n'
  page += '  var container = document.createElement("div");\n'
  page += '  container.style.cssText = "width:100%;height:100%;position:relative;overflow:hidden;animation:fadeIn 0.2s ease-out forwards;background:linear-gradient(180deg,#1a0a00 0%,#0a0a0a 100%);";\n'
  page += '  container.innerHTML = ' + lightRaysHTML + ';\n'
  page += '  scene.appendChild(container);\n'
  page += '}, 9500);\n'
  page += '\n'

  // ═══ SCENE 3f (10.75-12s): Film Strip ═══
  page += 'setTimeout(function() {\n'
  page += '  clearScene();\n'
  page += '  var container = document.createElement("div");\n'
  page += '  container.style.cssText = "width:100%;height:100%;display:flex;align-items:center;justify-content:center;position:relative;animation:fadeIn 0.2s ease-out forwards;background:#0a0a0a;";\n'
  page += '  container.innerHTML = ' + filmStripHTML + ';\n'
  page += '  scene.appendChild(container);\n'
  page += '}, 10750);\n'
  page += '\n'

  // ═══ SCENE 4 (12-16s): Photo slideshow — 5 photos ~0.8s each ═══
  page += 'setTimeout(function() {\n'
  page += '  clearScene();\n'
  page += '  var photos = ' + photosJSON + ';\n'
  page += '  var container = document.createElement("div");\n'
  page += '  container.style.cssText = "width:100%;height:100%;position:relative;display:flex;align-items:center;justify-content:center;";\n'
  page += '  scene.appendChild(container);\n'
  page += '  var photoInterval = 800;\n'
  page += '  photos.forEach(function(src, i) {\n'
  page += '    if (!src) return;\n'
  page += '    setTimeout(function() {\n'
  page += '      container.innerHTML = "";\n'
  page += '      var img = document.createElement("img");\n'
  page += '      img.src = src;\n'
  page += '      img.style.cssText = "max-width:90%;max-height:90%;object-fit:contain;border-radius:12px;box-shadow:0 0 40px rgba(0,0,0,0.8);animation:photoScaleIn 0.4s cubic-bezier(0.16,1,0.3,1) forwards;";\n'
  page += '      container.appendChild(img);\n'
  page += '    }, i * photoInterval);\n'
  page += '  });\n'
  page += '}, 12000);\n'
  page += '\n'

  // ═══ SCENE 5 (16-20s): CTA — @madebyaidan + DM me + limited spots ═══
  page += 'setTimeout(function() {\n'
  page += '  clearScene();\n'
  page += '  var container = document.createElement("div");\n'
  page += '  container.style.cssText = "display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%;gap:40px;";\n'
  page += '  var brand = document.createElement("div");\n'
  page += '  brand.id = "brand-name";\n'
  page += '  brand.style.cssText = "font-family:' + SANS + ';font-weight:800;font-size:68px;letter-spacing:4px;opacity:0;text-align:center;background:linear-gradient(90deg,#E8443A,#f472b6,#a78bfa,#E8443A);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;";\n'
  page += '  brand.textContent = "@madebyaidan";\n'
  page += '  container.appendChild(brand);\n'
  page += '  var divider = document.createElement("div");\n'
  page += '  divider.id = "divider";\n'
  page += '  divider.style.cssText = "width:200px;height:2px;background:linear-gradient(90deg,transparent,#E8443A,transparent);opacity:0;";\n'
  page += '  container.appendChild(divider);\n'
  page += '  var tagline = document.createElement("div");\n'
  page += '  tagline.id = "tagline";\n'
  page += '  tagline.style.cssText = "font-family:' + SANS + ';font-weight:500;font-size:40px;color:rgba(255,255,255,0.7);letter-spacing:4px;text-transform:uppercase;opacity:0;text-align:center;";\n'
  page += '  tagline.textContent = "DM me on Instagram";\n'
  page += '  container.appendChild(tagline);\n'
  page += '  var limited = document.createElement("div");\n'
  page += '  limited.id = "limited-text";\n'
  page += '  limited.style.cssText = "font-family:' + SANS + ';font-weight:700;font-size:32px;color:#E8443A;letter-spacing:8px;text-transform:uppercase;opacity:0;text-align:center;";\n'
  page += '  limited.textContent = "LIMITED SPOTS";\n'
  page += '  container.appendChild(limited);\n'
  page += '  scene.appendChild(container);\n'
  page += '  setTimeout(function() { var b = document.getElementById("brand-name"); if (b) { b.style.animation = "scaleIn 0.7s cubic-bezier(0.16,1,0.3,1) forwards"; } }, 200);\n'
  page += '  setTimeout(function() { var b = document.getElementById("brand-name"); if (b) b.style.animation = "brandShine 3s linear infinite"; }, 1000);\n'
  page += '  setTimeout(function() { var d = document.getElementById("divider"); if (d) d.style.animation = "fadeIn 0.5s ease-out forwards"; }, 1200);\n'
  page += '  setTimeout(function() { var t = document.getElementById("tagline"); if (t) t.style.animation = "fadeInUp 0.5s ease-out forwards"; }, 1500);\n'
  page += '  setTimeout(function() { var l = document.getElementById("limited-text"); if (l) { l.style.opacity = "1"; l.style.animation = "limitedPulse 1s ease-in-out infinite"; } }, 2500);\n'
  page += '}, 16000);\n'
  page += '\n'
  page += '</script>\n</body>\n</html>'

  return page
}

async function render() {
  resetOutputDir()

  writeSources({
    createdAt: new Date().toISOString(),
    strategy: 'v34e — Snappier Manila showcase with photography-relevant visualizations',
    safeBottomPixels: SAFE_BOTTOM,
  })

  // Load photos as base64 data URIs
  console.log('Loading photos as base64...')
  var photoDataURIs = loadPhotosAsDataURIs()
  var loadedCount = photoDataURIs.filter(function(u) { return u.length > 0 }).length
  console.log('Loaded ' + loadedCount + '/' + PROOF_PHOTOS.length + ' photos')

  // Write the HTML to a debug file so we can inspect it
  var html = buildHTML(photoDataURIs)
  var debugHTML = path.join(OUT_DIR, 'debug-page.html')
  fs.writeFileSync(debugHTML, html)
  console.log('Wrote debug HTML to ' + debugHTML)

  // Verify no backticks leaked into the generated HTML
  if (html.indexOf('`') !== -1) {
    console.error('BUG: backtick found in generated HTML! Aborting.')
    process.exit(1)
  }
  console.log('Verified: zero backticks in generated HTML (' + html.length + ' chars)')

  var browser = await chromium.launch()
  console.log('Recording Manila showcase v34e...')

  var videoCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    recordVideo: { dir: OUT_DIR, size: { width: WIDTH, height: HEIGHT } }
  })

  var videoPage = await videoCtx.newPage()

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

  var videoFiles = fs.readdirSync(OUT_DIR).filter(function(f) { return f.endsWith('.webm') })
  if (videoFiles.length === 0) {
    console.error('No video file was generated!')
    return
  }

  var srcVideo = path.join(OUT_DIR, videoFiles[0])
  var stats = fs.statSync(srcVideo)
  console.log('WebM file size: ' + (stats.size / 1024).toFixed(1) + ' KB')

  if (stats.size < 10000) {
    console.error('WARNING: WebM file is suspiciously small (' + stats.size + ' bytes) — likely a blank recording')
  }

  var dstVideo = path.join(OUT_DIR, 'manila-showcase-v34e.mp4')

  var execSync = (await import('child_process')).execSync
  try {
    execSync('ffmpeg -y -i "' + srcVideo + '" -c:v libx264 -pix_fmt yuv420p -r 30 -an "' + dstVideo + '"', { stdio: 'pipe' })
    fs.unlinkSync(srcVideo)
    console.log('Rendered manila-showcase-v34e.mp4')
  } catch (err) {
    console.warn('ffmpeg conversion failed, keeping webm as fallback...')
    var webmDst = path.join(OUT_DIR, 'manila-showcase-v34e.webm')
    fs.renameSync(srcVideo, webmDst)
    console.log('Saved as ' + webmDst)
  }

  // Copy to reels directory
  var reelsDir = path.join(__dirname, 'reels')
  if (!fs.existsSync(reelsDir)) fs.mkdirSync(reelsDir, { recursive: true })
  var finalVideo = fs.existsSync(dstVideo) ? dstVideo : path.join(OUT_DIR, 'manila-showcase-v34e.webm')
  var finalName = fs.existsSync(dstVideo) ? 'manila-showcase-v34e.mp4' : 'manila-showcase-v34e.webm'
  fs.copyFileSync(finalVideo, path.join(reelsDir, finalName))
  console.log('Copied to reels/' + finalName)

  console.log('Done: output written to ' + OUT_DIR)
}

render().catch(function(error) {
  console.error(error)
  process.exit(1)
})
