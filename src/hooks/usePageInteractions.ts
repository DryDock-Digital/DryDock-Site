import { useEffect, useState } from 'react'

/**
 * Page-level effects ported from drydock.js:
 *  - toggles `html.anim` so reveal transitions only fire on real viewing
 *  - scroll-progress bar fill
 *  - `.reveal` → `.reveal.in` on scroll, with a failsafe that snaps
 *     everything visible if the compositor stalls (mirrors the design's
 *     defensive pattern for low-power / backgrounded tabs)
 */
export function usePageInteractions() {
  useEffect(() => {
    const root = document.documentElement
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const instant = reduceMotion || document.visibilityState === 'hidden'

    if (!instant) root.classList.add('anim')

    // ---- Scroll-progress bar (1px gradient under the sticky header) ----
    const progress = document.getElementById('scrollProgress')
    function onScroll() {
      const h = document.documentElement
      const scrolled = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight)
      if (progress) progress.style.width = (scrolled * 100).toFixed(2) + '%'
    }

    // ---- Scroll reveal ----
    const vh = () => window.innerHeight || document.documentElement.clientHeight
    function topInView(el: Element, frac = 0.92) {
      const r = el.getBoundingClientRect()
      if (r.height === 0 && r.width === 0) return false
      return r.top < vh() * frac && r.bottom > 0
    }

    function checkReveals() {
      document.querySelectorAll<HTMLElement>('.reveal:not(.in)').forEach((el) => {
        if (topInView(el)) el.classList.add('in')
      })
    }

    // Stagger reveal delays per section so groups cascade in
    document.querySelectorAll('section, footer').forEach((sec) => {
      sec.querySelectorAll<HTMLElement>('.reveal').forEach((el, i) => {
        el.style.transitionDelay = Math.min(i * 60, 360) + 'ms'
      })
    })

    function failsafe() {
      // Snap any remaining reveals visible regardless of transition state.
      document.querySelectorAll<HTMLElement>('.reveal:not(.in)').forEach((el) => {
        el.style.transition = 'none'
        el.classList.add('in')
        el.style.opacity = '1'
        el.style.transform = 'none'
      })
    }

    document.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('scroll', checkReveals, { passive: true })
    window.addEventListener('resize', checkReveals)

    onScroll()

    let t1: number | undefined
    let t2: number | undefined
    if (instant) {
      failsafe()
    } else {
      requestAnimationFrame(() => {
        checkReveals()
        requestAnimationFrame(checkReveals)
      })
      window.addEventListener('load', checkReveals)
      t1 = window.setTimeout(checkReveals, 300)
      t2 = window.setTimeout(failsafe, 1800)
    }

    return () => {
      document.removeEventListener('scroll', onScroll)
      document.removeEventListener('scroll', checkReveals)
      window.removeEventListener('resize', checkReveals)
      window.removeEventListener('load', checkReveals)
      if (t1) window.clearTimeout(t1)
      if (t2) window.clearTimeout(t2)
    }
  }, [])
}

/**
 * Hash-based "view" router for the dedicated emergency triage screen.
 * `#triage` shows the triage view; anything else shows the landing page.
 * Mirrors the design's `body.view-triage` toggle.
 */
export function useTriageRoute(): {
  isTriage: boolean
  open: () => void
  close: () => void
} {
  const initial = typeof window !== 'undefined' && window.location.hash === '#triage'
  const [isTriage, setIsTriage] = useState(initial)

  useEffect(() => {
    function onHash() {
      setIsTriage(window.location.hash === '#triage')
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  function open() {
    if (window.location.hash !== '#triage') {
      window.history.pushState(null, '', '#triage')
    }
    setIsTriage(true)
    window.scrollTo(0, 0)
  }
  function close() {
    if (window.location.hash) {
      window.history.pushState(null, '', window.location.pathname + window.location.search)
    }
    setIsTriage(false)
    window.scrollTo(0, 0)
  }

  return { isTriage, open, close }
}
