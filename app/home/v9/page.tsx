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

/* Mosaic layout: each tile has col, row start and span to create editorial asymmetry */
const mosaicLayout = [
  { col: '1 / 3', row: '1 / 3', size: 'large' },
  { col: '3 / 4', row: '1 / 2', size: 'small' },
  { col: '4 / 5', row: '1 / 3', size: 'tall' },
  { col: '5 / 7', row: '1 / 2', size: 'wide' },
  { col: '3 / 4', row: '2 / 3', size: 'small' },
  { col: '5 / 6', row: '2 / 3', size: 'small' },
  { col: '6 / 7', row: '2 / 3', size: 'small' },
  { col: '1 / 2', row: '3 / 4', size: 'small' },
  { col: '2 / 4', row: '3 / 5', size: 'large' },
  { col: '4 / 5', row: '3 / 4', size: 'small' },
  { col: '5 / 7', row: '3 / 5', size: 'large' },
  { col: '1 / 2', row: '4 / 6', size: 'tall' },
  { col: '4 / 5', row: '4 / 5', size: 'small' },
  { col: '2 / 3', row: '5 / 6', size: 'small' },
  { col: '3 / 5', row: '5 / 7', size: 'large' },
  { col: '5 / 6', row: '5 / 6', size: 'small' },
  { col: '6 / 7', row: '5 / 7', size: 'tall' },
  { col: '1 / 3', row: '6 / 8', size: 'large' },
  { col: '5 / 6', row: '6 / 7', size: 'small' },
  { col: '3 / 4', row: '7 / 8', size: 'small' },
  { col: '4 / 6', row: '7 / 9', size: 'large' },
  { col: '6 / 7', row: '7 / 8', size: 'small' },
  { col: '1 / 2', row: '8 / 9', size: 'small' },
  { col: '2 / 4', row: '8 / 9', size: 'wide' },
  { col: '6 / 7', row: '8 / 9', size: 'small' },
];

const flyDirections = [
  { x: -120, y: -80 }, { x: 150, y: -60 }, { x: -100, y: 100 },
  { x: 130, y: 80 }, { x: -80, y: -120 }, { x: 100, y: -100 },
  { x: -150, y: 60 }, { x: 80, y: 120 }, { x: -60, y: -150 },
  { x: 140, y: -40 }, { x: -140, y: 40 }, { x: 60, y: 150 },
  { x: -110, y: -90 }, { x: 110, y: 90 }, { x: -90, y: 110 },
  { x: 90, y: -110 }, { x: -70, y: -130 }, { x: 70, y: 130 },
  { x: -130, y: 70 }, { x: 130, y: -70 }, { x: -50, y: -140 },
  { x: 50, y: 140 }, { x: -140, y: 50 }, { x: 140, y: -50 },
  { x: -120, y: 120 },
];

