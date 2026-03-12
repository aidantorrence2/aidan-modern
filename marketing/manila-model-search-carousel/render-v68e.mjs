import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v68e')

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 410

const SF = "-apple-system, 'Helvetica Neue', Arial, sans-serif"
const MANILA_COLOR = '#E8443A'
const IG_BG = '#000'
const IG_BUBBLE_SENT = '#3797f0'
const IG_BUBBLE_RECV = '#262626'

const TOTAL_DURATION = 34
const TOTAL_DURATION_MS = 36000

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
  // 7 "hey" messages that the user sent during network issues
  // First 3 match the 3 failed attempts
  const heyMessages = [
    'hey i want to shoot',
    'hey is the shoot available?',
    'hey is it still free??',
    'hello??',
    'hey can I book a shoot',
    'is anyone there',
    'hey i really want to do this!!',
    'i think ig is down...',
  ]

  // Timeline
  const T = {
    // Phase 1: 3 attempts that all fail
    fail1Send: 0.5,
    fail1Err: 1.5,
    fail2Send: 2.5,
    fail2Err: 3.5,
    fail3Send: 4.5,
    fail3Err: 5.5,

    // Phase 2: Boom — all 8 messages pop in at once
    floodStart: 7.0,     // failed msgs disappear, all 8 flood in
    floodInterval: 0.08, // super rapid stagger

    // Phase 3: madebyaidan responds
    typing1: 8.5,
    recv1: 9.5,        // "oh hey haha 😅"
    recv2: 10.8,       // "yes it's still available!!"
    recv4: 12.0,       // "I'm doing free photo shoots in Manila"
    recv5: 13.5,       // "no catch — I just need portfolio content"

    // Phase 4: Show work
    typing2: 14.5,
    recv6: 15.5,       // "here's what I shot last week:"
    photo1: 16.5,
    photo2: 18.0,
    photo3: 19.5,

    // Phase 5: How it works
    typing3: 21.0,
    recv7: 22.0,       // "you literally just show up"
    recv8: 23.2,       // "I direct everything — poses, angles, all of it"
    recv9: 24.5,       // "then you get your edited photos within a week"

    // Phase 6: User responds + CTA
    sent1: 26.0,       // "ok that's actually perfect"
    sent2: 27.0,       // "how do I book??"
    typing4: 28.0,
    recv10: 29.0,      // "just dm me!"
    ctaHandle: 30.5,   // @madebyaidan on Instagram
    sent3: 32.5,       // "doing it rn 🏃‍♀️"
    // Hold until 36s
  }

  const p = (t) => ((t / TOTAL_DURATION) * 100).toFixed(2)

  // Scroll keyframes — need to scroll down as conversation grows
  const scrollKeyframes = `
    0% { transform: translateY(0); }
    ${p(7)}% { transform: translateY(0); }
    ${p(9)}% { transform: translateY(-200px); }
    ${p(12)}% { transform: translateY(-500px); }
    ${p(15)}% { transform: translateY(-800px); }
    ${p(17)}% { transform: translateY(-1200px); }
    ${p(19)}% { transform: translateY(-1800px); }
    ${p(21)}% { transform: translateY(-2400px); }
    ${p(23)}% { transform: translateY(-2700px); }
    ${p(25)}% { transform: translateY(-3000px); }
    ${p(28)}% { transform: translateY(-3300px); }
    ${p(31)}% { transform: translateY(-3600px); }
    ${p(33)}% { transform: translateY(-3800px); }
    100% { transform: translateY(-3800px); }
  `

  return `<!DOCTYPE html>
<html>
<head>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { margin: 0; padding: 0; background: #000; -webkit-font-smoothing: antialiased; }

  @keyframes msgIn {
    0% { opacity: 0; transform: translateY(14px); }
    100% { opacity: 1; transform: translateY(0); }
  }

  @keyframes photoIn {
    0% { opacity: 0; transform: scale(0.85); }
    100% { opacity: 1; transform: scale(1); }
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

  .error-dot {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: #ff3b30;
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
    color: #ff3b30;
    text-align: right;
    padding-right: 20px;
    margin-bottom: 12px;
    opacity: 0;
  }

  @keyframes typingDot {
    0%, 60%, 100% { opacity: 0.3; transform: scale(1); }
    30% { opacity: 1; transform: scale(1.4); }
  }

  @keyframes pulseGlow {
    0%, 100% { box-shadow: 0 0 0 0 rgba(232, 68, 58, 0.4); }
    50% { box-shadow: 0 0 0 12px rgba(232, 68, 58, 0); }
  }

  @keyframes chatScroll {
    ${scrollKeyframes}
  }

  .chat-scroll {
    animation: chatScroll ${TOTAL_DURATION}s ease-in-out 0s forwards;
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

  /* DM Header */
  .dm-header {
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 130px;
    background: ${IG_BG};
    border-bottom: 1px solid #222;
    display: flex;
    align-items: flex-end;
    padding: 0 24px 16px;
    z-index: 30;
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

  .dm-header-name {
    font-size: 40px;
    font-weight: 700;
    color: #fff;
  }

  .dm-header-status {
    font-size: 22px;
    color: #1ED760;
    margin-top: 2px;
  }

  /* Chat area */
  .chat-area {
    position: absolute;
    top: 130px;
    left: 0; right: 0;
    bottom: 0;
    overflow: hidden;
  }

  /* Message bubbles */
  .msg-row {
    display: flex;
    margin-bottom: 8px;
    opacity: 0;
  }

  .msg-row.sent {
    justify-content: flex-end;
    padding-right: 16px;
  }

  .msg-row.recv {
    justify-content: flex-start;
    padding-left: 16px;
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
    font-size: 42px;
    color: #fff;
    line-height: 1.4;
    margin: 0;
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

  /* CTA highlight */
  .cta-bubble {
    background: ${MANILA_COLOR} !important;
    border-bottom-left-radius: 6px !important;
  }

  .cta-bubble p {
    font-weight: 700;
    font-size: 46px !important;
  }

  /* Typing indicator */
  .typing-row {
    display: flex;
    padding-left: 16px;
    margin-bottom: 8px;
    opacity: 0;
  }

  .typing-indicator {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 18px 24px;
    background: ${IG_BUBBLE_RECV};
    border-radius: 22px;
    border-bottom-left-radius: 6px;
  }

  .typing-dot {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #888;
  }

  .td1 { animation: typingDot 1.2s infinite 0s; }
  .td2 { animation: typingDot 1.2s infinite 0.2s; }
  .td3 { animation: typingDot 1.2s infinite 0.4s; }

  /* "Delivered" / "Seen" status */
  .msg-status {
    text-align: right;
    padding-right: 20px;
    margin-bottom: 12px;
    opacity: 0;
  }

  .msg-status span {
    font-size: 22px;
    color: #8e8e8e;
  }
</style>
</head>
<body>
  <div class="page">

    <!-- Editorial header -->
    <div class="editorial-header">
      <div class="editorial-rule"></div>
      <h1 class="editorial-title"><span style="color:${MANILA_COLOR};">Manila</span> Free</h1>
      <p class="editorial-subtitle">Photo Shoot</p>
      <div class="editorial-rule-bottom"></div>
    </div>

    <!-- Phone frame -->
    <div class="phone-frame">

      <!-- DM Header -->
      <div class="dm-header">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" style="margin-right:16px;"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        <div class="dm-header-avatar">
          <img src="${imageDataMap[PHOTOS[4]]}" alt="avatar" />
        </div>
        <div style="flex:1;margin-left:4px;">
          <div class="dm-header-name">madebyaidan</div>
          <div class="dm-header-status">Active now</div>
        </div>
        <div style="display:flex;gap:24px;">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
        </div>
      </div>

      <!-- Top gradient fade -->
      <div style="position:absolute;left:0;right:0;top:130px;height:40px;background:linear-gradient(180deg,${IG_BG},transparent);z-index:15;pointer-events:none;"></div>

      <div class="chat-area">
        <div class="chat-scroll" style="padding:40px 0 600px;">

          <!-- 3 messages that fail one by one (match first 3 of flood) -->
          <div class="msg-row sent" id="fail1" style="opacity:0;">
            <div style="display:flex;align-items:center;">
              <div class="bubble sent" id="fail1Bubble">
                <p>hey i want to shoot</p>
              </div>
              <div class="error-dot" id="err1"><span>!</span></div>
            </div>
          </div>
          <div class="error-text" id="errText1">Failed to send</div>

          <div class="msg-row sent" id="fail2" style="opacity:0;">
            <div style="display:flex;align-items:center;">
              <div class="bubble sent" id="fail2Bubble">
                <p>hey is the shoot available?</p>
              </div>
              <div class="error-dot" id="err2"><span>!</span></div>
            </div>
          </div>
          <div class="error-text" id="errText2">Failed to send</div>

          <div class="msg-row sent" id="fail3" style="opacity:0;">
            <div style="display:flex;align-items:center;">
              <div class="bubble sent" id="fail3Bubble">
                <p>hey is it still free??</p>
              </div>
              <div class="error-dot" id="err3"><span>!</span></div>
            </div>
          </div>
          <div class="error-text" id="errText3">Failed to send</div>

          <!-- All 8 "hey" messages that flood in after the fail -->
          ${heyMessages.map((msg, i) => `
          <div class="msg-row sent" id="hey${i}" style="opacity:0;">
            <div class="bubble sent">
              <p>${msg}</p>
            </div>
          </div>
          `).join('')}

          <!-- Delivered status after flood -->
          <div class="msg-status" id="deliveredStatus" style="opacity:0;">
            <span>Delivered</span>
          </div>

          <!-- Typing indicator -->
          <div class="typing-row" id="typing1" style="opacity:0;">
            <div class="typing-indicator">
              <div class="typing-dot td1"></div>
              <div class="typing-dot td2"></div>
              <div class="typing-dot td3"></div>
            </div>
          </div>

          <!-- madebyaidan responds -->
          <div class="msg-row recv" id="recv1" style="opacity:0;">
            <div class="bubble recv">
              <p>oh hey haha \u{1F605}</p>
            </div>
          </div>

          <div class="msg-row recv" id="recv2" style="opacity:0;">
            <div class="bubble recv">
              <p>yes it's still available!!</p>
            </div>
          </div>

          <div class="msg-row recv" id="recv4" style="opacity:0;">
            <div class="bubble recv">
              <p>I'm doing free photo shoots in Manila</p>
            </div>
          </div>

          <div class="msg-row recv" id="recv5" style="opacity:0;">
            <div class="bubble recv">
              <p>no catch \u2014 I just need portfolio content</p>
            </div>
          </div>

          <!-- Typing indicator 2 -->
          <div class="typing-row" id="typing2" style="opacity:0;">
            <div class="typing-indicator">
              <div class="typing-dot td1"></div>
              <div class="typing-dot td2"></div>
              <div class="typing-dot td3"></div>
            </div>
          </div>

          <!-- Show work -->
          <div class="msg-row recv" id="recv6" style="opacity:0;">
            <div class="bubble recv">
              <p>here's what I shot last week:</p>
            </div>
          </div>

          <div class="msg-row recv" id="photo1" style="opacity:0;padding-left:16px;">
            <div class="photo-bubble">
              <img src="${imageDataMap[PHOTOS[0]]}" />
            </div>
          </div>

          <div class="msg-row recv" id="photo2" style="opacity:0;padding-left:16px;">
            <div class="photo-bubble">
              <img src="${imageDataMap[PHOTOS[1]]}" />
            </div>
          </div>

          <div class="msg-row recv" id="photo3" style="opacity:0;padding-left:16px;">
            <div class="photo-bubble">
              <img src="${imageDataMap[PHOTOS[2]]}" />
            </div>
          </div>

          <!-- Typing indicator 3 -->
          <div class="typing-row" id="typing3" style="opacity:0;">
            <div class="typing-indicator">
              <div class="typing-dot td1"></div>
              <div class="typing-dot td2"></div>
              <div class="typing-dot td3"></div>
            </div>
          </div>

          <!-- How it works -->
          <div class="msg-row recv" id="recv7" style="opacity:0;">
            <div class="bubble recv">
              <p>you literally just show up</p>
            </div>
          </div>

          <div class="msg-row recv" id="recv8" style="opacity:0;">
            <div class="bubble recv">
              <p>I direct everything \u2014 poses, angles, all of it</p>
            </div>
          </div>

          <div class="msg-row recv" id="recv9" style="opacity:0;">
            <div class="bubble recv">
              <p>then you get your edited photos within a week</p>
            </div>
          </div>

          <!-- User responds -->
          <div class="msg-row sent" id="sent1" style="opacity:0;">
            <div class="bubble sent">
              <p>ok that's actually perfect</p>
            </div>
          </div>

          <div class="msg-row sent" id="sent2" style="opacity:0;">
            <div class="bubble sent">
              <p>how do I book??</p>
            </div>
          </div>

          <!-- Typing indicator 4 -->
          <div class="typing-row" id="typing4" style="opacity:0;">
            <div class="typing-indicator">
              <div class="typing-dot td1"></div>
              <div class="typing-dot td2"></div>
              <div class="typing-dot td3"></div>
            </div>
          </div>

          <!-- CTA -->
          <div class="msg-row recv" id="recv10" style="opacity:0;">
            <div class="bubble recv cta-bubble">
              <p>just dm me!</p>
            </div>
          </div>

          <div class="msg-row recv" id="ctaHandle" style="opacity:0;">
            <div style="padding:8px 0 0 4px;">
              <p style="font-size:36px;color:rgba(255,255,255,0.5);margin:0;">@madebyaidan on Instagram</p>
            </div>
          </div>

          <!-- User final reaction -->
          <div class="msg-row sent" id="sent3" style="opacity:0;">
            <div class="bubble sent">
              <p>doing it rn \u{1F3C3}\u200D\u2640\uFE0F</p>
            </div>
          </div>

        </div>
      </div>

      <!-- Bottom gradient fade -->
      <div style="position:absolute;left:0;right:0;bottom:0;height:60px;background:linear-gradient(0deg,${IG_BG},transparent);z-index:15;pointer-events:none;"></div>

    </div><!-- /phone-frame -->

  </div>

  <script>
    function showMsg(id, delay, anim) {
      setTimeout(() => {
        const el = document.getElementById(id)
        if (!el) return
        el.style.animation = (anim || 'msgIn') + ' 0.35s ease-out forwards'
      }, delay)
    }

    function showTyping(id, showDelay, hideDelay) {
      setTimeout(() => {
        const el = document.getElementById(id)
        if (el) {
          el.style.transition = 'opacity 0.2s'
          el.style.opacity = '1'
        }
      }, showDelay)
      setTimeout(() => {
        const el = document.getElementById(id)
        if (el) {
          el.style.transition = 'opacity 0.2s'
          el.style.opacity = '0'
          el.style.height = '0'
          el.style.marginBottom = '0'
          el.style.overflow = 'hidden'
        }
      }, hideDelay)
    }

    // Phase 1: 3 failed attempts
    function animateFail(msgId, bubbleId, errId, textId, sendTime, errTime) {
      showMsg(msgId, sendTime)
      setTimeout(() => {
        const dot = document.getElementById(errId)
        if (dot) dot.style.animation = 'errorDotPop 0.4s ease-out forwards'
        const bubble = document.getElementById(bubbleId)
        if (bubble) bubble.style.animation = 'failShake 0.5s ease-out'
      }, errTime)
      showMsg(textId, errTime + 400)
    }

    animateFail('fail1', 'fail1Bubble', 'err1', 'errText1', ${T.fail1Send * 1000}, ${T.fail1Err * 1000})
    animateFail('fail2', 'fail2Bubble', 'err2', 'errText2', ${T.fail2Send * 1000}, ${T.fail2Err * 1000})
    animateFail('fail3', 'fail3Bubble', 'err3', 'errText3', ${T.fail3Send * 1000}, ${T.fail3Err * 1000})

    // Phase 2: Boom — hide all failed msgs, all 8 messages pop in at once
    setTimeout(() => {
      ['fail1','errText1','fail2','errText2','fail3','errText3'].forEach(id => {
        const el = document.getElementById(id)
        if (el) el.style.display = 'none'
      })
    }, ${(T.floodStart - 0.05) * 1000})

    ${heyMessages.map((_, i) => `showMsg('hey${i}', ${(T.floodStart + i * T.floodInterval) * 1000});`).join('\n    ')}

    // Delivered status
    showMsg('deliveredStatus', ${(T.floodStart + 8 * T.floodInterval + 0.3) * 1000})

    // Phase 3: madebyaidan starts typing and responding
    showTyping('typing1', ${T.typing1 * 1000}, ${T.recv1 * 1000})
    showMsg('recv1', ${T.recv1 * 1000})
    showMsg('recv2', ${T.recv2 * 1000})
    showMsg('recv4', ${T.recv4 * 1000})
    showMsg('recv5', ${T.recv5 * 1000})

    // Phase 3: Show work
    showTyping('typing2', ${T.typing2 * 1000}, ${T.recv6 * 1000})
    showMsg('recv6', ${T.recv6 * 1000})
    showMsg('photo1', ${T.photo1 * 1000}, 'photoIn')
    showMsg('photo2', ${T.photo2 * 1000}, 'photoIn')
    showMsg('photo3', ${T.photo3 * 1000}, 'photoIn')

    // Phase 4: How it works
    showTyping('typing3', ${T.typing3 * 1000}, ${T.recv7 * 1000})
    showMsg('recv7', ${T.recv7 * 1000})
    showMsg('recv8', ${T.recv8 * 1000})
    showMsg('recv9', ${T.recv9 * 1000})

    // Phase 5: User responds + CTA
    showMsg('sent1', ${T.sent1 * 1000})
    showMsg('sent2', ${T.sent2 * 1000})
    showTyping('typing4', ${T.typing4 * 1000}, ${T.recv10 * 1000})
    showMsg('recv10', ${T.recv10 * 1000})
    showMsg('ctaHandle', ${T.ctaHandle * 1000})
    showMsg('sent3', ${T.sent3 * 1000})

    // Pulse CTA
    setTimeout(() => {
      const cta = document.querySelector('.cta-bubble')
      if (cta) cta.style.animation = 'pulseGlow 2s ease-in-out infinite'
    }, ${(T.recv10 + 1) * 1000})

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
    strategy: 'v68e — 7 hey messages flood in at once from network issues, madebyaidan responds naturally',
    safeBottomPixels: SAFE_BOTTOM,
    photos: PHOTOS,
  })

  const { execSync } = await import('child_process')
  const browser = await chromium.launch()

  console.log('Recording v68e — hey message flood animation...')

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
  const finalMp4 = path.join(OUT_DIR, '01_hey_flood_dm.mp4')

  try {
    execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${finalMp4}"`, { stdio: 'pipe' })
    fs.unlinkSync(srcVideo)
    console.log('Rendered 01_hey_flood_dm.mp4')
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
