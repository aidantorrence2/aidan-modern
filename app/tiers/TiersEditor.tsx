'use client';

import React, { useMemo, useState } from 'react';

type Entry = [string, number, number];
type Tier = 'tier1' | 'tier2';
type Lists = Record<Tier, string[]>;

const CSS = `
  body > header, body > footer, .fixed.inset-x-0.bottom-0 { display: none !important; }
  html, body { background: #0c0c0c !important; height: auto !important; }
  .te { color: #f2ede4; font-family: system-ui, -apple-system, sans-serif; padding: 32px clamp(16px, 2.5vw, 36px) 110px; }
  .te h1 { font: italic 400 clamp(38px, 5vw, 64px)/1 Georgia, serif; margin: 0 0 8px; }
  .te p.lead { color: rgba(242,237,228,0.62); margin: 0; max-width: 78ch; line-height: 1.55; }
  .te section { margin-top: 36px; }
  .te h2 { font: italic 400 32px Georgia, serif; margin: 0 0 12px; padding-bottom: 8px; border-bottom: 1px solid rgba(242,237,228,0.14); display: flex; justify-content: space-between; align-items: baseline; }
  .te h2 small { font: 500 11px system-ui; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(242,237,228,0.45); }
  .te .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(118px, 1fr)); gap: 8px; min-height: 140px; padding: 6px; border: 1px dashed transparent; }
  .te .grid.over-end { border-color: #c9b98f; }
  .te .t { position: relative; cursor: grab; user-select: none; }
  .te .t:active { cursor: grabbing; }
  .te .t.dragging { opacity: 0.3; }
  .te .t.before::before { content: ''; position: absolute; left: -6px; top: 0; bottom: 18px; width: 3px; background: #c9b98f; border-radius: 2px; }
  .te .t.sel .ph { outline: 2px solid #c9b98f; outline-offset: 1px; }
  .te .ph { aspect-ratio: 4 / 5; background: #161514; position: relative; }
  .te .ph img { width: 100%; height: 100%; object-fit: contain; display: block; pointer-events: none; }
  .te .no { position: absolute; top: 4px; left: 4px; background: rgba(12,12,12,0.78); font-size: 10px; padding: 2px 5px; font-variant-numeric: tabular-nums; }
  .te .mv { position: absolute; bottom: 4px; right: 4px; font: 500 9px system-ui; letter-spacing: 0.1em; text-transform: uppercase; background: rgba(12,12,12,0.85); color: #f2ede4; border: 1px solid rgba(242,237,228,0.25); padding: 3px 6px; cursor: pointer; opacity: 0; }
  .te .t:hover .mv, .te .t.sel .mv { opacity: 1; }
  .te .cap { font-size: 9px; color: rgba(242,237,228,0.4); margin-top: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .te .bar { position: fixed; left: 0; right: 0; bottom: 0; z-index: 5; background: rgba(12,12,12,0.94); backdrop-filter: blur(10px); border-top: 1px solid rgba(242,237,228,0.14); padding: 12px clamp(16px, 2.5vw, 36px); display: flex; gap: 12px; align-items: center; justify-content: space-between; flex-wrap: wrap; }
  .te .status { font-size: 13px; color: rgba(242,237,228,0.7); }
  .te .status.dirty { color: #c9b98f; }
  .te .status.err { color: #e07a64; }
  .te button.b { font: 500 11px system-ui; letter-spacing: 0.14em; text-transform: uppercase; padding: 10px 15px; cursor: pointer; border: 1px solid #f2ede4; background: #f2ede4; color: #0c0c0c; }
  .te button.b.ghost { background: none; color: #f2ede4; border-color: rgba(242,237,228,0.25); }
  .te button.b:disabled { opacity: 0.4; cursor: default; }
  .te a { color: #f2ede4; }
  .te kbd { font: 11px ui-monospace, monospace; border: 1px solid rgba(242,237,228,0.3); padding: 1px 5px; border-radius: 3px; }
`;

