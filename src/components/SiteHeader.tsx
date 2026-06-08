import { Logo } from './Logo'

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container">
        <a className="logo" href="#top" aria-label="Drydock — home">
          <Logo />
          <span className="logo-word">Drydock</span>
        </a>
        <nav className="header-nav" aria-label="Primary">
          <a href="#problem">Problem</a>
          <a href="#what-we-do">What we do</a>
          <a href="#report">Sample report</a>
          <a href="#pricing">Pricing</a>
          <a href="#faq">FAQ</a>
        </nav>
        <div>
          <a href="#book" className="btn btn-primary btn-sm">
            Book a call
          </a>
        </div>
      </div>
      <div className="scroll-progress" id="scrollProgress" />
    </header>
  )
}
