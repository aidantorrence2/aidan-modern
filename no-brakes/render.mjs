#!/usr/bin/env node
// Renders no-brakes.html to no-brakes.mp4 (1920x1080, 30fps) with a synthesized score.
//   node no-brakes/render.mjs            full render (4 parallel capture workers)
//   node no-brakes/render.mjs --jobs 8   more workers
import { chromium } from 'playwright';
import { spawn, execFileSync } from 'node:child_process';
import { writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const WORK = join(ROOT, 'build');
const OUT = join(ROOT, 'no-brakes.mp4');
const W = 1920, H = 1080, FPS = 30, SR = 48000;
const FF = existsSync('/opt/homebrew/opt/ffmpeg-full/bin/ffmpeg') ? '/opt/homebrew/opt/ffmpeg-full/bin/ffmpeg' : 'ffmpeg';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };

async function openScene() {
  const launch = existsSync('/opt/pw-browsers/chromium') ? { executablePath: '/opt/pw-browsers/chromium' } : {};
  const browser = await chromium.launch(launch);
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  page.on('pageerror', (e) => { console.error('scene error:', e.message); process.exitCode = 1; });
  await page.goto(pathToFileURL(join(ROOT, 'no-brakes.html')).href + '?capture=1', { waitUntil: 'load' });
  await page.evaluate(async () => {
    for (const f of ['600 40px Cormorant', '500 40px Cormorant', 'italic 500 40px Cormorant', '400 40px Oswald', '600 40px Oswald', '400 40px Plex', '500 40px Plex']) await document.fonts.load(f);
    await document.fonts.ready;
  });
  return { browser, page };
}

