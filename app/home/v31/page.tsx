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

const PHOTO_SPACING = 520;
const PHOTO_WIDTH = 280;
const PHOTO_HEIGHT = 373;
const AMPLITUDE = 100;
const FREQUENCY = 0.008;
const HERO_HEIGHT = 600;
const CTA_HEIGHT = 500;
const TOTAL_HEIGHT = HERO_HEIGHT + images.length * PHOTO_SPACING + CTA_HEIGHT;

function getSineX(y: number): number {
  return AMPLITUDE * Math.sin(FREQUENCY * y);
}

function getTangentAngle(y: number): number {
  const derivative = AMPLITUDE * FREQUENCY * Math.cos(FREQUENCY * y);
  return Math.atan(derivative) * (180 / Math.PI);
}

function buildWavePath(): string {
  const points: string[] = [];
  const startY = HERO_HEIGHT;
  const endY = HERO_HEIGHT + images.length * PHOTO_SPACING;
  const centerX = 50;
  for (let y = startY; y <= endY; y += 4) {
    const relY = y - HERO_HEIGHT;
    const x = centerX + (getSineX(relY) / AMPLITUDE) * 50;
    const svgY = ((y - startY) / (endY - startY)) * 100;
    points.push(`${x},${svgY}`);
  }
  return `M${points.join(' L')}`;
}

