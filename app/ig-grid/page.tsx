'use client';

import React, { useState } from 'react';

// ── FRAME METADATA ───────────────────────────────────────────────────────────
// filename (no extension) → [subject, city]. Shown as cell labels so each
// frame can be found in /images/large when posting.
const META: Record<string, [string, string]> = {
  '000002': ['Greta', 'Venice'],
  '000004': ['Ly Gia Han', 'Saigon'],
  '000008': ['Francisca', 'Cascais'],
  '000008-7': ['Daniela', 'Rome'],
  '000009-3': ['Greta', 'Venice'],
  '000012-3': ['Mary', 'Warsaw'],
  '000012-5': ['Silvia', 'Milan'],
  '000013': ['Francisca', 'Cascais'],
  '000015-2': ['Paris', 'Berlin'],
  '000016-2': ['Paris', 'Berlin'],
  '000016-3': ['Mary', 'Warsaw'],
  '000020-2': ['Althea', 'Bali'],
  '000021-2': ['Althea', 'Bali'],
  '000022-2': ['Althea', 'Bali'],
  '000023': ['Francisca', 'Cascais'],
  '000024-7': ['Maria', 'Rome'],
  '000026-3': ['Paula', 'Sitges'],
  '000026-6': ['Silvia', 'Milan'],
  '000027-3': ['Paula', 'Sitges'],
  '000027-5': ['Minka', 'Ghent'],
  '000030-5': ['Paula', 'Sitges'],
  '000031-6': ['Maria', 'Rome'],
  '000031-7': ['Greta', 'Venice'],
  '000032': ['Soph', 'Vienna'],
  '000032-4': ['Minka', 'Ghent'],
  '000033-7': ['Yana', 'Krakow'],
  '000034-7': ['Francisca', 'Cascais'],
  '000036': ['Soph', 'Vienna'],
  '000038-10': ['Kristin', 'Da Nang'],
  '000038-9': ['Daniela', 'Rome'],
  '000039': ['Soph', 'Vienna'],
  '000039-2': ['Linda', 'Vienna'],
  '000039-6': ['Maria', 'Rome'],
  '000039-7': ['Yana', 'Krakow'],
  '000040-4': ['Kiki', 'Bangkok'],
  '000041': ['Tess', 'Glasgow'],
  '000043-5': ['Sasha', 'Bangkok'],
  '000044-9': ['Kristin', 'Da Nang'],
  '000046-4': ['Pharima', 'Bangkok'],
  '000048-5': ['Pharima', 'Bangkok'],
  '000048750031': ['Ellie', 'Tokyo'],
  '000048780005': ['Ellie', 'Tokyo'],
  '000048780008': ['Ellie', 'Tokyo'],
  '000049660026': ['Rin', 'Tokyo'],
  '000049690025': ['Sumika', 'Tokyo'],
  '000049740018': ['Sumika', 'Tokyo'],
  '000049820005': ['Rin', 'Tokyo'],
  '000050-4': ['Pharima', 'Bangkok'],
  '000053-5': ['Sasha', 'Bangkok'],
  '000059-4': ['Kiki', 'Bangkok'],
  '000063': ['Kristin', 'Da Nang'],
  '000065-5': ['Sasha', 'Bangkok'],
  '000070-8': ['Kristin', 'Da Nang'],
  '000071': ['Tess', 'Glasgow'],
  '000197130004': ['Kiki', 'Bangkok'],
  '000197130012': ['Kiki', 'Bangkok'],
  '13': ['Ly Gia Han', 'Saigon'],
  '6': ['Ly Gia Han', 'Saigon'],
  'aidanto-r2-009-3': ['Indy', 'Dunedin'],
  'aidanto-r2-011-4': ['Indy', 'Dunedin'],
  'aidanto-r2-015-6': ['Indy', 'Dunedin'],
  'aidanto-r4-047-22': ['Indy', 'Dunedin'],
  'aidanto-r4-051-24': ['Indy', 'Dunedin'],
  'aidantorre000577-000012': ['Kiritokia', 'Rotorua'],
  'aidantorre000579-000008': ['Kiritokia', 'Rotorua'],
  'aidantorre000579-000029': ['Kiritokia', 'Rotorua'],
  'aidantorre000579-000032': ['Kiritokia', 'Rotorua'],
  'bc-0829-aidantorrence0488-015': ['Mary', 'Warsaw'],
  'bc-0829-aidantorrence0488-016': ['Mary', 'Warsaw'],
  'merasa-jewelry-02': ['Merasa Jewelry', 'Bali'],
  'merasa-jewelry-04': ['Merasa Jewelry', 'Bali'],
  'merasa-jewelry-12': ['Merasa Jewelry', 'Bali'],
  'merasa-jewelry-15': ['Merasa Jewelry', 'Bali'],
  'r1-05454-0002': ['Hana', 'Bratislava'],
  'r1-05454-0007': ['Hana', 'Bratislava'],
  'r1-05461-0009': ['Hana', 'Bratislava'],
};

