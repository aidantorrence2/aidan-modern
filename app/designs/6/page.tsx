'use client';

import React, { useEffect, useRef, useState } from 'react';
import { PHOTOS, thumb, srcSet, RESET, Nav, useViewer, useWidth, justify, masonry, useCols } from '../shared';

const CSS = RESET + `
  html, body { background: #d9d8d4 !important; }
  .z { display: grid; grid-template-columns: repeat(12, 1fr); column-gap: 2vw; row-gap: 12vh; padding: 8vh clamp(14px, 4vw, 70px) 20vh; }
  .z img { width: 100%; height: auto; display: block; cursor: pointer; }
  .z .a { grid-column: 1 / span 6; }
  .z .b { grid-column: 8 / span 4; margin-top: 30vh; }
  .z .c { grid-column: 3 / span 5; }
  .z .d { grid-column: 9 / span 4; margin-top: 14vh; }
  .z .w { grid-column: 2 / span 10; }
  @media (max-width: 700px) { .z { row-gap: 6vh; } .z .a, .z .c { grid-column: 1 / span 9; } .z .b, .z .d { grid-column: 4 / span 9; margin-top: 0; } .z .w { grid-column: 1 / -1; } }
`;
const SLOTS = ['a', 'b', 'c', 'd'];
export default function D() {
  const { open, viewer } = useViewer('light');
  let k = 0;
  return (<div style={{ background: '#d9d8d4' }}><style dangerouslySetInnerHTML={{ __html: CSS }} /><Nav />
    <div className="z">{PHOTOS.map((p) => <img key={p.src} className={p.landscape ? 'w' : SLOTS[k++ % 4]} src={thumb(p.src, 1080)} srcSet={srcSet(p.src)} sizes="45vw" alt="" width={p.w} height={p.h} loading={p.i < 10 ? 'eager' : 'lazy'} decoding="async" onClick={() => open(p.i)} />)}</div>{viewer}</div>);
}
