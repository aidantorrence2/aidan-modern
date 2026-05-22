import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/faves')
const OUT_DIR = path.join(__dirname, "output-84b")

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 430
const SAFE_TOP = 213
const SAFE_LEFT = 66
const SAFE_RIGHT = 1027

const SF = "-apple-system, 'Helvetica Neue', Arial, sans-serif"

const BG = '#212121'
const BALI_COLOR = '#0D9488'

const TOTAL_DURATION = 40
const TOTAL_DURATION_MS = 42000

// Mystery box photos — rapid fire at the end
const MYSTERY_PHOTOS = [
  '000001-4.jpg', '000005-11.jpg', '000009-7.jpg',
  '000013-3.jpg', '000015-3.jpg', '000017-9.jpg',
  '000022.jpg', '000025-4.jpg', '000027.jpg',
  '000035-2.jpg', '000039.jpg', '000042-5.jpg',
  '000062.jpg', '000068-2.jpg', '0017_17.jpg',
]

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

// Sizing constants
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
  user1:     0.15,
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
    <span class="searching-text" style="font-family:${SF};font-size:${THOUGHT_FONT}px;color:#9b9b9b;">Searching Bali model collaborations &gt;</span>
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

function ctaText(id, t) {
  return `<div id="${id}" class="msg" style="
    margin-left:${AI_LEFT_MARGIN}px;
    margin-bottom:6px;
    opacity:0;
    transform:translateY(16px);
    animation:msgIn 0.35s ease-out ${t}s forwards;
  ">
    <p style="font-family:${SF};font-size:${AI_FONT}px;color:#fff;margin:0;line-height:1.45;">Click the link below to sign up 👇</p>
  </div>`
}

function buildHTML(images, mysteryImages) {
  const p = (t) => ((t / TOTAL_DURATION) * 100).toFixed(2)

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
    userBubble('what are some cool things to do in Bali?', 'm-user1', T.user1),
    thinkingIndicator('m-thinking1', T.thinking1, T.thought1),
    thoughtLabel('m-thought1', T.thought1),
    aiMessage('There\'s actually a photographer in Bali right now doing model collaborations and TFP shoots. Here\'s some of his work:', 'm-ai1', T.ai1),
    inlinePhoto(images.photo1, 'm-photo1', T.photo1),
    inlinePhoto(images.photo2, 'm-photo2', T.photo2),
    inlinePhoto(images.photo3, 'm-photo3', T.photo3),
    inlinePhoto(images.photo4, 'm-photo4', T.photo4),
    inlinePhoto(images.photo5, 'm-photo5', T.photo5),
    userBubble('wait, how does it work?', 'm-user2', T.user2),
    searchingStatus('m-searching', T.searching, T.ai2),
    aiMessage('You sign up via the link, the photographer plans the shoot with you, you show up, and you get your edited photos back within a week.', 'm-ai2', T.ai2),
    userBubble('oh cool, how do I sign up?', 'm-user3', T.user3),
    aiMessage('Just click the link below to sign up!', 'm-ai3', T.ai3),
    ctaText('m-cta', T.ctaCard),
  ].join('\n')

  const PHONE_LEFT = 30
  const PHONE_RIGHT = 30

  return `<!DOCTYPE html>
<html>
  <head>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      html, body { margin: 0; padding: 0; background: #000; -webkit-font-smoothing: antialiased; }

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

      /* Phone frame — no editorial header, starts from safe top */
      .phone-frame {
        position: absolute;
        top: ${SAFE_TOP}px;
        left: ${PHONE_LEFT}px;
        right: ${PHONE_RIGHT}px;
        bottom: 0;
        border-radius: 24px 24px 0 0;
        overflow: hidden;
        z-index: 5;
        border: 2px solid rgba(255,255,255,0.1);
        border-bottom: none;
        background: ${BG};
      }
    </style>
  </head>
  <body>
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#000;">

      <!-- Black fill above phone frame (safe zone) -->
      <div style="position:absolute;top:0;left:0;right:0;height:${SAFE_TOP}px;background:#000;z-index:31;"></div>

      <!-- Phone frame containing ChatGPT UI — no editorial header -->
      <div class="phone-frame">

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
          <div class="chat-scroll" style="padding:200px 60px 600px;">
            ${allMessages}
          </div>
        </div>

        <!-- Bottom gradient fade -->
        <div style="position:absolute;left:0;right:0;bottom:${SAFE_BOTTOM}px;height:60px;background:linear-gradient(0deg,${BG},transparent);z-index:15;pointer-events:none;"></div>

      </div>

      <!-- Mystery box photo cascade overlay -->
      <div id="mystery-box" style="position:absolute;inset:0;z-index:100;pointer-events:none;background:#000;opacity:0;">
        ${mysteryImages.map((src, i) => {
          const startTime = (27 + (i * 0.35)).toFixed(2)
          const isLast = i === mysteryImages.length - 1
          const hideTime = (27 + ((i + 1) * 0.35)).toFixed(2)
          return '<img class="mbox-img" src="' + src + '" style="position:absolute;inset:40px;width:1000px;height:1840px;object-fit:cover;object-position:center top;border-radius:16px;opacity:0;animation:mboxIn 0.2s ease-out ' + startTime + 's forwards' + (isLast ? '' : ', mboxOut 0.1s ease-in ' + hideTime + 's forwards') + ';"/>'
        }).join('\n')}
        <!-- Persistent CTA text on top -->
        <div style="position:absolute;bottom:${SAFE_BOTTOM + 60}px;left:0;right:0;text-align:center;z-index:110;opacity:0;animation:mboxIn 0.3s ease-out 27s forwards;">
          <p style="font-family:${SF};font-size:52px;font-weight:800;color:#fff;margin:0;text-shadow:0 4px 20px rgba(0,0,0,0.95),0 0 80px rgba(0,0,0,0.8);">Click the link to sign up</p>
        </div>
      </div>

    </div>

    <style>
      @keyframes mboxIn {
        0%   { opacity: 0; transform: scale(0.85); }
        100% { opacity: 1; transform: scale(1); }
      }
      @keyframes mboxOut {
        0%   { opacity: 1; }
        100% { opacity: 0; }
      }
      #mystery-box {
        animation: mboxIn 0.01s linear 26.5s forwards;
      }
    </style>
  </body>
</html>`
}

