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

const BOLD = "'Avenir Next', 'Helvetica Neue', Arial, sans-serif"
const BODY = "'Avenir Next', 'Helvetica Neue', Arial, sans-serif"
const NARROW = "Futura, 'Arial Narrow', sans-serif"

// Colors
const MANILA_COLOR = '#FF6B2B'
const ACCENT_WARM = '#FFB380'
const DIVIDER_COLOR = '#FF6B2B'
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
    strategy: 'v64 — single continuous video: hero + v27 side-by-side before/after + steps + CTA',
    safeBottomPixels: SAFE_BOTTOM,
    images: selection,
  }
  fs.writeFileSync(path.join(OUT_DIR, 'sources.json'), JSON.stringify(payload, null, 2))
}

/*
  TIMELINE (seconds):
  0.0 – 3.0   Opening: Full-screen hero with Ken Burns zoom, "MANILA" + "What if you had photos like this?"
  3.0 – 12.0  Side-by-side section (v27 layout):
               - Divider grows from top (3.0s)
               - Labels fade in (3.3s–3.6s)
               - Pair 1 slides in at 3.5s
               - Pair 2 slides in at 4.9s
               - Pair 3 slides in at 6.3s
               - Hold until 12.0s
  12.0 – 15.0 "The difference? One afternoon." + 3 steps
  15.0 – 20.0 CTA: "Sign up below" + hero photo underneath
*/

const TOTAL_DURATION = 20

