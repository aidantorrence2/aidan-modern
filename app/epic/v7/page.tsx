'use client';

import { useState } from 'react';

const photos = [
  '/images/large/manila-gallery-night-001.jpg',
  '/images/large/manila-gallery-closeup-001.jpg',
  '/images/large/manila-gallery-street-001.jpg',
  '/images/large/manila-gallery-garden-001.jpg',
  '/images/large/manila-gallery-urban-001.jpg',
  '/images/large/manila-gallery-canal-001.jpg',
  '/images/large/manila-gallery-shadow-001.jpg',
  '/images/large/manila-gallery-ivy-001.jpg',
  '/images/large/manila-gallery-dsc-0075.jpg',
  '/images/large/manila-gallery-tropical-001.jpg',
  '/images/large/manila-gallery-market-001.jpg',
  '/images/large/manila-gallery-night-002.jpg',
  '/images/large/manila-gallery-park-001.jpg',
  '/images/large/manila-gallery-urban-002.jpg',
  '/images/large/manila-gallery-dsc-0130.jpg',
  '/images/large/manila-gallery-floor-001.jpg',
  '/images/large/manila-gallery-statue-001.jpg',
  '/images/large/manila-gallery-white-001.jpg',
];

const CSS = `
  body > header, body > footer, .fixed.inset-x-0.bottom-0 { display: none !important; }
  html, body {
    background: #0a0a0a !important;
    color: #e8e4df !important;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(40px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .v7-photo-section {
    animation: fadeUp 0.8s ease-out both;
  }
  .v7-hero-img {
    width: 100%;
    height: 85vh;
    object-fit: cover;
    display: block;
  }
  .v7-photo-img {
    width: 100%;
    max-height: 90vh;
    object-fit: contain;
    display: block;
  }
  .v7-header {
    padding: 10vh 6vw 4vh;
    text-align: center;
  }
  .v7-header h1 {
    font-family: 'Georgia', serif;
    font-size: 2.4rem;
    font-weight: 400;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #f5f0eb;
    margin-bottom: 0.5rem;
  }
  .v7-header p {
    font-family: system-ui, sans-serif;
    font-size: 0.85rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: #8a8580;
  }
  .v7-section {
    padding: 8vh 0;
  }
  .v7-inquiry {
    padding: 12vh 6vw;
    text-align: center;
  }
  .v7-inquiry h2 {
    font-family: 'Georgia', serif;
    font-size: 1.8rem;
    font-weight: 400;
    letter-spacing: 0.1em;
    margin-bottom: 1.5rem;
    color: #f5f0eb;
  }
  .v7-inquiry p {
    font-size: 0.9rem;
    color: #8a8580;
    line-height: 1.6;
    margin-bottom: 2rem;
    max-width: 480px;
    margin-left: auto;
    margin-right: auto;
  }
  .v7-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 400px;
    margin: 0 auto;
  }
  .v7-form input, .v7-form textarea {
    background: #1a1a1a;
    border: 1px solid #333;
    color: #e8e4df;
    padding: 14px 16px;
    font-size: 0.95rem;
    font-family: system-ui, sans-serif;
    border-radius: 2px;
    outline: none;
    transition: border-color 0.3s;
  }
  .v7-form input:focus, .v7-form textarea:focus {
    border-color: #8a8580;
  }
  .v7-form textarea {
    min-height: 120px;
    resize: vertical;
  }
  .v7-form button {
    background: #f5f0eb;
    color: #0a0a0a;
    border: none;
    padding: 16px;
    font-size: 0.85rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    cursor: pointer;
    font-family: system-ui, sans-serif;
    font-weight: 600;
    transition: opacity 0.3s;
  }
  .v7-form button:hover {
    opacity: 0.85;
  }
  .v7-credits {
    text-align: center;
    padding: 4vh 6vw 8vh;
    font-size: 0.75rem;
    color: #555;
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }
  .v7-credits a {
    color: #8a8580;
    text-decoration: none;
  }

  @media (min-width: 768px) {
    .v7-hero-img { height: 90vh; }
    .v7-header h1 { font-size: 3.2rem; }
    .v7-section { padding: 10vh 8vw; }
    .v7-photo-img { max-height: 85vh; margin: 0 auto; max-width: 900px; }
  }
`;

export default function V7Page() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* Hero — single powerful photo */}
      <div className="v7-photo-section">
        <img
          src={photos[0]}
          alt="Portfolio photo"
          className="v7-hero-img"
          loading="eager"
          decoding="async"
        />
      </div>

      {/* Title block */}
      <div className="v7-header">
        <h1>Aidan Torrence</h1>
        <p>Film &middot; Fashion &middot; Editorial</p>
      </div>

      {/* Each photo in its own section */}
      {photos.slice(1).map((src, i) => (
        <div key={i} className="v7-section v7-photo-section">
          <img
            src={src}
            alt={`Portfolio photo ${i + 2}`}
            className="v7-photo-img"
            loading="lazy"
            decoding="async"
          />
        </div>
      ))}

      {/* Inquiry section */}
      <div className="v7-inquiry">
        <h2>Let&apos;s Work Together</h2>
        <p>
          Based between Bangkok and Europe, booking worldwide.
          Featured in Vogue Italia, Hypebeast, WWD.
        </p>
        <form
          className="v7-form"
          onSubmit={(e) => {
            e.preventDefault();
            window.location.href = `mailto:aidan@aidantorrence.com?subject=Inquiry from ${formData.name}&body=${formData.message}`;
          }}
        >
          <input
            type="text"
            placeholder="Your name"
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

      {/* Credits footer */}
      <div className="v7-credits">
        <a href="mailto:aidan@aidantorrence.com">aidan@aidantorrence.com</a>
        {' '}&middot;{' '}
        <a href="https://instagram.com/aidantorrence" target="_blank" rel="noopener noreferrer">@aidantorrence</a>
        {' '}&middot;{' '}
        <a href="https://wa.me/491758966210" target="_blank" rel="noopener noreferrer">WhatsApp</a>
      </div>
    </>
  );
}
