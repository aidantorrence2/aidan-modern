export default function ThemeSignupLayout({ children }: { children: React.ReactNode }) {
  return <><style dangerouslySetInnerHTML={{ __html: 'body > header, body > footer { display: none !important; }' }} />{children}</>
}
