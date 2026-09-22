'use client'
/* eslint-disable @next/next/no-img-element -- Pre-sized references and local upload previews need their original URLs. */

import { useEffect, useRef, useState } from 'react'
import { imagesForIds, parseThemeSelection, type ThemeSelection } from '@/lib/themePicker'
import { fetchUploadTicket, preparePhoto, describePhotoFailures, type PhotoFailure } from '@/lib/signupPhotos'
import { initPageAnalytics, track, flushNow } from '@/lib/track'
import { detectLang, useLang } from '@/lib/locale'
import { copyFor } from '@/lib/signupCopy'
import { SHOOT } from '@/lib/shoot'
import LangToggle from './LangToggle'
import styles from './ThemePicker.module.css'
import form from './ThemeSignup.module.css'

export default function SignUpFormCollabThemes({ selection, onBack, onRestart }: { selection: ThemeSelection | null; onBack?: () => void; onRestart?: () => void }) {
  const [channel, setChannel] = useState<'whatsapp' | 'instagram'>('whatsapp')
  const [contact, setContact] = useState('')
  const [notes, setNotes] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [processing, setProcessing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [lang, setLang] = useLang()
  const copy = copyFor(lang)
  const submitting = useRef(false)
  const images = imagesForIds(selection?.imageIds || [])

  useEffect(() => { initPageAnalytics('/sign-up-collab-themes', { version: 'v4', inline: !!onBack, lang: detectLang() }) }, [onBack])

  async function addPhotos(event: React.ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget
    const files = Array.from(input.files || []).slice(0, 3 - photos.length)
    if (!files.length || processing) return
    setProcessing(true); setError('')
    const failures: PhotoFailure[] = []
    try {
      const ticket = await fetchUploadTicket(null)
      for (const file of files) {
        const result = await preparePhoto(file, ticket)
        if (result.ok) setPhotos(previous => [...previous, result.value])
        else failures.push(result.reason)
      }
      if (failures.length) setError(describePhotoFailures(failures))
    } catch { setError(copy.errors.photoFailed) }
    finally { setProcessing(false); input.value = '' }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selection || submitting.current || processing) return
    const data = new FormData(event.currentTarget)
    if (data.get('company')) return
    const chosen = parseThemeSelection(selection)
    if (!chosen) { setError(copy.errors.picksLost); return }
    let value = contact.trim()
    if (channel === 'whatsapp') {
      const digits = value.replace(/\D/g, '').length
      if (!/^\+[\d\s().-]{7,24}$/.test(value) || digits < 7 || digits > 15) { setError(copy.errors.whatsapp); return }
    } else {
      value = value.replace(/^@/, '')
      if (!/^[a-zA-Z0-9._]{1,30}$/.test(value)) { setError(copy.errors.instagram); return }
    }
    if (!photos.length) { setError(copy.errors.noPhoto); return }
    submitting.current = true; setSaving(true); setError('')
    track('submit_attempt', { photos: photos.length, picks: images.length, channel, lang })
    try {
      const response = await fetch('/api/sign-up', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: SHOOT.city, contactMethod: channel, contact: value, themeSelection: chosen,
          // Language: … tells Aidan which language to open the DM in.
          moodboard: ['Collab sign-up', `Language: ${copy.languageName}`, ...(notes.trim() ? [`Notes: ${notes.trim()}`] : [])],
          photos,
        }),
      })
      const result = await response.json().catch(() => null)
      if (!response.ok || !result?.ok) throw new Error('Save failed')
      setDone(true)
      track('submit_success', { picks: images.length, photos: photos.length, channel, lang }); flushNow()
      const fbq = (window as typeof window & { fbq?: (...args: unknown[]) => void }).fbq
      fbq?.('track', 'Lead', { source: 'sign-up-collab-themes' })
    } catch {
      setError(copy.errors.saveFailed)
      track('submit_error', { picks: images.length })
    } finally { submitting.current = false; setSaving(false) }
  }

  return <section className={styles.page}><div className={styles.shell}>
    <div className={styles.topbar}>
      <a href="/" className={styles.wordmark}>Aidan Torrence</a>
      <div className={styles.topbarRight}><LangToggle lang={lang} onChange={setLang} /><span>{copy.dates}</span></div>
    </div>
    {!selection ? <div className={styles.heading}><a href="/sign-up-collab" className={styles.primary} style={{ marginTop: 24 }}>{copy.choosePhotos} <span>↗</span></a></div> : <>
      {done
        ? <div className={styles.heading}><h1>{copy.doneTitle}</h1><p>{copy.doneNote}</p></div>
        : <div className={form.signupCta}><h1 className={styles.cta}><strong>{copy.signUpTitle}</strong></h1><p>{copy.signUpNote}</p></div>}
      <div className={form.boardSummary}>
        <div className={form.filmstrip}>{images.map(image => <img src={image.src} alt={image.alt} key={image.id} />)}</div>
        {!done && (onBack || onRestart) && <div className={form.boardActions}>{onBack && <button type="button" className={`${styles.textButton} ${form.back}`} onClick={onBack}>{copy.back}</button>}{onRestart && <button type="button" className={styles.textButton} onClick={onRestart}>{copy.startOver}</button>}</div>}
      </div>
      {done ? <div className={styles.reviewActions}><a className={styles.textButton} href="https://www.instagram.com/madebyaidan" target="_blank" rel="noreferrer">@madebyaidan</a></div> : <form className={form.form} onSubmit={submit}>
        <fieldset><legend>{copy.whereToMessage}</legend><div className={form.channels}>{(['whatsapp', 'instagram'] as const).map(item => <button type="button" key={item} aria-pressed={channel === item} onClick={() => { setChannel(item); setContact(''); setError('') }}>{item === 'whatsapp' ? copy.whatsapp : copy.instagram}</button>)}</div><label className={form.field}><span className={styles.srOnly}>{channel === 'whatsapp' ? copy.whatsappLabel : copy.instagramLabel}</span><input required type={channel === 'whatsapp' ? 'tel' : 'text'} autoComplete={channel === 'whatsapp' ? 'tel' : 'off'} autoCapitalize="none" maxLength={40} value={contact} onChange={event => setContact(event.target.value)} placeholder={channel === 'whatsapp' ? SHOOT.phoneExample : copy.instagramPlaceholder} /></label>{channel === 'instagram' && <p className={form.hint}>{copy.followHint.before}<a href="https://www.instagram.com/madebyaidan" target="_blank" rel="noreferrer">@madebyaidan</a>{copy.followHint.after}</p>}</fieldset>
        <label className={form.field}>{copy.notes} <span>{copy.optional}</span><textarea maxLength={1500} rows={3} value={notes} onChange={event => setNotes(event.target.value)} /></label>
        <div><label className={form.field} htmlFor="model-photos">{copy.photosOfYou} <span>{copy.upTo3}</span></label><div className={form.uploads}>{photos.map((photo, index) => <div key={photo}><img src={photo} alt={copy.yourPhoto(index + 1)} /><button type="button" aria-label={copy.removePhoto(index + 1)} disabled={processing || saving} onClick={() => setPhotos(previous => previous.filter((_, i) => i !== index))}>×</button></div>)}</div><input id="model-photos" type="file" accept="image/*,.heic,.heif" multiple disabled={processing || saving || photos.length >= 3} onChange={addPhotos} className={form.fileInput} />{processing && <p role="status" className={form.hint}>{copy.addingPhotos}</p>}</div>
        <div className={styles.srOnly} aria-hidden="true"><label>Company<input name="company" tabIndex={-1} autoComplete="off" /></label></div>
        {error && <p role="alert" className={form.error}>{error}</p>}
        <div className={form.submitBar}><button type="submit" disabled={saving || processing} className={styles.primary}>{saving ? copy.signingUp : processing ? copy.addingPhotos : copy.signUp}<span aria-hidden="true">↗</span></button></div>
      </form>}
    </>}
  </div></section>
}
