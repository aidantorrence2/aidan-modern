'use client';

import React, { useEffect, useRef, useState } from 'react';

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

/* Assign each image to a depth layer with predetermined positions */
const layerAssignments: Array<{
  layer: 'bg' | 'mid' | 'fg';
  xPercent: number;
  yPercent: number;
}> = [
  { layer: 'fg', xPercent: 2, yPercent: 10 },
  { layer: 'mid', xPercent: 8, yPercent: 55 },
  { layer: 'bg', xPercent: 5, yPercent: 25 },
  { layer: 'mid', xPercent: 15, yPercent: 15 },
  { layer: 'fg', xPercent: 18, yPercent: 50 },
  { layer: 'bg', xPercent: 14, yPercent: 65 },
  { layer: 'fg', xPercent: 24, yPercent: 8 },
  { layer: 'mid', xPercent: 28, yPercent: 48 },
  { layer: 'bg', xPercent: 22, yPercent: 35 },
  { layer: 'mid', xPercent: 34, yPercent: 12 },
  { layer: 'fg', xPercent: 36, yPercent: 55 },
  { layer: 'bg', xPercent: 32, yPercent: 72 },
  { layer: 'fg', xPercent: 42, yPercent: 20 },
  { layer: 'mid', xPercent: 46, yPercent: 58 },
  { layer: 'bg', xPercent: 40, yPercent: 42 },
  { layer: 'mid', xPercent: 52, yPercent: 8 },
  { layer: 'fg', xPercent: 55, yPercent: 48 },
  { layer: 'bg', xPercent: 50, yPercent: 68 },
  { layer: 'fg', xPercent: 62, yPercent: 15 },
  { layer: 'mid', xPercent: 66, yPercent: 52 },
  { layer: 'bg', xPercent: 60, yPercent: 35 },
  { layer: 'mid', xPercent: 72, yPercent: 18 },
  { layer: 'fg', xPercent: 76, yPercent: 55 },
  { layer: 'bg', xPercent: 70, yPercent: 70 },
  { layer: 'mid', xPercent: 80, yPercent: 30 },
];

const layerConfig = {
  bg: { speed: 0.3, sizeMin: 30, sizeMax: 40, blur: 2.5, zIndex: 1, opacity: 0.5 },
  mid: { speed: 0.7, sizeMin: 50, sizeMax: 60, blur: 0, zIndex: 2, opacity: 0.85 },
  fg: { speed: 1.0, sizeMin: 70, sizeMax: 80, blur: 0, zIndex: 3, opacity: 1 },
};

const CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body > header, body > footer, .fixed.inset-x-0.bottom-0 { display: none !important; }
  html, body {
    background: #0c0c0c !important;
    color: #fff !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow-x: hidden !important;
    -webkit-font-smoothing: antialiased;
  }
  html { overflow: hidden !important; }

  /* Progress bar */
  .hp-progress {
    position: fixed; top: 0; left: 0;
    height: 2px; background: rgba(255,255,255,0.8);
    z-index: 1000; transition: width 0.1s linear;
    box-shadow: 0 0 8px rgba(255,255,255,0.3);
  }

  /* Fixed nav */
  .hp-nav {
    position: fixed; top: 0; left: 0; right: 0;
    display: flex; justify-content: space-between; align-items: center;
    padding: 24px 32px;
    z-index: 100;
    pointer-events: none;
  }
  .hp-nav a, .hp-nav span {
    pointer-events: all;
  }
  .hp-nav-inquire {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase;
    color: rgba(255,255,255,0.7);
    text-decoration: none;
    border: 1px solid rgba(255,255,255,0.2);
    padding: 10px 20px;
    transition: all 0.3s ease;
    background: rgba(12,12,12,0.5);
    backdrop-filter: blur(10px);
  }
  .hp-nav-inquire:hover {
    color: #fff; border-color: rgba(255,255,255,0.5);
    background: rgba(255,255,255,0.08);
  }
  .hp-nav-brand {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase;
    color: rgba(255,255,255,0.4);
    text-align: right;
    line-height: 1.6;
    background: rgba(12,12,12,0.5);
    backdrop-filter: blur(10px);
    padding: 8px 14px;
  }

  /* Scroll container */
  .hp-scroll-container {
    position: fixed; top: 0; left: 0;
    width: 100vw; height: 100vh;
    overflow: hidden;
  }

  /* Virtual scroller - creates the scroll height */
  .hp-virtual-scroller {
    position: fixed; top: 0; left: 0;
    width: 100vw;
    height: 500vh;
    pointer-events: none;
  }

  /* Parallax world */
  .hp-world {
    position: absolute; top: 0; left: 0;
    width: 400vw; height: 100vh;
    will-change: transform;
  }

  /* Background name text */
  .hp-bg-name {
    position: absolute;
    top: 50%; left: 5%;
    transform: translateY(-50%);
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: 25vh;
    font-weight: 100;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.03);
    white-space: nowrap;
    z-index: 0;
    pointer-events: none;
    user-select: none;
  }

  /* Image cards */
  .hp-image-card {
    position: absolute;
    transition: opacity 0.8s ease;
  }
  .hp-image-card img {
    width: 100%; height: 100%;
    object-fit: cover;
    display: block;
  }
  .hp-image-card .hp-caption {
    position: absolute;
    bottom: -28px; left: 0;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    white-space: nowrap;
  }
  .hp-caption-name {
    font-size: 12px; font-weight: 400;
    letter-spacing: 0.15em; text-transform: uppercase;
    color: rgba(255,255,255,0.7);
  }
  .hp-caption-city {
    font-size: 10px; font-weight: 300;
    letter-spacing: 0.2em; text-transform: uppercase;
    color: rgba(255,255,255,0.35);
    margin-left: 10px;
  }

  /* Foreground card captions are larger */
  .hp-layer-fg .hp-caption { bottom: -34px; }
  .hp-layer-fg .hp-caption-name { font-size: 14px; }
  .hp-layer-fg .hp-caption-city { font-size: 11px; }

  /* Background card captions are smaller */
  .hp-layer-bg .hp-caption { bottom: -22px; }
  .hp-layer-bg .hp-caption-name { font-size: 10px; }
  .hp-layer-bg .hp-caption-city { font-size: 8px; }

  /* Scroll indicator */
  .hp-scroll-hint {
    position: fixed; bottom: 32px; left: 50%;
    transform: translateX(-50%);
    display: flex; align-items: center; gap: 12px;
    z-index: 100;
    animation: hp-hint-pulse 2.5s ease-in-out infinite;
    pointer-events: none;
  }
  .hp-scroll-hint-text {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: 10px; letter-spacing: 0.35em; text-transform: uppercase;
    color: rgba(255,255,255,0.4);
  }
  .hp-scroll-hint-arrow {
    font-size: 18px; color: rgba(255,255,255,0.4);
    animation: hp-arrow-slide 2.5s ease-in-out infinite;
  }
  @keyframes hp-hint-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
  @keyframes hp-arrow-slide {
    0%, 100% { transform: translateX(0); }
    50% { transform: translateX(8px); }
  }

  /* CTA section at the end */
  .hp-cta-section {
    position: absolute;
    right: 0; top: 0;
    width: 100vw; height: 100vh;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    z-index: 50;
    background: radial-gradient(ellipse at center, rgba(20,20,20,0.95) 0%, rgba(12,12,12,0.99) 70%);
  }
  .hp-cta-title {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: clamp(28px, 5vw, 56px);
    font-weight: 100;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #fff;
    margin-bottom: 8px;
  }
  .hp-cta-sub {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: 11px; letter-spacing: 0.3em; text-transform: uppercase;
    color: rgba(255,255,255,0.35);
    margin-bottom: 48px;
  }
  .hp-cta-form {
    display: flex; flex-direction: column;
    gap: 16px; width: 100%; max-width: 400px;
    padding: 0 24px;
  }
  .hp-cta-form input,
  .hp-cta-form textarea {
    width: 100%;
    background: transparent;
    border: 1px solid rgba(255,255,255,0.15);
    color: #fff;
    padding: 14px 18px;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: 13px;
    letter-spacing: 0.05em;
    outline: none;
    transition: border-color 0.3s ease;
  }
  .hp-cta-form input::placeholder,
  .hp-cta-form textarea::placeholder {
    color: rgba(255,255,255,0.25);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    font-size: 11px;
  }
  .hp-cta-form input:focus,
  .hp-cta-form textarea:focus {
    border-color: rgba(255,255,255,0.4);
  }
  .hp-cta-form textarea {
    resize: vertical; min-height: 100px;
  }
  .hp-cta-submit {
    width: 100%;
    padding: 16px;
    background: #fff;
    color: #0c0c0c;
    border: none;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase;
    cursor: pointer;
    transition: opacity 0.3s ease;
    font-weight: 500;
  }
  .hp-cta-submit:hover { opacity: 0.85; }
  .hp-cta-links {
    display: flex; gap: 24px; margin-top: 32px;
    justify-content: center;
  }
  .hp-cta-links a {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: 10px; letter-spacing: 0.25em; text-transform: uppercase;
    color: rgba(255,255,255,0.35);
    text-decoration: none;
    transition: color 0.3s ease;
  }
  .hp-cta-links a:hover { color: rgba(255,255,255,0.7); }
  .hp-cta-credits {
    margin-top: 40px;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: 9px; letter-spacing: 0.3em; text-transform: uppercase;
    color: rgba(255,255,255,0.15);
  }

  /* Mobile adjustments */
  @media (max-width: 768px) {
    .hp-nav { padding: 16px 20px; }
    .hp-nav-inquire { font-size: 9px; padding: 8px 14px; }
    .hp-nav-brand { font-size: 8px; }
    .hp-bg-name { font-size: 15vh; }
    .hp-scroll-hint { bottom: 20px; }
  }
