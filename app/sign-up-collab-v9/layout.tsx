export default function SignUpCollabV9Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`header, footer { display: none !important; }`}</style>
      {children}
    </>
  )
}
