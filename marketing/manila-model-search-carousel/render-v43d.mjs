import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v43d')

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 410

const SF = "-apple-system, 'Helvetica Neue', Arial, sans-serif"

const BG = '#212121'
const MANILA_COLOR = '#E8443A'

const TOTAL_DURATION = 34
const TOTAL_DURATION_MS = 36000

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

// Sizing constants — BIGGER for mobile readability
const MSG_FONT = 40
const AI_FONT = 40
const THOUGHT_FONT = 28
const HEADER_FONT = 32
const ICON_FONT = 22
const PHOTO_W = 600
const PHOTO_H = 750
const PHOTO_RADIUS = 16
const AI_LEFT_MARGIN = 60

// Timing (seconds)
const T = {
  user1:     0.5,
  thinking1: 2.0,
  thought1:  3.8,
  ai1:       4.2,
  icons1:    5.5,
  photo1:    6.5,
  photo2:    8.5,
  photo3:    10.5,
  photo4:    12.5,
  photo5:    14.5,
  user2:     17.0,
  searching: 18.0,
  ai2:       19.5,
  user3:     22.0,
  ai3:       23.5,
  ctaCard:   25.0,
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
      padding:18px 24px;
    ">
      <p style="font-family:${SF};font-size:${MSG_FONT}px;color:#fff;margin:0;line-height:1.4;">${escaped}</p>
    </div>
  </div>`
}

function thinkingIndicator(id, showAt, hideAt) {
  const dur = hideAt - showAt
  return `<div id="${id}" class="msg" style="
    margin-bottom:6px;
    margin-left:${AI_LEFT_MARGIN}px;
    opacity:0;
    animation:searchingShow ${dur}s ease-out ${showAt}s forwards;
  ">
    <span class="thinking-dots" style="font-family:${SF};font-size:${THOUGHT_FONT}px;color:#9b9b9b;">
      <span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:#9b9b9b;margin-right:4px;animation:dotPulse 1s infinite 0s;"></span>
      <span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:#9b9b9b;margin-right:4px;animation:dotPulse 1s infinite 0.2s;"></span>
      <span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:#9b9b9b;animation:dotPulse 1s infinite 0.4s;"></span>
    </span>
  </div>`
}

function thoughtLabel(id, t) {
  return `<div id="${id}" class="msg" style="
    margin-bottom:6px;
    margin-left:${AI_LEFT_MARGIN}px;
    opacity:0;
    animation:msgIn 0.3s ease-out ${t}s forwards;
  ">
    <span style="font-family:${SF};font-size:${THOUGHT_FONT}px;color:#9b9b9b;">Thought for a few seconds</span>
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

function ctaCard(id, t) {
  return `<div id="${id}" class="msg" style="
    margin-left:${AI_LEFT_MARGIN}px;
    margin-right:24px;
    margin-bottom:20px;
    opacity:0;
    transform:translateY(20px);
    animation:msgIn 0.5s ease-out ${t}s forwards;
  ">
    <div style="
      background:#1a1a1a;
      border:2px solid #333;
      border-radius:24px;
      padding:40px 36px;
      text-align:center;
    ">
      <p style="
        font-family:${SF};
        font-size:110px;
        font-weight:900;
        letter-spacing:0.06em;
        color:${MANILA_COLOR};
        margin:0;
        text-transform:uppercase;
        line-height:1;
      ">MANILA</p>
      <p style="
        font-family:${SF};
        font-size:54px;
        font-weight:700;
        color:#fff;
        margin:6px 0 0;
        letter-spacing:0.12em;
        text-transform:uppercase;
        line-height:1.1;
      ">PHOTO SHOOT</p>
      <div style="width:80px;height:3px;background:${MANILA_COLOR};margin:28px auto;border-radius:2px;"></div>
      <p style="
        font-family:${SF};
        font-size:50px;
        font-weight:700;
        color:#fff;
        margin:0 0 16px;
        line-height:1.2;
      ">Sign up below.</p>
      <p style="
        font-family:${SF};
        font-size:30px;
        color:#aaa;
        margin:0 0 24px;
        line-height:1.4;
      ">It takes just a minute.<br>I'll message you back within a day.</p>
      <div style="
        display:inline-block;
        background:${MANILA_COLOR};
        border-radius:12px;
        padding:14px 32px;
      ">
        <span style="
          font-family:${SF};
          font-size:26px;
          font-weight:700;
          color:#fff;
          letter-spacing:0.04em;
          text-transform:uppercase;
        ">Limited spots this month</span>
      </div>
    </div>
  </div>`
}

function buildHTML(images) {
  const p = (t) => ((t / TOTAL_DURATION) * 100).toFixed(2)

  // Scroll calculation with BIGGER sizes:
  // Chat area visible height = 1920-80-410 = 1430px
  // Content layout estimate (all items, cumulative):
  //   user1 bubble (40px font, ~3 lines wrapping): ~180px + 12px = 192px
  //   thought label: ~40px + 6px = 46px
  //   ai1 (40px font, ~5 lines): ~290px + 6px = 296px
  //   icon row: ~36px + 18px = 54px
  //   user2 bubble: ~80px + 12px = 92px
  //   searching: ~40px + 10px = 50px
  //   ai2 (40px font, ~9 lines): ~520px + 6px = 526px
  //   photo1: 750+10 = 760px
  //   photo2: 750+10 = 760px
  //   photo3: 750+10 = 760px
  //   user3 bubble: ~80px + 12px = 92px
  //   ai3 message: ~80px + 6px = 86px
  //   CTA card: ~520px + 20px = 540px
  // Total: ~4254px + 600px padding bottom = ~4854px
  // Max scroll = 4854 - 1430 = ~3424px
  //
  // Progressive scroll:
  // Before photos (up to ai2): 192+46+296+54+92+50+526 = 1256px -> no scroll yet (fits in 1430)
  // After photo1 (9.0s): 1256+760 = 2016px -> need scroll 2016-1430 = 586px -> scroll ~200px (partial, photo coming in)
  // After photo2 (9.6s): 2776px -> need ~1346px
  // After photo3 (10.2s): 3536px -> need ~2106px
  // After user3 (12.0s): 3628px -> need ~2198px
  // After ai3 (13.5s): 3714px -> need ~2284px
  // After CTA card (14.5s): 4254px -> need ~2824px

  // Photos come right after ai1 — scroll to keep them visible
  const scrollKeyframes = `
    0% { transform: translateY(0); }
    ${p(5.5)}% { transform: translateY(0); }
    ${p(7)}% { transform: translateY(-300px); }
    ${p(9)}% { transform: translateY(-1000px); }
    ${p(11)}% { transform: translateY(-1700px); }
    ${p(13)}% { transform: translateY(-2400px); }
    ${p(15)}% { transform: translateY(-3100px); }
    ${p(17.5)}% { transform: translateY(-3500px); }
    ${p(20)}% { transform: translateY(-3800px); }
    ${p(24)}% { transform: translateY(-4200px); }
    100% { transform: translateY(-4200px); }
  `

  const allMessages = [
    userBubble('i\'m bored, what should I do this week?', 'm-user1', T.user1),
    thinkingIndicator('m-thinking1', T.thinking1, T.thought1),
    thoughtLabel('m-thought1', T.thought1),
    aiMessage('Are you in Manila? There\'s a photographer in town this week doing free photo collabs. Let me show you his work.', 'm-ai1', T.ai1),
    inlinePhoto(images.photo1, 'm-photo1', T.photo1),
    inlinePhoto(images.photo2, 'm-photo2', T.photo2),
    inlinePhoto(images.photo3, 'm-photo3', T.photo3),
    inlinePhoto(images.photo4, 'm-photo4', T.photo4),
    inlinePhoto(images.photo5, 'm-photo5', T.photo5),
    userBubble('wait, how does it work?', 'm-user2', T.user2),
    searchingStatus('m-searching', T.searching, T.ai2),
    aiMessage('You sign up, he messages you to plan the date and vibe, you show up, he directs everything — posing, angles, all of it. Then you get your edited photos back within a week.', 'm-ai2', T.ai2),
    userBubble('oh cool, how do I sign up?', 'm-user3', T.user3),
    aiMessage('Ahh that\'s the easy part. All you have to do is click below!!', 'm-ai3', T.ai3),
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
      @keyframes dotPulse {
        0%, 60%, 100% { opacity: 0.3; transform: scale(1); }
        30% { opacity: 1; transform: scale(1.3); }
      }
      @keyframes chatScroll {
        ${scrollKeyframes}
      }
      .chat-scroll {
        animation: chatScroll ${TOTAL_DURATION}s ease-in-out 0s forwards;
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
          Thinking <span style="color:#aaa;font-size:24px;">&rsaquo;</span>
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

    </div>
  </body>
</html>`
}

async function render() {
  resetOutputDir()

  const selection = {
    photo1: 'manila-gallery-dsc-0190.jpg',
    photo2: 'manila-gallery-night-001.jpg',
    photo3: 'manila-gallery-garden-002.jpg',
    photo4: 'manila-gallery-urban-001.jpg',
    photo5: 'manila-gallery-dsc-0075.jpg',
  }

  const images = Object.fromEntries(
    Object.entries(selection).map(([key, file]) => [key, readImage(file)])
  )

  fs.writeFileSync(
    path.join(OUT_DIR, 'sources.json'),
    JSON.stringify({ createdAt: new Date().toISOString(), strategy: 'v43d — ChatGPT UI animated conversation (are you in manila copy)', images: selection }, null, 2)
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
  await videoPage.evaluate((bg) => { document.documentElement.style.background = bg; document.body.style.background = bg; }, BG)
  await videoPage.setContent(html, { waitUntil: 'load' })
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
