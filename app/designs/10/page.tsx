'use client';

import React, { useEffect, useRef, useState } from 'react';
import { PHOTOS, thumb, srcSet, RESET, LINKS, useViewer, useSlides, swipe, useWidth } from '../shared';

const CSS = RESET + `
  html, body { background: #fbfaf7 !important; }
  .ab { height: 100svh; background: #fbfaf7; color: #111; font: 12px/1.4 "Helvetica Neue", Helvetica, Arial, sans-serif; position: relative; overflow: hidden; cursor: pointer; }
  .ab a { color: inherit; text-decoration: none; }
  .ab .nm { position: absolute; top: 20px; left: 26px; z-index: 2; } .ab .ct { position: absolute; top: 20px; right: 26px; z-index: 2; }
  .ab img { position: absolute; display: block; object-fit: contain; }
`;
// Page positions cycle: [left, top, max width, max height] in viewport units; image anchored inside that box.
const PAGES: [string, string, string, string, string][] = [
  ['50%', '50%', '46vw', '78vh', 'translate(-50%, -50%)'],
  ['8vw', '12vh', '26vw', '40vh', 'none'],
  ['auto', 'auto', '40vw', '66vh', 'none'],
  ['50%', '50%', '70vw', '86vh', 'translate(-50%, -50%)'],
  ['60vw', '46vh', '22vw', '34vh', 'none'],
  ['12vw', 'auto', '34vw', '58vh', 'none'],
];
export default function D() {
  const [i, go] = useSlides(1, 1920);
  const p = PHOTOS[i];
  const [l, t, mw, mh, tr] = PAGES[i % PAGES.length];
  const pos: React.CSSProperties = { left: l, top: t, maxWidth: mw, maxHeight: mh, transform: tr };
  if (l === 'auto') Object.assign(pos, { right: '8vw', bottom: '10vh' });
  if (t === 'auto' && l !== 'auto') Object.assign(pos, { bottom: '9vh' });
  const small = typeof window !== 'undefined' && window.innerWidth < 700;
  const style = small ? { left: '50%', top: '50%', maxWidth: '88vw', maxHeight: '76svh', transform: 'translate(-50%, -50%)' } : pos;
  return (<div className="ab" onClick={(e) => { if ((e.target as HTMLElement).tagName !== 'A') go(e.clientX < window.innerWidth / 4 ? -1 : 1); }} {...swipe(go)}>
    <style dangerouslySetInnerHTML={{ __html: CSS }} />
    <a className="nm" href="/designs/10">Aidan Torrence</a><a className="ct" href={LINKS.email}>Contact</a>
    <img key={p.src} src={thumb(p.src, 1920)} alt="" style={style} /></div>);
}
