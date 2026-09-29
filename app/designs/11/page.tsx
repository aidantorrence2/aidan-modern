'use client';

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { PHOTOS, thumb, RESET, LINKS } from '../shared';

const N = PHOTOS.length;
const EASE = 'cubic-bezier(.2,.7,.1,1)';

// Fibonacci sphere: every photo gets an evenly spread longitude/latitude on the globe.
const GOLDEN = 180 * (3 - Math.sqrt(5));
const POS = PHOTOS.map((_, i) => ({ lon: (i * GOLDEN) % 360, lat: (Math.asin(1 - (2 * (i + 0.5)) / N) * 180) / Math.PI }));

type Box = { left: number; top: number; width: number; height: number };

/** Largest rect with the photo's aspect ratio inside the area, centred. */
function fit(p: (typeof PHOTOS)[number], x0: number, y0: number, x1: number, y1: number): Box {
  const aw = x1 - x0, ah = y1 - y0, r = p.w / p.h;
  const width = Math.min(aw, ah * r), height = width / r;
  return { left: x0 + (aw - width) / 2, top: y0 + (ah - height) / 2, width, height };
}

/** Animate an element from a source rect to where it currently sits. */
function flip(el: HTMLElement, from: DOMRect | null) {
  if (!from) { el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 350, easing: 'ease-out' }); return; }
  const t = el.getBoundingClientRect();
  el.animate([
    { transformOrigin: 'top left', transform: `translate(${from.left - t.left}px, ${from.top - t.top}px) scale(${from.width / t.width}, ${from.height / t.height})` },
    { transformOrigin: 'top left', transform: 'none' },
  ], { duration: 750, easing: EASE });
}