async function render() {
  resetOutputDir()

  const selection = {
    photo1: '000005-3.jpg',
    photo2: '000016.jpg',
    photo3: '000008-3-2.jpg',
    photo4: '000023.jpg',
    photo5: '000025.jpg',
  }

  const images = Object.fromEntries(
    Object.entries(selection).map(([key, file]) => [key, readImage(file)])
  )

  fs.writeFileSync(
    path.join(OUT_DIR, 'sources.json'),
    JSON.stringify({ createdAt: new Date().toISOString(), strategy: 'v84b — Bali model collab ChatGPT DM, no header, sign-up CTA', images: selection }, null, 2)
  )

  console.log('Recording Bali model collab ChatGPT-style animated conversation as MP4...')

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
  await videoPage.setContent(`<html><head><style>*{background:${BG}}</style></head><body></body></html>`, { waitUntil: 'load' })
  await videoPage.waitForTimeout(100)
  // Load mystery box photos
  const mysteryImages = MYSTERY_PHOTOS.map(name => readImage(name))
  console.log(`Loaded ${mysteryImages.length} mystery box photos`)

  const html = buildHTML(images, mysteryImages)
  await videoPage.setContent(html, { waitUntil: 'load' })
  await videoPage.waitForTimeout(TOTAL_DURATION_MS)

  await videoPage.close()
  await videoCtx.close()

  const videoFiles = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.webm'))
  if (videoFiles.length === 0) {
    console.error('No video file was generated!')
  } else {
    const srcVideo = path.join(OUT_DIR, videoFiles[0])
    const dstVideo = path.join(OUT_DIR, '84b-bali-dm-mystery.mp4')

    const { execSync } = await import('child_process')
    try {
      execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${dstVideo}"`, {
        stdio: 'pipe'
      })
      fs.unlinkSync(srcVideo)
      console.log('Rendered 01_bali_dm_story.mp4')
    } catch (err) {
      console.warn('ffmpeg not available, keeping as webm...')
      fs.renameSync(srcVideo, dstVideo)
      console.log('Rendered 01_bali_dm_story.mp4 (webm container)')
    }
  }

  await browser.close()
  console.log(`Done: animated MP4 written to ${OUT_DIR}`)
}

render().catch(error => {
  console.error(error)
  process.exit(1)
})
