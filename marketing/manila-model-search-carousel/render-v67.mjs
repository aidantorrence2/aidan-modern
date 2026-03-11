import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v67')

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 410

const SF = "-apple-system, 'Helvetica Neue', Arial, sans-serif"
const MANILA_COLOR = '#E8443A'
const GREEN = '#34C759'
const HANDLE = 'madebyaidan'

// Timeline:
// 0-1.2s:   Lock screen (time, date)
// 1.2-2s:   Incoming call slides up
// 2-4s:     Call ringing (pulse)
// 4s:       Accept press
// 4.5-5.5s: Transition to connected
// 5.5-7s:   Chat bubbles begin
// 7-16s:    Messages + photos interleaved
// 17-20s:   "how do I sign up?" → CTA
// 20-24s:   Hold
const TOTAL_DURATION = 24
const TOTAL_DURATION_MS = 26000

const p = (t) => ((t / TOTAL_DURATION) * 100).toFixed(2)

// Clean photos only — no film borders
const PHOTOS = [
  { file: 'manila-gallery-dsc-0190.jpg' },
  { file: 'manila-gallery-garden-001.jpg' },
  { file: 'manila-gallery-night-001.jpg' },
  { file: 'manila-gallery-urban-001.jpg' },
]

const CALLER_PHOTO = 'manila-gallery-dsc-0075.jpg'

