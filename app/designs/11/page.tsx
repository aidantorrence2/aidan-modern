'use client';

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { PHOTOS, opt, optSet, RESET, LINKS } from '../shared';

const N = PHOTOS.length;
const N0 = PHOTOS.filter((p) => p.star).length;
const N1 = N - N0;
const EASE = 'cubic-bezier(.2,.7,.1,1)';

// Tier 0 photos run in two staggered bands around the equator, the part of the globe that faces you.
// Tier 1 photos are spread evenly (Fibonacci spiral) over the rest, above and below the bands.
const GOLDEN = 180 * (3 - Math.sqrt(5));
const BAND_LAT = 11, CAP = Math.sin((24 * Math.PI) / 180);
const PER_BAND = Math.ceil(N0 / 2);
const POS = PHOTOS.map((p, i) => {
  if (p.star) {
    const row = i % 2, k = Math.floor(i / 2);
    return { lon: (k * 360) / PER_BAND + row * (180 / PER_BAND), lat: row ? -BAND_LAT : BAND_LAT };
  }
  const k = i - N0, z = 1 - (2 * (k + 0.5)) / N1;
  return { lon: (k * GOLDEN) % 360, lat: (Math.asin(Math.sign(z) * (CAP + (1 - CAP) * Math.abs(z))) * 180) / Math.PI };
});
// Stable pseudo-random per photo (for intro scatter and puzzle tilt).
const rnd = (i: number, s = 1) => { const x = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453; return x - Math.floor(x); };

type Box = { left: number; top: number; width: number; height: number };

/** Largest rect with the photo's aspect ratio inside the area, centred. */
function fit(p: (typeof PHOTOS)[number], x0: number, y0: number, x1: number, y1: number): Box {
  const aw = x1 - x0, ah = y1 - y0, r = p.w / p.h;
  const width = Math.min(aw, ah * r), height = width / r;
  return { left: x0 + (aw - width) / 2, top: y0 + (ah - height) / 2, width, height };
}

