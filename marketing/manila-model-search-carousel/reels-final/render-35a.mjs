import { chromium } from 'playwright';
import { execSync } from 'child_process';
import { mkdirSync, writeFileSync, rmSync, existsSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

var __dirname = path.dirname(fileURLToPath(import.meta.url));

var OUT_DIR = path.join(__dirname, 'output-35a');
var IMG_DIR = '/Users/aidantorrence/Documents/aidan-modern/public/images/large';
var FRAMES_DIR = path.join(OUT_DIR, 'tmp-frames');
var W = 1080;
var H = 1920;
var FPS = 30;
var DURATION = 19;
var TOTAL_FRAMES = Math.ceil(DURATION * FPS);

var PHOTOS = [
  path.join(IMG_DIR, 'manila-gallery-dsc-0190.jpg'),
  path.join(IMG_DIR, 'manila-gallery-night-001.jpg'),
  path.join(IMG_DIR, 'manila-gallery-garden-001.jpg'),
  path.join(IMG_DIR, 'manila-gallery-urban-001.jpg'),
  path.join(IMG_DIR, 'manila-gallery-canal-001.jpg'),
];

var PHOTO_DURATIONS = [1.2, 1.0, 1.0, 1.2, 1.5];

function hasImageMagick() {
  try {
    execSync('which magick', { stdio: 'pipe' });
    return true;
  } catch (e) {
    return false;
  }
}

async function main() {
  console.log('=== Manila Animated Story v35a ===');

  rmSync(OUT_DIR, { recursive: true, force: true });
  mkdirSync(OUT_DIR, { recursive: true });
  mkdirSync(FRAMES_DIR, { recursive: true });

  // === PHASE 1: Frame capture ===
  console.log('=== Phase 1: Frame capture ===');

  var htmlPath = path.join(__dirname, 'animated-story-manila.html');
  if (!existsSync(htmlPath)) {
    console.error('ERROR: animated-story-manila.html not found!');
    process.exit(1);
  }

  var browser = await chromium.launch();
  var page = await browser.newPage({ viewport: { width: W, height: H } });

  await page.goto('file://' + htmlPath + '?capture=1', { waitUntil: 'load' });
  await page.waitForTimeout(500);

  console.log('Capturing ' + TOTAL_FRAMES + ' frames at ' + FPS + 'fps (' + DURATION + 's)...');

  for (var frame = 0; frame < TOTAL_FRAMES; frame++) {
    var t = frame / FPS;

    await page.evaluate(function(time) {
      // Reset all scenes
      document.querySelectorAll('.scene').forEach(function(s) {
        s.classList.remove('active', 'shake');
      });
      document.querySelectorAll('.pop').forEach(function(el) {
        el.classList.remove('pop');
      });

      // Reset map pin
      var pin = document.getElementById('mapPin');
      if (pin) { pin.style.transform = 'scale(0)'; pin.style.opacity = '0'; }

      // Reset faces
      var cf = document.getElementById('confusedFace');
      if (cf) cf.style.opacity = '1';
      var cnf = document.getElementById('confidentFace');
      if (cnf) cnf.style.opacity = '0';

      // Reset flash overlays
      ['shootFlash1','shootFlash2','shootFlash3'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.style.opacity = '0';
      });

      // Reset file stack
      ['file1','file2','file3','photoIcon','checkMark'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.style.opacity = '0';
      });

      // Reset new photos grid
      for (var i = 1; i <= 9; i++) {
        var el = document.getElementById('newP' + i);
        if (el) el.style.opacity = '0';
      }

      // Reset suspense dots
      var dots = document.getElementById('suspenseDots');
      if (dots) { dots.style.opacity = '0'; dots.style.transform = 'scale(0)'; }

      // Apply timeline up to current time
      window.__applyUpTo(time);
    }, t);

    await page.waitForTimeout(2);

    var padded = String(frame).padStart(5, '0');
    await page.screenshot({
      path: path.join(FRAMES_DIR, 'frame_' + padded + '.png'),
      type: 'png',
    });

    if (frame % (FPS * 2) === 0) {
      console.log('  ' + t.toFixed(1) + 's / ' + DURATION + 's  (frame ' + frame + '/' + TOTAL_FRAMES + ')');
    }
  }

  await browser.close();
  console.log('=== Frames captured ===');

  // Compile animation
  console.log('=== Compiling animation to mp4 ===');
  var animMp4 = path.join(OUT_DIR, 'tmp_anim.mp4');
  execSync(
    'ffmpeg -y -framerate ' + FPS + ' -i "' + path.join(FRAMES_DIR, 'frame_%05d.png') + '" -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r ' + FPS + ' "' + animMp4 + '"',
    { stdio: 'inherit' }
  );

  // Clean up frames
  rmSync(FRAMES_DIR, { recursive: true, force: true });

  // === PHASE 2: Photo clips ===
  console.log('=== Phase 2: Photo clips ===');

  var useMagick = hasImageMagick();
  console.log('ImageMagick available: ' + useMagick);

  for (var i = 0; i < PHOTOS.length; i++) {
    var photoPath = PHOTOS[i];
    if (!existsSync(photoPath)) {
      console.warn('WARNING: Photo not found: ' + photoPath + ', skipping');
      continue;
    }

    var clipMp4 = path.join(OUT_DIR, 'tmp_photo_' + i + '.mp4');
    var dur = PHOTO_DURATIONS[i];

    if (useMagick) {
      // Film-scan style with ImageMagick
      var imgW = W - 120;   // 960
      var imgH = H - 240;   // 1680
      var rebateSide = 60;
      var rebateTop = 120;

      var cropPng = path.join(OUT_DIR, 'tmp_crop_' + i + '.png');
      var framedPng = path.join(OUT_DIR, 'tmp_framed_' + i + '.png');

      // Scale and crop photo
      execSync(
        'magick "' + photoPath + '" -resize ' + imgW + 'x' + imgH + '^ -gravity center -extent ' + imgW + 'x' + imgH + ' "' + cropPng + '"',
        { stdio: 'pipe' }
      );

      // Build film frame
      var cmd = 'magick -size ' + W + 'x' + H + ' xc:"#1a1208" ';
      cmd += '"' + cropPng + '" -geometry +' + rebateSide + '+' + rebateTop + ' -composite ';
      // Thin frame line
      cmd += '-fill none -stroke "rgba(255,200,100,0.12)" -strokewidth 1 ';
      cmd += '-draw "rectangle ' + (rebateSide - 1) + ',' + (rebateTop - 1) + ' ' + (rebateSide + imgW) + ',' + (rebateTop + imgH) + '" ';
      // Sprocket holes
      cmd += '-fill "#0a0800" -stroke none ';
      for (var x = 50; x < W - 30; x += 76) {
        cmd += '-draw "roundrectangle ' + x + ',20 ' + (x + 28) + ',38 4,4" ';
        var botY = H - 38;
        cmd += '-draw "roundrectangle ' + x + ',' + botY + ' ' + (x + 28) + ',' + (botY + 18) + ' 4,4" ';
      }
      cmd += '"' + framedPng + '"';
      execSync(cmd, { stdio: 'pipe' });

      // Convert to video clip
      execSync(
        'ffmpeg -y -loop 1 -i "' + framedPng + '" -t ' + dur + ' -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r ' + FPS + ' "' + clipMp4 + '"',
        { stdio: 'pipe' }
      );
    } else {
      // Simple approach: scale with letterboxing via ffmpeg
      execSync(
        'ffmpeg -y -loop 1 -i "' + photoPath + '" -t ' + dur + ' -vf "scale=' + W + ':' + H + ':force_original_aspect_ratio=decrease,pad=' + W + ':' + H + ':(ow-iw)/2:(oh-ih)/2:color=0a0a0a" -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r ' + FPS + ' "' + clipMp4 + '"',
        { stdio: 'pipe' }
      );
    }
    console.log('  Photo clip ' + i + ' done');
  }

  // === PHASE 3: Ending card ===
  console.log('=== Phase 3: Ending card ===');

  var endPng = path.join(OUT_DIR, 'tmp_end.png');
  var endMp4 = path.join(OUT_DIR, 'tmp_end.mp4');

  if (useMagick) {
    execSync(
      'magick -size ' + W + 'x' + H + ' xc:black -gravity Center -pointsize 72 -fill white -font "/System/Library/Fonts/Supplemental/Arial Bold.ttf" -annotate +0-40 "@madebyaidan" -pointsize 38 -fill "rgba(255,255,255,0.5)" -annotate +0+60 "DM me on Instagram" "' + endPng + '"',
      { stdio: 'pipe' }
    );
  } else {
    // Create ending card with ffmpeg using drawtext
    execSync(
      'ffmpeg -y -f lavfi -i "color=c=black:s=' + W + 'x' + H + ':d=1" -frames:v 1 "' + endPng + '"',
      { stdio: 'pipe' }
    );
    // Use ffmpeg drawtext for the ending card video directly
    execSync(
      'ffmpeg -y -f lavfi -i "color=c=black:s=' + W + 'x' + H + ':d=2.5:r=' + FPS + '" ' +
      '-vf "drawtext=text=@madebyaidan:fontsize=72:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2-40,' +
      'drawtext=text=DM me on Instagram:fontsize=38:fontcolor=gray:x=(w-text_w)/2:y=(h-text_h)/2+60" ' +
      '-c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p "' + endMp4 + '"',
      { stdio: 'pipe' }
    );
  }

  if (useMagick || existsSync(endPng)) {
    if (!existsSync(endMp4)) {
      execSync(
        'ffmpeg -y -loop 1 -i "' + endPng + '" -t 2.5 -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r ' + FPS + ' "' + endMp4 + '"',
        { stdio: 'pipe' }
      );
    }
  }

  // === Concatenation ===
  console.log('=== Concatenating final video ===');

  var concatLines = ["file 'tmp_anim.mp4'"];
  for (var i = 0; i < PHOTOS.length; i++) {
    var clipPath = path.join(OUT_DIR, 'tmp_photo_' + i + '.mp4');
    if (existsSync(clipPath)) {
      concatLines.push("file 'tmp_photo_" + i + ".mp4'");
    }
  }
  concatLines.push("file 'tmp_end.mp4'");

  var concatTxt = path.join(OUT_DIR, 'tmp_concat.txt');
  writeFileSync(concatTxt, concatLines.join('\n'));

  var finalMp4 = path.join(OUT_DIR, 'manila-animated-story-v35a.mp4');
  execSync(
    'ffmpeg -y -f concat -safe 0 -i "' + concatTxt + '" -c copy "' + finalMp4 + '"',
    { stdio: 'inherit' }
  );

  // Cleanup temp files
  execSync('rm -f "' + OUT_DIR + '/tmp_anim.mp4" "' + OUT_DIR + '"/tmp_photo_*.mp4 "' + OUT_DIR + '"/tmp_crop_*.png "' + OUT_DIR + '"/tmp_framed_*.png "' + OUT_DIR + '/tmp_end.png" "' + OUT_DIR + '/tmp_end.mp4" "' + OUT_DIR + '/tmp_concat.txt"');

  // Copy to videos directory
  var videosDir = path.join(__dirname, 'videos');
  if (!existsSync(videosDir)) mkdirSync(videosDir, { recursive: true });

  var finalStat = statSync(finalMp4);
  console.log('Final video: ' + (finalStat.size / (1024 * 1024)).toFixed(1) + ' MB');

  execSync('cp "' + finalMp4 + '" "' + path.join(videosDir, 'manila-animated-story-v35a.mp4') + '"');
  console.log('Copied to videos/manila-animated-story-v35a.mp4');

  console.log('=== Done! Output: ' + OUT_DIR + ' ===');
  execSync('ls -lh "' + finalMp4 + '"', { stdio: 'inherit' });
}

main().catch(function(err) {
  console.error(err);
  process.exit(1);
});
