'use client';

import React, { useEffect, useRef, useState } from 'react';
import { PHOTOS, thumb, srcSet, RESET, LINKS, useViewer, useSlides, swipe, useWidth } from '../shared';

const CSS = RESET + `
  html, body { background: #ecebe7 !important; }
  .bk { height: 100svh; background: #ecebe7; color: #111; font: 12px/1.4 "Helvetica Neue", Helvetica, Arial, sans-serif; display: grid; grid-template-rows: auto 1fr auto; }
  .bk a { color: inherit; text-decoration: none; }
  .bk header, .bk footer { display: flex; justify-content: space-between; padding: 18px 26px; }
  .bk .spread { display: grid; grid-template-columns: 1fr 1fr; min-height: 0; padding: 2vh 6vw 3vh; gap: 0; cursor: pointer; }
  .bk .pg { display: grid; min-height: 0; padding: 0 3vw; }
  .bk .pg:first-child { place-items: center end; } .bk .pg:last-child { place-items: center start; }
  .bk .pg img { max-width: 100%; max-height: 74vh; display: block; }
  @media (max-width: 700px) { .bk .spread { grid-template-columns: 1fr; padding: 2vh 16px; } .bk .pg:last-child { display: none; } .bk .pg:first-child { place-items: center; } }
`;
export default function D() {
  const [i, go] = useSlides(2, 1200);
  const a = PHOTOS[i], b = PHOTOS[(i + 1) % PHOTOS.length];
  return (<div className="bk" {...swipe(go)}><style dangerouslySetInnerHTML={{ __html: CSS }} />
    <header><a href="/designs/7">Aidan Torrence</a><a href={LINKS.email}>Contact</a></header>
    <div className="spread" onClick={(e) => go(e.clientX < window.innerWidth / 3 ? -1 : 1)}>
      <div className="pg"><img key={a.src} src={thumb(a.src, 1200)} alt="" /></div>
      <div className="pg"><img key={b.src} src={thumb(b.src, 1200)} alt="" /></div>
    </div>
    <footer><span /><a href={LINKS.instagram}>Instagram</a></footer></div>);
}
