import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v64')

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 410

const SF = "-apple-system, 'Helvetica Neue', Arial, sans-serif"
const MANILA_COLOR = '#FF6B2B'
const ACCENT = '#FFB380'
const HANDLE = 'madebyaidan'

const selection = {
  hero: 'manila-gallery-street-001.jpg',
  beforeA: 'manila-gallery-garden-002.jpg',
  afterA: 'manila-gallery-closeup-001.jpg',
  beforeB: 'manila-gallery-rocks-001.jpg',
  afterB: 'manila-gallery-graffiti-001.jpg',
  beforeC: 'manila-gallery-ivy-001.jpg',
  afterC: 'manila-gallery-urban-001.jpg',
  cta: 'manila-gallery-statue-001.jpg',
}

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

function writeSources() {
  const payload = {
    createdAt: new Date().toISOString(),
    strategy: 'v64 — Animated before/after transformation video with funny before content',
    safeBottomPixels: SAFE_BOTTOM,
    images: selection,
  }
  fs.writeFileSync(path.join(OUT_DIR, 'sources.json'), JSON.stringify(payload, null, 2))
}

/*
  TIMELINE (seconds):
  0.0–4.0   Hero intro: full-screen photo with Ken Burns zoom, "MANILA" + "What if you had photos like this?"
  4.0–4.5   Flash transition to BEFORE section
  4.5–7.5   Before A: "Your IG feed rn:" — desaturated, grainy
  7.5–10.5  Before B: "POV: your friend takes your photo" — desaturated
  10.5–13.0 Before C: "LinkedIn headshot energy" — desaturated
  13.0–13.5 Dramatic white flash transition
  13.5–15.5 After A: vibrant reveal
  15.5–17.5 After B: vibrant reveal
  17.5–19.5 After C: vibrant reveal
  19.5–21.5 "The difference? One afternoon." text moment
  21.5–23.0 Fade to black
  (CTA composited as 5s still at end via ffmpeg)
*/

const TOTAL_DURATION = 23

