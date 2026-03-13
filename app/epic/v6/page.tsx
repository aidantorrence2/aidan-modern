'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

const images = [
  'manila-gallery-dsc-0075.jpg',
  'manila-gallery-canal-001.jpg',
  'manila-gallery-night-001.jpg',
  'manila-gallery-closeup-001.jpg',
  'manila-gallery-street-001.jpg',
  'manila-gallery-garden-001.jpg',
  'manila-gallery-ivy-001.jpg',
  'manila-gallery-dsc-0130.jpg',
  'manila-gallery-urban-001.jpg',
  'manila-gallery-shadow-001.jpg',
  'manila-gallery-tropical-001.jpg',
  'manila-gallery-night-002.jpg',
  'manila-gallery-market-001.jpg',
  'manila-gallery-dsc-0190.jpg',
  'manila-gallery-park-001.jpg',
  'manila-gallery-canal-002.jpg',
  'manila-gallery-dsc-0911.jpg',
  'manila-gallery-garden-002.jpg',
  'manila-gallery-urban-002.jpg',
  'manila-gallery-night-003.jpg',
];

const TOTAL_SLIDES = images.length + 1; // +1 for contact slide

const CSS = `
  body > header, body > footer, .fixed.inset-x-0.bottom-0 { display: none !important; }
  html, body { background: #0d0d0d !important; margin: 0; padding: 0; overflow: hidden; height: 100%; }

  .v6-container {
    position: fixed;
    inset: 0;
    overflow: hidden;
  }

  .v6-track {
    display: flex;
    height: 100%;
    transition: transform 0.45s cubic-bezier(0.25, 0.1, 0.25, 1);
    will-change: transform;
  }

  .v6-slide {
    flex: 0 0 100vw;
    width: 100vw;
    height: 100dvh;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .v6-slide img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }

  .v6-slide-gradient {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      rgba(0,0,0,0.35) 0%,
      transparent 25%,
      transparent 70%,
      rgba(0,0,0,0.5) 100%
    );
    pointer-events: none;
  }

  .v6-nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 20;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 20px;
  }

  .v6-nav-name {
    font-family: -apple-system, 'Helvetica Neue', sans-serif;
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.9);
    text-shadow: 0 1px 8px rgba(0,0,0,0.5);
  }

  .v6-nav-inquire {
    font-family: -apple-system, 'Helvetica Neue', sans-serif;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.85);
    text-decoration: none;
    padding: 8px 16px;
    border: 1px solid rgba(255,255,255,0.3);
    border-radius: 2px;
    text-shadow: 0 1px 8px rgba(0,0,0,0.5);
    transition: all 0.2s ease;
  }

  .v6-nav-inquire:hover {
    background: rgba(255,255,255,0.12);
    border-color: rgba(255,255,255,0.5);
  }

  .v6-progress {
    position: fixed;
    bottom: 28px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 20;
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .v6-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgba(255,255,255,0.3);
    transition: all 0.35s ease;
    cursor: pointer;
    border: none;
    padding: 0;
  }

  .v6-dot.v6-dot-active {
    background: rgba(255,255,255,0.9);
    width: 20px;
    border-radius: 3px;
  }

  .v6-counter {
    position: fixed;
    bottom: 28px;
    right: 20px;
    z-index: 20;
    font-family: -apple-system, 'Helvetica Neue', sans-serif;
    font-size: 12px;
    font-weight: 400;
    letter-spacing: 1px;
    color: rgba(255,255,255,0.5);
    text-shadow: 0 1px 6px rgba(0,0,0,0.5);
  }

  .v6-contact-slide {
    flex: 0 0 100vw;
    width: 100vw;
    height: 100dvh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #0d0d0d;
    padding: 40px 28px;
    text-align: center;
  }

  .v6-contact-slide h2 {
    font-family: 'Georgia', 'Times New Roman', serif;
    font-size: 32px;
    font-weight: 400;
    color: #f0f0f0;
    margin: 0 0 8px;
  }

  .v6-contact-slide .v6-type {
    font-size: 12px;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    color: #666;
    margin: 0 0 40px;
  }

  .v6-contact-links {
    display: flex;
    flex-direction: column;
    gap: 14px;
    width: 100%;
    max-width: 280px;
  }

  .v6-contact-link {
    display: block;
    font-family: -apple-system, 'Helvetica Neue', sans-serif;
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: #ccc;
    text-decoration: none;
    padding: 16px 24px;
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 2px;
    transition: all 0.25s ease;
  }

  .v6-contact-link:hover {
    border-color: rgba(255,255,255,0.35);
    background: rgba(255,255,255,0.04);
    color: #fff;
  }

  .v6-contact-meta {
    margin-top: 40px;
    font-size: 11px;
    color: #555;
    letter-spacing: 1px;
    line-height: 1.8;
  }

  .v6-arrows {
    position: fixed;
    bottom: 20px;
    left: 20px;
    z-index: 20;
    display: flex;
    gap: 4px;
  }

  .v6-arrow {
    width: 36px;
    height: 36px;
    border: 1px solid rgba(255,255,255,0.2);
    background: rgba(0,0,0,0.3);
    color: rgba(255,255,255,0.7);
    border-radius: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 16px;
    transition: all 0.2s;
    backdrop-filter: blur(4px);
  }

  .v6-arrow:hover {
    border-color: rgba(255,255,255,0.4);
    color: #fff;
  }

  .v6-arrow:disabled {
    opacity: 0.3;
    cursor: default;
  }

  @media (min-width: 768px) {
    .v6-nav { padding: 28px 40px; }
    .v6-nav-name { font-size: 15px; }
    .v6-contact-slide h2 { font-size: 42px; }
    .v6-arrows { left: 40px; bottom: 28px; }
    .v6-counter { right: 40px; }
  }
`;

