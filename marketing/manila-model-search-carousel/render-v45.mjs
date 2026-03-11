import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v45')

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 410

const SF = "-apple-system, 'Helvetica Neue', Arial, sans-serif"

const TWITTER_BG = '#000000'
const TWITTER_BORDER = '#2F3336'
const TWITTER_GRAY = '#71767B'
const TWITTER_BLUE = '#1D9BF0'
const MANILA_COLOR = '#E8443A'

const HANDLE = 'madebyaidan'
const DISPLAY_NAME = 'aidan'

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

function readImage(name) {
  const filePath = path.join(IMAGE_DIR, name)
  const buf = fs.readFileSync(filePath)
  return `data:${imageMime(name)};base64,${buf.toString('base64')}`
}

function buildTwitterThread(images) {
  const TOTAL_DURATION = 17
  const TOTAL_DURATION_MS = 19000
  const p = (t) => ((t / TOTAL_DURATION) * 100).toFixed(1)

  // Scroll keyframes — start scrolling at ~4s when photos appear
  const scrollKeyframes = `
    0% { transform: translateY(0); }
    ${p(4.0)}% { transform: translateY(0); }
    ${p(5.5)}% { transform: translateY(-180px); }
    ${p(7.0)}% { transform: translateY(-480px); }
    ${p(8.5)}% { transform: translateY(-820px); }
    ${p(10.0)}% { transform: translateY(-1050px); }
    ${p(12.0)}% { transform: translateY(-1200px); }
    ${p(13.0)}% { transform: translateY(-1350px); }
    100% { transform: translateY(-1350px); }
  `

  // Number counter animation helpers — count up from 0 to target
  function counterAnim(id, target, startT, durationS) {
    const frames = []
    const steps = 20
    for (let i = 0; i <= steps; i++) {
      const pct = ((i / steps) * 100).toFixed(0)
      const val = Math.round((i / steps) * target)
      frames.push(`${pct}% { content: '${val}'; }`)
    }
    return `@keyframes count_${id} { ${frames.join(' ')} }`
  }

  // Format large numbers
  function fmtNum(n) {
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
    return String(n)
  }

  // Twitter top bar
  const topBar = `
    <div style="position:absolute;left:0;right:0;top:0;height:110px;background:${TWITTER_BG};z-index:20;border-bottom:1px solid ${TWITTER_BORDER};">
      <!-- Status bar -->
      <div style="padding:14px 32px 0;display:flex;align-items:center;justify-content:space-between;">
        <span style="font-family:${SF};font-size:20px;font-weight:600;color:#fff;">9:41</span>
        <div style="display:flex;align-items:center;gap:6px;">
          <svg width="20" height="14" viewBox="0 0 18 12"><rect x="0" y="3" width="3" height="9" rx="1" fill="#fff"/><rect x="5" y="2" width="3" height="10" rx="1" fill="#fff"/><rect x="10" y="0" width="3" height="12" rx="1" fill="#fff"/></svg>
          <svg width="30" height="15" viewBox="0 0 27 13"><rect x="0" y="0" width="23" height="13" rx="3.5" stroke="#fff" stroke-width="1" fill="none"/><rect x="2" y="2" width="18" height="9" rx="2" fill="#fff"/></svg>
        </div>
      </div>
      <!-- X nav tabs -->
      <div style="display:flex;align-items:center;justify-content:center;padding:8px 0 0;position:relative;">
        <!-- Back arrow -->
        <div style="position:absolute;left:24px;top:4px;">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M20 12H4M4 12l8-8M4 12l8 8" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <!-- X logo -->
        <svg width="32" height="32" viewBox="0 0 300 300" fill="white">
          <path d="M178.57 127.15 290.27 0h-26.46l-97.03 110.38L89.34 0H0l117.13 166.93L0 300.25h26.46l102.4-116.59 81.8 116.59h89.34M36.01 19.54H76.66l187.13 261.17h-40.66"/>
        </svg>
        <!-- Profile icon top right -->
        <div style="position:absolute;right:24px;top:4px;width:32px;height:32px;border-radius:50%;overflow:hidden;background:#333;">
          <img src="${images.profilePic}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
      </div>
    </div>
  `

  // Thread connector line
  const THREAD_LINE = `<div style="position:absolute;left:19px;top:52px;bottom:-12px;width:2px;background:${TWITTER_BORDER};"></div>`

  // ---- TWEET 1: Main tweet ----
  const tweet1 = `
  <div id="tweet1" style="padding:20px 20px 0;border-bottom:1px solid ${TWITTER_BORDER};opacity:0;animation:tweetIn 0.4s ease-out 0.5s forwards;position:relative;">
    <div style="display:flex;gap:12px;">
      <!-- Avatar + thread line -->
      <div style="position:relative;flex-shrink:0;">
        <div style="width:48px;height:48px;border-radius:50%;overflow:hidden;">
          <img src="${images.profilePic}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        ${THREAD_LINE}
      </div>
      <!-- Content -->
      <div style="flex:1;min-width:0;">
        <!-- Header row -->
        <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:4px;">
          <span style="font-family:${SF};font-size:22px;font-weight:700;color:#fff;">${DISPLAY_NAME}</span>
          <span style="font-family:${SF};font-size:20px;color:${TWITTER_GRAY};">@${HANDLE}</span>
          <span style="font-family:${SF};font-size:20px;color:${TWITTER_GRAY};">· 2h</span>
        </div>
        <!-- Post text -->
        <p style="font-family:${SF};font-size:24px;color:#fff;line-height:1.45;margin:0 0 16px;">I'm doing a model search in Manila. No experience needed. You just show up and I direct everything.</p>
        <!-- Engagement bar -->
        <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-top:1px solid ${TWITTER_BORDER};max-width:420px;">
          <div style="display:flex;align-items:center;gap:8px;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M1.751 10c0-4.42 3.584-8 8.008-8h4.49C18.494 2 22 5.507 22 10c0 4.42-3.584 8-8.008 8H16.5l-4.5 4v-4H9.759c-4.424 0-8.008-3.58-8.008-8Z" stroke="${TWITTER_GRAY}" stroke-width="1.8"/></svg>
            <span style="font-family:${SF};font-size:18px;color:${TWITTER_GRAY};">47</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4.5 3.88l4.432 4.14-2.432 2.38-2-1.87V10h9v2H6.5v1.46l2 1.87-4.432 4.14L0 15.24V8.76L4.5 3.88ZM19.5 20.12l-4.432-4.14 2.432-2.38 2 1.87V14H10v-2h9v-1.46l-2-1.87 4.432-4.14L24 8.76v6.48l-4.5 4.88Z" fill="${TWITTER_GRAY}"/></svg>
            <span style="font-family:${SF};font-size:18px;color:${TWITTER_GRAY};">182</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91Z" stroke="${TWITTER_GRAY}" stroke-width="1.8"/></svg>
            <span style="font-family:${SF};font-size:18px;color:${TWITTER_GRAY};">1.2K</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M8.75 21V3h2v18h-2ZM18 21V8.5h2V21h-2ZM4 21l.004-10h2L6 21H4Zm9.248 0v-7h2v7h-2Z" fill="${TWITTER_GRAY}"/></svg>
            <span style="font-family:${SF};font-size:18px;color:${TWITTER_GRAY};">89K</span>
          </div>
        </div>
      </div>
    </div>
  </div>
  `

  // ---- TWEET 2: Thread reply - how it works ----
  const tweet2 = `
  <div id="tweet2" style="padding:16px 20px 0;border-bottom:1px solid ${TWITTER_BORDER};opacity:0;animation:tweetIn 0.4s ease-out 2.5s forwards;position:relative;">
    <div style="display:flex;gap:12px;">
      <div style="position:relative;flex-shrink:0;">
        <div style="width:48px;height:48px;border-radius:50%;overflow:hidden;">
          <img src="${images.profilePic}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        ${THREAD_LINE}
      </div>
      <div style="flex:1;min-width:0;">
        <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:4px;">
          <span style="font-family:${SF};font-size:22px;font-weight:700;color:#fff;">${DISPLAY_NAME}</span>
          <span style="font-family:${SF};font-size:20px;color:${TWITTER_GRAY};">@${HANDLE}</span>
          <span style="font-family:${SF};font-size:20px;color:${TWITTER_GRAY};">· 2h</span>
        </div>
        <p style="font-family:${SF};font-size:24px;color:#fff;line-height:1.55;margin:0 0 16px;">here's how it works:<br/>1. sign up (60 sec form)<br/>2. we plan the date + vibe<br/>3. show up, I handle the rest<br/>4. get edited photos in a week</p>
        <div style="display:flex;align-items:center;gap:32px;padding:12px 0;border-top:1px solid ${TWITTER_BORDER};max-width:420px;">
          <div style="display:flex;align-items:center;gap:8px;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M1.751 10c0-4.42 3.584-8 8.008-8h4.49C18.494 2 22 5.507 22 10c0 4.42-3.584 8-8.008 8H16.5l-4.5 4v-4H9.759c-4.424 0-8.008-3.58-8.008-8Z" stroke="${TWITTER_GRAY}" stroke-width="1.8"/></svg>
            <span style="font-family:${SF};font-size:18px;color:${TWITTER_GRAY};">23</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91Z" stroke="${TWITTER_GRAY}" stroke-width="1.8"/></svg>
            <span style="font-family:${SF};font-size:18px;color:${TWITTER_GRAY};">341</span>
          </div>
        </div>
      </div>
    </div>
  </div>
  `

  // ---- TWEET 3: Thread reply - photos ----
  // Engagement counters that animate up
  const tweet3 = `
  <div id="tweet3" style="padding:16px 20px 0;border-bottom:1px solid ${TWITTER_BORDER};opacity:0;animation:tweetIn 0.4s ease-out 4.5s forwards;position:relative;">
    <div style="display:flex;gap:12px;">
      <div style="position:relative;flex-shrink:0;">
        <div style="width:48px;height:48px;border-radius:50%;overflow:hidden;">
          <img src="${images.profilePic}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        ${THREAD_LINE}
      </div>
      <div style="flex:1;min-width:0;">
        <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:4px;">
          <span style="font-family:${SF};font-size:22px;font-weight:700;color:#fff;">${DISPLAY_NAME}</span>
          <span style="font-family:${SF};font-size:20px;color:${TWITTER_GRAY};">@${HANDLE}</span>
          <span style="font-family:${SF};font-size:20px;color:${TWITTER_GRAY};">· 2h</span>
        </div>
        <p style="font-family:${SF};font-size:24px;color:#fff;line-height:1.45;margin:0 0 14px;">some of the shots from last week:</p>
        <!-- 2x1+1 photo grid -->
        <div style="display:grid;grid-template-columns:1fr 1fr;grid-template-rows:280px 280px;gap:4px;border-radius:18px;overflow:hidden;margin-bottom:14px;">
          <div style="grid-column:1;grid-row:1;overflow:hidden;">
            <img src="${images.photo1}" style="width:100%;height:100%;object-fit:cover;display:block;"/>
          </div>
          <div style="grid-column:2;grid-row:1;overflow:hidden;">
            <img src="${images.photo2}" style="width:100%;height:100%;object-fit:cover;display:block;"/>
          </div>
          <div style="grid-column:1/3;grid-row:2;overflow:hidden;">
            <img src="${images.photo3}" style="width:100%;height:280px;object-fit:cover;display:block;object-position:center 30%;"/>
          </div>
        </div>
        <!-- Animated engagement bar -->
        <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-top:1px solid ${TWITTER_BORDER};max-width:420px;">
          <div style="display:flex;align-items:center;gap:8px;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M1.751 10c0-4.42 3.584-8 8.008-8h4.49C18.494 2 22 5.507 22 10c0 4.42-3.584 8-8.008 8H16.5l-4.5 4v-4H9.759c-4.424 0-8.008-3.58-8.008-8Z" stroke="${TWITTER_GRAY}" stroke-width="1.8"/></svg>
            <span id="cnt-reply" style="font-family:${SF};font-size:18px;color:${TWITTER_GRAY};">0</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4.5 3.88l4.432 4.14-2.432 2.38-2-1.87V10h9v2H6.5v1.46l2 1.87-4.432 4.14L0 15.24V8.76L4.5 3.88ZM19.5 20.12l-4.432-4.14 2.432-2.38 2 1.87V14H10v-2h9v-1.46l-2-1.87 4.432-4.14L24 8.76v6.48l-4.5 4.88Z" fill="${TWITTER_GRAY}"/></svg>
            <span id="cnt-rt" style="font-family:${SF};font-size:18px;color:${TWITTER_GRAY};">0</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91Z" stroke="${TWITTER_GRAY}" stroke-width="1.8"/></svg>
            <span id="cnt-like" style="font-family:${SF};font-size:18px;color:${TWITTER_GRAY};">0</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M8.75 21V3h2v18h-2ZM18 21V8.5h2V21h-2ZM4 21l.004-10h2L6 21H4Zm9.248 0v-7h2v7h-2Z" fill="${TWITTER_GRAY}"/></svg>
            <span id="cnt-views" style="font-family:${SF};font-size:18px;color:${TWITTER_GRAY};">0</span>
          </div>
        </div>
      </div>
    </div>
  </div>
  `

  // ---- REPLIES from others ----
  function replyAvatar(initial, color) {
    return `<div style="width:48px;height:48px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;flex-shrink:0;"><span style="font-family:${SF};font-size:22px;font-weight:700;color:#fff;">${initial}</span></div>`
  }

  const reply1 = `
  <div id="reply1" style="padding:16px 20px;border-bottom:1px solid ${TWITTER_BORDER};opacity:0;animation:tweetIn 0.4s ease-out 8.0s forwards;">
    <div style="display:flex;gap:12px;">
      ${replyAvatar('S', '#7B61FF')}
      <div style="flex:1;min-width:0;">
        <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:4px;">
          <span style="font-family:${SF};font-size:22px;font-weight:700;color:#fff;">Sofia</span>
          <span style="font-family:${SF};font-size:20px;color:${TWITTER_GRAY};">@sofiaaa · 1h</span>
        </div>
        <p style="font-family:${SF};font-size:24px;color:#fff;line-height:1.45;margin:0 0 14px;">just signed up this is insane</p>
        <div style="display:flex;align-items:center;gap:8px;">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91Z" stroke="${TWITTER_GRAY}" stroke-width="1.8"/></svg>
          <span style="font-family:${SF};font-size:18px;color:${TWITTER_GRAY};">234</span>
        </div>
      </div>
    </div>
  </div>
  `

  const reply2 = `
  <div id="reply2" style="padding:16px 20px;border-bottom:1px solid ${TWITTER_BORDER};opacity:0;animation:tweetIn 0.4s ease-out 9.5s forwards;">
    <div style="display:flex;gap:12px;">
      ${replyAvatar('L', '#F4212E')}
      <div style="flex:1;min-width:0;">
        <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:4px;">
          <span style="font-family:${SF};font-size:22px;font-weight:700;color:#fff;">Luna</span>
          <span style="font-family:${SF};font-size:20px;color:${TWITTER_GRAY};">@lunaaarts · 45m</span>
        </div>
        <p style="font-family:${SF};font-size:24px;color:#fff;line-height:1.45;margin:0 0 14px;">THE PHOTOS ARE SO GOOD WTF</p>
        <div style="display:flex;align-items:center;gap:8px;">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91Z" stroke="${TWITTER_GRAY}" stroke-width="1.8"/></svg>
          <span style="font-family:${SF};font-size:18px;color:${TWITTER_GRAY};">891</span>
        </div>
      </div>
    </div>
  </div>
  `

  const reply3 = `
  <div id="reply3" style="padding:16px 20px;border-bottom:1px solid ${TWITTER_BORDER};opacity:0;animation:tweetIn 0.4s ease-out 11.0s forwards;">
    <div style="display:flex;gap:12px;">
      ${replyAvatar('A', '#00BA7C')}
      <div style="flex:1;min-width:0;">
        <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:4px;">
          <span style="font-family:${SF};font-size:22px;font-weight:700;color:#fff;">Ava</span>
          <span style="font-family:${SF};font-size:20px;color:${TWITTER_GRAY};">@avaexplores · 30m</span>
        </div>
        <p style="font-family:${SF};font-size:24px;color:#fff;line-height:1.45;margin:0 0 14px;">how do I sign up??</p>
        <div style="display:flex;align-items:center;gap:8px;">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M1.751 10c0-4.42 3.584-8 8.008-8h4.49C18.494 2 22 5.507 22 10c0 4.42-3.584 8-8.008 8H16.5l-4.5 4v-4H9.759c-4.424 0-8.008-3.58-8.008-8Z" stroke="${TWITTER_GRAY}" stroke-width="1.8"/></svg>
          <span style="font-family:${SF};font-size:18px;color:${TWITTER_GRAY};">12</span>
        </div>
      </div>
    </div>
  </div>
  `

  // Reply from madebyaidan with fast-counting likes
  const reply4 = `
  <div id="reply4" style="padding:16px 20px;border-bottom:1px solid ${TWITTER_BORDER};opacity:0;animation:tweetIn 0.4s ease-out 11.5s forwards;">
    <div style="display:flex;gap:12px;">
      <div style="width:48px;height:48px;border-radius:50%;overflow:hidden;flex-shrink:0;">
        <img src="${images.profilePic}" style="width:100%;height:100%;object-fit:cover;"/>
      </div>
      <div style="flex:1;min-width:0;">
        <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:4px;">
          <span style="font-family:${SF};font-size:22px;font-weight:700;color:#fff;">${DISPLAY_NAME}</span>
          <span style="font-family:${SF};font-size:20px;color:${TWITTER_GRAY};">@${HANDLE} · just now</span>
        </div>
        <p style="font-family:${SF};font-size:24px;color:#fff;line-height:1.45;margin:0 0 14px;">link in bio! 60 second form</p>
        <div style="display:flex;align-items:center;gap:8px;">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="${TWITTER_BLUE}"><path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91Z"/></svg>
          <span id="cnt-like2" style="font-family:${SF};font-size:18px;color:${TWITTER_BLUE};">0</span>
        </div>
      </div>
    </div>
  </div>
  `

  // MANILA flash overlay
  const manilaFlash = `
  <div id="manila-flash" style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:${TWITTER_BG};z-index:30;pointer-events:none;opacity:0;animation:manilaFlash 0.5s ease-out 13.0s forwards;">
    <p style="font-family:${SF};font-size:160px;font-weight:900;letter-spacing:0.08em;color:${MANILA_COLOR};margin:0;text-transform:uppercase;opacity:0;animation:manilaTextIn 0.7s cubic-bezier(0.16,1,0.3,1) 13.1s forwards, glowPulse 3s ease-in-out 13.8s infinite;">MANILA</p>
    <p style="font-family:${SF};font-size:44px;font-weight:600;color:#fff;margin:20px 0 0;letter-spacing:0.04em;opacity:0;animation:subtextIn 0.5s ease-out 13.5s forwards;">Model Search</p>
    <p style="font-family:${SF};font-size:28px;color:${TWITTER_GRAY};margin:16px 0 0;opacity:0;animation:subtextIn 0.5s ease-out 13.7s forwards;">Sign up below</p>
  </div>
  `

  return `<!DOCTYPE html>
  <html>
    <head>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { margin: 0; padding: 0; background: ${TWITTER_BG}; -webkit-font-smoothing: antialiased; }

        @keyframes tweetIn {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes chatScroll {
          ${scrollKeyframes}
        }
        .feed-scroll {
          animation: chatScroll ${TOTAL_DURATION}s ease-in-out 0s forwards;
        }

        @keyframes manilaFlash {
          0% { opacity: 0; }
          15% { opacity: 1; }
          100% { opacity: 1; }
        }

        @keyframes manilaTextIn {
          0% { opacity: 0; transform: scale(0.92); letter-spacing: 0.15em; }
          60% { opacity: 1; transform: scale(1.02); }
          100% { opacity: 1; transform: scale(1); letter-spacing: 0.08em; }
        }

        @keyframes glowPulse {
          0%, 100% { text-shadow: 0 0 30px rgba(232,68,58,0.3), 0 0 60px rgba(232,68,58,0.15); }
          50% { text-shadow: 0 0 50px rgba(232,68,58,0.5), 0 0 100px rgba(232,68,58,0.25); }
        }

        @keyframes subtextIn {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      </style>
    </head>
    <body>
      <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${TWITTER_BG};">

        ${topBar}

        <!-- Top gradient fade -->
        <div style="position:absolute;left:0;right:0;top:110px;height:40px;background:linear-gradient(180deg, ${TWITTER_BG}, transparent);z-index:15;pointer-events:none;"></div>

        <!-- Scrollable feed area -->
        <div style="position:absolute;left:0;right:0;top:110px;bottom:${SAFE_BOTTOM}px;overflow:hidden;">
          <div class="feed-scroll" style="padding-bottom:200px;">
            ${tweet1}
            ${tweet2}
            ${tweet3}
            ${reply1}
            ${reply2}
            ${reply3}
            ${reply4}
          </div>
        </div>

        <!-- Bottom gradient fade -->
        <div style="position:absolute;left:0;right:0;bottom:${SAFE_BOTTOM}px;height:80px;background:linear-gradient(0deg, ${TWITTER_BG}, transparent);z-index:15;pointer-events:none;"></div>

        <!-- Bottom nav bar -->
        <div style="position:absolute;left:0;right:0;bottom:0;height:${SAFE_BOTTOM}px;background:${TWITTER_BG};border-top:1px solid ${TWITTER_BORDER};z-index:20;display:flex;align-items:flex-start;justify-content:space-around;padding:20px 40px 0;">
          <!-- Home -->
          <div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="white"><path d="M12 1.696L.622 9.807l1.06 1.486L3 10.42V20h7v-5h4v5h7V10.42l1.308.873 1.06-1.486L12 1.696zM19 18h-4v-5H9v5H5v-9.2L12 3.781 19 8.8V18z"/></svg>
          </div>
          <!-- Search -->
          <div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="${TWITTER_GRAY}"><path d="M10.25 3.75c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5c1.795 0 3.419-.726 4.596-1.904 1.178-1.177 1.904-2.801 1.904-4.596 0-3.59-2.91-6.5-6.5-6.5zm-8.5 6.5c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5c0 1.986-.682 3.815-1.814 5.262l4.276 4.276-1.414 1.414-4.276-4.276C13.815 17.818 12 18.5 10.25 18.5c-4.694 0-8.5-3.806-8.5-8.5z"/></svg>
          </div>
          <!-- Notifications -->
          <div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="${TWITTER_GRAY}"><path d="M11.996 2c-4.62 0-8.25 3.82-8.25 8.5v.45c0 .7-.19 1.38-.54 1.98L1.34 15.98c-.63 1.09.16 2.47 1.41 2.47h18.5c1.25 0 2.04-1.38 1.41-2.47l-1.87-3.05c-.35-.6-.54-1.28-.54-1.98V10.5c0-4.68-3.63-8.5-8.25-8.5zM11.996 4c3.52 0 6.25 2.86 6.25 6.5v.45c0 1.04.28 2.06.81 2.95l1.87 3.05H3.066l1.87-3.05c.53-.89.81-1.91.81-2.95V10.5c0-3.64 2.73-6.5 6.25-6.5zM9.5 20.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5h-5z"/></svg>
          </div>
          <!-- Messages -->
          <div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="${TWITTER_GRAY}"><path d="M1.998 5.5c0-1.38 1.119-2.5 2.5-2.5h15c1.381 0 2.5 1.12 2.5 2.5v9c0 1.38-1.119 2.5-2.5 2.5H8.996l-4.5 4.5-.498-4.5h-2c-1.381 0-2.5-1.12-2.5-2.5v-9zm2.5-.5c-.276 0-.5.22-.5.5v9c0 .28.224.5.5.5h3.5l.002 2.09L9.496 15h10.002c.276 0 .5-.22.5-.5v-9c0-.28-.224-.5-.5-.5h-15z"/></svg>
          </div>
        </div>

        <!-- MANILA flash overlay -->
        ${manilaFlash}
      </div>

      <script>
        // Animate engagement counters when tweet3 appears
        function animateCounter(el, target, duration, startDelay) {
          setTimeout(() => {
            const start = performance.now()
            function tick(now) {
              const elapsed = now - start
              const progress = Math.min(elapsed / duration, 1)
              // ease out cubic
              const ease = 1 - Math.pow(1 - progress, 3)
              const val = Math.round(ease * target)
              el.textContent = val >= 1000 ? (val / 1000).toFixed(1) + 'K' : String(val)
              if (progress < 1) requestAnimationFrame(tick)
            }
            requestAnimationFrame(tick)
          }, startDelay)
        }

        // Wait for tweet3 to appear (4.5s), then start counters
        const cntReply = document.getElementById('cnt-reply')
        const cntRt = document.getElementById('cnt-rt')
        const cntLike = document.getElementById('cnt-like')
        const cntViews = document.getElementById('cnt-views')
        const cntLike2 = document.getElementById('cnt-like2')

        if (cntReply) animateCounter(cntReply, 73, 2500, 4800)
        if (cntRt) animateCounter(cntRt, 412, 2500, 4900)
        if (cntLike) animateCounter(cntLike, 3200, 3000, 5000)
        if (cntViews) animateCounter(cntViews, 142000, 3500, 5100)

        // Fast counting likes for aidan's reply (starts at 11.5s)
        if (cntLike2) animateCounter(cntLike2, 1847, 2000, 11700)
      </script>
    </body>
  </html>`
}

