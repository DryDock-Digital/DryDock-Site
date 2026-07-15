// Shipyard path — "what you get". Reuses the editorial why-layout (sticky
// intro + hairline-separated checklist) so the build path inherits the same
// visual language as WhyDrydock on the Refit path.

const Check = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
)

const deliverables = [
  {
    title: 'A production React + Supabase app.',
    body: 'The stack we know cold. Fast to build, easy to hire for later, and portable: no proprietary platform holding your product hostage.',
  },
  {
    title: 'Security from the first commit.',
    body: 'RLS, auth flows, rate limits, key handling. Our audit checklist for AI-built apps is our build checklist. You skip the refit entirely.',
  },
  {
    title: 'Payments that hold up.',
    body: 'Stripe wired in properly: webhooks handled, failure paths tested, no orphaned subscriptions when a card bounces.',
  },
  {
    title: 'Monitoring and graceful failure.',
    body: 'Error tracking, boundaries, and alerts from day one. You hear about breakage before your users tweet about it.',
  },
  {
    title: 'Your code, your accounts, day one.',
    body: 'The repo, the infra, and the docs live in your name from the first week. No lock-in, no ransom at handover.',
  },
]

export function BuildScope() {
  return (
    <section className="section bg-white border-y" id="build-scope">
      <div className="container why-layout">
        <div className="why-intro">
          <p className="eyebrow reveal">What you get</p>
          <h2 className="h-sec reveal">A real product, not a demo that folds under users</h2>
          <p className="lead reveal">
            Everything we flag when we audit AI-built apps, done right the first time. Built
            keel-up to the same production bar, by the same senior crew.
          </p>
          <a href="#book" className="linkarrow reveal" style={{ marginTop: 26 }}>
            Book a discovery call
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>
        </div>
        <ul className="why-list">
          {deliverables.map((d) => (
            <li className="why-item reveal" key={d.title}>
              <div className="check">
                <Check />
              </div>
              <div>
                <h3>{d.title}</h3>
                <p>{d.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
