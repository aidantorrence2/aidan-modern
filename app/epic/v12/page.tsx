'use client';

import React, { useState } from 'react';

const images = [
  'manila-gallery-street-001.jpg',
  'manila-gallery-night-001.jpg',
  'manila-gallery-dsc-0075.jpg',
  'manila-gallery-urban-001.jpg',
  'manila-gallery-canal-001.jpg',
  'manila-gallery-garden-001.jpg',
  'manila-gallery-closeup-001.jpg',
  'manila-gallery-shadow-001.jpg',
  'manila-gallery-dsc-0130.jpg',
  'manila-gallery-night-002.jpg',
  'manila-gallery-tropical-001.jpg',
  'manila-gallery-ivy-001.jpg',
  'manila-gallery-market-001.jpg',
  'manila-gallery-park-001.jpg',
  'manila-gallery-urban-002.jpg',
  'manila-gallery-dsc-0190.jpg',
  'manila-gallery-floor-001.jpg',
  'manila-gallery-statue-001.jpg',
  'manila-gallery-night-003.jpg',
  'manila-gallery-white-001.jpg',
  'manila-gallery-garden-002.jpg',
  'manila-gallery-canal-002.jpg',
  'manila-gallery-ivy-002.jpg',
  'manila-gallery-urban-003.jpg',
  'manila-gallery-dsc-0911.jpg',
];

const CSS = `
  body > header, body > footer, .fixed.inset-x-0.bottom-0 { display: none !important; }
  html, body { background: #1a1714 !important; margin: 0; padding: 0; }
  * { box-sizing: border-box; }

  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;700&display=swap');

  .contact-sheet {
    font-family: 'IBM Plex Mono', monospace;
    max-width: 100%;
    padding: 0;
  }

  .film-header {
    padding: 20px 16px 16px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }

  .film-header .lab-stamp {
    font-size: 11px;
    font-weight: 700;
    color: #d4a045;
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }

  .film-header h1 {
    font-family: 'IBM Plex Mono', monospace;
    font-size: clamp(24px, 6vw, 40px);
    font-weight: 700;
    color: #e8e0d4;
    margin: 8px 0 4px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .film-header .meta {
    font-size: 10px;
    color: #8a7e6e;
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }

  .sheet-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0;
    position: relative;
  }

  @media (min-width: 600px) {
    .sheet-grid { grid-template-columns: 1fr 1fr 1fr; }
  }

  .frame {
    position: relative;
    background: #0d0b09;
    border: 1px solid #2a2520;
    cursor: pointer;
    overflow: hidden;
  }

  .frame-inner {
    position: relative;
    padding: 6px;
  }

  .frame img {
    width: 100%;
    aspect-ratio: 3/4;
    object-fit: cover;
    display: block;
    filter: contrast(1.05) saturate(0.95);
    transition: filter 0.3s;
  }

  .frame:hover img, .frame:active img {
    filter: contrast(1.1) saturate(1.05);
  }

  .frame-number {
    position: absolute;
    bottom: 8px;
    right: 10px;
    font-size: 9px;
    font-weight: 500;
    color: #d4a045;
    opacity: 0.7;
    letter-spacing: 0.1em;
    z-index: 2;
  }

  .rebate-top, .rebate-bottom {
    height: 18px;
    background: linear-gradient(90deg, #2a1f0f 0%, #3a2a12 20%, #2a1f0f 100%);
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 8px;
  }

  .rebate-top span, .rebate-bottom span {
    font-size: 7px;
    color: #d4a045;
    opacity: 0.5;
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }

  /* Sprocket holes */
  .sprocket-strip {
    position: fixed;
    top: 0;
    bottom: 0;
    width: 20px;
    background: #0d0b09;
    z-index: 50;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    padding-top: 10px;
    overflow: hidden;
  }

  .sprocket-strip.left { left: 0; }
  .sprocket-strip.right { right: 0; }

  .sprocket-hole {
    width: 10px;
    height: 14px;
    border-radius: 2px;
    background: #1a1714;
    border: 1px solid #2a2520;
    flex-shrink: 0;
  }

  .sheet-body {
    margin: 0 20px;
  }

  /* Expanded/lightbox */
  .lightbox-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.92);
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    cursor: pointer;
    animation: lbFade 0.2s ease;
  }

  .lightbox-overlay img {
    max-width: 100%;
    max-height: 90vh;
    object-fit: contain;
    border: 2px solid #2a2520;
  }

  .lightbox-frame-num {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    font-family: 'IBM Plex Mono', monospace;
    font-size: 12px;
    color: #d4a045;
    letter-spacing: 0.15em;
  }

  @keyframes lbFade {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .inquiry-strip {
    padding: 48px 24px;
    text-align: center;
    border-top: 1px solid rgba(255,255,255,0.06);
  }

  .inquiry-strip h2 {
    font-family: 'IBM Plex Mono', monospace;
    font-size: clamp(18px, 4vw, 28px);
    font-weight: 700;
    color: #e8e0d4;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin: 0 0 6px;
  }

  .inquiry-strip .loc {
    font-size: 10px;
    color: #8a7e6e;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    margin-bottom: 28px;
  }

  .inquiry-strip .inq-btn {
    display: inline-block;
    background: #d4a045;
    color: #1a1714;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 700;
    font-size: 12px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    padding: 13px 36px;
    border: none;
    cursor: pointer;
    text-decoration: none;
    transition: background 0.2s;
  }

  .inquiry-strip .inq-btn:hover {
    background: #e0b050;
  }

  .inquiry-strip .links {
    margin-top: 20px;
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    justify-content: center;
  }

  .inquiry-strip .links a {
    font-size: 11px;
    color: #8a7e6e;
    text-decoration: none;
    letter-spacing: 0.06em;
    transition: color 0.2s;
  }

  .inquiry-strip .links a:hover { color: #d4a045; }

  .inquiry-strip .feat {
    font-size: 9px;
    color: #5a5040;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    margin-top: 32px;
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .slide-up {
    animation: slideUp 0.5s ease forwards;
  }
`;

