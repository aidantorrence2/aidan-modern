import offersJson from '@/data/offers.json'

// The hosted side of the money flywheel. One entry per offer in data/offers.json;
// the page at /offers/[slug] renders it and /api/offers/interest records the
// signals. Everything a launch needs to change lives in that one JSON file.

export type OfferStatus = 'draft' | 'live' | 'threshold_met' | 'building' | 'shipped' | 'killed'

export type Offer = {
  slug: string
  name: string
  /** One line naming the result the buyer gets. */
  headline: string
  /** Who this is for, in their words. */
  buyer: string
  /** Three (or so) short bullets: what they get. */
  bullets: string[]
  /** Proposed price label, e.g. "$29/month" or "$39 one-off". */
  price: string
  /** The number behind the "I'd pay" click, in USD. */
  priceUsd: number
  /** Optional billing note under the price, e.g. "cancel anytime". */
  priceNote?: string
  /** A short honest paragraph on what exists today. Always says pre-launch. */
  status: OfferStatus
  /** ISO date the offer went live (hosted or artifact). */
  launched?: string
  /** Optional link to the same offer published as a Claude artifact. */
  artifactUrl?: string
  /** Set once a payment link exists; replaces the "I'd pay" click with a real pre-order. */
  preorderUrl?: string
  /** Optional FAQ rows. */
  faq?: { q: string; a: string }[]
  /** What would make you buy: a placeholder for the optional free-text field. */
  reasonPrompt?: string
  /** Traffic kit, rendered to flywheel/launches/<slug>.md by scripts/flywheel/kits.mjs. */
  kit?: {
    hook: string
    script: string
    caption: string
    community: string
    pitchSubject: string
    pitch: string
  }
}

const all = offersJson as Offer[]

export function allOffers(): Offer[] {
  return all
}

export function liveOffers(): Offer[] {
  return all.filter(o => o.status !== 'draft' && o.status !== 'killed')
}

export function getOffer(slug: string): Offer | undefined {
  return all.find(o => o.slug === slug)
}

/** Pre-order destination for an offer: its own link, else a base link + slug, else none. */
export function preorderLink(offer: Offer): string | null {
  if (offer.preorderUrl) return offer.preorderUrl
  const base = process.env.NEXT_PUBLIC_PREORDER_BASE
  if (!base) return null
  return base.includes('{slug}') ? base.replace('{slug}', offer.slug) : `${base.replace(/\/$/, '')}/${offer.slug}`
}
