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

const TOTAL = images.length;
const MAX_VISIBLE = 6;

const CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body > header, body > footer, .fixed.inset-x-0.bottom-0 { display: none !important; }
  html, body {
    background: #0c0c0c !important;
    color: #fff !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
    height: 100vh !important;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  }

  .gd-container {
    position: fixed;
    inset: 0;
    background: #0c0c0c;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    overflow: hidden;
    perspective: 1200px;
  }

  /* Fixed nav */
  .gd-nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px 32px;
    pointer-events: none;
  }
  .gd-nav-logo {
    font-size: 11px;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.5);
    font-weight: 300;
  }
  .gd-nav-counter {
    font-size: 12px;
    letter-spacing: 2px;
    color: rgba(255,255,255,0.4);
    font-variant-numeric: tabular-nums;
    font-weight: 300;
  }

  /* Stack area */
  .gd-stack {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding-bottom: 40px;
  }

  /* Individual card */
  .gd-card {
    position: absolute;
    left: 50%;
    transform-origin: center bottom;
    will-change: transform, opacity;
  }

  /* Drop animation */
  @keyframes gravityDrop {
    0% {
      transform: translateX(-50%) translateY(-120vh) scale(1) rotate(0deg);
      opacity: 0;
    }
    15% {
      opacity: 1;
    }
    75% {
      transform: translateX(-50%) translateY(var(--land-y)) scale(1) rotate(var(--land-rot));
    }
    85% {
      transform: translateX(-50%) translateY(calc(var(--land-y) - 8px)) scale(1.02) rotate(var(--land-rot));
    }
    92% {
      transform: translateX(-50%) translateY(calc(var(--land-y) + 3px)) scale(0.99) rotate(var(--land-rot));
    }
    100% {
      transform: translateX(-50%) translateY(var(--land-y)) scale(1) rotate(var(--land-rot));
    }
  }

  /* Lift-off animation (reverse) */
  @keyframes gravityLift {
    0% {
      transform: translateX(-50%) translateY(var(--land-y)) scale(1) rotate(var(--land-rot));
      opacity: 1;
    }
    30% {
      transform: translateX(-50%) translateY(calc(var(--land-y) - 20px)) scale(1.01) rotate(var(--land-rot));
      opacity: 1;
    }
    100% {
      transform: translateX(-50%) translateY(-120vh) scale(0.9) rotate(calc(var(--land-rot) * 2));
      opacity: 0;
    }
  }

  .gd-card.dropping {
    animation: gravityDrop 0.7s cubic-bezier(0.22, 0, 0.36, 1) forwards;
  }

  .gd-card.lifting {
    animation: gravityLift 0.5s cubic-bezier(0.55, 0, 1, 0.45) forwards;
  }

  .gd-card.landed {
    transform: translateX(-50%) translateY(var(--land-y)) scale(1) rotate(var(--land-rot));
    opacity: 1;
    transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  .gd-card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    border-radius: 4px;
    box-shadow: 0 8px 40px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4);
    background: #1a1a1a;
  }

  .gd-card-inner img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  /* Caption on top card */
  .gd-caption {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 20px 16px 16px;
    background: linear-gradient(transparent, rgba(0,0,0,0.7));
    opacity: 0;
    transition: opacity 0.4s ease 0.5s;
  }
  .gd-caption.visible {
    opacity: 1;
  }
  .gd-caption-name {
    font-size: 14px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.9);
    font-weight: 300;
  }
  .gd-caption-city {
    font-size: 11px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.45);
    font-weight: 300;
    margin-top: 4px;
  }

  /* Title card */
  .gd-title-card {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #0c0c0c;
    border: 1px solid rgba(255,255,255,0.08);
  }
  .gd-title-text {
    font-size: 18px;
    letter-spacing: 10px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.9);
    font-weight: 200;
    text-align: center;
    line-height: 1.6;
  }
  .gd-title-sub {
    font-size: 10px;
    letter-spacing: 5px;
    color: rgba(255,255,255,0.35);
    margin-top: 8px;
  }

  /* CTA */
  .gd-cta {
    position: fixed;
    bottom: -80px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 90;
    transition: bottom 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
    pointer-events: none;
  }
  .gd-cta.visible {
    bottom: 32px;
    pointer-events: auto;
  }
  .gd-cta a {
    display: inline-block;
    padding: 14px 36px;
    font-size: 11px;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: #0c0c0c;
    background: #fff;
    text-decoration: none;
    font-weight: 400;
    transition: all 0.3s ease;
  }
  .gd-cta a:hover {
    background: rgba(255,255,255,0.85);
    transform: translateY(-2px);
  }

  /* Scroll hint */
  .gd-scroll-hint {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 80;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    opacity: 0.4;
    transition: opacity 0.4s ease;
  }
  .gd-scroll-hint.hidden {
    opacity: 0;
    pointer-events: none;
  }
  .gd-scroll-hint-text {
    font-size: 9px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.5);
  }
  @keyframes scrollPulse {
    0%, 100% { transform: translateY(0); opacity: 0.4; }
    50% { transform: translateY(4px); opacity: 0.8; }
  }
  .gd-scroll-arrow {
    width: 12px;
    height: 12px;
    border-right: 1px solid rgba(255,255,255,0.4);
    border-bottom: 1px solid rgba(255,255,255,0.4);
    transform: rotate(45deg);
    animation: scrollPulse 2s ease infinite;
  }

  /* Slight shadow on stacked edges */
  .gd-card::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 4px;
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.04);
    pointer-events: none;
  }
