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

// Total slides: title + 25 photos + CTA = 27
const TOTAL_SLIDES = images.length + 2;
const AUTO_ADVANCE_MS = 4000;
const BLACKOUT_MS = 200;

export default function V20Page() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isBlackout, setIsBlackout] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [flickerOpacity, setFlickerOpacity] = useState(1);
  const [dustParticles, setDustParticles] = useState<Array<{ id: number; x: number; y: number; dx: number; dy: number; size: number; opacity: number }>>([]);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flickerRef = useRef<number>(0);
  const dustRef = useRef<number>(0);

  const goToSlide = useCallback((next: number) => {
    if (isBlackout) return;
    setIsBlackout(true);
    setTimeout(() => {
      setCurrentSlide(next);
      setIsBlackout(false);
    }, BLACKOUT_MS);
  }, [isBlackout]);

  const advance = useCallback(() => {
    goToSlide((currentSlide + 1) % TOTAL_SLIDES);
  }, [currentSlide, goToSlide]);

  const goBack = useCallback(() => {
    goToSlide((currentSlide - 1 + TOTAL_SLIDES) % TOTAL_SLIDES);
  }, [currentSlide, goToSlide]);

  // Auto-advance timer — title slide is 250ms, rest are normal
  useEffect(() => {
    if (isPaused || currentSlide === TOTAL_SLIDES - 1) return; // pause on CTA
    const delay = currentSlide === 0 ? 250 : AUTO_ADVANCE_MS;
    timerRef.current = setTimeout(advance, delay);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentSlide, isPaused, advance]);

  // Flicker effect
  useEffect(() => {
    const flicker = () => {
      setFlickerOpacity(0.95 + Math.random() * 0.05);
      flickerRef.current = requestAnimationFrame(flicker);
    };
    flickerRef.current = requestAnimationFrame(flicker);
    return () => cancelAnimationFrame(flickerRef.current);
  }, []);

  // Dust particles
  useEffect(() => {
    const particles = Array.from({ length: 4 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      dx: (Math.random() - 0.3) * 0.15,
      dy: (Math.random() - 0.5) * 0.08,
      size: 1.5 + Math.random() * 2,
      opacity: 0.3 + Math.random() * 0.4,
    }));
    setDustParticles(particles);

    const moveDust = () => {
      setDustParticles(prev => prev.map(p => ({
        ...p,
        x: (p.x + p.dx + 100) % 100,
        y: (p.y + p.dy + 100) % 100,
        opacity: 0.2 + Math.abs(Math.sin(Date.now() * 0.001 + p.id)) * 0.5,
      })));
      dustRef.current = requestAnimationFrame(moveDust);
    };
    dustRef.current = requestAnimationFrame(moveDust);
    return () => cancelAnimationFrame(dustRef.current);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        advance();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goBack();
      } else if (e.key === 'p') {
        setIsPaused(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [advance, goBack]);

  const handleClick = (e: React.MouseEvent) => {
    // Don't advance if clicking on form elements
    if ((e.target as HTMLElement).closest('.v20-cta-form')) return;
    advance();
  };

  const isTitle = currentSlide === 0;
  const isCTA = currentSlide === TOTAL_SLIDES - 1;
  const photoIndex = currentSlide - 1;
  const photo = (!isTitle && !isCTA) ? images[photoIndex] : null;
  const frameLabel = String(currentSlide).padStart(2, '0') + '/' + String(TOTAL_SLIDES - 1).padStart(2, '0');

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        body > header, body > footer, .fixed.inset-x-0.bottom-0 { display: none !important; }
        html, body {
          margin: 0; padding: 0; background: #0c0c0c;
          overflow: hidden; height: 100%; width: 100%;
        }

        .v20-root {
          position: fixed; inset: 0;
          background: #0c0c0c;
          cursor: pointer;
          user-select: none;
          overflow: hidden;
        }

        /* Projector light beam from top */
        .v20-beam {
          position: absolute;
          top: -20px; left: 50%; transform: translateX(-50%);
          width: 0; height: 0;
          border-left: 45vw solid transparent;
          border-right: 45vw solid transparent;
          border-top: 120px solid rgba(255, 240, 200, 0.03);
          pointer-events: none; z-index: 1;
        }

        /* Photo container */
        .v20-photo-wrap {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          transition: none;
        }

        .v20-photo-wrap img {
          max-width: 92vw;
          max-height: 88vh;
          object-fit: contain;
          display: block;
        }

        /* Warm color temperature overlay */
        .v20-warm {
          position: absolute; inset: 0;
          background: rgba(180, 120, 60, 0.06);
          mix-blend-mode: multiply;
          pointer-events: none; z-index: 5;
        }

        /* Vignette */
        .v20-vignette {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 80%, rgba(0,0,0,0.85) 100%);
          pointer-events: none; z-index: 6;
        }

        /* Film grain overlay via SVG noise */
        .v20-grain {
          position: absolute; inset: 0;
          opacity: 0.06;
          pointer-events: none; z-index: 7;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 150px 150px;
          animation: v20-grainShift 0.3s steps(3) infinite;
        }

        @keyframes v20-grainShift {
          0% { transform: translate(0, 0); }
          33% { transform: translate(-2px, 1px); }
          66% { transform: translate(1px, -2px); }
          100% { transform: translate(0, 0); }
        }

        /* Scan lines */
        .v20-scanlines {
          position: absolute; inset: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 3px,
            rgba(0, 0, 0, 0.03) 3px,
            rgba(0, 0, 0, 0.03) 4px
          );
          pointer-events: none; z-index: 8;
        }

        /* Blackout */
        .v20-blackout {
          position: absolute; inset: 0;
          background: #000;
          z-index: 20;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.05s ease;
        }
        .v20-blackout.active {
          opacity: 1;
        }

        /* Dust particles */
        .v20-dust {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 245, 220, 0.7);
          pointer-events: none;
          z-index: 9;
          filter: blur(0.5px);
        }

        /* Frame counter */
        .v20-counter {
          position: absolute;
          bottom: 60px; right: 40px;
          font-family: 'Courier New', monospace;
          font-size: 13px;
          letter-spacing: 2px;
          color: rgba(255, 240, 200, 0.4);
          z-index: 10;
          text-transform: uppercase;
        }

        /* Click to advance text */
        .v20-hint {
          position: absolute;
          bottom: 28px; left: 50%; transform: translateX(-50%);
          font-family: 'Courier New', monospace;
          font-size: 10px;
          letter-spacing: 4px;
          color: rgba(255, 240, 200, 0.2);
          z-index: 10;
          text-transform: uppercase;
        }

        /* Pause indicator */
        .v20-paused {
          position: absolute;
          top: 30px; right: 40px;
          font-family: 'Courier New', monospace;
          font-size: 11px;
          letter-spacing: 2px;
          color: rgba(255, 100, 100, 0.5);
          z-index: 10;
          animation: v20-blink 1.5s ease-in-out infinite;
        }

        @keyframes v20-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        /* Title slide */
        .v20-title {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          height: 100%; width: 100%;
          animation: v20-burnIn 2s ease-out forwards;
        }

        .v20-title h1 {
          font-family: 'Courier New', monospace;
          font-size: clamp(28px, 5vw, 56px);
          font-weight: 300;
          letter-spacing: 12px;
          color: rgba(255, 240, 200, 0.85);
          text-transform: uppercase;
          margin: 0;
          text-shadow: 0 0 30px rgba(255, 220, 150, 0.3), 0 0 60px rgba(255, 200, 100, 0.1);
        }

        .v20-title p {
          font-family: 'Courier New', monospace;
          font-size: clamp(10px, 1.5vw, 14px);
          letter-spacing: 8px;
          color: rgba(255, 240, 200, 0.35);
          margin-top: 20px;
          text-transform: uppercase;
        }

        @keyframes v20-burnIn {
          0% { opacity: 0; filter: brightness(3) blur(4px); }
          40% { opacity: 1; filter: brightness(1.8) blur(1px); }
          100% { opacity: 1; filter: brightness(1) blur(0); }
        }

        /* Photo caption */
        .v20-caption {
          position: absolute;
          bottom: 90px; left: 40px;
          font-family: 'Courier New', monospace;
          z-index: 10;
        }
        .v20-caption-name {
          font-size: 14px;
          letter-spacing: 3px;
          color: rgba(255, 240, 200, 0.5);
          text-transform: uppercase;
        }
        .v20-caption-city {
          font-size: 10px;
          letter-spacing: 5px;
          color: rgba(255, 240, 200, 0.25);
          text-transform: uppercase;
          margin-top: 4px;
        }

        /* CTA slide */
        .v20-cta {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          height: 100%; width: 100%;
          animation: v20-burnIn 1.5s ease-out forwards;
        }

        .v20-cta h2 {
          font-family: 'Courier New', monospace;
          font-size: clamp(18px, 3vw, 32px);
          font-weight: 300;
          letter-spacing: 8px;
          color: rgba(255, 240, 200, 0.7);
          text-transform: uppercase;
          margin: 0 0 40px 0;
        }

        .v20-cta-form {
          display: flex; flex-direction: column;
          gap: 16px; width: min(400px, 85vw);
        }

        .v20-cta-form input,
        .v20-cta-form textarea {
          background: rgba(255, 240, 200, 0.05);
          border: 1px solid rgba(255, 240, 200, 0.15);
          color: rgba(255, 240, 200, 0.8);
          font-family: 'Courier New', monospace;
          font-size: 13px;
          letter-spacing: 1px;
          padding: 12px 16px;
          outline: none;
          transition: border-color 0.3s;
        }

        .v20-cta-form input:focus,
        .v20-cta-form textarea:focus {
          border-color: rgba(255, 240, 200, 0.35);
        }

        .v20-cta-form input::placeholder,
        .v20-cta-form textarea::placeholder {
          color: rgba(255, 240, 200, 0.2);
          letter-spacing: 2px;
          text-transform: uppercase;
          font-size: 10px;
        }

        .v20-cta-form textarea {
          resize: none; height: 80px;
        }

        .v20-cta-form button {
          background: rgba(255, 240, 200, 0.08);
          border: 1px solid rgba(255, 240, 200, 0.2);
          color: rgba(255, 240, 200, 0.6);
          font-family: 'Courier New', monospace;
          font-size: 11px;
          letter-spacing: 4px;
          text-transform: uppercase;
          padding: 14px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .v20-cta-form button:hover {
          background: rgba(255, 240, 200, 0.14);
          color: rgba(255, 240, 200, 0.85);
        }

        .v20-cta-thanks {
          font-family: 'Courier New', monospace;
          font-size: 14px;
          letter-spacing: 4px;
          color: rgba(255, 240, 200, 0.5);
          text-transform: uppercase;
          margin-top: 20px;
        }

        /* Color shift animation */
        .v20-colorshift {
          position: absolute; inset: 0;
          pointer-events: none; z-index: 4;
          animation: v20-hueShift 12s ease-in-out infinite;
        }
        @keyframes v20-hueShift {
          0%, 100% { background: rgba(255, 200, 150, 0.02); }
          33% { background: rgba(200, 255, 200, 0.015); }
          66% { background: rgba(200, 180, 255, 0.015); }
        }
      `}} />

      <div className="v20-root" onClick={handleClick} style={{ opacity: flickerOpacity }}>

        {/* Projector light beam */}
        <div className="v20-beam" />

        {/* Content area */}
        <div className="v20-photo-wrap">
          {isTitle && (
            <div className="v20-title" key="title">
              <h1>Aidan Torrence</h1>
              <p>Film Photographer</p>
            </div>
          )}

          {photo && (
            <img
              key={photo.src}
              src={`/images/large/${photo.src}`}
              alt={`${photo.name} - ${photo.city}`}
              draggable={false}
            />
          )}

          {isCTA && (
            <div className="v20-cta" key="cta">
              <h2>Get In Touch</h2>
              {!formSubmitted ? (
                <div className="v20-cta-form" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <input
                    type="email"
                    placeholder="Your Email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                  <textarea
                    placeholder="Your Message"
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (formData.name && formData.email) setFormSubmitted(true);
                    }}
                  >
                    Send Message
                  </button>
                </div>
              ) : (
                <div className="v20-cta-thanks">Thank you. I&apos;ll be in touch.</div>
              )}
            </div>
          )}
        </div>

        {/* Persistent header on photo/CTA slides */}
        {!isTitle && (
          <div style={{
            position: 'absolute',
            top: 24,
            left: 0,
            right: 0,
            textAlign: 'center',
            zIndex: 10,
            pointerEvents: 'none',
          }}>
            <div style={{
              fontFamily: "'Courier New', monospace",
              fontSize: 'clamp(12px, 2vw, 16px)',
              fontWeight: 300,
              letterSpacing: '6px',
              color: 'rgba(255, 240, 200, 0.5)',
              textTransform: 'uppercase',
            }}>
              Aidan Torrence
            </div>
            <div style={{
              fontFamily: "'Courier New', monospace",
              fontSize: '9px',
              letterSpacing: '4px',
              color: 'rgba(255, 240, 200, 0.25)',
              textTransform: 'uppercase',
              marginTop: '4px',
            }}>
              Film Photographer
            </div>
          </div>
        )}

        {/* Photo caption */}
        {photo && (
          <div className="v20-caption">
            <div className="v20-caption-name">{photo.name}</div>
            <div className="v20-caption-city">{photo.city}</div>
          </div>
        )}

        {/* Overlays */}
        <div className="v20-colorshift" />
        <div className="v20-warm" />
        <div className="v20-vignette" />
        <div className="v20-grain" />
        <div className="v20-scanlines" />

        {/* Dust particles */}
        {dustParticles.map(p => (
          <div
            key={p.id}
            className="v20-dust"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              opacity: p.opacity,
            }}
          />
        ))}

        {/* Blackout overlay */}
        <div className={`v20-blackout ${isBlackout ? 'active' : ''}`} />

        {/* Frame counter */}
        <div className="v20-counter">Frame {frameLabel}</div>

        {/* Click hint */}
        <div className="v20-hint">Click to advance</div>

        {/* Paused indicator */}
        {isPaused && <div className="v20-paused">Paused</div>}
      </div>
    </>
  );
}
