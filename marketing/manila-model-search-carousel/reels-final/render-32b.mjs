import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, "output-32b")

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 430
const SAFE_TOP = 213
const SAFE_LEFT = 66
const SAFE_RIGHT = 1027

const TOTAL_DURATION_MS = 24000

const MONO = "'SF Mono', 'Menlo', 'Courier New', monospace"

const PROOF_PHOTOS = [
  'manila-gallery-dsc-0190.jpg',
  'manila-gallery-night-001.jpg',
  'manila-gallery-garden-001.jpg',
  'manila-gallery-urban-001.jpg',
  'manila-gallery-canal-001.jpg',
  'manila-gallery-ivy-001.jpg',
  'manila-gallery-closeup-001.jpg',
  'manila-gallery-dsc-0911.jpg',
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
  // Build photo data array for use in setTimeout-driven DOM updates
  const photoSrcs = PROOF_PHOTOS.map(f => imageDataMap[f])

  // Court area dimensions (between paddles)
  const courtTop = SAFE_TOP + 140
  const courtBottom = HEIGHT - SAFE_BOTTOM - 20
  const courtH = courtBottom - courtTop
  const courtLeft = SAFE_LEFT
  const courtRight = SAFE_RIGHT
  const courtW = courtRight - courtLeft

  return `<!DOCTYPE html>
<html>
<head>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    margin: 0; padding: 0;
    background: #000;
    font-family: ${MONO};
    overflow: hidden;
  }

  /* ===== BALL BOUNCE — pure CSS keyframes ===== */
  /* Ball traces a zig-zag path across the court, bouncing off top/bottom.
     We define explicit waypoints so no JS physics needed. */
  @keyframes ballBounce {
    0%   { left: 50%;  top: 50%; }
    5%   { left: 85%;  top: 20%; }
    10%  { left: 15%;  top: 70%; }
    15%  { left: 80%;  top: 30%; }
    20%  { left: 20%;  top: 80%; }
    25%  { left: 75%;  top: 15%; }
    30%  { left: 25%;  top: 65%; }
    35%  { left: 82%;  top: 40%; }
    40%  { left: 18%;  top: 25%; }
    45%  { left: 78%;  top: 75%; }
    50%  { left: 22%;  top: 35%; }
    55%  { left: 85%;  top: 60%; }
    60%  { left: 15%;  top: 20%; }
    65%  { left: 80%;  top: 80%; }
    70%  { left: 20%;  top: 45%; }
    75%  { left: 75%;  top: 25%; }
    80%  { left: 25%;  top: 70%; }
    85%  { left: 82%;  top: 50%; }
    90%  { left: 18%;  top: 30%; }
    95%  { left: 78%;  top: 65%; }
    100% { left: 50%;  top: 50%; }
  }

  /* Left paddle tracks ball vertically with slight offset */
  @keyframes paddleLeftMove {
    0%   { top: 50%; }
    5%   { top: 22%; }
    10%  { top: 68%; }
    15%  { top: 32%; }
    20%  { top: 78%; }
    25%  { top: 18%; }
    30%  { top: 63%; }
    35%  { top: 42%; }
    40%  { top: 27%; }
    45%  { top: 73%; }
    50%  { top: 37%; }
    55%  { top: 58%; }
    60%  { top: 22%; }
    65%  { top: 78%; }
    70%  { top: 47%; }
    75%  { top: 27%; }
    80%  { top: 68%; }
    85%  { top: 52%; }
    90%  { top: 32%; }
    95%  { top: 63%; }
    100% { top: 50%; }
  }

  /* Right paddle tracks ball vertically with slight offset */
  @keyframes paddleRightMove {
    0%   { top: 50%; }
    5%   { top: 25%; }
    10%  { top: 72%; }
    15%  { top: 35%; }
    20%  { top: 82%; }
    25%  { top: 20%; }
    30%  { top: 67%; }
    35%  { top: 45%; }
    40%  { top: 30%; }
    45%  { top: 77%; }
    50%  { top: 40%; }
    55%  { top: 62%; }
    60%  { top: 25%; }
    65%  { top: 82%; }
    70%  { top: 50%; }
    75%  { top: 30%; }
    80%  { top: 72%; }
    85%  { top: 55%; }
    90%  { top: 35%; }
    95%  { top: 67%; }
    100% { top: 50%; }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  @keyframes fadeOut {
    from { opacity: 1; }
    to   { opacity: 0; }
  }

  @keyframes slideFromLeft {
    from { transform: translateX(-120%); opacity: 0; }
    to   { transform: translateX(0); opacity: 1; }
  }

  @keyframes slideFromRight {
    from { transform: translateX(120%); opacity: 0; }
    to   { transform: translateX(0); opacity: 1; }
  }

  @keyframes scoreFlash {
    0%   { color: #fff; }
    25%  { color: #ff0; }
    50%  { color: #fff; }
    75%  { color: #ff0; }
    100% { color: #fff; }
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50%      { opacity: 0; }
  }

  @keyframes pulseGlow {
    0%, 100% { text-shadow: 0 0 10px rgba(255,255,255,0.3); }
    50%      { text-shadow: 0 0 30px rgba(255,255,255,0.7), 0 0 60px rgba(255,255,255,0.3); }
  }

  @keyframes scaleIn {
    from { transform: scale(0.7); opacity: 0; }
    to   { transform: scale(1); opacity: 1; }
  }

  /* Ball element */
  #ball {
    position: absolute;
    width: 20px; height: 20px;
    background: #fff;
    transform: translate(-50%, -50%);
    animation: ballBounce 3s linear infinite;
    z-index: 5;
  }

  /* Paddles */
  #paddle-left {
    position: absolute;
    left: 10px;
    width: 16px; height: 120px;
    background: #fff;
    transform: translateY(-50%);
    animation: paddleLeftMove 3s linear infinite;
    z-index: 5;
  }

  #paddle-right {
    position: absolute;
    right: 10px;
    width: 16px; height: 120px;
    background: #fff;
    transform: translateY(-50%);
    animation: paddleRightMove 3s linear infinite;
    z-index: 5;
  }

  /* Phases — elements start hidden, JS adds classes via setTimeout */
  .phase-hidden { opacity: 0; pointer-events: none; }
  .phase-visible { opacity: 1; }

  .photo-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  .photo-card img {
    width: 680px;
    height: 900px;
    object-fit: cover;
    display: block;
    border: 4px solid #fff;
  }

  .photo-caption {
    font-family: ${MONO};
    font-size: 28px;
    color: #aaa;
    letter-spacing: 2px;
    text-transform: uppercase;
  }
</style>
</head>
<body>
  <div id="root" style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#000;">

    <!-- ===== PERSISTENT HEADER ===== -->
    <div style="position:absolute;top:${SAFE_TOP - 10}px;left:${SAFE_LEFT}px;right:${WIDTH - SAFE_RIGHT}px;z-index:50;text-align:center;padding:8px 0;">
      <div style="font-size:26px;font-weight:700;color:#fff;letter-spacing:3px;text-transform:uppercase;">Manila Free Photo Shoot</div>
    </div>

    <!-- ===== SCORE DISPLAY ===== -->
    <div style="position:absolute;top:${SAFE_TOP + 40}px;left:${SAFE_LEFT}px;right:${WIDTH - SAFE_RIGHT}px;z-index:50;display:flex;justify-content:center;align-items:center;gap:60px;">
      <span id="score-left" style="font-size:72px;font-weight:700;color:#fff;transition:all 0.3s ease;">FREE</span>
      <span style="font-size:48px;color:#555;">:</span>
      <span id="score-right" style="font-size:72px;font-weight:700;color:#fff;transition:all 0.3s ease;">SHOOT</span>
    </div>

    <!-- ===== PONG COURT AREA ===== -->
    <div id="pong-area" style="position:absolute;top:${courtTop}px;left:${courtLeft}px;width:${courtW}px;height:${courtH}px;z-index:10;overflow:hidden;">

      <!-- Center dashed line -->
      <div id="center-line" style="position:absolute;left:50%;top:0;bottom:0;width:4px;transform:translateX(-50%);background:repeating-linear-gradient(to bottom, #555 0px, #555 16px, transparent 16px, transparent 32px);transition:opacity 0.4s ease;"></div>

      <!-- Left paddle -->
      <div id="paddle-left"></div>

      <!-- Right paddle -->
      <div id="paddle-right"></div>

      <!-- Ball -->
      <div id="ball"></div>

      <!-- Center text overlay (for scene 1 subtitle) -->
      <div id="center-text" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;z-index:20;opacity:0;transition:opacity 0.5s ease;">
        <div id="center-text-content" style="font-size:38px;font-weight:700;color:#fff;line-height:1.5;letter-spacing:1px;text-shadow:0 0 20px rgba(255,255,255,0.3);"></div>
      </div>

      <!-- Photo display area -->
      <div id="photo-area" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;z-index:15;pointer-events:none;"></div>

      <!-- Rounds display -->
      <div id="rounds-area" style="position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:40px;z-index:20;opacity:0;transition:opacity 0.4s ease;padding:20px;"></div>

      <!-- Final CTA area -->
      <div id="final-area" style="position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;align-items:center;z-index:25;opacity:0;transition:opacity 0.5s ease;"></div>
    </div>

  </div>

  <script>
    // Photo data embedded at build time
    const photoSrcs = ${JSON.stringify(photoSrcs)};

    const ball = document.getElementById('ball');
    const paddleLeft = document.getElementById('paddle-left');
    const paddleRight = document.getElementById('paddle-right');
    const centerLine = document.getElementById('center-line');
    const scoreLeft = document.getElementById('score-left');
    const scoreRight = document.getElementById('score-right');
    const centerText = document.getElementById('center-text');
    const centerTextContent = document.getElementById('center-text-content');
    const photoArea = document.getElementById('photo-area');
    const roundsArea = document.getElementById('rounds-area');
    const finalArea = document.getElementById('final-area');

    // ===== SCENE 1: Pong plays (0-4s) =====
    // Ball and paddles are already animating via CSS keyframes.
    // At 2.8s show "Models Wanted" text.

    setTimeout(() => {
      centerText.style.opacity = '1';
      centerTextContent.innerHTML = 'Models Wanted<br><span style="font-size:28px;color:#aaa;">No Experience Needed</span>';
    }, 2800);

    // ===== SCENE 2: Photo proof slides (4-14s) =====
    setTimeout(() => {
      // Hide center text
      centerText.style.opacity = '0';
      // Dim game elements
      centerLine.style.opacity = '0.15';
      ball.style.opacity = '0';
      ball.style.animationPlayState = 'paused';
      paddleLeft.style.opacity = '0.15';
      paddleLeft.style.animationPlayState = 'paused';
      paddleRight.style.opacity = '0.15';
      paddleRight.style.animationPlayState = 'paused';
      // Update score
      scoreLeft.textContent = 'PROOF';
      scoreRight.textContent = 'SHOTS';
      scoreLeft.style.animation = 'scoreFlash 0.4s ease';
      scoreRight.style.animation = 'scoreFlash 0.4s ease';
    }, 4000);

    // Slide in each photo
    photoSrcs.forEach((src, i) => {
      const fromLeft = i % 2 === 0;
      const delay = 4200 + i * 1200;

      setTimeout(() => {
        photoArea.innerHTML = '';
        const container = document.createElement('div');
        container.className = 'photo-card';
        container.style.animation = (fromLeft ? 'slideFromLeft' : 'slideFromRight') + ' 0.5s ease-out forwards';

        const img = document.createElement('img');
        img.src = src;

        container.appendChild(img);
        photoArea.appendChild(container);
      }, delay);
    });

    // ===== SCENE 3: How-to rounds (14-18s) =====
    setTimeout(() => {
      photoArea.innerHTML = '';
      centerLine.style.opacity = '0.3';
      paddleLeft.style.opacity = '0.3';
      paddleRight.style.opacity = '0.3';
      scoreLeft.textContent = 'HOW';
      scoreRight.textContent = 'TO';
      scoreLeft.style.animation = 'scoreFlash 0.4s ease';
      scoreRight.style.animation = 'scoreFlash 0.4s ease';
      roundsArea.style.opacity = '1';
    }, 14000);

    const rounds = [
      { time: 14200, label: 'ROUND 1', text: 'DM me on Instagram' },
      { time: 15500, label: 'ROUND 2', text: 'We pick a date' },
      { time: 16800, label: 'ROUND 3', text: 'Show up. I guide you.' },
    ];

    rounds.forEach((r) => {
      setTimeout(() => {
        const row = document.createElement('div');
        row.style.textAlign = 'center';
        row.style.animation = 'fadeIn 0.4s ease-out forwards';
        row.innerHTML =
          '<div style="font-size:24px;color:#555;letter-spacing:3px;margin-bottom:8px;">' + r.label + '</div>' +
          '<div style="font-size:36px;font-weight:700;color:#fff;letter-spacing:1px;">' + r.text + '</div>';
        roundsArea.appendChild(row);
      }, r.time);
    });

    // ===== SCENE 4: Final CTA (18-24s) =====
    setTimeout(() => {
      roundsArea.style.opacity = '0';
      centerLine.style.opacity = '0.1';
      paddleLeft.style.opacity = '0.1';
      paddleRight.style.opacity = '0.1';

      scoreLeft.textContent = '@madebyaidan';
      scoreLeft.style.fontSize = '42px';
      scoreRight.textContent = 'WINS';
      scoreRight.style.fontSize = '42px';

      finalArea.style.opacity = '1';
      finalArea.innerHTML =
        '<div style="text-align:center;animation:scaleIn 0.6s ease-out;">' +
          '<div style="font-size:52px;font-weight:700;color:#fff;margin-bottom:16px;letter-spacing:2px;animation:pulseGlow 2s ease-in-out infinite;">@madebyaidan</div>' +
          '<div style="font-size:26px;color:#555;margin-bottom:40px;letter-spacing:3px;">W I N S</div>' +
          '<div style="display:inline-block;border:4px solid #fff;padding:20px 48px;margin-bottom:32px;">' +
            '<span style="font-size:36px;font-weight:700;color:#fff;letter-spacing:2px;">Send me a DM</span>' +
          '</div>' +
          '<div style="font-size:22px;color:#888;margin-top:24px;letter-spacing:1px;">on Instagram</div>' +
          '<div style="font-size:20px;color:#555;margin-top:32px;animation:blink 1.2s step-end infinite;">LIMITED SPOTS</div>' +
        '</div>';
    }, 18000);
  </script>
</body>
</html>`;
}

