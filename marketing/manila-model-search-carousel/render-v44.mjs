import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v44')

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 410

const SF = "-apple-system, 'Helvetica Neue', Arial, sans-serif"

const BG = '#000000'
const MANILA_COLOR = '#E8443A'
const IMSG_BLUE = '#0B93F6'
const IMSG_RECV = '#333333'
const IMSG_GRAY = '#8E8E93'

// Sender colors
const COLOR_MIA = '#FF6B8A'
const COLOR_LUNA = '#9B59B6'
const COLOR_AVA = '#27AE60'
const COLOR_SOFIA = IMSG_BLUE

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

function writeSources(payload) {
  fs.writeFileSync(path.join(OUT_DIR, 'sources.json'), JSON.stringify(payload, null, 2))
}

// Timing for each message (seconds)
const T = {
  msg1:   0.5,   // Mia: "omg have you guys seen..."
  msg2:   1.5,   // Mia photo
  msg3:   3.0,   // Luna: "WAIT"
  msg4:   3.5,   // Luna: "he's doing a MODEL SEARCH..."
  msg5:   4.5,   // Ava: "I literally just signed up"
  msg6:   5.0,   // Ava: "it took 60 seconds lol"
  msg7:   6.0,   // Sofia (sent): "wait what how do I sign up"
  msg8:   7.0,   // Mia: "@madebyaidan on IG"
  msg9:   7.5,   // Mia: "he directs the whole thing..."
  msg10:  8.5,   // Luna photo
  msg11:  9.5,   // Luna: "look at these shots 😭"
  msg12:  10.5,  // Ava: "WE'RE ALL DOING THIS"
  react1: 11.0,  // Mia loved Ava's message
  msg13:  11.5,  // Sofia (sent): "signing up rn"
  react2: 12.0,  // Luna emphasized
  manila: 13.0,  // MANILA flash
}

const TOTAL_DURATION = 17
const TOTAL_DURATION_MS = 19000

