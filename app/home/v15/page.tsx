'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

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

// Constellation node positions on a 2000x2000 canvas, forming artistic patterns
const constellationPositions = [
  // Upper-left constellation cluster (Cassiopeia-like W shape)
  { x: 220, y: 180 },
  { x: 350, y: 280 },
  { x: 480, y: 190 },
  { x: 610, y: 300 },
  { x: 740, y: 200 },
  // Central arc (Orion's belt + surrounding)
  { x: 850, y: 520 },
  { x: 1000, y: 480 },
  { x: 1150, y: 510 },
  { x: 1000, y: 650 },
  { x: 1000, y: 350 },
  // Lower-left cluster (Southern Cross-like)
  { x: 300, y: 750 },
  { x: 400, y: 620 },
  { x: 250, y: 550 },
  { x: 450, y: 850 },
  { x: 350, y: 950 },
  // Right side constellation (Big Dipper-like)
  { x: 1400, y: 250 },
  { x: 1550, y: 300 },
  { x: 1650, y: 200 },
  { x: 1700, y: 350 },
  { x: 1550, y: 450 },
  // Bottom spread (Scorpius tail)
  { x: 700, y: 1100 },
  { x: 850, y: 1200 },
  { x: 1050, y: 1150 },
  { x: 1250, y: 1100 },
  { x: 1400, y: 1200 },
];

// Constellation connections (index pairs) - lines connecting nearby nodes
const connections: [number, number][] = [
  // Upper-left W
  [0, 1], [1, 2], [2, 3], [3, 4],
  // Central belt + cross
  [5, 6], [6, 7], [6, 8], [6, 9],
  // Connect upper to central
  [4, 5], [3, 9],
  // Lower-left cross
  [10, 11], [11, 12], [10, 13], [13, 14],
  // Connect lower-left to central
  [12, 9], [11, 8],
  // Right dipper
  [15, 16], [16, 17], [17, 18], [18, 19], [19, 16],
  // Connect right to central
  [15, 7], [19, 7],
  // Bottom tail
  [20, 21], [21, 22], [22, 23], [23, 24],
  // Connect bottom to others
  [20, 14], [8, 20], [23, 18],
];

const CANVAS_W = 1900;
const CANVAS_H = 1400;
const NODE_RADIUS = 36;

