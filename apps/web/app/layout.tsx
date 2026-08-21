import type { Metadata } from 'next'
import { michroma } from '@/lib/fonts'
import './globals.css'
import { Providers } from '@/components/Providers'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'OBPark | Smart Vehicle Commerce, Parking & Mobility Solutions',
  description:
    'OBPark is a smart vehicle commerce and mobility platform built for modern vehicle owners. Discover vehicle services, parking solutions, products, bookings, and app-based automotive convenience in one place.',
  keywords:
    'OBPark, vehicle commerce, smart parking, vehicle services, automotive marketplace, car services, bike services, vehicle products, parking app, mobility solutions, vehicle booking platform, automotive ecommerce, smart mobility India',
  alternates: {
    canonical: 'https://obpark.in',
  },
  openGraph: {
    type: 'website',
    url: 'https://obpark.in',
    title: 'OBPark | Smart Vehicle Commerce & Mobility Solutions',
    description:
      'Everything for your vehicle — OBPark brings vehicle commerce, parking, services, bookings, and smart mobility features into one easy platform.',
    siteName: 'OBPark',
    locale: 'en_US',
    images: [
      {
        url: 'https://obpark.in/og-image.png',
        width: 1200,
        height: 630,
        alt: 'OBPark smart vehicle commerce and mobility platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OBPark | Smart Vehicle Commerce & Mobility Solutions',
    description:
      'Everything for your vehicle — vehicle commerce, parking, services, bookings, and app-based automotive convenience.',
    images: ['https://obpark.in/og-image.png'],
  },
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
  <html lang="en" className={michroma.variable} suppressHydrationWarning>
    <body className={`${michroma.className} antialiased`}>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />

      <Providers>
        {children}
      </Providers>
    </body>
  </html>
)
}