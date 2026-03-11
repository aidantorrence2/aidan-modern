import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v48')

const WIDTH = 1080
const HEIGHT = 1920
const SAFE_BOTTOM = 410

const SF = "-apple-system, 'Helvetica Neue', Arial, sans-serif"

const REDDIT_BG = '#0B1416'
const CARD_BG = '#1A1A1B'
const TEXT_MAIN = '#D7DADC'
const TEXT_META = '#818384'
const TEXT_SUB = '#343536'
const UPVOTE_ORANGE = '#FF4500'
const MANILA_COLOR = '#E8443A'

const TOTAL_DURATION = 18
const TOTAL_DURATION_MS = 20000

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

function writeSources(payload) {
  fs.writeFileSync(path.join(OUT_DIR, 'sources.json'), JSON.stringify(payload, null, 2))
}

const p = (t) => ((t / TOTAL_DURATION) * 100).toFixed(1)

function buildRedditAd(images) {
  // Scroll keyframes — start scrolling at ~7s when comments appear
  const scrollKeyframes = `
    0% { transform: translateY(0); }
    ${p(6.8)}% { transform: translateY(0); }
    ${p(8.5)}% { transform: translateY(-320px); }
    ${p(10.5)}% { transform: translateY(-580px); }
    ${p(12.5)}% { transform: translateY(-860px); }
    ${p(14.0)}% { transform: translateY(-1050px); }
    ${p(14.3)}% { transform: translateY(-1050px); }
    100% { transform: translateY(-1050px); }
  `

  return `<!DOCTYPE html>
<html>
  <head>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      html, body { margin: 0; padding: 0; background: ${REDDIT_BG}; -webkit-font-smoothing: antialiased; }

      @keyframes fadeUp {
        0% { opacity: 0; transform: translateY(16px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      @keyframes fadeIn {
        0% { opacity: 0; }
        100% { opacity: 1; }
      }
      @keyframes countUp {
        0% { opacity: 0; }
        100% { opacity: 1; }
      }
      @keyframes scaleIn {
        0% { opacity: 0; transform: scale(0.85); }
        100% { opacity: 1; transform: scale(1); }
      }
      @keyframes popIn {
        0% { opacity: 0; transform: scale(0.5); }
        60% { transform: scale(1.15); }
        100% { opacity: 1; transform: scale(1); }
      }

      @keyframes voteCount {
        0%   { content: "0"; }
        10%  { content: "240"; }
        20%  { content: "480"; }
        30%  { content: "720"; }
        40%  { content: "960"; }
        50%  { content: "1200"; }
        60%  { content: "1440"; }
        70%  { content: "1680"; }
        80%  { content: "1920"; }
        90%  { content: "2160"; }
        100% { content: "2.4K"; }
      }

      @keyframes redditScroll {
        ${scrollKeyframes}
      }
      .reddit-scroll {
        animation: redditScroll ${TOTAL_DURATION}s ease-in-out 0s forwards;
      }

      @keyframes manilaFlash {
        0% { opacity: 0; }
        15% { opacity: 1; }
        100% { opacity: 1; }
      }
      @keyframes manilaTextIn {
        0% { opacity: 0; transform: scale(0.92); letter-spacing: 0.15em; }
        60% { opacity: 1; transform: scale(1.02); }
        100% { opacity: 1; transform: scale(1); letter-spacing: 0.08em; }
      }
      @keyframes glowPulse {
        0%, 100% { text-shadow: 0 0 30px rgba(232,68,58,0.3), 0 0 60px rgba(232,68,58,0.15); }
        50% { text-shadow: 0 0 50px rgba(232,68,58,0.5), 0 0 100px rgba(232,68,58,0.25); }
      }
      @keyframes subtextIn {
        0% { opacity: 0; transform: translateY(10px); }
        100% { opacity: 1; transform: translateY(0); }
      }
    </style>
  </head>
  <body>
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${REDDIT_BG};">

      <!-- Status bar -->
      <div style="position:absolute;left:0;right:0;top:0;height:54px;padding:14px 32px 0;display:flex;align-items:center;justify-content:space-between;z-index:20;">
        <span style="font-family:${SF};font-size:20px;font-weight:600;color:${TEXT_MAIN};">9:41</span>
        <div style="display:flex;align-items:center;gap:6px;">
          <svg width="20" height="14" viewBox="0 0 18 12"><rect x="0" y="3" width="3" height="9" rx="1" fill="${TEXT_MAIN}"/><rect x="5" y="2" width="3" height="10" rx="1" fill="${TEXT_MAIN}"/><rect x="10" y="0" width="3" height="12" rx="1" fill="${TEXT_MAIN}"/><rect x="15" y="0" width="3" height="12" rx="1" fill="${TEXT_MAIN}" opacity="0.3"/></svg>
          <svg width="30" height="15" viewBox="0 0 27 13"><rect x="0" y="0" width="23" height="13" rx="3.5" stroke="${TEXT_MAIN}" stroke-width="1" fill="none"/><rect x="2" y="2" width="18" height="9" rx="2" fill="${TEXT_MAIN}"/></svg>
        </div>
      </div>

      <!-- Reddit top bar -->
      <div style="position:absolute;left:0;right:0;top:54px;height:60px;padding:0 20px;display:flex;align-items:center;gap:14px;z-index:20;background:${CARD_BG};border-bottom:1px solid #272729;">
        <!-- Reddit logo -->
        <svg width="34" height="34" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="10" fill="${UPVOTE_ORANGE}"/>
          <ellipse cx="10" cy="11.5" rx="5.5" ry="3.5" fill="white"/>
          <circle cx="7.5" cy="11" r="1.1" fill="${UPVOTE_ORANGE}"/>
          <circle cx="12.5" cy="11" r="1.1" fill="${UPVOTE_ORANGE}"/>
          <path d="M8 13.5 Q10 14.8 12 13.5" stroke="${UPVOTE_ORANGE}" stroke-width="0.8" fill="none" stroke-linecap="round"/>
          <circle cx="15" cy="5" r="1.5" fill="white"/>
          <path d="M10 6 L14.3 5.5" stroke="white" stroke-width="1" stroke-linecap="round"/>
        </svg>
        <span style="font-family:${SF};font-size:22px;font-weight:700;color:${TEXT_MAIN};">Reddit</span>
        <div style="flex:1;"></div>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="${TEXT_META}" stroke-width="2"/><path d="M16.5 16.5 L21 21" stroke="${TEXT_META}" stroke-width="2" stroke-linecap="round"/></svg>
        <div style="width:36px;height:36px;border-radius:50%;overflow:hidden;background:#333;">
          <img src="${images.avatar}" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
      </div>

      <!-- Top gradient fade -->
      <div style="position:absolute;left:0;right:0;top:114px;height:40px;background:linear-gradient(180deg, ${REDDIT_BG}, transparent);z-index:15;pointer-events:none;"></div>

      <!-- Scrollable feed area -->
      <div style="position:absolute;left:0;right:0;top:114px;bottom:${SAFE_BOTTOM}px;overflow:hidden;">
        <div class="reddit-scroll" style="padding:12px 0 200px;">

          <!-- Post Card -->
          <div style="background:${CARD_BG};border-radius:12px;margin:0 14px 12px;overflow:hidden;opacity:0;animation:fadeUp 0.4s ease-out 0.5s forwards;">

            <!-- Subreddit + author row -->
            <div style="padding:14px 16px 0;display:flex;align-items:center;gap:8px;">
              <!-- r/Manila icon -->
              <div style="width:24px;height:24px;border-radius:50%;background:${UPVOTE_ORANGE};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                <span style="font-family:${SF};font-size:11px;font-weight:900;color:white;">M</span>
              </div>
              <span style="font-family:${SF};font-size:17px;font-weight:700;color:${TEXT_MAIN};">r/Manila</span>
              <span style="font-family:${SF};font-size:17px;color:${TEXT_META};">•</span>
              <span style="font-family:${SF};font-size:17px;color:${TEXT_META};">u/madebyaidan · 2h</span>
              <!-- Award badges -->
              <div style="margin-left:auto;display:flex;gap:4px;opacity:0;animation:popIn 0.3s cubic-bezier(0.34,1.56,0.64,1) 2.0s forwards;">
                <span style="font-size:20px;">🏆</span>
                <span style="font-size:20px;">🏆</span>
              </div>
            </div>

            <!-- Post title -->
            <div style="padding:10px 16px 0;">
              <p style="font-family:${SF};font-size:28px;font-weight:700;color:${TEXT_MAIN};line-height:1.3;margin:0;">I'm a photographer doing a free model search in Manila — no experience needed, I direct everything</p>
            </div>

            <!-- Post body text - appears at 2s -->
            <div style="padding:12px 16px 0;opacity:0;animation:fadeUp 0.5s ease-out 2.0s forwards;">
              <p style="font-family:${SF};font-size:24px;color:${TEXT_MAIN};line-height:1.5;margin:0;">Hey r/Manila! I'm running a model search and wanted to share:</p>
              <div style="margin-top:10px;">
                <p style="font-family:${SF};font-size:24px;color:${TEXT_MAIN};line-height:1.7;margin:0;">
                  • 60 second sign up form<br>
                  • I plan the date + vibe with you<br>
                  • You show up, I direct the whole shoot<br>
                  • Edited photos delivered in 1 week
                </p>
              </div>
              <p style="font-family:${SF};font-size:24px;color:${TEXT_MAIN};margin:10px 0 0;">Here are some recent shots:</p>
            </div>

            <!-- Photo grid - appears at 4s -->
            <div style="padding:12px 16px;display:flex;gap:6px;opacity:0;animation:scaleIn 0.5s ease-out 4.0s forwards;">
              <div style="flex:1;height:440px;border-radius:10px;overflow:hidden;">
                <img src="${images.photo1}" style="width:100%;height:100%;object-fit:cover;object-position:center 20%;display:block;"/>
              </div>
              <div style="flex:1;height:440px;border-radius:10px;overflow:hidden;">
                <img src="${images.photo2}" style="width:100%;height:100%;object-fit:cover;object-position:center;display:block;"/>
              </div>
              <div style="flex:1;height:440px;border-radius:10px;overflow:hidden;">
                <img src="${images.photo3}" style="width:100%;height:100%;object-fit:cover;object-position:center;display:block;"/>
              </div>
            </div>

            <!-- Upvote column + engagement bar wrapper -->
            <div style="padding:0 16px 14px;display:flex;align-items:center;gap:16px;opacity:0;animation:fadeIn 0.4s ease-out 6.5s forwards;">
              <!-- Upvote section -->
              <div style="display:flex;align-items:center;gap:0;background:#272729;border-radius:20px;padding:6px 14px;">
                <!-- Up arrow -->
                <svg width="22" height="22" viewBox="0 0 24 24" fill="${UPVOTE_ORANGE}"><path d="M12 4 L20 16 L4 16 Z"/></svg>
                <!-- Animated vote count -->
                <span id="voteCount" style="font-family:${SF};font-size:18px;font-weight:700;color:${UPVOTE_ORANGE};margin:0 8px;">2.4K</span>
                <!-- Down arrow -->
                <svg width="22" height="22" viewBox="0 0 24 24" fill="${TEXT_META}"><path d="M12 20 L20 8 L4 8 Z"/></svg>
              </div>

              <!-- Comment count -->
              <div style="display:flex;align-items:center;gap:6px;background:#272729;border-radius:20px;padding:6px 14px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="${TEXT_META}" stroke-width="2" fill="none"/></svg>
                <span style="font-family:${SF};font-size:18px;color:${TEXT_META};">127</span>
              </div>

              <!-- Share -->
              <div style="display:flex;align-items:center;gap:6px;background:#272729;border-radius:20px;padding:6px 14px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" stroke="${TEXT_META}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                <span style="font-family:${SF};font-size:18px;color:${TEXT_META};">Share</span>
              </div>

              <!-- Award -->
              <div style="display:flex;align-items:center;gap:6px;background:#272729;border-radius:20px;padding:6px 14px;">
                <span style="font-size:18px;">⭐</span>
                <span style="font-family:${SF};font-size:18px;color:${TEXT_META};">Award</span>
              </div>
            </div>
          </div>

          <!-- Comments section -->
          <div style="background:${CARD_BG};border-radius:12px;margin:0 14px 12px;overflow:hidden;opacity:0;animation:fadeIn 0.4s ease-out 7.5s forwards;">
            <div style="padding:14px 16px;border-bottom:1px solid #272729;">
              <span style="font-family:${SF};font-size:18px;font-weight:700;color:${TEXT_META};">Top Comments ▼</span>
            </div>

            <!-- Comment 1 - u/sofia_mn -->
            <div style="padding:14px 16px 0;opacity:0;animation:fadeUp 0.35s ease-out 8.0s forwards;">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                <div style="width:28px;height:28px;border-radius:50%;background:#4285F4;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                  <span style="font-family:${SF};font-size:12px;font-weight:700;color:white;">S</span>
                </div>
                <span style="font-family:${SF};font-size:18px;font-weight:700;color:#4285F4;">u/sofia_mn</span>
                <span style="font-family:${SF};font-size:16px;color:${TEXT_META};">· 1h</span>
                <div style="margin-left:auto;display:flex;align-items:center;gap:4px;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="${UPVOTE_ORANGE}"><path d="M12 4 L20 16 L4 16 Z"/></svg>
                  <span style="font-family:${SF};font-size:16px;color:${UPVOTE_ORANGE};font-weight:600;">342</span>
                </div>
              </div>
              <p style="font-family:${SF};font-size:22px;color:${TEXT_MAIN};line-height:1.45;margin:0 0 14px 36px;">just signed up, literally took less than a minute. so hyped</p>
            </div>

            <!-- Comment 2 - u/luna_arts -->
            <div style="padding:0 16px 0;opacity:0;animation:fadeUp 0.35s ease-out 9.5s forwards;">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                <div style="width:28px;height:28px;border-radius:50%;background:#9C27B0;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                  <span style="font-family:${SF};font-size:12px;font-weight:700;color:white;">L</span>
                </div>
                <span style="font-family:${SF};font-size:18px;font-weight:700;color:#CE93D8;">u/luna_arts</span>
                <span style="font-family:${SF};font-size:16px;color:${TEXT_META};">· 45m</span>
                <div style="margin-left:auto;display:flex;align-items:center;gap:4px;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="${UPVOTE_ORANGE}"><path d="M12 4 L20 16 L4 16 Z"/></svg>
                  <span style="font-family:${SF};font-size:16px;color:${UPVOTE_ORANGE};font-weight:600;">218</span>
                </div>
              </div>
              <p style="font-family:${SF};font-size:22px;color:${TEXT_MAIN};line-height:1.45;margin:0 0 10px 36px;">I did this last week — the photos came out INCREDIBLE. Can't recommend enough</p>

              <!-- Reply - u/madebyaidan -->
              <div style="margin-left:36px;border-left:2px solid #343536;padding-left:14px;margin-bottom:14px;opacity:0;animation:fadeUp 0.3s ease-out 10.5s forwards;">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                  <div style="width:22px;height:22px;border-radius:50%;overflow:hidden;flex-shrink:0;">
                    <img src="${images.avatar}" style="width:100%;height:100%;object-fit:cover;"/>
                  </div>
                  <span style="font-family:${SF};font-size:17px;font-weight:700;color:${UPVOTE_ORANGE};">u/madebyaidan</span>
                  <span style="font-family:${SF};font-size:15px;color:${TEXT_META};">· 30m</span>
                  <div style="margin-left:auto;display:flex;align-items:center;gap:4px;">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="${UPVOTE_ORANGE}"><path d="M12 4 L20 16 L4 16 Z"/></svg>
                    <span style="font-family:${SF};font-size:15px;color:${UPVOTE_ORANGE};font-weight:600;">89</span>
                  </div>
                </div>
                <p style="font-family:${SF};font-size:20px;color:${TEXT_MAIN};line-height:1.45;margin:0;">so glad you loved them! 🙌</p>
              </div>
            </div>

            <!-- Comment 3 - u/wanderlust_ava -->
            <div style="padding:0 16px 0;opacity:0;animation:fadeUp 0.35s ease-out 11.5s forwards;">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                <div style="width:28px;height:28px;border-radius:50%;background:#00897B;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                  <span style="font-family:${SF};font-size:12px;font-weight:700;color:white;">W</span>
                </div>
                <span style="font-family:${SF};font-size:18px;font-weight:700;color:#80CBC4;">u/wanderlust_ava</span>
                <span style="font-family:${SF};font-size:16px;color:${TEXT_META};">· 20m</span>
                <div style="margin-left:auto;display:flex;align-items:center;gap:4px;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="${UPVOTE_ORANGE}"><path d="M12 4 L20 16 L4 16 Z"/></svg>
                  <span style="font-family:${SF};font-size:16px;color:${UPVOTE_ORANGE};font-weight:600;">156</span>
                </div>
              </div>
              <p style="font-family:${SF};font-size:22px;color:${TEXT_MAIN};line-height:1.45;margin:0 0 10px 36px;">how do I sign up??</p>

              <!-- Reply - u/madebyaidan -->
              <div style="margin-left:36px;border-left:2px solid #343536;padding-left:14px;margin-bottom:14px;opacity:0;animation:fadeUp 0.3s ease-out 12.0s forwards;">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                  <div style="width:22px;height:22px;border-radius:50%;overflow:hidden;flex-shrink:0;">
                    <img src="${images.avatar}" style="width:100%;height:100%;object-fit:cover;"/>
                  </div>
                  <span style="font-family:${SF};font-size:17px;font-weight:700;color:${UPVOTE_ORANGE};">u/madebyaidan</span>
                  <span style="font-family:${SF};font-size:15px;color:${TEXT_META};">· 15m</span>
                  <div style="margin-left:auto;display:flex;align-items:center;gap:4px;">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="${UPVOTE_ORANGE}"><path d="M12 4 L20 16 L4 16 Z"/></svg>
                    <span style="font-family:${SF};font-size:15px;color:${UPVOTE_ORANGE};font-weight:600;">67</span>
                  </div>
                </div>
                <p style="font-family:${SF};font-size:20px;color:${TEXT_MAIN};line-height:1.45;margin:0;">link in my bio! @madebyaidan on IG 📸</p>
              </div>
            </div>

            <!-- Comment 4 - u/manila_life -->
            <div style="padding:0 16px 14px;opacity:0;animation:fadeUp 0.35s ease-out 13.0s forwards;">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                <div style="width:28px;height:28px;border-radius:50%;background:#F57F17;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                  <span style="font-family:${SF};font-size:12px;font-weight:700;color:white;">M</span>
                </div>
                <span style="font-family:${SF};font-size:18px;font-weight:700;color:#FFD54F;">u/manila_life</span>
                <span style="font-family:${SF};font-size:16px;color:${TEXT_META};">· 10m</span>
                <div style="margin-left:auto;display:flex;align-items:center;gap:4px;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="${UPVOTE_ORANGE}"><path d="M12 4 L20 16 L4 16 Z"/></svg>
                  <span style="font-family:${SF};font-size:16px;color:${UPVOTE_ORANGE};font-weight:600;">445</span>
                </div>
              </div>
              <div style="display:flex;align-items:flex-start;gap:10px;margin-left:36px;">
                <p style="font-family:${SF};font-size:22px;color:${TEXT_MAIN};line-height:1.45;margin:0;flex:1;">THIS IS AMAZING. everyone go sign up</p>
                <!-- Award badge -->
                <span style="font-size:24px;opacity:0;animation:popIn 0.35s cubic-bezier(0.34,1.56,0.64,1) 13.5s forwards;">🏅</span>
              </div>
            </div>

          </div>

        </div>
      </div>

      <!-- Bottom gradient fade -->
      <div style="position:absolute;left:0;right:0;bottom:${SAFE_BOTTOM}px;height:80px;background:linear-gradient(0deg, ${REDDIT_BG}, transparent);z-index:15;pointer-events:none;"></div>

      <!-- MANILA flash overlay - appears at 14.5s -->
      <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#000;z-index:30;pointer-events:none;opacity:0;animation:manilaFlash 0.5s ease-out 14.5s forwards;">
        <p style="font-family:${SF};font-size:160px;font-weight:900;letter-spacing:0.08em;color:${MANILA_COLOR};margin:0;text-transform:uppercase;opacity:0;animation:manilaTextIn 0.7s cubic-bezier(0.16,1,0.3,1) 14.6s forwards, glowPulse 3s ease-in-out 15.3s infinite;">MANILA</p>
        <p style="font-family:${SF};font-size:40px;font-weight:600;color:#fff;margin:20px 0 0;letter-spacing:0.04em;opacity:0;animation:subtextIn 0.5s ease-out 15.0s forwards;">Model Search</p>
        <p style="font-family:${SF};font-size:26px;color:#818384;margin:14px 0 0;opacity:0;animation:subtextIn 0.5s ease-out 15.2s forwards;">Sign up below</p>
      </div>

    </div>
  </body>
</html>`
}

