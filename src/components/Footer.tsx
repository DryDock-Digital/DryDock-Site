import { Logo } from './Logo'
import { CONTACT_EMAIL } from '../constants'

type Props = { onTriage: () => void }

export function Footer({ onTriage }: Props) {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <a className="logo" href="#top" aria-label="Drydock — home">
              <Logo variant="footer" size={32} />
              <span className="logo-word">Drydock</span>
            </a>
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
              <li><a href="#what-we-do">The audit</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="#how">How it works</a></li>
            </ul>
          </div>
          <div>
            <h4>Proof</h4>
            <ul>
              <li><a href="#report">Sample report</a></li>
              <li><a href="#faq">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <ul>
              <li><a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></li>
              <li><a href="#book">Book your audit</a></li>
              <li>
                <a
                  href="#triage"
                  onClick={(e) => {
                    e.preventDefault()
                    onTriage()
                  }}
                >
                  Emergency triage
                </a>
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