const CSS = `
  body > header, body > footer, .fixed.inset-x-0.bottom-0 { display: none !important; }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html {
    background: #0c0c0c !important;
    scroll-behavior: smooth;
  }
  body {
    background: #0c0c0c !important;
    color: #fff;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
  }

  /* ---- FIXED NAV ---- */
  .mm-nav {
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 1000;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px 40px;
    mix-blend-mode: difference;
    pointer-events: none;
  }
  .mm-nav a, .mm-nav span { pointer-events: auto; }
  .mm-nav-inquire {
    font-size: 13px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #fff;
    text-decoration: none;
    cursor: pointer;
    transition: opacity 0.3s;
  }
  .mm-nav-inquire:hover { opacity: 0.6; }
  .mm-nav-brand {
    font-size: 12px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.7);
  }
  .mm-nav-brand strong {
    color: #fff;
    font-weight: 500;
    margin-right: 8px;
  }

  /* ---- HERO SECTION ---- */
  .mm-hero {
    position: relative;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    overflow: hidden;
  }
  .mm-hero-img-wrap {
    position: absolute;
    width: 55vw;
    height: 70vh;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    overflow: hidden;
    will-change: transform;
  }
  .mm-hero-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: brightness(0.65) contrast(1.05);
    transition: filter 0.6s;
  }
  .mm-hero-text {
    position: relative;
    z-index: 2;
    text-align: center;
    pointer-events: none;
  }
  .mm-hero-title {
    font-family: 'Georgia', 'Times New Roman', serif;
    font-size: clamp(48px, 8vw, 120px);
    font-weight: 400;
    letter-spacing: 0.06em;
    line-height: 1;
    color: #fff;
    text-shadow: 0 2px 40px rgba(0,0,0,0.5);
  }
  .mm-hero-sub {
    font-size: clamp(11px, 1.2vw, 15px);
    letter-spacing: 0.35em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.65);
    margin-top: 16px;
  }
  .mm-hero-scroll {
    position: absolute;
    bottom: 32px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    color: rgba(255,255,255,0.35);
    font-size: 11px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    animation: mm-pulse 2s ease-in-out infinite;
  }
  .mm-hero-scroll-line {
    width: 1px;
    height: 40px;
    background: linear-gradient(to bottom, rgba(255,255,255,0.3), transparent);
  }
  @keyframes mm-pulse {
    0%, 100% { opacity: 0.35; }
    50% { opacity: 0.7; }
  }

  /* ---- MOSAIC SECTION ---- */
  .mm-mosaic-section {
    position: relative;
    padding: 80px 24px 120px;
    min-height: 100vh;
  }
  .mm-mosaic-heading {
    text-align: center;
    margin-bottom: 60px;
  }
  .mm-mosaic-heading h2 {
    font-family: 'Georgia', 'Times New Roman', serif;
    font-size: clamp(28px, 4vw, 48px);
    font-weight: 400;
    letter-spacing: 0.04em;
    color: #fff;
  }
  .mm-mosaic-heading p {
    font-size: 13px;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.35);
    margin-top: 12px;
  }
  .mm-mosaic-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    grid-auto-rows: 180px;
    gap: 10px;
    max-width: 1400px;
    margin: 0 auto;
  }
  .mm-tile {
    position: relative;
    overflow: hidden;
    cursor: pointer;
    border-radius: 2px;
    will-change: transform;
    transform-style: preserve-3d;
    perspective: 800px;
    transition: box-shadow 0.4s;
  }
  .mm-tile.fly-in {
    opacity: 0;
    transform: translate(var(--fly-x), var(--fly-y)) scale(0.7) rotate(var(--fly-r));
    transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1),
                transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .mm-tile.fly-in.visible {
    opacity: 1;
    transform: translate(0, 0) scale(1) rotate(0deg);
  }
  .mm-tile:hover {
    box-shadow: 0 8px 40px rgba(0,0,0,0.6);
    z-index: 10;
  }
  .mm-tile img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), filter 0.5s;
    filter: brightness(0.85) saturate(0.95);
  }
  .mm-tile:hover img {
    transform: scale(1.05);
    filter: brightness(1) saturate(1);
  }
  .mm-tile-overlay {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    padding: 24px 16px 16px;
    background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
    opacity: 0;
    transition: opacity 0.35s;
    pointer-events: none;
  }
  .mm-tile:hover .mm-tile-overlay {
    opacity: 1;
  }
  .mm-tile-name {
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 0.05em;
  }
  .mm-tile-city {
    font-size: 11px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.6);
    margin-top: 2px;
  }

  /* ---- QUOTE SECTION ---- */
  .mm-quote-section {
    position: relative;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  .mm-quote-bg {
    position: absolute;
    inset: 0;
  }
  .mm-quote-bg img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: brightness(0.35) contrast(1.1);
  }
  .mm-quote-content {
    position: relative;
    z-index: 2;
    text-align: center;
    padding: 0 24px;
    max-width: 800px;
  }
  .mm-quote-text {
    font-family: 'Georgia', 'Times New Roman', serif;
    font-size: clamp(28px, 5vw, 56px);
    font-weight: 400;
    font-style: italic;
    line-height: 1.3;
    color: #fff;
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 1s 0.3s, transform 1s 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .mm-quote-text.visible {
    opacity: 1;
    transform: translateY(0);
  }
  .mm-quote-line {
    width: 60px;
    height: 1px;
    background: rgba(255,255,255,0.3);
    margin: 24px auto 0;
    opacity: 0;
    transition: opacity 1s 0.6s;
  }
  .mm-quote-line.visible { opacity: 1; }

  /* ---- CTA / CONTACT SECTION ---- */
  .mm-cta-section {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 24px;
  }
  .mm-cta-heading {
    font-family: 'Georgia', 'Times New Roman', serif;
    font-size: clamp(32px, 5vw, 56px);
    font-weight: 400;
    text-align: center;
    margin-bottom: 12px;
  }
  .mm-cta-sub {
    font-size: 13px;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.4);
    margin-bottom: 48px;
  }
  .mm-cta-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
    width: 100%;
    max-width: 480px;
  }
  .mm-cta-row {
    display: flex;
    gap: 20px;
  }
  .mm-cta-row > * { flex: 1; }
  .mm-cta-form input,
  .mm-cta-form textarea,
  .mm-cta-form select {
    width: 100%;
    padding: 14px 0;
    background: transparent;
    border: none;
    border-bottom: 1px solid rgba(255,255,255,0.15);
    color: #fff;
    font-family: inherit;
    font-size: 14px;
    letter-spacing: 0.03em;
    outline: none;
    transition: border-color 0.3s;
    -webkit-appearance: none;
  }
  .mm-cta-form input::placeholder,
  .mm-cta-form textarea::placeholder {
    color: rgba(255,255,255,0.3);
  }
  .mm-cta-form input:focus,
  .mm-cta-form textarea:focus,
  .mm-cta-form select:focus {
    border-color: rgba(255,255,255,0.5);
  }
  .mm-cta-form select {
    color: rgba(255,255,255,0.3);
    cursor: pointer;
  }
  .mm-cta-form select option {
    background: #1a1a1a;
    color: #fff;
  }
  .mm-cta-form textarea {
    resize: vertical;
    min-height: 80px;
  }
  .mm-cta-submit {
    align-self: flex-start;
    padding: 14px 48px;
    background: #fff;
    color: #0c0c0c;
    border: none;
    font-size: 12px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    cursor: pointer;
    transition: background 0.3s, transform 0.2s;
    margin-top: 12px;
  }
  .mm-cta-submit:hover {
    background: rgba(255,255,255,0.85);
    transform: translateY(-1px);
  }

  /* ---- LIGHTBOX ---- */
  .mm-lightbox {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0,0,0,0);
    backdrop-filter: blur(0px);
    pointer-events: none;
    transition: background 0.4s, backdrop-filter 0.4s;
  }
  .mm-lightbox.open {
    background: rgba(0,0,0,0.92);
    backdrop-filter: blur(12px);
    pointer-events: auto;
  }
  .mm-lightbox-inner {
    position: relative;
    max-width: 85vw;
    max-height: 85vh;
    opacity: 0;
    transform: scale(0.9);
    transition: opacity 0.35s 0.05s, transform 0.35s 0.05s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .mm-lightbox.open .mm-lightbox-inner {
    opacity: 1;
    transform: scale(1);
  }
  .mm-lightbox-inner img {
    max-width: 85vw;
    max-height: 80vh;
    object-fit: contain;
    display: block;
  }
  .mm-lightbox-caption {
    text-align: center;
    margin-top: 16px;
  }
  .mm-lightbox-caption .lb-name {
    font-size: 16px;
    font-weight: 500;
    letter-spacing: 0.05em;
  }
  .mm-lightbox-caption .lb-city {
    font-size: 11px;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.5);
    margin-top: 4px;
  }
  .mm-lightbox-close {
    position: absolute;
    top: -40px;
    right: 0;
    background: none;
    border: none;
    color: rgba(255,255,255,0.6);
    font-size: 28px;
    cursor: pointer;
    transition: color 0.2s;
    line-height: 1;
  }
  .mm-lightbox-close:hover { color: #fff; }

  /* ---- SECTION REVEAL ANIMATION ---- */
  .mm-reveal {
    opacity: 0;
    transform: translateY(40px);
    transition: opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1),
                transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .mm-reveal.visible {
    opacity: 1;
    transform: translateY(0);
  }

  /* ---- FOOTER ---- */
  .mm-footer {
    text-align: center;
    padding: 40px 24px;
    color: rgba(255,255,255,0.2);
    font-size: 11px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }

  /* ---- RESPONSIVE ---- */
  @media (max-width: 1024px) {
    .mm-mosaic-grid {
      grid-template-columns: repeat(3, 1fr);
      grid-auto-rows: 160px;
    }
    .mm-tile {
      grid-column: auto !important;
      grid-row: auto !important;
    }
    .mm-tile:nth-child(1),
    .mm-tile:nth-child(5),
    .mm-tile:nth-child(9),
    .mm-tile:nth-child(14),
    .mm-tile:nth-child(18),
    .mm-tile:nth-child(22) {
      grid-column: span 2 !important;
      grid-row: span 2 !important;
    }
    .mm-tile:nth-child(3),
    .mm-tile:nth-child(7),
    .mm-tile:nth-child(12),
    .mm-tile:nth-child(17) {
      grid-row: span 2 !important;
    }
    .mm-hero-img-wrap {
      width: 80vw;
      height: 60vh;
    }
  }
  @media (max-width: 640px) {
    .mm-mosaic-grid {
      grid-template-columns: repeat(2, 1fr);
      grid-auto-rows: 140px;
    }
    .mm-tile:nth-child(1),
    .mm-tile:nth-child(9),
    .mm-tile:nth-child(18) {
      grid-column: span 2 !important;
      grid-row: span 2 !important;
    }
    .mm-tile:nth-child(5),
    .mm-tile:nth-child(14),
    .mm-tile:nth-child(22) {
      grid-column: auto !important;
      grid-row: span 2 !important;
    }
    .mm-nav { padding: 16px 20px; }
    .mm-cta-row { flex-direction: column; gap: 20px; }
    .mm-hero-img-wrap {
      width: 90vw;
      height: 55vh;
    }
  }
`;

