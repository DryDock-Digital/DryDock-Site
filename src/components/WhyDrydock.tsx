// Editorial 2-column layout: sticky intro + hairline-separated reasons.
// (Per the design: clearly distinct from the pricing tier cards.)

const Check = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
)

const reasons = [
  {
    title: 'We only do React + Supabase.',
    body: 'It’s the most common AI-built stack — and because it’s all we do, we’ve seen every way it breaks. We’re faster, and we catch what generalists miss.',
  },
  {
    title: 'A real senior engineer — not a queue.',
    body: 'You work directly with an experienced engineer, not a junior behind a project manager or an anonymous offshore team.',
  },
  {
    title: 'We fix it, we don’t just flag it.',
    body: 'Audit tools stop at the report. We take it across the finish line.',
  },
  {
    title: 'No judgment. Ever.',
    body: 'You got further with AI than most engineers expected. We’re here to make it real, not to lecture you.',
  },
  {
    title: 'Fixed prices, in writing.',
    body: 'No mystery hourly meter. You know the scope and the cost before we start.',
  },
]

export function WhyDrydock() {
  return (
    <section className="section bg-fog" id="why">
      <div className="container why-layout">
        <div className="why-intro">
          <p className="eyebrow reveal">Why Drydock</p>
          <h2 className="h-sec reveal">Why founders trust us with this</h2>
          <p className="lead reveal">
            No agency theatre. One senior engineer, a single stack we know cold, and a price you
            see before we start.
          </p>
          <a href="#book" className="linkarrow reveal" style={{ marginTop: 26 }}>
            Book your audit
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>
        </div>
        <ul className="why-list">
          {reasons.map((r) => (
            <li className="why-item reveal" key={r.title}>
              <div className="check">
                <Check />
              </div>
              <div>
                <h3>{r.title}</h3>
                <p>{r.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
