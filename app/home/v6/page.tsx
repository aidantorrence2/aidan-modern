'use client';

import React, { useEffect, useRef, useState } from 'react';

const images = [
  { src: 'manila-gallery-dsc-0075.jpg', name: 'Jill', city: 'Bali' },
  { src: 'manila-gallery-night-001.jpg', name: 'Dorahan', city: 'Tokyo' },
  { src: 'manila-gallery-garden-001.jpg', name: 'Sumika', city: 'Tokyo' },
  { src: 'manila-gallery-street-001.jpg', name: 'Soph', city: 'Vienna' },
  { src: 'manila-gallery-closeup-001.jpg', name: 'Jill', city: 'Bali' },
  { src: 'manila-gallery-canal-001.jpg', name: 'Hana', city: 'Bratislava' },
  { src: 'manila-gallery-ivy-001.jpg', name: 'Ellie', city: 'Tokyo' },
  { src: 'manila-gallery-urban-001.jpg', name: 'Yana', city: 'Warsaw' },
  { src: 'manila-gallery-dsc-0130.jpg', name: 'Jill', city: 'Bali' },
  { src: 'manila-gallery-shadow-001.jpg', name: 'Josephine', city: 'Bali' },
  { src: 'manila-gallery-tropical-001.jpg', name: 'Karima', city: 'Bali' },
  { src: 'manila-gallery-statue-001.jpg', name: 'Linda', city: 'Vienna' },
  { src: 'manila-gallery-night-002.jpg', name: 'Dorahan', city: 'HCMC' },
  { src: 'manila-gallery-market-001.jpg', name: 'Pharima', city: 'Bangkok' },
  { src: 'manila-gallery-park-001.jpg', name: 'Tess', city: 'Glasgow' },
  { src: 'manila-gallery-floor-001.jpg', name: 'Francisca', city: 'Cascais' },
  { src: 'manila-gallery-garden-002.jpg', name: 'Sumika', city: 'Tokyo' },
  { src: 'manila-gallery-urban-002.jpg', name: 'Yana', city: 'Warsaw' },
  { src: 'manila-gallery-dsc-0190.jpg', name: 'Dia', city: 'Bali' },
  { src: 'manila-gallery-ivy-002.jpg', name: 'Daniela', city: 'Rome' },
  { src: 'manila-gallery-canal-002.jpg', name: 'Greta', city: 'Venice' },
  { src: 'manila-gallery-night-003.jpg', name: 'Dorahan', city: 'HCMC' },
  { src: 'manila-gallery-urban-003.jpg', name: 'Yana', city: 'Warsaw' },
  { src: 'manila-gallery-white-001.jpg', name: 'Silvia', city: 'Milan' },
  { src: 'manila-gallery-dsc-0911.jpg', name: 'Zarissa', city: 'KL' },
];

const TOTAL = images.length;

