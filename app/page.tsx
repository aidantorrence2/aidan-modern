'use client';

import React, { useEffect, useState } from 'react';
import tiers from '@/data/portfolio-tiers.json';

// Tier 1 photos, in display order. Edit data/portfolio-tiers.json to move photos between tiers.
const PHOTOS = tiers.tier1 as [string, number, number][];


const pad = (n: number) => String(n).padStart(2, '0');

// Justified rows: photos keep their order left to right, top to bottom; each row is
// scaled so it exactly fills the container width at roughly the target height.
type Tile = { i: number; src: string; w: number; h: number };
function toRows(width: number, target: number, gap: number) {
  const rows: { h: number; tiles: Tile[] }[] = [];
  let cur: Tile[] = [], ar = 0;
  PHOTOS.forEach(([src, pw, ph], i) => {
    cur.push({ i, src, w: pw, h: ph }); ar += pw / ph;
    const rowW = ar * target + gap * (cur.length - 1);
    if (rowW >= width) {
      const h = (width - gap * (cur.length - 1)) / ar;
      rows.push({ h, tiles: cur }); cur = []; ar = 0;
    }
  });
  if (cur.length) rows.push({ h: target, tiles: cur }); // last row keeps target height, left aligned
  return rows;
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
    position: fixed; top: 0; left: 0; right: 0; z-index: 50;
    display: grid; grid-template-columns: 1fr auto 1fr; align-items: center;
    padding: 20px var(--gutter);
    color: #fff; mix-blend-mode: difference;
    transition: background 0.5s, padding 0.5s;
  }
  .hf-nav a { color: inherit; text-decoration: none; }
  .hf-nav-mark { font-family: var(--serif); font-size: 15px; letter-spacing: 0.34em; text-transform: uppercase; white-space: nowrap; opacity: 0; transition: opacity 0.5s; }
  .hf-nav-r { justify-self: end; display: flex; gap: 26px; }
  .hf-scrolled .hf-nav {
    mix-blend-mode: normal; color: var(--ivory);
    background: rgba(12,12,12,0.85); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
    padding-top: 14px; padding-bottom: 14px;
  }
  .hf-scrolled .hf-nav-mark { opacity: 1; }

  /* Masthead */
  .hf-top { padding: clamp(80px, 9vw, 130px) var(--gutter) clamp(18px, 2.4vw, 32px); text-align: center; }
  .hf-masthead {
    margin: 0; white-space: nowrap; line-height: 0.85;
    font-family: var(--serif); font-weight: 400; text-transform: uppercase; letter-spacing: -0.02em;
    font-size: clamp(44px, 8vw, 150px);
    opacity: 0; animation: hf-rise 1.4s 0.1s cubic-bezier(.2,.7,.2,1) forwards;
  }
  .hf-masthead span + span { margin-left: 0.22em; }
  @keyframes hf-rise { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
  .hf-top-meta {
    display: grid; grid-template-columns: 1fr auto 1fr; align-items: baseline; gap: 16px;
    margin-top: clamp(16px, 2vw, 28px); padding-top: 14px; border-top: 1px solid var(--rule);
  }
  .hf-top-meta > :first-child { text-align: left; }
  .hf-top-meta > :last-child { text-align: right; }
  .hf-top-meta .hf-eyebrow { color: var(--dim); }
  .hf-top-line { font-family: var(--serif); font-style: italic; font-size: clamp(18px, 2vw, 26px); margin: 0; }

  /* Grid: justified rows */
  .hf-grid { padding: 0 var(--gutter); display: flex; flex-direction: column; gap: var(--gap); --gap: 6px; }
  .hf-row { display: flex; gap: var(--gap); }
  .hf-tile { position: relative; display: block; overflow: hidden; background: #151515; cursor: zoom-in; flex: none; }
  .hf-tile img { width: 100%; height: 100%; object-fit: cover; }
  .hf-tile img { transition: transform 1.2s cubic-bezier(.2,.7,.2,1), opacity 0.8s ease; opacity: 0; }
  .hf-tile img.in { opacity: 1; }
  .hf-tile:hover img { transform: scale(1.03); }
  .hf-no {
    position: absolute; left: 8px; bottom: 8px; color: #fff; font-family: var(--sans); font-size: 10px; font-weight: 500;
    letter-spacing: 0.2em; opacity: 0; transition: opacity 0.3s; text-shadow: 0 1px 8px rgba(0,0,0,0.6);
  }
  .hf-tile:hover .hf-no, .hf-tile:focus-visible .hf-no { opacity: 1; }
  .hf-tile:focus-visible { outline: 1px solid var(--ivory); outline-offset: 3px; }

  /* Lightbox (global component) */
  #lb { background: #0c0c0c; border-radius: 0 !important; }
  #lb::backdrop { background: rgba(8,8,8,0.94); }

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
    .hf-nav { grid-template-columns: 1fr auto; }
    .hf-nav-l { display: none; }
    .hf-nav-r { gap: 18px; }
    .hf-nav-mark { font-size: 12px; letter-spacing: 0.24em; }
    .hf-masthead { font-size: clamp(48px, 15.5vw, 120px); white-space: normal; }
    .hf-masthead span { display: block; }
    .hf-masthead span + span { margin-left: 0; }
    .hf-top-meta { grid-template-columns: 1fr 1fr; }
    .hf-top-line { display: none; }
    .hf-hide-sm { display: none; }
  }

  @media (prefers-reduced-motion: reduce) {
    .hf-masthead { animation: none; opacity: 1; transform: none; }
    .hf-tile img { opacity: 1; transition: none; }
  }
`;

function useGridWidth() {
  const ref = React.useRef<HTMLDivElement>(null);
  const [w, setW] = useState(1360);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const measure = () => {
      const cs = getComputedStyle(el);
      setW(el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight));
    };
    measure();
    const ro = new ResizeObserver(measure); ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

export default function Page() {
  const [gridRef, gridW] = useGridWidth();
  // Row height: ~2-3 photos per row on phones, ~7-9 per row on a laptop.
  const target = gridW < 600 ? 150 : gridW < 1000 ? 210 : gridW < 1600 ? 250 : 290;
  const rows = toRows(gridW, target, 6);

  useEffect(() => {
    const root = document.querySelector('.hf');
    const onScroll = () => root?.classList.toggle('hf-scrolled', window.scrollY > 240);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const year = new Date().getFullYear();

  return (
    <div className="hf">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <nav className="hf-nav">
        <a className="hf-eyebrow hf-nav-l" href="#index">Index</a>
        <a className="hf-nav-mark" href="/">Aidan Torrence</a>
        <div className="hf-nav-r">
          <a className="hf-eyebrow" href="/sign-up-collab">Collaborate</a>
          <a className="hf-eyebrow" href="mailto:aidan@aidantorrence.com">Contact</a>
        </div>
      </nav>
      <header className="hf-top" id="index">
        <h1 className="hf-masthead"><span>Aidan</span><span>Torrence</span></h1>
        <div className="hf-top-meta">
          <span className="hf-eyebrow">Portraits on 35mm film</span>
          <p className="hf-top-line">Selected works</p>
          <span className="hf-eyebrow"><span className="hf-hide-sm">Collection {year} · </span>{PHOTOS.length} plates</span>
        </div>
      </header>

      <div className="hf-grid" data-lightbox ref={gridRef}>
        {rows.map((row, r) => {
          // Floor each width, then give the leftover pixels to the last tile so full rows end exactly at the edge.
          const widths = row.tiles.map(({ w, h }) => Math.floor((w / h) * row.h));
          const full = r < rows.length - 1 || row.h !== target;
          if (full) widths[widths.length - 1] += Math.max(0, Math.floor(gridW - 6 * (widths.length - 1) - widths.reduce((a, b) => a + b, 0)));
          return (
          <div className="hf-row" key={r} style={{ height: Math.floor(row.h) }}>
            {row.tiles.map(({ i, src, w, h }, t) => {
              const tw = widths[t];
              return (
                <a className="hf-tile" key={src} href={`/images/large/${src}.jpg`} style={{ width: tw }} aria-label={`Plate ${pad(i + 1)}, view larger`}>
                  <img
                    src={thumb(src, 640)}
                    srcSet={`${thumb(src, 384)} 384w, ${thumb(src, 640)} 640w, ${thumb(src, 1080)} 1080w`}
                    sizes={`${tw}px`}
                    width={w}
                    height={h}
                    alt={`Plate ${pad(i + 1)}`}
                    loading={r < 3 ? 'eager' : 'lazy'}
                    decoding="async"
                    onLoad={(e) => e.currentTarget.classList.add('in')}
                    ref={(el) => { if (el?.complete) el.classList.add('in'); }}
                  />
                  <span className="hf-no">Nº {pad(i + 1)}</span>
                </a>
              );
            })}
          </div>
          );
        })}
      </div>

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
