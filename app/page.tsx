'use client';

import React, { useEffect, useState } from 'react';
import tiers from '@/data/portfolio-tiers.json';

// Tier 1 photos, in display order. Edit data/portfolio-tiers.json to move photos between tiers.
const PHOTOS = tiers.tier1 as [string, number, number][];


const pad = (n: number) => String(n).padStart(2, '0');

// Layout: the photos stay in their saved order; they are poured into a repeating editorial
// sequence of blocks. Nothing is cropped: every tile keeps its photo's aspect ratio.
type P = { i: number; src: string; w: number; h: number };
type Row = { h: number; tiles: P[]; widths: number[] };
type Block =
  | { kind: 'rows'; big: boolean; rows: Row[] }
  | { kind: 'stagger'; flip: boolean; a: P; b: P; wa: number; wb: number }
  | { kind: 'solo'; p: P; w: number };

const GAP = 6;
const ALL: P[] = PHOTOS.map(([src, w, h], i) => ({ i, src, w, h }));
// 'dense' = two rows of small photos, 'dense1' = one row; the rest are the featured moments.
const SEQUENCE = ['dense', 'big', 'dense1', 'stagger', 'dense', 'solo', 'dense1', 'big', 'dense', 'stagger-flip', 'dense1', 'solo'] as const;

// Justify photos from `start` into up to `maxRows` rows of roughly `target` height that fill `width`.
function justify(start: number, width: number, target: number, maxRows: number) {
  const rows: Row[] = [];
  let i = start;
  while (i < ALL.length && rows.length < maxRows) {
    const tiles: P[] = []; let ar = 0;
    while (i < ALL.length) {
      const p = ALL[i++]; tiles.push(p); ar += p.w / p.h;
      if (ar * target + GAP * (tiles.length - 1) >= width) break;
    }
    const full = ar * target + GAP * (tiles.length - 1) >= width;
    const h = full ? (width - GAP * (tiles.length - 1)) / ar : target;
    const widths = tiles.map((p) => Math.floor((p.w / p.h) * h));
    // Give rounding leftovers to the last tile so full rows end exactly at the edge.
    if (full) widths[widths.length - 1] += Math.max(0, Math.floor(width - GAP * (tiles.length - 1) - widths.reduce((x, y) => x + y, 0)));
    rows.push({ h: Math.floor(h), tiles, widths });
  }
  return { rows, used: i - start };
}

function layout(width: number, vh: number): Block[] {
  const small = width < 640;
  const dense = width < 600 ? 150 : width < 1000 ? 200 : width < 1600 ? 240 : 280;
  const big = small ? width * 0.9 : Math.min(640, width * 0.4);
  const maxH = Math.max(420, vh * 0.86); // featured photos never taller than the screen
  const fit = (p: P, w: number) => Math.min(w, maxH * (p.w / p.h)); // width that respects maxH
  const blocks: Block[] = [];
  let i = 0, k = 0;
  while (i < ALL.length) {
    const kind = SEQUENCE[k++ % SEQUENCE.length];
    const left = ALL.length - i;
    if (kind === 'dense' || kind === 'dense1' || kind === 'big' || left < 2) {
      const n = kind === 'big' ? 1 : kind === 'dense1' ? (small ? 2 : 1) : small ? 3 : 2;
      const { rows, used } = justify(i, width, kind === 'big' ? big : dense, n);
      blocks.push({ kind: 'rows', big: kind === 'big', rows }); i += used;
    } else if (kind === 'solo') {
      const p = ALL[i++];
      const landscape = p.w > p.h;
      blocks.push({ kind: 'solo', p, w: Math.floor(fit(p, landscape ? width * (small ? 1 : 0.8) : width * (small ? 0.86 : 0.5))) });
    } else {
      const a = ALL[i++], b = ALL[i++];
      const wa = fit(a, width * (small ? 0.72 : a.w > a.h ? 0.52 : 0.38));
      const wb = fit(b, width * (small ? 0.52 : b.w > b.h ? 0.36 : 0.24));
      blocks.push({ kind: 'stagger', flip: kind === 'stagger-flip', a, b, wa: Math.floor(wa), wb: Math.floor(wb) });
    }
  }
  return blocks;
}

// Serve grid tiles through Next's image resizer instead of the 1600px originals.
const thumb = (src: string, w: number) => `/_next/image?url=${encodeURIComponent(`/images/large/${src}.jpg`)}&w=${w}&q=75`;

