import type { Metadata } from 'next'
import { Instrument_Serif, Inter_Tight, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const instrumentSerif = Instrument_Serif({
  weight: ['400'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-serif',
})

const interTight = Inter_Tight({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-sans',
})

const jetbrainsMono = JetBrains_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'Abhinav Jha — Digital Marketing & AI Operator',
  description:
    'Senior Digital Marketing Strategist with 7+ years leading performance marketing, automation, and AI-driven campaigns across hospitality, schools, and real estate.',
  openGraph: {
    title: 'Abhinav Jha — Digital Marketing & AI Operator',
    description: '42× ROAS · INR 90L+ · 4 AI Agents shipped to production.',
    url: 'https://abhinavjha.com',
    siteName: 'Abhinav Jha',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${interTight.variable} ${jetbrainsMono.variable}`}
    >
      <body data-screen-label="Portfolio">{children}</body>
    </html>
  )
}