const MESSAGES = [
  { time: 5.5, text: 'hey, I saw your work on IG', sender: 'them', duration: 2.5 },
  { time: 7.0, text: 'I want to do a shoot in Manila', sender: 'them', duration: 2.5 },
  { time: 9.0, text: 'just show up — I direct everything', sender: 'me', duration: 2.5 },
  { time: 11.0, text: 'no experience needed?', sender: 'them', duration: 2.0 },
  { time: 12.5, text: 'none. here are some recent shoots', sender: 'me', duration: 2.5 },
  { time: 17.0, text: 'how do I sign up?', sender: 'them', duration: 3.0 },
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

function buildCallAnimation(imageDataMap) {
  // Photo gallery — photos slide in during call
  const photoStartTime = 13.5
  const photoDuration = 1.2
  const photoGap = 0.3

  let photoKeyframes = ''
  let photoHTML = ''

  PHOTOS.forEach((photo, i) => {
    const start = photoStartTime + i * (photoDuration + photoGap)
    const rotation = (i % 2 === 0 ? -2 : 2) + (Math.random() - 0.5)
    const yOffset = 360 + i * 12

    photoKeyframes += `
      @keyframes photoSlide${i} {
        0%, ${p(start)}% { opacity:0; transform:translateX(120%) rotate(${rotation}deg); }
        ${p(start + 0.5)}% { opacity:1; transform:translateX(0) rotate(${rotation}deg); }
        ${p(start + photoDuration)}% { opacity:1; transform:translateX(0) rotate(${rotation}deg); }
        ${p(start + photoDuration + 0.3)}% { opacity:0; transform:translateX(-120%) rotate(${rotation}deg); }
        100% { opacity:0; }
      }
    `

    photoHTML += `
      <div style="position:absolute;left:100px;right:100px;top:${yOffset}px;height:560px;
        border-radius:24px;overflow:hidden;box-shadow:0 16px 50px rgba(0,0,0,0.6);
        opacity:0;z-index:${15 + i};
        animation:photoSlide${i} ${TOTAL_DURATION}s linear forwards;">
        <img src="${imageDataMap[photo.file]}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center 20%;"/>
      </div>
    `
  })

  // Message bubbles
  let messageKeyframes = ''
  let messageHTML = ''

  MESSAGES.forEach((msg, i) => {
    const isMe = msg.sender === 'me'
    const bubbleBg = isMe ? GREEN : 'rgba(255,255,255,0.15)'
    const align = isMe ? 'right:48px' : 'left:48px'
    const maxW = 760
    const yPos = 300 + (i * 110)

    messageKeyframes += `
      @keyframes msg${i} {
        0%, ${p(msg.time)}% { opacity:0; transform:translateY(20px) scale(0.9); }
        ${p(msg.time + 0.3)}% { opacity:1; transform:translateY(0) scale(1); }
        ${p(msg.time + msg.duration)}% { opacity:1; transform:translateY(0) scale(1); }
        ${p(msg.time + msg.duration + 0.3)}% { opacity:0; transform:translateY(-10px) scale(0.95); }
        100% { opacity:0; }
      }
    `

    messageHTML += `
      <div style="position:absolute;${align};top:${yPos}px;max-width:${maxW}px;z-index:12;
        opacity:0;animation:msg${i} ${TOTAL_DURATION}s linear forwards;">
        <div style="background:${bubbleBg};border-radius:26px;padding:22px 30px;backdrop-filter:blur(20px);
          ${isMe ? 'border-bottom-right-radius:8px;' : 'border-bottom-left-radius:8px;'}">
          <p style="font-family:${SF};font-size:42px;font-weight:500;color:#fff;margin:0;line-height:1.35;">${msg.text}</p>
        </div>
      </div>
    `
  })

  const ctaStart = 18.5

  return `<!DOCTYPE html>
<html>
<head>
<style>
  * { box-sizing:border-box;margin:0;padding:0; }
  html, body { margin:0;padding:0;background:#000;-webkit-font-smoothing:antialiased; }

  ${photoKeyframes}
  ${messageKeyframes}

  @keyframes lockScreenFade {
    0% { opacity:1; }
    ${p(0.8)}% { opacity:1; }
    ${p(1.2)}% { opacity:0; }
    100% { opacity:0; }
  }

  @keyframes callScreenIn {
    0% { opacity:0; transform:translateY(100%); }
    ${p(1.0)}% { opacity:0; transform:translateY(100%); }
    ${p(1.8)}% { opacity:1; transform:translateY(0); }
    100% { opacity:1; transform:translateY(0); }
  }

  @keyframes ringPulse {
    0%, 50% { box-shadow:0 0 0 0 rgba(52,199,89,0.4); }
    25% { box-shadow:0 0 0 35px rgba(52,199,89,0); }
    75% { box-shadow:0 0 0 35px rgba(52,199,89,0); }
    100% { box-shadow:0 0 0 0 rgba(52,199,89,0.4); }
  }

  @keyframes acceptPress {
    0%, ${p(3.8)}% { transform:scale(1); background:rgba(52,199,89,0.25); }
    ${p(4.0)}% { transform:scale(0.85); background:${GREEN}; }
    ${p(4.3)}% { transform:scale(1.1); background:${GREEN}; }
    ${p(4.5)}% { transform:scale(1); opacity:1; }
    ${p(5.0)}% { opacity:0; }
    100% { opacity:0; }
  }

  @keyframes declineBtn {
    0% { opacity:1; }
    ${p(4.5)}% { opacity:1; }
    ${p(5.0)}% { opacity:0; }
    100% { opacity:0; }
  }

  @keyframes incomingText {
    0% { opacity:1; }
    ${p(4.5)}% { opacity:1; }
    ${p(5.0)}% { opacity:0; }
    100% { opacity:0; }
  }

  @keyframes connectedText {
    0%, ${p(5.0)}% { opacity:0; }
    ${p(5.5)}% { opacity:1; }
    100% { opacity:1; }
  }

  @keyframes callerPhotoShrink {
    0%, ${p(4.5)}% {
      width:260px;height:260px;border-radius:130px;
      top:260px;left:${(WIDTH - 260) / 2}px;
    }
    ${p(5.5)}% {
      width:90px;height:90px;border-radius:45px;
      top:90px;left:50px;
    }
    100% {
      width:90px;height:90px;border-radius:45px;
      top:90px;left:50px;
    }
  }

  @keyframes nameMove {
    0%, ${p(4.5)}% {
      top:550px;left:0;right:0;text-align:center;font-size:64px;
    }
    ${p(5.5)}% {
      top:95px;left:160px;right:auto;text-align:left;font-size:44px;
    }
    100% {
      top:95px;left:160px;right:auto;text-align:left;font-size:44px;
    }
  }

  @keyframes bgBlur {
    0% { opacity:0.3; filter:blur(40px) brightness(0.3); }
    ${p(5.0)}% { opacity:0.3; filter:blur(40px) brightness(0.3); }
    ${p(6.0)}% { opacity:0.15; filter:blur(60px) brightness(0.2); }
    100% { opacity:0.15; filter:blur(60px) brightness(0.2); }
  }

  @keyframes ctaIn {
    0%, ${p(ctaStart)}% { opacity:0; transform:translateY(30px); }
    ${p(ctaStart + 0.8)}% { opacity:1; transform:translateY(0); }
    100% { opacity:1; transform:translateY(0); }
  }

  @keyframes timerIn {
    0%, ${p(5.0)}% { opacity:0; }
    ${p(5.5)}% { opacity:1; }
    100% { opacity:1; }
  }

  @keyframes callActionsIn {
    0%, ${p(5.0)}% { opacity:0; }
    ${p(5.8)}% { opacity:1; }
    100% { opacity:1; }
  }

  @keyframes greenGlow {
    0%, ${p(1.0)}% { opacity:0; }
    ${p(1.5)}% { opacity:1; }
    ${p(2.0)}% { opacity:0.5; }
    ${p(2.5)}% { opacity:1; }
    ${p(3.0)}% { opacity:0.5; }
    ${p(3.5)}% { opacity:1; }
    ${p(4.5)}% { opacity:1; }
    ${p(5.5)}% { opacity:0; }
    100% { opacity:0; }
  }
</style>
</head>
<body>
<div id="root" style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#000;">

  <!-- BLURRED BG -->
  <div style="position:absolute;inset:-40px;z-index:1;
    opacity:0.3;filter:blur(40px) brightness(0.3);
    animation:bgBlur ${TOTAL_DURATION}s linear forwards;">
    <img src="${imageDataMap[CALLER_PHOTO]}" style="width:130%;height:130%;object-fit:cover;object-position:center center;display:block;margin:-15% 0 0 -15%;"/>
  </div>

  <!-- GREEN GLOW (ring) -->
  <div style="position:absolute;top:-100px;left:50%;transform:translateX(-50%);width:700px;height:500px;
    background:radial-gradient(ellipse, rgba(52,199,89,0.2) 0%, transparent 70%);
    z-index:2;opacity:0;animation:greenGlow ${TOTAL_DURATION}s linear forwards;pointer-events:none;"></div>

  <!-- ===== LOCK SCREEN ===== -->
  <div style="position:absolute;inset:0;z-index:50;
    animation:lockScreenFade ${TOTAL_DURATION}s linear forwards;">
    <div style="position:absolute;inset:0;background:linear-gradient(180deg, #1c1c1e 0%, #000 100%);">
      <!-- Status bar -->
      <div style="padding:60px 40px 0;display:flex;justify-content:space-between;align-items:center;">
        <span style="font-family:${SF};font-size:34px;font-weight:600;color:#fff;">9:41</span>
        <div style="display:flex;align-items:center;gap:10px;">
          <svg width="36" height="24" viewBox="0 0 18 12"><rect x="0" y="3" width="3" height="9" rx="1" fill="#fff"/><rect x="5" y="2" width="3" height="10" rx="1" fill="#fff"/><rect x="10" y="0" width="3" height="12" rx="1" fill="#fff"/><rect x="15" y="0" width="3" height="12" rx="1" fill="#fff" opacity="0.3"/></svg>
          <svg width="52" height="24" viewBox="0 0 27 13"><rect x="0" y="0" width="23" height="13" rx="3.5" stroke="#fff" stroke-width="1" fill="none"/><rect x="2" y="2" width="18" height="9" rx="2" fill="#fff"/></svg>
        </div>
      </div>
      <!-- Lock icon -->
      <div style="text-align:center;margin-top:100px;">
        <svg width="48" height="56" viewBox="0 0 28 34" fill="none" style="margin:0 auto;">
          <rect x="2" y="14" width="24" height="18" rx="4" fill="rgba(255,255,255,0.3)"/>
          <path d="M8 14V10C8 6.69 10.69 4 14 4C17.31 4 20 6.69 20 10V14" stroke="rgba(255,255,255,0.3)" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
      </div>
      <!-- Time -->
      <p style="font-family:${SF};font-size:160px;font-weight:200;color:#fff;text-align:center;margin:30px 0 0;letter-spacing:-3px;">9:41</p>
      <!-- Date -->
      <p style="font-family:${SF};font-size:38px;font-weight:400;color:rgba(255,255,255,0.6);text-align:center;margin:8px 0 0;">Wednesday, March 12</p>
    </div>
  </div>

  <!-- ===== CALL SCREEN ===== -->
  <div style="position:absolute;inset:0;z-index:10;
    animation:callScreenIn ${TOTAL_DURATION}s linear forwards;opacity:0;">

    <!-- Status bar -->
    <div style="padding:60px 40px 0;display:flex;justify-content:space-between;align-items:center;position:relative;z-index:20;">
      <span style="font-family:${SF};font-size:34px;font-weight:600;color:#fff;">9:41</span>
      <div style="display:flex;align-items:center;gap:10px;">
        <svg width="36" height="24" viewBox="0 0 18 12"><rect x="0" y="3" width="3" height="9" rx="1" fill="#fff"/><rect x="5" y="2" width="3" height="10" rx="1" fill="#fff"/><rect x="10" y="0" width="3" height="12" rx="1" fill="#fff"/><rect x="15" y="0" width="3" height="12" rx="1" fill="#fff" opacity="0.3"/></svg>
        <svg width="52" height="24" viewBox="0 0 27 13"><rect x="0" y="0" width="23" height="13" rx="3.5" stroke="#fff" stroke-width="1" fill="none"/><rect x="2" y="2" width="18" height="9" rx="2" fill="#fff"/></svg>
      </div>
    </div>

    <!-- Caller photo -->
    <div style="position:absolute;z-index:15;overflow:hidden;
      width:260px;height:260px;border-radius:130px;
      top:260px;left:${(WIDTH - 260) / 2}px;
      border:3px solid rgba(255,255,255,0.15);
      animation:callerPhotoShrink ${TOTAL_DURATION}s linear forwards,
               ringPulse 2s ease-in-out 1.5s 2;">
      <img src="${imageDataMap[CALLER_PHOTO]}" style="width:100%;height:100%;object-fit:cover;object-position:center 20%;display:block;"/>
    </div>

    <!-- Caller name -->
    <div style="position:absolute;z-index:15;
      top:550px;left:0;right:0;text-align:center;
      animation:nameMove ${TOTAL_DURATION}s linear forwards;">
      <p style="font-family:${SF};font-weight:600;color:#fff;margin:0;font-size:inherit;">Manila Photo Shoot</p>
    </div>

    <!-- "incoming call..." -->
    <p style="position:absolute;top:630px;left:0;right:0;text-align:center;z-index:15;
      font-family:${SF};font-size:34px;font-weight:400;color:rgba(255,255,255,0.55);
      animation:incomingText ${TOTAL_DURATION}s linear forwards;">incoming call...</p>

    <!-- Connected timer -->
    <div style="position:absolute;top:148px;left:160px;z-index:15;
      opacity:0;animation:connectedText ${TOTAL_DURATION}s linear forwards;">
      <p id="callTimer" style="font-family:${SF};font-size:30px;font-weight:400;color:rgba(52,199,89,0.9);margin:0;">0:00</p>
    </div>

    <!-- Accept / Decline -->
    <div style="position:absolute;bottom:${SAFE_BOTTOM + 180}px;left:0;right:0;display:flex;justify-content:center;gap:200px;z-index:20;">
      <!-- Decline -->
      <div style="text-align:center;animation:declineBtn ${TOTAL_DURATION}s linear forwards;">
        <div style="width:110px;height:110px;border-radius:55px;background:rgba(255,59,48,0.25);
          display:flex;align-items:center;justify-content:center;">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.18-.29-.43-.29-.71 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.1-.7-.28-.79-.73-1.68-1.36-2.66-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z" fill="#FF3B30"/>
          </svg>
        </div>
        <p style="font-family:${SF};font-size:26px;color:rgba(255,255,255,0.55);margin:14px 0 0;">Decline</p>
      </div>
      <!-- Accept -->
      <div style="text-align:center;">
        <div style="width:110px;height:110px;border-radius:55px;
          display:flex;align-items:center;justify-content:center;
          animation:acceptPress ${TOTAL_DURATION}s linear forwards;background:rgba(52,199,89,0.25);">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z" fill="${GREEN}"/>
          </svg>
        </div>
        <p style="font-family:${SF};font-size:26px;color:rgba(255,255,255,0.55);margin:14px 0 0;
          animation:declineBtn ${TOTAL_DURATION}s linear forwards;">Accept</p>
      </div>
    </div>

    <!-- Call actions (after connect) -->
    <div style="position:absolute;bottom:${SAFE_BOTTOM + 60}px;left:0;right:0;z-index:20;
      opacity:0;animation:callActionsIn ${TOTAL_DURATION}s linear forwards;">
      <div style="display:flex;justify-content:center;gap:44px;">
        ${['mute', 'keypad', 'speaker', 'end'].map(action => {
          const bg = action === 'end' ? '#FF3B30' : 'rgba(255,255,255,0.12)'
          const size = action === 'end' ? 100 : 82
          const iconSize = action === 'end' ? 42 : 36
          const iconColor = action === 'end' ? '#fff' : 'rgba(255,255,255,0.75)'
          const icons = {
            mute: `<path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" fill="${iconColor}"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" fill="${iconColor}"/>`,
            keypad: `<circle cx="8" cy="6" r="1.5" fill="${iconColor}"/><circle cx="12" cy="6" r="1.5" fill="${iconColor}"/><circle cx="16" cy="6" r="1.5" fill="${iconColor}"/><circle cx="8" cy="10" r="1.5" fill="${iconColor}"/><circle cx="12" cy="10" r="1.5" fill="${iconColor}"/><circle cx="16" cy="10" r="1.5" fill="${iconColor}"/><circle cx="8" cy="14" r="1.5" fill="${iconColor}"/><circle cx="12" cy="14" r="1.5" fill="${iconColor}"/><circle cx="16" cy="14" r="1.5" fill="${iconColor}"/><circle cx="12" cy="18" r="1.5" fill="${iconColor}"/>`,
            speaker: `<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" fill="${iconColor}"/>`,
            end: `<path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.18-.29-.43-.29-.71 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.1-.7-.28-.79-.73-1.68-1.36-2.66-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z" fill="#fff"/>`,
          }
          return `<div style="text-align:center;">
            <div style="width:${size}px;height:${size}px;border-radius:${size / 2}px;background:${bg};
              display:flex;align-items:center;justify-content:center;">
              <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none">${icons[action]}</svg>
            </div>
            <p style="font-family:${SF};font-size:22px;color:rgba(255,255,255,0.45);margin:10px 0 0;text-transform:capitalize;">${action}</p>
          </div>`
        }).join('')}
      </div>
    </div>

    <!-- MESSAGE BUBBLES -->
    ${messageHTML}

    <!-- PHOTO GALLERY -->
    ${photoHTML}

    <!-- CTA — natural ending -->
    <div style="position:absolute;left:0;right:0;top:340px;text-align:center;z-index:25;
      opacity:0;animation:ctaIn ${TOTAL_DURATION}s linear forwards;">

      <p style="font-family:${SF};font-size:160px;font-weight:900;letter-spacing:0.1em;color:#fff;margin:0;
        text-shadow:0 4px 60px rgba(232,68,58,0.3), 0 2px 20px rgba(0,0,0,0.8);">MANILA</p>

      <p style="font-family:${SF};font-size:44px;font-weight:300;color:rgba(255,255,255,0.85);margin:6px 0 0;letter-spacing:0.3em;">PHOTO SHOOT</p>

      <p style="font-family:${SF};font-size:72px;font-weight:800;color:#fff;margin:50px 0 0;">Sign up below.</p>

      <p style="font-family:${SF};font-size:36px;font-weight:400;color:rgba(255,255,255,0.65);margin:18px 0 0;">It takes just a minute.</p>

      <div style="display:inline-flex;align-items:center;gap:14px;padding:18px 36px;border-radius:16px;
        background:rgba(232,68,58,0.15);border:1px solid rgba(232,68,58,0.4);margin:40px 0 0;">
        <div style="width:12px;height:12px;border-radius:50%;background:${MANILA_COLOR};"></div>
        <span style="font-family:${SF};font-size:30px;font-weight:600;color:rgba(255,255,255,0.85);">Limited spots this month</span>
      </div>

      <p style="font-family:${SF};font-size:28px;font-weight:500;color:rgba(255,255,255,0.3);margin:30px 0 0;">@${HANDLE}</p>
    </div>

  </div>

