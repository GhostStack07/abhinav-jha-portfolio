import Image from 'next/image'
import Link from 'next/link'

export default function Hero() {
  return (
    <section className="hero">
      <div className="eyebrow">
        <span className="pip" />
        <span>Operations Head / Account Management Head · New Delhi</span>
        <span className="rule" />
        <span>2019 — present</span>
      </div>

      <h1 className="display">
        Marketing,<br />
        <span className="i">but built</span><br />
        <span className="hl">like&nbsp;software.</span>
      </h1>

      <div className="hero-grid">
        <div>
          <p className="hero-lede">
            I&apos;m <em>Abhinav</em> — a senior digital marketer with 7+ years running performance
            marketing, automation, and AI-driven campaigns across hospitality, schools, and real estate.
            I&apos;ve built and shipped <em>4 production AI agents</em>, automated the manual out of
            agency ops, and delivered campaigns up to <em>42× ROAS</em>.
          </p>
          <div className="hero-cta">
            <Link className="btn primary" href="#contact" data-cursor="Say hi">
              Start a project <span className="arr">↗</span>
            </Link>
            <Link className="btn" href="#work" data-cursor="View">
              See selected work
            </Link>
          </div>
          <div className="hero-meta" style={{ marginTop: 48 }}>
            <div><div className="k">Currently</div><div className="v"><b>Ops &amp; Account Mgmt Head</b><br />Internet Moguls</div></div>
            <div><div className="k">Availability</div><div className="v"><b>Open</b> · 1 slot for Q2 &apos;26</div></div>
            <div><div className="k">Sectors</div><div className="v">Hospitality · Education · Real Estate · AI</div></div>
            <div><div className="k">Based</div><div className="v">Delhi NCR · Remote</div></div>
          </div>
        </div>

        <div>
          <div className="portrait-card portrait-cinematic">
            <div className="portrait-bg" aria-hidden="true" />
            <div className="portrait-halo" aria-hidden="true" />
            <Image
              src="/assets/abhinav-cyber.png"
              alt="Abhinav Jha"
              width={600}
              height={840}
              className="portrait-main"
              priority
            />
            <Image
              src="/assets/abhinav-cyber.png"
              alt=""
              aria-hidden
              width={600}
              height={840}
              className="portrait-ghost"
            />
            <div className="portrait-grain" aria-hidden="true" />
            <div className="portrait-scan" aria-hidden="true" />
            <div className="portrait-grid" aria-hidden="true">
              <span className="crn tl" />
              <span className="crn tr" />
              <span className="crn bl" />
              <span className="crn br" />
            </div>
            <div className="portrait-stamp">
              <span className="no">Nº 001</span>
              <span className="nm">ABHINAV JHA</span>
              <span className="yr">MMXXVI</span>
            </div>
            <span className="tag">Operator · Online</span>
            <div className="portrait-ticker" aria-hidden="true">
              <span>◊ 42× ROAS</span>
              <span>◊ INR 90L+</span>
              <span>◊ 4 AI AGENTS</span>
              <span>◊ 30+ TEAM</span>
              <span>◊ 42× ROAS</span>
              <span>◊ INR 90L+</span>
              <span>◊ 4 AI AGENTS</span>
              <span>◊ 30+ TEAM</span>
            </div>
          </div>
        </div>
      </div>

      <MarqueeStrip />
    </section>
  )
}

function MarqueeStrip() {
  const items = [
    { bold: '42× ROAS', label: 'Resort campaigns' },
    { bold: 'INR 90L+', label: 'Revenue generated' },
    { bold: '4 AI agents', label: 'Shipped in production' },
    { bold: '30+', label: 'Team led' },
    { bold: '20% YoY', label: 'Agency revenue growth' },
    { bold: '10+', label: 'New clients closed annually' },
  ]
  return (
    <div className="marquee" aria-hidden="true">
      <div className="track">
        {[...items, ...items].map((item, i) => (
          <span key={i}><b>{item.bold}</b> {item.label}</span>
        ))}
      </div>
    </div>
  )
}
