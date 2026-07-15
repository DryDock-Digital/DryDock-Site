import { BOOK_HREF, CONTACT_EMAIL } from '../../constants'
import { track } from '../../lib/analytics'

// Shipyard path — pricing. Same tier-card layout as the Refit Pricing
// section (shares the #pricing id; only one panel is mounted at a time).
// NOTE: figures are launch placeholders. Adjust freely; nothing else
// depends on them.

const Check = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
)

type Tier = {
  name: string
  tagline: string
  price: string
  unit?: string
  time: string
  features: string[]
  hero?: boolean
  cta?: { label: string; href: string }
  note?: string
}

const tiers: Tier[] = [
  {
    name: 'Prototype Sprint',
    tagline: 'Prove it before you commit',
    price: '$4,500',
    time: '2 weeks · fixed scope',
    features: [
      'A working, clickable product',
      'Real auth and data model, not a mockup',
      'Put it in front of real users',
      'Credited toward your MVP build',
    ],
    note: 'Rolls into your MVP build',
  },
  {
    name: 'MVP Build',
    tagline: 'Idea to launched product',
    price: 'From $12,000',
    time: '4–8 weeks · fixed price, billed per milestone',
    features: [
      'Full React + Supabase application',
      'Auth, RLS, and payments done right',
      'Working software every week',
      'Launch support + 14-day warranty',
    ],
    hero: true,
    cta: { label: 'Book a free discovery call', href: BOOK_HREF },
  },
  {
    name: 'Scale & Iterate',
    tagline: 'Your fractional product team',
    price: 'From $6,000',
    unit: '/mo',
    time: 'Monthly · after launch',
    features: [
      'Senior engineering, weekly shipping cadence',
      'Roadmap partnership, not ticket-taking',
      'Security & data-model guardrails',
      'Pause or stop with 30 days notice',
    ],
    note: 'Added after your launch',
  },
]

export function BuildPricing() {
  return (
    <section className="section bg-white border-y" id="pricing">
      <div className="container">
        <p className="eyebrow reveal">Pricing</p>
        <h2 className="h-sec reveal">Fixed prices. Milestones, not meters.</h2>
        <p className="lead reveal">
          Every build is scoped in writing before we start. You always know what ships, when,
          and what it costs.
        </p>

        <div className="pricing-grid">
          {tiers.map((t) => (
            <div className={`tier ${t.hero ? 'hero-tier' : ''} reveal`} key={t.name}>
              {t.hero && <span className="badge-start">Most builds</span>}
              <h3>{t.name}</h3>
              <p className="tagline">{t.tagline}</p>
              <div className="price-row">
                <span className="price">{t.price}</span>
                {t.unit && <span className="unit">{t.unit}</span>}
              </div>
              <div className="time">{t.time}</div>
              <ul>
                {t.features.map((f) => (
                  <li key={f}>
                    <Check />
                    {f}
                  </li>
                ))}
              </ul>
              {t.cta ? (
                <a
                  href={t.cta.href}
                  className="btn btn-primary btn-full tier-cta"
                  onClick={() => track('cta_book_clicked', { location: 'pricing_build' })}
                >
                  {t.cta.label}
                </a>
              ) : (
                <p className="cta-note">{t.note}</p>
              )}
            </div>
          ))}
        </div>

        <p className="pricing-enterprise reveal">
          <strong>Bigger scope?</strong> Custom platform builds and dedicated teams start at
          $40,000. Email{' '}
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=Custom%20build%20inquiry`}
            onClick={() =>
              track('external_email_clicked', { location: 'enterprise_pricing_build' })
            }
          >
            {CONTACT_EMAIL}
          </a>
          .
        </p>

        <p className="pricing-foot reveal">
          Every engagement starts with a free 20-minute discovery call. If it&rsquo;s a fit, you
          get a fixed-price proposal in writing and we invoice per milestone. Nothing is charged
          through the site. Worst case, you leave the call with a sharper picture of your MVP.
        </p>
      </div>
    </section>
  )
}
