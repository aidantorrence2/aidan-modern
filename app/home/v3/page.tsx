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
  { src: 'manila-gallery-night-002.jpg', name: 'Dorahan', city: 'Ho Chi Minh City' },
  { src: 'manila-gallery-market-001.jpg', name: 'Pharima', city: 'Bangkok' },
  { src: 'manila-gallery-park-001.jpg', name: 'Tess', city: 'Glasgow' },
  { src: 'manila-gallery-floor-001.jpg', name: 'Francisca', city: 'Cascais' },
  { src: 'manila-gallery-garden-002.jpg', name: 'Sumika', city: 'Tokyo' },
  { src: 'manila-gallery-urban-002.jpg', name: 'Yana', city: 'Warsaw' },
  { src: 'manila-gallery-dsc-0190.jpg', name: 'Dia', city: 'Bali' },
  { src: 'manila-gallery-ivy-002.jpg', name: 'Daniela', city: 'Rome' },
  { src: 'manila-gallery-canal-002.jpg', name: 'Greta', city: 'Venice' },
  { src: 'manila-gallery-night-003.jpg', name: 'Dorahan', city: 'Ho Chi Minh City' },
  { src: 'manila-gallery-urban-003.jpg', name: 'Yana', city: 'Warsaw' },
  { src: 'manila-gallery-white-001.jpg', name: 'Silvia', city: 'Milan' },
  { src: 'manila-gallery-dsc-0911.jpg', name: 'Zarissa', city: 'Kuala Lumpur' },
];

const TOTAL = images.length;

const filmStocks = [
  'KODAK 400TX', 'PORTRA 400', 'KODAK TRI-X 400', 'PORTRA 160',
  'KODAK EKTAR 100', 'FUJI PRO 400H', 'ILFORD HP5', 'KODAK GOLD 200',
  'PORTRA 800', 'FUJI SUPERIA 400', 'KODAK T-MAX 400', 'ILFORD DELTA 3200',
  'KODAK ULTRAMAX 400', 'FUJI C200', 'CINESTILL 800T', 'KODAK VISION3 500T',
  'ILFORD FP4', 'KODAK PLUS-X 125', 'FUJI VELVIA 50', 'KODAK EKTACHROME E100',
  'PORTRA 400', 'KODAK 400TX', 'ILFORD HP5', 'FUJI PRO 400H', 'PORTRA 160',
];

/* Frame number sequences: real Kodak uses 1, 1A, 2, 2A... */
function getFrameNumber(i: number): string {
  const base = Math.floor(i / 2) + 1;
  return i % 2 === 0 ? `${base}` : `${base}A`;
}

