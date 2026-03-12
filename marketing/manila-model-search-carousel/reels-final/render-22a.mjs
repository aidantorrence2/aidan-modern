import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, "output-22a")

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 430
const SAFE_TOP = 213
const SAFE_LEFT = 66
const SAFE_RIGHT = 1027

const SF = "-apple-system, 'Helvetica Neue', Arial, sans-serif"
const MANILA_COLOR = '#E8443A'

const TOTAL_DURATION_MS = 28000

const PHOTOS = [
  'manila-gallery-dsc-0190.jpg',
  'manila-gallery-night-001.jpg',
  'manila-gallery-garden-001.jpg',
  'manila-gallery-urban-001.jpg',
  'manila-gallery-dsc-0075.jpg',
  'manila-gallery-canal-001.jpg',
  'manila-gallery-ivy-001.jpg',
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
  // View count milestones that tick through
  const viewMilestones = [
    1, 3, 5, 8, 12, 19, 27, 38, 52, 71, 89,
    114, 156, 203, 267, 341, 458, 612, 834,
    1047, 1247, 1583, 2041, 2689, 3417, 4298, 5192, 5892,
    6841, 7923, 9104, 10287, 11834, 13492
  ]

  // Reactions that pop in during the view explosion
  const reactions = [
    { text: 'omg \u{1F60D}', delay: 5.5, x: 680, y: 420 },
    { text: 'who shot these??', delay: 7.0, x: 120, y: 520 },
    { text: 'you look insane', delay: 8.2, x: 580, y: 340 },
    { text: 'photographer??', delay: 9.5, x: 200, y: 600 },
    { text: 'need this', delay: 10.5, x: 650, y: 560 },
    { text: '\u{1F525}\u{1F525}\u{1F525}', delay: 11.2, x: 400, y: 380 },
    { text: 'wait what', delay: 12.0, x: 150, y: 450 },
    { text: 'HOW', delay: 12.8, x: 720, y: 480 },
  ]

  // Timeline
  const T = {
    // Story 1: Show photo, views start ticking
    story1Start: 0,
    viewsStart: 1.0,        // views begin ticking
    viewsAccelerate: 4.0,   // views start going crazy
    reactionsStart: 5.5,    // comments/reactions overlay

    // Swipe to story 2
    swipe1: 13.5,
    story2Start: 14.0,

    // Swipe to story 3 (with CTA overlay)
    swipe2: 17.5,
    story3Start: 18.0,

    // CTA overlay appears on story 3
    ctaStart: 21.0,
  }

  return `<!DOCTYPE html>
<html>
<head>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { margin: 0; padding: 0; background: #000; -webkit-font-smoothing: antialiased; }

  @keyframes fadeIn {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }

  @keyframes slideUp {
    0% { opacity: 0; transform: translateY(20px); }
    100% { opacity: 1; transform: translateY(0); }
  }

  @keyframes reactionPop {
    0% { opacity: 0; transform: scale(0) rotate(-5deg); }
    50% { opacity: 1; transform: scale(1.15) rotate(2deg); }
    70% { opacity: 1; transform: scale(0.95) rotate(-1deg); }
    100% { opacity: 1; transform: scale(1) rotate(0deg); }
  }

  @keyframes reactionFloat {
    0% { opacity: 1; transform: translateY(0); }
    80% { opacity: 0.8; transform: translateY(-30px); }
    100% { opacity: 0; transform: translateY(-50px); }
  }

  @keyframes swipeLeft {
    0% { transform: translateX(0); }
    100% { transform: translateX(-${WIDTH}px); }
  }

  @keyframes swipeIn {
    0% { transform: translateX(${WIDTH}px); }
    100% { transform: translateX(0); }
  }

  @keyframes progressFill {
    0% { width: 0%; }
    100% { width: 100%; }
  }

  @keyframes counterPulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.15); }
    100% { transform: scale(1); }
  }

  @keyframes glowPulse {
    0%, 100% { text-shadow: 0 0 10px rgba(255,255,255,0.3); }
    50% { text-shadow: 0 0 30px rgba(255,255,255,0.8), 0 0 60px rgba(232,68,58,0.4); }
  }

  @keyframes ctaSlideUp {
    0% { opacity: 0; transform: translateY(40px); }
    100% { opacity: 1; transform: translateY(0); }
  }

  @keyframes heartBurst {
    0% { opacity: 1; transform: scale(0); }
    50% { opacity: 1; transform: scale(1.5); }
    100% { opacity: 0; transform: scale(2) translateY(-40px); }
  }

  @keyframes viewCountShake {
    0%, 100% { transform: translateX(0); }
    10% { transform: translateX(-3px) rotate(-1deg); }
    30% { transform: translateX(3px) rotate(1deg); }
    50% { transform: translateX(-2px); }
    70% { transform: translateX(2px); }
    90% { transform: translateX(-1px); }
  }

  @keyframes numberRoll {
    0% { opacity: 0; transform: translateY(10px); }
    100% { opacity: 1; transform: translateY(0); }
  }

  .page {
    width: ${WIDTH}px;
    height: ${HEIGHT}px;
    position: relative;
    overflow: hidden;
    background: #000;
    font-family: ${SF};
  }

  /* Story photo background */
  .story-bg {
    position: absolute;
    inset: 0;
    z-index: 1;
  }

  .story-bg img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  /* Dark overlay for readability */
  .story-overlay {
    position: absolute;
    inset: 0;
    z-index: 2;
    background: linear-gradient(
      to bottom,
      rgba(0,0,0,0.6) 0%,
      rgba(0,0,0,0.1) 15%,
      rgba(0,0,0,0.0) 40%,
      rgba(0,0,0,0.1) 70%,
      rgba(0,0,0,0.7) 100%
    );
  }

  /* IG Story header: progress bars */
  .story-progress-bar {
    position: absolute;
    top: 60px;
    left: 16px;
    right: 16px;
    display: flex;
    gap: 4px;
    z-index: 20;
  }

  .progress-segment {
    flex: 1;
    height: 3px;
    background: rgba(255,255,255,0.3);
    border-radius: 2px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: #fff;
    width: 0%;
    border-radius: 2px;
  }

  /* IG Story header: username row */
  .story-header {
    position: absolute;
    top: 78px;
    left: 16px;
    right: 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    z-index: 20;
  }

  .story-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid #fff;
  }

  .story-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .story-username {
    font-size: 32px;
    font-weight: 600;
    color: #fff;
  }

  .story-time {
    font-size: 26px;
    color: rgba(255,255,255,0.6);
    margin-left: 4px;
  }

  /* Editorial header ABOVE the phone */
  .editorial-header {
    position: absolute;
    top: ${SAFE_TOP}px; left: 0; right: 0;
    height: 200px;
    z-index: 30;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #000;
  }

  .editorial-rule {
    width: 80%;
    height: 1px;
    background: rgba(255,255,255,0.3);
    margin-bottom: 20px;
  }

  .editorial-title {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 72px;
    font-weight: 700;
    font-style: italic;
    letter-spacing: 6px;
    text-transform: uppercase;
    color: #fff;
    text-align: center;
    margin: 0;
  }

  .editorial-subtitle {
    font-family: ${SF};
    font-size: 22px;
    font-weight: 500;
    letter-spacing: 8px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.5);
    margin-top: 10px;
  }

  .editorial-rule-bottom {
    width: 80%;
    height: 1px;
    background: rgba(255,255,255,0.3);
    margin-top: 20px;
  }

  /* Phone frame container */
  .phone-frame {
    position: absolute;
    top: ${SAFE_TOP + 200}px;
    left: 30px;
    right: 30px;
    bottom: 0;
    border-radius: 24px 24px 0 0;
    overflow: hidden;
    z-index: 5;
    border: 2px solid rgba(255,255,255,0.1);
    border-bottom: none;
  }

  /* Views counter at bottom-left */
  .views-counter {
    position: absolute;
    bottom: ${SAFE_BOTTOM + 30}px;
    left: 24px;
    display: flex;
    align-items: center;
    gap: 10px;
    z-index: 20;
    opacity: 0;
  }

  .eye-icon {
    width: 40px;
    height: 40px;
  }

  .view-count {
    font-size: 44px;
    font-weight: 700;
    color: #fff;
    letter-spacing: 0.5px;
    min-width: 60px;
  }

  /* Reaction overlays */
  .reaction {
    position: absolute;
    z-index: 15;
    padding: 12px 20px;
    background: rgba(0,0,0,0.7);
    backdrop-filter: blur(10px);
    border-radius: 24px;
    border: 1px solid rgba(255,255,255,0.15);
    opacity: 0;
  }

  .reaction p {
    font-size: 40px;
    color: #fff;
    white-space: nowrap;
    margin: 0;
  }

  /* Story slides container */
  .stories-track {
    position: absolute;
    inset: 0;
    z-index: 5;
    display: flex;
    width: 300%;
  }

  .story-slide {
    width: 33.3333%;
    height: 100%;
    position: relative;
    flex-shrink: 0;
  }

  /* CTA slide */
  .cta-content {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: ${SAFE_BOTTOM}px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 10;
    padding: 60px 48px;
  }

  .cta-question {
    font-size: 76px;
    font-weight: 800;
    color: #fff;
    text-align: center;
    line-height: 1.2;
    margin-bottom: 60px;
    opacity: 0;
  }

  .cta-action {
    padding: 28px 56px;
    background: ${MANILA_COLOR};
    border-radius: 50px;
    opacity: 0;
  }

  .cta-action p {
    font-size: 52px;
    font-weight: 700;
    color: #fff;
    margin: 0;
    text-align: center;
  }

  .cta-handle {
    margin-top: 36px;
    opacity: 0;
  }

  .cta-handle p {
    font-size: 42px;
    color: rgba(255,255,255,0.7);
    margin: 0;
    text-align: center;
  }

  /* Heart bursts for viral feel */
  .heart-burst {
    position: absolute;
    font-size: 60px;
    z-index: 18;
    opacity: 0;
    pointer-events: none;
  }
</style>
</head>
<body>
  <div class="page">

    <!-- Editorial header outside phone -->
    <div class="editorial-header">
      <div class="editorial-rule"></div>
      <p class="editorial-title">MANILA</p>
      <span class="editorial-subtitle">Free Photo Shoot</span>
      <div class="editorial-rule-bottom"></div>
    </div>

    <!-- Phone frame with story UI inside -->
    <div class="phone-frame">

    <!-- Stories track — slides horizontally -->
    <div class="stories-track" id="storiesTrack">

      <!-- ===== STORY 1 ===== -->
      <div class="story-slide" id="story1">
        <div class="story-bg">
          <img src="${imageDataMap[PHOTOS[0]]}" alt="story 1" />
        </div>
        <div class="story-overlay"></div>
      </div>

      <!-- ===== STORY 2 ===== -->
      <div class="story-slide" id="story2">
        <div class="story-bg">
          <img src="${imageDataMap[PHOTOS[1]]}" alt="story 2" />
        </div>
        <div class="story-overlay"></div>
      </div>

      <!-- ===== STORY 3 ===== -->
      <div class="story-slide" id="story3">
        <div class="story-bg">
          <img src="${imageDataMap[PHOTOS[2]]}" alt="story 3" />
        </div>
        <div class="story-overlay"></div>
        <!-- CTA overlay fades in on story 3 -->
        <div class="story-overlay" id="ctaDarken" style="background:rgba(0,0,0,0);transition:background 0.8s ease;"></div>
        <div class="cta-content">
          <div class="cta-question" id="ctaQuestion">want photos<br>like these?</div>
          <div class="cta-action" id="ctaAction">
            <p>dm me if interested!!</p>
          </div>
          <div class="cta-handle" id="ctaHandle">
            <p>@madebyaidan on Instagram</p>
          </div>
        </div>
      </div>

    </div>

    <!-- IG Story progress bars (persistent overlay) -->
    <div class="story-progress-bar" id="progressBar">
      <div class="progress-segment">
        <div class="progress-fill" id="prog1"></div>
      </div>
      <div class="progress-segment">
        <div class="progress-fill" id="prog2"></div>
      </div>
      <div class="progress-segment">
        <div class="progress-fill" id="prog3"></div>
      </div>
    </div>

    <!-- IG Story header -->
    <div class="story-header">
      <div class="story-avatar">
        <img src="${imageDataMap[PHOTOS[4]]}" alt="avatar" />
      </div>
      <span class="story-username">madebyaidan</span>
      <span class="story-time">2m</span>
    </div>

    <!-- Views counter -->
    <div class="views-counter" id="viewsCounter">
      <svg class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
      <span class="view-count" id="viewCount">0</span>
    </div>

    <!-- Reaction overlays -->
    ${reactions.map((r, i) => `
    <div class="reaction" id="reaction${i}" style="left:${r.x}px;top:${r.y}px;">
      <p>${r.text}</p>
    </div>
    `).join('')}

    <!-- Heart bursts -->
    <div class="heart-burst" id="heart0" style="right:80px;top:350px;">\u2764\uFE0F</div>
    <div class="heart-burst" id="heart1" style="right:140px;top:500px;">\u{1F9E1}</div>
    <div class="heart-burst" id="heart2" style="right:60px;top:600px;">\u{1F525}</div>
    <div class="heart-burst" id="heart3" style="right:200px;top:420px;">\u2764\uFE0F</div>
    <div class="heart-burst" id="heart4" style="right:100px;top:550px;">\u{1F60D}</div>

    </div><!-- close phone-frame -->

  </div>

  <script>
    const viewMilestones = ${JSON.stringify(viewMilestones)};
    const track = document.getElementById('storiesTrack');
    const viewCounter = document.getElementById('viewsCounter');
    const viewCountEl = document.getElementById('viewCount');

    let currentSlide = 0;

    // === Progress bar fills ===
    const prog1 = document.getElementById('prog1');
    const prog2 = document.getElementById('prog2');
    const prog3 = document.getElementById('prog3');

    // Story 1 progress: 0 -> 13.5s
    prog1.style.animation = 'progressFill ${T.swipe1}s linear ${T.story1Start}s forwards';

    // === Show views counter after 1s ===
    setTimeout(() => {
      viewCounter.style.opacity = '1';
      viewCounter.style.animation = 'slideUp 0.4s ease-out forwards';
    }, ${T.viewsStart * 1000});

    // === Animate view count ===
    // Phase 1: Slow ticks (1s to 4s) — first ~10 milestones
    // Phase 2: Accelerating (4s to 13s) — remaining milestones
    let milestoneIdx = 0;

    function formatCount(n) {
      if (n >= 10000) return (n / 1000).toFixed(1) + 'k';
      if (n >= 1000) return n.toLocaleString();
      return n.toString();
    }

    function animateViews() {
      const slowEnd = 10; // first 10 milestones are slow
      const totalMilestones = viewMilestones.length;

      // Slow phase: evenly spaced over viewsStart -> viewsAccelerate
      const slowDuration = (${T.viewsAccelerate} - ${T.viewsStart}) * 1000;
      for (let i = 0; i < Math.min(slowEnd, totalMilestones); i++) {
        const delay = ${T.viewsStart * 1000} + (slowDuration / slowEnd) * i;
        setTimeout(() => {
          viewCountEl.textContent = formatCount(viewMilestones[i]);
          viewCountEl.style.animation = 'none';
          void viewCountEl.offsetWidth;
          viewCountEl.style.animation = 'numberRoll 0.15s ease-out';
        }, delay);
      }

      // Fast phase: accelerating from viewsAccelerate -> swipe1
      const fastStart = ${T.viewsAccelerate * 1000};
      const fastEnd = ${T.swipe1 * 1000};
      const fastDuration = fastEnd - fastStart;
      const fastMilestones = totalMilestones - slowEnd;

      for (let i = 0; i < fastMilestones; i++) {
        // Use easing: milestones come faster and faster
        const progress = i / fastMilestones;
        const eased = progress * progress; // quadratic easing — accelerates
        const delay = fastStart + eased * fastDuration;
        const idx = slowEnd + i;
        setTimeout(() => {
          viewCountEl.textContent = formatCount(viewMilestones[idx]);
          viewCountEl.style.animation = 'none';
          void viewCountEl.offsetWidth;
          viewCountEl.style.animation = 'numberRoll 0.12s ease-out';

          // Shake counter when views get high
          if (viewMilestones[idx] >= 1000) {
            viewCounter.style.animation = 'none';
            void viewCounter.offsetWidth;
            viewCounter.style.animation = 'viewCountShake 0.3s ease-out';
          }

          // Pulse counter when hitting big numbers
          if (viewMilestones[idx] >= 5000) {
            viewCounter.style.animation = 'none';
            void viewCounter.offsetWidth;
            viewCounter.style.animation = 'viewCountShake 0.3s ease-out, glowPulse 0.8s ease-in-out';
          }
        }, delay);
      }

      // Continue counting on stories 2 & 3
      const story2Views = [14200, 15800, 17500, 19400, 21800, 24100, 27300];
      const story3Views = [30200, 34100, 38900, 43200, 48700, 52400];

      story2Views.forEach((v, i) => {
        const delay = ${T.story2Start * 1000} + (i + 1) * 450;
        setTimeout(() => {
          viewCountEl.textContent = formatCount(v);
          viewCountEl.style.animation = 'none';
          void viewCountEl.offsetWidth;
          viewCountEl.style.animation = 'numberRoll 0.12s ease-out';
          viewCounter.style.animation = 'none';
          void viewCounter.offsetWidth;
          viewCounter.style.animation = 'viewCountShake 0.3s ease-out, glowPulse 0.8s ease-in-out';
        }, delay);
      });

      story3Views.forEach((v, i) => {
        const delay = ${T.story3Start * 1000} + (i + 1) * 500;
        setTimeout(() => {
          viewCountEl.textContent = formatCount(v);
          viewCountEl.style.animation = 'none';
          void viewCountEl.offsetWidth;
          viewCountEl.style.animation = 'numberRoll 0.12s ease-out';
          viewCounter.style.animation = 'none';
          void viewCounter.offsetWidth;
          viewCounter.style.animation = 'viewCountShake 0.3s ease-out, glowPulse 0.8s ease-in-out';
        }, delay);
      });
    }

    animateViews();

    // === Reactions popping in ===
    const reactionData = ${JSON.stringify(reactions)};
    reactionData.forEach((r, i) => {
      setTimeout(() => {
        const el = document.getElementById('reaction' + i);
        if (el) {
          el.style.animation = 'reactionPop 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards';
          // Float away after 2.5s
          setTimeout(() => {
            el.style.animation = 'reactionFloat 1.2s ease-out forwards';
          }, 2500);
        }
      }, r.delay * 1000);
    });

    // === Heart bursts during viral moment ===
    const heartDelays = [6.0, 7.5, 9.0, 10.0, 11.5];
    heartDelays.forEach((d, i) => {
      setTimeout(() => {
        const h = document.getElementById('heart' + i);
        if (h) {
          h.style.animation = 'heartBurst 1.2s ease-out forwards';
        }
      }, d * 1000);
    });

    // === Swipe transitions ===
    // Swipe 1: story 1 -> story 2
    setTimeout(() => {
      track.style.transition = 'transform 0.45s cubic-bezier(0.25, 0.1, 0.25, 1)';
      track.style.transform = 'translateX(-33.3333%)';
      currentSlide = 1;
      // Progress bar 2
      prog2.style.animation = 'progressFill ${T.swipe2 - T.story2Start}s linear 0s forwards';
    }, ${T.swipe1 * 1000});

    // Swipe 2: story 2 -> story 3
    setTimeout(() => {
      track.style.transform = 'translateX(-66.6666%)';
      currentSlide = 2;
      // Progress bar 3 runs until end
      prog3.style.animation = 'progressFill ${(TOTAL_DURATION_MS / 1000) - T.story3Start}s linear 0s forwards';
    }, ${T.swipe2 * 1000});

    // Darken story 3 when CTA appears
    setTimeout(() => {
      const darken = document.getElementById('ctaDarken');
      if (darken) darken.style.background = 'rgba(0,0,0,0.55)';
      // Hide views counter
      viewCounter.style.transition = 'opacity 0.3s';
      viewCounter.style.opacity = '0';
    }, ${T.ctaStart * 1000});

    // === CTA elements animate in ===
    setTimeout(() => {
      document.getElementById('ctaQuestion').style.animation = 'ctaSlideUp 0.6s ease-out forwards';
    }, ${(T.ctaStart + 0.3) * 1000});

    setTimeout(() => {
      document.getElementById('ctaAction').style.animation = 'ctaSlideUp 0.5s ease-out forwards';
    }, ${(T.ctaStart + 1.0) * 1000});

    setTimeout(() => {
      document.getElementById('ctaHandle').style.animation = 'ctaSlideUp 0.5s ease-out forwards';
    }, ${(T.ctaStart + 1.6) * 1000});

    // Pulse the CTA button
    setTimeout(() => {
      const btn = document.getElementById('ctaAction');
      if (btn) {
        btn.style.animation = 'ctaSlideUp 0.5s ease-out forwards';
        setInterval(() => {
          btn.style.boxShadow = '0 0 0 0 rgba(232,68,58,0.6)';
          btn.animate([
            { boxShadow: '0 0 0 0 rgba(232,68,58,0.6)' },
            { boxShadow: '0 0 0 20px rgba(232,68,58,0)' },
          ], { duration: 1500, easing: 'ease-out' });
        }, 1800);
      }
    }, ${(T.ctaStart + 1.5) * 1000});
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
    strategy: 'v70 — story views exploding animation',
    safeBottomPixels: SAFE_BOTTOM,
    photos: PHOTOS,
  })

  const { execSync } = await import('child_process')
  const browser = await chromium.launch()

  console.log('Recording story views exploding animation (v70)...')

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
  const finalMp4 = path.join(OUT_DIR, '01_story_views.mp4')

  try {
    execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${finalMp4}"`, { stdio: 'pipe' })
    fs.unlinkSync(srcVideo)
    console.log('Rendered 01_story_views.mp4')
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
