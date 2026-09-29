'use client';

import React, { useEffect, useRef, useState } from 'react';
import { PHOTOS, thumb, srcSet, RESET, Nav, useViewer, useWidth, justify, masonry, useCols } from '../shared';

const CSS = RESET + `
  html, body { background: #0b0b0b !important; }
  html { scroll-snap-type: y mandatory; }
  .f { height: 100svh; scroll-snap-align: start; display: grid; place-items: center; padding: 64px 16px 24px; box-sizing: border-box; }
  .f img { max-width: 100%; max-height: 100%; object-fit: contain; display: block; cursor: pointer; }
`;
export default function D() {
  const { open, viewer } = useViewer('dark');
  return (<div style={{ background: '#0b0b0b' }}><style dangerouslySetInnerHTML={{ __html: CSS }} /><Nav color="#ddd" fixed />
    {PHOTOS.map((p) => <section className="f" key={p.src}><img src={thumb(p.src, 1920)} alt="" loading={p.i < 10 ? 'eager' : 'lazy'} decoding="async" onClick={() => open(p.i)} /></section>)}{viewer}</div>);
}