export default function MagneticMosaicPage() {
  const [lightbox, setLightbox] = useState<{ src: string; name: string; city: string } | null>(null);
  const [mosaicVisible, setMosaicVisible] = useState(false);
  const mouseRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);
  const tilesRef = useRef<(HTMLDivElement | null)[]>([]);
  const heroImgRef = useRef<HTMLDivElement>(null);
  const heroSectionRef = useRef<HTMLDivElement>(null);
  const mosaicSectionRef = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLDivElement>(null);
  const quoteLineRef = useRef<HTMLDivElement>(null);
  const revealRefs = useRef<(HTMLElement | null)[]>([]);

  /* Track mouse position */
  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  /* Magnetic tilt loop */
  useEffect(() => {
    const animate = () => {
      const { x: mx, y: my } = mouseRef.current;
      tilesRef.current.forEach((tile) => {
        if (!tile) return;
        const rect = tile.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = mx - cx;
        const dy = my - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 600;
        if (dist < maxDist) {
          const intensity = 1 - dist / maxDist;
          const tiltX = (dy / maxDist) * 4 * intensity;
          const tiltY = -(dx / maxDist) * 4 * intensity;
          const shiftX = (dx / maxDist) * 8 * intensity;
          const shiftY = (dy / maxDist) * 8 * intensity;
          tile.style.transform = `translate(${shiftX}px, ${shiftY}px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
        } else {
          tile.style.transform = 'translate(0, 0) rotateX(0deg) rotateY(0deg)';
        }
      });
      rafRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [handleMouseMove]);

  /* Hero parallax on scroll */
  useEffect(() => {
    const handleScroll = () => {
      if (heroImgRef.current && heroSectionRef.current) {
        const scrollY = window.scrollY;
        const heroH = heroSectionRef.current.offsetHeight;
        if (scrollY < heroH) {
          heroImgRef.current.style.transform = `translate(-50%, calc(-50% + ${scrollY * 0.25}px))`;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* Scroll-triggered reveals */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.15 }
    );

    revealRefs.current.forEach((el) => el && observer.observe(el));
    if (quoteRef.current) observer.observe(quoteRef.current);
    if (quoteLineRef.current) observer.observe(quoteLineRef.current);

    return () => observer.disconnect();
  }, []);

  /* Mosaic fly-in on scroll */
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !mosaicVisible) {
          setMosaicVisible(true);
        }
      },
      { threshold: 0.08 }
    );
    if (mosaicSectionRef.current) observer.observe(mosaicSectionRef.current);
    return () => observer.disconnect();
  }, [mosaicVisible]);

  /* Close lightbox on escape */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const scrollToCta = () => {
    document.getElementById('mm-cta')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* Fixed Nav */}
      <nav className="mm-nav">
        <a className="mm-nav-inquire" onClick={scrollToCta}>Inquire</a>
        <span className="mm-nav-brand">
          <strong>Aidan Torrence</strong> / Film Photographer
        </span>
      </nav>

      {/* Section 1: Hero */}
      <section className="mm-hero" ref={heroSectionRef}>
        <div className="mm-hero-img-wrap" ref={heroImgRef}>
          <img
            className="mm-hero-img"
            src={`/images/large/${images[0].src}`}
            alt="Hero"
            loading="eager"
          />
        </div>
        <div className="mm-hero-text">
          <h1 className="mm-hero-title">AIDAN TORRENCE</h1>
          <p className="mm-hero-sub">Film Photographer</p>
        </div>
        <div className="mm-hero-scroll">
          <span>Scroll</span>
          <div className="mm-hero-scroll-line" />
        </div>
      </section>

      {/* Section 2: Mosaic */}
      <section className="mm-mosaic-section" ref={mosaicSectionRef}>
        <div
          className="mm-mosaic-heading mm-reveal"
          ref={(el) => { revealRefs.current[0] = el; }}
        >
          <h2>Selected Works</h2>
          <p>Portraits from around the world</p>
        </div>
        <div className="mm-mosaic-grid">
          {images.map((img, i) => {
            const layout = mosaicLayout[i];
            const fly = flyDirections[i];
            const rotation = ((i % 7) - 3) * 5;
            const delay = 0.05 * i;
            return (
              <div
                key={i}
                className={`mm-tile fly-in${mosaicVisible ? ' visible' : ''}`}
                style={{
                  gridColumn: layout.col,
                  gridRow: layout.row,
                  ['--fly-x' as string]: `${fly.x}px`,
                  ['--fly-y' as string]: `${fly.y}px`,
                  ['--fly-r' as string]: `${rotation}deg`,
                  transitionDelay: mosaicVisible ? `${delay}s` : '0s',
                } as React.CSSProperties}
                ref={(el) => { tilesRef.current[i] = el; }}
                onClick={() => setLightbox(img)}
              >
                <img
                  src={`/images/large/${img.src}`}
                  alt={`${img.name} - ${img.city}`}
                  loading="lazy"
                />
                <div className="mm-tile-overlay">
                  <div className="mm-tile-name">{img.name}</div>
                  <div className="mm-tile-city">{img.city}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 3: Quote */}
      <section className="mm-quote-section">
        <div className="mm-quote-bg">
          <img
            src={`/images/large/${images[9].src}`}
            alt="Quote background"
            loading="lazy"
          />
        </div>
        <div className="mm-quote-content">
          <div className="mm-quote-text" ref={quoteRef}>
            &ldquo;Every portrait tells a story&rdquo;
          </div>
          <div className="mm-quote-line" ref={quoteLineRef} />
        </div>
      </section>

      {/* Section 4: CTA */}
      <section className="mm-cta-section" id="mm-cta">
        <div
          className="mm-reveal"
          ref={(el) => { revealRefs.current[1] = el; }}
          style={{ textAlign: 'center' as const }}
        >
          <h2 className="mm-cta-heading">Get in Touch</h2>
          <p className="mm-cta-sub">Let&rsquo;s create something beautiful</p>
        </div>
        <form
          className="mm-cta-form mm-reveal"
          ref={(el) => { revealRefs.current[2] = el; }}
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="mm-cta-row">
            <input type="text" placeholder="First Name" required />
            <input type="text" placeholder="Last Name" required />
          </div>
          <input type="email" placeholder="Email Address" required />
          <select defaultValue="">
            <option value="" disabled>Type of Shoot</option>
            <option value="portrait">Portrait</option>
            <option value="couple">Couple</option>
            <option value="editorial">Editorial</option>
            <option value="brand">Brand / Commercial</option>
            <option value="other">Other</option>
          </select>
          <input type="text" placeholder="Preferred Location" />
          <textarea placeholder="Tell me about your vision..." rows={3} />
          <button type="submit" className="mm-cta-submit">Send Inquiry</button>
        </form>
      </section>

      {/* Footer */}
      <div className="mm-footer">
        &copy; {new Date().getFullYear()} Aidan Torrence
      </div>

      {/* Lightbox */}
      <div
        className={`mm-lightbox${lightbox ? ' open' : ''}`}
        onClick={() => setLightbox(null)}
      >
        {lightbox && (
          <div className="mm-lightbox-inner" onClick={(e) => e.stopPropagation()}>
            <button className="mm-lightbox-close" onClick={() => setLightbox(null)}>&times;</button>
            <img src={`/images/large/${lightbox.src}`} alt={lightbox.name} />
            <div className="mm-lightbox-caption">
              <div className="lb-name">{lightbox.name}</div>
              <div className="lb-city">{lightbox.city}</div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
