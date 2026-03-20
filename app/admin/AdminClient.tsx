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

      <section className="min-h-screen bg-[#0a0a0a] py-10">
        <div className="mx-auto max-w-4xl px-5">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Sign-ups</h1>
            <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white/60">
              {signups.length} total
            </span>
          </div>

          {signups.length === 0 ? (
            <p className="mt-10 text-center text-white/40">No sign-ups yet.</p>
          ) : (
            <div className="mt-6 space-y-3">
              {signups.map(s => (
                <div key={s.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start gap-4">
                    {s.photo_url && (
                      <img
                        src={s.photo_url}
                        alt=""
                        className="h-24 w-24 flex-shrink-0 cursor-pointer rounded-lg border border-white/10 object-cover transition hover:border-white/30 hover:opacity-80"
                        onClick={() => setZoomedPhoto(s.photo_url)}
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white">{s.contact}</span>
                          <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/50">
                            {s.contact_method === 'whatsapp' ? 'WhatsApp' : 'Instagram'}
                          </span>
                        </div>
                        <button
                          onClick={() => softDelete(s.id)}
                          className="text-xs text-white/20 hover:text-red-400 transition"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/40">
                        <span>{s.city}</span>
                        {s.created_at && (
                          <span>{new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                        )}
                      </div>
                      {s.moodboard && s.moodboard.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {s.moodboard.map(m => (
                            <span key={m} className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-white/50">
                              {m}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
