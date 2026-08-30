import Link from 'next/link'
import { WORK } from '@/lib/data'

export default function Work() {
  return (
    <section id="work" className="sec">
      <div className="work-header reveal">
        <span className="wh-num">02</span>
        <span className="wh-label">Selected Work</span>
        <span className="wh-meta">{WORK.length} cases · campaigns, agents & systems</span>
      </div>

      <div className="work">
        {WORK.map(w => (
          <Link
            key={w.n}
            className="case reveal"
            href="#start"
            data-cursor="Inquire"
          >
            <div className="idx">{w.n}</div>
            <div>
              <div
                className="ttl"
                dangerouslySetInnerHTML={{ __html: w.title }}
              />
              <div className="tags">
                {w.tags.map(t => <span className="tag" key={t}>{t}</span>)}
              </div>
            </div>
            <div className="copy">{w.copy}</div>
            <div className="kpi">
              <div className="v">
                {w.kpi.v}
                {w.kpi.u && <span className="u">{w.kpi.u}</span>}
              </div>
              <div className="k">{w.kpi.k}</div>
            </div>
            <div className="arr">↗</div>
          </Link>
        ))}
      </div>
    </section>
  )
}
