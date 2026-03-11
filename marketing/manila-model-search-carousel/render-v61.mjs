import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v61')
const WIDTH = 1080, HEIGHT = 1920, SAFE_BOTTOM = 410
const SF = "-apple-system, 'Helvetica Neue', Arial, sans-serif"

// Tinder colors
const TINDER_GRADIENT = 'linear-gradient(135deg, #FD267A, #FF6036)'
const BG_DARK = '#111111'
const CARD_BG = '#1a1a1a'
const NOPE_RED = '#FF4458'
const LIKE_GREEN = '#00D478'
const SUPERLIKE_BLUE = '#17A5F5'
const REWIND_GOLD = '#F5B83D'
const BOOST_PURPLE = '#A14FF5'

// Total animation: ~14.3s recording + ~1s buffer
const TOTAL_DURATION_MS = 15500

// Card photos in order of appearance
const CARD_PHOTOS = [
  { file: 'manila-gallery-purple-001.jpg', purple: true },   // card 1
  { file: 'manila-gallery-purple-003.jpg', purple: true },   // card 2
  { file: 'manila-gallery-purple-005.jpg', purple: true },   // rapid 1
  { file: 'manila-gallery-purple-006.jpg', purple: true },   // rapid 2
  { file: 'manila-gallery-garden-001.jpg', purple: false },  // rapid 3
  { file: 'manila-gallery-purple-002.jpg', purple: true },   // final "your turn"
]

const PROFILE_PHOTO = { file: 'manila-gallery-closeup-001.jpg', purple: false }

