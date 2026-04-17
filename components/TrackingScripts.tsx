'use client'
import Script from 'next/script'
import { useEffect } from 'react'

interface Props {
  gaMeasurementId?: string
  metaPixelId?: string
  gtmId?: string
  customHeadCode?: string
}

export default function TrackingScripts({ gaMeasurementId, metaPixelId, gtmId, customHeadCode }: Props) {
  return (
    <>
      {/* ── Google Tag Manager ────────────────── */}
      {gtmId && (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`}
        </Script>
      )}

      {/* ── Google Analytics 4 (standalone) ──── */}
      {gaMeasurementId && !gtmId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
            strategy="afterInteractive"
          />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('js',new Date());gtag('config','${gaMeasurementId}');`}
          </Script>
        </>
      )}

      {/* ── Meta Pixel ───────────────────────── */}
      {metaPixelId && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${metaPixelId}');
fbq('track', 'PageView');`}
        </Script>
      )}

      {/* ── Custom head code ─────────────────── */}
      {customHeadCode && <CustomScripts code={customHeadCode} />}
    </>
  )
}

// Properly executes <script> tags from raw HTML by appending them to <head>
function CustomScripts({ code }: { code: string }) {
  useEffect(() => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(code, 'text/html')
    const scripts = doc.querySelectorAll('script')

    const cleanup: HTMLScriptElement[] = []

    scripts.forEach(orig => {
      const s = document.createElement('script')
      if (orig.src) s.src = orig.src
      if (orig.async) s.async = true
      if (orig.defer) s.defer = true
      if (!orig.src) s.textContent = orig.textContent
      // copy any data attributes
      Array.from(orig.attributes).forEach(attr => {
        if (!['src', 'async', 'defer'].includes(attr.name)) {
          s.setAttribute(attr.name, attr.value)
        }
      })
      document.head.appendChild(s)
      cleanup.push(s)
    })

    return () => cleanup.forEach(s => s.remove())
  }, [code])

  return null
}
