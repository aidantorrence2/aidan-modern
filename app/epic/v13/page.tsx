'use client';

import { useState, useEffect } from 'react';

const photos = [
  'manila-gallery-canal-001.jpg',
  'manila-gallery-closeup-001.jpg',
  'manila-gallery-dsc-0075.jpg',
  'manila-gallery-garden-001.jpg',
  'manila-gallery-ivy-001.jpg',
  'manila-gallery-night-001.jpg',
  'manila-gallery-street-001.jpg',
  'manila-gallery-urban-001.jpg',
  'manila-gallery-shadow-001.jpg',
  'manila-gallery-tropical-001.jpg',
  'manila-gallery-market-001.jpg',
  'manila-gallery-dsc-0130.jpg',
  'manila-gallery-park-001.jpg',
  'manila-gallery-night-002.jpg',
  'manila-gallery-canal-002.jpg',
  'manila-gallery-ivy-002.jpg',
  'manila-gallery-dsc-0190.jpg',
  'manila-gallery-urban-002.jpg',
  'manila-gallery-garden-002.jpg',
  'manila-gallery-floor-001.jpg',
  'manila-gallery-white-001.jpg',
  'manila-gallery-statue-001.jpg',
  'manila-gallery-night-003.jpg',
  'manila-gallery-urban-003.jpg',
  'manila-gallery-dsc-0911.jpg',
];

const rotations = photos.map(() => (Math.random() - 0.5) * 8);

const CSS = `
  body > header, body > footer, .fixed.inset-x-0.bottom-0 { display: none !important; }
  html, body { background: #1a1a1a !important; margin: 0; }

  @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;600&display=swap');

  .polaroid-name {
    font-family: 'Caveat', cursive;
    font-size: 2.5rem;
    color: #f0ece4;
    text-align: center;
    padding: 2rem 1rem 1rem;
    letter-spacing: 0.02em;
  }
  .polaroid-sub {
    font-family: 'Caveat', cursive;
    font-size: 1.1rem;
    color: #999;
    text-align: center;
    margin-top: -0.5rem;
    padding-bottom: 1.5rem;
  }

  .polaroid-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    padding: 0.5rem 0.75rem;
    max-width: 900px;
    margin: 0 auto;
  }
  @media (min-width: 640px) {
    .polaroid-grid {
      grid-template-columns: 1fr 1fr 1fr;
      gap: 1.5rem;
      padding: 1rem 2rem;
    }
  }

  .polaroid {
    background: #fff;
    padding: 8px 8px 36px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.3);
    opacity: 0;
    transform: translateY(40px) scale(0.92);
    transition: opacity 0.6s ease, transform 0.6s ease, box-shadow 0.3s ease;
    cursor: pointer;
  }
  .polaroid.visible {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  .polaroid:hover {
    box-shadow: 0 8px 32px rgba(0,0,0,0.7), 0 2px 8px rgba(0,0,0,0.4);
    z-index: 2;
  }
  @media (min-width: 640px) {
    .polaroid { padding: 10px 10px 44px; }
  }

  .polaroid img {
    width: 100%;
    aspect-ratio: 4/5;
    object-fit: cover;
    display: block;
  }

  .inquiry-section {
    max-width: 480px;
    margin: 3rem auto;
    padding: 2rem 1.25rem;
    text-align: center;
  }
  .inquiry-section h2 {
    font-family: 'Caveat', cursive;
    font-size: 2rem;
    color: #f0ece4;
    margin-bottom: 0.5rem;
  }
  .inquiry-section p {
    color: #999;
    font-size: 0.9rem;
    line-height: 1.6;
    margin-bottom: 1.5rem;
    font-family: system-ui, sans-serif;
  }
  .inquiry-section input,
  .inquiry-section textarea {
    width: 100%;
    box-sizing: border-box;
    padding: 0.75rem 1rem;
    margin-bottom: 0.75rem;
    border: 1px solid #444;
    border-radius: 4px;
    background: #2a2a2a;
    color: #eee;
    font-size: 0.95rem;
    font-family: system-ui, sans-serif;
  }
  .inquiry-section textarea { min-height: 100px; resize: vertical; }
  .inquiry-section input::placeholder,
  .inquiry-section textarea::placeholder { color: #777; }
  .inquiry-btn {
    display: inline-block;
    padding: 0.85rem 2.5rem;
    background: #f0ece4;
    color: #1a1a1a;
    font-family: 'Caveat', cursive;
    font-size: 1.3rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.2s;
  }
  .inquiry-btn:hover { background: #ddd8ce; }

  .contact-links {
    display: flex;
    gap: 1.25rem;
    justify-content: center;
    flex-wrap: wrap;
    margin-top: 1rem;
  }
  .contact-links a {
    color: #bbb;
    font-size: 0.85rem;
    text-decoration: none;
    font-family: system-ui, sans-serif;
  }
  .contact-links a:hover { color: #f0ece4; }

  .credits-line {
    text-align: center;
    color: #555;
    font-size: 0.75rem;
    font-family: system-ui, sans-serif;
    padding: 2rem 1rem 3rem;
  }

  .lightbox-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.92);
    z-index: 1000;
    display: flex; align-items: center; justify-content: center;
    cursor: zoom-out;
    animation: lbFade 0.25s ease;
  }
  @keyframes lbFade { from { opacity: 0; } to { opacity: 1; } }
  .lightbox-overlay img {
    max-width: 94vw; max-height: 92vh;
    object-fit: contain;
    border-radius: 2px;
  }
`;

