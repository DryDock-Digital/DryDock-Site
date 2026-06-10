import { CONTACT_EMAIL } from '../constants'
import { track } from '../lib/analytics'
import { Link } from '../lib/router'
import { Logo } from './Logo'

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Link to="/" className="logo" aria-label="Drydock — home">
              <Logo variant="footer" size={32} />
              <span className="logo-word">Drydock</span>
            </Link>
            <p className="blurb">
              Senior engineers who take Lovable, Bolt, v0, and Cursor apps from fragile prototype
              to production-grade.
            </p>
            <div className="badges" aria-label="Partner badges">
              <span className="b">Lovable Expert · soon</span>
              <span className="b">Supabase Partner · soon</span>
            </div>
          </div>
          <div>
            <h4>Service</h4>
            <ul>
              <li><Link to="/#what-we-do">The audit</Link></li>
              <li><Link to="/#pricing">Pricing</Link></li>
              <li><Link to="/#how">How it works</Link></li>
            </ul>
          </div>
          <div>
            <h4>Resources</h4>
            <ul>
              <li><Link to="/#report">Sample report</Link></li>
              <li><Link to="/blog">Blog</Link></li>
              <li><Link to="/#faq">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <ul>
              <li>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  onClick={() => track('external_email_clicked', { location: 'footer' })}
                >
                  {CONTACT_EMAIL}
                </a>
              </li>
              <li>
                <Link
                  to="/#book"
                  onClick={() => track('cta_book_clicked', { location: 'footer' })}
                >
                  Book your audit
                </Link>
              </li>
              <li>
                <Link
                  to="/triage"
                  onClick={() => track('triage_opened', { source: 'footer' })}
                >
                  Emergency triage
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Drydock. drydock.digital</p>
          <p className="mono">React + Supabase production specialists</p>
        </div>
      </div>
    </footer>
  )
}
