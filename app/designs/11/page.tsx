'use client';

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { portfolioGlobe } from '@/lib/portfolio-globe';
import { PHOTOS, opt, optSet, RESET, LINKS, type Photo } from '../shared';

const N = PHOTOS.length;
const PRIORITY_COUNT = PHOTOS.filter((p) => p.star).length;
const GLOBE = portfolioGlobe(PRIORITY_COUNT, N - PRIORITY_COUNT);
const POS = GLOBE.positions;
const EASE = 'cubic-bezier(.2,.7,.1,1)';

// Each tile's outward direction, matching the CSS `rotateY(lon) rotateX(lat) translateZ(r)` placement.
const DIR = POS.map(({ lon, lat }) => {
  const a = (lon * Math.PI) / 180, b = (lat * Math.PI) / 180;
  return { x: Math.cos(b) * Math.sin(a), y: -Math.sin(b), z: Math.cos(b) * Math.cos(a) };
});
// Stable pseudo-random per photo (intro scatter, puzzle tilt, stagger).
const rnd = (i: number, s = 1) => { const x = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453; return x - Math.floor(x); };

type Box = { left: number; top: number; width: number; height: number };

/** Largest rect with the photo's aspect ratio inside the area, centred. */
function fit(p: Photo, x0: number, y0: number, x1: number, y1: number): Box {
  const aw = x1 - x0, ah = y1 - y0, r = p.w / p.h;
  const width = Math.min(aw, ah * r), height = width / r;
  return { left: x0 + (aw - width) / 2, top: y0 + (ah - height) / 2, width, height };
}

/** Animate an element from a source rect to where it sits; without a source, slide in from `dir`. */
function flip(el: HTMLElement, from: Box | null, dir = 1) {
  if (!from) {
    el.animate([{ opacity: 0, transform: `translateX(${dir * 70}px) scale(.97)` }, { opacity: 1, transform: 'none' }], { duration: 550, easing: EASE });
    return;
  }
  const t = el.getBoundingClientRect();
  el.animate([
    { transformOrigin: 'top left', transform: `translate(${from.left - t.left}px, ${from.top - t.top}px) scale(${from.width / t.width}, ${from.height / t.height})` },
    { transformOrigin: 'top left', transform: 'none' },
  ], { duration: 800, easing: EASE });
}

/** Justified rows: each fills `width` exactly; the last keeps `target` height. */
function pack(list: Photo[], width: number, target: number, gap: number) {
  const rows: { h: number; items: Photo[] }[] = [];
  let cur: Photo[] = [], ar = 0;
  for (const p of list) {
    cur.push(p); ar += p.w / p.h;
    if (ar * target + gap * (cur.length - 1) >= width) { rows.push({ h: (width - gap * (cur.length - 1)) / ar, items: cur }); cur = []; ar = 0; }
  }
  if (cur.length) rows.push({ h: target, items: cur });
  return rows;
}

