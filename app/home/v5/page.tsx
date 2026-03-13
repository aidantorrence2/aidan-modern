'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';

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

const TOTAL_SLIDES = images.length + 1; // +1 for CTA slide

const CSS = `
  body > header, body > footer, .fixed.inset-x-0.bottom-0 { display: none !important; }

  html, body {
    background: #0c0c0c !important;
    color: #fff !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
    height: 100% !important;
  }

  /* Fixed nav */
  .v5-nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 16px 20px;
    pointer-events: none;
  }

  .v5-nav a {
    pointer-events: auto;
    color: rgba(255,255,255,0.6);
    text-decoration: none;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 12px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    transition: color 0.2s;
  }

  .v5-nav a:hover { color: #fff; }

  /* Progress bar */
  .v5-progress {
    position: fixed;
    top: 0;
    left: 0;
    height: 3px;
    background: linear-gradient(90deg, #fff 0%, rgba(255,255,255,0.5) 100%);
    z-index: 101;
    transition: width 0.4s ease;
  }

  /* Title */
  .v5-title {
    position: fixed;
    top: 56px;
    left: 0;
    right: 0;
    text-align: center;
    z-index: 90;
    color: rgba(255,255,255,0.5);
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 13px;
    font-weight: 400;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    margin: 0;
    pointer-events: none;
  }

  /* Viewport container */
  .v5-viewport {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Image stack */
  .v5-image-stack {
    position: relative;
    width: 100%;
    max-width: 600px;
    height: 75vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .v5-slide {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 1s ease;
    pointer-events: none;
  }

  .v5-slide.v5-active {
    opacity: 1;
    pointer-events: auto;
  }

  .v5-slide img {
    max-width: 100%;
    max-height: 65vh;
    object-fit: contain;
    display: block;
    border-radius: 2px;
  }

  /* Ken Burns */
  @keyframes v5-kenburns {
    0% { transform: scale(1); }
    100% { transform: scale(1.06); }
  }

  .v5-slide.v5-active img {
    animation: v5-kenburns 8s ease-out forwards;
  }

  /* Caption */
  .v5-caption {
    text-align: center;
    margin-top: 14px;
    opacity: 0;
    transform: translateY(8px);
    transition: opacity 0.6s ease 0.3s, transform 0.6s ease 0.3s;
  }

  .v5-slide.v5-active .v5-caption {
    opacity: 1;
    transform: translateY(0);
  }

  .v5-caption-name {
    color: rgba(255,255,255,0.75);
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 16px;
    margin: 0;
    line-height: 1.3;
  }

  .v5-caption-city {
    color: rgba(255,255,255,0.3);
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 11px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    margin: 3px 0 0;
  }

  /* Arrows */
  .v5-arrow {
    position: fixed;
    top: 50%;
    transform: translateY(-50%);
    z-index: 90;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 50%;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: rgba(255,255,255,0.6);
    transition: background 0.2s, color 0.2s;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }

  .v5-arrow:hover {
    background: rgba(255,255,255,0.12);
    color: #fff;
  }

  .v5-arrow-left { left: 16px; }
  .v5-arrow-right { right: 16px; }

  /* Dots */
  .v5-dots {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 90;
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .v5-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgba(255,255,255,0.2);
    cursor: pointer;
    transition: background 0.3s, transform 0.3s;
  }

  .v5-dot.v5-dot-active {
    background: rgba(255,255,255,0.8);
    transform: scale(1.3);
  }

  .v5-dot:hover {
    background: rgba(255,255,255,0.5);
  }

  /* Counter */
  .v5-counter {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 100;
    color: rgba(255,255,255,0.5);
    font-family: 'SF Mono', 'Fira Code', 'Courier New', monospace;
    font-size: 13px;
    font-weight: 400;
    letter-spacing: 0.05em;
    background: rgba(0,0,0,0.5);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    padding: 8px 14px;
    border-radius: 16px;
    border: 1px solid rgba(255,255,255,0.08);
    transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
  }

  .v5-counter.v5-bump {
    transform: scale(1.1);
  }

  /* CTA slide */
  .v5-cta {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 0 24px;
    box-sizing: border-box;
  }

  .v5-cta h3 {
    color: #fff;
    font-size: 22px;
    font-weight: 300;
    letter-spacing: 0.06em;
    margin-bottom: 24px;
    font-family: Georgia, serif;
  }

  .v5-cta form {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .v5-cta input,
  .v5-cta textarea {
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
    box-sizing: border-box;
  }

  .v5-cta input:focus,
  .v5-cta textarea:focus {
    border-color: rgba(255,255,255,0.35);
  }

  .v5-cta textarea {
    min-height: 100px;
    resize: vertical;
  }

  .v5-cta-submit {
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

  .v5-cta-submit:hover { opacity: 0.85; }

  .v5-cta-info {
    margin-top: 36px;
    text-align: center;
  }

  .v5-cta-info p {
    color: rgba(255,255,255,0.4);
    font-size: 13px;
    margin: 4px 0;
    font-family: system-ui, sans-serif;
  }

  @media (max-width: 700px) {
    .v5-image-stack {
      max-width: calc(100% - 80px);
    }
    .v5-arrow {
      width: 36px;
      height: 36px;
    }
    .v5-arrow-left { left: 10px; }
    .v5-arrow-right { right: 10px; }
  }
`;

