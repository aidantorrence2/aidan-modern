// Browser-side photo pipeline for the sign-up forms.
//
// What used to happen: FileReader → data URL → <img> → canvas → JPEG data URL,
// and the data URL travelled to /api/sign-up inside the JSON body. Every link
// in that chain broke for someone:
//   - an <img> can't decode HEIC/HEIF on Chrome/Android (Samsung "high
//     efficiency" shots, iPhone photos picked outside Safari), so the photo
//     was reported as "unsupported";
//   - a 20 MB data URL plus a full-size decode is a lot for a phone in an
//     in-app browser, and a decode that never fires waited out a 30 s timer;
//   - the photos rode along in one JSON PATCH, which Vercel caps at ~4.5 MB.
//
// Now: decode with createImageBitmap (EXIF orientation applied, no data URL in
// memory) and downscale to a small JPEG. The bytes go straight from the browser
// to Cloudinary under a server-signed ticket, and only the resulting URL is
// handed to the API. A photo the browser can't decode at all is sent to
// Cloudinary as-is — it converts HEIC — and if Cloudinary is unreachable the
// old inline data URL path is kept as the fallback.

export type UploadTicket = {
  cloudName: string
  apiKey: string
  timestamp: number
  folder: string
  signature: string
}

export type PhotoFailure = 'too_large' | 'decode' | 'upload'

export type PhotoResult =
  | { ok: true; value: string; via: 'direct' | 'inline'; decoded: boolean }
  | { ok: false; reason: PhotoFailure }

/** Anything bigger is refused before any work is done. */
export const MAX_FILE_BYTES = 40 * 1024 * 1024
/** Longest edge of the JPEG that is stored — enough to see who someone is. */
const MAX_EDGE = 1000
/** Size the JPEG is squeezed under; keeps the inline fallback and the resume
 *  snapshot in localStorage small. */
const TARGET_BYTES = 300 * 1024
/** A raw (undecodable) file only goes inline through the API when it will
 *  clear the request body limit with room to spare. */
const MAX_INLINE_RAW_BYTES = 3 * 1024 * 1024
const DECODE_TIMEOUT_MS = 20_000
const UPLOAD_TIMEOUT_MS = 90_000

type Drawable = ImageBitmap | HTMLImageElement

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    const done = () => {
      clearTimeout(timer)
      URL.revokeObjectURL(url)
    }
    const timer = setTimeout(() => {
      done()
      reject(new Error('Image decode timed out'))
    }, DECODE_TIMEOUT_MS)
    img.onload = () => { done(); resolve(img) }
    img.onerror = () => { done(); reject(new Error('Image decode failed')) }
    img.src = url
  })
}

async function decode(file: File): Promise<Drawable> {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' })
    } catch {
      // Older engines throw on the options bag rather than ignore it.
      try { return await createImageBitmap(file) } catch {}
    }
  }
  return loadImage(file)
}

function dimensions(src: Drawable): { w: number; h: number } {
  return 'naturalWidth' in src
    ? { w: src.naturalWidth || src.width, h: src.naturalHeight || src.height }
    : { w: src.width, h: src.height }
}

function toBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise(resolve => {
    try {
      canvas.toBlob(b => resolve(b), 'image/jpeg', quality)
    } catch {
      resolve(null)
    }
  })
}

/** Downscale + re-encode as a JPEG under TARGET_BYTES. Null when the browser
 *  can't decode the file (HEIC on Chrome, a corrupt file, ...). */
export async function toSmallJpeg(file: File): Promise<Blob | null> {
  let src: Drawable
  try {
    src = await decode(file)
  } catch {
    return null
  }
  try {
    const { w, h } = dimensions(src)
    if (!w || !h) return null
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    let scale = Math.min(1, MAX_EDGE / Math.max(w, h))
    let quality = 0.82
    for (let i = 0; i < 12; i++) {
      canvas.width = Math.max(1, Math.round(w * scale))
      canvas.height = Math.max(1, Math.round(h * scale))
      ctx.drawImage(src, 0, 0, canvas.width, canvas.height)
      const blob = await toBlob(canvas, quality)
      if (!blob) return null
      if (blob.size <= TARGET_BYTES || (scale <= 0.15 && quality <= 0.3)) return blob
      if (quality > 0.4) quality -= 0.1
      else scale *= 0.7
    }
    return null
  } finally {
    if ('close' in src) src.close()
  }
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Could not read file'))
    reader.readAsDataURL(blob)
  })
}

