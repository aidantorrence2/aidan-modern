'use client';

import React, { useEffect, useRef } from 'react';

const images = [
  { src: 'manila-gallery-closeup-001.jpg', cropOrigin: '50% 30%', name: 'Althea', city: 'Manila' },
  { src: 'manila-gallery-dsc-0075.jpg', cropOrigin: '50% 40%', name: 'Rina', city: 'Makati' },
  { src: 'manila-gallery-ivy-001.jpg', cropOrigin: '40% 20%', name: 'Mei', city: 'Intramuros' },
  { src: 'manila-gallery-night-001.jpg', cropOrigin: '50% 50%', name: 'Jess', city: 'BGC' },
  { src: 'manila-gallery-street-001.jpg', cropOrigin: '60% 30%', name: 'Clara', city: 'Poblacion' },
  { src: 'manila-gallery-garden-001.jpg', cropOrigin: '50% 40%', name: 'Suki', city: 'Manila' },
  { src: 'manila-gallery-canal-001.jpg', cropOrigin: '50% 50%', name: 'Ana', city: 'Escolta' },
  { src: 'manila-gallery-urban-001.jpg', cropOrigin: '50% 30%', name: 'Ivy', city: 'Makati' },
  { src: 'manila-gallery-shadow-001.jpg', cropOrigin: '50% 50%', name: 'Lena', city: 'BGC' },
  { src: 'manila-gallery-tropical-001.jpg', cropOrigin: '40% 40%', name: 'Kira', city: 'Intramuros' },
  { src: 'manila-gallery-statue-001.jpg', cropOrigin: '50% 20%', name: 'Dani', city: 'Manila' },
  { src: 'manila-gallery-dsc-0911.jpg', cropOrigin: '50% 40%', name: 'Sol', city: 'Poblacion' },
];

const CSS = `
  body > header, body > footer, .fixed.inset-x-0.bottom-0 { display: none !important; }
  html, body {
    background: #080808 !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow-x: hidden !important;
  }

  .v18-section {
    height: 160vh;
    position: relative;
  }

  .v18-sticky {
    position: sticky;
    top: 0;
    height: 100vh;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .v18-img-wrapper {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    will-change: transform;
  }

  .v18-img-wrapper img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .v18-hint {
    position: absolute;
    bottom: 14vh;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    animation: v18-float 2.5s ease-in-out infinite;
  }

  @keyframes v18-float {
    0%, 100% { opacity: 0.5; transform: translateX(-50%) translateY(0); }
    50% { opacity: 1; transform: translateX(-50%) translateY(8px); }
  }

  .v18-hero-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 5;
    pointer-events: none;
    background: radial-gradient(ellipse at center, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%);
  }

  .v18-fixed-nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 50;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 16px 20px;
    pointer-events: none;
  }

  .v18-fixed-nav a {
    pointer-events: auto;
    color: rgba(255,255,255,0.6);
    text-decoration: none;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 12px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    transition: color 0.2s;
  }

  .v18-fixed-nav a:hover { color: #fff; }

  .v18-caption {
    position: absolute;
    bottom: 24px;
    left: 20px;
    z-index: 10;
    pointer-events: none;
  }

  .v18-caption-name {
    color: rgba(255,255,255,0.85);
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 18px;
    font-weight: 400;
    margin: 0;
    line-height: 1.2;
  }

  .v18-caption-city {
    color: rgba(255,255,255,0.4);
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 11px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    margin: 4px 0 0;
  }

  .v18-section-counter {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 10;
    color: rgba(255,255,255,0.3);
    font-family: 'SF Mono', 'Fira Code', monospace;
    font-size: 12px;
    letter-spacing: 0.1em;
    pointer-events: none;
  }

  .v18-cta-section {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 24px;
    box-sizing: border-box;
  }

  .v18-cta-section input,
  .v18-cta-section textarea {
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

  .v18-cta-section input:focus,
  .v18-cta-section textarea:focus {
    border-color: rgba(255,255,255,0.35);
  }

  .v18-cta-section textarea {
    min-height: 100px;
    resize: vertical;
  }

  .v18-submit {
    width: 100%;
    max-width: 400px;
    padding: 16px;
    background: #fff;
    color: #080808;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .v18-submit:hover { opacity: 0.85; }

  .v18-vignette {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 4;
    box-shadow: inset 0 0 120px 40px rgba(8,8,8,0.7);
  }
`;

