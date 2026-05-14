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
        <SignUpForm />
      </div>
    </section>
  )
}
