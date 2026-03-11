import SignUpForm from '@/components/SignUpForm'

export const metadata = {
  title: 'Sign Up — Free Photo Shoot in Manila',
  description:
    'Sign up for a free photo shoot collab in Manila. Quick form, no commitment.'
}

export default function SignUpPage() {
  return (
    <section className="bg-paper py-10 sm:py-16">
      <div className="container max-w-md">
        <h1 className="font-display text-3xl font-semibold leading-tight text-neutral-900 sm:text-4xl">
          Free photo shoot collab
        </h1>
        <p className="mt-3 text-base text-neutral-600">
          Sign up below and I&apos;ll message you to plan everything. It takes just a minute.
        </p>
        <SignUpForm />
      </div>
    </section>
  )
}
