import { neon } from '@neondatabase/serverless'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

type Signup = {
  id: number
  city: string
  contact_method: string
  contact: string
  moodboard: string[] | null
  photo_url: string | null
  created_at: string
}

async function getSignups(): Promise<Signup[]> {
  const url = process.env.DATABASE_URL
  if (!url) return []
  const sql = neon(url)
  try {
    const rows = await sql`SELECT id, city, contact_method, contact, moodboard, photo_url, created_at FROM signups ORDER BY created_at DESC`
    return rows as Signup[]
  } catch (e) {
    console.error('[ADMIN] Failed to fetch signups:', e)
    return []
  }
}

export default async function AdminPage() {
  const signups = await getSignups()

  return (
    <>
      <style>{`header, footer { display: none !important; }`}</style>
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
                        className="h-16 w-16 flex-shrink-0 rounded-lg border border-white/10 object-cover"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{s.contact}</span>
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/50">
                          {s.contact_method === 'whatsapp' ? 'WhatsApp' : 'Instagram'}
                        </span>
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
