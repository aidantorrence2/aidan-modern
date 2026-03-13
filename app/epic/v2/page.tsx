'use client';

import { useState } from 'react';

const photos = [
  { src: '/images/large/manila-gallery-dsc-0075.jpg', layout: 'full' as const },
  { src: '/images/large/manila-gallery-closeup-001.jpg', layout: 'inset' as const, caption: 'Manila, 2024' },
  { src: '/images/large/manila-gallery-garden-001.jpg', layout: 'full' as const },
  { src: '/images/large/manila-gallery-night-001.jpg', layout: 'inset' as const, caption: 'After dark' },
  { src: '/images/large/manila-gallery-street-001.jpg', layout: 'full' as const, quote: 'Every frame tells a story worth remembering.' },
  { src: '/images/large/manila-gallery-urban-001.jpg', layout: 'inset' as const },
  { src: '/images/large/manila-gallery-canal-001.jpg', layout: 'full' as const },
  { src: '/images/large/manila-gallery-shadow-001.jpg', layout: 'inset' as const, caption: 'Light & shadow' },
  { src: '/images/large/manila-gallery-tropical-001.jpg', layout: 'full' as const },
  { src: '/images/large/manila-gallery-ivy-001.jpg', layout: 'inset' as const },
  { src: '/images/large/manila-gallery-dsc-0130.jpg', layout: 'full' as const, quote: 'The best photographs are the ones that feel inevitable.' },
  { src: '/images/large/manila-gallery-market-001.jpg', layout: 'inset' as const, caption: 'Street market' },
  { src: '/images/large/manila-gallery-park-001.jpg', layout: 'full' as const },
  { src: '/images/large/manila-gallery-night-002.jpg', layout: 'inset' as const },
  { src: '/images/large/manila-gallery-statue-001.jpg', layout: 'full' as const },
  { src: '/images/large/manila-gallery-urban-002.jpg', layout: 'inset' as const, caption: 'Urban geometry' },
  { src: '/images/large/manila-gallery-dsc-0190.jpg', layout: 'full' as const },
  { src: '/images/large/manila-gallery-white-001.jpg', layout: 'inset' as const },
  { src: '/images/large/manila-gallery-floor-001.jpg', layout: 'full' as const },
  { src: '/images/large/manila-gallery-night-003.jpg', layout: 'inset' as const, caption: 'Last light' },
];

