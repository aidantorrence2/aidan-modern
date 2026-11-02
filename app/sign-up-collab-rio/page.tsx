import SignUpFormCollabRioOnePage from '@/components/SignUpFormCollabRioOnePage'

// Location stays out of the metadata title (link previews / tab titles).
export const metadata = {
  title: 'Free photo shoot · Aidan Torrence',
  description: 'Choose the vibe for your shoot, then sign up. Rio de Janeiro, November.',
  openGraph: { title: 'Free photo shoot', description: 'Choose the vibe for your shoot, then sign up. Rio de Janeiro, November.', images: ['/images/pinterest/0f8b59a7b3d7f295b0316444212cd1b3.jpg'] },
}

// Rio: the one-page Charlotte form (v7d) in English and Brazilian Portuguese.
// The language follows ?lang=, then the visitor's toggle, then the browser
// (lib/locale.ts) — the same mechanism as /sign-up-collab-miami (en/es).
export default function SignUpCollabRioPage() {
  return (
    <section className="min-h-screen bg-white">
      <SignUpFormCollabRioOnePage analyticsPath="/sign-up-collab-rio" />
    </section>
  )
}