// ── 10 GRID VARIATIONS ───────────────────────────────────────────────────────
// All sequenced for IG's 3:4 portrait grid, index 0 = newest = top-left.
// Each variation is a distinct curatorial concept, not a shuffle. All frames
// pulled from the full portfolio after reviewing every gallery at 3:4 crops.
type Variation = { key: string; title: string; note: string; files: string[] };

const VARIATIONS: Variation[] = [
  {
    key: 'v1',
    title: '1 · Light Range',
    note:
      'Signature sequence. Row 1 states the thesis (gold dusk / night / turquoise). ' +
      'Darks at 2,7,12,21,27 never touch; turquoise sweeps a diagonal 3→14→28; ' +
      'right column always faces into the grid.',
    files: ['aidanto-r2-009-3','000043-5','merasa-jewelry-04','r1-05454-0002','000048750031','000008','000021-2','000044-9','000049660026','000027-3','000049740018','13','000009-3','merasa-jewelry-15','aidantorre000577-000012','r1-05461-0009','000012-3','000027-5','000038-10','000008-7','000033-7','000012-5','aidanto-r2-015-6','000046-4','000041','aidanto-r4-047-22','000004','000040-4','000015-2','000036'],
  },
  {
    key: 'v2',
    title: '2 · Color Chapters',
    note:
      'The grid as one continuous gradient, read top to bottom: aqua → white → ' +
      'warm gold → red → pink → magenta → green → jungle → night → black. ' +
      'Scrolling the profile feels like turning lookbook chapters.',
    files: ['merasa-jewelry-04','000013','merasa-jewelry-15','aidanto-r4-047-22','000038-10','000048750031','000048780005','000027-3','aidanto-r2-009-3','000008-7','merasa-jewelry-02','000027-5','000009-3','000053-5','000015-2','000044-9','r1-05461-0009','000071','000030-5','000012-3','000049740018','000041','000038-9','000021-2','13','000033-7','000197130012','000004','000049820005','6'],
  },
  {
    key: 'v3',
    title: '3 · Checkerboard',
    note:
      'Strict light/dark alternation cell by cell — every dark frame is boxed by ' +
      'light neighbors and vice versa. Maximum pop per image; the grid reads as ' +
      'a woven pattern from a distance.',
    files: ['merasa-jewelry-04','000043-5','000048750031','13','000008','000033-7','aidanto-r2-009-3','000049660026','000044-9','000021-2','000027-3','000197130012','merasa-jewelry-15','000016-3','r1-05461-0009','000012-5','aidanto-r2-015-6','000004','000027-5','000016-2','000039-2','000049820005','000012-3','6','aidanto-r4-047-22','000039-7','000041','000040-4','000009-3','bc-0829-aidantorrence0488-015'],
  },
  {
    key: 'v4',
    title: '4 · Portrait Spine',
    note:
      'The center column is ten consecutive eye-contact portraits — a spine of ' +
      'faces running the full grid — while the rails carry full-body and ' +
      'environmental frames. Strong connection-forward first impression.',
    files: ['aidanto-r2-009-3','000043-5','merasa-jewelry-04','r1-05454-0002','000012-5','000008','000021-2','000016-3','000049660026','000027-3','aidantorre000579-000029','000049740018','000009-3','merasa-jewelry-02','000044-9','r1-05461-0009','13','000027-5','000038-10','000023','merasa-jewelry-15','000041','000024-7','aidanto-r2-015-6','000040-4','000049690025','aidanto-r4-047-22','000015-2','000033-7','000036'],
  },
  {
    key: 'v5',
    title: '5 · Travelogue',
    note:
      'Every row is one location told in three frames: Bali pool, Dunedin coast, ' +
      'Da Nang, Venice, Tokyo, Saigon night, Bangkok, Bratislava, Rotorua, ' +
      'Cascais. The grid reads as chapters of a travel photobook.',
    files: ['merasa-jewelry-04','merasa-jewelry-02','merasa-jewelry-15','aidanto-r2-009-3','aidanto-r4-047-22','aidanto-r2-015-6','000044-9','000038-10','000070-8','000009-3','000002','000031-7','000049660026','000049740018','000048750031','13','000004','6','000053-5','000046-4','000040-4','r1-05454-0002','r1-05461-0009','r1-05454-0007','aidantorre000577-000012','aidantorre000579-000029','aidantorre000579-000008','000008','000013','000023'],
  },
  {
    key: 'v6',
    title: '6 · Editorial Minimal',
    note:
      '21 posts only — the most negative-space, muted frames in the archive. ' +
      'Water, sand, white rooms, B&W. Reads as a high-fashion book; strongest ' +
      'if the goal is brand/agency work over volume.',
    files: ['merasa-jewelry-04','000048750031','aidanto-r2-015-6','aidanto-r4-047-22','000043-5','merasa-jewelry-15','000039-2','000004','aidanto-r2-009-3','000048780008','000023','000038-10','bc-0829-aidantorrence0488-015','000026-3','merasa-jewelry-12','000048780005','000049660026','000013','000197130012','000027-3','aidanto-r2-011-4'],
  },
  {
    key: 'v7',
    title: '7 · Color Cascade',
    note:
      'A muted neutral field with ten saturated frames cascading down a strict ' +
      'zigzag lattice (left rail odd rows, right rail even rows) — no two pops ' +
      'ever touch. The eye bounces down the grid like a pinball.',
    files: ['merasa-jewelry-04','000043-5','000048750031','000049660026','aidanto-r2-015-6','000008','000044-9','000012-5','aidanto-r4-047-22','000027-5','bc-0829-aidantorrence0488-015','000009-3','r1-05461-0009','000039-2','aidantorre000577-000012','000033-7','000034-7','000046-4','000030-5','000065-5','000004','aidanto-r4-051-24','000197130012','000020-2','000015-2','000026-6','000039-7','000049820005','000048780008','000071'],
  },
  {
    key: 'v8',
    title: '8 · Warm→Cool Rails',
    note:
      'A horizontal temperature gradient: left column all warm (gold, skin, ' +
      'brick, red), center column green/transitional, right column all cool ' +
      '(turquoise, sea, night). Reads as one continuous color field.',
    files: ['aidanto-r2-009-3','000049740018','merasa-jewelry-04','000027-3','000012-3','000008','000008-7','000041','aidanto-r4-047-22','000027-5','000012-5','merasa-jewelry-15','000009-3','000038-9','000038-10','merasa-jewelry-02','000021-2','000013','000036','000049690025','13','000053-5','000039-2','000040-4','000026-3','000032','aidanto-r2-015-6','000020-2','000016-3','r1-05454-0002'],
  },
  {
    key: 'v9',
    title: '9 · Street & Story',
    note:
      'Documentary DNA up front: the dog, the motorbike man, the Photoautomat, ' +
      'market crates, sea lions, the archive-photograph frame from Rotorua — ' +
      'interleaved with fashion. Positions you as a photographer of places and ' +
      'people, not just portraits.',
    files: ['000036','000043-5','000070-8','r1-05454-0002','000015-2','000008','aidantorre000577-000012','000048750031','000050-4','aidanto-r2-015-6','13','r1-05461-0009','000059-4','merasa-jewelry-04','000049820005','000031-7','000012-3','000048-5','000021-2','aidantorre000579-000032','000027-3','000038-10','000033-7','000013','000049660026','000049740018','000004','000032-4','aidanto-r4-047-22','000040-4'],
  },
  {
    key: 'v10',
    title: '10 · Night Book',
    note:
      'Dark-dominant moody identity — night flash, vinyl, B&W temple, smoke — ' +
      'with a few jewels (turquoise, gold, red) as pops. The most opinionated ' +
      'and editorial of the ten; a rebrand rather than a cleanup.',
    files: ['13','merasa-jewelry-04','000033-7','000021-2','000049820005','000197130012','000043-5','000016-2','000016-3','6','aidanto-r2-009-3','000039-7','000040-4','000004','000012-5','000022-2','000009-3','bc-0829-aidantorrence0488-015','000049660026','000197130004','bc-0829-aidantorrence0488-016','000015-2','000031-6','000053-5','000046-4','000039-6','000063','000039','merasa-jewelry-12','000059-4'],
  },
];

