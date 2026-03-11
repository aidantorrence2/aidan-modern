import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v27')

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 410

const BOLD = "'Avenir Next', 'Helvetica Neue', Arial, sans-serif"
const BODY = "'Avenir Next', 'Helvetica Neue', Arial, sans-serif"
const NARROW = "Futura, 'Arial Narrow', sans-serif"

// Colors
const MANILA_COLOR = '#FF6B2B' // Vibrant orange for MANILA — high contrast on dark
const ACCENT_WARM = '#FFB380'  // Warm accent for "after" side highlights
const DIVIDER_COLOR = '#FF6B2B'

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
    strategy: 'v27 — side-by-side transformation before/after format, animated slide 2',
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

// ─── SLIDE 1: HOOK — "What if you had photos like this?" ───
function slideOne(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#0a0a0a;">
      <!-- Full-bleed stunning portfolio shot -->
      <img src="${images.hero}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 20%;"/>

      <!-- Top gradient for text legibility -->
      <div style="position:absolute;left:0;right:0;top:0;height:900px;background:linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0) 100%);"></div>

      <!-- Bottom safe zone gradient -->
      <div style="position:absolute;left:0;right:0;bottom:0;height:${SAFE_BOTTOM + 120}px;background:linear-gradient(0deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%);"></div>

      <!-- Vertical divider teaser — thin line down center -->
      <div style="position:absolute;left:50%;top:0;width:3px;height:100%;background:linear-gradient(180deg, ${MANILA_COLOR} 0%, rgba(255,107,43,0.3) 40%, rgba(255,107,43,0) 70%);transform:translateX(-50%);"></div>

      <!-- Text content -->
      <div style="position:absolute;left:54px;top:72px;right:54px;">
        <p style="font-family:${NARROW};font-size:80px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${MANILA_COLOR};margin:0 0 20px;text-shadow:0 2px 20px rgba(0,0,0,0.5);">MANILA</p>
        <h1 style="font-family:${BOLD};font-size:72px;font-weight:800;line-height:1.0;color:#fff;margin:0 0 24px;letter-spacing:-0.02em;text-shadow:0 2px 16px rgba(0,0,0,0.4);">What if you<br/>had photos<br/>like this?</h1>
        <p style="font-family:${BODY};font-size:32px;font-weight:500;line-height:1.35;color:rgba(255,255,255,0.88);margin:0;text-shadow:0 1px 8px rgba(0,0,0,0.4);">One afternoon. No experience needed.</p>
      </div>

      <!-- Split-screen labels at bottom above safe zone -->
      <div style="position:absolute;left:54px;bottom:${SAFE_BOTTOM + 30}px;display:flex;gap:0;width:${WIDTH - 108}px;">
        <div style="flex:1;text-align:center;">
          <p style="font-family:${NARROW};font-size:22px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.45);margin:0;">Before</p>
        </div>
        <div style="flex:1;text-align:center;">
          <p style="font-family:${NARROW};font-size:22px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:${ACCENT_WARM};margin:0;">After</p>
        </div>
      </div>
    </div>
  `
}

// ─── SLIDE 2: ANIMATED — Side-by-side reveals ───
// Left = casual/candid (cool/muted), Right = polished editorial (warm/vibrant)
// Multiple pairs animate in sequence
function slideTwoAnimated(images) {
  // 3 pairs of before/after images
  const pairs = [
    { before: images.beforeA, after: images.afterA },
    { before: images.beforeB, after: images.afterB },
    { before: images.beforeC, after: images.afterC },
  ]

  const PAIR_HEIGHT = 380
  const GAP = 16
  const PAD = 28
  const HALF_W = (WIDTH - PAD * 2 - GAP) / 2 // ~514px each side
  const TOP_START = 260
  const DIVIDER_X = PAD + HALF_W + GAP / 2

  let pairsHtml = ''
  for (let i = 0; i < pairs.length; i++) {
    const y = TOP_START + i * (PAIR_HEIGHT + GAP)
    const delay = i * 1.4 // stagger each pair by 1.4s

    // Before side (left) — cool desaturated overlay
    pairsHtml += `
      <div class="pair-before pair-${i}" style="position:absolute;left:${PAD}px;top:${y}px;width:${HALF_W}px;height:${PAIR_HEIGHT}px;border-radius:12px;overflow:hidden;opacity:0;transform:translateX(-30px);animation:slideInLeft 0.7s ease-out ${delay}s forwards;">
        <img src="${pairs[i].before}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center;filter:saturate(0.35) brightness(0.85);"/>
        <div style="position:absolute;inset:0;background:rgba(100,120,140,0.15);"></div>
      </div>
    `

    // After side (right) — warm vibrant
    pairsHtml += `
      <div class="pair-after pair-${i}" style="position:absolute;left:${DIVIDER_X + GAP / 2}px;top:${y}px;width:${HALF_W}px;height:${PAIR_HEIGHT}px;border-radius:12px;overflow:hidden;opacity:0;transform:translateX(30px);animation:slideInRight 0.7s ease-out ${delay + 0.4}s forwards;">
        <img src="${pairs[i].after}" style="width:100%;height:100%;display:block;object-fit:cover;object-position:center;"/>
        <div style="position:absolute;inset:0;background:linear-gradient(135deg, rgba(255,150,80,0.08) 0%, rgba(255,107,43,0.05) 100%);"></div>
      </div>
    `
  }

  // Calculate total animation duration:
  // Last pair starts at delay = 2*1.4 = 2.8s, after side at 2.8+0.4=3.2s, animation 0.7s = 3.9s
  // + hold time

  return `<!DOCTYPE html>
  <html>
    <head>
      <style>
        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; background: #0a0a0a; }
        @keyframes slideInLeft {
          0% { opacity: 0; transform: translateX(-30px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          0% { opacity: 0; transform: translateX(30px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes headerFade {
          0% { opacity: 0; transform: translateY(-16px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes dividerGrow {
          0% { transform: scaleY(0); }
          100% { transform: scaleY(1); }
        }
        @keyframes labelFade {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .header { opacity: 0; animation: headerFade 0.5s ease-out 0s forwards; }
        .divider-line { transform: scaleY(0); transform-origin: top; animation: dividerGrow 0.8s ease-out 0.2s forwards; }
        .label-before { opacity: 0; animation: labelFade 0.4s ease-out 0.6s forwards; }
        .label-after { opacity: 0; animation: labelFade 0.4s ease-out 0.8s forwards; }
      </style>
    </head>
    <body>
      <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#0a0a0a;">

        <!-- Header -->
        <div class="header" style="position:absolute;left:54px;top:62px;right:54px;">
          <p style="font-family:${NARROW};font-size:80px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${MANILA_COLOR};margin:0 0 10px;">MANILA</p>
          <h2 style="font-family:${BOLD};font-size:48px;font-weight:800;line-height:1.0;color:#fff;margin:0;letter-spacing:-0.01em;">The transformation.</h2>
        </div>

        <!-- Vertical divider -->
        <div class="divider-line" style="position:absolute;left:${DIVIDER_X}px;top:${TOP_START - 30}px;width:3px;height:${3 * PAIR_HEIGHT + 2 * GAP + 60}px;background:linear-gradient(180deg, ${MANILA_COLOR}, rgba(255,107,43,0.2));border-radius:2px;"></div>

        <!-- Before/After labels -->
        <div class="label-before" style="position:absolute;left:${PAD}px;top:${TOP_START - 36}px;width:${HALF_W}px;text-align:center;">
          <p style="font-family:${NARROW};font-size:20px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:rgba(255,255,255,0.4);margin:0;">You now</p>
        </div>
        <div class="label-after" style="position:absolute;left:${DIVIDER_X + GAP / 2}px;top:${TOP_START - 36}px;width:${HALF_W}px;text-align:center;">
          <p style="font-family:${NARROW};font-size:20px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:${ACCENT_WARM};margin:0;">After the shoot</p>
        </div>

        ${pairsHtml}
      </div>
    </body>
  </html>`
}

// ─── SLIDE 3: "The difference? One afternoon." ───
function slideThree(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#0a0a0a;">
      <!-- Background image -->
      <img src="${images.process}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 30%;"/>

      <!-- Dark overlay -->
      <div style="position:absolute;inset:0;background:rgba(0,0,0,0.7);"></div>

      <!-- Top gradient for extra text contrast -->
      <div style="position:absolute;left:0;right:0;top:0;height:500px;background:linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%);"></div>

      <!-- MANILA -->
      <div style="position:absolute;left:54px;top:72px;right:54px;">
        <p style="font-family:${NARROW};font-size:80px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${MANILA_COLOR};margin:0 0 16px;">MANILA</p>
        <h2 style="font-family:${BOLD};font-size:68px;font-weight:800;line-height:1.0;color:#fff;margin:0 0 8px;letter-spacing:-0.02em;">The difference?</h2>
        <p style="font-family:${BOLD};font-size:52px;font-weight:700;color:${ACCENT_WARM};margin:0;">One afternoon.</p>
      </div>

      <!-- 3 simple steps overlaid -->
      <div style="position:absolute;left:54px;top:440px;right:54px;display:flex;flex-direction:column;gap:24px;">
        <div style="display:flex;align-items:flex-start;gap:24px;">
          <div style="min-width:64px;height:64px;border-radius:50%;background:${MANILA_COLOR};display:flex;align-items:center;justify-content:center;">
            <span style="font-family:${BOLD};font-size:30px;font-weight:800;color:#fff;">1</span>
          </div>
          <div style="padding-top:6px;">
            <p style="font-family:${BOLD};font-size:38px;font-weight:700;color:#fff;margin:0 0 6px;line-height:1.1;">Sign up below</p>
            <p style="font-family:${BODY};font-size:26px;color:rgba(255,255,255,0.7);margin:0;line-height:1.3;">60-second form. I message you back.</p>
          </div>
        </div>

        <div style="width:3px;height:32px;background:rgba(255,107,43,0.3);margin-left:31px;border-radius:2px;"></div>

        <div style="display:flex;align-items:flex-start;gap:24px;">
          <div style="min-width:64px;height:64px;border-radius:50%;background:${MANILA_COLOR};display:flex;align-items:center;justify-content:center;">
            <span style="font-family:${BOLD};font-size:30px;font-weight:800;color:#fff;">2</span>
          </div>
          <div style="padding-top:6px;">
            <p style="font-family:${BOLD};font-size:38px;font-weight:700;color:#fff;margin:0 0 6px;line-height:1.1;">We pick a date</p>
            <p style="font-family:${BODY};font-size:26px;color:rgba(255,255,255,0.7);margin:0;line-height:1.3;">Location, vibe, and look — planned together.</p>
          </div>
        </div>

        <div style="width:3px;height:32px;background:rgba(255,107,43,0.3);margin-left:31px;border-radius:2px;"></div>

        <div style="display:flex;align-items:flex-start;gap:24px;">
          <div style="min-width:64px;height:64px;border-radius:50%;background:${MANILA_COLOR};display:flex;align-items:center;justify-content:center;">
            <span style="font-family:${BOLD};font-size:30px;font-weight:800;color:#fff;">3</span>
          </div>
          <div style="padding-top:6px;">
            <p style="font-family:${BOLD};font-size:38px;font-weight:700;color:#fff;margin:0 0 6px;line-height:1.1;">Show up. I guide you.</p>
            <p style="font-family:${BODY};font-size:26px;color:rgba(255,255,255,0.7);margin:0;line-height:1.3;">No posing experience needed.</p>
          </div>
        </div>
      </div>
    </div>
  `
}

// ─── SLIDE 4: CTA — "Your turn. MANILA." ───
function slideFour(images) {
  return `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#000;">
      <!-- Full-bleed best photo -->
      <img src="${images.cta}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 30%;"/>

      <!-- Top gradient -->
      <div style="position:absolute;left:0;right:0;top:0;height:800px;background:linear-gradient(180deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0) 100%);"></div>

      <!-- Bottom gradient -->
      <div style="position:absolute;left:0;right:0;bottom:0;height:${SAFE_BOTTOM + 120}px;background:linear-gradient(0deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 100%);"></div>

      <!-- Text content -->
      <div style="position:absolute;left:54px;top:72px;right:54px;">
        <p style="font-family:${NARROW};font-size:80px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${MANILA_COLOR};margin:0 0 20px;text-shadow:0 2px 20px rgba(0,0,0,0.5);">MANILA</p>
        <h2 style="font-family:${BOLD};font-size:96px;font-weight:800;line-height:0.95;color:#fff;margin:0 0 28px;letter-spacing:-0.02em;text-shadow:0 2px 16px rgba(0,0,0,0.4);">Your turn.</h2>
        <p style="font-family:${BODY};font-size:36px;font-weight:500;line-height:1.35;color:rgba(255,255,255,0.92);margin:0 0 40px;text-shadow:0 1px 8px rgba(0,0,0,0.4);">Sign up below.<br/>60-second form. I'll message<br/>you back within a day.</p>
      </div>

      <!-- Urgency badge -->
      <div style="position:absolute;left:54px;top:560px;display:inline-flex;align-items:center;gap:10px;padding:16px 28px;border-radius:16px;background:rgba(255,107,43,0.2);backdrop-filter:blur(16px);border:1px solid rgba(255,107,43,0.4);">
        <div style="width:10px;height:10px;border-radius:50%;background:${MANILA_COLOR};"></div>
        <span style="font-family:${BOLD};font-size:26px;font-weight:700;color:#fff;letter-spacing:0.02em;">Limited spots this month</span>
      </div>
    </div>
  `
}

async function render() {
  resetOutputDir()

  const all = getTopManilaImages()

  // Image selection:
  // hero = stunning full-bleed portfolio shot for slide 1
  // beforeA/B/C = casual/candid-looking images (simpler compositions, wider shots)
  // afterA/B/C = polished editorial results (strong portraits, tight compositions)
  // process = background for slide 3
  // cta = best photo for slide 4
  const selection = {
    hero: 'manila-gallery-street-001.jpg',      // Strong full-bleed hero
    beforeA: 'manila-gallery-garden-002.jpg',    // Wider/casual landscape vibe
    afterA: 'manila-gallery-closeup-001.jpg',    // Polished portrait result
    beforeB: 'manila-gallery-rocks-001.jpg',     // Casual outdoor landscape
    afterB: 'manila-gallery-graffiti-001.jpg',   // Strong editorial portrait
    beforeC: 'manila-gallery-ivy-001.jpg',       // Casual/natural wider shot
    afterC: 'manila-gallery-urban-001.jpg',      // Polished urban editorial
    process: 'manila-gallery-tropical-001.jpg',  // Beautiful BG for steps overlay
    cta: 'manila-gallery-statue-001.jpg',        // Best photo for final CTA
  }

  writeSources({ all_considered: all, selected: selection })

  const images = Object.fromEntries(
    Object.entries(selection).map(([key, file]) => [key, readImage(file)])
  )

  // --- Render static slides (1, 3, 4) as PNGs ---
  const staticSlides = [
    ['01_hook_story.png', wrap(slideOne(images))],
    ['03_difference_story.png', wrap(slideThree(images))],
    ['04_cta_story.png', wrap(slideFour(images))]
  ]

  const browser = await chromium.launch()
  const staticCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1
  })

  for (const [filename, html] of staticSlides) {
    const page = await staticCtx.newPage()
    await page.setContent(html, { waitUntil: 'load' })
    await page.waitForTimeout(200)
    await page.screenshot({ path: path.join(OUT_DIR, filename), type: 'png' })
    await page.close()
    console.log(`Rendered ${filename}`)
  }
  await staticCtx.close()

  // --- Render slide 2 as animated MP4 video ---
  console.log('Recording animated side-by-side slide as MP4...')

  // 3 pairs * 1.4s stagger = 2.8s for last pair start
  // + 0.4s offset for after side + 0.7s animation = 3.9s for last element
  // + 1.5s hold = ~5.5s total
  const TOTAL_DURATION_MS = 5500

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
  await videoPage.waitForTimeout(500) // Let images load
  await videoPage.waitForTimeout(TOTAL_DURATION_MS)

  await videoPage.close()
  await videoCtx.close()

  // Convert WebM to MP4
  const videoFiles = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.webm'))
  if (videoFiles.length === 0) {
    console.error('No video file was generated!')
  } else {
    const srcVideo = path.join(OUT_DIR, videoFiles[0])
    const dstVideo = path.join(OUT_DIR, '02_transformation_story.mp4')

    const { execSync } = await import('child_process')
    try {
      execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${dstVideo}"`, {
        stdio: 'pipe'
      })
      fs.unlinkSync(srcVideo)
      console.log('Rendered 02_transformation_story.mp4')
    } catch (err) {
      console.warn('ffmpeg not available, keeping as webm and renaming to mp4...')
      fs.renameSync(srcVideo, dstVideo)
      console.log('Rendered 02_transformation_story.mp4 (webm container)')
    }
  }

  await browser.close()
  console.log(`Done: 3 static PNGs + 1 animated MP4 written to ${OUT_DIR}`)
}

render().catch(error => {
  console.error(error)
  process.exit(1)
})
