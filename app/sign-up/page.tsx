import SignUpForm from '@/components/SignUpForm'

export const metadata = {
  title: 'Free Photo Shoot — Sign Up for Details',
  description:
    'Sign up to get details about a free photo shoot collab. Quick form, no commitment.'
}

export default function SignUpPage() {
  return (
    <section className="min-h-screen bg-[#0a0a0a] py-12 sm:py-20">
      <div className="mx-auto max-w-md px-5">
        <h1 className="font-display text-3xl font-semibold leading-tight text-white sm:text-4xl">
          Free Photo Shoot
        </h1>
        <p className="mt-3 text-base text-white/50">
          Sign up below and I&apos;ll send you all the details. Takes less than a minute.
        </p>
        <SignUpForm />
      </div>
    </section>
  )
}
