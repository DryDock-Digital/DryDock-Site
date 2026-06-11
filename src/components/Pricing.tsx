import { BOOK_HREF, CONTACT_EMAIL } from '../constants'
import { track } from '../lib/analytics'

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
    name: 'Audit',
    tagline: 'Find out what’s wrong',
    price: '$750',
    time: '3 business days · invoiced after our free intro call',
    features: [
      'Full report on 30+ failure points',
      'Plain-English, ranked by risk',
      '20-minute walkthrough call',
      'Credited in full toward any fix (within 14 days)',
    ],
    hero: true,
    cta: { label: 'Book a free intro call', href: BOOK_HREF },
  },
  {
    name: 'Sprint',
    tagline: 'Fix it and ship it',
    price: '$3,500–$6,500',
    time: '1.5–2.5 weeks',
    features: [
      'All critical issues fixed',
      'Deployed and production-ready',
      'Fixed scope, fixed price',
      '14-day warranty after handover',
    ],
    note: 'Starts from your audit',
  },
  {
    name: 'Monitoring',
    tagline: 'Eyes on it as you grow',
    price: '$500',
    unit: '/mo',
    time: '6-month minimum commitment',
    features: [
      'Senior engineer watching your stack',
      'Code reviews on new features',
      'Security & data-model guardrails',
      'Fixes scoped & priced per SOW',
    ],
    note: 'Added after your fix',
  },
]

export function Pricing() {
  return (
    <section className="section bg-fog" id="pricing">
      <div className="container">
        <p className="eyebrow reveal">Pricing</p>
        <h2 className="h-sec reveal">Simple, fixed pricing.</h2>
        <p className="lead reveal">
          No mystery hourly meter. Start with the audit — it&rsquo;s the only decision you need to
          make today.
        </p>

        <div className="pricing-grid">
          {tiers.map((t) => (
            <div className={`tier ${t.hero ? 'hero-tier' : ''} reveal`} key={t.name}>
              {t.hero && <span className="badge-start">Start here</span>}
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
                  onClick={() => track('cta_book_clicked', { location: 'pricing_audit' })}
                >
                  {t.cta.label}
                </a>
              ) : (
                <p className="cta-note">{t.note}</p>
              )}
            </div>
          ))}
        </div>

        <p className="pricing-foot reveal">
          Not sure where to start? Book a free 20-minute intro call. If we agree the audit&rsquo;s
          a fit, we invoice you for the $750 — nothing&rsquo;s charged through the site. And the
          full amount comes off your fix if you proceed. Worst case, you get a clear picture of
          exactly where your app stands.
        </p>

        {/* Larger-scope clients land here — a smaller-than-the-tiers callout but
            visible enough to spot. Mailto: opens with a useful subject line. */}
        <p className="pricing-enterprise reveal">
          <strong>Need more?</strong> Enterprise contracts &mdash; custom scope, dedicated
          engineering &mdash; start at $18,000. Email{' '}
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=Enterprise%20contract%20inquiry`}
            onClick={() =>
              track('external_email_clicked', { location: 'enterprise_pricing' })
            }
          >
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </div>
    </section>
  )
}
