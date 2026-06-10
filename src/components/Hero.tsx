import { useEffect, useRef } from 'react'
import { BOOK_HREF } from '../constants'
import { animateCount, setGauge, useOnceInView } from '../hooks/useGaugeAndCounter'
import { track } from '../lib/analytics'
import { WaterlineWave } from './WaterlineWave'

/**
 * Centered hero (the design's "sleek elegant" final direction):
 *  - oversized Geist headline with a clay-accent half
 *  - dark "scan panel" inset showing flagged code lines with a live scan loop
 *  - light-Linen seaworthiness readout bar
 *  - layered animated waterline at the bottom
 */
export function Hero() {
  const reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const scoreRef = useRef<HTMLDivElement>(null)
  const gaugeRef = useRef<SVGCircleElement>(null)

  // Animate the readout when the hero first enters the viewport
  const gaugeMount = useOnceInView(() => {
    if (gaugeRef.current) setGauge(gaugeRef.current, 41, 24)
    if (scoreRef.current) animateCount(scoreRef.current, 41, { dur: 1200 })
  })

  // The scan loop — sweeps a glow down the code panel & pops severity pins.
  const scanBodyRef = useRef<HTMLDivElement>(null)
  const scanlineRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const body = scanBodyRef.current
    const line = scanlineRef.current
    if (!body || !line) return

    if (reduceMotion) {
      body.querySelectorAll('.pin').forEach((p) => p.classList.add('show'))
      return
    }

    let stopped = false
    let timer: number | undefined

    function startScan() {
      const pins = Array.from(body!.querySelectorAll<HTMLElement>('.pin')).map((el) => ({
        el,
        top: (el.parentElement as HTMLElement).offsetTop,
      }))
      const bodyH = body!.offsetHeight
      const SCAN_DUR = 2600
      const PAUSE = 1500
      line!.style.opacity = '1'
      pins.forEach((p) => p.el.classList.remove('show'))
      const start = performance.now()

      function frame(now: number) {
        if (stopped) return
        const t = Math.min(1, (now - start) / SCAN_DUR)
        const y = -56 + t * (bodyH + 56)
        line!.style.transform = `translateY(${y}px)`
        pins.forEach((p) => {
          if (y >= p.top) p.el.classList.add('show')
        })
        if (t < 1) {
          requestAnimationFrame(frame)
        } else {
          line!.style.opacity = '0'
          timer = window.setTimeout(startScan, PAUSE)
        }
      }
      requestAnimationFrame(frame)
    }
    startScan()

    return () => {
      stopped = true
      if (timer) window.clearTimeout(timer)
    }
  }, [reduceMotion])

  return (
    <section className="hero" id="top">
      <div className="blueprint" />
      <div className="container hero-content">
        <div className="hero-inner">
          {/* Copy */}
          <div className="hero-copy">
            <p className="eyebrow teal reveal">React + Supabase production specialists</p>
            <h1 className="hero-h1 reveal">
              You built it with AI.
              <br />
              <span className="accent">We make it real.</span>
            </h1>
            <p className="hero-sub reveal">
              Lovable, Bolt, v0, and Cursor get you 80% there — then the security holes, the
              database mistakes, and the &ldquo;works in the demo, breaks in the wild&rdquo;
              problems start. We&rsquo;re the senior engineers who take your app the last mile.
            </p>
            <div className="hero-cta reveal">
              <a
                href={BOOK_HREF}
                className="btn btn-teal"
                onClick={() => track('cta_book_clicked', { location: 'hero' })}
              >
                Book a free intro call
              </a>
              <a href="#report" className="linkarrow">
                See a sample audit report
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </a>
            </div>
            <div className="hero-trust reveal">
              <span><i className="dot" /> 20-min call, no commitment</span>
              <span><i className="dot" /> Fixed-price $750 audit if it&rsquo;s a fit</span>
              <span><i className="dot" /> Report in 3 business days</span>
            </div>
            <p className="hero-tagline reveal">Bring your app in for a refit.</p>
          </div>

          {/* Stage: dark scan panel + light readout */}
          <div
            className="hero-stage reveal"
            ref={gaugeMount as React.RefObject<HTMLDivElement>}
          >
            <div className="scanpanel">
              <div className="scanpanel-bar">
                <i className="dot r" />
                <i className="dot y" />
                <i className="dot g" />
                <span className="file">supabase/policies.sql</span>
                <span className="stack">React · Supabase</span>
              </div>
              <div className="scanpanel-body" ref={scanBodyRef}>
                <div className="scanline" ref={scanlineRef} />
                <div className="code-line">
                  <span className="ln">1</span>
                  <span><span className="tok-com">-- profiles table</span></span>
                </div>
                <div className="code-line flagged">
                  <span className="ln">2</span>
                  <span>
                    <span className="tok-key">alter table</span> profiles{' '}
                    <span className="tok-key">disable</span> row level security;
                  </span>
                  <span className="pin crit" data-pin="0">● Critical · RLS off</span>
                </div>
                <div className="code-line"><span className="ln">3</span><span> </span></div>
                <div className="code-line flagged high">
                  <span className="ln">4</span>
                  <span>
                    <span className="tok-key">const</span> supabase ={' '}
                    <span className="tok-fn">createClient</span>(url,{' '}
                    <span className="tok-str">SERVICE_ROLE_KEY</span>)
                  </span>
                  <span className="pin high" data-pin="1">● High · key exposed</span>
                </div>
                <div className="code-line"><span className="ln">5</span><span> </span></div>
                <div className="code-line">
                  <span className="ln">6</span>
                  <span>
                    {'  '}<span className="tok-fn">render</span>(
                    <span className="tok-str">{'{userInput}'}</span>){' '}
                    <span className="tok-com">// unescaped</span>
                  </span>
                </div>
                <div className="code-line flagged high">
                  <span className="ln">7</span>
                  <span>
                    {'  '}<span className="tok-key">await</span>{' '}
                    <span className="tok-fn">signIn</span>(email, password)
                  </span>
                  <span className="pin high" data-pin="2">● High · no rate limit</span>
                </div>
                <div className="code-line"><span className="ln">8</span><span> </span></div>
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
                    stroke="#F2A33C"
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
                <div className="label">Seaworthiness</div>
                <div className="val">
                  <span className="bad">Not ready to ship</span> — 6 issues found
                </div>
              </div>
              <a href="#report" className="readout-cta linkarrow">
                Open report
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
