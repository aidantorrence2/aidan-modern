#!/usr/bin/env node
// Focus pipeline renderer: spec JSON -> 1080x1920 mp4.
// Each scene is drawn as an HTML card in Chromium (Playwright), screenshotted to PNG,
// then ffmpeg adds a slow push-in per scene, crossfades between scenes and a silent
// AAC track (music is added in-app at post time).
// Usage: node render.mjs specs/001.json   -> ../videos/<spec.out>.mp4 (+ .txt caption)
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, rmSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
// require() resolves the globally pre-installed Playwright; ESM import does not.
const { chromium } = createRequire(import.meta.url)('playwright');
const spec = JSON.parse(readFileSync(resolve(process.argv[2]), 'utf8'));
const W = 1080, H = 1920, FPS = 30, XF = 0.4;
const WORK = join(ROOT, 'work', spec.out);
const OUT = join(ROOT, '..', 'videos', `${spec.out}.mp4`);
rmSync(WORK, { recursive: true, force: true });
mkdirSync(WORK, { recursive: true });

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/(\d+-\w+)/g, '<span class="nw">$1</span>');
const accent = spec.accent || '#ffcc33';

const CSS = `
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;background:#0e0f12;color:#f4f4f2;font-family:Inter,system-ui,sans-serif;overflow:hidden}
.wrap{position:absolute;inset:0;padding:260px 96px 360px;display:flex;flex-direction:column;justify-content:center}
.bg{position:absolute;inset:0;background:radial-gradient(1200px 900px at 80% 10%,${accent}22,transparent 60%),radial-gradient(900px 900px at 0% 100%,#3a6cff1c,transparent 60%)}
.kicker{font-size:40px;letter-spacing:6px;text-transform:uppercase;color:${accent};font-weight:600;margin-bottom:40px}
.hook{font-size:104px;line-height:1.08;font-weight:800;letter-spacing:-2px}
.num{width:150px;height:150px;border-radius:40px;background:${accent};color:#111;font-size:96px;font-weight:800;display:flex;align-items:center;justify-content:center;margin-bottom:56px}
.title{font-size:92px;line-height:1.08;font-weight:800;letter-spacing:-1.5px;margin-bottom:44px}
.body{font-size:52px;line-height:1.35;color:#c9cad0;font-weight:400}
.body b{color:#fff;font-weight:700}
.dots{position:absolute;left:96px;bottom:250px;display:flex;gap:16px}
.dot{width:56px;height:10px;border-radius:5px;background:#ffffff2a}.dot.on{background:${accent}}
.cta{font-size:96px;font-weight:800;line-height:1.1;letter-spacing:-1.5px}
.kw{display:inline-block;margin-top:56px;padding:24px 56px 32px;border:6px solid ${accent};border-radius:28px;color:${accent};text-align:left}
.kw small{display:block;font-size:44px;font-weight:600;letter-spacing:4px;text-transform:uppercase;color:#f4f4f2;margin-bottom:4px}
.kw strong{display:block;font-size:150px;font-weight:900;letter-spacing:10px;line-height:1}
.nw{white-space:nowrap}
.sub{margin-top:48px;font-size:46px;color:#a9aab2;line-height:1.35}
.handle{position:absolute;right:96px;top:150px;font-size:36px;color:#ffffff66;letter-spacing:2px}
`;

function sceneHTML(s, i, n) {
  const dots = s.type === 'step'
    ? `<div class="dots">${spec.scenes.filter(x => x.type === 'step').map((_, k) => `<div class="dot ${k < s.n ? 'on' : ''}"></div>`).join('')}</div>` : '';
  let inner = '';
  if (s.type === 'hook') inner = `${s.kicker ? `<div class="kicker">${esc(s.kicker)}</div>` : ''}<div class="hook">${esc(s.text)}</div>`;
  if (s.type === 'step') inner = `<div class="num">${s.n}</div><div class="title">${esc(s.title)}</div><div class="body">${esc(s.body)}</div>`;
  if (s.type === 'cta') inner = `<div class="cta">${esc(s.text)}</div><div><span class="kw"><small>Comment</small><strong>${esc(s.keyword)}</strong></span></div>${s.sub ? `<div class="sub">${esc(s.sub)}</div>` : ''}`;
  return `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body><div class="bg"></div>${spec.handle ? `<div class="handle">${esc(spec.handle)}</div>` : ''}<div class="wrap">${inner}</div>${dots}</body></html>`;
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
const pngs = [];
for (const [i, s] of spec.scenes.entries()) {
  await page.setContent(sceneHTML(s, i, spec.scenes.length), { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  const p = join(WORK, `s${String(i).padStart(2, '0')}.png`);
  await page.screenshot({ path: p });
  pngs.push(p);
}
await browser.close();

// Per-scene clips with gentle push-in (zoompan on a 2x upscale to avoid jitter).
const clips = spec.scenes.map((s, i) => {
  const d = s.dur, nf = Math.round(d * FPS), c = join(WORK, `c${i}.mp4`);
  const z = `scale=${W * 2}:${H * 2},zoompan=z='1+0.035*on/${nf}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${nf}:s=${W}x${H}:fps=${FPS}`;
  execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-loop', '1', '-i', pngs[i], '-vf', z, '-frames:v', String(nf),
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', c]);
  return { c, d };
});

// Chain xfades.
const inputs = clips.flatMap(({ c }) => ['-i', c]);
let filter = '', last = '[0:v]', off = 0;
for (let i = 1; i < clips.length; i++) {
  off += clips[i - 1].d - XF;
  const lab = `[v${i}]`;
  filter += `${last}[${i}:v]xfade=transition=fade:duration=${XF}:offset=${off.toFixed(3)}${lab};`;
  last = lab;
}
const total = clips.reduce((a, b) => a + b.d, 0) - XF * (clips.length - 1);
filter += `anullsrc=r=44100:cl=stereo,atrim=0:${total.toFixed(3)}[a]`;
mkdirSync(dirname(OUT), { recursive: true });
execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...inputs, '-filter_complex', filter,
  '-map', last, '-map', '[a]', '-c:v', 'libx264', '-preset', 'slow', '-crf', '23', '-maxrate', '2M', '-bufsize', '4M',
  '-pix_fmt', 'yuv420p', '-r', String(FPS), '-c:a', 'aac', '-b:a', '64k', '-movflags', '+faststart', '-shortest', OUT]);

writeFileSync(OUT.replace(/\.mp4$/, '.txt'), spec.caption.trim() + '\n');
const mb = statSync(OUT).size / 1e6;
console.log(`${OUT}  ${total.toFixed(1)}s  ${mb.toFixed(2)} MB`);
if (mb > 8) { console.error('WARNING: over 8 MB'); process.exit(2); }
