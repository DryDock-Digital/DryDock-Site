// Shipyard path — the problem section. Mirrors the Refit Problem section's
// structure (eyebrow / h-sec / lead / 4-card grid) so the two paths feel
// like siblings, with copy aimed at the pre-build founder.

const Sparkle = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
    <circle cx="12" cy="12" r="3.5" />
  </svg>
)
const Building = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M4 21h16M16 8h3a1 1 0 0 1 1 1v12" />
    <path d="M8 7h2M8 11h2M8 15h2M12 7h1M12 11h1M12 15h1" />
  </svg>
)
const Dice = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <path d="M8 8h.01M16 8h.01M12 12h.01M8 16h.01M16 16h.01" />
  </svg>
)
const Coins = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="9" r="6" />
    <path d="M18.1 10.4a6 6 0 1 1-7.7 7.7M7 9h4M9 7v4" />
  </svg>
)

const items = [
  {
    Icon: Sparkle,
    title: 'DIY with AI tools.',
    body: 'Lovable and Bolt feel magic until the last 20%: security, payments, and production polish they quietly skip. We know, because auditing those apps is our other business.',
  },
  {
    Icon: Building,
    title: 'The agency route.',
    body: 'Discovery phases, project managers, hourly meters. Months and a large invoice before a real user touches anything.',
  },
  {
    Icon: Dice,
    title: 'Freelancer roulette.',
    body: 'Great ones exist. But quality is a coin flip, and when one disappears mid-build, you own a half-finished codebase nobody else wants to inherit.',
  },
  {
    Icon: Coins,
    title: 'Hiring too early.',
    body: 'A founding engineer costs $200k+ a year. Making that hire before you know the idea has legs is the most expensive mistake on this list.',
  },
]

export function BuildProblem() {
  return (
    <section className="section bg-fog" id="build-problem">
      <div className="container">
        <p className="eyebrow reveal">The problem</p>
        <h2 className="h-sec reveal">Every way to build an MVP has a catch.</h2>
        <p className="lead reveal">
          You have the idea, and maybe the first users waiting. What you don&rsquo;t have is a
          way to ship it that isn&rsquo;t slow, risky, or half-finished:
        </p>

        <div className="problem-grid">
          {items.map((item) => (
            <div className="problem-card card reveal" key={item.title}>
              <div className="ic">
                <item.Icon />
              </div>
              <div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
