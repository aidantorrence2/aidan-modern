"use client"
import { useState } from 'react'

type Signup = {
  id: number
  city: string
  contact_method: string
  contact: string
  moodboard: string[] | null
  photo_url: string | null
  created_at: string
}

function contactLink(s: Signup) {
  const handle = s.contact.replace(/^@/, '')
  if (s.contact_method === 'instagram') {
    return `https://instagram.com/${handle}`
  }
  if (s.contact_method === 'whatsapp') {
    const digits = s.contact.replace(/\D/g, '')
    return `https://wa.me/${digits}`
  }
  return null
}

export default function AdminClient({ signups: initial }: { signups: Signup[] }) {
  const [signups, setSignups] = useState(initial)
  const [zoomedPhoto, setZoomedPhoto] = useState<string | null>(null)

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

      {zoomedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setZoomedPhoto(null)}
        >
          <img src={zoomedPhoto} alt="" className="max-h-[85vh] max-w-[90vw] rounded-xl object-contain" />
          <button
            onClick={() => setZoomedPhoto(null)}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xl text-white hover:bg-white/20"
          >
            &times;
          </button>
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
                return (
                  <div key={s.id} className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5 sm:p-6 transition hover:bg-white/[0.06]">
                    <div className="flex items-start gap-5">
                      {s.photo_url && (
                        <img
                          src={s.photo_url}
                          alt=""
                          className="h-28 w-28 flex-shrink-0 cursor-pointer rounded-xl border border-white/10 object-cover transition hover:border-white/30 hover:scale-105"
                          onClick={() => setZoomedPhoto(s.photo_url)}
                        />
                      )}
                      <div className="min-w-0 flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            {link ? (
                              <a
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-base font-semibold text-white hover:text-emerald-400 transition"
                              >
                                {s.contact}
                              </a>
                            ) : (
                              <span className="text-base font-semibold text-white">{s.contact}</span>
                            )}
                            <span className="ml-2 rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-white/50 align-middle">
                              {s.contact_method === 'whatsapp' ? 'WhatsApp' : 'IG'}
                            </span>
                          </div>
                          <button
                            onClick={() => softDelete(s.id)}
                            className="text-sm text-white/15 hover:text-red-400 transition ml-4"
                          >
                            Remove
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-white/50">
                          <span>{s.city}</span>
                          {s.created_at && (
                            <span>{new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                          )}
                        </div>

                        {s.moodboard && s.moodboard.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {s.moodboard.map(m => (
                              <span key={m} className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-400/70">
                                {m}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
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
