'use client';

import React, { useState } from 'react';

// ── PLANNED GRID ─────────────────────────────────────────────────────────────
// Curated 2026-08 from the full portfolio (data/shoots.ts), sequenced for IG's
// 3:4 portrait grid. Index 0 = newest = top-left; post #30 first, #1 last.
//
// Design system:
// - First screen (rows 1–4) carries the whole pitch: sunset gold / night /
//   turquoise water in row 1, then sparkle, white, color-block, jungle, pink,
//   a male subject, and a night close-up — full tonal + geographic range.
// - Right rail leans inward: every right-column subject faces or moves left,
//   into the grid. Left column mirrors where possible.
// - Dark frames land at 2, 7, 12, 21, 27 — never touching, each surrounded by
//   light neighbors so they pop like rests in a bar.
// - Turquoise (the signature hue) sweeps a long diagonal: top-right (3) →
//   center (14) → bottom-left teal doors (28).
// - Scale rhythm per row: mix of close-up / full-body / environmental, no row
//   with three frames at the same distance.
// - Two no-face breathers (sea lions 23, Photoautomat 29) rest the eye deep in
//   the grid; 23+26 stack as a deliberate Dunedin coastal pair (ENV → FULL).
// - Grid closes environmental + documentary (teal doors, photo booth, dog) so
//   deep scrollers hit charm, not filler.
type PlannedPost = { src: string; shoot: string; loc: string };

const planned: PlannedPost[] = [
  // Row 1 — thesis: gold dusk / night face / turquoise water
  { src: 'aidanto-r2-009-3.jpg', shoot: 'Indy', loc: 'Dunedin' },
  { src: '000043-5.jpg', shoot: 'Sasha', loc: 'Bangkok' },
  { src: 'merasa-jewelry-04.jpg', shoot: 'Merasa Jewelry', loc: 'Bali' },
  // Row 2 — sparkle / airy white / blue-on-yellow color block
  { src: 'r1-05454-0002.jpg', shoot: 'Hana', loc: 'Bratislava' },
  { src: '000048750031.jpg', shoot: 'Ellie', loc: 'Tokyo' },
  { src: '000008.jpg', shoot: 'Francisca', loc: 'Cascais' },
  // Row 3 — jungle dark / pink street / male subject
  { src: '000021-2.jpg', shoot: 'Althea', loc: 'Bali' },
  { src: '000044-9.jpg', shoot: 'Kristin', loc: 'Da Nang' },
  { src: '000049660026.jpg', shoot: 'Rin', loc: 'Tokyo' },
  // Row 4 — cream warmth / green jersey / night blue close-up
  { src: '000027-3.jpg', shoot: 'Paula', loc: 'Sitges' },
  { src: '000049740018.jpg', shoot: 'Sumika', loc: 'Tokyo' },
  { src: '13.jpg', shoot: 'Ly Gia Han', loc: 'Saigon' },
  // Row 5 — red / turquoise echo / documentary profile
  { src: '000009-3.jpg', shoot: 'Greta', loc: 'Venice' },
  { src: 'merasa-jewelry-15.jpg', shoot: 'Merasa Jewelry', loc: 'Bali' },
  { src: 'aidantorre000577-000012.jpg', shoot: 'Kiritokia', loc: 'Rotorua' },
  // Row 6 — pink sweep / green slip / brick crochet
  { src: 'r1-05461-0009.jpg', shoot: 'Hana', loc: 'Bratislava' },
  { src: '000012-3.jpg', shoot: 'Mary', loc: 'Warsaw' },
  { src: '000027-5.jpg', shoot: 'Minka', loc: 'Ghent' },
  // Row 7 — coracle sea / warm skin close-up / dark pop
  { src: '000038-10.jpg', shoot: 'Kristin', loc: 'Da Nang' },
  { src: '000008-7.jpg', shoot: 'Daniela', loc: 'Rome' },
  { src: '000033-7.jpg', shoot: 'Yana', loc: 'Krakow' },
  // Row 8 — dark lace / sea-lion breather / mural pop
  { src: '000012-5.jpg', shoot: 'Silvia', loc: 'Milan' },
  { src: 'aidanto-r2-015-6.jpg', shoot: 'Indy (sea lion)', loc: 'Dunedin' },
  { src: '000046-4.jpg', shoot: 'Pharima', loc: 'Bangkok' },
  // Row 9 — garden bench / surf white (Dunedin pair) / B&W flame
  { src: '000041.jpg', shoot: 'Tess', loc: 'Glasgow' },
  { src: 'aidanto-r4-047-22.jpg', shoot: 'Indy', loc: 'Dunedin' },
  { src: '000004.jpg', shoot: 'Ly Gia Han', loc: 'Saigon' },
  // Row 10 — teal doors / Photoautomat / dog sign-off
  { src: '000040-4.jpg', shoot: 'Kiki', loc: 'Bangkok' },
  { src: '000015-2.jpg', shoot: 'Paris', loc: 'Berlin' },
  { src: '000036.jpg', shoot: 'Soph', loc: 'Vienna' },
];

