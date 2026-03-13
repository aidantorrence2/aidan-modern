'use client';

import { useEffect, useRef } from 'react';

const heroImage = 'manila-gallery-dsc-0075.jpg';

const photoPairs = [
  { large: 'manila-gallery-canal-001.jpg', small: 'manila-gallery-night-001.jpg' },
  { large: 'manila-gallery-closeup-001.jpg', small: 'manila-gallery-garden-001.jpg' },
  { large: 'manila-gallery-street-001.jpg', small: 'manila-gallery-ivy-001.jpg' },
  { large: 'manila-gallery-dsc-0130.jpg', small: 'manila-gallery-urban-001.jpg' },
  { large: 'manila-gallery-night-002.jpg', small: 'manila-gallery-tropical-001.jpg' },
  { large: 'manila-gallery-shadow-001.jpg', small: 'manila-gallery-market-001.jpg' },
  { large: 'manila-gallery-dsc-0190.jpg', small: 'manila-gallery-park-001.jpg' },
  { large: 'manila-gallery-canal-002.jpg', small: 'manila-gallery-garden-002.jpg' },
  { large: 'manila-gallery-dsc-0911.jpg', small: 'manila-gallery-urban-002.jpg' },
  { large: 'manila-gallery-night-003.jpg', small: 'manila-gallery-ivy-002.jpg' },
];

const CSS = `
  body > header, body > footer, .fixed.inset-x-0.bottom-0 { display: none !important; }
  html, body { background: #1a1612 !important; margin: 0; padding: 0; color: #e8e0d4; }

  .v5-hero {
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
  }

  .v5-hero-text {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 60px 28px 40px;
  }

  .v5-hero-name {
    font-family: 'Georgia', 'Times New Roman', serif;
    font-size: 38px;
    font-weight: 400;
    line-height: 1.15;
    margin: 0 0 16px;
    color: #f0e8dc;
  }

  .v5-hero-tagline {
    font-family: -apple-system, 'Helvetica Neue', sans-serif;
    font-size: 14px;
    font-weight: 400;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #998c7a;
    margin: 0 0 32px;
  }

  .v5-hero-cta {
    display: inline-block;
    font-family: -apple-system, 'Helvetica Neue', sans-serif;
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #1a1612;
    background: #e8dcc8;
    padding: 14px 32px;
    text-decoration: none;
    border-radius: 2px;
    align-self: flex-start;
    transition: background 0.3s ease, transform 0.2s ease;
  }

  .v5-hero-cta:hover {
    background: #f5eddf;
    transform: translateY(-1px);
  }

  .v5-hero-image {
    width: 100%;
    aspect-ratio: 3/4;
    overflow: hidden;
  }

  .v5-hero-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .v5-credits {
    padding: 8px 28px 16px;
    font-size: 10px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: #665d50;
  }

  .v5-section {
    padding: 0 16px;
    margin-bottom: 4px;
  }

  .v5-pair {
    display: grid;
    grid-template-columns: 1fr;
    gap: 4px;
    margin-bottom: 4px;
    opacity: 0;
    transform: translateY(40px);
    transition: opacity 0.7s ease, transform 0.7s ease;
  }

  .v5-pair.v5-visible {
    opacity: 1;
    transform: translateY(0);
  }

  .v5-pair-large {
    width: 100%;
    aspect-ratio: 3/4;
    overflow: hidden;
    border-radius: 2px;
  }

  .v5-pair-small {
    width: 100%;
    aspect-ratio: 1/1;
    overflow: hidden;
    border-radius: 2px;
  }

  .v5-pair-large img, .v5-pair-small img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s ease;
  }

  .v5-pair-large:hover img, .v5-pair-small:hover img {
    transform: scale(1.04);
  }

  .v5-divider {
    width: 40px;
    height: 1px;
    background: rgba(232,220,200,0.2);
    margin: 48px auto;
  }

  .v5-contact {
    padding: 80px 28px 60px;
    text-align: center;
  }

  .v5-contact h2 {
    font-family: 'Georgia', 'Times New Roman', serif;
    font-size: 28px;
    font-weight: 400;
    color: #f0e8dc;
    margin: 0 0 12px;
  }

  .v5-contact p {
    font-size: 13px;
    color: #998c7a;
    margin: 0 0 36px;
    letter-spacing: 0.5px;
    line-height: 1.6;
  }

  .v5-contact-grid {
    display: flex;
    flex-direction: column;
    gap: 16px;
    align-items: center;
    margin-bottom: 40px;
  }

  .v5-contact-btn {
    display: inline-block;
    font-family: -apple-system, 'Helvetica Neue', sans-serif;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #e8dcc8;
    border: 1px solid rgba(232,220,200,0.25);
    padding: 14px 28px;
    text-decoration: none;
    border-radius: 2px;
    transition: all 0.3s ease;
    min-width: 220px;
  }

  .v5-contact-btn:hover {
    border-color: rgba(232,220,200,0.5);
    background: rgba(232,220,200,0.06);
  }

  .v5-footer {
    text-align: center;
    padding: 20px;
    font-size: 10px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: #4a4238;
    border-top: 1px solid rgba(232,220,200,0.08);
  }

  @media (min-width: 768px) {
    .v5-hero {
      flex-direction: row;
      min-height: 100vh;
    }
    .v5-hero-text {
      width: 50%;
      padding: 80px 60px;
    }
    .v5-hero-image {
      width: 50%;
      aspect-ratio: auto;
    }
    .v5-hero-name { font-size: 52px; }

    .v5-pair {
      grid-template-columns: 2fr 1fr;
      gap: 6px;
    }
    .v5-pair:nth-child(even) {
      grid-template-columns: 1fr 2fr;
    }
    .v5-pair:nth-child(even) .v5-pair-large { order: 2; }
    .v5-pair:nth-child(even) .v5-pair-small { order: 1; }

    .v5-pair-large { aspect-ratio: 4/5; }
    .v5-pair-small { aspect-ratio: 4/5; }

    .v5-section { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
    .v5-contact h2 { font-size: 36px; }
  }

  @media (min-width: 1200px) {
    .v5-hero-name { font-size: 64px; }
    .v5-hero-text { padding: 100px 80px; }
  }
`;