`;

// Pre-compute slight random rotations for each card for the "messy stack" feel
const cardRotations = [
  0, -1.2, 0.8, -0.5, 1.5, -0.9, 0.3, -1.8, 1.1, -0.4,
  0.7, -1.3, 0.6, -0.7, 1.4, -1.0, 0.5, -1.6, 0.9, -0.3,
  1.2, -0.8, 0.4, -1.1, 0.2, -0.6,
];

export default function GravityDropPage() {
  // droppedCount: how many items have been dropped (index 0 = title card, 1-25 = photos)
  const [droppedCount, setDroppedCount] = useState(0);
  const [animatingIndex, setAnimatingIndex] = useState<number | null>(null);
  const [animatingDirection, setAnimatingDirection] = useState<'drop' | 'lift'>('drop');
  const [allDone, setAllDone] = useState(false);

  const scrollAccumRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalItems = TOTAL + 1; // title + 25 photos

  const dropNext = useCallback(() => {
    if (isAnimatingRef.current) return;
    if (droppedCount >= totalItems) {
      setAllDone(true);
      return;
    }
    isAnimatingRef.current = true;
    setAnimatingDirection('drop');
    setAnimatingIndex(droppedCount);
    setTimeout(() => {
      setDroppedCount(prev => prev + 1);
      setAnimatingIndex(null);
      isAnimatingRef.current = false;
      if (droppedCount + 1 >= totalItems) {
        setAllDone(true);
      }
    }, 700);
  }, [droppedCount, totalItems]);

  const liftLast = useCallback(() => {
    if (isAnimatingRef.current) return;
    if (droppedCount <= 0) return;
    isAnimatingRef.current = true;
    setAllDone(false);
    setAnimatingDirection('lift');
    setAnimatingIndex(droppedCount - 1);
    setTimeout(() => {
      setDroppedCount(prev => prev - 1);
      setAnimatingIndex(null);
      isAnimatingRef.current = false;
    }, 500);
  }, [droppedCount]);

  useEffect(() => {
    const threshold = 60;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      scrollAccumRef.current += e.deltaY;

      if (scrollAccumRef.current > threshold) {
        scrollAccumRef.current = 0;
        dropNext();
      } else if (scrollAccumRef.current < -threshold) {
        scrollAccumRef.current = 0;
        liftLast();
      }
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const dy = touchStartY - e.touches[0].clientY;
      if (dy > 40) {
        touchStartY = e.touches[0].clientY;
        dropNext();
      } else if (dy < -40) {
        touchStartY = e.touches[0].clientY;
        liftLast();
      }
    };

    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      el.removeEventListener('wheel', handleWheel);
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
    };
  }, [dropNext, liftLast]);

  // Auto-drop the title card on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      dropNext();
    }, 600);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate stack layout
  // The "stack" is all landed items. The newest is at the bottom visually (largest),
  // older ones compress and move up.
  const getCardStyle = (stackIndex: number, stackSize: number, isTitle: boolean) => {
    // stackIndex: 0 = oldest in stack, stackSize-1 = newest (top of stack)
    const posFromTop = stackSize - 1 - stackIndex; // 0 = newest, 1 = second newest...

    if (posFromTop >= MAX_VISIBLE) {
      return { display: 'none' as const };
    }

    // Size: newest = biggest, each older one shrinks
    const baseWidth = isTitle ? 340 : 380;
    const baseHeight = isTitle ? 200 : 480;
    const scaleFactor = 1 - posFromTop * 0.12;
    const w = baseWidth * scaleFactor;
    const h = baseHeight * scaleFactor;

    // Vertical position: stack from bottom up
    // Newest sits at bottom, older ones move up
    const bottomOffset = 60; // base from bottom
    let yOffset = 0;
    for (let i = 0; i < posFromTop; i++) {
      // Each older card shifts up by a decreasing amount (compression)
      yOffset += (baseHeight * (1 - i * 0.12)) * 0.18 + 8;
    }
    const landY = -(bottomOffset + yOffset);

    // Slight x offset for depth feel
    const xJitter = posFromTop * (posFromTop % 2 === 0 ? 2 : -2);

    // Rotation
    const rot = cardRotations[stackIndex % cardRotations.length] || 0;

    // Opacity: fade older cards
    const opacity = posFromTop === 0 ? 1 : Math.max(0.3, 1 - posFromTop * 0.15);

    // Z-index: newest on top
    const zIndex = 50 - posFromTop;

    return {
      width: `${w}px`,
      height: `${h}px`,
      bottom: '0px',
      zIndex,
      opacity,
      '--land-y': `${landY}px`,
      '--land-rot': `${rot}deg`,
      '--x-jitter': `${xJitter}px`,
    } as React.CSSProperties;
  };

  // Build the list of all items (title + photos)
  // Index 0 = title, 1..25 = photos
  // "Landed" items: indices 0..droppedCount-1 (excluding animating one if lifting)
  // "Animating" item: animatingIndex

  const landedIndices: number[] = [];
  for (let i = 0; i < droppedCount; i++) {
    if (animatingIndex === i && animatingDirection === 'lift') continue;
    landedIndices.push(i);
  }

  const photoCount = droppedCount > 0 ? droppedCount - 1 : 0;
  const currentPhotoIndex = animatingDirection === 'lift' && animatingIndex !== null
    ? Math.max(0, droppedCount - 2)
    : Math.max(0, droppedCount - 2);
  const displayPhotoNum = Math.min(Math.max(photoCount, 0), TOTAL);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="gd-container" ref={containerRef}>
        {/* Nav */}
        <div className="gd-nav">
          <div className="gd-nav-logo">Aidan Torrence</div>
          <div className="gd-nav-counter">
            {displayPhotoNum > 0 ? (
              <>{String(displayPhotoNum).padStart(2, '0')} / {String(TOTAL).padStart(2, '0')}</>
            ) : (
              <>&mdash; / {String(TOTAL).padStart(2, '0')}</>
            )}
          </div>
        </div>

        {/* Stack */}
        <div className="gd-stack">
          {/* Render landed items */}
          {landedIndices.map((itemIndex, si) => {
            const isTitle = itemIndex === 0;
            const style = getCardStyle(si, landedIndices.length, isTitle);
            const isTop = si === landedIndices.length - 1;
            const photo = isTitle ? null : images[itemIndex - 1];

            return (
              <div
                key={`item-${itemIndex}`}
                className="gd-card landed"
                style={{
                  ...style,
                  transform: `translateX(calc(-50% + var(--x-jitter))) translateY(var(--land-y)) rotate(var(--land-rot))`,
                }}
              >
                <div className="gd-card-inner" style={isTitle ? {} : {}}>
                  {isTitle ? (
                    <div className="gd-title-card" style={{ width: '100%', height: '100%' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div className="gd-title-text">Aidan<br />Torrence</div>
                        <div className="gd-title-sub">Photography</div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <img
                        src={`/images/large/${photo!.src}`}
                        alt={photo!.name}
                        loading="eager"
                      />
                      <div className={`gd-caption ${isTop ? 'visible' : ''}`}>
                        <div className="gd-caption-name">{photo!.name}</div>
                        <div className="gd-caption-city">{photo!.city}</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}

          {/* Render animating item */}
          {animatingIndex !== null && (
            (() => {
              const isTitle = animatingIndex === 0;
              // For dropping: it will land at the top of the current stack
              // For lifting: it's leaving from its current position
              const stackForCalc = animatingDirection === 'drop'
                ? [...landedIndices, animatingIndex]
                : [...landedIndices, animatingIndex];
              const si = stackForCalc.length - 1;
              const style = getCardStyle(si, stackForCalc.length, isTitle);
              const photo = isTitle ? null : images[animatingIndex - 1];

              return (
                <div
                  key={`anim-${animatingIndex}`}
                  className={`gd-card ${animatingDirection === 'drop' ? 'dropping' : 'lifting'}`}
                  style={{
                    ...style,
                    transform: undefined, // let animation handle it
                  }}
                >
                  <div className="gd-card-inner">
                    {isTitle ? (
                      <div className="gd-title-card" style={{ width: '100%', height: '100%' }}>
                        <div style={{ textAlign: 'center' }}>
                          <div className="gd-title-text">Aidan<br />Torrence</div>
                          <div className="gd-title-sub">Photography</div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <img
                          src={`/images/large/${photo!.src}`}
                          alt={photo!.name}
                          loading="eager"
                        />
                        <div className="gd-caption visible">
                          <div className="gd-caption-name">{photo!.name}</div>
                          <div className="gd-caption-city">{photo!.city}</div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })()
          )}
        </div>

        {/* Scroll hint */}
        <div className={`gd-scroll-hint ${droppedCount > 3 || allDone ? 'hidden' : ''}`}>
          <div className="gd-scroll-hint-text">Scroll to drop</div>
          <div className="gd-scroll-arrow" />
        </div>

        {/* CTA */}
        <div className={`gd-cta ${allDone ? 'visible' : ''}`}>
          <a href="/gallery">View Full Gallery</a>
        </div>
      </div>
    </>
  );
}
