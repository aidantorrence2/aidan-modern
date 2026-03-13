'use client';

import React, { useState } from 'react';

// Grid posts in posting order (newest first = top-left)
// Curated for color/tone alternation to create a cohesive grid
const posts = [
  { src: 'manila-gallery-night-001.jpg', type: 'post' },
  { src: 'manila-gallery-garden-001.jpg', type: 'post' },
  { src: 'manila-gallery-urban-001.jpg', type: 'post' },
  { src: 'manila-gallery-closeup-001.jpg', type: 'post' },
  { src: 'manila-gallery-dsc-0075.jpg', type: 'post' },
  { src: 'manila-gallery-canal-001.jpg', type: 'post' },
  { src: 'manila-gallery-ivy-001.jpg', type: 'post' },
  { src: 'manila-gallery-shadow-001.jpg', type: 'post' },
  { src: 'manila-gallery-street-001.jpg', type: 'post' },
  { src: 'manila-gallery-tropical-001.jpg', type: 'post' },
  { src: 'manila-gallery-dsc-0130.jpg', type: 'post' },
  { src: 'manila-gallery-statue-001.jpg', type: 'post' },
  { src: 'manila-gallery-night-002.jpg', type: 'post' },
  { src: 'manila-gallery-floor-001.jpg', type: 'post' },
  { src: 'manila-gallery-market-001.jpg', type: 'post' },
  { src: 'manila-gallery-park-001.jpg', type: 'post' },
  { src: 'manila-gallery-ivy-002.jpg', type: 'post' },
  { src: 'manila-gallery-canal-002.jpg', type: 'post' },
  { src: 'manila-gallery-dsc-0190.jpg', type: 'post' },
  { src: 'manila-gallery-garden-002.jpg', type: 'post' },
  { src: 'manila-gallery-white-001.jpg', type: 'post' },
  { src: 'manila-gallery-urban-002.jpg', type: 'post' },
  { src: 'manila-gallery-night-003.jpg', type: 'post' },
  { src: 'manila-gallery-dsc-0911.jpg', type: 'post' },
  { src: 'manila-gallery-urban-003.jpg', type: 'post' },
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
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
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

  .ig-buttons {
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

  .ig-tabs {
    display: flex;
    border-top: 1px solid #efefef;
    margin-top: 16px;
  }

  .ig-tab {
    flex: 1;
    display: flex;
    justify-content: center;
    padding: 12px 0;
    cursor: pointer;
    border-top: 1px solid transparent;
    margin-top: -1px;
  }

  .ig-tab.active {
    border-top-color: #262626;
  }

  .ig-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2px;
  }

  .ig-grid-item {
    aspect-ratio: 1;
    overflow: hidden;
    cursor: pointer;
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

  .ig-grid-new {
    position: relative;
  }

  .ig-new-badge {
    position: absolute;
    top: 6px;
    right: 6px;
    background: #0095f6;
    color: #fff;
    font-size: 9px;
    font-weight: 700;
    padding: 2px 5px;
    border-radius: 3px;
    z-index: 2;
    letter-spacing: 0.03em;
  }

  .ig-row-label {
    grid-column: 1 / -1;
    padding: 8px 4px 4px;
    font-size: 11px;
    color: #8e8e8e;
    font-weight: 500;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .ig-divider {
    grid-column: 1 / -1;
    height: 1px;
    background: #efefef;
    margin: 4px 0;
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
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [gridPosts, setGridPosts] = useState(posts);

  const newPosts = gridPosts.slice(0, 9);
  const existingPosts = gridPosts.slice(9);

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
              src="/images/large/manila-gallery-dsc-0075.jpg"
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
          <div className="ig-buttons">
            <button className="ig-btn ig-btn-primary">Follow</button>
            <button className="ig-btn ig-btn-secondary">Message</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="ig-tabs">
          <div className="ig-tab active">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#262626">
              <rect x="2" y="2" width="9" height="9" rx="1" />
              <rect x="13" y="2" width="9" height="9" rx="1" />
              <rect x="2" y="13" width="9" height="9" rx="1" />
              <rect x="13" y="13" width="9" height="9" rx="1" />
            </svg>
          </div>
          <div className="ig-tab">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#8e8e8e">
              <path d="M12 2a1 1 0 011 1v8h8a1 1 0 010 2h-8v8a1 1 0 01-2 0v-8H3a1 1 0 010-2h8V3a1 1 0 011-1z" />
            </svg>
          </div>
        </div>

        {/* Grid */}
        <div className="ig-grid">
          <div className="ig-grid-label">NEW POSTS (drag to reorder)</div>
          {newPosts.map((post, i) => (
            <div
              className="ig-grid-item ig-grid-new"
              key={`new-${i}`}
              draggable
              onDragStart={() => setDragIdx(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIdx === null || dragIdx === i) return;
                const updated = [...gridPosts];
                const [moved] = updated.splice(dragIdx, 1);
                updated.splice(i, 0, moved);
                setGridPosts(updated);
                setDragIdx(null);
              }}
            >
              <span className="ig-new-badge">NEW</span>
              <img
                src={`/images/large/${post.src}`}
                alt={`Post ${i + 1}`}
              />
            </div>
          ))}

          <div className="ig-divider" />
          <div className="ig-grid-label">EXISTING POSTS</div>

          {existingPosts.map((post, i) => (
            <div className="ig-grid-item" key={`existing-${i}`}>
              <img
                src={`/images/large/${post.src}`}
                alt={`Existing post ${i + 1}`}
                style={{ opacity: 0.7 }}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