const CSS = RESET + `
  html, body { background: #000 !important; }
  .gl { position: fixed; inset: 0; background: #000; color: #fff; overflow: hidden; font: 13px/1 "Helvetica Neue", Helvetica, Arial, sans-serif; user-select: none; -webkit-user-select: none; touch-action: none; }
  .gl a, .pz a { color: inherit; text-decoration: none; opacity: .8; } .gl a:hover, .pz a:hover { opacity: 1; }
  .hd { position: fixed; top: 0; left: 0; right: 0; display: flex; justify-content: space-between; padding: 22px 28px; z-index: 20; color: #fff; font: 13px/1 "Helvetica Neue", Helvetica, Arial, sans-serif; }
  .hd div { display: flex; gap: 22px; }

  .wrap { position: absolute; left: 0; top: 0; width: 0; height: 0; perspective: 2000px; transition: transform 1s cubic-bezier(.65,0,.15,1); z-index: 5; }
  .globe { position: absolute; left: 0; top: 0; transform-style: preserve-3d; }
  .tile { position: absolute; display: flex; align-items: center; justify-content: center; backface-visibility: hidden; -webkit-backface-visibility: hidden; cursor: pointer; }
  .tile img { max-width: 100%; max-height: 100%; display: block; opacity: .88; transition: opacity .4s; pointer-events: none; }
  .tile:hover img { opacity: 1; }
  .wrap.picked .tile img { opacity: .4; }
  .wrap.picked .tile.on img, .wrap.picked .tile:hover img { opacity: 1; }

  .big { position: fixed; display: block; cursor: pointer; z-index: 10; }

  .pz { background: #000; min-height: 100svh; }
  .pz .hd { position: static; padding: 16px; }
  .rows { display: flex; flex-direction: column; gap: 2px; }
  .rw { display: flex; gap: 2px; }
  .rw img { display: block; height: 100%; width: 100%; object-fit: cover; min-width: 0; }
  .ov { position: fixed; inset: 0; z-index: 30; background: #000; overflow-y: auto; scroll-snap-type: y mandatory; overscroll-behavior: contain; }
  .ov section { position: relative; scroll-snap-align: start; }
  .ov img { position: absolute; display: block; }
  .x { position: fixed; top: 10px; right: 10px; z-index: 31; background: none; border: 0; color: #fff; padding: 10px; opacity: .8; }
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

function Header() {
  return <header className="hd"><a href="/designs/11">Aidan Torrence</a><div><a href={LINKS.instagram}>Instagram</a><a href={LINKS.email}>Contact</a></div></header>;
}

/* ---------------- desktop: the globe ---------------- */

function Globe({ vp }: { vp: { w: number; h: number } }) {
  const [sel, setSel] = useState<number | null>(null);
  const globe = useRef<HTMLDivElement>(null);
  const big = useRef<HTMLImageElement>(null);
  const from = useRef<DOMRect | null>(null);
  const moved = useRef(0);
  // ax/ay: globe rotation; vx/vy: drag inertia; tx/ty: rotation target that brings the selected photo to the front.
  const rot = useRef({ ax: -14, ay: 0, vx: 0, vy: 0, tx: null as number | null, ty: null as number | null, drag: false, spin: 0.06 });

  const R = Math.min(vp.w * 0.3, vp.h * 0.38);
  const S = R * 0.26;

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const r = rot.current;
      if (!r.drag) {
        if (r.tx !== null && r.ty !== null) { r.ax += (r.tx - r.ax) * 0.07; r.ay += (r.ty - r.ay) * 0.07; }
        else { r.ay += r.spin + r.vy; r.ax = Math.max(-70, Math.min(70, r.ax + r.vx)); r.vx *= 0.94; r.vy *= 0.94; }
      }
      if (globe.current) globe.current.style.transform = `rotateX(${r.ax}deg) rotateY(${r.ay}deg)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const pick = useCallback((i: number, rect: DOMRect | null) => {
    const r = rot.current;
    const base = -POS[i].lon;
    r.ty = base + 360 * Math.round((r.ay - base) / 360);
    r.tx = -POS[i].lat;
    r.spin = 0;
    from.current = rect;
    setSel(i);
  }, []);

  const close = useCallback(() => {
    const r = rot.current;
    r.tx = r.ty = null; r.spin = 0.06; r.vx = (-14 - r.ax) * 0.02;
    setSel(null);
  }, []);

  // Keys and wheel: move through photos when one is open, spin the globe otherwise.
  useEffect(() => {
    let last = 0;
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (sel === null) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') pick((sel + 1) % N, null);
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') pick((sel - 1 + N) % N, null);
    };
    const wheel = (e: WheelEvent) => {
      if (sel === null) { rot.current.vy += e.deltaY * 0.002; return; }
      const now = Date.now(); if (now - last < 450 || Math.abs(e.deltaY) < 8) return; last = now;
      pick((sel + (e.deltaY > 0 ? 1 : -1) + N) % N, null);
    };
    window.addEventListener('keydown', key); window.addEventListener('wheel', wheel, { passive: true });
    return () => { window.removeEventListener('keydown', key); window.removeEventListener('wheel', wheel); };
  }, [sel, pick, close]);

  // Drag to spin, with inertia.
  const down = (e: React.PointerEvent) => {
    const r = rot.current; let x = e.clientX, y = e.clientY;
    moved.current = 0;
    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - x, dy = ev.clientY - y; x = ev.clientX; y = ev.clientY;
      moved.current += Math.abs(dx) + Math.abs(dy);
      if (moved.current < 5) return;
      r.drag = true; r.tx = r.ty = null;
      r.ay += dx * 0.25; r.ax = Math.max(-70, Math.min(70, r.ax - dy * 0.25));
      r.vy = dx * 0.25; r.vx = -dy * 0.25;
    };
    const up = () => { r.drag = false; window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
  };

  useLayoutEffect(() => {
    if (sel !== null && big.current) { flip(big.current, from.current); from.current = null; }
  }, [sel]);

  const open = sel !== null;
  const wrapT = open ? `translate(${vp.w * 0.84}px, ${vp.h / 2}px) scale(0.4)` : `translate(${vp.w / 2}px, ${vp.h / 2 + 10}px) scale(1)`;
  const box = open ? fit(PHOTOS[sel], vp.w * 0.04, 72, vp.w * 0.68, vp.h - 44) : null;

  return (
    <div className="gl" onPointerDown={down} onClick={(e) => { if (open && e.target === e.currentTarget && moved.current < 5) close(); }}>
      <Header />
      <div className={`wrap${open ? ' picked' : ''}`} style={{ transform: wrapT }}>
        <div className="globe" ref={globe}>
          {PHOTOS.map((p, i) => (
            <div key={p.src} className={`tile${i === sel ? ' on' : ''}`}
              style={{ width: S, height: S, left: -S / 2, top: -S / 2, transform: `rotateY(${POS[i].lon}deg) rotateX(${POS[i].lat}deg) translateZ(${R}px)` }}
              onClick={(e) => { if (moved.current >= 5) return; pick(i, (e.currentTarget.firstChild as HTMLElement).getBoundingClientRect()); }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={thumb(p.src, 384)} alt="" draggable={false} />
            </div>
          ))}
        </div>
      </div>
      {open && box && (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={sel} ref={big} className="big" src={thumb(PHOTOS[sel].src, 1920)} alt="Photograph by Aidan Torrence" draggable={false}
          style={box} onClick={() => { if (moved.current < 5) pick((sel + 1) % N, null); }} />
      )}
    </div>
  );
}

