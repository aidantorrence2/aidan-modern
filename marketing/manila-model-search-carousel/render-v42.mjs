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
    photo2: 11.1,
    photo3: 12.6,
    photo4: 14.1,
    photo5: 15.6,
    react2: 16.2,
    typing5: 16.5,
    msg13: 17.0,
    msg14: 17.4,

    typing6: 17.9,
    msg15: 18.4,
    msg16: 18.9,
    react3: 19.3,
    typing7: 19.6,
    msg17: 20.1,
    msg18: 20.6,
    manila: 21.5,
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
        <img src="${src}" style="width:130%;height:130%;display:block;object-fit:cover;object-position:center 20%;margin:-15% 0 0 -15%;"/>
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
    photo(images.photo4, 'p4', T.photo4),
    photo(images.photo5, 'p5', T.photo5),
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
  // Pre-photo: ~900px | Photos: 5×640 = 3200px | Post-photo: ~500px
  // Total: ~4600px + 500px padding = ~5100px
  // Visible area (no input bar): 1920-130-410 = 1380px → max scroll ≈ 3720px
  const TOTAL_DURATION = 25
  const p = (t) => ((t / TOTAL_DURATION) * 100).toFixed(1)

  const scrollKeyframes = `
    0% { transform: translateY(0); }
    ${p(8.5)}% { transform: translateY(0); }
    ${p(9.6)}% { transform: translateY(-100px); }
    ${p(11.1)}% { transform: translateY(-740px); }
    ${p(12.6)}% { transform: translateY(-1380px); }
    ${p(14.1)}% { transform: translateY(-2020px); }
    ${p(15.6)}% { transform: translateY(-2660px); }
    ${p(16.5)}% { transform: translateY(-2800px); }
    ${p(17.5)}% { transform: translateY(-2950px); }
    ${p(19.0)}% { transform: translateY(-3100px); }
    ${p(20.5)}% { transform: translateY(-3300px); }
    ${p(T.manila)}% { transform: translateY(-3300px); }
    100% { transform: translateY(-3300px); }
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

        @keyframes fadeToBlack {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .fade-to-black {
          opacity: 0;
          animation: fadeToBlack 0.5s ease-out ${T.manila}s forwards;
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

        <!-- Fade to black (CTA is composited as a separate high-quality screenshot) -->
        <div class="fade-to-black" style="position:absolute;inset:0;background:${IG_BLACK};z-index:30;pointer-events:none;"></div>
      </div>
    </body>
  </html>`
}

function buildCTA(images) {
  // High-quality static CTA — photo collage with bold typography
  // Rendered as a screenshot for pixel-perfect quality
  function cropImg(src, w, h, pos = 'center 20%') {
    return `<div style="width:${w}px;height:${h}px;overflow:hidden;border-radius:16px;box-shadow:0 8px 40px rgba(0,0,0,0.5);">
      <img src="${src}" style="width:130%;height:130%;object-fit:cover;object-position:${pos};display:block;margin:-15% 0 0 -15%;"/>
    </div>`
  }

  return `<!DOCTYPE html><html><head>
    <style>* { box-sizing:border-box;margin:0;padding:0; } html,body { background:#000; -webkit-font-smoothing:antialiased; }</style>
  </head><body>
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#000;">

      <!-- Photo grid — 3 photos staggered -->
      <div style="position:absolute;top:120px;left:50px;transform:rotate(-3deg);">
        ${cropImg(images.photo1, 460, 620, 'center 20%')}
      </div>
      <div style="position:absolute;top:180px;right:50px;transform:rotate(2.5deg);">
        ${cropImg(images.photo5, 420, 560, 'center 25%')}
      </div>
      <div style="position:absolute;top:620px;left:280px;transform:rotate(-1deg);z-index:5;">
        ${cropImg(images.photo2, 500, 380, 'center 30%')}
      </div>

      <!-- Dark gradient overlay to make text pop -->
      <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 20%, rgba(0,0,0,0.0) 35%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.95) 72%, #000 85%);"></div>

      <!-- Text content — positioned in lower portion above SAFE_BOTTOM -->
      <div style="position:absolute;left:0;right:0;bottom:${SAFE_BOTTOM + 40}px;padding:0 70px;text-align:center;">

        <!-- Thin red accent line -->
        <div style="width:50px;height:3px;background:${MANILA_COLOR};margin:0 auto 30px;"></div>

        <!-- MANILA — huge, white, heavy -->
        <p style="font-family:${SF};font-size:180px;font-weight:900;letter-spacing:0.14em;color:#fff;margin:0;text-transform:uppercase;text-shadow:0 4px 80px rgba(232,68,58,0.4), 0 2px 20px rgba(0,0,0,0.8);">MANILA</p>

        <!-- MODEL SEARCH — light weight, wide tracking -->
        <p style="font-family:${SF};font-size:38px;font-weight:300;color:rgba(255,255,255,0.9);margin:4px 0 0;letter-spacing:0.3em;text-transform:uppercase;">MODEL SEARCH</p>

        <!-- Divider -->
        <div style="width:100px;height:1px;background:rgba(255,255,255,0.25);margin:36px auto;"></div>

        <!-- CTA button -->
        <div style="display:inline-block;background:${MANILA_COLOR};border-radius:40px;padding:20px 70px;box-shadow:0 6px 30px rgba(232,68,58,0.45);">
          <p style="font-family:${SF};font-size:26px;font-weight:700;color:#fff;margin:0;letter-spacing:0.1em;text-transform:uppercase;">SIGN UP NOW</p>
        </div>

        <!-- Subtext -->
        <p style="font-family:${SF};font-size:22px;font-weight:400;color:rgba(255,255,255,0.45);margin:22px 0 0;letter-spacing:0.04em;">60-second form · No experience needed</p>
      </div>
    </div>
  </body></html>`
}

