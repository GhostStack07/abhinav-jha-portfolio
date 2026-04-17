export default function About() {
  const badges = [
    'Make.com','Zapier','Pabbly','Claude','GPT','Meta Ads','Google Ads',
    'GTM','GA4','SEMrush','Ahrefs','Zoho CRM','HubSpot','Notion','WhatsApp API',
  ]

  return (
    <section id="about" className="sec">
      <div className="sec-label reveal">
        <span className="n">01 —</span>
        <span className="title">About</span>
      </div>
      <h2 className="sec-title reveal">
        Part <span className="hl">marketer</span>,<br />
        part <i>automation engineer</i>.
      </h2>

      <div className="about-grid">
        <div className="about-copy reveal">
          <p className="lede">
            I lead marketing like an <b>operating system</b> —{' '}
            <i>strategy up top, automation underneath, and AI doing the work humans shouldn&apos;t have to.</i>
          </p>
          <p>
            Seven years running paid media, SEO, and marketing ops at{' '}
            <b style={{ color: 'var(--ink)', fontWeight: 500 }}>Internet Moguls</b>, where I head
            operations and account management. Most recent wins are quiet ones: 4 AI agents shipped to
            production that handle blogs, client research, ad copy, and social planning — collapsing
            content turnaround from days to hours.
          </p>
          <p>
            I&apos;ve delivered INR 90L+ in PPC revenue at 7.5× ROAS, hit 42× ROAS on resort campaigns
            with full-stack conversion tracking (GTM, Meta Pixel, GA4), and built automated lead routing
            with Make.com and 2Chat that drops leads into client WhatsApp groups in seconds — not hours.
          </p>
          <p className="dim">
            When I&apos;m not running campaigns, I&apos;m building custom WordPress plugins with Claude,
            designing workflow systems in Make/Zapier/Pabbly, and mentoring a team of 30+ across
            marketing, content, and client servicing.
          </p>
        </div>

        <aside className="about-side reveal">
          <h4>◇ Snapshot</h4>
          <dl>
            {[
              ['Role', 'Ops & Account Head'],
              ['Since', 'May 2019 — Present'],
              ['Education', "B.Com (Hons), St. Xavier's, Ranchi"],
              ['Certs', 'Google AI Essentials · ChatGPT Strategy · Adv. Digital Mktg'],
              ['Team', <><b>30+</b> across mkt · content · servicing</>],
              ['Peak ROAS', <><b>42×</b> on resort campaigns</>],
            ].map(([dt, dd]) => (
              <div className="row" key={String(dt)}>
                <dt>{dt}</dt>
                <dd>{dd}</dd>
              </div>
            ))}
          </dl>
          <h4>◇ Tools I live in</h4>
          <div className="badges">
            {badges.map(b => <span className="badge" key={b}>{b}</span>)}
          </div>
        </aside>
      </div>

      <div className="metrics reveal" style={{ marginTop: 64 }}>
        {[
          { v: '42', u: '×', k: 'Peak ROAS on resort campaigns' },
          { v: '90L', u: '+', k: 'INR revenue from PPC / SEM' },
          { v: '4', u: '', k: 'AI agents shipped to production' },
          { v: '30', u: '+', k: 'Team members led & mentored' },
        ].map(m => (
          <div className="metric" key={m.k}>
            <div className="v">{m.v}{m.u && <span className="u">{m.u}</span>}</div>
            <div className="k">{m.k}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
