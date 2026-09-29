'use client';

import React, { useEffect, useRef, useState } from 'react';
import { PHOTOS, thumb, srcSet, RESET, Nav, useViewer, useWidth, justify, masonry, useCols } from '../shared';

const CSS = RESET + `
  html, body { background: #fff !important; }
  .s { height: 100svh; display: grid; grid-template-rows: auto 1fr; background: #fff; }
  .stage { display: grid; place-items: center; padding: 3vh 6vw 7vh; min-height: 0; cursor: pointer; }
  .stage img { max-width: 100%; max-height: 100%; object-fit: contain; display: block; }
`;
export default function D() {
  const [i, setI] = useState(0);
  const n = PHOTOS.length;
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'ArrowRight') setI((x) => (x + 1) % n); if (e.key === 'ArrowLeft') setI((x) => (x - 1 + n) % n); };
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  }, [n]);
  useEffect(() => { [1, -1].forEach((d) => { const im = new Image(); im.src = thumb(PHOTOS[(i + d + n) % n].src, 1920); }); }, [i, n]);
  return (<div className="s"><style dangerouslySetInnerHTML={{ __html: CSS }} /><Nav />
    <div className="stage" onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); setI((x) => (e.clientX - r.left < r.width / 3 ? x - 1 + n : x + 1) % n); }}>
      <img key={i} src={thumb(PHOTOS[i].src, 1920)} alt="" />
    </div></div>);
}
