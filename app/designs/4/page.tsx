'use client';

import React, { useEffect, useRef, useState } from 'react';
import { PHOTOS, thumb, srcSet, RESET, Nav, useViewer, useWidth, justify, masonry, useCols } from '../shared';

const CSS = RESET + `
  html, body { background: #f5f4f1 !important; }
  .m { display: flex; gap: clamp(14px, 2.4vw, 40px); padding: clamp(20px, 4vw, 70px) clamp(14px, 6vw, 120px); align-items: flex-start; }
  .c { flex: 1; display: flex; flex-direction: column; gap: clamp(14px, 2.4vw, 40px); min-width: 0; }
  .c img { width: 100%; height: auto; display: block; cursor: pointer; }
`;
const BP: [number, number][] = [[0, 2], [800, 3]];
export default function D() {
  const { open, viewer } = useViewer('light');
  const cols = masonry(PHOTOS, useCols(BP));
  return (<div style={{ background: '#f5f4f1' }}><style dangerouslySetInnerHTML={{ __html: CSS }} /><Nav />
    <div className="m">{cols.map((c, k) => <div className="c" key={k}>{c.map((p) => <img key={p.src} src={thumb(p.src, 640)} srcSet={srcSet(p.src)} sizes="33vw" alt="" width={p.w} height={p.h} loading={p.i < 10 ? 'eager' : 'lazy'} decoding="async" onClick={() => open(p.i)} />)}</div>)}</div>{viewer}</div>);
}