/** Ask the server for a signed Cloudinary upload. Null when it can't sign
 *  (no config, offline) — callers then fall back to the inline path. */
export async function fetchUploadTicket(lead: { id: number | null; contact: string } | null): Promise<UploadTicket | null> {
  try {
    const res = await fetch('/api/sign-up/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead && lead.id !== null ? { id: lead.id, contact: lead.contact } : {}),
    })
    const json = await res.json().catch(() => null)
    if (!res.ok || !json?.ok) return null
    const t = json as Partial<UploadTicket>
    if (!t.cloudName || !t.apiKey || !t.signature || !t.folder || typeof t.timestamp !== 'number') return null
    return { cloudName: t.cloudName, apiKey: t.apiKey, signature: t.signature, folder: t.folder, timestamp: t.timestamp }
  } catch {
    return null
  }
}

export async function uploadToCloudinary(blob: Blob, filename: string, ticket: UploadTicket): Promise<string | null> {
  const form = new FormData()
  form.append('file', blob, filename)
  form.append('api_key', ticket.apiKey)
  form.append('timestamp', String(ticket.timestamp))
  form.append('signature', ticket.signature)
  form.append('folder', ticket.folder)
  const controller = typeof AbortController === 'function' ? new AbortController() : null
  const timer = controller ? setTimeout(() => controller.abort(), UPLOAD_TIMEOUT_MS) : null
  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(ticket.cloudName)}/image/upload`, {
      method: 'POST',
      body: form,
      signal: controller?.signal,
    })
    const json = await res.json().catch(() => null)
    if (!res.ok || typeof json?.secure_url !== 'string') return null
    return json.secure_url
  } catch {
    return null
  } finally {
    if (timer) clearTimeout(timer)
  }
}

function jpegName(file: File): string {
  const base = (file.name || 'photo').replace(/\.[^.]+$/, '')
  return `${base}.jpg`
}

/**
 * Turn one picked file into a value the sign-up API accepts: a Cloudinary URL
 * (preferred) or a data URL. Never throws.
 */
export async function preparePhoto(file: File, ticket: UploadTicket | null): Promise<PhotoResult> {
  if (file.size > MAX_FILE_BYTES) return { ok: false, reason: 'too_large' }

  const jpeg = await toSmallJpeg(file)

  if (jpeg) {
    if (ticket) {
      const url = await uploadToCloudinary(jpeg, jpegName(file), ticket)
      if (url) return { ok: true, value: url, via: 'direct', decoded: true }
    }
    try {
      return { ok: true, value: await blobToDataUrl(jpeg), via: 'inline', decoded: true }
    } catch {
      return { ok: false, reason: 'decode' }
    }
  }

  // The browser can't decode it; Cloudinary can (HEIC/HEIF included).
  if (ticket) {
    const url = await uploadToCloudinary(file, file.name || 'photo', ticket)
    if (url) return { ok: true, value: url, via: 'direct', decoded: false }
  }
  if (file.size <= MAX_INLINE_RAW_BYTES) {
    try {
      return { ok: true, value: await blobToDataUrl(file), via: 'inline', decoded: false }
    } catch {
      return { ok: false, reason: 'decode' }
    }
  }
  return { ok: false, reason: ticket ? 'upload' : 'decode' }
}

/** One line for the visitor, given what went wrong. */
export function describePhotoFailures(reasons: PhotoFailure[]): string {
  const n = reasons.length
  const one = n === 1
  if (reasons.every(r => r === 'too_large')) {
    return one
      ? 'That photo is too big (over 40 MB) — try a different one.'
      : `${n} photos are too big (over 40 MB) — try different ones.`
  }
  if (reasons.every(r => r === 'upload')) {
    return one
      ? "That photo didn't upload — check your connection and tap Upload again."
      : `${n} photos didn't upload — check your connection and tap Upload again.`
  }
  return one
    ? "That photo couldn't be added — try again, or pick a different one (a JPG or PNG always works)."
    : `${n} photos couldn't be added — try again, or pick different ones (JPG or PNG always works).`
}
