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

const TOTAL = images.length;
const HERO_IMAGE_INDEX = 0;

const CSS = `
  body > header, body > footer, .fixed.inset-x-0.bottom-0 { display: none !important; }
  html, body {
    background: #0c0c0c !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow-x: hidden !important;
  }

  /* ── Film strip intro overlay ── */
  .v2-film-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: #0c0c0c;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .v2-film-overlay.v2-zoom {
    pointer-events: none;
  }

  .v2-film-overlay.v2-done {
    display: none;
  }

  .v2-film-strip-container {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    height: 340px;
    will-change: transform;
  }

  .v2-film-strip {
    display: flex;
    height: 100%;
    position: relative;
    animation: v2-scroll-strip 2.8s cubic-bezier(0.25, 0.1, 0.25, 1) forwards;
  }

  @keyframes v2-scroll-strip {
    0% { transform: translateX(100vw); }
    100% { transform: translateX(calc(-100% + 50vw - 120px)); }
  }

  .v2-film-strip::before,
  .v2-film-strip::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    height: 32px;
    background: #111;
    z-index: 2;
  }

  .v2-film-strip::before { top: 0; }
  .v2-film-strip::after { bottom: 0; }

  .v2-sprocket-row {
    position: absolute;
    left: 0;
    right: 0;
    height: 32px;
    z-index: 3;
    display: flex;
    align-items: center;
    gap: 0;
    pointer-events: none;
  }

  .v2-sprocket-row-top { top: 0; }
  .v2-sprocket-row-bottom { bottom: 0; }

  .v2-sprocket {
    width: 16px;
    height: 20px;
    background: #0c0c0c;
    border-radius: 3px;
    flex-shrink: 0;
    margin: 0 20px;
  }

  .v2-film-frame {
    flex-shrink: 0;
    width: 240px;
    height: 100%;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #111;
    border-left: 2px solid #1a1a1a;
    border-right: 2px solid #1a1a1a;
  }

  .v2-film-frame img {
    width: 220px;
    height: 270px;
    object-fit: cover;
    display: block;
    border-radius: 1px;
    position: relative;
    z-index: 1;
    filter: saturate(0.85) contrast(1.05);
  }

  .v2-film-frame-number {
    position: absolute;
    bottom: 36px;
    right: 14px;
    color: rgba(255, 165, 0, 0.5);
    font-family: 'Courier New', monospace;
    font-size: 9px;
    z-index: 4;
    letter-spacing: 0.05em;
  }

  /* Zoom phase: scale up the hero frame and fade overlay */
  .v2-film-overlay.v2-zoom .v2-film-strip-container {
    transition: transform 1.0s cubic-bezier(0.4, 0, 0.2, 1), opacity 1.0s ease;
    transform: translateY(-50%) scale(3.5);
    opacity: 0;
  }

  .v2-film-overlay.v2-zoom {
    animation: v2-fade-overlay 1.0s ease 0.2s forwards;
  }

  @keyframes v2-fade-overlay {
    0% { background: rgba(12, 12, 12, 1); }
    100% { background: rgba(12, 12, 12, 0); }
  }

  /* ── Main page (same as homepage) ── */
  .v2-main-content {
    opacity: 0;
    transition: opacity 0.6s ease;
  }

  .v2-main-content.v2-main-visible {
    opacity: 1;
  }

  .v17-fixed-nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 16px 20px;
    pointer-events: none;
  }

  .v17-fixed-nav a {
    pointer-events: auto;
    color: rgba(255,255,255,0.6);
    text-decoration: none;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 12px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    transition: color 0.2s;
  }

  .v17-fixed-nav a:hover { color: #fff; }

  .v17-counter {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 100;
    color: rgba(255,255,255,0.5);
    font-family: 'SF Mono', 'Fira Code', 'Courier New', monospace;
    font-size: 13px;
    font-weight: 400;
    letter-spacing: 0.05em;
    background: rgba(0,0,0,0.5);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    padding: 8px 14px;
    border-radius: 16px;
    border: 1px solid rgba(255,255,255,0.08);
    transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
  }

  .v17-counter.v17-bump {
    transform: scale(1.1);
  }

  .v17-progress {
    position: fixed;
    top: 0;
    left: 0;
    height: 3px;
    background: linear-gradient(90deg, #fff 0%, rgba(255,255,255,0.5) 100%);
    z-index: 101;
    transition: width 0.3s ease;
  }

  .v17-scroll-cue {
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 100;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    animation: v17-bounce 1.8s ease-in-out infinite;
    transition: opacity 0.5s;
  }

  @keyframes v17-bounce {
    0%, 100% { transform: translateX(-50%) translateY(0); }
    50% { transform: translateX(-50%) translateY(10px); }
  }

  .v17-photo-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px 16px;
    box-sizing: border-box;
  }

  .v17-photo-section img {
    width: 100%;
    max-width: 600px;
    max-height: 80vh;
    object-fit: contain;
    display: block;
    border-radius: 2px;
    opacity: 0;
    transform: translateY(40px);
    transition: opacity 0.7s ease, transform 0.7s ease;
  }

  .v17-photo-section img.v17-visible {
    opacity: 1;
    transform: translateY(0);
  }

  .v17-caption {
    text-align: center;
    margin-top: 12px;
    opacity: 0;
    transform: translateY(10px);
    transition: opacity 0.5s ease 0.3s, transform 0.5s ease 0.3s;
  }

  .v17-caption.v17-caption-visible {
    opacity: 1;
    transform: translateY(0);
  }

  .v17-caption-name {
    color: rgba(255,255,255,0.75);
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 16px;
    margin: 0;
    line-height: 1.3;
  }

  .v17-caption-city {
    color: rgba(255,255,255,0.3);
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 11px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    margin: 3px 0 0;
  }

  .v17-page-title {
    color: rgba(255,255,255,0.5);
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 13px;
    font-weight: 400;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    text-align: center;
    margin: 0;
    padding: 90px 20px 30px;
  }

  .v17-cta-section {
    padding: 60px 24px 80px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .v17-cta-section input,
  .v17-cta-section textarea {
    width: 100%;
    max-width: 400px;
    padding: 14px 16px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 8px;
    color: #fff;
    font-size: 16px;
    font-family: inherit;
    outline: none;
    margin-bottom: 12px;
    transition: border-color 0.2s;
  }

  .v17-cta-section input:focus,
  .v17-cta-section textarea:focus {
    border-color: rgba(255,255,255,0.35);
  }

  .v17-cta-section textarea {
    min-height: 100px;
    resize: vertical;
  }

  .v17-submit {
    width: 100%;
    max-width: 400px;
    padding: 16px;
    background: #fff;
    color: #0c0c0c;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .v17-submit:hover { opacity: 0.85; }
`;

