/* eslint-disable @next/next/no-img-element -- These shared reference images are pre-sized during library preparation. */
import { boardPath, imagesForIds, selectionFromQuery, themeLabel } from '@/lib/themePicker'
import styles from '@/components/ThemePicker.module.css'

export const metadata = { title: 'Your shoot moodboard · Aidan Torrence', robots: { index: false } }

export default function YourMoodboardPage({ searchParams }: { searchParams: { theme?: string; images?: string } }) {
  const selection = selectionFromQuery(searchParams)
  const images = imagesForIds(selection?.imageIds || [])
  return <section className={styles.page}><div className={styles.shell}>
    <div className={styles.topbar}><a className={styles.wordmark} href="/">Aidan Torrence</a><span>Almaty · Sept 7–9</span></div>
    <div className={styles.heading}><p className={styles.eyebrow}>{selection ? themeLabel(selection.theme) : 'Let’s find your look'}</p><h1>Your shoot moodboard.</h1><p>{images.length ? 'A few things you love. A starting point for what we’ll make together.' : 'Choose your favourite photos to build your moodboard.'}</p></div>
    <div className={styles.reviewGrid}>{images.map(image => <a key={image.id} href={image.source} target="_blank" rel="noreferrer" title={`${image.alt} · ${image.credit}`} className={styles.reviewCard}><img src={image.src} alt={image.alt} /></a>)}</div>
    <div className={styles.reviewActions}><a className={styles.primary} href={selection ? boardPath(selection, '/sign-up-collab-themes') : '/choose-your-theme'}>{selection ? 'Sign up for a collab shoot' : 'Choose your theme'}<span>↗</span></a></div>
    <p className={styles.footnote}>Tap a photo to see its source.</p><div className={styles.credits}>Photography by Aidan Torrence · starting references via Pinterest · codex</div>
  </div></section>
}
