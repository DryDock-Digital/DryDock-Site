import { Emergency } from './components/Emergency'
import { FAQ } from './components/FAQ'
import { FinalCTA } from './components/FinalCTA'
import { Footer } from './components/Footer'
import { Hero } from './components/Hero'
import { HowItWorks } from './components/HowItWorks'
import { Pricing } from './components/Pricing'
import { Problem } from './components/Problem'
import { SampleReport } from './components/SampleReport'
import { SiteHeader } from './components/SiteHeader'
import { SocialProof } from './components/SocialProof'
import { Triage } from './components/Triage'
import { WhatWeDo } from './components/WhatWeDo'
import { WhyDrydock } from './components/WhyDrydock'
import { usePageInteractions, useTriageRoute } from './hooks/usePageInteractions'

export default function App() {
  // Wire up scroll-progress, scroll reveal, and the html.anim toggle.
  usePageInteractions()
  // Hash-based "view" router for the dedicated triage screen.
  const triage = useTriageRoute()

  if (triage.isTriage) {
    return <Triage onBack={triage.close} />
  }

  return (
    <>
      <SiteHeader />
      <main id="top">
        <Hero />
        <Problem />
        {/* Emergency strip surfaced HIGH on the page, right after the Problem section
            (per the design's final iteration — not buried near the FAQ). */}
        <Emergency onTriage={triage.open} />
        <WhatWeDo />
        {/* The interactive centerpiece. */}
        <SampleReport />
        <WhyDrydock />
        <SocialProof />
        <Pricing />
        <HowItWorks />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer onTriage={triage.open} />
    </>
  )
}
