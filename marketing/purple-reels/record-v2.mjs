import { chromium } from 'playwright';
import { execSync } from 'child_process';
import { mkdirSync, writeFileSync, rmSync } from 'fs';

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
      document.querySelectorAll('.scene').forEach(s => s.classList.remove('active', 'shake'));
      document.querySelectorAll('.pop').forEach(el => el.classList.remove('pop'));
      document.querySelectorAll('.dim').forEach(el => el.classList.remove('dim'));
      const dd = document.getElementById('dotDot');
      if (dd) { dd.style.opacity = '0'; dd.style.transform = 'scale(0)'; }
      ['zzz1','zzz2','zzz3'].forEach(id => {
        const z = document.getElementById(id);
        if (z) { z.style.opacity = '0'; z.style.transform = 'scale(0)'; }
      });

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

      if (sw && time >= 4.2 && time < 6.2) {
        const p = (time - 4.2) / 2.0;
        const e = p * p * (3 - 2 * p);
        sw.style.left = (-300 + 1500 * e) + 'px';
      }
      if (pw && time >= 5.9 && time < 7.9) {
        const p = (time - 5.9) / 2.0;
        const e = p * p * (3 - 2 * p);
        pw.style.left = (-400 + 1600 * e) + 'px';
        pw.style.top = (40 + (28 - 40) * e) + '%';
      }
      if (tw && time >= 7.5 && time < 9.0) {
        const p = (time - 7.5) / 1.5;
        const e = 1 - (1 - p) * (1 - p);
        tw.style.left = (1200 + (240 - 1200) * e) + 'px';
      }
      if (tw2 && time >= 10.6 && time < 12.1) {
        const p = (time - 10.6) / 1.5;
        const e = p * p;
        tw2.style.left = (240 + (-700 - 240) * e) + 'px';
      }
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

  // === Film scan style photo frames ===
  console.log('=== Creating film scan photo frames ===');

  const photos = [
    `${IMG_DIR}/manila-gallery-purple-002-cropped.jpg`,
    `${IMG_DIR}/manila-gallery-purple-005-cropped.jpg`,
    `${IMG_DIR}/manila-gallery-purple-003-cropped.jpg`,
    `${IMG_DIR}/manila-gallery-purple-004-cropped.jpg`,
    `${IMG_DIR}/manila-gallery-purple-001-cropped.jpg`,
    `${IMG_DIR}/manila-gallery-purple-006-cropped.jpg`,
  ];

  const durations = [1.2, 1.0, 1.0, 0.8, 1.2, 1.8];

  // Film rebate dimensions — image fills the center, thin rebate borders
  const rebateTop = 120;    // rebate area above image
  const rebateBot = 120;    // rebate area below image
  const rebateSide = 60;    // rebate area on sides
  const imgW = W - rebateSide * 2;  // 960
  const imgH = H - rebateTop - rebateBot; // 1680
  const sprocketW = 28;
  const sprocketH = 18;
  const sprocketGap = 48;

  for (let i = 0; i < photos.length; i++) {
    const frameNum = `${18 + i}A`;
    const framedPng = `${OUT_DIR}/tmp_framed_${i}.png`;

    // 1. Scale photo to fill image area (crop to fit, portrait orientation)
    execSync(
      `magick "${photos[i]}" -resize ${imgW}x${imgH}^ -gravity center -extent ${imgW}x${imgH} "${OUT_DIR}/tmp_crop_${i}.png"`,
      { stdio: 'pipe' }
    );

    // 2. Build the film scan frame with ImageMagick
    // Start with dark film base
    let cmd = `magick -size ${W}x${H} xc:"#1a1208" `;

    // Place the photo
    cmd += `"${OUT_DIR}/tmp_crop_${i}.png" -geometry +${rebateSide}+${rebateTop} -composite `;

    // Thin bright frame line around the image (like the exposure edge)
    cmd += `-fill none -stroke "rgba(255,200,100,0.12)" -strokewidth 1 `;
    cmd += `-draw "rectangle ${rebateSide - 1},${rebateTop - 1} ${rebateSide + imgW},${rebateTop + imgH}" `;

    // Sprocket holes along top and bottom rebate
    cmd += `-fill "#0a0800" -stroke none `;
    for (let x = 50; x < W - 30; x += sprocketW + sprocketGap) {
      // Top sprockets
      cmd += `-draw "roundrectangle ${x},${20} ${x + sprocketW},${20 + sprocketH} 4,4" `;
      // Bottom sprockets
      const botY = H - 20 - sprocketH;
      cmd += `-draw "roundrectangle ${x},${botY} ${x + sprocketW},${botY + sprocketH} 4,4" `;
    }

    // Film edge text — frame number on bottom rebate
    cmd += `-font /tmp/Arial.ttf -pointsize 28 -fill "rgba(255,180,80,0.25)" `;
    cmd += `-gravity SouthEast -annotate +${rebateSide + 10}+${30} "${frameNum}" `;

    // Film stock text on top rebate
    cmd += `-gravity NorthWest -annotate +${rebateSide}+${50} "KODAK  5219" `;
    cmd += `-gravity NorthEast -annotate +${rebateSide}+${50} "EPR" `;

    // Arrow markers between sprocket holes (like real film)
    cmd += `-pointsize 18 -gravity North -annotate +0+${rebateTop - 30} "▷        ▷        ▷        ▷        ▷        ▷" `;

    cmd += `"${framedPng}"`;

    execSync(cmd, { stdio: 'pipe' });

    // 3. Create video segment
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
  execSync(`rm -f "${OUT_DIR}/tmp_anim.mp4" "${OUT_DIR}"/tmp_photo_*.mp4 "${OUT_DIR}"/tmp_crop_*.png "${OUT_DIR}"/tmp_framed_*.png "${OUT_DIR}/tmp_concat.txt"`);

  console.log('=== Done! ===');
  execSync(`ls -lh "${OUT_DIR}/reel_animated_story_v2.mp4"`, { stdio: 'inherit' });
}

main().catch(console.error);
