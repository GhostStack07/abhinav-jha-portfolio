import { STACK } from '@/lib/data'

export default function Stack() {
  return (
    <section id="stack" className="sec">
      <p className="stack-intro reveal">
        <span className="si-num">04</span>
        <span>The toolchain I run on — <i>no fluff, no buzzwords.</i></span>
      </p>

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