export default function PolaroidScatter() {
  const [visibleSet, setVisibleSet] = useState<Set<number>>(new Set());
  const [lightbox, setLightbox] = useState<number | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const idx = Number(e.target.getAttribute('data-idx'));
            setVisibleSet((prev) => new Set(prev).add(idx));
            observer.unobserve(e.target);
          }
        });
      },
      { rootMargin: '60px', threshold: 0.1 }
    );
    document.querySelectorAll('.polaroid').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (lightbox !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [lightbox]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="polaroid-name">Aidan Torrence</div>
      <div className="polaroid-sub">Film &middot; Fashion &middot; Editorial Photography</div>

      <div className="polaroid-grid">
        {photos.map((p, i) => (
          <div
            key={p}
            className={`polaroid ${visibleSet.has(i) ? 'visible' : ''}`}
            data-idx={i}
            style={{ transform: visibleSet.has(i) ? `rotate(${rotations[i]}deg)` : undefined }}
            onClick={() => setLightbox(i)}
          >
            <img
              src={`/images/large/${p}`}
              alt={`Photo ${i + 1}`}
              loading={i < 4 ? 'eager' : 'lazy'}
              draggable={false}
            />
          </div>
        ))}
      </div>

      <div className="inquiry-section">
        <h2>Let&apos;s Create Together</h2>
        <p>
          Based between Bangkok and Europe, booking worldwide.
          Featured in Vogue Italia, Hypebeast, WWD.
        </p>
        <form onSubmit={(e) => { e.preventDefault(); window.location.href = 'mailto:aidan@aidantorrence.com'; }}>
          <input type="text" placeholder="Your Name" />
          <input type="email" placeholder="Email" />
          <textarea placeholder="Tell me about your project..." />
          <button type="submit" className="inquiry-btn">Send Inquiry</button>
        </form>
        <div className="contact-links">
          <a href="mailto:aidan@aidantorrence.com">aidan@aidantorrence.com</a>
          <a href="https://wa.me/491758966210">WhatsApp</a>
          <a href="https://instagram.com/aidantorrence" target="_blank" rel="noopener">@aidantorrence</a>
        </div>
      </div>

      <div className="credits-line">
        &copy; {new Date().getFullYear()} Aidan Torrence. All rights reserved.
      </div>

      {lightbox !== null && (
        <div className="lightbox-overlay" onClick={() => setLightbox(null)}>
          <img src={`/images/large/${photos[lightbox]}`} alt={`Photo ${lightbox + 1}`} />
        </div>
      )}
    </>
  );
}
