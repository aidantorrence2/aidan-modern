'use client'
/* eslint-disable @next/next/no-img-element -- Pre-sized references need their original URLs. */

import { useRef, useState } from 'react'
import { imagesForIds, parseThemeSelection, type ThemeSelection } from '@/lib/themePicker'
import { track, flushNow } from '@/lib/track'
import { CONTACT_CHANNELS, PAID_COPY as copy, packagesFor, price, subjectLabel, type ContactChannel, type Market, type SubjectId } from '@/lib/paidShoot'
import styles from './ThemePicker.module.css'
import form from './ThemeSignup.module.css'
import paid from './PaidPicker.module.css'

type Props = { subject: SubjectId; market: Market; selection: ThemeSelection; onBack: () => void; onRestart: () => void }

export default function SignUpFormPaid({ subject, market, selection, onBack, onRestart }: Props) {
  const packages = packagesFor(subject)
  const [packageId, setPackageId] = useState(packages[0].id)
  const [channel, setChannel] = useState<ContactChannel>('text')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [social, setSocial] = useState('')
  const [location, setLocation] = useState('')
  const [when, setWhen] = useState('')
  const [brandName, setBrandName] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const submitting = useRef(false)
  const images = imagesForIds(selection.imageIds)
  const chosenPackage = packages.find(pkg => pkg.id === packageId) || packages[0]
  // Brands and companies are contacted by email; everyone else by phone.
  const byEmail = subject === 'brand'

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting.current) return
    const data = new FormData(event.currentTarget)
    if (data.get('company')) return
    const chosen = parseThemeSelection(selection)
    if (!chosen) { setError(copy.errors.picksLost); return }
    let contact: string
    if (byEmail) {
      contact = email.trim()
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact) || contact.length > 120) { setError(copy.errors.email); return }
    } else {
      contact = phone.trim()
      const digits = contact.replace(/\D/g, '').length
      if (!/^\+?[\d\s().-]{7,24}$/.test(contact) || digits < 7 || digits > 15) { setError(copy.errors.phone); return }
    }
    const place = location.trim()
    if (!place) { setError(copy.errors.noLocation); return }
    const brand = brandName.trim()
    if (subject === 'brand' && !brand) { setError(copy.errors.noBrand); return }
    const channelLabel = byEmail ? 'Email' : CONTACT_CHANNELS.find(item => item.id === channel)?.label || channel
    submitting.current = true; setSaving(true); setError('')
    const analytics = { subject, package: chosenPackage.id, price: chosenPackage.price, channel: byEmail ? 'email' : channel, social: !!social.trim(), picks: images.length, location: place, ...market.analytics }
    track('submit_attempt', analytics)
    try {
      const response = await fetch('/api/sign-up', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // The phone number rides the API's phone channel so it is normalized
          // to E.164 and the admin page gets a tap-to-message link.
          city: place, contactMethod: byEmail ? 'email' : 'whatsapp', contact, themeSelection: chosen,
          // "Location:" is what the admin page and the phone-country inference
          // read; the rest is for Aidan when he opens the row.
          moodboard: [
            'Paid sign-up',
            `Subject: ${subjectLabel(subject)}`,
            `Package: ${chosenPackage.name} — ${price(chosenPackage.price, market)}`,
            ...(market.tag ? [market.tag] : []),
            `Contact preference: ${channelLabel}`,
            ...(social.trim() ? [`WhatsApp / Instagram: ${social.trim()}`] : []),
            `Location: ${place}`,
            ...(when.trim() ? [`When: ${when.trim()}`] : []),
            ...(brand ? [`Brand: ${brand}`] : []),
            ...(notes.trim() ? [`Notes: ${notes.trim()}`] : []),
          ],
        }),
      })
      const result = await response.json().catch(() => null)
      if (!response.ok || !result?.ok) throw new Error('Save failed')
      setDone(true)
      track('submit_success', analytics); flushNow()
      const fbq = (window as typeof window & { fbq?: (...args: unknown[]) => void }).fbq
      fbq?.('track', 'Lead', { source: 'sign-up', value: chosenPackage.price, currency: market.currency })
    } catch {
      setError(copy.errors.saveFailed)
      track('submit_error', { subject, package: chosenPackage.id, ...market.analytics })
    } finally { submitting.current = false; setSaving(false) }
  }

  return <section className={styles.page}>
    <style dangerouslySetInnerHTML={{ __html: 'body > header, body > footer, .fixed.inset-x-0.bottom-0 { display: none !important; }' }} />
    <div className={styles.shell}>
    <div className={styles.topbar}>
      <a href="/" className={styles.wordmark}>{copy.wordmark}</a>
      <span>{copy.corner(market)}</span>
    </div>
    {done
      ? <div className={styles.heading}><h1>{copy.doneTitle}</h1><p>{copy.doneNote}</p></div>
      : <div className={form.signupCta}><h1 className={styles.cta}><strong>{copy.formTitle}</strong></h1><p>{copy.formNote}</p></div>}
    <div className={form.boardSummary}>
      <div className={form.filmstrip}>{images.map(image => <img src={image.src} alt={image.alt} key={image.id} />)}</div>
      <div className={paid.chips}><span>{subjectLabel(subject)}</span>{done && <span>{chosenPackage.name} · {price(chosenPackage.price, market)}</span>}</div>
      {!done && <div className={form.boardActions}><button type="button" className={`${styles.textButton} ${form.back}`} onClick={onBack}>{copy.back}</button><button type="button" className={styles.textButton} onClick={onRestart}>{copy.startOver}</button></div>}
    </div>
    {done ? <div className={styles.reviewActions}><a className={styles.textButton} href="https://www.instagram.com/madebyaidan" target="_blank" rel="noreferrer">@madebyaidan</a></div> : <form className={form.form} onSubmit={submit}>
      <fieldset>
        <legend>{copy.package}</legend>
        <div className={paid.packages}>{packages.map(pkg => (
          <button type="button" key={pkg.id} className={paid.package} aria-pressed={packageId === pkg.id} onClick={() => { setPackageId(pkg.id); setError('') }}>
            <span className={paid.packageHead}><strong>{pkg.name}</strong><b>{price(pkg.price, market)}</b></span>
            <span className={paid.packageTime}>{pkg.time}</span>
            <ul className={paid.packageIncludes}>{pkg.includes.map(item => <li key={item}>{item}</li>)}</ul>
            {pkg.note && packageId === pkg.id && <span className={paid.packageNote}>{pkg.note}</span>}
          </button>
        ))}</div>
      </fieldset>
      {byEmail ? (
        <div>
          <label className={form.field}>{copy.emailLabel}<input required type="email" name="email" autoComplete="email" inputMode="email" maxLength={120} value={email} onChange={event => setEmail(event.target.value)} placeholder={copy.emailPlaceholder} /></label>
          <p className={form.hint}>{copy.emailHint}</p>
        </div>
      ) : (
        <fieldset>
          <legend>{copy.howToContact}</legend>
          <div className={form.channels}>{CONTACT_CHANNELS.map(item => <button type="button" key={item.id} aria-pressed={channel === item.id} onClick={() => { setChannel(item.id); setError('') }}>{item.label}</button>)}</div>
          <label className={form.field}><span className={styles.srOnly}>{copy.phoneLabel}</span><input required type="tel" name="phone" autoComplete="tel" inputMode="tel" maxLength={40} value={phone} onChange={event => setPhone(event.target.value)} placeholder={market.phonePlaceholder} /></label>
          <p className={form.hint}>{market.phoneHint}</p>
        </fieldset>
      )}
      <label className={form.field}>{copy.social} <span>{copy.optional}</span><input type="text" name="social" autoComplete="off" autoCapitalize="none" maxLength={80} value={social} onChange={event => setSocial(event.target.value)} placeholder={copy.socialPlaceholder} /></label>
      <label className={form.field}>{copy.whereAreYou}<input required type="text" name="location" autoComplete="address-level2" maxLength={80} value={location} onChange={event => setLocation(event.target.value)} placeholder={copy.wherePlaceholder} /></label>
      <label className={form.field}>{copy.when} <span>{copy.optional}</span><input type="text" name="when" autoComplete="off" maxLength={120} value={when} onChange={event => setWhen(event.target.value)} placeholder={copy.whenPlaceholder} /></label>
      {subject === 'brand' && <label className={form.field}>{copy.brandName}<input required type="text" name="brand" autoComplete="organization" maxLength={120} value={brandName} onChange={event => setBrandName(event.target.value)} placeholder={copy.brandPlaceholder} /></label>}
      <label className={form.field}>{copy.notes} <span>{copy.optional}</span><textarea maxLength={1500} rows={3} value={notes} onChange={event => setNotes(event.target.value)} /></label>
      <div className={styles.srOnly} aria-hidden="true"><label>Company<input name="company" tabIndex={-1} autoComplete="off" /></label></div>
      {error && <p role="alert" className={form.error}>{error}</p>}
      <div className={form.submitBar}>
        <p className={paid.total}><span>{chosenPackage.name}</span><b>{price(chosenPackage.price, market)}</b></p>
        <button type="submit" disabled={saving} className={styles.primary}>{saving ? copy.booking : copy.book}<span aria-hidden="true">↗</span></button>
      </div>
    </form>}
  </div></section>
}
