export const metadata = {
  title: 'Build your moodboard — Aidan Torrence',
  description:
    'Pick the photos you like and I will build your moodboard, then shoot it. Free collab session, you keep the edited photos.',
  robots: { index: false },
}

export default function PinLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html:
            'body > header, body > footer, header, footer, .fixed.inset-x-0.bottom-0 { display: none !important; }',
        }}
      />
      {children}
    </>
  )
}
