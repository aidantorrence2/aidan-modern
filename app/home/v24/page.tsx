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

// Layout definitions for the mood board collage
// Each photo gets: position (top%, left%), size (w, h), rotation, depth (parallax speed), effects
const photoLayouts: {
  top: number; left: number; w: number; h: number;
  rot: number; depth: number;
  tornEdge?: boolean; washiTape?: boolean; washiColor?: string; washiAngle?: number;
  caption?: boolean; stickyNote?: string;
  zIndex: number;
}[] = [
  // Row 1 cluster - hero area
  { top: 2, left: 5, w: 420, h: 560, rot: -3, depth: 0.3, washiTape: true, washiColor: 'rgba(200,170,120,0.55)', washiAngle: -15, caption: true, zIndex: 5 },
  { top: 5, left: 38, w: 340, h: 450, rot: 2, depth: 0.5, tornEdge: true, caption: true, zIndex: 4 },
  { top: 0, left: 65, w: 380, h: 500, rot: -1, depth: 0.2, washiTape: true, washiColor: 'rgba(180,130,130,0.5)', washiAngle: 10, zIndex: 6 },

  // Row 2 cluster
  { top: 420, left: 2, w: 280, h: 370, rot: 4, depth: 0.6, tornEdge: true, zIndex: 3 },
  { top: 380, left: 28, w: 500, h: 340, rot: -2, depth: 0.15, washiTape: true, washiColor: 'rgba(120,170,150,0.5)', washiAngle: -5, caption: true, zIndex: 7 },
  { top: 450, left: 58, w: 260, h: 350, rot: 3, depth: 0.45, caption: true, zIndex: 4 },
  { top: 400, left: 78, w: 300, h: 400, rot: -4, depth: 0.35, tornEdge: true, zIndex: 5 },

  // Row 3 cluster
  { top: 780, left: 8, w: 360, h: 480, rot: -2, depth: 0.25, washiTape: true, washiColor: 'rgba(200,180,100,0.5)', washiAngle: 20, zIndex: 6 },
  { top: 820, left: 35, w: 280, h: 380, rot: 5, depth: 0.55, caption: true, zIndex: 3 },
  { top: 750, left: 55, w: 440, h: 320, rot: -1, depth: 0.1, stickyNote: 'favorite session!', zIndex: 8 },
  { top: 850, left: 75, w: 300, h: 400, rot: 3, depth: 0.4, tornEdge: true, caption: true, zIndex: 4 },

  // Row 4 cluster
  { top: 1180, left: 3, w: 320, h: 430, rot: 2, depth: 0.5, caption: true, zIndex: 5 },
  { top: 1150, left: 30, w: 380, h: 500, rot: -3, depth: 0.2, washiTape: true, washiColor: 'rgba(170,140,190,0.5)', washiAngle: -10, zIndex: 7 },
  { top: 1220, left: 60, w: 260, h: 350, rot: 4, depth: 0.6, tornEdge: true, zIndex: 3 },
  { top: 1100, left: 78, w: 300, h: 420, rot: -2, depth: 0.3, caption: true, zIndex: 5 },

  // Row 5 cluster
  { top: 1550, left: 5, w: 440, h: 320, rot: -1, depth: 0.15, stickyNote: 'golden hour magic', zIndex: 8 },
  { top: 1600, left: 40, w: 300, h: 400, rot: 3, depth: 0.45, washiTape: true, washiColor: 'rgba(200,150,120,0.5)', washiAngle: 15, caption: true, zIndex: 6 },
  { top: 1520, left: 68, w: 360, h: 480, rot: -4, depth: 0.25, tornEdge: true, zIndex: 4 },

  // Row 6 cluster
  { top: 1920, left: 10, w: 300, h: 400, rot: 3, depth: 0.4, caption: true, zIndex: 5 },
  { top: 1880, left: 35, w: 260, h: 350, rot: -2, depth: 0.55, tornEdge: true, zIndex: 3 },
  { top: 1950, left: 55, w: 400, h: 300, rot: 1, depth: 0.2, washiTape: true, washiColor: 'rgba(150,180,160,0.5)', washiAngle: -8, zIndex: 7 },
  { top: 1900, left: 78, w: 280, h: 370, rot: -3, depth: 0.35, caption: true, zIndex: 4 },

  // Row 7 - final cluster
  { top: 2300, left: 5, w: 350, h: 460, rot: -2, depth: 0.3, washiTape: true, washiColor: 'rgba(190,160,130,0.5)', washiAngle: 12, zIndex: 6 },
  { top: 2350, left: 38, w: 300, h: 400, rot: 4, depth: 0.5, tornEdge: true, caption: true, zIndex: 4 },
  { top: 2280, left: 65, w: 380, h: 500, rot: -1, depth: 0.15, stickyNote: 'incredible light', zIndex: 8 },
];

