import { useRef } from 'react'
import { BOOK_HREF } from '../../constants'
import { animateCount, setGauge, useOnceInView } from '../../hooks/useGaugeAndCounter'
import { track } from '../../lib/analytics'
import { PathTabs } from '../PathTabs'
import { WaterlineWave } from '../WaterlineWave'

/**
 * Shipyard-path hero. Mirrors the Refit hero's structure (copy column +
 * dark stage panel + light readout + waterline) so the two heroes read as
 * siblings, but the stage is a "build slip": the keel-to-launch milestone
 * plan, with a launch-readiness gauge instead of the failing scan.
 */

const milestones = [
  {
    n: '01',
    name: 'Keel',
    scope: 'auth · data model · RLS',
    status: 'done',
    week: 'wk 1',
  },
  {
    n: '02',
    name: 'Hull',
    scope: 'core product features',
    status: 'done',
    week: 'wk 2–4',
  },
  {
    n: '03',
    name: 'Fit-out',
    scope: 'payments · admin · polish',
    status: 'done',
    week: 'wk 5',
  },
  {
    n: '04',
    name: 'Launch',
    scope: 'monitoring · docs · handoff',
    status: 'current',
    week: 'wk 6',
  },
]

export function BuildHero() {
  const scoreRef = useRef<HTMLDivElement>(null)
  const gaugeRef = useRef<SVGCircleElement>(null)

  // Animate the readout when the hero first enters the viewport
  const gaugeMount = useOnceInView(() => {
    if (gaugeRef.current) setGauge(gaugeRef.current, 100, 24)
    if (scoreRef.current) animateCount(scoreRef.current, 100, { dur: 1200 })
  })

  return (
    <section className="hero" id="top">
      <div className="blueprint" />
      <div className="container hero-content">
        <div className="hero-inner">
          {/* Copy */}
          <div className="hero-copy">
            <p className="eyebrow teal reveal">
              The Shipyard · ground-up builds by senior engineers
            </p>
            <h1 className="hero-h1 reveal">
              You bring the idea.
              <br />
              <span className="accent">We make it real.</span>
            </h1>
            <p className="hero-sub reveal">
              No agency theatre, no 80% trap. A senior crew builds your product keel-up in
              React + Supabase: fixed scope in writing, working software every week, launched
              to the same production bar our audits enforce.
            </p>
            <ul className="hero-pillars reveal" aria-label="How we build">
              <li className="hero-pillar">
                <h3>Fixed scope</h3>
                <p>
                  A written proposal: the features, the price, the timeline. You approve it
                  before we start. No hourly meter, ever.
                </p>
              </li>
              <li className="hero-pillar">
                <h3>Weekly slips</h3>
                <p>
                  Working software at a clickable URL every Friday, not status decks. You
                  steer the product while we build it.
                </p>
              </li>
              <li className="hero-pillar">
                <h3>Launch-ready</h3>
                <p>
                  Security, monitoring, error handling, and docs from the first commit. The
                  audit checklist is the build checklist.
                </p>
              </li>
            </ul>
            <div className="hero-cta reveal">
              <a
                href={BOOK_HREF}
                className="btn btn-teal"
                onClick={() => track('cta_book_clicked', { location: 'hero_build' })}
              >
                Book a free discovery call
              </a>
              <a href="#how" className="linkarrow">
                See how we build
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </a>
            </div>
            <div className="hero-price reveal">
              <p className="hero-price-headline">
                <span className="hero-price-amount">From $12,000</span>
                <span className="hero-price-context">
                  MVP build &middot; 4&ndash;8 weeks
                </span>
              </p>
              <p className="hero-price-meta">
                Fixed-price proposal after a free discovery call &middot; No upfront charges
              </p>
            </div>
          </div>

          {/* Right half of the split: the path switcher */}
          <PathTabs />

          {/* Stage: dark build-slip panel + light readout */}
          <div
            className="hero-stage reveal"
            ref={gaugeMount as React.RefObject<HTMLDivElement>}
          >
            <div className="scanpanel">
              <div className="scanpanel-bar">
                <i className="dot r" />
                <i className="dot y" />
                <i className="dot g" />
                <span className="file">buildplan/mvp.md</span>
                <span className="stack">React · Supabase</span>
              </div>
              <div className="scanpanel-body slip-body">
                {milestones.map((m) => (
                  <div className={`slip-line ${m.status}`} key={m.n}>
                    <span className="ln">{m.n}</span>
                    <span className="slip-name">{m.name}</span>
                    <span className="slip-scope">{m.scope}</span>
                    <span className="slip-week">{m.week}</span>
                    <span className="slip-mark" aria-hidden="true">
                      {m.status === 'done' ? '✓' : '●'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Readout — light card */}
            <div className="hero-readout">
              <div className="readout-gauge">
                <svg width="56" height="56" viewBox="0 0 56 56">
                  <circle cx="28" cy="28" r="24" fill="none" strokeWidth="5" />
                  <circle
                    ref={gaugeRef}
                    cx="28"
                    cy="28"
                    r="24"
                    fill="none"
                    stroke="#3CC98A"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray="150.8"
                    strokeDashoffset="150.8"
                  />
                </svg>
                <div className="readout-score" ref={scoreRef}>
                  0
                </div>
              </div>
              <div className="readout-text">
                <div className="label">Launch readiness</div>
                <div className="val">
                  <span className="good">Ready to ship</span> · keel to launch, 6 weeks
                </div>
              </div>
              <a href="#how" className="readout-cta linkarrow">
                See the process
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Layered animated waterline — full-bleed, edge to edge */}
      <WaterlineWave />
    </section>
  )
}
