import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { BankProvider } from '@/lib/bank-store'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.alliedcapitalbank.com'),
  title: {
    default: 'Allied Capital Bank',
    template: '%s | Allied Capital Bank',
  },
  description:
    'Explore personal, business, corporate and private banking with Allied Capital Bank, alongside secure online banking services.',
  applicationName: 'Allied Capital Bank',
  category: 'finance',
  creator: 'Allied Capital Bank',
  publisher: 'Allied Capital Bank',
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    siteName: 'Allied Capital Bank',
    title: 'Allied Capital Bank',
    description:
      'Explore personal, business, corporate and private banking with Allied Capital Bank, alongside secure online banking services.',
    images: [
      {
        url: '/alliedbank-logo-2.png',
        width: 216,
        height: 60,
        alt: 'Allied Capital Bank',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Allied Capital Bank',
    description:
      'Explore personal, business, corporate and private banking with Allied Capital Bank, alongside secure online banking services.',
    images: ['/alliedbank-logo-2.png'],
  },
  icons: {
    icon: {
      url: '/alliedbank-logo-2.png',
      media: '(prefers-color-scheme: light)',
      sizes: '216x60',
    },
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <BankProvider>{children}</BankProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
