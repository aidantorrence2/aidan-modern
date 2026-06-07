#!/usr/bin/env node
// BTS Bridge Reels — concept set 86 (editorial redo of 85)
// Clean direction: full-frame photos, filmic-graded BTS clip, minimal type, clean cuts,
// original funny audio carries it. node render-86.mjs [a b c d e]
import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdirSync, existsSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const FF = existsSync('/opt/homebrew/opt/ffmpeg-full/bin/ffmpeg')
  ? '/opt/homebrew/opt/ffmpeg-full/bin/ffmpeg' : 'ffmpeg';
const SRC = join(ROOT, 'src/bts-source.mp4');
const PH = join(ROOT, 'photos');
const F = join(ROOT, 'fonts');
const WORK = join(ROOT, 'work86');
const REELS = join(ROOT, 'reels');
const SHARED = join(ROOT, '../manila-model-search-carousel/reels-final/reels');

const W = 1080, H = 1920, FPS = 30;
const SERIF = join(F, 'PlayfairDisplay-Regular.ttf');
const SERIF_IT = join(F, 'PlayfairDisplay-MediumItalic.ttf');
const SANS_L = join(F, 'Inter-Light.ttf');
const SANS_M = join(F, 'Inter-Medium.ttf');
const SANS_SB = join(F, 'Inter-SemiBold.ttf');
const photo = (n) => join(PH, `${n}.jpg`);

const X264 = ['-c:v', 'libx264', '-preset', 'medium', '-crf', '19',
  '-pix_fmt', 'yuv420p', '-r', String(FPS), '-video_track_timescale', '30000', '-vsync', 'cfr'];

function ff(args, label) {
  try { execFileSync(FF, ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: ['ignore', 'ignore', 'inherit'] }); }
  catch (e) { console.error(`\nffmpeg failed${label ? ' @ ' + label : ''}:\n  ${FF} ${args.join(' ')}\n`); throw e; }
}
const probeDur = (file) => parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', file]).toString().trim());
const frames = (d) => Math.max(1, Math.round(d * FPS));

// filmic grade + vignette so the phone clip matches the film photos.
// (No synthetic grain: the film scans already carry grain, and `noise` exploded the bitrate.)
const GRADE = `eq=contrast=1.05:saturation=0.92:gamma=0.985,` +
  `colorbalance=rs=0.02:gs=0.0:bs=-0.03:rm=0.02:bm=-0.02,` +
  `vignette=angle=PI/4.8`;

