import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import About from '@/components/About'
import Work from '@/components/Work'
import Experience from '@/components/Experience'
import Stack from '@/components/Stack'
import Now from '@/components/Now'
import LeadSection from '@/components/LeadSection'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'
import BlobCursor from '@/components/BlobCursor'
import TweaksPanel from '@/components/TweaksPanel'
import RevealObserver from '@/components/RevealObserver'
import Clock from '@/components/Clock'

export default function Home() {
  return (
    <>
      <BlobCursor />
      <Nav />

      <main className="shell" id="top">
        <Hero />
        <About />
        <Work />
        <Experience />
        <Stack />
        <Now />
        <LeadSection />
        <Contact />
        <Footer />
      </main>

      <div className="corner-stamp">
        <span className="dot" />
        SIGNAL OK · <Clock />
      </div>
      <div className="right-stamp">ABHINAV JHA // 2026</div>

      <TweaksPanel />
      <RevealObserver />
    </>
  )
}
