import type { Metadata } from 'next'
import { Instrument_Serif, Inter_Tight, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import TrackingScripts from '@/components/TrackingScripts'
import { prisma } from '@/lib/db'

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

async function getSettings() {
  try {
    return await prisma.siteSettings.upsert({ where: { id: 1 }, create: { id: 1 }, update: {} })
  } catch {
    return null
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings()
  return {
    title: s?.siteTitle ?? 'Abhinav Jha — Digital Marketing & AI Operator',
    description: s?.siteDescription ?? 'Senior Digital Marketing Strategist with 7+ years leading performance marketing, automation, and AI-driven campaigns.',
    openGraph: {
      title: s?.siteTitle ?? 'Abhinav Jha — Digital Marketing & AI Operator',
      description: s?.siteDescription ?? '42× ROAS · INR 90L+ · 4 AI Agents shipped to production.',
      url: s?.siteCanonical || 'https://abhinavjha.com',
      siteName: 'Abhinav Jha',
      images: s?.siteOgImage ? [s.siteOgImage] : [],
      type: 'website',
    },
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings()

  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${interTight.variable} ${jetbrainsMono.variable}`}
    >
      <body data-screen-label="Portfolio">
        {children}
        {settings && (
          <TrackingScripts
            gaMeasurementId={settings.gaMeasurementId || undefined}
            metaPixelId={settings.metaPixelId || undefined}
            gtmId={settings.gtmId || undefined}
            customHeadCode={settings.customHeadCode || undefined}
          />
        )}
      </body>
    </html>
  )
}
