import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, "output-27a")

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 430
const SAFE_TOP = 213
const SAFE_LEFT = 66
const SAFE_RIGHT = 1027
const MANILA_COLOR = '#E8443A'

const SF = "-apple-system, 'Helvetica Neue', Arial, sans-serif"
const BOLD = "'Avenir Next', 'Helvetica Neue', Arial, sans-serif"

const TOTAL_DURATION_MS = 20000

const PROOF_PHOTOS = [
  'manila-gallery-dsc-0190.jpg',
  'manila-gallery-night-001.jpg',
  'manila-gallery-garden-001.jpg',
  'manila-gallery-urban-001.jpg',
  'manila-gallery-canal-001.jpg',
  'manila-gallery-ivy-001.jpg',
]

function resetOutputDir() {
  fs.rmSync(OUT_DIR, { recursive: true, force: true })
  fs.mkdirSync(OUT_DIR, { recursive: true })
}

function readImage(name) {
  const buf = fs.readFileSync(path.join(IMAGE_DIR, name))
  return `data:image/jpeg;base64,${buf.toString('base64')}`
}

function writeSources(payload) {
  fs.writeFileSync(path.join(OUT_DIR, 'sources.json'), JSON.stringify(payload, null, 2))
}

// SVG cartoon character builder — cute rounded style
function cartoonPerson({ x, y, scale, skinColor, hairColor, shirtColor, armPose, expression, id }) {
  scale = scale || 1
  skinColor = skinColor || '#F5D0A9'
  hairColor = hairColor || '#4A3728'
  shirtColor = shirtColor || '#5B8DEF'
  armPose = armPose || 'down' // down, wave, hold-camera, point-right, both-up
  expression = expression || 'smile' // smile, excited, thinking
  id = id || ''

  const s = scale

  // Arm paths
  let leftArm = '', rightArm = ''
  switch (armPose) {
    case 'wave':
      leftArm = `<line x1="${-22*s}" y1="${50*s}" x2="${-45*s}" y2="${85*s}" stroke="${skinColor}" stroke-width="${12*s}" stroke-linecap="round"/>`
      rightArm = `<path d="M${22*s},${50*s} Q${55*s},${20*s} ${50*s},${-10*s}" stroke="${skinColor}" stroke-width="${12*s}" stroke-linecap="round" fill="none">
        <animateTransform attributeName="transform" type="rotate" values="0;-10;10;-10;0" dur="0.6s" repeatCount="indefinite" additive="sum"/></path>
        <circle cx="${50*s}" cy="${-14*s}" r="${8*s}" fill="${skinColor}">
        <animateTransform attributeName="transform" type="rotate" values="0;-10;10;-10;0" dur="0.6s" repeatCount="indefinite" additive="sum"/></circle>`
      break
    case 'both-up':
      leftArm = `<path d="M${-22*s},${50*s} Q${-55*s},${20*s} ${-48*s},${-5*s}" stroke="${skinColor}" stroke-width="${12*s}" stroke-linecap="round" fill="none"/>
        <circle cx="${-48*s}" cy="${-9*s}" r="${8*s}" fill="${skinColor}"/>`
      rightArm = `<path d="M${22*s},${50*s} Q${55*s},${20*s} ${48*s},${-5*s}" stroke="${skinColor}" stroke-width="${12*s}" stroke-linecap="round" fill="none"/>
        <circle cx="${48*s}" cy="${-9*s}" r="${8*s}" fill="${skinColor}"/>`
      break
    case 'hold-camera':
      leftArm = `<line x1="${-22*s}" y1="${50*s}" x2="${-15*s}" y2="${72*s}" stroke="${skinColor}" stroke-width="${12*s}" stroke-linecap="round"/>`
      rightArm = `<line x1="${22*s}" y1="${50*s}" x2="${15*s}" y2="${72*s}" stroke="${skinColor}" stroke-width="${12*s}" stroke-linecap="round"/>`
      break
    case 'point-right':
      leftArm = `<line x1="${-22*s}" y1="${50*s}" x2="${-45*s}" y2="${85*s}" stroke="${skinColor}" stroke-width="${12*s}" stroke-linecap="round"/>`
      rightArm = `<line x1="${22*s}" y1="${50*s}" x2="${65*s}" y2="${45*s}" stroke="${skinColor}" stroke-width="${12*s}" stroke-linecap="round"/>
        <circle cx="${69*s}" cy="${43*s}" r="${8*s}" fill="${skinColor}"/>`
      break
    case 'hold-phone':
      leftArm = `<line x1="${-22*s}" y1="${50*s}" x2="${-45*s}" y2="${85*s}" stroke="${skinColor}" stroke-width="${12*s}" stroke-linecap="round"/>`
      rightArm = `<path d="M${22*s},${50*s} Q${35*s},${55*s} ${30*s},${70*s}" stroke="${skinColor}" stroke-width="${12*s}" stroke-linecap="round" fill="none"/>`
      break
    default:
      leftArm = `<line x1="${-22*s}" y1="${50*s}" x2="${-40*s}" y2="${90*s}" stroke="${skinColor}" stroke-width="${12*s}" stroke-linecap="round"/>`
      rightArm = `<line x1="${22*s}" y1="${50*s}" x2="${40*s}" y2="${90*s}" stroke="${skinColor}" stroke-width="${12*s}" stroke-linecap="round"/>`
  }

  // Eyes
  let eyes = ''
  switch (expression) {
    case 'excited':
      eyes = `<circle cx="${-12*s}" cy="${-8*s}" r="${6*s}" fill="#333"/>
        <circle cx="${12*s}" cy="${-8*s}" r="${6*s}" fill="#333"/>
        <circle cx="${-9*s}" cy="${-10*s}" r="${2*s}" fill="#fff"/>
        <circle cx="${15*s}" cy="${-10*s}" r="${2*s}" fill="#fff"/>
        <path d="M${-14*s},${8*s} Q${0},${22*s} ${14*s},${8*s}" stroke="#333" stroke-width="${3*s}" fill="none"/>`
      break
    case 'thinking':
      eyes = `<circle cx="${-12*s}" cy="${-8*s}" r="${5*s}" fill="#333"/>
        <line x1="${6*s}" y1="${-12*s}" x2="${18*s}" y2="${-12*s}" stroke="#333" stroke-width="${3*s}" stroke-linecap="round"/>
        <path d="M${-10*s},${8*s} Q${0},${12*s} ${10*s},${6*s}" stroke="#333" stroke-width="${3*s}" fill="none"/>`
      break
    default: // smile
      eyes = `<circle cx="${-12*s}" cy="${-8*s}" r="${5*s}" fill="#333"/>
        <circle cx="${12*s}" cy="${-8*s}" r="${5*s}" fill="#333"/>
        <path d="M${-10*s},${6*s} Q${0},${16*s} ${10*s},${6*s}" stroke="#333" stroke-width="${3*s}" fill="none"/>`
  }

  return `<g transform="translate(${x},${y})" ${id ? `id="${id}"` : ''}>
    <!-- Hair (back) -->
    <ellipse cx="0" cy="${-28*s}" rx="${34*s}" ry="${30*s}" fill="${hairColor}"/>
    <!-- Head -->
    <circle cx="0" cy="${-18*s}" r="${30*s}" fill="${skinColor}"/>
    <!-- Hair (front) -->
    <ellipse cx="0" cy="${-42*s}" rx="${28*s}" ry="${14*s}" fill="${hairColor}"/>
    <!-- Face -->
    ${eyes}
    <!-- Blush -->
    <ellipse cx="${-20*s}" cy="${2*s}" rx="${8*s}" ry="${5*s}" fill="rgba(255,150,150,0.35)"/>
    <ellipse cx="${20*s}" cy="${2*s}" rx="${8*s}" ry="${5*s}" fill="rgba(255,150,150,0.35)"/>
    <!-- Body -->
    <rect x="${-24*s}" y="${18*s}" width="${48*s}" height="${60*s}" rx="${16*s}" fill="${shirtColor}"/>
    <!-- Arms -->
    ${leftArm}
    ${rightArm}
    <!-- Legs -->
    <line x1="${-12*s}" y1="${78*s}" x2="${-14*s}" y2="${110*s}" stroke="${skinColor}" stroke-width="${14*s}" stroke-linecap="round"/>
    <line x1="${12*s}" y1="${78*s}" x2="${14*s}" y2="${110*s}" stroke="${skinColor}" stroke-width="${14*s}" stroke-linecap="round"/>
    <!-- Shoes -->
    <ellipse cx="${-14*s}" cy="${115*s}" rx="${12*s}" ry="${8*s}" fill="#333"/>
    <ellipse cx="${14*s}" cy="${115*s}" rx="${12*s}" ry="${8*s}" fill="#333"/>
  </g>`
}

