'use client';

import React, { useEffect, useRef, useState } from 'react';
import { PHOTOS, thumb, srcSet, RESET, LINKS, useViewer, useSlides, swipe, useWidth } from '../shared';

const CSS = RESET + `
  html, body { background: #000 !important; }
  .jd { height: 100svh; background: #000; color: #fff; font: 500 13px/1 "Helvetica Neue", Helvetica, Arial, sans-serif; display: grid; place-items: center; position: relative; overflow: hidden; }
  .jd img { max-width: 100vw; max-height: 100svh; display: block; cursor: pointer; }
  .jd .n { position: absolute; left: 40px; bottom: 34px; display: flex; gap: 26px; mix-blend-mode: difference; }
  .jd .n span { opacity: .45; }
  .jd .c { position: absolute; right: 40px; bottom: 34px; mix-blend-mode: difference; display: flex; gap: 26px; }
  .jd a { color: #fff; text-decoration: none; }
  @media (max-width: 700px) { .jd .n { left: 16px; bottom: 18px; } .jd .c { right: 16px; bottom: 18px; } }
`;
export default function D() {
  const [i, go] = useSlides();
  const p = PHOTOS[i];
  return (<div className="jd" {...swipe(go)}><style dangerouslySetInnerHTML={{ __html: CSS }} />
    <img key={p.src} src={thumb(p.src, 1920)} alt="" onClick={() => go(1)} />
    <div className="n"><a href="/designs/4">Aidan Torrence</a><span>Photographer</span></div>
    <div className="c"><a href={LINKS.email}>Contact</a><a href={LINKS.instagram}>Instagram</a></div></div>);
}
