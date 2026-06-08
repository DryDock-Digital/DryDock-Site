import { BOOK_HREF } from '../constants'
import { CalendlyEmbed } from './CalendlyEmbed'
import { LeadForm } from './LeadForm'
import { WaterlineWave } from './WaterlineWave'

export function FinalCTA() {
  return (
    <section className="section final" id="book">
      <div className="blueprint" />
      <div className="container">
        <div className="final-head">
          <p className="eyebrow teal center reveal">Find out exactly where your app stands</p>
          <h2 className="h-sec reveal">
            A senior engineer.
            <br />
            <span className="accent">Your whole app reviewed.</span>
          </h2>
          <p className="lead reveal">
            Start with a free 20-minute intro call. If the audit&rsquo;s a fit, we invoice $750 —
            no upfront charges through the site — and the full amount comes off your fix.
          </p>
          <div className="final-cta-row reveal">
            <a href={BOOK_HREF} className="btn btn-teal" data-analytics="final-cta">
              Book a free intro call
            </a>
            <p className="final-micro">
              No judgment. No hourly meter. No surprise charges. Just answers.
            </p>
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
