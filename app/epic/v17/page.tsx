'use client';

import React, { useEffect, useRef, useState } from 'react';

const images = [
  { src: 'manila-gallery-dsc-0075.jpg', name: 'Rina', city: 'Makati' },
  { src: 'manila-gallery-night-001.jpg', name: 'Jess', city: 'BGC' },
  { src: 'manila-gallery-garden-001.jpg', name: 'Suki', city: 'Manila' },
  { src: 'manila-gallery-street-001.jpg', name: 'Clara', city: 'Poblacion' },
  { src: 'manila-gallery-closeup-001.jpg', name: 'Althea', city: 'Manila' },
  { src: 'manila-gallery-canal-001.jpg', name: 'Ana', city: 'Escolta' },
  { src: 'manila-gallery-ivy-001.jpg', name: 'Mei', city: 'Intramuros' },
  { src: 'manila-gallery-urban-001.jpg', name: 'Ivy', city: 'Makati' },
  { src: 'manila-gallery-dsc-0130.jpg', name: 'Lara', city: 'BGC' },
  { src: 'manila-gallery-shadow-001.jpg', name: 'Lena', city: 'Manila' },
  { src: 'manila-gallery-tropical-001.jpg', name: 'Kira', city: 'Intramuros' },
  { src: 'manila-gallery-statue-001.jpg', name: 'Dani', city: 'Manila' },
  { src: 'manila-gallery-night-002.jpg', name: 'Aya', city: 'Poblacion' },
  { src: 'manila-gallery-market-001.jpg', name: 'Tala', city: 'Escolta' },
  { src: 'manila-gallery-park-001.jpg', name: 'Nina', city: 'BGC' },
  { src: 'manila-gallery-floor-001.jpg', name: 'Mia', city: 'Makati' },
  { src: 'manila-gallery-garden-002.jpg', name: 'Rosa', city: 'Manila' },
  { src: 'manila-gallery-urban-002.jpg', name: 'Jade', city: 'Poblacion' },
  { src: 'manila-gallery-dsc-0190.jpg', name: 'Bea', city: 'Intramuros' },
  { src: 'manila-gallery-ivy-002.jpg', name: 'Sol', city: 'Manila' },
  { src: 'manila-gallery-canal-002.jpg', name: 'Pia', city: 'Escolta' },
  { src: 'manila-gallery-night-003.jpg', name: 'Elle', city: 'BGC' },
  { src: 'manila-gallery-urban-003.jpg', name: 'Kai', city: 'Makati' },
  { src: 'manila-gallery-white-001.jpg', name: 'Yuki', city: 'Manila' },
  { src: 'manila-gallery-dsc-0911.jpg', name: 'Isa', city: 'Poblacion' },
];

const TOTAL = images.length;

const CSS = `
  body > header, body > footer, .fixed.inset-x-0.bottom-0 { display: none !important; }
  html, body {
    background: #0c0c0c !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow-x: hidden !important;
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
    top: 60px;
    right: 20px;
    z-index: 100;
    color: #fff;
    font-family: 'SF Mono', 'Fira Code', 'Courier New', monospace;
    font-size: 18px;
    font-weight: 500;
    letter-spacing: 0.05em;
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    padding: 10px 16px;
    border-radius: 20px;
    border: 1px solid rgba(255,255,255,0.1);
    transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
  }

  .v17-counter.v17-bump {
    transform: scale(1.15);
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
    transition: opacity 0.4s;
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

  .v17-hero {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    padding: 20px;
    box-sizing: border-box;
  }

  .v17-hero img {
    width: 100%;
    max-width: 600px;
    max-height: 65vh;
    object-fit: cover;
    border-radius: 2px;
  }

  .v17-done {
    min-height: 60vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    text-align: center;
  }

  .v17-checkmark {
    width: 48px;
    height: 48px;
    border: 2px solid rgba(255,255,255,0.3);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    animation: v17-pop 0.5s cubic-bezier(0.34,1.56,0.64,1);
  }

  @keyframes v17-pop {
    0% { transform: scale(0); }
    100% { transform: scale(1); }
  }

  .v17-cta-section {
    padding: 40px 24px 80px;
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

export default function V17Page() {
  const [current, setCurrent] = useState(1);
  const [showCue, setShowCue] = useState(true);
  const [bump, setBump] = useState(false);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

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
      {showCue && (
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

      {/* Hero */}
      <div
        className="v17-hero"
        data-idx="0"
        ref={(el) => { sectionRefs.current[0] = el; }}
      >
        <img
          src={`/images/large/${images[0].src}`}
          alt={`${images[0].name} in ${images[0].city}`}
          className="v17-visible"
        />
        <div className="v17-caption v17-caption-visible" style={{ marginTop: 12 }}>
          <p className="v17-caption-name">{images[0].name}</p>
          <p className="v17-caption-city">{images[0].city}</p>
        </div>
      </div>

      {/* Photo sections */}
      {images.slice(1).map((img, i) => (
        <div
          className="v17-photo-section"
          key={img.src}
          data-idx={i + 1}
          ref={(el) => { sectionRefs.current[i + 1] = el; }}
        >
          <img
            src={`/images/large/${img.src}`}
            alt={`${img.name} in ${img.city}`}
            loading="lazy"
          />
          <div className="v17-caption">
            <p className="v17-caption-name">{img.name}</p>
            <p className="v17-caption-city">{img.city}</p>
          </div>
        </div>
      ))}

      {/* Completion message */}
      <div className="v17-done">
        <div className="v17-checkmark">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
            <path d="M5 12l5 5L20 7" />
          </svg>
        </div>
        <h2 style={{
          color: '#fff', fontSize: '24px', fontWeight: 300,
          letterSpacing: '0.06em', margin: '0 0 8px',
          fontFamily: 'Georgia, serif',
        }}>
          You&apos;ve seen everything
        </h2>
        <p style={{
          color: 'rgba(255,255,255,0.4)', fontSize: '14px',
          fontFamily: 'system-ui, sans-serif',
        }}>
          Like what you see? Let&apos;s create something together.
        </p>
      </div>

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
            WhatsApp: +49 175 8966210 · @aidantorrence
          </p>
          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px', marginTop: '16px', fontFamily: 'system-ui, sans-serif' }}>
            Featured in Vogue Italia · Hypebeast · WWD
          </p>
        </div>
      </div>
    </>
  );
}
