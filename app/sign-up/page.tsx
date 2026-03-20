import SignUpForm from '@/components/SignUpForm'

export const metadata = {
  title: 'Design Your Photo Shoot — Free',
  description:
    'Design your free photo shoot. Pick your vibe, choose a concept, and sign up.'
}

export default function SignUpPage() {
  return (
    <section className="min-h-screen bg-[#0a0a0a] py-12 sm:py-20">
      <div className="mx-auto max-w-md px-5">
        <h1 className="font-display text-3xl font-semibold leading-tight text-white sm:text-4xl">
          Design your photo shoot
        </h1>
        <p className="mt-3 text-base text-white/50">
          Pick your vibe below and I&apos;ll send you all the details — timing, location ideas, what to wear, and next steps.
        </p>
        <SignUpForm />
      </div>
    </section>
  )
}
