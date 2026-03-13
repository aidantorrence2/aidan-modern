import { chromium } from 'playwright';
import { execSync } from 'child_process';
import { mkdirSync, writeFileSync, rmSync } from 'fs';

const OUT_DIR = '/Users/aidantorrence/Documents/aidan-modern/marketing/purple-reels';
const IMG_DIR = '/Users/aidantorrence/Documents/aidan-modern/public/images/large';
const FRAMES_DIR = `${OUT_DIR}/tmp-frames`;
const W = 1080;
const H = 1920;
const FPS = 30;
const DURATION = 29;
const TOTAL_FRAMES = Math.ceil(DURATION * FPS);

async function main() {
  console.log('=== Frame-by-frame capture of animated-story-v2.html ===');

  rmSync(FRAMES_DIR, { recursive: true, force: true });
  mkdirSync(FRAMES_DIR, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: W, height: H } });

  // Load WITHOUT auto-play so we can drive it frame by frame
  await page.goto(`file://${OUT_DIR}/animated-story-v2.html?capture=1`, { waitUntil: 'load' });
  await page.waitForTimeout(500);

  // Expose timeline variable globally
  await page.evaluate(() => {
    window.__timeline = timeline;
  });

  console.log(`Capturing ${TOTAL_FRAMES} frames at ${FPS}fps (${DURATION}s)...`);

  // For each frame, we:
  // 1. Apply timeline events up to this time
  // 2. For moving elements (scooter, plane, train), interpolate position
  // 3. Screenshot

  for (let frame = 0; frame < TOTAL_FRAMES; frame++) {
    const t = frame / FPS;

    await page.evaluate((time) => {
      // Reset all visual state
      document.querySelectorAll('.scene').forEach(s => s.classList.remove('active'));
      document.querySelectorAll('[class*="show"]').forEach(el => el.classList.remove('show'));
      document.querySelectorAll('[class*="fade"]').forEach(el => el.classList.remove('fade'));

      // Reset positions
      const sg = document.getElementById('scooterGroup');
      if (sg) sg.style.left = '-250px';
      const pg = document.getElementById('planeGroup');
      if (pg) { pg.style.left = '-350px'; pg.style.top = '45%'; }
      const tg = document.getElementById('trainGroup');
      if (tg) tg.style.left = '1200px';

      // Apply all timeline events up to current time
      window.__applyUpTo(time);

      // Now interpolate moving elements that use CSS transitions
      // Scooter: triggered at t=9.8, moves from -250 to 1200 over 3.5s ease-in-out
      const scooterStart = 9.8;
      const scooterDur = 3.5;
      if (time >= scooterStart && time < scooterStart + scooterDur) {
        const progress = (time - scooterStart) / scooterDur;
        // ease-in-out approximation: 3p^2 - 2p^3
        const eased = progress * progress * (3 - 2 * progress);
        const pos = -250 + (1200 - (-250)) * eased;
        sg.style.left = pos + 'px';
      }

      // Plane: triggered at t=13.8, moves left -350→1200 and top 45%→30% over 3s
      const planeStart = 13.8;
      const planeDur = 3.0;
      if (time >= planeStart && time < planeStart + planeDur) {
        const progress = (time - planeStart) / planeDur;
        const eased = progress * progress * (3 - 2 * progress);
        const posX = -350 + (1200 - (-350)) * eased;
        // top: 45% → 30%  (% of viewport height = 1920)
        const posYpct = 45 + (30 - 45) * eased;
        pg.style.left = posX + 'px';
        pg.style.top = posYpct + '%';
      }

      // Train: triggered at t=17.8, moves from 1200 to 290 over 2s ease-out
      const trainStart = 17.8;
      const trainDur = 2.0;
      if (time >= trainStart && time < trainStart + trainDur) {
        const progress = (time - trainStart) / trainDur;
        // ease-out: 1 - (1-p)^2
        const eased = 1 - (1 - progress) * (1 - progress);
        const pos = 1200 + (290 - 1200) * eased;
        tg.style.left = pos + 'px';
      }

      // Also handle CSS animation timing for stars, road stripes, steam
      // by setting animation-delay to simulate the current time offset
      document.querySelectorAll('.star, .road-stripe, .steam-puff').forEach(el => {
        el.style.animationDelay = el.style.animationDelay || '0s';
      });

    }, t);

    // Tiny wait for paint
    await page.waitForTimeout(2);

    const padded = String(frame).padStart(5, '0');
    await page.screenshot({
      path: `${FRAMES_DIR}/frame_${padded}.png`,
      type: 'png',
    });

    if (frame % (FPS * 3) === 0) {
      console.log(`  ${t.toFixed(1)}s / ${DURATION}s  (frame ${frame}/${TOTAL_FRAMES})`);
    }
  }

  await browser.close();
  console.log('=== All frames captured ===');

  console.log('=== Compiling frames to video ===');
  execSync(
    `ffmpeg -y -framerate ${FPS} -i "${FRAMES_DIR}/frame_%05d.png" -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r ${FPS} "${OUT_DIR}/tmp_anim.mp4"`,
    { stdio: 'inherit' }
  );

  console.log('=== Creating photo segments ===');
  const photos = [
    `${IMG_DIR}/manila-gallery-purple-002-cropped.jpg`,
    `${IMG_DIR}/manila-gallery-purple-005-cropped.jpg`,
    `${IMG_DIR}/manila-gallery-purple-003-cropped.jpg`,
    `${IMG_DIR}/manila-gallery-purple-004-cropped.jpg`,
    `${IMG_DIR}/manila-gallery-purple-001-cropped.jpg`,
    `${IMG_DIR}/manila-gallery-purple-006-cropped.jpg`,
  ];

  const durations = [2.5, 2, 2, 1.8, 2.5, 3];

  for (let i = 0; i < photos.length; i++) {
    execSync(
      `ffmpeg -y -loop 1 -i "${photos[i]}" -t ${durations[i]} -vf "scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H}" -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r ${FPS} "${OUT_DIR}/tmp_photo_${i}.mp4"`,
      { stdio: 'pipe' }
    );
  }

  console.log('=== Creating ending card ===');
  execSync(
    `magick -size ${W}x${H} xc:black -gravity Center -font /tmp/ArialBold.ttf -pointsize 44 -fill white -annotate +0-20 "We got the shots." -font /tmp/Arial.ttf -pointsize 28 -fill 'rgba(255,255,255,0.5)' -annotate +0+40 "@madebyaidan" "${OUT_DIR}/tmp_end.png"`,
    { stdio: 'pipe' }
  );
  execSync(
    `ffmpeg -y -loop 1 -i "${OUT_DIR}/tmp_end.png" -t 3 -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r ${FPS} "${OUT_DIR}/tmp_end.mp4"`,
    { stdio: 'pipe' }
  );

  console.log('=== Concatenating final reel ===');
  const concatList = [
    `file 'tmp_anim.mp4'`,
    ...photos.map((_, i) => `file 'tmp_photo_${i}.mp4'`),
    `file 'tmp_end.mp4'`,
  ].join('\n');

  writeFileSync(`${OUT_DIR}/tmp_concat.txt`, concatList);

  execSync(
    `ffmpeg -y -f concat -safe 0 -i "${OUT_DIR}/tmp_concat.txt" -c copy "${OUT_DIR}/reel_animated_story_v2.mp4"`,
    { stdio: 'inherit' }
  );

  // Cleanup
  rmSync(FRAMES_DIR, { recursive: true, force: true });
  execSync(`rm -f "${OUT_DIR}/tmp_anim.mp4" "${OUT_DIR}"/tmp_photo_*.mp4 "${OUT_DIR}/tmp_end.mp4" "${OUT_DIR}/tmp_end.png" "${OUT_DIR}/tmp_concat.txt"`);

  console.log('=== Done! ===');
  execSync(`ls -lh "${OUT_DIR}/reel_animated_story_v2.mp4"`, { stdio: 'inherit' });
}

main().catch(console.error);
