'use client';

import React, { useEffect, useRef } from 'react';

const CSS = `
  html, body {
    background: #0a0a0a !important;
    color: #f0ece4 !important;
    margin: 0; padding: 0;
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
  }
  body > header, body > footer, .fixed.inset-x-0.bottom-0 { display: none !important; }

  /* Cinematic hero */
  .ms-hero {
    position: relative;
    width: 100%; height: 100vh; height: 100svh;
    overflow: hidden;
  }
  .ms-hero img {
    width: 100%; height: 100%;
    object-fit: cover;
    display: block;
  }
  .ms-hero-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(
      to bottom,
      rgba(10,10,10,0.15) 0%,
      rgba(10,10,10,0.0) 40%,
      rgba(10,10,10,0.6) 75%,
      rgba(10,10,10,0.95) 100%
    );
    display: flex; flex-direction: column;
    justify-content: flex-end;
    padding: 0 20px 48px;
  }
  .ms-hero-overlay h1 {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: 13vw; font-weight: 200; letter-spacing: -0.04em;
    line-height: 0.95; margin: 0; text-transform: uppercase;
    color: #fff;
  }
  .ms-hero-overlay .tagline {
    font-size: 11px; letter-spacing: 0.35em; text-transform: uppercase;
    color: rgba(255,255,255,0.5); margin-top: 12px; font-weight: 400;
  }
  .ms-scroll-arrow {
    position: absolute; bottom: 14px; left: 50%;
    transform: translateX(-50%);
    animation: msArrow 1.8s ease-in-out infinite;
    color: rgba(255,255,255,0.4); font-size: 18px;
  }
  @keyframes msArrow {
    0%,100% { opacity: 0.3; transform: translateX(-50%) translateY(0); }
    50% { opacity: 0.7; transform: translateX(-50%) translateY(6px); }
  }

  /* Stream photos */
  .ms-stream img {
    width: 100%; display: block;
    object-fit: cover;
  }
  .ms-stream .full { padding: 0; }
  .ms-stream .inset { padding: 0 16px; }
  .ms-stream .inset img { border-radius: 3px; }

  /* Divider bars */
  .ms-divider {
    padding: 36px 20px;
    text-align: center;
    border-top: 1px solid rgba(240,236,228,0.08);
    border-bottom: 1px solid rgba(240,236,228,0.08);
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.6s ease, transform 0.6s ease;
  }
  .ms-divider.visible { opacity: 1; transform: translateY(0); }
  .ms-divider .quote {
    font-size: 13px; letter-spacing: 0.25em; text-transform: uppercase;
    color: rgba(240,236,228,0.45); font-weight: 400;
  }

  /* Photo entrance animation */
  .ms-photo-wrap {
    opacity: 0;
    transform: scale(1.02);
    transition: opacity 0.5s ease, transform 0.5s ease;
  }
  .ms-photo-wrap.visible {
    opacity: 1; transform: scale(1);
  }

  /* Bottom inquiry */
  .ms-inquiry {
    padding: 80px 24px 56px;
    text-align: center;
    border-top: 1px solid rgba(240,236,228,0.08);
  }
  .ms-inquiry h2 {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: 32px; font-weight: 200; letter-spacing: -0.02em;
    margin: 0 0 8px; color: #f0ece4;
  }
  .ms-inquiry .sub {
    font-size: 12px; color: rgba(240,236,228,0.4);
    letter-spacing: 0.2em; text-transform: uppercase;
    margin-bottom: 28px;
  }
  .ms-inquiry a.cta {
    display: inline-block;
    padding: 15px 44px;
    background: #f0ece4;
    color: #0a0a0a;
    text-decoration: none;
    font-size: 12px; font-weight: 500;
    letter-spacing: 0.18em; text-transform: uppercase;
    transition: opacity 0.3s;
  }
  .ms-inquiry a.cta:hover { opacity: 0.85; }
  .ms-links {
    display: flex; gap: 24px; justify-content: center;
    flex-wrap: wrap; margin-top: 24px;
  }
  .ms-links a {
    font-size: 11px; color: rgba(240,236,228,0.4);
    text-decoration: none; letter-spacing: 0.12em;
    text-transform: uppercase;
  }
  .ms-footer-credits {
    margin-top: 40px;
    font-size: 10px; color: rgba(240,236,228,0.2);
    letter-spacing: 0.15em; text-transform: uppercase;
  }

  @media (min-width: 640px) {
    .ms-hero-overlay h1 { font-size: 8vw; }
    .ms-stream .inset { padding: 0 40px; }
    .ms-inquiry h2 { font-size: 40px; }
  }
`;