// Decorative elements scattered around
const decorations: { top: number; left: number; type: 'arrow' | 'circle' | 'underline' | 'star'; rot: number; depth: number }[] = [
  { top: 350, left: 52, type: 'arrow', rot: -20, depth: 0.3 },
  { top: 700, left: 15, type: 'circle', rot: 5, depth: 0.4 },
  { top: 1100, left: 70, type: 'underline', rot: -3, depth: 0.2 },
  { top: 1500, left: 25, type: 'star', rot: 10, depth: 0.5 },
  { top: 1850, left: 80, type: 'arrow', rot: 15, depth: 0.35 },
  { top: 2200, left: 45, type: 'circle', rot: -8, depth: 0.25 },
  { top: 2600, left: 20, type: 'underline', rot: 2, depth: 0.45 },
];

const tornClipPaths = [
  'polygon(0% 0%, 100% 0%, 100% 2%, 98% 4%, 100% 6%, 99% 10%, 100% 14%, 98% 18%, 100% 22%, 99% 26%, 100% 30%, 98% 35%, 100% 40%, 99% 45%, 100% 50%, 98% 55%, 100% 60%, 99% 65%, 100% 70%, 98% 75%, 100% 80%, 99% 85%, 100% 90%, 98% 95%, 100% 100%, 0% 100%, 2% 96%, 0% 92%, 1% 88%, 0% 84%, 2% 80%, 0% 76%, 1% 72%, 0% 68%, 2% 64%, 0% 60%, 1% 56%, 0% 52%, 2% 48%, 0% 44%, 1% 40%, 0% 36%, 2% 32%, 0% 28%, 1% 24%, 0% 20%, 2% 16%, 0% 12%, 1% 8%, 0% 4%)',
  'polygon(2% 0%, 98% 0%, 100% 2%, 97% 5%, 100% 8%, 98% 12%, 100% 16%, 97% 20%, 100% 95%, 98% 97%, 100% 100%, 2% 100%, 0% 97%, 3% 94%, 0% 90%, 2% 86%, 0% 82%, 3% 78%, 0% 74%, 2% 70%, 0% 12%, 3% 8%, 0% 5%, 2% 2%)',
  'polygon(0% 2%, 3% 0%, 7% 2%, 12% 0%, 18% 3%, 24% 0%, 30% 2%, 36% 0%, 42% 3%, 48% 0%, 54% 2%, 60% 0%, 66% 3%, 72% 0%, 78% 2%, 84% 0%, 90% 3%, 96% 0%, 100% 2%, 100% 100%, 96% 98%, 90% 100%, 84% 97%, 78% 100%, 72% 98%, 66% 100%, 60% 97%, 54% 100%, 48% 98%, 42% 100%, 36% 97%, 30% 100%, 24% 98%, 18% 100%, 12% 97%, 7% 100%, 3% 98%, 0% 100%)',
];

