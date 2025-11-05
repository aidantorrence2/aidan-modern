import Link from 'next/link'

export default function Header(){

  return (
    <header className="sticky top-0 z-30 bg-paper/95 backdrop-blur border-b border-neutral-200/70">
      <div className="container flex items-center justify-between py-1.5 sm:py-3">
        <Link href="/" className="brand">Aidan Torrence Photography</Link>
        <nav className="flex items-center gap-3 text-xs font-medium sm:text-sm">
          <Link href="/bali-assistant" className="whitespace-nowrap opacity-80 hover:opacity-100">Bali Assistant</Link>
          <Link href="/about" className="whitespace-nowrap opacity-80 hover:opacity-100">About</Link>
        </nav>
      </div>
    </header>
  )
}
