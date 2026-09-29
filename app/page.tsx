'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import tiers from '@/data/portfolio-tiers.json';

// Tier 1 photos, in display order. Edit data/portfolio-tiers.json (or /tiers locally) to change them.
const PHOTOS = (tiers.tier1 as [string, number, number][]).map(([src, w, h]) => ({ src, w, h }));
const N = PHOTOS.length;
const img = (src: string, w: number) => `/_next/image?url=${encodeURIComponent(`/images/large/${src}.jpg`)}&w=${w}&q=80`;

const CSS = `
  body > header, body > footer, .fixed.inset-x-0.bottom-0 { display: none !important; }
  html, body { background: #f3f2ee !important; margin: 0 !important; padding: 0 !important; height: auto !important; }

  .at { min-height: 100svh; background: #f3f2ee; color: #111; font: 13px/1.5 "Helvetica Neue", Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
  .at a, .at button { color: inherit; text-decoration: none; background: none; border: 0; padding: 0; font: inherit; cursor: pointer; }
  .at a:hover, .at button:hover { opacity: 0.45; }
  .at button:focus-visible, .at a:focus-visible { outline: 1px solid #111; outline-offset: 3px; }

  .at-grid { display: grid; grid-template-columns: repeat(12, 1fr); column-gap: 20px; padding: 0 3vw; }
  .at-head { padding-top: 22px; }
  .at-name { grid-column: 1 / 4; }
  .at-contact { grid-column: 4 / 9; }
  .at-links { grid-column: 10 / 13; }
  .at-links button, .at-contact a { display: block; }
  .at-links .on { opacity: 0.45; }

  .at-stage { margin-top: 64px; padding-bottom: 60px; }
  .at-photo { grid-column: 4 / 13; justify-self: start; cursor: pointer; display: block; max-width: 100%;
    max-height: min(72vh, calc(100svh - 190px)); width: auto; height: auto; user-select: none; }

  .at-index { grid-column: 4 / 13; display: flex; flex-wrap: wrap; gap: 14px; align-items: flex-end; margin-top: 64px; padding-bottom: 80px; }
  .at-index img { height: 120px; width: auto; display: block; cursor: pointer; }

  @media (max-width: 760px) {
    .at-grid { grid-template-columns: 1fr 1fr; column-gap: 12px; padding: 0 16px; }
    .at-head { padding-top: 16px; row-gap: 10px; }
    .at-name { grid-column: 1; }
    .at-links { grid-column: 2; }
    .at-contact { grid-column: 1 / -1; grid-row: 2; }
    .at-stage { margin-top: 36px; }
    .at-photo { grid-column: 1 / -1; max-height: 72svh; }
    .at-index { grid-column: 1 / -1; gap: 8px; margin-top: 36px; }
    .at-index img { height: 88px; }
  }
`;

export default function Page() {
  const [i, setI] = useState(0);
  const [index, setIndex] = useState(false);
  const touch = useRef<number | null>(null);
  const go = useCallback((d: number) => setI((x) => (x + d + N) % N), []);

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (index) return;
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [go, index]);

  // Preload neighbours so moving through is instant.
  useEffect(() => {
    [1, 2, -1].forEach((d) => { const im = new Image(); im.src = img(PHOTOS[(i + d + N) % N].src, 1920); });
  }, [i]);

  const p = PHOTOS[i];

  return (
    <div className="at">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <header className="at-grid at-head">
        <a className="at-name" href="/" onClick={(e) => { e.preventDefault(); setIndex(false); setI(0); }}>aidan torrence</a>
        <div className="at-contact">
          <a href="mailto:aidan@aidantorrence.com">aidan@aidantorrence.com</a>
          <a href="https://www.instagram.com/madebyaidan" target="_blank" rel="noopener noreferrer">instagram</a>
        </div>
        <nav className="at-links">
          <button className={index ? 'on' : ''} onClick={() => setIndex((v) => !v)}>index</button>
          <a href="/sign-up-collab">collaborate</a>
        </nav>
      </header>

      {index ? (
        <div className="at-grid">
          <div className="at-index">
            {PHOTOS.map((q, k) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={q.src} src={img(q.src, 384)} width={q.w} height={q.h} alt="" loading="lazy"
                onClick={() => { setI(k); setIndex(false); window.scrollTo(0, 0); }} />
            ))}
          </div>
        </div>
      ) : (
        <div className="at-grid at-stage"
          onTouchStart={(e) => { touch.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => {
            if (touch.current === null) return;
            const dx = e.changedTouches[0].clientX - touch.current; touch.current = null;
            if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
          }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="at-photo" key={p.src} src={img(p.src, 1920)}
            srcSet={`${img(p.src, 1080)} 1080w, ${img(p.src, 1920)} 1920w`} sizes="(max-width: 760px) 100vw, 60vw"
            width={p.w} height={p.h} alt="Photograph by Aidan Torrence" onClick={() => go(1)} />
        </div>
      )}
    </div>
  );
}
