const steps = [
  {
    n: '01',
    title: 'Book a free intro call.',
    body: 'A quick 20-min Calendly slot. No slides, no sales pitch. We just look at your app together.',
  },
  {
    n: '02',
    title: 'We agree it’s a fit.',
    body: 'If the audit makes sense for you, we send a single $750 invoice and you share repo access. Nothing automatic.',
  },
  {
    n: '03',
    title: 'We review your whole app.',
    body: '3 business days. You get a plain-English report (every issue ranked by risk, with the fix) plus a 20-min walkthrough call.',
  },
  {
    n: '04',
    title: 'You decide.',
    body: 'Fix it yourself with the roadmap, or have us do it (your $750 comes off the price). No pressure either way.',
  },
]

export function HowItWorks() {
  return (
    <section className="section bg-white border-y" id="how">
      <div className="container">
        <p className="eyebrow reveal">How it works</p>
        <h2 className="h-sec reveal">Four steps. No surprises.</h2>
        <ol className="steps">
          {steps.map((s) => (
            <li className="step reveal" key={s.n}>
              <div className="n">{s.n}</div>
              <div className="rule" />
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
