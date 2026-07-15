import { useRef, type KeyboardEvent } from 'react'
import { useServicePath, type ServicePath } from '../lib/servicePath'

/**
 * The two-path switcher directly under the shared hero. Two big tab cards
 * (proper ARIA tablist) that swap the rest of the landing page between the
 * Refit path (audit / harden / finish an existing app) and the Shipyard
 * path (ground-up builds).
 */
type TabDef = {
  id: ServicePath
  kicker: string
  title: string
  desc: string
  meta: string
}

const TABS: TabDef[] = [
  {
    id: 'refit',
    kicker: 'Path 01 · Refit',
    title: 'Finish what you built',
    desc: 'You got 80% there with Lovable, Bolt, v0, or Cursor. We audit it, secure it, and take it the last 20% to production.',
    meta: '$750 audit · report in 3 business days',
  },
  {
    id: 'build',
    kicker: 'Path 02 · Shipyard',
    title: 'Build it from scratch',
    desc: 'You bring the idea. A senior crew builds it keel-up to the same production bar our audits enforce. No 80% trap.',
    meta: 'Fixed-price proposal after a free discovery call',
  },
]

export function PathTabs() {
  const { path, select } = useServicePath()
  const sectionRef = useRef<HTMLElement>(null)
  const tabRefs = useRef<Partial<Record<ServicePath, HTMLButtonElement | null>>>({})

  function onSelect(next: ServicePath) {
    select(next, { source: 'tabs' })
    // If the visitor was scrolled down into the old panel, bring the tabs
    // back into view so the content swap isn't disorienting. 68px = sticky
    // header height.
    const el = sectionRef.current
    if (el && el.getBoundingClientRect().top < 68) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Standard tablist keyboard behavior: arrow keys move + activate.
  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
    e.preventDefault()
    const next: ServicePath = path === 'refit' ? 'build' : 'refit'
    onSelect(next)
    tabRefs.current[next]?.focus()
  }

  return (
    <section className="paths" id="paths" ref={sectionRef} aria-label="Choose your path">
      <div className="container">
        <p className="eyebrow center reveal">Two ways into the dock</p>
        <div className="path-tabs reveal" role="tablist" aria-label="Service paths">
          {TABS.map((t) => {
            const selected = path === t.id
            return (
              <button
                key={t.id}
                ref={(node) => {
                  tabRefs.current[t.id] = node
                }}
                type="button"
                role="tab"
                id={`tab-${t.id}`}
                aria-selected={selected}
                aria-controls={`panel-${t.id}`}
                tabIndex={selected ? 0 : -1}
                className="path-tab"
                onClick={() => onSelect(t.id)}
                onKeyDown={onKeyDown}
              >
                <span className="kicker">{t.kicker}</span>
                <span className="title">{t.title}</span>
                <span className="desc">{t.desc}</span>
                <span className="meta">{t.meta}</span>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
