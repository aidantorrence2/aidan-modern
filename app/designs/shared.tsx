'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import tiers from '@/data/portfolio-tiers.json';
import { portfolioPhotos, type PortfolioTiers, type Photo } from '@/lib/portfolio';
export type { Photo } from '@/lib/portfolio';

// Shared toolkit: tier-1 selections first, then tier0 and tier1, preserving each saved order.
export const PHOTOS = portfolioPhotos(tiers as unknown as PortfolioTiers);
const TIER = new Map(PHOTOS.map((p) => [p.src, p.tier]));

export const pad = (n: number, len = 2) => String(n).padStart(len, '0');
export const full = (src: string) => `/images/${TIER.get(src) ?? 'tier1'}/${src}.jpg`;
// Resized copy via Next's image optimizer. Allowed widths: 256 384 640 750 828 1080 1200 1920.
export const thumb = (src: string, w: 256 | 384 | 640 | 750 | 828 | 1080 | 1200 | 1920 = 640) =>
  `/_next/image?url=${encodeURIComponent(full(src))}&w=${w}&q=75`;
export const srcSet = (src: string) => [384, 640, 1080, 1920].map((w) => `${thumb(src, w as 384)} ${w}w`).join(', ');

// Pre-generated WebP copies (scripts/optimize-portfolio-images.py): public/images/opt/<width>/<name>.webp
// exists for each width in WIDTHS smaller than the photo, plus opt/full (at most 1920px wide).
const WIDTHS = [256, 384, 640, 1080] as const;
export const opt = (p: Photo, w: (typeof WIDTHS)[number] | 'full') => `/images/opt/${w !== 'full' && w < p.w ? w : 'full'}/${p.src}.webp`;
/** srcset of the pre-generated copies from `min` px up; pair it with `sizes`. */
export const optSet = (p: Photo, min = 256) =>
  [...WIDTHS.filter((w) => w >= min && w < p.w).map((w) => `${opt(p, w)} ${w}w`), `${opt(p, 'full')} ${Math.min(p.w, 1920)}w`].join(', ');

// Hides the site's global header/footer on these pages.
export const RESET = `body > header, body > footer, .fixed.inset-x-0.bottom-0 { display: none !important; }
html, body { margin: 0 !important; padding: 0 !important; height: auto !important; }`;

export const LINKS = { collaborate: '/sign-up-collab', email: 'mailto:aidan@aidantorrence.com', instagram: 'https://www.instagram.com/madebyaidan' };

