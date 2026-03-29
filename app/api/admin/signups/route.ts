import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    return NextResponse.json({ error: 'Missing database credentials' }, { status: 500 })
  }

  const supabase = createClient(url, key)
  const { searchParams } = new URL(request.url)
  const deleted = searchParams.get('deleted') === 'true'
  const contact = searchParams.get('contact')

  let query = supabase
    .from('signups')
    .select('id, city, contact_method, contact, moodboard, photo_urls, created_at, deleted_at')

  if (deleted) {
    query = query.not('deleted_at', 'is', null)
  } else {
    query = query.is('deleted_at', null)
  }

  if (contact) {
    query = query.ilike('contact', `%${contact}%`)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ count: data.length, signups: data })
}
