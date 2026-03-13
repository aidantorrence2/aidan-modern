'use client';

import React, { useEffect, useRef } from 'react';

const CSS = `
  html, body {
    background: #0e0e0e !important;
    color: #f0ece4 !important;
    margin: 0; padding: 0;
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
  }
  body > header, body > footer, .fixed.inset-x-0.bottom-0 { display: none !important; }

  .wf-hero {
    min-height: 100vh; min-height: 100svh;
    display: flex; flex-direction: column;
    justify-content: flex-end;
    padding: 0 24px 0;
    position: relative;
  }
  .wf-hero h1 {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: 11vw; font-weight: 300; letter-spacing: -0.03em;
    line-height: 1; margin: 0; text-transform: uppercase;
    color: #f0ece4;
  }
  .wf-hero .subtitle {
    font-size: 12px; letter-spacing: 0.3em; text-transform: uppercase;
    color: rgba(240,236,228,0.5); margin-top: 12px; font-weight: 400;
  }

  /* Teaser strip — shows tops of first images */
  .wf-teaser {
    display: flex; gap: 12px;
    padding: 40px 24px 0;
    overflow: hidden;
    height: 30vh;
    align-items: flex-start;
  }
  .wf-teaser img {
    width: 42%; flex-shrink: 0;
    height: 55vh;
    object-fit: cover;
    border-radius: 4px;
  }
  .wf-teaser img:nth-child(2) { margin-top: 60px; }
  .wf-teaser img:nth-child(3) { margin-top: 20px; }

  .wf-scroll-hint {
    text-align: center; padding: 20px 0 8px;
    font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase;
    color: rgba(240,236,228,0.35);
    animation: wfPulse 2s ease-in-out infinite;
  }
  @keyframes wfPulse {
    0%,100% { opacity: 0.35; transform: translateY(0); }
    50% { opacity: 0.7; transform: translateY(4px); }
  }

  /* Waterfall images */
  .wf-image-wrap {
    padding: 0 12px;
    margin-bottom: -40px;
    position: relative;
    opacity: 0;
    transform: translateY(60px);
    transition: opacity 0.7s ease, transform 0.7s ease;
  }
  .wf-image-wrap.visible {
    opacity: 1; transform: translateY(0);
  }
  .wf-image-wrap.align-left { padding-right: 20%; }
  .wf-image-wrap.align-right { padding-left: 20%; }

  .wf-image-wrap img {
    width: 100%; display: block;
    border-radius: 4px;
    object-fit: cover;
  }

  /* Counter badge */
  .wf-counter {
    position: absolute; bottom: 20px;
    font-size: 10px; letter-spacing: 0.2em;
    color: rgba(240,236,228,0.4); font-weight: 400;
    text-transform: uppercase;
  }
  .align-left .wf-counter { right: calc(20% + 12px); }
  .align-right .wf-counter { left: calc(20% + 12px); }

  /* Inquiry section */
  .wf-inquiry {
    padding: 100px 24px 60px;
    text-align: center;
  }
  .wf-inquiry h2 {
    font-size: 28px; font-weight: 300; letter-spacing: -0.02em;
    margin: 0 0 12px; color: #f0ece4;
  }
  .wf-inquiry p {
    font-size: 13px; color: rgba(240,236,228,0.5);
    margin: 0 0 32px; line-height: 1.6;
  }
  .wf-inquiry a.cta {
    display: inline-block;
    padding: 14px 40px;
    border: 1px solid rgba(240,236,228,0.3);
    color: #f0ece4;
    text-decoration: none;
    font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase;
    transition: background 0.3s, color 0.3s;
  }
  .wf-inquiry a.cta:hover {
    background: #f0ece4; color: #0e0e0e;
  }
  .wf-credits {
    font-size: 10px; color: rgba(240,236,228,0.3);
    letter-spacing: 0.15em; text-transform: uppercase;
    margin-top: 24px;
  }
  .wf-contact-row {
    display: flex; gap: 20px; justify-content: center;
    flex-wrap: wrap; margin-top: 20px;
  }
  .wf-contact-row a {
    font-size: 11px; color: rgba(240,236,228,0.45);
    text-decoration: none; letter-spacing: 0.1em;
  }

  @media (min-width: 640px) {
    .wf-hero h1 { font-size: 7vw; }
    .wf-image-wrap.align-left { padding-right: 30%; }
    .wf-image-wrap.align-right { padding-left: 30%; }
    .wf-teaser img { width: 30%; }
  }
`;

