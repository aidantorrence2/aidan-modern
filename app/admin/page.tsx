"use client"
import { useEffect, useState } from 'react'

type Signup = {
  id: number
  city: string
  contact_method: string
  contact: string
  moodboard: string[] | null
  created_at: string
}

export default function AdminPage() {
  const [signups, setSignups] = useState<Signup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchSignups() {
    try {
      const res = await fetch('/api/admin/signups')
      if (!res.ok) throw new Error(`${res.status}`)
      const data = await res.json()
      setSignups(data)
      setError(null)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSignups()
    const interval = setInterval(fetchSignups, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <style>{`header, footer { display: none !important; }`}</style>
      <section className="min-h-screen bg-[#0a0a0a] py-10">
        <div className="mx-auto max-w-4xl px-5">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Sign-ups</h1>
            <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white/60">
              {loading ? '...' : `${signups.length} total`}
            </span>
          </div>

          {error && (
            <p className="mt-4 text-sm text-red-400">Error: {error}</p>
          )}

          {loading ? (
            <p className="mt-10 text-center text-white/40">Loading...</p>
          ) : signups.length === 0 ? (
            <p className="mt-10 text-center text-white/40">No sign-ups yet.</p>
          ) : (
            <div className="mt-6 space-y-3">
              {signups.map(s => (
                <div key={s.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{s.contact}</span>
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/50">
                        {s.contact_method === 'whatsapp' ? 'WhatsApp' : 'Instagram'}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/40">
                      <span>{s.city}</span>
                      <span>{new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
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
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
