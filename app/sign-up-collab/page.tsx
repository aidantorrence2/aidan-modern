import SignUpFormCollab from '@/components/SignUpFormCollab'

export const metadata = {
  title: 'Model Collaboration — New Delhi',
  description:
    'Open for model collaborations in New Delhi. TFP — we both build our portfolios. DM or sign up.'
}

export default function SignUpCollabPage() {
  return (
    <section className="min-h-screen bg-[#0a0a0a] py-12 sm:py-20">
      <div className="mx-auto max-w-md px-5">
        <SignUpFormCollab />
      </div>
    </section>
  )
}
