'use client'
/* eslint-disable @next/next/no-img-element -- Pre-sized references and local upload previews need their original URLs. */

import { useEffect, useRef, useState } from 'react'
import { boardPath, imagesForIds, parseThemeSelection, themeLabel, type ThemeSelection } from '@/lib/themePicker'
import { fetchUploadTicket, preparePhoto, describePhotoFailures, type PhotoFailure } from '@/lib/signupPhotos'
import { initPageAnalytics, track, flushNow } from '@/lib/track'
import styles from './ThemePicker.module.css'
import form from './ThemeSignup.module.css'

export default function SignUpFormCollabThemes({ selection }: { selection: ThemeSelection | null }) {
  const [channel, setChannel] = useState<'whatsapp' | 'instagram'>('whatsapp')
  const [contact, setContact] = useState('')
  const [name, setName] = useState('')
  const [dates, setDates] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [suggestedUrl, setSuggestedUrl] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [processing, setProcessing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const submitting = useRef(false)
  const images = imagesForIds(selection?.imageIds || [])

  useEffect(() => { initPageAnalytics('/sign-up-collab-themes', { version: 'codex-v1' }) }, [])

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
    const chosen = parseThemeSelection({ ...selection, suggestedUrl: suggestedUrl.trim() })
    if (!chosen) { setError('Please use a complete http or https link for your moodboard.'); return }
    let value = contact.trim()
    if (channel === 'whatsapp') {
      const digits = value.replace(/\D/g, '').length
      if (!/^\+[\d\s().-]{7,24}$/.test(value) || digits < 7 || digits > 15) { setError('Enter your WhatsApp number with its country code, for example +7 701 123 4567.'); return }
    } else {
      value = value.replace(/^@/, '')
      if (!/^[a-zA-Z0-9._]{1,30}$/.test(value)) { setError('Enter your Instagram username, without a link.'); return }
    }
    if (!dates.length) { setError('Choose the dates that work for you.'); return }
    submitting.current = true; setSaving(true); setError('')
    track('submit_attempt', { photos: photos.length, picks: images.length, channel })
    try {
      const response = await fetch('/api/sign-up', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: 'Almaty', contactMethod: channel, contact: value, themeSelection: chosen,
          moodboard: ['Collab sign-up', 'Location: Almaty', ...(name.trim() ? [`Name: ${name.trim()}`] : []), `Available: ${dates.join(', ')} September 2026`, ...(notes.trim() ? [`Notes: ${notes.trim()}`] : [])],
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
    {!selection ? <div className={styles.heading}><h1>Let’s start with your moodboard.</h1><p>Pick a few photos you love, then sign up for your collab shoot.</p><a href="/choose-your-theme" className={styles.primary} style={{ marginTop: 24 }}>Choose your theme <span>↗</span></a></div> : <>
      <div className={styles.heading}><p className={styles.eyebrow}>{done ? 'Signup received' : 'Your moodboard → your shoot'}</p><h1>{done ? 'Let’s make it happen.' : 'Let’s shoot in Almaty.'}</h1><p>{done ? `Your ${images.length} photo references and details are saved. I’ll message you to plan the shoot.` : 'A free collab shoot, planned around you. Leave your details and I’ll message you.'}</p></div>
      <div className={form.boardSummary}><div className={form.filmstrip}>{images.map(image => <img src={image.src} alt={image.alt} key={image.id} />)}</div><div className={form.boardCaption}><span>{images.length} {images.length === 1 ? 'reference' : 'references'} · {themeLabel(selection.theme)}</span><a href={done ? boardPath(selection) : '/choose-your-theme'}>{done ? 'View moodboard' : 'Edit picks'}</a></div></div>
      {done ? <div className={styles.reviewActions}><a href={boardPath(selection)} className={styles.primary}>See your moodboard <span>↗</span></a><a className={styles.textButton} href="https://www.instagram.com/madebyaidan" target="_blank" rel="noreferrer">Find me on Instagram · @madebyaidan</a></div> : <form className={form.form} onSubmit={submit}>
        <label className={form.field}>Your name <span>optional</span><input autoComplete="given-name" maxLength={100} value={name} onChange={event => setName(event.target.value)} placeholder="What should I call you?" /></label>
        <fieldset><legend>Where should I message you?</legend><div className={form.channels}>{(['whatsapp', 'instagram'] as const).map(item => <button type="button" key={item} aria-pressed={channel === item} onClick={() => { setChannel(item); setContact(''); setError('') }}>{item === 'whatsapp' ? 'WhatsApp' : 'Instagram'}</button>)}</div><label className={form.field}><span className={styles.srOnly}>{channel === 'whatsapp' ? 'WhatsApp number' : 'Instagram username'}</span><input required type={channel === 'whatsapp' ? 'tel' : 'text'} autoComplete={channel === 'whatsapp' ? 'tel' : 'off'} autoCapitalize="none" maxLength={40} value={contact} onChange={event => setContact(event.target.value)} placeholder={channel === 'whatsapp' ? '+7 701 123 4567' : '@yourusername'} /></label>{channel === 'whatsapp' && <p className={form.hint}>Include your country code.</p>}</fieldset>
        <fieldset><legend>When are you free?</legend><div className={form.dates}>{['7', '8', '9'].map(day => <button type="button" key={day} aria-pressed={dates.includes(day)} onClick={() => setDates(current => current.includes(day) ? current.filter(value => value !== day) : [...current, day].sort())}>Sept {day}</button>)}</div><p className={form.hint}>Choose all that work. We’ll arrange the time together.</p></fieldset>
        <label className={form.field}>Your own moodboard link <span>optional</span><input type="url" maxLength={2000} value={suggestedUrl} onChange={event => setSuggestedUrl(event.target.value)} placeholder="https://pinterest.com/…" /><p className={form.hint}>Have more inspiration? I’ll save this with your picks.</p></label>
        <label className={form.field}>Anything you’d love to try? <span>optional</span><textarea maxLength={1500} rows={3} value={notes} onChange={event => setNotes(event.target.value)} placeholder="An outfit, a location, a feeling…" /></label>
        <div><label className={form.field} htmlFor="model-photos">A few photos of you <span>optional · up to 3</span></label><p className={form.hint}>Simple snapshots are great.</p><div className={form.uploads}>{photos.map((photo, index) => <div key={photo}><img src={photo} alt={`Your photo ${index + 1}`} /><button type="button" aria-label={`Remove your photo ${index + 1}`} disabled={processing || saving} onClick={() => setPhotos(previous => previous.filter((_, i) => i !== index))}>×</button></div>)}</div><input id="model-photos" type="file" accept="image/*,.heic,.heif" multiple disabled={processing || saving || photos.length >= 3} onChange={addPhotos} className={form.fileInput} />{processing && <p role="status" className={form.hint}>Adding your photos…</p>}</div>
        <div className={styles.srOnly} aria-hidden="true"><label>Company<input name="company" tabIndex={-1} autoComplete="off" /></label></div>
        {error && <p role="alert" className={form.error}>{error}</p>}
        <button type="submit" disabled={saving || processing} className={styles.primary}>{saving ? 'Saving your signup…' : processing ? 'Adding photos…' : 'Send my collab signup'}<span aria-hidden="true">↗</span></button>
        <p className={styles.footnote}>Your details and moodboard go to Aidan to plan your shoot.</p>
      </form>}
    </>}
    <div className={styles.credits}>Aidan Torrence · codex</div>
  </div></section>
}