const CSS = `
  body > header, body > footer, .fixed.inset-x-0.bottom-0 { display: none !important; }
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

  html, body {
    background: #0f0d0a !important;
    color: #e8e0d4;
    height: 100%;
    width: 100%;
  }

  .v24-scroller {
    width: 100vw;
    min-height: 100vh;
    overflow-x: hidden;
    background: #0f0d0a;
    position: relative;
  }

  .v24-scroller::-webkit-scrollbar { width: 6px; }
  .v24-scroller::-webkit-scrollbar-track { background: #0f0d0a; }
  .v24-scroller::-webkit-scrollbar-thumb { background: rgba(200,180,140,0.3); border-radius: 3px; }

  /* Cork/mood board subtle texture */
  .v24-board {
    position: relative;
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    padding-bottom: 400px;
  }

  /* Header */
  .v24-header {
    position: relative;
    z-index: 50;
    padding: 80px 40px 20px;
    text-align: center;
  }

  .v24-title {
    font-family: Georgia, 'Times New Roman', serif;
    font-style: italic;
    font-weight: 400;
    font-size: clamp(42px, 7vw, 96px);
    color: #e8e0d4;
    letter-spacing: 0.08em;
    line-height: 1.1;
    text-shadow: 2px 3px 6px rgba(0,0,0,0.4);
    transform: rotate(-1.5deg);
  }

  .v24-subtitle {
    font-family: Georgia, serif;
    font-style: italic;
    font-size: clamp(14px, 2vw, 20px);
    color: rgba(200,180,140,0.6);
    margin-top: 12px;
    letter-spacing: 0.15em;
    transform: rotate(0.5deg);
  }

  /* Pen-drawn underline under title */
  .v24-title-underline {
    display: block;
    width: 60%;
    max-width: 500px;
    height: 3px;
    margin: 16px auto 0;
    background: linear-gradient(90deg, transparent 0%, rgba(200,170,120,0.5) 15%, rgba(200,170,120,0.7) 50%, rgba(200,170,120,0.5) 85%, transparent 100%);
    border-radius: 2px;
    transform: rotate(-0.8deg);
  }

  /* Collage area */
  .v24-collage {
    position: relative;
    width: 100%;
    height: 3200px;
  }

  /* Photo card */
  .v24-photo {
    position: absolute;
    cursor: pointer;
    transition: transform 0.4s cubic-bezier(0.23,1,0.32,1), z-index 0s, box-shadow 0.4s ease;
    will-change: transform;
  }

  .v24-photo:hover {
    z-index: 50 !important;
    transform: scale(1.04) rotate(0deg) !important;
    box-shadow: 0 20px 60px rgba(0,0,0,0.6);
  }

  .v24-photo-inner {
    position: relative;
    width: 100%;
    height: 100%;
    background: #1a1714;
    padding: 8px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.3);
  }

  .v24-photo-inner img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    filter: saturate(0.9) contrast(1.05);
    transition: filter 0.3s ease;
  }

  .v24-photo:hover .v24-photo-inner img {
    filter: saturate(1) contrast(1.08);
  }

  /* Washi tape */
  .v24-washi {
    position: absolute;
    width: 80px;
    height: 24px;
    border-radius: 1px;
    z-index: 10;
    opacity: 0.85;
    background-image: repeating-linear-gradient(
      90deg,
      transparent,
      transparent 2px,
      rgba(255,255,255,0.08) 2px,
      rgba(255,255,255,0.08) 4px
    );
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  }

  .v24-washi-tl { top: -8px; left: 10px; }
  .v24-washi-tr { top: -8px; right: 10px; }

  /* Caption */
  .v24-caption {
    position: absolute;
    bottom: -32px;
    left: 12px;
    font-family: Georgia, 'Times New Roman', serif;
    font-style: italic;
    font-size: 15px;
    color: rgba(200,180,140,0.7);
    letter-spacing: 0.04em;
    white-space: nowrap;
    pointer-events: none;
    text-shadow: 0 1px 3px rgba(0,0,0,0.5);
  }

  /* Sticky note */
  .v24-sticky {
    position: absolute;
    top: -20px;
    right: -15px;
    background: rgba(245,230,150,0.9);
    color: #3a3520;
    font-family: Georgia, serif;
    font-style: italic;
    font-size: 13px;
    padding: 10px 14px;
    transform: rotate(4deg);
    box-shadow: 2px 3px 8px rgba(0,0,0,0.3);
    z-index: 15;
    line-height: 1.3;
    max-width: 140px;
  }

  .v24-sticky::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 6px;
    background: rgba(200,170,100,0.5);
  }

  /* Decorative drawn elements */
  .v24-deco {
    position: absolute;
    pointer-events: none;
    opacity: 0.35;
    will-change: transform;
  }

  .v24-deco-arrow {
    width: 60px;
    height: 30px;
    border-bottom: 2px solid #c8b47a;
    border-right: 2px solid #c8b47a;
    border-bottom-right-radius: 2px;
  }
  .v24-deco-arrow::after {
    content: '';
    position: absolute;
    right: -2px;
    bottom: -7px;
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 8px solid #c8b47a;
    transform: rotate(15deg);
  }

  .v24-deco-circle {
    width: 50px;
    height: 50px;
    border: 2px solid #c8b47a;
    border-radius: 50%;
    border-style: dashed;
  }

  .v24-deco-underline {
    width: 100px;
    height: 4px;
    background: linear-gradient(90deg, transparent, #c8b47a 20%, #c8b47a 80%, transparent);
    border-radius: 2px;
  }

  .v24-deco-star {
    width: 24px;
    height: 24px;
    position: relative;
  }
  .v24-deco-star::before,
  .v24-deco-star::after {
    content: '';
    position: absolute;
    top: 50%; left: 50%;
    width: 24px; height: 3px;
    background: #c8b47a;
    border-radius: 2px;
    transform-origin: center center;
  }
  .v24-deco-star::before { transform: translate(-50%,-50%) rotate(0deg); }
  .v24-deco-star::after { transform: translate(-50%,-50%) rotate(60deg); }

  /* Fullscreen overlay */
  .v24-fullscreen {
    position: fixed;
    inset: 0;
    z-index: 1000;
    background: rgba(10,8,5,0.95);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.4s ease;
  }

  .v24-fullscreen.active {
    opacity: 1;
    pointer-events: all;
  }

  .v24-fullscreen img {
    max-width: 90vw;
    max-height: 90vh;
    object-fit: contain;
    border-radius: 2px;
    box-shadow: 0 20px 80px rgba(0,0,0,0.6);
    transform: scale(0.9);
    transition: transform 0.4s cubic-bezier(0.23,1,0.32,1);
  }

  .v24-fullscreen.active img {
    transform: scale(1);
  }

  .v24-fullscreen-close {
    position: absolute;
    top: 30px;
    right: 40px;
    font-family: Georgia, serif;
    font-style: italic;
    font-size: 18px;
    color: rgba(200,180,140,0.7);
    letter-spacing: 0.1em;
    border: none;
    background: none;
    cursor: pointer;
    transition: color 0.3s ease;
  }
  .v24-fullscreen-close:hover { color: #e8e0d4; }

  .v24-fullscreen-caption {
    position: absolute;
    bottom: 40px;
    left: 50%;
    transform: translateX(-50%);
    font-family: Georgia, serif;
    font-style: italic;
    font-size: 20px;
    color: rgba(200,180,140,0.8);
    letter-spacing: 0.08em;
    text-align: center;
  }

  /* CTA section */
  .v24-cta {
    position: relative;
    z-index: 30;
    text-align: center;
    padding: 80px 40px 120px;
    margin-top: -200px;
  }

  .v24-cta-text {
    font-family: Georgia, serif;
    font-style: italic;
    font-size: clamp(18px, 3vw, 28px);
    color: rgba(200,180,140,0.6);
    margin-bottom: 30px;
    transform: rotate(-0.5deg);
  }

  .v24-cta-button {
    display: inline-block;
    font-family: Georgia, serif;
    font-style: italic;
    font-size: 18px;
    color: #e8e0d4;
    letter-spacing: 0.12em;
    padding: 18px 50px;
    border: 1.5px solid rgba(200,180,140,0.4);
    background: transparent;
    cursor: pointer;
    transition: all 0.4s ease;
    text-decoration: none;
    transform: rotate(0.5deg);
  }

  .v24-cta-button:hover {
    background: rgba(200,180,140,0.1);
    border-color: rgba(200,180,140,0.7);
    transform: rotate(0deg) scale(1.03);
  }

  /* Handwritten annotation scattered text */
  .v24-annotation {
    position: absolute;
    font-family: Georgia, serif;
    font-style: italic;
    font-size: 14px;
    color: rgba(200,180,140,0.3);
    pointer-events: none;
    white-space: nowrap;
    letter-spacing: 0.05em;
  }

  /* Fade in animation */
  .v24-photo {
    opacity: 0;
    transition: opacity 0.8s ease, transform 0.4s cubic-bezier(0.23,1,0.32,1), box-shadow 0.4s ease;
  }
  .v24-photo.visible { opacity: 1; }

  /* Responsive */
  @media (max-width: 768px) {
    .v24-collage { height: auto; min-height: 6000px; }
    .v24-photo {
      position: relative !important;
      display: block;
      width: 85vw !important;
      height: auto !important;
      left: 50% !important;
      top: auto !important;
      transform: translateX(-50%) rotate(var(--rot)) !important;
      margin-bottom: 30px;
    }
    .v24-photo:hover {
      transform: translateX(-50%) scale(1.02) rotate(0deg) !important;
    }
    .v24-photo-inner { height: auto; }
    .v24-photo-inner img { height: auto; aspect-ratio: 3/4; }
    .v24-deco { display: none; }
    .v24-annotation { display: none; }
    .v24-cta { margin-top: 40px; }
  }
`;