export default function TiersEditor({ initial }: { initial: { tier1: Entry[]; tier2: Entry[] } }) {
  const start: Lists = { tier1: initial.tier1.map((e) => e[0]), tier2: initial.tier2.map((e) => e[0]) };
  // Folder each photo's file is in right now (public/images/tier1 or tier2); files only move on save.
  const [home, setHome] = useState<Record<string, Tier>>(() => Object.fromEntries([...start.tier1.map((k) => [k, 'tier1']), ...start.tier2.map((k) => [k, 'tier2'])]));
  const [lists, setLists] = useState<Lists>(start);
  const [saved, setSaved] = useState<Lists>(start);
  const [drag, setDrag] = useState<string | null>(null);
  const [over, setOver] = useState<{ tier: Tier; index: number } | null>(null);
  const [sel, setSel] = useState<string | null>(null);
  const [status, setStatus] = useState<{ text: string; kind: '' | 'dirty' | 'err' }>({ text: 'All changes saved.', kind: '' });
  const [busy, setBusy] = useState(false);

  const dirty = useMemo(() => JSON.stringify(lists) !== JSON.stringify(saved), [lists, saved]);

  const move = (key: string, tier: Tier, index: number) => {
    setLists((prev) => {
      const next: Lists = { tier1: prev.tier1.filter((k) => k !== key), tier2: prev.tier2.filter((k) => k !== key) };
      const from = prev.tier1.includes(key) ? 'tier1' : 'tier2';
      const oldIndex = prev[from].indexOf(key);
      const at = from === tier && oldIndex < index ? index - 1 : index; // removing it shifted later items left
      next[tier].splice(Math.max(0, Math.min(at, next[tier].length)), 0, key);
      return next;
    });
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (!sel) return;
    const tier: Tier = lists.tier1.includes(sel) ? 'tier1' : 'tier2';
    const i = lists[tier].indexOf(sel);
    if (e.key === 'ArrowLeft' && i > 0) { e.preventDefault(); move(sel, tier, i - 1); }
    if (e.key === 'ArrowRight' && i < lists[tier].length - 1) { e.preventDefault(); move(sel, tier, i + 2); }
    if (e.key === 'Home') { e.preventDefault(); move(sel, tier, 0); }
    if (e.key === 'End') { e.preventDefault(); move(sel, tier, lists[tier].length); }
    if (e.key === 'Escape') setSel(null);
  };

  const save = async () => {
    setBusy(true);
    try {
      const r = await fetch('/api/tiers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(lists) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Save failed');
      setSaved(lists);
      setHome(Object.fromEntries([...lists.tier1.map((k) => [k, 'tier1' as Tier]), ...lists.tier2.map((k) => [k, 'tier2' as Tier])]));
      setStatus({ text: `Saved: ${j.tier1} on the homepage, ${j.tier2} in backup. The homepage now uses this order.`, kind: '' });
    } catch (err) {
      setStatus({ text: (err as Error).message + ' Nothing was changed.', kind: 'err' });
    } finally {
      setBusy(false);
    }
  };

  const grid = (tier: Tier) => (
    <div
      className={'grid' + (over && over.tier === tier && over.index === lists[tier].length ? ' over-end' : '')}
      onDragOver={(e) => { e.preventDefault(); if (e.target === e.currentTarget) setOver({ tier, index: lists[tier].length }); }}
      onDrop={(e) => { e.preventDefault(); if (drag && over) move(drag, over.tier, over.index); setDrag(null); setOver(null); }}
    >
      {lists[tier].map((key, i) => (
        <div
          key={key}
          className={'t' + (drag === key ? ' dragging' : '') + (over && over.tier === tier && over.index === i && drag !== key ? ' before' : '') + (sel === key ? ' sel' : '')}
          draggable
          tabIndex={0}
          onDragStart={(e) => { setDrag(key); e.dataTransfer.effectAllowed = 'move'; }}
          onDragEnd={() => { setDrag(null); setOver(null); }}
          onDragOver={(e) => {
            e.preventDefault(); e.stopPropagation();
            const r = e.currentTarget.getBoundingClientRect();
            setOver({ tier, index: e.clientX > r.left + r.width / 2 ? i + 1 : i });
          }}
          onClick={() => setSel(sel === key ? null : key)}
          onKeyDown={onKey}
        >
          <div className="ph">
            <img src={`/_next/image?url=${encodeURIComponent(`/images/${home[key]}/${key}.jpg`)}&w=384&q=70`} alt={key} loading="lazy" />
            <span className="no">{String(i + 1).padStart(3, '0')}</span>
            <button className="mv" onClick={(e) => { e.stopPropagation(); move(key, tier === 'tier1' ? 'tier2' : 'tier1', tier === 'tier1' ? 0 : lists.tier1.length); }}>
              {tier === 'tier1' ? '→ Tier 2' : '→ Tier 1'}
            </button>
          </div>
          <div className="cap" title={key}>{key}</div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="te">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <h1>Arrange photos</h1>
      <p className="lead">
        Drag photos to reorder them, or drag between Tier 1 (on the homepage) and Tier 2 (backup). You can also click a photo and move it with <kbd>←</kbd> <kbd>→</kbd>, or send it to the start or end with <kbd>Home</kbd> / <kbd>End</kbd>. Press <b>Save</b> to write the order to <code>data/portfolio-tiers.json</code>. This page only works while the site runs locally. <a href="/" target="_blank" rel="noreferrer">Open homepage</a>
      </p>
      <section><h2>Tier 1 <small>Homepage · {lists.tier1.length}</small></h2>{grid('tier1')}</section>
      <section><h2>Tier 2 <small>Backup · {lists.tier2.length}</small></h2>{grid('tier2')}</section>
      <div className="bar">
        <span className={'status ' + (dirty ? 'dirty' : status.kind)}>{dirty ? 'Unsaved changes.' : status.text}</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="b ghost" disabled={!dirty || busy} onClick={() => { setLists(saved); setStatus({ text: 'Changes discarded.', kind: '' }); }}>Discard changes</button>
          <button className="b" disabled={!dirty || busy} onClick={save}>{busy ? 'Saving…' : 'Save'}</button>
        </div>
      </div>
    </div>
  );
}