export default function V5Page() {
  const pairsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('v5-visible');
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    pairsRef.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="v5-hero">
        <div className="v5-hero-text">
          <h1 className="v5-hero-name">Aidan<br />Torrence</h1>
          <p className="v5-hero-tagline">Film &middot; Fashion &middot; Editorial</p>
          <a className="v5-hero-cta" href="#work">See the work</a>
          <div className="v5-credits">
            Vogue Italia &middot; Hypebeast &middot; WWD
          </div>
        </div>
        <div className="v5-hero-image">
          <img
            src={`/images/large/${heroImage}`}
            alt="Featured editorial photograph"
            loading="eager"
            decoding="async"
          />
        </div>
      </div>

      <div className="v5-divider" />

      <div id="work" className="v5-section">
        {photoPairs.map((pair, i) => (
          <div
            key={i}
            className="v5-pair"
            ref={(el) => { pairsRef.current[i] = el; }}
          >
            <div className="v5-pair-large">
              <img
                src={`/images/large/${pair.large}`}
                alt={`Portfolio photo ${i * 2 + 1}`}
                loading={i < 2 ? 'eager' : 'lazy'}
                decoding="async"
              />
            </div>
            <div className="v5-pair-small">
              <img
                src={`/images/large/${pair.small}`}
                alt={`Portfolio photo ${i * 2 + 2}`}
                loading={i < 2 ? 'eager' : 'lazy'}
                decoding="async"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="v5-divider" />

      <div className="v5-contact">
        <h2>Let&apos;s create together</h2>
        <p>
          Based between Bangkok &amp; Europe<br />
          Booking worldwide for editorial, campaign &amp; personal projects
        </p>
        <div className="v5-contact-grid">
          <a className="v5-contact-btn" href="mailto:aidan@aidantorrence.com">Email me</a>
          <a className="v5-contact-btn" href="https://wa.me/491758966210">WhatsApp</a>
          <a className="v5-contact-btn" href="https://instagram.com/aidantorrence" target="_blank" rel="noopener">Instagram</a>
        </div>
      </div>

      <div className="v5-footer">
        &copy; {new Date().getFullYear()} Aidan Torrence
      </div>
    </>
  );
}
