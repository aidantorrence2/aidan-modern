#!/usr/bin/env node
// BTS Bridge Reels — concept set 85 (a–e)
// Intercuts the 22s rope-bridge BTS clip with 10 film-scan portraits.
// node render-85.mjs [a b c d e]   (no args = all)
//
// Pipeline per reel:
//   1. render uniform 1080x1920/30fps silent segments (BTS trims, photo Ken-Burns, freeze, flash)
//   2. concat -> silent video
//   3. build the audio track from original-audio spans (so the funny line lands on the reveal)
//   4. mux + burn drawtext overlays (hook / captions / labels / CTA) in one final pass

import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdirSync, rmSync, existsSync, copyFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const FF = existsSync('/opt/homebrew/opt/ffmpeg-full/bin/ffmpeg')
  ? '/opt/homebrew/opt/ffmpeg-full/bin/ffmpeg' : 'ffmpeg';
const SRC = join(ROOT, 'src/bts-source.mp4');
const PH = join(ROOT, 'photos');
const FONTS = join(ROOT, 'fonts');
const WORK = join(ROOT, 'work');
const REELS = join(ROOT, 'reels');
// shared reels library used across the project's reels-final pipeline
const SHARED = join(ROOT, '../manila-model-search-carousel/reels-final/reels');

const W = 1080, H = 1920, FPS = 30;
const FONT_DISPLAY = join(FONTS, 'BebasNeue-Regular.ttf'); // tall condensed — hooks/labels
const FONT_HEAVY = join(FONTS, 'Anton-Regular.ttf');       // heavy — big statements
const FONT_BODY = join(FONTS, 'Montserrat-ExtraBold.ttf'); // captions / CTA
const YELLOW = '#FFE000';

const photo = (n) => join(PH, `${n}.jpg`);

// ---------- ffmpeg helpers ----------
const X264 = ['-c:v', 'libx264', '-preset', 'medium', '-crf', '18',
  '-pix_fmt', 'yuv420p', '-r', String(FPS), '-video_track_timescale', '30000', '-vsync', 'cfr'];

function ff(args, label) {
  try {
    execFileSync(FF, ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: ['ignore', 'ignore', 'inherit'] });
  } catch (e) {
    console.error(`\nffmpeg failed${label ? ' @ ' + label : ''}:\n  ${FF} ${args.join(' ')}\n`);
    throw e;
  }
}
function probeDur(file) {
  const out = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration',
    '-of', 'default=nw=1:nk=1', file]).toString().trim();
  return parseFloat(out);
}
const frames = (dur) => Math.max(1, Math.round(dur * FPS));

