// Shipyard path — how it works. Same numbered-steps layout as the Refit
// HowItWorks section. Shares the #how id so header/nav anchors resolve on
// either tab (only one panel is mounted at a time).

const steps = [
  {
    n: '01',
    title: 'Book a free discovery call.',
    body: '20 minutes on your idea. We help you cut it down to the MVP that actually proves the concept: what ships first, what waits.',
  },
  {
    n: '02',
    title: 'Fixed scope, in writing.',
    body: 'You get a proposal with the features, the price, and the timeline. You approve it before we lay the keel. No hourly meter, ever.',
  },
  {
    n: '03',
    title: 'Working software every week.',
    body: 'Not status decks. A URL you can click every Friday, so you steer the product while we build it.',
  },
  {
    n: '04',
    title: 'Launch, seaworthy.',
    body: 'The same bar our audits enforce: security, monitoring, error handling, docs. 14-day warranty, then hand over or keep sailing with us.',
  },
]

export function BuildProcess() {
  return (
    <section className="section bg-fog" id="how">
      <div className="container">
        <p className="eyebrow reveal">How it works</p>
        <h2 className="h-sec reveal">Keel to launch, in four steps.</h2>
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
