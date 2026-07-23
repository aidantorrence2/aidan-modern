// Canonicalize stored '+'-prefixed WhatsApp contacts to strict E.164.
//
// Repairs the two known breakages from the "dial code prepended to whatever the
// visitor typed" signup flows (same logic as canonicalizeE164 in
// lib/whatsapp-server.ts):
//   - retained trunk 0 after the country code (+66 0921603927 -> +66921603927)
//   - doubled country code (+91 91 9373553343 -> +91 9373553343)
//
// The previous stored value is ALWAYS preserved on the row as a
// "Raw contact: ..." moodboard entry, so every rewrite is reversible.
// Rows without a '+'/00 international prefix are never touched (country unknown).
//
// Usage:
//   node scripts/backfill-whatsapp-canonicalize.mjs            # dry run (default)
//   node scripts/backfill-whatsapp-canonicalize.mjs --id 2863  # canary: one row (still needs --apply to write)
//   node scripts/backfill-whatsapp-canonicalize.mjs --apply    # write changes
import { createClient } from '@supabase/supabase-js'
import { parsePhoneNumberFromString } from 'libphonenumber-js'

const APPLY = process.argv.includes('--apply')
const idFlag = process.argv.indexOf('--id')
const ONLY_ID = idFlag !== -1 ? Number(process.argv[idFlag + 1]) : null

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

function canonicalizeE164(candidate) {
  const d = String(candidate || '').replace(/\D/g, '')
  if (!d) return null
  const direct = parsePhoneNumberFromString('+' + d)
  if (direct && direct.isValid()) return direct.number
  const cc = direct?.countryCallingCode
  if (cc && d.startsWith(cc + cc)) {
    const repaired = parsePhoneNumberFromString('+' + d.slice(cc.length))
    if (repaired && repaired.isValid() && repaired.countryCallingCode === cc) return repaired.number
  }
  return null
}

const { data, error } = await supabase
  .from('signups')
  .select('id, contact, moodboard, created_at')
  .eq('contact_method', 'whatsapp')
  .is('deleted_at', null)
  .order('created_at', { ascending: false })
if (error) { console.error(error); process.exit(1) }

let changed = 0, unchanged = 0, skippedNoIntl = 0, unrepairable = 0, failed = 0

for (const s of data) {
  if (ONLY_ID !== null && s.id !== ONLY_ID) continue
  const cleaned = String(s.contact || '').replace(/[^\d+]/g, '')
  const intl = cleaned.startsWith('+') || cleaned.startsWith('00')
  if (!intl) { skippedNoIntl++; continue }

  const canonical = canonicalizeE164(cleaned)
  if (!canonical) { unrepairable++; console.log(`#${s.id} UNREPAIRABLE  ${s.contact} (left as-is)`); continue }
  if (canonical === s.contact) { unchanged++; continue }

  const mood = Array.isArray(s.moodboard) ? s.moodboard : []
  const newMood = mood.some(m => /^raw contact:/i.test(m)) ? mood : [...mood, `Raw contact: ${s.contact}`]
  console.log(`#${s.id} ${APPLY ? 'FIX' : 'would fix'}  ${s.contact}  ->  ${canonical}`)

  if (APPLY) {
    const { error: upErr } = await supabase
      .from('signups')
      .update({ contact: canonical, moodboard: newMood })
      .eq('id', s.id)
    if (upErr) { failed++; console.error(`#${s.id} UPDATE FAILED`, upErr); continue }
  }
  changed++
}

console.log(`\n${APPLY ? 'APPLIED' : 'DRY RUN'}: ${changed} ${APPLY ? 'fixed' : 'would fix'}, ${unchanged} already canonical, ${unrepairable} unrepairable (left as-is), ${skippedNoIntl} without intl prefix (untouched), ${failed} failed`)