export default function V18Page() {
  const sectionsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      sectionsRef.current.forEach((section) => {
        if (!section) return;
        const wrapper = section.querySelector('.v18-img-wrapper') as HTMLElement;
        if (!wrapper) return;

        const rect = section.getBoundingClientRect();
        const sectionH = section.offsetHeight;
        const scrolledInSection = -rect.top;
        const progress = Math.max(0, Math.min(1, scrolledInSection / (sectionH - window.innerHeight)));

        const scale = 2.8 - progress * 1.8;
        wrapper.style.transform = `scale(${scale})`;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* Fixed nav */}
      <div className="v18-fixed-nav">
        <a href="#inquiry">Inquire</a>
        <div style={{ textAlign: 'right' }}>
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

      {/* Hero intro section */}
      <div className="v18-section" ref={(el) => { sectionsRef.current[0] = el; }}>
        <div className="v18-sticky">
          <div className="v18-img-wrapper">
            <img
              src={`/images/large/${images[0].src}`}
              alt={`${images[0].name} in ${images[0].city}`}
              style={{ objectPosition: images[0].cropOrigin }}
            />
          </div>
          <div className="v18-vignette" />
          <div className="v18-hero-overlay">
            <h1
              style={{
                color: '#fff',
                fontSize: 'clamp(40px, 10vw, 100px)',
                fontWeight: 300,
                letterSpacing: '0.08em',
                margin: 0,
                lineHeight: 1.1,
                textAlign: 'center',
                fontFamily: 'Georgia, serif',
              }}
            >
              Aidan<br />Torrence
            </h1>
            <p
              style={{
                color: 'rgba(255,255,255,0.5)',
                fontSize: '11px',
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                marginTop: '12px',
                fontFamily: 'system-ui, sans-serif',
              }}
            >
              Film Photographer
            </p>
          </div>
          <div className="v18-caption">
            <p className="v18-caption-name">{images[0].name}</p>
            <p className="v18-caption-city">{images[0].city}</p>
          </div>
          <div className="v18-hint">
            <svg width="20" height="28" viewBox="0 0 20 28" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round">
              <rect x="6" y="1" width="8" height="14" rx="4" />
              <line x1="10" y1="5" x2="10" y2="8" />
              <path d="M4 20l6 6 6-6" />
            </svg>
          </div>
        </div>
      </div>

      {/* Photo unravel sections */}
      {images.slice(1).map((img, i) => (
        <div
          className="v18-section"
          key={img.src}
          ref={(el) => { sectionsRef.current[i + 1] = el; }}
        >
          <div className="v18-sticky">
            <div className="v18-img-wrapper">
              <img
                src={`/images/large/${img.src}`}
                alt={`${img.name} in ${img.city}`}
                loading="lazy"
                style={{ objectPosition: img.cropOrigin }}
              />
            </div>
            <div className="v18-vignette" />
            <div className="v18-section-counter">
              {String(i + 2).padStart(2, '0')} / {images.length}
            </div>
            <div className="v18-caption">
              <p className="v18-caption-name">{img.name}</p>
              <p className="v18-caption-city">{img.city}</p>
            </div>
          </div>
        </div>
      ))}

      {/* CTA Section */}
      <div className="v18-cta-section" id="inquiry">
        <h2
          style={{
            color: '#fff',
            fontSize: '28px',
            fontWeight: 300,
            letterSpacing: '0.08em',
            marginBottom: '6px',
            fontFamily: 'Georgia, serif',
          }}
        >
          Inquiries
        </h2>
        <p
          style={{
            color: 'rgba(255,255,255,0.4)',
            fontSize: '13px',
            marginBottom: '32px',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          I&apos;ll get back to you within a few hours.
        </p>
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
          <button type="submit" className="v18-submit">
            Send Inquiry
          </button>
        </form>
        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', margin: '4px 0', fontFamily: 'system-ui, sans-serif' }}>
            aidan@aidantorrence.com
          </p>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', margin: '4px 0', fontFamily: 'system-ui, sans-serif' }}>
            WhatsApp: +49 175 8966210
          </p>
          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px', marginTop: '20px', fontFamily: 'system-ui, sans-serif' }}>
            Featured in Vogue Italia · Hypebeast · WWD
          </p>
        </div>
      </div>
    </>
  );
}
