export default function SignUpBusanLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`header, footer { display: none !important; }`}</style>
      {children}
    </>
  )
}