function buildVideoHTML(images) {
  return `<!DOCTYPE html>
<html>
<head>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { margin: 0; padding: 0; background: #000; overflow: hidden;
    -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }

  /* ===== Ken Burns hero ===== */
  @keyframes kenBurns {
    0%   { transform: scale(1.0); }
    100% { transform: scale(1.15); }
  }

  @keyframes heroTextIn {
    0%   { opacity: 0; transform: translateY(30px); }
    15%  { opacity: 1; transform: translateY(0); }
    85%  { opacity: 1; }
    100% { opacity: 0; }
  }

  @keyframes heroOut {
    0%   { opacity: 1; }
    100% { opacity: 0; }
  }

  /* ===== Flash ===== */
  @keyframes flashBefore {
    0%   { opacity: 0; }
    50%  { opacity: 1; }
    100% { opacity: 0; }
  }

  @keyframes flashAfter {
    0%   { opacity: 0; }
    50%  { opacity: 1; }
    100% { opacity: 0; }
  }

  /* ===== Before slides ===== */
  @keyframes beforeAIn {
    0%   { opacity: 0; }
    8%   { opacity: 1; }
    92%  { opacity: 1; }
    100% { opacity: 0; }
  }
  @keyframes beforeBIn {
    0%   { opacity: 0; }
    8%   { opacity: 1; }
    92%  { opacity: 1; }
    100% { opacity: 0; }
  }
  @keyframes beforeCIn {
    0%   { opacity: 0; }
    8%   { opacity: 1; }
    92%  { opacity: 1; }
    100% { opacity: 0; }
  }

  /* ===== Before text bounce ===== */
  @keyframes textBounce {
    0%   { opacity: 0; transform: scale(0.7) rotate(-3deg); }
    50%  { opacity: 1; transform: scale(1.08) rotate(1deg); }
    70%  { transform: scale(0.97) rotate(-0.5deg); }
    100% { opacity: 1; transform: scale(1) rotate(0deg); }
  }

  /* ===== After slides ===== */
  @keyframes afterSlideIn {
    0%   { opacity: 0; transform: scale(1.1); }
    20%  { opacity: 1; transform: scale(1.0); }
    90%  { opacity: 1; }
    100% { opacity: 0; }
  }

  /* ===== Difference text ===== */
  @keyframes diffTextIn {
    0%   { opacity: 0; transform: translateY(40px); }
    25%  { opacity: 1; transform: translateY(0); }
    85%  { opacity: 1; }
    100% { opacity: 0; }
  }

  /* ===== Grain overlay for before slides ===== */
  @keyframes grain {
    0%, 100% { transform: translate(0, 0); }
    10% { transform: translate(-5%, -10%); }
    20% { transform: translate(-15%, 5%); }
    30% { transform: translate(7%, -25%); }
    40% { transform: translate(-5%, 25%); }
    50% { transform: translate(-15%, 10%); }
    60% { transform: translate(15%, 0%); }
    70% { transform: translate(0%, 15%); }
    80% { transform: translate(3%, 35%); }
    90% { transform: translate(-10%, 10%); }
  }

  /* ===== Before label style ===== */
  .before-label {
    position: absolute;
    top: 80px;
    left: 50%;
    transform: translateX(-50%);
    font-family: ${SF};
    font-size: 48px;
    font-weight: 800;
    color: #FFD600;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    text-shadow: 0 4px 20px rgba(0,0,0,0.8);
    z-index: 10;
  }

  /* ===== After label style ===== */
  .after-label {
    position: absolute;
    top: 80px;
    left: 50%;
    transform: translateX(-50%);
    font-family: ${SF};
    font-size: 48px;
    font-weight: 800;
    color: ${MANILA_COLOR};
    text-transform: uppercase;
    letter-spacing: 0.2em;
    text-shadow: 0 4px 20px rgba(0,0,0,0.8);
    z-index: 10;
  }

  .funny-text {
    position: absolute;
    left: 0; right: 0;
    text-align: center;
    z-index: 10;
    padding: 0 60px;
  }

  .funny-text p {
    font-family: ${SF};
    color: #fff;
    text-shadow: 0 4px 30px rgba(0,0,0,0.9), 0 2px 8px rgba(0,0,0,0.7);
    margin: 0;
  }
</style>
</head>
<body>
<div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#000;">

  <!-- ============ HERO SECTION (0s – 4s) ============ -->
  <div style="position:absolute;inset:0;z-index:5;
    opacity:1;animation:heroOut 0.5s ease-out 3.8s forwards;">

    <!-- Ken Burns photo -->
    <div style="position:absolute;inset:0;animation:kenBurns 4s ease-out forwards;">
      <img src="${images.hero}" style="width:100%;height:100%;object-fit:cover;object-position:center 30%;display:block;"/>
    </div>

    <!-- Dark gradient for text readability -->
    <div style="position:absolute;inset:0;background:linear-gradient(180deg,
      rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.1) 30%, rgba(0,0,0,0.0) 50%,
      rgba(0,0,0,0.3) 70%, rgba(0,0,0,0.85) 90%);"></div>

    <!-- MANILA text -->
    <div style="position:absolute;top:140px;left:0;right:0;text-align:center;z-index:10;
      animation:heroTextIn 3.8s ease-out 0.3s both;">
      <p style="font-family:${SF};font-size:140px;font-weight:900;letter-spacing:0.12em;
        color:${MANILA_COLOR};margin:0;text-transform:uppercase;
        text-shadow:0 6px 60px rgba(255,107,43,0.5), 0 2px 20px rgba(0,0,0,0.8);">MANILA</p>
    </div>

    <!-- "What if you had photos like this?" -->
    <div style="position:absolute;bottom:${SAFE_BOTTOM + 100}px;left:0;right:0;text-align:center;padding:0 80px;z-index:10;
      animation:heroTextIn 3.5s ease-out 0.6s both;">
      <p style="font-family:${SF};font-size:56px;font-weight:700;color:#fff;line-height:1.25;
        text-shadow:0 4px 40px rgba(0,0,0,0.8);">What if you had<br/>photos like this?</p>
    </div>
  </div>

  <!-- ============ FLASH TRANSITION 1 (3.8s – 4.3s) ============ -->
  <div style="position:absolute;inset:0;z-index:12;background:#fff;pointer-events:none;
    opacity:0;animation:flashBefore 0.5s ease-out 3.8s forwards;"></div>

  <!-- ============ BEFORE A (4.5s – 7.5s) ============ -->
  <div style="position:absolute;inset:0;z-index:4;
    opacity:0;animation:beforeAIn 3s ease-out 4.5s forwards;">

    <!-- Desaturated grainy photo -->
    <div style="position:absolute;inset:0;">
      <img src="${images.beforeA}" style="width:100%;height:100%;object-fit:cover;object-position:center 25%;display:block;
        filter:grayscale(70%) contrast(0.7) brightness(0.85) saturate(0.4);"/>
    </div>

    <!-- Film grain overlay -->
    <div style="position:absolute;inset:-50%;width:200%;height:200%;
      background-image:url('data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch"/></filter><rect width="200" height="200" filter="url(#n)" opacity="0.35"/></svg>`)}');
      opacity:0.4;animation:grain 0.5s steps(4) infinite;mix-blend-mode:overlay;pointer-events:none;"></div>

    <!-- VHS-style scanlines -->
    <div style="position:absolute;inset:0;
      background:repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.08) 3px, rgba(0,0,0,0.08) 4px);
      pointer-events:none;"></div>

    <!-- Gradient overlay -->
    <div style="position:absolute;inset:0;background:linear-gradient(180deg,
      rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.15) 35%, rgba(0,0,0,0.15) 65%, rgba(0,0,0,0.7) 100%);"></div>

    <!-- BEFORE label -->
    <div class="before-label">BEFORE</div>

    <!-- Funny text -->
    <div class="funny-text" style="bottom:${SAFE_BOTTOM + 80}px;">
      <p style="font-size:52px;font-weight:800;line-height:1.2;
        animation:textBounce 0.6s cubic-bezier(0.34,1.56,0.64,1) 5.0s both;">
        Your IG feed rn: 📸💀</p>
      <p style="font-size:40px;font-weight:500;margin-top:16px;opacity:0.85;
        animation:textBounce 0.5s cubic-bezier(0.34,1.56,0.64,1) 5.3s both;">
        "just use portrait mode"</p>
    </div>
  </div>

  <!-- ============ BEFORE B (7.5s – 10.5s) ============ -->
  <div style="position:absolute;inset:0;z-index:4;
    opacity:0;animation:beforeBIn 3s ease-out 7.5s forwards;">

    <!-- Desaturated grainy photo -->
    <div style="position:absolute;inset:0;">
      <img src="${images.beforeB}" style="width:100%;height:100%;object-fit:cover;object-position:center 30%;display:block;
        filter:grayscale(60%) contrast(0.75) brightness(0.8) saturate(0.45);"/>
    </div>

    <!-- Film grain -->
    <div style="position:absolute;inset:-50%;width:200%;height:200%;
      background-image:url('data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" stitchTiles="stitch"/></filter><rect width="200" height="200" filter="url(#n)" opacity="0.35"/></svg>`)}');
      opacity:0.4;animation:grain 0.5s steps(4) infinite;mix-blend-mode:overlay;pointer-events:none;"></div>

    <!-- Scanlines -->
    <div style="position:absolute;inset:0;
      background:repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.08) 3px, rgba(0,0,0,0.08) 4px);
      pointer-events:none;"></div>

    <!-- Gradient overlay -->
    <div style="position:absolute;inset:0;background:linear-gradient(180deg,
      rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.15) 35%, rgba(0,0,0,0.15) 65%, rgba(0,0,0,0.7) 100%);"></div>

    <div class="before-label">BEFORE</div>

    <!-- Funny text -->
    <div class="funny-text" style="bottom:${SAFE_BOTTOM + 80}px;">
      <p style="font-size:48px;font-weight:800;line-height:1.2;
        animation:textBounce 0.6s cubic-bezier(0.34,1.56,0.64,1) 8.0s both;">
        POV: your friend<br/>takes your photo 🫠</p>
      <p style="font-size:40px;font-weight:500;margin-top:16px;opacity:0.85;
        animation:textBounce 0.5s cubic-bezier(0.34,1.56,0.64,1) 8.3s both;">
        "wait let me get your whole body"</p>
    </div>
  </div>

  <!-- ============ BEFORE C (10.5s – 13.0s) ============ -->
  <div style="position:absolute;inset:0;z-index:4;
    opacity:0;animation:beforeCIn 2.5s ease-out 10.5s forwards;">

    <!-- Desaturated grainy photo -->
    <div style="position:absolute;inset:0;">
      <img src="${images.beforeC}" style="width:100%;height:100%;object-fit:cover;object-position:center 25%;display:block;
        filter:grayscale(65%) contrast(0.72) brightness(0.82) saturate(0.4);"/>
    </div>

    <!-- Film grain -->
    <div style="position:absolute;inset:-50%;width:200%;height:200%;
      background-image:url('data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch"/></filter><rect width="200" height="200" filter="url(#n)" opacity="0.35"/></svg>`)}');
      opacity:0.4;animation:grain 0.5s steps(4) infinite;mix-blend-mode:overlay;pointer-events:none;"></div>

    <!-- Scanlines -->
    <div style="position:absolute;inset:0;
      background:repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.08) 3px, rgba(0,0,0,0.08) 4px);
      pointer-events:none;"></div>

    <!-- Gradient overlay -->
    <div style="position:absolute;inset:0;background:linear-gradient(180deg,
      rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.15) 35%, rgba(0,0,0,0.15) 65%, rgba(0,0,0,0.7) 100%);"></div>

    <div class="before-label">BEFORE</div>

    <!-- Funny text -->
    <div class="funny-text" style="bottom:${SAFE_BOTTOM + 80}px;">
      <p style="font-size:48px;font-weight:800;line-height:1.2;
        animation:textBounce 0.6s cubic-bezier(0.34,1.56,0.64,1) 11.0s both;">
        LinkedIn headshot<br/>energy 🪪😐</p>
      <p style="font-size:40px;font-weight:500;margin-top:16px;opacity:0.85;
        animation:textBounce 0.5s cubic-bezier(0.34,1.56,0.64,1) 11.3s both;">
        "can you crop out the bathroom?"</p>
    </div>
  </div>

  <!-- ============ FLASH TRANSITION 2 (12.8s – 13.5s) ============ -->
  <div style="position:absolute;inset:0;z-index:12;background:#fff;pointer-events:none;
    opacity:0;animation:flashAfter 0.7s ease-out 12.8s forwards;"></div>

  <!-- ============ AFTER A (13.5s – 15.5s) ============ -->
  <div style="position:absolute;inset:0;z-index:3;
    opacity:0;animation:afterSlideIn 2s ease-out 13.5s forwards;">

    <img src="${images.afterA}" style="width:100%;height:100%;object-fit:cover;object-position:center 25%;display:block;"/>

    <!-- Gradient overlay -->
    <div style="position:absolute;inset:0;background:linear-gradient(180deg,
      rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.0) 30%, rgba(0,0,0,0.0) 65%, rgba(0,0,0,0.6) 100%);"></div>

    <div class="after-label">AFTER</div>

    <div class="funny-text" style="bottom:${SAFE_BOTTOM + 80}px;">
      <p style="font-size:52px;font-weight:800;color:${ACCENT};
        text-shadow:0 4px 30px rgba(0,0,0,0.9);">Editorial. Effortless.</p>
    </div>
  </div>

  <!-- ============ AFTER B (15.5s – 17.5s) ============ -->
  <div style="position:absolute;inset:0;z-index:3;
    opacity:0;animation:afterSlideIn 2s ease-out 15.5s forwards;">

    <img src="${images.afterB}" style="width:100%;height:100%;object-fit:cover;object-position:center 30%;display:block;"/>

    <div style="position:absolute;inset:0;background:linear-gradient(180deg,
      rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.0) 30%, rgba(0,0,0,0.0) 65%, rgba(0,0,0,0.6) 100%);"></div>

    <div class="after-label">AFTER</div>

    <div class="funny-text" style="bottom:${SAFE_BOTTOM + 80}px;">
      <p style="font-size:52px;font-weight:800;color:${ACCENT};
        text-shadow:0 4px 30px rgba(0,0,0,0.9);">Magazine-ready.</p>
    </div>
  </div>

  <!-- ============ AFTER C (17.5s – 19.5s) ============ -->
  <div style="position:absolute;inset:0;z-index:3;
    opacity:0;animation:afterSlideIn 2s ease-out 17.5s forwards;">

    <img src="${images.afterC}" style="width:100%;height:100%;object-fit:cover;object-position:center 25%;display:block;"/>

    <div style="position:absolute;inset:0;background:linear-gradient(180deg,
      rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.0) 30%, rgba(0,0,0,0.0) 65%, rgba(0,0,0,0.6) 100%);"></div>

    <div class="after-label">AFTER</div>

    <div class="funny-text" style="bottom:${SAFE_BOTTOM + 80}px;">
      <p style="font-size:52px;font-weight:800;color:${ACCENT};
        text-shadow:0 4px 30px rgba(0,0,0,0.9);">That main character energy.</p>
    </div>
  </div>

  <!-- ============ "The difference? One afternoon." (19.5s – 21.5s) ============ -->
  <div style="position:absolute;inset:0;z-index:6;background:#000;
    opacity:0;animation:diffTextIn 2.5s ease-out 19.5s forwards;">
    <div style="position:absolute;top:0;left:0;right:0;bottom:${SAFE_BOTTOM}px;
      display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0 80px;">
      <div style="width:60px;height:4px;background:${MANILA_COLOR};margin-bottom:40px;border-radius:2px;"></div>
      <p style="font-family:${SF};font-size:64px;font-weight:800;color:#fff;text-align:center;line-height:1.3;margin:0;">
        The difference?</p>
      <p style="font-family:${SF};font-size:64px;font-weight:800;color:${MANILA_COLOR};text-align:center;line-height:1.3;margin:12px 0 0;">
        One afternoon.</p>
    </div>
  </div>

  <!-- ============ FADE TO BLACK (21.5s onward) ============ -->
  <div style="position:absolute;inset:0;z-index:20;background:#000;pointer-events:none;
    opacity:0;animation:heroOut 0.8s ease-out 22.0s reverse forwards;
    animation-name:fadeToBlackFinal;"></div>

