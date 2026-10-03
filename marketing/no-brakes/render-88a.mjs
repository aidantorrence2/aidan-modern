#!/usr/bin/env node
// Reel 88a — "NO BRAKES" (starring Dario). A parody short about the AI intelligence explosion:
// the safety-minded driver of a car with no brakes, a capability gauge with no redline, rivals
// in the mirror and a road that ends in fog.
//
// Video: scene-88a.html draws every frame on a canvas (renderAt(t)); this script steps it with
// Playwright and pipes the frames into ffmpeg. Audio: synthesised here (engine, wind, impacts,
// heartbeat) from the scene's own timing so cuts and sounds stay locked together.
//
//   node marketing/no-brakes/render-88a.mjs            -> output-88a/88a-no-brakes.mp4
//   node marketing/no-brakes/render-88a.mjs --stills   -> output-88a/stills/*.jpg only
import { chromium } from 'playwright';
import { spawn, execFileSync } from 'node:child_process';
import { writeFileSync, mkdirSync, existsSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const ID = '88a', NAME = `${ID}-no-brakes`;
const OUT = join(ROOT, `output-${ID}`);
const REELS = join(ROOT, 'reels-final/reels');
const FF = existsSync('/opt/homebrew/opt/ffmpeg-full/bin/ffmpeg') ? '/opt/homebrew/opt/ffmpeg-full/bin/ffmpeg' : 'ffmpeg';
const W = 1080, H = 1920, FPS = 30, SR = 48000;
const STILLS = process.argv.includes('--stills');

mkdirSync(OUT, { recursive: true });
mkdirSync(REELS, { recursive: true });

// ---------- video ----------
const launch = existsSync('/opt/pw-browsers/chromium') ? { executablePath: '/opt/pw-browsers/chromium' } : {};
const browser = await chromium.launch(launch);
const page = await browser.newPage({ viewport: { width: W, height: H } });
page.on('pageerror', (e) => { console.error('scene error:', e.message); process.exitCode = 1; });
await page.goto(pathToFileURL(join(ROOT, `scene-${ID}.html`)).href + '?capture=1', { waitUntil: 'load' });
await page.evaluate(async () => {
  for (const f of ['400 40px Anton', '300 40px Inter', '600 40px Inter', 'italic 500 40px Playfair']) await document.fonts.load(f);
  await document.fonts.ready;
});
const S = await page.evaluate(() => ({
  T: window.TIMING, TOTAL: window.TOTAL, GAUGE_STEPS: window.GAUGE_STEPS, STOMPS: window.STOMPS,
  SIGN_PASSES: window.SIGN_PASSES, BEATS: window.BEATS,
}));
const frameAt = (t) => page.evaluate((t) => { window.renderAt(t); return document.getElementById('c').toDataURL('image/jpeg', 0.95); }, t)
  .then((u) => Buffer.from(u.slice(u.indexOf(',') + 1), 'base64'));

if (STILLS) {
  mkdirSync(join(OUT, 'stills'), { recursive: true });
  for (const t of [1.5, 4.5, 7, 11.8, 14, 16.2, 19.6, 22, 24.6, 26.2, 28.2, 29.5, 33.8, 37]) {
    writeFileSync(join(OUT, 'stills', `t${t.toFixed(1)}.jpg`), await frameAt(t));
  }
  await browser.close();
  console.log(`stills -> ${join(OUT, 'stills')}`);
  process.exit();
}

const silent = join(OUT, 'video-silent.mp4');
const nFrames = Math.round(S.TOTAL * FPS);
const enc = spawn(FF, ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', String(FPS), '-i', '-',
  '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', '-r', String(FPS), silent], { stdio: ['pipe', 'inherit', 'inherit'] });
const encDone = new Promise((res, rej) => enc.on('close', (c) => (c === 0 ? res() : rej(new Error(`ffmpeg exited ${c}`)))));
for (let i = 0; i < nFrames; i++) {
  const buf = await frameAt(i / FPS);
  if (!enc.stdin.write(buf)) await new Promise((r) => enc.stdin.once('drain', r));
  if (i % 60 === 0) process.stdout.write(`\rframes ${i}/${nFrames}`);
}
enc.stdin.end();
await encDone;
await browser.close();
console.log(`\rframes ${nFrames}/${nFrames}`);

