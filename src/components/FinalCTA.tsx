import { BOOK_HREF } from '../constants'
import { track } from '../lib/analytics'
import { useServicePath } from '../lib/servicePath'
import { CalendlyEmbed } from './CalendlyEmbed'
import { LeadForm } from './LeadForm'
import { WaterlineWave } from './WaterlineWave'

// Head copy per service path — the booking section itself (Calendly + lead
// form) is shared, since every path starts with the same free 20-min call.
// `general` covers the state before the visitor has picked a path.
const COPY = {
  general: {
    eyebrow: 'Start with a free 20-minute call',
    line1: 'A senior crew.',
    line2: 'Software that ships.',
    lead: 'Whether you have an app that needs finishing or an idea that needs building, start with a free 20-minute call. Nothing is charged through the site.',
    micro: 'No judgment. No hourly meter. No surprise charges. Just answers.',
    cta: 'Book a free intro call',
  },
  refit: {
    eyebrow: 'Find out exactly where your app stands',
    line1: 'A senior engineer.',
    line2: 'Your whole app reviewed.',
    lead: 'Start with a free 20-minute intro call. If the audit’s a fit, we invoice $750 (no upfront charges through the site) and the full amount comes off your fix.',
    micro: 'No judgment. No hourly meter. No surprise charges. Just answers.',
    cta: 'Book a free intro call',
  },
  build: {
    eyebrow: 'Turn the idea into a launch date',
    line1: 'A senior crew.',
    line2: 'Your idea, launched.',
    lead: 'Start with a free 20-minute discovery call. If it’s a fit, you get a fixed-price proposal in writing. Nothing is charged through the site.',
    micro: 'No agency theatre. No hourly meter. Just a plan and a price.',
    cta: 'Book a free discovery call',
  },
} as const

export function FinalCTA() {
  const { path } = useServicePath()
  const copy = COPY[path ?? 'general']

  return (
    <section className="section final" id="book">
      <div className="blueprint" />
      <div className="container">
        <div className="final-head">
          <p className="eyebrow teal center reveal">{copy.eyebrow}</p>
          <h2 className="h-sec reveal">
            {copy.line1}
            <br />
            <span className="accent">{copy.line2}</span>
          </h2>
          <p className="lead reveal">{copy.lead}</p>
          <div className="final-cta-row reveal">
            <a
              href={BOOK_HREF}
              className="btn btn-teal"
              onClick={() => track('cta_book_clicked', { location: 'final', path })}
            >
              {copy.cta}
            </a>
            <p className="final-micro">{copy.micro}</p>
          </div>
        </div>

        <div className="booking">
          {/* Real Calendly embed — themed to Linen. Swap CALENDLY_URL in constants. */}
          <CalendlyEmbed />
          <LeadForm />
        </div>
      </div>

      {/* Full-bleed ambient waterline closing the page before the footer */}
      <WaterlineWave className="final-wave" />
    </section>
  )
}
