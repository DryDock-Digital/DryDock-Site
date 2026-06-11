// Honest placeholder — to be replaced with 2–3 before/after testimonials.

export function SocialProof() {
  return (
    <section className="section bg-white border-y" id="proof">
      <div className="container">
        <p className="eyebrow reveal">Proof</p>
        <h2 className="h-sec reveal">Real founders. Real fixes.</h2>
        <div className="proof-card reveal">
          <div>
            <div className="lead-q">
              Until we have case studies, the sample report is the proof.
            </div>
            <p>
              It&rsquo;s a real, anonymized report from a React + Supabase app: every issue,
              ranked by risk, with the exact fix. If you want to see the work before you book,
              start there.
            </p>
          </div>
          <a
            href="#report"
            className="btn btn-secondary"
            style={{ borderColor: 'var(--ink)', color: 'var(--ink)' }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6M9 13h6M9 17h6" />
            </svg>
            View the sample report
          </a>
        </div>
      </div>
    </section>
  )
}
