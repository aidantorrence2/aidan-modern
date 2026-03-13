'use client';

import React from 'react';

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

const CSS = `
  body > header, body > footer, .fixed.inset-x-0.bottom-0 { display: none !important; }
  html, body {
    background: #0a0a0a !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow-x: hidden !important;
  }

  .v16-scroll-container {
    scroll-snap-type: y mandatory;
    overflow-y: scroll;
    height: 100vh;
    -webkit-overflow-scrolling: touch;
  }

  .v16-slide {
    scroll-snap-align: start;
    height: 100vh;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .v16-slide img {
    width: 100%;
    height: 80vh;
    object-fit: cover;
    display: block;
    border-radius: 0;
  }

  .v16-peek-label {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 20vh;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    pointer-events: none;
    z-index: 2;
  }

  .v16-peek-img {
    width: 100%;
    height: 100vh;
    object-fit: cover;
    object-position: top center;
    display: block;
    filter: brightness(0.7);
  }

  .v16-hero-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 3;
    pointer-events: none;
    background: linear-gradient(
      to bottom,
      rgba(0,0,0,0.1) 0%,
      rgba(0,0,0,0) 30%,
      rgba(0,0,0,0) 70%,
      rgba(0,0,0,0.4) 100%
    );
  }

  .v16-scroll-hint {
    position: absolute;
    bottom: 22vh;
    left: 50%;
    transform: translateX(-50%);
    z-index: 5;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    animation: v16-pulse 2s ease-in-out infinite;
  }

  @keyframes v16-pulse {
    0%, 100% { opacity: 0.6; transform: translateX(-50%) translateY(0); }
    50% { opacity: 1; transform: translateX(-50%) translateY(8px); }
  }

  @keyframes v16-fadein {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .v16-cta-section {
    scroll-snap-align: start;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 24px;
    box-sizing: border-box;
  }

  .v16-cta-section input,
  .v16-cta-section textarea {
    width: 100%;
    max-width: 400px;
    padding: 14px 16px;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 8px;
    color: #fff;
    font-size: 16px;
    font-family: inherit;
    outline: none;
    margin-bottom: 12px;
    transition: border-color 0.2s;
  }

  .v16-cta-section input:focus,
  .v16-cta-section textarea:focus {
    border-color: rgba(255,255,255,0.4);
  }

  .v16-cta-section textarea {
    min-height: 100px;
    resize: vertical;
  }

  .v16-submit-btn {
    width: 100%;
    max-width: 400px;
    padding: 16px;
    background: #fff;
    color: #0a0a0a;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    letter-spacing: 0.5px;
    transition: opacity 0.2s;
  }

  .v16-submit-btn:hover {
    opacity: 0.85;
  }

  @media (min-width: 768px) {
    .v16-slide img {
      width: 70%;
      border-radius: 4px;
    }
    .v16-peek-img {
      width: 70%;
      margin: 0 auto;
      border-radius: 4px 4px 0 0;
    }
  }
`;

export default function V16Page() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="v16-scroll-container">
        {/* Hero slide */}
        <div className="v16-slide">
          <img
            src={`/images/large/${images[0]}`}
            alt="Portfolio photo"
            style={{ height: '80vh' }}
          />
          <div className="v16-hero-overlay">
            <h1
              style={{
                color: '#fff',
                fontSize: '11vw',
                fontWeight: 300,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                margin: 0,
                lineHeight: 1,
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}
            >
              Aidan
            </h1>
            <p
              style={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: '3vw',
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                margin: '8px 0 0',
                fontWeight: 300,
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}
            >
              Film &middot; Fashion &middot; Editorial
            </p>
          </div>
          {/* Peek of next image */}
          <div className="v16-peek-label">
            <img
              className="v16-peek-img"
              src={`/images/large/${images[1]}`}
              alt=""
              aria-hidden="true"
            />
          </div>
          {/* Scroll hint */}
          <div className="v16-scroll-hint">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2" strokeLinecap="round">
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </div>
        </div>

        {/* Photo slides */}
        {images.slice(1).map((img, i) => {
          const nextImg = images[i + 2];
          return (
            <div className="v16-slide" key={img}>
              <img
                src={`/images/large/${img}`}
                alt={`Portfolio photo ${i + 2}`}
                loading="lazy"
                style={{ height: '80vh' }}
              />
              {nextImg && (
                <div className="v16-peek-label">
                  <img
                    className="v16-peek-img"
                    src={`/images/large/${nextImg}`}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                  />
                </div>
              )}
            </div>
          );
        })}

        {/* CTA Section */}
        <div className="v16-cta-section">
          <h2
            style={{
              color: '#fff',
              fontSize: '28px',
              fontWeight: 300,
              letterSpacing: '0.06em',
              marginBottom: '8px',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            Let&apos;s Work Together
          </h2>
          <p
            style={{
              color: 'rgba(255,255,255,0.5)',
              fontSize: '14px',
              marginBottom: '32px',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            Booking worldwide
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
            <textarea placeholder="Tell me about your project..." />
            <button type="submit" className="v16-submit-btn">
              Send Inquiry
            </button>
          </form>
          <div style={{ marginTop: '40px', textAlign: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: '4px 0', fontFamily: 'system-ui, sans-serif' }}>
              aidan@aidantorrence.com
            </p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: '4px 0', fontFamily: 'system-ui, sans-serif' }}>
              WhatsApp: +49 175 8966210
            </p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: '4px 0', fontFamily: 'system-ui, sans-serif' }}>
              @aidantorrence
            </p>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', marginTop: '20px', fontFamily: 'system-ui, sans-serif' }}>
              Featured in Vogue Italia &middot; Hypebeast &middot; WWD
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
