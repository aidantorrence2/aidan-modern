#!/usr/bin/env node
// BTS Bridge Reels — concept set 87 ("scouting" intro + UNCUT bridge clip + results)
// Structure: [front tower clip + beginning tag] -> [full 22.4s bridge clip, UNCUT, small
// readable dialogue captions] -> [results photos, uncaptioned]. 4 variations differ only in
// the beginning tag. node render-87.mjs [a b c d]
import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdirSync, existsSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const FF = existsSync('/opt/homebrew/opt/ffmpeg-full/bin/ffmpeg') ? '/opt/homebrew/opt/ffmpeg-full/bin/ffmpeg' : 'ffmpeg';
const BRIDGE = join(ROOT, 'src/bts-source.mp4');
const FRONT = join(ROOT, 'src/front-clip.mp4');
const PH = join(ROOT, 'photos');
const F = join(ROOT, 'fonts');
const WORK = join(ROOT, 'work87');
const REELS = join(ROOT, 'reels');
const SHARED = join(ROOT, '../manila-model-search-carousel/reels-final/reels');

const W = 1080, H = 1920, FPS = 30;
const SANS_L = join(F, 'Inter-Light.ttf');
const SANS_M = join(F, 'Inter-Medium.ttf');
const SANS_SB = join(F, 'Inter-SemiBold.ttf');
const SERIF_IT = join(F, 'PlayfairDisplay-MediumItalic.ttf');
const photo = (n) => join(PH, `${n}.jpg`);

const X264 = ['-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p',
  '-r', String(FPS), '-video_track_timescale', '30000', '-vsync', 'cfr'];
const GRADE = `eq=contrast=1.05:saturation=0.92:gamma=0.985,colorbalance=rs=0.02:gs=0.0:bs=-0.03:rm=0.02:bm=-0.02,vignette=angle=PI/4.8`;

function ff(args, label) {
  try { execFileSync(FF, ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: ['ignore', 'ignore', 'inherit'] }); }
  catch (e) { console.error(`\nffmpeg failed${label ? ' @ ' + label : ''}:\n  ${FF} ${args.join(' ')}\n`); throw e; }
}
const probeDur = (file) => parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', file]).toString().trim());
const frames = (d) => Math.max(1, Math.round(d * FPS));

// landscape front clip -> FULL-FRAME (cover-crop keeps the centered tower; matches the bridge
// clip, which is the same tower), graded, silent.
function frontClip(out) {
  ff(['-i', FRONT, '-an', '-vf',
    `scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},${GRADE},setsar=1,fps=${FPS},format=yuv420p`,
    ...X264, out], 'frontClip');
}
// full bridge clip, UNCUT, graded, silent
function bridgeClip(out) {
  ff(['-i', BRIDGE, '-an', '-vf',
    `scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},${GRADE},setsar=1,fps=${FPS},format=yuv420p`,
    ...X264, out], 'bridgeClip');
}
// full-frame result photo (cover-crop at focus point, pristine — no regrade)
const FX = { '000006720022': 0.5, '000006720020': 0.6, '000006720037': 0.66, '000006720026': 0.66,
  '000006680027': 0.66, '000006720010-2': 0.52, '000006720019': 0.6, '000006680039': 0.4, '000006680040': 0.46 };