export default function V24MoodBoard() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);
  const [fullscreenIdx, setFullscreenIdx] = useState<number | null>(null);
  const [visiblePhotos, setVisiblePhotos] = useState<Set<number>>(new Set());
  const photoRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef = useRef<number>(0);

  // Parallax scroll tracking
  useEffect(() => {
    const handleScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        setScrollY(window.scrollY);
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Intersection observer for fade-in
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = Number(entry.target.getAttribute('data-idx'));
          if (entry.isIntersecting) {
            setVisiblePhotos((prev) => {
              const next = new Set(prev);
              next.add(idx);
              return next;
            });
          }
        });
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    photoRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  // Escape key to close fullscreen
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFullscreenIdx(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const openFullscreen = useCallback((idx: number) => {
    setFullscreenIdx(idx);
  }, []);

  const closeFullscreen = useCallback(() => {
    setFullscreenIdx(null);
  }, []);

  // Scattered annotations
  const annotations = [
    { text: 'such beautiful light...', top: 520, left: 72, rot: -4 },
    { text: 'remember this day', top: 980, left: 8, rot: 3 },
    { text: 'the colors!', top: 1350, left: 55, rot: -2 },
    { text: 'need to revisit', top: 1750, left: 18, rot: 5 },
    { text: 'absolute dream', top: 2150, left: 68, rot: -3 },
    { text: 'film vibes', top: 2550, left: 42, rot: 2 },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="v24-scroller" ref={scrollRef}>
        {/* Header */}
        <div className="v24-header">
          <h1 className="v24-title">AIDAN TORRENCE</h1>
          <div className="v24-title-underline" />
          <p className="v24-subtitle">portraits &middot; mood &middot; stories</p>
        </div>

        {/* Mood Board Collage */}
        <div className="v24-board">
          <div className="v24-collage">
            {/* Photos */}
            {images.map((img, i) => {
              const layout = photoLayouts[i];
              if (!layout) return null;
              const parallaxOffset = scrollY * layout.depth * 0.15;
              const tornIdx = i % tornClipPaths.length;

              return (
                <div
                  key={i}
                  ref={(el) => { photoRefs.current[i] = el; }}
                  data-idx={i}
                  className={`v24-photo ${visiblePhotos.has(i) ? 'visible' : ''}`}
                  style={{
                    top: layout.top,
                    left: `${layout.left}%`,
                    width: layout.w,
                    height: layout.h,
                    transform: `rotate(${layout.rot}deg) translateY(${-parallaxOffset}px)`,
                    zIndex: layout.zIndex,
                    ['--rot' as string]: `${layout.rot}deg`,
                  } as React.CSSProperties}
                  onClick={() => openFullscreen(i)}
                >
                  <div
                    className="v24-photo-inner"
                    style={layout.tornEdge ? { clipPath: tornClipPaths[tornIdx] } : undefined}
                  >
                    <img
                      src={`/images/large/${img.src}`}
                      alt={`${img.name} - ${img.city}`}
                      loading="lazy"
                    />
                  </div>

                  {/* Washi tape strips */}
                  {layout.washiTape && (
                    <>
                      <div
                        className="v24-washi v24-washi-tl"
                        style={{
                          background: layout.washiColor,
                          transform: `rotate(${layout.washiAngle || 0}deg)`,
                        }}
                      />
                      <div
                        className="v24-washi v24-washi-tr"
                        style={{
                          background: layout.washiColor,
                          transform: `rotate(${-(layout.washiAngle || 0)}deg)`,
                        }}
                      />
                    </>
                  )}

                  {/* Caption */}
                  {layout.caption && (
                    <div className="v24-caption">
                      {img.name}, {img.city}
                    </div>
                  )}

                  {/* Sticky note */}
                  {layout.stickyNote && (
                    <div className="v24-sticky">{layout.stickyNote}</div>
                  )}
                </div>
              );
            })}

            {/* Decorative elements */}
            {decorations.map((deco, i) => {
              const parallaxOffset = scrollY * deco.depth * 0.1;
              return (
                <div
                  key={`deco-${i}`}
                  className={`v24-deco v24-deco-${deco.type}`}
                  style={{
                    top: deco.top,
                    left: `${deco.left}%`,
                    transform: `rotate(${deco.rot}deg) translateY(${-parallaxOffset}px)`,
                  }}
                />
              );
            })}

            {/* Handwritten annotations */}
            {annotations.map((ann, i) => {
              const parallaxOffset = scrollY * 0.08;
              return (
                <div
                  key={`ann-${i}`}
                  className="v24-annotation"
                  style={{
                    top: ann.top,
                    left: `${ann.left}%`,
                    transform: `rotate(${ann.rot}deg) translateY(${-parallaxOffset}px)`,
                  }}
                >
                  {ann.text}
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <div className="v24-cta">
            <p className="v24-cta-text">let&apos;s create something beautiful together</p>
            <a href="mailto:hello@aidantorrence.com" className="v24-cta-button">
              get in touch
            </a>
          </div>
        </div>
      </div>

      {/* Fullscreen overlay */}
      <div
        className={`v24-fullscreen ${fullscreenIdx !== null ? 'active' : ''}`}
        onClick={closeFullscreen}
      >
        {fullscreenIdx !== null && (
          <>
            <button className="v24-fullscreen-close" onClick={closeFullscreen}>
              close
            </button>
            <img
              src={`/images/large/${images[fullscreenIdx].src}`}
              alt={`${images[fullscreenIdx].name} - ${images[fullscreenIdx].city}`}
            />
            <div className="v24-fullscreen-caption">
              {images[fullscreenIdx].name} &mdash; {images[fullscreenIdx].city}
            </div>
          </>
        )}
      </div>
    </>
  );
}