function buildHTML(images) {

  function initials(name) {
    return name[0].toUpperCase()
  }

  function avatar(color, name, size = 48) {
    return `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
      <span style="font-family:${SF};font-size:${Math.round(size * 0.42)}px;font-weight:700;color:#fff;">${initials(name)}</span>
    </div>`
  }

  const GAP = 10
  const AVATAR_SIZE = 48
  const SPACER = `<div style="width:${AVATAR_SIZE}px;flex-shrink:0;"></div>`

  // Received message with avatar + sender name label
  function recv(name, color, text, id, t, showAvatar = true) {
    const av = showAvatar
      ? avatar(color, name, AVATAR_SIZE)
      : `<div style="width:${AVATAR_SIZE}px;flex-shrink:0;"></div>`
    const senderLabel = showAvatar
      ? `<span style="font-family:${SF};font-size:18px;color:${IMSG_GRAY};display:block;margin-bottom:4px;">${name}</span>`
      : ''
    return `<div id="${id}" class="msg" style="display:flex;align-items:flex-end;gap:${GAP}px;margin-bottom:6px;opacity:0;transform:translateY(18px);animation:msgIn 0.35s ease-out ${t}s forwards;">
      ${av}
      <div style="max-width:72%;">
        ${senderLabel}
        <div style="background:${IMSG_RECV};border-radius:20px 20px 20px 4px;padding:14px 20px;">
          <p style="font-family:${SF};font-size:26px;color:#fff;margin:0;line-height:1.35;">${text}</p>
        </div>
      </div>
    </div>`
  }

  // Sent message (Sofia — right side, blue)
  function sent(text, id, t) {
    return `<div id="${id}" class="msg" style="display:flex;justify-content:flex-end;margin-bottom:6px;opacity:0;transform:translateY(18px);animation:msgIn 0.35s ease-out ${t}s forwards;">
      <div style="max-width:72%;background:${IMSG_BLUE};border-radius:20px 20px 4px 20px;padding:14px 20px;">
        <p style="font-family:${SF};font-size:26px;color:#fff;margin:0;line-height:1.35;">${text}</p>
      </div>
    </div>`
  }

  // Photo message (received, with avatar)
  function recvPhoto(src, name, color, id, t) {
    const av = avatar(color, name, AVATAR_SIZE)
    const senderLabel = `<span style="font-family:${SF};font-size:18px;color:${IMSG_GRAY};display:block;margin-bottom:4px;">${name}</span>`
    return `<div id="${id}" class="msg" style="display:flex;align-items:flex-end;gap:${GAP}px;margin-bottom:6px;opacity:0;transform:scale(0.88);animation:photoIn 0.4s cubic-bezier(0.34,1.56,0.64,1) ${t}s forwards;">
      ${av}
      <div style="max-width:72%;">
        ${senderLabel}
        <div style="width:380px;height:380px;border-radius:18px;overflow:hidden;">
          <img src="${src}" style="width:100%;height:100%;object-fit:cover;object-position:center 20%;display:block;"/>
        </div>
      </div>
    </div>`
  }

  // Tapback reaction — appears on the corner of the preceding bubble
  function tapback(emoji, label, id, t) {
    return `<div id="${id}" class="msg" style="display:flex;align-items:center;gap:${GAP}px;margin-bottom:8px;margin-left:${AVATAR_SIZE + GAP}px;opacity:0;transform:scale(0.5);animation:reactPop 0.3s cubic-bezier(0.34,1.56,0.64,1) ${t}s forwards;">
      <div style="background:#1C1C1E;border:1px solid #3A3A3C;border-radius:14px;padding:5px 12px;display:flex;align-items:center;gap:6px;">
        <span style="font-size:20px;">${emoji}</span>
        <span style="font-family:${SF};font-size:17px;color:${IMSG_GRAY};">${label}</span>
      </div>
    </div>`
  }

  const p = (t) => ((t / TOTAL_DURATION) * 100).toFixed(1)

  // Scroll: start scrolling when content is tall after photo1 appears (msg2 is photo ~400px)
  // After photo1 at 1.5s: roughly ~600px content (need to start scrolling ~3s)
  // After Luna photo (msg10 at 8.5s): need heavy scroll
  const scrollKeyframes = `
    0% { transform: translateY(0); }
    ${p(3.5)}% { transform: translateY(0); }
    ${p(4.5)}% { transform: translateY(-100px); }
    ${p(5.0)}% { transform: translateY(-180px); }
    ${p(6.0)}% { transform: translateY(-260px); }
    ${p(7.0)}% { transform: translateY(-340px); }
    ${p(7.5)}% { transform: translateY(-420px); }
    ${p(8.5)}% { transform: translateY(-500px); }
    ${p(9.5)}% { transform: translateY(-900px); }
    ${p(10.5)}% { transform: translateY(-1050px); }
    ${p(11.0)}% { transform: translateY(-1150px); }
    ${p(11.5)}% { transform: translateY(-1220px); }
    ${p(12.0)}% { transform: translateY(-1280px); }
    ${p(T.manila)}% { transform: translateY(-1280px); }
    100% { transform: translateY(-1280px); }
  `

  const allMessages = [
    recv('Mia', COLOR_MIA, 'omg have you guys seen this photographer&#39;s work', 'm1', T.msg1, true),
    recvPhoto(images.photo1, 'Mia', COLOR_MIA, 'm2', T.msg2),
    recv('Luna', COLOR_LUNA, 'WAIT', 'm3', T.msg3, true),
    recv('Luna', COLOR_LUNA, 'he&#39;s doing a MODEL SEARCH in manila??', 'm4', T.msg4, false),
    recv('Ava', COLOR_AVA, 'I literally just signed up', 'm5', T.msg5, true),
    recv('Ava', COLOR_AVA, 'it took 60 seconds lol', 'm6', T.msg6, false),
    sent('wait what how do I sign up', 'm7', T.msg7),
    recv('Mia', COLOR_MIA, '@madebyaidan on IG', 'm8', T.msg8, true),
    recv('Mia', COLOR_MIA, 'he directs the whole thing, you just show up', 'm9', T.msg9, false),
    recvPhoto(images.photo2, 'Luna', COLOR_LUNA, 'm10', T.msg10),
    recv('Luna', COLOR_LUNA, 'look at these shots &#128557;', 'm11', T.msg11, false),
    recv('Ava', COLOR_AVA, 'WE&#39;RE ALL DOING THIS', 'm12', T.msg12, true),
    tapback('&#10084;&#65039;', 'Mia loved', 'r1', T.react1),
    sent('signing up rn', 'm13', T.msg13),
    tapback('&#10071;', 'Luna emphasized', 'r2', T.react2),
  ].join('\n')

  return `<!DOCTYPE html>
<html>
  <head>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      html, body { margin: 0; padding: 0; background: ${BG}; -webkit-font-smoothing: antialiased; }

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
        ${scrollKeyframes}
      }
      .chat-scroll {
        animation: chatScroll ${TOTAL_DURATION}s ease-in-out 0s forwards;
      }

      @keyframes manilaFlash {
        0% { opacity: 0; }
        12% { opacity: 1; }
        100% { opacity: 1; }
      }
      .manila-flash {
        opacity: 0;
        animation: manilaFlash 0.5s ease-out ${T.manila}s forwards;
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
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${BG};">

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
        <!-- Back arrow on left, icons on right -->
        <div style="position:absolute;left:20px;top:50%;transform:translateY(-50%);display:flex;align-items:center;">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="${IMSG_BLUE}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <!-- Profile icon cluster on right -->
        <div style="position:absolute;right:20px;top:50%;transform:translateY(-50%);display:flex;align-items:center;gap:-8px;">
          <div style="display:flex;">
            ${[['M',COLOR_MIA],['L',COLOR_LUNA],['A',COLOR_AVA]].map(([l,c],i) =>
              `<div style="width:36px;height:36px;border-radius:50%;background:${c};border:2px solid ${BG};display:flex;align-items:center;justify-content:center;margin-left:${i===0?0:-10}px;z-index:${10-i};">
                <span style="font-family:${SF};font-size:14px;font-weight:700;color:#fff;">${l}</span>
              </div>`
            ).join('')}
          </div>
        </div>
        <!-- Centered group name -->
        <p style="font-family:${SF};font-size:22px;font-weight:700;color:#fff;margin:0;text-align:center;">manila girlies 🌴</p>
        <p style="font-family:${SF};font-size:17px;color:${IMSG_GRAY};margin:4px 0 0;text-align:center;">4 people</p>
      </div>

      <!-- Top fade -->
      <div style="position:absolute;left:0;right:0;top:154px;height:50px;background:linear-gradient(180deg,${BG},transparent);z-index:15;pointer-events:none;"></div>

      <!-- Scrollable chat area -->
      <div style="position:absolute;left:0;right:0;top:162px;bottom:${SAFE_BOTTOM + 80}px;overflow:hidden;">
        <div class="chat-scroll" style="padding:20px 20px 600px;">
          ${allMessages}
        </div>
      </div>

      <!-- Bottom fade -->
      <div style="position:absolute;left:0;right:0;bottom:${SAFE_BOTTOM + 80}px;height:70px;background:linear-gradient(0deg,${BG},transparent);z-index:15;pointer-events:none;"></div>

      <!-- Input bar -->
      <div style="position:absolute;left:0;right:0;bottom:${SAFE_BOTTOM}px;height:80px;padding:14px 18px;display:flex;align-items:center;gap:12px;z-index:20;background:${BG};border-top:1px solid #2C2C2E;">
        <!-- Camera icon -->
        <div style="width:44px;height:44px;border-radius:50%;border:2px solid #3A3A3C;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <svg width="22" height="18" viewBox="0 0 24 20" fill="none"><rect x="1" y="5" width="22" height="14" rx="3" stroke="${IMSG_GRAY}" stroke-width="1.8"/><circle cx="12" cy="12" r="4" stroke="${IMSG_GRAY}" stroke-width="1.8"/><path d="M8 5l2-3h4l2 3" stroke="${IMSG_GRAY}" stroke-width="1.8" stroke-linecap="round"/></svg>
        </div>
        <!-- Text field -->
        <div style="flex:1;padding:12px 20px;border:1.5px solid #3A3A3C;border-radius:22px;background:#1C1C1E;">
          <span style="font-family:${SF};font-size:20px;color:#636366;">iMessage</span>
        </div>
        <!-- Send arrow -->
        <div style="width:44px;height:44px;border-radius:50%;background:${IMSG_BLUE};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 19V5M5 12l7-7 7 7" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
      </div>

      <!-- MANILA flash overlay -->
      <div class="manila-flash" style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:${MANILA_COLOR};z-index:30;pointer-events:none;">
        <p style="font-family:${SF};font-size:160px;font-weight:900;letter-spacing:0.08em;color:#fff;margin:0;text-transform:uppercase;opacity:0;animation:manilaTextIn 0.7s cubic-bezier(0.16,1,0.3,1) ${T.manila + 0.1}s forwards;">MANILA</p>
        <p style="font-family:${SF};font-size:44px;font-weight:600;color:#fff;margin:24px 0 0;letter-spacing:0.04em;opacity:0;animation:subtextIn 0.5s ease-out ${T.manila + 0.5}s forwards;">Model Search</p>
        <p style="font-family:${SF};font-size:28px;color:rgba(255,255,255,0.8);margin:16px 0 0;opacity:0;animation:subtextIn 0.5s ease-out ${T.manila + 0.7}s forwards;">Sign up below</p>
      </div>

    </div>
  </body>
</html>`
}