const CSS = `
  @font-face { font-family: 'Bodoni Moda'; font-style: normal; font-weight: 400 900; font-display: swap; src: url('/fonts/bodoni-moda.woff2') format('woff2'); }
  @font-face { font-family: 'Bodoni Moda'; font-style: italic; font-weight: 400 900; font-display: swap; src: url('/fonts/bodoni-moda-italic.woff2') format('woff2'); }
  @font-face { font-family: 'Inter'; font-style: normal; font-weight: 100 900; font-display: swap; src: url('/fonts/inter.woff2') format('woff2'); }

  body > header, body > footer, .fixed.inset-x-0.bottom-0 { display: none !important; }
  html, body {
    background: #0c0c0c !important;
    height: auto !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow-x: hidden !important;
  }

  .hf {
    --ivory: #f2ede4;
    --dim: rgba(242,237,228,0.55);
    --faint: rgba(242,237,228,0.3);
    --rule: rgba(242,237,228,0.14);
    --serif: 'Bodoni Moda', Didot, 'Bodoni 72', Georgia, serif;
    --sans: 'Inter', system-ui, -apple-system, sans-serif;
    --gutter: clamp(10px, 2vw, 28px);
    color: var(--ivory);
    font-family: var(--sans);
    -webkit-font-smoothing: antialiased;
  }
  .hf *, .hf *::before, .hf *::after { box-sizing: border-box; }
  .hf img { display: block; width: 100%; height: auto; }

  .hf-eyebrow { font-size: 10px; font-weight: 500; letter-spacing: 0.3em; text-transform: uppercase; }

  /* Nav */
  .hf-nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 50; height: 52px;
    display: flex; justify-content: space-between; align-items: center;
    padding: 0 var(--gutter);
    background: rgba(12,12,12,0.9); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
  }
  .hf-nav a { color: var(--ivory); text-decoration: none; }
  .hf-nav-mark { font-family: var(--serif); font-size: 14px; letter-spacing: 0.3em; text-transform: uppercase; white-space: nowrap; }
  .hf-nav-r { display: flex; gap: 26px; }
  .hf-nav-r a { color: var(--dim); transition: color 0.2s; }
  .hf-nav-r a:hover { color: var(--ivory); }

  /* Grid */
  .hf-grid { padding: 58px var(--gutter) 0; display: flex; flex-direction: column; gap: var(--gap); --gap: 6px; }
  .hf-row { display: flex; gap: var(--gap); }
  .hf-rows { display: flex; flex-direction: column; gap: var(--gap); }
  .hf-rows.big { margin: clamp(26px, 4vw, 60px) 0; }
  .hf-stagger { display: flex; justify-content: space-between; align-items: flex-end; margin: clamp(40px, 7vw, 120px) 0; padding: 0 clamp(0px, 5vw, 90px); }
  .hf-stagger.flip { flex-direction: row-reverse; }
  .hf-stagger > :nth-child(2) { margin-bottom: clamp(30px, 6vw, 110px); }
  .hf-solo { display: flex; justify-content: center; margin: clamp(50px, 8vw, 140px) 0; }
  .hf-fig { margin: 0; flex: none; }
  .hf-fig figcaption { display: flex; justify-content: space-between; gap: 12px; padding-top: 10px; font-family: var(--sans); font-size: 10px; font-weight: 500; letter-spacing: 0.24em; text-transform: uppercase; color: var(--faint); }
  @media (max-width: 640px) {
    .hf-stagger, .hf-stagger.flip { flex-direction: column; align-items: flex-start; gap: 18px; padding: 0; }
    .hf-stagger > :nth-child(2) { align-self: flex-end; margin-bottom: 0; }
    .hf-stagger.flip > :nth-child(1) { align-self: flex-end; }
    .hf-stagger.flip > :nth-child(2) { align-self: flex-start; }
  }

  /* Viewer */
  .hf-view { position: fixed; inset: 0; z-index: 100; background: rgba(8,8,8,0.97); display: grid; place-items: center; touch-action: pan-y; }
  .hf-view img { max-width: calc(100vw - 140px); max-height: calc(100svh - 110px); object-fit: contain; display: block; user-select: none; }
  .hf-view .vb { position: absolute; background: none; border: 0; color: var(--ivory); cursor: pointer; opacity: 0.7; transition: opacity 0.2s; font-family: var(--sans); }
  .hf-view .vb:hover, .hf-view .vb:focus-visible { opacity: 1; }
  .hf-view .vb:focus-visible { outline: 1px solid var(--ivory); outline-offset: 4px; }
  .hf-view .prev, .hf-view .next { top: 50%; transform: translateY(-50%); width: 56px; height: 90px; display: grid; place-items: center; }
  .hf-view .prev { left: 8px; } .hf-view .next { right: 8px; }
  .hf-view .close { top: 14px; right: 16px; font-size: 11px; letter-spacing: 0.24em; text-transform: uppercase; padding: 8px; }
  .hf-view .count { position: absolute; bottom: 18px; left: 0; right: 0; text-align: center; font-family: var(--sans); font-size: 11px; letter-spacing: 0.24em; color: var(--dim); font-variant-numeric: tabular-nums; }
  @media (max-width: 640px) {
    .hf-view img { max-width: 100vw; max-height: calc(100svh - 120px); }
    .hf-view .prev, .hf-view .next { top: auto; bottom: 4px; transform: none; height: 56px; }
  }
  .hf-tile { position: relative; display: block; overflow: hidden; background: #151515; cursor: zoom-in; flex: none; padding: 0; border: 0; }
  .hf-tile img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .hf-tile img { transition: transform 1.2s cubic-bezier(.2,.7,.2,1), opacity 0.8s ease; opacity: 0; }
  .hf-tile img.in { opacity: 1; }
  .hf-tile:hover img { transform: scale(1.03); }
  .hf-no {
    position: absolute; left: 8px; bottom: 8px; color: #fff; font-family: var(--sans); font-size: 10px; font-weight: 500;
    letter-spacing: 0.2em; opacity: 0; transition: opacity 0.3s; text-shadow: 0 1px 8px rgba(0,0,0,0.6);
  }
  .hf-tile:hover .hf-no, .hf-tile:focus-visible .hf-no { opacity: 1; }
  .hf-tile:focus-visible { outline: 1px solid var(--ivory); outline-offset: 3px; }

  /* Closing */
  .hf-close { padding: clamp(90px, 12vw, 180px) var(--gutter) 48px; text-align: center; }
  .hf-close a.hf-cta {
    display: inline-block; color: var(--ivory); text-decoration: none; position: relative;
    font-family: var(--serif); font-style: italic; font-size: clamp(52px, 10vw, 160px); line-height: 0.9; letter-spacing: -0.03em;
    margin: 24px 0 36px;
  }
  .hf-close a.hf-cta::after { content: ''; position: absolute; left: 50%; right: 50%; bottom: -10px; height: 1px; background: var(--ivory); transition: left 0.6s, right 0.6s; }
  .hf-close a.hf-cta:hover::after { left: 0; right: 0; }
  .hf-close .hf-eyebrow { color: var(--faint); }
  .hf-close-links { display: flex; justify-content: center; gap: 34px; flex-wrap: wrap; }
  .hf-close-links a { color: var(--dim); text-decoration: none; }
  .hf-close-links a:hover { color: var(--ivory); }
  .hf-colophon {
    margin-top: clamp(90px, 12vw, 160px); padding-top: 18px; border-top: 1px solid var(--rule);
    display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap; color: var(--faint);
  }

  @media (max-width: 760px) {
    .hf-nav-r { gap: 16px; }
    .hf-nav-mark { font-size: 12px; letter-spacing: 0.22em; }
  }

  @media (prefers-reduced-motion: reduce) {
    .hf-tile img { opacity: 1; transition: none; }
  }
`;

