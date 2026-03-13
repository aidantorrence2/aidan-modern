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

const SWIPE_THRESHOLD = 120;
const FLY_OFF_DISTANCE = 1400;
const STACK_VISIBLE = 3;

const CSS = `
  body > header, body > footer, .fixed.inset-x-0.bottom-0 { display: none !important; }

  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

  html, body {
    background: #0c0c0c !important;
    color: #fff;
    overflow: hidden;
    height: 100%;
    width: 100%;
  }

  .v17-root {
    position: fixed;
    inset: 0;
    background: #0c0c0c;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-family: system-ui, -apple-system, sans-serif;
    overflow: hidden;
    user-select: none;
    -webkit-user-select: none;
  }

  /* ===== NAV ===== */
  .v17-nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 28px 40px;
  }

  .v17-nav-inquire {
    font-size: 11px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.5);
    cursor: pointer;
    transition: color 0.3s;
    text-decoration: none;
    font-family: system-ui, -apple-system, sans-serif;
  }

  .v17-nav-inquire:hover { color: rgba(255,255,255,0.9); }

  .v17-nav-name {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 14px;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.6);
  }

  /* ===== TITLE ===== */
  .v17-title {
    position: fixed;
    top: 80px;
    left: 0;
    right: 0;
    text-align: center;
    z-index: 50;
    pointer-events: none;
  }

  .v17-title h1 {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: clamp(22px, 3vw, 32px);
    font-weight: 400;
    letter-spacing: 0.35em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.15);
  }

  /* ===== CARD STACK ===== */
  .v17-stack-area {
    position: relative;
    width: clamp(300px, 55vmin, 480px);
    height: clamp(420px, 75vmin, 660px);
    perspective: 1200px;
  }

  .v17-card {
    position: absolute;
    inset: 0;
    border-radius: 6px;
    background: #fff;
    padding: 14px;
    box-shadow: 0 8px 40px rgba(0,0,0,0.5), 0 2px 10px rgba(0,0,0,0.3);
    transform-origin: center center;
    will-change: transform, opacity;
    cursor: grab;
    touch-action: none;
  }

  .v17-card:active { cursor: grabbing; }

  .v17-card-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 2px;
    pointer-events: none;
    display: block;
  }

  /* ===== CAPTION ===== */
  .v17-caption {
    position: fixed;
    bottom: clamp(60px, 10vh, 100px);
    left: 0;
    right: 0;
    text-align: center;
    z-index: 50;
    pointer-events: none;
  }

  .v17-caption-name {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: clamp(18px, 2.5vw, 26px);
    font-weight: 400;
    letter-spacing: 0.15em;
    color: rgba(255,255,255,0.9);
    margin-bottom: 6px;
    transition: opacity 0.3s;
  }

  .v17-caption-city {
    font-size: 11px;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.35);
    transition: opacity 0.3s;
  }

  /* ===== COUNTER ===== */
  .v17-counter {
    position: fixed;
    bottom: clamp(28px, 5vh, 50px);
    left: 0;
    right: 0;
    text-align: center;
    font-size: 11px;
    letter-spacing: 0.2em;
    color: rgba(255,255,255,0.2);
    z-index: 50;
    font-variant-numeric: tabular-nums;
  }

  /* ===== ARROWS ===== */
  .v17-arrows {
    position: fixed;
    bottom: clamp(28px, 5vh, 50px);
    display: flex;
    gap: 60px;
    z-index: 60;
  }

  .v17-arrow {
    width: 44px;
    height: 44px;
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: border-color 0.3s, background 0.3s;
    background: transparent;
    color: rgba(255,255,255,0.4);
    font-size: 16px;
    outline: none;
  }

  .v17-arrow:hover {
    border-color: rgba(255,255,255,0.3);
    background: rgba(255,255,255,0.04);
    color: rgba(255,255,255,0.7);
  }

  /* ===== CTA (after all cards) ===== */
  .v17-cta {
    position: fixed;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 80;
    background: #0c0c0c;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.8s ease;
  }

  .v17-cta.active {
    opacity: 1;
    pointer-events: auto;
  }

  .v17-cta h2 {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: clamp(24px, 4vw, 40px);
    font-weight: 400;
    letter-spacing: 0.15em;
    margin-bottom: 12px;
    color: rgba(255,255,255,0.9);
  }

  .v17-cta p {
    font-size: 13px;
    letter-spacing: 0.1em;
    color: rgba(255,255,255,0.35);
    margin-bottom: 48px;
  }

  .v17-cta-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: min(360px, 85vw);
  }

  .v17-cta-form input,
  .v17-cta-form textarea {
    background: transparent;
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 4px;
    padding: 14px 18px;
    color: #fff;
    font-size: 13px;
    letter-spacing: 0.05em;
    font-family: system-ui, -apple-system, sans-serif;
    outline: none;
    transition: border-color 0.3s;
  }

  .v17-cta-form input:focus,
  .v17-cta-form textarea:focus {
    border-color: rgba(255,255,255,0.3);
  }

  .v17-cta-form input::placeholder,
  .v17-cta-form textarea::placeholder {
    color: rgba(255,255,255,0.2);
    letter-spacing: 0.1em;
  }

  .v17-cta-form textarea {
    resize: none;
    height: 100px;
  }

  .v17-cta-form button {
    background: #fff;
    color: #0c0c0c;
    border: none;
    border-radius: 4px;
    padding: 15px;
    font-size: 11px;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    cursor: pointer;
    font-family: system-ui, -apple-system, sans-serif;
    font-weight: 500;
    transition: opacity 0.3s;
    margin-top: 4px;
  }

  .v17-cta-form button:hover { opacity: 0.85; }

  .v17-cta-restart {
    margin-top: 32px;
    font-size: 11px;
    letter-spacing: 0.15em;
    color: rgba(255,255,255,0.25);
    cursor: pointer;
    border: none;
    background: none;
    text-decoration: underline;
    text-underline-offset: 3px;
    transition: color 0.3s;
    font-family: system-ui, -apple-system, sans-serif;
  }

  .v17-cta-restart:hover { color: rgba(255,255,255,0.5); }

  /* ===== TRANSITIONS FOR DISMISSED CARDS ===== */
  .v17-card-dismissing {
    transition: transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.5s ease;
    pointer-events: none;
  }

  .v17-card-spring {
    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  @media (max-width: 600px) {
    .v17-nav { padding: 20px 24px; }
    .v17-stack-area {
      width: clamp(260px, 78vw, 360px);
      height: clamp(370px, 110vw, 510px);
    }
    .v17-card { padding: 10px; }
    .v17-arrows { gap: 40px; }
  }
`;

