'use client';

import React, { useEffect, useRef, useState } from 'react';
import { PHOTOS, thumb, srcSet, RESET, Nav, useViewer, useWidth, justify, masonry, useCols } from '../shared';

const CSS = RESET + `
  html, body { background: #fff !important; }
  .fc { display: grid; grid-template-columns: repeat(12, 1fr); column-gap: 1.6vw; row-gap: 1.6vw; padding: 3vw clamp(14px, 3vw, 48px) 16vh; align-items: start; }
  .fc img { width: 100%; height: auto; display: block; cursor: pointer; }
  @media (max-width: 700px) { .fc { grid-template-columns: repeat(6, 1fr); column-gap: 8px; row-gap: 8px; } }
`;
// [column start, span] cycle — mixes very large, medium and small placements
const DESK: [number, number][] = [[1, 7], [9, 3], [8, 5], [1, 4], [5, 3], [2, 5], [8, 4], [1, 3], [4, 6], [11, 2], [1, 5], [7, 6], [3, 3], [7, 3], [10, 3]];
const MOB: [number, number][] = [[1, 6], [1, 3], [4, 3], [2, 4], [1, 4], [5, 2], [1, 6], [3, 4]];
export default function D() {
  const { open, viewer } = useViewer('light');
  const [ref, w] = useWidth<HTMLDivElement>();
  const slots = w < 700 ? MOB : DESK;
  let k = 0;
  return (<div><style dangerouslySetInnerHTML={{ __html: CSS }} /><Nav />
    <div className="fc" ref={ref}>{PHOTOS.map((p) => { const [c, s] = p.landscape ? (w < 700 ? [1, 6] : [2, 9]) : slots[k++ % slots.length]; return <img key={p.src} style={{ gridColumn: `${c} / span ${s}` }} src={thumb(p.src, s > 5 ? 1080 : 640)} srcSet={srcSet(p.src)} sizes={`${Math.round((s / 12) * 100)}vw`} alt="" width={p.w} height={p.h} loading={p.i < 10 ? 'eager' : 'lazy'} decoding="async" onClick={() => open(p.i)} />; })}</div>{viewer}</div>);
}
