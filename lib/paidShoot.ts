// Everything /sign-up knows about what it sells: who the shoot is for, the
// packages per subject (from $100 for quick portraits, scaling up), and how a
// visitor can be contacted. The picker and the form both read from here.

export type SubjectId = 'man' | 'woman' | 'couple' | 'brand'
export type Subject = { id: SubjectId; label: string; hint: string; cover: string }
export type Package = { id: string; name: string; price: number; time: string; includes: string[]; note?: string }
export type ContactChannel = 'text' | 'whatsapp' | 'instagram'

export const PAID_STORAGE_KEY = 'aidan:paid-picker:v1'
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

const PORTRAITS: Package[] = [
  { id: 'quick', name: 'Quick portraits', price: 100, time: '20 minutes · one spot', includes: ['10 edited photos', 'Delivered in 3 days'] },
  { id: 'half', name: 'Half session', price: 180, time: '45 minutes · up to 2 spots', includes: ['25 edited photos', 'One outfit change', 'Delivered in 5 days'] },
  { id: 'full', name: 'Full session', price: 300, time: '90 minutes · 2–3 spots', includes: ['50 edited photos', 'One short reel', 'Outfit changes', 'Delivered in 7 days'] },
]

const COUPLES: Package[] = [
  { id: 'quick', name: 'Quick couple portraits', price: 120, time: '20 minutes · one spot', includes: ['10 edited photos', 'Delivered in 3 days'] },
  { id: 'half', name: 'Half session', price: 220, time: '45 minutes · up to 2 spots', includes: ['25 edited photos', 'One outfit change', 'Delivered in 5 days'] },
  { id: 'full', name: 'Full session', price: 360, time: '90 minutes · 2–3 spots', includes: ['50 edited photos', 'One short reel', 'Outfit changes', 'Delivered in 7 days'] },
]

const BRANDS: Package[] = [
  { id: 'content', name: 'Content hour', price: 250, time: '1 hour · one location', includes: ['30 edited photos', 'Usage rights for social and web', 'Delivered in 5 days'] },
  { id: 'half-day', name: 'Half day', price: 600, time: '3–4 hours · up to 3 locations', includes: ['80+ edited photos', 'Two short reels', 'Lookbook-ready edits', 'Delivered in 7 days'] },
  { id: 'full-day', name: 'Full day', price: 1000, time: '6–8 hours · anywhere in the city', includes: ['150+ edited photos', 'Four short reels', 'Creative direction and shot list', 'Delivered in 10 days'], note: 'Bigger campaign? Pick this and describe it in the notes — I’ll quote it.' },
]

export function packagesFor(subject: SubjectId): Package[] {
  return subject === 'brand' ? BRANDS : subject === 'couple' ? COUPLES : PORTRAITS
}

export function startingPrice(subject: SubjectId): number {
  return Math.min(...packagesFor(subject).map(pkg => pkg.price))
}

export const price = (amount: number) => `$${amount.toLocaleString('en-US')}`

export const CONTACT_CHANNELS: { id: ContactChannel; label: string }[] = [
  { id: 'text', label: 'Text / phone' },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'instagram', label: 'Instagram' },
]

// A phone-number channel is stored as WhatsApp (the API's phone channel), so
// the number is normalized and the admin page gets a tap-to-message link. The
// visitor's preference is kept on the row as a "Contact preference:" line.
export function apiContactMethod(channel: ContactChannel): 'whatsapp' | 'instagram' {
  return channel === 'instagram' ? 'instagram' : 'whatsapp'
}

export const PAID_COPY = {
  wordmark: 'Aidan Torrence',
  corner: 'Portraits from $100',
  bookTitle: 'Book a shoot',
  bookLead: 'Film portraits, planned around photos you actually like.',
  whoFor: 'Who is the shoot for?',
  from: (amount: number) => `from ${price(amount)}`,
  pickTitle: 'Pick your vibe.',
  pickNote: { lead: 'Choose one photo in each round.', rest: ' I’ll plan the shoot around your picks.' },
  skip: 'Skip',
  back: '← Back',
  startOver: 'Start over',
  chooseRound: (round: number) => `Choose one photo, round ${round}`,
  chooseImage: (alt: string) => `Choose ${alt}`,
  status: (round: number, saved: number, max: number) => `Round ${round}. ${saved} of ${max} photos saved.`,
  formTitle: 'Now book it.',
  formNote: 'Your picks are saved. Choose a package and tell me how to reach you.',
  package: 'Package',
  payNote: 'Nothing to pay now. I’ll confirm the time with you, and you pay after the shoot.',
  howToContact: 'How should I contact you?',
  phoneLabel: 'Phone number',
  phonePlaceholder: '+1 (555) 123-4567',
  textHint: 'I’ll text you on WhatsApp if your number has it, otherwise by SMS.',
  whatsappHint: 'Include your country code.',
  instagramLabel: 'Instagram username',
  instagramPlaceholder: '@yourusername',
  followHint: { before: 'Please follow ', after: ' so my message doesn’t land in requests.' },
  whereAreYou: 'Where are you?',
  wherePlaceholder: 'City or neighborhood',
  when: 'When works?',
  whenPlaceholder: 'This weekend, Oct 3–5, flexible…',
  brandName: 'Brand or company',
  brandPlaceholder: 'Name, and a link if you have one',
  notes: 'Notes',
  optional: 'optional',
  photosOfYou: 'Photos of you',
  photosOfBrand: 'Your product or space',
  upTo3: 'optional · up to 3',
  yourPhoto: (n: number) => `Your photo ${n}`,
  removePhoto: (n: number) => `Remove your photo ${n}`,
  addingPhotos: 'Adding your photos…',
  booking: 'Sending…',
  book: 'Book it',
  doneTitle: 'Got it.',
  doneNote: 'I’ll message you to confirm the time and the spot. Nothing to pay until the shoot.',
  errors: {
    photoFailed: 'Could not add that photo. Please try again.',
    picksLost: 'Your picks didn’t come through. Go back and choose again.',
    phone: 'Enter a phone number I can text, with the country code if you’re outside the US.',
    instagram: 'Enter your Instagram username, without a link.',
    noLocation: 'Tell me where you are.',
    noBrand: 'Tell me the brand or company.',
    saveFailed: 'Your booking didn’t send. Your picks are still here — please try again.',
  },
}
