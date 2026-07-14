#!/usr/bin/env node
// Reel 104a — "Ahmedabad, hold it" — BTS directing cut for the Ahmedabad
// free-photo-shoot Meta campaign.
//
// Structure (~18.5s, 1080x1920@30):
//   1. real BTS clip (Untitled 5sdfa.mov 12.8-18.8): "wait wait wait wait —
//      look here again" with original directing audio, filmic grade
//   2. real BTS clip (20.8-26.42): "perfect — hold on, hold it"
//   3. three result frames (same model/shoot), full-frame on blurred self-fill
//   4. end card: Ahmedabad HUGE / free photo shoot / sign up — link below
//
// Audio: ONE continuous mix — speech pieces + wave ambient concatenated, then
// a single loudnorm over the whole track (never per-segment). Cuts fall in the
// silent gap between "look here again" (ends 18.6) and "perfect" (starts 21.2),
// so no words are clipped.
//
// Pipeline mirrors ~/reels-planner/scripts/render-88-97.mjs, with two changes:
//   - FF = /opt/homebrew/bin/ffmpeg (ffmpeg-full is broken: x265 dylib .215
//     missing, brew x265 4.2 ships .216)
//   - text = pre-rendered PNG overlays (make-text.py) because this ffmpeg has
//     no drawtext filter. Run `python3 make-text.py` first (render() does it).
//
// Usage: node render-104a.mjs
import { execFileSync } from 'node:child_process';
import { mkdirSync, copyFileSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const TXT = join(HERE, 'text-overlays');
const OUTDIR = join(HERE, 'output-104a');
const A = '/Users/aidantorrence/reels-planner/assets';
const DOCS = '/Users/aidantorrence/Documents';
const U5 = join(DOCS, 'Untitled 5.mov');       // beach golden hour (waves ambient @33-45s)
const U5S = join(DOCS, 'Untitled 5sdfa.mov');  // fitting BTS w/ directing audio
const REELS_PLANNER = '/Users/aidantorrence/reels-planner/reels';
const REELS_FINAL = join(DOCS, 'aidan-modern/reels-final/reels');
const TMP = '/tmp/reel104-build';
const FF = '/opt/homebrew/bin/ffmpeg';

const W = 1080, H = 1920, FPS = 30;
const X264 = ['-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p',
  '-r', String(FPS), '-video_track_timescale', '30000', '-fps_mode', 'cfr'];
const GRADE = `eq=contrast=1.05:saturation=0.92:gamma=0.985,colorbalance=rs=0.02:gs=0.0:bs=-0.03:rm=0.02:bm=-0.02,vignette=angle=PI/4.8`;

function ff(args, label) {
  try { execFileSync(FF, ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: ['ignore', 'ignore', 'inherit'] }); }
  catch (e) { console.error(`ffmpeg failed @ ${label}`); throw e; }
}

// BTS phone clip: cover-crop to 9:16, filmic grade, PNG text overlays timed
// with enable=between(t,..) (timestamps are clip-relative after input -ss).
function clip(out, src, ss, to, overlays = []) {
  const inputs = ['-ss', String(ss), '-to', String(to), '-i', src];
  let fc = `[0:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},${GRADE}[v0]`;
  overlays.forEach((o, i) => {
    // NB: every looped PNG input MUST be bounded with -t, or ffmpeg runs away
    // encoding past the main input's end (observed: 6s clip -> endless encode).
    inputs.push('-loop', '1', '-t', String(to - ss), '-i', join(TXT, o.png));
    fc += `;[v${i}][${i + 1}:v]overlay=0:0:enable='between(t,${o.s},${o.e})'[v${i + 1}]`;
  });
  fc += `;[v${overlays.length}]setsar=1,fps=${FPS},format=yuv420p[vout]`;
  ff([...inputs, '-filter_complex', fc, '-map', '[vout]', '-an', ...X264, out], `clip ${src}@${ss}`);
}

// Still: full photo contained over blurred darkened self-fill (house style).
function still(out, img, dur, overlays = []) {
  const inputs = ['-loop', '1', '-t', String(dur), '-i', img];
  let fc = `[0:v]split[a][b];[a]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},boxblur=42:4,eq=brightness=-0.28[bg];[b]scale=${W}:${H}:force_original_aspect_ratio=decrease[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2[v0]`;
  overlays.forEach((o, i) => {
    inputs.push('-loop', '1', '-t', String(dur), '-i', join(TXT, o.png));
    fc += `;[v${i}][${i + 1}:v]overlay=0:0:enable='between(t,${o.s},${o.e})'[v${i + 1}]`;
  });
  fc += `;[v${overlays.length}]setsar=1,fps=${FPS},format=yuv420p[vout]`;
  ff([...inputs, '-filter_complex', fc, '-map', '[vout]', '-an', ...X264, out], `still ${img}`);
}

