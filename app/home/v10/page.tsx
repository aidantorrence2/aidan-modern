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

const totalSlides = images.length + 2; // hero + images + CTA

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

  @font-face {
    font-family: 'EditorialDisplay';
    src: local('Georgia');
  }

  .v10-container {
    height: 100vh;
    width: 100vw;
    overflow-y: scroll;
    scroll-snap-type: y mandatory;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
  }

  .v10-container::-webkit-scrollbar { width: 0; display: none; }
  .v10-container { scrollbar-width: none; }

  /* ========== NAV ========== */
  .v10-nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24px 40px;
    pointer-events: none;
    transition: opacity 0.5s ease;
  }

  .v10-nav-logo {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 15px;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.7);
    pointer-events: auto;
    text-decoration: none;
  }

  .v10-nav-links {
    display: flex;
    gap: 32px;
    list-style: none;
  }

  .v10-nav-links a {
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 11px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.5);
    text-decoration: none;
    pointer-events: auto;
    transition: color 0.3s ease;
  }

  .v10-nav-links a:hover { color: #fff; }

  /* ========== COUNTER ========== */
  .v10-counter {
    position: fixed;
    bottom: 32px;
    right: 40px;
    z-index: 100;
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 13px;
    letter-spacing: 0.15em;
    color: rgba(255,255,255,0.4);
    pointer-events: none;
    transition: opacity 0.4s ease;
  }

  .v10-counter .current-num {
    color: rgba(255,255,255,0.9);
    font-size: 18px;
    font-weight: 400;
  }

  /* ========== SCROLL INDICATOR ========== */
  .v10-scroll-indicator {
    position: fixed;
    right: 40px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 100;
    display: flex;
    flex-direction: column;
    gap: 6px;
    pointer-events: none;
  }

  .v10-scroll-dot {
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: rgba(255,255,255,0.15);
    transition: all 0.4s ease;
  }

  .v10-scroll-dot.active {
    background: rgba(255,255,255,0.8);
    transform: scale(1.8);
  }

  /* ========== SECTION BASE ========== */
  .v10-section {
    width: 100vw;
    height: 100vh;
    scroll-snap-align: start;
    scroll-snap-stop: always;
    position: relative;
    overflow: hidden;
  }

  /* ========== HERO ========== */
  .v10-hero {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    background: #0c0c0c;
    position: relative;
  }

  .v10-hero-bg {
    position: absolute;
    inset: 0;
    background-size: cover;
    background-position: center;
    opacity: 0.25;
    filter: grayscale(30%);
    transition: opacity 1.2s ease;
  }

  .v10-hero-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      180deg,
      rgba(12,12,12,0.3) 0%,
      rgba(12,12,12,0.6) 50%,
      rgba(12,12,12,0.95) 100%
    );
  }

  .v10-hero-content {
    position: relative;
    z-index: 2;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0;
  }

  .v10-hero-title {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: clamp(42px, 7vw, 96px);
    font-weight: 400;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #fff;
    line-height: 1.05;
    opacity: 0;
    transform: translateY(30px);
    animation: v10HeroFadeIn 1.2s ease forwards;
    animation-delay: 0.3s;
  }

  .v10-hero-sub {
    font-family: system-ui, -apple-system, sans-serif;
    font-size: clamp(11px, 1.2vw, 14px);
    letter-spacing: 0.35em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.45);
    margin-top: 24px;
    opacity: 0;
    transform: translateY(20px);
    animation: v10HeroFadeIn 1s ease forwards;
    animation-delay: 0.9s;
  }

  .v10-hero-line {
    width: 1px;
    height: 60px;
    background: rgba(255,255,255,0.15);
    margin-top: 48px;
    opacity: 0;
    animation: v10HeroFadeIn 0.8s ease forwards;
    animation-delay: 1.4s;
  }

  .v10-hero-scroll-text {
    font-family: system-ui, sans-serif;
    font-size: 10px;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.3);
    margin-top: 16px;
    opacity: 0;
    animation: v10HeroFadeIn 0.8s ease forwards, v10Pulse 3s ease-in-out infinite;
    animation-delay: 1.8s, 2.6s;
  }

  @keyframes v10HeroFadeIn {
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes v10Pulse {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 0.7; }
  }

  /* ========== SPLIT SLIDE ========== */
  .v10-slide {
    display: flex;
    width: 100%;
    height: 100%;
  }

  .v10-slide-left {
    width: 55%;
    height: 100%;
    position: relative;
    overflow: hidden;
    background: #0a0a0a;
  }

  .v10-slide-img-wrapper {
    width: 100%;
    height: 100%;
    position: relative;
    clip-path: inset(100% 0 0 0);
    transition: clip-path 0.9s cubic-bezier(0.77, 0, 0.175, 1);
  }

  .v10-slide-img-wrapper.revealed {
    clip-path: inset(0 0 0 0);
  }

  .v10-slide-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transform: scale(1.08);
    transition: transform 1.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  .v10-slide-img-wrapper.revealed .v10-slide-img {
    transform: scale(1.0);
  }

  .v10-slide-left::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 120px;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(12,12,12,0.5));
    pointer-events: none;
    z-index: 2;
  }

  .v10-slide-right {
    width: 45%;
    height: 100%;
    background: #0c0c0c;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 80px 60px 80px 50px;
    position: relative;
    overflow: hidden;
  }

  .v10-slide-right::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 1px;
    height: 100%;
    background: linear-gradient(
      180deg,
      transparent 10%,
      rgba(255,255,255,0.06) 50%,
      transparent 90%
    );
  }

  /* ---- Frame Number ---- */
  .v10-frame-num {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: clamp(100px, 12vw, 180px);
    font-weight: 400;
    color: rgba(255,255,255,0.04);
    line-height: 1;
    position: absolute;
    top: 60px;
    right: 50px;
    opacity: 0;
    transform: translateY(40px);
    transition: opacity 0.7s ease, transform 0.7s ease;
    transition-delay: 0s;
    pointer-events: none;
    user-select: none;
  }

  .v10-frame-num.visible {
    opacity: 1;
    transform: translateY(0);
    transition-delay: 0.15s;
  }

  /* ---- Name ---- */
  .v10-subject-name {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: clamp(36px, 4.5vw, 64px);
    font-weight: 400;
    color: #fff;
    letter-spacing: 0.02em;
    line-height: 1.15;
    margin-bottom: 16px;
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.7s ease, transform 0.7s ease;
    transition-delay: 0s;
  }

  .v10-subject-name.visible {
    opacity: 1;
    transform: translateY(0);
    transition-delay: 0.35s;
  }

  /* ---- City ---- */
  .v10-subject-city {
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 12px;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.45);
    margin-bottom: 32px;
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.6s ease, transform 0.6s ease;
    transition-delay: 0s;
  }

  .v10-subject-city.visible {
    opacity: 1;
    transform: translateY(0);
    transition-delay: 0.5s;
  }

  /* ---- Separator ---- */
  .v10-separator {
    width: 0;
    height: 1px;
    background: rgba(255,255,255,0.15);
    transition: width 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    transition-delay: 0s;
    margin-bottom: 32px;
  }

  .v10-separator.visible {
    width: 80px;
    transition-delay: 0.65s;
  }

  /* ---- Description ---- */
  .v10-slide-desc {
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 13px;
    line-height: 1.8;
    color: rgba(255,255,255,0.3);
    max-width: 340px;
    opacity: 0;
    transform: translateY(15px);
    transition: opacity 0.6s ease, transform 0.6s ease;
    transition-delay: 0s;
  }

  .v10-slide-desc.visible {
    opacity: 1;
    transform: translateY(0);
    transition-delay: 0.8s;
  }

  /* ---- AT Monogram ---- */
  .v10-monogram {
    position: absolute;
    bottom: 50px;
    left: 50px;
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 18px;
    letter-spacing: 0.15em;
    color: rgba(255,255,255,0.08);
    opacity: 0;
    transition: opacity 0.6s ease;
    transition-delay: 0s;
  }

  .v10-monogram.visible {
    opacity: 1;
    transition-delay: 1s;
  }

  /* ========== CTA SECTION ========== */
  .v10-cta {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    background: #0c0c0c;
    padding: 60px;
  }

  .v10-cta-title {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: clamp(28px, 4vw, 52px);
    font-weight: 400;
    color: #fff;
    letter-spacing: 0.04em;
    margin-bottom: 12px;
    text-align: center;
  }

  .v10-cta-sub {
    font-family: system-ui, sans-serif;
    font-size: 13px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.35);
    margin-bottom: 48px;
    text-align: center;
  }

  .v10-cta-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
    width: 100%;
    max-width: 440px;
  }

  .v10-cta-input {
    background: transparent;
    border: none;
    border-bottom: 1px solid rgba(255,255,255,0.12);
    padding: 14px 0;
    font-family: system-ui, sans-serif;
    font-size: 14px;
    color: #fff;
    letter-spacing: 0.04em;
    outline: none;
    transition: border-color 0.3s ease;
    width: 100%;
  }

  .v10-cta-input::placeholder {
    color: rgba(255,255,255,0.25);
    letter-spacing: 0.08em;
  }

  .v10-cta-input:focus {
    border-bottom-color: rgba(255,255,255,0.5);
  }

  .v10-cta-textarea {
    background: transparent;
    border: none;
    border-bottom: 1px solid rgba(255,255,255,0.12);
    padding: 14px 0;
    font-family: system-ui, sans-serif;
    font-size: 14px;
    color: #fff;
    letter-spacing: 0.04em;
    outline: none;
    resize: none;
    min-height: 80px;
    transition: border-color 0.3s ease;
    width: 100%;
  }

  .v10-cta-textarea::placeholder {
    color: rgba(255,255,255,0.25);
    letter-spacing: 0.08em;
  }

  .v10-cta-textarea:focus {
    border-bottom-color: rgba(255,255,255,0.5);
  }

  .v10-cta-btn {
    align-self: flex-start;
    background: transparent;
    border: 1px solid rgba(255,255,255,0.2);
    color: rgba(255,255,255,0.7);
    padding: 14px 48px;
    font-family: system-ui, sans-serif;
    font-size: 11px;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.4s ease;
    margin-top: 12px;
  }

  .v10-cta-btn:hover {
    background: #fff;
    color: #0c0c0c;
    border-color: #fff;
  }

  /* ========== PROGRESS BAR ========== */
  .v10-progress {
    position: fixed;
    left: 0;
    bottom: 0;
    height: 2px;
    background: rgba(255,255,255,0.15);
    z-index: 100;
    transition: width 0.4s ease;
  }

  /* ========== MOBILE: stack vertically ========== */
  @media (max-width: 768px) {
    .v10-nav { padding: 16px 20px; }
    .v10-nav-links { gap: 20px; }
    .v10-scroll-indicator { display: none; }
    .v10-counter { right: 20px; bottom: 20px; }

    .v10-slide {
      flex-direction: column;
    }

    .v10-slide-left {
      width: 100%;
      height: 55%;
    }

    .v10-slide-left::after {
      display: none;
    }

    .v10-slide-right {
      width: 100%;
      height: 45%;
      padding: 24px 28px 40px;
      justify-content: flex-start;
    }

    .v10-slide-right::before {
      width: 100%;
      height: 1px;
      background: linear-gradient(90deg, transparent 10%, rgba(255,255,255,0.06) 50%, transparent 90%);
    }

    .v10-frame-num {
      font-size: 72px;
      top: auto;
      bottom: 8px;
      right: 20px;
    }

    .v10-subject-name {
      font-size: 28px;
      margin-bottom: 8px;
    }

    .v10-subject-city {
      font-size: 11px;
      margin-bottom: 16px;
    }

    .v10-separator { margin-bottom: 16px; }

    .v10-slide-desc { font-size: 12px; }

    .v10-monogram {
      bottom: 20px;
      left: 28px;
    }

    .v10-cta {
      padding: 40px 24px;
    }

    .v10-hero-title {
      font-size: clamp(32px, 10vw, 48px);
    }
  }