// uniform BTS trim, silent
function btsClip(start, dur, out) {
  ff(['-ss', String(start), '-t', String(dur), '-i', SRC, '-an',
    '-vf', `scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},setsar=1,fps=${FPS},format=yuv420p`,
    ...X264, out], 'btsClip');
}
// contain-on-blur composite PNG for a photo (no recrop of the subject, no regrade)
function composePhoto(n, out) {
  ff(['-i', photo(n), '-filter_complex',
    `[0:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},boxblur=24:2,eq=brightness=-0.06:saturation=0.96[bg];` +
    `[0:v]scale=1040:-1:force_original_aspect_ratio=decrease[fg];` +
    `[bg][fg]overlay=(W-w)/2:(H-h)/2`,
    '-frames:v', '1', out], 'composePhoto');
}
// Ken-Burns photo clip from a composed PNG (slow zoom-in)
function photoClip(png, dur, out, speed = 0.0007, zmax = 1.09) {
  const n = frames(dur);
  ff(['-i', png, '-vf',
    `scale=2160:3840,zoompan=z='min(zoom+${speed},${zmax})':d=${n}:` +
    `x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=${W}x${H}:fps=${FPS},format=yuv420p`,
    '-frames:v', String(n), ...X264, out], 'photoClip');
}
// freeze frame with a fast zoom-punch
function freezeClip(t, dur, out, zmax = 1.16) {
  const still = join(WORK, `freeze_${t}.png`);
  ff(['-ss', String(t), '-i', SRC, '-frames:v', '1',
    '-vf', `scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H}`, still], 'freezeStill');
  const n = frames(dur);
  ff(['-i', still, '-vf',
    `zoompan=z='min(zoom+0.006,${zmax})':d=${n}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=${W}x${H}:fps=${FPS},format=yuv420p`,
    '-frames:v', String(n), ...X264, out], 'freezeClip');
}
function whiteClip(dur, out) {
  ff(['-f', 'lavfi', '-i', `color=white:s=${W}x${H}:r=${FPS}`, '-t', String(dur),
    '-vf', 'format=yuv420p', ...X264, out], 'whiteClip');
}
function concatVideo(list, out) {
  const lf = join(WORK, 'concat.txt');
  writeFileSync(lf, list.map((f) => `file '${f}'`).join('\n'));
  try {
    ff(['-f', 'concat', '-safe', '0', '-i', lf, '-c', 'copy', out], 'concatCopy');
  } catch {
    ff(['-f', 'concat', '-safe', '0', '-i', lf, ...X264, out], 'concatReencode');
  }
}
// build audio from original-audio spans -> loudnorm -> exact length
function buildAudio(spans, totalDur, out) {
  const parts = [];
  spans.forEach((s, i) => {
    const p = join(WORK, `aud_${i}.wav`);
    const d = s.b - s.a;
    const fo = Math.max(0, d - 0.06);
    ff(['-ss', String(s.a), '-t', String(d), '-i', SRC, '-vn', '-ac', '2', '-ar', '48000',
      '-af', `afade=t=in:st=0:d=0.03,afade=t=out:st=${fo.toFixed(3)}:d=0.06,volume=${s.vol ?? 1}`, p], 'audSpan');
    parts.push(p);
  });
  const lf = join(WORK, 'aconcat.txt');
  writeFileSync(lf, parts.map((f) => `file '${f}'`).join('\n'));
  const joined = join(WORK, 'ajoined.wav');
  ff(['-f', 'concat', '-safe', '0', '-i', lf, '-c', 'copy', joined], 'audJoin');
  ff(['-i', joined, '-af',
    `loudnorm=I=-14:TP=-1.5:LRA=11,apad`, '-t', String(totalDur), out], 'audNorm');
}

