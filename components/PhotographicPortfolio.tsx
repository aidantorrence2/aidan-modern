'use client';

/* Pre-generated responsive WebP derivatives preserve the approved full-frame photographs. */
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import edit from '@/data/photographic-edit.json';
import styles from './PhotographicPortfolio.module.css';

const photos = edit.photos;
const byId = new Map(photos.map((photo, index) => [photo.id, index]));
const imageUrl = (id: string, size: string | number = 'full') => `/images/opt/${size}/${id}.webp`;
const imageSet = (photo: typeof photos[number]) => [256, 384, 640]
  .map((size) => `${imageUrl(photo.id, size)} ${size}w`)
  .concat(`${imageUrl(photo.id)} ${photo.width}w`).join(', ');
const imageSizes = (photo: typeof photos[number]) => photo.width > photo.height
  ? '(max-width: 560px) 100vw, 90vw'
  : '(max-width: 560px) calc(100vw - 32px), 52vw';
const pad = (number: number) => String(number).padStart(2, '0');

function Icon({ path }: { path: string }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d={path} /></svg>;
}

export default function PhotographicPortfolio() {
  const dialog = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const trigger = useRef<HTMLAnchorElement | null>(null);
  const previousOverflow = useRef('');
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const active = activeIndex === null ? null : photos[activeIndex];

  useEffect(() => {
    if (activeIndex === null) return;
    for (const offset of [-1, 1]) {
      const neighbor = photos[(activeIndex + offset + photos.length) % photos.length];
      const image = new Image();
      image.src = imageUrl(neighbor.id);
    }
  }, [activeIndex]);

  useEffect(() => {
    const element = dialog.current;
    return () => {
      if (element?.open) document.documentElement.style.overflow = previousOverflow.current;
    };
  }, []);

  function openPhoto(index: number, anchor: HTMLAnchorElement) {
    trigger.current = anchor;
    setActiveIndex(index);
    setFailedImage(null);
    previousOverflow.current = document.documentElement.style.overflow;
    dialog.current?.showModal();
    document.documentElement.style.overflow = 'hidden';
    closeButton.current?.focus();
  }

  function closePhoto() {
    dialog.current?.close();
  }

  function restorePage() {
    document.documentElement.style.overflow = previousOverflow.current;
    setActiveIndex(null);
    setFailedImage(null);
    trigger.current?.focus({ preventScroll: true });
  }

  function move(delta: number) {
    setFailedImage(null);
    setActiveIndex((index) => index === null ? null : (index + delta + photos.length) % photos.length);
  }

  return (
    <div id="top" className={styles.portfolio} data-photographic-portfolio={edit.sourceVersion}>
      <link rel="preload" as="image" href={imageUrl(photos[0].id, 640)} imageSrcSet={imageSet(photos[0])} imageSizes={imageSizes(photos[0])} />
      <link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      <a className={styles.skip} href="#photographs">Skip to photographs</a>
      <header className={styles.masthead}>
        <a className={styles.wordmark} href="#top">Aidan Torrence</a>
        <nav aria-label="Contact">
          <a href="mailto:aidan@aidantorrence.com">Email</a>
          <a href="https://wa.me/491758966210" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp, opens in a new tab">WhatsApp</a>
          <a href="https://www.instagram.com/madebyaidan" target="_blank" rel="noopener noreferrer" aria-label="Instagram, opens in a new tab">Instagram</a>
        </nav>
      </header>
      <div id="work" />
      <div className={styles.sequence} id="photographs" role="region" aria-label="Photographs by Aidan Torrence">
        {edit.passages.map((passage, passageIndex) => (
          <div className={styles.passage} style={{ '--ground': passage.ground } as CSSProperties} key={passage.ids[0]}>
            <div className={[styles.composition, styles[passage.layout], passageIndex === 0 ? styles.opening : ''].join(' ')}>
              {passage.ids.map((id) => {
                const index = byId.get(id)!;
                const photo = photos[index];
                return (
                  <figure className={styles.photo} key={id}>
                    <a className={styles['photo-link']} href={imageUrl(id)} data-photo={id} aria-label={`Open photograph: ${photo.alt}`}
                      onClick={(event) => {
                        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
                        event.preventDefault();
                        openPhoto(index, event.currentTarget);
                      }}>
                      <img src={imageUrl(id, 640)} srcSet={imageSet(photo)} sizes={imageSizes(photo)}
                        width={photo.width} height={photo.height} alt={photo.alt}
                        loading={index === 0 ? 'eager' : 'lazy'} {...(index === 0 ? { fetchpriority: 'high' } : {})} decoding="async"
                        onError={(event) => event.currentTarget.parentElement?.classList.add(styles['image-unavailable'])} />
                    </a>
                  </figure>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className={styles['sequence-end']}>
        <a className={styles['top-link']} href="#top" aria-label="Back to top"><Icon path="M12 20V4m-7 7 7-7 7 7" /></a>
      </div>
      <dialog ref={dialog} className={styles.lightbox} aria-label="Photograph viewer" aria-describedby="viewer-caption"
        onClose={restorePage}
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
            event.preventDefault();
            move(event.key === 'ArrowRight' ? 1 : -1);
          }
        }}>
        <div className={styles['viewer-top']}>
          <span>Aidan Torrence</span>
          <button ref={closeButton} className={styles['viewer-close']} type="button" aria-label="Close photograph viewer" onClick={closePhoto}><Icon path="m6 6 12 12M6 18 18 6" /></button>
        </div>
        <div className={styles['viewer-stage']}
          onClick={(event) => { if (event.target === event.currentTarget) closePhoto(); }}
          onTouchStart={(event) => { touchStart.current = { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY }; }}
          onTouchEnd={(event) => {
            if (!touchStart.current) return;
            const dx = event.changedTouches[0].clientX - touchStart.current.x;
            const dy = event.changedTouches[0].clientY - touchStart.current.y;
            if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5) move(dx < 0 ? 1 : -1);
            touchStart.current = null;
          }}
          onTouchCancel={() => { touchStart.current = null; }}>
          {active && <img id="viewer-image" key={active.id} src={imageUrl(active.id)} alt={active.alt} width={active.width} height={active.height} onError={() => setFailedImage(active.id)} />}
          <p className={styles['viewer-error']} hidden={!active || failedImage !== active.id}>This photograph couldn’t load. Please try the next image.</p>
        </div>
        <div className={styles['viewer-bottom']}>
          <button className={styles['viewer-prev']} type="button" aria-label="Previous photograph" onClick={() => move(-1)}><Icon path="M20 12H4m7-7-7 7 7 7" /></button>
          <span className={styles['viewer-counter']} aria-live="polite">{activeIndex !== null ? `${pad(activeIndex + 1)} / ${photos.length}` : ''}</span>
          <button className={styles['viewer-next']} type="button" aria-label="Next photograph" onClick={() => move(1)}><Icon path="M4 12h16m-7-7 7 7-7 7" /></button>
        </div>
        <p className={styles['sr-only']} id="viewer-caption">{active && activeIndex !== null ? `Photograph ${pad(activeIndex + 1)} of ${photos.length}. ${active.alt}` : ''}</p>
      </dialog>
    </div>
  );
}