`;

export default function HomeV8() {
  const scrollRef = useRef(0);
  const worldRef = useRef<HTMLDivElement>(null);
  const bgNameRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef = useRef<number>(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    /* Total scrollable distance: virtual scroller height minus one viewport */
    const getMaxScroll = () => document.body.scrollHeight - window.innerHeight;
    /* Total horizontal distance: world width minus one viewport */
    const getMaxTranslate = () => {
      if (!worldRef.current) return 0;
      return worldRef.current.scrollWidth - window.innerWidth;
    };

    const onScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = getMaxScroll();
      const progress = Math.min(scrollY / maxScroll, 1);
      scrollRef.current = progress;

      /* Hide scroll hint after a bit of scrolling */
      if (hintRef.current) {
        hintRef.current.style.opacity = progress > 0.05 ? '0' : '1';
      }

      /* Update progress bar */
      if (progressRef.current) {
        progressRef.current.style.width = `${progress * 100}%`;
      }

      const maxTranslate = getMaxTranslate();
      const baseTranslate = progress * maxTranslate;

      /* Move each layer at its own speed */
      if (worldRef.current) {
        const cards = worldRef.current.querySelectorAll<HTMLElement>('.hp-image-card');
        cards.forEach((card) => {
          const speed = parseFloat(card.dataset.speed || '1');
          const tx = -baseTranslate * speed;
          card.style.transform = `translateX(${tx}px)`;

          /* Fade in based on viewport position */
          const rect = card.getBoundingClientRect();
          const inView = rect.left < window.innerWidth + 100 && rect.right > -100;
          const entering = rect.left < window.innerWidth * 1.1;
          if (inView && entering) {
            card.style.opacity = '1';
          } else if (rect.left > window.innerWidth * 1.2) {
            card.style.opacity = '0';
          }
        });
      }

      /* Move background name slower */
      if (bgNameRef.current) {
        bgNameRef.current.style.transform = `translateY(-50%) translateX(${-baseTranslate * 0.15}px)`;
      }
    };

    /* Set body to have enough scroll height via the virtual scroller */
    document.documentElement.style.overflow = 'auto';
    document.documentElement.style.height = 'auto';
    document.body.style.overflow = 'auto';
    document.body.style.height = '500vh';

    window.addEventListener('scroll', onScroll, { passive: true });
    /* Initial call */
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      document.body.style.height = '';
      document.documentElement.style.overflow = '';
      document.documentElement.style.height = '';
      document.body.style.overflow = '';
    };
  }, []);

  /* Seed-based pseudo-random for consistent sizes */
  const seededSize = (index: number, min: number, max: number) => {
    const t = ((index * 7 + 13) % 17) / 17;
    return min + t * (max - min);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* Progress bar */}
      <div className="hp-progress" ref={progressRef} style={{ width: '0%' }} />

      {/* Fixed navigation */}
      <nav className="hp-nav">
        <a className="hp-nav-inquire" href="#hp-cta">Inquire</a>
        <span className="hp-nav-brand">
          Aidan Torrence<br />Film Photographer
        </span>
      </nav>

      {/* Scroll indicator */}
      <div className="hp-scroll-hint" ref={hintRef}>
        <span className="hp-scroll-hint-text">Scroll</span>
        <span className="hp-scroll-hint-arrow">&rarr;</span>
      </div>

      {/* Fixed viewport */}
      <div className="hp-scroll-container">
        {/* The parallax world */}
        <div className="hp-world" ref={worldRef}>
          {/* Background photographer name */}
          <div className="hp-bg-name" ref={bgNameRef}>
            Aidan Torrence
          </div>

          {/* Image cards across three layers */}
          {images.map((img, i) => {
            const assignment = layerAssignments[i];
            const config = layerConfig[assignment.layer];
            const size = seededSize(i, config.sizeMin, config.sizeMax);
            const aspectRatio = 0.667; /* portrait aspect */
            const widthVh = size * aspectRatio;

            return (
              <div
                key={i}
                className={`hp-image-card hp-layer-${assignment.layer}`}
                ref={(el) => { cardsRef.current[i] = el; }}
                data-speed={config.speed}
                style={{
                  left: `${assignment.xPercent}%`,
                  top: `${assignment.yPercent}%`,
                  height: `${size}vh`,
                  width: `${widthVh}vh`,
                  zIndex: config.zIndex,
                  opacity: 0,
                  filter: config.blur > 0 ? `blur(${config.blur}px)` : 'none',
                }}
              >
                <img
                  src={`/images/large/${img.src}`}
                  alt={`${img.name} - ${img.city}`}
                  loading="lazy"
                  style={{ opacity: config.opacity }}
                />
                <div className="hp-caption">
                  <span className="hp-caption-name">{img.name}</span>
                  <span className="hp-caption-city">{img.city}</span>
                </div>
              </div>
            );
          })}

          {/* CTA section at the far right */}
          <div className="hp-cta-section" id="hp-cta">
            <div className="hp-cta-title">Let&rsquo;s Create</div>
            <div className="hp-cta-sub">Sessions available worldwide</div>
            <form
              className="hp-cta-form"
              onSubmit={(e) => {
                e.preventDefault();
                window.location.href = 'mailto:aidan@aidantorrence.com';
              }}
            >
              <input type="text" placeholder="Your Name" required />
              <input type="email" placeholder="Email" required />
              <input type="text" placeholder="Location &amp; Date" />
              <textarea placeholder="Tell me about your vision..." />
              <button type="submit" className="hp-cta-submit">
                Send Inquiry
              </button>
            </form>
            <div className="hp-cta-links">
              <a href="https://wa.me/491758966210">WhatsApp</a>
              <a href="https://instagram.com/aidantorrence" target="_blank" rel="noopener noreferrer">
                @aidantorrence
              </a>
              <a href="mailto:aidan@aidantorrence.com">Email</a>
            </div>
            <div className="hp-cta-credits">Vogue Italia &middot; Hypebeast &middot; WWD</div>
          </div>
        </div>
      </div>
    </>
  );
}
