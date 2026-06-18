import SignUpFormCollab from '@/components/SignUpFormCollab'

export const metadata = {
  title: 'Model Collaboration — Kathmandu',
  description:
    'Open for model collaborations in Kathmandu. Pitch a unique cultural concept — a homestay, a festival, traditional dress — or go fashion editorial. TFP, we both build our portfolios.'
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