async function render() {
  resetOutputDir()

  const selection = {
    avatar: 'manila-gallery-closeup-001.jpg',
    photo1: 'manila-gallery-dsc-0075.jpg',
    photo2: 'manila-gallery-graffiti-001.jpg',
    photo3: 'manila-gallery-floor-001.jpg',
  }

  writeSources({
    createdAt: new Date().toISOString(),
    strategy: 'v48 — Animated Reddit dark mode post with comments',
    safeBottomPixels: SAFE_BOTTOM,
    images: selection
  })

  const images = Object.fromEntries(
    Object.entries(selection).map(([key, file]) => [key, readImage(file)])
  )

  console.log('Recording animated Reddit post as MP4...')

  const browser = await chromium.launch()
  const videoCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: OUT_DIR,
      size: { width: WIDTH, height: HEIGHT }
    }
  })

  const videoPage = await videoCtx.newPage()
  const html = buildRedditAd(images)
  await videoPage.setContent(html, { waitUntil: 'load' })
  await videoPage.waitForTimeout(500)
  await videoPage.waitForTimeout(TOTAL_DURATION_MS)

  await videoPage.close()
  await videoCtx.close()

  const videoFiles = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.webm'))
  if (videoFiles.length === 0) {
    console.error('No video file was generated!')
  } else {
    const srcVideo = path.join(OUT_DIR, videoFiles[0])
    const dstVideo = path.join(OUT_DIR, '01_reddit_manila_ad.mp4')

    const { execSync } = await import('child_process')
    try {
      execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${dstVideo}"`, {
        stdio: 'pipe'
      })
      fs.unlinkSync(srcVideo)
      console.log('Rendered 01_reddit_manila_ad.mp4')
    } catch (err) {
      console.warn('ffmpeg not available, keeping as webm...')
      fs.renameSync(srcVideo, dstVideo)
      console.log('Rendered 01_reddit_manila_ad.mp4 (webm container)')
    }
  }

  await browser.close()
  console.log(`Done: 1 animated MP4 written to ${OUT_DIR}`)
}

render().catch(error => {
  console.error(error)
  process.exit(1)
})
