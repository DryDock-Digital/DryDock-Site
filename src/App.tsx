import { useEffect } from 'react'
import { BlogIndex } from './components/blog/BlogIndex'
import { BlogPost } from './components/blog/BlogPost'
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

const LANDING_TITLE = 'Drydock | You built it with AI. We make it real.'
const LANDING_DESC =
  'Senior React + Supabase engineers who audit and fix AI-built apps. A $750 production-readiness audit in 3 days. Secured, hardened, and ready for real users.'

export default function App() {
  // Wire up scroll-progress, scroll reveal, html.anim toggle (re-runs per route
  // because each route mounts a fresh tree of .reveal elements).
  usePageInteractions()

  const { path } = useRoute()

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
        <Hero />
        <Problem />
        {/* Emergency strip surfaced HIGH on the page, right after the Problem section
            (per the design's final iteration — not buried near the FAQ). */}
        <Emergency />
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
