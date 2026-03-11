import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v43')

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 410

const SF = "-apple-system, 'Helvetica Neue', Arial, sans-serif"

const BG = '#212121'
const MANILA_COLOR = '#E8443A'

const TOTAL_DURATION = 18
const TOTAL_DURATION_MS = 20000

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

// Sizing constants matching spec
const MSG_FONT = 26
const AI_FONT = 26
const THOUGHT_FONT = 20
const HEADER_FONT = 22
const ICON_FONT = 16
const PHOTO_W = 400
const PHOTO_H = 530
const PHOTO_RADIUS = 16
const AI_LEFT_MARGIN = 60

// Timing (seconds)
const T = {
  user1:    0.5,
  thought1: 2.0,
  ai1:      2.5,
  icons1:   3.5,
  user2:    5.0,
  searching: 6.0,
  ai2:      7.0,
  photo1:   9.0,
  photo2:   9.6,
  photo3:   10.2,
  user3:    12.0,
  manila:   13.5,
}

function userBubble(text, id, t) {
  const escaped = text.replace(/\n/g, '<br>')
  return `<div id="${id}" class="msg" style="
    display:flex;
    justify-content:flex-end;
    margin-bottom:12px;
    opacity:0;
    transform:translateY(16px);
    animation:msgIn 0.35s ease-out ${t}s forwards;
  ">
    <div style="
      max-width:76%;
      background:#2f2f2f;
      border:1px solid #424242;
      border-radius:20px;
      padding:14px 20px;
    ">
      <p style="font-family:${SF};font-size:${MSG_FONT}px;color:#fff;margin:0;line-height:1.4;">${escaped}</p>
    </div>
  </div>`
}

function thoughtLabel(id, t) {
  return `<div id="${id}" class="msg" style="
    margin-bottom:6px;
    margin-left:${AI_LEFT_MARGIN}px;
    opacity:0;
    animation:msgIn 0.3s ease-out ${t}s forwards;
  ">
    <span style="font-family:${SF};font-size:${THOUGHT_FONT}px;color:#9b9b9b;">Thought for a couple of seconds</span>
  </div>`
}

function aiMessage(text, id, t) {
  const escaped = text.replace(/\n/g, '<br>')
  return `<div id="${id}" class="msg" style="
    margin-left:${AI_LEFT_MARGIN}px;
    margin-bottom:6px;
    opacity:0;
    transform:translateY(16px);
    animation:msgIn 0.35s ease-out ${t}s forwards;
  ">
    <p style="font-family:${SF};font-size:${AI_FONT}px;color:#fff;margin:0;line-height:1.45;">${escaped}</p>
  </div>`
}

function iconRow(id, t) {
  return `<div id="${id}" class="msg" style="
    margin-left:${AI_LEFT_MARGIN}px;
    margin-bottom:18px;
    opacity:0;
    animation:msgIn 0.3s ease-out ${t}s forwards;
  ">
    <span style="font-family:${SF};font-size:${ICON_FONT}px;color:#666;letter-spacing:4px;">&#128203; &#128266; &#128077; &#128078; &bull;&bull;&bull;</span>
  </div>`
}

function searchingStatus(id, t, hideAt) {
  const dur = hideAt - t
  return `<div id="${id}" class="msg" style="
    margin-left:${AI_LEFT_MARGIN}px;
    margin-bottom:10px;
    opacity:0;
    animation:searchingShow ${dur}s ease-out ${t}s forwards;
  ">
    <span class="searching-text" style="font-family:${SF};font-size:${THOUGHT_FONT}px;color:#9b9b9b;">Searching Manila model opportunities &gt;</span>
  </div>`
}

function inlinePhoto(src, id, t) {
  return `<div id="${id}" class="msg" style="
    margin-left:${AI_LEFT_MARGIN}px;
    margin-bottom:10px;
    opacity:0;
    transform:scale(0.88);
    animation:photoIn 0.4s cubic-bezier(0.34,1.56,0.64,1) ${t}s forwards;
  ">
    <div style="width:${PHOTO_W}px;height:${PHOTO_H}px;border-radius:${PHOTO_RADIUS}px;overflow:hidden;">
      <img src="${src}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center 20%;"/>
    </div>
  </div>`
}

