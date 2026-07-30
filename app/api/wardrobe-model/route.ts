import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import manifest from '@/data/wardrobe-manifest.json'

// Exact-color look shots, generated once ever. The prebuilt combo photos
// cover each garment's base colorway; when a visitor tunes a color, this
// route returns a REAL photograph of that exact top-color × bottom-color
// pairing — from the Cloudinary cache if anyone has ever asked for it
// before, generated via Gemini from the two product photos if not, then
// cached for everyone after. No client-side color faking, ever: a hue-keyed
// recolor was tried and looked exactly as fake as it sounds.

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const MODEL = 'gemini-3.1-flash-image'
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-')

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const POSE =
  'Full-length editorial fashion photograph of one young woman modeling the outfit, standing straight facing ' +
  'the camera, arms relaxed at her sides, neutral pleasant expression, on a plain warm cream seamless studio ' +
  'background, soft even studio light, shot on 35mm film with soft grain. She wears exactly the garments from ' +
  'the attached product photos, matching their colors, fabrics and details precisely. Tasteful, modest styling. ' +
  'Simple neutral flat shoes. No text, no watermark.'

type Body = { top?: { id: string; colorway: string }; bottom?: { id: string; colorway: string } }

export async function POST(req: Request) {
  const gemini = process.env.GEMINI_API_KEY
  if (!gemini || !process.env.CLOUDINARY_CLOUD_NAME) {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  const body: Body = await req.json().catch(() => ({}))
  // Strictly manifest-validated — this route only ever depicts catalog garments.
  const resolve = (pick: { id: string; colorway: string } | undefined, kind: string) => {
    if (!pick) return null
    const piece = manifest.find(m => m.id === pick.id && m.kind === kind)
    const cw = piece?.colorways.find(c => c.name === pick.colorway)
    return piece && cw ? { piece, cw } : null
  }
  const top = resolve(body.top, 'top')
  const bottom = resolve(body.bottom, 'bottom')
  if (!top || !bottom) return NextResponse.json({ error: 'Invalid pieces' }, { status: 400 })

  const publicId = `wardrobe-looks/${top.piece.id}-${slug(top.cw.name)}__${bottom.piece.id}-${slug(bottom.cw.name)}`

  // Cache first — one generation per unique pairing, ever. The check goes to
  // the Admin API, not the delivery CDN: an edge that cached a 404 from before
  // the upload would otherwise hide the asset forever and re-bill Gemini on
  // every request. The versioned secure_url it returns always resolves.
  try {
    const existing = await cloudinary.api.resource(publicId)
    if (existing?.secure_url) return NextResponse.json({ image: existing.secure_url, cached: true })
  } catch {
    // not found — generate below
  }

  try {
    const host = req.headers.get('host')
    if (!host) return NextResponse.json({ error: 'No host' }, { status: 400 })
    const proto = req.headers.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https')
    const productUrl = (id: string, cw: string) => `${proto}://${host}/images/wardrobe/${id}--${slug(cw)}.jpg`

    const parts: unknown[] = [{
      text: `${POSE} The outfit: a ${top.cw.name.toLowerCase()} ${top.piece.label.toLowerCase()} worn with ${bottom.cw.name.toLowerCase()} ${bottom.piece.label.toLowerCase()}.`,
    }]
    for (const r of [
      productUrl(top.piece.id, top.cw.name),
      productUrl(bottom.piece.id, bottom.cw.name),
    ]) {
      const res = await fetch(r)
      if (!res.ok) throw new Error(`catalog image missing: ${r}`)
      parts.push({ inlineData: { mimeType: 'image/jpeg', data: Buffer.from(await res.arrayBuffer()).toString('base64') } })
    }

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${gemini}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts }], generationConfig: { responseModalities: ['IMAGE'] } }),
    })
    const j = await res.json()
    const part = j?.candidates?.[0]?.content?.parts?.find((p: { inlineData?: { data?: string } }) => p.inlineData?.data)
    if (!res.ok || !part) {
      console.error('[WARDROBE-MODEL] generation failed:', JSON.stringify(j).slice(0, 300))
      return NextResponse.json({ error: 'Generation failed' }, { status: 502 })
    }

    const uploaded = await cloudinary.uploader.upload(`data:image/png;base64,${part.inlineData.data}`, {
      public_id: publicId,
      overwrite: false,
      resource_type: 'image',
      format: 'jpg',
      transformation: [{ height: 1000, crop: 'limit' }],
    })
    console.log('[WARDROBE-MODEL] generated + cached', publicId)
    return NextResponse.json({ image: uploaded.secure_url, cached: false })
  } catch (err) {
    console.error('[WARDROBE-MODEL] error:', err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