const GRAIN = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`;

const CSS = `@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap');
` + RESET + `
  html, body { background: #000 !important; }
  .gl { position: fixed; inset: 0; background: #000; color: #fff; overflow: hidden; font: 13px/1 "Helvetica Neue", Helvetica, Arial, sans-serif; user-select: none; -webkit-user-select: none; touch-action: none; cursor: none; }
  .gl a, .gl button, .pz a { color: inherit; text-decoration: none; opacity: .75; transition: opacity .3s; cursor: none; } .gl a:hover, .gl button:hover, .pz a:hover { opacity: 1; }
  .hd { position: fixed; top: 0; right: 0; display: flex; gap: 24px; padding: 24px 30px; z-index: 20; }
  .hdbg { position: fixed; top: 0; left: 0; right: 0; height: 110px; z-index: 15; pointer-events: none; background: linear-gradient(#000 35%, rgba(0,0,0,0)); opacity: 0; transition: opacity .6s; }
  .gl.ixm .hdbg { opacity: 1; }

  /* soft colour glow taken from the photo in focus */
  .glow { position: absolute; inset: 0; z-index: 0; pointer-events: none; }
  .glow img { position: absolute; inset: -15%; width: 130%; height: 130%; object-fit: cover; filter: blur(90px) saturate(1.7); opacity: .45; animation: glowIn 2s ease both; }
  @keyframes glowIn { from { opacity: 0; } }
  .grain { position: fixed; inset: -50%; z-index: 40; pointer-events: none; opacity: .08; background-image: ${GRAIN}; animation: grain .9s steps(5) infinite; }
  @keyframes grain { 0% { transform: translate(0,0); } 20% { transform: translate(-4%,3%); } 40% { transform: translate(3%,-5%); } 60% { transform: translate(-6%,-2%); } 80% { transform: translate(5%,4%); } 100% { transform: translate(0,0); } }
  .vig { position: fixed; inset: 0; z-index: 1; pointer-events: none; background: radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 45%, rgba(0,0,0,.65) 100%); }

  .nm { position: absolute; left: 28px; top: 14px; z-index: 20; margin: 0; font: italic 400 clamp(34px, 3.4vw, 54px)/1 "Instrument Serif", Georgia, serif; letter-spacing: -0.01em; white-space: nowrap; }
  .nm a { opacity: 1 !important; }
  .nm span, .pz h1 span { display: inline-block; animation: rise 1.4s cubic-bezier(.2,.7,.1,1) both; }
  @keyframes rise { from { transform: translateY(60%); opacity: 0; } }

  .wrap { position: absolute; left: 0; top: 0; width: 0; height: 0; perspective: 2000px; z-index: 5; transition: transform 1.05s cubic-bezier(.65,0,.15,1), opacity .7s; }
  .wrap.away { opacity: 0; pointer-events: none; }
  .halo, .floor { position: absolute; pointer-events: none; border-radius: 50%; }
  .halo { background: radial-gradient(circle, rgba(255,255,255,.075) 0%, rgba(255,255,255,.03) 38%, rgba(255,255,255,0) 66%); }
  .floor { background: radial-gradient(ellipse, rgba(255,255,255,.10), rgba(255,255,255,0) 70%); filter: blur(12px); }
  .globe { position: absolute; left: 0; top: 0; transform-style: preserve-3d; }
  .tile { position: absolute; display: flex; align-items: center; justify-content: center; backface-visibility: hidden; -webkit-backface-visibility: hidden;
    transform: var(--t) translateZ(var(--r)); transition: transform .55s cubic-bezier(.2,.7,.1,1), opacity .35s linear; }
  .tile img { max-width: 100%; max-height: 100%; display: block; opacity: .62; filter: saturate(.85); transition: opacity .4s, box-shadow .4s, filter .4s; pointer-events: none; }
  .tile.star img { opacity: 1; filter: none; box-shadow: 0 0 0 1px rgba(255,255,255,.18), 0 8px 30px rgba(0,0,0,.5); }
  .globe.intro .tile { transition: transform 1.9s cubic-bezier(.16,.8,.1,1), opacity 1.2s; transition-delay: var(--d); }
  .globe.pre .tile { transform: var(--t) translateZ(var(--far)) rotate(var(--spin)); opacity: 0 !important; transition: none; }
  .tile:hover { transform: var(--t) translateZ(calc(var(--r) + var(--pop))) scale(1.35); opacity: 1 !important; }
  .tile:hover img { opacity: 1; filter: none; box-shadow: 0 0 40px rgba(255,255,255,.25); }
  .wrap.picked .tile img { opacity: .3; }
  .wrap.picked .tile.star img { opacity: .55; }
  .wrap.picked .tile.on { transform: var(--t) translateZ(calc(var(--r) + var(--pop))) scale(1.5); opacity: 1 !important; }
  .wrap.picked .tile.on img, .wrap.picked .tile:hover img { opacity: 1; }

  .big { position: fixed; display: block; z-index: 10; box-shadow: 0 30px 90px rgba(0,0,0,.6); cursor: none; }
  .cls { position: fixed; z-index: 11; background: none; border: 0; padding: 6px; color: #fff; }

  .cur { position: fixed; left: 0; top: 0; width: 14px; height: 14px; margin: -7px 0 0 -7px; border-radius: 50%; background: #fff; mix-blend-mode: difference; z-index: 50; pointer-events: none;
    display: grid; place-items: center; transition: width .35s, height .35s, margin .35s; }
  .cur.big { width: 64px; height: 64px; margin: -32px 0 0 -32px; }
  .cur.arr { width: 76px; height: 76px; margin: -38px 0 0 -38px; }

  /* globe / wall switch */
  .mode { position: fixed; left: 50%; bottom: 26px; transform: translateX(-50%); z-index: 20; display: flex; gap: 4px; padding: 5px; border-radius: 999px;
    background: rgba(255,255,255,.08); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); box-shadow: inset 0 0 0 1px rgba(255,255,255,.12);
    transition: left 1.05s cubic-bezier(.65,0,.15,1); }
  .gl.open .mode { left: 84%; } /* sits under the small globe while a photo is open */
  .gl .mode button { width: 38px; height: 30px; border-radius: 999px; border: 0; background: none; color: #fff; display: grid; place-items: center; opacity: .5; transition: background .3s, opacity .3s; }
  .gl .mode button.on { background: rgba(255,255,255,.16); opacity: 1; }

  /* the wall */
  .ix { position: absolute; inset: 0; z-index: 6; overflow-y: auto; scrollbar-width: none; touch-action: pan-y; }
  .ix::-webkit-scrollbar { display: none; }
  .ix .row { display: flex; gap: 6px; margin-bottom: 6px; }
  .ix img { display: block; flex: none; background-size: cover; transition: opacity .35s; }
  .ix .rows:hover img { opacity: .5; } .ix .rows img:hover { opacity: 1; }
  .ix .sep { height: 48px; }

  /* mobile */
  .pz { background: #000; color: #fff; min-height: 100svh; font: 13px/1 "Helvetica Neue", Helvetica, Arial, sans-serif; overflow-x: hidden; }
  .pz .top { display: flex; justify-content: space-between; align-items: center; padding: 14px 14px 16px; }
  .pz .top nav { display: flex; gap: 16px; }
  .pz h1 { margin: 0; font: italic 400 32px/1 "Instrument Serif", Georgia, serif; letter-spacing: -0.01em; }
  .pz h1 a { opacity: 1 !important; }
  .rows { display: flex; flex-direction: column; gap: 3px; }
  .rw { display: flex; gap: 3px; }
  .rw img { display: block; height: 100%; width: 100%; object-fit: cover; min-width: 0; opacity: 0; transform: scale(.82) rotate(var(--tilt)); transition: opacity .7s ease, transform .9s cubic-bezier(.2,.8,.2,1.2); transition-delay: var(--d); }
  .rw img.in { opacity: 1; transform: none; }
  .rows { padding-bottom: 40px; }
  .ovw { position: fixed; inset: 0; z-index: 30; background: #000; }
  .ovw .glow img { opacity: .5; }
  .ov { position: absolute; inset: 0; overflow-y: auto; scroll-snap-type: y mandatory; overscroll-behavior: contain; }
  .ov section { position: relative; scroll-snap-align: start; }
  .ov img { position: absolute; display: block; box-shadow: 0 20px 60px rgba(0,0,0,.55); }
  .x { position: fixed; top: 10px; right: 10px; z-index: 31; background: none; border: 0; color: #fff; padding: 10px; }
`;

export default function Page() {
  const [vp, setVp] = useState<{ w: number; h: number } | null>(null);
  useEffect(() => {
    const f = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    f(); window.addEventListener('resize', f); return () => window.removeEventListener('resize', f);
  }, []);
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      {vp && (vp.w < 760 ? <Puzzle vp={vp} /> : <Globe vp={vp} />)}
    </>
  );
}

/** Name with each letter rising in turn. */
function Name() {
  return <>{'Aidan Torrence'.split('').map((c, i) => <span key={i} style={{ animationDelay: `${0.35 + i * 0.045}s` }}>{c === ' ' ? ' ' : c}</span>)}</>;
}

function Links() {
  return <><a href={LINKS.instagram}>Instagram</a><a href={LINKS.email}>Contact</a></>;
}

/** Up to two stacked blurred copies of the photo in focus, the newer fading in over the older. */
function Glow({ i }: { i: number | null }) {
  const [stack, setStack] = useState<number[]>([]);
  useEffect(() => { if (i !== null) setStack((s) => (s[s.length - 1] === i ? s : [...s.slice(-1), i])); }, [i]);
  return (
    <div className="glow">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {stack.map((k) => <img key={k} src={opt(PHOTOS[k], 256)} alt="" />)}
    </div>
  );
}

const Arrow = () => <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#000" strokeWidth="1.5"><path d="M3 11h16M13 5l6 6-6 6" /></svg>;

/* ---------------- desktop: the globe ---------------- */

function Globe({ vp }: { vp: { w: number; h: number } }) {
  const [sel, setSel] = useState<number | null>(null);
  const [hov, setHov] = useState<number | null>(null);
  const [front, setFront] = useState<number | null>(null);
  const [mode, setMode] = useState<'globe' | 'index'>('globe');
  const [phase, setPhase] = useState<'pre' | 'intro' | 'live'>('pre');
  const [overBig, setOverBig] = useState(false);
  const [side, setSide] = useState<1 | -1>(1);
  const globe = useRef<HTMLDivElement>(null);
  const tiles = useRef<(HTMLDivElement | null)[]>([]);
  const big = useRef<HTMLImageElement>(null);
  const cur = useRef<HTMLDivElement>(null);
  const ix = useRef<HTMLDivElement>(null);
  const from = useRef<Box | null>(null);
  const dir = useRef(1);
  const moved = useRef(0);
  const phaseRef = useRef(phase); phaseRef.current = phase;
  const modeRef = useRef(mode); modeRef.current = mode;
  const timer = useRef<ReturnType<typeof setTimeout>>();
  // Where each globe photo was on screen when switching to the wall, so the wall can grow out of the globe.
  const morph = useRef<Map<number, { rect: Box; vis: boolean }> | null>(null);
  // ax/ay: rotation; vx/vy: drag inertia; tx/ty: target bringing the selected photo to the front;
  // spin eases toward want (fast on arrival, slow while hovering); mx/my: mouse lean.
  const rot = useRef({ ax: -14, ay: -140, vx: 0, vy: 0, tx: null as number | null, ty: null as number | null, drag: false, spin: 2.2, want: 0.07, mx: 0, my: 0, px: 0, py: 0 });

  const R = Math.min(vp.w * 0.3, vp.h * 0.38);
  const S = R * GLOBE.otherTileScale, S0 = R * GLOBE.priorityTileScale;

  // Intro: photos fly in from all directions and settle into the globe (highest-priority selections land last).
  const replay = useCallback(() => {
    setPhase('pre');
    requestAnimationFrame(() => requestAnimationFrame(() => setPhase('intro')));
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setPhase('live'), 3300);
  }, []);
  useEffect(() => { replay(); return () => clearTimeout(timer.current); }, [replay]);

  useEffect(() => {
    let raf = 0, lastFront = -1, frontAt = -1e9;
    const shade = new Float32Array(N).fill(-1);
    const c = { x: vp.w / 2, y: vp.h / 2, tx: vp.w / 2, ty: vp.h / 2 };
    const move = (e: PointerEvent) => { c.tx = e.clientX; c.ty = e.clientY; rot.current.mx = e.clientX / vp.w - 0.5; rot.current.my = e.clientY / vp.h - 0.5; };
    window.addEventListener('pointermove', move);
    const tick = (now: number) => {
      const r = rot.current;
      r.spin += (r.want - r.spin) * 0.025;
      if (!r.drag) {
        if (r.tx !== null && r.ty !== null) { r.ax += (r.tx - r.ax) * 0.07; r.ay += (r.ty - r.ay) * 0.07; }
        else { r.ay += r.spin + r.vy; r.ax = Math.max(-70, Math.min(70, r.ax + r.vx)); r.vx *= 0.94; r.vy *= 0.94; }
      }
      // lean toward the mouse (off while a photo is open)
      const lean = r.tx === null && modeRef.current === 'globe' ? 1 : 0;
      r.px += (r.mx * 28 * lean - r.px) * 0.05; r.py += (-r.my * 18 * lean - r.py) * 0.05;
      const AX = r.ax + r.py, AY = r.ay + r.px;
      if (globe.current) globe.current.style.transform = `rotateX(${AX}deg) rotateY(${AY}deg)`;

      // Depth: photos facing you are bright, those turning away fade into the dark.
      // Also track the highest-priority photo nearest the front; the background glow takes its colour.
      const ca = Math.cos((AX * Math.PI) / 180), sa = Math.sin((AX * Math.PI) / 180);
      const cb = Math.cos((AY * Math.PI) / 180), sb = Math.sin((AY * Math.PI) / 180);
      let best = -2, bi = -1;
      for (let i = 0; i < N; i++) {
        const d = DIR[i];
        const z1 = -d.x * sb + d.z * cb;
        const z = d.y * sa + z1 * ca; // 1 = facing you, -1 = facing away
        if (PHOTOS[i].star && z > best) { best = z; bi = i; }
        if (phaseRef.current !== 'live') continue;
        const o = z <= 0 ? 0 : Math.min(1, 0.1 + z * 1.25);
        if (Math.abs(o - shade[i]) > 0.03) { shade[i] = o; const el = tiles.current[i]; if (el) el.style.opacity = o.toFixed(2); }
      }
      if (bi >= 0 && bi !== lastFront && now - frontAt > 1400) { lastFront = bi; frontAt = now; setFront(bi); }

      c.x += (c.tx - c.x) * 0.22; c.y += (c.ty - c.y) * 0.22;
      if (cur.current) cur.current.style.transform = `translate(${c.x}px, ${c.y}px)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('pointermove', move); };
  }, [vp.w, vp.h]);

  const pick = useCallback((i: number, rect: Box | null, d = 1) => {
    const r = rot.current;
    const base = -POS[i].lon;
    r.ty = base + 360 * Math.round((r.ay - base) / 360);
    r.tx = -POS[i].lat;
    r.want = 0; r.spin = 0;
    from.current = rect; dir.current = d;
    setSel(i);
  }, []);

  const close = useCallback(() => {
    const r = rot.current;
    r.tx = r.ty = null; r.want = 0.07; r.vx = (-14 - r.ax) * 0.02; r.vy = 0.6;
    setSel(null); setOverBig(false);
  }, []);

  const go = useCallback((d: number) => { if (sel !== null) pick((sel + d + N) % N, null, d); }, [sel, pick]);

  const toIndex = () => {
    const m = new Map<number, { rect: Box; vis: boolean }>();
    tiles.current.forEach((el, i) => {
      if (!el) return;
      const r = (el.firstChild as HTMLElement).getBoundingClientRect();
      m.set(i, { rect: { left: r.left, top: r.top, width: r.width, height: r.height }, vis: parseFloat(el.style.opacity || '1') > 0.08 });
    });
    morph.current = m;
    if (sel !== null) close();
    setHov(null); setMode('index');
  };
  const toGlobe = () => {
    setHov(null); setMode('globe');
    rot.current.spin = 2.2; rot.current.want = 0.07;
    replay();
  };

  useEffect(() => {
    let last = 0;
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (sel === null) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') go(1);
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') go(-1);
    };
    const wheel = (e: WheelEvent) => {
      if (modeRef.current === 'index') return; // the wall scrolls normally
      if (sel === null) { rot.current.vy += e.deltaY * 0.002; return; }
      const now = Date.now(); if (now - last < 450 || Math.abs(e.deltaY) < 8) return; last = now;
      go(e.deltaY > 0 ? 1 : -1);
    };
    window.addEventListener('keydown', key); window.addEventListener('wheel', wheel, { passive: true });
    return () => { window.removeEventListener('keydown', key); window.removeEventListener('wheel', wheel); };
  }, [sel, go, close]);

  const down = (e: React.PointerEvent) => {
    if (modeRef.current === 'index') return;
    const r = rot.current; let x = e.clientX, y = e.clientY;
    moved.current = 0;
    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - x, dy = ev.clientY - y; x = ev.clientX; y = ev.clientY;
      moved.current += Math.abs(dx) + Math.abs(dy);
      if (moved.current < 5) return;
      r.drag = true; r.tx = r.ty = null; r.want = 0.07;
      r.ay += dx * 0.25; r.ax = Math.max(-70, Math.min(70, r.ax - dy * 0.25));
      r.vy = dx * 0.25; r.vx = -dy * 0.25;
    };
    const up = () => { r.drag = false; window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
  };

  useLayoutEffect(() => {
    if (sel !== null && big.current) { flip(big.current, from.current, dir.current); from.current = null; }
  }, [sel]);

  // Preload the next and previous photos so moving through them is instant.
  useEffect(() => {
    if (sel === null) return;
    [1, -1].forEach((d) => {
      const q = PHOTOS[(sel + d + N) % N], im = new Image();
      im.sizes = `${Math.round(fit(q, vp.w * 0.04, 90, vp.w * 0.68, vp.h - 40).width)}px`;
      im.srcset = optSet(q, 640);
    });
  }, [sel, vp.w, vp.h]);

  // The wall: highest-priority selections in big rows, then the remaining tiers in their saved order.
  const pad = Math.max(24, vp.w * 0.03);
  const wall = useMemo(() => {
    const W = vp.w - pad * 2;
    return [pack(PHOTOS.filter((p) => p.star), W, Math.min(360, vp.h * 0.42), 6), pack(PHOTOS.filter((p) => !p.star), W, 190, 6)];
  }, [vp.w, vp.h, pad]);

  // Switching to the wall: every photo flies from its spot on the globe into its place on the wall.
  useLayoutEffect(() => {
    if (mode !== 'index' || !ix.current) return;
    ix.current.scrollTop = 0;
    const m = morph.current; morph.current = null;
    ix.current.querySelectorAll<HTMLImageElement>('img[data-i]').forEach((img) => {
      const t = img.getBoundingClientRect();
      if (t.top > vp.h) return;
      const i = Number(img.dataset.i), s = m?.get(i);
      const src = s && s.vis ? s.rect : { left: vp.w / 2 - 20, top: vp.h / 2 - 20, width: 40, height: 40 };
      img.animate([
        { transformOrigin: 'top left', transform: `translate(${src.left - t.left}px, ${src.top - t.top}px) scale(${src.width / t.width}, ${src.height / t.height})`, opacity: s?.vis ? 1 : 0 },
        { transformOrigin: 'top left', transform: 'none', opacity: 1 },
      ], { duration: 950, delay: s?.vis ? 0 : 150 + rnd(i, 4) * 350, easing: EASE, fill: 'backwards' });
    });
  }, [mode, vp.w, vp.h]);

  const open = sel !== null;
  const wrapT = mode === 'index' ? `translate(${vp.w / 2}px, ${vp.h / 2}px) scale(0.55)`
    : open ? `translate(${vp.w * 0.84}px, ${vp.h / 2}px) scale(0.4)` : `translate(${vp.w / 2}px, ${vp.h * 0.53}px) scale(1)`;
  const box = open ? fit(PHOTOS[sel], vp.w * 0.04, 90, vp.w * 0.68, vp.h - 40) : null;
  const hot = hov !== null || open;

  return (
    <div className={`gl${open ? ' open' : ''}${mode === 'index' ? ' ixm' : ''}`} onPointerDown={down}
      onClick={(e) => { if (open && e.target === e.currentTarget && moved.current < 5) close(); }}>
      <Glow i={sel ?? hov ?? front} />
      <div className="vig" />
      <div className="hdbg" />
      <h1 className="nm"><a href="/"><Name /></a></h1>
      <nav className="hd"><Links /></nav>

      <div className={`wrap${open ? ' picked' : ''}${mode === 'index' ? ' away' : ''}`} style={{ transform: wrapT }}
        onPointerEnter={() => { if (!open) rot.current.want = 0.012; }}
        onPointerLeave={() => { if (!open) rot.current.want = 0.07; setHov(null); }}>
        <div className="halo" style={{ width: R * 3, height: R * 3, left: -R * 1.5, top: -R * 1.5 }} />
        <div className="floor" style={{ width: R * 2.3, height: R * 0.32, left: -R * 1.15, top: R * 1.12 }} />
        <div className={`globe ${phase === 'live' ? '' : phase}`} ref={globe}>
          {PHOTOS.map((p, i) => {
            const s = p.star ? S0 : S;
            return (
              <div key={p.src} ref={(el) => { tiles.current[i] = el; }} className={`tile${p.star ? ' star' : ''}${i === sel ? ' on' : ''}`}
                style={{
                  width: s, height: s, left: -s / 2, top: -s / 2,
                  ['--t' as string]: `rotateY(${POS[i].lon}deg) rotateX(${POS[i].lat}deg)`,
                  ['--r' as string]: `${p.star ? R * 1.04 : R}px`, ['--pop' as string]: `${S * 0.45}px`,
                  ['--far' as string]: `${R * (2.5 + rnd(i) * 3)}px`, ['--spin' as string]: `${(rnd(i, 2) - 0.5) * 120}deg`,
                  // Highest-priority selections land last, in front of an already-formed globe.
                  ['--d' as string]: `${p.star ? 0.9 + rnd(i, 3) * 0.6 : rnd(i, 3) * 0.9}s`,
                }}
                onPointerEnter={() => setHov(i)}
                onClick={(e) => { if (moved.current >= 5) return; const r = (e.currentTarget.firstChild as HTMLElement).getBoundingClientRect(); pick(i, r); }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={opt(p, p.star ? 384 : 256)} alt="" decoding="async" draggable={false} />
              </div>
            );
          })}
        </div>
      </div>

      {open && box && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img key={sel} ref={big} className="big" src={opt(PHOTOS[sel], 'full')} srcSet={optSet(PHOTOS[sel], 640)} sizes={`${Math.round(box.width)}px`}
            alt="Photograph by Aidan Torrence" draggable={false}
            // the small copy already loaded on the globe shows instantly while the sharp one arrives
            style={{ ...box, backgroundImage: `url(${opt(PHOTOS[sel], PHOTOS[sel].star ? 384 : 256)})`, backgroundSize: 'cover' }}
            onPointerEnter={() => setOverBig(true)} onPointerLeave={() => setOverBig(false)}
            onPointerMove={(e) => { const s = e.clientX < box.left + box.width / 2 ? -1 : 1; if (s !== side) setSide(s); }}
            onClick={() => { if (moved.current < 5) go(side); }} />
          <button className="cls" style={{ left: box.left + box.width + 12, top: box.top - 4 }} onClick={close} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 18 18" stroke="currentColor" strokeWidth="1.3"><path d="M2 2l14 14M16 2 2 16" /></svg>
          </button>
        </>
      )}

      {mode === 'index' && (
        <div className="ix" ref={ix}>
          <div className="rows" style={{ padding: `104px ${pad}px 120px` }}>
            {wall.map((rows, t) => (
              <React.Fragment key={t}>
                {t === 1 && <div className="sep" />}
                {rows.map((r, k) => (
                  <div className="row" key={k} style={{ height: r.h }}>
                    {r.items.map((p) => {
                      const w = (p.w / p.h) * r.h;
                      return (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={p.src} data-i={p.i} src={opt(p, w > 400 ? 640 : 384)} srcSet={optSet(p)} sizes={`${Math.round(w)}px`} alt="" draggable={false}
                          loading={t === 0 && k < 3 ? 'eager' : 'lazy'} decoding="async"
                          style={{ width: w, height: r.h, backgroundImage: `url(${opt(p, p.star ? 384 : 256)})` }}
                          onPointerEnter={() => setHov(p.i)} onPointerLeave={() => setHov(null)}
                          onClick={(e) => { const b = e.currentTarget.getBoundingClientRect(); setMode('globe'); pick(p.i, b); }} />
                      );
                    })}
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      <div className="mode" onPointerDown={(e) => e.stopPropagation()}>
        <button className={mode === 'globe' ? 'on' : ''} onClick={() => mode !== 'globe' && toGlobe()} aria-label="Globe">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2"><circle cx="8" cy="8" r="6.5" /><ellipse cx="8" cy="8" rx="2.8" ry="6.5" /><path d="M1.5 8h13" /></svg>
        </button>
        <button className={mode === 'index' ? 'on' : ''} onClick={() => mode !== 'index' && toIndex()} aria-label="All photos">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="1.5" y="1.5" width="5.5" height="7" /><rect x="9" y="1.5" width="5.5" height="4.5" /><rect x="1.5" y="10.5" width="5.5" height="4" /><rect x="9" y="8" width="5.5" height="6.5" /></svg>
        </button>
      </div>

      <div ref={cur} className={`cur${overBig ? ' arr' : hot ? ' big' : ''}`}>
        {overBig && <span style={{ display: 'grid', transform: side < 0 ? 'scaleX(-1)' : 'none' }}><Arrow /></span>}
      </div>
      <div className="grain" />
    </div>
  );
}

/* ---------------- mobile: selected photos first ---------------- */

// Keep the original mobile tier0 collection after the tier-2 and tier-1 selections. These form
// a contiguous prefix of PHOTOS, so the viewer and glow keep the same photo indices.
const MOBILE_PHOTOS = PHOTOS.filter((p) => p.tier !== 'tier1');
const ROW_H = [210, 150, 250, 170, 230, 140];

function Puzzle({ vp }: { vp: { w: number; h: number } }) {
  const [sel, setSel] = useState<number | null>(null);
  const [at, setAt] = useState<number | null>(null);
  const ov = useRef<HTMLDivElement>(null);
  const from = useRef<Box | null>(null);
  const tiles = useRef<(HTMLImageElement | null)[]>([]);
  const ph = useRef(''); // the tapped image (already loaded), shown until the sharp one arrives

  // Rows of varied heights, each filled edge to edge, so the photos lock together like puzzle pieces.
  const gap = 3;
  const rows: { h: number; items: Photo[]; full: boolean }[] = [];
  let cur: Photo[] = [], ar = 0;
  MOBILE_PHOTOS.forEach((p) => {
    cur.push(p); ar += p.w / p.h;
    if (ar * ROW_H[rows.length % ROW_H.length] + gap * (cur.length - 1) >= vp.w) {
      rows.push({ h: Math.min((vp.w - gap * (cur.length - 1)) / ar, vp.h * 0.7), items: cur, full: true }); cur = []; ar = 0;
    }
  });
  // leftover photos join the last row, so the puzzle ends flush instead of with a gap
  if (cur.length) {
    const last = rows.pop(), items = [...(last?.items ?? []), ...cur], tot = items.reduce((s, p) => s + p.w / p.h, 0);
    rows.push({ h: (vp.w - gap * (items.length - 1)) / tot, items, full: true });
  }

  // Pieces drop into place as they scroll into view.
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    tiles.current.forEach((t) => t && io.observe(t));
    return () => io.disconnect();
  }, [vp.w]);

  useLayoutEffect(() => {
    const el = ov.current;
    if (sel === null || !el) return;
    el.scrollTop = sel * vp.h;
    setAt(sel);
    const img = el.querySelectorAll('section img')[sel] as HTMLImageElement | undefined;
    if (img) flip(img, from.current);
    el.parentElement?.animate([{ backgroundColor: 'rgba(0,0,0,0)' }, { backgroundColor: 'rgba(0,0,0,1)' }], { duration: 450 });
    from.current = null;
    const o = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = o; };
  }, [sel, vp.h]);

  const openAt = (i: number, el: HTMLImageElement) => { from.current = el.getBoundingClientRect(); ph.current = el.currentSrc; setSel(i); };
  const close = () => {
    const i = at ?? sel;
    setSel(null); setAt(null);
    if (i !== null) requestAnimationFrame(() => tiles.current[i]?.scrollIntoView({ block: 'center' }));
  };

  return (
    <div className="pz">
      <header className="top"><h1><a href="/"><Name /></a></h1><nav><Links /></nav></header>
      <div className="rows">
        {rows.map((r, k) => (
          <div className="rw" key={k} style={{ height: r.h }}>
            {r.items.map((p, j) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={p.src} ref={(el) => { tiles.current[p.i] = el; }} src={opt(p, 384)} srcSet={optSet(p)} sizes={`${Math.round(Math.min(vp.w, (p.w / p.h) * r.h))}px`} alt="" decoding="async"
                loading={p.i < 8 ? 'eager' : 'lazy'}
                style={{ flex: r.full ? `${p.w / p.h} 1 0` : `0 0 ${(p.w / p.h) * r.h}px`, ['--tilt' as string]: `${(rnd(p.i) - 0.5) * 14}deg`, ['--d' as string]: `${j * 0.07}s` }}
                onClick={(e) => openAt(p.i, e.currentTarget)} />
            ))}
          </div>
        ))}
      </div>
      {sel !== null && (
        <div className="ovw">
          <Glow i={at} />
          <div className="ov" ref={ov} onScroll={(e) => { const i = Math.round(e.currentTarget.scrollTop / vp.h); if (i !== at) setAt(i); }}>
            {MOBILE_PHOTOS.map((p) => {
              const b = fit(p, 14, 14, vp.w - 14, vp.h - 14);
              return (
                <section key={p.src} style={{ height: vp.h }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={opt(p, 'full')} srcSet={optSet(p, 640)} sizes={`${Math.round(b.width)}px`} alt="" loading={Math.abs(p.i - sel) < 3 ? 'eager' : 'lazy'}
                    style={p.i === sel && ph.current ? { ...b, backgroundImage: `url(${ph.current})`, backgroundSize: 'cover' } : b} />
                </section>
              );
            })}
          </div>
          <button className="x" onClick={close} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 18 18" stroke="currentColor" strokeWidth="1.3"><path d="M2 2l14 14M16 2 2 16" /></svg>
          </button>
        </div>
      )}
    </div>
  );
}
