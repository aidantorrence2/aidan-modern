import SignUpForm from '@/components/SignUpForm'

export const metadata = {
  title: 'Sign Up — Free Photo Shoot in Manila',
  description:
    'Sign up for a free photo shoot collab in Manila. Quick form, no commitment.'
}

export default function SignUpPage() {
  return (
    <section className="min-h-screen bg-[#0a0a0a] py-12 sm:py-20">
      <div className="mx-auto max-w-md px-5">
        <h1 className="font-display text-3xl font-semibold leading-tight text-white sm:text-4xl">
          Free Photo Shoot Collab
        </h1>
        <p className="mt-3 text-base text-white/50">
          Sign up below and I&apos;ll message you to plan everything. It takes just a minute.
        </p>
        <SignUpForm />
      </div>
    </section>
  )
}