function buildHTML(images) {
  const p = (t) => ((t / TOTAL_DURATION) * 100).toFixed(2)

  // Scroll calculation:
  // Chat area top: 80px, bottom: SAFE_BOTTOM (410px) => visible height = 1920-80-410 = 1430px
  // Content layout estimate (all items, cumulative):
  //   user1 bubble: ~70px + 12px margin = 82px
  //   thought label: ~30px + 6px = 36px
  //   ai1 (4 lines, ~34px/line = 136px) + 6px = 142px
  //   icon row: ~28px + 18px = 46px
  //   user2 bubble: ~70px + 12px = 82px
  //   searching: ~30px + 10px = 40px
  //   ai2 (7 lines ~238px) + 6px = 244px
  //   "Here are recent shots:" label: included in ai2
  //   photo1: 530+10 = 540px
  //   photo2: 530+10 = 540px
  //   photo3: 530+10 = 540px
  //   user3 bubble: ~70px + 12px = 82px
  // Total: ~2394px + 300px padding bottom = ~2694px
  // Max scroll = 2694 - 1430 = ~1264px
  // We scroll progressively as content appears:
  // At T.photo1 (9.0): content up to ai2 ~ 672px, visible=1430, no scroll needed
  // At T.photo1 complete (9.0): scroll ~0
  // At T.photo2 (9.6): photo1 now showing, content bottom ~1212px, scroll to show bottom = max(0, 1212-1430) = 0
  // At T.photo3 (10.2): content bottom ~1752px, need scroll ~322px
  // After T.photo3: content bottom ~2292px, need scroll ~862px
  // At T.user3 (12.0): content bottom ~2374px, need scroll ~944px
  // After MANILA: keep scrolled

  const scrollKeyframes = `
    0% { transform: translateY(0); }
    ${p(8.5)}% { transform: translateY(0); }
    ${p(9.6)}% { transform: translateY(-80px); }
    ${p(10.2)}% { transform: translateY(-620px); }
    ${p(11.0)}% { transform: translateY(-1160px); }
    ${p(12.0)}% { transform: translateY(-1260px); }
    ${p(T.manila)}% { transform: translateY(-1260px); }
    100% { transform: translateY(-1260px); }
  `

  const allMessages = [
    userBubble('I want professional photos taken in Manila but I\'ve never modeled. What should I do?', 'm-user1', T.user1),
    thoughtLabel('m-thought1', T.thought1),
    aiMessage('Here\'s what I\'d recommend:<br><br>1. Find a photographer who directs<br>2. Look for open model calls<br>3. Don\'t worry about experience', 'm-ai1', T.ai1),
    iconRow('m-icons1', T.icons1),
    userBubble('know anyone doing this right now?', 'm-user2', T.user2),
    searchingStatus('m-searching', T.searching, T.ai2),
    aiMessage('@madebyaidan is running a Manila Model Search<br><br>&bull; Sign up (60 second form)<br>&bull; He plans date + vibe with you<br>&bull; Show up — he directs everything<br>&bull; Edited photos in a week<br><br>Here are recent shots:', 'm-ai2', T.ai2),
    inlinePhoto(images.photo1, 'm-photo1', T.photo1),
    inlinePhoto(images.photo2, 'm-photo2', T.photo2),
    inlinePhoto(images.photo3, 'm-photo3', T.photo3),
    userBubble('signing up right now', 'm-user3', T.user3),
  ].join('\n')

  return `<!DOCTYPE html>
<html>
  <head>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      html, body { margin: 0; padding: 0; background: ${BG}; -webkit-font-smoothing: antialiased; }

      @keyframes msgIn {
        0%   { opacity: 0; transform: translateY(16px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      @keyframes photoIn {
        0%   { opacity: 0; transform: scale(0.88); }
        100% { opacity: 1; transform: scale(1); }
      }
      @keyframes searchingShow {
        0%   { opacity: 0; }
        5%   { opacity: 1; }
        85%  { opacity: 1; }
        100% { opacity: 0; }
      }
      @keyframes shimmer {
        0%   { opacity: 0.5; }
        50%  { opacity: 1; }
        100% { opacity: 0.5; }
      }
      .searching-text {
        animation: shimmer 1.2s ease-in-out infinite;
      }
      @keyframes thinkingDots {
        0%, 20%  { content: 'Thinking'; }
        40%      { content: 'Thinking.'; }
        60%      { content: 'Thinking..'; }
        80%,100% { content: 'Thinking...'; }
      }
      @keyframes chatScroll {
        ${scrollKeyframes}
      }
      .chat-scroll {
        animation: chatScroll ${TOTAL_DURATION}s ease-in-out 0s forwards;
      }
      @keyframes manilaFlash {
        0%   { opacity: 0; }
        15%  { opacity: 1; }
        100% { opacity: 1; }
      }
      .manila-flash {
        opacity: 0;
        animation: manilaFlash 0.5s ease-out ${T.manila}s forwards;
      }
      @keyframes manilaTextIn {
        0%   { opacity: 0; transform: scale(0.92); letter-spacing: 0.15em; }
        60%  { opacity: 1; transform: scale(1.02); }
        100% { opacity: 1; transform: scale(1); letter-spacing: 0.08em; }
      }
      @keyframes glowPulse {
        0%, 100% { text-shadow: 0 0 30px rgba(232,68,58,0.3), 0 0 60px rgba(232,68,58,0.15); }
        50%       { text-shadow: 0 0 50px rgba(232,68,58,0.5), 0 0 100px rgba(232,68,58,0.25); }
      }
      @keyframes subtextIn {
        0%   { opacity: 0; transform: translateY(10px); }
        100% { opacity: 1; transform: translateY(0); }
      }
    </style>
  </head>
  <body>
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${BG};">

      <!-- ChatGPT header bar -->
      <div style="
        position:absolute;
        left:0;right:0;top:0;
        height:80px;
        padding:0 28px;
        display:flex;
        align-items:center;
        background:${BG};
        border-bottom:1px solid #2e2e2e;
        z-index:20;
      ">
        <span style="font-family:${SF};font-size:${HEADER_FONT}px;font-weight:500;color:#fff;letter-spacing:0.01em;">
          ChatGPT 5.4 Thinking <span style="color:#aaa;font-size:18px;">&rsaquo;</span>
        </span>
      </div>

      <!-- Top gradient fade -->
      <div style="position:absolute;left:0;right:0;top:80px;height:40px;background:linear-gradient(180deg,${BG},transparent);z-index:15;pointer-events:none;"></div>

      <!-- Scrollable chat area -->
      <div style="position:absolute;left:0;right:0;top:80px;bottom:${SAFE_BOTTOM}px;overflow:hidden;">
        <div class="chat-scroll" style="padding:24px 24px 600px;">
          ${allMessages}
        </div>
      </div>

      <!-- Bottom gradient fade -->
      <div style="position:absolute;left:0;right:0;bottom:${SAFE_BOTTOM}px;height:60px;background:linear-gradient(0deg,${BG},transparent);z-index:15;pointer-events:none;"></div>

      <!-- MANILA flash overlay -->
      <div class="manila-flash" style="
        position:absolute;inset:0;
        display:flex;flex-direction:column;
        align-items:center;justify-content:center;
        background:${BG};
        z-index:30;
        pointer-events:none;
      ">
        <p style="
          font-family:${SF};
          font-size:160px;
          font-weight:900;
          letter-spacing:0.08em;
          color:${MANILA_COLOR};
          margin:0;
          text-transform:uppercase;
          opacity:0;
          animation:manilaTextIn 0.7s cubic-bezier(0.16,1,0.3,1) ${T.manila + 0.1}s forwards, glowPulse 3s ease-in-out ${T.manila + 0.8}s infinite;
        ">MANILA</p>
        <p style="
          font-family:${SF};
          font-size:40px;
          font-weight:600;
          color:#fff;
          margin:20px 0 0;
          letter-spacing:0.04em;
          opacity:0;
          animation:subtextIn 0.5s ease-out ${T.manila + 0.5}s forwards;
        ">Model Search</p>
        <p style="
          font-family:${SF};
          font-size:26px;
          color:#9b9b9b;
          margin:14px 0 0;
          opacity:0;
          animation:subtextIn 0.5s ease-out ${T.manila + 0.7}s forwards;
        ">Sign up below</p>
      </div>

    </div>
  </body>
</html>`
}

