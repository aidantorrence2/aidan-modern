import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v29b')

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 410

const SERIF = "Georgia, 'Baskerville', 'Times New Roman', serif"
const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif"

const CREAM = '#FAF7F2'
const NEAR_BLACK = '#1A1A1A'
const GOLD = '#C8A96E'
const RULE_COLOR = '#D4CFC6'

const TOTAL_DURATION = 26
const TOTAL_DURATION_MS = 28000

const PHOTOS = [
  'manila-gallery-canal-001.jpg',     // cover
  'manila-gallery-dsc-0190.jpg',      // editorial
  'manila-gallery-garden-002.jpg',
  'manila-gallery-urban-001.jpg',
  'manila-gallery-night-001.jpg',
  'manila-gallery-ivy-001.jpg',
  'manila-gallery-dsc-0075.jpg',
  'manila-gallery-closeup-001.jpg',
]

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
  const p = (t) => ((t / TOTAL_DURATION) * 100).toFixed(2)

  // Timeline
  const T = {
    // Phase 1: Magazine cover (0-5s)
    topRule: 0.3,
    issueInfo: 0.6,
    masthead: 0.8,
    coverPhoto: 1.5,      // hero photo reveals
    coverLines: 2.5,      // "Models Wanted" etc
    goldRule: 3.0,

    // Phase 2: Editorial spread (5-12s)
    spreadTitle: 5.0,
    photo1: 5.8,
    photo2: 6.6,
    photo3: 7.4,
    photo4: 8.2,
    photo5: 9.0,
    photo6: 9.8,

    // Phase 3: The Process (12-18s)
    processTitle: 12.0,
    step1: 13.0,
    step2: 14.2,
    step3: 15.4,
    pullQuote: 16.5,

    // Phase 4: CTA (18-26s)
    ctaTransition: 18.0,
    ctaTitle: 19.0,
    ctaSubtitle: 19.8,
    ctaDM: 20.8,
    ctaHandle: 21.8,
    ctaBadge: 22.8,
    // Hold 22.8-26s
  }

  // Scroll keyframes for the content
  const scrollKf = `
    0% { transform: translateY(0); }
    ${p(4.5)}% { transform: translateY(0); }
    ${p(5.5)}% { transform: translateY(-${HEIGHT}px); }
    ${p(11.5)}% { transform: translateY(-${HEIGHT}px); }
    ${p(12.5)}% { transform: translateY(-${HEIGHT * 2}px); }
    ${p(17.5)}% { transform: translateY(-${HEIGHT * 2}px); }
    ${p(18.5)}% { transform: translateY(-${HEIGHT * 3}px); }
    100% { transform: translateY(-${HEIGHT * 3}px); }
  `

  // Editorial photo grid
  const editPhotos = [
    { src: imageDataMap[PHOTOS[1]], x: 50,  y: 340, w: 490, h: 600 },
    { src: imageDataMap[PHOTOS[2]], x: 560, y: 340, w: 470, h: 600 },
    { src: imageDataMap[PHOTOS[3]], x: 50,  y: 960, w: 320, h: 420 },
    { src: imageDataMap[PHOTOS[4]], x: 390, y: 960, w: 320, h: 420 },
    { src: imageDataMap[PHOTOS[5]], x: 730, y: 960, w: 300, h: 420 },
  ]

  const editPhotosHTML = editPhotos.map((ph, i) => {
    const delay = T.photo1 + i * 0.8
    return `<div style="position:absolute;left:${ph.x}px;top:${ph.y}px;width:${ph.w}px;height:${ph.h}px;
      opacity:0;transform:translateY(30px) scale(0.92);
      animation:spreadIn 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}s forwards;
      box-shadow:0 8px 30px rgba(0,0,0,0.12);">
      <img src="${ph.src}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center 20%;"/>
    </div>`
  }).join('\n')

  return `<!DOCTYPE html>
<html>
<head>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { margin: 0; padding: 0; background: ${CREAM}; -webkit-font-smoothing: antialiased; }

  @keyframes fadeIn {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }

  @keyframes fadeSlideUp {
    0% { opacity: 0; transform: translateY(20px); }
    100% { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeSlideDown {
    0% { opacity: 0; transform: translateY(-15px); }
    100% { opacity: 1; transform: translateY(0); }
  }

  @keyframes ruleGrow {
    0% { transform: scaleX(0); }
    100% { transform: scaleX(1); }
  }

  @keyframes spreadIn {
    0% { opacity: 0; transform: translateY(30px) scale(0.92); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
  }

  @keyframes coverPhotoReveal {
    0% { clip-path: inset(100% 0 0 0); }
    100% { clip-path: inset(0 0 0 0); }
  }

  @keyframes goldRuleGrow {
    0% { width: 0; }
    100% { width: 80px; }
  }

  @keyframes contentScroll {
    ${scrollKf}
  }

  @keyframes ctaPulse {
    0%, 100% { opacity: 0.7; }
    50% { opacity: 1; }
  }

  .page {
    width: ${WIDTH}px;
    height: ${HEIGHT}px;
    position: relative;
    overflow: hidden;
    background: ${CREAM};
  }

  .scroller {
    position: absolute;
    left: 0; right: 0;
    top: 0;
    height: ${HEIGHT * 4}px;
    animation: contentScroll ${TOTAL_DURATION}s ease-in-out forwards;
  }

  .section {
    width: ${WIDTH}px;
    height: ${HEIGHT}px;
    position: relative;
    overflow: hidden;
  }
</style>
</head>
<body>
  <div class="page">
    <div class="scroller">

      <!-- ===== SECTION 1: MAGAZINE COVER ===== -->
      <div class="section" style="background:${CREAM};">
        <!-- Cover photo — full bleed -->
        <div style="position:absolute;inset:0;opacity:0;animation:fadeIn 0.8s ease-out ${T.coverPhoto}s forwards;">
          <img src="${imageDataMap[PHOTOS[0]]}" style="width:100%;height:100%;object-fit:cover;object-position:center top;display:block;"/>
        </div>

        <!-- Dark vignette -->
        <div style="position:absolute;inset:0;background:radial-gradient(ellipse at center, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.35) 100%);"></div>

        <!-- Top gradient -->
        <div style="position:absolute;left:0;right:0;top:0;height:750px;background:linear-gradient(180deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.55) 40%, rgba(0,0,0,0) 100%);"></div>

        <!-- Bottom gradient -->
        <div style="position:absolute;left:0;right:0;bottom:0;height:${SAFE_BOTTOM + 450}px;background:linear-gradient(0deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.45) 40%, rgba(0,0,0,0) 100%);"></div>

        <!-- Top rule -->
        <div style="position:absolute;left:60px;right:60px;top:58px;height:1px;background:rgba(255,255,255,0.5);transform-origin:left;transform:scaleX(0);opacity:0;animation:ruleGrow 0.8s ease-out ${T.topRule}s forwards, fadeIn 0.3s ease-out ${T.topRule}s forwards;"></div>

        <!-- Issue info -->
        <div style="position:absolute;left:60px;right:60px;top:66px;display:flex;justify-content:space-between;">
          <span style="font-family:${SANS};font-size:19px;font-weight:500;letter-spacing:0.25em;text-transform:uppercase;color:rgba(255,255,255,0.85);text-shadow:0 1px 6px rgba(0,0,0,0.7);opacity:0;animation:fadeSlideDown 0.5s ease-out ${T.issueInfo}s forwards;">Issue No. 01</span>
          <span style="font-family:${SANS};font-size:19px;font-weight:500;letter-spacing:0.25em;text-transform:uppercase;color:rgba(255,255,255,0.85);text-shadow:0 1px 6px rgba(0,0,0,0.7);opacity:0;animation:fadeSlideDown 0.5s ease-out ${T.issueInfo + 0.2}s forwards;">Manila, PH</span>
        </div>

        <!-- MANILA masthead -->
        <div style="position:absolute;left:0;right:0;top:100px;text-align:center;">
          <h1 style="font-family:${SERIF};font-size:130px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#fff;margin:0;text-shadow:0 2px 8px rgba(0,0,0,0.8), 0 4px 24px rgba(0,0,0,0.5);opacity:0;animation:fadeSlideDown 0.8s ease-out ${T.masthead}s forwards;">MANILA</h1>
        </div>

        <!-- Rule below masthead -->
        <div style="position:absolute;left:60px;right:60px;top:250px;height:1px;background:rgba(255,255,255,0.45);transform-origin:center;transform:scaleX(0);opacity:0;animation:ruleGrow 0.8s ease-out ${T.masthead + 0.3}s forwards, fadeIn 0.3s ease-out ${T.masthead + 0.3}s forwards;"></div>

        <!-- Cover lines -->
        <div style="position:absolute;left:60px;bottom:${SAFE_BOTTOM + 80}px;">
          <p style="font-family:${SANS};font-size:20px;font-weight:500;letter-spacing:0.2em;text-transform:uppercase;color:${GOLD};margin:0 0 14px;text-shadow:0 1px 6px rgba(0,0,0,0.7);opacity:0;animation:fadeSlideUp 0.5s ease-out ${T.coverLines}s forwards;">The Model Search Issue</p>
          <p style="font-family:${SERIF};font-size:88px;font-weight:700;font-style:italic;line-height:1.05;color:#fff;margin:0 0 20px;text-shadow:0 2px 8px rgba(0,0,0,0.7);opacity:0;animation:fadeSlideUp 0.6s ease-out ${T.coverLines + 0.2}s forwards;">Models<br/>Wanted</p>
          <div style="height:2px;background:${GOLD};animation:goldRuleGrow 0.6s ease-out ${T.goldRule}s both;margin:0 0 20px;"></div>
          <p style="font-family:${SERIF};font-size:26px;font-weight:400;font-style:italic;color:rgba(255,255,255,0.9);margin:0 0 10px;text-shadow:0 1px 6px rgba(0,0,0,0.7);opacity:0;animation:fadeSlideUp 0.5s ease-out ${T.goldRule + 0.3}s forwards;">No Experience Required</p>
          <p style="font-family:${SERIF};font-size:26px;font-weight:400;font-style:italic;color:rgba(255,255,255,0.9);margin:0 0 10px;text-shadow:0 1px 6px rgba(0,0,0,0.7);opacity:0;animation:fadeSlideUp 0.5s ease-out ${T.goldRule + 0.5}s forwards;">Free Portfolio Photos</p>
        </div>
      </div>

      <!-- ===== SECTION 2: EDITORIAL SPREAD ===== -->
      <div class="section" style="background:${CREAM};">
        <!-- Header -->
        <div style="position:absolute;left:0;right:0;top:0;padding:50px 60px 0;">
          <div style="text-align:center;">
            <p style="font-family:${SERIF};font-size:80px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${NEAR_BLACK};margin:0;opacity:0;animation:fadeSlideDown 0.6s ease-out ${T.spreadTitle}s forwards;">MANILA</p>
          </div>
          <div style="width:200px;height:1px;background:${RULE_COLOR};margin:16px auto;transform-origin:center;transform:scaleX(0);opacity:0;animation:ruleGrow 0.8s ease-out ${T.spreadTitle + 0.3}s forwards, fadeIn 0.3s ease-out ${T.spreadTitle + 0.3}s forwards;"></div>
          <div style="text-align:center;">
            <p style="font-family:${SERIF};font-size:34px;font-weight:400;font-style:italic;color:${NEAR_BLACK};margin:0;opacity:0.7;opacity:0;animation:fadeSlideUp 0.5s ease-out ${T.spreadTitle + 0.4}s forwards;">The Editorial Spread</p>
          </div>
        </div>

        <!-- Photos -->
        ${editPhotosHTML}
      </div>

      <!-- ===== SECTION 3: THE PROCESS ===== -->
      <div class="section" style="background:${CREAM};">
        <!-- MANILA header -->
        <div style="position:absolute;left:0;right:0;top:50px;text-align:center;">
          <p style="font-family:${SERIF};font-size:80px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${NEAR_BLACK};margin:0;opacity:0;animation:fadeSlideDown 0.6s ease-out ${T.processTitle}s forwards;">MANILA</p>
          <div style="width:200px;height:1px;background:${RULE_COLOR};margin:14px auto 0;transform-origin:center;transform:scaleX(0);opacity:0;animation:ruleGrow 0.8s ease-out ${T.processTitle + 0.3}s forwards, fadeIn 0.3s ease-out ${T.processTitle + 0.3}s forwards;"></div>
        </div>

        <!-- Headline -->
        <div style="position:absolute;left:60px;right:60px;top:200px;">
          <p style="font-family:${SANS};font-size:17px;font-weight:500;letter-spacing:0.3em;text-transform:uppercase;color:${GOLD};margin:0 0 12px;opacity:0;animation:fadeSlideUp 0.5s ease-out ${T.processTitle + 0.5}s forwards;">How It Works</p>
          <h2 style="font-family:${SERIF};font-size:62px;font-weight:700;font-style:italic;line-height:1.05;color:${NEAR_BLACK};margin:0;opacity:0;animation:fadeSlideUp 0.6s ease-out ${T.processTitle + 0.6}s forwards;">The Process</h2>
          <div style="height:2px;background:${GOLD};margin:20px 0 0;animation:goldRuleGrow 0.6s ease-out ${T.processTitle + 0.8}s both;"></div>
        </div>

        <!-- Steps -->
        <div style="position:absolute;left:60px;right:60px;top:420px;">
          <!-- Step 1 -->
          <div style="display:flex;gap:20px;margin-bottom:40px;opacity:0;animation:fadeSlideUp 0.6s ease-out ${T.step1}s forwards;">
            <span style="font-family:${SERIF};font-size:76px;font-weight:700;color:${GOLD};line-height:0.85;flex-shrink:0;width:64px;">1</span>
            <div style="padding-top:4px;">
              <p style="font-family:${SERIF};font-size:30px;font-weight:700;color:${NEAR_BLACK};margin:0 0 8px;">DM Me on Instagram</p>
              <p style="font-family:${SERIF};font-size:22px;color:${NEAR_BLACK};opacity:0.6;margin:0;line-height:1.5;">Send a message to @madebyaidan. I'll reply within a day to plan everything.</p>
            </div>
          </div>
          <div style="width:100%;height:1px;background:${RULE_COLOR};margin:0 0 40px;opacity:0;animation:fadeIn 0.3s ease-out ${T.step1 + 0.3}s forwards;"></div>

          <!-- Step 2 -->
          <div style="display:flex;gap:20px;margin-bottom:40px;opacity:0;animation:fadeSlideUp 0.6s ease-out ${T.step2}s forwards;">
            <span style="font-family:${SERIF};font-size:76px;font-weight:700;color:${GOLD};line-height:0.85;flex-shrink:0;width:64px;">2</span>
            <div style="padding-top:4px;">
              <p style="font-family:${SERIF};font-size:30px;font-weight:700;color:${NEAR_BLACK};margin:0 0 8px;">We Plan the Shoot</p>
              <p style="font-family:${SERIF};font-size:22px;color:${NEAR_BLACK};opacity:0.6;margin:0;line-height:1.5;">Together we choose the location, wardrobe direction, and visual mood.</p>
            </div>
          </div>
          <div style="width:100%;height:1px;background:${RULE_COLOR};margin:0 0 40px;opacity:0;animation:fadeIn 0.3s ease-out ${T.step2 + 0.3}s forwards;"></div>

          <!-- Step 3 -->
          <div style="display:flex;gap:20px;opacity:0;animation:fadeSlideUp 0.6s ease-out ${T.step3}s forwards;">
            <span style="font-family:${SERIF};font-size:76px;font-weight:700;color:${GOLD};line-height:0.85;flex-shrink:0;width:64px;">3</span>
            <div style="padding-top:4px;">
              <p style="font-family:${SERIF};font-size:30px;font-weight:700;color:${NEAR_BLACK};margin:0 0 8px;">Show Up. I Direct Everything.</p>
              <p style="font-family:${SERIF};font-size:22px;color:${NEAR_BLACK};opacity:0.6;margin:0;line-height:1.5;">No experience needed. I guide every pose, angle, and expression.</p>
            </div>
          </div>
        </div>

        <!-- Pull quote -->
        <div style="position:absolute;left:60px;right:60px;top:1000px;opacity:0;animation:fadeSlideUp 0.6s ease-out ${T.pullQuote}s forwards;">
          <div style="width:100%;height:1px;background:${RULE_COLOR};margin:0 0 30px;"></div>
          <p style="font-family:${SERIF};font-size:32px;font-weight:400;font-style:italic;color:${NEAR_BLACK};margin:0;line-height:1.4;text-align:center;opacity:0.7;">"No agency. No portfolio.<br/>Just you and one afternoon."</p>
          <div style="width:100%;height:1px;background:${RULE_COLOR};margin:30px 0 0;"></div>
        </div>

        <!-- Accent image -->
        <div style="position:absolute;right:60px;bottom:${SAFE_BOTTOM + 30}px;width:280px;height:340px;box-shadow:0 6px 24px rgba(0,0,0,0.1);opacity:0;animation:fadeSlideUp 0.6s ease-out ${T.pullQuote + 0.5}s forwards;">
          <img src="${imageDataMap[PHOTOS[6]]}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center 20%;"/>
        </div>
      </div>

      <!-- ===== SECTION 4: CTA — BACK COVER ===== -->
      <div class="section" style="background:${NEAR_BLACK};">
        <!-- Full-bleed image -->
        <img src="${imageDataMap[PHOTOS[3]]}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 30%;display:block;"/>

        <!-- Dark overlay -->
        <div style="position:absolute;inset:0;background:rgba(0,0,0,0.65);"></div>

        <!-- Top rule -->
        <div style="position:absolute;left:60px;right:60px;top:58px;height:1px;background:rgba(255,255,255,0.25);transform-origin:left;transform:scaleX(0);opacity:0;animation:ruleGrow 0.8s ease-out ${T.ctaTransition + 0.5}s forwards, fadeIn 0.3s ease-out ${T.ctaTransition + 0.5}s forwards;"></div>

        <!-- MANILA masthead -->
        <div style="position:absolute;left:0;right:0;top:80px;text-align:center;">
          <p style="font-family:${SERIF};font-size:110px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#fff;margin:0;text-shadow:0 2px 20px rgba(0,0,0,0.3);opacity:0;animation:fadeSlideDown 0.7s ease-out ${T.ctaTitle - 0.5}s forwards;">MANILA</p>
        </div>

        <!-- Rule below masthead -->
        <div style="position:absolute;left:60px;right:60px;top:220px;height:1px;background:rgba(255,255,255,0.25);transform-origin:center;transform:scaleX(0);opacity:0;animation:ruleGrow 0.8s ease-out ${T.ctaTitle - 0.2}s forwards, fadeIn 0.3s ease-out ${T.ctaTitle - 0.2}s forwards;"></div>

        <!-- CTA content -->
        <div style="position:absolute;left:60px;right:60px;top:280px;text-align:center;">
          <p style="font-family:${SANS};font-size:18px;font-weight:500;letter-spacing:0.3em;text-transform:uppercase;color:${GOLD};margin:0 0 24px;opacity:0;animation:fadeSlideUp 0.5s ease-out ${T.ctaTitle}s forwards;">Now Casting</p>
          <h2 style="font-family:${SERIF};font-size:72px;font-weight:700;font-style:italic;line-height:1.08;color:#fff;margin:0 0 28px;opacity:0;animation:fadeSlideUp 0.6s ease-out ${T.ctaSubtitle}s forwards;">Free Photo<br/>Shoot</h2>
          <div style="width:80px;height:2px;background:${GOLD};margin:0 auto 28px;animation:goldRuleGrow 0.6s ease-out ${T.ctaSubtitle + 0.3}s both;"></div>
          <p style="font-family:${SERIF};font-size:42px;font-weight:700;color:#fff;margin:0 0 16px;line-height:1.3;opacity:0;animation:fadeSlideUp 0.6s ease-out ${T.ctaDM}s forwards;">DM me if<br/>you're interested!</p>
          <p style="font-family:${SERIF};font-size:30px;font-weight:400;font-style:italic;color:rgba(255,255,255,0.7);margin:0 0 48px;line-height:1.4;opacity:0;animation:fadeSlideUp 0.5s ease-out ${T.ctaHandle}s forwards;">@madebyaidan on Instagram</p>
        </div>

        <!-- Bottom info -->
        <div style="position:absolute;left:60px;right:60px;bottom:${SAFE_BOTTOM + 20}px;display:flex;justify-content:space-between;align-items:center;opacity:0;animation:fadeIn 0.5s ease-out ${T.ctaBadge + 0.5}s forwards;">
          <span style="font-family:${SANS};font-size:16px;font-weight:400;letter-spacing:0.15em;text-transform:uppercase;color:rgba(255,255,255,0.35);">@madebyaidan</span>
          <span style="font-family:${SANS};font-size:16px;font-weight:400;letter-spacing:0.15em;text-transform:uppercase;color:rgba(255,255,255,0.35);">Manila, Philippines</span>
        </div>

        <!-- Bottom rule -->
        <div style="position:absolute;left:60px;right:60px;bottom:${SAFE_BOTTOM + 10}px;height:1px;background:rgba(255,255,255,0.15);opacity:0;animation:fadeIn 0.3s ease-out ${T.ctaBadge + 0.5}s forwards;"></div>
      </div>

    </div>
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
    strategy: 'v29b — Magazine editorial continuous animation, serif/gold aesthetic, DM-based CTA',
    safeBottomPixels: SAFE_BOTTOM,
    photos: PHOTOS,
  })

  const { execSync } = await import('child_process')
  const browser = await chromium.launch()

  console.log('Recording magazine editorial animation...')
  console.log(`  Total duration: ${TOTAL_DURATION}s, recording ${TOTAL_DURATION_MS}ms`)

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
    document.documentElement.style.background = '#FAF7F2'
    document.body.style.background = '#FAF7F2'
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
  const finalMp4 = path.join(OUT_DIR, '01_magazine_editorial.mp4')

  try {
    execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${finalMp4}"`, { stdio: 'pipe' })
    fs.unlinkSync(srcVideo)
    console.log('Rendered 01_magazine_editorial.mp4')
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
