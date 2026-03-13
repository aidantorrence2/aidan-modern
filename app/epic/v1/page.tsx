'use client';

import { useState } from 'react';

const photos = [
  '/images/large/manila-gallery-street-001.jpg',
  '/images/large/manila-gallery-closeup-001.jpg',
  '/images/large/manila-gallery-night-001.jpg',
  '/images/large/manila-gallery-garden-001.jpg',
  '/images/large/manila-gallery-urban-001.jpg',
  '/images/large/manila-gallery-dsc-0075.jpg',
  '/images/large/manila-gallery-canal-001.jpg',
  '/images/large/manila-gallery-shadow-001.jpg',
  '/images/large/manila-gallery-tropical-001.jpg',
  '/images/large/manila-gallery-market-001.jpg',
  '/images/large/manila-gallery-night-002.jpg',
  '/images/large/manila-gallery-ivy-001.jpg',
  '/images/large/manila-gallery-dsc-0130.jpg',
  '/images/large/manila-gallery-park-001.jpg',
  '/images/large/manila-gallery-urban-002.jpg',
  '/images/large/manila-gallery-floor-001.jpg',
  '/images/large/manila-gallery-statue-001.jpg',
  '/images/large/manila-gallery-night-003.jpg',
  '/images/large/manila-gallery-white-001.jpg',
  '/images/large/manila-gallery-dsc-0190.jpg',
];

const CSS = `
body > header, body > footer, .fixed.inset-x-0.bottom-0 { display: none !important; }
html, body { background: #060606 !important; }

.ig-feed img {
  width: 100%;
  display: block;
  transition: opacity 0.3s ease;
}
.ig-feed img:active {
  opacity: 0.85;
}

.lightbox-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0,0,0,0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: lbFadeIn 0.2s ease;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.lightbox-overlay img {
  max-width: 100%;
  max-height: 100vh;
  object-fit: contain;
}

@keyframes lbFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.inquire-btn {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(20,20,20,0.92);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-top: 1px solid rgba(255,255,255,0.08);
  padding: 12px 20px;
  display: flex;
  justify-content: center;
}
.inquire-btn a {
  display: block;
  width: 100%;
  max-width: 400px;
  text-align: center;
  padding: 14px 0;
  background: #fff;
  color: #000;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-decoration: none;
  border-radius: 8px;
  transition: background 0.2s;
}
.inquire-btn a:active {
  background: #ddd;
}

.profile-header {
  padding: 24px 16px 20px;
  text-align: center;
}
.profile-avatar {
  width: 86px;
  height: 86px;
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.15);
  object-fit: cover;
  margin: 0 auto 14px;
}
.profile-name {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 4px;
}
.profile-handle {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 13px;
  color: rgba(255,255,255,0.5);
  margin: 0 0 10px;
}
.profile-bio {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 13px;
  color: rgba(255,255,255,0.7);
  line-height: 1.5;
  margin: 0 0 6px;
  max-width: 320px;
  margin-left: auto;
  margin-right: auto;
}
.profile-stats {
  display: flex;
  justify-content: center;
  gap: 28px;
  margin: 16px 0 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
.profile-stats div {
  text-align: center;
}
.profile-stats .num {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
}
.profile-stats .label {
  font-size: 11px;
  color: rgba(255,255,255,0.45);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.credits {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 6px 16px 0;
  flex-wrap: wrap;
}
.credits span {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 11px;
  color: rgba(255,255,255,0.35);
  letter-spacing: 0.3px;
}

@media (min-width: 640px) {
  .ig-feed {
    max-width: 540px;
    margin: 0 auto;
  }
}
`;

export default function V1Page() {
  const [lightbox, setLightbox] = useState<string | null>(null);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {lightbox && (
        <div className="lightbox-overlay" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="" />
        </div>
      )}

      <div style={{ paddingBottom: 72 }}>
        <div className="profile-header">
          <img
            className="profile-avatar"
            src={photos[0]}
            alt="Aidan Torrence"
          />
          <p className="profile-name">Aidan Torrence</p>
          <p className="profile-handle">@aidantorrence</p>
          <p className="profile-bio">
            Film · Fashion · Editorial Photography
          </p>
          <p className="profile-bio" style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
            Bangkok & Europe · Booking worldwide
          </p>
          <div className="profile-stats">
            <div>
              <div className="num">{photos.length}</div>
              <div className="label">Posts</div>
            </div>
            <div>
              <div className="num">Vogue</div>
              <div className="label">Italia</div>
            </div>
            <div>
              <div className="num">Hype</div>
              <div className="label">beast</div>
            </div>
          </div>
        </div>

        <div className="credits">
          <span>Vogue Italia</span>
          <span>·</span>
          <span>Hypebeast</span>
          <span>·</span>
          <span>WWD</span>
        </div>

        <div className="ig-feed" style={{ marginTop: 16 }}>
          {photos.map((src, i) => (
            <div
              key={src}
              onClick={() => setLightbox(src)}
              style={{ cursor: 'pointer', marginBottom: 3 }}
            >
              <img
                src={src}
                alt={`Photo ${i + 1}`}
                loading={i < 2 ? 'eager' : 'lazy'}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="inquire-btn">
        <a href="mailto:aidan@aidantorrence.com">Inquire</a>
      </div>
    </>
  );
}