// drawtext final pass. events: {text, font, size, color, y, t0, t1, bw, fade}
function escText(s) {
  return s.replace(/\\/g, '\\\\').replace(/:/g, '\\:').replace(/'/g, '’')
    .replace(/%/g, '\\%').replace(/,/g, '\\,');
}
function drawEvents(silentVideo, audio, events, out) {
  const chain = events.map((e) => {
    const f = e.fade ?? 0.18;
    const alpha = `if(lt(t,${e.t0}+${f}),(t-${e.t0})/${f},if(gt(t,${e.t1}-${f}),(${e.t1}-t)/${f},1))`;
    const x = e.x ?? '(w-text_w)/2';
    return `drawtext=fontfile='${e.font ?? FONT_BODY}':text='${escText(e.text)}':` +
      `x=${x}:y=${e.y}:fontsize=${e.size}:fontcolor=${e.color ?? 'white'}:` +
      `borderw=${e.bw ?? 8}:bordercolor=black@0.92:line_spacing=10:` +
      `shadowx=0:shadowy=3:shadowcolor=black@0.5:` +
      `alpha='${alpha}':enable='between(t,${e.t0},${e.t1})'`;
  }).join(',');
  ff(['-i', silentVideo, '-i', audio,
    '-filter_complex', `[0:v]${chain}[v]`,
    '-map', '[v]', '-map', '1:a',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '19', '-pix_fmt', 'yuv420p',
    '-r', String(FPS), '-c:a', 'aac', '-b:a', '160k', '-ar', '48000', '-movflags', '+faststart',
    '-shortest', out], 'drawEvents');
}

// ---------- segment spec runner ----------
// seg types: {bts:[start,dur]} | {photo:n,dur,speed,zmax} | {freeze:t,dur} | {white:dur}
function renderSegments(segs, tag) {
  const files = [];
  segs.forEach((s, i) => {
    const out = join(WORK, `${tag}_seg${String(i).padStart(2, '0')}.mp4`);
    if (s.bts) btsClip(s.bts[0], s.bts[1], out);
    else if (s.photo !== undefined) {
      const png = join(WORK, `ph_${s.photo}.png`);
      if (!existsSync(png)) composePhoto(s.photo, png);
      photoClip(png, s.dur, out, s.speed, s.zmax);
    } else if (s.freeze !== undefined) freezeClip(s.freeze, s.dur, out, s.zmax);
    else if (s.white !== undefined) whiteClip(s.white, out);
    files.push(out);
  });
  return files;
}

function buildReel({ id, name, segs, audio, texts }) {
  console.log(`\n=== Rendering 85${id} — ${name} ===`);
  const tag = `r${id}`;
  const files = renderSegments(segs, tag);
  const silent = join(WORK, `${tag}_silent.mp4`);
  concatVideo(files, silent);
  const total = probeDur(silent);
  console.log(`  video length: ${total.toFixed(2)}s`);
  const aud = join(WORK, `${tag}_audio.wav`);
  buildAudio(audio, total, aud);
  const outDir = join(ROOT, `output-85${id}`);
  mkdirSync(outDir, { recursive: true });
  const out = join(outDir, `85${id}-${name}.mp4`);
  drawEvents(silent, aud, texts, out);
  // copy to reels libraries
  for (const dir of [REELS, SHARED]) {
    if (existsSync(dir)) copyFileSync(out, join(dir, `85${id}-${name}.mp4`));
  }
  console.log(`  -> ${out} (${probeDur(out).toFixed(2)}s)`);
  return out;
}

// ============ THE 5 REELS ============
// helper text presets
const HOOK = (text, y, size = 96, font = FONT_DISPLAY) =>
  ({ text, font, size, color: YELLOW, y, bw: 9 });
const CAP = (text, t0, t1, y = 1230, size = 60) =>
  ({ text, font: FONT_BODY, size, color: 'white', y, t0, t1, bw: 9 });
// two stacked centered lines (for captions too long for 1080px on one line)
const CAP2 = (l1, l2, t0, t1, y = 1150, size = 60) => ([
  { text: l1, font: FONT_BODY, size, color: 'white', y, t0, t1, bw: 9 },
  { text: l2, font: FONT_BODY, size, color: 'white', y: y + size + 8, t0, t1, bw: 9 },
]);
const LABEL = (text, t0, t1, x = 64, y = 150) =>
  ({ text, font: FONT_DISPLAY, size: 54, color: 'white', x, y, t0, t1, bw: 6, fade: 0.12 });

const REELS_SPEC = {
  // ---- 85a: flagship "you'd never guess" (~17.3s) ----
  a: {
    id: 'a', name: 'youd-never-guess',
    segs: [
      { bts: [0.2, 2.0] },           // EST 0.0-2.0
      { bts: [3.4, 2.2] },           // WALK 2.0-4.2
      { bts: [6.8, 2.0] },           // CROUCH 4.2-6.2
      { bts: [9.6, 1.8] },           // NERVOUS 6.2-8.0
      { bts: [13.0, 1.2] },          // VERTIGO 8.0-9.2
      { freeze: 8.2, dur: 0.5 },     // FREEZE 9.2-9.7
      { white: 0.1 },                // FLASH 9.7-9.8
      { photo: '000006720022', dur: 1.9 },                 // 9.8-11.7
      { photo: '000006720020', dur: 1.8 },                 // 11.7-13.5
      { photo: '000006720037', dur: 1.8 },                 // 13.5-15.3
      { photo: '000006720010-2', dur: 2.2, speed: 0.0009 },// 15.3-17.5  bridge-railing closer
    ],
    // audio: ambient EST, walk/crouch laughs, nervous, then the dialogue (lands on reveals)
    audio: [
      { a: 0.2, b: 2.2 },   // ambient   -> 0.0-2.0
      { a: 3.4, b: 9.0 },   // laughs    -> 2.0-7.6
      { a: 9.6, b: 11.6 },  // nervous   -> 7.6-9.6
      { a: 14.5, b: 22.4 }, // dialogue  -> 9.6-17.5  ("died?" ~9.7, "zero" ~16.5 on closer)
    ],
    texts: [
      HOOK('YOU’D NEVER GUESS', 250, 104),
      HOOK('HOW THIS PHOTO', 366, 104),
      HOOK('WAS TAKEN', 482, 104),
      { ...LABEL('SOUND ON', 0.3, 2.2, '(w-text_w)/2', 600), color: YELLOW, size: 46 },
      LABEL('BTS', 2.2, 9.2),
      ...CAP2('How many people', 'have died on this?', 9.9, 11.7),
      CAP('Don’t say that!', 12.8, 14.2),
      CAP('Hopefully it’s zero.', 16.0, 17.3, 1180, 66),
      { text: 'COMMENT “SHOOT” FOR A FREE SESSION', font: FONT_DISPLAY, size: 50,
        color: YELLOW, y: 1380, t0: 15.4, t1: 17.4, bw: 7 },
    ].map((e) => ({ t0: 0.3, t1: 2.5, ...e })),
  },

  // ---- 85b: full comedy story "things we do for one photo" (~21.5s) ----
  b: {
    id: 'b', name: 'things-we-do-for-one-photo',
    segs: [
      { bts: [0.3, 2.0] },   // 0.0-2.0
      { bts: [3.4, 2.6] },   // 2.0-4.6  walk
      { bts: [6.8, 2.5] },   // 4.6-7.1  crouch/laugh
      { bts: [9.6, 2.0] },   // 7.1-9.1  nervous
      { bts: [13.0, 1.5] },  // 9.1-10.6 vertigo
      { freeze: 8.4, dur: 0.6 }, // 10.6-11.2
      { white: 0.1 },        // 11.2-11.3
      { photo: '000006720022', dur: 1.7 },   // 11.3-13.0
      { photo: '000006720020', dur: 1.6 },   // 13.0-14.6
      { photo: '000006720037', dur: 1.6 },   // 14.6-16.2
      { photo: '000006720026', dur: 1.6 }, // 16.2-17.8 (26 attitude)
      { photo: '000006680027', dur: 1.8 },   // 17.8-19.6
      { photo: '000006720010-2', dur: 2.0, speed: 0.0009 }, // 19.6-21.6 bridge closer
    ],
    // near-original audio arc 0.3-22.0 (dialogue lands naturally over reveals)
    audio: [
      { a: 0.3, b: 12.0 },   // 0.0-11.7  crossing + laughs
      { a: 14.5, b: 22.4 },  // 11.7-19.6 dialogue over reveals; "zero" ~18.2
      { a: 5.0, b: 8.0 },    // 19.6-21.6 trailing laughs under the CTA closer (no silence)
    ],
    texts: [
      HOOK('THE THINGS WE DO', 250, 100),
      HOOK('FOR ONE PHOTO', 360, 100),
      LABEL('BTS', 2.2, 10.6),
      ...CAP2('How many people', 'have died on this?', 11.9, 13.7),
      CAP('Don’t say that!', 14.9, 16.2),
      CAP('Hopefully it’s zero.', 18.2, 19.7, 1180, 66),
      { text: 'SHE SURVIVED. THE PHOTOS DIDN’T MISS.', font: FONT_DISPLAY, size: 52,
        color: 'white', y: 1300, t0: 19.7, t1: 21.5, bw: 7 },
      { text: 'COMMENT “FILM” — FREE TEST SHOOT', font: FONT_DISPLAY, size: 48,
        color: YELLOW, y: 1380, t0: 19.7, t1: 21.5, bw: 7 },
    ].map((e) => ({ t0: 0.3, t1: 2.4, ...e })),
  },

  // ---- 85c: expectation vs reality "you're so creative" (~12s) ----
  c: {
    id: 'c', name: 'youre-so-creative-vs-reality',
    segs: [
      { photo: '000006720037', dur: 2.6, speed: 0.0006 }, // 0.0-2.6 pretty open
      { white: 0.1 },                                      // 2.6-2.7 flash
      { bts: [6.8, 2.3] },   // 2.7-5.0  crouch/laugh (reality)
      { bts: [9.6, 1.6] },   // 5.0-6.6  nervous
      { bts: [13.0, 1.2] },  // 6.6-7.8  vertigo
      { bts: [14.5, 2.2] },  // 7.8-10.0 "how many died"
      { freeze: 16.0, dur: 0.6 }, // 10.0-10.6 scared freeze
      { photo: '000006720022', dur: 1.6 },   // 10.6-12.2 result
    ],
    audio: [
      { a: 0.3, b: 2.9, vol: 0.8 }, // ambient over pretty open -> 0.0-2.6
      { a: 6.8, b: 9.2 },           // laugh -> 2.7-5.1
      { a: 9.6, b: 11.2 },          // nervous -> 5.1-6.7
      { a: 13.0, b: 19.2 },         // vertigo + "how many died" + "don't say that" -> 6.7-12.2
    ],
    texts: [
      { text: '“YOU’RE SO CREATIVE”', font: FONT_DISPLAY, size: 96, color: 'white', y: 300, t0: 0.2, t1: 2.6, bw: 9 },
      { text: '“must be nice, you just take pretty pics”', font: FONT_BODY, size: 40, color: 'white', y: 430, t0: 0.4, t1: 2.6, bw: 7 },
      { text: 'THE REALITY:', font: FONT_HEAVY, size: 84, color: YELLOW, y: 300, t0: 2.7, t1: 4.6, bw: 9 },
      ...CAP2('How many people', 'have died on this?', 8.0, 9.9),
      { text: 'TAG A FRIEND WHO’D CROSS IT', font: FONT_DISPLAY, size: 52, color: YELLOW, y: 1360, t0: 10.6, t1: 12.2, bw: 7 },
    ],
  },

  // ---- 85d: "rating the photos we almost died for" (~20s) ----
  d: {
    id: 'd', name: 'rating-photos-we-almost-died-for',
    segs: [
      { bts: [6.8, 2.0] },   // 0.0-2.0 cold open crouch/laugh
      { photo: '000006720022', dur: 1.8 },   // 2.0-3.8
      { photo: '000006720020', dur: 1.8 },   // 3.8-5.6
      { photo: '000006720037', dur: 1.8 },   // 5.6-7.4
      { bts: [13.0, 1.4] },  // 7.4-8.8 vertigo beat
      { photo: '000006720026', dur: 1.8 },   // 8.8-10.6
      { photo: '000006680027', dur: 1.8 },   // 10.6-12.4
      { photo: '000006680039', dur: 1.7 },   // 12.4-14.1
      { photo: '000006720010-2', dur: 2.2, speed: 0.0009 }, // 14.1-16.3 bridge
      { photo: '000006680040', dur: 1.7 },   // 16.3-18.0
      { freeze: 8.2, dur: 0.6 }, // 18.0-18.6
      { photo: '000006720019', dur: 1.6 },   // 18.6-20.2
    ],
    audio: [
      { a: 6.8, b: 9.0 },    // 0.0-2.2 laugh
      { a: 3.4, b: 6.0 },    // 2.2-4.8 walk laughs
      { a: 9.6, b: 13.0 },   // 4.8-8.2 nervous/vertigo
      { a: 14.5, b: 22.4 },  // 8.2-16.1 dialogue under ratings
      { a: 3.4, b: 8.0 },    // 16.1-20.7 fill laughs
    ],
    texts: [
      HOOK('RATING THE PHOTOS', 250, 92),
      HOOK('WE ALMOST DIED FOR', 356, 92),
      { text: '10/10', font: FONT_HEAVY, size: 110, color: YELLOW, y: 1260, t0: 2.1, t1: 3.7, bw: 10 },
      { text: '10/10', font: FONT_HEAVY, size: 110, color: YELLOW, y: 1260, t0: 3.9, t1: 5.5, bw: 10 },
      { text: '9/10 DREAMY', font: FONT_HEAVY, size: 96, color: YELLOW, y: 1260, t0: 5.7, t1: 7.3, bw: 10 },
      ...CAP2('how many people have', 'died on this??', 7.5, 8.7, 1200, 54),
      { text: '10/10 ATTITUDE', font: FONT_HEAVY, size: 92, color: YELLOW, y: 1260, t0: 8.9, t1: 10.5, bw: 10 },
      { text: '9/10', font: FONT_HEAVY, size: 110, color: YELLOW, y: 1260, t0: 10.7, t1: 12.3, bw: 10 },
      { text: '8/10', font: FONT_HEAVY, size: 110, color: YELLOW, y: 1260, t0: 12.5, t1: 14.0, bw: 10 },
      { text: '11/10 ON THE BRIDGE', font: FONT_HEAVY, size: 80, color: YELLOW, y: 1260, t0: 14.2, t1: 16.2, bw: 10 },
      { text: '9/10', font: FONT_HEAVY, size: 110, color: YELLOW, y: 1260, t0: 16.4, t1: 17.9, bw: 10 },
      { text: 'COMMENT “GOLDEN” FOR A FREE SHOOT', font: FONT_DISPLAY, size: 50, color: YELLOW, y: 1380, t0: 18.4, t1: 20.2, bw: 7 },
    ].map((e) => ({ t0: 0.3, t1: 2.0, ...e })),
  },

  // ---- 85e: seamless match-cut loop (~9s) ----
  e: {
    id: 'e', name: 'one-good-photo-loop',
    segs: [
      { bts: [0.2, 1.5] },   // 0.0-1.5 EST (loop frame)
      { bts: [6.8, 1.6] },   // 1.5-3.1 crouch fear
      { white: 0.08 },       // flash
      { photo: '000006720022', dur: 1.5 },   // 3.2-4.7
      { photo: '000006720010-2', dur: 1.7, speed: 0.0010 }, // 4.7-6.4 bridge
      { photo: '000006720020', dur: 1.5 },   // 6.4-7.9
      { bts: [0.2, 1.3] },   // 7.9-9.2 back to EST -> invisible loop
    ],
    audio: [
      { a: 13.0, b: 22.4 },  // vertigo + full dialogue, plays once per loop
    ],
    texts: [
      HOOK('THE PRICE OF', 250, 96),
      HOOK('ONE GOOD PHOTO', 360, 96),
      CAP('hopefully it’s zero.', 7.4, 9.0, 1300, 60),
    ].map((e) => ({ t0: 0.2, t1: 2.0, ...e })),
  },
};

// ---------- main ----------
const want = process.argv.slice(2).map((s) => s.toLowerCase());
const ids = want.length ? want : ['a', 'b', 'c', 'd', 'e'];
mkdirSync(WORK, { recursive: true });
mkdirSync(REELS, { recursive: true });
const built = [];
for (const id of ids) {
  const spec = REELS_SPEC[id];
  if (!spec) { console.error(`unknown reel: ${id}`); continue; }
  built.push(buildReel(spec));
}
console.log('\nDone:\n' + built.map((b) => '  ' + b).join('\n'));