/* ---------------- mobile: the puzzle ---------------- */

const ROW_H = [118, 92, 152, 104, 136, 86, 164];

function Puzzle({ vp }: { vp: { w: number; h: number } }) {
  const [sel, setSel] = useState<number | null>(null);
  const ov = useRef<HTMLDivElement>(null);
  const from = useRef<DOMRect | null>(null);
  const tiles = useRef<(HTMLImageElement | null)[]>([]);

  // Rows of varied heights, each filled edge to edge, so the photos lock together like puzzle pieces.
  const gap = 2;
  const rows: { h: number; items: typeof PHOTOS; full: boolean }[] = [];
  let cur: typeof PHOTOS = [], ar = 0;
  PHOTOS.forEach((p) => {
    cur.push(p); ar += p.w / p.h;
    const target = ROW_H[rows.length % ROW_H.length];
    if (ar * target + gap * (cur.length - 1) >= vp.w) { rows.push({ h: (vp.w - gap * (cur.length - 1)) / ar, items: cur, full: true }); cur = []; ar = 0; }
  });
  if (cur.length) rows.push({ h: ROW_H[rows.length % ROW_H.length], items: cur, full: false });

  useLayoutEffect(() => {
    const el = ov.current;
    if (sel === null || !el) return;
    el.scrollTop = sel * vp.h;
    const img = el.querySelectorAll('img')[sel] as HTMLImageElement | undefined;
    if (img) flip(img, from.current);
    el.animate([{ backgroundColor: 'rgba(0,0,0,0)' }, { backgroundColor: 'rgba(0,0,0,1)' }], { duration: 400 });
    from.current = null;
    const o = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = o; };
  }, [sel, vp.h]);

  const close = () => {
    const el = ov.current;
    const at = el ? Math.round(el.scrollTop / vp.h) : sel;
    setSel(null);
    if (at !== null) requestAnimationFrame(() => tiles.current[at]?.scrollIntoView({ block: 'center' }));
  };

  return (
    <div className="pz">
      <Header />
      <div className="rows">
        {rows.map((r, k) => (
          <div className="rw" key={k} style={{ height: r.h }}>
            {r.items.map((p) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={p.src} ref={(el) => { tiles.current[p.i] = el; }} src={thumb(p.src, (p.w / p.h) * r.h > 180 ? 640 : 384)} alt=""
                loading={p.i < 20 ? 'eager' : 'lazy'} style={{ flex: r.full ? `${p.w / p.h} 1 0` : `0 0 ${(p.w / p.h) * r.h}px` }}
                onClick={(e) => { from.current = e.currentTarget.getBoundingClientRect(); setSel(p.i); }} />
            ))}
          </div>
        ))}
      </div>
      {sel !== null && (
        <>
          <div className="ov" ref={ov}>
            {PHOTOS.map((p) => {
              const b = fit(p, 10, 10, vp.w - 10, vp.h - 10);
              return (
                <section key={p.src} style={{ height: vp.h }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={thumb(p.src, 1080)} alt="" loading={Math.abs(p.i - sel) < 3 ? 'eager' : 'lazy'} style={b} />
                </section>
              );
            })}
          </div>
          <button className="x" onClick={close} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 18 18" stroke="currentColor" strokeWidth="1.3"><path d="M2 2l14 14M16 2 2 16" /></svg>
          </button>
        </>
      )}
    </div>
  );
}