const CSS = `
  body > header, body > footer, .fixed.inset-x-0.bottom-0 { display: none !important; }
  html, body {
    background: #0c0c0c !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow-x: hidden !important;
  }

  /* ── Nav ── */
  .v6-fixed-nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 16px 20px;
    pointer-events: none;
  }
  .v6-fixed-nav a {
    pointer-events: auto;
    color: rgba(255,255,255,0.6);
    text-decoration: none;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 12px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    transition: color 0.2s;
  }
  .v6-fixed-nav a:hover { color: #fff; }

  /* ── Counter ── */
  .v6-counter {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 100;
    color: rgba(255,255,255,0.5);
    font-family: 'SF Mono', 'Fira Code', 'Courier New', monospace;
    font-size: 13px;
    font-weight: 400;
    letter-spacing: 0.05em;
    background: rgba(0,0,0,0.5);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    padding: 8px 14px;
    border-radius: 16px;
    border: 1px solid rgba(255,255,255,0.08);
    transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
  }
  .v6-counter.v6-bump { transform: scale(1.1); }

  /* ── Progress ── */
  .v6-progress {
    position: fixed;
    top: 0;
    left: 0;
    height: 3px;
    background: linear-gradient(90deg, #fff 0%, rgba(255,255,255,0.5) 100%);
    z-index: 101;
    transition: width 0.3s ease;
  }

  /* ── Scroll cue ── */
  .v6-scroll-cue {
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 100;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    animation: v6-bounce 1.8s ease-in-out infinite;
    transition: opacity 0.5s;
  }
  @keyframes v6-bounce {
    0%, 100% { transform: translateX(-50%) translateY(0); }
    50% { transform: translateX(-50%) translateY(10px); }
  }

  /* ── Page title ── */
  .v6-page-title {
    color: rgba(255,255,255,0.5);
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 13px;
    font-weight: 400;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    text-align: center;
    margin: 0;
    padding: 90px 20px 10px;
  }

  /* ══════════════════════════════════════
     FILM STRIP
     ══════════════════════════════════════ */

  .film-strip {
    position: relative;
    width: 100%;
    max-width: 660px;
    margin: 0 auto;
    padding: 0 0 40px;
  }

  /* The continuous film base — dark charcoal with subtle texture */
  .film-strip::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 660px;
    height: 100%;
    background: #1a1a1a;
    border-left: 1px solid #2a2a2a;
    border-right: 1px solid #2a2a2a;
    z-index: 0;
    /* subtle film grain texture */
    background-image:
      repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.03) 1px, rgba(0,0,0,0.03) 2px);
  }

  /* ── Sprocket columns ── */
  .film-frame-wrapper {
    position: relative;
    z-index: 1;
    padding: 0 0;
  }

  /* Each film frame block */
  .film-frame {
    position: relative;
    padding: 20px 52px;
    opacity: 0;
    transform: translateY(40px);
    transition: opacity 0.7s ease, transform 0.7s ease;
  }
  .film-frame.v6-visible {
    opacity: 1;
    transform: translateY(0);
  }

  /* ── Sprocket holes — left side ── */
  .film-frame .sprocket-left,
  .film-frame .sprocket-right {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 36px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-evenly;
    z-index: 2;
    pointer-events: none;
  }
  .film-frame .sprocket-left { left: 4px; }
  .film-frame .sprocket-right { right: 4px; }

  .sprocket-hole {
    width: 14px;
    height: 20px;
    border-radius: 3px;
    background: #0c0c0c;
    border: 1px solid #111;
    box-shadow: inset 0 1px 3px rgba(0,0,0,0.8), 0 0 0 0.5px rgba(40,40,40,0.5);
    flex-shrink: 0;
  }

  /* ── The image area inside the frame ── */
  .film-image-area {
    position: relative;
    background: #111;
    border: 2px solid #0e0e0e;
    box-shadow: inset 0 0 10px rgba(0,0,0,0.5);
    overflow: hidden;
  }
  .film-image-area img {
    display: block;
    width: 100%;
    height: auto;
    object-fit: cover;
  }

  /* ── Frame number markings (Kodak-style, amber/orange) ── */
  .frame-number-left,
  .frame-number-right {
    position: absolute;
    font-family: 'Courier New', monospace;
    font-size: 10px;
    font-weight: 700;
    color: #c47b28;
    opacity: 0.7;
    z-index: 3;
    pointer-events: none;
    letter-spacing: 0.05em;
  }
  .frame-number-left {
    left: 42px;
    top: 6px;
  }
  .frame-number-right {
    right: 42px;
    bottom: 6px;
    text-align: right;
  }

  /* ── Film stock text running along the edge ── */
  .film-stock-text {
    position: absolute;
    font-family: 'Courier New', monospace;
    font-size: 7px;
    font-weight: 700;
    color: #c47b28;
    opacity: 0.45;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    pointer-events: none;
    z-index: 3;
    white-space: nowrap;
  }
  .film-stock-text.left-edge {
    left: 42px;
    bottom: 8px;
  }
  .film-stock-text.right-edge {
    right: 42px;
    top: 8px;
    text-align: right;
  }

  /* ── Inter-frame gap area ── */
  .film-interframe {
    position: relative;
    z-index: 1;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Triangle alignment marks between frames */
  .film-interframe::before,
  .film-interframe::after {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    border-style: solid;
  }
  .film-interframe::before {
    left: 44px;
    border-width: 5px 4px 0 4px;
    border-color: #c47b28 transparent transparent transparent;
    opacity: 0.5;
  }
  .film-interframe::after {
    right: 44px;
    border-width: 0 4px 5px 4px;
    border-color: transparent transparent #c47b28 transparent;
    opacity: 0.5;
  }

  /* thin separation line */
  .film-interframe-line {
    width: calc(100% - 104px);
    height: 1px;
    background: rgba(255,255,255,0.04);
  }

  /* Sprocket holes in the interframe area */
  .interframe-sprocket-left,
  .interframe-sprocket-right {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 2;
  }
  .interframe-sprocket-left { left: 11px; }
  .interframe-sprocket-right { right: 11px; }
  .interframe-sprocket-left .sprocket-hole,
  .interframe-sprocket-right .sprocket-hole {
    width: 14px;
    height: 20px;
  }

  /* ── Film leader at top ── */
  .film-leader {
    position: relative;
    z-index: 1;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .film-leader-text {
    font-family: 'Courier New', monospace;
    font-size: 9px;
    font-weight: 700;
    color: #c47b28;
    opacity: 0.4;
    letter-spacing: 0.3em;
    text-transform: uppercase;
  }
  /* Sprocket holes in leader */
  .film-leader .sprocket-left,
  .film-leader .sprocket-right {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
  }
  .film-leader .sprocket-left { left: 11px; }
  .film-leader .sprocket-right { right: 11px; }

  /* ── Film tail at bottom ── */
  .film-tail {
    position: relative;
    z-index: 1;
    height: 80px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
  }
  .film-tail-text {
    font-family: 'Courier New', monospace;
    font-size: 8px;
    font-weight: 700;
    color: #c47b28;
    opacity: 0.35;
    letter-spacing: 0.3em;
    text-transform: uppercase;
  }
  .film-tail .sprocket-left,
  .film-tail .sprocket-right {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
  }
  .film-tail .sprocket-left { left: 11px; }
  .film-tail .sprocket-right { right: 11px; }

  /* ── DX barcode area ── */
  .dx-barcode {
    position: absolute;
    right: 42px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    gap: 1px;
    opacity: 0.25;
    z-index: 3;
  }
  .dx-bar {
    width: 2px;
    height: 12px;
    background: #c47b28;
  }
  .dx-bar.thin { width: 1px; }
  .dx-bar.tall { height: 16px; }

  /* ── Captions below frame ── */
  .v6-caption {
    text-align: center;
    padding: 14px 52px 0;
    position: relative;
    z-index: 1;
    opacity: 0;
    transform: translateY(10px);
    transition: opacity 0.5s ease 0.3s, transform 0.5s ease 0.3s;
  }
  .v6-caption.v6-caption-visible {
    opacity: 1;
    transform: translateY(0);
  }
  .v6-caption-name {
    color: rgba(255,255,255,0.75);
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 16px;
    margin: 0;
    line-height: 1.3;
  }
  .v6-caption-city {
    color: rgba(255,255,255,0.3);
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 11px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    margin: 3px 0 0;
  }

  /* ── Film edge continuous markings ── */
  .film-edge-marking {
    position: absolute;
    font-family: 'Courier New', monospace;
    font-size: 6px;
    color: #c47b28;
    opacity: 0.3;
    letter-spacing: 0.15em;
    z-index: 3;
    pointer-events: none;
    white-space: nowrap;
  }

  /* ── CTA Section ── */
  .v6-cta-section {
    position: relative;
    z-index: 2;
    padding: 60px 24px 80px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .v6-cta-section input,
  .v6-cta-section textarea {
    width: 100%;
    max-width: 400px;
    padding: 14px 16px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 8px;
    color: #fff;
    font-size: 16px;
    font-family: inherit;
    outline: none;
    margin-bottom: 12px;
    transition: border-color 0.2s;
  }
  .v6-cta-section input:focus,
  .v6-cta-section textarea:focus {
    border-color: rgba(255,255,255,0.35);
  }
  .v6-cta-section textarea {
    min-height: 100px;
    resize: vertical;
  }
  .v6-submit {
    width: 100%;
    max-width: 400px;
    padding: 16px;
    background: #fff;
    color: #0c0c0c;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s;
  }
  .v6-submit:hover { opacity: 0.85; }

  /* ── Responsive ── */
  @media (max-width: 700px) {
    .film-strip { max-width: 100%; }
    .film-frame { padding: 16px 40px; }
    .film-frame .sprocket-left { left: 2px; }
    .film-frame .sprocket-right { right: 2px; }
    .sprocket-hole { width: 11px; height: 16px; }
    .frame-number-left { left: 32px; }
    .frame-number-right { right: 32px; }
    .film-stock-text.left-edge { left: 32px; }
    .film-stock-text.right-edge { right: 32px; }
    .film-interframe::before { left: 34px; }
    .film-interframe::after { right: 34px; }
    .film-interframe-line { width: calc(100% - 80px); }
    .interframe-sprocket-left { left: 6px; }
    .interframe-sprocket-right { right: 6px; }
    .film-leader .sprocket-left { left: 6px; }
    .film-leader .sprocket-right { right: 6px; }
    .film-tail .sprocket-left { left: 6px; }
    .film-tail .sprocket-right { right: 6px; }
    .v6-caption { padding: 12px 40px 0; }
    .dx-barcode { right: 32px; }
  }
`;

