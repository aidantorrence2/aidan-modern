import { chromium } from 'playwright';
import { execSync } from 'child_process';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'fs';

const OUT_DIR = '/Users/aidantorrence/Documents/aidan-modern/marketing/purple-reels';
const IMG_DIR = '/Users/aidantorrence/Documents/aidan-modern/public/images/large';
const FRAMES_DIR = `${OUT_DIR}/tmp-frames`;
const W = 1080;
const H = 1920;
const FPS = 30;
const DURATION = 17.5;
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
      // Reset all
      document.querySelectorAll('.scene').forEach(s => s.classList.remove('active', 'shake'));
      document.querySelectorAll('.pop').forEach(el => el.classList.remove('pop'));
      document.querySelectorAll('.dim').forEach(el => el.classList.remove('dim'));
      const dd = document.getElementById('dotDot');
      if (dd) { dd.style.opacity = '0'; dd.style.transform = 'scale(0)'; }
      ['zzz1','zzz2','zzz3'].forEach(id => {
        const z = document.getElementById(id);
        if (z) { z.style.opacity = '0'; z.style.transform = 'scale(0)'; }
      });

      // Reset positions
      const sw = document.getElementById('scooterWrap');
      if (sw) sw.style.left = '-300px';
      const pw = document.getElementById('planeWrap');
      if (pw) { pw.style.left = '-400px'; pw.style.top = '40%'; }
      const tw = document.getElementById('trainWrap');
      if (tw) tw.style.left = '1200px';
      const tw2 = document.getElementById('trainWrap2');
      if (tw2) tw2.style.left = '240px';
      const pw2 = document.getElementById('planeWrap2');
      if (pw2) { pw2.style.left = '-400px'; pw2.style.top = '40%'; }
      const rf = document.getElementById('redFlash');
      if (rf) rf.classList.remove('pop');

      window.__applyUpTo(time);

      // Interpolate scooter: 4.2s, -300→1200 over 2s
      if (sw && time >= 4.2 && time < 6.2) {
        const p = (time - 4.2) / 2.0;
        const e = p * p * (3 - 2 * p);
        sw.style.left = (-300 + 1500 * e) + 'px';
      }

      // Interpolate plane 1: 5.9s, -400→1200 left, 40%→28% top over 2s
      if (pw && time >= 5.9 && time < 7.9) {
        const p = (time - 5.9) / 2.0;
        const e = p * p * (3 - 2 * p);
        pw.style.left = (-400 + 1600 * e) + 'px';
        pw.style.top = (40 + (28 - 40) * e) + '%';
      }

      // Interpolate train 1: 7.5s, 1200→240 over 1.5s ease-out
      if (tw && time >= 7.5 && time < 9.0) {
        const p = (time - 7.5) / 1.5;
        const e = 1 - (1 - p) * (1 - p);
        tw.style.left = (1200 + (240 - 1200) * e) + 'px';
      }

      // Interpolate train 2 (leaving): 10.6s, 240→-700 over 1.5s ease-in
      if (tw2 && time >= 10.6 && time < 12.1) {
        const p = (time - 10.6) / 1.5;
        const e = p * p;
        tw2.style.left = (240 + (-700 - 240) * e) + 'px';
      }

      // Interpolate plane 2: 11.9s, -400→1200 left, 40%→30% top over 2s
      if (pw2 && time >= 11.9 && time < 13.9) {
        const p = (time - 11.9) / 2.0;
        const e = p * p * (3 - 2 * p);
        pw2.style.left = (-400 + 1600 * e) + 'px';
        pw2.style.top = (40 + (30 - 40) * e) + '%';
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

  // === Create film frame overlay ===
  console.log('=== Creating film frame overlay ===');
  const FRAME_PNG = `${OUT_DIR}/tmp_film_frame.png`;

  // Film frame: black background, sprocket holes on sides, centered photo window
  // Photo area: centered, with film border
  const photoW = 920;
  const photoH = 1380;
  const photoX = (W - photoW) / 2;
  const photoY = (H - photoH) / 2 - 40;
  const sprocketR = 14;
  const sprocketSpacing = 80;
  const sprocketMargin = 22;

  // Build ImageMagick command for film frame overlay
  let drawCmd = '';
  // Sprocket holes on left and right
  for (let y = 40; y < H; y += sprocketSpacing) {
    drawCmd += ` -draw "fill black stroke none circle ${sprocketMargin},${y} ${sprocketMargin + sprocketR},${y}"`;
    drawCmd += ` -draw "fill black stroke none circle ${W - sprocketMargin},${y} ${W - sprocketMargin + sprocketR},${y}"`;
  }

  // Create the overlay: transparent center (photo window), dark film border around it
  execSync(
    `magick -size ${W}x${H} xc:"#111111" ` +
    `-fill "#0a0a0a" -draw "rectangle ${photoX},${photoY} ${photoX + photoW},${photoY + photoH}" ` +
    // Thin white border around photo
    `-fill none -stroke "rgba(255,255,255,0.08)" -strokewidth 2 -draw "rectangle ${photoX},${photoY} ${photoX + photoW},${photoY + photoH}" ` +
    // Sprocket holes
    drawCmd +
    // Frame number area at bottom
    ` -font /tmp/Arial.ttf -pointsize 24 -fill "rgba(255,255,255,0.2)" ` +
    ` "${FRAME_PNG}"`,
    { stdio: 'pipe' }
  );

  console.log('=== Creating film-framed photo segments ===');
  const photos = [
    `${IMG_DIR}/manila-gallery-purple-002-cropped.jpg`,
    `${IMG_DIR}/manila-gallery-purple-005-cropped.jpg`,
    `${IMG_DIR}/manila-gallery-purple-003-cropped.jpg`,
    `${IMG_DIR}/manila-gallery-purple-004-cropped.jpg`,
    `${IMG_DIR}/manila-gallery-purple-001-cropped.jpg`,
    `${IMG_DIR}/manila-gallery-purple-006-cropped.jpg`,
  ];

  const durations = [1.2, 1.0, 1.0, 0.8, 1.2, 1.8];

  for (let i = 0; i < photos.length; i++) {
    // Composite: scale photo to fit the window, overlay film frame on top
    const frameNum = String(i + 1).padStart(2, '0') + 'A';
    // Create framed photo PNG
    const framedPng = `${OUT_DIR}/tmp_framed_${i}.png`;

    // 1. Scale photo to fill the photo window
    execSync(
      `magick "${photos[i]}" -resize ${photoW}x${photoH}^ -gravity center -extent ${photoW}x${photoH} "${OUT_DIR}/tmp_photo_scaled_${i}.png"`,
      { stdio: 'pipe' }
    );

    // 2. Composite: film frame bg + photo in window + frame number
    execSync(
      `magick "${FRAME_PNG}" ` +
      `"${OUT_DIR}/tmp_photo_scaled_${i}.png" -geometry +${photoX}+${photoY} -composite ` +
      `-font /tmp/Arial.ttf -pointsize 22 -fill "rgba(255,255,255,0.15)" ` +
      `-gravity SouthWest -annotate +${photoX}+${H - photoY - photoH - 30} "${frameNum}" ` +
      `"${framedPng}"`,
      { stdio: 'pipe' }
    );

    // 3. Create video from framed image
    execSync(
      `ffmpeg -y -loop 1 -i "${framedPng}" -t ${durations[i]} -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r ${FPS} "${OUT_DIR}/tmp_photo_${i}.mp4"`,
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
  execSync(`rm -f "${OUT_DIR}/tmp_anim.mp4" "${OUT_DIR}"/tmp_photo_*.mp4 "${OUT_DIR}"/tmp_photo_scaled_*.png "${OUT_DIR}"/tmp_framed_*.png "${OUT_DIR}/tmp_film_frame.png" "${OUT_DIR}/tmp_concat.txt"`);

  console.log('=== Done! ===');
  execSync(`ls -lh "${OUT_DIR}/reel_animated_story_v2.mp4"`, { stdio: 'inherit' });
}

main().catch(console.error);