// ---------- audio ----------
const { T } = S, N = Math.round(S.TOTAL * SR);
const L = new Float32Array(N), R = new Float32Array(N);
let seed = 22;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, k) => a + (b - a) * k;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const add = (i, l, r = l) => { if (i >= 0 && i < N) { L[i] += l; R[i] += r; } };

// engine pitch (Hz) and level, scene by scene; hard stop at the cut to black
function engine(t) {
  if (t < T.car || t >= T.black) return [0, 0, 0];
  if (t < T.gauge) return [lerp(36, 50, prog(t, T.car, T.gauge)), lerp(0.1, 0.22, prog(t, T.car, T.car + 1.2)), 900];
  if (t < T.pedals) {
    let k = 0, last = T.gauge;
    for (const s of S.GAUGE_STEPS) if (t >= s) { k++; last = s; }
    return [52 + k * 5.5 + (k ? 14 * Math.exp(-(t - last) * 5) : 0), 0.26, 1100];
  }
  if (t < T.mirror) return [96 + Math.sin(t * 3) * 1.5, 0.16, 500]; // muffled down in the footwell
  if (t < T.road) return [lerp(98, 108, prog(t, T.mirror, T.road)), 0.22, 900];
  if (t < T.face) return [lerp(104, 135, prog(t, T.road, T.face)), lerp(0.24, 0.3, prog(t, T.road, T.face)), 1300];
  return [lerp(135, 210, prog(t, T.face, T.black)), lerp(0.3, 0.42, prog(t, T.face, T.black)), 2200];
}
let ph = 0, lpL = 0, lpR = 0, wL = 0, wR = 0, wL2 = 0, wR2 = 0;
for (let i = 0; i < N; i++) {
  const t = i / SR;
  const [fe, ae, cut] = engine(t);
  let e = 0;
  if (ae > 0) {
    ph += (2 * Math.PI * fe) / SR;
    for (let k = 1; k <= 7; k++) e += Math.sin(k * ph + k * k * 0.3) / k;
    e *= 0.75 + 0.25 * Math.sin(ph * 0.5); // firing lope
    e = Math.tanh(e * 1.6) + rnd() * 0.08;
    const a = 1 - Math.exp((-2 * Math.PI * cut) / SR);
    lpL += a * (e - lpL); e = lpL * ae;
  }
  // wind / tyre roar rises with speed
  let wa = 0;
  if (t >= T.car && t < T.black) wa = t < T.road ? 0.05 + 0.04 * prog(t, T.car, T.road) : lerp(0.09, 0.2, prog(t, T.road, T.black));
  if (t >= T.pedals && t < T.mirror) wa *= 0.5;
  const wc = 1 - Math.exp((-2 * Math.PI * lerp(350, 1600, wa / 0.2)) / SR);
  wL += wc * (rnd() - wL); wR += wc * (rnd() - wR);
  wL2 += wc * (wL - wL2); wR2 += wc * (wR - wR2);
  // low tension drone, builds through the piece
  let dr = 0;
  if (t > 0.4 && t < T.black) dr = (Math.sin(2 * Math.PI * 41.2 * t) + 0.6 * Math.sin(2 * Math.PI * 61.7 * t)) * lerp(0.03, 0.09, prog(t, 0.4, T.black));
  if (t >= T.end) dr = (Math.sin(2 * Math.PI * 41.2 * t) + 0.5 * Math.sin(2 * Math.PI * 82.4 * t + 0.4)) * 0.1 * prog(t, T.end, T.end + 0.3) * (1 - prog(t, S.TOTAL - 2, S.TOTAL));
  // ringing whine as the face push-in peaks
  let wh = 0;
  if (t > T.face + 0.8 && t < T.black) { const k = prog(t, T.face + 0.8, T.black); wh = Math.sin(2 * Math.PI * lerp(900, 3200, k * k) * t) * 0.05 * k; }
  add(i, e + wL2 * wa * 3 + dr + wh, e * 0.96 + wR2 * wa * 3 + dr + wh);
}