async function render() {
  resetOutputDir()

  const selection = {
    profilePic: 'manila-gallery-closeup-001.jpg',
    photo1: 'manila-gallery-dsc-0075.jpg',
    photo2: 'manila-gallery-graffiti-001.jpg',
    photo3: 'manila-gallery-floor-001.jpg',
  }

  const payload = {
    createdAt: new Date().toISOString(),
    strategy: 'v45 — Twitter/X viral thread animated video',
    safeBottomPixels: SAFE_BOTTOM,
    images: selection
  }
  fs.writeFileSync(path.join(OUT_DIR, 'sources.json'), JSON.stringify(payload, null, 2))

  const images = Object.fromEntries(
    Object.entries(selection).map(([key, file]) => [key, readImage(file)])
  )

  console.log('Recording Twitter/X thread animation as MP4...')

  const TOTAL_DURATION_MS = 19000

  const browser = await chromium.launch()
  const videoCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: OUT_DIR,
      size: { width: WIDTH, height: HEIGHT }
    }
  })

  const videoPage = await videoCtx.newPage()
  const html = buildTwitterThread(images)
  await videoPage.setContent(html, { waitUntil: 'load' })
  await videoPage.waitForTimeout(500)
  await videoPage.waitForTimeout(TOTAL_DURATION_MS)

  await videoPage.close()
  await videoCtx.close()

  const videoFiles = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.webm'))
  if (videoFiles.length === 0) {
    console.error('No video file was generated!')
  } else {
    const srcVideo = path.join(OUT_DIR, videoFiles[0])
    const dstVideo = path.join(OUT_DIR, '01_twitter_thread.mp4')

    const { execSync } = await import('child_process')
    try {
      execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${dstVideo}"`, {
        stdio: 'pipe'
      })
      fs.unlinkSync(srcVideo)
      console.log('Rendered 01_twitter_thread.mp4')
    } catch (err) {
      console.warn('ffmpeg not available, keeping as webm...')
      fs.renameSync(srcVideo, dstVideo)
      console.log('Rendered 01_twitter_thread.mp4 (webm container)')
    }
  }

  await browser.close()
  console.log(`Done: animated MP4 written to ${OUT_DIR}`)
}

render().catch(error => {
  console.error(error)
  process.exit(1)
})
