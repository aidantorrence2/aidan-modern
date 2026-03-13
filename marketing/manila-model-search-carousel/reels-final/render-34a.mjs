import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.join(__dirname, 'output-34a')

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 430
const SAFE_TOP = 213
const SAFE_LEFT = 66
const SAFE_RIGHT = 1027

const TOTAL_DURATION_MS = 24000

const MONO = "'SF Mono', 'Menlo', 'Courier New', monospace"
const SANS = "'SF Pro Display', 'Helvetica Neue', Arial, sans-serif"

function resetOutputDir() {
  fs.rmSync(OUT_DIR, { recursive: true, force: true })
  fs.mkdirSync(OUT_DIR, { recursive: true })
}

function writeSources(payload) {
  fs.writeFileSync(path.join(OUT_DIR, 'sources.json'), JSON.stringify(payload, null, 2))
}

function buildHTML() {
  return `<!DOCTYPE html>
<html>
<head>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { margin: 0; padding: 0; background: #0a0a0a; overflow: hidden; }

  /* ═══ KEYFRAME ANIMATIONS ═══ */

  @keyframes cursorBlink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  @keyframes textGlow {
    0%, 100% { text-shadow: 0 0 20px rgba(255,255,255,0.3), 0 0 40px rgba(255,255,255,0.1); }
    50% { text-shadow: 0 0 40px rgba(255,255,255,0.6), 0 0 80px rgba(255,255,255,0.3), 0 0 120px rgba(100,200,255,0.15); }
  }

  @keyframes fadeInUp {
    0% { opacity: 0; transform: translateY(40px); }
    100% { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeIn {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }

  @keyframes fadeOut {
    0% { opacity: 1; }
    100% { opacity: 0; }
  }

  @keyframes scaleIn {
    0% { opacity: 0; transform: scale(0.5); }
    60% { opacity: 1; transform: scale(1.05); }
    100% { opacity: 1; transform: scale(1); }
  }

  @keyframes punchIn {
    0% { opacity: 0; transform: scale(2) translateY(10px); filter: blur(8px); }
    60% { opacity: 1; transform: scale(0.95) translateY(-2px); filter: blur(0); }
    100% { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); }
  }

  @keyframes slideInLeft {
    0% { opacity: 0; transform: translateX(-100px); }
    100% { opacity: 1; transform: translateX(0); }
  }

  @keyframes slideInRight {
    0% { opacity: 0; transform: translateX(100px); }
    100% { opacity: 1; transform: translateX(0); }
  }

  @keyframes glowPulse {
    0%, 100% { box-shadow: 0 0 20px rgba(100,200,255,0.3); }
    50% { box-shadow: 0 0 60px rgba(100,200,255,0.6), 0 0 100px rgba(100,200,255,0.2); }
  }

  @keyframes typewriter {
    from { width: 0; }
    to { width: 100%; }
  }

  /* ═══ PARTICLE / STAR FLOAT ═══ */
  @keyframes starFloat {
    0% { opacity: 0; transform: translateY(0) scale(0.5); }
    20% { opacity: 1; }
    80% { opacity: 1; }
    100% { opacity: 0; transform: translateY(-200px) scale(0.2); }
  }

  @keyframes driftSlow {
    0% { transform: translateY(0) translateX(0); }
    50% { transform: translateY(-30px) translateX(15px); }
    100% { transform: translateY(0) translateX(0); }
  }

  /* ═══ DEMO VISUALIZATIONS ═══ */

  /* Blackboard / Equations */
  @keyframes chalkWrite {
    0% { width: 0; opacity: 0.8; }
    100% { width: 100%; opacity: 1; }
  }

  /* DNA Helix */
  @keyframes helixSpin {
    0% { transform: rotateY(0deg); }
    100% { transform: rotateY(360deg); }
  }

  @keyframes helixFloat {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }

  /* Solar System */
  @keyframes orbit1 { 0% { transform: rotate(0deg) translateX(80px) rotate(0deg); } 100% { transform: rotate(360deg) translateX(80px) rotate(-360deg); } }
  @keyframes orbit2 { 0% { transform: rotate(0deg) translateX(130px) rotate(0deg); } 100% { transform: rotate(360deg) translateX(130px) rotate(-360deg); } }
  @keyframes orbit3 { 0% { transform: rotate(0deg) translateX(185px) rotate(0deg); } 100% { transform: rotate(360deg) translateX(185px) rotate(-360deg); } }
  @keyframes orbit4 { 0% { transform: rotate(0deg) translateX(240px) rotate(0deg); } 100% { transform: rotate(360deg) translateX(240px) rotate(-360deg); } }
  @keyframes sunPulse {
    0%, 100% { box-shadow: 0 0 30px rgba(255,200,50,0.6), 0 0 60px rgba(255,150,0,0.3); }
    50% { box-shadow: 0 0 50px rgba(255,200,50,0.8), 0 0 100px rgba(255,150,0,0.5); }
  }

  /* Skyline */
  @keyframes riseUp {
    0% { transform: translateY(100%); }
    100% { transform: translateY(0); }
  }

  @keyframes windowBlink {
    0%, 100% { opacity: 1; }
    30% { opacity: 0.3; }
    60% { opacity: 0.9; }
  }

  /* EKG Heartbeat */
  @keyframes drawLine {
    0% { stroke-dashoffset: 2000; }
    100% { stroke-dashoffset: 0; }
  }

  /* Matrix Rain */
  @keyframes matrixFall {
    0% { transform: translateY(-100%); opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { transform: translateY(100vh); opacity: 0; }
  }

  @keyframes matrixGlow {
    0%, 100% { color: #00ff41; text-shadow: 0 0 8px #00ff41; }
    50% { color: #80ff80; text-shadow: 0 0 20px #00ff41, 0 0 40px #00ff41; }
  }

  /* Scene transitions */
  @keyframes wipeIn {
    0% { clip-path: inset(0 100% 0 0); }
    100% { clip-path: inset(0 0 0 0); }
  }

  @keyframes zoomBlur {
    0% { opacity: 0; transform: scale(1.5); filter: blur(20px); }
    100% { opacity: 1; transform: scale(1); filter: blur(0); }
  }

  @keyframes readyGlow {
    0%, 100% { text-shadow: 0 0 30px rgba(100,200,255,0.5), 0 0 60px rgba(100,200,255,0.3); }
    50% { text-shadow: 0 0 60px rgba(100,200,255,0.9), 0 0 120px rgba(100,200,255,0.5), 0 0 200px rgba(100,150,255,0.3); }
  }

  @keyframes brandShine {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }

</style>
</head>
<body>
  <div id="root" style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#0a0a0a;">

    <!-- Ambient particle layer (always visible, subtle) -->
    <div id="particles" style="position:absolute;inset:0;z-index:1;pointer-events:none;overflow:hidden;"></div>

    <!-- Main scene container -->
    <div id="scene" style="position:absolute;top:${SAFE_TOP}px;left:${SAFE_LEFT}px;width:${SAFE_RIGHT - SAFE_LEFT}px;height:${HEIGHT - SAFE_TOP - SAFE_BOTTOM}px;z-index:10;overflow:hidden;display:flex;align-items:center;justify-content:center;">
    </div>

  </div>

  <script>
    const scene = document.getElementById('scene')
    const particles = document.getElementById('particles')
    const W = ${SAFE_RIGHT - SAFE_LEFT}
    const H = ${HEIGHT - SAFE_TOP - SAFE_BOTTOM}

    // ═══ AMBIENT PARTICLES ═══
    function spawnParticles() {
      for (let i = 0; i < 30; i++) {
        const p = document.createElement('div')
        const x = Math.random() * ${WIDTH}
        const y = Math.random() * ${HEIGHT}
        const size = 1 + Math.random() * 3
        const dur = 4 + Math.random() * 6
        const delay = Math.random() * 5
        p.style.cssText = 'position:absolute;border-radius:50%;background:rgba(100,180,255,0.3);pointer-events:none;'
        p.style.width = size + 'px'
        p.style.height = size + 'px'
        p.style.left = x + 'px'
        p.style.top = y + 'px'
        p.style.animation = 'driftSlow ' + dur + 's ease-in-out ' + delay + 's infinite'
        particles.appendChild(p)
      }
    }
    spawnParticles()

    // Helper: clear scene
    function clearScene() { scene.innerHTML = '' }

    // ═══════════════════════════════════════════
    // SCENE 1 (0–3s): Terminal cursor + "WELCOME TO THE FUTURE"
    // ═══════════════════════════════════════════

    // Show terminal cursor blinking for 1s, then type out text
    ;(function scene1() {
      const container = document.createElement('div')
      container.id = 'scene1'
      container.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%;'

      // Terminal prompt line
      const termLine = document.createElement('div')
      termLine.style.cssText = 'font-family:${MONO};font-size:24px;color:#4af;letter-spacing:2px;margin-bottom:40px;opacity:0;'
      termLine.innerHTML = '<span style="color:#4af;">$</span> <span style="color:#888;">claude-code</span> <span id="cursor1" style="display:inline-block;width:12px;height:24px;background:#4af;vertical-align:middle;animation:cursorBlink 0.8s step-end infinite;"></span>'
      container.appendChild(termLine)

      // Main title (hidden initially)
      const title = document.createElement('div')
      title.id = 'welcome-title'
      title.style.cssText = 'font-family:${SANS};font-weight:800;font-size:72px;color:#fff;text-align:center;letter-spacing:6px;text-transform:uppercase;opacity:0;line-height:1.15;'
      title.innerHTML = 'WELCOME<br>TO THE<br>FUTURE'
      container.appendChild(title)

      scene.appendChild(container)

      // Show terminal line with cursor
      setTimeout(() => { termLine.style.opacity = '1'; termLine.style.animation = 'fadeIn 0.3s ease-out forwards' }, 200)

      // Type out the title dramatically
      setTimeout(() => {
        termLine.style.opacity = '0'
        const t = document.getElementById('welcome-title')
        if (t) {
          t.style.opacity = '1'
          t.style.animation = 'punchIn 0.8s cubic-bezier(0.16,1,0.3,1) forwards'
          t.style.animationDelay = '0s'
        }
      }, 1200)

      // Add glow pulse after appearing
      setTimeout(() => {
        const t = document.getElementById('welcome-title')
        if (t) t.style.animation = 'textGlow 2s ease-in-out infinite'
      }, 2200)
    })()

    // ═══════════════════════════════════════════
    // SCENE 2 (3–7s): "Imagine you could tell any story..."
    // ═══════════════════════════════════════════

    setTimeout(() => {
      clearScene()

      const container = document.createElement('div')
      container.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%;padding:30px;gap:0;'

      const lines = [
        { text: 'Imagine you could', delay: 0, size: '48px', color: 'rgba(255,255,255,0.7)' },
        { text: 'tell any story', delay: 800, size: '56px', color: '#fff' },
        { text: 'you want.', delay: 1600, size: '56px', color: '#fff' },
        { text: 'Exactly how', delay: 2400, size: '48px', color: 'rgba(255,255,255,0.7)' },
        { text: 'you wanted.', delay: 3000, size: '60px', color: '#4af' },
      ]

      lines.forEach(l => {
        const el = document.createElement('div')
        el.style.cssText = 'font-family:${SANS};font-weight:700;text-align:center;letter-spacing:2px;opacity:0;margin:8px 0;'
        el.style.fontSize = l.size
        el.style.color = l.color
        el.textContent = l.text
        container.appendChild(el)

        setTimeout(() => {
          el.style.animation = 'fadeInUp 0.7s cubic-bezier(0.16,1,0.3,1) forwards'
        }, l.delay)
      })

      scene.appendChild(container)
    }, 3000)

    // ═══════════════════════════════════════════
    // SCENE 3 (7–16s): Demo explosion — rapid-fire visualizations
    // ═══════════════════════════════════════════

    // --- 3a: Blackboard with equations (7–8.5s) ---
    setTimeout(() => {
      clearScene()

      const container = document.createElement('div')
      container.style.cssText = 'width:100%;height:100%;background:#1a2a1a;border-radius:12px;position:relative;overflow:hidden;animation:zoomBlur 0.4s ease-out forwards;'

      // Chalk dust texture
      container.innerHTML = \`
        <div style="position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.02) 0%,transparent 50%,rgba(255,255,255,0.01) 100%);"></div>
        <div style="position:absolute;top:8%;left:0;right:0;text-align:center;font-family:${SANS};font-size:28px;color:rgba(255,255,200,0.5);letter-spacing:6px;text-transform:uppercase;">Chalkboard</div>
        <div id="eq-container" style="position:absolute;top:18%;left:8%;right:8%;bottom:10%;display:flex;flex-direction:column;gap:20px;justify-content:center;"></div>
      \`
      scene.appendChild(container)

      const equations = [
        'E = mc\u00B2',
        '\u2207 \u00D7 B = \u03BC\u2080J + \u03BC\u2080\u03B5\u2080 \u2202E/\u2202t',
        'i\u0127 \u2202\u03C8/\u2202t = H\u0302\u03C8',
        'ds\u00B2 = -(1-2GM/rc\u00B2)dt\u00B2',
        'S = k\u2082 ln \u03A9',
        '\u2207\u00B2\u03C6 = 4\u03C0G\u03C1',
      ]

      const eqC = document.getElementById('eq-container')
      equations.forEach((eq, i) => {
        const line = document.createElement('div')
        line.style.cssText = 'font-family:Georgia,serif;color:rgba(255,255,240,0.9);text-shadow:0 0 6px rgba(255,255,200,0.3);letter-spacing:3px;opacity:0;overflow:hidden;white-space:nowrap;'
        line.style.fontSize = (i === 0 ? '52px' : '32px')
        line.style.fontStyle = (i > 0 ? 'italic' : 'normal')
        line.textContent = eq
        eqC.appendChild(line)

        setTimeout(() => {
          line.style.animation = 'fadeIn 0.25s ease-out forwards'
        }, i * 200)
      })
    }, 7000)

    // --- 3b: DNA Helix (8.5–10s) ---
    setTimeout(() => {
      clearScene()

      const container = document.createElement('div')
      container.style.cssText = 'width:100%;height:100%;display:flex;align-items:center;justify-content:center;position:relative;animation:zoomBlur 0.3s ease-out forwards;'

      // Build DNA helix from CSS transforms
      let helixHTML = '<div style="position:relative;width:200px;height:90%;perspective:600px;">'

      const rungs = 24
      for (let i = 0; i < rungs; i++) {
        const yPct = (i / rungs) * 100
        const phase = (i / rungs) * Math.PI * 4
        const xOff1 = Math.cos(phase) * 60
        const xOff2 = Math.cos(phase + Math.PI) * 60
        const z1 = Math.sin(phase) * 40
        const z2 = Math.sin(phase + Math.PI) * 40
        const opacity1 = 0.5 + (Math.sin(phase) + 1) * 0.25
        const opacity2 = 0.5 + (Math.sin(phase + Math.PI) + 1) * 0.25
        const hue1 = 200 + i * 5
        const hue2 = 340 + i * 3

        helixHTML += \`
          <div style="position:absolute;top:\${yPct}%;left:50%;transform:translateX(-50%);width:140px;height:2px;display:flex;align-items:center;justify-content:space-between;">
            <div style="width:16px;height:16px;border-radius:50%;background:hsl(\${hue1},80%,60%);opacity:\${opacity1};box-shadow:0 0 10px hsl(\${hue1},80%,60%);transform:translateX(\${xOff1}px) translateZ(\${z1}px);"></div>
            <div style="position:absolute;left:50%;top:50%;transform:translateX(-50%) translateY(-50%);width:\${Math.abs(xOff1 - xOff2) * 0.6}px;height:2px;background:linear-gradient(90deg,hsl(\${hue1},60%,50%,0.4),hsl(\${hue2},60%,50%,0.4));"></div>
            <div style="width:16px;height:16px;border-radius:50%;background:hsl(\${hue2},80%,60%);opacity:\${opacity2};box-shadow:0 0 10px hsl(\${hue2},80%,60%);transform:translateX(\${xOff2}px) translateZ(\${z2}px);"></div>
          </div>
        \`
      }
      helixHTML += '</div>'

      // Label
      helixHTML += '<div style="position:absolute;bottom:8%;left:0;right:0;text-align:center;font-family:${SANS};font-size:36px;font-weight:700;color:rgba(255,255,255,0.6);letter-spacing:4px;">DNA HELIX</div>'

      container.innerHTML = helixHTML
      scene.appendChild(container)
    }, 8500)

    // --- 3c: Solar System (10–11.5s) ---
    setTimeout(() => {
      clearScene()

      const container = document.createElement('div')
      container.style.cssText = 'width:100%;height:100%;display:flex;align-items:center;justify-content:center;position:relative;animation:zoomBlur 0.3s ease-out forwards;background:radial-gradient(ellipse at center, #0a0a2a 0%, #0a0a0a 100%);'

      container.innerHTML = \`
        <div style="position:relative;width:500px;height:500px;">
          <!-- Orbit rings -->
          <div style="position:absolute;top:50%;left:50%;width:160px;height:160px;border:1px solid rgba(255,255,255,0.08);border-radius:50%;transform:translate(-50%,-50%);"></div>
          <div style="position:absolute;top:50%;left:50%;width:260px;height:260px;border:1px solid rgba(255,255,255,0.06);border-radius:50%;transform:translate(-50%,-50%);"></div>
          <div style="position:absolute;top:50%;left:50%;width:370px;height:370px;border:1px solid rgba(255,255,255,0.05);border-radius:50%;transform:translate(-50%,-50%);"></div>
          <div style="position:absolute;top:50%;left:50%;width:480px;height:480px;border:1px solid rgba(255,255,255,0.04);border-radius:50%;transform:translate(-50%,-50%);"></div>
          <!-- Sun -->
          <div style="position:absolute;top:50%;left:50%;width:50px;height:50px;background:radial-gradient(circle,#fff 0%,#ffd700 30%,#ff8c00 70%,transparent 100%);border-radius:50%;transform:translate(-50%,-50%);animation:sunPulse 2s ease-in-out infinite;"></div>
          <!-- Planets -->
          <div style="position:absolute;top:50%;left:50%;width:0;height:0;animation:orbit1 3s linear infinite;">
            <div style="width:14px;height:14px;border-radius:50%;background:radial-gradient(circle at 30% 30%,#8cc,#466);box-shadow:0 0 8px rgba(100,200,200,0.5);transform:translate(-50%,-50%);"></div>
          </div>
          <div style="position:absolute;top:50%;left:50%;width:0;height:0;animation:orbit2 5s linear infinite;">
            <div style="width:22px;height:22px;border-radius:50%;background:radial-gradient(circle at 30% 30%,#6af,#248);box-shadow:0 0 12px rgba(80,150,255,0.5);transform:translate(-50%,-50%);"></div>
          </div>
          <div style="position:absolute;top:50%;left:50%;width:0;height:0;animation:orbit3 7s linear infinite;">
            <div style="width:18px;height:18px;border-radius:50%;background:radial-gradient(circle at 30% 30%,#e84,#a42);box-shadow:0 0 10px rgba(230,100,60,0.5);transform:translate(-50%,-50%);"></div>
          </div>
          <div style="position:absolute;top:50%;left:50%;width:0;height:0;animation:orbit4 10s linear infinite;">
            <div style="width:30px;height:30px;border-radius:50%;background:radial-gradient(circle at 30% 30%,#fa6,#a64);box-shadow:0 0 15px rgba(255,170,80,0.4);transform:translate(-50%,-50%);"></div>
          </div>
        </div>
        <!-- Stars -->
        <div style="position:absolute;top:10%;left:15%;width:2px;height:2px;background:#fff;border-radius:50%;box-shadow:0 0 4px #fff;animation:cursorBlink 2s ease-in-out infinite;"></div>
        <div style="position:absolute;top:25%;right:20%;width:3px;height:3px;background:#fff;border-radius:50%;box-shadow:0 0 6px #fff;animation:cursorBlink 3s ease-in-out 0.5s infinite;"></div>
        <div style="position:absolute;bottom:20%;left:25%;width:2px;height:2px;background:#fff;border-radius:50%;box-shadow:0 0 4px #fff;animation:cursorBlink 2.5s ease-in-out 1s infinite;"></div>
        <div style="position:absolute;top:60%;right:10%;width:2px;height:2px;background:#fff;border-radius:50%;box-shadow:0 0 4px #fff;animation:cursorBlink 1.8s ease-in-out 0.3s infinite;"></div>

        <div style="position:absolute;bottom:8%;left:0;right:0;text-align:center;font-family:${SANS};font-size:36px;font-weight:700;color:rgba(255,255,255,0.6);letter-spacing:4px;">SOLAR SYSTEM</div>
      \`

      scene.appendChild(container)
    }, 10000)

    // --- 3d: City Skyline (11.5–13s) ---
    setTimeout(() => {
      clearScene()

      const container = document.createElement('div')
      container.style.cssText = 'width:100%;height:100%;position:relative;overflow:hidden;animation:fadeIn 0.3s ease-out forwards;background:linear-gradient(180deg,#0a0a2a 0%,#1a1040 40%,#2a1050 70%,#3a1560 100%);'

      // Stars
      let starsHTML = ''
      for (let i = 0; i < 40; i++) {
        const x = Math.random() * 100
        const y = Math.random() * 50
        const s = 1 + Math.random() * 2
        starsHTML += \`<div style="position:absolute;top:\${y}%;left:\${x}%;width:\${s}px;height:\${s}px;background:#fff;border-radius:50%;opacity:\${0.3 + Math.random() * 0.7};"></div>\`
      }

      // Moon
      starsHTML += '<div style="position:absolute;top:12%;right:15%;width:60px;height:60px;background:radial-gradient(circle at 35% 35%,#ffe,#ddc);border-radius:50%;box-shadow:0 0 40px rgba(255,255,200,0.3);"></div>'

      // Buildings (rising animation)
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
      buildings.forEach(b => {
        // Windows
        let windowsHTML = ''
        const rows = Math.floor(b.h / 35)
        const cols = Math.floor(b.w / 25)
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const lit = Math.random() > 0.35
            const wColor = lit ? (Math.random() > 0.5 ? '#ffd700' : '#ffe4a0') : 'rgba(255,255,255,0.05)'
            windowsHTML += \`<div style="position:absolute;top:\${12 + r * 35}px;left:\${8 + c * 25}px;width:12px;height:18px;background:\${wColor};border-radius:1px;\${lit ? 'box-shadow:0 0 4px ' + wColor + ';' : ''}animation:\${lit ? 'windowBlink ' + (3 + Math.random() * 4) + 's ease-in-out ' + (Math.random() * 3) + 's infinite' : 'none'};"></div>\`
          }
        }

        buildingsHTML += \`<div style="position:absolute;bottom:0;left:\${b.x}px;width:\${b.w}px;height:\${b.h}px;background:\${b.color};animation:riseUp 0.6s cubic-bezier(0.16,1,0.3,1) \${b.delay}s both;">\${windowsHTML}</div>\`
      })

      container.innerHTML = starsHTML + '<div style="position:absolute;bottom:0;left:0;right:0;height:60%;">' + buildingsHTML + '</div>'
      container.innerHTML += '<div style="position:absolute;bottom:8%;left:0;right:0;text-align:center;font-family:${SANS};font-size:36px;font-weight:700;color:rgba(255,255,255,0.6);letter-spacing:4px;z-index:5;">CITY SKYLINE</div>'

      scene.appendChild(container)
    }, 11500)

    // --- 3e: EKG Heartbeat (13–14.5s) ---
    setTimeout(() => {
      clearScene()

      const container = document.createElement('div')
      container.style.cssText = 'width:100%;height:100%;display:flex;align-items:center;justify-content:center;position:relative;animation:zoomBlur 0.3s ease-out forwards;background:#0a0a0a;'

      // SVG heartbeat line
      const svgW = 900
      const svgH = 400
      // EKG waveform path
      const ekgPath = 'M 0,200 L 100,200 L 130,200 L 150,180 L 160,200 L 200,200 L 230,200 L 250,50 L 270,350 L 290,150 L 310,200 L 400,200 L 430,200 L 450,180 L 460,200 L 500,200 L 530,200 L 550,50 L 570,350 L 590,150 L 610,200 L 700,200 L 730,200 L 750,180 L 760,200 L 800,200 L 830,200 L 850,50 L 870,350 L 890,150 L 900,200'

      container.innerHTML = \`
        <svg width="\${svgW}" height="\${svgH}" viewBox="0 0 \${svgW} \${svgH}" style="overflow:visible;">
          <defs>
            <linearGradient id="ekgGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stop-color="#00ff88" stop-opacity="0.3"/>
              <stop offset="50%" stop-color="#00ff88" stop-opacity="1"/>
              <stop offset="100%" stop-color="#00ff88" stop-opacity="0.5"/>
            </linearGradient>
          </defs>
          <!-- Subtle grid -->
          <g opacity="0.08">
            \${Array(20).fill(0).map((_, i) => '<line x1="0" y1="' + (i * 20) + '" x2="' + svgW + '" y2="' + (i * 20) + '" stroke="#00ff88" stroke-width="0.5"/>').join('')}
            \${Array(46).fill(0).map((_, i) => '<line x1="' + (i * 20) + '" y1="0" x2="' + (i * 20) + '" y2="' + svgH + '" stroke="#00ff88" stroke-width="0.5"/>').join('')}
          </g>
          <path d="\${ekgPath}" fill="none" stroke="url(#ekgGrad)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="2000" style="animation:drawLine 1.2s ease-out forwards;filter:drop-shadow(0 0 8px #00ff88);"/>
        </svg>
        <div style="position:absolute;top:12%;right:10%;font-family:${MONO};font-size:64px;font-weight:700;color:#00ff88;text-shadow:0 0 20px #00ff88;animation:cursorBlink 1s ease-in-out infinite;">72 BPM</div>
        <div style="position:absolute;bottom:8%;left:0;right:0;text-align:center;font-family:${SANS};font-size:36px;font-weight:700;color:rgba(255,255,255,0.6);letter-spacing:4px;">HEARTBEAT MONITOR</div>
      \`

      scene.appendChild(container)
    }, 13000)

    // --- 3f: Matrix Rain (14.5–16s) ---
    setTimeout(() => {
      clearScene()

      const container = document.createElement('div')
      container.style.cssText = 'width:100%;height:100%;position:relative;overflow:hidden;animation:fadeIn 0.2s ease-out forwards;background:#000a00;'

      const chars = '\u30A2\u30A4\u30A6\u30A8\u30AA\u30AB\u30AD\u30AF\u30B1\u30B3\u30B5\u30B7\u30B9\u30BB\u30BD\u30BF\u30C1\u30C4\u30C6\u30C80123456789ABCDEF'
      const columns = 25
      const colWidth = Math.floor(W / columns)

      for (let c = 0; c < columns; c++) {
        const col = document.createElement('div')
        col.style.cssText = 'position:absolute;top:0;font-family:${MONO};font-size:22px;line-height:28px;color:#00ff41;text-shadow:0 0 8px #00ff41;writing-mode:vertical-lr;white-space:nowrap;'
        col.style.left = (c * colWidth) + 'px'
        col.style.animationDelay = (Math.random() * 1.5) + 's'
        col.style.animation = 'matrixFall ' + (1 + Math.random() * 1.5) + 's linear ' + (Math.random() * 0.8) + 's both'
        col.style.opacity = String(0.3 + Math.random() * 0.7)

        let text = ''
        const len = 15 + Math.floor(Math.random() * 25)
        for (let i = 0; i < len; i++) {
          text += chars[Math.floor(Math.random() * chars.length)]
        }
        col.textContent = text
        container.appendChild(col)
      }

      container.innerHTML += '<div style="position:absolute;bottom:8%;left:0;right:0;text-align:center;font-family:${SANS};font-size:36px;font-weight:700;color:rgba(0,255,65,0.7);letter-spacing:4px;z-index:5;text-shadow:0 0 20px rgba(0,255,65,0.5);">MATRIX RAIN</div>'

      scene.appendChild(container)
    }, 14500)

    // ═══════════════════════════════════════════
    // SCENE 4 (16–19s): "Any animation. Any graphic. Any visualization."
    // ═══════════════════════════════════════════

    setTimeout(() => {
      clearScene()

      const container = document.createElement('div')
      container.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%;gap:50px;'

      const phrases = [
        { text: 'Any animation.', delay: 0 },
        { text: 'Any graphic.', delay: 800 },
        { text: 'Any visualization.', delay: 1600 },
      ]

      phrases.forEach(p => {
        const el = document.createElement('div')
        el.style.cssText = 'font-family:${SANS};font-weight:800;font-size:64px;color:#fff;text-align:center;letter-spacing:3px;opacity:0;'
        el.textContent = p.text
        container.appendChild(el)

        setTimeout(() => {
          el.style.animation = 'punchIn 0.5s cubic-bezier(0.16,1,0.3,1) forwards'
        }, p.delay)
      })

      scene.appendChild(container)
    }, 16000)

    // ═══════════════════════════════════════════
    // SCENE 5 (19–24s): "ARE YOU READY?" + Branding
    // ═══════════════════════════════════════════

    setTimeout(() => {
      clearScene()

      const container = document.createElement('div')
      container.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%;gap:40px;'

      // ARE YOU READY?
      const ready = document.createElement('div')
      ready.id = 'ready-text'
      ready.style.cssText = 'font-family:${SANS};font-weight:900;font-size:80px;color:#fff;text-align:center;letter-spacing:6px;opacity:0;line-height:1.1;'
      ready.textContent = 'ARE YOU READY?'
      container.appendChild(ready)

      // Divider line
      const divider = document.createElement('div')
      divider.id = 'divider'
      divider.style.cssText = 'width:200px;height:2px;background:linear-gradient(90deg,transparent,#4af,transparent);opacity:0;'
      container.appendChild(divider)

      // Claude Code brand
      const brand = document.createElement('div')
      brand.id = 'brand-name'
      brand.style.cssText = 'font-family:${SANS};font-weight:800;font-size:68px;letter-spacing:4px;opacity:0;text-align:center;background:linear-gradient(90deg,#4af,#a78bfa,#f472b6,#4af);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;'
      brand.textContent = 'Claude Code'
      container.appendChild(brand)

      // Tagline
      const tagline = document.createElement('div')
      tagline.id = 'tagline'
      tagline.style.cssText = 'font-family:${SANS};font-weight:500;font-size:36px;color:rgba(255,255,255,0.6);letter-spacing:6px;text-transform:uppercase;opacity:0;text-align:center;'
      tagline.textContent = 'The future of building.'
      container.appendChild(tagline)

      scene.appendChild(container)

      // Sequence
      setTimeout(() => {
        const r = document.getElementById('ready-text')
        if (r) {
          r.style.animation = 'punchIn 0.6s cubic-bezier(0.16,1,0.3,1) forwards'
        }
      }, 200)

      setTimeout(() => {
        const r = document.getElementById('ready-text')
        if (r) r.style.animation = 'readyGlow 1.5s ease-in-out infinite'
      }, 1200)

      setTimeout(() => {
        const d = document.getElementById('divider')
        if (d) d.style.animation = 'fadeIn 0.5s ease-out forwards'
      }, 1500)

      setTimeout(() => {
        const b = document.getElementById('brand-name')
        if (b) {
          b.style.animation = 'scaleIn 0.7s cubic-bezier(0.16,1,0.3,1) forwards'
        }
      }, 2000)

      // Start gradient animation on brand after it appears
      setTimeout(() => {
        const b = document.getElementById('brand-name')
        if (b) b.style.animation = 'brandShine 3s linear infinite'
      }, 2800)

      setTimeout(() => {
        const t = document.getElementById('tagline')
        if (t) t.style.animation = 'fadeInUp 0.6s ease-out forwards'
      }, 3000)
    }, 19000)

  </script>
</body>
</html>`
}

