import { track } from '../lib/analytics'
import { Link, useRoute } from '../lib/router'
import { useServicePath } from '../lib/servicePath'
import { Logo } from './Logo'

export function SiteHeader() {
  const { path } = useRoute()
  const { path: servicePath } = useServicePath()
  const onLanding = path === '/'

  // Nav anchors point at the landing page sections OF THE ACTIVE SERVICE
  // PATH (Refit vs Shipyard), so every visible link resolves to a mounted
  // section. When the visitor is already on /, those resolve as simple
  // in-page hashes (no route swap). When the visitor is on /blog or
  // /blog/<slug>, the Link component pushes them back to / and scrolls to
  // the section — the landing panel matches the persisted path, so the
  // anchors still resolve.
  //
  // Before a path is chosen no panel is mounted, so there are no sections
  // to link to: the nav is just the blog.
  const sections =
    servicePath === null
      ? [{ to: '/blog', label: 'Blog' }]
      : servicePath === 'build'
      ? [
          { to: '/#build-problem', label: 'Problem' },
          { to: '/#build-scope', label: 'What you get' },
          { to: '/#how', label: 'Process' },
          { to: '/#pricing', label: 'Pricing' },
          { to: '/blog', label: 'Blog' },
          { to: '/#faq', label: 'FAQ' },
        ]
      : [
          { to: '/#problem', label: 'Problem' },
          { to: '/#what-we-do', label: 'What we do' },
          { to: '/#report', label: 'Sample report' },
          { to: '/#pricing', label: 'Pricing' },
          { to: '/blog', label: 'Blog' },
          { to: '/#faq', label: 'FAQ' },
        ]

  return (
    <header className="site-header">
      <div className="container">
        <Link to="/" className="logo" aria-label="Drydock, home">
          <Logo />
          <span className="logo-word">Drydock</span>
        </Link>
        <nav className="header-nav" aria-label="Primary">
          {sections.map((item) =>
            // Blog is a real route — keep it as a router link. The hash-anchor
            // items can be plain <a> when we're already on /, since the browser
            // handles the scroll natively and we save a render cycle.
            item.to === '/blog' || !onLanding ? (
              <Link key={item.label} to={item.to}>
                {item.label}
              </Link>
            ) : (
              <a key={item.label} href={item.to.startsWith('/#') ? item.to.slice(1) : item.to}>
                {item.label}
              </a>
            ),
          )}
        </nav>
        <div>
          <Link
            to="/#book"
            className="btn btn-primary btn-sm"
            onClick={() => track('cta_book_clicked', { location: 'header' })}
          >
            Book a call
          </Link>
        </div>
      </div>
      <div className="scroll-progress" id="scrollProgress" />
    </header>
  )
}
