'use client';

import React, { useEffect, useRef, useState } from 'react';
import { PHOTOS, thumb, srcSet, RESET, LINKS, useViewer, useSlides, swipe, useWidth } from '../shared';

const CSS = RESET + `
  html, body { background: #fff !important; }
  .tm { background: #fff; color: #000; font: 15px/1.2 Georgia, "Times New Roman", serif; min-height: 100svh; }
  .tm a, .tm button { color: inherit; text-decoration: none; background: none; border: 0; font: inherit; cursor: pointer; padding: 0; }
  .tm header { position: sticky; top: 0; z-index: 5; background: #fff; display: grid; grid-template-columns: 1fr auto 1fr; padding: 16px 20px; }
  .tm header nav { display: flex; gap: 20px; color: #777; } .tm header nav a:hover { color: #000; }
  .tm .sz { justify-self: end; display: flex; gap: 14px; color: #bbb; } .tm .sz .on { color: #000; }
  .tm .field { display: grid; grid-template-columns: repeat(var(--c), 1fr); gap: 0; padding: 20px 20px 80px; }
  .tm .cell { aspect-ratio: 1; display: grid; place-items: center; }
  .tm .cell img { max-width: var(--s); max-height: var(--s); display: block; cursor: pointer; }
`;
// Deterministic sparse placement: each photo lands in its own cell, cells skipped irregularly.
const GAPS = [0, 2, 1, 0, 3, 1, 0, 0, 2, 1, 4, 0, 1];
export default function D() {
  const { open, viewer } = useViewer('light');
  const [big, setBig] = useState(false);
  const [ref, w] = useWidth<HTMLDivElement>();
  const cols = w < 700 ? 5 : 12;
  const cells: (typeof PHOTOS[number] | null)[] = [];
  PHOTOS.forEach((p, k) => { for (let g = 0; g < GAPS[k % GAPS.length] * (big ? 0 : 1); g++) cells.push(null); cells.push(p); });
  return (<div className="tm"><style dangerouslySetInnerHTML={{ __html: CSS }} />
    <header><a href="/designs/3">Aidan Torrence</a><nav><a href={LINKS.email}>Contact</a><a href={LINKS.instagram}>Instagram</a></nav>
      <div className="sz"><button className={!big ? 'on' : ''} onClick={() => setBig(false)}>Small</button><button className={big ? 'on' : ''} onClick={() => setBig(true)}>Large</button></div></header>
    <div className="field" ref={ref} style={{ ['--c' as string]: big ? Math.max(3, cols / 2) : cols, ['--s' as string]: big ? '88%' : '52%' }}>
      {cells.map((p, k) => <div className="cell" key={k}>{p && <img src={thumb(p.src, big ? 640 : 384)} alt="" loading="lazy" onClick={() => open(p.i)} />}</div>)}
    </div>{viewer}</div>);
}