const allImages = [
  'manila-gallery-dsc-0075.jpg',
  'manila-gallery-night-001.jpg',
  'manila-gallery-street-001.jpg',
  'manila-gallery-garden-001.jpg',
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
  'manila-gallery-dsc-0911.jpg',
  'manila-gallery-garden-002.jpg',
  'manila-gallery-statue-001.jpg',
  'manila-gallery-white-001.jpg',
  'manila-gallery-ivy-002.jpg',
  'manila-gallery-night-003.jpg',
  'manila-gallery-urban-003.jpg',
];

const heroImage = allImages[0];
const streamImages = allImages.slice(1);

const dividers = [
  { text: '27+ sessions worldwide' },
  { text: 'Featured in Vogue Italia' },
  { text: 'Film · Fashion · Editorial' },
  { text: 'Available for bookings' },
  { text: 'Hypebeast · WWD · Vogue' },
];

export default function V20MomentumScroll() {
  const animRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    animRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  let refIdx = 0;
  const getRef = (el: HTMLDivElement | null) => {
    const idx = refIdx++;
    animRefs.current[idx] = el;
  };

  // Build stream: images with dividers inserted every 4-5 photos
  const stream: React.ReactNode[] = [];
  let dividerIdx = 0;

  streamImages.forEach((src, i) => {
    const isInset = i % 3 === 1; // every 3rd image (offset 1) is inset
    const capturedRefIdx = stream.length;

    stream.push(
      <div
        key={`img-${i}`}
        ref={(el) => { animRefs.current[capturedRefIdx] = el; }}
        className={`ms-photo-wrap ${isInset ? 'inset' : 'full'}`}
      >
        <img
          src={`/images/large/${src}`}
          alt=""
          loading="lazy"
          style={{ aspectRatio: isInset ? '4/5' : '3/4' }}
        />
      </div>
    );

    // Insert divider after every 4th photo in the stream
    if ((i + 1) % 4 === 0 && dividerIdx < dividers.length) {
      const dIdx = dividerIdx;
      const capturedDivRefIdx = stream.length;
      stream.push(
        <div
          key={`div-${dIdx}`}
          ref={(el) => { animRefs.current[capturedDivRefIdx] = el; }}
          className="ms-divider"
        >
          <span className="quote">{dividers[dIdx].text}</span>
        </div>
      );
      dividerIdx++;
    }
  });

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* Cinematic hero */}
      <div className="ms-hero">
        <img
          src={`/images/large/${heroImage}`}
          alt=""
        />
        <div className="ms-hero-overlay">
          <h1>Aidan<br />Torrence</h1>
          <div className="tagline">Film · Fashion · Editorial Photography</div>
        </div>
        <div className="ms-scroll-arrow">↓</div>
      </div>

      {/* Continuous photo stream */}
      <div className="ms-stream">
        {stream}
      </div>

      {/* Inquiry */}
      <div className="ms-inquiry">
        <h2>Work with me</h2>
        <div className="sub">Sessions available worldwide</div>
        <a className="cta" href="mailto:aidan@aidantorrence.com">
          Get in Touch
        </a>
        <div className="ms-links">
          <a href="https://wa.me/491758966210">WhatsApp</a>
          <a href="https://instagram.com/aidantorrence" target="_blank" rel="noopener noreferrer">@aidantorrence</a>
          <a href="mailto:aidan@aidantorrence.com">Email</a>
        </div>
        <div className="ms-footer-credits">
          Vogue Italia · Hypebeast · WWD
        </div>
      </div>
    </>
  );
}
