import type { Metadata } from 'next'
import { Playfair_Display } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'UK Pathway Services — Your Trusted Bridge to UK Documentation',
    template: '%s | UK Pathway Services',
  },
  description:
    'Expert consultancy for UK documentation. Driving licence conversion, NI numbers, BRP, eVisa, and more — guided by insiders who know the process.',
  keywords: [
    'UK driving licence conversion',
    'UK NI number application',
    'BRP guidance',
    'eVisa support',
    'UK document consultancy',
    'DVLA licence exchange',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: 'UK Pathway Services',
    title: 'UK Pathway Services — Your Trusted Bridge to UK Documentation',
    description:
      'Expert consultancy for UK documentation. Driving licence conversion, NI numbers, BRP, eVisa, and more.',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en-GB" className={playfair.variable}>
      <body>{children}</body>
    </html>
  )
}
