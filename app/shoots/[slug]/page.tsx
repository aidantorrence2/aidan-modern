import { notFound } from 'next/navigation'
import { shoots } from '@/data/shoots'
import StickyCTA from '@/components/StickyCTA'
import ShootGallery from '@/components/ShootGallery'

type Props = { params: { slug: string } }

export function generateStaticParams(){
  return shoots.map(shoot => ({ slug: shoot.slug }))
}

export const dynamicParams = false

export default function ShootPage({ params }: Props){
  const shoot = shoots.find(item => item.slug === params.slug)
  if(!shoot) return notFound()

  return (
    <>
      <main className="py-4 sm:py-6">
        <section className="container max-w-5xl">
          <div className="flex items-baseline justify-between gap-3">
            <h1 className="text-3xl font-semibold text-neutral-900 sm:text-4xl">{shoot.firstName}</h1>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-neutral-500 sm:text-xs">{shoot.location}</p>
          </div>
          <section className="mt-4 sm:mt-6" data-lightbox>
            <ShootGallery title={shoot.title} gallery={shoot.gallery} />
          </section>
        </section>
      </main>
      <StickyCTA />
    </>
  )
}
