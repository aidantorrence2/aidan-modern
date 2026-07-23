// Server-side WhatsApp normalization with a DeepSeek location fallback.
//
// Runs at signup time (app/api/sign-up/route.ts) so every new WhatsApp number is
// stored as E.164 — the country code inferred from the user's location. The sync
// gazetteer (lib/whatsapp.ts) handles the common cases offline; anything it can't
// resolve (e.g. "Pepsicola", "Surabaga") falls back to DeepSeek.
//
// Never throws to the caller and never blocks a signup: on any failure it returns
// the original contact unchanged so the submission still succeeds.
import { normalizeWhatsapp } from './whatsapp'
import { parsePhoneNumberFromString } from 'libphonenumber-js'

const ccCache = new Map<string, string | null>() // location(lower) -> calling code digits | null

function digits(s: string): string {
  return (s || '').replace(/[^\d+]/g, '')
}

/** Is `e164` a valid international number per libphonenumber? */
function isValidIntl(e164: string | null | undefined): boolean {
  if (!e164) return false
  const p = parsePhoneNumberFromString(e164.startsWith('+') ? e164 : '+' + e164)
  return !!p && p.isValid()
}

/**
 * If a location-based prepend produced an INVALID number but the digits the user
 * typed are ALREADY a valid international number on their own (foreign phone in
 * this location, e.g. an Indian +91 number entered from Nepal), trust the
 * self-coded number. Returns the corrected E.164, or null when no override applies.
 *
 * Precise on purpose: only fires when the prepend is provably broken AND the
 * as-typed number is provably valid — so a genuine local number (whose prepend
 * IS valid) is never touched.
 */
function selfCodedOverride(prepended: string, rawDigits: string): string | null {
  if (isValidIntl(prepended)) return null
  const d = rawDigits.replace(/^\+/, '').replace(/^00/, '')
  // A leading trunk 0 signals a NATIONAL number, never a self-coded international
  // one (E.164 has no leading 0 after the +). Don't reinterpret it.
  if (d.startsWith('0')) return null
  const asTyped = parsePhoneNumberFromString('+' + d)
  return asTyped && asTyped.isValid() ? asTyped.number : null
}

/**
 * Canonicalize a candidate international number to strict E.164 via
 * libphonenumber. Repairs the two breakages the "dial code prepended to
 * whatever the visitor typed" flows produce:
 *  - retained national trunk 0 after the country code (+66 0921 603 927 —
 *    libphonenumber strips it while parsing, wa.me does not)
 *  - doubled country code (+91 91 93735 53343 — the visitor typed their number
 *    including its country code)
 * Returns null when neither the number nor its repair is valid; callers keep
 * the original so nothing is ever guessed into a different number.
 */
export function canonicalizeE164(candidate: string): string | null {
  const d = (candidate || '').replace(/\D/g, '')
  if (!d) return null
  const direct = parsePhoneNumberFromString('+' + d)
  if (direct && direct.isValid()) return direct.number
  // Doubled country code: only attempted when the direct parse is invalid, and
  // the repair must be valid under the SAME country code — never a reinterpretation.
  const cc = direct?.countryCallingCode
  if (cc && d.startsWith(cc + cc)) {
    const repaired = parsePhoneNumberFromString('+' + d.slice(cc.length))
    if (repaired && repaired.isValid() && repaired.countryCallingCode === cc) return repaired.number
  }
  return null
}

/** Ask DeepSeek for the international dialing code (digits, no +) of a location. */
async function dialCodeFromLocationLLM(location: string): Promise<string | null> {
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey || !location) return null
  const key = location.toLowerCase().trim()
  if (ccCache.has(key)) return ccCache.get(key)!

  const baseUrl = (process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com').replace(/\/$/, '')
  const model = process.env.DEEPSEEK_MODEL || 'deepseek-chat'
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 6000)
  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        temperature: 0,
        max_tokens: 8,
        messages: [
          {
            role: 'system',
            content:
              'You map a place to its international dialing country code (digits only, no +). ' +
              'Reply with ONLY the digits, e.g. Kathmandu -> 977, Bali -> 62, Manila -> 63. ' +
              'If the place is unknown or not a real location, reply UNKNOWN.'
          },
          { role: 'user', content: `Location: ${location}` }
        ]
      }),
      signal: ctrl.signal
    })
    if (!res.ok) {
      ccCache.set(key, null)
      return null
    }
    const json = await res.json()
    const raw = (json?.choices?.[0]?.message?.content || '').trim()
    const m = raw.match(/\d{1,4}/)
    const cc = m ? m[0] : null
    ccCache.set(key, cc)
    return cc
  } catch {
    return null // timeout / network — don't cache, allow a later retry
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Normalize a WhatsApp contact to E.164 using location, with a DeepSeek fallback.
 * Returns the original contact if it cannot be confidently normalized.
 */
export async function normalizeWhatsappServer(contact: string, location: string): Promise<string> {
  const raw = (contact || '').trim()
  if (!raw) return raw

  const d = digits(raw)

  // 1. Sync path: already-international, or a location the gazetteer knows.
  const sync = normalizeWhatsapp(raw, location)
  if (sync.resolved && sync.e164) {
    // Guard: the gazetteer prepends the LOCATION's code without checking whether
    // the digits already carry a (different) country code. If that produced an
    // invalid number but the as-typed digits are already valid international,
    // the user self-coded a foreign number — keep theirs, don't double-code.
    return selfCodedOverride(sync.e164, d) ?? canonicalizeE164(sync.e164) ?? sync.e164
  }

  // 2. Already international but not flagged (rare formatting) — leave as-is.
  if (d.startsWith('+') || d.startsWith('00')) return canonicalizeE164(d) ?? raw

  // 3. DeepSeek fallback: resolve the dialing code from the location.
  const cc = await dialCodeFromLocationLLM(location)
  if (!cc) return raw // unknown location — store as entered, surfaced for review

  let national = d.replace(/^\+/, '')
  if (national.startsWith(cc) && national.length > cc.length + 5) return '+' + national // already had code
  if (national.startsWith('0')) national = national.slice(1) // strip national trunk 0
  const prepended = '+' + cc + national
  return selfCodedOverride(prepended, d) ?? canonicalizeE164(prepended) ?? prepended
}

/** Extract the real location: moodboard "Location: …" wins over the city field. */
export function locationFromSignup(city: string, moodboard: string[] | null | undefined): string {
  const entry = moodboard?.find(m => /^location:/i.test(m))
  const fromMood = entry ? entry.replace(/^location:\s*/i, '').trim() : ''
  if (fromMood) return fromMood
  // ignore the junk campaign label
  return /^bali\s*\(collab\)$/i.test((city || '').trim()) ? '' : (city || '').trim()
}
