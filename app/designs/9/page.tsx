'use client';

import React, { useEffect, useRef, useState } from 'react';
import { PHOTOS, thumb, srcSet, RESET, LINKS, useViewer, useSlides, swipe, useWidth } from '../shared';

const CSS = RESET + `
  html, body { background: #f6f5f2 !important; }
  .sc { background: #f6f5f2; color: #111; font: 13px/1.5 "Helvetica Neue", Helvetica, Arial, sans-serif; }
  .sc a { color: inherit; text-decoration: none; } .sc a:hover { opacity: .45; }
  .sc aside { position: fixed; top: 22px; left: 3vw; display: flex; flex-direction: column; gap: 2px; }
  .sc aside .sp { height: 14px; }
  .sc .col { margin-left: 33vw; padding: 22px 3vw 30vh 0; display: flex; flex-direction: column; gap: 14vh; align-items: flex-start; }
  .sc .col img { max-width: min(100%, 900px); max-height: 82vh; width: auto; height: auto; display: block; cursor: pointer; }
  @media (max-width: 700px) { .sc aside { position: static; padding: 16px; flex-direction: row; flex-wrap: wrap; gap: 16px; } .sc aside .sp { display: none; } .sc .col { margin: 0; padding: 0 16px 20vh; gap: 6vh; } .sc .col img { max-width: 100%; } }
`;
export default function D() {
  const { open, viewer } = useViewer('light');
  return (<div className="sc"><style dangerouslySetInnerHTML={{ __html: CSS }} />
    <aside><a href="/designs/9">Aidan Torrence</a><div className="sp" /><a href={LINKS.email}>Contact</a><a href={LINKS.instagram}>Instagram</a><a href={LINKS.collaborate}>Collaborate</a></aside>
    <div className="col">{PHOTOS.map((p) => <img key={p.src} src={thumb(p.src, 1200)} srcSet={srcSet(p.src)} sizes="(max-width: 700px) 100vw, 60vw" alt="" width={p.w} height={p.h} loading={p.i < 3 ? 'eager' : 'lazy'} onClick={() => open(p.i)} />)}</div>{viewer}</div>);
}