export default function ConstellationPage() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [driftAngle, setDriftAngle] = useState(0);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    setMounted(true);
    // Center the scroll
    if (containerRef.current) {
      const el = containerRef.current;
      el.scrollLeft = (CANVAS_W - el.clientWidth) / 2;
      el.scrollTop = (CANVAS_H - el.clientHeight) / 2;
    }
  }, []);

  // Slow drift rotation
  useEffect(() => {
    let frame: number;
    const animate = () => {
      setDriftAngle(prev => prev + 0.003);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  // Mouse parallax
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const dx = (e.clientX - rect.left - cx) / cx;
    const dy = (e.clientY - rect.top - cy) / cy;
    setParallax({ x: dx * 8, y: dy * 8 });
    setMousePos({ x: e.clientX, y: e.clientY });
  }, []);

  const handleNodeClick = (index: number) => {
    setExpandedIndex(index);
  };

  const closeExpanded = () => {
    setExpandedIndex(null);
  };

  // Navigate expanded photos
  const navigateExpanded = useCallback((dir: number) => {
    setExpandedIndex(prev => {
      if (prev === null) return null;
      const next = prev + dir;
      if (next < 0) return images.length - 1;
      if (next >= images.length) return 0;
      return next;
    });
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (expandedIndex === null) return;
      if (e.key === 'Escape') closeExpanded();
      if (e.key === 'ArrowRight') navigateExpanded(1);
      if (e.key === 'ArrowLeft') navigateExpanded(-1);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [expandedIndex, navigateExpanded]);

  // Generate stars
  const stars = useRef(
    Array.from({ length: 200 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      delay: Math.random() * 5,
      duration: Math.random() * 3 + 2,
    }))
  ).current;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        body > header, body > footer, .fixed.inset-x-0.bottom-0 { display: none !important; }

        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }

        @keyframes nodeGlow {
          0%, 100% { box-shadow: 0 0 8px 2px rgba(140, 180, 255, 0.3); }
          50% { box-shadow: 0 0 16px 4px rgba(140, 180, 255, 0.6); }
        }

        @keyframes constellationPulse {
          0%, 100% { opacity: 0.25; }
          50% { opacity: 0.45; }
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px) scale(0.9); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes expandIn {
          from { opacity: 0; transform: scale(0.3); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes titleShimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        @keyframes subtleDrift {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(2px, -1px); }
          50% { transform: translate(-1px, 2px); }
          75% { transform: translate(1px, 1px); }
        }

        .constellation-canvas {
          position: relative;
          width: ${CANVAS_W}px;
          height: ${CANVAS_H}px;
          cursor: grab;
        }

        .constellation-canvas:active {
          cursor: grabbing;
        }

        .star-particle {
          position: absolute;
          border-radius: 50%;
          background: white;
          pointer-events: none;
        }

        .photo-node {
          position: absolute;
          width: ${NODE_RADIUS * 2}px;
          height: ${NODE_RADIUS * 2}px;
          border-radius: 50%;
          overflow: hidden;
          border: 2px solid rgba(140, 180, 255, 0.4);
          cursor: pointer;
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.3s, box-shadow 0.3s;
          animation: nodeGlow 4s ease-in-out infinite;
          z-index: 2;
        }

        .photo-node:hover {
          transform: scale(1.3) !important;
          border-color: rgba(200, 220, 255, 0.9);
          box-shadow: 0 0 30px 8px rgba(140, 180, 255, 0.7) !important;
          z-index: 10;
        }

        .photo-node img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: filter 0.3s;
          filter: brightness(0.7) saturate(0.8);
        }

        .photo-node:hover img {
          filter: brightness(1) saturate(1);
        }

        .node-tooltip {
          position: absolute;
          pointer-events: none;
          white-space: nowrap;
          font-family: 'Courier New', monospace;
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: rgba(180, 210, 255, 0.9);
          text-shadow: 0 0 10px rgba(140, 180, 255, 0.5);
          transform: translateX(-50%);
          animation: fadeInUp 0.3s ease-out;
          z-index: 15;
        }

        .constellation-line {
          animation: constellationPulse 6s ease-in-out infinite;
        }

        .expanded-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(6, 8, 16, 0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: expandIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
          cursor: pointer;
        }

        .expanded-overlay img {
          max-width: 90vw;
          max-height: 85vh;
          object-fit: contain;
          border-radius: 4px;
          box-shadow: 0 0 60px rgba(140, 180, 255, 0.2);
        }

        .expanded-info {
          position: absolute;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          text-align: center;
          font-family: 'Courier New', monospace;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: rgba(180, 210, 255, 0.8);
          font-size: 14px;
        }

        .expanded-close {
          position: absolute;
          top: 24px;
          right: 32px;
          color: rgba(180, 210, 255, 0.6);
          font-size: 28px;
          cursor: pointer;
          font-family: 'Courier New', monospace;
          transition: color 0.2s;
          z-index: 10;
          background: none;
          border: none;
        }

        .expanded-close:hover {
          color: rgba(220, 230, 255, 1);
        }

        .expanded-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(180, 210, 255, 0.5);
          font-size: 40px;
          cursor: pointer;
          font-family: 'Courier New', monospace;
          transition: color 0.2s;
          background: none;
          border: none;
          padding: 20px;
          z-index: 10;
        }

        .expanded-nav:hover {
          color: rgba(220, 230, 255, 1);
        }

        .constellation-title {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-family: 'Courier New', monospace;
          font-size: 48px;
          font-weight: 300;
          letter-spacing: 20px;
          text-transform: uppercase;
          background: linear-gradient(
            90deg,
            rgba(80, 120, 180, 0.15) 0%,
            rgba(160, 200, 255, 0.4) 25%,
            rgba(220, 240, 255, 0.6) 50%,
            rgba(160, 200, 255, 0.4) 75%,
            rgba(80, 120, 180, 0.15) 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: titleShimmer 8s linear infinite;
          pointer-events: none;
          z-index: 1;
          white-space: nowrap;
          text-shadow: none;
        }

        .nav-bar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 32px;
          background: linear-gradient(180deg, rgba(6, 8, 16, 0.95) 0%, rgba(6, 8, 16, 0) 100%);
          font-family: 'Courier New', monospace;
        }

        .nav-logo {
          font-size: 12px;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: rgba(180, 210, 255, 0.7);
        }

        .nav-links {
          display: flex;
          gap: 28px;
        }

        .nav-links a {
          font-size: 11px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: rgba(180, 210, 255, 0.5);
          text-decoration: none;
          transition: color 0.3s;
        }

        .nav-links a:hover {
          color: rgba(220, 240, 255, 0.9);
        }

        .scroll-container {
          width: 100vw;
          height: 100vh;
          overflow: auto;
          background: #060810;
        }

        .scroll-container::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        .scroll-container::-webkit-scrollbar-track {
          background: rgba(6, 8, 16, 0.5);
        }

        .scroll-container::-webkit-scrollbar-thumb {
          background: rgba(140, 180, 255, 0.15);
          border-radius: 3px;
        }

        .photo-counter {
          position: absolute;
          top: 24px;
          left: 50%;
          transform: translateX(-50%);
          font-family: 'Courier New', monospace;
          font-size: 12px;
          letter-spacing: 3px;
          color: rgba(180, 210, 255, 0.5);
        }
      `}} />

      {/* Fixed navigation */}
      <nav className="nav-bar">
        <div className="nav-logo">Aidan Torrence</div>
        <div className="nav-links">
          <a href="#">Portfolio</a>
          <a href="#">About</a>
          <a href="#">Contact</a>
        </div>
      </nav>

      {/* Scrollable canvas */}
      <div
        ref={containerRef}
        className="scroll-container"
        onMouseMove={handleMouseMove}
      >
        <div
          className="constellation-canvas"
          style={{
            transform: `translate(${parallax.x}px, ${parallax.y}px)`,
            transition: 'transform 0.3s ease-out',
          }}
        >
          {/* Star particles background */}
          {mounted && stars.map((star, i) => (
            <div
              key={`star-${i}`}
              className="star-particle"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                opacity: 0.3,
                animation: `twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
              }}
            />
          ))}

          {/* Constellation title */}
          <div className="constellation-title">
            Aidan Torrence
          </div>

          {/* SVG constellation lines */}
          <svg
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          >
            {connections.map(([a, b], i) => {
              const posA = constellationPositions[a];
              const posB = constellationPositions[b];
              if (!posA || !posB) return null;
              const isHighlighted = hoveredIndex === a || hoveredIndex === b;
              return (
                <line
                  key={`line-${i}`}
                  className="constellation-line"
                  x1={posA.x + NODE_RADIUS}
                  y1={posA.y + NODE_RADIUS}
                  x2={posB.x + NODE_RADIUS}
                  y2={posB.y + NODE_RADIUS}
                  stroke={isHighlighted ? 'rgba(180, 210, 255, 0.6)' : 'rgba(100, 140, 200, 0.2)'}
                  strokeWidth={isHighlighted ? 1.5 : 0.8}
                  style={{
                    transition: 'stroke 0.3s, stroke-width 0.3s',
                    animationDelay: `${i * 0.3}s`,
                  }}
                />
              );
            })}
          </svg>

          {/* Photo nodes */}
          {images.map((img, i) => {
            const pos = constellationPositions[i];
            if (!pos) return null;
            return (
              <React.Fragment key={i}>
                <div
                  className="photo-node"
                  style={{
                    left: pos.x,
                    top: pos.y,
                    animationDelay: `${i * 0.2}s`,
                  }}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => handleNodeClick(i)}
                >
                  <img
                    src={`/images/large/${img.src}`}
                    alt={`${img.name} - ${img.city}`}
                    loading="lazy"
                  />
                </div>
                {/* Tooltip */}
                {hoveredIndex === i && (
                  <div
                    className="node-tooltip"
                    style={{
                      left: pos.x + NODE_RADIUS,
                      top: pos.y - 20,
                    }}
                  >
                    {img.name} / {img.city}
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Expanded photo overlay */}
      {expandedIndex !== null && (
        <div className="expanded-overlay" onClick={closeExpanded}>
          <button className="expanded-close" onClick={closeExpanded}>
            +
          </button>
          <button
            className="expanded-nav"
            style={{ left: 16 }}
            onClick={(e) => { e.stopPropagation(); navigateExpanded(-1); }}
          >
            &lsaquo;
          </button>
          <img
            src={`/images/large/${images[expandedIndex].src}`}
            alt={`${images[expandedIndex].name} - ${images[expandedIndex].city}`}
            onClick={(e) => e.stopPropagation()}
            style={{ cursor: 'default' }}
          />
          <button
            className="expanded-nav"
            style={{ right: 16 }}
            onClick={(e) => { e.stopPropagation(); navigateExpanded(1); }}
          >
            &rsaquo;
          </button>
          <div className="expanded-info">
            <div style={{ fontSize: '16px', marginBottom: '4px' }}>
              {images[expandedIndex].name}
            </div>
            <div style={{ fontSize: '11px', opacity: 0.6 }}>
              {images[expandedIndex].city}
            </div>
          </div>
          <div className="photo-counter">
            {expandedIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}