const CSS = `
  body > header, body > footer, .fixed.inset-x-0.bottom-0 { display: none !important; }
  html, body {
    background: #0c0c0c !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow-x: hidden !important;
  }

  /* ===== NAV ===== */
  .v3-fixed-nav {
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

  .v3-fixed-nav a {
    pointer-events: auto;
    color: rgba(255,255,255,0.6);
    text-decoration: none;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 12px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    transition: color 0.2s;
  }
  .v3-fixed-nav a:hover { color: #fff; }

  /* ===== COUNTER ===== */
  .v3-counter {
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
  .v3-counter.v3-bump { transform: scale(1.1); }

  /* ===== PROGRESS ===== */
  .v3-progress {
    position: fixed;
    top: 0;
    left: 0;
    height: 3px;
    background: linear-gradient(90deg, #fff 0%, rgba(255,255,255,0.5) 100%);
    z-index: 101;
    transition: width 0.3s ease;
  }

  /* ===== SCROLL CUE ===== */
  .v3-scroll-cue {
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 100;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    animation: v3-bounce 1.8s ease-in-out infinite;
    transition: opacity 0.5s;
  }

  @keyframes v3-bounce {
    0%, 100% { transform: translateX(-50%) translateY(0); }
    50% { transform: translateX(-50%) translateY(10px); }
  }

  /* ===== PAGE TITLE ===== */
  .v3-page-title {
    color: rgba(255,255,255,0.5);
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 13px;
    font-weight: 400;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    text-align: center;
    margin: 0;
    padding: 90px 20px 30px;
  }

  /* ===== PHOTO SECTION ===== */
  .v3-photo-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 30px 16px;
    box-sizing: border-box;
  }

  /* ===== FILM STRIP CONTAINER ===== */
  .film-strip {
    position: relative;
    width: 100%;
    max-width: 620px;
    opacity: 0;
    transform: translateY(40px);
    transition: opacity 0.7s ease, transform 0.7s ease;
  }
  .film-strip.v3-visible {
    opacity: 1;
    transform: translateY(0);
  }

  /* The entire film frame: sprocket areas + image */
  .film-frame {
    position: relative;
    background: #111;
    border-radius: 1px;
    overflow: hidden;
    /* Subtle scanner light leak at edges */
    box-shadow:
      inset 0 0 60px rgba(0,0,0,0.5),
      0 0 30px rgba(0,0,0,0.8);
  }

  /* ===== SPROCKET RAIL (top and bottom) ===== */
  .sprocket-rail {
    position: relative;
    width: 100%;
    height: 28px;
    background: #0d0d0d;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0;
    overflow: hidden;
    z-index: 2;
  }

  .sprocket-rail::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      rgba(30,25,15,0.15) 0%,
      transparent 8%,
      transparent 92%,
      rgba(30,25,15,0.15) 100%
    );
  }

  /* Individual sprocket holes - 8 per frame on real 35mm */
  .sprocket-hole {
    width: 14px;
    height: 20px;
    background: #1a1a1a;
    border-radius: 2.5px;
    flex-shrink: 0;
    position: relative;
    box-shadow:
      inset 0 1px 2px rgba(0,0,0,0.8),
      inset 0 -1px 1px rgba(40,40,40,0.3),
      0 0 1px rgba(0,0,0,0.9);
    border: 0.5px solid rgba(50,50,50,0.4);
  }

  /* Spacing between sprocket holes - calculated for 8 holes across the frame */
  .sprocket-spacer {
    flex: 1;
    min-width: 20px;
    max-width: 60px;
  }

  /* ===== REBATE AREA (dark border between sprocket and image) ===== */
  .film-rebate {
    position: relative;
    background: #0e0e0e;
    display: flex;
    align-items: center;
    height: 22px;
    z-index: 2;
  }

  .film-rebate-top {
    border-bottom: 1px solid rgba(30,30,30,0.5);
  }
  .film-rebate-bottom {
    border-top: 1px solid rgba(30,30,30,0.5);
  }

  /* ===== FILM EDGE MARKINGS ===== */
  .film-edge-text {
    position: absolute;
    font-family: 'Courier New', 'Courier', monospace;
    font-size: 9px;
    font-weight: 700;
    color: #c87832;
    letter-spacing: 0.12em;
    white-space: nowrap;
    text-transform: uppercase;
    opacity: 0.85;
    /* Slight blur to simulate scan imperfection */
    filter: blur(0.2px);
    user-select: none;
  }

  .film-edge-text.left-mark {
    left: 10px;
  }

  .film-edge-text.right-mark {
    right: 10px;
  }

  .film-edge-text.center-mark {
    left: 50%;
    transform: translateX(-50%);
  }

  /* Frame number styling - slightly different from stock text */
  .frame-number {
    font-family: 'Courier New', monospace;
    font-size: 11px;
    font-weight: 700;
    color: #d4863a;
    opacity: 0.9;
    filter: blur(0.15px);
    letter-spacing: 0.05em;
  }

  /* Alignment arrows between frames */
  .alignment-arrow {
    color: #c87832;
    font-size: 8px;
    opacity: 0.7;
    position: absolute;
  }

  /* DX barcode simulation */
  .dx-barcode {
    position: absolute;
    display: flex;
    align-items: center;
    gap: 1px;
    height: 14px;
    opacity: 0.6;
  }

  .dx-bar {
    width: 1.5px;
    background: #c87832;
    border-radius: 0.5px;
  }

  /* ===== IMAGE AREA ===== */
  .film-image-area {
    position: relative;
    width: 100%;
    line-height: 0;
    background: #0a0a0a;
  }

  .film-image-area img {
    width: 100%;
    display: block;
    /* Slight warmth to simulate scanned film look */
    filter: contrast(1.02) saturate(0.95);
  }

  /* Scanner light leak overlay on the image edges */
  .film-image-area::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    background:
      linear-gradient(to right, rgba(180,120,40,0.04) 0%, transparent 3%, transparent 97%, rgba(180,120,40,0.04) 100%),
      linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, transparent 2%, transparent 98%, rgba(0,0,0,0.08) 100%);
  }

  /* Very subtle film grain overlay */
  .film-image-area::after {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 2;
    pointer-events: none;
    opacity: 0.03;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  }

  /* ===== EDGE LIGHT LEAK ===== */
  .film-frame::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: -2px;
    width: 6px;
    z-index: 10;
    background: linear-gradient(
      to bottom,
      rgba(200,140,50,0.08),
      rgba(200,140,50,0.03) 20%,
      transparent 40%,
      transparent 60%,
      rgba(200,140,50,0.03) 80%,
      rgba(200,140,50,0.08)
    );
    pointer-events: none;
  }

  .film-frame::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    right: -2px;
    width: 6px;
    z-index: 10;
    background: linear-gradient(
      to bottom,
      rgba(200,140,50,0.06),
      transparent 30%,
      transparent 70%,
      rgba(200,140,50,0.06)
    );
    pointer-events: none;
  }

  /* ===== INTER-FRAME GAP ===== */
  .inter-frame-gap {
    width: 100%;
    max-width: 620px;
    height: 8px;
    background: #0a0a0a;
    margin: 0 auto;
    position: relative;
  }

  .inter-frame-gap::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 0;
    height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 5px solid rgba(200,120,50,0.35);
  }

  /* ===== CAPTION ===== */
  .v3-caption {
    text-align: center;
    margin-top: 14px;
    opacity: 0;
    transform: translateY(10px);
    transition: opacity 0.5s ease 0.3s, transform 0.5s ease 0.3s;
  }
  .v3-caption.v3-caption-visible {
    opacity: 1;
    transform: translateY(0);
  }

  .v3-caption-name {
    color: rgba(255,255,255,0.75);
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 16px;
    margin: 0;
    line-height: 1.3;
  }

  .v3-caption-city {
    color: rgba(255,255,255,0.3);
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 11px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    margin: 3px 0 0;
  }

  /* ===== CTA ===== */
  .v3-cta-section {
    padding: 60px 24px 80px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .v3-cta-section input,
  .v3-cta-section textarea {
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

  .v3-cta-section input:focus,
  .v3-cta-section textarea:focus {
    border-color: rgba(255,255,255,0.35);
  }

  .v3-cta-section textarea {
    min-height: 100px;
    resize: vertical;
  }

  .v3-submit {
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
  .v3-submit:hover { opacity: 0.85; }

  /* ===== RESPONSIVE ===== */
  @media (max-width: 500px) {
    .sprocket-rail { height: 20px; }
    .sprocket-hole { width: 10px; height: 14px; }
    .film-rebate { height: 16px; }
    .film-edge-text { font-size: 7px; }
    .frame-number { font-size: 8px; }
    .dx-barcode { height: 10px; }
  }
`;

