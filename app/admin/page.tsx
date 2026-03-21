import { neon } from '@neondatabase/serverless'
import AdminClient from './AdminClient'
import AutoRefresh from './AutoRefresh'

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
  photos: string[] | null
  created_at: string
}

async function getSignups(): Promise<Signup[]> {
  const url = process.env.DATABASE_URL
  if (!url) return []
  const sql = neon(url)
  try {
    const rows = await sql`SELECT id, city, contact_method, contact, moodboard, photo_url, photos, created_at FROM signups WHERE deleted_at IS NULL ORDER BY created_at DESC`
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
      <AutoRefresh interval={10000} />
      <AdminClient signups={signups} />
    </>
  )
}
