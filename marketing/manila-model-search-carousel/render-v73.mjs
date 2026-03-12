import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v73')

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 410

const SF = "-apple-system, 'Helvetica Neue', Arial, sans-serif"
const MANILA_COLOR = '#E8443A'
const IG_BG = '#000'

const TOTAL_DURATION_MS = 28000

const PHOTOS = [
  'manila-gallery-dsc-0190.jpg',
  'manila-gallery-night-001.jpg',
  'manila-gallery-garden-001.jpg',
  'manila-gallery-urban-001.jpg',
  'manila-gallery-dsc-0075.jpg',
]

const VIEWER_NAMES = [
  'sarah.mp4', 'jakeinthecity', 'manila.vibes', 'photoloverkate',
  'wanderlust.jm', 'itsmariaaa', 'bgc.explorer', 'creativejuan',
  'travelnikki', 'lens.boy.ph', 'studio.aly', 'dreamer.jas',
  'urbanklicks', 'sophiaaarts', 'golden.hour.sam', 'vibes.by.ana',
  'roam.with.rj', 'shuttercraft', 'manila.moods', 'thecitywalk',
  'lightroomluv', 'hey.its.mika', 'portraitpablo', 'filmbynico',
  'streetglam.ph', 'chasing.dawn', 'artbyluna', 'pixxie.dust',
  'capturedbykai', 'sunsetkween', 'focusfern', 'vibecheck.mn',
  'clicksbycarla', 'nofilter.rj', 'thegridwalk', 'lensofleah',
  'framebyjay', 'goldenvista', 'tintypes.co', 'modelmoment',
]

// Which viewer indices get a heart reaction
const HEART_INDICES = new Set([0, 2, 5, 7, 11, 14, 18, 22, 25, 29, 33, 37])

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

function avatarColor(i) {
  const colors = [
    '#E8443A', '#3797f0', '#4cd964', '#ff9500', '#af52de',
    '#ff2d55', '#5ac8fa', '#ffcc00', '#ff6b6b', '#34c759',
    '#007aff', '#ff9f0a', '#bf5af2', '#64d2ff', '#30d158',
  ]
  return colors[i % colors.length]
}

