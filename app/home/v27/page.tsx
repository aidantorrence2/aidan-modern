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

// Easing function for smoother transitions
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export default function GridToFullscreenPage() {
  const [mounted, setMounted] = useState(false);
  const scrollDataRef = useRef({
    progress: 0,
    phase1: 0,
    phase2: 0,
    phase3: 0,
    currentIndex: 0,
    scrollY: 0,
  });
  const rafRef = useRef<number>(0);
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const titleRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);
  const captionsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updateLayout = useCallback(() => {
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const scrollY = window.scrollY;

    // Transition scroll zone
    const transitionHeight = vh * 1.5;
    const rawProgress = Math.min(scrollY / transitionHeight, 1);
    const progress = rawProgress;

    // Phase breakpoints
    const PHASE1_END = 0.33; // gap expansion
    const PHASE2_END = 0.66; // column reduction
    // Phase 3: 0.66 -> 1.0: scale up to fullscreen

    const phase1 = Math.min(progress / PHASE1_END, 1);
    const phase2 = progress <= PHASE1_END ? 0 : Math.min((progress - PHASE1_END) / (PHASE2_END - PHASE1_END), 1);
    const phase3 = progress <= PHASE2_END ? 0 : Math.min((progress - PHASE2_END) / (1 - PHASE2_END), 1);

    const ep1 = easeInOutCubic(phase1);
    const ep2 = easeInOutCubic(phase2);
    const ep3 = easeInOutCubic(phase3);

    // Current photo index (in single-photo scrolling mode)
    let currentIndex = 0;
    if (progress >= 1) {
      const singleStart = transitionHeight;
      const scrollInSingles = scrollY - singleStart;
      currentIndex = Math.floor(scrollInSingles / vh);
      currentIndex = Math.max(0, Math.min(currentIndex, images.length - 1));
    }

    scrollDataRef.current = { progress, phase1: ep1, phase2: ep2, phase3: ep3, currentIndex, scrollY };

    // Update title overlay
    if (titleRef.current) {
      const titleOp = Math.max(0, 1 - ep1 * 2);
      titleRef.current.style.opacity = String(titleOp);
      titleRef.current.style.display = titleOp < 0.01 ? 'none' : 'flex';
    }

    // Update counter
    if (counterRef.current) {
      const counterOp = progress >= 1 ? 1 : ep3;
      counterRef.current.style.opacity = String(counterOp);
      counterRef.current.textContent = `${String(currentIndex + 1).padStart(2, '0')} / ${images.length}`;
    }

    // Grid container
    const container = gridContainerRef.current;
    if (!container) return;

    if (progress < 1) {
      // --- GRID MODE (transitioning) ---
      container.style.position = 'sticky';
      container.style.top = '0';
      container.style.height = '100vh';

      // Calculate grid properties
      const gap = lerp(4, 40, ep1);

      // Column count: smooth 5 -> 3 (phase2 first half) -> 1 (phase2 second half)
      let columns: number;
      if (ep2 <= 0) {
        columns = 5;
      } else if (ep2 <= 0.5) {
        columns = lerp(5, 3, ep2 * 2);
      } else {
        columns = lerp(3, 1, (ep2 - 0.5) * 2);
      }

      // Padding around the grid
      const padding = lerp(24, 40, ep1);

      // Available width
      const availableWidth = vw - padding * 2;
      const colCount = Math.max(1, Math.round(columns));
      const itemWidth = (availableWidth - gap * (colCount - 1)) / colCount;
      const itemHeight = itemWidth * (4 / 3);

      // Phase 3 scale-up effect
      const scale = lerp(1, 1.8, ep3);
      const gridOpacity = lerp(1, 0, Math.max(0, (ep3 - 0.7) / 0.3));

      // Position items in a CSS-grid-like layout
      const rows = Math.ceil(images.length / colCount);
      const totalGridHeight = rows * itemHeight + (rows - 1) * gap;
      const totalGridWidth = colCount * itemWidth + (colCount - 1) * gap;

      // Center the grid vertically
      const offsetY = (vh - totalGridHeight * scale) / 2;
      const offsetX = (vw - totalGridWidth * scale) / 2;

      for (let i = 0; i < images.length; i++) {
        const el = itemsRef.current[i];
        if (!el) continue;

        const col = i % colCount;
        const row = Math.floor(i / colCount);

        const x = offsetX + (col * (itemWidth + gap)) * scale;
        const y = offsetY + (row * (itemHeight + gap)) * scale;
        const w = itemWidth * scale;
        const h = itemHeight * scale;

        el.style.position = 'absolute';
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        el.style.width = `${w}px`;
        el.style.height = `${h}px`;
        el.style.opacity = String(gridOpacity);
        el.style.borderRadius = `${lerp(2, 4, ep2)}px`;

        // Caption
        const caption = captionsRef.current[i];
        if (caption) {
          caption.style.opacity = String(ep3);
        }
      }
    } else {
      // --- SINGLE PHOTO MODE ---
      container.style.position = 'relative';
      container.style.top = 'auto';
      container.style.height = 'auto';

      for (let i = 0; i < images.length; i++) {
        const el = itemsRef.current[i];
        if (!el) continue;

        el.style.position = 'relative';
        el.style.left = '0';
        el.style.top = '0';
        el.style.width = '100vw';
        el.style.height = '100vh';
        el.style.opacity = '1';
        el.style.borderRadius = '0';

        const caption = captionsRef.current[i];
        if (caption) {
          caption.style.opacity = '1';
        }
      }
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updateLayout);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    updateLayout();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [mounted, updateLayout]);

  if (!mounted) return null;

  // Total page height: transition zone + each photo 100vh + CTA
  const vh = typeof window !== 'undefined' ? window.innerHeight : 900;
  const totalHeight = vh * 1.5 + images.length * vh + vh;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        body > header, body > footer, .fixed.inset-x-0.bottom-0 { display: none !important; }
        html { scroll-behavior: auto; }
        body { background: #0c0c0c; margin: 0; overflow-x: hidden; }
        * { box-sizing: border-box; }

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
          pointer-events: auto;
        }
        .v27-nav a {
          color: #fff;
          text-decoration: none;
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 13px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          pointer-events: auto;
        }
        .v27-nav a:hover { opacity: 0.6; }

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
          font-size: clamp(28px, 5.5vw, 76px);
          font-weight: 200;
          letter-spacing: 0.4em;
          text-transform: uppercase;
          color: #fff;
          text-shadow: 0 2px 60px rgba(0,0,0,0.8);
          white-space: nowrap;
          text-indent: 0.4em;
        }

        .v27-counter {
          position: fixed;
          bottom: 40px;
          right: 40px;
          z-index: 80;
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 14px;
          letter-spacing: 0.12em;
          color: rgba(255,255,255,0.5);
          font-variant-numeric: tabular-nums;
          opacity: 0;
        }

        .v27-scroll-spacer {
          position: relative;
          width: 100%;
          pointer-events: none;
        }

        .v27-grid-container {
          position: sticky;
          top: 0;
          width: 100%;
          height: 100vh;
          overflow: hidden;
        }

        .v27-item {
          position: absolute;
          overflow: hidden;
          will-change: left, top, width, height, opacity;
        }
        .v27-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .v27-caption {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 32px 40px;
          background: linear-gradient(transparent, rgba(0,0,0,0.55));
          pointer-events: none;
          opacity: 0;
        }
        .v27-caption-name {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 22px;
          font-weight: 300;
          letter-spacing: 0.1em;
          color: #fff;
          text-transform: uppercase;
          margin-bottom: 5px;
        }
        .v27-caption-city {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 12px;
          letter-spacing: 0.2em;
          color: rgba(255,255,255,0.45);
          text-transform: uppercase;
        }

        .v27-cta {
          position: relative;
          width: 100%;
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 28px;
        }
        .v27-cta-heading {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: clamp(22px, 4vw, 52px);
          font-weight: 200;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: #fff;
          text-indent: 0.3em;
        }
        .v27-cta-sub {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 14px;
          letter-spacing: 0.1em;
          color: rgba(255,255,255,0.4);
          margin-bottom: 8px;
        }
        .v27-cta-btn {
          display: inline-block;
          padding: 16px 52px;
          border: 1px solid rgba(255,255,255,0.25);
          color: #fff;
          text-decoration: none;
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 13px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          transition: all 0.35s ease;
          background: transparent;
          cursor: pointer;
        }
        .v27-cta-btn:hover {
          background: #fff;
          color: #0c0c0c;
          border-color: #fff;
        }
      `}} />

      {/* Fixed nav */}
      <nav className="v27-nav">
        <a href="#">Portfolio</a>
        <a href="#">Contact</a>
      </nav>

      {/* Title overlay */}
      <div ref={titleRef} className="v27-title-overlay">
        <div className="v27-title-text">Aidan Torrence</div>
      </div>

      {/* Counter */}
      <div ref={counterRef} className="v27-counter">
        01 / {images.length}
      </div>

      {/* Scroll spacer - creates the scrollable height for the transition */}
      <div className="v27-scroll-spacer" style={{ height: `${vh * 1.5}px` }}>
        <div ref={gridContainerRef} className="v27-grid-container">
          {images.map((img, i) => (
            <div
              key={i}
              ref={(el) => { itemsRef.current[i] = el; }}
              className="v27-item"
            >
              <img
                src={`/images/large/${img.src}`}
                alt={`${img.name} - ${img.city}`}
                loading={i < 10 ? 'eager' : 'lazy'}
              />
              <div
                ref={(el) => { captionsRef.current[i] = el; }}
                className="v27-caption"
              >
                <div className="v27-caption-name">{img.name}</div>
                <div className="v27-caption-city">{img.city}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Single-photo scroll sections (rendered below the transition zone) */}
      {images.map((img, i) => (
        <div
          key={`single-${i}`}
          style={{
            position: 'relative',
            width: '100%',
            height: '100vh',
            overflow: 'hidden',
          }}
        >
          <img
            src={`/images/large/${img.src}`}
            alt={`${img.name} - ${img.city}`}
            loading="lazy"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
          <div className="v27-caption" style={{ opacity: 1 }}>
            <div className="v27-caption-name">{img.name}</div>
            <div className="v27-caption-city">{img.city}</div>
          </div>
        </div>
      ))}

      {/* CTA */}
      <div className="v27-cta">
        <div className="v27-cta-sub">25 portraits across 12 cities</div>
        <div className="v27-cta-heading">Let&apos;s Create Together</div>
        <a href="mailto:hello@aidantorrence.com" className="v27-cta-btn">
          Get in Touch
        </a>
      </div>
    </>
  );
}