export default function V6Page() {
  const [current, setCurrent] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const touchDelta = useRef(0);

  const goTo = useCallback((idx: number) => {
    const clamped = Math.max(0, Math.min(idx, TOTAL_SLIDES - 1));
    setCurrent(clamped);
  }, []);

  // Mouse wheel horizontal scroll
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (delta > 30) goTo(current + 1);
      if (delta < -30) goTo(current - 1);
    };

    const el = trackRef.current?.parentElement;
    if (el) {
      el.addEventListener('wheel', handleWheel, { passive: false });
      return () => el.removeEventListener('wheel', handleWheel);
    }
  }, [current, goTo]);

  // Touch swipe
  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    touchDelta.current = 0;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    touchDelta.current = touchStart.current.x - e.touches[0].clientX;
  };

  const onTouchEnd = () => {
    if (Math.abs(touchDelta.current) > 50) {
      if (touchDelta.current > 0) goTo(current + 1);
      else goTo(current - 1);
    }
    touchStart.current = null;
    touchDelta.current = 0;
  };

  // Keyboard
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goTo(current + 1);
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goTo(current - 1);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [current, goTo]);

  const isContactSlide = current === TOTAL_SLIDES - 1;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div
        className="v6-container"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="v6-track"
          ref={trackRef}
          style={{ transform: `translateX(-${current * 100}vw)` }}
        >
          {images.map((img, i) => (
            <div key={img} className="v6-slide">
              <img
                src={`/images/large/${img}`}
                alt={`Portfolio photo ${i + 1}`}
                loading={i < 3 ? 'eager' : 'lazy'}
                decoding="async"
              />
              <div className="v6-slide-gradient" />
            </div>
          ))}

          <div className="v6-contact-slide">
            <h2>Aidan Torrence</h2>
            <p className="v6-type">Film &middot; Fashion &middot; Editorial</p>
            <div className="v6-contact-links">
              <a className="v6-contact-link" href="mailto:aidan@aidantorrence.com">Email</a>
              <a className="v6-contact-link" href="https://wa.me/491758966210">WhatsApp</a>
              <a className="v6-contact-link" href="https://instagram.com/aidantorrence" target="_blank" rel="noopener">Instagram</a>
            </div>
            <div className="v6-contact-meta">
              Based between Bangkok &amp; Europe<br />
              Booking worldwide<br /><br />
              Vogue Italia &middot; Hypebeast &middot; WWD
            </div>
          </div>
        </div>
      </div>

      <div className="v6-nav">
        <span className="v6-nav-name">Aidan Torrence</span>
        <a
          className="v6-nav-inquire"
          href="#"
          onClick={(e) => { e.preventDefault(); goTo(TOTAL_SLIDES - 1); }}
        >
          Inquire
        </a>
      </div>

      <div className="v6-arrows">
        <button className="v6-arrow" disabled={current === 0} onClick={() => goTo(current - 1)}>
          &#8249;
        </button>
        <button className="v6-arrow" disabled={current === TOTAL_SLIDES - 1} onClick={() => goTo(current + 1)}>
          &#8250;
        </button>
      </div>

      {!isContactSlide && (
        <div className="v6-counter">
          {current + 1} / {images.length}
        </div>
      )}

      <div className="v6-progress">
        {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
          <button
            key={i}
            className={`v6-dot ${i === current ? 'v6-dot-active' : ''}`}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </>
  );
}
