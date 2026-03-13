'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

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

export default function HomeV7() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [expandRect, setExpandRect] = useState<DOMRect | null>(null);
  const [phase, setPhase] = useState<'idle' | 'expanding' | 'expanded' | 'collapsing'>('idle');
  const gridRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  const openImage = useCallback((index: number) => {
    if (isAnimating) return;
    const el = gridRefs.current[index];
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setExpandRect(rect);
    setSelectedIndex(index);
    setIsAnimating(true);
    setPhase('expanding');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setPhase('expanded');
        setTimeout(() => setIsAnimating(false), 500);
      });
    });
  }, [isAnimating]);

  const closeImage = useCallback(() => {
    if (isAnimating || selectedIndex === null) return;
    setIsAnimating(true);
    setPhase('collapsing');
    const el = gridRefs.current[selectedIndex];
    if (el) {
      setExpandRect(el.getBoundingClientRect());
    }
    setTimeout(() => {
      setPhase('idle');
      setSelectedIndex(null);
      setExpandRect(null);
      setIsAnimating(false);
    }, 500);
  }, [isAnimating, selectedIndex]);

  const navigate = useCallback((direction: 1 | -1) => {
    if (selectedIndex === null || isAnimating) return;
    const next = (selectedIndex + direction + images.length) % images.length;
    const el = gridRefs.current[next];
    if (el) {
      setExpandRect(el.getBoundingClientRect());
    }
    setSelectedIndex(next);
  }, [selectedIndex, isAnimating]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === 'Escape') closeImage();
      if (e.key === 'ArrowLeft') navigate(-1);
      if (e.key === 'ArrowRight') navigate(1);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedIndex, closeImage, navigate]);

  const isOpen = phase === 'expanding' || phase === 'expanded';
  const isClosing = phase === 'collapsing';

  const getExpandStyle = () => {
    if (!expandRect) return {};
    if (phase === 'expanding') {
      return {
        top: expandRect.top,
        left: expandRect.left,
        width: expandRect.width,
        height: expandRect.height,
      };
    }
    if (phase === 'expanded') {
      const vw = window.innerWidth * 0.85;
      const vh = window.innerHeight * 0.75;
      return {
        top: (window.innerHeight - vh) / 2 - 20,
        left: (window.innerWidth - vw) / 2,
        width: vw,
        height: vh,
      };
    }
    if (phase === 'collapsing') {
      return {
        top: expandRect.top,
        left: expandRect.left,
        width: expandRect.width,
        height: expandRect.height,
      };
    }
    return {};
  };

  const expandStyle = getExpandStyle();

  return (
    <>
      <div
        dangerouslySetInnerHTML={{
          __html: `<style>
            body > header, body > footer, .fixed.inset-x-0.bottom-0 { display: none !important; }
            body { background: #0c0c0c !important; color: #fff; margin: 0; overflow: hidden; }

            .cs-page {
              position: fixed;
              inset: 0;
              background: #0c0c0c;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif;
              overflow: hidden;
            }

            .cs-nav {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 18px 28px;
              z-index: 100;
              pointer-events: none;
            }
            .cs-nav a, .cs-nav span {
              pointer-events: auto;
            }
            .cs-nav-inquire {
              font-size: 11px;
              letter-spacing: 3px;
              text-transform: uppercase;
              color: rgba(255,255,255,0.7);
              text-decoration: none;
              transition: color 0.3s;
              cursor: pointer;
            }
            .cs-nav-inquire:hover { color: #fff; }
            .cs-nav-name {
              font-size: 10px;
              letter-spacing: 2px;
              text-transform: uppercase;
              color: rgba(255,255,255,0.45);
            }

            .cs-grid-wrapper {
              position: relative;
              width: min(88vw, 88vh);
              height: min(88vw, 88vh);
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .cs-watermark {
              position: absolute;
              inset: 0;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              z-index: 0;
              pointer-events: none;
              gap: 4px;
            }
            .cs-watermark-line {
              font-size: clamp(20px, 4.5vw, 58px);
              font-weight: 700;
              letter-spacing: 0.35em;
              text-transform: uppercase;
              color: rgba(255,255,255,0.04);
              white-space: nowrap;
              line-height: 1.1;
            }

            .cs-grid {
              position: relative;
              z-index: 1;
              display: grid;
              grid-template-columns: repeat(5, 1fr);
              grid-template-rows: repeat(5, 1fr);
              gap: 2px;
              width: 100%;
              height: 100%;
              transition: filter 0.5s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1);
            }
            .cs-grid.dimmed {
              filter: blur(6px) brightness(0.25);
              opacity: 0.5;
            }

            .cs-cell {
              position: relative;
              overflow: hidden;
              cursor: pointer;
              background: #1a1a1a;
              opacity: 0;
              transform: scale(0.92);
              transition: opacity 0.4s ease, transform 0.4s ease;
            }
            .cs-cell.loaded {
              opacity: 1;
              transform: scale(1);
            }
            .cs-cell::after {
              content: '';
              position: absolute;
              inset: 0;
              background: rgba(0,0,0,0.15);
              transition: background 0.3s;
              pointer-events: none;
            }
            .cs-cell:hover::after {
              background: rgba(0,0,0,0);
            }
            .cs-cell:hover {
              z-index: 2;
            }

            .cs-cell img {
              width: 100%;
              height: 100%;
              object-fit: cover;
              display: block;
              transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
            }
            .cs-cell:hover img {
              transform: scale(1.08);
            }

            .cs-frame-num {
              position: absolute;
              top: 3px;
              left: 4px;
              font-size: 8px;
              font-family: 'Courier New', monospace;
              color: rgba(255,255,255,0.5);
              z-index: 3;
              pointer-events: none;
              text-shadow: 0 1px 3px rgba(0,0,0,0.8);
              letter-spacing: 0.5px;
            }

            .cs-overlay {
              position: fixed;
              inset: 0;
              z-index: 50;
              pointer-events: none;
              opacity: 0;
              background: rgba(6, 6, 6, 0.92);
              transition: opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1);
            }
            .cs-overlay.active {
              opacity: 1;
              pointer-events: auto;
            }
            .cs-overlay.closing {
              opacity: 0;
            }

            .cs-expanded-img {
              position: fixed;
              z-index: 60;
              overflow: hidden;
              border-radius: 2px;
              box-shadow: 0 30px 100px rgba(0,0,0,0.7);
              transition: top 0.5s cubic-bezier(0.22, 1, 0.36, 1),
                          left 0.5s cubic-bezier(0.22, 1, 0.36, 1),
                          width 0.5s cubic-bezier(0.22, 1, 0.36, 1),
                          height 0.5s cubic-bezier(0.22, 1, 0.36, 1),
                          opacity 0.3s ease;
            }
            .cs-expanded-img img {
              width: 100%;
              height: 100%;
              object-fit: cover;
              display: block;
            }

            .cs-caption {
              position: fixed;
              z-index: 70;
              left: 50%;
              transform: translateX(-50%);
              text-align: center;
              opacity: 0;
              transition: opacity 0.4s ease 0.15s, bottom 0.4s ease 0.15s;
              pointer-events: none;
            }
            .cs-caption.visible {
              opacity: 1;
            }
            .cs-caption-name {
              font-size: 14px;
              letter-spacing: 4px;
              text-transform: uppercase;
              color: rgba(255,255,255,0.9);
              font-weight: 300;
            }
            .cs-caption-city {
              font-size: 10px;
              letter-spacing: 3px;
              text-transform: uppercase;
              color: rgba(255,255,255,0.4);
              margin-top: 4px;
            }
            .cs-caption-count {
              font-size: 9px;
              letter-spacing: 2px;
              color: rgba(255,255,255,0.25);
              margin-top: 8px;
              font-family: 'Courier New', monospace;
            }

            .cs-arrow {
              position: fixed;
              z-index: 80;
              top: 50%;
              transform: translateY(-50%);
              background: none;
              border: 1px solid rgba(255,255,255,0.15);
              color: rgba(255,255,255,0.6);
              width: 44px;
              height: 44px;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              font-size: 18px;
              transition: all 0.3s;
              border-radius: 50%;
              opacity: 0;
              pointer-events: none;
            }
            .cs-arrow.visible {
              opacity: 1;
              pointer-events: auto;
            }
            .cs-arrow:hover {
              border-color: rgba(255,255,255,0.5);
              color: #fff;
              background: rgba(255,255,255,0.05);
            }
            .cs-arrow-left { left: 24px; }
            .cs-arrow-right { right: 24px; }

            .cs-hint {
              position: fixed;
              bottom: 22px;
              left: 50%;
              transform: translateX(-50%);
              font-size: 9px;
              letter-spacing: 3px;
              text-transform: uppercase;
              color: rgba(255,255,255,0.2);
              z-index: 10;
              transition: opacity 0.5s;
              animation: cs-pulse 3s ease-in-out infinite;
            }
            .cs-hint.hidden { opacity: 0; }

            @keyframes cs-pulse {
              0%, 100% { opacity: 0.2; }
              50% { opacity: 0.4; }
            }

            .cs-close {
              position: fixed;
              top: 20px;
              right: 28px;
              z-index: 90;
              background: none;
              border: none;
              color: rgba(255,255,255,0.5);
              font-size: 20px;
              cursor: pointer;
              width: 36px;
              height: 36px;
              display: flex;
              align-items: center;
              justify-content: center;
              transition: color 0.3s;
              opacity: 0;
              pointer-events: none;
            }
            .cs-close.visible {
              opacity: 1;
              pointer-events: auto;
            }
            .cs-close:hover { color: #fff; }
          </style>`,
        }}
      />

      <div className="cs-page">
        {/* Navigation */}
        <div className="cs-nav">
          <a className="cs-nav-inquire" href="#">Inquire</a>
          <span className="cs-nav-name">Aidan Torrence / Film Photographer</span>
        </div>

        {/* Grid wrapper */}
        <div className="cs-grid-wrapper">
          {/* Watermark behind grid */}
          <div className="cs-watermark">
            <div className="cs-watermark-line">Aidan</div>
            <div className="cs-watermark-line">Torrence</div>
          </div>

          {/* Contact sheet grid */}
          <div className={`cs-grid ${(isOpen || isClosing) ? 'dimmed' : ''}`}>
            {images.map((img, i) => (
              <div
                key={i}
                ref={(el) => { gridRefs.current[i] = el; }}
                className={`cs-cell ${loaded ? 'loaded' : ''}`}
                style={{ transitionDelay: loaded ? `${i * 30}ms` : '0ms' }}
                onClick={() => openImage(i)}
              >
                <span className="cs-frame-num">{String(i + 1).padStart(2, '0')}</span>
                <img
                  src={`/images/large/${img.src}`}
                  alt={`${img.name} — ${img.city}`}
                  loading={i < 10 ? 'eager' : 'lazy'}
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Hint */}
        <div className={`cs-hint ${(isOpen || isClosing) ? 'hidden' : ''}`}>
          Click to explore
        </div>

        {/* Overlay backdrop */}
        <div
          className={`cs-overlay ${isOpen ? 'active' : ''} ${isClosing ? 'active closing' : ''}`}
          onClick={closeImage}
        />

        {/* Expanded image */}
        {selectedIndex !== null && expandRect && (
          <>
            <div
              className="cs-expanded-img"
              style={{
                top: expandStyle.top,
                left: expandStyle.left,
                width: expandStyle.width,
                height: expandStyle.height,
                opacity: isClosing && phase === 'collapsing' ? 0 : 1,
              }}
            >
              <img
                src={`/images/large/${images[selectedIndex].src}`}
                alt={`${images[selectedIndex].name} — ${images[selectedIndex].city}`}
                draggable={false}
              />
            </div>

            {/* Caption */}
            <div
              className={`cs-caption ${phase === 'expanded' ? 'visible' : ''}`}
              style={{
                bottom: `calc(${(window.innerHeight - window.innerHeight * 0.75) / 2 - 20}px - 60px)`,
              }}
            >
              <div className="cs-caption-name">{images[selectedIndex].name}</div>
              <div className="cs-caption-city">{images[selectedIndex].city}</div>
              <div className="cs-caption-count">
                {String(selectedIndex + 1).padStart(2, '0')} / {images.length}
              </div>
            </div>

            {/* Navigation arrows */}
            <button
              className={`cs-arrow cs-arrow-left ${phase === 'expanded' ? 'visible' : ''}`}
              onClick={(e) => { e.stopPropagation(); navigate(-1); }}
              aria-label="Previous image"
            >
              &#8592;
            </button>
            <button
              className={`cs-arrow cs-arrow-right ${phase === 'expanded' ? 'visible' : ''}`}
              onClick={(e) => { e.stopPropagation(); navigate(1); }}
              aria-label="Next image"
            >
              &#8594;
            </button>

            {/* Close button */}
            <button
              className={`cs-close ${phase === 'expanded' ? 'visible' : ''}`}
              onClick={closeImage}
              aria-label="Close"
            >
              &#10005;
            </button>
          </>
        )}
      </div>
    </>
  );
}