// Camera SVG
function cartoonCamera(x, y, scale) {
  const s = scale || 1
  return `<g transform="translate(${x},${y}) scale(${s})">
    <rect x="-40" y="-25" width="80" height="55" rx="10" fill="#444"/>
    <rect x="-10" y="-35" width="25" height="14" rx="4" fill="#555"/>
    <circle cx="0" cy="2" r="18" fill="#222" stroke="#666" stroke-width="3"/>
    <circle cx="0" cy="2" r="12" fill="#1a1a4a"/>
    <circle cx="5" cy="-3" r="4" fill="rgba(255,255,255,0.3)"/>
    <rect x="25" y="-18" width="10" height="10" rx="2" fill="${MANILA_COLOR}"/>
  </g>`
}

// Phone SVG
function cartoonPhone(x, y, scale) {
  const s = scale || 1
  return `<g transform="translate(${x},${y}) scale(${s})">
    <rect x="-18" y="-32" width="36" height="64" rx="6" fill="#222" stroke="#555" stroke-width="2"/>
    <rect x="-14" y="-26" width="28" height="48" rx="2" fill="#3797f0"/>
    <circle cx="0" cy="27" r="3" fill="#555"/>
    <!-- IG-style chat bubbles on screen -->
    <rect x="-10" y="-20" width="16" height="8" rx="4" fill="#fff" opacity="0.9"/>
    <rect x="-2" y="-8" width="14" height="8" rx="4" fill="#E8443A" opacity="0.9"/>
    <rect x="-10" y="4" width="18" height="8" rx="4" fill="#fff" opacity="0.9"/>
  </g>`
}

