// Centralized integration endpoints / URLs. Swap each when ready.

// Calendly inline embed URL — the full event link from your Calendly dashboard.
// Theme params for Linen are appended automatically in CalendlyEmbed.tsx.
//
// The Calendly event represents the FREE 20-min intro call — there is no
// upfront payment. The $750 audit is invoiced manually after the call, only
// if both sides agree it's a fit.
export const CALENDLY_URL = 'https://calendly.com/hello-drydock/30min'

// Formspree endpoints. Each form has its own so submissions arrive in
// dedicated threads, with their own subject prefixes / inbox rules.
//
// While either is left as 'PLACEHOLDER', submitForm() falls back to opening
// a pre-filled mailto:CONTACT_EMAIL instead of POSTing — so the form still
// reaches you with zero backend setup.
export const LEAD_FORM_ENDPOINT = 'https://formspree.io/f/xbdeyrzk'
export const TRIAGE_FORM_ENDPOINT = 'https://formspree.io/f/xjgdrbaa'

// Public download link for the sample audit report PDF (drop the file in /public).
export const SAMPLE_REPORT_URL = '/sample-audit-report.pdf'

// Single email for ALL comms — leads, triage, footer, mailto fallbacks.
export const CONTACT_EMAIL = 'hello@drydock.digital'

// Convenience alias used by the emergency triage flow. Same inbox — the
// "URGENT" prefix in the subject is what surfaces priority.
export const EMERGENCY_EMAIL = CONTACT_EMAIL

// The in-page anchor every "book" CTA points at — drops the visitor onto
// the Calendly embed at the bottom of the page. No automatic payments.
export const BOOK_HREF = '#book'
