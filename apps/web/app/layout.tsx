import type { Metadata } from 'next'
import { geistSans, michroma, microgrammaBold } from '@/lib/fonts'
import './globals.css'
import { Providers } from '@/components/Providers'
import Script from 'next/script'

export const metadata: Metadata = {
  title: {
    default: 'OBPark Admin',
    template: '%s | OBPark Admin',
  },
  description: 'OBPark Admin Portal and Operations Dashboard',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
  icons: {
    icon: '/icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${michroma.variable} ${microgrammaBold.variable}`}
      suppressHydrationWarning
    >
      <body className={`${geistSans.className} font-sans antialiased text-gray-900 bg-[#F0FAF5]`}>
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