// one-shot sounds
function boom(t0, amp, f0 = 70, f1 = 28, dec = 1.6) {
  let p = 0;
  for (let i = 0; i < SR * dec * 2.5; i++) {
    const t = i / SR, f = f1 + (f0 - f1) * Math.exp(-t * 6);
    p += (2 * Math.PI * f) / SR;
    const v = Math.sin(p) * Math.exp(-t / (dec / 2.3)) * amp + (t < 0.03 ? rnd() * amp * 0.6 * (1 - t / 0.03) : 0);
    add(Math.round((t0 + t) * SR), v);
  }
}
function click(t0, amp) { for (let i = 0; i < SR * 0.012; i++) add(Math.round(t0 * SR) + i, rnd() * amp * (1 - i / (SR * 0.012))); }
function clank(t0, amp) {
  boom(t0, amp, 90, 45, 0.35);
  for (const [f, a] of [[880, 1], [1330, 0.7], [2210, 0.4]]) for (let i = 0; i < SR * 0.5; i++) {
    const t = i / SR; add(Math.round((t0 + t) * SR), Math.sin(2 * Math.PI * f * t) * a * amp * 0.25 * Math.exp(-t * 9));
  }
}
function whoosh(tc, amp, dur = 0.9) {
  let a = 0, b = 0;
  for (let i = -SR * dur; i < SR * dur * 0.5; i++) {
    const t = i / SR, env = Math.exp(-((t / (dur * 0.35)) ** 2)), fc = 600 + 2200 * env;
    const k = 1 - Math.exp((-2 * Math.PI * fc) / SR);
    a += k * (rnd() - a); b += k * (a - b);
    const pan = clamp(0.5 + t / dur);
    add(Math.round((tc + t) * SR), (a - b) * env * amp * 4 * (1 - pan), (a - b) * env * amp * 4 * pan);
  }
}
function horn(t0, dur, amp) {
  let lp = 0;
  for (let i = 0; i < SR * dur; i++) {
    const t = i / SR, env = Math.min(1, t / 0.03) * Math.min(1, (dur - t) / 0.08);
    const s = Math.sign(Math.sin(2 * Math.PI * 392 * t)) + Math.sign(Math.sin(2 * Math.PI * 494 * t));
    lp += 0.08 * (s - lp); add(Math.round((t0 + t) * SR), lp * env * amp * 0.7, lp * env * amp);
  }
}
function heartbeat(t0, amp) { boom(t0, amp, 62, 38, 0.3); }

boom(0.45, 0.55);                                                   // title slam
for (const c of [T.gauge, T.pedals, T.mirror, T.road, T.face]) boom(c, 0.22, 80, 40, 0.5); // cuts
S.GAUGE_STEPS.forEach((s, i) => click(s, 0.25 + i * 0.03));          // needle jumps
S.STOMPS.forEach((s) => clank(s, 0.5));                              // foot hits nothing
S.SIGN_PASSES.forEach((s) => s < T.face && whoosh(s, 0.12));        // gantries overhead
horn(21.6, 0.35, 0.12); horn(22.05, 0.55, 0.14);                    // high beams + horn in the mirror
S.BEATS.forEach((b, i) => heartbeat(b, i % 2 ? 0.35 : 0.5));         // after the cut to black
boom(T.end, 0.6, 60, 26, 2.2);                                       // end card

const wav = join(OUT, 'audio.wav');
{
  const buf = Buffer.alloc(44 + N * 4);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVEfmt ', 8);
  buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
  let peak = 0; for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
  const g = 0.89 / (peak || 1);
  for (let i = 0; i < N; i++) {
    buf.writeInt16LE(Math.round(clamp(L[i] * g, -1, 1) * 32767), 44 + i * 4);
    buf.writeInt16LE(Math.round(clamp(R[i] * g, -1, 1) * 32767), 46 + i * 4);
  }
  writeFileSync(wav, buf);
}

// ---------- mux ----------
const final = join(OUT, `${NAME}.mp4`);
execFileSync(FF, ['-hide_banner', '-loglevel', 'error', '-y', '-i', silent, '-i', wav,
  '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11,alimiter=limit=0.89', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000',
  '-shortest', '-movflags', '+faststart', final], { stdio: 'inherit' });
copyFileSync(final, join(REELS, `${NAME}.mp4`));
console.log(`done -> ${final}\n     -> ${join(REELS, `${NAME}.mp4`)}`);