function useGridSize() {
  const ref = React.useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 1360, vh: 900 });
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const measure = () => {
      const cs = getComputedStyle(el);
      setSize({ w: el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight), vh: window.innerHeight });
    };
    measure();
    const ro = new ResizeObserver(measure); ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, size] as const;
}

const Arrow = ({ dir }: { dir: 'l' | 'r' }) => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
    <path d={dir === 'l' ? 'M17 5 8 14l9 9' : 'M11 5l9 9-9 9'} />
  </svg>
);

function Viewer({ index, onClose, onGo }: { index: number; onClose: () => void; onGo: (i: number) => void }) {
  const n = ALL.length;
  const go = React.useCallback((d: number) => onGo((index + d + n) % n), [index, n, onGo]);
  const touch = React.useRef<number | null>(null);
  const closeRef = React.useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, onClose]);
  useEffect(() => {
    const prev = document.body.style.overflow; document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => { document.body.style.overflow = prev; };
  }, []);
  useEffect(() => { // preload neighbours so arrowing through is instant
    [1, -1].forEach((d) => { const img = new Image(); img.src = `/images/large/${ALL[(index + d + n) % n].src}.jpg`; });
  }, [index, n]);
  const p = ALL[index];
  return (
    <div className="hf-view" role="dialog" aria-modal="true" aria-label={`Plate ${index + 1} of ${n}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      onTouchStart={(e) => { touch.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => { if (touch.current === null) return; const dx = e.changedTouches[0].clientX - touch.current; touch.current = null; if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); }}>
      <img src={`/images/large/${p.src}.jpg`} alt={`Plate ${index + 1}`} />
      <button className="vb prev" onClick={() => go(-1)} aria-label="Previous photo"><Arrow dir="l" /></button>
      <button className="vb next" onClick={() => go(1)} aria-label="Next photo"><Arrow dir="r" /></button>
      <button className="vb close" ref={closeRef} onClick={onClose}>Close</button>
      <div className="count">{pad(index + 1)} / {n}</div>
    </div>
  );
}

function Tile({ p, w, h, eager, onOpen }: { p: P; w: number; h: number; eager: boolean; onOpen: (i: number) => void }) {
  return (
    <a className="hf-tile" href={`/images/large/${p.src}.jpg`} style={{ width: w, height: h }} aria-label={`Plate ${pad(p.i + 1)}, view larger`}
      onClick={(e) => { e.preventDefault(); onOpen(p.i); }}>
      <img
        src={thumb(p.src, 640)}
        srcSet={`${thumb(p.src, 384)} 384w, ${thumb(p.src, 640)} 640w, ${thumb(p.src, 1080)} 1080w, ${thumb(p.src, 1600)} 1600w`}
        sizes={`${w}px`}
        width={p.w} height={p.h}
        alt={`Plate ${pad(p.i + 1)}`}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={(e) => e.currentTarget.classList.add('in')}
        ref={(el) => { if (el?.complete) el.classList.add('in'); }}
      />
      <span className="hf-no">Nº {pad(p.i + 1)}</span>
    </a>
  );
}

function Fig({ p, w, onOpen }: { p: P; w: number; onOpen: (i: number) => void }) {
  return (
    <figure className="hf-fig" style={{ width: w }}>
      <Tile p={p} w={w} h={Math.round((w * p.h) / p.w)} eager={false} onOpen={onOpen} />
      <figcaption><span>Nº {pad(p.i + 1)}</span><span>35mm</span></figcaption>
    </figure>
  );
}

export default function Page() {
  const [gridRef, size] = useGridSize();
  const blocks = React.useMemo(() => layout(size.w, size.vh), [size.w, size.vh]);
  const [open, setOpen] = useState<number | null>(null);

  const year = new Date().getFullYear();

  return (
    <div className="hf">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <nav className="hf-nav">
        <a className="hf-nav-mark" href="/">Aidan Torrence</a>
        <div className="hf-nav-r">
          <a className="hf-eyebrow" href="/sign-up-collab">Collaborate</a>
          <a className="hf-eyebrow" href="mailto:aidan@aidantorrence.com">Contact</a>
        </div>
      </nav>

      <div className="hf-grid" ref={gridRef}>
        {blocks.map((bl, bi) => {
          if (bl.kind === 'rows') return (
            <div className={'hf-rows' + (bl.big ? ' big' : '')} key={bi}>
              {bl.rows.map((row, r) => (
                <div className="hf-row" key={r} style={{ height: row.h }}>
                  {row.tiles.map((p, t) => <Tile key={p.src} p={p} w={row.widths[t]} h={row.h} eager={bi < 2} onOpen={setOpen} />)}
                </div>
              ))}
            </div>
          );
          if (bl.kind === 'stagger') return (
            <div className={'hf-stagger' + (bl.flip ? ' flip' : '')} key={bi}>
              <Fig p={bl.a} w={bl.wa} onOpen={setOpen} />
              <Fig p={bl.b} w={bl.wb} onOpen={setOpen} />
            </div>
          );
          return <div className="hf-solo" key={bi}><Fig p={bl.p} w={bl.w} onOpen={setOpen} /></div>;
        })}
      </div>

      {open !== null && <Viewer index={open} onClose={() => setOpen(null)} onGo={setOpen} />}

      <section className="hf-close">
        <span className="hf-eyebrow">Now booking worldwide</span>
        <div><a className="hf-cta" href="/sign-up-collab">Sit for me.</a></div>
        <div className="hf-close-links">
          <a className="hf-eyebrow" href="/sign-up-collab">Collaborate</a>
          <a className="hf-eyebrow" href="https://www.instagram.com/madebyaidan" target="_blank" rel="noopener noreferrer">Instagram</a>
          <a className="hf-eyebrow" href="mailto:aidan@aidantorrence.com">Email</a>
        </div>
        <div className="hf-colophon">
          <span className="hf-eyebrow">© {year} Aidan Torrence</span>
          <span className="hf-eyebrow">Shot on 35mm film</span>
        </div>
      </section>
    </div>
  );
}