async function render() {
  resetOutputDir()

  const selection = {
    photo1: 'manila-gallery-dsc-0075.jpg',
    photo2: 'manila-gallery-graffiti-001.jpg',
    photo3: 'manila-gallery-floor-001.jpg',
  }

  const images = Object.fromEntries(
    Object.entries(selection).map(([key, file]) => [key, readImage(file)])
  )

  fs.writeFileSync(
    path.join(OUT_DIR, 'sources.json'),
    JSON.stringify({ createdAt: new Date().toISOString(), strategy: 'v43 — ChatGPT UI animated conversation', images: selection }, null, 2)
  )

  console.log('Recording ChatGPT-style animated conversation as MP4...')

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
  const html = buildHTML(images)
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
    const dstVideo = path.join(OUT_DIR, '01_dm_full_story.mp4')

    const { execSync } = await import('child_process')
    try {
      execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${dstVideo}"`, {
        stdio: 'pipe'
      })
      fs.unlinkSync(srcVideo)
      console.log('Rendered 01_dm_full_story.mp4')
    } catch (err) {
      console.warn('ffmpeg not available, keeping as webm...')
      fs.renameSync(srcVideo, dstVideo)
      console.log('Rendered 01_dm_full_story.mp4 (webm container)')
    }
  }

  await browser.close()
  console.log(`Done: animated MP4 written to ${OUT_DIR}`)
}

render().catch(error => {
  console.error(error)
  process.exit(1)
})
