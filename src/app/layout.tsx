import type { Metadata } from 'next'
import './globals.css'
import { CartProvider } from '@/context/CartContext'
import WhatsAppButton from '@/components/layout/WhatsAppButton'

export const metadata: Metadata = {
  title: {
    default: 'Arabic Heaven Mandi | Best Arabic Restaurant in Pondicherry',
    template: '%s | Arabic Heaven Mandi',
  },
  description:
    'Authentic Arabic Mandi cuisine in Pondicherry. Slow-smoked Lamb & Chicken Mandi, fresh Mezze, and traditional Arabian dishes. Halal certified. Order online or reserve a table.',
  keywords: [
    'arabic restaurant pondicherry',
    'best restaurant in pondicherry',
    'mandi restaurant pondicherry',
    'halal restaurant puducherry',
    'arabic food pondicherry',
    'best restaurant in villianur',
    'arabic heaven mandi',
    'arabic food near me pondicherry',
    'order arabic food online pondicherry',
  ],
  authors: [{ name: 'Arabic Heaven Mandi' }],
  creator: 'Arabic Heaven Mandi',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'Arabic Heaven Mandi',
    title: 'Arabic Heaven Mandi | Best Arabic Restaurant in Pondicherry',
    description:
      'Authentic Arabic Mandi cuisine in Pondicherry. Halal certified. Order online, reserve a table, or visit us.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Arabic Heaven Mandi | Best Arabic Restaurant in Pondicherry',
    description: 'Authentic Arabic Mandi cuisine in Pondicherry. Halal certified.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Google Fonts — preconnect for speed */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Cinzel+Decorative:wght@400;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Lato:wght@300;400;700&display=swap"
          rel="stylesheet"
        />
        {/* JSON-LD Restaurant Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Restaurant',
              name: 'Arabic Heaven Mandi',
              description:
                'Authentic Arabic Mandi restaurant in Pondicherry serving slow-smoked Lamb & Chicken Mandi, Mezze, and traditional Arabian cuisine. Halal certified.',
              servesCuisine: ['Arabic', 'Middle Eastern', 'Halal', 'Mandi'],
              priceRange: '₹₹',
              currenciesAccepted: 'INR',
              paymentAccepted: 'Cash, UPI, Credit Card, Debit Card',
              hasMenu: 'https://arabicheaven.com/menu',
              acceptsReservations: true,
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Pondicherry',
                addressRegion: 'Puducherry',
                addressCountry: 'IN',
              },
            }),
          }}
        />
      </head>
      <body>
        <CartProvider>
          {children}
          <WhatsAppButton />
        </CartProvider>
      </body>
    </html>
  )
}
