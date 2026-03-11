import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v41')

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
    strategy: 'v41 — Single animated IG DM video, full story told through conversation',
    safeBottomPixels: SAFE_BOTTOM,
    images: selected
  }
  fs.writeFileSync(path.join(OUT_DIR, 'sources.json'), JSON.stringify(payload, null, 2))
}

function buildAnimatedDM(images) {
  // Timeline — tighter pacing, ~18s total content + 2s hold on MANILA
  const T = {
    // ACT 1: HOOK (0-3.5s)
    msg1: 0.4,
    msg2: 1.2,
    typing1: 2.0,
    msg3: 2.6,
    msg4: 3.1,

    // ACT 2: PROCESS (3.5-8s)
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

    // ACT 3: PROOF (8-13s)
    typing4: 8.6,
    msg12: 9.2,
    photo1: 9.6,
    photo2: 10.0,
    photo3: 10.4,
    react2: 10.9,
    typing5: 11.2,
    msg13: 11.7,
    msg14: 12.1,

    // ACT 4: CTA (13-16s)
    typing6: 12.6,
    msg15: 13.1,
    msg16: 13.6,
    react3: 14.0,
    typing7: 14.3,
    msg17: 14.8,
    msg18: 15.3,
    manila: 16.0,
  }

  // Helper: received bubble
  function recv(text, id, t) {
    return `<div id="${id}" class="msg" style="display:flex;align-items:flex-end;gap:8px;margin-bottom:4px;opacity:0;transform:translateY(14px);animation:msgIn 0.35s ease-out ${t}s forwards;">
      <div style="width:24px;height:24px;border-radius:50%;overflow:hidden;flex-shrink:0;">
        <img src="${images.profilePic}" style="width:100%;height:100%;object-fit:cover;"/>
      </div>
      <div style="max-width:72%;background:${DM_RECEIVED_BG};border-radius:20px 20px 20px 4px;padding:12px 16px;">
        <p style="font-family:${SF};font-size:16px;color:#fff;margin:0;line-height:1.4;">${text}</p>
      </div>
    </div>`
  }

  // Received but no avatar (consecutive)
  function recvNoAv(text, id, t) {
    return `<div id="${id}" class="msg" style="display:flex;align-items:flex-end;gap:8px;margin-bottom:4px;opacity:0;transform:translateY(14px);animation:msgIn 0.35s ease-out ${t}s forwards;">
      <div style="width:24px;height:24px;flex-shrink:0;"></div>
      <div style="max-width:72%;background:${DM_RECEIVED_BG};border-radius:20px 20px 20px 4px;padding:12px 16px;">
        <p style="font-family:${SF};font-size:16px;color:#fff;margin:0;line-height:1.4;">${text}</p>
      </div>
    </div>`
  }

  // Sent bubble (gradient)
  function sent(text, id, t) {
    return `<div id="${id}" class="msg" style="display:flex;justify-content:flex-end;margin-bottom:4px;opacity:0;transform:translateY(14px);animation:msgIn 0.35s ease-out ${t}s forwards;">
      <div style="max-width:72%;background:${DM_SENT_BG};border-radius:20px 20px 4px 20px;padding:12px 16px;">
        <p style="font-family:${SF};font-size:16px;color:#fff;margin:0;line-height:1.4;">${text}</p>
      </div>
    </div>`
  }

  // Typing indicator (3 bouncing dots)
  function typing(id, showAt, hideAt) {
    const dur = hideAt - showAt
    return `<div id="${id}" class="msg" style="display:flex;align-items:flex-end;gap:8px;margin-bottom:4px;opacity:0;animation:typingShow ${dur}s ease-out ${showAt}s forwards;">
      <div style="width:24px;height:24px;border-radius:50%;overflow:hidden;flex-shrink:0;">
        <img src="${images.profilePic}" style="width:100%;height:100%;object-fit:cover;"/>
      </div>
      <div style="background:${DM_RECEIVED_BG};border-radius:20px;padding:14px 18px;display:flex;gap:5px;align-items:center;">
        <div class="dot dot1" style="width:8px;height:8px;border-radius:50%;background:#888;"></div>
        <div class="dot dot2" style="width:8px;height:8px;border-radius:50%;background:#888;"></div>
        <div class="dot dot3" style="width:8px;height:8px;border-radius:50%;background:#888;"></div>
      </div>
    </div>`
  }

  // Photo message (inline image)
  function photo(src, id, t) {
    return `<div id="${id}" class="msg" style="display:flex;align-items:flex-end;gap:8px;margin-bottom:4px;opacity:0;transform:scale(0.85);animation:photoIn 0.4s cubic-bezier(0.34,1.56,0.64,1) ${t}s forwards;">
      <div style="width:24px;height:24px;flex-shrink:0;"></div>
      <div style="width:240px;height:320px;border-radius:18px;overflow:hidden;">
        <img src="${src}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center 20%;"/>
      </div>
    </div>`
  }

  // Emoji reaction
  function react(emoji, id, t) {
    return `<div id="${id}" class="msg" style="display:flex;align-items:center;gap:8px;margin-bottom:6px;margin-left:36px;opacity:0;transform:scale(0.5);animation:reactPop 0.3s cubic-bezier(0.34,1.56,0.64,1) ${t}s forwards;">
      <div style="background:${DM_RECEIVED_BG};border-radius:16px;padding:4px 10px;display:flex;align-items:center;gap:4px;">
        <span style="font-size:18px;">${emoji}</span>
      </div>
    </div>`
  }

  // Big emoji message (centered)
  function bigEmoji(emoji, id, t) {
    return `<div id="${id}" class="msg" style="display:flex;align-items:flex-end;gap:8px;margin-bottom:4px;opacity:0;transform:scale(0.5);animation:reactPop 0.3s cubic-bezier(0.34,1.56,0.64,1) ${t}s forwards;">
      <div style="width:24px;height:24px;border-radius:50%;overflow:hidden;flex-shrink:0;">
        <img src="${images.profilePic}" style="width:100%;height:100%;object-fit:cover;"/>
      </div>
      <span style="font-size:48px;">${emoji}</span>
    </div>`
  }

  // Build all messages in order
  const allMessages = [
    // ACT 1: HOOK
    recv('hey! I\'m doing a model search in Manila', 'm1', T.msg1),
    recvNoAv('want to shoot?', 'm2', T.msg2),
    typing('t1', T.typing1, T.msg3),
    sent('omg yes!! but I\'ve never modeled before', 'm3', T.msg3),
    sent('is that ok?', 'm4', T.msg4),

    // ACT 2: PROCESS
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

    // ACT 3: PROOF
    typing('t4', T.typing4, T.msg12),
    recv('here\'s what I shot last week:', 'm12', T.msg12),
    photo(images.photo1, 'p1', T.photo1),
    photo(images.photo2, 'p2', T.photo2),
    photo(images.photo3, 'p3', T.photo3),
    react('😍', 'r2', T.react2),
    typing('t5', T.typing5, T.msg13),
    sent('THESE ARE INSANE', 'm13', T.msg13),
    sent('ok how do I sign up', 'm14', T.msg14),

    // ACT 4: CTA
    typing('t6', T.typing6, T.msg15),
    recv('sign up below! 60 second form', 'm15', T.msg15),
    recvNoAv('I\'ll message you back to plan everything', 'm16', T.msg16),
    react('🔥', 'r3', T.react3),
    typing('t7', T.typing7, T.msg17),
    sent('doing it right now', 'm17', T.msg17),
    bigEmoji('🙌', 'm18', T.msg18),
  ].join('\n')

  // Scroll: tracks conversation. Visible area ~1330px.
  // Start scrolling when messages would overflow (~5s).
  // Content height estimate: ~2400px
  const TOTAL_DURATION = 20

  const p = (t) => ((t / TOTAL_DURATION) * 100).toFixed(1)

  const scrollKeyframes = `
    0% { transform: translateY(0); }
    ${p(4.5)}% { transform: translateY(0); }
    ${p(6)}% { transform: translateY(-100px); }
    ${p(7.5)}% { transform: translateY(-250px); }
    ${p(9)}% { transform: translateY(-420px); }
    ${p(10)}% { transform: translateY(-600px); }
    ${p(10.5)}% { transform: translateY(-900px); }
    ${p(11.5)}% { transform: translateY(-1100px); }
    ${p(13)}% { transform: translateY(-1350px); }
    ${p(14.5)}% { transform: translateY(-1550px); }
    ${p(T.manila)}% { transform: translateY(-1550px); }
    100% { transform: translateY(-1550px); }
  `

  return `<!DOCTYPE html>
  <html>
    <head>
      <style>
        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; background: ${IG_BLACK}; }

        @keyframes msgIn {
          0% { opacity: 0; transform: translateY(14px); }
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
          30% { transform: translateY(-6px); opacity: 1; }
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
          0% { opacity: 0; transform: scale(0.8); }
          20% { opacity: 1; transform: scale(1.05); }
          40% { opacity: 1; transform: scale(1); }
          100% { opacity: 1; transform: scale(1); }
        }
        .manila-flash {
          opacity: 0;
          animation: manilaFlash 0.6s cubic-bezier(0.34,1.56,0.64,1) ${T.manila}s forwards;
        }

        @keyframes glowPulse {
          0%, 100% { text-shadow: 0 0 20px rgba(232,68,58,0.4); }
          50% { text-shadow: 0 0 50px rgba(232,68,58,0.8), 0 0 100px rgba(232,68,58,0.3); }
        }
      </style>
    </head>
    <body>
      <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${IG_BLACK};">

        <!-- Status bar -->
        <div style="position:absolute;left:0;right:0;top:0;height:54px;padding:14px 32px 0;display:flex;align-items:center;justify-content:space-between;z-index:20;">
          <span style="font-family:${SF};font-size:17px;font-weight:600;color:#fff;">9:41</span>
          <div style="display:flex;align-items:center;gap:6px;">
            <svg width="18" height="12" viewBox="0 0 18 12"><rect x="0" y="3" width="3" height="9" rx="1" fill="#fff"/><rect x="5" y="2" width="3" height="10" rx="1" fill="#fff"/><rect x="10" y="0" width="3" height="12" rx="1" fill="#fff"/><rect x="15" y="0" width="3" height="12" rx="1" fill="#fff" opacity="0.3"/></svg>
            <svg width="27" height="13" viewBox="0 0 27 13"><rect x="0" y="0" width="23" height="13" rx="3.5" stroke="#fff" stroke-width="1" fill="none"/><rect x="2" y="2" width="18" height="9" rx="2" fill="#fff"/></svg>
          </div>
        </div>

        <!-- DM header -->
        <div style="position:absolute;left:0;right:0;top:54px;height:52px;padding:0 16px;display:flex;align-items:center;gap:12px;z-index:20;background:${IG_BLACK};">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <div style="width:32px;height:32px;border-radius:50%;overflow:hidden;flex-shrink:0;">
            <img src="${images.profilePic}" style="width:100%;height:100%;object-fit:cover;"/>
          </div>
          <div style="flex:1;">
            <p style="font-family:${SF};font-size:16px;font-weight:600;color:#fff;margin:0;">${HANDLE}</p>
          </div>
          <div style="display:flex;align-items:center;gap:4px;">
            <div style="width:8px;height:8px;border-radius:50%;background:#44D62C;"></div>
            <span style="font-family:${SF};font-size:13px;color:#44D62C;">Active now</span>
          </div>
        </div>

        <!-- Top gradient fade (over scrolling messages) -->
        <div style="position:absolute;left:0;right:0;top:106px;height:60px;background:linear-gradient(180deg, ${IG_BLACK}, transparent);z-index:15;pointer-events:none;"></div>

        <!-- Scrollable chat area -->
        <div style="position:absolute;left:0;right:0;top:120px;bottom:${SAFE_BOTTOM}px;overflow:hidden;">
          <div class="chat-scroll" style="padding:16px 16px 400px;">
            ${allMessages}
          </div>
        </div>

        <!-- Bottom gradient fade -->
        <div style="position:absolute;left:0;right:0;bottom:${SAFE_BOTTOM}px;height:80px;background:linear-gradient(0deg, ${IG_BLACK}, transparent);z-index:15;pointer-events:none;"></div>

        <!-- DM input bar -->
        <div style="position:absolute;left:0;right:0;bottom:${SAFE_BOTTOM}px;padding:10px 16px;display:flex;align-items:center;gap:10px;z-index:20;background:${IG_BLACK};">
          <div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#405DE6,#5B51D8,#833AB4);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="white" stroke-width="2.5" stroke-linecap="round"/></svg>
          </div>
          <div style="flex:1;padding:10px 16px;border:1px solid ${IG_DARK_BORDER};border-radius:22px;">
            <span style="font-family:${SF};font-size:16px;color:${IG_GRAY};">Message...</span>
          </div>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#fff" stroke-width="1.5"/><path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/><circle cx="9" cy="10" r="1" fill="#fff"/><circle cx="15" cy="10" r="1" fill="#fff"/></svg>
        </div>

        <!-- MANILA flash at the end (full screen overlay) -->
        <div class="manila-flash" style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(0,0,0,0.85);z-index:30;pointer-events:none;">
          <p style="font-family:${SF};font-size:110px;font-weight:900;letter-spacing:0.06em;color:${MANILA_COLOR};margin:0;text-transform:uppercase;animation:glowPulse 2s ease-in-out ${T.manila + 0.5}s infinite;">MANILA</p>
          <p style="font-family:${SF};font-size:32px;font-weight:600;color:#fff;margin:16px 0 0;">Model Search</p>
          <p style="font-family:${SF};font-size:22px;color:${IG_GRAY};margin:10px 0 0;">Sign up below</p>
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
    photo1: 'manila-gallery-dsc-0075.jpg',
    photo2: 'manila-gallery-graffiti-001.jpg',
    photo3: 'manila-gallery-floor-001.jpg',
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

  // Convert webm to mp4
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
