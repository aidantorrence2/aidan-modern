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

// Split images into left (odd-indexed: 1,3,5...) and right (even-indexed: 0,2,4...)
// "odd-numbered" photos = indices 0,2,4... (1st,3rd,5th) go LEFT
// "even-numbered" photos = indices 1,3,5... (2nd,4th,6th) go RIGHT
const leftImages = images.filter((_, i) => i % 2 === 0);
const rightImages = images.filter((_, i) => i % 2 === 1);

export default function DualCounterScrollPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);
  const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set());
  const [scrollY, setScrollY] = useState(0);
  const [showCta, setShowCta] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);

      // Check if we've scrolled past most of the content
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const scrolled = window.scrollY;
      if (scrolled + winHeight > docHeight - 200) {
        setShowCta(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection observer for fade-in
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-id');
            if (id) {
              setVisibleItems((prev) => new Set(prev).add(id));
            }
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );

    const items = document.querySelectorAll('[data-id]');
    items.forEach((item) => observerRef.current?.observe(item));

    return () => observerRef.current?.disconnect();
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setFormSubmitted(true);
    },
    []
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          body > header, body > footer, .fixed.inset-x-0.bottom-0 { display: none !important; }
          html { scroll-behavior: smooth; }
          body { background: #0c0c0c; margin: 0; overflow-x: hidden; }

          .v21-container {
            position: relative;
            min-height: 100vh;
            background: #0c0c0c;
            color: #fff;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          }

          /* Fixed nav */
          .v21-nav {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 100;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 32px;
            background: linear-gradient(to bottom, rgba(12,12,12,0.95) 0%, rgba(12,12,12,0) 100%);
            pointer-events: none;
          }
          .v21-nav > * { pointer-events: auto; }

          /* Counter */
          .v21-counter {
            position: fixed;
            bottom: 24px;
            right: 28px;
            z-index: 100;
            font-size: 13px;
            letter-spacing: 2px;
            color: rgba(255,255,255,0.45);
            font-variant-numeric: tabular-nums;
          }

          /* Luminous center divider */
          .v21-divider {
            position: fixed;
            top: 0;
            bottom: 0;
            left: 50%;
            transform: translateX(-0.5px);
            width: 1px;
            background: rgba(255,255,255,0.3);
            box-shadow: 0 0 8px rgba(255,255,255,0.15), 0 0 20px rgba(255,255,255,0.08);
            z-index: 50;
            pointer-events: none;
          }

          /* Columns layout */
          .v21-columns {
            display: flex;
            width: 100%;
            min-height: 100vh;
          }

          .v21-col {
            width: 50%;
            padding: 0 24px;
            box-sizing: border-box;
          }

          .v21-col-left {
            padding-top: 140px;
            padding-bottom: 120px;
          }

          .v21-col-right {
            padding-top: 140px;
            padding-bottom: 120px;
          }

          /* Split title */
          .v21-title-half {
            font-size: clamp(28px, 4vw, 56px);
            font-weight: 200;
            letter-spacing: 14px;
            text-transform: uppercase;
            color: rgba(255,255,255,0.9);
            margin-bottom: 60px;
            line-height: 1.1;
          }
          .v21-title-left {
            text-align: right;
            padding-right: 20px;
          }
          .v21-title-right {
            text-align: left;
            padding-left: 20px;
          }

          /* Photo card */
          .v21-photo-card {
            margin-bottom: 48px;
            opacity: 0;
            transition: opacity 0.8s ease, transform 0.8s ease;
          }
          .v21-photo-card.v21-visible {
            opacity: 1;
          }
          .v21-photo-card.v21-from-left {
            transform: translateX(-40px);
          }
          .v21-photo-card.v21-from-left.v21-visible {
            transform: translateX(0);
          }
          .v21-photo-card.v21-from-right {
            transform: translateX(40px);
          }
          .v21-photo-card.v21-from-right.v21-visible {
            transform: translateX(0);
          }

          .v21-photo-card img {
            width: 100%;
            display: block;
            object-fit: cover;
            aspect-ratio: 3/4;
            filter: grayscale(0.1);
            transition: filter 0.4s ease;
          }
          .v21-photo-card:hover img {
            filter: grayscale(0);
          }

          .v21-caption {
            margin-top: 12px;
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            font-size: 13px;
            letter-spacing: 2px;
            text-transform: uppercase;
          }
          .v21-caption-name {
            color: rgba(255,255,255,0.7);
          }
          .v21-caption-city {
            color: rgba(255,255,255,0.35);
            font-size: 11px;
          }

          /* Right column counter-scroll effect */
          .v21-col-right-inner {
            will-change: transform;
            transition: transform 0.05s linear;
          }

          /* CTA Section */
          .v21-cta {
            position: relative;
            z-index: 10;
            padding: 100px 32px 120px;
            display: flex;
            justify-content: center;
            opacity: 0;
            transform: translateY(40px);
            transition: opacity 0.8s ease, transform 0.8s ease;
          }
          .v21-cta.v21-cta-visible {
            opacity: 1;
            transform: translateY(0);
          }

          .v21-cta-inner {
            max-width: 500px;
            width: 100%;
            text-align: center;
          }

          .v21-cta h2 {
            font-size: 28px;
            font-weight: 200;
            letter-spacing: 8px;
            text-transform: uppercase;
            margin: 0 0 12px;
            color: rgba(255,255,255,0.85);
          }
          .v21-cta p {
            font-size: 14px;
            color: rgba(255,255,255,0.4);
            margin: 0 0 40px;
            letter-spacing: 1px;
          }

          .v21-form-group {
            margin-bottom: 20px;
          }
          .v21-form-group input,
          .v21-form-group textarea {
            width: 100%;
            padding: 14px 0;
            background: transparent;
            border: none;
            border-bottom: 1px solid rgba(255,255,255,0.15);
            color: #fff;
            font-size: 14px;
            letter-spacing: 1.5px;
            outline: none;
            font-family: inherit;
            transition: border-color 0.3s ease;
            box-sizing: border-box;
          }
          .v21-form-group input:focus,
          .v21-form-group textarea:focus {
            border-bottom-color: rgba(255,255,255,0.5);
          }
          .v21-form-group textarea {
            resize: none;
            min-height: 80px;
          }
          .v21-form-group input::placeholder,
          .v21-form-group textarea::placeholder {
            color: rgba(255,255,255,0.25);
            text-transform: uppercase;
            letter-spacing: 3px;
            font-size: 12px;
          }

          .v21-submit-btn {
            margin-top: 32px;
            padding: 16px 48px;
            background: transparent;
            border: 1px solid rgba(255,255,255,0.3);
            color: rgba(255,255,255,0.8);
            font-size: 12px;
            letter-spacing: 4px;
            text-transform: uppercase;
            cursor: pointer;
            font-family: inherit;
            transition: all 0.3s ease;
          }
          .v21-submit-btn:hover {
            background: rgba(255,255,255,0.08);
            border-color: rgba(255,255,255,0.6);
            color: #fff;
          }

          .v21-thankyou {
            font-size: 18px;
            letter-spacing: 6px;
            text-transform: uppercase;
            color: rgba(255,255,255,0.6);
            padding: 40px 0;
          }

          @media (max-width: 768px) {
            .v21-col { padding: 0 16px; }
            .v21-title-half {
              font-size: clamp(18px, 5vw, 32px);
              letter-spacing: 6px;
            }
            .v21-photo-card { margin-bottom: 32px; }
            .v21-nav { padding: 16px 20px; }
          }
        `
      }} />

      <div className="v21-container" ref={containerRef}>
        {/* Fixed nav */}
        <nav className="v21-nav">
          <div style={{
            fontSize: '11px',
            letterSpacing: '3px',
            textTransform: 'uppercase' as const,
            color: 'rgba(255,255,255,0.5)',
          }}>
            Portfolio
          </div>
          <div style={{
            fontSize: '11px',
            letterSpacing: '3px',
            textTransform: 'uppercase' as const,
            color: 'rgba(255,255,255,0.5)',
          }}>
            Contact
          </div>
        </nav>

        {/* Counter */}
        <div className="v21-counter">
          {String(TOTAL).padStart(2, '0')} photos
        </div>

        {/* Luminous center divider */}
        <div className="v21-divider" />

        {/* Two-column layout */}
        <div className="v21-columns">
          {/* LEFT column - scrolls down normally (odd-numbered photos) */}
          <div className="v21-col v21-col-left" ref={leftColRef}>
            <div className="v21-title-half v21-title-left">
              AIDAN
            </div>
            {leftImages.map((img, i) => {
              const globalIndex = i * 2;
              const id = `left-${i}`;
              return (
                <div
                  key={id}
                  data-id={id}
                  className={`v21-photo-card v21-from-left${visibleItems.has(id) ? ' v21-visible' : ''}`}
                >
                  <img
                    src={`/images/large/${img.src}`}
                    alt={`${img.name} - ${img.city}`}
                    loading="lazy"
                  />
                  <div className="v21-caption">
                    <span className="v21-caption-name">{img.name}</span>
                    <span className="v21-caption-city">{img.city}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT column - counter-scrolls (even-numbered photos, reversed) */}
          <div className="v21-col v21-col-right" ref={rightColRef}>
            <div
              className="v21-col-right-inner"
              style={{
                display: 'flex',
                flexDirection: 'column-reverse',
              }}
            >
              <div className="v21-title-half v21-title-right" style={{ order: rightImages.length + 1 }}>
                TORRENCE
              </div>
              {rightImages.map((img, i) => {
                const id = `right-${i}`;
                return (
                  <div
                    key={id}
                    data-id={id}
                    className={`v21-photo-card v21-from-right${visibleItems.has(id) ? ' v21-visible' : ''}`}
                    style={{ order: rightImages.length - i }}
                  >
                    <img
                      src={`/images/large/${img.src}`}
                      alt={`${img.name} - ${img.city}`}
                      loading="lazy"
                    />
                    <div className="v21-caption">
                      <span className="v21-caption-name">{img.name}</span>
                      <span className="v21-caption-city">{img.city}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* CTA form spanning both columns */}
        <div className={`v21-cta${showCta ? ' v21-cta-visible' : ''}`}>
          <div className="v21-cta-inner">
            {!formSubmitted ? (
              <>
                <h2>Get in Touch</h2>
                <p>Let&apos;s create something beautiful together</p>
                <form onSubmit={handleSubmit}>
                  <div className="v21-form-group">
                    <input
                      type="text"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="v21-form-group">
                    <input
                      type="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="v21-form-group">
                    <textarea
                      placeholder="Message"
                      value={formData.message}
                      onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  <button type="submit" className="v21-submit-btn">
                    Send
                  </button>
                </form>
              </>
            ) : (
              <div className="v21-thankyou">Thank you</div>
            )}
          </div>
        </div>
      </div>

      {/* Counter-scroll script */}
      <CounterScrollEffect />
    </>
  );
}

function CounterScrollEffect() {
  useEffect(() => {
    let ticking = false;
    const rightInner = document.querySelector('.v21-col-right-inner') as HTMLElement | null;
    const rightCol = document.querySelector('.v21-col-right') as HTMLElement | null;

    if (!rightInner || !rightCol) return;

    // Calculate the extra height of the right column inner content
    const applyCounterScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollFraction = docHeight > 0 ? scrollTop / docHeight : 0;

      // The right inner is displayed in reverse (column-reverse).
      // We translate it so it appears to scroll upward as the user scrolls down.
      const innerHeight = rightInner.scrollHeight;
      const colHeight = rightCol.clientHeight;
      const overflow = innerHeight - colHeight;

      if (overflow > 0) {
        // Start with content shifted down, then shift up as user scrolls
        const offset = overflow * (1 - scrollFraction);
        rightInner.style.transform = `translateY(${offset}px)`;
      }
    };

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          applyCounterScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    // Initial position
    applyCounterScroll();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', applyCounterScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', applyCounterScroll);
    };
  }, []);

  return null;
}
