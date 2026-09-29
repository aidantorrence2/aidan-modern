'use client';

import React, { useEffect, useRef, useState } from 'react';
import { PHOTOS, thumb, srcSet, RESET, Nav, useViewer, useWidth, justify, masonry, useCols } from '../shared';

const CSS = RESET + `
  html, body { background: #000 !important; }
  .g { display: flex; flex-direction: column; gap: 2px; }
  .r { display: flex; gap: 2px; }
  .r img { display: block; height: 100%; cursor: pointer; }
`;
export default function D() {
  const { open, viewer } = useViewer('dark');
  const [ref, w] = useWidth<HTMLDivElement>();
  const rows = justify(PHOTOS, w, w < 700 ? 180 : 330, 2);
  return (<div style={{ background: '#000' }}><style dangerouslySetInnerHTML={{ __html: CSS }} /><Nav color="#ddd" />
    <div className="g" ref={ref}>{rows.map((r, k) => <div className="r" key={k} style={{ height: r.h }}>{r.items.map(({ p, w: tw }) => <img key={p.src} src={thumb(p.src, tw > 640 ? 1080 : 640)} alt="" style={{ width: tw }} loading={p.i < 10 ? 'eager' : 'lazy'} decoding="async" onClick={() => open(p.i)} />)}</div>)}</div>{viewer}</div>);
}
