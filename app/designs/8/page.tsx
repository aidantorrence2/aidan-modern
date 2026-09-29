'use client';

import React, { useEffect, useRef, useState } from 'react';
import { PHOTOS, thumb, srcSet, RESET, Nav, useViewer, useWidth, justify, masonry, useCols } from '../shared';

const CSS = RESET + `
  html, body { background: #fff !important; }
  .t { display: flex; flex-wrap: wrap; gap: 10px; padding: 24px clamp(14px, 3vw, 48px) 60px; align-items: flex-end; }
  .t img { height: 118px; width: auto; display: block; cursor: pointer; transition: opacity .2s; }
  .t:hover img { opacity: .35; } .t img:hover { opacity: 1; }
  @media (max-width: 700px) { .t { gap: 5px; } .t img { height: 84px; } }
`;
export default function D() {
  const { open, viewer } = useViewer('light');
  return (<div><style dangerouslySetInnerHTML={{ __html: CSS }} /><Nav />
    <div className="t">{PHOTOS.map((p) => <img key={p.src} src={thumb(p.src, 384)} alt="" width={p.w} height={p.h} loading="lazy" onClick={() => open(p.i)} />)}</div>{viewer}</div>);
}
