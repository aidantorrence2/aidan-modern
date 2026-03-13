'use client';

import React, { useEffect, useRef, useState } from 'react';

const images = [
  { src: 'manila-gallery-night-001.jpg', x: 5, y: 110, w: 55, rot: -3, z: 2 },
  { src: 'manila-gallery-street-001.jpg', x: 40, y: 105, w: 48, rot: 2.5, z: 1 },
  { src: 'manila-gallery-dsc-0075.jpg', x: -5, y: 210, w: 60, rot: 1.5, z: 3 },
  { src: 'manila-gallery-canal-001.jpg', x: 35, y: 220, w: 52, rot: -2, z: 2 },
  { src: 'manila-gallery-garden-001.jpg', x: 8, y: 330, w: 50, rot: 2, z: 1 },
  { src: 'manila-gallery-closeup-001.jpg', x: 42, y: 310, w: 54, rot: -1.5, z: 2 },
  { src: 'manila-gallery-shadow-001.jpg', x: -2, y: 430, w: 58, rot: -2.5, z: 3 },
  { src: 'manila-gallery-urban-001.jpg', x: 38, y: 420, w: 50, rot: 1.8, z: 1 },
  { src: 'manila-gallery-dsc-0130.jpg', x: 10, y: 530, w: 52, rot: 1, z: 2 },
  { src: 'manila-gallery-night-002.jpg', x: 40, y: 540, w: 56, rot: -2.2, z: 3 },
  { src: 'manila-gallery-tropical-001.jpg', x: 0, y: 640, w: 55, rot: 2.8, z: 1 },
  { src: 'manila-gallery-ivy-001.jpg', x: 44, y: 630, w: 48, rot: -1.2, z: 2 },
  { src: 'manila-gallery-market-001.jpg', x: 5, y: 740, w: 60, rot: -1.8, z: 3 },
  { src: 'manila-gallery-park-001.jpg', x: 36, y: 750, w: 50, rot: 2.5, z: 1 },
  { src: 'manila-gallery-urban-002.jpg', x: 2, y: 850, w: 54, rot: 1.5, z: 2 },
  { src: 'manila-gallery-dsc-0190.jpg', x: 42, y: 840, w: 52, rot: -2.8, z: 3 },
  { src: 'manila-gallery-floor-001.jpg', x: 8, y: 950, w: 48, rot: -1, z: 1 },
  { src: 'manila-gallery-statue-001.jpg', x: 38, y: 960, w: 56, rot: 2.2, z: 2 },
  { src: 'manila-gallery-night-003.jpg', x: 0, y: 1060, w: 58, rot: 1.8, z: 3 },
  { src: 'manila-gallery-white-001.jpg', x: 40, y: 1050, w: 50, rot: -2.5, z: 1 },
  { src: 'manila-gallery-garden-002.jpg', x: 5, y: 1160, w: 52, rot: -1.5, z: 2 },
  { src: 'manila-gallery-canal-002.jpg', x: 42, y: 1170, w: 54, rot: 2, z: 3 },
  { src: 'manila-gallery-ivy-002.jpg', x: -3, y: 1270, w: 56, rot: 2.5, z: 1 },
  { src: 'manila-gallery-urban-003.jpg', x: 38, y: 1260, w: 50, rot: -1.8, z: 2 },
  { src: 'manila-gallery-dsc-0911.jpg', x: 10, y: 1370, w: 60, rot: -2, z: 3 },
];

