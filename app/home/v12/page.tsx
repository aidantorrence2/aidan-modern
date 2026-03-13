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

export default function DarkroomReveal() {
  const [revealedSet, setRevealedSet] = useState<Set<number>>(new Set());
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pageRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    if (!pageRef.current) return;
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
    setScrollProgress(progress);

    let lastVisible = 0;
    imageRefs.current.forEach((ref, i) => {
      if (ref) {
        const rect = ref.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.75) {
          lastVisible = i + 1;
        }
      }
    });
    setCurrentIndex(lastVisible);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'));
            if (!isNaN(index)) {
              setRevealedSet((prev) => {
                const next = new Set(prev);
                next.add(index);
                return next;
              });
            }
          }
        });
      },
      { threshold: 0.25 }
    );

    imageRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={pageRef}>
      <style dangerouslySetInnerHTML={{ __html: `
        body > header, body > footer, .fixed.inset-x-0.bottom-0 { display: none !important; }
        html { scroll-behavior: smooth; }
        body { margin: 0; padding: 0; background: #1a0000; overflow-x: hidden; }

        @keyframes safelightPulse {
          0%, 100% { opacity: 0.03; }
          50% { opacity: 0.07; }
        }

        @keyframes chemicalRipple {
          0% { transform: translateX(-100%) skewX(-5deg); opacity: 0; }
          30% { opacity: 0.08; }
          100% { transform: translateX(100%) skewX(-5deg); opacity: 0; }
        }

        @keyframes developerDrip {
          0% { height: 0%; opacity: 0.5; }
          100% { height: 100%; opacity: 0; }
        }

        @keyframes captionFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes heroGlow {
          0%, 100% { text-shadow: 0 0 40px rgba(180, 40, 40, 0.3); }
          50% { text-shadow: 0 0 60px rgba(180, 40, 40, 0.5); }
        }

        .darkroom-image {
          filter: brightness(0.3) saturate(0) sepia(1) hue-rotate(320deg);
          transition: filter 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .darkroom-image.revealed {
          filter: none;
        }

        .image-caption {
          opacity: 0;
          transform: translateY(8px);
        }

        .image-caption.revealed {
          animation: captionFadeIn 0.8s ease 1.2s forwards;
        }

        .chemical-wash {
          animation: chemicalRipple 3s ease-in-out infinite;
        }

        .chemical-wash:nth-child(2) {
          animation-delay: 1s;
        }

        .chemical-wash:nth-child(3) {
          animation-delay: 2s;
        }

        .safelight-glow {
          animation: safelightPulse 4s ease-in-out infinite;
        }

        .progress-fill {
          transition: width 0.3s ease;
        }

        .drip-line {
          animation: developerDrip 4s ease-in-out infinite;
        }

        .drip-line:nth-child(2) { animation-delay: 1.5s; }
        .drip-line:nth-child(3) { animation-delay: 3s; }
      `}} />

      {/* Safelight ambient glow - fixed overlay */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'radial-gradient(ellipse at 50% 0%, rgba(180, 30, 30, 0.15) 0%, transparent 60%)',
        pointerEvents: 'none',
        zIndex: 1,
      }} className="safelight-glow" />

      {/* Chemical tray reflection - bottom ambient */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '120px',
        background: 'linear-gradient(to top, rgba(140, 20, 20, 0.06) 0%, transparent 100%)',
        pointerEvents: 'none',
        zIndex: 1,
      }} />

      {/* Fixed navigation */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 32px',
        zIndex: 100,
        background: 'linear-gradient(to bottom, rgba(26, 0, 0, 0.9) 0%, transparent 100%)',
      }}>
        <a href="#" style={{
          color: '#cc9999',
          textDecoration: 'none',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: '13px',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          border: '1px solid rgba(204, 153, 153, 0.3)',
          padding: '8px 20px',
          transition: 'all 0.3s ease',
        }}>Inquire</a>
        <span style={{
          color: '#cc9999',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: '13px',
          letterSpacing: '2px',
          textTransform: 'uppercase',
        }}>Aidan Torrence / Film Photographer</span>
      </nav>

      {/* Progress bar */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '2px',
        background: 'rgba(100, 20, 20, 0.3)',
        zIndex: 200,
      }}>
        <div className="progress-fill" style={{
          height: '100%',
          width: `${scrollProgress * 100}%`,
          background: 'linear-gradient(90deg, #8b2020, #cc4444)',
        }} />
      </div>

      {/* Counter */}
      <div style={{
        position: 'fixed',
        right: '32px',
        bottom: '32px',
        zIndex: 100,
        fontFamily: 'ui-monospace, monospace',
        fontSize: '12px',
        color: '#884444',
        letterSpacing: '1px',
      }}>
        {String(currentIndex).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
      </div>

      {/* Main content */}
      <div style={{
        position: 'relative',
        zIndex: 2,
      }}>
        {/* Spacer so first gallery image starts below fixed nav */}
        <div style={{ height: '80px' }} />

        {/* Gallery */}
        <section style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: '0 24px',
        }}>
          {images.map((image, index) => {
            const isRevealed = revealedSet.has(index);

            return (
              <div
                key={index}
                ref={(el) => { imageRefs.current[index] = el; }}
                data-index={index}
                style={{
                  marginBottom: '120px',
                  position: 'relative',
                }}
              >
                {/* Chemical wash overlays */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  overflow: 'hidden',
                  pointerEvents: 'none',
                  zIndex: 3,
                  opacity: isRevealed ? 0 : 1,
                  transition: 'opacity 2s ease',
                }}>
                  <div className="chemical-wash" style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '200%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent 0%, rgba(180, 40, 40, 0.08) 40%, rgba(180, 40, 40, 0.12) 50%, rgba(180, 40, 40, 0.08) 60%, transparent 100%)',
                  }} />
                  <div className="chemical-wash" style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '200%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent 0%, rgba(160, 30, 30, 0.06) 35%, rgba(160, 30, 30, 0.1) 50%, rgba(160, 30, 30, 0.06) 65%, transparent 100%)',
                  }} />
                </div>

                {/* Image frame - darkroom border */}
                <div style={{
                  border: `1px solid ${isRevealed ? 'rgba(255,255,255,0.08)' : 'rgba(140, 30, 30, 0.2)'}`,
                  padding: '12px',
                  transition: 'border-color 1.5s ease',
                  background: isRevealed ? 'rgba(0,0,0,0.3)' : 'rgba(40, 5, 5, 0.3)',
                }}>
                  <div style={{
                    position: 'relative',
                    overflow: 'hidden',
                    lineHeight: 0,
                  }}>
                    <img
                      src={`/images/large/${image.src}`}
                      alt={`${image.name} - ${image.city}`}
                      className={`darkroom-image${isRevealed ? ' revealed' : ''}`}
                      style={{
                        width: '100%',
                        height: 'auto',
                        display: 'block',
                      }}
                      loading="lazy"
                    />

                    {/* Red safelight reflection on undeveloped images */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      background: 'radial-gradient(ellipse at 30% 20%, rgba(180, 30, 30, 0.15) 0%, transparent 50%)',
                      pointerEvents: 'none',
                      opacity: isRevealed ? 0 : 1,
                      transition: 'opacity 1.5s ease',
                    }} />
                  </div>
                </div>

                {/* Caption */}
                <div
                  className={`image-caption${isRevealed ? ' revealed' : ''}`}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    marginTop: '16px',
                    padding: '0 4px',
                  }}
                >
                  <span style={{
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    fontSize: '14px',
                    color: '#aa8888',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    fontWeight: 300,
                  }}>
                    {image.name}
                  </span>
                  <span style={{
                    fontFamily: 'ui-monospace, monospace',
                    fontSize: '11px',
                    color: '#664444',
                    letterSpacing: '1px',
                  }}>
                    {image.city}
                  </span>
                </div>

                {/* Film frame number */}
                <div style={{
                  position: 'absolute',
                  top: '-24px',
                  right: '12px',
                  fontFamily: 'ui-monospace, monospace',
                  fontSize: '10px',
                  color: '#442222',
                  letterSpacing: '1px',
                }}>
                  {String(index + 1).padStart(2, '0')}A
                </div>
              </div>
            );
          })}
        </section>

        {/* CTA Section */}
        <section style={{
          padding: '160px 24px',
          textAlign: 'center',
          background: 'linear-gradient(to bottom, transparent 0%, #0c0c0c 40%)',
          position: 'relative',
        }}>
          <p style={{
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '13px',
            color: '#666',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            marginBottom: '32px',
            fontWeight: 300,
          }}>
            Every image, developed by hand
          </p>
          <h2 style={{
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: 'clamp(24px, 4vw, 48px)',
            fontWeight: 300,
            color: '#ccc',
            letterSpacing: '4px',
            textTransform: 'uppercase',
            marginBottom: '48px',
          }}>
            Let&apos;s Create Together
          </h2>
          <a href="#" style={{
            display: 'inline-block',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '13px',
            color: '#ccc',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            textDecoration: 'none',
            border: '1px solid rgba(255,255,255,0.2)',
            padding: '16px 48px',
            transition: 'all 0.4s ease',
          }}>
            Inquire
          </a>

          <div style={{
            marginTop: '120px',
            fontFamily: 'ui-monospace, monospace',
            fontSize: '10px',
            color: '#444',
            letterSpacing: '2px',
          }}>
            &copy; 2025 Aidan Torrence
          </div>
        </section>
      </div>
    </div>
  );
}
