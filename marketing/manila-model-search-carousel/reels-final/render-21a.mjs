import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, "output-21a")

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 430
const SAFE_TOP = 213
const SAFE_LEFT = 66
const SAFE_RIGHT = 1027

const SF = "-apple-system, 'Helvetica Neue', Arial, sans-serif"
const MANILA_COLOR = '#E8443A'

const TOTAL_DURATION = 30
const TOTAL_DURATION_MS = 32000

const PHOTOS = [
  'manila-gallery-garden-001.jpg',   // wallpaper
  'manila-gallery-dsc-0190.jpg',     // photo preview 1 (single photo notif)
  'manila-gallery-night-001.jpg',    // unused
  'manila-gallery-urban-001.jpg',    // unused
  'manila-gallery-dsc-0075.jpg',     // profile pic
  'manila-gallery-canal-001.jpg',    // unused
]

// Different photos for the 3-photo notification
const MULTI_PHOTOS = [
  'manila-gallery-ivy-001.jpg',
  'manila-gallery-park-001.jpg',
  'manila-gallery-garden-002.jpg',
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
  // Timeline — notifications stack up telling a story
  // Extended to allow photo expansion pauses
  const T = {
    n1: 1.2,       // "hey, I'm a photographer in Manila"
    n2: 3.5,       // "sent a photo" — thumbnail
    n2expand: 4.3, // photo expands to full view
    n2shrink: 6.8, // photo shrinks back
    n3: 7.5,       // "I'm doing free photo shoots this week"
    n4: 9.5,       // "sent 3 photos" — thumbnails
    n4expand: 10.3,// photos expand to full view
    n4shrink: 13.5,// photos shrink back
    n5: 14.5,      // "no experience needed"
    n6: 17.0,      // "interested?"
    wallpaperShift: 19.0,
    ctaNotif: 20.5,
  }

  // Notification card component
  function notif(id, title, body, time, delay, options = {}) {
    const { thumbnail, isPhotos, isCTA, photoCount } = options
    const bgColor = isCTA
      ? `rgba(232, 68, 58, 0.25)`
      : `rgba(30, 30, 30, 0.85)`
    const borderColor = isCTA
      ? `rgba(232, 68, 58, 0.4)`
      : `rgba(255,255,255,0.08)`
    const scale = isCTA ? 1.02 : 1

    let thumbHTML = ''
    if (thumbnail) {
      thumbHTML = `<div style="width:88px;height:88px;border-radius:14px;overflow:hidden;flex-shrink:0;">
        <img src="${thumbnail}" style="width:100%;height:100%;object-fit:cover;object-position:center 20%;display:block;"/>
      </div>`
    }
    if (isPhotos && photoCount) {
      thumbHTML = `<div style="display:flex;gap:6px;flex-shrink:0;">
        ${Array.from({length: Math.min(photoCount, 3)}, (_, i) => {
          const photos = [imageDataMap[MULTI_PHOTOS[0]], imageDataMap[MULTI_PHOTOS[1]], imageDataMap[MULTI_PHOTOS[2]]]
          return `<div style="width:70px;height:70px;border-radius:12px;overflow:hidden;">
            <img src="${photos[i]}" style="width:100%;height:100%;object-fit:cover;object-position:center 20%;display:block;"/>
          </div>`
        }).join('')}
      </div>`
    }

    return `<div id="${id}" style="
      width: 1000px;
      margin: 0 auto 20px;
      background: ${bgColor};
      backdrop-filter: blur(40px);
      -webkit-backdrop-filter: blur(40px);
      border-radius: 28px;
      padding: 26px 30px;
      display: flex;
      align-items: flex-start;
      gap: 16px;
      opacity: 0;
      transform: translateY(50px) scale(0.96);
      animation: notifIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}s forwards;
      border: 1px solid ${borderColor};
      ${isCTA ? `box-shadow: 0 0 30px rgba(232, 68, 58, 0.2);` : ''}
    ">
      <!-- IG icon -->
      <div style="width:72px;height:72px;border-radius:18px;overflow:hidden;flex-shrink:0;background:linear-gradient(135deg, #833AB4, #C13584, #E1306C, #F77737, #FCAF45);display:flex;align-items:center;justify-content:center;">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="5" stroke="white" stroke-width="1.8" fill="none"/>
          <circle cx="12" cy="12" r="4.5" stroke="white" stroke-width="1.8" fill="none"/>
          <circle cx="18" cy="6" r="1.3" fill="white"/>
        </svg>
      </div>
      <!-- Content -->
      <div style="flex:1;min-width:0;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
          <span style="font-family:${SF};font-size:30px;font-weight:700;color:rgba(255,255,255,0.95);">Instagram</span>
          <span style="font-family:${SF};font-size:24px;color:rgba(255,255,255,0.45);">${time}</span>
        </div>
        <p style="font-family:${SF};font-size:32px;font-weight:600;color:rgba(255,255,255,0.9);margin:0 0 6px;line-height:1.3;">${title}</p>
        ${body ? `<p style="font-family:${SF};font-size:30px;color:${isCTA ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.6)'};margin:0;line-height:1.35;${isCTA ? 'font-weight:600;' : ''}">${body}</p>` : ''}
      </div>
      ${thumbHTML}
    </div>`
  }

  const notifications = [
    notif('n1', 'madebyaidan sent you a message',
      "hey! I'm a photographer doing free shoots in Manila",
      'now', T.n1),
    notif('n2', 'madebyaidan sent a photo', '',
      'now', T.n2, { thumbnail: imageDataMap[PHOTOS[1]] }),
    notif('n3', 'madebyaidan',
      "I'm doing free photo shoots this week — no experience needed",
      'now', T.n3),
    notif('n4', 'madebyaidan sent 3 photos', '',
      'now', T.n4, { isPhotos: true, photoCount: 3 }),
    notif('n5', 'madebyaidan',
      "I direct everything — posing, angles, all of it. you just show up",
      '1m ago', T.n5),
    notif('n6', 'madebyaidan',
      "interested?",
      '1m ago', T.n6),
    notif('n7', 'madebyaidan',
      "dm me if interested!! @madebyaidan",
      'now', T.ctaNotif, { isCTA: true }),
  ]

  const p = (t) => ((t / TOTAL_DURATION) * 100).toFixed(1)

  // Scroll as notifications pile up
  const scrollKf = `
    0% { transform: translateY(0); }
    ${p(T.n1)}% { transform: translateY(0); }
    ${p(T.n3)}% { transform: translateY(0); }
    ${p(T.n4)}% { transform: translateY(-120px); }
    ${p(T.n5)}% { transform: translateY(-300px); }
    ${p(T.n6)}% { transform: translateY(-480px); }
    ${p(T.ctaNotif)}% { transform: translateY(-620px); }
    ${p(T.ctaNotif + 1)}% { transform: translateY(-660px); }
    100% { transform: translateY(-660px); }
  `

  // Wallpaper crossfade
  const wallpaperKf = `
    0% { filter: blur(30px) brightness(0.35) saturate(1.2); }
    ${p(T.wallpaperShift)}% { filter: blur(30px) brightness(0.35) saturate(1.2); }
    ${p(T.wallpaperShift + 2)}% { filter: blur(15px) brightness(0.25) saturate(1.4); }
    100% { filter: blur(15px) brightness(0.25) saturate(1.4); }
  `

  return `<!DOCTYPE html>
<html>
<head>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { margin: 0; padding: 0; background: #000; -webkit-font-smoothing: antialiased; }

  @keyframes notifIn {
    0% { opacity: 0; transform: translateY(60px) scale(0.94); }
    50% { opacity: 1; transform: translateY(-6px) scale(1.01); }
    70% { transform: translateY(3px) scale(0.998); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
  }

  @keyframes notifScroll {
    ${scrollKf}
  }

  @keyframes wallpaperAnim {
    ${wallpaperKf}
  }

  @keyframes clockPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  @keyframes ctaGlow {
    0%, 100% { box-shadow: 0 0 20px rgba(232, 68, 58, 0.2); }
    50% { box-shadow: 0 0 40px rgba(232, 68, 58, 0.4); }
  }

  @keyframes badgeCount {
    0% { transform: scale(0); }
    60% { transform: scale(1.2); }
    100% { transform: scale(1); }
  }

  .page {
    width: ${WIDTH}px;
    height: ${HEIGHT}px;
    position: relative;
    overflow: hidden;
    background: #000;
  }
</style>
</head>
<body>
  <div class="page">

    <!-- Wallpaper — blurred photo -->
    <div style="position:absolute;inset:-40px;overflow:hidden;">
      <img src="${imageDataMap[PHOTOS[0]]}" style="width:120%;height:120%;object-fit:cover;object-position:center;display:block;
        animation: wallpaperAnim ${TOTAL_DURATION}s ease-in-out forwards;
        filter: blur(30px) brightness(0.35) saturate(1.2);"/>
    </div>

    <!-- Subtle gradient overlays -->
    <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 30%, transparent 60%, rgba(0,0,0,0.4) 100%);"></div>

    <!-- Status bar -->
    <div style="position:absolute;left:0;right:0;top:0;height:70px;padding:18px 40px 0;display:flex;align-items:center;justify-content:space-between;z-index:20;">
      <span style="font-family:${SF};font-size:26px;font-weight:600;color:#fff;">9:41</span>
      <div style="display:flex;align-items:center;gap:8px;">
        <!-- Signal -->
        <svg width="22" height="16" viewBox="0 0 18 12"><rect x="0" y="4" width="3" height="8" rx="1" fill="#fff"/><rect x="5" y="2" width="3" height="10" rx="1" fill="#fff"/><rect x="10" y="0" width="3" height="12" rx="1" fill="#fff"/><rect x="15" y="0" width="3" height="12" rx="1" fill="#fff" opacity="0.3"/></svg>
        <!-- WiFi -->
        <svg width="20" height="16" viewBox="0 0 18 14"><path d="M4 11 Q9 2 14 11" stroke="white" stroke-width="1.8" fill="none" opacity="0.5"/><path d="M6.5 11 Q9 5.5 11.5 11" stroke="white" stroke-width="1.8" fill="none"/><circle cx="9" cy="12" r="1.5" fill="white"/></svg>
        <!-- Battery -->
        <svg width="32" height="16" viewBox="0 0 27 13"><rect x="0" y="0" width="23" height="13" rx="3.5" stroke="#fff" stroke-width="1" fill="none"/><rect x="2" y="2" width="18" height="9" rx="2" fill="#fff"/><rect x="24" y="4" width="2" height="5" rx="1" fill="#fff" opacity="0.4"/></svg>
      </div>
    </div>

    <!-- Lock Screen Clock -->
    <div style="position:absolute;left:0;right:0;top:${SAFE_TOP}px;text-align:center;z-index:10;">
      <p style="font-family:${SF};font-size:30px;font-weight:400;color:rgba(255,255,255,0.65);margin:0 0 4px;letter-spacing:0.04em;">Wednesday, March 12</p>
      <p style="font-family:${SF};font-size:180px;font-weight:200;color:#fff;margin:0;line-height:1;letter-spacing:-0.04em;">
        9<span style="animation:clockPulse 2s step-end infinite;">:</span>41
      </p>
    </div>

    <!-- Notification badge counter on Dynamic Island area -->
    <div style="position:absolute;top:4px;left:50%;transform:translateX(60px);z-index:25;">
      <div id="badge" style="width:36px;height:36px;border-radius:50%;background:${MANILA_COLOR};display:flex;align-items:center;justify-content:center;opacity:0;transform:scale(0);">
        <span id="badgeNum" style="font-family:${SF};font-size:20px;font-weight:700;color:#fff;">1</span>
      </div>
    </div>

    <!-- Notification stack -->
    <div style="position:absolute;left:0;right:0;top:470px;bottom:${SAFE_BOTTOM}px;overflow:hidden;z-index:15;">
      <div id="notifStack" style="padding:20px 36px 500px;animation:notifScroll ${TOTAL_DURATION}s ease-in-out forwards;">
        ${notifications.join('\n')}
      </div>
    </div>

    <!-- Photo expansion overlay -->
    <div id="photoOverlay" style="
      position:absolute;inset:0;z-index:50;
      background:rgba(0,0,0,0);
      display:flex;align-items:center;justify-content:center;gap:16px;flex-wrap:wrap;padding:60px;
      pointer-events:none;opacity:0;
      transition:background 0.4s ease-out, opacity 0.4s ease-out;
    "></div>

    <!-- Home indicator -->
    <div style="position:absolute;bottom:12px;left:50%;transform:translateX(-50%);width:180px;height:5px;border-radius:3px;background:rgba(255,255,255,0.35);z-index:20;"></div>

  </div>

  <script>
    // Animate badge counter
    const badge = document.getElementById('badge')
    const badgeNum = document.getElementById('badgeNum')
    const times = [${T.n1}, ${T.n2}, ${T.n3}, ${T.n4}, ${T.n5}, ${T.n6}, ${T.ctaNotif}]
    let count = 0

    times.forEach((t, i) => {
      setTimeout(() => {
        count = i + 1
        badge.style.opacity = '1'
        badge.style.transform = 'scale(1)'
        badge.style.animation = 'badgeCount 0.3s ease-out'
        badgeNum.textContent = count
        // Reset animation
        setTimeout(() => {
          badge.style.animation = ''
        }, 300)
      }, t * 1000)
    })

    // Make CTA notification pulse after appearing
    setTimeout(() => {
      const cta = document.getElementById('n7')
      if (cta) {
        cta.style.animation = 'ctaGlow 2s ease-in-out infinite'
        cta.style.opacity = '1'
        cta.style.transform = 'translateY(0) scale(1)'
      }
    }, ${(T.ctaNotif + 0.8) * 1000})

    // ======= Photo expansion =======
    const overlay = document.getElementById('photoOverlay')
    const photoSrcs = {
      single: '${imageDataMap[PHOTOS[1]]}',
      multi: ['${imageDataMap[MULTI_PHOTOS[0]]}', '${imageDataMap[MULTI_PHOTOS[1]]}', '${imageDataMap[MULTI_PHOTOS[2]]}'],
    }

    function expandPhotos(srcs) {
      overlay.innerHTML = ''
      const isSingle = srcs.length === 1
      srcs.forEach((src, i) => {
        const img = document.createElement('div')
        const w = isSingle ? 860 : 460
        const h = isSingle ? 1150 : 600
        img.style.cssText = 'width:' + w + 'px;height:' + h + 'px;border-radius:20px;overflow:hidden;' +
          'opacity:0;transform:scale(0.5);transition:opacity 0.5s ease-out,transform 0.5s cubic-bezier(0.34,1.56,0.64,1);' +
          'box-shadow:0 20px 60px rgba(0,0,0,0.6);'
        img.innerHTML = '<img src="' + src + '" style="width:100%;height:100%;object-fit:cover;object-position:center 20%;display:block;"/>'
        overlay.appendChild(img)
        setTimeout(() => {
          img.style.opacity = '1'
          img.style.transform = 'scale(1)'
        }, 100 + i * 150)
      })
      overlay.style.opacity = '1'
      overlay.style.pointerEvents = 'auto'
      overlay.style.background = 'rgba(0,0,0,0.85)'
    }

    function collapsePhotos() {
      const imgs = overlay.querySelectorAll('div')
      imgs.forEach((img, i) => {
        setTimeout(() => {
          img.style.opacity = '0'
          img.style.transform = 'scale(0.6)'
        }, i * 80)
      })
      setTimeout(() => {
        overlay.style.opacity = '0'
        overlay.style.background = 'rgba(0,0,0,0)'
        overlay.style.pointerEvents = 'none'
      }, imgs.length * 80 + 300)
    }

    // Expand single photo after n2 arrives
    setTimeout(() => expandPhotos([photoSrcs.single]), ${T.n2expand * 1000})
    setTimeout(() => collapsePhotos(), ${T.n2shrink * 1000})

    // Expand 3 photos after n4 arrives
    setTimeout(() => expandPhotos(photoSrcs.multi), ${T.n4expand * 1000})
    setTimeout(() => collapsePhotos(), ${T.n4shrink * 1000})
  </script>
</body>
</html>`
}

async function render() {
  resetOutputDir()

  const imageDataMap = {}
  for (const photo of [...PHOTOS, ...MULTI_PHOTOS]) {
    imageDataMap[photo] = readImage(photo)
  }

  writeSources({
    createdAt: new Date().toISOString(),
    strategy: 'v51b — iPhone lock screen notification story, single continuous animation, DM CTA',
    safeBottomPixels: SAFE_BOTTOM,
    photos: PHOTOS,
  })

  const { execSync } = await import('child_process')
  const browser = await chromium.launch()

  console.log('Recording lock screen notification animation...')

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
    document.documentElement.style.background = '#000'
    document.body.style.background = '#000'
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
  const finalMp4 = path.join(OUT_DIR, '01_lockscreen_notifications.mp4')

  try {
    execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${finalMp4}"`, { stdio: 'pipe' })
    fs.unlinkSync(srcVideo)
    console.log('Rendered 01_lockscreen_notifications.mp4')
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
