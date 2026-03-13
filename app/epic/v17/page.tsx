'use client';

import React, { useEffect, useRef, useState } from 'react';

const images = [
  'manila-gallery-dsc-0075.jpg',
  'manila-gallery-night-001.jpg',
  'manila-gallery-garden-001.jpg',
  'manila-gallery-street-001.jpg',
  'manila-gallery-closeup-001.jpg',
  'manila-gallery-canal-001.jpg',
  'manila-gallery-ivy-001.jpg',
  'manila-gallery-urban-001.jpg',
  'manila-gallery-dsc-0130.jpg',
  'manila-gallery-shadow-001.jpg',
  'manila-gallery-tropical-001.jpg',
  'manila-gallery-statue-001.jpg',
  'manila-gallery-night-002.jpg',
  'manila-gallery-market-001.jpg',
  'manila-gallery-park-001.jpg',
  'manila-gallery-floor-001.jpg',
  'manila-gallery-garden-002.jpg',
  'manila-gallery-urban-002.jpg',
  'manila-gallery-dsc-0190.jpg',
  'manila-gallery-ivy-002.jpg',
  'manila-gallery-canal-002.jpg',
  'manila-gallery-night-003.jpg',
  'manila-gallery-urban-003.jpg',
  'manila-gallery-white-001.jpg',
  'manila-gallery-dsc-0911.jpg',
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

  .v17-counter {
    position: fixed;
    top: 20px;
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
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 60px 16px;
    box-sizing: border-box;
  }

  .v17-photo-section img {
    width: 100%;
    max-width: 600px;
    max-height: 85vh;
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
    max-height: 70vh;
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
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('v17-visible');
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

    imgRefs.current.forEach((el) => {
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

      {/* Counter */}
      <div className={`v17-counter${bump ? ' v17-bump' : ''}`}>
        {current} / {TOTAL}
      </div>

      {/* Scroll cue */}
      {showCue && (
        <div className="v17-scroll-cue">
          <span
            style={{
              color: 'rgba(255,255,255,0.7)',
              fontSize: '12px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            scroll
          </span>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round">
            <path d="M10 4v12M4 10l6 6 6-6" />
          </svg>
        </div>
      )}

      {/* Hero */}
      <div className="v17-hero">
        <h1
          style={{
            color: '#fff',
            fontSize: '36px',
            fontWeight: 300,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            margin: '0 0 4px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          Aidan Torrence
        </h1>
        <p
          style={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: '13px',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            marginBottom: '28px',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          {TOTAL} Photos &middot; Film &middot; Fashion &middot; Editorial
        </p>
        <img
          ref={(el) => { imgRefs.current[0] = el; }}
          data-idx="0"
          src={`/images/large/${images[0]}`}
          alt="Portfolio photo 1"
          className="v17-visible"
        />
      </div>

      {/* Photo sections */}
      {images.slice(1).map((img, i) => (
        <div className="v17-photo-section" key={img}>
          <img
            ref={(el) => { imgRefs.current[i + 1] = el; }}
            data-idx={i + 1}
            src={`/images/large/${img}`}
            alt={`Portfolio photo ${i + 2}`}
            loading="lazy"
          />
        </div>
      ))}

      {/* Completion message */}
      <div className="v17-done">
        <div className="v17-checkmark">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
            <path d="M5 12l5 5L20 7" />
          </svg>
        </div>
        <h2
          style={{
            color: '#fff',
            fontSize: '24px',
            fontWeight: 300,
            letterSpacing: '0.06em',
            margin: '0 0 8px',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          You&apos;ve seen everything
        </h2>
        <p
          style={{
            color: 'rgba(255,255,255,0.4)',
            fontSize: '14px',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          Like what you see? Let&apos;s create something together.
        </p>
      </div>

      {/* CTA */}
      <div className="v17-cta-section">
        <h3
          style={{
            color: '#fff',
            fontSize: '22px',
            fontWeight: 300,
            letterSpacing: '0.06em',
            marginBottom: '24px',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
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
          <textarea placeholder="Tell me about your project..." />
          <button type="submit" className="v17-submit">
            Send Inquiry
          </button>
        </form>
        <div style={{ marginTop: '36px', textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: '4px 0', fontFamily: 'system-ui, sans-serif' }}>
            aidan@aidantorrence.com &middot; WhatsApp: +49 175 8966210
          </p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: '4px 0', fontFamily: 'system-ui, sans-serif' }}>
            @aidantorrence &middot; Based between Bangkok &amp; Europe
          </p>
          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px', marginTop: '16px', fontFamily: 'system-ui, sans-serif' }}>
            Featured in Vogue Italia &middot; Hypebeast &middot; WWD
          </p>
        </div>
      </div>
    </>
  );
}
