'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

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

export default function GridToFullscreenPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const rafRef = useRef<number>(0);

  // Scroll phases:
  // Phase 1 (0-0.15): gaps expand 4px -> 40px
  // Phase 2 (0.15-0.30): columns 5 -> 3 -> 1
  // Phase 3 (0.30+): individual full-viewport sections
  const PHASE1_END = 0.15;
  const PHASE2_END = 0.30;

  const handleScroll = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;
      // Total scroll height for the transition phases (first 60vh of scrolling)
      const transitionScrollHeight = vh * 0.6;
      const rawProgress = Math.min(scrollY / transitionScrollHeight, 1);
      setScrollProgress(rawProgress);

      // Calculate current photo index when in single-photo mode
      if (rawProgress >= 1) {
        const singlePhotoStart = transitionScrollHeight;
        const scrollIntoSingles = scrollY - singlePhotoStart;
        const idx = Math.floor(scrollIntoSingles / vh);
        setCurrentIndex(Math.max(0, Math.min(idx, images.length - 1)));
      }
    });
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [handleScroll]);

  // Derive values from scroll progress
  const normalizedPhase1 = Math.min(scrollProgress / PHASE1_END, 1);
  const normalizedPhase2 = scrollProgress <= PHASE1_END ? 0 : Math.min((scrollProgress - PHASE1_END) / (PHASE2_END - PHASE1_END), 1);
  const normalizedPhase3 = scrollProgress <= PHASE2_END ? 0 : Math.min((scrollProgress - PHASE2_END) / (1 - PHASE2_END), 1);

  // Phase 1: gap expansion
  const gap = 4 + normalizedPhase1 * 36; // 4px -> 40px

  // Phase 2: column reduction 5 -> 1
  // Use fractional columns for smooth transition
  const columns = 5 - normalizedPhase2 * 4; // 5 -> 1

  // Phase 3: transition to full viewport
  const photoScale = 1 + normalizedPhase3 * 0.5;
  const captionOpacity = normalizedPhase3;

  // Title overlay fades during phase 1
  const titleOpacity = 1 - normalizedPhase1;

  // In single-photo mode (scrollProgress >= 1)
  const isFullscreen = scrollProgress >= 1;

  // Counter visibility
  const counterOpacity = normalizedPhase3;

  // Calculate total page height:
  // transition zone (60vh) + each photo gets 100vh + CTA section
  const totalHeight = window.innerHeight * 0.6 + images.length * window.innerHeight + window.innerHeight;

  // Build grid template columns string
  const getGridColumns = () => {
    if (columns >= 4.5) return 'repeat(5, 1fr)';
    if (columns >= 3.5) return 'repeat(4, 1fr)';
    if (columns >= 2.5) return 'repeat(3, 1fr)';
    if (columns >= 1.5) return 'repeat(2, 1fr)';
    return '1fr';
  };

  // Smooth fractional column widths using actual fractions
  const getGridColumnsSmooth = () => {
    const cols = Math.max(1, columns);
    const wholeCols = Math.ceil(cols);
    // Use minmax to allow smooth sizing
    return `repeat(${wholeCols}, 1fr)`;
  };

  // For smooth column transition, use item width percentage
  const getItemMaxWidth = () => {
    if (columns >= 5) return '100%';
    const pct = 100 / Math.max(1, Math.round(columns));
    return `${pct}%`;
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        body > header, body > footer, .fixed.inset-x-0.bottom-0 { display: none !important; }
        html { scroll-behavior: auto; }
        body { background: #0c0c0c; margin: 0; overflow-x: hidden; }

        .v27-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 40px;
          mix-blend-mode: difference;
        }
        .v27-nav a {
          color: #fff;
          text-decoration: none;
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 13px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .v27-spacer {
          position: relative;
          width: 100%;
        }

        .v27-grid-container {
          position: sticky;
          top: 0;
          width: 100%;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .v27-grid {
          display: grid;
          width: calc(100% - 48px);
          max-width: 1600px;
          transition: none;
        }

        .v27-grid-item {
          position: relative;
          overflow: hidden;
          border-radius: 2px;
          aspect-ratio: 3/4;
          transition: none;
        }
        .v27-grid-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .v27-title-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
          pointer-events: none;
        }
        .v27-title-text {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: clamp(32px, 6vw, 80px);
          font-weight: 300;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: #fff;
          text-shadow: 0 2px 40px rgba(0,0,0,0.7);
          white-space: nowrap;
        }

        .v27-counter {
          position: fixed;
          bottom: 40px;
          right: 40px;
          z-index: 80;
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 14px;
          letter-spacing: 0.12em;
          color: rgba(255,255,255,0.6);
          font-variant-numeric: tabular-nums;
        }

        .v27-caption {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 24px;
          background: linear-gradient(transparent, rgba(0,0,0,0.6));
          pointer-events: none;
        }
        .v27-caption-name {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 18px;
          font-weight: 400;
          letter-spacing: 0.08em;
          color: #fff;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .v27-caption-city {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 12px;
          letter-spacing: 0.15em;
          color: rgba(255,255,255,0.5);
          text-transform: uppercase;
        }

        /* Full-viewport single photo mode */
        .v27-singles-container {
          position: relative;
          width: 100%;
        }
        .v27-single-photo {
          position: sticky;
          top: 0;
          width: 100%;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .v27-single-photo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .v27-single-caption {
          position: absolute;
          bottom: 80px;
          left: 40px;
          z-index: 10;
        }
        .v27-single-name {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 28px;
          font-weight: 300;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #fff;
          margin-bottom: 6px;
        }
        .v27-single-city {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 13px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.5);
        }

        .v27-cta {
          position: relative;
          width: 100%;
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 24px;
        }
        .v27-cta-title {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: clamp(24px, 4vw, 52px);
          font-weight: 200;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #fff;
        }
        .v27-cta-btn {
          display: inline-block;
          padding: 16px 48px;
          border: 1px solid rgba(255,255,255,0.3);
          color: #fff;
          text-decoration: none;
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 13px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          transition: all 0.3s ease;
          background: transparent;
          cursor: pointer;
        }
        .v27-cta-btn:hover {
          background: #fff;
          color: #0c0c0c;
        }
      `}} />

      {/* Fixed nav */}
      <nav className="v27-nav">
        <a href="#">Portfolio</a>
        <a href="#">Contact</a>
      </nav>

      {/* Title overlay - fades as grid expands */}
      <div
        className="v27-title-overlay"
        style={{
          opacity: titleOpacity,
          display: titleOpacity < 0.01 ? 'none' : 'flex',
        }}
      >
        <div className="v27-title-text">Aidan Torrence</div>
      </div>

      {/* Counter in single-photo mode */}
      <div
        className="v27-counter"
        style={{
          opacity: isFullscreen ? 1 : counterOpacity,
          display: counterOpacity < 0.01 && !isFullscreen ? 'none' : 'block',
        }}
      >
        {String(currentIndex + 1).padStart(2, '0')} / {images.length}
      </div>

      {/* Transition zone: sticky grid that morphs */}
      {!isFullscreen && (
        <div
          className="v27-spacer"
          style={{ height: `${window.innerHeight * 0.6}px` }}
        >
          <div className="v27-grid-container">
            <div
              ref={gridRef}
              className="v27-grid"
              style={{
                gridTemplateColumns: columns >= 4.5
                  ? 'repeat(5, 1fr)'
                  : columns >= 3.5
                    ? 'repeat(4, 1fr)'
                    : columns >= 2.5
                      ? 'repeat(3, 1fr)'
                      : columns >= 1.5
                        ? 'repeat(2, 1fr)'
                        : '1fr',
                gap: `${gap}px`,
                transform: normalizedPhase3 > 0 ? `scale(${photoScale})` : 'none',
                transformOrigin: 'center center',
              }}
            >
              {images.map((img, i) => (
                <div
                  key={i}
                  className="v27-grid-item"
                  style={{
                    opacity: normalizedPhase3 > 0.5
                      ? Math.max(0, 1 - (normalizedPhase3 - 0.5) * 2)
                      : 1,
                  }}
                >
                  <img
                    src={`/images/large/${img.src}`}
                    alt={`${img.name} - ${img.city}`}
                    loading={i < 10 ? 'eager' : 'lazy'}
                  />
                  <div className="v27-caption" style={{ opacity: captionOpacity }}>
                    <div className="v27-caption-name">{img.name}</div>
                    <div className="v27-caption-city">{img.city}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Full-viewport single photos */}
      {isFullscreen && (
        <div className="v27-singles-container">
          {/* Spacer to account for transition scroll distance */}
          <div style={{ height: `${window.innerHeight * 0.6}px` }} />
          {images.map((img, i) => (
            <div key={i} style={{ height: '100vh', position: 'relative' }}>
              <div className="v27-single-photo">
                <img
                  src={`/images/large/${img.src}`}
                  alt={`${img.name} - ${img.city}`}
                  loading={i < 3 ? 'eager' : 'lazy'}
                />
                <div className="v27-single-caption">
                  <div className="v27-single-name">{img.name}</div>
                  <div className="v27-single-city">{img.city}</div>
                </div>
              </div>
            </div>
          ))}
          {/* CTA */}
          <div className="v27-cta">
            <div className="v27-cta-title">Let&apos;s Create Together</div>
            <a href="mailto:hello@aidantorrence.com" className="v27-cta-btn">
              Get in Touch
            </a>
          </div>
        </div>
      )}
    </>
  );
}
