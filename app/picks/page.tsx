'use client';

import React, { useEffect, useState } from 'react';
import picks from './picks.json';

// Saved IG grid plan: 3★+ Lightroom picks, newest post = top-left.
// Order interleaves model portraits with docu/environmental frames (one docu per row, stepping across columns).
// Source + editor: ~/ig-thumb-picker (export_site.py writes picks.json and public/picks/).

type Pick = { id: string; w: number; h: number; group: string; kind: string };
const POSTS = picks as Pick[];

const CSS = `
  body > header, body > footer, .fixed.inset-x-0.bottom-0 { display: none !important; }
  html, body { background: #fafafa !important; margin: 0 !important; padding: 0 !important; overflow-x: hidden !important; }
  .pk { max-width: 470px; margin: 0 auto; background: #fff; min-height: 100vh;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #262626; }
  .pk-top { display: flex; align-items: center; gap: 20px; padding: 16px 16px 12px; }
  .pk-av { width: 77px; height: 77px; border-radius: 50%; object-fit: cover; border: 2px solid #efefef; flex: none; }
  .pk-stats { display: flex; flex: 1; justify-content: space-around; text-align: center; }
  .pk-stats b { display: block; font-size: 16px; font-weight: 600; }
  .pk-stats span { font-size: 13px; color: #8e8e8e; }
  .pk-name { font-size: 14px; font-weight: 600; margin: 0; padding: 0 16px; }
  .pk-tabs { display: flex; border-top: 1px solid #efefef; margin-top: 16px; }
  .pk-tabs div { flex: 1; text-align: center; padding: 11px 0; font-size: 12px; letter-spacing: .06em; text-transform: uppercase; color: #8e8e8e; }
  .pk-tabs div.on { color: #262626; box-shadow: inset 0 1px 0 #262626; }
  .pk-ctrl { display: flex; justify-content: flex-end; padding: 0 16px 8px; }
  .pk-ctrl button { font: 600 13px/1 inherit; background: #efefef; border: 0; border-radius: 8px; padding: 7px 12px; cursor: pointer; color: #262626; }
  .pk-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; }
  .pk-item { position: relative; aspect-ratio: 3 / 4; overflow: hidden; cursor: pointer; background: #efefef; border: 0; padding: 0; }
  .pk-grid.sq .pk-item { aspect-ratio: 1; }
  .pk-item img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
  .pk-lb { position: fixed; inset: 0; z-index: 50; background: rgba(0,0,0,.92); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; padding: 16px; }
  .pk-lb img { max-width: 100%; max-height: 82vh; object-fit: contain; }
  .pk-lb p { color: #bbb; font-size: 12px; margin: 0; }
`;

export default function PicksPage() {
  const [square, setSquare] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (open === null) return;
      if (e.key === 'Escape') setOpen(null);
      if (e.key === 'ArrowRight') setOpen((open + 1) % POSTS.length);
      if (e.key === 'ArrowLeft') setOpen((open - 1 + POSTS.length) % POSTS.length);
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [open]);
  const src = (p: Pick) => `/picks/pick-${p.id}.jpg`;
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <main className="pk">
        <div className="pk-top">
          <img className="pk-av" src={src(POSTS[0])} alt="" />
          <div className="pk-stats">
            <div><b>{POSTS.length}</b><span>posts</span></div>
            <div><b>{POSTS.filter((p) => p.kind === 'portrait').length}</b><span>portraits</span></div>
            <div><b>{POSTS.filter((p) => p.kind === 'docu').length}</b><span>docu</span></div>
          </div>
        </div>
        <p className="pk-name">Aidan Torrence</p>
        <div className="pk-tabs"><div className="on">Posts</div><div>Reels</div><div>Tagged</div></div>
        <div className="pk-ctrl"><button onClick={() => setSquare(!square)}>{square ? 'Tiles: 1:1' : 'Tiles: 3:4'}</button></div>
        <div className={`pk-grid${square ? ' sq' : ''}`}>
          {POSTS.map((p, i) => (
            <button key={p.id} className="pk-item" onClick={() => setOpen(i)} aria-label={`Post ${i + 1}: ${p.group}`}>
              <img src={src(p)} alt={p.group} loading={i < 15 ? 'eager' : 'lazy'} />
            </button>
          ))}
        </div>
      </main>
      {open !== null && (
        <div className="pk-lb" onClick={() => setOpen(null)} role="dialog" aria-modal="true">
          <img src={src(POSTS[open])} alt={POSTS[open].group} />
          <p>{open + 1} / {POSTS.length} · {POSTS[open].group}</p>
        </div>
      )}
    </>
  );
}
