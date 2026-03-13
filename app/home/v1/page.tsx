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

const TOTAL = images.length;

/* ---------- seed-able pseudo-random (deterministic layout per load) ---------- */
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------- generate scattered positions for N particles ---------- */
interface Particle {
  imgIndex: number;
  startX: number;
  startY: number;
  startRotation: number;
  startScale: number;
  driftX: number;
  driftY: number;
  driftRotation: number;
  delay: number;
}

function generateParticles(count: number, seed: number): Particle[] {
  const rand = mulberry32(seed);
  const particles: Particle[] = [];

  for (let i = 0; i < count; i++) {
    const imgIndex = i % images.length;
    const angle = rand() * Math.PI * 2;
    const radius = 30 + rand() * 80;
    const startX = Math.cos(angle) * radius;
    const startY = Math.sin(angle) * radius;
    const startRotation = (rand() - 0.5) * 360;
    const startScale = 0.3 + rand() * 0.7;
    const driftX = (rand() - 0.5) * 40;
    const driftY = (rand() - 0.5) * 40;
    const driftRotation = (rand() - 0.5) * 120;
    const delay = rand() * 0.4;

    particles.push({
      imgIndex,
      startX,
      startY,
      startRotation,
      startScale,
      driftX,
      driftY,
      driftRotation,
      delay,
    });
  }

  return particles;
}

const CSS = `
  body > header, body > footer, .fixed.inset-x-0.bottom-0 { display: none !important; }
  html, body {
    background: #0c0c0c !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow-x: hidden !important;
  }

  /* ===== Intro animation overlay ===== */

  .v1-intro-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: #0c0c0c;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    pointer-events: none;
  }

  .v1-intro-overlay.v1-fade-out {
    animation: v1OverlayFadeOut 1s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }

  @keyframes v1OverlayFadeOut {
    0% { opacity: 1; }
    100% { opacity: 0; }
  }

  .v1-particle {
    position: absolute;
    top: 50%;
    left: 50%;
    will-change: transform, opacity;
    border-radius: 2px;
    overflow: hidden;
    box-shadow: 0 4px 24px rgba(0,0,0,0.6);
  }

  .v1-particle img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  /* Phase 1: Burst outward from center (0s – 0.6s) */
  .v1-particle {
    opacity: 0;
    animation:
      v1Burst 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards,
      v1Drift 2.2s ease-in-out 0.8s forwards,
      v1Converge 1.2s cubic-bezier(0.7, 0, 0.3, 1) 3s forwards;
  }

  @keyframes v1Burst {
    0% {
      opacity: 0;
      transform: translate(-50%, -50%) translate(0px, 0px) rotate(0deg) scale(0);
    }
    30% {
      opacity: 1;
    }
    100% {
      opacity: 1;
      transform:
        translate(-50%, -50%)
        translate(var(--sx), var(--sy))
        rotate(var(--sr))
        scale(var(--ss));
    }
  }

  /* Phase 2: Gentle drift (0.8s – 3s) */
  @keyframes v1Drift {
    0% {
      transform:
        translate(-50%, -50%)
        translate(var(--sx), var(--sy))
        rotate(var(--sr))
        scale(var(--ss));
      opacity: 1;
    }
    100% {
      transform:
        translate(-50%, -50%)
        translate(calc(var(--sx) + var(--dx)), calc(var(--sy) + var(--dy)))
        rotate(calc(var(--sr) + var(--dr)))
        scale(var(--ss));
      opacity: 1;
    }
  }

  /* Phase 3: Converge to center, shrink, fade (3s – 4.2s) */
  @keyframes v1Converge {
    0% {
      transform:
        translate(-50%, -50%)
        translate(calc(var(--sx) + var(--dx)), calc(var(--sy) + var(--dy)))
        rotate(calc(var(--sr) + var(--dr)))
        scale(var(--ss));
      opacity: 1;
    }
    100% {
      transform:
        translate(-50%, -50%)
        translate(0px, 0px)
        rotate(0deg)
        scale(0);
      opacity: 0;
    }
  }

  /* ===== Portfolio styles (identical to homepage) ===== */

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

const PARTICLE_COUNT = 50;
const PARTICLE_SEED = 42;

export default function Page() {
  const [current, setCurrent] = useState(1);
  const [showCue, setShowCue] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [bump, setBump] = useState(false);
  const [introVisible, setIntroVisible] = useState(true);
  const [introFading, setIntroFading] = useState(false);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const particlesRef = useRef<Particle[]>([]);

  /* Generate particles once */
  if (particlesRef.current.length === 0) {
    particlesRef.current = generateParticles(PARTICLE_COUNT, PARTICLE_SEED);
  }

  const particles = particlesRef.current;

  /* Lock scroll during intro, release after */
  useEffect(() => {
    if (introVisible) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [introVisible]);

  /* Intro timeline */
  useEffect(() => {
    /* At 3.8s, start fading the overlay */
    const fadeTimer = setTimeout(() => {
      setIntroFading(true);
    }, 3800);

    /* At 4.8s, remove the overlay entirely */
    const removeTimer = setTimeout(() => {
      setIntroVisible(false);
      document.body.style.overflow = '';
    }, 4800);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  /* Scroll observers for gallery (same as homepage) */
  useEffect(() => {
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
  }, []);

  const progress = (current / TOTAL) * 100;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* ===== Intro Animation Overlay ===== */}
      {introVisible && (
        <div className={`v1-intro-overlay${introFading ? ' v1-fade-out' : ''}`}>
          {particles.map((p, i) => {
            const w = 80 + (p.startScale * 100);
            const h = w * 1.35;
            return (
              <div
                key={i}
                className="v1-particle"
                style={{
                  width: `${w}px`,
                  height: `${h}px`,
                  animationDelay: `${p.delay}s, ${0.8 + p.delay}s, ${3 + p.delay * 0.5}s`,
                  ['--sx' as string]: `${p.startX}vw`,
                  ['--sy' as string]: `${p.startY}vh`,
                  ['--sr' as string]: `${p.startRotation}deg`,
                  ['--ss' as string]: p.startScale,
                  ['--dx' as string]: `${p.driftX}vw`,
                  ['--dy' as string]: `${p.driftY}vh`,
                  ['--dr' as string]: `${p.driftRotation}deg`,
                } as React.CSSProperties}
              >
                <img
                  src={`/images/large/${images[p.imgIndex].src}`}
                  alt=""
                  draggable={false}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* ===== Portfolio (identical to homepage) ===== */}

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
            WhatsApp: +49 175 8966210 · @madebyaidan
          </p>
        </div>
      </div>
    </>
  );
}