/* Generate DX barcode pattern - pseudo-random per frame */
function dxPattern(seed: number): number[] {
  const bars: number[] = [];
  let s = seed * 7 + 13;
  for (let i = 0; i < 12; i++) {
    s = (s * 31 + 7) % 100;
    bars.push(s % 2 === 0 ? 10 : 14);
  }
  return bars;
}

export default function Page() {
  const [current, setCurrent] = useState(1);
  const [showCue, setShowCue] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [bump, setBump] = useState(false);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const strip = entry.target.querySelector('.film-strip');
            const caption = entry.target.querySelector('.v3-caption');
            if (strip) strip.classList.add('v3-visible');
            if (caption) caption.classList.add('v3-caption-visible');
            const idx = Number((entry.target as HTMLElement).dataset.idx);
            if (!isNaN(idx)) {
              setCurrent(idx + 1);
              setBump(true);
              setTimeout(() => setBump(false), 300);
            }
          }
        });
      },
      { threshold: 0.4 }
    );

    sectionRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    const handleScroll = () => {
      if (window.scrollY > window.innerHeight * 0.5) {
        setShowCue(false);
      }
      const nearBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 200;
      setAtEnd(nearBottom);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const progress = (current / TOTAL) * 100;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* Progress bar */}
      <div className="v3-progress" style={{ width: `${progress}%` }} />

      {/* Fixed nav */}
      <div className="v3-fixed-nav">
        <a href="#inquiry">Inquire</a>
        <div style={{ textAlign: 'right', pointerEvents: 'none' }}>
          <p style={{
            color: 'rgba(255,255,255,0.7)',
            fontSize: '13px',
            letterSpacing: '0.12em',
            margin: 0,
            fontFamily: 'Georgia, serif',
          }}>Aidan Torrence</p>
          <p style={{
            color: 'rgba(255,255,255,0.35)',
            fontSize: '10px',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            margin: '2px 0 0',
            fontFamily: 'system-ui, sans-serif',
          }}>Film Photographer</p>
        </div>
      </div>

      {/* Counter */}
      <div className={`v3-counter${bump ? ' v3-bump' : ''}`}>
        {current} / {TOTAL}
      </div>

      {/* Scroll cue */}
      {showCue && !atEnd && (
        <div className="v3-scroll-cue">
          <span style={{
            color: 'rgba(255,255,255,0.7)',
            fontSize: '12px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            fontFamily: 'system-ui, sans-serif',
          }}>
            scroll
          </span>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round">
            <path d="M10 4v12M4 10l6 6 6-6" />
          </svg>
        </div>
      )}

      {/* Page title */}
      <p className="v3-page-title">Selected Works</p>

      {/* Photo sections with film frames */}
      {images.map((img, i) => {
        const frameNum = getFrameNumber(i);
        const stock = filmStocks[i % filmStocks.length];
        const dxBars = dxPattern(i);
        /* Vary the edge text slightly per frame to look authentic */
        const edgeVariants = [
          `${stock}  ${5053 + i * 3}`,
          `${stock}`,
          `${stock}  E`,
          `${stock}   ${20 + i}`,
        ];
        const topEdgeText = edgeVariants[i % edgeVariants.length];
        const bottomEdgeText = `${stock}   ${frameNum}`;
        /* Slight opacity variation per frame for realism */
        const edgeOpacity = 0.75 + (((i * 17) % 20) / 100);

        return (
          <React.Fragment key={img.src}>
            <div
              className="v3-photo-section"
              data-idx={i}
              ref={(el) => { sectionRefs.current[i] = el; }}
            >
              <div className="film-strip">
                <div className="film-frame">
                  {/* === TOP SPROCKET RAIL === */}
                  <div className="sprocket-rail">
                    <div className="sprocket-spacer" />
                    {Array.from({ length: 8 }).map((_, h) => (
                      <React.Fragment key={`top-${h}`}>
                        <div className="sprocket-hole" />
                        {h < 7 && <div className="sprocket-spacer" />}
                      </React.Fragment>
                    ))}
                    <div className="sprocket-spacer" />
                  </div>

                  {/* === TOP REBATE AREA === */}
                  <div className="film-rebate film-rebate-top">
                    {/* Frame number */}
                    <span
                      className="frame-number"
                      style={{
                        position: 'absolute',
                        left: 12,
                        opacity: edgeOpacity,
                      }}
                    >
                      {frameNum}
                    </span>

                    {/* Alignment arrow */}
                    <span
                      className="alignment-arrow"
                      style={{ left: 46, top: '50%', transform: 'translateY(-50%)' }}
                    >
                      &#9654;
                    </span>

                    {/* Film stock text */}
                    <span
                      className="film-edge-text center-mark"
                      style={{ opacity: edgeOpacity }}
                    >
                      {topEdgeText}
                    </span>

                    {/* DX barcode */}
                    <div
                      className="dx-barcode"
                      style={{ right: 10, top: '50%', transform: 'translateY(-50%)' }}
                    >
                      {dxBars.map((h, b) => (
                        <div
                          key={b}
                          className="dx-bar"
                          style={{
                            height: `${h}px`,
                            opacity: 0.5 + ((b * 7) % 5) / 10,
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* === IMAGE AREA === */}
                  <div className="film-image-area">
                    <img
                      src={`/images/large/${img.src}`}
                      alt={`${img.name} — ${img.city}`}
                      loading="lazy"
                    />
                  </div>

                  {/* === BOTTOM REBATE AREA === */}
                  <div className="film-rebate film-rebate-bottom">
                    {/* Alignment arrow */}
                    <span
                      className="alignment-arrow"
                      style={{ left: 12, top: '50%', transform: 'translateY(-50%) rotate(180deg)' }}
                    >
                      &#9654;
                    </span>

                    {/* Bottom edge text */}
                    <span
                      className="film-edge-text center-mark"
                      style={{ opacity: edgeOpacity * 0.9 }}
                    >
                      {bottomEdgeText}
                    </span>

                    {/* Second frame number on right */}
                    <span
                      className="frame-number"
                      style={{
                        position: 'absolute',
                        right: 12,
                        opacity: edgeOpacity * 0.85,
                      }}
                    >
                      {frameNum}
                    </span>
                  </div>

                  {/* === BOTTOM SPROCKET RAIL === */}
                  <div className="sprocket-rail">
                    <div className="sprocket-spacer" />
                    {Array.from({ length: 8 }).map((_, h) => (
                      <React.Fragment key={`bot-${h}`}>
                        <div className="sprocket-hole" />
                        {h < 7 && <div className="sprocket-spacer" />}
                      </React.Fragment>
                    ))}
                    <div className="sprocket-spacer" />
                  </div>
                </div>
              </div>

              {/* Caption */}
              <div className="v3-caption">
                <p className="v3-caption-name">{img.name}</p>
                <p className="v3-caption-city">{img.city}</p>
              </div>
            </div>

            {/* Inter-frame gap between strips */}
            {i < images.length - 1 && <div className="inter-frame-gap" />}
          </React.Fragment>
        );
      })}

      {/* CTA */}
      <div className="v3-cta-section" id="inquiry">
        <h3 style={{
          color: '#fff', fontSize: '22px', fontWeight: 300,
          letterSpacing: '0.06em', marginBottom: '24px',
          fontFamily: 'Georgia, serif',
        }}>
          Get in Touch
        </h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            window.location.href = 'mailto:aidan@aidantorrence.com';
          }}
          style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          <input type="text" placeholder="Name" required />
          <input type="email" placeholder="Email" required />
          <input type="text" placeholder="Instagram" />
          <textarea placeholder="Tell me about your project..." />
          <button type="submit" className="v3-submit">Send Inquiry</button>
        </form>
        <div style={{ marginTop: '36px', textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: '4px 0', fontFamily: 'system-ui, sans-serif' }}>
            aidan@aidantorrence.com
          </p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: '4px 0', fontFamily: 'system-ui, sans-serif' }}>
            WhatsApp: +49 175 8966210 &middot; @madebyaidan
          </p>
        </div>
      </div>
    </>
  );
}
