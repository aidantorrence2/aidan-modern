import SignUpFormCollabPanamaOnePage from '@/components/SignUpFormCollabPanamaOnePage'

// Location stays out of the metadata title (link previews / tab titles).
export const metadata = {
  title: 'Free photo shoot · Aidan Torrence',
  description: 'Choose the vibe for your shoot, then sign up. Panama City, November.',
  openGraph: { title: 'Free photo shoot', description: 'Choose the vibe for your shoot, then sign up. Panama City, November.', images: ['/images/pinterest/0f8b59a7b3d7f295b0316444212cd1b3.jpg'] },
}

// Panama City: the one-page Charlotte form (v7d) in English and Spanish. The language
// follows ?lang=, then the visitor's toggle, then the browser (lib/locale.ts).
export default function SignUpCollabPanamaPage() {
  return (
    <section className="min-h-screen bg-white">
      <SignUpFormCollabPanamaOnePage analyticsPath="/sign-up-collab-panama" />
    </section>
  )
}
