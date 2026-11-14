#!/usr/bin/env node
// Focus pipeline renderer v2: stock B-roll + voiceover + word-timed captions -> 1080x1920 mp4.
//
// Spec (render/specs/NNNb.json):
//   { "out": "001b-...", "keyword": "NIGHT",
//     "lines": [ { "say": "spoken line", "query": "pexels search terms", "emph": "ON-SCREEN TAG", "bw": false } ] }
//
// Per line:  voice  -> work/<out>/voice/NN.wav   (TTS backend, see below)
//            footage-> work/<out>/clips/NN.mp4   (Pexels search, or a file you drop there)
// Then each clip is cropped to 9:16, trimmed to the line's audio length, captioned (ASS),
// joined, and muxed with the voice track.
//
// TTS backend: env TTS=kokoro (render/tts_kokoro.py, needs the model download) or
//              TTS=placeholder (silence sized ~2.6 words/s; for layout tests only).
// Footage:     PEXELS search via api.pexels.com (key injected by the session proxy, or
//              env PEXELS_API_KEY). With FOOTAGE=placeholder, coloured test clips are used.
// Any placeholder in use => output goes to work/<out>/DRAFT.mp4, never to videos/.
//
// Usage: node render/broll.mjs render/specs/001b.json
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const spec = JSON.parse(readFileSync(resolve(process.argv[2]), 'utf8'));
const W = 1080, H = 1920, FPS = 30;
const TTS = process.env.TTS || 'kokoro';
const FOOTAGE = process.env.FOOTAGE || 'pexels';
const WORK = join(ROOT, 'work', spec.out);
for (const d of ['voice', 'clips', 'seg']) mkdirSync(join(WORK, d), { recursive: true });
const pad = (i) => String(i).padStart(2, '0');
const sh = (cmd, args) => execFileSync(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] }).toString();
const ff = (args) => sh('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', ...args]);
const dur = (f) => parseFloat(sh('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]));
let draft = TTS === 'placeholder' || FOOTAGE === 'placeholder';

// ---------- 1. voice ----------
for (const [i, ln] of spec.lines.entries()) {
  const wav = join(WORK, 'voice', `${pad(i)}.wav`);
  if (existsSync(wav)) continue;
  if (TTS === 'kokoro') {
    sh('python3', [join(ROOT, 'tts_kokoro.py'), ln.say, wav, spec.voice || 'af_heart']);
  } else {
    const secs = Math.max(1.2, ln.say.split(/\s+/).length / 2.6);
    ff(['-f', 'lavfi', '-i', `anullsrc=r=24000:cl=mono`, '-t', secs.toFixed(2), wav]);
  }
}
const lens = spec.lines.map((_, i) => dur(join(WORK, 'voice', `${pad(i)}.wav`)) + 0.15); // small breath gap

// ---------- 2. footage ----------
async function pexels(query, minSecs) {
  const headers = process.env.PEXELS_API_KEY ? { Authorization: process.env.PEXELS_API_KEY } : {};
  const u = `https://api.pexels.com/videos/search?orientation=portrait&size=medium&per_page=15&query=${encodeURIComponent(query)}`;
  const r = await fetch(u, { headers });
  if (!r.ok) throw new Error(`Pexels ${r.status} for "${query}"`);
  const j = await r.json();
  for (const v of j.videos || []) {
    if (v.duration < minSecs) continue;
    const f = (v.video_files || []).filter((x) => x.height >= 1280 && x.height <= 2160 && x.height > x.width)
      .sort((a, b) => a.height - b.height)[0];
    if (f) return { url: f.link, id: v.id, page: v.url, author: v.user?.name };
  }
  throw new Error(`no portrait clip >= ${minSecs.toFixed(1)}s for "${query}"`);
}
const credits = [];
for (const [i, ln] of spec.lines.entries()) {
  const clip = join(WORK, 'clips', `${pad(i)}.mp4`);
  if (existsSync(clip)) continue;
  if (FOOTAGE === 'pexels') {
    const hit = await pexels(ln.query, lens[i]);
    const buf = Buffer.from(await (await fetch(hit.url)).arrayBuffer());
    writeFileSync(clip, buf);
    credits.push({ line: i, query: ln.query, pexels_id: hit.id, page: hit.page, author: hit.author });
  } else {
    const hue = (i * 47) % 360;
    ff(['-f', 'lavfi', '-i', `testsrc2=s=720x1280:r=${FPS}`, '-t', String(lens[i] + 1), '-vf', `hue=h=${hue}`, '-an', clip]);
  }
}
if (credits.length) writeFileSync(join(WORK, 'credits.json'), JSON.stringify(credits, null, 2));

// ---------- 3. captions (ASS, chunks of <=3 words, timed by character share) ----------
const t = (s) => { const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, x = (s % 60).toFixed(2).padStart(5, '0'); return `${h}:${pad(m)}:${x}`; };
const accent = spec.accentAss || '&H0033CCFF'; // ASS colours are &HAABBGGRR (this = #ffcc33)
let ass = `[Script Info]\nScriptType: v4.00+\nPlayResX: ${W}\nPlayResY: ${H}\nWrapStyle: 2\n\n[V4+ Styles]\n` +
  'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\n' +
  `Style: Cap,Inter Display ExtraBold,96,&H00FFFFFF,&H00FFFFFF,&H00000000,&H64000000,1,0,0,0,100,100,0,0,1,7,3,2,80,80,560,1\n` +
  `Style: Tag,Inter Display ExtraBold,64,${accent},${accent},&H00000000,&HA0000000,1,0,0,0,100,100,2,0,3,18,0,8,80,80,260,1\n` +
  '\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n';
let t0 = 0;
for (const [i, ln] of spec.lines.entries()) {
  const words = ln.say.split(/\s+/);
  const chunks = [];
  for (let k = 0; k < words.length; k += 3) chunks.push(words.slice(k, k + 3).join(' '));
  const total = chunks.reduce((a, c) => a + c.length, 0);
  const speak = lens[i] - 0.15;
  let c0 = t0;
  for (const c of chunks) {
    const d = speak * (c.length / total);
    ass += `Dialogue: 0,${t(c0)},${t(c0 + d)},Cap,,0,0,0,,${c.replace(/[{}]/g, '').toUpperCase()}\n`;
    c0 += d;
  }
  if (ln.emph) ass += `Dialogue: 1,${t(t0)},${t(t0 + lens[i])},Tag,,0,0,0,,${ln.emph}\n`;
  t0 += lens[i];
}
writeFileSync(join(WORK, 'captions.ass'), ass);

// ---------- 4. segments -> concat -> mux ----------
const list = [];
for (const [i, ln] of spec.lines.entries()) {
  const seg = join(WORK, 'seg', `${pad(i)}.mp4`);
  const vf = [
    `scale=${W}:${H}:force_original_aspect_ratio=increase`, `crop=${W}:${H}`,
    ln.bw ? 'hue=s=0' : null, 'eq=brightness=-0.06:saturation=1.05', `fps=${FPS}`, 'format=yuv420p',
  ].filter(Boolean).join(',');
  ff(['-i', join(WORK, 'clips', `${pad(i)}.mp4`), '-t', lens[i].toFixed(3), '-vf', vf, '-an',
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', seg]);
  list.push(`file '${seg}'`);
}
writeFileSync(join(WORK, 'seg', 'list.txt'), list.join('\n'));
const voiceList = spec.lines.map((_, i) => `file '${join(WORK, 'voice', `${pad(i)}.wav`)}'\nduration ${lens[i].toFixed(3)}`).join('\n');
writeFileSync(join(WORK, 'voice', 'list.txt'), voiceList);
ff(['-f', 'concat', '-safe', '0', '-i', join(WORK, 'voice', 'list.txt'), '-ar', '48000', '-ac', '1', join(WORK, 'voice.wav')]);

const out = draft ? join(WORK, 'DRAFT.mp4') : join(ROOT, '..', 'videos', `${spec.out}.mp4`);
ff(['-f', 'concat', '-safe', '0', '-i', join(WORK, 'seg', 'list.txt'), '-i', join(WORK, 'voice.wav'),
  '-vf', `ass=${join(WORK, 'captions.ass')}`, '-map', '0:v', '-map', '1:a',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '23', '-maxrate', '3M', '-bufsize', '6M', '-pix_fmt', 'yuv420p',
  '-c:a', 'aac', '-b:a', '128k', '-shortest', '-movflags', '+faststart', out]);
console.log(`${draft ? 'DRAFT ' : ''}${out}  ${dur(out).toFixed(1)}s  ${(statSync(out).size / 1e6).toFixed(1)} MB`);