// ---------- worker: capture a frame range into a segment ----------
if (process.argv.includes('--worker')) {
  const a = +arg('--from'), b = +arg('--to'), out = arg('--out');
  const { browser, page } = await openScene();
  const enc = spawn(FF, ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', String(FPS), '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', '-r', String(FPS), out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => enc.on('close', (c) => (c === 0 ? res() : rej(new Error('ffmpeg ' + c)))));
  for (let i = a; i < b; i++) {
    const url = await page.evaluate((t) => { window.draw(t); return document.getElementById('c').toDataURL('image/jpeg', 0.95); }, i / FPS);
    const buf = Buffer.from(url.slice(url.indexOf(',') + 1), 'base64');
    if (!enc.stdin.write(buf)) await new Promise((r) => enc.stdin.once('drain', r));
    if ((i - a) % 90 === 0) console.log(`  [${a}-${b}] ${i - a}/${b - a}`);
  }
  enc.stdin.end(); await done; await browser.close();
  process.exit();
}

// ---------- main ----------
rmSync(WORK, { recursive: true, force: true });
mkdirSync(WORK, { recursive: true });
const { browser, page } = await openScene();
const S = await page.evaluate(() => ({ C: window.CH, TOTAL: window.TOTAL, SNAP: window.SNAP_AT, STRIKE: window.STRIKE_AT }));
await browser.close();
const nFrames = Math.round(S.TOTAL * FPS), jobs = +arg('--jobs', 4);
console.log(`rendering ${nFrames} frames with ${jobs} workers`);
const segs = [];
await Promise.all(Array.from({ length: jobs }, (_, j) => {
  const a = Math.floor((nFrames * j) / jobs), b = Math.floor((nFrames * (j + 1)) / jobs), out = join(WORK, `seg${j}.mp4`);
  segs.push(out);
  return new Promise((res, rej) => {
    const p = spawn(process.execPath, [fileURLToPath(import.meta.url), '--worker', '--from', a, '--to', b, '--out', out], { stdio: 'inherit' });
    p.on('close', (c) => (c === 0 ? res() : rej(new Error(`worker ${j} exited ${c}`))));
  });
}));
writeFileSync(join(WORK, 'segs.txt'), segs.map((s) => `file '${s}'`).join('\n'));
const silent = join(WORK, 'video.mp4');
execFileSync(FF, ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', join(WORK, 'segs.txt'), '-c', 'copy', silent]);

// ---------- score: D minor, 96 BPM, one bar = 2.5s ----------
const { C } = S, N = Math.round(S.TOTAL * SR), BEAT = 60 / 96, BAR = BEAT * 4;
const L = new Float32Array(N), R = new Float32Array(N);   // music bus (gets reverb)
const DL = new Float32Array(N), DR = new Float32Array(N); // dry hits
let seed = 7;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, k) => a + (b - a) * k;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
const CHORDS = [[50, 53, 57], [46, 50, 53], [53, 57, 60], [48, 52, 55]]; // Dm Bb F C
const chordAt = (t) => CHORDS[Math.floor(t / BAR) % 4];
const music = (t) => t < C.fin; // everything musical stops dead on the cut

// intensity 0..1 across the film
const inten = (t) => t < C.gub ? 0.15 : t < C.mach ? lerp(0.3, 0.5, prog(t, C.gub, C.mach)) : t < C.cert ? lerp(0.55, 0.75, prog(t, C.mach, C.cert)) : lerp(0.8, 1, prog(t, C.cert, C.fin));

// pad: detuned saws through a moving low-pass
{
  const ph = new Float64Array(9); let lpL = 0, lpR = 0;
  for (let i = 0; i < N; i++) {
    const t = i / SR; if (!music(t)) break;
    const ch = chordAt(t), bt = (t % BAR) / BAR, env = Math.min(1, bt / 0.08) * (0.85 + 0.15 * Math.cos(bt * Math.PI * 2));
    let l = 0, r = 0;
    for (let n = 0; n < 3; n++) for (let v = 0; v < 3; v++) {
      const k = n * 3 + v, f = hz(ch[n]) * Math.pow(2, ((v - 1) * 8) / 1200);
      ph[k] = (ph[k] + f / SR) % 1; const s = ph[k] * 2 - 1;
      if (v === 0) l += s; else if (v === 2) r += s; else { l += s * 0.5; r += s * 0.5; }
    }
    const cut = lerp(500, 2600, inten(t)), a = 1 - Math.exp((-2 * Math.PI * cut) / SR);
    lpL += a * (l - lpL); lpR += a * (r - lpR);
    const amp = 0.035 * env * lerp(0.6, 1, inten(t)) * Math.min(1, t / 1.5);
    L[i] += lpL * amp; R[i] += lpR * amp;
  }
}
// one-shot instruments
function note(t0, f, dur, amp, { type = 'pluck', pan = 0.5, dry = false } = {}) {
  const A = dry ? DL : L, B = dry ? DR : R; let p = 0, lp = 0;
  const n = Math.floor(dur * SR), i0 = Math.round(t0 * SR);
  for (let i = 0; i < n && i0 + i < N; i++) {
    const t = i / SR; let s;
    if (type === 'pluck') { p = (p + f / SR) % 1; const raw = p * 2 - 1; lp += 0.08 * (raw - lp); s = lp * Math.exp(-t * 9); }
    else if (type === 'bell') { s = (Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(2 * Math.PI * f * 2.76 * t) * Math.exp(-t * 8)) * Math.exp(-t * 5); }
    else if (type === 'kick') { p += (2 * Math.PI * (45 + 90 * Math.exp(-t * 28))) / SR; s = Math.sin(p) * Math.exp(-t * 7) + (t < 0.004 ? rnd() * 0.3 : 0); }
    else if (type === 'tick') { s = Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 400) + rnd() * Math.exp(-t * 900) * 0.4; }
    else if (type === 'boom') { p += (2 * Math.PI * (28 + 50 * Math.exp(-t * 5))) / SR; s = Math.sin(p) * Math.exp(-t * 1.6) + (t < 0.05 ? rnd() * 0.5 * (1 - t / 0.05) : 0); }
    else if (type === 'clang') { s = [1, 2.41, 3.9, 5.3].reduce((acc, m, j) => acc + Math.sin(2 * Math.PI * f * m * t) * Math.exp(-t * (3 + j * 2)) / (j + 1), 0); }
    const v = s * amp;
    A[i0 + i] += v * (1 - pan) * 2 * 0.5 + v * 0.5 * (1 - Math.abs(pan - 0.5));
    B[i0 + i] += v * pan * 2 * 0.5 + v * 0.5 * (1 - Math.abs(pan - 0.5));
  }
}
// clock: the timeline ticks every beat (16ths in the climax)
for (let t = 0; t < C.fin; t += BEAT / (t >= C.climax ? 4 : 1)) {
  const down = Math.abs((t / BAR) - Math.round(t / BAR)) < 1e-6;
  note(t, down ? 2600 : 3400, 0.03, (down ? 0.09 : 0.05) * lerp(1, 0.7, inten(t)), { type: 'tick', pan: 0.5 + (Math.round(t / BEAT) % 2 ? 0.15 : -0.15), dry: true });
}
// bass pulse: 8ths from GVBERNATOR, 16ths from MACHINA
for (let t = C.gub; t < C.fin; t += BEAT / 2) {
  const sub = t >= C.mach ? 2 : 1;
  for (let s = 0; s < sub; s++) {
    const tt = t + (s * BEAT) / 4, root = chordAt(tt)[0] - 12;
    note(tt, hz(root), 0.3, 0.16 * lerp(0.7, 1, inten(tt)) * (s ? 0.6 : 1), { type: 'pluck' });
  }
}
// arpeggio bells: from MODERATIO, 16ths from AVRIGA
for (let t = C.mod, k = 0; t < C.fin; k++) {
  const step = t >= C.aur ? BEAT / 4 : BEAT / 2, ch = chordAt(t), m = ch[k % 3] + 24 + (Math.floor(k / 3) % 2) * 12;
  note(t, hz(m), 0.6, 0.035 * inten(t), { type: 'bell', pan: 0.3 + 0.4 * ((k * 0.37) % 1) });
  t += step;
}
// kick: quarters from MACHINA, 8ths in the climax
for (let t = C.mach; t < C.fin - 0.01; t += t >= C.climax ? BEAT / 2 : BEAT) note(t, 0, 0.5, 0.42 * inten(t), { type: 'kick', dry: true });
// chapter hits
for (const t of [C.gub, C.fren, C.mod, C.mach, C.aur, C.cert, C.hic, C.climax]) note(t, 0, 3, 0.45, { type: 'boom', dry: true });
note(0.2, 0, 3, 0.3, { type: 'boom', dry: true });
// risers into the climax and the cut
function riser(t0, t1, amp) {
  let lp = 0, hp = 0;
  for (let i = Math.round(t0 * SR); i < Math.round(t1 * SR) && i < N; i++) {
    const k = (i / SR - t0) / (t1 - t0), a = 1 - Math.exp((-2 * Math.PI * lerp(300, 6000, k * k)) / SR);
    const n = rnd(); lp += a * (n - lp); hp += 0.02 * (lp - hp);
    const v = (lp - hp) * amp * k * k; L[i] += v; R[i] += v;
  }
}
riser(C.hic + 2.5, C.climax, 0.35);
riser(C.climax, C.fin, 0.45);
// Shepard-ish rising tone through the climax
for (let i = Math.round(C.climax * SR); i < Math.round(C.fin * SR); i++) {
  const t = i / SR, k = prog(t, C.climax, C.fin); let s = 0;
  for (let o = 0; o < 5; o++) { const pos = (o + k * 2) % 5, f = 110 * Math.pow(2, pos), w = Math.sin((pos / 5) * Math.PI); s += Math.sin(2 * Math.PI * f * t + o) * w; }
  const v = s * 0.025 * k; L[i] += v; R[i] += v;
}
note(S.SNAP, 330, 2.5, 0.25, { type: 'clang', dry: true });
note(S.SNAP, 0, 3, 0.5, { type: 'boom', dry: true });
// after the cut: silence, one hit on ACCELERATE, a heavy one on the strike, then a held Dm
note(C.fin + 0.4, 0, 2, 0.35, { type: 'boom', dry: true });
note(S.STRIKE, 0, 4, 0.7, { type: 'boom', dry: true });
note(S.STRIKE, 220, 3, 0.12, { type: 'clang', dry: true });
{
  const ph = [0, 0, 0, 0]; const notes = [38, 50, 53, 57];
  for (let i = Math.round((C.fin + 2.4) * SR); i < N; i++) {
    const t = i / SR, env = prog(t, C.fin + 2.4, C.fin + 3.6) * (1 - prog(t, S.TOTAL - 2.5, S.TOTAL));
    let s = 0; notes.forEach((m, j) => { ph[j] += (2 * Math.PI * hz(m)) / SR; s += Math.sin(ph[j]) * (j ? 0.5 : 1); });
    const v = s * 0.07 * env; L[i] += v; R[i] += v;
  }
}
// reverb on the music bus (Schroeder: 4 combs + 2 allpasses per side)
function reverb(x, offs) {
  const y = new Float32Array(N);
  for (const [d, fb] of [[1557, 0.82], [1617, 0.81], [1491, 0.8], [1422, 0.79]].map(([d, f]) => [Math.round((d + offs) * SR / 44100), f])) {
    const b = new Float32Array(d); let j = 0, lp = 0;
    for (let i = 0; i < N; i++) { const o = b[j]; lp = o * 0.7 + lp * 0.3; b[j] = x[i] + lp * fb; y[i] += o * 0.25; j = (j + 1) % d; }
  }
  for (const d of [556, 441].map((d) => Math.round((d + offs) * SR / 44100))) {
    const b = new Float32Array(d); let j = 0;
    for (let i = 0; i < N; i++) { const o = b[j], v = y[i] + o * 0.5; b[j] = v; y[i] = o - v * 0.5; j = (j + 1) % d; }
  }
  return y;
}
const wetL = reverb(L, 0), wetR = reverb(R, 23);
const wav = join(WORK, 'score.wav');
{
  const buf = Buffer.alloc(44 + N * 4);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34);
  buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
  const mixL = new Float32Array(N), mixR = new Float32Array(N); let peak = 0;
  for (let i = 0; i < N; i++) {
    const cut = i / SR >= C.fin && i / SR < C.fin + 0.4 ? 0 : 1; // dead air on the cut
    mixL[i] = (L[i] + wetL[i] * 0.35 + DL[i]) * cut; mixR[i] = (R[i] + wetR[i] * 0.35 + DR[i]) * cut;
    peak = Math.max(peak, Math.abs(mixL[i]), Math.abs(mixR[i]));
  }
  const gn = 0.89 / peak;
  for (let i = 0; i < N; i++) { buf.writeInt16LE(Math.round(clamp(mixL[i] * gn, -1, 1) * 32767), 44 + i * 4); buf.writeInt16LE(Math.round(clamp(mixR[i] * gn, -1, 1) * 32767), 46 + i * 4); }
  writeFileSync(wav, buf);
}
execFileSync(FF, ['-hide_banner', '-loglevel', 'error', '-y', '-i', silent, '-i', wav,
  '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-ar', '48000', '-shortest', '-movflags', '+faststart', OUT], { stdio: 'inherit' });
console.log(`done -> ${OUT}`);