</div>

<script>
  const timerEl = document.getElementById('callTimer');
  let timerSeconds = 0;
  setTimeout(() => {
    setInterval(() => {
      timerSeconds++;
      const m = Math.floor(timerSeconds / 60);
      const s = String(timerSeconds % 60).padStart(2, '0');
      if (timerEl) timerEl.textContent = m + ':' + s;
    }, 1000);
  }, 5000);
</script>
</body>
</html>`
}

async function render() {
  resetOutputDir()

  writeSources({
    createdAt: new Date().toISOString(),
    strategy: 'v67 — iPhone incoming call animation (bigger UI, clean photos)',
    safeBottomPixels: SAFE_BOTTOM,
    photos: PHOTOS.map(p => p.file),
    callerPhoto: CALLER_PHOTO,
    messages: MESSAGES.map(m => m.text),
  })

  const imageDataMap = {}
  for (const photo of PHOTOS) {
    imageDataMap[photo.file] = readImage(photo.file)
  }
  imageDataMap[CALLER_PHOTO] = readImage(CALLER_PHOTO)

  const { execSync } = await import('child_process')
  const browser = await chromium.launch()

  console.log('Recording iPhone call animation...')
  console.log(`  ${TOTAL_DURATION}s total, ${MESSAGES.length} messages, ${PHOTOS.length} photos`)

  const videoCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: OUT_DIR,
      size: { width: WIDTH, height: HEIGHT },
    },
  })

  const videoPage = await videoCtx.newPage()
  await videoPage.evaluate(() => { document.documentElement.style.background = '#000'; document.body.style.background = '#000'; })
  await videoPage.setContent(buildCallAnimation(imageDataMap), { waitUntil: 'load' })
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
  const finalMp4 = path.join(OUT_DIR, '01_iphone_call.mp4')

  try {
    execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${finalMp4}"`, { stdio: 'pipe' })
    fs.unlinkSync(srcVideo)
    console.log('Rendered 01_iphone_call.mp4')
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