// CTA photos
const CTA_PHOTOS = [
  { file: 'manila-gallery-purple-001.jpg', purple: true },
  { file: 'manila-gallery-purple-005.jpg', purple: true },
  { file: 'manila-gallery-purple-006.jpg', purple: true },
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

function imgStyle(purple, pos = 'center 20%') {
  return purple
    ? `width:130%;height:130%;object-fit:cover;object-position:center center;display:block;margin:-15% 0 0 -15%;`
    : `width:100%;height:100%;object-fit:cover;object-position:${pos};display:block;`
}

function buildTinderAnimation(images) {
  return `<!DOCTYPE html>
<html>
<head>
<style>
  * { box-sizing:border-box; margin:0; padding:0; }
  html, body {
    margin:0; padding:0;
    background:${BG_DARK};
    -webkit-font-smoothing:antialiased;
    overflow:hidden;
  }

  /* ======== SWIPE ANIMATION ======== */
  @keyframes swipeRight {
    0%   { transform: translateX(0) rotate(0deg); opacity:1; }
    30%  { transform: translateX(40px) rotate(5deg); opacity:1; }
    100% { transform: translateX(120%) rotate(25deg); opacity:0; }
  }

  @keyframes likeStamp {
    0%   { opacity:0; transform:scale(3) rotate(-20deg); }
    40%  { opacity:1; transform:scale(0.9) rotate(-15deg); }
    55%  { opacity:1; transform:scale(1.05) rotate(-15deg); }
    70%  { opacity:1; transform:scale(1) rotate(-15deg); }
    100% { opacity:1; transform:scale(1) rotate(-15deg); }
  }

  @keyframes matchTextIn {
    0%   { opacity:0; transform:scale(0.5); }
    60%  { opacity:1; transform:scale(1.1); }
    100% { opacity:1; transform:scale(1); }
  }

  @keyframes matchScreenIn {
    0%   { opacity:0; }
    100% { opacity:1; }
  }

  @keyframes matchScreenOut {
    0%   { opacity:1; }
    100% { opacity:0; }
  }

  @keyframes sparkle {
    0%   { opacity:0; transform:scale(0) rotate(0deg); }
    50%  { opacity:1; transform:scale(1) rotate(180deg); }
    100% { opacity:0; transform:scale(0) rotate(360deg); }
  }

  @keyframes cardAppear {
    0%   { opacity:0; transform:scale(0.9); }
    100% { opacity:1; transform:scale(1); }
  }

  @keyframes pulseText {
    0%   { opacity:0.7; transform:scale(1); }
    50%  { opacity:1; transform:scale(1.05); }
    100% { opacity:0.7; transform:scale(1); }
  }

  @keyframes counterIncrement {
    0%   { transform:scale(1); }
    50%  { transform:scale(1.15); }
    100% { transform:scale(1); }
  }

  @keyframes fadeToBlack {
    0%   { opacity:0; }
    100% { opacity:1; }
  }

  /* Card wrapper */
  .card-stack {
    position:absolute;
    top:110px; left:30px; right:30px;
    height:1260px;
  }

  .tinder-card {
    position:absolute;
    inset:0;
    border-radius:12px;
    overflow:hidden;
    background:${CARD_BG};
  }

  .tinder-card .photo-wrap {
    position:absolute; inset:0;
    overflow:hidden;
  }

  .tinder-card .info-gradient {
    position:absolute; bottom:0; left:0; right:0;
    height:280px;
    background:linear-gradient(0deg, rgba(0,0,0,0.7) 0%, transparent 100%);
    display:flex; flex-direction:column; justify-content:flex-end;
    padding:0 28px 110px;
  }

  .tinder-card .like-stamp {
    position:absolute; top:100px; left:50px;
    font-family:${SF}; font-size:60px; font-weight:900;
    color:${LIKE_GREEN};
    border:4px solid ${LIKE_GREEN};
    border-radius:10px;
    padding:8px 20px;
    transform:rotate(-15deg);
    opacity:0;
    z-index:10;
  }

  /* Action buttons row */
  .action-buttons {
    position:absolute;
    bottom:${SAFE_BOTTOM + 30}px;
    left:0; right:0;
    display:flex; align-items:center; justify-content:center;
    gap:18px;
  }

  .action-btn {
    border-radius:50%;
    display:flex; align-items:center; justify-content:center;
    background:transparent;
  }

  .action-btn.small { width:50px; height:50px; }
  .action-btn.large { width:66px; height:66px; }

  /* Match screen */
  .match-screen {
    position:absolute; inset:0; z-index:30;
    background:rgba(0,0,0,0.85);
    display:flex; flex-direction:column;
    align-items:center; justify-content:center;
    opacity:0; pointer-events:none;
  }

  .match-screen.show {
    opacity:1; pointer-events:auto;
  }

  .match-text {
    font-family:${SF}; font-size:72px; font-weight:900;
    background:${TINDER_GRADIENT};
    -webkit-background-clip:text;
    -webkit-text-fill-color:transparent;
    background-clip:text;
    margin-bottom:20px;
  }

  .match-profiles {
    display:flex; gap:30px; margin:20px 0 30px;
  }

  .match-profile-circle {
    width:120px; height:120px;
    border-radius:50%; overflow:hidden;
    border:3px solid ${LIKE_GREEN};
  }

  .sparkle-dot {
    position:absolute;
    width:8px; height:8px;
    border-radius:50%;
    background:${LIKE_GREEN};
    opacity:0;
  }

  /* Counter badge */
  .match-counter {
    position:absolute;
    top:60px; right:30px;
    background:${LIKE_GREEN};
    border-radius:24px;
    padding:10px 20px;
    font-family:${SF}; font-size:18px; font-weight:700;
    color:#fff;
    z-index:25;
    opacity:0;
  }
</style>
</head>
<body>
<div id="root" style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:${BG_DARK};">

  <!-- ======== TOP NAV ======== -->
  <div style="
    position:absolute; top:0; left:0; right:0;
    height:100px; z-index:20;
    display:flex; align-items:flex-end; justify-content:center;
    padding-bottom:12px;
  ">
    <!-- Tinder flame icon -->
    <svg width="40" height="40" viewBox="0 0 24 24" fill="url(#tinderGrad)">
      <defs>
        <linearGradient id="tinderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#FD267A"/>
          <stop offset="100%" style="stop-color:#FF6036"/>
        </linearGradient>
      </defs>
      <path d="M12.65 2.26c-.33-.25-.79-.06-.85.36-.32 2.36-1.54 4.15-3.07 5.63-.47.46-1 .86-1.52 1.27-.72.57-1.42 1.17-1.98 1.92C3.83 13.22 3 15.23 3 17.5 3 20.54 6.46 23 10.5 23c1.76 0 3.37-.52 4.62-1.38.23-.16.28-.48.1-.69a.42.42 0 0 0-.56-.1c-.99.64-2.2 1.02-3.51 1.02-2.9 0-5.5-1.68-5.5-4.35 0-1.76.63-3.28 1.76-4.66.4-.49.87-.93 1.38-1.33.57-.45 1.15-.89 1.67-1.41 1.83-1.85 3.15-4.17 3.49-7.06.03-.26.04-.53.04-.78"/>
      <path d="M14.5 8.5c-.28 0-.5.22-.5.5v.25c0 2.2-1.06 3.95-2.58 5.37-.37.35-.78.66-1.19.97-.56.43-1.1.88-1.54 1.45C7.6 18.32 7 19.82 7 21.5 7 23.43 9.24 25 12 25c1.2 0 2.3-.31 3.17-.84a.5.5 0 0 0-.5-.87c-.65.4-1.47.63-2.35.63-1.8 0-3.32-.94-3.32-2.42 0-1.24.43-2.3 1.2-3.27.27-.35.59-.66.94-.95.39-.32.8-.63 1.17-1C13.75 15 15 13 15 10.5V9c0-.28-.22-.5-.5-.5z"/>
    </svg>
  </div>

  <!-- ======== CARD STACK ======== -->
  <div class="card-stack" id="cardStack">
    <!-- Behind card (peek) -->
    <div class="tinder-card" id="behindCard" style="transform:scale(0.95);opacity:0.6;top:8px;">
      <div class="photo-wrap">
        <img id="behindPhoto" src="${images.card1}" style="${imgStyle(CARD_PHOTOS[1].purple)}"/>
      </div>
    </div>

    <!-- Main card -->
    <div class="tinder-card" id="mainCard" style="z-index:5;">
      <div class="photo-wrap">
        <img id="mainPhoto" src="${images.card0}" style="${imgStyle(CARD_PHOTOS[0].purple)}"/>
      </div>
      <div class="info-gradient">
        <div style="display:flex;align-items:baseline;gap:12px;">
          <span style="font-family:${SF};font-size:36px;font-weight:800;color:#fff;" id="cardName">Manila Photo Shoot</span>
        </div>
        <span style="font-family:${SF};font-size:20px;font-weight:400;color:rgba(255,255,255,0.8);margin-top:4px;" id="cardSub">by @madebyaidan</span>
        <span style="font-family:${SF};font-size:16px;font-weight:400;color:rgba(255,255,255,0.6);margin-top:6px;" id="cardDetail">No experience needed &middot; Sign up below</span>
      </div>
      <div class="like-stamp" id="likeStamp">LIKE</div>
    </div>
  </div>

  <!-- ======== ACTION BUTTONS ======== -->
  <div class="action-buttons" id="actionButtons">
    <div class="action-btn small" style="border:2px solid ${REWIND_GOLD};">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${REWIND_GOLD}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
      </svg>
    </div>
    <div class="action-btn large" style="border:2.5px solid ${NOPE_RED};">
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="${NOPE_RED}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </div>
    <div class="action-btn small" style="border:2px solid ${SUPERLIKE_BLUE};">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="${SUPERLIKE_BLUE}">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    </div>
    <div class="action-btn large" style="border:2.5px solid ${LIKE_GREEN};">
      <svg width="30" height="30" viewBox="0 0 24 24" fill="${LIKE_GREEN}">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    </div>
    <div class="action-btn small" style="border:2px solid ${BOOST_PURPLE};">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="${BOOST_PURPLE}">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    </div>
  </div>

  <!-- ======== MATCH SCREEN ======== -->
  <div class="match-screen" id="matchScreen1">
    <!-- sparkles -->
    ${Array.from({length:12}, (_, i) => {
      const x = 100 + Math.random() * 880
      const y = 400 + Math.random() * 600
      const delay = Math.random() * 0.8
      const size = 4 + Math.random() * 8
      const color = i % 3 === 0 ? '#FD267A' : i % 3 === 1 ? '#FF6036' : LIKE_GREEN
      return `<div class="sparkle-dot" style="left:${x}px;top:${y}px;width:${size}px;height:${size}px;background:${color};animation:sparkle 0.8s ease ${delay}s forwards;"></div>`
    }).join('')}
    <div class="match-text" id="matchText1" style="opacity:0;transform:scale(0.5);">It's a Match!</div>
    <div class="match-profiles">
      <div class="match-profile-circle">
        <img src="${images.profile}" style="width:100%;height:100%;object-fit:cover;"/>
      </div>
      <div class="match-profile-circle">
        <img src="${images.card0}" style="${imgStyle(CARD_PHOTOS[0].purple)}"/>
      </div>
    </div>
    <p style="font-family:${SF};font-size:18px;color:rgba(255,255,255,0.8);margin-top:10px;text-align:center;padding:0 60px;" id="matchSub1">You and Manila Photo Shoot have liked each other</p>
  </div>

  <!-- ======== MATCH SCREEN 2 ======== -->
  <div class="match-screen" id="matchScreen2">
    ${Array.from({length:12}, (_, i) => {
      const x = 100 + Math.random() * 880
      const y = 400 + Math.random() * 600
      const delay = Math.random() * 0.8
      const size = 4 + Math.random() * 8
      const color = i % 3 === 0 ? '#FD267A' : i % 3 === 1 ? '#FF6036' : LIKE_GREEN
      return `<div class="sparkle-dot" style="left:${x}px;top:${y}px;width:${size}px;height:${size}px;background:${color};animation:sparkle 0.8s ease ${delay}s forwards;"></div>`
    }).join('')}
    <div class="match-text" id="matchText2" style="opacity:0;transform:scale(0.5);">It's a Match!</div>
    <div class="match-profiles">
      <div class="match-profile-circle">
        <img src="${images.profile}" style="width:100%;height:100%;object-fit:cover;"/>
      </div>
      <div class="match-profile-circle">
        <img src="${images.card1}" style="${imgStyle(CARD_PHOTOS[1].purple)}"/>
      </div>
    </div>
    <p style="font-family:${SF};font-size:20px;color:rgba(255,255,255,0.9);margin-top:14px;text-align:center;padding:0 50px;font-weight:600;" id="matchSub2">Everyone's matching with Manila Photo Shoot</p>
  </div>

  <!-- ======== MATCH COUNTER ======== -->
  <div class="match-counter" id="matchCounter">47 matches today</div>

  <!-- ======== YOUR TURN OVERLAY ======== -->
  <div id="yourTurnOverlay" style="
    position:absolute; inset:0; z-index:25;
    display:flex; flex-direction:column;
    align-items:center; justify-content:center;
    background:rgba(0,0,0,0.4);
    opacity:0; pointer-events:none;
  ">
    <div style="
      font-family:${SF}; font-size:80px; font-weight:900;
      color:#fff; text-shadow:0 4px 30px rgba(0,0,0,0.6);
      animation:pulseText 1.2s ease-in-out infinite;
    ">Your turn</div>
    <svg width="60" height="60" viewBox="0 0 24 24" fill="#fff" style="margin-top:20px;opacity:0.9;">
      <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" transform="rotate(90 12 12)"/>
    </svg>
  </div>

  <!-- ======== FADE TO BLACK ======== -->
  <div id="fadeOverlay" style="
    position:absolute; inset:0; z-index:50;
    background:#000; pointer-events:none;
    opacity:0;
  "></div>

</div>

<script>
  // ======== TIMING CONSTANTS ========
  const PHASE2_START = 2000;    // swipe card 1
  const PHASE3_START = 3500;    // match 1
  const PHASE4_START = 5500;    // card 2 + swipe
  const PHASE5_START = 7500;    // match 2
  const PHASE6_START = 9500;    // rapid fire 3 cards
  const PHASE7_START = 12000;   // final card "your turn"
  const FADE_START   = 14000;   // fade to black
  const FADE_DUR     = 300;

  const mainCard = document.getElementById('mainCard');
  const mainPhoto = document.getElementById('mainPhoto');
  const behindCard = document.getElementById('behindCard');
  const behindPhoto = document.getElementById('behindPhoto');
  const likeStamp = document.getElementById('likeStamp');
  const cardName = document.getElementById('cardName');
  const cardSub = document.getElementById('cardSub');
  const cardDetail = document.getElementById('cardDetail');
  const matchScreen1 = document.getElementById('matchScreen1');
  const matchScreen2 = document.getElementById('matchScreen2');
  const matchText1 = document.getElementById('matchText1');
  const matchText2 = document.getElementById('matchText2');
  const matchCounter = document.getElementById('matchCounter');
  const yourTurnOverlay = document.getElementById('yourTurnOverlay');
  const fadeOverlay = document.getElementById('fadeOverlay');
  const actionButtons = document.getElementById('actionButtons');

  const cardImages = ${JSON.stringify(Object.keys(CARD_PHOTOS).map((_, i) => `card${i}`))}.map(k => {
    const map = {
      ${Object.entries(CARD_PHOTOS).map(([i]) => `card${i}: "${`images.card${i}`}"`).join(',')}
    };
    return map[k];
  });

  // Actually just use inline image refs
  const photos = [
    '${images.card0}',
    '${images.card1}',
    '${images.card2}',
    '${images.card3}',
    '${images.card4}',
    '${images.card5}',
  ];
  const purpleFlags = [true, true, true, true, false, true];

  function setImgStyle(img, purple) {
    if (purple) {
      img.style.cssText = 'width:130%;height:130%;object-fit:cover;object-position:center center;display:block;margin:-15% 0 0 -15%;';
    } else {
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;object-position:center 20%;display:block;';
    }
  }

  function resetCard() {
    mainCard.style.transition = 'none';
    mainCard.style.transform = 'translateX(0) rotate(0deg)';
    mainCard.style.opacity = '1';
    likeStamp.style.animation = 'none';
    likeStamp.style.opacity = '0';
    void mainCard.offsetHeight; // force reflow
  }

  function swipeCard(duration) {
    return new Promise(resolve => {
      // Show LIKE stamp
      likeStamp.style.animation = 'likeStamp 0.5s ease forwards';

      setTimeout(() => {
        mainCard.style.transition = 'transform ' + (duration * 0.7) + 'ms cubic-bezier(0.4, 0, 0.2, 1), opacity ' + (duration * 0.7) + 'ms ease';
        mainCard.style.transform = 'translateX(120%) rotate(25deg)';
        mainCard.style.opacity = '0';
      }, duration * 0.3);

      setTimeout(resolve, duration);
    });
  }

  function showMatchScreen(el, textEl, subEl) {
    return new Promise(resolve => {
      el.style.transition = 'opacity 0.3s ease';
      el.classList.add('show');
      el.style.opacity = '1';
      // Animate text
      setTimeout(() => {
        textEl.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
        textEl.style.opacity = '1';
        textEl.style.transform = 'scale(1)';
      }, 100);
      setTimeout(resolve, 1800);
    });
  }

  function hideMatchScreen(el) {
    return new Promise(resolve => {
      el.style.transition = 'opacity 0.4s ease';
      el.style.opacity = '0';
      setTimeout(() => {
        el.classList.remove('show');
        resolve();
      }, 400);
    });
  }

  function setCardContent(photoIdx, name, sub, detail) {
    mainPhoto.src = photos[photoIdx];
    setImgStyle(mainPhoto, purpleFlags[photoIdx]);
    cardName.textContent = name;
    cardSub.textContent = sub;
    cardDetail.textContent = detail;
  }

  function setBehindContent(photoIdx) {
    if (photoIdx < photos.length) {
      behindPhoto.src = photos[photoIdx];
      setImgStyle(behindPhoto, purpleFlags[photoIdx]);
      behindCard.style.opacity = '0.6';
    } else {
      behindCard.style.opacity = '0';
    }
  }

  let matchCount = 47;

  // ======== PHASE 1 (0-2s): Discovery screen loads ========
  // Already showing card 0

  // ======== PHASE 2 (2-3.5s): Swipe right card 1 ========
  setTimeout(async () => {
    await swipeCard(1200);
  }, PHASE2_START);

  // ======== PHASE 3 (3.5-5.5s): Match screen 1 ========
  setTimeout(async () => {
    await showMatchScreen(matchScreen1, matchText1);
    await hideMatchScreen(matchScreen1);
  }, PHASE3_START);

  // ======== PHASE 4 (5.5-7.5s): New card + swipe ========
  setTimeout(() => {
    resetCard();
    setCardContent(1, 'Manila Photo Shoot', "She'd never modeled before... \\u{1F92F}", '');
    setBehindContent(2);
    // Appear animation
    mainCard.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
    mainCard.style.transform = 'scale(1)';
    mainCard.style.opacity = '1';
  }, PHASE4_START);

  setTimeout(async () => {
    await swipeCard(1000);
  }, PHASE4_START + 800);

  // ======== PHASE 5 (7.5-9.5s): Match screen 2 ========
  setTimeout(async () => {
    await showMatchScreen(matchScreen2, matchText2);
    await hideMatchScreen(matchScreen2);
  }, PHASE5_START);

  // ======== PHASE 6 (9.5-12s): Rapid fire 3 cards ========
  // Show match counter
  setTimeout(() => {
    matchCounter.style.opacity = '1';
  }, PHASE6_START);

  // Card 3 (rapid 1)
  setTimeout(() => {
    resetCard();
    setCardContent(2, 'Manila Photo Shoot', '@madebyaidan', 'Free session · Limited spots');
    setBehindContent(3);
  }, PHASE6_START);

  setTimeout(async () => {
    await swipeCard(600);
    matchCount++;
    matchCounter.textContent = matchCount + ' matches today';
    matchCounter.style.animation = 'counterIncrement 0.3s ease';
  }, PHASE6_START + 200);

  // Card 4 (rapid 2)
  setTimeout(() => {
    resetCard();
    setCardContent(3, 'Manila Photo Shoot', '@madebyaidan', 'No experience needed');
    setBehindContent(4);
  }, PHASE6_START + 900);

  setTimeout(async () => {
    await swipeCard(600);
    matchCount++;
    matchCounter.textContent = matchCount + ' matches today';
  }, PHASE6_START + 1100);

  // Card 5 (rapid 3)
  setTimeout(() => {
    resetCard();
    setCardContent(4, 'Manila Photo Shoot', '@madebyaidan', 'Sign up below');
    setBehindContent(5);
  }, PHASE6_START + 1800);

  setTimeout(async () => {
    await swipeCard(600);
    matchCount++;
    matchCounter.textContent = matchCount + ' matches today';
  }, PHASE6_START + 2000);

  // ======== PHASE 7 (12-14s): Final card "Your turn" ========
  setTimeout(() => {
    resetCard();
    setCardContent(5, 'Manila Photo Shoot', '@madebyaidan', '');
    setBehindContent(99); // no behind card
    matchCounter.style.opacity = '0';
    // Show your turn overlay
    setTimeout(() => {
      yourTurnOverlay.style.transition = 'opacity 0.5s ease';
      yourTurnOverlay.style.opacity = '1';
    }, 600);
  }, PHASE7_START);

  // ======== PHASE 8 (14-14.3s): Fade to black ========
  setTimeout(() => {
    fadeOverlay.style.transition = 'opacity ' + FADE_DUR + 'ms ease-out';
    fadeOverlay.style.opacity = '1';
  }, FADE_START);

</script>
</body>
</html>`;
}

function buildCTA(images) {
  function cropImg(src, w, h, purple, pos = 'center 20%') {
    const style = purple
      ? `width:130%;height:130%;object-fit:cover;object-position:center center;display:block;margin:-15% 0 0 -15%;`
      : `width:100%;height:100%;object-fit:cover;object-position:${pos};display:block;`
    return `<div style="width:${w}px;height:${h}px;overflow:hidden;border-radius:16px;box-shadow:0 8px 40px rgba(0,0,0,0.5);">
      <img src="${src}" style="${style}"/>
    </div>`
  }

  return `<!DOCTYPE html><html><head>
    <style>* { box-sizing:border-box;margin:0;padding:0; } html,body { background:#000; -webkit-font-smoothing:antialiased; }</style>
  </head><body>
    <div style="width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;background:#000;">

      <!-- Photo grid — 3 photos staggered -->
      <div style="position:absolute;top:120px;left:50px;transform:rotate(-3deg);">
        ${cropImg(images.cta0, 460, 620, CTA_PHOTOS[0].purple, 'center 20%')}
      </div>
      <div style="position:absolute;top:180px;right:50px;transform:rotate(2.5deg);">
        ${cropImg(images.cta1, 420, 560, CTA_PHOTOS[1].purple, 'center 25%')}
      </div>
      <div style="position:absolute;top:620px;left:280px;transform:rotate(-1deg);z-index:5;">
        ${cropImg(images.cta2, 500, 380, CTA_PHOTOS[2].purple, 'center 30%')}
      </div>

      <!-- Dark gradient overlay -->
      <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 20%, rgba(0,0,0,0.0) 35%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.95) 72%, #000 85%);"></div>

      <!-- Text content above SAFE_BOTTOM -->
      <div style="position:absolute;left:0;right:0;bottom:${SAFE_BOTTOM + 40}px;padding:0 70px;text-align:center;">

        <!-- Thin accent line -->
        <div style="width:50px;height:3px;background:linear-gradient(135deg, #FD267A, #FF6036);margin:0 auto 30px;"></div>

        <!-- MANILA — 180px white bold -->
        <p style="font-family:${SF};font-size:180px;font-weight:900;letter-spacing:0.14em;color:#fff;margin:0;text-transform:uppercase;text-shadow:0 4px 80px rgba(253,38,122,0.4), 0 2px 20px rgba(0,0,0,0.8);">MANILA</p>

        <!-- PHOTO SHOOT -->
        <p style="font-family:${SF};font-size:38px;font-weight:300;color:rgba(255,255,255,0.9);margin:4px 0 0;letter-spacing:0.3em;text-transform:uppercase;">PHOTO SHOOT</p>
      </div>
    </div>
  </body></html>`
}

async function render() {
  resetOutputDir()

  const selection = {
    cardPhotos: CARD_PHOTOS.map(p => p.file),
    profilePhoto: PROFILE_PHOTO.file,
    ctaPhotos: CTA_PHOTOS.map(p => p.file),
  }

  writeSources({
    createdAt: new Date().toISOString(),
    strategy: 'v61 — Tinder swipe ad, multiple matches, sells the photoshoot',
    safeBottomPixels: SAFE_BOTTOM,
    images: selection,
  })

  // Load card images
  const cardImageData = {}
  CARD_PHOTOS.forEach((p, i) => {
    cardImageData[`card${i}`] = readImage(p.file)
  })

  // Load profile image
  const profileData = readImage(PROFILE_PHOTO.file)

  // Load CTA images
  const ctaImageData = {
    cta0: readImage(CTA_PHOTOS[0].file),
    cta1: readImage(CTA_PHOTOS[1].file),
    cta2: readImage(CTA_PHOTOS[2].file),
  }

  const { execSync } = await import('child_process')
  const browser = await chromium.launch()

  // --- Step 1: Record the Tinder animation video ---
  console.log('Recording Tinder swipe animation...')

  const videoCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: OUT_DIR,
      size: { width: WIDTH, height: HEIGHT },
    },
  })

  const videoPage = await videoCtx.newPage()
  const animationHTML = buildTinderAnimation({ ...cardImageData, profile: profileData })
  await videoPage.setContent(animationHTML, { waitUntil: 'load' })
  await videoPage.waitForTimeout(500)
  await videoPage.waitForTimeout(TOTAL_DURATION_MS)
  await videoPage.close()
  await videoCtx.close()

  // --- Step 2: Render CTA as a high-quality screenshot ---
  console.log('Rendering CTA screenshot...')
  const ctaCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
  })
  const ctaPage = await ctaCtx.newPage()
  await ctaPage.setContent(buildCTA(ctaImageData), { waitUntil: 'load' })
  await ctaPage.waitForTimeout(300)
  const ctaPath = path.join(OUT_DIR, 'cta_frame.png')
  await ctaPage.screenshot({ path: ctaPath })
  await ctaPage.close()
  await ctaCtx.close()
  await browser.close()

  // --- Step 3: Convert webm to mp4, then concat with CTA still frame ---
  const videoFiles = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.webm'))
  if (videoFiles.length === 0) {
    console.error('No video file was generated!')
    return
  }

  const srcVideo = path.join(OUT_DIR, videoFiles[0])
  const animMp4 = path.join(OUT_DIR, 'animation_part.mp4')
  const ctaMp4 = path.join(OUT_DIR, 'cta_part.mp4')
  const finalMp4 = path.join(OUT_DIR, '01_tinder_swipe.mp4')
  const concatFile = path.join(OUT_DIR, 'concat.txt')

  try {
    // Convert animation webm to mp4
    execSync(`ffmpeg -y -i "${srcVideo}" -c:v libx264 -pix_fmt yuv420p -r 30 -an "${animMp4}"`, { stdio: 'pipe' })

    // Create 5-second CTA video from static image
    execSync(`ffmpeg -y -loop 1 -i "${ctaPath}" -c:v libx264 -t 5 -pix_fmt yuv420p -r 30 -vf "scale=${WIDTH}:${HEIGHT}" -an "${ctaMp4}"`, { stdio: 'pipe' })

    // Concat animation + CTA
    fs.writeFileSync(concatFile, `file '${animMp4}'\nfile '${ctaMp4}'\n`)
    execSync(`ffmpeg -y -f concat -safe 0 -i "${concatFile}" -c copy "${finalMp4}"`, { stdio: 'pipe' })

    // Cleanup temp files
    fs.unlinkSync(srcVideo)
    fs.unlinkSync(animMp4)
    fs.unlinkSync(ctaMp4)
    fs.unlinkSync(concatFile)
    console.log('Rendered 01_tinder_swipe.mp4 (animation + CTA)')
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
