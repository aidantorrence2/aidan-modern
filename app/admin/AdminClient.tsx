"use client"
import { useCallback, useEffect, useRef, useState } from 'react'
import NextImage from 'next/image'
import { normalizeWhatsapp } from '../../lib/whatsapp'
import { isUpdatedEntry, readUpdatedAt } from '../../lib/signupActivity'
import { imagesForIds } from '../../lib/themePicker'

type Signup = {
  id: number
  city: string
  contact_method: string
  contact: string
  moodboard: string[] | null
  photo_urls: string[] | null
  created_at: string
  updated_at?: string | null
}

const stamp = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })

/** Rows sort by last touch, so a sign-up enriched days later sits at the top
 *  above its own creation date. Surface the edit rather than leave that
 *  looking like a shuffle — but only once it's a minute clear of the insert,
 *  since the photo write at capture time lands moments after the row, and a
 *  row with no edit to show is stamped at its own created_at. */
function getUpdated(s: Signup): string | null {
  const stamp = s.updated_at ?? readUpdatedAt(s.moodboard)
  if (!stamp) return null
  const gap = Date.parse(stamp) - Date.parse(s.created_at)
  return Number.isFinite(gap) && gap > 60_000 ? stamp : null
}

function instagramLink(handle: string) {
  return `https://instagram.com/${handle.replace(/^@/, '')}`
}

// WhatsApp links are built via normalizeWhatsapp(contact, city) at the call site,
// so numbers missing their international code get one inferred from the signup's city.

function getInstagram(s: Signup): string | null {
  if (s.contact_method === 'instagram') return s.contact
  if (s.moodboard) {
    const entry = s.moodboard.find(m => /^instagram:/i.test(m))
    if (entry) return entry.replace(/^instagram:\s*/i, '').trim()
  }
  return null
}

/** WhatsApp and LINE are both phone-number channels and share one row. A LINE
 *  row can also carry no number at all — the visitor tapped the add-friend link
 *  instead of typing one — in which case there is nothing to dial. */
function getPhoneContact(s: Signup): string | null {
  if (s.contact_method !== 'whatsapp' && s.contact_method !== 'line') return null
  return (s.contact.match(/\d/g) ?? []).length >= 7 ? s.contact : null
}

/** A LINE row whose contact is a handle or a placeholder, not a number. */
function getNumberlessLine(s: Signup): string | null {
  if (s.contact_method !== 'line' || getPhoneContact(s)) return null
  return s.contact
}

/** LINE signups written before the column knew 'line' carry "Channel: LINE". */
function isLine(s: Signup): boolean {
  return s.contact_method === 'line' || !!s.moodboard?.some(m => /^channel:\s*line$/i.test(m))
}

/** The user's real location is stored in moodboard as "Location: <place>";
 *  the `city` column is an unreliable campaign label (e.g. "Bali (collab)"). */
function getLocation(s: Signup): string {
  const entry = s.moodboard?.find(m => /^location:/i.test(m))
  return entry ? entry.replace(/^location:\s*/i, '').trim() : s.city
}

function getPhotos(s: Signup): string[] {
  return s.photo_urls && s.photo_urls.length > 0 ? s.photo_urls : []
}

/** Insert Cloudinary transformation into URL for optimized delivery */
function cloudinaryUrl(url: string, transforms: string): string {
  const marker = '/upload/'
  const idx = url.indexOf(marker)
  if (idx === -1) return url
  return url.slice(0, idx + marker.length) + transforms + '/' + url.slice(idx + marker.length)
}

/** Thumbnail: 256px, auto quality & format */
function thumbUrl(url: string): string {
  return cloudinaryUrl(url, 'w_256,h_256,c_fill,q_auto,f_auto')
}

/** Lightbox: capped at 1200px wide, auto quality & format */
function lightboxUrl(url: string): string {
  return cloudinaryUrl(url, 'w_1200,q_auto,f_auto')
}

/** Mini thumbnail for lightbox strip: 80px */
function miniThumbUrl(url: string): string {
  return cloudinaryUrl(url, 'w_80,h_80,c_fill,q_auto,f_auto')
}

/** Lazy-rendered card that only mounts when near viewport */
function LazyCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } },
      { rootMargin: '200px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} style={visible ? undefined : { minHeight: 120 }}>
      {visible ? children : null}
    </div>
  )
}

