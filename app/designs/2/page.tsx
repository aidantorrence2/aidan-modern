'use client';

import React, { useEffect, useRef, useState } from 'react';
import { PHOTOS, thumb, srcSet, RESET, LINKS, useViewer, useSlides, swipe, useWidth } from '../shared';

const CSS = RESET + `
  html, body { background: #fff !important; }
  .w { min-height: 100svh; display: flex; flex-direction: column; align-items: center; background: #fff; color: #000; font: 14px/1.3 "Times New Roman", Times, serif; }
  .w a { color: inherit; text-decoration: none; }
  .w h1 { font: inherit; letter-spacing: .08em; margin: 22px 0 18px; }
  .w .st { flex: 1; display: flex; align-items: flex-start; justify-content: center; width: 100%; }
  .w img { max-width: min(90vw, 1000px); max-height: calc(100svh - 120px); display: block; cursor: pointer; }
  .w .ft { margin: 18px 0 22px; letter-spacing: .08em; font-size: 12px; display: flex; gap: 22px; }
`;
export default function D() {
  const [i, go] = useSlides();
  const p = PHOTOS[i];
  return (<div className="w" {...swipe(go)}><style dangerouslySetInnerHTML={{ __html: CSS }} />
    <h1><a href="/designs/2">AIDAN TORRENCE</a></h1>
    <div className="st"><img key={p.src} src={thumb(p.src, 1920)} alt="" onClick={() => go(1)} /></div>
    <div className="ft"><a href={LINKS.email}>CONTACT</a><a href={LINKS.instagram}>INSTAGRAM</a></div></div>);
}