</div>

<style>
  @keyframes fadeToBlackFinal {
    0%   { opacity: 0; }
    100% { opacity: 1; }
  }
  .fade-final {
    animation: fadeToBlackFinal 0.8s ease-out 22.0s forwards;
  }
</style>

</body>
</html>`
}

function buildCTA(images) {
  return `<!DOCTYPE html><html><head>
  <style>* { box-sizing:border-box;margin:0;padding:0; } html,body { background:#000; -webkit-font-smoothing:antialiased; }</style>
</head><body>
  <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#000;">

    <!-- Background photo -->
    <div style="position:absolute;inset:0;">
      <img src="${images.cta}" style="width:100%;height:100%;object-fit:cover;object-position:center 25%;display:block;"/>
    </div>

    <!-- Heavy dark gradient for text -->
    <div style="position:absolute;inset:0;background:linear-gradient(180deg,
      rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.1) 25%, rgba(0,0,0,0.0) 40%,
      rgba(0,0,0,0.55) 58%, rgba(0,0,0,0.95) 75%, #000 88%);"></div>

    <!-- Text content above SAFE_BOTTOM -->
    <div style="position:absolute;left:0;right:0;bottom:${SAFE_BOTTOM + 40}px;padding:0 70px;text-align:center;">

      <!-- Accent line -->
      <div style="width:50px;height:3px;background:${MANILA_COLOR};margin:0 auto 30px;border-radius:2px;"></div>

      <!-- MANILA -->
      <p style="font-family:${SF};font-size:180px;font-weight:900;letter-spacing:0.14em;color:#fff;margin:0;text-transform:uppercase;
        text-shadow:0 4px 80px rgba(255,107,43,0.4), 0 2px 20px rgba(0,0,0,0.8);">MANILA</p>

      <!-- PHOTO SHOOT -->
      <p style="font-family:${SF};font-size:38px;font-weight:300;color:rgba(255,255,255,0.9);margin:4px 0 0;letter-spacing:0.3em;text-transform:uppercase;">PHOTO SHOOT</p>
    </div>
  </div>
