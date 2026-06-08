import { CONTACT_EMAIL } from '../constants'

type SubmitOpts = {
  /** The Formspree (or similar) endpoint to POST to. */
  endpoint: string
  /** Subject line for the mailto fallback (and a hint to your inbox). */
  subject?: string
  /** Override the mailto recipient (defaults to CONTACT_EMAIL). */
  to?: string
}

/**
 * Submit a form to its configured endpoint — OR, if the endpoint is still a
 * placeholder, open the user's email client with a pre-filled message to
 * CONTACT_EMAIL.
 *
 * Each form on the site passes its OWN endpoint (lead form vs. triage form),
 * so submissions land in dedicated Formspree streams.
 *
 * Resolves once the submission has been dispatched (HTTP POST succeeded, or
 * the mailto URL has been opened). Throws on HTTP failure.
 */
export async function submitForm(
  data: Record<string, FormDataEntryValue>,
  opts: SubmitOpts,
): Promise<{ via: 'http' | 'mailto' }> {
  const to = opts.to || CONTACT_EMAIL

  // No real endpoint configured → fall back to mailto so comms still land.
  if (!opts.endpoint || opts.endpoint.includes('PLACEHOLDER')) {
    const body = Object.entries(data)
      .map(([k, v]) => `${formatLabel(k)}: ${String(v)}`)
      .join('\n\n')
    const subject = encodeURIComponent(opts.subject || 'Drydock — audit inquiry')
    const encodedBody = encodeURIComponent(
      body + '\n\n—\nSent from drydock.digital',
    )
    window.location.href = `mailto:${to}?subject=${subject}&body=${encodedBody}`
    return { via: 'mailto' }
  }

  // Real endpoint → JSON POST.
  // Formspree picks up `_subject` as the email subject line, so the inbox
  // shows urgency / form type at a glance.
  const payload: Record<string, unknown> = { ...data }
  if (opts.subject) payload._subject = opts.subject

  const res = await fetch(opts.endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    // Surface Formspree's error body so 422s aren't silent. The body is
    // usually JSON like { errors: [{ field, code, message }] } — we stringify
    // it for the thrown error so it lands in the console and in the form UI.
    let detail = ''
    try {
      const text = await res.text()
      try {
        const parsed = JSON.parse(text)
        if (parsed?.errors?.length) {
          detail = parsed.errors
            .map((e: { field?: string; message?: string; code?: string }) =>
              [e.field, e.code, e.message].filter(Boolean).join(' · '),
            )
            .join(' | ')
        } else if (parsed?.error) {
          detail = String(parsed.error)
        } else {
          detail = text
        }
      } catch {
        detail = text
      }
    } catch {
      /* ignore */
    }
    // Log to the console for debugging — the UI shows a friendlier line.
    // eslint-disable-next-line no-console
    console.error('[submitForm] Formspree error', {
      status: res.status,
      detail,
      endpoint: opts.endpoint,
    })
    throw new Error(`HTTP ${res.status}${detail ? ` — ${detail}` : ''}`)
  }
  return { via: 'http' }
}

/** Pretty-print a form field name for the mailto body (e.g. `repo_url` → `Repo url`). */
function formatLabel(key: string): string {
  const cleaned = key.replace(/[-_]+/g, ' ').trim()
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
}