function buildVideoHTML(images) {
  // ─── Side-by-side pair geometry (from v27) ───
  const PAIR_HEIGHT = 380
  const GAP = 16
  const PAD = 28
  const HALF_W = (WIDTH - PAD * 2 - GAP) / 2
  const TOP_START = 260
  const DIVIDER_X = PAD + HALF_W + GAP / 2

  const pairs = [
    { before: images.beforeA, after: images.afterA, funnyText: 'portrait mode' },
    { before: images.beforeB, after: images.afterB, funnyText: "ur friend's photography" },
    { before: images.beforeC, after: images.afterC, funnyText: 'LinkedIn energy' },
  ]

  // Side-by-side pairs HTML
  let pairsHtml = ''
  for (let i = 0; i < pairs.length; i++) {
    const y = TOP_START + i * (PAIR_HEIGHT + GAP)
    const baseDelay = 3.5 + i * 1.4

    // Before side (left) — desaturated with funny text overlay
    pairsHtml += `
      <div class="pair-before pair-${i}" style="position:absolute;left:${PAD}px;top:${y}px;width:${HALF_W}px;height:${PAIR_HEIGHT}px;border-radius:12px;overflow:hidden;opacity:0;transform:translateX(-30px);animation:slideInLeft 0.7s ease-out ${baseDelay}s forwards;">
        <img src="${pairs[i].before}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center;filter:grayscale(50%) contrast(0.75) brightness(0.85);"/>
        <div style="position:absolute;inset:0;background:rgba(100,120,140,0.15);"></div>
        <div style="position:absolute;bottom:12px;left:8px;right:8px;text-align:center;">
          <span style="font-family:${BODY};font-size:22px;font-weight:600;color:rgba(255,255,255,0.9);background:rgba(0,0,0,0.55);padding:6px 14px;border-radius:8px;text-shadow:0 1px 4px rgba(0,0,0,0.6);">${pairs[i].funnyText}</span>
        </div>
      </div>
    `

    // After side (right) — full vibrant color
    pairsHtml += `
      <div class="pair-after pair-${i}" style="position:absolute;left:${DIVIDER_X + GAP / 2}px;top:${y}px;width:${HALF_W}px;height:${PAIR_HEIGHT}px;border-radius:12px;overflow:hidden;opacity:0;transform:translateX(30px);animation:slideInRight 0.7s ease-out ${baseDelay + 0.4}s forwards;">
        <img src="${pairs[i].after}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center;"/>
        <div style="position:absolute;inset:0;background:linear-gradient(135deg, rgba(255,150,80,0.08) 0%, rgba(255,107,43,0.05) 100%);"></div>
      </div>
    `
  }

  return `<!DOCTYPE html>
<html>
<head>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { margin: 0; padding: 0; background: #0a0a0a; overflow: hidden;
    -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }

  /* ===== Ken Burns hero ===== */
  @keyframes kenBurns {
    0%   { transform: scale(1.0); }
    100% { transform: scale(1.12); }
  }

  @keyframes heroTextIn {
    0%   { opacity: 0; transform: translateY(24px); }
    20%  { opacity: 1; transform: translateY(0); }
    85%  { opacity: 1; }
    100% { opacity: 0; }
  }

  @keyframes heroOut {
    0%   { opacity: 1; }
    100% { opacity: 0; }
  }

  /* ===== Side-by-side animations (from v27) ===== */
  @keyframes slideInLeft {
    0%   { opacity: 0; transform: translateX(-30px); }
    100% { opacity: 1; transform: translateX(0); }
  }
  @keyframes slideInRight {
    0%   { opacity: 0; transform: translateX(30px); }
    100% { opacity: 1; transform: translateX(0); }
  }
  @keyframes headerFade {
    0%   { opacity: 0; transform: translateY(-16px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  @keyframes dividerGrow {
    0%   { transform: scaleY(0); }
    100% { transform: scaleY(1); }
  }
  @keyframes labelFade {
    0%   { opacity: 0; }
    100% { opacity: 1; }
  }

  /* ===== Side-by-side section fade out ===== */
  @keyframes sectionFadeOut {
    0%   { opacity: 1; }
    100% { opacity: 0; }
  }

  /* ===== Steps/difference section ===== */
  @keyframes diffFadeIn {
    0%   { opacity: 0; transform: translateY(30px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  @keyframes diffFadeOut {
    0%   { opacity: 1; }
    100% { opacity: 0; }
  }

  /* ===== CTA section ===== */
  @keyframes ctaFadeIn {
    0%   { opacity: 0; }
    100% { opacity: 1; }
  }
</style>
</head>
<body>
<div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#0a0a0a;">

  <!-- ============ OPENING HERO (0s – 3s) ============ -->
  <div id="hero-section" style="position:absolute;inset:0;z-index:10;
    opacity:1;animation:heroOut 0.5s ease-out 2.7s forwards;">

    <!-- Ken Burns photo -->
    <div style="position:absolute;inset:0;animation:kenBurns 3s ease-out forwards;">
      <img src="${images.hero}" style="width:100%;height:100%;object-fit:cover;object-position:center 20%;display:block;"/>
    </div>

    <!-- Top gradient for text legibility -->
    <div style="position:absolute;left:0;right:0;top:0;height:900px;background:linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0) 100%);"></div>

    <!-- Bottom safe zone gradient -->
    <div style="position:absolute;left:0;right:0;bottom:0;height:${SAFE_BOTTOM + 120}px;background:linear-gradient(0deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%);"></div>

    <!-- Text content -->
    <div style="position:absolute;left:54px;top:72px;right:54px;animation:heroTextIn 2.7s ease-out 0.2s both;">
      <p style="font-family:${NARROW};font-size:140px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${MANILA_COLOR};margin:0 0 20px;text-shadow:0 6px 60px rgba(255,107,43,0.5), 0 2px 20px rgba(0,0,0,0.8);">MANILA</p>
      <h1 style="font-family:${BOLD};font-size:72px;font-weight:800;line-height:1.0;color:#fff;margin:0 0 24px;letter-spacing:-0.02em;text-shadow:0 2px 16px rgba(0,0,0,0.4);">What if you<br/>had photos<br/>like this?</h1>
      <p style="font-family:${BODY};font-size:32px;font-weight:500;line-height:1.35;color:rgba(255,255,255,0.88);margin:0;text-shadow:0 1px 8px rgba(0,0,0,0.4);">One afternoon. No experience needed.</p>
    </div>
  </div>

  <!-- ============ SIDE-BY-SIDE SECTION (3s – 12s) ============ -->
  <div id="sidebyside-section" style="position:absolute;inset:0;z-index:5;
    opacity:0;animation:labelFade 0.4s ease-out 2.8s forwards, sectionFadeOut 0.5s ease-out 11.5s forwards;">

    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#0a0a0a;">

      <!-- Header -->
      <div style="position:absolute;left:54px;top:62px;right:54px;opacity:0;animation:headerFade 0.5s ease-out 3.0s forwards;">
        <p style="font-family:${NARROW};font-size:80px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${MANILA_COLOR};margin:0 0 10px;">MANILA</p>
        <h2 style="font-family:${BOLD};font-size:48px;font-weight:800;line-height:1.0;color:#fff;margin:0;letter-spacing:-0.01em;">The transformation.</h2>
      </div>

      <!-- Vertical divider (animated grow from top) -->
      <div style="position:absolute;left:${DIVIDER_X}px;top:${TOP_START - 30}px;width:3px;height:${3 * PAIR_HEIGHT + 2 * GAP + 60}px;background:linear-gradient(180deg, ${MANILA_COLOR}, rgba(255,107,43,0.2));border-radius:2px;transform:scaleY(0);transform-origin:top;animation:dividerGrow 0.8s ease-out 3.2s forwards;"></div>

      <!-- Before/After labels -->
      <div style="position:absolute;left:${PAD}px;top:${TOP_START - 36}px;width:${HALF_W}px;text-align:center;opacity:0;animation:labelFade 0.4s ease-out 3.3s forwards;">
        <p style="font-family:${NARROW};font-size:20px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:rgba(255,255,255,0.4);margin:0;">You now</p>
      </div>
      <div style="position:absolute;left:${DIVIDER_X + GAP / 2}px;top:${TOP_START - 36}px;width:${HALF_W}px;text-align:center;opacity:0;animation:labelFade 0.4s ease-out 3.5s forwards;">
        <p style="font-family:${NARROW};font-size:20px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:${ACCENT_WARM};margin:0;">After the shoot</p>
      </div>

      ${pairsHtml}
    </div>
  </div>

  <!-- ============ "The difference? One afternoon." + STEPS (12s – 15s) ============ -->
  <div id="diff-section" style="position:absolute;inset:0;z-index:6;background:#0a0a0a;
    opacity:0;animation:diffFadeIn 0.6s ease-out 12.0s forwards, diffFadeOut 0.5s ease-out 14.5s forwards;">

    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#0a0a0a;">

      <!-- MANILA + headline -->
      <div style="position:absolute;left:54px;top:72px;right:54px;">
        <p style="font-family:${NARROW};font-size:80px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${MANILA_COLOR};margin:0 0 16px;">MANILA</p>
        <h2 style="font-family:${BOLD};font-size:68px;font-weight:800;line-height:1.0;color:#fff;margin:0 0 8px;letter-spacing:-0.02em;">The difference?</h2>
        <p style="font-family:${BOLD};font-size:52px;font-weight:700;color:${ACCENT_WARM};margin:0;">One afternoon.</p>
      </div>

      <!-- 3 steps -->
      <div style="position:absolute;left:54px;top:440px;right:54px;display:flex;flex-direction:column;gap:24px;">
        <div style="display:flex;align-items:flex-start;gap:24px;">
          <div style="min-width:64px;height:64px;border-radius:50%;background:${MANILA_COLOR};display:flex;align-items:center;justify-content:center;">
            <span style="font-family:${BOLD};font-size:30px;font-weight:800;color:#fff;">1</span>
          </div>
          <div style="padding-top:6px;">
            <p style="font-family:${BOLD};font-size:40px;font-weight:700;color:#fff;margin:0 0 6px;line-height:1.1;">Sign up below</p>
            <p style="font-family:${BODY};font-size:28px;color:rgba(255,255,255,0.7);margin:0;line-height:1.3;">60-second form. I message you back.</p>
          </div>
        </div>

        <div style="width:3px;height:32px;background:rgba(255,107,43,0.3);margin-left:31px;border-radius:2px;"></div>

        <div style="display:flex;align-items:flex-start;gap:24px;">
          <div style="min-width:64px;height:64px;border-radius:50%;background:${MANILA_COLOR};display:flex;align-items:center;justify-content:center;">
            <span style="font-family:${BOLD};font-size:30px;font-weight:800;color:#fff;">2</span>
          </div>
          <div style="padding-top:6px;">
            <p style="font-family:${BOLD};font-size:40px;font-weight:700;color:#fff;margin:0 0 6px;line-height:1.1;">We pick a date</p>
            <p style="font-family:${BODY};font-size:28px;color:rgba(255,255,255,0.7);margin:0;line-height:1.3;">Location, vibe, and look -- planned together.</p>
          </div>
        </div>

        <div style="width:3px;height:32px;background:rgba(255,107,43,0.3);margin-left:31px;border-radius:2px;"></div>

        <div style="display:flex;align-items:flex-start;gap:24px;">
          <div style="min-width:64px;height:64px;border-radius:50%;background:${MANILA_COLOR};display:flex;align-items:center;justify-content:center;">
            <span style="font-family:${BOLD};font-size:30px;font-weight:800;color:#fff;">3</span>
          </div>
          <div style="padding-top:6px;">
            <p style="font-family:${BOLD};font-size:40px;font-weight:700;color:#fff;margin:0 0 6px;line-height:1.1;">Show up. I guide you.</p>
            <p style="font-family:${BODY};font-size:28px;color:rgba(255,255,255,0.7);margin:0;line-height:1.3;">No posing experience needed.</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ============ CTA SECTION (15s – 20s) ============ -->
  <div id="cta-section" style="position:absolute;inset:0;z-index:7;
    opacity:0;animation:ctaFadeIn 0.6s ease-out 15.0s forwards;">

    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#000;">
      <!-- Full-bleed hero photo underneath -->
      <img src="${images.cta}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 30%;"/>

      <!-- Top gradient -->
      <div style="position:absolute;left:0;right:0;top:0;height:900px;background:linear-gradient(180deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0) 100%);"></div>

      <!-- Bottom gradient -->
      <div style="position:absolute;left:0;right:0;bottom:0;height:${SAFE_BOTTOM + 120}px;background:linear-gradient(0deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 100%);"></div>

      <!-- Text content -->
      <div style="position:absolute;left:54px;top:72px;right:54px;">
        <p style="font-family:${NARROW};font-size:140px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${MANILA_COLOR};margin:0 0 20px;text-shadow:0 6px 60px rgba(255,107,43,0.5), 0 2px 20px rgba(0,0,0,0.8);">MANILA</p>
        <h2 style="font-family:${BOLD};font-size:80px;font-weight:800;line-height:0.95;color:#fff;margin:0 0 28px;letter-spacing:-0.02em;text-shadow:0 2px 16px rgba(0,0,0,0.4);">Your turn.</h2>
        <p style="font-family:${BODY};font-size:40px;font-weight:500;line-height:1.35;color:rgba(255,255,255,0.92);margin:0 0 40px;text-shadow:0 1px 8px rgba(0,0,0,0.4);">Sign up below.<br/>60-second form. I'll message<br/>you back within a day.</p>
      </div>

      <!-- Urgency badge -->
      <div style="position:absolute;left:54px;top:620px;display:inline-flex;align-items:center;gap:10px;padding:16px 28px;border-radius:16px;background:rgba(255,107,43,0.2);backdrop-filter:blur(16px);border:1px solid rgba(255,107,43,0.4);">
        <div style="width:10px;height:10px;border-radius:50%;background:${MANILA_COLOR};"></div>
        <span style="font-family:${BOLD};font-size:28px;font-weight:700;color:#fff;letter-spacing:0.02em;">Limited spots this month</span>
      </div>

      <!-- Handle -->
      <div style="position:absolute;left:54px;bottom:${SAFE_BOTTOM + 30}px;">
        <p style="font-family:${BODY};font-size:24px;font-weight:500;color:rgba(255,255,255,0.5);margin:0;">@${HANDLE}</p>
      </div>
    </div>
  </div>

</div>
</body>
</html>`
}

