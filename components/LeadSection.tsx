import LeadForm from './LeadForm'

export default function LeadSection() {
  return (
    <section id="start" className="sec">
      <div className="sec-label reveal">
        <span className="n">06 —</span>
        <span className="title">Start a Project</span>
      </div>
      <h2 className="sec-title reveal">
        Tell me about <span className="hl">the problem</span>.<br />
        I&apos;ll reply in <i>24 hours</i>.
      </h2>

      <div className="lead reveal">
        <span className="stamp">FORM · <b>v1.0</b> · ENCRYPTED</span>

        <div className="pitch">
          <h3>A <span className="hl">15-min call</span>, <i>then a plan.</i></h3>
          <p>
            Drop the basics below. If we&apos;re a fit, I&apos;ll come back with a loose scope,
            a timeline, and a ballpark — no pitch deck, no back-and-forth.
          </p>
          <ul>
            <li>I reply within one business day (IST).</li>
            <li>No sales funnel — this goes straight to my inbox.</li>
            <li>Currently taking 1 new engagement for Q2 2026.</li>
          </ul>
        </div>

        <LeadForm />
      </div>
    </section>
  )
}
