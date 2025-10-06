export default function Footer(){
  return (
    <footer className="border-t border-neutral-200 mt-14 sm:mt-16">
      <div className="container flex flex-col items-start gap-2 py-6 text-neutral-600 sm:flex-row sm:items-center sm:justify-between sm:py-8">
        <p className="brand text-ink">Aidan Torrence Photography</p>
        <a href="mailto:aidan@aidantorrence.com" className="text-sm underline-offset-2 hover:underline">aidan@aidantorrence.com</a>
      </div>
    </footer>
  )
}
