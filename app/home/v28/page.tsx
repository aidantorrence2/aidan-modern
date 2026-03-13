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

const TOTAL = images.length;

const CSS = `
  body > header, body > footer, .fixed.inset-x-0.bottom-0 { display: none !important; }
  html, body {
    background: #000000 !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow-x: hidden !important;
  }

  /* ── Scroll snap container ── */
  .cine-scroll {
    height: 100vh;
    overflow-y: scroll;
    scroll-snap-type: y mandatory;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
  }

  .cine-scroll::-webkit-scrollbar {
    display: none;
  }

  .cine-scroll {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  /* ── Each slide ── */
  .cine-slide {
    height: 100vh;
    width: 100vw;
    scroll-snap-align: start;
    position: relative;
    overflow: hidden;
    background: #000;
  }

  /* ── Letterbox bars ── */
  .cine-bar {
    position: absolute;
    left: 0;
    right: 0;
    height: 15vh;
    background: #000;
    z-index: 10;
    display: flex;
    align-items: center;
    padding: 0 clamp(24px, 4vw, 64px);
    transition: height 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .cine-bar-top {
    top: 0;
    justify-content: space-between;
  }

  .cine-bar-bottom {
    bottom: 0;
  }

  .cine-bar.receded {
    height: 0 !important;
    padding: 0 !important;
    overflow: hidden;
  }

  /* ── Typography in bars ── */
  .cine-title {
    font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
    font-size: clamp(10px, 1.1vw, 16px);
    font-weight: 400;
    letter-spacing: 0.35em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.7);
  }

  .cine-frame-num {
    font-family: 'SF Mono', 'Fira Code', 'Courier New', monospace;
    font-size: clamp(10px, 1vw, 14px);
    font-weight: 300;
    letter-spacing: 0.15em;
    color: rgba(255,255,255,0.4);
  }

  .cine-subtitle {
    font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
    font-size: clamp(14px, 1.8vw, 28px);
    font-weight: 300;
    letter-spacing: 0.08em;
    color: rgba(255,255,255,0.85);
    opacity: 0;
    transform: translateY(6px);
    animation: cine-subtitle-in 0.6s 0.4s ease-out forwards;
  }

  .cine-subtitle .cine-city {
    color: rgba(255,255,255,0.4);
    margin-left: 1.5em;
    font-size: 0.8em;
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }

  @keyframes cine-subtitle-in {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* ── Photo viewport (the 70% middle) ── */
  .cine-photo-frame {
    position: absolute;
    top: 15vh;
    left: 0;
    right: 0;
    height: 70vh;
    overflow: hidden;
    transition: top 0.8s cubic-bezier(0.4, 0, 0.2, 1),
                height 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .cine-photo-frame.expanded {
    top: 0;
    height: 100vh;
  }

  .cine-photo-frame img {
    width: 110%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    will-change: transform;
  }

  /* ── Slow pan animation ── */
  .cine-pan {
    animation: cine-pan-lr 8s ease-in-out infinite alternate;
  }

  @keyframes cine-pan-lr {
    0% { transform: translateX(-2.5%); }
    100% { transform: translateX(0%); }
  }

  .cine-pan-reverse {
    animation: cine-pan-rl 8s ease-in-out infinite alternate;
  }

  @keyframes cine-pan-rl {
    0% { transform: translateX(0%); }
    100% { transform: translateX(-2.5%); }
  }

  /* ── Blackout transition overlay ── */
  .cine-blackout {
    position: absolute;
    inset: 0;
    background: #000;
    z-index: 5;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.15s ease-in;
  }

  .cine-blackout.active {
    opacity: 1;
  }

  /* ── Film grain overlay ── */
  .cine-grain {
    position: fixed;
    inset: 0;
    z-index: 100;
    pointer-events: none;
    opacity: 0.035;
    mix-blend-mode: overlay;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    background-size: 128px 128px;
    animation: cine-grain-shift 0.3s steps(3) infinite;
  }

  @keyframes cine-grain-shift {
    0% { transform: translate(0, 0); }
    33% { transform: translate(-1px, 1px); }
    66% { transform: translate(1px, -1px); }
    100% { transform: translate(0, 0); }
  }

  /* ── Opening title slide ── */
  .cine-opening {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 70vh;
    position: absolute;
    top: 15vh;
    left: 0;
    right: 0;
  }

  .cine-opening-text {
    font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
    font-size: clamp(12px, 1.4vw, 22px);
    font-weight: 300;
    letter-spacing: 0.5em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.6);
    opacity: 0;
    animation: cine-fade-in 1.5s 0.3s ease-out forwards;
  }

  @keyframes cine-fade-in {
    to { opacity: 1; }
  }

  /* ── CTA form (final slide) ── */
  .cine-cta-slide {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    width: 100vw;
    position: relative;
    background: #000;
  }

  .cine-cta-inner {
    max-width: 520px;
    width: 90%;
    opacity: 0;
    transform: translateY(20px);
    animation: cine-cta-in 0.8s 0.3s ease-out forwards;
  }

  @keyframes cine-cta-in {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .cine-cta-heading {
    font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
    font-size: clamp(24px, 3vw, 42px);
    font-weight: 200;
    letter-spacing: 0.15em;
    color: rgba(255,255,255,0.9);
    margin-bottom: 8px;
  }

  .cine-cta-sub {
    font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
    font-size: clamp(12px, 1.2vw, 16px);
    font-weight: 300;
    letter-spacing: 0.1em;
    color: rgba(255,255,255,0.35);
    margin-bottom: 48px;
  }

  .cine-form-group {
    margin-bottom: 24px;
  }

  .cine-form-label {
    display: block;
    font-family: 'SF Mono', 'Fira Code', 'Courier New', monospace;
    font-size: 10px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.3);
    margin-bottom: 8px;
  }

  .cine-form-input,
  .cine-form-textarea {
    width: 100%;
    background: transparent;
    border: none;
    border-bottom: 1px solid rgba(255,255,255,0.15);
    padding: 12px 0;
    font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
    font-size: 16px;
    font-weight: 300;
    color: rgba(255,255,255,0.85);
    outline: none;
    transition: border-color 0.3s ease;
    box-sizing: border-box;
    letter-spacing: 0.02em;
  }

  .cine-form-input:focus,
  .cine-form-textarea:focus {
    border-color: rgba(255,255,255,0.5);
  }

  .cine-form-input::placeholder,
  .cine-form-textarea::placeholder {
    color: rgba(255,255,255,0.15);
  }

  .cine-form-textarea {
    resize: none;
    height: 80px;
  }

  .cine-form-submit {
    margin-top: 36px;
    background: transparent;
    border: 1px solid rgba(255,255,255,0.25);
    color: rgba(255,255,255,0.7);
    font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
    font-size: 12px;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    padding: 16px 48px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .cine-form-submit:hover {
    background: rgba(255,255,255,0.05);
    border-color: rgba(255,255,255,0.5);
    color: rgba(255,255,255,0.95);
  }

  .cine-form-sent {
    font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
    font-size: 14px;
    font-weight: 300;
    letter-spacing: 0.15em;
    color: rgba(255,255,255,0.5);
    text-align: center;
    padding: 16px 0;
  }

  /* ── Vignette on photo frames ── */
  .cine-vignette {
    position: absolute;
    inset: 0;
    z-index: 2;
    pointer-events: none;
    background: radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%);
  }
`;