// ── PREVIOUS PLAN (kept for comparison) ──────────────────────────────────────
// The earlier Manila-branded sequence; mostly the same portfolio frames under
// manila-gallery-* filenames.
const PREVIOUS: string[] = [
  'manila-gallery-night-001','manila-gallery-garden-001','manila-gallery-urban-001',
  'manila-gallery-closeup-001','manila-gallery-dsc-0075','manila-gallery-canal-001',
  'manila-gallery-ivy-001','manila-gallery-shadow-001','manila-gallery-street-001',
  'manila-gallery-tropical-001','manila-gallery-dsc-0130','manila-gallery-statue-001',
  'manila-gallery-night-002','manila-gallery-floor-001','manila-gallery-market-001',
  'manila-gallery-park-001','manila-gallery-ivy-002','manila-gallery-canal-002',
  'manila-gallery-dsc-0190','manila-gallery-garden-002','manila-gallery-white-001',
  'manila-gallery-urban-002','manila-gallery-night-003','manila-gallery-dsc-0911',
  'manila-gallery-urban-003',
];

const CSS = `
  body > header, body > footer, .fixed.inset-x-0.bottom-0 { display: none !important; }
  html, body {
    background: #fafafa !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow-x: hidden !important;
  }

  .ig-mock {
    max-width: 420px;
    margin: 0 auto;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    background: #fff;
    min-height: 100vh;
  }

  .ig-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    border-bottom: 1px solid #efefef;
    position: sticky;
    top: 0;
    background: #fff;
    z-index: 10;
  }

  .ig-header-logo {
    font-size: 22px;
    font-weight: 700;
    color: #262626;
    letter-spacing: -0.5px;
  }

  .ig-profile {
    display: flex;
    flex-direction: column;
    padding: 16px;
  }

  .ig-profile-top {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 12px;
  }

  .ig-avatar {
    width: 77px;
    height: 77px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #efefef;
  }

  .ig-stats {
    display: flex;
    gap: 20px;
    flex: 1;
    justify-content: center;
  }

  .ig-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .ig-stat-num {
    font-size: 16px;
    font-weight: 600;
    color: #262626;
  }

  .ig-stat-label {
    font-size: 13px;
    color: #8e8e8e;
  }

  .ig-name {
    font-size: 14px;
    font-weight: 600;
    color: #262626;
    margin: 0;
  }

  .ig-bio {
    font-size: 14px;
    color: #262626;
    margin: 2px 0 0;
    line-height: 1.4;
  }

  .ig-bio-link {
    color: #00376b;
    font-weight: 600;
  }

  .ig-var-row {
    display: flex;
    gap: 6px;
    margin-top: 14px;
    overflow-x: auto;
    padding-bottom: 4px;
    -webkit-overflow-scrolling: touch;
  }

  .ig-chip {
    flex: 0 0 auto;
    padding: 6px 12px;
    border-radius: 16px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid #dbdbdb;
    background: #fff;
    color: #262626;
    white-space: nowrap;
  }

  .ig-chip.active {
    background: #0095f6;
    border-color: #0095f6;
    color: #fff;
  }

  .ig-var-note {
    margin: 10px 0 0;
    font-size: 12.5px;
    line-height: 1.45;
    color: #555;
    background: #fafafa;
    border: 1px solid #efefef;
    border-radius: 8px;
    padding: 10px 12px;
  }

  .ig-toggles {
    display: flex;
    gap: 6px;
    margin-top: 10px;
  }

  .ig-btn {
    flex: 1;
    padding: 7px 0;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    text-align: center;
    cursor: pointer;
    border: none;
    background: #efefef;
    color: #262626;
  }

  .ig-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2px;
    margin-top: 12px;
  }

  .ig-grid-item {
    aspect-ratio: 3 / 4;
    overflow: hidden;
    cursor: grab;
    position: relative;
  }

  .ig-grid-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: opacity 0.15s;
  }

  .ig-grid-item:hover img {
    opacity: 0.85;
  }

  .ig-cell-label {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.62);
    color: #fff;
    font-size: 9px;
    line-height: 1.3;
    padding: 3px 4px;
    pointer-events: none;
  }

  .ig-order-badge {
    position: absolute;
    top: 4px;
    left: 4px;
    background: rgba(0,0,0,0.62);
    color: #fff;
    font-size: 10px;
    font-weight: 700;
    min-width: 18px;
    text-align: center;
    padding: 2px 3px;
    border-radius: 3px;
    z-index: 2;
    pointer-events: none;
  }

  .ig-grid-label {
    grid-column: 1 / -1;
    text-align: center;
    padding: 12px 16px 4px;
    font-size: 12px;
    color: #8e8e8e;
    letter-spacing: 0.05em;
  }
`;