/** Animate an element from a source rect to where it sits; without a source, slide in from `dir`. */
function flip(el: HTMLElement, from: DOMRect | null, dir = 1) {
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

const GRAIN = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`;

const CSS = `@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap');
` + RESET + `
  html, body { background: #000 !important; }
  .gl { position: fixed; inset: 0; background: #000; color: #fff; overflow: hidden; font: 13px/1 "Helvetica Neue", Helvetica, Arial, sans-serif; user-select: none; -webkit-user-select: none; touch-action: none; cursor: none; }
  .gl a, .pz a { color: inherit; text-decoration: none; opacity: .75; transition: opacity .3s; } .gl a:hover, .pz a:hover { opacity: 1; }
  .hd { position: fixed; top: 0; right: 0; display: flex; gap: 24px; padding: 24px 30px; z-index: 20; }

  /* soft colour glow taken from the photo you're on */
  .glow { position: absolute; inset: 0; z-index: 0; pointer-events: none; }
  .glow img { position: absolute; inset: -15%; width: 130%; height: 130%; object-fit: cover; filter: blur(90px) saturate(1.7); opacity: .42; animation: glowIn 1.1s ease both; }
  @keyframes glowIn { from { opacity: 0; } }
  .grain { position: fixed; inset: -50%; z-index: 40; pointer-events: none; opacity: .09; background-image: ${GRAIN}; animation: grain .9s steps(5) infinite; }
  @keyframes grain { 0% { transform: translate(0,0); } 20% { transform: translate(-4%,3%); } 40% { transform: translate(3%,-5%); } 60% { transform: translate(-6%,-2%); } 80% { transform: translate(5%,4%); } 100% { transform: translate(0,0); } }

  .nm { position: absolute; left: 28px; top: 14px; z-index: 20; margin: 0; font: italic 400 clamp(34px, 3.4vw, 54px)/1 "Instrument Serif", Georgia, serif; letter-spacing: -0.01em; white-space: nowrap; }
  .nm a { opacity: 1 !important; }
  .nm span { display: inline-block; animation: rise 1.4s cubic-bezier(.2,.7,.1,1) both; }
  @keyframes rise { from { transform: translateY(60%); opacity: 0; } }

  .wrap { position: absolute; left: 0; top: 0; width: 0; height: 0; perspective: 2000px; transition: transform 1.05s cubic-bezier(.65,0,.15,1); z-index: 5; }
  .globe { position: absolute; left: 0; top: 0; transform-style: preserve-3d; }
  .tile { position: absolute; display: flex; align-items: center; justify-content: center; backface-visibility: hidden; -webkit-backface-visibility: hidden;
    transform: var(--t) translateZ(var(--r)); transition: transform .55s cubic-bezier(.2,.7,.1,1), opacity .5s; }
  .tile img { max-width: 100%; max-height: 100%; display: block; opacity: .58; filter: saturate(.85); transition: opacity .4s, box-shadow .4s, filter .4s; pointer-events: none; }
  .tile.star img { opacity: 1; filter: none; box-shadow: 0 0 0 1px rgba(255,255,255,.18), 0 8px 30px rgba(0,0,0,.5); }
  .globe.intro .tile { transition: transform 1.9s cubic-bezier(.16,.8,.1,1), opacity 1.2s; transition-delay: var(--d); }
  .globe.pre .tile { transform: var(--t) translateZ(var(--far)) rotate(var(--spin)); opacity: 0; }
  .tile:hover { transform: var(--t) translateZ(calc(var(--r) + var(--pop))) scale(1.35); }
  .tile:hover img { opacity: 1; filter: none; box-shadow: 0 0 40px rgba(255,255,255,.25); }
  .wrap.picked .tile img { opacity: .3; }
  .wrap.picked .tile.star img { opacity: .55; }
  .wrap.picked .tile.on { transform: var(--t) translateZ(calc(var(--r) + var(--pop))) scale(1.5); }
  .wrap.picked .tile.on img, .wrap.picked .tile:hover img { opacity: 1; }

  .big { position: fixed; display: block; z-index: 10; box-shadow: 0 30px 90px rgba(0,0,0,.6); }

  .cur { position: fixed; left: 0; top: 0; width: 14px; height: 14px; margin: -7px 0 0 -7px; border-radius: 50%; background: #fff; mix-blend-mode: difference; z-index: 50; pointer-events: none; transition: width .35s, height .35s, margin .35s; }
  .cur.big { width: 64px; height: 64px; margin: -32px 0 0 -32px; }

  /* mobile */
  .pz { background: #000; color: #fff; min-height: 100svh; font: 13px/1 "Helvetica Neue", Helvetica, Arial, sans-serif; overflow-x: hidden; }
  .pz .top { display: flex; justify-content: space-between; align-items: center; padding: 14px 14px 16px; }
  .pz .top nav { display: flex; gap: 16px; }
  .pz h1 { margin: 0; font: italic 400 32px/1 "Instrument Serif", Georgia, serif; letter-spacing: -0.01em; }
  .pz h1 a { opacity: 1 !important; }
  .pz h1 span { display: inline-block; animation: rise 1.3s cubic-bezier(.2,.7,.1,1) both; }
  .rows { display: flex; flex-direction: column; gap: 3px; }
  .rw { display: flex; gap: 3px; }
  .rw img { display: block; height: 100%; width: 100%; object-fit: cover; min-width: 0; opacity: 0; transform: scale(.82) rotate(var(--tilt)); transition: opacity .7s ease, transform .9s cubic-bezier(.2,.8,.2,1.2); transition-delay: var(--d); }
  .rw img.in { opacity: 1; transform: none; }
  .rw.st { gap: 6px; } .rows .rw.st + .rw.st { margin-top: 3px; }
  .rw.last { margin-bottom: 26px; }
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

/** Up to two stacked blurred copies of the current photo, the newer fading in over the older. */
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

/* ---------------- desktop: the globe ---------------- */

function Globe({ vp }: { vp: { w: number; h: number } }) {
  const [sel, setSel] = useState<number | null>(null);
  const [hov, setHov] = useState<number | null>(null);
  const [phase, setPhase] = useState<'pre' | 'intro' | 'live'>('pre');
  const globe = useRef<HTMLDivElement>(null);
  const big = useRef<HTMLImageElement>(null);
  const cur = useRef<HTMLDivElement>(null);
  const from = useRef<DOMRect | null>(null);
  const dir = useRef(1);
  const moved = useRef(0);
  // ax/ay: rotation; vx/vy: drag inertia; tx/ty: target bringing the selected photo to the front;
  // spin eases toward want (fast on arrival, slow while hovering); mx/my: mouse lean.
  const rot = useRef({ ax: -14, ay: -140, vx: 0, vy: 0, tx: null as number | null, ty: null as number | null, drag: false, spin: 2.2, want: 0.07, mx: 0, my: 0, px: 0, py: 0 });

  const R = Math.min(vp.w * 0.3, vp.h * 0.38);
  const S = R * 0.25, S0 = R * 0.34; // tier 1 / tier 0 tile size

  // Intro: photos fly in from all directions and settle into the globe.
  useEffect(() => {
    const a = requestAnimationFrame(() => requestAnimationFrame(() => setPhase('intro')));
    const b = setTimeout(() => setPhase('live'), 3600);
    return () => { cancelAnimationFrame(a); clearTimeout(b); };
  }, []);

  useEffect(() => {
    let raf = 0;
    const c = { x: vp.w / 2, y: vp.h / 2, tx: vp.w / 2, ty: vp.h / 2 };
    const move = (e: PointerEvent) => { c.tx = e.clientX; c.ty = e.clientY; rot.current.mx = e.clientX / vp.w - 0.5; rot.current.my = e.clientY / vp.h - 0.5; };
    window.addEventListener('pointermove', move);
    const tick = () => {
      const r = rot.current;
      r.spin += (r.want - r.spin) * 0.025;
      if (!r.drag) {
        if (r.tx !== null && r.ty !== null) { r.ax += (r.tx - r.ax) * 0.07; r.ay += (r.ty - r.ay) * 0.07; }
        else { r.ay += r.spin + r.vy; r.ax = Math.max(-70, Math.min(70, r.ax + r.vx)); r.vx *= 0.94; r.vy *= 0.94; }
      }
      // lean toward the mouse (off while a photo is open)
      const lean = r.tx === null ? 1 : 0;
      r.px += (r.mx * 28 * lean - r.px) * 0.05; r.py += (-r.my * 18 * lean - r.py) * 0.05;
      if (globe.current) globe.current.style.transform = `rotateX(${r.ax + r.py}deg) rotateY(${r.ay + r.px}deg)`;
      c.x += (c.tx - c.x) * 0.22; c.y += (c.ty - c.y) * 0.22;
      if (cur.current) cur.current.style.transform = `translate(${c.x}px, ${c.y}px)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('pointermove', move); };
  }, [vp.w, vp.h]);

  const pick = useCallback((i: number, rect: DOMRect | null, d = 1) => {
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
    setSel(null);
  }, []);

  useEffect(() => {
    let last = 0;
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (sel === null) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') pick((sel + 1) % N, null, 1);
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') pick((sel - 1 + N) % N, null, -1);
    };
    const wheel = (e: WheelEvent) => {
      if (sel === null) { rot.current.vy += e.deltaY * 0.002; return; }
      const now = Date.now(); if (now - last < 450 || Math.abs(e.deltaY) < 8) return; last = now;
      const d = e.deltaY > 0 ? 1 : -1;
      pick((sel + d + N) % N, null, d);
    };
    window.addEventListener('keydown', key); window.addEventListener('wheel', wheel, { passive: true });
    return () => { window.removeEventListener('keydown', key); window.removeEventListener('wheel', wheel); };
  }, [sel, pick, close]);

  const down = (e: React.PointerEvent) => {
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

  const open = sel !== null;
  const wrapT = open ? `translate(${vp.w * 0.84}px, ${vp.h / 2}px) scale(0.4)` : `translate(${vp.w / 2}px, ${vp.h * 0.53}px) scale(1)`;
  const box = open ? fit(PHOTOS[sel], vp.w * 0.04, 90, vp.w * 0.68, vp.h - 40) : null;
  const hot = hov !== null || open;

  return (
    <div className={`gl${open ? ' open' : ''}`} onPointerDown={down}
      onClick={(e) => { if (open && e.target === e.currentTarget && moved.current < 5) close(); }}>
      <Glow i={sel ?? hov} />
      <h1 className="nm"><a href="/"><Name /></a></h1>
      <nav className="hd"><Links /></nav>
      <div className={`wrap${open ? ' picked' : ''}`} style={{ transform: wrapT }}
        onPointerEnter={() => { if (!open) rot.current.want = 0.012; }}
        onPointerLeave={() => { if (!open) rot.current.want = 0.07; setHov(null); }}>
        <div className={`globe ${phase === 'live' ? '' : phase}`} ref={globe}>
          {PHOTOS.map((p, i) => (
            <div key={p.src} className={`tile${p.star ? ' star' : ''}${i === sel ? ' on' : ''}`}
              style={{
                width: p.star ? S0 : S, height: p.star ? S0 : S, left: -(p.star ? S0 : S) / 2, top: -(p.star ? S0 : S) / 2,
                ['--t' as string]: `rotateY(${POS[i].lon}deg) rotateX(${POS[i].lat}deg)`,
                ['--r' as string]: `${p.star ? R * 1.04 : R}px`, ['--pop' as string]: `${S * 0.45}px`,
                ['--far' as string]: `${R * (2.5 + rnd(i) * 3)}px`, ['--spin' as string]: `${(rnd(i, 2) - 0.5) * 120}deg`,
                // tier 0 lands last, so the band assembles in front of an already-formed globe
                ['--d' as string]: `${p.star ? 0.9 + rnd(i, 3) * 0.6 : rnd(i, 3) * 0.9}s`,
              }}
              onPointerEnter={() => setHov(i)}
              onClick={(e) => { if (moved.current >= 5) return; pick(i, (e.currentTarget.firstChild as HTMLElement).getBoundingClientRect()); }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={opt(p, p.star ? 384 : 256)} alt="" decoding="async" draggable={false} />
            </div>
          ))}
        </div>
      </div>
      {open && box && (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={sel} ref={big} className="big" src={opt(PHOTOS[sel], 'full')} srcSet={optSet(PHOTOS[sel], 640)} sizes={`${Math.round(box.width)}px`}
          alt="Photograph by Aidan Torrence" draggable={false}
          // the small copy already loaded on the globe shows instantly while the sharp one arrives
          style={{ ...box, backgroundImage: `url(${opt(PHOTOS[sel], 256)})`, backgroundSize: 'cover' }} onClick={() => { if (moved.current < 5) pick((sel + 1) % N, null, 1); }} />
      )}
      <div ref={cur} className={`cur${hot ? ' big' : ''}`} />
      <div className="grain" />
    </div>
  );
}

/* ---------------- mobile: the puzzle ---------------- */

const ROW_H = [118, 92, 152, 104, 136, 86, 164];
const STAR_H = [300, 230, 340, 250];

function Puzzle({ vp }: { vp: { w: number; h: number } }) {
  const [sel, setSel] = useState<number | null>(null);
  const [at, setAt] = useState<number | null>(null);
  const ov = useRef<HTMLDivElement>(null);
  const from = useRef<DOMRect | null>(null);
  const tiles = useRef<(HTMLImageElement | null)[]>([]);
  const ph = useRef(''); // the tapped tile's already-loaded image, shown until the sharp one arrives

  // Rows of varied heights, each filled edge to edge, so the photos lock together like puzzle pieces.
  // Tier 0 fills the top with big rows (one or two photos each); tier 1 follows as a denser puzzle.
  const gap = 3;
  const rows: { h: number; items: typeof PHOTOS; full: boolean; star: boolean }[] = [];
  const pack = (list: typeof PHOTOS, heights: number[], star: boolean) => {
    let cur: typeof PHOTOS = [], ar = 0, k = 0;
    list.forEach((p) => {
      cur.push(p); ar += p.w / p.h;
      const target = heights[k % heights.length];
      if (ar * target + gap * (cur.length - 1) >= vp.w || (star && p.landscape)) {
        rows.push({ h: Math.min((vp.w - gap * (cur.length - 1)) / ar, vp.h * 0.75), items: cur, full: true, star }); cur = []; ar = 0; k++;
      }
    });
    // leftover photos: fill the row only if that doesn't make it taller than planned (otherwise they'd be cropped)
    if (cur.length) { const fillH = (vp.w - gap * (cur.length - 1)) / ar, t = heights[k % heights.length]; rows.push({ h: Math.min(fillH, t), items: cur, full: fillH <= t, star }); }
  };
  pack(PHOTOS.filter((p) => p.star), STAR_H, true);
  pack(PHOTOS.filter((p) => !p.star), ROW_H, false);

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
          <div className={`rw${r.star ? ' st' : ''}${r.star && !rows[k + 1]?.star ? ' last' : ''}`} key={k} style={{ height: r.h }}>
            {r.items.map((p, j) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={p.src} ref={(el) => { tiles.current[p.i] = el; }} src={opt(p, 384)} srcSet={optSet(p)} sizes={`${Math.round(Math.min(vp.w, (p.w / p.h) * r.h))}px`} alt="" decoding="async"
                loading={p.i < 8 ? 'eager' : 'lazy'}
                style={{ flex: r.full ? `${p.w / p.h} 1 0` : `0 0 ${(p.w / p.h) * r.h}px`, ['--tilt' as string]: `${(rnd(p.i) - 0.5) * 14}deg`, ['--d' as string]: `${j * 0.07}s` }}
                onClick={(e) => { from.current = e.currentTarget.getBoundingClientRect(); ph.current = e.currentTarget.currentSrc; setSel(p.i); }} />
            ))}
          </div>
        ))}
      </div>
      {sel !== null && (
        <div className="ovw">
          <Glow i={at} />
          <div className="ov" ref={ov} onScroll={(e) => { const i = Math.round(e.currentTarget.scrollTop / vp.h); if (i !== at) setAt(i); }}>
            {PHOTOS.map((p) => {
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
