"use client"
import { useCallback, useEffect, useState } from 'react'

type Signup = {
  id: number
  city: string
  contact_method: string
  contact: string
  moodboard: string[] | null
  photo_url: string | null
  photos: string[] | null
  created_at: string
}

function contactLink(s: Signup) {
  const handle = s.contact.replace(/^@/, '')
  if (s.contact_method === 'instagram') return `https://instagram.com/${handle}`
  if (s.contact_method === 'whatsapp') return `https://wa.me/${s.contact.replace(/\D/g, '')}`
  return null
}

function getPhotos(s: Signup): string[] {
  if (s.photos && s.photos.length > 0) return s.photos
  if (s.photo_url) return [s.photo_url]
  return []
}

export default function AdminClient({ signups: initial }: { signups: Signup[] }) {
  const [signups, setSignups] = useState(initial)
  const [lightbox, setLightbox] = useState<{ photos: string[]; index: number } | null>(null)

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
          <img
            src={lightbox.photos[lightbox.index]}
            alt=""
            className="max-h-[80vh] max-w-[90vw] rounded-2xl object-contain"
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
                  <img src={p} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <section className="min-h-screen bg-[#0a0a0a] py-10 sm:py-14">
        <div className="mx-auto max-w-3xl px-5">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-white">Sign-ups</h1>
            <span className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white/60">
              {signups.length} total
            </span>
          </div>

          {signups.length === 0 ? (
            <p className="mt-10 text-center text-lg text-white/40">No sign-ups yet.</p>
          ) : (
            <div className="space-y-4">
              {signups.map(s => {
                const link = contactLink(s)
                const photos = getPhotos(s)
                return (
                  <div key={s.id} className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5 sm:p-6 transition hover:bg-white/[0.06]">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        {link ? (
                          <a href={link} target="_blank" rel="noopener noreferrer" className="text-base font-semibold text-white hover:text-emerald-400 transition">
                            {s.contact}
                          </a>
                        ) : (
                          <span className="text-base font-semibold text-white">{s.contact}</span>
                        )}
                        <span className="ml-2 rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-white/50 align-middle">
                          {s.contact_method === 'whatsapp' ? 'WhatsApp' : 'IG'}
                        </span>
                      </div>
                      <button onClick={() => softDelete(s.id)} className="text-sm text-white/15 hover:text-red-400 transition ml-4">
                        Remove
                      </button>
                    </div>

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-white/50 mb-3">
                      <span>{s.city}</span>
                      {s.created_at && (
                        <span>{new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                      )}
                    </div>

                    {/* Moodboard */}
                    {s.moodboard && s.moodboard.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {s.moodboard.map(m => (
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
                          <img
                            key={i}
                            src={p}
                            alt=""
                            className="h-32 w-32 flex-shrink-0 cursor-pointer rounded-xl border border-white/10 object-cover transition hover:border-white/30 hover:brightness-110"
                            onClick={() => openLightbox(photos, i)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
