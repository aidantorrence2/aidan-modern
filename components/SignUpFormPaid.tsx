'use client'
/* eslint-disable @next/next/no-img-element -- Pre-sized references and local upload previews need their original URLs. */

import { useRef, useState } from 'react'
import { imagesForIds, parseThemeSelection, type ThemeSelection } from '@/lib/themePicker'
import { fetchUploadTicket, preparePhoto, describePhotoFailures, type PhotoFailure } from '@/lib/signupPhotos'
import { track, flushNow } from '@/lib/track'
import { apiContactMethod, CONTACT_CHANNELS, PAID_COPY as copy, packagesFor, price, subjectLabel, type ContactChannel, type SubjectId } from '@/lib/paidShoot'
import styles from './ThemePicker.module.css'
import form from './ThemeSignup.module.css'
import paid from './PaidPicker.module.css'

type Props = { subject: SubjectId; selection: ThemeSelection; onBack: () => void; onRestart: () => void }

export default function SignUpFormPaid({ subject, selection, onBack, onRestart }: Props) {
  const packages = packagesFor(subject)
  const [packageId, setPackageId] = useState(packages[0].id)
  const [channel, setChannel] = useState<ContactChannel>('text')
  // One number serves both phone channels: typing it under "Text / phone"
  // fills WhatsApp too, and vice versa.
  const [phone, setPhone] = useState('')
  const [instagram, setInstagram] = useState('')
  const [location, setLocation] = useState('')
  const [when, setWhen] = useState('')
  const [brandName, setBrandName] = useState('')
  const [notes, setNotes] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [processing, setProcessing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const submitting = useRef(false)
  const images = imagesForIds(selection.imageIds)
  const chosenPackage = packages.find(pkg => pkg.id === packageId) || packages[0]
  const phoneChannel = channel !== 'instagram'

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
    if (submitting.current || processing) return
    const data = new FormData(event.currentTarget)
    if (data.get('company')) return
    const chosen = parseThemeSelection(selection)
    if (!chosen) { setError(copy.errors.picksLost); return }
    let contact: string
    if (phoneChannel) {
      contact = phone.trim()
      const digits = contact.replace(/\D/g, '').length
      if (!/^\+?[\d\s().-]{7,24}$/.test(contact) || digits < 7 || digits > 15) { setError(copy.errors.phone); return }
    } else {
      contact = instagram.trim().replace(/^@/, '')
      if (!/^[a-zA-Z0-9._]{1,30}$/.test(contact)) { setError(copy.errors.instagram); return }
    }
    const place = location.trim()
    if (!place) { setError(copy.errors.noLocation); return }
    const brand = brandName.trim()
    if (subject === 'brand' && !brand) { setError(copy.errors.noBrand); return }
    const channelLabel = CONTACT_CHANNELS.find(item => item.id === channel)?.label || channel
    submitting.current = true; setSaving(true); setError('')
    const analytics = { subject, package: chosenPackage.id, price: chosenPackage.price, channel, photos: photos.length, picks: images.length, location: place }
    track('submit_attempt', analytics)
    try {
      const response = await fetch('/api/sign-up', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: place, contactMethod: apiContactMethod(channel), contact, themeSelection: chosen,
          // "Location:" is what the admin page and the phone-country inference
          // read; the rest is for Aidan when he opens the row.
          moodboard: [
            'Paid sign-up',
            `Subject: ${subjectLabel(subject)}`,
            `Package: ${chosenPackage.name} — ${price(chosenPackage.price)}`,
            `Contact preference: ${channelLabel}`,
            `Location: ${place}`,
            ...(when.trim() ? [`When: ${when.trim()}`] : []),
            ...(brand ? [`Brand: ${brand}`] : []),
            ...(notes.trim() ? [`Notes: ${notes.trim()}`] : []),
          ],
          photos,
        }),
      })
      const result = await response.json().catch(() => null)
      if (!response.ok || !result?.ok) throw new Error('Save failed')
      setDone(true)
      track('submit_success', analytics); flushNow()
      const fbq = (window as typeof window & { fbq?: (...args: unknown[]) => void }).fbq
      fbq?.('track', 'Lead', { source: 'sign-up', value: chosenPackage.price, currency: 'USD' })
    } catch {
      setError(copy.errors.saveFailed)
      track('submit_error', { subject, package: chosenPackage.id })
    } finally { submitting.current = false; setSaving(false) }
  }

  return <section className={styles.page}>
    <style dangerouslySetInnerHTML={{ __html: 'body > header, body > footer, .fixed.inset-x-0.bottom-0 { display: none !important; }' }} />
    <div className={styles.shell}>
    <div className={styles.topbar}>
      <a href="/" className={styles.wordmark}>{copy.wordmark}</a>
      <span>{copy.corner}</span>
    </div>
    {done
      ? <div className={styles.heading}><h1>{copy.doneTitle}</h1><p>{copy.doneNote}</p></div>
      : <div className={form.signupCta}><h1 className={styles.cta}><strong>{copy.formTitle}</strong></h1><p>{copy.formNote}</p></div>}
    <div className={form.boardSummary}>
      <div className={form.filmstrip}>{images.map(image => <img src={image.src} alt={image.alt} key={image.id} />)}</div>
      <div className={paid.chips}><span>{subjectLabel(subject)}</span>{done && <span>{chosenPackage.name} · {price(chosenPackage.price)}</span>}</div>
      {!done && <div className={form.boardActions}><button type="button" className={`${styles.textButton} ${form.back}`} onClick={onBack}>{copy.back}</button><button type="button" className={styles.textButton} onClick={onRestart}>{copy.startOver}</button></div>}
    </div>
    {done ? <div className={styles.reviewActions}><a className={styles.textButton} href="https://www.instagram.com/madebyaidan" target="_blank" rel="noreferrer">@madebyaidan</a></div> : <form className={form.form} onSubmit={submit}>
      <fieldset>
        <legend>{copy.package}</legend>
        <div className={paid.packages}>{packages.map(pkg => (
          <button type="button" key={pkg.id} className={paid.package} aria-pressed={packageId === pkg.id} onClick={() => { setPackageId(pkg.id); setError('') }}>
            <span className={paid.packageHead}><strong>{pkg.name}</strong><b>{price(pkg.price)}</b></span>
            <span className={paid.packageTime}>{pkg.time}</span>
            <ul className={paid.packageIncludes}>{pkg.includes.map(item => <li key={item}>{item}</li>)}</ul>
            {pkg.note && packageId === pkg.id && <span className={paid.packageNote}>{pkg.note}</span>}
          </button>
        ))}</div>
      </fieldset>
      <fieldset>
        <legend>{copy.howToContact}</legend>
        <div className={form.channels}>{CONTACT_CHANNELS.map(item => <button type="button" key={item.id} aria-pressed={channel === item.id} onClick={() => { setChannel(item.id); setError('') }}>{item.label}</button>)}</div>
        {phoneChannel
          ? <label className={form.field}><span className={styles.srOnly}>{copy.phoneLabel}</span><input required type="tel" name="phone" autoComplete="tel" inputMode="tel" maxLength={40} value={phone} onChange={event => setPhone(event.target.value)} placeholder={copy.phonePlaceholder} /></label>
          : <label className={form.field}><span className={styles.srOnly}>{copy.instagramLabel}</span><input required type="text" name="instagram" autoComplete="off" autoCapitalize="none" maxLength={40} value={instagram} onChange={event => setInstagram(event.target.value)} placeholder={copy.instagramPlaceholder} /></label>}
        {channel === 'text' && <p className={form.hint}>{copy.textHint}</p>}
        {channel === 'whatsapp' && <p className={form.hint}>{copy.whatsappHint}</p>}
        {channel === 'instagram' && <p className={form.hint}>{copy.followHint.before}<a href="https://www.instagram.com/madebyaidan" target="_blank" rel="noreferrer">@madebyaidan</a>{copy.followHint.after}</p>}
      </fieldset>
      <label className={form.field}>{copy.whereAreYou}<input required type="text" name="location" autoComplete="address-level2" maxLength={80} value={location} onChange={event => setLocation(event.target.value)} placeholder={copy.wherePlaceholder} /></label>
      <label className={form.field}>{copy.when} <span>{copy.optional}</span><input type="text" name="when" autoComplete="off" maxLength={120} value={when} onChange={event => setWhen(event.target.value)} placeholder={copy.whenPlaceholder} /></label>
      {subject === 'brand' && <label className={form.field}>{copy.brandName}<input required type="text" name="brand" autoComplete="organization" maxLength={120} value={brandName} onChange={event => setBrandName(event.target.value)} placeholder={copy.brandPlaceholder} /></label>}
      <label className={form.field}>{copy.notes} <span>{copy.optional}</span><textarea maxLength={1500} rows={3} value={notes} onChange={event => setNotes(event.target.value)} /></label>
      <div><label className={form.field} htmlFor="paid-photos">{subject === 'brand' ? copy.photosOfBrand : copy.photosOfYou} <span>{copy.upTo3}</span></label><div className={form.uploads}>{photos.map((photo, index) => <div key={photo}><img src={photo} alt={copy.yourPhoto(index + 1)} /><button type="button" aria-label={copy.removePhoto(index + 1)} disabled={processing || saving} onClick={() => setPhotos(previous => previous.filter((_, i) => i !== index))}>×</button></div>)}</div><input id="paid-photos" type="file" accept="image/*,.heic,.heif" multiple disabled={processing || saving || photos.length >= 3} onChange={addPhotos} className={form.fileInput} />{processing && <p role="status" className={form.hint}>{copy.addingPhotos}</p>}</div>
      <div className={styles.srOnly} aria-hidden="true"><label>Company<input name="company" tabIndex={-1} autoComplete="off" /></label></div>
      {error && <p role="alert" className={form.error}>{error}</p>}
      <div className={form.submitBar}>
        <p className={paid.total}><span>{chosenPackage.name}</span><b>{price(chosenPackage.price)}</b></p>
        <button type="submit" disabled={saving || processing} className={styles.primary}>{saving ? copy.booking : processing ? copy.addingPhotos : copy.book}<span aria-hidden="true">↗</span></button>
      </div>
    </form>}
  </div></section>
}
