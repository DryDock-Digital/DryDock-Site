import { useEffect, useState, type MouseEvent, type AnchorHTMLAttributes, type ReactNode } from 'react'

/**
 * Tiny zero-dep client-side router. Just enough to route between:
 *   /                              → landing
 *   /blog                          → blog index
 *   /blog/<slug>                   → blog post
 *   /triage                        → emergency triage view
 *
 * Pairs with a Vercel SPA rewrite so any unknown path serves index.html
 * and lets this router decide what to render.
 */

/** Programmatic navigation — components can import and call this directly. */
export function navigate(to: string) {
  if (typeof window === 'undefined') return
  // External / hash-only links → let the browser handle normally
  if (to.startsWith('http') || to.startsWith('mailto:') || to.startsWith('tel:')) {
    window.location.href = to
    return
  }
  const current = window.location.pathname + window.location.hash
  if (to === current) return

  // Split into path + hash so we can scroll to in-page anchors after route swap
  const [pathPart, hashPart] = to.split('#')
  const targetPath = pathPart || window.location.pathname
  const targetHash = hashPart ? `#${hashPart}` : ''

  window.history.pushState(null, '', targetPath + targetHash)
  // Notify subscribers (useRoute) — pushState doesn't fire popstate on its own.
  window.dispatchEvent(new PopStateEvent('popstate'))

  // Scroll: anchor jump if there's a hash, otherwise top of page.
  requestAnimationFrame(() => {
    if (targetHash) {
      const el = document.getElementById(targetHash.slice(1))
      if (el) el.scrollIntoView({ behavior: 'instant' as ScrollBehavior, block: 'start' })
      else window.scrollTo(0, 0)
    } else {
      window.scrollTo(0, 0)
    }
  })
}

/** Subscribe to the current pathname. Use at the top of the app to pick a view. */
export function useRoute(): { path: string } {
  const [path, setPath] = useState<string>(() =>
    typeof window !== 'undefined' ? window.location.pathname : '/',
  )

  useEffect(() => {
    function onPop() {
      setPath(window.location.pathname)
    }
    window.addEventListener('popstate', onPop)

    // Backward compat: a legacy `#triage` hash from earlier deploys → /triage
    if (
      window.location.hash === '#triage' &&
      window.location.pathname !== '/triage'
    ) {
      window.history.replaceState(null, '', '/triage')
      setPath('/triage')
    }

    return () => window.removeEventListener('popstate', onPop)
  }, [])

  return { path }
}

/**
 * Internal client-side navigation link. Renders an <a> with the right href
 * (so it looks/copies/right-clicks like a real link) and intercepts clicks
 * so the router takes over.
 *
 * Use a plain <a> for external links or jumping to in-page anchors within
 * the current route.
 */
export function Link({
  to,
  children,
  className,
  onClick: userOnClick,
  ...rest
}: {
  to: string
  children: ReactNode
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'onClick'> & {
    onClick?: (e: MouseEvent<HTMLAnchorElement>) => void
  }) {
  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    if (userOnClick) userOnClick(e)
    if (e.defaultPrevented) return
    // Let modifier-clicks (cmd/ctrl-click for new tab, etc.) work as normal
    if (e.button !== 0) return
    if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) return
    e.preventDefault()
    navigate(to)
  }
  return (
    <a href={to} onClick={handleClick} className={className} {...rest}>
      {children}
    </a>
  )
}
