import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v68d')

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 410

const SF = "-apple-system, 'Helvetica Neue', Arial, sans-serif"
const MANILA_COLOR = '#E8443A'
const IG_BG = '#000'
const IG_HEADER_BG = '#000'
const IG_BUBBLE_SENT = '#3797f0'   // IG blue for sent messages
const IG_BUBBLE_RECV = '#262626'   // IG dark gray for received
const IG_ERROR = '#ff3b30'

const TOTAL_DURATION = 32
const TOTAL_DURATION_MS = 34000

const PHOTOS = [
  'manila-gallery-dsc-0190.jpg',
  'manila-gallery-night-001.jpg',
  'manila-gallery-garden-001.jpg',
  'manila-gallery-urban-001.jpg',
  'manila-gallery-dsc-0075.jpg',
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

function buildHTML(imageDataMap) {
  // Timeline — IG DMs are broken, messages fail, then a creative pivot
  const T = {
    // Phase 1: User tries to DM, messages fail
    msg1Send: 0.8,        // "yo can I book a photo shoot??"
    msg1Fail: 2.0,        // red ! error
    msg2Send: 3.0,        // "hello?? why isn't this sending"
    msg2Fail: 3.8,        // red ! error
    msg3Send: 4.8,        // "Instagram fix your app 😤"
    msg3Fail: 5.6,        // red ! error
    errorBanner: 6.2,     // IG error banner slides in

    // Phase 2: Glitch effect + transition
    glitch1: 7.5,
    glitch2: 8.0,
    glitch3: 8.5,

    // Phase 3: Screen "fixes" — reveals photographer's DM thread
    screenFix: 9.5,       // screen comes back
    recvMsg1: 10.5,       // "lol DMs just came back 😅"
    recvMsg2: 11.5,       // "but yes!! I'm doing free shoots in Manila"
    recvMsg3: 12.8,       // "no catch — I just need portfolio content"
    photo1: 14.0,
    photo2: 15.5,
    photo3: 17.0,
    recvMsg4: 18.5,       // "you literally just show up and I handle everything"
    recvMsg5: 20.0,       // "down?"
    ctaMsg: 21.5,         // "dm me if interested!!"
    ctaHandle: 22.5,      // @madebyaidan
    whatsappMsg: 24.5,    // funny WhatsApp joke
    // Hold until 32s
  }

  return `<!DOCTYPE html>
<html>
<head>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { margin: 0; padding: 0; background: ${IG_BG}; -webkit-font-smoothing: antialiased; }

  @keyframes msgIn {
    0% { opacity: 0; transform: translateY(14px); }
    100% { opacity: 1; transform: translateY(0); }
  }

  @keyframes failShake {
    0% { transform: translateX(0); }
    15% { transform: translateX(-8px); }
    30% { transform: translateX(8px); }
    45% { transform: translateX(-6px); }
    60% { transform: translateX(6px); }
    75% { transform: translateX(-3px); }
    90% { transform: translateX(3px); }
    100% { transform: translateX(0); }
  }

  @keyframes errorDotPop {
    0% { opacity: 0; transform: scale(0); }
    60% { opacity: 1; transform: scale(1.3); }
    100% { opacity: 1; transform: scale(1); }
  }

  @keyframes bannerSlide {
    0% { transform: translateY(-100%); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }

  @keyframes glitchFlicker {
    0% { opacity: 1; }
    10% { opacity: 0; }
    12% { opacity: 1; }
    20% { opacity: 0; transform: translateX(20px); }
    22% { opacity: 1; transform: translateX(0); }
    40% { opacity: 0; transform: translateX(-15px) skewX(5deg); }
    42% { opacity: 1; transform: translateX(0) skewX(0); }
    60% { opacity: 0; }
    65% { opacity: 1; }
    80% { opacity: 0; transform: translateY(10px); }
    85% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; }
  }

  @keyframes screenBlackout {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }

  @keyframes screenRestore {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }

  @keyframes photoIn {
    0% { opacity: 0; transform: scale(0.85); }
    100% { opacity: 1; transform: scale(1); }
  }

  @keyframes typingDot {
    0%, 60%, 100% { opacity: 0.3; transform: scale(1); }
    30% { opacity: 1; transform: scale(1.4); }
  }

  @keyframes pulseGlow {
    0%, 100% { box-shadow: 0 0 0 0 rgba(55, 151, 240, 0.4); }
    50% { box-shadow: 0 0 0 12px rgba(55, 151, 240, 0); }
  }

  .page {
    width: ${WIDTH}px;
    height: ${HEIGHT}px;
    position: relative;
    overflow: hidden;
    background: #000;
    font-family: ${SF};
  }

  /* Editorial header */
  .editorial-header {
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 200px;
    z-index: 60;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #000;
  }
  .editorial-rule {
    width: 80%;
    height: 1px;
    background: rgba(255,255,255,0.3);
    margin-bottom: 20px;
  }
  .editorial-title {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 72px;
    font-weight: 700;
    font-style: italic;
    letter-spacing: 6px;
    text-transform: uppercase;
    color: #fff;
    text-align: center;
    margin: 0;
  }
  .editorial-subtitle {
    font-family: ${SF};
    font-size: 22px;
    font-weight: 500;
    letter-spacing: 8px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.5);
    margin-top: 10px;
  }
  .editorial-rule-bottom {
    width: 80%;
    height: 1px;
    background: rgba(255,255,255,0.3);
    margin-top: 20px;
  }

  /* Phone frame */
  .phone-frame {
    position: absolute;
    top: 200px;
    left: 30px;
    right: 30px;
    bottom: 0;
    border-radius: 24px 24px 0 0;
    overflow: hidden;
    z-index: 5;
    border: 2px solid rgba(255,255,255,0.1);
    border-bottom: none;
    background: ${IG_BG};
  }

  /* IG DM Header */
  .dm-header {
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 130px;
    background: ${IG_HEADER_BG};
    border-bottom: 1px solid #222;
    display: flex;
    align-items: flex-end;
    padding: 0 24px 16px;
    z-index: 30;
  }

  .dm-header-back {
    font-size: 36px;
    color: #fff;
    margin-right: 16px;
  }

  .dm-header-avatar {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    overflow: hidden;
    margin-right: 14px;
    border: 2px solid #444;
  }

  .dm-header-avatar img {
    width: 100%; height: 100%;
    object-fit: cover;
  }

  .dm-header-info {
    flex: 1;
  }

  .dm-header-name {
    font-size: 40px;
    font-weight: 700;
    color: #fff;
  }

  .dm-header-status {
    font-size: 22px;
    color: #8e8e8e;
    margin-top: 2px;
  }

  .dm-header-icons {
    display: flex;
    gap: 24px;
  }

  /* Chat area */
  .chat-area {
    position: absolute;
    top: 130px;
    left: 0; right: 0;
    bottom: ${SAFE_BOTTOM}px;
    overflow: hidden;
  }

  .chat-scroll {
    padding: 20px 16px 400px;
  }

  /* Message bubbles */
  .msg-row {
    display: flex;
    margin-bottom: 8px;
    opacity: 0;
  }

  .msg-row.sent {
    justify-content: flex-end;
    padding-right: 8px;
  }

  .msg-row.recv {
    justify-content: flex-start;
    padding-left: 8px;
  }

  .bubble {
    max-width: 72%;
    padding: 18px 24px;
    border-radius: 22px;
    position: relative;
  }

  .bubble.sent {
    background: ${IG_BUBBLE_SENT};
    border-bottom-right-radius: 6px;
  }

  .bubble.recv {
    background: ${IG_BUBBLE_RECV};
    border-bottom-left-radius: 6px;
  }

  .bubble p {
    font-size: 44px;
    color: #fff;
    line-height: 1.4;
    margin: 0;
  }

  /* Error indicator */
  .error-dot {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: ${IG_ERROR};
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 10px;
    align-self: center;
    opacity: 0;
    flex-shrink: 0;
  }

  .error-dot span {
    font-size: 20px;
    font-weight: 800;
    color: #fff;
  }

  .error-text {
    font-size: 22px;
    color: ${IG_ERROR};
    margin-top: 4px;
    text-align: right;
    padding-right: 48px;
    opacity: 0;
  }

  /* Error banner */
  .error-banner {
    position: absolute;
    top: 130px;
    left: 0; right: 0;
    background: ${IG_ERROR};
    padding: 16px 24px;
    z-index: 25;
    transform: translateY(-100%);
    opacity: 0;
  }

  .error-banner p {
    font-size: 36px;
    font-weight: 600;
    color: #fff;
    text-align: center;
  }

  /* Glitch overlay */
  .glitch-overlay {
    position: absolute;
    inset: 0;
    z-index: 50;
    pointer-events: none;
    opacity: 0;
  }

  .glitch-bar {
    position: absolute;
    left: 0; right: 0;
    height: 4px;
    background: rgba(255,0,0,0.3);
  }

  /* Phase 2 blackout */
  .blackout {
    position: absolute;
    inset: 0;
    background: #000;
    z-index: 40;
    opacity: 0;
  }

  /* Phase 3: New DM thread */
  .phase3 {
    position: absolute;
    inset: 0;
    z-index: 35;
    opacity: 0;
    background: ${IG_BG};
  }

  .phase3-header {
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 130px;
    background: ${IG_HEADER_BG};
    border-bottom: 1px solid #222;
    display: flex;
    align-items: flex-end;
    padding: 0 24px 16px;
  }

  .phase3-chat {
    position: absolute;
    top: 130px;
    left: 0; right: 0;
    bottom: ${SAFE_BOTTOM}px;
    overflow: hidden;
  }

  .phase3-scroll {
    padding: 20px 16px 400px;
  }

  /* Photo message */
  .photo-bubble {
    width: 480px;
    border-radius: 22px;
    overflow: hidden;
    border-bottom-left-radius: 6px;
  }

  .photo-bubble img {
    width: 100%;
    display: block;
  }

  /* CTA highlight message */
  .cta-bubble {
    background: ${MANILA_COLOR};
    border-bottom-left-radius: 6px;
  }

  .cta-bubble p {
    font-weight: 700;
    font-size: 48px;
  }

  /* Typing indicator */
  .typing-indicator {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 18px 24px;
    background: ${IG_BUBBLE_RECV};
    border-radius: 22px;
    border-bottom-left-radius: 6px;
    width: fit-content;
  }

  .typing-dot {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #888;
  }
</style>
</head>
<body>
  <div class="page">

    <!-- Editorial header: MANILA FREE PHOTO SHOOT -->
    <div class="editorial-header">
      <div class="editorial-rule"></div>
      <h1 class="editorial-title"><span style="color:${MANILA_COLOR};">Manila</span> Free</h1>
      <p class="editorial-subtitle">Photo Shoot</p>
      <div class="editorial-rule-bottom"></div>
    </div>

    <!-- Phone frame -->
    <div class="phone-frame">

    <!-- ===== PHASE 1: Failed DMs ===== -->
    <div id="phase1" style="position:absolute;inset:0;z-index:10;">

      <!-- IG DM Header -->
      <div class="dm-header">
        <div class="dm-header-back">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </div>
        <div class="dm-header-avatar">
          <img src="${imageDataMap[PHOTOS[4]]}" alt="avatar" />
        </div>
        <div class="dm-header-info">
          <div class="dm-header-name">madebyaidan</div>
          <div class="dm-header-status">Active now</div>
        </div>
        <div class="dm-header-icons">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
        </div>
      </div>

      <div class="chat-area">
        <div class="chat-scroll" id="phase1Chat">

          <!-- Message 1: sent + fails -->
          <div class="msg-row sent" id="msg1" style="animation: msgIn 0.35s ease-out ${T.msg1Send}s forwards;">
            <div style="display:flex;align-items:center;">
              <div class="bubble sent" id="msg1Bubble">
                <p>hey can I book a photo shoot??</p>
              </div>
              <div class="error-dot" id="err1" style="animation: errorDotPop 0.4s ease-out ${T.msg1Fail}s forwards;">
                <span>!</span>
              </div>
            </div>
          </div>
          <div class="error-text" id="errText1" style="animation: msgIn 0.3s ease-out ${T.msg1Fail + 0.2}s forwards;">
            Failed to send
          </div>

          <!-- Message 2: sent + fails -->
          <div class="msg-row sent" id="msg2" style="animation: msgIn 0.35s ease-out ${T.msg2Send}s forwards;">
            <div style="display:flex;align-items:center;">
              <div class="bubble sent" id="msg2Bubble">
                <p>hello?? why isn't this sending</p>
              </div>
              <div class="error-dot" id="err2" style="animation: errorDotPop 0.4s ease-out ${T.msg2Fail}s forwards;">
                <span>!</span>
              </div>
            </div>
          </div>
          <div class="error-text" id="errText2" style="animation: msgIn 0.3s ease-out ${T.msg2Fail + 0.2}s forwards;">
            Failed to send
          </div>

          <!-- Message 3: sent + fails -->
          <div class="msg-row sent" id="msg3" style="animation: msgIn 0.35s ease-out ${T.msg3Send}s forwards;">
            <div style="display:flex;align-items:center;">
              <div class="bubble sent" id="msg3Bubble">
                <p>Instagram fix your app \u{1F624}</p>
              </div>
              <div class="error-dot" id="err3" style="animation: errorDotPop 0.4s ease-out ${T.msg3Fail}s forwards;">
                <span>!</span>
              </div>
            </div>
          </div>
          <div class="error-text" id="errText3" style="animation: msgIn 0.3s ease-out ${T.msg3Fail + 0.2}s forwards;">
            Failed to send
          </div>

        </div>
      </div>

      <!-- Error banner -->
      <div class="error-banner" id="errorBanner" style="animation: bannerSlide 0.5s ease-out ${T.errorBanner}s forwards;">
        <p>\u26A0\uFE0F Instagram is experiencing issues. Messages may not be delivered.</p>
      </div>
    </div>

    <!-- ===== BLACKOUT (clean transition) ===== -->
    <div class="blackout" id="blackout"></div>

    <!-- ===== PHASE 3: DMs are back — photographer's thread ===== -->
    <div class="phase3" id="phase3">
      <div class="phase3-header">
        <div class="dm-header-back">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </div>
        <div class="dm-header-avatar">
          <img src="${imageDataMap[PHOTOS[4]]}" alt="avatar" />
        </div>
        <div class="dm-header-info">
          <div class="dm-header-name">madebyaidan</div>
          <div class="dm-header-status" style="color:#1ED760;">Active now</div>
        </div>
        <div class="dm-header-icons">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
        </div>
      </div>

      <div class="phase3-chat">
        <div class="phase3-scroll" id="phase3Chat">

          <!-- Received: lol DMs just came back -->
          <div class="msg-row recv" id="recv1" style="opacity:0;">
            <div class="bubble recv">
              <p>lol DMs just came back \u{1F605}</p>
            </div>
          </div>

          <!-- Received: but yes!! free shoots -->
          <div class="msg-row recv" id="recv2" style="opacity:0;">
            <div class="bubble recv">
              <p>but yes!! I'm doing free shoots in Manila</p>
            </div>
          </div>

          <!-- Received: no catch -->
          <div class="msg-row recv" id="recv3" style="opacity:0;">
            <div class="bubble recv">
              <p>no catch \u2014 I just need portfolio content</p>
            </div>
          </div>

          <!-- Photo messages -->
          <div class="msg-row recv" id="photo1" style="opacity:0;padding-left:8px;">
            <div class="photo-bubble">
              <img src="${imageDataMap[PHOTOS[0]]}" />
            </div>
          </div>

          <div class="msg-row recv" id="photo2" style="opacity:0;padding-left:8px;">
            <div class="photo-bubble">
              <img src="${imageDataMap[PHOTOS[1]]}" />
            </div>
          </div>

          <div class="msg-row recv" id="photo3" style="opacity:0;padding-left:8px;">
            <div class="photo-bubble">
              <img src="${imageDataMap[PHOTOS[2]]}" />
            </div>
          </div>

          <!-- Received: you literally just show up -->
          <div class="msg-row recv" id="recv4" style="opacity:0;">
            <div class="bubble recv">
              <p>you literally just show up and I handle everything</p>
            </div>
          </div>

          <!-- Received: down? -->
          <div class="msg-row recv" id="recv5" style="opacity:0;">
            <div class="bubble recv">
              <p>down?</p>
            </div>
          </div>

          <!-- CTA message -->
          <div class="msg-row recv" id="ctaMsg" style="opacity:0;">
            <div class="bubble cta-bubble">
              <p>dm me if interested!!</p>
            </div>
          </div>

          <!-- Handle -->
          <div class="msg-row recv" id="ctaHandle" style="opacity:0;">
            <div style="padding:8px 0 0 4px;">
              <p style="font-size:38px;color:rgba(255,255,255,0.5);margin:0;">@madebyaidan on Instagram</p>
            </div>
          </div>

          <!-- WhatsApp joke -->
          <div class="msg-row recv" id="whatsappMsg" style="opacity:0;">
            <div class="bubble recv" style="margin-top:16px;">
              <p style="font-size:38px;">or just WhatsApp me, it's never broken 😅</p>
            </div>
          </div>

        </div>
      </div>
    </div>

    </div><!-- /phone-frame -->

  </div>

  <script>
    // Phase 1: shake bubbles on fail
    function shakeEl(id, delay) {
      setTimeout(() => {
        const el = document.getElementById(id)
        if (el) {
          el.style.animation = 'failShake 0.5s ease-out'
        }
      }, delay)
    }
    shakeEl('msg1Bubble', ${T.msg1Fail * 1000})
    shakeEl('msg2Bubble', ${T.msg2Fail * 1000})
    shakeEl('msg3Bubble', ${T.msg3Fail * 1000})

    // Phase 2: Clean transition — fade out phase 1, fade in phase 3
    const blackout = document.getElementById('blackout')
    const phase1 = document.getElementById('phase1')
    const phase3 = document.getElementById('phase3')

    // Fade to black
    setTimeout(() => {
      blackout.style.transition = 'opacity 0.5s ease-out'
      blackout.style.opacity = '1'
    }, ${T.glitch1 * 1000})

    // Hide phase 1, show phase 3
    setTimeout(() => {
      phase1.style.display = 'none'
      phase3.style.opacity = '1'
      blackout.style.transition = 'opacity 0.5s ease-out'
      blackout.style.opacity = '0'
    }, ${T.screenFix * 1000})

    // Phase 3 messages appear one by one
    const phase3Messages = [
      { id: 'recv1', t: ${T.recvMsg1 * 1000} },
      { id: 'recv2', t: ${T.recvMsg2 * 1000} },
      { id: 'recv3', t: ${T.recvMsg3 * 1000} },
      { id: 'photo1', t: ${T.photo1 * 1000} },
      { id: 'photo2', t: ${T.photo2 * 1000} },
      { id: 'photo3', t: ${T.photo3 * 1000} },
      { id: 'recv4', t: ${T.recvMsg4 * 1000} },
      { id: 'recv5', t: ${T.recvMsg5 * 1000} },
      { id: 'ctaMsg', t: ${T.ctaMsg * 1000} },
      { id: 'ctaHandle', t: ${T.ctaHandle * 1000} },
      { id: 'whatsappMsg', t: ${T.whatsappMsg * 1000} },
    ]

    const scrollEl = document.getElementById('phase3Chat')
    let scrollTarget = 0

    phase3Messages.forEach(({ id, t }, i) => {
      setTimeout(() => {
        const el = document.getElementById(id)
        if (el) {
          el.style.animation = id.startsWith('photo')
            ? 'photoIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards'
            : 'msgIn 0.35s ease-out forwards'
        }

        // Auto-scroll as messages come in
        if (i >= 3) {  // Start scrolling after photo1
          scrollTarget += (id.startsWith('photo') ? 500 : 80)
          if (scrollEl) {
            scrollEl.style.transition = 'transform 0.5s ease-out'
            scrollEl.style.transform = 'translateY(-' + scrollTarget + 'px)'
          }
        }
      }, t)
    })

    // Pulse the CTA bubble
    setTimeout(() => {
      const cta = document.querySelector('.cta-bubble')
      if (cta) {
        cta.style.animation = 'pulseGlow 2s ease-in-out infinite'
      }
    }, ${(T.ctaMsg + 0.8) * 1000})
  </script>
</body>
</html>`
}

async function render() {
  resetOutputDir()

  const imageDataMap = {}
  for (const photo of PHOTOS) {
    imageDataMap[photo] = readImage(photo)
  }

  writeSources({
    createdAt: new Date().toISOString(),
    strategy: 'v68d — IG DMs broken, with WhatsApp joke at end',
    safeBottomPixels: SAFE_BOTTOM,
    photos: PHOTOS,
  })

  const { execSync } = await import('child_process')
  const browser = await chromium.launch()

  console.log('Recording IG DMs broken animation (v68d)...')

  const videoCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: OUT_DIR,
      size: { width: WIDTH, height: HEIGHT },
    },
  })

  const videoPage = await videoCtx.newPage()

  await videoPage.evaluate(() => {
    document.documentElement.style.background = '#000'
    document.body.style.background = '#000'
  })

  const html = buildHTML(imageDataMap)
  await videoPage.setContent(html, { waitUntil: 'load' })
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
  const finalMp4 = path.join(OUT_DIR, '01_ig_dms_broken_whatsapp.mp4')

  try {
    execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${finalMp4}"`, { stdio: 'pipe' })
    fs.unlinkSync(srcVideo)
    console.log('Rendered 01_ig_dms_broken_whatsapp.mp4')
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
