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

const PHOTO_SPACING = 800;
const CORRIDOR_DEPTH = images.length * PHOTO_SPACING + 1200;
const WALL_OFFSET_X = 380;

export default function V13Page() {
  const [scrollZ, setScrollZ] = useState(0);
  const rafRef = useRef<number>(0);
  const scrollRef = useRef(0);
  const currentZ = useRef(0);

  const updateZ = useCallback(() => {
    const target = scrollRef.current;
    currentZ.current += (target - currentZ.current) * 0.1;
    if (Math.abs(target - currentZ.current) > 0.5) {
      setScrollZ(currentZ.current);
    } else {
      currentZ.current = target;
      setScrollZ(target);
    }
    rafRef.current = requestAnimationFrame(updateZ);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollFraction = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      scrollRef.current = scrollFraction * CORRIDOR_DEPTH;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    rafRef.current = requestAnimationFrame(updateZ);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, [updateZ]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        body > header, body > footer, .fixed.inset-x-0.bottom-0 { display: none !important; }
        html, body { margin: 0; padding: 0; background: #0c0c0c; overflow-x: hidden; }

        .v13-scroll-spacer {
          height: ${Math.round(CORRIDOR_DEPTH * 0.6)}px;
          width: 1px;
          position: relative;
          z-index: -1;
        }

        .v13-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 36px;
          pointer-events: none;
        }
        .v13-nav a, .v13-nav span {
          pointer-events: auto;
        }
        .v13-nav-inquire {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 13px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.7);
          text-decoration: none;
          transition: color 0.3s;
          cursor: pointer;
        }
        .v13-nav-inquire:hover { color: #fff; }
        .v13-nav-title {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 13px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.7);
        }

        .v13-scene {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          perspective: 1200px;
          perspective-origin: 50% 50%;
          overflow: hidden;
        }

        .v13-corridor {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          transform-style: preserve-3d;
        }

        .v13-photo-frame {
          position: absolute;
          transform-style: preserve-3d;
          transition: none;
        }

        .v13-photo-frame img {
          display: block;
          width: 320px;
          height: 440px;
          object-fit: cover;
          border: 2px solid rgba(255,255,255,0.06);
          box-shadow: 0 4px 40px rgba(0,0,0,0.6);
        }

        .v13-caption {
          position: absolute;
          bottom: -36px;
          left: 0;
          width: 320px;
          text-align: center;
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 12px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.6);
          opacity: 0;
          transition: opacity 0.6s ease;
          pointer-events: none;
        }
        .v13-caption.visible {
          opacity: 1;
        }

        .v13-floor-line {
          position: absolute;
          transform-style: preserve-3d;
          width: 2px;
          background: rgba(255,255,255,0.03);
        }

        .v13-ceiling-line {
          position: absolute;
          transform-style: preserve-3d;
          width: 2px;
          background: rgba(255,255,255,0.02);
        }

        .v13-wall-left, .v13-wall-right {
          position: absolute;
          transform-style: preserve-3d;
          pointer-events: none;
        }

        .v13-intro {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          z-index: 100;
          pointer-events: none;
          transition: opacity 0.8s ease;
        }
        .v13-intro h1 {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 14px;
          font-weight: 300;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.5);
          margin: 0 0 12px 0;
        }
        .v13-intro p {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 11px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.25);
          margin: 0;
        }

        .v13-scroll-hint {
          position: fixed;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 100;
          pointer-events: none;
          transition: opacity 0.8s ease;
        }
        .v13-scroll-hint span {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 10px;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.25);
        }
        .v13-scroll-hint .arrow {
          display: block;
          text-align: center;
          margin-top: 8px;
          color: rgba(255,255,255,0.2);
          font-size: 18px;
          animation: v13-bob 2s ease-in-out infinite;
        }

        @keyframes v13-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(6px); }
        }

        .v13-vignette {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          pointer-events: none;
          z-index: 50;
          background: radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%);
        }

        .v13-depth-fog {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          pointer-events: none;
          z-index: 2;
          background: linear-gradient(to bottom, rgba(12,12,12,0.1) 0%, transparent 20%, transparent 80%, rgba(12,12,12,0.15) 100%);
        }
      `}} />

      <div className="v13-scene">
        <div className="v13-corridor" style={{
          transform: `translateZ(${scrollZ}px)`,
        }}>
          {/* Floor lines for depth */}
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={`floor-${i}`}
              style={{
                position: 'absolute',
                left: '-50vw',
                width: '100vw',
                height: '1px',
                background: 'rgba(255,255,255,0.025)',
                transform: `translateZ(${-i * 500}px) translateY(280px) rotateX(0deg)`,
                transformStyle: 'preserve-3d' as const,
              }}
            />
          ))}

          {/* Ceiling lines for depth */}
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={`ceil-${i}`}
              style={{
                position: 'absolute',
                left: '-50vw',
                width: '100vw',
                height: '1px',
                background: 'rgba(255,255,255,0.015)',
                transform: `translateZ(${-i * 500}px) translateY(-320px) rotateX(0deg)`,
                transformStyle: 'preserve-3d' as const,
              }}
            />
          ))}

          {/* Left wall gradient strip */}
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={`wall-l-${i}`}
              style={{
                position: 'absolute',
                width: '1px',
                height: '700px',
                top: '-350px',
                background: 'linear-gradient(to bottom, rgba(255,255,255,0.01), rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
                transform: `translateX(${-WALL_OFFSET_X - 180}px) translateZ(${-i * 700}px)`,
                transformStyle: 'preserve-3d' as const,
              }}
            />
          ))}

          {/* Right wall gradient strip */}
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={`wall-r-${i}`}
              style={{
                position: 'absolute',
                width: '1px',
                height: '700px',
                top: '-350px',
                background: 'linear-gradient(to bottom, rgba(255,255,255,0.01), rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
                transform: `translateX(${WALL_OFFSET_X + 180}px) translateZ(${-i * 700}px)`,
                transformStyle: 'preserve-3d' as const,
              }}
            />
          ))}

          {/* Photos */}
          {images.map((img, i) => {
            const zPos = -(i * PHOTO_SPACING + 600);
            const isLeft = i % 2 === 0;
            const xPos = isLeft ? -WALL_OFFSET_X : WALL_OFFSET_X;
            const rotateY = isLeft ? 25 : -25;
            const yOffset = ((i % 3) - 1) * 30;
            const distanceFromViewer = Math.abs(zPos + scrollZ);
            const captionVisible = distanceFromViewer < 500;

            return (
              <div
                key={i}
                className="v13-photo-frame"
                style={{
                  transform: `translateX(${xPos}px) translateY(${yOffset}px) translateZ(${zPos}px) rotateY(${rotateY}deg)`,
                  transformStyle: 'preserve-3d' as const,
                }}
              >
                <img
                  src={`/images/large/${img.src}`}
                  alt={`${img.name} - ${img.city}`}
                  loading="lazy"
                />
                <div className={`v13-caption ${captionVisible ? 'visible' : ''}`}>
                  {img.name} &mdash; {img.city}
                </div>
              </div>
            );
          })}

          {/* End marker */}
          <div style={{
            position: 'absolute',
            transform: `translateZ(${-(images.length * PHOTO_SPACING + 800)}px)`,
            transformStyle: 'preserve-3d' as const,
            textAlign: 'center',
            width: '300px',
            left: '-150px',
          }}>
            <div style={{
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              fontSize: '11px',
              letterSpacing: '0.25em',
              textTransform: 'uppercase' as const,
              color: 'rgba(255,255,255,0.3)',
            }}>
              Aidan Torrence
            </div>
            <div style={{
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              fontSize: '10px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase' as const,
              color: 'rgba(255,255,255,0.15)',
              marginTop: '8px',
            }}>
              Film Photography
            </div>
          </div>
        </div>
      </div>

      {/* Vignette overlay */}
      <div className="v13-vignette" />
      <div className="v13-depth-fog" />

      {/* Navigation */}
      <nav className="v13-nav">
        <a href="#" className="v13-nav-inquire">Inquire</a>
        <span className="v13-nav-title">Aidan Torrence / Film Photographer</span>
      </nav>

      {/* Intro text */}
      <div className="v13-intro" style={{ opacity: scrollZ < 200 ? 1 - scrollZ / 200 : 0 }}>
        <h1>Enter the Gallery</h1>
        <p>Scroll to walk through</p>
      </div>

      {/* Scroll hint */}
      <div className="v13-scroll-hint" style={{ opacity: scrollZ < 150 ? 1 - scrollZ / 150 : 0 }}>
        <span>Scroll</span>
        <div className="arrow">&darr;</div>
      </div>

      {/* Scroll spacer */}
      <div className="v13-scroll-spacer" />
    </>
  );
}