export default function Page() {
  const [current, setCurrent] = useState(0);
  const [bump, setBump] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSlides = TOTAL_SLIDES;

  const goTo = useCallback((idx: number) => {
    const clamped = Math.max(0, Math.min(idx, totalSlides - 1));
    setCurrent(clamped);
    setBump(true);
    setTimeout(() => setBump(false), 300);
  }, [totalSlides]);

  const next = useCallback(() => {
    setCurrent((prev) => {
      const n = prev < totalSlides - 1 ? prev + 1 : prev;
      if (n !== prev) {
        setBump(true);
        setTimeout(() => setBump(false), 300);
      }
      return n;
    });
  }, [totalSlides]);

  const prev = useCallback(() => {
    setCurrent((prev) => {
      const n = prev > 0 ? prev - 1 : prev;
      if (n !== prev) {
        setBump(true);
        setTimeout(() => setBump(false), 300);
      }
      return n;
    });
  }, []);

  // Auto-advance timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCurrent((prev) => {
        if (prev < totalSlides - 1) {
          setBump(true);
          setTimeout(() => setBump(false), 300);
          return prev + 1;
        }
        return prev;
      });
    }, 4000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [totalSlides]);

  // Reset timer on manual navigation
  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((prev) => {
        if (prev < totalSlides - 1) {
          setBump(true);
          setTimeout(() => setBump(false), 300);
          return prev + 1;
        }
        return prev;
      });
    }, 4000);
  }, [totalSlides]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        next();
        resetTimer();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        prev();
        resetTimer();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [next, prev, resetTimer]);

  const progress = ((current + 1) / totalSlides) * 100;
  const isCtaSlide = current === images.length;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* Progress bar */}
      <div className="v5-progress" style={{ width: `${progress}%` }} />

      {/* Fixed nav */}
      <div className="v5-nav">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            goTo(images.length);
            resetTimer();
          }}
        >
          Inquire
        </a>
        <div style={{ textAlign: 'right', pointerEvents: 'none' }}>
          <p style={{
            color: 'rgba(255,255,255,0.7)',
            fontSize: '13px',
            letterSpacing: '0.12em',
            margin: 0,
            fontFamily: 'Georgia, serif',
          }}>Aidan Torrence</p>
          <p style={{
            color: 'rgba(255,255,255,0.35)',
            fontSize: '10px',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            margin: '2px 0 0',
            fontFamily: 'system-ui, sans-serif',
          }}>Film Photographer</p>
        </div>
      </div>

      {/* Title */}
      <p className="v5-title">Selected Works</p>

      {/* Viewport */}
      <div className="v5-viewport">
        <div className="v5-image-stack">
          {/* Image slides */}
          {images.map((img, i) => (
            <div
              className={`v5-slide${i === current ? ' v5-active' : ''}`}
              key={img.src}
            >
              <img
                src={`/images/large/${img.src}`}
                alt={`${img.name} — ${img.city}`}
                loading={i < 3 ? 'eager' : 'lazy'}
              />
              <div className="v5-caption">
                <p className="v5-caption-name">{img.name}</p>
                <p className="v5-caption-city">{img.city}</p>
              </div>
            </div>
          ))}

          {/* CTA slide */}
          <div className={`v5-slide${isCtaSlide ? ' v5-active' : ''}`}>
            <div className="v5-cta">
              <h3>Get in Touch</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  window.location.href = 'mailto:aidan@aidantorrence.com';
                }}
              >
                <input type="text" placeholder="Name" required />
                <input type="email" placeholder="Email" required />
                <input type="text" placeholder="Instagram" />
                <textarea placeholder="Tell me about your project..." />
                <button type="submit" className="v5-cta-submit">Send Inquiry</button>
              </form>
              <div className="v5-cta-info">
                <p>aidan@aidantorrence.com</p>
                <p>WhatsApp: +49 175 8966210 · @madebyaidan</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Left arrow */}
      <button
        className="v5-arrow v5-arrow-left"
        onClick={() => { prev(); resetTimer(); }}
        aria-label="Previous"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4L6 9l5 5" />
        </svg>
      </button>

      {/* Right arrow */}
      <button
        className="v5-arrow v5-arrow-right"
        onClick={() => { next(); resetTimer(); }}
        aria-label="Next"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 4l5 5-5 5" />
        </svg>
      </button>

      {/* Dots */}
      <div className="v5-dots">
        {Array.from({ length: totalSlides }, (_, i) => (
          <div
            key={i}
            className={`v5-dot${i === current ? ' v5-dot-active' : ''}`}
            onClick={() => { goTo(i); resetTimer(); }}
          />
        ))}
      </div>

      {/* Counter */}
      <div className={`v5-counter${bump ? ' v5-bump' : ''}`}>
        {current + 1} / {totalSlides}
      </div>
    </>
  );
}