async function render() {
  resetOutputDir()
  writeSources()

  const images = Object.fromEntries(
    Object.entries(selection).map(([key, file]) => [key, readImage(file)])
  )

  const { execSync } = await import('child_process')
  const browser = await chromium.launch()

  // --- Record the single continuous animated video ---
  console.log('Recording single continuous video (hero + side-by-side + steps + CTA)...')
  const TOTAL_DURATION_MS = (TOTAL_DURATION + 1) * 1000

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
  await videoPage.waitForTimeout(500) // let images load
  await videoPage.waitForTimeout(TOTAL_DURATION_MS)
  await videoPage.close()
  await videoCtx.close()

  // --- Convert WebM to MP4 ---
  const videoFiles = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.webm'))
  if (videoFiles.length === 0) {
    console.error('No video file was generated!')
  } else {
    const srcVideo = path.join(OUT_DIR, videoFiles[0])
    const dstVideo = path.join(OUT_DIR, '01_before_after.mp4')

    try {
      execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${dstVideo}"`, {
        stdio: 'pipe',
      })
      fs.unlinkSync(srcVideo)
      console.log('Rendered 01_before_after.mp4')
    } catch (err) {
      console.warn('ffmpeg not available, keeping as webm and renaming to mp4...')
      fs.renameSync(srcVideo, dstVideo)
      console.log('Rendered 01_before_after.mp4 (webm container)')
    }
  }

  await browser.close()
  console.log(`Done: single continuous video written to ${OUT_DIR}`)
}

render().catch(error => {
  console.error(error)
  process.exit(1)
})
