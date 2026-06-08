import { FormEvent, useState } from 'react'
import { CONTACT_EMAIL, LEAD_FORM_ENDPOINT } from '../constants'
import { submitForm } from '../lib/submitForm'

type Status = 'idle' | 'submitting' | 'success' | 'error'

export function LeadForm() {
  const [status, setStatus] = useState<Status>('idle')
  const [via, setVia] = useState<'http' | 'mailto' | null>(null)
  const [errMsg, setErrMsg] = useState<string | null>(null)
  const isPlaceholder =
    !LEAD_FORM_ENDPOINT || LEAD_FORM_ENDPOINT.includes('PLACEHOLDER')

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const name = (form.elements.namedItem('lf-name') as HTMLInputElement).value.trim()
    const email = (form.elements.namedItem('lf-email') as HTMLInputElement).value.trim()
    if (!name || !email) {
      const which = !name ? 'lf-name' : 'lf-email'
      ;(form.elements.namedItem(which) as HTMLInputElement).focus()
      return
    }
    setStatus('submitting')
    setErrMsg(null)

    const data = Object.fromEntries(new FormData(form).entries())
    try {
      const result = await submitForm(data, {
        endpoint: LEAD_FORM_ENDPOINT,
        subject: `Drydock lead — ${name}`,
      })
      setVia(result.via)
      setStatus('success')
      form.reset()
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : 'Unknown error')
      setStatus('error')
    }
  }

  return (
    <div className="booking-card reveal">
      <h3>2 — Or tell us about your app first</h3>
      <p className="bk-sub">
        Prefer email? We&rsquo;ll reply within one business day at {CONTACT_EMAIL} and set up a
        call from there.
      </p>
      <form onSubmit={onSubmit} noValidate>
        <div className="field">
          <label htmlFor="lf-name">Your name</label>
          <input id="lf-name" name="name" type="text" placeholder="Alex Rivera" required />
        </div>
        <div className="field">
          <label htmlFor="lf-email">Email</label>
          <input id="lf-email" name="email" type="email" placeholder="you@startup.com" required />
        </div>
        <div className="field">
          <label htmlFor="lf-stack">Built with</label>
          <select id="lf-stack" name="stack" defaultValue="Lovable">
            <option>Lovable</option>
            <option>Bolt</option>
            <option>v0</option>
            <option>Cursor</option>
            <option>Replit</option>
            <option>Not sure</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="lf-about">What does your app do?</label>
          <textarea
            id="lf-about"
            name="description"
            placeholder="A booking tool for indie yoga studios…"
          />
        </div>
        <button
          type="submit"
          className="btn btn-teal btn-full"
          style={{ marginTop: 18 }}
          disabled={status === 'submitting'}
        >
          {status === 'submitting'
            ? 'Sending…'
            : status === 'success'
              ? 'Request received ✓'
              : isPlaceholder
                ? `Email ${CONTACT_EMAIL}`
                : 'Request my audit'}
        </button>
        <div className={`form-ok ${status === 'success' ? 'show' : ''}`}>
          {via === 'mailto'
            ? `Your email client should now be open with the message drafted. Hit send — it goes to ${CONTACT_EMAIL}, and we'll reply within one business day.`
            : `Thanks — we'll be in touch within one business day at ${CONTACT_EMAIL}.`}
        </div>
        {status === 'error' && (
          <div
            className="form-ok show"
            style={{
              background: 'rgba(242,114,127,.1)',
              borderColor: 'rgba(242,114,127,.32)',
              color: '#b23a48',
            }}
          >
            Couldn&rsquo;t send. Email us directly at {CONTACT_EMAIL}.
            {errMsg && (
              <div
                style={{
                  marginTop: 8,
                  fontFamily: 'var(--mono)',
                  fontSize: 11,
                  opacity: 0.75,
                }}
              >
                {errMsg}
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  )
}
