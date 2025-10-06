import Link from 'next/link'

export default function StickyCTA(){
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 bg-white/95 backdrop-blur shadow-[0_-8px_30px_rgba(0,0,0,0.08)] ">
      <div className="container flex items-center justify-between gap-2 py-1.5">
        <p className="text-[0.7rem] font-medium uppercase tracking-[0.25em] text-neutral-600 leading-none">Limited availability · Get a fast response</p>
        <Link
          href="/book"
          className="btn btn-primary whitespace-nowrap px-4 py-2 text-sm font-semibold"
          data-cta="sticky-request"
        >
          Get Started
        </Link>
      </div>
    </div>
  )
}
