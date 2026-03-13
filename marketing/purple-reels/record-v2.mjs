import { chromium } from 'playwright';
import { execSync } from 'child_process';
import { mkdirSync, writeFileSync, rmSync } from 'fs';

const OUT_DIR = '/Users/aidantorrence/Documents/aidan-modern/marketing/purple-reels';
const IMG_DIR = '/Users/aidantorrence/Documents/aidan-modern/public/images/large';
const FRAMES_DIR = `${OUT_DIR}/tmp-frames`;
const W = 1080;
const H = 1920;
const FPS = 30;
const DURATION = 13.5; // punchy animation
const TOTAL_FRAMES = Math.ceil(DURATION * FPS);

async function main() {
  console.log('=== Frame-by-frame capture ===');

  rmSync(FRAMES_DIR, { recursive: true, force: true });
  mkdirSync(FRAMES_DIR, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: W, height: H } });

  await page.goto(`file://${OUT_DIR}/animated-story-v2.html?capture=1`, { waitUntil: 'load' });
  await page.waitForTimeout(500);

  console.log(`Capturing ${TOTAL_FRAMES} frames at ${FPS}fps (${DURATION}s)...`);

  for (let frame = 0; frame < TOTAL_FRAMES; frame++) {
    const t = frame / FPS;

    await page.evaluate((time) => {
      // Reset
      document.querySelectorAll('.scene').forEach(s => {
        s.classList.remove('active', 'shake');
      });
      document.querySelectorAll('.pop').forEach(el => el.classList.remove('pop'));
      document.querySelectorAll('.dim').forEach(el => el.classList.remove('dim'));
      const dd = document.getElementById('dotDot');
      if (dd) { dd.style.opacity = '0'; dd.style.transform = 'scale(0)'; }

      // Reset positions
      const sw = document.getElementById('scooterWrap');
      if (sw) sw.style.left = '-300px';
      const pw = document.getElementById('planeWrap');
      if (pw) { pw.style.left = '-400px'; pw.style.top = '40%'; }
      const tw = document.getElementById('trainWrap');
      if (tw) tw.style.left = '1200px';
      const rf = document.getElementById('redFlash');
      if (rf) rf.classList.remove('pop');

      window.__applyUpTo(time);

      // Interpolate scooter: triggered at 4.2, -300→1200 over 2s ease-in-out
      if (sw && time >= 4.2 && time < 6.2) {
        const p = (time - 4.2) / 2.0;
        const e = p * p * (3 - 2 * p);
        sw.style.left = (-300 + 1500 * e) + 'px';
      }

      // Interpolate plane: triggered at 5.9, -400→1200 left, 40%→28% top over 2s
      if (pw && time >= 5.9 && time < 7.9) {
        const p = (time - 5.9) / 2.0;
        const e = p * p * (3 - 2 * p);
        pw.style.left = (-400 + 1600 * e) + 'px';
        pw.style.top = (40 + (28 - 40) * e) + '%';
      }

      // Interpolate train: triggered at 7.5, 1200→240 over 1.5s ease-out
      if (tw && time >= 7.5 && time < 9.0) {
        const p = (time - 7.5) / 1.5;
        const e = 1 - (1 - p) * (1 - p);
        tw.style.left = (1200 + (240 - 1200) * e) + 'px';
      }
    }, t);

    await page.waitForTimeout(2);

    const padded = String(frame).padStart(5, '0');
    await page.screenshot({
      path: `${FRAMES_DIR}/frame_${padded}.png`,
      type: 'png',
    });

    if (frame % (FPS * 2) === 0) {
      console.log(`  ${t.toFixed(1)}s / ${DURATION}s  (frame ${frame}/${TOTAL_FRAMES})`);
    }
  }

  await browser.close();
  console.log('=== Frames captured ===');

  console.log('=== Compiling animation ===');
  execSync(
    `ffmpeg -y -framerate ${FPS} -i "${FRAMES_DIR}/frame_%05d.png" -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r ${FPS} "${OUT_DIR}/tmp_anim.mp4"`,
    { stdio: 'inherit' }
  );

  console.log('=== Photo segments (fast cuts) ===');
  const photos = [
    `${IMG_DIR}/manila-gallery-purple-002-cropped.jpg`,
    `${IMG_DIR}/manila-gallery-purple-005-cropped.jpg`,
    `${IMG_DIR}/manila-gallery-purple-003-cropped.jpg`,
    `${IMG_DIR}/manila-gallery-purple-004-cropped.jpg`,
    `${IMG_DIR}/manila-gallery-purple-001-cropped.jpg`,
    `${IMG_DIR}/manila-gallery-purple-006-cropped.jpg`,
  ];

  // Fast cuts — 1-1.5s each
  const durations = [1.2, 1.0, 1.0, 0.8, 1.2, 1.8];

  for (let i = 0; i < photos.length; i++) {
    execSync(
      `ffmpeg -y -loop 1 -i "${photos[i]}" -t ${durations[i]} -vf "scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H}" -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r ${FPS} "${OUT_DIR}/tmp_photo_${i}.mp4"`,
      { stdio: 'pipe' }
    );
  }

  console.log('=== Concatenating ===');
  const concatList = [
    `file 'tmp_anim.mp4'`,
    ...photos.map((_, i) => `file 'tmp_photo_${i}.mp4'`),
  ].join('\n');

  writeFileSync(`${OUT_DIR}/tmp_concat.txt`, concatList);

  execSync(
    `ffmpeg -y -f concat -safe 0 -i "${OUT_DIR}/tmp_concat.txt" -c copy "${OUT_DIR}/reel_animated_story_v2.mp4"`,
    { stdio: 'inherit' }
  );

  // Cleanup
  rmSync(FRAMES_DIR, { recursive: true, force: true });
  execSync(`rm -f "${OUT_DIR}/tmp_anim.mp4" "${OUT_DIR}"/tmp_photo_*.mp4 "${OUT_DIR}/tmp_concat.txt"`);

  console.log('=== Done! ===');
  execSync(`ls -lh "${OUT_DIR}/reel_animated_story_v2.mp4"`, { stdio: 'inherit' });
}

main().catch(console.error);
