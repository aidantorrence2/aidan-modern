// Everything /sign-up knows about what it sells: who the shoot is for, the
// packages per subject (€100 quick, €200 full; brands scale up), the market
// they are priced in, and how a visitor can be contacted. The picker and the
// form both read from here.

export type SubjectId = 'man' | 'woman' | 'couple' | 'brand'
export type Subject = { id: SubjectId; label: string; hint: string; cover: string }
export type Package = { id: string; name: string; price: number; time: string; includes: string[]; note?: string }
export type ContactChannel = 'phone' | 'text'

export const PAID_STORAGE_KEY = 'aidan:paid-picker:v2'
export const PAID_ANALYTICS_PATH = '/sign-up'

// cover: a library pin (public/images/pinterest) shown on the entry tile.
export const PAID_SUBJECTS: Subject[] = [
  { id: 'man', label: 'Man', hint: 'Portraits, style, headshots', cover: '/images/pinterest/77dbde497a8054af4a2ae29c76e8f81a.jpg' },
  { id: 'woman', label: 'Woman', hint: 'Portraits, editorial, swim', cover: '/images/pinterest/951b0b858b787bf679ccfd1a1916a236.jpg' },
  { id: 'couple', label: 'Couple', hint: 'Candid, engagement, anniversary', cover: '/images/pinterest/2c7f24e7ea959b64b7a3fe10690d00d9.jpg' },
  { id: 'brand', label: 'Brand / company', hint: 'Lookbook, campaign, team', cover: '/images/pinterest/344659c41a7ef4024fe7cd336010ec12.jpg' },
]

export function isSubjectId(value: unknown): value is SubjectId {
  return PAID_SUBJECTS.some(subject => subject.id === value)
}

export function subjectLabel(id: SubjectId): string {
  return PAID_SUBJECTS.find(subject => subject.id === id)?.label || 'Portraits'
}

// Same two packages for a man, a woman or a couple.
const PORTRAITS: Package[] = [
  { id: 'quick', name: 'Quick', price: 100, time: '1 hour · one spot', includes: ['10 edited photos', 'Delivered in 3 days'] },
  { id: 'full', name: 'Full', price: 200, time: '2 hours · 2–3 spots', includes: ['50 edited photos', 'Outfit changes', 'Delivered in 7 days'] },
]

const BRANDS: Package[] = [
  { id: 'content', name: 'Content hour', price: 250, time: '1 hour · one location', includes: ['30 edited photos', 'Usage rights for social and web', 'Delivered in 5 days'] },
  { id: 'half-day', name: 'Half day', price: 600, time: '3–4 hours · up to 3 locations', includes: ['80+ edited photos', 'Two short reels', 'Lookbook-ready edits', 'Delivered in 7 days'] },
  { id: 'full-day', name: 'Full day', price: 1000, time: '6–8 hours · anywhere in the city', includes: ['150+ edited photos', 'Four short reels', 'Creative direction and shot list', 'Delivered in 10 days'], note: 'Bigger campaign? Pick this and describe it in the notes — I’ll quote it.' },
]

export function packagesFor(subject: SubjectId): Package[] {
  return subject === 'brand' ? BRANDS : PORTRAITS
}

export function startingPrice(subject: SubjectId): number {
  return Math.min(...packagesFor(subject).map(pkg => pkg.price))
}

// Markets: an ad can send ?city=berlin. Same page, same numbers — only the
// currency sign and the phone example change. Plain
// /sign-up (no or unknown city) is the euro market.
// tag: the moodboard line saved on the row for /admin.
// analytics: extra props on every track() call (none for the default market).
export type Market = {
  id: 'default' | 'berlin'; currency: 'USD' | 'EUR'; sign: string
  phonePlaceholder: string; phoneHint: string; tag?: string; analytics: Record<string, string>
}

export const DEFAULT_MARKET: Market = { id: 'default', currency: 'EUR', sign: '€', phonePlaceholder: '+1 (555) 123-4567', phoneHint: 'Include your country code if you’re outside the US.', analytics: {} }

// id = the ?city= value that selects the market.
const MARKETS: Market[] = [
  { id: 'berlin', currency: 'EUR', sign: '€', phonePlaceholder: '+49 151 23456789', phoneHint: 'Include your country code.', tag: 'Market: Berlin (EUR)', analytics: { currency: 'EUR', city: 'berlin' } },
]

// ?city=… from the page URL (case-insensitive); anything else is the default.
export function marketFromSearch(search: string): Market {
  const city = new URLSearchParams(search).get('city')?.trim().toLowerCase()
  return MARKETS.find(market => market.id === city) || DEFAULT_MARKET
}

export const price = (amount: number, market: Market = DEFAULT_MARKET) => `${market.sign}${amount.toLocaleString('en-US')}`

// Call or text — both go to the one phone number. The number is stored on the
// API's phone channel ('whatsapp'), so it is normalized and the admin page gets
// a tap-to-message link; the visitor's preference and their WhatsApp / Instagram
// handle are kept on the row as moodboard lines. Brand / company sign-ups are
// contacted by email instead (contact_method 'email').
export const CONTACT_CHANNELS: { id: ContactChannel; label: string }[] = [
  { id: 'phone', label: 'Phone call' },
  { id: 'text', label: 'Text' },
]

export const PAID_COPY = {
  wordmark: 'Aidan Torrence',
  corner: (market: Market) => `Portraits from ${price(100, market)}`,
  bookTitle: 'Book a shoot',
  bookLead: 'Pick one, choose a package, and I’ll message you to confirm.',
  whoFor: 'Who is the shoot for?',
  from: (amount: number, market: Market) => `from ${price(amount, market)}`,
  back: '← Back',
  formTitle: 'Book it.',
  formNote: 'Choose a package and tell me how to reach you.',
  package: 'Package',
  howToContact: 'How should I contact you?',
  phoneLabel: 'Phone number',
  emailLabel: 'Work email',
  emailPlaceholder: 'you@company.com',
  emailHint: 'I’ll reply with a quote and dates.',
  social: 'WhatsApp / Instagram',
  socialPlaceholder: '@username or WhatsApp number',
  whereAreYou: 'Where are you?',
  wherePlaceholder: 'City or neighborhood',
  when: 'When works?',
  whenPlaceholder: 'This weekend, Oct 3–5, flexible…',
  brandName: 'Brand or company',
  brandPlaceholder: 'Name, and a link if you have one',
  notes: 'Notes',
  optional: 'optional',
  booking: 'Sending…',
  book: 'Book it',
  doneTitle: 'Got it.',
  doneNote: 'I’ll message you to confirm the time and the spot.',
  errors: {
    phone: 'Enter a phone number I can reach you on, with the country code if you’re outside the US.',
    email: 'Enter a work email I can reply to.',
    noLocation: 'Tell me where you are.',
    noBrand: 'Tell me the brand or company.',
    saveFailed: 'Your booking didn’t send. Your details are still here — please try again.',
  },
}
