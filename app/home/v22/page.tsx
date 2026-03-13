'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

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

/* Each photo gets SCROLL_PER_PHOTO pixels of scroll distance.
   During that distance the photo scales from 1x -> 3x while the next
   photo is "hidden behind" it at a tiny scale, then crossfades. */
const SCROLL_PER_PHOTO = 1800;
/* Extra scroll for the initial mosaic-to-title zoom */
const MOSAIC_SCROLL = 2400;
/* Extra scroll at the end for the CTA */
const CTA_SCROLL = 1600;
const TOTAL_SCROLL = MOSAIC_SCROLL + images.length * SCROLL_PER_PHOTO + CTA_SCROLL;

export default function V22Page() {
  const [scrollY, setScrollY] = useState(0);
  const rafRef = useRef<number>(0);
  const scrollRef = useRef(0);
  const currentScroll = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const tick = useCallback(() => {
    const target = scrollRef.current;
    currentScroll.current += (target - currentScroll.current) * 0.12;
    if (Math.abs(target - currentScroll.current) < 0.5) {
      currentScroll.current = target;
    }
    setScrollY(currentScroll.current);
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      scrollRef.current = window.scrollY;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, [tick]);

  /* ---- Mosaic phase ---- */
  const mosaicProgress = Math.min(1, Math.max(0, scrollY / MOSAIC_SCROLL));
  // Mosaic zooms from a tiny overview (scale ~0.04) to full screen (scale 1)
  const mosaicScale = 0.04 + mosaicProgress * 0.96;
  const mosaicOpacity = mosaicProgress < 0.7 ? 1 : 1 - (mosaicProgress - 0.7) / 0.3;
  const titleOpacity = mosaicProgress < 0.6 ? 0 : mosaicProgress < 0.85 ? (mosaicProgress - 0.6) / 0.25 : 1 - (mosaicProgress - 0.85) / 0.15;

  /* ---- Photo zoom phase ---- */
  const photoScrollStart = MOSAIC_SCROLL;
  const photoScroll = Math.max(0, scrollY - photoScrollStart);
  const rawIndex = photoScroll / SCROLL_PER_PHOTO;
  const currentIndex = Math.min(Math.floor(rawIndex), images.length - 1);
  const localProgress = rawIndex - currentIndex; // 0..1 within current photo

  /* Scale goes 1x -> 3x over the scroll distance for each photo.
     When localProgress hits ~0.7, the next photo starts fading in at 1x. */
  const zoomScale = 1 + localProgress * 2;

  /* The "clarity" zone is roughly 0.0 - 0.3 of local progress (caption visible).
     Crossfade zone is 0.6 - 1.0. */
  const captionOpacity = localProgress < 0.05 ? localProgress / 0.05 : localProgress < 0.3 ? 1 : localProgress < 0.45 ? 1 - (localProgress - 0.3) / 0.15 : 0;
  const crossfadeNext = localProgress < 0.6 ? 0 : (localProgress - 0.6) / 0.4;

  const showPhotos = mosaicProgress >= 0.85;

  /* ---- CTA phase ---- */
  const ctaScrollStart = photoScrollStart + images.length * SCROLL_PER_PHOTO;
  const ctaProgress = Math.min(1, Math.max(0, (scrollY - ctaScrollStart) / CTA_SCROLL));

  /* Counter */
  const displayIndex = showPhotos ? currentIndex : -1;

  /* Mosaic grid: 5 columns x 5 rows */
  const cols = 5;
  const tileW = 100 / cols;
  const tileH = 100 / cols;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        body > header, body > footer, .fixed.inset-x-0.bottom-0 { display: none !important; }
        html, body { margin: 0; padding: 0; background: #0c0c0c; overflow-x: hidden; }

        .v22-spacer {
          height: ${TOTAL_SCROLL}px;
          width: 1px;
          position: relative;
          z-index: -1;
        }

        .v22-fixed {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          overflow: hidden;
          z-index: 1;
        }

        .v22-nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 1000;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 36px;
          pointer-events: none;
          mix-blend-mode: difference;
        }
        .v22-nav a, .v22-nav span { pointer-events: auto; }
        .v22-nav-link {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 13px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.7);
          text-decoration: none;
          transition: color 0.3s;
          cursor: pointer;
        }
        .v22-nav-link:hover { color: #fff; }

        /* Mosaic */
        .v22-mosaic {
          position: absolute;
          top: 50%; left: 50%;
          width: 100vw; height: 100vh;
          transform-origin: center center;
        }
        .v22-mosaic-tile {
          position: absolute;
          overflow: hidden;
        }
        .v22-mosaic-tile img {
          width: 100%; height: 100%;
          object-fit: cover;
          display: block;
        }

        /* Title card */
        .v22-title-card {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }
        .v22-title-main {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: clamp(32px, 6vw, 72px);
          font-weight: 300;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #fff;
          text-align: center;
          line-height: 1.2;
        }
        .v22-title-sub {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: clamp(11px, 1.4vw, 15px);
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.45);
          margin-top: 20px;
        }

        /* Photo layers */
        .v22-photo-layer {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          will-change: transform, opacity;
        }
        .v22-photo-layer img {
          width: 100vw;
          height: 100vh;
          object-fit: cover;
        }

        /* Caption */
        .v22-caption {
          position: absolute;
          bottom: 12%;
          left: 0; right: 0;
          text-align: center;
          z-index: 20;
          pointer-events: none;
        }
        .v22-caption-name {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: clamp(14px, 2vw, 22px);
          font-weight: 300;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #fff;
        }
        .v22-caption-city {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: clamp(10px, 1.2vw, 13px);
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.5);
          margin-top: 6px;
        }

        /* Counter */
        .v22-counter {
          position: fixed;
          bottom: 32px;
          right: 36px;
          z-index: 1000;
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 12px;
          letter-spacing: 0.15em;
          color: rgba(255,255,255,0.4);
          font-variant-numeric: tabular-nums;
          mix-blend-mode: difference;
        }

        /* Scroll indicator */
        .v22-scroll-hint {
          position: fixed;
          bottom: 36px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          transition: opacity 0.6s;
        }
        .v22-scroll-hint span {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 10px;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
        }
        .v22-scroll-line {
          width: 1px;
          height: 32px;
          background: rgba(255,255,255,0.25);
          animation: v22-pulse 2s ease-in-out infinite;
        }
        @keyframes v22-pulse {
          0%, 100% { transform: scaleY(1); opacity: 0.4; }
          50% { transform: scaleY(1.4); opacity: 1; }
        }

        /* CTA */
        .v22-cta {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 30;
        }
        .v22-cta-heading {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: clamp(24px, 4.5vw, 56px);
          font-weight: 300;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #fff;
          text-align: center;
          margin-bottom: 40px;
        }
        .v22-cta-button {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 13px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #fff;
          text-decoration: none;
          border: 1px solid rgba(255,255,255,0.35);
          padding: 16px 48px;
          transition: all 0.4s;
          cursor: pointer;
          background: none;
        }
        .v22-cta-button:hover {
          background: #fff;
          color: #0c0c0c;
          border-color: #fff;
        }

        /* Vignette overlay for depth */
        .v22-vignette {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.5) 100%);
          pointer-events: none;
          z-index: 15;
        }
      `}} />

      <div className="v22-spacer" />

      <div className="v22-fixed" ref={containerRef}>
        {/* === MOSAIC PHASE === */}
        {mosaicProgress < 1 && (
          <div
            className="v22-mosaic"
            style={{
              transform: `translate(-50%, -50%) scale(${mosaicScale})`,
              opacity: mosaicOpacity,
            }}
          >
            {images.map((img, i) => {
              const col = i % cols;
              const row = Math.floor(i / cols);
              return (
                <div
                  key={i}
                  className="v22-mosaic-tile"
                  style={{
                    left: `${col * tileW}%`,
                    top: `${row * tileH}%`,
                    width: `${tileW}%`,
                    height: `${tileH}%`,
                    padding: '2px',
                    boxSizing: 'border-box',
                  }}
                >
                  <img
                    src={`/images/large/${img.src}`}
                    alt={img.name}
                    loading={i < 10 ? 'eager' : 'lazy'}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* === TITLE CARD (first frame you zoom into) === */}
        {mosaicProgress > 0.5 && mosaicProgress < 1 && (
          <div
            className="v22-title-card"
            style={{ opacity: titleOpacity }}
          >
            <div className="v22-title-main">Aidan Torrence</div>
            <div className="v22-title-sub">Photographer</div>
          </div>
        )}

        {/* === PHOTO ZOOM LAYERS === */}
        {showPhotos && ctaProgress < 0.3 && (() => {
          const layers = [];

          /* Current photo: zooming from 1x -> 3x */
          if (currentIndex < images.length) {
            const img = images[currentIndex];
            layers.push(
              <div
                key={`current-${currentIndex}`}
                className="v22-photo-layer"
                style={{
                  transform: `scale(${zoomScale})`,
                  opacity: 1 - crossfadeNext,
                  zIndex: 2,
                }}
              >
                <img
                  src={`/images/large/${img.src}`}
                  alt={img.name}
                />
              </div>
            );
          }

          /* Next photo: fading in at 1x as current zooms past ~2.2x */
          if (currentIndex + 1 < images.length && crossfadeNext > 0) {
            const nextImg = images[currentIndex + 1];
            layers.push(
              <div
                key={`next-${currentIndex + 1}`}
                className="v22-photo-layer"
                style={{
                  transform: 'scale(1)',
                  opacity: crossfadeNext,
                  zIndex: 1,
                }}
              >
                <img
                  src={`/images/large/${nextImg.src}`}
                  alt={nextImg.name}
                />
              </div>
            );
          }

          /* If we're at the very last photo after full zoom, hold it */
          if (currentIndex === images.length - 1 && localProgress >= 1) {
            const img = images[currentIndex];
            layers.push(
              <div
                key="final-hold"
                className="v22-photo-layer"
                style={{
                  transform: 'scale(3)',
                  opacity: 1,
                  zIndex: 2,
                }}
              >
                <img
                  src={`/images/large/${img.src}`}
                  alt={img.name}
                />
              </div>
            );
          }

          return layers;
        })()}

        {/* Vignette for depth during zoom */}
        {showPhotos && ctaProgress < 0.3 && (
          <div className="v22-vignette" />
        )}

        {/* === CAPTION === */}
        {showPhotos && captionOpacity > 0 && currentIndex < images.length && ctaProgress < 0.1 && (
          <div className="v22-caption" style={{ opacity: captionOpacity }}>
            <div className="v22-caption-name">{images[currentIndex].name}</div>
            <div className="v22-caption-city">{images[currentIndex].city}</div>
          </div>
        )}

        {/* === CTA (final zoom destination) === */}
        {ctaProgress > 0 && (
          <div
            className="v22-cta"
            style={{
              opacity: ctaProgress < 0.3 ? ctaProgress / 0.3 : 1,
              background: `rgba(12,12,12,${Math.min(1, ctaProgress * 1.5)})`,
            }}
          >
            <div
              className="v22-cta-heading"
              style={{
                transform: `scale(${0.85 + ctaProgress * 0.15})`,
                opacity: ctaProgress < 0.4 ? ctaProgress / 0.4 : 1,
              }}
            >
              Let&rsquo;s Create Together
            </div>
            <a
              href="/contact"
              className="v22-cta-button"
              style={{
                opacity: ctaProgress < 0.6 ? 0 : (ctaProgress - 0.6) / 0.4,
                transform: `translateY(${(1 - Math.min(1, Math.max(0, (ctaProgress - 0.6) / 0.4))) * 20}px)`,
              }}
            >
              Inquire
            </a>
          </div>
        )}
      </div>

      {/* === NAV === */}
      <nav className="v22-nav">
        <span className="v22-nav-link">Aidan Torrence</span>
        <a href="/contact" className="v22-nav-link">Inquire</a>
      </nav>

      {/* === COUNTER === */}
      {showPhotos && displayIndex >= 0 && ctaProgress < 0.5 && (
        <div
          className="v22-counter"
          style={{ opacity: ctaProgress > 0.2 ? 1 - (ctaProgress - 0.2) / 0.3 : 1 }}
        >
          {String(displayIndex + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
        </div>
      )}

      {/* === SCROLL HINT === */}
      <div
        className="v22-scroll-hint"
        style={{ opacity: scrollY < 100 ? 1 : 0, pointerEvents: 'none' }}
      >
        <span>Scroll to explore</span>
        <div className="v22-scroll-line" />
      </div>
    </>
  );
}
