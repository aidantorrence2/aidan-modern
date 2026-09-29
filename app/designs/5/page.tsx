'use client';

import React, { useEffect, useRef, useState } from 'react';
import { PHOTOS, thumb, srcSet, RESET, LINKS, useViewer, useSlides, swipe, useWidth } from '../shared';

const CSS = RESET + `
  html, body { background: #fff !important; }
  .cs { background: #fff; color: #000; font: bold 11px/1.35 Arial, Helvetica, sans-serif; text-transform: uppercase; padding: 8px 8px 60px; }
  .cs a { color: inherit; text-decoration: none; } .cs a:hover { text-decoration: underline; }
  .cs h1 { font: bold 13px Arial, sans-serif; margin: 0 0 18px; }
  .cs .info { margin-bottom: 26px; }
  .cs .col { display: flex; flex-direction: column; gap: 8px; align-items: flex-start; }
  .cs .col img { width: min(560px, 100%); height: auto; display: block; cursor: pointer; }
`;
export default function D() {
  const { open, viewer } = useViewer('light');
  return (<div className="cs"><style dangerouslySetInnerHTML={{ __html: CSS }} />
    <h1>AIDAN TORRENCE</h1>
    <div className="info">GENERAL:<br /><a href={LINKS.email}>aidan@aidantorrence.com</a><br /><br />INSTAGRAM:<br /><a href={LINKS.instagram}>@madebyaidan</a><br /><br />COLLABORATE:<br /><a href={LINKS.collaborate}>aidantorrence.com/sign-up-collab</a></div>
    <div className="col">{PHOTOS.map((p) => <img key={p.src} src={thumb(p.src, 1080)} alt="" width={p.w} height={p.h} loading={p.i < 4 ? 'eager' : 'lazy'} onClick={() => open(p.i)} />)}</div>{viewer}</div>);
}
