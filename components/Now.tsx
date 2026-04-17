export default function Now() {
  const active = [
    'Scaling the blog-generation agent to cover 3 more client verticals',
    'Rebuilding the ad-copy agent to handle 4 creative angles in parallel',
    'Writing a short playbook on AI-as-ops for marketing agencies',
  ]
  const done = [
    'Shipped WordPress booking plugin (Claude-assisted build)',
    'Deployed Make.com + 2Chat lead routing — response time: seconds',
    'Hit 42× ROAS on luxury resort seasonal push',
  ]

  return (
    <section id="now" className="sec">
      <div className="sec-label reveal">
        <span className="n">05 —</span>
        <span className="title">Now</span>
      </div>
      <h2 className="sec-title reveal">
        What I&apos;m <i>actually</i> doing this quarter.
      </h2>

      <div className="now reveal">
        <div>
          <h3>April 2026 — operating from <i>Delhi NCR</i>.</h3>
          <p>
            I&apos;m leading ops &amp; account management at Internet Moguls, shipping AI agents for
            agency workflows, and taking on one select freelance engagement per quarter.
          </p>
          <p>
            My heuristic: if a task happens more than twice a week, it gets automated. If it requires
            judgment, it gets an agent with a well-written prompt.
          </p>
          <div className="stat">
            <span className="dot" />
            STATUS · AVAILABLE FOR 1 ENGAGEMENT · Q2 2026
          </div>
        </div>

        <ul>
          {active.map(item => <li key={item}>{item}</li>)}
          {done.map(item => <li key={item} className="done">{item}</li>)}
        </ul>
      </div>
    </section>
  )
}
