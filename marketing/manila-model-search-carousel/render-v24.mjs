import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v24')

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 410

const BOLD = "'Avenir Next', 'Helvetica Neue', Arial, sans-serif"
const BODY = "'Avenir Next', 'Helvetica Neue', Arial, sans-serif"
const MONO = "'SF Mono', 'Menlo', 'Courier New', monospace"

// iOS message colors
const BLUE_BUBBLE = '#007AFF'
const GRAY_BUBBLE = '#E9E9EB'
const MANILA_COLOR = '#FF6B35'

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

function getTopManilaImages(count = 20) {
  return fs.readdirSync(IMAGE_DIR)
    .filter(file => file.startsWith('manila') && /\.(jpg|jpeg|png|webp)$/i.test(file))
    .sort((a, b) => a.localeCompare(b))
    .slice(0, count)
}

function writeSources(selected) {
  const payload = {
    createdAt: new Date().toISOString(),
    strategy: 'v24 — DM screenshot / text conversation social proof format',
    safeBottomPixels: SAFE_BOTTOM,
    images: selected
  }
  fs.writeFileSync(path.join(OUT_DIR, 'sources.json'), JSON.stringify(payload, null, 2))
}

function wrap(html) {
  return `<!DOCTYPE html>
  <html>
    <head>
      <style>
        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; background: #000; }
      </style>
    </head>
    <body>${html}</body>
  </html>`
}

// --- iOS-style message bubble helpers ---
function sentBubble(text, opts = {}) {
  const fontSize = opts.fontSize || 30
  const maxWidth = opts.maxWidth || 620
  return `<div style="display:flex;justify-content:flex-end;margin-bottom:6px;">
    <div style="max-width:${maxWidth}px;padding:16px 22px;border-radius:22px 22px 4px 22px;background:${BLUE_BUBBLE};font-family:${BODY};font-size:${fontSize}px;font-weight:500;color:#fff;line-height:1.35;">${text}</div>
  </div>`
}

function receivedBubble(text, opts = {}) {
  const fontSize = opts.fontSize || 30
  const maxWidth = opts.maxWidth || 620
  return `<div style="display:flex;justify-content:flex-start;margin-bottom:6px;">
    <div style="max-width:${maxWidth}px;padding:16px 22px;border-radius:22px 22px 22px 4px;background:${GRAY_BUBBLE};font-family:${BODY};font-size:${fontSize}px;font-weight:500;color:#000;line-height:1.35;">${text}</div>
  </div>`
}

// --- Fake iOS status bar ---
function statusBar() {
  return `<div style="position:absolute;top:0;left:0;right:0;height:54px;display:flex;align-items:center;justify-content:space-between;padding:10px 28px 0;">
    <span style="font-family:${BOLD};font-size:17px;font-weight:600;color:#fff;">9:41</span>
    <div style="display:flex;gap:6px;align-items:center;">
      <div style="width:18px;height:12px;border:1.5px solid rgba(255,255,255,0.7);border-radius:2px;position:relative;">
        <div style="position:absolute;left:1.5px;top:1.5px;bottom:1.5px;width:60%;background:rgba(255,255,255,0.7);border-radius:1px;"></div>
      </div>
    </div>
  </div>`
}

// --- Fake iOS messages nav bar ---
function messagesNavBar(name) {
  return `<div style="position:absolute;top:54px;left:0;right:0;height:60px;display:flex;align-items:center;justify-content:center;border-bottom:1px solid rgba(255,255,255,0.1);">
    <div style="display:flex;align-items:center;gap:10px;">
      <div style="width:36px;height:36px;border-radius:18px;background:linear-gradient(135deg,#667,#445);display:flex;align-items:center;justify-content:center;">
        <span style="font-family:${BOLD};font-size:16px;color:#fff;font-weight:600;">${name.charAt(0).toUpperCase()}</span>
      </div>
      <span style="font-family:${BOLD};font-size:20px;font-weight:600;color:#fff;">${name}</span>
    </div>
  </div>`
}

