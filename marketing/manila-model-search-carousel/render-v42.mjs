import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v42b')

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 410

const SF = "-apple-system, 'Helvetica Neue', Arial, sans-serif"

const IG_BLACK = '#000000'
const IG_DARK_BORDER = '#363636'
const IG_GRAY = '#A8A8A8'
const DM_SENT_BG = 'linear-gradient(135deg, #5B51D8, #833AB4, #C13584)'
const DM_RECEIVED_BG = '#262626'
const MANILA_COLOR = '#E8443A'

const HANDLE = 'madebyaidan'

// v42: MUCH larger text, bigger bubbles, cleaner MANILA

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

function getTopManilaImages(count = 28) {
  return fs.readdirSync(IMAGE_DIR)
    .filter(file => file.startsWith('manila') && /\.(jpg|jpeg|png|webp)$/i.test(file))
    .sort((a, b) => a.localeCompare(b))
    .slice(0, count)
}

function readImage(name) {
  const filePath = path.join(IMAGE_DIR, name)
  const buf = fs.readFileSync(filePath)
  return `data:${imageMime(name)};base64,${buf.toString('base64')}`
}

function writeSources(selected) {
  const payload = {
    createdAt: new Date().toISOString(),
    strategy: 'v42b — Animated IG DM video, even bigger text, no input bar, new purple dress photos',
    safeBottomPixels: SAFE_BOTTOM,
    images: selected
  }
  fs.writeFileSync(path.join(OUT_DIR, 'sources.json'), JSON.stringify(payload, null, 2))
}

// Sizing constants — EVEN BIGGER for max readability
const MSG_FONT = 34
const MSG_PAD = '18px 26px'
const MSG_LINE = 1.35
const MSG_RADIUS = '26px'
const AVATAR = 50
const AVATAR_GAP = 14
const PHOTO_W = 440
const PHOTO_H = 580
const PHOTO_RADIUS = 24
const DOT_SIZE = 13
const REACT_FONT = 30
const BIG_EMOJI = 72
const MSG_MARGIN = '8px'

