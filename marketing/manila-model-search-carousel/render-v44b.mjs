import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v44b')

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 410

const SF = "-apple-system, 'Helvetica Neue', Arial, sans-serif"

const BG = '#000000'
const MANILA_COLOR = '#E8443A'
const IMSG_BLUE = '#0B93F6'
const IMSG_RECV = '#262628'
const IMSG_GRAY = '#8E8E93'

const COLOR_MIA = '#FF6B8A'
const COLOR_LUNA = '#9B59B6'
const COLOR_AVA = '#27AE60'

const PHOTOS = [
  'manila-gallery-dsc-0075.jpg',
  'manila-gallery-night-001.jpg',
  'manila-gallery-garden-002.jpg',
  'manila-gallery-urban-001.jpg',
  'manila-gallery-canal-001.jpg',
]

const TOTAL_DURATION = 22
const TOTAL_DURATION_MS = 24000

// Message timing
const T = {
  msg1:   0.5,   // Mia: "ok wait you guys need to see this"
  msg2:   1.8,   // Mia: photo
  msg3:   3.3,   // Luna: "WHO took this"
  msg4:   4.0,   // Mia: "some photographer doing free shoots in manila"
  msg5:   5.2,   // Mia: "like actually free"
  msg6:   6.0,   // Ava: "??? how"
  msg7:   6.8,   // Mia: "you just message him on IG"
  msg8:   7.5,   // Mia: "@madebyaidan"
  msg9:   8.5,   // Mia: photo 2
  msg10:  10.0,  // Luna: "ok these are actually insane"
  msg11:  10.8,  // Luna: photo 3
  react1: 11.8,  // ❤️ Ava loved
  msg12:  12.3,  // Ava: "wait do you need experience"
  msg13:  13.2,  // Mia: "no he directs everything"
  msg14:  13.8,  // Mia: "posing, angles, all of it"
  msg15:  14.8,  // Sofia (sent): "I'm messaging him rn"
  react2: 15.3,  // ‼️ Luna emphasized
  msg16:  15.8,  // Ava: "SAME"
  react3: 16.3,  // ❤️ Mia loved
  msg17:  16.8,  // Luna: "we're literally all doing this"
  msg18:  17.5,  // Mia: "dm him!! @madebyaidan"
  // Hold 17.5-22s
}

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
  const AVATAR_SIZE = 48
  const GAP = 10

  function avatar(color, name) {
    return `<div style="width:${AVATAR_SIZE}px;height:${AVATAR_SIZE}px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
      <span style="font-family:${SF};font-size:20px;font-weight:700;color:#fff;">${name[0]}</span>
    </div>`
  }

  function recv(name, color, text, id, t, showAvatar = true) {
    const av = showAvatar ? avatar(color, name) : `<div style="width:${AVATAR_SIZE}px;flex-shrink:0;"></div>`
    const label = showAvatar ? `<span style="font-family:${SF};font-size:18px;color:${IMSG_GRAY};display:block;margin-bottom:4px;">${name}</span>` : ''
    return `<div id="${id}" class="msg" style="display:flex;align-items:flex-end;gap:${GAP}px;margin-bottom:6px;opacity:0;transform:translateY(18px);animation:msgIn 0.35s ease-out ${t}s forwards;">
      ${av}
      <div style="max-width:72%;">
        ${label}
        <div style="background:${IMSG_RECV};border-radius:20px 20px 20px 4px;padding:14px 20px;">
          <p style="font-family:${SF};font-size:28px;color:#fff;margin:0;line-height:1.35;">${text}</p>
        </div>
      </div>
    </div>`
  }

  function sent(text, id, t) {
    return `<div id="${id}" class="msg" style="display:flex;justify-content:flex-end;margin-bottom:6px;opacity:0;transform:translateY(18px);animation:msgIn 0.35s ease-out ${t}s forwards;">
      <div style="max-width:72%;background:${IMSG_BLUE};border-radius:20px 20px 4px 20px;padding:14px 20px;">
        <p style="font-family:${SF};font-size:28px;color:#fff;margin:0;line-height:1.35;">${text}</p>
      </div>
    </div>`
  }

  function recvPhoto(src, name, color, id, t) {
    return `<div id="${id}" class="msg" style="display:flex;align-items:flex-end;gap:${GAP}px;margin-bottom:6px;opacity:0;transform:scale(0.88);animation:photoIn 0.4s cubic-bezier(0.34,1.56,0.64,1) ${t}s forwards;">
      ${avatar(color, name)}
      <div style="max-width:72%;">
        <span style="font-family:${SF};font-size:18px;color:${IMSG_GRAY};display:block;margin-bottom:4px;">${name}</span>
        <div style="width:420px;height:420px;border-radius:18px;overflow:hidden;">
          <img src="${src}" style="width:100%;height:100%;object-fit:cover;object-position:center 20%;display:block;"/>
        </div>
      </div>
    </div>`
  }

  function tapback(emoji, label, id, t) {
    return `<div id="${id}" class="msg" style="display:flex;align-items:center;gap:${GAP}px;margin-bottom:8px;margin-left:${AVATAR_SIZE + GAP}px;opacity:0;transform:scale(0.5);animation:reactPop 0.3s cubic-bezier(0.34,1.56,0.64,1) ${t}s forwards;">
      <div style="background:#1C1C1E;border:1px solid #3A3A3C;border-radius:14px;padding:5px 12px;display:flex;align-items:center;gap:6px;">
        <span style="font-size:22px;">${emoji}</span>
        <span style="font-family:${SF};font-size:18px;color:${IMSG_GRAY};">${label}</span>
      </div>
    </div>`
  }

  const p = (t) => ((t / TOTAL_DURATION) * 100).toFixed(1)

  const scrollKf = `
    0% { transform: translateY(0); }
    ${p(2)}% { transform: translateY(0); }
    ${p(3.5)}% { transform: translateY(-100px); }
    ${p(5)}% { transform: translateY(-250px); }
    ${p(6.5)}% { transform: translateY(-400px); }
    ${p(8)}% { transform: translateY(-550px); }
    ${p(9)}% { transform: translateY(-700px); }
    ${p(10.5)}% { transform: translateY(-900px); }
    ${p(11.5)}% { transform: translateY(-1300px); }
    ${p(12.5)}% { transform: translateY(-1500px); }
    ${p(14)}% { transform: translateY(-1700px); }
    ${p(15.5)}% { transform: translateY(-1900px); }
    ${p(17)}% { transform: translateY(-2050px); }
    ${p(18)}% { transform: translateY(-2200px); }
    100% { transform: translateY(-2200px); }
  `

  const allMessages = [
    recv('Mia', COLOR_MIA, 'ok wait you guys NEED to see this', 'm1', T.msg1, true),
    recvPhoto(imageDataMap[PHOTOS[0]], 'Mia', COLOR_MIA, 'm2', T.msg2),
    recv('Luna', COLOR_LUNA, 'WHO took this 😳', 'm3', T.msg3, true),
    recv('Mia', COLOR_MIA, 'some photographer doing free shoots in manila', 'm4', T.msg4, true),
    recv('Mia', COLOR_MIA, 'like actually free', 'm5', T.msg5, false),
    recv('Ava', COLOR_AVA, '??? how', 'm6', T.msg6, true),
    recv('Mia', COLOR_MIA, 'you just message him on IG', 'm7', T.msg7, true),
    recv('Mia', COLOR_MIA, '<span style="color:#0A84FF;">@madebyaidan</span>', 'm8', T.msg8, false),
    recvPhoto(imageDataMap[PHOTOS[1]], 'Mia', COLOR_MIA, 'm9', T.msg9),
    recv('Luna', COLOR_LUNA, 'ok these are actually insane', 'm10', T.msg10, true),
    recvPhoto(imageDataMap[PHOTOS[2]], 'Luna', COLOR_LUNA, 'm11', T.msg11),
    tapback('❤️', 'Ava loved', 'r1', T.react1),
    recv('Ava', COLOR_AVA, 'wait do you need experience', 'm12', T.msg12, true),
    recv('Mia', COLOR_MIA, 'no he directs everything', 'm13', T.msg13, true),
    recv('Mia', COLOR_MIA, 'posing, angles, all of it. you just show up', 'm14', T.msg14, false),
    sent("I'm messaging him rn", 'm15', T.msg15),
    tapback('‼️', 'Luna emphasized', 'r2', T.react2),
    recv('Ava', COLOR_AVA, 'SAME', 'm16', T.msg16, true),
    tapback('❤️', 'Mia loved', 'r3', T.react3),
    recv('Luna', COLOR_LUNA, "we're literally all doing this 😭", 'm17', T.msg17, true),
    recv('Mia', COLOR_MIA, 'dm him!! <span style="color:#0A84FF;">@madebyaidan</span>', 'm18', T.msg18, true),
  ].join('\n')

  return `<!DOCTYPE html>
<html>
<head>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { margin: 0; padding: 0; background: #000; -webkit-font-smoothing: antialiased; }

  @keyframes msgIn {
    0% { opacity: 0; transform: translateY(18px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  @keyframes photoIn {
    0% { opacity: 0; transform: scale(0.88); }
    100% { opacity: 1; transform: scale(1); }
  }
  @keyframes reactPop {
    0% { opacity: 0; transform: scale(0.5); }
    100% { opacity: 1; transform: scale(1); }
  }
  @keyframes chatScroll {
    ${scrollKf}
  }
  .chat-scroll {
    animation: chatScroll ${TOTAL_DURATION}s ease-in-out forwards;
  }
</style>
</head>
<body>
  <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#000;">

    <!-- Editorial header -->
    <div style="position:absolute;top:0;left:0;right:0;height:200px;z-index:50;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#000;">
      <div style="width:80%;height:1px;background:rgba(255,255,255,0.3);margin-bottom:20px;"></div>
      <p style="font-family:Georgia,'Times New Roman',serif;font-size:72px;font-weight:700;font-style:italic;letter-spacing:6px;text-transform:uppercase;color:#fff;text-align:center;margin:0;">MANILA</p>
      <span style="font-family:${SF};font-size:22px;font-weight:500;letter-spacing:8px;text-transform:uppercase;color:rgba(255,255,255,0.5);margin-top:10px;">Free Photo Shoot</span>
      <div style="width:80%;height:1px;background:rgba(255,255,255,0.3);margin-top:20px;"></div>
    </div>

    <!-- Phone frame -->
    <div style="position:absolute;top:200px;left:30px;right:30px;bottom:0;border-radius:24px 24px 0 0;overflow:hidden;z-index:5;border:2px solid rgba(255,255,255,0.1);border-bottom:none;">

      <!-- Status bar -->
      <div style="position:absolute;left:0;right:0;top:0;height:54px;padding:14px 36px 0;display:flex;align-items:center;justify-content:space-between;z-index:20;">
        <span style="font-family:${SF};font-size:20px;font-weight:600;color:#fff;">9:41</span>
        <div style="display:flex;align-items:center;gap:7px;">
          <svg width="20" height="14" viewBox="0 0 18 12"><rect x="0" y="3" width="3" height="9" rx="1" fill="#fff"/><rect x="5" y="2" width="3" height="10" rx="1" fill="#fff"/><rect x="10" y="0" width="3" height="12" rx="1" fill="#fff"/><rect x="15" y="0" width="3" height="12" rx="1" fill="#fff" opacity="0.3"/></svg>
          <svg width="30" height="15" viewBox="0 0 27 13"><rect x="0" y="0" width="23" height="13" rx="3.5" stroke="#fff" stroke-width="1" fill="none"/><rect x="2" y="2" width="18" height="9" rx="2" fill="#fff"/></svg>
        </div>
      </div>

      <!-- iMessage header -->
      <div style="position:absolute;left:0;right:0;top:54px;height:100px;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:20;background:${BG};border-bottom:1px solid #2C2C2E;">
        <div style="position:absolute;left:20px;top:50%;transform:translateY(-50%);">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="${IMSG_BLUE}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <div style="position:absolute;right:20px;top:50%;transform:translateY(-50%);display:flex;">
          ${[['M',COLOR_MIA],['L',COLOR_LUNA],['A',COLOR_AVA]].map(([l,c],i) =>
            `<div style="width:36px;height:36px;border-radius:50%;background:${c};border:2px solid ${BG};display:flex;align-items:center;justify-content:center;margin-left:${i===0?0:-10}px;z-index:${10-i};">
              <span style="font-family:${SF};font-size:14px;font-weight:700;color:#fff;">${l}</span>
            </div>`
          ).join('')}
        </div>
        <p style="font-family:${SF};font-size:22px;font-weight:700;color:#fff;margin:0;">manila girlies 🌴</p>
        <p style="font-family:${SF};font-size:17px;color:${IMSG_GRAY};margin:4px 0 0;">4 people</p>
      </div>

      <!-- Top fade -->
      <div style="position:absolute;left:0;right:0;top:154px;height:50px;background:linear-gradient(180deg,${BG},transparent);z-index:15;pointer-events:none;"></div>

      <!-- Chat -->
      <div style="position:absolute;left:0;right:0;top:162px;bottom:80px;overflow:hidden;">
        <div class="chat-scroll" style="padding:20px 20px 600px;">
          ${allMessages}
        </div>
      </div>

      <!-- Bottom fade -->
      <div style="position:absolute;left:0;right:0;bottom:80px;height:70px;background:linear-gradient(0deg,${BG},transparent);z-index:15;pointer-events:none;"></div>

      <!-- Input bar -->
      <div style="position:absolute;left:0;right:0;bottom:0;height:80px;padding:14px 18px;display:flex;align-items:center;gap:12px;z-index:20;background:${BG};border-top:1px solid #2C2C2E;">
        <div style="width:44px;height:44px;border-radius:50%;border:2px solid #3A3A3C;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <svg width="22" height="18" viewBox="0 0 24 20" fill="none"><rect x="1" y="5" width="22" height="14" rx="3" stroke="${IMSG_GRAY}" stroke-width="1.8"/><circle cx="12" cy="12" r="4" stroke="${IMSG_GRAY}" stroke-width="1.8"/><path d="M8 5l2-3h4l2 3" stroke="${IMSG_GRAY}" stroke-width="1.8" stroke-linecap="round"/></svg>
        </div>
        <div style="flex:1;padding:12px 20px;border:1.5px solid #3A3A3C;border-radius:22px;background:#1C1C1E;">
          <span style="font-family:${SF};font-size:20px;color:#636366;">iMessage</span>
        </div>
        <div style="width:44px;height:44px;border-radius:50%;background:${IMSG_BLUE};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 19V5M5 12l7-7 7 7" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
      </div>

    </div><!-- close phone-frame -->

  </div>
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
    strategy: 'v44b — Improved iMessage group chat, natural DM CTA, more photos, no red flash',
    safeBottomPixels: SAFE_BOTTOM,
    photos: PHOTOS,
  })

  const { execSync } = await import('child_process')
  const browser = await chromium.launch()

  console.log('Recording iMessage group chat animation...')

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
  const finalMp4 = path.join(OUT_DIR, '01_imessage_group_chat.mp4')

  try {
    execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${finalMp4}"`, { stdio: 'pipe' })
    fs.unlinkSync(srcVideo)
    console.log('Rendered 01_imessage_group_chat.mp4')
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