// =============================================
// SLIDE 1: Hook — IG story native feel
// =============================================
function slideOne(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#000;">
      <!-- Background photo -->
      <img src="${images.hero}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 20%;"/>
      <!-- Dark overlay -->
      <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.25) 35%, rgba(0,0,0,0.15) 60%, rgba(0,0,0,0.55) 100%);"></div>

      ${statusBar()}

      <!-- Fake IG story username bar -->
      <div style="position:absolute;top:60px;left:28px;display:flex;align-items:center;gap:14px;">
        <div style="width:42px;height:42px;border-radius:21px;border:2px solid ${MANILA_COLOR};display:flex;align-items:center;justify-content:center;overflow:hidden;">
          <div style="width:38px;height:38px;border-radius:19px;background:#222;display:flex;align-items:center;justify-content:center;">
            <span style="font-family:${BOLD};font-size:18px;color:#fff;font-weight:700;">M</span>
          </div>
        </div>
        <span style="font-family:${BODY};font-size:20px;color:rgba(255,255,255,0.9);font-weight:500;">manila.portraits</span>
        <span style="font-family:${BODY};font-size:18px;color:rgba(255,255,255,0.5);">3h</span>
      </div>

      <!-- MANILA huge -->
      <div style="position:absolute;top:180px;left:0;right:0;text-align:center;">
        <p style="font-family:${BOLD};font-size:86px;font-weight:900;letter-spacing:0.22em;text-transform:uppercase;color:${MANILA_COLOR};margin:0;text-shadow:0 2px 30px rgba(0,0,0,0.5);">MANILA</p>
      </div>

      <!-- Main text block — casual IG story text style -->
      <div style="position:absolute;top:340px;left:60px;right:60px;">
        <div style="background:rgba(0,0,0,0.55);backdrop-filter:blur(12px);border-radius:20px;padding:34px 38px;">
          <p style="font-family:${BOLD};font-size:56px;font-weight:800;color:#fff;margin:0 0 18px;line-height:1.15;">looking for models in Manila</p>
          <p style="font-family:${BODY};font-size:32px;font-weight:400;color:rgba(255,255,255,0.85);margin:0;line-height:1.4;">no experience needed. I direct the whole shoot. you just show up.</p>
        </div>
      </div>

      <!-- Fake reply bar at bottom of safe zone -->
      <div style="position:absolute;bottom:${SAFE_BOTTOM + 20}px;left:28px;right:28px;height:52px;border-radius:26px;border:1px solid rgba(255,255,255,0.25);display:flex;align-items:center;padding:0 22px;">
        <span style="font-family:${BODY};font-size:20px;color:rgba(255,255,255,0.4);">Send message...</span>
      </div>
    </div>
  `
}

// =============================================
// SLIDE 2: Animated DM conversation
// Returns full HTML (not wrapped) for recordVideo
// =============================================
function slideTwoAnimated(images) {
  const messages = [
    { type: 'received', text: 'Hey! I saw your story. How does the shoot work?', delay: 0.5 },
    { type: 'sent', text: 'You just sign up and I guide the whole shoot', delay: 1.4 },
    { type: 'received', text: 'Wait really? No experience needed?', delay: 2.6 },
    { type: 'sent', text: 'Zero. I direct everything -- poses, angles, all of it', delay: 3.6 },
    { type: 'received', text: 'How long does it take?', delay: 5.0 },
    { type: 'sent', text: 'About an hour. You get 40+ edited photos back', delay: 6.0 },
    { type: 'received', text: 'ok I\'m so in', delay: 7.2 },
  ]

  let messagesHtml = ''
  for (const msg of messages) {
    const bubbleFn = msg.type === 'sent' ? 'sent' : 'received'
    const align = msg.type === 'sent' ? 'flex-end' : 'flex-start'
    const bgColor = msg.type === 'sent' ? BLUE_BUBBLE : GRAY_BUBBLE
    const textColor = msg.type === 'sent' ? '#fff' : '#000'
    const borderRadius = msg.type === 'sent'
      ? '22px 22px 4px 22px'
      : '22px 22px 22px 4px'

    messagesHtml += `<div class="msg msg-${messages.indexOf(msg)}" style="display:flex;justify-content:${align};margin-bottom:10px;opacity:0;transform:translateY(16px);animation:msgAppear 0.4s ease-out ${msg.delay}s forwards;">
      <div style="max-width:620px;padding:18px 24px;border-radius:${borderRadius};background:${bgColor};font-family:${BODY};font-size:30px;font-weight:500;color:${textColor};line-height:1.35;">${msg.text}</div>
    </div>`
  }

  return `<!DOCTYPE html>
  <html>
    <head>
      <style>
        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; background: #000; }
        @keyframes msgAppear {
          0% { opacity: 0; transform: translateY(16px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes headerFade {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes typingPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        .header { opacity: 0; animation: headerFade 0.4s ease-out 0s forwards; }
      </style>
    </head>
    <body>
      <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#000;">
        <!-- MANILA huge at top -->
        <div class="header" style="position:absolute;top:40px;left:0;right:0;text-align:center;">
          <p style="font-family:${BOLD};font-size:80px;font-weight:900;letter-spacing:0.22em;text-transform:uppercase;color:${MANILA_COLOR};margin:0;">MANILA</p>
        </div>

        <!-- Chat header -->
        <div class="header" style="position:absolute;top:140px;left:0;right:0;">
          <div style="display:flex;align-items:center;justify-content:center;gap:12px;padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.1);">
            <div style="width:40px;height:40px;border-radius:20px;background:linear-gradient(135deg,#667,#445);display:flex;align-items:center;justify-content:center;">
              <span style="font-family:${BOLD};font-size:17px;color:#fff;font-weight:600;">M</span>
            </div>
            <span style="font-family:${BOLD};font-size:22px;font-weight:600;color:#fff;">manila.portraits</span>
          </div>
        </div>

        <!-- Messages container -->
        <div style="position:absolute;top:230px;left:40px;right:40px;bottom:${SAFE_BOTTOM + 20}px;overflow:hidden;">
          ${messagesHtml}
        </div>
      </div>
    </body>
  </html>`
}

// =============================================
// SLIDE 3: Results — photos sent in chat
// =============================================
function slideThree(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#000;">
      <!-- MANILA huge at top -->
      <div style="position:absolute;top:40px;left:0;right:0;text-align:center;">
        <p style="font-family:${BOLD};font-size:80px;font-weight:900;letter-spacing:0.22em;text-transform:uppercase;color:${MANILA_COLOR};margin:0;">MANILA</p>
      </div>

      <!-- Chat header -->
      <div style="position:absolute;top:140px;left:0;right:0;">
        <div style="display:flex;align-items:center;justify-content:center;gap:12px;padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.1);">
          <div style="width:40px;height:40px;border-radius:20px;background:linear-gradient(135deg,#667,#445);display:flex;align-items:center;justify-content:center;">
            <span style="font-family:${BOLD};font-size:17px;color:#fff;font-weight:600;">M</span>
          </div>
          <span style="font-family:${BOLD};font-size:22px;font-weight:600;color:#fff;">manila.portraits</span>
        </div>
      </div>

      <!-- "sent" message with photos -->
      <div style="position:absolute;top:224px;left:40px;right:40px;">
        <!-- Sent label -->
        <div style="display:flex;justify-content:flex-end;margin-bottom:6px;">
          <span style="font-family:${BODY};font-size:17px;color:rgba(255,255,255,0.4);">Delivered</span>
        </div>

        <!-- Photo grid — sent as blue-bordered images -->
        <div style="display:flex;justify-content:flex-end;margin-bottom:10px;">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;max-width:680px;border-radius:22px 22px 4px 22px;overflow:hidden;">
            <img src="${images.result1}" style="width:100%;height:260px;object-fit:cover;display:block;"/>
            <img src="${images.result2}" style="width:100%;height:260px;object-fit:cover;display:block;"/>
            <img src="${images.result3}" style="width:100%;height:260px;object-fit:cover;display:block;"/>
            <img src="${images.result4}" style="width:100%;height:260px;object-fit:cover;display:block;"/>
          </div>
        </div>

        <!-- Caption bubble -->
        <div style="display:flex;justify-content:flex-end;margin-bottom:10px;">
          <div style="max-width:620px;padding:16px 22px;border-radius:22px 22px 4px 22px;background:${BLUE_BUBBLE};font-family:${BODY};font-size:26px;font-weight:500;color:#fff;line-height:1.35;">Here are your photos from Saturday! You killed it</div>
        </div>

        <!-- Received reply -->
        <div style="display:flex;justify-content:flex-start;margin-bottom:8px;">
          <div style="max-width:620px;padding:16px 22px;border-radius:22px 22px 22px 4px;background:${GRAY_BUBBLE};font-family:${BODY};font-size:26px;font-weight:500;color:#000;line-height:1.35;">WAIT THESE ARE INSANE</div>
        </div>

        <div style="display:flex;justify-content:flex-start;margin-bottom:8px;">
          <div style="max-width:620px;padding:16px 22px;border-radius:22px 22px 22px 4px;background:${GRAY_BUBBLE};font-family:${BODY};font-size:26px;font-weight:500;color:#000;line-height:1.35;">I literally can't pick a favorite</div>
        </div>

        <!-- Read receipt -->
        <div style="display:flex;justify-content:flex-start;margin-top:4px;">
          <span style="font-family:${BODY};font-size:17px;color:rgba(255,255,255,0.35);">Read 2:34 PM</span>
        </div>
      </div>
    </div>
  `
}

// =============================================
// SLIDE 4: CTA — "This could be your conversation"
// =============================================
function slideFour(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#000;">
      <!-- Background photo with heavy overlay -->
      <img src="${images.cta}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;opacity:0.25;"/>
      <div style="position:absolute;inset:0;background:rgba(0,0,0,0.6);"></div>

      <!-- MANILA huge at top -->
      <div style="position:absolute;top:60px;left:0;right:0;text-align:center;">
        <p style="font-family:${BOLD};font-size:86px;font-weight:900;letter-spacing:0.22em;text-transform:uppercase;color:${MANILA_COLOR};margin:0;">MANILA</p>
      </div>

      <!-- Main CTA text -->
      <div style="position:absolute;top:240px;left:60px;right:60px;text-align:center;">
        <p style="font-family:${BOLD};font-size:66px;font-weight:800;color:#fff;margin:0 0 30px;line-height:1.15;">This could be your conversation.</p>
        <p style="font-family:${BODY};font-size:34px;font-weight:400;color:rgba(255,255,255,0.8);margin:0 0 50px;line-height:1.4;">Sign up below. It takes 60 seconds.<br/>I'll message you back within a day.</p>
      </div>

      <!-- Fake mini chat preview -->
      <div style="position:absolute;top:680px;left:80px;right:80px;">
        <div style="background:rgba(255,255,255,0.08);backdrop-filter:blur(12px);border-radius:24px;padding:30px;border:1px solid rgba(255,255,255,0.12);">
          <div style="display:flex;justify-content:flex-start;margin-bottom:10px;">
            <div style="padding:14px 20px;border-radius:18px 18px 18px 4px;background:${GRAY_BUBBLE};font-family:${BODY};font-size:24px;color:#000;">Hey, I want to sign up!</div>
          </div>
          <div style="display:flex;justify-content:flex-end;">
            <div style="padding:14px 20px;border-radius:18px 18px 4px 18px;background:${BLUE_BUBBLE};font-family:${BODY};font-size:24px;color:#fff;">Amazing! Let's set up your shoot</div>
          </div>
        </div>
      </div>

      <!-- Urgency badge -->
      <div style="position:absolute;top:960px;left:0;right:0;display:flex;justify-content:center;">
        <div style="padding:16px 34px;border-radius:30px;background:${MANILA_COLOR};display:flex;align-items:center;gap:10px;">
          <div style="width:10px;height:10px;border-radius:5px;background:#fff;"></div>
          <span style="font-family:${BOLD};font-size:24px;font-weight:700;color:#fff;letter-spacing:0.08em;text-transform:uppercase;">Limited spots this month</span>
        </div>
      </div>
    </div>
  `
}

// =============================================
// MAIN RENDER
// =============================================
async function render() {
  resetOutputDir()

  const all = getTopManilaImages()
  const selection = {
    hero: 'manila-gallery-canal-001.jpg',
    result1: 'manila-gallery-closeup-001.jpg',
    result2: 'manila-gallery-garden-002.jpg',
    result3: 'manila-gallery-urban-001.jpg',
    result4: 'manila-gallery-night-003.jpg',
    cta: 'manila-gallery-floor-001.jpg',
  }

  writeSources({ all_considered: all, selected: selection })

  const images = Object.fromEntries(
    Object.entries(selection).map(([key, file]) => [key, readImage(file)])
  )

  // --- Render static slides (1, 3, 4) as PNGs ---
  const staticSlides = [
    ['01_dm_hook_story.png', wrap(slideOne(images))],
    ['03_dm_results_story.png', wrap(slideThree(images))],
    ['04_dm_cta_story.png', wrap(slideFour(images))]
  ]

  const browser = await chromium.launch()
  const staticCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1
  })

  for (const [filename, html] of staticSlides) {
    const page = await staticCtx.newPage()
    await page.setContent(html, { waitUntil: 'load' })
    await page.waitForTimeout(300)
    await page.screenshot({ path: path.join(OUT_DIR, filename), type: 'png' })
    await page.close()
    console.log(`Rendered ${filename}`)
  }
  await staticCtx.close()

  // --- Render slide 2 as animated MP4 video ---
  console.log('Recording animated DM conversation as MP4...')

  // Last message appears at 7.2s + 0.4s animation = 7.6s + 1.5s hold = ~9s
  const TOTAL_DURATION_MS = 9500

  const videoCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: OUT_DIR,
      size: { width: WIDTH, height: HEIGHT }
    }
  })

  const videoPage = await videoCtx.newPage()
  const animatedHtml = slideTwoAnimated(images)
  await videoPage.setContent(animatedHtml, { waitUntil: 'load' })
  await videoPage.waitForTimeout(500) // Let page settle
  await videoPage.waitForTimeout(TOTAL_DURATION_MS)

  await videoPage.close()
  await videoCtx.close()

  // Find and convert webm to mp4
  const videoFiles = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.webm'))
  if (videoFiles.length === 0) {
    console.error('No video file was generated!')
  } else {
    const srcVideo = path.join(OUT_DIR, videoFiles[0])
    const dstVideo = path.join(OUT_DIR, '02_dm_conversation_story.mp4')

    const { execSync } = await import('child_process')
    try {
      execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${dstVideo}"`, {
        stdio: 'pipe'
      })
      fs.unlinkSync(srcVideo)
      console.log('Rendered 02_dm_conversation_story.mp4')
    } catch (err) {
      console.warn('ffmpeg not available, keeping as webm and renaming to mp4...')
      fs.renameSync(srcVideo, dstVideo)
      console.log('Rendered 02_dm_conversation_story.mp4 (webm container)')
    }
  }

  await browser.close()
  console.log(`Done: 3 static PNGs + 1 animated MP4 written to ${OUT_DIR}`)
}

render().catch(error => {
  console.error(error)
  process.exit(1)
})
