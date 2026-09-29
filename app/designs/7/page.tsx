'use client';

import React, { useEffect, useRef, useState } from 'react';
import { PHOTOS, thumb, srcSet, RESET, Nav, useViewer, useWidth, justify, masonry, useCols } from '../shared';

const CSS = RESET + `
  html, body { background: #fff !important; }
  .sp { display: grid; grid-template-columns: 1fr 380px; height: 100svh; }
  .big { display: grid; place-items: center; padding: 2vh 3vw 4vh; min-height: 0; }
  .big img { max-width: 100%; max-height: calc(100svh - 110px); object-fit: contain; cursor: pointer; }
  .th { overflow-y: auto; padding: 60px 18px 18px 0; display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; align-content: start; }
  .th img { width: 100%; aspect-ratio: 2 / 3; object-fit: contain; background: #f2f2f2; cursor: pointer; display: block; opacity: .55; transition: opacity .2s; }
  .th img.on, .th img:hover { opacity: 1; }
  .left { display: grid; grid-template-rows: auto 1fr; min-height: 0; }
  @media (max-width: 800px) { .sp { grid-template-columns: 1fr; height: auto; } .big { height: 62svh; position: sticky; top: 0; background: #fff; } .th { padding: 8px; overflow: visible; grid-template-columns: repeat(5, 1fr); } }
`;
export default function D() {
  const [i, setI] = useState(0);
  const { open, viewer } = useViewer('light');
  const n = PHOTOS.length;
  useEffect(() => { const k = (e: KeyboardEvent) => { if (viewer) return; if (e.key === 'ArrowRight') setI((x) => (x + 1) % n); if (e.key === 'ArrowLeft') setI((x) => (x - 1 + n) % n); }; window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, [n, viewer]);
  return (<div className="sp"><style dangerouslySetInnerHTML={{ __html: CSS }} />
    <div className="left"><Nav /><div className="big"><img src={thumb(PHOTOS[i].src, 1920)} alt="" onClick={() => open(i)} /></div></div>
    <div className="th">{PHOTOS.map((p) => <img key={p.src} className={p.i === i ? 'on' : ''} src={thumb(p.src, 256)} alt="" loading="lazy" onMouseEnter={() => setI(p.i)} onClick={() => setI(p.i)} />)}</div>{viewer}</div>);
}