// Camera flash burst
function flashBurst(x, y, id) {
  return `<g transform="translate(${x},${y})" id="${id}" style="opacity:0;">
    <circle cx="0" cy="0" r="60" fill="rgba(255,255,255,0.9)"/>
    <circle cx="0" cy="0" r="120" fill="rgba(255,255,255,0.3)"/>
    ${[0,45,90,135,180,225,270,315].map(angle =>
      `<line x1="0" y1="0" x2="${Math.cos(angle*Math.PI/180)*100}" y2="${Math.sin(angle*Math.PI/180)*100}" stroke="rgba(255,255,200,0.6)" stroke-width="4"/>`
    ).join('')}
  </g>`
}

// Speech bubble
function speechBubble(x, y, text, color, id, tailSide) {
  color = color || '#fff'
  tailSide = tailSide || 'left'
  const textColor = color === '#fff' ? '#333' : '#fff'
  const tailX = tailSide === 'left' ? x - 20 : x + 20
  return `<g id="${id}" style="opacity:0;">
    <rect x="${x - 120}" y="${y - 30}" width="240" height="60" rx="20" fill="${color}" stroke="rgba(0,0,0,0.1)" stroke-width="2"/>
    <polygon points="${tailX},${y+30} ${tailX-10},${y+50} ${tailX+15},${y+30}" fill="${color}"/>
    <text x="${x}" y="${y+6}" text-anchor="middle" font-family="${SF}" font-size="22" font-weight="600" fill="${textColor}">${text}</text>
  </g>`
}

// Calendar
function cartoonCalendar(x, y, scale) {
  const s = scale || 1
  return `<g transform="translate(${x},${y}) scale(${s})">
    <rect x="-30" y="-35" width="60" height="70" rx="6" fill="#fff" stroke="#ddd" stroke-width="2"/>
    <rect x="-30" y="-35" width="60" height="20" rx="6" fill="${MANILA_COLOR}"/>
    <rect x="-30" y="-20" width="60" height="5" fill="${MANILA_COLOR}"/>
    <line x1="-10" y1="-42" x2="-10" y2="-30" stroke="#666" stroke-width="4" stroke-linecap="round"/>
    <line x1="10" y1="-42" x2="10" y2="-30" stroke="#666" stroke-width="4" stroke-linecap="round"/>
    <!-- Date grid -->
    <circle cx="-12" cy="0" r="8" fill="${MANILA_COLOR}" opacity="0.2"/>
    <circle cx="12" cy="0" r="8" fill="${MANILA_COLOR}" opacity="0.2"/>
    <circle cx="0" cy="18" r="10" fill="${MANILA_COLOR}"/>
    <text x="0" y="22" text-anchor="middle" font-size="12" font-weight="700" fill="#fff">15</text>
  </g>`
}

