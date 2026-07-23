// Validate stored WhatsApp contacts with libphonenumber-js.
import { createClient } from '@supabase/supabase-js'
import { parsePhoneNumberFromString } from 'libphonenumber-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const { data, error } = await supabase
  .from('signups')
  .select('id, city, contact_method, contact, moodboard, created_at')
  .is('deleted_at', null)
  .order('created_at', { ascending: false })
if (error) { console.error(error); process.exit(1) }

const wa = data.filter(s => s.contact_method === 'whatsapp')
console.log(`${wa.length} whatsapp signups of ${data.length} total\n`)

function check(contact) {
  const cleaned = String(contact).replace(/[^\d+]/g, '')
  const e164 = cleaned.startsWith('+') ? cleaned : cleaned.startsWith('00') ? '+' + cleaned.slice(2) : null
  if (!e164) return { status: 'no-intl-code', parsed: null }
  const p = parsePhoneNumberFromString(e164)
  if (!p) return { status: 'unparseable', parsed: null }
  return { status: p.isValid() ? 'valid' : 'INVALID', parsed: p.number, country: p.country }
}

console.log('=== Last 8 whatsapp entries ===')
for (const s of wa.slice(0, 8)) {
  const r = check(s.contact)
  const loc = (s.moodboard || []).find(m => /^location:/i.test(m)) || s.city
  console.log(`#${s.id} ${s.created_at.slice(0, 16)} | ${s.contact} | ${r.status}${r.parsed ? ' -> ' + r.parsed + ' (' + (r.country || '?') + ')' : ''} | ${loc}`)
}

const tally = {}
const bad = []
for (const s of wa) {
  const r = check(s.contact)
  tally[r.status] = (tally[r.status] || 0) + 1
  if (r.status !== 'valid') bad.push({ id: s.id, contact: s.contact, status: r.status, created: s.created_at.slice(0, 10) })
}
console.log('\n=== Tally (all whatsapp signups) ===')
console.log(tally)
console.log('\n=== Non-valid entries (newest 25) ===')
for (const b of bad.slice(0, 25)) console.log(`#${b.id} ${b.created} | ${b.contact} | ${b.status}`)
