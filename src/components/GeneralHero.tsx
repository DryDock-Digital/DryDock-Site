import { BOOK_HREF } from '../constants'
import { track } from '../lib/analytics'
import { PathTabs } from './PathTabs'
import { WaterlineWave } from './WaterlineWave'

/**
 * The parent-brand hero, shown before the visitor has picked a path. Same
 * split as the per-path heroes (copy left, path rail right) but with no
 * stage panel: the choice IS the stage here. Picking a path in the rail
 * swaps this out for that path's own hero (see App.tsx).
 */
export function GeneralHero() {
  return (
    <section className="hero hero-general" id="top">
      <div className="blueprint" />
      <div className="container hero-content">
        <div className="hero-inner">
          {/* Copy */}
          <div className="hero-copy">
            <p className="eyebrow teal reveal">
              Senior engineers · React + Supabase production specialists
            </p>
            <h1 className="hero-h1 reveal">
              Secure. User-Ready.
              <br />
              <span className="accent">Custom Software.</span>
            </h1>
            <p className="hero-sub reveal">
              Build a custom tool for your team, Bring your idea to life, or Shore-up what you've already made. Your premier development team is here for your success.
            </p>
            <ul className="hero-pillars reveal" aria-label="What we cover">
              <li className="hero-pillar">
                <h3>Security</h3>
                <p>
                  RLS, exposed keys, auth gaps, payment webhooks: the data-layer issues AI
                  tools quietly miss.
                </p>
              </li>
              <li className="hero-pillar">
                <h3>Scalability</h3>
                <p>
                  Query patterns, indexes, error handling. So the app gets faster as you
                  grow, not slower.
                </p>
              </li>
              <li className="hero-pillar">
                <h3>Launch-ready</h3>
                <p>
                  Monitoring, error boundaries, graceful failure: the polish between
                  &ldquo;demos great&rdquo; and &ldquo;survives real users.&rdquo;
                </p>
              </li>
            </ul>
            <div className="hero-cta reveal">
              <a
                href={BOOK_HREF}
                className="btn btn-teal"
                onClick={() => track('cta_book_clicked', { location: 'hero_general' })}
              >
                Book a free intro call
              </a>
              <a href="#paths" className="linkarrow">
                Pick your path
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </a>
            </div>
          </div>

          {/* Right half of the split: the path switcher, nothing selected yet */}
          <PathTabs />
        </div>
      </div>

      {/* Layered animated waterline — full-bleed, edge to edge */}
      <WaterlineWave />
    </section>
  )
}
