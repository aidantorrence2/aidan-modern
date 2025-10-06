export const metadata = { title: 'Request — Aidan Torrence Photography' }

import BookForm from '@/components/BookForm'

export default function BookPage(){
  return (
    <main className="relative py-6 sm:py-10">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-paper via-white to-accent/20 opacity-80" aria-hidden="true" />
      <section className="container max-w-4xl space-y-5">
        <BookForm />
        <article className="rounded-3xl border border-neutral-200 bg-white/60 p-6 text-sm text-neutral-600">
          <p className="font-semibold text-neutral-900">Brands & teams</p>
          <p className="mt-2">Need campaign production? Visit the <a className="underline" href="/brands">brands page</a> or WhatsApp <a className="underline" href="https://wa.me/491758966210">+49 175 8966210</a>.</p>
        </article>
      </section>
    </main>
  )
}