</body></html>`
}

async function render() {
  resetOutputDir()
  writeSources()

  const images = Object.fromEntries(
    Object.entries(selection).map(([key, file]) => [key, readImage(file)])
  )

  const { execSync } = await import('child_process')
  const browser = await chromium.launch()

  // --- Step 1: Record the animated video ---
  console.log('Recording animated before/after video...')
  const TOTAL_DURATION_MS = (TOTAL_DURATION + 0.5) * 1000

  const videoCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: OUT_DIR,
      size: { width: WIDTH, height: HEIGHT },
    },
  })

  const videoPage = await videoCtx.newPage()
  await videoPage.setContent(buildVideoHTML(images), { waitUntil: 'load' })
  await videoPage.waitForTimeout(500) // let initial paint settle
  await videoPage.waitForTimeout(TOTAL_DURATION_MS)
  await videoPage.close()
  await videoCtx.close()

  // --- Step 2: Render CTA screenshot ---
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

  // --- Step 3: Convert webm→mp4, concat with CTA still ---
  const videoFiles = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.webm'))
  if (videoFiles.length === 0) {
    console.error('No video file was generated!')
    return
  }

  const srcVideo = path.join(OUT_DIR, videoFiles[0])
  const chatMp4 = path.join(OUT_DIR, 'main_part.mp4')
  const ctaMp4 = path.join(OUT_DIR, 'cta_part.mp4')
  const finalMp4 = path.join(OUT_DIR, '01_before_after.mp4')
  const concatFile = path.join(OUT_DIR, 'concat.txt')

  try {
    // Convert main webm to mp4
    console.log('Converting webm to mp4...')
    execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${chatMp4}"`, { stdio: 'pipe' })

    // Create 5-second CTA video from static image
    console.log('Creating CTA video segment...')
    execSync(`ffmpeg -y -loop 1 -i "${ctaPath}" -c:v libx264 -t 5 -pix_fmt yuv420p -r 30 -vf "scale=${WIDTH}:${HEIGHT}" -an "${ctaMp4}"`, { stdio: 'pipe' })

    // Concat main + CTA
    console.log('Concatenating final video...')
    fs.writeFileSync(concatFile, `file '${chatMp4}'\nfile '${ctaMp4}'\n`)
    execSync(`ffmpeg -y -f concat -safe 0 -i "${concatFile}" -c copy "${finalMp4}"`, { stdio: 'pipe' })

    // Cleanup temp files
    fs.unlinkSync(srcVideo)
    fs.unlinkSync(chatMp4)
    fs.unlinkSync(ctaMp4)
    fs.unlinkSync(concatFile)
    console.log(`Rendered: ${finalMp4}`)
  } catch (err) {
    console.error('ffmpeg error:', err.message)
    // Fallback: keep as webm renamed
    if (fs.existsSync(srcVideo)) {
      fs.renameSync(srcVideo, finalMp4)
    }
  }

  console.log(`Done: output written to ${OUT_DIR}`)
}

render().catch(error => {
  console.error(error)
  process.exit(1)
})
