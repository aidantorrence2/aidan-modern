import SignUpFormCollabMiamiOnePage from '@/components/SignUpFormCollabMiamiOnePage'

// Location stays out of the metadata title (link previews / tab titles).
export const metadata = {
  title: 'Free photo shoot · Aidan Torrence',
  description: 'Choose the vibe for your shoot, then sign up. Miami, November.',
  openGraph: { title: 'Free photo shoot', description: 'Choose the vibe for your shoot, then sign up. Miami, November.', images: ['/images/pinterest/0f8b59a7b3d7f295b0316444212cd1b3.jpg'] },
}

// Miami: the one-page Charlotte form (v7d) in English and Spanish. The language
// follows ?lang=, then the visitor's toggle, then the browser (lib/locale.ts).
export default function SignUpCollabMiamiPage() {
  return (
    <section className="min-h-screen bg-white">
      <SignUpFormCollabMiamiOnePage analyticsPath="/sign-up-collab-miami" />
    </section>
  )
}
