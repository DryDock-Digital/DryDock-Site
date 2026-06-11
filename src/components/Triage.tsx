import { FormEvent, useState } from 'react'
import { CONTACT_EMAIL, EMERGENCY_EMAIL, TRIAGE_FORM_ENDPOINT } from '../constants'
import { track } from '../lib/analytics'
import { submitForm } from '../lib/submitForm'
import { Link } from '../lib/router'
import { Logo } from './Logo'

/**
 * The dedicated emergency triage screen. Reached via:
 *  - the emergency strip CTA (after the Problem section)
 *  - the footer link
 * Voice: calm, "steady hand," no-judgment. Amber accent for urgency.
 */

type Sev = 'breach' | 'down' | 'suspected' | 'flagged'
type Status = 'idle' | 'submitting' | 'success' | 'error'

const sevOptions: Array<{ k: Sev; t: string; d: string; crit: boolean }> = [
  { k: 'breach', t: 'Active breach', d: 'data is leaking now', crit: true },
  { k: 'down', t: 'App is down', d: 'users can’t access it', crit: true },
  { k: 'suspected', t: 'Suspected leak', d: 'something looks wrong', crit: false },
  { k: 'flagged', t: 'Flagged by someone', d: 'user / investor / report', crit: false },
]

type Props = { onBack: () => void }