export default function Page() {
  const [introPhase, setIntroPhase] = useState<'scroll' | 'zoom' | 'done'>('scroll');
  const [current, setCurrent] = useState(1);
  const [showCue, setShowCue] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [bump, setBump] = useState(false);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const sprocketCount = Math.ceil((images.length * 244 + 100) / 36);

  useEffect(() => {
    // Phase 1: film strip scrolls (2.8s), then Phase 2: zoom + fade (1.2s)
    const scrollTimer = setTimeout(() => {
      setIntroPhase('zoom');
    }, 2800);

    const doneTimer = setTimeout(() => {
      setIntroPhase('done');
    }, 4000);

    return () => {
      clearTimeout(scrollTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  useEffect(() => {
    if (introPhase !== 'done') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target.querySelector('img');
            const caption = entry.target.querySelector('.v17-caption');
            if (img) img.classList.add('v17-visible');
            if (caption) caption.classList.add('v17-caption-visible');
            const idx = Number((entry.target as HTMLElement).dataset.idx);
            if (!isNaN(idx)) {
              setCurrent(idx + 1);
              setBump(true);
              setTimeout(() => setBump(false), 300);
            }
          }
        });
      },
      { threshold: 0.4 }
    );

    sectionRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    const handleScroll = () => {
      if (window.scrollY > window.innerHeight * 0.5) {
        setShowCue(false);
      }
      const nearBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 200;
      setAtEnd(nearBottom);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [introPhase]);

  const progress = (current / TOTAL) * 100;

  const overlayClass = [
    'v2-film-overlay',
    introPhase === 'zoom' ? 'v2-zoom' : '',
    introPhase === 'done' ? 'v2-done' : '',
  ].filter(Boolean).join(' ');

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* ── Film strip intro animation ── */}
      <div className={overlayClass}>
        <div className="v2-film-strip-container">
          {/* Top sprocket row */}
          <div className="v2-sprocket-row v2-sprocket-row-top">
            {Array.from({ length: sprocketCount }, (_, i) => (
              <div key={`st-${i}`} className="v2-sprocket" />
            ))}
          </div>

          {/* Film frames */}
          <div className="v2-film-strip">
            {/* Top/bottom film borders are handled by ::before/::after */}
            {images.map((img, i) => (
              <div className="v2-film-frame" key={img.src}>
                <img
                  src={`/images/large/${img.src}`}
                  alt={`${img.name} — ${img.city}`}
                />
                <span className="v2-film-frame-number">{String(i + 1).padStart(2, '0')}A</span>
              </div>
            ))}
          </div>

          {/* Bottom sprocket row */}
          <div className="v2-sprocket-row v2-sprocket-row-bottom">
            {Array.from({ length: sprocketCount }, (_, i) => (
              <div key={`sb-${i}`} className="v2-sprocket" />
            ))}
          </div>
        </div>
      </div>

      {/* ── Main portfolio content ── */}
      <div className={`v2-main-content${introPhase === 'done' ? ' v2-main-visible' : ''}`}>
        {/* Progress bar */}
        <div className="v17-progress" style={{ width: `${progress}%` }} />

        {/* Fixed nav */}
        <div className="v17-fixed-nav">
          <a href="#inquiry">Inquire</a>
          <div style={{ textAlign: 'right', pointerEvents: 'none' }}>
            <p style={{
              color: 'rgba(255,255,255,0.7)',
              fontSize: '13px',
              letterSpacing: '0.12em',
              margin: 0,
              fontFamily: 'Georgia, serif',
            }}>Aidan Torrence</p>
            <p style={{
              color: 'rgba(255,255,255,0.35)',
              fontSize: '10px',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              margin: '2px 0 0',
              fontFamily: 'system-ui, sans-serif',
            }}>Film Photographer</p>
          </div>
        </div>

        {/* Counter */}
        <div className={`v17-counter${bump ? ' v17-bump' : ''}`}>
          {current} / {TOTAL}
        </div>

        {/* Scroll cue */}
        {showCue && !atEnd && (
          <div className="v17-scroll-cue">
            <span style={{
              color: 'rgba(255,255,255,0.7)',
              fontSize: '12px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              fontFamily: 'system-ui, sans-serif',
            }}>
              scroll
            </span>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round">
              <path d="M10 4v12M4 10l6 6 6-6" />
            </svg>
          </div>
        )}

        {/* Page title */}
        <p className="v17-page-title">Selected Works</p>

        {/* Photo sections */}
        {images.map((img, i) => (
          <div
            className="v17-photo-section"
            key={img.src}
            data-idx={i}
            ref={(el) => { sectionRefs.current[i] = el; }}
          >
            <img
              src={`/images/large/${img.src}`}
              alt={`${img.name} — ${img.city}`}
              loading="lazy"
            />
            <div className="v17-caption">
              <p className="v17-caption-name">{img.name}</p>
              <p className="v17-caption-city">{img.city}</p>
            </div>
          </div>
        ))}

        {/* CTA */}
        <div className="v17-cta-section" id="inquiry">
          <h3 style={{
            color: '#fff', fontSize: '22px', fontWeight: 300,
            letterSpacing: '0.06em', marginBottom: '24px',
            fontFamily: 'Georgia, serif',
          }}>
            Get in Touch
          </h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              window.location.href = 'mailto:aidan@aidantorrence.com';
            }}
            style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <input type="text" placeholder="Name" required />
            <input type="email" placeholder="Email" required />
            <input type="text" placeholder="Instagram" />
            <textarea placeholder="Tell me about your project..." />
            <button type="submit" className="v17-submit">Send Inquiry</button>
          </form>
          <div style={{ marginTop: '36px', textAlign: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: '4px 0', fontFamily: 'system-ui, sans-serif' }}>
              aidan@aidantorrence.com
            </p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: '4px 0', fontFamily: 'system-ui, sans-serif' }}>
              WhatsApp: +49 175 8966210 &middot; @madebyaidan
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
