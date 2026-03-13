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

/* Layout: photos scattered across a large canvas */
const CANVAS_WIDTH = 3200;
const CANVAS_HEIGHT = 4000;
const PHOTO_W = 320;
const PHOTO_H = 420;
const SPOTLIGHT_RADIUS = 200;

/* Deterministic pseudo-random scatter positions using a seed */
function seededPositions() {
  const positions: { x: number; y: number; rot: number }[] = [];
  const cols = 5;
  const rows = Math.ceil(images.length / cols);
  const cellW = (CANVAS_WIDTH - PHOTO_W) / cols;
  const cellH = (CANVAS_HEIGHT - PHOTO_H - 200) / rows;

  for (let i = 0; i < images.length; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    /* Simple hash-based offset */
    const hash = ((i * 2654435761) >>> 0) / 4294967296;
    const hash2 = (((i + 7) * 2246822519) >>> 0) / 4294967296;
    const ox = hash * cellW * 0.6;
    const oy = hash2 * cellH * 0.5;
    positions.push({
      x: col * cellW + ox + 40,
      y: 180 + row * cellH + oy,
      rot: (hash - 0.5) * 16,
    });
  }
  return positions;
}

const photoPositions = seededPositions();

export default function SpotlightExplorer() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState({ x: -999, y: -999 });
  const [discovered, setDiscovered] = useState<Set<number>>(() => new Set());
  const [expanded, setExpanded] = useState<number | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [formSent, setFormSent] = useState(false);
  const discoveredRef = useRef<Set<number>>(new Set());
  const mouseCanvasRef = useRef({ x: -999, y: -999 });
  const rafRef = useRef<number>(0);
  const minimapDiscovered = useRef<Set<string>>(new Set());

  /* Track mouse position relative to canvas */
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMouse({ x: e.clientX, y: e.clientY });
    mouseCanvasRef.current = { x, y };

    /* Check which photos are under the spotlight */
    const newDiscovered = new Set(discoveredRef.current);
    let changed = false;
    photoPositions.forEach((pos, i) => {
      const cx = pos.x + PHOTO_W / 2;
      const cy = pos.y + PHOTO_H / 2;
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      if (dist < SPOTLIGHT_RADIUS + 160) {
        if (!newDiscovered.has(i)) {
          newDiscovered.add(i);
          changed = true;
        }
      }
    });

    /* Track minimap cells */
    const cellX = Math.floor(x / (CANVAS_WIDTH / 16));
    const cellY = Math.floor(y / (CANVAS_HEIGHT / 20));
    minimapDiscovered.current.add(`${cellX}-${cellY}`);

    if (changed) {
      discoveredRef.current = newDiscovered;
      setDiscovered(new Set(newDiscovered));
    }
  }, []);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const handleScroll = () => {
      setScrollY(el.scrollTop);
    };
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  /* ESC key to close expanded photo */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpanded(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  /* Track window height for minimap viewport */
  const [winH, setWinH] = useState(800);
  useEffect(() => {
    setWinH(window.innerHeight);
    const handleResize = () => setWinH(window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /* Force re-render for minimap periodically */
  const [, setTick] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setTick((t) => t + 1), 500);
    return () => clearInterval(iv);
  }, []);

  const handlePhotoClick = useCallback((i: number) => {
    if (discovered.has(i)) {
      setExpanded(i);
    }
  }, [discovered]);

  const pctDiscovered = Math.round((discovered.size / images.length) * 100);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        body > header, body > footer, .fixed.inset-x-0.bottom-0 { display: none !important; }
        html, body { background: #050505 !important; overflow: hidden !important; }

        .sp-canvas {
          width: 100vw;
          height: 100vh;
          overflow-y: auto;
          overflow-x: hidden;
          position: relative;
          background: #050505;
          cursor: none;
        }

        .sp-canvas::-webkit-scrollbar { width: 4px; }
        .sp-canvas::-webkit-scrollbar-track { background: #111; }
        .sp-canvas::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }

        .sp-inner {
          width: ${CANVAS_WIDTH}px;
          height: ${CANVAS_HEIGHT}px;
          position: relative;
          margin: 0 auto;
        }

        .sp-dark-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: #050505;
          pointer-events: none;
          z-index: 50;
          transition: mask-size 0.1s ease;
        }

        .sp-photo-card {
          position: absolute;
          width: ${PHOTO_W}px;
          height: ${PHOTO_H}px;
          border-radius: 6px;
          overflow: hidden;
          cursor: none;
          transition: opacity 0.6s ease, transform 0.3s ease;
          will-change: transform, opacity;
        }

        .sp-photo-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .sp-photo-card .sp-photo-label {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          padding: 12px;
          background: linear-gradient(transparent, rgba(0,0,0,0.8));
          color: #fff;
          font-family: 'Helvetica Neue', sans-serif;
        }

        .sp-photo-card .sp-photo-label h3 {
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.05em;
          margin: 0;
        }

        .sp-photo-card .sp-photo-label span {
          font-size: 11px;
          opacity: 0.6;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .sp-dot-marker {
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(255,255,255,0.08);
          transform: translate(-3px, -3px);
          pointer-events: none;
          z-index: 5;
        }

        .sp-dot-marker.discovered {
          background: rgba(255,255,255,0.2);
          box-shadow: 0 0 8px rgba(255,255,255,0.1);
        }

        .sp-title {
          position: absolute;
          top: 50px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
          text-align: center;
          pointer-events: none;
        }

        .sp-title h1 {
          font-family: 'Helvetica Neue', sans-serif;
          font-size: 48px;
          font-weight: 200;
          letter-spacing: 0.35em;
          color: #fff;
          margin: 0;
          text-transform: uppercase;
        }

        .sp-title p {
          font-family: 'Helvetica Neue', sans-serif;
          font-size: 13px;
          letter-spacing: 0.3em;
          color: rgba(255,255,255,0.4);
          margin: 12px 0 0;
          text-transform: uppercase;
        }

        .sp-minimap {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 120px;
          height: 150px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 6px;
          z-index: 100;
          overflow: hidden;
          pointer-events: none;
        }

        .sp-minimap-cell {
          position: absolute;
          border-radius: 1px;
        }

        .sp-minimap-viewport {
          position: absolute;
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 2px;
          pointer-events: none;
        }

        .sp-minimap-label {
          position: absolute;
          bottom: 4px;
          left: 0;
          right: 0;
          text-align: center;
          font-size: 9px;
          font-family: monospace;
          color: rgba(255,255,255,0.3);
          letter-spacing: 0.1em;
        }

        .sp-counter {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 100;
          font-family: monospace;
          font-size: 12px;
          color: rgba(255,255,255,0.3);
          letter-spacing: 0.1em;
          pointer-events: none;
        }

        .sp-cursor {
          position: fixed;
          width: 12px;
          height: 12px;
          border: 1px solid rgba(255,255,255,0.5);
          border-radius: 50%;
          pointer-events: none;
          z-index: 200;
          transform: translate(-50%, -50%);
          transition: width 0.2s, height 0.2s;
        }

        .sp-spotlight-ring {
          position: fixed;
          width: ${SPOTLIGHT_RADIUS * 2}px;
          height: ${SPOTLIGHT_RADIUS * 2}px;
          border: 1px solid rgba(255,255,255,0.04);
          border-radius: 50%;
          pointer-events: none;
          z-index: 200;
          transform: translate(-50%, -50%);
        }

        .sp-expanded-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.95);
          z-index: 300;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          animation: sp-fade-in 0.3s ease;
        }

        .sp-expanded-overlay img {
          max-width: 90vw;
          max-height: 85vh;
          object-fit: contain;
          border-radius: 8px;
          animation: sp-scale-in 0.4s ease;
        }

        .sp-expanded-info {
          position: absolute;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          text-align: center;
          color: #fff;
          font-family: 'Helvetica Neue', sans-serif;
        }

        .sp-expanded-info h2 {
          font-size: 20px;
          font-weight: 300;
          letter-spacing: 0.2em;
          margin: 0;
          text-transform: uppercase;
        }

        .sp-expanded-info span {
          font-size: 12px;
          opacity: 0.4;
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }

        .sp-expanded-close {
          position: absolute;
          top: 30px;
          right: 30px;
          color: rgba(255,255,255,0.5);
          font-size: 14px;
          font-family: 'Helvetica Neue', sans-serif;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }

        .sp-cta-section {
          position: absolute;
          bottom: 80px;
          left: 50%;
          transform: translateX(-50%);
          width: 480px;
          z-index: 10;
          text-align: center;
        }

        .sp-cta-section h2 {
          font-family: 'Helvetica Neue', sans-serif;
          font-size: 28px;
          font-weight: 200;
          letter-spacing: 0.2em;
          color: #fff;
          margin: 0 0 8px;
          text-transform: uppercase;
        }

        .sp-cta-section p {
          font-family: 'Helvetica Neue', sans-serif;
          font-size: 13px;
          color: rgba(255,255,255,0.35);
          letter-spacing: 0.1em;
          margin: 0 0 32px;
        }

        .sp-cta-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .sp-cta-form input,
        .sp-cta-form textarea {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 4px;
          padding: 14px 16px;
          color: #fff;
          font-family: 'Helvetica Neue', sans-serif;
          font-size: 14px;
          letter-spacing: 0.05em;
          outline: none;
          transition: border-color 0.3s;
        }

        .sp-cta-form input:focus,
        .sp-cta-form textarea:focus {
          border-color: rgba(255,255,255,0.3);
        }

        .sp-cta-form input::placeholder,
        .sp-cta-form textarea::placeholder {
          color: rgba(255,255,255,0.2);
        }

        .sp-cta-form textarea {
          resize: none;
          height: 100px;
        }

        .sp-cta-form button {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          color: #fff;
          padding: 14px;
          border-radius: 4px;
          font-family: 'Helvetica Neue', sans-serif;
          font-size: 13px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.3s, border-color 0.3s;
        }

        .sp-cta-form button:hover {
          background: rgba(255,255,255,0.15);
          border-color: rgba(255,255,255,0.3);
        }

        .sp-hint {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 100;
          font-family: 'Helvetica Neue', sans-serif;
          font-size: 11px;
          letter-spacing: 0.2em;
          color: rgba(255,255,255,0.15);
          text-transform: uppercase;
          pointer-events: none;
          animation: sp-pulse 3s ease infinite;
        }

        @keyframes sp-fade-in {
          from { opacity: 0; } to { opacity: 1; }
        }

        @keyframes sp-scale-in {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        @keyframes sp-pulse {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.35; }
        }

        .sp-grid-lines {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
        }
      `}} />

      {/* Main canvas */}
      <div
        ref={canvasRef}
        className="sp-canvas"
        onMouseMove={handleMouseMove}
      >
        <div className="sp-inner">
          {/* Faint grid lines */}
          <svg className="sp-grid-lines" width={CANVAS_WIDTH} height={CANVAS_HEIGHT}>
            {Array.from({ length: 17 }, (_, i) => (
              <line
                key={`vl-${i}`}
                x1={i * (CANVAS_WIDTH / 16)}
                y1={0}
                x2={i * (CANVAS_WIDTH / 16)}
                y2={CANVAS_HEIGHT}
                stroke="rgba(255,255,255,0.015)"
                strokeWidth={1}
              />
            ))}
            {Array.from({ length: 21 }, (_, i) => (
              <line
                key={`hl-${i}`}
                x1={0}
                y1={i * (CANVAS_HEIGHT / 20)}
                x2={CANVAS_WIDTH}
                y2={i * (CANVAS_HEIGHT / 20)}
                stroke="rgba(255,255,255,0.015)"
                strokeWidth={1}
              />
            ))}
          </svg>

          {/* Title */}
          <div className="sp-title">
            <h1>AIDAN TORRENCE</h1>
            <p>Photographer</p>
          </div>

          {/* Dot markers (treasure map hints) */}
          {photoPositions.map((pos, i) => (
            <div
              key={`dot-${i}`}
              className={`sp-dot-marker${discovered.has(i) ? ' discovered' : ''}`}
              style={{
                left: pos.x + PHOTO_W / 2,
                top: pos.y + PHOTO_H / 2,
              }}
            />
          ))}

          {/* Photo cards */}
          {images.map((img, i) => {
            const pos = photoPositions[i];
            const isDiscovered = discovered.has(i);
            return (
              <div
                key={i}
                className="sp-photo-card"
                style={{
                  left: pos.x,
                  top: pos.y,
                  transform: `rotate(${pos.rot}deg)`,
                  opacity: isDiscovered ? 1 : 0.03,
                  zIndex: isDiscovered ? 10 : 2,
                }}
                onClick={() => handlePhotoClick(i)}
              >
                <img
                  src={`/images/large/${img.src}`}
                  alt={img.name}
                  loading="lazy"
                  draggable={false}
                />
                <div className="sp-photo-label" style={{ opacity: isDiscovered ? 1 : 0 }}>
                  <h3>{img.name}</h3>
                  <span>{img.city}</span>
                </div>
              </div>
            );
          })}

          {/* CTA Form */}
          <div className="sp-cta-section">
            <h2>Let&apos;s Create</h2>
            <p>You&apos;ve explored the darkness. Now step into the light.</p>
            {formSent ? (
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, letterSpacing: '0.1em' }}>
                Message received. I&apos;ll be in touch.
              </p>
            ) : (
              <form
                className="sp-cta-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  setFormSent(true);
                }}
              >
                <input
                  type="text"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  required
                />
                <input
                  type="email"
                  placeholder="Your email"
                  value={formData.email}
                  onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                  required
                />
                <textarea
                  placeholder="Tell me about your vision..."
                  value={formData.message}
                  onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
                  required
                />
                <button type="submit">Send Message</button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Dark overlay with spotlight hole */}
      <div
        className="sp-dark-overlay"
        style={{
          WebkitMaskImage: `radial-gradient(circle ${SPOTLIGHT_RADIUS}px at ${mouse.x}px ${mouse.y}px, transparent 0%, transparent 60%, black 100%)`,
          maskImage: `radial-gradient(circle ${SPOTLIGHT_RADIUS}px at ${mouse.x}px ${mouse.y}px, transparent 0%, transparent 60%, black 100%)`,
        }}
      />

      {/* Custom cursor */}
      <div
        className="sp-cursor"
        style={{ left: mouse.x, top: mouse.y }}
      />
      <div
        className="sp-spotlight-ring"
        style={{ left: mouse.x, top: mouse.y }}
      />

      {/* Discovery counter */}
      <div className="sp-counter">
        {discovered.size} / {images.length} discovered
      </div>

      {/* Minimap */}
      <div className="sp-minimap">
        {/* Photo dots on minimap */}
        {photoPositions.map((pos, i) => (
          <div
            key={`mm-${i}`}
            className="sp-minimap-cell"
            style={{
              left: (pos.x / CANVAS_WIDTH) * 120 + (PHOTO_W / CANVAS_WIDTH) * 60,
              top: (pos.y / CANVAS_HEIGHT) * 150 + (PHOTO_H / CANVAS_HEIGHT) * 75,
              width: 3,
              height: 3,
              background: discovered.has(i)
                ? 'rgba(255,255,255,0.6)'
                : 'rgba(255,255,255,0.1)',
              borderRadius: '50%',
            }}
          />
        ))}
        {/* Explored area cells */}
        {Array.from(minimapDiscovered.current).map((key) => {
          const [cx, cy] = key.split('-').map(Number);
          return (
            <div
              key={`mc-${key}`}
              className="sp-minimap-cell"
              style={{
                left: cx * (120 / 16),
                top: cy * (150 / 20),
                width: 120 / 16,
                height: 150 / 20,
                background: 'rgba(255,255,255,0.04)',
              }}
            />
          );
        })}
        {/* Viewport indicator */}
        <div
          className="sp-minimap-viewport"
          style={{
            left: 0,
            top: (scrollY / CANVAS_HEIGHT) * 150,
            width: 120,
            height: (winH / CANVAS_HEIGHT) * 150,
          }}
        />
        <div className="sp-minimap-label">{pctDiscovered}% mapped</div>
      </div>

      {/* Hint text */}
      {discovered.size < 5 && (
        <div className="sp-hint">Move your mouse to explore</div>
      )}

      {/* Expanded photo overlay */}
      {expanded !== null && (
        <div
          className="sp-expanded-overlay"
          onClick={() => setExpanded(null)}
        >
          <div className="sp-expanded-close">ESC / Click to close</div>
          <img
            src={`/images/large/${images[expanded].src}`}
            alt={images[expanded].name}
          />
          <div className="sp-expanded-info">
            <h2>{images[expanded].name}</h2>
            <span>{images[expanded].city}</span>
          </div>
        </div>
      )}
    </>
  );
}