export default function V12FilmContactSheet() {
  const [expanded, setExpanded] = useState<number | null>(null);

  const sprockets = Array.from({ length: 60 }, (_, i) => i);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="contact-sheet">
        {/* Sprocket holes */}
        <div className="sprocket-strip left">
          {sprockets.map((i) => (
            <div key={i} className="sprocket-hole" />
          ))}
        </div>
        <div className="sprocket-strip right">
          {sprockets.map((i) => (
            <div key={i} className="sprocket-hole" />
          ))}
        </div>

        <div className="sheet-body">
          {/* Header */}
          <div className="film-header slide-up">
            <div className="lab-stamp">Film Lab &mdash; Proof Sheet</div>
            <h1>Aidan Torrence</h1>
            <div className="meta">
              Film &middot; Fashion &middot; Editorial &nbsp;|&nbsp; Roll 01 &mdash; {images.length} Frames
            </div>
          </div>

          {/* Rebate strip */}
          <div className="rebate-top">
            <span>Kodak Portra 400</span>
            <span>35mm</span>
          </div>

          {/* Contact sheet grid */}
          <div className="sheet-grid">
            {images.map((img, i) => (
              <div
                key={i}
                className="frame"
                onClick={() => setExpanded(i)}
                role="button"
                tabIndex={0}
                aria-label={`View frame ${String(i + 1).padStart(2, '0')}`}
                onKeyDown={(e) => e.key === 'Enter' && setExpanded(i)}
              >
                <div className="frame-inner">
                  <img
                    src={`/images/large/${img}`}
                    alt={`Frame ${String(i + 1).padStart(2, '0')}`}
                    loading={i < 4 ? 'eager' : 'lazy'}
                  />
                </div>
                <div className="frame-number">
                  {String(i + 1).padStart(2, '0')}
                </div>
                {/* Per-frame rebate */}
                {i % 2 === 0 && (
                  <div className="rebate-bottom">
                    <span>{String(i + 1).padStart(2, '0')}A</span>
                    <span>&rarr;</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Bottom rebate */}
          <div className="rebate-top">
            <span>End of Roll</span>
            <span>E-6 Process</span>
          </div>

          {/* Inquiry */}
          <div className="inquiry-strip">
            <h2>Book a Session</h2>
            <div className="loc">Bangkok &amp; Europe &middot; Worldwide</div>
            <a className="inq-btn" href="mailto:aidan@aidantorrence.com">
              Inquire
            </a>
            <div className="links">
              <a href="mailto:aidan@aidantorrence.com">aidan@aidantorrence.com</a>
              <a href="https://wa.me/491758966210">WhatsApp</a>
              <a href="https://instagram.com/aidantorrence" target="_blank" rel="noopener noreferrer">
                @aidantorrence
              </a>
            </div>
            <div className="feat">
              Vogue Italia &middot; Hypebeast &middot; WWD
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {expanded !== null && (
        <div
          className="lightbox-overlay"
          onClick={() => setExpanded(null)}
          role="dialog"
          aria-label="Expanded photo"
        >
          <img
            src={`/images/large/${images[expanded]}`}
            alt={`Frame ${String(expanded + 1).padStart(2, '0')} expanded`}
          />
          <div className="lightbox-frame-num">
            Frame {String(expanded + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
          </div>
        </div>
      )}
    </>
  );
}
