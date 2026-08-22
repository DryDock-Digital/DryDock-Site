import { BOOKING_URL } from '../constants'
import { track } from '../lib/analytics'
import { useOnceInView } from '../hooks/useGaugeAndCounter'

/**
 * Inline Google Calendar appointment-scheduling embed.
 *
 * Google's scheduling page is just an iframe — no external script needed.
 *
 * Replace BOOKING_URL in src/constants.ts with your real schedule link.
 */
export function CalendlyEmbed() {
  // Fire an analytics event the first time the booking widget enters view —
  // gives us the "saw the booking widget" denominator for the booking funnel.
  const viewRef = useOnceInView(() => track('calendly_viewed'), 0.3)

  const isPlaceholder = BOOKING_URL.includes('YOUR-')

  return (
    <div
      className="booking-card reveal calendly-card"
      ref={viewRef as React.RefObject<HTMLDivElement>}
    >
      <h3>1. Book your free intro call</h3>
      <p className="bk-sub">
        Grab any open slot. 20 minutes, no slides, no sales pitch. We talk through your app and
        figure out whether the audit&rsquo;s a fit. Zero commitment, nothing charged.
      </p>

      {isPlaceholder ? (
        // Honest placeholder until BOOKING_URL is set.
        <div className="cal-placeholder">
          <p className="mono">Booking URL not yet configured.</p>
          <p>
            Paste your full Google Calendar appointment schedule link into{' '}
            <code>BOOKING_URL</code> in <code>src/constants.ts</code> and the embed will appear
            here.
          </p>
        </div>
      ) : (
        <iframe
          className="calendly-inline-widget"
          src={BOOKING_URL}
          style={{ minWidth: 320, border: 0 }}
          width="100%"
          height={680}
          frameBorder={0}
        />
      )}

      <div className="cal-note">
        <span className="tz">All times shown in your local timezone</span>
        <span>Free intro call · the $750 audit is invoiced only if we agree it&rsquo;s a fit</span>
      </div>
    </div>
  )
}
