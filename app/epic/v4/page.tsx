'use client';

import { useState, useEffect } from 'react';

const images = [
  'manila-gallery-canal-001.jpg',
  'manila-gallery-night-001.jpg',
  'manila-gallery-closeup-001.jpg',
  'manila-gallery-dsc-0075.jpg',
  'manila-gallery-garden-001.jpg',
  'manila-gallery-street-001.jpg',
  'manila-gallery-ivy-001.jpg',
  'manila-gallery-dsc-0130.jpg',
  'manila-gallery-urban-001.jpg',
  'manila-gallery-night-002.jpg',
  'manila-gallery-tropical-001.jpg',
  'manila-gallery-shadow-001.jpg',
  'manila-gallery-market-001.jpg',
  'manila-gallery-dsc-0190.jpg',
  'manila-gallery-park-001.jpg',
  'manila-gallery-canal-002.jpg',
  'manila-gallery-garden-002.jpg',
  'manila-gallery-dsc-0911.jpg',
  'manila-gallery-urban-002.jpg',
  'manila-gallery-night-003.jpg',
  'manila-gallery-ivy-002.jpg',
  'manila-gallery-floor-001.jpg',
  'manila-gallery-statue-001.jpg',
  'manila-gallery-white-001.jpg',
  'manila-gallery-urban-003.jpg',
];

const CSS = `
  body > header, body > footer, .fixed.inset-x-0.bottom-0 { display: none !important; }
  html, body { background: #0a0a0a !important; margin: 0; padding: 0; }

  .v4-header {
    position: sticky;
    top: 0;
    z-index: 50;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 16px;
    background: rgba(10,10,10,0.92);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }

  .v4-name {
    font-family: -apple-system, 'Helvetica Neue', sans-serif;
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    color: #e0e0e0;
  }

  .v4-inquire {
    font-family: -apple-system, 'Helvetica Neue', sans-serif;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: #999;
    text-decoration: none;
    padding: 6px 14px;
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 2px;
    transition: all 0.2s ease;
  }

  .v4-inquire:hover {
    color: #fff;
    border-color: rgba(255,255,255,0.4);
  }

  .v4-grid {
    display: columns;
    columns: 2;
    column-gap: 4px;
    padding: 4px;
  }

  .v4-grid-item {
    break-inside: avoid;
    margin-bottom: 4px;
    cursor: pointer;
    overflow: hidden;
    border-radius: 1px;
    position: relative;
  }

  .v4-grid-item img {
    display: block;
    width: 100%;
    height: auto;
    transition: transform 0.4s ease, filter 0.4s ease;
  }

  .v4-grid-item:hover img {
    transform: scale(1.03);
  }

  .v4-overlay {
    position: fixed;
    inset: 0;
    z-index: 100;
    background: rgba(0,0,0,0.95);
    display: flex;
    align-items: center;
    justify-content: center;
    animation: v4FadeIn 0.25s ease;
    cursor: pointer;
  }

  .v4-overlay img {
    max-width: 96vw;
    max-height: 94vh;
    object-fit: contain;
    border-radius: 2px;
  }

  .v4-close {
    position: absolute;
    top: 16px;
    right: 16px;
    color: #fff;
    font-size: 28px;
    background: none;
    border: none;
    cursor: pointer;
    opacity: 0.7;
    transition: opacity 0.2s;
    z-index: 101;
    line-height: 1;
    padding: 8px;
  }

  .v4-close:hover { opacity: 1; }

  .v4-footer {
    padding: 48px 16px 32px;
    text-align: center;
    color: #666;
    font-family: -apple-system, 'Helvetica Neue', sans-serif;
    font-size: 12px;
    letter-spacing: 1px;
  }

  .v4-footer a {
    color: #999;
    text-decoration: none;
    transition: color 0.2s;
  }

  .v4-footer a:hover { color: #fff; }

  .v4-contact-section {
    padding: 60px 20px 40px;
    text-align: center;
    border-top: 1px solid rgba(255,255,255,0.06);
  }

  .v4-contact-section h2 {
    font-family: -apple-system, 'Helvetica Neue', sans-serif;
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: #888;
    margin: 0 0 24px;
  }

  .v4-contact-links {
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: center;
  }

  .v4-contact-links a {
    color: #bbb;
    text-decoration: none;
    font-size: 13px;
    letter-spacing: 0.5px;
    transition: color 0.2s;
  }

  .v4-contact-links a:hover { color: #fff; }

  @keyframes v4FadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @media (min-width: 768px) {
    .v4-grid { columns: 3; column-gap: 6px; padding: 6px; }
    .v4-grid-item { margin-bottom: 6px; }
    .v4-header { padding: 20px 32px; }
    .v4-name { font-size: 15px; }
  }

  @media (min-width: 1200px) {
    .v4-grid { max-width: 1400px; margin: 0 auto; column-gap: 8px; padding: 8px; }
    .v4-grid-item { margin-bottom: 8px; }
  }
`;

export default function V4Page() {
  const [lightbox, setLightbox] = useState<number | null>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null);
      if (lightbox !== null) {
        if (e.key === 'ArrowRight') setLightbox((lightbox + 1) % images.length);
        if (e.key === 'ArrowLeft') setLightbox((lightbox - 1 + images.length) % images.length);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightbox]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="v4-header">
        <span className="v4-name">Aidan Torrence</span>
        <a className="v4-inquire" href="#contact">Inquire</a>
      </div>

      <div className="v4-grid">
        {images.map((img, i) => (
          <div key={img} className="v4-grid-item" onClick={() => setLightbox(i)}>
            <img
              src={`/images/large/${img}`}
              alt={`Portfolio photo ${i + 1}`}
              loading={i < 4 ? 'eager' : 'lazy'}
              decoding="async"
            />
          </div>
        ))}
      </div>

      <div id="contact" className="v4-contact-section">
        <h2>Work with me</h2>
        <div className="v4-contact-links">
          <a href="mailto:aidan@aidantorrence.com">aidan@aidantorrence.com</a>
          <a href="https://wa.me/491758966210">WhatsApp: +49 175 8966210</a>
          <a href="https://instagram.com/aidantorrence" target="_blank" rel="noopener">@aidantorrence</a>
        </div>
        <p style={{ color: '#555', fontSize: '11px', marginTop: '20px', letterSpacing: '0.5px' }}>
          Based between Bangkok &amp; Europe &middot; Booking worldwide
        </p>
        <p style={{ color: '#444', fontSize: '10px', marginTop: '8px', letterSpacing: '0.5px' }}>
          Featured in Vogue Italia &middot; Hypebeast &middot; WWD
        </p>
      </div>

      <div className="v4-footer">
        &copy; {new Date().getFullYear()} Aidan Torrence &middot; Film &middot; Fashion &middot; Editorial
      </div>

      {lightbox !== null && (
        <div className="v4-overlay" onClick={() => setLightbox(null)}>
          <button className="v4-close" onClick={(e) => { e.stopPropagation(); setLightbox(null); }}>&times;</button>
          <img
            src={`/images/large/${images[lightbox]}`}
            alt={`Portfolio photo ${lightbox + 1}`}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
