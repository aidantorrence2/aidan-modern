import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const IMAGE_DIR = path.join(REPO_ROOT, 'public/images/large')
const OUT_DIR = path.join(__dirname, 'output-v60')
const WIDTH = 1080, HEIGHT = 1920, SAFE_BOTTOM = 410
const SF = "-apple-system, 'Helvetica Neue', Arial, sans-serif"
const MANILA_COLOR = '#E8443A'
const SPOTIFY_GREEN = '#1ED760'

const TOTAL_DURATION_MS = 19500 // ~19s recording, fade starts at 18s

// Album art photos (cycling during lyrics)
const ALBUM_PHOTOS = [
  { file: 'manila-gallery-purple-001.jpg', purple: true },
  { file: 'manila-gallery-purple-003.jpg', purple: true },
  { file: 'manila-gallery-purple-005.jpg', purple: true },
  { file: 'manila-gallery-garden-001.jpg', purple: false },
]

// CTA photos
const CTA_PHOTOS = [
  { file: 'manila-gallery-purple-001.jpg', purple: true },
  { file: 'manila-gallery-purple-005.jpg', purple: true },
  { file: 'manila-gallery-purple-006.jpg', purple: true },
]

const LYRICS = [
  'looking for models in Manila',
  'no experience needed at all',
  'I direct the whole thing',
  'just show up and be yourself',
  'shot on film, edited in a week',
  'sixty second signup',
  'sign up below',
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

function buildSpotifyNowPlaying(images) {
  // Phase timings
  const PHASE1_END = 4      // Now playing visible 0-4s
  const TRANSITION_END = 5  // Transition 4-5s
  const LYRICS_START = 5    // Lyrics view from 5s
  const LYRIC_DURATION = 1.857 // ~1.857s per lyric line (13s / 7 lines)
  const FADE_START = 18     // Fade to black
  const FADE_DURATION = 0.3

  // Build album art cycling keyframes for the corner thumbnail during lyrics
  // Album cycles every 3.25s across 4 images during lyrics phase
  const albumCycleCSS = ALBUM_PHOTOS.map((_, i) => {
    const pct0 = (i / ALBUM_PHOTOS.length) * 100
    const pct1 = ((i + 0.9) / ALBUM_PHOTOS.length) * 100
    const pct2 = ((i + 1) / ALBUM_PHOTOS.length) * 100
    return ''
  }).join('')

  // Lyrics animation: each line appears at LYRICS_START + i * LYRIC_DURATION
  const lyricsHTML = LYRICS.map((line, i) => {
    const appearAt = LYRICS_START + i * LYRIC_DURATION
    const dimAt = appearAt + LYRIC_DURATION
    return `
      <div class="lyric-line lyric-${i}" style="
        font-family:${SF};
        font-size:42px;
        font-weight:700;
        color:rgba(255,255,255,0.2);
        line-height:1.0;
        padding:0 70px;
        margin-bottom:28px;
        transition:color 0.4s ease, transform 0.4s ease, opacity 0.4s ease;
        transform:translateY(0);
        text-align:left;
      ">${line}</div>
    `
  }).join('')

  // Build lyrics animation keyframes
  let lyricsKeyframes = ''
  LYRICS.forEach((_, i) => {
    const appearAt = LYRICS_START + i * LYRIC_DURATION
    lyricsKeyframes += `
      @keyframes lyricHighlight${i} {
        0%, ${((appearAt / (FADE_START + 1)) * 100).toFixed(1)}% {
          color: rgba(255,255,255,0.2);
        }
        ${(((appearAt + 0.2) / (FADE_START + 1)) * 100).toFixed(1)}% {
          color: #ffffff;
        }
        ${(((appearAt + LYRIC_DURATION) / (FADE_START + 1)) * 100).toFixed(1)}% {
          color: #ffffff;
        }
        ${(((appearAt + LYRIC_DURATION + 0.3) / (FADE_START + 1)) * 100).toFixed(1)}% {
          color: rgba(255,255,255,0.3);
        }
        100% {
          color: rgba(255,255,255,0.3);
        }
      }
    `
  })

  // Progress bar: total "song" is 3:27 = 207s, but we show progress moving
  // In reality, progress moves at about 1/207th per second
  // We'll make it visually move from about 5% to 15% across 19s for realism
  const progressStartPct = 2
  const progressEndPct = 12

  return `<!DOCTYPE html>
<html>
<head>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      margin: 0; padding: 0;
      background: #191414;
      -webkit-font-smoothing: antialiased;
    }

    /* Now Playing screen */
    .now-playing {
      opacity: 1;
      transition: opacity 0.6s ease;
    }
    .now-playing.hide {
      opacity: 0;
    }

    /* Lyrics screen */
    .lyrics-view {
      opacity: 0;
      transition: opacity 0.6s ease;
    }
    .lyrics-view.show {
      opacity: 1;
    }

    /* Album art in now playing */
    .album-art-main {
      transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Progress bar fill animation */
    @keyframes progressFill {
      0% { width: ${progressStartPct}%; }
      100% { width: ${progressEndPct}%; }
    }

    @keyframes progressFillLyrics {
      0% { width: ${progressStartPct}%; }
      100% { width: ${progressEndPct}%; }
    }

    /* Play button pulse */
    @keyframes playPulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.06); }
      100% { transform: scale(1); }
    }

    /* Fade to black */
    @keyframes fadeToBlack {
      0% { opacity: 0; }
      100% { opacity: 1; }
    }

    /* Lyric line highlight animations */
    ${lyricsKeyframes}

    ${LYRICS.map((_, i) => `
      .lyric-${i} {
        animation: lyricHighlight${i} ${FADE_START + 1}s linear forwards;
      }
    `).join('')}

    /* Scroll lyrics container up as we progress */
    @keyframes lyricsScroll {
      0% { transform: translateY(0px); }
      100% { transform: translateY(-${(LYRICS.length - 3) * 70}px); }
    }

    /* Album art crossfade in lyrics corner */
    .corner-album img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 4px;
      opacity: 0;
      transition: opacity 0.8s ease;
    }
    .corner-album img.active {
      opacity: 1;
    }
  </style>
</head>
<body>
  <div id="root" style="
    width:${WIDTH}px;height:${HEIGHT}px;position:relative;overflow:hidden;
    background:#191414;
  ">

    <!-- ===== NOW PLAYING SCREEN ===== -->
    <div class="now-playing" id="nowPlaying" style="
      position:absolute;inset:0;z-index:10;
      background:#191414;
      display:flex;flex-direction:column;
    ">
      <!-- Status bar spacer -->
      <div style="height:54px;flex-shrink:0;"></div>

      <!-- Top bar: chevron + playing from -->
      <div style="
        display:flex;align-items:center;justify-content:space-between;
        padding:0 24px;height:56px;flex-shrink:0;
      ">
        <!-- Chevron down -->
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>

        <!-- Playing from label -->
        <div style="text-align:center;">
          <p style="font-family:${SF};font-size:11px;font-weight:600;color:rgba(255,255,255,0.6);letter-spacing:0.12em;text-transform:uppercase;margin:0;">PLAYING FROM PLAYLIST</p>
          <p style="font-family:${SF};font-size:13px;font-weight:700;color:#fff;margin:2px 0 0;">Manila Sessions</p>
        </div>

        <!-- Three dots menu -->
        <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff">
          <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
        </svg>
      </div>

      <!-- Spacer -->
      <div style="height:24px;flex-shrink:0;"></div>

      <!-- Album art — large, centered -->
      <div class="album-art-main" style="
        width:680px;height:680px;margin:0 auto;
        border-radius:8px;overflow:hidden;
        box-shadow:0 8px 40px rgba(0,0,0,0.5);
        flex-shrink:0;
      ">
        <div style="width:100%;height:100%;overflow:hidden;position:relative;">
          <img id="mainAlbumArt" src="${images.album0}" style="
            width:130%;height:130%;object-fit:cover;object-position:center center;
            display:block;margin:-15% 0 0 -15%;
          "/>
        </div>
      </div>

      <!-- Spacer -->
      <div style="height:32px;flex-shrink:0;"></div>

      <!-- Song info — LEFT aligned -->
      <div style="padding:0 48px;flex-shrink:0;">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;">
          <div style="flex:1;min-width:0;">
            <p style="font-family:${SF};font-size:24px;font-weight:700;color:#fff;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">Manila Photo Shoot</p>
            <p style="font-family:${SF};font-size:18px;font-weight:400;color:#b3b3b3;margin:6px 0 0;">madebyaidan</p>
          </div>
          <!-- Heart icon (green = saved) -->
          <svg width="26" height="26" viewBox="0 0 24 24" fill="${SPOTIFY_GREEN}" style="margin:4px 0 0 16px;flex-shrink:0;">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </div>
      </div>

      <!-- Spacer -->
      <div style="height:28px;flex-shrink:0;"></div>

      <!-- Progress bar -->
      <div style="padding:0 48px;flex-shrink:0;">
        <div style="position:relative;width:100%;height:3px;background:rgba(255,255,255,0.3);border-radius:2px;">
          <div id="progressFillNP" style="
            position:absolute;left:0;top:0;height:100%;
            background:${SPOTIFY_GREEN};border-radius:2px;
            width:${progressStartPct}%;
            animation:progressFill ${FADE_START}s linear forwards;
          "></div>
          <!-- White dot -->
          <div id="progressDotNP" style="
            position:absolute;top:-5px;
            width:13px;height:13px;border-radius:50%;
            background:#fff;
            left:${progressStartPct}%;
            transition:left 1s linear;
          "></div>
        </div>
        <!-- Timestamps -->
        <div style="display:flex;justify-content:space-between;margin-top:8px;">
          <p style="font-family:${SF};font-size:12px;font-weight:400;color:rgba(255,255,255,0.6);margin:0;">0:24</p>
          <p style="font-family:${SF};font-size:12px;font-weight:400;color:rgba(255,255,255,0.6);margin:0;">3:27</p>
        </div>
      </div>

      <!-- Spacer -->
      <div style="height:28px;flex-shrink:0;"></div>

      <!-- Playback controls -->
      <div style="
        display:flex;align-items:center;justify-content:center;gap:36px;
        padding:0 48px;flex-shrink:0;
      ">
        <!-- Shuffle -->
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/>
          <polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/>
          <line x1="4" y1="4" x2="9" y2="9"/>
        </svg>

        <!-- Previous -->
        <svg width="32" height="32" viewBox="0 0 24 24" fill="#fff">
          <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
        </svg>

        <!-- Play button — large circle -->
        <div id="playBtn" style="
          width:68px;height:68px;border-radius:50%;background:#fff;
          display:flex;align-items:center;justify-content:center;
          animation:playPulse 1.5s ease-in-out 1.5s 1;
        ">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="#000" style="margin-left:3px;">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
        </div>

        <!-- Next -->
        <svg width="32" height="32" viewBox="0 0 24 24" fill="#fff">
          <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
        </svg>

        <!-- Repeat -->
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
          <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
        </svg>
      </div>

      <!-- Spacer -->
      <div style="flex:1;"></div>

      <!-- Bottom row: share/device -->
      <div style="
        display:flex;align-items:center;justify-content:space-between;
        padding:0 48px ${SAFE_BOTTOM + 20}px;flex-shrink:0;
      ">
        <!-- Device icon -->
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
        </svg>
        <!-- Share icon -->
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
        </svg>
      </div>
    </div>

    <!-- ===== LYRICS VIEW ===== -->
    <div class="lyrics-view" id="lyricsView" style="
      position:absolute;inset:0;z-index:15;
      background:linear-gradient(180deg,
        rgba(45,15,35,0.98) 0%,
        rgba(55,18,40,0.97) 30%,
        rgba(35,10,28,0.99) 70%,
        rgba(25,8,20,1) 100%
      );
      display:flex;flex-direction:column;
    ">
      <!-- Top bar with small album art and song info -->
      <div style="height:54px;flex-shrink:0;"></div>
      <div style="
        display:flex;align-items:center;padding:0 24px;height:56px;flex-shrink:0;
      ">
        <!-- Chevron down -->
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
        <div style="flex:1;"></div>
        <p style="font-family:${SF};font-size:14px;font-weight:600;color:rgba(255,255,255,0.8);margin:0;">Lyrics</p>
        <div style="flex:1;"></div>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="rgba(255,255,255,0.7)">
          <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
        </svg>
      </div>

      <!-- Spacer -->
      <div style="height:20px;flex-shrink:0;"></div>

      <!-- Corner album art — small -->
      <div style="padding:0 24px;display:flex;align-items:center;gap:14px;flex-shrink:0;">
        <div class="corner-album" style="
          width:52px;height:52px;border-radius:4px;overflow:hidden;
          position:relative;flex-shrink:0;
        ">
          <img class="corner-art active" data-idx="0" src="${images.album0}" style=""/>
          <img class="corner-art" data-idx="1" src="${images.album1}" style=""/>
          <img class="corner-art" data-idx="2" src="${images.album2}" style=""/>
          <img class="corner-art" data-idx="3" src="${images.album3}" style=""/>
        </div>
        <div>
          <p style="font-family:${SF};font-size:15px;font-weight:700;color:#fff;margin:0;">Manila Photo Shoot</p>
          <p style="font-family:${SF};font-size:13px;font-weight:400;color:rgba(255,255,255,0.6);margin:2px 0 0;">madebyaidan</p>
        </div>
      </div>

      <!-- Spacer -->
      <div style="height:50px;flex-shrink:0;"></div>

      <!-- Top fade gradient -->
      <div style="
        position:absolute;top:200px;left:0;right:0;height:60px;
        background:linear-gradient(180deg, rgba(45,15,35,0.98) 0%, transparent 100%);
        z-index:3;pointer-events:none;
      "></div>

      <!-- Lyrics area -->
      <div style="flex:1;overflow:hidden;position:relative;">
        <div id="lyricsContainer" style="
          padding:40px 0;
          transition:transform 0.6s ease;
        ">
          ${lyricsHTML}
        </div>
      </div>

      <!-- Bottom fade gradient -->
      <div style="
        position:absolute;bottom:${SAFE_BOTTOM + 100}px;left:0;right:0;height:80px;
        background:linear-gradient(0deg, rgba(25,8,20,1) 0%, transparent 100%);
        z-index:3;pointer-events:none;
      "></div>

      <!-- Bottom song info + mini progress -->
      <div style="
        flex-shrink:0;
        padding:0 48px ${SAFE_BOTTOM + 20}px;
        z-index:4;
      ">
        <!-- Mini progress bar -->
        <div style="position:relative;width:100%;height:3px;background:rgba(255,255,255,0.2);border-radius:2px;margin-bottom:12px;">
          <div id="progressFillLyrics" style="
            position:absolute;left:0;top:0;height:100%;
            background:${SPOTIFY_GREEN};border-radius:2px;
            width:${progressStartPct}%;
            animation:progressFillLyrics ${FADE_START}s linear forwards;
          "></div>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <div>
            <p style="font-family:${SF};font-size:14px;font-weight:700;color:#fff;margin:0;">Manila Photo Shoot</p>
            <p style="font-family:${SF};font-size:12px;font-weight:400;color:rgba(255,255,255,0.6);margin:2px 0 0;">madebyaidan</p>
          </div>
          <!-- Device icon -->
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- ===== FADE TO BLACK OVERLAY ===== -->
    <div style="
      position:absolute;inset:0;
      background:#000;z-index:50;
      pointer-events:none;
      opacity:0;
      animation:fadeToBlack ${FADE_DURATION}s ease-out ${FADE_START}s forwards;
    "></div>
  </div>

  <script>
    // Phase transitions
    const PHASE1_END = ${PHASE1_END * 1000};
    const LYRICS_START = ${LYRICS_START * 1000};
    const LYRIC_DURATION = ${LYRIC_DURATION * 1000};
    const FADE_START = ${FADE_START * 1000};

    // Transition from Now Playing to Lyrics at PHASE1_END
    setTimeout(() => {
      document.getElementById('nowPlaying').classList.add('hide');
      document.getElementById('lyricsView').classList.add('show');
    }, PHASE1_END);

    // Scroll lyrics container upward as lines progress
    const lyricsContainer = document.getElementById('lyricsContainer');
    const scrollPerLine = 70; // px per line

    for (let i = 0; i < ${LYRICS.length}; i++) {
      setTimeout(() => {
        // Scroll so current line is nicely positioned
        if (i >= 2) {
          const scrollY = (i - 2) * scrollPerLine;
          lyricsContainer.style.transform = 'translateY(-' + scrollY + 'px)';
        }
      }, LYRICS_START + i * LYRIC_DURATION);
    }

    // Cycle corner album art during lyrics phase
    const cornerArts = document.querySelectorAll('.corner-art');
    let currentArtIdx = 0;
    const artCycleInterval = 3250; // ms

    function cycleAlbumArt() {
      cornerArts.forEach(img => img.classList.remove('active'));
      currentArtIdx = (currentArtIdx + 1) % cornerArts.length;
      cornerArts[currentArtIdx].classList.add('active');
    }

    // Start cycling after lyrics view appears
    setTimeout(() => {
      setInterval(cycleAlbumArt, artCycleInterval);
    }, LYRICS_START);
  </script>
</body>
</html>`
}

function buildCTA(images) {
  function cropImg(src, w, h, purple, pos = 'center 20%') {
    const imgStyle = purple
      ? `width:130%;height:130%;object-fit:cover;object-position:center center;display:block;margin:-15% 0 0 -15%;`
      : `width:100%;height:100%;object-fit:cover;object-position:${pos};display:block;`
    return `<div style="width:${w}px;height:${h}px;overflow:hidden;border-radius:16px;box-shadow:0 8px 40px rgba(0,0,0,0.5);">
      <img src="${src}" style="${imgStyle}"/>
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
        <div style="width:50px;height:3px;background:${MANILA_COLOR};margin:0 auto 30px;"></div>

        <!-- MANILA — 180px white bold -->
        <p style="font-family:${SF};font-size:180px;font-weight:900;letter-spacing:0.14em;color:#fff;margin:0;text-transform:uppercase;text-shadow:0 4px 80px rgba(232,68,58,0.4), 0 2px 20px rgba(0,0,0,0.8);">MANILA</p>

        <!-- PHOTO SHOOT -->
        <p style="font-family:${SF};font-size:38px;font-weight:300;color:rgba(255,255,255,0.9);margin:4px 0 0;letter-spacing:0.3em;text-transform:uppercase;">PHOTO SHOOT</p>
      </div>
    </div>
  </body></html>`
}

async function render() {
  resetOutputDir()

  const selection = {
    albumPhotos: ALBUM_PHOTOS.map(p => p.file),
    ctaPhotos: CTA_PHOTOS.map(p => p.file),
  }

  writeSources({
    createdAt: new Date().toISOString(),
    strategy: 'v60 — Spotify Now Playing + Lyrics view animated ad',
    safeBottomPixels: SAFE_BOTTOM,
    images: selection,
  })

  // Load album images
  const albumImageData = {
    album0: readImage(ALBUM_PHOTOS[0].file),
    album1: readImage(ALBUM_PHOTOS[1].file),
    album2: readImage(ALBUM_PHOTOS[2].file),
    album3: readImage(ALBUM_PHOTOS[3].file),
  }

  // Load CTA images
  const ctaImageData = {
    cta0: readImage(CTA_PHOTOS[0].file),
    cta1: readImage(CTA_PHOTOS[1].file),
    cta2: readImage(CTA_PHOTOS[2].file),
  }

  const { execSync } = await import('child_process')
  const browser = await chromium.launch()

  // --- Step 1: Record the Spotify animation video ---
  console.log('Recording Spotify Now Playing + Lyrics animation...')

  const videoCtx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: OUT_DIR,
      size: { width: WIDTH, height: HEIGHT },
    },
  })

  const videoPage = await videoCtx.newPage()
  const animationHTML = buildSpotifyNowPlaying(albumImageData)
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
  const finalMp4 = path.join(OUT_DIR, '01_spotify_lyrics.mp4')
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
    console.log('Rendered 01_spotify_lyrics.mp4 (animation + CTA)')
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