const CSS = `
  body > header, body > footer, .fixed.inset-x-0.bottom-0 { display: none !important; }
  html, body { background: #080810 !important; margin: 0; padding: 0; overflow-x: hidden; }
  * { box-sizing: border-box; }

  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=Inter:wght@300;400&display=swap');

  .float-page {
    position: relative;
    width: 100%;
    min-height: 100vh;
  }

  .center-name {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1;
    text-align: center;
    pointer-events: none;
    opacity: 1;
    transition: opacity 0.4s ease;
  }

  .center-name h1 {
    font-family: 'Cormorant Garamond', serif;
    font-weight: 300;
    font-size: clamp(36px, 10vw, 80px);
    color: rgba(255,255,255,0.9);
    letter-spacing: 0.15em;
    text-transform: uppercase;
    margin: 0;
    line-height: 1.1;
  }

  .center-name .tag {
    font-family: 'Inter', sans-serif;
    font-weight: 300;
    font-size: 11px;
    letter-spacing: 0.3em;
    color: rgba(255,255,255,0.4);
    text-transform: uppercase;
    margin-top: 12px;
  }

  .float-canvas {
    position: relative;
    width: 100%;
  }

  .float-img-wrap {
    position: absolute;
    transition: transform 0.1s linear;
    will-change: transform;
  }

  .float-img-wrap img {
    width: 100%;
    height: auto;
    display: block;
    border-radius: 2px;
    box-shadow: 0 8px 40px rgba(0,0,0,0.6);
  }

  .float-img-wrap::after {
    content: '';
    position: absolute;
    inset: 0;
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 2px;
    pointer-events: none;
  }

  .inquiry-section {
    position: relative;
    z-index: 10;
    padding: 80px 24px;
    text-align: center;
    font-family: 'Cormorant Garamond', serif;
  }

  .inquiry-section h2 {
    font-size: clamp(28px, 7vw, 52px);
    font-weight: 300;
    color: rgba(255,255,255,0.85);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin: 0 0 8px;
  }

  .inquiry-section .based {
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    color: rgba(255,255,255,0.35);
    letter-spacing: 0.2em;
    text-transform: uppercase;
    margin-bottom: 36px;
  }

  .inquiry-btn {
    display: inline-block;
    border: 1px solid rgba(255,255,255,0.25);
    color: rgba(255,255,255,0.85);
    font-family: 'Inter', sans-serif;
    font-weight: 300;
    font-size: 13px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    padding: 14px 44px;
    background: transparent;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.3s ease;
  }

  .inquiry-btn:hover {
    background: rgba(255,255,255,0.08);
    border-color: rgba(255,255,255,0.5);
  }

  .inquiry-links {
    margin-top: 28px;
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    justify-content: center;
  }

  .inquiry-links a {
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    color: rgba(255,255,255,0.35);
    text-decoration: none;
    letter-spacing: 0.08em;
    transition: color 0.3s;
  }

  .inquiry-links a:hover { color: rgba(255,255,255,0.7); }

  .inquiry-credits {
    font-family: 'Inter', sans-serif;
    font-size: 10px;
    color: rgba(255,255,255,0.2);
    letter-spacing: 0.15em;
    text-transform: uppercase;
    margin-top: 48px;
  }

  @keyframes driftIn {
    from { opacity: 0; transform: translateY(40px) scale(0.95); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  .drift-in {
    animation: driftIn 0.8s ease forwards;
    opacity: 0;
  }
`;

export default function V11FloatingGallery() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const totalHeight = 1500;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="float-page">
        {/* Centered name — fades as you scroll */}
        <div
          className="center-name"
          style={{ opacity: Math.max(0, 1 - scrollY / 400) }}
        >
          <h1>Aidan<br />Torrence</h1>
          <div className="tag">Film &middot; Fashion &middot; Editorial</div>
        </div>

        {/* Floating photos canvas */}
        <div
          className="float-canvas"
          ref={canvasRef}
          style={{ height: `${totalHeight}vh` }}
        >
          {images.map((img, i) => {
            const parallaxFactor = 0.03 + (img.z * 0.015);
            const offsetY = scrollY * parallaxFactor;
            const offsetX = Math.sin(scrollY * 0.002 + i) * (img.z * 3);
            return (
              <div
                key={i}
                className="float-img-wrap drift-in"
                style={{
                  left: `${img.x}%`,
                  top: `${img.y}vh`,
                  width: `${img.w}%`,
                  zIndex: img.z,
                  transform: `translate(${offsetX}px, ${offsetY}px) rotate(${img.rot}deg)`,
                  animationDelay: `${i * 0.08}s`,
                }}
              >
                <img
                  src={`/images/large/${img.src}`}
                  alt={`Photo ${i + 1}`}
                  loading={i < 3 ? 'eager' : 'lazy'}
                />
              </div>
            );
          })}
        </div>

        {/* Inquiry */}
        <div className="inquiry-section">
          <h2>Work With Me</h2>
          <div className="based">Bangkok &amp; Europe &middot; Worldwide</div>
          <a className="inquiry-btn" href="mailto:aidan@aidantorrence.com">
            Get In Touch
          </a>
          <div className="inquiry-links">
            <a href="mailto:aidan@aidantorrence.com">aidan@aidantorrence.com</a>
            <a href="https://wa.me/491758966210">WhatsApp</a>
            <a href="https://instagram.com/aidantorrence" target="_blank" rel="noopener noreferrer">
              @aidantorrence
            </a>
          </div>
          <div className="inquiry-credits">
            Vogue Italia &middot; Hypebeast &middot; WWD
          </div>
        </div>
      </div>
    </>
  );
}
