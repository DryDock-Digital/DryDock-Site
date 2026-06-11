import { useRef, useState } from 'react'
import { BOOK_HREF, SCANNER_URL } from '../constants'
import { animateCount, setGauge, useOnceInView } from '../hooks/useGaugeAndCounter'
import { track } from '../lib/analytics'

/**
 * The centerpiece — an interactive sample audit report.
 *  - 41/100 seaworthiness gauge with a verdict
 *  - severity-count summary
 *  - Today ↔ After-the-sprint toggle that flips the whole state
 *  - filterable findings, each expanding to plain-English risk + a code-diff fix
 */

type Severity = 'crit' | 'high' | 'med' | 'pass'
type Filter = 'all' | Severity

type Finding = {
  sev: Severity
  title: string
  loc: string
  what: React.ReactNode
  risk?: React.ReactNode
  fix?: React.ReactNode
}

const findings: Finding[] = [
  {
    sev: 'crit',
    title: 'Row-Level Security is disabled on your user data',
    loc: 'public.profiles · public.messages',
    what: (
      <>
        Your tables ship with row-level security turned off, so the database never checks{' '}
        <em>who</em> is asking. Any logged-in user (or anyone who finds your public API key) can
        read and edit every other user&rsquo;s data. This is the exact flaw behind the Tea app
        breach and CVE-2025-48757.
      </>
    ),
    risk: 'Full exposure of every user’s private records. A single curious user (or a scraper) can download your entire database.',
    fix: (
      <>
        <span className="cmt">{'-- Lock every table, then allow each user only their own rows'}</span>
        <br />
        <span className="add">+ alter table profiles enable row level security;</span>
        <br />
        <span className="add">+ create policy "own profile" on profiles</span>
        <br />
        <span className="add">{'+  for select using ( auth.uid() = user_id );'}</span>
      </>
    ),
  },
  {
    sev: 'crit',
    title: 'Supabase service-role key is shipped to the browser',
    loc: 'src/lib/supabaseClient.ts',
    what: (
      <>
        The admin (service-role) key bypasses all security rules, and it&rsquo;s bundled into the
        JavaScript every visitor downloads. Anyone can open dev tools, copy it, and get full
        read/write access to your entire database.
      </>
    ),
    risk: 'Total database takeover: read, edit, or wipe everything. No login required.',
    fix: (
      <>
        <span className="del">- const supabase = createClient(url, SERVICE_ROLE_KEY)</span>
        <br />
        <span className="add">+ const supabase = createClient(url, ANON_PUBLIC_KEY)</span>
        <br />
        <span className="cmt">{'// move admin actions to a server route, then rotate the leaked key'}</span>
      </>
    ),
  },
  {
    sev: 'high',
    title: 'User input is rendered without escaping (stored XSS)',
    loc: 'src/components/CommentList.tsx',
    what: (
      <>
        Comments are injected with <code>dangerouslySetInnerHTML</code>. A user can post a comment
        containing a script that then runs in every other visitor&rsquo;s browser, stealing
        sessions or redirecting them. AI code fails to defend against XSS 86% of the time.
      </>
    ),
    risk: 'Account hijacking and data theft across all users who view the page.',
    fix: (
      <>
        <span className="del">{'- <div dangerouslySetInnerHTML={{ __html: comment }} />'}</span>
        <br />
        <span className="add">{'+ <div>{comment}</div>'}</span>
        <span className="cmt">{'  // React escapes by default'}</span>
      </>
    ),
  },
  {
    sev: 'high',
    title: 'No rate limiting on auth, open to credential stuffing',
    loc: 'supabase/auth · /api/login',
    what: 'Your login endpoint accepts unlimited attempts. Attackers can run millions of password guesses, and every attempt costs you money in function invocations.',
    risk: 'Account takeover via brute force, plus a runaway cloud bill.',
    fix: (
      <>
        <span className="cmt">{'// throttle by IP + email; add a captcha after 5 failed attempts'}</span>
        <br />
        <span className="add">{"+ const { success } = await rateLimit.check(ip, { max: 5, window: '15m' })"}</span>
        <br />
        <span className="add">{"+ if (!success) return res.status(429).json({ error: 'Too many attempts' })"}</span>
      </>
    ),
  },
  {
    sev: 'med',
    title: 'N+1 queries and missing indexes slow the dashboard',
    loc: 'src/routes/Dashboard.tsx',
    what: 'The dashboard fires one query per row instead of one query for all rows, and foreign keys aren’t indexed. It feels fine with 20 rows in the demo and crawls at 2,000.',
    risk: 'The app gets slower as you get more successful. Exactly backwards.',
    fix: (
      <>
        <span className="add">+ create index on messages (conversation_id);</span>
        <br />
        <span className="cmt">{'// and fetch in one batched query with a join, not a loop'}</span>
      </>
    ),
  },
  {
    sev: 'med',
    title: 'No error boundaries, one failed fetch blanks the screen',
    loc: 'src/App.tsx',
    what: 'A single failed network request throws and unmounts the whole React tree. Users see a white screen with no explanation and no way to recover.',
    risk: 'Looks "down" to users on any transient error; high support burden.',
    fix: (
      <>
        <span className="add">{'+ <ErrorBoundary fallback={<RetryCard />}>'}</span>
        <br />
        {'  <App />'}
        <br />
        <span className="add">{'+ </ErrorBoundary>'}</span>
      </>
    ),
  },
  {
    sev: 'pass',
    title: 'HTTPS, secure cookies & dependency hygiene look good',
    loc: '8 checks passed',
    what: (
      <>
        TLS is enforced, cookies are <code>httpOnly</code> + <code>secure</code>, and your lockfile
        has no known-vulnerable dependencies. Credit where it&rsquo;s due: the tooling got these
        right. We tell you what&rsquo;s solid, not just what&rsquo;s broken.
      </>
    ),
  },
]