interface CardState {
  x: number;
  y: number;
  rotation: number;
  dismissed: boolean;
  dismissDirection: number; // -1 left, 1 right, 0 not dismissed
  opacity: number;
}

export default function V17Page() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cards, setCards] = useState<CardState[]>(
    images.map(() => ({ x: 0, y: 0, rotation: 0, dismissed: false, dismissDirection: 0, opacity: 1 }))
  );
  const [isDragging, setIsDragging] = useState(false);
  const [showCta, setShowCta] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>(new Array(images.length).fill(false));

  const dragStartRef = useRef({ x: 0, y: 0 });
  const dragCurrentRef = useRef({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement | null>(null);
  const animFrameRef = useRef<number>(0);

  // Preload a few images ahead
  useEffect(() => {
    const preloadCount = Math.min(currentIndex + 5, images.length);
    for (let i = currentIndex; i < preloadCount; i++) {
      if (!imagesLoaded[i]) {
        const img = new Image();
        img.onload = () => {
          setImagesLoaded(prev => {
            const next = [...prev];
            next[i] = true;
            return next;
          });
        };
        img.src = `/images/large/${images[i].src}`;
      }
    }
  }, [currentIndex, imagesLoaded]);

  const dismissCard = useCallback((direction: number) => {
    if (currentIndex >= images.length) return;

    setCards(prev => {
      const next = [...prev];
      next[currentIndex] = {
        x: direction * FLY_OFF_DISTANCE,
        y: -50 + Math.random() * 100,
        rotation: direction * (15 + Math.random() * 20),
        dismissed: true,
        dismissDirection: direction,
        opacity: 0,
      };
      return next;
    });

    const nextIdx = currentIndex + 1;
    setTimeout(() => {
      setCurrentIndex(nextIdx);
      if (nextIdx >= images.length) {
        setShowCta(true);
      }
    }, 150);
  }, [currentIndex]);

  const springBack = useCallback(() => {
    if (currentIndex >= images.length) return;
    setCards(prev => {
      const next = [...prev];
      next[currentIndex] = { x: 0, y: 0, rotation: 0, dismissed: false, dismissDirection: 0, opacity: 1 };
      return next;
    });
  }, [currentIndex]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (currentIndex >= images.length) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    dragCurrentRef.current = { x: 0, y: 0 };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, [currentIndex]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || currentIndex >= images.length) return;

    const dx = e.clientX - dragStartRef.current.x;
    const dy = (e.clientY - dragStartRef.current.y) * 0.3;
    dragCurrentRef.current = { x: dx, y: dy };

    const rotation = dx * 0.06;

    setCards(prev => {
      const next = [...prev];
      next[currentIndex] = {
        x: dx,
        y: dy,
        rotation,
        dismissed: false,
        dismissDirection: 0,
        opacity: Math.max(0.5, 1 - Math.abs(dx) / 600),
      };
      return next;
    });
  }, [isDragging, currentIndex]);

  const handlePointerUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    const dx = dragCurrentRef.current.x;
    if (Math.abs(dx) > SWIPE_THRESHOLD) {
      dismissCard(dx > 0 ? 1 : -1);
    } else {
      springBack();
    }
  }, [isDragging, dismissCard, springBack]);

  const handleArrowLeft = useCallback(() => dismissCard(-1), [dismissCard]);
  const handleArrowRight = useCallback(() => dismissCard(1), [dismissCard]);

  const handleRestart = useCallback(() => {
    setCards(images.map(() => ({ x: 0, y: 0, rotation: 0, dismissed: false, dismissDirection: 0, opacity: 1 })));
    setCurrentIndex(0);
    setShowCta(false);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') dismissCard(-1);
      else if (e.key === 'ArrowRight') dismissCard(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dismissCard]);

  // Stack offsets for cards below the top
  const getStackStyle = (stackPos: number): React.CSSProperties => {
    if (stackPos === 0) return {};
    const yOff = stackPos * 8;
    const scale = 1 - stackPos * 0.035;
    const rot = stackPos % 2 === 0 ? stackPos * 1.2 : stackPos * -1.5;
    return {
      transform: `translateY(${yOff}px) scale(${scale}) rotate(${rot}deg)`,
      zIndex: 50 - stackPos,
      pointerEvents: 'none' as const,
      filter: `brightness(${1 - stackPos * 0.08})`,
    };
  };

  // Render visible cards (current + STACK_VISIBLE below)
  const renderCards = () => {
    const rendered = [];
    const start = currentIndex;
    const end = Math.min(currentIndex + STACK_VISIBLE + 1, images.length);

    for (let i = end - 1; i >= start; i--) {
      const stackPos = i - currentIndex;
      const card = cards[i];
      const img = images[i];
      const isTop = i === currentIndex;

      let style: React.CSSProperties;

      if (card.dismissed) {
        style = {
          transform: `translate(${card.x}px, ${card.y}px) rotate(${card.rotation}deg)`,
          opacity: 0,
          zIndex: 60,
        };
      } else if (isTop) {
        style = {
          transform: `translate(${card.x}px, ${card.y}px) rotate(${card.rotation}deg)`,
          opacity: card.opacity,
          zIndex: 60,
        };
      } else {
        style = getStackStyle(stackPos);
      }

      const className = `v17-card${card.dismissed ? ' v17-card-dismissing' : ''}${!isDragging && isTop && !card.dismissed && card.x === 0 ? ' v17-card-spring' : ''}`;

      rendered.push(
        <div
          key={`card-${i}`}
          className={className}
          style={style}
          onPointerDown={isTop && !card.dismissed ? handlePointerDown : undefined}
          onPointerMove={isTop && !card.dismissed ? handlePointerMove : undefined}
          onPointerUp={isTop && !card.dismissed ? handlePointerUp : undefined}
          ref={isTop ? cardRef : undefined}
        >
          <img
            className="v17-card-img"
            src={`/images/large/${img.src}`}
            alt={`${img.name} - ${img.city}`}
            draggable={false}
          />
        </div>
      );
    }

    return rendered;
  };

  const currentImage = currentIndex < images.length ? images[currentIndex] : null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="v17-root">

        {/* Nav */}
        <nav className="v17-nav">
          <a className="v17-nav-inquire" href="#inquire" onClick={(e) => { e.preventDefault(); setShowCta(true); }}>
            Inquire
          </a>
          <span className="v17-nav-name">Aidan Torrence</span>
        </nav>

        {/* Faint title */}
        <div className="v17-title">
          <h1>Aidan Torrence</h1>
        </div>

        {/* Card Stack */}
        {!showCta && (
          <div className="v17-stack-area">
            {renderCards()}
          </div>
        )}

        {/* Caption */}
        {!showCta && currentImage && (
          <div className="v17-caption">
            <div className="v17-caption-name">{currentImage.name}</div>
            <div className="v17-caption-city">{currentImage.city}</div>
          </div>
        )}

        {/* Counter */}
        {!showCta && (
          <div className="v17-counter">
            {Math.min(currentIndex + 1, images.length)} / {images.length}
          </div>
        )}

        {/* Arrow buttons */}
        {!showCta && currentIndex < images.length && (
          <div className="v17-arrows">
            <button className="v17-arrow" onClick={handleArrowLeft} aria-label="Previous">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <button className="v17-arrow" onClick={handleArrowRight} aria-label="Next">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {/* CTA */}
        <div className={`v17-cta${showCta ? ' active' : ''}`}>
          <h2>Let&apos;s Create</h2>
          <p>Book a session with Aidan</p>
          <form className="v17-cta-form" onSubmit={(e) => e.preventDefault()}>
            <input type="text" placeholder="Your name" />
            <input type="email" placeholder="Email address" />
            <input type="text" placeholder="Location / City" />
            <textarea placeholder="Tell me about your vision..." />
            <button type="submit">Send Inquiry</button>
          </form>
          <button className="v17-cta-restart" onClick={handleRestart}>
            View photos again
          </button>
        </div>

      </div>
    </>
  );
}
