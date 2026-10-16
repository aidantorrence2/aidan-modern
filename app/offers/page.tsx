import type { Metadata } from 'next'
import { liveOffers } from '@/lib/offers'

export const metadata: Metadata = {
  title: 'Pre-launch offers — Aidan Torrence',
  description: 'Small tools for photographers and creators. Each one gets built only if enough people say they want it.',
}

// Index of hosted offers. Deliberately plain: the offer pages are the product.
export default function OffersIndex() {
  const offers = liveOffers()
  return (
    <div className="lab">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <main className="lab-main">
        <p className="lab-kicker">Pre-launch</p>
        <h1>Tools I want to exist.</h1>
        <p className="lab-lead">
          Each page below is a promise, not a product. If enough people leave an email or say they&rsquo;d pay, I build it, in that order.
          Nothing here charges you.
        </p>
        <ul className="lab-list">
          {offers.map(o => (
            <li key={o.slug}>
              <a href={`/offers/${o.slug}?src=lab`}>
                <span className="lab-name">{o.name}</span>
                <span className="lab-head">{o.headline}</span>
                <span className="lab-price">{o.price}</span>
              </a>
            </li>
          ))}
        </ul>
        {offers.length === 0 && <p className="lab-lead">Nothing live right now.</p>}
      </main>
    </div>
  )
}

const css = `
body > header, body > footer, .fixed.inset-x-0.bottom-0 { display: none !important; }
body { background: #0c0c0c; }
.lab { min-height: 100vh; background: #0c0c0c; color: #fff; font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
.lab-main { max-width: 640px; margin: 0 auto; padding: 56px 20px 80px; }
.lab-kicker { font-size: 12px; letter-spacing: .14em; text-transform: uppercase; color: #9a9a9a; margin: 0 0 18px; }
.lab h1 { font-family: Georgia, serif; font-weight: 400; font-size: clamp(30px, 5.5vw, 44px); margin: 0 0 14px; }
.lab-lead { color: #b5b5b5; font-size: 16px; line-height: 1.55; margin: 0 0 32px; }
.lab-list { list-style: none; padding: 0; margin: 0; display: grid; gap: 10px; }
.lab-list a { display: grid; gap: 4px; padding: 16px 18px; border: 1px solid #262626; border-radius: 12px; text-decoration: none; color: #fff; }
.lab-list a:hover { border-color: #666; }
.lab-name { font-size: 13px; letter-spacing: .08em; text-transform: uppercase; color: #9a9a9a; }
.lab-head { font-family: Georgia, serif; font-size: 20px; line-height: 1.25; }
.lab-price { color: #b5b5b5; font-size: 14px; }
`