export default function IGGridPage() {
  const [active, setActive] = useState('v1');
  const [showLabels, setShowLabels] = useState(true);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  // per-variation order overrides from drag-reordering
  const [orders, setOrders] = useState<Record<string, string[]>>({});

  const variation = VARIATIONS.find(v => v.key === active);
  const files = active === 'prev'
    ? PREVIOUS
    : orders[active] ?? variation!.files;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="ig-mock">
        {/* IG Header */}
        <div className="ig-header">
          <span className="ig-header-logo">Instagram</span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#262626">
            <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
          </svg>
        </div>

        {/* Profile section */}
        <div className="ig-profile">
          <div className="ig-profile-top">
            <img
              className="ig-avatar"
              src="/images/large/merasa-jewelry-02.jpg"
              alt="Profile"
            />
            <div className="ig-stats">
              <div className="ig-stat">
                <span className="ig-stat-num">847</span>
                <span className="ig-stat-label">posts</span>
              </div>
              <div className="ig-stat">
                <span className="ig-stat-num">12.4k</span>
                <span className="ig-stat-label">followers</span>
              </div>
              <div className="ig-stat">
                <span className="ig-stat-num">892</span>
                <span className="ig-stat-label">following</span>
              </div>
            </div>
          </div>
          <p className="ig-name">Aidan Torrence</p>
          <p className="ig-bio">
            Film Photographer<br />
            Editorial &middot; Portraits &middot; Worldwide<br />
            <span className="ig-bio-link">aidantorrence.com</span>
          </p>

          {/* Variation picker */}
          <div className="ig-var-row">
            {VARIATIONS.map(v => (
              <button
                key={v.key}
                className={`ig-chip ${active === v.key ? 'active' : ''}`}
                onClick={() => setActive(v.key)}
              >
                {v.title}
              </button>
            ))}
            <button
              className={`ig-chip ${active === 'prev' ? 'active' : ''}`}
              onClick={() => setActive('prev')}
            >
              Previous plan
            </button>
          </div>

          {variation && active !== 'prev' && (
            <p className="ig-var-note">{variation.note}</p>
          )}

          <div className="ig-toggles">
            <button className="ig-btn" onClick={() => setShowLabels(v => !v)}>
              {showLabels ? 'Hide labels' : 'Show labels'}
            </button>
            {orders[active] && (
              <button
                className="ig-btn"
                onClick={() =>
                  setOrders(({ [active]: _drop, ...rest }) => rest)
                }
              >
                Reset order
              </button>
            )}
          </div>
        </div>

        {/* Grid */}
        <div className="ig-grid">
          <div className="ig-grid-label">
            {active === 'prev'
              ? `PREVIOUS PLAN — ${files.length} POSTS`
              : `${files.length} POSTS — #1 POSTS LAST (drag to reorder)`}
          </div>
          {files.map((f, i) => {
            const meta = META[f];
            return (
              <div
                className="ig-grid-item"
                key={`${active}-${f}`}
                draggable={active !== 'prev'}
                onDragStart={() => setDragIdx(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (active === 'prev' || dragIdx === null || dragIdx === i) return;
                  const updated = [...files];
                  const [moved] = updated.splice(dragIdx, 1);
                  updated.splice(i, 0, moved);
                  setOrders(o => ({ ...o, [active]: updated }));
                  setDragIdx(null);
                }}
              >
                {active !== 'prev' && (
                  <span className="ig-order-badge">{i + 1}</span>
                )}
                <img
                  src={`/images/large/${f}.jpg`}
                  alt={meta ? `${meta[0]}, ${meta[1]}` : f}
                  loading="lazy"
                />
                {showLabels && (
                  <span className="ig-cell-label">
                    {meta ? `${meta[0]} · ${meta[1]}` : 'Manila set'}
                    <br />
                    {f}.jpg
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