async function render() {
  resetOutputDir()

  const all = getTopManilaImages()
  const selection = {
    profilePic: 'manila-gallery-closeup-001.jpg',
    photo1: 'manila-gallery-purple-001.jpg',
    photo2: 'manila-gallery-purple-002.jpg',
    photo3: 'manila-gallery-purple-003.jpg',
    photo4: 'manila-gallery-purple-004.jpg',
    photo5: 'manila-gallery-purple-005.jpg',
  }

  writeSources({ all_considered: all, selected: selection })

  const images = Object.fromEntries(
    Object.entries(selection).map(([key, file]) => [key, readImage(file)])
  )

  const { execSync } = await import('child_process')
  const browser = await chromium.launch()

  // --- Step 1: Record the DM conversation video ---
  console.log('Recording animated DM conversation...')
  const TOTAL_DURATION_MS = 24000 // shortened — video fades to black, CTA is separate

  const videoCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: OUT_DIR,
      size: { width: WIDTH, height: HEIGHT }
    }
  })

  const videoPage = await videoCtx.newPage()
  await videoPage.setContent(buildAnimatedDM(images), { waitUntil: 'load' })
  await videoPage.waitForTimeout(500)
  await videoPage.waitForTimeout(TOTAL_DURATION_MS)
  await videoPage.close()
  await videoCtx.close()

  // --- Step 2: Render CTA as a high-quality screenshot ---
  console.log('Rendering CTA screenshot...')
  const ctaCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
  })
  const ctaPage = await ctaCtx.newPage()
  await ctaPage.setContent(buildCTA(images), { waitUntil: 'load' })
  await ctaPage.waitForTimeout(300)
  const ctaPath = path.join(OUT_DIR, 'cta_frame.png')
  await ctaPage.screenshot({ path: ctaPath })
  await ctaPage.close()
  await ctaCtx.close()
  await browser.close()

  // --- Step 3: Convert webm to mp4, then concat with CTA still frame ---
  const videoFiles = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.webm'))
  if (videoFiles.length === 0) {
    console.error('No video file was generated!')
    return
  }

  const srcVideo = path.join(OUT_DIR, videoFiles[0])
  const chatMp4 = path.join(OUT_DIR, 'chat_part.mp4')
  const ctaMp4 = path.join(OUT_DIR, 'cta_part.mp4')
  const finalMp4 = path.join(OUT_DIR, '01_dm_full_story.mp4')
  const concatFile = path.join(OUT_DIR, 'concat.txt')

  try {
    // Convert chat webm to mp4
    execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${chatMp4}"`, { stdio: 'pipe' })

    // Create 5-second CTA video from static image
    execSync(`ffmpeg -y -loop 1 -i "${ctaPath}" -c:v libx264 -t 5 -pix_fmt yuv420p -r 30 -vf "scale=${WIDTH}:${HEIGHT}" -an "${ctaMp4}"`, { stdio: 'pipe' })

    // Concat chat + CTA
    fs.writeFileSync(concatFile, `file '${chatMp4}'\nfile '${ctaMp4}'\n`)
    execSync(`ffmpeg -y -f concat -safe 0 -i "${concatFile}" -c copy "${finalMp4}"`, { stdio: 'pipe' })

    // Cleanup temp files
    fs.unlinkSync(srcVideo)
    fs.unlinkSync(chatMp4)
    fs.unlinkSync(ctaMp4)
    fs.unlinkSync(concatFile)
    console.log('Rendered 01_dm_full_story.mp4 (chat + CTA)')
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
