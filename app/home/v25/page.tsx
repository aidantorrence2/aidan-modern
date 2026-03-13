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

const NODE_SPACING = 520;
const HEADER_HEIGHT = 400;
const FOOTER_HEIGHT = 500;

export default function JourneyTimeline() {
  const [visibleNodes, setVisibleNodes] = useState<Set<number>>(new Set());
  const [scrollProgress, setScrollProgress] = useState(0);
  const [expandedImage, setExpandedImage] = useState<number | null>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalHeight = HEADER_HEIGHT + images.length * NODE_SPACING + FOOTER_HEIGHT;

  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    setScrollProgress(maxScroll > 0 ? scrollY / maxScroll : 0);

    const newVisible = new Set<number>();
    nodeRefs.current.forEach((ref, i) => {
      if (!ref) return;
      const rect = ref.getBoundingClientRect();
      const threshold = window.innerHeight * 0.75;
      if (rect.top < threshold && rect.bottom > 0) {
        newVisible.add(i);
      }
    });
    setVisibleNodes(newVisible);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (expandedImage !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [expandedImage]);

  const glowDotTop = HEADER_HEIGHT + scrollProgress * (images.length * NODE_SPACING);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        body > header, body > footer, .fixed.inset-x-0.bottom-0 { display: none !important; }
        html { scroll-behavior: smooth; }
        body { background: #0c0c0c; margin: 0; }

        .jt-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 40px;
          background: linear-gradient(to bottom, rgba(12,12,12,0.95), rgba(12,12,12,0));
          pointer-events: none;
        }
        .jt-nav > * { pointer-events: auto; }
        .jt-nav-logo {
          font-family: 'Helvetica Neue', sans-serif;
          font-size: 14px;
          font-weight: 300;
          letter-spacing: 4px;
          color: #fff;
          text-transform: uppercase;
        }
        .jt-nav-link {
          font-family: 'Helvetica Neue', sans-serif;
          font-size: 13px;
          letter-spacing: 2px;
          color: rgba(255,255,255,0.6);
          text-decoration: none;
          text-transform: uppercase;
          transition: color 0.3s;
          cursor: pointer;
        }
        .jt-nav-link:hover { color: #fff; }

        .jt-container {
          position: relative;
          width: 100%;
          min-height: 100vh;
          overflow-x: hidden;
        }

        /* Timeline center line */
        .jt-timeline-line {
          position: absolute;
          left: 50%;
          top: ${HEADER_HEIGHT}px;
          width: 2px;
          height: ${images.length * NODE_SPACING}px;
          transform: translateX(-50%);
          background: rgba(255,255,255,0.08);
          z-index: 1;
        }
        .jt-timeline-line-progress {
          position: absolute;
          left: 50%;
          top: ${HEADER_HEIGHT}px;
          width: 2px;
          height: ${images.length * NODE_SPACING}px;
          transform: translateX(-50%);
          background: linear-gradient(to bottom, rgba(200,170,130,0.6), rgba(200,170,130,0.1));
          z-index: 2;
          clip-path: inset(0 0 ${100 - scrollProgress * 100}% 0);
          transition: clip-path 0.1s linear;
        }

        /* Glowing dot */
        .jt-glow-dot {
          position: absolute;
          left: 50%;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #c8aa82;
          transform: translate(-50%, -50%);
          z-index: 10;
          box-shadow: 0 0 20px rgba(200,170,130,0.8), 0 0 40px rgba(200,170,130,0.4), 0 0 60px rgba(200,170,130,0.2);
          transition: top 0.1s linear;
        }

        /* Header */
        .jt-header {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: ${HEADER_HEIGHT}px;
          z-index: 5;
        }
        .jt-header h1 {
          font-family: 'Helvetica Neue', sans-serif;
          font-size: 42px;
          font-weight: 200;
          letter-spacing: 12px;
          color: #fff;
          text-transform: uppercase;
          margin: 0 0 12px 0;
          text-align: center;
        }
        .jt-header p {
          font-family: 'Helvetica Neue', sans-serif;
          font-size: 14px;
          font-weight: 300;
          letter-spacing: 6px;
          color: rgba(200,170,130,0.8);
          text-transform: uppercase;
          margin: 0;
        }
        .jt-header-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(200,170,130,0.6);
          margin-top: 30px;
          animation: jt-pulse-soft 3s ease-in-out infinite;
        }

        /* Timeline node row */
        .jt-node-row {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
          height: ${NODE_SPACING}px;
          z-index: 5;
        }

        /* Left side photo */
        .jt-photo-left {
          position: absolute;
          right: calc(50% + 60px);
          width: 380px;
          opacity: 0;
          transform: translateX(-80px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }
        .jt-photo-left.visible {
          opacity: 1;
          transform: translateX(0);
        }

        /* Right side photo */
        .jt-photo-right {
          position: absolute;
          left: calc(50% + 60px);
          width: 380px;
          opacity: 0;
          transform: translateX(80px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }
        .jt-photo-right.visible {
          opacity: 1;
          transform: translateX(0);
        }

        /* Photo image wrapper */
        .jt-photo-img-wrap {
          position: relative;
          overflow: hidden;
          border-radius: 4px;
          cursor: pointer;
          aspect-ratio: 3/4;
        }
        .jt-photo-img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s ease;
        }
        .jt-photo-img-wrap:hover img {
          transform: scale(1.05);
        }

        /* Photo caption */
        .jt-photo-caption {
          margin-top: 12px;
          font-family: 'Helvetica Neue', sans-serif;
          font-size: 13px;
          font-weight: 300;
          letter-spacing: 2px;
          color: rgba(255,255,255,0.5);
        }
        .jt-photo-left .jt-photo-caption { text-align: right; }
        .jt-photo-right .jt-photo-caption { text-align: left; }

        /* Timeline node (center) */
        .jt-node {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          z-index: 6;
        }
        .jt-node-circle {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.15);
          background: #0c0c0c;
          transition: all 0.6s ease;
        }
        .jt-node-circle.active {
          border-color: rgba(200,170,130,0.8);
          background: rgba(200,170,130,0.3);
          box-shadow: 0 0 15px rgba(200,170,130,0.5), 0 0 30px rgba(200,170,130,0.2);
        }
        .jt-node-city {
          font-family: 'Helvetica Neue', sans-serif;
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 3px;
          color: rgba(255,255,255,0.2);
          text-transform: uppercase;
          margin-top: 8px;
          white-space: nowrap;
          transition: color 0.6s ease;
        }
        .jt-node-city.active {
          color: rgba(200,170,130,0.7);
        }

        /* Connecting line from node to photo */
        .jt-connector {
          position: absolute;
          top: 50%;
          height: 1px;
          background: rgba(255,255,255,0.06);
          transition: background 0.6s ease;
          z-index: 3;
        }
        .jt-connector.active {
          background: rgba(200,170,130,0.2);
        }
        .jt-connector-left {
          right: 50%;
          width: 60px;
          transform: translateY(-50%);
          margin-right: 7px;
        }
        .jt-connector-right {
          left: 50%;
          width: 60px;
          transform: translateY(-50%);
          margin-left: 7px;
        }

        /* Footer CTA */
        .jt-footer {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: ${FOOTER_HEIGHT}px;
          z-index: 5;
        }
        .jt-footer h2 {
          font-family: 'Helvetica Neue', sans-serif;
          font-size: 28px;
          font-weight: 200;
          letter-spacing: 8px;
          color: #fff;
          text-transform: uppercase;
          margin: 0 0 12px 0;
          text-align: center;
        }
        .jt-footer p {
          font-family: 'Helvetica Neue', sans-serif;
          font-size: 14px;
          font-weight: 300;
          letter-spacing: 3px;
          color: rgba(255,255,255,0.4);
          margin: 0 0 40px 0;
          text-align: center;
        }
        .jt-cta-btn {
          display: inline-block;
          padding: 16px 48px;
          border: 1px solid rgba(200,170,130,0.4);
          color: rgba(200,170,130,0.9);
          font-family: 'Helvetica Neue', sans-serif;
          font-size: 13px;
          font-weight: 400;
          letter-spacing: 4px;
          text-transform: uppercase;
          text-decoration: none;
          cursor: pointer;
          background: transparent;
          transition: all 0.4s ease;
        }
        .jt-cta-btn:hover {
          background: rgba(200,170,130,0.1);
          border-color: rgba(200,170,130,0.7);
          box-shadow: 0 0 30px rgba(200,170,130,0.15);
        }
        .jt-footer-end-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(200,170,130,0.4);
          margin-bottom: 40px;
        }

        /* Lightbox */
        .jt-lightbox {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0,0,0,0.92);
          backdrop-filter: blur(10px);
          cursor: pointer;
          animation: jt-fade-in 0.3s ease;
        }
        .jt-lightbox img {
          max-width: 85vw;
          max-height: 90vh;
          object-fit: contain;
          border-radius: 4px;
          box-shadow: 0 20px 80px rgba(0,0,0,0.6);
        }
        .jt-lightbox-caption {
          position: absolute;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          font-family: 'Helvetica Neue', sans-serif;
          font-size: 14px;
          font-weight: 300;
          letter-spacing: 4px;
          color: rgba(255,255,255,0.6);
          text-transform: uppercase;
          white-space: nowrap;
        }
        .jt-lightbox-close {
          position: absolute;
          top: 30px;
          right: 30px;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: rgba(255,255,255,0.5);
          cursor: pointer;
          transition: color 0.3s;
          background: none;
          border: none;
        }
        .jt-lightbox-close:hover { color: #fff; }

        @keyframes jt-pulse-soft {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
        @keyframes jt-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @media (max-width: 900px) {
          .jt-photo-left, .jt-photo-right {
            width: 260px;
          }
          .jt-photo-left {
            right: calc(50% + 40px);
          }
          .jt-photo-right {
            left: calc(50% + 40px);
          }
          .jt-connector-left, .jt-connector-right {
            width: 40px;
          }
          .jt-header h1 {
            font-size: 28px;
            letter-spacing: 6px;
          }
        }

        @media (max-width: 640px) {
          .jt-photo-left, .jt-photo-right {
            width: 160px;
          }
          .jt-photo-left {
            right: calc(50% + 25px);
          }
          .jt-photo-right {
            left: calc(50% + 25px);
          }
          .jt-connector-left, .jt-connector-right {
            width: 25px;
          }
          .jt-header h1 {
            font-size: 20px;
            letter-spacing: 4px;
          }
          .jt-footer h2 {
            font-size: 20px;
            letter-spacing: 4px;
          }
        }
      `}} />

      {/* Fixed Nav */}
      <nav className="jt-nav">
        <div className="jt-nav-logo">Aidan Torrence</div>
        <div style={{ display: 'flex', gap: 32 }}>
          <a className="jt-nav-link" href="/book">Book</a>
          <a className="jt-nav-link" href="/about">About</a>
        </div>
      </nav>

      <div className="jt-container" ref={containerRef}>
        {/* Timeline background line */}
        <div className="jt-timeline-line" />
        <div className="jt-timeline-line-progress" />

        {/* Glowing scroll indicator dot */}
        <div
          className="jt-glow-dot"
          style={{ top: Math.min(glowDotTop, HEADER_HEIGHT + images.length * NODE_SPACING) }}
        />

        {/* Header */}
        <div className="jt-header">
          <h1>Aidan Torrence</h1>
          <p>Film Photographer</p>
          <div className="jt-header-dot" />
        </div>

        {/* Timeline nodes with photos */}
        {images.map((img, i) => {
          const isLeft = i % 2 === 0;
          const isVisible = visibleNodes.has(i);
          const sideClass = isLeft ? 'jt-photo-left' : 'jt-photo-right';
          const connectorClass = isLeft ? 'jt-connector-left' : 'jt-connector-right';

          return (
            <div
              key={i}
              className="jt-node-row"
              ref={(el) => { nodeRefs.current[i] = el; }}
            >
              {/* Connector line */}
              <div className={`jt-connector ${connectorClass} ${isVisible ? 'active' : ''}`} />

              {/* Center node */}
              <div className="jt-node">
                <div className={`jt-node-circle ${isVisible ? 'active' : ''}`} />
                <div className={`jt-node-city ${isVisible ? 'active' : ''}`}>{img.city}</div>
              </div>

              {/* Photo */}
              <div className={`${sideClass} ${isVisible ? 'visible' : ''}`}>
                <div
                  className="jt-photo-img-wrap"
                  onClick={() => setExpandedImage(i)}
                >
                  <img
                    src={`/images/large/${img.src}`}
                    alt={`${img.name} in ${img.city}`}
                    loading="lazy"
                  />
                </div>
                <div className="jt-photo-caption">
                  {img.name} &mdash; {img.city}
                </div>
              </div>
            </div>
          );
        })}

        {/* Footer CTA */}
        <div className="jt-footer">
          <div className="jt-footer-end-dot" />
          <h2>Your Story Next</h2>
          <p>Let&rsquo;s create something timeless together</p>
          <a className="jt-cta-btn" href="/book">Book a Shoot</a>
        </div>
      </div>

      {/* Lightbox */}
      {expandedImage !== null && (
        <div className="jt-lightbox" onClick={() => setExpandedImage(null)}>
          <button
            className="jt-lightbox-close"
            onClick={(e) => { e.stopPropagation(); setExpandedImage(null); }}
          >
            &#x2715;
          </button>
          <img
            src={`/images/large/${images[expandedImage].src}`}
            alt={`${images[expandedImage].name} in ${images[expandedImage].city}`}
            onClick={(e) => e.stopPropagation()}
            style={{ cursor: 'default' }}
          />
          <div className="jt-lightbox-caption">
            {images[expandedImage].name} &mdash; {images[expandedImage].city}
          </div>
        </div>
      )}
    </>
  );
}