export function Triage({ onBack }: Props) {
  const [sev, setSev] = useState<Sev>('breach')
  const [status, setStatus] = useState<Status>('idle')
  const [via, setVia] = useState<'http' | 'mailto' | null>(null)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const email = (form.elements.namedItem('tf-email') as HTMLInputElement).value.trim()
    if (!email) {
      ;(form.elements.namedItem('tf-email') as HTMLInputElement).focus()
      return
    }
    setStatus('submitting')

    const data = { ...Object.fromEntries(new FormData(form).entries()), severity: sev }
    const sevLabel = sevOptions.find((o) => o.k === sev)?.t || sev
    try {
      const result = await submitForm(data, {
        endpoint: TRIAGE_FORM_ENDPOINT,
        subject: `URGENT: Drydock triage (${sevLabel})`,
        to: EMERGENCY_EMAIL,
      })
      setVia(result.via)
      setStatus('success')
      track('triage_form_submitted', { severity: sev, via: result.via })
      form.reset()
      setSev('breach') // restore the default severity selection
    } catch {
      setStatus('error')
    }
  }

  return (
    <section id="triage-view">
      <div className="triage">
        <div className="blueprint" />
        <div className="container">
          {/* Top header bar — gives the triage view its own clean nav,
              fixes the earlier "headerless" layout. */}
          <div className="triage-header">
            <Link
              to="/"
              className="triage-home"
              aria-label="Back to Drydock home"
              onClick={() => onBack()}
            >
              <Logo size={28} />
              <span className="logo-word">Drydock</span>
            </Link>
            <button className="triage-back" type="button" onClick={onBack}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 12H5M11 18l-6-6 6-6" />
              </svg>
              Back to drydock.digital
            </button>
          </div>
        </div>

        <div className="container triage-inner">
          <p className="triage-eyebrow">
            <span className="pulse" /> 48-hour emergency triage
          </p>
          <h1>
            App leaking data or down?{' '}
            <span className="amber">Let&rsquo;s stop the bleeding.</span>
          </h1>
          <p className="triage-sub">
            A senior React + Supabase engineer gets on it fast. We contain the incident, find out
            what happened, and get you to a safe, stable state. Then help you tell users the
            truth, calmly. No judgment. Just a steady hand.
          </p>

          <div className="triage-grid">
            {/* First-hour timeline */}
            <div className="t60">
              <p className="t60-label">What happens in the first hour</p>
              <div className="t60-steps">
                <div className="t60-step">
                  <div className="t60-num">1</div>
                  <div>
                    <h3>Contain</h3>
                    <div className="when">0–15 min · stop the leak</div>
                    <p>
                      We lock down the exposed data path first: rotate keys, flip on row-level
                      security, pull the leaking endpoint. Bleeding stops before anything else.
                    </p>
                  </div>
                </div>
                <div className="t60-step">
                  <div className="t60-num">2</div>
                  <div>
                    <h3>Assess</h3>
                    <div className="when">15–45 min · what happened</div>
                    <p>
                      We trace the blast radius: what was exposed, for how long, and to whom. You
                      get a clear, plain-English picture, not a panic.
                    </p>
                  </div>
                </div>
                <div className="t60-step">
                  <div className="t60-num">3</div>
                  <div>
                    <h3>Stabilize &amp; communicate</h3>
                    <div className="when">45–60 min · safe footing</div>
                    <p>
                      We get you to a stable deploy and draft what to tell users and, if needed,
                      regulators. Then we plan the permanent fix.
                    </p>
                  </div>
                </div>
              </div>
              <div className="triage-callout">
                <div className="tc-t">
                  Prefer to call?{' '}
                  <span className="light">
                    We answer fastest by email with &ldquo;URGENT&rdquo; in the subject.
                  </span>
                </div>
                <a
                  href={`mailto:${EMERGENCY_EMAIL}?subject=URGENT%20%E2%80%94%20emergency%20triage`}
                >
                  {EMERGENCY_EMAIL}
                </a>
              </div>
            </div>

            {/* Intake form */}
            <div className="triage-form">
              <h2>Start emergency triage</h2>
              <p className="tf-sub">
                Tell us what&rsquo;s happening. We reply within hours, not days. Usually much
                faster.
              </p>

              <form onSubmit={onSubmit} noValidate>
                <div className="field" style={{ marginTop: 18 }}>
                  <label>How bad is it right now?</label>
                </div>
                <div className="sev-pick">
                  {sevOptions.map((opt) => (
                    <button
                      key={opt.k}
                      type="button"
                      className={`sev-opt ${opt.crit ? 'crit' : ''} ${sev === opt.k ? 'active' : ''}`}
                      onClick={() => setSev(opt.k)}
                    >
                      <span className="so-t">{opt.t}</span>
                      <span className="so-d">{opt.d}</span>
                    </button>
                  ))}
                </div>

                <div className="field">
                  <label htmlFor="tf-email">Email</label>
                  <input
                    id="tf-email"
                    name="email"
                    type="email"
                    placeholder="you@startup.com"
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="tf-repo">Repo or app URL</label>
                  <input
                    id="tf-repo"
                    name="repo"
                    type="text"
                    placeholder="github.com/you/app  ·  or  app.com"
                  />
                </div>
                <div className="field">
                  <label htmlFor="tf-what">What&rsquo;s happening?</label>
                  <textarea
                    id="tf-what"
                    name="description"
                    placeholder="e.g. A user said they can see other people&rsquo;s orders…"
                  />
                </div>

                <button
                  type="submit"
                  className="triage-submit"
                  disabled={status === 'submitting'}
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M7 18v-6a5 5 0 0 1 10 0v6" />
                    <path d="M5 21h14M5 18h14" />
                  </svg>
                  {status === 'submitting'
                    ? 'Sending…'
                    : status === 'success'
                      ? 'Request received ✓'
                      : 'Send emergency triage request'}
                </button>
                <div className="triage-reassure">
                  <span><i className="dot" /> Senior engineer, immediately</span>
                  <span><i className="dot" /> No judgment</span>
                  <span><i className="dot" /> NDA on request</span>
                </div>
                <div className={`triage-ok ${status === 'success' ? 'show' : ''}`}>
                  {via === 'mailto'
                    ? `Your email client should now be open with the request drafted (going to ${EMERGENCY_EMAIL}). Hit send, we'll reply fast.`
                    : `Got it. Your request is in. We'll reply fast at ${CONTACT_EMAIL}.`}
                </div>
                {status === 'error' && (
                  <div
                    className="triage-ok show"
                    style={{
                      background: 'rgba(242,114,127,.1)',
                      borderColor: 'rgba(242,114,127,.32)',
                      color: '#ffb1ba',
                    }}
                  >
                    Couldn&rsquo;t send. Email {EMERGENCY_EMAIL} directly.
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