function getFrameNumber(index: number): { primary: string; secondary: string } {
  const num = index + 1;
  return { primary: `${num}`, secondary: `${num}A` };
}

function SprocketColumn({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="sprocket-hole" />
      ))}
    </>
  );
}

function DxBarcode() {
  const pattern = [false, true, false, false, true, true, false, true, false, false, true, false];
  return (
    <div className="dx-barcode">
      {pattern.map((tall, i) => (
        <div key={i} className={`dx-bar${tall ? ' tall' : ' thin'}`} />
      ))}
    </div>
  );
}

export default function Page() {
  const [current, setCurrent] = useState(1);
  const [showCue, setShowCue] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [bump, setBump] = useState(false);
  const frameRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const frame = entry.target as HTMLElement;
            frame.classList.add('v6-visible');
            const caption = frame.querySelector('.v6-caption');
            if (caption) caption.classList.add('v6-caption-visible');
            const idx = Number(frame.dataset.idx);
            if (!isNaN(idx)) {
              setCurrent(idx + 1);
              setBump(true);
              setTimeout(() => setBump(false), 300);
            }
          }
        });
      },
      { threshold: 0.3 }
    );

    frameRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    const handleScroll = () => {
      if (window.scrollY > window.innerHeight * 0.5) {
        setShowCue(false);
      }
      const nearBottom =
        window.innerHeight + window.scrollY >= document.body.scrollHeight - 200;
      setAtEnd(nearBottom);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const progress = (current / TOTAL) * 100;

  const filmStockTexts = [
    'KODAK PORTRA 400',
    'KODAK 5014',
    'PORTRA 400-2',
    'EPR 135-36',
    'KODAK PORTRA 400',
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* Progress bar */}
      <div className="v6-progress" style={{ width: `${progress}%` }} />

      {/* Fixed nav */}
      <div className="v6-fixed-nav">
        <a href="#inquiry">Inquire</a>
        <div style={{ textAlign: 'right', pointerEvents: 'none' }}>
          <p
            style={{
              color: 'rgba(255,255,255,0.7)',
              fontSize: '13px',
              letterSpacing: '0.12em',
              margin: 0,
              fontFamily: 'Georgia, serif',
            }}
          >
            Aidan Torrence
          </p>
          <p
            style={{
              color: 'rgba(255,255,255,0.35)',
              fontSize: '10px',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              margin: '2px 0 0',
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            Film Photographer
          </p>
        </div>
      </div>

      {/* Counter */}
      <div className={`v6-counter${bump ? ' v6-bump' : ''}`}>
        {current} / {TOTAL}
      </div>

      {/* Scroll cue */}
      {showCue && !atEnd && (
        <div className="v6-scroll-cue">
          <span
            style={{
              color: 'rgba(255,255,255,0.7)',
              fontSize: '12px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            scroll
          </span>
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            stroke="rgba(255,255,255,0.7)"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M10 4v12M4 10l6 6 6-6" />
          </svg>
        </div>
      )}

      {/* Page title */}
      <p className="v6-page-title">Selected Works</p>

      {/* ═══ Film Strip ═══ */}
      <div className="film-strip">
        {/* Film leader */}
        <div className="film-leader">
          <div className="sprocket-left">
            <div className="sprocket-hole" />
          </div>
          <div className="sprocket-right">
            <div className="sprocket-hole" />
          </div>
          <span className="film-leader-text">KODAK PORTRA 400 &nbsp; 135-36</span>
        </div>

        {/* Frames */}
        {images.map((img, i) => {
          const { primary, secondary } = getFrameNumber(i);
          const stockText = filmStockTexts[i % filmStockTexts.length];

          return (
            <React.Fragment key={img.src}>
              {/* Inter-frame gap (before each frame except the first) */}
              {i > 0 && (
                <div className="film-interframe">
                  <div className="interframe-sprocket-left">
                    <div className="sprocket-hole" />
                  </div>
                  <div className="interframe-sprocket-right">
                    <div className="sprocket-hole" />
                  </div>
                  <div className="film-interframe-line" />
                </div>
              )}

              {/* The film frame */}
              <div
                className="film-frame"
                data-idx={i}
                ref={(el) => {
                  frameRefs.current[i] = el;
                }}
              >
                {/* Sprocket holes — left */}
                <div className="sprocket-left">
                  <SprocketColumn count={6} />
                </div>

                {/* Sprocket holes — right */}
                <div className="sprocket-right">
                  <SprocketColumn count={6} />
                </div>

                {/* Frame number markings */}
                <span className="frame-number-left">{primary}</span>
                <span className="frame-number-right">{secondary}</span>

                {/* Film stock text */}
                <span className="film-stock-text left-edge">{stockText}</span>
                {i % 3 === 0 && (
                  <span className="film-stock-text right-edge">
                    {'\u25B6'} {primary} &nbsp; {stockText}
                  </span>
                )}

                {/* DX barcode (every 4th frame) */}
                {i % 4 === 0 && <DxBarcode />}

                {/* The actual image */}
                <div className="film-image-area">
                  <img
                    src={`/images/large/${img.src}`}
                    alt={`${img.name} — ${img.city}`}
                    loading="lazy"
                  />
                </div>

                {/* Caption below the frame */}
                <div className="v6-caption">
                  <p className="v6-caption-name">{img.name}</p>
                  <p className="v6-caption-city">{img.city}</p>
                </div>
              </div>
            </React.Fragment>
          );
        })}

        {/* Film tail */}
        <div className="film-tail">
          <div className="sprocket-left">
            <div className="sprocket-hole" />
          </div>
          <div className="sprocket-right">
            <div className="sprocket-hole" />
          </div>
          <span className="film-tail-text">KODAK PORTRA 400</span>
          <span className="film-tail-text">25 EXPOSURES</span>
        </div>
      </div>

      {/* ═══ CTA ═══ */}
      <div className="v6-cta-section" id="inquiry">
        <h3
          style={{
            color: '#fff',
            fontSize: '22px',
            fontWeight: 300,
            letterSpacing: '0.06em',
            marginBottom: '24px',
            fontFamily: 'Georgia, serif',
          }}
        >
          Get in Touch
        </h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            window.location.href = 'mailto:aidan@aidantorrence.com';
          }}
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <input type="text" placeholder="Name" required />
          <input type="email" placeholder="Email" required />
          <input type="text" placeholder="Instagram" />
          <textarea placeholder="Tell me about your project..." />
          <button type="submit" className="v6-submit">
            Send Inquiry
          </button>
        </form>
        <div style={{ marginTop: '36px', textAlign: 'center' }}>
          <p
            style={{
              color: 'rgba(255,255,255,0.4)',
              fontSize: '13px',
              margin: '4px 0',
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            aidan@aidantorrence.com
          </p>
          <p
            style={{
              color: 'rgba(255,255,255,0.4)',
              fontSize: '13px',
              margin: '4px 0',
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            WhatsApp: +49 175 8966210 &middot; @madebyaidan
          </p>
        </div>
      </div>
    </>
  );
}
