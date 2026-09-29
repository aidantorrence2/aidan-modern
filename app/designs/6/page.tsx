'use client';

import React, { useEffect, useRef, useState } from 'react';
import { PHOTOS, thumb, srcSet, RESET, LINKS, useViewer, useSlides, swipe, useWidth } from '../shared';

const CSS = RESET + `
  html, body { background: #fff !important; }
  .hs { height: 100svh; background: #fff; color: #111; font: 13px/1.4 "Helvetica Neue", Helvetica, Arial, sans-serif; display: grid; grid-template-rows: auto 1fr; }
  .hs a { color: inherit; text-decoration: none; } .hs a:hover { opacity: .45; }
  .hs header { display: flex; justify-content: space-between; padding: 20px 28px; }
  .hs header div { display: flex; gap: 22px; }
  .hs .row { display: flex; align-items: center; gap: 28px; overflow-x: auto; padding: 0 28px 0 25vw; scrollbar-width: none; }
  .hs .row::-webkit-scrollbar { display: none; }
  .hs .row img { height: 62vh; width: auto; flex: none; display: block; cursor: pointer; }
  .hs .row::after { content: ''; flex: none; width: 25vw; }
  @media (max-width: 700px) { .hs { height: auto; } .hs .row { flex-direction: column; overflow: visible; padding: 20px 16px 60px; gap: 16px; } .hs .row img { height: auto; width: 100%; } .hs .row::after { display: none; } }
`;
export default function D() {
  const { open, viewer } = useViewer('light');
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { const el = ref.current; if (!el) return;
    const wh = (e: WheelEvent) => { if (window.innerWidth <= 700 || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; e.preventDefault(); el.scrollLeft += e.deltaY; };
    el.addEventListener('wheel', wh, { passive: false }); return () => el.removeEventListener('wheel', wh); }, []);
  return (<div className="hs"><style dangerouslySetInnerHTML={{ __html: CSS }} />
    <header><a href="/designs/6">Aidan Torrence</a><div><a href={LINKS.instagram}>Instagram</a><a href={LINKS.email}>Contact</a></div></header>
    <div className="row" ref={ref}>{PHOTOS.map((p) => <img key={p.src} src={thumb(p.src, 1080)} alt="" width={p.w} height={p.h} loading={p.i < 6 ? 'eager' : 'lazy'} onClick={() => open(p.i)} />)}</div>{viewer}</div>);
}