function buildHTML(imageDataMap) {
  return `<!DOCTYPE html>
<html>
<head>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { margin: 0; padding: 0; background: #000; -webkit-font-smoothing: antialiased; }

  .page {
    width: ${WIDTH}px;
    height: ${HEIGHT}px;
    position: relative;
    overflow: hidden;
    background: #0a0a0a;
    font-family: ${SF};
  }

  @keyframes bounceIn {
    0% { transform: scale(0); opacity: 0; }
    50% { transform: scale(1.15); }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }
  @keyframes slideUp {
    0% { transform: translateY(80px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }
  @keyframes popIn {
    0% { transform: scale(0) rotate(-10deg); opacity: 0; }
    60% { transform: scale(1.1) rotate(2deg); }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-15px); }
  }
  @keyframes walkIn {
    0% { transform: translateX(-200px); opacity: 0; }
    100% { transform: translateX(0); opacity: 1; }
  }
  @keyframes walkInRight {
    0% { transform: translateX(200px); opacity: 0; }
    100% { transform: translateX(0); opacity: 1; }
  }
  @keyframes cameraFlash {
    0% { opacity: 0; }
    10% { opacity: 1; }
    30% { opacity: 1; }
    100% { opacity: 0; }
  }
  @keyframes bob {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    25% { transform: translateY(-8px) rotate(-2deg); }
    75% { transform: translateY(-4px) rotate(2deg); }
  }
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.06); }
  }
  @keyframes tileReveal {
    0% { opacity: 0; transform: scale(0.7) rotate(-3deg); }
    100% { opacity: 1; transform: scale(1) rotate(0deg); }
  }
  @keyframes heartFloat {
    0% { transform: translateY(0) scale(1); opacity: 1; }
    100% { transform: translateY(-120px) scale(1.5); opacity: 0; }
  }
  @keyframes sparkle {
    0%, 100% { opacity: 0; transform: scale(0.5) rotate(0deg); }
    50% { opacity: 1; transform: scale(1) rotate(180deg); }
  }

  /* Scene visibility — 18s total */
  @keyframes scene1Vis {
    0%     { opacity: 1; }
    23%    { opacity: 1; }
    25%    { opacity: 0; }
    100%   { opacity: 0; }
  }
  @keyframes scene2Vis {
    0%     { opacity: 0; }
    23%    { opacity: 0; }
    25%    { opacity: 1; }
    48%    { opacity: 1; }
    50%    { opacity: 0; }
    100%   { opacity: 0; }
  }
  @keyframes scene3Vis {
    0%     { opacity: 0; }
    48%    { opacity: 0; }
    50%    { opacity: 1; }
    73%    { opacity: 1; }
    75%    { opacity: 0; }
    100%   { opacity: 0; }
  }
  @keyframes scene4Vis {
    0%     { opacity: 0; }
    73%    { opacity: 0; }
    75%    { opacity: 1; }
    100%   { opacity: 1; }
  }

  .scene-1 { animation: scene1Vis 18s linear forwards; }
  .scene-2 { animation: scene2Vis 18s linear forwards; }
  .scene-3 { animation: scene3Vis 18s linear forwards; }
  .scene-4 { animation: scene4Vis 18s linear forwards; }

  .scene {
    position: absolute;
    inset: 0;
    width: ${WIDTH}px;
    height: ${HEIGHT}px;
    overflow: hidden;
  }

  .headline {
    font-family: ${BOLD};
    font-weight: 800;
    color: #fff;
    text-align: center;
  }
  .subtext {
    font-family: ${SF};
    font-weight: 500;
    color: rgba(255,255,255,0.75);
    text-align: center;
  }
</style>
</head>
<body>
  <div class="page">

    <!-- ═══ SCENE 4: CTA ═══ -->
    <div class="scene scene-4" style="background:radial-gradient(ellipse at 50% 60%, #1a1028 0%, #0a0a0a 70%);">
      <!-- Ground / stage -->
      <div style="position:absolute;left:0;right:0;bottom:${SAFE_BOTTOM - 40}px;height:300px;background:linear-gradient(180deg, rgba(232,68,58,0.08) 0%, rgba(232,68,58,0.02) 100%);border-top:2px solid rgba(232,68,58,0.15);"></div>

      <div style="position:absolute;left:0;right:0;top:${SAFE_TOP + 30}px;text-align:center;">
        <h1 class="headline" style="font-size:88px;line-height:1.0;margin:0 60px;opacity:0;" id="cta-head">
          DM me if<br/>interested!!
        </h1>
      </div>

      <!-- Cartoon characters celebrating -->
      <svg viewBox="0 0 ${WIDTH} 600" style="position:absolute;left:0;top:${SAFE_TOP + 280}px;width:${WIDTH}px;height:600px;">
        <g id="cta-photographer" style="opacity:0;">
          ${cartoonPerson({ x: 540, y: 180, scale: 2.2, skinColor: '#D4A574', hairColor: '#2C1810', shirtColor: MANILA_COLOR, armPose: 'both-up', expression: 'excited' })}
        </g>
        <g id="cta-model1" style="opacity:0;">
          ${cartoonPerson({ x: 280, y: 200, scale: 1.8, skinColor: '#F5D0A9', hairColor: '#8B4513', shirtColor: '#5B8DEF', armPose: 'wave', expression: 'excited' })}
        </g>
        <g id="cta-model2" style="opacity:0;">
          ${cartoonPerson({ x: 800, y: 200, scale: 1.8, skinColor: '#C68642', hairColor: '#1a1a1a', shirtColor: '#9B59B6', armPose: 'wave', expression: 'excited' })}
        </g>
        <!-- Hearts floating up -->
        <g id="cta-hearts" style="opacity:0;">
          <text x="400" y="120" font-size="50" fill="${MANILA_COLOR}" style="animation:heartFloat 2s ease-out 0.5s infinite;">♥</text>
          <text x="540" y="100" font-size="40" fill="#ff6b8a" style="animation:heartFloat 2s ease-out 1s infinite;">♥</text>
          <text x="680" y="130" font-size="45" fill="${MANILA_COLOR}" style="animation:heartFloat 2s ease-out 0.2s infinite;">♥</text>
        </g>
      </svg>

      <div style="position:absolute;left:0;right:0;top:${SAFE_TOP + 820}px;display:flex;flex-direction:column;align-items:center;">
        <div style="opacity:0;" id="cta-handle-box">
          <div style="background:${MANILA_COLOR};border-radius:28px;padding:26px 50px;display:inline-flex;align-items:center;gap:20px;box-shadow:0 8px 40px rgba(232,68,58,0.5);">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span style="font-family:${BOLD};font-size:42px;font-weight:700;color:#fff;">@madebyaidan</span>
          </div>
        </div>
        <p class="subtext" style="font-size:34px;margin-top:20px;opacity:0;" id="cta-ig">on Instagram</p>
        <p class="subtext" style="font-size:30px;margin-top:30px;color:rgba(255,255,255,0.45);opacity:0;" id="cta-limited">Limited spots this month</p>
      </div>
    </div>

    <!-- ═══ SCENE 3: HOW IT WORKS — 3 mini-scenes stacked ═══ -->
    <div class="scene scene-3" style="background:#0a0a0a;">
      <div style="position:absolute;left:0;right:0;top:${SAFE_TOP + 20}px;text-align:center;">
        <h2 class="headline" style="font-size:78px;opacity:0;" id="steps-title">3 easy steps</h2>
        <p class="subtext" style="font-size:36px;margin-top:8px;opacity:0;" id="steps-sub">That's it.</p>
      </div>

      <!-- Step 1: Person holding phone, DM bubbles -->
      <div style="position:absolute;left:${SAFE_LEFT}px;right:${WIDTH - SAFE_RIGHT}px;top:${SAFE_TOP + 220}px;height:300px;background:rgba(255,255,255,0.04);border-radius:28px;border:1px solid rgba(255,255,255,0.08);opacity:0;" id="step1-card">
        <div style="position:absolute;left:30px;top:20px;">
          <span style="font-family:${BOLD};font-size:28px;font-weight:700;color:${MANILA_COLOR};letter-spacing:0.1em;">STEP 1</span>
          <p style="font-family:${BOLD};font-size:40px;font-weight:700;color:#fff;margin-top:6px;">DM me on Instagram</p>
          <p style="font-family:${SF};font-size:28px;color:rgba(255,255,255,0.6);margin-top:4px;">Just say hey!</p>
        </div>
        <svg viewBox="0 0 400 280" style="position:absolute;right:0;top:0;width:400px;height:280px;">
          <g id="step1-person" style="opacity:0;">
            ${cartoonPerson({ x: 180, y: 140, scale: 1.3, skinColor: '#F5D0A9', hairColor: '#8B4513', shirtColor: '#3797f0', armPose: 'hold-phone', expression: 'smile' })}
          </g>
          <g id="step1-phone" style="opacity:0;">
            ${cartoonPhone(230, 215, 1.4)}
          </g>
          ${speechBubble(280, 60, 'hey! 👋', '#3797f0', 'step1-bubble', 'right')}
        </svg>
      </div>

      <!-- Step 2: Two characters + calendar -->
      <div style="position:absolute;left:${SAFE_LEFT}px;right:${WIDTH - SAFE_RIGHT}px;top:${SAFE_TOP + 545}px;height:300px;background:rgba(255,255,255,0.04);border-radius:28px;border:1px solid rgba(255,255,255,0.08);opacity:0;" id="step2-card">
        <div style="position:absolute;left:30px;top:20px;">
          <span style="font-family:${BOLD};font-size:28px;font-weight:700;color:${MANILA_COLOR};letter-spacing:0.1em;">STEP 2</span>
          <p style="font-family:${BOLD};font-size:40px;font-weight:700;color:#fff;margin-top:6px;">We pick a date</p>
          <p style="font-family:${SF};font-size:28px;color:rgba(255,255,255,0.6);margin-top:4px;">Location + vibe together</p>
        </div>
        <svg viewBox="0 0 400 280" style="position:absolute;right:0;top:0;width:400px;height:280px;">
          <g id="step2-cal" style="opacity:0;">
            ${cartoonCalendar(200, 100, 2.0)}
          </g>
          <g id="step2-person1" style="opacity:0;">
            ${cartoonPerson({ x: 100, y: 150, scale: 1.1, skinColor: '#D4A574', hairColor: '#2C1810', shirtColor: MANILA_COLOR, armPose: 'point-right', expression: 'smile' })}
          </g>
          <g id="step2-person2" style="opacity:0;">
            ${cartoonPerson({ x: 310, y: 150, scale: 1.1, skinColor: '#F5D0A9', hairColor: '#4A3728', shirtColor: '#9B59B6', armPose: 'down', expression: 'thinking' })}
          </g>
        </svg>
      </div>

      <!-- Step 3: Photographer + model + camera flash -->
      <div style="position:absolute;left:${SAFE_LEFT}px;right:${WIDTH - SAFE_RIGHT}px;top:${SAFE_TOP + 870}px;height:300px;background:rgba(255,255,255,0.04);border-radius:28px;border:1px solid rgba(255,255,255,0.08);opacity:0;" id="step3-card">
        <div style="position:absolute;left:30px;top:20px;">
          <span style="font-family:${BOLD};font-size:28px;font-weight:700;color:${MANILA_COLOR};letter-spacing:0.1em;">STEP 3</span>
          <p style="font-family:${BOLD};font-size:40px;font-weight:700;color:#fff;margin-top:6px;">Show up. I guide you.</p>
          <p style="font-family:${SF};font-size:28px;color:rgba(255,255,255,0.6);margin-top:4px;">No experience needed</p>
        </div>
        <svg viewBox="0 0 400 280" style="position:absolute;right:0;top:0;width:400px;height:280px;">
          <g id="step3-photographer" style="opacity:0;">
            ${cartoonPerson({ x: 100, y: 140, scale: 1.2, skinColor: '#D4A574', hairColor: '#2C1810', shirtColor: MANILA_COLOR, armPose: 'hold-camera', expression: 'excited' })}
          </g>
          <g id="step3-camera" style="opacity:0;">
            ${cartoonCamera(100, 225, 1.0)}
          </g>
          <g id="step3-model" style="opacity:0;">
            ${cartoonPerson({ x: 300, y: 140, scale: 1.2, skinColor: '#C68642', hairColor: '#1a1a1a', shirtColor: '#E91E63', armPose: 'both-up', expression: 'excited' })}
          </g>
          ${flashBurst(100, 180, 'step3-flash')}
          ${speechBubble(100, 48, 'look this way!', MANILA_COLOR, 'step3-bubble', 'left')}
        </svg>
      </div>
    </div>

    <!-- ═══ SCENE 2: PROOF — photos with cartoon reactions ═══ -->
    <div class="scene scene-2" style="background:#0a0a0a;">
      <div style="position:absolute;left:0;right:0;top:${SAFE_TOP + 20}px;text-align:center;">
        <h2 class="headline" style="font-size:72px;opacity:0;" id="proof-header">This is my work</h2>
        <p class="subtext" style="font-size:32px;margin-top:10px;opacity:0;" id="proof-sub">real photos. real people. 100% free.</p>
      </div>

      <!-- Photo grid -->
      <div style="position:absolute;left:30px;right:30px;top:${SAFE_TOP + 200}px;display:grid;grid-template-columns:1fr 1fr;gap:16px;">
        ${PROOF_PHOTOS.map((p, i) => `
        <div style="position:relative;border-radius:20px;overflow:hidden;aspect-ratio:3/4;opacity:0;" id="proof-img-${i}">
          <img src="${imageDataMap[p]}" style="width:100%;height:100%;object-fit:cover;display:block;"/>
        </div>`).join('')}
      </div>

      <!-- Cartoon spectator reacting at bottom -->
      <svg viewBox="0 0 300 200" style="position:absolute;right:20px;bottom:${SAFE_BOTTOM + 20}px;width:220px;height:160px;opacity:0;" id="proof-spectator">
        ${cartoonPerson({ x: 150, y: 90, scale: 1.0, skinColor: '#F5D0A9', hairColor: '#D4A017', shirtColor: '#27AE60', armPose: 'both-up', expression: 'excited' })}
      </svg>
      <div style="position:absolute;right:180px;bottom:${SAFE_BOTTOM + 150}px;opacity:0;" id="proof-reaction">
        <div style="background:#fff;border-radius:20px 20px 20px 4px;padding:14px 24px;box-shadow:0 4px 20px rgba(0,0,0,0.3);">
          <span style="font-family:${SF};font-size:28px;font-weight:600;color:#333;">these are amazing!!</span>
        </div>
      </div>
    </div>

    <!-- ═══ SCENE 1: HOOK — photographer meets model ═══ -->
    <div class="scene scene-1" style="background:radial-gradient(ellipse at 50% 60%, #1a1028 0%, #0a0a0a 70%);">
      <!-- Soft ground gradient -->
      <div style="position:absolute;left:0;right:0;bottom:${SAFE_BOTTOM - 40}px;height:400px;background:linear-gradient(180deg, transparent 0%, rgba(232,68,58,0.05) 100%);border-top:2px solid rgba(255,255,255,0.05);"></div>

      <!-- Manila badge -->
      <div style="position:absolute;left:0;right:0;top:${SAFE_TOP + 30}px;text-align:center;opacity:0;" id="hook-badge">
        <div style="display:inline-block;background:${MANILA_COLOR};border-radius:16px;padding:12px 40px;">
          <span style="font-family:${BOLD};font-size:38px;font-weight:700;color:#fff;letter-spacing:0.15em;text-transform:uppercase;">Manila</span>
        </div>
      </div>

      <h1 class="headline" style="font-size:110px;line-height:0.95;margin:0 60px;position:absolute;left:0;right:0;top:${SAFE_TOP + 120}px;opacity:0;" id="hook-head">
        Models<br/>wanted
      </h1>

      <!-- Cartoon scene: photographer with camera, models approaching -->
      <svg viewBox="0 0 ${WIDTH} 700" style="position:absolute;left:0;top:${SAFE_TOP + 420}px;width:${WIDTH}px;height:700px;">
        <!-- Photographer -->
        <g id="hook-photographer" style="opacity:0;">
          ${cartoonPerson({ x: 540, y: 250, scale: 2.5, skinColor: '#D4A574', hairColor: '#2C1810', shirtColor: MANILA_COLOR, armPose: 'hold-camera', expression: 'smile' })}
        </g>
        <!-- Camera in photographer's hands -->
        <g id="hook-camera" style="opacity:0;">
          ${cartoonCamera(540, 425, 2.2)}
        </g>
        <!-- Model walking in from left -->
        <g id="hook-model1" style="opacity:0;">
          ${cartoonPerson({ x: 250, y: 270, scale: 2.2, skinColor: '#F5D0A9', hairColor: '#8B4513', shirtColor: '#5B8DEF', armPose: 'wave', expression: 'excited' })}
        </g>
        <!-- Model walking in from right -->
        <g id="hook-model2" style="opacity:0;">
          ${cartoonPerson({ x: 830, y: 270, scale: 2.2, skinColor: '#C68642', hairColor: '#1a1a1a', shirtColor: '#9B59B6', armPose: 'wave', expression: 'excited' })}
        </g>
        <!-- Sparkles -->
        <g id="hook-sparkles" style="opacity:0;">
          <text x="160" y="200" font-size="40" style="animation:sparkle 1.5s ease-in-out 0.3s infinite;">✦</text>
          <text x="920" y="190" font-size="35" fill="${MANILA_COLOR}" style="animation:sparkle 1.5s ease-in-out 0.8s infinite;">✦</text>
          <text x="400" y="160" font-size="30" fill="#FFD700" style="animation:sparkle 1.5s ease-in-out 1.2s infinite;">✦</text>
          <text x="700" y="170" font-size="38" fill="#FF69B4" style="animation:sparkle 1.5s ease-in-out 0.1s infinite;">✦</text>
        </g>
      </svg>

      <p class="subtext" style="font-size:40px;position:absolute;left:0;right:0;top:${SAFE_TOP + 370}px;line-height:1.35;opacity:0;" id="hook-sub">
        Editorial portrait shoots<br/>No experience needed
      </p>

      <div style="position:absolute;left:0;right:0;bottom:${SAFE_BOTTOM + 30}px;text-align:center;opacity:0;" id="hook-free">
        <div style="display:inline-block;background:rgba(255,255,255,0.08);border:2px solid rgba(255,255,255,0.12);border-radius:22px;padding:16px 44px;">
          <span style="font-family:${BOLD};font-size:42px;font-weight:700;color:#fff;">100% Free</span>
        </div>
      </div>
    </div>

  </div>

  <script>
    function fadeIn(id, ms, dur) {
      dur = dur || 400
      setTimeout(() => {
        const el = document.getElementById(id)
        if (el) { el.style.transition = 'opacity '+dur+'ms ease-out'; el.style.opacity = '1' }
      }, ms)
    }
    function animIn(id, ms, anim) {
      setTimeout(() => {
        const el = document.getElementById(id)
        if (el) el.style.animation = anim
      }, ms)
    }

    // ═══ SCENE 1: HOOK (0–4.5s) ═══
    fadeIn('hook-badge', 300, 400)
    fadeIn('hook-head', 600, 500)
    // Photographer walks in
    animIn('hook-photographer', 800, 'slideUp 0.6s ease-out forwards')
    animIn('hook-camera', 1000, 'fadeIn 0.4s ease-out forwards')
    // Models walk in from sides
    animIn('hook-model1', 1400, 'walkIn 0.7s ease-out forwards')
    animIn('hook-model2', 1600, 'walkInRight 0.7s ease-out forwards')
    fadeIn('hook-sparkles', 2000, 400)
    fadeIn('hook-sub', 2200, 500)
    fadeIn('hook-free', 2800, 400)

    // ═══ SCENE 2: PROOF (4.5–9s) ═══
    fadeIn('proof-header', 4600, 400)
    fadeIn('proof-sub', 4900, 400)
    ${PROOF_PHOTOS.map((_, i) => `
    animIn('proof-img-${i}', 0, 'tileReveal 0.45s cubic-bezier(0.34,1.56,0.64,1) ${5200 + i * 250}ms forwards')
    `).join('')}
    // Spectator reacts
    fadeIn('proof-spectator', 7000, 500)
    animIn('proof-spectator', 7000, 'slideUp 0.5s ease-out forwards')
    fadeIn('proof-reaction', 7500, 400)

    // ═══ SCENE 3: STEPS (9–13.5s) ═══
    fadeIn('steps-title', 9200, 400)
    fadeIn('steps-sub', 9500, 300)

    // Step 1
    animIn('step1-card', 9800, 'popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards')
    fadeIn('step1-person', 10100, 300)
    fadeIn('step1-phone', 10300, 300)
    fadeIn('step1-bubble', 10600, 300)

    // Step 2
    animIn('step2-card', 10900, 'popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards')
    animIn('step2-person1', 11200, 'walkIn 0.5s ease-out forwards')
    animIn('step2-person2', 11300, 'walkInRight 0.5s ease-out forwards')
    fadeIn('step2-cal', 11500, 400)

    // Step 3
    animIn('step3-card', 12000, 'popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards')
    fadeIn('step3-photographer', 12300, 300)
    fadeIn('step3-camera', 12400, 300)
    animIn('step3-model', 12500, 'walkInRight 0.5s ease-out forwards')
    fadeIn('step3-bubble', 12800, 300)
    // Camera flash!
    animIn('step3-flash', 13200, 'cameraFlash 0.6s ease-out forwards')

    // ═══ SCENE 4: CTA (13.5–18s) ═══
    fadeIn('cta-head', 13700, 500)
    animIn('cta-photographer', 14000, 'bounceIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards')
    animIn('cta-model1', 14300, 'walkIn 0.6s ease-out forwards')
    animIn('cta-model2', 14500, 'walkInRight 0.6s ease-out forwards')
    fadeIn('cta-hearts', 14800, 400)
    animIn('cta-handle-box', 15200, 'bounceIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards')
    fadeIn('cta-ig', 15600, 300)
    fadeIn('cta-limited', 16200, 400)
    // Pulse CTA
    setTimeout(() => {
      const btn = document.getElementById('cta-handle-box')
      if (btn) btn.style.animation = 'pulse 1.5s ease-in-out infinite'
    }, 16000)
  </script>
</body>
</html>`
}

