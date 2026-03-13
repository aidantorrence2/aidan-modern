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

const TOTAL_SLIDES = images.length + 1; // +1 for CTA
const TRANSITION_DURATION = 1200;
const AUTO_ADVANCE_INTERVAL = 5000;

// Clip-path transition shapes - each returns a function that takes progress (0-1)
// and returns a clip-path string
const transitionShapes = [
  // Circle from center
  (p: number) => `circle(${p * 75}% at 50% 50%)`,
  // Circle from top-left
  (p: number) => `circle(${p * 150}% at 0% 0%)`,
  // Circle from bottom-right
  (p: number) => `circle(${p * 150}% at 100% 100%)`,
  // Diamond from center
  (p: number) => {
    const s = p * 55;
    return `polygon(50% ${50 - s}%, ${50 + s}% 50%, 50% ${50 + s}%, ${50 - s}% 50%)`;
  },
  // Diagonal wipe top-left to bottom-right
  (p: number) => {
    const d = p * 200;
    return `polygon(0% 0%, ${d}% 0%, 0% ${d}%)`;
  },
  // Horizontal split from center
  (p: number) => {
    const h = p * 50;
    return `polygon(0% ${50 - h}%, 100% ${50 - h}%, 100% ${50 + h}%, 0% ${50 + h}%)`;
  },
  // Vertical split from center
  (p: number) => {
    const w = p * 50;
    return `polygon(${50 - w}% 0%, ${50 + w}% 0%, ${50 + w}% 100%, ${50 - w}% 100%)`;
  },
  // Organic blob (approximated with polygon)
  (p: number) => {
    const r = p * 60;
    const cx = 50, cy = 50;
    const points = [];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const wobble = 1 + 0.2 * Math.sin(angle * 3 + p * 4);
      const px = cx + r * wobble * Math.cos(angle);
      const py = cy + r * wobble * Math.sin(angle);
      points.push(`${px}% ${py}%`);
    }
    return `polygon(${points.join(', ')})`;
  },
  // Star/cross reveal
  (p: number) => {
    const s = p * 55;
    const n = p * 20;
    return `polygon(50% ${50 - s}%, ${50 + n}% ${50 - n}%, ${50 + s}% 50%, ${50 + n}% ${50 + n}%, 50% ${50 + s}%, ${50 - n}% ${50 + n}%, ${50 - s}% 50%, ${50 - n}% ${50 - n}%)`;
  },
  // Hexagon from center
  (p: number) => {
    const r = p * 65;
    const cx = 50, cy = 50;
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
      points.push(`${cx + r * Math.cos(angle)}% ${cy + r * Math.sin(angle)}%`);
    }
    return `polygon(${points.join(', ')})`;
  },
  // Diagonal wipe bottom-left to top-right
  (p: number) => {
    const d = p * 200;
    return `polygon(0% 100%, ${d}% 100%, 0% ${100 - d}%)`;
  },
  // Ellipse horizontal
  (p: number) => `ellipse(${p * 80}% ${p * 55}% at 50% 50%)`,
  // Circle from random-ish offset
  (p: number) => `circle(${p * 120}% at 30% 70%)`,
];

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export default function MorphingPortfolios() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState<number | null>(null);
  const [transitionProgress, setTransitionProgress] = useState(0);
  const [shapeIndex, setShapeIndex] = useState(0);
  const [captionVisible, setCaptionVisible] = useState(true);
  const [introComplete, setIntroComplete] = useState(false);
  const [introProgress, setIntroProgress] = useState(0);

  const transitioning = useRef(false);
  const autoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animFrame = useRef<number>(0);
  const lastShapeRef = useRef(-1);

  const getNextShape = useCallback(() => {
    let idx: number;
    do {
      idx = Math.floor(Math.random() * transitionShapes.length);
    } while (idx === lastShapeRef.current);
    lastShapeRef.current = idx;
    return idx;
  }, []);

  const goTo = useCallback((target: number) => {
    if (transitioning.current) return;
    if (target < 0 || target >= TOTAL_SLIDES) return;
    if (target === currentIndex) return;

    transitioning.current = true;
    setCaptionVisible(false);
    setNextIndex(target);
    setShapeIndex(getNextShape());

    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const raw = Math.min(elapsed / TRANSITION_DURATION, 1);
      const eased = easeInOutCubic(raw);
      setTransitionProgress(eased);

      if (raw < 1) {
        animFrame.current = requestAnimationFrame(animate);
      } else {
        // Transition complete
        setCurrentIndex(target);
        setNextIndex(null);
        setTransitionProgress(0);
        transitioning.current = false;
        // Show caption with slight delay
        setTimeout(() => setCaptionVisible(true), 100);
      }
    };

    animFrame.current = requestAnimationFrame(animate);
  }, [currentIndex, getNextShape]);

  const goNext = useCallback(() => {
    const next = currentIndex + 1;
    if (next < TOTAL_SLIDES) goTo(next);
  }, [currentIndex, goTo]);

  const goPrev = useCallback(() => {
    const prev = currentIndex - 1;
    if (prev >= 0) goTo(prev);
  }, [currentIndex, goTo]);

  // Intro animation
  useEffect(() => {
    const startTime = performance.now();
    const duration = 1800;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const raw = Math.min(elapsed / duration, 1);
      setIntroProgress(easeInOutCubic(raw));

      if (raw < 1) {
        requestAnimationFrame(animate);
      } else {
        setIntroComplete(true);
      }
    };

    requestAnimationFrame(animate);
  }, []);

  // Auto-advance
  useEffect(() => {
    if (!introComplete) return;

    autoTimer.current = setTimeout(() => {
      if (!transitioning.current) goNext();
    }, AUTO_ADVANCE_INTERVAL);

    return () => {
      if (autoTimer.current) clearTimeout(autoTimer.current);
    };
  }, [currentIndex, introComplete, goNext]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goNext, goPrev]);

  // Click to advance
  const handleClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('a') || target.closest('button') || target.tagName === 'A') return;
    const x = e.clientX;
    const w = window.innerWidth;
    if (x < w * 0.35) {
      goPrev();
    } else {
      goNext();
    }
  }, [goNext, goPrev]);

  const currentClip = nextIndex !== null
    ? transitionShapes[shapeIndex](transitionProgress)
    : 'none';

  const isCTA = currentIndex === TOTAL_SLIDES - 1;
  const isNextCTA = nextIndex === TOTAL_SLIDES - 1;
  const currentImage = currentIndex < images.length ? images[currentIndex] : null;
  const nextImage = nextIndex !== null && nextIndex < images.length ? images[nextIndex] : null;

  const frameNumber = (idx: number) => String(idx + 1).padStart(2, '0');

  // Intro blob for first load
  const introClip = !introComplete
    ? transitionShapes[0](introProgress)
    : 'none';

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        body > header, body > footer, .fixed.inset-x-0.bottom-0 { display: none !important; }
        html, body { margin: 0; padding: 0; overflow: hidden; background: #0c0c0c; }

        .mp-container {
          position: fixed;
          inset: 0;
          background: #0c0c0c;
          overflow: hidden;
          cursor: pointer;
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        .mp-slide {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          will-change: clip-path, opacity;
        }

        .mp-slide-current {
          z-index: 1;
        }

        .mp-slide-next {
          z-index: 2;
        }

        /* Grain overlay */
        .mp-grain {
          position: fixed;
          inset: -50%;
          width: 200%;
          height: 200%;
          z-index: 50;
          pointer-events: none;
          opacity: 0.035;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
          animation: mp-grain-drift 8s steps(10) infinite;
        }

        @keyframes mp-grain-drift {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-5%, -10%); }
          20% { transform: translate(-15%, 5%); }
          30% { transform: translate(7%, -15%); }
          40% { transform: translate(-5%, 15%); }
          50% { transform: translate(-15%, 10%); }
          60% { transform: translate(15%, 0%); }
          70% { transform: translate(0%, 10%); }
          80% { transform: translate(3%, -15%); }
          90% { transform: translate(-10%, 10%); }
        }

        /* Frame number */
        .mp-frame {
          position: fixed;
          top: 40px;
          right: 48px;
          z-index: 30;
          font-size: 96px;
          font-weight: 200;
          letter-spacing: -4px;
          color: rgba(255,255,255,0.08);
          line-height: 1;
          transition: opacity 0.4s ease;
          font-variant-numeric: tabular-nums;
          pointer-events: none;
        }

        /* Caption */
        .mp-caption {
          position: fixed;
          bottom: 80px;
          left: 48px;
          z-index: 30;
          pointer-events: none;
        }

        .mp-caption-name {
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.9);
          transform: translateY(20px);
          opacity: 0;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.6s ease;
        }

        .mp-caption-city {
          font-size: 11px;
          font-weight: 300;
          letter-spacing: 5px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.45);
          margin-top: 6px;
          transform: translateY(20px);
          opacity: 0;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.08s, opacity 0.6s ease 0.08s;
        }

        .mp-caption-visible .mp-caption-name,
        .mp-caption-visible .mp-caption-city {
          transform: translateY(0);
          opacity: 1;
        }

        /* Progress dots */
        .mp-dots {
          position: fixed;
          bottom: 32px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 30;
          display: flex;
          gap: 6px;
          pointer-events: auto;
        }

        .mp-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(255,255,255,0.15);
          transition: background 0.4s ease, transform 0.3s ease;
          cursor: pointer;
          border: none;
          padding: 0;
        }

        .mp-dot:hover {
          background: rgba(255,255,255,0.4);
          transform: scale(1.4);
        }

        .mp-dot-active {
          background: rgba(255,255,255,0.7);
        }

        /* Title overlay for first slide */
        .mp-title-overlay {
          position: fixed;
          inset: 0;
          z-index: 20;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }

        .mp-title-text {
          font-size: clamp(28px, 5vw, 64px);
          font-weight: 200;
          letter-spacing: clamp(8px, 2vw, 24px);
          text-transform: uppercase;
          color: white;
          text-align: center;
          opacity: 0;
          transform: scale(0.95);
          transition: opacity 0.8s ease 0.6s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.6s;
        }

        .mp-title-visible .mp-title-text {
          opacity: 1;
          transform: scale(1);
        }

        .mp-title-hidden .mp-title-text {
          opacity: 0;
          transform: scale(1.02);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }

        /* CTA slide */
        .mp-cta-slide {
          position: absolute;
          inset: 0;
          background: #0c0c0c;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 1;
        }

        .mp-cta-heading {
          font-size: clamp(24px, 4vw, 48px);
          font-weight: 200;
          letter-spacing: clamp(6px, 1.5vw, 16px);
          text-transform: uppercase;
          color: white;
          margin-bottom: 40px;
          text-align: center;
        }

        .mp-cta-button {
          display: inline-block;
          padding: 16px 48px;
          border: 1px solid rgba(255,255,255,0.3);
          color: white;
          font-size: 12px;
          font-weight: 400;
          letter-spacing: 4px;
          text-transform: uppercase;
          text-decoration: none;
          transition: background 0.3s ease, border-color 0.3s ease;
          cursor: pointer;
          background: transparent;
        }

        .mp-cta-button:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.6);
        }

        /* Vignette */
        .mp-vignette {
          position: fixed;
          inset: 0;
          z-index: 10;
          pointer-events: none;
          background: radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%);
        }

        /* Navigation hints */
        .mp-nav-hint {
          position: fixed;
          top: 50%;
          transform: translateY(-50%);
          z-index: 30;
          color: rgba(255,255,255,0.15);
          font-size: 24px;
          pointer-events: none;
          transition: opacity 0.3s ease;
        }

        .mp-nav-left { left: 20px; }
        .mp-nav-right { right: 20px; }
      `}} />

      <div className="mp-container" onClick={handleClick}>

        {/* Current slide (background) */}
        {isCTA ? (
          <div className="mp-cta-slide mp-slide-current">
            <div className="mp-cta-heading">Let's Create Together</div>
            <a href="/contact" className="mp-cta-button">Get In Touch</a>
          </div>
        ) : currentImage ? (
          <div
            className="mp-slide mp-slide-current"
            style={{
              backgroundImage: `url(/images/large/${currentImage.src})`,
              opacity: nextIndex !== null ? 1 - transitionProgress * 0.15 : 1,
              ...((!introComplete && currentIndex === 0) ? {
                clipPath: introClip,
              } : {}),
            }}
          />
        ) : null}

        {/* Next slide (revealed via clip-path) */}
        {nextIndex !== null && (
          isNextCTA ? (
            <div
              className="mp-cta-slide mp-slide-next"
              style={{ clipPath: currentClip }}
            >
              <div className="mp-cta-heading">Let's Create Together</div>
              <a href="/contact" className="mp-cta-button">Get In Touch</a>
            </div>
          ) : nextImage ? (
            <div
              className="mp-slide mp-slide-next"
              style={{
                backgroundImage: `url(/images/large/${nextImage.src})`,
                clipPath: currentClip,
              }}
            />
          ) : null
        )}

        {/* Vignette */}
        <div className="mp-vignette" />

        {/* Grain overlay */}
        <div className="mp-grain" />

        {/* Frame number */}
        <div className="mp-frame" style={{
          opacity: introComplete ? 1 : introProgress,
        }}>
          {nextIndex !== null
            ? frameNumber(nextIndex < images.length ? nextIndex : images.length)
            : frameNumber(currentIndex < images.length ? currentIndex : images.length)
          }
        </div>

        {/* Title overlay on first slide */}
        {currentIndex === 0 && nextIndex === null && (
          <div className={`mp-title-overlay ${introComplete && captionVisible ? 'mp-title-visible' : ''}`}>
            <div className="mp-title-text">Aidan Torrence</div>
          </div>
        )}
        {currentIndex !== 0 && nextIndex === null && !isCTA && (
          <div className="mp-title-overlay mp-title-hidden">
            <div className="mp-title-text">Aidan Torrence</div>
          </div>
        )}

        {/* Caption */}
        {!isCTA && currentImage && currentIndex !== 0 && (
          <div className={`mp-caption ${captionVisible && nextIndex === null ? 'mp-caption-visible' : ''}`}>
            <div className="mp-caption-name">{currentImage.name}</div>
            <div className="mp-caption-city">{currentImage.city}</div>
          </div>
        )}

        {/* First slide caption - name/city below title */}
        {currentIndex === 0 && nextIndex === null && currentImage && (
          <div
            className={`mp-caption ${introComplete && captionVisible ? 'mp-caption-visible' : ''}`}
          >
            <div className="mp-caption-name">{currentImage.name}</div>
            <div className="mp-caption-city">{currentImage.city}</div>
          </div>
        )}

        {/* Progress dots */}
        <div className="mp-dots">
          {Array.from({ length: TOTAL_SLIDES }, (_, i) => (
            <button
              key={i}
              className={`mp-dot ${(nextIndex ?? currentIndex) === i ? 'mp-dot-active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                goTo(i);
              }}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Nav hints */}
        {currentIndex > 0 && (
          <div className="mp-nav-hint mp-nav-left">&lsaquo;</div>
        )}
        {currentIndex < TOTAL_SLIDES - 1 && (
          <div className="mp-nav-hint mp-nav-right">&rsaquo;</div>
        )}
      </div>
    </>
  );
}