function buildHTML(imageDataMap) {
  // Build viewer rows HTML
  let viewerRowsHTML = ''
  for (let i = 0; i < VIEWER_NAMES.length; i++) {
    const name = VIEWER_NAMES[i]
    const color = avatarColor(i)
    const hasHeart = HEART_INDICES.has(i)
    const initials = name.substring(0, 2).toUpperCase()
    viewerRowsHTML += `
      <div class="viewer-row" id="viewer-${i}" style="opacity:0; transform:translateX(-20px);">
        <div class="viewer-avatar" style="background:${color};">
          <span class="viewer-initials">${initials}</span>
        </div>
        <div class="viewer-name-area">
          <span class="viewer-name">${name}</span>
          ${hasHeart ? `<span class="viewer-heart" id="heart-${i}" style="opacity:0; transform:scale(0);">❤️</span>` : ''}
        </div>
      </div>`
  }

  return `<!DOCTYPE html>
<html>
<head>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { margin: 0; padding: 0; background: ${IG_BG}; -webkit-font-smoothing: antialiased; }

  .page {
    width: ${WIDTH}px;
    height: ${HEIGHT}px;
    position: relative;
    overflow: hidden;
    background: ${IG_BG};
    font-family: ${SF};
  }

  /* ===== STORY FULLSCREEN ===== */
  .story-view {
    position: absolute;
    inset: 0;
    z-index: 10;
  }

  .story-image {
    position: absolute;
    inset: 0;
    z-index: 1;
  }

  .story-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .story-gradient-top {
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 200px;
    background: linear-gradient(rgba(0,0,0,0.5), transparent);
    z-index: 3;
  }

  .story-gradient-bottom {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 300px;
    background: linear-gradient(transparent, rgba(0,0,0,0.6));
    z-index: 3;
  }

  /* Progress bar */
  .story-progress {
    position: absolute;
    top: 50px;
    left: 16px;
    right: 16px;
    height: 3px;
    z-index: 5;
    display: flex;
    gap: 4px;
  }

  .story-progress-bar {
    flex: 1;
    background: rgba(255,255,255,0.3);
    border-radius: 2px;
    overflow: hidden;
  }

  .story-progress-fill {
    height: 100%;
    background: #fff;
    width: 100%;
  }

  .story-progress-fill.active {
    width: 0%;
    animation: progressFill 26s linear 0s forwards;
  }

  @keyframes progressFill {
    0% { width: 0%; }
    100% { width: 100%; }
  }

  /* Story header */
  .story-header {
    position: absolute;
    top: 64px;
    left: 16px;
    right: 16px;
    z-index: 5;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .story-avatar-ring {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid #fff;
  }

  .story-avatar-ring img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .story-username {
    font-size: 26px;
    font-weight: 600;
    color: #fff;
    text-shadow: 0 1px 4px rgba(0,0,0,0.5);
  }

  .story-time {
    font-size: 22px;
    color: rgba(255,255,255,0.7);
    text-shadow: 0 1px 4px rgba(0,0,0,0.5);
  }

  .story-close {
    margin-left: auto;
    font-size: 36px;
    color: #fff;
    text-shadow: 0 1px 4px rgba(0,0,0,0.5);
    line-height: 1;
  }

  /* Bottom bar: eye icon + view count */
  .story-bottom-bar {
    position: absolute;
    bottom: ${SAFE_BOTTOM + 40}px;
    left: 0;
    right: 0;
    z-index: 5;
    display: flex;
    align-items: center;
    padding: 0 24px;
  }

  .view-count-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    border-radius: 24px;
    cursor: pointer;
    transition: background 0.2s;
  }

  .view-count-btn:hover {
    background: rgba(255,255,255,0.1);
  }

  .eye-icon {
    font-size: 28px;
    filter: drop-shadow(0 1px 3px rgba(0,0,0,0.5));
  }

  .view-count-text {
    font-size: 28px;
    font-weight: 600;
    color: #fff;
    text-shadow: 0 1px 4px rgba(0,0,0,0.5);
  }

  /* Tap indicator */
  .tap-indicator {
    position: absolute;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: rgba(255,255,255,0.3);
    z-index: 6;
    opacity: 0;
    transform: scale(0);
    pointer-events: none;
  }

  @keyframes tapPulse {
    0% { opacity: 0; transform: scale(0); }
    30% { opacity: 0.6; transform: scale(1); }
    100% { opacity: 0; transform: scale(1.4); }
  }

  /* ===== VIEWER HALF-SHEET ===== */
  .viewer-sheet {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 65%;
    z-index: 20;
    background: #262626;
    border-radius: 24px 24px 0 0;
    transform: translateY(100%);
    overflow: hidden;
  }

  .sheet-drag-handle {
    width: 48px;
    height: 5px;
    background: #555;
    border-radius: 3px;
    margin: 12px auto 0;
  }

  /* Tabs */
  .sheet-tabs {
    display: flex;
    padding: 16px 24px 0;
    gap: 0;
    border-bottom: 1px solid #363636;
  }

  .sheet-tab {
    flex: 1;
    text-align: center;
    padding: 12px 0 16px;
    font-size: 28px;
    font-weight: 600;
    color: #888;
    position: relative;
    cursor: pointer;
    transition: color 0.2s;
  }

  .sheet-tab.active {
    color: #fff;
  }

  .sheet-tab-indicator {
    position: absolute;
    bottom: -1px;
    left: 10%;
    right: 10%;
    height: 2px;
    background: #fff;
    border-radius: 1px;
    opacity: 0;
    transition: opacity 0.2s;
  }

  .sheet-tab.active .sheet-tab-indicator {
    opacity: 1;
  }

  /* Viewer count in header */
  .sheet-viewer-count {
    padding: 16px 24px 8px;
    font-size: 24px;
    color: #888;
    font-weight: 400;
  }

  .sheet-viewer-count span {
    color: #fff;
    font-weight: 600;
  }

  /* Viewer list container */
  .viewer-list {
    padding: 0 24px;
    overflow: hidden;
    height: calc(100% - 150px);
  }

  .viewer-list-inner {
    transition: transform 0.4s ease-out;
  }

  .viewer-row {
    display: flex;
    align-items: center;
    padding: 14px 0;
    gap: 14px;
    transition: opacity 0.3s ease-out, transform 0.3s ease-out;
  }

  .viewer-avatar {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .viewer-initials {
    font-size: 20px;
    font-weight: 700;
    color: #fff;
  }

  .viewer-name-area {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .viewer-name {
    font-size: 28px;
    font-weight: 400;
    color: #fff;
  }

  .viewer-heart {
    font-size: 22px;
    transition: opacity 0.3s, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  /* ===== CTA OVERLAY ===== */
  .cta-overlay {
    position: absolute;
    inset: 0;
    z-index: 30;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    opacity: 0;
    pointer-events: none;
  }

  .cta-scrim {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.75);
    z-index: 0;
  }

  .cta-content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 32px;
    padding: 0 60px;
  }

  .cta-line {
    text-align: center;
    opacity: 0;
    transform: translateY(24px);
    transition: opacity 0.6s ease-out, transform 0.6s ease-out;
  }

  .cta-line.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .cta-line1 {
    font-size: 56px;
    font-weight: 700;
    color: #fff;
    line-height: 1.3;
  }

  .cta-line2 {
    font-size: 48px;
    font-weight: 700;
    color: ${MANILA_COLOR};
    line-height: 1.3;
  }

  .cta-line3 {
    font-size: 40px;
    font-weight: 500;
    color: rgba(255,255,255,0.6);
    line-height: 1.3;
  }
</style>
</head>
<body>
  <div class="page">

    <!-- ===== STORY VIEW ===== -->
    <div class="story-view" id="storyView">
      <div class="story-image">
        <img src="${imageDataMap[PHOTOS[0]]}" alt="story" />
      </div>
      <div class="story-gradient-top"></div>
      <div class="story-gradient-bottom"></div>

      <div class="story-progress">
        <div class="story-progress-bar"><div class="story-progress-fill" style="width:100%;"></div></div>
        <div class="story-progress-bar"><div class="story-progress-fill active"></div></div>
        <div class="story-progress-bar"><div class="story-progress-fill" style="width:0%;"></div></div>
      </div>

      <div class="story-header">
        <div class="story-avatar-ring">
          <img src="${imageDataMap[PHOTOS[4]]}" alt="avatar" />
        </div>
        <span class="story-username">you</span>
        <span class="story-time">2h</span>
        <span class="story-close">&times;</span>
      </div>

      <!-- Bottom: eye + view count -->
      <div class="story-bottom-bar">
        <div class="view-count-btn" id="viewCountBtn">
          <span class="eye-icon">👁</span>
          <span class="view-count-text" id="viewCountText">47</span>
        </div>
      </div>

      <!-- Tap indicator circle -->
      <div class="tap-indicator" id="tapIndicator"></div>
    </div>

    <!-- ===== VIEWER HALF-SHEET ===== -->
    <div class="viewer-sheet" id="viewerSheet">
      <div class="sheet-drag-handle"></div>

      <div class="sheet-tabs">
        <div class="sheet-tab active" id="tabViewers">
          Viewers
          <div class="sheet-tab-indicator"></div>
        </div>
        <div class="sheet-tab" id="tabLikes">
          ♥ Likes
          <div class="sheet-tab-indicator"></div>
        </div>
      </div>

      <div class="sheet-viewer-count" id="sheetViewerCount">
        <span id="sheetCountNum">47</span> viewers
      </div>

      <div class="viewer-list" id="viewerList">
        <div class="viewer-list-inner" id="viewerListInner">
          ${viewerRowsHTML}
        </div>
      </div>
    </div>

    <!-- ===== CTA OVERLAY ===== -->
    <div class="cta-overlay" id="ctaOverlay">
      <div class="cta-scrim"></div>
      <div class="cta-content">
        <div class="cta-line cta-line1" id="ctaLine1">this could be your story</div>
        <div class="cta-line cta-line2" id="ctaLine2">dm me if interested!!</div>
        <div class="cta-line cta-line3" id="ctaLine3">@madebyaidan on Instagram</div>
      </div>
    </div>

  </div>

  <script>
    // ===== TIMING CONSTANTS =====
    const TAP_TIME = 3200;       // when tap animation fires
    const SHEET_UP_TIME = 4000;  // sheet slides up
    const SHEET_DOWN_TIME = 20000; // sheet slides down
    const CTA_START = 21000;     // CTA starts appearing

    // ===== PHASE 1: TAP ANIMATION =====
    setTimeout(() => {
      const tap = document.getElementById('tapIndicator');
      const btn = document.getElementById('viewCountBtn');
      if (!tap || !btn) return;
      const rect = btn.getBoundingClientRect();
      tap.style.left = (rect.left + rect.width / 2 - 40) + 'px';
      tap.style.top = (rect.top + rect.height / 2 - 40) + 'px';
      tap.style.animation = 'tapPulse 0.6s ease-out forwards';
    }, TAP_TIME);

    // ===== PHASE 2: SHEET SLIDES UP =====
    setTimeout(() => {
      const sheet = document.getElementById('viewerSheet');
      if (sheet) {
        sheet.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
        sheet.style.transform = 'translateY(0)';
      }
    }, SHEET_UP_TIME);

    // Reveal viewer rows one by one after sheet is up
    const REVEAL_START = SHEET_UP_TIME + 600;
    const ROW_STAGGER = 180;
    let viewerCount = 47;
    const countEl = document.getElementById('sheetCountNum');
    const viewCountText = document.getElementById('viewCountText');

    for (let i = 0; i < ${VIEWER_NAMES.length}; i++) {
      setTimeout(() => {
        const row = document.getElementById('viewer-' + i);
        if (row) {
          row.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
          row.style.opacity = '1';
          row.style.transform = 'translateX(0)';
        }
        // Increment viewer count
        viewerCount++;
        if (countEl) countEl.textContent = viewerCount;
        if (viewCountText) viewCountText.textContent = viewerCount;
      }, REVEAL_START + i * ROW_STAGGER);

      // Heart reactions pop in slightly after the row appears
      ${JSON.stringify([...HEART_INDICES])}.forEach(hi => {
        if (hi === i) {
          setTimeout(() => {
            const heart = document.getElementById('heart-' + hi);
            if (heart) {
              heart.style.opacity = '1';
              heart.style.transform = 'scale(1)';
            }
          }, REVEAL_START + i * ROW_STAGGER + 400);
        }
      });
    }

    // Auto-scroll the viewer list slowly
    let scrollOffset = 0;
    const SCROLL_START = REVEAL_START + 2000;
    const SCROLL_SPEED = 0.6; // px per frame
    let scrolling = false;

    setTimeout(() => {
      scrolling = true;
      function scrollList() {
        if (!scrolling) return;
        scrollOffset += SCROLL_SPEED;
        const inner = document.getElementById('viewerListInner');
        if (inner) {
          inner.style.transform = 'translateY(-' + scrollOffset + 'px)';
        }
        requestAnimationFrame(scrollList);
      }
      requestAnimationFrame(scrollList);
    }, SCROLL_START);

    // Switch to Likes tab briefly at 14s
    setTimeout(() => {
      const tabV = document.getElementById('tabViewers');
      const tabL = document.getElementById('tabLikes');
      if (tabV) tabV.classList.remove('active');
      if (tabL) tabL.classList.add('active');

      // Show only hearted viewers (hide others)
      for (let i = 0; i < ${VIEWER_NAMES.length}; i++) {
        const row = document.getElementById('viewer-' + i);
        if (row) {
          const isHearted = ${JSON.stringify([...HEART_INDICES])}.includes(i);
          if (!isHearted) {
            row.style.opacity = '0';
            row.style.maxHeight = '0';
            row.style.padding = '0';
            row.style.overflow = 'hidden';
          }
        }
      }

      // Update count for likes
      const sc = document.getElementById('sheetViewerCount');
      if (sc) sc.innerHTML = '<span>${HEART_INDICES.size}</span> likes';
    }, 14000);

    // Switch back to Viewers tab at 17s
    setTimeout(() => {
      const tabV = document.getElementById('tabViewers');
      const tabL = document.getElementById('tabLikes');
      if (tabV) tabV.classList.add('active');
      if (tabL) tabL.classList.remove('active');

      // Restore all rows
      for (let i = 0; i < ${VIEWER_NAMES.length}; i++) {
        const row = document.getElementById('viewer-' + i);
        if (row) {
          row.style.opacity = '1';
          row.style.maxHeight = '';
          row.style.padding = '';
          row.style.overflow = '';
        }
      }

      // Restore count
      const sc = document.getElementById('sheetViewerCount');
      if (sc) sc.innerHTML = '<span id="sheetCountNum">' + viewerCount + '</span> viewers';
    }, 17000);

    // ===== PHASE 3: SHEET SLIDES DOWN =====
    setTimeout(() => {
      scrolling = false;
      const sheet = document.getElementById('viewerSheet');
      if (sheet) {
        sheet.style.transition = 'transform 0.5s cubic-bezier(0.5, 0, 0.7, 0.2)';
        sheet.style.transform = 'translateY(100%)';
      }
    }, SHEET_DOWN_TIME);

    // ===== CTA OVERLAY =====
    setTimeout(() => {
      const cta = document.getElementById('ctaOverlay');
      if (cta) {
        cta.style.transition = 'opacity 0.6s ease-out';
        cta.style.opacity = '1';
      }
    }, CTA_START);

    const ctaLines = [
      { id: 'ctaLine1', delay: CTA_START + 400 },
      { id: 'ctaLine2', delay: CTA_START + 1200 },
      { id: 'ctaLine3', delay: CTA_START + 2000 },
    ];

    ctaLines.forEach(({ id, delay }) => {
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.classList.add('visible');
      }, delay);
    });
  </script>
</body>
</html>`;
}

async function render() {
  resetOutputDir()

  const imageDataMap = {}
  for (const photo of PHOTOS) {
    imageDataMap[photo] = readImage(photo)
  }

  writeSources({
    createdAt: new Date().toISOString(),
    strategy: 'v73 — IG story viewer list half-sheet experience',
    safeBottomPixels: SAFE_BOTTOM,
    photos: PHOTOS,
  })

  const { execSync } = await import('child_process')
  const browser = await chromium.launch()

  console.log('Recording story viewer list animation (v73)...')

  const videoCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: OUT_DIR,
      size: { width: WIDTH, height: HEIGHT },
    },
  })

  const videoPage = await videoCtx.newPage()

  // Set dark background before setContent to prevent white flash
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
  const finalMp4 = path.join(OUT_DIR, '01_story_insights.mp4')

  try {
    execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${finalMp4}"`, { stdio: 'pipe' })
    fs.unlinkSync(srcVideo)
    console.log('Rendered 01_story_insights.mp4')
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
