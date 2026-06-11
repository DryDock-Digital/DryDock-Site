import { useEffect, useMemo, useRef } from 'react'
import { CALENDLY_URL } from '../constants'
import { track } from '../lib/analytics'
import { useOnceInView } from '../hooks/useGaugeAndCounter'

const CALENDLY_SCRIPT_SRC = 'https://assets.calendly.com/assets/external/widget.js'

/**
 * Inline Calendly embed, themed to the Linen palette.
 *
 * Uses Calendly's official widget.js (no new npm dep) — loads the script
 * once per page, then mounts a `.calendly-inline-widget` div which Calendly
 * fills with its iframe.
 *
 * Replace CALENDLY_URL in src/constants.ts with your real event link.
 */
export function CalendlyEmbed() {
  const containerRef = useRef<HTMLDivElement>(null)
  // Fire an analytics event the first time the booking widget enters view —
  // gives us the "saw the Calendly" denominator for the booking funnel.
  const viewRef = useOnceInView(() => track('calendly_viewed'), 0.3)

  // Build the widget URL with theme params matching Linen.
  // Calendly accepts colors WITHOUT the `#` prefix.
  const widgetUrl = useMemo(() => {
    const params = new URLSearchParams({
      hide_event_type_details: '1',
      hide_gdpr_banner: '1',
      primary_color: 'BC6038', // --teal (clay)
      text_color: '2C241B', // --ink
      background_color: 'FCF8F1', // --bg-2
    })
    const sep = CALENDLY_URL.includes('?') ? '&' : '?'
    return `${CALENDLY_URL}${sep}${params.toString()}`
  }, [])

  useEffect(() => {
    // Inject Calendly's script exactly once. Idempotent across remounts.
    let script = document.querySelector<HTMLScriptElement>(
      `script[src="${CALENDLY_SCRIPT_SRC}"]`,
    )
    if (!script) {
      script = document.createElement('script')
      script.src = CALENDLY_SCRIPT_SRC
      script.async = true
      document.body.appendChild(script)
    }
  }, [])

  const isPlaceholder = CALENDLY_URL.includes('YOUR-CALENDLY-HANDLE')

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
        // Honest placeholder until CALENDLY_URL is set.
        <div className="cal-placeholder">
          <p className="mono">Calendly URL not yet configured.</p>
          <p>
            Paste your full Calendly event link into{' '}
            <code>CALENDLY_URL</code> in <code>src/constants.ts</code> and the embed will appear
            here.
          </p>
        </div>
      ) : (
        <div
          ref={containerRef}
          className="calendly-inline-widget"
          data-url={widgetUrl}
          style={{ minWidth: 320, height: 680 }}
        />
      )}

      <div className="cal-note">
        <span className="tz">All times shown in your local timezone</span>
        <span>Free intro call · the $750 audit is invoiced only if we agree it&rsquo;s a fit</span>
      </div>
    </div>
  )
}
