'use client';

import { useState, useEffect, useRef } from 'react';

const photos = [
  '/images/large/manila-gallery-night-001.jpg',
  '/images/large/manila-gallery-closeup-001.jpg',
  '/images/large/manila-gallery-street-001.jpg',
  '/images/large/manila-gallery-garden-001.jpg',
  '/images/large/manila-gallery-ivy-001.jpg',
  '/images/large/manila-gallery-canal-001.jpg',
  '/images/large/manila-gallery-shadow-001.jpg',
  '/images/large/manila-gallery-urban-001.jpg',
  '/images/large/manila-gallery-dsc-0075.jpg',
  '/images/large/manila-gallery-tropical-001.jpg',
  '/images/large/manila-gallery-market-001.jpg',
  '/images/large/manila-gallery-night-002.jpg',
  '/images/large/manila-gallery-park-001.jpg',
  '/images/large/manila-gallery-urban-002.jpg',
  '/images/large/manila-gallery-dsc-0130.jpg',
  '/images/large/manila-gallery-dsc-0190.jpg',
  '/images/large/manila-gallery-floor-001.jpg',
  '/images/large/manila-gallery-statue-001.jpg',
];

const overlayColors = [
  '#c9a96e', '#8b6e4e', '#5a7d6a', '#3d5a80', '#9b6b5a',
  '#7a6b8a', '#5c8a6a', '#a0785a', '#6a8b9b', '#8a7060',
  '#6b8a5c', '#9a6a7a', '#5a8a80', '#7a8b5a', '#8a5a6a',
  '#5a6a8a', '#8a8a5a', '#6a5a8a',
];

const CSS = `
  body > header, body > footer, .fixed.inset-x-0.bottom-0 { display: none !important; }
  html, body {
    background: #111114 !important;
    color: #eae6e0 !important;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }

  .v9-page {
    font-family: system-ui, -apple-system, sans-serif;
    min-height: 100vh;
  }
  .v9-header {
    text-align: center;
    padding: 8vh 6vw 4vh;
  }
  .v9-header h1 {
    font-family: 'Georgia', serif;
    font-size: 2rem;
    font-weight: 400;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #f5f0eb;
  }
  .v9-header p {
    font-size: 0.75rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: #6a6560;
    margin-top: 0.4rem;
  }
  .v9-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px;
    padding: 0 4px;
  }
  .v9-cell {
    position: relative;
    overflow: hidden;
    aspect-ratio: 3/4;
  }
  .v9-cell img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .v9-overlay {
    position: absolute;
    inset: 0;
    transform: translateX(0);
    transition: none;
    z-index: 2;
  }
  .v9-overlay.revealed {
    animation: curtainSlide 0.9s cubic-bezier(0.77, 0, 0.175, 1) forwards;
  }
  @keyframes curtainSlide {
    0% { transform: translateX(0); }
    100% { transform: translateX(101%); }
  }
  .v9-cell:nth-child(even) .v9-overlay.revealed {
    animation-name: curtainSlideLeft;
  }
  @keyframes curtainSlideLeft {
    0% { transform: translateX(0); }
    100% { transform: translateX(-101%); }
  }
  .v9-credits-bar {
    display: flex;
    justify-content: center;
    gap: 1rem;
    padding: 3vh 4vw;
    flex-wrap: wrap;
  }
  .v9-credit-tag {
    font-size: 0.6rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #555;
    padding: 6px 12px;
    border: 1px solid #2a2a2a;
    border-radius: 20px;
  }
  .v9-inquiry-section {
    padding: 10vh 6vw;
    text-align: center;
  }
  .v9-inquiry-section h2 {
    font-family: 'Georgia', serif;
    font-size: 1.8rem;
    font-weight: 400;
    letter-spacing: 0.1em;
    color: #f5f0eb;
    margin-bottom: 0.8rem;
  }
  .v9-inquiry-section .v9-desc {
    font-size: 0.85rem;
    color: #6a6560;
    line-height: 1.6;
    margin-bottom: 2.5rem;
    max-width: 480px;
    margin-left: auto;
    margin-right: auto;
  }
  .v9-form {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    max-width: 400px;
    margin: 0 auto;
  }
  .v9-form input, .v9-form textarea {
    background: #1a1a1d;
    border: 1px solid #2a2a2d;
    color: #eae6e0;
    padding: 14px 16px;
    font-size: 0.95rem;
    font-family: system-ui, sans-serif;
    border-radius: 6px;
    outline: none;
    transition: border-color 0.3s;
  }
  .v9-form input:focus, .v9-form textarea:focus {
    border-color: #666;
  }
  .v9-form textarea {
    min-height: 110px;
    resize: vertical;
  }
  .v9-form button {
    background: #eae6e0;
    color: #111114;
    border: none;
    padding: 16px;
    font-size: 0.8rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    cursor: pointer;
    font-family: system-ui, sans-serif;
    font-weight: 600;
    border-radius: 6px;
    transition: opacity 0.3s;
  }
  .v9-form button:hover {
    opacity: 0.85;
  }
  .v9-footer {
    text-align: center;
    padding: 3vh 6vw 6vh;
    font-size: 0.7rem;
    color: #444;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
  .v9-footer a {
    color: #777;
    text-decoration: none;
    margin: 0 0.5rem;
  }

  @media (min-width: 768px) {
    .v9-grid {
      grid-template-columns: 1fr 1fr 1fr;
      gap: 6px;
      padding: 0 6px;
    }
    .v9-header h1 { font-size: 2.8rem; }
    .v9-cell { aspect-ratio: 2/3; }
  }
`;