async function render() {
  resetOutputDir()

  const imageDataMap = {}
  for (const photo of PROOF_PHOTOS) {
    imageDataMap[photo] = readImage(photo)
  }

  writeSources({
    createdAt: new Date().toISOString(),
    strategy: 'v27a — animated cartoon characters storytelling version',
    safeBottomPixels: SAFE_BOTTOM,
    photos: PROOF_PHOTOS,
  })

  const browser = await chromium.launch()
  console.log('Recording animated cartoon version...')

  const videoCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    recordVideo: { dir: OUT_DIR, size: { width: WIDTH, height: HEIGHT } }
  })

  const videoPage = await videoCtx.newPage()
  await videoPage.evaluate(() => {
    document.documentElement.style.background = '#000'
    document.body.style.background = '#000'
  })

  const html = buildHTML(imageDataMap)
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
  const dstVideo = path.join(OUT_DIR, 'manila-cartoon-v27a.mp4')

  const { execSync } = await import('child_process')
  try {
    execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${dstVideo}"`, { stdio: 'pipe' })
    fs.unlinkSync(srcVideo)
    console.log('Rendered manila-cartoon-v27a.mp4')
  } catch (err) {
    console.warn('ffmpeg not available, keeping as webm...')
    fs.renameSync(srcVideo, dstVideo)
  }

  console.log(`Done: output written to ${OUT_DIR}`)
}

render().catch(error => {
  console.error(error)
  process.exit(1)
})
