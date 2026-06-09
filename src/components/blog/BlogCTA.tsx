import type { ReactNode } from 'react'
import { navigate } from '../../lib/router'

type Props = {
  /** Eyebrow text above the heading. Defaults to "Production-Readiness Audit". */
  eyebrow?: string
  /** The CTA heading — the post-specific hook. */
  heading: string
  /** Body paragraphs between heading and the button row. */
  children: ReactNode
  /** Mono tagline shown beside the button. */
  micro: string
  /** Optional secondary block under the CTA row (e.g. emergency triage line). */
  footer?: ReactNode
}

/**
 * End-of-post conversion block, shared across blog posts. Each post passes
 * its own copy so the close-out reads like part of the post, not boilerplate.
 * The button always drops the reader on the booking section (/#book).
 */
export function BlogCTA({
  eyebrow = 'Production-Readiness Audit',
  heading,
  children,
  micro,
  footer,
}: Props) {
  return (
    <aside className="blog-cta">
      <div className="blog-cta-inner">
        <p className="eyebrow teal">{eyebrow}</p>
        <h2>{heading}</h2>
        {children}
        <div className="blog-cta-row">
          <a
            href="/#book"
            className="btn btn-teal"
            onClick={(e) => {
              e.preventDefault()
              navigate('/#book')
            }}
          >
            Book your audit →
          </a>
          <p className="blog-cta-micro">{micro}</p>
        </div>
        {footer && <div className="blog-cta-footer">{footer}</div>}
      </div>
    </aside>
  )
}
