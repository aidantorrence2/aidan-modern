'use client';

import React, { useState } from 'react';

const images = [
  'manila-gallery-street-001.jpg',
  'manila-gallery-night-001.jpg',
  'manila-gallery-dsc-0075.jpg',
  'manila-gallery-urban-001.jpg',
  'manila-gallery-canal-001.jpg',
  'manila-gallery-garden-001.jpg',
  'manila-gallery-closeup-001.jpg',
  'manila-gallery-shadow-001.jpg',
  'manila-gallery-dsc-0130.jpg',
  'manila-gallery-night-002.jpg',
  'manila-gallery-tropical-001.jpg',
  'manila-gallery-ivy-001.jpg',
  'manila-gallery-market-001.jpg',
  'manila-gallery-park-001.jpg',
  'manila-gallery-urban-002.jpg',
  'manila-gallery-dsc-0190.jpg',
  'manila-gallery-floor-001.jpg',
  'manila-gallery-statue-001.jpg',
  'manila-gallery-night-003.jpg',
  'manila-gallery-white-001.jpg',
  'manila-gallery-garden-002.jpg',
  'manila-gallery-canal-002.jpg',
  'manila-gallery-ivy-002.jpg',
  'manila-gallery-urban-003.jpg',
  'manila-gallery-dsc-0911.jpg',
];

const CSS = `
  body > header, body > footer, .fixed.inset-x-0.bottom-0 { display: none !important; }
  html, body { background: #0a0a0a !important; margin: 0; padding: 0; }
  * { box-sizing: border-box; }

  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Inter:wght@300;400;700;900&display=swap');

  .hero-name {
    font-family: 'Inter', sans-serif;
    font-weight: 900;
    font-size: clamp(72px, 18vw, 220px);
    line-height: 0.88;
    letter-spacing: -0.04em;
    color: #fff;
    text-transform: uppercase;
    mix-blend-mode: difference;
    position: relative;
    z-index: 2;
    user-select: none;
  }

  .hero-wrap {
    position: relative;
    overflow: hidden;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 24px 16px;
  }

  .hero-bg {
    position: absolute;
    inset: 0;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 4px;
    z-index: 1;
    opacity: 0.55;
  }

  .hero-bg img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .subtitle {
    font-family: 'Space Mono', monospace;
    color: #999;
    font-size: 12px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    margin-top: 24px;
    position: relative;
    z-index: 2;
  }

  .grid-section {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2px;
    padding: 2px;
  }

  .grid-section img {
    width: 100%;
    aspect-ratio: 3/4;
    object-fit: cover;
    display: block;
    transition: transform 0.3s ease;
  }

  .grid-section .wide {
    grid-column: span 2;
    aspect-ratio: 16/9;
  }

  @media (min-width: 768px) {
    .grid-section {
      grid-template-columns: 1fr 1fr 1fr;
    }
    .grid-section .wide {
      grid-column: span 2;
    }
  }

  .cta-section {
    padding: 60px 20px;
    text-align: center;
    font-family: 'Inter', sans-serif;
  }

  .cta-section h2 {
    font-size: clamp(28px, 6vw, 48px);
    font-weight: 900;
    color: #fff;
    text-transform: uppercase;
    margin: 0 0 12px;
    letter-spacing: -0.02em;
  }

  .cta-section p {
    color: #888;
    font-family: 'Space Mono', monospace;
    font-size: 13px;
    margin: 0 0 32px;
    letter-spacing: 0.05em;
  }

  .cta-section .credits {
    color: #555;
    font-size: 11px;
    font-family: 'Space Mono', monospace;
    margin-top: 40px;
    letter-spacing: 0.1em;
  }

  .cta-btn {
    display: inline-block;
    background: #fff;
    color: #0a0a0a;
    font-family: 'Inter', sans-serif;
    font-weight: 700;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    padding: 16px 40px;
    border: none;
    cursor: pointer;
    text-decoration: none;
    transition: background 0.2s, color 0.2s;
  }

  .cta-btn:hover {
    background: #e0e0e0;
  }

  .contact-row {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    justify-content: center;
    margin-top: 24px;
  }

  .contact-row a {
    color: #aaa;
    font-family: 'Space Mono', monospace;
    font-size: 12px;
    text-decoration: none;
    letter-spacing: 0.05em;
    transition: color 0.2s;
  }

  .contact-row a:hover {
    color: #fff;
  }

  .scroll-hint {
    position: absolute;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 3;
    animation: pulse 2s ease-in-out infinite;
  }

  .scroll-hint span {
    display: block;
    width: 1px;
    height: 40px;
    background: #fff;
    opacity: 0.4;
  }

  @keyframes pulse {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 1; }
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .fade-in {
    animation: fadeUp 0.6s ease forwards;
  }
`;

export default function V10BrutalistTypography() {
  const heroImages = images.slice(0, 4);
  const gridImages = images.slice(4);
  const wideIndices = [2, 7, 13];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* Hero */}
      <div className="hero-wrap">
        <div className="hero-bg">
          {heroImages.map((img, i) => (
            <img
              key={i}
              src={`/images/large/${img}`}
              alt=""
              loading={i < 2 ? 'eager' : 'lazy'}
            />
          ))}
        </div>
        <div className="hero-name fade-in">
          AIDAN<br />
          TORRENCE
        </div>
        <div className="subtitle fade-in" style={{ animationDelay: '0.2s' }}>
          Film &middot; Fashion &middot; Editorial Photography
        </div>
        <div className="scroll-hint">
          <span />
        </div>
      </div>

      {/* Grid */}
      <div className="grid-section">
        {gridImages.map((img, i) => (
          <img
            key={i}
            src={`/images/large/${img}`}
            alt={`Photography by Aidan Torrence ${i + 1}`}
            loading="lazy"
            className={wideIndices.includes(i) ? 'wide' : ''}
          />
        ))}
      </div>

      {/* CTA */}
      <div className="cta-section">
        <h2>Let&apos;s Create</h2>
        <p>Booking worldwide &middot; Based between Bangkok &amp; Europe</p>
        <a className="cta-btn" href="mailto:aidan@aidantorrence.com">
          Inquire Now
        </a>
        <div className="contact-row">
          <a href="mailto:aidan@aidantorrence.com">aidan@aidantorrence.com</a>
          <a href="https://wa.me/491758966210">WhatsApp</a>
          <a href="https://instagram.com/aidantorrence" target="_blank" rel="noopener noreferrer">
            @aidantorrence
          </a>
        </div>
        <div className="credits">
          Featured in Vogue Italia &middot; Hypebeast &middot; WWD
        </div>
      </div>
    </>
  );
}