function buildAnimatedDM(images) {
  const T = {
    msg1: 0.4,
    msg2: 1.2,
    typing1: 2.0,
    msg3: 2.6,
    msg4: 3.1,

    typing2: 3.8,
    msg5: 4.4,
    msg6: 5.0,
    msg7: 5.4,
    msg8: 5.8,
    msg9: 6.2,
    react1: 6.8,
    typing3: 7.0,
    msg10: 7.5,
    msg11: 8.0,

    typing4: 8.6,
    msg12: 9.2,
    photo1: 9.6,
    photo2: 10.0,
    photo3: 10.4,
    react2: 10.9,
    typing5: 11.2,
    msg13: 11.7,
    msg14: 12.1,

    typing6: 12.6,
    msg15: 13.1,
    msg16: 13.6,
    react3: 14.0,
    typing7: 14.3,
    msg17: 14.8,
    msg18: 15.3,
    manila: 16.0,
  }

  function recv(text, id, t) {
    return `<div id="${id}" class="msg" style="display:flex;align-items:flex-end;gap:${AVATAR_GAP}px;margin-bottom:${MSG_MARGIN};opacity:0;transform:translateY(18px);animation:msgIn 0.35s ease-out ${t}s forwards;">
      <div style="width:${AVATAR}px;height:${AVATAR}px;border-radius:50%;overflow:hidden;flex-shrink:0;">
        <img src="${images.profilePic}" style="width:100%;height:100%;object-fit:cover;"/>
      </div>
      <div style="max-width:75%;background:${DM_RECEIVED_BG};border-radius:${MSG_RADIUS} ${MSG_RADIUS} ${MSG_RADIUS} 6px;padding:${MSG_PAD};">
        <p style="font-family:${SF};font-size:${MSG_FONT}px;color:#fff;margin:0;line-height:${MSG_LINE};">${text}</p>
      </div>
    </div>`
  }

  function recvNoAv(text, id, t) {
    return `<div id="${id}" class="msg" style="display:flex;align-items:flex-end;gap:${AVATAR_GAP}px;margin-bottom:${MSG_MARGIN};opacity:0;transform:translateY(18px);animation:msgIn 0.35s ease-out ${t}s forwards;">
      <div style="width:${AVATAR}px;height:${AVATAR}px;flex-shrink:0;"></div>
      <div style="max-width:75%;background:${DM_RECEIVED_BG};border-radius:${MSG_RADIUS} ${MSG_RADIUS} ${MSG_RADIUS} 6px;padding:${MSG_PAD};">
        <p style="font-family:${SF};font-size:${MSG_FONT}px;color:#fff;margin:0;line-height:${MSG_LINE};">${text}</p>
      </div>
    </div>`
  }

  function sent(text, id, t) {
    return `<div id="${id}" class="msg" style="display:flex;justify-content:flex-end;margin-bottom:${MSG_MARGIN};opacity:0;transform:translateY(18px);animation:msgIn 0.35s ease-out ${t}s forwards;">
      <div style="max-width:75%;background:${DM_SENT_BG};border-radius:${MSG_RADIUS} ${MSG_RADIUS} 6px ${MSG_RADIUS};padding:${MSG_PAD};">
        <p style="font-family:${SF};font-size:${MSG_FONT}px;color:#fff;margin:0;line-height:${MSG_LINE};">${text}</p>
      </div>
    </div>`
  }

  function typing(id, showAt, hideAt) {
    const dur = hideAt - showAt
    return `<div id="${id}" class="msg" style="display:flex;align-items:flex-end;gap:${AVATAR_GAP}px;margin-bottom:${MSG_MARGIN};opacity:0;animation:typingShow ${dur}s ease-out ${showAt}s forwards;">
      <div style="width:${AVATAR}px;height:${AVATAR}px;border-radius:50%;overflow:hidden;flex-shrink:0;">
        <img src="${images.profilePic}" style="width:100%;height:100%;object-fit:cover;"/>
      </div>
      <div style="background:${DM_RECEIVED_BG};border-radius:${MSG_RADIUS};padding:18px 22px;display:flex;gap:7px;align-items:center;">
        <div class="dot dot1" style="width:${DOT_SIZE}px;height:${DOT_SIZE}px;border-radius:50%;background:#888;"></div>
        <div class="dot dot2" style="width:${DOT_SIZE}px;height:${DOT_SIZE}px;border-radius:50%;background:#888;"></div>
        <div class="dot dot3" style="width:${DOT_SIZE}px;height:${DOT_SIZE}px;border-radius:50%;background:#888;"></div>
      </div>
    </div>`
  }

  function photo(src, id, t) {
    return `<div id="${id}" class="msg" style="display:flex;align-items:flex-end;gap:${AVATAR_GAP}px;margin-bottom:${MSG_MARGIN};opacity:0;transform:scale(0.85);animation:photoIn 0.4s cubic-bezier(0.34,1.56,0.64,1) ${t}s forwards;">
      <div style="width:${AVATAR}px;height:${AVATAR}px;flex-shrink:0;"></div>
      <div style="width:${PHOTO_W}px;height:${PHOTO_H}px;border-radius:${PHOTO_RADIUS}px;overflow:hidden;">
        <img src="${src}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center 20%;"/>
      </div>
    </div>`
  }

  function react(emoji, id, t) {
    return `<div id="${id}" class="msg" style="display:flex;align-items:center;gap:10px;margin-bottom:8px;margin-left:${AVATAR + AVATAR_GAP}px;opacity:0;transform:scale(0.5);animation:reactPop 0.3s cubic-bezier(0.34,1.56,0.64,1) ${t}s forwards;">
      <div style="background:${DM_RECEIVED_BG};border-radius:20px;padding:6px 14px;display:flex;align-items:center;gap:6px;">
        <span style="font-size:${REACT_FONT}px;">${emoji}</span>
      </div>
    </div>`
  }

  function bigEmoji(emoji, id, t) {
    return `<div id="${id}" class="msg" style="display:flex;align-items:flex-end;gap:${AVATAR_GAP}px;margin-bottom:${MSG_MARGIN};opacity:0;transform:scale(0.5);animation:reactPop 0.3s cubic-bezier(0.34,1.56,0.64,1) ${t}s forwards;">
      <div style="width:${AVATAR}px;height:${AVATAR}px;border-radius:50%;overflow:hidden;flex-shrink:0;">
        <img src="${images.profilePic}" style="width:100%;height:100%;object-fit:cover;"/>
      </div>
      <span style="font-size:${BIG_EMOJI}px;">${emoji}</span>
    </div>`
  }

  const allMessages = [
    recv('hey i\'m looking for models in Manila', 'm1', T.msg1),
    recvNoAv('want to shoot?', 'm2', T.msg2),
    typing('t1', T.typing1, T.msg3),
    sent('omg yes!! but I\'ve never modeled before', 'm3', T.msg3),
    sent('is that ok?', 'm4', T.msg4),

    typing('t2', T.typing2, T.msg5),
    recv('totally fine! here\'s how it works:', 'm5', T.msg5),
    recvNoAv('1. sign up (60 sec form)', 'm6', T.msg6),
    recvNoAv('2. we plan the date + vibe together', 'm7', T.msg7),
    recvNoAv('3. show up, I direct everything', 'm8', T.msg8),
    recvNoAv('4. get your edited photos in a week', 'm9', T.msg9),
    react('🤯', 'r1', T.react1),
    typing('t3', T.typing3, T.msg10),
    sent('wait you direct the whole thing??', 'm10', T.msg10),
    recv('yeah you literally just show up and I handle the rest', 'm11', T.msg11),

    typing('t4', T.typing4, T.msg12),
    recv('here\'s what I shot last week:', 'm12', T.msg12),
    photo(images.photo1, 'p1', T.photo1),
    photo(images.photo2, 'p2', T.photo2),
    photo(images.photo3, 'p3', T.photo3),
    react('😍', 'r2', T.react2),
    typing('t5', T.typing5, T.msg13),
    sent('THESE ARE INSANE', 'm13', T.msg13),
    sent('ok how do I sign up', 'm14', T.msg14),

    typing('t6', T.typing6, T.msg15),
    recv('sign up below! 60 second form', 'm15', T.msg15),
    recvNoAv('I\'ll message you back to plan everything', 'm16', T.msg16),
    react('🔥', 'r3', T.react3),
    typing('t7', T.typing7, T.msg17),
    sent('doing it right now', 'm17', T.msg17),
    bigEmoji('🙌', 'm18', T.msg18),
  ].join('\n')

  // Content height with 34px font, 50px avatars, 440x580 photos:
  // Messages ~76px each, photos ~640px each (580+margin+spacer), reacts ~56px
  // Pre-photo: ~900px | Photos: 3×640 = 1920px | Post-photo: ~500px
  // Total: ~3320px + 520px padding = ~3840px
  // Visible area (no input bar): 1920-130-410 = 1380px → max scroll ≈ 2460px
  const TOTAL_DURATION = 20
  const p = (t) => ((t / TOTAL_DURATION) * 100).toFixed(1)

  const scrollKeyframes = `
    0% { transform: translateY(0); }
    ${p(8.5)}% { transform: translateY(0); }
    ${p(9.6)}% { transform: translateY(-100px); }
    ${p(10.0)}% { transform: translateY(-700px); }
    ${p(10.4)}% { transform: translateY(-1350px); }
    ${p(11.0)}% { transform: translateY(-1450px); }
    ${p(12.0)}% { transform: translateY(-1600px); }
    ${p(13.5)}% { transform: translateY(-1800px); }
    ${p(15.0)}% { transform: translateY(-2000px); }
    ${p(T.manila)}% { transform: translateY(-2000px); }
    100% { transform: translateY(-2000px); }
  `

  return `<!DOCTYPE html>
  <html>
    <head>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { margin: 0; padding: 0; background: ${IG_BLACK}; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }

        @keyframes msgIn {
          0% { opacity: 0; transform: translateY(18px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes photoIn {
          0% { opacity: 0; transform: scale(0.85); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes reactPop {
          0% { opacity: 0; transform: scale(0.5); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes typingShow {
          0% { opacity: 0; }
          5% { opacity: 1; }
          90% { opacity: 1; }
          100% { opacity: 0; height: 0; margin: 0; padding: 0; overflow: hidden; }
        }
        @keyframes dotBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-8px); opacity: 1; }
        }
        .dot1 { animation: dotBounce 1.2s infinite 0s; }
        .dot2 { animation: dotBounce 1.2s infinite 0.2s; }
        .dot3 { animation: dotBounce 1.2s infinite 0.4s; }

        @keyframes chatScroll {
          ${scrollKeyframes}
        }
        .chat-scroll {
          animation: chatScroll ${TOTAL_DURATION}s ease-in-out 0s forwards;
        }

        @keyframes manilaFlash {
          0% { opacity: 0; }
          15% { opacity: 1; }
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
      <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${IG_BLACK};">

        <!-- Status bar -->
        <div style="position:absolute;left:0;right:0;top:0;height:54px;padding:14px 32px 0;display:flex;align-items:center;justify-content:space-between;z-index:20;">
          <span style="font-family:${SF};font-size:20px;font-weight:600;color:#fff;">9:41</span>
          <div style="display:flex;align-items:center;gap:6px;">
            <svg width="20" height="14" viewBox="0 0 18 12"><rect x="0" y="3" width="3" height="9" rx="1" fill="#fff"/><rect x="5" y="2" width="3" height="10" rx="1" fill="#fff"/><rect x="10" y="0" width="3" height="12" rx="1" fill="#fff"/><rect x="15" y="0" width="3" height="12" rx="1" fill="#fff" opacity="0.3"/></svg>
            <svg width="30" height="15" viewBox="0 0 27 13"><rect x="0" y="0" width="23" height="13" rx="3.5" stroke="#fff" stroke-width="1" fill="none"/><rect x="2" y="2" width="18" height="9" rx="2" fill="#fff"/></svg>
          </div>
        </div>

        <!-- DM header -->
        <div style="position:absolute;left:0;right:0;top:54px;height:64px;padding:0 20px;display:flex;align-items:center;gap:14px;z-index:20;background:${IG_BLACK};border-bottom:1px solid ${IG_DARK_BORDER};">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <div style="width:40px;height:40px;border-radius:50%;overflow:hidden;flex-shrink:0;">
            <img src="${images.profilePic}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <div style="flex:1;">
            <p style="font-family:${SF};font-size:20px;font-weight:600;color:#fff;margin:0;">${HANDLE}</p>
          </div>
          <div style="display:flex;align-items:center;gap:6px;">
            <div style="width:10px;height:10px;border-radius:50%;background:#44D62C;"></div>
            <span style="font-family:${SF};font-size:15px;color:#44D62C;">Active now</span>
          </div>
        </div>

        <!-- Top gradient fade -->
        <div style="position:absolute;left:0;right:0;top:118px;height:60px;background:linear-gradient(180deg, ${IG_BLACK}, transparent);z-index:15;pointer-events:none;"></div>

        <!-- Scrollable chat area (no input bar, extends to safe bottom) -->
        <div style="position:absolute;left:0;right:0;top:130px;bottom:${SAFE_BOTTOM}px;overflow:hidden;">
          <div class="chat-scroll" style="padding:20px 20px 500px;">
            ${allMessages}
          </div>
        </div>

        <!-- Bottom gradient fade -->
        <div style="position:absolute;left:0;right:0;bottom:${SAFE_BOTTOM}px;height:80px;background:linear-gradient(0deg, ${IG_BLACK}, transparent);z-index:15;pointer-events:none;"></div>

        <!-- MANILA flash overlay -->
        <div class="manila-flash" style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:${IG_BLACK};z-index:30;pointer-events:none;">
          <p style="font-family:${SF};font-size:160px;font-weight:900;letter-spacing:0.08em;color:${MANILA_COLOR};margin:0;text-transform:uppercase;opacity:0;animation:manilaTextIn 0.7s cubic-bezier(0.16,1,0.3,1) ${T.manila + 0.1}s forwards, glowPulse 3s ease-in-out ${T.manila + 0.8}s infinite;">MANILA</p>
          <p style="font-family:${SF};font-size:40px;font-weight:600;color:#fff;margin:20px 0 0;letter-spacing:0.04em;opacity:0;animation:subtextIn 0.5s ease-out ${T.manila + 0.5}s forwards;">Model Search</p>
          <p style="font-family:${SF};font-size:26px;color:${IG_GRAY};margin:14px 0 0;opacity:0;animation:subtextIn 0.5s ease-out ${T.manila + 0.7}s forwards;">Sign up below</p>
        </div>
      </div>
    </body>
  </html>`
}

async function render() {
  resetOutputDir()

  const all = getTopManilaImages()
  const selection = {
    profilePic: 'manila-gallery-closeup-001.jpg',
    photo1: 'manila-gallery-purple-001.jpg',
    photo2: 'manila-gallery-purple-002.jpg',
    photo3: 'manila-gallery-purple-003.jpg',
  }

  writeSources({ all_considered: all, selected: selection })

  const images = Object.fromEntries(
    Object.entries(selection).map(([key, file]) => [key, readImage(file)])
  )

  console.log('Recording animated DM conversation as MP4...')

  const TOTAL_DURATION_MS = 22000

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
  const html = buildAnimatedDM(images)
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
  console.log(`Done: 1 animated MP4 written to ${OUT_DIR}`)
}

render().catch(error => {
  console.error(error)
  process.exit(1)
})
