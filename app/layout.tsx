import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Lightbox from '@/components/Lightbox'

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID

export const metadata: Metadata = {
  title: 'Aidan Torrence Photography — Editorial Photo Sessions',
  description: 'High-touch film photo shoots with art direction, styling support, and 1–2 week delivery from Aidan Torrence Photography.',
  openGraph: {
    title: 'Aidan Torrence — Photographer',
    description: 'Film photographer • Editorial sessions • Bangkok & worldwide',
    type: 'website',
    url: 'https://aidantorrence.com',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Aidan Torrence Photography'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aidan Torrence — Photographer',
    description: 'Film photographer • Editorial sessions • Bangkok & worldwide',
    images: ['/og-image.jpg']
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }){
  return (
    <html lang="en">
      <body>
        {META_PIXEL_ID && (
          <>
            <Script
              id="meta-pixel"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  !function(f,b,e,v,n,t,s)
                  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                  n.queue=[];t=b.createElement(e);t.async=!0;
                  t.src=v;s=b.getElementsByTagName(e)[0];
                  s.parentNode.insertBefore(t,s)}(window, document,'script',
                  'https://connect.facebook.net/en_US/fbevents.js');
                  fbq('init', '${META_PIXEL_ID}');
                  fbq('track', 'PageView');
                `
              }}
            />
            <noscript>
              <img
                height="1"
                width="1"
                style={{ display: 'none' }}
                src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
                alt=""
              />
            </noscript>
          </>
        )}
        <Header />
        <main>
          {children}
        </main>
        <Lightbox />
        <Footer />
      </body>
    </html>
  )
}
