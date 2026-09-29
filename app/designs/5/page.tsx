'use client';

import React, { useEffect, useRef, useState } from 'react';
import { PHOTOS, thumb, srcSet, RESET, Nav, useViewer, useWidth, justify, masonry, useCols } from '../shared';

const CSS = RESET + `
  html, body { background: #fff !important; }
  .col { display: flex; flex-direction: column; align-items: center; gap: 22vh; padding: 16vh 16px 30vh; }
  .col img { max-width: min(92vw, 1100px); max-height: 86vh; width: auto; height: auto; display: block; cursor: pointer; }
  @media (max-width: 700px) { .col { gap: 8vh; padding-top: 6vh; } .col img { max-width: 100%; } }
`;
export default function D() {
  const { open, viewer } = useViewer('light');
  return (<div><style dangerouslySetInnerHTML={{ __html: CSS }} /><Nav fixed bg="rgba(255,255,255,.9)" />
    <div className="col">{PHOTOS.map((p) => <img key={p.src} src={thumb(p.src, 1200)} srcSet={srcSet(p.src)} sizes="(max-width: 700px) 100vw, 60vw" alt="" width={p.w} height={p.h} loading={p.i < 10 ? 'eager' : 'lazy'} decoding="async" onClick={() => open(p.i)} />)}</div>{viewer}</div>);
}