export default function VerticalWaveGallery() {
  const [visibleSet, setVisibleSet] = useState<Set<number>>(new Set());
  const [scrollProgress, setScrollProgress] = useState(0);
  const photoRefs = useRef<(HTMLDivElement | null)[]>([]);
  const currentAutoIdx = useRef(-1);
  const autoAdvanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pausedByUserRef = useRef(false);
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Smooth eased scroll to a target Y position
  const smoothScrollTo = useCallback((targetY: number, duration: number, onDone: () => void) => {
    const startY = window.scrollY;
    const diff = targetY - startY;
    if (Math.abs(diff) < 2) { onDone(); return; }
    const startTime = performance.now();
    const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      window.scrollTo(0, startY + diff * easeInOutCubic(progress));
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        onDone();
      }
    };
    requestAnimationFrame(step);
  }, []);

  // Auto-scroll: snap to next photo every 2.5s
  const scrollToNextPhoto = useCallback(() => {
    if (pausedByUserRef.current) {
      autoAdvanceRef.current = setTimeout(scrollToNextPhoto, 1000);
      return;
    }
    currentAutoIdx.current++;
    const nextEl = photoRefs.current[currentAutoIdx.current];
    if (nextEl) {
      const rect = nextEl.getBoundingClientRect();
      const targetY = window.scrollY + rect.top - window.innerHeight / 2 + rect.height / 2;
      smoothScrollTo(targetY, 1200, () => {
        autoAdvanceRef.current = setTimeout(scrollToNextPhoto, 2500);
      });
    }
  }, [smoothScrollTo]);

  // Start auto-scroll after 2s
  useEffect(() => {
    autoAdvanceRef.current = setTimeout(scrollToNextPhoto, 2000);
    return () => {
      if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
    };
  }, [scrollToNextPhoto]);

  // Pause on user interaction for 5s
  useEffect(() => {
    const handleInteraction = () => {
      pausedByUserRef.current = true;
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = setTimeout(() => {
        pausedByUserRef.current = false;
      }, 5000);

      // Sync currentAutoIdx to whichever photo is closest to center
      const viewportCenter = window.scrollY + window.innerHeight / 2;
      let closestIdx = 0;
      let closestDist = Infinity;
      photoRefs.current.forEach((el, i) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const elCenter = window.scrollY + rect.top + rect.height / 2;
        const dist = Math.abs(elCenter - viewportCenter);
        if (dist < closestDist) {
          closestDist = dist;
          closestIdx = i;
        }
      });
      currentAutoIdx.current = closestIdx;
    };

    window.addEventListener('wheel', handleInteraction, { passive: true });
    window.addEventListener('touchstart', handleInteraction, { passive: true });
    return () => {
      window.removeEventListener('wheel', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        setVisibleSet((prev) => {
          const next = new Set(prev);
          entries.forEach((entry) => {
            const idx = Number(entry.target.getAttribute('data-index'));
            if (entry.isIntersecting) {
              next.add(idx);
            }
          });
          return next;
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );

    photoRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(maxScroll > 0 ? Math.min(scrollY / maxScroll, 1) : 0);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const viewedCount = Math.round(scrollProgress * images.length);

  return (
    <div style={{ minHeight: TOTAL_HEIGHT, background: '#0c0c0c', position: 'relative' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        body > header, body > footer, .fixed.inset-x-0.bottom-0 { display: none !important; }
        html, body { margin: 0; padding: 0; background: #0c0c0c; }
        * { box-sizing: border-box; }

        @keyframes titleFadeIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulseGlow {
          0%, 100% { filter: drop-shadow(0 0 6px rgba(255,200,120,0.3)); }
          50% { filter: drop-shadow(0 0 14px rgba(255,200,120,0.6)); }
        }

        @keyframes scrollArrow {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(8px); opacity: 1; }
        }

        .v31-photo {
          transition: filter 0.5s ease, transform 0.4s ease, opacity 0.7s ease;
          cursor: pointer;
        }
        .v31-photo:hover {
          filter: brightness(1.2) !important;
          z-index: 100 !important;
        }

        .v31-photo-enter {
          opacity: 0;
          transform: translateY(40px) scale(0.92);
        }
        .v31-photo-visible {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        .v31-caption {
          transition: opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s;
        }
        .v31-caption-hidden {
          opacity: 0;
          transform: translateY(12px);
        }
        .v31-caption-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .v31-cta-section {
          padding: 60px 24px 80px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .v31-cta-section input,
        .v31-cta-section textarea {
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
        .v31-cta-section input:focus,
        .v31-cta-section textarea:focus {
          border-color: rgba(255,255,255,0.35);
        }
        .v31-cta-section textarea {
          min-height: 100px;
          resize: vertical;
        }
        .v31-submit {
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
        .v31-submit:hover { opacity: 0.85; }

        .v31-progress-track {
          position: fixed;
          right: 20px;
          top: 50%;
          transform: translateY(-50%);
          width: 2px;
          height: 200px;
          background: rgba(255,255,255,0.08);
          border-radius: 1px;
          z-index: 1000;
        }
        .v31-progress-fill {
          width: 100%;
          background: rgba(255,200,120,0.7);
          border-radius: 1px;
          transition: height 0.15s ease;
          position: absolute;
          top: 0;
          left: 0;
        }
        .v31-progress-label {
          position: fixed;
          right: 12px;
          top: calc(50% + 116px);
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 10px;
          letter-spacing: 2px;
          color: rgba(255,255,255,0.3);
          text-transform: uppercase;
          z-index: 1000;
          writing-mode: vertical-rl;
          text-orientation: mixed;
        }

        @media (max-width: 640px) {
          .v31-progress-track {
            right: 10px;
            height: 140px;
          }
          .v31-progress-label {
            right: 4px;
            top: calc(50% + 86px);
            font-size: 9px;
          }
        }
      `}} />

      {/* Hero title section */}
      <div style={{
        height: HERO_HEIGHT,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '0 24px',
        animation: 'titleFadeIn 1.5s ease forwards',
      }}>
        <h1 style={{
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          fontSize: 'clamp(40px, 10vw, 64px)',
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
          Film Photographer
        </p>
        <div style={{
          width: 60,
          height: 1,
          background: 'rgba(255,200,120,0.4)',
          marginTop: 24,
        }} />
        <div style={{
          marginTop: 40,
          animation: 'scrollArrow 2s ease-in-out infinite',
        }}>
          <svg width="20" height="30" viewBox="0 0 20 30" fill="none" style={{ opacity: 0.4 }}>
            <path d="M10 0 L10 24 M2 18 L10 26 L18 18" stroke="rgba(255,200,120,0.6)" strokeWidth="1.5" />
          </svg>
        </div>
        <p style={{
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          fontSize: 11,
          letterSpacing: 3,
          color: 'rgba(255,255,255,0.2)',
          textTransform: 'uppercase',
          marginTop: 8,
        }}>
          Scroll to explore
        </p>
      </div>

      {/* SVG vertical sine wave - decorative background path */}
      <div style={{
        position: 'absolute',
        top: HERO_HEIGHT,
        left: 0,
        right: 0,
        height: images.length * PHOTO_SPACING,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}>
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            animation: 'pulseGlow 4s ease-in-out infinite',
          }}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="waveGradV" x1="0%" y1="0%" x2="0%" y2="100%">
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
            stroke="url(#waveGradV)"
            strokeWidth="0.3"
            opacity="0.6"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={buildWavePath()}
            fill="none"
            stroke="rgba(255,200,120,0.15)"
            strokeWidth="1"
            opacity="0.4"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>

      {/* Photos along the vertical sine wave */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: 600,
        margin: '0 auto',
        paddingBottom: 40,
      }}>
        {images.map((img, i) => {
          const relY = i * PHOTO_SPACING;
          const sineOffset = getSineX(relY);
          const angle = getTangentAngle(relY) * 0.25;
          const isVisible = visibleSet.has(i);

          return (
            <div
              key={i}
              ref={(el) => { photoRefs.current[i] = el; }}
              data-index={i}
              className={`v31-photo ${isVisible ? 'v31-photo-visible' : 'v31-photo-enter'}`}
              style={{
                position: 'relative',
                width: PHOTO_WIDTH,
                marginLeft: `calc(50% - ${PHOTO_WIDTH / 2}px + ${sineOffset}px)`,
                marginTop: i === 0 ? 0 : PHOTO_SPACING - PHOTO_HEIGHT - 80,
                zIndex: 10,
              }}
            >
              <div style={{
                transform: `rotate(${angle}deg)`,
                transformOrigin: 'center center',
              }}>
                <div style={{
                  position: 'relative',
                  width: PHOTO_WIDTH,
                  height: PHOTO_HEIGHT,
                  overflow: 'hidden',
                  borderRadius: 4,
                  boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
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
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.3) 100%)',
                    pointerEvents: 'none',
                  }} />
                </div>
                {/* Caption */}
                <div
                  className={`v31-caption ${isVisible ? 'v31-caption-visible' : 'v31-caption-hidden'}`}
                  style={{ marginTop: 14, textAlign: 'center' }}
                >
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
            </div>
          );
        })}
      </div>

      {/* Contact form */}
      <div className="v31-cta-section" id="inquiry">
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
          <button type="submit" className="v31-submit">Send Inquiry</button>
        </form>
        <div style={{ marginTop: '36px', textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: '4px 0', fontFamily: 'system-ui, sans-serif' }}>
            aidan@aidantorrence.com
          </p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: '4px 0', fontFamily: 'system-ui, sans-serif' }}>
            WhatsApp: +49 175 8966210 · @madebyaidan
          </p>
        </div>
      </div>

      {/* Vertical progress indicator (right side) */}
      <div className="v31-progress-track">
        <div className="v31-progress-fill" style={{ height: `${scrollProgress * 100}%` }} />
      </div>
      <div className="v31-progress-label">
        {viewedCount} / {images.length}
      </div>
    </div>
  );
}
