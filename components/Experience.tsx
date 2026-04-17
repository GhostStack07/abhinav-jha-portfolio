import { XP } from '@/lib/data'

export default function Experience() {
  return (
    <section id="experience" className="sec">
      <div className="sec-label reveal">
        <span className="n">03 —</span>
        <span className="title">Experience</span>
      </div>
      <h2 className="sec-title reveal">
        Seven years of <i>trench-work</i>,<br />
        in-house and at agency.
      </h2>

      <div className="xp">
        {XP.map((x, i) => (
          <div key={i} className="xp-item reveal">
            <div className="date">
              {x.date}
              <b>{x.dateBold}</b>
            </div>
            <div>
              <h3 dangerouslySetInnerHTML={{ __html: x.role }} />
              <div className="co" dangerouslySetInnerHTML={{ __html: x.co }} />
              <ul>
                {x.items.map((item, j) => (
                  <li key={j} dangerouslySetInnerHTML={{ __html: item }} />
                ))}
              </ul>
            </div>
            <div className="loc">{x.loc}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
