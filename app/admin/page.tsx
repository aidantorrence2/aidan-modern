import { createClient } from '@supabase/supabase-js'
import AdminClient from './AdminClient'
import AutoRefresh from './AutoRefresh'
import { fetchAllSignups } from '@/lib/adminSignups'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

type Signup = {
  id: number
  city: string
  contact_method: string
  contact: string
  moodboard: string[] | null
  photo_urls: string[] | null
  created_at: string
}

async function getSignups(): Promise<Signup[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return []
  const sb = createClient(url, key)
  try {
    return await fetchAllSignups<Signup>(sb, {
      columns: 'id, city, contact_method, contact, moodboard, photo_urls, created_at',
    })
  } catch (error) {
    console.error('[ADMIN]', error)
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
