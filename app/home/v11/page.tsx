'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';

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

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface PolaroidPos {
  x: number;
  y: number;
  rotation: number;
  zIndex: number;
  image: typeof images[0];
}

const VISIBLE_COUNT = 13;

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600&display=swap');

  body > header, body > footer, .fixed.inset-x-0.bottom-0 { display: none !important; }

  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

  html, body {
    background: #0c0c0c !important;
    color: #fff;
    height: 100%;
    width: 100%;
    overflow-x: hidden;
  }

  .ps-nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px 36px;
    pointer-events: none;
  }

  .ps-nav a, .ps-nav span {
    pointer-events: auto;
  }

  .ps-nav-inquire {
    font-family: 'Caveat', cursive;
    font-size: 18px;
    color: #fff;
    text-decoration: none;
    letter-spacing: 0.5px;
    opacity: 0.85;
    transition: opacity 0.3s;
    cursor: pointer;
  }

  .ps-nav-inquire:hover {
    opacity: 1;
  }

  .ps-nav-title {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 13px;
    color: rgba(255,255,255,0.6);
    letter-spacing: 2.5px;
    text-transform: uppercase;
    font-weight: 300;
  }

  .ps-table {
    position: relative;
    width: 100%;
    min-height: 100vh;
    padding: 100px 40px 60px;
    background: #0c0c0c;
    background-image:
      radial-gradient(ellipse at 20% 50%, rgba(30,25,20,0.4) 0%, transparent 60%),
      radial-gradient(ellipse at 80% 30%, rgba(25,20,30,0.3) 0%, transparent 50%);
    overflow: hidden;
  }

  /* Subtle wood-grain texture */
  .ps-table::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      repeating-linear-gradient(
        2deg,
        transparent,
        transparent 3px,
        rgba(255,255,255,0.006) 3px,
        rgba(255,255,255,0.006) 4px
      );
    pointer-events: none;
  }

  .ps-polaroid-wrapper {
    position: absolute;
    cursor: grab;
    transition: transform 0.35s cubic-bezier(0.23, 1, 0.32, 1),
                box-shadow 0.35s cubic-bezier(0.23, 1, 0.32, 1),
                opacity 0.6s ease;
    opacity: 0;
  }

  .ps-polaroid-wrapper.visible {
    opacity: 1;
  }

  .ps-polaroid-wrapper.dragging {
    cursor: grabbing;
    transition: box-shadow 0.2s ease;
  }

  .ps-polaroid {
    background: #f5f2ed;
    padding: 12px 12px 44px 12px;
    box-shadow:
      0 2px 8px rgba(0,0,0,0.3),
      0 1px 3px rgba(0,0,0,0.2),
      inset 0 0 0 1px rgba(0,0,0,0.04);
    position: relative;
    transition: inherit;
  }

  /* Paper texture */
  .ps-polaroid::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      repeating-linear-gradient(
        0deg,
        transparent,
        transparent 2px,
        rgba(0,0,0,0.01) 2px,
        rgba(0,0,0,0.01) 4px
      );
    pointer-events: none;
    border-radius: 1px;
  }

  /* Slight yellowing on edges */
  .ps-polaroid::after {
    content: '';
    position: absolute;
    inset: 0;
    box-shadow: inset 0 0 30px rgba(180,160,120,0.08);
    pointer-events: none;
  }

  .ps-polaroid-wrapper:hover {
    transform: translateY(-8px) scale(1.03);
    box-shadow: 0 20px 40px rgba(0,0,0,0.5), 0 8px 16px rgba(0,0,0,0.3);
    z-index: 900 !important;
  }

  .ps-polaroid-wrapper:hover .ps-polaroid {
    box-shadow:
      0 4px 20px rgba(0,0,0,0.4),
      inset 0 0 0 1px rgba(0,0,0,0.04);
  }

  .ps-polaroid img {
    display: block;
    width: 220px;
    height: 280px;
    object-fit: cover;
    filter: saturate(0.9) contrast(1.05);
  }

  .ps-polaroid-caption {
    position: absolute;
    bottom: 10px;
    left: 12px;
    right: 12px;
    text-align: center;
    font-family: 'Caveat', cursive;
    font-size: 17px;
    color: #3a3530;
    letter-spacing: 0.3px;
    line-height: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Tape strips on some polaroids */
  .ps-tape {
    position: absolute;
    width: 60px;
    height: 22px;
    background: rgba(255,255,230,0.35);
    backdrop-filter: blur(1px);
    z-index: 2;
    pointer-events: none;
  }

  .ps-tape-top {
    top: -8px;
    left: 50%;
    transform: translateX(-50%) rotate(-2deg);
  }

  .ps-tape-corner {
    top: -5px;
    right: -10px;
    transform: rotate(35deg);
    width: 50px;
    height: 18px;
  }

  /* Lightbox */
  .ps-lightbox {
    position: fixed;
    inset: 0;
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0,0,0,0);
    opacity: 0;
    pointer-events: none;
    transition: background 0.4s ease, opacity 0.4s ease;
  }

  .ps-lightbox.open {
    background: rgba(0,0,0,0.92);
    opacity: 1;
    pointer-events: auto;
    cursor: pointer;
  }

  .ps-lightbox-inner {
    position: relative;
    transform: scale(0.8) rotate(-3deg);
    transition: transform 0.5s cubic-bezier(0.23, 1, 0.32, 1);
  }

  .ps-lightbox.open .ps-lightbox-inner {
    transform: scale(1) rotate(0deg);
  }

  .ps-lightbox-polaroid {
    background: #f5f2ed;
    padding: 20px 20px 70px 20px;
    box-shadow: 0 30px 80px rgba(0,0,0,0.6);
    max-width: 90vw;
    max-height: 90vh;
  }

  .ps-lightbox-polaroid img {
    display: block;
    max-width: min(600px, 80vw);
    max-height: min(70vh, 600px);
    width: auto;
    height: auto;
    object-fit: contain;
    filter: saturate(0.9) contrast(1.05);
  }

  .ps-lightbox-caption {
    position: absolute;
    bottom: 18px;
    left: 20px;
    right: 20px;
    text-align: center;
    font-family: 'Caveat', cursive;
    font-size: 26px;
    color: #3a3530;
    letter-spacing: 0.5px;
  }

  .ps-lightbox-close {
    position: fixed;
    top: 28px;
    right: 32px;
    font-size: 28px;
    color: rgba(255,255,255,0.6);
    cursor: pointer;
    z-index: 2001;
    transition: color 0.2s;
    font-family: -apple-system, sans-serif;
    font-weight: 200;
    line-height: 1;
    background: none;
    border: none;
  }

  .ps-lightbox-close:hover {
    color: #fff;
  }

  /* Entry animation */
  @keyframes polaroidDrop {
    0% {
      opacity: 0;
      transform: translateY(-40px) scale(0.9);
    }
    60% {
      opacity: 1;
      transform: translateY(4px) scale(1.01);
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .ps-polaroid-wrapper.animate-in {
    animation: polaroidDrop 0.6s cubic-bezier(0.23, 1, 0.32, 1) forwards;
  }

  /* Subtle shadow under table for depth */
  .ps-table-vignette {
    position: fixed;
    inset: 0;
    pointer-events: none;
    background: radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%);
    z-index: 1;
  }

  @media (max-width: 768px) {
    .ps-polaroid img {
      width: 160px;
      height: 210px;
    }

    .ps-polaroid {
      padding: 8px 8px 36px 8px;
    }

    .ps-polaroid-caption {
      font-size: 14px;
      bottom: 9px;
    }

    .ps-nav {
      padding: 18px 20px;
    }

    .ps-nav-title {
      font-size: 10px;
      letter-spacing: 1.5px;
    }

    .ps-table {
      padding: 90px 16px 40px;
    }

    .ps-lightbox-polaroid {
      padding: 14px 14px 54px 14px;
    }

    .ps-lightbox-caption {
      font-size: 20px;
      bottom: 14px;
    }
  }
`;

export default function PolaroidScatterPage() {
  const [polaroids, setPolaroids] = useState<PolaroidPos[]>([]);
  const [lightbox, setLightbox] = useState<typeof images[0] | null>(null);
  const [ready, setReady] = useState(false);
  const dragRef = useRef<{
    index: number;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    moved: boolean;
  } | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  // Pick 13 random images on mount using a time-based seed
  const selectedImages = useMemo(() => {
    const seed = Math.floor(Date.now() / 1000);
    const rng = seededRandom(seed);
    return shuffle(images, rng).slice(0, VISIBLE_COUNT);
  }, []);

  // Generate scattered positions
  useEffect(() => {
    const generateLayout = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const isMobile = vw < 768;
      const polaroidW = isMobile ? 176 : 244;
      const polaroidH = isMobile ? 254 : 336;

      const padTop = isMobile ? 100 : 120;
      const padSide = isMobile ? 10 : 50;
      const padBottom = 40;

      const cols = isMobile ? 2 : Math.min(5, Math.floor((vw - padSide * 2) / (polaroidW * 0.7)));
      const rows = Math.ceil(VISIBLE_COUNT / cols);

      const tableHeight = Math.max(vh, padTop + rows * (polaroidH * 0.75) + padBottom);

      const cellW = (vw - padSide * 2) / cols;
      const cellH = (tableHeight - padTop - padBottom) / rows;

      const rng = seededRandom(Date.now());
      const positions: PolaroidPos[] = selectedImages.map((img, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);

        const baseX = padSide + col * cellW + (cellW - polaroidW) / 2;
        const baseY = padTop + row * cellH + (cellH - polaroidH) / 2;

        const jitterX = (rng() - 0.5) * cellW * 0.35;
        const jitterY = (rng() - 0.5) * cellH * 0.25;
        const rotation = (rng() - 0.5) * 18;

        return {
          x: Math.max(padSide, Math.min(vw - polaroidW - padSide, baseX + jitterX)),
          y: Math.max(padTop, baseY + jitterY),
          rotation,
          zIndex: Math.floor(rng() * 100) + 10,
          image: img,
        };
      });

      setPolaroids(positions);

      if (tableRef.current) {
        const maxBottom = Math.max(...positions.map(p => p.y + polaroidH + 40));
        tableRef.current.style.minHeight = `${Math.max(vh, maxBottom)}px`;
      }

      setTimeout(() => setReady(true), 50);
    };

    generateLayout();

    const handleResize = () => {
      setReady(false);
      generateLayout();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [selectedImages]);

  // Drag handlers
  const onPointerDown = useCallback((e: React.PointerEvent, index: number) => {
    e.preventDefault();
    dragRef.current = {
      index,
      startX: e.clientX,
      startY: e.clientY,
      origX: polaroids[index].x,
      origY: polaroids[index].y,
      moved: false,
    };

    // Bring to front
    setPolaroids(prev => prev.map((p, i) =>
      i === index ? { ...p, zIndex: 999 } : p
    ));
  }, [polaroids]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const { index, startX, startY, origX, origY } = dragRef.current;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      dragRef.current.moved = true;
    }

    setPolaroids(prev => prev.map((p, i) =>
      i === index ? { ...p, x: origX + dx, y: origY + dy } : p
    ));
  }, []);

  const onPointerUp = useCallback(() => {
    if (dragRef.current && !dragRef.current.moved) {
      const idx = dragRef.current.index;
      setLightbox(polaroids[idx].image);
    }
    dragRef.current = null;
  }, [polaroids]);

  const closeLightbox = useCallback(() => {
    setLightbox(null);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeLightbox]);

  const tapeVariant = (i: number) => {
    if (i % 4 === 0) return 'top';
    if (i % 4 === 2) return 'corner';
    return null;
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* Nav */}
      <nav className="ps-nav">
        <a href="/inquiry" className="ps-nav-inquire">Inquire</a>
        <span className="ps-nav-title">Aidan Torrence / Film Photographer</span>
      </nav>

      {/* Vignette overlay */}
      <div className="ps-table-vignette" />

      {/* Table surface */}
      <div
        className="ps-table"
        ref={tableRef}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {polaroids.map((p, i) => {
          const tape = tapeVariant(i);
          return (
            <div
              key={p.image.src}
              className={`ps-polaroid-wrapper ${ready ? 'visible animate-in' : ''} ${
                dragRef.current?.index === i ? 'dragging' : ''
              }`}
              style={{
                left: p.x,
                top: p.y,
                zIndex: p.zIndex,
                transform: `rotate(${p.rotation}deg)`,
                animationDelay: `${i * 0.08}s`,
              }}
              onPointerDown={(e) => onPointerDown(e, i)}
            >
              <div className="ps-polaroid">
                {tape === 'top' && <div className="ps-tape ps-tape-top" />}
                {tape === 'corner' && <div className="ps-tape ps-tape-corner" />}
                <img
                  src={`/images/large/${p.image.src}`}
                  alt={`${p.image.name} - ${p.image.city}`}
                  draggable={false}
                />
                <div className="ps-polaroid-caption">
                  {p.image.name}, {p.image.city}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox */}
      <div
        className={`ps-lightbox ${lightbox ? 'open' : ''}`}
        onClick={closeLightbox}
      >
        {lightbox && (
          <>
            <button className="ps-lightbox-close" onClick={closeLightbox}>
              &#215;
            </button>
            <div className="ps-lightbox-inner" onClick={(e) => e.stopPropagation()}>
              <div className="ps-lightbox-polaroid">
                <img
                  src={`/images/large/${lightbox.src}`}
                  alt={`${lightbox.name} - ${lightbox.city}`}
                />
                <div className="ps-lightbox-caption">
                  {lightbox.name}, {lightbox.city}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
