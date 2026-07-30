import { NextResponse } from 'next/server'
import manifest from '@/data/wardrobe-manifest.json'

// Dresses the model: takes the selected catalog pieces and returns one
// photorealistic editorial photo of a model wearing exactly that combination,
// generated from the same product photos the visitor just arranged. Called
// only from the styler's "See it on a model" button — a look has at most a
// dress/top, a bottom and a layer, so requests are naturally small.

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const MODEL = 'gemini-3.1-flash-image'
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-')

type Pick = { id: string; colorway: string }

export async function POST(req: Request) {
  const key = process.env.GEMINI_API_KEY
  if (!key) return NextResponse.json({ error: 'Not configured' }, { status: 500 })

  const body = await req.json().catch(() => null)
  const picks: Pick[] = Array.isArray(body?.picks) ? body.picks.slice(0, 4) : []
  if (picks.length === 0) return NextResponse.json({ error: 'No pieces' }, { status: 400 })

  // Validate every pick against the manifest — this route must only ever
  // describe and depict garments from the catalog.
  const resolved: { id: string; label: string; colorway: string; path: string }[] = []
  for (const p of picks) {
    const piece = manifest.find(m => m.id === p.id)
    const cw = piece?.colorways.find(c => c.name === p.colorway)
    if (!piece || !cw) return NextResponse.json({ error: 'Unknown piece' }, { status: 400 })
    resolved.push({
      id: piece.id,
      label: piece.label,
      colorway: cw.name,
      path: `/images/wardrobe/${piece.id}--${slug(cw.name)}.jpg`,
    })
  }

  try {
    // public/ assets live on the CDN, not the function filesystem — fetch
    // them from this deployment's own origin.
    const host = req.headers.get('host')
    if (!host) return NextResponse.json({ error: 'No host' }, { status: 400 })
    const proto = req.headers.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https')
    const imageParts = await Promise.all(resolved.map(async r => {
      const res = await fetch(`${proto}://${host}${r.path}`)
      if (!res.ok) throw new Error(`catalog image missing: ${r.path}`)
      return { inlineData: { mimeType: 'image/jpeg', data: Buffer.from(await res.arrayBuffer()).toString('base64') } }
    }))

    const outfitText = resolved.map(r => `${r.colorway.toLowerCase()} ${r.label.toLowerCase()}`).join(', ')
    const prompt =
      `Photorealistic editorial fashion photograph: a young woman modeling this exact outfit — ${outfitText} — ` +
      `wearing all pieces together exactly as shown in the attached product photos, matching their colors and ` +
      `fabrics precisely. Full-length shot, standing, relaxed natural pose, soft warm studio light, plain warm ` +
      `cream studio background, shot on 35mm film with soft grain. Tasteful and modest styling. No text, no watermark.`

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }, ...imageParts] }],
        generationConfig: { responseModalities: ['IMAGE'] },
      }),
    })
    const j = await res.json()
    const part = j?.candidates?.[0]?.content?.parts?.find((p: { inlineData?: { data?: string } }) => p.inlineData?.data)
    if (!res.ok || !part) {
      console.error('[WARDROBE-MODEL] generation failed:', JSON.stringify(j).slice(0, 300))
      return NextResponse.json({ error: 'Generation failed' }, { status: 502 })
    }
    console.log('[WARDROBE-MODEL] generated', { pieces: resolved.map(r => r.id).join('+') })
    return NextResponse.json({ image: `data:image/png;base64,${part.inlineData.data}` })
  } catch (err) {
    console.error('[WARDROBE-MODEL] error:', err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
