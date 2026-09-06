'use client'
/* eslint-disable @next/next/no-img-element -- Pre-sized references and local upload previews need their original URLs. */

import { useEffect, useRef, useState } from 'react'
import { imagesForIds, parseThemeSelection, type ThemeSelection } from '@/lib/themePicker'
import { fetchUploadTicket, preparePhoto, describePhotoFailures, type PhotoFailure } from '@/lib/signupPhotos'
import { initPageAnalytics, track, flushNow } from '@/lib/track'
import styles from './ThemePicker.module.css'
import form from './ThemeSignup.module.css'

export default function SignUpFormCollabThemes({ selection, onBack, onRestart }: { selection: ThemeSelection | null; onBack?: () => void; onRestart?: () => void }) {
  const [channel, setChannel] = useState<'whatsapp' | 'instagram'>('whatsapp')
  const [contact, setContact] = useState('')
  const [dates, setDates] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [processing, setProcessing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const submitting = useRef(false)
  const images = imagesForIds(selection?.imageIds || [])

  useEffect(() => { initPageAnalytics('/sign-up-collab-themes', { version: 'v3', inline: !!onBack }) }, [onBack])

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
    } catch { setError('Could not add that photo. Please try again.') }
    finally { setProcessing(false); input.value = '' }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selection || submitting.current || processing) return
    const data = new FormData(event.currentTarget)
    if (data.get('company')) return
    const chosen = parseThemeSelection(selection)
    if (!chosen) { setError('Your picks didn’t come through. Go back and choose again.'); return }
    let value = contact.trim()
    if (channel === 'whatsapp') {
      const digits = value.replace(/\D/g, '').length
      if (!/^\+[\d\s().-]{7,24}$/.test(value) || digits < 7 || digits > 15) { setError('Enter your WhatsApp number with its country code, for example +7 701 123 4567.'); return }
    } else {
      value = value.replace(/^@/, '')
      if (!/^[a-zA-Z0-9._]{1,30}$/.test(value)) { setError('Enter your Instagram username, without a link.'); return }
    }
    if (!dates.length) { setError('Choose the dates that work for you.'); return }
    if (!photos.length) { setError('Add at least one photo of you.'); return }
    submitting.current = true; setSaving(true); setError('')
    track('submit_attempt', { photos: photos.length, picks: images.length, channel })
    try {
      const response = await fetch('/api/sign-up', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: 'Almaty', contactMethod: channel, contact: value, themeSelection: chosen,
          moodboard: ['Collab sign-up', 'Location: Almaty', `Available: ${dates.join(', ')} September 2026`, ...(notes.trim() ? [`Notes: ${notes.trim()}`] : [])],
          photos,
        }),
      })
      const result = await response.json().catch(() => null)
      if (!response.ok || !result?.ok) throw new Error('Save failed')
      setDone(true)
      track('submit_success', { picks: images.length, photos: photos.length, channel }); flushNow()
      const fbq = (window as typeof window & { fbq?: (...args: unknown[]) => void }).fbq
      fbq?.('track', 'Lead', { source: 'sign-up-collab-themes' })
    } catch {
      setError('Your signup didn’t save. Your picks are still here — please try again.')
      track('submit_error', { picks: images.length })
    } finally { submitting.current = false; setSaving(false) }
  }

  return <section className={styles.page}><div className={styles.shell}>
    <div className={styles.topbar}><a href="/" className={styles.wordmark}>Aidan Torrence</a><span>Almaty · Sept 7–9</span></div>
    {!selection ? <div className={styles.heading}><a href="/choose-your-theme" className={styles.primary} style={{ marginTop: 24 }}>Choose your photos <span>↗</span></a></div> : <>
      {done
        ? <div className={styles.heading}><h1>Got it.</h1><p>I’ll message you to plan the shoot.</p></div>
        : <div className={form.signupCta}><h1 className={styles.cta}><strong>Now sign up.</strong></h1><p>Your picks are saved. Fill this in and I’ll message you.</p></div>}
      <div className={form.boardSummary}>
        <div className={form.filmstrip}>{images.map(image => <img src={image.src} alt={image.alt} key={image.id} />)}</div>
        {!done && (onBack || onRestart) && <div className={form.boardActions}>{onBack && <button type="button" className={`${styles.textButton} ${form.back}`} onClick={onBack}>← Back</button>}{onRestart && <button type="button" className={styles.textButton} onClick={onRestart}>Start over</button>}</div>}
      </div>
      {done ? <div className={styles.reviewActions}><a className={styles.textButton} href="https://www.instagram.com/madebyaidan" target="_blank" rel="noreferrer">@madebyaidan</a></div> : <form className={form.form} onSubmit={submit}>
        <fieldset><legend>Where should I message you?</legend><div className={form.channels}>{(['whatsapp', 'instagram'] as const).map(item => <button type="button" key={item} aria-pressed={channel === item} onClick={() => { setChannel(item); setContact(''); setError('') }}>{item === 'whatsapp' ? 'WhatsApp' : 'Instagram'}</button>)}</div><label className={form.field}><span className={styles.srOnly}>{channel === 'whatsapp' ? 'WhatsApp number' : 'Instagram username'}</span><input required type={channel === 'whatsapp' ? 'tel' : 'text'} autoComplete={channel === 'whatsapp' ? 'tel' : 'off'} autoCapitalize="none" maxLength={40} value={contact} onChange={event => setContact(event.target.value)} placeholder={channel === 'whatsapp' ? '+7 701 123 4567' : '@yourusername'} /></label>{channel === 'instagram' && <p className={form.hint}>Please follow <a href="https://www.instagram.com/madebyaidan" target="_blank" rel="noreferrer">@madebyaidan</a> or I won’t be able to message you.</p>}</fieldset>
        <fieldset><legend>When are you free?</legend><div className={form.dates}>{['7', '8', '9'].map(day => <button type="button" key={day} aria-pressed={dates.includes(day)} onClick={() => setDates(current => current.includes(day) ? current.filter(value => value !== day) : [...current, day].sort())}>Sept {day}</button>)}</div></fieldset>
        <label className={form.field}>Notes <span>optional</span><textarea maxLength={1500} rows={3} value={notes} onChange={event => setNotes(event.target.value)} /></label>
        <div><label className={form.field} htmlFor="model-photos">Photos of you <span>up to 3</span></label><div className={form.uploads}>{photos.map((photo, index) => <div key={photo}><img src={photo} alt={`Your photo ${index + 1}`} /><button type="button" aria-label={`Remove your photo ${index + 1}`} disabled={processing || saving} onClick={() => setPhotos(previous => previous.filter((_, i) => i !== index))}>×</button></div>)}</div><input id="model-photos" type="file" accept="image/*,.heic,.heif" multiple disabled={processing || saving || photos.length >= 3} onChange={addPhotos} className={form.fileInput} />{processing && <p role="status" className={form.hint}>Adding your photos…</p>}</div>
        <div className={styles.srOnly} aria-hidden="true"><label>Company<input name="company" tabIndex={-1} autoComplete="off" /></label></div>
        {error && <p role="alert" className={form.error}>{error}</p>}
        <div className={form.submitBar}><button type="submit" disabled={saving || processing} className={styles.primary}>{saving ? 'Signing up…' : processing ? 'Adding photos…' : 'Sign up'}<span aria-hidden="true">↗</span></button></div>
      </form>}
    </>}
  </div></section>
}