function photoClip(n, dur, out) {
  const nf = frames(dur), fx = FX[n] ?? 0.5;
  ff(['-loop', '1', '-t', String(dur), '-i', photo(n), '-r', String(FPS), '-vf',
    `scale=-2:${H},crop=${W}:${H}:x='(iw-${W})*${fx}':y=0,setsar=1,fps=${FPS},format=yuv420p`,
    '-frames:v', String(nf), ...X264, out], 'photoClip');
}
function concatVideo(list, out) {
  const lf = join(WORK, 'cat.txt');
  writeFileSync(lf, list.map((f) => `file '${f}'`).join('\n'));
  try { ff(['-f', 'concat', '-safe', '0', '-i', lf, '-c', 'copy', out], 'catCopy'); }
  catch { ff(['-f', 'concat', '-safe', '0', '-i', lf, ...X264, out], 'catRe'); }
}
// native audio: front clip + full bridge (kept in sync, uncut), then a soft ambient bed under
// the results, then loudnorm to the exact total length.
function buildAudio(resultsDur, totalDur, out) {
  const fa = join(WORK, 'fa.wav'), ba = join(WORK, 'ba.wav'), bed = join(WORK, 'bed.wav');
  ff(['-i', FRONT, '-vn', '-ac', '2', '-ar', '48000', '-af', 'afade=t=in:st=0:d=0.05', fa], 'fa');
  ff(['-i', BRIDGE, '-vn', '-ac', '2', '-ar', '48000', ba], 'ba');
  // soft wind bed for the results from the bridge intro ambient, low + faded
  ff(['-ss', '0.2', '-t', '2.0', '-i', BRIDGE, '-vn', '-ac', '2', '-ar', '48000',
    '-af', `aloop=loop=-1:size=96000,volume=0.32,afade=t=in:st=0:d=0.4,afade=t=out:st=${(resultsDur - 1.6).toFixed(2)}:d=1.6`,
    '-t', String(resultsDur), bed], 'bed');
  const lf = join(WORK, 'acat.txt');
  writeFileSync(lf, [fa, ba, bed].map((f) => `file '${f}'`).join('\n'));
  const joined = join(WORK, 'ajoin.wav');
  ff(['-f', 'concat', '-safe', '0', '-i', lf, '-c', 'copy', joined], 'ajoin');
  ff(['-i', joined, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11,apad', '-t', String(totalDur), out], 'anorm');
}
function escText(s) { return s.replace(/\\/g, '\\\\').replace(/:/g, '\\:').replace(/'/g, '’').replace(/%/g, '\\%').replace(/,/g, '\\,'); }
function drawEvents(silent, audio, events, out) {
  const dur = probeDur(silent);
  const parts = events.map((e) => {
    const f = e.fade ?? 0.25;
    const alpha = `if(lt(t,${e.t0}+${f}),(t-${e.t0})/${f},if(gt(t,${e.t1}-${f}),(${e.t1}-t)/${f},1))`;
    const x = e.x ?? '(w-text_w)/2';
    const box = e.box === false ? '' : `box=1:boxcolor=black@${e.box ?? 0.4}:boxborderw=${e.pad ?? 20}:`;
    return `drawtext=fontfile='${e.font ?? SANS_SB}':text='${escText(e.text)}':x=${x}:y=${e.y}:` +
      `fontsize=${e.size}:fontcolor=${e.color ?? 'white'}:${box}shadowx=0:shadowy=2:shadowcolor=black@0.5:` +
      `line_spacing=${e.ls ?? 12}:alpha='${alpha}':enable='between(t,${e.t0},${e.t1})'`;
  });
  const chain = `[0:v]fade=t=in:st=0:d=0.3,${parts.join(',')},fade=t=out:st=${(dur - 0.4).toFixed(2)}:d=0.4[v]`;
  ff(['-i', silent, '-i', audio, '-filter_complex', chain, '-map', '[v]', '-map', '1:a',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-maxrate', '12M', '-bufsize', '24M',
    '-pix_fmt', 'yuv420p', '-r', String(FPS), '-c:a', 'aac', '-b:a', '160k', '-ar', '48000',
    '-movflags', '+faststart', '-shortest', out], 'draw');
}

// ---- assemble (shared across all 4; only the tag differs) ----
const RESULTS = ['000006720022', '000006720037', '000006720026', '000006720010-2']; // 4 heroes, 2.1s each
const RES_DUR = 2.1;
let FRONT_D, BRIDGE_D; // filled at runtime

// small, very-readable dialogue captions on the bridge (offset by the front-clip length)
function captionEvents(off) {
  const C = (text, a, b) => ({ text, font: SANS_SB, size: 46, y: 1500, t0: off + a, t1: off + b, box: 0.42, pad: 22, fade: 0.18 });
  return [
    C('don’t look down', 11.4, 12.8),
    C('how many people have died on this?', 14.6, 16.3),
    C('don’t say that!', 17.6, 19.3),
    C('hopefully it’s zero', 21.2, 22.5),
  ];
}

// beginning tag: setup over the front clip, payoff landing at the cut into the bridge
function tagEvents(setup, payoff, opts = {}) {
  const font = opts.serif ? SERIF_IT : SANS_M;
  const size = opts.size ?? 58;
  const y = opts.y ?? 360;
  return [
    { text: setup, font, size, color: 'white', y, t0: 0.35, t1: 2.5, box: 0.32, pad: 24, fade: 0.35 },
    { text: payoff, font, size, color: 'white', y, t0: 2.55, t1: FRONT_D + 1.4, box: 0.32, pad: 24, fade: 0.3 },
  ];
}

const TAGS = {
  a: { name: 'looking-for-locations', setup: 'looking for shoot locations…', payoff: 'ok perfect.' },
  b: { name: 'pov-scout', setup: 'POV: you find the perfect location', payoff: 'then you see how to get the shot', serif: false },
  c: { name: 'not-the-same-3-spots', setup: 'everyone shoots the same 3 spots…', payoff: 'so we found this one.' },
  d: { name: 'somewhere-with-a-view', setup: 'me: i want somewhere with a view', payoff: 'the view:', serif: true },
};

function buildReel(id) {
  const t = TAGS[id];
  console.log(`\n=== 87${id} — ${t.name} ===`);
  const tag = `r${id}`;
  const fseg = join(WORK, `${tag}_front.mp4`); if (!existsSync(join(WORK, 'front.mp4'))) frontClip(join(WORK, 'front.mp4'));
  copyFileSync(join(WORK, 'front.mp4'), fseg);
  const bseg = join(WORK, 'bridge.mp4'); if (!existsSync(bseg)) bridgeClip(bseg);
  FRONT_D = probeDur(fseg); BRIDGE_D = probeDur(bseg);
  const pclips = RESULTS.map((n, i) => { const o = join(WORK, `ph_${n}.mp4`); if (!existsSync(o)) photoClip(n, RES_DUR, o); return o; });
  const silent = join(WORK, `${tag}_silent.mp4`);
  concatVideo([fseg, bseg, ...pclips], silent);
  const total = probeDur(silent);
  const resultsDur = RESULTS.length * RES_DUR;
  const aud = join(WORK, `${tag}_a.wav`);
  buildAudio(resultsDur, total, aud);
  const texts = [...tagEvents(t.setup, t.payoff, { serif: t.serif }), ...captionEvents(FRONT_D)];
  const outDir = join(ROOT, `output-87${id}`); mkdirSync(outDir, { recursive: true });
  const out = join(outDir, `87${id}-${t.name}.mp4`);
  drawEvents(silent, aud, texts, out);
  for (const d of [REELS, SHARED]) if (existsSync(d)) copyFileSync(out, join(d, `87${id}-${t.name}.mp4`));
  console.log(`  front ${FRONT_D.toFixed(2)}s + bridge ${BRIDGE_D.toFixed(2)}s + results ${resultsDur.toFixed(1)}s -> ${probeDur(out).toFixed(2)}s`);
  return out;
}

const want = process.argv.slice(2).map((s) => s.toLowerCase());
const ids = want.length ? want : ['a', 'b', 'c', 'd'];
mkdirSync(WORK, { recursive: true }); mkdirSync(REELS, { recursive: true });
const built = ids.map(buildReel);
console.log('\nDone:\n' + built.map((b) => '  ' + b).join('\n'));