const CSS = `
body > header, body > footer, .fixed.inset-x-0.bottom-0 { display: none !important; }
html, body { background: #f5f2ec !important; margin: 0; }

@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');

.mag-page {
  font-family: 'Playfair Display', Georgia, 'Times New Roman', serif;
  color: #1a1a1a;
  max-width: 100%;
  overflow-x: hidden;
}

.mag-hero {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 60px 24px;
}
.mag-hero h1 {
  font-size: 42px;
  font-weight: 400;
  letter-spacing: 6px;
  text-transform: uppercase;
  margin: 0 0 8px;
  font-family: 'Playfair Display', Georgia, serif;
}
.mag-hero .subtitle {
  font-size: 13px;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: #888;
  margin: 0 0 6px;
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
}
.mag-hero .credits-line {
  font-size: 11px;
  letter-spacing: 2px;
  color: #aaa;
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  text-transform: uppercase;
}
.mag-hero .divider {
  width: 40px;
  height: 1px;
  background: #ccc;
  margin: 20px auto;
}

.mag-full {
  width: 100%;
  position: relative;
  margin: 0 0 8px;
}
.mag-full img {
  width: 100%;
  display: block;
}
.mag-full .overlay-quote {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 40px 24px 28px;
  background: linear-gradient(transparent, rgba(0,0,0,0.6));
  color: #fff;
  font-size: 20px;
  font-style: italic;
  line-height: 1.5;
  font-family: 'Playfair Display', Georgia, serif;
}

.mag-inset {
  padding: 40px 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.mag-inset img {
  width: 85%;
  max-width: 480px;
  display: block;
  box-shadow: 0 4px 30px rgba(0,0,0,0.08);
}
.mag-inset .caption {
  margin-top: 16px;
  font-size: 12px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #999;
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
}

.mag-form-section {
  padding: 80px 24px;
  text-align: center;
  max-width: 460px;
  margin: 0 auto;
}
.mag-form-section h2 {
  font-size: 28px;
  font-weight: 400;
  margin: 0 0 8px;
  font-family: 'Playfair Display', Georgia, serif;
}
.mag-form-section .form-sub {
  font-size: 13px;
  color: #888;
  margin: 0 0 32px;
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
}
.mag-form-section input,
.mag-form-section textarea {
  display: block;
  width: 100%;
  box-sizing: border-box;
  border: none;
  border-bottom: 1px solid #ccc;
  background: transparent;
  padding: 14px 0;
  font-size: 15px;
  font-family: 'Playfair Display', Georgia, serif;
  color: #1a1a1a;
  margin-bottom: 20px;
  outline: none;
  transition: border-color 0.2s;
}
.mag-form-section input:focus,
.mag-form-section textarea:focus {
  border-color: #1a1a1a;
}
.mag-form-section textarea {
  resize: vertical;
  min-height: 80px;
}
.mag-form-section button {
  margin-top: 12px;
  padding: 16px 48px;
  background: #1a1a1a;
  color: #f5f2ec;
  border: none;
  font-size: 13px;
  letter-spacing: 3px;
  text-transform: uppercase;
  cursor: pointer;
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  transition: background 0.2s;
}
.mag-form-section button:hover {
  background: #333;
}

.mag-footer {
  text-align: center;
  padding: 0 24px 60px;
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
}
.mag-footer a {
  font-size: 12px;
  color: #999;
  text-decoration: none;
  margin: 0 10px;
  letter-spacing: 1px;
}

@media (min-width: 768px) {
  .mag-hero h1 { font-size: 56px; letter-spacing: 10px; }
  .mag-full .overlay-quote { font-size: 26px; padding: 60px 48px 40px; }
  .mag-inset { padding: 60px 48px; }
  .mag-inset img { width: 70%; }
}
`;

export default function V2Page() {
  const [sent, setSent] = useState(false);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="mag-page">
        <div className="mag-hero">
          <p className="subtitle">Film · Fashion · Editorial</p>
          <h1>Aidan Torrence</h1>
          <div className="divider" />
          <p className="credits-line">Vogue Italia · Hypebeast · WWD</p>
        </div>

        {photos.map((photo, i) => {
          if (photo.layout === 'full') {
            return (
              <div className="mag-full" key={photo.src}>
                <img
                  src={photo.src}
                  alt={`Editorial ${i + 1}`}
                  loading={i < 2 ? 'eager' : 'lazy'}
                />
                {(photo as any).quote && (
                  <div className="overlay-quote">{(photo as any).quote}</div>
                )}
              </div>
            );
          }
          return (
            <div className="mag-inset" key={photo.src}>
              <img
                src={photo.src}
                alt={`Editorial ${i + 1}`}
                loading="lazy"
              />
              {photo.caption && (
                <div className="caption">{photo.caption}</div>
              )}
            </div>
          );
        })}

        <div className="mag-form-section">
          <h2>Work Together</h2>
          <p className="form-sub">
            Bangkok & Europe · Booking worldwide
          </p>
          {sent ? (
            <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 18, color: '#1a1a1a' }}>
              Thank you. I will be in touch shortly.
            </p>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const data = new FormData(form);
                const name = data.get('name');
                const email = data.get('email');
                const msg = data.get('message');
                window.location.href = `mailto:aidan@aidantorrence.com?subject=Inquiry from ${name}&body=${msg}%0A%0AFrom: ${name} (${email})`;
                setSent(true);
              }}
            >
              <input name="name" type="text" placeholder="Name" required />
              <input name="email" type="email" placeholder="Email" required />
              <textarea name="message" placeholder="Tell me about your project" rows={4} />
              <button type="submit">Send Inquiry</button>
            </form>
          )}
        </div>

        <div className="mag-footer">
          <a href="mailto:aidan@aidantorrence.com">Email</a>
          <a href="https://wa.me/491758966210">WhatsApp</a>
          <a href="https://instagram.com/aidantorrence">Instagram</a>
        </div>
      </div>
    </>
  );
}