// ── PREVIOUS PLAN (kept for comparison) ──────────────────────────────────────
// The earlier Manila-branded sequence. Most of these are the same portfolio
// frames under manila-gallery-* filenames.
const previous: PlannedPost[] = [
  { src: 'manila-gallery-night-001.jpg', shoot: 'Manila set', loc: '' },
  { src: 'manila-gallery-garden-001.jpg', shoot: 'Manila set', loc: '' },
  { src: 'manila-gallery-urban-001.jpg', shoot: 'Manila set', loc: '' },
  { src: 'manila-gallery-closeup-001.jpg', shoot: 'Manila set', loc: '' },
  { src: 'manila-gallery-dsc-0075.jpg', shoot: 'Manila set', loc: '' },
  { src: 'manila-gallery-canal-001.jpg', shoot: 'Manila set', loc: '' },
  { src: 'manila-gallery-ivy-001.jpg', shoot: 'Manila set', loc: '' },
  { src: 'manila-gallery-shadow-001.jpg', shoot: 'Manila set', loc: '' },
  { src: 'manila-gallery-street-001.jpg', shoot: 'Manila set', loc: '' },
  { src: 'manila-gallery-tropical-001.jpg', shoot: 'Manila set', loc: '' },
  { src: 'manila-gallery-dsc-0130.jpg', shoot: 'Manila set', loc: '' },
  { src: 'manila-gallery-statue-001.jpg', shoot: 'Manila set', loc: '' },
  { src: 'manila-gallery-night-002.jpg', shoot: 'Manila set', loc: '' },
  { src: 'manila-gallery-floor-001.jpg', shoot: 'Manila set', loc: '' },
  { src: 'manila-gallery-market-001.jpg', shoot: 'Manila set', loc: '' },
  { src: 'manila-gallery-park-001.jpg', shoot: 'Manila set', loc: '' },
  { src: 'manila-gallery-ivy-002.jpg', shoot: 'Manila set', loc: '' },
  { src: 'manila-gallery-canal-002.jpg', shoot: 'Manila set', loc: '' },
  { src: 'manila-gallery-dsc-0190.jpg', shoot: 'Manila set', loc: '' },
  { src: 'manila-gallery-garden-002.jpg', shoot: 'Manila set', loc: '' },
  { src: 'manila-gallery-white-001.jpg', shoot: 'Manila set', loc: '' },
  { src: 'manila-gallery-urban-002.jpg', shoot: 'Manila set', loc: '' },
  { src: 'manila-gallery-night-003.jpg', shoot: 'Manila set', loc: '' },
  { src: 'manila-gallery-dsc-0911.jpg', shoot: 'Manila set', loc: '' },
  { src: 'manila-gallery-urban-003.jpg', shoot: 'Manila set', loc: '' },
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

  .ig-controls {
    display: flex;
    gap: 6px;
    margin-top: 14px;
  }

  .ig-btn {
    flex: 1;
    padding: 7px 0;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    text-align: center;
    cursor: pointer;
    border: none;
  }

  .ig-btn-primary {
    background: #0095f6;
    color: #fff;
  }

  .ig-btn-secondary {
    background: #efefef;
    color: #262626;
  }

  .ig-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2px;
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
    padding: 20px 16px 8px;
    font-size: 12px;
    color: #8e8e8e;
    letter-spacing: 0.05em;
  }
`;

export default function IGGridPage() {
  const [view, setView] = useState<'planned' | 'previous'>('planned');
  const [showLabels, setShowLabels] = useState(true);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [plannedPosts, setPlannedPosts] = useState(planned);

  const posts = view === 'planned' ? plannedPosts : previous;

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
          <div className="ig-controls">
            <button
              className={`ig-btn ${view === 'planned' ? 'ig-btn-primary' : 'ig-btn-secondary'}`}
              onClick={() => setView('planned')}
            >
              Planned grid
            </button>
            <button
              className={`ig-btn ${view === 'previous' ? 'ig-btn-primary' : 'ig-btn-secondary'}`}
              onClick={() => setView('previous')}
            >
              Previous plan
            </button>
            <button
              className="ig-btn ig-btn-secondary"
              onClick={() => setShowLabels(v => !v)}
            >
              {showLabels ? 'Hide labels' : 'Show labels'}
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="ig-grid">
          <div className="ig-grid-label">
            {view === 'planned'
              ? `PLANNED — ${plannedPosts.length} POSTS, #1 POSTS LAST (drag to reorder)`
              : `PREVIOUS PLAN — ${previous.length} POSTS`}
          </div>
          {posts.map((post, i) => (
            <div
              className="ig-grid-item"
              key={`${view}-${post.src}`}
              draggable={view === 'planned'}
              onDragStart={() => setDragIdx(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (view !== 'planned' || dragIdx === null || dragIdx === i) return;
                const updated = [...plannedPosts];
                const [moved] = updated.splice(dragIdx, 1);
                updated.splice(i, 0, moved);
                setPlannedPosts(updated);
                setDragIdx(null);
              }}
            >
              {view === 'planned' && <span className="ig-order-badge">{i + 1}</span>}
              <img
                src={`/images/large/${post.src}`}
                alt={`${post.shoot}${post.loc ? `, ${post.loc}` : ''}`}
                loading="lazy"
              />
              {showLabels && (
                <span className="ig-cell-label">
                  {post.shoot}
                  {post.loc ? ` · ${post.loc}` : ''}
                  <br />
                  {post.src}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