async function render() {
  resetOutputDir()

  const selection = {
    profilePic: 'manila-gallery-closeup-001.jpg',
    photo1:     'manila-gallery-dsc-0075.jpg',
    photo2:     'manila-gallery-graffiti-001.jpg',
  }

  writeSources({
    createdAt: new Date().toISOString(),
    strategy: 'v44 — iMessage group chat animated MP4',
    safeBottomPixels: SAFE_BOTTOM,
    images: selection
  })

  const images = Object.fromEntries(
    Object.entries(selection).map(([key, file]) => [key, readImage(file)])
  )

  console.log('Recording iMessage group chat as MP4...')

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
    const dstVideo = path.join(OUT_DIR, '01_imessage_manila_model_search.mp4')

    const { execSync } = await import('child_process')
    try {
      execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${dstVideo}"`, {
        stdio: 'pipe'
      })
      fs.unlinkSync(srcVideo)
      console.log('Rendered 01_imessage_manila_model_search.mp4')
    } catch (err) {
      console.warn('ffmpeg not available, keeping as webm...')
      fs.renameSync(srcVideo, dstVideo)
      console.log('Rendered 01_imessage_manila_model_search.mp4 (webm container)')
    }
  }

  await browser.close()
  console.log(`Done: animated MP4 written to ${OUT_DIR}`)
}

render().catch(error => {
  console.error(error)
  process.exit(1)
})