async function render() {
  resetOutputDir()

  writeSources({
    createdAt: new Date().toISOString(),
    strategy: 'v34a — Claude Code showcase ad "Welcome to the Future" with CSS-only demo visualizations',
    safeBottomPixels: SAFE_BOTTOM,
  })

  const browser = await chromium.launch()
  console.log('Recording Claude Code showcase...')

  const videoCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    recordVideo: { dir: OUT_DIR, size: { width: WIDTH, height: HEIGHT } }
  })

  const videoPage = await videoCtx.newPage()
  await videoPage.evaluate(() => {
    document.documentElement.style.background = '#0a0a0a'
    document.body.style.background = '#0a0a0a'
  })

  const html = buildHTML()
  await videoPage.setContent(html, { waitUntil: 'load' })
  await videoPage.waitForTimeout(500)
  await videoPage.waitForTimeout(TOTAL_DURATION_MS)

  await videoPage.close()
  await videoCtx.close()
  await browser.close()

  const videoFiles = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.webm'))
  if (videoFiles.length === 0) {
    console.error('No video file was generated!')
    return
  }

  const srcVideo = path.join(OUT_DIR, videoFiles[0])
  const dstVideo = path.join(OUT_DIR, 'claude-code-showcase-v34a.mp4')

  const { execSync } = await import('child_process')
  try {
    execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${dstVideo}"`, { stdio: 'pipe' })
    fs.unlinkSync(srcVideo)
    console.log('Rendered claude-code-showcase-v34a.mp4')
  } catch (err) {
    console.warn('ffmpeg not available, keeping as webm...')
    fs.renameSync(srcVideo, dstVideo)
  }

  // Copy to videos directory
  const videosDir = path.join(__dirname, 'videos')
  if (!fs.existsSync(videosDir)) fs.mkdirSync(videosDir, { recursive: true })
  fs.copyFileSync(dstVideo, path.join(videosDir, 'claude-code-showcase-v34a.mp4'))
  console.log('Copied to videos/claude-code-showcase-v34a.mp4')

  console.log(`Done: output written to ${OUT_DIR}`)
}

render().catch(error => {
  console.error(error)
  process.exit(1)
})
