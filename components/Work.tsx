import Link from 'next/link'
import { WORK } from '@/lib/data'

export default function Work() {
  return (
    <section id="work" className="sec">
      <div className="sec-label reveal">
        <span className="n">02 —</span>
        <span className="title">Selected Work</span>
      </div>
      <h2 className="sec-title reveal">
        Campaigns, <i>agents</i>,<br />
        and <span className="hl">operating systems</span> shipped.
      </h2>

      <div className="work">
        {WORK.map(w => (
          <Link
            key={w.n}
            className="case reveal"
            href="#contact"
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
