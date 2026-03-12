import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v71b')

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 410

const SF = "-apple-system, 'Helvetica Neue', Arial, sans-serif"
const MANILA_COLOR = '#E8443A'
const IG_BG = '#000'
const IG_HEADER_BG = '#000'

const TOTAL_DURATION_MS = 40000

const PHOTOS = [
  'manila-gallery-dsc-0190.jpg',
  'manila-gallery-night-001.jpg',
  'manila-gallery-garden-001.jpg',
  'manila-gallery-urban-001.jpg',
  'manila-gallery-dsc-0075.jpg',
  'manila-gallery-canal-001.jpg',
  'manila-gallery-ivy-001.jpg',
  'manila-gallery-garden-002.jpg',
]

// DM reply messages that flood in
const DM_REPLIES = [
  { name: 'sarah_m',     color: '#E056A0', text: 'omg who shot these?? 😍' },
  { name: 'j.reyes',     color: '#56B4E0', text: 'you look INCREDIBLE' },
  { name: 'kath.mnl',    color: '#E0A856', text: 'wait these are free??' },
  { name: 'mark_phtgrph',color: '#56E098', text: 'I need this photographer' },
  { name: 'ria.diaz',    color: '#9B56E0', text: 'how do I sign up' },
  { name: 'andy.torres', color: '#E07856', text: 'your story is insane rn' },
  { name: 'bea.cruz',    color: '#56E0D8', text: "photographer's @ plsss" },
  { name: 'nicole.mnl',  color: '#E05668', text: 'booking mine NOW' },
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
  // Timeline
  const T = {
    // Phase 1: IG Story view with photo (0-3s)
    storyStart: 0,
    storyProgressStart: 0.2,
    storyEnd: 3.0,

    // Phase 2: Transition to DM inbox (3-4.5s)
    transitionStart: 3.0,
    inboxReveal: 3.5,

    // Phase 3: DM replies flooding in (4.5-14s)
    firstReply: 4.5,
    replyInterval: 1.0,  // seconds between each reply

    // Phase 4: Open thread → back-and-forth conversation (14-38s)
    openThread: 14.5,
    threadRef: 15.0,
    // Conversation
    recv1: 15.8,     // "hey thanks!! those are mine 📸"
    sent1: 17.0,     // "wait really?? how much did it cost"
    recv2: 18.2,     // "it was free lol"
    sent2: 19.4,     // "FREE?? what's the catch"
    recv3: 20.6,     // "no catch — he just needs portfolio content"
    recv4: 21.8,     // "you show up, he directs everything"
    sent3: 23.0,     // "wait so I don't need modeling experience?"
    recv5: 24.2,     // "nope!! he literally tells you exactly what to do"
    recv6: 25.4,     // "poses, angles, expressions — everything"
    sent4: 26.6,     // "ok that's actually perfect"
    sent5: 27.4,     // "how do I book"
    recv7: 28.6,     // "just dm @madebyaidan on Instagram"
    recv8: 29.8,     // "he'll set everything up"
    sent6: 31.0,     // "doing it rn 🏃‍♀️"
    ctaMsg: 32.5,    // CTA bubble
    ctaHandle: 33.8, // handle
    // Hold until 38s
  }

  // Build DM reply items with staggered timing
  const replyItems = DM_REPLIES.map((r, i) => {
    const delay = T.firstReply + i * T.replyInterval
    return { ...r, delay, index: i }
  })

  return `<!DOCTYPE html>
<html>
<head>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { margin: 0; padding: 0; background: ${IG_BG}; -webkit-font-smoothing: antialiased; }

  @keyframes msgSlideIn {
    0% { opacity: 0; transform: translateY(-60px); }
    100% { opacity: 1; transform: translateY(0); }
  }

  @keyframes msgIn {
    0% { opacity: 0; transform: translateY(14px); }
    100% { opacity: 1; transform: translateY(0); }
  }

  @keyframes storyProgress {
    0% { width: 0%; }
    100% { width: 100%; }
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
    0% { opacity: 0; transform: scale(0.85); }
    100% { opacity: 1; transform: scale(1); }
  }

  @keyframes slideUp {
    0% { transform: translateY(100%); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }

  @keyframes badgePop {
    0% { transform: scale(0); }
    50% { transform: scale(1.3); }
    100% { transform: scale(1); }
  }

  @keyframes pulseGlow {
    0%, 100% { box-shadow: 0 0 0 0 rgba(232, 68, 58, 0.4); }
    50% { box-shadow: 0 0 0 14px rgba(232, 68, 58, 0); }
  }

  @keyframes notifShake {
    0%, 100% { transform: translateX(0); }
    15% { transform: translateX(-4px); }
    30% { transform: translateX(4px); }
    45% { transform: translateX(-3px); }
    60% { transform: translateX(3px); }
    75% { transform: translateX(-2px); }
    90% { transform: translateX(2px); }
  }

  @keyframes countUp {
    0% { transform: scale(0.5); opacity: 0; }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); opacity: 1; }
  }

  .page {
    width: ${WIDTH}px;
    height: ${HEIGHT}px;
    position: relative;
    overflow: hidden;
    background: ${IG_BG};
    font-family: ${SF};
  }

  /* ===== PHASE 1: IG STORY ===== */
  .story-view {
    position: absolute;
    inset: 0;
    z-index: 20;
    background: #000;
  }

  .story-image {
    position: absolute;
    inset: 0;
    z-index: 1;
  }

  .story-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .story-overlay {
    position: absolute;
    inset: 0;
    z-index: 2;
    background: linear-gradient(to bottom,
      rgba(0,0,0,0.5) 0%,
      transparent 15%,
      transparent 80%,
      rgba(0,0,0,0.4) 100%
    );
  }

  .story-header {
    position: absolute;
    top: 0; left: 0; right: 0;
    z-index: 3;
    padding: 58px 16px 0;
  }

  .story-progress-bar {
    width: 100%;
    height: 4px;
    background: rgba(255,255,255,0.25);
    border-radius: 2px;
    overflow: hidden;
    margin-bottom: 14px;
  }

  .story-progress-fill {
    height: 100%;
    background: #fff;
    border-radius: 2px;
    width: 0%;
  }

  .story-user {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .story-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    overflow: hidden;
    border: 3px solid ${MANILA_COLOR};
  }

  .story-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .story-username {
    font-size: 28px;
    font-weight: 600;
    color: #fff;
    text-shadow: 0 1px 4px rgba(0,0,0,0.5);
  }

  .story-time {
    font-size: 22px;
    color: rgba(255,255,255,0.7);
    margin-left: 8px;
  }

  .story-reply-bar {
    position: absolute;
    bottom: ${SAFE_BOTTOM + 20}px;
    left: 24px; right: 24px;
    z-index: 3;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .story-reply-input {
    flex: 1;
    height: 64px;
    border-radius: 32px;
    border: 2px solid rgba(255,255,255,0.4);
    background: transparent;
    padding: 0 24px;
    font-size: 26px;
    color: rgba(255,255,255,0.5);
    display: flex;
    align-items: center;
  }

  /* ===== PHASE 2: DM INBOX ===== */
  .inbox-view {
    position: absolute;
    inset: 0;
    z-index: 15;
    background: ${IG_BG};
    opacity: 0;
  }

  .inbox-header {
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 140px;
    background: ${IG_HEADER_BG};
    border-bottom: 1px solid #222;
    display: flex;
    align-items: flex-end;
    padding: 0 24px 16px;
    z-index: 5;
  }

  .inbox-title {
    font-size: 38px;
    font-weight: 700;
    color: #fff;
    flex: 1;
  }

  .inbox-badge {
    background: ${MANILA_COLOR};
    color: #fff;
    font-size: 24px;
    font-weight: 700;
    padding: 4px 14px;
    border-radius: 20px;
    margin-left: 10px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 36px;
    opacity: 0;
  }

  .inbox-new-icon {
    margin-left: auto;
  }

  .inbox-list {
    position: absolute;
    top: 140px;
    left: 0; right: 0;
    bottom: ${SAFE_BOTTOM}px;
    overflow: hidden;
    padding: 0;
  }

  .inbox-scroll {
    padding: 0;
  }

  /* DM row in inbox */
  .dm-row {
    display: flex;
    align-items: center;
    padding: 16px 24px;
    gap: 16px;
    opacity: 0;
    border-bottom: 1px solid #1a1a1a;
  }

  .dm-avatar {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .dm-avatar-initial {
    font-size: 30px;
    font-weight: 700;
    color: #fff;
  }

  .dm-content {
    flex: 1;
    overflow: hidden;
  }

  .dm-name {
    font-size: 28px;
    font-weight: 700;
    color: #fff;
    margin-bottom: 4px;
  }

  .dm-preview {
    font-size: 26px;
    color: #8e8e8e;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .dm-preview.unread {
    color: #fff;
    font-weight: 600;
  }

  .dm-time {
    font-size: 22px;
    color: #8e8e8e;
    flex-shrink: 0;
  }

  .dm-unread-dot {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #3797f0;
    flex-shrink: 0;
    margin-left: 8px;
  }

  /* ===== PHASE 4: OPEN THREAD ===== */
  .thread-view {
    position: absolute;
    inset: 0;
    z-index: 30;
    background: ${IG_BG};
    opacity: 0;
  }

  .thread-header {
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 130px;
    background: ${IG_HEADER_BG};
    border-bottom: 1px solid #222;
    display: flex;
    align-items: flex-end;
    padding: 0 24px 16px;
    z-index: 5;
  }

  .thread-header-back {
    font-size: 36px;
    color: #fff;
    margin-right: 16px;
  }

  .thread-avatar {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    overflow: hidden;
    margin-right: 14px;
    border: 2px solid #444;
  }

  .thread-avatar img {
    width: 100%; height: 100%;
    object-fit: cover;
  }

  .thread-info {
    flex: 1;
  }

  .thread-name {
    font-size: 32px;
    font-weight: 700;
    color: #fff;
  }

  .thread-status {
    font-size: 22px;
    color: #1ED760;
    margin-top: 2px;
  }

  .thread-chat {
    position: absolute;
    top: 130px;
    left: 0; right: 0;
    bottom: ${SAFE_BOTTOM}px;
    overflow: hidden;
  }

  .thread-scroll {
    padding: 20px 16px 400px;
  }

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
    background: #3797f0;
    border-bottom-right-radius: 6px;
  }

  .bubble.recv {
    background: #262626;
    border-bottom-left-radius: 6px;
  }

  .bubble p {
    font-size: 36px;
    color: #fff;
    line-height: 1.4;
    margin: 0;
  }

  .cta-bubble {
    background: ${MANILA_COLOR};
    border-bottom-left-radius: 6px;
  }

  .cta-bubble p {
    font-weight: 700;
    font-size: 38px;
  }

  /* Story reply reference bubble */
  .story-ref {
    background: #1a1a1a;
    border-radius: 16px;
    padding: 12px;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .story-ref-thumb {
    width: 80px;
    height: 100px;
    border-radius: 10px;
    overflow: hidden;
    flex-shrink: 0;
  }

  .story-ref-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .story-ref-label {
    font-size: 24px;
    color: #8e8e8e;
  }

  /* Notification count overlay for inbox */
  .notif-count-overlay {
    position: absolute;
    top: 56px;
    right: 24px;
    z-index: 40;
    opacity: 0;
  }

  .notif-count-pill {
    background: ${MANILA_COLOR};
    color: #fff;
    font-size: 48px;
    font-weight: 800;
    padding: 10px 28px;
    border-radius: 30px;
    letter-spacing: 1px;
  }
</style>
</head>
<body>
  <div class="page">

    <!-- ===== PHASE 1: IG STORY VIEW ===== -->
    <div class="story-view" id="storyView">
      <div class="story-image">
        <img src="${imageDataMap[PHOTOS[0]]}" alt="story" />
      </div>
      <div class="story-overlay"></div>
      <div class="story-header">
        <div class="story-progress-bar">
          <div class="story-progress-fill" id="storyProgress"
               style="animation: storyProgress ${T.storyEnd - T.storyProgressStart}s linear ${T.storyProgressStart}s forwards;">
          </div>
        </div>
        <div class="story-user">
          <div class="story-avatar">
            <img src="${imageDataMap[PHOTOS[4]]}" alt="avatar" />
          </div>
          <span class="story-username">your_username</span>
          <span class="story-time">2m</span>
        </div>
      </div>
      <div class="story-reply-bar">
        <div class="story-reply-input">Send message</div>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
      </div>
    </div>

    <!-- ===== PHASE 2: DM INBOX ===== -->
    <div class="inbox-view" id="inboxView">
      <div class="inbox-header">
        <div style="display:flex;align-items:center;">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" style="margin-right:16px;"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          <span class="inbox-title">Messages</span>
          <span class="inbox-badge" id="inboxBadge">1</span>
        </div>
      </div>

      <div class="inbox-list">
        <div class="inbox-scroll" id="inboxScroll">
          ${replyItems.map((r, i) => `
          <div class="dm-row" id="dmRow${i}">
            <div class="dm-avatar" style="background:${r.color};">
              <span class="dm-avatar-initial">${r.name.charAt(0).toUpperCase()}</span>
            </div>
            <div class="dm-content">
              <div class="dm-name">${r.name}</div>
              <div class="dm-preview unread">Replied to your story: ${r.text}</div>
            </div>
            <div class="dm-time">now</div>
            <div class="dm-unread-dot"></div>
          </div>
          `).join('')}
        </div>
      </div>
    </div>

    <!-- ===== PHASE 4: THREAD VIEW ===== -->
    <div class="thread-view" id="threadView">
      <div class="thread-header">
        <div class="thread-header-back">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </div>
        <div class="thread-avatar">
          <div class="dm-avatar" style="background:${DM_REPLIES[0].color};width:56px;height:56px;border-radius:50%;">
            <span class="dm-avatar-initial" style="font-size:24px;">${DM_REPLIES[0].name.charAt(0).toUpperCase()}</span>
          </div>
        </div>
        <div class="thread-info">
          <div class="thread-name">${DM_REPLIES[0].name}</div>
          <div class="thread-status">Active now</div>
        </div>
      </div>

      <div class="thread-chat">
        <div class="thread-scroll" id="threadScroll">

          <!-- Story reply reference -->
          <div class="msg-row recv" id="threadRef" style="opacity:0;">
            <div style="max-width:72%;">
              <div class="story-ref">
                <div class="story-ref-thumb">
                  <img src="${imageDataMap[PHOTOS[0]]}" />
                </div>
                <span class="story-ref-label">Replied to your story</span>
              </div>
              <div class="bubble recv" style="margin-top:4px;">
                <p>${DM_REPLIES[0].text}</p>
              </div>
            </div>
          </div>

          <!-- Back-and-forth conversation -->
          <div class="msg-row sent" id="tRecv1" style="opacity:0;">
            <div class="bubble sent"><p>hey thanks!! those are mine 📸</p></div>
          </div>

          <div class="msg-row recv" id="tSent1" style="opacity:0;">
            <div class="bubble recv"><p>wait really?? how much did it cost</p></div>
          </div>

          <div class="msg-row sent" id="tRecv2" style="opacity:0;">
            <div class="bubble sent"><p>it was free lol</p></div>
          </div>

          <div class="msg-row recv" id="tSent2" style="opacity:0;">
            <div class="bubble recv"><p>FREE?? what's the catch</p></div>
          </div>

          <div class="msg-row sent" id="tRecv3" style="opacity:0;">
            <div class="bubble sent"><p>no catch — he just needs portfolio content</p></div>
          </div>

          <div class="msg-row sent" id="tRecv4" style="opacity:0;">
            <div class="bubble sent"><p>you show up, he directs everything</p></div>
          </div>

          <div class="msg-row recv" id="tSent3" style="opacity:0;">
            <div class="bubble recv"><p>wait so I don't need modeling experience?</p></div>
          </div>

          <div class="msg-row sent" id="tRecv5" style="opacity:0;">
            <div class="bubble sent"><p>nope!! he literally tells you exactly what to do</p></div>
          </div>

          <div class="msg-row sent" id="tRecv6" style="opacity:0;">
            <div class="bubble sent"><p>poses, angles, expressions — everything</p></div>
          </div>

          <div class="msg-row recv" id="tSent4" style="opacity:0;">
            <div class="bubble recv"><p>ok that's actually perfect</p></div>
          </div>

          <div class="msg-row recv" id="tSent5" style="opacity:0;">
            <div class="bubble recv"><p>how do I book</p></div>
          </div>

          <div class="msg-row sent" id="tRecv7" style="opacity:0;">
            <div class="bubble sent"><p>just dm @madebyaidan on Instagram</p></div>
          </div>

          <div class="msg-row sent" id="tRecv8" style="opacity:0;">
            <div class="bubble sent"><p>he'll set everything up</p></div>
          </div>

          <div class="msg-row recv" id="tSent6" style="opacity:0;">
            <div class="bubble recv"><p>doing it rn 🏃‍♀️</p></div>
          </div>

          <!-- CTA message -->
          <div class="msg-row recv" id="threadCta" style="opacity:0;">
            <div class="bubble cta-bubble">
              <p>dm me if interested!!</p>
            </div>
          </div>

          <!-- Handle -->
          <div class="msg-row recv" id="threadHandle" style="opacity:0;">
            <div style="padding:8px 0 0 4px;">
              <p style="font-size:30px;color:rgba(255,255,255,0.5);margin:0;">@madebyaidan on Instagram</p>
            </div>
          </div>

        </div>
      </div>
    </div>

  </div>

  <script>
    const storyView = document.getElementById('storyView')
    const inboxView = document.getElementById('inboxView')
    const threadView = document.getElementById('threadView')
    const inboxBadge = document.getElementById('inboxBadge')
    const inboxScroll = document.getElementById('inboxScroll')

    // ======= Phase 1 → Phase 2 transition =======
    setTimeout(() => {
      storyView.style.transition = 'opacity 0.5s ease-out'
      storyView.style.opacity = '0'
      storyView.style.pointerEvents = 'none'

      inboxView.style.transition = 'opacity 0.5s ease-out'
      inboxView.style.opacity = '1'
    }, ${T.transitionStart * 1000})

    // ======= Phase 3: DM replies flooding in =======
    let replyCount = 0

    const replies = [
      ${replyItems.map((r, i) => `{ id: 'dmRow${i}', delay: ${r.delay * 1000} }`).join(',\n      ')}
    ]

    // Show badge when inbox appears
    setTimeout(() => {
      inboxBadge.style.animation = 'badgePop 0.3s ease-out forwards'
      inboxBadge.style.opacity = '1'
    }, ${T.inboxReveal * 1000})

    replies.forEach(({ id, delay }, i) => {
      setTimeout(() => {
        const el = document.getElementById(id)
        if (!el) return

        // Push existing rows down by inserting new ones at the top
        // Each new reply slides in from the top
        el.style.animation = 'msgSlideIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards'

        // Update badge count
        replyCount = i + 1
        inboxBadge.textContent = String(replyCount)
        inboxBadge.style.animation = 'none'
        void inboxBadge.offsetWidth
        inboxBadge.style.animation = 'badgePop 0.25s ease-out forwards'
        inboxBadge.style.opacity = '1'

        // Shake the whole list slightly on each new reply
        inboxScroll.style.animation = 'none'
        void inboxScroll.offsetWidth
        inboxScroll.style.animation = 'notifShake 0.3s ease-out'
      }, delay)
    })

    // ======= Phase 4: Open thread =======
    setTimeout(() => {
      inboxView.style.transition = 'opacity 0.4s ease-out'
      inboxView.style.opacity = '0'
      inboxView.style.pointerEvents = 'none'

      threadView.style.transition = 'opacity 0.4s ease-out'
      threadView.style.opacity = '1'
    }, ${T.openThread * 1000})

    // Thread messages appear with auto-scroll
    const threadMsgs = [
      { id: 'threadRef',   t: ${T.threadRef * 1000} },
      { id: 'tRecv1',      t: ${T.recv1 * 1000} },
      { id: 'tSent1',      t: ${T.sent1 * 1000} },
      { id: 'tRecv2',      t: ${T.recv2 * 1000} },
      { id: 'tSent2',      t: ${T.sent2 * 1000} },
      { id: 'tRecv3',      t: ${T.recv3 * 1000} },
      { id: 'tRecv4',      t: ${T.recv4 * 1000} },
      { id: 'tSent3',      t: ${T.sent3 * 1000} },
      { id: 'tRecv5',      t: ${T.recv5 * 1000} },
      { id: 'tRecv6',      t: ${T.recv6 * 1000} },
      { id: 'tSent4',      t: ${T.sent4 * 1000} },
      { id: 'tSent5',      t: ${T.sent5 * 1000} },
      { id: 'tRecv7',      t: ${T.recv7 * 1000} },
      { id: 'tRecv8',      t: ${T.recv8 * 1000} },
      { id: 'tSent6',      t: ${T.sent6 * 1000} },
      { id: 'threadCta',   t: ${T.ctaMsg * 1000} },
      { id: 'threadHandle',t: ${T.ctaHandle * 1000} },
    ]

    const threadScrollEl = document.getElementById('threadScroll')
    let threadScrollTarget = 0

    threadMsgs.forEach(({ id, t }, i) => {
      setTimeout(() => {
        const el = document.getElementById(id)
        if (el) {
          el.style.animation = 'msgIn 0.35s ease-out forwards'
        }
        // Auto-scroll after first few messages
        if (i >= 4) {
          threadScrollTarget += 80
          if (threadScrollEl) {
            threadScrollEl.style.transition = 'transform 0.5s ease-out'
            threadScrollEl.style.transform = 'translateY(-' + threadScrollTarget + 'px)'
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
    strategy: 'v71b — story reply flood + extended back-and-forth conversation',
    safeBottomPixels: SAFE_BOTTOM,
    photos: PHOTOS,
  })

  const { execSync } = await import('child_process')
  const browser = await chromium.launch()

  console.log('Recording story reply flood animation...')

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
  const finalMp4 = path.join(OUT_DIR, '01_story_replies_convo.mp4')

  try {
    execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${finalMp4}"`, { stdio: 'pipe' })
    fs.unlinkSync(srcVideo)
    console.log('Rendered 01_story_replies_convo.mp4')
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
