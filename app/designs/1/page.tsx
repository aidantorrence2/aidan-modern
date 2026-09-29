'use client';

import React, { useEffect, useRef, useState } from 'react';
import { PHOTOS, thumb, srcSet, RESET, Nav, useViewer, useWidth, justify, masonry, useCols } from '../shared';

const CSS = RESET + `
  html, body { background: #000 !important; }
  .s { height: 100svh; display: flex; flex-direction: column; background: #000; }
  .row { flex: 1; display: flex; align-items: center; gap: 14px; overflow-x: auto; overflow-y: hidden; padding: 0 14px; scrollbar-width: none; }
  .row::-webkit-scrollbar { display: none; }
  .row img { height: 78vh; width: auto; display: block; cursor: pointer; flex: none; }
  @media (max-width: 700px) { .s { height: auto; } .row { flex-direction: column; overflow: visible; padding: 0 0 14px; } .row img { height: auto; width: 100%; } }
`;
export default function D() {
  const { open, viewer } = useViewer('dark');
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const wheel = (e: WheelEvent) => { if (window.innerWidth <= 700 || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; e.preventDefault(); el.scrollLeft += e.deltaY; };
    el.addEventListener('wheel', wheel, { passive: false }); return () => el.removeEventListener('wheel', wheel);
  }, []);
  return (<div className="s"><style dangerouslySetInnerHTML={{ __html: CSS }} /><Nav color="#ddd" />
    <div className="row" ref={ref}>{PHOTOS.map((p) => <img key={p.src} src={thumb(p.src, 1080)} alt="" width={p.w} height={p.h} loading={p.i < 10 ? 'eager' : 'lazy'} decoding="async" onClick={() => open(p.i)} />)}</div>{viewer}</div>);
}
