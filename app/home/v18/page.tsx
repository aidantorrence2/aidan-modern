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

const AMPLITUDE = 180;
const FREQUENCY = 0.0018;
const PHOTO_SPACING = 420;
const PHOTO_WIDTH = 300;
const PHOTO_HEIGHT = 400;
const WAVE_CENTER_Y = 450;
const TOTAL_WIDTH = images.length * PHOTO_SPACING + 1200;

function getSineY(x: number): number {
  return AMPLITUDE * Math.sin(FREQUENCY * x);
}

function getTangentAngle(x: number): number {
  const derivative = AMPLITUDE * FREQUENCY * Math.cos(FREQUENCY * x);
  return Math.atan(derivative) * (180 / Math.PI);
}

function buildWavePath(): string {
  const points: string[] = [];
  for (let x = 0; x <= TOTAL_WIDTH; x += 4) {
    const y = WAVE_CENTER_Y + getSineY(x);
    points.push(`${x},${y}`);
  }
  return `M${points.join(' L')}`;
}

export default function WaveGallery() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollXRef = useRef(0);
  const [scrollX, setScrollX] = useState(0);
  const rafRef = useRef<number>(0);
  const targetScrollRef = useRef(0);

  const clampScroll = useCallback((val: number) => {
    const maxScroll = TOTAL_WIDTH - (typeof window !== 'undefined' ? window.innerWidth : 1200);
    return Math.max(0, Math.min(val, maxScroll));
  }, []);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      targetScrollRef.current = clampScroll(targetScrollRef.current + delta * 1.2);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        targetScrollRef.current = clampScroll(targetScrollRef.current + 200);
      } else if (e.key === 'ArrowLeft') {
        targetScrollRef.current = clampScroll(targetScrollRef.current - 200);
      }
    };

    let touchStartX = 0;
    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const dx = touchStartX - e.touches[0].clientX;
      const dy = touchStartY - e.touches[0].clientY;
      const delta = Math.abs(dy) > Math.abs(dx) ? dy : dx;
      targetScrollRef.current = clampScroll(targetScrollRef.current + delta * 1.5);
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [clampScroll]);

  useEffect(() => {
    const animate = () => {
      const current = scrollXRef.current;
      const target = targetScrollRef.current;
      const diff = target - current;
      const next = current + diff * 0.1;
      scrollXRef.current = next;
      setScrollX(next);
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const maxScroll = TOTAL_WIDTH - (typeof window !== 'undefined' ? window.innerWidth : 1200);
  const progress = maxScroll > 0 ? Math.min(scrollX / maxScroll, 1) : 0;
  const viewportCenter = scrollX + (typeof window !== 'undefined' ? window.innerWidth / 2 : 600);

  return (
    <div ref={containerRef} style={{ position: 'fixed', inset: 0, overflow: 'hidden', background: '#0c0c0c' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        body > header, body > footer, .fixed.inset-x-0.bottom-0 { display: none !important; }
        html, body { margin: 0; padding: 0; overflow: hidden; background: #0c0c0c; }
        * { box-sizing: border-box; }

        @keyframes titleFadeIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulseGlow {
          0%, 100% { filter: drop-shadow(0 0 6px rgba(255,200,120,0.3)); }
          50% { filter: drop-shadow(0 0 14px rgba(255,200,120,0.6)); }
        }

        .wave-photo {
          transition: filter 0.5s ease, transform 0.3s ease;
          cursor: pointer;
        }
        .wave-photo:hover {
          filter: brightness(1.2) !important;
          z-index: 100 !important;
        }

        .wave-caption {
          transition: opacity 0.4s ease;
        }

        .cta-btn {
          display: inline-block;
          padding: 18px 48px;
          border: 1px solid rgba(255,200,120,0.6);
          color: #fff;
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 14px;
          letter-spacing: 4px;
          text-transform: uppercase;
          text-decoration: none;
          transition: all 0.4s ease;
          background: transparent;
          cursor: pointer;
        }
        .cta-btn:hover {
          background: rgba(255,200,120,0.15);
          border-color: rgba(255,200,120,1);
          box-shadow: 0 0 30px rgba(255,200,120,0.2);
        }

        .progress-track {
          position: fixed;
          bottom: 28px;
          left: 50%;
          transform: translateX(-50%);
          width: 200px;
          height: 2px;
          background: rgba(255,255,255,0.1);
          border-radius: 1px;
          z-index: 1000;
        }
        .progress-fill {
          height: 100%;
          background: rgba(255,200,120,0.7);
          border-radius: 1px;
          transition: width 0.15s ease;
        }
        .progress-label {
          position: fixed;
          bottom: 38px;
          left: 50%;
          transform: translateX(-50%);
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 10px;
          letter-spacing: 3px;
          color: rgba(255,255,255,0.3);
          text-transform: uppercase;
          z-index: 1000;
        }
      `}} />

      {/* Fixed nav */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '24px 40px',
        background: 'linear-gradient(to bottom, rgba(12,12,12,0.9) 0%, transparent 100%)',
      }}>
        <div style={{
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          fontSize: 12,
          letterSpacing: 4,
          color: 'rgba(255,255,255,0.7)',
          textTransform: 'uppercase',
        }}>
          Aidan Torrence
        </div>
        <div style={{ display: 'flex', gap: 32 }}>
          {['Portfolio', 'About', 'Contact'].map((item) => (
            <a key={item} href="#" style={{
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              fontSize: 11,
              letterSpacing: 3,
              color: 'rgba(255,255,255,0.4)',
              textDecoration: 'none',
              textTransform: 'uppercase',
              transition: 'color 0.3s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.8)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
            >
              {item}
            </a>
          ))}
        </div>
      </nav>

      {/* Scrolling layer */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: TOTAL_WIDTH,
        height: '100vh',
        transform: `translateX(${-scrollX}px)`,
        willChange: 'transform',
      }}>

        {/* Title section at the start */}
        <div style={{
          position: 'absolute',
          left: 80,
          top: WAVE_CENTER_Y - 80,
          width: 500,
          animation: 'titleFadeIn 1.5s ease forwards',
        }}>
          <h1 style={{
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontSize: 64,
            fontWeight: 200,
            letterSpacing: 12,
            color: '#fff',
            textTransform: 'uppercase',
            margin: 0,
            lineHeight: 1.1,
          }}>
            Aidan
            <br />
            <span style={{ fontWeight: 600 }}>Torrence</span>
          </h1>
          <p style={{
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontSize: 13,
            letterSpacing: 5,
            color: 'rgba(255,200,120,0.6)',
            textTransform: 'uppercase',
            marginTop: 20,
          }}>
            Photographer &mdash; Worldwide
          </p>
          <div style={{
            width: 60,
            height: 1,
            background: 'rgba(255,200,120,0.4)',
            marginTop: 24,
          }} />
          <p style={{
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontSize: 12,
            color: 'rgba(255,255,255,0.3)',
            marginTop: 16,
            letterSpacing: 2,
          }}>
            Scroll to explore &rarr;
          </p>
        </div>

        {/* SVG sine wave path */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: TOTAL_WIDTH,
            height: '100vh',
            pointerEvents: 'none',
            animation: 'pulseGlow 4s ease-in-out infinite',
          }}
          viewBox={`0 0 ${TOTAL_WIDTH} 900`}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255,200,120,0)" />
              <stop offset="5%" stopColor="rgba(255,200,120,0.25)" />
              <stop offset="50%" stopColor="rgba(255,200,120,0.35)" />
              <stop offset="95%" stopColor="rgba(255,200,120,0.25)" />
              <stop offset="100%" stopColor="rgba(255,200,120,0)" />
            </linearGradient>
          </defs>
          <path
            d={buildWavePath()}
            fill="none"
            stroke="url(#waveGrad)"
            strokeWidth="1.5"
            opacity="0.6"
          />
          {/* Duplicate for glow */}
          <path
            d={buildWavePath()}
            fill="none"
            stroke="rgba(255,200,120,0.15)"
            strokeWidth="6"
            opacity="0.4"
          />
        </svg>

        {/* Photos along the wave */}
        {images.map((img, i) => {
          const photoX = 700 + i * PHOTO_SPACING;
          const photoY = WAVE_CENTER_Y + getSineY(photoX) - PHOTO_HEIGHT / 2;
          const angle = getTangentAngle(photoX) * 0.3;
          const distFromCenter = Math.abs(photoX - viewportCenter);
          const maxDist = 800;
          const proximity = Math.max(0, 1 - distFromCenter / maxDist);
          const scale = 0.75 + proximity * 0.25;
          const brightness = 0.5 + proximity * 0.5;
          const opacity = 0.4 + proximity * 0.6;

          return (
            <div
              key={i}
              className="wave-photo"
              style={{
                position: 'absolute',
                left: photoX - PHOTO_WIDTH / 2,
                top: photoY,
                width: PHOTO_WIDTH,
                transform: `rotate(${angle}deg) scale(${scale})`,
                transformOrigin: 'center center',
                filter: `brightness(${brightness})`,
                opacity,
                zIndex: Math.round(proximity * 50),
              }}
            >
              <div style={{
                position: 'relative',
                width: PHOTO_WIDTH,
                height: PHOTO_HEIGHT,
                overflow: 'hidden',
                borderRadius: 4,
                boxShadow: `0 ${8 + proximity * 16}px ${24 + proximity * 32}px rgba(0,0,0,${0.4 + proximity * 0.3})`,
              }}>
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
                {/* Subtle overlay vignette */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.3) 100%)',
                  pointerEvents: 'none',
                }} />
              </div>
              {/* Caption */}
              <div className="wave-caption" style={{
                marginTop: 14,
                textAlign: 'center',
                opacity: proximity > 0.3 ? 1 : 0,
              }}>
                <p style={{
                  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                  fontSize: 14,
                  fontWeight: 500,
                  color: 'rgba(255,255,255,0.85)',
                  margin: 0,
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                }}>
                  {img.name}
                </p>
                <p style={{
                  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                  fontSize: 11,
                  color: 'rgba(255,200,120,0.5)',
                  margin: '4px 0 0 0',
                  letterSpacing: 3,
                  textTransform: 'uppercase',
                }}>
                  {img.city}
                </p>
              </div>
            </div>
          );
        })}

        {/* CTA at far right end */}
        <div style={{
          position: 'absolute',
          left: TOTAL_WIDTH - 600,
          top: WAVE_CENTER_Y - 80,
          width: 500,
          textAlign: 'center',
        }}>
          <p style={{
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontSize: 28,
            fontWeight: 200,
            color: '#fff',
            letterSpacing: 6,
            textTransform: 'uppercase',
            margin: '0 0 12px 0',
          }}>
            Let&apos;s Create Together
          </p>
          <p style={{
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontSize: 13,
            color: 'rgba(255,255,255,0.35)',
            letterSpacing: 2,
            margin: '0 0 36px 0',
          }}>
            Available for shoots worldwide
          </p>
          <a href="/book" className="cta-btn">
            Book a Session
          </a>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="progress-label">
        {Math.round(progress * images.length)} / {images.length}
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${progress * 100}%` }} />
      </div>

      {/* Scroll hint - fades out */}
      <div style={{
        position: 'fixed',
        bottom: 70,
        left: '50%',
        transform: 'translateX(-50%)',
        opacity: scrollX < 100 ? 1 : 0,
        transition: 'opacity 0.6s ease',
        pointerEvents: 'none',
      }}>
        <p style={{
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          fontSize: 11,
          letterSpacing: 3,
          color: 'rgba(255,255,255,0.25)',
          textTransform: 'uppercase',
        }}>
          Scroll to explore
        </p>
      </div>
    </div>
  );
}