/** Full-screen photo viewer: arrows, ←/→ keys, swipe, Esc. No counters or text. */
export function Viewer({ index, onClose, onGo, theme = 'dark' }: { index: number; onClose: () => void; onGo: (i: number) => void; theme?: 'dark' | 'light' }) {
  const n = PHOTOS.length;
  const go = useCallback((d: number) => onGo((index + d + n) % n), [index, n, onGo]);
  const touch = useRef<number | null>(null);
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'ArrowRight') go(1); else if (e.key === 'ArrowLeft') go(-1); else if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', k);
    const o = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', k); document.body.style.overflow = o; };
  }, [go, onClose]);
  useEffect(() => { [1, -1].forEach((d) => { const im = new Image(); im.src = full(PHOTOS[(index + d + n) % n].src); }); }, [index, n]);
  const fg = theme === 'dark' ? '#eee' : '#111', bg = theme === 'dark' ? '#0a0a0a' : '#fff';
  const btn: React.CSSProperties = { position: 'absolute', top: 0, bottom: 0, width: '18vw', maxWidth: 160, background: 'none', border: 0, color: fg, cursor: 'pointer', display: 'grid', placeItems: 'center', opacity: 0.55 };
  const arrow = (d: string) => <svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke="currentColor" strokeWidth="1.2"><path d={d} /></svg>;
  return (
    <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, zIndex: 1000, background: bg, display: 'grid', placeItems: 'center' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      onTouchStart={(e) => { touch.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => { if (touch.current == null) return; const dx = e.changedTouches[0].clientX - touch.current; touch.current = null; if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={full(PHOTOS[index].src)} alt="" style={{ maxWidth: 'calc(100vw - 48px)', maxHeight: 'calc(100svh - 48px)', objectFit: 'contain' }} onClick={() => go(1)} />
      <button style={{ ...btn, left: 0 }} onClick={() => go(-1)} aria-label="Previous">{arrow('M16 5 8 13l8 8')}</button>
      <button style={{ ...btn, right: 0 }} onClick={() => go(1)} aria-label="Next">{arrow('M10 5l8 8-8 8')}</button>
      <button style={{ position: 'absolute', top: 12, right: 14, background: 'none', border: 0, color: fg, cursor: 'pointer', opacity: 0.55, padding: 8 }} onClick={onClose} aria-label="Close">
        <svg width="18" height="18" viewBox="0 0 18 18" stroke="currentColor" strokeWidth="1.2"><path d="M2 2l14 14M16 2 2 16" /></svg>
      </button>
    </div>
  );
}

export function useViewer(theme: 'dark' | 'light' = 'dark') {
  const [i, setI] = useState<number | null>(null);
  const el = i === null ? null : <Viewer index={i} onClose={() => setI(null)} onGo={setI} theme={theme} />;
  return { open: setI, viewer: el };
}

/** The only text on every design: name and a contact link. */
export function Nav({ color = '#111', fixed = false, bg }: { color?: string; fixed?: boolean; bg?: string }) {
  const s: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px clamp(14px, 2.2vw, 32px)', color, font: '400 13px/1 "Helvetica Neue", Helvetica, Arial, sans-serif', letterSpacing: '0.01em', zIndex: 50, background: bg, ...(fixed ? { position: 'fixed', top: 0, left: 0, right: 0 } : {}) };
  const a: React.CSSProperties = { color: 'inherit', textDecoration: 'none' };
  return <nav style={s}><a href="/" style={a}>Aidan Torrence</a><a href={LINKS.email} style={a}>Contact</a></nav>;
}

/** Content width of an element (px), live. */
export function useWidth<T extends HTMLElement>(fallback = 1360) {
  const ref = useRef<T>(null);
  const [w, setW] = useState(fallback);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const m = () => { const cs = getComputedStyle(el); setW(el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)); };
    m(); const ro = new ResizeObserver(m); ro.observe(el); return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

/** Justified rows filling `width`; last row keeps target height. */
export function justify(photos: Photo[], width: number, target: number, gap: number) {
  const rows: { h: number; items: { p: Photo; w: number }[] }[] = [];
  let cur: Photo[] = [], ar = 0;
  const flush = (full: boolean) => {
    const h = full ? (width - gap * (cur.length - 1)) / ar : target;
    const items = cur.map((p) => ({ p, w: Math.floor((p.w / p.h) * h) }));
    if (full) items[items.length - 1].w += Math.max(0, Math.floor(width - gap * (cur.length - 1) - items.reduce((s, x) => s + x.w, 0)));
    rows.push({ h: Math.floor(h), items }); cur = []; ar = 0;
  };
  photos.forEach((p) => { cur.push(p); ar += p.w / p.h; if (ar * target + gap * (cur.length - 1) >= width) flush(true); });
  if (cur.length) flush(false);
  return rows;
}

/** Masonry: each photo goes into the currently shortest column. */
export function masonry(photos: Photo[], cols: number) {
  const out: Photo[][] = Array.from({ length: cols }, () => []);
  const h = new Array(cols).fill(0);
  photos.forEach((p) => { let c = 0; for (let k = 1; k < cols; k++) if (h[k] < h[c] - 0.01) c = k; out[c].push(p); h[c] += p.h / p.w; });
  return out;
}

export function useCols(bp: [number, number][]) { // e.g. [[0,2],[700,3],[1200,4]]
  const [n, setN] = useState(bp[bp.length - 1][1]);
  useEffect(() => { const f = () => { let v = bp[0][1]; for (const [w, c] of bp) if (window.innerWidth >= w) v = c; setN(v); }; f(); window.addEventListener('resize', f); return () => window.removeEventListener('resize', f); }, [bp]);
  return n;
}

/** One-photo-at-a-time state: ←/→ keys, preloading of neighbours. */
export function useSlides(step = 1, size: 1080 | 1200 | 1920 = 1920) {
  const [i, setI] = useState(0);
  const n = PHOTOS.length;
  const go = useCallback((d: number) => setI((x) => (x + d * step + n * 4) % n), [n, step]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1); };
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  }, [go]);
  useEffect(() => { [1, 2, -1].forEach((d) => { const im = new Image(); im.src = thumb(PHOTOS[(i + d * step + n * 4) % n].src, size); }); }, [i, n, step, size]);
  return [i, go, setI] as const;
}

/** Swipe handlers for touch screens. */
export function swipe(go: (d: number) => void) {
  let x: number | null = null;
  return {
    onTouchStart: (e: React.TouchEvent) => { x = e.touches[0].clientX; },
    onTouchEnd: (e: React.TouchEvent) => { if (x === null) return; const dx = e.changedTouches[0].clientX - x; x = null; if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); },
  };
}
