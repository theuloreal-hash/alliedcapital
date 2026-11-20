import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { BankProvider } from '@/lib/bank-store'
import './globals.css'

export const metadata: Metadata = {
  title: 'Allied Capital Bank',
  description:
    'Allied Capital Bank delivers customer-focused banking services across corporate, business, personal and private banking, with secure internet banking.',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
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
