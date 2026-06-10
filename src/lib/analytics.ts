import { track as vercelTrack } from '@vercel/analytics'

/**
 * Site-wide analytics helper. Wraps Vercel Web Analytics so:
 *   - Event names are typed (no silent typos)
 *   - We can swap the analytics provider in one place if needed
 *   - The team has one place to see every event we fire
 *
 * Pageviews (including SPA route changes via pushState) are auto-tracked by
 * the <Analytics /> component mounted in src/main.tsx. The events below are
 * for actions that pageviews don't cover — conversions, intent signals.
 *
 * Enable in the Vercel dashboard: Project → Analytics → Enable Web Analytics.
 */

export type AnalyticsEvent =
  // CTA clicks — `location` tells us which button on which surface
  | 'cta_book_clicked'
  // Booking widget signals
  | 'calendly_viewed'
  // Lead form
  | 'lead_form_submitted'
  // Emergency triage flow
  | 'triage_opened'
  | 'triage_form_submitted'
  // Content engagement
  | 'sample_report_viewed'
  | 'external_email_clicked'
  // Outbound to the free exposure scanner (lead-magnet tool at scan.drydock.digital)
  | 'scanner_opened'
  // Blog reader engagement — pageviews handle "they arrived",
  // these answer "did they actually read it and how far"
  | 'blog_post_opened'
  | 'blog_post_read'
  | 'blog_post_completed'

type EventProps = Record<string, string | number | boolean | null>

export function track(event: AnalyticsEvent, props?: EventProps): void {
  // Vercel's `track` is no-op in dev and on hosts without analytics enabled,
  // so calling it is safe in every environment.
  vercelTrack(event, props)
}
