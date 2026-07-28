import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { fetchAllSignups } from '@/lib/adminSignups'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    return NextResponse.json({ error: 'Missing database credentials' }, { status: 500 })
  }

  const supabase = createClient(url, key)
  const { searchParams } = new URL(request.url)

  try {
    const signups = await fetchAllSignups(supabase, {
      deleted: searchParams.get('deleted') === 'true',
      contact: searchParams.get('contact'),
    })
    return NextResponse.json({ count: signups.length, signups })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