// End card: full-bleed darkened portrait + text PNG, slow fade-in on the text.
function endCard(out, img, dur, png) {
  const fc = `[0:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},${GRADE},eq=brightness=-0.42[v0];` +
    `[1:v]format=rgba,fade=t=in:st=0.25:d=0.5:alpha=1[t];[v0][t]overlay=0:0[v1];` +
    `[v1]setsar=1,fps=${FPS},format=yuv420p[vout]`;
  ff(['-loop', '1', '-t', String(dur), '-i', img, '-loop', '1', '-t', String(dur), '-i', join(TXT, png),
    '-filter_complex', fc, '-map', '[vout]', '-an', ...X264, out], 'endcard');
}

function concatSegs(out, segs) {
  const list = join(TMP, 'list.txt');
  writeFileSync(list, segs.map((s) => `file '${s}'`).join('\n'));
  ff(['-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', out], 'concat');
}

// ONE continuous audio mix: concat all pieces, then a SINGLE loudnorm.
function audioTrack(out, pieces, totalDur) {
  const inputs = [], parts = [];
  pieces.forEach((p, i) => {
    inputs.push('-ss', String(p.ss), '-to', String(p.to), '-i', p.src);
    parts.push(`[${i}:a]aresample=48000,aformat=channel_layouts=stereo${p.vol && p.vol !== 1 ? `,volume=${p.vol}` : ''}[a${i}]`);
  });
  const fc = `${parts.join(';')};${pieces.map((_, i) => `[a${i}]`).join('')}concat=n=${pieces.length}:v=0:a=1,atrim=0:${totalDur},afade=t=out:st=${totalDur - 0.6}:d=0.6,loudnorm=I=-14:TP=-1.5:LRA=11[aout]`;
  ff([...inputs, '-filter_complex', fc, '-map', '[aout]', '-c:a', 'pcm_s16le', out], 'audio');
}

function mux(out, video, audio) {
  ff(['-i', video, '-i', audio, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', '-shortest', out], 'mux');
}

// ---------- build ----------
rmSync(TMP, { recursive: true, force: true });
mkdirSync(TMP, { recursive: true });
mkdirSync(OUTDIR, { recursive: true });
mkdirSync(REELS_FINAL, { recursive: true });

execFileSync('python3', [join(HERE, 'make-text.py')], { stdio: 'inherit' });

// Segment plan. Speech source times (verified in 88b build + whisper transcript):
//   "wait wait wait wait" 13.4-15.5 | "look here again" 15.5-18.6
//   (silence 18.6-21.2)  "perfect" 21.2-23.4 | "hold on hold it" 23.4-26.4
const D1 = 6.0;    // U5S 12.8-18.8
const D2 = 5.62;   // U5S 20.8-26.42
const DS = 1.15;   // each result still
const DE = 3.4;    // end card
const TOTAL = D1 + D2 + 3 * DS + DE; // 18.47

const segs = [];
const c1 = join(TMP, 'c1.mp4');
clip(c1, U5S, 12.8, 18.8, [
  { png: 'title-bts.png', s: 0.3, e: 2.2 },
  { png: 'cap-wait.png', s: 0.6, e: 2.7 },
  { png: 'cap-look.png', s: 2.7, e: 5.8 },
]);
segs.push(c1);
const c2 = join(TMP, 'c2.mp4');
clip(c2, U5S, 20.8, 26.42, [
  { png: 'cap-perfect.png', s: 0.4, e: 2.6 },
  { png: 'cap-hold.png', s: 2.6, e: 5.55 },
]);
segs.push(c2);
// Results — strongest frame first (curated, same model as the BTS clips).
const stillsOrder = ['sofia2-06.jpg', 'sofia-dress2.jpg', 'sofia2-02.jpg'];
stillsOrder.forEach((f, i) => {
  const o = join(TMP, `s${i}.mp4`);
  still(o, join(A, f), DS);
  segs.push(o);
});
const ec = join(TMP, 'endcard.mp4');
endCard(ec, join(A, 'sofia-shirt.jpg'), DE, 'endcard.png');
segs.push(ec);

const v = join(TMP, 'video.mp4');
concatSegs(v, segs);

const a = join(TMP, 'audio.wav');
audioTrack(a, [
  { src: U5S, ss: 12.8, to: 18.8 },                       // directing speech 1
  { src: U5S, ss: 20.8, to: 26.42 },                      // directing speech 2
  { src: U5, ss: 33.0, to: 33.0 + (TOTAL - D1 - D2), vol: 0.5 }, // waves under results+card
], TOTAL);

const name = '104a-ahmedabad-hold-it.mp4';
const out = join(OUTDIR, name);
mux(out, v, a);
copyFileSync(out, join(REELS_FINAL, name));
copyFileSync(out, join(REELS_PLANNER, name));
console.log(`done: ${out} (${TOTAL}s)`);
console.log(`copied -> ${join(REELS_FINAL, name)}`);
console.log(`copied -> ${join(REELS_PLANNER, name)}`);