async function render() {
  resetOutputDir()

  const imageDataMap = {}
  for (const photo of PROOF_PHOTOS) {
    imageDataMap[photo] = readImage(photo)
  }

  writeSources({
    createdAt: new Date().toISOString(),
    strategy: 'v32b — Pong theme rebuilt with CSS-only keyframe animations (no requestAnimationFrame)',
    safeBottomPixels: SAFE_BOTTOM,
    photos: PROOF_PHOTOS,
  })

  const browser = await chromium.launch()
  console.log('Recording Pong CSS-only ad (v32b)...')

  const videoCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    recordVideo: { dir: OUT_DIR, size: { width: WIDTH, height: HEIGHT } }
  })

  const videoPage = await videoCtx.newPage()
  await videoPage.evaluate(() => {
    document.documentElement.style.background = '#000'
    document.body.style.background = '#000'
  })

  const html = buildHTML(imageDataMap)
  await videoPage.setContent(html, { waitUntil: 'load' })
  await videoPage.waitForTimeout(500)
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
  const dstVideo = path.join(OUT_DIR, 'manila-pong-v32b.mp4')

  const { execSync } = await import('child_process')
  try {
    execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${dstVideo}"`, { stdio: 'pipe' })
    fs.unlinkSync(srcVideo)
    console.log('Rendered manila-pong-v32b.mp4')
  } catch (err) {
    console.warn('ffmpeg conversion issue, trying alternate approach...')
    try {
      execSync(`ffmpeg -y -i "${srcVideo}" -vcodec libx264 -pix_fmt yuv420p -r 30 "${dstVideo}"`, { stdio: 'pipe' })
      fs.unlinkSync(srcVideo)
      console.log('Rendered manila-pong-v32b.mp4 (alternate)')
    } catch (err2) {
      console.warn('ffmpeg not available, keeping as webm')
      fs.renameSync(srcVideo, path.join(OUT_DIR, 'manila-pong-v32b.webm'))
    }
  }

  // Copy to videos directory
  const videosDir = path.join(__dirname, 'videos')
  fs.mkdirSync(videosDir, { recursive: true })
  const finalMp4 = path.join(OUT_DIR, 'manila-pong-v32b.mp4')
  const finalWebm = path.join(OUT_DIR, 'manila-pong-v32b.webm')
  if (fs.existsSync(finalMp4)) {
    fs.copyFileSync(finalMp4, path.join(videosDir, 'manila-pong-v32b.mp4'))
    console.log('Copied to videos/manila-pong-v32b.mp4')
  } else if (fs.existsSync(finalWebm)) {
    fs.copyFileSync(finalWebm, path.join(videosDir, 'manila-pong-v32b.webm'))
    console.log('Copied to videos/manila-pong-v32b.webm')
  }

  console.log(`Done: output written to ${OUT_DIR}`)
}

render().catch(error => {
  console.error(error)
  process.exit(1)
})