export default function V9Page() {
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const cellRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute('data-idx'));
            if (!isNaN(idx)) {
              // Stagger reveal based on position
              const col = idx % 2; // 2 cols on mobile
              const delay = col * 200;
              setTimeout(() => {
                setRevealed((prev) => new Set(prev).add(idx));
              }, delay);
              observer.unobserve(entry.target);
            }
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );

    cellRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="v9-page">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="v9-header">
        <h1>Aidan Torrence</h1>
        <p>Film &middot; Fashion &middot; Editorial</p>
      </div>

      <div className="v9-credits-bar">
        <span className="v9-credit-tag">Vogue Italia</span>
        <span className="v9-credit-tag">Hypebeast</span>
        <span className="v9-credit-tag">WWD</span>
      </div>

      <div className="v9-grid">
        {photos.map((src, i) => (
          <div
            key={i}
            className="v9-cell"
            data-idx={i}
            ref={(el) => { cellRefs.current[i] = el; }}
          >
            <img
              src={src}
              alt={`Portfolio photo ${i + 1}`}
              loading={i < 4 ? 'eager' : 'lazy'}
              decoding="async"
            />
            <div
              className={`v9-overlay ${revealed.has(i) ? 'revealed' : ''}`}
              style={{ backgroundColor: overlayColors[i % overlayColors.length] }}
            />
          </div>
        ))}
      </div>

      <div className="v9-inquiry-section">
        <h2>Inquire</h2>
        <p className="v9-desc">
          Based between Bangkok and Europe, booking worldwide.
          Film, fashion, and editorial photography for brands and creatives.
        </p>
        <form
          className="v9-form"
          onSubmit={(e) => {
            e.preventDefault();
            window.location.href = `mailto:aidan@aidantorrence.com?subject=Inquiry from ${formData.name}&body=${formData.message}`;
          }}
        >
          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <textarea
            placeholder="Tell me about your project..."
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          />
          <button type="submit">Send Inquiry</button>
        </form>
      </div>

      <div className="v9-footer">
        <a href="mailto:aidan@aidantorrence.com">Email</a>
        <a href="https://instagram.com/aidantorrence" target="_blank" rel="noopener noreferrer">Instagram</a>
        <a href="https://wa.me/491758966210" target="_blank" rel="noopener noreferrer">WhatsApp</a>
      </div>
    </div>
  );
}