export default function CinematicLetterbox() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [blackout, setBlackout] = useState(false);
  const [formSent, setFormSent] = useState(false);
  const prevIndex = useRef(0);
  const observerRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Total slides: 1 (opening) + TOTAL (photos) + 1 (CTA)
  const totalSlides = TOTAL + 2;
  const isLastSlide = activeIndex === totalSlides - 1;

  // Intersection observer for active slide detection
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number((entry.target as HTMLElement).dataset.slideIndex);
            if (!isNaN(idx)) {
              // Trigger blackout on slide change
              if (idx !== prevIndex.current) {
                setBlackout(true);
                setTimeout(() => setBlackout(false), 250);
                prevIndex.current = idx;
              }
              setActiveIndex(idx);
            }
          }
        });
      },
      {
        root: scrollRef.current,
        threshold: 0.6,
      }
    );

    observerRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setFormSent(true);
  }, []);

  const setSlideRef = useCallback((idx: number) => (el: HTMLDivElement | null) => {
    observerRefs.current[idx] = el;
  }, []);

  // Frame number display (for photo slides only)
  const getFrameDisplay = () => {
    if (activeIndex === 0) return '';
    if (activeIndex >= TOTAL + 1) return '';
    const num = String(activeIndex).padStart(2, '0');
    const tot = String(TOTAL).padStart(2, '0');
    return `${num} / ${tot}`;
  };

  // Current image data (for photo slides)
  const getCurrentImage = () => {
    if (activeIndex === 0 || activeIndex >= TOTAL + 1) return null;
    return images[activeIndex - 1];
  };

  const currentImage = getCurrentImage();

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* Film grain overlay */}
      <div className="cine-grain" />

      {/* Top letterbox bar */}
      <div
        className={`cine-bar cine-bar-top ${isLastSlide ? 'receded' : ''}`}
        style={{ position: 'fixed', zIndex: 20 }}
      >
        <span className="cine-title">Aidan Torrence</span>
        <span className="cine-frame-num">{getFrameDisplay()}</span>
      </div>

      {/* Bottom letterbox bar */}
      <div
        className={`cine-bar cine-bar-bottom ${isLastSlide ? 'receded' : ''}`}
        style={{ position: 'fixed', zIndex: 20 }}
      >
        {currentImage && (
          <div className="cine-subtitle" key={activeIndex}>
            <span>{currentImage.name}</span>
            <span className="cine-city">{currentImage.city}</span>
          </div>
        )}
      </div>

      {/* Scroll container */}
      <div className="cine-scroll" ref={scrollRef}>

        {/* Opening slide: SELECTED WORKS */}
        <div
          className="cine-slide"
          data-slide-index={0}
          ref={setSlideRef(0)}
        >
          <div className="cine-opening">
            <div className="cine-opening-text">Selected Works</div>
          </div>
        </div>

        {/* Photo slides */}
        {images.map((img, i) => {
          const slideIdx = i + 1;
          const isActive = activeIndex === slideIdx;
          const panClass = i % 2 === 0 ? 'cine-pan' : 'cine-pan-reverse';

          return (
            <div
              key={img.src}
              className="cine-slide"
              data-slide-index={slideIdx}
              ref={setSlideRef(slideIdx)}
            >
              <div className={`cine-photo-frame`}>
                <img
                  src={`/images/large/${img.src}`}
                  alt={`${img.name} - ${img.city}`}
                  className={isActive ? panClass : ''}
                  loading={i < 3 ? 'eager' : 'lazy'}
                  draggable={false}
                />
                <div className="cine-vignette" />
              </div>
              <div className={`cine-blackout ${blackout && isActive ? 'active' : ''}`} />
            </div>
          );
        })}

        {/* Final slide: CTA form */}
        <div
          className="cine-slide"
          data-slide-index={TOTAL + 1}
          ref={setSlideRef(TOTAL + 1)}
          style={{ scrollSnapAlign: 'start' }}
        >
          <div className="cine-cta-slide">
            <div className="cine-cta-inner">
              <div className="cine-cta-heading">Let&rsquo;s Work Together</div>
              <div className="cine-cta-sub">Booking inquiries &amp; collaborations</div>

              {!formSent ? (
                <form onSubmit={handleSubmit}>
                  <div className="cine-form-group">
                    <label className="cine-form-label">Name</label>
                    <input
                      type="text"
                      className="cine-form-input"
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div className="cine-form-group">
                    <label className="cine-form-label">Email</label>
                    <input
                      type="email"
                      className="cine-form-input"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  <div className="cine-form-group">
                    <label className="cine-form-label">Message</label>
                    <textarea
                      className="cine-form-textarea"
                      placeholder="Tell me about your project..."
                    />
                  </div>
                  <button type="submit" className="cine-form-submit">
                    Send Inquiry
                  </button>
                </form>
              ) : (
                <div className="cine-form-sent">
                  Thank you. I&rsquo;ll be in touch soon.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
