import { STACK } from '@/lib/data'

export default function Stack() {
  return (
    <section id="stack" className="sec">
      <div className="sec-label reveal">
        <span className="n">04 —</span>
        <span className="title">Stack</span>
      </div>
      <h2 className="sec-title reveal">The <i>toolchain</i> I run on.</h2>

      <div className="stack reveal">
        {STACK.map(s => (
          <div key={s.n} className="col">
            <h4><span className="n">{s.n}</span> {s.eyebrow}</h4>
            <h3 dangerouslySetInnerHTML={{ __html: s.title }} />
            <ul>
              {s.items.map(([name, meta]) => (
                <li key={name}>
                  <span>{name}</span>
                  <span className="meta">{meta}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
