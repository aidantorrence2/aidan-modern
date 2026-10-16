import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import OfferPage from '@/components/OfferPage'
import { allOffers, getOffer, preorderLink } from '@/lib/offers'

// Hosted pre-launch offer pages (money flywheel). Copy comes from data/offers.json.

type Params = { params: { slug: string } }

export function generateStaticParams() {
  return allOffers().map(o => ({ slug: o.slug }))
}

export function generateMetadata({ params }: Params): Metadata {
  const offer = getOffer(params.slug)
  if (!offer) return { title: 'Not found' }
  const description = `${offer.headline} ${offer.price}. Pre-launch: tell me if you'd use it.`
  return {
    title: `${offer.name} — ${offer.price} (pre-launch)`,
    description,
    robots: offer.status === 'killed' || offer.status === 'draft' ? { index: false } : undefined,
    openGraph: { title: offer.name, description, type: 'website', url: `https://aidantorrence.com/offers/${offer.slug}` },
    twitter: { card: 'summary', title: offer.name, description },
  }
}

export default function Page({ params }: Params) {
  const offer = getOffer(params.slug)
  if (!offer || offer.status === 'draft') notFound()
  return <OfferPage offer={offer} preorderUrl={preorderLink(offer)} />
}