const SEV_LABEL: Record<Severity, string> = {
  crit: 'Critical',
  high: 'High',
  med: 'Medium',
  pass: 'Passed',
}

type BAState = 'before' | 'after'

const states: Record<
  BAState,
  {
    score: number
    verdict: string
    vclass: 'bad' | 'good'
    sub: string
    counts: Record<Severity, number>
  }
> = {
  before: {
    score: 41,
    verdict: 'Not seaworthy',
    vclass: 'bad',
    sub: 'Critical security and data issues must be fixed before real users.',
    counts: { crit: 2, high: 2, med: 2, pass: 8 },
  },
  after: {
    score: 96,
    verdict: 'Ship-ready',
    vclass: 'good',
    sub: 'Hardened, deployed, and covered by a 14-day warranty. Cleared for real users and investors.',
    counts: { crit: 0, high: 0, med: 0, pass: 14 },
  },
}

export function SampleReport() {
  const [filter, setFilter] = useState<Filter>('all')
  const [openIdx, setOpenIdx] = useState<Set<number>>(new Set([0]))
  const [ba, setBa] = useState<BAState>('before')

  const gaugeRef = useRef<SVGCircleElement>(null)
  const scoreRef = useRef<HTMLDivElement>(null)
  const sevRefs = {
    crit: useRef<HTMLDivElement>(null),
    high: useRef<HTMLDivElement>(null),
    med: useRef<HTMLDivElement>(null),
    pass: useRef<HTMLDivElement>(null),
  }

  // Animate the initial gauge + counts when the report enters view + emit
  // an analytics event so we can see how many visitors actually look at it.
  const mountRef = useOnceInView(() => {
    applyState('before', true)
    track('sample_report_viewed')
  }, 0.2)

  function applyState(key: BAState, animate: boolean) {
    const s = states[key]
    if (gaugeRef.current) setGauge(gaugeRef.current, s.score, 58, { snap: !animate })
    if (scoreRef.current) {
      const from = parseInt(scoreRef.current.textContent || '0', 10) || 0
      if (animate) animateCount(scoreRef.current, s.score, { dur: 1100, from })
      else scoreRef.current.textContent = String(s.score)
    }
    ;(Object.keys(sevRefs) as Severity[]).forEach((k) => {
      const el = sevRefs[k].current
      if (!el) return
      const from = parseInt(el.textContent || '0', 10) || 0
      if (animate) animateCount(el, s.counts[k], { dur: 900, from })
      else el.textContent = String(s.counts[k])
    })
  }

  function selectBA(next: BAState) {
    if (next === ba) return
    setBa(next)
    applyState(next, true)
  }

  function toggleOpen(i: number) {
    setOpenIdx((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  const counts = states[ba].counts
  const verdict = states[ba]

  const visible = findings
    .map((f, i) => ({ f, i }))
    .filter(({ f }) => filter === 'all' || f.sev === filter)

  return (
    <section
      className="section report-section"
      id="report"
      ref={mountRef as React.RefObject<HTMLElement>}
    >
      <div className="blueprint" />
      <div className="container">
        <div className="report-head">
          <div>
            <p className="eyebrow teal reveal">Sample audit report</p>
            <h2 className="h-sec reveal">This is exactly what you get back.</h2>
            <p className="lead reveal">
              A real, anonymized report from a React + Supabase app. Every issue, ranked by risk,
              in plain English, with the exact fix. Click any finding to see how dangerous it is
              and how we&rsquo;d repair it.
            </p>
          </div>
        </div>

        <div className="report reveal">
          {/* topbar */}
          <div className="report-topbar">
            <i className="dot" />
            <span className="title">audit-report.drydock</span>
            <span className="badge">React + Supabase</span>
            <div className="right">
              <span>App: &ldquo;Project Tideway&rdquo; (anonymized)</span>
              <span>Reviewed in 3 days</span>
            </div>
          </div>

          {/* summary band */}
          <div className="report-summary">
            <div className="score-block">
              <div className="gauge">
                <svg width="132" height="132" viewBox="0 0 132 132">
                  <circle cx="66" cy="66" r="58" fill="none" strokeWidth="9" />
                  <circle
                    ref={gaugeRef}
                    cx="66"
                    cy="66"
                    r="58"
                    fill="none"
                    stroke="#F2A33C"
                    strokeWidth="9"
                    strokeLinecap="round"
                    strokeDasharray="364.4"
                    strokeDashoffset="364.4"
                  />
                </svg>
                <div className="gauge-center">
                  <div className="num" ref={scoreRef}>
                    0
                  </div>
                  <div className="den">/ 100</div>
                </div>
              </div>
              <div className="score-meta">
                <div className="label">Seaworthiness score</div>
                <div className={`verdict ${verdict.vclass}`}>{verdict.verdict}</div>
                <div className="sub">{verdict.sub}</div>
              </div>
            </div>

            <div className="sev-counts">
              {(['crit', 'high', 'med', 'pass'] as Severity[]).map((k) => (
                <div className={`sev-count ${k}`} key={k}>
                  <div className="n" ref={sevRefs[k]}>
                    {counts[k]}
                  </div>
                  <div className="l">{SEV_LABEL[k]}</div>
                </div>
              ))}
            </div>

            <div className="ba-toggle" role="group" aria-label="Score view">
              <button className={ba === 'before' ? 'active' : ''} onClick={() => selectBA('before')}>
                Today
              </button>
              <button className={ba === 'after' ? 'active' : ''} onClick={() => selectBA('after')}>
                After the sprint
              </button>
            </div>
          </div>

          {/* filters */}
          <div className="report-filters" role="tablist" aria-label="Filter findings by severity">
            {(
              [
                { f: 'all' as Filter, label: 'All findings', count: findings.length },
                { f: 'crit' as Filter, label: 'Critical', count: findings.filter((x) => x.sev === 'crit').length },
                { f: 'high' as Filter, label: 'High', count: findings.filter((x) => x.sev === 'high').length },
                { f: 'med' as Filter, label: 'Medium', count: findings.filter((x) => x.sev === 'med').length },
                { f: 'pass' as Filter, label: 'Passed', count: 8 },
              ] as const
            ).map((c) => (
              <button
                key={c.f}
                type="button"
                className={`chip ${filter === c.f ? 'active' : ''}`}
                onClick={() => setFilter(c.f)}
              >
                {c.f !== 'all' && <span className={`cdot ${c.f}`} />}
                {c.label} <span style={{ opacity: 0.6 }}>{c.count}</span>
              </button>
            ))}
          </div>

          {/* findings */}
          <div className="findings" id="findings">
            {visible.map(({ f, i }) => {
              const isOpen = openIdx.has(i)
              return (
                <div className={`finding ${isOpen ? 'open' : ''}`} data-sev={f.sev} key={i}>
                  <button
                    type="button"
                    className="finding-head"
                    aria-expanded={isOpen}
                    onClick={() => toggleOpen(i)}
                  >
                    <span className={`sev-tag ${f.sev}`}>{SEV_LABEL[f.sev]}</span>
                    <div className="finding-title">
                      <div className="t">{f.title}</div>
                      <div className="loc">{f.loc}</div>
                    </div>
                    <span className="finding-chev">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </span>
                  </button>
                  <div className="finding-body">
                    <div className="finding-body-inner">
                      <div className="finding-content">
                        <div className="row">
                          <div className="k">{f.sev === 'pass' ? 'What we checked' : 'What it means'}</div>
                          <div className="v">{f.what}</div>
                        </div>
                        {f.risk && (
                          <div className="row">
                            <div className="k">The risk</div>
                            <div className="v">{f.risk}</div>
                          </div>
                        )}
                        {f.fix && (
                          <div className="row">
                            <div className="k">The fix</div>
                            <div className="codefix">{f.fix}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* foot */}
          <div className="report-foot">
            <div className="note">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
              Full report includes a 20-minute walkthrough call.
            </div>
            <div className="report-foot-actions">
              <a
                href={SCANNER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="linkarrow report-foot-scan"
                onClick={() => track('scanner_opened', { location: 'sample_report' })}
              >
                Or try a free 30-sec scan first
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </a>
              <a
                href={BOOK_HREF}
                className="btn btn-teal btn-sm"
                onClick={() => track('cta_book_clicked', { location: 'sample_report' })}
              >
                Get this report for your app
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
