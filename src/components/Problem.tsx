import { useRef } from 'react'
import { animateCount, useOnceInView } from '../hooks/useGaugeAndCounter'

// Inline icons — matching the design's specific path geometry.
const Shield = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M12 8v4M12 16h.01" />
  </svg>
)
const Loop = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 2v6h6" />
    <path d="M3 8a9 9 0 1 0 2.5-5.5L3 8" />
  </svg>
)
const Triangle = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
    <path d="M12 9v4M12 17h.01" />
  </svg>
)
const EyeOff = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.9 4.2A10.9 10.9 0 0 1 12 4c7 0 10 8 10 8a17 17 0 0 1-2.2 3.3M6.6 6.6A17 17 0 0 0 2 12s3 8 10 8a10.9 10.9 0 0 0 5.4-1.4" />
    <path d="m2 2 20 20" />
  </svg>
)

const items = [
  {
    Icon: Shield,
    title: 'Your database might be wide open.',
    body: (
      <>
        Most AI-built Supabase apps ship with security rules disabled, meaning any user can read
        everyone else&rsquo;s data.{' '}
        <span className="muted">
          A named, recurring failure mode in React/Supabase apps (CVE-2025-48757).
        </span>
      </>
    ),
  },
  {
    Icon: Loop,
    title: 'You’re stuck in the fix loop.',
    body: 'You fix one bug and three more appear. The AI keeps rewriting the same broken code.',
  },
  {
    Icon: Triangle,
    title: 'It runs in preview but breaks in production.',
    body: 'Works perfectly when you demo it. Falls over when it matters.',
  },
  {
    Icon: EyeOff,
    title: 'You can’t see what’s wrong.',
    body: 'That’s the scary part: the problems are invisible until a user, a hacker, or an investor finds them first.',
  },
]

export function Problem() {
  // The 45% stat: count-up when it enters view.
  const statRef = useRef<HTMLDivElement>(null)
  const statMount = useOnceInView(() => {
    if (statRef.current) animateCount(statRef.current, 45, { suffix: '%', dur: 1400 })
  })

  return (
    <section className="section bg-fog" id="problem">
      <div className="container">
        <p className="eyebrow reveal">The problem</p>
        <h2 className="h-sec reveal">Your app works. That&rsquo;s the problem.</h2>
        <p className="lead reveal">
          AI coding tools are brilliant at making something that <em>looks</em> finished.
          They&rsquo;re not built to handle the things that actually decide whether your app
          survives contact with real users:
        </p>

        {/* The 45% stat as a confident moment */}
        <div
          className="stat-banner reveal"
          ref={statMount as React.RefObject<HTMLDivElement>}
        >
          <div className="stat-num" ref={statRef}>
            0%
          </div>
          <div className="stat-text">
            <div className="big">
              of AI-generated code contains a known security vulnerability, at{' '}
              <strong>2.7&times;</strong> the density of human-written code.
            </div>
            <div className="src">
              Source · Veracode 2025 (100+ LLMs, 80 tasks). It&rsquo;s not your fault. It&rsquo;s
              how the tools work.
            </div>
          </div>
        </div>

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
