'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

const allImages = [
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

// Pick every other image to get 12 for the carousel (13 picks, take first 12)
const images = allImages.filter((_, i) => i % 2 === 0).slice(0, 12);
const N = images.length;
const ANGLE_STEP = 360 / N; // 30 degrees per photo

export default function V23Page() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const animTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const rotateTo = useCallback((direction: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex(prev => {
      const next = prev + direction;
      return ((next % N) + N) % N;
    });
    if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current);
    animTimeoutRef.current = setTimeout(() => setIsAnimating(false), 600);
  }, [isAnimating]);

  // Arrow key navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        rotateTo(1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        rotateTo(-1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [rotateTo]);

  // Scroll-based rotation
  useEffect(() => {
    let accumulatedDelta = 0;
    const threshold = 80;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      accumulatedDelta += e.deltaY;
      if (Math.abs(accumulatedDelta) >= threshold) {
        const direction = accumulatedDelta > 0 ? 1 : -1;
        rotateTo(direction);
        accumulatedDelta = 0;
      }
    };

    const el = containerRef.current;
    if (el) {
      el.addEventListener('wheel', handleWheel, { passive: false });
      return () => el.removeEventListener('wheel', handleWheel);
    }
  }, [rotateTo]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current);
    };
  }, []);

  const currentPhoto = images[currentIndex];
  const rotationAngle = -currentIndex * ANGLE_STEP;

  // Radius: how far photos are pushed out on Z-axis
  // For 12 items at 30deg each, a radius of ~550px works well
  const RADIUS = 550;
  const CARD_W = 320;
  const CARD_H = 440;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        body > header, body > footer, .fixed.inset-x-0.bottom-0 { display: none !important; }
        html, body { margin: 0; padding: 0; overflow: hidden; height: 100%; }
        body { background: #0c0c0c; }

        .v23-root {
          position: fixed;
          inset: 0;
          background: radial-gradient(ellipse at 50% 45%, #1a1a1a 0%, #0c0c0c 70%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          color: #fff;
          overflow: hidden;
          user-select: none;
          cursor: default;
        }

        .v23-title {
          position: absolute;
          top: 48px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 14px;
          font-weight: 300;
          letter-spacing: 12px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.85);
          z-index: 10;
          white-space: nowrap;
        }

        .v23-scene {
          perspective: 1200px;
          perspective-origin: 50% 50%;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .v23-carousel {
          position: relative;
          width: ${CARD_W}px;
          height: ${CARD_H}px;
          transform-style: preserve-3d;
          transition: transform 0.7s cubic-bezier(0.23, 1, 0.32, 1);
          transform: rotateY(${rotationAngle}deg);
        }

        .v23-card {
          position: absolute;
          width: ${CARD_W}px;
          height: ${CARD_H}px;
          left: 0;
          top: 0;
          backface-visibility: hidden;
          border-radius: 6px;
          overflow: hidden;
          box-shadow: 0 8px 40px rgba(0,0,0,0.6);
          transition: filter 0.7s cubic-bezier(0.23, 1, 0.32, 1),
                      opacity 0.7s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .v23-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .v23-card-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.35);
          transition: background 0.7s ease;
          pointer-events: none;
        }

        .v23-card.is-front .v23-card-overlay {
          background: rgba(0,0,0,0);
        }

        .v23-card.is-front {
          box-shadow: 0 12px 60px rgba(0,0,0,0.8), 0 0 80px rgba(255,255,255,0.04);
        }

        /* Reflection container */
        .v23-reflection-wrap {
          position: relative;
          width: ${CARD_W}px;
          height: ${CARD_H}px;
          transform-style: preserve-3d;
          transition: transform 0.7s cubic-bezier(0.23, 1, 0.32, 1);
          transform: rotateY(${rotationAngle}deg);
          margin-top: -2px;
        }

        .v23-reflect-card {
          position: absolute;
          width: ${CARD_W}px;
          height: ${CARD_H * 0.35}px;
          left: 0;
          top: 0;
          backface-visibility: hidden;
          border-radius: 0 0 6px 6px;
          overflow: hidden;
          transform-origin: top center;
          opacity: 0.15;
        }

        .v23-reflect-card img {
          width: ${CARD_W}px;
          height: ${CARD_H}px;
          object-fit: cover;
          display: block;
          transform: scaleY(-1);
          transform-origin: top center;
        }

        .v23-reflect-card::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, transparent 0%, #0c0c0c 90%);
        }

        .v23-caption {
          position: absolute;
          bottom: calc(50% - ${CARD_H / 2 + 100}px);
          left: 50%;
          transform: translateX(-50%);
          text-align: center;
          z-index: 10;
          opacity: 1;
          transition: opacity 0.5s ease;
        }

        .v23-caption-name {
          font-size: 22px;
          font-weight: 300;
          letter-spacing: 6px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.9);
          margin-bottom: 4px;
        }

        .v23-caption-city {
          font-size: 12px;
          font-weight: 300;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.45);
        }

        .v23-counter {
          position: absolute;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 13px;
          font-weight: 300;
          letter-spacing: 3px;
          color: rgba(255,255,255,0.35);
          z-index: 10;
        }

        .v23-counter span {
          color: rgba(255,255,255,0.8);
          font-weight: 400;
        }

        .v23-nav-arrows {
          position: absolute;
          bottom: 38px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 60px;
          z-index: 10;
        }

        .v23-arrow {
          width: 44px;
          height: 44px;
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: border-color 0.3s ease, background 0.3s ease;
          background: transparent;
          color: rgba(255,255,255,0.5);
          font-size: 16px;
          padding: 0;
          outline: none;
        }

        .v23-arrow:hover {
          border-color: rgba(255,255,255,0.5);
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.9);
        }

        .v23-floor-line {
          position: absolute;
          bottom: calc(50% - ${CARD_H / 2 + 30}px);
          left: 50%;
          transform: translateX(-50%);
          width: 700px;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 30%, rgba(255,255,255,0.06) 70%, transparent 100%);
        }

        @media (max-width: 768px) {
          .v23-title {
            font-size: 11px;
            letter-spacing: 8px;
            top: 32px;
          }
          .v23-scene {
            perspective: 800px;
          }
        }
      `}} />

      <div className="v23-root" ref={containerRef}>
        <div className="v23-title">AIDAN TORRENCE</div>

        <div className="v23-scene">
          {/* Main Carousel */}
          <div
            className="v23-carousel"
            style={{ transform: `rotateY(${rotationAngle}deg)` }}
          >
            {images.map((img, i) => {
              const angle = i * ANGLE_STEP;
              // Determine if this card is the front-facing one
              const isFront = i === currentIndex;
              return (
                <div
                  key={img.src}
                  className={`v23-card${isFront ? ' is-front' : ''}`}
                  style={{
                    transform: `rotateY(${angle}deg) translateZ(${RADIUS}px)`,
                  }}
                >
                  <img
                    src={`/images/large/${img.src}`}
                    alt={`${img.name} - ${img.city}`}
                    loading="lazy"
                    draggable={false}
                  />
                  <div className="v23-card-overlay" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Reflection beneath the scene */}
        <div style={{
          position: 'absolute',
          top: 'calc(50% + ' + (CARD_H / 2 + 4) + 'px)',
          left: '50%',
          transform: 'translateX(-50%)',
          perspective: '1200px',
          perspectiveOrigin: '50% 0%',
        }}>
          <div
            className="v23-reflection-wrap"
            style={{ transform: `rotateY(${rotationAngle}deg)` }}
          >
            {images.map((img, i) => {
              const angle = i * ANGLE_STEP;
              return (
                <div
                  key={`ref-${img.src}`}
                  className="v23-reflect-card"
                  style={{
                    transform: `rotateY(${angle}deg) translateZ(${RADIUS}px)`,
                  }}
                >
                  <img
                    src={`/images/large/${img.src}`}
                    alt=""
                    loading="lazy"
                    draggable={false}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Subtle floor line */}
        <div className="v23-floor-line" />

        {/* Caption for front photo */}
        <div className="v23-caption">
          <div className="v23-caption-name">{currentPhoto.name}</div>
          <div className="v23-caption-city">{currentPhoto.city}</div>
        </div>

        {/* Counter */}
        <div className="v23-counter">
          <span>{String(currentIndex + 1).padStart(2, '0')}</span>
          {' / '}
          {String(N).padStart(2, '0')}
        </div>

        {/* Navigation arrows */}
        <div className="v23-nav-arrows">
          <button
            className="v23-arrow"
            onClick={() => rotateTo(-1)}
            aria-label="Previous photo"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="10,2 4,8 10,14" />
            </svg>
          </button>
          <button
            className="v23-arrow"
            onClick={() => rotateTo(1)}
            aria-label="Next photo"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="6,2 12,8 6,14" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