export default function AdminClient({ signups: initial }: { signups: Signup[] }) {
  const [signups, setSignups] = useState(initial)
  const [lightbox, setLightbox] = useState<{ photos: string[]; index: number } | null>(null)
  const [query, setQuery] = useState('')
  const [locationQuery, setLocationQuery] = useState('')

  const normalizedQuery = query.trim().replace(/^@/, '').toLowerCase()
  const digitsQuery = query.replace(/\D/g, '')
  const normalizedLocation = locationQuery.trim().toLowerCase()
  const hasFilter = Boolean(normalizedQuery || normalizedLocation)
  const filtered = hasFilter
    ? signups.filter(s => {
        if (normalizedQuery) {
          const ig = getInstagram(s)
          const igMatch = ig && ig.replace(/^@/, '').toLowerCase().includes(normalizedQuery)
          const phone = getPhoneContact(s)
          const phoneMatch = phone && digitsQuery && phone.replace(/\D/g, '').includes(digitsQuery)
          if (!igMatch && !phoneMatch) return false
        }
        if (normalizedLocation && !getLocation(s).toLowerCase().includes(normalizedLocation)) return false
        return true
      })
    : signups

  const closeLightbox = useCallback(() => {
    setLightbox(null)
    window.history.pushState(null, '', '/admin')
  }, [])

  const prevPhoto = useCallback(() => {
    setLightbox(lb => lb ? { ...lb, index: (lb.index - 1 + lb.photos.length) % lb.photos.length } : null)
  }, [])

  const nextPhoto = useCallback(() => {
    setLightbox(lb => lb ? { ...lb, index: (lb.index + 1) % lb.photos.length } : null)
  }, [])

  function openLightbox(photos: string[], index: number) {
    setLightbox({ photos, index })
    window.history.pushState({ lightbox: true }, '', '/admin#photo')
  }

  useEffect(() => {
    function onPopState() {
      if (lightbox) setLightbox(null)
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [lightbox])

  useEffect(() => {
    if (!lightbox) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') prevPhoto()
      if (e.key === 'ArrowRight') nextPhoto()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox, closeLightbox, prevPhoto, nextPhoto])

  async function softDelete(id: number) {
    if (!confirm('Remove this entry?')) return
    try {
      const res = await fetch('/api/admin/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      if (res.ok) setSignups(prev => prev.filter(s => s.id !== id))
    } catch { /* */ }
  }

  return (
    <>
      <style>{`header, footer { display: none !important; }`}</style>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-md">
          {/* Close */}
          <button
            onClick={closeLightbox}
            className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/20"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            Back
          </button>

          {/* Counter */}
          {lightbox.photos.length > 1 && (
            <div className="absolute top-5 right-5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/60">
              {lightbox.index + 1} / {lightbox.photos.length}
            </div>
          )}

          {/* Image */}
          <NextImage
            src={lightboxUrl(lightbox.photos[lightbox.index])}
            alt=""
            width={1200}
            height={800}
            priority
            className="max-h-[80vh] max-w-[90vw] rounded-2xl object-contain"
            style={{ width: 'auto', height: 'auto' }}
          />

          {/* Navigation arrows */}
          {lightbox.photos.length > 1 && (
            <>
              <button
                onClick={prevPhoto}
                className="absolute left-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white/80 transition hover:bg-white/20"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button
                onClick={nextPhoto}
                className="absolute right-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white/80 transition hover:bg-white/20"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </button>
            </>
          )}

          {/* Thumbnails */}
          {lightbox.photos.length > 1 && (
            <div className="mt-4 flex gap-2">
              {lightbox.photos.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setLightbox(lb => lb ? { ...lb, index: i } : null)}
                  className={`h-14 w-14 overflow-hidden rounded-lg border-2 transition ${
                    i === lightbox.index ? 'border-white' : 'border-transparent opacity-50 hover:opacity-80'
                  }`}
                >
                  <NextImage src={miniThumbUrl(p)} alt="" width={80} height={80} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <section className="min-h-screen bg-[#0a0a0a] py-10 sm:py-14">
        <div className="mx-auto max-w-3xl px-5">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-white">Sign-ups</h1>
            <span className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white/60">
              {hasFilter ? `${filtered.length} / ${signups.length}` : `${signups.length} total`}
            </span>
          </div>

          <div className="mb-6 flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by IG username or WhatsApp number…"
              className="w-full flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-emerald-400/40 focus:outline-none focus:ring-1 focus:ring-emerald-400/20"
            />
            <input
              type="text"
              value={locationQuery}
              onChange={e => setLocationQuery(e.target.value)}
              placeholder="Filter by location…"
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-emerald-400/40 focus:outline-none focus:ring-1 focus:ring-emerald-400/20 sm:w-56"
            />
          </div>

          {signups.length === 0 ? (
            <p className="mt-10 text-center text-lg text-white/40">No sign-ups yet.</p>
          ) : filtered.length === 0 ? (
            <p className="mt-10 text-center text-lg text-white/40">
              No matches for &ldquo;{[query.trim(), locationQuery.trim()].filter(Boolean).join('” + “')}&rdquo;.
            </p>
          ) : (
            <div className="space-y-4">
              {filtered.map(s => {
                const phone = getPhoneContact(s)
                const numberlessLine = getNumberlessLine(s)
                const line = isLine(s)
                const instagram = getInstagram(s)
                const rawContact = s.moodboard?.find(m => /^raw contact:/i.test(m))?.replace(/^raw contact:\s*/i, '').trim()
                const chosenIds = s.moodboard?.find(m => m.startsWith('Moodboard image IDs: '))?.slice('Moodboard image IDs: '.length).split(',') || []
                const chosenImages = imagesForIds(chosenIds)
                const moodboardItems = s.moodboard ? s.moodboard.filter(m => !/^instagram:/i.test(m) && !/^raw contact:/i.test(m) && !/^channel:/i.test(m) && !isUpdatedEntry(m) && !m.startsWith('Moodboard image IDs: ') && !m.startsWith('Reference: ')) : []
                const photos = getPhotos(s)
                const updated = getUpdated(s)
                return (
                  <LazyCard key={s.id}>
                    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5 sm:p-6 transition hover:bg-white/[0.06]">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex flex-col gap-1">
                          {phone && (() => {
                            const wa = normalizeWhatsapp(phone, getLocation(s))
                            // LINE has no "message this number" web link — the number
                            // is what you add as a friend, so link it as tel:.
                            const href = line ? `tel:${(wa.e164 ?? phone).replace(/[^\d+]/g, '')}` : wa.link
                            return (
                              <div>
                                <a href={href} target="_blank" rel="noopener noreferrer" className="text-base font-semibold text-white hover:text-emerald-400 transition">
                                  {wa.e164 ?? phone}
                                </a>
                                {rawContact ? (
                                  <span className="ml-2 text-xs text-white/30 align-middle" title={`entered as "${rawContact}" — normalized at signup`}>
                                    was {rawContact}
                                  </span>
                                ) : wa.resolved && wa.e164 && wa.e164.replace(/\D/g, '') !== phone.replace(/\D/g, '') && (
                                  <span className="ml-2 text-xs text-white/30 align-middle" title={`entered as "${phone}" — country code inferred from ${getLocation(s)}`}>
                                    was {phone}
                                  </span>
                                )}
                                <span className={`ml-2 rounded-full px-2.5 py-0.5 text-xs font-medium align-middle ${line ? 'bg-[#06C755]/15 text-[#06C755]' : 'bg-white/10 text-white/50'}`}>
                                  {line ? 'LINE' : 'WhatsApp'}
                                </span>
                              </div>
                            )
                          })()}
                          {numberlessLine && (
                            <div>
                              <span className="text-base font-semibold text-white/70">{numberlessLine}</span>
                              <span className="ml-2 rounded-full bg-[#06C755]/15 px-2.5 py-0.5 text-xs font-medium text-[#06C755] align-middle">
                                LINE &middot; added me
                              </span>
                            </div>
                          )}
                          {instagram && (
                            <div>
                              <a href={instagramLink(instagram)} target="_blank" rel="noopener noreferrer" className="text-base font-semibold text-white hover:text-emerald-400 transition">
                                {instagram}
                              </a>
                              <span className="ml-2 rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-white/50 align-middle">
                                IG
                              </span>
                            </div>
                          )}
                        </div>
                        <button onClick={() => softDelete(s.id)} className="text-sm text-white/15 hover:text-red-400 transition ml-4">
                          Remove
                        </button>
                      </div>

                      {/* Meta */}
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-white/50 mb-3">
                        {getLocation(s) && <span>{getLocation(s)}</span>}
                        {s.created_at && <span>{stamp(s.created_at)}</span>}
                        {updated && (
                          <span className="text-emerald-400/70">updated {stamp(updated)}</span>
                        )}
                      </div>

                      {/* Moodboard */}
                      {chosenImages.length > 0 && <div className="mb-3">
                        <p className="mb-2 text-xs text-emerald-300">Suggested moodboard · {chosenImages.length} picks</p>
                        <div className="flex gap-2 overflow-x-auto pb-2">{chosenImages.map(image => <button type="button" key={image.id} onClick={() => openLightbox(chosenImages.map(item => item.src), chosenImages.indexOf(image))} aria-label={`View moodboard reference: ${image.alt}`} className="shrink-0">
                          <NextImage src={image.src} alt={image.alt} width={96} height={128} className="h-28 w-20 rounded object-cover" />
                        </button>)}</div>
                      </div>}
                      {moodboardItems.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {moodboardItems.map(m => (
                            <span key={m} className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-400/70">
                              {m}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Photos */}
                      {photos.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto mt-2 pb-1">
                          {photos.map((p, i) => (
                            <NextImage
                              key={i}
                              src={thumbUrl(p)}
                              alt=""
                              width={128}
                              height={128}
                              className="h-32 w-32 flex-shrink-0 cursor-pointer rounded-xl border border-white/10 object-cover transition hover:border-white/30 hover:brightness-110"
                              onClick={() => openLightbox(photos, i)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </LazyCard>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