function btsClip(start, dur, out) {
  ff(['-ss', String(start), '-t', String(dur), '-i', SRC, '-an',
    '-vf', `scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},${GRADE},setsar=1,fps=${FPS},format=yuv420p`,
    ...X264, out], 'btsClip');
}
// FULL-FRAME photo (cover): scale to height, crop sides at focusX (0=keep left .. 1=keep right).
// Subject stays uncropped vertically (full height kept); pristine — no regrade.
function photoClip(n, dur, out, focusX = 0.5) {
  const nf = frames(dur);
  // FULL-FRAME cover: scale to height, crop sides at focusX. Static = clean lookbook feel.
  ff(['-loop', '1', '-t', String(dur), '-i', photo(n), '-r', String(FPS), '-vf',
    `scale=-2:${H},crop=${W}:${H}:x='(iw-${W})*${focusX}':y=0,setsar=1,fps=${FPS},format=yuv420p`,
    '-frames:v', String(nf), ...X264, out], 'photoClip');
}
function blackClip(dur, out) {
  ff(['-f', 'lavfi', '-i', `color=black:s=${W}x${H}:r=${FPS}`, '-t', String(dur), '-vf', 'format=yuv420p', ...X264, out], 'blackClip');
}
function concatVideo(list, out) {
  const lf = join(WORK, 'concat.txt');
  writeFileSync(lf, list.map((f) => `file '${f}'`).join('\n'));
  try { ff(['-f', 'concat', '-safe', '0', '-i', lf, '-c', 'copy', out], 'concatCopy'); }
  catch { ff(['-f', 'concat', '-safe', '0', '-i', lf, ...X264, out], 'concatReencode'); }
}
function buildAudio(spans, totalDur, out) {
  const parts = [];
  spans.forEach((s, i) => {
    const p = join(WORK, `a_${i}.wav`); const d = s.b - s.a; const fo = Math.max(0, d - 0.06);
    ff(['-ss', String(s.a), '-t', String(d), '-i', SRC, '-vn', '-ac', '2', '-ar', '48000',
      '-af', `afade=t=in:st=0:d=0.03,afade=t=out:st=${fo.toFixed(3)}:d=0.06,volume=${s.vol ?? 1}`, p], 'aud');
    parts.push(p);
  });
  const lf = join(WORK, 'aconcat.txt');
  writeFileSync(lf, parts.map((f) => `file '${f}'`).join('\n'));
  const joined = join(WORK, 'ajoin.wav');
  ff(['-f', 'concat', '-safe', '0', '-i', lf, '-c', 'copy', joined], 'ajoin');
  ff(['-i', joined, '-af', `loudnorm=I=-14:TP=-1.5:LRA=11,apad`, '-t', String(totalDur), out], 'anorm');
}
function escText(s) { return s.replace(/\\/g, '\\\\').replace(/:/g, '\\:').replace(/'/g, '’').replace(/%/g, '\\%').replace(/,/g, '\\,'); }
// clean editorial text: white, soft shadow, faint scrim box, no chunky border
function drawEvents(silent, audio, events, out, fadeOut) {
  const dur = probeDur(silent);
  const parts = events.map((e) => {
    const f = e.fade ?? 0.25;
    const alpha = `if(lt(t,${e.t0}+${f}),(t-${e.t0})/${f},if(gt(t,${e.t1}-${f}),(${e.t1}-t)/${f},1))`;
    const x = e.x ?? '(w-text_w)/2';
    const box = e.box === false ? '' : `box=1:boxcolor=black@${e.box ?? 0.22}:boxborderw=${e.pad ?? 26}:`;
    return `drawtext=fontfile='${e.font ?? SANS_M}':text='${escText(e.text)}':x=${x}:y=${e.y}:` +
      `fontsize=${e.size}:fontcolor=${e.color ?? 'white'}:${box}` +
      `shadowx=0:shadowy=2:shadowcolor=black@0.45:line_spacing=${e.ls ?? 14}:` +
      `alpha='${alpha}':enable='between(t,${e.t0},${e.t1})'`;
  });
  const chain = `[0:v]fade=t=in:st=0:d=0.35,${parts.join(',')},fade=t=out:st=${(dur - 0.3).toFixed(2)}:d=0.3[v]`;
  ff(['-i', silent, '-i', audio, '-filter_complex', chain, '-map', '[v]', '-map', '1:a',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-maxrate', '12M', '-bufsize', '24M',
    '-pix_fmt', 'yuv420p', '-r', String(FPS),
    '-c:a', 'aac', '-b:a', '160k', '-ar', '48000', '-movflags', '+faststart', '-shortest', out], 'draw');
}

function renderSegments(segs, tag) {
  return segs.map((s, i) => {
    const out = join(WORK, `${tag}_s${String(i).padStart(2, '0')}.mp4`);
    if (s.bts) btsClip(s.bts[0], s.bts[1], out);
    else if (s.photo !== undefined) photoClip(s.photo, s.dur, out, s.fx);
    else if (s.black !== undefined) blackClip(s.black, out);
    return out;
  });
}
function buildReel({ id, name, segs, audio, texts }) {
  console.log(`\n=== 86${id} — ${name} ===`);
  const tag = `r${id}`;
  const silent = join(WORK, `${tag}_silent.mp4`);
  concatVideo(renderSegments(segs, tag), silent);
  const total = probeDur(silent);
  const aud = join(WORK, `${tag}_a.wav`);
  buildAudio(audio, total, aud);
  const outDir = join(ROOT, `output-86${id}`); mkdirSync(outDir, { recursive: true });
  const out = join(outDir, `86${id}-${name}.mp4`);
  drawEvents(silent, aud, texts, out);
  for (const d of [REELS, SHARED]) if (existsSync(d)) copyFileSync(out, join(d, `86${id}-${name}.mp4`));
  console.log(`  -> ${out}  ${probeDur(out).toFixed(2)}s`);
  return out;
}

// per-photo horizontal focus (keep the subject in frame on a 9:16 cover-crop)
const FX = { '000006720022': 0.5, '000006720020': 0.6, '000006720037': 0.66, '000006720026': 0.66,
  '000006680027': 0.66, '000006720010-2': 0.52, '000006720019': 0.6, '000006680039': 0.4,
  '000006680040': 0.46, '000006680036': 0.58 };
const P = (n, dur, push = 0) => ({ photo: n, dur, fx: FX[n] ?? 0.5, push });

// clean text helpers
const HOOK = (text, t0, t1, y = 250, size = 56, font = SANS_L) => ({ text, font, size, color: 'white', y, t0, t1, box: 0.0, fade: 0.4 });
const CAP = (l1, l2, t0, t1, y = 1500, size = 54) => {
  const a = [{ text: l1, font: SANS_M, size, y, t0, t1 }];
  if (l2) a.push({ text: l2, font: SANS_M, size, y: y + size + 10, t0, t1 });
  return a;
};
const CTA = (text, t0, t1, y = 1560) => ({ text, font: SANS_M, size: 40, y, t0, t1, box: 0.0, color: 'white', ls: 6 });

const SPEC = {
  // 86a — flagship: clip breathes, clean full-frame reveal, punchline on the closer (~17.8s)
  a: {
    id: 'a', name: 'same-evening',
    segs: [
      { bts: [0.2, 2.0] }, { bts: [3.4, 2.4] }, { bts: [6.8, 2.4] }, { bts: [9.6, 1.8] }, { bts: [13.0, 1.2] }, // 9.8 BTS
      P('000006720022', 2.0), P('000006720037', 2.0), P('000006720026', 2.0), P('000006720010-2', 2.0, 0.05), // 8.0 reveal
    ],
    audio: [
      { a: 0.2, b: 2.2 }, { a: 3.4, b: 9.2 }, { a: 9.6, b: 11.6 }, { a: 14.5, b: 22.4 },
    ],
    texts: [
      { text: 'you’d never guess these are the same evening', font: SANS_L, size: 44, y: 250, t0: 0.5, t1: 3.4, box: 0.0, fade: 0.5 },
      ...CAP('How many people', 'have died on this?', 9.9, 11.7, 1470, 52),
      ...CAP('Don’t say that.', null, 12.9, 14.2, 1470, 52),
      ...CAP('Hopefully it’s zero.', null, 16.1, 17.6, 1470, 56),
      CTA('free film shoots this month  ·  dm to book', 15.6, 17.8),
    ],
  },
  // 86b — full audio comedy, photos as the payoff (~21s)
  b: {
    id: 'b', name: 'for-one-photo',
    segs: [
      { bts: [0.3, 2.0] }, { bts: [3.4, 2.6] }, { bts: [6.8, 2.6] }, { bts: [9.6, 2.0] }, { bts: [13.0, 1.4] }, // 10.6
      P('000006720022', 2.0), P('000006720020', 2.0), P('000006720037', 2.0), P('000006720026', 2.0), P('000006720010-2', 2.2, 0.05), // 10.2
    ],
    audio: [{ a: 0.3, b: 12.0 }, { a: 14.5, b: 22.4 }, { a: 5.0, b: 7.2 }],
    texts: [
      { text: 'the things we do for one photo', font: SERIF_IT, size: 56, y: 250, t0: 0.5, t1: 3.6, box: 0.0, fade: 0.5 },
      ...CAP('How many people', 'have died on this?', 11.9, 13.7, 1470, 52),
      ...CAP('Don’t say that.', null, 14.9, 16.2, 1470, 52),
      ...CAP('Hopefully it’s zero.', null, 18.2, 19.7, 1470, 56),
      CTA('comment FILM for a free test shoot', 19.6, 21.0),
    ],
  },
  // 86c — what they see vs what it took (tasteful, ~12.5s)
  c: {
    id: 'c', name: 'what-it-took',
    segs: [
      P('000006720037', 2.6), { black: 0.12 }, { bts: [6.8, 2.4] }, { bts: [9.6, 1.6] }, { bts: [13.0, 1.2] }, { bts: [14.5, 2.2] }, P('000006720022', 2.2, 0.05),
    ],
    audio: [{ a: 0.3, b: 2.9, vol: 0.85 }, { a: 6.8, b: 9.2 }, { a: 9.6, b: 11.2 }, { a: 13.0, b: 19.4 }],
    texts: [
      { text: 'what you see', font: SERIF_IT, size: 60, y: 250, t0: 0.3, t1: 2.6, box: 0.0, fade: 0.4 },
      { text: 'what it took', font: SERIF_IT, size: 60, y: 250, t0: 2.8, t1: 5.0, box: 0.0, fade: 0.4 },
      ...CAP('How many people', 'have died on this?', 8.1, 10.0, 1470, 52),
      CTA('dm to book a free film shoot', 10.6, 12.4),
    ],
  },
  // 86d — quiet portfolio montage, funny audio underneath (~18s)
  d: {
    id: 'd', name: 'the-gallery',
    segs: [
      { bts: [6.8, 2.2] },
      P('000006720022', 1.9), P('000006720020', 1.9), P('000006720037', 1.9), P('000006720026', 1.9),
      { bts: [13.0, 1.3] },
      P('000006680027', 1.9), P('000006720010-2', 2.0, 0.05), P('000006680040', 1.9), P('000006720019', 1.9),
    ],
    audio: [{ a: 6.8, b: 9.2 }, { a: 3.4, b: 6.0 }, { a: 9.6, b: 13.0 }, { a: 14.5, b: 22.4 }, { a: 3.4, b: 6.0 }],
    texts: [
      { text: 'a few from the bridge', font: SERIF_IT, size: 56, y: 250, t0: 0.4, t1: 2.2, box: 0.0, fade: 0.45 },
      ...CAP('how many people have died on this?', null, 11.6, 12.9, 1480, 40),
      CTA('free film shoots this month  ·  comment GOLDEN', 16.0, 18.0),
    ],
  },
  // 86e — seamless loop (~9s)
  e: {
    id: 'e', name: 'loop',
    segs: [
      { bts: [0.2, 1.6] }, { bts: [6.8, 1.7] }, P('000006720022', 1.6), P('000006720010-2', 1.7, 0.05), P('000006720020', 1.5), { bts: [0.2, 1.3] },
    ],
    audio: [{ a: 13.0, b: 22.4 }],
    texts: [
      { text: 'the price of one good photo', font: SERIF_IT, size: 54, y: 250, t0: 0.3, t1: 2.4, box: 0.0, fade: 0.5 },
      ...CAP('hopefully it’s zero.', null, 7.4, 8.9, 1480, 50),
    ],
  },
};

const want = process.argv.slice(2).map((s) => s.toLowerCase());
const ids = want.length ? want : ['a', 'b', 'c', 'd', 'e'];
mkdirSync(WORK, { recursive: true }); mkdirSync(REELS, { recursive: true });
const built = [];
for (const id of ids) { const s = SPEC[id]; if (!s) { console.error('unknown', id); continue; } built.push(buildReel(s)); }
console.log('\nDone:\n' + built.map((b) => '  ' + b).join('\n'));