`;

export default function V10SplitScreenStoryteller() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [revealedSlides, setRevealedSlides] = useState<Set<number>>(new Set([0]));
  const isScrolling = useRef(false);

  const scrollToSlide = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(index, totalSlides - 1));
    const container = containerRef.current;
    if (!container) return;
    container.scrollTo({ top: clamped * window.innerHeight, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const vh = window.innerHeight;
      const idx = Math.round(scrollTop / vh);
      setCurrentSlide(idx);
      setRevealedSlides(prev => {
        const next = new Set(prev);
        next.add(idx);
        return next;
      });
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        scrollToSlide(currentSlide + 1);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        scrollToSlide(currentSlide - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide, scrollToSlide]);

  const padNum = (n: number) => String(n).padStart(2, '0');

  const progressWidth = totalSlides > 1 ? (currentSlide / (totalSlides - 1)) * 100 : 0;

  // Only show dots for a manageable subset
  const dotCount = Math.min(totalSlides, 25);
  const dotStep = totalSlides / dotCount;

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: `<style>${CSS}</style>` }} />

      {/* Fixed Nav */}
      <nav className="v10-nav">
        <a href="/home" className="v10-nav-logo">Aidan Torrence</a>
        <ul className="v10-nav-links">
          <li><a href="#work">Work</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </nav>

      {/* Counter */}
      {currentSlide > 0 && currentSlide < totalSlides - 1 && (
        <div className="v10-counter">
          <span className="current-num">{padNum(currentSlide)}</span>
          <span> / {padNum(images.length)}</span>
        </div>
      )}

      {/* Progress */}
      <div className="v10-progress" style={{ width: `${progressWidth}%` }} />

      {/* Scroll Dots */}
      <div className="v10-scroll-indicator">
        {Array.from({ length: dotCount }).map((_, i) => {
          const slideIdx = Math.round(i * dotStep);
          return (
            <div
              key={i}
              className={`v10-scroll-dot${slideIdx === currentSlide ? ' active' : ''}`}
            />
          );
        })}
      </div>

      {/* Main Scroll Container */}
      <div className="v10-container" ref={containerRef}>

        {/* HERO */}
        <section className="v10-section v10-hero">
          <div
            className="v10-hero-bg"
            style={{ backgroundImage: `url(/images/large/${images[0].src})` }}
          />
          <div className="v10-hero-overlay" />
          <div className="v10-hero-content">
            <h1 className="v10-hero-title">Aidan<br/>Torrence</h1>
            <p className="v10-hero-sub">Selected Works</p>
            <div className="v10-hero-line" />
            <p className="v10-hero-scroll-text">Scroll to explore</p>
          </div>
        </section>

        {/* IMAGE SLIDES */}
        {images.map((img, i) => {
          const slideIndex = i + 1;
          const isRevealed = revealedSlides.has(slideIndex);

          return (
            <section key={img.src} className="v10-section" id={i === 0 ? 'work' : undefined}>
              <div className="v10-slide">
                <div className="v10-slide-left">
                  <div className={`v10-slide-img-wrapper${isRevealed ? ' revealed' : ''}`}>
                    <img
                      className="v10-slide-img"
                      src={`/images/large/${img.src}`}
                      alt={`${img.name} in ${img.city}`}
                      loading={i < 3 ? 'eager' : 'lazy'}
                    />
                  </div>
                </div>
                <div className="v10-slide-right">
                  <div className={`v10-frame-num${isRevealed ? ' visible' : ''}`}>
                    {padNum(i + 1)}
                  </div>
                  <div className={`v10-subject-name${isRevealed ? ' visible' : ''}`}>
                    {img.name}
                  </div>
                  <div className={`v10-subject-city${isRevealed ? ' visible' : ''}`}>
                    {img.city}
                  </div>
                  <div className={`v10-separator${isRevealed ? ' visible' : ''}`} />
                  <div className={`v10-slide-desc${isRevealed ? ' visible' : ''}`}>
                    Portrait session &mdash; {img.city}
                  </div>
                  <div className={`v10-monogram${isRevealed ? ' visible' : ''}`}>
                    AT
                  </div>
                </div>
              </div>
            </section>
          );
        })}

        {/* CTA */}
        <section className="v10-section v10-cta" id="contact">
          <h2 className="v10-cta-title">Let&rsquo;s Create Together</h2>
          <p className="v10-cta-sub">Booking inquiries &amp; collaborations</p>
          <form className="v10-cta-form" onSubmit={e => e.preventDefault()}>
            <input className="v10-cta-input" type="text" placeholder="Your name" />
            <input className="v10-cta-input" type="email" placeholder="Email address" />
            <textarea className="v10-cta-textarea" placeholder="Tell me about your project..." />
            <button className="v10-cta-btn" type="submit">Send Inquiry</button>
          </form>
        </section>

      </div>
    </>
  );
}
