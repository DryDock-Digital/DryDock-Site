import { useEffect } from 'react'
import { BlogIndex } from './components/blog/BlogIndex'
import { BlogPost } from './components/blog/BlogPost'
import { BuildFAQ } from './components/shipyard/BuildFAQ'
import { BuildHero } from './components/shipyard/BuildHero'
import { BuildPricing } from './components/shipyard/BuildPricing'
import { BuildProblem } from './components/shipyard/BuildProblem'
import { BuildProcess } from './components/shipyard/BuildProcess'
import { BuildScope } from './components/shipyard/BuildScope'
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
import { usePageInteractions } from './hooks/usePageInteractions'
import { navigate, useRoute } from './lib/router'
import { useServicePath } from './lib/servicePath'

const LANDING_TITLE = 'Drydock | Bring an app. Or an idea. We make it real.'
const LANDING_DESC =
  'Senior React + Supabase engineers. Two paths: we audit and fix your AI-built app ($750 production-readiness audit in 3 days), or we build your idea from scratch to the same production bar.'

export default function App() {
  const { path } = useRoute()
  const { path: servicePath } = useServicePath()

  // Wire up scroll-progress, scroll reveal, html.anim toggle. Re-runs per
  // route AND per selected service path, because each mounts a fresh tree
  // of .reveal elements.
  usePageInteractions(`${path}:${servicePath}`)

  // Reset meta to the landing defaults when we leave a sub-route.
  useEffect(() => {
    if (path === '/') {
      document.title = LANDING_TITLE
      setMeta('description', LANDING_DESC)
    }
  }, [path])

  // ----- Route table -----

  if (path === '/triage') {
    return <Triage onBack={() => navigate('/')} />
  }

  if (path === '/blog') {
    return (
      <>
        <SiteHeader />
        <BlogIndex />
        <Footer />
      </>
    )
  }

  // /blog/<slug>
  if (path.startsWith('/blog/')) {
    const slug = path.slice('/blog/'.length).replace(/\/$/, '')
    return (
      <>
        <SiteHeader />
        <BlogPost slug={slug} />
        <Footer />
      </>
    )
  }

  // Default — landing page
  return (
    <>
      <SiteHeader />
      <main id="top">
        {/* Each path brings its OWN hero, which carries the path switcher
            in the right half of its split. The booking CTA (#book /
            FinalCTA) is shared by both paths. */}
        {servicePath === 'refit' ? (
          <div role="tabpanel" id="panel-refit" aria-labelledby="tab-refit">
            <Hero />
            <Problem />
            {/* Emergency strip surfaced HIGH on the page, right after the Problem
                section (per the design's final iteration — not buried near the FAQ). */}
            <Emergency />
            <WhatWeDo />
            {/* The interactive centerpiece. */}
            <SampleReport />
            <WhyDrydock />
            <SocialProof />
            <Pricing />
            <HowItWorks />
            <FAQ />
          </div>
        ) : (
          <div role="tabpanel" id="panel-build" aria-labelledby="tab-build">
            <BuildHero />
            <BuildProblem />
            <BuildScope />
            <BuildProcess />
            <BuildPricing />
            <BuildFAQ />
          </div>
        )}
        <FinalCTA />
      </main>
      <Footer />
    </>
  )
}

function setMeta(name: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('name', name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}
