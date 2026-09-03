import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { v2 as cloudinary } from 'cloudinary'

// Signs a direct browser → Cloudinary upload for the sign-up photo frame
// (lib/signupPhotos). The bytes never pass through this deployment, so the
// request body limit that a JSON-embedded photo runs into doesn't apply, and
// Cloudinary does the decoding — HEIC included — that a phone browser can't.
//
// The signature covers only the timestamp and the target folder; Cloudinary
// treats it as valid for an hour. Photos land in the row's own folder when the
// caller proves it owns the row with the (id, contact) pair PATCH also asks
// for, otherwise in a shared holding folder.

export const dynamic = 'force-dynamic'

const HOLDING_FOLDER = 'signups/unassigned'

async function ownsRow(id: number, contact: string): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return false
  try {
    const sb = createClient(url, key)
    const { data } = await sb.from('signups').select('id, contact').eq('id', id).single()
    return !!data && data.contact === contact.trim()
  } catch {
    return false
  }
}

export async function POST(req: Request) {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET
    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json({ ok: false, error: 'Uploads not configured' }, { status: 503 })
    }

    const body = await req.json().catch(() => ({}))
    const id = body?.id
    const contact = body?.contact
    let folder = HOLDING_FOLDER
    if (typeof id === 'number' && Number.isInteger(id) && id > 0 && typeof contact === 'string' && contact.trim()) {
      if (await ownsRow(id, contact)) folder = `signups/${id}`
    }

    const timestamp = Math.floor(Date.now() / 1000)
    const signature = cloudinary.utils.api_sign_request({ timestamp, folder }, apiSecret)
    return NextResponse.json({ ok: true, cloudName, apiKey, timestamp, folder, signature })
  } catch (err) {
    console.error('[SIGN-UP] upload ticket failed:', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
