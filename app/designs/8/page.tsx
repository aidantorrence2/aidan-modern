'use client';

import React, { useEffect, useRef, useState } from 'react';
import { PHOTOS, thumb, srcSet, RESET, LINKS, useViewer, useSlides, swipe, useWidth } from '../shared';

const CSS = RESET + `
  html, body { background: #fff !important; }
  .sq { background: #fff; color: #111; font: 13px/1.4 "Helvetica Neue", Helvetica, Arial, sans-serif; }
  .sq a { color: inherit; text-decoration: none; } .sq a:hover { opacity: .45; }
  .sq header { display: flex; justify-content: space-between; padding: 20px 28px 26px; }
  .sq header div { display: flex; gap: 22px; }
  .sq .g { display: grid; grid-template-columns: repeat(8, minmax(0, 1fr)); gap: 3vw 3vw; padding: 0 28px 80px; }
  .sq .g div { aspect-ratio: 1; display: grid; place-items: center; min-width: 0; min-height: 0; overflow: hidden; }
  .sq .g img { max-width: 100%; max-height: 100%; display: block; cursor: pointer; }
  @media (max-width: 900px) { .sq .g { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
  @media (max-width: 500px) { .sq .g { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; padding: 0 16px 60px; } .sq header { padding: 16px; } }
`;
export default function D() {
  const { open, viewer } = useViewer('light');
  return (<div className="sq"><style dangerouslySetInnerHTML={{ __html: CSS }} />
    <header><a href="/designs/8">Aidan Torrence</a><div><a href={LINKS.instagram}>Instagram</a><a href={LINKS.email}>Contact</a></div></header>
    <div className="g">{PHOTOS.map((p) => <div key={p.src}><img src={thumb(p.src, 384)} alt="" loading="lazy" onClick={() => open(p.i)} /></div>)}</div>{viewer}</div>);
}