const images = [
  'manila-gallery-dsc-0075.jpg',
  'manila-gallery-night-001.jpg',
  'manila-gallery-garden-001.jpg',
  'manila-gallery-street-001.jpg',
  'manila-gallery-canal-001.jpg',
  'manila-gallery-closeup-001.jpg',
  'manila-gallery-urban-001.jpg',
  'manila-gallery-ivy-001.jpg',
  'manila-gallery-shadow-001.jpg',
  'manila-gallery-dsc-0130.jpg',
  'manila-gallery-tropical-001.jpg',
  'manila-gallery-market-001.jpg',
  'manila-gallery-night-002.jpg',
  'manila-gallery-park-001.jpg',
  'manila-gallery-dsc-0190.jpg',
  'manila-gallery-floor-001.jpg',
  'manila-gallery-urban-002.jpg',
  'manila-gallery-canal-002.jpg',
  'manila-gallery-garden-002.jpg',
  'manila-gallery-statue-001.jpg',
  'manila-gallery-white-001.jpg',
  'manila-gallery-ivy-002.jpg',
  'manila-gallery-night-003.jpg',
  'manila-gallery-dsc-0911.jpg',
  'manila-gallery-urban-003.jpg',
];

// Teaser uses first 3, waterfall uses the rest
const teaserImages = images.slice(0, 3);
const waterfallImages = images.slice(3);

export default function V19WaterfallCascade() {
  const waterfallRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    waterfallRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* Hero */}
      <div className="wf-hero">
        <h1>Aidan<br />Torrence</h1>
        <div className="subtitle">Film · Fashion · Editorial</div>
      </div>

      {/* Teaser strip — cropped tops of images visible above fold */}
      <div className="wf-teaser">
        {teaserImages.map((src, i) => (
          <img
            key={i}
            src={`/images/large/${src}`}
            alt=""
            loading={i === 0 ? undefined : 'lazy'}
          />
        ))}
      </div>

      <div className="wf-scroll-hint">Scroll to explore ↓</div>

      {/* Waterfall cascade */}
      {waterfallImages.map((src, i) => {
        const align = i % 2 === 0 ? 'align-left' : 'align-right';
        return (
          <div
            key={i}
            ref={(el) => { waterfallRefs.current[i] = el; }}
            className={`wf-image-wrap ${align}`}
            style={{ marginTop: i === 0 ? 60 : undefined }}
          >
            <img
              src={`/images/large/${src}`}
              alt=""
              loading="lazy"
              style={{ aspectRatio: i % 3 === 0 ? '3/4' : '4/5' }}
            />
            <div className="wf-counter">
              {String(i + 4).padStart(2, '0')} / {images.length}
            </div>
          </div>
        );
      })}

      {/* Inquiry */}
      <div className="wf-inquiry">
        <h2>Let&apos;s create something together</h2>
        <p>
          Film &amp; editorial sessions available worldwide.
          <br />
          Featured in Vogue Italia, Hypebeast, WWD.
        </p>
        <a className="cta" href="mailto:aidan@aidantorrence.com">
          Inquire Now
        </a>
        <div className="wf-contact-row">
          <a href="https://wa.me/491758966210">WhatsApp</a>
          <a href="https://instagram.com/aidantorrence" target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href="mailto:aidan@aidantorrence.com">Email</a>
        </div>
        <div className="wf-credits">Vogue Italia · Hypebeast · WWD</div>
      </div>
    </>
  );
}
